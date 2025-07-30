// public/js/main.js

import * as state from './state.js';
import * as auth from './auth.js';
import * as api from './api.js';
import * as ui from './ui.js';
import * as checkout from './checkout.js';
import { loadGoogleMapsScript } from './maps.js';

// --- VARIABLES GLOBALES ---
let customerOrdersUnsubscribe = null; 

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
        await auth.handleLogin(email, password);
    } catch (error) {
        ui.showNotification("Usuario o contraseña incorrectos", true);
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
        await auth.handleRegister(name, email, password);
        ui.showNotification("¡Registro exitoso! Revisa tu correo para verificar tu cuenta.");
    } catch (error) {
        const message = error.code === 'auth/email-already-in-use' ? "Este correo ya está registrado" : `Error: ${error.message}`;
        ui.showNotification(message, true);
    } finally {
        ui.revertButtonLoadingState(button);
    }
};

// --- LÓGICA DE INICIALIZACIÓN Y ESTADO DE LA APP ---
function onUserLoggedIn(userProfile) {
    state.setCurrentUser(userProfile);
    document.getElementById('auth-container').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    const profileButtonText = document.getElementById('profile-button-text');
    profileButtonText.textContent = userProfile.nombre || "Usuario";
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
    customerOrdersUnsubscribe = api.listenToCustomerOrders(userProfile.uid);
}

function onUserLoggedOut() {
    if (customerOrdersUnsubscribe) customerOrdersUnsubscribe();
    state.setCurrentUser(null);
    state.clearCart();
    ui.updateCartButton(state.getCart()); 
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth-container').style.display = 'flex';
    document.getElementById('profile-button-text').textContent = "Ingresar";
    ui.renderAuthWall('login');
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
        renderAuthWall: () => ui.renderAuthWall(target.dataset.view),
        handleLogin: (e) => handleLogin(e),
        handleRegister: (e) => handleRegister(e),
        handleLogout: auth.handleLogout,
        proceedToCheckout: checkout.proceedToCheckout,
    };
    if (actions[action]) {
        actions[action](e);
    }
}

// --- ARRANQUE DE LA APLICACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    auth.initAuthListener(onUserLoggedIn, onUserLoggedOut);
    checkPaymentStatus(); 
    api.checkStoreStatus();
    setInterval(api.checkStoreStatus, 60000);
    document.body.addEventListener('click', handleEvent);
    lucide.createIcons();
});
