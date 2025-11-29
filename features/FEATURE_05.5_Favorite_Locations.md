# Feature 05.5: Favorite Locations

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M1 (MVP) |
| **Priority** | MEDIUM |
| **Status** | ✅ Complete |
| **Goal** | Ulubione lokalizacje do szybkiego filtrowania i centrowania mapy |
| **Jira** | MA-263 |

---

## Overview

System ulubionych lokalizacji umożliwia użytkownikom zapisywanie często odwiedzanych miejsc. Ulubione lokalizacje mogą być używane do szybkiego tworzenia wydarzeń i filtrowania widoku mapy.

**Wizja z goals.md:**
- Ulubione Lokalizacje - zapisywanie często używanych miejsc

### Business Value

- **Szybkość**: Organizator nie musi wyszukiwać tej samej lokalizacji wielokrotnie
- **Personalizacja**: Każdy użytkownik ma własną listę ulubionych
- **Notatki**: Możliwość dodania uwag do lokalizacji (np. "parking płatny")

---

## Status Implementacji

| Funkcjonalność | Backend | Frontend | Uwagi |
|----------------|---------|----------|-------|
| **CRUD** |
| GET /favorites | ✅ | ✅ | Lista ulubionych |
| GET /favorites/{id} | ✅ | ⏳ | Szczegóły |
| POST /favorites | ✅ | ✅ | Dodawanie |
| PUT /favorites/{id} | ✅ | ⏳ | Edycja notatek |
| DELETE /favorites/{id} | ✅ | ✅ | Usuwanie po ID |
| DELETE /location/{id} | ✅ | ✅ | Usuwanie po locationId |
| GET /location/{id}/status | ✅ | ✅ | Sprawdzenie statusu |
| **UI** |
| Przycisk serca na mapie | - | ✅ | favourite.dart |
| Lista ulubionych | - | ⏳ | Podstawowa |
| Empty state | - | ⏳ | Do poprawy |
| Swipe to delete | - | ❌ | Nie zaimplementowane |
| **Integracja z mapą** |
| Marker ulubionych | - | ⏳ | Częściowo |
| Filtr "tylko ulubione" | - | ❌ | Nie zaimplementowane |

---

## User Stories

### US-01: Dodawanie do ulubionych
**Jako** użytkownik
**Chcę** dodać lokalizację do ulubionych
**Aby** szybko do niej wracać

**Kryteria akceptacji:**
- [x] Przycisk serca przy lokalizacji na mapie
- [x] Zmiana stanu (wypełnione/puste serce)
- [x] Możliwość dodania notatki
- [x] Zapisanie w bazie danych

### US-02: Przeglądanie ulubionych
**Jako** użytkownik
**Chcę** zobaczyć listę moich ulubionych lokalizacji
**Aby** wybrać miejsce do wydarzenia

**Kryteria akceptacji:**
- [x] Lista ulubionych w panelu użytkownika
- [x] Nazwa i adres lokalizacji
- [ ] Notatka użytkownika
- [ ] Sortowanie/filtrowanie

### US-03: Usuwanie z ulubionych
**Jako** użytkownik
**Chcę** usunąć lokalizację z ulubionych
**Aby** posprzątać nieużywane miejsca

**Kryteria akceptacji:**
- [x] Przycisk usuwania
- [x] Potwierdzenie przed usunięciem
- [ ] Swipe to delete

### US-04: Notatki do lokalizacji
**Jako** użytkownik
**Chcę** dodać notatkę do ulubionej lokalizacji
**Aby** zapisać ważne informacje (np. parking, wejście)

**Kryteria akceptacji:**
- [x] Pole notatki przy dodawaniu
- [ ] Edycja notatki
- [ ] Wyświetlanie notatki na liście

---

## Reguły Biznesowe

### Dodawanie do ulubionych
1. Tylko zalogowani użytkownicy mogą mieć ulubione
2. Nie można dodać tej samej lokalizacji dwa razy
3. Notatka jest opcjonalna (max 500 znaków)

### Usuwanie
1. Użytkownik może usuwać tylko własne ulubione
2. Usunięcie nie wpływa na istniejące wydarzenia w tej lokalizacji

---

## Scope

### M1 (MVP) - DONE
- [x] CRUD ulubionych lokalizacji
- [x] Przycisk serca na mapie
- [x] Podstawowa lista ulubionych
- [x] Notatki przy dodawaniu

### M2 (Post-MVP) - PARTIAL
- [ ] Edycja notatek
- [ ] Swipe to delete
- [ ] Filtr "tylko ulubione" na mapie
- [ ] Centrowanie mapy na ulubione
- [ ] Sortowanie po odległości
- [ ] Empty state z ilustracją

---

## Powiązane Features

- [FEATURE_01](FEATURE_01_Basic_Event_Operations.md) - Tworzenie wydarzeń z wyborem lokalizacji

---

## Dokumentacja Techniczna

Szczegóły implementacji znajdują się w:
- Backend: [meet-app-be/docs/features/favorites.md](../../meet-app-be/docs/features/favorites.md) (do utworzenia)
- Frontend: [meet-app-fe/docs/features/favorites.md](../../meet-app-fe/docs/features/favorites.md) (do utworzenia)
