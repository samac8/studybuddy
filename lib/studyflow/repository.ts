import { emptyCandidate, type Course, type SavedAssignment, type WorkspaceData } from './models.ts';

const STORAGE_KEY = 'studybuddy.workspace.v1';

export function loadWorkspace(storage: Storage | undefined = typeof window === 'undefined' ? undefined : window.localStorage): WorkspaceData {
  if (!storage) return { courses: [], assignments: [], events: [], customEventTypes: [] };
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}');
    const assignments = Array.isArray(parsed.assignments) ? parsed.assignments.map((item: Partial<SavedAssignment>) => ({ ...emptyCandidate(item.courseId ?? '', item.source ?? 'manual'), ...item, miniTasks: Array.isArray(item.miniTasks) ? item.miniTasks : [] })) : [];
    return { courses: Array.isArray(parsed.courses) ? parsed.courses.map((course: Course) => ({ ...course, classTimes: Array.isArray(course.classTimes) ? course.classTimes : [] })) : [], assignments, events: Array.isArray(parsed.events) ? parsed.events : [], customEventTypes: Array.isArray(parsed.customEventTypes) ? parsed.customEventTypes : [] };
  } catch { return { courses: [], assignments: [], events: [], customEventTypes: [] }; }
}

export function saveWorkspace(data: WorkspaceData, storage: Storage | undefined = typeof window === 'undefined' ? undefined : window.localStorage) {
  storage?.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function upsertCourse(data: WorkspaceData, course: Course, assignments: SavedAssignment[]) {
  return {
    courses: [...data.courses.filter(item => item.id !== course.id), course],
    assignments: [...data.assignments.filter(item => item.courseId !== course.id), ...assignments],
    events: data.events,
    customEventTypes: data.customEventTypes,
  };
}

export function updateAssignment(data: WorkspaceData, assignment: SavedAssignment): WorkspaceData {
  return { ...data, assignments: data.assignments.map(item => item.id === assignment.id ? assignment : item) };
}

export function deleteAssignment(data: WorkspaceData, assignmentId: string): WorkspaceData {
  return { ...data, assignments: data.assignments.filter(item => item.id !== assignmentId) };
}

export function updateCourse(data: WorkspaceData, course: Course): WorkspaceData {
  return { ...data, courses: data.courses.map(item => item.id === course.id ? course : item) };
}
