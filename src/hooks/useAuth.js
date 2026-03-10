import { useState, useEffect } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { auth } from "../firebase.js";

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u ?? null);
            setAuthReady(true);
        });
        return unsub;
    }, []);

    const login = async (username, password) => {
        const fakeEmail = `${username}@fake.local`;
        try {
            await signInWithEmailAndPassword(auth, fakeEmail, password);
        } catch {
            await createUserWithEmailAndPassword(auth, fakeEmail, password);
        }
    };

    const logout = () => signOut(auth);

    return { user, authReady, login, logout };
};
