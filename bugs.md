# features
- [ ] przy zaznaczaniu bulk powinna byc zablokowana opcja rozwijania akcji per osoba
- [ ] możliwość zamknięcia snackbar krzyżykiem
- [ ] możliwość oznaczania w tekstach uzytkowników przez @login
- [ ] dodanie komunikatow/powodow odrzucenia 
- [ ] select all dla innych list graczy

# bugs
- [ ] brak możliwości zmiany kolejnosći na zdefiniowanej liście graczy
  ```
  Dec 13 10:20:39 pi meet-app-staging[1924367]: 2025-12-13 10:20:39.045 [http-nio-8081-exec-4] INFO  p.f.m.p.PlayerListManagementService - Reordering members for player list 1 by user 47
  Dec 13 10:20:39 pi meet-app-staging[1924367]: 2025-12-13 10:20:39.087 [http-nio-8081-exec-4] WARN  p.f.m.p.PlayerListManagementService - Reorder request for list 1 has mismatched member IDs. Expected: [1, 2, 3, 4, 5], Got: [1, 2, 5, 6, 7]
  Dec 13 10:20:39 pi meet-app-staging[1924367]: 2025-12-13 10:20:39.095 [http-nio-8081-exec-4] WARN  p.f.m.config.GlobalExceptionHandler - Validation error: Member IDs in request don't match current list members

  I/flutter ( 5360): 11:22:57.588 [INFO] WebSocket: Reordering 5 members
  I/flutter ( 5360): 11:22:57.588 [INFO] WebSocket: Reordering 5 members in list: groupId=1, listId=1
  I/flutter ( 5360): 11:22:57.783 [SEVERE] WebSocket: Error reordering members: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360):   Error: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360): 11:22:57.783 [SEVERE] WebSocket: Error reordering members: Exception: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360):   Error: Exception: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360): 11:22:57.783 [SEVERE] WebSocket: Error reordering members: Exception: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
  I/flutter ( 5360):   Error: Exception: Failure.unknown(message: Exception: Invalid input data. Please check the required fields.)
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
  ```
  ```
- [ ] brak pull to refresh na liscie stałych graczy
- [ ] blad przy edycji listy z menu kontekstowego po edycji listy stałych graczy brak zmian listy (stare dane)
- [ ] usunięcie członka z grupy powinno usuwać go również z przygotowanych list graczy
- [ ] przy edycji serii wydarzen brak pola o wybranej liscie stalych graczy
- [ ] przy probie utworzenia szablonu wydarzen przekraczajacego liczbe slots+waitlist komunikat bledu unknown mimo ze pokazuje sie opis pod polem z prawdziwym powodem
- [ ] na ekranie developera autokorekta username
- [ ] brak możliwości wycofania żądania o dodanie do grupy
- [ ] po przelogowaniu na innego usera i wejsciu w zakładkę grupa - biały ekran
- [ ] brak opisu grupy po przejsciu w szczegoly - być może warto zablokować wejście jeżeli nie jest się członkiem -> tylko join request
- [ ] komunikat przy probie dodaniu osoby do grupy, ktora juz jest zbyt generyczny
  - backend wysyla: Invalid argument: User is already a member or has pending request
  - frontend: blad failed to add member
- [ ] brak polskich znakow w list name 
- [ ] potwierdzenie przez uczestnika obecnosci nie utworzylo powiadomienia dla organizatora

