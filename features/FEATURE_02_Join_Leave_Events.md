# Feature 02: Join/Leave Events

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M1 (MVP) |
| **Priority** | HIGH |
| **Status** | ✅ Complete |
| **Goal** | Gracze mogą samodzielnie dołączać i opuszczać wydarzenia z automatyczną listą rezerwową |
| **Jira** | MA-451, MA-443, MA-494, MA-495 |

---

## Overview

System umożliwia graczom samodzielne zapisywanie się na wydarzenia i rezygnację. Gdy lista główna jest pełna, gracze trafiają na listę rezerwową. Po zwolnieniu miejsca następuje automatyczna promocja pierwszej osoby z listy rezerwowej.

**Wizja z goals.md:**
- Samoobsługa Gracza - przycisk "Dołącz" / "Opuść"
- Inteligentna Lista Rezerwowa - automatyczne zarządzanie miejscami
- Auto-Uzupełnianie - promocja z waitlist po zwolnieniu miejsca

---

## Status Implementacji

| Funkcjonalność | Backend | Frontend | Uwagi |
|----------------|---------|----------|-------|
| **Dołączanie** |
| POST /join | ✅ | ✅ | EventJoinController:21 |
| Przycisk "Dołącz" | - | ✅ | W EventDetails |
| Dodanie do main list | ✅ | ✅ | Gdy są wolne miejsca |
| Dodanie do waitlist | ✅ | ✅ | Gdy brak miejsc |
| Blokada duplikatów | ✅ | ✅ | AlreadyJoinedException |
| **Opuszczanie** |
| DELETE /leave | ✅ | ✅ | EventJoinController:32 |
| Przycisk "Opuść" | - | ✅ | W EventDetails |
| Auto-promocja z waitlist | ✅ | ✅ | EventParticipantService |
| Renumeracja pozycji | ✅ | - | Po usunięciu |
| **Lista uczestników** |
| GET /participants | ✅ | ✅ | Pełna lista |
| GET /participants/main-list | ✅ | ✅ | Tylko główna lista |
| GET /participants/waitlist | ✅ | ✅ | Tylko rezerwa |
| GET /participants/complete | ✅ | ✅ | Obie listy w jednym call |
| GET /participants/status | ✅ | ✅ | Czy user jest uczestnikiem |
| **UI** |
| Lista główna z pozycjami | - | ✅ | participant_list_item.dart |
| Lista rezerwowa | - | ✅ | Z badge "Waitlist" |
| Status badge (Main/Waitlist) | - | ✅ | participant_status_card.dart |

---

## User Stories

### US-01: Dołączanie do wydarzenia
**Jako** gracz
**Chcę** dołączyć do wydarzenia jednym kliknięciem
**Aby** zarezerwować sobie miejsce

**Kryteria akceptacji:**
- [x] Przycisk "Dołącz" widoczny dla zalogowanych użytkowników
- [x] Organizator nie może dołączyć do własnego wydarzenia
- [x] Nie można dołączyć do odwołanego wydarzenia
- [x] Nie można dołączyć do wydarzenia które się już odbyło
- [x] Przy pełnej liście - automatyczne dodanie do waitlist
- [x] Komunikat o statusie (main list / waitlist)

### US-02: Opuszczanie wydarzenia
**Jako** uczestnik
**Chcę** zrezygnować z wydarzenia
**Aby** zwolnić miejsce dla innych

**Kryteria akceptacji:**
- [x] Przycisk "Opuść" dla uczestników
- [x] Potwierdzenie przed opuszczeniem
- [x] Automatyczna promocja pierwszej osoby z waitlist
- [x] Aktualizacja licznika wolnych miejsc
- [x] Komunikat o powodzeniu

### US-03: Przeglądanie listy uczestników
**Jako** użytkownik
**Chcę** zobaczyć kto jest zapisany na wydarzenie
**Aby** wiedzieć z kim będę grać

**Kryteria akceptacji:**
- [x] Lista główna z numerami pozycji
- [x] Lista rezerwowa z numerami pozycji
- [x] Widoczna data dołączenia
- [x] Pull-to-refresh

---

## Reguły Biznesowe

### Dołączanie
1. Wymagane zalogowanie (JWT)
2. Organizator nie może dołączyć do własnego wydarzenia
3. Nie można dołączyć dwa razy (AlreadyJoinedException)
4. Nie można dołączyć do CANCELLED wydarzenia
5. Nie można dołączyć do wydarzenia w przeszłości
6. Jeśli slotsAvailable > 0 → MAIN_LIST
7. Jeśli slotsAvailable = 0 → WAITLIST

### Opuszczanie
1. Tylko uczestnik może opuścić
2. Po opuszczeniu z main list:
   - Jeśli autoPromoteFromWaitlist = true → promocja pierwszego z waitlist
   - Jeśli false → zwiększ slotsAvailable
3. Renumeracja pozycji po usunięciu

### Auto-promocja
1. Pierwsza osoba z waitlist (position = 1) przechodzi do main list
2. Pozycja w main list = max(position) + 1
3. Powiadomienie dla wypromowanej osoby (jeśli sendNotifications = true)

---

## Scope

### M1 (MVP) - DONE
- [x] POST /events/{id}/join
- [x] DELETE /events/{id}/leave
- [x] GET /events/{id}/participants
- [x] ParticipantStatus: MAIN_LIST, WAITLIST
- [x] Auto-promocja z waitlist
- [x] UI: przyciski Join/Leave
- [x] UI: lista uczestników

### M2 (Post-MVP)
- [ ] Powiadomienia push o promocji
- [ ] Limit wielkości waitlist (maxWaitlistSize)
- [ ] Historia uczestnictwa użytkownika

---

## Powiązane Features

- [FEATURE_01](FEATURE_01_Basic_Event_Operations.md) - Tworzenie wydarzeń (prerequisite)
- [FEATURE_03](FEATURE_03_Participant_Management.md) - Zarządzanie przez organizatora

---

## Dokumentacja Techniczna

Szczegóły implementacji znajdują się w:
- Backend: [meet-app-be/docs/features/events.md](../../meet-app-be/docs/features/events.md) (sekcja Participants)
- Frontend: [meet-app-fe/docs/features/events.md](../../meet-app-fe/docs/features/events.md) (sekcja Participants)
