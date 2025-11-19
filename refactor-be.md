
Bezpieczeństwo i kontrola dostępu

  - Rejestracja pozwala klientowi przesłać dowolną rolę i jest ona bezkrytycznie zapisywana (security/auth/RegisterRequest.java:35-37, security/auth/UserRegistrationService.java:39-55). W efekcie każdy anonimowy użytkownik może utworzyć konto ADMIN/MANAGER. Dla publicznego endpointu zostaw wyłącznie Role.USER, a eskalację ról obsłuż z poziomu administracji.
  - Endpointy do ulubionych miejsc nie weryfikują właściciela rekordu – GET/PUT/DELETE /favorites/{id} przyjmują samo id i operują na encjach innych użytkowników (favorite/FavoritePlaceController.java:26-63, favorite/FavoritePlaceService.java:62-78). Zabezpiecz te operacje (np. @PreAuthorize("#currentUser.id == #ownerId")) i filtruj zapytania po userId.
  - Lista użytkowników i aktualizacja kont są dostępne dla każdego zalogowanego klienta, a DTO zwraca maile i role (user/UserController.java:29-56, user/UserDTO.java:16-33). Udostępnij te operacje jedynie administratorom i ogranicz zwracane pola (np. brak e‑maila/roli w publicznych odpowiedziach).
  - Konfiguracja zabezpieczeń przepuszcza tylko POST na /auth/**, więc GET /auth/validate-token i POST /auth/logout są domyślnie blokowane (config/SecurityConfiguration.java:40-55, security/auth/AuthController.java:65-75). Dodatkowo logout() w filtrze przechwytuje żądanie zanim dotrze do kontrolera. Zdefiniuj jawne requestMatchers dla GET/PUT auth, usuń duplikat kontrolera
    lub zmień ścieżkę filtra.
  - Repozytorium tokenów uznaje token za „ważny”, jeżeli nie jest wygasły lub nieodwołany (security/token/TokenRepository.java:10-15). W praktyce token wygasły, ale nieodwołany, dalej będzie używalny. Popraw warunek na AND i zapisuj expiresAt/typy tokenów, aby móc egzekwować czasy życia.

  Warstwa domenowa i dane

  - GET /events każdorazowo pobiera wszystkie rekordy z bazy i na bieżąco aktualizuje kolumnę slots_available (EventService.java:43-55, EventSlotService.java:20-52). To łamie idempotencję odczytu i przy większych wolumenach mocno obciąży bazę. Przenieś synchronizację slotów do transakcji zapisujących lub zadania asynchronicznego, a listowanie wystaw jako czysty odczyt.
  - Zapytania o wydarzenia nie mają żadnej paginacji ani fetch join dla użytkownika (event/EventRepository.java:16-23). EventDTO dogrywa UserDTO lazy-loadingiem, co przy wielu rekordach wywoła lawinę zapytań N+1. Przejdź na JpaRepository, dodaj Pageable, a w zapytaniach użyj @EntityGraph lub fetch join również dla user.
  - Zarządzanie uczestnikami próbuje „ręcznie” rozwiązać wyścigi (pobiera event, odejmuje slot, zapisuje, bez blokady), chociaż w repozytorium istnieje metoda z blokadą pesymistyczną (event/participant/EventParticipantService.java:80-133, event/EventRepository.java:31-33). W rezultacie dwie konkurencyjne transakcje mogą sprzedać ten sam slot albo przydzielić identyczną
    pozycję. Użyj findByIdForUpdate albo wersjonowania oraz przenieś obliczanie pozycji do zapytania SQL.
  - UserRegistrationService.updateUser buduje nową encję „od zera” i zapisuje ją na istniejące ID (security/auth/UserRegistrationService.java:86-111). Gubi relacje (tokens, events), każdorazowo nadpisuje hasło i aktualizuje znaczniki audytowe. Zamiast tego załaduj encję, zmapuj zmienne pola i pozwól JPA śledzić zmiany.
  - Kontroler ulubionych miejsc zwraca bezpośrednio encje z relacjami LAZY (favorite/FavoritePlaceController.java:20-63). Przy wyłączonym OpenSessionInView skończy się to LazyInitializationException, a nawet teraz wysyłasz całe grafy użytkownika. Stosuj DTO/Projection i jawnie załaduj potrzebne dane.

  Nowoczesne praktyki Spring/Java

  - Globalny handler wyjątków zwraca ręcznie zbudowane ErrorResponse, ignorując ProblemDetail i HttpStatusCode wprowadzony w Spring 6 (config/GlobalExceptionHandler.java:25-215). Warto przejść na ProblemDetail + @RestControllerAdvice, dołączyć szczegóły walidacji oraz korelację (trace id).
  - WIele miejsc odwołuje się bezpośrednio do LocalDateTime.now() (np. event/EventService.java:74-100, event/participant/EventParticipantService.java:127-178). Wstrzyknij Clock, żeby uprościć testy i uniknąć błędów strefowych; w DTO rozważ OffsetDateTime.
  - Konfiguracja sieciowa jest rozmnożona – dwa różne WebMvcConfigurer rejestrują ten sam interceptor z różnymi ścieżkami (config/WebConfig.java:8-21, config/WebMvcConfig.java:9-20). Utrudnia to utrzymanie i zwiększa ryzyko nakładających się filtrów. Uporządkuj konfigurację (moduł spring-modulith / dedykowany @ConfigurationProperties na rate limiting).
  - AuthController.authenticate akceptuje niezawalidowane body (security/auth/AuthController.java:49-55), InputSanitizer jest oznaczony jako @Component, choć udostępnia wyłącznie metody statyczne (common/util/InputSanitizer.java:9-57), a TokenRefreshService tworzy nowy ObjectMapper przy każdym żądaniu (security/auth/TokenRefreshService.java:63-68). Dodaj @Valid i
    Constrainty, usuń zbędny bean albo dostarcz instancję wstrzykiwaną oraz korzystaj z jednego ObjectMapper.

  Proponowane kolejne kroki

  1. Zamknąć luki bezpieczeństwa (rejestracja, kontrola właściciela ulubionych miejsc, poprawka TokenRepository, dostosowanie SecurityFilterChain) i dodać odpowiednie testy integracyjne.
  2. Wydzielić kontrakty DTO/mappery dla operacji na użytkownikach i ulubionych miejscach, wprowadzić paginację oraz fetch plan dla zapytań o wydarzenia i uczestników.
  3. Uporządkować konfigurację (ProblemDetail, Clock, właściwości CORS/RateLimit w @ConfigurationProperties, pojedynczy WebMvcConfigurer) i wykorzystać @PreAuthorize tak, by EnableMethodSecurity faktycznie chroniło warstwę serwisową.

  Po wdrożeniu powyższych zmian warto uruchomić istniejący pakiet testów (mvn test) i dopisać scenariusze e2e pokrywające nowe zasady autoryzacji oraz obsługę błędów.
