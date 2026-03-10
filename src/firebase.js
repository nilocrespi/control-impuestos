import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAmyNTf6-Xgr1WloFQQHlHR7bYCqNNsf10",
    authDomain: "control-impuestos.firebaseapp.com",
    projectId: "control-impuestos",
    storageBucket: "control-impuestos.firebasestorage.app",
    messagingSenderId: "479053655286",
    appId: "1:479053655286:web:2d7722de418e25659810d7"
};

const firebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
