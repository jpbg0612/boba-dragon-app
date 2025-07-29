// public/js/checkout.js
// Especialista en pagos, ahora con una clave publicable dinámica.

import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";
import * as state from './state.js';
import { app } from './auth.js';
import { showNotification, setButtonLoadingState, revertButtonLoadingState } from './ui.js';

// ¡LA MAGIA! Este es el marcador de posición que nuestro robot reemplazará.
const STRIPE_PUBLISHABLE_KEY = "__STRIPE_PUBLISHABLE_KEY__";
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

const functions = getFunctions(app);
const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');

export async function proceedToCheckout() {
    const cart = state.getCart();
    if (cart.length === 0) {
        showNotification("Tu carrito está vacío.", true);
        return;
    }

    const checkoutButton = document.querySelector('[data-action="proceedToCheckout"]');
    setButtonLoadingState(checkoutButton);

    try {
        const shippingInfo = state.getShippingInfo();
        const result = await createStripeCheckout({ 
            cart: cart,
            shippingCost: shippingInfo ? shippingInfo.cost : 0
        });
        
        // Redirigimos a la página de pago de Stripe.
        // El código de la función en la nube (index.js) ya se encarga de esto,
        // pero la redirección final se hace desde aquí.
        window.location.href = result.data.url;

    } catch (error) {
        console.error("Error al iniciar el checkout:", error);
        showNotification("Hubo un error al procesar tu pago. Inténtalo de nuevo.", true);
        revertButtonLoadingState(checkoutButton);
    }
}
