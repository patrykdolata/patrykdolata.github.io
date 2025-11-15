# Feature: Security & Privacy (Post‑Milestones)

## Standardized Spec

- Milestone: M3 (Post‑MVP, Release Gate)
- Goal: Hardening bezpieczeństwa, testy przedprodukcyjne, zgodność RODO, backup/DR.
- In Scope: SAST/DAST/Deps, auth/JWT/CORS/Rate limits, headers/TLS/Nginx, logging/audit/monitoring, backup/DR, GDPR readiness.
- Out of Scope: wdrożenie web (CSP – na przyszłość), performance pełne (bazeline osobno).
- Acceptance Criteria: 0 High/Critical otwartych; raporty i test restore OK; polityki RODO gotowe.

## Overview
Comprehensive security hardening, pre‑production testing, and GDPR compliance work to be executed after completing all product milestones. This feature formalizes a threat‑model‑driven checklist, validation plan, and compliance deliverables before public release.

**Milestone:** Post‑MVP (after M1/M2/M3) • **Priority:** Release Gate • **Owners:** Eng + Sec • **Target:** Pre‑launch freeze window

---

## Context: Stack & Architecture
- Backend: Spring Boot (Java 21), PostgreSQL, Flyway, JWT auth, HikariCP
- Frontend: Flutter (mobile, no web for now), SecureStorage for tokens
- Infra: Nginx reverse proxy + TLS (Let’s Encrypt), Ubuntu 22.04, Raspberry Pi 4B (prod), Docker compose (local), hosting in Poland (EU)
- Data: użytkownicy, wydarzenia, uczestnicy (PII: e‑mail, nick, avatar, lokalizacje, numer telefonu), logi

---

## Threat Model (high‑level)
Actors: anonymous attacker (internet), zwykły użytkownik, organizator, insider, atakujący sieć (MiTM), posiadacz skradzionego urządzenia, kompromitacja CI/sekretów.

Assets: JWT (access/refresh), konta użytk., dane uczestników, uprawnienia organizatora, dane lokalizacji, serwer i DB, sekrety (JWT_SECRET, DB creds), logi.

Key attack vectors (examples):
- Auth/JWT: kradzież tokenu, nieprawidłowe alg/exp, słaby sekret, niewłaściwe CORS, reuse refresh tokenów, brak rotacji
- Broken Access Control (IDOR): dostęp do cudzych eventów/uczestników/serii (organizer‑only checks)
- Injection: JPQL/SQL (dynamiczne query), header‑based injection, log injection
- Misconfig: błędne CORS, nadmiarowe nagłówki serwera, publiczne endpoints (Actuator)
- XSS/CSRF: szczególnie dla wersji web (Flutter web), nieprawidłowe originy, brak nagłówków
- DoS/brak limitów: brute force login, generowanie serii bez limitów, brak paginacji
- Sensitive data exposure: logi z PII/JWT, stack traces
- Supply chain: podatne zależności (BE/FE), obrazy docker
- Device risks (mobile): debug builds, przechowywanie tokenów, clipboard, screen capture

---

## Pre‑Production Security Test Plan

1) Static & Dependency Scanning
- Java BE: SpotBugs + FindSecBugs, Semgrep (java spring), Sonar (opcjonalnie)
- Dart/Flutter: Dart Code Metrics, Semgrep (dart)
- Dependencies: OWASP Dependency‑Check lub Snyk (BE/FE)
- Secrets scanning: Gitleaks (repo + env), trivy‑config (opcjonalnie)

2) Dynamic Testing (DAST) & API Fuzz
- OWASP ZAP baseline + full scan z autoryzacją (JWT), target: Nginx https
- API fuzz: Schemathesis (jeśli OpenAPI), negatywne scenariusze (null, >max, injection payloads)
- Business logic tests: organizer‑only endpoints (add/remove participants, cancel event, series generate)

3) Access Control & IDOR
- Manual gray‑box: 
  - Próby dostępu do `/events/{id}`, `/events/{id}/participants`, `/series` innych użytkowników
  - Sprawdzenie warunku “owner/organizer” na każdym mutującym endpointcie
- Mass assignment: DTO tylko dozwolone pola; read‑only w encjach; testy negatywne

4) Auth/JWT Hardening
- Wymusić `alg=HS256/RS256` (brak `none`), silny sekret, `exp` + `iat`, clock skew
- Rotacja refresh tokenów + detekcja reuse; blacklist/denylist przy logout
- CORS: biała lista domen, brak `*` z Credentials; zabezp. preflight
- CSRF: jeśli cookies dla web – token anty‑CSRF; jeśli Authorization header – sprawdź, że cookies nieużywane

5) Input/Output Validation
- Walidacja dat, duration, coords, rozmiarów tekstu; odrzucanie binarnych payloadów
- Serializacja/Deserializacja: Jackson z `FAIL_ON_UNKNOWN_PROPERTIES`
- Output encoding (web): nagłówki, brak wstrzyknięć w HTML/JS

6) Rate limiting, DoS i Abuse Controls
- Rate limit: login, register, POST/PUT/DELETE, generate series
- Pagination i limity dla list: `/events`, `/participants`
- Nginx: body size limits, timeouts; ochrona przed Slowloris

7) Transport & Headers
- TLS: SSL Labs A grade; HSTS (includeSubDomains, preload), OCSP stapling
- Security headers: `Content-Security-Policy` (dla web), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`

8) Infra & Secrets
- Nginx: minimalny server tokens, twarde ciphers, HTTP/2 ALPN
- Ubuntu hardening: ufw, fail2ban, minimal packages, non‑root user dla serwisu
- Systemd: ograniczenia (NoNewPrivileges, PrivateTmp, CapabilityBoundingSet)
- Sekrety: .env poza repo, ograniczone uprawnienia, rotacja haseł, backup secrets inventory

9) Logging, Auditing, Monitoring
- Maskowanie PII/JWT w logach; brak stack traces do klienta
- Audit trail: kto wykonał create/edit/delete/cancel
- Alerty: 4xx/5xx spikes, auth failures, suspicious rates

10) Mobile (Flutter) Checklist
- SecureStorage włączone; brak logowania tokenów
- Wyłączone debug builds, proguard/minify dla release
- Brak kopiowania tokenów do clipboard, blokada screenshot (opcjonalnie)

11) Backup & Disaster Recovery (DR)
- Postgres backups: 
  - Nightly full backup + WAL archiving (PITR)
  - Retencja: 7/14/30 dni (prod → doprecyzować), rotacja
  - Offsite copy (szyfrowane), test odtworzenia co sprint (restore test)
- App/Config backups: Nginx, .env (bez sekretnych w repo), systemd unit files
- Runbook DR: RPO/RTO, scenariusze (awaria SD, utrata urządzenia, korupcja DB), procedury przywracania
- Monitoring backupów: alert przy nieudanych backupach/odtworzeniach

Deliverables:
- Raport DAST + exploity IDOR (jeśli znalezione)
- Raport SAST/Dependency, lista poprawek i priorytety
- Lista nagłówków bezpieczeństwa i wynik skanów (ZAP/Observatory/SSL Labs)
- Backup/DR: skrypty backupu/restore, logi z testu odtworzenia, opis RPO/RTO

Exit Criteria:
- 0 High/Critical findings otwartych; Medium z akceptacją ryzyka lub fix plan
- Testy: green dla smoke + negatywne krytyczne

---

## OWASP ASVS / Top‑10 Controls Mapping (skrót)
- A01 Broken Access Control: owner checks, policy‑enforced controllers, deny by default
- A02 Cryptographic Failures: TLS A grade, silny JWT secret/keys, rotacja refresh
- A03 Injection: param‑binding, brak dynamicznych raw queries, escape/validate inputs
- A04 Insecure Design: limity generowania, paginacja, brak “delete without checks”
- A05 Security Misconfiguration: CORS allow‑list, Actuator zabezpieczony, prod profiles
- A06 Vulnerable Components: dependency scanning (CI), regular updates
- A07 Identification & Auth Failures: brute‑force limits, lockouts, MFA (opcjonalnie post‑MVP)
- A08 Integrity Failures: signed JWT, pinned deps, checksums (opcjonalnie)
- A09 Security Logging & Monitoring: central logs, korelacja, alerting
- A10 SSRF: brak bezpośrednich wywołań zewnętrznych z user‑controlled URL (weryfikuj jeśli dojdą)

---

## Performance & Resilience
- k6 scenariusze: 
  - GET `/events` (mapa) z 10k eventów – paginacja/okienkowanie
  - GET `/events?organizerId=me` – typowy widok listy
  - POST `/series/{id}/generate` – limity i monitorowanie czasu
- DB: indeksy (`start_date_time`, `organizer_id`, `location_id`), EXPLAIN i plan cache
- Pooling: HikariCP sizing, connection timeouty
- Reverse proxy: keep‑alive, worker_processes, sendfile

---

## GDPR/RODO Readiness
Legal/Proces:
- Podstawa prawna przetwarzania (umowa/uzasadniony interes; marketing – zgoda)
- Privacy Policy + Terms (prośba o akceptację przy rejestracji)
- Rejestr czynności przetwarzania; DPIA jeśli ryzyko wysokie (lokalizacje/zdrowie – brak)
- Umowy powierzenia (DPA) z podmiotami przetwarzającymi (hosting, e‑mail)

Prawa podmiotów:
- Dostęp i eksport danych (JSON/CSV), sprostowanie, przenoszalność
- Usunięcie konta: kasowanie/anonimizacja w eventach i uczestnikach (zachować integralność)
- Retencja: polityka utrzymywania danych (logi, backupy), proces usuwania wg harmonogramu
  - Uwaga na numery telefonu i lokalizacje: minimalizacja, potrzebność, usuwanie na żądanie

Bezpieczeństwo danych:
- Szyfrowanie w tranzycie (TLS) + dysk/backup (jeśli możliwe; lub fizyczne zabezpieczenia serwera)
- Ograniczenia dostępu (RBAC), least privilege dla DB, audyty
- Zgłaszanie naruszeń: proces 72h, kontakt DPO/owner

Cookies/Trackers (jeśli web w przyszłości):
- Baner zgody dla analytics/marketing; brak śledzenia bez zgody

Dokumentacja końcowa:
- Polityki: Privacy, Retencja, Incydenty, Dostęp do danych
- Rejestry: ROPA, rejestr naruszeń, rejestr wniosków

---

## Payments (Future)
- Plan: integracja Stripe + BLIK w przyszłości
- Zalecenia: 
  - Nie przechowywać danych kart; korzystać z tokenizacji procesora
  - Webhook security (podpisy), idempotency keys
  - Reconciliacja, audyty finansowe, osobne logi płatności (bez PII nadmiarowego)

## Questions for Clarification
- Flutter web: obecnie nie; w przyszłości wymagane domeny (CORS, CSP)
- PII: e‑mail, nick, avatar, lokalizacje, numer telefonu – czy występują inne pola wrażliwe?
- Hosting: Polska (UE). Czy planowane są transfery danych poza EOG?
- Integracje zewnętrzne: e‑mail/analytics/crash – jakie narzędzia przewidziane?
- Usunięcie konta: czy anonimizować historyczne wpisy/uczestnictwa? w jakim zakresie?
- Wydajność: na start baseline; docelowe p95/RPS doprecyzujemy z realnym ruchem
