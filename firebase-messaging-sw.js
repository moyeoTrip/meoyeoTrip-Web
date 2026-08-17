/* global firebase */
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js');

const encodedConfig = new URL(self.location.href).searchParams.get('config');
if (encodedConfig) {
  firebase.initializeApp(JSON.parse(atob(encodedConfig)));
  firebase.messaging().onBackgroundMessage((payload) => {
    const title = payload?.notification?.title || payload?.data?.title || '모여트립 in 경북';
    const options = {
      body: payload?.notification?.body || payload?.data?.body || '',
      data: payload?.data || {},
    };
    self.registration.showNotification(title, options);
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const raw = String(data.screen || data.route || data.destination || '').toLowerCase();
  const aliases = {
    notification: 'notifications', 'notification-center': 'notifications',
    meeting: 'meetings', chat: 'meetings', chatroom: 'meetings',
    post: 'feed', profile: 'my', settings: 'my', search: 'explore', course: 'explore',
  };
  const screen = aliases[raw] || raw || 'home';
  const url = new URL(self.registration.scope);
  url.searchParams.set('screen', screen);
  event.waitUntil((async () => {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = clients.find((client) => client.url.startsWith(self.registration.scope));
    if (existing) {
      await existing.focus();
      existing.navigate(url.href);
      return;
    }
    await self.clients.openWindow(url.href);
  })());
});
