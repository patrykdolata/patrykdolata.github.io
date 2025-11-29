# Feature 03: Participant Management (Organizer)

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M1 (MVP) - basic, M2 - advanced |
| **Priority** | HIGH |
| **Status** | ✅ M1 Complete, ❌ M2 Not Started |
| **Goal** | Organizator ręcznie zarządza uczestnikami - dodawanie, usuwanie, listy |
| **Jira** | MA-441 |

---

## Overview

Organizator ma pełną kontrolę nad listą uczestników swojego wydarzenia. Może ręcznie dodawać i usuwać graczy, przeglądać listy główną i rezerwową.

**Wizja z goals.md:**
- Ręczna Kontrola - organizator decyduje kto jest na liście

---

## Status Implementacji

| Funkcjonalność | Backend | Frontend | Uwagi |
|----------------|---------|----------|-------|
| **M1 - Basic (MVP)** |
| POST /participants (add) | ✅ | ✅ | ParticipantController:69 |
| DELETE /participants/{userId} | ✅ | ✅ | ParticipantController:85 |
| GET /participants | ✅ | ✅ | Lista wszystkich |
| GET /participants/main-list | ✅ | ✅ | Tylko główna |
| GET /participants/waitlist | ✅ | ✅ | Tylko rezerwa |
| GET /participants/complete | ✅ | ✅ | Obie + metadata |
| Ekran zarządzania | - | ✅ | participant_manage_screen.dart |
| Dialog dodawania | - | ✅ | add_participant_dialog.dart |
| Dialog usuwania | - | ✅ | remove_participant_dialog.dart |
| Sprawdzanie organizatora | ✅ | ✅ | verifyOrganizer() |
| **M2 - Advanced** |
| PUT /{userId}/position | ❌ | ❌ | Zmiana pozycji (reorder) |
| PUT /{userId}/confirm | ❌ | ❌ | Toggle potwierdzenia |
| PUT /{userId}/payment | ❌ | ❌ | Śledzenie płatności |
| POST /{userId}/promote | ❌ | ❌ | Promocja do main list |
| POST /{userId}/demote | ❌ | ❌ | Degradacja do waitlist |
| Drag & drop | ❌ | ❌ | Przeciąganie pozycji |

---

## User Stories

### US-01: Dodawanie uczestnika (M1)
**Jako** organizator
**Chcę** ręcznie dodać gracza do wydarzenia
**Aby** zaprosić konkretną osobę

**Kryteria akceptacji:**
- [x] Przycisk "Dodaj uczestnika" widoczny tylko dla organizatora
- [x] Wyszukiwarka użytkowników
- [x] Dodanie do main list (jeśli miejsca) lub waitlist
- [x] Blokada duplikatów
- [x] Komunikat o powodzeniu

### US-02: Usuwanie uczestnika (M1)
**Jako** organizator
**Chcę** usunąć gracza z listy
**Aby** zwolnić miejsce dla innych

**Kryteria akceptacji:**
- [x] Przycisk "Usuń" przy każdym uczestniku
- [x] Potwierdzenie przed usunięciem
- [x] Auto-promocja z waitlist (jeśli włączona)
- [x] Aktualizacja slotów

### US-03: Przeglądanie list (M1)
**Jako** organizator
**Chcę** widzieć obie listy uczestników
**Aby** mieć pełny obraz

**Kryteria akceptacji:**
- [x] Zakładki: Main List / Waitlist
- [x] Pozycje uczestników
- [x] Licznik: X/slots

### US-04: Zmiana pozycji (M2)
**Jako** organizator
**Chcę** przesunąć uczestnika w kolejce
**Aby** zmienić priorytet

**Kryteria akceptacji:**
- [ ] Drag & drop na liście
- [ ] Renumeracja pozycji
- [ ] Endpoint PUT /position

### US-05: Śledzenie płatności (M2)
**Jako** organizator
**Chcę** oznaczyć kto zapłacił
**Aby** kontrolować finanse

**Kryteria akceptacji:**
- [ ] Toggle "Zapłacono"
- [ ] Wybór metody płatności
- [ ] Data płatności

---

## Reguły Biznesowe

### Dodawanie uczestnika
1. Tylko organizator może dodawać
2. Nie można dodać tego samego użytkownika dwa razy
3. Jeśli brak miejsc → waitlist
4. Zmniejsz slotsAvailable jeśli main list

### Usuwanie uczestnika
1. Tylko organizator może usuwać
2. Jeśli z main list + autoPromote → promuj pierwszego z waitlist
3. Renumeracja pozycji po usunięciu

### Promocja/Degradacja (M2)
1. Promocja wymaga wolnego slotu
2. Degradacja zwalnia slot
3. Powiadomienie dla użytkownika

---

## Scope

### M1 (MVP) - DONE
- [x] POST /participants (add)
- [x] DELETE /participants/{userId}
- [x] GET /participants (all, main-list, waitlist, complete)
- [x] UI: Ekran zarządzania
- [x] UI: Dialogi add/remove
- [x] Autoryzacja: tylko organizator

### M2 (Post-MVP) - NOT STARTED
- [ ] PUT /{userId}/position
- [ ] PUT /{userId}/confirm
- [ ] PUT /{userId}/payment
- [ ] POST /{userId}/promote
- [ ] POST /{userId}/demote
- [ ] Drag & drop reordering
- [ ] Payment tracking UI

---

## Powiązane Features

- [FEATURE_02](FEATURE_02_Join_Leave_Events.md) - Self-service join/leave (gracze)
- [FEATURE_01](FEATURE_01_Basic_Event_Operations.md) - CRUD wydarzeń

---

## Dokumentacja Techniczna

Szczegóły implementacji znajdują się w:
- Backend: [meet-app-be/docs/features/events.md](../../meet-app-be/docs/features/events.md) (sekcja Participants)
- Frontend: [meet-app-fe/docs/features/events.md](../../meet-app-fe/docs/features/events.md) (sekcja Participants)
