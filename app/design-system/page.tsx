import type { Metadata } from 'next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { NOINDEX_ROBOTS } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Design system',
  robots: NOINDEX_ROBOTS,
};

export default function DesignSystemPage() {
  return (
    <main className="container space-y-16 py-16">
      <header>
        <h1 className="font-serif text-4xl font-bold text-forest">Design system</h1>
        <p className="mt-2 text-muted-foreground">
          Page de validation visuelle des composants UI et de la charte graphique — palette
          terracotta / vert forêt / or, typographies Playfair Display / Inter.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">Palette</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {[
            { name: 'Terracotta', className: 'bg-terracotta' },
            { name: 'Terracotta clair', className: 'bg-terracotta-light' },
            { name: 'Terracotta foncé', className: 'bg-terracotta-dark' },
            { name: 'Vert forêt', className: 'bg-forest' },
            { name: 'Vert forêt clair', className: 'bg-forest-light' },
            { name: 'Vert forêt foncé', className: 'bg-forest-dark' },
            { name: 'Or', className: 'bg-gold' },
            { name: 'Or clair', className: 'bg-gold-light' },
            { name: 'Or foncé', className: 'bg-gold-dark' },
          ].map((color) => (
            <div key={color.name} className="space-y-2">
              <div className={`h-16 rounded-md border border-border ${color.className}`} />
              <p className="text-sm">{color.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">Typographie</h2>
        <div className="space-y-2">
          <p className="font-serif text-4xl">Playfair Display — Titre H1</p>
          <p className="font-serif text-2xl">Playfair Display — Titre H2</p>
          <p className="font-sans text-base">
            Inter — texte courant. La vanille de Madagascar, cultivée dans le respect du commerce
            équitable, est récoltée et préparée artisanalement.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="bio" />
          <Badge variant="equitable" />
          <Badge variant="nouveau" />
          <Badge variant="epuise" />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">Boutons</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primaire</Button>
          <Button variant="secondary">Secondaire</Button>
          <Button variant="outline">Contour</Button>
          <Button variant="ghost">Discret</Button>
          <Button variant="primary" disabled>
            Désactivé
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button size="sm">Petit</Button>
          <Button size="md">Moyen</Button>
          <Button size="lg">Grand</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold">Carte produit (exemple)</h2>
        <div className="max-w-sm">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Vanille Bourbon</CardTitle>
                <Badge variant="bio" />
              </div>
              <CardDescription>Gousses de vanille premium, récolte 2025.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-serif text-2xl text-terracotta">24,90 € TTC</p>
            </CardContent>
            <CardFooter className="gap-2">
              <Badge variant="equitable" />
              <Badge variant="nouveau" />
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  );
}
