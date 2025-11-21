const { normalize } = require('./parse-todo');

function parseEstimate(estimate) {
  if (!estimate) return 1;
  const m = String(estimate).match(/(\d+(?:\.\d+)?)\s*h/);
  return m ? parseFloat(m[1]) : 1;
}

function determinePriority(featureTitle) {
  if (featureTitle.toLowerCase().includes('sprint 0') ||
      featureTitle.toLowerCase().includes('feature 0') ||
      featureTitle.toLowerCase().includes('feature 1')) {
    return 'critical';
  }
  if (featureTitle.toLowerCase().includes('feature 2') ||
      featureTitle.toLowerCase().includes('feature 3')) {
    return 'high';
  }
  return 'medium';
}

function scheduleTasks(tasks, config) {
  const startDate = new Date(config.schedule.startDate);
  const workingHours = config.schedule.workingHours;
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  let currentDate = new Date(startDate);
  let hoursUsedToday = 0;
  let idx = 0;

  const scheduled = [];

  const getHoursForDay = (date) => workingHours[dayNames[date.getDay()]] || 0;

  const nextDay = (date) => {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d;
  };

  const planTask = (task) => {
    const hours = parseEstimate(task.estimate);

    // Completed tasks keep history but do not consume capacity
    if (task.status === 'done') {
      scheduled.push({
        ...task,
        taskIndex: idx++,
        estimateHours: hours,
        priority: determinePriority(task.feature),
        plannedDate: null,
        plannedWeek: null,
        plannedDayName: null
      });
      return;
    }

    let placed = false;
    let guard = 0;
    while (!placed && guard < 1000) {
      guard++;
      const capacity = getHoursForDay(currentDate);

      if (capacity === 0) {
        currentDate = nextDay(currentDate);
        hoursUsedToday = 0;
        continue;
      }

      if (hoursUsedToday + hours <= capacity) {
        const plannedDate = currentDate.toISOString().split('T')[0];
        const weekNumber = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24 * 7)) + 1;
        scheduled.push({
          ...task,
          taskIndex: idx++,
          estimateHours: hours,
          priority: determinePriority(task.feature),
          plannedDate,
          plannedWeek: weekNumber,
          plannedDayName: dayNames[currentDate.getDay()]
        });
        hoursUsedToday += hours;
        placed = true;
      } else {
        currentDate = nextDay(currentDate);
        hoursUsedToday = 0;
      }
    }
  };

  tasks.forEach(planTask);
  return scheduled;
}

function stats(schedule) {
  const totalTasks = schedule.length;
  const completedTasks = schedule.filter(t => t.status === 'done').length;
  const pendingTasks = schedule.filter(t => t.status === 'pending').length;
  const maybeTasks = schedule.filter(t => t.status === 'maybe').length;
  const totalEstimatedHours = schedule.reduce((s, t) => s + (t.estimateHours || 0), 0);
  const completedHours = schedule
    .filter(t => t.status === 'done')
    .reduce((s, t) => s + (t.estimateHours || 0), 0);
  const remainingHours = totalEstimatedHours - completedHours;
  const percentComplete = totalTasks ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0.0';

  const plannedItems = schedule.filter(t => t.plannedDate);
  const lastDate = plannedItems.length ? plannedItems[plannedItems.length - 1].plannedDate : null;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    maybeTasks,
    totalEstimatedHours,
    completedHours,
    remainingHours,
    percentComplete,
    estimatedEndDate: lastDate
  };
}

module.exports = {
  scheduleTasks,
  stats,
  parseEstimate
};
