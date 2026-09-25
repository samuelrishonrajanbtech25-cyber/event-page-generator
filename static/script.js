document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("eventForm");
    const preview = document.getElementById("preview");
    const resetBtn = document.getElementById("resetBtn");
    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const toast = document.getElementById("toast");

    // Field id -> friendly label used in validation messages.
    const FIELDS = {
        eventName: "Event name",
        eventDate: "Date",
        eventTime: "Time",
        eventVenue: "Venue",
        eventDescription: "Description",
        organizerName: "Organizer name",
        contactInfo: "Contact information"
    };

    const placeholderHTML = `
        <div class="preview-placeholder">
            <span class="placeholder-icon">🎟️</span>
            <p>Start filling in the details above to see your event page come to life here.</p>
        </div>
    `;

    // Tracks whether the user has clicked "Generate" at least once, so we only
    // surface validation errors after an explicit generate attempt.
    let hasGenerated = false;

    // Escape user input so it renders as text, not HTML.
    function escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = value;
        return div.innerHTML;
    }

    // Turn "2026-09-25" into "Friday, September 25, 2026".
    function formatDate(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    // Turn "14:30" into "2:30 PM".
    function formatTime(timeStr) {
        if (!timeStr) return "";
        const parts = timeStr.split(":");
        const d = new Date();
        d.setHours(Number(parts[0]), Number(parts[1]), 0, 0);
        if (isNaN(d.getTime())) return timeStr;
        return d.toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit"
        });
    }

    function getData() {
        return {
            name: document.getElementById("eventName").value.trim(),
            date: document.getElementById("eventDate").value,
            time: document.getElementById("eventTime").value,
            venue: document.getElementById("eventVenue").value.trim(),
            description: document.getElementById("eventDescription").value.trim(),
            organizer: document.getElementById("organizerName").value.trim(),
            contact: document.getElementById("contactInfo").value.trim()
        };
    }

    // Returns true when all required fields are filled.
    function isComplete(data) {
        return data.name && data.date && data.time && data.venue &&
            data.description && data.organizer && data.contact;
    }

    // Show/clear an inline error for a single field.
    function setFieldError(id, message) {
        const input = document.getElementById(id);
        const errorEl = document.querySelector('[data-error-for="' + id + '"]');
        if (message) {
            input.classList.add("input-error");
            if (errorEl) errorEl.textContent = message;
        } else {
            input.classList.remove("input-error");
            if (errorEl) errorEl.textContent = "";
        }
    }

    // Validate all required fields. Returns the id of the first invalid field, or null.
    function validate() {
        let firstInvalid = null;
        Object.keys(FIELDS).forEach(function (id) {
            const value = document.getElementById(id).value.trim();
            if (!value) {
                setFieldError(id, FIELDS[id] + " is required.");
                if (!firstInvalid) firstInvalid = id;
            } else {
                setFieldError(id, "");
            }
        });
        return firstInvalid;
    }

    function clearAllErrors() {
        Object.keys(FIELDS).forEach(function (id) {
            setFieldError(id, "");
        });
    }

    // Build the polished event-page markup from the current data.
    function buildEventHTML(data) {
        return `
            <article class="event-card">
                <div class="event-hero">
                    <span class="kicker">You're Invited</span>
                    <h2>${escapeHtml(data.name)}</h2>
                    <div class="event-meta">
                        <span class="meta-chip"><span class="ico">📅</span>${escapeHtml(formatDate(data.date))}</span>
                        <span class="meta-chip"><span class="ico">🕒</span>${escapeHtml(formatTime(data.time))}</span>
                        <span class="meta-chip"><span class="ico">📍</span>${escapeHtml(data.venue)}</span>
                    </div>
                </div>

                <div class="event-body">
                    <div class="event-section">
                        <h3 class="section-title">About This Event</h3>
                        <p>${escapeHtml(data.description)}</p>
                    </div>

                    <div class="event-section">
                        <h3 class="section-title">Location</h3>
                        <p>${escapeHtml(data.venue)}</p>
                    </div>

                    <div class="detail-grid">
                        <div class="detail-card">
                            <p class="label">Organized By</p>
                            <p class="value">${escapeHtml(data.organizer)}</p>
                        </div>
                        <div class="detail-card">
                            <p class="label">Contact</p>
                            <p class="value">${escapeHtml(data.contact)}</p>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }

    // Plain-text version used by the Copy button.
    function buildPlainText(data) {
        return [
            data.name.toUpperCase(),
            "",
            "Date:    " + formatDate(data.date),
            "Time:    " + formatTime(data.time),
            "Venue:   " + data.venue,
            "",
            "About This Event",
            data.description,
            "",
            "Organized By: " + data.organizer,
            "Contact:      " + data.contact
        ].join("\n");
    }

    // Turn an event name into a safe .html filename, e.g. "Tech Summit 2026!" -> "tech-summit-2026.html".
    function sanitizeFilename(name) {
        let base = (name || "").toLowerCase().trim()
            .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
            .replace(/^-+|-+$/g, "");    // trim leading/trailing hyphens
        if (!base) base = "event";
        return base.slice(0, 80) + ".html";
    }

    // Self-contained styles for the downloaded page (subset that matches the on-screen event card).
    const DOWNLOAD_STYLES = `
        *{box-sizing:border-box;}
        body{margin:0;padding:40px 20px;font-family:"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
            line-height:1.65;color:#0f172a;
            background:linear-gradient(160deg,#0f172a,#1e1b4b);min-height:100vh;}
        .event-card{max-width:820px;margin:0 auto;background:#fff;border-radius:18px;
            box-shadow:0 30px 60px rgba(15,23,42,.22);overflow:hidden;}
        .event-hero{position:relative;padding:56px 44px;color:#fff;overflow:hidden;
            background:radial-gradient(600px 300px at 100% 0%,rgba(236,72,153,.55),transparent 60%),
            linear-gradient(125deg,#4f46e5,#06b6d4);}
        .event-hero .kicker{font-size:.72rem;font-weight:700;letter-spacing:.16em;
            text-transform:uppercase;opacity:.9;}
        .event-hero h2{margin:12px 0 0;font-size:2.6rem;font-weight:800;line-height:1.12;
            letter-spacing:-.02em;word-break:break-word;}
        .event-meta{margin-top:24px;display:flex;flex-wrap:wrap;gap:12px;}
        .meta-chip{display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,.18);
            border:1px solid rgba(255,255,255,.25);padding:9px 15px;border-radius:999px;
            font-size:.92rem;font-weight:500;}
        .event-body{padding:40px 44px 44px;}
        .event-section{margin-bottom:32px;}
        .event-section:last-child{margin-bottom:0;}
        .section-title{margin:0 0 12px;font-size:.78rem;font-weight:700;letter-spacing:.1em;
            text-transform:uppercase;color:#4f46e5;}
        .event-section p{margin:0;white-space:pre-wrap;word-break:break-word;color:#334155;font-size:1.02rem;}
        .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding-top:28px;
            margin-top:28px;border-top:1px solid #e2e8f0;}
        .detail-card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:18px 20px;}
        .detail-card .label{font-size:.72rem;font-weight:700;letter-spacing:.1em;
            text-transform:uppercase;color:#64748b;margin:0 0 6px;}
        .detail-card .value{margin:0;font-weight:600;color:#0f172a;word-break:break-word;}
        @media(max-width:640px){.event-hero{padding:40px 26px;}.event-hero h2{font-size:2rem;}
            .event-body{padding:30px 26px 34px;}.detail-grid{grid-template-columns:1fr;}}
    `;

    // Build a standalone HTML document (event markup + inline styles) for download.
    function buildStandaloneHTML(data) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(data.name)}</title>
<style>${DOWNLOAD_STYLES}</style>
</head>
<body>
${buildEventHTML(data)}
</body>
</html>`;
    }

    function showToast(message, isError) {
        toast.textContent = message;
        toast.classList.toggle("toast-error", !!isError);
        toast.classList.add("toast-show");
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () {
            toast.classList.remove("toast-show");
        }, 2200);
    }

    // Renders the live preview. Shows the placeholder until every field is filled.
    function renderPreview() {
        const data = getData();
        if (isComplete(data)) {
            preview.innerHTML = buildEventHTML(data);
            copyBtn.disabled = false;
            downloadBtn.disabled = false;
        } else {
            preview.innerHTML = placeholderHTML;
            copyBtn.disabled = true;
            downloadBtn.disabled = true;
        }
    }

    // --- Live preview: update as the user types / changes fields ---
    Object.keys(FIELDS).forEach(function (id) {
        const input = document.getElementById(id);
        input.addEventListener("input", function () {
            renderPreview();
            // Once the user has attempted to generate, keep clearing errors as they fix fields.
            if (hasGenerated && input.value.trim()) {
                setFieldError(id, "");
            }
        });
    });

    // --- Generate button (form submit) ---
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        hasGenerated = true;

        const firstInvalid = validate();
        if (firstInvalid) {
            // Prevent generating a page with empty required fields.
            document.getElementById(firstInvalid).focus();
            showToast("Please fill in all required fields.", true);
            return;
        }

        const data = getData();
        preview.innerHTML = buildEventHTML(data);
        copyBtn.disabled = false;
        downloadBtn.disabled = false;
        showToast("Event page generated!");
        preview.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // --- Clear Form button ---
    resetBtn.addEventListener("click", function () {
        form.reset();
        clearAllErrors();
        hasGenerated = false;
        preview.innerHTML = placeholderHTML;
        copyBtn.disabled = true;
        downloadBtn.disabled = true;
        showToast("Form cleared.");
    });

    // --- Copy Event Page button ---
    copyBtn.addEventListener("click", function () {
        const data = getData();
        if (!isComplete(data)) {
            showToast("Nothing to copy yet — complete the form first.", true);
            return;
        }

        const text = buildPlainText(data);

        function fallbackCopy() {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand("copy");
                showToast("Event details copied to clipboard!");
            } catch (err) {
                showToast("Copy failed — please copy manually.", true);
            }
            document.body.removeChild(ta);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                showToast("Event details copied to clipboard!");
            }).catch(fallbackCopy);
        } else {
            fallbackCopy();
        }
    });

    // --- Download HTML button ---
    downloadBtn.addEventListener("click", function () {
        const data = getData();
        if (!isComplete(data)) {
            showToast("Nothing to download yet — complete the form first.", true);
            return;
        }

        const html = buildStandaloneHTML(data);
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = sanitizeFilename(data.name);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast("Event page downloaded!");
    });

});
