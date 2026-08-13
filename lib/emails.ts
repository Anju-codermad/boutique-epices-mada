import { resend, EMAIL_FROM } from '@/lib/resend';
import { getAppUrl } from '@/lib/url';
import OrderConfirmationEmail, {
  type OrderConfirmationEmailProps,
} from '@/emails/OrderConfirmationEmail';
import ShippingNotificationEmail, {
  type ShippingNotificationEmailProps,
} from '@/emails/ShippingNotificationEmail';
import RefundConfirmationEmail, {
  type RefundConfirmationEmailProps,
} from '@/emails/RefundConfirmationEmail';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendNewsletterConfirmationEmail(email: string, confirmationToken: string) {
  const confirmUrl = `${getAppUrl()}/newsletter/confirmation?token=${confirmationToken}`;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: email,
    subject: 'Confirmez votre inscription à la newsletter',
    html: `
      <p>Merci de votre inscription à la newsletter de la Boutique d'épices de Madagascar.</p>
      <p><a href="${confirmUrl}">Confirmez votre adresse email</a> pour recevoir nos actualités.</p>
      <p>Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.</p>
    `,
  });
}

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const contactEmail = process.env.CONTACT_EMAIL ?? EMAIL_FROM;

  await resend.emails.send({
    from: EMAIL_FROM,
    to: contactEmail,
    replyTo: email,
    subject: `[Contact] ${escapeHtml(subject)}`,
    html: `
      <p><strong>De :</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
      <p><strong>Sujet :</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message :</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>
    `,
  });
}

export async function sendOrderConfirmationEmail(to: string, props: OrderConfirmationEmailProps) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Confirmation de votre commande #${props.orderId.slice(-8)}`,
    react: OrderConfirmationEmail(props),
  });
}

export async function sendShippingNotificationEmail(
  to: string,
  props: ShippingNotificationEmailProps
) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Votre commande #${props.orderId.slice(-8)} a été expédiée`,
    react: ShippingNotificationEmail(props),
  });
}

export async function sendRefundConfirmationEmail(to: string, props: RefundConfirmationEmailProps) {
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject: `Remboursement de votre commande #${props.orderId.slice(-8)}`,
    react: RefundConfirmationEmail(props),
  });
}
