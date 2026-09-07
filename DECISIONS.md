# StudyFlow decisions

- The user approved starting with the visual version before accounts and planning.
- The PDF is the product reference. Its suggested technology choices are recommendations.
- Milestone 1 uses sample data only. Navigation and calendar date/view controls work; records cannot yet be edited or saved.
- Initial sample term: September 28–December 11, 2026. Calendar initially opens on September 28 so the example schedule is visible; Today goes to the real current date.
- Local browser dates are used for this visual prototype. Explicit per-user timezone handling is required before real scheduling.
- Use the Sites React starter and private hosting for the preview. Preserve a VS Code-friendly local project.
- No authentication, external calendar connection, syllabus parser, automatic scheduling, or real productivity conclusions are included in this milestone.

- Primary navigation uses URL fragments so browser back/forward can revisit screens. Calendar view controls remain local UI state.
- WebMCP omitted: this milestone only reads sample information and navigates between views.
