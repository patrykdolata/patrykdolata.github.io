# Feature 07: Event Lifecycle (Status & Cancellation)

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M1 (MVP) - cancel, M2 - complete |
| **Priority** | MEDIUM |
| **Status** | ✅ M1 Complete, ⏳ M2 Partial |
| **Goal** | Pełna obsługa cyklu życia wydarzenia (ACTIVE/CANCELLED/COMPLETED) |
| **Jira** | MA-427, MA-405 |

---

## Overview

Zarządzanie statusem wydarzeń: aktywne, odwołane, zakończone. Automatyczne kończenie przeszłych wydarzeń i powiadomienia dla uczestników.

**Wizja z goals.md:**
- Cykl Życia Wydarzenia - statusy i przejścia

### Business Value

- **Klarowność**: Użytkownicy widzą status wydarzenia
- **Informacja**: Uczestnicy są powiadomieni o odwołaniu
- **Automatyzacja**: Automatyczne kończenie przeszłych wydarzeń
- **Filtrowanie**: Łatwe ukrywanie nieaktualnych wydarzeń

---

## Status Implementacji

| Funkcjonalność | Backend | Frontend | Uwagi |
|----------------|---------|----------|-------|
| **M1 - Basic Cancel** |
| EventStatus enum | ✅ | ✅ | ACTIVE, CANCELLED, COMPLETED |
| PUT /events/{id}/cancel | ✅ | ✅ | Zaimplementowane |
| Status badge | - | ⏳ | Częściowe |
| Cancel button | - | ✅ | OrganizerActionsCard |
| **M2 - Complete Lifecycle** |
| Status: COMPLETED | ✅ | ⏳ | Enum gotowy |
| PUT /events/{id}/complete | ✅ | ❌ | BE: EventController |
| Auto-completion (cron) | ✅ | - | EventScheduledTasks (hourly) |
| Cancel reason | ⏳ | ❌ | BE ready, FE brak |
| Participant notification | ❌ | ❌ | Nie zaimplementowane |
| Status filters | ⏳ | ❌ | BE ready, FE brak |

---

## User Stories

### US-01: Odwoływanie wydarzenia
**Jako** organizator
**Chcę** odwołać wydarzenie
**Aby** poinformować uczestników

**Kryteria akceptacji:**
- [x] Endpoint PUT /events/{id}/cancel (BE)
- [ ] Przycisk "Odwołaj" w UI
- [ ] Opcjonalny powód odwołania
- [x] Tylko organizator może odwołać
- [ ] Powiadomienie uczestników

### US-02: Wyświetlanie statusu
**Jako** użytkownik
**Chcę** widzieć status wydarzenia
**Aby** wiedzieć czy jest aktualne

**Kryteria akceptacji:**
- [x] Badge statusu na karcie wydarzenia
- [x] Status CANCELLED wyróżniony
- [ ] Status COMPLETED (szary)

### US-03: Filtrowanie po statusie
**Jako** użytkownik
**Chcę** filtrować wydarzenia po statusie
**Aby** widzieć tylko aktualne

**Kryteria akceptacji:**
- [ ] Toggle "Ukryj odwołane"
- [ ] Toggle "Ukryj zakończone"
- [ ] Domyślnie ukrywaj nieaktywne

### US-04: Automatyczne kończenie
**Jako** system
**Chcę** automatycznie kończyć przeszłe wydarzenia
**Aby** utrzymać aktualność danych

**Kryteria akceptacji:**
- [ ] Cron job co godzinę
- [ ] Status → COMPLETED po endDateTime

---

## Reguły Biznesowe

### Odwoływanie
1. Tylko organizator może odwołać
2. Nie można odwołać już odwołanego
3. Nie można odwołać zakończonego
4. Uczestnicy pozostają w historii
5. Powód jest opcjonalny (max 500 znaków)

### Statusy
- **ACTIVE**: Wydarzenie jest aktywne, można dołączać
- **CANCELLED**: Wydarzenie odwołane przez organizatora
- **COMPLETED** (M2): Wydarzenie się odbyło

### Przejścia statusów
- ACTIVE → CANCELLED (organizator)
- ACTIVE → COMPLETED (auto lub organizator)
- CANCELLED → brak (nieodwracalne)
- COMPLETED → brak (nieodwracalne)

---

## Scope

### M1 (MVP) - COMPLETE
- [x] EventStatus enum (ACTIVE, CANCELLED, COMPLETED)
- [x] PUT /cancel endpoint (BE)
- [x] Status w modelu wydarzenia
- [x] Cancel button w UI (OrganizerActionsCard)
- [ ] Status badge na kartach

### M2 (Post-MVP) - PARTIAL
- [x] Status COMPLETED
- [x] PUT /complete endpoint
- [x] Auto-completion cron job (hourly)
- [ ] Powiadomienia o odwołaniu
- [ ] Filtry statusu w UI
- [ ] Cancel dialog z powodem
- [ ] Complete button w UI

---

## Powiązane Features

- [FEATURE_01](FEATURE_01_Basic_Event_Operations.md) - CRUD wydarzeń
- [FEATURE_02](FEATURE_02_Join_Leave_Events.md) - Uczestnicy

---

## Dokumentacja Techniczna

Szczegóły implementacji znajdują się w:
- Backend: [meet-app-be/docs/features/events.md](../../meet-app-be/docs/features/events.md) (sekcja Cancel)
- Frontend: [meet-app-fe/docs/features/events.md](../../meet-app-fe/docs/features/events.md) (brak cancelEvent)
