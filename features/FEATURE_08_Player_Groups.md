# Feature 08: Player Groups (Persistent Player List)

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M2 (Post-MVP) |
| **Priority** | LOW |
| **Status** | ✅ Complete |
| **Goal** | System zarządzania grupami graczy z listami stałych członków (core players) |
| **Prerequisites** | Feature 1 (Basic Events), User Authentication |
| **Jira** | MA-421, MA-502 |

---

## Overview

System "Player Groups" umożliwia organizatorom tworzenie i zarządzanie grupami graczy ze stałymi listami członków. Kluczową funkcją jest wyznaczanie "core players" - graczy, którzy są automatycznie dodawani do nowych wydarzeń grupy.

### Business Value

- **Efektywność organizatora**: Nie trzeba ręcznie dodawać tych samych graczy do każdego wydarzenia
- **Zaangażowanie graczy**: Członkowie grupy otrzymują powiadomienia o nowych wydarzeniach
- **Zarządzanie społecznością**: Workflow zatwierdzania zapewnia kontrolę nad składem grupy
- **Integracja z Facebook**: Możliwość powiązania grupy z grupą FB

---

## Status Implementacji

| Funkcjonalność | Backend | Frontend | Uwagi |
|----------------|---------|----------|-------|
| **Zarządzanie grupami** |
| POST /groups (tworzenie) | ✅ | ✅ | GroupController |
| GET /groups (lista) | ✅ | ✅ | Widoczne grupy |
| GET /groups/organizer | ✅ | ✅ | Grupy organizatora |
| GET /groups/member | ✅ | ✅ | Grupy członka |
| GET /groups/{id} | ✅ | ✅ | Szczegóły |
| PUT /groups/{id} | ✅ | ✅ | Aktualizacja |
| **Zarządzanie członkami** |
| POST /members/join | ✅ | ✅ | Prośba o dołączenie |
| GET /members | ✅ | ✅ | Lista członków |
| GET /members/core-players | ✅ | ✅ | Core players |
| GET /members/pending | ✅ | ✅ | Oczekujące prośby |
| POST /members/approve | ✅ | ✅ | Zatwierdzenie |
| POST /members/reject | ✅ | ✅ | Odrzucenie |
| DELETE /members/{id} | ✅ | ✅ | Usunięcie |
| PATCH /members/{id}/core-player | ✅ | ✅ | Toggle core player |
| POST /members/leave | ✅ | ✅ | Opuszczenie |
| **UI** |
| Lista grup | - | ✅ | group_list_screen.dart |
| Szczegóły grupy | - | ✅ | group_details_screen.dart |
| Tworzenie grupy | - | ✅ | create_group_screen.dart |
| Wybór grupy dla eventów | - | ✅ | select_group_dialog.dart |
| **Powiadomienia** |
| WebSocket real-time | ✅ | ✅ | 8 typów powiadomień |
| Persystencja powiadomień | ✅ | ✅ | GroupNotificationEntity |

---

## User Stories

### Organizator

| ID | User Story |
|----|------------|
| US-O1 | Jako organizator chcę **utworzyć grupę** z nazwą, opisem i typem sportu, aby mieć miejsce do zarządzania stałymi graczami |
| US-O2 | Jako organizator chcę **zatwierdzać lub odrzucać** prośby o dołączenie, aby kontrolować skład grupy |
| US-O3 | Jako organizator chcę **oznaczyć członków jako core players**, aby byli automatycznie dodawani do nowych wydarzeń |
| US-O4 | Jako organizator chcę **otrzymywać powiadomienia** o nowych prośbach o dołączenie |
| US-O5 | Jako organizator chcę **usuwać członków** z grupy |
| US-O6 | Jako organizator chcę **mieć wielu współorganizatorów** z różnymi rolami (OWNER, ADMIN, ORGANIZER) |

### Gracz

| ID | User Story |
|----|------------|
| US-P1 | Jako gracz chcę **poprosić o dołączenie** do grupy |
| US-P2 | Jako gracz chcę **otrzymać powiadomienie** gdy moja prośba zostanie zaakceptowana lub odrzucona |
| US-P3 | Jako gracz chcę **wiedzieć, że jestem core player** i będę automatycznie dodawany do wydarzeń |
| US-P4 | Jako gracz chcę **opuścić grupę** gdy już nie chcę być członkiem |
| US-P5 | Jako gracz chcę **widzieć grupy**, do których należę |
| US-P6 | Jako członek grupy chcę **widzieć innych zatwierdzonych członków** i core players |

---

## Use Cases

### UC1: Tworzenie grupy

**Aktorzy**: Organizator
**Warunki wstępne**: Użytkownik jest zalogowany

**Przebieg**:
1. Organizator wybiera "Utwórz grupę"
2. Wypełnia formularz: nazwa, opis, typ sportu, ustawienia prywatności
3. Opcjonalnie: dodaje link do grupy Facebook
4. System tworzy grupę i ustawia użytkownika jako OWNER

**Rezultat**: Nowa grupa z organizatorem jako właścicielem

---

### UC2: Dołączanie do grupy (Approval Workflow)

**Aktorzy**: Gracz, Organizator
**Warunki wstępne**: Grupa wymaga zatwierdzenia (requireApproval = true)

**Przebieg**:
1. Gracz wysyła prośbę o dołączenie (opcjonalnie z notatką)
2. System ustawia status = PENDING
3. Organizatorzy otrzymują powiadomienie WebSocket
4. Organizator zatwierdza (APPROVED) lub odrzuca (REJECTED)
5. Gracz otrzymuje powiadomienie o decyzji

**Diagram stanów**:
```
                    ┌─────────────────────────────────────────┐
                    │                                         │
    User requests   │                                         ▼
    to join         │         ┌─────────┐              ┌──────────┐
        ─────────────────────►│ PENDING │──────────────►│ APPROVED │
                    │         └────┬────┘   Approve     └────┬─────┘
                    │              │                         │
                    │              │ Reject              Can toggle
                    │              ▼                     Core Player
                    │         ┌──────────┐                   │
                    │         │ REJECTED │                   │
                    │         └──────────┘                   │
                    │                                        │
                    │         ┌─────────┐                    │
                    └─────────│ REMOVED │◄───────────────────┘
                              └─────────┘    Organizer removes
```

---

### UC3: Zarządzanie Core Players

**Aktorzy**: Organizator
**Warunki wstępne**: Członek ma status APPROVED

**Przebieg**:
1. Organizator wybiera członka z listy
2. Oznacza jako "Core Player" (lub odznacza)
3. System zapisuje zmianę
4. Gracz otrzymuje powiadomienie o awansie/degradacji

**Efekt**: Core players są automatycznie dodawani do nowych wydarzeń grupy

---

### UC4: Auto-dodawanie do wydarzeń

**Aktorzy**: Organizator
**Warunki wstępne**: Grupa ma core players

**Przebieg**:
1. Organizator tworzy nowe wydarzenie i wybiera grupę
2. System automatycznie dodaje wszystkich core players jako uczestników
3. Core players otrzymują powiadomienie o nowym wydarzeniu

---

## Typy powiadomień

| Typ | Odbiorca | Opis |
|-----|----------|------|
| `MEMBER_JOIN_REQUEST` | Organizatorzy | Nowa prośba o dołączenie |
| `MEMBER_APPROVED` | Gracz | Prośba zaakceptowana |
| `MEMBER_REJECTED` | Gracz | Prośba odrzucona |
| `MEMBER_REMOVED` | Gracz | Usunięty z grupy |
| `PROMOTED_TO_CORE_PLAYER` | Gracz | Awans na core player |
| `DEMOTED_FROM_CORE_PLAYER` | Gracz | Degradacja z core player |
| `GROUP_UPDATED` | Wszyscy członkowie | Zmiana ustawień grupy |
| `NEW_GROUP_EVENT` | Wszyscy członkowie | Nowe wydarzenie w grupie |

---

## Typy grup

| Typ | Opis |
|-----|------|
| `SPORTS` | Ogólna grupa sportowa |
| `SOCIAL` | Grupa towarzyska |
| `TRAINING` | Grupa treningowa |
| `LEAGUE` | Liga/rozgrywki |
| `TOURNAMENT` | Turniej |

---

## Role organizatorów

| Rola | Uprawnienia |
|------|-------------|
| `OWNER` | Pełne uprawnienia, może usunąć grupę, zarządzać innymi organizatorami |
| `ADMIN` | Zarządzanie członkami, tworzenie wydarzeń, edycja grupy |
| `ORGANIZER` | Tworzenie wydarzeń, zarządzanie członkami |

---

## Wymagania funkcjonalne

### Must Have
- [x] Tworzenie grup z nazwą, opisem, typem sportu
- [x] Workflow zatwierdzania członków (PENDING → APPROVED/REJECTED)
- [x] Core players z automatycznym dodawaniem do wydarzeń
- [x] Powiadomienia WebSocket w czasie rzeczywistym
- [x] Powiadomienia zapisywane w bazie danych (do późniejszego odczytu)
- [x] Wielu organizatorów z różnymi rolami

### Should Have
- [x] Integracja z Facebook (link do grupy)
- [x] Maksymalna liczba członków
- [x] Notatki przy zatwierdzaniu/odrzucaniu

### Could Have
- [ ] Zaproszenia przez link
- [ ] Statystyki uczestnictwa członków
- [ ] Integracja z czatem grupowym

---

## Wymagania niefunkcjonalne

- **Wydajność**: Pobieranie listy członków < 500ms
- **Skalowalność**: Obsługa grup do 1000 członków
- **Bezpieczeństwo**:
  - Zatwierdzeni członkowie mogą widzieć innych zatwierdzonych członków i core players
  - Tylko organizatorzy widzą pending requests i inne statusy (REJECTED, REMOVED)
  - Operacje zarządzania członkami (approve, reject, remove) tylko dla organizatorów
- **Dostępność**: Powiadomienia dostarczane przez WebSocket w czasie rzeczywistym

---

## Kryteria akceptacji

### Zarządzanie grupą
- [x] Organizator może utworzyć grupę z wymaganymi polami
- [x] Organizator może edytować ustawienia grupy
- [x] Organizator może dodać innych organizatorów

### Członkostwo
- [x] Gracz może poprosić o dołączenie do grupy
- [x] Organizator może zatwierdzić/odrzucić prośbę
- [x] Organizator może usunąć członka
- [x] Gracz może opuścić grupę
- [x] Zatwierdzony członek może przeglądać listę innych zatwierdzonych członków i core players

### Core Players
- [x] Organizator może oznaczyć członka jako core player
- [x] Core players są automatycznie dodawani do nowych wydarzeń grupy

### Powiadomienia
- [x] Powiadomienia dostarczane w czasie rzeczywistym (WebSocket)
- [x] Powiadomienia zapisywane w bazie danych
- [x] Użytkownik może pobrać historię powiadomień

---

## API Endpoints (podsumowanie)

### Zarządzanie grupami (6 endpointów)

| Endpoint | Opis | Dostęp |
|----------|------|--------|
| `POST /api/v1/groups` | Tworzenie grupy | Zalogowany |
| `GET /api/v1/groups` | Lista widocznych grup | Zalogowany |
| `GET /api/v1/groups/organizer` | Grupy organizatora | Organizator |
| `GET /api/v1/groups/member` | Grupy członka | Członek |
| `GET /api/v1/groups/{id}` | Szczegóły grupy | Autoryzowany |
| `PUT /api/v1/groups/{id}` | Aktualizacja grupy | Organizator |

### Zarządzanie członkami (9 endpointów)

| Endpoint | Opis | Dostęp |
|----------|------|--------|
| `POST /api/v1/groups/{id}/members/join` | Prośba o dołączenie | Zalogowany |
| `GET /api/v1/groups/{id}/members` | Lista członków (APPROVED dla członków, wszystkie statusy dla organizatorów) | Członek lub Organizator |
| `GET /api/v1/groups/{id}/members/core-players` | Core players | Członek lub Organizator |
| `GET /api/v1/groups/{id}/members/pending` | Oczekujące prośby | Organizator |
| `POST /api/v1/groups/{id}/members/approve` | Zatwierdzenie | Organizator |
| `POST /api/v1/groups/{id}/members/reject` | Odrzucenie | Organizator |
| `DELETE /api/v1/groups/{id}/members/{memberId}` | Usunięcie | Organizator |
| `PATCH /api/v1/groups/{id}/members/{memberId}/core-player` | Toggle core player | Organizator |
| `POST /api/v1/groups/{id}/members/leave` | Opuszczenie grupy | Członek |

---

## Powiązane Features

- [FEATURE_01](FEATURE_01_Basic_Event_Operations.md) - CRUD wydarzeń (prerequisite)
- [FEATURE_04](FEATURE_04_Event_Series.md) - Serie wydarzeń grupowych

---

## Dokumentacja Techniczna

Szczegóły implementacji znajdują się w:
- Backend: [meet-app-be/docs/features/groups.md](../../meet-app-be/docs/features/groups.md)
- Frontend: [meet-app-fe/docs/features/groups.md](../../meet-app-fe/docs/features/groups.md)
