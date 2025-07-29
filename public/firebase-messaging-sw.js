// Importa los servicios de Firebase necesarios para el service worker.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getMessaging, onBackgroundMessage } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-sw.js";

// Tu configuración de Firebase
// (Es seguro tenerla aquí, Firebase la necesita para identificar tu proyecto)
const firebaseConfig = {
    apiKey: "AIzaSyD4z6h0Iy_pv-HYIcWOuWZyYzGea-c9Y-Y",
    authDomain: "bobadragonapp.firebaseapp.com",
    projectId: "bobadragonapp",
    storageBucket: "bobadragonapp.firebasestorage.app",
    messagingSenderId: "750155574698",
    appId: "1:750155574698:web:d91c935e9fcd2e9ef28fd3",
    measurementId: "G-S1HC27D95G"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

console.log("Service Worker de Firebase Messaging listo para escuchar.");

// Esta función se ejecuta cuando llega una notificación y la app está en segundo plano.
onBackgroundMessage(messaging, (payload) => {
    console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano: ', payload);

    // Personaliza y muestra la notificación.
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: 'https://4tsix0yujj.ufs.sh/f/2vMRHqOYUHc0FrdBXieDzTWwmhl5UyNfsFj9RSnotvEAKeiM' // URL de tu logo
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
