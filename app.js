/* =====================================================
   PORTFOLIO — app.js
   Fetches GitHub data for salim-web and renders:
   • Hero stats & avatar
   • Project cards
   • Contribution heatmap (from public events)
   ===================================================== */

// ── CONFIGURATION ──────────────────────────────────────
const GITHUB_USER = 'salim-web';

// Fill these in when you're ready:
const SOCIAL_LINKS = {
  github:   `https://github.com/${GITHUB_USER}`,
  x:        '#',          // e.g. 'https://x.com/yourhandle'
  linkedin: '#',          // e.g. 'https://linkedin.com/in/yourname'
};

// Language → colour map (extend as needed)
const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  HTML:       '#e34c26',
  CSS:        '#563d7c',
  Rust:       '#dea584',
  Go:         '#00ADD8',
  Java:       '#b07219',
  'C++':      '#f34b7d',
  C:          '#555555',
  Shell:      '#89e051',
  Vue:        '#41b883',
  Svelte:     '#ff3e00',
  Kotlin:     '#A97BFF',
  Swift:      '#fa7343',
  Dart:       '#00B4AB',
};

// ── HELPERS ────────────────────────────────────────────
const $ = id => document.getElementById(id);
const API = path => `https://api.github.com/${path}`;

async function fetchJSON(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);
  const years  = Math.floor(days / 365);
  if (years  > 0)  return `${years}y ago`;
  if (months > 0)  return `${months}mo ago`;
  if (days   > 0)  return `${days}d ago`;
  if (hours  > 0)  return `${hours}h ago`;
  return `${mins}m ago`;
}

// ── SOCIAL LINKS ───────────────────────────────────────
function applyLinks() {
  const gh = $('link-github');
  const x  = $('link-x');
  const li = $('link-linkedin');
  if (gh) gh.href = SOCIAL_LINKS.github;
  if (x)  x.href  = SOCIAL_LINKS.x;
  if (li) li.href = SOCIAL_LINKS.linkedin;
}

// ── HERO ───────────────────────────────────────────────
async function loadProfile() {
  const data = await fetchJSON(API(`users/${GITHUB_USER}`));

  // Avatar
  const avatar = $('gh-avatar');
  if (avatar) {
    avatar.src = data.avatar_url;
    avatar.alt = data.name || GITHUB_USER;
  }

  // Stats
  const setNum = (id, val) => {
    const el = document.querySelector(`#${id} .stat-num`);
    if (el) el.textContent = val;
  };
  setNum('stat-repos',     data.public_repos ?? 0);
  setNum('stat-followers', data.followers     ?? 0);
  setNum('stat-following', data.following     ?? 0);
}

// ── PROJECTS ───────────────────────────────────────────
function langColor(lang) {
  return LANG_COLORS[lang] || '#8b949e';
}

function buildProjectCard(repo, delay) {
  const card = document.createElement('a');
  card.href   = repo.html_url;
  card.target = '_blank';
  card.rel    = 'noopener';
  card.className = 'project-card';
  card.style.animationDelay = `${delay * 0.1}s`;

  const desc = repo.description || 'No description provided.';
  const lang = repo.language || 'Unknown';
  const color = langColor(lang);
  const updated = timeAgo(repo.updated_at);

  card.innerHTML = `
    <div class="project-header">
      <span class="project-name">${repo.name}</span>
      <svg class="project-link-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
        <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    </div>
    <p class="project-desc">${desc}</p>
    <div class="project-footer">
      <span class="lang-badge">
        <span class="lang-dot" style="background:${color}"></span>
        ${lang}
      </span>
      <div class="project-meta">
        <span class="meta-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          ${repo.stargazers_count}
        </span>
        <span class="meta-chip">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          ${updated}
        </span>
      </div>
    </div>
  `;
  return card;
}

async function loadProjects() {
  const grid = $('projects-grid');
  if (!grid) return;

  const repos = await fetchJSON(API(`users/${GITHUB_USER}/repos?sort=updated&per_page=100`));

  // Clear skeleton
  grid.innerHTML = '';

  if (!repos.length) {
    grid.innerHTML = '<p style="color:var(--text-muted)">No public repositories found.</p>';
    return;
  }

  repos.forEach((repo, i) => {
    grid.appendChild(buildProjectCard(repo, i));
  });

  // Trigger reveal for cards that are now in view
  observeReveal();
}

// ── CONTRIBUTION HEATMAP ───────────────────────────────
async function loadHeatmap() {
  const grid = $('heatmap-grid');
  if (!grid) return;

  // Build a 52-week (364 day) date map initialised to 0
  const DAYS = 364;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayMap = {};
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - (DAYS - 1 - i));
    dayMap[d.toISOString().slice(0, 10)] = 0;
  }

  // Fetch up to 300 public events (3 pages of 100)
  const pages = [1, 2, 3];
  const fetches = pages.map(p =>
    fetchJSON(API(`users/${GITHUB_USER}/events/public?per_page=100&page=${p}`))
      .catch(() => [])
  );
  const allEvents = (await Promise.all(fetches)).flat();

  allEvents.forEach(ev => {
    const key = (ev.created_at || '').slice(0, 10);
    if (key in dayMap) dayMap[key]++;
  });

  // Compute max for normalisation
  const max = Math.max(1, ...Object.values(dayMap));

  // Render cells
  grid.innerHTML = '';

  // Pad the start so first column aligns to correct weekday
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - (DAYS - 1));
  const startDow = firstDay.getDay(); // 0=Sun … 6=Sat

  for (let pad = 0; pad < startDow; pad++) {
    const ghost = document.createElement('div');
    ghost.style.visibility = 'hidden';
    ghost.className = 'hm-cell';
    grid.appendChild(ghost);
  }

  Object.entries(dayMap).forEach(([date, count]) => {
    const cell = document.createElement('div');
    cell.className = 'hm-cell';

    let level = 0;
    if (count > 0) {
      const ratio = count / max;
      if      (ratio > 0.75) level = 4;
      else if (ratio > 0.5)  level = 3;
      else if (ratio > 0.25) level = 2;
      else                   level = 1;
    }
    cell.dataset.level = level;
    cell.title = `${date}: ${count} event${count !== 1 ? 's' : ''}`;
    grid.appendChild(cell);
  });
}

// ── SCROLL REVEAL ──────────────────────────────────────
function observeReveal() {
  const io = new IntersectionObserver(
    entries => entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    }),
    { threshold: 0.1 }
  );
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

// ── NAVBAR SHADOW ON SCROLL ────────────────────────────
window.addEventListener('scroll', () => {
  const nb = $('navbar');
  if (nb) {
    nb.style.boxShadow = window.scrollY > 10
      ? '0 2px 24px rgba(0,0,0,0.5)'
      : 'none';
  }
}, { passive: true });

// ── INIT ───────────────────────────────────────────────
async function init() {
  applyLinks();
  observeReveal();

  try { await loadProfile(); } catch (e) { console.warn('Profile load failed:', e); }
  try { await loadProjects(); } catch (e) {
    console.warn('Projects load failed:', e);
    const grid = $('projects-grid');
    if (grid) grid.innerHTML = '<p style="color:var(--text-muted)">Could not load repositories. Please try again later.</p>';
  }
  try { await loadHeatmap(); } catch (e) { console.warn('Heatmap load failed:', e); }
}

document.addEventListener('DOMContentLoaded', init);
