// public/js/auth.js
// Módulo de autenticación. Recibe las instancias de Firebase Auth y Firestore
// desde main.js y las utiliza para realizar operaciones de autenticación y datos.

// Importa las funciones específicas de Firebase Auth y Firestore que necesitas.
// Estas funciones se usarán con las instancias de auth y db que se pasarán.
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    sendEmailVerification,
    signInAnonymously, // Necesario para el inicio de sesión anónimo
    signInWithCustomToken // Necesario para el token personalizado de Canvas
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

import {
    doc,
    setDoc,
    getDoc,
    serverTimestamp,
    collection // Necesario para acceder a colecciones si es el caso
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import * as ui from './ui.js'; // Importa el módulo UI para notificaciones

/**
 * Registra un nuevo usuario con email y contraseña, crea su perfil en Firestore
 * y envía un correo de verificación.
 * @param {object} authInstance - La instancia de Firebase Auth.
 * @param {object} dbInstance - La instancia de Firebase Firestore.
 * @param {string} name - El nombre del usuario.
 * @param {string} email - El email del usuario.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<object>} La credencial del usuario.
 */
export async function registerUser(authInstance, dbInstance, name, email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
        const user = userCredential.user;
        const userRole = 'cliente';
        const referralCode = `DRAGON-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // Guarda el perfil del usuario en Firestore
        await setDoc(doc(dbInstance, "usuarios", user.uid), {
            nombre: name,
            email: email,
            rol: userRole,
            puntosRecompensa: 0,
            cupones: [],
            dailyVotes: 0,
            lastVoteDate: null,
            referralCode: referralCode,
            referralPoints: 0,
            hasUsedReferralCode: false,
            votedCreations: [],
            createdAt: serverTimestamp(),
            fcmToken: null // Se actualizará si se usa Firebase Messaging
        });

        // Envía el correo de verificación
        await sendEmailVerification(user);
        console.log("Usuario registrado y correo de verificación enviado.");
        return userCredential;
    } catch (error) {
        console.error("Error al registrar usuario:", error);
        throw error; // Re-lanza el error para que sea manejado por main.js
    }
}

/**
 * Inicia sesión de un usuario con email y contraseña.
 * @param {object} authInstance - La instancia de Firebase Auth.
 * @param {string} email - El email del usuario.
 * @param {string} password - La contraseña del usuario.
 * @returns {Promise<object>} La credencial del usuario.
 */
export function loginUser(authInstance, email, password) {
    return signInWithEmailAndPassword(authInstance, email, password);
}

/**
 * Cierra la sesión del usuario actual.
 * @param {object} authInstance - La instancia de Firebase Auth.
 * @returns {Promise<void>}
 */
export function logoutUser(authInstance) {
    return signOut(authInstance);
}

/**
 * Envía un correo de restablecimiento de contraseña.
 * @param {object} authInstance - La instancia de Firebase Auth.
 * @param {string} email - El email del usuario.
 * @returns {Promise<void>}
 */
export function resetPassword(authInstance, email) {
    return sendPasswordResetEmail(authInstance, email);
}

/**
 * Obtiene el perfil de un usuario desde Firestore.
 * @param {object} dbInstance - La instancia de Firebase Firestore.
 * @param {string} uid - El UID del usuario.
 * @returns {Promise<object|null>} El perfil del usuario o null si no existe.
 */
export async function getUserProfile(dbInstance, uid) {
    try {
        const userDocRef = doc(dbInstance, "usuarios", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            return { uid, ...userDocSnap.data() };
        }
        return null;
    } catch (error) {
        console.error("Error al obtener perfil de usuario:", error);
        return null;
    }
}

/**
 * Inicializa el listener de autenticación de Firebase.
 * Maneja el inicio de sesión con token personalizado o anónimo,
 * y llama a los callbacks cuando el usuario inicia o cierra sesión.
 * @param {object} authInstance - La instancia de Firebase Auth.
 * @param {string|null} initialAuthToken - El token de autenticación personalizado del entorno de Canvas.
 * @param {function} onUserLoggedInCallback - Callback a ejecutar cuando el usuario inicia sesión.
 * @param {function} onUserLoggedOutCallback - Callback a ejecutar cuando el usuario cierra sesión.
 */
export function initAuthListener(authInstance, initialAuthToken, onUserLoggedInCallback, onUserLoggedOutCallback) {
    // Primero, intenta iniciar sesión con el token personalizado si existe
    // o de forma anónima si no hay token.
    if (initialAuthToken) {
        signInWithCustomToken(authInstance, initialAuthToken)
            .then(() => console.log("Sesión iniciada con token personalizado."))
            .catch(error => {
                console.error("Error al iniciar sesión con token personalizado:", error);
                ui.showNotification(`Error de autenticación: ${error.message}`, true);
                // Si falla el token, intenta de forma anónima como fallback
                signInAnonymously(authInstance)
                    .then(() => console.log("Sesión iniciada anónimamente como fallback."))
                    .catch(anonError => {
                        console.error("Error al iniciar sesión anónimamente:", anonError);
                        ui.showNotification(`Error de autenticación anónima: ${anonError.message}`, true);
                    });
            });
    } else {
        // Si no hay token personalizado, intenta iniciar sesión anónimamente
        signInAnonymously(authInstance)
            .then(() => console.log("Sesión iniciada anónimamente."))
            .catch(error => {
                console.error("Error al iniciar sesión anónimamente:", error);
                ui.showNotification(`Error de autenticación anónima: ${error.message}`, true);
            });
    }

    // Luego, establece el listener para cualquier cambio en el estado de autenticación
    onAuthStateChanged(authInstance, async (user) => {
        if (user) {
            // Si hay un usuario, llama al callback. getUserProfile se llama en main.js
            onUserLoggedInCallback(user); 
        } else {
            // Si no hay usuario (sesión cerrada o nunca iniciada)
            onUserLoggedOutCallback();
        }
    });
}
