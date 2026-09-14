# StudyBuddy project status

Snapshot prepared September 14, 2026. Originally named StudyFlow; the product is now StudyBuddy. The existing local folder and hosted URL retain the old name for continuity.

## Implemented in the current source

- Responsive dashboard and sidebar navigation.
- Quarter, month, week, and day calendars with date navigation and zoom.
- Compact weekly layout, course colors, and cleaner break markers with time details.
- Focus timer with configurable goal, elapsed/remaining time, pause/resume, and reset.
- Course creation and editing, recurring class times, and personal calendar events.
- Manual assignment entry and deterministic pasted-syllabus extraction into a review workflow.
- Assignment details, notes, completion, and mini-task controls.
- Browser-local workspace persistence for courses, assignments, events, and custom event types.

The latter course/assignment/event features were present as uncommitted local work when this GitHub snapshot was prepared. They are included as current development work, rather than discarded or described as already production-validated.

## Important limits

- This is a developing prototype, not the full production release described by the spec.
- Workspace data lives in browser local storage. It does not synchronize across devices and can be removed by clearing browser data.
- The focus timer resets on refresh and is not a durable study-history record.
- No email/password accounts, per-user cloud database, or row-level access policies yet.
- No complete preference-aware automatic scheduling, risk analysis, or approved reshuffling engine yet.
- No real background notifications, calendar integrations, or document uploads.
- The hosted preview may lag behind the newest local source. Creating this repository does not redeploy the website.

## Product direction and requested changes

The original product spec describes a personalized academic planner for college students balancing classes, employment, commuting, and personal time. The user approved starting with a visual version and later requested a compact week view, study timer, the StudyBuddy name, more color/personality, and cleaner break displays.

Design principles: approachable language, course colors, readable calendar density, and explicit user approval before future schedule changes. Preserve locked sessions. Syllabus candidates must be reviewed before saving.

## Verification

The September 14 snapshot passed 22 automated unit tests covering date navigation, color contrast, syllabus parsing and validation, recurring events, local persistence, and timer math. The production build also passed. Full browser, mobile, screen-reader, and multi-user security validation remain outstanding.

## Suggested next work

1. Try course creation, syllabus review, recurring events, and assignment editing with representative student examples.
2. Improve validation and add integration tests around those complete workflows.
3. Add account onboarding and secure per-user cloud persistence.
4. Implement deterministic scheduling and tests for hard availability, deadlines, breaks, energy preferences, and locks.
5. Add schedule previews and explicit approval for reshuffling, then risk warnings and progress history.
