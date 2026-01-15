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
  const today = new Date();
  
  // Start of today, UTC, to prevent timezone offsets
  const startOfToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const dayOfWeek = startOfToday.getUTCDay(); // 0 (Sun) - 6 (Sat)
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
  
  const monday = new Date(startOfToday);
  monday.setUTCDate(startOfToday.getUTCDate() + diff);

  for (let i = 0; i < numWeeks * 7; i++) {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
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

const getParisTimezoneComponent = (): ICAL.Component => {

  const vtimezone = new ICAL.Component('vtimezone');

  vtimezone.addPropertyWithValue('tzid', 'Europe/Paris');

  vtimezone.addPropertyWithValue('x-lic-location', 'Europe/Paris');



  const standard = new ICAL.Component('standard');

  standard.addPropertyWithValue('dtstart', '19701025T030000');

  standard.addPropertyWithValue('rrule', 'FREQ=YEARLY;BYDAY=-1SU;BYMONTH=10');

  standard.addPropertyWithValue('tzoffsetfrom', '+0200');

  standard.addPropertyWithValue('tzoffsetto', '+0100');

  standard.addPropertyWithValue('tzname', 'CET');



  const daylight = new ICAL.Component('daylight');

  daylight.addPropertyWithValue('dtstart', '19700329T020000');

  daylight.addPropertyWithValue('rrule', 'FREQ=YEARLY;BYDAY=-1SU;BYMONTH=3');

  daylight.addPropertyWithValue('tzoffsetfrom', '+0100');

  daylight.addPropertyWithValue('tzoffsetto', '+0200');

  daylight.addPropertyWithValue('tzname', 'CEST');



  vtimezone.addSubcomponent(standard);

  vtimezone.addSubcomponent(daylight);



  return vtimezone;

}



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

    cal.addPropertyWithValue("prodid", "-//Edt-Hep//Schedule//FR");

    cal.addPropertyWithValue("version", "2.0");

    cal.addPropertyWithValue("calscale", "GREGORIAN");

    cal.addPropertyWithValue("name", `EDT ${user}`);

    cal.addPropertyWithValue("x-wr-calname", `EDT ${user}`);

    cal.addPropertyWithValue("refresh-interval", "PT5M");

    cal.addPropertyWithValue("x-published-ttl", "PT5M");



    // Add timezone component

    cal.addSubcomponent(getParisTimezoneComponent());



    courses.forEach(course => {

      try {

        const vevent = new ICAL.Component("vevent");

        vevent.addPropertyWithValue('summary', course.subject);

        vevent.addPropertyWithValue('uid', createStableUID(course, user));



        const startStr = `${course.date.replace(/-/g, '')}T${course.start.replace(/:/g, '')}00`;

        const endStr = `${course.date.replace(/-/g, '')}T${course.end.replace(/:/g, '')}00`;



        const dtstart = vevent.addPropertyWithValue('dtstart', startStr);

        dtstart.setParameter('tzid', 'Europe/Paris');



        const dtend = vevent.addPropertyWithValue('dtend', endStr);

        dtend.setParameter('tzid', 'Europe/Paris');

        

        let description = "";

        if (course.teacher) description += `Enseignant: ${course.teacher}`;

        if (course.room) description += `${description ? '\n' : ''}Salle: ${course.room}`;

        if (description) vevent.addPropertyWithValue('description', description);

        

        if (course.room) vevent.addPropertyWithValue('location', course.room);

        

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

  } catch (error: unknown) {
    console.error(`[ICAL_GENERATION_ERROR] User: ${user}`, error);
    res.status(500).json({ 
        error: "Erreur lors de la génération du calendrier.",
        details: error instanceof Error ? error.message : "Erreur inconnue"
    });
  }
}