// public/js/utils.js

/**
 * Formatea un número como moneda MXN.
 * @param {number} amount - La cantidad a formatear.
 * @returns {string} La cantidad formateada como string (e.g., "$1,234.50").
 */
export function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        return '$0.00';
    }
    // Usamos la API de Internacionalización de JavaScript para un formato perfecto.
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
    }).format(amount);
}
