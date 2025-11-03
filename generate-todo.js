#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read TODO.md
const todoMdPath = path.join(__dirname, 'TODO.md');
const todoMdContent = fs.readFileSync(todoMdPath, 'utf8');

// Parse TODO.md
function parseTodoMd(content) {
  const lines = content.split('\n');
  const features = [];
  let currentFeature = null;
  let currentSubsection = null;

  const stats = {
    done: 0,
    maybe: 0,
    pending: 0,
    total: 0
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Feature header (## Sprint X / Feature X / Sprint: etc.)
    if (line.match(/^## (Sprint|Feature|Przyszłe|Harmonogram)/)) {
      const match = line.match(/^## (.+?)(?:\s+\(~?(.+?)\))?$/);
      if (match) {
        currentFeature = {
          title: match[1],
          duration: match[2] || '',
          description: '',
          subsections: [],
          priority: determinePriority(line)
        };
        features.push(currentFeature);
        currentSubsection = null;
      }
    }
    // Description line (> **Cel:**)
    else if (line.match(/^>\s*\*\*Cel:\*\*/)) {
      if (currentFeature) {
        currentFeature.description = line.replace(/^>\s*\*\*Cel:\*\*\s*/, '');
      }
    }
    // Subsection (### Backend - ...)
    else if (line.match(/^### /)) {
      const match = line.match(/^### (.+?)(?:\s+\(~?(.+?)\))?$/);
      if (match && currentFeature) {
        currentSubsection = {
          title: match[1],
          duration: match[2] || '',
          tasks: []
        };
        currentFeature.subsections.push(currentSubsection);
      }
    }
    // Task line (- [x] / [?] / [ ])
    else if (line.match(/^- \[([ x?])\]/)) {
      const match = line.match(/^- \[([ x?])\]\s+(.+?)(?:\s+\*\*\[~(.+?)\]\*\*)?$/);
      if (match && currentSubsection) {
        const status = match[1] === 'x' ? 'done' : match[1] === '?' ? 'maybe' : 'pending';
        const task = {
          status: status,
          text: match[2],
          estimate: match[3] || '',
          subtasks: []
        };
        currentSubsection.tasks.push(task);

        // Update stats
        stats[status]++;
        stats.total++;
      }
    }
    // Nested task (bullet point with indent - no checkbox)
    else if (line.match(/^  - /)) {
      const subtaskText = line.replace(/^  - /, '').trim();
      if (currentSubsection && currentSubsection.tasks.length > 0) {
        const lastTask = currentSubsection.tasks[currentSubsection.tasks.length - 1];
        lastTask.subtasks.push(subtaskText);
      }
    }
  }

  return { features, stats };
}

function determinePriority(line) {
  if (line.includes('CRITICAL') || line.includes('Sprint 0') || line.includes('Feature 1') || line.includes('Feature 2') || line.includes('Feature 3')) {
    return 'critical';
  }
  if (line.includes('HIGH') || line.includes('Feature 4') || line.includes('Feature 5')) {
    return 'high';
  }
  return 'medium';
}

function generateHtml(features, stats) {
  // Calculate percentages
  const donePercent = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const maybePercent = stats.total > 0 ? Math.round((stats.maybe / stats.total) * 100) : 0;
  const pendingPercent = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0;

  // Adjust for rounding errors
  let total = donePercent + maybePercent + pendingPercent;
  if (total !== 100 && stats.total > 0) {
    const diff = 100 - total;
    if (pendingPercent > 0) {
      pendingPercent += diff;
    } else if (maybePercent > 0) {
      maybePercent += diff;
    } else {
      donePercent += diff;
    }
  }

  // Calculate completion percentage for badge
  const completionPercent = Math.round(((stats.done + stats.maybe * 0.5) / stats.total) * 100);

  let html = `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TODO - Meet App Implementation Plan</title>
  <link rel="stylesheet" href="css/design-system.css">
  <link rel="stylesheet" href="css/components.css">
  <style>
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: var(--space-2xl) var(--space-md);
    }

    .todo-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-2xl);
      padding: var(--space-2xl);
    }

    .todo-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
      padding-bottom: var(--space-xl);
      border-bottom: 2px solid var(--color-border);
    }

    .todo-header h1 {
      font-size: 2.5rem;
      color: var(--color-primary);
      margin-bottom: var(--space-md);
    }

    .todo-header .subtitle {
      font-size: 1.1rem;
      color: var(--color-text-secondary);
      margin-bottom: var(--space-sm);
    }

    /* Progress Bar */
    .progress-section {
      margin: var(--space-2xl) 0;
      padding: var(--space-xl);
      background: var(--color-background);
      border-radius: var(--radius-lg);
    }

    .progress-section h2 {
      color: var(--color-primary);
      margin-bottom: var(--space-md);
      text-align: center;
    }

    .progress-bar-container {
      background: #e5e7eb;
      border-radius: var(--radius-full);
      height: 40px;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
    }

    .progress-bar {
      display: flex;
      height: 100%;
      transition: all 0.3s ease;
    }

    .progress-segment {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.3s ease;
    }

    .progress-completed {
      background: linear-gradient(90deg, #10b981, #059669);
    }

    .progress-verified {
      background: linear-gradient(90deg, #f59e0b, #d97706);
    }

    .progress-pending {
      background: #9ca3af;
    }

    .progress-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--space-md);
      margin-top: var(--space-lg);
    }

    .progress-stat {
      text-align: center;
      padding: var(--space-md);
      background: white;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    .progress-stat-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: var(--space-xs);
    }

    .progress-stat-label {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    .stat-completed { color: #10b981; }
    .stat-verified { color: #f59e0b; }
    .stat-pending { color: #6b7280; }
    .stat-total { color: var(--color-primary); }

    .legend {
      display: flex;
      gap: var(--space-lg);
      justify-content: center;
      flex-wrap: wrap;
      margin-top: var(--space-lg);
      padding: var(--space-md);
      background: var(--color-background);
      border-radius: var(--radius-md);
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: var(--space-xs);
      font-size: 0.9rem;
    }

    .legend-checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-xs);
      display: inline-block;
      pointer-events: none;
    }

    .legend-checkbox.done {
      background: var(--color-success);
      border-color: var(--color-success);
      position: relative;
    }

    .legend-checkbox.done::after {
      content: '✓';
      position: absolute;
      color: white;
      font-weight: bold;
      left: 3px;
      top: -2px;
    }

    .legend-checkbox.maybe {
      background: var(--color-warning);
      border-color: var(--color-warning);
      position: relative;
    }

    .legend-checkbox.maybe::after {
      content: '?';
      position: absolute;
      color: white;
      font-weight: bold;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    }

    .feature-section {
      margin-bottom: var(--space-2xl);
    }

    .feature-header {
      background: linear-gradient(135deg, var(--color-primary), #5a67d8);
      color: white;
      padding: var(--space-lg);
      border-radius: var(--radius-md);
      margin-bottom: var(--space-lg);
      cursor: pointer;
      user-select: none;
      transition: all 0.2s;
    }

    .feature-header:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }

    .feature-header.priority-critical {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
    }

    .feature-header.priority-high {
      background: linear-gradient(135deg, #f59e0b, #d97706);
    }

    .feature-header h2 {
      margin: 0;
      font-size: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--space-sm);
    }

    .feature-badge {
      background: rgba(255, 255, 255, 0.2);
      padding: var(--space-xs) var(--space-md);
      border-radius: var(--radius-full);
      font-size: 0.9rem;
    }

    .feature-description {
      margin-top: var(--space-sm);
      font-size: 0.95rem;
      opacity: 0.95;
    }

    .subsection {
      margin-bottom: var(--space-xl);
      padding-left: var(--space-lg);
      border-left: 3px solid var(--color-primary);
    }

    .subsection h3 {
      color: var(--color-primary);
      margin-bottom: var(--space-md);
      font-size: 1.2rem;
      cursor: pointer;
      user-select: none;
    }

    .task-list {
      list-style: none;
      padding: 0;
    }

    .task-item {
      display: flex;
      align-items: flex-start;
      gap: var(--space-md);
      padding: var(--space-sm) 0;
      border-bottom: 1px solid var(--color-border-light);
    }

    .task-item:last-child {
      border-bottom: none;
    }

    .task-checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-xs);
      flex-shrink: 0;
      margin-top: 2px;
      pointer-events: none;
    }

    .task-checkbox.done {
      background: var(--color-success);
      border-color: var(--color-success);
      position: relative;
    }

    .task-checkbox.done::after {
      content: '✓';
      position: absolute;
      color: white;
      font-weight: bold;
      left: 3px;
      top: -2px;
      font-size: 14px;
    }

    .task-checkbox.maybe {
      background: var(--color-warning);
      border-color: var(--color-warning);
      position: relative;
    }

    .task-checkbox.maybe::after {
      content: '?';
      position: absolute;
      color: white;
      font-weight: bold;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      font-size: 14px;
    }

    .task-text {
      flex: 1;
      color: var(--color-text);
      line-height: 1.6;
    }

    .subtask-list {
      margin-top: var(--space-xs);
      margin-left: var(--space-lg);
      padding-left: var(--space-md);
      list-style: disc;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    .subtask-list li {
      padding: 2px 0;
      line-height: 1.5;
    }

    .task-estimate {
      color: var(--color-text-secondary);
      font-size: 0.85rem;
      font-weight: 600;
      background: var(--color-background);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      flex-shrink: 0;
    }

    .back-button {
      position: fixed;
      top: 20px;
      left: 20px;
      background: white;
      color: var(--color-primary);
      padding: var(--space-sm) var(--space-lg);
      border-radius: var(--radius-full);
      text-decoration: none;
      box-shadow: var(--shadow-lg);
      font-weight: 600;
      transition: all 0.2s;
      z-index: 100;
    }

    .back-button:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    }

    .collapsible::before {
      content: '▼';
      display: inline-block;
      margin-right: var(--space-xs);
      transition: transform 0.2s;
      font-size: 0.8em;
    }

    .collapsible.collapsed::before {
      transform: rotate(-90deg);
    }

    .collapsible-content {
      max-height: 10000px;
      overflow: hidden;
      transition: max-height 0.3s ease-out;
    }

    .collapsible-content.collapsed {
      max-height: 0;
    }

    /* Summary Section */
    .summary-section {
      margin-top: var(--space-2xl);
      padding: var(--space-2xl);
      background: white;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
    }

    .summary-section h2 {
      color: var(--color-primary);
      margin-bottom: var(--space-md);
      text-align: center;
      font-size: 2rem;
    }

    .summary-table {
      width: 100%;
      border-collapse: collapse;
      margin: var(--space-xl) 0;
      background: white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .summary-table thead {
      background: linear-gradient(135deg, #1e40af, #3b82f6);
    }

    .summary-table th {
      padding: var(--space-md) var(--space-lg);
      text-align: left;
      font-weight: 600;
      color: white;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #1e3a8a;
    }

    .summary-table tbody tr {
      border-bottom: 1px solid #e5e7eb;
      transition: all 0.2s ease;
    }

    .summary-table tbody tr:hover {
      background-color: #f0f9ff;
      transform: scale(1.001);
    }

    .summary-table tbody tr:nth-child(even) {
      background-color: #f9fafb;
    }

    .summary-table tbody tr:nth-child(even):hover {
      background-color: #f0f9ff;
    }

    .summary-table td {
      padding: var(--space-md) var(--space-lg);
      font-size: 0.95rem;
      color: var(--color-text);
    }

    .summary-table .summary-total {
      background: linear-gradient(135deg, #eff6ff, #dbeafe) !important;
      font-weight: 700;
      border-top: 3px solid var(--color-primary);
    }

    .summary-table .summary-total td {
      color: var(--color-primary);
      padding: var(--space-lg);
      font-size: 1.05rem;
    }

    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .status-done {
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      color: #065f46;
      border: 1px solid #6ee7b7;
    }

    .status-progress {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      border: 1px solid #fcd34d;
    }

    .status-todo {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      color: #991b1b;
      border: 1px solid #fca5a5;
    }

    @media (max-width: 768px) {
      .todo-container {
        padding: var(--space-lg);
      }

      .todo-header h1 {
        font-size: 1.8rem;
      }

      .progress-stats {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <a href="index.html" class="back-button">← Wróć</a>

  <div class="todo-container">
    <div class="todo-header">
      <h1>✅ Meet App - TODO Implementation Plan</h1>
      <p class="subtitle"><strong>Strategia:</strong> Feature-based development (Backend + Flutter razem)</p>
      <p class="subtitle" style="font-size: 0.95rem; color: var(--color-text);">
        <strong>Backend:</strong> meet-app-be (Spring Boot) • <strong>Frontend:</strong> meet-app-fe (Flutter)
      </p>

      <div class="legend">
        <div class="legend-item">
          <span class="legend-checkbox"></span>
          <span>Do zrobienia</span>
        </div>
        <div class="legend-item">
          <span class="legend-checkbox maybe"></span>
          <span>Do weryfikacji</span>
        </div>
        <div class="legend-item">
          <span class="legend-checkbox done"></span>
          <span>Potwierdzone ukończone</span>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-section">
      <h2>📊 Postęp Implementacji</h2>
      <div class="progress-bar-container">
        <div class="progress-bar">
          ${donePercent > 0 ? `<div class="progress-segment progress-completed" style="width: ${donePercent}%;" title="Ukończone (${donePercent}%)">${donePercent}%</div>` : ''}
          ${maybePercent > 0 ? `<div class="progress-segment progress-verified" style="width: ${maybePercent}%;" title="Do weryfikacji (${maybePercent}%)">${maybePercent}%</div>` : ''}
          ${pendingPercent > 0 ? `<div class="progress-segment progress-pending" style="width: ${pendingPercent}%;" title="Do zrobienia (${pendingPercent}%)">${pendingPercent}%</div>` : ''}
        </div>
      </div>
      <div class="progress-stats">
        <div class="progress-stat">
          <div class="progress-stat-value stat-completed">${stats.done}</div>
          <div class="progress-stat-label">Ukończone</div>
        </div>
        <div class="progress-stat">
          <div class="progress-stat-value stat-verified">${stats.maybe}</div>
          <div class="progress-stat-label">Do weryfikacji</div>
        </div>
        <div class="progress-stat">
          <div class="progress-stat-value stat-pending">${stats.pending}</div>
          <div class="progress-stat-label">Do zrobienia</div>
        </div>
        <div class="progress-stat">
          <div class="progress-stat-value stat-total">${stats.total}</div>
          <div class="progress-stat-label">Wszystkie zadania</div>
        </div>
      </div>
    </div>

`;

  // Generate features
  features.forEach(feature => {
    // Skip features with no subsections that have tasks
    const subsectionsWithTasks = feature.subsections.filter(s => s.tasks.length > 0);
    if (subsectionsWithTasks.length === 0) {
      return; // Skip this feature entirely
    }

    const priorityClass = feature.priority === 'critical' ? 'priority-critical' :
                          feature.priority === 'high' ? 'priority-high' : '';

    html += `    <!-- ${feature.title} -->
    <div class="feature-section">
      <div class="feature-header ${priorityClass}">
        <h2>
          <span>${feature.title}</span>
          ${feature.duration ? `<span class="feature-badge">${feature.duration}</span>` : ''}
        </h2>
        ${feature.description ? `<p class="feature-description">${feature.description}</p>` : ''}
      </div>

`;

    // Only render subsections that have tasks
    subsectionsWithTasks.forEach(subsection => {
      html += `      <div class="subsection">
        <h3 class="collapsible">${subsection.title}${subsection.duration ? ` (${subsection.duration})` : ''}</h3>
        <div class="collapsible-content">
          <ul class="task-list">
`;

      subsection.tasks.forEach(task => {
        html += `            <li class="task-item">
              <span class="task-checkbox ${task.status}"></span>
              <span class="task-text">
                ${task.text}
                ${task.subtasks.length > 0 ? `
                <ul class="subtask-list">
                  ${task.subtasks.map(sub => `<li>${sub}</li>`).join('')}
                </ul>` : ''}
              </span>
              ${task.estimate ? `<span class="task-estimate">${task.estimate}</span>` : ''}
            </li>
`;
      });

      html += `          </ul>
        </div>
      </div>

`;
    });

    html += `    </div>

`;
  });

  // Add summary section
  html += `
    <!-- Summary Section -->
    <div class="summary-section">
      <h2>📊 Podsumowanie Estymat</h2>
      <p style="margin-bottom: var(--space-lg); color: var(--color-text-secondary);">
        Przy dostępności <strong>15h/tydzień</strong> w wolnym czasie (Solo Developer)
      </p>

      <table class="summary-table">
        <thead>
          <tr>
            <th>Feature</th>
            <th>Backend</th>
            <th>Flutter</th>
            <th>Total</th>
            <th>Tygodnie</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Sprint 0: Auth & Setup</td>
            <td>~Done</td>
            <td>~Done</td>
            <td>~5h</td>
            <td>0.5</td>
            <td><span class="status-badge status-done">✅ 95%</span></td>
          </tr>
          <tr>
            <td>Feature 0: Mapa</td>
            <td>~4h</td>
            <td>~19h</td>
            <td>~23h</td>
            <td>1.5</td>
            <td><span class="status-badge status-done">✅ 80%</span></td>
          </tr>
          <tr>
            <td>Feature 1: Events CRUD</td>
            <td>~35h</td>
            <td>~40h</td>
            <td>~75h</td>
            <td>5</td>
            <td><span class="status-badge status-progress">🟡 40%</span></td>
          </tr>
          <tr>
            <td>Feature 2: Join/Leave</td>
            <td>~35h</td>
            <td>~40h</td>
            <td>~75h</td>
            <td>5</td>
            <td><span class="status-badge status-todo">🔴 0%</span></td>
          </tr>
          <tr>
            <td>Feature 3: Participant Mgmt</td>
            <td>~45h</td>
            <td>~45h</td>
            <td>~90h</td>
            <td>6</td>
            <td><span class="status-badge status-todo">🔴 0%</span></td>
          </tr>
          <tr>
            <td>Feature 3.5: Grupy</td>
            <td>~30h</td>
            <td>~30h</td>
            <td>~60h</td>
            <td>4</td>
            <td><span class="status-badge status-todo">🔴 0%</span></td>
          </tr>
          <tr>
            <td>Feature 4: Series</td>
            <td>~40h</td>
            <td>~35h</td>
            <td>~75h</td>
            <td>5</td>
            <td><span class="status-badge status-todo">🔴 0%</span></td>
          </tr>
          <tr>
            <td>Feature 5: User Profile</td>
            <td>~22h</td>
            <td>~23h</td>
            <td>~45h</td>
            <td>3</td>
            <td><span class="status-badge status-progress">🟡 30%</span></td>
          </tr>
          <tr>
            <td>Feature 5.5: Fav Places</td>
            <td>~0h</td>
            <td>~11h</td>
            <td>~11h</td>
            <td>1</td>
            <td><span class="status-badge status-done">✅ 90%</span></td>
          </tr>
          <tr>
            <td>Feature 6: UI Polish</td>
            <td>-</td>
            <td>~45h</td>
            <td>~45h</td>
            <td>3</td>
            <td><span class="status-badge status-progress">🟡 20%</span></td>
          </tr>
          <tr>
            <td>Feature 7: EventStatus</td>
            <td>~15h</td>
            <td>~10h</td>
            <td>~25h</td>
            <td>1.5</td>
            <td><span class="status-badge status-todo">🔴 0%</span></td>
          </tr>
          <tr>
            <td>Sprint Testowanie</td>
            <td>~60h</td>
            <td>-</td>
            <td>~60h</td>
            <td>4</td>
            <td><span class="status-badge status-todo">🔴 0%</span></td>
          </tr>
          <tr>
            <td>Sprint Wdrożenie (RPi)</td>
            <td>-</td>
            <td>-</td>
            <td>~37h</td>
            <td>2.5</td>
            <td><span class="status-badge status-todo">🔴 0%</span></td>
          </tr>
          <tr class="summary-total">
            <td><strong>TOTAL MVP</strong></td>
            <td><strong>~286h</strong></td>
            <td><strong>~298h</strong></td>
            <td><strong>~621h</strong></td>
            <td><strong>~41.5</strong></td>
            <td><span class="status-badge status-progress"><strong>~25%</strong></span></td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top: var(--space-2xl); padding: var(--space-xl); background: white; border-radius: var(--radius-md); border: 2px solid var(--color-primary);">
        <h3 style="color: var(--color-primary); margin-bottom: var(--space-md);">🎯 Realistyczny Timeline</h3>
        <div style="font-size: 1.1rem; line-height: 1.8;">
          <p><strong>~621h / 15h/tydzień = 41.5 tygodnie = ~10.5 miesiąca</strong></p>
          <p style="margin-top: var(--space-md); font-size: 0.95rem; color: var(--color-text-secondary);">
            Postęp aktualny: <strong>~25%</strong> (głównie Sprint 0, Mapa, Ulubione Lokalizacje)
          </p>
        </div>
      </div>

      <div style="margin-top: var(--space-xl); padding: var(--space-lg); background: #fee2e2; border-radius: var(--radius-md); border-left: 4px solid #dc2626;">
        <h3 style="color: #dc2626; margin-bottom: var(--space-sm);">🔴 Critical Path (minimum do pokazania użytkownikom)</h3>
        <p style="font-size: 1.1rem; margin: 0;"><strong>~20.5 tygodni = 5 miesięcy</strong></p>
        <p style="margin-top: var(--space-sm); font-size: 0.9rem; color: var(--color-text-secondary);">
          Feature 1: Events CRUD (4 tyg.) + Feature 2: Join/Leave (5 tyg.) + Feature 3: Participant Mgmt (6 tyg.) + Feature 6: UI Polish (3 tyg.) + Deploy (2.5 tyg.)
        </p>
      </div>

      <div style="margin-top: var(--space-lg); padding: var(--space-lg); background: #dcfce7; border-radius: var(--radius-md); border-left: 4px solid #16a34a;">
        <h3 style="color: #16a34a; margin-bottom: var(--space-sm);">✅ Realistyczne Cele</h3>
        <ul style="margin: 0; padding-left: var(--space-xl); line-height: 1.8;">
          <li>Podstawowe MVP (Critical Path) gotowe za <strong>~5-6 miesięcy</strong></li>
          <li>Pełne MVP (wszystkie features) gotowe za <strong>~10.5 miesiąca</strong></li>
          <li>Pokazanie pierwszym użytkownikom za <strong>~11-12 miesięcy</strong> 🚀</li>
        </ul>
      </div>

      <div style="margin-top: var(--space-2xl); padding: var(--space-xl); background: var(--color-background); border-radius: var(--radius-md);">
        <h3 style="color: var(--color-primary); margin-bottom: var(--space-md);">📈 Post-MVP Features</h3>
        <table class="summary-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>Godziny</th>
              <th>Tygodnie</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Email Notifications</td>
              <td>~30h</td>
              <td>2</td>
            </tr>
            <tr>
              <td>Push Notifications</td>
              <td>~45h</td>
              <td>3</td>
            </tr>
            <tr>
              <td>Płatności (Stripe)</td>
              <td>~60h</td>
              <td>4</td>
            </tr>
            <tr class="summary-total">
              <td><strong>TOTAL Post-MVP</strong></td>
              <td><strong>~135h</strong></td>
              <td><strong>9</strong></td>
            </tr>
          </tbody>
        </table>
        <p style="margin-top: var(--space-md); text-align: center; font-size: 1.1rem;">
          <strong>GRAND TOTAL: ~756h = ~50 tygodni = ~12.5 miesiąca</strong>
        </p>
      </div>
    </div>
  </div>

  <script>
    // Collapsible sections
    document.querySelectorAll('.collapsible').forEach(header => {
      header.addEventListener('click', () => {
        header.classList.toggle('collapsed');
        const content = header.nextElementSibling;
        content.classList.toggle('collapsed');
      });
    });

    // Feature header click to toggle entire section
    document.querySelectorAll('.feature-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.parentElement;
        const subsections = section.querySelectorAll('.subsection');

        subsections.forEach(sub => {
          const subHeader = sub.querySelector('.collapsible');
          const subContent = sub.querySelector('.collapsible-content');
          if (subHeader && subContent) {
            subHeader.classList.toggle('collapsed');
            subContent.classList.toggle('collapsed');
          }
        });
      });
    });
  </script>
</body>
</html>
`;

  return html;
}

// Main execution
const { features, stats } = parseTodoMd(todoMdContent);
const html = generateHtml(features, stats);

// Write TODO.html
const todoHtmlPath = path.join(__dirname, 'TODO.html');
fs.writeFileSync(todoHtmlPath, html, 'utf8');

console.log('✅ TODO.html wygenerowany pomyślnie!');
console.log(`📊 Statystyki: ${stats.done} ukończone, ${stats.maybe} do weryfikacji, ${stats.pending} do zrobienia (${stats.total} razem)`);
console.log(`📈 Postęp: ${Math.round((stats.done / stats.total) * 100)}% ukończone, ${Math.round((stats.maybe / stats.total) * 100)}% do weryfikacji`);
