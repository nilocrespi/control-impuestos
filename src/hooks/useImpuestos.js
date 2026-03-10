import { useState, useEffect, useCallback, useRef } from "react";
import {
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc
} from "firebase/firestore";
import { db } from "../firebase.js";

const CACHE_KEY = (uid) => `impuestos_cache_${uid}`;
const saveCache = (uid, data) => { try { localStorage.setItem(CACHE_KEY(uid), JSON.stringify(data)); } catch {} };
const loadCache = (uid) => { try { const r = localStorage.getItem(CACHE_KEY(uid)); return r ? JSON.parse(r) : null; } catch { return null; } };
const todayES = () => new Date().toLocaleDateString("es-ES");

export const useImpuestos = (userId) => {
    const [impuestos, setImpuestos] = useState([]);
    const uidRef = useRef(userId);

    useEffect(() => { uidRef.current = userId; }, [userId]);

    useEffect(() => {
        if (!userId) { setImpuestos([]); return; }
        const cached = loadCache(userId);
        if (cached) setImpuestos(cached);
        getDocs(collection(db, `users/${userId}/impuestos`)).then((snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setImpuestos(data);
            saveCache(userId, data);
        });
    }, [userId]);

    const add = useCallback(async (newItem) => {
        const uid = uidRef.current;
        if (!uid) return;
        const tempId = `temp_${Date.now()}`;
        setImpuestos((prev) => { const u = [{ ...newItem, id: tempId, categorias: [] }, ...prev]; saveCache(uid, u); return u; });
        const ref = await addDoc(collection(db, `users/${uid}/impuestos`), { ...newItem, categorias: [] });
        setImpuestos((prev) => { const u = prev.map((i) => i.id === tempId ? { ...i, id: ref.id } : i); saveCache(uid, u); return u; });
    }, []);

    const toggle = useCallback(async (item) => {
        const uid = uidRef.current;
        if (!uid) return;
        const newPagado = !item.pagado;
        const newFechaPago = newPagado ? todayES() : null;
        setImpuestos((prev) => { const u = prev.map((i) => i.id === item.id ? { ...i, pagado: newPagado, fechaPago: newFechaPago } : i); saveCache(uid, u); return u; });
        await updateDoc(doc(db, `users/${uid}/impuestos`, item.id), { pagado: newPagado, fechaPago: newFechaPago });
    }, []);

    const remove = useCallback(async (id) => {
        const uid = uidRef.current;
        if (!uid) return;
        setImpuestos((prev) => { const u = prev.filter((i) => i.id !== id); saveCache(uid, u); return u; });
        await deleteDoc(doc(db, `users/${uid}/impuestos`, id));
    }, []);

    const addCategoria = useCallback(async (id, nuevaCategoria, categoriasActuales) => {
        const uid = uidRef.current;
        if (!uid) return;
        // Evitar duplicados (case-insensitive)
        if (categoriasActuales.some((c) => c.toLowerCase() === nuevaCategoria.toLowerCase())) return;
        const updated = [...categoriasActuales, nuevaCategoria];
        setImpuestos((prev) => { const u = prev.map((i) => i.id === id ? { ...i, categorias: updated } : i); saveCache(uid, u); return u; });
        await updateDoc(doc(db, `users/${uid}/impuestos`, id), { categorias: updated });
    }, []);

    const removeCategoria = useCallback(async (id, categoriaAEliminar, categoriasActuales) => {
        const uid = uidRef.current;
        if (!uid) return;
        const updated = categoriasActuales.filter((c) => c !== categoriaAEliminar);
        setImpuestos((prev) => { const u = prev.map((i) => i.id === id ? { ...i, categorias: updated } : i); saveCache(uid, u); return u; });
        await updateDoc(doc(db, `users/${uid}/impuestos`, id), { categorias: updated });
    }, []);

    return { impuestos, add, toggle, remove, addCategoria, removeCategoria };
};
