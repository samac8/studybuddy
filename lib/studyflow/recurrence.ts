import { addDays, sameDay } from './calendar.ts';
import type { CalendarEvent, ClassTime } from './models';

function timeValue(value: string) { const [hour, minute] = value.split(':').map(Number); return hour * 60 + minute; }
export function overlaps(startA: string, endA: string, startB: string, endB: string) { return timeValue(startA) < timeValue(endB) && timeValue(startB) < timeValue(endA); }
export function classOccurrences(classTime: ClassTime, from: Date, to: Date) {
  const result: { id: string; title: string; date: Date; hour: number; duration: number; courseId: string; kind: 'Class' }[] = [];
  for (let date = new Date(from); date <= to; date = addDays(date, 1)) {
    if (!classTime.weekdays.includes(date.getDay())) continue;
    const iso = date.toISOString().slice(0, 10);
    if (iso < classTime.startDate || iso > classTime.endDate) continue;
    const week = Math.floor((date.getTime() - new Date(classTime.startDate).getTime()) / 604800000);
    if (classTime.recurrence === 'biweekly' && week % 2) continue;
    const start = timeValue(classTime.startTime); const end = timeValue(classTime.endTime);
    result.push({ id: `${classTime.id}-${iso}`, title: classTime.label, date: new Date(date), hour: start / 60, duration: (end - start) / 60, courseId: classTime.courseId, kind: 'Class' });
  }
  return result;
}
export function eventOccurrences(event: CalendarEvent, from: Date, to: Date) {
  const result: CalendarEvent[] = []; const start = new Date(`${event.date}T00:00:00`); const endDate = event.recurrenceEnd ? new Date(`${event.recurrenceEnd}T00:00:00`) : to;
  for (let date = new Date(start); date <= to && date <= endDate; date = addDays(date, 1)) {
    const days = Math.floor((date.getTime() - start.getTime()) / 86400000);
    if (date < from || (event.recurrence === 'weekly' && days % 7 !== 0) || (event.recurrence === 'biweekly' && days % 14 !== 0)) continue;
    result.push({ ...event, id: `${event.id}-${date.toISOString().slice(0, 10)}`, date: date.toISOString().slice(0, 10) });
    if (event.recurrence === 'none') break;
  }
  return result;
}
export function dateOverlapsEvent(date: Date, event: CalendarEvent) { return sameDay(new Date(`${event.date}T00:00:00`), date); }
