import type { CvData } from "./cv-data.interface";

/** Escape HTML special characters to prevent XSS */
function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build a complete HTML document for CV PDF generation */
export function buildCvHtml(data: CvData): string {
  const contactParts: string[] = [];
  if (data.email) contactParts.push(esc(data.email));
  if (data.phone) contactParts.push(esc(data.phone));
  if (data.linkedin)
    contactParts.push(`<a href="${esc(data.linkedin)}">LinkedIn</a>`);
  if (data.github)
    contactParts.push(`<a href="${esc(data.github)}">GitHub</a>`);
  if (data.website)
    contactParts.push(`<a href="${esc(data.website)}">Portfolio</a>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #1a1a1a;
    line-height: 1.5;
    padding: 40px 48px;
    font-size: 10.5pt;
  }

  /* Header */
  .header { margin-bottom: 20px; border-bottom: 2px solid #2563eb; padding-bottom: 16px; }
  .header h1 { font-size: 22pt; font-weight: 700; color: #111; letter-spacing: -0.5px; }
  .header .title { font-size: 11pt; color: #2563eb; font-weight: 500; margin-top: 2px; }
  .header .contact { font-size: 9pt; color: #555; margin-top: 6px; }
  .header .contact a { color: #2563eb; text-decoration: none; }
  .header .location { font-size: 9pt; color: #777; margin-top: 2px; }

  /* Sections */
  .section { margin-top: 16px; }
  .section-title {
    font-size: 10pt; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1px; color: #2563eb; border-bottom: 1px solid #e5e7eb;
    padding-bottom: 3px; margin-bottom: 10px;
  }

  /* Experience */
  .exp-item { margin-bottom: 12px; }
  .exp-header { display: flex; justify-content: space-between; align-items: baseline; }
  .exp-company { font-weight: 600; font-size: 10.5pt; }
  .exp-duration { font-size: 9pt; color: #777; }
  .exp-role { font-size: 10pt; color: #444; font-style: italic; }
  .exp-highlights { margin-top: 4px; padding-left: 16px; }
  .exp-highlights li { font-size: 10pt; color: #333; margin-bottom: 2px; }

  /* Skills */
  .skills-grid { display: flex; flex-wrap: wrap; gap: 8px 24px; }
  .skill-group { font-size: 10pt; }
  .skill-group strong { color: #333; }
  .skill-group span { color: #555; }

  /* Education */
  .edu-item { margin-bottom: 6px; }
  .edu-header { display: flex; justify-content: space-between; align-items: baseline; }
  .edu-school { font-weight: 600; font-size: 10.5pt; }
  .edu-duration { font-size: 9pt; color: #777; }
  .edu-degree { font-size: 10pt; color: #444; }

  /* Certificates */
  .cert-list { display: flex; flex-wrap: wrap; gap: 4px 20px; }
  .cert-item { font-size: 10pt; }
  .cert-item .issuer { color: #777; font-size: 9pt; }
</style>
</head>
<body>
  <div class="header">
    <h1>${esc(data.name)}</h1>
    <div class="title">${esc(data.title)}</div>
    <div class="contact">${contactParts.join(" · ")}</div>
    ${data.location ? `<div class="location">${esc(data.location)}</div>` : ""}
  </div>

  ${
    data.summary
      ? `<div class="section">
    <div class="section-title">Summary</div>
    <p style="font-size:10pt;color:#333">${esc(data.summary)}</p>
  </div>`
      : ""
  }

  ${
    data.experience.length > 0
      ? `<div class="section">
    <div class="section-title">Experience</div>
    ${data.experience
      .map(
        (exp) => `
      <div class="exp-item">
        <div class="exp-header">
          <span class="exp-company">${esc(exp.company)}</span>
          <span class="exp-duration">${esc(exp.duration)}</span>
        </div>
        <div class="exp-role">${esc(exp.role)}</div>
        ${
          exp.highlights.length > 0
            ? `<ul class="exp-highlights">${exp.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>`
            : ""
        }
      </div>`,
      )
      .join("")}
  </div>`
      : ""
  }

  ${
    data.skills.length > 0
      ? `<div class="section">
    <div class="section-title">Skills</div>
    <div class="skills-grid">
      ${data.skills.map((g) => `<div class="skill-group"><strong>${esc(g.category)}:</strong> <span>${g.items.map(esc).join(", ")}</span></div>`).join("")}
    </div>
  </div>`
      : ""
  }

  ${
    data.education.length > 0
      ? `<div class="section">
    <div class="section-title">Education</div>
    ${data.education
      .map(
        (edu) => `
      <div class="edu-item">
        <div class="edu-header">
          <span class="edu-school">${esc(edu.institution)}</span>
          <span class="edu-duration">${esc(edu.duration)}</span>
        </div>
        <div class="edu-degree">${esc(edu.degree)}</div>
      </div>`,
      )
      .join("")}
  </div>`
      : ""
  }

  ${
    data.certificates && data.certificates.length > 0
      ? `<div class="section">
    <div class="section-title">Certificates</div>
    <div class="cert-list">
      ${data.certificates.map((c) => `<div class="cert-item">${esc(c.title)} <span class="issuer">— ${esc(c.issuer)}</span></div>`).join("")}
    </div>
  </div>`
      : ""
  }
</body>
</html>`;
}
