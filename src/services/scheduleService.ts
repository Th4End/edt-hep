import { COLORS } from "@/constants/schedule";
import { Course, Day } from "@/types/schedule";
import axios from "axios";
import ICAL from "ical.js";
import { fetchDaySchedule, parseHtmlDay } from "@/lib/schedule"; // Use the shared function

export const isStringDotString = (input: string): boolean => {
  const regex = /^[a-zA-Z]+\.[a-zA-Z]+\d*$/;
  return regex.test(input);
};

const assignColors = (schedule: Day[]): Day[] => {
  const subjectColors = new Map<string, { background: string; text: string }>();
  let colorIndex = 0;

  schedule.forEach((day) => {
    day.courses?.forEach((course) => {
      if (!subjectColors.has(course.subject)) {
        subjectColors.set(course.subject, COLORS[colorIndex % COLORS.length]);
        colorIndex++;
      }
      course.color = subjectColors.get(course.subject)!;
    });
  });

  return schedule;
};

// New helper to get the dates for the week based on an offset
const getWeekDays = (weekOffset: number = 0): string[] => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);

    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);

    const weekDays: string[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        weekDays.push(d.toISOString().split("T")[0]);
    }
    return weekDays;
}

export const fetchSchedule = async (
  username: string,
  dateInput?: string | null
): Promise<Day[]> => {
  if (!isStringDotString(username)) return [];

  const weekOffset = dateInput ? parseInt(dateInput, 10) : 0;
  const weekDays = getWeekDays(weekOffset);

  const dayPromises = await Promise.all(
    weekDays.map(date => fetchDaySchedule(username, date, true)) // Use proxy
  );

  const schedule = dayPromises.map(day => ({
      ...day,
      courses: parseHtmlDay(day.rawHtml || ''),
  }));

  return assignColors(schedule.filter(day => day.courses && day.courses.length > 0));
};

// --- Functions for custom iCal sources (unchanged) ---

const dayOfWeekMap: { [key: number]: string } = {
    1: "Lundi", 2: "Mardi", 3: "Mercredi", 4: "Jeudi", 5: "Vendredi", 6: "Samedi", 0: "Dimanche",
};

const parseICalData = (icalData: string, weekOffset: number, sourceName: string): Day[] => {
    const jcalData = ICAL.parse(icalData);
    const vcalendar = new ICAL.Component(jcalData);
    const vevents = vcalendar.getAllSubcomponents("vevent");

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const coursesByDay: { [key: string]: Course[] } = {};

    vevents.forEach((vevent: ICAL.Component) => {
        const event = new ICAL.Event(vevent);
        const dtstart = event.startDate.toJSDate();

        if (dtstart >= weekStart && dtstart < weekEnd) {
            const dayOfWeek = dtstart.getDay();
            const dayName = dayOfWeekMap[dayOfWeek];
            if (!coursesByDay[dayName]) coursesByDay[dayName] = [];
            coursesByDay[dayName].push({
                start: event.startDate.toJSDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                end: event.endDate.toJSDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
                subject: event.summary,
                room: event.location || "",
                teacher: "",
                color: { background: "", text: "" },
                source: sourceName,
            });
        }
    });
    
    // This part needs revision to correctly map dates
    const schedule: Day[] = Object.values(dayOfWeekMap).map(dayName => ({
        day: dayName,
        date: "", // Date calculation would be complex here, needs improvement if used
        courses: coursesByDay[dayName] || []
    }));

    return schedule;
};


export const fetchCustomSchedule = async (
    icalUrl: string,
    weekOffset: number,
    sourceName: string
): Promise<Day[]> => {
    const url = `https://corsproxy.io/?${encodeURIComponent(icalUrl)}`;
    try {
        const { data } = await axios.get<string>(url);
        const schedule = parseICalData(data, weekOffset, sourceName);
        return assignColors(schedule);
    } catch (error) {
        console.error("Error fetching or parsing iCal data:", error);
        return [];
    }
};

export const getUniqueSources = (schedule: Day[]): string[] => {
  const sources = new Set<string>();
  schedule.forEach((day) => day.courses?.forEach((course) => course.source && sources.add(course.source)));
  return Array.from(sources);
};

export const getUniqueSubjects = (schedule: Day[]): string[] => {
  const subjects = new Set<string>();
  schedule.forEach((day) => day.courses?.forEach((course) => subjects.add(course.subject)));
  return Array.from(subjects);
};
