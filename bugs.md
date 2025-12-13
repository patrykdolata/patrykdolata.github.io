# features
- [ ] przy zaznaczaniu bulk powinna byc zablokowana opcja rozwijania akcji per osoba
- [ ] możliwość zamknięcia snackbar krzyżykiem
- [ ] możliwość oznaczania w tekstach uzytkowników przez @login
- [ ] dodanie komunikatow/powodow odrzucenia 
- [ ] select all dla innych list graczy

# bugs
## critical
- [ ] brak wpisu w powiadomieniach o anulowaniu wydarzenia
- [ ] brak możliwości zmiany kolejnosći na zdefiniowanej liście graczy
- [ ] tworzone wydarzenia z serii wydarzen maja godzine przesuniętą względem zaplanowanej
- [ ] brak powiadomienia o osobie oczekującej na dołączenie do listy
- [ ] długi freeze przy akceptacji prosby o dołęcznie

## medium
- [ ] blad przy edycji listy z menu kontekstowego po edycji listy stałych graczy brak zmian listy (stare dane)
- [ ] utworzenie listy graczy o tej samej nazwie nie powoduje bledu na UI -> zero info co się stało
  ```
  I/flutter ( 5360): 11:28:23.287 [INFO] WebSocket: Creating player list: groupId=1, name=środowa ekipa
  I/ImeTracker( 5360): com.dolti.meetapp:33013aa7: onRequestHide at ORIGIN_CLIENT reason HIDE_SOFT_INPUT fromUser false
  D/InsetsController( 5360): hide(ime())
  D/WindowOnBackDispatcher( 5360): setTopOnBackInvokedCallback (unwrapped): io.flutter.embedding.android.FlutterActivity$1@18ac1b7
  D/InsetsController( 5360): Setting requestedVisibleTypes to 496 (was 504)
  I/ImeTracker( 5360): system_server:1214f12b: onCancelled at PHASE_CLIENT_ON_CONTROLS_CHANGED
  D/VRI[MainActivity]( 5360): WindowInsets changed: navigationBars:null
  W/m140.fdm( 5360): Destroying egl surface
  I/flutter ( 5360): 11:28:23.552 [SEVERE] WebSocket: Error creating player list: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360):   Error: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360): 11:28:23.553 [SEVERE] WebSocket: Error creating player list: Exception: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360): Stack trace: #0      PlayerListService.createPlayerList.<anonymous closure> (package:app/features/playerlist/player_list_service.dart:63:11)
  I/flutter ( 5360): #1      Left.match (package:fpdart/src/either.dart:620:72)
  I/flutter ( 5360): #2      Either.fold (package:fpdart/src/either.dart:280:7)
  I/flutter ( 5360): #3      PlayerListService.createPlayerList (package:app/features/playerlist/player_list_service.dart:60:21)
  I/flutter ( 5360): <asynchronous suspension>
  I/flutter ( 5360): #4      _GroupDetailsScreenContentState._showCreatePlayerListDialog (package:app/widgets/group/details/group_details_screen.dart:350:23)
  I/flutter ( 5360): <asynchronous suspension>
  I/flutter ( 5360):   Error: Exception: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360): 11:28:23.553 [SEVERE] WebSocket: Uncaught async error: Exception: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360): #0      PlayerListService.createPlayerList.<anonymous closure> (package:app/features/playerlist/player_list_service.dart:63:11)
  I/flutter ( 5360): #1      Left.match (package:fpdart/src/either.dart:620:72)
  I/flutter ( 5360): #2      Either.fold (package:fpdart/src/either.dart:280:7)
  I/flutter ( 5360): #3      PlayerListService.createPlayerList (package:app/features/playerlist/player_list_service.dart:60:21)
  I/flutter ( 5360): <asynchronous suspension>
  I/flutter ( 5360): #4      _GroupDetailsScreenContentState._showCreatePlayerListDialog (package:app/widgets/group/details/group_details_screen.dart:350:23)
  I/flutter ( 5360): <asynchronous suspension>
- [ ] przy edycji serii wydarzen brak pola o wybranej liscie stalych graczy
- [ ] wejscie do aplikacji przez niezalogowanego usera pokazuje czlonkow wydarzenia
- [ ] potwierdzenie przez uczestnika obecnosci nie utworzylo powiadomienia dla organizatora
- [ ] brak polskich znakow w list name 
- [ ] brak pull to refresh na liscie stałych graczy
- [ ] usunięcie członka z grupy powinno usuwać go również z przygotowanych list graczy
- [ ] po przelogowaniu na innego usera i wejsciu w zakładkę grupa - biały ekran
- [ ] snackbary sie stackuja i przy dluzszej niedostepnosci serwera po powrocie polaczenia pokazuja sie bardzo dlugo - powinnien byc reset snackbar przy powrocie polaczenia
- [ ] brak opisu grupy po przejsciu w szczegoly - być może warto zablokować wejście jeżeli nie jest się członkiem -> tylko join request
- [ ] deeplink -> aby dolaczyc musisz sie zalogowac -> po zalogowaniu powrot do mapy a nie wydarzenia
- [ ] komunikat przy probie dodaniu osoby do grupy, ktora juz jest zbyt generyczny
  - backend wysyla: Invalid argument: User is already a member or has pending request
  - frontend: blad failed to add member
- [ ] brak możliwości wycofania żądania o dodanie do grupy
- [ ] przy probie usuniecia wydarzenia z graczami generyczny blad zamiast konkretu:  Invalid state: Cannot delete event with participants. Cancel the event instead.
- [ ] przy probie utworzenia szablonu wydarzen przekraczajacego liczbe slots+waitlist komunikat bledu unknown mimo ze pokazuje sie opis pod polem z prawdziwym powodem
- [ ] na ekranie developera autokorekta username
- [ ] markery na mapie nieprawidłowo się zachowują przy oddalaniu mapy

