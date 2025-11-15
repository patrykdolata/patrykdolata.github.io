# Feature 5.5: Favorite Locations

## Standardized Spec

- Milestone: Pre‑M1 (zrealizowane wstępnie)
- Goal: Ulubione lokalizacje do szybkiego filtrowania i centrowania mapy.
- In Scope: CRUD ulubionych miejsc; integracja z mapą (centrowanie/filtr); UI polish i błędy.
- Out of Scope: zaawansowane rekomendacje.
- Acceptance Criteria: dodawanie/usuwanie działa; mapa centrowana do ulubionych; stany ładowania/błędów w UI.
- Frontend UX: `FavoriteLocationNotifier`, serwis + ekran ulubionych.
- Tests: smoke flows; brak regresji mapy.

## Overview
Finish the favorite locations feature by adding edge cases, error handling, and UI polish.

**Priority**: LOW | **Status**: 90% → 100%

## Current Implementation (90% Done)

✅ Database table and entity exist
✅ Backend CRUD endpoints working
✅ Frontend service and widgets created
✅ Heart button on event cards functional
✅ Basic list of favorites

---

## Remaining Tasks (10%)

### 1. Add Loading States (2h)

**Backend**: Already complete

**Frontend**: Add loading indicators
- `/app/lib/widgets/event/pop_up/favourite.dart` - Show spinner while toggling
- Add debouncing to prevent rapid clicks
- Optimistic UI updates with rollback on error

### 2. Error Handling (2h)

**Add to FavoriteService:**
```dart
Future<bool> toggleFavorite(int locationId) async {
  try {
    final isFavorite = await isFavoriteLocation(locationId);
    
    if (isFavorite) {
      return await removeFavorite(locationId);
    } else {
      return await addFavorite(locationId);
    }
  } on DioException catch (e) {
    if (e.response?.statusCode == 401) {
      throw UnauthorizedException('Please login to add favorites');
    }
    rethrow;
  } catch (e) {
    print('Error toggling favorite: $e');
    return false;
  }
}
```

**Show user-friendly errors:**
- Network errors
- Unauthorized (redirect to login)
- Server errors

### 3. Favorites Screen Improvements (3h)

**File**: Create/enhance `/app/lib/widgets/favorite/favorites_screen.dart`

Features:
- Empty state with icon and message
- Pull to refresh
- Swipe to delete
- Loading skeleton
- Search/filter favorites
- Sort by distance (if location permission granted)
- Show event count per location

### 4. Map Integration (2h)

**Add to GoogleMapWidget:**
- Show all favorite locations as different colored markers
- Tap favorite marker to show events at that location
- "Favorites Only" toggle filter

### 5. Notes Functionality (2h)

**Enhance favorite details:**
- Edit notes inline or in dialog
- Character limit (500 chars)
- Save notes automatically on blur
- Show notes in favorites list

---

## Implementation Steps

1. **Add Loading States**
   - Update FavoriteWidget with loading indicator
   - Add debounce to heart button (300ms)
   - Implement optimistic UI updates

2. **Improve Error Handling**
   - Add try-catch blocks in all service methods
   - Show SnackBar for errors
   - Handle 401 Unauthorized gracefully

3. **Polish Favorites Screen**
   - Add empty state illustration
   - Implement pull-to-refresh
   - Add swipe-to-delete gesture
   - Add search bar at top

4. **Map Favorites**
   - Add favorite markers to map (star icon)
   - Toggle filter for favorites only
   - Show event count on favorite markers

5. **Notes Enhancement**
   - Add notes field to favorites screen
   - Save on change with debounce
   - Show notes preview in list

---

## Testing Checklist

- [ ] Heart button shows loading state
- [ ] Rapid clicks handled gracefully
- [ ] Error messages display correctly
- [ ] Favorites screen shows empty state
- [ ] Pull to refresh works
- [ ] Swipe to delete works
- [ ] Search filters favorites
- [ ] Favorite markers show on map
- [ ] Toggle favorites filter works
- [ ] Notes can be edited and saved
- [ ] Character limit enforced on notes

---

## Acceptance Criteria

1. ✅ No console errors or warnings
2. ✅ Loading states on all async operations
3. ✅ User-friendly error messages
4. ✅ Favorites screen fully functional
5. ✅ Map integration complete
6. ✅ Notes editable and persistent
7. ✅ Smooth animations and transitions
8. ✅ Empty states with helpful messages
9. ✅ Swipe gestures working
10. ✅ All edge cases handled

---

## Quick Wins

**Empty State Message:**
```dart
Center(
  child: Column(
    mainAxisAlignment: MainAxisAlignment.center,
    children: [
      Icon(Icons.favorite_border, size: 64, color: Colors.grey),
      SizedBox(height: 16),
      Text('No favorite locations yet'),
      SizedBox(height: 8),
      Text(
        'Tap the heart icon on event cards to save locations',
        textAlign: TextAlign.center,
        style: TextStyle(color: Colors.grey[600]),
      ),
    ],
  ),
)
```

**Swipe to Delete:**
```dart
Dismissible(
  key: Key(favorite.id.toString()),
  direction: DismissDirection.endToStart,
  background: Container(
    alignment: Alignment.centerRight,
    padding: EdgeInsets.only(right: 20),
    color: Colors.red,
    child: Icon(Icons.delete, color: Colors.white),
  ),
  onDismissed: (_) => _deleteFavorite(favorite),
  child: FavoriteListItem(favorite: favorite),
)
```

---

## Notes for AI Agent

- Focus on user experience improvements
- Add smooth animations (fade, slide)
- Use CustomSnackBar for all user feedback
- Follow existing patterns for empty states
- Test on both Android and iOS if possible
- Ensure offline mode shows cached favorites
