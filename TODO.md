# Meet App - TODO Lista Implementacji (Feature-Based)

> **Uwaga:** Pliki HTML w tym repo (`patrykdolata.github.io`) to tylko klikalna makieta prototypowa.
>
> **Backend:** `meet-app-be` (Spring Boot + PostgreSQL) - częściowo zaimplementowany
>
> **Frontend:** `meet-app-fe` (Flutter mobile app) - częściowo zaimplementowany
>
> **Solo project:** Robisz wszystko sam (backend + Flutter)
>
> **Strategia:** Feature-based development - każdy feature jest implementowany end-to-end (backend + frontend)
>
> **Legend:**
> - `[ ]` - Do zrobienia
> - `[?]` - Do weryfikacji
> - `[x]` - Potwierdzone jako ukończone
>
> **Stan aktualizacji:** 2025-01-03 - Zsynchronizowano z rzeczywistym kodem backend + frontend

---

## Sprint 0: Konfiguracja Backend & Autoryzacja

### Konfiguracja Projektu
- [x] Utworzenie projektu Spring Boot przez Spring Initializr
- [x] Konfiguracja PostgreSQL (baza `meet_app_db`)
- [x] Setup `application.yml` (datasource, JPA, security)
- [x] Struktura pakietów (controller, service, repository, entity, dto, config, exception)
- [x] Konfiguracja Lombok, Validation

### Model Bazy Danych - Encje JPA
- [x] Encja `UserEntity` (id, login, email, password, nickName, avatar, thumbsUp/Down, role, createdAt, updatedAt)
- [x] Encja `LocationEntity` (id, name, address, latitude, longitude, description)
- [x] Encja `EventEntity` (id, title, message, location, user, dateTime, duration, slots, price, level, groupName, groupUrl)
- [x] Encja `FavoritePlaceEntity` (id, user, location, notes, createdAt)
- [x] Encja `PostEntity` (id, date, message, user)
- [x] Encja `TokenEntity` (id, token, tokenType, expired, revoked, expiresAt, user)
- [ ] Encja `EventParticipant` **[~4h → split]**
  - [ ] Struktura encji + relacje (event, user) **[~2h]**
  - [ ] Pola: position, status, isConfirmed, isPaid, paymentMethod, joinedAt **[~2h]**
- [ ] Encja `EventSeries` **[~4h → split]**
  - [ ] Podstawowa struktura encji (id, name, organizer, location) **[~2h]**
  - [ ] Pola zaawansowane: schedule, slots, price, level, status, frequencyInterval **[~2h]**
- [ ] Encja `Group` **[~3h → split]**
  - [ ] Struktura encji + podstawowe pola **[~2h]**
  - [ ] Pola: membersCount, eventsCount + timestampy **[~1h]**

### Migracje Bazy Danych (Flyway)
- [x] Setup Flyway w projekcie
- [x] V1_0__Initial_schema.sql (user, token, location, event, favorite_place, post)
- [x] V1_1__Fix_null_user_roles.sql
- [ ] V1_2__Add_event_participant_table.sql **[~2h]**
- [ ] V1_3__Add_event_series_table.sql **[~2h]**
- [ ] V1_4__Add_group_tables.sql **[~3h → split]**
  - [ ] Group table creation **[~2h]**
  - [ ] UserGroup junction table + indeksy **[~1h]**
- [ ] V1_5__Add_missing_event_fields.sql (sportType, visibilityTime, autoPromote, sendNotifications, status, groupId) **[~2h]**

### Spring Security & JWT
- [x] Dependency: io.jsonwebtoken (JWT)
- [x] JwtService (generateToken, validateToken, extractUsername, generateRefreshToken)
- [x] JwtAuthenticationFilter
- [x] UserDetailsService implementation
- [x] PasswordEncoder bean (BCryptPasswordEncoder)
- [x] SecurityConfiguration (CORS, CSRF disable, stateless session)
- [x] LogoutService (revoke token)
- [x] TokenEntity & TokenRepository

### CORS Configuration
- [x] SecurityConfiguration CORS setup
- [?] Allow origins: localhost:3000, 34.59.119.43 (produkcja)
- [x] Allow methods: GET, POST, PUT, DELETE, OPTIONS
- [x] Allow credentials: true

### Auth Endpoints (Backend)
- [x] `AuthController` - /auth base path
- [x] POST `/auth/register` - Rejestracja użytkownika
- [x] POST `/auth/authenticate` - Logowanie
- [x] POST `/auth/refresh-token` - Odświeżenie tokenu
- [x] GET `/auth/validate-token` - Walidacja tokenu
- [x] POST `/auth/logout` - Wylogowanie
- [x] DTOs: RegisterRequest, AuthenticationRequest, AuthenticationResponse, ValidationResponse

### Auth Service (Backend)
- [x] `AuthenticationService.registerUser()` - hash password BCrypt
- [x] `AuthenticationService.authenticate()` - generate JWT + refresh token (cookie)
- [x] `AuthenticationService.refreshToken()` - odświeżanie tokenu
- [x] `AuthenticationService.validateToken()` - walidacja
- [x] Custom exceptions (UserAlreadyExistsException, ValidationException, ResourceNotFoundException)

### Auth Implementation (Flutter)
- [x] JWT storage w Flutter (SecureStorage) - TokenService
- [x] HTTP client setup (dio) z Authorization header - DioHttpClient + TokenInterceptor
- [x] UserService (login/logout state management)
- [x] Login/Register forms w UserPanelWidget
- [x] Token validation i auto-refresh (401/403 handling)

**Sprint 0 Status: ~95% DONE (backend + Flutter auth complete)**

---

## Feature 0: Mapa z Wydarzeniami ✅ ZROBIONE

> **Cel:** Interaktywna mapa z markerami wydarzeń (główny widok aplikacji)

### Backend - Mapa API
- [x] GET `/api/events` - zwraca wydarzenia z lokalizacjami (lat/lng)
- [x] EventEntity ma relację do LocationEntity
- [x] LocationEntity ma latitude i longitude (BigDecimal)
- [x] EventRepository.findAllWithLocation() - JOIN FETCH optymalizacja
- [ ] Query params: bounding box filtering (mapBounds) **[~4h → split]**
  - [ ] Implementacja parametrów mapBounds (lat/lng min/max) **[~2h]**
  - [ ] Query filtering logic + optymalizacja indeksów **[~2h]**
- [ ] Endpoint sortowania po odległości od użytkownika **[~3h → split]**
  - [ ] Implementacja distance calculation query **[~2h]**
  - [ ] Sorting logic + query params **[~1h]**

### Flutter - Mapa (Google Maps)
- [x] GoogleMapWidget z google_maps_flutter
- [x] Centrowanie na Poznań (52.385695, 16.946893)
- [x] Markery wydarzeń z custom ikoną (VolleyballIcon)
- [x] Grupowanie wydarzeń w tej samej lokalizacji
- [x] Pop-up z kartą wydarzenia (EventPopUpCard)
- [x] PageView dla wielu wydarzeń w jednym miejscu
- [x] Dots indicator dla paginacji
- [x] Tap na marker → zoom + centrowanie + pop-up
- [x] Tap na mapie → ukrywa pop-up
- [x] FloatingActionButton refresh → odświeża markery
- [x] EventMarkerService - filtruje nieaktualne wydarzenia
- [x] FavoriteLocationNotifier - centrowanie z listy ulubionych
- [ ] Filtrowanie markerów UI (bottom sheet) **[~8h → split]**
  - [ ] Bottom sheet UI + filter options layout **[~2h]**
  - [ ] Level filter implementation **[~2h]**
  - [ ] Price filter slider **[~2h]**
  - [ ] Sport type & date filters + apply logic **[~2h]**
- [ ] User location tracking **[~5h → split]**
  - [ ] Permission handling (iOS/Android) **[~2h]**
  - [ ] Location service setup + current location **[~2h]**
  - [ ] Center on user location button **[~1h]**
- [ ] Search by location/address **[~6h → split]**
  - [ ] Search bar UI + debounce logic **[~2h]**
  - [ ] Google Places API integration **[~2h]**
  - [ ] Search results display + selection **[~2h]**

**Feature 0 Total: ~5h backend, ~19h Flutter = ~24h ≈ 1.5 tygodnia (większość DONE)**

---

## Feature 1: Podstawowe operacje na Wydarzeniach (~5 tygodni = 75h)

> **Cel:** CRUD na wydarzeniach + dodatkowe pola (sport type, visibility, flags)

### Backend - Wydarzenia CRUD (Część 1: ~35h)
- [x] `EventController` - podstawowa struktura
- [x] GET `/events` - lista wydarzeń
- [x] GET `/events/{id}` - szczegóły wydarzenia (JOIN FETCH location)
- [ ] POST `/events` (single create) - obecnie jest tylko bulk PUT **[~3h → split]**
  - [ ] Endpoint implementation + DTO mapping **[~2h]**
  - [ ] Validation logic + error handling **[~1h]**
- [x] PUT `/events` - bulk add/update wydarzeń
- [x] PUT `/events/{id}` - edycja wydarzenia
- [x] DELETE `/events/{id}` - usunięcie wydarzenia
- [ ] Query params: minLevel, maxLevel, locationId, maxPrice, availableOnly **[~4h → split]**
  - [ ] minLevel, maxLevel query params **[~2h]**
  - [ ] locationId, maxPrice, availableOnly params **[~2h]**
- [ ] DTOs: CreateEventRequest, UpdateEventRequest (obecnie jest EventRequest) **[~3h → split]**
  - [ ] CreateEventRequest DTO + validation **[~2h]**
  - [ ] UpdateEventRequest DTO + partial update logic **[~1h]**
- [x] EventService: addEvent(), updateEvent(), deleteEventById()
- [ ] Walidacje (startDateTime, slots, level, duration) - rozszerzone **[~3h → split]**
  - [ ] DateTime & duration validations **[~2h]**
  - [ ] Slots & level business logic validations **[~1h]**
- [ ] EventRepository custom queries (filters, search) **[~4h → split]**
  - [ ] Filter queries (level, price, location) **[~2h]**
  - [ ] Search query implementation + pagination **[~2h]**
- [ ] Nowe pola w EventEntity: **[~8h → split]**
  - [ ] SportType enum + field w encji **[~2h]**
  - [ ] visibilityDays + autoPromoteFromWaitlist fields **[~2h]**
  - [ ] sendNotifications + status fields **[~2h]**
  - [ ] group relation (ManyToOne) **[~2h]**
- [ ] Migracja dla nowych pól **[~2h]**
- [ ] EventStatus enum + logika anulowania **[~3h → split]**
  - [ ] EventStatus enum definition **[~1h]**
  - [ ] Cancel logic implementation **[~2h]**
- [ ] SportType enum **[~1h]**

### Flutter - Wydarzenia CRUD (Część 2: ~40h)
- [ ] EventsListScreen (lista jako alternatywa dla mapy) **[~6h → split]**
  - [ ] Screen structure + ListView builder **[~2h]**
  - [ ] State management setup (Notifier) **[~2h]**
  - [ ] API integration + data loading **[~2h]**
- [ ] EventListItem widget **[~4h → split]**
  - [ ] Widget layout + styling **[~2h]**
  - [ ] Event data display + badges **[~2h]**
- [ ] Pull-to-refresh + infinite scroll **[~5h → split]**
  - [ ] Pull-to-refresh implementation **[~2h]**
  - [ ] Infinite scroll (pagination) logic **[~2h]**
  - [ ] Loading states + error handling **[~1h]**
- [ ] Switch między mapą a listą (toggle button) **[~2h]**
- [x] EventDetailsWidget - pełny widok szczegółów
- [x] EventDetailsScreen - routing + navigation
- [ ] Filter bottom sheet (level, price, location, sport type) **[~6h → split]**
  - [ ] Bottom sheet UI structure **[~2h]**
  - [ ] Level & price filters **[~2h]**
  - [ ] Location & sport type filters + apply **[~2h]**
- [ ] Search bar z debounce **[~3h → split]**
  - [ ] Search bar UI + TextField **[~1h]**
  - [ ] Debounce implementation **[~2h]**
- [ ] CreateEventScreen + formularz **[~10h → split]**
  - [ ] Screen structure + form builder **[~2h]**
  - [ ] Basic fields (title, message, dateTime) **[~2h]**
  - [ ] Location picker integration **[~2h]**
  - [ ] Slots, price, level inputs **[~2h]**
  - [ ] Form validation + submission **[~2h]**
- [ ] Sport type picker **[~2h]**
- [ ] EditEventScreen (reuse CreateEvent logic) **[~4h → split]**
  - [ ] Screen setup + pre-fill data **[~2h]**
  - [ ] Update API integration + error handling **[~2h]**
- [ ] Delete event + confirm dialog **[~3h → split]**
  - [ ] Confirm dialog UI **[~1h]**
  - [ ] Delete API call + UI update **[~2h]**
- [ ] Form validation + error handling **[~3h → split]**
  - [ ] Client-side validation logic **[~2h]**
  - [ ] Server error display **[~1h]**
- [ ] CreateEventService + Notifier **[~4h → split]**
  - [ ] Service structure + API methods **[~2h]**
  - [ ] Notifier state management **[~2h]**
- [ ] HTTP: POST `/events`, PUT `/events/{id}`, DELETE `/events/{id}` **[~2h]**
- [ ] EventStatus badges (ACTIVE/CANCELLED/COMPLETED) **[~2h]**

**Feature 1 Total: ~35h backend, ~40h Flutter = ~75h ≈ 5 tygodni**

---

## Feature 2: Dołączanie/Opuszczanie Wydarzeń (~5 tygodni = 75h)

> **Cel:** Użytkownicy mogą dołączać i opuszczać wydarzenia, z obsługą listy głównej i listy rezerwowej

### Backend - Logika Dołączania/Opuszczania (Część 1: ~35h)
- [ ] Encja `EventParticipant` **[~4h → split]**
  - [ ] Podstawowa struktura encji + relacje **[~2h]**
  - [ ] Pola: position, status, isConfirmed, isPaid, paymentMethod, joinedAt **[~2h]**
- [ ] Migracja V1_2__Add_event_participant_table.sql **[~2h]**
- [ ] Enum ParticipantStatus (MAIN_LIST, WAITLIST) **[~1h]**
- [ ] Enum PaymentMethod (BLIK, CASH, TRANSFER, CARD) **[~1h]**
- [ ] EventParticipantRepository + query methods **[~4h → split]**
  - [ ] Repository interface + basic queries **[~2h]**
  - [ ] Advanced queries (findByEventIdAndStatus, count methods) **[~2h]**
- [ ] POST `/events/{id}/join` endpoint **[~3h → split]**
  - [ ] Endpoint implementation + DTO **[~2h]**
  - [ ] Authorization check + error handling **[~1h]**
- [ ] DELETE `/events/{id}/leave` endpoint **[~3h → split]**
  - [ ] Endpoint implementation **[~2h]**
  - [ ] Error handling + edge cases **[~1h]**
- [ ] GET `/events/{id}/participants` endpoint **[~2h]**
- [ ] DTOs: ParticipantDTO, ParticipantsListDTO **[~3h → split]**
  - [ ] ParticipantDTO structure + mapping **[~2h]**
  - [ ] ParticipantsListDTO (main + waitlist) **[~1h]**
- [ ] EventService.joinEvent() - main list vs waitlist logic **[~5h → split]**
  - [ ] Main list placement logic **[~2h]**
  - [ ] Waitlist logic + position assignment **[~2h]**
  - [ ] Edge cases + validation **[~1h]**
- [ ] EventService.leaveEvent() - awans z waitlist **[~5h → split]**
  - [ ] Leave logic + participant removal **[~2h]**
  - [ ] Waitlist promotion logic **[~2h]**
  - [ ] Renumbering logic **[~1h]**
- [ ] promoteFirstFromWaitlist() **[~3h → split]**
  - [ ] Promotion logic implementation **[~2h]**
  - [ ] Position update + notification trigger **[~1h]**
- [ ] renumberMainList() i renumberWaitlist() **[~3h → split]**
  - [ ] Renumber algorithms **[~2h]**
  - [ ] Batch update optimization **[~1h]**
- [ ] Custom exceptions (AlreadyJoinedException, EventFullException) **[~2h]**

### Flutter - Interfejs Dołączania/Opuszczania (Część 2: ~40h)
- [x] EventDetailsWidget wyświetla szczegóły
- [ ] Join button w EventDetailsScreen **[~3h → split]**
  - [ ] Button UI + state handling **[~2h]**
  - [ ] Disable logic (full event, already joined) **[~1h]**
- [ ] HTTP POST `/events/{id}/join` **[~2h]**
- [ ] Leave button (jeśli już dołączony) **[~2h]**
- [ ] HTTP DELETE `/events/{id}/leave` **[~2h]**
- [ ] Update UI po join/leave (slots, participants count) **[~3h → split]**
  - [ ] Optimistic UI update **[~2h]**
  - [ ] Error rollback + state refresh **[~1h]**
- [ ] Handling waitlist status (badge, info) **[~3h → split]**
  - [ ] Waitlist badge UI **[~1h]**
  - [ ] Info dialog/tooltip **[~2h]**
- [ ] Toast notifications (success/error) **[~2h]**
- [ ] EventParticipantService + EventParticipantNotifier **[~5h → split]**
  - [ ] Service structure + API methods **[~2h]**
  - [ ] Notifier state management **[~2h]**
  - [ ] Error handling + retry logic **[~1h]**
- [ ] ParticipantsListScreen (dedykowany ekran) **[~8h → split]**
  - [ ] Screen structure + tabs (main/waitlist) **[~2h]**
  - [ ] ListView builder + state management **[~2h]**
  - [ ] API integration + data loading **[~2h]**
  - [ ] Error states + empty states **[~2h]**
- [ ] Main list display (pozycja, nick, avatar, status) **[~4h → split]**
  - [ ] ParticipantListItem widget **[~2h]**
  - [ ] Status badges display **[~2h]**
- [ ] Waitlist display (pozycja waitlist, badge) **[~3h → split]**
  - [ ] Waitlist section UI **[~2h]**
  - [ ] Position indicators **[~1h]**
- [ ] Participant avatars + fallback (inicjały) **[~2h]**
- [ ] Status badges (confirmed ✓, paid 💰, waitlist) **[~3h → split]**
  - [ ] Badge widgets (confirmed, paid) **[~2h]**
  - [ ] Waitlist badge **[~1h]**
- [ ] HTTP GET `/events/{id}/participants` **[~2h]**
- [ ] Pull-to-refresh dla listy uczestników **[~2h]**
- [ ] Empty states (brak uczestników) **[~1h]**
- [ ] Navigation: EventDetails → ParticipantsList **[~1h]**

**Feature 2 Total: ~35h backend, ~40h Flutter = ~75h ≈ 5 tygodni**

---

## Feature 3: Zarządzanie Uczestnikami (~6 tygodni = 90h)

> **Cel:** Organizator może zarządzać uczestnikami (zmiana pozycji, potwierdzenie, płatność, awans/degradacja, usunięcie)

### Backend - Zarządzanie Uczestnikami (Część 1: ~45h)
- [ ] `ParticipantManagementController` **[~3h → split]**
  - [ ] Controller structure + base endpoints **[~2h]**
  - [ ] Authorization filters (organizer only) **[~1h]**
- [ ] PUT `/events/{eventId}/participants/{userId}/position` **[~4h → split]**
  - [ ] Endpoint implementation + validation **[~2h]**
  - [ ] Position change logic + renumbering **[~2h]**
- [ ] PUT `/events/{eventId}/participants/{userId}/confirm` (toggle) **[~2h]**
- [ ] PUT `/events/{eventId}/participants/{userId}/payment` (toggle) **[~2h]**
- [ ] PUT `/events/{eventId}/participants/{userId}/payment-method` **[~2h]**
- [ ] POST `/events/{eventId}/participants/{userId}/promote` **[~4h → split]**
  - [ ] Endpoint + promote to main list logic **[~2h]**
  - [ ] Position assignment + validation **[~2h]**
- [ ] POST `/events/{eventId}/participants/{userId}/demote` **[~3h → split]**
  - [ ] Endpoint + demote logic **[~2h]**
  - [ ] Waitlist position assignment **[~1h]**
- [ ] DELETE `/events/{eventId}/participants/{userId}` **[~3h → split]**
  - [ ] Endpoint implementation **[~2h]**
  - [ ] Cascade logic + renumbering **[~1h]**
- [ ] POST `/events/{eventId}/participants` (manual add) **[~3h → split]**
  - [ ] Endpoint + DTO **[~2h]**
  - [ ] Manual add logic + position assignment **[~1h]**
- [ ] DTOs: ChangePositionRequest, AddParticipantRequest, UpdatePaymentRequest **[~3h → split]**
  - [ ] ChangePositionRequest + AddParticipantRequest **[~2h]**
  - [ ] UpdatePaymentRequest + validation **[~1h]**
- [ ] ParticipantService.changePosition() **[~4h → split]**
  - [ ] Position change logic **[~2h]**
  - [ ] Renumbering affected participants **[~2h]**
- [ ] ParticipantService.toggleConfirm() **[~2h]**
- [ ] ParticipantService.togglePayment() + updatePaymentMethod() **[~3h → split]**
  - [ ] togglePayment implementation **[~2h]**
  - [ ] updatePaymentMethod + timestamp **[~1h]**
- [ ] ParticipantService.promoteToMainList() **[~3h → split]**
  - [ ] Promotion logic **[~2h]**
  - [ ] Slot availability check + position **[~1h]**
- [ ] ParticipantService.demoteToWaitlist() **[~3h → split]**
  - [ ] Demotion logic **[~2h]**
  - [ ] Waitlist position calculation **[~1h]**
- [ ] ParticipantService.removeParticipant() **[~4h → split]**
  - [ ] Remove logic + database update **[~2h]**
  - [ ] Cascade effects (promotion, renumbering) **[~2h]**
- [ ] ParticipantService.addParticipant() (manual) **[~3h → split]**
  - [ ] Add logic + validation **[~2h]**
  - [ ] Position assignment (main/waitlist) **[~1h]**
- [ ] Sprawdzanie uprawnień: tylko organizator **[~2h]**
- [ ] Custom exceptions **[~1h]**

### Flutter - Interfejs Zarządzania Uczestnikami (Część 2: ~45h)
- [ ] Check: czy user jest organizatorem wydarzenia **[~2h]**
- [ ] Management mode toggle button (organize mode) **[~2h]**
- [ ] EventManageScreen (dedykowany ekran) **[~5h → split]**
  - [ ] Screen structure + layout **[~2h]**
  - [ ] State management setup **[~2h]**
  - [ ] Navigation setup **[~1h]**
- [ ] Drag & drop reordering (main list) - ReorderableListView **[~10h → split]**
  - [ ] ReorderableListView setup **[~2h]**
  - [ ] Drag handle UI **[~2h]**
  - [ ] Reorder callback + optimistic update **[~2h]**
  - [ ] API call for position change **[~2h]**
  - [ ] Error handling + rollback **[~2h]**
- [ ] Confirm checkbox toggle (w management mode) **[~3h → split]**
  - [ ] Checkbox UI + state **[~2h]**
  - [ ] API toggle + update **[~1h]**
- [ ] Payment checkbox toggle (w management mode) **[~3h → split]**
  - [ ] Checkbox UI + state **[~2h]**
  - [ ] API toggle + timestamp display **[~1h]**
- [ ] Payment method selector (BLIK/CASH/TRANSFER/CARD) **[~4h → split]**
  - [ ] Dropdown/selector UI **[~2h]**
  - [ ] API update + validation **[~2h]**
- [ ] Promote from waitlist button (↑) **[~3h → split]**
  - [ ] Button UI + placement **[~1h]**
  - [ ] API call + UI update **[~2h]**
- [ ] Demote to waitlist button (↓) **[~3h → split]**
  - [ ] Button UI + placement **[~1h]**
  - [ ] API call + UI update **[~2h]**
- [ ] Remove participant button + confirm dialog (×) **[~3h → split]**
  - [ ] Button UI + confirm dialog **[~2h]**
  - [ ] API call + list update **[~1h]**
- [ ] Add participant button + dialog (manual add) **[~4h → split]**
  - [ ] Dialog UI + user search **[~2h]**
  - [ ] API call + list refresh **[~2h]**
- [ ] HTTP PUT/POST/DELETE dla management endpoints **[~5h → split]**
  - [ ] HTTP client methods setup **[~2h]**
  - [ ] Request/response DTOs **[~2h]**
  - [ ] Error handling **[~1h]**
- [ ] Optimistic UI updates **[~3h → split]**
  - [ ] Optimistic update logic **[~2h]**
  - [ ] State management integration **[~1h]**
- [ ] Error rollback (jeśli API call fails) **[~2h]**
- [ ] Loading states dla każdej akcji **[~2h]**
- [ ] Success animations/feedback **[~2h]**
- [ ] PaymentsManageScreen (dedicated screen) **[~5h → split]**
  - [ ] Screen structure + participants list **[~2h]**
  - [ ] Payment status display **[~2h]**
  - [ ] Toggle payments UI **[~1h]**
- [ ] Payment summary (total, paid, unpaid) **[~3h → split]**
  - [ ] Summary calculation logic **[~2h]**
  - [ ] Summary UI display **[~1h]**
- [ ] Filter: paid/unpaid/all **[~2h]**
- [ ] Akcje masowe: przypomnienie, oznacz wszystkich **[~4h → split]**
  - [ ] Mass actions UI (buttons) **[~2h]**
  - [ ] API calls + batch update **[~2h]**

**Feature 3 Total: ~45h backend, ~45h Flutter = ~90h ≈ 6 tygodni**

---

## Feature 3.5: Grupy Siatkówki (NOWY - HIGH PRIORITY) (~4 tygodnie = 60h)

> **Cel:** Społeczności/grupy organizujące wydarzenia (np. grupy Facebook), członkostwo, filtrowanie

### Backend - Grupy API (Część 1: ~30h)
- [ ] Encja `Group` **[~3h → split]**
  - [ ] Podstawowa struktura encji **[~2h]**
  - [ ] Pola: membersCount, eventsCount + timestampy **[~1h]**
- [ ] Encja `UserGroup` (membership) **[~2h]**
- [ ] Enum GroupRole (MEMBER, ADMIN) **[~1h]**
- [ ] Migracja V1_4__Add_group_tables.sql **[~2h]**
- [ ] Link Event → Group (groupId FK w Event) **[~2h]**
- [ ] GroupRepository + UserGroupRepository **[~2h]**
- [ ] GroupController **[~3h → split]**
  - [ ] Controller structure + base endpoints **[~2h]**
  - [ ] Authorization setup **[~1h]**
- [ ] GET `/groups` - lista grup **[~2h]**
- [ ] GET `/groups/{id}` - szczegóły grupy **[~2h]**
- [ ] POST `/groups/{id}/join` - dołącz do grupy **[~3h → split]**
  - [ ] Endpoint implementation **[~2h]**
  - [ ] Join logic + membership creation **[~1h]**
- [ ] DELETE `/groups/{id}/leave` - opuść grupę **[~2h]**
- [ ] GET `/groups/{id}/members` - lista członków **[~2h]**
- [ ] GroupService (join/leave logic) **[~4h → split]**
  - [ ] Join/leave service methods **[~2h]**
  - [ ] MembersCount update logic **[~2h]**
- [ ] DTOs: GroupDTO, GroupDetailsDTO, UserGroupDTO **[~3h → split]**
  - [ ] GroupDTO + GroupDetailsDTO **[~2h]**
  - [ ] UserGroupDTO + mapping **[~1h]**
- [ ] Filtrowanie wydarzeń po groupId **[~2h]**

### Flutter - Grupy UI (Część 2: ~30h)
- [ ] GroupListScreen (lista grup) **[~5h → split]**
  - [ ] Screen structure + ListView **[~2h]**
  - [ ] State management + API integration **[~2h]**
  - [ ] Error + empty states **[~1h]**
- [ ] GroupListItem widget **[~3h → split]**
  - [ ] Widget layout **[~2h]**
  - [ ] Data display + badges **[~1h]**
- [ ] GroupDetailsScreen **[~5h → split]**
  - [ ] Screen structure + details display **[~2h]**
  - [ ] Members list integration **[~2h]**
  - [ ] Events from group display **[~1h]**
- [ ] Join/Leave group buttons **[~3h → split]**
  - [ ] Buttons UI + state **[~2h]**
  - [ ] API integration + error handling **[~1h]**
- [ ] HTTP GET `/groups`, POST `/groups/{id}/join`, DELETE `/groups/{id}/leave` **[~3h → split]**
  - [ ] HTTP client methods **[~2h]**
  - [ ] DTOs + error handling **[~1h]**
- [ ] Group selector w EventsListScreen **[~4h → split]**
  - [ ] Selector UI (dropdown/chips) **[~2h]**
  - [ ] Filter logic + API integration **[~2h]**
- [ ] Filtrowanie wydarzeń po grupie **[~3h → split]**
  - [ ] Filter state management **[~2h]**
  - [ ] Apply filter + refresh **[~1h]**
- [ ] GroupService + GroupNotifier **[~4h → split]**
  - [ ] Service structure **[~2h]**
  - [ ] Notifier state management **[~2h]**
- [ ] Navigation: EventDetails → Group, EventsList → GroupList **[~2h]**
- [ ] Empty state (brak grup) **[~1h]**
- [ ] Integration z EventController (groupName, groupUrl) **[~2h]**

**Feature 3.5 Total: ~30h backend, ~30h Flutter = ~60h ≈ 4 tygodnie**

---

## Feature 4: Zarządzanie Seriami Wydarzeń (~5 tygodni = 75h)

> **Cel:** Cykliczne wydarzenia (tygodniowe/miesięczne), generowanie wydarzeń z szablonu

### Backend - API Serii (Część 1: ~40h)
- [ ] Encja `EventSeries` **[~4h → split]**
  - [ ] Podstawowa struktura encji **[~2h]**
  - [ ] Pola zaawansowane (schedule, frequency, skipHolidays) **[~2h]**
- [ ] Migracja V1_3__Add_event_series_table.sql **[~2h]**
- [ ] Enum SeriesStatus (ACTIVE, PAUSED) **[~1h]**
- [ ] Link Event → Series (seriesId FK) **[~2h]**
- [ ] SeriesRepository **[~2h]**
- [ ] `SeriesController` **[~3h → split]**
  - [ ] Controller structure **[~2h]**
  - [ ] Authorization setup **[~1h]**
- [ ] GET `/series` - lista serii **[~3h → split]**
  - [ ] Endpoint implementation **[~2h]**
  - [ ] Pagination + filtering **[~1h]**
- [ ] GET `/series/{id}` - szczegóły serii **[~2h]**
- [ ] POST `/series` - utworzenie serii **[~4h → split]**
  - [ ] Endpoint + DTO validation **[~2h]**
  - [ ] Series creation logic **[~2h]**
- [ ] PUT `/series/{id}` - edycja serii **[~3h → split]**
  - [ ] Endpoint implementation **[~2h]**
  - [ ] Update logic + validation **[~1h]**
- [ ] DELETE `/series/{id}` - usunięcie serii **[~2h]**
- [ ] POST `/series/{id}/generate` - generowanie wydarzeń **[~8h → split]**
  - [ ] Endpoint + request validation **[~2h]**
  - [ ] Schedule parsing logic **[~2h]**
  - [ ] Event generation loop **[~2h]**
  - [ ] Batch insert optimization **[~2h]**
- [ ] PUT `/series/{id}/pause` **[~1h]**
- [ ] PUT `/series/{id}/resume` **[~1h]**
- [ ] DTOs: CreateSeriesRequest, GenerateEventsRequest, SeriesDTO **[~5h → split]**
  - [ ] CreateSeriesRequest + validation **[~2h]**
  - [ ] GenerateEventsRequest + SeriesDTO **[~2h]**
  - [ ] DTO mapping logic **[~1h]**
- [ ] SeriesService.generateEvents() - parsowanie schedule **[~6h → split]**
  - [ ] Schedule parser implementation **[~2h]**
  - [ ] Date calculation logic **[~2h]**
  - [ ] Edge cases + validation **[~2h]**
- [ ] Logika generowania (weekly/biweekly/monthly) **[~6h → split]**
  - [ ] Weekly/biweekly logic **[~2h]**
  - [ ] Monthly logic **[~2h]**
  - [ ] Frequency interval handling **[~2h]**
- [ ] Logika skipHolidays (wykrywanie świąt) **[~4h → split]**
  - [ ] Holidays API/data integration **[~2h]**
  - [ ] Skip logic implementation **[~2h]**
- [ ] Walidacje (przeszłość, max 52 events) **[~2h]**

### Flutter - Interfejs Zarządzania Seriami (Część 2: ~35h)
- [ ] SeriesListScreen **[~4h → split]**
  - [ ] Screen structure + ListView **[~2h]**
  - [ ] API integration + state management **[~2h]**
- [ ] SeriesListItem widget **[~2h]**
- [ ] Display: name, schedule, location, status, frequencyInterval **[~2h]**
- [ ] Filter: active/paused **[~2h]**
- [ ] HTTP GET `/series` **[~2h]**
- [ ] SeriesDetailsScreen **[~4h → split]**
  - [ ] Screen structure + details display **[~2h]**
  - [ ] Generated events list **[~2h]**
- [ ] CreateSeriesScreen **[~5h → split]**
  - [ ] Screen structure + form **[~2h]**
  - [ ] Basic fields (name, location) **[~2h]**
  - [ ] Frequency fields setup **[~1h]**
- [ ] Form fields: name, location, schedule **[~4h → split]**
  - [ ] Name & location inputs **[~2h]**
  - [ ] Schedule input (time, days) **[~2h]**
- [ ] Frequency type picker: weekly/biweekly/monthly **[~3h → split]**
  - [ ] Picker UI (dropdown) **[~2h]**
  - [ ] State management + validation **[~1h]**
- [ ] Interval picker (co ile tygodni: 1/2/3/4) **[~2h]**
- [ ] Days of week selector (multi-select checkboxes) **[~4h → split]**
  - [ ] Multi-select UI **[~2h]**
  - [ ] Selection state management **[~2h]**
- [ ] Time picker **[~2h]**
- [ ] Default slots, price, level inputs **[~2h]**
- [ ] HTTP POST `/series` **[~2h]**
- [ ] Generate events screen **[~3h → split]**
  - [ ] Screen structure + preview **[~2h]**
  - [ ] Generate button + confirmation **[~1h]**
- [ ] Date range picker (start/end) LUB liczba wydarzeń **[~3h → split]**
  - [ ] Date range picker UI **[~2h]**
  - [ ] Count input alternative **[~1h]**
- [ ] Skip holidays checkbox **[~1h]**
- [ ] Preview list wydarzeń do wygenerowania **[~3h → split]**
  - [ ] Preview list UI **[~2h]**
  - [ ] Preview data calculation **[~1h]**
- [ ] HTTP POST `/series/{id}/generate` **[~2h]**
- [ ] Success feedback z liczbą wygenerowanych **[~2h]**
- [ ] SeriesService + SeriesNotifier **[~4h → split]**
  - [ ] Service structure + API methods **[~2h]**
  - [ ] Notifier state management **[~2h]**

**Feature 4 Total: ~40h backend, ~35h Flutter = ~75h ≈ 5 tygodni**

---

## Feature 5: Profil Użytkownika i Historia (~3 tygodnie = 45h)

> **Cel:** Pełny profil użytkownika, historia wydarzeń, edycja profilu, ustawienia

### Backend - API Użytkownika (Część 1: ~22h)
- [x] `UserController` - podstawowa struktura
- [x] GET `/users/{id}` - profil użytkownika (public view)
- [ ] GET `/users/me` - profil zalogowanego **[~2h]**
- [ ] PUT `/users/me` - update profilu **[~3h → split]**
  - [ ] Endpoint + DTO **[~2h]**
  - [ ] Update logic + validation **[~1h]**
- [ ] GET `/users/me/events` - wydarzenia jako uczestnik **[~4h → split]**
  - [ ] Query implementation **[~2h]**
  - [ ] Pagination + sorting **[~2h]**
- [ ] GET `/users/me/organized` - wydarzenia jako organizator **[~3h → split]**
  - [ ] Query implementation **[~2h]**
  - [ ] DTO mapping + response **[~1h]**
- [ ] GET `/users/me/history` - historia (past events) **[~4h → split]**
  - [ ] Past events query **[~2h]**
  - [ ] History DTO + attendance data **[~2h]**
- [ ] POST `/users/{id}/thumb` - dodaj opinię (thumbUp/thumbDown) **[~3h → split]**
  - [ ] Endpoint implementation **[~2h]**
  - [ ] Increment/decrement logic **[~1h]**
- [ ] DTOs: UpdateUserRequest, UserProfileDTO, EventHistoryDTO **[~4h → split]**
  - [ ] UpdateUserRequest + validation **[~2h]**
  - [ ] UserProfileDTO + EventHistoryDTO **[~2h]**

### Flutter - Interfejs Profilu Użytkownika (Część 2: ~23h)
- [x] UserWidget - podstawowy profil użytkownika
- [x] UserDetailsWidget - wyświetlanie szczegółów
- [ ] Enhanced UserProfileScreen (zastąpić obecny) **[~5h → split]**
  - [ ] Screen redesign + layout **[~2h]**
  - [ ] Tabs setup (events, organized, history) **[~2h]**
  - [ ] API integration **[~1h]**
- [ ] Display: avatar, nickname, email, thumbsUp/Down, role, level **[~3h → split]**
  - [ ] Avatar + basic info display **[~2h]**
  - [ ] Stats display (thumbs, level) **[~1h]**
- [ ] Edit profile button → EditProfileScreen **[~2h]**
- [ ] EditProfileScreen (nickname, email, avatar upload) **[~6h → split]**
  - [ ] Screen structure + form **[~2h]**
  - [ ] Nickname & email inputs **[~2h]**
  - [ ] Avatar picker + upload **[~2h]**
- [ ] HTTP PUT `/users/me` **[~2h]**
- [ ] My Events tab (lista wydarzeń jako uczestnik) **[~3h → split]**
  - [ ] Tab UI + ListView **[~2h]**
  - [ ] API integration + state **[~1h]**
- [ ] My Organized tab (lista wydarzeń jako organizator) **[~3h → split]**
  - [ ] Tab UI + ListView **[~2h]**
  - [ ] API integration + state **[~1h]**
- [ ] History tab (past events z checkmarkiem obecności) **[~2h]**
- [ ] HTTP GET endpoints dla każdego tab **[~2h]**
- [ ] Thumb buttons (thumbUp/thumbDown) w profilu obcego użytkownika **[~3h → split]**
  - [ ] Buttons UI **[~1h]**
  - [ ] API call + update **[~2h]**
- [ ] Settings screen (powiadomienia, prywatność) **[~4h → split]**
  - [ ] Screen structure + preferences list **[~2h]**
  - [ ] Settings save/load logic **[~2h]**

**Feature 5 Total: ~22h backend, ~23h Flutter = ~45h ≈ 3 tygodnie**

---

## Feature 5.5: Ulubione Lokalizacje ✅ ZROBIONE (~2.5 tygodnia = 35h)

> **Cel:** Zarządzanie ulubionymi miejscami, quick select przy tworzeniu wydarzenia

### Backend - Ulubione Lokalizacje
- [x] Encja `FavoritePlaceEntity` (user, location, notes, createdAt)
- [x] FavoritePlaceRepository (pełna implementacja)
- [x] FavoritePlaceController - `/favorites` base path
- [x] GET `/favorites` - lista ulubionych użytkownika
- [x] GET `/favorites/{id}` - szczegóły ulubionego
- [x] POST `/favorites` - dodaj ulubione (locationId, notes)
- [x] PUT `/favorites/{id}` - aktualizuj notatki
- [x] DELETE `/favorites/{id}` - usuń po ID
- [x] DELETE `/favorites/location/{locationId}` - usuń po locationId
- [x] GET `/favorites/location/{locationId}/status` - sprawdź status (isFavorite)
- [x] FavoritePlaceService (pełna implementacja)
- [x] DTOs: AddFavoriteRequest, UpdateFavoriteRequest, FavoriteStatusResponse

### Flutter - Ulubione Lokalizacje UI
- [x] FavoriteService (pełna implementacja)
- [x] FavoriteHttpClient (wszystkie endpointy)
- [x] Lista ulubionych w UserPanelWidget
- [x] Wyświetlanie nazwy + notatek
- [x] Kliknięcie → centrowanie mapy (FavoriteLocationNotifier)
- [x] SnackBar z nazwą miejsca po wyborze
- [x] EventFavouriteButtonWidget (serce na pop-upie mapy)
- [x] Dodawanie do ulubionych z pop-upu
- [x] HTTP: GET, POST, DELETE favorites
- [ ] Dedicated FavoritePlacesScreen (pełny ekran zarządzania) **[~5h → split]**
  - [ ] Screen structure + list **[~2h]**
  - [ ] Edit/delete actions **[~2h]**
  - [ ] Empty state + navigation **[~1h]**
- [ ] Edit notes dialog **[~2h]**
- [ ] Quick select z ulubionych w CreateEventScreen **[~4h → split]**
  - [ ] Favorites selector UI **[~2h]**
  - [ ] Selection logic + location fill **[~2h]**

**Feature 5.5 Status: ~90% DONE (backend + Flutter API complete, brak dedykowanego ekranu)**

---

## Feature 6: Dopracowanie UI i Nawigacji (~3 tygodnie = 45h)

> **Cel:** Bottom navigation, animacje, stany ładowania, obsługa błędów, dodatkowe ekrany info

### Flutter - Dopracowanie UI i Nawigacji (45h)
- [ ] Bottom Navigation Bar (Home/Map, Events, Profile) **[~5h → split]**
  - [ ] Bottom nav bar UI + icons **[~2h]**
  - [ ] Navigation state management **[~2h]**
  - [ ] Integration z existing screens **[~1h]**
- [ ] App drawer z dodatkowymi opcjami (Settings, About, Help) **[~4h → split]**
  - [ ] Drawer UI + menu items **[~2h]**
  - [ ] Navigation to screens **[~2h]**
- [ ] Loading skeletons na wszystkich ekranach **[~5h → split]**
  - [ ] Skeleton widgets creation **[~2h]**
  - [ ] Integration: list screens **[~2h]**
  - [ ] Integration: details screens **[~1h]**
- [ ] Error states z retry button **[~4h → split]**
  - [ ] Error state widgets **[~2h]**
  - [ ] Retry logic integration **[~2h]**
- [ ] Hero animations (event card → details) **[~3h → split]**
  - [ ] Hero setup for images/cards **[~2h]**
  - [ ] Animation tuning **[~1h]**
- [ ] Smooth page transitions **[~2h]**
- [ ] Haptic feedback na button clicks **[~1h]**
- [ ] Success animations (podstawowe, bez Lottie) **[~2h]**
- [ ] Toast notifications system (udoskonalenie) **[~2h]**
- [ ] Network error handling (offline mode info) **[~3h → split]**
  - [ ] Network status detection **[~2h]**
  - [ ] Offline mode UI **[~1h]**
- [ ] Token expiration handling (udoskonalenie) **[~2h]**
- [ ] Validation error messages z backendu **[~2h]**
- [ ] **Skill Levels Info Screen** (edukacyjny) **[~5h → split]**
  - [x] SkillLevelWidget - podstawa jest (route: `/level`)
  - [ ] Rozbudowanie o 4 kategorie **[~2h]**
  - [ ] Szczegółowe opisy + przykłady **[~2h]**
  - [ ] Link z CreateEvent i filtrów **[~1h]**
- [ ] **Share Event** (deep linking) **[~4h → split]**
  - [ ] Deep linking setup **[~2h]**
  - [ ] Share functionality + URL generation **[~2h]**
- [ ] **Navigate to Location** (Maps integration) **[~3h → split]**
  - [ ] Maps app detection (Google/Apple) **[~2h]**
  - [ ] Navigation intent launch **[~1h]**
- [ ] Search bar w EventsListScreen **[~3h → split]**
  - [ ] Search bar UI + debounce **[~2h]**
  - [ ] Search logic integration **[~1h]**

**Feature 6 Total: ~45h Flutter ≈ 3 tygodnie**

---

## Feature 7: EventStatus & Cancellation (NOWY) (~1.5 tygodnia = 25h)

> **Cel:** Anulowanie wydarzeń, statusy, powiadomienia o odwołaniu

### Backend - Event Status (Część 1: ~15h)
- [ ] Enum EventStatus (ACTIVE, CANCELLED, COMPLETED) **[~1h]**
- [ ] Pole `status` w EventEntity (już dodane w Feature 1) **[~0h]**
- [ ] Logika anulowania wydarzenia **[~4h → split]**
  - [ ] Cancel service method **[~2h]**
  - [ ] Participant notification trigger **[~2h]**
- [ ] PUT `/events/{id}/cancel` endpoint **[~2h]**
- [ ] PUT `/events/{id}/complete` endpoint (auto po dacie) **[~2h]**
- [ ] Powiadomienia o odwołaniu (Email/Push - integracja) **[~4h → split]**
  - [ ] Email notification implementation **[~2h]**
  - [ ] Push notification implementation **[~2h]**
- [ ] Filtrowanie: ukrywanie CANCELLED/COMPLETED z mapy **[~2h]**

### Flutter - Event Status UI (Część 2: ~10h)
- [ ] EventStatus badges (ACTIVE/CANCELLED/COMPLETED) **[~2h]**
- [ ] Cancel event button (tylko organizator) **[~2h]**
- [ ] Cancel event confirmation dialog **[~2h]**
- [ ] HTTP PUT `/events/{id}/cancel` **[~1h]**
- [ ] Cancelled events list (w profilu organizatora) **[~2h]**
- [ ] Filter: show/hide cancelled **[~1h]**

**Feature 7 Total: ~15h backend, ~10h Flutter = ~25h ≈ 1.5 tygodnia**

---

## Sprint: Testowanie i Dokumentacja (~4 tygodnie = 60h)

### Testy Jednostkowe (Backend)
- [ ] UserServiceTest **[~4h → split]**
  - [ ] Basic CRUD tests **[~2h]**
  - [ ] Edge cases + validation tests **[~2h]**
- [ ] EventServiceTest - CRUD **[~6h → split]**
  - [ ] Create & update tests **[~2h]**
  - [ ] Delete & query tests **[~2h]**
  - [ ] Validation & error tests **[~2h]**
- [ ] EventServiceTest.joinEvent - main list & waitlist **[~6h → split]**
  - [ ] Main list join scenarios **[~2h]**
  - [ ] Waitlist scenarios **[~2h]**
  - [ ] Edge cases (full event, etc.) **[~2h]**
- [ ] EventServiceTest.leaveEvent - promotion & renumbering **[~7h → split]**
  - [ ] Leave from main list tests **[~2h]**
  - [ ] Leave from waitlist tests **[~2h]**
  - [ ] Promotion logic tests **[~2h]**
  - [ ] Renumbering tests **[~1h]**
- [ ] ParticipantServiceTest **[~6h → split]**
  - [ ] Position change tests **[~2h]**
  - [ ] Promote/demote tests **[~2h]**
  - [ ] Payment & confirm tests **[~2h]**
- [ ] SeriesServiceTest **[~4h → split]**
  - [ ] CRUD tests **[~2h]**
  - [ ] Generate events tests **[~2h]**
- [ ] FavoritePlaceServiceTest **[~3h → split]**
  - [ ] CRUD operations tests **[~2h]**
  - [ ] Edge cases tests **[~1h]**
- [ ] Coverage 80%+ **[~2h]**

**Estymata Part 1: ~38h**

### Testy Integracyjne (Backend)
- [ ] AuthControllerIntegrationTest **[~3h → split]**
  - [ ] Register & login tests **[~2h]**
  - [ ] Token refresh & validation tests **[~1h]**
- [ ] EventControllerIntegrationTest - CRUD **[~4h → split]**
  - [ ] GET/POST endpoints tests **[~2h]**
  - [ ] PUT/DELETE endpoints tests **[~2h]**
- [ ] EventControllerIntegrationTest - join/leave **[~4h → split]**
  - [ ] Join endpoint tests **[~2h]**
  - [ ] Leave endpoint tests **[~2h]**
- [ ] ParticipantManagementControllerIntegrationTest **[~4h → split]**
  - [ ] Management endpoints tests **[~2h]**
  - [ ] Authorization tests **[~2h]**

**Estymata Part 2: ~15h**

### Dokumentacja API
- [ ] Swagger/OpenAPI setup (springdoc-openapi-ui) **[~2h]**
- [ ] Swagger UI na `/swagger-ui.html` **[~1h]**
- [ ] Adnotacje @Operation na wszystkich endpoints **[~4h → split]**
  - [ ] Auth & User endpoints **[~2h]**
  - [ ] Events & Participants endpoints **[~2h]**
- [ ] Przykłady request/response **[~2h]**
- [ ] Export openapi.json **[~0.5h]**

**Estymata Part 3: ~9.5h**

### Kolekcja Postman
- [ ] Workspace + folders (Auth, Events, Participants, Users, Series, Groups, Favorites) **[~4h → split]**
  - [ ] Workspace setup + Auth/Events folders **[~2h]**
  - [ ] Remaining folders + organization **[~2h]**
- [ ] Environment variables **[~0.5h]**
- [ ] Example requests z danymi **[~1.5h]**
- [ ] Export collection **[~0.5h]**

**Estymata Part 4: ~6.5h**

**Sprint Testowanie Total: ~60h ≈ 4 tygodnie**

---

## Sprint: Wdrożenie na Raspberry Pi (~3 tygodnie = 45h)

### Konfiguracja Sprzętu i Systemu
- [ ] Zakup: RPi 4B 8GB + karta SD 64GB + zasilacz **[~500-600 PLN]**
- [ ] Instalacja Raspberry Pi OS Lite (64-bit) **[~2h]**
- [ ] Statyczny IP / DuckDNS setup **[~1h]**
- [ ] SSH setup (klucze SSH) **[~1h]**
- [ ] UFW firewall (porty 22, 80, 443, 8080, 5432) **[~1h]**

**Estymata Part 1: ~5h**

### Konfiguracja PostgreSQL
- [ ] Instalacja PostgreSQL **[~1h]**
- [ ] Utworzenie użytkownika i bazy **[~1h]**
- [ ] Konfiguracja postgresql.conf i pg_hba.conf **[~1h]**
- [ ] Backup cron job (pg_dump) **[~1h]**

**Estymata Part 2: ~4h**

### Wdrożenie Java i Backend
- [ ] Instalacja OpenJDK 21 + Maven **[~2h]**
- [ ] Clone repo meet-app-be **[~0.5h]**
- [ ] Konfiguracja .env (DB credentials, JWT_SECRET) **[~1h]**
- [ ] Build: mvn clean package **[~0.5h]**
- [ ] Systemd service setup **[~2h]**
- [ ] Enable & start service **[~1h]**
- [ ] Flyway migrations run **[~1h]**

**Estymata Part 3: ~8h**

### Nginx Reverse Proxy i SSL
- [ ] Instalacja Nginx **[~1h]**
- [ ] Konfiguracja proxy (8080→80) **[~2h]**
- [ ] Let's Encrypt SSL certificate **[~2h]**
- [ ] Auto-renewal test **[~0.5h]**

**Estymata Part 4: ~5.5h**

### Monitorowanie i Bezpieczeństwo
- [ ] Uptimerobot setup **[~1h]**
- [ ] Fail2ban setup **[~1.5h]**
- [ ] Backup skrypt + cron **[~2h]**
- [ ] Logrotate setup **[~1h]**

**Estymata Part 5: ~5.5h**

### Dane Testowe i Testowanie
- [ ] Seed 5-10 testowych użytkowników **[~1h]**
- [ ] Seed 20-30 wydarzeń w Poznaniu **[~2h]**
- [ ] Seed 3-5 grup **[~1h]**
- [ ] Seed lokalizacji (hale sportowe Poznań) **[~1h]**
- [ ] Test wszystkich endpoints z Postman **[~2h]**
- [ ] Smoke tests aplikacji Flutter z produkcją **[~2h]**

**Estymata Part 6: ~9h**

**Sprint Wdrożenie Total: ~37h ≈ 2.5 tygodnia**

---

## Przyszłe Usprawnienia (Post-MVP)

### Powiadomienia Email (~2 tygodnie = 30h)
- [ ] Spring Mail + SMTP config **[~2h]**
- [ ] EmailService interface **[~1h]**
- [ ] Thymeleaf templates **[~6h → split]**
  - [ ] Base template + styling **[~2h]**
  - [ ] Reminder template **[~2h]**
  - [ ] Promotion & cancellation templates **[~2h]**
- [ ] Przypomnienie 24h przed eventem **[~3h → split]**
  - [ ] Scheduler setup **[~2h]**
  - [ ] Email sending logic **[~1h]**
- [ ] Awans z waitlist notification **[~2h]**
- [ ] Event cancelled notification **[~2h]**
- [ ] Scheduler (@Scheduled) **[~2h]**
- [ ] User preferences (enable/disable emails) **[~3h → split]**
  - [ ] Preferences model + migration **[~2h]**
  - [ ] UI for preferences **[~1h]**

### Powiadomienia Push (~3 tygodnie = 45h)
- [ ] Firebase FCM setup backend **[~4h → split]**
  - [ ] Firebase project setup **[~2h]**
  - [ ] Backend integration **[~2h]**
- [ ] Push: Przypomnienie **[~3h → split]**
  - [ ] Notification payload creation **[~2h]**
  - [ ] Scheduler integration **[~1h]**
- [ ] Push: Awans z waitlist **[~3h → split]**
  - [ ] Notification trigger **[~2h]**
  - [ ] Payload + sending **[~1h]**
- [ ] Push: Zmiana eventu **[~4h → split]**
  - [ ] Change detection logic **[~2h]**
  - [ ] Notification sending **[~2h]**
- [ ] Push: Anulowanie **[~3h → split]**
  - [ ] Cancel notification trigger **[~2h]**
  - [ ] Batch send to participants **[~1h]**
- [ ] Endpoint: FCM token registration **[~2h]**
- [ ] Flutter FCM integration **[~6h → split]**
  - [ ] FCM plugin setup **[~2h]**
  - [ ] Token registration **[~2h]**
  - [ ] Message handlers **[~2h]**
- [ ] Local notifications (flutter_local_notifications) **[~4h → split]**
  - [ ] Plugin setup **[~2h]**
  - [ ] Notification display logic **[~2h]**
- [ ] Notification center w aplikacji **[~5h → split]**
  - [ ] Screen structure **[~2h]**
  - [ ] Notification list + state **[~2h]**
  - [ ] Mark as read functionality **[~1h]**
- [ ] User preferences (enable/disable push) **[~3h → split]**
  - [ ] Preferences UI **[~2h]**
  - [ ] Backend filtering logic **[~1h]**

### Płatności (Stripe) (~4 tygodnie = 60h)
- [ ] Stripe API integration **[~8h → split]**
  - [ ] Stripe SDK setup **[~2h]**
  - [ ] Account configuration **[~2h]**
  - [ ] Basic payment intent flow **[~2h]**
  - [ ] Testing setup **[~2h]**
- [ ] Payment initiate endpoint **[~6h → split]**
  - [ ] Endpoint implementation **[~2h]**
  - [ ] Payment intent creation **[~2h]**
  - [ ] Error handling **[~2h]**
- [ ] Stripe webhook **[~8h → split]**
  - [ ] Webhook endpoint setup **[~2h]**
  - [ ] Event verification **[~2h]**
  - [ ] Event processing logic **[~2h]**
  - [ ] Error handling + retry **[~2h]**
- [ ] Auto mark isPaid po payment_intent.succeeded **[~2h]**
- [ ] Refund logic **[~8h → split]**
  - [ ] Refund API implementation **[~2h]**
  - [ ] Partial/full refund logic **[~2h]**
  - [ ] Refund state management **[~2h]**
  - [ ] Error handling **[~2h]**
- [ ] Payment history (tabela PaymentTransaction) **[~6h → split]**
  - [ ] Entity + migration **[~2h]**
  - [ ] Repository + queries **[~2h]**
  - [ ] History endpoint **[~2h]**
- [ ] Flutter Stripe integration (stripe_payment) **[~8h → split]**
  - [ ] Plugin setup **[~2h]**
  - [ ] Payment sheet implementation **[~2h]**
  - [ ] Card input UI **[~2h]**
  - [ ] Payment confirmation flow **[~2h]**
- [ ] Payment flow UI **[~6h → split]**
  - [ ] Payment screen **[~2h]**
  - [ ] Amount display + breakdown **[~2h]**
  - [ ] Success/error states **[~2h]**
- [ ] Payment methods management **[~4h → split]**
  - [ ] Saved cards list **[~2h]**
  - [ ] Add/remove card UI **[~2h]**
- [ ] Receipt/invoice generation **[~4h → split]**
  - [ ] Receipt template **[~2h]**
  - [ ] PDF generation + email **[~2h]**

---

## Podsumowanie Estymat (15h/tydzień w wolnym czasie)

**MVP - Do pokazania pierwszym grupom:**

| Feature | Backend | Flutter | Total | Tygodnie | Status |
|---------|---------|---------|-------|----------|--------|
| Sprint 0: Auth & Setup | ~Done | ~Done | ~5h | 0.5 tyg. | ✅ 95% |
| Feature 0: Mapa | ~4h | ~19h | ~23h | 1.5 tyg. | ✅ 80% |
| Feature 1: Events CRUD | ~35h | ~40h | ~75h | 5 tyg. | 🟡 40% |
| Feature 2: Join/Leave | ~35h | ~40h | ~75h | 5 tyg. | 🔴 0% |
| Feature 3: Participant Mgmt | ~45h | ~45h | ~90h | 6 tyg. | 🔴 0% |
| Feature 3.5: Grupy | ~30h | ~30h | ~60h | 4 tyg. | 🔴 0% |
| Feature 4: Series | ~40h | ~35h | ~75h | 5 tyg. | 🔴 0% |
| Feature 5: User Profile | ~22h | ~23h | ~45h | 3 tyg. | 🟡 30% |
| Feature 5.5: Fav Places | ~0h | ~11h | ~11h | 1 tyg. | ✅ 90% |
| Feature 6: UI Polish | - | ~45h | ~45h | 3 tyg. | 🟡 20% |
| Feature 7: EventStatus | ~15h | ~10h | ~25h | 1.5 tyg. | 🔴 0% |
| Sprint Testowanie | ~60h | - | ~60h | 4 tyg. | 🔴 0% |
| Sprint Wdrożenie (RPi) | - | - | ~37h | 2.5 tyg. | 🔴 0% |
| **TOTAL MVP** | **~286h** | **~298h** | **~621h** | **~41.5 tyg.** | **~25%** |

**Czyli: ~621h / 15h/tydzień = 41.5 tygodni = ~10.5 miesiąca**

**Postęp aktualny:** ~25% (głównie Sprint 0, Mapa, FavoritePlaces)

**Post-MVP (po feedbacku od użytkowników):**

| Feature | Godziny | Tygodnie |
|---------|---------|----------|
| Email Notifications | ~30h | 2 tyg. |
| Push Notifications | ~45h | 3 tyg. |
| Płatności (Stripe) | ~60h | 4 tyg. |
| **TOTAL Post-MVP** | **~135h** | **9 tyg.** |

**GRAND TOTAL: ~756h = ~50 tygodni = ~12.5 miesiąca**

---

## Harmonogram (realistyczny dla 15h/tydzień solo)

### Faza 1: Core Features (7 miesięcy = 28 tyg.)
- **Miesiąc 1:** Feature 1 - Events CRUD (5 tyg.) ← **40% DONE**
- **Miesiąc 2:** Feature 2 - Join/Leave (5 tyg.)
- **Miesiąc 3-4:** Feature 3 - Participant Management (6 tyg.)
- **Miesiąc 4-5:** Feature 3.5 - Grupy (4 tyg.)
- **Miesiąc 5-6:** Feature 4 - Series (5 tyg.)
- **Miesiąc 6-7:** Feature 5 - User Profile (3 tyg.)

### Faza 2: Polish & Secondary Features (3 miesiące = 12 tyg.)
- **Miesiąc 7-8:** Feature 6 - UI Polish (3 tyg.)
- **Miesiąc 8:** Feature 7 - EventStatus (1.5 tyg.)
- **Miesiąc 8-9:** Sprint Testowanie (4 tyg.)
- **Miesiąc 9:** Sprint Wdrożenie (2.5 tyg.)

### Faza 3: Pokazanie Pierwszym Grupom
- **Miesiąc 10:** First users testing
- **Miesiąc 10-11:** Zbieranie feedbacku + bug fixes

### Faza 4: Post-MVP (2-3 miesiące)
- **Miesiąc 11-12:** Email Notifications (2 tyg.) + Push Notifications (3 tyg.)
- **Miesiąc 12-13:** Płatności (4 tyg.)

---

## Priorytety (Critical Path)

**🔴 CRITICAL - musi być przed pokazaniem użytkownikom:**
1. ~~Feature 0: Mapa~~ - **✅ 80% DONE**
2. Feature 1: Events CRUD (backend + Flutter) - **40% DONE, dokończyć** - **4 tygodnie**
3. Feature 2: Join/Leave (backend + Flutter) - **5 tygodni**
4. Feature 3: Participant Management (backend + Flutter) - **6 tygodni**
5. Feature 6: UI Polish (Bottom Nav, Filters, Error handling) - **3 tygodnie**
6. Sprint Wdrożenie: Raspberry Pi - **2.5 tygodnia**

**Critical Path: ~20.5 tygodni (5 miesięcy) + bug fixes**

**🟡 HIGH - bardzo przydatne:**
7. Feature 3.5: Grupy - **4 tygodnie**
8. Feature 4: Series Management - **5 tygodni**
9. Feature 5: User Profile (rozszerzone) - **3 tygodnie**
10. Feature 7: EventStatus - **1.5 tygodnia**
11. Sprint Testowanie & Docs - **4 tygodnie**

**🟢 MEDIUM:**
12. Email Notifications - **2 tygodnie**
13. Push Notifications - **3 tygodnie**

**⚪ LOW:**
14. Płatności (Stripe integration) - **4 tygodnie**

---

**Realistyczny cel:**
- **Podstawowe MVP (Critical Path):** gotowe za **~5-6 miesięcy**
- **Pełne MVP (wszystkie features):** gotowe za **~10.5 miesiąca**
- **Pokazanie pierwszym użytkownikom:** za **~11-12 miesięcy** 🚀

**Postęp aktualny: ~25% (głównie auth, mapa, ulubione lokalizacje)**
