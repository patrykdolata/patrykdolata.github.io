# 🎯 Cele Projektu i Mapa Drogowa — Meet App

> **Wizja:** Aplikacja uwalniająca organizatorów siatkówki od ręcznego zarządzania listami w Excelu/Messengerze, zapewniając pełną automatyzację zapisów.
> **Cel Główny:** Działający MVP (Organizator + Samoobsługa gracza) gotowy do wdrożenia do 31 grudnia 2025.

---

# 📊 Podsumowanie Zarządcze

| Metryka | Status |
| :--- | :--- |
| **Postęp M1 (MVP)** | ![Postęp](https://progress-bar.dev/87/?scale=100&title=Zrobione&width=120&color=2ecc71) **87%** |
| **Aktualna Faza** | **M1: MVP Organizatora + Samoobsługa** |
| **Najbliższy Termin** | **31.12.2025**  |
| **Główny Fokus** | Automatyzacja zapisów|

---

## 🚀 M1 — MVP Organizatora i Samoobsługa
**Termin:** Q4 2025
**Cel:** Organizator tworzy wydarzenie, wysyła link na grupę, a lista "robi się sama".

### ✅ Fundamenty Systemu
*Baza bezpieczeństwa i dostępności.*
- [x] **Bezpieczne Logowanie** `[MA-231]` – Rejestracja i autoryzacja dla organizatorów oraz graczy.
- [x] **Zarządzanie Profilem** `[MA-212]` – Podstawowe dane użytkownika i awatar.
- [x] **Środowisko testowe** `[MA-480]` – Serwer i baza danych gotowe do testowania online.

### ✅ Tworzenie i Odkrywanie
*Narzędzia do zarządzania ofertą wydarzeń.*
- [x] **Kreator Wydarzeń** `[MA-385]` `[MA-427]` – Szybkie tworzenie gier (czas, miejsce, limity miejsc).
- [x] **Interaktywna Mapa** `[MA-29]` `[MA-475]` – Wizualizacja wydarzeń na mapie.
- [x] **Cykl Życia Wydarzenia** `[MA-427]` `[MA-405]` – Edycja, odwoływanie i usuwanie przez organizatora.
- [x] **Ulubione Lokalizacje** `[MA-263]` – Szybki wybór sprawdzonych miejsc.

### 🟡 Automatyzacja Listy Obecności
*Serce systemu – koniec z ręcznym przepisywaniem list.*
- [x] **Ręczna Kontrola** `[MA-441]` – Organizator może ręcznie dodać/usunąć gracza.
- [x] **Samoobsługa Gracza**  `[MA-451]` – Użytkownik sam klika "Dołącz" lub "Zrezygnuj".
- [x] **Inteligentna Lista Rezerwowa** `[MA-443]` `[MA-494]` – Kolejka FIFO (kto pierwszy, ten lepszy).
- [x] **Auto-Uzupełnianie**  `[MA-495]` – System automatycznie wskazuje pierwszego z rezerwy, gdy zwolni się miejsce.

### ✅ Dystrybucja i Komunikacja
*Wykorzystanie zewnętrznych kanałów jako systemu powiadomień.*
- [x] **Udostępnianie (Deep Links)** `[MA-501]` – Przycisk "Udostępnij", generujący bezpośredni link do wydarzenia (`meetapp://event/{id}`).
- [x] **Integracja Społecznościowa** `[MA-501]` – Łatwe wysyłanie linku na Messenger/WhatsApp/SMS.
    > *Wartość biznesowa:* Zamiast budować system powiadomień w MVP, organizator wrzuca link na istniejącą grupę. Kliknięcie otwiera aplikację na konkretnym meczu.

### ✅ Operacje Cykliczne
*Oszczędność czasu przy stałych terminach.*
- [x] **Serie Treningowe**  `[MA-497]` – Generowanie 10 treningów w przód (np. "każdy wtorek") jednym kliknięciem.
- [x] **Zarządzanie Seriami** `[MA-498]` – Edycja pojedynczych wydarzeń w serii i widok szczegółów serii.
- [x] **Pulpit Organizatora** `[MA-407]` `[MA-414]` – Widok "Moje Wydarzenia" do szybkiego zarządzania nadchodzącymi grami.

### 👥 Grupy i Społeczności
- [x] **Stałe Grupy** `[MA-421]` – Tworzenie zamkniętych społeczności (np. "Wtorkowa Ekipa").
- [x] **Stała Lista Graczy** `[MA-502]` – Baza graczy przypisana do grupy dla szybkiego dodawania.
- [x] **Prywatność** `[MA-421]` – Wydarzenia widoczne tylko dla członków danej grupy.

### Stabilizacja wersji
- [ ] **Testy end to end**  
- [ ] **Poprawki** 
- [x] **Serwer produkcyjny**
- [ ] **Release 0.0.1**

---

## 🟡 M2 — Zaangażowanie, Powiadomienia i Narzędzia Zaawansowane
**Termin:** Q1 2026
**Cel:** Budowanie zaufania, komunikacja w czasie rzeczywistym i precyzyjna kontrola.

### 🟡 Natywne Powiadomienia 
*Kluczowe dla utrzymania tempa zapisów i informacji o zmianach.*
- [x] **Infrastruktura WebSocket** `[MA-534]` `[MA-538]` – Real-time komunikacja między serwerem a aplikacją mobilną.
- [x] **Powiadomienia o Awansie** `[MA-496]` – "Awansowałeś na listę główną!" po zwolnieniu miejsca.
- [ ] **Statusy Listy** `[MA-422]` – "Zwolniło się miejsce!" dla osób na liście rezerwowej.
- [ ] **Przypomnienia** `[MA-422]` – Automatyczny alert 24h przed meczem dla zapisanych graczy.
- [ ] **Alerty Zmian** `[MA-422]` – Natychmiastowe info o zmianie godziny, lokalizacji lub odwołaniu meczu.

### ⭐ System Reputacji 
*Budowanie zaufania i eliminacja "no-show".*
- [ ] **Śledzenie Obecności (No-Show)** `[BACKLOG]` – Organizator oznacza, czy zapisany gracz faktycznie się pojawił.
- [ ] **Ocena Wiarygodności** `[BACKLOG]` – Wskaźnik R-Score widoczny przy profilu gracza (np. % obecności).
- [ ] **Kary za Nieobecność** `[BACKLOG]` – Automatyczna blokada zapisów lub niższy priorytet dla notorycznych "wagarowiczów".

### 🔒 Zaawansowane Zarządzanie Listą
- [ ] **Priorytetyzacja** `[BACKLOG]` – Ręczne przesuwanie graczy (Awans/Degradacja) przez organizatora.
- [ ] **Drag & Drop** `[BACKLOG]` – Łatwa zmiana kolejności na liście metodą przeciągnij i upuść.
- [ ] **Historia Gier** `[BACKLOG]` – Wgląd w historię aktywności gracza i organizatora.

### 📅 Inteligentny Kalendarz
- [ ] **Zaawansowane Serie** `[MA-445]` – Pomijanie świąt, cykle miesięczne.
- [ ] **Widok Kalendarza** `[BACKLOG]` – Graficzne przedstawienie nadchodzących gier w miesiącu.

---

## 🟢 M3 — Skalowanie
**Termin:** Q2 2026
**Cel:** Płatności, analityka i pełna zgodność prawna.

### 💸 Finanse
- [ ] **Statusy Płatności** `[MA-197]` – Oznaczanie przez organizatora kto zapłacił (gotówka/przelew).
- [ ] **Płatności Online** `[BACKLOG]` – Integracja z bramką płatniczą (BLIK/Karta) wewnątrz aplikacji.
- [ ] **Polityka Zwrotów** `[BACKLOG]` – Automatyzacja zwrotów przy rezygnacji w terminie.

### 📈 Dane i Bezpieczeństwo
- [ ] **Analityka** `[MA-423]` – Raporty obłożenia, frekwencji i trendów.
- [ ] **Zgodność RODO** `[BACKLOG]` – Eksport i anonimizacja danych użytkowników.
- [ ] **Audyt Bezpieczeństwa** `[BACKLOG]` – Testy penetracyjne przed szeroką publikacją.

---

## 🏷️ Legenda

*   `[MA-xxx]` – Numer zadania w Jira (gotowe do realizacji lub w trakcie).
*   `[BACKLOG]` – Funkcja zaplanowana, wymagająca utworzenia zadań w Jira.
*   ✅ **Zakończone** – Funkcja wdrożona.
*   🟡 **W Trakcie** – Prace trwają.
*   🔴 **Do Zrobienia** – Najbliższy priorytet.
