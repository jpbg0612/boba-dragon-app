// public/js/maps.js
// Este módulo se encarga de cargar el API de Google Maps de forma segura.

// Importa las funciones de Firebase Functions directamente desde CDN.
// Asegúrate de que la versión coincida con la que tienes en tu proyecto.
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-functions.js"; // Usar la misma versión que en main.js

// Importa el módulo UI si necesitas mostrar notificaciones.
// import { showNotification } from './ui.js'; // Descomentar si tienes la función showNotification en ui.js

let isMapsApiLoaded = false;

/**
 * Llama a la función en la nube para obtener la clave de API de Google Maps
 * y luego carga dinámicamente el script de Google Maps.
 * @param {object} firebaseApp - La instancia de la aplicación de Firebase.
 */
export async function loadGoogleMapsScript(firebaseApp) { // Ahora recibe firebaseApp
    // Si el script ya se cargó o se está cargando, no hacemos nada.
    if (isMapsApiLoaded) {
        return;
    }
    isMapsApiLoaded = true; // Marcamos como que ya iniciamos la carga

    if (!firebaseApp) {
        console.error("Firebase App instance no proporcionada a loadGoogleMapsScript.");
        // showNotification("Error interno: La aplicación no está inicializada correctamente para cargar mapas.", true);
        isMapsApiLoaded = false; // Permitir reintentar si falla
        return;
    }

    try {
        // Inicializa Firebase Functions con la instancia de firebaseApp
        const functions = getFunctions(firebaseApp);
        const getGoogleMapsApiKey = httpsCallable(functions, 'getGoogleMapsApiKey');

        // 1. Pedimos la clave a nuestra función segura en la nube.
        const result = await getGoogleMapsApiKey();
        const apiKey = result.data.apiKey;

        // 2. Creamos una nueva etiqueta <script>
        const script = document.createElement('script');
        // Asegúrate de que 'initAutocomplete' sea una función globalmente accesible
        // o que tu lógica de mapa se inicialice de otra forma después de la carga del script.
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`;
        script.async = true;
        script.defer = true;
        
        // 3. La añadimos al final del body del documento.
        document.body.appendChild(script);
        console.log("Script de Google Maps cargado dinámicamente.");

    } catch (error) {
        console.error("Error al cargar el script de Google Maps:", error);
        // showNotification("No se pudo cargar el mapa. Por favor, recarga la página.", true);
        isMapsApiLoaded = false; // Permitir reintentar si falla
    }
}
