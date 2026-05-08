const CACHE_NAME = 'viyalas-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/images/logo.png',
  '/images/hero_food.png',
  '/images/badam_milk.png',
  '/images/tiffin_plate.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
