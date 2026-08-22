/* global firebase */

function destination(data = {}) {
  const raw = String(data.screen || data.route || data.destination || '').toLowerCase();
  const aliases = {
    notification: 'notifications',
    'notification-center': 'notifications',
    meeting: 'meetings',
    chat: 'meetings',
    chatroom: 'meetings',
    post: 'feed',
    profile: 'my',
    settings: 'my',
    search: 'explore',
    course: 'explore',
  };
  return aliases[raw] || raw || 'home';
}

function destinationUrl(data) {
  const url = new URL(self.registration.scope);
  url.searchParams.set('screen', destination(data));
  return url;
}

// Register this before Firebase so notification clicks consistently preserve
// the GitHub Pages repository base path.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = destinationUrl(event.notification.data || {});
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find((client) => client.url.startsWith(self.registration.scope));
    if (existing) {
      await existing.focus();
      await existing.navigate(url.href);
      return;
    }
    await self.clients.openWindow(url.href);
  })());
});

importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.16.0/firebase-messaging-compat.js');

const encodedConfig = new URL(self.location.href).searchParams.get('config');
if (encodedConfig) {
  try {
    firebase.initializeApp(JSON.parse(atob(encodedConfig)));
    firebase.messaging().onBackgroundMessage((payload) => {
      const title = payload?.notification?.title || payload?.data?.title || '모여트립 in 경북';
      return self.registration.showNotification(title, {
        body: payload?.notification?.body || payload?.data?.body || '',
        data: payload?.data || {},
        tag: payload?.data?.notificationId || undefined,
      });
    });
  } catch (error) {
    console.error('[moyeo-push] Firebase Messaging worker initialization failed.', error);
  }
}
