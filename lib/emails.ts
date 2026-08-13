import { resend, EMAIL_FROM } from '@/lib/resend';
import { getAppUrl } from '@/lib/url';

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
