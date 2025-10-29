# Meet App - TODO Lista Implementacji (Solo Developer)

> **Uwaga:** Pliki HTML w tym repo (`patrykdolata.github.io`) to tylko klikalna makieta prototypowa.
>
> **Backend:** `meet-app-be` (Spring Boot + PostgreSQL) - częściowo zaimplementowany
>
> **Frontend:** `meet-app-fe` (Flutter mobile app) - częściowo zaimplementowany
>
> **Solo project:** Robisz wszystko sam (backend + Flutter)
>
> **Legend:**
> - `[ ]` - Do zrobienia
> - `[?]` - Prawdopodobnie już zrobione (wymaga weryfikacji)
> - `[x]` - Potwierdzone jako ukończone

---

## Sprint 1: Backend Setup & Auth (DONE - do weryfikacji)

### Setup Projektu
- [?] Utworzenie projektu Spring Boot przez Spring Initializr
- [?] Konfiguracja PostgreSQL (baza `meet_app_db`)
- [?] Setup `application.yml` (datasource, JPA, security)
- [?] Struktura pakietów (controller, service, repository, entity, dto, config, exception)
- [?] Konfiguracja Lombok, Validation

### Model Bazy Danych - Encje JPA
- [?] Encja `User` (id, login, email, password, nickName, avatar, thumbsUp/Down, role)
- [?] Encja `Location` (id, name, address, latitude, longitude, description)
- [?] Encja `Event` (id, title, message, location, organizer, dateTime, duration, slots, price, level, status)
- [ ] Encja `EventParticipant` (event, user, position, status, isConfirmed, isPaid, joinedAt, waitlistPosition)
- [ ] Encja `EventSeries` (id, name, organizer, location, schedule, slots, price, level, status)
- [?] Encja `FavoritePlace` (id, user, location, notes, createdAt)
- [ ] Encja `Group` (id, name, url, memberCount)
- [ ] Enums: Role, EventStatus, ParticipantStatus, SeriesStatus

### Migracje Bazy Danych (Flyway)
- [?] Setup Flyway w projekcie
- [?] V1_0__Initial_schema.sql (user, token, location, event, favorite_place)
- [?] V1_1__Fix_null_user_roles.sql
- [?] V1_2__Add_default_user.sql
- [ ] V1_3__Add_event_participant_table.sql
- [ ] V1_4__Add_event_slots_and_level.sql
- [ ] V1_5__Add_event_series_table.sql
- [ ] V1_6__Add_groups_table.sql
- [ ] V1_7__Add_performance_indexes.sql
- [ ] V1_8__Seed_test_data.sql (dane z mock-data.js)

### Spring Security & JWT
- [?] Dependency: io.jsonwebtoken (JWT)
- [?] JwtService (generateToken, validateToken, extractUsername)
- [?] JwtAuthenticationFilter
- [?] UserDetailsService implementation
- [?] PasswordEncoder bean (BCryptPasswordEncoder)
- [?] SecurityConfiguration (CORS, CSRF disable, stateless session)
- [?] LogoutService (revoke token)
- [?] TokenEntity & TokenRepository

### CORS Configuration
- [?] CorsConfig bean
- [ ] Allow origins: localhost Flutter debug, Raspberry Pi IP
- [?] Allow methods: GET, POST, PUT, DELETE, OPTIONS
- [?] Allow credentials: true

### Auth Endpoints
- [?] `AuthController`
- [?] POST `/api/auth/register`
- [?] POST `/api/auth/login`
- [?] POST `/api/auth/logout`
- [?] DTOs: RegisterRequest, AuthenticationRequest, AuthenticationResponse
- [ ] DTO: `UserDTO` (kompletny)

### Auth Service
- [?] `AuthenticationService.register()` - hash password BCrypt
- [?] `AuthenticationService.authenticate()` - generate JWT
- [ ] Custom exceptions

---

## Sprint 2: Events Core API (~4 tygodnie = 60h)

### Events CRUD - Controller & DTOs
- [?] `EventController`
- [?] GET `/api/events` - lista wydarzeń
- [?] GET `/api/events/{id}` - szczegóły
- [?] POST `/api/events` - utworzenie
- [?] PUT `/api/events/{id}` - edycja
- [ ] DELETE `/api/events/{id}` **[~2h]**
- [ ] Query params: minLevel, maxLevel, locationId, maxPrice, availableOnly, page, size **[~3h]**
- [ ] Uzupełnić EventRequest: duration, slots, level, groupName **[~2h]**
- [ ] DTOs: UpdateEventRequest, EventDTO, EventDetailDTO **[~5h]**

**Estymata Part 1: ~12h**

### Events Service
- [?] `EventService.createEvent()`
- [?] `EventService.updateEvent()`
- [ ] `EventService.deleteEvent()` **[~2h]**
- [ ] Walidacje (startDateTime, slots, level, duration) **[~3h]**

**Estymata Part 2: ~5h**

### Join/Leave Event - Endpoints
- [ ] POST `/api/events/{id}/join` **[~4h]**
- [ ] DELETE `/api/events/{id}/leave` **[~3h]**
- [ ] GET `/api/events/{id}/participants` **[~2h]**
- [ ] DTOs: ParticipantDTO, ParticipantsListDTO **[~2h]**

**Estymata Part 3: ~11h**

### Join/Leave Service - KLUCZOWA LOGIKA
- [ ] `EventService.joinEvent()` - main list vs waitlist **[~5h]**
- [ ] `EventService.leaveEvent()` - awans z waitlist **[~5h]**
- [ ] `EventService.promoteFirstFromWaitlist()` **[~4h]**
- [ ] `EventService.renumberMainList()` **[~2h]**
- [ ] `EventService.renumberWaitlist()` **[~2h]**
- [ ] Custom exceptions (AlreadyJoinedException, EventFullException...) **[~1.5h]**

**Estymata Part 4: ~19.5h**

### Repository Queries
- [ ] `EventParticipantRepository` - nowe repo **[~2h]**
- [ ] Query methods (existsByEventAndUser, countByEventAndStatus...) **[~4h]**
- [ ] Event filters queries **[~3h]**

**Estymata Part 5: ~9h**

**TOTAL Sprint 2: ~56.5h ≈ 4 tygodnie**

---

## Sprint 3: Participant Management (~4 tygodnie = 55h)

### Participant Management Endpoints
- [ ] `ParticipantManagementController` **[~3h]**
- [ ] PUT `/api/events/{eventId}/participants/{userId}/position` **[~4h]**
- [ ] PUT `/api/events/{eventId}/participants/{userId}/confirm` **[~2h]**
- [ ] PUT `/api/events/{eventId}/participants/{userId}/payment` **[~2h]**
- [ ] POST `/api/events/{eventId}/participants/{userId}/promote` **[~4h]**
- [ ] POST `/api/events/{eventId}/participants/{userId}/demote` **[~3h]**
- [ ] DELETE `/api/events/{eventId}/participants/{userId}` **[~3h]**
- [ ] POST `/api/events/{eventId}/participants` **[~3h]**
- [ ] DTOs: ChangePositionRequest, AddParticipantRequest **[~1h]**

**Estymata Part 1: ~25h**

### Participant Management Service
- [ ] Sprawdzanie uprawnień: tylko organizator **[~2h]**
- [ ] `ParticipantService.changePosition()` **[~4h]**
- [ ] `ParticipantService.toggleConfirm()` **[~1h]**
- [ ] `ParticipantService.togglePayment()` **[~1h]**
- [ ] `ParticipantService.promoteToMainList()` **[~3h]**
- [ ] `ParticipantService.demoteToWaitlist()` **[~3h]**
- [ ] `ParticipantService.removeParticipant()` **[~4h]**
- [ ] `ParticipantService.addParticipant()` **[~3h]**
- [ ] Custom exceptions **[~1h]**

**Estymata Part 2: ~22h**

### Bulk Actions
- [ ] PUT `/api/events/{eventId}/participants/confirm-all` **[~2h]**
- [ ] PUT `/api/events/{eventId}/participants/pay-all` **[~2h]**
- [ ] POST `/api/events/{eventId}/participants/send-reminder` **[~4h]**

**Estymata Part 3: ~8h**

**TOTAL Sprint 3: ~55h ≈ 4 tygodnie**

---

## Sprint 4: Users, Locations, Series (~5.5 tygodni = 78h)

### Users API
- [ ] `UserController` **[~2h]**
- [ ] GET `/api/users/me` **[~2h]**
- [ ] PUT `/api/users/me` **[~3h]**
- [ ] GET `/api/users/{id}` **[~2h]**
- [ ] GET `/api/users/me/events` **[~3h]**
- [ ] GET `/api/users/me/organized` **[~2h]**
- [ ] GET `/api/users/me/history` **[~4h]**
- [ ] DTOs: UpdateUserRequest, UserProfileDTO, EventHistoryDTO **[~4h]**

**Estymata Part 1: ~22h**

### Locations & Favorites
- [ ] GET `/api/locations/{id}` **[~2h]**
- [ ] GET `/api/locations/{id}/events` **[~3h]**
- [ ] DTOs: AddFavoriteRequest, FavoritePlaceDTO **[~1.5h]**

**Estymata Part 2: ~6.5h**

### Event Series API
- [ ] `SeriesController` **[~3h]**
- [ ] GET `/api/series` **[~3h]**
- [ ] GET `/api/series/{id}` **[~2h]**
- [ ] POST `/api/series` **[~4h]**
- [ ] PUT `/api/series/{id}` **[~3h]**
- [ ] DELETE `/api/series/{id}` **[~2h]**
- [ ] POST `/api/series/{id}/generate` **[~8h]**
- [ ] PUT `/api/series/{id}/pause` **[~1h]**
- [ ] PUT `/api/series/{id}/resume` **[~1h]**
- [ ] DTOs: CreateSeriesRequest, GenerateEventsRequest, SeriesDTO **[~5h]**

**Estymata Part 3: ~32h**

### Series Service - Generation Logic
- [ ] `SeriesService.generateEvents()` - parsowanie schedule **[~6h]**
- [ ] Logika generowania (weekly/monthly) **[~8h]**
- [ ] Link do series (series_id FK) **[~2h]**
- [ ] Walidacje (przeszłość, max 52 events) **[~2h]**

**Estymata Part 4: ~18h**

**TOTAL Sprint 4: ~78.5h ≈ 5.5 tygodnia**

---

## Sprint 5: Testing & Documentation (~5.5 tygodni = 79h)

### Unit Tests
- [ ] `UserServiceTest` **[~4h]**
- [ ] `EventServiceTest` - CRUD **[~6h]**
- [ ] `EventServiceTest.joinEvent` - main list **[~3h]**
- [ ] `EventServiceTest.joinEvent` - waitlist **[~3h]**
- [ ] `EventServiceTest.leaveEvent` - promotion **[~4h]**
- [ ] `EventServiceTest.leaveEvent` - renumbering **[~3h]**
- [ ] `ParticipantServiceTest` **[~6h]**
- [ ] `SeriesServiceTest` **[~4h]**
- [ ] Coverage 80%+ **[~5h dodatkowe]**

**Estymata Part 1: ~38h**

### Integration Tests
- [ ] `AuthControllerIntegrationTest` **[~3h]**
- [ ] `EventControllerIntegrationTest` - CRUD **[~4h]**
- [ ] `EventControllerIntegrationTest` - join/leave **[~4h]**
- [ ] `ParticipantManagementControllerIntegrationTest` **[~4h]**

**Estymata Part 2: ~15h**

### API Documentation
- [ ] Swagger/OpenAPI setup (springdoc-openapi-ui) **[~2h]**
- [ ] Swagger UI na `/swagger-ui.html` **[~1h]**
- [ ] Adnotacje @Operation, @ApiResponse **[~6h]**
- [ ] Przykłady request/response **[~4h]**
- [ ] Export openapi.json **[~1h]**

**Estymata Part 3: ~14h**

### Postman Collection
- [ ] Workspace + folders (Auth, Events, Participants, Users, Series) **[~8h]**
- [ ] Environment variables **[~0.5h]**
- [ ] Example requests z danymi **[~2h]**
- [ ] Export collection **[~0.5h]**

**Estymata Part 4: ~11h**

**TOTAL Sprint 5: ~78h ≈ 5.5 tygodnia**

---

## Raspberry Pi Deploy (~3.5 tygodnia = 50h)

### Hardware & System Setup
- [ ] Zakup: RPi 4B 8GB + karta SD 64GB + zasilacz **[~500-600 PLN]**
- [ ] Instalacja Raspberry Pi OS Lite (64-bit) **[~2h]**
- [ ] Statyczny IP / DuckDNS setup **[~1h]**
- [ ] SSH setup (klucze SSH) **[~1h]**
- [ ] UFW firewall (porty 22, 80, 443, 8080, 5432) **[~1h]**
- [ ] System update **[~0.5h]**

**Estymata Part 1: ~5.5h**

### PostgreSQL Setup
- [ ] Instalacja PostgreSQL **[~1h]**
- [ ] Utworzenie użytkownika i bazy **[~1h]**
- [ ] Konfiguracja postgresql.conf i pg_hba.conf **[~1h]**
- [ ] Test połączenia **[~0.5h]**
- [ ] Backup cron job (pg_dump) **[~1h]**

**Estymata Part 2: ~4.5h**

### Java & Maven
- [ ] Instalacja OpenJDK 21 **[~1h]**
- [ ] Instalacja Maven **[~1h]**
- [ ] Weryfikacja wersji **[~0.5h]**

**Estymata Part 3: ~2.5h**

### Backend Deployment
- [ ] Clone repo meet-app-be **[~0.5h]**
- [ ] Konfiguracja .env (DB credentials, JWT_SECRET) **[~1h]**
- [ ] Build: mvn clean package **[~0.5h]**
- [ ] Test uruchomienia JAR **[~1h]**
- [ ] Systemd service setup **[~2h]**
- [ ] Enable & start service **[~1h]**
- [ ] Monitoring logs **[~0.5h]**

**Estymata Part 4: ~6.5h**

### Nginx Reverse Proxy
- [ ] Instalacja Nginx **[~1h]**
- [ ] Konfiguracja proxy (8080→80) **[~2h]**
- [ ] Config file + symlink **[~1h]**
- [ ] Test + restart **[~0.5h]**

**Estymata Part 5: ~4.5h**

### SSL Certificate (Let's Encrypt)
- [ ] Instalacja Certbot **[~1h]**
- [ ] Uzyskanie certyfikatu dla domeny **[~1h]**
- [ ] Auto-renewal test **[~0.5h]**

**Estymata Part 6: ~2.5h**

### Monitoring & Maintenance
- [ ] htop instalacja **[~0.5h]**
- [ ] logrotate setup **[~1h]**
- [ ] Backup skrypt + cron **[~2h]**
- [ ] Retention policy (7 dni) **[~0.5h]**
- [ ] Uptimerobot setup **[~1h]**
- [ ] Actuator health check **[~0.5h]**

**Estymata Part 7: ~5.5h**

### Network & Security
- [ ] Port forwarding (router) **[~1h]**
- [ ] DuckDNS / No-IP **[~1.5h]**
- [ ] Test zewnętrzny dostęp **[~0.5h]**
- [ ] SSH whitelist IP **[~1h]**
- [ ] Fail2ban setup **[~1.5h]**

**Estymata Part 8: ~5.5h**

### Performance Tuning
- [ ] JVM heap (-Xmx4G -Xms2G) **[~0.5h]**
- [ ] PostgreSQL shared_buffers **[~0.5h]**
- [ ] PostgreSQL max_connections **[~0.5h]**
- [ ] Swap file 2GB **[~1h]**

**Estymata Part 9: ~2.5h**

### Seed Data & Testing
- [ ] Utworzenie 5-10 testowych użytkowników **[~1h]**
- [ ] Seed 10-20 wydarzeń (różne lokalizacje, daty) **[~2h]**
- [ ] Test wszystkich endpoints z Postman **[~2h]**
- [ ] Współdzielenie URL backendu (dla siebie na Flutter) **[~0.5h]**

**Estymata Part 10: ~5.5h**

**TOTAL Raspberry Pi: ~45h ≈ 3 tygodnie**

---

## Flutter Integration (~2 tygodnie = 30h)

### Backend-Flutter Connection
- [ ] Konfiguracja `API_BASE_URL` w Flutter .env **[~0.5h]**
- [ ] Test `/api/auth/login` z Flutter **[~2h]**
- [ ] Test `/api/auth/register` z Flutter **[~2h]**
- [ ] Implementacja JWT storage w Flutter (SharedPreferences) **[~2h]**
- [ ] HTTP client setup (dio) z Authorization header **[~2h]**

**Estymata Part 1: ~8.5h**

### Events Integration
- [ ] Test GET `/api/events` - lista wydarzeń **[~2h]**
- [ ] Test GET `/api/events/{id}` - szczegóły **[~2h]**
- [ ] Test POST `/api/events/{id}/join` **[~2h]**
- [ ] Test DELETE `/api/events/{id}/leave` **[~2h]**
- [ ] UI updates po join/leave **[~3h]**

**Estymata Part 2: ~11h**

### Participant Management (organizator view)
- [ ] Test toggle confirm z Flutter **[~1h]**
- [ ] Test toggle payment z Flutter **[~1h]**
- [ ] Test promote/demote **[~2h]**
- [ ] UI dla zarządzania uczestnikami **[~4h]**

**Estymata Part 3: ~8h**

### API Adjustments (na podstawie testów Flutter)
- [ ] Iteracje na DTOs (dodanie/usunięcie pól) **[~3h]**
- [ ] Fix błędów integracji **[~2h]**

**Estymata Part 4: ~5h**

**TOTAL Flutter Integration: ~32.5h ≈ 2 tygodnie**

---

## Future Enhancements (Post-MVP)

### Email Notifications (~2 tygodnie = 30h)
- [ ] Spring Mail + SMTP config **[~2h]**
- [ ] EmailService interface **[~1h]**
- [ ] Thymeleaf templates **[~6h]**
- [ ] Przypomnienie 24h przed eventem **[~3h]**
- [ ] Awans z waitlist notification **[~2h]**
- [ ] Przypomnienie o płatności **[~2h]**
- [ ] Event cancelled notification **[~2h]**
- [ ] Scheduler (@Scheduled) **[~2h]**

### Push Notifications (~3 tygodnie = 45h)
- [ ] Firebase FCM setup backend **[~4h]**
- [ ] FCM dependency **[~1h]**
- [ ] Push: Przypomnienie **[~3h]**
- [ ] Push: Awans z waitlist **[~3h]**
- [ ] Push: Zmiana eventu **[~4h]**
- [ ] Endpoint: FCM token registration **[~2h]**
- [ ] Flutter FCM integration **[~6h]**

### Payments (Stripe) (~4 tygodnie = 60h)
- [ ] Stripe API integration **[~8h]**
- [ ] Payment initiate endpoint **[~6h]**
- [ ] Stripe webhook **[~8h]**
- [ ] Auto mark isPaid **[~2h]**
- [ ] Refund logic **[~8h]**
- [ ] Payment history **[~4h]**
- [ ] Flutter Stripe integration **[~8h]**

---

## Podsumowanie Estymat (15h/tydzień w wolnym czasie)

**MVP - Do pokazania pierwszym grupom:**

| Sprint | Zadania | Godziny | Tygodnie | Miesiące |
|--------|---------|---------|----------|----------|
| Sprint 2 | Events Core (join/leave) | ~57h | 4 tyg. | 1 mies. |
| Sprint 3 | Participant Management | ~55h | 4 tyg. | 1 mies. |
| Sprint 4 | Users/Series | ~78.5h | 5.5 tyg. | 1.5 mies. |
| Sprint 5 | Testing & Docs | ~78h | 5.5 tyg. | 1.5 mies. |
| RPi Deploy | Raspberry Pi Setup | ~45h | 3 tyg. | 0.75 mies. |
| Flutter | Integration & Testing | ~32.5h | 2 tyg. | 0.5 mies. |
| **TOTAL MVP** | **Core functionality** | **~346h** | **~23 tyg.** | **~5.75 mies.** |

**Post-MVP (po feedbacku od użytkowników):**

| Feature | Godziny | Tygodnie | Miesiące |
|---------|---------|----------|----------|
| Email Notifications | ~30h | 2 tyg. | 0.5 mies. |
| Push Notifications | ~45h | 3 tyg. | 0.75 mies. |
| Payments (Stripe) | ~60h | 4 tyg. | 1 mies. |
| **TOTAL Post-MVP** | **~135h** | **9 tyg.** | **~2.25 mies.** |

**GRAND TOTAL: ~481h = ~32 tygodnie = ~8 miesięcy**

---

## Timeline (realistyczny dla 15h/tydzień solo)

### Faza 1: Backend MVP (5-6 miesięcy)
- **Miesiąc 1-2:** Sprint 2 - Events Core API (join/leave)
- **Miesiąc 2-3:** Sprint 3 - Participant Management
- **Miesiąc 3-5:** Sprint 4 - Users/Series
- **Miesiąc 5-6:** Sprint 5 - Testing & Documentation

### Faza 2: Deploy & Flutter Integration (1 miesiąc)
- **Tydzień 1-3:** Raspberry Pi Setup
- **Tydzień 4-5:** Flutter Integration & Testing
- **Tydzień 6:** Bug fixes & polish

### Faza 3: Pokazanie Pierwszym Grupom
- **Miesiąc 6-7:** First users testing
- **Miesiąc 7:** Zbieranie feedbacku

### Faza 4: Post-MVP (2-3 miesiące)
- **Miesiąc 8:** Email Notifications
- **Miesiąc 8-9:** Push Notifications
- **Miesiąc 9-10:** Payments (jeśli potrzebne)

---

## Priorytety (Critical Path)

**🔴 CRITICAL - musi być przed pokazaniem użytkownikom:**
1. Sprint 2: Join/Leave logic - **4 tygodnie**
2. Sprint 3: Participant Management - **4 tygodnie**
3. Sprint 5 Part 3-4: Swagger + Postman - **2 tygodnie**
4. Raspberry Pi Deploy - **3 tygodnie**
5. Flutter Integration (basic) - **2 tygodnie**

**Critical Path: ~15 tygodni (3.75 miesiąca)**

**🟡 HIGH - bardzo przydatne:**
6. Sprint 4: Series (cykliczne wydarzenia) - **2 tygodnie**
7. Sprint 4: User Profile - **1.5 tygodnia**
8. Sprint 5: Tests - **3.5 tygodnia**

**🟢 MEDIUM:**
9. Email Notifications - **2 tygodnie**
10. Push Notifications - **3 tygodnie**

**⚪ LOW:**
11. Payments - **4 tygodnie**
12. Advanced features - **TBD**

---

## Koszty (bardzo niskie!)

**Jednorazowe:**
- Raspberry Pi 4B 8GB: ~400-450 PLN
- Karta SD 64GB: ~50-80 PLN
- Zasilacz: ~40-50 PLN
- Obudowa (opcja): ~40-60 PLN
- **Total hardware: ~530-640 PLN**

**Miesięczne:**
- Energia (5W): ~3 PLN/miesiąc
- Internet: masz już (0 PLN)
- Wszystkie usługi: DARMOWE (PostgreSQL, Nginx, SSL, DDNS, monitoring)
- **Total miesięczne: ~3 PLN**

---

**Realistyczny cel: MVP gotowe za ~4 miesiące, pokazanie pierwszym użytkownikom za ~6 miesięcy!** 🚀
