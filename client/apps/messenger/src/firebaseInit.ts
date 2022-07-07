import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

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

let app;
let messaging;
try {
    app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);
} catch (e) {
    console.error("Faied to initialize Firebase");
}

const vapidKey = FCM_VAPID_KEY;
if (navigator?.serviceWorker) navigator?.serviceWorker.register(`/firebase-messaging-sw.js`);

export const requestForToken = async (update: any) => {
    if (!navigator?.serviceWorker) return;

    const swRegistration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js`);
    return getToken(messaging, { vapidKey, serviceWorkerRegistration: swRegistration })
        .then((pushToken) => {
            if (pushToken) {
                console.log("current token for client: ", pushToken);
                update({ pushToken });
            } else {
                console.log("No registration token available. Request permission to generate one.");
            }
        })
        .catch((err) => {
            console.log("An error occurred while retrieving token. ", err);
        });
};
