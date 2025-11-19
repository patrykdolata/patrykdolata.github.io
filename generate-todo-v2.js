#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read schedule data
const schedulePath = path.join(__dirname, '.todo-schedule.json');
const scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));

// Calculate current date
const today = new Date();
const todayStr = today.toISOString().split('T')[0];

// Calculate statistics
const schedule = scheduleData.schedule;
const completedTasks = schedule.filter(t => t.status === 'completed').length;
const totalTasks = schedule.length;
const progressPercent = ((completedTasks / totalTasks) * 100).toFixed(1);

// Find overdue tasks (pending tasks with plannedDate < today)
const overdueTasks = schedule.filter(t =>
  t.status === 'pending' && t.plannedDate && t.plannedDate < todayStr
);
const overdueHours = overdueTasks.reduce((sum, t) => sum + t.estimateHours, 0);

// Find upcoming tasks (next 7 days)
const nextWeekDate = new Date(today);
nextWeekDate.setDate(nextWeekDate.getDate() + 7);
const nextWeekStr = nextWeekDate.toISOString().split('T')[0];

const upcomingTasks = schedule.filter(t =>
  t.status === 'pending' && t.plannedDate && t.plannedDate >= todayStr && t.plannedDate <= nextWeekStr
);

// Calculate days remaining until deadline
const deadlineDate = new Date(scheduleData.meta.estimatedEndDate);
const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
const weeksRemaining = Math.ceil(daysRemaining / 7);

// Format date (Polish format)
function formatDate(dateStr) {
  const months = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// Calculate days overdue
function daysOverdue(plannedDate) {
  const planned = new Date(plannedDate);
  const diff = Math.floor((today - planned) / (1000 * 60 * 60 * 24));
  return diff;
}

// Group tasks by feature for roadmap
const featureGroups = {};
schedule.forEach(task => {
  if (!featureGroups[task.feature]) {
    featureGroups[task.feature] = {
      tasks: [],
      completed: 0,
      total: 0
    };
  }
  featureGroups[task.feature].tasks.push(task);
  featureGroups[task.feature].total++;
  if (task.status === 'completed') {
    featureGroups[task.feature].completed++;
  }
});

// Determine feature status
function getFeatureStatus(feature) {
  const group = featureGroups[feature];
  if (group.completed === group.total) return { badge: 'ZROBIONE', class: 'green' };
  if (group.completed > 0) return { badge: 'W TRAKCIE', class: 'red' };
  return { badge: 'DO ZROBIENIA', class: '' };
}

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meet App - Roadmap & Status</title>
    <style>
        :root {
            --bg-body: #0f172a;
            --bg-card: #1e293b;
            --bg-header: #1e293b;
            --text-main: #f1f5f9;
            --text-muted: #94a3b8;
            --accent: #3b82f6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --border: #334155;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background-color: var(--bg-body);
            color: var(--text-main);
            line-height: 1.6;
            padding-bottom: 50px;
        }

        /* Header */
        header {
            background-color: var(--bg-header);
            padding: 1.5rem 2rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        h1 { font-size: 1.5rem; font-weight: 700; }
        .tag {
            background: rgba(59, 130, 246, 0.1);
            color: var(--accent);
            padding: 4px 12px;
            border-radius: 99px;
            font-size: 0.85rem;
            font-weight: 600;
            border: 1px solid rgba(59, 130, 246, 0.2);
        }

        /* Back button */
        .back-button {
            position: fixed;
            top: 20px;
            left: 20px;
            background: var(--bg-card);
            color: var(--accent);
            padding: 0.5rem 1rem;
            border-radius: 99px;
            text-decoration: none;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            font-weight: 600;
            transition: all 0.2s;
            z-index: 100;
            border: 1px solid var(--border);
        }

        .back-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0,0,0,0.4);
        }

        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        /* KPI Grid */
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: var(--bg-card);
            padding: 1.5rem;
            border-radius: 12px;
            border: 1px solid var(--border);
        }

        .stat-title { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 0.5rem; }
        .stat-value { font-size: 1.8rem; font-weight: 700; }
        .stat-desc { font-size: 0.85rem; margin-top: 0.5rem; }
        .text-success { color: var(--success); }
        .text-danger { color: var(--danger); }
        .text-warning { color: var(--warning); }

        /* Progress Bar */
        .progress-container {
            background: #334155;
            border-radius: 99px;
            height: 10px;
            width: 100%;
            margin-top: 10px;
            overflow: hidden;
        }
        .progress-bar {
            height: 100%;
            background: linear-gradient(90deg, var(--accent), var(--success));
            width: 0%;
            transition: width 1s ease-in-out;
        }

        /* Main Layout */
        .dashboard-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 2rem;
        }

        @media (max-width: 900px) {
            .dashboard-grid { grid-template-columns: 1fr; }
        }

        h2 {
            font-size: 1.2rem;
            margin-bottom: 1rem;
            border-left: 4px solid var(--accent);
            padding-left: 10px;
        }

        /* List Styles */
        .task-list { list-style: none; }
        .task-item {
            background: var(--bg-card);
            margin-bottom: 0.75rem;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .task-item.overdue { border-left: 4px solid var(--danger); }
        .task-item.upcoming { border-left: 4px solid var(--accent); }

        .task-content { flex-grow: 1; }
        .task-title { font-weight: 500; display: block; }
        .task-meta { font-size: 0.8rem; color: var(--text-muted); display: block; margin-top: 4px; }

        /* Accordion for Roadmap */
        details {
            background: var(--bg-card);
            margin-bottom: 1rem;
            border-radius: 8px;
            border: 1px solid var(--border);
            overflow: hidden;
        }

        summary {
            padding: 1rem;
            cursor: pointer;
            font-weight: 600;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(255,255,255,0.03);
        }

        summary:hover { background: rgba(255,255,255,0.05); }
        summary::after { content: '+'; font-size: 1.2rem; }
        details[open] summary::after { content: '-'; }
        details[open] summary { border-bottom: 1px solid var(--border); }

        .feature-content { padding: 1rem; }

        .sub-task {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .sub-task:last-child { border-bottom: none; }

        .status-icon { font-size: 1.1rem; min-width: 24px; }
        .status-done { color: var(--success); }
        .status-todo { color: var(--text-muted); opacity: 0.5; }
        .status-warn { color: var(--warning); }

        /* Helper Classes */
        .badge {
            font-size: 0.75rem;
            padding: 2px 8px;
            border-radius: 4px;
            background: #334155;
            color: white;
        }
        .badge.red { background: rgba(239, 68, 68, 0.2); color: var(--danger); }
        .badge.green { background: rgba(16, 185, 129, 0.2); color: var(--success); }
        .badge.yellow { background: rgba(245, 158, 11, 0.2); color: var(--warning); }
    </style>
</head>
<body>

<a href="index.html" class="back-button">← Wróć</a>

<header>
    <div>
        <h1>Meet App Implementation</h1>
        <p style="color: var(--text-muted); font-size: 0.9rem;">Backend (Spring Boot) • Frontend (Flutter)</p>
    </div>
    <div class="tag">Milestone 1: MVP</div>
</header>

<div class="container">

    <!-- KPI Stats -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-title">Postęp Milestone 1</div>
            <div class="stat-value text-success">${progressPercent}%</div>
            <div class="progress-container">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Deadline</div>
            <div class="stat-value">${formatDate(scheduleData.meta.estimatedEndDate)}</div>
            <div class="stat-desc">Pozostało ok. ${weeksRemaining} tyg.</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Zaległości (Overdue)</div>
            <div class="stat-value ${overdueHours > 0 ? 'text-danger' : 'text-success'}">${overdueHours}h</div>
            <div class="stat-desc">${overdueTasks.length} zadań${overdueTasks.length > 0 ? ' krytycznych' : ''}</div>
        </div>
        <div class="stat-card">
            <div class="stat-title">Velocity Target</div>
            <div class="stat-value">${scheduleData.meta.weeklyHours}h</div>
            <div class="stat-desc">na tydzień</div>
        </div>
    </div>

    <div class="dashboard-grid">

        <!-- LEFT COLUMN: Action Items -->
        <div class="action-column">
            <h2 style="border-color: var(--danger);">⚠️ Zaległe (Priorytet)</h2>
            <ul class="task-list">
${overdueTasks.length === 0 ? `                <li class="task-item">
                    <div class="task-content">
                        <span class="task-title" style="color: var(--success);">✅ Brak zaległości!</span>
                        <span class="task-meta">Wszystkie zadania są na bieżąco</span>
                    </div>
                </li>
` : overdueTasks.slice(0, 10).map(task => `                <li class="task-item overdue">
                    <div class="task-content">
                        <span class="task-title">${task.task.substring(0, 50)}${task.task.length > 50 ? '...' : ''}</span>
                        <span class="task-meta">${task.subsection} • ${daysOverdue(task.plannedDate)} dni po terminie</span>
                    </div>
                </li>
`).join('')}            </ul>

            <h2 style="border-color: var(--accent); margin-top: 2rem;">📅 Najbliższy tydzień</h2>
            <ul class="task-list">
${upcomingTasks.length === 0 ? `                <li class="task-item">
                    <div class="task-content">
                        <span class="task-title">Brak zaplanowanych zadań</span>
                        <span class="task-meta">Dodaj nowe zadania do harmonogramu</span>
                    </div>
                </li>
` : upcomingTasks.slice(0, 10).map(task => `                <li class="task-item upcoming">
                    <div class="task-content">
                        <span class="task-title">${task.task.substring(0, 50)}${task.task.length > 50 ? '...' : ''}</span>
                        <span class="task-meta">${formatDate(task.plannedDate)} • ${task.subsection}</span>
                    </div>
                </li>
`).join('')}            </ul>
        </div>

        <!-- RIGHT COLUMN: Roadmap -->
        <div class="roadmap-column">
            <h2>📍 Mapa Funkcjonalności</h2>

${Object.keys(featureGroups).map(featureName => {
  const group = featureGroups[featureName];
  const status = getFeatureStatus(featureName);
  const isOpen = status.badge === 'W TRAKCIE' ? ' open' : '';

  return `            <!-- ${featureName} -->
            <details${isOpen}>
                <summary>${featureName} <span class="badge ${status.class}">${status.badge}</span></summary>
                <div class="feature-content">
${group.tasks.slice(0, 10).map(task => {
  const icon = task.status === 'completed' ? '✅' : task.status === 'maybe' ? '⚠️' : '○';
  const statusClass = task.status === 'completed' ? 'status-done' : task.status === 'maybe' ? 'status-warn' : 'status-todo';
  return `                    <div class="sub-task"><span class="status-icon ${statusClass}">${icon}</span> ${task.task}</div>`;
}).join('\n')}
${group.tasks.length > 10 ? `                    <div class="sub-task" style="color: var(--text-muted); font-style: italic;">... i ${group.tasks.length - 10} więcej zadań</div>` : ''}
                </div>
            </details>
`;
}).join('\n')}
        </div>
    </div>
</div>

</body>
</html>
`;

// Write to TODO.html
const outputPath = path.join(__dirname, 'TODO.html');
fs.writeFileSync(outputPath, html, 'utf8');

console.log('✅ TODO.html wygenerowany pomyślnie używając szablonu TODO2.html!');
console.log(`📊 Postęp: ${progressPercent}% (${completedTasks}/${totalTasks} zadań)`);
console.log(`⚠️  Zaległości: ${overdueTasks.length} zadań (${overdueHours}h)`);
console.log(`📅 Najbliższy tydzień: ${upcomingTasks.length} zadań`);
console.log(`🎯 Deadline: ${scheduleData.meta.estimatedEndDate} (${weeksRemaining} tyg. pozostało)`);
