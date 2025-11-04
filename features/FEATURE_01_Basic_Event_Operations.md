# Feature 1: Basic Event Operations

## Overview
Complete CRUD operations for events with advanced filtering, search capabilities, sport type categorization, and status management. This feature extends the existing basic event functionality to provide a full-featured event management system.

**Estimated Time**: 75 hours
**Priority**: CRITICAL PATH
**Status**: 40% Done → Target 100%

## Business Value
- Users can create, edit, and delete their own events
- Advanced filtering helps users find relevant events quickly
- Sport type categorization enables specialized features per sport
- Status management prevents confusion about event availability

## Prerequisites
- ✅ Feature 0: Map with Events (80% done)
- ✅ Sprint 0: Configuration & Authorization (95% done)
- ✅ Database with Flyway migrations
- ✅ JWT authentication working

---

## Backend Implementation

### Step 1: Create Sport Type Enum

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/SportType.java`

```java
package pl.flutterowo.meetappbe.event;

public enum SportType {
    VOLLEYBALL("Volleyball"),
    BASKETBALL("Basketball"),
    FOOTBALL("Football"),
    TENNIS("Tennis"),
    BADMINTON("Badminton"),
    SQUASH("Squash"),
    TABLE_TENNIS("Table Tennis"),
    BEACH_VOLLEYBALL("Beach Volleyball"),
    RUNNING("Running"),
    CYCLING("Cycling"),
    FITNESS("Fitness"),
    OTHER("Other");

    private final String displayName;

    SportType(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

**Why**: Strongly typed enum prevents invalid sport types and enables filtering by sport category.

---

### Step 2: Create Event Status Enum

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/EventStatus.java`

```java
package pl.flutterowo.meetappbe.event;

public enum EventStatus {
    ACTIVE("Active"),
    CANCELLED("Cancelled"),
    COMPLETED("Completed"),
    DRAFT("Draft");

    private final String displayName;

    EventStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

**Why**: Clear status tracking prevents users from joining cancelled/completed events.

---

### Step 3: Update EventEntity with New Fields

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/EventEntity.java`

**Find this code** (existing EventEntity class):
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "event")
public class EventEntity {
    // existing fields
}
```

**Add these new fields** inside the class:

```java
    @Enumerated(EnumType.STRING)
    @Column(name = "sport_type", nullable = false)
    @Builder.Default
    private SportType sportType = SportType.VOLLEYBALL;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private EventStatus status = EventStatus.ACTIVE;

    @Column(name = "visibility_days")
    private Integer visibilityDays;

    @Column(name = "auto_promote_from_waitlist", nullable = false)
    @Builder.Default
    private Boolean autoPromoteFromWaitlist = true;

    @Column(name = "send_notifications", nullable = false)
    @Builder.Default
    private Boolean sendNotifications = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private GroupEntity group;
```

**Why**: These fields enable filtering, automatic waitlist management, and notification preferences.

---

### Step 4: Create Database Migration

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/resources/db/migration/V1_5__Add_missing_event_fields.sql`

```sql
-- Add new columns to event table
ALTER TABLE event
ADD COLUMN IF NOT EXISTS sport_type VARCHAR(50) NOT NULL DEFAULT 'VOLLEYBALL',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS visibility_days INTEGER,
ADD COLUMN IF NOT EXISTS auto_promote_from_waitlist BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS send_notifications BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS group_id BIGINT;

-- Add foreign key constraint (will be created when groups feature is implemented)
-- ALTER TABLE event ADD CONSTRAINT fk_event_group FOREIGN KEY (group_id) REFERENCES _group(id);

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_event_sport_type ON event(sport_type);
CREATE INDEX IF NOT EXISTS idx_event_status ON event(status);
CREATE INDEX IF NOT EXISTS idx_event_start_date ON event(start_date_time);
CREATE INDEX IF NOT EXISTS idx_event_location ON event(location_id);

-- Update existing events to have sport_type if they don't
UPDATE event SET sport_type = 'VOLLEYBALL' WHERE sport_type IS NULL;
UPDATE event SET status = 'ACTIVE' WHERE status IS NULL;
```

**Why**: Adds database columns with proper indexing for performance and backwards compatibility.

---

### Step 5: Create CreateEventRequest DTO

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/CreateEventRequest.java`

```java
package pl.flutterowo.meetappbe.event;

import jakarta.validation.constraints.*;
import lombok.Data;
import pl.flutterowo.meetappbe.common.utilities.Money;
import pl.flutterowo.meetappbe.location.LocationRequest;

import java.time.LocalDateTime;

@Data
public class CreateEventRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @NotNull(message = "Start date time is required")
    @Future(message = "Start date time must be in the future")
    private LocalDateTime startDateTime;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Long duration;

    @NotNull(message = "Location is required")
    private LocationRequest location;

    @NotNull(message = "Slots is required")
    @Min(value = 2, message = "Event must have at least 2 slots")
    @Max(value = 100, message = "Event cannot have more than 100 slots")
    private Integer slots;

    @NotNull(message = "Sport type is required")
    private SportType sportType;

    @Min(value = 0, message = "Level must be between 0 and 5")
    @Max(value = 5, message = "Level must be between 0 and 5")
    private Integer level = 0;

    private Money price;

    @Size(max = 5000, message = "Message cannot exceed 5000 characters")
    private String message;

    private String image;
    private String url;
    private String groupName;
    private String groupUrl;

    private Integer visibilityDays;

    private Boolean autoPromoteFromWaitlist = true;

    private Boolean sendNotifications = true;
}
```

**Why**: Separate DTO for creation with proper validation ensures data integrity.

---

### Step 6: Create UpdateEventRequest DTO

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/UpdateEventRequest.java`

```java
package pl.flutterowo.meetappbe.event;

import jakarta.validation.constraints.*;
import lombok.Data;
import pl.flutterowo.meetappbe.common.utilities.Money;
import pl.flutterowo.meetappbe.location.LocationRequest;

import java.time.LocalDateTime;

@Data
public class UpdateEventRequest {

    @Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    private LocalDateTime startDateTime;

    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Long duration;

    private LocationRequest location;

    @Min(value = 2, message = "Event must have at least 2 slots")
    @Max(value = 100, message = "Event cannot have more than 100 slots")
    private Integer slots;

    private SportType sportType;

    @Min(value = 0, message = "Level must be between 0 and 5")
    @Max(value = 5, message = "Level must be between 0 and 5")
    private Integer level;

    private Money price;

    @Size(max = 5000, message = "Message cannot exceed 5000 characters")
    private String message;

    private String image;
    private String url;

    private Integer visibilityDays;

    private Boolean autoPromoteFromWaitlist;

    private Boolean sendNotifications;

    // Note: Status is NOT editable here - use dedicated endpoint for status changes
    // Note: Group is NOT editable after creation
}
```

**Why**: Update DTO allows partial updates (nullable fields) and restricts sensitive field changes.

---

### Step 7: Update EventRepository with Query Methods

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/EventRepository.java`

**Add these methods** to the existing interface:

```java
package pl.flutterowo.meetappbe.event;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EventRepository extends CrudRepository<EventEntity, UUID> {

    // Existing method - keep this
    @Query("SELECT e FROM EventEntity e JOIN FETCH e.location WHERE e.id = :id")
    Optional<EventEntity> findByIdWithLocation(@Param("id") UUID id);

    // NEW METHODS - Add these below

    @Query("SELECT e FROM EventEntity e JOIN FETCH e.location l " +
           "WHERE e.status = 'ACTIVE' " +
           "AND e.startDateTime > :now " +
           "ORDER BY e.startDateTime ASC")
    List<EventEntity> findActiveUpcomingEvents(@Param("now") LocalDateTime now);

    @Query("SELECT e FROM EventEntity e JOIN FETCH e.location l " +
           "WHERE (:sportType IS NULL OR e.sportType = :sportType) " +
           "AND (:minLevel IS NULL OR e.level >= :minLevel) " +
           "AND (:maxLevel IS NULL OR e.level <= :maxLevel) " +
           "AND (:locationId IS NULL OR e.location.id = :locationId) " +
           "AND (:maxPrice IS NULL OR e.price.amount <= :maxPrice) " +
           "AND (:availableOnly = false OR e.slotsAvailable > 0) " +
           "AND e.status = 'ACTIVE' " +
           "AND e.startDateTime > :now " +
           "ORDER BY e.startDateTime ASC")
    List<EventEntity> findEventsWithFilters(
        @Param("sportType") SportType sportType,
        @Param("minLevel") Integer minLevel,
        @Param("maxLevel") Integer maxLevel,
        @Param("locationId") Long locationId,
        @Param("maxPrice") java.math.BigDecimal maxPrice,
        @Param("availableOnly") Boolean availableOnly,
        @Param("now") LocalDateTime now
    );

    @Query("SELECT e FROM EventEntity e JOIN FETCH e.location l " +
           "WHERE e.user.id = :userId " +
           "ORDER BY e.startDateTime DESC")
    List<EventEntity> findByUserId(@Param("userId") Integer userId);

    @Query("SELECT e FROM EventEntity e JOIN FETCH e.location l " +
           "WHERE LOWER(e.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
           "AND e.status = 'ACTIVE' " +
           "AND e.startDateTime > :now " +
           "ORDER BY e.startDateTime ASC")
    List<EventEntity> searchEventsByTitle(
        @Param("searchTerm") String searchTerm,
        @Param("now") LocalDateTime now
    );
}
```

**Why**: Custom queries enable efficient filtering without loading unnecessary data.

---

### Step 8: Update EventService with Business Logic

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/EventService.java`

**Replace the entire file** with this enhanced version:

```java
package pl.flutterowo.meetappbe.event;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.flutterowo.meetappbe.common.exception.ResourceNotFoundException;
import pl.flutterowo.meetappbe.common.exception.UnauthorizedException;
import pl.flutterowo.meetappbe.location.LocationEntity;
import pl.flutterowo.meetappbe.location.LocationRepository;
import pl.flutterowo.meetappbe.location.LocationRequest;
import pl.flutterowo.meetappbe.user.UserEntity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final LocationRepository locationRepository;

    @Transactional(readOnly = true)
    public List<EventEntity> findAllActive() {
        return eventRepository.findActiveUpcomingEvents(LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<EventEntity> findWithFilters(
            SportType sportType,
            Integer minLevel,
            Integer maxLevel,
            Long locationId,
            BigDecimal maxPrice,
            Boolean availableOnly,
            String searchTerm) {

        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            return eventRepository.searchEventsByTitle(searchTerm, LocalDateTime.now());
        }

        return eventRepository.findEventsWithFilters(
            sportType,
            minLevel,
            maxLevel,
            locationId,
            maxPrice,
            availableOnly != null ? availableOnly : false,
            LocalDateTime.now()
        );
    }

    @Transactional(readOnly = true)
    public Optional<EventEntity> findById(UUID id) {
        return eventRepository.findByIdWithLocation(id);
    }

    @Transactional(readOnly = true)
    public List<EventEntity> findByOrganizer(Integer userId) {
        return eventRepository.findByUserId(userId);
    }

    @Transactional
    public EventEntity createEvent(CreateEventRequest request, UserEntity organizer) {
        // Validate start date is in future
        if (request.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Event start date must be in the future");
        }

        // Calculate end date time
        LocalDateTime endDateTime = request.getStartDateTime()
            .plusMinutes(request.getDuration());

        // Handle location
        LocationEntity location = handleLocation(request.getLocation());

        // Build event entity
        EventEntity event = EventEntity.builder()
            .title(request.getTitle())
            .startDateTime(request.getStartDateTime())
            .endDateTime(endDateTime)
            .duration(request.getDuration())
            .location(location)
            .slots(request.getSlots())
            .slotsAvailable(request.getSlots()) // Initially all slots available
            .sportType(request.getSportType())
            .level(request.getLevel() != null ? request.getLevel() : 0)
            .price(request.getPrice())
            .message(request.getMessage())
            .image(request.getImage())
            .url(request.getUrl())
            .groupName(request.getGroupName())
            .groupUrl(request.getGroupUrl())
            .visibilityDays(request.getVisibilityDays())
            .autoPromoteFromWaitlist(request.getAutoPromoteFromWaitlist())
            .sendNotifications(request.getSendNotifications())
            .status(EventStatus.ACTIVE)
            .user(organizer)
            .createDateTime(LocalDateTime.now())
            .build();

        return eventRepository.save(event);
    }

    @Transactional
    public EventEntity updateEvent(UUID eventId, UpdateEventRequest request, UserEntity currentUser) {
        EventEntity event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        // Check authorization
        if (!event.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only edit your own events");
        }

        // Check if event can still be edited
        if (event.getStatus() == EventStatus.CANCELLED) {
            throw new IllegalStateException("Cannot edit cancelled event");
        }
        if (event.getStatus() == EventStatus.COMPLETED) {
            throw new IllegalStateException("Cannot edit completed event");
        }

        // Update fields if provided
        if (request.getTitle() != null) {
            event.setTitle(request.getTitle());
        }
        if (request.getStartDateTime() != null) {
            if (request.getStartDateTime().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Event start date must be in the future");
            }
            event.setStartDateTime(request.getStartDateTime());

            // Recalculate end date if duration is set
            Long duration = request.getDuration() != null ? request.getDuration() : event.getDuration();
            event.setEndDateTime(request.getStartDateTime().plusMinutes(duration));
        }
        if (request.getDuration() != null) {
            event.setDuration(request.getDuration());
            event.setEndDateTime(event.getStartDateTime().plusMinutes(request.getDuration()));
        }
        if (request.getLocation() != null) {
            LocationEntity location = handleLocation(request.getLocation());
            event.setLocation(location);
        }
        if (request.getSlots() != null) {
            // Cannot reduce slots below current participants count
            int currentParticipants = event.getSlots() - event.getSlotsAvailable();
            if (request.getSlots() < currentParticipants) {
                throw new IllegalArgumentException(
                    "Cannot reduce slots below current participants count: " + currentParticipants
                );
            }
            int slotsDifference = request.getSlots() - event.getSlots();
            event.setSlots(request.getSlots());
            event.setSlotsAvailable(event.getSlotsAvailable() + slotsDifference);
        }
        if (request.getSportType() != null) {
            event.setSportType(request.getSportType());
        }
        if (request.getLevel() != null) {
            event.setLevel(request.getLevel());
        }
        if (request.getPrice() != null) {
            event.setPrice(request.getPrice());
        }
        if (request.getMessage() != null) {
            event.setMessage(request.getMessage());
        }
        if (request.getImage() != null) {
            event.setImage(request.getImage());
        }
        if (request.getUrl() != null) {
            event.setUrl(request.getUrl());
        }
        if (request.getVisibilityDays() != null) {
            event.setVisibilityDays(request.getVisibilityDays());
        }
        if (request.getAutoPromoteFromWaitlist() != null) {
            event.setAutoPromoteFromWaitlist(request.getAutoPromoteFromWaitlist());
        }
        if (request.getSendNotifications() != null) {
            event.setSendNotifications(request.getSendNotifications());
        }

        event.setUpdatedAt(LocalDateTime.now());
        return eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(UUID eventId, UserEntity currentUser) {
        EventEntity event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + eventId));

        // Check authorization
        if (!event.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only delete your own events");
        }

        // Check if event has participants - if yes, should cancel instead of delete
        int participantCount = event.getSlots() - event.getSlotsAvailable();
        if (participantCount > 0) {
            throw new IllegalStateException(
                "Cannot delete event with participants. Cancel the event instead."
            );
        }

        eventRepository.delete(event);
    }

    private LocationEntity handleLocation(LocationRequest locationRequest) {
        // Check if location exists by coordinates
        Optional<LocationEntity> existingLocation = locationRepository
            .findByLatitudeAndLongitude(
                locationRequest.getLatitude(),
                locationRequest.getLongitude()
            );

        if (existingLocation.isPresent()) {
            return existingLocation.get();
        }

        // Create new location
        LocationEntity newLocation = LocationEntity.builder()
            .name(locationRequest.getName())
            .address(locationRequest.getAddress())
            .latitude(locationRequest.getLatitude())
            .longitude(locationRequest.getLongitude())
            .description(locationRequest.getDescription())
            .build();

        return locationRepository.save(newLocation);
    }
}
```

**Why**: Business logic centralized in service layer with proper validation, authorization, and transaction management.

---

### Step 9: Update EventController with New Endpoints

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/EventController.java`

**Replace the entire file** with:

```java
package pl.flutterowo.meetappbe.event;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.flutterowo.meetappbe.user.UserEntity;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final EventMapper eventMapper;

    @GetMapping
    public ResponseEntity<List<EventEntity>> getEvents(
            @RequestParam(required = false) SportType sportType,
            @RequestParam(required = false) Integer minLevel,
            @RequestParam(required = false) Integer maxLevel,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false) String search
    ) {
        List<EventEntity> events;

        // If any filter is provided, use filtered query
        if (sportType != null || minLevel != null || maxLevel != null ||
            locationId != null || maxPrice != null || availableOnly != null || search != null) {
            events = eventService.findWithFilters(
                sportType, minLevel, maxLevel, locationId, maxPrice, availableOnly, search
            );
        } else {
            // Otherwise get all active events
            events = eventService.findAllActive();
        }

        return ResponseEntity.ok(events);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventEntity> getEventById(@PathVariable UUID id) {
        return eventService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/my-events")
    public ResponseEntity<List<EventEntity>> getMyEvents(Authentication authentication) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        List<EventEntity> events = eventService.findByOrganizer(currentUser.getId());
        return ResponseEntity.ok(events);
    }

    @PostMapping
    public ResponseEntity<EventEntity> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            Authentication authentication
    ) {
        UserEntity organizer = (UserEntity) authentication.getPrincipal();
        EventEntity createdEvent = eventService.createEvent(request, organizer);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EventEntity> updateEvent(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEventRequest request,
            Authentication authentication
    ) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        EventEntity updatedEvent = eventService.updateEvent(id, request, currentUser);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        eventService.deleteEvent(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    // Keep existing bulk operations for backward compatibility
    @PutMapping
    public ResponseEntity<Void> addOrUpdateEvents(@RequestBody EventsRequest request) {
        eventMapper.mapEventRequestsToEventEntities(request);
        return ResponseEntity.ok().build();
    }
}
```

**Why**: RESTful endpoints with proper HTTP verbs, authentication, and response codes.

---

### Step 10: Create Custom Exception Classes

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/common/exception/ResourceNotFoundException.java`

```java
package pl.flutterowo.meetappbe.common.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/common/exception/UnauthorizedException.java`

```java
package pl.flutterowo.meetappbe.common.exception;

public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
```

**Why**: Custom exceptions provide clear error handling and better debugging.

---

### Step 11: Update LocationRepository

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/location/LocationRepository.java`

**Add this method**:

```java
package pl.flutterowo.meetappbe.location;

import org.springframework.data.repository.CrudRepository;

import java.math.BigDecimal;
import java.util.Optional;

public interface LocationRepository extends CrudRepository<LocationEntity, Long> {

    Optional<LocationEntity> findByLatitudeAndLongitude(
        BigDecimal latitude,
        BigDecimal longitude
    );
}
```

**Why**: Prevents duplicate locations with same coordinates.

---

### Step 12: Update GlobalExceptionHandler

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/config/GlobalExceptionHandler.java`

**Add these exception handlers** to the existing class:

```java
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.CONFLICT.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }
```

**If ErrorResponse class doesn't exist**, create it:

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/config/ErrorResponse.java`

```java
package pl.flutterowo.meetappbe.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private LocalDateTime timestamp;
}
```

---

## Frontend Implementation

### Step 1: Update Event Entity with New Fields

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/features/event/event_entity.dart`

**Find the EventEntity class** and add these new fields:

```dart
import 'package:equatable/equatable.dart';
import 'package:app/features/event/sport_type.dart';
import 'package:app/features/event/event_status.dart';
import 'package:app/features/location/location_entity.dart';
import 'package:app/features/user/user_entity.dart';
import 'package:app/models/cost.dart';

class EventEntity extends Equatable {
  final String id;
  final String title;
  final DateTime startDateTime;
  final DateTime? endDateTime;
  final int duration;
  final LocationEntity location;
  final int slots;
  final int slotsAvailable;
  final SportType sportType;  // NEW
  final EventStatus status;   // NEW
  final int level;
  final Cost? price;
  final String? message;
  final String? image;
  final String? url;
  final String? groupName;
  final String? groupUrl;
  final UserEntity organizer;
  final DateTime createdAt;
  final DateTime? updatedAt;
  final int? visibilityDays;  // NEW
  final bool autoPromoteFromWaitlist;  // NEW
  final bool sendNotifications;  // NEW

  const EventEntity({
    required this.id,
    required this.title,
    required this.startDateTime,
    this.endDateTime,
    required this.duration,
    required this.location,
    required this.slots,
    required this.slotsAvailable,
    required this.sportType,
    required this.status,
    required this.level,
    this.price,
    this.message,
    this.image,
    this.url,
    this.groupName,
    this.groupUrl,
    required this.organizer,
    required this.createdAt,
    this.updatedAt,
    this.visibilityDays,
    required this.autoPromoteFromWaitlist,
    required this.sendNotifications,
  });

  factory EventEntity.fromJson(Map<String, dynamic> json) {
    return EventEntity(
      id: json['id'],
      title: json['title'],
      startDateTime: DateTime.parse(json['startDateTime']),
      endDateTime: json['endDateTime'] != null
        ? DateTime.parse(json['endDateTime'])
        : null,
      duration: json['duration'],
      location: LocationEntity.fromJson(json['location']),
      slots: json['slots'],
      slotsAvailable: json['slotsAvailable'],
      sportType: SportType.fromString(json['sportType']),
      status: EventStatus.fromString(json['status']),
      level: json['level'] ?? 0,
      price: json['price'] != null
        ? Cost(
            amount: double.parse(json['price']['amount'].toString()),
            currency: json['price']['currency'] ?? 'PLN',
          )
        : null,
      message: json['message'],
      image: json['image'],
      url: json['url'],
      groupName: json['groupName'],
      groupUrl: json['groupUrl'],
      organizer: UserEntity.fromJson(json['user']),
      createdAt: DateTime.parse(json['createDateTime']),
      updatedAt: json['updatedAt'] != null
        ? DateTime.parse(json['updatedAt'])
        : null,
      visibilityDays: json['visibilityDays'],
      autoPromoteFromWaitlist: json['autoPromoteFromWaitlist'] ?? true,
      sendNotifications: json['sendNotifications'] ?? true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'startDateTime': startDateTime.toIso8601String(),
      'endDateTime': endDateTime?.toIso8601String(),
      'duration': duration,
      'location': location.toJson(),
      'slots': slots,
      'slotsAvailable': slotsAvailable,
      'sportType': sportType.name,
      'status': status.name,
      'level': level,
      'price': price?.toJson(),
      'message': message,
      'image': image,
      'url': url,
      'groupName': groupName,
      'groupUrl': groupUrl,
      'visibilityDays': visibilityDays,
      'autoPromoteFromWaitlist': autoPromoteFromWaitlist,
      'sendNotifications': sendNotifications,
    };
  }

  @override
  List<Object?> get props => [
    id, title, startDateTime, endDateTime, duration, location,
    slots, slotsAvailable, sportType, status, level, price,
    message, image, url, groupName, groupUrl, organizer,
    createdAt, updatedAt, visibilityDays, autoPromoteFromWaitlist,
    sendNotifications,
  ];
}
```

---

### Step 2: Create SportType Enum

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/features/event/sport_type.dart`

```dart
enum SportType {
  volleyball('VOLLEYBALL', 'Volleyball', '🏐'),
  basketball('BASKETBALL', 'Basketball', '🏀'),
  football('FOOTBALL', 'Football', '⚽'),
  tennis('TENNIS', 'Tennis', '🎾'),
  badminton('BADMINTON', 'Badminton', '🏸'),
  squash('SQUASH', 'Squash', '🎾'),
  tableTennis('TABLE_TENNIS', 'Table Tennis', '🏓'),
  beachVolleyball('BEACH_VOLLEYBALL', 'Beach Volleyball', '🏖️'),
  running('RUNNING', 'Running', '🏃'),
  cycling('CYCLING', 'Cycling', '🚴'),
  fitness('FITNESS', 'Fitness', '💪'),
  other('OTHER', 'Other', '⚡');

  final String name;
  final String displayName;
  final String icon;

  const SportType(this.name, this.displayName, this.icon);

  static SportType fromString(String value) {
    return SportType.values.firstWhere(
      (type) => type.name == value,
      orElse: () => SportType.other,
    );
  }

  String toJson() => name;
}
```

---

### Step 3: Create EventStatus Enum

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/features/event/event_status.dart`

```dart
import 'package:flutter/material.dart';

enum EventStatus {
  active('ACTIVE', 'Active', Colors.green),
  cancelled('CANCELLED', 'Cancelled', Colors.red),
  completed('COMPLETED', 'Completed', Colors.grey),
  draft('DRAFT', 'Draft', Colors.orange);

  final String name;
  final String displayName;
  final Color color;

  const EventStatus(this.name, this.displayName, this.color);

  static EventStatus fromString(String value) {
    return EventStatus.values.firstWhere(
      (status) => status.name == value,
      orElse: () => EventStatus.active,
    );
  }

  String toJson() => name;
}
```

---

### Step 4: Update Event HTTP Client

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/core/api/event/event_http_client.dart`

**Add these new methods** to the existing class:

```dart
import 'package:app/core/api/event/event_http_response.dart';
import 'package:app/core/api/http/base_http_client.dart';
import 'package:app/core/api/http/http_response.dart';
import 'package:app/features/event/sport_type.dart';

class EventHttpClient {
  final BaseHttpClient httpClient;

  EventHttpClient(this.httpClient);

  // Existing method - keep this
  Future<HttpResponse> getEvents() async {
    return await httpClient.get<EventHttpResponse>(
      path: '/api/v1/events',
      fromJson: (json) => EventHttpResponse.fromJson(json),
      requiresAuth: false,
    );
  }

  // NEW METHODS - Add these

  Future<HttpResponse> getEventsWithFilters({
    SportType? sportType,
    int? minLevel,
    int? maxLevel,
    int? locationId,
    double? maxPrice,
    bool? availableOnly,
    String? search,
  }) async {
    Map<String, dynamic> queryParams = {};

    if (sportType != null) queryParams['sportType'] = sportType.name;
    if (minLevel != null) queryParams['minLevel'] = minLevel.toString();
    if (maxLevel != null) queryParams['maxLevel'] = maxLevel.toString();
    if (locationId != null) queryParams['locationId'] = locationId.toString();
    if (maxPrice != null) queryParams['maxPrice'] = maxPrice.toString();
    if (availableOnly != null) queryParams['availableOnly'] = availableOnly.toString();
    if (search != null && search.isNotEmpty) queryParams['search'] = search;

    return await httpClient.get<EventHttpResponse>(
      path: '/api/v1/events',
      queryParameters: queryParams,
      fromJson: (json) => EventHttpResponse.fromJson(json),
      requiresAuth: false,
    );
  }

  Future<HttpResponse> getEventById(String id) async {
    return await httpClient.get<EventHttpResponse>(
      path: '/api/v1/events/$id',
      fromJson: (json) => EventHttpResponse.fromJson(json),
      requiresAuth: false,
    );
  }

  Future<HttpResponse> getMyEvents() async {
    return await httpClient.get<EventHttpResponse>(
      path: '/api/v1/events/my-events',
      fromJson: (json) => EventHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }

  Future<HttpResponse> createEvent(Map<String, dynamic> eventData) async {
    return await httpClient.post<EventHttpResponse>(
      path: '/api/v1/events',
      body: eventData,
      fromJson: (json) => EventHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }

  Future<HttpResponse> updateEvent(String id, Map<String, dynamic> eventData) async {
    return await httpClient.put<EventHttpResponse>(
      path: '/api/v1/events/$id',
      body: eventData,
      fromJson: (json) => EventHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }

  Future<HttpResponse> deleteEvent(String id) async {
    return await httpClient.delete(
      path: '/api/v1/events/$id',
      requiresAuth: true,
    );
  }
}
```

---

### Step 5: Create Event Service

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/features/event/event_service.dart`

```dart
import 'package:app/core/api/event/event_http_client.dart';
import 'package:app/core/api/http/http_status_codes.dart';
import 'package:app/features/event/event_entity.dart';
import 'package:app/features/event/sport_type.dart';

class EventService {
  final EventHttpClient _httpClient;

  EventService(this._httpClient);

  Future<List<EventEntity>> getEvents() async {
    try {
      final response = await _httpClient.getEvents();
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.events;
      }
      return [];
    } catch (e) {
      print('Error fetching events: $e');
      return [];
    }
  }

  Future<List<EventEntity>> getEventsWithFilters({
    SportType? sportType,
    int? minLevel,
    int? maxLevel,
    int? locationId,
    double? maxPrice,
    bool? availableOnly,
    String? search,
  }) async {
    try {
      final response = await _httpClient.getEventsWithFilters(
        sportType: sportType,
        minLevel: minLevel,
        maxLevel: maxLevel,
        locationId: locationId,
        maxPrice: maxPrice,
        availableOnly: availableOnly,
        search: search,
      );
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.events;
      }
      return [];
    } catch (e) {
      print('Error fetching filtered events: $e');
      return [];
    }
  }

  Future<EventEntity?> getEventById(String id) async {
    try {
      final response = await _httpClient.getEventById(id);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.event;
      }
      return null;
    } catch (e) {
      print('Error fetching event: $e');
      return null;
    }
  }

  Future<List<EventEntity>> getMyEvents() async {
    try {
      final response = await _httpClient.getMyEvents();
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.events;
      }
      return [];
    } catch (e) {
      print('Error fetching my events: $e');
      return [];
    }
  }

  Future<EventEntity?> createEvent(Map<String, dynamic> eventData) async {
    try {
      final response = await _httpClient.createEvent(eventData);
      if (response.statusCode == HttpStatusCodes.created && response.data != null) {
        return response.data.event;
      }
      return null;
    } catch (e) {
      print('Error creating event: $e');
      return null;
    }
  }

  Future<EventEntity?> updateEvent(String id, Map<String, dynamic> eventData) async {
    try {
      final response = await _httpClient.updateEvent(id, eventData);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.event;
      }
      return null;
    } catch (e) {
      print('Error updating event: $e');
      return null;
    }
  }

  Future<bool> deleteEvent(String id) async {
    try {
      final response = await _httpClient.deleteEvent(id);
      return response.statusCode == HttpStatusCodes.noContent;
    } catch (e) {
      print('Error deleting event: $e');
      return false;
    }
  }
}
```

---

### Step 6: Create Event List Screen

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/widgets/event/list_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app/features/event/event_service.dart';
import 'package:app/features/event/event_entity.dart';
import 'package:app/widgets/event/list_item.dart';
import 'package:app/widgets/event/filter_bottom_sheet.dart';
import 'package:app/features/event/sport_type.dart';

class EventListScreen extends StatefulWidget {
  const EventListScreen({super.key});

  @override
  State<EventListScreen> createState() => _EventListScreenState();
}

class _EventListScreenState extends State<EventListScreen> {
  List<EventEntity> _events = [];
  bool _isLoading = true;
  String? _error;
  String _searchQuery = '';

  // Filter state
  SportType? _selectedSportType;
  int? _minLevel;
  int? _maxLevel;
  int? _locationId;
  double? _maxPrice;
  bool? _availableOnly;

  @override
  void initState() {
    super.initState();
    _loadEvents();
  }

  Future<void> _loadEvents() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final eventService = context.read<EventService>();
      final events = await eventService.getEventsWithFilters(
        sportType: _selectedSportType,
        minLevel: _minLevel,
        maxLevel: _maxLevel,
        locationId: _locationId,
        maxPrice: _maxPrice,
        availableOnly: _availableOnly,
        search: _searchQuery.isEmpty ? null : _searchQuery,
      );

      setState(() {
        _events = events;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = 'Failed to load events: $e';
        _isLoading = false;
      });
    }
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => EventFilterBottomSheet(
        initialSportType: _selectedSportType,
        initialMinLevel: _minLevel,
        initialMaxLevel: _maxLevel,
        initialMaxPrice: _maxPrice,
        initialAvailableOnly: _availableOnly,
        onApplyFilters: (sportType, minLevel, maxLevel, maxPrice, availableOnly) {
          setState(() {
            _selectedSportType = sportType;
            _minLevel = minLevel;
            _maxLevel = maxLevel;
            _maxPrice = maxPrice;
            _availableOnly = availableOnly;
          });
          _loadEvents();
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Events'),
        actions: [
          IconButton(
            icon: Icon(
              Icons.filter_list,
              color: _hasActiveFilters() ? Colors.blue : null,
            ),
            onPressed: _showFilterDialog,
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(60),
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search events...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          setState(() {
                            _searchQuery = '';
                          });
                          _loadEvents();
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                filled: true,
                fillColor: Colors.white,
              ),
              onChanged: (value) {
                setState(() {
                  _searchQuery = value;
                });
              },
              onSubmitted: (_) => _loadEvents(),
            ),
          ),
        ),
      ),
      body: _buildBody(),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, '/event/create').then((_) => _loadEvents());
        },
        child: const Icon(Icons.add),
      ),
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
              onPressed: _loadEvents,
              child: const Text('Retry'),
            ),
          ],
        ),
      );
    }

    if (_events.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.event_busy, size: 64, color: Colors.grey),
            const SizedBox(height: 16),
            const Text('No events found'),
            if (_hasActiveFilters()) ...[
              const SizedBox(height: 8),
              TextButton(
                onPressed: () {
                  setState(() {
                    _selectedSportType = null;
                    _minLevel = null;
                    _maxLevel = null;
                    _maxPrice = null;
                    _availableOnly = null;
                    _searchQuery = '';
                  });
                  _loadEvents();
                },
                child: const Text('Clear filters'),
              ),
            ],
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadEvents,
      child: ListView.builder(
        itemCount: _events.length,
        itemBuilder: (context, index) {
          return EventListItem(
            event: _events[index],
            onTap: () {
              Navigator.pushNamed(
                context,
                '/details',
                arguments: _events[index],
              ).then((_) => _loadEvents());
            },
          );
        },
      ),
    );
  }

  bool _hasActiveFilters() {
    return _selectedSportType != null ||
        _minLevel != null ||
        _maxLevel != null ||
        _maxPrice != null ||
        _availableOnly != null;
  }
}
```

---

### Step 7: Create Event List Item Widget

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/widgets/event/list_item.dart`

```dart
import 'package:flutter/material.dart';
import 'package:app/features/event/event_entity.dart';
import 'package:app/features/event/utilities/date_utility.dart';
import 'package:app/features/event/utilities/duration_utility.dart';
import 'package:intl/intl.dart';

class EventListItem extends StatelessWidget {
  final EventEntity event;
  final VoidCallback onTap;

  const EventListItem({
    required this.event,
    required this.onTap,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: event.status.color.withOpacity(0.2),
          child: Text(
            event.sportType.icon,
            style: const TextStyle(fontSize: 24),
          ),
        ),
        title: Text(
          event.title,
          style: const TextStyle(fontWeight: FontWeight.bold),
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 14),
                const SizedBox(width: 4),
                Text(DateUtility.formatEventDate(event.startDateTime)),
              ],
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                const Icon(Icons.location_on, size: 14),
                const SizedBox(width: 4),
                Expanded(
                  child: Text(
                    event.location.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 2),
            Row(
              children: [
                const Icon(Icons.people, size: 14),
                const SizedBox(width: 4),
                Text('${event.slotsAvailable}/${event.slots} available'),
                const SizedBox(width: 16),
                if (event.price != null) ...[
                  const Icon(Icons.attach_money, size: 14),
                  const SizedBox(width: 4),
                  Text('${event.price!.amount.toStringAsFixed(0)} ${event.price!.currency}'),
                ],
              ],
            ),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: event.status.color,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                event.status.displayName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Level ${event.level}',
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
        ),
        onTap: onTap,
      ),
    );
  }
}
```

---

### Step 8: Create Filter Bottom Sheet

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/widgets/event/filter_bottom_sheet.dart`

```dart
import 'package:flutter/material.dart';
import 'package:app/features/event/sport_type.dart';

class EventFilterBottomSheet extends StatefulWidget {
  final SportType? initialSportType;
  final int? initialMinLevel;
  final int? initialMaxLevel;
  final double? initialMaxPrice;
  final bool? initialAvailableOnly;
  final Function(SportType?, int?, int?, double?, bool?) onApplyFilters;

  const EventFilterBottomSheet({
    this.initialSportType,
    this.initialMinLevel,
    this.initialMaxLevel,
    this.initialMaxPrice,
    this.initialAvailableOnly,
    required this.onApplyFilters,
    super.key,
  });

  @override
  State<EventFilterBottomSheet> createState() => _EventFilterBottomSheetState();
}

class _EventFilterBottomSheetState extends State<EventFilterBottomSheet> {
  SportType? _selectedSportType;
  int? _minLevel;
  int? _maxLevel;
  double? _maxPrice;
  bool _availableOnly = false;

  @override
  void initState() {
    super.initState();
    _selectedSportType = widget.initialSportType;
    _minLevel = widget.initialMinLevel;
    _maxLevel = widget.initialMaxLevel;
    _maxPrice = widget.initialMaxPrice;
    _availableOnly = widget.initialAvailableOnly ?? false;
  }

  @override
  Widget build(BuildContext context) {
    return DraggableScrollableSheet(
      initialChildSize: 0.7,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (context, scrollController) {
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            children: [
              // Handle bar
              Container(
                margin: const EdgeInsets.symmetric(vertical: 12),
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey[300],
                  borderRadius: BorderRadius.circular(2),
                ),
              ),

              // Title
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Filter Events',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: _clearFilters,
                      child: const Text('Clear All'),
                    ),
                  ],
                ),
              ),

              const Divider(),

              // Scrollable content
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.all(16),
                  children: [
                    // Sport Type
                    const Text(
                      'Sport Type',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: SportType.values.map((sport) {
                        final isSelected = _selectedSportType == sport;
                        return FilterChip(
                          label: Text('${sport.icon} ${sport.displayName}'),
                          selected: isSelected,
                          onSelected: (selected) {
                            setState(() {
                              _selectedSportType = selected ? sport : null;
                            });
                          },
                        );
                      }).toList(),
                    ),

                    const SizedBox(height: 24),

                    // Skill Level
                    const Text(
                      'Skill Level',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            decoration: const InputDecoration(
                              labelText: 'Min Level',
                              border: OutlineInputBorder(),
                            ),
                            value: _minLevel,
                            items: List.generate(6, (i) => i)
                                .map((level) => DropdownMenuItem(
                                      value: level,
                                      child: Text('Level $level'),
                                    ))
                                .toList(),
                            onChanged: (value) {
                              setState(() {
                                _minLevel = value;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            decoration: const InputDecoration(
                              labelText: 'Max Level',
                              border: OutlineInputBorder(),
                            ),
                            value: _maxLevel,
                            items: List.generate(6, (i) => i)
                                .map((level) => DropdownMenuItem(
                                      value: level,
                                      child: Text('Level $level'),
                                    ))
                                .toList(),
                            onChanged: (value) {
                              setState(() {
                                _maxLevel = value;
                              });
                            },
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    // Max Price
                    const Text(
                      'Maximum Price',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      decoration: const InputDecoration(
                        labelText: 'Max Price (PLN)',
                        border: OutlineInputBorder(),
                        prefixIcon: Icon(Icons.attach_money),
                      ),
                      keyboardType: TextInputType.number,
                      onChanged: (value) {
                        setState(() {
                          _maxPrice = double.tryParse(value);
                        });
                      },
                      controller: TextEditingController(
                        text: _maxPrice?.toString() ?? '',
                      ),
                    ),

                    const SizedBox(height: 24),

                    // Available Only
                    SwitchListTile(
                      title: const Text('Show only events with available slots'),
                      value: _availableOnly,
                      onChanged: (value) {
                        setState(() {
                          _availableOnly = value;
                        });
                      },
                    ),
                  ],
                ),
              ),

              // Apply button
              Padding(
                padding: const EdgeInsets.all(16),
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      widget.onApplyFilters(
                        _selectedSportType,
                        _minLevel,
                        _maxLevel,
                        _maxPrice,
                        _availableOnly,
                      );
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                    child: const Text(
                      'Apply Filters',
                      style: TextStyle(fontSize: 16),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _clearFilters() {
    setState(() {
      _selectedSportType = null;
      _minLevel = null;
      _maxLevel = null;
      _maxPrice = null;
      _availableOnly = false;
    });
  }
}
```

---

## Database Schema

### Updated Event Table

```sql
event (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  start_date_time TIMESTAMP NOT NULL,
  end_date_time TIMESTAMP,
  duration BIGINT NOT NULL,
  location_id BIGINT NOT NULL REFERENCES location(id),
  slots INTEGER NOT NULL DEFAULT 0,
  slots_available INTEGER NOT NULL DEFAULT 0,
  sport_type VARCHAR(50) NOT NULL DEFAULT 'VOLLEYBALL',
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  level INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(19,2),
  currency VARCHAR(10) NOT NULL DEFAULT 'PLN',
  message TEXT,
  image VARCHAR(255),
  url VARCHAR(255),
  group_name VARCHAR(255),
  group_url VARCHAR(255),
  group_id BIGINT REFERENCES _group(id),
  user_id INTEGER NOT NULL REFERENCES _user(id),
  visibility_days INTEGER,
  auto_promote_from_waitlist BOOLEAN NOT NULL DEFAULT TRUE,
  send_notifications BOOLEAN NOT NULL DEFAULT TRUE,
  create_date_time TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  CONSTRAINT chk_level CHECK (level >= 0 AND level <= 5),
  CONSTRAINT chk_slots CHECK (slots >= 2 AND slots <= 100),
  CONSTRAINT chk_slots_available CHECK (slots_available >= 0 AND slots_available <= slots)
);

-- Indexes for performance
CREATE INDEX idx_event_sport_type ON event(sport_type);
CREATE INDEX idx_event_status ON event(status);
CREATE INDEX idx_event_start_date ON event(start_date_time);
CREATE INDEX idx_event_location ON event(location_id);
CREATE INDEX idx_event_user ON event(user_id);
```

---

## API Endpoints

### GET /api/v1/events
Get all active upcoming events with optional filtering

**Query Parameters:**
- `sportType` (optional): Filter by sport type (VOLLEYBALL, BASKETBALL, etc.)
- `minLevel` (optional): Minimum skill level (0-5)
- `maxLevel` (optional): Maximum skill level (0-5)
- `locationId` (optional): Filter by location ID
- `maxPrice` (optional): Maximum price
- `availableOnly` (optional): Show only events with available slots (true/false)
- `search` (optional): Search in event titles

**Response**: `200 OK`
```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Evening Volleyball",
    "startDateTime": "2025-11-05T18:00:00",
    "endDateTime": "2025-11-05T20:00:00",
    "duration": 120,
    "location": {
      "id": 1,
      "name": "Sports Hall",
      "latitude": 52.385695,
      "longitude": 16.946893
    },
    "slots": 12,
    "slotsAvailable": 5,
    "sportType": "VOLLEYBALL",
    "status": "ACTIVE",
    "level": 3,
    "price": {
      "amount": 15.00,
      "currency": "PLN"
    },
    "message": "Bring your own shoes!",
    "user": {
      "id": 1,
      "login": "john_doe",
      "nickName": "John"
    },
    "visibilityDays": 7,
    "autoPromoteFromWaitlist": true,
    "sendNotifications": true,
    "createDateTime": "2025-11-01T10:00:00"
  }
]
```

### GET /api/v1/events/{id}
Get event by ID

**Response**: `200 OK` (same structure as above for single event) or `404 Not Found`

### GET /api/v1/events/my-events
Get events created by authenticated user

**Authentication**: Required

**Response**: `200 OK` (array of events)

### POST /api/v1/events
Create new event

**Authentication**: Required

**Request Body:**
```json
{
  "title": "Evening Volleyball",
  "startDateTime": "2025-11-05T18:00:00",
  "duration": 120,
  "location": {
    "name": "Sports Hall",
    "address": "ul. Sportowa 1, Poznań",
    "latitude": 52.385695,
    "longitude": 16.946893
  },
  "slots": 12,
  "sportType": "VOLLEYBALL",
  "level": 3,
  "price": {
    "amount": 15.00,
    "currency": "PLN"
  },
  "message": "Bring your own shoes!",
  "visibilityDays": 7,
  "autoPromoteFromWaitlist": true,
  "sendNotifications": true
}
```

**Response**: `201 Created` (created event) or `400 Bad Request`

### PUT /api/v1/events/{id}
Update event

**Authentication**: Required (must be event organizer)

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "startDateTime": "2025-11-06T18:00:00",
  "slots": 14
}
```

**Response**: `200 OK` (updated event), `403 Forbidden`, or `404 Not Found`

### DELETE /api/v1/events/{id}
Delete event

**Authentication**: Required (must be event organizer)

**Response**: `204 No Content`, `403 Forbidden`, `404 Not Found`, or `409 Conflict` (if event has participants)

---

## Testing Checklist

### Backend Tests

- [ ] Start backend server: `cd meet-app-be && JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./mvnw spring-boot:run`
- [ ] Verify migration applied: Check database for new columns
- [ ] Test GET /api/v1/events (should return active events)
- [ ] Test GET /api/v1/events with filters (each parameter)
- [ ] Test GET /api/v1/events with search parameter
- [ ] Test GET /api/v1/events/{id} (existing event)
- [ ] Test GET /api/v1/events/{id} (non-existent event - should return 404)
- [ ] Test POST /api/v1/events without auth (should return 401)
- [ ] Test POST /api/v1/events with auth and valid data (should create)
- [ ] Test POST /api/v1/events with invalid data (should return 400)
- [ ] Test POST /api/v1/events with past date (should return 400)
- [ ] Test PUT /api/v1/events/{id} as organizer (should update)
- [ ] Test PUT /api/v1/events/{id} as different user (should return 403)
- [ ] Test PUT /api/v1/events/{id} reducing slots below participants (should return 400)
- [ ] Test DELETE /api/v1/events/{id} without participants (should delete)
- [ ] Test DELETE /api/v1/events/{id} with participants (should return 409)
- [ ] Test GET /api/v1/events/my-events (should return user's events)

### Frontend Tests

- [ ] Start frontend: `cd meet-app-fe/app && flutter run`
- [ ] Navigate to Event List screen
- [ ] Verify events load and display correctly
- [ ] Test search functionality
- [ ] Test filter by sport type
- [ ] Test filter by level range
- [ ] Test filter by max price
- [ ] Test "available only" toggle
- [ ] Test clear filters button
- [ ] Test tap on event (should navigate to details)
- [ ] Test create event button (navigate to create screen)
- [ ] Test pull-to-refresh
- [ ] Verify loading state shows spinner
- [ ] Test error state and retry button
- [ ] Verify empty state displays when no events
- [ ] Test status badges display correct colors

---

## Acceptance Criteria

Feature is complete when:

1. ✅ Backend database migration applied successfully
2. ✅ All new enums (SportType, EventStatus) created and working
3. ✅ All backend endpoints implemented and tested
4. ✅ Proper authorization checks in place (users can only edit/delete own events)
5. ✅ Validation working correctly (dates, slots, levels)
6. ✅ Frontend enums matching backend enums
7. ✅ Event list screen displaying events with filters
8. ✅ Search functionality working
9. ✅ Filter bottom sheet functional with all filter options
10. ✅ Event creation flow working (covered in separate feature)
11. ✅ Event edit flow working (covered in separate feature)
12. ✅ Event deletion working with proper checks
13. ✅ Error handling and loading states implemented
14. ✅ No console errors or warnings
15. ✅ Code follows existing patterns and conventions

---

## Notes for AI Agent

- Follow existing code patterns in the codebase strictly
- Use Lombok annotations in backend (@Data, @Builder, etc.)
- Use Equatable in Flutter for value equality
- All API paths must start with `/api/v1/`
- Always use `Authentication authentication` parameter for authenticated endpoints
- Extract current user with: `UserEntity user = (UserEntity) authentication.getPrincipal()`
- Use `@Transactional` for service methods that modify data
- Use `JOIN FETCH` in queries to avoid N+1 problems
- Flutter: Use Provider for dependency injection
- Flutter: Use const constructors where possible
- Always handle null cases in Flutter (use ?. and ?? operators)
- Use existing custom widgets (CustomButton, CustomTextField, CustomSnackBar)
- Test thoroughly before marking feature as complete
