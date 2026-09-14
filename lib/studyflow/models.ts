export const assignmentTypes = ['Homework', 'Assignment', 'Problem Set', 'Quiz', 'Exam', 'Midterm', 'Final', 'Project', 'Essay', 'Paper', 'Lab', 'Reading', 'Discussion', 'Presentation', 'Reflection', 'Other'] as const;
export type AssignmentType = (typeof assignmentTypes)[number];
export type EnergyLevel = 'Low' | 'Medium' | 'High';
export type AssignmentSource = 'syllabus' | 'manual';

export type MiniTask = { id: string; title: string; completed: boolean; completedAt?: string };

export type Course = {
  id: string;
  code: string;
  name: string;
  color: string;
  startDate: string;
  endDate: string;
  sample?: boolean;
  short?: string;
  classTimes?: ClassTime[];
};

export type ClassTime = { id: string; courseId: string; label: string; weekdays: number[]; startTime: string; endTime: string; startDate: string; endDate: string; location: string; notes: string; online: boolean; recurrence: 'weekly' | 'biweekly' };
export type CalendarEventType = 'Class' | 'Meeting' | 'Study' | 'Work' | 'Commute' | 'Appointment' | 'Personal' | 'Club' | 'Exercise' | 'Event' | 'Personal Commitment' | 'Other';
export type CustomEventType = { id: string; name: string; icon: string; defaultColor: string };
export type CalendarEvent = { id: string; title: string; type: CalendarEventType; customTypeName?: string; date: string; startTime: string; endTime: string; allDay: boolean; location: string; notes: string; courseId: string; color: string; recurrence: 'none' | 'weekly' | 'biweekly'; recurrenceEnd: string; hardBlock: boolean; createdAt?: string; updatedAt?: string };

export type AssignmentCandidate = {
  id: string;
  courseId: string;
  source: AssignmentSource;
  rawText: string;
  sourceLine: string;
  sourceLineNumber: number;
  title: string;
  type: AssignmentType;
  releaseDate: string;
  dueDate: string;
  dueTime: string;
  estimatedMinutes: number | '';
  importance: number;
  difficulty: number;
  energy: EnergyLevel | '';
  weight: number | '';
  divisible: boolean;
  ambiguityFlags: string[];
  validationIssues: string[];
  reviewStatus: 'needs-review' | 'approved';
  included: boolean;
  instructions: string;
  notes: string;
  miniTasks: MiniTask[];
  completed: boolean;
  completedAt?: string;
  confidence: 'high' | 'review';
};

export type SavedAssignment = AssignmentCandidate & { courseId: string };

export type WorkspaceData = {
  courses: Course[];
  assignments: SavedAssignment[];
  events: CalendarEvent[];
  customEventTypes: CustomEventType[];
};

export function emptyCandidate(courseId: string, source: AssignmentSource = 'manual'): AssignmentCandidate {
  return {
    id: `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    courseId,
    source,
    rawText: '',
    sourceLine: '',
    sourceLineNumber: 0,
    title: '',
    type: 'Assignment',
    releaseDate: '',
    dueDate: '',
    dueTime: '',
    estimatedMinutes: '',
    importance: 3,
    difficulty: 3,
    energy: '',
    weight: '',
    divisible: false,
    ambiguityFlags: [],
    validationIssues: [],
    reviewStatus: 'needs-review',
    included: true,
    instructions: '',
    notes: '',
    miniTasks: [],
    completed: false,
    confidence: 'review',
  };
}
