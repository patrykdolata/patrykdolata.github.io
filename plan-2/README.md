# plan-2 (Improved daily planning sandbox)

Lekka, samodzielna wersja harmonogramu, która nie miesza się z istniejącymi plikami w repo (TODO.md/.todo-schedule.json). Wszystko działa lokalnie w katalogu `plan-2/`.

## Co robi
- Czyta `plan-2/TODO.md` (kopię aktualnego TODO).
- Analizuje commity w repozytoriach z `plan-2/config.json` od ostatniego uruchomienia (domyślnie 2 dni wstecz).
- Dopasowuje commity do zadań z TODO na podstawie słów kluczowych (tani matching po tokenach).
- Pokazuje podsumowanie postępu (done/pending), krótką listę “next 5 pending” oraz matched commity.
- Aktualizuje `plan-2/state.json` (ostatni run, statystyki, heady repo).

## Struktura
- `config.json` – ustawienia (repozytoria, startDate, capacity, próg dopasowania).
- `state.json` – stan ostatniego uruchomienia (timestamp, ostatnie heady repo, statystyki).
- `TODO.md` – kopia głównego TODO w wersji do analizy (można okresowo nadpisywać z korzenia).
- `bin/daily.js` – główny skrypt dashboardu (matchy + regeneruje HTML i harmonogram).
- `bin/render.js` – samodzielny render TODO.html.
- `bin/schedule.js` – generuje harmonogram (schedule.json) na bazie working hours/startDate.
- `bin/today.js` – pokazuje zadania zaplanowane na dziś na podstawie schedule.json.
- `lib/*.js` – parser TODO, git utils, matcher commitów → tasków, scheduler.

## Użycie
```bash
# dashboard + odświeżanie TODO.html
node plan-2/bin/daily.js

# tylko render TODO.html
node plan-2/bin/render.js

# tylko harmonogram (schedule.json)
node plan-2/bin/schedule.js

# zadania na dziś (wg schedule.json)
node plan-2/bin/today.js
```

Co zobaczysz:
- Licznik zadań (done/pending/maybe) + parametry czasu (startDate, weekly/today hours).
- Lista commitów od ostatniego runu (per repo), dopasowania commit→task z plikami i słowami kluczowymi.
- “Next 5 pending tasks” (pierwsze nierozwiązane z TODO).
- Na końcu zapisuje stan do `plan-2/state.json` i (przez `daily.js`) aktualizuje `plan-2/schedule.json`.

## Jak utrzymywać aktualność
1) Po każdej większej aktualizacji głównego `TODO.md` skopiuj go do `plan-2/TODO.md`.
2) Uruchamiaj `node plan-2/bin/daily.js` codziennie – stan trzymany jest w `state.json`.
3) Jeśli chcesz skrócić okno analizy commitów, usuń `lastRunAt` ze `state.json` (wtedy skrypt weźmie ostatnie 2 dni).

## Output
- `plan-2/state.json` – stan i timestamp ostatniego runu.
- `plan-2/TODO.html` – lekki dashboard (summary + tasks z TODO).
- `plan-2/schedule.json` – prosty harmonogram (plannedDate/Week/DayName).

## Rozszerzenia (pomysły)
- Zapisać dopasowania commit→task do osobnego logu (CSV/JSON) w `plan-2/logs/`.
- Dodać prostą metrykę velocity (średnia liczba godzin zakończonych z TODO w tygodniu).
- Wzbogacić matcher o wagi dla ścieżek plików (np. mapowanie “participants” → Feature 3).
