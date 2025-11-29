# Feature 99: Security & Privacy Audit

## Standardized Spec

| Pole | Wartość |
|------|---------|
| **Milestone** | M3 (Release Gate) |
| **Priority** | CRITICAL |
| **Status** | ❌ Not Started |
| **Goal** | Hardening bezpieczeństwa, testy przedprodukcyjne, zgodność RODO |
| **Exit Criteria** | 0 High/Critical issues, backup/DR tested |

---

## Overview

Kompleksowy audyt bezpieczeństwa i prywatności przed publicznym uruchomieniem. Obejmuje testy SAST/DAST, weryfikację auth/JWT, CORS, rate limiting, GDPR compliance i disaster recovery.

### Business Value

- **Bezpieczeństwo**: Ochrona danych użytkowników
- **Compliance**: Zgodność z RODO
- **Zaufanie**: Profesjonalne podejście do bezpieczeństwa
- **Ciągłość**: Backup/DR zapobiega utracie danych

---

## Status (Pre-Production Checklist)

| Obszar | Status | Uwagi |
|--------|--------|-------|
| **Scanning** |
| SAST (SpotBugs/FindSecBugs) | ❌ | Do wykonania |
| Dependency scan (OWASP DC) | ❌ | Do wykonania |
| Secrets scanning (Gitleaks) | ❌ | Do wykonania |
| **DAST** |
| OWASP ZAP scan | ❌ | Do wykonania |
| API fuzzing | ❌ | Do wykonania |
| **Access Control** |
| IDOR testing | ❌ | Do wykonania |
| Organizer-only endpoints | ⏳ | Zaimplementowane, do weryfikacji |
| **Auth & JWT** |
| Algorithm enforcement | ⏳ | HS256, do weryfikacji |
| Token expiration | ✅ | Skonfigurowane |
| Refresh token security | ⏳ | Do weryfikacji |
| CORS configuration | ✅ | Skonfigurowane |
| **Headers & TLS** |
| HTTPS (TLS 1.2+) | ⏳ | Do konfiguracji prod |
| Security headers | ❌ | Do dodania |
| HSTS | ❌ | Do dodania |
| **Rate Limiting** |
| Login rate limit | ❌ | Do dodania |
| API rate limit | ❌ | Do dodania |
| **Backup/DR** |
| Nightly backups | ⏳ | Skrypt gotowy |
| Restore test | ❌ | Do wykonania |
| DR runbook | ❌ | Do napisania |
| **GDPR** |
| Privacy Policy | ❌ | Do napisania |
| Data export | ❌ | Do zaimplementowania |
| Account deletion | ❌ | Do zaimplementowania |

---

## Pre-Production Test Plan

### 1. Static & Dependency Scanning
- Java BE: SpotBugs + FindSecBugs, Semgrep
- Dart/Flutter: Dart Code Metrics
- Dependencies: OWASP Dependency-Check lub Snyk

### 2. Dynamic Testing (DAST)
- OWASP ZAP baseline + full scan z autoryzacją JWT
- API fuzz: negatywne scenariusze (null, >max, injection payloads)
- Business logic tests: organizer-only endpoints

### 3. Access Control & IDOR
- Próby dostępu do zasobów innych użytkowników
- Weryfikacja `verifyOrganizer()` na wszystkich mutujących endpointach

### 4. Auth/JWT Hardening
- Wymusić `alg=HS256` (brak `none`)
- Silny sekret (256+ bits)
- Rotacja refresh tokenów
- CORS: whitelist domains

### 5. Transport & Headers
- TLS 1.2+ (SSL Labs A grade)
- HSTS, X-Frame-Options, X-Content-Type-Options
- CSP (dla przyszłej wersji web)

### 6. Rate Limiting
- Login: max 5 attempts / minute
- API: max 100 requests / minute
- Series generate: limit per day

---

## GDPR/RODO Readiness

### Dane osobowe (PII)
- Email, nickname, avatar
- Lokalizacje, numer telefonu
- Historia uczestnictwa

### Wymagane dokumenty
- [ ] Privacy Policy
- [ ] Terms of Service
- [ ] Rejestr czynności przetwarzania (ROPA)

### Prawa podmiotów
- [ ] Dostęp i eksport danych (JSON/CSV)
- [ ] Usunięcie konta (anonimizacja)
- [ ] Sprostowanie danych

### Retencja
- Logi: 30 dni
- Backupy: 30 dni (prod)
- Usunięte konta: natychmiastowa anonimizacja

---

## Exit Criteria

1. ✅ 0 High/Critical vulnerabilities otwartych
2. ✅ Medium z akceptacją ryzyka lub fix plan
3. ✅ Backup/restore przetestowane
4. ✅ DR runbook gotowy
5. ✅ Privacy Policy opublikowane
6. ✅ SSL Labs grade A

---

## Powiązane Features

- [FEATURE_Deployment](FEATURE_Deployment.md) - Infrastruktura i TLS
- [FEATURE_Testing](FEATURE_Testing_Documentation.md) - Testy

---

## Dokumentacja Techniczna

Szczegółowy checklist i procedury w:
- Backend: [meet-app-be/docs/security/](../../meet-app-be/docs/security/) (do utworzenia)
