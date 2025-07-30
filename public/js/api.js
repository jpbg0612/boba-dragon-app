// public/js/api.js
// El "Mensajero". Su única responsabilidad es comunicarse con Firestore.

// ¡IMPORTANTE! Ya no importamos 'db' desde auth.js.
// En su lugar, las funciones de este módulo recibirán la instancia de db
// directamente desde main.js como un argumento.

// Importa las funciones específicas de Firestore que necesitas directamente desde CDN.
// Esto es crucial para que funcione con el sistema de módulos.
import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
    addDoc
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

import * as state from './state.js';
import { renderHomePage, showNotification } from './ui.js';

// --- LISTENERS DE DATOS ---

/**
 * Escucha los cambios en las promociones activas y actualiza el estado y la UI.
 * @param {object} dbInstance - La instancia de Firebase Firestore.
 */
export function listenToPromotions(dbInstance) {
    const promotionsCollectionRef = collection(dbInstance, "promotions"); // Usa dbInstance
    const q = query(promotionsCollectionRef, where("isActive", "==", true));

    getDocs(q).then(snapshot => {
        const promos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        state.setPromotions(promos);
        const user = state.getCurrentUser();
        // Le pasamos los datos a la UI para que dibuje
        renderHomePage(user, promos);
    }).catch(error => {
        console.error("Error fetching promotions: ", error);
        const user = state.getCurrentUser();
        renderHomePage(user, []); // Renderizar sin promos si hay error
        showNotification("Error al cargar promociones.", true);
    });
}

/**
 * Escucha los cambios en las órdenes de un cliente específico.
 * @param {object} dbInstance - La instancia de Firebase Firestore.
 * @param {string} userId - El ID del usuario cuyas órdenes se quieren escuchar.
 * @returns {function|null} Función de desuscripción de la escucha en tiempo real.
 */
export function listenToCustomerOrders(dbInstance, userId) { // Ahora recibe dbInstance
    if (!userId) {
        console.warn("listenToCustomerOrders: userId es nulo o indefinido.");
        return null;
    }
    const pedidosCollectionRef = collection(dbInstance, "pedidos"); // Usa dbInstance
    const q = query(pedidosCollectionRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        state.setCustomerOrders(orders); // Necesitaríamos añadir setCustomerOrders en state.js

        const myOrdersSection = document.getElementById('mis-pedidos');
        if (myOrdersSection && myOrdersSection.style.display === 'block') {
            // Aquí llamaríamos a una función como ui.renderMyOrdersPage(orders);
            // Asegúrate de que ui.js tenga esta función y renderice las órdenes
            // Por ejemplo: ui.renderMyOrdersPage(orders);
            console.log("Órdenes del cliente actualizadas:", orders);
        }
    }, (error) => {
        console.error("Error listening to customer orders: ", error);
        showNotification("Error al cargar tus pedidos.", true);
    });
    return unsubscribe;
}

// --- LÓGICA DE LA TIENDA ---
/**
 * Verifica el estado de la tienda (abierta/cerrada).
 * @param {object} dbInstance - La instancia de Firebase Firestore.
 */
export const checkStoreStatus = async (dbInstance) => { // Ahora recibe dbInstance
    const settingsDocRef = doc(dbInstance, "settings", "store"); // Usa dbInstance
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            const settings = docSnap.data();
            state.setManualStoreStatus(settings.manualStatus); // Necesitaríamos añadir esto en state.js
            // La UI se encargará de mostrar si la tienda está abierta o cerrada
            console.log("Estado de la tienda:", settings.manualStatus ? "Abierta" : "Cerrada");
        } else {
            console.warn("Documento de configuración de la tienda no encontrado.");
            state.setManualStoreStatus(false); // Asume cerrada si no hay configuración
        }
    } catch (error) {
        console.error("Error checking store status:", error);
        showNotification("Error al verificar el estado de la tienda.", true);
    }
};

// --- OTRAS FUNCIONES DE API ---

/**
 * Realiza un pedido en Firestore.
 * @param {object} dbInstance - La instancia de Firebase Firestore.
 * @param {object} orderData - Los datos del pedido a guardar.
 * @returns {Promise<string|null>} El ID del documento del pedido o null si hay un error.
 */
export async function placeOrder(dbInstance, orderData) { // Ahora recibe dbInstance
    try {
        const pedidosCollectionRef = collection(dbInstance, "pedidos"); // Usa dbInstance
        const docRef = await addDoc(pedidosCollectionRef, {
            ...orderData,
            createdAt: serverTimestamp(),
            status: 'pagado' // O el estado inicial que corresponda
        });
        console.log("Pedido realizado con ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error placing order: ", error);
        showNotification("Hubo un error al registrar tu pedido.", true);
        return null;
    }
}

/**
 * Obtiene el perfil de un usuario desde Firestore.
 * Esta función ya existe en auth.js, pero si la necesitas aquí,
 * la importas de auth.js y la llamas con dbInstance.
 * @param {object} dbInstance - La instancia de Firebase Firestore.
 * @param {string} uid - El UID del usuario.
 * @returns {Promise<object|null>} El perfil del usuario o null si no existe.
 */
// export { getUserProfile } from './auth.js'; // Descomenta si necesitas importarla aquí

