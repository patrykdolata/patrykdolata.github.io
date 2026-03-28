const fs = require('fs');

const JIRA_CSV = 'Jira.csv';
const GOALS_MD = 'goals.md';

// Parse Jira CSV
function parseJiraCsv() {
  const csv = fs.readFileSync(JIRA_CSV, 'utf8');
  const lines = csv.split('\n');

  const tasks = {};
  const epics = new Set();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const parts = line.split(',');
    if (parts.length < 10) continue;

    const type = parts[0];
    const key = parts[1];
    const status = parts[9];

    if (key && key.startsWith('MA-')) {
      tasks[key] = status;

      // Track Epics separately
      if (type === 'Epik') {
        epics.add(key);
      }
    }
  }

  return { tasks, epics };
}

// Update goals.md based on Jira statuses
function updateGoalsMd(tasks, epics) {
  let content = fs.readFileSync(GOALS_MD, 'utf8');
  const lines = content.split('\n');
  const updatedLines = [];

  let changes = 0;

  for (let line of lines) {
    const trimmed = line.trim();

    // Check if line contains a task with MA-XXX reference
    if ((trimmed.startsWith('- [x]') || trimmed.startsWith('- [ ]')) && trimmed.includes('[MA-')) {
      // Extract all MA-XXX references from the line
      const maMatches = trimmed.match(/\[MA-\d+\]/g);

      if (maMatches && maMatches.length > 0) {
        // Check if any of the tasks are Epics - if so, skip auto-completion
        const hasEpic = maMatches.some(match => {
          const key = match.replace(/[\[\]]/g, '');
          return epics.has(key);
        });

        if (hasEpic) {
          // Skip Epic tasks - they should be manually managed
          updatedLines.push(line);
          continue;
        }

        // Check status of all referenced tasks (non-Epic only)
        let allDone = true;
        let anyDone = false;

        for (const match of maMatches) {
          const key = match.replace(/[\[\]]/g, '');
          const status = tasks[key];

          if (status === 'Gotowe') {
            anyDone = true;
          } else if (status === 'Do zrobienia' || status === 'W toku' || status === 'On hold') {
            allDone = false;
          }
        }

        // Determine if checkbox should be checked
        const shouldBeChecked = allDone && anyDone;
        const isChecked = trimmed.startsWith('- [x]');

        if (shouldBeChecked && !isChecked) {
          // Change [ ] to [x]
          line = line.replace('- [ ]', '- [x]');
          changes++;
          console.log(`✓ Marking as done: ${maMatches.join(', ')}`);
        } else if (!shouldBeChecked && isChecked) {
          // Change [x] to [ ]
          line = line.replace('- [x]', '- [ ]');
          changes++;
          console.log(`✗ Marking as todo: ${maMatches.join(', ')}`);
        }
      }
    }

    updatedLines.push(line);
  }

  const updatedContent = updatedLines.join('\n');

  if (changes > 0) {
    fs.writeFileSync(GOALS_MD, updatedContent);
    console.log(`\n✅ Updated ${changes} tasks in ${GOALS_MD}`);
  } else {
    console.log(`\n✅ No changes needed in ${GOALS_MD}`);
  }

  return changes;
}

// Main
try {
  console.log('📊 Parsing Jira CSV...');
  const { tasks, epics } = parseJiraCsv();
  console.log(`   Found ${Object.keys(tasks).length} tasks (${epics.size} epics)`);

  // Count by status
  const statusCounts = {};
  Object.values(tasks).forEach(status => {
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  console.log('\n📈 Status breakdown:');
  console.log(`   ✅ Gotowe: ${statusCounts['Gotowe'] || 0}`);
  console.log(`   🔄 W toku: ${statusCounts['W toku'] || 0}`);
  console.log(`   📋 Do zrobienia: ${statusCounts['Do zrobienia'] || 0}`);
  console.log(`   ❌ Odrzucono: ${statusCounts['Odrzucono'] || 0}`);
  console.log(`   ⏸  On hold: ${statusCounts['On hold'] || 0}`);

  console.log('\n🔄 Updating goals.md...');
  console.log(`   ⚠️  Skipping ${epics.size} Epic tasks (manual management)`);
  const changes = updateGoalsMd(tasks, epics);

  if (changes > 0) {
    console.log('\n💡 Run "node render.js" to regenerate TODO.html');
  }
} catch (e) {
  console.error('❌ Error:', e.message);
  process.exit(1);
}
