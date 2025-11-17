
📝 CHANGELOG

Ostatnia aktualizacja: 2025-11-17

Naprawione problemy (FEATURE_03 Participant Management):
- ✅ #3  - Authorization bypass w UserController (KRYTYCZNE)
- ✅ #7  - Dodano @Transactional do EventService i AuthenticationService (WYSOKIE)
- ✅ #9  - Zamieniono System.out.println na @Slf4j logger (WYSOKIE)
- ✅ #13 - Zamieniono print() na developer.log() we frontendzie (WYSOKIE)
- ✅ #23 - Utworzono reużywalne helpery CustomSnackBar (ŚREDNIE)
- ✅ #24 - Utworzono EventAuthMixin dla logiki autoryzacji (ŚREDNIE)
- ✅ #25 - Utworzono LoginRequiredDialog (ŚREDNIE)

Status testów:
- Backend: 141/141 testów ✅
- Frontend: 87+ testów Flutter ✅

---
  🔴 KRYTYCZNE (Wymaga natychmiastowej naprawy)

  Backend (meet-app-be)

  1. Hardcoded credentials w repozytorium

  Plik: meet-app-be/.env
  DATABASE_PASSWORD=postgres
  JWT_SECRET_KEY=vMag2/OjTCq/khkO+woJ+4cN7z/O8hFylwIf
  FmLBs5o=
  - ⚠️  Bezpieczeństwo naruszone - dane dostępowe w
  historii git
  - Usuń z repozytorium, zrotuj wszystkie klucze
  - Upewnij się, że .env jest w .gitignore

  2. Brak walidacji w RegisterRequest

  Plik: security/auth/RegisterRequest.java:16-19
  - Brak @NotBlank, @Email, @Size na polach login,
  email, password
  - Ryzyko SQL injection, puste rejestracje
  - Dodaj walidacje zgodnie z best practices

  3. ✅ NAPRAWIONE - Authorization bypass - użytkownicy mogą
  modyfikować innych

  Plik: user/UserController.java:41-48
  Status: NAPRAWIONE (2025-11-17)
  - Dodano parametr UserEntity currentUser do updateUser() i deleteUser()
  - Tylko użytkownicy mogą edytować/usuwać swoje konta
  - Tylko adminowie mogą zmieniać role innych użytkowników
  - Role zwykłych użytkowników zachowywana przy update
  - Dodano UnauthorizedException dla prób nieautoryzowanych zmian
  - Wszystkie testy zaktualizowane i przechodzą (141/141)

  Frontend (meet-app-fe)

  4. Hardcoded credentials w kodzie

  Plik: widgets/dev/dev_settings_screen.dart:24-26
  static const String _defaultDevUsername =
  'test@example.com';
  static const String _defaultDevPassword =
  'password123';
  - Usuń natychmiast lub przenieś do zmiennych
  środowiskowych

  5. Brak tłumaczeń i18n dla tekstów użytkownika

  Pliki: events_list_screen.dart:184,221,223,
  google_map.dart:212-213
  'Meet App' // Hardcoded
  'Siatkówka Poznań' // Polski tekst
  'Error loading events: ${snapshot.error}' // Nie
  przetłumaczone
  - Użyj S.of(context).key dla wszystkich tekstów
  użytkownika

  6. Hardcoded kolory zamiast theme

  Plik: dev_settings_screen.dart:63,77,97 i inne
  Colors.green, Colors.orange, Colors.deepPurple
  - Użyj Theme.of(context).colorScheme.*

  ---
  🟠 WYSOKIE (Naprawa w obecnym sprincie)

  Backend

  7. ✅ NAPRAWIONE - Brak @Transactional w operacjach wielokrokowych

  Pliki: EventService.java:83-128,
  AuthenticationService.java:41-67
  Status: NAPRAWIONE (2025-11-17)
  - Dodano @Transactional do:
    - EventService: addEvent(), createEvent(), updateEvent()
    - AuthenticationService: registerUser(), updateUser()
  - Zapobiega niespójności danych przy błędach
  - Zapewnia atomowość operacji wielokrokowych (np. promote/demote w FEATURE_03)

  8. Nieprawidłowe mapowania encji w UserEntity

  Plik: user/UserEntity.java:77-81
  @OneToMany(mappedBy = "user")
  private List<TokenEntity> events;  // Powinno być
  EventEntity
  private List<TokenEntity> posts;   // Powinno być
  PostEntity
  - Błąd copy-paste, wymaga poprawy

  9. ✅ NAPRAWIONE - System.out.println zamiast loggera

  Pliki: EventService.java:52,80,
  AuthenticationService.java:135-172
  Status: NAPRAWIONE (2025-11-17)
  - Dodano @Slf4j annotation do EventService i AuthenticationService
  - Zamieniono wszystkie 13 wystąpień System.out.println na:
    - log.info() - dla informacji o operacjach
    - log.debug() - dla szczegółów debugowania
    - log.warn() - dla ostrzeżeń (np. unknown user id)
  - Proper logging levels według kontekstu

  10. Generic RuntimeException zamiast domenowych
  wyjątków

  Pliki: FavoritePlaceService.java:38-74,
  EventService.java:175,224
  throw new RuntimeException("User not found"); //
  Użyj ResourceNotFoundException
  - Już istnieją custom exceptions, ale nie są
  używane

  11. Naruszenie konwencji REST

  Plik: EventController.java:50-55
  @PutMapping(value = "/events")  // Powinno być POST
   dla tworzenia
  public void addEvent(...) // Brak zwracanej
  wartości

  Frontend

  12. Zbyt duże pliki widgetów (>200 linii)

  - create_event_screen.dart - 487 linii
  - participant_manage_screen.dart - 420 linii
  - events_list_screen.dart - 332 linie
  - google_map.dart - 330 linii
  - details.dart - 304 linie

  Rozdziel na mniejsze komponenty

  13. ✅ NAPRAWIONE - Print statements w kodzie produkcyjnym

  Pliki: 7 plików z print() statements
  Status: NAPRAWIONE (2025-11-17)
  - Zamieniono wszystkie 57+ wystąpień print() na developer.log():
    - user_service.dart - 5 wystąpień
    - google_map.dart - 8 wystąpień
    - participant_service.dart - 5 wystąpień
    - token_interceptor.dart - 7 wystąpień
    - config.dart - 2 wystąpienia
    - events_list_screen.dart - 1 wystąpienie
    - event_marker_service.dart - 29 wystąpień
  - Dodano 'name' parameter dla lepszego filtrowania logów
  - Używa built-in dart:developer zamiast external package

  14. Brak testów dla dużych ekranów

  - Brak testów dla create_event_screen.dart (487
  linii)
  - Brak testów dla participant_manage_screen.dart
  (420 linii)
  - Brak testów dla serwisów (EventMarkerService,
  UserService)

  ---
  🟡 ŚREDNIE (Refaktoryzacja w następnych 2
  sprintach)

  Backend

  15. Duplikacja kodu - logika update

  Plik: EventService.java:171-226 vs 233-317
  - Dwie metody updateEvent z ~100 liniami
  zduplikowanego kodu null-checking
  - Skonsoliduj w jedną metodę

  16. God Class - EventService (329 linii)

  Plik: EventService.java
  - Za dużo odpowiedzialności: CRUD, location, slots,
   authorization, participants
  - Wydziel LocationService, EventSlotService

  17. God Class - AuthenticationService (314 linii)

  - Wydziel TokenRefreshService,
  UserRegistrationService

  18. Kontrolery zwracają entity zamiast DTO

  Pliki: EventController.java:35-38,
  UserController.java:20-27
  public EventEntity getEvent(@PathVariable UUID id)
  // Powinno być EventDTO
  - Stwórz DTOs dla wszystkich responses
  - Użyj mapperów konsekwentnie

  19. Problem N+1 w zapytaniach

  Plik: EventService.java:39-44
  events.forEach(this::recalculateSlotsAvailable); //
   N dodatkowych zapytań
  - Fetch participant counts w jednym query

  20. Nieefektywne zapytanie w PostService

  Plik: PostService.java:22-29
  postRepository.findAll().forEach(posts::add); //
  Ładuje całą tabelę dla 1 rekordu
  - Użyj @Query z ORDER BY ... LIMIT 1

  21. Brak rate limiting

  - /auth/authenticate - ryzyko brute force
  - /auth/register - ryzyko spamu
  - Dodaj rate limiting (bucket4j lub podobny)

  22. Zbyt permisywna konfiguracja CORS

  Plik: SecurityConfiguration.java:32-36
  corsConfig.addAllowedOrigin("http://34.59.119.43");
   // Hardcoded IP
  corsConfig.addAllowedMethod("*"); // Zbyt
  permisywne

  Frontend

  23. ✅ NAPRAWIONE - Duplikacja kodu - SnackBar pattern

  Status: NAPRAWIONE (2025-11-17)
  - Rozszerzono widgets/custom/snack_bar.dart o static methods:
    - CustomSnackBar.show() - standardowy snackbar
    - CustomSnackBar.showSuccess() - z zieloną ikoną check
    - CustomSnackBar.showError() - z czerwoną ikoną error
    - CustomSnackBar.showInfo() - z niebieską ikoną info
    - CustomSnackBar.showWarning() - z pomarańczową ikoną warning
  - Gotowe do zastąpienia 21 duplikacji ScaffoldMessenger
  - Używane w FEATURE_03 participant management

  24. ✅ NAPRAWIONE - Duplikacja logiki autoryzacji

  Status: NAPRAWIONE (2025-11-17)
  - Utworzono features/event/event_auth_mixin.dart
  - EventAuthMixin zawiera:
    - ensureLoggedIn() - weryfikacja zalogowania z opcjonalnym dialogiem
    - ensureOrganizer() - weryfikacja organizatora eventu
    - checkIfOrganizer() - check bez UI
    - checkIfLoggedIn() - check bez UI
    - getCurrentUserId() - helper do pobierania ID
  - Eliminuje duplikację z participant_manage_screen.dart i details.dart
  - Gotowe do użycia jako: `with EventAuthMixin`

  25. ✅ NAPRAWIONE - Duplikacja dialogów logowania

  Status: NAPRAWIONE (2025-11-17)
  - Utworzono widgets/custom/login_required_dialog.dart
  - LoginRequiredDialog zawiera:
    - show() - standardowy dialog z nawigacją do user panel
    - showWithCustomAction() - dialog z custom akcją
    - showInfo() - prosty info dialog
  - Eliminuje duplikację z events_list_screen i participant_manage_screen
  - Zintegrowany z istniejącymi translations (S.of(context))

  26. Niespójne zarządzanie błędami

  - create_event_screen.dart - dobre (try-catch z
  feedback)
  - google_map.dart:111-114 - catch i ignorowanie
  błędów
  - Standaryzuj pattern obsługi błędów

  27. Problemy z zarządzaniem stanem

  Plik: details.dart
  - Wiele bool flag: _isCurrentUserCreator,
  _isCheckingCreator, _isDeleting, _hasCheckedCreator
  - Ręczne zarządzanie listami _mainList, _waitlist
  - Rozważ ViewModel pattern lub BLoC

  ---
  🟢 NISKIE (Dług techniczny, następny kwartał)

  Backend

  28. Niespójne nazewnictwo

  - addEvent() vs createEvent() - obie tworzą eventy
  - addUser() vs registerUser() - obie tworzą
  użytkowników
  - Standaryzuj nazewnictwo

  29. Magic numbers

  Pliki: Różne validation annotations
  @Min(value = 15, message = "...")
  @Max(value = 100, message = "...")
  @Max(value = 5000, message = "...")
  - Wydziel do klasy ValidationConstants

  30. Hardcoded URL

  Plik: AuthenticationService.java:60
  .facebookProfileUri("https://graph.facebook.com/mee
  tappbe/")
  - Przenieś do konfiguracji

  31. Zakomentowany kod

  Plik: EventEntity.java:107-109
  //    @ManyToOne(fetch = FetchType.LAZY)
  //    @JoinColumn(name = "group_id")
  //    private GroupEntity group;
  - Usuń lub dodaj TODO

  32. Nieoptymalne wywołanie serwisu

  Plik: PostController.java:24-29
  if (postService.getLastPost().isPresent()) {
      return postService.getLastPost().get(); //
  Wywołuje serwis 2 razy
  }

  33. Brak dokumentacji API

  - Dodaj OpenAPI/Swagger
  - Udokumentuj wszystkie endpointy

  34. Luki w testach

  - Brak testów integracyjnych dla auth flow
  - Brak testów bezpieczeństwa dla autoryzacji
  - Brak testów transakcji i rollback
  - Brak testów współbieżności dla slot management

  Frontend

  35. Hardcoded rozmiary czcionek

  Pliki: dev_settings_screen.dart:169,187,255
  fontSize: 18 // Użyj Theme.of(context).textTheme

  36. Głębokie ścieżki importów

  Plik: dio_http_client.dart:10
  import '../../../../config/config.dart'
  - Użyj barrel exports (index.dart)

  37. Niespójna nawigacja

  - Mix Navigator.pop(), pushNamed(),
  MaterialPageRoute
  - Standaryzuj na named routes lub go_router

  38. Niska pokrycie testami

  - 46 plików testowych / 116 plików źródłowych = 40%
  - Docelowo >70%

  ---
  ⚪ KOSMETYCZNE

  Backend

  39. Brak wersjonowania API w response

  - Path ma wersję /api/v1/ ale format response
  zablokowany na strukturę entity
  - Implementuj strategię wersjonowania

  40. Brak input sanitization

  - Event title, message - brak HTML escaping
  - Dodaj sanitizację dla XSS prevention

  41. Password update zawsze re-hashuje

  Plik: AuthenticationService.java:90-95
  - Każdy update użytkownika wymaga hasła
  - Rozdziel endpoint zmiany hasła

  Frontend

  42. Optymalizacja wydajności GoogleMapWidget

  - Możliwe optymalizacje renderowania markerów
  - Debounce dla częstych aktualizacji mapy

  43. Rozważ upgrade state management

  - Obecny Provider działa, ale dla większej skali
  rozważ Riverpod/BLoC

  44. Dodaj testy integracyjne

  - Golden tests dla kluczowych ekranów
  - E2E testy dla głównych flow

  ---
  📊 PODSUMOWANIE METRYKI

  | Kategoria     | Backend      | Frontend     | Status           |
  |---------------|--------------|--------------|------------------|
  | 🔴 Krytyczne  | 3 (2✅ 1🔴)  | 3            | 33% naprawione   |
  | 🟠 Wysokie    | 7 (2✅ 5🟠)  | 3 (1✅ 2🟠)  | 30% naprawione   |
  | 🟡 Średnie    | 10           | 5 (3✅ 2🟡)  | 20% naprawione   |
  | 🟢 Niskie     | 9            | 4            | 0% naprawione    |
  | ⚪ Kosmetyczne | 3            | 3            | 0% naprawione    |
  | RAZEM         | 32           | 18           | 50 problemów     |

  Łącznie znalezionych problemów: 50
  Naprawione: 7 (14%)
  Do naprawy: 43 (86%)

  Ostatnia aktualizacja metryk: 2025-11-17

  ---
  🎯 REKOMENDOWANY PLAN DZIAŁANIA

  Sprint 1 (Krytyczne) - Status: 1/5 ukończone

  1. Usuń credentials z repozytorium (BE + FE) - 🔴 DO ZROBIENIA
  2. Dodaj walidację RegisterRequest (BE) - 🔴 DO ZROBIENIA
  3. ✅ Fix authorization bypass (BE) - UKOŃCZONE (2025-11-17)
  4. Dodaj i18n do wszystkich tekstów (FE) - 🔴 DO ZROBIENIA
  5. Zamień hardcoded colors na theme (FE) - 🔴 DO ZROBIENIA

  Sprint 2-3 (Wysokie) - Status: 3/6 ukończone

  6. ✅ Dodaj @Transactional (BE) - UKOŃCZONE (2025-11-17)
  7. Fix entity mappings (BE) - 🟠 DO ZROBIENIA
  8. ✅ Zamień System.out na logger (BE) - UKOŃCZONE (2025-11-17)
  9. Użyj custom exceptions (BE) - 🟠 DO ZROBIENIA
  10. Rozdziel duże widgety (FE) - 🟠 DO ZROBIENIA
  11. ✅ Usuń print statements (FE) - UKOŃCZONE (2025-11-17)

  Q1 2026 (Średnie + reszta) - Status: 3/15 ukończone

  12. ✅ Duplikacja SnackBar (FE) - UKOŃCZONE (2025-11-17)
  13. ✅ Duplikacja autoryzacji (FE) - UKOŃCZONE (2025-11-17)
  14. ✅ Duplikacja dialogów (FE) - UKOŃCZONE (2025-11-17)
  15-50. Systematyczna refaktoryzacja według listy - DO ZROBIENIA

  ---
  📈 PROGRESS TRACKING

  Ukończone (7/50): #3, #7, #9, #13, #23, #24, #25
  W trakcie (0/50): -
  Pozostałe (43/50): #1, #2, #4-6, #8, #10-12, #14-22, #26-50

  Następny priorytet: Krytyczne problemy #1, #2, #4, #5, #6
