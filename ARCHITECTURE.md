# Architecture

This first milestone demonstrates the product's appearance and calendar navigation using sample data. It is not yet a live academic planner.

The application separates sample courses/events and pure calendar/color helpers from the main React screen. Shared styles define neutral surfaces and consistent course accents. Accessible UI primitives handle navigation and constrained view choices.

Next milestones will add editable courses and assignments, then user accounts and persistent data. Syllabus extraction will produce reviewable candidates; it must never save without approval. Scheduling should live in independent pure modules and only apply schedule changes after approval. Locked sessions must remain fixed.

The visual prototype does not accept or store personal data. Before real accounts: add per-user authorization, database policies and tests for isolation, timezone handling, and server input validation.
