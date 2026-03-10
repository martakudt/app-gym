const CACHE_NAME = 'gym-app-v6';
const ASSETS = [
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Don't cache Firebase API calls
  if (e.request.url.includes('firebaseio.com') ||
      e.request.url.includes('googleapis.com') ||
      e.request.url.includes('firestore.googleapis.com') ||
      e.request.url.includes('identitytoolkit.googleapis.com') ||
      e.request.url.includes('securetoken.googleapis.com')) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
