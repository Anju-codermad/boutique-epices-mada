import { Resend } from 'resend';

// Le SDK Resend lève une erreur dès l'instanciation si la clé est absente,
// ce qui casserait le build tant que RESEND_API_KEY n'est pas configuré.
// La valeur de repli ne permet aucun envoi réel ; seul un vrai
// RESEND_API_KEY en production permet d'envoyer des emails.
export const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder_build_only');

export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'no-reply@example.com';
