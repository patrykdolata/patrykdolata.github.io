# 📊 Automatyczny System Śledzenia Postępów Projektu

System automatycznie śledzi postępy w projekcie Meet App poprzez analizę commitów w repozytoriach i dopasowywanie ich do zadań z TODO.md.

## 🏗️ Architektura

```
.
├── .project-config.json         # Konfiguracja repozytoriów i harmonogramu
├── .todo-schedule.json           # Wygenerowany harmonogram z datami
├── .daily-summary-state.json    # Stan ostatniego podsumowania
│
├── scripts/
│   ├── git-analyzer.js           # Moduł analizy git
│   ├── task-matcher.js           # Dopasowanie commitów do zadań
│   ├── update-todo.js            # Aktualizacja TODO.md
│   ├── plan-schedule.js          # Generator harmonogramu
│   ├── today-plan.js             # Plan na dzisiaj
│   └── daily-summary.js          # Podsumowanie dnia
│
└── .claude/commands/
    ├── plan-schedule.md          # /plan-schedule
    ├── today-plan.md             # /today-plan
    └── daily-summary.md          # /daily-summary
```

## 🚀 Inicjalizacja (pierwszy raz)

### 1. Generuj harmonogram

```bash
/plan-schedule
```

Generuje `.todo-schedule.json` z datami dla wszystkich zadań z TODO.md:
- **394 zadania**
- **998 godzin** pracy
- **~50 tygodni** (około 13 miesięcy)
- **Start:** 2025-11-12 (środa)
- **Koniec:** 2026-10-28

**Harmonogram uwzględnia:**
- Twoje godziny pracy: wt:1h, śr:2h, czw:3h, pt:2h, sb:4h, nd:4h
- Estymacje zadań z TODO.md
- Priorytetyzację (critical → high → medium)

## 📅 Codzienny Workflow

### 2. Rano: Plan na dzisiaj

```bash
/today-plan
```

Wyświetla:
- **Zadania zaplanowane na dzisiaj** (według harmonogramu)
- **Dostępny czas** na dzisiaj (np. środa = 2h)
- **Zaległe zadania** (jeśli są)
- **Ogólny postęp** projektu
- **Metryki velocity** (po kilku dniach pracy)

**Przykład output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📅 TODAY: 2025-11-13 (czw)
⏰ AVAILABLE TIME: 3h
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 PLANNED FOR TODAY (3h):

Feature 1: Podstawowe operacje na Wydarzeniach
┌────────────────────────────────────────────┐
│ [ ] Setup `application.yml`          [1h] │
│     Files: application.yml                 │
│     Repo: meet-app-be                      │
└────────────────────────────────────────────┘

📊 OVERALL PROGRESS:
  ✅ Completed: 93/394 tasks (23.6%)
  🎯 Timeline: Week 1, Day 2
  🚀 Status: ON TRACK ✓
```

### 3. Wieczorem: Podsumowanie dnia

```bash
/daily-summary
```

AI:
1. **Analizuje commity** we wszystkich 3 repozytoriach (od ostatniego summary)
2. **Dopasowuje commity do zadań** używając:
   - Keywords (POST, events, create...)
   - File paths (EventController.java...)
   - Semantic similarity
3. **Proponuje aktualizacje** TODO.md
4. **Pyta o potwierdzenie** dla każdego zadania

**Przykład output:**
```
📊 COMMITS SUMMARY (4 total):

meet-app-be:
  abc123 "Add POST /events endpoint" (2h ago)
    EventController.java (+45, -0)
    EventService.java (+30, -5)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 MATCHING TASKS:

✅ HIGH CONFIDENCE MATCHES (auto-suggest):

1. POST `/events` (single create) [3h]
   └─ Commit abc123: "Add POST /events endpoint"
      Files: EventController.java ✓, EventService.java ✓
      Keywords: POST ✓, events ✓, create ✓
      Score: 92% (keyword: 90%, filepath: 100%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 PROPOSED UPDATES:

Mark as COMPLETE [x]:
  ✓ POST `/events` (single create) [3h]

⏱️ TIME TRACKING:
  Planned for today (czw): 3h
  Work detected: ~3h
  Right on track! ✓

📊 PROGRESS UPDATE:
  Before: 93/394 tasks (23.6%)
  After: 94/394 tasks (23.9%)
  Velocity: 3.0h/day (target: 2.0h/day) - ON TRACK ✓
```

**Po potwierdzeniu, AI:**
- Aktualizuje TODO.md ([ ] → [x])
- Aktualizuje .todo-schedule.json (actualCompletedDate, commits)
- Regeneruje TODO.html z nową sekcją harmonogramu
- Aktualizuje .daily-summary-state.json

## 📋 TODO.html - Nowa Sekcja Harmonogramu

TODO.html teraz zawiera **interaktywną sekcję harmonogramu** z:

### 📅 Timeline Visualization
- **Start:** 2025-11-12
- **Dzisiaj:** Week X, Day Y
- **Koniec (plan):** 2026-10-28
- **Progress bar** z procentem ukończenia

### 🚦 Status Indicators
- ✓ **Zgodnie z planem** (on track)
- ↑ **X dni przed planem** (ahead)
- ↓ **X dni opóźnienia** (behind)

### 📊 Task Lists (3 kolumny)

1. **📋 Dzisiaj** - zadania zaplanowane na dziś
2. **⚠️ Zaległe** - przeterminowane zadania
3. **📆 Najbliższy tydzień** - nadchodzące zadania

### 📈 Statistics Row
- Ukończone: X/Y
- Pozostało godzin: Xh
- Velocity: X.Xh/day
- Target velocity: X.Xh/day

## 🔧 Konfiguracja

### `.project-config.json`

```json
{
  "repositories": [
    {
      "name": "patrykdolata.github.io",
      "path": "/home/dolti/dev/workspace/git/patrykdolata.github.io",
      "type": "prototype",
      "enabled": true
    },
    {
      "name": "meet-app-be",
      "path": "/home/dolti/dev/workspace/git/meet-app-be",
      "type": "backend",
      "enabled": true
    },
    {
      "name": "meet-app-fe",
      "path": "/home/dolti/dev/workspace/git/meet-app-fe",
      "type": "frontend",
      "enabled": true
    }
  ],
  "schedule": {
    "startDate": "2025-11-12",
    "workingHours": {
      "Monday": 0,
      "Tuesday": 1,
      "Wednesday": 2,
      "Thursday": 3,
      "Friday": 2,
      "Saturday": 4,
      "Sunday": 4
    },
    "totalWeeklyHours": 16
  }
}
```

## 🧠 Jak Działa Matching?

### 1. Keyword Matching (30%)
- Ekstrahuje keywords z zadania: `"POST /events endpoint"` → `["POST", "events", "endpoint", "create"]`
- Szuka w commit message i plikach

### 2. File Path Matching (40%)
- Zadanie: `associatedFiles: ["EventController.java"]`
- Commit zmienia: `["EventController.java", "EventService.java"]`
- Score = intersection / union

### 3. Semantic Matching (30% - TODO)
- Dla przyszłości: AI semantic similarity

### Confidence Levels:
- 🟢 **>85%**: Auto-suggest jako complete
- 🟡 **65-85%**: Ask for confirmation
- 🔴 **<65%**: Ignore (pokazuje jako "unmatched work")

## 📊 Tracking Metrics

System śledzi:
- **Velocity** (godziny/dzień) - rzeczywista vs target
- **Opóźnienia** (dni ahead/behind)
- **Completion rate** (%)
- **Overdue tasks** (liczba i godziny)
- **Streak days** (ile dni z rzędu pracujesz)

## 🔄 Stan Systemu

### `.daily-summary-state.json`
```json
{
  "lastSummaryDate": "2025-11-12T20:00:00Z",
  "lastCommitHashes": {
    "patrykdolata.github.io": "6d13c40",
    "meet-app-be": "abc123",
    "meet-app-fe": "def456"
  },
  "summaryCount": 73,
  "streakDays": 12,
  "totalHoursTracked": 185
}
```

### `.todo-schedule.json` (excerpt)
```json
{
  "meta": {
    "startDate": "2025-11-12",
    "totalTasks": 394,
    "totalEstimatedHours": 998,
    "estimatedWeeks": 50
  },
  "schedule": [
    {
      "id": "post-events-1",
      "task": "POST `/events` (single create)",
      "estimate": "3h",
      "status": "completed",
      "plannedDate": "2025-11-12",
      "actualCompletedDate": "2025-11-12T18:30:00Z",
      "matchedCommits": [
        {
          "repo": "meet-app-be",
          "hash": "abc123",
          "message": "Add POST /events endpoint",
          "confidence": 0.95
        }
      ]
    }
  ]
}
```

## ⚙️ Zaawansowane Features

### Velocity Adjustment
Po 2 tygodniach AI wykrywa:
```
📊 VELOCITY ANALYSIS:
Your actual velocity: 2.1h/day
Your planned velocity: 2.0h/day
Efficiency: 105%

You're ahead of schedule! 🎉
```

### Off-plan Work Detection
```
⚠️ OFF-PLAN WORK DETECTED:
Commits found that don't match any planned tasks:
- "Fix critical bug in authentication" (2h ago)

Options:
1. Add as unplanned work (won't affect schedule)
2. Create new task retroactively
3. Ignore
```

### Duże Zadania (>4h)
System ostrzega o zadaniach większych niż max dzienny czas:
```
WARNING: Task "Stripe webhook..." [8h] is larger than max daily capacity (4h)
Recommendation: Split into subtasks
```

## 🎯 Tips & Best Practices

### 1. Commity
- **Opisowe messages** ułatwiają matching
- **Referencje do komponentów** (np. "EventController")
- **Keywords** z TODO (np. "POST /events")

### 2. TODO.md
- **Estymaty** powinny być realistyczne
- **Zadania >4h** warto rozbijać na subtaski
- **Keywords** w nazwach zadań

### 3. Daily Summary
- **Rób codziennie** wieczorem
- **Zawsze potwierdzaj** propozycje AI
- **Sprawdzaj medium confidence** matches

### 4. Regeneruj Harmonogram
- Po dużych zmianach w TODO.md
- Gdy velocity się zmienia znacząco
- Co 2-3 tygodnie dla fresh start

## 📚 Slash Commands

| Command | Opis |
|---------|------|
| `/plan-schedule` | Generuj harmonogram z datami |
| `/today-plan` | Pokaż plan na dzisiaj |
| `/daily-summary` | Podsumuj dzień (od ostatniego summary) |

## 🐛 Troubleshooting

### "No schedule found"
→ Uruchom `/plan-schedule` najpierw

### "No commits since last summary"
→ Normalne jeśli nie było commitów od ostatniego razu

### "Infinite loop detected"
→ Zadanie >4h, warto rozbi na mniejsze

### Matching nie działa dobrze
→ Dodaj więcej keywords do zadania lub lepsze commit messages

## 📈 Roadmap

- [ ] Semantic matching z AI
- [ ] Weekly/Monthly summary views
- [ ] Export do CSV/PDF
- [ ] GitHub Issues integration
- [ ] Burndown charts
- [ ] Team velocity tracking

---

**Made with ❤️ for Meet App Project**
**Last updated:** 2025-11-12
