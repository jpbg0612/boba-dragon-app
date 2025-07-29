// public/js/checkout.js
// Especialista en pagos, ahora usando los estados de carga de la UI.

import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";
import * as state from './state.js';
import { app } from './auth.js';
import { showNotification, setButtonLoadingState, revertButtonLoadingState } from './ui.js'; // Importamos las nuevas herramientas

const functions = getFunctions(app);
const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');

export async function proceedToCheckout() {
    const cart = state.getCart();
    if (cart.length === 0) {
        showNotification("Tu carrito está vacío.", true);
        return;
    }

    const checkoutButton = document.querySelector('[data-action="proceedToCheckout"]');
    setButtonLoadingState(checkoutButton); // ¡NUEVO! Poner botón en modo carga

    try {
        const shippingInfo = state.getShippingInfo();
        const result = await createStripeCheckout({ 
            cart: cart,
            shippingCost: shippingInfo ? shippingInfo.cost : 0
        });
        window.location.href = result.data.url;

    } catch (error) {
        console.error("Error al iniciar el checkout:", error);
        showNotification("Hubo un error al procesar tu pago. Inténtalo de nuevo.", true);
        revertButtonLoadingState(checkoutButton); // ¡NUEVO! Revertir botón si hay error
    }
}
