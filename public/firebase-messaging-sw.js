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

const messaging = firebase.messaging();

messaging.onBackgroundMessage(async function(payload) {
  const message = payload?.data?.message ? JSON.parse(payload.data.message) : {};
  const fromUserName = message.fromUserName || "";
  const groupName = message.groupName || "";
  const isGroup = !!groupName

  if(!message || message.muted){
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