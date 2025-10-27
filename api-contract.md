# 📡 Meet-App API Contract

## Overview

**Base URL**: `https://api.meetapp.com/api/v1`
**Protocol**: HTTPS only
**Content-Type**: `application/json`
**Authentication**: JWT Bearer Token
**API Version**: v1

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Groups](#3-groups)
4. [Series](#4-series)
5. [Events](#5-events)
6. [Participants](#6-participants)
7. [Payments](#7-payments)
8. [Notifications](#8-notifications)
9. [Invites](#9-invites)
10. [Common Models](#10-common-models)
11. [Error Handling](#11-error-handling)

---

## 1. Authentication

### 1.1 Register

**Endpoint**: `POST /auth/register`
**Auth Required**: No

**Request Body**:
```json
{
  "email": "jan.kowalski@example.com",
  "password": "SecurePass123!",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "phone": "+48123456789"
}
```

**Validation Rules**:
- `email`: Valid email format, unique
- `password`: Min 8 characters, at least 1 uppercase, 1 number, 1 special char
- `firstName`: Min 2 characters, max 100
- `lastName`: Min 2 characters, max 100
- `phone`: Valid phone format (E.164)

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "jan.kowalski@example.com",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "phone": "+48123456789",
      "role": "MEMBER",
      "emailVerified": false,
      "createdAt": "2024-11-01T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  },
  "message": "Rejestracja zakończona pomyślnie"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Nieprawidłowe dane wejściowe",
      "fields": {
        "email": "Email jest już zajęty",
        "password": "Hasło musi zawierać minimum 8 znaków"
      }
    }
  }
  ```

---

### 1.2 Login

**Endpoint**: `POST /auth/login`
**Auth Required**: No

**Request Body**:
```json
{
  "email": "jan.kowalski@example.com",
  "password": "SecurePass123!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-123",
      "email": "jan.kowalski@example.com",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "phone": "+48123456789",
      "role": "MEMBER",
      "avatarUrl": "https://cdn.meetapp.com/avatars/123.jpg"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "success": false,
    "error": {
      "code": "INVALID_CREDENTIALS",
      "message": "Nieprawidłowy email lub hasło"
    }
  }
  ```

---

### 1.3 Refresh Token

**Endpoint**: `POST /auth/refresh`
**Auth Required**: No

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

---

### 1.4 Logout

**Endpoint**: `POST /auth/logout`
**Auth Required**: Yes

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Wylogowano pomyślnie"
}
```

---

### 1.5 Request Magic Link

**Endpoint**: `POST /auth/magic-link/request`
**Auth Required**: No

**Request Body**:
```json
{
  "emailOrPhone": "jan.kowalski@example.com"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "sent": true,
    "method": "email",
    "expiresIn": 900
  },
  "message": "Link został wysłany na jan.k***@example.com"
}
```

---

### 1.6 Authenticate with Magic Link

**Endpoint**: `POST /auth/magic-link/authenticate/{token}`
**Auth Required**: No

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    }
  }
}
```

---

## 2. Users

### 2.1 Get Current User

**Endpoint**: `GET /users/me`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "email": "jan.kowalski@example.com",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "phone": "+48123456789",
    "role": "MEMBER",
    "avatarUrl": "https://cdn.meetapp.com/avatars/123.jpg",
    "emailVerified": true,
    "phoneVerified": false,
    "notificationEnabled": true,
    "notificationEmail": true,
    "notificationPush": true,
    "notificationSms": false,
    "createdAt": "2024-11-01T10:00:00Z",
    "updatedAt": "2024-11-15T14:30:00Z"
  }
}
```

---

### 2.2 Update Current User

**Endpoint**: `PUT /users/me`
**Auth Required**: Yes

**Request Body**:
```json
{
  "firstName": "Jan",
  "lastName": "Kowalski",
  "phone": "+48123456789",
  "notificationEnabled": true,
  "notificationEmail": true,
  "notificationPush": true,
  "notificationSms": false
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... },
  "message": "Profil zaktualizowany"
}
```

---

### 2.3 Update Password

**Endpoint**: `PUT /users/me/password`
**Auth Required**: Yes

**Request Body**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Hasło zmienione pomyślnie"
}
```

---

### 2.4 Upload Avatar

**Endpoint**: `POST /users/me/avatar`
**Auth Required**: Yes
**Content-Type**: `multipart/form-data`

**Request**:
```
POST /users/me/avatar
Content-Type: multipart/form-data

file: [binary image data]
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "avatarUrl": "https://cdn.meetapp.com/avatars/123.jpg"
  }
}
```

---

### 2.5 Get User Statistics

**Endpoint**: `GET /users/me/statistics`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalEvents": 42,
    "attendedEvents": 38,
    "attendanceRate": 90.48,
    "upcomingEvents": 3,
    "totalPayments": 950.00,
    "currency": "PLN"
  }
}
```

---

### 2.6 Register FCM Token

**Endpoint**: `POST /users/me/fcm-token`
**Auth Required**: Yes

**Request Body**:
```json
{
  "token": "dGhpc2lzYWZha2V0b2tlbjEyMzQ1...",
  "deviceType": "ANDROID",
  "deviceName": "Samsung Galaxy S21",
  "deviceId": "device-uuid-456"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Token FCM zarejestrowany"
}
```

---

## 3. Groups

### 3.1 List Groups

**Endpoint**: `GET /groups`
**Auth Required**: Yes

**Query Parameters**:
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 20, max: 100)
- `sportType` (optional): Filter by sport type

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid-group-1",
        "name": "Siatkówka Przeźmierowo",
        "description": "Grupa miłośników siatkówki",
        "sportType": "VOLLEYBALL",
        "defaultVenue": "Kościelna 53, Przeźmierowo",
        "city": "Przeźmierowo",
        "defaultCapacity": 12,
        "defaultPrice": 25.00,
        "currency": "PLN",
        "logoUrl": "https://cdn.meetapp.com/groups/1.jpg",
        "color": "#667eea",
        "isActive": true,
        "isPublic": false,
        "memberCount": 24,
        "role": "ORGANIZER",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ],
    "page": {
      "number": 0,
      "size": 20,
      "totalElements": 1,
      "totalPages": 1
    }
  }
}
```

---

### 3.2 Get Group Details

**Endpoint**: `GET /groups/{groupId}`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-group-1",
    "name": "Siatkówka Przeźmierowo",
    "description": "Grupa miłośników siatkówki",
    "sportType": "VOLLEYBALL",
    "defaultVenue": "Kościelna 53, Przeźmierowo",
    "city": "Przeźmierowo",
    "defaultCapacity": 12,
    "defaultPrice": 25.00,
    "currency": "PLN",
    "logoUrl": "https://cdn.meetapp.com/groups/1.jpg",
    "color": "#667eea",
    "isActive": true,
    "isPublic": false,
    "memberCount": 24,
    "role": "ORGANIZER",
    "permissions": {
      "canCreateEvents": true,
      "canManageParticipants": true,
      "canManagePayments": true,
      "canManageMembers": true
    },
    "createdBy": {
      "id": "uuid-123",
      "firstName": "Jan",
      "lastName": "Kowalski"
    },
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-11-01T10:00:00Z"
  }
}
```

---

### 3.3 Create Group

**Endpoint**: `POST /groups`
**Auth Required**: Yes

**Request Body**:
```json
{
  "name": "Siatkówka Przeźmierowo",
  "description": "Grupa miłośników siatkówki",
  "sportType": "VOLLEYBALL",
  "defaultVenue": "Kościelna 53, Przeźmierowo",
  "city": "Przeźmierowo",
  "defaultCapacity": 12,
  "defaultPrice": 25.00,
  "currency": "PLN",
  "color": "#667eea",
  "isPublic": false
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": { ... },
  "message": "Grupa utworzona pomyślnie"
}
```

---

### 3.4 Update Group

**Endpoint**: `PUT /groups/{groupId}`
**Auth Required**: Yes (OWNER or ADMIN)

**Request Body**: Same as Create Group

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... },
  "message": "Grupa zaktualizowana"
}
```

---

### 3.5 Delete Group

**Endpoint**: `DELETE /groups/{groupId}`
**Auth Required**: Yes (OWNER only)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Grupa usunięta"
}
```

---

### 3.6 List Group Members

**Endpoint**: `GET /groups/{groupId}/members`
**Auth Required**: Yes

**Query Parameters**:
- `page`, `size`: Pagination

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid-member-1",
        "user": {
          "id": "uuid-123",
          "firstName": "Jan",
          "lastName": "Kowalski",
          "avatarUrl": "https://cdn.meetapp.com/avatars/123.jpg"
        },
        "role": "ORGANIZER",
        "permissions": {
          "canCreateEvents": true,
          "canManageParticipants": true,
          "canManagePayments": true
        },
        "totalEvents": 42,
        "attendedEvents": 38,
        "attendanceRate": 90.48,
        "joinedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "page": { ... }
  }
}
```

---

### 3.7 Add Group Member

**Endpoint**: `POST /groups/{groupId}/members`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "userId": "uuid-456",
  "role": "MEMBER",
  "permissions": {
    "canCreateEvents": false,
    "canManageParticipants": false,
    "canManagePayments": false
  }
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": { ... },
  "message": "Członek dodany do grupy"
}
```

---

### 3.8 Update Member Role

**Endpoint**: `PUT /groups/{groupId}/members/{userId}`
**Auth Required**: Yes (ADMIN+)

**Request Body**:
```json
{
  "role": "ORGANIZER",
  "permissions": {
    "canCreateEvents": true,
    "canManageParticipants": true,
    "canManagePayments": true
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... },
  "message": "Uprawnienia zaktualizowane"
}
```

---

### 3.9 Remove Member

**Endpoint**: `DELETE /groups/{groupId}/members/{userId}`
**Auth Required**: Yes (ADMIN+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Członek usunięty z grupy"
}
```

---

### 3.10 Get Group Statistics

**Endpoint**: `GET /groups/{groupId}/statistics`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalEvents": 156,
    "upcomingEvents": 8,
    "totalMembers": 24,
    "activeMembers": 18,
    "averageAttendance": 85.5,
    "totalRevenue": 39000.00,
    "currency": "PLN"
  }
}
```

---

## 4. Series

### 4.1 List Series

**Endpoint**: `GET /series`
**Auth Required**: Yes

**Query Parameters**:
- `groupId` (required): Group ID
- `isActive` (optional): Filter by active status

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-series-1",
      "groupId": "uuid-group-1",
      "name": "Środy 18:30",
      "description": "Regularne spotkania w środy",
      "recurrenceType": "WEEKLY",
      "dayOfWeek": 3,
      "startTime": "18:30:00",
      "endTime": "20:30:00",
      "venue": "Kościelna 53, Przeźmierowo",
      "capacity": 12,
      "waitlistCapacity": 5,
      "price": 25.00,
      "currency": "PLN",
      "autoPromoteWaitlist": true,
      "requirePayment": true,
      "registrationDeadlineHours": 2,
      "startsFrom": "2024-01-01",
      "endsAt": null,
      "isActive": true,
      "generatedEventsCount": 45,
      "nextEventDate": "2024-11-06",
      "createdBy": {
        "id": "uuid-123",
        "firstName": "Jan",
        "lastName": "Kowalski"
      },
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

---

### 4.2 Get Series Details

**Endpoint**: `GET /series/{seriesId}`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 4.3 Create Series

**Endpoint**: `POST /series`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "groupId": "uuid-group-1",
  "name": "Środy 18:30",
  "description": "Regularne spotkania w środy",
  "recurrenceType": "WEEKLY",
  "dayOfWeek": 3,
  "startTime": "18:30:00",
  "endTime": "20:30:00",
  "venue": "Kościelna 53, Przeźmierowo",
  "capacity": 12,
  "waitlistCapacity": 5,
  "price": 25.00,
  "autoPromoteWaitlist": true,
  "requirePayment": true,
  "registrationDeadlineHours": 2,
  "startsFrom": "2024-11-01",
  "endsAt": null
}
```

**Validation Rules**:
- `recurrenceType`: WEEKLY, BIWEEKLY, MONTHLY
- `dayOfWeek`: 1-7 (1=Monday, 7=Sunday) - required for WEEKLY/BIWEEKLY
- `dayOfMonth`: 1-31 - required for MONTHLY
- `capacity`: Min 2, Max 100
- `waitlistCapacity`: Min 0, Max 50

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": { ... },
  "message": "Seria utworzona pomyślnie"
}
```

---

### 4.4 Update Series

**Endpoint**: `PUT /series/{seriesId}`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**: Same as Create Series

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... },
  "message": "Seria zaktualizowana"
}
```

---

### 4.5 Delete Series

**Endpoint**: `DELETE /series/{seriesId}`
**Auth Required**: Yes (ORGANIZER+)

**Query Parameters**:
- `deleteEvents` (optional): Delete all future events from this series (default: false)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Seria usunięta"
}
```

---

### 4.6 Generate Events from Series

**Endpoint**: `POST /series/{seriesId}/generate`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "weeks": 4
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "generatedCount": 4,
    "events": [
      {
        "id": "uuid-event-1",
        "eventDate": "2024-11-06",
        "startTime": "18:30:00",
        "endTime": "20:30:00"
      },
      {
        "id": "uuid-event-2",
        "eventDate": "2024-11-13",
        "startTime": "18:30:00",
        "endTime": "20:30:00"
      }
    ]
  },
  "message": "Wygenerowano 4 wydarzenia"
}
```

---

### 4.7 Preview Generated Events

**Endpoint**: `GET /series/{seriesId}/preview`
**Auth Required**: Yes

**Query Parameters**:
- `weeks` (optional): Number of weeks to preview (default: 4)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "previewCount": 4,
    "events": [
      {
        "eventDate": "2024-11-06",
        "startTime": "18:30:00",
        "endTime": "20:30:00",
        "venue": "Kościelna 53, Przeźmierowo",
        "willBeCreated": true
      },
      {
        "eventDate": "2024-11-13",
        "startTime": "18:30:00",
        "endTime": "20:30:00",
        "venue": "Kościelna 53, Przeźmierowo",
        "willBeCreated": true
      }
    ]
  }
}
```

---

## 5. Events

### 5.1 List Events

**Endpoint**: `GET /events`
**Auth Required**: Yes

**Query Parameters**:
- `groupId` (optional): Filter by group
- `from` (optional): Date from (ISO 8601)
- `to` (optional): Date to (ISO 8601)
- `status` (optional): SCHEDULED, ONGOING, COMPLETED, CANCELLED
- `page`, `size`: Pagination

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid-event-1",
        "groupId": "uuid-group-1",
        "seriesId": "uuid-series-1",
        "name": "Środy 18:30",
        "description": null,
        "eventDate": "2024-11-06",
        "startTime": "18:30:00",
        "endTime": "20:30:00",
        "venue": "Kościelna 53, Przeźmierowo",
        "venueLat": 52.4064,
        "venueLng": 16.7834,
        "capacity": 12,
        "currentParticipants": 8,
        "waitlistCapacity": 5,
        "currentWaitlist": 2,
        "price": 25.00,
        "currency": "PLN",
        "autoPromoteWaitlist": true,
        "requirePayment": true,
        "registrationDeadline": "2024-11-06T16:30:00Z",
        "status": "SCHEDULED",
        "userStatus": {
          "isJoined": true,
          "isWaitlist": false,
          "position": 7,
          "confirmed": true,
          "paid": true
        },
        "createdBy": {
          "id": "uuid-123",
          "firstName": "Jan",
          "lastName": "Kowalski"
        },
        "createdAt": "2024-10-15T10:00:00Z"
      }
    ],
    "page": { ... }
  }
}
```

---

### 5.2 Get Event Details

**Endpoint**: `GET /events/{eventId}`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-event-1",
    "groupId": "uuid-group-1",
    "group": {
      "id": "uuid-group-1",
      "name": "Siatkówka Przeźmierowo",
      "sportType": "VOLLEYBALL"
    },
    "seriesId": "uuid-series-1",
    "name": "Środy 18:30",
    "description": null,
    "eventDate": "2024-11-06",
    "startTime": "18:30:00",
    "endTime": "20:30:00",
    "venue": "Kościelna 53, Przeźmierowo",
    "venueLat": 52.4064,
    "venueLng": 16.7834,
    "capacity": 12,
    "currentParticipants": 8,
    "waitlistCapacity": 5,
    "currentWaitlist": 2,
    "price": 25.00,
    "currency": "PLN",
    "autoPromoteWaitlist": true,
    "requirePayment": true,
    "registrationDeadline": "2024-11-06T16:30:00Z",
    "status": "SCHEDULED",
    "organizerNotes": "Proszę o punktualne przybycie",
    "userStatus": {
      "isJoined": true,
      "isWaitlist": false,
      "position": 7,
      "confirmed": true,
      "paid": true
    },
    "statistics": {
      "confirmedCount": 6,
      "paidCount": 7,
      "fillRate": 66.67
    },
    "createdBy": {
      "id": "uuid-123",
      "firstName": "Jan",
      "lastName": "Kowalski",
      "avatarUrl": "https://cdn.meetapp.com/avatars/123.jpg"
    },
    "createdAt": "2024-10-15T10:00:00Z",
    "updatedAt": "2024-11-01T14:00:00Z"
  }
}
```

---

### 5.3 Create Event

**Endpoint**: `POST /events`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "groupId": "uuid-group-1",
  "seriesId": null,
  "name": "Mecz towarzyski",
  "description": "Specjalne wydarzenie",
  "eventDate": "2024-11-20",
  "startTime": "18:30:00",
  "endTime": "20:30:00",
  "venue": "Kościelna 53, Przeźmierowo",
  "venueLat": 52.4064,
  "venueLng": 16.7834,
  "capacity": 12,
  "waitlistCapacity": 5,
  "price": 25.00,
  "autoPromoteWaitlist": true,
  "requirePayment": true,
  "registrationDeadlineHours": 2,
  "organizerNotes": "Proszę o punktualne przybycie"
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": { ... },
  "message": "Wydarzenie utworzone pomyślnie"
}
```

---

### 5.4 Update Event

**Endpoint**: `PUT /events/{eventId}`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**: Same as Create Event

**Note**: Cannot decrease `capacity` below `currentParticipants`

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... },
  "message": "Wydarzenie zaktualizowane"
}
```

---

### 5.5 Delete Event

**Endpoint**: `DELETE /events/{eventId}`
**Auth Required**: Yes (ORGANIZER+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Wydarzenie usunięte"
}
```

---

### 5.6 Cancel Event

**Endpoint**: `PUT /events/{eventId}/cancel`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "reason": "Awaria hali sportowej",
  "notifyParticipants": true,
  "refundPayments": true
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "status": "CANCELLED",
    "notificationsSent": 10,
    "refundsProcessed": 8
  },
  "message": "Wydarzenie anulowane"
}
```

---

### 5.7 Get My Upcoming Events

**Endpoint**: `GET /events/my/upcoming`
**Auth Required**: Yes

**Query Parameters**:
- `page`, `size`: Pagination

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": { ... }
  }
}
```

---

### 5.8 Get My Past Events

**Endpoint**: `GET /events/my/past`
**Auth Required**: Yes

**Query Parameters**:
- `page`, `size`: Pagination

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [ ... ],
    "page": { ... }
  }
}
```

---

## 6. Participants

### 6.1 Join Event

**Endpoint**: `POST /events/{eventId}/join`
**Auth Required**: Yes

**Request Body**: (Optional, for adding guest)
```json
{
  "asGuest": false,
  "guestName": null,
  "guestPhone": null
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "participantId": "uuid-participant-1",
    "userId": "uuid-123",
    "eventId": "uuid-event-1",
    "position": 9,
    "status": "REGISTERED",
    "isWaitlist": false,
    "confirmed": false,
    "paymentRequired": true,
    "paymentStatus": "UNPAID",
    "joinedAt": "2024-11-01T15:30:00Z"
  },
  "message": "Zapisano na wydarzenie"
}
```

**Error Responses**:
- `409 Conflict`: Already joined
  ```json
  {
    "success": false,
    "error": {
      "code": "ALREADY_JOINED",
      "message": "Jesteś już zapisany na to wydarzenie"
    }
  }
  ```
- `400 Bad Request`: Registration deadline passed
  ```json
  {
    "success": false,
    "error": {
      "code": "DEADLINE_PASSED",
      "message": "Termin zapisów minął"
    }
  }
  ```

---

### 6.2 Leave Event

**Endpoint**: `DELETE /events/{eventId}/leave`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "promotedFromWaitlist": {
      "userId": "uuid-456",
      "userName": "Anna Kowalska"
    }
  },
  "message": "Wypisano z wydarzenia"
}
```

---

### 6.3 List Participants

**Endpoint**: `GET /events/{eventId}/participants`
**Auth Required**: Yes

**Query Parameters**:
- `status` (optional): REGISTERED, CONFIRMED, ATTENDED, NO_SHOW, CANCELLED

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "mainList": [
      {
        "id": "uuid-participant-1",
        "user": {
          "id": "uuid-123",
          "firstName": "Jan",
          "lastName": "Kowalski",
          "avatarUrl": "https://cdn.meetapp.com/avatars/123.jpg"
        },
        "position": 1,
        "status": "REGISTERED",
        "confirmed": true,
        "confirmedAt": "2024-11-01T10:00:00Z",
        "paymentRequired": true,
        "paymentStatus": "PAID",
        "isGuest": false,
        "joinedAt": "2024-10-25T15:30:00Z"
      }
    ],
    "waitlist": [
      {
        "id": "uuid-waitlist-1",
        "user": {
          "id": "uuid-456",
          "firstName": "Anna",
          "lastName": "Nowak",
          "avatarUrl": "https://cdn.meetapp.com/avatars/456.jpg"
        },
        "position": 1,
        "status": "WAITING",
        "addedAt": "2024-11-01T12:00:00Z"
      }
    ]
  }
}
```

---

### 6.4 Add Participant (Organizer)

**Endpoint**: `POST /events/{eventId}/participants`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "userId": "uuid-456",
  "asGuest": false,
  "guestName": null,
  "guestPhone": null,
  "forceMainList": false
}
```

**Success Response** (201 Created):
```json
{
  "success": true,
  "data": { ... },
  "message": "Uczestnik dodany"
}
```

---

### 6.5 Remove Participant

**Endpoint**: `DELETE /events/{eventId}/participants/{userId}`
**Auth Required**: Yes (ORGANIZER+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Uczestnik usunięty"
}
```

---

### 6.6 Reorder Participants

**Endpoint**: `PUT /events/{eventId}/participants/reorder`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "order": [
    "uuid-participant-2",
    "uuid-participant-1",
    "uuid-participant-3"
  ]
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Kolejność zaktualizowana"
}
```

---

### 6.7 Confirm Attendance

**Endpoint**: `POST /events/{eventId}/participants/{userId}/confirm`
**Auth Required**: Yes (User or ORGANIZER+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "confirmed": true,
    "confirmedAt": "2024-11-01T15:00:00Z"
  },
  "message": "Obecność potwierdzona"
}
```

---

### 6.8 Update Participant Status

**Endpoint**: `PUT /events/{eventId}/participants/{userId}/status`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "status": "ATTENDED"
}
```

**Allowed statuses**: REGISTERED, CONFIRMED, ATTENDED, NO_SHOW, CANCELLED

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... },
  "message": "Status zaktualizowany"
}
```

---

### 6.9 Get Waitlist

**Endpoint**: `GET /events/{eventId}/waitlist`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-waitlist-1",
      "user": {
        "id": "uuid-456",
        "firstName": "Anna",
        "lastName": "Nowak",
        "avatarUrl": "https://cdn.meetapp.com/avatars/456.jpg"
      },
      "position": 1,
      "status": "WAITING",
      "addedAt": "2024-11-01T12:00:00Z"
    }
  ]
}
```

---

### 6.10 Promote from Waitlist

**Endpoint**: `POST /events/{eventId}/waitlist/{userId}/promote`
**Auth Required**: Yes (ORGANIZER+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... },
  "message": "Uczestnik awansowany z listy rezerwowej"
}
```

---

## 7. Payments

### 7.1 List Event Payments

**Endpoint**: `GET /events/{eventId}/payments`
**Auth Required**: Yes (ORGANIZER+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalAmount": 300.00,
      "paidAmount": 175.00,
      "unpaidAmount": 125.00,
      "currency": "PLN",
      "paidCount": 7,
      "unpaidCount": 5
    },
    "payments": [
      {
        "id": "uuid-payment-1",
        "user": {
          "id": "uuid-123",
          "firstName": "Jan",
          "lastName": "Kowalski"
        },
        "amount": 25.00,
        "currency": "PLN",
        "paymentMethod": "BLIK",
        "status": "COMPLETED",
        "paidAt": "2024-11-01T18:55:00Z",
        "notes": null,
        "createdBy": {
          "id": "uuid-organizer",
          "firstName": "Iza",
          "lastName": "S."
        }
      }
    ]
  }
}
```

---

### 7.2 Mark Payment as Paid

**Endpoint**: `POST /events/{eventId}/payments/{userId}`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "paymentMethod": "BLIK",
  "amount": 25.00,
  "notes": "Opłacone przed eventem"
}
```

**Payment Methods**: BLIK, CASH, TRANSFER, CARD, STRIPE, PAYU

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid-payment-1",
    "status": "COMPLETED",
    "paidAt": "2024-11-01T18:55:00Z"
  },
  "message": "Płatność potwierdzona"
}
```

---

### 7.3 Update Payment

**Endpoint**: `PUT /events/{eventId}/payments/{userId}`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "paymentMethod": "CASH",
  "notes": "Zapłacone gotówką na miejscu"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... },
  "message": "Płatność zaktualizowana"
}
```

---

### 7.4 Delete Payment

**Endpoint**: `DELETE /events/{eventId}/payments/{userId}`
**Auth Required**: Yes (ORGANIZER+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Płatność usunięta"
}
```

---

### 7.5 Send Payment Reminder

**Endpoint**: `POST /events/{eventId}/payments/remind`
**Auth Required**: Yes (ORGANIZER+)

**Request Body** (Optional):
```json
{
  "userIds": ["uuid-123", "uuid-456"]
}
```

If `userIds` is empty or null, sends to all unpaid participants.

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "remindersSent": 5
  },
  "message": "Przypomnienia wysłane"
}
```

---

### 7.6 Get Payment Summary

**Endpoint**: `GET /events/{eventId}/payments/summary`
**Auth Required**: Yes (ORGANIZER+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "totalAmount": 300.00,
    "paidAmount": 175.00,
    "unpaidAmount": 125.00,
    "currency": "PLN",
    "paidCount": 7,
    "unpaidCount": 5,
    "paymentRate": 58.33
  }
}
```

---

### 7.7 Get Group Payment Report

**Endpoint**: `GET /groups/{groupId}/payments/report`
**Auth Required**: Yes (ORGANIZER+)

**Query Parameters**:
- `from` (required): Date from (ISO 8601)
- `to` (required): Date to (ISO 8601)
- `format` (optional): json, csv (default: json)

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2024-01-01",
      "to": "2024-12-31"
    },
    "summary": {
      "totalRevenue": 39000.00,
      "totalEvents": 156,
      "averagePerEvent": 250.00,
      "currency": "PLN"
    },
    "byMonth": [
      {
        "month": "2024-01",
        "revenue": 3250.00,
        "events": 13
      }
    ],
    "topPayers": [
      {
        "user": {
          "id": "uuid-123",
          "firstName": "Jan",
          "lastName": "Kowalski"
        },
        "totalPaid": 1050.00,
        "eventsCount": 42
      }
    ]
  }
}
```

---

## 8. Notifications

### 8.1 List Notifications

**Endpoint**: `GET /notifications`
**Auth Required**: Yes

**Query Parameters**:
- `unreadOnly` (optional): Filter unread only (default: false)
- `type` (optional): Filter by type
- `page`, `size`: Pagination

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "uuid-notif-1",
        "type": "EVENT_REMINDER",
        "title": "Wydarzenie jutro!",
        "body": "Przypominamy o wydarzeniu: Siatkówka - Śr 06.11, 18:30",
        "eventId": "uuid-event-1",
        "groupId": "uuid-group-1",
        "actionUrl": "/events/uuid-event-1",
        "isRead": false,
        "sentPush": true,
        "sentEmail": true,
        "sentSms": false,
        "sentAt": "2024-11-05T18:30:00Z",
        "createdAt": "2024-11-05T18:30:00Z"
      }
    ],
    "page": { ... },
    "unreadCount": 3
  }
}
```

**Notification Types**:
- EVENT_REMINDER
- PAYMENT_REMINDER
- WAITLIST_PROMOTED
- EVENT_CANCELLED
- EVENT_UPDATED
- PAYMENT_RECEIVED
- NEW_PARTICIPANT
- PARTICIPANT_LEFT

---

### 8.2 Get Notification

**Endpoint**: `GET /notifications/{notificationId}`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 8.3 Mark as Read

**Endpoint**: `PUT /notifications/{notificationId}/read`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "isRead": true,
    "readAt": "2024-11-01T20:00:00Z"
  }
}
```

---

### 8.4 Mark All as Read

**Endpoint**: `PUT /notifications/read-all`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "markedCount": 7
  },
  "message": "Wszystkie powiadomienia oznaczone jako przeczytane"
}
```

---

### 8.5 Delete Notification

**Endpoint**: `DELETE /notifications/{notificationId}`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Powiadomienie usunięte"
}
```

---

### 8.6 Get Notification Preferences

**Endpoint**: `GET /notifications/preferences`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "channels": {
      "push": true,
      "email": true,
      "sms": false
    },
    "types": {
      "EVENT_REMINDER": true,
      "PAYMENT_REMINDER": true,
      "WAITLIST_PROMOTED": true,
      "EVENT_CANCELLED": true,
      "EVENT_UPDATED": true,
      "PAYMENT_RECEIVED": false,
      "NEW_PARTICIPANT": false,
      "PARTICIPANT_LEFT": false
    }
  }
}
```

---

### 8.7 Update Notification Preferences

**Endpoint**: `PUT /notifications/preferences`
**Auth Required**: Yes

**Request Body**:
```json
{
  "enabled": true,
  "channels": {
    "push": true,
    "email": true,
    "sms": false
  },
  "types": {
    "EVENT_REMINDER": true,
    "PAYMENT_REMINDER": true,
    "WAITLIST_PROMOTED": true,
    "EVENT_CANCELLED": true,
    "EVENT_UPDATED": true,
    "PAYMENT_RECEIVED": false,
    "NEW_PARTICIPANT": false,
    "PARTICIPANT_LEFT": false
  }
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... },
  "message": "Preferencje zaktualizowane"
}
```

---

## 9. Invites

### 9.1 Generate Group Invite

**Endpoint**: `POST /invites/groups/{groupId}`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "maxUses": null,
  "validityDays": 7
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "abc123xyz",
    "url": "https://meetapp.com/join/abc123xyz",
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "maxUses": null,
    "currentUses": 0,
    "expiresAt": "2024-11-08T10:00:00Z",
    "isActive": true,
    "createdAt": "2024-11-01T10:00:00Z"
  }
}
```

---

### 9.2 Generate Event Invite

**Endpoint**: `POST /invites/events/{eventId}`
**Auth Required**: Yes (ORGANIZER+)

**Request Body**:
```json
{
  "maxUses": 10,
  "validityDays": 7
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": { ... }
}
```

---

### 9.3 Validate Invite

**Endpoint**: `GET /invites/{token}/validate`
**Auth Required**: No

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "token": "abc123xyz",
    "type": "EVENT_INVITE",
    "isValid": true,
    "event": {
      "id": "uuid-event-1",
      "name": "Siatkówka Środy",
      "eventDate": "2024-11-06",
      "startTime": "18:30:00",
      "venue": "Kościelna 53, Przeźmierowo",
      "capacity": 12,
      "currentParticipants": 8,
      "availableSpots": 4
    },
    "group": {
      "id": "uuid-group-1",
      "name": "Siatkówka Przeźmierowo",
      "sportType": "VOLLEYBALL"
    },
    "createdBy": {
      "id": "uuid-123",
      "firstName": "Jan",
      "lastName": "Kowalski"
    },
    "expiresAt": "2024-11-08T10:00:00Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": {
    "code": "INVITE_EXPIRED",
    "message": "Link zaproszenia wygasł"
  }
}
```

---

### 9.4 Join via Invite (New User)

**Endpoint**: `POST /invites/{token}/join/new`
**Auth Required**: No

**Request Body**:
```json
{
  "firstName": "Anna",
  "lastName": "Nowak",
  "email": "anna.nowak@example.com",
  "phone": "+48987654321"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 900
    },
    "redirectTo": "/events/uuid-event-1"
  },
  "message": "Konto utworzone i dołączono do wydarzenia"
}
```

---

### 9.5 Join via Invite (Existing User)

**Endpoint**: `POST /invites/{token}/join`
**Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "joined": true,
    "type": "EVENT_INVITE",
    "eventId": "uuid-event-1",
    "groupId": "uuid-group-1",
    "redirectTo": "/events/uuid-event-1"
  },
  "message": "Dołączono do wydarzenia"
}
```

---

### 9.6 List Active Invites

**Endpoint**: `GET /invites`
**Auth Required**: Yes (ORGANIZER+)

**Query Parameters**:
- `groupId` (optional): Filter by group
- `eventId` (optional): Filter by event
- `isActive` (optional): Filter by active status

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-invite-1",
      "token": "abc123xyz",
      "type": "EVENT_INVITE",
      "url": "https://meetapp.com/join/abc123xyz",
      "eventId": "uuid-event-1",
      "groupId": "uuid-group-1",
      "maxUses": null,
      "currentUses": 5,
      "expiresAt": "2024-11-08T10:00:00Z",
      "isActive": true,
      "createdAt": "2024-11-01T10:00:00Z"
    }
  ]
}
```

---

### 9.7 Deactivate Invite

**Endpoint**: `PUT /invites/{inviteId}/deactivate`
**Auth Required**: Yes (ORGANIZER+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Link dezaktywowany"
}
```

---

### 9.8 Delete Invite

**Endpoint**: `DELETE /invites/{inviteId}`
**Auth Required**: Yes (ORGANIZER+)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Link usunięty"
}
```

---

## 10. Common Models

### 10.1 User Model

```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "role": "ADMIN | ORGANIZER | MEMBER | GUEST",
  "avatarUrl": "string | null",
  "emailVerified": "boolean",
  "phoneVerified": "boolean",
  "notificationEnabled": "boolean",
  "notificationEmail": "boolean",
  "notificationPush": "boolean",
  "notificationSms": "boolean",
  "lastLoginAt": "ISO 8601 | null",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

---

### 10.2 Group Model

```json
{
  "id": "uuid",
  "name": "string",
  "description": "string | null",
  "sportType": "VOLLEYBALL | FOOTBALL | BASKETBALL | etc.",
  "defaultVenue": "string",
  "city": "string",
  "defaultCapacity": "integer",
  "defaultPrice": "decimal",
  "currency": "string",
  "logoUrl": "string | null",
  "color": "string",
  "isActive": "boolean",
  "isPublic": "boolean",
  "memberCount": "integer",
  "role": "OWNER | ADMIN | ORGANIZER | MEMBER | null",
  "permissions": {
    "canCreateEvents": "boolean",
    "canManageParticipants": "boolean",
    "canManagePayments": "boolean",
    "canManageMembers": "boolean"
  },
  "createdBy": "User (partial)",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

---

### 10.3 Event Model

```json
{
  "id": "uuid",
  "groupId": "uuid",
  "group": "Group (partial) | null",
  "seriesId": "uuid | null",
  "name": "string",
  "description": "string | null",
  "eventDate": "date",
  "startTime": "time",
  "endTime": "time",
  "venue": "string",
  "venueLat": "decimal | null",
  "venueLng": "decimal | null",
  "capacity": "integer",
  "currentParticipants": "integer",
  "waitlistCapacity": "integer",
  "currentWaitlist": "integer",
  "price": "decimal",
  "currency": "string",
  "autoPromoteWaitlist": "boolean",
  "requirePayment": "boolean",
  "registrationDeadline": "ISO 8601 | null",
  "status": "SCHEDULED | ONGOING | COMPLETED | CANCELLED",
  "organizerNotes": "string | null",
  "userStatus": {
    "isJoined": "boolean",
    "isWaitlist": "boolean",
    "position": "integer | null",
    "confirmed": "boolean",
    "paid": "boolean"
  },
  "statistics": {
    "confirmedCount": "integer",
    "paidCount": "integer",
    "fillRate": "decimal"
  },
  "createdBy": "User (partial)",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

---

### 10.4 Pagination Model

```json
{
  "content": "array",
  "page": {
    "number": "integer",
    "size": "integer",
    "totalElements": "integer",
    "totalPages": "integer"
  }
}
```

---

## 11. Error Handling

### 11.1 Standard Error Response

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "fields": {
      "fieldName": "Field-specific error message"
    },
    "timestamp": "ISO 8601",
    "path": "/api/v1/endpoint"
  }
}
```

---

### 11.2 HTTP Status Codes

| Status Code | Meaning | Use Case |
|------------|---------|----------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (resource created) |
| 400 | Bad Request | Validation errors, invalid input |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict (e.g., already joined) |
| 422 | Unprocessable Entity | Business logic violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

### 11.3 Common Error Codes

**Authentication Errors**:
- `INVALID_CREDENTIALS`: Wrong email/password
- `TOKEN_EXPIRED`: JWT token expired
- `TOKEN_INVALID`: Invalid JWT token
- `UNAUTHORIZED`: Authentication required

**Authorization Errors**:
- `FORBIDDEN`: Insufficient permissions
- `NOT_GROUP_MEMBER`: User not in group

**Validation Errors**:
- `VALIDATION_ERROR`: Input validation failed
- `REQUIRED_FIELD`: Required field missing
- `INVALID_FORMAT`: Invalid field format

**Business Logic Errors**:
- `ALREADY_JOINED`: User already joined event
- `EVENT_FULL`: Event capacity reached
- `DEADLINE_PASSED`: Registration deadline passed
- `EVENT_CANCELLED`: Event is cancelled
- `INVITE_EXPIRED`: Invite link expired
- `INVITE_INVALID`: Invalid invite link
- `CAPACITY_EXCEEDED`: Cannot decrease capacity below current participants

**Resource Errors**:
- `NOT_FOUND`: Resource not found
- `GROUP_NOT_FOUND`: Group not found
- `EVENT_NOT_FOUND`: Event not found
- `USER_NOT_FOUND`: User not found

---

### 11.4 Rate Limiting

**Headers**:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699000000
```

**Rate Limit Exceeded Response** (429):
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Zbyt wiele żądań. Spróbuj ponownie za 60 sekund.",
    "retryAfter": 60
  }
}
```

**Rate Limits**:
- Authentication endpoints: 5 requests/minute
- Join/Leave events: 10 requests/minute
- Other endpoints: 100 requests/minute

---

### 11.5 Field Validation Examples

**Email Validation Error**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nieprawidłowe dane wejściowe",
    "fields": {
      "email": "Nieprawidłowy format email"
    }
  }
}
```

**Multiple Field Errors**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Nieprawidłowe dane wejściowe",
    "fields": {
      "email": "Email jest już zajęty",
      "password": "Hasło musi zawierać minimum 8 znaków",
      "phone": "Nieprawidłowy numer telefonu"
    }
  }
}
```

---

## 12. WebSocket API

### 12.1 Connection

**Endpoint**: `wss://api.meetapp.com/ws`
**Protocol**: STOMP over WebSocket

**Connection Flow**:
```javascript
// 1. Connect
CONNECT
Authorization: Bearer <JWT>

// 2. Server response
CONNECTED
version:1.2
```

---

### 12.2 Subscribe to Event Updates

**Topic**: `/topic/events/{eventId}`

**Subscribe**:
```
SUBSCRIBE
id:sub-0
destination:/topic/events/uuid-event-1
```

**Message Format**:
```json
{
  "type": "PARTICIPANT_ADDED | PARTICIPANT_REMOVED | PARTICIPANT_UPDATED | PAYMENT_UPDATED",
  "eventId": "uuid-event-1",
  "data": {
    "userId": "uuid-123",
    "userName": "Jan Kowalski",
    "action": "JOINED | LEFT | PROMOTED | CONFIRMED | PAID",
    "position": 9,
    "currentParticipants": 9,
    "currentWaitlist": 2
  },
  "timestamp": "ISO 8601"
}
```

---

### 12.3 Subscribe to Group Updates

**Topic**: `/topic/groups/{groupId}`

**Message Format**:
```json
{
  "type": "EVENT_CREATED | EVENT_UPDATED | EVENT_CANCELLED | MEMBER_JOINED",
  "groupId": "uuid-group-1",
  "data": { ... },
  "timestamp": "ISO 8601"
}
```

---

### 12.4 Subscribe to User Notifications

**Topic**: `/user/queue/notifications`

**Message Format**:
```json
{
  "type": "NEW_NOTIFICATION",
  "notification": {
    "id": "uuid-notif-1",
    "type": "EVENT_REMINDER",
    "title": "Wydarzenie jutro!",
    "body": "...",
    "actionUrl": "/events/uuid-event-1"
  },
  "timestamp": "ISO 8601"
}
```

---

## 13. API Best Practices

### 13.1 Authentication

Always include JWT token in Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### 13.2 Pagination

Use `page` and `size` query parameters:
```
GET /events?page=0&size=20
```

### 13.3 Filtering

Use query parameters for filtering:
```
GET /events?groupId=uuid-group-1&status=SCHEDULED&from=2024-11-01
```

### 13.4 Sorting

Use `sort` query parameter:
```
GET /events?sort=eventDate,asc
```

### 13.5 Optimistic UI

Mobile app should:
1. Update UI immediately (optimistic)
2. Send API request
3. Rollback on error or sync on success

### 13.6 Error Handling

Always check `success` field:
```javascript
if (response.data.success) {
  // Handle success
} else {
  // Handle error
  const errorCode = response.data.error.code;
  const errorMessage = response.data.error.message;
}
```

---

**Document version:** 1.0
**Last updated:** 2024-11-01
**API Version:** v1
