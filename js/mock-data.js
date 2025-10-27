// Mock Data for Meet App

// Current user (logged in)
const currentUser = {
  id: 1,
  login: 'user123',
  email: 'user@example.com',
  nickName: 'VolleyPro',
  avatar: null,
  facebookProfileUri: 'https://facebook.com/volleypro',
  thumbsUp: 42,
  thumbsDown: 3,
  role: 'USER'
};

// Sample users
const users = [
  currentUser,
  {
    id: 2,
    login: 'anna_smith',
    email: 'anna@example.com',
    nickName: 'Anna S.',
    avatar: null,
    facebookProfileUri: 'https://facebook.com/anna.smith',
    thumbsUp: 35,
    thumbsDown: 2,
    role: 'USER'
  },
  {
    id: 3,
    login: 'john_doe',
    email: 'john@example.com',
    nickName: 'Johnny Volleyball',
    avatar: null,
    facebookProfileUri: 'https://facebook.com/john.doe',
    thumbsUp: 58,
    thumbsDown: 5,
    role: 'MANAGER'
  },
  {
    id: 4,
    login: 'kate_player',
    email: 'kate@example.com',
    nickName: 'Kate',
    avatar: null,
    facebookProfileUri: 'https://facebook.com/kate.player',
    thumbsUp: 21,
    thumbsDown: 1,
    role: 'USER'
  }
];

// Locations in Poznań
const locations = [
  {
    id: 1,
    name: 'Hala Sportowa Malta',
    address: 'ul. Krańcowa 4, 61-037 Poznań',
    latitude: 52.3982,
    longitude: 16.9682,
    description: 'Modern sports hall near Malta Lake'
  },
  {
    id: 2,
    name: 'AWF Poznań - Hala Lekkoatletyczna',
    address: 'ul. Królowej Jadwigi 27/39, 61-871 Poznań',
    latitude: 52.4005,
    longitude: 16.8996,
    description: 'University sports facility with professional equipment'
  },
  {
    id: 3,
    name: 'Orlik Poznań Grunwald',
    address: 'ul. Grunwaldzka 60, 60-311 Poznań',
    latitude: 52.3998,
    longitude: 16.9123,
    description: 'Outdoor sports court with volleyball net'
  },
  {
    id: 4,
    name: 'Hala Arena Poznań',
    address: 'ul. Roosevelta 1, 60-829 Poznań',
    latitude: 52.3857,
    longitude: 16.9496,
    description: 'Large indoor arena for sports events'
  },
  {
    id: 5,
    name: 'Park Cytadela - Kort Sportowy',
    address: 'Park Cytadela, 61-001 Poznań',
    latitude: 52.4167,
    longitude: 16.9234,
    description: 'Sports court in beautiful park setting'
  },
  {
    id: 6,
    name: 'Hala MOSiR Chwiałka',
    address: 'ul. Chwiałkowskiego 18, 60-681 Poznań',
    latitude: 52.3756,
    longitude: 16.8923,
    description: 'Municipal sports facility'
  }
];

// Volleyball groups
const groups = [
  {
    id: 1,
    name: 'Poznań Volleyball Meetup',
    url: 'https://facebook.com/groups/poznan-volleyball'
  },
  {
    id: 2,
    name: 'Amatorska Siatkówka Poznań',
    url: 'https://facebook.com/groups/amateur-volleyball-poznan'
  },
  {
    id: 3,
    name: 'Beach Volleyball Poznań',
    url: 'https://facebook.com/groups/beach-volleyball-poznan'
  }
];

// Events
const events = [
  {
    id: 'evt-001',
    title: 'Evening Volleyball - All Levels',
    message: 'Friendly volleyball game for all skill levels. Come and have fun!',
    location: locations[0],
    user: users[1],
    startDateTime: '2025-10-28T18:00:00',
    endDateTime: '2025-10-28T20:00:00',
    duration: 'PT2H',
    slots: 12,
    slotsAvailable: 5,
    price: 15.00,
    currency: 'PLN',
    level: 3,
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
    url: 'https://example.com/event1',
    groupName: groups[0].name,
    groupUrl: groups[0].url
  },
  {
    id: 'evt-002',
    title: 'Advanced Volleyball Training',
    message: 'Intensive training session for advanced players. Focus on technique and tactics.',
    location: locations[1],
    user: users[2],
    startDateTime: '2025-10-29T19:00:00',
    endDateTime: '2025-10-29T21:30:00',
    duration: 'PT2H30M',
    slots: 16,
    slotsAvailable: 8,
    price: 25.00,
    currency: 'PLN',
    level: 4,
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400',
    url: 'https://example.com/event2',
    groupName: groups[1].name,
    groupUrl: groups[1].url
  },
  {
    id: 'evt-003',
    title: 'Beginner Friendly Volleyball',
    message: 'Perfect for beginners! Learn basics and meet new friends.',
    location: locations[2],
    user: users[3],
    startDateTime: '2025-10-30T17:00:00',
    endDateTime: '2025-10-30T19:00:00',
    duration: 'PT2H',
    slots: 10,
    slotsAvailable: 10,
    price: 10.00,
    currency: 'PLN',
    level: 1,
    image: 'https://images.unsplash.com/photo-1593765290726-c811c2f39e26?w=400',
    url: 'https://example.com/event3',
    groupName: groups[0].name,
    groupUrl: groups[0].url
  },
  {
    id: 'evt-004',
    title: 'Weekend Beach Volleyball',
    message: 'Beach volleyball session at outdoor court. Weather dependent!',
    location: locations[4],
    user: users[1],
    startDateTime: '2025-11-01T14:00:00',
    endDateTime: '2025-11-01T17:00:00',
    duration: 'PT3H',
    slots: 8,
    slotsAvailable: 2,
    price: 0.00,
    currency: 'PLN',
    level: 3,
    image: 'https://images.unsplash.com/photo-1592656094267-764a45160876?w=400',
    url: 'https://example.com/event4',
    groupName: groups[2].name,
    groupUrl: groups[2].url
  },
  {
    id: 'evt-005',
    title: 'Competitive Tournament Practice',
    message: 'Preparation for upcoming tournament. High intensity!',
    location: locations[3],
    user: users[2],
    startDateTime: '2025-11-02T16:00:00',
    endDateTime: '2025-11-02T19:00:00',
    duration: 'PT3H',
    slots: 12,
    slotsAvailable: 3,
    price: 30.00,
    currency: 'PLN',
    level: 5,
    image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400',
    url: 'https://example.com/event5',
    groupName: groups[1].name,
    groupUrl: groups[1].url
  },
  {
    id: 'evt-006',
    title: 'Sunday Morning Volleyball',
    message: 'Relaxed Sunday morning game. Coffee afterwards!',
    location: locations[5],
    user: users[3],
    startDateTime: '2025-11-03T10:00:00',
    endDateTime: '2025-11-03T12:00:00',
    duration: 'PT2H',
    slots: 14,
    slotsAvailable: 7,
    price: 12.00,
    currency: 'PLN',
    level: 2,
    image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400',
    url: 'https://example.com/event6',
    groupName: groups[0].name,
    groupUrl: groups[0].url
  }
];

// Favorite places
const favoritePlaces = [
  {
    id: 1,
    location: locations[0],
    user: currentUser,
    notes: 'Best hall in the area, great facilities',
    createdAt: '2025-09-15T10:00:00'
  },
  {
    id: 2,
    location: locations[4],
    user: currentUser,
    notes: 'Beautiful park, perfect for summer games',
    createdAt: '2025-09-20T14:30:00'
  }
];

// Skill level descriptions
const skillLevels = {
  en: {
    attacks: {
      0: 'No experience',
      1: 'Basic understanding',
      3: 'Can perform basic attacks',
      5: 'Consistent attacking',
      7: 'Advanced techniques',
      9: 'Professional level',
      10: 'Elite player'
    },
    setting: {
      0: 'Cannot set',
      1: 'Learning basics',
      3: 'Can set occasionally',
      5: 'Regular setter',
      7: 'Advanced setting',
      9: 'Professional setter',
      10: 'Elite setter'
    },
    blocking: {
      0: 'No blocking experience',
      1: 'Understanding timing',
      3: 'Basic blocking',
      5: 'Effective blocking',
      7: 'Advanced blocking',
      9: 'Professional blocker',
      10: 'Elite blocker'
    },
    passing: {
      0: 'Cannot pass',
      1: 'Learning basics',
      3: 'Basic passing',
      5: 'Consistent passing',
      7: 'Advanced passing',
      9: 'Professional level',
      10: 'Elite passing'
    },
    receiving: {
      0: 'Cannot receive',
      1: 'Basic understanding',
      3: 'Can receive serves',
      5: 'Consistent receiving',
      7: 'Advanced receiving',
      9: 'Professional level',
      10: 'Elite receiving'
    },
    serving: {
      0: 'Cannot serve',
      1: 'Basic serve',
      3: 'Consistent serve',
      5: 'Multiple serve types',
      7: 'Advanced serving',
      9: 'Professional serves',
      10: 'Elite server'
    }
  },
  pl: {
    attacks: {
      0: 'Brak doświadczenia',
      1: 'Podstawowe zrozumienie',
      3: 'Potrafię wykonać podstawowe ataki',
      5: 'Konsekwentne atakowanie',
      7: 'Zaawansowane techniki',
      9: 'Poziom profesjonalny',
      10: 'Elitarny gracz'
    },
    setting: {
      0: 'Nie potrafię rozgrywać',
      1: 'Uczę się podstaw',
      3: 'Okazjonalnie rozgrywam',
      5: 'Regularny rozgrywający',
      7: 'Zaawansowana rozgrywka',
      9: 'Profesjonalny rozgrywający',
      10: 'Elitarny rozgrywający'
    },
    blocking: {
      0: 'Brak doświadczenia w blokowaniu',
      1: 'Rozumiem timing',
      3: 'Podstawowe blokowanie',
      5: 'Skuteczne blokowanie',
      7: 'Zaawansowane blokowanie',
      9: 'Profesjonalny bloker',
      10: 'Elitarny bloker'
    },
    passing: {
      0: 'Nie potrafię podawać',
      1: 'Uczę się podstaw',
      3: 'Podstawowe podania',
      5: 'Konsekwentne podania',
      7: 'Zaawansowane podania',
      9: 'Poziom profesjonalny',
      10: 'Elitarne podania'
    },
    receiving: {
      0: 'Nie potrafię przyjmować',
      1: 'Podstawowe zrozumienie',
      3: 'Potrafię przyjmować zagrywki',
      5: 'Konsekwentne przyjęcie',
      7: 'Zaawansowane przyjęcie',
      9: 'Poziom profesjonalny',
      10: 'Elitarne przyjęcie'
    },
    serving: {
      0: 'Nie potrafię zagrywać',
      1: 'Podstawowa zagrywka',
      3: 'Konsekwentna zagrywka',
      5: 'Wiele rodzajów zagrywek',
      7: 'Zaawansowane zagrywki',
      9: 'Profesjonalne zagrywki',
      10: 'Elitarny zagrywający'
    }
  }
};

// Translations
const translations = {
  en: {
    appName: 'Meet App',
    home: 'Home',
    events: 'Events',
    profile: 'Profile',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    nickname: 'Nickname',
    createEvent: 'Create Event',
    eventDetails: 'Event Details',
    skillLevels: 'Skill Levels',
    favorites: 'Favorites',
    date: 'Date',
    time: 'Time',
    location: 'Location',
    organizer: 'Organizer',
    price: 'Price',
    slots: 'Slots',
    level: 'Level',
    join: 'Join Event',
    free: 'Free',
    availableSlots: 'Available Slots',
    groupInfo: 'Group Info',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    ratings: 'Ratings'
  },
  pl: {
    appName: 'Meet App',
    home: 'Strona główna',
    events: 'Wydarzenia',
    profile: 'Profil',
    login: 'Zaloguj',
    register: 'Zarejestruj',
    logout: 'Wyloguj',
    email: 'Email',
    password: 'Hasło',
    nickname: 'Pseudonim',
    createEvent: 'Utwórz wydarzenie',
    eventDetails: 'Szczegóły wydarzenia',
    skillLevels: 'Poziomy umiejętności',
    favorites: 'Ulubione',
    date: 'Data',
    time: 'Godzina',
    location: 'Lokalizacja',
    organizer: 'Organizator',
    price: 'Cena',
    slots: 'Miejsca',
    level: 'Poziom',
    join: 'Dołącz',
    free: 'Bezpłatne',
    availableSlots: 'Dostępne miejsca',
    groupInfo: 'Informacje o grupie',
    addToFavorites: 'Dodaj do ulubionych',
    removeFromFavorites: 'Usuń z ulubionych',
    ratings: 'Oceny'
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    currentUser,
    users,
    locations,
    groups,
    events,
    favoritePlaces,
    skillLevels,
    translations
  };
}
