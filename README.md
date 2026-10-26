<img src="icon.svg" width="72" alt="Logo de Tutti Sport">

# Tutti Sport

PWA (Progressive Web App) para registrar entrenos: rutinas de gimnasio serie a serie con gráficas de progresión, y también bici, Hyrox u otros deportes en un calendario mensual. Los datos se sincronizan en la nube con Firebase y la app funciona también sin conexión.

**👉 App: [gym-marta.netlify.app](https://gym-marta.netlify.app/)**

## Funcionalidades

- **Rutinas múltiples**: crea, renombra y elimina rutinas (p. ej. "Día A – Pierna", "Día B – Torso").
- **Ejercicios** con número de series, rango de repeticiones y unidad de carga (`kg`, `bloques` o `goma`).
- **Reordenar ejercicios**: mantén pulsada una tarjeta y arrástrala arriba o abajo.
- **Registro de entrenos** serie a serie (peso × reps), con fecha editable.
- **Historial** por ejercicio, con opción de borrar registros sueltos.
- **Gráficas de progreso** (Chart.js): peso máximo, media de reps por serie y reps totales.
- **Calendario mensual**: los días entrenados se pintan de color. Los días de gym salen solos a partir de los registros, y se pueden añadir otros entrenos (bici, Hyrox u otro) con duración y notas. Si un día tiene varios, la casilla se divide en colores.
- **Modo claro y oscuro**: sigue el del móvil hasta que eliges uno con el botón de la barra superior.
- **Papelera**: los ejercicios eliminados se pueden restaurar (se guardan los últimos 20).
- **Cuentas de usuario** con email y contraseña (Firebase Auth).
- **Sistema de aprobación**: las cuentas nuevas quedan pendientes hasta que la administradora las aprueba desde un panel dentro de la app.
- **Instalable y offline**: Service Worker + manifest, y persistencia offline de Firestore.

## Tecnologías

| Parte | Tecnología |
|---|---|
| Frontend | HTML, CSS y JavaScript sin framework ni build |
| Autenticación | Firebase Authentication (email/contraseña) |
| Base de datos | Cloud Firestore |
| Gráficas | [Chart.js](https://www.chartjs.org/) 4.4.7 (CDN) |
| Offline / PWA | Service Worker (`sw.js`) + `manifest.json` |

## Estructura

```
├── index.html     # Estructura: login, pantalla de pendiente y app
├── app.js         # Lógica: auth, Firestore, render, modales y gráficas
├── styles.css     # Estilos (tema claro/oscuro automático, mobile-first)
├── sw.js          # Service Worker (caché de assets, excluye llamadas a Firebase)
├── manifest.json  # Manifest de la PWA
├── icon.svg       # Logo (macedonia de rodajas: naranja, lima y lila) e icono de la pestaña
├── icon-*.png     # Iconos de la app para iPhone (180) y Android (192, 512)
├── firestore.rules # Reglas de seguridad de Firestore
└── LICENSE        # Licencia MIT
```

## Modelo de datos (Firestore)

```
profiles/{uid}
  email: string
  approved: boolean
  createdAt: "YYYY-MM-DD"

users/{uid}
  activeRoutine: number
  routines: [
    {
      name: string,
      exercises: [
        { name, sets, reps, weight, unit, done, logs: [ { date, weights[], reps[] } ] }
      ]
    }
  ]
  trash: [ { routineIndex, exercise, deletedAt } ]
  activities: [ { date, type: 'gym' | 'bike' | 'hyrox' | 'other', minutes, notes } ]
```

## Puesta en marcha

### 1. Crear el proyecto en Firebase

1. Crea un proyecto en la [consola de Firebase](https://console.firebase.google.com/).
2. Activa **Authentication → Email/Password**.
3. Crea una base de datos **Cloud Firestore**.
4. Registra una app web y copia su configuración en `firebaseConfig`, al principio de [app.js](app.js).
5. Cambia `ADMIN_EMAIL` en [app.js](app.js) por el email de la cuenta administradora.

### 2. Reglas de seguridad de Firestore

La comprobación de "cuenta aprobada" y de "admin" se hace en el navegador, así que **la seguridad real depende de las reglas de Firestore**. Las reglas están en [firestore.rules](firestore.rules); cópialas en **Firestore → Reglas** de la consola (cambiando el email de la admin) y publícalas. Garantizan que:

- Cada usuario solo puede leer y escribir sus propios datos, y solo si está aprobado.
- Un usuario nuevo solo puede crear su perfil como pendiente y con su email real.
- Solo la admin puede ver las solicitudes y aprobar cuentas.

### 3. Ejecutar en local

No hace falta instalar nada: basta con servir la carpeta con cualquier servidor estático (el Service Worker no funciona abriendo el HTML con `file://`).

```bash
# Con Python
python -m http.server 8000

# o con Node
npx serve .
```

Y abre `http://localhost:8000`.

### 4. Desplegar

Al ser un sitio estático, se puede publicar tal cual en Netlify, GitHub Pages, Firebase Hosting, Vercel, etc. Recuerda añadir el dominio en **Firebase → Authentication → Settings → Authorized domains**.

> Cuando cambies archivos estáticos, sube la versión de `CACHE_NAME` en [sw.js](sw.js) para que los usuarios reciban la versión nueva.

## Sobre la API key de Firebase

La `apiKey` que aparece en `app.js` **no es un secreto**: Firebase la diseña para ir en el código del cliente y solo identifica el proyecto. La protección de los datos la dan las reglas de Firestore (ver arriba). Aun así, es buena práctica:

- Restringir la key por *HTTP referrer* en [Google Cloud Console → Credenciales](https://console.cloud.google.com/apis/credentials) a tus dominios.
- Activar [Firebase App Check](https://firebase.google.com/docs/app-check) si la app se abre a más gente.

## Uso

1. Crea una cuenta. Si no eres la admin, espera a que te aprueben.
2. Crea una rutina con el botón **+** de las pestañas.
3. Añade ejercicios con el botón flotante **+**.
4. Pulsa **Registrar entreno** en un ejercicio para apuntar las series del día.
5. Consulta el historial y las gráficas de progreso debajo de los ejercicios.
6. En **Calendario** (menú inferior) ve los días entrenados del mes y añade entrenos de bici, Hyrox u otros con el botón **+**.
7. (Admin) Usa el icono 👥 para aprobar solicitudes pendientes.

## Licencia

[MIT](LICENSE) © Marta Torres Gómez
