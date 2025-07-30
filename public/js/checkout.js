// public/js/checkout.js
// Especialista en pagos, ahora con una clave publicable dinámica y recibiendo la instancia de Firebase App.

// Importa las funciones de Firebase Functions directamente desde CDN.
// Asegúrate de que la versión coincida con la que tienes en tu proyecto.
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-functions.js"; // Asegúrate de usar la misma versión que en main.js y auth.js
import * as state from './state.js';
import { showNotification, setButtonLoadingState, revertButtonLoadingState } from './ui.js';

// ¡LA MAGIA! Este es el marcador de posición que nuestro robot reemplazará.
// Asegúrate de que tu robot de despliegue realmente reemplace esta cadena.
const STRIPE_PUBLISHABLE_KEY = "__STRIPE_PUBLISHABLE_KEY__";

// Inicializa Stripe con tu clave publicable.
// Asegúrate de que la librería de Stripe esté cargada en tu index.html antes que este script.
// <script src="https://js.stripe.com/v3/"></script>
const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);

/**
 * Procede al proceso de checkout de Stripe.
 * @param {object} firebaseApp - La instancia de la aplicación de Firebase.
 * @param {string} userId - El ID del usuario actual.
 * @param {Array<object>} cart - El contenido actual del carrito del usuario.
 */
export async function proceedToCheckout(firebaseApp, userId, cart) { // Ahora recibe firebaseApp, userId y cart
    if (!firebaseApp) {
        console.error("Firebase App instance no proporcionada a proceedToCheckout.");
        showNotification("Error interno: La aplicación no está inicializada correctamente.", true);
        return;
    }

    if (!cart || cart.length === 0) {
        showNotification("Tu carrito está vacío.", true);
        return;
    }

    // Inicializa Firebase Functions con la instancia de firebaseApp
    const functions = getFunctions(firebaseApp);
    const createStripeCheckout = httpsCallable(functions, 'createStripeCheckout');

    const checkoutButton = document.querySelector('[data-action="proceedToCheckout"]');
    if (checkoutButton) { // Asegúrate de que el botón exista antes de cambiar su estado
        setButtonLoadingState(checkoutButton);
    }

    try {
        const shippingInfo = state.getShippingInfo();
        const result = await createStripeCheckout({
            cart: cart,
            shippingCost: shippingInfo ? shippingInfo.cost : 0,
            userId: userId // Pasa el userId a tu función de la nube si es necesario para el pedido
        });

        // Redirigimos a la página de pago de Stripe.
        // El código de la función en la nube (index.js en Cloud Functions) ya se encarga de esto,
        // pero la redirección final se hace desde aquí.
        if (result.data && result.data.url) {
            window.location.href = result.data.url;
        } else {
            throw new Error("URL de checkout de Stripe no recibida.");
        }

    } catch (error) {
        console.error("Error al iniciar el checkout:", error);
        showNotification("Hubo un error al procesar tu pago. Inténtalo de nuevo.", true);
    } finally {
        if (checkoutButton) {
            revertButtonLoadingState(checkoutButton);
        }
    }
}
