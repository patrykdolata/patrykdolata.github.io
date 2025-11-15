# Feature 4: Event Series Management

## Standardized Spec

- Milestone: M1 (BASIC), M2 (ADVANCED)
- Goal: Szablony cyklicznych wydarzeń i generowanie eventów wg częstotliwości.
- In Scope (M1): WEEKLY/BIWEEKLY; generate z `startDate` + `count` (max 20); link event→series.
- Out of Scope (M1): MONTHLY, skipHolidays, pause/resume, edycja serii.
- Prerequisites: Feature 1; DB migracja `event_series` i FK `series_id` w `event`.
- Security/Permissions: CRUD serii tylko dla organizatora; walidacja limitów generacji.
- Acceptance Criteria (M1): generowanie poprawnych dat; max 20; powiązania zachowane.
- Backend API:
  - POST `/series`, GET `/series?organizerId={id|me}`
  - POST `/series/{id}/generate`
- Data Model:
  - event_series: organizer_id, location_id, frequency, dayOfWeek/time, defaults; event.series_id FK.
- Frontend UX:
  - CreateSeriesScreen; dialog Generate (startDate, count); prosta lista serii.
- Tests:
  - BE: kalkulacja dat (weekly/biweekly), limity, walidacje; FE: submit flows.

## Overview
Create recurring event templates with automatic event generation based on schedules (weekly, biweekly, monthly), holiday skipping, and series management.

**Priority**: MEDIUM | **Status**: 0% → 100%

---

## Milestone & Scope

- Milestone: M1 (MVP)
- Scope (M1):
  - WEEKLY/BIWEEKLY
  - Generate: `startDate` + `count` (max 20)
  - Link event → series (FK)
- Out of scope (Post‑MVP):
  - MONTHLY, `skipHolidays`, pause/resume
  - Edycja serii (poza usunięciem i stworzeniem nowej)

## Acceptance Criteria (M1)

- Utworzenie serii i wygenerowanie wydarzeń dla weekly/biweekly
- Limit bezpieczeństwa: max 20 eventów w jednym generowaniu
- Wydarzenia powiązane z serią

## Test Plan (smoke, M1)

- Generacja weekly/biweekly z poprawnymi datami
- Powiązania event → series istnieją


## Business Value
- Organizers save time with recurring event templates
- Automatic event generation reduces manual work
- Consistent scheduling improves participant planning
- Holiday awareness prevents scheduling conflicts

---

## Backend: Database Schema

```sql
CREATE TABLE event_series (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    organizer_id INTEGER NOT NULL REFERENCES _user(id),
    location_id BIGINT NOT NULL REFERENCES location(id),
    frequency_type VARCHAR(20) NOT NULL, -- WEEKLY, BIWEEKLY, MONTHLY
    frequency_interval INTEGER NOT NULL DEFAULT 1,
    schedule_json TEXT NOT NULL, -- {"days": [1,3,5], "time": "18:00"}
    slots INTEGER NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 0,
    price NUMERIC(19,2),
    currency VARCHAR(10) DEFAULT 'PLN',
    message TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, PAUSED
    skip_holidays BOOLEAN DEFAULT FALSE,
    auto_promote_from_waitlist BOOLEAN DEFAULT TRUE,
    send_notifications BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

ALTER TABLE event ADD COLUMN series_id BIGINT REFERENCES event_series(id);
CREATE INDEX idx_event_series ON event(series_id);
```

## Backend: Key Components

**Entities:**
- `EventSeriesEntity` - Series template with all event defaults
- `FrequencyType` enum - WEEKLY, BIWEEKLY, MONTHLY
- `SeriesStatus` enum - ACTIVE, PAUSED

**Service Methods:**
- `createSeries(request, user)` - Create series template
- `generateEvents(seriesId, startDate, endDate)` - Generate events from template
- `updateSeries(id, request, user)` - Update series configuration
- `pauseSeries(id, user)` / `resumeSeries(id, user)` - Control generation
- `deleteSeries(id, user)` - Delete series and optionally future events

**Schedule JSON Format:**
```json
{
  "days": [1, 3, 5],  // Monday=1, Sunday=7
  "time": "18:00",
  "duration": 120
}
```

**Holiday Logic:**
- Hardcoded Polish holidays list
- Optional: Integration with public holiday API
- Skip date if `skipHolidays` is true

---

## Frontend: Key Components

**Screens:**
- `SeriesListScreen` - List all user's series
- `CreateSeriesScreen` - Create series form with frequency picker
- `SeriesDetailsScreen` - View series details and generated events
- `GenerateEventsScreen` - Select date range for generation

**Widgets:**
- `FrequencyPicker` - Dropdown for WEEKLY/BIWEEKLY/MONTHLY
- `DaysOfWeekSelector` - Multi-select checkboxes (Mon-Sun)
- `SeriesListItem` - Display series with status badge

---

## API Endpoints

### POST /api/v1/series
Create event series
```json
{
  "name": "Weekly Volleyball",
  "locationId": 1,
  "frequencyType": "WEEKLY",
  "frequencyInterval": 1,
  "schedule": {"days": [1,3,5], "time": "18:00", "duration": 120},
  "slots": 12,
  "sportType": "VOLLEYBALL",
  "level": 3,
  "skipHolidays": true
}
```

### POST /api/v1/series/{id}/generate
Generate events from series
```json
{
  "startDate": "2025-11-05",
  "endDate": "2025-12-31",
  "maxEvents": 20
}
```

### GET /api/v1/series
Get user's series

### PUT /api/v1/series/{id}
Update series

### PUT /api/v1/series/{id}/pause
Pause series (no new generation)

### DELETE /api/v1/series/{id}?deleteFutureEvents=true
Delete series

---

## Implementation Steps

**Backend:**
1. Create migration V1_6__Add_event_series_table.sql
2. Create FrequencyType and SeriesStatus enums
3. Create EventSeriesEntity
4. Create SeriesRepository with custom queries
5. Create SeriesService with generation logic
6. Implement holiday checking logic
7. Create SeriesController with CRUD endpoints
8. Add authorization checks (only organizer)

**Frontend:**
1. Create series entities and enums
2. Create SeriesHttpClient with API methods
3. Create SeriesService
4. Build CreateSeriesScreen with frequency picker
5. Build SeriesListScreen with series cards
6. Build GenerateEventsScreen with date pickers
7. Implement series details with generated events list
8. Add series management to user profile

---

## Testing Checklist

- [ ] Create series with different frequencies
- [ ] Generate weekly events (verify dates)
- [ ] Generate biweekly events
- [ ] Generate monthly events
- [ ] Test holiday skipping
- [ ] Test max events limit
- [ ] Pause/resume series
- [ ] Update series configuration
- [ ] Delete series with/without future events
- [ ] Verify authorization (only organizer)
- [ ] Test generated events are editable
- [ ] Verify series link in event details

---

## Acceptance Criteria

1. ✅ Series templates created successfully
2. ✅ Event generation works for all frequency types
3. ✅ Holiday skipping functional
4. ✅ Generated events linked to series
5. ✅ Pause/resume controls working
6. ✅ Series CRUD operations complete
7. ✅ Frontend series management UI functional
8. ✅ Date picker and frequency selector working
9. ✅ Generated events appear in calendar/list
10. ✅ Authorization checks in place

---

## Notes for AI Agent

- Validate schedule JSON structure
- Limit max generated events per request (e.g., 52)
- Consider timezone handling for event times
- Generated events should be independently editable
- Deleting series doesn't delete past events (only future)
- Holiday list should be maintained in a config file
- Follow existing patterns for DTOs and services
