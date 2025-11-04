# Feature 5: User Profile & History

## Overview
Extended user profile with event history, rating system, profile editing, and event participation tracking.

**Estimated Time**: 45 hours | **Priority**: MEDIUM | **Status**: 30% → 100%

## Business Value
- Users can track their event history
- Rating system builds trust and reputation
- Profile customization improves engagement
- Organizers can view participant history

---

## Backend: Extended Endpoints

### UserController Extensions

```java
// GET /api/v1/users/me - Current user profile
public ResponseEntity<UserProfileDTO> getCurrentUser(Authentication auth)

// PUT /api/v1/users/me - Update own profile
public ResponseEntity<UserDTO> updateProfile(@RequestBody UpdateProfileRequest request, Authentication auth)

// GET /api/v1/users/me/events - Events joined (as participant)
public ResponseEntity<List<EventDTO>> getMyEvents(Authentication auth)

// GET /api/v1/users/me/organized - Events organized
public ResponseEntity<List<EventDTO>> getMyOrganizedEvents(Authentication auth)

// GET /api/v1/users/me/history - Past events (completed/cancelled)
public ResponseEntity<List<EventDTO>> getEventHistory(Authentication auth)

// POST /api/v1/users/{id}/thumb - Add rating (thumbsUp=true/false)
public ResponseEntity<Void> addThumb(@PathVariable Integer id, @RequestBody ThumbRequest request, Authentication auth)

// GET /api/v1/users/{id}/profile - View other user's profile
public ResponseEntity<UserProfileDTO> getUserProfile(@PathVariable Integer id)
```

### DTOs

**UpdateProfileRequest:**
```java
@Data
public class UpdateProfileRequest {
    private String nickName;
    private String email;
    private String avatar; // Base64 encoded image
    private String facebookProfileUri;
}
```

**UserProfileDTO:**
```java
@Data
public class UserProfileDTO {
    private Integer id;
    private String login;
    private String nickName;
    private String email;
    private String avatar;
    private String facebookProfileUri;
    private Integer thumbsUp;
    private Integer thumbsDown;
    private Integer totalEventsOrganized;
    private Integer totalEventsParticipated;
    private LocalDateTime createdAt;
}
```

**ThumbRequest:**
```java
@Data
public class ThumbRequest {
    @NotNull
    private Boolean thumbsUp; // true = thumbs up, false = thumbs down
}
```

---

## Backend: Service Logic

**UserService Extensions:**

```java
public UserProfileDTO getCurrentUserProfile(UserEntity user) {
    int totalOrganized = eventRepository.countByUserId(user.getId());
    int totalParticipated = participantRepository.countByUserId(user.getId());
    
    return UserProfileDTO.builder()
        .id(user.getId())
        .login(user.getLogin())
        .nickName(user.getNickName())
        .email(user.getEmail())
        .avatar(user.getAvatar())
        .thumbsUp(user.getThumbsUp())
        .thumbsDown(user.getThumbsDown())
        .totalEventsOrganized(totalOrganized)
        .totalEventsParticipated(totalParticipated)
        .createdAt(user.getCreatedAt())
        .build();
}

public UserEntity updateProfile(UserEntity user, UpdateProfileRequest request) {
    if (request.getNickName() != null) {
        user.setNickName(request.getNickName());
    }
    if (request.getEmail() != null) {
        // Validate email uniqueness
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        user.setEmail(request.getEmail());
    }
    if (request.getAvatar() != null) {
        // Process base64 image, store as OID or file path
        user.setAvatar(processAvatar(request.getAvatar()));
    }
    if (request.getFacebookProfileUri() != null) {
        user.setFacebookProfileUri(request.getFacebookProfileUri());
    }
    
    user.setUpdatedAt(LocalDateTime.now());
    return userRepository.save(user);
}

public void addThumb(Integer targetUserId, UserEntity rater, boolean thumbsUp) {
    // Prevent self-rating
    if (targetUserId.equals(rater.getId())) {
        throw new IllegalArgumentException("Cannot rate yourself");
    }
    
    UserEntity targetUser = userRepository.findById(targetUserId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    
    // TODO: Check if user already rated (requires thumb tracking table)
    // For now, allow multiple ratings
    
    if (thumbsUp) {
        targetUser.setThumbsUp(targetUser.getThumbsUp() + 1);
    } else {
        targetUser.setThumbsDown(targetUser.getThumbsDown() + 1);
    }
    
    userRepository.save(targetUser);
}
```

---

## Frontend: Key Components

**Screens:**
- `UserProfileScreen` - Enhanced profile with tabs
- `EditProfileScreen` - Form to edit profile fields
- `MyEventsTab` - List of events user joined
- `OrganizedTab` - List of events user organized
- `HistoryTab` - Past events (completed/cancelled)
- `OtherUserProfileScreen` - View other user's public profile

**Widgets:**
- `ProfileHeader` - Avatar, name, stats, ratings
- `ThumbButtons` - Thumbs up/down with counts
- `ProfileStats` - Events organized/participated
- `AvatarPicker` - Image picker with crop
- `EventHistoryItem` - Past event card

**Profile Tabs:**
1. **Events Joined** - Active events user is participant
2. **Events Organized** - Active events user created
3. **History** - Past events (all)

---

## API Examples

### GET /api/v1/users/me
Response:
```json
{
  "id": 5,
  "login": "john_doe",
  "nickName": "John",
  "email": "john@example.com",
  "avatar": "data:image/png;base64,...",
  "facebookProfileUri": "https://facebook.com/johndoe",
  "thumbsUp": 42,
  "thumbsDown": 3,
  "totalEventsOrganized": 15,
  "totalEventsParticipated": 67,
  "createdAt": "2025-01-15T10:00:00"
}
```

### PUT /api/v1/users/me
Request:
```json
{
  "nickName": "Johnny",
  "email": "johnny@example.com",
  "avatar": "data:image/png;base64,iVBORw0KGgo..."
}
```

### POST /api/v1/users/5/thumb
Request:
```json
{
  "thumbsUp": true
}
```

---

## Implementation Steps

**Backend:**
1. Add UserProfileDTO and UpdateProfileRequest
2. Extend UserService with profile methods
3. Add endpoints to UserController
4. Implement avatar processing (base64 to storage)
5. Add queries for event counts
6. Implement thumb/rating logic
7. Add email uniqueness validation
8. Add authorization checks

**Frontend:**
1. Create UserProfileScreen with TabBar
2. Build EditProfileScreen with image picker
3. Create MyEventsTab with event list
4. Create OrganizedTab with event list
5. Create HistoryTab with past events
6. Add ThumbButtons widget
7. Implement avatar upload and crop
8. Add profile navigation from event details
9. Show organizer profile link in events

---

## Testing Checklist

- [ ] View current user profile
- [ ] Edit profile fields (name, email)
- [ ] Upload avatar image
- [ ] View events joined tab
- [ ] View events organized tab
- [ ] View history tab
- [ ] Give thumbs up to another user
- [ ] Give thumbs down to another user
- [ ] Prevent self-rating
- [ ] View another user's profile
- [ ] Verify email uniqueness validation
- [ ] Test avatar image processing
- [ ] Verify stats calculations

---

## Acceptance Criteria

1. ✅ Extended profile with stats and ratings
2. ✅ Profile editing functional
3. ✅ Avatar upload working
4. ✅ Events tabs showing correct data
5. ✅ History shows past events
6. ✅ Thumbs up/down system working
7. ✅ Cannot rate self
8. ✅ Email uniqueness enforced
9. ✅ Other users' profiles viewable
10. ✅ Profile accessible from events

---

## Future Enhancements

- Prevent duplicate ratings (thumb tracking table)
- More detailed statistics
- Achievement badges
- Profile visibility settings
- Block/report users
