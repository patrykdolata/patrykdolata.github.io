# features
- dodanie komunikatow/powodow odrzucenia 
- na ekranie lista graczy powinny byc miniaturki avatarow w jednym wierszu na chodzace na siebie wszystkich czlonkow
- możliwość oznaczania w tekstach uzytkowników przez @login
- sprawdzenie limitow rejestracji
- przeglądanie profili graczy

# bugs
## critical
- brak powiadomienia push o dolaczeniu do wydarzenia z serii

## medium
- promote to organizer nie dziala prawidlowo, po promocji uzytkownik wciaz nie moze robic wydarzen, ani serii wydarzen
- tworzenie konta -> login wielkosc znakow powinna byc toLowerCase
- w przypadku odwolania wydarzenia goscie powinni dostac email oraz info na status www
- komunikaty bledow po angielsku na www
- FAB czasem nie wraca na swoja pozycje
- na androidzie po dluzszej przerwie i wlaczeniu aplikacji jest duzo komunikatow o braku polaczenia z serwerem
- brak implementacji linków dla 
- gracz nie widzi wydarzenia z serii bez pofiltrowania po grupie
- bardzo długie mielenie po kliknieciu na zcentruj mape (problemem jest szukanie GPS)
- dlugie generowanie serii wydarzen gdy sa wysylane pushe ( wybrana grupa dla serii)
- gdy anuluje wydarzenie z serii dostaje kilka snackbarow (prawdopodobnie per kazde wydarzenie w serii)
- blad przy probie otworzenia anulowanego wydarzenia z serii z ekranu powiadomien

## low
- edycja grupy powinna wysylac powiadomienie websocket odswiezajacy ekran grup
- kod statusu weryfikacji pozycji dla goscia powinien automatycznie byc przekazywany przy kliknieciu na przycisk sprawdz status w email
- username na formularzu rejestracyjnym to login w bazie danych
- po przelogowaniu się na innego usera, kropka przy profile wskazujaca nieprzeczytane powiadomienia nie aktualizuje sie
- zakladka joined powinna byc pierwsza na ekranie groups
- przy probie dodania osoby do grupy, ktora nie istnieje brak tlumaczenia bledu
- klikniecie w push powinno przeniesc na odopwiedni ekran
- markery na mapie nieprawidłowo się zachowują przy oddalaniu mapy
- brak tlumaczenia dla bledu max group members
- przy logowaniu brakuje walidacji email na front
- po stworzeniu grupy i przejsciu na listę wydarzeń dopiero po odświeżeniu grupa została wybrana
- brak cofawnia sie FAB czasami
- czy usunąć RSVP i Payment deadline
- przy dodawaniu czlonka do listy w wydarzeniu automatyczne wielkie litery i jest login zamiast email
- przy utworzeniu wydarzenia z serii brak snackbard na android
- wejscie do aplikacji przez niezalogowanego usera pokazuje czlonkow wydarzenia - rodo?
