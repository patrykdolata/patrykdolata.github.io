const fs = require('fs');
const path = require('path');

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[`*]/g, '')
    .replace(/[^a-z0-9ąęćłńóśźż \-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseTodo(todoPath) {
  const content = fs.readFileSync(todoPath, 'utf8');
  const lines = content.split('\n');

  const tasks = [];
  let currentFeature = null;
  let currentSubsection = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      currentFeature = line.replace(/^##\s+/, '').trim();
      currentSubsection = null;
      continue;
    }

    if (line.startsWith('### ')) {
      currentSubsection = line.replace(/^###\s+/, '').trim();
      continue;
    }

    const mainMatch = line.match(/^- \[([ x?])\]\s+(.+?)(?:\s+\*\*\[~(.+?)\]\*\*)?$/);
    if (mainMatch && currentFeature && currentSubsection) {
      const status = mainMatch[1] === 'x' ? 'done' : mainMatch[1] === '?' ? 'maybe' : 'pending';
      const text = mainMatch[2].trim();
      const estimate = mainMatch[3] || '';
      tasks.push({
        id: `${normalize(currentFeature)}-${tasks.length}`,
        feature: currentFeature,
        subsection: currentSubsection,
        text,
        estimate,
        status,
        tokens: normalize(`${text} ${currentFeature} ${currentSubsection}`).split(' ')
      });
    }
  }

  return tasks;
}

function summarize(tasks) {
  const summary = {
    total: tasks.length,
    done: tasks.filter(t => t.status === 'done').length,
    pending: tasks.filter(t => t.status === 'pending').length,
    maybe: tasks.filter(t => t.status === 'maybe').length
  };
  summary.percent = summary.total ? ((summary.done / summary.total) * 100).toFixed(1) : '0.0';
  return summary;
}

function pendingTop(tasks, limit = 5) {
  return tasks.filter(t => t.status === 'pending').slice(0, limit);
}

module.exports = {
  parseTodo,
  summarize,
  pendingTop,
  normalize
};
