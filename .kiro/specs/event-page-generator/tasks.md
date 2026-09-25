# Implementation Plan — Auto Event Page Generator (PID-05)

This plan reflects the current state of the working application. Completed items `[x]` are
already implemented and verified in the existing codebase. Unchecked items `[ ]` are
optional future improvements and are NOT to be implemented as part of creating this spec
(no destructive changes yet).

- [x] 1. Flask backend serves the app
  - `app.py` creates the Flask app and serves `GET /` via `render_template("index.html")`.
  - Runs with `python app.py`.
  - _Requirements: 7.1, 7.2_

- [x] 2. Standard template/static structure with correctly loaded assets
  - `templates/index.html`, `static/style.css`, `static/script.js` referenced via
    `url_for('static', ...)`; all load without 404.
  - _Requirements: 7.2, 8.3_

- [x] 3. Event input form with all seven required fields
  - Event name, date, time, venue, description, organizer name, contact information.
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 4. Generate a complete, polished event page
  - Renders title, date, time, venue, description, organizer, and contact in a styled card.
  - _Requirements: 2.1, 2.2_

- [x] 5. Safe, human-friendly rendering
  - `escapeHtml` for all user text; `formatDate`/`formatTime` for readable output.
  - _Requirements: 2.3, 2.4_

- [x] 6. Live preview
  - Preview updates on input; placeholder shown until all fields are complete.
  - _Requirements: 3.1, 3.2_

- [x] 7. Clear Form
  - Resets fields, clears errors, restores placeholder, disables Copy.
  - _Requirements: 4.1_

- [x] 8. Copy Event Page
  - Copies readable text; guarded when incomplete; Clipboard API with `execCommand`
    fallback.
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 9. Client-side validation with clear error messages
  - Blocks generation on empty required fields; per-field messages + field highlight; errors
    clear as fields are corrected.
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 10. Responsive, professional UI
  - Design system, fonts, and a `max-width: 640px` media query for mobile.
  - _Requirements: 8.1, 8.2_

- [x] 11. Lean dependency footprint
  - Only Flask; no database; no extra frameworks.
  - _Requirements: 7.3, 7.4, 7.5, 8.4_

## Future / optional improvements (not implemented now)

- [ ] 12. Field-specific validation beyond "required"
  - Validate contact as email or phone; warn on past dates.
  - _Requirements: 6.2_

- [x] 13. Export / download the generated page
  - "Download HTML" button produces a standalone `.html` file (event markup + inlined
    styles) via a client-side Blob download; filename derived from the event name and
    sanitized; button enabled only when the page is complete.
  - _Requirements: 5.1_

- [ ] 14. Persistence (post-MVP, would introduce a datastore — currently out of scope)
  - Save and reload past events. Explicitly excluded from the MVP by Requirement 7.4.
  - _Requirements: 7.4_

- [ ] 15. Automated test harness
  - Add a small Python route test and a JS logic test runner to the repo.
  - _Requirements: Testing strategy in design.md_
