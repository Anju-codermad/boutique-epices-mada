import { Button } from '@/components/ui/Button';

import { unsubscribeFromNewsletter } from './actions';

export default function NewsletterDesinscriptionPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  const email = searchParams.email ?? '';

  return (
    <main className="container flex min-h-[50vh] max-w-md flex-col justify-center py-16 text-center">
      <h1 className="font-serif text-3xl font-bold text-forest">Se désinscrire</h1>
      <p className="mt-4 text-muted-foreground">
        Confirmez la désinscription de la newsletter pour <strong>{email}</strong>.
      </p>
      <form action={unsubscribeFromNewsletter} className="mt-6">
        <input type="hidden" name="email" value={email} />
        <Button type="submit" variant="outline">
          Confirmer la désinscription
        </Button>
      </form>
    </main>
  );
}
