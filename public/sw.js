// Service Worker para Web Push Notifications e PWA
// Este arquivo é servido na raiz do domínio (public/sw.js)

const CACHE_NAME = 'takepips-v1';
const OFFLINE_URL = '/offline.html';

// Recursos estáticos para cache
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Instalar Service Worker e cachear recursos
self.addEventListener('install', (event) => {
    console.log('Service Worker instalado');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Cacheando recursos estáticos...');
            return cache.addAll(STATIC_ASSETS).catch(err => {
                console.warn('⚠️ Alguns recursos não foram cacheados:', err);
            });
        })
    );
    
    self.skipWaiting(); // Ativa imediatamente
});

// Ativar Service Worker e limpar caches antigos
self.addEventListener('activate', (event) => {
    console.log('Service Worker ativado');
    
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('🗑️ Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    event.waitUntil(self.clients.claim()); // Toma controle de todas as páginas
});

// Estratégia: Cache First, depois Network (para recursos estáticos)
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Ignorar requisições de API (sempre buscar do servidor)
    if (url.pathname.startsWith('/api/')) {
        return; // Deixar passar para o servidor
    }
    
    // Para recursos estáticos, usar cache primeiro
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // Se não está em cache, buscar do servidor
            return fetch(request).then((response) => {
                // Só cachear se for sucesso e for GET
                if (response.status === 200 && request.method === 'GET') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return response;
            }).catch(() => {
                // Se offline e for uma página, mostrar página offline
                if (request.mode === 'navigate') {
                    return caches.match('/index.html') || caches.match('/');
                }
            });
        })
    );
});

// Receber mensagens push
self.addEventListener('push', (event) => {
    console.log('Push recebido:', event);
    
    let notificationData = {
        title: 'TakePips',
        body: 'Novo evento em seu sinal de trading',
        icon: '/icon-192.png', // Você pode criar um ícone depois
        badge: '/badge-72.png',
        tag: 'takepips-notification',
        requireInteraction: false,
        data: {}
    };

    if (event.data) {
        try {
            const data = event.data.json();
            notificationData = {
                title: data.title || 'TakePips',
                body: data.body || 'Novo evento em seu sinal de trading',
                icon: data.icon || '/icon-192.png',
                badge: data.badge || '/badge-72.png',
                tag: data.tag || 'takepips-notification',
                requireInteraction: data.requireInteraction || false,
                data: data.data || {},
                actions: data.actions || []
            };
        } catch (e) {
            console.error('Erro ao parsear dados do push:', e);
            notificationData.body = event.data.text();
        }
    }

    event.waitUntil(
        self.registration.showNotification(notificationData.title, {
            body: notificationData.body,
            icon: notificationData.icon,
            badge: notificationData.badge,
            tag: notificationData.tag,
            requireInteraction: notificationData.requireInteraction,
            data: notificationData.data,
            actions: notificationData.actions,
            vibrate: [200, 100, 200], // Vibrar no mobile
            timestamp: Date.now()
        })
    );
});

// Clique na notificação
self.addEventListener('notificationclick', (event) => {
    console.log('Notificação clicada:', event);
    
    event.notification.close();
    
    // Abrir ou focar na página do dashboard
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Se já tem uma janela aberta, focar nela
            for (let client of clientList) {
                if (client.url === self.location.origin + '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            // Senão, abrir nova janela
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Notificação fechada
self.addEventListener('notificationclose', (event) => {
    console.log('Notificação fechada:', event);
});

