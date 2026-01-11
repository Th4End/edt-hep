import type { VercelRequest, VercelResponse } from "@vercel/node";
import ICAL from "ical.js";
import { parse } from "node-html-parser";
import type { Course } from "../../src/types/schedule";
import crypto from 'crypto';

// --- Logic copied from the frontend ---

const isStringDotString = (input: string): boolean => {
  const regex = /^[a-zA-Z]+\.[a-zA-Z]+\d*$/;
  return regex.test(input);
};

const getDatesForWeeks = (numWeeks: number, startDate: Date = new Date()): string[] => {
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    for (let i = 0; i < numWeeks * 7; i++) {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
};

const parseHtmlDayNode = (html: string): Course[] => {
  const doc = parse(html);
  const courses: Course[] = [];
  doc.querySelectorAll(".Ligne").forEach((ligne) => {
    const start = (ligne.querySelector(".Debut")?.text || "").trim();
    const end = (ligne.querySelector(".Fin")?.text || "").trim();
    const subject = (ligne.querySelector(".Matiere")?.text || "").trim();
    const roomRaw = (ligne.querySelector(".Salle")?.text || "").trim();
    const teacherRaw = (ligne.querySelector(".Prof")?.text || "").trim();

    if (start && end && subject) {
      courses.push({
        start, end, subject,
        room: roomRaw || "",
        teacher: teacherRaw || "",
        color: { background: "", text: "" },
        source: "EDT",
      });
    }
  });
  return courses;
};

const fetchDayHtml = async (username: string, date: string): Promise<string> => {
    const url = `https://edtmobiliteng.wigorservices.net/WebPsDyn.aspx?Action=posETUD&serverid=C&tel=${encodeURIComponent(username)}&date=${encodeURIComponent(date)}%208:00`;
    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; EdtHep-iCal-Generator/1.0)" }
      });
      if (!resp.ok) return '';
      return await resp.text();
    } catch {
      return '';
    }
};

const createStableUID = (course: Course, date: string, user: string): string => {
  const hash = crypto.createHash('md5');
  hash.update(`${user}|${date}|${course.start}|${course.subject}|${course.room}`);
  return hash.digest('hex');
};


// --- API Handler ---

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { user } = req.query;

  if (typeof user !== "string" || !isStringDotString(user)) {
    return res.status(400).json({ error: "Invalid 'user' parameter. Expected 'firstname.lastname'." });
  }

  try {
    const datesToFetch = getDatesForWeeks(8, new Date());
    const htmlPromises = datesToFetch.map(date => fetchDayHtml(user, date));
    const htmlResults = await Promise.all(htmlPromises);

    const coursesByDate = htmlResults.map((html, i) => ({
        date: datesToFetch[i],
        courses: parseHtmlDayNode(html),
    }));

    const cal = new ICAL.Component(["vcalendar"]);
    cal.addPropertyWithValue("prodid", "-//Edt-Hep//Schedule//FR");
    cal.addPropertyWithValue("version", "2.0");
    cal.addPropertyWithValue("calscale", "GREGORIAN");
    cal.addPropertyWithValue("name", `Emploi du temps pour ${user}`);
    cal.addPropertyWithValue("x-wr-calname", `Emploi du temps pour ${user}`);

    coursesByDate.forEach(day => {
      if (!day.courses.length || !day.date) return;
      day.courses.forEach(course => {
        try {
            const [startHour, startMinute] = course.start.split(':').map(Number);
            const [endHour, endMinute] = course.end.split(':').map(Number);
            const startDate = new Date(day.date);
            startDate.setUTCHours(startHour, startMinute, 0, 0);
            const endDate = new Date(day.date);
            endDate.setUTCHours(endHour, endMinute, 0, 0);

            const event = new ICAL.Event(cal);
            event.summary = course.subject;
            event.startDate = ICAL.Time.fromJSDate(startDate, true);
            event.endDate = ICAL.Time.fromJSDate(endDate, true);
            if (course.room) event.location = course.room;
            if (course.teacher) event.description = `Prof: ${course.teacher}`;
            event.uid = createStableUID(course, day.date, user);
            cal.addSubcomponent(event);
        } catch {}
      });
    });

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="schedule-${user}.ics"`);
    res.status(200).send(cal.toString());

  } catch (error) {
    console.error(`[ICAL_GENERATION_ERROR] for user ${user}:`, error);
    res.status(500).json({ error: "Failed to generate iCal file." });
  }
}