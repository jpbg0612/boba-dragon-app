// public/js/utils.test.js

// Importamos la función que queremos probar.
// Nota: Jest tiene una forma especial de manejar los módulos de ES,
// puede que necesitemos ajustar la configuración si esto da error.
import { formatCurrency } from './utils.js';

// 'describe' agrupa un conjunto de pruebas relacionadas.
describe('Función formatCurrency', () => {
    
    // 'test' o 'it' define una prueba individual. La descripción debe ser clara.
    test('debe formatear un número simple correctamente', () => {
        // 'expect' es la afirmación. ¿Qué resultado esperamos?
        // Esperamos que al llamar a formatCurrency con 150, el resultado SEA '$150.00'.
        expect(formatCurrency(150)).toBe('$150.00');
    });

    test('debe añadir comas a números grandes', () => {
        expect(formatCurrency(12345.67)).toBe('$12,345.67');
    });

    test('debe manejar el número cero', () => {
        expect(formatCurrency(0)).toBe('$0.00');
    });

    test('debe manejar valores no numéricos de forma segura', () => {
        // Si le pasamos algo que no es un número, debe devolver '$0.00'.
        expect(formatCurrency('hola')).toBe('$0.00');
        expect(formatCurrency(null)).toBe('$0.00');
        expect(formatCurrency(undefined)).toBe('$0.00');
    });

});
