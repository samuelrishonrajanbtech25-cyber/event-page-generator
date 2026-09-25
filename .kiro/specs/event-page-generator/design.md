# Design — Auto Event Page Generator (PID-05)

## Overview

The Auto Event Page Generator is a single-page Flask application. Flask's only job is to
serve one HTML template and the static CSS/JS assets. All event-page generation,
validation, live preview, clipboard copy, and form clearing happen client-side in
`static/script.js`. This keeps the MVP simple, database-free, and instantly interactive.

This design documents the system **as currently implemented** so the spec can be reviewed
against the working application. No architectural change is proposed.

## Architecture

```
Browser (index.html + style.css + script.js)
        │  HTTP GET /
        ▼
Flask (app.py)  ──►  render_template("index.html")
        │
        └─►  /static/style.css , /static/script.js  (Flask static serving)
```

- **No server-side rendering of event data.** The server never sees the event inputs; the
  page is built entirely in the browser. This is intentional for the MVP (no persistence).
- **Single route:** `GET /` returns the form + preview shell.

### Component responsibilities

| Component | Responsibility |
|-----------|----------------|
| `app.py` | Create the Flask app; serve `/` via `render_template`; run the dev server. |
| `templates/index.html` | Form markup (7 fields), action buttons, per-field error slots, live-preview container, toast element; loads fonts, CSS, and JS. |
| `static/style.css` | Design system (colors, typography, spacing), form styling, responsive rules, generated event-card styling, error/toast/placeholder styles. |
| `static/script.js` | Read inputs, validate, format date/time, escape HTML, build event-page markup, live preview, generate, clear, copy, toast feedback. |

## Data model

No database. The in-memory event object assembled in JS:

```js
{
  name, date, time, venue, description, organizer, contact  // all strings
}
```

## Client-side modules (functions in script.js)

- `getData()` — collects and trims the seven field values into the event object.
- `isComplete(data)` — true only when every required field is non-empty.
- `validate()` — marks each empty field with an error message; returns the first invalid id.
- `setFieldError(id, msg)` / `clearAllErrors()` — toggle inline error UI.
- `escapeHtml(value)` — renders user text safely (prevents HTML injection).
- `formatDate(str)` / `formatTime(str)` — human-friendly date/time.
- `buildEventHTML(data)` — the polished event-card markup (hero + sections + detail grid).
- `buildPlainText(data)` — readable text version for the clipboard.
- `renderPreview()` — shows the placeholder until complete, otherwise the live event page.
- `showToast(msg, isError)` — transient feedback for generate/clear/copy/validation.

### Event flow

1. **Input** on any field → `renderPreview()` (live preview) and clears that field's error
   once the user has attempted generation.
2. **Submit** ("Generate") → `validate()`; if invalid, focus first bad field + error toast;
   else render event page + success toast + smooth scroll.
3. **Clear Form** → reset form, clear errors, restore placeholder, disable Copy.
4. **Copy Event Page** → guard on `isComplete`; Clipboard API with `execCommand` fallback.

## Generated page structure

- **Hero**: kicker ("You're Invited"), event title, meta chips for date / time / venue.
- **Body**: "About This Event" (description), "Location" (venue), and a detail grid with
  "Organized By" and "Contact".

## Styling & responsiveness

- Design tokens via CSS custom properties; Google Fonts (Plus Jakarta Sans + Inter).
- Two-column field rows and detail grid on desktop; single column and stacked buttons under
  640px via a media query.

## Security considerations

- All user-supplied strings pass through `escapeHtml` before insertion into the DOM,
  preventing stored/reflected markup injection in the preview.

## Error handling

- Per-field inline messages + red field styling for missing required inputs.
- Toast notifications for generate success, clear, copy success/failure, and validation.
- Clipboard: graceful fallback to a hidden `<textarea>` + `execCommand("copy")` when the
  Clipboard API is unavailable (e.g. non-secure origins).

## Testing strategy

- **Runtime/route checks:** Flask starts; `/` → 200 (text/html); `/static/style.css` and
  `/static/script.js` → 200 with correct content types; unknown route → 404.
- **JS syntax:** `node --check static/script.js`.
- **Logic checks:** date/time formatting and `isComplete` behavior.
- **Manual UI:** live preview, validation, generate, clear, copy, and responsive layout on
  desktop and mobile widths.

## Constraints honored

- Flask retained; standard `templates/`/`static/` layout; no database; no extra frameworks;
  no destructive changes to existing working functionality.
