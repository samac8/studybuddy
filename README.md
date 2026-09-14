# StudyBuddy — your first visual version

StudyBuddy is a website application. VS Code is the editor you use to open its files; a browser displays the website.

## Start on this Mac (no coding needed)

1. Open this `studyflow` folder in VS Code using **File → Open Folder**.
2. Choose **Terminal → Run Task → Run StudyBuddy**.
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

The current source includes both sample views and editable courses, assignments, syllabus review, and recurring events. Your own workspace is stored in this browser only. Accounts and automatic scheduling are still future work.

See [Project status](docs/PROJECT_STATUS.md) for what is implemented, current limitations, validation, and the next milestones. The hosted preview may not include every newer local change.

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

## Next milestones

Validate the course/assignment/event workflows, then add accounts and cloud persistence, realistic scheduling, risk warnings, and approved reshuffling. See [Project status](docs/PROJECT_STATUS.md).

## Validation limits

Automated checks do not replace trying the app on your laptop and phone. Browser interaction and screen-reader testing have not been performed. The prototype is not the complete production release.

## StudyBuddy timer update
The focus timer shows elapsed study time and time remaining for a 1–240 minute session. Start, pause/resume, and reset are available. It stays running while navigating within the app and catches up after background-tab throttling. Refreshing or closing the page resets it; it does not save study history or update sample assignments.

The week calendar now uses 44 pixels per hour and fits all seven days on laptop widths. Phone screens scroll horizontally to keep event text readable. The local folder remains named studyflow so existing setup paths keep working.

## Product reference

[Original product and engineering specification](docs/StudyFlow_Product_and_Engineering_Spec.pdf). It describes the target product, including features that are not implemented yet.
