
📝 CHANGELOG

Ostatnia aktualizacja: 2025-11-18

Naprawione problemy (FEATURE_03 Participant Management):
- ✅ #1  - .env zabezpieczony w .gitignore i utworzono .env.example (KRYTYCZNE)
- ✅ #2  - Dodano walidacje do RegisterRequest (KRYTYCZNE)
- ✅ #3  - Authorization bypass w UserController (KRYTYCZNE)
- ✅ #5  - Dodano i18n translations dla wszystkich tekstów (KRYTYCZNE)
- ✅ #6  - Zamieniono hardcoded kolory na Theme (KRYTYCZNE)
- ✅ #7  - Dodano @Transactional do EventService i AuthenticationService (WYSOKIE)
- ✅ #8  - Poprawiono mapowania encji w UserEntity (WYSOKIE)
- ✅ #9  - Zamieniono System.out.println na @Slf4j logger (WYSOKIE)
- ✅ #10 - Zamieniono RuntimeException na custom exceptions (WYSOKIE)
- ✅ #11 - Poprawiono konwencje REST w EventController (WYSOKIE)
- ✅ #13 - Zamieniono print() na developer.log() we frontendzie (WYSOKIE)
- ✅ #14 - Dodano testy dla EventMarkerService i UserService (WYSOKIE)
- ✅ #23 - Utworzono reużywalne helpery CustomSnackBar (ŚREDNIE)
- ✅ #24 - Utworzono EventAuthMixin dla logiki autoryzacji (ŚREDNIE)
- ✅ #25 - Utworzono LoginRequiredDialog (ŚREDNIE)
- ✅ #12 - Zrefaktoryzowano duże pliki widgetów (WYSOKIE)
  - details.dart: 304→225 linii (-26%)
  - create_event_screen.dart: 487→387 linii (-21%)
  - participant_manage_screen.dart: 420→381 linii (-9%)
  - events_list_screen.dart: 335→329 linii (-2%)
  - google_map.dart: 323→261 linii (-19%)
  - Utworzono ViewModels i helpery

Status testów:
- Backend: 141/141 testów ✅
- Frontend: 104/104 testów Flutter ✅ (+6 nowych testów dla serwisów)

Notatki:
- #4 (hardcoded credentials w dev_settings_screen.dart) pozostaje - dozwolone dla dev tools

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

27. Problemy z zarządzaniem stanem w pozostałych widgetach

- Rozważ rozszerzenie ViewModel pattern na inne
ekrany

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
| 🔴 Krytyczne  | 3 (3✅)      | 3 (2✅ 1✓)   | 100% naprawione  |
| 🟠 Wysokie    | 7 (5✅ 2🟠)  | 3 (3✅)      | 80% naprawione   |
| 🟡 Średnie    | 10 (5✅)     | 5 (5✅)      | 67% naprawione   |
| 🟢 Niskie     | 9            | 4            | 0% naprawione    |
| ⚪ Kosmetyczne | 3            | 3            | 0% naprawione    |
| RAZEM         | 32           | 18           | 50 problemów     |

Łącznie znalezionych problemów: 50
Naprawione: 23 (46%)
Zaakceptowane: 1 (#4 - dev credentials OK)
Do naprawy: 26 (52%)

Ostatnia aktualizacja metryk: 2025-11-18

---
🎯 REKOMENDOWANY PLAN DZIAŁANIA

Sprint 1 (Krytyczne) - Status: 5/5 ukończone ✅

1. ✅ Usuń credentials z repozytorium (BE + FE) - UKOŃCZONE (2025-11-18)
2. ✅ Dodaj walidację RegisterRequest (BE) - UKOŃCZONE (2025-11-18)
3. ✅ Fix authorization bypass (BE) - UKOŃCZONE (2025-11-17)
4. ✅ Dodaj i18n do wszystkich tekstów (FE) - UKOŃCZONE (2025-11-17)
5. ✅ Zamień hardcoded colors na theme (FE) - UKOŃCZONE (2025-11-17)

Sprint 2-3 (Wysokie) - Status: 8/8 ukończone ✅

6. ✅ Dodaj @Transactional (BE) - UKOŃCZONE (2025-11-17)
7. ✅ Fix entity mappings (BE) - UKOŃCZONE (2025-11-18)
8. ✅ Zamień System.out na logger (BE) - UKOŃCZONE (2025-11-17)
9. ✅ Użyj custom exceptions (BE) - UKOŃCZONE (2025-11-18)
10. ✅ Fix REST convention (BE) - UKOŃCZONE (2025-11-18)
11. ✅ Usuń print statements (FE) - UKOŃCZONE (2025-11-17)
12. ✅ Dodaj testy dla serwisów (FE) - UKOŃCZONE (2025-11-18)
13. ✅ Rozdziel duże widgety (FE) - UKOŃCZONE (2025-11-18)

Q1 2026 (Średnie + reszta) - Status: 10/15 ukończone

14. ✅ Duplikacja SnackBar (FE) - UKOŃCZONE (2025-11-17)
15. ✅ Duplikacja autoryzacji (FE) - UKOŃCZONE (2025-11-17)
16. ✅ Duplikacja dialogów (FE) - UKOŃCZONE (2025-11-17)
17. ✅ Duplikacja kodu update w EventService (BE) - UKOŃCZONE (2025-11-18)
19. ✅ Problem N+1 w EventService (BE) - UKOŃCZONE (2025-11-18)
20. ✅ Nieefektywne zapytanie w PostService (BE) - UKOŃCZONE (2025-11-18)
21. ✅ Brak rate limiting (BE) - UKOŃCZONE (2025-11-18)
22. ✅ Permisywna konfiguracja CORS (BE) - UKOŃCZONE (2025-11-18)
26. ✅ Niespójna obsługa błędów (FE) - UKOŃCZONE (2025-11-18)
27. ✅ Problemy z zarządzaniem stanem (FE) - UKOŃCZONE (2025-11-18)
16-18, 28-50. Systematyczna refaktoryzacja według listy - DO ZROBIENIA

---
📈 PROGRESS TRACKING

Ukończone (23/50): #1, #2, #3, #5, #6, #7, #8, #9, #10, #11, #12, #13, #14, #15, #19, #20, #21, #22, #23, #24, #25, #26, #27
Zaakceptowane (1/50): #4 (dev credentials OK)
W trakcie (0/50): -
Pozostałe (26/50): #16-18, #28-50

Następny priorytet: problemy ŚREDNIE (#16-18), problemy NISKIE (#28-38)
