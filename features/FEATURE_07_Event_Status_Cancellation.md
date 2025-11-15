# Feature 7: Event Status & Cancellation

## Standardized Spec

- Milestone: M2 (Post‑MVP)
- Goal: Pełniejsza obsługa statusów (ACTIVE/CANCELLED/COMPLETED) i opcjonalne notyfikacje.
- In Scope: Enum statusów; cancel/complete endpointy; (powiadomienia – integracja w M3 Email/Push).
- Out of Scope (M2): pełna automatyka i raporty.
- Prerequisites: Feature 1 (minimal CANCELLED), M3: kanały notyfikacji.
- Acceptance Criteria: statusy działają i są widoczne w UI; operacje autoryzowane.
- Backend API: PUT `/events/{id}/cancel`, PUT `/events/{id}/complete`.
- Frontend UX: przyciski cancel/complete; badge’y.
- Tests: status transitions, uprawnienia; UI odświeża statusy.

## Overview
Implement event status management (ACTIVE, CANCELLED, COMPLETED) with cancellation logic, automatic completion, and participant notifications.

**Priority**: MEDIUM | **Status**: 0% → 100%

## Business Value
- Clear event lifecycle management
- Participants notified of cancellations
- Automatic event completion reduces manual work
- Status filters help users find relevant events

---

## Backend Implementation

### Step 1: Ensure EventStatus Enum Exists

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/EventStatus.java`

Already created in Feature 1. Values: ACTIVE, CANCELLED, COMPLETED, DRAFT

### Step 2: Add Status Management to EventService

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/EventService.java`

**Add these methods:**

```java
@Transactional
public EventEntity cancelEvent(UUID eventId, UserEntity currentUser, String reason) {
    EventEntity event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    
    // Verify organizer
    if (!event.getUser().getId().equals(currentUser.getId())) {
        throw new UnauthorizedException("Only organizer can cancel event");
    }
    
    // Check if already cancelled/completed
    if (event.getStatus() == EventStatus.CANCELLED) {
        throw new IllegalStateException("Event is already cancelled");
    }
    if (event.getStatus() == EventStatus.COMPLETED) {
        throw new IllegalStateException("Cannot cancel completed event");
    }
    
    // Update status
    event.setStatus(EventStatus.CANCELLED);
    event.setUpdatedAt(LocalDateTime.now());
    
    EventEntity saved = eventRepository.save(event);
    
    // Send notifications to participants if enabled
    if (event.getSendNotifications()) {
        notifyParticipants(event, "Event Cancelled", 
            reason != null ? reason : "This event has been cancelled by the organizer");
    }
    
    return saved;
}

@Transactional
public EventEntity completeEvent(UUID eventId, UserEntity currentUser) {
    EventEntity event = eventRepository.findById(eventId)
        .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    
    // Verify organizer
    if (!event.getUser().getId().equals(currentUser.getId())) {
        throw new UnauthorizedException("Only organizer can complete event");
    }
    
    event.setStatus(EventStatus.COMPLETED);
    event.setUpdatedAt(LocalDateTime.now());
    
    return eventRepository.save(event);
}

// Scheduled job to auto-complete events
@Scheduled(cron = "0 0 * * * *") // Every hour
public void autoCompleteEvents() {
    LocalDateTime now = LocalDateTime.now();
    
    List<EventEntity> activeEvents = eventRepository
        .findByStatusAndEndDateTimeBefore(EventStatus.ACTIVE, now);
    
    for (EventEntity event : activeEvents) {
        event.setStatus(EventStatus.COMPLETED);
        eventRepository.save(event);
    }
}

private void notifyParticipants(EventEntity event, String title, String message) {
    // TODO: Implement notification service
    // Options:
    // 1. Email notifications
    // 2. Push notifications
    // 3. In-app notifications
    
    List<EventParticipantEntity> participants = 
        participantRepository.findByEventIdOrderByStatusAndPosition(event.getId());
    
    for (EventParticipantEntity participant : participants) {
        // Send notification to participant.getUser()
        System.out.println("Notify user " + participant.getUser().getLogin() + 
            ": " + title + " - " + message);
    }
}
```

### Step 3: Add Cancel Request DTO

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/CancelEventRequest.java`

```java
package pl.flutterowo.meetappbe.event;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CancelEventRequest {
    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
}
```

### Step 4: Add Controller Endpoints

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/event/EventController.java`

**Add these endpoints:**

```java
@PutMapping("/{id}/cancel")
public ResponseEntity<EventEntity> cancelEvent(
        @PathVariable UUID id,
        @RequestBody(required = false) CancelEventRequest request,
        Authentication authentication
) {
    UserEntity currentUser = (UserEntity) authentication.getPrincipal();
    String reason = request != null ? request.getReason() : null;
    EventEntity cancelled = eventService.cancelEvent(id, currentUser, reason);
    return ResponseEntity.ok(cancelled);
}

@PutMapping("/{id}/complete")
public ResponseEntity<EventEntity> completeEvent(
        @PathVariable UUID id,
        Authentication authentication
) {
    UserEntity currentUser = (UserEntity) authentication.getPrincipal();
    EventEntity completed = eventService.completeEvent(id, currentUser);
    return ResponseEntity.ok(completed);
}
```

### Step 5: Update EventRepository

**Add query method:**

```java
List<EventEntity> findByStatusAndEndDateTimeBefore(
    EventStatus status, 
    LocalDateTime endDateTime
);
```

### Step 6: Enable Scheduling

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/MeetAppBeApplication.java`

**Add annotation:**

```java
@SpringBootApplication
@EnableScheduling
public class MeetAppBeApplication {
    public static void main(String[] args) {
        SpringApplication.run(MeetAppBeApplication.class, args);
    }
}
```

---

## Frontend Implementation

### Step 1: Add Status Badge Widget

**File**: `/app/lib/widgets/event/status_badge.dart`

```dart
import 'package:flutter/material.dart';
import 'package:app/features/event/event_status.dart';

class EventStatusBadge extends StatelessWidget {
  final EventStatus status;
  final double? fontSize;

  const EventStatusBadge({
    required this.status,
    this.fontSize = 12,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: status.color,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.displayName,
        style: TextStyle(
          color: Colors.white,
          fontSize: fontSize,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
```

### Step 2: Add Cancel Dialog

**File**: `/app/lib/widgets/event/cancel_dialog.dart`

```dart
import 'package:flutter/material.dart';

class CancelEventDialog extends StatefulWidget {
  final Function(String?) onConfirm;

  const CancelEventDialog({required this.onConfirm, super.key});

  @override
  State<CancelEventDialog> createState() => _CancelEventDialogState();
}

class _CancelEventDialogState extends State<CancelEventDialog> {
  final _controller = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Cancel Event'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Are you sure you want to cancel this event? '
              'All participants will be notified.',
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _controller,
              decoration: const InputDecoration(
                labelText: 'Reason (optional)',
                hintText: 'Why are you cancelling this event?',
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              maxLength: 500,
              validator: (value) {
                if (value != null && value.length > 500) {
                  return 'Reason too long';
                }
                return null;
              },
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Keep Event'),
        ),
        TextButton(
          onPressed: () {
            if (_formKey.currentState!.validate()) {
              final reason = _controller.text.trim();
              widget.onConfirm(reason.isEmpty ? null : reason);
              Navigator.pop(context);
            }
          },
          child: const Text(
            'Cancel Event',
            style: TextStyle(color: Colors.red),
          ),
        ),
      ],
    );
  }
}
```

### Step 3: Update EventService

**Add methods to EventHttpClient:**

```dart
Future<HttpResponse> cancelEvent(String id, String? reason) async {
  Map<String, dynamic> body = {};
  if (reason != null) body['reason'] = reason;

  return await httpClient.put<EventHttpResponse>(
    path: '/api/v1/events/$id/cancel',
    body: body,
    fromJson: (json) => EventHttpResponse.fromJson(json),
    requiresAuth: true,
  );
}

Future<HttpResponse> completeEvent(String id) async {
  return await httpClient.put<EventHttpResponse>(
    path: '/api/v1/events/$id/complete',
    body: {},
    fromJson: (json) => EventHttpResponse.fromJson(json),
    requiresAuth: true,
  );
}
```

**Add to EventService:**

```dart
Future<EventEntity?> cancelEvent(String id, String? reason) async {
  try {
    final response = await _httpClient.cancelEvent(id, reason);
    if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
      return response.data.event;
    }
    return null;
  } catch (e) {
    print('Error cancelling event: $e');
    rethrow;
  }
}

Future<EventEntity?> completeEvent(String id) async {
  try {
    final response = await _httpClient.completeEvent(id);
    if (response.statusCode == HttpStatusCodes.ok && response.data != null) {
      return response.data.event;
    }
    return null;
  } catch (e) {
    print('Error completing event: $e');
    rethrow;
  }
}
```

### Step 4: Update Event Details Screen

**Add cancel button for organizers:**

```dart
// In EventDetailsWidget, add:
if (widget.event.organizer.id == currentUser?.id &&
    widget.event.status == EventStatus.active) ...[
  SizedBox(
    width: double.infinity,
    child: OutlinedButton.icon(
      onPressed: _showCancelDialog,
      icon: const Icon(Icons.cancel, color: Colors.red),
      label: const Text('Cancel Event', style: TextStyle(color: Colors.red)),
      style: OutlinedButton.styleFrom(
        side: const BorderSide(color: Colors.red),
      ),
    ),
  ),
],

void _showCancelDialog() {
  showDialog(
    context: context,
    builder: (context) => CancelEventDialog(
      onConfirm: (reason) async {
        final eventService = context.read<EventService>();
        try {
          await eventService.cancelEvent(widget.event.id, reason);
          CustomSnackBar.show(context, 'Event cancelled successfully');
          Navigator.pop(context); // Go back to list
        } catch (e) {
          CustomSnackBar.show(
            context,
            'Failed to cancel event: $e',
            isError: true,
          );
        }
      },
    ),
  );
}
```

### Step 5: Update Filter Bottom Sheet

**Add status filter:**

```dart
// In EventFilterBottomSheet, add:
SwitchListTile(
  title: const Text('Hide cancelled events'),
  value: _hideCancelled,
  onChanged: (value) {
    setState(() => _hideCancelled = value);
  },
),

SwitchListTile(
  title: const Text('Hide completed events'),
  value: _hideCompleted,
  onChanged: (value) {
    setState(() => _hideCompleted = value);
  },
),
```

---

## API Endpoints

### PUT /api/v1/events/{id}/cancel
Cancel an event

**Authentication**: Required (organizer only)

**Request**:
```json
{
  "reason": "Bad weather forecast"
}
```

**Response**: `200 OK` (updated event)

### PUT /api/v1/events/{id}/complete
Manually complete an event

**Authentication**: Required (organizer only)

**Response**: `200 OK` (updated event)

---

## Testing Checklist

- [ ] Cancel event as organizer (with reason)
- [ ] Cancel event as organizer (without reason)
- [ ] Cancel event as non-organizer (should fail 403)
- [ ] Cancel already cancelled event (should fail 409)
- [ ] Cancel completed event (should fail 409)
- [ ] Complete event as organizer
- [ ] Complete event as non-organizer (should fail 403)
- [ ] Auto-completion scheduled job runs
- [ ] Cancelled events hidden by default in list
- [ ] Status badges display correctly
- [ ] Cancel dialog shows and validates
- [ ] Participants notified of cancellation (check logs)
- [ ] Filter by status works

---

## Acceptance Criteria

1. ✅ Organizers can cancel events
2. ✅ Cancellation reason optional but recorded
3. ✅ Participants notified (logs/placeholder)
4. ✅ Cancelled events marked clearly
5. ✅ Auto-completion working (scheduled job)
6. ✅ Manual completion available
7. ✅ Status filters working
8. ✅ Authorization checks in place
9. ✅ Cannot cancel already cancelled/completed events
10. ✅ Status badges visible throughout UI

---

## Future Enhancements

- Email notifications for cancellations
- Push notifications (FCM/APNS)
- Reschedule option instead of cancel
- Partial refunds tracking
- Cancellation statistics
- Reason templates (common reasons)

---

## Notes for AI Agent

- Notification service is placeholder - log to console for now
- Consider adding event audit log (who cancelled, when)
- Test scheduled job with `@Scheduled(fixedDelay = 60000)` for testing
- Ensure cancelled events don't accept new participants
- Future: Add "reactivate" option for cancelled events
