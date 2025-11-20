# Meet App - TODO Lista (Organizer-Focused MVP)

> **Projekt:** Aplikacja do planowania wydarzeń siatkówki
> **Stack:** Spring Boot (Backend) + Flutter (Mobile) + PostgreSQL
> **Solo developer:** Wszystko robione samodzielnie
> **Start:** 2025-11-13
> **Cel:** Działający MVP dla ORGANIZATORA do końca 2025 roku

---

## 🎯 PROJECT STATUS

- **Current Phase:** MILESTONE 1 - Organizer MVP (ZAKTUALIZOWANY)
- **Target:** 2025-12-31 (7-8 tygodni)
- **Weekly hours:** 15h
- **Overall progress:** 38%
- **Last updated:** 2025-11-20

### ✅ What's Working:
- Sprint 0: Auth & JWT (95% done)
- Feature 0: Mapa z markerami (80% done)
- Feature 5.5: Ulubione lokalizacje (90% done)
- **Feature 1: Basic Events CRUD (93% done)** ✅ CREATE/EDIT/DELETE works!

### 🔴 Current Focus (Next 2 weeks):
- Feature 3: Zarządzanie uczestnikami RĘCZNIE (30h) 👈 START HERE
- **⭐ Feature S1: Minimalny Self-Service Join/Leave (10h)** 👈 NOWE!
- **⭐ Feature S2: Simple Waitlist FIFO (10h)** 👈 NOWE!
- **⭐ Feature S3: Auto-Promocja z waitlisty (5h)** 👈 NOWE!
- Feature 4: Cykliczne wydarzenia (25h)
- Feature 6: Bottom navigation (15h)

---

## 📋 MILESTONE 1 (ZMODYFIKOWANY): Organizer MVP + Minimum Self-Service 🔴 [DO KOŃCA 2025]

**Deadline:** 2025-12-31 (7-8 tygodni)
**Focus:** Organizator tworzy, zarządza i automatycznie uzupełnia skład (podstawowo)
**Total:** ~140h (było ~115h + 25h na self-service)

### NOWA Definicja Sukcesu:
- [x] Użytkownik może się zarejestrować i zalogować
- [x] Użytkownik widzi wydarzenia na mapie
- [x] ORGANIZATOR może stworzyć wydarzenie (CreateEventScreen ✅)
- [ ] ORGANIZATOR może RĘCZNIE dodać uczestników do wydarzenia
- [ ] **⭐ UCZESTNIK może DOŁĄCZYĆ do wydarzenia** (self-service join)
- [ ] **⭐ UCZESTNIK może OPUŚCIĆ wydarzenie** (self-service leave)
- [ ] **⭐ Prosta WAITLISTA (FIFO)** - uczestnicy ponad limit na waitliście
- [ ] **⭐ Auto-promocja z waitlisty** - gdy ktoś opuszcza, pierwszy z waitlisty awansuje
- [ ] ORGANIZATOR może stworzyć serię cyklicznych wydarzeń (co tydzień)
- [x] ORGANIZATOR widzi swoje wydarzenia (kalendarz/lista)
- [ ] Aplikacja działa na produkcji

**POWÓD ZMIANY:** Organizator nie będzie ręcznie dodawał wszystkich graczy – MVP musi pozwalać im dołączać samodzielnie.

---

## Sprint 0: Konfiguracja Backend & Autoryzacja ✅ [95% DONE]

### Konfiguracja Projektu
- [x] Utworzenie projektu Spring Boot
- [x] Konfiguracja PostgreSQL
- [x] Setup application.yml
- [x] Struktura pakietów
- [x] Konfiguracja Lombok, Validation

### Model Bazy Danych - Encje JPA (Podstawowe)
- [x] Encja UserEntity
- [x] Encja LocationEntity
- [x] Encja EventEntity (podstawowa)
- [x] Encja FavoritePlaceEntity
- [x] Encja PostEntity
- [x] Encja TokenEntity

### Migracje Bazy Danych (Flyway)
- [x] Setup Flyway w projekcie
- [x] V1_0__Initial_schema.sql
- [x] V1_1__Fix_null_user_roles.sql

### Spring Security & JWT
- [x] JwtService (generateToken, validateToken)
- [x] JwtAuthenticationFilter
- [x] UserDetailsService implementation
- [x] SecurityConfiguration (CORS, CSRF)
- [x] LogoutService
- [x] TokenEntity & TokenRepository

### Auth Endpoints (Backend)
- [x] POST /api/v1/auth/register
- [x] POST /api/v1/auth/authenticate
- [x] POST /api/v1/auth/refresh-token
- [x] GET /api/v1/auth/validate-token
- [x] POST /api/v1/auth/logout

### Auth Implementation (Flutter)
- [x] JWT storage w Flutter (SecureStorage)
- [x] HTTP client setup (dio) z Authorization header
- [x] UserService (login/logout state)
- [x] Login/Register forms
- [x] Token validation i auto-refresh

**Sprint 0 Status: ✅ DONE**

---

## Feature 0: Mapa z Wydarzeniami ✅ [80% DONE]

### Backend - Mapa API
- [x] GET /api/v1/events - zwraca wydarzenia z lokalizacjami
- [x] EventEntity ma relację do LocationEntity
- [x] LocationEntity ma latitude i longitude
- [x] EventRepository.findAllWithLocation() - JOIN FETCH

### Flutter - Mapa (Google Maps)
- [x] GoogleMapWidget z google_maps_flutter
- [x] Centrowanie na Poznań
- [x] Markery wydarzeń z custom ikoną
- [x] Grupowanie wydarzeń w tej samej lokalizacji
- [x] Pop-up z kartą wydarzenia (EventPopUpCard)
- [x] PageView dla wielu wydarzeń w jednym miejscu
- [x] Dots indicator dla paginacji
- [x] Tap na marker → zoom + centrowanie + pop-up
- [x] Tap na mapie → ukrywa pop-up
- [x] FloatingActionButton refresh
- [x] EventMarkerService - filtruje nieaktualne
- [x] FavoriteLocationNotifier - centrowanie z ulubionych

**Feature 0 Status: ✅ 80% DONE**

---

## Feature 1: Podstawowe operacje na Wydarzeniach ✅ [93% DONE → 2h opcjonalne]

**Priorytet:** CRITICAL - organizator musi móc tworzyć wydarzenia
**Deadline:** Tydzień 1-2 (do 2025-11-27)
**Scope M1:** Basic CRUD (POST/GET/PUT/DELETE) + minimal cancel
**Out of Scope M1:** SportType enum, zaawansowane filtry (minLevel, sportType, search) - to Post-MVP

### Backend - Wydarzenia CRUD [15h]

#### Obecny stan:
- [x] EventController - podstawowa struktura
- [x] GET /api/v1/events - lista wydarzeń
- [x] GET /api/v1/events/{id} - szczegóły
- [x] PUT /api/v1/events - bulk add/update
- [x] PUT /api/v1/events/{id} - edycja
- [x] DELETE /api/v1/events/{id} - usunięcie
- [x] EventService podstawowy

#### Do zrobienia:
- [x] POST /events (single create) [3h]
  - [x] Endpoint implementation + DTO mapping [2h]
  - [x] Validation logic + error handling [1h]

- [x] DTOs: CreateEventRequest, UpdateEventRequest (rozdzielenie) [3h]
  - [x] CreateEventRequest DTO + validation [2h]
  - [x] UpdateEventRequest DTO + partial update logic [1h]

- [x] Walidacje rozszerzone [3h]
  - [x] DateTime & duration validations [2h]
  - [x] Slots & level business logic validations [1h]

- [x] Query params: organizerId (moje wydarzenia) [3h] ✅ (2025-11-14)
  - [x] GET /api/v1/events?organizerId={id} [2h]
  - [x] EventRepository.findByUserIdWithLocation [1h]

- [x] EventRepository custom queries [3h] ✅ (2025-11-14)
  - [x] Filter by organizerId with JOIN FETCH [2h]
  - [x] Query optimization + ordering by startDateTime [1h]

#### Minimalny status i odwołanie (M1) - OPCJONALNE
**Uwaga:** Pełna funkcjonalność cancel to M2 (FEATURE_07), w M1 wystarczy DELETE
- [x] EventStatus enum z CANCELLED (bez COMPLETED, DRAFT) [1h] ✅ (2025-11-19)
- [x] PUT /api/v1/events/{id}/cancel - tylko zmiana statusu [1h] ✅ (2025-11-19)
- [x] Badge "Cancelled" w UI [1h] ✅ (2025-11-19)
**Total:** 3h (opcjonalne dla M1)

### Flutter - Wydarzenia CRUD [15h]

#### Obecny stan:
- [x] EventDetailsWidget - pełny widok szczegółów
- [x] EventDetailsScreen - routing + navigation

#### Do zrobienia:
- [x] CreateEventScreen + formularz [8h] ✅ (2025-11-14)
  - [x] Screen structure + form builder [2h]
  - [x] Basic fields (title, message, dateTime) [2h]
  - [x] Location picker integration [1h]
  - [x] Slots, price, level inputs [2h]
  - [x] Form validation + submission [1h]

- [x] HTTP POST /api/v1/events integration [2h]

- [x] EditEventScreen (reuse CreateEvent logic) [3h]
  - [x] Screen setup + pre-fill data [2h]
  - [x] Update API integration [1h]

- [x] Delete event + confirm dialog [2h]
  - [x] Confirm dialog UI [1h]
  - [x] Delete API call + UI update [1h]

**Feature 1 Milestone M1:** Organizator może dodać, edytować i usunąć swoje wydarzenie ✅

**Out of Scope M1** (Post-MVP w FEATURE_01.md):
- SportType enum (12 typów sportów)
- Zaawansowane filtry (sportType, minLevel, maxLevel, search, availableOnly)
- Group linking (to FEATURE_03.5)
- Visibility days, auto-promote toggles
- Cancel with notifications (pełna wersja to FEATURE_07)

---

## Feature 3: Zarządzanie Uczestnikami - MANUAL 🔴 [0% DONE → 30h]

**Priorytet:** CRITICAL - organizator musi móc zarządzać listą
**Deadline:** Tydzień 3-4 (do 2025-12-11)
**Scope:** Organizator RĘCZNIE dodaje/usuwa uczestników

**UWAGA:** W tym MVP **BEZ self-service** (uczestnik NIE może sam dołączyć)

### Backend - Manual Participant Management [15h]

- [x] Encja EventParticipant (uproszczona) [3h]
  - [x] Podstawowa struktura encji [2h]
    - event (ManyToOne → EventEntity)
    - user (ManyToOne → UserEntity)
    - position (Integer)
    - addedAt (LocalDateTime)
    - addedBy (ManyToOne → UserEntity) - kto dodał
  - [x] Relacje + indeksy [1h]
  - **BEZ:** status (MAIN_LIST/WAITLIST), isPaid, isConfirmed, paymentMethod

- [x] Migracja V1_2__Add_event_participant_table.sql [2h]

- [x] EventParticipantRepository + query methods [1h]
  - [x] Repository interface [1h]
  - [x] findByEventIdOrderByPositionAsc [0.5h]
  - [x] countByEventId [0.5h]

- [x] POST /api/v1/events/{eventId}/participants (manual add) [3h]
  - [x] Endpoint implementation [2h]
  - [x] DTO: AddParticipantRequest (userId lub email) [0.5h]
  - [x] Authorization: tylko organizator [0.5h]

- [x] DELETE /api/v1/events/{eventId}/participants/{userId} (remove) [2h]
  - [x] Endpoint implementation [1h]
  - [x] Authorization: tylko organizator [1h]

- [x] GET /api/v1/events/{eventId}/participants (lista) [1h]
  - [x] Endpoint + DTO [1h]
  - [x] ParticipantDTO (user info, position) [1h]

- [x] ParticipantService - manual management [2h]
  - [x] addParticipant (manual by organizer) [1h]
  - [x] removeParticipant [1h]
  - [x] Renumber positions [1h]

- [x] Sprawdzanie uprawnień: tylko organizator wydarzenia [1h]

### Flutter - Manual Participant Management UI [15h]

- [x] ParticipantsManageScreen (dla organizatora) [4h]
  - [x] Screen structure + lista uczestników [2h]
  - [x] Navigation z EventDetails [1h]
  - [x] Warunek: tylko dla organizatora [1h]

- [x] Lista uczestników - prosta [3h]
  - [x] ParticipantListItem widget [2h]
  - [x] Avatar + nickname + position display [1h]

- [x] Dodaj uczestnika - manual [3h]
  - [x] Add button [1h]
  - [x] Search user dialog (po nicku/email) [2h]
- [x] HTTP POST /api/v1/events/{id}/participants [1h]

- [x] Usuń uczestnika [2h]
  - [x] Remove button + confirm dialog [1h]
  - [x] HTTP DELETE [1h]

- [x] Update UI po dodaniu/usunięciu [1h]

- [x] ParticipantManagementService + Notifier [2h]
  - [x] Service structure [1h]
  - [x] State management [1h]

**Feature 3 Milestone:** Organizator może RĘCZNIE zarządzać listą uczestników ✅

**Na Q1 2026:**
- Płatności (isPaid, paymentMethod)
- Drag&drop reordering
- Advanced waitlist (manual promote/demote)

---

## 🆕 Feature S1: Self-Service Join/Leave — SIMPLE 🔴 [0% DONE → 10h]

**Priorytet:** CRITICAL - uczestnicy muszą móc dołączać samodzielnie
**Deadline:** Tydzień 4 (do 2025-12-04)
**Scope:** Minimalna wersja - uczestnik może dołączyć lub opuścić wydarzenie

### Backend - Self-Service Join/Leave [6h]

- [ ] POST /api/v1/events/{eventId}/join [2h]
  - [ ] Endpoint implementation [1h]
  - [ ] Walidacja: czy event jest dostępny, czy nie jest pełny [0.5h]
  - [ ] Authorization: tylko zalogowani użytkownicy [0.5h]

- [ ] DELETE /api/v1/events/{eventId}/leave [2h]
  - [ ] Endpoint implementation [1h]
  - [ ] Walidacja: czy uczestnik jest na liście [1h]

- [ ] ParticipantService.joinEvent() [1h]
  - [ ] Dodanie uczestnika na koniec listy [0.5h]
  - [ ] Sprawdzenie limitu (slots) [0.5h]

- [ ] ParticipantService.leaveEvent() [1h]
  - [ ] Usunięcie uczestnika [0.5h]
  - [ ] Renumeracja pozycji [0.5h]

### Flutter - Self-Service Join/Leave UI [4h]

- [ ] Join button w EventDetailsScreen [2h]
  - [ ] Button UI + warunek (czy user już jest na liście) [1h]
  - [ ] HTTP POST /api/v1/events/{id}/join [0.5h]
  - [ ] Toast confirmation [0.5h]

- [ ] Leave button w EventDetailsScreen [1h]
  - [ ] Button UI + confirm dialog [0.5h]
  - [ ] HTTP DELETE /api/v1/events/{id}/leave [0.5h]

- [ ] Update UI po join/leave [1h]
  - [ ] Refresh event details [0.5h]
  - [ ] Update participants count [0.5h]

**Feature S1 Milestone:** Uczestnik może sam dołączyć i opuścić wydarzenie ✅

---

## 🆕 Feature S2: Simple Waitlist (FIFO) 🔴 [0% DONE → 10h]

**Priorytet:** CRITICAL - zarządzanie nadwyżką uczestników
**Deadline:** Tydzień 5 (do 2025-12-11)
**Scope:** Prosta waitlista FIFO - kto pierwszy, ten pierwszy

### Backend - Simple Waitlist [6h]

- [x] Enum ParticipantStatus (MAIN_LIST, WAITLIST) [1h]
  - [x] Dodanie do EventParticipant [0.5h]
  - [x] Migracja [0.5h]

- [x] Logika main list vs waitlist w joinEvent() [2h]
  - [x] Sprawdzenie liczby uczestników na MAIN_LIST [1h]
  - [x] Automatyczne przypisanie statusu (MAIN_LIST lub WAITLIST) [1h]

- [x] GET /api/v1/events/{eventId}/participants - zwraca obie listy [1h]
  - [x] DTO rozszerzone o status [0.5h]
  - [x] Sortowanie (MAIN_LIST na górze) [0.5h]

- [ ] Dodanie pola waitlistCount do EventDTO [1h]
  - [ ] Obliczanie liczby na waitliście [1h]

- [ ] Testy logiki waitlist [1h]

### Flutter - Simple Waitlist UI [4h]

- [ ] Waitlist badge w EventDetailsScreen [1h]
  - [ ] Badge "Main List" / "Waitlist" przy join button [0.5h]
  - [ ] Info o pozycji na waitliście [0.5h]

- [ ] Podział listy uczestników (ParticipantsManageScreen) [2h]
  - [ ] Sekcja "Main List" (slots first) [1h]
  - [ ] Sekcja "Waitlist" (reszta) [1h]

- [ ] Wyświetlanie liczby na waitliście [1h]
  - [ ] EventPopUpCard update [0.5h]
  - [ ] EventDetailsScreen update [0.5h]

**Feature S2 Milestone:** Prosta waitlista działa (FIFO) ✅

---

## 🆕 Feature S3: Auto-Promocja z Waitlisty 🔴 [0% DONE → 5h]

**Priorytet:** HIGH - automatyczne uzupełnianie składu
**Deadline:** Tydzień 5 (do 2025-12-11)
**Scope:** Automatyczny awans pierwszej osoby z waitlisty

### Backend - Auto-Promocja [3h]

- [ ] ParticipantService.promoteFromWaitlist() [2h]
  - [ ] Znalezienie pierwszego z WAITLIST (order by position) [0.5h]
  - [ ] Zmiana statusu WAITLIST → MAIN_LIST [0.5h]
  - [ ] Renumeracja pozycji [1h]

- [ ] Wywołanie promoteFromWaitlist() w leaveEvent() [1h]
  - [ ] Hook po usunięciu uczestnika [0.5h]
  - [ ] Sprawdzenie, czy jest ktoś na waitliście [0.5h]

### Flutter - Auto-Promocja UI [2h]

- [ ] Toast notification o promocji [1h]
  - [ ] "Awansowałeś z waitlisty!" [0.5h]
  - [ ] Event listener (polling lub push w przyszłości) [0.5h]

- [ ] Update UI po promocji [1h]
  - [ ] Refresh participant list [0.5h]
  - [ ] Update badge status [0.5h]

**Feature S3 Milestone:** Automatyczna promocja działa ✅

**Na Q1 2026:**
- Email/push notification o promocji
- Manual promote/demote przez organizatora
- Drag&drop reordering

---

## Feature 4: Cykliczne Wydarzenia - BASIC 🔴 [0% DONE → 25h]

**Priorytet:** HIGH - organizator potrzebuje cyklicznych meczów
**Deadline:** Tydzień 5-6 (do 2025-12-25)
**Scope:** Tworzenie serii cyklicznych wydarzeń (co tydzień/2 tygodnie)

### Backend - Event Series BASIC [15h]

- [ ] Encja EventSeries (uproszczona) [3h]
  - [ ] Podstawowa struktura [2h]
    - id, name, organizer (ManyToOne → User)
    - location (ManyToOne → Location)
    - frequency (enum: WEEKLY, BIWEEKLY)
    - dayOfWeek (Integer: 1-7)
    - time (LocalTime)
    - defaultSlots, defaultPrice, defaultLevel
  - [ ] Relacje [1h]
  - **BEZ:** schedule string, skipHolidays, status, frequencyInterval

- [ ] Enum SeriesFrequency (WEEKLY, BIWEEKLY) [1h]

- [ ] Migracja V1_3__Add_event_series_table.sql [2h]

- [ ] Link Event → Series (seriesId FK optional) [1h]

- [ ] SeriesRepository [1h]

- [ ] SeriesController [1h]
- [ ] POST /api/v1/series (create series)
- [ ] GET /api/v1/series?organizerId={id}

- [ ] POST /api/v1/series/{id}/generate (generowanie wydarzeń) [4h]
  - [ ] Endpoint + validation [1h]
  - [ ] DTO: GenerateEventsRequest (startDate, count) [1h]
  - [ ] Logika generowania [2h]
    - Oblicz daty na podstawie frequency + dayOfWeek
    - Utwórz wydarzenia (batch insert)
    - Max 20 wydarzeń na raz

- [ ] SeriesService.generateEvents() [2h]
  - [ ] Date calculation logic (weekly/biweekly) [2h]
  - [ ] Batch event creation [1h]

**BEZ w MVP:**
- Monthly frequency
- skipHolidays logic
- PAUSE/RESUME series
- Edit series (można usunąć i stworzyć nową)

### Flutter - Event Series BASIC UI [10h]

- [ ] CreateSeriesScreen (basic) [3h]
  - [ ] Screen structure + form [2h]
  - [ ] Basic fields (name, location) [1h]
  - [ ] Default values (slots, price, level) [1h]

- [ ] Frequency picker (WEEKLY/BIWEEKLY) [2h]
  - [ ] Dropdown picker [1h]
  - [ ] Day of week picker (Poniedziałek-Niedziela) [1h]

- [ ] Time picker [1h]

- [ ] Generate events dialog [1h]
  - [ ] Start date picker [1h]
  - [ ] Count input (ile wydarzeń wygenerować) [1h]

- [ ] HTTP POST /api/v1/series + /api/v1/series/{id}/generate [1h]

- [ ] SeriesService + SeriesNotifier [2h]

**Feature 4 Milestone:** Organizator może stworzyć serię cyklicznych wydarzeń ✅

**Na Q1 2026:**
- MONTHLY frequency
- skipHolidays
- Preview list przed generowaniem
- PAUSE/RESUME logic
- Edit series

---

## Feature 6: UI Basics dla Organizatora 🔴 [15h]

**Priorytet:** HIGH - organizator musi łatwo zarządzać
**Deadline:** Tydzień 7 (do 2025-12-28)
**Scope:** Podstawowy UI dla organizatora
**Progress:** 6/15h – EventsListScreen + bottom nav gotowe

### Flutter - Organizer UI [15h]

- [ ] MyEventsScreen (organizator widzi swoje wydarzenia) [4h]
  - [ ] Screen structure + ListView [2h]
  - [ ] GET /api/v1/events?organizerId=me [1h]
  - [ ] EventListItem widget [1h]

- [x] Bottom Navigation Bar (Map, My Events, Profile) [3h]
  - [x] Bottom nav bar UI + icons [1h]
  - [x] Navigation state management [1h]
  - [x] Integration [1h]

- [x] EventsListScreen - lista wszystkich wydarzeń [3h]
  - [x] Screen structure + ListView [2h]
  - [x] Pull-to-refresh [1h]

- [ ] Loading skeletons [2h]
  - [ ] Skeleton widgets [1h]
  - [ ] Integration [1h]

- [x] Error states z retry button [2h] ✅ (2025-11-19)
  - [x] Error widgets [1h]
  - [x] Retry logic [1h]

- [ ] Network error handling [1h]

**Feature 6 Milestone:** Organizator ma wygodny interfejs do zarządzania ✅

---

## Deployment + Testing 🔴 [15h]

**Priorytet:** CRITICAL - musi działać live
**Deadline:** Tydzień 7-8 (do 2025-12-31)
**Scope:** Aplikacja dostępna online

### Backend Deployment [10h]

- [ ] Konfiguracja .env [1h]
  - [ ] DB credentials
  - [ ] JWT_SECRET
  - [ ] Production settings

- [ ] Test lokalny deployment (docker-compose) [2h]

- [ ] Deployment na serwer produkcyjny [4h]
  - [ ] PostgreSQL setup
  - [ ] Java application (systemd service)
  - [ ] Nginx reverse proxy
  - [ ] SSL certificate (Let's Encrypt)

- [ ] Seed danych testowych [2h]
  - [ ] 5 użytkowników (w tym 2 organizatorów)
  - [ ] 15 wydarzeń w Poznaniu
  - [ ] 5 lokalizacji (hale sportowe)
  - [ ] 2 serie cykliczne

- [ ] Monitoring basic [1h]
  - [ ] Uptime check
  - [ ] Error logging

### Testing & Bug Fixes [5h]

- [ ] Smoke tests - główne flow [2h]
  - [ ] Rejestracja → Login
  - [ ] Dodanie wydarzenia (jako organizator)
  - [ ] Dodanie uczestnika do wydarzenia
  - [ ] Usunięcie uczestnika
  - [ ] Utworzenie serii cyklicznej
  - [ ] Wygenerowanie wydarzeń z serii

- [ ] Critical bug fixes [3h]

**Deployment Milestone:** Aplikacja live dla organizatorów! 🚀

---

## 🎊 MILESTONE 1 SUCCESS CRITERIA

Do końca 2025 roku muszą działać:
- [x] Rejestracja/logowanie
- [x] Mapa z wydarzeniami
- [x] Organizator może dodać wydarzenie (CreateEventScreen ✅)
- [x] Organizator może edytować/usunąć wydarzenie (EditEventScreen ✅)
- [ ] Organizator może RĘCZNIE dodać uczestnika do wydarzenia
- [ ] Organizator może usunąć uczestnika
- [ ] Organizator może stworzyć serię cyklicznych wydarzeń
- [x] Organizator widzi swoje wydarzenia (lista)
- [ ] Aplikacja działa na produkcji

**Total Milestone 1: ~115h = 7-8 tygodni (15h/tydzień)**

---

# 📋 MILESTONE 2 (ZMODYFIKOWANY): Advanced Features 🟡 [Q1 2026]

**Scope:** Zaawansowane funkcje dla organizatora i uczestników

**UWAGA:** Self-service join/leave i basic waitlist przeszły do M1 2025!

### Backend [35h]
- [x] Custom exceptions [2h] ✅ (2025-11-19)
- [ ] Manual promote/demote z waitlisty [8h]
- [ ] Drag & drop reordering positions [6h]
- [ ] Payment tracking (isPaid, paymentMethod) [10h]
- [ ] MONTHLY frequency dla serii [5h]
- [ ] skipHolidays logic [4h]

### Flutter [30h]
- [ ] ParticipantsListScreen (public view) [5h]
- [ ] Manual promote/demote UI [6h]
- [ ] Drag & drop reordering UI [5h]
- [ ] Payment tracking UI [8h]
- [ ] Advanced series management [6h]

**Dlaczego Q1 2026:** MVP ma już podstawowe self-service, zaawansowane funkcje mogą poczekać

---

## Feature 3: Zarządzanie Uczestnikami - ADVANCED [45h]

**Scope:** Zaawansowane zarządzanie dla organizatora

### Backend [25h]
- [ ] Pola w EventParticipant: isPaid, isConfirmed, paymentMethod [4h]
- [ ] PUT /api/v1/events/{eventId}/participants/{userId}/confirm (toggle) [3h]
- [ ] PUT /api/v1/events/{eventId}/participants/{userId}/payment (toggle) [3h]
- [ ] PUT /api/v1/events/{eventId}/participants/{userId}/payment-method [2h]
- [ ] PUT /api/v1/events/{eventId}/participants/{userId}/position (zmiana) [4h]
- [ ] POST /api/v1/events/{eventId}/participants/{userId}/promote (z waitlist) [4h]
- [ ] POST /api/v1/events/{eventId}/participants/{userId}/demote (do waitlist) [5h]

### Flutter [20h]
- [ ] PaymentsManageScreen [6h]
- [ ] Confirm checkbox toggle [2h]
- [ ] Payment checkbox toggle [2h]
- [ ] Payment method selector (BLIK/CASH/TRANSFER/CARD) [4h]
- [ ] Payment summary (total, paid, unpaid) [3h]
- [ ] Drag & drop reordering (ReorderableListView) [2h]
- [ ] Promote/demote buttons [1h]

---

## Feature 4: Event Series - ADVANCED [30h]

**Scope:** Zaawansowane funkcje serii

### Backend [20h]
- [ ] MONTHLY frequency [5h]
- [ ] skipHolidays logic (API świąt) [5h]
- [ ] SeriesStatus enum (ACTIVE, PAUSED) [1h]
- [ ] PUT /api/v1/series/{id}/pause [2h]
- [ ] PUT /api/v1/series/{id}/resume [2h]
- [ ] PUT /api/v1/series/{id} (edit series) [3h]
- [ ] DELETE /api/v1/series/{id} [2h]

### Flutter [10h]
- [ ] SeriesListScreen [3h]
- [ ] SeriesDetailsScreen [3h]
- [ ] Preview list przed generowaniem [2h]
- [ ] Edit series [1h]
- [ ] Pause/Resume toggle [1h]

---

## Feature 3.5: Grupy Siatkówki [60h]

**Scope:** Społeczności/grupy organizujące wydarzenia

### Backend [30h]
- [ ] Encja Group (name, description, imageUrl) [4h]
- [ ] Encja UserGroup (membership) [3h]
- [ ] GroupController [3h]
- [ ] GET /api/v1/groups [3h]
- [ ] POST /api/v1/groups/{id}/join [3h]
- [ ] DELETE /api/v1/groups/{id}/leave [3h]
- [ ] Link Event → Group [5h]
- [ ] Filtrowanie wydarzeń po grupie [6h]

### Flutter [30h]
- [ ] GroupListScreen [8h]
- [ ] GroupDetailsScreen [8h]
- [ ] Join/Leave group [6h]
- [ ] Group selector w EventsListScreen [8h]

---

## Feature 5: Profil Użytkownika [45h]

**Scope:** Rozszerzony profil, historia

### Backend [22h]
- [x] GET /api/v1/users/me [3h]
- [ ] PUT /api/v1/users/me [4h]
- [ ] GET /api/v1/users/me/events [4h]
- [ ] GET /api/v1/users/me/organized [4h]
- [ ] GET /api/v1/users/me/history [4h]
- [ ] POST /api/v1/users/{id}/thumb [3h]

### Flutter [23h]
- [ ] Enhanced UserProfileScreen [6h]
- [ ] EditProfileScreen [6h]
- [ ] My Events tab [4h]
- [ ] My Organized tab [3h]
- [ ] History tab [4h]

---

## Feature 7: EventStatus & Cancellation [25h]

### Backend [15h]
- [ ] Enum EventStatus (ACTIVE, CANCELLED, COMPLETED) [2h]
- [ ] PUT /api/v1/events/{id}/cancel [4h]
- [ ] PUT /api/v1/events/{id}/complete [3h]
- [ ] Powiadomienia o odwołaniu [6h]

### Flutter [10h]
- [ ] EventStatus badges [3h]
- [ ] Cancel event button [3h]
- [ ] Cancel confirmation [4h]

---

# 📋 MILESTONE 3: Post-MVP 🟢 [Q2 2026]

**Timeline:** Q2 2026 (Kwiecień - Czerwiec)
**Scope:** Notyfikacje, płatności, testowanie
**Total:** ~195h (~13 tygodni)

## Email Notifications [30h]
- [ ] Spring Mail + SMTP [6h]
- [ ] Thymeleaf templates [6h]
- [ ] Przypomnienie 24h przed [6h]
- [ ] Awans z waitlist [6h]
- [ ] Event cancelled [6h]

## Push Notifications [45h]
- [ ] Firebase FCM setup [9h]
- [ ] Push: Przypomnienie [9h]
- [ ] Push: Awans z waitlist [9h]
- [ ] Push: Zmiana eventu [9h]
- [ ] Flutter FCM integration [9h]

## Płatności (Stripe) [60h]
- [ ] Stripe API integration [12h]
- [ ] Payment initiate endpoint [12h]
- [ ] Stripe webhook [12h]
- [ ] Flutter Stripe integration [12h]
- [ ] Payment flow UI [12h]

## Sprint: Testowanie [60h]
- [x] Testy jednostkowe [15h] ✅ (2025-11-19) - częściowo
- [ ] Testy integracyjne [15h]
- [ ] Swagger/OpenAPI [10h]
- [ ] Kolekcja Postman [10h]
- [ ] Coverage 80%+ [10h]

## Security & Privacy Audit [~62h]

> Cel: bezpieczeństwo przed publicznym wydaniem + zgodność RODO oraz gotowość backup/DR.

### SAST/Dependency/Secrets Scanning [8h]
- [ ] Konfiguracja FindSecBugs/SpotBugs (BE) [2h]
- [ ] Semgrep rules (Java Spring + Dart) [2h]
- [ ] Dependency scan (OWASP DC lub Snyk) [2h]
- [ ] Gitleaks (sekrety) + cleanup historii jeśli potrzeba [2h]

### DAST/API Fuzz + Business Logic [10h]
- [ ] ZAP baseline + full scan z JWT [3h]
- [ ] Schemathesis fuzz (jeśli OpenAPI) lub ręczne negatywne [3h]
- [ ] Testy organizer‑only (IDOR) – add/remove participants, cancel, series generate [4h]

### Auth/JWT/CORS/Rate Limits [8h]
- [ ] Rotacja refresh + reuse detection [3h]
- [x] CORS allow‑list, brak `*` z Credentials [2h] ✅ (2025-11-19)
- [x] Rate limits: login, mutujące endpointy, series generate [3h] ✅ (2025-11-19)

### Headers/TLS/Nginx [6h]
- [ ] Security headers (CSP – na przyszłość web, XFO, XCTO, RP, PP) [3h]
- [ ] TLS hardening + HSTS, SSL Labs A [3h]

### Logging/Audyt/Monitoring [6h]
- [ ] Maskowanie PII/JWT w logach [2h]
- [ ] Audit trail dla create/edit/delete/cancel [2h]
- [ ] Alerting: 4xx/5xx spikes, auth failures [2h]

### Infra/Secrets Hardening [6h]
- [ ] ufw/fail2ban, systemd ograniczenia, non‑root service [3h]
- [ ] Sekrety poza repo, rotacja, inwentaryzacja [3h]

### Backup & Disaster Recovery [10h]
- [ ] Nightly full + WAL archiving (PITR) [3h]
- [ ] Retencja/rotacja + offsite, szyfrowanie [3h]
- [ ] Procedury odtworzenia + test restore (runbook) [4h]

### GDPR/RODO [10h]
- [ ] Privacy Policy + Terms (akceptacja przy rejestracji) [2h]
- [ ] Eksport/usunięcie/przenoszalność danych (e‑mail, nick, avatar, lokalizacje, telefon) [3h]
- [ ] Retencja (logi, backupy) + realizacja w systemie [3h]
- [ ] DPA z dostawcami (hosting PL, e‑mail) [2h]

### Performance Baseline [4h]
- [ ] k6: GET /api/v1/events (mapa), /api/v1/events?organizerId=me, POST /api/v1/series/{id}/generate [4h]

**Release Gate:** 0 High/Critical otwartych; raporty SAST/DAST/Deps; test restore OK; polityki RODO gotowe.

---

# 📊 PODSUMOWANIE ESTYMAT (ZAKTUALIZOWANE)

| Milestone | Scope | Hours | Weeks (15h) | Timeline |
|-----------|-------|-------|-------------|----------|
| **M1: Organizer MVP + Self-Service** | Zarządzanie + basic join/waitlist | 140h | ~9 tyg. | Do 2025-12-31 |
| **M2: Advanced Features** | Zaawansowane funkcje | 65h | ~4 tyg. | Q1 2026 |
| **M3: Post-MVP** | Notifications + Payments + Security/RODO | 257h | ~17 tyg. | Q2 2026 |
| **TOTAL** | | **462h** | **~31 tyg.** | **~7-8 miesięcy** |

**ZMIANA:** Self-service join/leave i basic waitlist przesunięte z M2 do M1 (+25h w M1, -135h w M2)

---

## 🚀 STRATEGIA REALIZACJI (ZAKTUALIZOWANA)

### Faza 1: Organizer MVP + Self-Service (8-9 tygodni - do końca 2025)
**Focus:** Narzędzie dla ORGANIZATORA + podstawowy self-service dla uczestników

**Tydzień 1-2:** Feature 1 - Events CRUD (30h) ✅
→ Tworzenie, edycja, usuwanie wydarzeń

**Tydzień 2-3:** Feature 3 - Manual Participant Management (30h)
→ Ręczne zarządzanie listą uczestników

**Tydzień 4:** **⭐ Feature S1 - Self-Service Join/Leave (10h)**
→ Uczestnicy mogą sami dołączać i opuszczać

**Tydzień 5:** **⭐ Feature S2 + S3 - Waitlist + Auto-Promocja (15h)**
→ Prosta waitlista FIFO + automatyczne awanse

**Tydzień 6:** Feature 4 - Event Series BASIC (25h)
→ Cykliczne wydarzenia (co tydzień)

**Tydzień 7:** UI + Polish (15h)
→ Interfejs + dopracowanie

**Tydzień 8:** Deployment + Testing (15h)
→ Live deployment

**END: 2025-12-31 ✅**

### Faza 2: Advanced Features (Q1 2026 - 4-5 tygodni)
**Focus:** Zaawansowane funkcje

- Manual promote/demote
- Drag & drop reordering
- Payment tracking
- Advanced series (monthly, skipHolidays)
- Groups
- Enhanced profiles

### Faza 3: Post-MVP (Q2 2026 - 17 tygodni)
**Focus:** Notyfikacje, płatności, testowanie

- Email & Push notifications
- Stripe payments
- Testing & Documentation
- Security & RODO compliance

---

## 🎯 PRIORYTETY (Critical Path) - ZAKTUALIZOWANE

### 🔴 MUST HAVE dla MVP (2025):
1. Feature 1: Events CRUD - **2 tygodnie** ✅
2. Feature 3: Manual Participant Management - **2 tygodnie**
3. **⭐ Feature S1: Self-Service Join/Leave - 1 tydzień** (NOWE!)
4. **⭐ Feature S2+S3: Waitlist + Auto-Promocja - 1 tydzień** (NOWE!)
5. Feature 4: Event Series BASIC - **2 tygodnie**
6. UI + Deployment - **2 tygodnie**

**Critical Path: 9 tygodni = koniec 2025**

### 🟡 SHOULD HAVE (Q1 2026):
7. Manual promote/demote
8. Drag & drop reordering
9. Payment tracking
10. Advanced Series
11. Groups
12. Enhanced profiles

### 🟢 NICE TO HAVE (Q2 2026+):
13. Notifications
14. Payments (Stripe)
15. Testing & Documentation
16. Security & RODO

---

## 📅 WEEKLY MILESTONES (ZAKTUALIZOWANY)

| Week | Date | Milestone | Hours |
|------|------|-----------|-------|
| W1 | 2025-11-13 | Feature 1 - Events CRUD ✅ | 15h |
| W2 | 2025-11-20 | Feature 3 - Backend Participants | 15h |
| W3 | 2025-11-27 | Feature 3 - Flutter Participants | 15h |
| W4 | 2025-12-04 | **⭐ Self-Service Join SIMPLE** | 15h |
| W5 | 2025-12-11 | **⭐ Simple Waitlist + Auto-Promocja** | 15h |
| W6 | 2025-12-18 | Feature 4 - Series BACK + UI | 15h |
| W7 | 2025-12-25 | UI Basics + Polish | 15h |
| W8 | 2026-01-01 | Deployment + Testing | 15h |
| **END** | **2025-12-31** | **🎊 MVP Z SELF-SERVICE** | **140h** |

---

## 💡 ZASADY PRACY

1. **Focus na organizatora** - każdy feature musi pomagać organizatorowi
2. **Jeden feature na raz** - dokończ zanim zaczniesz następny
3. **Backend + Flutter razem** - nie rób wszystkiego na backu, potem froncie
4. **Testuj z prawdziwymi użytkownikami** - znajdź organizatora do testów
5. **Upraszczaj** - jeśli coś nie działa, zrób prościej
6. **Git daily** - codzienne commity

---

## 🏁 NOWA DEFINICJA SUKCESU (31.12.2025)

### MINIMUM (must have):
- [x] Aplikacja działa na serwerze
- [x] Organizator może dodać wydarzenie ✅
- [ ] Organizator może dodać uczestnika (ręcznie)
- [ ] **⭐ Uczestnik może DOŁĄCZYĆ do wydarzenia (self-service)**
- [ ] **⭐ Uczestnik może OPUŚCIĆ wydarzenie (self-service)**
- [ ] **⭐ Prosta WAITLISTA (FIFO) działa**
- [ ] **⭐ Auto-promocja z waitlisty działa**
- [ ] Organizator może stworzyć serię cykliczną
- [x] Organizator widzi swoje wydarzenia ✅

### NICE TO HAVE:
- [ ] 2-3 organizatorów przetestowało
- [ ] Zero critical bugs
- [ ] Pozytywny feedback

**POWÓD ZMIANY:** Organizator nie będzie ręcznie dodawał wszystkich graczy – MVP musi pozwalać im dołączać samodzielnie.

---

**Legend:**
- `[ ]` - Do zrobienia
- `[x]` - Ukończone
- `🔴` - CRITICAL (MVP 2025)
- `🟡` - HIGH (Q1 2026)
- `🟢` - MEDIUM (Q2 2026+)
- `⭐` - NOWE w MVP (self-service pivot)

---

_Last updated: 2025-11-20_
_Weekly hours: 15h_
_Current phase: MILESTONE 1 - Organizer MVP + Self-Service_
_Focus: Narzędzie dla organizatorów + podstawowy self-service dla uczestników_
_Total M1 hours: 140h (było 115h + 25h na self-service)_
