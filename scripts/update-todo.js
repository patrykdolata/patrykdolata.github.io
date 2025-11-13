#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Update TODO Module
 * Updates TODO.md checkboxes and regenerates TODO.html
 */

/**
 * Update a single task status in TODO.md
 */
function updateTaskStatus(todoMdPath, taskText, newStatus = 'x') {
  try {
    const content = fs.readFileSync(todoMdPath, 'utf8');
    const lines = content.split('\n');

    // Normalize task text for comparison (remove estimate, trim)
    const normalizeTaskText = (text) => {
      return text
        .replace(/\*\*\[~.*?\]\*\*/g, '') // Remove estimates
        .replace(/`/g, '')                 // Remove backticks
        .replace(/\s+/g, ' ')              // Normalize whitespace
        .trim()
        .toLowerCase();
    };

    const normalizedSearchText = normalizeTaskText(taskText);
    let found = false;
    let lineNumber = -1;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this is a task line
      if (line.match(/^- \[([ x?])\]/)) {
        const taskContent = line.replace(/^- \[([ x?])\]\s*/, '');
        const normalizedLine = normalizeTaskText(taskContent);

        // Check if this line matches our task
        if (normalizedLine.includes(normalizedSearchText) ||
            normalizedSearchText.includes(normalizedLine)) {

          // Update the checkbox
          lines[i] = line.replace(/^- \[([ x?])\]/, `- [${newStatus}]`);
          found = true;
          lineNumber = i + 1;
          break;
        }
      }
    }

    if (found) {
      fs.writeFileSync(todoMdPath, lines.join('\n'), 'utf8');
      return { success: true, lineNumber };
    } else {
      return { success: false, reason: 'Task not found in TODO.md' };
    }
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Bulk update multiple tasks
 */
function bulkUpdateTasks(todoMdPath, updates) {
  const results = {
    updated: 0,
    failed: []
  };

  for (const update of updates) {
    const result = updateTaskStatus(
      todoMdPath,
      update.taskText,
      update.newStatus || 'x'
    );

    if (result.success) {
      results.updated++;
    } else {
      results.failed.push({
        taskText: update.taskText,
        reason: result.reason
      });
    }
  }

  return results;
}

/**
 * Regenerate TODO.html using generate-todo.js
 */
function regenerateTodoHtml(projectRoot) {
  try {
    const generateScript = path.join(projectRoot, 'generate-todo.js');

    if (!fs.existsSync(generateScript)) {
      return {
        success: false,
        reason: `generate-todo.js not found at ${generateScript}`
      };
    }

    execSync(`node "${generateScript}"`, {
      cwd: projectRoot,
      stdio: 'inherit'
    });

    return { success: true };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Get task statistics from TODO.md
 */
function getTaskStats(todoMdPath) {
  try {
    const content = fs.readFileSync(todoMdPath, 'utf8');
    const lines = content.split('\n');

    const stats = {
      total: 0,
      completed: 0,
      maybe: 0,
      pending: 0
    };

    for (const line of lines) {
      const match = line.match(/^- \[([ x?])\]/);
      if (match) {
        stats.total++;
        const status = match[1];
        if (status === 'x') {
          stats.completed++;
        } else if (status === '?') {
          stats.maybe++;
        } else {
          stats.pending++;
        }
      }
    }

    return stats;
  } catch (error) {
    return { total: 0, completed: 0, maybe: 0, pending: 0 };
  }
}

module.exports = {
  updateTaskStatus,
  bulkUpdateTasks,
  regenerateTodoHtml,
  getTaskStats
};
