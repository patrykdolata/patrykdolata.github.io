# 🎯 Cele Projektu i Mapa Drogowa — Meet App

> **Wizja:** Aplikacja uwalniająca organizatorów siatkówki od ręcznego zarządzania listami w Excelu/Messengerze, zapewniając pełną automatyzację zapisów.
> **Cel Główny:** Działający MVP (Organizator + Samoobsługa gracza) gotowy do wdrożenia do 31 grudnia 2025.

---

# 📊 Podsumowanie Zarządcze

| Metryka | Status |
| :--- | :--- |
| **Postęp M2** | ![Postęp](https://progress-bar.dev/40/?scale=30&title=W%20trakcie&width=120&color=3498db) **40%** |
| **Aktualna Faza** | **M2: Viralność, Powiadomienia i Feedback** |
| **Ostatni Release** |  08.12.2025 |
| **Najbliższy Termin** | Q1 2026 |
| **Cel** | Push notifications i onboarding|

---

## ✅ M1 — MVP Organizatora i Samoobsługa
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

### ✅ Historia Wydarzeń
*Dostęp do zakończonych wydarzeń i rozliczenia płatności.*
- [x] **Przegląd Historii** – Lista zakończonych i anulowanych wydarzeń użytkownika.
- [x] **Dwie Perspektywy** – Podział na zakładki "Organizowane" i "Uczestnictwo".
- [x] **Rozliczenia Płatności**  – Organizator widzi status płatności uczestników.

### ✅ Stabilizacja i Release
- [x] **Testy end-to-end** – Kompleksowa walidacja przed wypuszczeniem.
- [x] **Poprawki bugów** – Stabilizacja przed pierwszym releasem.
- [x] **Serwer produkcyjny** – Infrastruktura gotowa do testów.
- [x] **Release 0.0.1** – Wersja wypuszczona do grona testerskiego (grudzień 2025).

**Status:** M1 ukończone w 100%. Aplikacja działa u testerów, zbierany feedback.

---

## 🟡 M2 — Viralność, Powiadomienia i Feedback
**Termin:** Q1 2026
**Cel:** Maksymalizacja konwersji nowych użytkowników, retencja istniejących, zbieranie feedbacku.

### 🔴 Onboarding i Konwersja (PRIORYTET)
*Redukcja friction dla nowych użytkowników z deep links.*
- [ ] **Web Landing Page** `[BACKLOG]` – Strona meetapp.pl/event/{id} dla userów bez aplikacji (widok wydarzenia + CTA pobierz).
- [ ] **Social Login** `[BACKLOG]` – Szybkie logowanie przez Google i Apple (1 klik).
- [ ] **Open Graph Meta** `[BACKLOG]` – Podgląd wydarzenia w Messenger/WhatsApp przed kliknięciem linku.

### 🟡 Push Notifications (PRIORYTET)
*Kluczowe dla retencji i redukcji no-shows.*
- [x] **FCM/APNs Integration** `[ZROBIONE]` – Device tokens, routing notyfikacji, infrastruktura push na iOS i Android.
- [x] **Przypomnienia** `[ZROBIONE]` – Automatyczne alerty 24h i 2h przed wydarzeniem (scheduled tasks).
- [x] **RSVP Deadline** `[ZROBIONE]` – Terminy zapisów na wydarzenia z przypomnieniami.
- [x] **Payment Deadline** `[ZROBIONE]` – Terminy płatności z notyfikacjami.
- [ ] **Alerty Zmian** `[MA-422]` – Natychmiastowe info o zmianie godziny, lokalizacji lub odwołaniu (w trakcie).
- [x] **Awans z Rezerwy** `[MA-496]` – Push "Awansowałeś na listę główną!" (done w M1).
- [x] **Statusy Listy** `[ZROBIONE]` – Notyfikacje o dodaniu/usunięciu uczestników (PARTICIPANT_ADDED/REMOVED).

### 🟡 Real-time (częściowo done)
*Komunikacja w czasie rzeczywistym w aplikacji.*
- [x] **Infrastruktura WebSocket** `[MA-534]` `[MA-538]` – Real-time między serwerem a aplikacją.
- [x] **Powiadomienia o Awansie** `[MA-496]` – In-app notification po awansie z rezerwy.

### 🟢 Zaawansowane Zarządzanie (częściowo z M3)
*Funkcje przeniesione z M3 ze względu na priorytet.*
- [x] **Reordering Participants** `[ZROBIONE]` – Zmiana kolejności uczestników wydarzenia (backend + frontend).
- [x] **Reordering Group Members** `[ZROBIONE]` – Zarządzanie kolejnością członków grupy.
- [x] **Core Players Statistics** `[ZROBIONE]` – Statystyki i analityka głównych graczy.
- [x] **Batch Event Series** `[ZROBIONE]` – Operacje batch na seriach wydarzeń.

### 📣 Feature Requests
*Zbieranie pomysłów od użytkowników i budowanie społeczności.*
- [ ] **Zgłaszanie Pomysłów** `[BACKLOG]` – Formularz do zgłaszania feature requestów.
- [ ] **Głosowanie** `[BACKLOG]` – Użytkownicy mogą lajkować pomysły innych.
- [ ] **Lista Pomysłów** `[BACKLOG]` – Przeglądanie zgłoszonych requestów z sortowaniem po głosach.
- [ ] **Status Realizacji** `[BACKLOG]` – Oznaczanie: nowy, w planach, w realizacji, zrobione.
- [ ] **Publiczny Roadmap** `[BACKLOG]` – Widoczność co jest planowane dla użytkowników.

### 🛠️ Stabilność i Jakość
*Zapewnienie niezawodności aplikacji.*
- [ ] **Raportowanie Błędów** `[BACKLOG]` – Crashlytics/Sentry - automatyczne wykrywanie crashów.
- [ ] **Analityka Konwersji** `[BACKLOG]` – Śledzenie: deep link → instalacja → rejestracja → dołączenie.

### ⚪ Nice-to-have
*Niższy priorytet - jeśli starczy czasu.*
- [ ] **Magic Link** `[BACKLOG]` – Logowanie bez hasła przez link w emailu.
- [ ] **Drag & Drop Lista** `[BACKLOG]` – Przeciąganie uczestników na liście.

### ✅ Stabilizacja i Release
- [ ] **Refactor kodu** - Czyszczenie kodu, uzupełnienie testów automatycznych.
- [ ] **Testy end-to-end** – Kompleksowa walidacja przed wypuszczeniem.
- [ ] **Poprawki bugów** – Stabilizacja przed releasem.
- [ ] **Serwer produkcyjny** – Infrastruktura gotowa do testów.
- [ ] **Release 0.0.2** – Wersja wypuszczona do grona testerskiego.
---

## 🟢 M3 — Reputacja, Skalowanie i Zaawansowane Narzędzia
**Termin:** Q2 2026
**Cel:** Budowanie zaufania, zaawansowane zarządzanie, płatności.

### ⭐ System Reputacji
*Budowanie zaufania i eliminacja no-shows.*
- [ ] **Śledzenie Obecności** `[BACKLOG]` – Organizator oznacza, czy zapisany gracz faktycznie się pojawił.
- [ ] **R-Score** `[BACKLOG]` – Wskaźnik wiarygodności widoczny przy profilu gracza (% obecności).
- [ ] **Kary za No-Show** `[BACKLOG]` – Niższy priorytet lub blokada dla notorycznych "wagarowiczów".
- [ ] **Rozszerzona Historia** `[BACKLOG]` – Statystyki aktywności gracza (ulubione sporty, częstotliwość).

### 📅 Inteligentny Kalendarz
- [ ] **Zaawansowane Serie** `[MA-445]` – Pomijanie świąt, cykle miesięczne.
- [ ] **Widok Kalendarza** `[BACKLOG]` – Graficzne przedstawienie nadchodzących gier.

### 💸 Finanse
- [ ] **Statusy Płatności** `[MA-197]` – Oznaczanie kto zapłacił (gotówka/przelew).
- [ ] **Płatności Online** `[BACKLOG]` – Integracja z BLIK/Kartą wewnątrz aplikacji.
- [ ] **Polityka Zwrotów** `[BACKLOG]` – Automatyczne zwroty przy rezygnacji w terminie.

### 📈 Analityka Organizatora
- [ ] **Raporty** `[MA-423]` – Obłożenie, frekwencja, trendy.
- [ ] **Eksport Danych** `[BACKLOG]` – CSV/Excel z listą uczestników.

### ✅ Stabilizacja i Release
- [ ] **Refactor kodu** - Czyszczenie kodu, uzupełnienie testów automatycznych.
- [ ] **Testy end-to-end** – Kompleksowa walidacja przed wypuszczeniem.
- [ ] **Poprawki bugów** – Stabilizacja przed releasem.
- [ ] **Serwer produkcyjny** – Infrastruktura gotowa do testów.
- [ ] **Release 0.0.3** – Wersja wypuszczona do grona testerskiego.
---

## 🔵 M4 — Optymalizacja, Zgodność i Polish
**Termin:** Q3 2026
**Cel:** Offline mode, RODO, optymalizacje wydajności.

### 📱 Praca Offline
*Dostępność aplikacji bez połączenia z internetem.*
- [ ] **Tryb Offline** `[BACKLOG]` – Przeglądanie zapisanych wydarzeń bez internetu.
- [ ] **Synchronizacja** `[BACKLOG]` – Auto-sync po przywróceniu połączenia.
- [ ] **Cache** `[BACKLOG]` – Cachowanie danych dla płynniejszego działania.

### 🔐 Zgodność i Bezpieczeństwo
- [ ] **Zgodność RODO** `[BACKLOG]` – Eksport i anonimizacja danych użytkowników.
- [ ] **Audyt Bezpieczeństwa** `[BACKLOG]` – Testy penetracyjne przed szeroką publikacją.
- [ ] **Usuwanie Konta** `[BACKLOG]` – Pełne usunięcie danych na żądanie użytkownika.

### 🛠️ Developer Experience
- [ ] **Zdalna Konfiguracja** `[BACKLOG]` – Feature flags bez aktualizacji w sklepie.
- [ ] **Panel Logów** `[BACKLOG]` – Narzędzie do przeglądania logów produkcyjnych.
- [ ] **A/B Testing** `[BACKLOG]` – Testowanie wariantów UI.

### ✅ Stabilizacja i Release
- [ ] **Refactor kodu** - Czyszczenie kodu, uzupełnienie testów automatycznych.
- [ ] **Testy end-to-end** – Kompleksowa walidacja przed wypuszczeniem.
- [ ] **Poprawki bugów** – Stabilizacja przed releasem.
- [ ] **Serwer produkcyjny** – Infrastruktura gotowa do testów.
- [ ] **Release 0.0.4** – Wersja wypuszczona do grona testerskiego.
---

## 🏷️ Legenda

*   `[MA-xxx]` – Numer zadania w Jira (gotowe do realizacji lub w trakcie).
*   `[BACKLOG]` – Funkcja zaplanowana, wymagająca utworzenia zadań w Jira.
*   ✅ **Zakończone** – Funkcja wdrożona.
*   🟡 **W Trakcie** – Prace trwają.
*   🔴 **Do Zrobienia** – Najbliższy priorytet.
