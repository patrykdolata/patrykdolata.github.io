# Screen Mockups - Meet App

HTML prototypy interfejsu użytkownika dla aplikacji Meet App.

## 📱 M1 (MVP) - Do końca 2025

Ekrany niezbędne dla Milestone 1 (Organizer MVP):

### ✅ Zaimplementowane:
- **auth-panel.html** - Logowanie/Rejestracja (Sprint 0) ✅
- **map-home.html** - Mapa z wydarzeniami (Feature 0) ✅ 80%
- **create-event.html** - Tworzenie wydarzenia (Feature 1) ✅ 93%
- **event-edit.html** - Edycja wydarzenia (Feature 1) ✅ 93%
- **event-details.html** - Szczegóły wydarzenia (Feature 1) ✅
  - event-details-003.html (wersja 3)
  - event-details-005.html (wersja 5)
  - event-details-006.html (wersja 6 - latest)

### 🔴 Do implementacji:
- **events-list.html** - Lista wydarzeń organizatora (Feature 6) - 40% done
- **event-manage.html** - Zarządzanie uczestnikami MANUAL (Feature 3) - 0%
  - **Zakres M1**: Tylko add/remove uczestników, pozycje (readonly)
  - **BEZ**: Płatności, drag&drop, confirmation toggles
- **series-create.html** - Tworzenie serii wydarzeń (Feature 4) - 0%
- **series-generate.html** - Generowanie wydarzeń z serii (Feature 4) - 0%
- **series.html** - Lista serii cyklicznych (Feature 4) - 0%

---

## 🟡 M2 (Post-MVP) - Q1 2026+

Ekrany zaawansowane (poza zakresem MVP):

- **payments-manage.html** - Zarządzanie płatnościami (Feature 3 ADVANCED)
  - isPaid, paymentMethod, payment tracking
  - **Out of scope M1**

- **group-info.html** - Informacje o grupach siatkarskich (Feature 3.5)
  - Facebook volleyball groups
  - **Priority**: LOW, **M2**

- **user-profile.html** - Profil użytkownika rozszerzony (Feature 5)
  - Event history, ratings, stats
  - **Priority**: LOW, **M2**

---

## 💡 Concepts (bez specyfikacji w TODO)

- **skill-levels.html** - System poziomów umiejętności 1-5
  - **Status**: Concept, brak w TODO.md
  - **Możliwe**: Feature 1 Post-MVP (level filters)
  - **Rekomendacja**: Dodać do FEATURE_01.md jako Post-MVP lub oznaczyć jako future concept

---

## 📋 Brakujące mockupy dla M1:

1. **Bottom Navigation** (Feature 6 M1)
   - Tab bar: Map / Events / Profile
   - Stack navigation

2. **Empty States**
   - No events found
   - No participants
   - Empty series list

3. **Error States**
   - Network error
   - Server error
   - Unauthorized

4. **Loading States**
   - Skeleton screens
   - Shimmer effects

---

## 🔧 Struktura plików:

```
screens/
├── README.md              ← Ten plik
│
├── M1 MVP (zaimplementowane)
├── auth-panel.html        ✅ Sprint 0
├── map-home.html          ✅ Feature 0 (80%)
├── create-event.html      ✅ Feature 1 (93%)
├── event-edit.html        ✅ Feature 1 (93%)
├── event-details.html     ✅ Feature 1
├── event-details-*.html   (wersje iteracyjne)
│
├── M1 MVP (do implementacji)
├── events-list.html       🔴 Feature 6 (40%)
├── event-manage.html      🔴 Feature 3 Manual (0%)
├── series-create.html     🔴 Feature 4 (0%)
├── series-generate.html   🔴 Feature 4 (0%)
├── series.html            🔴 Feature 4 (0%)
│
├── M2 Post-MVP
├── payments-manage.html   🟡 Feature 3 Advanced
├── group-info.html        🟡 Feature 3.5
├── user-profile.html      🟡 Feature 5
│
└── Concepts
    └── skill-levels.html  💡 No spec
```

---

## 📊 Statystyki:

| Kategoria | Liczba | % |
|-----------|--------|---|
| M1 zaimplementowane | 6 | 33% |
| M1 pending | 5 | 28% |
| M2 Post-MVP | 3 | 17% |
| Concepts | 1 | 6% |
| Wersje/duplikaty | 3 | 17% |
| **TOTAL** | **18** | **100%** |

**Spójność z TODO.md**: 78% (14/18 ekranów ma mapping do features)

---

## 🎯 Priorytety implementacji (Next 2 weeks):

1. **event-manage.html** (Feature 3) - Manual participant management [30h]
2. **series-*.html** (Feature 4) - Event series [25h]
3. **events-list.html** (Feature 6) - Bottom nav + list [15h pozostałe]

---

_Last updated: 2025-11-16_
_Aligned with: TODO.md, features/*.md, .todo-schedule.json_
