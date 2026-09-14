'use client';
import { useEffect, useRef, useState } from 'react';
import { CalendarPlus, ChevronDown, Save, Trash2, X } from 'lucide-react';
import type { CalendarEvent, CalendarEventType, Course, CustomEventType } from '@/lib/studyflow/models';
import { overlaps } from '@/lib/studyflow/recurrence';

const presets: CalendarEventType[] = ['Class', 'Meeting', 'Study', 'Work', 'Commute', 'Appointment', 'Personal', 'Club', 'Exercise', 'Other'];
const palette = ['#2b6cb0', '#6d3cce', '#207b68', '#d97706', '#d35d75', '#0f766e', '#a16207', '#8992a4'];
type Props = { courses: Course[]; date: Date; existing: CalendarEvent[]; customTypes: CustomEventType[]; initial?: CalendarEvent; initialStart?: string; onSave: (event: CalendarEvent, customType?: CustomEventType) => void; onDelete?: (id: string) => void; onClose: () => void };

export function EventEditor({ courses, date, existing, customTypes, initial, initialStart = '10:00', onSave, onDelete, onClose }: Props) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState(initial?.customTypeName ?? initial?.type ?? 'Personal');
  const [eventDate, setEventDate] = useState(initial?.date ?? date.toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState(initial?.startTime ?? initialStart);
  const [endTime, setEndTime] = useState(initial?.endTime ?? `${String(Number(initialStart.slice(0, 2)) + 1).padStart(2, '0')}:${initialStart.slice(3)}`);
  const [color, setColor] = useState(initial?.color ?? '#2b6cb0');
  const [courseId, setCourseId] = useState(initial?.courseId ?? '');
  const [recurrence, setRecurrence] = useState<CalendarEvent['recurrence']>(initial?.recurrence ?? 'none');
  const [recurrenceEnd, setRecurrenceEnd] = useState(initial?.recurrenceEnd ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [hardBlock, setHardBlock] = useState(initial?.hardBlock ?? true);
  const [more, setMore] = useState(false);
  const [warning, setWarning] = useState('');
  const [newType, setNewType] = useState('');
  useEffect(() => { titleRef.current?.focus(); }, []);
  const custom = customTypes.find(item => item.name === type);
  function save() {
    if (!title.trim()) { setWarning('Give this event a title.'); return; }
    const conflict = existing.find(item => item.id !== initial?.id && item.date === eventDate && overlaps(startTime, endTime, item.startTime, item.endTime));
    if (conflict && !window.confirm(`This event overlaps ${conflict.title} from ${conflict.startTime}–${conflict.endTime}. Save anyway?`)) { setWarning(`This event overlaps ${conflict.title} from ${conflict.startTime}–${conflict.endTime}.`); return; }
    const now = new Date().toISOString();
    const customType = type === '__custom' && newType.trim() ? { id: `type-${Date.now()}`, name: newType.trim(), icon: '', defaultColor: color } : undefined;
    const savedType = custom || customType || type === '__custom' ? 'Other' : type;
    onSave({ id: initial?.id ?? `event-${Date.now()}`, title: title.trim(), type: savedType as CalendarEventType, customTypeName: customType?.name ?? custom?.name, date: eventDate, startTime, endTime, allDay: false, location, notes, courseId, color: courseId ? courses.find(course => course.id === courseId)?.color ?? color : custom?.defaultColor ?? color, recurrence, recurrenceEnd, hardBlock, createdAt: initial?.createdAt ?? now, updatedAt: now }, customType);
  }
  return <div className="details-backdrop">
    <dialog open className="assignment-details event-editor" aria-labelledby="event-editor-title">
      <div className="details-header"><div><span className="eyebrow">CALENDAR EVENT</span><h2 id="event-editor-title"><CalendarPlus size={18} /> {initial ? 'Edit event' : 'What are you adding?'}</h2></div><button className="icon-button" aria-label="Close event composer" onClick={onClose}><X size={18} /></button></div>
      <label className="details-field event-title-field">Title<input ref={titleRef} placeholder="Study group, dentist appointment, work shift..." value={title} onChange={event => setTitle(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') save(); if (event.key === 'Escape') onClose(); }} /></label>
      <div className="details-grid"><label>Date<input type="date" value={eventDate} onChange={event => setEventDate(event.target.value)} /></label><label>Start time<input type="time" value={startTime} onChange={event => setStartTime(event.target.value)} /></label><label>End time<input type="time" value={endTime} onChange={event => setEndTime(event.target.value)} /></label><label>Event type<select value={type} onChange={event => setType(event.target.value)}>{presets.map(item => <option key={item}>{item}</option>)}{customTypes.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}<option value="__custom">+ Create custom type</option></select></label><label>Color<div className="event-palette">{palette.map(option => <button type="button" aria-label={`Use ${option}`} className={color === option ? 'selected' : ''} style={{ background: option }} key={option} onClick={() => setColor(option)} />)}</div></label></div>
      {type === '__custom' && <label className="details-field">Custom type name<input autoFocus value={newType} onChange={event => setNewType(event.target.value)} placeholder="Research, Mosque, Tutoring..." /></label>}
      <button className="more-options" onClick={() => setMore(value => !value)}>{more ? 'Hide' : 'More'} options <ChevronDown size={16} /></button>
      {more && <div className="details-grid more-fields"><label>Course association<select value={courseId} onChange={event => setCourseId(event.target.value)}><option value="">None</option>{courses.filter(course => !course.sample).map(course => <option key={course.id} value={course.id}>{course.code || course.name}</option>)}</select></label><label>Recurrence<select value={recurrence} onChange={event => setRecurrence(event.target.value as CalendarEvent['recurrence'])}><option value="none">Does not repeat</option><option value="weekly">Weekly</option><option value="biweekly">Every two weeks</option></select></label>{recurrence !== 'none' && <label>Repeat until<input type="date" value={recurrenceEnd} onChange={event => setRecurrenceEnd(event.target.value)} /></label>}<label>Location<input value={location} onChange={event => setLocation(event.target.value)} /></label><label className="details-field">Notes<textarea rows={3} value={notes} onChange={event => setNotes(event.target.value)} /></label><label className="completion-row"><input type="checkbox" checked={hardBlock} onChange={event => setHardBlock(event.target.checked)} />Hard scheduling conflict</label></div>}
      {warning && <div className="builder-error" role="alert">{warning}</div>}
      <div className="details-actions"><button className="secondary" onClick={onClose}>Cancel</button>{initial && onDelete && <button className="danger-button" onClick={() => window.confirm('Delete this event?') && onDelete(initial.id)}><Trash2 size={16} />Delete</button>}<button className="primary" onClick={save}><Save size={16} />{initial ? 'Save changes' : 'Save event'}</button></div>
    </dialog>
  </div>;
}
