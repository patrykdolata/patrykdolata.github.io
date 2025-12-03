# Feature 01: Basic Event Operations

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M1 (MVP) |
| **Priority** | CRITICAL PATH |
| **Status** | ✅ M1 Complete |
| **Goal** | Pełny CRUD wydarzeń dla organizatora z minimalnym statusem CANCELLED |
| **Jira** | MA-385, MA-427, MA-405, MA-29, MA-475, MA-501 |

---

## Overview

Organizator może tworzyć, edytować, usuwać i odwoływać wydarzenia sportowe. Użytkownicy mogą przeglądać wydarzenia na liście i mapie, oraz udostępniać je przez deep links.

**Wizja z goals.md:**
- Kreator Wydarzeń - szybkie tworzenie gier (czas, miejsce, limity miejsc)
- Interaktywna Mapa - wizualizacja wydarzeń na mapie
- Cykl Życia Wydarzenia - edycja, odwoływanie i usuwanie przez organizatora
- Udostępnianie (Deep Links) - przycisk "Udostępnij" generujący bezpośredni link

---

## Status Implementacji

| Funkcjonalność | Backend | Frontend | Uwagi |
|----------------|---------|----------|-------|
| **Kreator Wydarzeń** |
| Tworzenie wydarzenia | ✅ | ✅ | POST /events |
| Edycja wydarzenia | ✅ | ✅ | PUT /events/{id} |
| Usuwanie wydarzenia | ✅ | ✅ | DELETE /events/{id} |
| Odwołanie wydarzenia | ✅ | ❌ | PUT /events/{id}/cancel - brak UI |
| Walidacja formularza | ✅ | ✅ | Daty, sloty, cena, wymagane pola |
| **Interaktywna Mapa** |
| Wyświetlanie na mapie | ✅ | ✅ | Google Maps z markerami |
| Popup z detalami | - | ✅ | Karta wydarzenia po tapnięciu |
| Lokalizacja użytkownika | - | ✅ | Przycisk "moja lokalizacja" |
| Klastrowanie markerów | - | ✅ | MapMarkerManager |
| **Cykl Życia** |
| Status ACTIVE | ✅ | ✅ | Domyślny status |
| Status CANCELLED | ✅ | ⚠️ | Brak badge w liście |
| Status COMPLETED | ❌ | ❌ | Planowane M2 |
| Status DRAFT | ❌ | ❌ | Planowane M2 |
| **Udostępnianie (Deep Links)** |
| Generowanie linku | ✅ | ✅ | https://meetapp.pl/event/{id} |
| Custom scheme | - | ✅ | meetapp://event/{id} |
| Otwieranie z linku | - | ✅ | Cold + warm start |
| Przycisk "Udostępnij" | - | ✅ | Share + kopiuj link |
| **Lista Wydarzeń** |
| Wyświetlanie listy | ✅ | ✅ | Sortowanie po dacie |
| Filtrowanie (organizerId) | ✅ | ✅ | Moje wydarzenia |
| Zaawansowane filtry | ✅ | ❌ | sportType, level - brak UI |
| Wyszukiwanie | ❌ | ❌ | Planowane M2 |
| Pull-to-refresh | - | ✅ | Odświeżanie listy |
| **Real-time Updates (MA-475)** |
| WebSocket broadcast EVENT_CREATED | ✅ | ✅ | Nowe markery na mapie |
| WebSocket EVENT_UPDATE | ✅ | ✅ | Aktualizacja pozycji markera |
| WebSocket EVENT_CANCELLED | ✅ | ✅ | Powiadomienia dla uczestników |

---

## User Stories

### US-01: Tworzenie wydarzenia
**Jako** organizator
**Chcę** utworzyć nowe wydarzenie sportowe
**Aby** zaprosić graczy do udziału

**Kryteria akceptacji:**
- [x] Formularz zawiera: tytuł, data/czas, czas trwania, lokalizacja, liczba miejsc
- [x] Opcjonalnie: poziom, cena, opis, typ sportu
- [x] Walidacja: data w przyszłości, min 2 miejsca, tytuł 3-255 znaków
- [x] Po utworzeniu użytkownik widzi szczegóły wydarzenia

### US-02: Edycja wydarzenia
**Jako** organizator
**Chcę** edytować swoje wydarzenie
**Aby** zaktualizować informacje

**Kryteria akceptacji:**
- [x] Tylko organizator może edytować swoje wydarzenie
- [x] Nie można edytować odwołanego wydarzenia
- [x] Nie można zmniejszyć miejsc poniżej liczby uczestników
- [x] Zmiany są natychmiast widoczne

### US-03: Usuwanie wydarzenia
**Jako** organizator
**Chcę** usunąć wydarzenie bez uczestników
**Aby** wyczyścić niepotrzebne wpisy

**Kryteria akceptacji:**
- [x] Tylko organizator może usunąć swoje wydarzenie
- [x] Nie można usunąć wydarzenia z uczestnikami (użyj odwołania)
- [x] Potwierdzenie przed usunięciem
- [x] Wydarzenie znika z listy i mapy

### US-04: Odwołanie wydarzenia
**Jako** organizator
**Chcę** odwołać wydarzenie z uczestnikami
**Aby** poinformować graczy o anulowaniu

**Kryteria akceptacji:**
- [x] BE: Endpoint PUT /events/{id}/cancel zmienia status na CANCELLED
- [ ] FE: Przycisk "Odwołaj" w szczegółach wydarzenia
- [ ] FE: Badge "Odwołane" w liście i szczegółach
- [ ] Odwołane wydarzenie nie przyjmuje nowych zapisów

### US-05: Przeglądanie wydarzeń na mapie
**Jako** użytkownik
**Chcę** zobaczyć wydarzenia na mapie
**Aby** znaleźć gry w mojej okolicy

**Kryteria akceptacji:**
- [x] Mapa pokazuje markery wydarzeń
- [x] Tapnięcie markera pokazuje popup z informacjami
- [x] Przycisk lokalizacji centruje mapę na użytkowniku
- [x] Klastrowanie markerów przy dużym zoomie

### US-06: Udostępnianie wydarzenia
**Jako** użytkownik
**Chcę** udostępnić link do wydarzenia
**Aby** zaprosić znajomych

**Kryteria akceptacji:**
- [x] Przycisk "Udostępnij" generuje link https://meetapp.pl/event/{id}
- [x] Link można wysłać przez Messenger/WhatsApp/SMS
- [x] Kliknięcie linku otwiera aplikację na wydarzeniu
- [x] Działa dla cold start i warm start

---

## Reguły Biznesowe

### Tworzenie wydarzenia
1. Data rozpoczęcia musi być w przyszłości
2. Czas trwania: 30-480 minut
3. Miejsca: 2-50 uczestników
4. Poziom: 0-5 (0 = każdy)
5. Cena: 0-10000 PLN
6. Tytuł: 3-255 znaków
7. Opis: max 500 znaków

### Edycja wydarzenia
1. Tylko właściciel może edytować
2. Status CANCELLED blokuje edycję
3. Zmniejszenie miejsc nie może zejść poniżej aktualnej liczby uczestników

### Usuwanie wydarzenia
1. Tylko właściciel może usunąć
2. Wydarzenie z uczestnikami -> błąd 409 (użyj odwołania)

### Odwołanie wydarzenia
1. Tylko właściciel może odwołać
2. Status zmienia się na CANCELLED
3. Uczestnicy pozostają na liście (dla historii)

---

## Scope

### M1 (MVP) - DONE
- [x] CRUD wydarzeń
- [x] Lista z filtrem organizerId
- [x] Mapa z markerami
- [x] Deep links
- [x] Formularz tworzenia/edycji
- [x] Podstawowa walidacja
- [x] Real-time map updates (MA-475)

### M2 (Post-MVP)
- [ ] Status COMPLETED, DRAFT
- [ ] Zaawansowane filtry UI (sportType, level, cena)
- [ ] Wyszukiwanie tekstowe
- [ ] Badge statusu w liście
- [ ] Przycisk odwołania z powiadomieniami

---

## Powiązane Features

- [FEATURE_02](FEATURE_02_Join_Leave_Events.md) - Dołączanie/opuszczanie wydarzeń
- [FEATURE_03](FEATURE_03_Participant_Management.md) - Zarządzanie uczestnikami
- [FEATURE_07](FEATURE_07_Event_Lifecycle.md) - Pełny cykl życia (COMPLETED, auto-completion)
- [FEATURE_09](FEATURE_09_Deep_Links.md) - Deep Links (udostępnianie wydarzeń)

---

## Dokumentacja Techniczna

Szczegóły implementacji znajdują się w:
- Backend: [meet-app-be/docs/features/events.md](../../meet-app-be/docs/features/events.md)
- Frontend: [meet-app-fe/docs/features/events.md](../../meet-app-fe/docs/features/events.md)
