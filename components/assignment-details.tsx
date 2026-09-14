'use client';
import { useState } from 'react';
import { Flag, Plus, Save, Trash2, X } from 'lucide-react';
import {
  assignmentTypes,
  type AssignmentCandidate,
  type Course,
  type MiniTask,
  type SavedAssignment,
} from '@/lib/studyflow/models';

export function AssignmentDetails({
  assignment,
  course,
  onChange,
  onDelete,
  onClose,
}: {
  assignment: SavedAssignment;
  course?: Course;
  onChange: (assignment: SavedAssignment) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(assignment);
  const [taskTitle, setTaskTitle] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const percent = draft.miniTasks.length
    ? Math.round(
        (draft.miniTasks.filter((task) => task.completed).length /
          draft.miniTasks.length) *
          100,
      )
    : draft.completed
      ? 100
      : 0;
  const progressBar = draft.miniTasks.length ? <progress className="assignment-progress" max={100} value={percent} aria-label={`${percent}% complete`} /> : null;
  const update = (patch: Partial<AssignmentCandidate>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const save = () => {
    onChange(draft);
    onClose();
  };
  const toggleComplete = (completed: boolean) =>
    update({
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    });
  const updateTask = (task: MiniTask) =>
    update({
      miniTasks: draft.miniTasks.map((item) =>
        item.id === task.id ? task : item,
      ),
    });
  const addTask = () => {
    if (!taskTitle.trim()) return;
    update({
      miniTasks: [
        ...draft.miniTasks,
        { id: `task-${Date.now()}`, title: taskTitle.trim(), completed: false },
      ],
    });
    setTaskTitle('');
  };
  return (
    <div
      className="details-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <dialog
        open
        className="assignment-details"
        aria-labelledby="assignment-details-title"
      >
        <div className="details-header">
          <div>
            <span className="eyebrow">ASSIGNMENT DETAILS</span>
            <h2 id="assignment-details-title">
              <Flag size={18} /> {draft.title}
            </h2>
          </div>
          <button
            className="icon-button"
            aria-label="Close assignment details"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        <div className="details-course">
          <i style={{ background: course?.color ?? '#8992a4' }} />
          {course?.code || course?.name || 'Course'}
          <span className="deadline-label">Due</span>
        </div>
        <div className="details-grid">
          <label>
            Due date
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) => update({ dueDate: event.target.value })}
            />
          </label>
          <label>
            Due time
            <input
              type="time"
              value={draft.dueTime}
              onChange={(event) => update({ dueTime: event.target.value })}
            />
          </label>
          <label>
            Assignment type
            <select
              value={draft.type}
              onChange={(event) =>
                update({
                  type: event.target.value as AssignmentCandidate['type'],
                })
              }
            >
              {assignmentTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            Estimated time
            <input
              type="number"
              min="1"
              value={draft.estimatedMinutes}
              onChange={(event) =>
                update({ estimatedMinutes: Number(event.target.value) || '' })
              }
            />
          </label>
          <label>
            Energy level
            <select
              value={draft.energy}
              onChange={(event) =>
                update({
                  energy: event.target.value as AssignmentCandidate['energy'],
                })
              }
            >
              <option value="">Choose</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </label>
          <label>
            Importance
            <select
              value={draft.importance}
              onChange={(event) =>
                update({ importance: Number(event.target.value) })
              }
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select
              value={draft.difficulty}
              onChange={(event) =>
                update({ difficulty: Number(event.target.value) })
              }
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
          <label>
            Course Grade Weight (%)
            <input
              type="number"
              min="0"
              max="100"
              value={draft.weight}
              onChange={(event) =>
                update({
                  weight:
                    event.target.value === '' ? '' : Number(event.target.value),
                })
              }
            />
          </label>
        </div>
        <label className="details-field">
          What do you need to do?
          <textarea
            value={draft.instructions}
            onChange={(event) => update({ instructions: event.target.value })}
            placeholder="No instructions have been added yet."
            rows={4}
          />
          <small>
            Add instructions, requirements, links, chapters, problems, or
            anything you need to remember.
          </small>
        </label>
        <label className="details-field">
          Notes
          <textarea
            value={draft.notes}
            onChange={(event) => update({ notes: event.target.value })}
            rows={3}
          />
        </label>
        <section className="details-section">
          <div className="details-section-heading">
            <div>
              <h3>Steps</h3>
              <p>
                {draft.miniTasks.length
                  ? `${draft.miniTasks.filter((task) => task.completed).length} of ${draft.miniTasks.length} steps complete`
                  : 'No mini-tasks yet'}
              </p>
            </div>
            <strong>{percent}%</strong>
          </div>
          {progressBar}
          {draft.miniTasks.map((task) => (
            <div className="mini-task" key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                aria-label={`Complete ${task.title}`}
                onChange={(event) => {
                  const completed = event.target.checked;
                  if (
                    completed &&
                    draft.miniTasks.every(
                      (item) => item.id === task.id || item.completed,
                    ) &&
                    !draft.completed &&
                    !window.confirm(
                      'All steps are complete. Mark the entire assignment complete?',
                    )
                  )
                    return;
                  updateTask({
                    ...task,
                    completed,
                    completedAt: completed
                      ? new Date().toISOString()
                      : undefined,
                  });
                }}
              />
              <input
                value={task.title}
                aria-label="Mini-task title"
                onChange={(event) =>
                  updateTask({ ...task, title: event.target.value })
                }
              />
              <button
                className="icon-button"
                aria-label={`Delete ${task.title}`}
                onClick={() =>
                  update({
                    miniTasks: draft.miniTasks.filter(
                      (item) => item.id !== task.id,
                    ),
                  })
                }
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <div className="add-task">
            <input
              value={taskTitle}
              placeholder="Add a mini-task"
              onChange={(event) => setTaskTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addTask();
              }}
            />
            <button className="secondary" onClick={addTask}>
              <Plus size={15} />
              Add step
            </button>
          </div>
        </section>
        <label className="completion-row">
          <input
            type="checkbox"
            checked={draft.completed}
            onChange={(event) => toggleComplete(event.target.checked)}
          />
          {draft.completed ? 'Assignment complete' : 'Mark assignment complete'}
        </label>
        <div className="details-actions">
          <button className="secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" onClick={save}>
            <Save size={16} />
            Save changes
          </button>
          <button
            className="danger-button"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
        {confirmDelete && (
          <div className="confirm-inline">
            <p>Delete this assignment and its calendar due event?</p>
            <button className="danger-button" onClick={onDelete}>
              Delete assignment
            </button>
            <button
              className="text-button"
              onClick={() => setConfirmDelete(false)}
            >
              Keep it
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
