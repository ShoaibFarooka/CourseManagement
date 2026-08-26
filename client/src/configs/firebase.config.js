import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Analytics is unavailable in some environments (SSR, unsupported browsers, blockers),
// and calling getAnalytics there throws. Guard it so it can never break sign-in.
isSupported()
    .then(supported => {
        if (supported) getAnalytics(app);
    })
    .catch(() => { });

export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

// Always show the account chooser rather than silently reusing the last Google session.
googleProvider.setCustomParameters({ prompt: "select_account" });

export default app;
