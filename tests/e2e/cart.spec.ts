import { test, expect } from '@playwright/test';

test('ajouter un produit au panier depuis la fiche produit', async ({ page }) => {
  await page.goto('/produits/vanille-bourbon');

  await page.getByRole('button', { name: 'Ajouter au panier' }).click();
  await expect(page.getByText('Ajouté au panier.')).toBeVisible();

  // Le badge du panier dans le header reflète la quantité ajoutée.
  await expect(
    page.getByRole('button', { name: 'Panier', exact: true }).getByText('1')
  ).toBeVisible();

  await page.getByRole('button', { name: 'Panier', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'Panier' });
  await expect(drawer.getByText('Vanille Bourbon', { exact: true })).toBeVisible();
});

test('page panier : modifier la quantité et retirer un article', async ({ page }) => {
  await page.goto('/produits/vanille-bourbon');
  await page.getByRole('button', { name: 'Ajouter au panier' }).click();
  await expect(page.getByText('Ajouté au panier.')).toBeVisible();

  await page.goto('/panier');
  await expect(page.getByText('Vanille Bourbon')).toBeVisible();

  const quantityInput = page.locator('input[id^="panier-qty-"]');
  await quantityInput.fill('3');
  await quantityInput.blur();
  await expect(quantityInput).toHaveValue('3');

  await page.getByRole('button', { name: 'Retirer' }).click();
  await expect(page.getByRole('heading', { name: 'Votre panier est vide' })).toBeVisible();
});
