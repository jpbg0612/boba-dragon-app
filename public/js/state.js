// public/js/state.js

// --- EL PIZARRÓN CENTRAL (ESTADO DE LA APP) ---
// Aquí viven todos los datos importantes de la aplicación en un solo lugar.
const state = {
    currentUser: null,
    cart: [],
    promotions: [],
    communityCreations: [],
    monthlyWinners: [],
    repartidoresDisponibles: [],
    inventoryStatus: {},
    productCosts: {},
    currentPromotionIndex: 0,
    manualStoreStatus: 'auto',
    shippingInfo: null,
    // Podríamos añadir más cosas aquí a futuro, como la página actual, etc.
};

// --- FUNCIONES PARA LEER EL PIZARRÓN (GETTERS) ---
// Para consultar un dato, usamos estas funciones. Es como preguntarle al encargado del pizarrón.
export const getCurrentUser = () => state.currentUser;
export const getCart = () => state.cart;
export const getPromotions = () => state.promotions;
export const getShippingInfo = () => state.shippingInfo;
// ... y así sucesivamente para cada pieza del estado.

// --- FUNCIONES PARA MODIFICAR EL PIZARRÓN (SETTERS) ---
// ESTA ES LA ÚNICA MANERA PERMITIDA de cambiar los datos. Se prohíbe modificar el pizarrón directamente.
// Esto nos da control total y evita errores.

export function setCurrentUser(user) {
    state.currentUser = user;
}

export function setCart(newCart) {
    state.cart = newCart;
}

export function addToCart(item) {
    // Para evitar duplicados y manejar cantidades, hacemos la lógica aquí.
    const existingItemIndex = state.cart.findIndex(cartItem => cartItem.id === item.id && JSON.stringify(cartItem.customization) === JSON.stringify(item.customization));

    if (existingItemIndex > -1) {
        state.cart[existingItemIndex].quantity += 1;
    } else {
        // Asignamos un ID único para poder eliminarlo fácilmente después
        const cartItemId = `cart-${Date.now()}-${Math.random()}`;
        state.cart.push({ ...item, quantity: 1, cartItemId });
    }
}

export function updateCartItemQuantity(cartItemId, newQuantity) {
    const itemIndex = state.cart.findIndex(item => item.cartItemId === cartItemId);
    if (itemIndex > -1) {
        if (newQuantity > 0) {
            state.cart[itemIndex].quantity = newQuantity;
        } else {
            // Si la cantidad es 0 o menos, lo eliminamos.
            removeFromCart(cartItemId);
        }
    }
}

export function removeFromCart(cartItemId) {
    state.cart = state.cart.filter(item => item.cartItemId !== cartItemId);
}

export function clearCart() {
    state.cart = [];
}

export function setPromotions(promos) {
    state.promotions = promos;
}

export function setShippingInfo(info) {
    state.shippingInfo = info;
}
