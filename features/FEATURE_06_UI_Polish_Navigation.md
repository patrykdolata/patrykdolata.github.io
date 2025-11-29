# Feature 06: UI Polish & Navigation

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M1 (MVP) - basic, M2 - polish |
| **Priority** | MEDIUM |
| **Status** | ⏳ M1 Partial, ❌ M2 Not Started |
| **Goal** | Spójna nawigacja i podstawowy UI organizatora |
| **Jira** | MA-407, MA-414 |

---

## Overview

Usprawnienia UI obejmujące nawigację bottom navigation, loading skeletons, error states, animacje, wyszukiwanie i tryb offline.

**Wizja z goals.md:**
- Pulpit Organizatora - widok "Moje wydarzenia"

### Business Value

- **Profesjonalny wygląd**: Spójny, dopracowany interfejs
- **Lepsza UX**: Smooth animations, clear feedback
- **Nawigacja**: Szybki dostęp do kluczowych sekcji

---

## Status Implementacji

| Funkcjonalność | Backend | Frontend | Uwagi |
|----------------|---------|----------|-------|
| **M1 - Basic Navigation** |
| Bottom Navigation | - | ✅ | events_bottom_navigation.dart |
| Tab: Map | - | ✅ | GoogleMapWidget |
| Tab: Events | - | ✅ | EventsListScreen |
| Tab: Profile/Series | - | ⏳ | Podstawowe |
| MyEvents (organizerId=me) | ✅ | ✅ | Lista organizatora |
| **M2 - Polish** |
| Loading skeletons | - | ⏳ | Częściowo |
| Error states + retry | - | ⏳ | Podstawowe |
| Empty states | - | ⏳ | Podstawowe |
| Hero animations | - | ❌ | Nie zaimplementowane |
| Page transitions | - | ❌ | Nie zaimplementowane |
| Search | - | ❌ | Nie zaimplementowane |
| Offline mode | - | ❌ | Nie zaimplementowane |
| Haptic feedback | - | ❌ | Nie zaimplementowane |

---

## User Stories

### US-01: Nawigacja między sekcjami
**Jako** użytkownik
**Chcę** mieć szybki dostęp do głównych sekcji
**Aby** łatwo nawigować w aplikacji

**Kryteria akceptacji:**
- [x] Bottom navigation z 3+ zakładkami
- [x] Mapa jako główna zakładka
- [x] Lista wydarzeń
- [x] Profil/ustawienia

### US-02: Moje wydarzenia (organizator)
**Jako** organizator
**Chcę** zobaczyć listę moich wydarzeń
**Aby** zarządzać organizowanymi eventami

**Kryteria akceptacji:**
- [x] Filtr `organizerId=me`
- [x] Lista z podstawowymi informacjami
- [x] Dostęp z navigation

### US-03: Loading states
**Jako** użytkownik
**Chcę** widzieć że aplikacja ładuje dane
**Aby** wiedzieć że akcja się wykonuje

**Kryteria akceptacji:**
- [x] Loading indicator na listach
- [ ] Skeleton loading
- [ ] Smooth transitions

### US-04: Error handling
**Jako** użytkownik
**Chcę** widzieć informację o błędach
**Aby** wiedzieć co poszło nie tak

**Kryteria akceptacji:**
- [x] Komunikaty błędów
- [x] Retry button
- [ ] User-friendly messages
- [ ] Network error detection

---

## Reguły Biznesowe

### Nawigacja
1. Mapa jest domyślną zakładką
2. Stan zakładek powinien być zachowany (IndexedStack)
3. Pull-to-refresh na wszystkich listach

### MyEvents
1. Wymaga zalogowania
2. Pokazuje tylko wydarzenia organizatora
3. Sortowane chronologicznie

---

## Scope

### M1 (MVP) - PARTIAL
- [x] Bottom navigation (Map/Events/Profile)
- [x] MyEvents z `organizerId=me`
- [x] Podstawowe loading states
- [x] Podstawowe error states

### M2 (Post-MVP) - NOT STARTED
- [ ] Loading skeletons (shimmer)
- [ ] Hero animations
- [ ] Page transitions
- [ ] Search functionality
- [ ] Empty states z ilustracjami
- [ ] Offline mode
- [ ] Haptic feedback
- [ ] Real-time validation

---

## Powiązane Features

- [FEATURE_01](FEATURE_01_Basic_Event_Operations.md) - Lista wydarzeń
- [FEATURE_04](FEATURE_04_Event_Series.md) - Zakładka serii

---

## Dokumentacja Techniczna

Szczegóły implementacji znajdują się w:
- Frontend: [meet-app-fe/docs/features/navigation.md](../../meet-app-fe/docs/features/navigation.md) (do utworzenia)
