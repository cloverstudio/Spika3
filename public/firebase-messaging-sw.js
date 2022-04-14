importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

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

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle,
    notificationOptions);
});