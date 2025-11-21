# Meet App - TODO Lista (Organizer-Focused MVP)

> Projekt: Aplikacja do planowania wydarzeń siatkówki
> Stack: Spring Boot (Backend) + Flutter (Mobile) + PostgreSQL
> Solo developer: Wszystko robione samodzielnie
> Start: 2025-11-13
> Cel: Działający MVP dla ORGANIZATORA do końca 2025 roku

---

## 🎯 PROJECT STATUS

- Current Phase: MILESTONE 1 - Organizer MVP (ZAKTUALIZOWANY)
- Target: 2025-12-31 (7-8 tygodni)
- Weekly hours: 15h
- Overall progress: 52% (+14% this week!)
- Last updated: 2025-11-20

### ✅ What's Working:
- Sprint 0: Auth & JWT (95% done) ✅
- Feature 0: Mapa z markerami (80% done) ✅
- Feature 5.5: Ulubione lokalizacje (90% done) ✅
- Feature 1: Basic Events CRUD (100% done) ✅ CREATE/EDIT/DELETE/CANCEL works!
- Feature 3: Manual Participants Management (100% done) ✅ ADD/REMOVE works!
- Feature S2: Waitlist (90% done) 🟡 Backend+mobile prawie gotowe

### 🔴 Current Focus (Next 2 weeks):
- ⭐ Feature S1: Self-Service Join/Leave (~80% done; QA + polish)
- ⭐ Feature S2: Complete Waitlist FIFO (1h remaining) 👈 ~90% done
- ⭐ Feature S3: Auto-Promocja z waitlisty (2h remaining) 👈 backend done, UI pending
- Feature 4: Cykliczne wydarzenia (25h)
- Feature 6: Bottom navigation (15h)

---

## 📋 MILESTONE 1 (ZMODYFIKOWANY): Organizer MVP + Minimum Self-Service 🔴 [DO KOŃCA 2025]

Deadline: 2025-12-31 (7-8 tygodni)
Focus: Organizator tworzy, zarządza i automatycznie uzupełnia skład (podstawowo)
Total: ~140h (było ~115h + 25h na self-service)

### Co Musi Działać (Definicja Sukcesu):
- [x] Nowy użytkownik może się zarejestrować i zalogować ✅
- [x] Użytkownik widzi wszystkie wydarzenia na mapie miasta ✅
- [x] Organizator może utworzyć nowe wydarzenie ✅
- [x] Organizator może dodać uczestników do wydarzenia (ręcznie) ✅
- [x] Organizator może usunąć uczestnika z wydarzenia ✅
- [ ] ⭐ Uczestnik może samodzielnie zapisać się na wydarzenie
- [ ] ⭐ Uczestnik może samodzielnie zrezygnować z wydarzenia
- [ ] ⭐ System automatycznie tworzy listę rezerwową gdy brakuje miejsc [50% gotowe]
- [ ] ⭐ System automatycznie awansuje osoby z listy rezerwowej gdy ktoś rezygnuje
- [ ] Organizator może utworzyć serię regularnych treningów (np. co wtorek przez 10 tygodni)
- [x] Organizator widzi listę swoich wydarzeń ✅
- [ ] Aplikacja działa online (dostępna przez internet)

POWÓD ZMIANY: Organizator nie będzie ręcznie dodawał wszystkich graczy – MVP musi pozwalać im dołączać samodzielnie.

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

Sprint 0 Status: ✅ DONE

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

Feature 0 Status: ✅ 80% DONE

---

## Feature 1: Podstawowe operacje na Wydarzeniach ✅ [100% DONE]

Priorytet: CRITICAL - organizator musi móc tworzyć wydarzenia
Deadline: Tydzień 1-2 (do 2025-11-27) ✅ COMPLETED
Scope M1: Basic CRUD (POST/GET/PUT/DELETE) + minimal cancel ✅
Out of Scope M1: SportType enum, zaawansowane filtry (minLevel, sportType, search) - to Post-MVP

### Backend - System Zarządzania Wydarzeniami [15h] ✅

#### Ukończone funkcjonalności:
- [x] System zwraca listę wszystkich wydarzeń ✅
- [x] System zwraca szczegóły pojedynczego wydarzenia ✅
- [x] Organizator może tworzyć nowe wydarzenie ✅
- [x] Organizator może edytować swoje wydarzenie ✅
- [x] Organizator może usunąć swoje wydarzenie ✅
- [x] System waliduje poprawność danych wydarzenia (daty, liczba miejsc, poziom) ✅
- [x] Organizator widzi tylko swoje wydarzenia ✅
- [x] System sortuje wydarzenia według daty rozpoczęcia ✅
- [x] Organizator może odwołać wydarzenie (status CANCELLED) ✅
- [x] Użytkownicy widzą badge "Odwołane" przy odwołanych wydarzeniach ✅
- [x] System zabezpiecza przed konfliktami podczas równoczesnej edycji (optimistic locking) ✅

### Mobile - Interfejs Zarządzania Wydarzeniami [15h] ✅

#### Ukończone funkcjonalności:
- [x] Organizator widzi pełne szczegóły wydarzenia ✅
- [x] Organizator może utworzyć nowe wydarzenie przez formularz ✅
  - [x] Wypełnienie nazwy, opisu, daty i godziny
  - [x] Wybór lokalizacji na mapie
  - [x] Ustawienie liczby miejsc, ceny, poziomu trudności
  - [x] Walidacja wprowadzonych danych

- [x] Organizator może edytować istniejące wydarzenie ✅
  - [x] Formularz wypełnia się aktualnymi danymi
  - [x] Zapisanie zmian

- [x] Organizator może usunąć wydarzenie ✅
  - [x] Potwierdzenie usunięcia przez dialog
  - [x] Odświeżenie listy po usunięciu

✅ Kamień Milowy M1: Organizator ma pełną kontrolę nad swoimi wydarzeniami (tworzenie, edycja, usuwanie)

Out of Scope M1 (Post-MVP w FEATURE_01.md):
- SportType enum (12 typów sportów)
- Zaawansowane filtry (sportType, minLevel, maxLevel, search, availableOnly)
- Group linking (to FEATURE_03.5)
- Visibility days, auto-promote toggles
- Cancel with notifications (pełna wersja to FEATURE_07)

---

## Feature 3: Zarządzanie Uczestnikami - MANUAL ✅ [100% DONE]

Priorytet: CRITICAL - organizator musi móc zarządzać listą
Deadline: Tydzień 3-4 (do 2025-12-11) ✅ COMPLETED
Scope: Organizator RĘCZNIE dodaje/usuwa uczestników ✅

UWAGA: W tym MVP BEZ self-service (uczestnik NIE może sam dołączyć)

### Backend - System Zarządzania Uczestnikami [15h] ✅

#### Ukończone funkcjonalności:
- [x] System przechowuje listę uczestników wydarzenia ✅
  - [x] Informacje: uczestnik, pozycja na liście, data dołączenia, kto dodał
  - [x] Każdy użytkownik może być uczestnikiem tylko raz na wydarzeniu
  - [x] Baza danych przygotowana (migracja V1_6)

- [x] Organizator może dodać uczestnika do wydarzenia ✅
  - [x] Dodawanie po ID użytkownika lub emailu
  - [x] Tylko organizator może dodawać uczestników
  - [x] Automatyczne przypisanie pozycji na liście

- [x] Organizator może usunąć uczestnika z wydarzenia ✅
  - [x] Tylko organizator może usuwać uczestników
  - [x] Automatyczne przenumerowanie pozycji pozostałych uczestników

- [x] System zwraca listę uczestników wydarzenia ✅
  - [x] Posortowana według pozycji
  - [x] Podział na główną listę i listę rezerwową
  - [x] Informacje o użytkowniku i jego pozycji

### Mobile - Interfejs Zarządzania Uczestnikami [15h] ✅

#### Ukończone funkcjonalności:
- [x] Organizator widzi ekran zarządzania uczestnikami ✅
  - [x] Lista wszystkich uczestników z avatarami
  - [x] Pozycja każdego uczestnika na liście
  - [x] Dostęp tylko dla organizatora wydarzenia

- [x] Organizator może dodać uczestnika ✅
  - [x] Przycisk "Dodaj uczestnika"
  - [x] Dialog wyszukiwania użytkownika po nicku/emailu
  - [x] Potwierdzenie dodania

- [x] Organizator może usunąć uczestnika ✅
  - [x] Przycisk "Usuń" przy każdym uczestniku
  - [x] Dialog potwierdzenia usunięcia
  - [x] Automatyczne odświeżenie listy

- [x] Aplikacja synchronizuje zmiany z serwerem ✅
  - [x] Pobieranie aktualnej listy uczestników
  - [x] Zapisywanie zmian w czasie rzeczywistym

✅ Kamień Milowy M3: Organizator ma pełną kontrolę nad listą uczestników (ręczne zarządzanie)

Na Q1 2026:
- Płatności (isPaid, paymentMethod)
- Drag&drop reordering
- Advanced waitlist (manual promote/demote)

---

## 🆕 Feature S1: Samodzielne Zapisywanie się na Wydarzenie 🟡 [80% DONE → 2h remaining]

Priorytet: KRYTYCZNY - uczestnicy muszą móc zapisywać się samodzielnie
Deadline: Tydzień 4 (do 2025-12-04)
Zakres: Uczestnik może samodzielnie dołączyć do wydarzenia lub z niego zrezygnować

### Backend - Samodzielne Zapisywanie [6h]

- [x] Uczestnik może zapisać się na wydarzenie [2h]
  - [x] System sprawdza czy wydarzenie jest dostępne
  - [x] System sprawdza czy są wolne miejsca (pessimistic lock + slotsAvailable)
  - [x] Tylko zalogowani użytkownicy mogą się zapisać

- [x] Uczestnik może zrezygnować z uczestnictwa [2h]
  - [x] System sprawdza czy użytkownik jest uczestnikiem
  - [x] Usunięcie z listy uczestników

- [x] System dodaje uczestnika na koniec listy [1h]
  - [x] Automatyczne przypisanie pozycji
  - [x] Sprawdzenie limitu miejsc

- [x] System aktualizuje listę po rezygnacji [1h]
  - [x] Usunięcie uczestnika
  - [x] Przenumerowanie pozostałych uczestników (promocja z waitlisty jeśli włączona)

### Mobile - Przyciski Zapisz/Zrezygnuj [4h]

- [x] Przycisk "Zapisz się" na szczegółach wydarzenia [2h]
  - [x] Widoczny tylko jeśli użytkownik nie jest zapisany
  - [x] Komunikat potwierdzenia po zapisaniu (listy główna/waitlist z pozycją)
  - [x] Obsługa pełnego wydarzenia: zapis na listę rezerwową, bez ukrywania przycisku

- [x] Przycisk "Zrezygnuj" na szczegółach wydarzenia [1h]
  - [x] Widoczny tylko jeśli użytkownik jest zapisany
  - [x] Dialog potwierdzenia rezygnacji

- [x] Automatyczne odświeżanie po zapisie/rezygnacji [1h]
  - [x] Aktualizacja szczegółów wydarzenia
  - [x] Aktualizacja liczby wolnych miejsc/listy rezerwowej

✅ Kamień Milowy S1: Użytkownicy mogą samodzielnie zarządzać swoim udziałem w wydarzeniu

---

## 🆕 Feature S2: Lista Rezerwowa dla Pełnych Wydarzeń 🟡 [90% DONE → 1h remaining]

Priorytet: KRYTYCZNY - zarządzanie sytuacją gdy brakuje miejsc
Deadline: Tydzień 5 (do 2025-12-11)
Zakres: Automatyczna lista rezerwowa - kolejka FIFO (kto pierwszy, ten pierwszy)

### Backend - System Listy Rezerwowej [6h] - 60% GOTOWE ✅

- [x] System rozróżnia główną listę od listy rezerwowej [1h] ✅
  - [x] Status uczestnika: główna lista lub lista rezerwowa
  - [x] Baza danych zaktualizowana (migracja V1_6)

- [x] System automatycznie przypisuje uczestników do odpowiedniej listy [2h]
  - [x] Sprawdzenie liczby wolnych miejsc
  - [x] Dodanie na główną listę jeśli są miejsca
  - [x] Dodanie na listę rezerwową jeśli brak miejsc

- [x] System zwraca oddzielnie główną listę i listę rezerwową [1h] ✅
  - [x] Główna lista posortowana według pozycji
  - [x] Lista rezerwowa posortowana według kolejności dołączenia

- [x] Wydarzenie pokazuje liczbę osób na liście rezerwowej [1h]
  - [x] Automatyczne liczenie osób na liście rezerwowej

- [x] Testy automatycznego przypisywania do list [1h]

### Mobile - Wyświetlanie Listy Rezerwowej [4h]

- [x] Wyraźne oznaczenie statusu uczestnictwa [1h]
  - [x] Badge "Główna lista" lub "Lista rezerwowa"
  - [x] Informacja o pozycji na liście rezerwowej

- [x] Organizator widzi podzieloną listę uczestników [2h]
  - [x] Sekcja "Główna lista" (do limitu miejsc)
  - [x] Sekcja "Lista rezerwowa" (ponad limit)

- [x] Wyświetlanie liczby osób na liście rezerwowej [1h]
  - [ ] Na karcie wydarzenia na mapie
  - [x] Na szczegółach wydarzenia

✅ Kamień Milowy S2: Użytkownicy wiedzą czy mają pewne miejsce czy są na liście rezerwowej

---

## 🆕 Feature S3: Automatyczne Awansowanie z Listy Rezerwowej 🟡 [60% DONE → 2h remaining]

Priorytet: WYSOKI - automatyczne uzupełnianie wolnych miejsc
Deadline: Tydzień 5 (do 2025-12-11)
Zakres: Gdy ktoś rezygnuje, pierwsza osoba z listy rezerwowej automatycznie awansuje

### Backend - Automatyczne Awansowanie [3h]

- [x] System automatycznie awansuje pierwszą osobę z listy rezerwowej [2h]
  - [x] Znajdowanie pierwszej osoby na liście rezerwowej (według kolejności)
  - [x] Przeniesienie z listy rezerwowej na główną listę
  - [x] Aktualizacja pozycji wszystkich uczestników

- [x] Awans następuje automatycznie gdy ktoś rezygnuje [1h]
  - [x] Sprawdzenie czy są osoby na liście rezerwowej
  - [x] Automatyczne wywołanie awansowania

### Mobile - Powiadomienie o Awansie [2h]

- [ ] Użytkownik widzi komunikat o awansie [1h]
  - [ ] Wyskakujący komunikat "Awansowałeś z listy rezerwowej!"
  - [ ] Automatyczne sprawdzanie statusu

- [ ] Automatyczne odświeżenie po awansie [1h]
  - [ ] Aktualizacja listy uczestników
  - [ ] Zmiana wyświetlanego statusu (badge)

✅ Kamień Milowy S3: Wolne miejsca wypełniają się automatycznie osobami z listy rezerwowej

Zaplanowane na Q1 2026:
- Powiadomienia email/push o awansie
- Ręczne awansowanie/degradowanie przez organizatora
- Przeciąganie uczestników do zmiany kolejności

---

## Feature 4: Powtarzające się Wydarzenia 🔴 [0% DONE → 25h]

Priorytet: WYSOKI - organizator potrzebuje regularnych treningów/meczy
Deadline: Tydzień 5-6 (do 2025-12-25)
Zakres: Automatyczne tworzenie serii powtarzających się wydarzeń (np. co tydzień w ten sam dzień)

### Backend - System Powtarzających się Wydarzeń [15h]

- [ ] System przechowuje szablony powtarzających się wydarzeń [3h]
  - [ ] Informacje: nazwa serii, organizator, lokalizacja
  - [ ] Częstotliwość: co tydzień / co 2 tygodnie
  - [ ] Dzień tygodnia (poniedziałek-niedziela)
  - [ ] Godzina rozpoczęcia
  - [ ] Domyślne ustawienia (liczba miejsc, cena, poziom)
  - [ ] Baza danych przygotowana (migracja V1_3)

- [ ] System automatycznie generuje wydarzenia według szablonu [6h]
  - [ ] Organizator określa datę rozpoczęcia i liczbę wydarzeń
  - [ ] System oblicza wszystkie daty (np. każdy wtorek przez 10 tygodni)
  - [ ] Masowe tworzenie wydarzeń (maks. 20 na raz)
  - [ ] Każde wydarzenie jest połączone z serią

- [ ] Organizator może przeglądać swoje serie [2h]
  - [ ] Lista wszystkich serii organizatora
  - [ ] Szczegóły pojedynczej serii

Nie w MVP (Q1 2026):
- Co miesiąc (obecnie tylko: co tydzień, co 2 tygodnie)
- Pomijanie świąt
- Wstrzymywanie/wznawianie serii
- Edycja istniejącej serii

### Mobile - Tworzenie Powtarzających się Wydarzeń [10h]

- [ ] Ekran tworzenia serii wydarzeń [3h]
  - [ ] Formularz podobny do tworzenia wydarzenia
  - [ ] Nazwa serii, lokalizacja
  - [ ] Domyślne ustawienia (miejsca, cena, poziom)

- [ ] Wybór częstotliwości [2h]
  - [ ] Lista: "Co tydzień" / "Co 2 tygodnie"
  - [ ] Wybór dnia tygodnia (Pn-Nd)

- [ ] Wybór godziny [1h]

- [ ] Dialog generowania wydarzeń [2h]
  - [ ] Wybór daty rozpoczęcia
  - [ ] Liczba wydarzeń do wygenerowania (np. 10 treningów)

- [ ] Połączenie z backendem [2h]
  - [ ] Tworzenie serii
  - [ ] Generowanie wydarzeń

✅ Kamień Milowy F4: Organizator może w minutę stworzyć 10 regularnych treningów na najbliższe tygodnie

Zaplanowane na Q1 2026:
- Wydarzenia co miesiąc
- Automatyczne pomijanie świąt
- Podgląd przed generowaniem
- Wstrzymanie/wznowienie serii
- Edycja serii

---

## Feature 6: Podstawowy Interfejs dla Organizatora 🔴 [15h → 9h remaining]

Priorytet: WYSOKI - organizator potrzebuje wygodnej obsługi
Deadline: Tydzień 7 (do 2025-12-28)
Zakres: Intuicyjny interfejs mobilny z łatwą nawigacją
Postęp: 40% GOTOWE ✅ - Nawigacja i lista wydarzeń działają

### Mobile - Interfejs Użytkownika [15h]

- [ ] Ekran "Moje Wydarzenia" dla organizatora [4h]
  - [ ] Lista wydarzeń zorganizowanych przez użytkownika
  - [ ] Skrócona karta wydarzenia (data, miejsce, liczba uczestników)
  - [ ] Dotknięcie otwiera szczegóły

- [x] Dolna nawigacja (3 zakładki) [3h] ✅
  - [x] Mapa z wydarzeniami
  - [x] Moje Wydarzenia
  - [x] Profil użytkownika

- [x] Lista wszystkich wydarzeń [3h] ✅
  - [x] Przewijalna lista wszystkich wydarzeń
  - [x] Odświeżanie przez pociągnięcie w dół

- [ ] Przyjazne wskaźniki ładowania [2h]
  - [ ] Szkieletowe ekrany podczas ładowania danych
  - [ ] Płynne animacje

- [x] Obsługa błędów [2h] ✅
  - [x] Komunikaty o błędach połączenia
  - [x] Przycisk "Spróbuj ponownie"

- [ ] Podstawowa obsługa problemów z siecią [1h]

✅ Kamień Milowy F6: Organizator ma wygodną, intuicyjną aplikację mobilną

---

## Uruchomienie Produkcyjne + Testy 🔴 [15h]

Priorytet: KRYTYCZNY - aplikacja musi działać online
Deadline: Tydzień 7-8 (do 2025-12-31)
Zakres: Aplikacja dostępna przez internet dla pierwszych użytkowników

### Uruchomienie na Serwerze [10h]

- [ ] Przygotowanie środowiska produkcyjnego [3h]
  - [ ] Konfiguracja bazy danych PostgreSQL
  - [ ] Zabezpieczenie hasła do bazy i klucza JWT
  - [ ] Ustawienia produkcyjne (logi, limity)

- [ ] Test uruchomienia lokalnego [2h]
  - [ ] Sprawdzenie czy wszystko działa lokalnie
  - [ ] Test wszystkich funkcji

- [ ] Uruchomienie na serwerze internetowym [4h]
  - [ ] Zainstalowanie bazy danych
  - [ ] Uruchomienie aplikacji backend
  - [ ] Konfiguracja Nginx (przekierowania)
  - [ ] Certyfikat SSL (bezpieczne połączenie HTTPS)

- [ ] Przygotowanie przykładowych danych [2h]
  - [ ] 5 testowych użytkowników (w tym 2 organizatorów)
  - [ ] 15 przykładowych wydarzeń w Poznaniu
  - [ ] 5 przykładowych lokalizacji (hale sportowe)
  - [ ] 2 przykładowe serie treningów

- [ ] Podstawowe monitorowanie [1h]
  - [ ] Sprawdzanie czy serwer działa
  - [ ] Zapisywanie błędów do logów

### Testy Akceptacyjne + Naprawy [5h]

- [ ] Test głównych scenariuszy użycia [2h]
  - [ ] Nowy użytkownik: rejestracja → logowanie
  - [ ] Organizator: utworzenie wydarzenia
  - [ ] Organizator: dodanie uczestnika do wydarzenia
  - [ ] Organizator: usunięcie uczestnika
  - [ ] Organizator: utworzenie serii treningów
  - [ ] Organizator: wygenerowanie 10 wydarzeń z serii

- [ ] Naprawa krytycznych błędów [3h]
  - [ ] Naprawienie problemów znalezionych w testach
  - [ ] Weryfikacja napraw

✅ Kamień Milowy Deployment: Aplikacja działa online i jest gotowa dla pierwszych użytkowników! 🚀

---

## 🎊 MILESTONE 1 - CO MUSI DZIAŁAĆ DO KOŃCA 2025

Funkcje gotowe do użycia:
- [x] Rejestracja i logowanie użytkowników ✅
- [x] Mapa z wszystkimi wydarzeniami ✅
- [x] Tworzenie wydarzenia przez organizatora ✅
- [x] Edycja i usuwanie wydarzenia ✅
- [x] Ręczne zarządzanie uczestnikami przez organizatora ✅
  - [x] Dodawanie uczestników ✅
  - [x] Usuwanie uczestników ✅
- [x] Lista moich wydarzeń dla organizatora ✅

Do ukończenia (pozostało 45h):
- [ ] Samodzielne zapisywanie się uczestników (10h)
- [ ] System listy rezerwowej (5h remaining - 50% gotowe)
- [ ] Automatyczne awansowanie z listy rezerwowej (5h)
- [ ] Tworzenie serii regularnych treningów (25h)
- [ ] Uruchomienie online na serwerze produkcyjnym (15h)

Total Milestone 1: ~115h = 7-8 tygodni (15h/tydzień)

---

# 📋 MILESTONE 2 (ZMODYFIKOWANY): Advanced Features 🟡 [Q1 2026]

Scope: Zaawansowane funkcje dla organizatora i uczestników

UWAGA: Self-service join/leave i basic waitlist przeszły do M1 2025!

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

Dlaczego Q1 2026: MVP ma już podstawowe self-service, zaawansowane funkcje mogą poczekać

---

## Feature 3: Zarządzanie Uczestnikami - ADVANCED [45h]

Scope: Zaawansowane zarządzanie dla organizatora

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

Scope: Zaawansowane funkcje serii

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

Scope: Społeczności/grupy organizujące wydarzenia

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

Scope: Rozszerzony profil, historia

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

Timeline: Q2 2026 (Kwiecień - Czerwiec)
Scope: Notyfikacje, płatności, testowanie
Total: ~195h (~13 tygodni)

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

Release Gate: 0 High/Critical otwartych; raporty SAST/DAST/Deps; test restore OK; polityki RODO gotowe.

---

# 📊 PODSUMOWANIE ESTYMAT (ZAKTUALIZOWANE)

| Milestone | Scope | Hours | Weeks (15h) | Timeline |
|-----------|-------|-------|-------------|----------|
| M1: Organizer MVP + Self-Service | Zarządzanie + basic join/waitlist | 140h | ~9 tyg. | Do 2025-12-31 |
| M2: Advanced Features | Zaawansowane funkcje | 65h | ~4 tyg. | Q1 2026 |
| M3: Post-MVP | Notifications + Payments + Security/RODO | 257h | ~17 tyg. | Q2 2026 |
| TOTAL | | 462h | ~31 tyg. | ~7-8 miesięcy |

ZMIANA: Self-service join/leave i basic waitlist przesunięte z M2 do M1 (+25h w M1, -135h w M2)

---

## 🚀 STRATEGIA REALIZACJI (ZAKTUALIZOWANA)

### Faza 1: Organizer MVP + Self-Service (8-9 tygodni - do końca 2025)
Focus: Narzędzie dla ORGANIZATORA + podstawowy self-service dla uczestników

Tydzień 1-2: Feature 1 - Events CRUD (30h) ✅
→ Tworzenie, edycja, usuwanie wydarzeń

Tydzień 2-3: Feature 3 - Manual Participant Management (30h)
→ Ręczne zarządzanie listą uczestników

Tydzień 4: ⭐ Feature S1 - Self-Service Join/Leave (10h)
→ Uczestnicy mogą sami dołączać i opuszczać

Tydzień 5: ⭐ Feature S2 + S3 - Waitlist + Auto-Promocja (15h)
→ Prosta waitlista FIFO + automatyczne awanse

Tydzień 6: Feature 4 - Event Series BASIC (25h)
→ Cykliczne wydarzenia (co tydzień)

Tydzień 7: UI + Polish (15h)
→ Interfejs + dopracowanie

Tydzień 8: Deployment + Testing (15h)
→ Live deployment

END: 2025-12-31 ✅

### Faza 2: Advanced Features (Q1 2026 - 4-5 tygodni)
Focus: Zaawansowane funkcje

- Manual promote/demote
- Drag & drop reordering
- Payment tracking
- Advanced series (monthly, skipHolidays)
- Groups
- Enhanced profiles

### Faza 3: Post-MVP (Q2 2026 - 17 tygodni)
Focus: Notyfikacje, płatności, testowanie

- Email & Push notifications
- Stripe payments
- Testing & Documentation
- Security & RODO compliance

---

## 🎯 PRIORYTETY (Critical Path) - ZAKTUALIZOWANE

### 🔴 MUST HAVE dla MVP (2025):
1. Feature 1: Events CRUD - 2 tygodnie ✅
2. Feature 3: Manual Participant Management - 2 tygodnie
3. ⭐ Feature S1: Self-Service Join/Leave - 1 tydzień (NOWE!)
4. ⭐ Feature S2+S3: Waitlist + Auto-Promocja - 1 tydzień (NOWE!)
5. Feature 4: Event Series BASIC - 2 tygodnie
6. UI + Deployment - 2 tygodnie

Critical Path: 9 tygodni = koniec 2025

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
| W4 | 2025-12-04 | ⭐ Self-Service Join SIMPLE | 15h |
| W5 | 2025-12-11 | ⭐ Simple Waitlist + Auto-Promocja | 15h |
| W6 | 2025-12-18 | Feature 4 - Series BACK + UI | 15h |
| W7 | 2025-12-25 | UI Basics + Polish | 15h |
| W8 | 2026-01-01 | Deployment + Testing | 15h |
| END | 2025-12-31 | 🎊 MVP Z SELF-SERVICE | 140h |

---

## 💡 ZASADY PRACY

1. Focus na organizatora - każdy feature musi pomagać organizatorowi
2. Jeden feature na raz - dokończ zanim zaczniesz następny
3. Backend + Flutter razem - nie rób wszystkiego na backu, potem froncie
4. Testuj z prawdziwymi użytkownikami - znajdź organizatora do testów
5. Upraszczaj - jeśli coś nie działa, zrób prościej
6. Git daily - codzienne commity

---

## 🏁 CO MUSI DZIAŁAĆ 31 GRUDNIA 2025

### ABSOLUTNE MINIMUM (Must Have):
- [x] Aplikacja działa na serwerze (środowisko testowe) ✅
- [x] Organizator może utworzyć wydarzenie ✅
- [x] Organizator może zarządzać uczestnikami (ręcznie) ✅
  - [x] Dodawanie uczestników ✅
  - [x] Usuwanie uczestników ✅
- [ ] ⭐ Uczestnicy mogą się samodzielnie zapisywać (kluczowe!)
- [ ] ⭐ Uczestnicy mogą rezygnować z uczestnictwa (kluczowe!)
- [ ] ⭐ System automatycznie tworzy listę rezerwową [50% gotowe]
- [ ] ⭐ System automatycznie awansuje osoby z listy rezerwowej
- [ ] Organizator może tworzyć serie regularnych treningów
- [x] Organizator widzi listę swoich wydarzeń ✅

### MILE WIDZIANE (Nice to Have):
- [ ] 2-3 organizatorów przetestowało aplikację
- [ ] Brak krytycznych błędów
- [ ] Pozytywny feedback od testujących

DLACZEGO TA ZMIANA: Organizatorzy nie będą ręcznie dodawać każdego gracza - aplikacja musi pozwalać użytkownikom samodzielnie się zapisywać!

---

Legend:
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
