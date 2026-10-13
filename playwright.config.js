const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests',
    timeout: 30000,
    retries: 0,
    reporter: [['list']],
    use: {
        baseURL: 'http://localhost:4173',
        // Usa o Edge instalado no sistema (evita baixar navegadores).
        // Em CI/Linux, troque por 'chrome' ou remova para usar o Chromium do Playwright.
        channel: process.env.PW_CHANNEL || 'msedge',
        viewport: { width: 1440, height: 900 },
    },
    webServer: {
        command: 'npx http-server -p 4173 -c-1 -s .',
        url: 'http://localhost:4173',
        reuseExistingServer: true,
        timeout: 60000,
    },
});
