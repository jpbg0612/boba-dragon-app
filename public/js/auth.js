// public/js/auth.js
// Módulo de autenticación seguro.

// --- PASO 1: IMPORTACIONES Y CONFIGURACIÓN DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js";

// --- IMPORTANTE: CONFIGURACIÓN SEGURA DE FIREBASE ---
// Ya no definimos la configuración aquí. El script /__/firebase/init.js
// que añadimos en index.html la proveerá automáticamente como una variable global `firebaseConfig`.

// Inicializamos Firebase con la configuración segura que nos da Firebase Hosting.
export const app = initializeApp(window.firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// --- LÓGICA DE AUTENTICACIÓN ---

/**
 * Inicia el proceso de registro de un nuevo usuario.
 * @param {string} name - Nombre del usuario.
 * @param {string} email - Correo del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<UserCredential>}
 */
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

/**
 * Inicia sesión de un usuario existente.
 * @param {string} email - Correo del usuario.
 * @param {string} password - Contraseña del usuario.
 * @returns {Promise<UserCredential>}
 */
export function handleLogin(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Cierra la sesión del usuario actual.
 * @returns {Promise<void>}
 */
export function handleLogout() {
    return signOut(auth);
}

/**
 * Envía un correo para restablecer la contraseña.
 * @param {string} email - Correo del usuario.
 * @returns {Promise<void>}
 */
export function handleForgotPassword(email) {
    return sendPasswordResetEmail(auth, email);
}

/**
 * Obtiene los datos del perfil de un usuario desde Firestore.
 * @param {string} uid - El ID del usuario.
 * @returns {Promise<object|null>}
 */
export async function getUserProfile(uid) {
    const userDocRef = doc(db, "usuarios", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
        return { uid, ...userDocSnap.data() };
    }
    return null;
}

/**
 * Inicializa el observador de estado de autenticación.
 * @param {function} onUserLoggedIn - Función a llamar cuando un usuario inicia sesión.
 * @param {function} onUserLoggedOut - Función a llamar cuando un usuario cierra sesión.
 */
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
