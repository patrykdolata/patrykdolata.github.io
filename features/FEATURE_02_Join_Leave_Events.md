# Feature 2: Join/Leave Events

## Standardized Spec

- Milestone: M2 (Post‑MVP)
- Goal: Uczestnicy mogą samodzielnie dołączać/opuszczać wydarzenia; waitlist z automatyczną promocją.
- In Scope: `POST /events/{id}/join`, `DELETE /events/{id}/leave`, ParticipantStatus MAIN_LIST/WAITLIST, renumeracja pozycji.
- Out of Scope (M2): Płatności, drag&drop, ręczne zarządzanie przez organizatora (jest w Feature 3).
- Prerequisites: Feature 1 (CRUD), ParticipantEntity baza (z M1 minimal) – lub tworzymy w tym featurze.
- Security/Permissions: Join/leave tylko z JWT; brak join duplikatów; limity slotów.
- Acceptance Criteria: Join/leave działa z logiką list i waitlist; promocja po zwolnieniu miejsca; brak IDOR.
- Backend API:
  - POST `/events/{eventId}/join`, DELETE `/events/{eventId}/leave`
  - GET `/events/{eventId}/participants` (public minimal view)
- Data Model:
  - EventParticipant: `status`, `position`, unikalność (event_id,user_id), indeksy.
- Frontend UX:
  - Przyciski Join/Leave w EventDetails; badge Waitlist.
- Validation & Limits:
  - Brak join jeśli pełny main list; waitlist fallback; atomiczne zmiany pozycji.
- Tests:
  - BE: join/leave happy path, edge cases (pełny event, duplikaty), promocja; FE: wizualne badge i stany przycisków.

## Overview
Implement participant management system allowing users to join and leave events. This feature includes main list and waitlist logic with automatic promotion when slots become available.

**Priority**: MEDIUM
**Milestone**: M2 (Post-MVP)
**Implementation Status**: See TODO.md for current progress

> Milestone: M2+ (Post‑MVP)

This feature is intentionally out of scope for Milestone 1 (Organizer MVP). Manual participant management (Feature 3) covers organizer workflows in M1.


## Business Value
- Users can register for events directly in the app
- Automatic waitlist management reduces organizer workload
- Transparent slot availability prevents overbooking
- Payment tracking prepares for future payment integration

## Prerequisites
- ✅ Feature 1: Basic Event Operations (100% done)
- ✅ Sprint 0: JWT Authentication working
- ✅ User management system operational

---

## Backend Implementation

### Step 1: Create ParticipantStatus Enum

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/ParticipantStatus.java`

```java
package pl.flutterowo.meetappbe.event.participant;

public enum ParticipantStatus {
    MAIN_LIST("Main List"),
    WAITLIST("Waitlist");

    private final String displayName;

    ParticipantStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

**Why**: Clearly distinguishes between confirmed participants and those waiting for slots.

---

### Step 2: Create PaymentMethod Enum

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/PaymentMethod.java`

```java
package pl.flutterowo.meetappbe.event.participant;

public enum PaymentMethod {
    BLIK("BLIK"),
    CASH("Cash"),
    TRANSFER("Bank Transfer"),
    CARD("Card"),
    FREE("Free");

    private final String displayName;

    PaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

**Why**: Tracks payment method for accounting and verification purposes.

---

### Step 3: Create EventParticipant Entity

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/EventParticipantEntity.java`

```java
package pl.flutterowo.meetappbe.event.participant;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.flutterowo.meetappbe.event.EventEntity;
import pl.flutterowo.meetappbe.user.UserEntity;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "event_participant",
    uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"})
)
public class EventParticipantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private EventEntity event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(name = "position", nullable = false)
    private Integer position;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ParticipantStatus status = ParticipantStatus.MAIN_LIST;

    @Column(name = "is_confirmed", nullable = false)
    @Builder.Default
    private Boolean isConfirmed = false;

    @Column(name = "is_paid", nullable = false)
    @Builder.Default
    private Boolean isPaid = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "notes")
    private String notes;
}
```

**Why**:
- Tracks all participant data including position, status, and payment info
- Unique constraint prevents duplicate joins
- Timestamps track join time and payment time

---

### Step 4: Create Database Migration

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/resources/db/migration/V1_2__Add_event_participant_table.sql`

```sql
-- Create event_participant table
CREATE TABLE IF NOT EXISTS event_participant (
    id BIGSERIAL PRIMARY KEY,
    event_id UUID NOT NULL,
    user_id INTEGER NOT NULL,
    position INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'MAIN_LIST',
    is_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
    is_paid BOOLEAN NOT NULL DEFAULT FALSE,
    payment_method VARCHAR(20),
    payment_time TIMESTAMP,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,

    CONSTRAINT fk_event_participant_event FOREIGN KEY (event_id) REFERENCES event(id) ON DELETE CASCADE,
    CONSTRAINT fk_event_participant_user FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE,
    CONSTRAINT uq_event_user UNIQUE (event_id, user_id),
    CONSTRAINT chk_position CHECK (position >= 1)
);

-- Create indexes for performance
CREATE INDEX idx_event_participant_event ON event_participant(event_id);
CREATE INDEX idx_event_participant_user ON event_participant(user_id);
CREATE INDEX idx_event_participant_status ON event_participant(status);
CREATE INDEX idx_event_participant_position ON event_participant(event_id, position);

-- Add comments for documentation
COMMENT ON TABLE event_participant IS 'Tracks users who have joined events, including position, payment status, and waitlist management';
COMMENT ON COLUMN event_participant.position IS 'Determines order in main list or waitlist. Lower numbers = higher priority';
COMMENT ON COLUMN event_participant.status IS 'MAIN_LIST or WAITLIST - determines if user has confirmed slot or is waiting';
```

**Why**:
- CASCADE delete ensures cleanup when event or user is deleted
- Indexes optimize queries for event participant lists
- Check constraint ensures position is always positive

---

### Step 5: Create EventParticipant Repository

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/EventParticipantRepository.java`

```java
package pl.flutterowo.meetappbe.event.participant;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventParticipantRepository extends CrudRepository<EventParticipantEntity, Long> {

    // Check if user already joined event
    Optional<EventParticipantEntity> findByEventIdAndUserId(UUID eventId, Integer userId);

    // Get all participants for an event ordered by status and position
    @Query("SELECT ep FROM EventParticipantEntity ep " +
           "JOIN FETCH ep.user " +
           "WHERE ep.event.id = :eventId " +
           "ORDER BY ep.status ASC, ep.position ASC")
    List<EventParticipantEntity> findByEventIdOrderByStatusAndPosition(@Param("eventId") UUID eventId);

    // Get only main list participants
    @Query("SELECT ep FROM EventParticipantEntity ep " +
           "JOIN FETCH ep.user " +
           "WHERE ep.event.id = :eventId " +
           "AND ep.status = 'MAIN_LIST' " +
           "ORDER BY ep.position ASC")
    List<EventParticipantEntity> findMainListByEventId(@Param("eventId") UUID eventId);

    // Get only waitlist participants
    @Query("SELECT ep FROM EventParticipantEntity ep " +
           "JOIN FETCH ep.user " +
           "WHERE ep.event.id = :eventId " +
           "AND ep.status = 'WAITLIST' " +
           "ORDER BY ep.position ASC")
    List<EventParticipantEntity> findWaitlistByEventId(@Param("eventId") UUID eventId);

    // Get first person in waitlist
    @Query("SELECT ep FROM EventParticipantEntity ep " +
           "JOIN FETCH ep.user " +
           "WHERE ep.event.id = :eventId " +
           "AND ep.status = 'WAITLIST' " +
           "ORDER BY ep.position ASC " +
           "LIMIT 1")
    Optional<EventParticipantEntity> findFirstWaitlistParticipant(@Param("eventId") UUID eventId);

    // Get all events user has joined
    @Query("SELECT ep FROM EventParticipantEntity ep " +
           "JOIN FETCH ep.event e " +
           "JOIN FETCH e.location " +
           "WHERE ep.user.id = :userId " +
           "ORDER BY e.startDateTime DESC")
    List<EventParticipantEntity> findByUserId(@Param("userId") Integer userId);

    // Count main list participants for event
    @Query("SELECT COUNT(ep) FROM EventParticipantEntity ep " +
           "WHERE ep.event.id = :eventId " +
           "AND ep.status = 'MAIN_LIST'")
    Integer countMainListParticipants(@Param("eventId") UUID eventId);

    // Count waitlist participants for event
    @Query("SELECT COUNT(ep) FROM EventParticipantEntity ep " +
           "WHERE ep.event.id = :eventId " +
           "AND ep.status = 'WAITLIST'")
    Integer countWaitlistParticipants(@Param("eventId") UUID eventId);

    // Get max position for event and status
    @Query("SELECT COALESCE(MAX(ep.position), 0) FROM EventParticipantEntity ep " +
           "WHERE ep.event.id = :eventId " +
           "AND ep.status = :status")
    Integer getMaxPosition(@Param("eventId") UUID eventId, @Param("status") ParticipantStatus status);

    // Delete participant
    void deleteByEventIdAndUserId(UUID eventId, Integer userId);
}
```

**Why**: Custom queries optimize common operations like counting, ordering, and fetching related data.

---

### Step 6: Create Custom Exceptions

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/common/exception/AlreadyJoinedException.java`

```java
package pl.flutterowo.meetappbe.common.exception;

public class AlreadyJoinedException extends RuntimeException {
    public AlreadyJoinedException(String message) {
        super(message);
    }
}
```

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/common/exception/EventFullException.java`

```java
package pl.flutterowo.meetappbe.common.exception;

public class EventFullException extends RuntimeException {
    public EventFullException(String message) {
        super(message);
    }
}
```

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/common/exception/NotParticipantException.java`

```java
package pl.flutterowo.meetappbe.common.exception;

public class NotParticipantException extends RuntimeException {
    public NotParticipantException(String message) {
        super(message);
    }
}
```

---

### Step 7: Create ParticipantDTO

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/ParticipantDTO.java`

```java
package pl.flutterowo.meetappbe.event.participant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import pl.flutterowo.meetappbe.user.UserEntity;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipantDTO {
    private Long id;
    private UserDTO user;
    private Integer position;
    private ParticipantStatus status;
    private Boolean isConfirmed;
    private Boolean isPaid;
    private PaymentMethod paymentMethod;
    private LocalDateTime paymentTime;
    private LocalDateTime joinedAt;
    private String notes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Integer id;
        private String login;
        private String nickName;
        private String avatar;
        private Integer thumbsUp;
        private Integer thumbsDown;
    }

    public static ParticipantDTO fromEntity(EventParticipantEntity entity) {
        UserEntity user = entity.getUser();
        return ParticipantDTO.builder()
            .id(entity.getId())
            .user(UserDTO.builder()
                .id(user.getId())
                .login(user.getLogin())
                .nickName(user.getNickName())
                .avatar(user.getAvatar() != null ? user.getAvatar().toString() : null)
                .thumbsUp(user.getThumbsUp())
                .thumbsDown(user.getThumbsDown())
                .build())
            .position(entity.getPosition())
            .status(entity.getStatus())
            .isConfirmed(entity.getIsConfirmed())
            .isPaid(entity.getIsPaid())
            .paymentMethod(entity.getPaymentMethod())
            .paymentTime(entity.getPaymentTime())
            .joinedAt(entity.getJoinedAt())
            .notes(entity.getNotes())
            .build();
    }
}
```

**Why**: DTO prevents exposing sensitive user data and provides clean API responses.

---

### Step 8: Create EventParticipant Service

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/EventParticipantService.java`

```java
package pl.flutterowo.meetappbe.event.participant;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.flutterowo.meetappbe.common.exception.*;
import pl.flutterowo.meetappbe.event.EventEntity;
import pl.flutterowo.meetappbe.event.EventRepository;
import pl.flutterowo.meetappbe.event.EventStatus;
import pl.flutterowo.meetappbe.user.UserEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventParticipantService {

    private final EventParticipantRepository participantRepository;
    private final EventRepository eventRepository;

    @Transactional
    public EventParticipantEntity joinEvent(UUID eventId, UserEntity user) {
        // Fetch event
        EventEntity event = eventRepository.findByIdWithLocation(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        // Validate event state
        validateEventJoinable(event, user);

        // Check if user already joined
        Optional<EventParticipantEntity> existing = participantRepository
            .findByEventIdAndUserId(eventId, user.getId());
        if (existing.isPresent()) {
            throw new AlreadyJoinedException("You have already joined this event");
        }

        // Check if organizer trying to join own event
        if (event.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Event organizer cannot join their own event as participant");
        }

        // Determine status and position
        ParticipantStatus status;
        Integer position;

        if (event.getSlotsAvailable() > 0) {
            // Add to main list
            status = ParticipantStatus.MAIN_LIST;
            position = participantRepository.getMaxPosition(eventId, ParticipantStatus.MAIN_LIST) + 1;

            // Decrease available slots
            event.setSlotsAvailable(event.getSlotsAvailable() - 1);
            eventRepository.save(event);
        } else {
            // Add to waitlist
            status = ParticipantStatus.WAITLIST;
            position = participantRepository.getMaxPosition(eventId, ParticipantStatus.WAITLIST) + 1;
        }

        // Create participant
        EventParticipantEntity participant = EventParticipantEntity.builder()
            .event(event)
            .user(user)
            .position(position)
            .status(status)
            .isConfirmed(false)
            .isPaid(false)
            .joinedAt(LocalDateTime.now())
            .build();

        return participantRepository.save(participant);
    }

    @Transactional
    public void leaveEvent(UUID eventId, UserEntity user) {
        // Check if user is participant
        EventParticipantEntity participant = participantRepository
            .findByEventIdAndUserId(eventId, user.getId())
            .orElseThrow(() -> new NotParticipantException("You are not a participant of this event"));

        EventEntity event = participant.getEvent();
        ParticipantStatus participantStatus = participant.getStatus();

        // Delete participant
        participantRepository.delete(participant);

        // If participant was on main list, promote first from waitlist
        if (participantStatus == ParticipantStatus.MAIN_LIST) {
            if (event.getAutoPromoteFromWaitlist()) {
                promoteFirstFromWaitlist(eventId);
            } else {
                // Just increase available slots
                event.setSlotsAvailable(event.getSlotsAvailable() + 1);
                eventRepository.save(event);
            }
        }

        // Renumber remaining participants
        renumberParticipants(eventId);
    }

    @Transactional(readOnly = true)
    public List<ParticipantDTO> getEventParticipants(UUID eventId) {
        List<EventParticipantEntity> participants = participantRepository
            .findByEventIdOrderByStatusAndPosition(eventId);

        return participants.stream()
            .map(ParticipantDTO::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ParticipantDTO> getMainList(UUID eventId) {
        List<EventParticipantEntity> participants = participantRepository
            .findMainListByEventId(eventId);

        return participants.stream()
            .map(ParticipantDTO::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ParticipantDTO> getWaitlist(UUID eventId) {
        List<EventParticipantEntity> participants = participantRepository
            .findWaitlistByEventId(eventId);

        return participants.stream()
            .map(ParticipantDTO::fromEntity)
            .toList();
    }

    @Transactional(readOnly = true)
    public boolean isUserParticipant(UUID eventId, Integer userId) {
        return participantRepository.findByEventIdAndUserId(eventId, userId).isPresent();
    }

    @Transactional(readOnly = true)
    public List<EventEntity> getUserEvents(Integer userId) {
        List<EventParticipantEntity> participants = participantRepository.findByUserId(userId);
        return participants.stream()
            .map(EventParticipantEntity::getEvent)
            .toList();
    }

    // Helper method to promote first person from waitlist
    private void promoteFirstFromWaitlist(UUID eventId) {
        Optional<EventParticipantEntity> firstWaitlist = participantRepository
            .findFirstWaitlistParticipant(eventId);

        if (firstWaitlist.isPresent()) {
            EventParticipantEntity participant = firstWaitlist.get();

            // Change status to main list
            participant.setStatus(ParticipantStatus.MAIN_LIST);

            // Assign new position at end of main list
            Integer newPosition = participantRepository
                .getMaxPosition(eventId, ParticipantStatus.MAIN_LIST) + 1;
            participant.setPosition(newPosition);

            participantRepository.save(participant);

            // TODO: Send notification to user if event.sendNotifications is true
        } else {
            // No one in waitlist, just increase available slots
            EventEntity event = eventRepository.findById(eventId).orElseThrow();
            event.setSlotsAvailable(event.getSlotsAvailable() + 1);
            eventRepository.save(event);
        }
    }

    // Helper method to renumber positions after deletion
    private void renumberParticipants(UUID eventId) {
        // Renumber main list
        List<EventParticipantEntity> mainList = participantRepository.findMainListByEventId(eventId);
        for (int i = 0; i < mainList.size(); i++) {
            mainList.get(i).setPosition(i + 1);
            participantRepository.save(mainList.get(i));
        }

        // Renumber waitlist
        List<EventParticipantEntity> waitlist = participantRepository.findWaitlistByEventId(eventId);
        for (int i = 0; i < waitlist.size(); i++) {
            waitlist.get(i).setPosition(i + 1);
            participantRepository.save(waitlist.get(i));
        }
    }

    // Validation helper
    private void validateEventJoinable(EventEntity event, UserEntity user) {
        // Check event status
        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new IllegalStateException("Cannot join cancelled event");
        }
        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new IllegalStateException("Cannot join completed event");
        }

        // Check if event already started
        if (event.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Cannot join event that has already started");
        }
    }
}
```

**Why**:
- Centralized business logic for joining/leaving
- Automatic waitlist promotion
- Position management
- Transaction safety

---

### Step 9: Create EventParticipant Controller

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/EventParticipantController.java`

```java
package pl.flutterowo.meetappbe.event.participant;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.flutterowo.meetappbe.user.UserEntity;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventParticipantController {

    private final EventParticipantService participantService;

    @PostMapping("/{eventId}/join")
    public ResponseEntity<ParticipantDTO> joinEvent(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        EventParticipantEntity participant = participantService.joinEvent(eventId, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ParticipantDTO.fromEntity(participant));
    }

    @DeleteMapping("/{eventId}/leave")
    public ResponseEntity<Void> leaveEvent(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        participantService.leaveEvent(eventId, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/participants")
    public ResponseEntity<List<ParticipantDTO>> getParticipants(
            @PathVariable UUID eventId
    ) {
        List<ParticipantDTO> participants = participantService.getEventParticipants(eventId);
        return ResponseEntity.ok(participants);
    }

    @GetMapping("/{eventId}/participants/main-list")
    public ResponseEntity<List<ParticipantDTO>> getMainList(
            @PathVariable UUID eventId
    ) {
        List<ParticipantDTO> participants = participantService.getMainList(eventId);
        return ResponseEntity.ok(participants);
    }

    @GetMapping("/{eventId}/participants/waitlist")
    public ResponseEntity<List<ParticipantDTO>> getWaitlist(
            @PathVariable UUID eventId
    ) {
        List<ParticipantDTO> participants = participantService.getWaitlist(eventId);
        return ResponseEntity.ok(participants);
    }

    @GetMapping("/{eventId}/participants/status")
    public ResponseEntity<ParticipantStatusResponse> getParticipantStatus(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        boolean isParticipant = participantService.isUserParticipant(eventId, user.getId());
        return ResponseEntity.ok(new ParticipantStatusResponse(isParticipant));
    }

    @Data
    @AllArgsConstructor
    public static class ParticipantStatusResponse {
        private boolean isParticipant;
    }
}
```

**Why**: RESTful API endpoints for participant operations with proper authentication.

---

### Step 10: Update GlobalExceptionHandler

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/config/GlobalExceptionHandler.java`

**Add these exception handlers** to the existing class:

```java
    @ExceptionHandler(AlreadyJoinedException.class)
    public ResponseEntity<ErrorResponse> handleAlreadyJoined(AlreadyJoinedException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(EventFullException.class)
    public ResponseEntity<ErrorResponse> handleEventFull(EventFullException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(NotParticipantException.class)
    public ResponseEntity<ErrorResponse> handleNotParticipant(NotParticipantException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
```

---

## Frontend Implementation

### Step 1: Create ParticipantStatus Enum

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/features/event/participant_status.dart`

```dart
import 'package:flutter/material.dart';

enum ParticipantStatus {
  mainList('MAIN_LIST', 'Main List', Colors.green),
  waitlist('WAITLIST', 'Waitlist', Colors.orange);

  final String name;
  final String displayName;
  final Color color;

  const ParticipantStatus(this.name, this.displayName, this.color);

  static ParticipantStatus fromString(String value) {
    return ParticipantStatus.values.firstWhere(
      (status) => status.name == value,
      orElse: () => ParticipantStatus.mainList,
    );
  }

  String toJson() => name;
}
```

---

### Step 2: Create PaymentMethod Enum

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/features/event/payment_method.dart`

```dart
enum PaymentMethod {
  blik('BLIK', 'BLIK', '💳'),
  cash('CASH', 'Cash', '💵'),
  transfer('TRANSFER', 'Bank Transfer', '🏦'),
  card('CARD', 'Card', '💳'),
  free('FREE', 'Free', '🆓');

  final String name;
  final String displayName;
  final String icon;

  const PaymentMethod(this.name, this.displayName, this.icon);

  static PaymentMethod fromString(String value) {
    return PaymentMethod.values.firstWhere(
      (method) => method.name == value,
      orElse: () => PaymentMethod.cash,
    );
  }

  String toJson() => name;
}
```

---

### Step 3: Create Participant Entity

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/features/event/participant_entity.dart`

```dart
import 'package:equatable/equatable.dart';
import 'package:app/features/event/participant_status.dart';
import 'package:app/features/event/payment_method.dart';

class ParticipantEntity extends Equatable {
  final int id;
  final ParticipantUser user;
  final int position;
  final ParticipantStatus status;
  final bool isConfirmed;
  final bool isPaid;
  final PaymentMethod? paymentMethod;
  final DateTime? paymentTime;
  final DateTime joinedAt;
  final String? notes;

  const ParticipantEntity({
    required this.id,
    required this.user,
    required this.position,
    required this.status,
    required this.isConfirmed,
    required this.isPaid,
    this.paymentMethod,
    this.paymentTime,
    required this.joinedAt,
    this.notes,
  });

  factory ParticipantEntity.fromJson(Map<String, dynamic> json) {
    return ParticipantEntity(
      id: json['id'],
      user: ParticipantUser.fromJson(json['user']),
      position: json['position'],
      status: ParticipantStatus.fromString(json['status']),
      isConfirmed: json['isConfirmed'] ?? false,
      isPaid: json['isPaid'] ?? false,
      paymentMethod: json['paymentMethod'] != null
          ? PaymentMethod.fromString(json['paymentMethod'])
          : null,
      paymentTime: json['paymentTime'] != null
          ? DateTime.parse(json['paymentTime'])
          : null,
      joinedAt: DateTime.parse(json['joinedAt']),
      notes: json['notes'],
    );
  }

  @override
  List<Object?> get props => [
        id,
        user,
        position,
        status,
        isConfirmed,
        isPaid,
        paymentMethod,
        paymentTime,
        joinedAt,
        notes,
      ];
}

class ParticipantUser extends Equatable {
  final int id;
  final String login;
  final String? nickName;
  final String? avatar;
  final int thumbsUp;
  final int thumbsDown;

  const ParticipantUser({
    required this.id,
    required this.login,
    this.nickName,
    this.avatar,
    required this.thumbsUp,
    required this.thumbsDown,
  });

  factory ParticipantUser.fromJson(Map<String, dynamic> json) {
    return ParticipantUser(
      id: json['id'],
      login: json['login'],
      nickName: json['nickName'],
      avatar: json['avatar'],
      thumbsUp: json['thumbsUp'] ?? 0,
      thumbsDown: json['thumbsDown'] ?? 0,
    );
  }

  String get displayName => nickName ?? login;

  @override
  List<Object?> get props => [id, login, nickName, avatar, thumbsUp, thumbsDown];
}
```

---

### Step 4: Create Participant HTTP Client

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/core/api/event/participant_http_client.dart`

```dart
import 'package:app/core/api/http/base_http_client.dart';
import 'package:app/core/api/http/http_response.dart';
import 'package:app/features/event/participant_entity.dart';

class ParticipantHttpResponse {
  final ParticipantEntity? participant;
  final List<ParticipantEntity>? participants;
  final bool? isParticipant;

  ParticipantHttpResponse({
    this.participant,
    this.participants,
    this.isParticipant,
  });

  factory ParticipantHttpResponse.fromJson(Map<String, dynamic> json) {
    if (json is List) {
      return ParticipantHttpResponse(
        participants: (json as List)
            .map((item) => ParticipantEntity.fromJson(item))
            .toList(),
      );
    } else if (json.containsKey('isParticipant')) {
      return ParticipantHttpResponse(
        isParticipant: json['isParticipant'],
      );
    } else {
      return ParticipantHttpResponse(
        participant: ParticipantEntity.fromJson(json),
      );
    }
  }
}

class ParticipantHttpClient {
  final BaseHttpClient httpClient;

  ParticipantHttpClient(this.httpClient);

  Future<HttpResponse> joinEvent(String eventId) async {
    return await httpClient.post<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/join',
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }

  Future<HttpResponse> leaveEvent(String eventId) async {
    return await httpClient.delete(
      path: '/api/v1/events/$eventId/leave',
      requiresAuth: true,
    );
  }

  Future<HttpResponse> getParticipants(String eventId) async {
    return await httpClient.get<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/participants',
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: false,
    );
  }

  Future<HttpResponse> getMainList(String eventId) async {
    return await httpClient.get<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/participants/main-list',
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: false,
    );
  }

  Future<HttpResponse> getWaitlist(String eventId) async {
    return await httpClient.get<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/participants/waitlist',
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: false,
    );
  }

  Future<HttpResponse> getParticipantStatus(String eventId) async {
    return await httpClient.get<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/participants/status',
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }
}
```

---

### Step 5: Create Participant Service

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/features/event/participant_service.dart`

```dart
import 'package:app/core/api/event/participant_http_client.dart';
import 'package:app/core/api/http/http_status_codes.dart';
import 'package:app/features/event/participant_entity.dart';

class ParticipantService {
  final ParticipantHttpClient _httpClient;

  ParticipantService(this._httpClient);

  Future<ParticipantEntity?> joinEvent(String eventId) async {
    try {
      final response = await _httpClient.joinEvent(eventId);
      if (response.statusCode == HttpStatusCodes.created && response.data != null) {
        return response.data.participant;
      }
      return null;
    } catch (e) {
      print('Error joining event: $e');
      rethrow;
    }
  }

  Future<bool> leaveEvent(String eventId) async {
    try {
      final response = await _httpClient.leaveEvent(eventId);
      return response.statusCode == HttpStatusCodes.noContent;
    } catch (e) {
      print('Error leaving event: $e');
      rethrow;
    }
  }

  Future<List<ParticipantEntity>> getParticipants(String eventId) async {
    try {
      final response = await _httpClient.getParticipants(eventId);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.participants ?? [];
      }
      return [];
    } catch (e) {
      print('Error fetching participants: $e');
      return [];
    }
  }

  Future<List<ParticipantEntity>> getMainList(String eventId) async {
    try {
      final response = await _httpClient.getMainList(eventId);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.participants ?? [];
      }
      return [];
    } catch (e) {
      print('Error fetching main list: $e');
      return [];
    }
  }

  Future<List<ParticipantEntity>> getWaitlist(String eventId) async {
    try {
      final response = await _httpClient.getWaitlist(eventId);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.participants ?? [];
      }
      return [];
    } catch (e) {
      print('Error fetching waitlist: $e');
      return [];
    }
  }

  Future<bool> isUserParticipant(String eventId) async {
    try {
      final response = await _httpClient.getParticipantStatus(eventId);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.isParticipant ?? false;
      }
      return false;
    } catch (e) {
      print('Error checking participant status: $e');
      return false;
    }
  }
}
```

---

### Step 6: Update Event Details Screen

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/widgets/event/details/details.dart`

**Add join/leave button section** (add after existing widgets):

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app/features/event/event_entity.dart';
import 'package:app/features/event/participant_service.dart';
import 'package:app/features/user/user_service.dart';
import 'package:app/widgets/custom/snack_bar.dart';

// ... existing imports and class ...

// Add this method inside EventDetailsWidget class
Widget _buildJoinLeaveButton(BuildContext context) {
  final userService = context.watch<UserService>();
  final participantService = context.read<ParticipantService>();

  // Don't show button if not logged in
  if (!userService.isLogged()) {
    return const SizedBox.shrink();
  }

  // Don't show button if user is organizer
  if (widget.event.organizer.id == userService.currentUser?.id) {
    return const SizedBox.shrink();
  }

  return FutureBuilder<bool>(
    future: participantService.isUserParticipant(widget.event.id),
    builder: (context, snapshot) {
      if (!snapshot.hasData) {
        return const CircularProgressIndicator();
      }

      final isParticipant = snapshot.data!;

      return SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          onPressed: () => _handleJoinLeave(context, isParticipant),
          style: ElevatedButton.styleFrom(
            backgroundColor: isParticipant ? Colors.red : Colors.green,
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          child: Text(
            isParticipant ? 'Leave Event' : 'Join Event',
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
      );
    },
  );
}

Future<void> _handleJoinLeave(BuildContext context, bool isParticipant) async {
  final participantService = context.read<ParticipantService>();

  try {
    if (isParticipant) {
      // Leave event
      final success = await participantService.leaveEvent(widget.event.id);
      if (success) {
        CustomSnackBar.show(context, 'Successfully left the event');
        setState(() {}); // Refresh UI
      } else {
        CustomSnackBar.show(context, 'Failed to leave event', isError: true);
      }
    } else {
      // Join event
      final participant = await participantService.joinEvent(widget.event.id);
      if (participant != null) {
        if (participant.status == ParticipantStatus.mainList) {
          CustomSnackBar.show(context, 'Successfully joined the event!');
        } else {
          CustomSnackBar.show(
            context,
            'Added to waitlist at position ${participant.position}',
          );
        }
        setState(() {}); // Refresh UI
      } else {
        CustomSnackBar.show(context, 'Failed to join event', isError: true);
      }
    }
  } catch (e) {
    CustomSnackBar.show(
      context,
      'Error: ${e.toString()}',
      isError: true,
    );
  }
}

// Add button to build method:
// In the Column widget of your details screen, add:
_buildJoinLeaveButton(context),
const SizedBox(height: 16),
```

---

### Step 7: Create Participants List Screen

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/widgets/event/participants_list_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app/features/event/participant_service.dart';
import 'package:app/features/event/participant_entity.dart';
import 'package:app/widgets/event/participant_item.dart';

class ParticipantsListScreen extends StatefulWidget {
  final String eventId;
  final String eventTitle;

  const ParticipantsListScreen({
    required this.eventId,
    required this.eventTitle,
    super.key,
  });

  @override
  State<ParticipantsListScreen> createState() => _ParticipantsListScreenState();
}

class _ParticipantsListScreenState extends State<ParticipantsListScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<ParticipantEntity> _mainList = [];
  List<ParticipantEntity> _waitlist = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadParticipants();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadParticipants() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final participantService = context.read<ParticipantService>();
      final mainList = await participantService.getMainList(widget.eventId);
      final waitlist = await participantService.getWaitlist(widget.eventId);

      setState(() {
        _mainList = mainList;
        _waitlist = waitlist;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load participants: $e';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Participants'),
            Text(
              widget.eventTitle,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Main List (${_mainList.length})'),
            Tab(text: 'Waitlist (${_waitlist.length})'),
          ],
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(_error!, textAlign: TextAlign.center),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadParticipants,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    return TabBarView(
      controller: _tabController,
      children: [
        _buildParticipantList(_mainList, isMainList: true),
        _buildParticipantList(_waitlist, isMainList: false),
      ],
    );
  }

  Widget _buildParticipantList(
    List<ParticipantEntity> participants, {
    required bool isMainList,
  }) {
    if (participants.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.people_outline,
              size: 64,
              color: Colors.grey[400],
            ),
            const SizedBox(height: 16),
            Text(
              isMainList
                  ? 'No participants yet'
                  : 'No one in waitlist',
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadParticipants,
      child: ListView.builder(
        itemCount: participants.length,
        itemBuilder: (context, index) {
          return ParticipantItemWidget(
            participant: participants[index],
            showManagementControls: false,
          );
        },
      ),
    );
  }
}
```

---

### Step 8: Create Participant Item Widget

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/widgets/event/participant_item.dart`

```dart
import 'package:flutter/material.dart';
import 'package:app/features/event/participant_entity.dart';
import 'package:intl/intl.dart';

class ParticipantItemWidget extends StatelessWidget {
  final ParticipantEntity participant;
  final bool showManagementControls;

  const ParticipantItemWidget({
    required this.participant,
    this.showManagementControls = false,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: participant.status.color.withOpacity(0.2),
          child: Text(
            '#${participant.position}',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: participant.status.color,
            ),
          ),
        ),
        title: Row(
          children: [
            Text(
              participant.user.displayName,
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(width: 8),
            if (participant.isConfirmed)
              const Icon(Icons.check_circle, size: 16, color: Colors.green),
            if (participant.isPaid)
              const Icon(Icons.payment, size: 16, color: Colors.blue),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 12),
                const SizedBox(width: 4),
                Text(
                  'Joined: ${DateFormat('MMM dd, HH:mm').format(participant.joinedAt)}',
                  style: const TextStyle(fontSize: 12),
                ),
              ],
            ),
            if (participant.paymentMethod != null) ...[
              const SizedBox(height: 2),
              Row(
                children: [
                  Text(participant.paymentMethod!.icon),
                  const SizedBox(width: 4),
                  Text(
                    participant.paymentMethod!.displayName,
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ],
            if (participant.user.thumbsUp > 0 || participant.user.thumbsDown > 0) ...[
              const SizedBox(height: 2),
              Row(
                children: [
                  const Icon(Icons.thumb_up, size: 12, color: Colors.green),
                  const SizedBox(width: 4),
                  Text(
                    '${participant.user.thumbsUp}',
                    style: const TextStyle(fontSize: 12),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.thumb_down, size: 12, color: Colors.red),
                  const SizedBox(width: 4),
                  Text(
                    '${participant.user.thumbsDown}',
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            ],
          ],
        ),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: participant.status.color,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            participant.status.displayName,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
```

---

### Step 9: Update Providers

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/providers/participant_provider.dart` (CREATE NEW)

```dart
import 'package:provider/provider.dart';
import 'package:app/core/api/http/base_http_client.dart';
import 'package:app/core/api/event/participant_http_client.dart';
import 'package:app/features/event/participant_service.dart';

class ParticipantProvider {
  static List get providers => [
    ProxyProvider<BaseHttpClient, ParticipantHttpClient>(
      update: (context, httpClient, _) => ParticipantHttpClient(httpClient),
    ),
    ProxyProvider<ParticipantHttpClient, ParticipantService>(
      update: (context, httpClient, _) => ParticipantService(httpClient),
    ),
  ];
}
```

**Update main.dart** to include the new provider:

```dart
// Add to providers list in main.dart
...HttpProvider.providers,
...ParticipantProvider.providers,
...
```

---

### Step 10: Update Routes

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/main.dart`

**Add route** for participants list:

```dart
'/event/participants': (context) {
  final args = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>;
  return ParticipantsListScreen(
    eventId: args['eventId'],
    eventTitle: args['eventTitle'],
  );
},
```

---

## Testing Checklist

### Backend Tests

- [ ] Run database migration: `./mvnw flyway:migrate`
- [ ] Verify event_participant table created
- [ ] Test POST /api/v1/events/{id}/join without auth (401)
- [ ] Test POST /api/v1/events/{id}/join with auth (201, returns participant)
- [ ] Test joining event with available slots (should be on main list)
- [ ] Test joining full event (should be on waitlist)
- [ ] Test joining same event twice (409 Conflict)
- [ ] Test joining cancelled event (400 Bad Request)
- [ ] Test joining past event (400 Bad Request)
- [ ] Test organizer joining own event (400 Bad Request)
- [ ] Test GET /api/v1/events/{id}/participants (returns all participants)
- [ ] Test GET /api/v1/events/{id}/participants/main-list
- [ ] Test GET /api/v1/events/{id}/participants/waitlist
- [ ] Test GET /api/v1/events/{id}/participants/status with auth
- [ ] Test DELETE /api/v1/events/{id}/leave without auth (401)
- [ ] Test DELETE /api/v1/events/{id}/leave from main list (204)
- [ ] Test automatic waitlist promotion after leave
- [ ] Test position renumbering after leave
- [ ] Test leaving event not joined (400 Bad Request)
- [ ] Verify slots_available updates correctly

### Frontend Tests

- [ ] Navigate to event details
- [ ] Verify join button shows when not logged in (should not show or redirect to login)
- [ ] Login and verify join button shows
- [ ] Click join button (should show success message)
- [ ] Verify button changes to "Leave Event"
- [ ] Click participants count to view list
- [ ] Verify main list shows participant
- [ ] Join event until full
- [ ] Verify next join goes to waitlist
- [ ] Verify waitlist tab shows participant
- [ ] Leave event from main list
- [ ] Verify first waitlist participant promoted
- [ ] Test error handling (network errors, etc.)
- [ ] Verify loading states
- [ ] Test pull-to-refresh on participants list

---

## API Endpoints Documentation

### POST /api/v1/events/{eventId}/join
Join an event

**Authentication**: Required

**Response**: `201 Created`
```json
{
  "id": 1,
  "user": {
    "id": 5,
    "login": "jane_doe",
    "nickName": "Jane",
    "thumbsUp": 15,
    "thumbsDown": 2
  },
  "position": 1,
  "status": "MAIN_LIST",
  "isConfirmed": false,
  "isPaid": false,
  "joinedAt": "2025-11-04T10:30:00"
}
```

**Errors**:
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Already joined
- `400 Bad Request` - Event not joinable

### DELETE /api/v1/events/{eventId}/leave
Leave an event

**Authentication**: Required

**Response**: `204 No Content`

**Errors**:
- `401 Unauthorized` - Not authenticated
- `400 Bad Request` - Not a participant

### GET /api/v1/events/{eventId}/participants
Get all participants

**Response**: `200 OK` (array of participants)

### GET /api/v1/events/{eventId}/participants/status
Check if current user is participant

**Authentication**: Required

**Response**: `200 OK`
```json
{
  "isParticipant": true
}
```

---

## Acceptance Criteria

Feature is complete when:

1. ✅ Database migration applied and table created
2. ✅ Users can join events (main list if slots available)
3. ✅ Users added to waitlist when event is full
4. ✅ Users can leave events
5. ✅ Automatic waitlist promotion working
6. ✅ Position management working correctly
7. ✅ Duplicate join prevention working
8. ✅ Authorization checks in place
9. ✅ Frontend join/leave buttons working
10. ✅ Participants list screen functional
11. ✅ Status badges and UI indicators correct
12. ✅ Error handling and user feedback working
13. ✅ Slots available count updating correctly
14. ✅ All edge cases handled (organizer join, past events, etc.)
15. ✅ No console errors or warnings

---

## Notes for AI Agent

- Always use transactions for join/leave operations
- Verify slots_available consistency after each operation
- Test automatic promotion logic thoroughly
- Handle race conditions (multiple users joining simultaneously)
- Consider implementing optimistic locking if needed
- Payment tracking is preparatory - actual payment integration comes later
- Notification sending is placeholder - implement in separate feature
- Follow existing code patterns strictly
- Test with multiple concurrent users if possible
