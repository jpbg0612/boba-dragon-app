// functions/index.js

// Importamos las herramientas necesarias
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const stripe = require("stripe")(functions.config().stripe.secret);

// Inicializamos la conexión segura con tu proyecto de Firebase
admin.initializeApp();

/**
 * Esta es nuestra función en la nube. Se encarga de crear una sesión de pago
 * segura con Stripe sin exponer tus claves secretas.
 */
exports.createStripeCheckout = functions.https.onCall(async (data, context) => {
  // 1. Verificamos que el usuario que hace la petición esté autenticado
  if (!context.auth) {
    throw new functions.https.HttpsError(
        "unauthenticated",
        "Debes estar autenticado para realizar un pago.",
    );
  }

  // 2. Recibimos los productos del carrito que envió la app
  const cartItems = data.cart;
  const shippingCost = data.shippingCost || 0;

  // 3. Le damos el formato que Stripe necesita
  const line_items = cartItems.map((item) => {
    return {
      price_data: {
        currency: "mxn",
        product_data: {
          name: item.name,
          // Podríamos añadir más detalles aquí si quisiéramos
          // description: Object.values(item.customization).join(', '),
        },
        unit_amount: item.price * 100, // Stripe necesita el precio en centavos
      },
      quantity: item.quantity,
    };
  });

  // 4. Añadimos el costo de envío como un producto más
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

  // 5. Creamos la sesión de pago en Stripe
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${context.rawRequest.headers.origin}?payment_status=success`,
      cancel_url: `${context.rawRequest.headers.origin}?payment_status=cancel`,
      line_items: line_items,
      // Guardamos el ID del usuario de Firebase para futuras referencias
      metadata: {
        firebaseUID: context.auth.uid,
      },
    });

    // 6. Le devolvemos la URL de la sesión de pago a la app
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
