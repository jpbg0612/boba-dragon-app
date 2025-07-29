// js/auth.js

// --- PASO 1: IMPORTACIONES Y CONFIGURACIÓN DE FIREBASE ---
// Importamos todo lo necesario de Firebase en este archivo central.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getMessaging, getToken } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging.js";

// Tu configuración de Firebase.
const firebaseConfig = {
    apiKey: "AIzaSyD4z6h0Iy_pv-HYIcWOuWZyYzGea-c9Y-Y",
    authDomain: "bobadragonapp.firebaseapp.com",
    projectId: "bobadragonapp",
    storageBucket: "bobadragonapp.firebasestorage.app",
    messagingSenderId: "750155574698",
    appId: "1:750155574698:web:d91c935e9fcd2e9ef28fd3",
    measurementId: "G-S1HC27D95G"
};

// Inicializamos Firebase y exportamos los servicios para que otros archivos los puedan usar.
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// --- PASO 2: LÓGICA DE AUTENTICACIÓN ---
// Estas funciones ahora viven aquí, en su propio módulo.

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
    
    // Creamos el documento del usuario en Firestore.
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


// --- PASO 3: OBSERVADOR DE ESTADO DE AUTENTICACIÓN ---
// Esta es la función más importante. En lugar de controlar la UI directamente,
// simplemente observa si el usuario inicia o cierra sesión, y le "avisa"
// al archivo principal (main.js) para que él decida qué hacer.

/**
 * Inicializa el observador de estado de autenticación.
 * @param {function} onUserLoggedIn - Función a llamar cuando un usuario inicia sesión.
 * @param {function} onUserLoggedOut - Función a llamar cuando un usuario cierra sesión.
 */
export function initAuthListener(onUserLoggedIn, onUserLoggedOut) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Usuario ha iniciado sesión. Obtenemos su perfil.
            const userProfile = await getUserProfile(user.uid);
            if (userProfile) {
                onUserLoggedIn(userProfile); // Avisamos al main.js con los datos del perfil.
            } else {
                console.error("No se encontró el perfil del usuario en Firestore. Cerrando sesión.");
                await handleLogout();
                onUserLoggedOut(); // Avisamos que no hay usuario.
            }
        } else {
            // Usuario ha cerrado sesión.
            onUserLoggedOut(); // Avisamos al main.js.
        }
    });
}

/**
 * Solicita permiso para notificaciones y guarda el token.
 * @param {string} uid - El ID del usuario actual.
 */
export async function requestNotificationPermission(uid) {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey: 'BE7BBmO5HBBCi780MeDe_1TZmsmnGmkThcUs2vvEzeoUi0VoMXIGq2t6je4Qor2r-JviIkTBZET9plty7TkshS0' });
            if (currentToken) {
                const userDocRef = doc(db, "usuarios", uid);
                await updateDoc(userDocRef, { fcmToken: currentToken });
            }
        }
    } catch (error) {
        console.error('An error occurred while requesting permission or getting token. ', error);
    }
}
