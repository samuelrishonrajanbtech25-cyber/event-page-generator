# Requirements — Auto Event Page Generator (PID-05)

## Introduction

Clubs and organizers frequently rebuild event webpages from scratch even though the
underlying structure (title, date, time, venue, description, organizer, contact) barely
changes between events. The Auto Event Page Generator lets a user enter basic event
details and instantly receive a complete, polished, reusable event webpage.

This is a Flask-based MVP with no database. The backend serves a single page; all page
generation happens client-side in JavaScript for an immediate, interactive experience.

## Purpose

- Remove the repetitive effort of hand-building event pages that share a common layout.
- Let a user supply basic event information and receive a professional, responsive event
  page they can preview, copy, and reuse.

## Glossary

- **Event page**: The generated, styled output rendered below the form.
- **Live preview**: The event page that updates automatically as the user types.
- **Required field**: One of the seven inputs; all are mandatory to generate a page.

## Requirements

### Requirement 1 — Capture event inputs

**User story:** As an organizer, I want to enter my event's basic details in a form, so
that I don't have to write HTML by hand.

#### Acceptance Criteria

1. WHEN the homepage loads THEN the system SHALL display input fields for: event name,
   date, time, venue, description, organizer name, and contact information.
2. WHEN the user focuses a field THEN the system SHALL show a helpful placeholder or label
   describing the expected input.
3. THE system SHALL treat all seven fields as required.

### Requirement 2 — Generate a complete event page

**User story:** As an organizer, I want to generate a finished event page from my inputs,
so that I have a shareable result.

#### Acceptance Criteria

1. WHEN the user clicks "Generate Event Page" AND all required fields are filled THEN the
   system SHALL render an event page containing the event title, date, time, venue,
   description, organizer information, and contact information.
2. THE generated page SHALL present a polished, professional layout.
3. WHEN rendering user-supplied text THEN the system SHALL escape it so that it displays as
   text and cannot inject markup.
4. WHEN a date and time are provided THEN the system SHALL display them in a human-friendly
   format (e.g. "Friday, September 25, 2026" and "2:30 PM").

### Requirement 3 — Live preview

**User story:** As an organizer, I want to see the page update as I type, so that I get
immediate feedback.

#### Acceptance Criteria

1. WHEN the user changes any field THEN the system SHALL update the preview area without a
   full page reload.
2. WHILE any required field is empty THEN the system SHALL show a neutral placeholder in the
   preview area instead of a partial event page.

### Requirement 4 — Clear the form

**User story:** As an organizer, I want to reset the form, so that I can start a new event
quickly.

#### Acceptance Criteria

1. WHEN the user clicks "Clear Form" THEN the system SHALL empty all fields, remove any
   validation errors, and restore the preview placeholder.

### Requirement 5 — Copy the event page

**User story:** As an organizer, I want to copy the generated event details, so that I can
paste them elsewhere.

#### Acceptance Criteria

1. WHEN the user clicks "Copy Event Page" AND the page is complete THEN the system SHALL
   copy a readable text version of the event details to the clipboard.
2. WHILE the event page is incomplete THEN the system SHALL prevent copying and indicate why.
3. IF the modern Clipboard API is unavailable THEN the system SHALL fall back to a
   compatible copy method.

### Requirement 6 — Validation and error messaging

**User story:** As an organizer, I want clear feedback when I miss a field, so that I know
what to fix.

#### Acceptance Criteria

1. WHEN the user attempts to generate with one or more empty required fields THEN the system
   SHALL prevent generation.
2. WHEN validation fails THEN the system SHALL display a clear, per-field error message
   naming the missing field and SHALL visually mark the invalid field.
3. WHEN the user corrects a previously invalid field THEN the system SHALL clear that
   field's error.

### Requirement 7 — Technical constraints

**User story:** As a maintainer, I want the project to stay a lean Flask app, so that it is
easy to run and submit.

#### Acceptance Criteria

1. THE backend SHALL be implemented with Python Flask.
2. THE system SHALL use Flask's standard `templates/` and `static/` folder structure.
3. CSS SHALL handle styling and JavaScript SHALL handle client-side interaction.
4. THE MVP SHALL NOT require a database.
5. THE system SHALL NOT replace Flask or add unnecessary frameworks or dependencies.

### Requirement 8 — Non-functional requirements

**User story:** As a user, I want a reliable, professional experience on any device.

#### Acceptance Criteria

1. THE UI SHALL be responsive on desktop and mobile.
2. THE UI SHALL look clean and professional.
3. WHEN the app is served THEN all static files (CSS, JS) SHALL load without 404 errors.
4. THE system SHALL avoid unnecessary external dependencies.
5. Existing working functionality SHALL NOT be removed by future changes.
