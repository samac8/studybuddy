import test from 'node:test';
import assert from 'node:assert/strict';
import { classOccurrences, eventOccurrences, overlaps } from '../lib/studyflow/recurrence.ts';

void test('expands weekly class times only on selected weekdays and term dates', () => {
  const items = classOccurrences({ id: 'class-1', courseId: 'course-1', label: 'Lecture', weekdays: [1, 3, 5], startTime: '10:30', endTime: '11:20', startDate: '2026-09-28', endDate: '2026-10-04', location: '', notes: '', online: false, recurrence: 'weekly' }, new Date('2026-09-28'), new Date('2026-10-10'));
  assert.equal(items.length, 3);
  assert.equal(items[0].hour, 10.5);
});

void test('expands one recurring event without storing copies', () => {
  const items = eventOccurrences({ id: 'event-1', title: 'Study group', type: 'Meeting', date: '2026-09-28', startTime: '15:00', endTime: '16:00', allDay: false, location: '', notes: '', courseId: '', color: '#000000', recurrence: 'weekly', recurrenceEnd: '2026-10-12', hardBlock: true }, new Date('2026-09-28'), new Date('2026-10-20'));
  assert.deepEqual(items.map(item => item.date), ['2026-09-28', '2026-10-05', '2026-10-12']);
});

void test('detects overlapping fixed commitments', () => assert.equal(overlaps('10:30', '11:20', '11:00', '12:00'), true));
