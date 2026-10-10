/* global firebase */

// 서버 FCM 데이터에는 `screen`·`route`·`destination` 이 **없다.** 담기는 것은
// `notificationId`·`notificationType`·`referenceId`·`chatRoomId` 넷뿐이다
// (BE `PushNotificationSender.toFirebaseMessage`). 예전에는 앞의 세 키만 읽어서
// **어떤 푸시를 눌러도 홈**이 열렸다 — 알림을 눌러도 그 알림이 가리키는 곳으로 가지 않았다.
//
// 유형별 목적지는 **앱 안 알림 목록과 같은 규칙**이다(`screens-extra.jsx` 의 `openServerNotification`).
// 같은 알림을 목록에서 누를 때와 푸시로 누를 때 다른 곳이 열리면 안 된다.
const PUSH_LEGACY_ALIASES = {
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

// 승격은 「내가 그 방의 참가자가 됐다」는 뜻이고 공지는 방 안에 있다 — 둘 다 채팅방이다.
const PUSH_CHAT_ROOM_TYPES = [
  'CHAT_MESSAGE_RECEIVED',
  'CHAT_ROOM_CREATED',
  'CHAT_ROOM_WAITLIST_PROMOTED',
  'CHAT_ROOM_NOTICE_POSTED',
];

// 확정·불발·신청 결과·마감은 일정이 걸린 일이라 모집 상세다.
const PUSH_TRIP_DETAIL_TYPES = [
  'CHAT_ROOM_CONFIRMED',
  'CHAT_ROOM_CANCELLED',
  'CHAT_ROOM_APPLICATION_APPROVED',
  'CHAT_ROOM_APPLICATION_REJECTED',
  'RECRUITMENT_DEADLINE',
  'MEETING_INFO_UPDATED',
  'TRAVEL_COURSE_UPDATED',
];

function pushTarget(data = {}) {
  const legacy = String(data.screen || data.route || data.destination || '').toLowerCase();
  if (legacy) return { screen: PUSH_LEGACY_ALIASES[legacy] || legacy };

  const type = String(data.notificationType || data.type || '');
  const roomId = data.chatRoomId == null ? '' : String(data.chatRoomId);
  if (PUSH_CHAT_ROOM_TYPES.includes(type)) {
    return roomId ? { screen: 'chat', roomId } : { screen: 'meetings' };
  }
  if (PUSH_TRIP_DETAIL_TYPES.includes(type)) {
    return roomId ? { screen: 'detail', roomId } : { screen: 'meetings' };
  }
  if (type === 'FRIEND_REQUEST' || type === 'FRIEND_ACCEPTED') return { screen: 'friends' };
  // 강퇴 사유·피드 좋아요·안내는 알림 목록에서 그 줄을 눌러야 제 곳으로 간다.
  if (type === 'CHAT_ROOM_KICKED' || type === 'FEED_LIKE' || type === 'MARKETING') {
    return { screen: 'notifications' };
  }
  // 모르는 유형이라도 **알림 목록**까지는 데려간다. 홈으로 되돌리면 왜 열렸는지 알 길이 없다.
  return roomId ? { screen: 'detail', roomId } : { screen: 'notifications' };
}

function destination(data = {}) {
  return pushTarget(data).screen || 'home';
}

function destinationUrl(data) {
  const url = new URL(self.registration.scope);
  const target = pushTarget(data);
  url.searchParams.set('screen', target.screen || 'home');
  // 방을 모르면 `roomId` 를 붙이지 않는다 — 없는 방을 가리키느니 목록에서 고르게 둔다.
  if (target.roomId) url.searchParams.set('roomId', target.roomId);
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
