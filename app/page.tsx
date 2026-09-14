'use client';
import { useState, useEffect } from 'react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { StudyTimer } from '@/components/study-timer';
import {
  LayoutDashboard,
  CalendarDays,
  ChartNoAxesColumn,
  BookOpen,
  CheckCheck,
  Settings,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  LockKeyhole,
  Check,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Flag,
} from 'lucide-react';
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  addDays,
  monday,
  monthDays,
  sameDay,
  shiftDate,
  foreground,
  views,
  type View,
} from '@/lib/studyflow/calendar';
import {
  sampleDate,
  courses,
  deadlines,
  eventsOn,
  timeLabel,
  type Event,
} from '@/lib/studyflow/sample';
import { hydrateUserData } from '@/lib/studyflow/sample';
import { CourseBuilder } from '@/components/course-builder';
import { AssignmentDetails } from '@/components/assignment-details';
import { EventEditor } from '@/components/event-editor';
import {
  loadWorkspace,
  saveWorkspace,
  upsertCourse,
  updateAssignment,
  deleteAssignment,
  updateCourse,
} from '@/lib/studyflow/repository';
import type { Course, SavedAssignment } from '@/lib/studyflow/models';
const destinations = [
  ['Dashboard', LayoutDashboard],
  ['Calendar', CalendarDays],
  ['Quarter Plan', ChartNoAxesColumn],
  ['Courses', BookOpen],
  ['Assignments', CheckCheck],
  ['Progress', ChartNoAxesColumn],
  ['Settings', Settings],
] as const;
const fmt = (date: Date, options: Intl.DateTimeFormatOptions) =>
  date.toLocaleDateString('en-US', options);
function CourseTag({ index }: { index: number }) {
  const c = courses[index];
  return c ? (
    <span
      className="course-tag"
      style={{ background: c.color, color: foreground(c.color) }}
    >
      {c.code}
    </span>
  ) : (
    <span className="course-tag neutral-tag">Life & commitments</span>
  );
}
function Navigation({
  page,
  onNavigate,
}: {
  page: string;
  onNavigate: (p: string) => void;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <Sidebar className="app-sidebar">
      <SidebarHeader>
        <a
          className="brand"
          href="#dashboard"
          onClick={() => onNavigate('Dashboard')}
        >
          <span className="brand-icon">
            <GraduationCap size={23} />
          </span>
          StudyBuddy<span className="brand-dot">.</span>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <p className="nav-caption">WORKSPACE</p>
        <SidebarMenu>
          {destinations.map(([name, Icon]) => (
            <SidebarMenuItem key={name}>
              <SidebarMenuButton
                className="nav-link"
                isActive={page === name}
                onClick={() => {
                  onNavigate(name);
                  setOpenMobile(false);
                }}
              >
                <Icon size={19} />
                <span>{name}</span>
                {name === 'Calendar' && (
                  <span className="nav-key">4 views</span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div className="sidebar-courses">
          <p className="nav-caption">YOUR COURSES</p>
          {courses.map((c) => (
            <div key={c.code}>
              <i style={{ background: c.color }} />
              {c.code}
            </div>
          ))}
        </div>
        <div className="term-note">
          <span className="eyebrow">A LITTLE ROOM TO BREATHE</span>
          <p>Your time outside class matters, too.</p>
          <span>Build a plan around your life.</span>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <div className="profile">
          <span className="avatar">S</span>
          <div>
            <strong>Student workspace</strong>
            <small>Sample quarter · Autumn 2026</small>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
function DeadlineEvent({
  event,
  compact = false,
  onOpenAssignment,
}: {
  event: Event;
  compact?: boolean;
  onOpenAssignment?: (id: string) => void;
}) {
  const c = courses[event.course];
  const openAssignment = () => onOpenAssignment?.(event.id) ?? (window.location.hash = 'assignments');
  return (
    <button
      type="button"
      className={`deadline-event ${compact ? 'compact' : ''}`}
      data-completed={event.done ? 'true' : 'false'}
      aria-label={`Assignment due: ${event.title}${c ? ` for ${c.name}` : ''}`}
      onClick={openAssignment}
      onKeyDown={(eventKey) => {
        if (eventKey.key === 'Enter' || eventKey.key === ' ') openAssignment();
      }}
    >
      {event.done ? <Check size={compact ? 12 : 15} /> : <Flag size={compact ? 12 : 15} />}
      <strong>Due: {event.title}</strong>{event.progress !== undefined && <span className="deadline-progress">{event.progress}%</span>}
      {c && (
        <span>
          <i style={{ background: c.color }} />
          {c.code || c.name}
        </span>
      )}
    </button>
  );
}
function EventCard({
  event,
  compact = false,
  onOpenAssignment,
  onOpenEvent,
}: {
  event: Event;
  compact?: boolean;
  onOpenAssignment?: (id: string) => void;
  onOpenEvent?: (id: string) => void;
}) {
  if (event.kind === 'Deadline')
    return <DeadlineEvent event={event} compact={compact} onOpenAssignment={onOpenAssignment} />;
  const c = courses[event.course];
  const savedId = event.id.startsWith('saved-') ? event.id : '';
  return (
    <button type="button" onClick={() => savedId && onOpenEvent?.(savedId)} className={`event-card ${compact ? 'compact' : ''} ${event.kind.toLowerCase()}`}
      style={{
        borderLeftColor: c?.color || '#8a91a3',
        background: c ? `${c.color}12` : undefined,
      }}
    >
      <div className="event-meta">
        <span>
          {event.kind}
          {event.locked ? ' · Locked' : ''}
        </span>
        {event.locked && <LockKeyhole size={12} />}
      </div>
      <strong>{event.title}</strong>
      {!compact && (
        <span>
          {timeLabel(event.hour)}
          {event.duration > 0
            ? ` – ${timeLabel(event.hour + event.duration)}`
            : ''}
          {c ? ` · ${c.code}` : ''}
        </span>
      )}
    </button>
  );
}
function Dashboard({ openCalendar, onOpenAssignment, assignments }: { openCalendar: () => void; onOpenAssignment: (id: string) => void; assignments: SavedAssignment[] }) {
  const todayEvents = eventsOn(sampleDate).filter(
    (e) => e.kind !== 'Deadline' && e.kind !== 'Break',
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MONDAY, SEPTEMBER 28 · SAMPLE DAY</p>
          <h1>A little focus. A little flow.</h1>
          <p>Here’s what your day has in store.</p>
        </div>
        <button className="primary" onClick={openCalendar}>
          Open calendar <ArrowUpRight size={17} />
        </button>
      </div>
      <div className="stats">
        <div>
          <span>Planned focus today</span>
          <strong>
            1<span>h</span> 30<span>m</span>
          </strong>
          <small>Two manageable study sessions</small>
        </div>
        <div>
          <span>This week’s progress</span>
          <strong>
            1 <span>/ 5 sessions</span>
          </strong>
          <Progress
            value={20}
            aria-label="Sample weekly completion: 20 percent"
          />
        </div>
        <div>
          <span>Coming up this week</span>
          <strong>
            3 <span>deadlines</span>
          </strong>
          <small>Across your three courses</small>
        </div>
      </div>
      <div className="dashboard-grid">
        <section className="panel timeline-panel">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ONE THING AT A TIME</span>
              <h2>Your day, mapped out</h2>
            </div>
            <span className="pill">Monday 28</span>
          </div>
          <div className="timeline">
            {todayEvents.map((e) => (
              <div className="timeline-row" key={e.id}>
                <span className="time">{timeLabel(e.hour)}</span>
                <span
                  className={`completion ${e.done ? 'done' : ''}`}
                  aria-label={
                    e.done
                      ? 'Sample completed session'
                      : 'Sample incomplete item'
                  }
                >
                  {e.done ? <Check size={14} /> : null}
                </span>
                <div className="timeline-event">
                  <div className="row-between">
                    <CourseTag index={e.course} />
                    <span className="muted">
                      {e.kind} · {e.duration * 60} min
                    </span>
                  </div>
                  <h3 className={e.done ? 'crossed' : ''}>{e.title}</h3>
                  <p>
                    {e.done
                      ? 'Completed · nice work'
                      : e.kind === 'Class'
                        ? 'Fixed commitment'
                        : 'A focused block, with room for a break.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="day-end">
            <Sparkles size={17} /> A clear stopping point. Your evening is
            yours.
          </div>
        </section>
        <div className="right-stack">
          <section className="panel">
            <div className="section-heading">
              <h2>On the horizon</h2>
              <Flag size={18} />
            </div>
            {deadlines.slice(0, 3).map((d) => (
              <button aria-label={`Assignment due: ${d.title}`} className="deadline-row" key={d.id} onClick={() => assignments.some(item => item.id === d.id) && onOpenAssignment(d.id)}>
                <span className="date-block">
                  <small>{fmt(d.date, { month: 'short' })}</small>
                  <strong>{d.date.getDate()}</strong>
                </span>
                <div>
                  <h3>{d.title}</h3>
                  <span>
                    <i style={{ background: courses[d.course].color }} />
                    {courses[d.course].code} · 11:59 pm
                  </span>
                </div>
              </button>
            ))}
          </section>
          <section className="insight">
            <span className="insight-icon">
              <Sparkles size={21} />
            </span>
            <p className="eyebrow">FIND YOUR RHYTHM</p>
            <h2>
              Small sessions.
              <br />
              Steady progress.
            </h2>
            <p>
              Your sample plan leaves space between focused work and everything
              else.
            </p>
            <span>
              Energy insights appear after real sessions are completed.
            </span>
          </section>
        </div>
      </div>
    </>
  );
}
function Calendar({
  view,
  setView,
  date,
  setDate,
  onOpenAssignment,
  onAddEvent,
  onAddEventAt,
  onOpenEvent,
}: {
  view: View;
  setView: (v: View) => void;
  date: Date;
  setDate: (d: Date) => void;
  onOpenAssignment: (id: string) => void;
  onAddEvent: () => void;
  onAddEventAt: (date: Date, time: string) => void;
  onOpenEvent: (id: string) => void;
}) {
  const days =
    view === 'day'
      ? [date]
      : Array.from({ length: 7 }, (_, i) => addDays(monday(date), i));
  const drill = (d: Date, v: View) => {
    setDate(d);
    setView(v);
  };
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">MAKE SPACE FOR WHAT MATTERS</p>
          <h1>Your calendar</h1>
          <p>The big picture and the next small step.</p>
        </div>
        <div className="calendar-heading-actions"><button className="primary" onClick={onAddEvent}><Plus size={16} /> Add</button><span className="pill">
          <span className="status-dot" /> Autumn 2026 · Sample data
        </span></div>
      </div>
      <section className="panel calendar-panel">
        <Tabs value={view} onValueChange={(v) => setView(v as View)}>
          <div className="calendar-toolbar">
            <div className="calendar-date">
              <button
                className="icon-button"
                aria-label="Previous period"
                onClick={() => setDate(shiftDate(date, view, -1))}
              >
                <ChevronLeft size={19} />
              </button>
              <button
                className="icon-button"
                aria-label="Next period"
                onClick={() => setDate(shiftDate(date, view, 1))}
              >
                <ChevronRight size={19} />
              </button>
              <h2>
                {view === 'quarter'
                  ? `${fmt(date, { month: 'short' })} – ${fmt(new Date(date.getFullYear(), date.getMonth() + 2, 1), { month: 'short', year: 'numeric' })}`
                  : view === 'day'
                    ? fmt(date, {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : fmt(date, { month: 'long', year: 'numeric' })}
              </h2>
              <button
                className="text-button"
                onClick={() => setDate(new Date())}
              >
                Today
              </button>
            </div>
            <div className="view-controls">
              <TabsList aria-label="Calendar view">
                {views.map((v) => (
                  <TabsTrigger key={v} value={v}>
                    {v[0].toUpperCase() + v.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="zoom">
                <button
                  className="icon-button"
                  aria-label="Zoom out"
                  disabled={view === 'quarter'}
                  onClick={() => setView(views[views.indexOf(view) - 1])}
                >
                  <Minus size={16} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Zoom in"
                  disabled={view === 'day'}
                  onClick={() => setView(views[views.indexOf(view) + 1])}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
          <TabsContent value="quarter">
            <div className="quarter-grid">
              {Array.from({ length: 3 }, (_, m) => {
                const month = new Date(
                  date.getFullYear(),
                  date.getMonth() + m,
                  1,
                );
                return (
                  <div className="mini-month" key={m}>
                    <button onClick={() => drill(month, 'month')}>
                      <h3>
                        {fmt(month, { month: 'long' })}{' '}
                        <ArrowUpRight size={15} />
                      </h3>
                    </button>
                    <div className="mini-days">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                        <span key={i} className="weekday">
                          {d}
                        </span>
                      ))}
                      {monthDays(month).map((d, i) => (
                        <button
                          key={i}
                          className={`${d.getMonth() !== month.getMonth() ? 'outside' : ''} ${sameDay(d, sampleDate) ? 'selected-date' : ''}`}
                          onClick={() => onAddEventAt(d, '09:00')}
                          aria-label={fmt(d, { dateStyle: 'full' })}
                        >
                          {d.getDate()}
                          <span className="dots">
                            {deadlines
                              .filter((e) => sameDay(e.date, d))
                              .map((e) => <Flag key={e.id} size={11} aria-label="Assignment due" />)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="quarter-weeks">
              <h3>Weekly focus · illustrative workload</h3>
              <div className="week-bars">
                {Array.from({ length: 11 }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => drill(addDays(sampleDate, i * 7), 'week')}
                    aria-label={`Open week ${i + 1}`}
                  >
                    <span className="bar-track">
                      <span
                        style={{
                          height: `${[35, 46, 40, 65, 83, 56, 42, 65, 72, 91, 46][i]}%`,
                          background: i === 9 ? '#ac572c' : '#6864cc',
                        }}
                      />
                    </span>
                    <span>W{i + 1}</span>
                  </button>
                ))}
              </div>
              <p className="muted">
                Sample workload only. Real estimates will come from your
                assignments.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="month">
            <div className="month-grid">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                <div className="weekday" key={d}>
                  {d}
                </div>
              ))}
              {monthDays(date).map((d, i) => (
                <button
                  key={i}
                  className={`month-cell ${d.getMonth() !== date.getMonth() ? 'outside' : ''}`}
                  onClick={() => onAddEventAt(d, '09:00')}
                  aria-label={`Open ${fmt(d, { dateStyle: 'full' })}`}
                >
                  <span
                    className={sameDay(d, sampleDate) ? 'selected-date' : ''}
                  >
                    {d.getDate()}
                  </span>
                  {eventsOn(d)
                    .filter((e) => e.kind !== 'Break')
                    .slice(0, 2)
                    .map((e) => (
                      <span
                        className={`month-event ${e.kind === 'Deadline' ? 'month-deadline' : ''}`}
                        style={{
                          borderLeftColor:
                            e.kind === 'Deadline' ? '#c93645' : courses[e.course]?.color || '#8992a4',
                        }}
                        key={e.id}
                      >
                        {e.kind === 'Deadline' && <Flag size={11} aria-label="Assignment due" />}
                        {e.kind === 'Deadline' ? 'Due: ' : ''}
                        {e.title}
                      </span>
                    ))}
                  {eventsOn(d).length > 2 && (
                    <small>+{eventsOn(d).length - 2} more</small>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>
          {(['week', 'day'] as View[]).map((v) => (
            <TabsContent key={v} value={v}>
              <div className="schedule-scroll">
                <div className={`schedule ${v === 'day' ? 'single-day' : ''}`}>
                  <div className="time-column">
                    <div className="day-head">
                      GMT
                      {-(new Date().getTimezoneOffset() / 60) >= 0 ? '+' : ''}
                      {-(new Date().getTimezoneOffset() / 60)}
                    </div>
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i}>{timeLabel(i + 8)}</div>
                    ))}
                  </div>
                  {days.map((d) => (
                    <div className="schedule-day" key={d.toDateString()}>
                      <button
                        className="day-head"
                        onClick={() => drill(d, 'day')}
                      >
                        <span>{fmt(d, { weekday: 'short' })}</span>
                        <strong
                          className={
                            sameDay(d, sampleDate) ? 'selected-date' : ''
                          }
                        >
                          {d.getDate()}
                        </strong>
                      </button>
                      <div className="day-grid">
                        {Array.from({ length: 24 }, (_, slot) => { const hour = 8 + Math.floor(slot / 2); const minute = slot % 2 ? '30' : '00'; const time = `${String(hour).padStart(2, '0')}:${minute}`; return <button type="button" className="empty-slot" key={time} aria-label={`Add event ${fmt(d, { dateStyle: 'long' })} at ${timeLabel(hour + (minute === '30' ? .5 : 0))}`} style={{ top: `${slot * (v === 'week' ? 22 : 38)}px`, height: `${v === 'week' ? 22 : 38}px` }} onClick={() => onAddEventAt(d, time)}><span>+ Add at {timeLabel(hour + (minute === '30' ? .5 : 0))}</span></button>; })}
                        {eventsOn(d)
                          .filter((e) => e.kind !== 'Deadline')
                          .map((e) => (
                            <div
                              className="positioned-event"
                              key={e.id}
                              style={{
                                top: `${(e.hour - 8) * (v === 'week' ? 44 : 76)}px`,
                                height: `${e.duration * (v === 'week' ? 44 : 76)}px`,
                              }}
                            >
                              {e.kind === 'Break' ? (
                                <Tooltip>
                                  <TooltipTrigger
                                    className="break-marker"
                                    aria-label={`10-minute break, ${timeLabel(e.hour)} to ${timeLabel(e.hour + e.duration)}`}
                                  >
                                    <span className="break-line" />
                                    <span className="break-caption">
                                      Break · 10m
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    Take a breather · 10 minutes
                                    <br />
                                    {timeLabel(e.hour)} –{' '}
                                    {timeLabel(e.hour + e.duration)}
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <EventCard event={e} compact={v === 'week'} onOpenAssignment={onOpenAssignment} onOpenEvent={onOpenEvent} />
                              )}
                            </div>
                          ))}
                      </div>
                      <div className="deadline-footer">
                        {deadlines
                          .filter((e) => sameDay(e.date, d))
                          .map((e) => (
                            <DeadlineEvent key={e.id} event={e} compact onOpenAssignment={onOpenAssignment} />
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
        <div className="calendar-legend">
          {courses.map((c) => (
            <span key={c.code}>
              <i style={{ background: c.color }} />
              {c.code}
            </span>
          ))}
          <span>
            <i style={{ background: '#8992a4' }} />
            Life & commitments
          </span>
          <span>
            <LockKeyhole size={13} />
            Locked example
          </span>
          <span>
            <i className="break-legend-line" />
            10-minute break
          </span>
        </div>
      </section>
      <p className="calendar-hint">
        Explore with the view buttons or select a date to zoom in. Editing and
        scheduling arrive in the next milestones.
      </p>
    </>
  );
}
function OtherPage({
  page,
  onCalendar,
  onAdd,
  onEditCourse,
  onOpenAssignment,
  assignments,
  onToggleAssignment,
}: {
  page: string;
  onCalendar: () => void;
  onAdd: () => void;
  onEditCourse: (courseId: string) => void;
  onOpenAssignment: (assignmentId: string) => void;
  assignments: SavedAssignment[];
  onToggleAssignment: (assignment: SavedAssignment) => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR STUDYBUDDY WORKSPACE</p>
          <h1>{page}</h1>
          <p>
            {page === 'Courses'
              ? 'A little color for every part of your quarter.'
              : 'A preview of what’s coming next.'}
          </p>
        </div>
        {page === 'Courses' && (
          <button className="primary" onClick={onAdd}>
            <Plus size={17} />
            Add course
          </button>
        )}
      </div>
      {page === 'Courses' ? (
        <div className="course-grid">
          {courses.map((c, i) => (
            <section
              className="panel course-panel"
              style={{ borderTopColor: c.color }}
              key={c.id}
            >
              <CourseTag index={i} />
              <h2>{c.name}</h2>
              <p>
                {c.startDate} – {c.endDate}
              </p>
              <span className="pill">
                {c.sample ? 'Sample course' : 'Saved course'}
              </span>
              {!c.sample && <button className="secondary" onClick={() => onEditCourse(c.id)}>Edit course</button>}
            </section>
          ))}
        </div>
      ) : page === 'Assignments' ? (
        <section className="panel">
          {assignments.map((assignment) => {
            const courseIndex = courses.findIndex(course => course.id === assignment.courseId);
            return <button className={`assignment-row ${assignment.completed ? 'completed-item' : ''}`} key={assignment.id} onClick={() => onOpenAssignment(assignment.id)}>
              <div>
                <input type="checkbox" checked={assignment.completed} aria-label={`Complete ${assignment.title}`} onClick={event => event.stopPropagation()} onChange={event => onToggleAssignment({ ...assignment, completed: event.target.checked, completedAt: event.target.checked ? new Date().toISOString() : undefined })} />
                <CourseTag index={courseIndex} />
                <h3>{assignment.title}</h3>
              </div>
              <span>{assignment.dueDate}</span>{assignment.miniTasks.length > 0 && <span className="list-progress" aria-label={`${Math.round(assignment.miniTasks.filter(task => task.completed).length / assignment.miniTasks.length * 100)}% complete`}><span style={{ width: `${Math.round(assignment.miniTasks.filter(task => task.completed).length / assignment.miniTasks.length * 100)}%` }} /></span>}<span className="pill">{assignment.completed ? 'Complete' : 'Assignment'}</span>
            </button>;
          })}
        </section>
      ) : (
        <section className="panel coming-next">
          <div className="brand-icon">
            <Sparkles size={25} />
          </div>
          <h2>
            {page === 'Progress'
              ? 'Your progress will have a home here.'
              : 'A plan that fits your life.'}
          </h2>
          <p>
            {page === 'Progress'
              ? 'Once you start completing study sessions, you’ll see weekly completion and energy patterns. There’s no real activity to measure in this visual preview.'
              : 'Wake and sleep times, productive hours, days off, and study preferences will be editable when we build the planning features.'}
          </p>
          <button className="primary" onClick={onCalendar}>
            Explore the calendar <ArrowRight size={17} />
          </button>
        </section>
      )}
    </>
  );
}
export default function Home() {
  const [page, setPage] = useState('Dashboard');
  const [view, setView] = useState<View>('week');
  const [date, setDate] = useState(sampleDate);
  const [workspace, setWorkspace] = useState(() => loadWorkspace());
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [eventEditorOpen, setEventEditorOpen] = useState(false);
  const [eventDraft, setEventDraft] = useState<{ date: Date; time: string; event?: import('@/lib/studyflow/models').CalendarEvent }>({ date: sampleDate, time: '10:00' });
  const [, refresh] = useState(0);
  useEffect(() => {
    hydrateUserData(workspace.courses, workspace.assignments, workspace.events);
    queueMicrotask(() => refresh((value) => value + 1));
  }, [workspace]);
  useEffect(() => {
    const read = () => {
      const key = decodeURIComponent(window.location.hash.slice(1));
      const found = destinations.find(
        ([name]) => name.toLowerCase().replaceAll(' ', '-') === key,
      );
      if (found) {
        setPage(found[0]);
        if (found[0] === 'Quarter Plan') setView('quarter');
      }
    };
    read();
    window.addEventListener('hashchange', read);
    return () => window.removeEventListener('hashchange', read);
  }, []);
  const navigate = (p: string) => {
    window.location.hash = p.toLowerCase().replaceAll(' ', '-');
    setPage(p);
    if (p === 'Quarter Plan') {
      setView('quarter');
      setDate(new Date(2026, 8, 1));
    }
  };
  const saveCourse = (course: Course, assignments: SavedAssignment[]) => {
    const next = upsertCourse(workspace, course, assignments);
    saveWorkspace(next);
    setWorkspace(next);
    setPage('Courses');
    window.location.hash = 'courses';
  };
  const openAssignment = (assignmentId: string) => setSelectedAssignmentId(assignmentId);
  const updateAssignmentRecord = (assignment: SavedAssignment) => {
    const next = updateAssignment(workspace, assignment);
    saveWorkspace(next);
    setWorkspace(next);
  };
  const toggleAssignment = (assignment: SavedAssignment) => updateAssignmentRecord(assignment);
  const deleteAssignmentRecord = (assignmentId: string) => {
    const next = deleteAssignment(workspace, assignmentId);
    saveWorkspace(next);
    setWorkspace(next);
    setSelectedAssignmentId(null);
  };
  const editCourse = (courseId: string) => { setEditingCourseId(courseId); setPage('Course Builder'); };
  const saveEditedCourse = (course: Course, assignments: SavedAssignment[]) => {
    const next = updateCourse({ ...workspace, assignments: workspace.assignments.map(item => assignments.find(updated => updated.id === item.id) ?? item) }, course);
    saveWorkspace(next); setWorkspace(next); setEditingCourseId(null); setPage('Courses'); window.location.hash = 'courses';
  };
  const selectedAssignment = workspace.assignments.find(assignment => assignment.id === selectedAssignmentId);
  const selectedCourse = selectedAssignment ? workspace.courses.find(course => course.id === selectedAssignment.courseId) : undefined;
  const editingCourse = workspace.courses.find(course => course.id === editingCourseId);
  const openEvent = (renderedId: string) => { const event = workspace.events.find(item => renderedId.startsWith(`saved-${item.id}-`)); if (event) { setEventDraft({ date: new Date(`${event.date}T00:00:00`), time: event.startTime, event }); setEventEditorOpen(true); } };
  const openEventAt = (eventDate: Date, time: string) => { setEventDraft({ date: eventDate, time }); setEventEditorOpen(true); };
  return (
    <SidebarProvider>
      <Navigation page={page} onNavigate={navigate} />
      <main className="main-content" id="main-content">
        <a href="#page-content" className="skip-link">
          Skip to content
        </a>
        <header className="topbar">
          <div className="topbar-left">
            <SidebarTrigger />
            <span>My workspace</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
          <span className="preview-badge">
            <span />
            Visual preview
          </span>
        </header>
        <div className="demo-banner">
          <span>
            <strong>Make yourself at home.</strong>{' '}
            {workspace.courses.length
              ? 'Your saved courses are ready.'
              : 'You’re exploring sample data. Your real planner comes next.'}
          </span>
          <button
            onClick={() => {
              setDate(sampleDate);
              setView('week');
              setPage('Calendar');
            }}
          >
            See sample week <ArrowRight size={14} />
          </button>
        </div>
        <div className="page-content" id="page-content">
          <StudyTimer />
          {page === 'Dashboard' ? (
            <Dashboard openCalendar={() => navigate('Calendar')} onOpenAssignment={openAssignment} assignments={workspace.assignments} />
          ) : page === 'Calendar' || page === 'Quarter Plan' ? (
            <Calendar
              view={view}
              setView={setView}
              date={date}
              setDate={setDate}
              onOpenAssignment={openAssignment}
              onAddEvent={() => openEventAt(date, '10:00')}
              onAddEventAt={openEventAt}
              onOpenEvent={openEvent}
            />
          ) : page === 'Course Builder' ? (
            <CourseBuilder
              onCancel={() => setPage('Courses')}
              onSave={editingCourse ? saveEditedCourse : saveCourse}
              initialCourse={editingCourse}
              initialAssignments={editingCourse ? workspace.assignments.filter(assignment => assignment.courseId === editingCourse.id) : []}
            />
          ) : (
            <OtherPage
              page={page}
              onCalendar={() => navigate('Calendar')}
              onAdd={() => setPage('Course Builder')}
              onEditCourse={editCourse}
              onOpenAssignment={openAssignment}
              assignments={workspace.assignments}
              onToggleAssignment={toggleAssignment}
            />
          )}
          {selectedAssignment && <AssignmentDetails assignment={selectedAssignment} course={selectedCourse} onChange={updateAssignmentRecord} onDelete={() => deleteAssignmentRecord(selectedAssignment.id)} onClose={() => setSelectedAssignmentId(null)} />}
          {eventEditorOpen && <EventEditor courses={workspace.courses} date={eventDraft.date} initialStart={eventDraft.time} initial={eventDraft.event} existing={workspace.events} customTypes={workspace.customEventTypes} onClose={() => setEventEditorOpen(false)} onDelete={id => { const next = { ...workspace, events: workspace.events.filter(item => item.id !== id) }; saveWorkspace(next); setWorkspace(next); setEventEditorOpen(false); }} onSave={(event, customType) => { const next = { ...workspace, events: eventDraft.event ? workspace.events.map(item => item.id === event.id ? event : item) : [...workspace.events, event], customEventTypes: customType ? [...workspace.customEventTypes, customType] : workspace.customEventTypes }; saveWorkspace(next); setWorkspace(next); setEventEditorOpen(false); }} />}
          <footer className="page-footer">
            <span>StudyBuddy · A little structure, a lot more space.</span>
            <span>Autumn quarter 2026</span>
          </footer>
        </div>
      </main>
    </SidebarProvider>
  );
}
