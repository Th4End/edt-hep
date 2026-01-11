import type { VercelRequest, VercelResponse } from "@vercel/node";
import ICAL from "ical.js";
import { getDatesForWeeks, fetchDaySchedule } from "@/lib/schedule";
import { Course } from "@/types/schedule";
import crypto from 'crypto';
import { parse } from "node-html-parser";

// Basic validation for username
const isStringDotString = (input: string): boolean => {
  const regex = /^[a-zA-Z]+\.[a-zA-Z]+\d*$/;
  return regex.test(input);
};

// Server-side parsing function using node-html-parser
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


// Function to create a stable UID for a course to avoid duplicates
const createStableUID = (course: Course, date: string, user: string): string => {
  const hash = crypto.createHash('md5');
  const data = `${user}|${date}|${course.start}|${course.subject}|${course.room}`;
  hash.update(data);
  return hash.digest('hex');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user } = req.query;

  if (typeof user !== "string" || !isStringDotString(user)) {
    return res.status(400).json({ error: "Invalid 'user' parameter. Expected 'firstname.lastname'." });
  }

  try {
    // 1. Fetch schedule data for the next 8 weeks
    const today = new Date();
    const datesToFetch = getDatesForWeeks(8, today);
    const schedulePromises = datesToFetch.map(async (date) => {
        const day = await fetchDaySchedule(user, date, false); // Fetching for server-side, no proxy
        return { ...day, courses: parseHtmlDayNode(day.rawHtml || '') }; // Parse HTML here
    });
    const dailySchedules = await Promise.all(schedulePromises);

    // 2. Create an iCal component
    const cal = new ICAL.Component(["vcalendar"]);
    cal.addPropertyWithValue("prodid", "-//Edt-Hep//Schedule//FR");
    cal.addPropertyWithValue("version", "2.0");
    cal.addPropertyWithValue("calscale", "GREGORIAN");
    cal.addPropertyWithValue("name", `Emploi du temps pour ${user}`);
    cal.addPropertyWithValue("x-wr-calname", `Emploi du temps pour ${user}`);
    cal.addPropertyWithValue("description", `EDT pour ${user} généré par Edt-Hep.`);
    cal.addPropertyWithValue("x-wr-caldesc", `EDT pour ${user} généré par Edt-Hep.`);

    // 3. Add events to the calendar
    dailySchedules.forEach(day => {
      if (!day.courses.length) return;

      day.courses.forEach(course => {
        try {
            const [startHour, startMinute] = course.start.split(':').map(Number);
            const [endHour, endMinute] = course.end.split(':').map(Number);

            const startDate = new Date(day.date);
            startDate.setHours(startHour, startMinute, 0, 0);

            const endDate = new Date(day.date);
            endDate.setHours(endHour, endMinute, 0, 0);

            const event = new ICAL.Event(cal);
            event.summary = course.subject;
            event.startDate = ICAL.Time.fromJSDate(startDate, true);
            event.endDate = ICAL.Time.fromJSDate(endDate, true);
            if (course.room) {
                event.location = course.room;
            }
            if (course.teacher) {
                event.description = `Prof: ${course.teacher}`;
            }
            event.uid = createStableUID(course, day.date, user);
            
            cal.addSubcomponent(event);
        } catch (e) {
            console.error(`[ICAL_EVENT_ERROR] for user ${user} - Could not process course:`, course, e);
        }
      });
    });

    // 4. Set headers and send response
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="schedule-${user}.ics"`);
    res.status(200).send(cal.toString());

  } catch (error) {
    console.error(`[ICAL_GENERATION_ERROR] for user ${user}:`, error);
    res.status(500).json({ error: "Failed to generate iCal file." });
  }
}
