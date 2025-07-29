// functions/index.js

// Importamos las herramientas necesarias
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// La clave secreta de Stripe se lee de la configuración segura
const stripe = require("stripe")(functions.config().stripe.secret);

// Inicializamos la conexión segura con tu proyecto de Firebase
admin.initializeApp();

/**
 * Crea una sesión de pago segura con Stripe.
 */
exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  // ... (el código de esta función se queda igual)
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Debes estar autenticado para realizar un pago.",
    );
  }
  const cartItems = data.cart;
  const shippingCost = data.shippingCost || 0;
  const line_items = cartItems.map((item) => {
    return {
      price_data: {
        currency: "mxn",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    };
  });
  if (shippingCost > 0) {
    line_items.push({
        price_data: {
            currency: "mxn",
            product_data: {
                name: "Costo de Envío",
            },
            unit_amount: shippingCost * 100,
        },
        quantity: 1,
    });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${context.rawRequest.headers.origin}?payment_status=success`,
      cancel_url: `${context.rawRequest.headers.origin}?payment_status=cancel`,
      line_items: line_items,
      metadata: {
        firebaseUID: context.auth.uid,
      },
    });
    return {
      id: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("Error al crear la sesión de Stripe:", error);
    throw new functions.https.HttpsError(
        "internal",
        "No se pudo crear la sesión de pago.",
    );
  }
});

/**
 * ¡NUEVA FUNCIÓN!
 * Entrega de forma segura la clave de API de Google Maps al cliente.
 */
exports.getGoogleMapsApiKey = functions.https.onCall((data, context) => {
    // Verificamos que el usuario esté autenticado para mayor seguridad
    if (!context.auth) {
        throw new functions.https.HttpsError(
            "unauthenticated",
            "Debes estar autenticado para acceder a esta función.",
        );
    }

    // Leemos la clave desde la configuración segura y la devolvemos
    try {
        const apiKey = functions.config().maps.key;
        if (!apiKey) {
            throw new Error("La clave de API de Google Maps no está configurada.");
        }
        return { apiKey: apiKey };
    } catch (error) {
        console.error("Error al obtener la clave de Maps:", error);
        throw new functions.https.HttpsError(
            "internal",
            "No se pudo obtener la configuración del mapa.",
        );
    }
});
