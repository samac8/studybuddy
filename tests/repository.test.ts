import test from 'node:test';
import assert from 'node:assert/strict';
import { loadWorkspace, saveWorkspace, upsertCourse } from '../lib/studyflow/repository.ts';
import { emptyCandidate } from '../lib/studyflow/models.ts';

void test('saves and reloads courses and approved assignments', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } as unknown as Storage;
  const course = { id: 'course-1', name: 'Writing', code: 'WRT 101', color: '#5c59c9', startDate: '2026-09-28', endDate: '2026-12-11', classTimes: [] };
  const row = { ...emptyCandidate(course.id), title: 'Essay', dueDate: '2026-10-05', estimatedMinutes: 60, energy: 'Medium' as const, reviewStatus: 'approved' as const };
  const saved = upsertCourse({ courses: [], assignments: [], events: [], customEventTypes: [] }, course, [row]);
  saveWorkspace(saved, storage);
  assert.deepEqual(loadWorkspace(storage), saved);
});
