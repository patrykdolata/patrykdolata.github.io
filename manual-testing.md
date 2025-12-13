# CHECKLISTA TESTOWANIA MANUALNEGO - MEET APP

## 🔵 FLOW ZAAWANSOWANE

### Setup początkowy
- [ ] User zalogowany jako organizer
- [ ] Minimum 10 innych userów w systemie do testowania

---

### 1. Tworzenie grupy

- [ ] Utwórz grupę "Volleyball Masters"
  - Nazwa: 3-255 znaków ✅
  - Sport: VOLLEYBALL
  - Prywatna: TAK
  - Wymaga zatwierdzenia: TAK
  - Max członków: 20
  - **Rezultat:** Grupa utworzona, organizer automatycznie dodany

- [ ] Próba utworzenia grupy z nazwą < 3 znaki
  - **Rezultat:** ERROR "Name must be 3-255 characters"

- [ ] Próba utworzenia grupy z nazwą > 255 znaków
  - **Rezultat:** ERROR blokada formularza

---

### 2. Dodawanie członków do grupy

- [ ] 5 userów wysyła join request
  - **Rezultat:** Status PENDING, notification do organizera

- [ ] Organizer zatwierdza 4 userów
  - **Rezultat:** Status APPROVED, notification do zatwierdzonych

- [ ] Organizer odrzuca 1 usera
  - **Rezultat:** Status REJECTED, notification wysłane

- [ ] Organizer dodaje członka bezpośrednio (bypass join flow)
  - **Rezultat:** Member dodany, status APPROVED automatycznie

- [ ] Próba dołączenia już będącego członkiem
  - **Rezultat:** ERROR "Already a member"

---

### 3. Wyznaczanie core players

- [ ] Organizer wyznacza 10 członków jako core players
  - Akcja: PATCH `/groups/{id}/members/{memberId}/core-player`
  - **Rezultat:** Flaga `isCorePlayer=true`, notification wysłane
---

### 4. Tworzenie player list

- [ ] Utwórz listę "Thursday Team"
  - Nazwa: unikalna w grupie
  - Opis: opcjonalny
  - **Rezultat:** Lista utworzona

- [ ] Dodaj 8 członków do listy (z core players)
  - **Rezultat:** 8 członków dodanych, kolejność zachowana

- [ ] Próba utworzenia listy z duplikatem nazwy
  - **Rezultat:** ERROR "Name already exists"

- [ ] Zmień nazwę listy na istniejącą
  - **Rezultat:** ERROR "Name already exists"

- [ ] Usuń 2 członków z listy
  - **Rezultat:** Pozycje przenumerowane (gap fill)

- [ ] Usuń członka z grupy który jest w player list
  - **Rezultat:** ⚠️ SPRAWDŹ CO SIĘ STANIE (niespójność - brak docs)

---

### 5. Tworzenie szablonu wydarzeń (Series)

- [ ] Utwórz series "Weekly Volleyball"
  - Tytuł: "Weekly Volleyball" (3-255)
  - Grupa: "Volleyball Masters"
  - Częstotliwość: WEEKLY
  - Dzień tygodnia: Środa
  - Godzina: 18:00
  - Czas trwania: 120 minut
  - Slots: 12
  - Level: 3
  - Player List: "Thursday Team" (8 członków)
  - **Rezultat:** Series utworzona, walidacja: capacity >= player list size

- [ ] Próba przypisania player list > slots
  - Player list: 15 osób, Slots: 10
  - **Rezultat:** ERROR "Player list exceeds capacity"

---

### 6. Generowanie wydarzeń z szablonu

- [ ] Wygeneruj 10 wydarzeń z series
  - Request: `POST /series/{id}/generate`
  - Body: `{ "startDate": "2025-01-15", "numberOfEvents": 10 }`
  - **Rezultat:** 10 wydarzeń utworzonych, daty: środy (15, 22, 29 stycznia...)

- [ ] Sprawdź auto-add uczestników
  - Otwórz każde wygenerowane wydarzenie
  - **Rezultat:** 8 członków z "Thursday Team" dodanych jako MAIN_LIST w każdym

- [ ] Sprawdź notifications
  - **Rezultat:** Każdy z 8 członków dostał notification EVENT_CREATED (8 * 10 = 80 notifications)

- [ ] Próba wygenerowania 21 wydarzeń
  - **Rezultat:** ERROR "Max 20 events per generation"

- [ ] Edytuj szablon series (zmień godzinę 18:00 → 19:00)
  - **Rezultat:** Szablon zmieniony, istniejące wydarzenia BEZ ZMIAN

- [ ] Usuń szablon series (DELETE)
  - **Rezultat:** Szablon usunięty, wygenerowane wydarzenia POZOSTAJĄ

---

### 7. Zarządzanie wygenerowanymi wydarzeniami

- [ ] Edytuj pojedyncze wydarzenie z serii
  - Zmień slots z 12 → 15
  - **Rezultat:** Tylko to wydarzenie zmienione, inne bez zmian

- [ ] Anuluj jedno wydarzenie
  - **Rezultat:** Status CANCELLED, uczestnicy pozostają, notification EVENT_CANCELLED wysłane

- [ ] Usuń jedno wydarzenie
  - **Rezultat:** ⚠️ Jeśli są uczestnicy → ERROR "Cannot delete event with participants"
  - **Rezultat:** ✅ Jeśli brak uczestników → usunięte

---

## 🟢 FLOW PODSTAWOWE

### Setup
- [ ] User zalogowany
- [ ] Dostęp do lokalizacji GPS

---

### 1. Tworzenie pojedynczego wydarzenia

- [ ] Utwórz wydarzenie "Friendly Match"
  - Tytuł: "Friendly Match"
  - Sport: FOOTBALL
  - Lokalizacja: wybrana z mapy
  - Data: dziś + 2 godziny (> 30 min)
  - Czas trwania: 90 minut
  - Slots: 10
  - Level: 2
  - Cena: 20 PLN
  - Publiczne: TAK
  - Auto-promote: TAK
  - **Rezultat:** Wydarzenie utworzone, widoczne na mapie

- [ ] Walidacja: event start < 30 minut od teraz
  - **Rezultat:** ERROR "Event must start at least 30 minutes from now"

- [ ] Walidacja: title < 3 znaki
  - **Rezultat:** ERROR formularza

- [ ] Walidacja: slots < 2 lub > 50
  - **Rezultat:** ERROR formularza

- [ ] Walidacja: duration < 30 min lub > 480 min
  - **Rezultat:** ERROR formularza

- [ ] Walidacja: level < 0 lub > 5
  - **Rezultat:** ERROR formularza

---

### 2. Udostępnianie wydarzenia

#### A. Deep Link Generation

- [ ] Kliknij "Share Event"
  - **Rezultat:** System share dialog z linkiem `https://meetapp.pl/event/{eventId}`

- [ ] Kliknij "Copy Link"
  - **Rezultat:** Link skopiowany do schowka, snackbar confirmation

#### B. Otwieranie przez Deep Link (zalogowany user)

- [ ] Otwórz link `meetapp://event/{eventId}` (custom scheme)
  - **Rezultat:** App otwiera EventDetailsFromDeepLink, dane załadowane

- [ ] Otwórz link `https://meetapp.pl/event/{eventId}` (HTTPS)
  - **Rezultat:** App otwiera event details

#### C. Otwieranie przez Deep Link (niezalogowany - public event)

- [ ] Logout z aplikacji
- [ ] Otwórz deep link do public event
  - **Rezultat:** Event details wyświetlone (liczby zamiast imion)

#### D. Otwieranie przez Deep Link (niezalogowany - private event)

- [ ] Otwórz deep link do private grupy event
  - **Rezultat:** Prompt "Login required for private event" + redirect do /login

- [ ] Zaloguj się
  - **Rezultat:** Auto-redirect do event details

#### E. Invalid Deep Link

- [ ] Otwórz link do nieistniejącego wydarzenia
  - **Rezultat:** "Event not found" error screen

- [ ] Otwórz link do CANCELLED wydarzenia
  - **Rezultat:** Event details wyświetlone ze statusem CANCELLED

---

### 3. Zapraszanie i akceptacja gości przez web

⚠️ **NIESPÓJNOŚĆ:** Funkcjonalność istnieje w backendzie, brak dokumentacji

- [ ] User (nie ma aplikacji) otwiera web link do wydarzenia
  - **Rezultat:** Formularz rejestracji gościa

- [ ] Wypełnij formularz:
  - Email: `guest@example.com`
  - Imię: Jan
  - Nazwisko: Kowalski
  - Telefon: +48123456789
  - **Rezultat:** Gość zarejestrowany, placeholder UserEntity utworzony

- [ ] Sprawdź backend: `GET /events/{id}/participants`
  - **Rezultat:** Gość widoczny ze statusem `PENDING_APPROVAL`

- [ ] Organizer: approve guest
  - Akcja: `PUT /events/{id}/participants/{userId}/approve-guest`
  - **Rezultat:** Status zmieniony, notification do gościa (jeśli FCM token)

- [ ] Organizer: reject guest
  - Akcja: `DELETE /events/{id}/participants/{userId}/reject-guest`
  - **Rezultat:** Participant usunięty, notification (?)

---

### 4. Organizowanie listy graczy (Join/Leave flow)

#### A. Dołączanie do wydarzenia

- [ ] User1: dołącz do wydarzenia (3/10 slots)
  - **Rezultat:** Status MAIN_LIST, position 4, slotsAvailable = 6

- [ ] User2-7: dołączają (6 osób)
  - **Rezultat:** Wszyscy MAIN_LIST, slotsAvailable = 0

- [ ] User8: dołącza (0 slots)
  - **Rezultat:** Status WAITLIST, position 1

- [ ] User9: dołącza
  - **Rezultat:** Status WAITLIST, position 2

- [ ] Sprawdź `/events/{id}/participants/complete`
  - **Rezultat:** mainList: 10 osób, waitlist: 2 osoby

#### B. Opuszczanie wydarzenia (auto-promote)

- [ ] User3 (MAIN_LIST, position 3) opuszcza wydarzenie
  - Event ma `autoPromoteFromWaitlist = true`
  - **Rezultat:**
    - User3 usunięty
    - User8 (pierwszy z waitlist) promowany do MAIN_LIST
    - Notification WAITLIST_PROMOTION wysłane do User8
    - Pozycje MAIN_LIST przenumerowane (gap fill)
    - slotsAvailable = 0 (bo promowano)

- [ ] Sprawdź notification User8
  - **Rezultat:** Type: WAITLIST_PROMOTION, eventId, newStatus: MAIN_LIST

#### C. Opuszczanie wydarzenia (BEZ auto-promote)

- [ ] Zmień event: `autoPromoteFromWaitlist = false`
- [ ] User4 opuszcza
  - **Rezultat:**
    - User4 usunięty
    - Waitlist BEZ ZMIAN
    - slotsAvailable++ = 1

#### D. Edge case: concurrent join na ostatni slot

- [ ] Setup: event ma 1 wolny slot
- [ ] User10 i User11 klikają "Join" jednocześnie (w ciągu 100ms)
  - **Rezultat:** ⚠️ SPRAWDŹ:
    - Tylko jeden dostaje MAIN_LIST (pessimistic locking)
    - Drugi dostaje WAITLIST

---

### 5. Zarządzanie uczestnikami przez organizatora

#### A. Dodawanie uczestników

- [ ] Organizer: dodaj uczestnika manualnie
  - Wybierz usera z dropdown (jeśli grupa) lub wpisz login
  - Notatki: opcjonalne
  - **Rezultat:** Participant dodany, notification PARTICIPANT_ADDED

#### B. Usuwanie uczestników

- [ ] Organizer: usuń uczestnika
  - Confirmation dialog
  - **Rezultat:** Usunięty, notification PARTICIPANT_REMOVED, pozycje przenumerowane

#### C. Bulk actions

- [ ] Organizer: selection mode ON
- [ ] Zaznacz 5 uczestników
- [ ] Bulk remove
  - **Rezultat:** 5 usuniętych, notifications wysłane, auto-promote z waitlist

---

### 6. Confirmation i Payment tracking

#### A. Self-service confirmation

- [ ] User (uczestnik): kliknij "Confirm attendance"
  - **Rezultat:** `isConfirmed = true`, `confirmedAt = now`

#### B. Organizer toggle confirmation

- [ ] Organizer: toggle confirmation checkbox dla User5
  - **Rezultat:** Flaga zmieniona (true → false lub false → true)

- [ ] Organizer: bulk confirm 10 uczestników
  - **Rezultat:** Wszystkie flagi ustawione na true

#### C. Payment tracking

- [ ] Organizer: mark User6 as paid
  - **Rezultat:** `isPaid = true`, `paymentTime = now`, notification PAYMENT_CONFIRMED

- [ ] Organizer: revoke payment
  - **Rezultat:** `isPaid = false`, `paymentTime = null`, notification PAYMENT_REVOKED

---

### 7. Powiadomienia o zmianach

#### A. WebSocket connection

- [ ] Login → sprawdź WebSocket
  - **Rezultat:** STOMP handshake success, subscribed do `/user/queue/notifications`

- [ ] Heartbeat check (30 sekund)
  - **Rezultat:** Connection alive, no reconnect

- [ ] Symuluj disconnect (wyłącz WiFi)
  - **Rezultat:** ConnectionStatus = offline

- [ ] Przywróć WiFi
  - **Rezultat:** Auto-reconnect, backoff delay 2s

#### B. Event notifications

- [ ] Organizer edytuje wydarzenie (zmienia czas)
  - **Rezultat:** Wszyscy uczestnicy dostają EVENT_UPDATE, changed_fields: ["startDateTime"]

- [ ] Organizer anuluje wydarzenie
  - **Rezultat:**
    - Wszyscy dostają EVENT_CANCELLED (push notification!)
    - Status event: CANCELLED
    - Participants pozostają w systemie

- [ ] Nowe wydarzenie utworzone
  - **Rezultat:** Broadcast EVENT_CREATED do wszystkich (mapa się odświeża)

#### C. Participant notifications

- [ ] User dodany przez organizatora
  - **Rezultat:** PARTICIPANT_ADDED notification (WebSocket only, bez push)

- [ ] User usunięty
  - **Rezultat:** PARTICIPANT_REMOVED notification (push!)

- [ ] Promotion z waitlist
  - **Rezultat:** WAITLIST_PROMOTION notification (push!)

---

### 8. Przypomnienia o terminach

⚠️ **CZĘŚCIOWO ZAIMPLEMENTOWANE** - frontend nie ma mappingu

#### A. Event starting soon (1h przed)

- [ ] Utwórz wydarzenie za 65 minut
- [ ] Czekaj ~6 minut (cron co 5 min)
- [ ] **Rezultat:** ⚠️ SPRAWDŹ:
  - Confirmed participants dostają EVENT_STARTING_SOON
  - Typ notification istnieje w backendzie
  - ❌ Frontend nie ma mappingu (może nie wyświetlić)

#### B. RSVP deadline approaching (24h przed)

- [ ] Utwórz wydarzenie z RSVP deadline = dziś + 25h
- [ ] Dodaj uczestnika z `isConfirmed = false`
- [ ] Czekaj ~1h (cron co godzinę)
- [ ] **Rezultat:** ⚠️ SPRAWDŹ:
  - Niepotwierdzeni dostają RSVP_DEADLINE_APPROACHING
  - ❌ Frontend nie ma mappingu

#### C. Payment deadline approaching (24h przed)

- [ ] Event z payment deadline = dziś + 25h
- [ ] Uczestnik z `isPaid = false`
- [ ] **Rezultat:** ⚠️ SPRAWDŹ:
  - PAYMENT_DEADLINE_APPROACHING wysłane
  - ❌ Frontend nie ma mappingu

---

### 9. Blokady czasowe (2h przed wydarzeniem)

⚠️ **NIE ZAIMPLEMENTOWANE** - oczekiwane według user story, ale brak w kodzie

- [ ] Utwórz wydarzenie za 3 godziny
- [ ] Dodaj uczestnika
- [ ] Czekaj do T-1h 59min
- [ ] **Rezultat:** ⚠️ SPRAWDŹ:
  - ❌ Edycja wydarzenia powinna być zablokowana (NIE DZIAŁA)
  - ❌ Dołączanie nowych uczestników powinno być zablokowane (NIE DZIAŁA)
  - ❌ Auto-usuwanie niepotwierdzonych (NIE DZIAŁA)

- [ ] Próba edycji 1h przed startem
  - **Rezultat:** ❌ DZIAŁA (powinno być blokowane!)

- [ ] Próba join 1h przed startem
  - **Rezultat:** ❌ DZIAŁA (powinno być blokowane!)

---

### 10. Usuwanie niepotwierdzonych 24h przed wydarzeniem

⚠️ **NIE ZAIMPLEMENTOWANE** - oczekiwane według user story

- [ ] Event za 25 godzin
- [ ] 5 uczestników niepotwierdzonych (`isConfirmed = false`)
- [ ] Czekaj do T-23h
- [ ] **Rezultat:** ⚠️ SPRAWDŹ:
  - ❌ Niepotwierdzeni powinni być usunięci (NIE DZIAŁA)
  - ❌ Brak scheduled task w backendzie

---

### 11. Auto-complete po zakończeniu

- [ ] Utwórz wydarzenie które kończy się za 5 minut (duration: 5 min)
- [ ] Czekaj do zakończenia + 1h (cron co godzinę)
- [ ] **Rezultat:**
  - Status zmieniony na COMPLETED
  - Event widoczny w historii
  - Brak możliwości edycji/join

---

## 🟣 EDGE CASES I SCENARIUSZE KRYTYCZNE

### Walidacje i bezpieczeństwo

- [ ] XSS w description: `<script>alert('xss')</script>`
  - **Rezultat:** Sanitized, nie wykonuje się

- [ ] SQL injection w search: `'; DROP TABLE events; --`
  - **Rezultat:** Parametryzacja, bezpieczne

- [ ] Emoji w tytule: "Volleyball 🏐 Match"
  - **Rezultat:** Akceptowane, wyświetlane poprawnie

- [ ] Bardzo długi opis (2001 znaków)
  - **Rezultat:** ERROR "Max 2000 characters"

---

### Concurrent operations

- [ ] Organizer edit + user join jednocześnie
  - **Rezultat:** Pessimistic locking, jedna operacja czeka

- [ ] Double-click "Join" (kliknięcie w <100ms)
  - **Rezultat:** Tylko jeden participant record

- [ ] 2 organizers approve tego samego pending member jednocześnie
  - **Rezultat:** Tylko jedno approval, drugi dostaje error

---

### Strefy czasowe i DST

- [ ] Zmień timezone urządzenia (UTC+1 → UTC-5)
- [ ] Sprawdź wyświetlanie wydarzenia
  - **Rezultat:** Godzina przekonwertowana poprawnie

- [ ] Utwórz wydarzenie podczas DST transition (marzec/październik)
  - **Rezultat:** ⚠️ SPRAWDŹ potencjalne przesunięcie ±1h

---

### Paginacja i infinite scroll

- [ ] Events list: scroll do końca
  - **Rezultat:** loadMore() triggeruje, page++, no duplicates

- [ ] Historia: filtr ORGANIZER
  - **Rezultat:** Tylko moje wydarzenia jako organizer

- [ ] Groups list: `/groups/my`
  - **Rezultat:** ⚠️ NIESPÓJNOŚĆ - brak paginacji, cała lista naraz (może być wolne)

---

### Cleanup i cascade delete

- [ ] Usuń grupę z wydarzeniami
  - **Rezultat:** ⚠️ SPRAWDŹ:
    - Czy wydarzenia są usuwane?
    - Czy ustawiane na NULL group_id?

- [ ] Usuń player list używaną w series
  - **Rezultat:** ⚠️ SPRAWDŹ:
    - Series bez player list?
    - ERROR?

- [ ] Usuń lokalizację używaną w wydarzeniach
  - **Rezultat:** ⚠️ SPRAWDŹ behavior

---

### Offline i connectivity

- [ ] Wyłącz internet podczas ładowania wydarzeń
  - **Rezultat:** Error screen "No connection", retry button

- [ ] Kliknij retry
  - **Rezultat:** Reload z sukcesem

- [ ] WebSocket disconnect podczas offline
  - **Rezultat:** Status: offline, auto-reconnect po przywróceniu sieci

---

### Notifications deduplication

- [ ] Triggeruj to samo powiadomienie 2x (np. manual + scheduled task)
  - **Rezultat:** ⚠️ SPRAWDŹ czy są duplikaty (brak deduplication w kodzie)

---

