importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js');

const firebaseConfig = {
    apiKey: "AIzaSyDNQgYDHpopQJGrPue5nJaJeBNwuA_mlGo",
    authDomain: "spika3-6a9ec.firebaseapp.com",
    projectId: "spika3-6a9ec",
    storageBucket: "spika3-6a9ec.appspot.com",
    messagingSenderId: "1032957133774",
    appId: "1:1032957133774:web:9f97c2e8be2b308750219f",
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