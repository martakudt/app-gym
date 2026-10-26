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
        'auth/wrong-password': 'Contrasena incorrecta',
        'auth/invalid-email': 'Email no valido',
        'auth/invalid-credential': 'Email o contrasena incorrectos',
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
    errorEl.textContent = 'La contrasena debe tener al menos 6 caracteres';
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
        'auth/invalid-email': 'Email no valido',
        'auth/weak-password': 'La contrasena es muy debil (min 6 caracteres)'
      };
      errorEl.textContent = messages[err.code] || 'Error: ' + err.message;
    });
}

function handleLogout() {
  if (confirm('Cerrar sesion?')) {
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
      listHtml = '<p style="color:var(--text-muted);text-align:center;padding:20px">No hay solicitudes pendientes</p>';
    } else {
      snapshot.forEach(doc => {
        const p = doc.data();
        listHtml += `
          <div class="history-item">
            <div>
              <div class="history-date">${escapeHtml(p.email)}</div>
              <div style="font-size:12px;color:var(--text-muted)">Registro: ${escapeHtml(p.createdAt || '?')}</div>
            </div>
            <button class="btn-small btn-history" onclick="approveUser('${doc.id}')">Aprobar</button>
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
    } else {
      data = JSON.parse(JSON.stringify(DEFAULT_DATA));
      data.trash = [];
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
}

function renderNav() {
  const container = document.getElementById('routine-tabs');
  let html = data.routines.map((r, i) => {
    const label = escapeHtml(r.name.split(' ').slice(0, 2).join(' '));
    return `<button class="nav-tab ${i === data.activeRoutine ? 'active' : ''}" onclick="switchTab(${i})">${label}</button>`;
  }).join('');
  html += `<button class="nav-tab nav-tab-add" onclick="openAddRoutine()">+</button>`;
  container.innerHTML = html;
}

function renderStats() {
  const s = getStats();
  document.getElementById('stats-row').innerHTML = `
    <div class="stat-card">
      <div class="stat-label">Ejercicios</div>
      <div class="stat-value">${s.total}</div>
      <div class="stat-sub">total</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Completados</div>
      <div class="stat-value">${s.done}</div>
      <div class="stat-sub">hoy</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Progreso</div>
      <div class="stat-value">${s.pct}%</div>
      <div class="stat-sub">sesion</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Registros</div>
      <div class="stat-value">${s.totalLogs}</div>
      <div class="stat-sub">historial</div>
    </div>
  `;
}

function renderHeader() {
  const routine = data.routines[data.activeRoutine];
  document.getElementById('routine-header').innerHTML = `
    <span class="routine-title">${escapeHtml(routine.name)}</span>
    <div class="routine-actions">
      ${isAdmin ? `<button class="btn-icon admin-btn" onclick="openAdminPanel()">&#128101;</button>` : ''}
      <button class="btn-icon" onclick="openTrash()">&#9851;</button>
      <button class="btn-icon" onclick="openEditRoutine()">&#9998;</button>
      ${data.routines.length > 1 ? `<button class="btn-icon danger" onclick="deleteRoutine()">&#128465;</button>` : ''}
    </div>
  `;
}

function renderExercises() {
  const container = document.getElementById('exercises');
  const routine = data.routines[data.activeRoutine];

  if (!routine.exercises.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span>&#127947;</span>
        <p>No hay ejercicios todavia</p>
        <p style="font-size:13px; margin-top:8px">Pulsa + para anadir uno</p>
      </div>`;
    return;
  }

  let exercisesHtml = routine.exercises.map((ex, i) => {
    const lastLog = ex.logs.length ? ex.logs[ex.logs.length - 1] : null;
    const unit = ex.unit || 'kg';
    return `
      <div class="exercise-card ${ex.done ? 'done' : ''}" data-index="${i}">
        <div class="exercise-top">
          <button class="exercise-check" onclick="toggleDone(${i})">${ex.done ? '&#10003;' : ''}</button>
          <div class="exercise-info">
            <div class="exercise-name">${escapeHtml(ex.name)}</div>
            <div class="exercise-meta">
              ${escapeHtml(ex.sets)}s x ${escapeHtml(ex.reps)}
              <span class="exercise-weight">${escapeHtml(ex.weight)} ${escapeHtml(unit)}</span>
            </div>
            ${lastLog ? `
              <div class="last-log">
                <span class="last-log-date">&#128205; ${formatDate(lastLog.date)}</span>
                &rarr; ${formatLogDetail(lastLog, unit)}
              </div>
            ` : ''}
            <div class="exercise-actions">
              <button class="btn-full btn-history" onclick="openHistory(${i})">&#128203; Ver historial</button>
            </div>
          </div>
        </div>
        <button class="btn-log" onclick="openLogModal(${i})">+ Registrar entreno</button>
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
        <h3 class="chart-section-title">&#128200; Graficas de progreso</h3>
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
      return `${escapeHtml(log.weights[0])} ${unit} | <span class="last-log-reps">${log.reps.join(' - ')}</span>`;
    }
    const parts = log.weights.map((w, i) => `${escapeHtml(w)}x${log.reps[i]}`);
    return `<span class="last-log-reps">${parts.join(' - ')}</span> ${unit}`;
  }
  return `${escapeHtml(log.weight)} ${unit} | <span class="last-log-reps">${log.reps.join(' - ')}</span>`;
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
  if (confirm('Eliminar este ejercicio?')) {
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
              <div style="font-size:12px;color:var(--text-muted)">Eliminado: ${t.deletedAt}</div>
            </div>
            <button class="btn-small btn-history" onclick="restoreExercise(${realIndex})">Restaurar</button>
          </div>`;
      }).join('')
    : '<p style="color:var(--text-muted);text-align:center;padding:20px">Papelera vacia</p>';

  openModal(`
    <h2>&#128465; Papelera</h2>
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
  if (confirm(`Eliminar "${data.routines[data.activeRoutine].name}"?`)) {
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
        <span class="series-x">x</span>
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
      <label>Numero de series</label>
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
    <button class="btn-primary" onclick="saveNewExercise()">Anadir</button>
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
  toast('Ejercicio anadido');
}

// Add / Edit routine
function openAddRoutine() {
  openModal(`
    <h2>Nueva rutina</h2>
    <div class="form-group">
      <label>Nombre de la rutina</label>
      <input type="text" id="new-routine-name" placeholder="Ej: DIA D - CARDIO">
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
              <button class="history-delete" onclick="deleteLog(${exIndex}, ${realIndex})">x</button>
            </div>`;
        }).join('')}
      </div>`
    : '<p style="color:var(--text-muted); text-align:center; padding:20px">Sin registros</p>';

  openModal(`
    <h2>&#128203; ${escapeHtml(ex.name)}</h2>
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
  const weights = isNumeric ? chartLogs.map(l => {
    if (l.weights) return Math.max(...l.weights.map(Number));
    return Number(l.weight);
  }) : [];
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
    weight: {
      data: weights,
      label: `Peso (${unit})`,
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)'
    },
    reps: {
      data: avgReps,
      label: 'Reps media por serie',
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)'
    },
    volume: {
      data: totalReps,
      label: 'Reps totales',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.1)'
    }
  };

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
        borderColor: cfg.color,
        backgroundColor: cfg.bg,
        borderWidth: 2.5,
        pointBackgroundColor: cfg.color,
        pointBorderColor: '#111827',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
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
          backgroundColor: '#1e2a3a',
          titleColor: '#94a3b8',
          bodyColor: '#f1f5f9',
          borderColor: '#263245',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 10,
          bodyFont: { weight: '700', size: 14 }
        }
      },
      scales: {
        x: {
          ticks: { color: '#475569', font: { size: 10 } },
          grid: { color: 'rgba(30, 42, 58, 0.5)' }
        },
        y: {
          ticks: { color: '#475569', font: { size: 10 } },
          grid: { color: 'rgba(30, 42, 58, 0.5)' },
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
