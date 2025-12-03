# FEATURE_10: Event History

## Overview

Feature umożliwiający użytkownikom przeglądanie historii swoich wydarzeń - zarówno organizowanych jak i tych, w których uczestniczyli.

## User Stories

### US-10.1: Przeglądanie historii wydarzeń
**Jako** zalogowany użytkownik
**Chcę** mieć dostęp do listy moich zakończonych wydarzeń
**Aby** móc sprawdzić historię swoich aktywności sportowych

### US-10.2: Filtrowanie po roli
**Jako** użytkownik
**Chcę** filtrować wydarzenia po roli (organizator/uczestnik)
**Aby** szybko znaleźć interesujące mnie wydarzenia

### US-10.3: Statusy płatności dla organizatora
**Jako** organizator wydarzenia
**Chcę** widzieć informacje o płatnościach uczestników
**Aby** móc rozliczyć wydarzenia po ich zakończeniu

### US-10.4: Dostęp do szczegółów zakończonego wydarzenia
**Jako** użytkownik
**Chcę** móc otworzyć szczegóły zakończonego wydarzenia
**Aby** zobaczyć pełne informacje i listę uczestników

## Acceptance Criteria

### AC-10.1: Dostęp do historii
- [x] Przycisk "Historia wydarzeń" widoczny w panelu użytkownika
- [x] Przycisk przekierowuje do nowego ekranu z historią
- [x] Historia dostępna tylko dla zalogowanych użytkowników

### AC-10.2: Wyświetlanie historii
- [x] Historia podzielona na dwa taby: "Organizowane" i "Uczestnictwo"
- [x] Wydarzenia posortowane od najnowszych
- [x] Widoczne: data, godzina, lokalizacja, status (Zakończone/Anulowane)
- [x] Paginacja dla dużej liczby wydarzeń

### AC-10.3: Informacje o płatnościach (tylko organizator)
- [x] Badge ze statusem płatności (np. "8/10 zapłaciło")
- [x] Wyróżnienie wydarzeń z nieopłaconymi uczestnikami
- [x] Możliwość przejścia do szczegółów i zarządzania płatnościami

### AC-10.4: Tab Uczestnictwo
- [x] Lista wydarzeń gdzie użytkownik był uczestnikiem (nie organizatorem)
- [x] Widoczna informacja o organizatorze
- [x] Status wydarzenia (Zakończone/Anulowane)

## Technical Implementation

### Backend
- Endpoint: `GET /api/v1/events/my-history`
- Query parameters:
  - `role`: ORGANIZER | PARTICIPANT | null (all)
  - `page`: numer strony (0-indexed)
  - `size`: rozmiar strony (default 20)
- Response: `EventHistoryDTO` z informacją o roli i statystykach płatności

### Frontend
- Nowa trasa: `/my-history`
- Screen: `MyEventHistoryScreen`
- ViewModel: `EventHistoryViewModel`
- Przycisk w `UserPanelWidget`

### Database
- Indeksy dla wydajności:
  - `idx_event_participant_user_id`
  - `idx_event_status_end_datetime`
  - `idx_event_participant_payment`

## UI/UX

### Wireframes

#### Panel użytkownika
```
┌─────────────────────────────────────────┐
│  Informacje o użytkowniku              │
│  [Avatar] Nazwa użytkownika            │
├─────────────────────────────────────────┤
│  📋 Historia wydarzeń              →   │
│     Zobacz zakończone wydarzenia       │
├─────────────────────────────────────────┤
│  Ulubione miejsca                      │
└─────────────────────────────────────────┘
```

#### Ekran historii
```
┌─────────────────────────────────────────┐
│  ←  Historia wydarzeń                  │
├─────────────────────────────────────────┤
│  [Organizowane] │ [Uczestnictwo]       │
├─────────────────────────────────────────┤
│  🏐 30.11 │ 18:00-20:00 │ 10/10        │
│  📍 Hala Sportowa Centrum              │
│  [ZAKOŃCZONE] [8/10 zapłaciło]         │
├─────────────────────────────────────────┤
│  🏐 25.11 │ 19:00-21:00 │ 8/10         │
│  📍 Orlik Mokotów                      │
│  [ZAKOŃCZONE] [✓ Wszystko opłacone]    │
└─────────────────────────────────────────┘
```

## Translations

| Key | PL | EN |
|-----|----|----|
| eventHistory | Historia wydarzeń | Event History |
| organizedEvents | Organizowane | Organized |
| participatedEvents | Uczestnictwo | Participated |
| noOrganizedEvents | Brak organizowanych wydarzeń | No organized events yet |
| noParticipatedEvents | Brak wydarzeń z uczestnictwem | No participated events yet |
| statusCompleted | Zakończone | Completed |
| statusCancelled | Anulowane | Cancelled |
| allPaid | Wszyscy zapłacili | All paid |
| paid | zapłacono | paid |

## Related Features
- FEATURE_03: Participant Management (płatności)
- FEATURE_05: User Profile (integracja z profilem)
- FEATURE_07: Event Lifecycle (statusy wydarzeń)

## Version
- Implemented in: v3.2
- Migration: V3_2__Add_event_history_indexes.sql
