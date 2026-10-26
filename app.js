// ============ FIREBASE CONFIG ============
const firebaseConfig = {
  apiKey: "AIzaSyBxHSuyY76Z-Xaef3Lyyjsd1coAd-BYjdU",
  authDomain: "app-gym-80335.firebaseapp.com",
  projectId: "app-gym-80335",
  storageBucket: "app-gym-80335.firebasestorage.app",
  messagingSenderId: "273259998120",
  appId: "1:273259998120:web:3ae75a63a3b03ac7c00b9d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence().catch(() => {});

// ============ DEFAULT DATA ============
const DEFAULT_DATA = {
  activeRoutine: 0,
  routines: [
    {
      name: "Mi rutina",
      exercises: []
    }
  ]
};

const ADMIN_EMAIL = 'martatorresg15@gmail.com';

// ============ ICONS ============
const svg = (body, width = 2) =>
  `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

const ICONS = {
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 3),
  plus: svg('<path d="M12 5v14M5 12h14"/>', 2.5),
  trophy: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4"/>', 2.5),
  edit: svg('<path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/>'),
  trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
  restore: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/>'),
  history: svg('<path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2"/>'),
  chart: svg('<path d="M4 20V4M4 20h16M8 15l4-4 3 3 5-6"/>'),
  users: svg('<circle cx="9" cy="8" r="4"/><path d="M2 21c1-4 3.5-6 7-6s6 2 7 6M16 4a4 4 0 0 1 0 8M22 21c-.5-2.5-2-4.5-4-5.5"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  dumbbell: svg('<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>', 2.2),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
  chevronLeft: svg('<path d="M15 6l-6 6 6 6"/>', 2.5),
  chevronRight: svg('<path d="M9 6l6 6-6 6"/>', 2.5),
  arrowUp: svg('<path d="M12 19V5M6 11l6-6 6 6"/>', 2.8),
  arrowDown: svg('<path d="M12 5v14M6 13l6 6 6-6"/>', 2.8)
};

// ============ THEME ============
// The initial theme is applied in index.html; a choice made here is remembered
const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');

function getSavedTheme() {
  try { return localStorage.getItem('theme'); } catch (_) { return null; }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.getElementById('theme-color').content = theme === 'dark' ? '#0F110E' : '#EEF0EC';
  const btn = document.getElementById('theme-toggle');
  if (btn) {
    const label = theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    btn.innerHTML = theme === 'dark' ? ICONS.sun : ICONS.moon;
    btn.title = label;
    btn.setAttribute('aria-label', label);
  }
  render();
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem('theme', next); } catch (_) {}
  applyTheme(next);
}

let data = null;
let currentUser = null;
let isAdmin = false;
let isApproved = false;
let unsubscribeData = null;
let unsubscribeProfile = null;

// ============ AUTH ============
function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Rellena todos los campos';
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => {
      const messages = {
        'auth/user-not-found': 'No existe una cuenta con ese email',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/invalid-email': 'Email no válido',
        'auth/invalid-credential': 'Email o contraseña incorrectos',
        'auth/too-many-requests': 'Demasiados intentos, espera un momento'
      };
      errorEl.textContent = messages[err.code] || 'Error: ' + err.message;
    });
}

function handleRegister() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Rellena todos los campos';
    return;
  }

  if (password.length < 6) {
    errorEl.textContent = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      // Create profile as pending (admin is auto-approved)
      const userEmail = cred.user.email;
      const approved = userEmail === ADMIN_EMAIL;
      return db.collection('profiles').doc(cred.user.uid).set({
        email: userEmail,
        approved: approved,
        createdAt: todayStr()
      });
    })
    .catch(err => {
      const messages = {
        'auth/email-already-in-use': 'Ya existe una cuenta con ese email',
        'auth/invalid-email': 'Email no válido',
        'auth/weak-password': 'La contraseña es muy débil (mín. 6 caracteres)'
      };
      errorEl.textContent = messages[err.code] || 'Error: ' + err.message;
    });
}

function handleLogout() {
  if (confirm('¿Cerrar sesión?')) {
    if (unsubscribeData) unsubscribeData();
    if (unsubscribeProfile) unsubscribeProfile();
    auth.signOut();
  }
}

// Listen for auth state changes
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    isAdmin = user.email === ADMIN_EMAIL;
    document.getElementById('login-screen').style.display = 'none';
    checkApproval();
  } else {
    currentUser = null;
    data = null;
    isAdmin = false;
    isApproved = false;
    if (unsubscribeData) unsubscribeData();
    if (unsubscribeProfile) unsubscribeProfile();
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app-container').style.display = 'none';
    document.getElementById('pending-screen').style.display = 'none';
  }
});

function checkApproval() {
  const profileRef = db.collection('profiles').doc(currentUser.uid);
  unsubscribeProfile = profileRef.onSnapshot(doc => {
    if (!doc.exists) {
      // Profile doesn't exist yet (old user or admin) - create it
      const approved = currentUser.email === ADMIN_EMAIL;
      profileRef.set({
        email: currentUser.email,
        approved: approved,
        createdAt: todayStr()
      });
      return;
    }

    const profile = doc.data();
    isApproved = profile.approved === true;

    if (isApproved) {
      document.getElementById('pending-screen').style.display = 'none';
      document.getElementById('app-container').style.display = 'block';
      if (!unsubscribeData) listenToUserData();
    } else {
      document.getElementById('app-container').style.display = 'none';
      document.getElementById('pending-screen').style.display = 'flex';
    }
  });
}

// ============ ADMIN: Approve users ============
function openAdminPanel() {
  db.collection('profiles').where('approved', '==', false).get().then(snapshot => {
    let listHtml = '';
    if (snapshot.empty) {
      listHtml = '<p class="empty-list">No hay solicitudes pendientes</p>';
    } else {
      snapshot.forEach(doc => {
        const p = doc.data();
        listHtml += `
          <div class="history-item">
            <div>
              <div class="history-date">${escapeHtml(p.email)}</div>
              <div class="history-sub">Registro: ${escapeHtml(p.createdAt || '?')}</div>
            </div>
            <button class="btn-small" onclick="approveUser('${doc.id}')">Aprobar</button>
          </div>`;
      });
    }

    openModal(`
      <h2>Solicitudes pendientes</h2>
      <div class="history-list">${listHtml}</div>
      <button class="btn-secondary" onclick="closeModal()" style="margin-top:16px">Cerrar</button>
    `);
  });
}

function approveUser(uid) {
  db.collection('profiles').doc(uid).update({ approved: true }).then(() => {
    toast('Usuario aprobado');
    openAdminPanel();
  });
}

// ============ FIRESTORE DATA ============
function getUserDocRef() {
  return db.collection('users').doc(currentUser.uid);
}

function listenToUserData() {
  const docRef = getUserDocRef();
  unsubscribeData = docRef.onSnapshot(doc => {
    if (doc.exists) {
      data = doc.data();
      if (!data.trash) data.trash = [];
      if (!data.activities) data.activities = [];
    } else {
      data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      data.trash = [];
      data.activities = [];
      data.checksDate = todayStr();
      docRef.set(data);
    }
    if (data.checksDate !== todayStr()) resetDailyChecks();
    render();
  }, err => {
    console.error('Firestore error:', err);
    if (!data) {
      data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      data.trash = [];
      data.activities = [];
      render();
    }
  });
}

function saveData(d) {
  if (!currentUser) return;
  getUserDocRef().set(d).catch(err => console.error('Save error:', err));
}

// ============ STATS ============
function getStats() {
  const routine = data.routines[data.activeRoutine];
  const total = routine.exercises.length;
  const done = routine.exercises.filter(e => e.done).length;
  const totalLogs = routine.exercises.reduce((sum, e) => sum + e.logs.length, 0);
  const pct = total ? Math.round((done / total) * 100) : 0;
  return { total, done, totalLogs, pct };
}

// ============ RENDER ============
function render() {
  if (!data) return;
  renderNav();
  renderStats();
  renderHeader();
  renderExercises();
  renderCalendar();
}

// ============ VIEWS ============
let currentView = 'routine';

function switchView(view) {
  currentView = view;
  document.getElementById('view-routine').hidden = view !== 'routine';
  document.getElementById('view-calendar').hidden = view !== 'calendar';
  document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.getElementById('fab').setAttribute('aria-label', view === 'calendar' ? 'Añadir entreno' : 'Añadir ejercicio');
  window.scrollTo(0, 0);
  render();
}

function onFabClick() {
  if (currentView === 'calendar') openAddActivity(selectedDate);
  else openAddExercise();
}

function renderNav() {
  const container = document.getElementById('routine-tabs');
  let html = data.routines.map((r, i) => {
    const label = escapeHtml(r.name.split(' ').slice(0, 2).join(' '));
    return `<button class="nav-tab ${i === data.activeRoutine ? 'active' : ''}" onclick="switchTab(${i})">${label}</button>`;
  }).join('');
  html += `<button class="nav-tab nav-tab-add" onclick="openAddRoutine()" aria-label="Nueva rutina">${ICONS.plus}</button>`;
  container.innerHTML = html;
}

const RING_LENGTH = 2 * Math.PI * 27;

function renderStats() {
  const s = getStats();
  const container = document.getElementById('stats-row');
  if (!s.total) {
    container.innerHTML = '';
    return;
  }
  const left = s.total - s.done;
  let title = 'A por ello';
  if (s.done === s.total) title = '¡Rutina completada!';
  else if (s.done * 2 === s.total) title = 'Vas por la mitad';
  else if (s.done * 2 > s.total) title = 'Ya casi está';
  else if (s.done > 0) title = 'Buen comienzo';
  const sub = left === 0
    ? 'Todo registrado por hoy'
    : `Te ${left === 1 ? 'queda 1 ejercicio' : `quedan ${left} ejercicios`} de hoy`;

  container.innerHTML = `
    <div class="progress-card">
      <svg class="progress-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle class="ring-track" cx="32" cy="32" r="27"/>
        <circle class="ring-bar" cx="32" cy="32" r="27" transform="rotate(-90 32 32)"
          stroke-dasharray="${RING_LENGTH.toFixed(1)}" stroke-dashoffset="${(RING_LENGTH * (1 - s.done / s.total)).toFixed(1)}"/>
        <text x="32" y="37" text-anchor="middle">${s.done}/${s.total}</text>
      </svg>
      <div class="progress-text">
        <span class="progress-title">${title}</span>
        <span class="progress-sub">${sub}</span>
        <span class="progress-sub">${s.totalLogs} registros en esta rutina</span>
      </div>
    </div>
  `;
}

function renderHeader() {
  const routine = data.routines[data.activeRoutine];
  document.getElementById('routine-header').innerHTML = `
    <span class="routine-title">${escapeHtml(routine.name)}</span>
    <div class="routine-actions">
      ${isAdmin ? `<button class="btn-icon" onclick="openAdminPanel()" aria-label="Solicitudes pendientes">${ICONS.users}</button>` : ''}
      <button class="btn-icon" onclick="openTrash()" aria-label="Papelera">${ICONS.restore}</button>
      <button class="btn-icon" onclick="openEditRoutine()" aria-label="Editar rutina">${ICONS.edit}</button>
      ${data.routines.length > 1 ? `<button class="btn-icon danger" onclick="deleteRoutine()" aria-label="Eliminar rutina">${ICONS.trash}</button>` : ''}
    </div>
  `;
}

function renderExercises() {
  const container = document.getElementById('exercises');
  const routine = data.routines[data.activeRoutine];

  if (!routine.exercises.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${ICONS.dumbbell}</div>
        <strong>No hay ejercicios todavía</strong>
        <p>Pulsa + para añadir uno</p>
      </div>`;
    return;
  }

  let exercisesHtml = routine.exercises.map((ex, i) => {
    const lastLog = ex.logs.length ? ex.logs[ex.logs.length - 1] : null;
    const unit = ex.unit || 'kg';
    return `
      <div class="exercise-card ${ex.done ? 'done' : ''}" data-index="${i}">
        <div class="exercise-top">
          <button class="exercise-check" onclick="toggleDone(${i})" aria-label="Marcar como hecho">${ICONS.check}</button>
          <div class="exercise-info">
            <div class="exercise-name">
              ${escapeHtml(ex.name)}
              ${isPersonalRecord(ex) ? `<span class="pr-badge">${ICONS.trophy}RÉCORD</span>` : ''}
            </div>
            <div class="exercise-meta">${escapeHtml(ex.sets)} series · ${escapeHtml(ex.reps)} reps</div>
          </div>
          <div class="exercise-weight"><b>${escapeHtml(ex.weight)}</b><small>${escapeHtml(unit)}</small></div>
        </div>
        ${lastLog ? `
          <div class="last-log">
            <span class="last-log-date">Último · ${formatShortDate(lastLog.date)}</span>
            <span class="last-log-reps">${formatLogDetail(lastLog, unit)}</span>
          </div>
        ` : ''}
        <div class="exercise-actions">
          <button class="btn-log" onclick="openLogModal(${i})">
            ${ex.done ? `${ICONS.check} Registrar otra vez` : `${ICONS.plus} Registrar entreno`}
          </button>
          <button class="btn-history" onclick="openHistory(${i})" aria-label="Ver historial">${ICONS.history}</button>
        </div>
      </div>`;
  }).join('');

  // Chart section with exercise selector
  const exercisesWithLogs = routine.exercises.filter(ex => ex.logs.length > 0);
  if (exercisesWithLogs.length > 0) {
    const options = routine.exercises.map((ex, i) =>
      ex.logs.length > 0 ? `<option value="${i}">${escapeHtml(ex.name)}</option>` : ''
    ).join('');
    exercisesHtml += `
      <div class="chart-section">
        <h3 class="chart-section-title">${ICONS.chart} Gráficas de progreso</h3>
        <select class="chart-exercise-select" id="chart-exercise-select" onchange="loadRoutineChart()">
          ${options}
        </select>
        <div class="chart-tabs" id="routine-chart-tabs">
          <button class="chart-tab active" onclick="switchRoutineChart('weight', this)">Peso</button>
          <button class="chart-tab" onclick="switchRoutineChart('reps', this)">Reps Media</button>
          <button class="chart-tab" onclick="switchRoutineChart('volume', this)">Volumen</button>
        </div>
        <div class="chart-container">
          <canvas id="routine-chart"></canvas>
        </div>
      </div>`;
  }

  container.innerHTML = exercisesHtml;

  // Build chart if there are exercises with logs
  if (exercisesWithLogs.length > 0) {
    setTimeout(() => loadRoutineChart(), 50);
  }
}

function formatLogDetail(log, unit) {
  unit = escapeHtml(unit);
  if (log.weights) {
    const allSame = log.weights.every(w => w === log.weights[0]);
    if (allSame) {
      return `${escapeHtml(log.weights[0])} ${unit} × ${log.reps.join(' · ')}`;
    }
    const parts = log.weights.map((w, i) => `${escapeHtml(w)}×${log.reps[i]}`);
    return `${parts.join(' · ')} ${unit}`;
  }
  return `${escapeHtml(log.weight)} ${unit} × ${log.reps.join(' · ')}`;
}

function logMaxWeight(log) {
  if (log.weights) return Math.max(...log.weights.map(Number));
  return Number(log.weight);
}

// The latest log beats every earlier one on max weight
function isPersonalRecord(ex) {
  const unit = ex.unit || 'kg';
  if ((unit !== 'kg' && unit !== 'bloques') || ex.logs.length < 2) return false;
  const last = logMaxWeight(ex.logs[ex.logs.length - 1]);
  const best = Math.max(...ex.logs.slice(0, -1).map(logMaxWeight));
  return last > best;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const label = `${parseInt(d)} ${MONTHS[parseInt(m) - 1]}`;
  return parseInt(y) === new Date().getFullYear() ? label : `${label} ${y}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ============ ACTIONS ============
function switchTab(i) {
  data.activeRoutine = i;
  saveData(data);
}

function toggleDone(i) {
  data.routines[data.activeRoutine].exercises[i].done = !data.routines[data.activeRoutine].exercises[i].done;
  saveData(data);
}

function deleteExercise(i) {
  if (confirm('¿Eliminar este ejercicio?')) {
    const removed = data.routines[data.activeRoutine].exercises.splice(i, 1)[0];
    if (!data.trash) data.trash = [];
    data.trash.push({ routineIndex: data.activeRoutine, exercise: removed, deletedAt: todayStr() });
    if (data.trash.length > 20) data.trash.shift();
    saveData(data);
    toast('Eliminado (puedes restaurar desde papelera)');
  }
}

function openTrash() {
  const items = (data.trash || []).filter(t => t.routineIndex === data.activeRoutine).reverse();
  const listHtml = items.length
    ? items.map((t, i) => {
        const realIndex = (data.trash || []).length - 1 - i;
        return `
          <div class="history-item">
            <div>
              <div class="history-date">${escapeHtml(t.exercise.name)}</div>
              <div class="history-sub">Eliminado: ${formatShortDate(t.deletedAt)}</div>
            </div>
            <button class="btn-small" onclick="restoreExercise(${realIndex})">Restaurar</button>
          </div>`;
      }).join('')
    : '<p class="empty-list">La papelera está vacía</p>';

  openModal(`
    <h2>Papelera</h2>
    <div class="history-list">${listHtml}</div>
    <button class="btn-secondary" onclick="closeModal()" style="margin-top:16px">Cerrar</button>
  `);
}

function restoreExercise(trashIndex) {
  const item = data.trash[trashIndex];
  data.routines[item.routineIndex].exercises.push(item.exercise);
  data.trash.splice(trashIndex, 1);
  saveData(data);
  closeModal();
  toast('Ejercicio restaurado');
}

function deleteRoutine() {
  if (confirm(`¿Eliminar "${data.routines[data.activeRoutine].name}"?`)) {
    data.routines.splice(data.activeRoutine, 1);
    data.activeRoutine = 0;
    saveData(data);
  }
}

// ============ MODALS ============
function openModal(content) {
  const overlay = document.getElementById('modal-overlay');
  document.getElementById('modal-content').innerHTML = content;
  overlay.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
}

// Log workout
function openLogModal(exIndex) {
  const ex = data.routines[data.activeRoutine].exercises[exIndex];
  const unit = ex.unit || 'kg';
  const isNumericUnit = (unit === 'kg' || unit === 'bloques');
  const inputType = isNumericUnit ? 'number' : 'text';
  const inputAttrs = isNumericUnit ? 'inputmode="decimal" step="0.5"' : '';

  let seriesHtml = '';
  for (let s = 0; s < ex.sets; s++) {
    seriesHtml += `
      <div class="series-row">
        <span class="series-label">Serie ${s + 1}</span>
        <input type="${inputType}" ${inputAttrs} placeholder="${escapeHtml(unit)}" id="weight-${s}" value="${escapeHtml(ex.weight)}" class="series-weight">
        <span class="series-x">×</span>
        <input type="number" inputmode="numeric" placeholder="reps" id="rep-${s}" class="series-reps">
      </div>`;
  }

  openModal(`
    <h2>Registrar: ${escapeHtml(ex.name)}</h2>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="log-date" value="${todayStr()}">
    </div>
    <div class="form-group">
      <div class="series-header">
        <span></span><span>Peso (${escapeHtml(unit)})</span><span></span><span>Reps</span>
      </div>
      ${seriesHtml}
    </div>
    <button class="btn-primary" onclick="saveLog(${exIndex})">Guardar</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function saveLog(exIndex) {
  const ex = data.routines[data.activeRoutine].exercises[exIndex];
  const unit = ex.unit || 'kg';
  const isNumeric = (unit === 'kg' || unit === 'bloques');
  const weights = [];
  const reps = [];
  for (let s = 0; s < ex.sets; s++) {
    const rawW = document.getElementById(`weight-${s}`).value.trim();
    const w = isNumeric ? parseFloat(rawW) : rawW;
    const r = document.getElementById(`rep-${s}`).value;
    if (w && r) {
      weights.push(w);
      reps.push(parseInt(r));
    }
  }

  if (!reps.length) {
    toast('Rellena al menos una serie');
    return;
  }

  const logDate = document.getElementById('log-date').value || todayStr();
  ex.logs.push({ date: logDate, weights, reps });
  ex.logs.sort((a, b) => a.date.localeCompare(b.date));
  ex.weight = weights[0];
  ex.done = true;
  saveData(data);
  closeModal();
  toast('Entreno guardado');
}

// Add exercise
function openAddExercise() {
  openModal(`
    <h2>Nuevo ejercicio</h2>
    <div class="form-group">
      <label>Nombre del ejercicio</label>
      <input type="text" id="new-ex-name" placeholder="Ej: Press Banca">
    </div>
    <div class="form-group">
      <label>Número de series</label>
      <input type="number" inputmode="numeric" id="new-ex-sets" value="3">
    </div>
    <div class="form-group">
      <label>Rango de repeticiones</label>
      <input type="text" id="new-ex-reps" placeholder="Ej: 8-12">
    </div>
    <div class="form-group">
      <label>Unidad de carga</label>
      <select id="new-ex-unit">
        <option value="kg">kg</option>
        <option value="bloques">bloques</option>
        <option value="goma">goma</option>
      </select>
    </div>
    <div class="form-group">
      <label>Peso / Carga inicial</label>
      <input type="text" inputmode="decimal" id="new-ex-weight" value="0">
    </div>
    <button class="btn-primary" onclick="saveNewExercise()">Añadir</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function saveNewExercise() {
  const name = document.getElementById('new-ex-name').value.trim();
  const sets = parseInt(document.getElementById('new-ex-sets').value) || 3;
  const reps = document.getElementById('new-ex-reps').value.trim() || '8-12';
  const unit = document.getElementById('new-ex-unit').value;
  const rawWeight = document.getElementById('new-ex-weight').value.trim();
  const weight = (unit === 'kg' || unit === 'bloques') ? (parseFloat(rawWeight) || 0) : (rawWeight || '0');

  if (!name) {
    toast('Escribe un nombre');
    return;
  }

  data.routines[data.activeRoutine].exercises.push({
    name, sets, reps, weight, unit, done: false, logs: []
  });
  saveData(data);
  closeModal();
  toast('Ejercicio añadido');
}

// Add / Edit routine
function openAddRoutine() {
  openModal(`
    <h2>Nueva rutina</h2>
    <div class="form-group">
      <label>Nombre de la rutina</label>
      <input type="text" id="new-routine-name" placeholder="Ej: Día D - Cardio">
    </div>
    <button class="btn-primary" onclick="saveNewRoutine()">Crear</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function saveNewRoutine() {
  const name = document.getElementById('new-routine-name').value.trim();
  if (!name) { toast('Escribe un nombre'); return; }
  data.routines.push({ name, exercises: [] });
  data.activeRoutine = data.routines.length - 1;
  saveData(data);
  closeModal();
  toast('Rutina creada');
}

function openEditRoutine() {
  const routine = data.routines[data.activeRoutine];
  openModal(`
    <h2>Editar rutina</h2>
    <div class="form-group">
      <label>Nombre</label>
      <input type="text" id="edit-routine-name" value="${escapeHtml(routine.name)}">
    </div>
    <button class="btn-primary" onclick="saveEditRoutine()">Guardar</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function saveEditRoutine() {
  const name = document.getElementById('edit-routine-name').value.trim();
  if (!name) { toast('Escribe un nombre'); return; }
  data.routines[data.activeRoutine].name = name;
  saveData(data);
  closeModal();
}

// History
let historyChart = null;

function openHistory(exIndex) {
  const ex = data.routines[data.activeRoutine].exercises[exIndex];
  const unit = ex.unit || 'kg';
  const logs = [...ex.logs].reverse();

  let listHtml = logs.length
    ? `<div class="history-table">
        <div class="history-table-head">
          <span>Fecha</span>
          <span>Series</span>
          <span>Peso</span>
        </div>
        ${logs.map((log, li) => {
          const realIndex = ex.logs.length - 1 - li;
          const seriesStr = log.reps.join(' - ');
          const weightStr = escapeHtml(log.weights
            ? (log.weights.every(w => w === log.weights[0]) ? `${log.weights[0]} ${unit}` : log.weights.map(w => `${w}`).join(' - ') + ` ${unit}`)
            : `${log.weight} ${unit}`);
          return `
            <div class="history-table-row">
              <span class="history-cell-date">${formatDate(log.date)}</span>
              <span class="history-cell-series">${seriesStr}</span>
              <span class="history-cell-weight">${weightStr}</span>
              <button class="history-delete" onclick="deleteLog(${exIndex}, ${realIndex})" aria-label="Borrar registro">${ICONS.close}</button>
            </div>`;
        }).join('')}
      </div>`
    : '<p class="empty-list">Sin registros todavía</p>';

  openModal(`
    <h2>${escapeHtml(ex.name)}</h2>
    <div class="history-list">${listHtml}</div>
    <button class="btn-secondary" onclick="closeModal()" style="margin-top:16px">Cerrar</button>
    <button class="btn-danger-full" onclick="deleteExercise(${exIndex})">Eliminar ejercicio</button>
  `);
}

let currentChartType = 'weight';

function loadRoutineChart() {
  const select = document.getElementById('chart-exercise-select');
  if (!select) return;
  const exIndex = parseInt(select.value);
  currentChartType = 'weight';
  const tabs = document.querySelectorAll('#routine-chart-tabs .chart-tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (tabs[0]) tabs[0].classList.add('active');
  buildRoutineChart(currentChartType, exIndex);
}

function switchRoutineChart(type, btn) {
  currentChartType = type;
  const tabs = document.querySelectorAll('#routine-chart-tabs .chart-tab');
  tabs.forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  const select = document.getElementById('chart-exercise-select');
  const exIndex = parseInt(select.value);
  buildRoutineChart(type, exIndex);
}

function buildRoutineChart(type, exIndex) {
  const ex = data.routines[data.activeRoutine].exercises[exIndex];
  if (!ex) return;
  const unit = ex.unit || 'kg';
  const isNumeric = (unit === 'kg' || unit === 'bloques');
  const chartLogs = [...ex.logs];
  const labels = chartLogs.map(l => formatDate(l.date));
  const weights = isNumeric ? chartLogs.map(logMaxWeight) : [];
  const avgReps = chartLogs.map(l => {
    const sum = l.reps.reduce((a, b) => a + b, 0);
    return +(sum / l.reps.length).toFixed(1);
  });
  const totalReps = chartLogs.map(l => l.reps.reduce((a, b) => a + b, 0));
  buildChart(type, labels, weights, avgReps, totalReps, unit, isNumeric);
}

function buildChart(type, labels, weights, avgReps, totalReps, unit, isNumeric) {
  if (historyChart) historyChart.destroy();

  const ctx = document.getElementById('routine-chart');
  if (!ctx) return;

  const configs = {
    weight: { data: weights, label: `Peso (${unit})` },
    reps: { data: avgReps, label: 'Reps media por serie' },
    volume: { data: totalReps, label: 'Reps totales' }
  };

  // Chart colors come from the CSS theme tokens (light / dark)
  const css = getComputedStyle(document.documentElement);
  const token = name => css.getPropertyValue(name).trim();
  const lineColor = token('--chart-line');
  const fillColor = token('--chart-fill');
  const gridColor = token('--chart-grid');
  const tickColor = token('--chart-tick');
  const font = { family: token('--font'), size: 10, weight: '600' };

  if (type === 'weight' && !isNumeric) {
    type = 'reps';
    const tabs = document.querySelectorAll('#routine-chart-tabs .chart-tab');
    tabs.forEach(t => t.classList.remove('active'));
    if (tabs[1]) tabs[1].classList.add('active');
  }

  const cfg = configs[type];

  historyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: cfg.label,
        data: cfg.data,
        borderColor: lineColor,
        backgroundColor: context => {
          const { ctx: c, chartArea } = context.chart;
          if (!chartArea) return fillColor;
          const gradient = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, fillColor);
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          return gradient;
        },
        borderWidth: 2.5,
        pointBackgroundColor: lineColor,
        pointBorderColor: token('--bg-card'),
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: token('--tab-active-bg'),
          titleColor: token('--tab-active-fg'),
          bodyColor: token('--tab-active-fg'),
          cornerRadius: 10,
          padding: 10,
          displayColors: false,
          titleFont: { family: font.family, weight: '600', size: 11 },
          bodyFont: { family: font.family, weight: '800', size: 14 }
        }
      },
      scales: {
        x: {
          ticks: { color: tickColor, font },
          grid: { display: false },
          border: { display: false }
        },
        y: {
          ticks: { color: tickColor, font },
          grid: { color: gridColor },
          border: { display: false },
          beginAtZero: false
        }
      }
    }
  });
}

function deleteLog(exIndex, logIndex) {
  const ex = data.routines[data.activeRoutine].exercises[exIndex];
  ex.logs.splice(logIndex, 1);
  saveData(data);
  openHistory(exIndex);
  toast('Registro eliminado');
}

// ============ CALENDAR ============
// Gym days come from exercise logs; other workouts are stored in data.activities
const ACTIVITY_TYPES = {
  gym: { label: 'Gym', color: 'var(--act-gym)' },
  bike: { label: 'Bici', color: 'var(--act-bike)' },
  hyrox: { label: 'Hyrox', color: 'var(--act-hyrox)' },
  other: { label: 'Otro', color: 'var(--act-other)' }
};

const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MONTH_NAMES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const DAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

let calendarMonth = null;
let selectedDate = todayStr();
let newActivityType = 'bike';

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function activityType(type) {
  return ACTIVITY_TYPES[type] ? type : 'other';
}

function getTrainingDays() {
  const days = new Map();
  const dayFor = date => {
    if (!days.has(date)) days.set(date, { types: new Set(), gym: new Map(), activities: [] });
    return days.get(date);
  };

  data.routines.forEach(r => r.exercises.forEach(ex => ex.logs.forEach(log => {
    const day = dayFor(log.date);
    day.types.add('gym');
    if (!day.gym.has(r.name)) day.gym.set(r.name, []);
    day.gym.get(r.name).push(ex.name);
  })));

  (data.activities || []).forEach((a, index) => {
    const day = dayFor(a.date);
    day.types.add(activityType(a.type));
    day.activities.push({ ...a, index });
  });

  return days;
}

// Ring around the day: one color, or one segment per workout with small gaps
function dayRing(types) {
  const colors = Object.keys(ACTIVITY_TYPES).filter(t => types.has(t)).map(t => ACTIVITY_TYPES[t].color);
  if (colors.length === 1) return colors[0];
  const step = 100 / colors.length;
  const gap = 2;
  const segments = colors.map((c, i) =>
    `transparent ${i * step}% ${i * step + gap / 2}%, ${c} ${i * step + gap / 2}% ${(i + 1) * step - gap / 2}%, transparent ${(i + 1) * step - gap / 2}% ${(i + 1) * step}%`
  );
  return `conic-gradient(${segments.join(', ')})`;
}

function renderCalendar() {
  const container = document.getElementById('calendar');
  if (!calendarMonth) {
    const now = new Date();
    calendarMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const today = todayStr();
  const days = getTrainingDays();

  const stats = monthStats(days, year, month);
  const trained = stats.trained;
  const prev = monthStats(days, year, month - 1).trained;
  const prevName = MONTH_NAMES[(month + 11) % 12];
  let compare;
  if (!prev) {
    compare = `<span class="month-compare-note">Sin entrenos en ${prevName}</span>`;
  } else {
    const pct = Math.round((trained - prev) / prev * 100);
    const trend = pct > 0 ? 'up' : pct < 0 ? 'down' : 'flat';
    const arrow = pct > 0 ? ICONS.arrowUp : pct < 0 ? ICONS.arrowDown : '';
    compare = `
      <span class="trend trend-${trend}">${arrow}${pct > 0 ? '+' : ''}${pct} %</span>
      <span class="month-compare-note">vs ${prevName} (${prev} ${prev === 1 ? 'día' : 'días'})</span>`;
  }

  let cells = WEEKDAYS.map(w => `<span class="cal-weekday">${w}</span>`).join('');
  cells += '<span></span>'.repeat(offset);
  for (let d = 1; d <= daysInMonth; d++) {
    const key = dateKey(year, month, d);
    const info = days.get(key);
    const classes = ['cal-day'];
    if (info) classes.push('trained');
    if (key === today) classes.push('today');
    if (key === selectedDate) classes.push('selected');
    if (key > today) classes.push('future');
    const style = info ? ` style="--ring:${dayRing(info.types)}"` : '';
    cells += `<button class="${classes.join(' ')}"${style} onclick="selectDay('${key}')">${d}</button>`;
  }

  const legend = Object.values(ACTIVITY_TYPES).map(t =>
    `<span><span class="act-dot" style="background:${t.color}"></span>${t.label}</span>`
  ).join('');

  container.innerHTML = `
    <div class="calendar-head">
      <button class="calendar-title" onclick="goToToday()">${MONTH_NAMES[month]} ${year}</button>
      <div class="calendar-nav">
        <button class="btn-icon" onclick="changeMonth(-1)" aria-label="Mes anterior">${ICONS.chevronLeft}</button>
        <button class="btn-icon" onclick="changeMonth(1)" aria-label="Mes siguiente">${ICONS.chevronRight}</button>
      </div>
    </div>
    <div class="month-summary">
      <div class="month-total"><b>${trained}</b><span>${trained === 1 ? 'día entrenado' : 'días entrenados'}</span></div>
      <div class="month-compare">${compare}</div>
    </div>
    <div class="calendar-card">
      <div class="calendar-grid">${cells}</div>
      <div class="calendar-legend">${legend}</div>
    </div>
    ${renderDayDetail(selectedDate, days.get(selectedDate))}
    ${renderMonthReport(days, year, month, stats)}
  `;
}

// Days trained in a month, per kind of workout and per gym routine
function monthStats(days, year, month) {
  const first = new Date(year, month, 1);
  year = first.getFullYear();
  month = first.getMonth();
  const stats = { trained: 0, types: {}, minutes: {}, routines: new Map() };
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const info = days.get(dateKey(year, month, d));
    if (!info) continue;
    stats.trained++;
    info.types.forEach(t => stats.types[t] = (stats.types[t] || 0) + 1);
    info.gym.forEach((_, name) => stats.routines.set(name, (stats.routines.get(name) || 0) + 1));
    // Gym added by hand (no exercises logged that day)
    if (info.types.has('gym') && !info.gym.size) {
      stats.routines.set('Gym', (stats.routines.get('Gym') || 0) + 1);
    }
    info.activities.forEach(a => {
      const t = activityType(a.type);
      stats.minutes[t] = (stats.minutes[t] || 0) + (Number(a.minutes) || 0);
    });
  }
  return stats;
}

function renderMonthReport(days, year, month, stats) {
  // One row per routine (in routine order), then the other workouts
  const routineOrder = data.routines.map(r => r.name);
  const routineRows = [...stats.routines.entries()]
    .sort((a, b) => {
      const ia = routineOrder.indexOf(a[0]);
      const ib = routineOrder.indexOf(b[0]);
      return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
    })
    .map(([name, count]) => ({ name, count, color: ACTIVITY_TYPES.gym.color, minutes: 0 }));
  const otherRows = Object.keys(ACTIVITY_TYPES)
    .filter(t => t !== 'gym' && stats.types[t])
    .map(t => ({ name: ACTIVITY_TYPES[t].label, count: stats.types[t], color: ACTIVITY_TYPES[t].color, minutes: stats.minutes[t] }));
  const rows = [...routineRows, ...otherRows];
  const maxCount = Math.max(1, ...rows.map(r => r.count));

  const rowsHtml = rows.map(r => `
    <div class="report-row">
      <div class="report-row-head">
        <span class="report-row-name"><span class="act-dot" style="background:${r.color}"></span>${escapeHtml(r.name)}</span>
        <span class="report-row-value">${r.count} <small>${r.count === 1 ? 'día' : 'días'}${r.minutes ? ` · ${r.minutes} min` : ''}</small></span>
      </div>
      <div class="report-track"><div class="report-bar" style="width:${(r.count / maxCount * 100).toFixed(1)}%;background:${r.color}"></div></div>
    </div>`).join('');

  // Last 6 months, stacked by kind of workout (a day with two workouts counts twice)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(year, month - i, 1);
    months.push({ date, types: monthStats(days, date.getFullYear(), date.getMonth()).types });
  }
  const totals = months.map(m => Object.values(m.types).reduce((a, b) => a + b, 0));
  // Headroom so the tallest column still fits its total above it
  const maxTotal = Math.max(1, ...totals) * 1.2;

  const columns = months.map((m, i) => {
    const name = MONTH_NAMES[m.date.getMonth()];
    const parts = Object.keys(ACTIVITY_TYPES).filter(t => m.types[t]);
    const segments = parts.map(t =>
      `<span class="month-col-seg" style="height:calc(${(m.types[t] / maxTotal * 100).toFixed(1)}% - 2px);background:${ACTIVITY_TYPES[t].color}"></span>`
    ).join('');
    const detail = parts.map(t => `${ACTIVITY_TYPES[t].label} ${m.types[t]}`).join(', ');
    const label = `${name} ${m.date.getFullYear()}: ${totals[i]} entrenos${detail ? ` (${detail})` : ''}`;
    return `
      <button class="month-col ${i === 5 ? 'current' : ''}" onclick="showMonth(${m.date.getFullYear()}, ${m.date.getMonth()})" title="${label}" aria-label="${label}">
        <span class="month-col-plot">${segments}<span class="month-col-total">${totals[i] || ''}</span></span>
        <span class="month-col-label">${name.slice(0, 3)}</span>
      </button>`;
  }).join('');

  return `
    <div class="month-report">
      <div class="report-title">Resumen de ${MONTH_NAMES[month]}</div>
      ${rows.length ? `<div class="report-rows">${rowsHtml}</div>` : '<p class="day-empty">Aún no hay entrenos este mes</p>'}
      <div class="report-subtitle">Entrenos por mes</div>
      <div class="month-chart">${columns}</div>
    </div>`;
}

function showMonth(year, month) {
  calendarMonth = new Date(year, month, 1);
  renderCalendar();
}

function renderDayDetail(date, info) {
  const [y, m, d] = date.split('-').map(Number);
  const weekday = DAY_NAMES[new Date(y, m - 1, d).getDay()];
  const title = `${weekday}, ${d} de ${MONTH_NAMES[m - 1]}`;

  let items = '';
  if (info) {
    info.gym.forEach((exercises, routineName) => {
      items += `
        <div class="day-item">
          <span class="act-dot" style="background:${ACTIVITY_TYPES.gym.color}"></span>
          <div class="day-item-info">
            <div class="day-item-title">Gym · ${escapeHtml(routineName)}</div>
            <div class="day-item-sub">${[...new Set(exercises)].map(escapeHtml).join(', ')}</div>
          </div>
        </div>`;
    });
    info.activities.forEach(a => {
      const type = ACTIVITY_TYPES[activityType(a.type)];
      items += `
        <div class="day-item">
          <span class="act-dot" style="background:${type.color}"></span>
          <div class="day-item-info">
            <div class="day-item-title">${type.label}${a.minutes ? ` · ${escapeHtml(a.minutes)} min` : ''}</div>
            ${a.notes ? `<div class="day-item-sub">${escapeHtml(a.notes)}</div>` : ''}
          </div>
          <button class="history-delete" onclick="deleteActivity(${a.index})" aria-label="Borrar entreno">${ICONS.close}</button>
        </div>`;
    });
  }

  return `
    <div class="day-detail">
      <div class="day-detail-title">${title}</div>
      ${items || '<p class="day-empty">No hay entrenos este día</p>'}
      <button class="btn-primary" onclick="openAddActivity('${date}')">${ICONS.plus} Añadir entreno</button>
    </div>`;
}

function changeMonth(delta) {
  calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + delta, 1);
  renderCalendar();
}

function goToToday() {
  calendarMonth = null;
  selectedDate = todayStr();
  renderCalendar();
}

function selectDay(date) {
  selectedDate = date;
  renderCalendar();
}

function openAddActivity(date) {
  newActivityType = 'bike';
  const options = Object.entries(ACTIVITY_TYPES).map(([key, t]) => `
    <button type="button" class="type-option ${key === newActivityType ? 'active' : ''}" data-type="${key}" onclick="pickActivityType('${key}')">
      <span class="act-dot" style="background:${t.color}"></span>${t.label}
    </button>`).join('');

  openModal(`
    <h2>Añadir entreno</h2>
    <div class="form-group">
      <label>Tipo</label>
      <div class="type-picker">${options}</div>
    </div>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="activity-date" value="${date || todayStr()}">
    </div>
    <div class="form-group">
      <label>Duración (min)</label>
      <input type="number" inputmode="numeric" id="activity-minutes" placeholder="Opcional">
    </div>
    <div class="form-group">
      <label>Notas</label>
      <input type="text" id="activity-notes" placeholder="Ej: 40 km, simulacro Hyrox...">
    </div>
    <button class="btn-primary" onclick="saveActivity()">Guardar</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function pickActivityType(key) {
  newActivityType = key;
  document.querySelectorAll('.type-option').forEach(b => b.classList.toggle('active', b.dataset.type === key));
}

function saveActivity() {
  const date = document.getElementById('activity-date').value || todayStr();
  const minutes = parseInt(document.getElementById('activity-minutes').value) || null;
  const notes = document.getElementById('activity-notes').value.trim();

  if (!data.activities) data.activities = [];
  data.activities.push({ date, type: newActivityType, minutes, notes });
  data.activities.sort((a, b) => a.date.localeCompare(b.date));

  const [y, m] = date.split('-').map(Number);
  calendarMonth = new Date(y, m - 1, 1);
  selectedDate = date;
  saveData(data);
  closeModal();
  toast('Entreno guardado');
}

function deleteActivity(index) {
  if (confirm('¿Borrar este entreno?')) {
    data.activities.splice(index, 1);
    saveData(data);
    toast('Entreno borrado');
  }
}

// Reset daily checks (once per day, on first load)
function resetDailyChecks() {
  data.routines.forEach(r => r.exercises.forEach(e => e.done = false));
  data.checksDate = todayStr();
  saveData(data);
}

// ============ REORDER (long press + drag) ============
const LONG_PRESS_MS = 400;
const MOVE_TOLERANCE = 8;
const AUTOSCROLL_EDGE = 80;
let reorder = null;
let suppressClick = false;

function initReorder() {
  const container = document.getElementById('exercises');

  container.addEventListener('pointerdown', e => {
    const card = e.target.closest('.exercise-card');
    if (!card || (e.pointerType === 'mouse' && e.button !== 0)) return;
    reorder = {
      card,
      pointerId: e.pointerId,
      active: false,
      startX: e.clientX,
      startY: e.clientY,
      pageY: e.pageY,
      timer: setTimeout(startDrag, LONG_PRESS_MS)
    };
  });

  container.addEventListener('pointermove', e => {
    if (!reorder || e.pointerId !== reorder.pointerId) return;
    reorder.pageY = e.pageY;
    if (!reorder.active) {
      // Moving before the long press completes means the user is scrolling
      if (Math.hypot(e.clientX - reorder.startX, e.clientY - reorder.startY) > MOVE_TOLERANCE) {
        clearTimeout(reorder.timer);
        reorder = null;
      }
      return;
    }
    e.preventDefault();
    moveDrag(e);
  });

  container.addEventListener('pointerup', endDrag);
  container.addEventListener('pointercancel', endDrag);

  // Block page scrolling while a card is being dragged
  document.addEventListener('touchmove', e => {
    if (reorder && reorder.active) e.preventDefault();
  }, { passive: false });

  // Don't trigger the button under the finger when dropping a card
  container.addEventListener('click', e => {
    if (suppressClick) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  container.addEventListener('contextmenu', e => {
    if (reorder) e.preventDefault();
  });
}

function startDrag() {
  const r = reorder;
  if (!r) return;
  r.active = true;
  r.startPageY = r.pageY;
  r.initialTop = r.card.offsetTop;
  r.card.classList.add('dragging');
  try { r.card.setPointerCapture(r.pointerId); } catch (_) {}
  if (navigator.vibrate) navigator.vibrate(30);
}

function moveDrag(e) {
  const { card } = reorder;
  const container = card.parentElement;

  if (e.clientY < AUTOSCROLL_EDGE) window.scrollBy(0, -10);
  else if (e.clientY > window.innerHeight - AUTOSCROLL_EDGE) window.scrollBy(0, 10);

  const follow = () => {
    const offset = e.pageY - reorder.startPageY + reorder.initialTop - card.offsetTop;
    card.style.transform = `translateY(${offset}px)`;
  };
  follow();

  const rect = card.getBoundingClientRect();
  const center = rect.top + rect.height / 2;
  const middle = el => {
    const r = el.getBoundingClientRect();
    return r.top + r.height / 2;
  };
  const prev = card.previousElementSibling;
  const next = card.nextElementSibling;

  if (next && next.classList.contains('exercise-card') && center > middle(next)) {
    container.insertBefore(next, card);
    follow();
  } else if (prev && prev.classList.contains('exercise-card') && center < middle(prev)) {
    container.insertBefore(card, prev);
    follow();
  }
}

function endDrag(e) {
  if (!reorder || e.pointerId !== reorder.pointerId) return;
  const r = reorder;
  reorder = null;
  clearTimeout(r.timer);
  if (!r.active) return;

  r.card.classList.remove('dragging');
  r.card.style.transform = '';
  suppressClick = true;
  setTimeout(() => suppressClick = false, 400);

  const cards = document.querySelectorAll('#exercises .exercise-card');
  const order = [...cards].map(c => parseInt(c.dataset.index));
  if (order.every((idx, i) => idx === i)) return;

  const routine = data.routines[data.activeRoutine];
  routine.exercises = order.map(i => routine.exercises[i]);
  saveData(data);
  render();
}

// ============ TOAST ============
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  initReorder();

  applyTheme(document.documentElement.dataset.theme);

  // Follow the phone's light/dark switch until a theme is chosen in the app
  darkQuery.addEventListener('change', e => {
    if (!getSavedTheme()) applyTheme(e.matches ? 'dark' : 'light');
  });

  // Allow login with Enter key
  document.getElementById('login-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('login-email').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('login-password').focus();
  });
});

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
