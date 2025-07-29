// public/js/api.js
// Este archivo es el "Mensajero". Su única responsabilidad es
// comunicarse con la base de datos de Firestore.

import { db } from './auth.js';
import * as state from './state.js';
import { renderHomePage } from './ui.js';
import { collection, query, where, getDocs, onSnapshot } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// --- LISTENERS DE DATOS ---

/**
 * Escucha las promociones activas en Firestore y actualiza el estado.
 * Luego, le pide a la UI que se redibuje si es necesario.
 */
export function listenToPromotions() {
    const promotionsCollectionRef = collection(db, "promotions");
    const q = query(promotionsCollectionRef, where("isActive", "==", true));
    
    // Usamos getDocs para obtenerlas una vez. Si necesitaras tiempo real, usaríamos onSnapshot.
    getDocs(q).then(snapshot => {
        const promos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        state.setPromotions(promos);
        
        // Verificamos si la página de inicio está visible para redibujarla.
        const inicioSection = document.getElementById('inicio');
        if (inicioSection && inicioSection.style.display === 'block') {
            renderHomePage();
        }
    }).catch(error => {
        console.error("Error fetching promotions: ", error);
        // Incluso si hay un error, intentamos renderizar la página de inicio
        // para que el usuario no vea una pantalla en blanco.
        renderHomePage();
    });
}

/**
 * (Ejemplo) Escucha los pedidos de un cliente en tiempo real.
 * @param {string} userId - El ID del usuario actual.
 * @returns {function} Una función para cancelar la suscripción (unsubscribe).
 */
export function listenToCustomerOrders(userId) {
    const pedidosCollectionRef = collection(db, "pedidos");
    const q = query(pedidosCollectionRef, where("userId", "==", userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        state.setCustomerOrders(orders); // Necesitaríamos añadir esto a state.js
        
        // Si la página de "Mis Pedidos" está activa, la actualizamos.
        const myOrdersSection = document.getElementById('mis-pedidos');
        if (myOrdersSection && myOrdersSection.style.display === 'block') {
            // renderMyOrdersPage(); // Necesitaríamos crear esta función en ui.js
        }
    });

    return unsubscribe;
}

// Aquí irían todas las demás funciones que interactúan con Firestore:
// export function listenToCommunityCreations() { ... }
// export function listenToInventory() { ... }
// export function placeOrder(orderData) { ... }
// etc.
