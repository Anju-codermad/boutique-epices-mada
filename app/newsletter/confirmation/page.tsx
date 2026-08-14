import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Confirmation newsletter',
  robots: NOINDEX_ROBOTS,
};

export default async function NewsletterConfirmationPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return <Message title="Lien invalide" text="Aucun jeton de confirmation fourni." />;
  }

  const subscriber = await prisma.newsletterSubscriber.findUnique({
    where: { confirmationToken: token },
  });

  if (!subscriber) {
    return (
      <Message
        title="Lien invalide ou déjà utilisé"
        text="Ce lien de confirmation n'est plus valide."
      />
    );
  }

  await prisma.newsletterSubscriber.update({
    where: { id: subscriber.id },
    data: { status: 'CONFIRMED', confirmationToken: null },
  });

  return (
    <Message
      title="Inscription confirmée"
      text="Merci ! Votre adresse email est confirmée, vous recevrez désormais nos actualités."
    />
  );
}

function Message({ title, text }: { title: string; text: string }) {
  return (
    <main className="container flex min-h-[50vh] max-w-md flex-col justify-center py-16 text-center">
      <h1 className="font-serif text-3xl font-bold text-forest">{title}</h1>
      <p className="mt-4 text-muted-foreground">{text}</p>
    </main>
  );
}
