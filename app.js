// --- DB STATE ---
let db = { 
    users: [], // {id, name, surname, phone, units: [], rentalTime: null}
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
    if (!input) return;
    if (isInvalid) {
        input.classList.add('invalid');
        if (err) err.style.display = 'block';
    } else {
        input.classList.remove('invalid');
        if (err) err.style.display = 'none';
    }
}

function isValidPhone(phone) {
    const phoneRegex = /^\+?[0-9]{9,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Wykrywanie braku serwera
if (window.location.protocol === 'file:') {
    document.getElementById('server-warning').style.display = 'block';
}

// --- INITIALIZATION ---
window.onload = () => {
    loadState();
    if (db.activeEvent) switchRole('staff');
    else switchRole('client');
    lucide.createIcons();
};

// --- NAVIGATION ---
async function go(id) {
    const container = document.getElementById('screen-container');
    Object.values(loadedScreens).forEach(el => el.classList.remove('active'));

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
    setTimeout(() => onScreen(id), 50); // Zwiększony timeout dla pewności DOMu
}

function switchRole(role) {
    document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-${role}`);
    if (btn) btn.classList.add('active');
    if (role === 'client') go(db.currentUser ? 'c-qr' : 'c-home');
    else go(db.activeEvent ? 's-home' : 's-event-selector');
}

function onScreen(id) {
    // Zapewnienie renderowania ikon niezależnie od reszty logiki
    lucide.createIcons();

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.innerText = val;
    };
    const setHtml = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
    };

    if (id === 'c-qr' && db.currentUser) {
        setVal('c-disp-name', `${db.currentUser.name} ${db.currentUser.surname}`);
        setVal('c-disp-phone', db.currentUser.phone);
        setHtml('c-disp-units', db.currentUser.units.length 
            ? db.currentUser.units.map(u => `<span class="tag">#SK-${u}</span>`).join('') 
            : 'Brak');

        const timeEl = document.getElementById('c-disp-time');
        if (timeEl) {
            if (db.currentUser.units.length > 0 && db.currentUser.rentalTime) {
                timeEl.innerText = `Wypożyczono: ${db.currentUser.rentalTime}`;
                timeEl.style.display = 'block';
            } else {
                timeEl.style.display = 'none';
            }
        }
        
        const qrImg = document.getElementById('c-qr-img');
        if (qrImg) {
            const qrData = encodeURIComponent(`USER_${db.currentUser.id}`);
            qrImg.src = `https://quickchart.io/qr?text=${qrData}&size=250&dark=1e3a8a`;
            qrImg.onerror = () => {
                qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${qrData}`;
            };
        }
    }
    
    if (id === 's-home') {
        setVal('s-active-event', db.activeEvent);
        setVal('s-stat-out', db.totalOut);
        setVal('s-stat-debtors', db.users.filter(u=>u.units.length > 0).length);
    }

    if (id === 's-scan') {
        const list = document.getElementById('s-sim-users-list');
        if (list) {
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
    }

    if (id === 's-user' && staffActiveUser) renderStaffUser();
    if (id === 's-debtors') renderDebtors();
    if (id === 's-summary') {
        setVal('sum-p', db.users.length);
        setVal('sum-h', db.totalOut);
        setVal('sum-d', db.users.filter(u=>u.units.length > 0).length);
    }
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
            showToast('Błędne dane! Imię/Nazwisko min. 2 znaki, tel poprawny.', 'alert-circle');
            return;
        }
        db.currentUser = { id: Date.now().toString(), name, surname, phone, units: [], rentalTime: null };
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
        db.currentUser = user;
    }
    go('c-sms');
}

function authFinalize() {
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
    const name = nameInput.value.trim();
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
        showToast('Błędne dane klienta!', 'alert-circle');
        return;
    }
    const user = { id: Date.now().toString(), name, surname, phone, units: [], rentalTime: null };
    db.users.push(user);
    staffActiveUser = user;
    showToast('Klient zarejestrowany!', 'user-check');
    saveState();
    go('s-user');
}

function renderStaffUser() {
    setVal('s-user-name-title', `${staffActiveUser.name} ${staffActiveUser.surname}`);
    setVal('s-user-phone-title', staffActiveUser.phone);
    setVal('s-user-has-count', staffActiveUser.units.length);
    setHtml('s-user-has-tags', staffActiveUser.units.map(u => `<span class="tag">#SK-${u}</span>`).join('') || 'Brak');
    const retArea = document.getElementById('s-return-area');
    if (retArea) retArea.style.display = staffActiveUser.units.length > 0 ? 'block' : 'none';
    staffQty = 1; staffTempScanned = [];
    setVal('s-qty-val', "1");
    setHtml('s-temp-scanned-tags', "");
    const btn = document.getElementById('s-confirm-btn');
    if (btn) btn.disabled = true;
}

function staffUpdateQty(d) {
    staffQty = Math.max(1, staffQty + d);
    setVal('s-qty-val', staffQty);
    const btn = document.getElementById('s-confirm-btn');
    if (btn) btn.disabled = staffTempScanned.length !== staffQty;
}

function staffSimHeadphoneScan() {
    if (staffTempScanned.length >= staffQty) return;
    staffTempScanned.push(Math.floor(Math.random()*900)+100);
    setHtml('s-temp-scanned-tags', staffTempScanned.map(u => `<span class="tag" style="background:var(--success); color:white;">#SK-${u}</span>`).join(''));
    const btn = document.getElementById('s-confirm-btn');
    if (btn) btn.disabled = staffTempScanned.length !== staffQty;
}

function staffDoIssue() {
    staffActiveUser.units.push(...staffTempScanned);
    if (!staffActiveUser.rentalTime) {
        const now = new Date();
        staffActiveUser.rentalTime = now.toLocaleDateString('pl-PL') + ' ' + now.toLocaleTimeString('pl-PL', {hour: '2-digit', minute:'2-digit'});
    }
    db.totalOut += staffTempScanned.length;
    saveState();
    go('s-home');
}

function staffSimReturn() {
    if (!staffActiveUser.units.length) return;
    staffActiveUser.units.pop();
    if (staffActiveUser.units.length === 0) staffActiveUser.rentalTime = null;
    db.totalOut--;
    saveState();
    renderStaffUser();
}

function renderDebtors() {
    const list = document.getElementById('s-debtors-list');
    if (!list) return;
    const debtors = db.users.filter(u=>u.units.length > 0);
    list.innerHTML = debtors.length ? '' : '<p style="text-align:center; opacity:0.5;">Wszyscy oddali sprzęt! 🎉</p>';
    debtors.forEach(u => {
        const c = document.createElement('div');
        c.className = 'card';
        c.style.display = 'flex';
        c.style.justifyContent = 'space-between';
        c.style.alignItems = 'center';
        c.innerHTML = `<div><b style="display:block;">${u.name} ${u.surname}</b><small>${u.phone}</small><div style="display:flex; gap:4px; margin-top:4px;">${u.units.map(unit => `<span class="tag" style="font-size:9px;">#${unit}</span>`).join('')}</div></div><a href="tel:${u.phone}" class="btn-secondary" style="width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center;"><i data-lucide="phone" style="width:16px;"></i></a>`;
        list.appendChild(c);
    });
    lucide.createIcons();
}

function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}
function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}