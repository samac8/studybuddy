import type { AssignmentCandidate, AssignmentType } from './models.ts';
import { assignmentTypes, emptyCandidate } from './models.ts';

const months = ['january','february','march','april','may','june','july','august','september','october','november','december'];
const monthWords = '(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan\\.?|Feb\\.?|Mar\\.?|Apr\\.?|May|Jun\\.?|Jul\\.?|Aug\\.?|Sep\\.?|Sept\\.?|Oct\\.?|Nov\\.?|Dec\\.?)';
const datePattern = new RegExp(`(?:\\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)(?:day|esday|rsday|urday|day)?,?\\s+)?${monthWords}\\s+\\d{1,2}(?:,?\\s+\\d{4})?|\\b\\d{1,2}\\/\\d{1,2}(?:\\/\\d{2,4})?|\\b\\d{4}-\\d{1,2}-\\d{1,2}`, 'i');
const timePattern = /(?:at|by|due\s+by|due\s+at)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b|\b(\d{1,2}):(\d{2})\s*(am|pm)?\b/i;
const weightPattern = /(?:worth|weight\s*:\s*)?(\d{1,3}(?:\.\d+)?)\s*(%|percent)(?!\w)/i;
const assignmentWords = /\b(homework|hw|assignment|problem\s*set|pset|quiz|exam|midterm|final(?:\s+exam)?|project|essay|paper|lab|reading|discussion|presentation|reflection)\b/i;
const deadlineWords = /\b(due|deadline|submit(?:ted)?\s+by|closes|available\s+until|exam\s+on|scheduled\s+for)\b/i;

function isoDate(year: number, month: number, day: number) { const date = new Date(year, month - 1, day); return Number.isNaN(date.getTime()) || date.getMonth() !== month - 1 || date.getDate() !== day ? '' : `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }
function parseDate(value: string, startDate: string, endDate: string) {
  const cleaned = value.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s+/i, '').replace(/\./g, '').trim();
  const numericIso = cleaned.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/); const numeric = cleaned.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/); let month = 0, day = 0, year = 0;
  if (numericIso) { year = Number(numericIso[1]); month = Number(numericIso[2]); day = Number(numericIso[3]); } else if (numeric) { month = Number(numeric[1]); day = Number(numeric[2]); year = numeric[3] ? Number(numeric[3].length === 2 ? `20${numeric[3]}` : numeric[3]) : 0; } else { const named = cleaned.match(/^([A-Za-z]+)\s+(\d{1,2})(?:,?\s+(\d{4}))?$/); if (named) { const prefix = named[1].replace('.', '').toLowerCase().slice(0, 3); month = months.findIndex(name => name.slice(0, 3) === prefix) + 1; day = Number(named[2]); year = named[3] ? Number(named[3]) : 0; } }
  if (!month || !day) return { date: '', ambiguous: true }; const start = new Date(`${startDate}T00:00:00`); const end = new Date(`${endDate}T00:00:00`);
  if (!year) { const possibleYears = [...new Set([start.getFullYear() - 1, start.getFullYear(), end.getFullYear(), end.getFullYear() + 1])].filter(candidate => { const date = isoDate(candidate, month, day); return date && date >= startDate && date <= endDate; }); if (possibleYears.length !== 1) return { date: '', ambiguous: true }; year = possibleYears[0]; }
  const date = isoDate(year, month, day); return { date, ambiguous: !date || date < startDate || date > endDate };
}
function toTime(match: RegExpMatchArray | null) { if (!match) return ''; const hourText = match[1] ?? match[4]; const minuteText = match[2] ?? match[5]; const meridiem = match[3] ?? match[6]; let hour = Number(hourText); if (meridiem?.toLowerCase() === 'pm' && hour < 12) hour += 12; if (meridiem?.toLowerCase() === 'am' && hour === 12) hour = 0; return `${String(hour).padStart(2, '0')}:${minuteText}`; }
function inferType(title: string): AssignmentType { const normalized = title.toLowerCase().replace(/[._-]/g, ' '); if (/\bhw\b/.test(normalized)) return 'Homework'; if (/problem\s*set|\bpset\b/.test(normalized)) return 'Problem Set'; return assignmentTypes.find(type => new RegExp(`\\b${type.replace(' ', '\\s+')}\\b`, 'i').test(title)) ?? 'Other'; }
function normalizeText(text: string) {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .split('\n')
    .map(line => line.replace(/[•●▪◦]/g, '').replace(/^\s*(?:[-*+]|\d+[.)])\s+/, '').replace(/\|/g, '\t').replace(/[ ]{2,}/g, ' ').replace(/\t+/g, '\t').trim())
    .filter(Boolean);
}
export function splitSyllabusText(text: string) { return normalizeText(text); }
function dateMatches(line: string) { return [...line.matchAll(new RegExp(datePattern.source, 'gi'))].map(match => match[0]); }
function cleanTitle(line: string, dateText: string, weightText: string) { return line.replace(dateText, '').replace(weightText, '').replace(/\b(?:due|deadline|submit(?:ted)?\s+by|closes|available\s+until|exam\s+on|scheduled\s+for|at|by|on|worth|weight)\b/gi, '').replace(/^[-–—:#\s\d.)]+/, '').replace(/[-–—:#]+/g, ' ').replace(/[\t,;|]+/g, ' ').replace(/\s+/g, ' ').trim(); }
function hasOnlyContextDate(line: string) { return /\b(office\s*hours?|holiday|no class|class meeting|lecture|quarter|term|midterm break|finals? week|contact|email|phone)\b/i.test(line) && !assignmentWords.test(line); }

export function extractCandidates(text: string, courseId: string, startDate: string, endDate: string): AssignmentCandidate[] {
  const lines = splitSyllabusText(text); const candidates: AssignmentCandidate[] = []; let section = '';
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]; const nextLine = lines[index + 1] ?? '';
    if (isHeading(line)) { section = line.toLowerCase(); continue; }
    if (excludedSection(section)) continue;
    if (/^(assignments?|course\s+schedule|important\s+dates|date|week|item|deadline)\b/i.test(line) && !datePattern.test(line)) continue;
    if (hasOnlyContextDate(line)) continue;
    const lineDates = dateMatches(line); const followingDate = !lineDates.length && datePattern.test(nextLine) ? dateMatches(nextLine)[0] : '';
    const assignmentSignal = assignmentWords.test(line) || deadlineWords.test(line) || Boolean(line.match(/\t/)) || Boolean(line.match(/\b(?:due|date)\b/i));
    if (!assignmentSignal || (!lineDates.length && !followingDate)) continue;
    const nearbyLines = [line, nextLine, lines[index + 2] ?? ''];
    const combined = nearbyLines.join(' ');
    const dueContext = lineDates.length ? line : combined;
    const dueText = dueContext.match(new RegExp(`(?:due|deadline|submit(?:ted)?\\s+by|closes|available\\s+until|exam\\s+on|scheduled\\s+for)[^\\n]*?(${datePattern.source})`, 'i'))?.[1] ?? lineDates.at(-1) ?? followingDate;
    const parsed = parseDate(dueText, startDate, endDate); const time = toTime(combined.match(timePattern)); const weightMatch = combined.match(weightPattern);
    const releaseMatch = line.match(new RegExp(`(?:released?|available|opens?)\\s+(?:on\\s+)?(${datePattern.source})`, 'i')); const release = releaseMatch ? parseDate(releaseMatch[1], startDate, endDate) : { date: '', ambiguous: false };
    const sourceLine = nearbyLines.slice(0, followingDate ? 2 : 1).join(' | '); const candidate = emptyCandidate(courseId, 'syllabus'); candidate.id = `parsed-${index}-${Date.now()}`; candidate.rawText = sourceLine; candidate.sourceLine = sourceLine; candidate.sourceLineNumber = index + 1; candidate.title = cleanTitle(line, lineDates.at(-1) ?? dueText, weightMatch?.[0] ?? '') || `Assignment ${index + 1}`; candidate.type = inferType(candidate.title); candidate.releaseDate = release.date; candidate.dueDate = parsed.date; candidate.dueTime = time; candidate.weight = weightMatch ? Number(weightMatch[1]) : ''; candidate.confidence = deadlineWords.test(combined) && assignmentWords.test(candidate.title) ? 'high' : 'review'; candidate.ambiguityFlags = [...(parsed.ambiguous ? ['Review the due date; the year, date, or term may be ambiguous.'] : []), ...(release.ambiguous ? ['Review the release date; the year or date may be ambiguous.'] : [])]; candidate.validationIssues = validateCandidate(candidate, startDate, endDate); candidates.push(candidate); if (followingDate) index += 1;
  }
  return candidates;
}
function isHeading(line: string) { return line.length < 65 && (/^[A-Z][A-Z\s&/-]+$/.test(line) || /:$/.test(line) || /^(\d+[.)]|[IVX]+[.)])\s+[A-Z]/.test(line)); }
function excludedSection(section: string) { return /instructor|contact|office hours|course description|learning objectives|required materials|textbook|academic integrity|accessibility|accommodation|attendance policy|late work|university polic|student resources|emergency|policy/.test(section); }
export type SyllabusAnalysis = { candidates: AssignmentCandidate[]; ignoredCount: number; ignoredExamples: { line: string; reason: string }[]; reviewCount: number; readyCount: number };
export function analyzeSyllabus(text: string, courseId: string, startDate: string, endDate: string): SyllabusAnalysis { const candidates = extractCandidates(text, courseId, startDate, endDate); const lines = splitSyllabusText(text); const ignored = lines.filter(line => !candidates.some(candidate => candidate.sourceLine.includes(line)) && dateMatches(line).length && (hasOnlyContextDate(line) || /holiday|withdrawal|registration|policy|office hours|class meets/i.test(line))); return { candidates, ignoredCount: ignored.length, ignoredExamples: ignored.slice(0, 4).map(line => ({ line, reason: /office hours/i.test(line) ? 'Office hours' : /policy/i.test(line) ? 'Policy section' : 'Non-assignment date' })), reviewCount: candidates.filter(candidate => candidate.confidence === 'review' || candidate.ambiguityFlags.length).length, readyCount: candidates.filter(candidate => candidate.confidence === 'high' && !candidate.ambiguityFlags.length).length }; }
export function validateCandidate(candidate: AssignmentCandidate, startDate: string, endDate: string) { const issues: string[] = []; if (!candidate.title.trim()) issues.push('Add an assignment title.'); if (!candidate.dueDate) issues.push('Add a due date.'); if (!candidate.dueTime) issues.push('Add a due time.'); if (candidate.estimatedMinutes === '' || candidate.estimatedMinutes <= 0) issues.push('Add estimated total time.'); if (!candidate.energy) issues.push('Choose an energy level.'); if (candidate.dueDate && (candidate.dueDate < startDate || candidate.dueDate > endDate)) issues.push('Due date is outside the course term.'); if (candidate.weight !== '' && (candidate.weight < 0 || candidate.weight > 100)) issues.push('Course Grade Weight must be between 0% and 100%.'); return issues; }
export function possibleDuplicate(a: AssignmentCandidate, b: AssignmentCandidate) { const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, ''); return Boolean(a.dueDate && b.dueDate && a.dueDate === b.dueDate && normalize(a.title) === normalize(b.title)); }
export function duplicateIds(candidates: AssignmentCandidate[]) { const ids = new Set<string>(); candidates.forEach((candidate, index) => candidates.slice(index + 1).forEach(other => { if (possibleDuplicate(candidate, other)) { ids.add(candidate.id); ids.add(other.id); } })); return ids; }
