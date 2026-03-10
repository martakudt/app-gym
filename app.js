// ============ DATA ============
const DEFAULT_DATA = {
  activeRoutine: 0,
  routines: [
    {
      name: "DÍA A ⚡ PIERNA + GLÚTEO",
      exercises: [
        { name: "Sentadilla Trasera", sets: 3, reps: "8-12", weight: 30, done: false, logs: [{ date: "2026-03-02", weight: 30, reps: [10, 9, 8] }] },
        { name: "Hip Thrust", sets: 3, reps: "10-15", weight: 70, done: false, logs: [{ date: "2026-03-02", weight: 70, reps: [12, 12, 10] }] },
        { name: "Peso Muerto Rumano", sets: 3, reps: "8-12", weight: 7.5, done: false, logs: [{ date: "2026-03-02", weight: 7.5, reps: [12, 10] }] },
        { name: "Sentadilla Búlgara", sets: 3, reps: "8-12", weight: 10, done: false, logs: [{ date: "2026-03-02", weight: 10, reps: [12, 12, 10] }] },
        { name: "Gemelos", sets: 3, reps: "8-12", weight: 12.5, done: false, logs: [{ date: "2026-03-02", weight: 12.5, reps: [12, 12, 12] }] }
      ]
    },
    {
      name: "DÍA B 🔥 TORSO",
      exercises: [
        { name: "Jalón al Pecho", sets: 3, reps: "8-12", weight: 5, unit: "bloques", done: false, logs: [{ date: "2026-03-03", weight: 5, reps: [12, 11, 10] }] },
        { name: "Remo con Barra", sets: 3, reps: "8-12", weight: 7.5, unit: "kg", done: false, logs: [{ date: "2026-03-03", weight: 7.5, reps: [12, 10, 8] }] },
        { name: "Press Plano (mancuernas)", sets: 3, reps: "8-12", weight: 10, unit: "kg", done: false, logs: [{ date: "2026-03-03", weight: 10, reps: [12, 10, 8] }] },
        { name: "Press Militar", sets: 3, reps: "10-15", weight: 8, unit: "kg", done: false, logs: [{ date: "2026-03-03", weight: 8, reps: [15, 13, 10] }] },
        { name: "Elevaciones Laterales", sets: 3, reps: "10-15", weight: 5, unit: "kg", done: false, logs: [{ date: "2026-03-03", weight: 5, reps: [15, 15, 15] }] },
        { name: "Curl Bíceps (mancuerna sentada)", sets: 3, reps: "8-12", weight: 7.5, unit: "kg", done: false, logs: [{ date: "2026-03-03", weight: 7.5, reps: [12, 10, 9] }] },
        { name: "Tríceps en polea", sets: 3, reps: "8-12", weight: 4, unit: "bloques", done: false, logs: [{ date: "2026-03-03", weight: 4, reps: [12, 12, 12] }] }
      ]
    },
    {
      name: "DÍA C 🏋🏼‍♀️ FULLBODY",
      exercises: [
        { name: "Patada de glúteo", sets: 3, reps: "8-12", weight: 18.1, unit: "kg", done: false, logs: [{ date: "2026-02-27", weight: 18.1, reps: [12, 10, 8] }, { date: "2026-03-05", weight: 18.1, reps: [12, 12, 10] }] },
        { name: "Remo gironda", sets: 3, reps: "8-12", weight: 18.1, unit: "kg", done: false, logs: [{ date: "2026-02-27", weight: 18.1, reps: [14, 13, 12] }, { date: "2026-03-05", weight: 18.1, reps: [15, 14, 11] }] },
        { name: "Step up", sets: 3, reps: "8-12", weight: 10, unit: "kg", done: false, logs: [{ date: "2026-02-27", weight: 7.5, reps: [12, 12, 12] }, { date: "2026-03-05", weight: 10, reps: [12, 11, 10] }] },
        { name: "Dominadas asistidas", sets: 3, reps: "8-fallo", weight: "morada", unit: "goma", done: false, logs: [{ date: "2026-02-27", weight: "morada", reps: [8, 6, 5] }, { date: "2026-03-05", weight: "morada", reps: [8, 5, 4] }] },
        { name: "Elevaciones Laterales", sets: 3, reps: "12-15", weight: 5, unit: "kg", done: false, logs: [{ date: "2026-02-27", weight: 5, reps: [15, 10, 10] }, { date: "2026-03-05", weight: 5, reps: [15, 15, 13] }] },
        { name: "Curl Bíceps (araña)", sets: 2, reps: "8-12", weight: 7.5, unit: "kg", done: false, logs: [{ date: "2026-02-27", weight: 7.5, reps: [12, 7] }, { date: "2026-03-05", weight: 7.5, reps: [9, 7] }] },
        { name: "Press Francés Mancuernas", sets: 3, reps: "8-12", weight: 5, unit: "kg", done: false, logs: [{ date: "2026-02-27", weight: 5, reps: [12, 10, 8] }, { date: "2026-03-05", weight: 5, reps: [12, 10, 8] }] }
      ]
    }
  ]
};

const DATA_VERSION = 3;

function loadData() {
  const savedVersion = localStorage.getItem('gymAppVersion');
  if (savedVersion !== String(DATA_VERSION)) {
    localStorage.removeItem('gymApp');
    localStorage.setItem('gymAppVersion', DATA_VERSION);
  }
  const saved = localStorage.getItem('gymApp');
  return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function saveData(data) {
  localStorage.setItem('gymApp', JSON.stringify(data));
}

let data = loadData();

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
  renderNav();
  renderStats();
  renderHeader();
  renderExercises();
}

function renderNav() {
  const container = document.getElementById('nav-tabs');
  let html = data.routines.map((r, i) => {
    const label = r.name.split(' ').slice(0, 2).join(' ');
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
      <div class="stat-sub">sesión</div>
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
    <span class="routine-title">${routine.name}</span>
    <div class="routine-actions">
      <button class="btn-icon" onclick="openTrash()">♻️</button>
      <button class="btn-icon" onclick="openEditRoutine()">✏️</button>
      ${data.routines.length > 1 ? `<button class="btn-icon danger" onclick="deleteRoutine()">🗑️</button>` : ''}
    </div>
  `;
}

function renderExercises() {
  const container = document.getElementById('exercises');
  const routine = data.routines[data.activeRoutine];

  if (!routine.exercises.length) {
    container.innerHTML = `
      <div class="empty-state">
        <span>🏋️</span>
        <p>No hay ejercicios todavía</p>
        <p style="font-size:13px; margin-top:8px">Pulsa + para añadir uno</p>
      </div>`;
    return;
  }

  container.innerHTML = routine.exercises.map((ex, i) => {
    const lastLog = ex.logs.length ? ex.logs[ex.logs.length - 1] : null;
    const unit = ex.unit || 'kg';
    return `
      <div class="exercise-card ${ex.done ? 'done' : ''}">
        <div class="exercise-top">
          <button class="exercise-check" onclick="toggleDone(${i})">${ex.done ? '✓' : ''}</button>
          <div class="exercise-info">
            <div class="exercise-name">${ex.name}</div>
            <div class="exercise-meta">
              ${ex.sets}s x ${ex.reps}
              <span class="exercise-weight">${ex.weight} ${unit}</span>
            </div>
            ${lastLog ? `
              <div class="last-log">
                <span class="last-log-date">📍 ${formatDate(lastLog.date)}</span>
                → ${formatLogDetail(lastLog, unit)}
              </div>
            ` : ''}
            <div class="exercise-actions">
              <button class="btn-small btn-history" onclick="openHistory(${i})">📊 Historial</button>
              <button class="btn-small btn-delete" onclick="deleteExercise(${i})">Eliminar</button>
            </div>
          </div>
        </div>
        <button class="btn-log" onclick="openLogModal(${i})">+ Registrar entreno</button>
      </div>`;
  }).join('');
}

function formatLogDetail(log, unit) {
  if (log.weights) {
    const allSame = log.weights.every(w => w === log.weights[0]);
    if (allSame) {
      return `${log.weights[0]} ${unit} | <span class="last-log-reps">${log.reps.join(' - ')}</span>`;
    }
    const parts = log.weights.map((w, i) => `${w}x${log.reps[i]}`);
    return `<span class="last-log-reps">${parts.join(' - ')}</span> ${unit}`;
  }
  return `${log.weight} ${unit} | <span class="last-log-reps">${log.reps.join(' - ')}</span>`;
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
  render();
}

function toggleDone(i) {
  data.routines[data.activeRoutine].exercises[i].done = !data.routines[data.activeRoutine].exercises[i].done;
  saveData(data);
  render();
}

function deleteExercise(i) {
  if (confirm('¿Eliminar este ejercicio?')) {
    const removed = data.routines[data.activeRoutine].exercises.splice(i, 1)[0];
    // Guardar en papelera por si se borra sin querer
    if (!data.trash) data.trash = [];
    data.trash.push({ routineIndex: data.activeRoutine, exercise: removed, deletedAt: todayStr() });
    if (data.trash.length > 20) data.trash.shift();
    saveData(data);
    render();
    toast('Eliminado (puedes restaurar desde ⚙️)');
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
              <div class="history-date">${t.exercise.name}</div>
              <div style="font-size:12px;color:var(--text-muted)">Eliminado: ${t.deletedAt}</div>
            </div>
            <button class="btn-small btn-history" onclick="restoreExercise(${realIndex})">Restaurar</button>
          </div>`;
      }).join('')
    : '<p style="color:var(--text-muted);text-align:center;padding:20px">Papelera vacía</p>';

  openModal(`
    <h2>🗑️ Papelera</h2>
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
  render();
  toast('✓ Ejercicio restaurado');
}

function deleteRoutine() {
  if (confirm(`¿Eliminar "${data.routines[data.activeRoutine].name}"?`)) {
    data.routines.splice(data.activeRoutine, 1);
    data.activeRoutine = 0;
    saveData(data);
    render();
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
        <input type="${inputType}" ${inputAttrs} placeholder="${unit}" id="weight-${s}" value="${ex.weight}" class="series-weight">
        <span class="series-x">x</span>
        <input type="number" inputmode="numeric" placeholder="reps" id="rep-${s}" class="series-reps">
      </div>`;
  }

  openModal(`
    <h2>Registrar: ${ex.name}</h2>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="log-date" value="${todayStr()}">
    </div>
    <div class="form-group">
      <div class="series-header">
        <span></span><span>Peso (${unit})</span><span></span><span>Reps</span>
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
  render();
  toast('✓ Entreno guardado');
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
  render();
  toast('✓ Ejercicio añadido');
}

// Add / Edit routine
function openAddRoutine() {
  openModal(`
    <h2>Nueva rutina</h2>
    <div class="form-group">
      <label>Nombre de la rutina</label>
      <input type="text" id="new-routine-name" placeholder="Ej: DÍA D 💥 CARDIO">
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
  render();
  toast('✓ Rutina creada');
}

function openEditRoutine() {
  const routine = data.routines[data.activeRoutine];
  openModal(`
    <h2>Editar rutina</h2>
    <div class="form-group">
      <label>Nombre</label>
      <input type="text" id="edit-routine-name" value="${routine.name}">
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
  render();
}

// History
let historyChart = null;

function openHistory(exIndex) {
  const ex = data.routines[data.activeRoutine].exercises[exIndex];
  const unit = ex.unit || 'kg';
  const logs = [...ex.logs].reverse();
  const isNumeric = (unit === 'kg' || unit === 'bloques');

  // Chart data (chronological order)
  const chartLogs = [...ex.logs];
  const chartLabels = chartLogs.map(l => formatDate(l.date));
  const chartWeights = isNumeric ? chartLogs.map(l => {
    if (l.weights) return Math.max(...l.weights.map(Number));
    return Number(l.weight);
  }) : [];
  const chartAvgReps = chartLogs.map(l => {
    const sum = l.reps.reduce((a, b) => a + b, 0);
    return +(sum / l.reps.length).toFixed(1);
  });
  const chartTotalReps = chartLogs.map(l => l.reps.reduce((a, b) => a + b, 0));

  let listHtml = logs.length
    ? logs.map((log, li) => {
        const realIndex = ex.logs.length - 1 - li;
        return `
          <div class="history-item">
            <div>
              <div class="history-date">${formatDate(log.date)}</div>
              <div class="history-detail">${formatLogDetail(log, unit)}</div>
            </div>
            <button class="history-delete" onclick="deleteLog(${exIndex}, ${realIndex})">×</button>
          </div>`;
      }).join('')
    : '<p style="color:var(--text-muted); text-align:center; padding:20px">Sin registros</p>';

  const hasChartData = chartLogs.length >= 1;

  openModal(`
    <h2>📊 ${ex.name}</h2>
    ${hasChartData ? `
      <div class="chart-tabs">
        <button class="chart-tab active" onclick="switchChart('weight', ${exIndex})">Peso</button>
        <button class="chart-tab" onclick="switchChart('reps', ${exIndex})">Reps Media</button>
        <button class="chart-tab" onclick="switchChart('volume', ${exIndex})">Volumen</button>
      </div>
      <div class="chart-container">
        <canvas id="history-chart"></canvas>
      </div>
    ` : ''}
    <h3>Registros</h3>
    <div class="history-list">${listHtml}</div>
    <button class="btn-secondary" onclick="closeModal()" style="margin-top:16px">Cerrar</button>
  `);

  if (hasChartData) {
    setTimeout(() => buildChart('weight', chartLabels, chartWeights, chartAvgReps, chartTotalReps, unit, isNumeric), 50);
  }
}

function switchChart(type, exIndex) {
  document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');

  const ex = data.routines[data.activeRoutine].exercises[exIndex];
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

  const ctx = document.getElementById('history-chart');
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
    document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.chart-tab')[1].classList.add('active');
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

// Reset daily checks
function resetDailyChecks() {
  data.routines.forEach(r => r.exercises.forEach(e => e.done = false));
  saveData(data);
  render();
  toast('Checks reseteados');
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
  render();
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
});

// Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js');
}
