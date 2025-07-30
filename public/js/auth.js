// public/js/auth.js
// Módulo de autenticación. Ya NO inicializa Firebase.
// Simplemente utiliza los servicios que ya fueron inicializados en index.html.

// ¡LA CLAVE! Obtenemos los servicios del objeto global `firebase` que ya existe.
const auth = firebase.auth();
const db = firebase.firestore();
const messaging = firebase.messaging();

// Exportamos las constantes para que otros archivos como api.js puedan usarlas.
export { auth, db, messaging };

// --- LÓGICA DE AUTENTICACIÓN (sin cambios, sigue funcionando igual) ---

// Importamos las funciones que necesitamos directamente desde el SDK global.
// Esto es más limpio y aprovecha los scripts ya cargados.
const { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged, 
    sendPasswordResetEmail, 
    sendEmailVerification 
} = firebase.auth;

const { doc, setDoc, getDoc, serverTimestamp } = firebase.firestore;


export async function handleRegister(name, email, password) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userRole = 'cliente';
    const referralCode = `DRAGON-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    await setDoc(doc(db, "usuarios", user.uid), {
        nombre: name, email, rol: userRole,
        puntosRecompensa: 0, cupones: [], dailyVotes: 0, lastVoteDate: null, referralCode, referralPoints: 0,
        hasUsedReferralCode: false, votedCreations: [], createdAt: serverTimestamp(),
        fcmToken: null
    });

    await sendEmailVerification(user);
    return userCredential;
}

export function handleLogin(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function handleLogout() {
    return signOut(auth);
}

export function handleForgotPassword(email) {
    return sendPasswordResetEmail(auth, email);
}

export async function getUserProfile(uid) {
    const userDocRef = doc(db, "usuarios", uid);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
        return { uid, ...userDocSnap.data() };
    }
    return null;
}

export function initAuthListener(onUserLoggedIn, onUserLoggedOut) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userProfile = await getUserProfile(user.uid);
            if (userProfile) {
                onUserLoggedIn(userProfile);
            } else {
                console.error("No se encontró el perfil del usuario en Firestore. Cerrando sesión.");
                await handleLogout();
                onUserLoggedOut();
            }
        } else {
            onUserLoggedOut();
        }
    });
}
