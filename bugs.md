# features
- [ ] przy zaznaczaniu bulk powinna byc zablokowana opcja rozwijania akcji per osoba
- [ ] możliwość zamknięcia snackbar krzyżykiem
- [ ] dodanie komunikatow/powodow odrzucenia 
- [ ] select all dla innych list graczy
- [ ] na ekranie lista graczy powinny byc miniaturki avatarow w jednym wierszu na chodzace na siebie wszystkich czlonkow
- [ ] możliwość oznaczania w tekstach uzytkowników przez @login
- [ ] przerobic mail na resend

# bugs
## critical
- [ ] brak nickname przy rejestracji powoduje konta z pustymi danymi

## medium
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

