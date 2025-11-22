const fs = require('fs');

const INPUT_FILE = 'GOALS.md';
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
        transition: border-color 0.3s ease;
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
        background: linear-gradient(135deg, var(--primary) 0%, var(--success) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
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
        transition: all 0.2s;
        line-height: 1.2;
    }
    
    .nav-btn:hover {
        background: var(--border);
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
    }

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
    }

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
        transition: box-shadow 0.2s;
    }

    details:hover {
        box-shadow: var(--shadow);
    }

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
        transition: background-color 0.2s;
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
    }
    .pill-done {
        background-color: rgba(16, 185, 129, 0.1);
        color: var(--success);
    }
    .pill-todo {
        background-color: rgba(79, 70, 229, 0.1);
        color: var(--primary);
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
    }
    .task-item:last-child { border-bottom: none; }

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
        transition: all 0.2s;
    }

    .checkbox.checked {
        background-color: var(--success);
        border-color: var(--success);
        color: white;
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
    }

    @keyframes slideDown {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
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
                    val = extractProgress(val);
                    isProgress = true;
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

// --- MAIN ---

try {
    if (!fs.existsSync(INPUT_FILE)) {
        console.error(`Błąd: Nie znaleziono pliku ${INPUT_FILE}`);
        process.exit(1);
    }
    const raw = fs.readFileSync(INPUT_FILE, 'utf8');
    const data = parseMarkdown(raw);
    const html = generateHTML(data);
    fs.writeFileSync(OUTPUT_FILE, html);
    console.log(`✅ Wygenerowano dashboard: ${OUTPUT_FILE}`);
} catch (e) {
    console.error(e);
}
