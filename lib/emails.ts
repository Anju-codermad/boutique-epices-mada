import { resend, EMAIL_FROM } from '@/lib/resend';

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
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
