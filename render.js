const fs = require('fs');

const INPUT_FILE = 'goals.md';
const OUTPUT_FILE = 'TODO.html';

// --- CSS / STYLES (MODERN UI) ---
const STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :root {
        /* Light Theme */
        --primary: #4f46e5;       /* Indigo 600 */
        --primary-light: #e0e7ff; /* Indigo 100 */
        --success: #10b981;       /* Emerald 500 */
        --warning: #f59e0b;       /* Amber 500 */
        --danger: #ef4444;        /* Red 500 */
        
        --bg-body: #f3f4f6;       /* Gray 100 */
        --bg-card: #ffffff;
        --bg-header: rgba(255, 255, 255, 0.8);
        
        --text-main: #111827;     /* Gray 900 */
        --text-muted: #6b7280;    /* Gray 500 */
        
        --border: #e5e7eb;        /* Gray 200 */
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        --radius: 12px;
    }

    [data-theme="dark"] {
        /* Dark Theme */
        --primary: #818cf8;       /* Indigo 400 */
        --primary-light: rgba(79, 70, 229, 0.2);
        
        --bg-body: #0f172a;       /* Slate 900 */
        --bg-card: #1e293b;       /* Slate 800 */
        --bg-header: rgba(15, 23, 42, 0.8);
        
        --text-main: #f3f4f6;     /* Gray 100 */
        --text-muted: #94a3b8;    /* Slate 400 */
        
        --border: #334155;        /* Slate 700 */
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
    }

    * { box-sizing: border-box; }

    html {
        scroll-behavior: smooth;
    }

    body {
        font-family: 'Inter', sans-serif;
        background-color: var(--bg-body);
        color: var(--text-main);
        margin: 0;
        padding-top: 80px; /* Space for fixed header */
        line-height: 1.5;
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 0 20px 40px 20px;
        animation: fadeIn 0.6s ease-out;
    }

    /* --- HEADER --- */
    header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 70px;
        background: var(--bg-header);
        backdrop-filter: blur(10px);
        -webkit-backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        transition: all 0.3s ease;
        animation: fadeIn 0.5s ease-out;
    }

    header:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .header-content {
        width: 100%;
        max-width: 900px;
        padding: 0 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .header-actions {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    h1 {
        font-size: 1.5rem;
        font-weight: 700;
        letter-spacing: -0.025em;
        margin: 0;
        background: linear-gradient(135deg, var(--primary) 0%, var(--success) 100%, var(--primary) 200%);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        animation: gradientShift 3s ease infinite;
    }

    /* Shared style for buttons and links in header */
    .nav-btn {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text-main);
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        line-height: 1.2;
        position: relative;
        overflow: hidden;
    }

    .nav-btn:hover {
        background: var(--border);
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    .nav-btn:active {
        transform: translateY(0) scale(0.98);
    }

    /* --- SUMMARY CARDS --- */
    .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 40px;
    }

    .metric-card {
        background: var(--bg-card);
        padding: 20px;
        border-radius: var(--radius);
        border: 1px solid var(--border);
        box-shadow: var(--shadow);
        display: flex;
        flex-direction: column;
        justify-content: center;
        animation: fadeInUp 0.6s ease-out backwards;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .metric-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15);
    }

    .metric-card:nth-child(1) { animation-delay: 0.1s; }
    .metric-card:nth-child(2) { animation-delay: 0.2s; }
    .metric-card:nth-child(3) { animation-delay: 0.3s; }
    .metric-card:nth-child(4) { animation-delay: 0.4s; }

    .metric-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        font-weight: 600;
        color: var(--text-muted);
        letter-spacing: 0.05em;
        margin-bottom: 8px;
    }

    .metric-value {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--text-main);
        animation: fadeInUp 0.8s ease-out backwards;
        transition: transform 0.3s ease;
    }

    .metric-card:hover .metric-value {
        transform: scale(1.1);
    }

    .progress-bar {
        width: 100%;
        height: 8px;
        background-color: var(--border);
        border-radius: 4px;
        margin-top: 12px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--success), var(--primary));
        border-radius: 4px;
        transition: width 1s ease-in-out;
    }

    /* --- MILESTONES --- */
    .milestone-card {
        margin-bottom: 40px;
        animation: scaleIn 0.5s ease-out backwards;
    }

    .milestone-card:nth-child(1) { animation-delay: 0.5s; }
    .milestone-card:nth-child(2) { animation-delay: 0.6s; }
    .milestone-card:nth-child(3) { animation-delay: 0.7s; }
    .milestone-card:nth-child(4) { animation-delay: 0.8s; }

    .milestone-header {
        display: flex;
        flex-direction: column;
        margin-bottom: 20px;
        border-left: 4px solid var(--primary);
        padding-left: 16px;
    }

    .milestone-title {
        font-size: 1.5rem;
        font-weight: 700;
        margin: 0;
        color: var(--text-main);
        transition: transform 0.3s ease;
    }

    .milestone-title:hover {
        transform: translateX(5px);
    }

    .milestone-meta {
        font-size: 0.9rem;
        color: var(--text-muted);
        margin-top: 4px;
    }

    /* --- FEATURES (ACCORDION) --- */
    details {
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        margin-bottom: 12px;
        overflow: hidden;
        transition: box-shadow 0.3s ease, transform 0.3s ease;
        animation: slideInLeft 0.5s ease-out backwards;
    }

    details:hover {
        box-shadow: var(--shadow);
        transform: translateX(5px);
    }

    details:nth-child(1) { animation-delay: 0.1s; }
    details:nth-child(2) { animation-delay: 0.15s; }
    details:nth-child(3) { animation-delay: 0.2s; }
    details:nth-child(4) { animation-delay: 0.25s; }
    details:nth-child(5) { animation-delay: 0.3s; }
    details:nth-child(6) { animation-delay: 0.35s; }

    summary {
        padding: 16px 20px;
        cursor: pointer;
        list-style: none;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
        font-size: 1rem;
        user-select: none;
        transition: all 0.3s ease;
        position: relative;
    }

    summary::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: var(--primary);
        transform: scaleY(0);
        transition: transform 0.3s ease;
    }

    summary:hover::before {
        transform: scaleY(1);
    }

    summary::-webkit-details-marker { display: none; }

    summary:hover {
        background-color: var(--bg-body);
    }

    /* Status Pills in Header */
    .status-pill {
        font-size: 0.75rem;
        padding: 4px 10px;
        border-radius: 20px;
        font-weight: 600;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        animation: fadeIn 0.4s ease-out;
    }
    .pill-done {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--success);
    }
    .pill-done:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
    }
    .pill-todo {
        background-color: rgba(79, 70, 229, 0.1);
        color: var(--primary);
        animation: pulse 2s ease-in-out infinite;
    }
    .pill-todo:hover {
        transform: scale(1.1);
        box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
    }

    /* Open State */
    details[open] summary {
        border-bottom: 1px solid var(--border);
        background-color: rgba(0,0,0,0.01);
    }

    .feature-body {
        padding: 20px;
        animation: slideDown 0.2s ease-out;
    }

    .feature-desc {
        font-size: 0.9rem;
        color: var(--text-muted);
        margin-bottom: 16px;
        margin-top: 0;
        line-height: 1.6;
        animation: fadeIn 0.3s ease-out 0.1s backwards;
    }

    /* --- TASKS --- */
    .task-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .task-item {
        display: flex;
        align-items: flex-start;
        padding: 8px 0;
        gap: 12px;
        border-bottom: 1px solid var(--border);
        transition: transform 0.2s ease, padding-left 0.2s ease;
    }
    .task-item:last-child { border-bottom: none; }
    .task-item:hover {
        padding-left: 8px;
        background: linear-gradient(90deg, var(--primary-light) 0%, transparent 100%);
    }

    .checkbox {
        width: 20px;
        height: 20px;
        border-radius: 6px;
        border: 2px solid var(--border);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 2px;
        transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .checkbox.checked {
        background-color: var(--success);
        border-color: var(--success);
        color: white;
        animation: bounce 0.5s ease;
    }

    .checkbox:hover {
        transform: scale(1.1);
        border-color: var(--primary);
    }

    .checkbox svg {
        width: 14px;
        height: 14px;
        stroke-width: 3;
    }

    .task-text {
        font-size: 0.95rem;
        color: var(--text-main);
    }
    
    .task-text.dimmed {
        color: var(--text-muted);
        text-decoration: line-through;
        opacity: 0.7;
    }
    
    strong {
        font-weight: 600;
        color: var(--primary);
        transition: color 0.3s ease;
    }

    strong:hover {
        color: var(--success);
    }

    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }

    @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
    }

    @keyframes gradientShift {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
    }

    @keyframes progressFill {
        from { width: 0; }
    }
`;

const SCRIPT = `
    const btn = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved === 'dark' || (!saved && prefersDark)) {
        html.setAttribute('data-theme', 'dark');
        btn.innerText = '☀ Jasny';
    } else {
        html.setAttribute('data-theme', 'light');
        btn.innerText = '🌙 Ciemny';
    }

    btn.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        btn.innerText = next === 'dark' ? '☀ Jasny' : '🌙 Ciemny';
    });
`;

// --- UTILS ---

function cleanText(text) {
    if (!text) return '';

    // 1. Remove Jira tags and Backlog tags (handling surrounding backticks if present)
    text = text.replace(/`?\[MA-[\w\d]+\]`?/g, '');
    text = text.replace(/`?\[BACKLOG\]`?/g, '');
    
    // 2. Remove emojis
    text = text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
    
    // 3. Initial Trim
    text = text.trim();

    // 4. Convert Markdown Bold (**text**) to HTML strong
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // 5. Convert Markdown Italic (*text*) to HTML em
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // 6. Convert Code to HTML code
    text = text.replace(/`([^`]+)`/g, '<code style="font-family:monospace; background:var(--border); padding:2px 4px; border-radius:4px; font-size:0.9em;">$1</code>');

    // 7. AUTO-FIX: Insert separator if bold text touches description
    text = text.replace(/(<\/strong>)\s*([^-–—:\s])/g, '$1 - $2');

    // 8. Cleanup multiple spaces
    text = text.replace(/\s\s+/g, ' ');

    return text;
}

function extractProgress(val) {
    const match = val.match(/(\d+)%/);
    return match ? match[1] : 0;
}

// --- PARSER ---

function calculateOverallProgress(milestones) {
    let totalTasks = 0;
    let completedTasks = 0;

    milestones.forEach(milestone => {
        milestone.features.forEach(feature => {
            feature.tasks.forEach(task => {
                totalTasks++;
                if (task.done) completedTasks++;
            });
        });
    });

    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
}

function parseMarkdown(content) {
    const lines = content.split('\n');
    const data = {
        summary: [],
        milestones: []
    };

    let currentMilestone = null;
    let currentFeature = null;

    lines.forEach(line => {
        const raw = line.trim();
        if(!raw) return;

        // 1. Summary Table
        if (raw.includes('|') && !raw.includes('---')) {
            const cols = raw.split('|').map(c => c.trim()).filter(c => c);
            if (cols.length >= 2 && !cols[0].toLowerCase().includes('metryka')) {
                let val = cols[1];
                let isProgress = false;
                if (val.includes('![')) {
                    isProgress = true;
                    // Don't extract progress here - we'll calculate it later
                    val = '0';
                }
                data.summary.push({
                    label: cleanText(cols[0]),
                    value: cleanText(val),
                    isProgress: isProgress
                });
            }
            return;
        }

        // 2. Milestones
        if (raw.startsWith('## ') && raw.toUpperCase().includes('M')) {
            currentMilestone = {
                title: cleanText(raw.replace('## ', '')),
                meta: [],
                features: []
            };
            data.milestones.push(currentMilestone);
            currentFeature = null;
            return;
        }

        // 3. Milestone Meta (Termin/Cel)
        if (currentMilestone && !currentFeature && raw.startsWith('**')) {
            currentMilestone.meta.push(cleanText(raw));
            return;
        }

        // 4. Features
        if (raw.startsWith('### ')) {
            currentFeature = {
                title: cleanText(raw.replace('### ', '')),
                desc: '',
                tasks: [],
                allDone: true
            };
            if(currentMilestone) currentMilestone.features.push(currentFeature);
            return;
        }

        // 5. Feature Description
        if (currentFeature && raw.startsWith('*') && raw.endsWith('*') && !raw.includes('[')) {
            currentFeature.desc = cleanText(raw.replace(/\*/g, ''));
            return;
        }

        // 6. Tasks
        if (raw.startsWith('- [')) {
            const isDone = raw.includes('- [x]');
            const text = raw.substring(6);
            if (currentFeature) {
                currentFeature.tasks.push({ done: isDone, text: cleanText(text) });
                if (!isDone) currentFeature.allDone = false;
            }
        }
    });

    // Calculate actual progress and update summary
    const actualProgress = calculateOverallProgress(data.milestones);
    data.summary.forEach(item => {
        if (item.isProgress) {
            item.value = actualProgress.toString();
        }
    });

    return data;
}

// --- HTML GENERATOR ---

function generateHTML(data) {
    return `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meet App Dashboard</title>
    <style>${STYLES}</style>
</head>
<body>
    
    <header>
        <div class="header-content">
            <h1>Meet App</h1>
            
            <div class="header-actions">
                <a href="screens/index.html" class="nav-btn">🎨 Makiety</a>
                <button id="theme-toggle" class="nav-btn">🌙 Ciemny</button>
            </div>
        </div>
    </header>

    <div class="container">
        
        <!-- DASHBOARD SUMMARY -->
        <div class="summary-grid">
            ${data.summary.map(item => `
                <div class="metric-card">
                    <div class="metric-label">${item.label}</div>
                    <div class="metric-value">
                        ${item.isProgress ? item.value + '%' : item.value}
                    </div>
                    ${item.isProgress ? `
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${item.value}%"></div>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        <!-- MILESTONES -->
        ${data.milestones.map(m => `
            <div class="milestone-card">
                <div class="milestone-header">
                    <h2 class="milestone-title">${m.title}</h2>
                    <div class="milestone-meta">${m.meta.join(' &nbsp;•&nbsp; ')}</div>
                </div>

                <!-- FEATURES -->
                ${m.features.map(f => `
                    <details ${f.allDone ? '' : 'open'}>
                        <summary>
                            <span>${f.title}</span>
                            ${f.allDone 
                                ? '<span class="status-pill pill-done">Wykonane</span>' 
                                : `<span class="status-pill pill-todo">${f.tasks.filter(t=>t.done).length} / ${f.tasks.length}</span>`
                            }
                        </summary>
                        <div class="feature-body">
                            ${f.desc ? `<p class="feature-desc">${f.desc}</p>` : ''}
                            <ul class="task-list">
                                ${f.tasks.map(t => `
                                    <li class="task-item">
                                        <div class="checkbox ${t.done ? 'checked' : ''}">
                                            ${t.done ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
                                        </div>
                                        <div class="task-text ${t.done ? 'dimmed' : ''}">${t.text}</div>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </details>
                `).join('')}
            </div>
        `).join('')}

    </div>
    <script>${SCRIPT}</script>
</body>
</html>`;
}

// --- UPDATE GOALS.MD ---

function updateGoalsProgress(content, actualProgress) {
    // Update the progress bar line
    const progressRegex = /(\| \*\*Całkowity Postęp\*\* \| !\[Postęp\]\(https:\/\/progress-bar\.dev\/)(\d+)(\/\?scale=100&title=Zrobione&width=120&color=2ecc71\) \*\*)(\d+)(\%\*\* \|)/;

    const updated = content.replace(progressRegex, `$1${actualProgress}$3${actualProgress}$5`);

    return updated;
}

// --- MAIN ---

try {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Błąd: Nie znaleziono pliku ${INPUT_FILE}`);
        process.exit(1);
    }
    let raw = fs.readFileSync(INPUT_FILE, 'utf8');
    const data = parseMarkdown(raw);

    // Get the calculated progress
    const actualProgress = data.summary.find(item => item.isProgress)?.value || '0';

    // Update goals.md with actual progress
    const updatedGoals = updateGoalsProgress(raw, actualProgress);
    if (updatedGoals !== raw) {
        fs.writeFileSync(INPUT_FILE, updatedGoals);
        console.log(`📊 Zaktualizowano postęp w ${INPUT_FILE}: ${actualProgress}%`);
    }

    const html = generateHTML(data);
    fs.writeFileSync(OUTPUT_FILE, html);
    console.log(`✅ Wygenerowano dashboard: ${OUTPUT_FILE}`);
} catch (e) {
    console.error(e);
}
