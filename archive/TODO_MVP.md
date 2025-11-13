# Meet App - MVP Plan do końca 2025 roku

> **Data rozpoczęcia:** 2025-11-12
> **Deadline:** 2025-12-31
> **Dostępny czas:** ~7 tygodni × 15h/tydzień = **~105 godzin**
>
> **Cel:** Działający proof-of-concept z podstawowymi funkcjami: mapa, dodawanie wydarzeń, dołączanie/opuszczanie

---

## 🎯 Stan obecny (2025-11-12)

### ✅ Co już działa:
- Sprint 0: Konfiguracja + Autoryzacja (**95% DONE**)
  - Backend Spring Boot + PostgreSQL
  - JWT authentication
  - Login/Register w Flutter
  - Token management

- Feature 0: Mapa z Wydarzeniami (**80% DONE**)
  - Google Maps integration
  - Markery wydarzeń
  - Pop-up z kartą wydarzenia
  - Grupowanie wydarzeń w tej samej lokalizacji

- Feature 5.5: Ulubione Lokalizacje (**90% DONE**)
  - Backend API complete
  - Flutter integration
  - Centrowanie mapy z ulubionych

### 🟡 W trakcie:
- Feature 1: Podstawowe operacje na Wydarzeniach (**40% DONE**)
  - GET/PUT endpoints działają
  - Brakuje: POST single event, rozszerzone DTOs, walidacje

---

## 📅 Plan na pozostałe 7 tygodni (~105h)

### **PRIORYTET: Działający proof-of-concept**

Zamiast wszystkich zaawansowanych features - focus na **minimum viable demo**, które możesz pokazać znajomym.

---

## Tydzień 1-2: Dokończenie Feature 1 - Events CRUD (30h)

**Cel:** Pełne zarządzanie wydarzeniami (dodawanie, edycja, usuwanie)

### Backend - Wydarzenia (15h)
- [ ] POST `/events` - single create endpoint **[~3h]**
- [ ] DTOs: CreateEventRequest, UpdateEventRequest (rozdzielenie) **[~3h]**
- [ ] Walidacje rozszerzone (startDateTime, slots, level, duration) **[~3h]**
- [ ] Query params: minLevel, maxLevel, locationId, maxPrice **[~3h]**
- [ ] EventRepository custom queries (filters) **[~3h]**

### Flutter - Wydarzenia (15h)
- [ ] CreateEventScreen + formularz **[~8h]**
  - Title, message, location picker
  - Date/time picker
  - Slots, price, level inputs
  - Basic validation
- [ ] HTTP POST `/events` integration **[~2h]**
- [ ] EditEventScreen (reuse CreateEvent logic) **[~3h]**
- [ ] Delete event + confirm dialog **[~2h]**

**Milestone Week 2:** Użytkownik może dodać, edytować i usunąć swoje wydarzenie ✅

---

## Tydzień 3-5: Feature 2 - Dołączanie/Opuszczanie (45h)

**Cel:** Użytkownicy mogą dołączać i opuszczać wydarzenia

### Backend - Join/Leave Logic (25h)
- [ ] Encja `EventParticipant` **[~4h]**
  - event (ManyToOne)
  - user (ManyToOne)
  - position (Integer)
  - status (enum: MAIN_LIST, WAITLIST)
  - joinedAt (LocalDateTime)
  - **UPROSZCZENIE:** Bez isPaid, paymentMethod na razie

- [ ] Migracja V1_2__Add_event_participant_table.sql **[~2h]**
- [ ] Enum ParticipantStatus (MAIN_LIST, WAITLIST) **[~1h]**
- [ ] EventParticipantRepository + query methods **[~3h]**
  - findByEventIdAndUserId
  - findByEventIdOrderByPositionAsc
  - countByEventIdAndStatus

- [ ] POST `/events/{id}/join` endpoint **[~3h]**
- [ ] DELETE `/events/{id}/leave` endpoint **[~3h]**
- [ ] GET `/events/{id}/participants` endpoint **[~2h]**
- [ ] DTOs: ParticipantDTO, ParticipantsListDTO **[~2h]**
- [ ] EventService.joinEvent() - main list vs waitlist logic **[~3h]**
- [ ] EventService.leaveEvent() - awans z waitlist **[~3h]**
- [ ] Custom exceptions (AlreadyJoinedException, EventFullException) **[~1h]**

### Flutter - Join/Leave UI (20h)
- [ ] Join button w EventDetailsScreen **[~2h]**
- [ ] HTTP POST `/events/{id}/join` **[~1h]**
- [ ] Leave button (jeśli już dołączony) **[~2h]**
- [ ] HTTP DELETE `/events/{id}/leave` **[~1h]**
- [ ] Update UI po join/leave (slots, participants count) **[~2h]**
- [ ] Handling waitlist status (badge, info) **[~2h]**
- [ ] Toast notifications (success/error) **[~1h]**
- [ ] ParticipantsListScreen - basic view **[~5h]**
  - Lista uczestników (nick, pozycja)
  - Main list vs waitlist sections
  - Pull-to-refresh
- [ ] HTTP GET `/events/{id}/participants` **[~1h]**
- [ ] Navigation: EventDetails → ParticipantsList **[~1h]**
- [ ] EventParticipantService + Notifier **[~2h]**

**Milestone Week 5:** Użytkownik może dołączyć do wydarzenia, zobaczyć listę uczestników, opuścić wydarzenie ✅

---

## Tydzień 6: UI Polish + Basic Features (15h)

**Cel:** Aplikacja wygląda profesjonalnie i jest użyteczna

### Flutter - UI Improvements (15h)
- [ ] Bottom Navigation Bar (Map/Events, Profile) **[~3h]**
- [ ] EventsListScreen - lista jako alternatywa dla mapy **[~4h]**
  - EventListItem widget
  - Pull-to-refresh
  - Switch między mapą a listą
- [ ] Loading skeletons (EventCard, Map) **[~2h]**
- [ ] Error states z retry button **[~2h]**
- [ ] Form validation messages (user-friendly) **[~2h]**
- [ ] Network error handling (offline mode info) **[~2h]**

**Milestone Week 6:** Aplikacja ma podstawowy navigation i error handling ✅

---

## Tydzień 7: Deployment + Testing (15h)

**Cel:** Aplikacja działa na prawdziwym serwerze, możesz pokazać znajomym

### Backend Deployment (10h)
- [ ] Konfiguracja .env (DB credentials, JWT_SECRET) **[~1h]**
- [ ] Test lokalny deployment (docker-compose?) **[~2h]**
- [ ] Deployment na serwer produkcyjny (RPi lub cloud) **[~4h]**
  - PostgreSQL setup
  - Java application running
  - Basic nginx/reverse proxy
- [ ] Seed danych testowych **[~2h]**
  - 3-5 użytkowników
  - 10-15 wydarzeń w Poznaniu
  - 5 lokalizacji

### Testing & Bug Fixes (5h)
- [ ] Smoke tests - główne flow **[~2h]**
  - Rejestracja → Login
  - Dodanie wydarzenia
  - Dołączenie do wydarzenia
  - Opuszczenie wydarzenia
- [ ] Critical bug fixes **[~3h]**

**Milestone Week 7:** Aplikacja live, możesz pokazać znajomym! 🚀

---

## 🎊 Co będziesz miał na koniec 2025 roku:

### ✅ Działające features:
- Mapa z markerami wydarzeń
- Rejestracja/logowanie
- Dodawanie własnych wydarzeń
- Edycja/usuwanie swoich wydarzeń
- Dołączanie do wydarzeń (main list + waitlist)
- Opuszczanie wydarzeń
- Lista uczestników
- Ulubione lokalizacje
- Podstawowy UI (bottom nav, error handling)
- **Deployment na produkcji**

### ❌ Features na 2026:
- Zaawansowane zarządzanie uczestnikami (płatności, potwierdzenia, drag&drop)
- Serie wydarzeń (cykliczne)
- Grupy siatkówki
- Rozszerzony profil użytkownika
- Event status (cancelled/completed)
- Powiadomienia (email/push)
- Pełne testowanie
- Płatności

---

## 📊 Podsumowanie godzin:

| Tydzień | Task | Godziny |
|---------|------|---------|
| 1-2 | Feature 1: Events CRUD | 30h |
| 3-5 | Feature 2: Join/Leave | 45h |
| 6 | UI Polish | 15h |
| 7 | Deployment + Testing | 15h |
| **TOTAL** | | **105h** |

---

## 🚀 Strategia realizacji:

### 1. **Focus na działającym demo**
Każdy feature musi być end-to-end (backend + Flutter + działa). Nie rób wszystkiego na backendzie, a potem dopiero frontend.

### 2. **Uproszczenia MVP**
- Bez płatności (paymentMethod, isPaid - na 2026)
- Bez drag&drop reordering (zwykła lista wystarczy)
- Bez zaawansowanych filtrów (tylko podstawowe)
- Bez powiadomień (na razie)

### 3. **Tygodniowe milestone'y**
Co tydzień musi być widoczny postęp. Jeśli coś nie działa po tygodniu - skip lub upraszczaj.

### 4. **Testuj na żywo**
Od tygodnia 3-4 pokaż znajomym i zbieraj feedback. Może okazać się, że niektóre features są niepotrzebne.

### 5. **Git commits & backup**
Codziennie commit + push. Będziesz mógł się cofnąć jeśli coś popsuje.

---

## 🎯 Definicja sukcesu (31.12.2025):

**MINIMUM (must have):**
- [x] Aplikacja działa na serwerze
- [x] Można dodać wydarzenie
- [x] Można dołączyć do wydarzenia
- [x] Można zobaczyć listę uczestników

**NICE TO HAVE:**
- [ ] Aplikacja na Google Play (internal testing)
- [ ] 5+ znajomych przetestowało
- [ ] Zero critical bugs

---

## 📞 Plan na Q1 2026 (preview):

Po pokazaniu znajomym i zebraniu feedbacku:

- **Styczeń:** Feature 3 - Participant Management (organizator może zarządzać)
- **Luty:** Feature 3.5 - Grupy siatkówki
- **Marzec:** Feature 4 - Serie wydarzeń (cykliczne)

**Cel Q1 2026:** Pełne MVP ready do pokazania szerszej grupie użytkowników

---

**Good luck! 💪 Masz wystarczająco czasu, żeby zrobić coś fajnego do końca roku!**
