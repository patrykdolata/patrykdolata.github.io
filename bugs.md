# features
- [ ] dodanie komunikatow/powodow odrzucenia 
- [ ] select all dla innych list graczy
- [ ] na ekranie lista graczy powinny byc miniaturki avatarow w jednym wierszu na chodzace na siebie wszystkich czlonkow
- [ ] możliwość oznaczania w tekstach uzytkowników przez @login
- [ ] przerobic mail na resend

# bugs
## critical

## medium
- [ ] usunięcie członka z grupy powinno usuwać go również z przygotowanych list graczy

## low
- [ ] po rozpoczęciu bulk action na ekranie szczegółów grupy remove icon jest overflowedby 1.7 px
- [ ] po anulowaniu wydarzenia i wejsciu w jego szczegoly przez powiadomienie nadal widnieje przycisk "Anuluj wydarzenie", prawidłowo jest ukrywany wchodząc przez historie - ujednolicić
- [ ] po anulowaniu wydarzenia uczestnik, może zrobić leave oraz join event
- [ ] utworzenie listy graczy o tej samej nazwie powoduje generyczny blad na UI -> powinien byc konkrety powod bledu
- [ ] komunikat przy probie dodaniu osoby do grupy, ktora juz jest zbyt generyczny
  - backend wysyla: Invalid argument: User is already a member or has pending request
  - frontend: blad failed to add member
- [ ] przy probie usuniecia wydarzenia z graczami generyczny blad zamiast konkretu:  Invalid state: Cannot delete event with participants. Cancel the event instead.
- [ ] przy probie utworzenia szablonu wydarzen przekraczajacego liczbe slots+waitlist komunikat bledu unknown mimo ze pokazuje sie opis pod polem z prawdziwym powodem
- [ ] brak opisu grupy po przejsciu w szczegoly - być może warto zablokować wejście jeżeli nie jest się członkiem -> tylko join request
- [ ] deeplink -> aby dolaczyc musisz sie zalogowac -> po zalogowaniu powrot do mapy a nie wydarzenia
- [ ] wejscie do aplikacji przez niezalogowanego usera pokazuje czlonkow wydarzenia - rodo?
- [ ] na ekranie dodawania gracza do wydarzenia nazwa wybranego jest ucieta
- [ ] klikniecie w wybrana propozycje autocomplete nie chowa comboboxa
- [ ] kropka przy profile nie odswieza sie sama po websocket notification, musze przejsc na inny ekran
- [ ] brak możliwości wycofania żądania o dodanie do grupy
- [ ] po dołączeniu do wydarzenia liczba graczy nie zmienila sie w naglowku szczegolow wydarzenia, poprawnie zmienila sie w naglowku participants list, nawet pull to refresh nie odswieza tej wartosci, dopiero wyjscie i ponowne wejscie naprawia ten blad, to samo przy dolaczeniu innej osoby podczas ogladania szczegolow wydarzenia
- [ ] po autocomplete tagi z waitlist nie odswiezaja sie prawidlowo na liscie wydarzen oraz na szczegolach wydarzen
- [ ] markery na mapie nieprawidłowo się zachowują przy oddalaniu mapy
