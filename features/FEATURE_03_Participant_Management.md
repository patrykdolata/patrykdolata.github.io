# Feature 3: Participant Management

## Standardized Spec

- Milestone: M1 (MVP) – manual; M2 (Advanced) – rozszerzenia
- Goal: Organizator ręcznie zarządza uczestnikami; w M2 zaawansowane akcje.
- In Scope (M1): add/remove, lista z pozycją (readonly), organizer‑only checks, prosty UI.
- Out of Scope (M1): self‑service, płatności, drag&drop.
- Prerequisites: Feature 1; EventParticipant tabela (uproszczona); Auth.
- Security/Permissions: Wszystkie mutacje tylko dla organizatora wydarzenia; audyt.
- Acceptance Criteria (M1): add/remove działa; lista odświeża się; uprawnienia egzekwowane.
- Backend API (M1):
  - POST `/events/{eventId}/participants` (manual add)
  - DELETE `/events/{eventId}/participants/{userId}` (remove)
  - GET `/events/{eventId}/participants`
- Data Model:
  - EventParticipant: `event_id`, `user_id`, `position`, `added_at`, `added_by`.
- Frontend UX:
  - Screen „ParticipantsManage”, list, Add/Remove; label “Organizer only”.
- Tests:
  - BE: uprawnienia, renumeracja po remove, brak duplikatów; FE: UI flow + refresh.

## Overview
Organizer-only tools for managing event participants including position reordering via drag-and-drop, confirmation toggles, payment tracking, manual participant addition/removal, and promotion/demotion between main list and waitlist.

**Priority**: CRITICAL PATH
**Milestone**: M1 (MVP - Manual only), M2 (Advanced features)
**Implementation Status**: See TODO.md for current progress

---

## Milestone & Scope

- Milestone: M1 (MVP)
- Scope (M1):
  - Organizer‑only: manual add/remove uczestników
  - Lista uczestników + pozycja (readonly)
  - Prosty label w UI: „Organizer only”
- Out of scope (Post‑MVP):
  - Self‑service join/leave (Feature 2)
  - Drag&drop reordering, confirmation toggles
  - Płatności

## Acceptance Criteria (M1)

- Organizator może dodać/usuwać uczestników ręcznie
- Lista uczestników pokazuje pozycje i podstawowe dane
- Uprawnienia: tylko organizator wydarzenia może zarządzać

## Test Plan (smoke, M1)

- BE: POST add, DELETE remove, GET list – działają i weryfikują uprawnienia organizatora
- FE: ekran zarządzania – dodanie/wycofanie uczestnika odświeża listę


## Business Value
- Organizers have full control over participant lists
- Manual overrides for automatic waitlist system
- Payment tracking simplifies financial management
- Reordering allows organizers to prioritize participants
- Manual add enables inviting specific users

## Prerequisites
- ✅ Feature 2: Join/Leave Events (100% done)
- ✅ EventParticipant entity and table exist
- ✅ Authorization system working

---

## Backend Implementation

### Step 1: Create Request DTOs

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/ChangePositionRequest.java`

```java
package pl.flutterowo.meetappbe.event.participant;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChangePositionRequest {
    @NotNull(message = "New position is required")
    @Min(value = 1, message = "Position must be at least 1")
    private Integer newPosition;
}
```

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/UpdatePaymentRequest.java`

```java
package pl.flutterowo.meetappbe.event.participant;

import lombok.Data;

@Data
public class UpdatePaymentRequest {
    private Boolean isPaid;
    private PaymentMethod paymentMethod;
}
```

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/AddParticipantRequest.java`

```java
package pl.flutterowo.meetappbe.event.participant;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddParticipantRequest {
    @NotNull(message = "User ID is required")
    private Integer userId;

    private String notes;
}
```

---

### Step 2: Extend EventParticipantService with Management Methods

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/EventParticipantService.java`

**Add these methods** to the existing service:

```java
    // Verify organizer authorization
    private void verifyOrganizer(UUID eventId, UserEntity currentUser) {
        EventEntity event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        if (!event.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Only event organizer can manage participants");
        }
    }

    @Transactional
    public EventParticipantEntity changePosition(
            UUID eventId,
            Integer userId,
            Integer newPosition,
            UserEntity currentUser) {

        verifyOrganizer(eventId, currentUser);

        EventParticipantEntity participant = participantRepository
            .findByEventIdAndUserId(eventId, userId)
            .orElseThrow(() -> new NotParticipantException("User is not a participant"));

        Integer oldPosition = participant.getPosition();
        ParticipantStatus status = participant.getStatus();

        if (oldPosition.equals(newPosition)) {
            return participant; // No change
        }

        // Get all participants with same status
        List<EventParticipantEntity> allParticipants = status == ParticipantStatus.MAIN_LIST
            ? participantRepository.findMainListByEventId(eventId)
            : participantRepository.findWaitlistByEventId(eventId);

        // Validate new position
        if (newPosition < 1 || newPosition > allParticipants.size()) {
            throw new IllegalArgumentException("Invalid position: " + newPosition);
        }

        // Reorder logic
        if (newPosition < oldPosition) {
            // Moving up: shift others down
            for (EventParticipantEntity p : allParticipants) {
                if (p.getPosition() >= newPosition && p.getPosition() < oldPosition) {
                    p.setPosition(p.getPosition() + 1);
                    participantRepository.save(p);
                }
            }
        } else {
            // Moving down: shift others up
            for (EventParticipantEntity p : allParticipants) {
                if (p.getPosition() > oldPosition && p.getPosition() <= newPosition) {
                    p.setPosition(p.getPosition() - 1);
                    participantRepository.save(p);
                }
            }
        }

        participant.setPosition(newPosition);
        return participantRepository.save(participant);
    }

    @Transactional
    public EventParticipantEntity toggleConfirmation(
            UUID eventId,
            Integer userId,
            UserEntity currentUser) {

        verifyOrganizer(eventId, currentUser);

        EventParticipantEntity participant = participantRepository
            .findByEventIdAndUserId(eventId, userId)
            .orElseThrow(() -> new NotParticipantException("User is not a participant"));

        participant.setIsConfirmed(!participant.getIsConfirmed());
        return participantRepository.save(participant);
    }

    @Transactional
    public EventParticipantEntity updatePayment(
            UUID eventId,
            Integer userId,
            UpdatePaymentRequest request,
            UserEntity currentUser) {

        verifyOrganizer(eventId, currentUser);

        EventParticipantEntity participant = participantRepository
            .findByEventIdAndUserId(eventId, userId)
            .orElseThrow(() -> new NotParticipantException("User is not a participant"));

        if (request.getIsPaid() != null) {
            participant.setIsPaid(request.getIsPaid());
            if (request.getIsPaid()) {
                participant.setPaymentTime(LocalDateTime.now());
            } else {
                participant.setPaymentTime(null);
            }
        }

        if (request.getPaymentMethod() != null) {
            participant.setPaymentMethod(request.getPaymentMethod());
        }

        return participantRepository.save(participant);
    }

    @Transactional
    public EventParticipantEntity promoteToMainList(
            UUID eventId,
            Integer userId,
            UserEntity currentUser) {

        verifyOrganizer(eventId, currentUser);

        EventParticipantEntity participant = participantRepository
            .findByEventIdAndUserId(eventId, userId)
            .orElseThrow(() -> new NotParticipantException("User is not a participant"));

        if (participant.getStatus() == ParticipantStatus.MAIN_LIST) {
            throw new IllegalStateException("Participant is already on main list");
        }

        EventEntity event = participant.getEvent();

        // Check if slots available
        if (event.getSlotsAvailable() <= 0) {
            throw new IllegalStateException("No available slots for promotion");
        }

        // Change status
        participant.setStatus(ParticipantStatus.MAIN_LIST);

        // Assign new position at end of main list
        Integer newPosition = participantRepository
            .getMaxPosition(eventId, ParticipantStatus.MAIN_LIST) + 1;
        participant.setPosition(newPosition);

        // Decrease available slots
        event.setSlotsAvailable(event.getSlotsAvailable() - 1);
        eventRepository.save(event);

        // Renumber waitlist
        List<EventParticipantEntity> waitlist = participantRepository.findWaitlistByEventId(eventId);
        for (int i = 0; i < waitlist.size(); i++) {
            if (!waitlist.get(i).getId().equals(participant.getId())) {
                waitlist.get(i).setPosition(i + 1);
                participantRepository.save(waitlist.get(i));
            }
        }

        return participantRepository.save(participant);
    }

    @Transactional
    public EventParticipantEntity demoteToWaitlist(
            UUID eventId,
            Integer userId,
            UserEntity currentUser) {

        verifyOrganizer(eventId, currentUser);

        EventParticipantEntity participant = participantRepository
            .findByEventIdAndUserId(eventId, userId)
            .orElseThrow(() -> new NotParticipantException("User is not a participant"));

        if (participant.getStatus() == ParticipantStatus.WAITLIST) {
            throw new IllegalStateException("Participant is already on waitlist");
        }

        EventEntity event = participant.getEvent();

        // Change status
        participant.setStatus(ParticipantStatus.WAITLIST);

        // Assign new position at end of waitlist
        Integer newPosition = participantRepository
            .getMaxPosition(eventId, ParticipantStatus.WAITLIST) + 1;
        participant.setPosition(newPosition);

        // Increase available slots
        event.setSlotsAvailable(event.getSlotsAvailable() + 1);
        eventRepository.save(event);

        // Renumber main list
        List<EventParticipantEntity> mainList = participantRepository.findMainListByEventId(eventId);
        for (int i = 0; i < mainList.size(); i++) {
            if (!mainList.get(i).getId().equals(participant.getId())) {
                mainList.get(i).setPosition(i + 1);
                participantRepository.save(mainList.get(i));
            }
        }

        return participantRepository.save(participant);
    }

    @Transactional
    public void removeParticipant(
            UUID eventId,
            Integer userId,
            UserEntity currentUser) {

        verifyOrganizer(eventId, currentUser);

        EventParticipantEntity participant = participantRepository
            .findByEventIdAndUserId(eventId, userId)
            .orElseThrow(() -> new NotParticipantException("User is not a participant"));

        ParticipantStatus status = participant.getStatus();
        EventEntity event = participant.getEvent();

        // Delete participant
        participantRepository.delete(participant);

        // If was on main list, increase slots
        if (status == ParticipantStatus.MAIN_LIST) {
            if (event.getAutoPromoteFromWaitlist()) {
                promoteFirstFromWaitlist(eventId);
            } else {
                event.setSlotsAvailable(event.getSlotsAvailable() + 1);
                eventRepository.save(event);
            }
        }

        // Renumber remaining participants
        renumberParticipants(eventId);
    }

    @Transactional
    public EventParticipantEntity addParticipant(
            UUID eventId,
            AddParticipantRequest request,
            UserEntity currentUser) {

        verifyOrganizer(eventId, currentUser);

        // Fetch event
        EventEntity event = eventRepository.findById(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        // Check if user already joined
        if (participantRepository.findByEventIdAndUserId(eventId, request.getUserId()).isPresent()) {
            throw new AlreadyJoinedException("User is already a participant");
        }

        // Fetch user to add
        UserEntity userToAdd = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Determine status and position
        ParticipantStatus status;
        Integer position;

        if (event.getSlotsAvailable() > 0) {
            status = ParticipantStatus.MAIN_LIST;
            position = participantRepository.getMaxPosition(eventId, ParticipantStatus.MAIN_LIST) + 1;
            event.setSlotsAvailable(event.getSlotsAvailable() - 1);
            eventRepository.save(event);
        } else {
            status = ParticipantStatus.WAITLIST;
            position = participantRepository.getMaxPosition(eventId, ParticipantStatus.WAITLIST) + 1;
        }

        // Create participant
        EventParticipantEntity participant = EventParticipantEntity.builder()
            .event(event)
            .user(userToAdd)
            .position(position)
            .status(status)
            .isConfirmed(false)
            .isPaid(false)
            .joinedAt(LocalDateTime.now())
            .notes(request.getNotes())
            .build();

        return participantRepository.save(participant);
    }

    // Add UserRepository dependency
    private final UserRepository userRepository;
```

**Note**: Add `UserRepository userRepository` to the constructor parameters.

---

### Step 3: Create ParticipantManagement Controller

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/participant/ParticipantManagementController.java`

```java
package pl.flutterowo.meetappbe.event.participant;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.flutterowo.meetappbe.user.UserEntity;

import java.util.UUID;

@RestController
@RequestMapping("/events/{eventId}/manage/participants")
@RequiredArgsConstructor
public class ParticipantManagementController {

    private final EventParticipantService participantService;

    @PutMapping("/{userId}/position")
    public ResponseEntity<ParticipantDTO> changePosition(
            @PathVariable UUID eventId,
            @PathVariable Integer userId,
            @Valid @RequestBody ChangePositionRequest request,
            Authentication authentication
    ) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        EventParticipantEntity participant = participantService.changePosition(
            eventId, userId, request.getNewPosition(), currentUser
        );
        return ResponseEntity.ok(ParticipantDTO.fromEntity(participant));
    }

    @PutMapping("/{userId}/confirm")
    public ResponseEntity<ParticipantDTO> toggleConfirmation(
            @PathVariable UUID eventId,
            @PathVariable Integer userId,
            Authentication authentication
    ) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        EventParticipantEntity participant = participantService.toggleConfirmation(
            eventId, userId, currentUser
        );
        return ResponseEntity.ok(ParticipantDTO.fromEntity(participant));
    }

    @PutMapping("/{userId}/payment")
    public ResponseEntity<ParticipantDTO> updatePayment(
            @PathVariable UUID eventId,
            @PathVariable Integer userId,
            @Valid @RequestBody UpdatePaymentRequest request,
            Authentication authentication
    ) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        EventParticipantEntity participant = participantService.updatePayment(
            eventId, userId, request, currentUser
        );
        return ResponseEntity.ok(ParticipantDTO.fromEntity(participant));
    }

    @PostMapping("/{userId}/promote")
    public ResponseEntity<ParticipantDTO> promoteToMainList(
            @PathVariable UUID eventId,
            @PathVariable Integer userId,
            Authentication authentication
    ) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        EventParticipantEntity participant = participantService.promoteToMainList(
            eventId, userId, currentUser
        );
        return ResponseEntity.ok(ParticipantDTO.fromEntity(participant));
    }

    @PostMapping("/{userId}/demote")
    public ResponseEntity<ParticipantDTO> demoteToWaitlist(
            @PathVariable UUID eventId,
            @PathVariable Integer userId,
            Authentication authentication
    ) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        EventParticipantEntity participant = participantService.demoteToWaitlist(
            eventId, userId, currentUser
        );
        return ResponseEntity.ok(ParticipantDTO.fromEntity(participant));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeParticipant(
            @PathVariable UUID eventId,
            @PathVariable Integer userId,
            Authentication authentication
    ) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        participantService.removeParticipant(eventId, userId, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<ParticipantDTO> addParticipant(
            @PathVariable UUID eventId,
            @Valid @RequestBody AddParticipantRequest request,
            Authentication authentication
    ) {
        UserEntity currentUser = (UserEntity) authentication.getPrincipal();
        EventParticipantEntity participant = participantService.addParticipant(
            eventId, request, currentUser
        );
        return ResponseEntity.ok(ParticipantDTO.fromEntity(participant));
    }
}
```

---

## Frontend Implementation

### Step 1: Create Participant Management Service

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/features/event/participant_management_service.dart`

```dart
import 'package:app/core/api/event/participant_http_client.dart';
import 'package:app/core/api/http/http_status_codes.dart';
import 'package:app/features/event/participant_entity.dart';
import 'package:app/features/event/payment_method.dart';

class ParticipantManagementService {
  final ParticipantHttpClient _httpClient;

  ParticipantManagementService(this._httpClient);

  Future<ParticipantEntity?> changePosition(
    String eventId,
    int userId,
    int newPosition,
  ) async {
    try {
      final response = await _httpClient.changePosition(eventId, userId, newPosition);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.participant;
      }
      return null;
    } catch (e) {
      print('Error changing position: $e');
      rethrow;
    }
  }

  Future<ParticipantEntity?> toggleConfirmation(
    String eventId,
    int userId,
  ) async {
    try {
      final response = await _httpClient.toggleConfirmation(eventId, userId);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.participant;
      }
      return null;
    } catch (e) {
      print('Error toggling confirmation: $e');
      rethrow;
    }
  }

  Future<ParticipantEntity?> updatePayment(
    String eventId,
    int userId, {
    bool? isPaid,
    PaymentMethod? paymentMethod,
  }) async {
    try {
      final response = await _httpClient.updatePayment(
        eventId,
        userId,
        isPaid: isPaid,
        paymentMethod: paymentMethod,
      );
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.participant;
      }
      return null;
    } catch (e) {
      print('Error updating payment: $e');
      rethrow;
    }
  }

  Future<ParticipantEntity?> promoteToMainList(
    String eventId,
    int userId,
  ) async {
    try {
      final response = await _httpClient.promoteToMainList(eventId, userId);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.participant;
      }
      return null;
    } catch (e) {
      print('Error promoting participant: $e');
      rethrow;
    }
  }

  Future<ParticipantEntity?> demoteToWaitlist(
    String eventId,
    int userId,
  ) async {
    try {
      final response = await _httpClient.demoteToWaitlist(eventId, userId);
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.participant;
      }
      return null;
    } catch (e) {
      print('Error demoting participant: $e');
      rethrow;
    }
  }

  Future<bool> removeParticipant(
    String eventId,
    int userId,
  ) async {
    try {
      final response = await _httpClient.removeParticipant(eventId, userId);
      return response.statusCode == HttpStatusCodes.noContent;
    } catch (e) {
      print('Error removing participant: $e');
      rethrow;
    }
  }

  Future<ParticipantEntity?> addParticipant(
    String eventId,
    int userId, {
    String? notes,
  }) async {
    try {
      final response = await _httpClient.addParticipant(
        eventId,
        userId,
        notes: notes,
      );
      if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
        return response.data.participant;
      }
      return null;
    } catch (e) {
      print('Error adding participant: $e');
      rethrow;
    }
  }
}
```

---

### Step 2: Extend Participant HTTP Client

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/core/api/event/participant_http_client.dart`

**Add these methods** to existing class:

```dart
  Future<HttpResponse> changePosition(
    String eventId,
    int userId,
    int newPosition,
  ) async {
    return await httpClient.put<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/manage/participants/$userId/position',
      body: {'newPosition': newPosition},
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }

  Future<HttpResponse> toggleConfirmation(
    String eventId,
    int userId,
  ) async {
    return await httpClient.put<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/manage/participants/$userId/confirm',
      body: {},
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }

  Future<HttpResponse> updatePayment(
    String eventId,
    int userId, {
    bool? isPaid,
    PaymentMethod? paymentMethod,
  }) async {
    Map<String, dynamic> body = {};
    if (isPaid != null) body['isPaid'] = isPaid;
    if (paymentMethod != null) body['paymentMethod'] = paymentMethod.name;

    return await httpClient.put<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/manage/participants/$userId/payment',
      body: body,
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }

  Future<HttpResponse> promoteToMainList(String eventId, int userId) async {
    return await httpClient.post<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/manage/participants/$userId/promote',
      body: {},
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }

  Future<HttpResponse> demoteToWaitlist(String eventId, int userId) async {
    return await httpClient.post<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/manage/participants/$userId/demote',
      body: {},
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }

  Future<HttpResponse> removeParticipant(String eventId, int userId) async {
    return await httpClient.delete(
      path: '/api/v1/events/$eventId/manage/participants/$userId',
      requiresAuth: true,
    );
  }

  Future<HttpResponse> addParticipant(
    String eventId,
    int userId, {
    String? notes,
  }) async {
    Map<String, dynamic> body = {'userId': userId};
    if (notes != null) body['notes'] = notes;

    return await httpClient.post<ParticipantHttpResponse>(
      path: '/api/v1/events/$eventId/manage/participants',
      body: body,
      fromJson: (json) => ParticipantHttpResponse.fromJson(json),
      requiresAuth: true,
    );
  }
```

---

### Step 3: Create Management Screen

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/widgets/event/manage_screen.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app/features/event/event_entity.dart';
import 'package:app/features/event/participant_service.dart';
import 'package:app/features/event/participant_management_service.dart';
import 'package:app/features/event/participant_entity.dart';
import 'package:app/widgets/event/participant_manage_item.dart';
import 'package:app/widgets/custom/snack_bar.dart';

class ParticipantManageScreen extends StatefulWidget {
  final EventEntity event;

  const ParticipantManageScreen({
    required this.event,
    super.key,
  });

  @override
  State<ParticipantManageScreen> createState() => _ParticipantManageScreenState();
}

class _ParticipantManageScreenState extends State<ParticipantManageScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<ParticipantEntity> _mainList = [];
  List<ParticipantEntity> _waitlist = [];
  bool _isLoading = true;

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
    setState(() => _isLoading = true);

    try {
      final service = context.read<ParticipantService>();
      final mainList = await service.getMainList(widget.event.id);
      final waitlist = await service.getWaitlist(widget.event.id);

      setState(() {
        _mainList = mainList;
        _waitlist = waitlist;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      CustomSnackBar.show(context, 'Error loading participants', isError: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Manage Participants'),
            Text(
              widget.event.title,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.normal),
            ),
          ],
        ),
        bottom: TabBar(
          controller: _tabController,
          tabs: [
            Tab(text: 'Main List (${_mainList.length}/${widget.event.slots})'),
            Tab(text: 'Waitlist (${_waitlist.length})'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildReorderableList(_mainList, isMainList: true),
                _buildReorderableList(_waitlist, isMainList: false),
              ],
            ),
    );
  }

  Widget _buildReorderableList(
    List<ParticipantEntity> participants, {
    required bool isMainList,
  }) {
    if (participants.isEmpty) {
      return Center(
        child: Text(isMainList ? 'No participants' : 'No waitlist'),
      );
    }

    return ReorderableListView.builder(
      itemCount: participants.length,
      onReorder: (oldIndex, newIndex) => _handleReorder(
        participants,
        oldIndex,
        newIndex,
        isMainList,
      ),
      itemBuilder: (context, index) {
        final participant = participants[index];
        return ParticipantManageItem(
          key: ValueKey(participant.id),
          participant: participant,
          eventId: widget.event.id,
          onUpdate: _loadParticipants,
        );
      },
    );
  }

  Future<void> _handleReorder(
    List<ParticipantEntity> list,
    int oldIndex,
    int newIndex,
    bool isMainList,
  ) async {
    if (oldIndex == newIndex) return;

    // Adjust newIndex if moving down
    if (newIndex > oldIndex) {
      newIndex -= 1;
    }

    final participant = list[oldIndex];
    final managementService = context.read<ParticipantManagementService>();

    try {
      await managementService.changePosition(
        widget.event.id,
        participant.user.id,
        newIndex + 1, // Position is 1-indexed
      );

      // Reload to get correct order from server
      await _loadParticipants();

      CustomSnackBar.show(context, 'Position updated');
    } catch (e) {
      CustomSnackBar.show(context, 'Error updating position', isError: true);
    }
  }
}
```

---

### Step 4: Create Participant Manage Item Widget

**File**: `/home/dolti/dev/workspace/git/meet-app-fe/app/lib/widgets/event/participant_manage_item.dart`

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:app/features/event/participant_entity.dart';
import 'package:app/features/event/participant_management_service.dart';
import 'package:app/features/event/payment_method.dart';
import 'package:app/widgets/custom/snack_bar.dart';

class ParticipantManageItem extends StatelessWidget {
  final ParticipantEntity participant;
  final String eventId;
  final VoidCallback onUpdate;

  const ParticipantManageItem({
    required this.participant,
    required this.eventId,
    required this.onUpdate,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final managementService = context.read<ParticipantManagementService>();

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: ExpansionTile(
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
        title: Text(participant.user.displayName),
        subtitle: Text(participant.user.login),
        trailing: Icon(Icons.drag_handle),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Confirmation toggle
                SwitchListTile(
                  title: const Text('Confirmed'),
                  value: participant.isConfirmed,
                  onChanged: (_) => _toggleConfirmation(
                    context,
                    managementService,
                  ),
                ),

                // Payment toggle
                SwitchListTile(
                  title: const Text('Paid'),
                  value: participant.isPaid,
                  onChanged: (_) => _togglePayment(
                    context,
                    managementService,
                  ),
                ),

                // Payment method dropdown
                if (participant.isPaid)
                  DropdownButtonFormField<PaymentMethod>(
                    decoration: const InputDecoration(
                      labelText: 'Payment Method',
                    ),
                    value: participant.paymentMethod,
                    items: PaymentMethod.values
                        .map((method) => DropdownMenuItem(
                              value: method,
                              child: Text('${method.icon} ${method.displayName}'),
                            ))
                        .toList(),
                    onChanged: (method) => _updatePaymentMethod(
                      context,
                      managementService,
                      method,
                    ),
                  ),

                const SizedBox(height: 16),

                // Action buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    // Promote/Demote
                    if (participant.status == ParticipantStatus.waitlist)
                      ElevatedButton.icon(
                        onPressed: () => _promote(context, managementService),
                        icon: const Icon(Icons.arrow_upward, size: 16),
                        label: const Text('Promote'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                        ),
                      )
                    else
                      ElevatedButton.icon(
                        onPressed: () => _demote(context, managementService),
                        icon: const Icon(Icons.arrow_downward, size: 16),
                        label: const Text('Demote'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.orange,
                        ),
                      ),

                    // Remove
                    ElevatedButton.icon(
                      onPressed: () => _showRemoveDialog(
                        context,
                        managementService,
                      ),
                      icon: const Icon(Icons.delete, size: 16),
                      label: const Text('Remove'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _toggleConfirmation(
    BuildContext context,
    ParticipantManagementService service,
  ) async {
    try {
      await service.toggleConfirmation(eventId, participant.user.id);
      onUpdate();
      CustomSnackBar.show(context, 'Confirmation updated');
    } catch (e) {
      CustomSnackBar.show(context, 'Error updating confirmation', isError: true);
    }
  }

  Future<void> _togglePayment(
    BuildContext context,
    ParticipantManagementService service,
  ) async {
    try {
      await service.updatePayment(
        eventId,
        participant.user.id,
        isPaid: !participant.isPaid,
      );
      onUpdate();
      CustomSnackBar.show(context, 'Payment status updated');
    } catch (e) {
      CustomSnackBar.show(context, 'Error updating payment', isError: true);
    }
  }

  Future<void> _updatePaymentMethod(
    BuildContext context,
    ParticipantManagementService service,
    PaymentMethod? method,
  ) async {
    if (method == null) return;

    try {
      await service.updatePayment(
        eventId,
        participant.user.id,
        paymentMethod: method,
      );
      onUpdate();
      CustomSnackBar.show(context, 'Payment method updated');
    } catch (e) {
      CustomSnackBar.show(context, 'Error updating payment method', isError: true);
    }
  }

  Future<void> _promote(
    BuildContext context,
    ParticipantManagementService service,
  ) async {
    try {
      await service.promoteToMainList(eventId, participant.user.id);
      onUpdate();
      CustomSnackBar.show(context, 'Participant promoted');
    } catch (e) {
      CustomSnackBar.show(
        context,
        e.toString().contains('No available slots')
            ? 'No available slots'
            : 'Error promoting participant',
        isError: true,
      );
    }
  }

  Future<void> _demote(
    BuildContext context,
    ParticipantManagementService service,
  ) async {
    try {
      await service.demoteToWaitlist(eventId, participant.user.id);
      onUpdate();
      CustomSnackBar.show(context, 'Participant demoted');
    } catch (e) {
      CustomSnackBar.show(context, 'Error demoting participant', isError: true);
    }
  }

  void _showRemoveDialog(
    BuildContext context,
    ParticipantManagementService service,
  ) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Remove Participant'),
        content: Text(
          'Are you sure you want to remove ${participant.user.displayName}?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await service.removeParticipant(eventId, participant.user.id);
                onUpdate();
                CustomSnackBar.show(context, 'Participant removed');
              } catch (e) {
                CustomSnackBar.show(
                  context,
                  'Error removing participant',
                  isError: true,
                );
              }
            },
            child: const Text('Remove', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }
}
```

---

## Testing Checklist

- [ ] Test change position (reorder participants)
- [ ] Test toggle confirmation
- [ ] Test toggle payment
- [ ] Test update payment method
- [ ] Test promote from waitlist (with slots available)
- [ ] Test promote from waitlist (no slots - should fail)
- [ ] Test demote to waitlist
- [ ] Test remove participant
- [ ] Test add participant manually
- [ ] Test authorization (non-organizer should get 403)
- [ ] Test drag-and-drop reordering in UI
- [ ] Verify position renumbering works correctly
- [ ] Test slot availability updates

## Acceptance Criteria

1. ✅ Organizers can reorder participants via drag-and-drop
2. ✅ Confirmation toggles working
3. ✅ Payment tracking functional
4. ✅ Promote/demote operations working
5. ✅ Manual add/remove working
6. ✅ Authorization checks preventing non-organizers
7. ✅ Position management correct
8. ✅ Slot availability updates correctly
9. ✅ UI responsive and intuitive
10. ✅ Error handling comprehensive
