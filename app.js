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

// --- STATE PERSISTENCE ---
function saveState() {
    localStorage.setItem('silent_king_db', JSON.stringify(db));
}

function loadState() {
    const saved = localStorage.getItem('silent_king_db');
    if (saved) {
        const parsed = JSON.parse(saved);
        db = { ...db, ...parsed };
    }
}

// --- TOASTS & VALIDATION ---
function showToast(message, icon = 'info') {
    const container = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<i data-lucide="${icon}" style="width:18px; height:18px;"></i> <span>${message}</span>`;
    container.appendChild(t);
    lucide.createIcons();
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateY(-10px)';
        t.style.transition = 'all 0.3s ease-out';
        setTimeout(() => t.remove(), 300);
    }, 3000);
}

function setFieldInvalid(id, isInvalid) {
    const input = document.getElementById(id);
    const err = document.getElementById(`err-${id}`);
    if (!input) return; // Guard
    if (isInvalid) {
        input.classList.add('invalid');
        if (err) err.style.display = 'block';
    } else {
        input.classList.remove('invalid');
        if (err) err.style.display = 'none';
    }
}

function isValidPhone(phone) {
    // Prosta walidacja: min 9 cyfr, dopuszcza + na początku
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Wykrywanie braku serwera (protokół file://)
if (window.location.protocol === 'file:') {
    document.getElementById('server-warning').style.display = 'block';
}

// --- INITIALIZATION ---
window.onload = () => {
    loadState();
    // Jeśli jest aktywny event, startujemy jako obsługa, jeśli nie - jako klient
    if (db.activeEvent) switchRole('staff');
    else switchRole('client');
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
            showToast(`Błąd ładowania: ${id}. Uruchom serwer HTTP!`, 'server-off');
            return;
        }
    }

    loadedScreens[id].classList.add('active');
    saveState();
    
    // Wait a tick for DOM to register the active class, then call onScreen
    setTimeout(() => onScreen(id), 20);
}

function switchRole(role) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`btn-${role}`).classList.add('active');
    if (role === 'client') go(db.currentUser ? 'c-qr' : 'c-home');
    else go(db.activeEvent ? 's-home' : 's-event-selector');
}

function onScreen(id) {
    if (id === 'c-qr' && db.currentUser) {
        const nameEl = document.getElementById('c-disp-name');
        if (nameEl) nameEl.innerText = `${db.currentUser.name} ${db.currentUser.surname}`;
        
        const phoneEl = document.getElementById('c-disp-phone');
        if (phoneEl) phoneEl.innerText = db.currentUser.phone;
        
        const unitsEl = document.getElementById('c-disp-units');
        if (unitsEl) {
            unitsEl.innerHTML = db.currentUser.units.length 
                ? db.currentUser.units.map(u => `<span class="tag">#SK-${u}</span>`).join('') 
                : 'Brak';
        }
        
        // Realistic QR Code
        const qrImg = document.getElementById('c-qr-img');
        if (qrImg) {
            qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=USER_${db.currentUser.id}&color=1e3a8a`;
            qrImg.style.opacity = '1';
        }
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
    if (id === 's-summary') {
        document.getElementById('sum-p').innerText = db.users.length;
        document.getElementById('sum-h').innerText = db.totalOut;
        document.getElementById('sum-d').innerText = db.users.filter(u=>u.units.length > 0).length;
    }
    lucide.createIcons();
}

// --- CLIENT AUTH ---
function authProcess(type) {
    if (type === 'reg') {
        const name = document.getElementById('reg-name').value.trim();
        const surname = document.getElementById('reg-surname').value.trim();
        const phone = document.getElementById('reg-phone').value.trim();
        
        const nameValid = name.length >= 2;
        const surnameValid = surname.length >= 2;
        const phoneValid = isValidPhone(phone);
        
        setFieldInvalid('reg-name', !nameValid);
        setFieldInvalid('reg-surname', !surnameValid);
        setFieldInvalid('reg-phone', !phoneValid);
        
        if (!nameValid || !surnameValid || !phoneValid) {
            let msg = 'Proszę poprawić błędy w formularzu';
            if (!nameValid || !surnameValid) msg = 'Imię i nazwisko muszą mieć min. 2 znaki';
            else if (!phoneValid) msg = 'Błędny format numeru telefonu';
            
            showToast(msg, 'alert-circle');
            return;
        }
        db.currentUser = { id: Date.now().toString(), name, surname, phone, units: [] };
    } else {
        const phone = document.getElementById('login-phone').value.trim();
        if (!phone || !isValidPhone(phone)) {
            setFieldInvalid('login-phone', true);
            showToast('Podaj poprawny numer telefonu', 'alert-circle');
            return;
        }
        const user = db.users.find(u => u.phone === phone);
        if (!user) {
            setFieldInvalid('login-phone', true);
            showToast('Nie znaleziono konta dla tego numeru', 'user-x');
            return;
        }
        setFieldInvalid('login-phone', false);
        db.currentUser = user;
    }
    go('c-sms');
}

function authFinalize() {
    // Walidacja SMS
    const inputs = document.querySelectorAll('.sms-input');
    let code = '';
    inputs.forEach(i => code += i.value);
    
    if (code !== '1234') {
        showToast('Błędny kod SMS! (użyj 1234)', 'shield-alert');
        inputs.forEach(i => i.style.borderColor = 'var(--danger)');
        return;
    }

    if (!db.users.find(u => u.id === db.currentUser.id)) db.users.push(db.currentUser);
    saveState();
    go('c-qr');
}

function authLogout() { 
    db.currentUser = null; 
    saveState(); 
    go('c-home'); 
}

// --- STAFF EVENT MGMT ---
function staffStartEvent(name) { 
    db.activeEvent = name; 
    saveState(); 
    go('s-home'); 
}

function staffCreateEvent() {
    const nameInput = document.getElementById('new-event');
    if (!nameInput) return;
    const name = nameInput.value;
    
    if (!name) {
        setFieldInvalid('new-event', true);
        showToast('Wpisz nazwę eventu!', 'alert-circle');
        return;
    }
    setFieldInvalid('new-event', false);
    showToast(`Utworzono wydarzenie: ${name}`, 'check-circle');
    staffStartEvent(name);
}

function staffStopEvent() {
    db.activeEvent = null;
    saveState();
    go('s-summary');
}

// --- STAFF USER MGMT ---
function staffDoManualReg() {
    const name = document.getElementById('man-name').value.trim();
    const surname = document.getElementById('man-surname').value.trim();
    const phone = document.getElementById('man-phone').value.trim();
    
    const nameValid = name.length >= 2;
    const surnameValid = surname.length >= 2;
    const phoneValid = isValidPhone(phone);
    
    setFieldInvalid('man-name', !nameValid);
    setFieldInvalid('man-surname', !surnameValid);
    setFieldInvalid('man-phone', !phoneValid);
    
    if (!nameValid || !surnameValid || !phoneValid) {
        showToast('Błędne dane klienta (min. 2 znaki, poprawny tel)!', 'alert-circle');
        return;
    }
    
    const user = { id: Date.now().toString(), name, surname, phone, units: [] };
    db.users.push(user);
    staffActiveUser = user;
    showToast('Klient zarejestrowany pomyślnie!', 'user-check');
    saveState();
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
    saveState();
    go('s-home');
}

function staffSimReturn() {
    if (!staffActiveUser.units.length) return;
    const ret = staffActiveUser.units.pop();
    db.totalOut--;
    saveState();
    renderStaffUser();
}

function renderDebtors() {
    const list = document.getElementById('s-debtors-list');
    const debtors = db.users.filter(u=>u.units.length > 0);
    list.innerHTML = debtors.length ? '' : '<p style="text-align:center; opacity:0.5;">Wszyscy oddali sprzęt! <i data-lucide="party-popper" style="width:16px; height:16px; vertical-align:middle;"></i></p>';
    debtors.forEach(u => {
        const c = document.createElement('div');
        c.className = 'card';
        c.style.display = 'flex';
        c.style.justifyContent = 'space-between';
        c.style.alignItems = 'center';
        c.innerHTML = `
            <div>
                <b style="display:block; margin-bottom:2px;">${u.name} ${u.surname}</b>
                <small style="display:block; color:var(--text-muted); margin-bottom:6px;">${u.phone}</small>
                <div style="display:flex; flex-wrap:wrap; gap:4px;">
                    ${u.units.map(unit => `<span class="tag" style="margin:0; font-size:10px; padding:2px 6px;">#${unit}</span>`).join('')}
                </div>
            </div>
            <a href="tel:${u.phone}" style="width:44px; height:44px; display:flex; align-items:center; justify-content:center; border-radius:12px; background:var(--bg-page); color:var(--primary); text-decoration:none;">
                <i data-lucide="phone" style="width:20px; height:20px;"></i>
            </a>
        `;
        list.appendChild(c);
    });
}