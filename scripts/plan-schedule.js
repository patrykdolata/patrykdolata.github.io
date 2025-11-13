#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Plan Schedule Generator
 * Parses TODO.md and generates .todo-schedule.json with dates
 */

const projectRoot = path.join(__dirname, '..');
const todoMdPath = path.join(projectRoot, 'TODO.md');
const configPath = path.join(projectRoot, '.project-config.json');
const schedulePath = path.join(projectRoot, '.todo-schedule.json');

// Load configuration
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Parse TODO.md (reuse logic from generate-todo.js)
function parseTodoMd(content) {
  const lines = content.split('\n');
  const tasks = [];
  let currentFeature = null;
  let currentSubsection = null;
  let currentParentTask = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Stop parsing after Milestone 1 (only parse Core MVP)
    if (line.match(/^# 📋 MILESTONE (2|3):/)) {
      console.log('⚠️  Stopping at Milestone 2/3 - parsing Core MVP only');
      break;
    }

    // Feature header
    if (line.match(/^## (Sprint|Feature|Deployment)/)) {
      const match = line.match(/^## (.+?)(?:\s+[✅🟡].*)?(?:\s+\(~?(.+?)\))?$/);
      if (match) {
        currentFeature = {
          title: match[1].trim(),
          duration: match[2] || ''
        };
        currentSubsection = null;
        currentParentTask = null;
      }
    }
    // Subsection
    else if (line.match(/^### /)) {
      const match = line.match(/^### (.+?)(?:\s+\(~?(.+?)\))?$/);
      if (match && currentFeature) {
        currentSubsection = {
          title: match[1].trim(),
          duration: match[2] || ''
        };
        currentParentTask = null;
      }
    }
    // Subtask (indented checkbox) - takes priority if parent has "→ split"
    else if (line.match(/^\s+- \[([ x?])\]/)) {
      // Support both old format **[~3h]** and new format [~3h]
      const match = line.match(/^\s+- \[([ x?])\]\s+(.+?)(?:\s+(?:\*\*)?\[~?(.+?)\](?:\*\*)?)?$/);
      if (match && currentFeature && currentSubsection && currentParentTask) {
        // Only add subtask if parent is marked as "→ split"
        if (currentParentTask.shouldSplit) {
          const status = match[1] === 'x' ? 'completed' : match[1] === '?' ? 'maybe' : 'pending';
          const taskText = match[2].trim();
          const estimate = match[3] || '1h';

          tasks.push({
            feature: currentFeature.title,
            subsection: currentSubsection.title,
            task: `${currentParentTask.text} - ${taskText}`, // Combine parent + subtask for context
            estimate: estimate,
            status: status,
            isSubtask: true,
            parentTask: currentParentTask.text
          });
        }
      }
    }
    // Main task line
    else if (line.match(/^- \[([ x?])\]/)) {
      // Support both old format **[~3h]** and new format [~3h]
      const match = line.match(/^- \[([ x?])\]\s+(.+?)(?:\s+(?:\*\*)?\[~?(.+?)\](?:\*\*)?)?$/);
      if (match && currentFeature && currentSubsection) {
        const status = match[1] === 'x' ? 'completed' : match[1] === '?' ? 'maybe' : 'pending';
        const taskText = match[2].trim();
        const estimate = match[3] || '1h';
        // Check for "→ split" in the estimate field OR the full line
        const shouldSplit = (estimate && estimate.includes('→ split')) || line.includes('→ split');

        // Store as current parent for potential subtasks
        currentParentTask = {
          text: taskText,
          shouldSplit: shouldSplit
        };

        // Only add main task if it's NOT marked for splitting
        if (!shouldSplit) {
          tasks.push({
            feature: currentFeature.title,
            subsection: currentSubsection.title,
            task: taskText,
            estimate: estimate,
            status: status,
            isSubtask: false
          });
        }
      }
    }
  }

  return tasks;
}

// Convert estimate string to hours
function parseEstimate(estimate) {
  const match = estimate.match(/(\d+(?:\.\d+)?)\s*h/);
  return match ? parseFloat(match[1]) : 1.0;
}

// Generate schedule with dates
function generateSchedule(tasks, config) {
  const schedule = [];
  const startDate = new Date(config.schedule.startDate);
  const workingHours = config.schedule.workingHours;

  let currentDate = new Date(startDate);
  let currentDayHours = 0;
  let taskIndex = 0;
  let weekNumber = 1;

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Get available hours for a specific date
  function getAvailableHours(date) {
    const dayName = dayNames[date.getDay()];
    return workingHours[dayName] || 0;
  }

  // Move to next working day
  function nextWorkingDay(date) {
    let nextDate = new Date(date);
    do {
      nextDate.setDate(nextDate.getDate() + 1);
    } while (getAvailableHours(nextDate) === 0);
    return nextDate;
  }

  for (const task of tasks) {
    const hours = parseEstimate(task.estimate);

    // Show progress every 50 tasks
    if (taskIndex % 50 === 0) {
      console.log(`Processing task ${taskIndex}/${tasks.length}...`);
    }

    // Skip tasks that are already completed
    if (task.status === 'completed') {
      taskIndex++;
      continue;
    }

    // Find a day with enough hours
    let iterations = 0;
    while (iterations < 1000) { // Safety limit
      iterations++;
      const availableToday = getAvailableHours(currentDate);

      if (availableToday === 0) {
        currentDate = nextWorkingDay(currentDate);
        currentDayHours = 0;
        continue;
      }

      // If task is too large for any single day, split it across multiple days
      if (hours > availableToday && currentDayHours === 0) {
        // Task is larger than a full day's work
        // We'll just schedule it on the first available day with note
        // (in practice, you should split such tasks into subtasks)
        console.warn(`WARNING: Task "${task.task.substring(0, 50)}..." [${hours}h] is larger than max daily capacity (${availableToday}h)`);
        break; // Schedule it anyway
      }

      if (currentDayHours + hours <= availableToday) {
        // Task fits in current day
        break;
      } else {
        // Move to next working day
        currentDate = nextWorkingDay(currentDate);
        currentDayHours = 0;

        // Calculate week number
        const daysDiff = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
        weekNumber = Math.floor(daysDiff / 7) + 1;
      }
    }

    if (iterations >= 1000) {
      console.error(`ERROR: Infinite loop detected for task: ${task.task}`);
      continue; // Skip this task instead of breaking entire loop
    }

    // Create task ID
    const taskId = task.task
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50) + `-${taskIndex}`;

    // Generate keywords
    const keywords = extractKeywords(task.task);

    // Determine associated files (simple heuristic)
    const associatedFiles = extractPossibleFiles(task.task, task.subsection);

    schedule.push({
      id: taskId,
      taskIndex: taskIndex++,
      feature: task.feature,
      subsection: task.subsection,
      task: task.task,
      estimate: task.estimate,
      estimateHours: hours,
      status: task.status,
      priority: determinePriority(task.feature),
      plannedDate: currentDate.toISOString().split('T')[0],
      plannedWeek: weekNumber,
      actualStartDate: task.status === 'completed' ? null : null,
      actualCompletedDate: task.status === 'completed' ? null : null,
      actualHours: null,
      matchedCommits: [],
      keywords: keywords,
      associatedFiles: associatedFiles,
      dependencies: []
    });

    currentDayHours += hours;
  }

  return schedule;
}

function extractKeywords(taskText) {
  const taskMatcher = require('./task-matcher.js');
  return taskMatcher.extractKeywords(taskText);
}

function extractPossibleFiles(taskText, subsectionText) {
  const files = [];

  // Extract explicit file names (e.g., EventController)
  const filePattern = /([A-Z][a-zA-Z]+(?:Controller|Service|Repository|Entity|DTO|Request|Response|Screen|Widget|Notifier))/g;
  const matches = [...taskText.matchAll(filePattern), ...subsectionText.matchAll(filePattern)];

  for (const match of matches) {
    const baseName = match[1];

    // Determine file extension based on subsection
    if (subsectionText.includes('Backend') || subsectionText.includes('Spring')) {
      files.push(`${baseName}.java`);
    } else if (subsectionText.includes('Flutter') || subsectionText.includes('Frontend')) {
      files.push(`${baseName}.dart`);
    } else {
      files.push(`${baseName}.java`);
      files.push(`${baseName}.dart`);
    }
  }

  return [...new Set(files)];
}

function determinePriority(featureTitle) {
  if (featureTitle.includes('Sprint 0') ||
      featureTitle.includes('Feature 0') ||
      featureTitle.includes('Feature 1') ||
      featureTitle.includes('Feature 2')) {
    return 'critical';
  }
  if (featureTitle.includes('Feature 3') ||
      featureTitle.includes('Feature 4')) {
    return 'high';
  }
  return 'medium';
}

function calculateStats(schedule) {
  const stats = {
    totalTasks: schedule.length,
    completedTasks: schedule.filter(t => t.status === 'completed').length,
    pendingTasks: schedule.filter(t => t.status === 'pending').length,
    maybeTasks: schedule.filter(t => t.status === 'maybe').length,
    totalEstimatedHours: schedule.reduce((sum, t) => sum + t.estimateHours, 0),
    completedHours: schedule
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.estimateHours, 0)
  };

  stats.remainingHours = stats.totalEstimatedHours - stats.completedHours;
  stats.percentComplete = stats.totalTasks > 0
    ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(1)
    : 0;

  return stats;
}

// Main execution
function main() {
  console.log('📅 Generating project schedule...\n');

  // Read TODO.md
  const todoContent = fs.readFileSync(todoMdPath, 'utf8');
  const tasks = parseTodoMd(todoContent);

  console.log(`✓ Parsed ${tasks.length} tasks from TODO.md`);

  // Generate schedule
  const schedule = generateSchedule(tasks, config);
  const stats = calculateStats(schedule);

  // Find last scheduled date
  const lastDate = schedule[schedule.length - 1].plannedDate;
  const startDate = new Date(config.schedule.startDate);
  const endDate = new Date(lastDate);
  const weeks = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24 * 7));

  // Create output
  const output = {
    meta: {
      generatedAt: new Date().toISOString(),
      startDate: config.schedule.startDate,
      weeklyHours: config.schedule.totalWeeklyHours,
      totalTasks: schedule.length,
      totalEstimatedHours: stats.totalEstimatedHours,
      estimatedWeeks: weeks,
      estimatedEndDate: lastDate
    },
    schedule: schedule,
    progress: {
      ...stats,
      averageVelocity: null,
      targetVelocity: (stats.totalEstimatedHours / weeks / 7).toFixed(1) + 'h/day',
      daysWorked: 0,
      onTrack: true,
      daysAheadBehind: 0
    }
  };

  // Save to file
  fs.writeFileSync(schedulePath, JSON.stringify(output, null, 2), 'utf8');

  // Display summary
  console.log('\n✅ Schedule generated successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total tasks:        ${schedule.length}`);
  console.log(`Total hours:        ${stats.totalEstimatedHours}h`);
  console.log(`Weekly capacity:    ${config.schedule.totalWeeklyHours}h/week`);
  console.log(`Estimated duration: ${weeks} weeks (~${Math.ceil(weeks / 4)} months)`);
  console.log(`Start date:         ${config.schedule.startDate} (środa)`);
  console.log(`Estimated end:      ${lastDate}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Show first week preview
  console.log('\n📅 FIRST WEEK PREVIEW:\n');
  const firstWeek = schedule.filter(t => t.plannedWeek === 1);
  const dayNames = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];

  let currentDisplayDate = null;
  for (const task of firstWeek) {
    if (task.plannedDate !== currentDisplayDate) {
      const date = new Date(task.plannedDate);
      const dayName = dayNames[date.getDay()];
      console.log(`\n${dayName} ${task.plannedDate}:`);
      currentDisplayDate = task.plannedDate;
    }
    console.log(`  • ${task.task.substring(0, 60)}... [${task.estimate}]`);
  }

  console.log(`\n💾 Saved to ${schedulePath}`);
}

main();
