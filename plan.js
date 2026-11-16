// ============ PLAN ============
// Training plan (full body + hybrid + gravel bike), stored in data.plan.
// Routines and their logs are not touched: a planned workout marked as done is
// saved as a calendar activity (data.activities) with a planId, so the calendar
// and its month report count it too.

const PLAN_TYPES = {
  fuerza: { label: 'Fuerza', activity: 'gym' },
  hibrido: { label: 'Híbrido', activity: 'hyrox' },
  bici: { label: 'Bici', activity: 'bike' },
  movilidad: { label: 'Movilidad', activity: 'other' }
};

const PLAN_WEEKDAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const OPTIONAL_WEEKDAYS = [5]; // Friday is always optional
const LONG_RIDE_IDS = ['bike-long', 'bike-indoor'];
const PHASE_COLORS = ['var(--act-other)', 'var(--act-hyrox)', 'var(--act-bike)', 'var(--act-gym)'];
const BIKE_KINDS = {
  'bike-long': 'Salida larga',
  'bike-easy': 'Salida suave',
  'bike-indoor': 'Bici estática'
};

// ---------- Default plan ----------
const PLAN_VERSION = 8;

const WARMUP = {
  title: `Calentamiento (10')`,
  lines: [
    `Comba suave · 3'`,
    `Bici o remo subiendo el ritmo · 3'`,
    `2 rondas: 10 sentadillas al aire, 10 balanceos de pierna, 5 flexiones y 10" de plancha`
  ]
};
const COOLDOWN = {
  title: `Vuelta a la calma (5')`,
  lines: [`Caminar o pedalear suave · 2-3'`, 'Estiramientos de cadera, isquios y gemelos']
};
const STRENGTH_WARMUP = {
  title: `Calentamiento (8')`,
  lines: [
    `Bici o remo suave · 5'`,
    '2 rondas: 10 sentadillas al aire, 10 puentes de glúteo, 10 aperturas con banda',
    '1-2 series ligeras del primer ejercicio'
  ]
};
const STRENGTH_NOTE = 'Elige un peso con el que acabes cada serie sintiendo que podrías hacer 2 repeticiones más. Cuando completes todas las series con facilidad, sube un poco. En semana de descarga: 1 serie menos y un 20 % menos de peso.';

// How to do each exercise: shown under the line (text after " | ")
const HOW = {
  plank: 'Apoyada en antebrazos y puntas de los pies, cuerpo en línea recta. Aprieta glúteos y abdomen sin hundir ni subir la cadera.',
  sidePlank: 'De lado, apoyada en el antebrazo y el lateral del pie (o en las rodillas para hacerla más fácil). Cadera arriba y cuerpo en línea recta.',
  deadBug: 'Boca arriba, brazos estirados hacia el techo y rodillas dobladas a 90°. Baja a la vez un brazo y la pierna contraria sin que la zona lumbar se despegue del suelo, y cambia.',
  hollow: 'Boca arriba, pega la zona lumbar al suelo y despega hombros y piernas, con los brazos estirados por detrás de la cabeza. Para hacerlo más fácil, dobla las rodillas o lleva los brazos junto al cuerpo.',
  pallof: 'De lado a una polea o una goma a la altura del pecho. Agarra con las dos manos, empuja hacia delante, aguanta 2" y vuelve, sin dejar que el tronco gire.',
  farmer: 'Camina erguida con una kettlebell o mancuerna pesada en cada mano, hombros abajo y atrás y abdomen firme.',
  birdDog: 'A cuatro patas, estira a la vez un brazo y la pierna contraria, aguanta 2" y vuelve sin que la cadera se gire.',
  glute: 'Boca arriba con las rodillas dobladas y los pies en el suelo. Sube la cadera apretando los glúteos y baja despacio.'
};

function defaultWorkouts() {
  const workouts = [
    {
      id: 'fb-a', name: 'Full Body A', type: 'fuerza', minutes: 55,
      summary: 'Cuádriceps y espalda: sentadilla, jalón, búlgara y remo',
      blocks: [
        STRENGTH_WARMUP,
        // Legs and upper body alternate, so the legs rest between the two squats
        { title: 'Fuerza', lines: [
          `Sentadilla Bell · 4 × 6-8 · desc. 2'`,
          'Jalón al pecho en polea · 3 × 8-12 · desc. 90"',
          'Sentadilla búlgara · 3 × 8 por pierna · desc. 90"',
          'Remo en máquina agarre prono · 3 × 10-12 · desc. 60"',
          'Elevaciones laterales · 3 × 12-15 · desc. 60"'
        ] },
        { title: 'Core', lines: [`Plancha · 3 × 30" | ${HOW.plank}`, `Dead bug · 3 × 10 | ${HOW.deadBug}`] }
      ],
      notes: STRENGTH_NOTE
    },
    {
      // The only heavy hinge of the week (the swing in C is light and explosive)
      id: 'fb-b', name: 'Full Body B', type: 'fuerza', minutes: 55,
      summary: 'Glúteo, isquios y hombro: peso muerto rumano, press militar y hip thrust',
      blocks: [
        STRENGTH_WARMUP,
        { title: 'Fuerza', lines: [
          `Peso muerto rumano · 3 × 8-10 · desc. 2'`,
          'Press militar con mancuernas · 3 × 8-12 · desc. 90"',
          'Hip thrust · 3 × 8-12 · desc. 90"',
          'Dominadas en máquina · 3 × 8-12 · desc. 90"',
          'Curl femoral tumbado · 3 × 10-12 · desc. 60"'
        ] },
        { title: 'Core', lines: [`Farmer carry · 3 × 30 m | ${HOW.farmer}`, `Pallof press · 3 × 10 por lado | ${HOW.pallof}`] }
      ],
      notes: STRENGTH_NOTE
    },
    {
      id: 'fb-c', name: 'Full Body C', type: 'fuerza', minutes: 50,
      summary: 'Más atlética: swing, thruster, remo en T y step-up',
      blocks: [
        STRENGTH_WARMUP,
        // Explosive work first, while fresh
        { title: 'Fuerza', lines: [
          'Kettlebell swing (ligero y explosivo) · 4 × 15 · desc. 60"',
          'Thruster con mancuernas · 4 × 8 · desc. 90"',
          'Remo en T prono · 3 × 10 · desc. 60"',
          'Step-up al cajón con mancuernas · 3 × 8 por pierna · desc. 60"',
          'Abductor + aductor en máquina · 2 × 15 cada uno · desc. 60"'
        ] },
        { title: 'Core', lines: [`Hollow hold · 3 × 20-30" | ${HOW.hollow}`, `Plancha lateral · 3 × 20-30" por lado | ${HOW.sidePlank}`] }
      ],
      notes: 'Puente entre la fuerza y lo Hyrox: ayuda con los wall balls y los burpees. ' + STRENGTH_NOTE
    },
    {
      id: 'r1', name: 'Mini Hyrox', type: 'hibrido', minutes: 60,
      summary: '8 rondas: 400 m de carrera + una estación',
      blocks: [
        WARMUP,
        { title: `8 rondas (~45') · 400 m de carrera + estación`, lines: [
          '1. SkiErg 500 m (o air bike 15 cal)',
          '2. 20 zancadas con mancuernas o saco',
          '3. Remo 500 m',
          '4. 12 burpees con salto hacia delante',
          '5. Farmer carry 100 m',
          '6. 20 wall balls',
          '7. Air bike 15 cal',
          '8. 20 sentadillas con saco o kettlebell'
        ] },
        COOLDOWN
      ],
      notes: 'Ritmo constante, esfuerzo 7/10. Apunta el tiempo total para ver cómo mejoras. Si al principio cuesta, haz 6 rondas.'
    },
    {
      id: 'r2', name: 'EMOM Motor', type: 'hibrido', minutes: 60,
      summary: `EMOM 40': air bike, comba, remo, swings y burpees`,
      blocks: [
        WARMUP,
        { title: `EMOM 40' (8 vueltas)`, lines: [
          'Minuto 1 · Air bike 10 cal',
          'Minuto 2 · 40 saltos de comba (o 15 dobles)',
          'Minuto 3 · Remo 10 cal',
          'Minuto 4 · 15 kettlebell swings',
          'Minuto 5 · 10 burpees'
        ] },
        COOLDOWN
      ],
      notes: 'Cada minuto empiezas un ejercicio y descansas lo que sobre. Si no te quedan al menos 15" de descanso, baja las repeticiones.'
    },
    {
      id: 'r3', name: 'Fuerza híbrida', type: 'hibrido', minutes: 60,
      summary: 'Fuerza en superseries + AMRAP de 15 minutos',
      blocks: [
        WARMUP,
        { title: `Fuerza (25') · 4 series, desc. 90"`, lines: [
          'A1. Sentadilla goblet o con barra · 4 × 8',
          'A2. Remo con mancuerna · 4 × 10 por brazo',
          'B1. Peso muerto rumano · 4 × 8',
          'B2. Press de hombro · 4 × 10'
        ] },
        { title: `Finisher · AMRAP 15'`, lines: ['200 m de carrera', '10 thrusters con mancuernas', '10 cal de air bike'] },
        COOLDOWN
      ],
      notes: 'Comodín: úsala si una semana solo puedes ir 3 días o vas justa de tiempo.'
    },
    {
      id: 'r4', name: 'Engine largo', type: 'hibrido', minutes: 60,
      summary: 'Resistencia aeróbica: carrera, remo y comba + core',
      blocks: [
        WARMUP,
        { title: `4 rondas de 8' · 2' caminando entre rondas`, lines: [
          `Carrera a ritmo fuerte pero sostenible · 3'`,
          `Remo · 3'`,
          `Comba · 2'`
        ] },
        { title: `Core (8') · 3 vueltas`, lines: [
          `Plancha · 30" | ${HOW.plank}`,
          `Dead bug · 30" | ${HOW.deadBug}`,
          `Plancha lateral · 30" por lado | ${HOW.sidePlank}`,
          `Hollow hold · 30" | ${HOW.hollow}`
        ] }
      ],
      notes: 'Esfuerzo 6-7/10: tienes que poder decir frases cortas. Si las piernas van cargadas, cambia la carrera por remo o bici.'
    },
    {
      id: 'r5', name: 'Chipper híbrido', type: 'hibrido', minutes: 60,
      summary: 'Lista larga de ejercicios, una vez y en orden',
      blocks: [
        WARMUP,
        { title: `Chipper · todo una vez, en orden (máx. 45')`, lines: [
          '1000 m de remo',
          '50 wall balls',
          '100 saltos de comba',
          '40 zancadas caminando',
          '30 cal de air bike',
          '30 kettlebell swings',
          '20 burpees',
          '400 m de carrera',
          '50 m de farmer carry',
          '20 cal de SkiErg o air bike'
        ] },
        COOLDOWN
      ],
      notes: 'Parte las repeticiones como quieras. Repítela cada 4-6 semanas para medir tu progreso.'
    },
    {
      id: 'bike-long', name: 'Salida larga en gravel', type: 'bici', minutes: null,
      summary: 'Ritmo cómodo (zona 2): que puedas hablar toda la salida',
      blocks: [
        { title: 'Cómo hacerla', lines: [
          'Ritmo en el que puedas hablar durante toda la salida',
          'Cambia la posición de las manos a menudo y lleva los hombros relajados',
          'En tierra, algo menos de presión en los neumáticos: vibra y cansa menos'
        ] },
        { title: 'Comida y agua (a partir de 1h30)', lines: [
          'Bebe más o menos 1 bidón por hora (más si hace calor)',
          `Come algo cada 30-45' antes de tener hambre (plátano, barrita, dátiles)`,
          'Desayuna bien y prueba la comida en salidas cortas, no el día del objetivo'
        ] },
        { title: 'En invierno', lines: [
          'Mira la previsión: si llueve el día de la salida, prueba el día siguiente o haz el Plan B en la bici estática',
          'Capas: térmica, cortavientos, guantes y cubrebotas',
          'Luces delante y detrás: anochece pronto'
        ] }
      ],
      notes: 'Los km objetivo de cada semana están en la pestaña Bici, y los puedes cambiar.'
    },
    {
      id: 'bike-easy', name: 'Salida suave', type: 'bici', minutes: 60, optional: true,
      summary: '15-25 km muy suaves para soltar piernas',
      blocks: [
        { title: 'Cómo hacerla', lines: ['15-25 km a ritmo muy suave', 'Si la salida larga te dejó muy cansada o hace mal tiempo, mejor descansa'] }
      ],
      notes: ''
    },
    {
      id: 'bike-indoor', name: 'Plan B: bici estática', type: 'bici', minutes: 60,
      summary: 'Para los días de lluvia o mucho frío, en el gym o en casa',
      blocks: [
        { title: `Calentamiento (10')`, lines: [
          'Pedaleo suave, subiendo la resistencia y la cadencia poco a poco'
        ] },
        { title: `Principal (40-60') · elige una opción`, lines: [
          'Opción 1, continuo: ritmo cómodo en el que puedas hablar | Pon una resistencia media, como un llano con algo de viento. Si notas que te cuesta hablar, baja un nivel.',
          `Opción 2, "subidas": 4 × 6' con más resistencia y 3' suaves entre medias | Sube 2-3 niveles de resistencia como si fuera una cuesta, sin ir a tope (7/10). Baja la cadencia, pero sin atascarte.`
        ] },
        { title: `Vuelta a la calma (5')`, lines: ['Pedaleo muy suave y luego estiramientos de cuádriceps, isquios y cadera'] }
      ],
      notes: '45-60 minutos de bici estática cuentan como la salida del finde cuando hace mal tiempo. Si la bici marca km, apúntalos; si no, solo los minutos. Cuando la salida larga ya pase de 2 horas, mejor intenta moverla a otro día seco.'
    },
    {
      id: 'mov', name: 'Movilidad + core suave', type: 'movilidad', minutes: 35, optional: true,
      summary: 'Para soltar cadera, espalda y piernas sin cargarlas',
      blocks: [
        { title: `Espalda y cadera (12')`, lines: [
          'Gato-camello · 10 lentas | A cuatro patas: redondea la espalda mirando al ombligo y luego húndela mirando al frente. Despacio, siguiendo la respiración.',
          'Rotaciones torácicas · 8 por lado | A cuatro patas, con una mano en la nuca: lleva el codo hacia el brazo de apoyo y luego ábrelo hacia el techo siguiéndolo con la mirada.',
          'Estiramiento del flexor de cadera · 45" por lado | Una rodilla en el suelo y el otro pie delante. Aprieta el glúteo de la pierna de atrás y lleva la cadera hacia delante sin arquear la espalda. Se nota delante de la cadera, y viene muy bien después de la bici.',
          '90/90 de cadera · 6 por lado | Sentada en el suelo con las dos rodillas dobladas a 90°, una delante y otra a un lado. Gira las rodillas de un lado a otro, con las manos apoyadas detrás si lo necesitas.',
          `Sentadilla profunda asistida · 1' | Agárrate a algo firme y baja a una sentadilla profunda con los talones en el suelo. Empuja las rodillas hacia fuera con los codos y respira.`
        ] },
        { title: `Piernas y pecho (12')`, lines: [
          'Isquios con toalla · 45" por pierna | Boca arriba, sube una pierna estirada con una toalla o goma en el pie y tira suave hacia ti. La otra pierna, estirada en el suelo.',
          'Cuádriceps de pie · 45" por pierna | Coge el empeine y lleva el talón al glúteo, con las rodillas juntas y la cadera un poco hacia delante. Apóyate en la pared si hace falta.',
          'Gemelos contra la pared · 45" por pierna | Manos en la pared y una pierna atrás, estirada y con el talón en el suelo. Inclínate hacia la pared hasta notar el gemelo.',
          'Glúteo en figura 4 · 45" por lado | Boca arriba, cruza un tobillo sobre la rodilla contraria y acerca las dos piernas al pecho.',
          'Pecho en el marco de una puerta · 45" por lado | Apoya el antebrazo en el marco a la altura del hombro y gira el cuerpo hacia el otro lado. Abre el pecho, que en la bici se cierra.'
        ] },
        { title: `Core suave (10')`, lines: [
          `Dead bug · 2 × 10 | ${HOW.deadBug}`,
          `Bird dog · 2 × 8 por lado | ${HOW.birdDog}`,
          `Plancha lateral · 2 × 20-30" por lado | ${HOW.sidePlank}`,
          `Puente de glúteo · 2 × 15 | ${HOW.glute}`
        ] }
      ],
      notes: 'Si tienes tiempo, haz 2 vueltas del bloque de piernas (unos 45 minutos en total). Respira lento: los estiramientos se notan, pero no deben doler.'
    }
  ];
  return JSON.parse(JSON.stringify(workouts));
}

// Long ride target per week: blocks of 4 weeks, the 4th one is a deload week
const DEFAULT_BIKE_KM = [
  22, 25, 28, 22,
  28, 30, 30, 24,
  32, 35, 38, 28,
  38, 42, 45, 32,
  45, 48, 50, 35,
  50, 55, 58, 40,
  60, 63, 66, 45,
  68, 72, 50, 75
];

function defaultWeeks() {
  return DEFAULT_BIKE_KM.map((km, i) => {
    const pos = i % 4;
    // From spring on, gentler hybrids to keep the legs for the bike
    const late = i >= 20;
    const patterns = [
      { 1: 'fb-a', 2: 'r2', 4: 'fb-b', 5: 'mov' },
      { 1: 'fb-c', 2: late ? 'r2' : 'r1', 4: 'fb-a', 5: 'r4' },
      { 1: 'fb-b', 2: late ? 'r4' : 'r5', 4: 'fb-c', 5: 'mov' },
      { 1: 'fb-a', 2: 'r4', 4: 'fb-b' }
    ];
    let days = { ...patterns[pos] };
    let deload = pos === 3;
    let note = deload ? 'Semana de descarga: 1 serie menos, un 20 % menos de peso y los híbridos a 6/10.' : '';
    if (i === 5 || i === 6) note = 'Navidad: semana flexible. Si algún día no puedes, no pasa nada.';
    if (i === 18) note = 'Objetivo: salida de 50 km. Ritmo cómodo y come cada 30-45 minutos.';
    if (i === 30) {
      days = { 1: 'fb-b', 2: 'r4', 4: 'mov' };
      deload = true;
      note = 'Semana suave antes del objetivo: llega fresca a la salida del objetivo.';
    }
    if (i === 31) {
      days = { 1: 'fb-a', 2: 'r4', 4: 'mov' };
      deload = false;
      note = 'Objetivo de verano: salida de 75 km. Ritmo cómodo, y come y bebe desde el principio.';
    }
    days[6] = 'bike-long';
    if (km < 50 && !deload) days[7] = 'bike-easy';
    return { km, deload, note, days };
  });
}

function defaultPhases() {
  return [
    { name: 'Base de invierno', start: '2026-11-16', end: '2027-01-10', focus: 'Constancia. Si llueve, Plan B en la bici estática. Navidad flexible.' },
    { name: 'Construcción', start: '2027-01-11', end: '2027-03-07', focus: 'Subir poco a poco la salida larga hasta los 45 km.' },
    { name: 'Primer objetivo', start: '2027-03-08', end: '2027-04-04', focus: 'Llegar a los 50 km cómoda.' },
    { name: 'Primavera', start: '2027-04-05', end: '2027-05-30', focus: 'Más bici, de 50 a 66 km. Híbridos más suaves para guardar piernas.' },
    { name: 'Objetivo de verano', start: '2027-05-31', end: '2027-06-27', focus: 'Afinar y llegar a los 75 km.' }
  ];
}

function defaultGoals() {
  return [
    { id: 'g30', title: 'Primera salida de 30 km', date: '2027-01-02', km: 30, main: false, notes: '' },
    { id: 'g40', title: 'Salida de 40 km', date: '2027-02-20', km: 40, main: false, notes: '' },
    { id: 'g50', title: '50 km cómoda', date: '2027-03-27', km: 50, main: true, notes: 'Primer gran objetivo.' },
    { id: 'g60', title: 'Salida de 60 km', date: '2027-05-08', km: 60, main: false, notes: '' },
    { id: 'g75', title: '75 km de verano', date: '2027-06-26', km: 75, main: true, notes: 'Objetivo principal del año.' }
  ];
}

function defaultPlan() {
  return {
    version: PLAN_VERSION,
    startDate: '2026-11-16',
    workouts: defaultWorkouts(),
    weeks: defaultWeeks(),
    phases: defaultPhases(),
    goals: defaultGoals(),
    skipped: []
  };
}

// ---------- State & helpers ----------
let planTab = 'week';
let planWeekIndex = null;
let bikeChart = null;
let workoutDraft = null;

function createStrengthRoutines() {
  data.plan.workouts.filter(w => w.type === 'fuerza').forEach(w => ensureWorkoutRoutine(w));
}

function plan() {
  if (!data.plan) {
    data.plan = defaultPlan();
    createStrengthRoutines();
  }
  const p = data.plan;
  if (!Array.isArray(p.skipped)) p.skipped = [];
  if (!Array.isArray(p.goals)) p.goals = [];
  if (!Array.isArray(p.phases)) p.phases = [];
  // Weekday (1 = Monday ... 7 = Sunday) of the long and the easy ride
  if (!p.longDay) p.longDay = 6;
  if (!p.easyDay) p.easyDay = 7;
  if ((p.version || 1) < PLAN_VERSION) migratePlan(p);
  return p;
}

// Weekday of the long ride in week i (the chosen day if that week has none)
function longRideWd(i) {
  const days = plan().weeks[i].days;
  const wd = Object.keys(days).map(Number).find(d => LONG_RIDE_IDS.includes(days[d]));
  return wd || plan().longDay;
}

// Move a workout to another weekday; whatever was there takes its old place
function moveWorkoutTo(days, test, target) {
  const from = Object.keys(days).map(Number).find(d => test(days[d]));
  if (!from || from === target) return;
  const id = days[from];
  const displaced = days[target];
  delete days[from];
  days[target] = id;
  if (displaced) days[from] = displaced;
}

function applyRideDays(fromWeek) {
  const p = plan();
  p.weeks.forEach((week, i) => {
    if (i < fromWeek) return;
    // A workout already marked as done or skipped stays on its day (its mark is
    // tied to that date): neither moved nor swapped out by another one
    const settledDay = wd => wd && ['done', 'skipped'].includes(dayStatus(i, wd));
    const dayOf = test => Object.keys(week.days).map(Number).find(d => test(week.days[d]));
    const move = (test, target) => {
      if (settledDay(dayOf(test)) || settledDay(target)) return;
      moveWorkoutTo(week.days, test, target);
    };
    move(id => LONG_RIDE_IDS.includes(id), p.longDay);
    move(id => id === 'bike-easy', p.easyDay);
  });
}

// v2: stationary bike instead of a trainer, longer mobility, how-to for each
// exercise. v3: calf stretch against the wall. v4: Full Body A/B/C with her own
// exercises, one heavy hinge a week (RDL on B) and no chest work. v5: legs and
// upper body alternate within each Full Body. v6: ride texts no longer assume
// Saturday (the ride days can be chosen). v7: warm-up without push-ups.
// v8: the strength workouts also exist as routines in Rutina, to log the weights there.
// Default workouts never edited by hand get the new content.
function migratePlan(p) {
  const fresh = defaultWorkouts();
  p.workouts = p.workouts.map(w => (w.edited ? w : fresh.find(f => f.id === w.id) || w));
  p.phases.forEach(ph => {
    if (ph.focus) ph.focus = ph.focus.replace('Plan B de rodillo', 'Plan B en la bici estática');
  });
  if ((p.version || 1) < 8) createStrengthRoutines();
  p.version = PLAN_VERSION;
}

function planParse(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function planAddDays(s, n) {
  const d = planParse(s);
  d.setDate(d.getDate() + n);
  return todayStrOf(d);
}

function planDiff(a, b) {
  return Math.round((planParse(b) - planParse(a)) / 864e5);
}

function weekStart(i) { return planAddDays(plan().startDate, i * 7); }
function weekEnd(i) { return planAddDays(weekStart(i), 6); }
function weekDate(i, wd) { return planAddDays(weekStart(i), wd - 1); }

function currentWeekIndex() {
  const n = plan().weeks.length;
  const i = Math.floor(planDiff(plan().startDate, todayStr()) / 7);
  return Math.max(0, Math.min(n - 1, i));
}

function shownWeekIndex() {
  const n = plan().weeks.length;
  return planWeekIndex === null ? currentWeekIndex() : Math.max(0, Math.min(n - 1, planWeekIndex));
}

function workoutById(id) {
  return plan().workouts.find(w => w.id === id) || null;
}

function planColor(type) {
  return ACTIVITY_TYPES[(PLAN_TYPES[type] || PLAN_TYPES.movilidad).activity].color;
}

function phaseIndexFor(date) {
  return plan().phases.findIndex(ph => date >= ph.start && date <= ph.end);
}

function phaseColor(index) {
  return index < 0 ? 'var(--border-light)' : PHASE_COLORS[index % PHASE_COLORS.length];
}

function longDate(date) {
  const [y, m, d] = date.split('-').map(Number);
  return `${DAY_NAMES[new Date(y, m - 1, d).getDay()]}, ${d} de ${MONTH_NAMES[m - 1]}`;
}

function countdown(date) {
  const n = planDiff(todayStr(), date);
  if (n > 1) return `Faltan ${n} días`;
  if (n === 1) return 'Es mañana';
  if (n === 0) return 'Es hoy';
  return `Hace ${-n} ${n === -1 ? 'día' : 'días'}`;
}

function newPlanId(prefix) {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function valueOf(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function pushActivity(activity) {
  if (!data.activities) data.activities = [];
  data.activities.push(activity);
  data.activities.sort((a, b) => a.date.localeCompare(b.date));
}

// ---------- Bike rides ----------
// km come from the "km" field (rides logged from the plan) or from the notes
// of a ride added in the calendar ("40 km por el río")
function activityKm(a) {
  if (Number(a.km) > 0) return Number(a.km);
  const match = String(a.notes || '').match(/(\d+(?:[.,]\d+)?)\s*km/i);
  return match ? parseFloat(match[1].replace(',', '.')) : 0;
}

function bikeRides() {
  return (data.activities || [])
    .map((a, index) => ({ ...a, index, kmValue: activityKm(a) }))
    .filter(a => a.type === 'bike');
}

function weekRides(i) {
  const start = weekStart(i);
  const end = weekEnd(i);
  return bikeRides().filter(a => a.date >= start && a.date <= end);
}

function weekLongRide(i) {
  return Math.max(0, ...weekRides(i).map(a => a.kmValue));
}

function bestRide() {
  return Math.max(0, ...bikeRides().map(a => a.kmValue));
}

function goalAchieved(goal) {
  if (Number(goal.km) > 0) {
    const ride = bikeRides()
      .filter(a => a.kmValue >= Number(goal.km))
      .sort((a, b) => a.date.localeCompare(b.date))[0];
    return ride ? ride.date : null;
  }
  return goal.done ? (goal.doneDate || goal.date) : null;
}

function sortedGoals() {
  return [...plan().goals].sort((a, b) => a.date.localeCompare(b.date));
}

function nextGoal() {
  return sortedGoals().find(g => !goalAchieved(g)) || null;
}

// ---------- Day status ----------
function findPlanActivity(i, wd, id) {
  const acts = data.activities || [];
  if (LONG_RIDE_IDS.includes(id)) {
    const start = weekStart(i);
    const end = weekEnd(i);
    return acts.findIndex(a => a.date >= start && a.date <= end && LONG_RIDE_IDS.includes(a.planId));
  }
  const date = weekDate(i, wd);
  return acts.findIndex(a => a.planId === id && (a.planDate || a.date) === date);
}

function skipKey(i, wd, id) {
  return `${weekDate(i, wd)}:${id}`;
}

function dayStatus(i, wd) {
  const week = plan().weeks[i];
  const id = week.days[wd];
  if (!id) return 'rest';
  if (findPlanActivity(i, wd, id) >= 0) return 'done';
  // A long ride added from the calendar (with its km in the notes) also counts
  if (LONG_RIDE_IDS.includes(id) && weekLongRide(i) >= week.km * 0.8) return 'done';
  // A strength workout logged in its routine (Rutina) that week also counts
  if (routineLogDate(i, id)) return 'done';
  if (plan().skipped.includes(skipKey(i, wd, id))) return 'skipped';
  return 'pending';
}

function isOptional(wd, workout) {
  return OPTIONAL_WEEKDAYS.includes(wd) || !!(workout && workout.optional);
}

// ============ RENDER: PLAN VIEW ============
function renderPlan() {
  const container = document.getElementById('plan');
  if (!container || !data) return;
  const tabs = [['week', 'Semana'], ['workouts', 'Entrenos'], ['goals', 'Objetivos']];
  const tabsHtml = `
    <div class="chart-tabs plan-tabs">
      ${tabs.map(([key, label]) => `<button class="chart-tab ${planTab === key ? 'active' : ''}" onclick="switchPlanTab('${key}')">${label}</button>`).join('')}
    </div>`;
  let body;
  if (planTab === 'workouts') body = renderPlanWorkouts();
  else if (planTab === 'goals') body = renderPlanGoals();
  else body = renderPlanWeek();
  container.innerHTML = tabsHtml + body;
}

function switchPlanTab(tab) {
  planTab = tab;
  renderPlan();
  window.scrollTo(0, 0);
}

function changePlanWeek(delta) {
  planWeekIndex = shownWeekIndex() + delta;
  renderPlan();
}

function goToPlanWeek(i) {
  planWeekIndex = i;
  planTab = 'week';
  if (currentView !== 'plan') switchView('plan');
  else { renderPlan(); window.scrollTo(0, 0); }
}

function goToCurrentWeek() {
  planWeekIndex = null;
  renderPlan();
}

function renderPlanWeek() {
  const p = plan();
  const i = shownWeekIndex();
  const week = p.weeks[i];
  const start = weekStart(i);
  const end = weekEnd(i);
  const today = todayStr();
  const phaseIdx = phaseIndexFor(weekDate(i, longRideWd(i)));
  const phase = p.phases[phaseIdx];

  let planned = 0;
  let done = 0;
  const rows = [1, 2, 3, 4, 5, 6, 7].map(wd => {
    const date = weekDate(i, wd);
    const id = week.days[wd];
    const w = id ? workoutById(id) : null;
    const status = w ? dayStatus(i, wd) : 'rest';
    const optional = isOptional(wd, w);
    if (w && !optional) {
      planned++;
      if (status === 'done') done++;
    }
    let statusHtml = '';
    if (status === 'done') statusHtml = `<span class="plan-status done">${ICONS.check}Hecho</span>`;
    else if (status === 'skipped') statusHtml = '<span class="plan-status skipped">Saltado</span>';
    else if (w && date === today) statusHtml = '<span class="plan-status today">Hoy</span>';
    else if (w && date < today && !optional) statusHtml = '<span class="plan-status missed">Pendiente</span>';

    let sub = '';
    if (w && LONG_RIDE_IDS.includes(id)) sub = `Objetivo ${week.km} km${status === 'done' && weekLongRide(i) ? ` · hecho ${weekLongRide(i)} km` : ''}`;
    else if (w) sub = escapeHtml(w.summary || PLAN_TYPES[w.type].label);

    return `
      <button class="plan-day ${date === today ? 'is-today' : ''} ${status}" onclick="openPlanDay(${i}, ${wd})">
        <span class="plan-day-date"><small>${PLAN_WEEKDAYS[wd - 1].slice(0, 3)}</small><b>${parseInt(date.slice(8))}</b></span>
        <span class="plan-day-bar" style="background:${w ? planColor(w.type) : 'var(--border)'}"></span>
        <span class="plan-day-info">
          <span class="plan-day-title">${w ? escapeHtml(w.name) : 'Descanso'}${w && optional ? '<em>opcional</em>' : ''}</span>
          ${sub ? `<span class="plan-day-sub">${sub}</span>` : ''}
        </span>
        ${statusHtml}
      </button>`;
  }).join('');

  const ratio = planned ? done / planned : 0;
  const hero = `
    <div class="progress-card">
      <svg class="progress-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle class="ring-track" cx="32" cy="32" r="27"/>
        <circle class="ring-bar" cx="32" cy="32" r="27" transform="rotate(-90 32 32)"
          stroke-dasharray="${RING_LENGTH.toFixed(1)}" stroke-dashoffset="${(RING_LENGTH * (1 - ratio)).toFixed(1)}"/>
        <text x="32" y="37" text-anchor="middle">${done}/${planned}</text>
      </svg>
      <div class="progress-text">
        <span class="progress-title">Semana ${i + 1} de ${p.weeks.length}</span>
        <span class="progress-sub">${phase ? `${escapeHtml(phase.name)} · ` : ''}Bloque ${Math.floor(i / 4) + 1}${week.deload ? ' · Descarga' : ''}</span>
        <span class="progress-sub">Salida larga: ${week.km} km</span>
      </div>
    </div>`;

  const isCurrent = i === currentWeekIndex();

  return `
    ${hero}
    <div class="plan-week-nav">
      <button class="btn-icon" onclick="changePlanWeek(-1)" ${i === 0 ? 'disabled' : ''} aria-label="Semana anterior">${ICONS.chevronLeft}</button>
      <button class="plan-week-range" onclick="goToCurrentWeek()">
        ${formatShortDate(start)} – ${formatShortDate(end)}
        ${isCurrent ? '' : '<small>Volver a esta semana</small>'}
      </button>
      <button class="btn-icon" onclick="changePlanWeek(1)" ${i === p.weeks.length - 1 ? 'disabled' : ''} aria-label="Semana siguiente">${ICONS.chevronRight}</button>
    </div>
    ${renderWeek(start)}
    <div class="plan-days">${rows}</div>
    <p class="plan-hint">Pulsa un día para ver el entreno, marcarlo como hecho o cambiarlo.</p>`;
}

// ---------- Day modal ----------
function openPlanDay(i, wd) {
  const week = plan().weeks[i];
  const id = week.days[wd];
  const w = id ? workoutById(id) : null;
  if (!w) {
    openChangeWorkout(i, wd);
    return;
  }
  const date = weekDate(i, wd);
  const status = dayStatus(i, wd);
  const actIndex = findPlanActivity(i, wd, id);

  let actions = '';
  if (status === 'done') {
    const a = actIndex >= 0 ? data.activities[actIndex] : null;
    const logDate = routineLogDate(i, id);
    const detail = a
      ? [a.km ? `${a.km} km` : '', a.minutes ? `${a.minutes} min` : '', a.date !== date ? formatShortDate(a.date) : ''].filter(Boolean).join(' · ')
      : logDate ? `pesos apuntados en Rutina el ${formatShortDate(logDate)}` : `salida de ${weekLongRide(i)} km apuntada en el calendario`;
    actions += `<div class="plan-done-banner">${ICONS.check}<span>Hecho${detail ? ` · ${escapeHtml(detail)}` : ''}</span></div>`;
    if (a) actions += `<button class="btn-secondary" onclick="undoPlanDone(${i}, ${wd})">Deshacer</button>`;
  } else if (w.type === 'fuerza') {
    // Weights are logged exercise by exercise in Rutina; that marks the day as done
    actions += `<button class="btn-primary btn-with-icon" onclick="openWorkoutRoutine('${id}')">${ICONS.edit} Apuntar pesos en Rutina</button>`;
    actions += `<button class="btn-secondary" onclick="openPlanDone(${i}, ${wd})">Marcar como hecho sin pesos</button>`;
    actions += `<button class="btn-secondary" onclick="toggleSkip(${i}, ${wd})">${status === 'skipped' ? 'Quitar "saltado"' : 'Saltar este día'}</button>`;
  } else {
    actions += `<button class="btn-primary btn-with-icon" onclick="openPlanDone(${i}, ${wd})">${ICONS.check} Marcar como hecho</button>`;
    if (id === 'bike-long') actions += `<button class="btn-secondary" onclick="swapToIndoor(${i}, ${wd})">Llueve: cambiar por bici estática</button>`;
    actions += `<button class="btn-secondary" onclick="toggleSkip(${i}, ${wd})">${status === 'skipped' ? 'Quitar "saltado"' : 'Saltar este día'}</button>`;
  }
  actions += `<button class="btn-secondary" onclick="openChangeWorkout(${i}, ${wd})">Cambiar entreno</button>`;

  openModal(`
    <div class="modal-kicker">${escapeHtml(longDate(date))}</div>
    <h2>${escapeHtml(w.name)}</h2>
    ${LONG_RIDE_IDS.includes(id) ? `<div class="plan-chip">Objetivo de la semana: ${week.km} km</div>` : ''}
    ${week.deload && w.type !== 'bici' ? '<div class="plan-chip">Semana de descarga: 1 serie menos y menos peso</div>' : ''}
    ${workoutBody(w)}
    <div class="modal-actions">${actions}</div>
    <button class="btn-secondary" onclick="closeModal()">Cerrar</button>
  `);
}

// ---------- Strength logs ----------
// The weights of a plan strength workout are kept in a routine with the same name
// (so they show in Rutina, its history and its charts). Exercises are matched by
// name across all routines to find the last time each one was done.
function normName(name) {
  return String(name).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)/g, '').replace(/\s+/g, ' ').trim();
}

// Exercises with sets in the "Fuerza" block of a strength workout
function workoutExercises(w) {
  if (!w || w.type !== 'fuerza') return [];
  const out = [];
  (w.blocks || []).filter(b => /fuerza/i.test(b.title || '')).forEach(b => (b.lines || []).forEach(line => {
    const { parts } = splitLine(line);
    const match = (parts[1] || '').match(/^(\d+)\s*[x×]\s*(.+)$/);
    if (match) out.push({ name: parts[0].trim(), sets: parseInt(match[1]), reps: match[2].trim() });
  }));
  return out;
}

// The routine in Rutina for a strength workout, created with its exercises if missing
// (each one starts with the last weight used for it, if any)
function ensureWorkoutRoutine(w) {
  let routine = data.routines.find(r => r.name === w.name);
  if (routine) return routine;
  routine = {
    name: w.name,
    exercises: workoutExercises(w).map(ex => {
      const last = lastLogFor(ex.name);
      const weight = last ? (last.log.weights ? last.log.weights[0] : last.log.weight) : 0;
      return { name: ex.name, sets: ex.sets, reps: ex.reps, weight: weight || 0, unit: 'kg', done: false, logs: [] };
    })
  };
  data.routines.push(routine);
  return routine;
}

// Date of a log in the workout's routine within week i (null if none)
function routineLogDate(i, id) {
  const w = workoutById(id);
  if (!w || w.type !== 'fuerza') return null;
  const routine = data.routines.find(r => r.name === w.name);
  if (!routine) return null;
  const start = weekStart(i);
  const end = weekEnd(i);
  let found = null;
  routine.exercises.forEach(ex => ex.logs.forEach(l => {
    if (l.date >= start && l.date <= end && (!found || l.date < found)) found = l.date;
  }));
  return found;
}

function openWorkoutRoutine(id) {
  const w = workoutById(id);
  if (!w) return;
  const routine = ensureWorkoutRoutine(w);
  data.activeRoutine = data.routines.indexOf(routine);
  saveData(data);
  closeModal();
  switchView('routine');
}

function lastLogFor(name) {
  const key = normName(name);
  let best = null;
  data.routines.forEach(r => r.exercises.forEach(ex => {
    if (normName(ex.name) !== key) return;
    ex.logs.forEach(log => {
      if (!best || log.date > best.log.date) best = { log, unit: ex.unit || 'kg' };
    });
  }));
  return best;
}

function lastLogText(name) {
  const last = lastLogFor(name);
  return last ? `Última vez · ${formatShortDate(last.log.date)} · ${formatLogDetail(last.log, last.unit)}` : '';
}

function openPlanDone(i, wd) {
  const id = plan().weeks[i].days[wd];
  const w = workoutById(id);
  if (!w) return;
  const date = weekDate(i, wd);
  if (w.type === 'bici') {
    openBikeLog(date, id);
    return;
  }
  // Strength weights are logged in Rutina; this form only marks the day as done
  openModal(`
    <h2>${escapeHtml(w.name)}</h2>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="plan-done-date" value="${date}">
    </div>
    <div class="form-group">
      <label>Duración (min)</label>
      <input type="number" inputmode="numeric" id="plan-done-minutes" value="${w.minutes || ''}" placeholder="Opcional">
    </div>
    <div class="form-group">
      <label>Notas</label>
      <input type="text" id="plan-done-notes" placeholder="Ej: tiempo total 42', bajé reps en burpees...">
    </div>
    <button class="btn-primary" onclick="savePlanDone(${i}, ${wd})">Guardar</button>
    <button class="btn-secondary" onclick="openPlanDay(${i}, ${wd})">Volver</button>
  `);
}

function savePlanDone(i, wd) {
  const id = plan().weeks[i].days[wd];
  const w = workoutById(id);
  if (!w) return;
  const planned = weekDate(i, wd);
  // The calendar gets the real date; planDate ties it to the planned day
  pushActivity({
    date: valueOf('plan-done-date') || planned,
    type: PLAN_TYPES[w.type].activity,
    minutes: parseInt(valueOf('plan-done-minutes')) || null,
    notes: valueOf('plan-done-notes'),
    routine: w.name,
    planId: id,
    planDate: planned
  });
  unskip(i, wd, id);
  saveData(data);
  closeModal();
  toast('¡Entreno hecho!');
}

// Only removes the "done" mark: weights logged in Rutina are kept
function undoPlanDone(i, wd) {
  const id = plan().weeks[i].days[wd];
  const index = findPlanActivity(i, wd, id);
  if (index < 0) return;
  if (!confirm('¿Quitar el "hecho"? También se borra del calendario.')) return;
  data.activities.splice(index, 1);
  saveData(data);
  closeModal();
  toast('Marcado como pendiente');
}

function unskip(i, wd, id) {
  const key = skipKey(i, wd, id);
  plan().skipped = plan().skipped.filter(k => k !== key);
}

function toggleSkip(i, wd) {
  const id = plan().weeks[i].days[wd];
  const key = skipKey(i, wd, id);
  const p = plan();
  if (p.skipped.includes(key)) p.skipped = p.skipped.filter(k => k !== key);
  else p.skipped.push(key);
  saveData(data);
  closeModal();
}

function swapToIndoor(i, wd) {
  plan().weeks[i].days[wd] = 'bike-indoor';
  saveData(data);
  openPlanDay(i, wd);
  toast('Cambiado por bici estática');
}

function openChangeWorkout(i, wd) {
  const current = plan().weeks[i].days[wd] || '';
  const groups = Object.keys(PLAN_TYPES).map(type => {
    const list = plan().workouts.filter(w => w.type === type);
    if (!list.length) return '';
    return `
      <div class="pick-group-title">${PLAN_TYPES[type].label}</div>
      ${list.map(w => `
        <button class="pick-option ${w.id === current ? 'active' : ''}" onclick="setPlanDay(${i}, ${wd}, '${escapeHtml(w.id)}')">
          <span class="act-dot" style="background:${planColor(w.type)}"></span>
          <span>${escapeHtml(w.name)}</span>
        </button>`).join('')}`;
  }).join('');

  openModal(`
    <div class="modal-kicker">${escapeHtml(longDate(weekDate(i, wd)))}</div>
    <h2>Elegir entreno</h2>
    <label class="check-row">
      <input type="checkbox" id="change-all">
      <span>Aplicar a todos los ${PLAN_WEEKDAYS[wd - 1].toLowerCase()} siguientes</span>
    </label>
    <div class="pick-list">
      <button class="pick-option ${current ? '' : 'active'}" onclick="setPlanDay(${i}, ${wd}, '')">
        <span class="act-dot" style="background:var(--border-light)"></span><span>Descanso</span>
      </button>
      ${groups}
    </div>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function setPlanDay(i, wd, id) {
  const all = document.getElementById('change-all');
  const weeks = plan().weeks;
  const last = all && all.checked ? weeks.length - 1 : i;
  for (let j = i; j <= last; j++) {
    if (id) weeks[j].days[wd] = id;
    else delete weeks[j].days[wd];
  }
  saveData(data);
  if (id) openPlanDay(i, wd);
  else closeModal();
  toast(last > i ? 'Cambiado en las semanas siguientes' : 'Día cambiado');
}

// ---------- Workout detail ----------
// "Name · dose | how to do it"
function splitLine(line) {
  const [main, ...how] = String(line).split(' | ');
  return { parts: main.split(' · '), how: how.join(' | ').trim() };
}

function formatLine(line) {
  const { parts, how } = splitLine(line);
  let html = escapeHtml(parts[0]);
  if (parts.length > 1) html += `<span class="workout-dose">${parts.slice(1).map(escapeHtml).join(' · ')}</span>`;
  if (how) html += `<span class="workout-how">${escapeHtml(how)}</span>`;
  return html;
}

function workoutBody(w) {
  const meta = [PLAN_TYPES[w.type] ? PLAN_TYPES[w.type].label : '', w.minutes ? `${w.minutes} min` : '', w.optional ? 'opcional' : '']
    .filter(Boolean).join(' · ');
  const blocks = (w.blocks || []).map(b => `
    <div class="workout-block">
      ${b.title ? `<div class="workout-block-title">${escapeHtml(b.title)}</div>` : ''}
      <ul>${(b.lines || []).map(l => {
        const last = w.type === 'fuerza' && /fuerza/i.test(b.title || '') ? lastLogText(splitLine(l).parts[0]) : '';
        return `<li>${formatLine(l)}${last ? `<span class="workout-last">${last}</span>` : ''}</li>`;
      }).join('')}</ul>
    </div>`).join('');
  return `
    <div class="workout-body">
      <div class="workout-meta"><span class="act-dot" style="background:${planColor(w.type)}"></span>${escapeHtml(meta)}</div>
      ${w.summary ? `<p class="modal-text">${escapeHtml(w.summary)}</p>` : ''}
      ${blocks}
      ${w.notes ? `<div class="plan-note">${escapeHtml(w.notes)}</div>` : ''}
    </div>`;
}

function renderPlanWorkouts() {
  const p = plan();
  const groups = Object.keys(PLAN_TYPES).map(type => {
    const list = p.workouts.filter(w => w.type === type);
    if (!list.length) return '';
    return `
      <div class="plan-group-title">${PLAN_TYPES[type].label}</div>
      ${list.map(w => {
        const meta = [w.minutes ? `${w.minutes} min` : '', w.optional ? 'opcional' : ''].filter(Boolean).join(' · ');
        return `
          <button class="plan-card" onclick="openWorkout('${escapeHtml(w.id)}')">
            <span class="plan-day-bar" style="background:${planColor(w.type)}"></span>
            <span class="plan-day-info">
              <span class="plan-day-title">${escapeHtml(w.name)}</span>
              ${w.summary ? `<span class="plan-day-sub">${escapeHtml(w.summary)}</span>` : ''}
            </span>
            ${meta ? `<span class="plan-card-meta">${escapeHtml(meta)}</span>` : ''}
          </button>`;
      }).join('')}`;
  }).join('');

  return `
    <div class="plan-section-head">
      <span class="routine-title">Entrenos</span>
      <button class="btn-small" onclick="openWorkoutEditor()">${ICONS.plus} Nuevo</button>
    </div>
    <div class="plan-days">${groups || '<p class="day-empty">No hay entrenos todavía</p>'}</div>`;
}

function openWorkout(id) {
  const w = workoutById(id);
  if (!w) return;
  openModal(`
    <h2>${escapeHtml(w.name)}</h2>
    ${workoutBody(w)}
    <div class="modal-actions">
      <button class="btn-primary btn-with-icon" onclick="openWorkoutEditor('${escapeHtml(w.id)}')">${ICONS.edit} Editar</button>
      ${w.type === 'fuerza' ? `<button class="btn-secondary" onclick="workoutToRoutine('${escapeHtml(w.id)}')">Crear rutina para apuntar pesos</button>` : ''}
      <button class="btn-secondary" onclick="duplicateWorkout('${escapeHtml(w.id)}')">Duplicar</button>
    </div>
    <button class="btn-secondary" onclick="closeModal()">Cerrar</button>
    <button class="btn-danger-full" onclick="deleteWorkout('${escapeHtml(w.id)}')">Eliminar entreno</button>
  `);
}

function duplicateWorkout(id) {
  const w = workoutById(id);
  if (!w) return;
  const copy = JSON.parse(JSON.stringify(w));
  copy.id = newPlanId('w');
  copy.name = `${w.name} (copia)`;
  plan().workouts.push(copy);
  saveData(data);
  openWorkout(copy.id);
  toast('Entreno duplicado');
}

function deleteWorkout(id) {
  const w = workoutById(id);
  if (!w) return;
  const p = plan();
  const uses = p.weeks.reduce((n, week) => n + Object.values(week.days).filter(d => d === id).length, 0);
  const msg = uses
    ? `"${w.name}" está en ${uses} ${uses === 1 ? 'día' : 'días'} del plan. Esos días quedarán como descanso. ¿Eliminarlo?`
    : `¿Eliminar "${w.name}"?`;
  if (!confirm(msg)) return;
  p.weeks.forEach(week => Object.keys(week.days).forEach(k => { if (week.days[k] === id) delete week.days[k]; }));
  p.workouts = p.workouts.filter(x => x.id !== id);
  saveData(data);
  closeModal();
  toast('Entreno eliminado');
}

// Strength workouts can become a routine, to log weights with the usual cards
function workoutToRoutine(id) {
  const w = workoutById(id);
  if (!w) return;
  const exercises = [];
  (w.blocks || []).forEach(b => (b.lines || []).forEach(line => {
    const { parts } = splitLine(line);
    const match = (parts[1] || '').match(/^(\d+)\s*[x×]\s*(.+)$/);
    if (!match) return;
    exercises.push({
      name: parts[0].replace(/^[A-Z]\d\.\s*/, '').trim(),
      sets: parseInt(match[1]),
      reps: match[2].trim(),
      weight: 0,
      unit: 'kg',
      done: false,
      logs: []
    });
  }));
  if (!exercises.length) {
    toast('No hay ejercicios con series (ej: "Sentadilla · 4 × 8")');
    return;
  }
  if (data.routines.some(r => r.name === w.name) && !confirm(`Ya tienes una rutina llamada "${w.name}". ¿Crear otra?`)) return;
  data.routines.push({ name: w.name, exercises });
  saveData(data);
  closeModal();
  toast('Rutina creada: la tienes en la pestaña Rutina');
}

// ---------- Workout editor ----------
function openWorkoutEditor(id) {
  const w = id ? workoutById(id) : null;
  workoutDraft = w
    ? JSON.parse(JSON.stringify(w))
    : {
        id: null, name: '', type: 'hibrido', minutes: 60, summary: '', optional: false, notes: '',
        blocks: [{ title: 'Calentamiento', lines: [] }, { title: 'Bloque principal', lines: [] }]
      };
  if (!Array.isArray(workoutDraft.blocks)) workoutDraft.blocks = [];
  renderWorkoutEditor();
}

function renderWorkoutEditor() {
  const d = workoutDraft;
  const typeOptions = Object.entries(PLAN_TYPES)
    .map(([key, t]) => `<option value="${key}" ${d.type === key ? 'selected' : ''}>${t.label}</option>`).join('');
  const blocks = d.blocks.map((b, bi) => `
    <div class="block-editor">
      <div class="block-editor-head">
        <input type="text" id="wb-title-${bi}" value="${escapeHtml(b.title || '')}" placeholder="Título del bloque (ej: EMOM 20')">
        <button class="btn-icon danger" onclick="removeDraftBlock(${bi})" aria-label="Quitar bloque">${ICONS.trash}</button>
      </div>
      <textarea id="wb-lines-${bi}" rows="${Math.max(3, (b.lines || []).length + 1)}" placeholder="Un ejercicio por línea">${escapeHtml((b.lines || []).join('\n'))}</textarea>
    </div>`).join('');

  openModal(`
    <h2>${d.id ? 'Editar entreno' : 'Nuevo entreno'}</h2>
    <div class="form-group">
      <label>Nombre</label>
      <input type="text" id="wd-name" value="${escapeHtml(d.name)}" placeholder="Ej: Intervalos air bike">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Tipo</label>
        <select id="wd-type">${typeOptions}</select>
      </div>
      <div class="form-group">
        <label>Duración (min)</label>
        <input type="number" inputmode="numeric" id="wd-minutes" value="${d.minutes || ''}">
      </div>
    </div>
    <div class="form-group">
      <label>Resumen</label>
      <input type="text" id="wd-summary" value="${escapeHtml(d.summary || '')}" placeholder="Una línea para verlo de un vistazo">
    </div>
    <label class="check-row">
      <input type="checkbox" id="wd-optional" ${d.optional ? 'checked' : ''}>
      <span>Entreno opcional (no cuenta en el progreso de la semana)</span>
    </label>
    <h3 class="modal-section">Bloques</h3>
    <p class="modal-text">Un ejercicio por línea. Si quieres, separa la dosis con " · " y añade cómo se hace después de " | ", por ejemplo: <b>Sentadilla · 4 × 8 · desc. 2' | Espalda recta y rodillas hacia fuera</b></p>
    ${blocks}
    <button class="btn-secondary btn-with-icon" onclick="addDraftBlock()">${ICONS.plus} Añadir bloque</button>
    <div class="form-group" style="margin-top:14px">
      <label>Notas</label>
      <textarea id="wd-notes" rows="3" placeholder="Consejos, cómo escalarlo...">${escapeHtml(d.notes || '')}</textarea>
    </div>
    <button class="btn-primary" onclick="saveWorkoutDraft()">Guardar</button>
    <button class="btn-secondary" onclick="${d.id ? `openWorkout('${escapeHtml(d.id)}')` : 'closeModal()'}">Cancelar</button>
  `);
}

function readWorkoutDraft() {
  const d = workoutDraft;
  d.name = valueOf('wd-name');
  d.type = valueOf('wd-type') || 'hibrido';
  d.minutes = parseInt(valueOf('wd-minutes')) || null;
  d.summary = valueOf('wd-summary');
  d.optional = !!(document.getElementById('wd-optional') || {}).checked;
  d.notes = valueOf('wd-notes');
  d.blocks = d.blocks.map((b, bi) => ({
    title: valueOf(`wb-title-${bi}`),
    lines: (document.getElementById(`wb-lines-${bi}`) || { value: '' }).value.split('\n').map(l => l.trim()).filter(Boolean)
  }));
}

function addDraftBlock() {
  readWorkoutDraft();
  workoutDraft.blocks.push({ title: '', lines: [] });
  renderWorkoutEditor();
}

function removeDraftBlock(bi) {
  readWorkoutDraft();
  workoutDraft.blocks.splice(bi, 1);
  renderWorkoutEditor();
}

function saveWorkoutDraft() {
  readWorkoutDraft();
  const d = workoutDraft;
  if (!d.name) {
    toast('Escribe un nombre');
    return;
  }
  d.blocks = d.blocks.filter(b => b.title || b.lines.length);
  // Hand-edited workouts are kept as they are by future plan updates
  d.edited = true;
  const p = plan();
  if (d.id) {
    const index = p.workouts.findIndex(w => w.id === d.id);
    if (index >= 0) p.workouts[index] = d;
    else p.workouts.push(d);
  } else {
    d.id = newPlanId('w');
    p.workouts.push(d);
  }
  saveData(data);
  openWorkout(d.id);
  toast('Entreno guardado');
}

// ============ RENDER: GOALS ============
function renderPlanGoals() {
  const p = plan();
  const today = todayStr();
  const best = bestRide();
  const goal = nextGoal();

  let hero = '';
  if (goal) {
    const target = Number(goal.km) || 0;
    const pct = target ? Math.min(100, best / target * 100) : 0;
    hero = `
      <div class="goal-hero">
        <span class="goal-hero-kicker">${ICONS.trophy} Próximo objetivo</span>
        <span class="goal-hero-title">${escapeHtml(goal.title)}</span>
        <span class="goal-hero-sub">${formatShortDate(goal.date)} · ${countdown(goal.date)}</span>
        ${target ? `
          <div class="goal-progress"><div style="width:${pct.toFixed(1)}%"></div></div>
          <span class="goal-hero-sub">Tu mejor salida: ${best} km de ${target} km</span>` : ''}
      </div>`;
  }

  const goalsHtml = sortedGoals().map(g => {
    const achieved = goalAchieved(g);
    const status = achieved
      ? `<span class="plan-status done">${ICONS.check}${formatShortDate(achieved)}</span>`
      : `<span class="goal-countdown">${g.date >= today ? countdown(g.date) : 'Fecha pasada'}</span>`;
    return `
      <button class="goal-item ${g.main ? 'main' : ''} ${achieved ? 'achieved' : ''}" onclick="openGoalEditor('${escapeHtml(g.id)}')">
        <span class="goal-icon">${g.main ? ICONS.trophy : ICONS.check}</span>
        <span class="plan-day-info">
          <span class="plan-day-title">${escapeHtml(g.title)}</span>
          <span class="plan-day-sub">${formatShortDate(g.date)}${g.km ? ` · ${g.km} km` : ''}</span>
        </span>
        ${status}
      </button>`;
  }).join('');

  const phasesHtml = p.phases.map((ph, idx) => {
    const current = today >= ph.start && today <= ph.end;
    return `
      <button class="phase-item ${current ? 'current' : ''}" onclick="openPhaseEditor(${idx})">
        <span class="phase-dot" style="background:${phaseColor(idx)}"></span>
        <span class="plan-day-info">
          <span class="plan-day-title">${escapeHtml(ph.name)}${current ? '<em>ahora</em>' : ''}</span>
          <span class="plan-day-sub">${formatShortDate(ph.start)} – ${formatShortDate(ph.end)}</span>
          ${ph.focus ? `<span class="phase-focus">${escapeHtml(ph.focus)}</span>` : ''}
        </span>
      </button>`;
  }).join('');

  return `
    ${hero}
    <div class="plan-section">
      <div class="plan-section-row">
        <span class="report-title">Objetivos</span>
        <button class="btn-small" onclick="openGoalEditor()">${ICONS.plus} Añadir</button>
      </div>
      <div class="plan-stack">${goalsHtml || '<p class="day-empty">Sin objetivos todavía</p>'}</div>
      <p class="plan-hint left">Los objetivos con km se marcan solos cuando registras una salida igual o más larga.</p>
    </div>
    <div class="plan-section">
      <div class="plan-section-row">
        <span class="report-title">Calendario del plan</span>
      </div>
      ${renderPlanCalendar()}
    </div>
    <div class="plan-section">
      <div class="plan-section-row">
        <span class="report-title">Fases</span>
        <button class="btn-small" onclick="openPhaseEditor()">${ICONS.plus} Añadir</button>
      </div>
      <div class="plan-stack">${phasesHtml}</div>
    </div>
    <div class="plan-section">
      <div class="plan-section-row"><span class="report-title">Ajustes del plan</span></div>
      <p class="plan-hint left">Empieza el ${longDate(p.startDate)} · ${p.weeks.length} semanas, hasta el ${longDate(weekEnd(p.weeks.length - 1))}.</p>
      <p class="plan-hint left">Salida larga los ${weekdayPlural(p.longDay)} · salida suave los ${weekdayPlural(p.easyDay)}.</p>
      <button class="btn-secondary" onclick="openRideDays()">Cambiar días de bici</button>
      <button class="btn-secondary" onclick="openPlanSettings()">Cambiar fecha de inicio</button>
      <button class="btn-secondary" onclick="addPlanBlock()">Añadir 4 semanas al final</button>
      <button class="btn-danger-full" onclick="resetPlan()">Restablecer el plan original</button>
    </div>`;
}

// ---------- Plan calendar (one month at a time) ----------
let planCalMonth = null;

function planMonthBounds() {
  const p = plan();
  const [sy, sm] = p.startDate.split('-').map(Number);
  const [ey, em] = weekEnd(p.weeks.length - 1).split('-').map(Number);
  return { first: new Date(sy, sm - 1, 1), last: new Date(ey, em - 1, 1) };
}

function renderPlanCalendar() {
  const p = plan();
  const today = todayStr();
  const { first, last } = planMonthBounds();
  if (!planCalMonth) {
    const now = new Date();
    planCalMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  if (planCalMonth < first) planCalMonth = first;
  if (planCalMonth > last) planCalMonth = last;

  const year = planCalMonth.getFullYear();
  const month = planCalMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const planEnd = weekEnd(p.weeks.length - 1);

  let cells = WEEKDAYS.map(w => `<span class="cal-weekday">${w}</span>`).join('');
  cells += '<span></span>'.repeat(offset);

  for (let d = 1; d <= daysInMonth; d++) {
    const date = dateKey(year, month, d);
    const classes = ['pcal-day'];
    if (date === today) classes.push('today');
    const goal = p.goals.find(g => g.date === date);
    const trophy = goal ? `<span class="pcal-goal" title="${escapeHtml(goal.title)}">${ICONS.trophy}</span>` : '';

    if (date < p.startDate || date > planEnd) {
      cells += `<span class="${classes.join(' ')} outside"><span class="pcal-num">${d}</span>${trophy}</span>`;
      continue;
    }

    const i = Math.floor(planDiff(p.startDate, date) / 7);
    const wd = planDiff(weekStart(i), date) + 1;
    const week = p.weeks[i];
    const w = workoutById(week.days[wd]);
    const status = dayStatus(i, wd);
    if (week.deload) classes.push('deload');
    classes.push(status);

    let mark = '';
    let label = `${d} de ${MONTH_NAMES[month]}: descanso`;
    if (w) {
      const color = planColor(w.type);
      const isLong = LONG_RIDE_IDS.includes(w.id);
      mark = isLong
        ? `<span class="pcal-km" style="--c:${color}">${week.km}</span>`
        : `<span class="pcal-mark" style="--c:${color}"></span>`;
      classes.push('has-workout');
      label = `${d} de ${MONTH_NAMES[month]}: ${w.name}${isLong ? ` ${week.km} km` : ''}${status === 'done' ? ', hecho' : status === 'skipped' ? ', saltado' : ''}`;
      cells += `<button class="${classes.join(' ')}" style="--c:${color}" onclick="openPlanDay(${i}, ${wd})" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">
          <span class="pcal-num">${d}</span>${mark}${trophy}
        </button>`;
    } else {
      cells += `<button class="${classes.join(' ')}" onclick="openPlanDay(${i}, ${wd})" aria-label="${escapeHtml(label)}"><span class="pcal-num">${d}</span>${trophy}</button>`;
    }
  }

  const legend = Object.keys(PLAN_TYPES).map(t =>
    `<span><span class="act-dot" style="background:${planColor(t)}"></span>${PLAN_TYPES[t].label}</span>`
  ).join('');

  return `
    <div class="pcal-head">
      <button class="btn-icon" onclick="changePlanCalMonth(-1)" ${planCalMonth <= first ? 'disabled' : ''} aria-label="Mes anterior">${ICONS.chevronLeft}</button>
      <span class="pcal-title">${MONTH_NAMES[month]} ${year}</span>
      <button class="btn-icon" onclick="changePlanCalMonth(1)" ${planCalMonth >= last ? 'disabled' : ''} aria-label="Mes siguiente">${ICONS.chevronRight}</button>
    </div>
    <div class="calendar-grid pcal-grid">${cells}</div>
    <div class="calendar-legend">${legend}</div>
    <p class="plan-hint left">El número es la salida larga de esa semana, en km. Relleno de color: hecho. Borde discontinuo: semana de descarga. Pulsa un día para ver o marcar el entreno.</p>`;
}

function changePlanCalMonth(delta) {
  planCalMonth = new Date(planCalMonth.getFullYear(), planCalMonth.getMonth() + delta, 1);
  renderPlan();
}

function openGoalEditor(id) {
  const g = id ? plan().goals.find(x => x.id === id) : null;
  const achieved = g ? goalAchieved(g) : null;
  openModal(`
    <h2>${g ? 'Editar objetivo' : 'Nuevo objetivo'}</h2>
    ${achieved ? `<div class="plan-done-banner">${ICONS.check}<span>Conseguido el ${formatShortDate(achieved)}</span></div>` : ''}
    <div class="form-group">
      <label>Objetivo</label>
      <input type="text" id="goal-title" value="${escapeHtml(g ? g.title : '')}" placeholder="Ej: Ruta del Cares">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Fecha</label>
        <input type="date" id="goal-date" value="${g ? g.date : todayStr()}">
      </div>
      <div class="form-group">
        <label>Distancia (km)</label>
        <input type="number" inputmode="decimal" id="goal-km" value="${g && g.km ? g.km : ''}" placeholder="Opcional">
      </div>
    </div>
    <div class="form-group">
      <label>Notas</label>
      <input type="text" id="goal-notes" value="${escapeHtml(g ? g.notes || '' : '')}" placeholder="Opcional">
    </div>
    <label class="check-row">
      <input type="checkbox" id="goal-main" ${g && g.main ? 'checked' : ''}>
      <span>Objetivo principal</span>
    </label>
    <label class="check-row">
      <input type="checkbox" id="goal-done" ${g && g.done ? 'checked' : ''}>
      <span>Marcar como conseguido (para objetivos sin km)</span>
    </label>
    <button class="btn-primary" onclick="saveGoal(${g ? `'${escapeHtml(g.id)}'` : 'null'})">Guardar</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    ${g ? `<button class="btn-danger-full" onclick="deleteGoal('${escapeHtml(g.id)}')">Eliminar objetivo</button>` : ''}
  `);
}

function saveGoal(id) {
  const title = valueOf('goal-title');
  if (!title) {
    toast('Escribe el objetivo');
    return;
  }
  const p = plan();
  const done = document.getElementById('goal-done').checked;
  const fields = {
    title,
    date: valueOf('goal-date') || todayStr(),
    km: parseFloat(valueOf('goal-km').replace(',', '.')) || null,
    notes: valueOf('goal-notes'),
    main: document.getElementById('goal-main').checked,
    done
  };
  if (id) {
    const g = p.goals.find(x => x.id === id);
    if (!g) return;
    if (done && !g.done) fields.doneDate = todayStr();
    Object.assign(g, fields);
  } else {
    p.goals.push({ id: newPlanId('g'), ...fields, doneDate: done ? todayStr() : null });
  }
  saveData(data);
  closeModal();
  toast('Objetivo guardado');
}

function deleteGoal(id) {
  if (!confirm('¿Eliminar este objetivo?')) return;
  plan().goals = plan().goals.filter(g => g.id !== id);
  saveData(data);
  closeModal();
  toast('Objetivo eliminado');
}

function openPhaseEditor(idx) {
  const p = plan();
  const ph = idx === undefined ? null : p.phases[idx];
  const last = p.phases[p.phases.length - 1];
  const start = ph ? ph.start : (last ? planAddDays(last.end, 1) : p.startDate);
  const end = ph ? ph.end : planAddDays(start, 27);
  openModal(`
    <h2>${ph ? 'Editar fase' : 'Nueva fase'}</h2>
    <div class="form-group">
      <label>Nombre</label>
      <input type="text" id="phase-name" value="${escapeHtml(ph ? ph.name : '')}" placeholder="Ej: Verano">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Desde</label>
        <input type="date" id="phase-start" value="${start}">
      </div>
      <div class="form-group">
        <label>Hasta</label>
        <input type="date" id="phase-end" value="${end}">
      </div>
    </div>
    <div class="form-group">
      <label>En qué centrarse</label>
      <textarea id="phase-focus" rows="3">${escapeHtml(ph ? ph.focus || '' : '')}</textarea>
    </div>
    <button class="btn-primary" onclick="savePhase(${ph ? idx : 'null'})">Guardar</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
    ${ph ? `<button class="btn-danger-full" onclick="deletePhase(${idx})">Eliminar fase</button>` : ''}
  `);
}

function savePhase(idx) {
  const name = valueOf('phase-name');
  const start = valueOf('phase-start');
  const end = valueOf('phase-end');
  if (!name || !start || !end) {
    toast('Rellena el nombre y las fechas');
    return;
  }
  if (end < start) {
    toast('La fecha final va antes que la inicial');
    return;
  }
  const fields = { name, start, end, focus: valueOf('phase-focus') };
  const p = plan();
  if (idx === null) p.phases.push(fields);
  else Object.assign(p.phases[idx], fields);
  p.phases.sort((a, b) => a.start.localeCompare(b.start));
  saveData(data);
  closeModal();
  toast('Fase guardada');
}

function deletePhase(idx) {
  if (!confirm('¿Eliminar esta fase?')) return;
  plan().phases.splice(idx, 1);
  saveData(data);
  closeModal();
}

function openPlanSettings() {
  openModal(`
    <h2>Fecha de inicio</h2>
    <p class="modal-text">Las semanas del plan empiezan en lunes. Si eliges otro día, se usa el lunes de esa semana.</p>
    <div class="form-group">
      <label>Inicio del plan</label>
      <input type="date" id="plan-start" value="${plan().startDate}">
    </div>
    <label class="check-row">
      <input type="checkbox" id="plan-shift" checked>
      <span>Mover también las fases y los objetivos</span>
    </label>
    <button class="btn-primary" onclick="savePlanSettings()">Guardar</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function savePlanSettings() {
  const raw = valueOf('plan-start');
  if (!raw) return;
  const date = planParse(raw);
  date.setDate(date.getDate() - (date.getDay() + 6) % 7);
  const start = todayStrOf(date);
  const p = plan();
  const delta = planDiff(p.startDate, start);
  if (!delta) {
    closeModal();
    return;
  }
  if (document.getElementById('plan-shift').checked) {
    p.phases.forEach(ph => { ph.start = planAddDays(ph.start, delta); ph.end = planAddDays(ph.end, delta); });
    p.goals.forEach(g => { g.date = planAddDays(g.date, delta); });
  }
  // Skipped marks belong to the old dates
  p.skipped = [];
  p.startDate = start;
  planWeekIndex = null;
  saveData(data);
  closeModal();
  toast(`El plan empieza el ${formatShortDate(start)}`);
}

// "los lunes", "los sábados"
function weekdayPlural(wd) {
  const name = PLAN_WEEKDAYS[wd - 1].toLowerCase();
  return name.endsWith('s') ? name : name + 's';
}

function openRideDays() {
  const p = plan();
  const options = selected => PLAN_WEEKDAYS.map((name, k) =>
    `<option value="${k + 1}" ${k + 1 === selected ? 'selected' : ''}>${name}</option>`).join('');
  openModal(`
    <h2>Días de bici</h2>
    <p class="modal-text">Las salidas se mueven a estos días desde esta semana en adelante. Si ese día había otro entreno, pasa al día que deja libre la salida.</p>
    <div class="form-group">
      <label>Salida larga</label>
      <select id="ride-long-day">${options(p.longDay)}</select>
    </div>
    <div class="form-group">
      <label>Salida suave</label>
      <select id="ride-easy-day">${options(p.easyDay)}</select>
    </div>
    <button class="btn-primary" onclick="saveRideDays()">Guardar</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function saveRideDays() {
  const longDay = parseInt(valueOf('ride-long-day'));
  const easyDay = parseInt(valueOf('ride-easy-day'));
  if (longDay === easyDay) {
    toast('Elige días distintos para cada salida');
    return;
  }
  const p = plan();
  p.longDay = longDay;
  p.easyDay = easyDay;
  applyRideDays(todayStr() >= p.startDate ? currentWeekIndex() : 0);
  saveData(data);
  closeModal();
  toast(`Salida larga los ${weekdayPlural(longDay)}`);
}

function addPlanBlock() {
  const p = plan();
  const lastBlock = p.weeks.slice(-4);
  const maxKm = Math.max(...p.weeks.map(w => w.km));
  lastBlock.forEach((w, k) => {
    const copy = JSON.parse(JSON.stringify(w));
    copy.km = k === 3 ? Math.round(maxKm * 0.65) : maxKm;
    copy.deload = k === 3;
    copy.note = copy.deload ? 'Semana de descarga: 1 serie menos, un 20 % menos de peso y los híbridos a 6/10.' : '';
    if (!copy.deload && !Object.values(copy.days).some(id => LONG_RIDE_IDS.includes(id))) copy.days[p.longDay] = 'bike-long';
    p.weeks.push(copy);
  });
  saveData(data);
  toast('Añadidas 4 semanas: ajusta sus km en la pestaña Bici');
}

function resetPlan() {
  if (!confirm('¿Volver al plan original? Se pierden tus cambios en entrenos, semanas, fases y objetivos. Lo que hayas apuntado en el calendario se mantiene.')) return;
  // The chosen bike days are a preference, not a plan change: keep them
  const { longDay, easyDay } = plan();
  data.plan = defaultPlan();
  Object.assign(data.plan, { longDay, easyDay });
  applyRideDays(0);
  createStrengthRoutines();
  planWeekIndex = null;
  saveData(data);
  toast('Plan restablecido');
}

// ============ RENDER: BIKE VIEW ============
// ---------- Bike km totals ----------
let bikeKmView = 'week';

function roundKm(km) {
  return Math.round(km * 10) / 10;
}

// Total km and number of rides between two dates (both included)
function bikeTotals(from, to) {
  const rides = bikeRides().filter(a => a.date >= from && a.date <= to);
  return { km: roundKm(rides.reduce((sum, a) => sum + a.kmValue, 0)), rides: rides.length };
}

function switchBikeKm(view) {
  bikeKmView = view;
  renderBike();
}

function renderBikeKm() {
  const now = new Date();
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (now.getDay() + 6) % 7);
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const week = bikeTotals(todayStrOf(monday), todayStrOf(addDays(monday, 6)));
  const month = bikeTotals(todayStrOf(new Date(now.getFullYear(), now.getMonth(), 1)), todayStrOf(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
  const rideCount = n => `${n} ${n === 1 ? 'salida' : 'salidas'}`;

  // Last 8 weeks or last 6 months, oldest first
  const periods = bikeKmView === 'week'
    ? Array.from({ length: 8 }, (_, k) => {
        const start = addDays(monday, (k - 7) * 7);
        return { label: formatShortDate(todayStrOf(start)), title: `Semana del ${formatShortDate(todayStrOf(start))}`, ...bikeTotals(todayStrOf(start), todayStrOf(addDays(start, 6))) };
      })
    : Array.from({ length: 6 }, (_, k) => {
        const start = new Date(now.getFullYear(), now.getMonth() + k - 5, 1);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
        const name = MONTH_NAMES[start.getMonth()];
        return { label: name.slice(0, 3), title: `${name} ${start.getFullYear()}`, ...bikeTotals(todayStrOf(start), todayStrOf(end)) };
      });
  // Headroom so the tallest bar still fits its total above it
  const max = Math.max(1, ...periods.map(x => x.km)) * 1.2;

  const columns = periods.map((x, k) => {
    const label = `${x.title}: ${x.km} km, ${rideCount(x.rides)}`;
    return `
      <div class="month-col ${k === periods.length - 1 ? 'current' : ''}" title="${escapeHtml(label)}" aria-label="${escapeHtml(label)}">
        <span class="month-col-plot">
          ${x.km ? `<span class="month-col-seg" style="height:calc(${(x.km / max * 100).toFixed(1)}% - 2px);background:${ACTIVITY_TYPES.bike.color}"></span>` : ''}
          <span class="month-col-total">${x.km || ''}</span>
        </span>
        <span class="month-col-label">${escapeHtml(x.label)}</span>
      </div>`;
  }).join('');

  return `
    <div class="plan-section">
      <div class="plan-section-row"><span class="report-title">Kilómetros</span></div>
      <div class="bike-km-tiles">
        <div class="bike-km-tile"><span>Esta semana</span><b>${week.km}<small>km</small></b><span>${rideCount(week.rides)}</span></div>
        <div class="bike-km-tile"><span>Este mes</span><b>${month.km}<small>km</small></b><span>${rideCount(month.rides)}</span></div>
      </div>
      <div class="chart-tabs">
        <button class="chart-tab ${bikeKmView === 'week' ? 'active' : ''}" onclick="switchBikeKm('week')">Por semanas</button>
        <button class="chart-tab ${bikeKmView === 'month' ? 'active' : ''}" onclick="switchBikeKm('month')">Por meses</button>
      </div>
      <div class="month-chart ${bikeKmView === 'week' ? 'eight' : ''}">${columns}</div>
    </div>`;
}

function renderBike() {
  const container = document.getElementById('bike');
  if (!container || !data) return;
  const p = plan();
  const today = todayStr();
  const current = currentWeekIndex();
  const week = p.weeks[current];
  const best = bestRide();
  const goal = sortedGoals().find(g => Number(g.km) > 0 && !goalAchieved(g));
  const thisWeek = today >= p.startDate ? weekLongRide(current) : 0;

  const ratio = goal ? Math.min(1, best / goal.km) : 1;
  const hero = `
    <div class="progress-card">
      <svg class="progress-ring" viewBox="0 0 64 64" aria-hidden="true">
        <circle class="ring-track" cx="32" cy="32" r="27"/>
        <circle class="ring-bar" cx="32" cy="32" r="27" transform="rotate(-90 32 32)"
          stroke-dasharray="${RING_LENGTH.toFixed(1)}" stroke-dashoffset="${(RING_LENGTH * (1 - ratio)).toFixed(1)}"/>
        <text x="32" y="37" text-anchor="middle">${Math.round(ratio * 100)}%</text>
      </svg>
      <div class="progress-text">
        <span class="progress-title">Mejor salida: ${best} km</span>
        <span class="progress-sub">${goal ? `Próximo objetivo: ${goal.km} km · ${formatShortDate(goal.date)}` : '¡Todos los objetivos conseguidos!'}</span>
        <span class="progress-sub">Esta semana: ${thisWeek ? `${thisWeek} de ` : ''}${week.km} km</span>
      </div>
    </div>`;

  // Weeks grouped by phase
  let rows = '';
  let lastPhase = -2;
  p.weeks.forEach((w, i) => {
    const rideWd = longRideWd(i);
    const sat = weekDate(i, rideWd);
    const ph = phaseIndexFor(sat);
    if (ph !== lastPhase) {
      lastPhase = ph;
      const name = ph >= 0 ? p.phases[ph].name : 'Sin fase';
      rows += `<div class="bike-phase"><span class="phase-dot" style="background:${phaseColor(ph)}"></span>${escapeHtml(name)}</div>`;
    }
    const actual = weekStart(i) <= today ? weekLongRide(i) : 0;
    const hit = actual && actual >= w.km * 0.95;
    const hasGoal = p.goals.some(g => g.km && g.date >= weekStart(i) && g.date <= weekEnd(i));
    rows += `
      <button class="bike-week ${i === current && today >= p.startDate ? 'current' : ''} ${weekEnd(i) < today ? 'past' : ''}" onclick="openBikeWeek(${i})">
        <span class="bike-week-name">S${i + 1}${hasGoal ? ICONS.trophy : ''}<small>${PLAN_WEEKDAYS[rideWd - 1].slice(0, 3).toLowerCase()} ${formatShortDate(sat)}${w.deload ? ' · descarga' : ''}</small></span>
        <span class="bike-week-target">${w.km} km</span>
        <span class="bike-week-done ${hit ? 'hit' : ''}">${actual ? `${actual} km` : '—'}</span>
      </button>`;
  });

  const rides = bikeRides().slice().reverse().slice(0, 6);
  const ridesHtml = rides.length
    ? rides.map(a => `
        <div class="day-item">
          <span class="act-dot" style="background:${ACTIVITY_TYPES.bike.color}"></span>
          <div class="day-item-info">
            <div class="day-item-title">${a.kmValue ? `${a.kmValue} km` : 'Salida'}${a.minutes ? ` · ${escapeHtml(a.minutes)} min` : ''}${a.indoor ? ' · bici estática' : ''}</div>
            <div class="day-item-sub">${escapeHtml(longDate(a.date))}${a.kmValue && a.minutes ? ` · ${(a.kmValue / a.minutes * 60).toFixed(1)} km/h` : ''}</div>
          </div>
          <button class="history-delete" onclick="openEditActivity(${a.index})" aria-label="Editar salida">${ICONS.edit}</button>
        </div>`).join('')
    : '<p class="day-empty">Aún no hay salidas. Pulsa + para apuntar la primera.</p>';

  container.innerHTML = `
    ${hero}
    <div class="plan-section">
      <button class="btn-primary btn-with-icon" onclick="openBikeLog()">${ICONS.plus} Registrar salida</button>
      <div class="report-subtitle">Salida larga: objetivo y hecho</div>
      <div class="chart-container"><canvas id="bike-chart"></canvas></div>
    </div>
    ${renderBikeKm()}
    <div class="plan-section">
      <div class="plan-section-row"><span class="report-title">Últimas salidas</span></div>
      <div class="plan-stack">${ridesHtml}</div>
    </div>
    <div class="plan-section">
      <div class="plan-section-row"><span class="report-title">Plan semana a semana</span></div>
      <p class="plan-hint left">Pulsa una semana para cambiar sus km objetivo.</p>
      <div class="bike-table-head"><span>Semana</span><span>Objetivo</span><span>Hecho</span></div>
      <div class="bike-table">${rows}</div>
    </div>
    <div class="plan-section">
      <div class="plan-section-row"><span class="report-title">Para ir cómoda</span></div>
      ${workoutBody(workoutById('bike-long') || defaultWorkouts().find(w => w.id === 'bike-long'))}
    </div>`;

  if (currentView === 'bike') setTimeout(buildBikeChart, 50);
}

function buildBikeChart() {
  const ctx = document.getElementById('bike-chart');
  if (!ctx) return;
  if (bikeChart) bikeChart.destroy();
  const p = plan();
  const today = todayStr();
  const css = getComputedStyle(document.documentElement);
  const token = name => css.getPropertyValue(name).trim();
  const font = { family: token('--font'), size: 10, weight: '600' };

  bikeChart = new Chart(ctx, {
    data: {
      labels: p.weeks.map((_, i) => `S${i + 1}`),
      datasets: [
        {
          type: 'line',
          label: 'Objetivo',
          data: p.weeks.map(w => w.km),
          borderColor: token('--chart-line'),
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.3,
          order: 1
        },
        {
          type: 'bar',
          label: 'Hecho',
          data: p.weeks.map((_, i) => (weekStart(i) <= today ? weekLongRide(i) || null : null)),
          backgroundColor: token('--act-bike'),
          borderRadius: 4,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { color: token('--chart-tick'), font, boxWidth: 12, boxHeight: 12 } },
        tooltip: {
          backgroundColor: token('--tab-active-bg'),
          titleColor: token('--tab-active-fg'),
          bodyColor: token('--tab-active-fg'),
          cornerRadius: 10,
          padding: 10,
          callbacks: { label: c => `${c.dataset.label}: ${c.parsed.y} km` }
        }
      },
      scales: {
        x: { ticks: { color: token('--chart-tick'), font, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }, grid: { display: false }, border: { display: false } },
        y: { ticks: { color: token('--chart-tick'), font }, grid: { color: token('--chart-grid') }, border: { display: false }, beginAtZero: true }
      }
    }
  });
}

function openBikeWeek(i) {
  const week = plan().weeks[i];
  const rides = weekRides(i);
  openModal(`
    <div class="modal-kicker">Semana ${i + 1} · ${formatShortDate(weekStart(i))} – ${formatShortDate(weekEnd(i))}</div>
    <h2>Salida larga</h2>
    <div class="form-group">
      <label>Objetivo (km)</label>
      <input type="number" inputmode="decimal" id="bike-week-km" value="${week.km}">
    </div>
    <div class="form-group">
      <label>Nota de la semana</label>
      <input type="text" id="bike-week-note" value="${escapeHtml(week.note || '')}" placeholder="Opcional">
    </div>
    <label class="check-row">
      <input type="checkbox" id="bike-week-deload" ${week.deload ? 'checked' : ''}>
      <span>Semana de descarga</span>
    </label>
    ${rides.length ? `
      <h3 class="modal-section">Salidas de esta semana</h3>
      <div class="plan-stack">${rides.map(a => `
        <div class="day-item">
          <span class="act-dot" style="background:${ACTIVITY_TYPES.bike.color}"></span>
          <div class="day-item-info">
            <div class="day-item-title">${a.kmValue ? `${a.kmValue} km` : 'Salida'}${a.minutes ? ` · ${escapeHtml(a.minutes)} min` : ''}</div>
            <div class="day-item-sub">${escapeHtml(longDate(a.date))}</div>
          </div>
          <button class="history-delete" onclick="openEditActivity(${a.index})" aria-label="Editar salida">${ICONS.edit}</button>
        </div>`).join('')}</div>` : ''}
    <button class="btn-primary" onclick="saveBikeWeek(${i})">Guardar</button>
    <button class="btn-secondary" onclick="openBikeLog('${weekDate(i, longRideWd(i))}')">Registrar salida de esta semana</button>
    <button class="btn-secondary" onclick="goToPlanWeek(${i}); closeModal()">Ver la semana en el plan</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function saveBikeWeek(i) {
  const km = parseFloat(valueOf('bike-week-km').replace(',', '.'));
  if (!(km > 0)) {
    toast('Pon los km objetivo');
    return;
  }
  const week = plan().weeks[i];
  week.km = km;
  week.note = valueOf('bike-week-note');
  week.deload = document.getElementById('bike-week-deload').checked;
  saveData(data);
  closeModal();
  toast('Semana guardada');
}

function openBikeLog(date, kind) {
  const day = date || todayStr();
  if (!kind) {
    const dow = planParse(day).getDay();
    kind = dow === 0 ? 'bike-easy' : 'bike-long';
  }
  const kinds = Object.entries(BIKE_KINDS)
    .map(([key, label]) => `<option value="${key}" ${key === kind ? 'selected' : ''}>${label}</option>`).join('');
  openModal(`
    <h2>Registrar salida</h2>
    <div class="form-group">
      <label>Tipo</label>
      <select id="ride-kind">${kinds}</select>
    </div>
    <div class="form-group">
      <label>Fecha</label>
      <input type="date" id="ride-date" value="${day}">
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Distancia (km)</label>
        <input type="number" inputmode="decimal" step="0.1" id="ride-km" placeholder="Ej: 25">
      </div>
      <div class="form-group">
        <label>Tiempo (min)</label>
        <input type="number" inputmode="numeric" id="ride-minutes" placeholder="Ej: 85">
      </div>
    </div>
    <div class="form-group">
      <label>Notas</label>
      <input type="text" id="ride-notes" placeholder="Ej: barro, mucho viento, comí 2 barritas...">
    </div>
    <button class="btn-primary" onclick="saveBikeLog()">Guardar</button>
    <button class="btn-secondary" onclick="closeModal()">Cancelar</button>
  `);
}

function saveBikeLog() {
  const kind = valueOf('ride-kind') || 'bike-long';
  const date = valueOf('ride-date') || todayStr();
  const km = parseFloat(valueOf('ride-km').replace(',', '.')) || null;
  const minutes = parseInt(valueOf('ride-minutes')) || null;
  const extra = valueOf('ride-notes');
  if (!km && !minutes) {
    toast('Pon los km o el tiempo');
    return;
  }
  const indoor = kind === 'bike-indoor';
  const notes = [km ? `${km} km` : '', indoor ? 'bici estática' : '', extra].filter(Boolean).join(' · ');
  pushActivity({
    date,
    type: 'bike',
    minutes,
    notes,
    routine: BIKE_KINDS[kind],
    planId: kind,
    km,
    indoor
  });
  // An indoor ride on the long ride day replaces it in the plan
  const p = plan();
  const i = Math.floor(planDiff(p.startDate, date) / 7);
  if (indoor && i >= 0 && i < p.weeks.length) {
    const wd = planDiff(weekStart(i), date) + 1;
    if (p.weeks[i].days[wd] === 'bike-long') p.weeks[i].days[wd] = 'bike-indoor';
  }
  saveData(data);
  closeModal();
  const achieved = km ? p.goals.find(g => Number(g.km) > 0 && km >= g.km && bikeRides().filter(a => a.kmValue >= g.km).length === 1) : null;
  toast(achieved ? `¡Objetivo conseguido: ${achieved.title}!` : 'Salida guardada');
}
