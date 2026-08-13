import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    // Permet de pointer vers un binaire Chromium déjà présent sur la machine
    // (image Docker/CI avec navigateur préinstallé) plutôt que d'en télécharger un.
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE }
      : {},
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // En CI : build de production + `next start`, pour éviter la compilation à la volée de
    // `next dev` (chaque route se compile au premier accès) qui a rendu les tests flaky une
    // fois le SDK Sentry ajouté (bundle client plus lourd → hydratation plus lente → clics/
    // soumissions de formulaire interceptés par le HTML natif avant que React n'attache ses
    // gestionnaires d'événements). En local, `next dev` reste plus rapide à itérer.
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
