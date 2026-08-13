import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';

import { createAddress, deleteAddress } from './actions';

export default async function AdressesPage() {
  const session = await auth();
  if (!session?.user) {
    return null;
  }

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-8">
      <ul className="space-y-4">
        {addresses.map((address) => (
          <li
            key={address.id}
            className="flex items-start justify-between rounded-lg border border-border p-4"
          >
            <div className="text-sm">
              <p className="font-medium">{address.fullName}</p>
              <p>{address.line1}</p>
              {address.line2 ? <p>{address.line2}</p> : null}
              <p>
                {address.postalCode} {address.city}, {address.country}
              </p>
              {address.phone ? <p>{address.phone}</p> : null}
            </div>
            <form action={deleteAddress.bind(null, address.id)}>
              <Button variant="ghost" size="sm" type="submit">
                Supprimer
              </Button>
            </form>
          </li>
        ))}
        {addresses.length === 0 ? (
          <p className="text-muted-foreground">Aucune adresse enregistrée.</p>
        ) : null}
      </ul>

      <form
        action={createAddress}
        className="max-w-md space-y-3 rounded-lg border border-border p-4"
      >
        <h2 className="font-serif text-xl font-semibold">Ajouter une adresse</h2>
        <input
          name="fullName"
          required
          placeholder="Nom complet"
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          name="line1"
          required
          placeholder="Adresse"
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          name="line2"
          placeholder="Complément d'adresse (optionnel)"
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        />
        <div className="flex gap-3">
          <input
            name="postalCode"
            required
            placeholder="Code postal"
            className="w-1/2 rounded-md border border-border px-3 py-2 text-sm"
          />
          <input
            name="city"
            required
            placeholder="Ville"
            className="w-1/2 rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <input
          name="country"
          defaultValue="FR"
          placeholder="Pays (code ISO, ex. FR)"
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        />
        <input
          name="phone"
          placeholder="Téléphone (optionnel)"
          className="w-full rounded-md border border-border px-3 py-2 text-sm"
        />
        <Button type="submit">Ajouter l&apos;adresse</Button>
      </form>
    </div>
  );
}
