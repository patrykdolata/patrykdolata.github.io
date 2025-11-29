# Feature 04: Event Series Management

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M1 (MVP) - basic, M2 - advanced |
| **Priority** | HIGH |
| **Status** | ✅ M1 Complete, ⏳ M2 Partial |
| **Goal** | Szablony cyklicznych wydarzeń i generowanie eventów wg częstotliwości |
| **Jira** | MA-497, MA-498 |

---

## Overview

System Event Series umożliwia organizatorom tworzenie szablonów cyklicznych wydarzeń i automatyczne generowanie wydarzeń według harmonogramu (tygodniowo, co dwa tygodnie).

**Wizja z goals.md:**
- Serie Treningowe - szablony cyklicznych wydarzeń
- Zarządzanie Seriami - generowanie i edycja

### Business Value

- **Oszczędność czasu**: Jeden szablon zamiast wielokrotnego tworzenia podobnych wydarzeń
- **Spójność**: Wszystkie wydarzenia w serii mają te same parametry
- **Planowanie**: Gracze wiedzą, że treningi są cykliczne

---

## Status Implementacji

| Funkcjonalność | Backend | Frontend | Uwagi |
|----------------|---------|----------|-------|
| **M1 - Basic (MVP)** |
| POST /series (tworzenie) | ✅ | ✅ | EventSeriesController |
| GET /series (lista) | ✅ | ✅ | Série organizatora |
| GET /series/{id} | ✅ | ✅ | Szczegóły |
| PUT /series/{id} | ✅ | ✅ | Aktualizacja szablonu |
| DELETE /series/{id} | ✅ | ✅ | Usunięcie szablonu |
| POST /series/{id}/generate | ✅ | ✅ | Generowanie wydarzeń |
| GET /series/{id}/events | ✅ | ✅ | Lista wydarzeń serii |
| GET /series/config | ✅ | ✅ | Limit generacji |
| Frequency: WEEKLY | ✅ | ✅ | Cotygodniowe |
| Frequency: BIWEEKLY | ✅ | ✅ | Co dwa tygodnie |
| Link event→series | ✅ | ✅ | FK series_id |
| **UI** |
| Lista serii | - | ✅ | series_list_screen.dart |
| Szczegóły serii | - | ✅ | series_details_screen.dart |
| Tworzenie serii | - | ✅ | create_series_screen.dart |
| Dialog generacji | - | ✅ | Wybór daty i liczby |
| **M2 - Advanced** |
| Frequency: MONTHLY | ⏳ | ❌ | BE ready, FE brak |
| skipHolidays | ⏳ | ❌ | BE ready, FE brak |
| pause/resume | ⏳ | ❌ | BE ready, FE brak |
| Multi-day per week | ❌ | ❌ | Obecnie 1 dzień |

---

## User Stories

### US-01: Tworzenie serii
**Jako** organizator
**Chcę** utworzyć szablon cyklicznych wydarzeń
**Aby** nie tworzyć każdego wydarzenia ręcznie

**Kryteria akceptacji:**
- [x] Formularz tworzenia serii
- [x] Wybór częstotliwości (WEEKLY/BIWEEKLY)
- [x] Wybór dnia tygodnia i godziny
- [x] Wszystkie pola jak przy tworzeniu wydarzenia
- [x] Walidacja formularza

### US-02: Generowanie wydarzeń
**Jako** organizator
**Chcę** wygenerować wydarzenia z szablonu
**Aby** szybko wypełnić kalendarz

**Kryteria akceptacji:**
- [x] Dialog generacji z wyborem daty startowej
- [x] Wybór liczby wydarzeń do wygenerowania
- [x] Limit max 20 wydarzeń na raz
- [x] Poprawne obliczanie dat wg częstotliwości
- [x] Wygenerowane wydarzenia widoczne na liście

### US-03: Przeglądanie serii
**Jako** organizator
**Chcę** zobaczyć listę moich serii
**Aby** zarządzać szablonami

**Kryteria akceptacji:**
- [x] Lista serii z podstawowymi informacjami
- [x] Status serii (ACTIVE/PAUSED)
- [x] Szczegóły serii z listą wygenerowanych wydarzeń

### US-04: Edycja serii
**Jako** organizator
**Chcę** edytować szablon serii
**Aby** zmienić parametry przyszłych wydarzeń

**Kryteria akceptacji:**
- [x] Edycja wszystkich pól szablonu
- [x] Zmiany nie wpływają na już wygenerowane wydarzenia
- [x] Walidacja jak przy tworzeniu

### US-05: Usuwanie serii
**Jako** organizator
**Chcę** usunąć szablon serii
**Aby** posprzątać nieużywane szablony

**Kryteria akceptacji:**
- [x] Usunięcie szablonu serii
- [x] Wygenerowane wydarzenia pozostają (stają się standalone)

---

## Reguły Biznesowe

### Tworzenie serii
1. Tylko zalogowani użytkownicy mogą tworzyć serie
2. Wymagane pola: tytuł, lokalizacja, częstotliwość, dzień tygodnia, godzina, czas trwania, liczba miejsc, typ sportu

### Generowanie wydarzeń
1. Tylko właściciel serii może generować wydarzenia
2. Nie można generować z serii PAUSED
3. Limit: max 20 wydarzeń na jedno generowanie
4. Data startowa musi być w przyszłości
5. Wydarzenia dziedziczą wszystkie pola z szablonu

### Powiązanie z wydarzeniami
1. Wygenerowane wydarzenia mają FK do serii (series_id)
2. Usunięcie serii nie usuwa wydarzeń
3. Edycja serii nie zmienia już wygenerowanych wydarzeń

---

## Scope

### M1 (MVP) - DONE
- [x] CRUD serii
- [x] Frequency: WEEKLY, BIWEEKLY
- [x] Generowanie z wyborem startDate + numberOfEvents
- [x] Limit 20 wydarzeń
- [x] Powiązanie event→series
- [x] UI: lista, szczegóły, tworzenie

### M2 (Post-MVP) - PARTIAL
- [ ] Frequency: MONTHLY
- [ ] skipHolidays (pomijanie świąt)
- [ ] pause/resume serii
- [ ] Multi-day per week (np. pon+śr+pt)
- [ ] Edycja wszystkich wydarzeń serii jednocześnie

---

## Powiązane Features

- [FEATURE_01](FEATURE_01_Basic_Event_Operations.md) - CRUD wydarzeń (prerequisite)
- [FEATURE_08](FEATURE_08_Player_Groups.md) - Serie grupowe

---

## Dokumentacja Techniczna

Szczegóły implementacji znajdują się w:
- Backend: [meet-app-be/docs/features/series.md](../../meet-app-be/docs/features/series.md)
- Frontend: [meet-app-fe/docs/features/series.md](../../meet-app-fe/docs/features/series.md)
