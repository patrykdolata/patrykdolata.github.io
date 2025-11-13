Uruchom podsumowanie dnia - analizuje commity od ostatniego summary:

```bash
cd /home/dolti/dev/workspace/git/patrykdolata.github.io
node scripts/daily-summary.js
```

BARDZO WAŻNE:
1. Skrypt pokazuje TYLKO PREVIEW - NIE zapisuje żadnych zmian
2. Przeanalizuj wykryte dopasowania (high/medium confidence)
3. ZAWSZE pytaj użytkownika o potwierdzenie dla KAŻDEGO zadania
4. Dopiero po potwierdzeniu użytkownika:
   - Użyj update-todo.js do aktualizacji TODO.md
   - Zaktualizuj .todo-schedule.json
   - Regeneruj TODO.html (generate-todo.js)
   - Zaktualizuj .daily-summary-state.json

NIE akceptuj automatycznie żadnych zmian bez zgody użytkownika.
