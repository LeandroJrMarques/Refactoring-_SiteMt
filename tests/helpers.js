const { test: base, expect } = require('@playwright/test');

// 14 vídeos falsos no formato da API playlistItems do YouTube
const videos = Array.from({ length: 14 }, (_, i) => ({
    snippet: {
        title: i === 1 ? `MT | Realidaderealidadevirtual vídeo ${i}` : `MT | Vídeo de teste ${i + 1}`,
        description: i === 1 ? '#realidadevirtual' : '',
        publishedAt: '2025-01-01T00:00:00Z',
        resourceId: { videoId: `vid${String(i).padStart(8, '0')}` },
        thumbnails: { medium: { url: '/images/logo_favicon.png' } },
    },
}));

/** Intercepta a API do YouTube para os testes serem determinísticos e offline. */
async function mockYouTube(page) {
    await page.route('**/youtube/v3/channels**', route =>
        route.fulfill({
            json: { items: [{ contentDetails: { relatedPlaylists: { uploads: 'UPLOADS' } } }] },
        }));
    await page.route('**/youtube/v3/playlistItems**', route =>
        route.fulfill({ json: { items: videos } }));
    // bloqueia o embed real
    await page.route('**://www.youtube.com/embed/**', route =>
        route.fulfill({ contentType: 'text/html', body: '<html><body>mock</body></html>' }));
}

const test = base.extend({
    // página já carregada, com API mockada e coleta de erros de console
    site: async ({ page }, use) => {
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => {
            if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) errors.push(m.text());
        });
        await mockYouTube(page);
        await page.goto('/');
        await page.waitForSelector('.video-card');
        page.errors = errors;
        await use(page);
    },
});

module.exports = { test, expect, videos };
