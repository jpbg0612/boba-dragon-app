// public/js/ui.test.js

// Importamos las funciones globales de Jest
import { describe, beforeEach, test, expect, jest } from '@jest/globals';

// Importamos la función que vamos a probar
import { updateCartButton } from './ui.js';

// 'describe' agrupa las pruebas para la UI
describe('Funciones de UI', () => {

    // Grupo de pruebas específico para la función updateCartButton
    describe('updateCartButton', () => {

        // Antes de cada prueba, preparamos un entorno limpio.
        beforeEach(() => {
            document.body.innerHTML = '<div id="cart-button-container"></div>';
            global.lucide = { createIcons: jest.fn() };
        });

        // Prueba 1: El carrito está vacío
        test('no debe renderizar nada si el carrito está vacío', () => {
            // 1. Preparamos el escenario: un carrito vacío.
            const emptyCart = [];
            
            // 2. Ejecutamos la función, pasándole el carrito vacío.
            updateCartButton(emptyCart);

            // 3. Verificamos el resultado.
            const container = document.getElementById('cart-button-container');
            expect(container.innerHTML).toBe('');
        });

        // Prueba 2: El carrito tiene productos
        test('debe renderizar un botón con la cantidad correcta si el carrito tiene items', () => {
            // 1. Preparamos el escenario con un carrito de prueba.
            const mockCart = [
                { name: 'Taro', quantity: 2 },
                { name: 'Chocolate', quantity: 1 }
            ];
            
            // 2. Ejecutamos la función, pasándole nuestro carrito.
            updateCartButton(mockCart);

            // 3. Verificamos el resultado.
            const container = document.getElementById('cart-button-container');
            const button = container.querySelector('button');
            expect(button).not.toBeNull(); // El botón debe existir
            
            const countSpan = container.querySelector('span');
            expect(countSpan).not.toBeNull(); // El contador debe existir
            expect(countSpan.textContent).toBe('3'); // El texto del contador debe ser '3'
        });
    });
});
