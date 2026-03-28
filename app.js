// --- DB STATE ---
let db = { 
    users: [], // {id, name, surname, phone, units: []}
    activeEvent: null,
    totalOut: 0,
    currentUser: null 
};

let staffActiveUser = null;
let staffQty = 1;
let staffTempScanned = [];

const loadedScreens = {};

// Wykrywanie braku serwera (protokół file://)
if (window.location.protocol === 'file:') {
    document.getElementById('server-warning').style.display = 'block';
}

// --- INITIALIZATION ---
window.onload = () => {
    switchRole('client');
    lucide.createIcons();
};

// --- NAVIGATION ---
async function go(id) {
    const container = document.getElementById('screen-container');
    
    // Hide all existing
    Object.values(loadedScreens).forEach(el => el.classList.remove('active'));

    // Fetch if not loaded
    if (!loadedScreens[id]) {
        try {
            const res = await fetch(`screens/${id}.html`);
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            const html = await res.text();
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const screenEl = tempDiv.firstElementChild;
            
            container.appendChild(screenEl);
            loadedScreens[id] = screenEl;
        } catch (e) {
            console.error('Błąd ładowania ekranu:', e);
            alert(`Nie można załadować ekranu: ${id}. Uruchom lokalny serwer HTTP (np. python3 -m http.server).`);
            return;
        }
    }

    loadedScreens[id].classList.add('active');
    
    // Wait a tick for DOM to register the active class, then call onScreen
    setTimeout(() => onScreen(id), 10);
}

function switchRole(role) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${role}`).classList.add('active');
    if (role === 'client') go(db.currentUser ? 'c-qr' : 'c-home');
    else go(db.activeEvent ? 's-home' : 's-event-selector');
}

function onScreen(id) {
    if (id === 'c-qr' && db.currentUser) {
        document.getElementById('c-disp-name').innerText = `${db.currentUser.name} ${db.currentUser.surname}`;
        document.getElementById('c-disp-phone').innerText = db.currentUser.phone;
        document.getElementById('c-disp-units').innerHTML = db.currentUser.units.length 
            ? db.currentUser.units.map(u => `<span class="tag">#SK-${u}</span>`).join('') 
            : 'Brak';
    }
    if (id === 's-home') {
        document.getElementById('s-active-event').innerText = db.activeEvent;
        document.getElementById('s-stat-out').innerText = db.totalOut;
        document.getElementById('s-stat-debtors').innerText = db.users.filter(u=>u.units.length > 0).length;
    }
    if (id === 's-scan') {
        const list = document.getElementById('s-sim-users-list');
        list.innerHTML = db.users.length ? '' : '<small style="opacity:0.5; text-align:center;">Brak zarejestrowanych osób</small>';
        db.users.forEach(u => {
            const b = document.createElement('button');
            b.className = 'btn btn-secondary';
            b.innerText = `${u.name} ${u.surname} (${u.phone})`;
            b.style.fontSize = '12px';
            b.onclick = () => { staffActiveUser = u; go('s-user'); };
            list.appendChild(b);
        });
    }
    if (id === 's-user' && staffActiveUser) renderStaffUser();
    if (id === 's-debtors') renderDebtors();
    lucide.createIcons();
}

// --- CLIENT AUTH ---
function authProcess(type) {
    if (type === 'reg') {
        const name = document.getElementById('reg-name').value;
        const surname = document.getElementById('reg-surname').value;
        const phone = document.getElementById('reg-phone').value;
        if (!name || !surname || !phone) return alert('Wpisz wszystkie dane!');
        db.currentUser = { id: Date.now().toString(), name, surname, phone, units: [] };
    } else {
        const phone = document.getElementById('login-phone').value;
        const user = db.users.find(u => u.phone === phone);
        if (!user) return alert('Nie znaleziono konta!');
        db.currentUser = user;
    }
    go('c-sms');
}

function authFinalize() {
    if (!db.users.find(u => u.id === db.currentUser.id)) db.users.push(db.currentUser);
    go('c-qr');
}

function authLogout() { db.currentUser = null; go('c-home'); }

// --- STAFF EVENT MGMT ---
function staffStartEvent(name) { db.activeEvent = name; go('s-home'); }
function staffCreateEvent() {
    const name = document.getElementById('new-event-name').value;
    if (!name) return alert('Podaj nazwę eventu!');
    staffStartEvent(name);
}
function staffStopEvent() {
    document.getElementById('sum-p').innerText = db.users.length;
    document.getElementById('sum-h').innerText = db.totalOut;
    document.getElementById('sum-d').innerText = db.users.filter(u=>u.units.length > 0).length;
    db.activeEvent = null;
    go('s-summary');
}

// --- STAFF USER MGMT ---
function staffDoManualReg() {
    const name = document.getElementById('man-name').value || 'Klient';
    const surname = document.getElementById('man-surname').value || 'Ręczny';
    const phone = document.getElementById('man-phone').value || '000-000';
    const user = { id: Date.now().toString(), name, surname, phone, units: [] };
    db.users.push(user);
    staffActiveUser = user;
    go('s-user');
}

function renderStaffUser() {
    document.getElementById('s-user-name-title').innerText = `${staffActiveUser.name} ${staffActiveUser.surname}`;
    document.getElementById('s-user-phone-title').innerText = staffActiveUser.phone;
    document.getElementById('s-user-has-count').innerText = staffActiveUser.units.length;
    document.getElementById('s-user-has-tags').innerHTML = staffActiveUser.units.map(u => `<span class="tag">#SK-${u}</span>`).join('');
    document.getElementById('s-return-area').style.display = staffActiveUser.units.length > 0 ? 'block' : 'none';
    staffQty = 1; staffTempScanned = [];
    document.getElementById('s-qty-val').innerText = "1";
    document.getElementById('s-temp-scanned-tags').innerHTML = "";
    document.getElementById('s-confirm-btn').disabled = true;
}

function staffUpdateQty(d) {
    staffQty = Math.max(1, staffQty + d);
    document.getElementById('s-qty-val').innerText = staffQty;
    document.getElementById('s-confirm-btn').disabled = staffTempScanned.length !== staffQty;
}

function staffSimHeadphoneScan() {
    if (staffTempScanned.length >= staffQty) return;
    staffTempScanned.push(Math.floor(Math.random()*900)+100);
    document.getElementById('s-temp-scanned-tags').innerHTML = staffTempScanned.map(u => `<span class="tag" style="background:var(--success); color:white;">#SK-${u}</span>`).join('');
    document.getElementById('s-confirm-btn').disabled = staffTempScanned.length !== staffQty;
}

function staffDoIssue() {
    staffActiveUser.units.push(...staffTempScanned);
    db.totalOut += staffTempScanned.length;
    go('s-home');
}

function staffSimReturn() {
    if (!staffActiveUser.units.length) return;
    const ret = staffActiveUser.units.pop();
    db.totalOut--;
    renderStaffUser();
}

function renderDebtors() {
    const list = document.getElementById('s-debtors-list');
    const debtors = db.users.filter(u=>u.units.length > 0);
    list.innerHTML = debtors.length ? '' : '<p style="text-align:center; opacity:0.5;">Wszyscy oddali sprzęt! <i data-lucide="party-popper" style="width:16px; height:16px; vertical-align:middle;"></i></p>';
    debtors.forEach(u => {
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = `<b>${u.name} ${u.surname}</b><br><small>${u.units.length} szt. (#${u.units.join(', #')})</small>`;
        list.appendChild(c);
    });
}