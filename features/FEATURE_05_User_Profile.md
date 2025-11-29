# Feature 05: User Profile & History

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M2 (Post-MVP) |
| **Priority** | LOW |
| **Status** | ⏳ Partial (Basic only) |
| **Goal** | Rozszerzony profil użytkownika z historią wydarzeń i ocenami |
| **Prerequisites** | Authentication |
| **Jira** | MA-212 |

---

## Overview

Rozszerzony profil użytkownika z możliwością edycji, historią wydarzeń, systemem ocen (thumbs up/down) oraz statystykami uczestnictwa.

**Wizja z goals.md:**
- Zarządzanie Profilem - edycja danych, awatar

### Business Value

- **Śledzenie historii**: Użytkownicy widzą swoją historię uczestnictwa
- **Budowanie reputacji**: System ocen buduje zaufanie
- **Personalizacja**: Możliwość edycji profilu zwiększa zaangażowanie
- **Informacja dla organizatorów**: Podgląd historii uczestników

---

## Status Implementacji

| Funkcjonalność | Backend | Frontend | Uwagi |
|----------------|---------|----------|-------|
| **Implemented (Basic)** |
| GET /users/me | ✅ | ✅ | Podstawowe dane |
| GET /users/{id} | ✅ | ✅ | PublicUserDTO |
| PUT /users/{id} | ✅ | ❌ | Brak UI edycji |
| DELETE /users/{id} | ✅ | ❌ | Admin only |
| Wyświetlanie thumbs up/down | ✅ | ✅ | UserDetailsWidget |
| **Not Implemented** |
| GET /users/me/events | ❌ | ❌ | Moje wydarzenia |
| GET /users/me/organized | ❌ | ❌ | Organizowane |
| GET /users/me/history | ❌ | ❌ | Historia |
| POST /users/{id}/thumb | ❌ | ❌ | Dawanie ocen |
| Extended profile stats | ❌ | ❌ | Statystyki |
| Avatar upload | ❌ | ❌ | Zmiana awatara |
| **UI** |
| Profil podstawowy | - | ✅ | user/details.dart |
| Profil rozszerzony z tabami | - | ❌ | Nie zaimplementowane |
| Ekran edycji profilu | - | ❌ | Nie zaimplementowane |
| Historia wydarzeń | - | ❌ | Nie zaimplementowane |

---

## User Stories

### US-01: Przeglądanie własnego profilu
**Jako** użytkownik
**Chcę** zobaczyć mój profil
**Aby** sprawdzić swoje dane i statystyki

**Kryteria akceptacji:**
- [x] Podstawowe dane (imię, login)
- [x] Wyświetlanie thumbs up/down
- [ ] Statystyki wydarzeń (organized/participated)
- [ ] Historia wydarzeń

### US-02: Edycja profilu
**Jako** użytkownik
**Chcę** edytować swój profil
**Aby** aktualizować dane

**Kryteria akceptacji:**
- [ ] Zmiana nickname
- [ ] Zmiana email
- [ ] Upload avatara
- [ ] Walidacja unikalności email

### US-03: Przeglądanie profili innych
**Jako** użytkownik
**Chcę** zobaczyć profil innego użytkownika
**Aby** sprawdzić jego reputację

**Kryteria akceptacji:**
- [x] Publiczny profil użytkownika
- [x] Wyświetlanie ocen (thumbs)
- [ ] Link do profilu z listy uczestników

### US-04: Ocenianie użytkowników
**Jako** użytkownik
**Chcę** dać kciuk w górę/dół innemu użytkownikowi
**Aby** ocenić jego wiarygodność

**Kryteria akceptacji:**
- [ ] Przycisk thumbs up/down
- [ ] Blokada oceniania samego siebie
- [ ] Aktualizacja licznika

### US-05: Historia wydarzeń
**Jako** użytkownik
**Chcę** zobaczyć historię moich wydarzeń
**Aby** śledzić swoje uczestnictwo

**Kryteria akceptacji:**
- [ ] Lista wydarzeń w których uczestniczyłem
- [ ] Lista wydarzeń które organizowałem
- [ ] Filtrowanie przeszłych wydarzeń

---

## Reguły Biznesowe

### Edycja profilu
1. Użytkownik może edytować tylko własny profil
2. Email musi być unikalny
3. Nickname: 3-50 znaków

### System ocen
1. Nie można oceniać samego siebie
2. Oceny są publiczne
3. Brak limitu wielokrotnego oceniania (do implementacji w przyszłości)

### Widoczność profilu
1. Podstawowe dane są publiczne
2. Email widoczny tylko dla właściciela

---

## Scope

### M1 (MVP) - PARTIAL
- [x] GET /users/me - podstawowe dane
- [x] GET /users/{id} - publiczny profil
- [x] Wyświetlanie thumbs

### M2 (Post-MVP) - NOT STARTED
- [ ] PUT /users/me - edycja profilu
- [ ] POST /users/{id}/thumb - dawanie ocen
- [ ] GET /users/me/events - moje wydarzenia
- [ ] GET /users/me/organized - organizowane
- [ ] GET /users/me/history - historia
- [ ] Avatar upload
- [ ] UI: Profil z tabami
- [ ] UI: Ekran edycji

---

## Powiązane Features

- [FEATURE_01](FEATURE_01_Basic_Event_Operations.md) - Wydarzenia użytkownika
- [FEATURE_02](FEATURE_02_Join_Leave_Events.md) - Uczestnictwo w wydarzeniach

---

## Dokumentacja Techniczna

Szczegóły implementacji znajdują się w:
- Backend: [meet-app-be/docs/features/users.md](../../meet-app-be/docs/features/users.md) (do utworzenia)
- Frontend: [meet-app-fe/docs/features/users.md](../../meet-app-fe/docs/features/users.md) (do utworzenia)
