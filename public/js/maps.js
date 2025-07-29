// public/js/maps.js
// Este módulo se encarga de cargar el API de Google Maps de forma segura.

import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-functions.js";
import { app } from './auth.js';
// import { showNotification } from './ui.js'; // Descomentar si tienes la función showNotification en ui.js

const functions = getFunctions(app);
const getGoogleMapsApiKey = httpsCallable(functions, 'getGoogleMapsApiKey');

let isMapsApiLoaded = false;

/**
 * Llama a la función en la nube para obtener la clave de API de Google Maps
 * y luego carga dinámicamente el script de Google Maps.
 */
export async function loadGoogleMapsScript() {
    // Si el script ya se cargó o se está cargando, no hacemos nada.
    if (isMapsApiLoaded) {
        return;
    }
    isMapsApiLoaded = true; // Marcamos como que ya iniciamos la carga

    try {
        // 1. Pedimos la clave a nuestra función segura en la nube.
        const result = await getGoogleMapsApiKey();
        const apiKey = result.data.apiKey;

        // 2. Creamos una nueva etiqueta <script>
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initAutocomplete`;
        script.async = true;
        script.defer = true;
        
        // 3. La añadimos al final del body del documento.
        document.body.appendChild(script);

    } catch (error) {
        console.error("Error al cargar el script de Google Maps:", error);
        // showNotification("No se pudo cargar el mapa. Por favor, recarga la página.", true);
        isMapsApiLoaded = false; // Permitir reintentar si falla
    }
}
