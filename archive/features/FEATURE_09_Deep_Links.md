# Feature 09: Deep Links

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M1 (MVP) |
| **Priority** | HIGH |
| **Status** | ✅ Complete |
| **Goal** | Udostępnianie wydarzeń przez linki HTTPS i custom scheme |
| **Jira** | - |

---

## Overview

Użytkownicy mogą udostępniać linki do wydarzeń, które po kliknięciu otwierają aplikację bezpośrednio na szczegółach wydarzenia. Wspierane są dwa formaty linków:

1. **HTTPS App Links** - `https://meetapp.pl/event/{uuid}` (Android)
2. **Custom Scheme** - `meetapp://event/{uuid}` (Android, iOS)

**Wizja:**
- Jedno kliknięcie w link otwiera wydarzenie w aplikacji
- Działa dla cold start (aplikacja zamknięta) i warm start (aplikacja w tle)
- Nawigacja "wstecz" wraca do poprzedniego ekranu
- Fallback na custom scheme gdy HTTPS nie działa

---

## Status Implementacji

| Funkcjonalność | Android | iOS | Uwagi |
|----------------|---------|-----|-------|
| **Udostępnianie** |
| Przycisk "Udostępnij" | ✅ | ✅ | Share sheet systemowy |
| Kopiowanie linku | ✅ | ✅ | Do schowka |
| Generowanie HTTPS linku | ✅ | ✅ | meetapp.pl/event/{id} |
| **Otwieranie linków** |
| HTTPS App Links | ✅ | ⚠️ | iOS wymaga Apple Team ID |
| Custom scheme (meetapp://) | ✅ | ✅ | Fallback |
| Cold start | ✅ | ✅ | Z zamkniętej aplikacji |
| Warm start | ✅ | ✅ | Z aplikacji w tle |
| **Nawigacja** |
| Prawidłowy stos nawigacji | ✅ | ✅ | [Home, EventDetails] |
| Przycisk "wstecz" | ✅ | ✅ | Jeden klik wraca |
| **Serwer** |
| assetlinks.json | ✅ | - | Android App Links |
| apple-app-site-association | ⚠️ | ⚠️ | Placeholder (brak Team ID) |

---

## User Stories

### US-01: Udostępnianie wydarzenia
**Jako** użytkownik
**Chcę** udostępnić link do wydarzenia
**Aby** zaprosić znajomych

**Kryteria akceptacji:**
- [x] Przycisk "Udostępnij" w szczegółach wydarzenia
- [x] Link w formacie: `https://meetapp.pl/event/{uuid}`
- [x] Share sheet z opcjami: Messenger, WhatsApp, SMS, email, etc.
- [x] Opcja "Kopiuj link" do schowka

### US-02: Otwieranie linku (cold start)
**Jako** użytkownik
**Chcę** otworzyć link gdy aplikacja jest zamknięta
**Aby** zobaczyć szczegóły wydarzenia

**Kryteria akceptacji:**
- [x] Kliknięcie linku otwiera aplikację
- [x] Automatycznie przechodzi do szczegółów wydarzenia
- [x] Przycisk "wstecz" wraca do ekranu głównego (home)
- [x] Stos nawigacji: [Home, EventDetails]

### US-03: Otwieranie linku (warm start)
**Jako** użytkownik
**Chcę** otworzyć link gdy aplikacja jest w tle
**Aby** szybko przejść do wydarzenia

**Kryteria akceptacji:**
- [x] Kliknięcie linku przywraca aplikację
- [x] Otwiera szczegóły wydarzenia na obecnym stosie
- [x] Przycisk "wstecz" wraca do poprzedniego ekranu
- [x] Brak duplikatów na stosie nawigacji

### US-04: Obsługa nieprawidłowego linku
**Jako** użytkownik
**Chcę** zobaczyć informację o błędzie
**Gdy** link jest nieprawidłowy lub wydarzenie nie istnieje

**Kryteria akceptacji:**
- [x] Walidacja formatu UUID
- [x] Komunikat błędu gdy wydarzenie nie istnieje
- [x] Możliwość powrotu do ekranu głównego

---

## Wspierane Formaty Linków

| Format | Przykład | Platforma |
|--------|----------|-----------|
| HTTPS App Link | `https://meetapp.pl/event/c8e844b6-cd09-4da9-9f12-755a2dcce0f4` | Android |
| Custom scheme (path) | `meetapp://event/c8e844b6-cd09-4da9-9f12-755a2dcce0f4` | Android, iOS |
| Custom scheme (query) | `meetapp://event?id=c8e844b6-cd09-4da9-9f12-755a2dcce0f4` | Android, iOS |

---

## Architektura

```
┌─────────────────────────────────────────────────────────────┐
│                     Deep Link Flow                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User clicks link                                        │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────┐                                            │
│  │  app_links  │  Intercepts ALL links                     │
│  │   package   │  (HTTPS + custom scheme)                  │
│  └──────┬──────┘                                            │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────┐                                       │
│  │ DeepLinkListener │  Parses URI, extracts eventId        │
│  │    (Widget)      │  Uses GoRouter instance              │
│  └────────┬─────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────┐                                       │
│  │ DeepLinkService  │  Validates UUID format               │
│  │   (Parsing)      │                                       │
│  └────────┬─────────┘                                       │
│           │                                                 │
│           ▼                                                 │
│  ┌──────────────────┐                                       │
│  │    GoRouter      │  router.push('/event/{id}')          │
│  │  (Navigation)    │                                       │
│  └──────────────────┘                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Komponenty

| Komponent | Plik | Odpowiedzialność |
|-----------|------|------------------|
| DeepLinkListener | `lib/features/deep_link/deep_link_listener.dart` | Widget nasłuchujący linków, nawigacja |
| DeepLinkService | `lib/features/deep_link/deep_link_service.dart` | Parsowanie URI, walidacja UUID |
| GoRouter | `lib/app.dart` | Routing, redirect dla deep links |

---

## Konfiguracja Platformowa

### Android

**AndroidManifest.xml:**
```xml
<!-- Custom Scheme -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="meetapp" />
</intent-filter>

<!-- HTTPS App Links -->
<intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data
        android:scheme="https"
        android:host="meetapp.pl"
        android:pathPrefix="/event" />
</intent-filter>
```

**Serwer - assetlinks.json:**
```
URL: https://meetapp.pl/.well-known/assetlinks.json
```

### iOS

**Info.plist:**
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>meetapp</string>
        </array>
    </dict>
</array>
```

**Universal Links (wymaga Apple Developer Account):**
- Runner.entitlements z Associated Domains
- apple-app-site-association na serwerze

---

## Testowanie

### Komendy ADB (Android)

```bash
# Test HTTPS App Link
adb shell am start -a android.intent.action.VIEW \
  -d "https://meetapp.pl/event/c8e844b6-cd09-4da9-9f12-755a2dcce0f4"

# Test Custom Scheme
adb shell am start -a android.intent.action.VIEW \
  -d "meetapp://event/c8e844b6-cd09-4da9-9f12-755a2dcce0f4"

# Cold start (zamknij aplikację najpierw)
adb shell am force-stop com.dolti.meetapp
adb shell am start -a android.intent.action.VIEW \
  -d "https://meetapp.pl/event/c8e844b6-cd09-4da9-9f12-755a2dcce0f4"

# Sprawdź weryfikację App Links
adb shell dumpsys package d | grep meetapp.pl
```

### Testy Jednostkowe

```bash
flutter test test/features/deep_link/
```

- `deep_link_service_test.dart` - 15 testów (parsowanie, walidacja)
- `deep_link_listener_test.dart` - 3 testy (widget lifecycle)

---

## Troubleshooting

| Problem | Przyczyna | Rozwiązanie |
|---------|-----------|-------------|
| Link otwiera przeglądarkę | assetlinks.json niedostępny | Sprawdź `curl https://meetapp.pl/.well-known/assetlinks.json` |
| Dwa kliknięcia "wstecz" | Duplikaty na stosie | Używamy `router.push()` zamiast podwójnej nawigacji |
| Brak nawigacji przy cold start | Stos bez home | `router.go('/') + router.push('/event/...')` |
| "No GoRouter found" | Brak dostępu do routera | Przekazujemy instancję GoRouter bezpośrednio |

---

## Scope

### M1 (MVP) - DONE
- [x] HTTPS App Links (Android)
- [x] Custom scheme (Android, iOS)
- [x] Cold start navigation
- [x] Warm start navigation
- [x] Prawidłowy stos nawigacji
- [x] Share sheet systemowy
- [x] Kopiowanie linku

### M2 (Post-MVP)
- [ ] iOS Universal Links (wymaga Apple Developer Account)
- [ ] Analytics dla deep links
- [ ] Deep links do innych zasobów (grupy, serie)
- [ ] Podgląd linku w social media (Open Graph)

---

## Powiązane Features

- [FEATURE_01](FEATURE_01_Basic_Event_Operations.md) - Udostępnianie wydarzenia (US-06)

---

## Dokumentacja Techniczna

Szczegóły implementacji:
- Frontend: [meet-app-fe/docs/features/deep-links.md](../../meet-app-fe/docs/features/deep-links.md)
- Server deployment: [meet-app-fe/docs/deeplinks-deployment.md](../../meet-app-fe/docs/deeplinks-deployment.md)

---

## Changelog

| Data | Zmiana |
|------|--------|
| 2025-12-02 | Naprawiono cold start navigation (stos [Home, EventDetails]) |
| 2025-12-02 | Naprawiono warm start navigation (router.push bezpośrednio) |
| 2025-12-02 | Usunięto DeepLinkHandler, dodano DeepLinkListener |
| 2025-12-02 | Uproszczono DeepLinkService (tylko parsowanie) |
