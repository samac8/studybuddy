import test from 'node:test';
import assert from 'node:assert/strict';
import { extractCandidates, duplicateIds, validateCandidate } from '../lib/studyflow/parser.ts';
import { emptyCandidate } from '../lib/studyflow/models.ts';

const start = '2026-09-28';
const end = '2026-12-11';
const text = `Homework 1 - October 5 - 5%\nQuiz 2 due 10/14 at 11:59 PM\nMidterm: November 2, worth 20%\nFinal Project due December 8\nReading 4 - Oct. 7`;

void test('extracts titles, types, dates, times, and percentages', () => {
  const rows = extractCandidates(text, 'course-1', start, end);
  assert.equal(rows.length, 5);
  assert.equal(rows[0].title, 'Homework 1');
  assert.equal(rows[0].type, 'Homework');
  assert.equal(rows[0].dueDate, '2026-10-05');
  assert.equal(rows[0].weight, 5);
  assert.equal(rows[1].dueTime, '23:59');
  assert.equal(rows[2].type, 'Midterm');
  assert.equal(rows[4].dueDate, '2026-10-07');
});

void test('extracts a clearly stated release date', () => {
  const row = extractCandidates('Project released October 1 due October 20', 'course-1', start, end)[0];
  assert.equal(row.releaseDate, '2026-10-01');
  assert.equal(row.dueDate, '2026-10-20');
});

void test('flags ambiguous numeric dates and dates outside the term', () => {
  const ambiguous = extractCandidates('Quiz 1 due 10/05', 'course-1', '2026-01-01', '2027-12-31')[0];
  assert.ok(ambiguous.ambiguityFlags.length);
  const outside = extractCandidates('Final due January 5, 2027', 'course-1', start, end)[0];
  assert.ok(outside.validationIssues.some(issue => issue.includes('outside')) || outside.ambiguityFlags.length);
});

void test('handles empty and malformed lines without creating candidates', () => {
  assert.deepEqual(extractCandidates('', 'course-1', start, end), []);
  assert.deepEqual(extractCandidates('Read chapters and study', 'course-1', start, end), []);
});

void test('detects duplicates without removing either row', () => {
  const first = emptyCandidate('course-1');
  const second = { ...first, id: 'second' };
  first.title = second.title = 'Homework 1';
  first.dueDate = second.dueDate = '2026-10-05';
  const ids = duplicateIds([first, second]);
  assert.deepEqual([...ids].sort(), [first.id, second.id].sort());
});

void test('rejects missing required fields and accepts a complete row', () => {
  const row = emptyCandidate('course-1');
  assert.ok(validateCandidate(row, start, end).length >= 4);
  Object.assign(row, { title: 'Homework 1', dueDate: '2026-10-05', dueTime: '23:59', estimatedMinutes: 60, energy: 'Medium' });
  assert.deepEqual(validateCandidate(row, start, end), []);
});

void test('joins multiline, table-like, and nearby deadline data', () => {
  const rows = extractCandidates('Homework 2\nDue Friday, October 16 at 11:59 PM\nWorth 5%\nHW 3 | 10/23 | 11:59pm | 5%', 'course-1', start, end);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].dueDate, '2026-10-16');
  assert.equal(rows[0].dueTime, '23:59');
  assert.equal(rows[0].weight, 5);
  assert.match(rows[0].sourceLine, /Homework 2/);
  assert.equal(rows[1].dueDate, '2026-10-23');
});

void test('does not turn office hours into an assignment', () => {
  assert.deepEqual(extractCandidates('Office Hours: Tuesday, October 20 at 2 PM', 'course-1', start, end), []);
});

void test('supports terms that cross into January', () => {
  const row = extractCandidates('Final Exam due January 8', 'course-1', '2026-11-01', '2027-01-15')[0];
  assert.equal(row.dueDate, '2027-01-08');
});
