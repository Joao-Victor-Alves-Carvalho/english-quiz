/* Notificações do Miller Minute (importado pelo service worker gerado pelo Vite PWA). */
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { body: event.data ? event.data.text() : '' };
  }
  const title = data.title || 'Miller Minute';
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || 'Hora do inglês!',
      icon: 'icon-192.png',
      badge: 'icon-192.png',
      tag: data.tag || 'miller-minute',
      renotify: true,
      data: { url: data.url || './' },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
