import Stripe from 'stripe';

// Valeur de repli pour ne pas casser le build/import quand STRIPE_SECRET_KEY
// n'est pas configuré ; seule une vraie clé permet d'appeler l'API Stripe.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_build_only');

export const SHIPPING_COST_CENTS = 590;
export const FREE_SHIPPING_THRESHOLD_CENTS = 4900;

// Droit de rétractation de 14 jours (vente à distance UE), décompté à partir de la
// réception du colis.
export const RETURN_WINDOW_DAYS = 14;
export const ALLOWED_SHIPPING_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection['allowed_countries'] =
  ['FR', 'BE', 'DE', 'ES', 'IT', 'LU', 'NL', 'PT', 'AT', 'IE'];
