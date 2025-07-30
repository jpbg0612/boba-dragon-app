// public/js/api.js
// El "Mensajero". Su única responsabilidad es comunicarse con Firestore.

import { db } from './auth.js'; // Sigue obteniendo 'db' desde auth.js, que ahora está corregido.
import * as state from './state.js';
import { renderHomePage, showNotification } from './ui.js';

// Obtenemos las funciones de Firestore desde el SDK global.
const { collection, query, where, getDocs, onSnapshot, doc, getDoc, updateDoc, serverTimestamp, addDoc } = firebase.firestore;

// --- LISTENERS DE DATOS ---

export function listenToPromotions() {
    const promotionsCollectionRef = collection(db, "promotions");
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
    });
}

export function listenToCustomerOrders(userId) {
    if (!userId) return null;
    const pedidosCollectionRef = collection(db, "pedidos");
    const q = query(pedidosCollectionRef, where("userId", "==", userId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        state.setCustomerOrders(orders); // Necesitaríamos añadir setCustomerOrders en state.js
        
        const myOrdersSection = document.getElementById('mis-pedidos');
        if (myOrdersSection && myOrdersSection.style.display === 'block') {
            // Aquí llamaríamos a una función como ui.renderMyOrdersPage(orders);
        }
    });
    return unsubscribe;
}

// --- LÓGICA DE LA TIENDA ---
export const checkStoreStatus = async () => {
    const settingsDocRef = doc(db, "settings", "store");
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (docSnap.exists()) {
            const settings = docSnap.data();
            state.setManualStoreStatus(settings.manualStatus); // Necesitaríamos añadir esto en state.js
            // La UI se encargará de mostrar si la tienda está abierta o cerrada
        }
    } catch (error) {
        console.error("Error checking store status:", error);
    }
};

// --- OTRAS FUNCIONES DE API ---

export async function placeOrder(orderData) {
    try {
        const pedidosCollectionRef = collection(db, "pedidos");
        const docRef = await addDoc(pedidosCollectionRef, {
            ...orderData,
            createdAt: serverTimestamp(),
            status: 'pagado'
        });
        return docRef.id;
    } catch (error) {
        console.error("Error placing order: ", error);
        showNotification("Hubo un error al registrar tu pedido.", true);
        return null;
    }
}
