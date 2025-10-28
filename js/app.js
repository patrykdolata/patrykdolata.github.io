// Main App Logic - Routing, State Management, Utilities

// State management
let appState = {
  currentUser: null,
  isAuthenticated: false,
  currentLanguage: 'en',
  favoriteLocations: [],
  selectedEvent: null
};

// Initialize app
function initApp() {
  // Check if user is logged in (from localStorage)
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    appState.currentUser = JSON.parse(storedUser);
    appState.isAuthenticated = true;
  }

  // Load language preference
  const storedLanguage = localStorage.getItem('language') || 'en';
  appState.currentLanguage = storedLanguage;

  // Load favorites
  const storedFavorites = localStorage.getItem('favorites');
  if (storedFavorites) {
    appState.favoriteLocations = JSON.parse(storedFavorites);
  }
}

// Navigation functions
function navigateTo(screen, params = {}) {
  // Store params in sessionStorage for the next page
  if (Object.keys(params).length > 0) {
    sessionStorage.setItem('navParams', JSON.stringify(params));
  }

  const screenPath = screen === 'index' ? '../index.html' : `${screen}.html`;
  window.location.href = screenPath;
}

function getNavigationParams() {
  const params = sessionStorage.getItem('navParams');
  sessionStorage.removeItem('navParams'); // Clear after reading
  return params ? JSON.parse(params) : {};
}

// Authentication functions
function login(email, password) {
  // Mock authentication
  const user = users.find(u => u.email === email);

  if (user && password) { // In real app, verify password hash
    appState.currentUser = user;
    appState.isAuthenticated = true;
    localStorage.setItem('currentUser', JSON.stringify(user));
    showSnackbar('Login successful!', 'success');
    return true;
  }

  showSnackbar('Invalid email or password', 'error');
  return false;
}

function register(login, nickname, email, password) {
  // Mock registration
  const newUser = {
    id: users.length + 1,
    login: login,
    email: email,
    nickName: nickname,
    avatar: null,
    facebookProfileUri: '',
    thumbsUp: 0,
    thumbsDown: 0,
    role: 'USER'
  };

  users.push(newUser);
  appState.currentUser = newUser;
  appState.isAuthenticated = true;
  localStorage.setItem('currentUser', JSON.stringify(newUser));
  showSnackbar('Registration successful!', 'success');
  return true;
}

function logout() {
  appState.currentUser = null;
  appState.isAuthenticated = false;
  localStorage.removeItem('currentUser');
  showSnackbar('Logged out successfully', 'success');
  navigateTo('index');
}

// Favorite functions
function addToFavorites(location, notes = '') {
  const favorite = {
    id: appState.favoriteLocations.length + 1,
    location: location,
    user: appState.currentUser,
    notes: notes,
    createdAt: new Date().toISOString()
  };

  appState.favoriteLocations.push(favorite);
  saveFavorites();
  showSnackbar('Added to favorites', 'success');
}

function removeFromFavorites(locationId) {
  appState.favoriteLocations = appState.favoriteLocations.filter(
    fav => fav.location.id !== locationId
  );
  saveFavorites();
  showSnackbar('Removed from favorites', 'success');
}

function isFavorite(locationId) {
  return appState.favoriteLocations.some(fav => fav.location.id === locationId);
}

function saveFavorites() {
  localStorage.setItem('favorites', JSON.stringify(appState.favoriteLocations));
}

// Language functions
function setLanguage(lang) {
  appState.currentLanguage = lang;
  localStorage.setItem('language', lang);
  // Reload page to apply new language
  window.location.reload();
}

function t(key) {
  return translations[appState.currentLanguage][key] || key;
}

// Date/Time formatting
function formatDateTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleString(appState.currentLanguage === 'pl' ? 'pl-PL' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleDateString(appState.currentLanguage === 'pl' ? 'pl-PL' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(dateTimeString) {
  const date = new Date(dateTimeString);
  return date.toLocaleTimeString(appState.currentLanguage === 'pl' ? 'pl-PL' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDuration(duration) {
  // Parse ISO 8601 duration (e.g., "PT2H30M")
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return duration;

  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

// Price formatting
function formatPrice(price, currency) {
  if (price === 0) {
    return t('free');
  }

  return new Intl.NumberFormat(appState.currentLanguage === 'pl' ? 'pl-PL' : 'en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
}

// Event functions
function getEventById(eventId) {
  return events.find(e => e.id === eventId);
}

function filterEventsByLevel(minLevel, maxLevel) {
  return events.filter(e => e.level >= minLevel && e.level <= maxLevel);
}

function filterEventsByLocation(locationId) {
  return events.filter(e => e.location.id === locationId);
}

function getUpcomingEvents() {
  const now = new Date();
  return events.filter(e => new Date(e.startDateTime) > now)
    .sort((a, b) => new Date(a.startDateTime) - new Date(b.startDateTime));
}

// UI Helper functions
function showSnackbar(message, type = 'default') {
  const snackbar = document.createElement('div');
  snackbar.className = `app-snackbar app-snackbar--${type}`;
  snackbar.textContent = message;

  document.body.appendChild(snackbar);

  setTimeout(() => {
    snackbar.style.animation = 'slideDown 0.3s ease-in forwards';
    setTimeout(() => {
      document.body.removeChild(snackbar);
    }, 300);
  }, 3000);
}

function showLoading(element) {
  const loading = document.createElement('div');
  loading.className = 'app-loading app-loading--large';
  loading.style.margin = '40px auto';
  element.innerHTML = '';
  element.appendChild(loading);
}

function createAvatar(user) {
  const avatar = document.createElement('div');
  avatar.className = 'app-avatar';

  if (user.avatar) {
    const img = document.createElement('img');
    img.src = user.avatar;
    img.alt = user.nickName;
    img.className = 'app-avatar__image';
    avatar.appendChild(img);
  } else {
    avatar.textContent = user.nickName.charAt(0).toUpperCase();
  }

  return avatar;
}

function createEventCard(event, clickable = true) {
  const card = document.createElement('div');
  card.className = 'app-card event-card';

  if (clickable) {
    card.style.cursor = 'pointer';
    card.onclick = () => {
      navigateTo('screens/event-details', { eventId: event.id });
    };
  }

  card.innerHTML = `
    ${event.image ? `<img src="${event.image}" alt="${event.title}" class="event-card__image">` : ''}
    <div class="app-card__body">
      <h3 class="event-card__title">${event.title}</h3>
      <div class="event-card__info">
        <div class="event-card__info-item">
          <span>📅</span>
          <span>${formatDate(event.startDateTime)}</span>
        </div>
        <div class="event-card__info-item">
          <span>🕐</span>
          <span>${formatTime(event.startDateTime)} - ${formatTime(event.endDateTime)}</span>
        </div>
        <div class="event-card__info-item">
          <span>📍</span>
          <span>${event.location.name}</span>
        </div>
        <div class="event-card__info-item">
          <span>👥</span>
          <span>${event.slotsAvailable}/${event.slots} ${t('availableSlots')}</span>
        </div>
        <div class="event-card__info-item">
          <span>⭐</span>
          <span>${t('level')}: ${event.level}/10</span>
        </div>
      </div>
    </div>
    <div class="app-card__footer">
      <div class="event-card__price">${formatPrice(event.price, event.currency)}</div>
      <span class="app-chip">${event.groupName}</span>
    </div>
  `;

  return card;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
}

// Signal bars level display function
function renderSignalBars(level) {
  let bars = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= level ? 'filled' : '';
    bars += `<span class="bar h${i} ${filled}"></span>`;
  }
  return bars;
}

function initSignalBars() {
  document.querySelectorAll('.signal-bars').forEach(el => {
    const level = parseInt(el.getAttribute('data-level'));
    el.innerHTML = renderSignalBars(level);
  });
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initApp();
    initSignalBars();
  });
} else {
  initApp();
  initSignalBars();
}

// Add slideDown animation for snackbar
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    to {
      transform: translateX(-50%) translateY(100px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);
