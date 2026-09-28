# Portfolio of Huzzatul Jannat Shethil

Personal portfolio of **Huzzatul Jannat Shethil**, UI/UX Designer, B.Sc. in CSE (United International University).

© Huzzatul Jannat Shethil, CSE, UIU · UI/UX Designer. All rights reserved.

## How to update the portfolio

All of the content lives in **one file: `data/profile.json`**. You never need to edit the HTML.

| To change… | Edit this part of `data/profile.json` |
|---|---|
| Name, role, email, phone, tagline | the top fields |
| About text | `about` |
| Design process steps | `process` |
| Jobs | `experience`: add the newest job at the top |
| Projects / case studies | `projects`: add `"links": [{ "label": "Figma prototype", "url": "…" }]` |
| Skills and strengths | `skills`, `strengths` |
| Education, achievements | `education`, `achievements` |
| Certificates | `certificates`: `{ "title": "…", "issuer": "…", "date": "2026", "url": "…" }` |
| LinkedIn, Behance, Dribbble, Figma, GitHub… | `profiles.list`: replace each default homepage link with the real profile URL |
| CV download | replace `public/Huzzatul-Jannat-Shethil-CV.pdf` (keep the same file name) |
| Photo | replace `public/images/profile.jpg` |

## Publish
Double-click **`publish.cmd`**, or run it with a message:
```
publish.cmd "Add Behance link"
```
It builds the site, commits the change and pushes it to GitHub. Vercel then redeploys automatically.
Run it with a normal double-click, **not** "Run as administrator".

## Preview locally
```
node build.js
node serve.js 8091
```
Then open http://localhost:8091.
