# Plan migracji bibliotek - meet-app

Data: 2025-11-03

---

## Backend (meet-app-be) - Spring Boot + Maven

### Aktualne wersje
- Spring Boot: **3.4.5**
- Java: 17
- Lombok: 1.18.30
- JJWT: 0.11.5
- Mockito: 5.1.1
- PostgreSQL JDBC: 42.7.4
- Jackson: 2.15.2 (jawnie zdefiniowane)
- Maven Compiler Plugin: 3.11.0

---

### Najnowsze wersje (Listopad 2025)

| Biblioteka | Obecna | Najnowsza | Kompatybilność | Priorytet |
|------------|--------|-----------|----------------|-----------|
| **Spring Boot** | 3.4.5 | **3.5.7** | ⚠️ Breaking changes | Wysoki |
| **Lombok** | 1.18.30 | **1.18.40** | ⚠️ Wymaga konfiguracji | Wysoki |
| **JJWT** | 0.11.5 | **0.13.0** | ❌ Breaking changes API | Średni |
| **PostgreSQL JDBC** | 42.7.4 | **42.7.7** | ✅ Pełna | KRYTYCZNY (CVE) |
| **Jackson** | 2.15.2 | **Zarządzane przez Spring Boot** | ⚠️ Usuń jawną wersję | Wysoki |
| **Mockito** | 5.1.1 | **5.14.2** | ✅ Pełna | Niski |
| **Maven Compiler** | 3.11.0 | **3.14.1** | ✅ Pełna | Niski |

---

### 1. Spring Boot: 3.4.5 → 3.5.7

**Breaking changes:**
- Profile naming: tylko dash `-`, underscore `_`, litery i cyfry (nie mogą zaczynać/kończyć się na `-` lub `_`)
- `.enabled` properties: tylko `true` lub `false`
- `spring-boot-parent` module - usunięty
- Heapdump actuator: domyślnie `access=NONE`
- WebClient: follow redirects domyślnie włączone
- GraphQL properties: `spring.graphql.path` → `spring.graphql.http.path`
- `taskExecutor` bean nie auto-konfigurowany - użyj `applicationTaskExecutor`

**Akcja:**
- Zmień w pom.xml: `<version>3.5.7</version>`
- Sprawdź profile names
- Sprawdź `.enabled` properties
- Sprawdź GraphQL config (jeśli używasz)
- Sprawdź task executor (jeśli używasz)

---

### 2. PostgreSQL JDBC: 42.7.4 → 42.7.7

**Breaking changes:** Brak
**CVE:** CVE-2025-49146 (krytyczne!)

**Akcja:**
- Zmień w pom.xml: `<version>42.7.7</version>`

---

### 3. Lombok: 1.18.30 → 1.18.40

**Breaking changes:**
- Jackson annotations nie kopiowane automatycznie na gettery/settery
- JSpecify: pakiet `org.jspecify.nullness` → `org.jspecify.annotations`

**Akcja:**
1. Utwórz `lombok.config`:
   ```
   lombok.copyJacksonAnnotationsToAccessors = true
   ```
2. Zmień wersję na `1.18.40` (2 miejsca w pom.xml)
3. Sprawdź importy JSpecify: `grep -r "org.jspecify.nullness" src/`

---

### 4. Jackson: 2.15.2 → Zarządzane przez Spring Boot

**Problem:** Jawne wersje w pom.xml nadpisują Spring Boot BOM

**Akcja:**
- **USUŃ** `<version>2.15.2</version>` z:
  - `jackson-datatype-hibernate6`
  - `jackson-datatype-jsr310`
- Spring Boot 3.5.7 automatycznie użyje Jackson 2.18.x lub nowszej

**Test:**
- Wszystkie REST endpointy
- Serializacja dat
- Lazy loading Hibernate
- Error responses

---

### 5. Mockito: 5.1.1 → 5.14.2

**Breaking changes:** Brak

**Akcja:**
- Zmień w pom.xml: `<version>5.14.2</version>`

---

### 6. Maven Compiler Plugin: 3.11.0 → 3.14.1

**Breaking changes:** Brak

**Akcja:**
- Zmień w pom.xml: `<version>3.14.1</version>`

---

### 7. JJWT: 0.11.5 → 0.13.0 (OPCJONALNE)

**Breaking changes:** TAK - całkowite API change w 0.12.0

**Główne zmiany:**
- `setSigningKey()` → `verifyWith(SecretKey)`
- `parseClaimsJws()` → `parseSignedClaims()`
- Parser wymaga `.build()`

**Opcje:**
- **A)** Zostań na 0.11.5 (działa, ale brak updates)
- **B)** Migruj do 0.13.0 (wymaga zmian kodu - 6-8h)
- **C)** Zmień bibliotekę (patrz alternatywy poniżej)

**Alternatywy:**
1. **Spring Security OAuth2 Resource Server** (wbudowane w Spring Boot)
2. **Auth0 java-jwt** (`com.auth0:java-jwt:4.4.0`)
3. **Nimbus JOSE+JWT** (`com.nimbusds:nimbus-jose-jwt:9.37.3`)

---

## Frontend (meet-app-fe) - Flutter + Dart

### Aktualne wersje
- Dart SDK: >=3.8.1
- Flutter SDK: ~3.32
- dio: 5.7.0
- google_maps_flutter: 2.12.3
- provider: 6.1.2
- flutter_lints: 6.0.0

---

### Najnowsze wersje (Listopad 2025)

| Biblioteka | Obecna | Najnowsza | Kompatybilność | Priorytet |
|------------|--------|-----------|----------------|-----------|
| **Flutter SDK** | ~3.32 | **3.35.5** | ⚠️ Platform requirements | Wysoki |
| **Dart SDK** | 3.8.1 | **3.9.2** | ⚠️ Null safety improved | Wysoki |
| **dio** | 5.7.0 | **5.7.0** | ✅ Aktualne | - |
| **google_maps_flutter** | 2.12.3 | **2.13.1** | ⚠️ Sprawdź changelog | Średni |
| **flutter_map** (alternatywa) | - | **8.2.1** | 💰 100% darmowa | Opcjonalny |
| **provider** | 6.1.2 | **6.1.2** | ✅ Aktualne | - |
| **flutter_lints** | 6.0.0 | **6.0.0** | ✅ Aktualne | - |

---

### 1. Flutter SDK: 3.32 → 3.35.5

**Breaking changes:**
- **Android:** minSdkVersion → 24 (było prawdopodobnie 21)
- **iOS:** minimum → 13
- **macOS:** minimum → 10.15
- Theme deprecations (`ThemeData.indicatorColor`, etc.)
- Radio widgets redesign

**Akcja:**
1. `flutter upgrade`
2. `android/app/build.gradle`: `minSdkVersion 24`
3. `ios/Podfile`: `platform :ios, '13.0'`
4. `macos/Podfile`: `platform :osx, '10.15'`
5. Migruj deprecated theme properties

---

### 2. Dart SDK: 3.8.1 → 3.9.2

**Breaking changes:**
- Lepsze null safety (więcej ostrzeżeń `dead_code`)
- Flutter SDK upper bound respektowany
- `dart:html` klasy nie mogą być rozszerzane (tylko Web)

**Akcja:**
1. Zmień w pubspec.yaml:
   ```yaml
   environment:
     sdk: '>=3.9.2 <4.0.0'
   ```
2. `flutter pub get`
3. `dart fix --apply`

---

### 3. google_maps_flutter: 2.12.3 → 2.13.1

**Breaking changes:** Sprawdź changelog

**Akcja:**
1. Sprawdź: https://pub.dev/packages/google_maps_flutter/changelog
2. Zmień w pubspec.yaml: `google_maps_flutter: ^2.13.1`
3. `flutter pub get`
4. Testuj mapy, markery, interakcje

---

### 4. OPCJA: google_maps_flutter → flutter_map (Darmowa alternatywa)

**Priorytet:** Opcjonalne
**Oszczędności:** 100% kosztów Google Maps API

#### 🎯 Dlaczego warto rozważyć?

**Korzyści flutter_map:**
- ✅ **100% darmowa** - brak API key, brak limitów, brak kosztów
- ✅ **Vendor-free** - pełna kontrola, brak vendor lock-in
- ✅ **Cross-platform** - Android, iOS, Web, Linux, macOS, Windows
- ✅ **Offline support** - możliwość cache'owania map
- ✅ **Open-source** - OpenStreetMap
- ✅ **Aktywnie rozwijana** - v8.2.1 (2025)
- ✅ **Bardzo konfigurowalna**

**Co tracisz:**
- ❌ Google Places API / POI
- ❌ Google Directions API (ale jest darmowa alternatywa: OSRM)
- ❌ Google real-time traffic
- ❌ Google Street View

#### ⚠️ WAŻNE: Google Maps ToS

Nie możesz używać jednocześnie Google Maps i innych map w tej samej aplikacji!
> "Customer will not use the Google Maps Core Services with or near a non-Google Map"

**Musisz wybrać:** albo Google Maps, albo flutter_map.

#### Zmiany w pubspec.yaml

**Przed:**
```yaml
dependencies:
  google_maps_flutter: ^2.12.3
```

**Po:**
```yaml
dependencies:
  flutter_map: ^8.2.1
  latlong2: ^0.9.0  # Do współrzędnych
```

#### Przykład kodu

**Przed (Google Maps):**
```dart
import 'package:google_maps_flutter/google_maps_flutter.dart';

GoogleMap(
  initialCameraPosition: CameraPosition(
    target: LatLng(52.2297, 21.0122), // Warszawa
    zoom: 13.0,
  ),
  markers: {
    Marker(
      markerId: MarkerId('1'),
      position: LatLng(52.2297, 21.0122),
    ),
  },
)
```

**Po (flutter_map):**
```dart
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

FlutterMap(
  options: MapOptions(
    initialCenter: LatLng(52.2297, 21.0122), // Warszawa
    initialZoom: 13.0,
  ),
  children: [
    TileLayer(
      urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      userAgentPackageName: 'pl.flutterowo.meet-app',
    ),
    MarkerLayer(
      markers: [
        Marker(
          point: LatLng(52.2297, 21.0122),
          width: 80,
          height: 80,
          child: Icon(Icons.location_on, color: Colors.red, size: 40),
        ),
      ],
    ),
  ],
)
```

#### Akcja (jeśli decydujesz się na migrację)

1. Usuń `google_maps_flutter` z pubspec.yaml
2. Dodaj `flutter_map: ^8.2.1` i `latlong2: ^0.9.0`
3. `flutter pub get`
4. Znajdź wszystkie użycia GoogleMap:
   ```bash
   grep -r "GoogleMap" lib/
   grep -r "google_maps_flutter" lib/
   ```
5. Zamień kod map zgodnie z przykładem powyżej
6. Usuń Android/iOS konfigurację Google Maps (API keys)
7. Testuj wszystkie funkcje map

#### Czas migracji

- **Proste mapy (tylko wyświetlanie + markery):** 2-4h
- **Średnie (markery + interakcje + zoom):** 4-8h
- **Zaawansowane (routing + custom UI):** 1-2 dni

#### Routing (Directions) - Darmowa alternatywa

Jeśli potrzebujesz nawigacji/tras, użyj **OSRM** (darmowa alternatywa dla Google Directions):

**Pakiet:** `google_maps_directions_alternative` lub bezpośrednio OSRM API
**Koszt:** Darmowy
**API:** https://router.project-osrm.org/

#### Tile providers (alternatywy dla OSM)

Możesz użyć różnych tile providers:
- **OpenStreetMap:** `https://tile.openstreetmap.org/{z}/{x}/{y}.png` (darmowe)
- **Mapbox:** `https://api.mapbox.com/...` (50k free/miesiąc)
- **Stadia Maps:** `https://tiles.stadiamaps.com/...` (płatne)
- **Thunderforest:** `https://tile.thunderforest.com/...` (płatne)

#### Rekomendacja

**Migruj na flutter_map jeśli:**
- ✅ Nie potrzebujesz Google Places/POI
- ✅ Nie potrzebujesz Google real-time traffic
- ✅ Chcesz zaoszczędzić na kosztach API
- ✅ Chcesz offline maps
- ✅ Aplikacja jest w fazie developmentu

**Zostań z Google Maps jeśli:**
- ❌ Potrzebujesz Google Places API
- ❌ Potrzebujesz Google Directions API (chyba że OSRM wystarczy)
- ❌ Aplikacja już działa w produkcji (duży refactor)
- ❌ Potrzebujesz Google real-time traffic

#### Linki

- **flutter_map docs:** https://docs.fleaflet.dev/
- **flutter_map pub.dev:** https://pub.dev/packages/flutter_map
- **OSRM API:** https://project-osrm.org/
- **OpenStreetMap:** https://www.openstreetmap.org/

---

### Inne biblioteki (już aktualne)

- **dio: 5.7.0** ✅
- **provider: 6.1.2** ✅
- **flutter_lints: 6.0.0** ✅

---

## Kolejność wdrożenia

### Backend (3-5 dni)

1. **Dzień 1: Bezpieczeństwo + Proste**
   - PostgreSQL JDBC → 42.7.7 (30 min)
   - Mockito → 5.14.2 (15 min)
   - Maven Compiler → 3.14.1 (15 min)

2. **Dzień 2: Spring Boot + Jackson**
   - Jackson - usuń jawne wersje (1h)
   - Spring Boot → 3.5.7 (2-3h z testami)

3. **Dzień 3: Lombok**
   - Lombok → 1.18.40 + lombok.config (2-3h)

4. **Dzień 4-5: JJWT (opcjonalnie)**
   - JJWT → 0.13.0 (6-8h) LUB zostaw 0.11.5 LUB zmień bibliotekę

### Frontend (2-3 dni, lub 3-5 dni z migracją map)

1. **Dzień 1: SDK**
   - Dart SDK → 3.9.2 (1h)
   - Flutter SDK → 3.35.5 + platform updates (3-4h)

2. **Dzień 2: Biblioteki**
   - google_maps_flutter → 2.13.1 (1-2h z testami)

3. **Dzień 3-4 (OPCJONALNIE): Migracja map**
   - google_maps_flutter → flutter_map + OSRM (2-8h, zależnie od złożoności)

---

## Quick Commands

### Backend
```bash
cd /home/dolti/dev/workspace/git/meet-app-be

# Utwórz lombok.config
echo "lombok.copyJacksonAnnotationsToAccessors = true" > lombok.config

# Testuj po zmianach
./mvnw clean install
./mvnw test
./mvnw spring-boot:run
```

### Frontend
```bash
cd /home/dolti/dev/workspace/git/meet-app-fe/app

# Update
flutter upgrade
flutter pub get
dart fix --apply
flutter analyze
flutter test
flutter run
```

---

## Biblioteki bez zmian / aktualne

### Backend
- Wszystkie wymagają aktualizacji

### Frontend
- dio: 5.7.0 ✅
- provider: 6.1.2 ✅
- flutter_lints: 6.0.0 ✅

---

## Niekompatybilne biblioteki

**Brak!** Wszystkie biblioteki można zaktualizować.

Jedyna decyzyjna: **JJWT** - możesz:
- Zostać na 0.11.5
- Zmigrować do 0.13.0 (wymaga zmian kodu)
- Zmienić na Spring Security OAuth2 / Auth0 / Nimbus

---

## Minimalne testy

### Backend
- [ ] `./mvnw test` - pass
- [ ] Aplikacja się uruchamia
- [ ] REST API działa
- [ ] JWT login/logout działa
- [ ] Połączenie z bazą działa

### Frontend
- [ ] `flutter test` - pass
- [ ] `flutter analyze` - brak błędów
- [ ] Aplikacja buduje się
- [ ] HTTP requests działają
- [ ] Mapy działają (Google Maps lub flutter_map)
- [ ] Markery na mapach działają
- [ ] Zoom/pan/interakcje z mapą działają
- [ ] (Jeśli flutter_map) Offline tiles działają (opcjonalnie)

---

**Dokument:** 2025-11-03 | **Projekt:** meet-app
