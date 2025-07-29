// public/js/main.js

import * as state from './state.js';
import * as auth from './auth.js';
import * as api from './api.js';
import * as ui from './ui.js';
import * as checkout from './checkout.js';
import { loadGoogleMapsScript } from './maps.js'; // ¡NUEVO! Importamos el cargador de mapas.

// --- VARIABLES GLOBALES ---
let confirmCallback = null;
let customerOrdersUnsubscribe = null; 

// --- MANEJADORES DE AUTENTICACIÓN (UI) ---
const handleLogin = async (e) => {
    // ...
};

const handleRegister = async (e) => {
    // ...
};

// --- LÓGICA DE INICIALIZACIÓN Y ESTADO DE LA APP ---
function onUserLoggedIn(userProfile) {
    state.setCurrentUser(userProfile);
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    const profileButtonText = document.getElementById('profile-button-text');
    profileButtonText.textContent = userProfile.nombre || "Usuario";

    // ¡NUEVO! Cargamos el script de Google Maps de forma segura en cuanto el usuario entra.
    loadGoogleMapsScript();

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
            api.listenToPromotions();
        }
    }
}

function onUserLoggedOut() {
    if (customerOrdersUnsubscribe) customerOrdersUnsubscribe();
    state.setCurrentUser(null);
    state.clearCart();
    ui.updateCartButton(state.getCart()); 
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('profile-button-text').textContent = "Ingresar";
    // ui.renderAuthWall('login');
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
            api.listenToPromotions(); 
        },
        // ...
    };
    if (actions[action]) {
        actions[action](e);
    }
}

// --- ARRANQUE DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    auth.initAuthListener(onUserLoggedIn, onUserLoggedOut);
    checkPaymentStatus(); 
    document.body.addEventListener('click', handleEvent);
    lucide.createIcons();
});
