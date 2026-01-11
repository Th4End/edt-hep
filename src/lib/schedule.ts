// src/lib/schedule.ts

import { Day, Course } from "@/types/schedule";
import axios from "axios";

/**
 * Parses the HTML content of a day's schedule to extract courses.
 * @param html The HTML string to parse.
 * @returns An array of Course objects.
 */
export const parseHtmlDay = (html: string): Course[] => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const courses: Course[] = [];
  doc.querySelectorAll(".Ligne").forEach((ligne) => {
    const start = (ligne.querySelector(".Debut")?.textContent || "").trim();
    const end = (ligne.querySelector(".Fin")?.textContent || "").trim();
    const subject = (ligne.querySelector(".Matiere")?.textContent || "").trim();
    const roomRaw = (ligne.querySelector(".Salle")?.textContent || "").trim();
    const teacherRaw = (ligne.querySelector(".Prof")?.textContent || "").trim();

    const room = roomRaw || "";
    const teacher = teacherRaw || "";

    if (start && end && subject) {
      courses.push({
        start,
        end,
        subject,
        room,
        teacher,
        color: { background: "", text: "" }, // Color will be assigned later
        source: "EDT",
      });
    }
  });

  return courses;
};

/**
 * Fetches the schedule HTML for a given user and a specific date from the Wigor service.
 * @param username The user's identifier (e.g., 'firstname.lastname').
 * @param date The date in 'YYYY-MM-DD' format.
 * @returns A single Day object with the raw HTML content.
 */
export const fetchDaySchedule = async (
  username: string,
  date: string,
  useProxy: boolean = false, // Default to false for server-side usage
): Promise<Day> => {
  const daysOfWeek = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const dateObj = new Date(date);
  const utcDate = new Date(dateObj.getTime() + dateObj.getTimezoneOffset() * 60000);
  const dayName = daysOfWeek[utcDate.getDay()];

  if (useProxy) {
    // Client-side execution using corsproxy.io as it was originally
    const targetUrl = `https://edtmobiliteng.wigorservices.net/WebPsDyn.aspx?Action=posETUD&serverid=C&tel=${encodeURIComponent(username)}&date=${encodeURIComponent(date)}%208:00`;
    const url = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    try {
      const { data } = await axios.get<string>(url);
      return { day: dayName, date, rawHtml: data, courses: [] };
    } catch (error) {
      console.error(`[PROXY] Failed to fetch schedule for ${username} on ${date}:`, error);
      return { day: dayName, date, rawHtml: '', courses: [] };
    }
  } else {
    // Server-side execution calling the service directly
    const targetUrl = `https://edtmobiliteng.wigorservices.net/WebPsDyn.aspx?Action=posETUD&serverid=C&tel=${encodeURIComponent(username)}&date=${encodeURIComponent(date)}%208:00`;
     try {
      const resp = await fetch(targetUrl, {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; EdtHep-iCal-Generator/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });
      if (!resp.ok) throw new Error(`Upstream error: ${resp.status}`);
      const html = await resp.text();
      return { day: dayName, date, rawHtml: html, courses: [] };
    } catch (error) {
      console.error(`[DIRECT] Failed to fetch schedule for ${username} on ${date}:`, error);
      return { day: dayName, date, rawHtml: '', courses: [] };
    }
  }
};

/**
 * Generates an array of date strings for a given number of weeks from a start date.
 * @param numWeeks The number of weeks to generate dates for.
 * @param startDate The starting date.
 * @returns An array of date strings in 'YYYY-MM-DD' format.
 */
export const getDatesForWeeks = (numWeeks: number, startDate: Date = new Date()): string[] => {
    const dates: string[] = [];
    const currentDate = new Date(startDate);

    for (let i = 0; i < numWeeks * 7; i++) {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
    }

    return dates;
};
