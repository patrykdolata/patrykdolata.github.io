# Feature 6: UI Polish & Navigation

## Standardized Spec

- Milestone: M1 (MVP subset), reszta Post‑MVP
- Goal: Spójna nawigacja i podstawowy organizer UI (MyEvents).
- In Scope (M1): MyEvents (lista organizatora) z `organizerId=me`; bottom‑nav.
- Out of Scope (M1): skeletony/animacje/zaawansowane stany błędów.
- Prerequisites: Feature 1, endpoint `GET /api/v1/events?organizerId=me`.
- Acceptance Criteria: Widok MyEvents działa; nawigacja między Map/MyEvents/Profile.
- Frontend UX: `EventsListScreen` (organizator), `events_bottom_navigation`.
- Tests: smoke: wejście → poprawne dane; nawigacja działa.

## Milestone & Scope

- Milestone: M1 (MVP)
- Scope (M1):
  - MyEvents (lista wydarzeń organizatora)
  - Integracja: `GET /api/v1/events?organizerId=me`
  - Link w bottom‑navigation do MyEvents
- Out of scope (Post‑MVP):
  - Skeletony/animacje, micro‑interactions
  - Zaawansowane stany błędów (poza prostym retry)

## Acceptance Criteria (M1)

- Organizator ma widok „Moje wydarzenia” z własnymi eventami
- Nawigacja: szybki dostęp z bottom‑nav
- Lista działa z backendem (`organizerId=me`)

## Test Plan (smoke, M1)

- Wejście na MyEvents pokazuje tylko wydarzenia zalogowanego organizatora
- Navigacja działa: Map → MyEvents → Profile

## Overview
Comprehensive UI improvements including bottom navigation, loading skeletons, error states, animations, search, and offline mode.

**Priority**: HIGH | **Status**: 20% → 100%

## Business Value
- Professional, polished app appearance
- Better user experience with smooth animations
- Clear error handling reduces confusion
- Improved navigation increases engagement

---

## Components to Implement

### 1. Bottom Navigation Bar (5h)

**File**: `/app/lib/widgets/navigation/bottom_nav_bar.dart`

**Tabs:**
1. **Map** (Home) - Google Maps with events
2. **Events** - Event list view
3. **Profile** - User profile and settings

**Implementation:**
```dart
class MainScaffold extends StatefulWidget {
  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _currentIndex = 0;
  
  final List<Widget> _screens = [
    HomeMapScreen(),
    EventListScreen(),
    UserProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        items: [
          BottomNavigationBarItem(
            icon: Icon(Icons.map),
            label: 'Map',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.event),
            label: 'Events',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
```

### 2. Loading Skeletons (8h)

**File**: `/app/lib/widgets/loading/skeleton.dart`

**Use shimmer effect for:**
- Event list items
- Event details screen
- Participant lists
- User profile
- Map markers loading

**Package**: `shimmer: ^3.0.0`

**Example:**
```dart
class EventListSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: Colors.grey[300]!,
      highlightColor: Colors.grey[100]!,
      child: ListView.builder(
        itemCount: 5,
        itemBuilder: (context, index) {
          return Card(
            margin: EdgeInsets.all(8),
            child: Container(
              height: 100,
              color: Colors.white,
            ),
          );
        },
      ),
    );
  }
}
```

### 3. Error States with Retry (6h)

**File**: `/app/lib/widgets/error/error_state.dart`

**Universal error widget:**
```dart
class ErrorStateWidget extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final IconData? icon;

  const ErrorStateWidget({
    required this.message,
    this.onRetry,
    this.icon = Icons.error_outline,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 64, color: Colors.red[300]),
          SizedBox(height: 16),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 16),
          ),
          if (onRetry != null) ...[
            SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: onRetry,
              icon: Icon(Icons.refresh),
              label: Text('Retry'),
            ),
          ],
        ],
      ),
    );
  }
}
```

**Error types:**
- Network errors (wifi icon)
- Server errors (server icon)
- Not found (search off icon)
- Unauthorized (lock icon)

### 4. Animations (8h)

**Add to all screens:**
- **Hero animations** for event cards → details
- **Fade transitions** for page routes
- **Slide animations** for bottom sheets
- **Scale animations** for buttons
- **List item animations** with staggered entrance

**Hero animation example:**
```dart
// In event list item:
Hero(
  tag: 'event-${event.id}',
  child: EventCard(event: event),
)

// In event details:
Hero(
  tag: 'event-${event.id}',
  child: EventImage(event: event),
)
```

**Custom page transitions:**
```dart
Route createRoute(Widget page) {
  return PageRouteBuilder(
    pageBuilder: (context, animation, secondaryAnimation) => page,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      return FadeTransition(
        opacity: animation,
        child: child,
      );
    },
  );
}
```

### 5. Search Functionality (5h)

**Add to:**
- Event list (search by title, location)
- User search (for adding participants)
- Group search

**Implement debounced search:**
```dart
Timer? _debounce;

void _onSearchChanged(String query) {
  if (_debounce?.isActive ?? false) _debounce!.cancel();
  
  _debounce = Timer(const Duration(milliseconds: 500), () {
    _performSearch(query);
  });
}

@override
void dispose() {
  _debounce?.cancel();
  super.dispose();
}
```

### 6. Empty States (3h)

**Create consistent empty states for:**
- No events found
- No participants
- No favorites
- No history
- No groups

**Template:**
```dart
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 80, color: Colors.grey[400]),
          SizedBox(height: 24),
          Text(title, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          if (subtitle != null) ...[
            SizedBox(height: 8),
            Text(subtitle!, textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600])),
          ],
          if (action != null) ...[
            SizedBox(height: 24),
            action!,
          ],
        ],
      ),
    );
  }
}
```

### 7. Offline Mode (5h)

**Features:**
- Detect network connectivity
- Cache events locally (SharedPreferences or Hive)
- Show cached data when offline
- Display offline banner
- Queue actions for when online

**Package**: `connectivity_plus: ^5.0.0`

**Offline banner:**
```dart
class OfflineBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(8),
      color: Colors.orange,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.wifi_off, color: Colors.white, size: 16),
          SizedBox(width: 8),
          Text(
            'You are offline. Showing cached data.',
            style: TextStyle(color: Colors.white),
          ),
        ],
      ),
    );
  }
}
```

### 8. Haptic Feedback (1h)

**Add to:**
- Button clicks
- Swipe actions
- Pull to refresh
- Toggle switches

**Implementation:**
```dart
import 'package:flutter/services.dart';

onPressed: () {
  HapticFeedback.lightImpact();
  // Handle button press
}
```

### 9. Improved Validation (4h)

**Backend error messages:**
- Return field-specific errors
- Include validation rules in error response

**Frontend validation:**
- Real-time validation (as user types)
- Show errors below fields
- Disable submit until valid
- Visual indicators (red border, error icon)

---

## Implementation Priority

**Phase 1 (Critical - Week 1):**
1. Bottom Navigation Bar
2. Loading Skeletons
3. Error States

**Phase 2 (Important - Week 2):**
4. Hero Animations
5. Search Functionality
6. Empty States

**Phase 3 (Polish - Week 3):**
7. Offline Mode
8. Haptic Feedback
9. Improved Validation

---

## Testing Checklist

- [ ] Bottom navigation switches screens
- [ ] Back button works correctly with navigation
- [ ] Loading skeletons show on all data screens
- [ ] Error states display with retry button
- [ ] Hero animations smooth between screens
- [ ] Page transitions fade smoothly
- [ ] Search debouncing works (not firing on every keystroke)
- [ ] Empty states show appropriate messages
- [ ] Offline mode detects connectivity
- [ ] Cached data displays when offline
- [ ] Haptic feedback on interactions
- [ ] Form validation real-time
- [ ] Error messages user-friendly

---

## Packages to Add

```yaml
dependencies:
  shimmer: ^3.0.0
  connectivity_plus: ^5.0.0
  cached_network_image: ^3.3.0
  flutter_staggered_animations: ^1.1.1
```

---

## Acceptance Criteria

1. ✅ Bottom navigation functional
2. ✅ Loading skeletons on all screens
3. ✅ Error states with retry
4. ✅ Smooth animations throughout
5. ✅ Search working with debounce
6. ✅ Empty states with helpful messages
7. ✅ Offline mode with banner
8. ✅ Haptic feedback on interactions
9. ✅ Validation user-friendly
10. ✅ Overall polish and consistency

---

## Design Guidelines

**Colors:**
- Primary: #2196F3 (Blue)
- Success: #4CAF50 (Green)
- Warning: #FF9800 (Orange)
- Error: #F44336 (Red)
- Background: #F5F5F5 (Light Gray)

**Spacing:**
- Small: 4px
- Medium: 8px
- Large: 16px
- XLarge: 24px

**Border Radius:**
- Small: 4px
- Medium: 8px
- Large: 12px
- XLarge: 16px

---

## Notes for AI Agent

- Consistency is key - use same patterns everywhere
- Test on multiple screen sizes
- Ensure accessibility (tap targets 44x44dp minimum)
- Use semantic colors (success/error/warning)
- Add micro-interactions for delight
- Profile performance (avoid jank)
- Test with slow network simulation
- Use const constructors for performance
