// public/js/auth.js
// Módulo de autenticación. Ahora se encarga de inicializar Firebase.

// ¡LA CLAVE! Importamos las herramientas directamente desde las librerías de Firebase.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getMessaging } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js";

// Leemos la configuración segura que nuestro robot inyecta en el HTML.
const firebaseConfig = window.firebaseConfig;

// Inicializamos Firebase y exportamos los servicios.
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// --- LÓGICA DE AUTENTICACIÓN (sin cambios) ---

export async function handleRegister(name, email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userRole = 'cliente';
    const referralCode = `DRAGON-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    await setDoc(doc(db, "usuarios", user.uid), {
        nombre: name, email, rol: userRole,
        puntosRecompensa: 0, cupones: [], dailyVotes: 0, lastVoteDate: null, referralCode, referralPoints: 0,
        hasUsedReferralCode: false, votedCreations: [], createdAt: serverTimestamp(),
        fcmToken: null
    });

    await sendEmailVerification(user);
    return userCredential;
}

export function handleLogin(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function handleLogout() {
    return signOut(auth);
}

export function handleForgotPassword(email) {
    return sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid) {
    const userDocRef = doc(db, "usuarios", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
        return { uid, ...userDocSnap.data() };
    }
    return null;
}

export function initAuthListener(onUserLoggedIn, onUserLoggedOut) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userProfile = await getUserProfile(user.uid);
            if (userProfile) {
                onUserLoggedIn(userProfile);
            } else {
                console.error("No se encontró el perfil del usuario en Firestore. Cerrando sesión.");
                await handleLogout();
                onUserLoggedOut();
            }
        } else {
            onUserLoggedOut();
        }
    });
}
