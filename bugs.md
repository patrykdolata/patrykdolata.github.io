# features
- dodanie komunikatow/powodow odrzucenia 
- na ekranie lista graczy powinny byc miniaturki avatarow w jednym wierszu na chodzace na siebie wszystkich czlonkow
- możliwość oznaczania w tekstach uzytkowników przez @login
- sprawdzenie limitow rejestracji
- przeglądanie profili graczy

# bugs
## critical
- zapraszanie gosci na rezerwe, mail z akceptacja nie mowi ze jest na rezerwie
- powiadomienia dla zmian w utworzonym wydarzeniu nie dzialaja
  - gracz potwierdza obecnosc
  - gracz opuszcza wydarzenia
- nie mozna zedytowac juz raz edytowanego wydarzenia
- zostaja jakies nieprzeczytane powiadomienia
- blad dolaczania do grupy z ekranu szczegolow wydarzen
- problemy z invite links
- brak zabezpieczenia przy tworzeniu grupy dla nie organizatora
- brak powiadomienia push o dolaczeniu do wydarzenia z serii
- mapa nie odswieza sie automatycznie

## medium
- powiadomienie mailowe dla gościa, który został przesunięty z rezerwy na liste główną
- usuniecie gościa z listy wydarzenia powinno wyslac mu email
- promote to organizer nie dziala prawidlowo, po promocji uzytkownik wciaz nie moze robic wydarzen, ani serii wydarzen
- nie powinno byc invite links dla publicznej grupy
- tworzenie konta -> login wielkosc znakow powinna byc toLowerCase
- w przypadku odwolania wydarzenia goscie powinni dostac email oraz info na status www
- komunikaty bledow po angielsku na www
- FAB czasem nie wraca na swoja pozycje
- na androidzie po dluzszej przerwie i wlaczeniu aplikacji jest duzo komunikatow o braku polaczenia z serwerem
- brak możliwości dołączenia do grupy z ekranu szczegółów grupy
- brak implementacji linków dla 
- gracz nie widzi wydarzenia z serii bez pofiltrowania po grupie

## low
- kod statusu weryfikacji pozycji dla goscia powinien automatycznie byc przekazywany przy kliknieciu na przycisk sprawdz status w email
- username na formularzu rejestracyjnym to login w bazie danych
- po przelogowaniu się na innego usera, kropka przy profile wskazujaca nieprzeczytane powiadomienia nie aktualizuje sie
- zakladka joined powinna byc pierwsza na ekranie groups
- bardzo długie mielenie po kliknieciu na zcentruj mape (problemem jest szukanie GPS)
- przy probie doddania osoby do grupy, ktora nie istnieje brak tlumaczenia bledu
- klikniecie w push powinno przeniesc na odopwiedni ekran
- markery na mapie nieprawidłowo się zachowują przy oddalaniu mapy
- wejscie do aplikacji przez niezalogowanego usera pokazuje czlonkow wydarzenia - rodo?
- brak tlumaczenia dla bledu max group members
- przy logowaniu brakuje walidacji email na front
- po stworzeniu grupy i przejsciu na listę wydarzeń dopiero po odświeżeniu grupa została wybrana
- brak cofawnia sie FAB czasami
- brak automatycznego odswiezenia list grup bo dolaczeniu gracza
- poprawic w bazie (uzupełnij)
- czy usunąć RSVP i Payment deadline
- przy dodawaniu czlonka do listy w wydarzeniu automatyczne wielkie litery i jest login zamiast email
- przy utworzeniu wydarzenia z serii brak snackbard na android
