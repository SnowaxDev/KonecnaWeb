const { defineConfig, devices } = require('@playwright/test');

/**
 * E2E testy běží proti produkčnímu buildu (build/) servírovanému staticky.
 * Proti dev serveru schválně netestujeme – chceme ověřit to, co se nasazuje.
 *
 * Backend se v testech NIKDY nevolá: každý test si endpoint /api/bookings
 * mockuje přes page.route(), ať z testů nechodí reálné poptávky.
 */
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'off',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    },
  },
  projects: [
    { name: 'mobile-se', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 667 }, isMobile: false } },
    { name: 'mobile-390', use: { ...devices['Desktop Chrome'], viewport: { width: 390, height: 844 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: {
    // SPA fallback na index.html, ať fungují i přímé vstupy na /rezervace
    command: 'node e2e/static-server.js',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
