import type { VercelRequest, VercelResponse } from "@vercel/node";
import ICAL from "ical.js";
import { parse } from "node-html-parser";
import crypto from 'crypto';

// --- Interfaces ---

interface Course {
  start: string;
  end: string;
  subject: string;
  room: string;
  teacher: string;
  date: string; // Ajouté pour simplifier la création d'UID
}

// --- Helpers ---

const isStringDotString = (input: string): boolean => {
  // Accepte format: prenom.nom ou prenom.nom123
  return /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/.test(input);
};

const getDatesForWeeks = (numWeeks: number): string[] => {
  const dates: string[] = [];
  const currentDate = new Date();
  
  // On commence au début de la semaine courante pour être sûr d'avoir le contexte
  const dayOfWeek = currentDate.getDay(); // 0 (Dim) - 6 (Sam)
  const diff = currentDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Ajuster au Lundi
  currentDate.setDate(diff);

  for (let i = 0; i < numWeeks * 7; i++) {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const parseHtmlDayNode = (html: string, date: string): Course[] => {
  if (!html) return [];
  const doc = parse(html);
  const courses: Course[] = [];
  
  doc.querySelectorAll(".Ligne").forEach((ligne) => {
    // Nettoyage des données
    const cleanText = (selector: string) => (ligne.querySelector(selector)?.text || "").replace(/&nbsp;/g, " ").trim();
    
    const start = cleanText(".Debut");
    const end = cleanText(".Fin");
    const subject = cleanText(".Matiere");
    const room = cleanText(".Salle");
    const teacher = cleanText(".Prof");

    // Validation basique : format H:MM
    if (start.includes(':') && end.includes(':') && subject) {
      courses.push({
        start, 
        end, 
        subject,
        room,
        teacher,
        date
      });
    }
  });
  return courses;
};

const fetchDayHtml = async (username: string, date: string): Promise<string> => {
  // L'URL semble nécessiter une date au format spécifique ou standard
  // Note: encodeURIComponent est vital ici.
  const url = `https://edtmobiliteng.wigorservices.net/WebPsDyn.aspx?Action=posETUD&serverid=C&tel=${encodeURIComponent(username)}&date=${encodeURIComponent(date)}%208:00`;
  
  try {
    const resp = await fetch(url, {
      headers: { 
        "User-Agent": "Mozilla/5.0 (compatible; EdtHep-iCal-Generator/1.0)",
        "Cache-Control": "no-cache"
      }
    });
    if (!resp.ok) return '';
    return await resp.text();
  } catch (e) {
    console.error(`Error fetching ${date}:`, e);
    return '';
  }
};

const createStableUID = (course: Course, user: string): string => {
  // UID stable pour éviter les doublons lors des mises à jour du calendrier
  const hash = crypto.createHash('sha256');
  hash.update(`${user}|${course.date}|${course.start}|${course.subject}`);
  return hash.digest('hex') + "@edt-hep.vercel.app";
};

// --- API Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { user } = req.query;

  if (typeof user !== "string" || !isStringDotString(user)) {
    return res.status(400).json({ error: "Paramètre 'user' invalide. Format attendu: prenom.nom" });
  }

  try {
    // 1. Récupération des dates (Réduit à 4 semaines pour performance Vercel, ou garder 8 si rapide)
    const datesToFetch = getDatesForWeeks(8);
    
    // 2. Fetch en parallèle
    const htmlPromises = datesToFetch.map(date => fetchDayHtml(user, date));
    const htmlResults = await Promise.all(htmlPromises);

    // 3. Parsing
    const courses = htmlResults.flatMap((html, i) => parseHtmlDayNode(html, datesToFetch[i]));

    // 4. Création iCal
    const cal = new ICAL.Component("vcalendar");
    cal.updatePropertyWithValue("prodid", "-//Edt-Hep//Schedule//FR");
    cal.updatePropertyWithValue("version", "2.0");
    cal.updatePropertyWithValue("calscale", "GREGORIAN");
    cal.updatePropertyWithValue("name", `EDT ${user}`);
    cal.updatePropertyWithValue("x-wr-calname", `EDT ${user}`);
    cal.updatePropertyWithValue("refresh-interval", "PT5M");
    cal.updatePropertyWithValue("x-published-ttl", "PT5M");

    courses.forEach(course => {
      try {
        // Création de l'événement
        const vevent = new ICAL.Component("vevent");
        const event = new ICAL.Event(vevent);
        const [year, month, day] = course.date.split('-').map(Number);
        const [startHour, startMinute] = course.start.split(':').map(Number);
        const [endHour, endMinute] = course.end.split(':').map(Number);

        event.summary = course.subject;
        event.startDate = ICAL.Time.fromData({
            year: year,
            month: month,
            day: day,
            hour: startHour,
            minute: startMinute,
            second: 0
        });
        event.endDate = ICAL.Time.fromData({
            year: year,
            month: month,
            day: day,
            hour: endHour,
            minute: endMinute,
            second: 0
        });
        
        if (course.room) event.location = course.room;
        if (course.teacher) event.description = `Enseignant: ${course.teacher}`;
        if (course.room) event.description = `${event.description ? event.description + '\n' : ''}Salle: ${course.room}`;
        
        event.uid = createStableUID(course, user);
        
        // CORRECTION MAJEURE ICI : on ajoute le sous-composant, pas l'objet event wrapper
        cal.addSubcomponent(vevent);

      } catch (e) {
        console.error(`[ICAL_EVENT_ERROR] Erreur sur cours:`, course, e);
      }
    });

    // 5. Réponse
    const icsContent = cal.toString();
    
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="edt-${user}.ics"`);
    // Cache Vercel CDN pour 1 heure (3600s), le client revalide après
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=600");
    
    res.status(200).send(icsContent);

  } catch (error: any) {
    console.error(`[ICAL_GENERATION_ERROR] User: ${user}`, error);
    res.status(500).json({ 
        error: "Erreur lors de la génération du calendrier.",
        details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}