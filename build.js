#!/usr/bin/env node
/*
 * Portfolio of Huzzatul Jannat Shethil — static site builder.
 * Zero dependencies: reads data/profile.json and writes the finished website to site/.
 * © Huzzatul Jannat Shethil, CSE, UIU · UI/UX Designer
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const OUT = path.join(ROOT, 'site');
const P = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'profile.json'), 'utf8'));
const BASE = (P.siteUrl || '').replace(/\/$/, '');
const YEAR = new Date().getFullYear();
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const V = Date.now().toString(36);

/* ---------- helpers ---------- */
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pad = (n) => String(n).padStart(2, '0');

/* Empty the output folder rather than deleting it, so a locked folder does not break the build. */
function clean(p) {
  if (!fs.existsSync(p)) return;
  for (const e of fs.readdirSync(p)) fs.rmSync(path.join(p, e), { recursive: true, force: true, maxRetries: 3 });
}
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}
function write(rel, content) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, content);
}

/* ---------- icons ---------- */
const I = {
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M6.6 3.5 9 3l1.6 4-2 1.3a11 11 0 0 0 5.1 5.1l1.3-2 4 1.6-.5 2.4A2 2 0 0 1 16.5 17 13.5 13.5 0 0 1 4 4.5a2 2 0 0 1 2.6-1Z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  ext: '<path d="M14 4h6v6M20 4 10 14M18 14v6H4V6h6"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M10 17h4"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>',
  pen: '<path d="m15 4 5 5L9 20H4v-5z"/><path d="m13 6 5 5"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  flow: '<rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="15" y="15" width="6" height="6" rx="1.5"/><path d="M9 6h4a2 2 0 0 1 2 2v7"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  sparkle: '<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>'
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${I[n] || ''}</svg>`;

/* Platform badges: neutral monograms in each platform's colour. */
const BADGE = {
  linkedin: ['in', '#0A66C2'], behance: ['Bē', '#1769FF'], dribbble: ['Dr', '#EA4C89'], figma: ['F', '#A259FF'],
  github: ['GH', '#24292F'], medium: ['M', '#111111'], instagram: ['IG', '#D62976'], facebook: ['f', '#1877F2'], x: ['X', '#111111']
};
const badge = (k) => { const [t, c] = BADGE[k] || [String(k).slice(0, 2).toUpperCase(), '#6b7280']; return `<span class="badge" style="--b:${c}">${esc(t)}</span>`; };

/* ---------- layout ---------- */
const NAV = [['about', 'About'], ['process', 'Process'], ['work', 'Work'], ['experience', 'Experience'], ['skills', 'Skills'], ['education', 'Education'], ['contact', 'Contact']];
const credit = `© ${YEAR} ${esc(P.name)}, ${esc(P.credentials)} · ${esc(P.role)}. All rights reserved.`;

function head({ title, description, canonical, extra = '' }) {
  return `<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${esc(P.name)}">
<meta name="copyright" content="${esc(P.name)}, ${esc(P.credentials)}">
<meta name="theme-color" content="#fbf8f3">
<link rel="canonical" href="${esc(BASE + canonical)}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(BASE + canonical)}">
<meta property="og:image" content="${esc(BASE + '/' + P.photo)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css?v=${V}">
<script>try{var t=localStorage.getItem('sh-theme');if(t)document.documentElement.dataset.theme=t;}catch(e){}</script>
${extra}
</head>`;
}

function header(home) {
  return `<header class="topbar" id="top">
  <div class="topbar-inner">
    <a class="brand" href="/" aria-label="${esc(P.name)} — home"><span class="brand-mark">S</span><span class="brand-text">${esc(P.shortName)}<i>.</i></span></a>
    <nav class="nav" id="nav" aria-label="Main">${NAV.map(([id, l]) => `<a href="${home ? '' : '/'}#${id}" data-nav="${id}">${l}</a>`).join('')}</nav>
    <div class="top-actions">
      ${P.cvPdf ? `<a class="btn btn-dark btn-sm hide-sm" href="/${esc(P.cvPdf)}" download>${icon('download')} CV</a>` : ''}
      <button class="icon-btn" id="themeToggle" aria-label="Toggle light / dark theme">${icon('moon', 'i-moon')}${icon('sun', 'i-sun')}</button>
      <button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu" aria-expanded="false" aria-controls="nav">${icon('menu')}</button>
    </div>
  </div>
</header>`;
}

const bg = `<div class="bg" aria-hidden="true"><div class="blob b1"></div><div class="blob b2"></div><div class="blob b3"></div><div class="dots"></div></div>`;

function footer() {
  return `<footer class="footer">
  <div class="wrap">
    <p class="footer-big">Let’s design something <em>people love</em>.</p>
    <div class="footer-row">
      <div class="brand"><span class="brand-mark">S</span><span class="brand-text">${esc(P.shortName)}<i>.</i></span></div>
      <div class="footer-links">${NAV.map(([id, l]) => `<a href="/#${id}">${l}</a>`).join('')}</div>
    </div>
    <div class="footer-bottom">
      <p>${credit}</p>
      <p class="muted">All credits and copyrights by ${esc(P.name)}, ${esc(P.credentials)} · ${esc(P.role)}.</p>
    </div>
  </div>
</footer>`;
}

const sec = (kicker, title, lead = '') => `<div class="sec-head reveal"><span class="kicker">${kicker}</span><h2>${title}</h2>${lead ? `<p class="lead">${lead}</p>` : ''}</div>`;

/* ---------- sections ---------- */
function hero() {
  const words = P.rotatingWords || [];
  return `<section class="hero" id="home">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <p class="status"><span class="dot"></span>${esc(P.openTo)}</p>
      <h1>
        <span class="h-small">Hi, I’m</span>
        <span class="h-name">${esc(P.name.split(' ').slice(0, -1).join(' '))} <em>${esc(P.name.split(' ').slice(-1)[0])}</em></span>
      </h1>
      <p class="h-role">${esc(P.role)} crafting <span class="rotator" id="rotator" data-words="${esc(JSON.stringify(words))}"><span>${esc(words[0] || '')}</span></span> experiences.</p>
      <p class="h-sub">${esc(P.tagline)}</p>
      <div class="cta">
        <a class="btn btn-dark" href="#work">See my work ${icon('arrow')}</a>
        ${P.cvPdf ? `<a class="btn btn-line" href="/${esc(P.cvPdf)}" download>${icon('download')} Download CV</a>` : ''}
      </div>
      <ul class="h-meta">
        <li>${icon('pin')} ${esc(P.location)}</li>
        <li>${icon('pen')} B.Sc. CSE, UIU</li>
      </ul>
    </div>
    <div class="hero-art">
      <div class="frame-label">Frame · ${esc(P.shortName)}</div>
      <div class="frame" id="frame">
        <img src="/${esc(P.photo)}" width="720" height="898" alt="Portrait of ${esc(P.name)}">
        <span class="h tl"></span><span class="h tr"></span><span class="h bl"></span><span class="h br"></span>
        <span class="frame-size">720 × 898</span>
      </div>
      <div class="sticker s1">${icon('sparkle')} UI/UX</div>
      <div class="sticker s2">Figma</div>
      <div class="sticker s3">${icon('trophy')} Best CSE Project</div>
      <div class="swatches"><i style="--c:#1f3f8f"></i><i style="--c:#e8578d"></i><i style="--c:#f3b562"></i><i style="--c:#16a39a"></i></div>
      <div class="cursor c-me"><svg viewBox="0 0 24 24"><path d="M4 3l16 7-7 2-2 7z"/></svg><span>${esc(P.shortName)}</span></div>
      <div class="cursor c-you"><svg viewBox="0 0 24 24"><path d="M4 3l16 7-7 2-2 7z"/></svg><span>You</span></div>
    </div>
  </div>
  <div class="marquee" aria-hidden="true"><div class="track">${Array(2).fill(['User research', 'User flows', 'Wireframes', 'Prototyping', 'High-fidelity UI', 'Design systems', 'Accessibility', 'Responsive design', 'Interaction design', 'Figma'].map(x => `<span>${x}</span><b>✦</b>`).join('')).join('')}</div></div>
</section>`;
}

function about() {
  return `<section class="section" id="about">
  <div class="wrap about">
    <div>
      ${sec('About me', 'Design with <em>empathy</em>, built with <em>logic</em>.')}
      <div class="about-text reveal">${P.about.map(p => `<p>${esc(p)}</p>`).join('')}</div>
    </div>
    <div class="highlights">
      ${P.highlights.map((h, i) => `<div class="hl card reveal" style="--i:${i}"><b>${esc(h.value)}</b><span>${esc(h.label)}</span></div>`).join('')}
      <div class="contact-mini card reveal">
        <a href="mailto:${esc(P.email)}">${icon('mail')} ${esc(P.email)}</a>
        <a href="tel:${esc(P.phone.replace(/[^+\d]/g, ''))}">${icon('phone')} ${esc(P.phone)}</a>
      </div>
    </div>
  </div>
</section>`;
}

function processSec() {
  return `<section class="section alt" id="process">
  <div class="wrap">
    ${sec('How I work', 'My design <em>process</em>', 'From understanding people to shipping polished interfaces — every step keeps the user at the centre.')}
    <ol class="process">
      ${P.process.map(s => `<li class="step card reveal"><span class="step-no">${esc(s.step)}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></li>`).join('')}
    </ol>
  </div>
</section>`;
}

function mock() {
  /* Abstract wireframe composition — an illustration of the design process, not a real screenshot. */
  return `<div class="mock" aria-hidden="true">
    <div class="mock-win">
      <div class="mock-bar"><i></i><i></i><i></i><span>UniVerseHub</span></div>
      <div class="mock-body">
        <div class="mock-side"><b></b><b></b><b></b><b></b></div>
        <div class="mock-main">
          <div class="mock-hero"></div>
          <div class="mock-cards"><div></div><div></div><div></div></div>
          <div class="mock-lines"><i></i><i></i><i></i></div>
        </div>
      </div>
    </div>
    <div class="mock-phone"><div class="mp-notch"></div><div class="mp-a"></div><div class="mp-b"></div><div class="mp-b"></div><div class="mp-c"></div></div>
    <div class="mock-note">Wireframe illustration</div>
  </div>`;
}

function work() {
  return `<section class="section" id="work">
  <div class="wrap">
    ${sec('Selected work', 'Featured <em>project</em>')}
    ${P.projects.map(p => `<article class="case reveal">
      <div class="case-art">${mock()}${p.award ? `<span class="award-pill">${icon('trophy')} ${esc(p.award)}</span>` : ''}</div>
      <div class="case-body">
        <span class="kicker">${esc(p.type)}</span>
        <h3>${esc(p.title)}</h3>
        <p class="case-sub">${esc(p.subtitle)}</p>
        <p>${esc(p.description)}</p>
        <dl class="case-meta">
          <div><dt>Role</dt><dd>${esc(p.role)}</dd></div>
          <div><dt>Timeline</dt><dd>${esc(p.period)}</dd></div>
          <div><dt>Tools</dt><dd>${p.tools.map(esc).join(' · ')}</dd></div>
        </dl>
        <ul class="features">${p.features.map(f => `<li>${icon('check')}<div><b>${esc(f.title)}</b><span>${esc(f.text)}</span></div></li>`).join('')}</ul>
        ${(p.links || []).length ? `<div class="cta">${p.links.map(l => `<a class="btn btn-line btn-sm" href="${esc(l.url)}" target="_blank" rel="noopener">${icon('ext')} ${esc(l.label)}</a>`).join('')}</div>` : ''}
      </div>
    </article>`).join('')}
  </div>
</section>`;
}

function experience() {
  return `<section class="section alt" id="experience">
  <div class="wrap">
    ${sec('Career', 'Work <em>experience</em>')}
    <div class="xp">
      ${P.experience.map(e => `<article class="xp-item card reveal">
        <div class="xp-when">${esc(e.period)}</div>
        <div class="xp-what">
          <h3>${esc(e.role)}</h3>
          <p class="xp-org">${esc(e.org)}</p>
          <ul>${e.points.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
        </div>
      </article>`).join('')}
    </div>
  </div>
</section>`;
}

function skills() {
  return `<section class="section" id="skills">
  <div class="wrap">
    ${sec('Toolkit', 'Skills &amp; <em>strengths</em>')}
    <div class="skills">
      ${P.skills.map(s => `<article class="skill card reveal"><span class="skill-ic">${icon(s.icon)}</span><h3>${esc(s.group)}</h3><div class="tags">${s.items.map(x => `<span>${esc(x)}</span>`).join('')}</div></article>`).join('')}
    </div>
    <h3 class="sub reveal">Key strengths</h3>
    <ul class="strengths reveal">${P.strengths.map(x => `<li>${icon('sparkle')} ${esc(x)}</li>`).join('')}</ul>
  </div>
</section>`;
}

function education() {
  const certs = (P.certificates || []);
  return `<section class="section alt" id="education">
  <div class="wrap edu-grid">
    <div>
      ${sec('Education', 'Where I <em>learned</em>')}
      ${P.education.map(e => `<article class="edu card reveal">
        <span class="edu-period">${esc(e.period)}</span>
        <h3>${esc(e.degree)}</h3>
        <p class="xp-org">${esc(e.institution)} · <span class="muted">${esc(e.location)}</span></p>
        <ul class="ticks">${e.details.map(d => `<li>${icon('check')} ${esc(d)}</li>`).join('')}</ul>
      </article>`).join('')}
    </div>
    <div>
      ${sec('Recognition', '<em>Achievements</em>')}
      ${P.achievements.map(a => `<article class="ach card reveal"><span class="ach-ic">${icon('trophy')}</span><div><h3>${esc(a.title)}</h3><p>${esc(a.text)}</p></div></article>`).join('')}
      ${certs.length ? `<h3 class="sub reveal">Certificates</h3>${certs.map(c => `<article class="ach card reveal"><span class="ach-ic">${icon('check')}</span><div><h3>${esc(c.title)}</h3><p>${esc(c.issuer)}${c.date ? ' · ' + esc(c.date) : ''}${c.url ? ` · <a href="${esc(c.url)}" target="_blank" rel="noopener">Verify</a>` : ''}</p></div></article>`).join('')}` : ''}
    </div>
  </div>
</section>`;
}

function contact() {
  return `<section class="section" id="contact">
  <div class="wrap">
    <div class="contact card reveal">
      <div class="contact-copy">
        <span class="kicker">Contact</span>
        <h2>Have a product that needs a <em>thoughtful</em> design?</h2>
        <p class="lead">I am open to UI/UX design roles, freelance work and collaborations. Let’s talk.</p>
        <div class="cta">
          <a class="btn btn-dark" href="mailto:${esc(P.email)}?subject=${encodeURIComponent('Design opportunity')}">${icon('mail')} Say hello</a>
          ${P.cvPdf ? `<a class="btn btn-line" href="/${esc(P.cvPdf)}" download>${icon('download')} Download CV</a>` : ''}
        </div>
      </div>
      <div class="contact-side">
        <ul class="contact-list">
          <li><span>${icon('mail')}</span><div><small>Email</small><a href="mailto:${esc(P.email)}">${esc(P.email)}</a></div></li>
          <li><span>${icon('phone')}</span><div><small>Phone</small><a href="tel:${esc(P.phone.replace(/[^+\d]/g, ''))}">${esc(P.phone)}</a></div></li>
          <li><span>${icon('pin')}</span><div><small>Location</small>${esc(P.location)}</div></li>
        </ul>
        <div class="profiles" id="profiles">
          ${P.profiles.list.map(p => `<a class="prof" href="${esc(p.url)}" target="_blank" rel="noopener" title="${esc(p.name)}">${badge(p.icon)}<span>${esc(p.name)}</span></a>`).join('')}
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function jsonLd() {
  const same = P.profiles.list.map(p => p.url).filter(u => !/^https?:\/\/[^/]+\/?(community)?$/.test(u));
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Person', name: P.name, url: BASE + '/', image: BASE + '/' + P.photo,
    email: 'mailto:' + P.email, jobTitle: P.role,
    alumniOf: P.education.map(e => ({ '@type': 'CollegeOrUniversity', name: e.institution })),
    knowsAbout: ['UI design', 'UX design', 'Figma', 'Prototyping', 'Accessibility', 'Responsive design'],
    address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' }, sameAs: same
  }).replace(/</g, '\\u003c')}</script>`;
}

function homePage() {
  return head({
    title: `${P.name} — ${P.role} | Portfolio`,
    description: `${P.name}, ${P.role}. ${P.tagline} B.Sc. in CSE from United International University. Creator of the award-winning UniVerseHub.`,
    canonical: '/', extra: jsonLd()
  }) + `
<body>
<a class="skip" href="#about">Skip to content</a>
${bg}
<div class="progress" id="progress"></div>
${header(true)}
<main>
${hero()}
${about()}
${processSec()}
${work()}
${experience()}
${skills()}
${education()}
${contact()}
</main>
${footer()}
<button class="to-top icon-btn" id="toTop" aria-label="Back to top">${icon('up')}</button>
<script src="/assets/app.js?v=${V}" defer></script>
</body>
</html>`;
}

function notFound() {
  return head({ title: `Page not found — ${P.name}`, description: 'Page not found', canonical: '/404.html' }) + `
<body>
${bg}
${header(false)}
<main class="nf"><div class="card nf-card"><span class="kicker">Error 404</span><h1>This frame is <em>empty</em>.</h1><p class="lead">The page you are looking for does not exist.</p><a class="btn btn-dark" href="/">Back to the portfolio ${icon('arrow')}</a></div></main>
${footer()}
<script src="/assets/app.js?v=${V}" defer></script>
</body></html>`;
}

/* ---------- build ---------- */
if (!fs.existsSync(path.join(ROOT, 'public', P.photo))) { console.error('Missing photo: public/' + P.photo); process.exit(1); }
fs.mkdirSync(OUT, { recursive: true });
clean(OUT);
copyDir(path.join(ROOT, 'public'), OUT);
copyDir(path.join(ROOT, 'src'), path.join(OUT, 'assets'));
fs.renameSync(path.join(OUT, 'assets', 'favicon.svg'), path.join(OUT, 'favicon.svg'));
write('index.html', homePage());
write('404.html', notFound());
write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${BASE}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${BASE}/</loc><lastmod>${BUILD_DATE}</lastmod></url>\n</urlset>\n`);
console.log(`Built portfolio → site/  (${P.experience.length} roles, ${P.projects.length} project, ${P.skills.length} skill groups)`);
