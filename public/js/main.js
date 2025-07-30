// public/js/main.js

// Importa los módulos de Firebase necesarios directamente desde CDN.
// Es CRUCIAL que estas importaciones estén aquí y y que el script main.js
// sea cargado con type="module" en tu index.html.
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// Si usas otros servicios de Firebase (Messaging, Functions), impórtalos aquí:
// import { getMessaging } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging.js";
// import { getFunctions } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-functions.js";

// Importa tus propios módulos de la aplicación.
// Asegúrate de que las rutas sean relativas a este archivo (main.js).
import * as state from './state.js';
import * as auth from './auth.js';
import * as api from './api.js';
import * as ui from './ui.js'; // CORRECCIÓN APLICADA: Era 'import * => ui', ahora es 'import * as ui'
import * as checkout from './checkout.js';
import { loadGoogleMapsScript } from './maps.js';

// --- VARIABLES GLOBALES ---
let firebaseApp;
let firebaseAuth;
let firebaseDb;
let customerOrdersUnsubscribe = null;
let currentUserId = null;

// --- LÓGICA DE INICIALIZACIÓN DE FIREBASE (ADAPTATIVA) ---
function initializeFirebaseAdaptive() {
    // Detecta si estamos en el entorno de Canvas o en Firebase Hosting
    if (typeof __firebase_config !== 'undefined') {
        // Entorno de Canvas: Usa la configuración inyectada por el entorno de Canvas
        const firebaseConfig = JSON.parse(__firebase_config);
        firebaseApp = initializeApp(firebaseConfig);
        console.log("Firebase inicializado para Canvas.");
    } else if (typeof firebase !== 'undefined' && typeof firebase.app === 'function') {
        // Entorno de Firebase Hosting: Usa la app inicializada por /__/firebase/init.js
        // Asegúrate de que la app no haya sido ya inicializada para evitar errores
        if (!getApps().length) {
            firebaseApp = firebase.app(); // Usa la app pre-inicializada por el script de Firebase Hosting
        } else {
            firebaseApp = getApp(); // Obtiene la app ya inicializada
        }
        console.log("Firebase inicializado para Hosting.");
    } else {
        // Fallback si no se detecta ningún entorno (esto solo debería ocurrir en desarrollo local
        // sin emuladores o sin la configuración de Firebase inyectada).
        console.error("No se pudo detectar el entorno de Firebase. Usando configuración de fallback.");
        const fallbackConfig = {
            apiKey: "TU_API_KEY_DE_FIREBASE", // ¡IMPORTANTE! Reemplaza con tu clave API real para desarrollo local sin Canvas/Hosting
            authDomain: "TU_AUTH_DOMAIN",
            projectId: "TU_PROJECT_ID",
            storageBucket: "TU_STORAGE_BUCKET",
            messagingSenderId: "TU_MESSAGING_SENDER_ID",
            appId: "TU_APP_ID_FIREBASE",
            measurementId: "TU_MEASUREMENT_ID"
        };
        firebaseApp = initializeApp(fallbackConfig);
    }

    firebaseAuth = getAuth(firebaseApp);
    firebaseDb = getFirestore(firebaseApp);
    // firebaseMessaging = getMessaging(firebaseApp); // Descomenta si usas Messaging
    // firebaseFunctions = getFunctions(firebaseApp); // Descomenta si usas Functions
}


// --- MANEJADORES DE AUTENTICACIÓN (UI) ---
const handleLogin = async (e) => {
    const button = e.target.closest('button');
    ui.setButtonLoadingState(button);
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        ui.showNotification("Por favor completa todos los campos", true);
        ui.revertButtonLoadingState(button);
        return;
    }

    try {
        await auth.loginUser(firebaseAuth, email, password);
    } catch (error) {
        console.error("Error en handleLogin:", error);
        ui.showNotification("Usuario o contraseña incorrectos", true);
    } finally {
        ui.revertButtonLoadingState(button);
    }
};

const handleRegister = async (e) => {
    const button = e.target.closest('button');
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    if (!name || !email || !password) {
        ui.showNotification("Por favor completa todos los campos", true);
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        ui.showNotification("Por favor ingresa un correo electrónico válido.", true);
        return;
    }
    if (password.length < 6) {
        ui.showNotification("La contraseña debe tener al menos 6 caracteres.", true);
        return;
    }

    ui.setButtonLoadingState(button);
    try {
        await auth.registerUser(firebaseAuth, firebaseDb, name, email, password);
        ui.showNotification("¡Registro exitoso! Revisa tu correo para verificar tu cuenta.");
    } catch (error) {
        console.error("Error en handleRegister:", error);
        const message = error.code === 'auth/email-already-in-use' ? "Este correo ya está registrado" : `Error: ${error.message}`;
        ui.showNotification(message, true);
    } finally {
        ui.revertButtonLoadingState(button);
    }
};

// --- LÓGICA DE INICIALIZACIÓN Y ESTADO DE LA APP ---
async function onUserLoggedIn(user) {
    if (!user || !user.uid) {
        console.error("Usuario loggeado sin UID. Esto no debería pasar.");
        onUserLoggedOut();
        return;
    }

    currentUserId = user.uid;
    console.log("Usuario autenticado:", user.uid);

    let userProfile = await api.getUserProfile(firebaseDb, user.uid);
    if (!userProfile) {
        userProfile = { uid: user.uid, email: user.email, nombre: user.displayName || "Usuario", rol: 'cliente' };
    }

    state.setCurrentUser(userProfile);
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    const profileButtonText = document.getElementById('profile-button-text');
    profileButtonText.textContent = userProfile.nombre || "Usuario";
    
    loadGoogleMapsScript(firebaseApp); // Pasa firebaseApp a loadGoogleMapsScript
    
    if (userProfile.rol === 'repartidor') {
        document.getElementById('main-nav').style.display = 'none';
        document.getElementById('logout-button-repartidor').classList.remove('hidden');
        ui.navigateTo('repartidor-panel');
    } else {
        document.getElementById('main-nav').style.display = 'flex';
        document.getElementById('logout-button-repartidor').classList.add('hidden');
        if (!new URLSearchParams(window.location.search).has('payment_status')) {
            ui.navigateTo('inicio');
            ui.renderHomePageSkeleton();
            api.listenToPromotions(firebaseDb);
        }
    }
    if (userProfile.rol === 'cliente') {
        customerOrdersUnsubscribe = api.listenToCustomerOrders(firebaseDb, userProfile.uid);
    }
    
    const statusElement = document.getElementById('firebase-status');
    if (statusElement) {
        statusElement.textContent = `Firebase conectado. Usuario ID: ${user.uid} (${userProfile.rol})`;
        statusElement.classList.remove('bg-blue-100', 'text-blue-800', 'bg-red-100');
        statusElement.classList.add('bg-green-100', 'text-green-800');
    }
}

function onUserLoggedOut() {
    if (customerOrdersUnsubscribe) {
        customerOrdersUnsubscribe();
        customerOrdersUnsubscribe = null;
    }
    state.setCurrentUser(null);
    state.clearCart();
    ui.updateCartButton(state.getCart()); 
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('profile-button-text').textContent = "Ingresar";
    ui.renderAuthWall('login');

    const statusElement = document.getElementById('firebase-status');
    if (statusElement) {
        statusElement.textContent = `Sesión cerrada.`;
        statusElement.classList.remove('bg-green-100', 'text-green-800', 'bg-red-100');
        statusElement.classList.add('bg-blue-100', 'text-blue-800');
    }
}

function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    if (paymentStatus === 'success') {
        ui.showNotification('¡Pago exitoso! Tu pedido está en proceso.', false);
        state.clearCart();
        ui.updateCartButton(state.getCart());
        ui.navigateTo('mis-pedidos');
        window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'cancel') {
        ui.showNotification('El pago fue cancelado. Puedes intentarlo de nuevo desde tu carrito.', true);
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

// --- MANEJADOR DE EVENTOS PRINCIPAL ---
function handleEvent(e) {
    let target = e.target.closest('[data-action]');
    if (!target) return;
    e.preventDefault();
    const action = target.dataset.action;
    const actions = {
        renderHomePage: () => { 
            ui.navigateTo('inicio'); 
            ui.renderHomePageSkeleton(); 
            api.listenToPromotions(firebaseDb);
        },
        renderAuthWall: () => ui.renderAuthWall(target.dataset.view),
        handleLogin: (e) => handleLogin(e),
        handleRegister: (e) => handleRegister(e),
        handleLogout: () => auth.logoutUser(firebaseAuth),
        proceedToCheckout: () => checkout.proceedToCheckout(firebaseApp, currentUserId, state.getCart()),
    };
    if (actions[action]) {
        actions[action](e);
    }
}

// --- ARRANQUE DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebaseAdaptive(); // Llama a la función de inicialización adaptativa
    
    // Asegúrate de que las instancias de Firebase estén disponibles antes de pasarlas
    if (!firebaseApp || !firebaseAuth || !firebaseDb) {
        console.error("Firebase no se inicializó correctamente. No se puede continuar.");
        const statusElement = document.getElementById('firebase-status');
        if (statusElement) {
            statusElement.textContent = `Error: Firebase no inicializado.`;
            statusElement.classList.remove('bg-blue-100', 'text-blue-800');
            statusElement.classList.add('bg-red-100', 'text-red-800');
        }
        return;
    }

    // Pasa initialAuthToken solo si estamos en el entorno Canvas
    const tokenToUse = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
    auth.initAuthListener(firebaseAuth, tokenToUse, onUserLoggedIn, onUserLoggedOut);
    
    checkPaymentStatus(); 
    api.checkStoreStatus(firebaseDb);
    setInterval(() => api.checkStoreStatus(firebaseDb), 60000);
    document.body.addEventListener('click', handleEvent);
    
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    } else {
        console.warn("Lucide Icons no está cargado o createIcons no está disponible.");
    }

    console.log("Aplicación iniciada. Firebase configurado.");
});
