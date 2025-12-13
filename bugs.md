# features
- [ ] przy zaznaczaniu bulk powinna byc zablokowana opcja rozwijania akcji per osoba
- [ ] możliwość zamknięcia snackbar krzyżykiem
- [ ] dodanie komunikatow/powodow odrzucenia 
- [ ] select all dla innych list graczy
- [ ] na ekranie lista graczy powinny byc miniaturki avatarow w jednym wierszu na chodzace na siebie wszystkich czlonkow
- [ ] możliwość oznaczania w tekstach uzytkowników przez @login
- [ ] możliwość określania orgaznizatora dodatkowego

# bugs
## critical
- [x] usunięcie z listy uczestnikow wydarzenia nie dziala, sam również nie mogę opusić wydarzenia
- [x] tworzone wydarzenia z serii wydarzen maja godzine przesuniętą względem zaplanowanej
- [x] brak wpisu w powiadomieniach o anulowaniu wydarzenia
- [x] brak powiadomienia o osobie oczekującej na dołączenie do listy
- [x] długi freeze przy akceptacji prosby o dołęcznie z web

## medium
- [ ] blad przy edycji listy z menu kontekstowego po edycji listy stałych graczy brak zmian listy (stare dane) - nie ma nic w logach rowniez
- [ ] przy edycji serii wydarzen brak pola o wybranej liscie stalych graczy
- [ ] potwierdzenie przez uczestnika obecnosci nie utworzylo powiadomienia dla organizatora, nie ma rowniez odswiezania szczegolow wydarzenia po websocket dla tego zdarzenia

## low
- [ ] utworzenie listy graczy o tej samej nazwie powoduje generyczny blad na UI -> powinien byc konkrety powod bledu
- [ ] wejscie do aplikacji przez niezalogowanego usera pokazuje czlonkow wydarzenia - rodo?
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

