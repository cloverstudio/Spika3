importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyD1EJGP17dwcRe4fKC0QaSbfxNglDelLNc",
    authDomain: "spika-ultimate.firebaseapp.com",
    projectId: "spika-ultimate",
    storageBucket: "spika-ultimate.appspot.com",
    messagingSenderId: "545730644006",
    appId: "1:545730644006:web:385d470311a4d7fb0d3ee7",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async function(payload) {
  const message = payload?.data?.message ? JSON.parse(payload.data.message) : {};
  const fromUserName = payload?.data?.fromUserName ? payload?.data?.fromUserName : "";
  const groupName = payload?.data?.groupName ? payload?.data?.groupName : "";
  const isGroup = !!groupName

  if(!message){
    return;
  } 

  const roomNotifications = await self.registration.getNotifications({tag: message.roomId})

  const notificationTitle = isGroup ?  groupName : fromUserName;
  let body = message.type === "text" ? message.body.text : "Media"

  if(isGroup){
    body = `${fromUserName}: ${body}` 
  }

  if(roomNotifications[0]){
    body += ` \n${roomNotifications[0].body}`
  }
  const notificationOptions = {
    tag: message.roomId,
    body,
  };
  
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