import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';

import { updatePersonalInfo } from './actions';

export default async function InformationsPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true },
  });

  return (
    <form action={updatePersonalInfo} className="max-w-md space-y-3">
      <div>
        <label className="text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          value={user?.email ?? ''}
          disabled
          className="mt-1 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
        />
      </div>
      <div>
        <label className="text-sm font-medium" htmlFor="name">
          Nom complet
        </label>
        <input
          id="name"
          name="name"
          defaultValue={user?.name ?? ''}
          required
          className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
