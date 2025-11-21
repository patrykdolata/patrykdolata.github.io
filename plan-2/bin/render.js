#!/usr/bin/env node

/**
 * plan-2 HTML generator
 * - Reads plan-2/TODO.md (parsed via parse-todo)
 * - Produces a lightweight TODO.html in plan-2/
 */

const fs = require('fs');
const path = require('path');
const { parseTodo, summarize } = require('../lib/parse-todo');

const projectRoot = path.join(__dirname, '..');
const todoPath = path.join(projectRoot, 'TODO.md');
const outPath = path.join(projectRoot, 'TODO.html');

function groupTasks(tasks) {
  const byFeature = {};
  for (const task of tasks) {
    if (!byFeature[task.feature]) byFeature[task.feature] = {};
    if (!byFeature[task.feature][task.subsection]) byFeature[task.feature][task.subsection] = [];
    byFeature[task.feature][task.subsection].push(task);
  }
  return byFeature;
}

function buildFeatureStats(grouped) {
  const stats = {};
  for (const [feature, subs] of Object.entries(grouped)) {
    let done = 0;
    let total = 0;
    for (const items of Object.values(subs)) {
      total += items.length;
      done += items.filter(t => t.status === 'done').length;
    }
    const pct = total ? Math.round((done / total) * 100) : 0;
    stats[feature] = { done, total, pct };
  }
  return stats;
}

function buildSubStats(subs) {
  const stats = {};
  for (const [sub, items] of Object.entries(subs)) {
    const total = items.length;
    const done = items.filter(t => t.status === 'done').length;
    const pct = total ? Math.round((done / total) * 100) : 0;
    stats[sub] = { done, total, pct };
  }
  return stats;
}

function statusClass(status) {
  if (status === 'done') return 'done';
  if (status === 'maybe') return 'maybe';
  return 'pending';
}

function cleanText(text) {
  // Strip leading emojis / extra checkmarks from task text for display
  return text.replace(/^[✅❔⬜️\-\s]+/, '').trim();
}

function renderHtml(tasks) {
  const summary = summarize(tasks);
  const grouped = groupTasks(tasks);
  const featureStats = buildFeatureStats(grouped);
  const subStats = {};
  for (const [feature, subs] of Object.entries(grouped)) {
    subStats[feature] = buildSubStats(subs);
  }
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
  const progress = parseFloat(summary.percent) || 0;

  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <title>TODO Dashboard (plan-2)</title>
  <style>
    :root {
      --bg: linear-gradient(135deg, #0f172a 0%, #111827 100%);
      --panel: #0b1220;
      --card: #0f172a;
      --card-2: #111d37;
      --fg: #e2e8f0;
      --muted: #94a3b8;
      --fg-strong: #f8fafc;
      --border: #1f2937;
      --accent: #30bced;
      --accent-2: #7c3aed;
      --done: #22c55e;
      --pending: #f87171;
      --maybe: #f59e0b;
      --shadow: 0 12px 30px rgba(0,0,0,0.25);
      --radius: 14px;
      --font: 'Space Grotesk', 'Inter', system-ui, -apple-system, sans-serif;
    }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: var(--font); background: var(--bg); color: var(--fg); }
    .page { max-width: 1200px; margin: 40px auto; padding: 0 22px 40px; }
    h1 { margin: 0; font-size: 32px; letter-spacing: -0.02em; }
    h2 { margin: 0 0 6px 0; font-size: 20px; letter-spacing: -0.01em; color: var(--fg-strong); }
    h3 { margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: var(--muted); }

    .topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .meta { color: var(--muted); font-size: 13px; }

    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin: 20px 0 18px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); }
    .card-ghost { background: transparent; border: 1px dashed var(--border); color: var(--muted); }
    .stat-value { font-size: 30px; font-weight: 700; color: var(--fg-strong); }
    .stat-label { color: var(--muted); font-size: 13px; }

    .progress-wrap { background: var(--card-2); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); margin-bottom: 20px; }
    .progress-bar { position: relative; width: 100%; height: 12px; background: #0b1220; border-radius: 999px; overflow: hidden; border: 1px solid var(--border); }
    .progress-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 999px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }

    .feature { margin-bottom: 18px; }
    .feature-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
    .feature-chip { display: inline-flex; gap: 8px; align-items: center; font-size: 12px; color: var(--muted); }
    .pill { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; padding: 4px 10px; border-radius: 999px; border: 1px solid var(--border); color: var(--muted); }
    .pill.done { color: var(--done); border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.08); }
    .pill.pending { color: var(--pending); border-color: rgba(248,113,113,0.35); background: rgba(248,113,113,0.08); }
    .pill.maybe { color: var(--maybe); border-color: rgba(245,158,11,0.35); background: rgba(245,158,11,0.08); }

    .subsection { margin: 10px 0 6px; }
    .task-list { display: grid; gap: 6px; }
    .task { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--border); background: var(--panel); }
    .task.done { border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.08); }
    .task.pending { border-color: rgba(248,113,113,0.25); background: rgba(248,113,113,0.06); }
    .task.maybe { border-color: rgba(245,158,11,0.25); background: rgba(245,158,11,0.06); }
    .task .title { flex: 1; }
    .task .meta { font-size: 12px; }

    details { border: 1px solid var(--border); border-radius: var(--radius); background: var(--panel); box-shadow: var(--shadow); }
    details summary { cursor: pointer; padding: 12px 14px; list-style: none; display: flex; justify-content: space-between; align-items: center; }
    details summary::-webkit-details-marker { display: none; }
    details .body { padding: 0 14px 12px; }

    .badge-dot { width: 10px; height: 10px; border-radius: 999px; display: inline-block; }
    .dot-done { background: var(--done); }
    .dot-pending { background: var(--pending); }
    .dot-maybe { background: var(--maybe); }

    .timestamp { color: var(--muted); font-size: 12px; text-align: right; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="page">
    <div class="topbar">
      <div>
        <h1>TODO Dashboard (plan-2)</h1>
        <div class="meta">Źródło: plan-2/TODO.md · Zaktualizowano: ${now}</div>
      </div>
      <div class="pill">Postęp: ${summary.percent}%</div>
    </div>

    <div class="summary">
      <div class="card">
        <div class="stat-value">${summary.done}/${summary.total}</div>
        <div class="stat-label">Ukończone</div>
      </div>
      <div class="card">
        <div class="stat-value">${summary.pending}</div>
        <div class="stat-label">Do zrobienia</div>
      </div>
      <div class="card">
        <div class="stat-value">${summary.maybe}</div>
        <div class="stat-label">Do weryfikacji</div>
      </div>
      <div class="card">
        <div class="stat-value">${summary.percent}%</div>
        <div class="stat-label">Postęp całkowity</div>
      </div>
    </div>

    <div class="progress-wrap">
      <div class="feature-header">
        <h3>Postęp ogólny</h3>
        <span class="meta">${summary.done} / ${summary.total} zadań</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${progress}%;"></div>
      </div>
    </div>

    ${Object.entries(grouped).map(([feature, subs]) => {
      const featureOpen = featureStats[feature].pct === 100 ? '' : 'open';
      return `
        <details class="feature" ${featureOpen}>
          <summary>
            <div class="feature-header">
              <h2>${feature}</h2>
              <div class="feature-chip">
                <span class="pill">${featureStats[feature].done}/${featureStats[feature].total}</span>
                <span class="pill ${featureStats[feature].pct === 100 ? 'done' : featureStats[feature].pct === 0 ? 'pending' : ''}">${featureStats[feature].pct}%</span>
              </div>
            </div>
          </summary>
          <div class="body">
          ${Object.entries(subs).map(([sub, items]) => {
            const subOpen = subStats[feature][sub].pct === 100 ? '' : 'open';
            return `
              <details class="subsection" ${subOpen}>
                <summary>
                  <span class="pill">${sub}</span>
                  <span class="pill ${subStats[feature][sub].pct === 100 ? 'done' : subStats[feature][sub].pct === 0 ? 'pending' : ''}">${subStats[feature][sub].done}/${subStats[feature][sub].total} · ${subStats[feature][sub].pct}%</span>
                </summary>
                <div class="body task-list">
                  ${items.map(t => `
                    <div class="task ${statusClass(t.status)}">
                      <span class="badge-dot ${statusClass(t.status) === 'done' ? 'dot-done' : statusClass(t.status) === 'maybe' ? 'dot-maybe' : 'dot-pending'}"></span>
                      <span class="title">${cleanText(t.text)}${t.estimate ? ` (${t.estimate})` : ''}</span>
                      <span class="meta">${t.status === 'done' ? 'Zrobione' : t.status === 'maybe' ? 'Do weryfikacji' : 'Do zrobienia'}</span>
                    </div>
                  `).join('')}
                </div>
              </details>
            `;
          }).join('')}
          </div>
        </details>
      `;
    }).join('')}
    <div class="timestamp">plan-2 · generated at ${now}</div>
  </div>
</body>
</html>`;
}

function main() {
  const tasks = parseTodo(todoPath);
  const html = renderHtml(tasks);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`✅ Generated ${outPath}`);
}

main();
