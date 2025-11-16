# Feature 3.5: Volleyball Groups

## Standardized Spec

- Milestone: M2 (Post‑MVP)
- Goal: Grupy siatkarskie i filtracja wydarzeń po grupie.
- In Scope: encje Group/UserGroup, CRUD/Join/Leave, link Event→Group, filtrowanie po grupie.
- Out of Scope: integracje zewnętrzne (np. Facebook API) – placeholder.
- Prerequisites: Feature 1; User management.
- Acceptance Criteria: użytkownik dołącza/opuszcza grupy; eventy można przypisać i filtrować po grupie.
- Backend API: GET `/groups`, POST `/groups/{id}/join`, DELETE `/groups/{id}/leave`.
- Frontend UX: listy/detale grup; selector grupy w EventsListScreen.
- Tests: unikalność membership, uprawnienia; FE flows.

## Overview
Implement group management system allowing users to join Facebook volleyball groups, view group details, filter events by group, and organize events within specific communities.

**Priority**: LOW
**Milestone**: M2 (Post-MVP)
**Implementation Status**: See TODO.md for current progress

## Business Value
- Connects events to Facebook volleyball communities
- Enables community-specific event filtering
- Increases user engagement through group membership
- Allows targeted event creation for specific groups

## Prerequisites
- ✅ Feature 1: Basic Event Operations
- ✅ User authentication system

---

## Database Schema

```sql
-- Groups table
CREATE TABLE IF NOT EXISTS _group (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    facebook_url VARCHAR(255),
    members_count INTEGER NOT NULL DEFAULT 0,
    events_count INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uq_group_name UNIQUE (name)
);

-- User-Group membership table
CREATE TABLE IF NOT EXISTS user_group (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    group_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_group_user FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_group_group FOREIGN KEY (group_id) REFERENCES _group(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_group UNIQUE (user_id, group_id)
);

-- Add group_id to event table
ALTER TABLE event ADD COLUMN IF NOT EXISTS group_id BIGINT;
ALTER TABLE event ADD CONSTRAINT fk_event_group
    FOREIGN KEY (group_id) REFERENCES _group(id) ON DELETE SET NULL;

CREATE INDEX idx_event_group ON event(group_id);
CREATE INDEX idx_user_group_user ON user_group(user_id);
CREATE INDEX idx_user_group_group ON user_group(group_id);
```

---

## Backend Implementation

### Step 1: Create GroupRole Enum

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/group/GroupRole.java`

```java
package pl.flutterowo.meetappbe.group;

public enum GroupRole {
    MEMBER("Member"),
    ADMIN("Admin");

    private final String displayName;

    GroupRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
```

### Step 2: Create Group Entity

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/group/GroupEntity.java`

```java
package pl.flutterowo.meetappbe.group;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "_group")
public class GroupEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "facebook_url")
    private String facebookUrl;

    @Column(name = "members_count", nullable = false)
    @Builder.Default
    private Integer membersCount = 0;

    @Column(name = "events_count", nullable = false)
    @Builder.Default
    private Integer eventsCount = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### Step 3: Create UserGroup Entity

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/group/UserGroupEntity.java`

```java
package pl.flutterowo.meetappbe.group;

import jakarta.persistence.*;
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
@Entity
@Table(
    name = "user_group",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "group_id"})
)
public class UserGroupEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private GroupEntity group;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private GroupRole role = GroupRole.MEMBER;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }
}
```

### Step 4: Create Repositories

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/group/GroupRepository.java`

```java
package pl.flutterowo.meetappbe.group;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends CrudRepository<GroupEntity, Long> {

    List<GroupEntity> findByIsActiveTrue();

    Optional<GroupEntity> findByName(String name);

    @Query("SELECT g FROM GroupEntity g WHERE g.isActive = true ORDER BY g.membersCount DESC")
    List<GroupEntity> findAllActiveOrderByMembersDesc();

    @Query("SELECT g FROM GroupEntity g " +
           "JOIN UserGroupEntity ug ON ug.group.id = g.id " +
           "WHERE ug.user.id = :userId " +
           "ORDER BY g.name ASC")
    List<GroupEntity> findGroupsByUserId(@Param("userId") Integer userId);
}
```

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/group/UserGroupRepository.java`

```java
package pl.flutterowo.meetappbe.group;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserGroupRepository extends CrudRepository<UserGroupEntity, Long> {

    Optional<UserGroupEntity> findByUserIdAndGroupId(Integer userId, Long groupId);

    List<UserGroupEntity> findByGroupId(Long groupId);

    List<UserGroupEntity> findByUserId(Integer userId);

    @Query("SELECT COUNT(ug) FROM UserGroupEntity ug WHERE ug.group.id = :groupId")
    Integer countMembersByGroupId(@Param("groupId") Long groupId);

    void deleteByUserIdAndGroupId(Integer userId, Long groupId);
}
```

### Step 5: Create DTOs

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/group/GroupDTO.java`

```java
package pl.flutterowo.meetappbe.group;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupDTO {
    private Long id;
    private String name;
    private String description;
    private String facebookUrl;
    private Integer membersCount;
    private Integer eventsCount;
    private String imageUrl;
    private Boolean isActive;
    private Boolean isMember; // For current user
    private LocalDateTime createdAt;

    public static GroupDTO fromEntity(GroupEntity entity, Boolean isMember) {
        return GroupDTO.builder()
            .id(entity.getId())
            .name(entity.getName())
            .description(entity.getDescription())
            .facebookUrl(entity.getFacebookUrl())
            .membersCount(entity.getMembersCount())
            .eventsCount(entity.getEventsCount())
            .imageUrl(entity.getImageUrl())
            .isActive(entity.getIsActive())
            .isMember(isMember)
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
```

### Step 6: Create Group Service

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/group/GroupService.java`

```java
package pl.flutterowo.meetappbe.group;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pl.flutterowo.meetappbe.common.exception.AlreadyJoinedException;
import pl.flutterowo.meetappbe.common.exception.NotParticipantException;
import pl.flutterowo.meetappbe.common.exception.ResourceNotFoundException;
import pl.flutterowo.meetappbe.user.UserEntity;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final UserGroupRepository userGroupRepository;

    @Transactional(readOnly = true)
    public List<GroupDTO> getAllGroups(Integer currentUserId) {
        List<GroupEntity> groups = groupRepository.findAllActiveOrderByMembersDesc();

        return groups.stream()
            .map(group -> {
                boolean isMember = currentUserId != null &&
                    userGroupRepository.findByUserIdAndGroupId(currentUserId, group.getId()).isPresent();
                return GroupDTO.fromEntity(group, isMember);
            })
            .toList();
    }

    @Transactional(readOnly = true)
    public GroupDTO getGroupById(Long id, Integer currentUserId) {
        GroupEntity group = groupRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        boolean isMember = currentUserId != null &&
            userGroupRepository.findByUserIdAndGroupId(currentUserId, id).isPresent();

        return GroupDTO.fromEntity(group, isMember);
    }

    @Transactional(readOnly = true)
    public List<GroupDTO> getUserGroups(Integer userId) {
        List<GroupEntity> groups = groupRepository.findGroupsByUserId(userId);

        return groups.stream()
            .map(group -> GroupDTO.fromEntity(group, true))
            .toList();
    }

    @Transactional
    public UserGroupEntity joinGroup(Long groupId, UserEntity user) {
        GroupEntity group = groupRepository.findById(groupId)
            .orElseThrow(() -> new ResourceNotFoundException("Group not found"));

        // Check if already member
        if (userGroupRepository.findByUserIdAndGroupId(user.getId(), groupId).isPresent()) {
            throw new AlreadyJoinedException("Already a member of this group");
        }

        // Create membership
        UserGroupEntity membership = UserGroupEntity.builder()
            .user(user)
            .group(group)
            .role(GroupRole.MEMBER)
            .build();

        UserGroupEntity saved = userGroupRepository.save(membership);

        // Update member count
        group.setMembersCount(group.getMembersCount() + 1);
        groupRepository.save(group);

        return saved;
    }

    @Transactional
    public void leaveGroup(Long groupId, UserEntity user) {
        UserGroupEntity membership = userGroupRepository
            .findByUserIdAndGroupId(user.getId(), groupId)
            .orElseThrow(() -> new NotParticipantException("Not a member of this group"));

        userGroupRepository.delete(membership);

        // Update member count
        GroupEntity group = groupRepository.findById(groupId).orElseThrow();
        group.setMembersCount(Math.max(0, group.getMembersCount() - 1));
        groupRepository.save(group);
    }

    @Transactional(readOnly = true)
    public boolean isMember(Long groupId, Integer userId) {
        return userGroupRepository.findByUserIdAndGroupId(userId, groupId).isPresent();
    }
}
```

### Step 7: Create Group Controller

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/java/pl/flutterowo/meetappbe/group/GroupController.java`

```java
package pl.flutterowo.meetappbe.group;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import pl.flutterowo.meetappbe.user.UserEntity;

import java.util.List;

@RestController
@RequestMapping("/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @GetMapping
    public ResponseEntity<List<GroupDTO>> getAllGroups(Authentication authentication) {
        Integer userId = authentication != null
            ? ((UserEntity) authentication.getPrincipal()).getId()
            : null;

        List<GroupDTO> groups = groupService.getAllGroups(userId);
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> getGroupById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Integer userId = authentication != null
            ? ((UserEntity) authentication.getPrincipal()).getId()
            : null;

        GroupDTO group = groupService.getGroupById(id, userId);
        return ResponseEntity.ok(group);
    }

    @GetMapping("/my-groups")
    public ResponseEntity<List<GroupDTO>> getMyGroups(Authentication authentication) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        List<GroupDTO> groups = groupService.getUserGroups(user.getId());
        return ResponseEntity.ok(groups);
    }

    @PostMapping("/{id}/join")
    public ResponseEntity<Void> joinGroup(
            @PathVariable Long id,
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        groupService.joinGroup(id, user);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/{id}/leave")
    public ResponseEntity<Void> leaveGroup(
            @PathVariable Long id,
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        groupService.leaveGroup(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/is-member")
    public ResponseEntity<MembershipStatusResponse> checkMembership(
            @PathVariable Long id,
            Authentication authentication
    ) {
        UserEntity user = (UserEntity) authentication.getPrincipal();
        boolean isMember = groupService.isMember(id, user.getId());
        return ResponseEntity.ok(new MembershipStatusResponse(isMember));
    }

    @Data
    @AllArgsConstructor
    public static class MembershipStatusResponse {
        private boolean isMember;
    }
}
```

### Step 8: Create Database Migration

**File**: `/home/dolti/dev/workspace/git/meet-app-be/src/main/resources/db/migration/V1_4__Add_group_tables.sql`

```sql
-- Create _group table
CREATE TABLE IF NOT EXISTS _group (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    facebook_url VARCHAR(255),
    members_count INTEGER NOT NULL DEFAULT 0,
    events_count INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT uq_group_name UNIQUE (name)
);

-- Create user_group table
CREATE TABLE IF NOT EXISTS user_group (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    group_id BIGINT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_group_user FOREIGN KEY (user_id) REFERENCES _user(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_group_group FOREIGN KEY (group_id) REFERENCES _group(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_group UNIQUE (user_id, group_id)
);

-- Add group_id to event table
ALTER TABLE event ADD COLUMN IF NOT EXISTS group_id BIGINT;
ALTER TABLE event ADD CONSTRAINT fk_event_group
    FOREIGN KEY (group_id) REFERENCES _group(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX idx_event_group ON event(group_id);
CREATE INDEX idx_user_group_user ON user_group(user_id);
CREATE INDEX idx_user_group_group ON user_group(group_id);
CREATE INDEX idx_group_active ON _group(is_active);

-- Insert some default groups
INSERT INTO _group (name, description, facebook_url, is_active, created_at) VALUES
('Volleyball Poznań', 'Main volleyball group in Poznań', 'https://facebook.com/groups/volleyball-poznan', true, CURRENT_TIMESTAMP),
('Beach Volleyball Poznań', 'Beach volleyball enthusiasts', 'https://facebook.com/groups/beach-volleyball-poznan', true, CURRENT_TIMESTAMP),
('Competitive Volleyball', 'For experienced players only', 'https://facebook.com/groups/competitive-volleyball', true, CURRENT_TIMESTAMP);
```

---

## Frontend Implementation

### Frontend files and implementation follow similar patterns - Create entities, services, HTTP clients, screens, and widgets following the existing patterns in the codebase.

**Key Frontend Files to Create:**
1. `/app/lib/features/group/group_entity.dart`
2. `/app/lib/core/api/group/group_http_client.dart`
3. `/app/lib/features/group/group_service.dart`
4. `/app/lib/widgets/group/list_screen.dart`
5. `/app/lib/widgets/group/details_screen.dart`
6. `/app/lib/widgets/group/list_item.dart`

**Integration Points:**
- Add group filter to Event filter bottom sheet
- Link from Event Details to Group Details
- Show user's groups in profile/home screen
- Add group selection in Event Create screen

---

## API Endpoints

### GET /api/v1/groups
Get all active groups

**Response**: `200 OK`
```json
[
  {
    "id": 1,
    "name": "Volleyball Poznań",
    "description": "Main volleyball group",
    "facebookUrl": "https://facebook.com/groups/volleyball-poznan",
    "membersCount": 150,
    "eventsCount": 45,
    "imageUrl": null,
    "isActive": true,
    "isMember": true
  }
]
```

### GET /api/v1/groups/{id}
Get group details

### GET /api/v1/groups/my-groups
Get current user's groups (auth required)

### POST /api/v1/groups/{id}/join
Join a group (auth required)

### DELETE /api/v1/groups/{id}/leave
Leave a group (auth required)

### GET /api/v1/groups/{id}/is-member
Check membership status (auth required)

---

## Testing Checklist

- [ ] Database migration applied successfully
- [ ] Can create groups (via database for now)
- [ ] Can view all groups
- [ ] Can view group details
- [ ] Can join group (auth required)
- [ ] Cannot join same group twice
- [ ] Can leave group
- [ ] Member count updates correctly
- [ ] Can filter events by group
- [ ] Group selection in event creation works
- [ ] Frontend displays groups correctly
- [ ] Join/leave buttons work

## Acceptance Criteria

1. ✅ Database tables created with relationships
2. ✅ Users can view all groups
3. ✅ Users can join/leave groups
4. ✅ Member counts accurate
5. ✅ Events can be associated with groups
6. ✅ Event filtering by group works
7. ✅ Group details screen functional
8. ✅ UI displays group information
9. ✅ Facebook URL links working
10. ✅ Error handling comprehensive

---

## Notes for AI Agent

- Groups are initially created manually via database inserts
- Future enhancement: Admin interface for group creation
- Facebook integration is link-only (no OAuth integration yet)
- Member count is denormalized for performance
- Events can exist without a group (group_id is nullable)
- Follow existing code patterns strictly
