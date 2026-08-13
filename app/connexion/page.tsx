import { signIn } from '@/auth';
import { Button } from '@/components/ui/Button';

export default function ConnexionPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  async function signInWithEmail(formData: FormData) {
    'use server';
    const email = formData.get('email');
    if (typeof email !== 'string' || email.length === 0) {
      return;
    }
    await signIn('resend', { email, redirectTo: searchParams.callbackUrl ?? '/compte' });
  }

  return (
    <main className="container flex min-h-[60vh] max-w-md flex-col justify-center py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Connexion</h1>
      <p className="mt-2 text-muted-foreground">
        Recevez un lien de connexion par email, sans mot de passe.
      </p>
      <form action={signInWithEmail} className="mt-6 space-y-4">
        <input
          type="email"
          name="email"
          required
          placeholder="vous@exemple.com"
          className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button type="submit" className="w-full">
          Recevoir le lien de connexion
        </Button>
      </form>
    </main>
  );
}
