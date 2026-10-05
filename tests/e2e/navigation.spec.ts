import { test, expect } from '@playwright/test';

test('accueil : héro et familles d’épices', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('épices de Madagascar');
  await expect(page.getByRole('heading', { name: "Nos familles d'épices" })).toBeVisible();
});

test('boutique : liste des produits et filtre par catégorie', async ({ page }) => {
  await page.goto('/boutique');
  await expect(page.getByRole('heading', { name: 'Boutique', level: 1 })).toBeVisible();

  const cardsBefore = page.locator('a[href^="/produits/"]');
  await expect(cardsBefore.first()).toBeVisible();

  await page.selectOption('#category', 'vanille');
  await page.getByRole('button', { name: 'Appliquer' }).click();

  await expect(page).toHaveURL(/category=vanille/);
  await expect(page.locator('a[href^="/produits/"]').first()).toBeVisible();
});

test('boutique : recherche texte', async ({ page }) => {
  await page.goto('/boutique');
  await page.getByPlaceholder('Rechercher une épice...').fill('vanille');
  await page.getByPlaceholder('Rechercher une épice...').press('Enter');

  await expect(page).toHaveURL(/q=vanille/);
});

test('fiche produit : affichage et 404 sur un slug inconnu', async ({ page }) => {
  await page.goto('/boutique');
  await page.locator('a[href^="/produits/"]').first().click();

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ajouter au panier' })).toBeVisible();

  const response = await page.goto('/produits/ce-produit-n-existe-pas');
  expect(response?.status()).toBe(404);
});
