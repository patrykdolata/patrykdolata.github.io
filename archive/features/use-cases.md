# Meet-App Complete Use Case Catalog

## Overview

This document contains all use cases for the Meet-App sports event management platform. Total: **48 use cases** across 3 categories.

---

## PLAYER USE CASES (P01-P20)

| ID | Use Case | Description | API/Screen |
|----|----------|-------------|------------|
| **P01** | Discover Events on Map | Browse interactive map with sport event markers, clusters | Home Screen / Map |
| **P02** | View Event Details | See title, time, location, slots, price, skill level, description | Event Details Screen |
| **P03** | Join Event | One-click registration to main list or waitlist | POST /events/{id}/join |
| **P04** | Leave Event | Cancel participation with auto-promotion of waitlist | DELETE /events/{id}/leave |
| **P05** | View Waitlist Position | Track position (#1, #2, etc.) and auto-promotion status | Event Details |
| **P06** | Receive Promotion Notification | Get notified instantly when promoted from waitlist to main list | WebSocket + Notification |
| **P07** | Confirm Attendance | Mark yourself as confirmed for the event | PUT /events/{id}/confirm |
| **P08** | View Participant List | See who's playing (main list + waitlist with positions) | Event Details |
| **P09** | Filter by Sport Type | Show only volleyball, basketball, tennis, etc. on map | Map Filter |
| **P10** | Filter by Skill Level | Find events matching your ability (1-5 scale) | Map/List Filter |
| **P11** | Save Favorite Location | Bookmark courts/venues with optional notes | POST /favorites |
| **P12** | View User Profile | Check other players' skill ratings, thumbs up/down | User Profile Screen |
| **P13** | Request Group Membership | Apply to join persistent player groups | POST /groups/{id}/join |
| **P14** | View My Groups | See all groups you're a member of | Groups Screen |
| **P15** | Leave Group | Remove yourself from a group | POST /groups/{id}/leave |
| **P16** | Receive Group Notifications | Real-time updates about group activities (8 types) | WebSocket |
| **P17** | Open Event via Deep Link | Access event details from shared URL (meetapp.pl/event/xxx) | [FEATURE_09](FEATURE_09_Deep_Links.md) |
| **P18** | View Skill Assessment | Check your volleyball skill ratings (Serve, Receive, etc.) | Skill Level Screen |
| **P19** | Browse Events List | Alternative list view instead of map with sorting | Events List Screen |
| **P20** | Check Connection Status | See WebSocket connection indicator (green/red) | Bottom Navigation |

---

## ORGANIZER USE CASES (O01-O20)

| ID | Use Case | Description | API/Screen |
|----|----------|-------------|------------|
| **O01** | Create Single Event | Set up one-time sports event with all details | POST /events |
| **O02** | Edit Event Details | Modify title, time, location, slots, price, description | PUT /events/{id} |
| **O03** | Cancel Event | Cancel with optional reason, notify all participants | PUT /events/{id}/cancel |
| **O04** | Delete Event | Remove event (only allowed if no participants) | DELETE /events/{id} |
| **O05** | Manage Participants | Add/remove players manually from main list or waitlist | POST/DELETE /participants |
| **O06** | Confirm Attendance | Toggle confirmation status per player as organizer | PUT /participants/{id}/confirm |
| **O07** | Track Payments | Mark players as paid/unpaid, view payment summary | PATCH /participants |
| **O08** | Create Event Series | Set up recurring event template (weekly/biweekly) | POST /series |
| **O09** | Generate Series Events | Auto-create multiple future events from template (max 20) | POST /series/{id}/generate |
| **O10** | Edit Series Template | Modify recurring event settings (price, time, slots) | PUT /series/{id} |
| **O11** | Pause/Resume Series | Temporarily stop/restart event generation | PATCH /series/{id}/status |
| **O12** | Create Player Group | Establish persistent community with name, sport, rules | POST /groups |
| **O13** | Manage Group Members | Approve/reject/remove member requests | POST /members/approve |
| **O14** | Set Core Players | Toggle core player status (auto-add to new events) | PATCH /members/core-player |
| **O15** | Assign Organizer Roles | Add ADMIN or ORGANIZER role to help manage group | POST /organizers |
| **O16** | Send Group Notifications | Automatic notifications when creating group events | WebSocket |
| **O17** | Link Event to Group | Associate events with specific groups for visibility | Event creation |
| **O18** | View My Events | Filter to see only events you're organizing | GET /events?organizerId=me |
| **O19** | Share Event Link | Generate shareable deep link (meetapp.pl/event/xxx) | [FEATURE_09](FEATURE_09_Deep_Links.md) |
| **O20** | View Event Analytics | See fill rate percentage, waitlist size, payment stats | Event Details |

---

## SYSTEM USE CASES (S01-S08)

| ID | Use Case | Description | Implementation |
|----|----------|-------------|----------------|
| **S01** | Auto-Promote Waitlist | Automatically move waitlist #1 to main list when slot opens | ParticipantService |
| **S02** | Auto-Complete Events | Mark past events as COMPLETED via scheduled job (hourly) | @Scheduled cron |
| **S03** | Send Real-Time Notifications | WebSocket + STOMP push for all user updates | WebSocketConfig |
| **S04** | Validate Event Data | Enforce business rules (slots 2-50, duration 30-480 min, etc.) | Jakarta Validation |
| **S05** | Handle JWT Authentication | Secure login with 24h access token, 7d refresh token | Spring Security |
| **S06** | Persist Notifications | Store all notifications in database with read/unread status | group_notification table |
| **S07** | Rate Limit API | Prevent abuse with Bucket4j rate limiting | RateLimitingConfig |
| **S08** | Handle Deep Links | Route meetapp.pl URLs to correct app screens | [FEATURE_09](FEATURE_09_Deep_Links.md) |

---

## NOTIFICATION TYPES (8 Group Notifications)

| ID | Type | Trigger | Recipient |
|----|------|---------|-----------|
| N01 | MEMBER_JOIN_REQUEST | User requests to join group | Group organizers |
| N02 | MEMBER_APPROVED | Organizer approves membership | Approved member |
| N03 | MEMBER_REJECTED | Organizer rejects membership | Rejected member |
| N04 | MEMBER_REMOVED | Organizer removes member | Removed member |
| N05 | PROMOTED_TO_CORE_PLAYER | Organizer promotes to core | Promoted member |
| N06 | DEMOTED_FROM_CORE_PLAYER | Organizer demotes from core | Demoted member |
| N07 | GROUP_UPDATED | Group details changed | All members |
| N08 | NEW_GROUP_EVENT | New event created for group | All members |

---

## VALIDATION RULES

| ID | Entity | Field | Rule |
|----|--------|-------|------|
| V01 | Event | title | 3-255 characters, required |
| V02 | Event | duration | 30-480 minutes |
| V03 | Event | slots | 2-50 participants |
| V04 | Event | startDateTime | Must be 30+ minutes in future |
| V05 | Event | price | 0-10,000 PLN (optional) |
| V06 | Event | level | 0-5 (0 = all levels) |
| V07 | User | login | 3-50 characters, unique |
| V08 | User | email | Valid format, unique |
| V09 | User | password | 8-100 characters |
| V10 | Group | name | 3-255 characters, unique |
| V11 | Group | maxMembers | 2-1,000 |
| V12 | Series | generation | Max 20 events per call |

---

## SPORT TYPES SUPPORTED (14)

| ID | Sport Type | Icon |
|----|------------|------|
| ST01 | Volleyball | 🏐 |
| ST02 | Beach Volleyball | 🏖️ |
| ST03 | Basketball | 🏀 |
| ST04 | Football (Soccer) | ⚽ |
| ST05 | Tennis | 🎾 |
| ST06 | Badminton | 🏸 |
| ST07 | Squash | 🎾 |
| ST08 | Table Tennis | 🏓 |
| ST09 | Running | 🏃 |
| ST10 | Cycling | 🚴 |
| ST11 | Fitness | 💪 |
| ST12 | Swimming | 🏊 |
| ST13 | Gym | 🏋️ |
| ST14 | Other | ⭐ |

---

## USER JOURNEYS

### Player Journey
```
P01 → P02 → P03 → P05/P06 → P07 → P08 → P04 (optional)
```
1. Discover Events on Map (P01)
2. View Event Details (P02)
3. Join Event (P03)
4. View Waitlist Position / Receive Promotion (P05/P06)
5. Confirm Attendance (P07)
6. View Participant List (P08)
7. Leave Event if needed (P04)

### Organizer Journey
```
O12 → O13 → O14 → O08 → O09 → O05 → O07 → O03
```
1. Create Player Group (O12)
2. Manage Group Members (O13)
3. Set Core Players (O14)
4. Create Event Series (O08)
5. Generate Series Events (O09)
6. Manage Participants (O05)
7. Track Payments (O07)
8. Cancel/Complete Events (O03)

---

## SUMMARY

| Category | Count | ID Range |
|----------|-------|----------|
| Player Use Cases | 20 | P01-P20 |
| Organizer Use Cases | 20 | O01-O20 |
| System Use Cases | 8 | S01-S08 |
| Notification Types | 8 | N01-N08 |
| Validation Rules | 12 | V01-V12 |
| Sport Types | 14 | ST01-ST14 |
| **Total Items** | **82** | - |

---

## MISSING/FUTURE USE CASES

| ID | Feature | Description | Priority |
|----|---------|-------------|----------|
| F01 | In-App Chat | Direct messaging between players | Medium |
| F02 | Event Comments | Discussion thread on events | Low |
| F03 | Player Ratings UI | Complete thumbs up/down interface | Medium |
| F04 | Push Notifications | FCM/APNs native push | High |
| F05 | Offline Mode | Cache data for offline access | Low |
| F06 | Event Photos | Media uploads for events | Low |
| F07 | Team Auto-Balancing | Automatic skill-based team formation | Medium |
| F08 | Tournament Mode | Bracket/league support | Low |
| F09 | Location Search | Search by venue name | Medium |
| F10 | Event History | Full participation history endpoint | Medium |

---

*Last updated: December 2025*
