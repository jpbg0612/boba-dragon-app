// public/js/main.js

// Importa los módulos de Firebase necesarios directamente desde CDN.
// Es CRUCIAL que estas importaciones estén aquí y que el script main.js
// sea cargado con type="module" en tu index.html.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// Si usas otros servicios de Firebase (Messaging, Functions), impórtalos aquí:
// import { getMessaging } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-messaging.js";
// import { getFunctions } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-functions.js";

// Importa tus propios módulos de la aplicación.
// Asegúrate de que las rutas sean relativas a este archivo (main.js).
import * as state from './state.js';
import * as auth from './auth.js'; // Este módulo ahora recibirá las instancias de Firebase
import * as api from './api.js';
import * as ui from './ui.js';
import * as checkout from './checkout.js';
import { loadGoogleMapsScript } from './maps.js'; // Asumiendo que maps.js exporta esta función

// **Variables globales proporcionadas por el entorno de Canvas (¡MANDATORIO USARLAS!)**
// Estas variables se inyectan automáticamente en el entorno de ejecución.
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    // Si no se proporciona __firebase_config, usa una configuración de ejemplo.
    // **¡IMPORTANTE!** Reemplaza esto con tu configuración real de Firebase si no se inyecta automáticamente.
    apiKey: "TU_API_KEY_DE_FIREBASE", // Reemplaza con tu clave API real
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID_FIREBASE",
    measurementId: "TU_MEASUREMENT_ID"
};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Inicializa Firebase con la configuración proporcionada
const firebaseApp = initializeApp(firebaseConfig);
const firebaseAuth = getAuth(firebaseApp);
const firebaseDb = getFirestore(firebaseApp);
// const firebaseMessaging = getMessaging(firebaseApp); // Descomenta si usas Messaging
// const firebaseFunctions = getFunctions(firebaseApp); // Descomenta si usas Functions

// Variable para almacenar la función de desuscripción de órdenes de cliente
let customerOrdersUnsubscribe = null;
let currentUserId = null; // Para almacenar el ID del usuario actual

// --- MANEJADORES DE AUTENTICACIÓN (UI) ---
// Estas funciones ahora llamarán a la lógica de autenticación que estará en auth.js
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
        // Llama a la función de login del módulo auth, pasándole las credenciales y la instancia de auth
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
        // Llama a la función de registro del módulo auth, pasándole los datos y la instancia de auth
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
// Estas funciones se ejecutan cuando el estado de autenticación cambia
async function onUserLoggedIn(user) {
    // Asegúrate de que el usuario tenga un UID antes de proceder
    if (!user || !user.uid) {
        console.error("Usuario loggeado sin UID. Esto no debería pasar.");
        onUserLoggedOut(); // Forzar logout si el usuario no es válido
        return;
    }

    currentUserId = user.uid;
    console.log("Usuario autenticado:", user.uid);

    // Obtener el perfil del usuario desde Firestore
    let userProfile = await api.getUserProfile(firebaseDb, user.uid);
    if (!userProfile) {
        // Si no existe el perfil en Firestore (ej. primer login o registro anónimo),
        // crea un perfil básico o maneja el caso.
        userProfile = { uid: user.uid, email: user.email, nombre: user.displayName || "Usuario", rol: 'cliente' };
        // Opcional: Guarda este perfil básico en Firestore si es un nuevo usuario
        // await api.createUserProfile(firebaseDb, user.uid, userProfile);
    }

    state.setCurrentUser(userProfile);
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    const profileButtonText = document.getElementById('profile-button-text');
    profileButtonText.textContent = userProfile.nombre || "Usuario";
    
    loadGoogleMapsScript(); // Carga el script de Google Maps

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
            api.listenToPromotions(firebaseDb); // Pasa la instancia de firebaseDb
        }
    }
    // Suscribirse a las órdenes del cliente solo si es un cliente
    if (userProfile.rol === 'cliente') {
        customerOrdersUnsubscribe = api.listenToCustomerOrders(firebaseDb, userProfile.uid); // Pasa firebaseDb
    }
    
    // Actualiza el estado de Firebase en la UI
    const statusElement = document.getElementById('firebase-status');
    if (statusElement) {
        statusElement.textContent = `Firebase conectado. Usuario ID: ${user.uid} (${userProfile.rol})`;
        statusElement.classList.remove('bg-blue-100', 'text-blue-800', 'bg-red-100');
        statusElement.classList.add('bg-green-100', 'text-green-800');
    }
}

function onUserLoggedOut() {
    if (customerOrdersUnsubscribe) {
        customerOrdersUnsubscribe(); // Desuscribirse de las órdenes al cerrar sesión
        customerOrdersUnsubscribe = null;
    }
    state.setCurrentUser(null);
    state.clearCart();
    ui.updateCartButton(state.getCart()); 
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('profile-button-text').textContent = "Ingresar";
    ui.renderAuthWall('login');

    // Actualiza el estado de Firebase en la UI
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
            api.listenToPromotions(firebaseDb); // Pasa la instancia de firebaseDb
        },
        renderAuthWall: () => ui.renderAuthWall(target.dataset.view),
        handleLogin: (e) => handleLogin(e), // Llama a la función local handleLogin
        handleRegister: (e) => handleRegister(e), // Llama a la función local handleRegister
        handleLogout: () => auth.logoutUser(firebaseAuth), // Llama a la función de logout del módulo auth
        proceedToCheckout: () => checkout.proceedToCheckout(firebaseApp, currentUserId, state.getCart()), // Pasa firebaseApp, userId y el carrito
    };
    if (actions[action]) {
        actions[action](e);
    }
}

// --- ARRANQUE DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa el listener de autenticación en el módulo auth,
    // pasándole las instancias de Firebase y las funciones de callback.
    auth.initAuthListener(firebaseAuth, initialAuthToken, onUserLoggedIn, onUserLoggedOut);
    
    checkPaymentStatus(); 
    api.checkStoreStatus(firebaseDb); // Pasa la instancia de firebaseDb
    setInterval(() => api.checkStoreStatus(firebaseDb), 60000); // Pasa la instancia de firebaseDb
    document.body.addEventListener('click', handleEvent);
    
    // Asegúrate de que lucide.createIcons() se ejecute después de que el DOM esté listo
    // y si la librería Lucide Icons está cargada.
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    } else {
        console.warn("Lucide Icons no está cargado o createIcons no está disponible.");
    }

    console.log("Aplicación iniciada. Firebase configurado.");
});

