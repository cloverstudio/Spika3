import { FirebaseApp, initializeApp } from "firebase/app";
import { getMessaging, getToken, Messaging, onMessage } from "firebase/messaging";

declare const FCM_API_KEY: string;
declare const FCM_AUTH_DOMAIN: string;
declare const FCM_PROJECT_ID: string;
declare const FCM_STORAGE_BUCKET: string;
declare const FCM_SENDER_ID: string;
declare const FCM_APP_ID: string;
declare const FCM_VAPID_KEY: string;
declare const ENV: string;

const firebaseConfig = {
    apiKey: FCM_API_KEY,
    authDomain: FCM_AUTH_DOMAIN,
    projectId: FCM_PROJECT_ID,
    storageBucket: FCM_STORAGE_BUCKET,
    messagingSenderId: FCM_SENDER_ID,
    appId: FCM_APP_ID,
};

const vapidKey = FCM_VAPID_KEY;

export default async () => {
    let app: FirebaseApp;
    let messaging: Messaging;
    try {
        app = initializeApp(firebaseConfig);
        messaging = getMessaging(app);

        if (!navigator?.serviceWorker) return;

        const swRegistration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js`);
        const pushToken = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: swRegistration,
        });

        onMessage(messaging, (payload) => {
            console.log("Message received. ", payload);
            // ...
        });

        return pushToken;
    } catch (e) {
        console.error("Faied to initialize Firebase");
    }
};
