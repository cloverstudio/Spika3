importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "{{apiKey}}",
  authDomain: "{{authDomain}}",
  projectId: "{{projectId}}",
  storageBucket: "{{storageBucket}}",
  messagingSenderId: "{{messagingSenderId}}",
  appId: "{{appId}}",
};

firebase.initializeApp(firebaseConfig);

const UPLOADS_BASE_URL = "{{uploadsBaseUrl}}"

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async function (payload) {
  const data = payload?.data

  if (!data) {
    return;
  }

  const message = data.message ? JSON.parse(data.message) : {};
  const messageAttributes = data.messageAttributes ? JSON.parse(data.messageAttributes) : {};
  const roomAttributes = data.roomAttributes ? JSON.parse(data.roomAttributes) : {};

  const { fromUserName, groupName } = messageAttributes
  const isGroup = !!groupName
  const { muted, avatarFileId, unreadCount } = roomAttributes

  if (!message || muted) {
    return;
  }

  let notificationTitle = isGroup ? groupName : fromUserName;
  let body = message.type === "text" ? message.body.text : "Media"

  if (isGroup) {
    body = `${fromUserName}: ${body}`
  }

  const notificationOptions = {
    body,
    renotify: true,
    tag: message.roomId,
    icon: `${UPLOADS_BASE_URL}/${avatarFileId}`,
    image: "",
    badge: "https://clover.spika.chat/messenger/android-chrome-192x192.png",
  };

  if (message.body.thumbId) {
    notificationOptions.image = `${UPLOADS_BASE_URL}/${message.body.thumbId}`;
  }

  if(unreadCount && unreadCount > 1) {
    notificationTitle += ` (${unreadCount})`
  }

  self.registration.showNotification(notificationTitle,
    notificationOptions);

})

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(clients.matchAll({
    type: "window"
  }).then((clientList) => {
    for (const client of clientList) {
      if (client.url.includes(`/messenger/rooms/${event.notification.tag}`) && 'focus' in client)
        return client.focus();
    }
    if (clients.openWindow)
      return clients.openWindow(`/messenger/rooms/${event.notification.tag}`);
  }));
});