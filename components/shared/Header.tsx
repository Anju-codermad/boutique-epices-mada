'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, ShoppingBag, User, X } from 'lucide-react';

import { useCartItemCount } from '@/hooks/useCart';
import { signOutAction } from '@/app/actions/auth-actions';

import { CartDrawer } from './CartDrawer';
import { SearchBar } from './SearchBar';

interface HeaderCategory {
  name: string;
  slug: string;
}

interface HeaderSession {
  name: string | null;
  email: string | null;
}

interface HeaderProps {
  categories: HeaderCategory[];
  session: HeaderSession | null;
}

export function Header({ categories, session }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const itemCount = useCartItemCount();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="font-serif text-xl font-bold text-forest transition-colors hover:text-terracotta"
          >
            Épices de Madagascar
          </Link>

          <nav
            aria-label="Navigation principale"
            className="hidden items-center gap-6 text-sm md:flex"
          >
            <div
              className="relative"
              onMouseEnter={() => setCategoriesOpen(true)}
              onMouseLeave={() => setCategoriesOpen(false)}
            >
              <button
                type="button"
                className="link-underline hover:text-terracotta"
                aria-expanded={categoriesOpen}
              >
                Catégories
              </button>
              {categoriesOpen ? (
                <ul className="absolute left-0 top-full w-56 origin-top-left rounded-md border border-border bg-background py-2 shadow-lg duration-200 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
                  {categories.map((category) => (
                    <li key={category.slug}>
                      <Link
                        href={`/boutique?category=${category.slug}`}
                        className="block px-4 py-2 transition-all duration-200 hover:bg-muted hover:pl-6 hover:text-terracotta"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <Link href="/boutique" className="link-underline hover:text-terracotta">
              Boutique
            </Link>
            <Link href="/contact" className="link-underline hover:text-terracotta">
              Contact
            </Link>
          </nav>

          <div className="hidden flex-1 md:flex md:max-w-xs">
            <SearchBar />
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <div className="hidden items-center gap-2 text-sm md:flex">
                <Link href="/compte" className="flex items-center gap-1 hover:text-terracotta">
                  <User className="h-4 w-4" />
                  {session.name ?? session.email}
                </Link>
                <form action={signOutAction}>
                  <button type="submit" className="text-muted-foreground hover:text-terracotta">
                    Déconnexion
                  </button>
                </form>
              </div>
            ) : (
              <Link href="/connexion" className="hidden text-sm hover:text-terracotta md:block">
                Connexion
              </Link>
            )}

            <button
              ref={cartButtonRef}
              type="button"
              className="relative transition-transform duration-200 hover:scale-110 active:scale-95"
              aria-label="Panier"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag className="h-6 w-6 text-forest" />
              {itemCount > 0 ? (
                <span
                  key={itemCount}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-xs font-semibold text-white duration-300 animate-in zoom-in-50"
                >
                  {itemCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              className="transition-transform duration-200 active:scale-90 md:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <X className="h-6 w-6 duration-200 animate-in spin-in-90" />
              ) : (
                <Menu className="h-6 w-6 duration-200 animate-in fade-in-0" />
              )}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <div className="border-t border-border px-4 py-4 duration-200 animate-in fade-in-0 slide-in-from-top-2 md:hidden">
            <div className="mb-4">
              <SearchBar />
            </div>
            <nav aria-label="Navigation mobile" className="flex flex-col gap-3 text-sm">
              <Link href="/boutique" onClick={() => setMenuOpen(false)}>
                Boutique
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/boutique?category=${category.slug}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {category.name}
                </Link>
              ))}
              <Link href="/contact" onClick={() => setMenuOpen(false)}>
                Contact
              </Link>
              {session ? (
                <>
                  <Link href="/compte" onClick={() => setMenuOpen(false)}>
                    Mon compte
                  </Link>
                  <form action={signOutAction}>
                    <button type="submit" className="text-left text-muted-foreground">
                      Déconnexion
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/connexion" onClick={() => setMenuOpen(false)}>
                  Connexion
                </Link>
              )}
            </nav>
          </div>
        ) : null}
      </header>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} triggerRef={cartButtonRef} />
    </>
  );
}
