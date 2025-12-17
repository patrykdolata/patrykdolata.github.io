# features
- [ ] przy zaznaczaniu bulk powinna byc zablokowana opcja rozwijania akcji per osoba
- [ ] dodanie komunikatow/powodow odrzucenia 
- [ ] select all dla innych list graczy
- [ ] na ekranie lista graczy powinny byc miniaturki avatarow w jednym wierszu na chodzace na siebie wszystkich czlonkow
- [ ] możliwość oznaczania w tekstach uzytkowników przez @login
- [ ] przerobic mail na resend

# bugs
## critical
- [ ] po cancel wydarzenia i zostaniu na ekranie listy wywalilo aplikacje

## medium

## low
- [ ] utworzenie listy graczy o tej samej nazwie powoduje generyczny blad na UI -> powinien byc konkrety powod bledu
- [ ] komunikat przy probie dodaniu osoby do grupy, ktora juz jest zbyt generyczny
  - backend wysyla: Invalid argument: User is already a member or has pending request
  - frontend: blad failed to add member
- [ ] przy probie usuniecia wydarzenia z graczami generyczny blad zamiast konkretu:  Invalid state: Cannot delete event with participants. Cancel the event instead.
- [ ] przy probie utworzenia szablonu wydarzen przekraczajacego liczbe slots+waitlist komunikat bledu unknown mimo ze pokazuje sie opis pod polem z prawdziwym powodem
- [ ] po przelogowaniu na innego usera i wejsciu w zakładkę grupa - biały ekran
- [ ] brak opisu grupy po przejsciu w szczegoly - być może warto zablokować wejście jeżeli nie jest się członkiem -> tylko join request
- [ ] deeplink -> aby dolaczyc musisz sie zalogowac -> po zalogowaniu powrot do mapy a nie wydarzenia
- [ ] usunięcie członka z grupy powinno usuwać go również z przygotowanych list graczy
- [ ] wejscie do aplikacji przez niezalogowanego usera pokazuje czlonkow wydarzenia - rodo?
- [ ] brak możliwości wycofania żądania o dodanie do grupy
- [ ] markery na mapie nieprawidłowo się zachowują przy oddalaniu mapy
