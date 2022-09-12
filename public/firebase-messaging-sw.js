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

messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message ', payload);
const message = payload?.data?.message ? JSON.parse(payload.data.message) : {};
const fromUserName = payload?.data?.fromUserName ? payload?.data?.fromUserName : "";

  if(!message){
    return;
  } 
  
  const notificationTitle = `New message from ${fromUserName}`;
  const notificationOptions = {
    body: message.type === "text" ? message.body.text : "Media",
  };
  
  self.registration.showNotification(notificationTitle,
    notificationOptions);

});