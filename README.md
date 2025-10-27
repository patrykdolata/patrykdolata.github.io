# Meet App - Interactive HTML/CSS/JS Mockups

Interaktywne makiety aplikacji Meet App stworzone w HTML, CSS i JavaScript. Projekt zawiera wszystkie główne ekrany z aplikacji mobilnej Flutter oraz backendu Spring Boot.

## 📋 Spis treści

- [Opis projektu](#opis-projektu)
- [Funkcjonalności](#funkcjonalności)
- [Struktura projektu](#struktura-projektu)
- [Ekrany](#ekrany)
- [Instalacja](#instalacja)
- [Użycie](#użycie)
- [Technologie](#technologie)
- [Mock Data](#mock-data)

## 🎯 Opis projektu

Meet App to aplikacja do odkrywania i organizowania wydarzeń siatkówki. Te makiety HTML/CSS/JS odwzorowują wszystkie funkcjonalności aplikacji mobilnej Flutter i backendu Spring Boot, prezentując pełny user flow w formie klikalnego prototypu.

**Bazowane na:**
- Frontend: `../meet-app-fe` (Flutter)
- Backend: `../meet-app-be` (Spring Boot + PostgreSQL)

## ✨ Funkcjonalności

### Zaimplementowane funkcje:
- ✅ Interaktywna mapa z markerami wydarzeń (Leaflet.js)
- ✅ System autentykacji (login/register)
- ✅ Szczegółowe widoki wydarzeń
- ✅ Tworzenie nowych wydarzeń (formularz z walidacją)
- ✅ Profile użytkowników z systemem ocen
- ✅ Ulubione lokalizacje
- ✅ Filtrowanie wydarzeń (poziom, cena, sloty)
- ✅ System poziomów umiejętności (0-10)
- ✅ Informacje o grupach siatkówki
- ✅ Przełączanie języka (EN/PL)
- ✅ Responsywny design
- ✅ Design system zgodny z aplikacją Flutter

## 📁 Struktura projektu

```
meet-app-mockups/
├── index.html                  # Główne menu nawigacyjne
├── README.md                   # Dokumentacja
├── css/
│   ├── design-system.css      # Design system (kolory, typografia, spacing)
│   └── components.css         # Komponenty UI (buttony, karty, formularze)
├── js/
│   ├── app.js                 # Główna logika (routing, state management)
│   └── mock-data.js           # Mockowe dane (eventy, użytkownicy, lokalizacje)
├── screens/
│   ├── map-home.html          # Mapa z wydarzeniami
│   ├── auth-panel.html        # Login/rejestracja + ulubione
│   ├── event-details.html     # Szczegóły wydarzenia
│   ├── create-event.html      # Tworzenie wydarzenia
│   ├── user-profile.html      # Profil użytkownika
│   ├── skill-levels.html      # Poziomy umiejętności
│   └── group-info.html        # Informacje o grupach
└── assets/
    ├── images/                # Ikony, obrazy
    └── data/                  # Dodatkowe dane JSON
```

## 📱 Ekrany

### 1. **Główne menu** (`index.html`)
- Landing page z nawigacją do wszystkich ekranów
- Przełącznik języka (EN/PL)
- Hero section z CTA buttons

### 2. **Mapa i Wydarzenia** (`screens/map-home.html`)
- Interaktywna mapa Poznania (Leaflet.js)
- Markery wydarzeń z pop-upami
- Panel filtrów (poziom, cena, sloty)
- Lista wydarzeń (wysuwalny panel)
- Real-time updates simulation

### 3. **Panel Uwierzytelniania** (`screens/auth-panel.html`)
- Formularze login/rejestracja
- Zakładki przełączające między trybami
- Walidacja pól formularza
- Sekcja z ulubionymi lokalizacjami
- Wyświetlanie informacji o zalogowanym użytkowniku

### 4. **Szczegóły Wydarzenia** (`screens/event-details.html`)
- Pełne informacje o wydarzeniu
- Mini-mapa z lokalizacją
- Informacje o organizatorze (klikalne)
- Wskaźnik dostępnych slotów
- Poziom umiejętności (wizualizacja)
- Przycisk "Join Event"
- Dodawanie do ulubionych

### 5. **Tworzenie Wydarzenia** (`screens/create-event.html`)
- Wielosekcyjny formularz
- Walidacja w czasie rzeczywistym
- Suwak poziomu umiejętności z wizualizacją
- Wyszukiwarka lokalizacji z dropdown
- Quick select buttons (czas trwania)
- Licznik znaków dla opisu
- Preview ceny (PLN)

### 6. **Profil Użytkownika** (`screens/user-profile.html`)
- Informacje o użytkowniku
- System ocen (thumbs up/down)
- Wizualizacja procentowa ratingu
- Lista wydarzeń organizowanych przez użytkownika
- Avatar z inicjałami
- Link do profilu Facebook

### 7. **Poziomy Umiejętności** (`screens/skill-levels.html`)
- Opis systemu poziomów 0-10
- 6 kategorii umiejętności:
  - Atakowanie
  - Rozgrywanie
  - Blokowanie
  - Podania
  - Przyjęcie
  - Zagrywka
- Szczegółowe opisy dla każdego poziomu
- Hero banner z tłem
- Skala interpretacji (Beginner/Intermediate/Advanced/Professional)

### 8. **Informacje o Grupach** (`screens/group-info.html`)
- Lista grup siatkówki w Poznaniu
- Statystyki grup (członkowie, wydarzenia)
- Linki do stron Facebook
- Sekcja "Why Join a Group?" z benefitami
- Przewodnik "How It Works"
- CTA do przeglądania/tworzenia wydarzeń

## 🚀 Instalacja

1. **Sklonuj repozytorium lub skopiuj katalog:**
   ```bash
   cd meet-app-mockups
   ```

2. **Otwórz w przeglądarce:**
   - Nie wymaga serwera - wystarczy otworzyć `index.html` w przeglądarce
   - Lub użyj prostego serwera HTTP:
   ```bash
   python -m http.server 8000
   # Otwórz http://localhost:8000
   ```

3. **Live Server (VS Code):**
   - Zainstaluj rozszerzenie "Live Server"
   - Kliknij prawym na `index.html` → "Open with Live Server"

## 💡 Użycie

### Demo konta testowe:
```
Email: user@example.com
Password: dowolne hasło (mock authentication)
```

### Nawigacja:
1. Rozpocznij od `index.html` - główne menu
2. Kliknij dowolny ekran aby go zobaczyć
3. Użyj przycisków "Back" lub nawigacji w app bar
4. Przełączaj język przyciskami EN/PL

### Testowanie funkcji:
- **Login:** Użyj email z mock data (np. `user@example.com`)
- **Mapa:** Kliknij markery aby zobaczyć wydarzenia
- **Filtrowanie:** Użyj panelu filtrów na mapie
- **Tworzenie wydarzenia:** Wypełnij formularz (wymaga logowania)
- **Ulubione:** Dodaj lokalizacje do ulubionych (wymaga logowania)

## 🛠 Technologie

### Frontend:
- **HTML5** - Semantyczny markup
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - Bez frameworków
- **Leaflet.js** - Interaktywne mapy (v1.9.4)

### Design System:
- CSS Custom Properties (zmienne CSS)
- Komponenty wielokrotnego użytku
- Mobile-first responsive design
- Accessibility best practices

### Źródła danych:
- Mock data w JavaScript
- LocalStorage dla stanu aplikacji
- SessionStorage dla parametrów nawigacji

## 📊 Mock Data

### Wydarzenia (`events`)
- 6 przykładowych wydarzeń siatkówki
- Lokalizacje w Poznaniu
- Różne poziomy umiejętności (2-9)
- Różne ceny (0-30 PLN)
- Dostępność slotów

### Użytkownicy (`users`)
- 4 użytkowników testowych
- Role: USER, ADMIN, MANAGER
- System ocen (thumbs up/down)
- Linki do profili Facebook

### Lokalizacje (`locations`)
- 6 lokalizacji w Poznaniu:
  - Hala Sportowa Malta
  - AWF Poznań
  - Orlik Grunwald
  - Arena Poznań
  - Park Cytadela
  - Hala MOSiR Chwiałka

### Grupy (`groups`)
- 3 grupy siatkówki w Poznaniu
- Rozszerzone informacje w `group-info.html` (6 grup)

## 🌍 Wielojęzyczność

Aplikacja wspiera 2 języki:
- **Angielski (EN)** - domyślny
- **Polski (PL)**

Przełączanie języka:
- Fixed button w prawym górnym rogu
- Zapisywany w localStorage
- Przeładowuje stronę aby zastosować zmiany

## 🎨 Design System

### Kolory:
- **Primary:** #2196F3 (niebieski)
- **Secondary:** #FF5722 (pomarańczowy)
- **Success:** #4CAF50 (zielony)
- **Error:** #F44336 (czerwony)
- **Warning:** #FF9800 (pomarańczowy-ciemny)

### Typografia:
- Font family: System fonts stack
- Rozmiary: 12px - 36px (8 poziomów)
- Wagi: 300, 400, 500, 600, 700

### Spacing:
- Bazowa jednostka: 4px
- Skala: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px

### Komponenty:
- Buttons (5 wariantów)
- Text fields
- Cards
- Chips
- Avatars
- Loading spinners
- Snackbars

## 📝 Notatki

### Różnice od aplikacji produkcyjnej:
- Mock authentication (brak prawdziwej weryfikacji)
- Brak rzeczywistych API calls
- Symulowane real-time updates
- Brak persystencji danych (poza localStorage)
- Uproszczona walidacja formularzy

### Przyszłe ulepszenia:
- Dodanie więcej animacji i transycji
- Implementacja WebSocket simulation
- Więcej mock data
- Dark mode
- PWA capabilities
- Service Worker dla offline support

## 📄 Licencja

Projekt stworzony jako interaktywna makieta aplikacji Meet App.
Bazuje na kodzie z projektów `meet-app-fe` i `meet-app-be`.

---

**Utworzono:** 2025-10-27
**Wersja:** 1.0.0
**Autor:** Meet App Team
