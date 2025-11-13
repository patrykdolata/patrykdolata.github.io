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
  let inSummarySection = false;
  let inMvpTable = false;
  let inPostMvpTable = false;
  const mvpSummary = [];
  const postMvpSummary = [];

  const stats = {
    done: 0,
    maybe: 0,
    pending: 0,
    total: 0
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for summary section
    if (line.match(/^## Podsumowanie Estymat/)) {
      inSummarySection = true;
      continue;
    }

    // Parse MVP table
    if (inSummarySection && line.match(/^\| Feature \| Backend \| Flutter \| Total \| Tygodnie \| Status \|$/)) {
      inMvpTable = true;
      i++; // Skip separator line
      continue;
    }

    // Parse Post-MVP table
    if (inSummarySection && line.match(/^\| Feature \| Godziny \| Tygodnie \|$/)) {
      inPostMvpTable = true;
      inMvpTable = false;
      i++; // Skip separator line
      continue;
    }

    // Parse MVP table rows
    if (inMvpTable && line.match(/^\|/)) {
      const parts = line.split('|').map(s => s.trim().replace(/\*\*/g, '')).filter(s => s);
      if (parts.length === 6 && !parts[0].includes('TOTAL')) {
        mvpSummary.push({
          feature: parts[0],
          backend: parts[1],
          flutter: parts[2],
          total: parts[3],
          weeks: parts[4],
          status: parts[5]
        });
      } else if (parts.length === 6 && parts[0].includes('TOTAL')) {
        mvpSummary.push({
          feature: parts[0],
          backend: parts[1],
          flutter: parts[2],
          total: parts[3],
          weeks: parts[4],
          status: parts[5],
          isTotal: true
        });
        inMvpTable = false;
      }
    }

    // Parse Post-MVP table rows
    if (inPostMvpTable && line.match(/^\|/)) {
      const parts = line.split('|').map(s => s.trim().replace(/\*\*/g, '')).filter(s => s);
      if (parts.length === 3 && !parts[0].includes('TOTAL')) {
        postMvpSummary.push({
          feature: parts[0],
          hours: parts[1],
          weeks: parts[2]
        });
      } else if (parts.length === 3 && parts[0].includes('TOTAL')) {
        postMvpSummary.push({
          feature: parts[0],
          hours: parts[1],
          weeks: parts[2],
          isTotal: true
        });
        inPostMvpTable = false;
      }
    }

    // Exit summary section when hitting next major section
    if (inSummarySection && line.match(/^## [^P]/)) {
      inSummarySection = false;
    }

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
    // Supports: 2 spaces, 4 spaces, tabs, or any whitespace before dash
    else if (line.match(/^(\s{2,}|\t+)\s*-\s+/)) {
      const subtaskText = line.replace(/^(\s{2,}|\t+)\s*-\s+/, '').trim();
      if (currentSubsection && currentSubsection.tasks.length > 0) {
        const lastTask = currentSubsection.tasks[currentSubsection.tasks.length - 1];
        lastTask.subtasks.push(subtaskText);
      }
    }
  }

  return { features, stats, mvpSummary, postMvpSummary };
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

function getStatusBadgeClass(status) {
  // Extract emoji/icon from status (✅, 🟡, 🔴)
  if (status.includes('✅')) return 'status-done';
  if (status.includes('🟡')) return 'status-progress';
  if (status.includes('🔴')) return 'status-todo';
  return 'status-progress';
}

function generateScheduleSection(scheduleData) {
  const today = new Date().toISOString().split('T')[0];
  const todayDate = new Date(today);
  const startDate = new Date(scheduleData.meta.startDate);
  const endDate = new Date(scheduleData.meta.estimatedEndDate);

  // Calculate current week and day
  const daysSinceStart = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24));
  const currentWeek = Math.floor(daysSinceStart / 7) + 1;
  const currentDay = daysSinceStart >= 0 ? daysSinceStart + 1 : 0;

  // Find today's tasks
  const todayTasks = scheduleData.schedule.filter(
    t => t.plannedDate === today && t.status === 'pending'
  );

  // Find overdue tasks
  const overdueTasks = scheduleData.schedule.filter(
    t => t.plannedDate < today && t.status === 'pending'
  );

  // Find upcoming tasks (next 7 days)
  const nextWeek = new Date(todayDate);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const upcomingTasks = scheduleData.schedule.filter(
    t => t.plannedDate > today && t.plannedDate <= nextWeekStr && t.status === 'pending'
  );

  // Calculate progress
  const progress = scheduleData.progress;
  const percentComplete = parseFloat(progress.percentComplete) || 0;
  const isAhead = progress.daysAheadBehind > 0;
  const isBehind = progress.daysAheadBehind < 0;
  const onTrack = !isAhead && !isBehind;

  let html = `
    <!-- Schedule Section -->
    <div class="schedule-section">
      <h2 style="color: var(--color-primary); text-align: center; margin-bottom: var(--space-lg);">
        📅 Harmonogram Projektu
      </h2>

      <!-- Timeline Visualization -->
      <div class="timeline-container">
        <div class="timeline-header">
          <div class="timeline-item">
            <span class="timeline-label">Start</span>
            <span class="timeline-date">${scheduleData.meta.startDate}</span>
          </div>
          <div class="timeline-item timeline-current">
            <span class="timeline-label">Dzisiaj</span>
            <span class="timeline-date">${today}</span>
            <span class="timeline-week">Tydzień ${currentWeek}, Dzień ${currentDay}</span>
          </div>
          <div class="timeline-item">
            <span class="timeline-label">Koniec (plan)</span>
            <span class="timeline-date">${scheduleData.meta.estimatedEndDate}</span>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="timeline-bar-container">
          <div class="timeline-bar" style="width: ${percentComplete}%;"></div>
          <div class="timeline-marker" style="left: ${percentComplete}%;">
            ${percentComplete.toFixed(1)}%
          </div>
        </div>

        <!-- Status Indicators -->
        <div class="timeline-status">
`;

  if (onTrack) {
    html += `
          <div class="status-indicator status-on-track">
            <span class="status-icon">✓</span>
            <span class="status-text">Zgodnie z planem</span>
          </div>
`;
  } else if (isAhead) {
    html += `
          <div class="status-indicator status-ahead">
            <span class="status-icon">↑</span>
            <span class="status-text">${progress.daysAheadBehind} dni przed planem</span>
          </div>
`;
  } else if (isBehind) {
    html += `
          <div class="status-indicator status-behind">
            <span class="status-icon">↓</span>
            <span class="status-text">${Math.abs(progress.daysAheadBehind)} dni opóźnienia</span>
          </div>
`;
  }

  html += `
        </div>
      </div>

      <!-- Task Lists Grid -->
      <div class="task-lists-grid">
`;

  // Today's Tasks
  html += `
        <div class="task-list-card task-list-today">
          <h3>📋 Dzisiaj (${todayTasks.length})</h3>
          <div class="task-list-content">
`;

  if (todayTasks.length === 0) {
    html += `<p class="empty-state">Brak zadań na dzisiaj</p>`;
  } else {
    const totalHours = todayTasks.reduce((sum, t) => sum + t.estimateHours, 0);
    html += `<p class="task-list-summary">${totalHours}h zaplanowane</p>`;

    for (const task of todayTasks.slice(0, 5)) {
      html += `
            <div class="schedule-task-item">
              <span class="schedule-task-text">${task.task.substring(0, 50)}${task.task.length > 50 ? '...' : ''}</span>
              <span class="schedule-task-estimate">${task.estimate}</span>
            </div>
`;
    }

    if (todayTasks.length > 5) {
      html += `<p class="more-tasks">... i ${todayTasks.length - 5} więcej</p>`;
    }
  }

  html += `
          </div>
        </div>
`;

  // Overdue Tasks
  html += `
        <div class="task-list-card task-list-overdue">
          <h3>⚠️ Zaległe (${overdueTasks.length})</h3>
          <div class="task-list-content">
`;

  if (overdueTasks.length === 0) {
    html += `<p class="empty-state">Brak zaległości ✓</p>`;
  } else {
    const totalHours = overdueTasks.reduce((sum, t) => sum + t.estimateHours, 0);
    html += `<p class="task-list-summary">${totalHours}h zaległości</p>`;

    for (const task of overdueTasks.slice(0, 5)) {
      const daysOverdue = Math.floor((todayDate - new Date(task.plannedDate)) / (1000 * 60 * 60 * 24));
      html += `
            <div class="schedule-task-item">
              <span class="schedule-task-text">${task.task.substring(0, 40)}${task.task.length > 40 ? '...' : ''}</span>
              <span class="schedule-task-overdue">${daysOverdue}d</span>
            </div>
`;
    }

    if (overdueTasks.length > 5) {
      html += `<p class="more-tasks">... i ${overdueTasks.length - 5} więcej</p>`;
    }
  }

  html += `
          </div>
        </div>
`;

  // Upcoming Tasks
  html += `
        <div class="task-list-card task-list-upcoming">
          <h3>📆 Najbliższy tydzień (${upcomingTasks.length})</h3>
          <div class="task-list-content">
`;

  if (upcomingTasks.length === 0) {
    html += `<p class="empty-state">Brak zadań w tym tygodniu</p>`;
  } else {
    const totalHours = upcomingTasks.reduce((sum, t) => sum + t.estimateHours, 0);
    html += `<p class="task-list-summary">${totalHours}h zaplanowane</p>`;

    for (const task of upcomingTasks.slice(0, 5)) {
      html += `
            <div class="schedule-task-item">
              <span class="schedule-task-text">${task.task.substring(0, 40)}${task.task.length > 40 ? '...' : ''}</span>
              <span class="schedule-task-date">${task.plannedDate}</span>
            </div>
`;
    }

    if (upcomingTasks.length > 5) {
      html += `<p class="more-tasks">... i ${upcomingTasks.length - 5} więcej</p>`;
    }
  }

  html += `
          </div>
        </div>
      </div>

      <!-- Statistics Row -->
      <div class="schedule-stats-row">
        <div class="schedule-stat">
          <div class="schedule-stat-label">Ukończone</div>
          <div class="schedule-stat-value">${progress.completedTasks}/${progress.totalTasks}</div>
        </div>
        <div class="schedule-stat">
          <div class="schedule-stat-label">Pozostało godzin</div>
          <div class="schedule-stat-value">${progress.remainingHours}h</div>
        </div>
        <div class="schedule-stat">
          <div class="schedule-stat-label">Velocity</div>
          <div class="schedule-stat-value">${progress.averageVelocity || 'N/A'}</div>
        </div>
        <div class="schedule-stat">
          <div class="schedule-stat-label">Target velocity</div>
          <div class="schedule-stat-value">${progress.targetVelocity}</div>
        </div>
      </div>
    </div>

    <style>
      .schedule-section {
        margin: var(--space-2xl) 0;
        padding: var(--space-2xl);
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
      }

      .timeline-container {
        background: var(--color-background);
        border-radius: var(--radius-md);
        padding: var(--space-xl);
        margin-bottom: var(--space-xl);
      }

      .timeline-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: var(--space-lg);
        flex-wrap: wrap;
        gap: var(--space-md);
      }

      .timeline-item {
        text-align: center;
        flex: 1;
        min-width: 120px;
      }

      .timeline-current {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: var(--space-md);
        border-radius: var(--radius-md);
      }

      .timeline-label {
        display: block;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: var(--space-xs);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .timeline-date {
        display: block;
        font-size: 1.1rem;
        font-weight: bold;
      }

      .timeline-week {
        display: block;
        font-size: 0.85rem;
        margin-top: var(--space-xs);
        opacity: 0.9;
      }

      .timeline-bar-container {
        background: #e5e7eb;
        height: 30px;
        border-radius: var(--radius-full);
        position: relative;
        overflow: visible;
        margin: var(--space-lg) 0;
      }

      .timeline-bar {
        height: 100%;
        background: linear-gradient(90deg, #10b981, #059669);
        border-radius: var(--radius-full);
        transition: width 0.5s ease;
      }

      .timeline-marker {
        position: absolute;
        top: -5px;
        transform: translateX(-50%);
        background: white;
        border: 3px solid #10b981;
        padding: 4px 12px;
        border-radius: var(--radius-full);
        font-weight: bold;
        font-size: 0.9rem;
        color: #059669;
        box-shadow: var(--shadow-md);
      }

      .timeline-status {
        display: flex;
        justify-content: center;
        margin-top: var(--space-lg);
      }

      .status-indicator {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-md) var(--space-lg);
        border-radius: var(--radius-md);
        font-weight: 600;
      }

      .status-on-track {
        background: #d1fae5;
        color: #065f46;
      }

      .status-ahead {
        background: #dbeafe;
        color: #1e40af;
      }

      .status-behind {
        background: #fee2e2;
        color: #991b1b;
      }

      .status-icon {
        font-size: 1.2rem;
      }

      .task-lists-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: var(--space-lg);
        margin-bottom: var(--space-xl);
      }

      .task-list-card {
        background: white;
        border-radius: var(--radius-md);
        padding: var(--space-lg);
        box-shadow: var(--shadow-sm);
        border-left: 4px solid;
      }

      .task-list-today {
        border-left-color: #3b82f6;
      }

      .task-list-overdue {
        border-left-color: #ef4444;
      }

      .task-list-upcoming {
        border-left-color: #10b981;
      }

      .task-list-card h3 {
        margin: 0 0 var(--space-md) 0;
        font-size: 1.1rem;
      }

      .task-list-content {
        max-height: 300px;
        overflow-y: auto;
      }

      .task-list-summary {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin-bottom: var(--space-md);
      }

      .schedule-task-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-sm);
        border-bottom: 1px solid var(--color-border-light);
        gap: var(--space-sm);
      }

      .schedule-task-text {
        flex: 1;
        font-size: 0.9rem;
        line-height: 1.4;
      }

      .schedule-task-estimate {
        font-size: 0.85rem;
        font-weight: 600;
        color: #3b82f6;
        background: #dbeafe;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }

      .schedule-task-overdue {
        font-size: 0.85rem;
        font-weight: 600;
        color: #dc2626;
        background: #fee2e2;
        padding: 2px 8px;
        border-radius: var(--radius-sm);
        flex-shrink: 0;
      }

      .schedule-task-date {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        flex-shrink: 0;
      }

      .empty-state {
        text-align: center;
        color: var(--color-text-secondary);
        padding: var(--space-lg);
        font-style: italic;
      }

      .more-tasks {
        text-align: center;
        color: var(--color-text-secondary);
        font-size: 0.85rem;
        margin-top: var(--space-sm);
      }

      .schedule-stats-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--space-md);
        margin-top: var(--space-xl);
      }

      .schedule-stat {
        text-align: center;
        padding: var(--space-md);
        background: var(--color-background);
        border-radius: var(--radius-md);
      }

      .schedule-stat-label {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin-bottom: var(--space-xs);
      }

      .schedule-stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--color-primary);
      }

      @media (max-width: 768px) {
        .timeline-header {
          flex-direction: column;
        }

        .task-lists-grid {
          grid-template-columns: 1fr;
        }
      }
    </style>
`;

  return html;
}

function generateHtml(features, stats, mvpSummary, postMvpSummary, scheduleData = null) {
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

  // Add Schedule Section if available
  if (scheduleData) {
    html += generateScheduleSection(scheduleData);
  }

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
                  ${task.subtasks.map(sub => `<li>${sub}</li>`).join('\n                  ')}
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
`;

  // Generate MVP table rows dynamically
  mvpSummary.forEach(row => {
    const rowClass = row.isTotal ? ' class="summary-total"' : '';
    const statusClass = getStatusBadgeClass(row.status);

    if (row.isTotal) {
      html += `          <tr${rowClass}>
            <td><strong>${row.feature}</strong></td>
            <td><strong>${row.backend}</strong></td>
            <td><strong>${row.flutter}</strong></td>
            <td><strong>${row.total}</strong></td>
            <td><strong>${row.weeks}</strong></td>
            <td><span class="status-badge ${statusClass}"><strong>${row.status}</strong></span></td>
          </tr>
`;
    } else {
      html += `          <tr${rowClass}>
            <td>${row.feature}</td>
            <td>${row.backend}</td>
            <td>${row.flutter}</td>
            <td>${row.total}</td>
            <td>${row.weeks}</td>
            <td><span class="status-badge ${statusClass}">${row.status}</span></td>
          </tr>
`;
    }
  });

  html += `        </tbody>
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
`;

  // Generate Post-MVP table rows dynamically
  postMvpSummary.forEach(row => {
    const rowClass = row.isTotal ? ' class="summary-total"' : '';

    if (row.isTotal) {
      html += `            <tr${rowClass}>
              <td><strong>${row.feature}</strong></td>
              <td><strong>${row.hours}</strong></td>
              <td><strong>${row.weeks}</strong></td>
            </tr>
`;
    } else {
      html += `            <tr${rowClass}>
              <td>${row.feature}</td>
              <td>${row.hours}</td>
              <td>${row.weeks}</td>
            </tr>
`;
    }
  });

  html += `          </tbody>
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
const { features, stats, mvpSummary, postMvpSummary } = parseTodoMd(todoMdContent);

// Load schedule data if exists
let scheduleData = null;
const schedulePath = path.join(__dirname, '.todo-schedule.json');
if (fs.existsSync(schedulePath)) {
  scheduleData = JSON.parse(fs.readFileSync(schedulePath, 'utf8'));
}

const html = generateHtml(features, stats, mvpSummary, postMvpSummary, scheduleData);

// Write TODO.html
const todoHtmlPath = path.join(__dirname, 'TODO.html');
fs.writeFileSync(todoHtmlPath, html, 'utf8');

console.log('✅ TODO.html wygenerowany pomyślnie!');
console.log(`📊 Statystyki: ${stats.done} ukończone, ${stats.maybe} do weryfikacji, ${stats.pending} do zrobienia (${stats.total} razem)`);
console.log(`📈 Postęp: ${Math.round((stats.done / stats.total) * 100)}% ukończone, ${Math.round((stats.maybe / stats.total) * 100)}% do weryfikacji`);
