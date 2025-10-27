# Meet-App - Plan Implementacji

## 📋 Spis treści
1. [Założenia projektowe](#założenia-projektowe)
2. [Stack technologiczny](#stack-technologiczny)
3. [Modele danych](#modele-danych)
4. [Features](#features)
5. [Kroki implementacji](#kroki-implementacji)
6. [Architektura](#architektura)
7. [API Endpoints](#api-endpoints)

---

## 🎯 Założenia projektowe

### Cel aplikacji
Meet-App to system do zarządzania wydarzeniami sportowymi (głównie siatkówka), umożliwiający:
- Organizację cyklicznych i jednorazowych wydarzeń sportowych
- Zarządzanie listami uczestników z rezerwą
- Tracking płatności
- Powiadomienia i przypomnienia
- Łatwy onboarding przez invite links

### Główne założenia biznesowe
1. **Multi-tenant** - każda grupa sportowa to oddzielny tenant
2. **Różne role** - Organizator, Członek, Gość
3. **Passwordless auth** - możliwość logowania przez magic link
4. **Invite-first** - priorytet dla szybkiego dołączania przez zaproszenia
5. **Mobile-first** - główna platforma to aplikacja mobilna
6. **Real-time updates** - live aktualizacje list uczestników
7. **Offline support** - podstawowe funkcje dostępne offline

### Kluczowe wymagania niefunkcjonalne
- **Performance**: Response time < 500ms (95th percentile)
- **Availability**: 99.5% uptime
- **Scalability**: Support dla 10k+ aktywnych użytkowników
- **Security**: GDPR compliant, secure token storage
- **Mobile**: iOS 14+, Android 8+

---

## 🛠 Stack technologiczny

### Backend
```yaml
Core:
  - Java 21 (LTS)
  - Spring Boot 3.2+
  - Spring Security
  - Spring Data JPA
  - Spring WebSocket

Database:
  - PostgreSQL 15+ (primary)
  - Redis 7+ (cache, sessions, rate limiting)

Messaging:
  - Firebase Cloud Messaging (push notifications)
  - Spring Mail (email)
  - Twilio/SMS API (SMS, opcjonalnie)

Tools:
  - Maven
  - Docker
  - Liquibase (database migrations)
  - Swagger/OpenAPI (API docs)
  - JUnit 5 + Mockito (testing)
  - TestContainers (integration tests)
```

### Mobile (Flutter)
```yaml
Core:
  - Flutter 3.19+
  - Dart 3.0+

State Management:
  - flutter_bloc / bloc ^8.1.0

Navigation:
  - go_router ^13.0.0

Network:
  - dio ^5.0.0
  - retrofit (code generation)

Storage:
  - sqflite (local database)
  - shared_preferences
  - flutter_secure_storage (tokens)

Notifications:
  - firebase_messaging
  - flutter_local_notifications

Deep Links:
  - app_links ^4.0.0
  - uni_links ^0.5.1

UI:
  - flutter_svg
  - cached_network_image
  - shimmer (loading states)

Utils:
  - intl (i18n)
  - timeago
  - share_plus
  - url_launcher
```

### DevOps & Infrastructure
```yaml
CI/CD:
  - GitHub Actions / GitLab CI
  - Fastlane (mobile deployment)

Containerization:
  - Docker
  - Docker Compose

Monitoring:
  - Spring Boot Actuator
  - Prometheus + Grafana
  - Sentry (error tracking)
  - Firebase Crashlytics (mobile)

Cloud (Opcje):
  - AWS (EC2, RDS, ElastiCache, S3)
  - DigitalOcean (Droplets, Managed PostgreSQL)
  - Hetzner (budget-friendly)
```

---

## 📊 Modele danych

### 1. Users (Użytkownicy)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255), -- nullable dla passwordless users

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),

    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    -- ADMIN, ORGANIZER, MEMBER, GUEST

    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,

    -- Preferences
    notification_enabled BOOLEAN DEFAULT true,
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    notification_push BOOLEAN DEFAULT true,

    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT email_or_phone_required CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Groups (Grupy sportowe)
```sql
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sport_type VARCHAR(50) NOT NULL, -- VOLLEYBALL, FOOTBALL, BASKETBALL, etc.

    -- Location
    default_venue VARCHAR(500),
    city VARCHAR(100),

    -- Settings
    default_capacity INT DEFAULT 12,
    default_price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'PLN',

    -- Visual
    logo_url VARCHAR(500),
    color VARCHAR(7), -- hex color

    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_groups_sport ON groups(sport_type);
CREATE INDEX idx_groups_city ON groups(city);
```

### 3. Group Members (Członkowie grup)
```sql
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    -- OWNER, ADMIN, ORGANIZER, MEMBER

    -- Permissions
    can_create_events BOOLEAN DEFAULT false,
    can_manage_participants BOOLEAN DEFAULT false,
    can_manage_payments BOOLEAN DEFAULT false,

    -- Stats
    total_events INT DEFAULT 0,
    attended_events INT DEFAULT 0,

    joined_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(group_id, user_id)
);

CREATE INDEX idx_group_members_group ON group_members(group_id);
CREATE INDEX idx_group_members_user ON group_members(user_id);
CREATE INDEX idx_group_members_role ON group_members(group_id, role);
```

### 4. Series (Serie cykliczne)
```sql
CREATE TABLE series (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,

    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Recurrence pattern
    recurrence_type VARCHAR(50) NOT NULL, -- WEEKLY, BIWEEKLY, MONTHLY
    day_of_week INT, -- 1=Monday, 7=Sunday (for WEEKLY)
    day_of_month INT, -- 1-31 (for MONTHLY)

    -- Time
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Location
    venue VARCHAR(500) NOT NULL,

    -- Settings
    capacity INT NOT NULL,
    waitlist_capacity INT DEFAULT 5,
    price DECIMAL(10,2),

    auto_promote_waitlist BOOLEAN DEFAULT true,
    require_payment BOOLEAN DEFAULT false,
    registration_deadline_hours INT, -- hours before event

    -- Validity
    starts_from DATE NOT NULL,
    ends_at DATE, -- NULL = no end date

    is_active BOOLEAN DEFAULT true,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_series_group ON series(group_id);
CREATE INDEX idx_series_active ON series(is_active);
```

### 5. Events (Wydarzenia)
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    series_id UUID REFERENCES series(id) ON DELETE SET NULL,

    -- Basic info
    name VARCHAR(200),
    description TEXT,

    -- Date & Time
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    -- Location
    venue VARCHAR(500) NOT NULL,
    venue_lat DECIMAL(10,8),
    venue_lng DECIMAL(11,8),

    -- Capacity
    capacity INT NOT NULL,
    current_participants INT DEFAULT 0,
    waitlist_capacity INT DEFAULT 5,
    current_waitlist INT DEFAULT 0,

    -- Price
    price DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'PLN',

    -- Settings
    auto_promote_waitlist BOOLEAN DEFAULT true,
    require_payment BOOLEAN DEFAULT false,
    registration_deadline TIMESTAMP,

    -- Status
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    -- SCHEDULED, ONGOING, COMPLETED, CANCELLED

    -- Notes
    organizer_notes TEXT,

    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_events_group ON events(group_id);
CREATE INDEX idx_events_date ON events(event_date, start_time);
CREATE INDEX idx_events_series ON events(series_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_upcoming ON events(event_date, start_time) WHERE status = 'SCHEDULED';
```

### 6. Event Participants (Uczestnicy wydarzenia)
```sql
CREATE TABLE event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- List position (1-based, determines order on main list)
    position INT NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'REGISTERED',
    -- REGISTERED, CONFIRMED, ATTENDED, NO_SHOW, CANCELLED

    -- Payment
    payment_required BOOLEAN DEFAULT false,
    payment_status VARCHAR(50) DEFAULT 'UNPAID',
    -- UNPAID, PENDING, PAID, REFUNDED

    -- Confirmation
    confirmed BOOLEAN DEFAULT false,
    confirmed_at TIMESTAMP,

    -- Guest support
    is_guest BOOLEAN DEFAULT false,
    guest_name VARCHAR(200),
    guest_phone VARCHAR(20),

    -- Metadata
    joined_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_participants_event ON event_participants(event_id);
CREATE INDEX idx_participants_user ON event_participants(user_id);
CREATE INDEX idx_participants_position ON event_participants(event_id, position);
CREATE INDEX idx_participants_status ON event_participants(event_id, status);
```

### 7. Event Waitlist (Lista rezerwowa)
```sql
CREATE TABLE event_waitlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Queue position (1-based, FIFO)
    position INT NOT NULL,

    -- Status
    status VARCHAR(50) DEFAULT 'WAITING',
    -- WAITING, PROMOTED, EXPIRED, CANCELLED

    -- Guest support
    is_guest BOOLEAN DEFAULT false,
    guest_name VARCHAR(200),
    guest_phone VARCHAR(20),

    -- Metadata
    added_at TIMESTAMP DEFAULT NOW(),
    promoted_at TIMESTAMP,

    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_waitlist_event ON event_waitlist(event_id);
CREATE INDEX idx_waitlist_user ON event_waitlist(user_id);
CREATE INDEX idx_waitlist_position ON event_waitlist(event_id, position);
CREATE INDEX idx_waitlist_status ON event_waitlist(event_id, status);
```

### 8. Payments (Płatności)
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'PLN',

    payment_method VARCHAR(50),
    -- BLIK, CASH, TRANSFER, CARD, STRIPE, PAYU

    status VARCHAR(50) DEFAULT 'PENDING',
    -- PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED

    -- External payment reference (for integrations)
    external_payment_id VARCHAR(255),

    -- Metadata
    paid_at TIMESTAMP,
    refunded_at TIMESTAMP,
    notes TEXT,

    created_by UUID REFERENCES users(id), -- who marked as paid
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_event ON payments(event_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_external ON payments(external_payment_id);
```

### 9. Invite Links (Linki zaproszeń)
```sql
CREATE TABLE invite_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,

    type VARCHAR(50) NOT NULL,
    -- GROUP_INVITE, EVENT_INVITE, SERIES_INVITE

    -- References
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    series_id UUID REFERENCES series(id) ON DELETE CASCADE,

    -- Creator
    created_by UUID NOT NULL REFERENCES users(id),

    -- Usage limits
    max_uses INT, -- NULL = unlimited
    current_uses INT DEFAULT 0,

    -- Expiration
    expires_at TIMESTAMP,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Metadata
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT invite_has_reference CHECK (
        (type = 'GROUP_INVITE' AND group_id IS NOT NULL) OR
        (type = 'EVENT_INVITE' AND event_id IS NOT NULL) OR
        (type = 'SERIES_INVITE' AND series_id IS NOT NULL)
    )
);

CREATE INDEX idx_invite_token ON invite_links(token);
CREATE INDEX idx_invite_group ON invite_links(group_id);
CREATE INDEX idx_invite_event ON invite_links(event_id);
CREATE INDEX idx_invite_active ON invite_links(is_active, expires_at);
```

### 10. Magic Auth Tokens (Tokeny magic link)
```sql
CREATE TABLE magic_auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,

    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    phone VARCHAR(20),

    expires_at TIMESTAMP NOT NULL,

    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,

    ip_address VARCHAR(45), -- IPv6 support
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_magic_token ON magic_auth_tokens(token);
CREATE INDEX idx_magic_user ON magic_auth_tokens(user_id);
CREATE INDEX idx_magic_expires ON magic_auth_tokens(expires_at);
```

### 11. Notifications (Powiadomienia)
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL,
    -- EVENT_REMINDER, PAYMENT_REMINDER, WAITLIST_PROMOTED,
    -- EVENT_CANCELLED, EVENT_UPDATED, PAYMENT_RECEIVED

    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,

    -- Related entities
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,

    -- Delivery channels
    sent_push BOOLEAN DEFAULT false,
    sent_email BOOLEAN DEFAULT false,
    sent_sms BOOLEAN DEFAULT false,

    sent_at TIMESTAMP,

    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,

    -- Deep link
    action_url VARCHAR(500),

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### 12. Refresh Tokens (JWT Refresh)
```sql
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    token VARCHAR(500) UNIQUE NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    is_revoked BOOLEAN DEFAULT false,
    revoked_at TIMESTAMP,

    -- Device info
    device_id VARCHAR(255),
    device_name VARCHAR(255),
    device_type VARCHAR(50), -- IOS, ANDROID, WEB

    -- Security
    ip_address VARCHAR(45),
    user_agent TEXT,

    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_refresh_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_device ON refresh_tokens(device_id);
```

### 13. Audit Log (Historia zmian)
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    entity_type VARCHAR(50) NOT NULL, -- EVENT, PARTICIPANT, PAYMENT, etc.
    entity_id UUID NOT NULL,

    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE

    user_id UUID REFERENCES users(id),

    -- Changes
    old_values JSONB,
    new_values JSONB,

    -- Context
    ip_address VARCHAR(45),
    user_agent TEXT,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);
```

---

## 🎨 Features

### F1. Authentication & Authorization

#### F1.1 Classic Registration/Login
- [ ] Rejestracja email + hasło
- [ ] Logowanie email + hasło
- [ ] Walidacja email (link weryfikacyjny)
- [ ] Reset hasła
- [ ] JWT access token (15 min) + refresh token (7 dni)

#### F1.2 Magic Link Authentication
- [ ] Żądanie magic link (email/telefon)
- [ ] Wysyłka linku (email/SMS)
- [ ] Logowanie przez kliknięcie linku
- [ ] Auto-expiration (15 minut)

#### F1.3 Invite-based Registration
- [ ] Rejestracja przez link zaproszenia
- [ ] Quick signup (imię, nazwisko, email/tel)
- [ ] Automatyczne dołączenie do grupy/wydarzenia
- [ ] Skip password creation (passwordless)

#### F1.4 Social Auth (Opcjonalne - Faza 3)
- [ ] Google Sign-In
- [ ] Apple Sign-In
- [ ] Facebook Login

---

### F2. User Profile Management

#### F2.1 Profile
- [ ] Edycja profilu (imię, nazwisko, email, telefon)
- [ ] Upload avatar
- [ ] Zmiana hasła
- [ ] Ustawienia prywatności

#### F2.2 Statistics
- [ ] Liczba wydarzeń (zapisane/uczestniczone)
- [ ] Frekwencja (%)
- [ ] Historia obecności
- [ ] Historia płatności

#### F2.3 Settings
- [ ] Preferencje powiadomień (push/email/SMS)
- [ ] Język aplikacji
- [ ] Timezone
- [ ] Wylogowanie
- [ ] Usunięcie konta

---

### F3. Group Management

#### F3.1 Create & Configure Group
- [ ] Tworzenie grupy (nazwa, sport, lokalizacja)
- [ ] Ustawienia domyślne (pojemność, cena, venue)
- [ ] Upload logo
- [ ] Kolor grupy (branding)

#### F3.2 Member Management
- [ ] Lista członków
- [ ] Przypisywanie ról (Admin, Organizer, Member)
- [ ] Uprawnienia (tworzenie eventów, zarządzanie płatnościami)
- [ ] Usuwanie członków
- [ ] Zawieszanie członków

#### F3.3 Group Settings
- [ ] Edycja ustawień grupy
- [ ] Publiczna/prywatna grupa
- [ ] Harmonogram domyślny
- [ ] Archiwizacja grupy

---

### F4. Series Management (Cykliczne wydarzenia)

#### F4.1 Create Series
- [ ] Wybór wzorca (co tydzień, co 2 tygodnie, miesięcznie)
- [ ] Dzień tygodnia + godziny
- [ ] Lokalizacja + pojemność + cena
- [ ] Data rozpoczęcia + zakończenia
- [ ] Ustawienia (deadline, auto-promote, płatności)

#### F4.2 Generate Events from Series
- [ ] Generowanie wydarzeń na X tygodni naprzód
- [ ] Preview przed utworzeniem
- [ ] Bulk generation
- [ ] Exclude specific dates (święta, wakacje)

#### F4.3 Manage Series
- [ ] Lista wszystkich serii
- [ ] Edycja serii (zmiana godzin, ceny, etc.)
- [ ] Dezaktywacja serii
- [ ] Usunięcie serii (zachowanie istniejących eventów)
- [ ] Statystyki serii

---

### F5. Event Management

#### F5.1 Create Event
- [ ] Ręczne tworzenie jednorazowego wydarzenia
- [ ] Wybór daty, czasu, lokalizacji
- [ ] Ustawienie pojemności (main list + waitlist)
- [ ] Cena wydarzenia
- [ ] Deadline na zapisy
- [ ] Notatki organizatora

#### F5.2 Event Details
- [ ] Wyświetlanie szczegółów wydarzenia
- [ ] Lista uczestników (main + waitlist)
- [ ] Mapa lokalizacji
- [ ] Statystyki (zajęte miejsca, płatności)
- [ ] Status użytkownika (czy jest zapisany, pozycja)

#### F5.3 Edit Event
- [ ] Edycja daty/czasu
- [ ] Zmiana lokalizacji
- [ ] Zmiana ceny
- [ ] ⚠️ Pojemność nie może być zmniejszona poniżej current_participants

#### F5.4 Cancel Event
- [ ] Anulowanie wydarzenia
- [ ] Powiadomienie wszystkich uczestników
- [ ] Zwrot płatności (opcjonalnie)
- [ ] Zmiana statusu na CANCELLED

#### F5.5 Event List Views
- [ ] Nadchodzące wydarzenia (sorted by date)
- [ ] Moje wydarzenia (user participated)
- [ ] Historia (past events)
- [ ] Filtrowanie (data, grupa, sport)
- [ ] Wyszukiwanie

---

### F6. Participant Management

#### F6.1 Join Event
- [ ] Zapis na wydarzenie (user)
- [ ] Automatyczne dodanie na koniec main list lub waitlist
- [ ] Sprawdzenie deadline
- [ ] Powiadomienie organizatora

#### F6.2 Leave Event
- [ ] Wypisanie się z wydarzenia
- [ ] Auto-promote z waitlist (jeśli enabled)
- [ ] Powiadomienie następnej osoby z waitlist
- [ ] Deadline check

#### F6.3 Manage Participants (Organizer)
- [ ] Lista uczestników (drag & drop reorder)
- [ ] Ręczne dodawanie uczestnika
- [ ] Usuwanie uczestnika
- [ ] Przenoszenie main ↔ waitlist
- [ ] Zaznaczanie potwierdzenia obecności
- [ ] Zaznaczanie płatności

#### F6.4 Guest Support
- [ ] Dodawanie gościa (bez konta)
- [ ] Imię + telefon gościa
- [ ] Guest na main list / waitlist
- [ ] Opcjonalne utworzenie konta dla gościa później

#### F6.5 Waitlist Management
- [ ] Automatyczny awans z waitlist (gdy ktoś się wypisze)
- [ ] Powiadomienie o awansie
- [ ] Ręczne promowanie z waitlist
- [ ] Kolejność FIFO
- [ ] Pozycja na waitlist

---

### F7. Payment Management

#### F7.1 Payment Tracking
- [ ] Lista płatności dla wydarzenia
- [ ] Status płatności (unpaid/pending/paid)
- [ ] Metoda płatności (Blik, Cash, Transfer, Card)
- [ ] Timestamp płatności
- [ ] Suma zebranych środków

#### F7.2 Mark Payment (Organizer)
- [ ] Oznaczanie jako opłacone (manual)
- [ ] Wybór metody płatności
- [ ] Notatka do płatności
- [ ] Masowe oznaczanie (wszyscy jako paid)

#### F7.3 Payment Reminders
- [ ] Automatyczne przypomnienia (dzień przed)
- [ ] Ręczne wysyłanie przypomnienia
- [ ] Reminder do konkretnej osoby
- [ ] Reminder do wszystkich nieopłaconych

#### F7.4 Payment Integration (Faza 3)
- [ ] Integracja Stripe / PayU
- [ ] Online payment flow
- [ ] Webhook handling
- [ ] Auto-update payment status
- [ ] Refunds

#### F7.5 Payment Reports
- [ ] Raport finansowy (grupa, okres)
- [ ] Export do CSV/PDF
- [ ] Podsumowanie: zebrano/brakuje
- [ ] Historia transakcji

---

### F8. Notifications System

#### F8.1 Event Reminders
- [ ] Przypomnienie 24h przed eventem
- [ ] Przypomnienie 2h przed eventem
- [ ] Customizable reminder time

#### F8.2 Payment Reminders
- [ ] Przypomnienie o nieopłaconej płatności
- [ ] 24h przed eventem
- [ ] Configurable frequency

#### F8.3 Status Change Notifications
- [ ] Powiadomienie o awansie z waitlist
- [ ] Powiadomienie o anulowaniu wydarzenia
- [ ] Powiadomienie o zmianie daty/lokalizacji
- [ ] Powiadomienie o dodaniu do wydarzenia

#### F8.4 Notification Channels
- [ ] Push notifications (FCM)
- [ ] Email notifications
- [ ] SMS notifications (opcjonalnie)
- [ ] In-app notifications center

#### F8.5 Notification Preferences
- [ ] Włącz/wyłącz push/email/SMS
- [ ] Wybór typów powiadomień
- [ ] Quiet hours
- [ ] Frequency settings

---

### F9. Invite System

#### F9.1 Generate Invite Links
- [ ] Link do grupy
- [ ] Link do wydarzenia
- [ ] Link do serii
- [ ] Ustawienia linku (max uses, expiration)
- [ ] QR code generation

#### F9.2 Share Invites
- [ ] Share via WhatsApp/SMS/Email
- [ ] Copy link to clipboard
- [ ] QR code display
- [ ] Deep link support

#### F9.3 Process Invites
- [ ] Walidacja linku
- [ ] Info o zaproszeniu (preview)
- [ ] Quick signup (new user)
- [ ] Auto-join (existing user)
- [ ] Track invite usage

#### F9.4 Manage Invites
- [ ] Lista aktywnych linków
- [ ] Dezaktywacja linku
- [ ] Statystyki użycia
- [ ] Historia zaproszeń

---

### F10. Real-time Features

#### F10.1 WebSocket Connections
- [ ] Real-time updates list uczestników
- [ ] Live payment status updates
- [ ] Live event capacity updates
- [ ] Connection management

#### F10.2 Optimistic UI
- [ ] Instant UI updates (przed response z API)
- [ ] Rollback on error
- [ ] Sync state management

#### F10.3 Live Activity Feed
- [ ] "Kuba dołączył do wydarzenia"
- [ ] "Anna opłaciła udział"
- [ ] Real-time feed w event details

---

### F11. Offline Support

#### F11.1 Local Caching
- [ ] Cache upcoming events
- [ ] Cache user data
- [ ] Cache group data
- [ ] Sync strategy (stale-while-revalidate)

#### F11.2 Offline Actions Queue
- [ ] Queue join/leave requests
- [ ] Queue payment updates
- [ ] Auto-sync when back online
- [ ] Conflict resolution

#### F11.3 Offline Indicators
- [ ] Offline mode banner
- [ ] Cached data indicator
- [ ] Sync status indicator

---

### F12. Search & Filters

#### F12.1 Event Search
- [ ] Search by name
- [ ] Search by location
- [ ] Search by date range
- [ ] Search by group

#### F12.2 Advanced Filters
- [ ] Filter by sport type
- [ ] Filter by price range
- [ ] Filter by available spots
- [ ] Filter by distance (geolocation)

#### F12.3 Group Discovery (Faza 3)
- [ ] Browse public groups
- [ ] Filter by city
- [ ] Filter by sport
- [ ] Join public group

---

### F13. Analytics & Reports (Faza 3)

#### F13.1 User Analytics
- [ ] Attendance rate
- [ ] Most active members
- [ ] Payment compliance rate
- [ ] Engagement metrics

#### F13.2 Group Analytics
- [ ] Total events hosted
- [ ] Average attendance
- [ ] Revenue over time
- [ ] Growth metrics

#### F13.3 Event Analytics
- [ ] Fill rate (capacity utilization)
- [ ] Cancellation rate
- [ ] Payment collection rate
- [ ] Popular time slots

---

### F14. Admin Panel (Faza 3)

#### F14.1 User Management
- [ ] View all users
- [ ] Edit/delete users
- [ ] Ban/unban users
- [ ] Verify users manually

#### F14.2 Group Moderation
- [ ] View all groups
- [ ] Approve/reject groups
- [ ] Deactivate groups
- [ ] Group reports

#### F14.3 System Monitoring
- [ ] Active users count
- [ ] System health status
- [ ] Error logs
- [ ] Performance metrics

---

## 🚀 Kroki implementacji

### FAZA 1: MVP - Core Backend (4-6 tygodni)

#### Week 1-2: Project Setup & Authentication
- [ ] **Backend Setup**
  - [ ] Initialize Spring Boot project (Java 21, Maven)
  - [ ] Configure PostgreSQL + Liquibase
  - [ ] Configure Redis
  - [ ] Setup Docker Compose (local dev)
  - [ ] Configure Spring Security

- [ ] **Authentication Module**
  - [ ] User entity & repository
  - [ ] JWT token generation/validation
  - [ ] Refresh token mechanism
  - [ ] Registration endpoint (`POST /api/v1/auth/register`)
  - [ ] Login endpoint (`POST /api/v1/auth/login`)
  - [ ] Refresh token endpoint (`POST /api/v1/auth/refresh`)
  - [ ] Logout endpoint (`POST /api/v1/auth/logout`)

- [ ] **Testing**
  - [ ] Unit tests (UserService, AuthService)
  - [ ] Integration tests (AuthController)

#### Week 3-4: Groups & Members
- [ ] **Group Management**
  - [ ] Group entity & repository
  - [ ] GroupMember entity & repository (with roles)
  - [ ] CRUD endpoints for groups
    - [ ] `POST /api/v1/groups` - create group
    - [ ] `GET /api/v1/groups` - list user's groups
    - [ ] `GET /api/v1/groups/{id}` - get group details
    - [ ] `PUT /api/v1/groups/{id}` - update group
    - [ ] `DELETE /api/v1/groups/{id}` - delete group

- [ ] **Member Management**
  - [ ] `GET /api/v1/groups/{id}/members` - list members
  - [ ] `POST /api/v1/groups/{id}/members` - add member
  - [ ] `PUT /api/v1/groups/{id}/members/{userId}` - update role
  - [ ] `DELETE /api/v1/groups/{id}/members/{userId}` - remove member

- [ ] **Authorization**
  - [ ] Role-based access control (RBAC)
  - [ ] Permission checks (only organizers can manage)

- [ ] **Testing**
  - [ ] Unit tests (GroupService, MemberService)
  - [ ] Integration tests (GroupController)

#### Week 5-6: Events & Participants
- [ ] **Event Management**
  - [ ] Event entity & repository
  - [ ] EventParticipant entity & repository
  - [ ] EventWaitlist entity & repository
  - [ ] CRUD endpoints for events
    - [ ] `POST /api/v1/events` - create event
    - [ ] `GET /api/v1/events` - list events (with filters)
    - [ ] `GET /api/v1/events/{id}` - event details
    - [ ] `PUT /api/v1/events/{id}` - update event
    - [ ] `DELETE /api/v1/events/{id}` - delete event

- [ ] **Participant Management**
  - [ ] `POST /api/v1/events/{id}/join` - join event
  - [ ] `DELETE /api/v1/events/{id}/leave` - leave event
  - [ ] `GET /api/v1/events/{id}/participants` - list participants
  - [ ] `PUT /api/v1/events/{id}/participants/reorder` - reorder (drag-drop)
  - [ ] `POST /api/v1/events/{id}/participants/{userId}/confirm` - confirm attendance

- [ ] **Waitlist Logic**
  - [ ] Auto-promote from waitlist when spot opens
  - [ ] Position management (FIFO queue)
  - [ ] `POST /api/v1/events/{id}/waitlist/{userId}/promote` - manual promote

- [ ] **Testing**
  - [ ] Unit tests (EventService, ParticipantService, WaitlistService)
  - [ ] Integration tests (EventController)
  - [ ] Test auto-promote logic

---

### FAZA 2: Mobile App MVP (4-6 tygodni)

#### Week 1-2: Flutter Setup & Authentication UI
- [ ] **Project Setup**
  - [ ] Initialize Flutter project
  - [ ] Setup folder structure (Clean Architecture)
  - [ ] Configure dependencies (bloc, dio, etc.)
  - [ ] Setup navigation (go_router)
  - [ ] Setup dependency injection (get_it)

- [ ] **Authentication Screens**
  - [ ] Splash screen
  - [ ] Login page
  - [ ] Register page
  - [ ] Forgot password page
  - [ ] Secure storage for tokens
  - [ ] API client setup (Dio + Interceptors)
  - [ ] Auth BLoC implementation

- [ ] **Testing**
  - [ ] Unit tests (AuthBloc, AuthRepository)
  - [ ] Widget tests (LoginPage, RegisterPage)

#### Week 3-4: Main App Flow
- [ ] **Home/Dashboard**
  - [ ] Bottom navigation (Wydarzenia, Grupy, Profil)
  - [ ] Event list page
  - [ ] Pull-to-refresh
  - [ ] Loading states (shimmer)
  - [ ] Empty states

- [ ] **Groups**
  - [ ] Groups list page
  - [ ] Group details page
  - [ ] Create group page
  - [ ] Members list
  - [ ] Group switcher

- [ ] **Profile**
  - [ ] Profile page
  - [ ] Edit profile page
  - [ ] Statistics display
  - [ ] Settings page
  - [ ] Logout

#### Week 5-6: Event Features
- [ ] **Event Details**
  - [ ] Event details page (replica of event.html)
  - [ ] Participant list display
  - [ ] Join/Leave button
  - [ ] Waitlist display
  - [ ] Status badges

- [ ] **Event Creation/Edit**
  - [ ] Create event page (replica of event-create.html)
  - [ ] Form validation
  - [ ] Date/time picker
  - [ ] Capacity settings

- [ ] **Event Management (Organizer)**
  - [ ] Manage participants page (replica of event-manage.html)
  - [ ] Drag-to-reorder participants
  - [ ] Confirmation toggles
  - [ ] Payment toggles
  - [ ] Add/remove participants

---

### FAZA 3: Advanced Features (6-8 tygodni)

#### Week 1-2: Series & Recurring Events
- [ ] **Backend**
  - [ ] Series entity & repository
  - [ ] Series CRUD endpoints
  - [ ] `POST /api/v1/series/{id}/generate` - generate events
  - [ ] Recurrence pattern logic (weekly, biweekly, monthly)
  - [ ] Scheduled job to auto-generate events

- [ ] **Mobile**
  - [ ] Series list page
  - [ ] Create series page
  - [ ] Generate events page
  - [ ] Preview generated events

#### Week 3-4: Payments
- [ ] **Backend**
  - [ ] Payment entity & repository
  - [ ] Payment tracking endpoints
    - [ ] `GET /api/v1/events/{id}/payments` - list payments
    - [ ] `POST /api/v1/events/{id}/payments/{userId}` - mark as paid
    - [ ] `GET /api/v1/groups/{id}/payments/report` - financial report
  - [ ] Payment reminder service
  - [ ] Scheduled job for reminders

- [ ] **Mobile**
  - [ ] Payments page (replica of payments-manage.html)
  - [ ] Payment status indicators
  - [ ] Mark as paid (organizer)
  - [ ] Payment method selection
  - [ ] Payment reports

#### Week 5-6: Notifications
- [ ] **Backend**
  - [ ] Notification entity & repository
  - [ ] Firebase Cloud Messaging integration
  - [ ] Email service (Spring Mail)
  - [ ] Notification service (send push/email)
  - [ ] Notification endpoints
    - [ ] `GET /api/v1/notifications` - user's notifications
    - [ ] `PUT /api/v1/notifications/{id}/read` - mark as read
  - [ ] Scheduled notifications
    - [ ] Event reminders (24h, 2h before)
    - [ ] Payment reminders (24h before)

- [ ] **Mobile**
  - [ ] FCM setup (iOS & Android)
  - [ ] Local notifications
  - [ ] Notification center page
  - [ ] Push notification handling
  - [ ] Deep linking from notifications
  - [ ] Notification preferences

#### Week 7-8: Invite System
- [ ] **Backend**
  - [ ] InviteLink entity & repository
  - [ ] MagicAuthToken entity & repository
  - [ ] Invite endpoints
    - [ ] `POST /api/v1/invites/events/{id}` - generate invite
    - [ ] `GET /api/v1/invites/{token}/validate` - validate invite
    - [ ] `POST /api/v1/invites/{token}/join/new` - signup via invite
    - [ ] `POST /api/v1/invites/{token}/join` - join via invite
  - [ ] Magic link endpoints
    - [ ] `POST /api/v1/auth/magic-link/request` - request magic link
    - [ ] `POST /api/v1/auth/magic-link/authenticate/{token}` - authenticate
  - [ ] SMS/Email sending service

- [ ] **Mobile**
  - [ ] Deep linking setup (iOS & Android)
  - [ ] Deep link handler
  - [ ] Invite signup page
  - [ ] Magic link request page
  - [ ] Share functionality
  - [ ] QR code generation/scanning

---

### FAZA 4: Real-time & Polish (4-6 tygodni)

#### Week 1-2: WebSocket & Real-time
- [ ] **Backend**
  - [ ] WebSocket configuration (Spring WebSocket)
  - [ ] STOMP protocol setup
  - [ ] Event channels (`/topic/events/{eventId}`)
  - [ ] Broadcast participant changes
  - [ ] Broadcast payment updates
  - [ ] Connection management

- [ ] **Mobile**
  - [ ] WebSocket client (web_socket_channel)
  - [ ] Real-time event updates
  - [ ] Optimistic UI updates
  - [ ] Connection status indicator

#### Week 3-4: Offline Support
- [ ] **Mobile**
  - [ ] SQLite local database (sqflite)
  - [ ] Cache layer (events, groups, users)
  - [ ] Offline action queue
  - [ ] Sync service
  - [ ] Offline indicators
  - [ ] Conflict resolution

#### Week 5-6: UI/UX Polish & Performance
- [ ] **Backend**
  - [ ] Query optimization
  - [ ] Database indexing
  - [ ] Redis caching strategy
  - [ ] Rate limiting
  - [ ] API documentation (Swagger)

- [ ] **Mobile**
  - [ ] Animations & transitions
  - [ ] Loading states refinement
  - [ ] Error handling improvements
  - [ ] Responsive design tweaks
  - [ ] Accessibility improvements
  - [ ] Performance profiling
  - [ ] Image caching & optimization

---

### FAZA 5: Testing & Deployment (2-4 tygodnie)

#### Week 1-2: Comprehensive Testing
- [ ] **Backend**
  - [ ] Unit tests coverage (>80%)
  - [ ] Integration tests (all endpoints)
  - [ ] Load testing (JMeter/Gatling)
  - [ ] Security testing (OWASP)

- [ ] **Mobile**
  - [ ] Unit tests (BLoCs, Repositories)
  - [ ] Widget tests (all pages)
  - [ ] Integration tests (critical flows)
  - [ ] Manual testing (iOS & Android)

#### Week 3-4: Deployment & Launch
- [ ] **Backend Deployment**
  - [ ] Setup production environment (AWS/DO/Hetzner)
  - [ ] Configure PostgreSQL (managed DB)
  - [ ] Configure Redis (managed cache)
  - [ ] Setup CI/CD pipeline (GitHub Actions)
  - [ ] Domain & SSL configuration
  - [ ] Monitoring setup (Prometheus, Grafana)
  - [ ] Error tracking (Sentry)
  - [ ] Backup strategy

- [ ] **Mobile Deployment**
  - [ ] App Store preparation (screenshots, description)
  - [ ] Google Play preparation
  - [ ] Fastlane setup
  - [ ] TestFlight beta testing (iOS)
  - [ ] Google Play Internal Testing (Android)
  - [ ] Production release

- [ ] **Launch**
  - [ ] Soft launch (limited users)
  - [ ] Monitor metrics
  - [ ] Fix critical bugs
  - [ ] Public launch

---

## 🏗 Architektura

### Backend Architecture (Spring Boot)

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (Future)                  │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  Spring Boot Application                 │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │          REST Controllers Layer                  │   │
│  │  - AuthController                                │   │
│  │  - UserController                                │   │
│  │  - GroupController                               │   │
│  │  - EventController                               │   │
│  │  - ParticipantController                         │   │
│  │  - PaymentController                             │   │
│  │  - NotificationController                        │   │
│  │  - InviteController                              │   │
│  └────────────────┬────────────────────────────────┘   │
│                   │                                       │
│  ┌────────────────▼────────────────────────────────┐   │
│  │          Service Layer (Business Logic)          │   │
│  │  - AuthService                                   │   │
│  │  - UserService                                   │   │
│  │  - GroupService                                  │   │
│  │  - EventService                                  │   │
│  │  - ParticipantService                            │   │
│  │  - WaitlistService (auto-promote logic)         │   │
│  │  - PaymentService                                │   │
│  │  - NotificationService                           │   │
│  │  - InviteLinkService                             │   │
│  └────────────────┬────────────────────────────────┘   │
│                   │                                       │
│  ┌────────────────▼────────────────────────────────┐   │
│  │          Repository Layer (Data Access)          │   │
│  │  - Spring Data JPA Repositories                  │   │
│  └────────────────┬────────────────────────────────┘   │
│                   │                                       │
└───────────────────┼───────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
┌───▼────┐    ┌────▼─────┐   ┌────▼──────┐
│PostgreSQL│   │  Redis   │   │  Firebase │
│  (Main)  │   │ (Cache)  │   │   (FCM)   │
└──────────┘   └──────────┘   └───────────┘

┌────────────────────────────────────────────────┐
│         Background Jobs (Spring @Scheduled)     │
│  - GenerateSeriesEventsJob (daily 3:00 AM)    │
│  - EventReminderJob (hourly)                  │
│  - PaymentReminderJob (daily 9:00 AM)         │
│  - ExpireInviteLinksJob (daily 4:00 AM)       │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│         WebSocket Server (STOMP)               │
│  - /topic/events/{eventId}                    │
│  - /topic/groups/{groupId}                    │
└────────────────────────────────────────────────┘
```

### Mobile Architecture (Flutter - Clean Architecture)

```
┌─────────────────────────────────────────────────┐
│              Presentation Layer                  │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │         Pages (UI Screens)                │  │
│  │  - LoginPage, RegisterPage                │  │
│  │  - EventsListPage, EventDetailsPage       │  │
│  │  - GroupsPage, GroupDetailsPage           │  │
│  │  - ProfilePage, SettingsPage              │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
│  ┌──────────────▼───────────────────────────┐  │
│  │         BLoCs (State Management)          │  │
│  │  - AuthBloc                               │  │
│  │  - EventBloc                              │  │
│  │  - GroupBloc                              │  │
│  │  - ParticipantBloc                        │  │
│  │  - PaymentBloc                            │  │
│  │  - NotificationBloc                       │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│              Domain Layer                        │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │      Use Cases (Business Logic)           │  │
│  │  - LoginUseCase                           │  │
│  │  - GetEventsUseCase                       │  │
│  │  - JoinEventUseCase                       │  │
│  │  - CreateEventUseCase                     │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
│  ┌──────────────▼───────────────────────────┐  │
│  │         Entities (Domain Models)          │  │
│  │  - User, Group, Event, Participant        │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
│  ┌──────────────▼───────────────────────────┐  │
│  │    Repository Interfaces (Contracts)      │  │
│  └──────────────┬───────────────────────────┘  │
└─────────────────┼───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│               Data Layer                         │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │   Repository Implementations              │  │
│  │  - AuthRepositoryImpl                     │  │
│  │  - EventRepositoryImpl                    │  │
│  │  - GroupRepositoryImpl                    │  │
│  └──────────────┬───────────────────────────┘  │
│                 │                                │
│  ┌──────────────▼───────────────────────────┐  │
│  │         Data Sources                      │  │
│  │                                           │  │
│  │  ┌─────────────┐    ┌──────────────┐    │  │
│  │  │   Remote    │    │    Local     │    │  │
│  │  │ (API/Dio)   │    │  (SQLite)    │    │  │
│  │  └─────────────┘    └──────────────┘    │  │
│  └───────────────────────────────────────── ┘  │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│              Core Layer                          │
│  - Network (Dio client, Interceptors)           │
│  - Storage (Secure Storage, Shared Prefs)       │
│  - Utils (Date, Validators, Constants)          │
│  - Errors (Exceptions, Failures)                │
└──────────────────────────────────────────────────┘
```

---

## 🔗 API Endpoints

### Authentication
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email/{token}

# Magic Link
POST   /api/v1/auth/magic-link/request
POST   /api/v1/auth/magic-link/authenticate/{token}
```

### Users
```
GET    /api/v1/users/me
PUT    /api/v1/users/me
DELETE /api/v1/users/me
PUT    /api/v1/users/me/password
POST   /api/v1/users/me/avatar
GET    /api/v1/users/me/statistics
```

### Groups
```
GET    /api/v1/groups
POST   /api/v1/groups
GET    /api/v1/groups/{id}
PUT    /api/v1/groups/{id}
DELETE /api/v1/groups/{id}

# Members
GET    /api/v1/groups/{id}/members
POST   /api/v1/groups/{id}/members
PUT    /api/v1/groups/{id}/members/{userId}
DELETE /api/v1/groups/{id}/members/{userId}

# Statistics
GET    /api/v1/groups/{id}/statistics
```

### Series
```
GET    /api/v1/series?groupId={id}
POST   /api/v1/series
GET    /api/v1/series/{id}
PUT    /api/v1/series/{id}
DELETE /api/v1/series/{id}

# Generate events
POST   /api/v1/series/{id}/generate
GET    /api/v1/series/{id}/preview?weeks={n}
```

### Events
```
GET    /api/v1/events?groupId={id}&from={date}&to={date}&status={status}
POST   /api/v1/events
GET    /api/v1/events/{id}
PUT    /api/v1/events/{id}
DELETE /api/v1/events/{id}
PUT    /api/v1/events/{id}/cancel

# My events
GET    /api/v1/events/my/upcoming
GET    /api/v1/events/my/past
```

### Participants
```
# Join/Leave
POST   /api/v1/events/{id}/join
DELETE /api/v1/events/{id}/leave

# List & Manage
GET    /api/v1/events/{id}/participants
POST   /api/v1/events/{id}/participants (add by organizer)
DELETE /api/v1/events/{id}/participants/{userId}
PUT    /api/v1/events/{id}/participants/reorder
PUT    /api/v1/events/{id}/participants/{userId}/confirm
PUT    /api/v1/events/{id}/participants/{userId}/status

# Waitlist
GET    /api/v1/events/{id}/waitlist
POST   /api/v1/events/{id}/waitlist/{userId}/promote
DELETE /api/v1/events/{id}/waitlist/{userId}
```

### Payments
```
GET    /api/v1/events/{id}/payments
POST   /api/v1/events/{id}/payments/{userId}
PUT    /api/v1/events/{id}/payments/{userId}
DELETE /api/v1/events/{id}/payments/{userId}

# Reminders
POST   /api/v1/events/{id}/payments/remind
POST   /api/v1/events/{id}/payments/remind/{userId}

# Reports
GET    /api/v1/groups/{id}/payments/report?from={date}&to={date}
GET    /api/v1/events/{id}/payments/summary
```

### Notifications
```
GET    /api/v1/notifications?limit={n}&offset={m}
GET    /api/v1/notifications/{id}
PUT    /api/v1/notifications/{id}/read
PUT    /api/v1/notifications/read-all
DELETE /api/v1/notifications/{id}

# Preferences
GET    /api/v1/notifications/preferences
PUT    /api/v1/notifications/preferences
```

### Invites
```
# Generate
POST   /api/v1/invites/groups/{id}
POST   /api/v1/invites/events/{id}
POST   /api/v1/invites/series/{id}

# Validate & Join
GET    /api/v1/invites/{token}/validate
POST   /api/v1/invites/{token}/join/new (new user signup)
POST   /api/v1/invites/{token}/join (existing user)

# Manage
GET    /api/v1/invites?groupId={id}&eventId={id}
DELETE /api/v1/invites/{id}
PUT    /api/v1/invites/{id}/deactivate
```

### WebSocket
```
CONNECT /ws

SUBSCRIBE /topic/events/{eventId}
SUBSCRIBE /topic/groups/{groupId}
SUBSCRIBE /user/queue/notifications

SEND /app/events/{eventId}/join
SEND /app/events/{eventId}/leave
```

---

## 📝 Notatki implementacyjne

### Priorytet Faz
1. **Faza 1 (MVP Backend)** - MUST HAVE
2. **Faza 2 (MVP Mobile)** - MUST HAVE
3. **Faza 3 (Advanced Features)** - SHOULD HAVE
4. **Faza 4 (Real-time & Polish)** - NICE TO HAVE
5. **Faza 5 (Testing & Deployment)** - MUST HAVE

### Kluczowe decyzje techniczne
- **Database**: PostgreSQL (relacyjna struktura, ACID)
- **Cache**: Redis (sessions, rate limiting, temporary data)
- **State Management**: BLoC pattern (testability, separation of concerns)
- **Auth**: JWT (stateless, scalable)
- **Notifications**: FCM (cross-platform, reliable)

### Ryzyka i mitygacja
1. **Concurrent updates** (race conditions na liście uczestników)
   - Mitygacja: Optimistic locking, WebSocket updates

2. **Payment tracking** (manual, error-prone)
   - Mitygacja: Jasny UI, confirmation dialogs, audit log

3. **Offline sync conflicts**
   - Mitygacja: Last-write-wins + manual conflict resolution UI

4. **Deep linking issues** (różne wersje iOS/Android)
   - Mitygacja: Fallback na custom scheme, testowanie na wielu urządzeniach

---

## ✅ Definition of Done

Dla każdego feature:
- [ ] Code written & peer-reviewed
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests (critical paths)
- [ ] API documentation updated (Swagger)
- [ ] Manual testing completed
- [ ] No critical bugs
- [ ] Performance acceptable (<500ms p95)
- [ ] Security review passed
- [ ] Merged to main branch

---

**Dokument zaktualizowany:** 2025-10-26
**Wersja:** 1.0
