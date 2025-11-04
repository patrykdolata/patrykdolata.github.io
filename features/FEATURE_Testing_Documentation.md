# Testing & Documentation Sprint

## Overview
Comprehensive testing strategy and API documentation to ensure quality, maintainability, and ease of development.

**Estimated Time**: 60 hours | **Priority**: HIGH (before production) | **Status**: 0% → 100%

## Business Value
- Reduces bugs and production issues
- Improves code maintainability
- Facilitates onboarding of new developers
- Enables confident refactoring
- Professional API documentation

---

## Backend Testing

### 1. Unit Tests (20h)

**Framework**: JUnit 5 + Mockito

**Test Coverage Goals:**
- Services: 80%+ coverage
- Controllers: 70%+ coverage
- Repositories: Custom queries only

**Key Test Classes to Create:**

**File**: `/src/test/java/pl/flutterowo/meetappbe/event/EventServiceTest.java`

```java
@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;
    
    @Mock
    private LocationRepository locationRepository;
    
    @InjectMocks
    private EventService eventService;
    
    @Test
    void createEvent_WithValidData_ShouldCreateEvent() {
        // Given
        CreateEventRequest request = new CreateEventRequest();
        request.setTitle("Test Event");
        request.setStartDateTime(LocalDateTime.now().plusDays(1));
        request.setDuration(120L);
        // ... set other fields
        
        UserEntity organizer = new UserEntity();
        organizer.setId(1);
        
        // When
        EventEntity result = eventService.createEvent(request, organizer);
        
        // Then
        assertNotNull(result);
        assertEquals("Test Event", result.getTitle());
        verify(eventRepository, times(1)).save(any(EventEntity.class));
    }
    
    @Test
    void createEvent_WithPastDate_ShouldThrowException() {
        // Given
        CreateEventRequest request = new CreateEventRequest();
        request.setStartDateTime(LocalDateTime.now().minusDays(1));
        
        // When & Then
        assertThrows(IllegalArgumentException.class, 
            () -> eventService.createEvent(request, new UserEntity()));
    }
    
    // Add more tests...
}
```

**Test all services:**
- `EventServiceTest` - Event CRUD, validation
- `EventParticipantServiceTest` - Join/leave, promotion
- `GroupServiceTest` - Group membership
- `UserServiceTest` - Profile, authentication
- `SeriesServiceTest` - Series creation, generation

**Testing Best Practices:**
- One assertion per test (or related assertions)
- Test names: `methodName_StateUnderTest_ExpectedBehavior`
- Use `@BeforeEach` for common setup
- Mock external dependencies
- Test edge cases and error conditions

### 2. Integration Tests (15h)

**Framework**: Spring Boot Test + TestContainers (PostgreSQL)

**File**: `/src/test/java/pl/flutterowo/meetappbe/integration/EventIntegrationTest.java`

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class EventIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15")
        .withDatabaseName("testdb")
        .withUsername("test")
        .withPassword("test");
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Autowired
    private EventRepository eventRepository;
    
    private String authToken;
    
    @BeforeEach
    void setUp() {
        // Create user and get auth token
        authToken = authenticateTestUser();
    }
    
    @Test
    void createEvent_WithAuthentication_ShouldReturn201() {
        // Given
        CreateEventRequest request = createValidEventRequest();
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(authToken);
        HttpEntity<CreateEventRequest> entity = new HttpEntity<>(request, headers);
        
        // When
        ResponseEntity<EventEntity> response = restTemplate.postForEntity(
            "/api/v1/events", entity, EventEntity.class);
        
        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Test Event", response.getBody().getTitle());
    }
    
    @Test
    void getEvents_WithFilters_ShouldReturnFilteredResults() {
        // Given
        createTestEvents();
        
        // When
        ResponseEntity<List> response = restTemplate.getForEntity(
            "/api/v1/events?sportType=VOLLEYBALL&minLevel=2", List.class);
        
        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        // Assert filtered results
    }
    
    // More integration tests...
}
```

**Integration test scenarios:**
- Full user registration → login → create event flow
- Join event → leave event → auto-promotion
- Create series → generate events
- Cancel event → participants notified
- Group operations with events

**Add to pom.xml:**
```xml
<dependency>
    <groupId>org.testcontainers</groupId>
    <artifactId>postgresql</artifactId>
    <version>1.19.0</version>
    <scope>test</scope>
</dependency>
```

### 3. API Documentation (10h)

**Tool**: SpringDoc OpenAPI 3 (Swagger)

**Add to pom.xml:**
```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.2.0</version>
</dependency>
```

**Configure OpenAPI:**

**File**: `/src/main/java/pl/flutterowo/meetappbe/config/OpenAPIConfig.java`

```java
@Configuration
public class OpenAPIConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Meet App API")
                .version("1.0")
                .description("API for volleyball event management")
                .contact(new Contact()
                    .name("Dev Team")
                    .email("dev@meetapp.com")))
            .addSecurityItem(new SecurityRequirement().addList("bearer-jwt"))
            .components(new Components()
                .addSecuritySchemes("bearer-jwt",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")));
    }
}
```

**Annotate Controllers:**

```java
@Tag(name = "Events", description = "Event management endpoints")
@RestController
@RequestMapping("/events")
public class EventController {

    @Operation(summary = "Get all events", description = "Retrieve all active events with optional filters")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Events retrieved successfully"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    @GetMapping
    public ResponseEntity<List<EventEntity>> getEvents(
        @Parameter(description = "Filter by sport type") @RequestParam(required = false) SportType sportType,
        // ... other params
    ) {
        // Implementation
    }
}
```

**Access Swagger UI:** `http://localhost:8443/swagger-ui.html`

### 4. Postman Collection (5h)

**Create collection with:**
- Authentication folder (register, login, refresh)
- Events folder (CRUD, filters, cancel)
- Participants folder (join, leave, manage)
- Groups folder (list, join, leave)
- Users folder (profile, history)
- Series folder (create, generate)

**Export as**: `/docs/MeetApp_API.postman_collection.json`

**Environment variables:**
```json
{
  "baseUrl": "http://localhost:8443/api/v1",
  "accessToken": "",
  "refreshToken": "",
  "userId": ""
}
```

---

## Frontend Testing

### 1. Widget Tests (5h)

**Framework**: Flutter Test

**File**: `/app/test/widgets/event_card_test.dart`

```dart
void main() {
  testWidgets('EventCard displays event information', (WidgetTester tester) async {
    // Given
    final event = EventEntity(
      id: '1',
      title: 'Test Event',
      startDateTime: DateTime.now(),
      // ... other fields
    );

    // When
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: EventCard(event: event),
        ),
      ),
    );

    // Then
    expect(find.text('Test Event'), findsOneWidget);
    expect(find.byIcon(Icons.location_on), findsOneWidget);
  });

  testWidgets('EventCard tap triggers callback', (WidgetTester tester) async {
    // Test tap interaction
  });
}
```

**Test key widgets:**
- EventCard
- EventDetails
- ParticipantItem
- FilterBottomSheet
- StatusBadge

### 2. Integration Tests (3h)

**File**: `/app/integration_test/app_test.dart`

```dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Complete user flow', (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Navigate to login
    await tester.tap(find.byIcon(Icons.person));
    await tester.pumpAndSettle();

    // Enter credentials
    await tester.enterText(find.byType(TextField).first, 'testuser');
    await tester.enterText(find.byType(TextField).last, 'password');
    
    // Submit login
    await tester.tap(find.text('Login'));
    await tester.pumpAndSettle();

    // Verify home screen
    expect(find.byType(GoogleMap), findsOneWidget);
  });
}
```

### 3. Unit Tests for Services (2h)

**File**: `/app/test/services/event_service_test.dart`

```dart
void main() {
  late EventService eventService;
  late MockEventHttpClient mockHttpClient;

  setUp(() {
    mockHttpClient = MockEventHttpClient();
    eventService = EventService(mockHttpClient);
  });

  test('getEvents returns list of events on success', () async {
    // Given
    final mockResponse = HttpResponse(
      statusCode: 200,
      data: EventHttpResponse(events: [/* mock events */]),
    );
    when(() => mockHttpClient.getEvents()).thenAnswer((_) async => mockResponse);

    // When
    final result = await eventService.getEvents();

    // Then
    expect(result, isNotEmpty);
    verify(() => mockHttpClient.getEvents()).called(1);
  });
}
```

---

## Documentation

### 1. README.md (2h)

**File**: `/README.md`

```markdown
# Meet App

Volleyball event management application with map-based event discovery.

## Features
- Event creation and management
- Interactive map with event markers
- Join/leave events with waitlist
- Groups and communities
- Recurring event series
- User profiles and ratings

## Tech Stack
- Backend: Spring Boot 3.5, PostgreSQL, JWT
- Frontend: Flutter 3.27, Google Maps
- Deployment: Raspberry Pi 4B, Nginx

## Quick Start

### Backend
```bash
cd meet-app-be
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 ./mvnw spring-boot:run
```

### Frontend
```bash
cd meet-app-fe/app
flutter run
```

## API Documentation
Access Swagger UI: http://localhost:8443/swagger-ui.html

## Testing
```bash
# Backend tests
./mvnw test

# Frontend tests
flutter test
```

## License
MIT
```

### 2. API Documentation (in docs/) (3h)

**Files to create:**
- `/docs/API.md` - Comprehensive API guide
- `/docs/ARCHITECTURE.md` - System architecture
- `/docs/DEPLOYMENT.md` - Deployment instructions
- `/docs/CONTRIBUTING.md` - Development guidelines

---

## Testing Checklist

### Backend
- [ ] All service methods have unit tests
- [ ] Controllers tested with MockMvc
- [ ] Integration tests for key flows
- [ ] Repository custom queries tested
- [ ] Security/authentication tested
- [ ] Error handling tested
- [ ] Validation tested

### Frontend
- [ ] Widget tests for key components
- [ ] Service layer unit tests
- [ ] Integration tests for main flows
- [ ] Error handling tested
- [ ] Navigation tested

### Documentation
- [ ] Swagger UI accessible
- [ ] All endpoints documented
- [ ] Postman collection complete
- [ ] README comprehensive
- [ ] API guide detailed
- [ ] Architecture documented

---

## Acceptance Criteria

1. ✅ Backend test coverage > 70%
2. ✅ All integration tests passing
3. ✅ Swagger UI documenting all endpoints
4. ✅ Postman collection exported
5. ✅ Frontend widget tests for key components
6. ✅ README with setup instructions
7. ✅ API documentation complete
8. ✅ Architecture documented
9. ✅ All tests passing in CI (if setup)
10. ✅ Documentation kept up-to-date

---

## Tools & Frameworks Summary

**Backend:**
- JUnit 5 - Unit testing
- Mockito - Mocking
- Spring Boot Test - Integration testing
- TestContainers - Database testing
- SpringDoc OpenAPI - API documentation

**Frontend:**
- flutter_test - Widget testing
- integration_test - E2E testing
- mockito - Mocking (with build_runner)

---

## Notes for AI Agent

- Write tests as you implement features (TDD preferred)
- Aim for meaningful tests, not just coverage numbers
- Test business logic thoroughly, UI less so
- Keep tests fast (mock external dependencies)
- Update documentation when APIs change
- Use descriptive test names
- One test per behavior/scenario
- Arrange-Act-Assert pattern
