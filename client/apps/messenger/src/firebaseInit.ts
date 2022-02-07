import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { addMessage } from "./features/chat/slice/chatSlice";
import { store } from "./store/store";

declare const FCM_API_KEY: string;
declare const FCM_AUTH_DOMAIN: string;
declare const FCM_PROJECT_ID: string;
declare const FCM_STORAGE_BUCKET: string;
declare const FCM_SENDER_ID: string;
declare const FCM_APP_ID: string;
declare const FCM_VAPID_KEY: string;

const firebaseConfig = {
    apiKey: FCM_API_KEY,
    authDomain: FCM_AUTH_DOMAIN,
    projectId: FCM_PROJECT_ID,
    storageBucket: FCM_STORAGE_BUCKET,
    messagingSenderId: FCM_SENDER_ID,
    appId: FCM_APP_ID,
};

const app = initializeApp(firebaseConfig);

const messaging = getMessaging(app);

const vapidKey = FCM_VAPID_KEY;

export const requestForToken = async (update: any) => {
    const swRegistration = await navigator.serviceWorker.register(
        "/public/firebase-messaging-sw.js"
    );
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

onMessage(messaging, (payload) => {
    console.log("payload", payload);
    const message = JSON.parse(payload.data.message);
    store.dispatch(addMessage(message));
});
