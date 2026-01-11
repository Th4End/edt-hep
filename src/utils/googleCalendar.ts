// src/utils/googleCalendar.ts

export const getGoogleCalendarUrl = (username: string): string | null => {
  const calendars = JSON.parse(localStorage.getItem('googleCalendars') || '{}');
  return calendars[username] || null;
};

export const saveGoogleCalendarUrl = (username: string, url: string) => {
  const calendars = JSON.parse(localStorage.getItem('googleCalendars') || '{}');
  calendars[username] = url;
  localStorage.setItem('googleCalendars', JSON.stringify(calendars));
};
