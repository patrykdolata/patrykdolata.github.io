# Meet App - TODO Lista (Organizer-Focused MVP)

> **Projekt:** Aplikacja do planowania wydarzeń siatkówki
> **Stack:** Spring Boot (Backend) + Flutter (Mobile) + PostgreSQL
> **Solo developer:** Wszystko robione samodzielnie
> **Start:** 2025-11-13
> **Cel:** Działający MVP dla ORGANIZATORA do końca 2025 roku

---

## 🎯 PROJECT STATUS

- **Current Phase:** MILESTONE 1 - Organizer MVP
- **Target:** 2025-12-31 (7-8 tygodni)
- **Weekly hours:** 15h
- **Overall progress:** 25%
- **Last updated:** 2025-11-13

### ✅ What's Working:
- Sprint 0: Auth & JWT (95% done)
- Feature 0: Mapa z markerami (80% done)
- Feature 5.5: Ulubione lokalizacje (90% done)
- Feature 1: Basic Events API (40% done)

### 🔴 Current Focus:
- Feature 1: Dokończenie Events CRUD (30h)
- Feature 3: Zarządzanie uczestnikami RĘCZNIE (30h)
- Feature 4: Cykliczne wydarzenia (25h)

---

## 📋 MILESTONE 1: Organizer MVP 🔴 [DO KOŃCA 2025]

**Deadline:** 2025-12-31 (7-8 tygodni)
**Focus:** ORGANIZATOR może planować wydarzenia, zarządzać uczestnikami, tworzyć cykliczne mecze
**Total:** ~115h

### Definicja sukcesu:
- [x] Użytkownik może się zarejestrować i zalogować
- [x] Użytkownik widzi wydarzenia na mapie
- [ ] **ORGANIZATOR może stworzyć wydarzenie**
- [ ] **ORGANIZATOR może RĘCZNIE dodać uczestników do wydarzenia**
- [ ] **ORGANIZATOR może stworzyć serię cyklicznych wydarzeń (co tydzień)**
- [ ] **ORGANIZATOR widzi swoje wydarzenia (kalendarz/lista)**
- [ ] Aplikacja działa na produkcji

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
- [x] POST /auth/register
- [x] POST /auth/authenticate
- [x] POST /auth/refresh-token
- [x] GET /auth/validate-token
- [x] POST /auth/logout

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
- [x] GET /api/events - zwraca wydarzenia z lokalizacjami
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

## Feature 1: Podstawowe operacje na Wydarzeniach 🔴 [40% DONE → 30h pozostałe]

**Priorytet:** CRITICAL - organizator musi móc tworzyć wydarzenia
**Deadline:** Tydzień 1-2 (do 2025-11-27)
**Scope:** Pełny CRUD na wydarzeniach

### Backend - Wydarzenia CRUD [15h]

#### Obecny stan:
- [x] EventController - podstawowa struktura
- [x] GET /events - lista wydarzeń
- [x] GET /events/{id} - szczegóły
- [x] PUT /events - bulk add/update
- [x] PUT /events/{id} - edycja
- [x] DELETE /events/{id} - usunięcie
- [x] EventService podstawowy

#### Do zrobienia:
- [ ] POST /events (single create) [3h]
  - [ ] Endpoint implementation + DTO mapping [2h]
  - [ ] Validation logic + error handling [1h]

- [ ] DTOs: CreateEventRequest, UpdateEventRequest (rozdzielenie) [3h]
  - [ ] CreateEventRequest DTO + validation [2h]
  - [ ] UpdateEventRequest DTO + partial update logic [1h]

- [ ] Walidacje rozszerzone [3h]
  - [ ] DateTime & duration validations [2h]
  - [ ] Slots & level business logic validations [1h]

- [ ] Query params: organizerId (moje wydarzenia) [3h]
  - [ ] GET /events?organizerId={id} [2h]
  - [ ] EventRepository.findByOrganizerId [1h]

- [ ] EventRepository custom queries [3h]
  - [ ] Filter by organizerId [2h]
  - [ ] Query optimization + indexing [1h]

### Flutter - Wydarzenia CRUD [15h]

#### Obecny stan:
- [x] EventDetailsWidget - pełny widok szczegółów
- [x] EventDetailsScreen - routing + navigation

#### Do zrobienia:
- [ ] CreateEventScreen + formularz [8h]
  - [ ] Screen structure + form builder [2h]
  - [ ] Basic fields (title, message, dateTime) [2h]
  - [ ] Location picker integration [1h]
  - [ ] Slots, price, level inputs [2h]
  - [ ] Form validation + submission [1h]

- [ ] HTTP POST /events integration [2h]

- [ ] EditEventScreen (reuse CreateEvent logic) [3h]
  - [ ] Screen setup + pre-fill data [2h]
  - [ ] Update API integration [1h]

- [ ] Delete event + confirm dialog [2h]
  - [ ] Confirm dialog UI [1h]
  - [ ] Delete API call + UI update [1h]

**Feature 1 Milestone:** Organizator może dodać, edytować i usunąć swoje wydarzenie ✅

---

## Feature 3: Zarządzanie Uczestnikami - MANUAL 🔴 [0% DONE → 30h]

**Priorytet:** CRITICAL - organizator musi móc zarządzać listą
**Deadline:** Tydzień 3-4 (do 2025-12-11)
**Scope:** Organizator RĘCZNIE dodaje/usuwa uczestników

**UWAGA:** W tym MVP **BEZ self-service** (uczestnik NIE może sam dołączyć)

### Backend - Manual Participant Management [15h]

- [ ] Encja EventParticipant (uproszczona) [3h]
  - [ ] Podstawowa struktura encji [2h]
    - event (ManyToOne → EventEntity)
    - user (ManyToOne → UserEntity)
    - position (Integer)
    - addedAt (LocalDateTime)
    - addedBy (ManyToOne → UserEntity) - kto dodał
  - [ ] Relacje + indeksy [1h]
  - **BEZ:** status (MAIN_LIST/WAITLIST), isPaid, isConfirmed, paymentMethod

- [ ] Migracja V1_2__Add_event_participant_table.sql [2h]

- [ ] EventParticipantRepository + query methods [2h]
  - [ ] Repository interface [1h]
  - [ ] findByEventIdOrderByPositionAsc [0.5h]
  - [ ] countByEventId [0.5h]

- [ ] POST /events/{eventId}/participants (manual add) [3h]
  - [ ] Endpoint implementation [2h]
  - [ ] DTO: AddParticipantRequest (userId lub email) [0.5h]
  - [ ] Authorization: tylko organizator [0.5h]

- [ ] DELETE /events/{eventId}/participants/{userId} (remove) [2h]
  - [ ] Endpoint implementation [1h]
  - [ ] Authorization: tylko organizator [1h]

- [ ] GET /events/{eventId}/participants (lista) [2h]
  - [ ] Endpoint + DTO [1h]
  - [ ] ParticipantDTO (user info, position) [1h]

- [ ] ParticipantService - manual management [3h]
  - [ ] addParticipant (manual by organizer) [1h]
  - [ ] removeParticipant [1h]
  - [ ] Renumber positions [1h]

- [ ] Sprawdzanie uprawnień: tylko organizator wydarzenia [1h]

### Flutter - Manual Participant Management UI [15h]

- [ ] ParticipantsManageScreen (dla organizatora) [4h]
  - [ ] Screen structure + lista uczestników [2h]
  - [ ] Navigation z EventDetails [1h]
  - [ ] Warunek: tylko dla organizatora [1h]

- [ ] Lista uczestników - prosta [3h]
  - [ ] ParticipantListItem widget [2h]
  - [ ] Avatar + nickname + position display [1h]

- [ ] Dodaj uczestnika - manual [4h]
  - [ ] Add button [1h]
  - [ ] Search user dialog (po nicku/email) [2h]
  - [ ] HTTP POST /events/{id}/participants [1h]

- [ ] Usuń uczestnika [2h]
  - [ ] Remove button + confirm dialog [1h]
  - [ ] HTTP DELETE [1h]

- [ ] Update UI po dodaniu/usunięciu [1h]

- [ ] ParticipantManagementService + Notifier [2h]
  - [ ] Service structure [1h]
  - [ ] State management [1h]

**Feature 3 Milestone:** Organizator może RĘCZNIE zarządzać listą uczestników ✅

**Na Q1 2026:**
- Self-service join/leave (uczestnik sam dołącza)
- Waitlist logic (main list / waitlist)
- Płatności (isPaid, paymentMethod)
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

- [ ] SeriesController [2h]
  - [ ] POST /series (create series)
  - [ ] GET /series?organizerId={id}

- [ ] POST /series/{id}/generate (generowanie wydarzeń) [4h]
  - [ ] Endpoint + validation [1h]
  - [ ] DTO: GenerateEventsRequest (startDate, count) [1h]
  - [ ] Logika generowania [2h]
    - Oblicz daty na podstawie frequency + dayOfWeek
    - Utwórz wydarzenia (batch insert)
    - Max 20 wydarzeń na raz

- [ ] SeriesService.generateEvents() [3h]
  - [ ] Date calculation logic (weekly/biweekly) [2h]
  - [ ] Batch event creation [1h]

**BEZ w MVP:**
- Monthly frequency
- skipHolidays logic
- PAUSE/RESUME series
- Edit series (można usunąć i stworzyć nową)

### Flutter - Event Series BASIC UI [10h]

- [ ] CreateSeriesScreen (basic) [4h]
  - [ ] Screen structure + form [2h]
  - [ ] Basic fields (name, location) [1h]
  - [ ] Default values (slots, price, level) [1h]

- [ ] Frequency picker (WEEKLY/BIWEEKLY) [2h]
  - [ ] Dropdown picker [1h]
  - [ ] Day of week picker (Poniedziałek-Niedziela) [1h]

- [ ] Time picker [1h]

- [ ] Generate events dialog [2h]
  - [ ] Start date picker [1h]
  - [ ] Count input (ile wydarzeń wygenerować) [1h]

- [ ] HTTP POST /series + /series/{id}/generate [1h]

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

### Flutter - Organizer UI [15h]

- [ ] MyEventsScreen (organizator widzi swoje wydarzenia) [4h]
  - [ ] Screen structure + ListView [2h]
  - [ ] GET /events?organizerId=me [1h]
  - [ ] EventListItem widget [1h]

- [ ] Bottom Navigation Bar (Map, My Events, Profile) [3h]
  - [ ] Bottom nav bar UI + icons [1h]
  - [ ] Navigation state management [1h]
  - [ ] Integration [1h]

- [ ] EventsListScreen - lista wszystkich wydarzeń [3h]
  - [ ] Screen structure + ListView [2h]
  - [ ] Pull-to-refresh [1h]

- [ ] Loading skeletons [2h]
  - [ ] Skeleton widgets [1h]
  - [ ] Integration [1h]

- [ ] Error states z retry button [2h]
  - [ ] Error widgets [1h]
  - [ ] Retry logic [1h]

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
- [ ] **Organizator może dodać wydarzenie**
- [ ] **Organizator może edytować/usunąć wydarzenie**
- [ ] **Organizator może RĘCZNIE dodać uczestnika do wydarzenia**
- [ ] **Organizator może usunąć uczestnika**
- [ ] **Organizator może stworzyć serię cyklicznych wydarzeń**
- [ ] **Organizator widzi swoje wydarzenia (lista)**
- [ ] Aplikacja działa na produkcji

**Total Milestone 1: ~115h = 7-8 tygodni (15h/tydzień)**

---

# 📋 MILESTONE 2: Self-Service & Advanced 🟡 [Q1 2026]

**Timeline:** Q1 2026 (Styczeń - Marzec)
**Scope:** Self-service dla uczestników + zaawansowane features dla organizatora
**Total:** ~200h (~13 tygodni)

## Feature 2: Dołączanie/Opuszczanie Wydarzeń (Self-Service) [45h]

**Scope:** Uczestnicy SAMI mogą dołączać i opuszczać wydarzenia

### Backend [25h]
- [ ] POST /events/{id}/join - uczestnik sam dołącza
- [ ] DELETE /events/{id}/leave - uczestnik sam opuszcza
- [ ] Enum ParticipantStatus (MAIN_LIST, WAITLIST)
- [ ] Logika main list vs waitlist
- [ ] Awans z waitlist po opuszczeniu
- [ ] Renumbering positions
- [ ] Custom exceptions

### Flutter [20h]
- [ ] Join button w EventDetailsScreen
- [ ] Leave button
- [ ] Waitlist badge
- [ ] Toast notifications
- [ ] ParticipantsListScreen (public view)
- [ ] EventParticipantService

**Dlaczego Q1 2026:** W MVP organizator zarządza ręcznie, wystarczy WhatsApp

---

## Feature 3: Zarządzanie Uczestnikami - ADVANCED [45h]

**Scope:** Zaawansowane zarządzanie dla organizatora

### Backend [25h]
- [ ] Pola w EventParticipant: isPaid, isConfirmed, paymentMethod
- [ ] PUT /events/{eventId}/participants/{userId}/confirm (toggle)
- [ ] PUT /events/{eventId}/participants/{userId}/payment (toggle)
- [ ] PUT /events/{eventId}/participants/{userId}/payment-method
- [ ] PUT /events/{eventId}/participants/{userId}/position (zmiana)
- [ ] POST /events/{eventId}/participants/{userId}/promote (z waitlist)
- [ ] POST /events/{eventId}/participants/{userId}/demote (do waitlist)

### Flutter [20h]
- [ ] PaymentsManageScreen
- [ ] Confirm checkbox toggle
- [ ] Payment checkbox toggle
- [ ] Payment method selector (BLIK/CASH/TRANSFER/CARD)
- [ ] Payment summary (total, paid, unpaid)
- [ ] Drag & drop reordering (ReorderableListView)
- [ ] Promote/demote buttons

---

## Feature 4: Event Series - ADVANCED [30h]

**Scope:** Zaawansowane funkcje serii

### Backend [20h]
- [ ] MONTHLY frequency
- [ ] skipHolidays logic (API świąt)
- [ ] SeriesStatus enum (ACTIVE, PAUSED)
- [ ] PUT /series/{id}/pause
- [ ] PUT /series/{id}/resume
- [ ] PUT /series/{id} (edit series)
- [ ] DELETE /series/{id}

### Flutter [10h]
- [ ] SeriesListScreen
- [ ] SeriesDetailsScreen
- [ ] Preview list przed generowaniem
- [ ] Edit series
- [ ] Pause/Resume toggle

---

## Feature 3.5: Grupy Siatkówki [60h]

**Scope:** Społeczności/grupy organizujące wydarzenia

### Backend [30h]
- [ ] Encja Group (name, description, imageUrl)
- [ ] Encja UserGroup (membership)
- [ ] GroupController
- [ ] GET /groups
- [ ] POST /groups/{id}/join
- [ ] DELETE /groups/{id}/leave
- [ ] Link Event → Group
- [ ] Filtrowanie wydarzeń po grupie

### Flutter [30h]
- [ ] GroupListScreen
- [ ] GroupDetailsScreen
- [ ] Join/Leave group
- [ ] Group selector w EventsListScreen

---

## Feature 5: Profil Użytkownika [45h]

**Scope:** Rozszerzony profil, historia

### Backend [22h]
- [ ] GET /users/me
- [ ] PUT /users/me
- [ ] GET /users/me/events
- [ ] GET /users/me/organized
- [ ] GET /users/me/history
- [ ] POST /users/{id}/thumb

### Flutter [23h]
- [ ] Enhanced UserProfileScreen
- [ ] EditProfileScreen
- [ ] My Events tab
- [ ] My Organized tab
- [ ] History tab

---

## Feature 7: EventStatus & Cancellation [25h]

### Backend [15h]
- [ ] Enum EventStatus (ACTIVE, CANCELLED, COMPLETED)
- [ ] PUT /events/{id}/cancel
- [ ] PUT /events/{id}/complete
- [ ] Powiadomienia o odwołaniu

### Flutter [10h]
- [ ] EventStatus badges
- [ ] Cancel event button
- [ ] Cancel confirmation

---

# 📋 MILESTONE 3: Post-MVP 🟢 [Q2 2026]

**Timeline:** Q2 2026 (Kwiecień - Czerwiec)
**Scope:** Notyfikacje, płatności, testowanie
**Total:** ~195h (~13 tygodni)

## Email Notifications [30h]
- [ ] Spring Mail + SMTP
- [ ] Thymeleaf templates
- [ ] Przypomnienie 24h przed
- [ ] Awans z waitlist
- [ ] Event cancelled

## Push Notifications [45h]
- [ ] Firebase FCM setup
- [ ] Push: Przypomnienie
- [ ] Push: Awans z waitlist
- [ ] Push: Zmiana eventu
- [ ] Flutter FCM integration

## Płatności (Stripe) [60h]
- [ ] Stripe API integration
- [ ] Payment initiate endpoint
- [ ] Stripe webhook
- [ ] Flutter Stripe integration
- [ ] Payment flow UI

## Sprint: Testowanie [60h]
- [ ] Testy jednostkowe
- [ ] Testy integracyjne
- [ ] Swagger/OpenAPI
- [ ] Kolekcja Postman
- [ ] Coverage 80%+

---

# 📊 PODSUMOWANIE ESTYMAT

| Milestone | Scope | Hours | Weeks (15h) | Timeline |
|-----------|-------|-------|-------------|----------|
| **M1: Organizer MVP** | Zarządzanie wydarzeniami | 115h | 7-8 tyg. | Do 2025-12-31 |
| **M2: Self-Service & Advanced** | Dla uczestników | 200h | 13 tyg. | Q1 2026 |
| **M3: Post-MVP** | Notifications + Payments | 195h | 13 tyg. | Q2 2026 |
| **TOTAL** | | **510h** | **33 tyg.** | **~8 miesięcy** |

---

## 🚀 STRATEGIA REALIZACJI

### Faza 1: Organizer MVP (7-8 tygodni - do końca 2025)
**Focus:** Narzędzie dla ORGANIZATORA wydarzeń

**Tydzień 1-2:** Feature 1 - Events CRUD (30h)
→ Tworzenie, edycja, usuwanie wydarzeń

**Tydzień 3-4:** Feature 3 - Manual Participant Management (30h)
→ Ręczne zarządzanie listą uczestników

**Tydzień 5-6:** Feature 4 - Event Series BASIC (25h)
→ Cykliczne wydarzenia (co tydzień)

**Tydzień 7-8:** UI + Deployment (30h)
→ Interfejs organizatora + live deployment

**END: 2025-12-31 ✅**

### Faza 2: Self-Service & Advanced (Q1 2026 - 13 tygodni)
**Focus:** Self-service dla uczestników + advanced features

- Feature 2: Self-service Join/Leave
- Feature 3: Advanced Participant Management (płatności, drag&drop)
- Feature 4: Advanced Series (monthly, skipHolidays)
- Feature 3.5: Grupy
- Feature 5: Profil

### Faza 3: Post-MVP (Q2 2026 - 13 tygodni)
**Focus:** Notyfikacje, płatności, testowanie

- Email & Push notifications
- Stripe payments
- Testing & Documentation

---

## 🎯 PRIORYTETY (Critical Path)

### 🔴 MUST HAVE dla organizatorów:
1. Feature 1: Events CRUD - **2 tygodnie**
2. Feature 3: Manual Participant Management - **2 tygodnie**
3. Feature 4: Event Series BASIC - **2 tygodnie**
4. UI + Deployment - **2 tygodnie**

**Critical Path: 8 tygodni = koniec 2025**

### 🟡 SHOULD HAVE (Q1 2026):
5. Feature 2: Self-service Join/Leave
6. Feature 3: Advanced Management
7. Feature 4: Advanced Series
8. Feature 3.5: Grupy

### 🟢 NICE TO HAVE (Q2 2026+):
9. Notifications
10. Payments
11. Testing & Documentation

---

## 📅 WEEKLY MILESTONES

| Week | Date | Milestone | Hours |
|------|------|-----------|-------|
| W1 | 2025-11-13 | Feature 1 - Backend CRUD | 15h |
| W2 | 2025-11-20 | Feature 1 - Flutter UI | 15h |
| W3 | 2025-11-27 | Feature 3 - Backend Participants | 15h |
| W4 | 2025-12-04 | Feature 3 - Flutter UI | 15h |
| W5 | 2025-12-11 | Feature 4 - Backend Series | 15h |
| W6 | 2025-12-18 | Feature 4 - Flutter UI | 10h |
| W7 | 2025-12-25 | UI Basics | 15h |
| W8 | 2025-01-01 | Deployment + Testing | 15h |
| **END** | **2025-12-31** | **🎊 ORGANIZER MVP READY** | **115h** |

---

## 💡 ZASADY PRACY

1. **Focus na organizatora** - każdy feature musi pomagać organizatorowi
2. **Jeden feature na raz** - dokończ zanim zaczniesz następny
3. **Backend + Flutter razem** - nie rób wszystkiego na backu, potem froncie
4. **Testuj z prawdziwymi użytkownikami** - znajdź organizatora do testów
5. **Upraszczaj** - jeśli coś nie działa, zrób prościej
6. **Git daily** - codzienne commity

---

## 🏁 DEFINICJA SUKCESU (31.12.2025)

### MINIMUM (must have):
- [x] Aplikacja działa na serwerze
- [ ] Organizator może dodać wydarzenie
- [ ] Organizator może dodać uczestnika
- [ ] Organizator może stworzyć serię cykliczną
- [ ] Organizator widzi swoje wydarzenia

### NICE TO HAVE:
- [ ] 2-3 organizatorów przetestowało
- [ ] Zero critical bugs
- [ ] Pozytywny feedback

---

**Legend:**
- `[ ]` - Do zrobienia
- `[x]` - Ukończone
- `🔴` - CRITICAL (MVP 2025)
- `🟡` - HIGH (Q1 2026)
- `🟢` - MEDIUM (Q2 2026+)

---

_Last updated: 2025-11-13_
_Weekly hours: 15h_
_Current phase: MILESTONE 1 - Organizer MVP_
_Focus: Narzędzie dla organizatorów wydarzeń siatkówki_
