# StudyFlow — your first visual version

StudyFlow is a website application. VS Code is the editor you use to open its files; a browser displays the website.

## Start on this Mac (no coding needed)

1. Open this `studyflow` folder in VS Code using **File → Open Folder**.
2. Choose **Terminal → Run Task → Run StudyFlow**.
3. The terminal shows a Local address, normally `http://localhost:3000`. Open that address in your browser. Keep the terminal running while using the website.
4. To stop it, click the terminal and press **Control+C**.

You can also double-click `start.command` in this folder. It uses the Node.js runtime prepared alongside this project. If you move this folder elsewhere, install Node.js 22 LTS from the official nodejs.org website first.

## What to try

- Dashboard: sample day, study sessions, upcoming deadlines, and example weekly progress.
- Calendar: Quarter, Month, Week, and Day; previous/next arrows; Today; zoom buttons.
- Click a date to open the day, or a quarter workload bar to open its week.
- Select **See sample week** to return to the populated September 28, 2026 example.
- Open Courses and Assignments to see the sample information.
- On a narrow screen, use the menu button to open navigation.

The first version uses sample data only. Completion bubbles, locks, and workload bars are visual examples. There are no accounts, saved changes, syllabus imports, notifications, or scheduling yet. Progress and Settings explain the coming features. We will build those in later milestones with your feedback.

## If you prefer terminal commands

With Node.js 22 LTS installed, open a terminal in this folder:

```sh
npm ci
npm run dev
```

To run the focused calendar and contrast checks:

```sh
npm test
```

To check the production build:

```sh
npm run build
```

`npm ci` installs the project's libraries. `npm run dev` starts the local website and updates it when code changes. `npm test` checks date navigation and color contrast. `npm run build` prepares the website for hosting.

## Where things live

- `app/page.tsx`: dashboard, sidebar, calendar views, and sample destination screens.
- `app/globals.css`: colors, typography, layout, mobile styles.
- `app/layout.tsx`: page title, description, and fonts.
- `lib/studyflow/sample.ts`: clearly labeled sample courses, sessions, deadlines.
- `lib/studyflow/calendar.ts`: date navigation and contrast helpers.
- `tests/calendar.test.ts`: focused behavior checks.
- `ARCHITECTURE.md`: how future features fit together.
- `DECISIONS.md`: scope and design decisions.

## Next milestone

Add your own courses and manual assignments, with clear validation and course colors. Later milestones cover accounts, syllabus review, study scheduling, mini-tasks, and approved reshuffling. The PDF remains the product reference.

## Validation limits

Automated checks do not replace trying the app on your laptop and phone. Browser interaction and screen-reader testing have not been performed. The prototype is not the complete production release.
