import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/Button';
import { formatPriceTtc } from '@/lib/format';
import { couponStatus, couponStatusLabels } from '@/lib/pricing';

import { createCoupon, updateCoupon, deactivateCoupon, deleteCoupon } from './actions';

function formatValue(coupon: { type: string; value: number }) {
  return coupon.type === 'PERCENTAGE' ? `${coupon.value} %` : formatPriceTtc(coupon.value);
}

function toDateInputValue(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : '';
}

export default async function AdminCouponsPage() {
  const session = await auth();
  if (session?.user?.role !== 'ADMIN') {
    return null;
  }

  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="container max-w-3xl py-16">
      <h1 className="font-serif text-3xl font-bold text-forest">Coupons de réduction</h1>

      {coupons.length === 0 ? (
        <p className="mt-6 text-muted-foreground">Aucun coupon pour le moment.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {coupons.map((coupon) => {
            const status = couponStatus(coupon);
            return (
              <li key={coupon.id} className="rounded-lg border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-medium">{coupon.code}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {formatValue(coupon)}
                    </span>
                  </div>
                  <span
                    className={
                      status === 'ACTIVE'
                        ? 'text-sm font-medium text-forest'
                        : 'text-sm text-muted-foreground'
                    }
                  >
                    {couponStatusLabels[status]}
                  </span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  Utilisé {coupon.usedCount} fois
                  {coupon.maxUses !== null ? ` sur ${coupon.maxUses} autorisée(s)` : ''}
                </p>

                <form
                  action={updateCoupon.bind(null, coupon.id)}
                  className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3"
                >
                  <div>
                    <label className="text-xs font-medium" htmlFor={`validUntil-${coupon.id}`}>
                      Valide jusqu&apos;au
                    </label>
                    <input
                      id={`validUntil-${coupon.id}`}
                      name="validUntil"
                      type="date"
                      defaultValue={toDateInputValue(coupon.validUntil)}
                      className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium" htmlFor={`maxUses-${coupon.id}`}>
                      Utilisations max.
                    </label>
                    <input
                      id={`maxUses-${coupon.id}`}
                      name="maxUses"
                      type="number"
                      min={1}
                      defaultValue={coupon.maxUses ?? ''}
                      placeholder="Illimité"
                      className="mt-1 w-full rounded-md border border-border px-2 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2 flex items-end gap-2 sm:col-span-1">
                    <Button type="submit" size="sm">
                      Enregistrer
                    </Button>
                  </div>
                </form>

                <div className="mt-2 flex gap-2">
                  {status !== 'EXPIRED' ? (
                    <form action={deactivateCoupon.bind(null, coupon.id)}>
                      <Button type="submit" variant="ghost" size="sm">
                        Désactiver
                      </Button>
                    </form>
                  ) : null}
                  <form action={deleteCoupon.bind(null, coupon.id)}>
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      Supprimer
                    </Button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-10 rounded-lg border border-dashed border-border p-4">
        <h2 className="font-serif text-lg font-semibold text-forest">Nouveau coupon</h2>
        <form action={createCoupon} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="code" className="text-sm font-medium">
                Code
              </label>
              <input
                id="code"
                name="code"
                required
                minLength={3}
                placeholder="BIENVENUE10"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm uppercase"
              />
            </div>
            <div>
              <label htmlFor="type" className="text-sm font-medium">
                Type
              </label>
              <select
                id="type"
                name="type"
                required
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              >
                <option value="PERCENTAGE">Pourcentage</option>
                <option value="FIXED_AMOUNT">Montant fixe</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="percentValue" className="text-sm font-medium">
                Valeur si pourcentage (%)
              </label>
              <input
                id="percentValue"
                name="percentValue"
                type="number"
                min={1}
                max={100}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="fixedValueEuros" className="text-sm font-medium">
                Valeur si montant fixe (€)
              </label>
              <input
                id="fixedValueEuros"
                name="fixedValueEuros"
                type="number"
                min={0.01}
                step={0.01}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="validFrom" className="text-sm font-medium">
                Valide à partir du
              </label>
              <input
                id="validFrom"
                name="validFrom"
                type="date"
                required
                defaultValue={toDateInputValue(new Date())}
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="validUntil" className="text-sm font-medium">
                Valide jusqu&apos;au (facultatif)
              </label>
              <input
                id="validUntil"
                name="validUntil"
                type="date"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="maxUses" className="text-sm font-medium">
                Utilisations max. (facultatif)
              </label>
              <input
                id="maxUses"
                name="maxUses"
                type="number"
                min={1}
                placeholder="Illimité"
                className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm"
              />
            </div>
          </div>

          <Button type="submit" variant="primary">
            Créer le coupon
          </Button>
        </form>
      </section>
    </main>
  );
}
