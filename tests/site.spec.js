const fs = require('fs');
const path = require('path');
const { test, expect } = require('./helpers');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

test.describe('Estrutura e conteúdo', () => {
    test('título, idioma e ausência de erros de JS', async ({ site: page }) => {
        await expect(page).toHaveTitle('Mediateam | Arte Interativa.');
        await expect(page.locator('html')).toHaveAttribute('lang', 'pt-br');
        expect(page.errors).toEqual([]);
    });

    test('fullbanner é a primeira coisa vista e as seções seguem a nova ordem', async ({ site: page }) => {
        const ids = await page.$$eval('main > section', s => s.map(x => x.id));
        expect(ids).toEqual(['home', 'empresa', 'clients-section', 'work', 'trabalhe-conosco']);
        const hero = await page.locator('#home').boundingBox();
        expect(hero.y).toBe(0);
        expect(hero.height).toBeGreaterThanOrEqual(560);
    });

    test('textos originais preservados', async ({ site: page }) => {
        const body = await page.locator('body').innerText();
        for (const t of [
            'Quem Somos', 'Trabalhos', 'Carreiras', 'Contatos', 'Inspire-nos!',
            'Há mais de 25 anos', 'Trabalhe Conosco', 'Enviar Currículo',
            'selecao@mediateam.com.br', 'Contato Comercial', '+55 (81) 99188-3751',
            'diegonani@mediateam.com.br', 'Todos os direitos reservados.',
        ]) {
            // o menu usa text-transform: uppercase, então compara sem diferenciar caixa
            expect(body.replace(/\s+/g, ' ').toLowerCase()).toContain(t.toLowerCase());
        }
        await expect(page.locator('#year')).toHaveText(String(new Date().getFullYear()));
    });

    test('links externos têm destino e redes sociais abrem em nova aba', async ({ site: page }) => {
        for (const sel of ['.header-social a', '.footer-social a']) {
            const links = page.locator(sel);
            await expect(links).toHaveCount(3);
            for (const l of await links.all()) {
                await expect(l).toHaveAttribute('target', '_blank');
                await expect(l).toHaveAttribute('href', /^https:\/\//);
            }
        }
        await expect(page.locator('.btn-recrutamento')).toHaveAttribute('href', 'mailto:selecao@mediateam.com.br');
        await expect(page.locator('.contact-item[href^="tel:"]')).toHaveCount(1);
    });

    test('âncoras do menu apontam para ids existentes', async ({ site: page }) => {
        const hrefs = await page.$$eval('#site-nav a, .links-list a', a => a.map(x => x.getAttribute('href')));
        expect(hrefs.length).toBe(8);
        for (const h of hrefs) await expect(page.locator(h)).toHaveCount(1);
    });

    test('todos os arquivos referenciados existem em disco', async () => {
        const refs = [...html.matchAll(/(?:src|href)="((?:images|musica|css|js)\/[^"]+)"/g)].map(m => m[1]);
        const bg = [...html.matchAll(/url\('((?:images)\/[^']+)'\)/g)].map(m => m[1]);
        const missing = [...refs, ...bg].filter(f => !fs.existsSync(path.join(root, f)));
        expect(missing).toEqual([]);
        expect(bg.length).toBe(19);
    });
});

test.describe('Fullbanner (carrossel)', () => {
    test('19 slides, só um ativo, contador total correto', async ({ site: page }) => {
        await expect(page.locator('.slide')).toHaveCount(19);
        await expect(page.locator('.slide.active')).toHaveCount(1);
        await expect(page.locator('#counter-total')).toHaveText('19');
        await expect(page.locator('#counter-current')).toHaveText('01');
        await expect(page.locator('.indicator')).toHaveCount(19);
    });

    test('próximo, anterior e indicador trocam o slide e o contador', async ({ site: page }) => {
        await page.click('#btn-next');
        await expect(page.locator('.slide').nth(1)).toHaveClass(/active/);
        await expect(page.locator('#counter-current')).toHaveText('02');
        await page.click('#btn-prev');
        await expect(page.locator('#counter-current')).toHaveText('01');
        await page.click('#btn-prev'); // volta ao último (loop)
        await expect(page.locator('#counter-current')).toHaveText('19');
        await page.locator('.indicator').nth(4).click();
        await expect(page.locator('#counter-current')).toHaveText('05');
        await expect(page.locator('.indicator').nth(4)).toHaveClass(/active/);
        await expect(page.locator('.slide.active')).toHaveCount(1);
    });

    test('teclado (setas) navega enquanto o banner está visível', async ({ site: page }) => {
        await page.keyboard.press('ArrowRight');
        await expect(page.locator('#counter-current')).toHaveText('02');
        await page.keyboard.press('ArrowLeft');
        await expect(page.locator('#counter-current')).toHaveText('01');
    });

    test('títulos são divididos em palavras e mantêm o texto original (aria-label)', async ({ site: page }) => {
        const first = page.locator('.slide').first().locator('.slide-title');
        await expect(first).toHaveAttribute('aria-label', 'Aliança Lab | Aliança Energia');
        expect(await first.locator('.w').count()).toBe(5);
    });

    test('avança sozinho (autoplay) depois de 8s', async ({ site: page }) => {
        await page.waitForTimeout(8600);
        await expect(page.locator('#counter-current')).not.toHaveText('01');
    });

    test('botões "Ver Projetos" têm destino; externos abrem com noopener', async ({ site: page }) => {
        const ctas = page.locator('.slide-cta');
        await expect(ctas).toHaveCount(19);
        for (const c of await ctas.all()) {
            const href = await c.getAttribute('href');
            expect(href).toBeTruthy();
            if (href.startsWith('http')) await expect(c).toHaveAttribute('rel', /noopener/);
        }
    });

    test('imagens dos banners HD carregam (HTTP 200)', async ({ site: page }) => {
        const urls = await page.$$eval('.slide-image', els =>
            els.map(e => getComputedStyle(e).backgroundImage.match(/url\("(.+)"\)/)[1]));
        expect(urls.length).toBe(19);
        for (const u of urls) {
            expect(u).toContain('/images/FullBanner/hd/');
            const r = await page.request.get(u);
            expect(r.status(), u).toBe(200);
        }
    });

    test('swipe no celular troca de slide', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });
        const page = await ctx.newPage();
        const { mockYouTube } = (() => ({ mockYouTube: null }))();
        await page.route('**/youtube/**', r => r.fulfill({ json: { items: [] } }));
        await page.goto('/');
        await page.evaluate(() => {
            const el = document.querySelector('.carousel-container');
            const mk = (type, x) => new TouchEvent(type, { bubbles: true, changedTouches: [new Touch({ identifier: 1, target: el, screenX: x, screenY: 0 })] });
            el.dispatchEvent(mk('touchstart', 300));
            el.dispatchEvent(mk('touchend', 100));
        });
        await expect(page.locator('#counter-current')).toHaveText('02');
        await ctx.close();
    });
});

test.describe('Header e navegação', () => {
    test('header encolhe ao rolar e barra de progresso/voltar ao topo reagem', async ({ site: page }) => {
        await expect(page.locator('#site-header')).not.toHaveClass(/smaller-header/);
        await expect(page.locator('#to-top')).not.toHaveClass(/show/);
        await page.evaluate(() => window.scrollTo({ top: 2500, behavior: 'instant' }));
        await expect(page.locator('#site-header')).toHaveClass(/smaller-header/);
        await expect(page.locator('#to-top')).toHaveClass(/show/);
        const sx = await page.$eval('#scroll-progress', e => getComputedStyle(e).transform);
        expect(sx).not.toBe('matrix(0, 0, 0, 1, 0, 0)');
        await page.click('#to-top');
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
    });

    test('clicar em "Trabalhos" rola até a seção', async ({ site: page }) => {
        await page.click('#site-nav a[href="#work"]');
        await expect.poll(async () => (await page.locator('#work').boundingBox()).y, { timeout: 5000 }).toBeLessThan(200);
    });

    test('menu hambúrguer no celular abre, fecha e navega', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
        const page = await ctx.newPage();
        await page.route('**/youtube/**', r => r.fulfill({ json: { items: [] } }));
        await page.goto('/');
        const nav = page.locator('#site-nav');
        await expect(nav).toBeHidden();
        await page.click('#mobile-menu-btn');
        await expect(nav).toBeVisible();
        await expect(page.locator('#mobile-menu-btn')).toHaveAttribute('aria-expanded', 'true');
        await nav.locator('a[href="#empresa"]').click();
        await expect(page.locator('#mobile-menu-btn')).toHaveAttribute('aria-expanded', 'false');
        await ctx.close();
    });
});

test.describe('Quem Somos e Clientes', () => {
    test('ao rolar, os blocos "reveal" ficam visíveis', async ({ site: page }) => {
        await page.locator('#empresa').scrollIntoViewIfNeeded();
        await page.evaluate(() => document.querySelector('#empresa').scrollIntoView({ behavior: 'instant' }));
        await expect(page.locator('#empresa .lead')).toHaveClass(/is-visible/);
    });

    test('Clientes: duas faixas, logos clicáveis e visíveis sem depender de rolagem', async ({ site: page }) => {
        await expect(page.locator('.marquee-row')).toHaveCount(2);
        const items = page.locator('.marquee-row:first-child .marquee-track:first-child .client-item');
        expect(await items.count()).toBeGreaterThan(15);
        const withLinks = await page.locator('.client-item a[href^="http"]').count();
        expect(withLinks).toBeGreaterThan(60);
        for (const a of (await page.locator('.client-item a[href]').all()).slice(0, 10)) {
            await expect(a).toHaveAttribute('target', '_blank');
            await expect(a).toHaveAttribute('rel', /noopener/);
        }
        // sem reveal: não pode começar invisível
        const op = await page.$eval('#clients-grid', e => getComputedStyle(e).opacity);
        expect(op).toBe('1');
    });

    test('Clientes: faixas animam e pausam no hover', async ({ site: page }) => {
        await page.evaluate(() => document.querySelector('#clients-grid').scrollIntoView({ behavior: 'instant', block: 'center' }));
        const state = () => page.$eval('.marquee-track', e => getComputedStyle(e).animationPlayState);
        expect(await state()).toBe('running');
        const bb = await page.locator('.marquee-row:first-child .client-item').nth(3).boundingBox();
        await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2);
        expect(await state()).toBe('paused');
    });

    test('Clientes: card em hover não é cortado pela faixa', async ({ site: page }) => {
        await page.evaluate(() => document.querySelector('#clients-grid').scrollIntoView({ behavior: 'instant', block: 'center' }));
        const item = page.locator('.marquee-row:first-child .client-item').nth(3);
        const hb = await item.boundingBox();
        await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
        await page.waitForTimeout(600);
        const a = await item.boundingBox();
        const row = await page.locator('.marquee-row').first().boundingBox();
        expect(a.y).toBeGreaterThanOrEqual(row.y);
        expect(a.y + a.height).toBeLessThanOrEqual(row.y + row.height);
    });

    test('logos de clientes que falham ao carregar são removidas', async ({ page }) => {
        await page.route('**/youtube/**', r => r.fulfill({ json: { items: [] } }));
        await page.route('**/images/clientes/sebrae.png', r => r.abort());
        await page.goto('/');
        await page.waitForTimeout(1200);
        expect(await page.locator('img.client-logo[src$="sebrae.png"]').count()).toBe(0);
    });
});

test.describe('Galeria de trabalhos (API mockada)', () => {
    test('carrega 6 cards, 15 filtros e "Carregar Mais" completa linhas de 3', async ({ site: page }) => {
        await expect(page.locator('.video-card')).toHaveCount(6);
        await expect(page.locator('.btn-filter')).toHaveCount(15);
        await expect(page.locator('.btn-filter.active')).toHaveText(/Todos/);
        await page.locator('#btnLoadMore').scrollIntoViewIfNeeded();
        await page.click('#btnLoadMore');
        await expect(page.locator('.video-card')).toHaveCount(12);
        const cols = await page.$eval('#gallery', g => getComputedStyle(g).gridTemplateColumns.split(' ').length);
        expect(cols).toBe(3);
        expect(12 % cols).toBe(0);
    });

    test('filtro por categoria mostra só os vídeos correspondentes', async ({ site: page }) => {
        await page.locator('.btn-filter', { hasText: 'Realidade Virtual' }).click();
        await expect(page.locator('.video-card')).toHaveCount(1);
        await expect(page.locator('.btn-filter.active')).toHaveText(/Realidade Virtual/);
        await page.locator('.btn-filter', { hasText: 'Todos' }).click();
        await expect(page.locator('.video-card')).toHaveCount(6);
    });

    test('filtro sem resultados mostra mensagem', async ({ site: page }) => {
        await page.locator('.btn-filter', { hasText: 'Robôs' }).click();
        await expect(page.locator('.info-msg')).toHaveText('Nenhum vídeo encontrado.');
    });

    test('abrir vídeo: modal com iframe correto, referrerpolicy; fecha pelo X e pelo fundo', async ({ site: page }) => {
        await page.locator('.video-card').first().click();
        const modal = page.locator('#video-modal');
        await expect(modal).toHaveClass(/active/);
        const iframe = page.locator('#modal-iframe');
        await expect(iframe).toHaveAttribute('src', /youtube\.com\/embed\/vid00000000\?autoplay=1/);
        await expect(iframe).toHaveAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
        await expect(iframe).toHaveAttribute('allow', /autoplay/);
        await page.click('.modal-close');
        await expect(modal).not.toHaveClass(/active/);
        await expect(iframe).toHaveAttribute('src', '');
        await page.locator('.video-card').nth(1).click();
        await expect(modal).toHaveClass(/active/);
        await page.mouse.click(5, 5); // fundo
        await expect(modal).not.toHaveClass(/active/);
    });

    test('card inclina em 3D e recebe brilho no hover', async ({ site: page }) => {
        const card = page.locator('.video-card').first();
        await card.scrollIntoViewIfNeeded();
        const b = await card.boundingBox();
        await page.mouse.move(b.x + b.width * 0.9, b.y + b.height * 0.2);
        await expect.poll(() => card.evaluate(e => e.style.getPropertyValue('--ry'))).not.toBe('');
        const ry = parseFloat(await card.evaluate(e => e.style.getPropertyValue('--ry')));
        expect(ry).toBeGreaterThan(3);
        await page.mouse.move(2, 2);
        await expect.poll(() => card.evaluate(e => e.style.getPropertyValue('--ry'))).toBe('0deg');
    });

    test('falha da API mostra mensagem de erro', async ({ page }) => {
        await page.route('**/youtube/v3/channels**', r => r.fulfill({ status: 403, json: {} }));
        await page.goto('/');
        await expect(page.locator('.error-msg')).toContainText('Não foi possível conectar ao YouTube.');
    });
});

test.describe('Trabalhe Conosco e Rodapé', () => {
    test('aviso de exclusividade e botão de currículo visíveis', async ({ site: page }) => {
        await page.evaluate(() => document.querySelector('#trabalhe-conosco').scrollIntoView({ behavior: 'instant' }));
        await expect(page.locator('.aviso-exclusivo')).toContainText('exclusivamente');
        await expect(page.locator('.btn-recrutamento')).toBeVisible();
    });

    test('rodapé é compacto (≤ 300px) e tem 4 colunas no desktop', async ({ site: page }) => {
        const h = await page.$eval('#footer', e => e.offsetHeight);
        expect(h).toBeLessThanOrEqual(300);
        const cols = await page.$eval('.footer-content', e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
        expect(cols).toBe(4);
    });

    test('animação de hover do rodapé roda até o fim mesmo após o mouse sair', async ({ site: page }) => {
        await page.locator('#footer').scrollIntoViewIfNeeded();
        const mark = page.locator('.brand-mark');
        await page.hover('.brand-logo');
        await expect(mark).toHaveClass(/play/);
        await page.mouse.move(700, 100); // sai da área imediatamente
        await page.waitForTimeout(250);
        await expect(mark).toHaveClass(/play/); // continua rodando
        await expect(mark).not.toHaveClass(/play/, { timeout: 3000 }); // termina sozinha
        // ícones sociais e contatos também
        await page.hover('.footer-social a >> nth=0');
        await expect(page.locator('.footer-social a').first()).toHaveClass(/play/);
        await page.hover('.contact-item >> nth=0');
        await expect(page.locator('.contact-item').first()).toHaveClass(/play/);
    });
});

test.describe('Cursor', () => {
    test('ponto neon segue o mouse e cresce em elementos clicáveis', async ({ site: page }) => {
        await page.mouse.move(300, 300);
        const dot = page.locator('#cursor-dot');
        await expect(page.locator('body')).toHaveClass(/cursor-on/);
        await expect.poll(() => dot.evaluate(e => e.style.transform)).toBe('translate(300px, 300px)');
        const shadow = await dot.evaluate(e => getComputedStyle(e).boxShadow);
        expect(shadow).toContain('255, 157, 31');
        const w0 = (await dot.boundingBox()).width;
        await page.hover('.slide-cta >> nth=0');
        await expect(dot).toHaveClass(/is-hover/);
        await page.waitForTimeout(400);
        expect((await dot.boundingBox()).width).toBeGreaterThan(w0);
    });

    test('com o modal aberto o ponteiro normal volta', async ({ site: page }) => {
        await page.locator('.video-card').first().click();
        const cur = await page.$eval('body', e => getComputedStyle(e).cursor);
        expect(cur).toBe('auto');
        const op = await page.$eval('#cursor-dot', e => getComputedStyle(e).opacity);
        expect(op).toBe('0');
    });
});

test.describe('Player de música (opcional)', () => {
    test('não toca sozinho; o botão flutuante revela o player e inicia a música', async ({ site: page }) => {
        await page.waitForTimeout(800);
        expect(await page.$eval('#mt-audio', a => a.paused)).toBe(true);
        await expect(page.locator('#mt-player')).not.toHaveClass(/mt-visivel/);
        await expect(page.locator('#mt-launcher')).toBeVisible();
        await page.click('#mt-launcher');
        await expect(page.locator('#mt-player')).toHaveClass(/mt-visivel/);
        await expect(page.locator('#mt-launcher')).toHaveClass(/mt-oculto/);
        await expect.poll(() => page.$eval('#mt-audio', a => a.paused)).toBe(false);
    });

    test('parar fecha o player e devolve o botão flutuante', async ({ site: page }) => {
        await page.click('#mt-launcher');
        await expect.poll(() => page.$eval('#mt-audio', a => a.paused)).toBe(false);
        await page.click('#mt-btn-play');
        await expect(page.locator('#mt-player')).not.toHaveClass(/mt-visivel/);
        await expect(page.locator('#mt-launcher')).not.toHaveClass(/mt-oculto/);
        expect(await page.$eval('#mt-audio', a => a.paused)).toBe(true);
    });

    test('modal da letra abre e fecha (botão, fundo e Esc)', async ({ site: page }) => {
        await page.click('#mt-launcher');
        await page.click('#mt-btn-letra');
        const m = page.locator('#mt-modal-letra');
        await expect(m).toHaveClass(/mt-aberto/);
        await expect(m).toContainText('Lado a lado');
        await page.click('#mt-fechar-letra');
        await expect(m).not.toHaveClass(/mt-aberto/);
        await page.click('#mt-btn-letra');
        await page.keyboard.press('Escape');
        await expect(m).not.toHaveClass(/mt-aberto/);
    });

    test('arquivos de áudio e capa são servidos', async ({ site: page }) => {
        for (const f of ['musica/mt_lado_a_lado.mp3', 'musica/mt_lado_a_lado.jpg']) {
            expect((await page.request.get('/' + f)).status()).toBe(200);
        }
    });
});

test.describe('Responsivo e acessibilidade', () => {
    for (const [name, w, h] of [['celular', 375, 812], ['tablet', 800, 1024], ['desktop', 1440, 900], ['wide', 1920, 1080]]) {
        test(`sem rolagem horizontal em ${name} (${w}px)`, async ({ browser }) => {
            const ctx = await browser.newContext({ viewport: { width: w, height: h } });
            const page = await ctx.newPage();
            await page.route('**/youtube/**', r => r.fulfill({ json: { items: [] } }));
            await page.goto('/');
            await page.waitForTimeout(500);
            const { sw, iw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, iw: innerWidth }));
            expect(sw).toBeLessThanOrEqual(iw);
            await ctx.close();
        });
    }

    test('no celular a galeria tem 1 coluna e o rodapé empilha', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
        const page = await ctx.newPage();
        await page.route('**/youtube/**', r => r.fulfill({ json: { items: [] } }));
        await page.goto('/');
        const g = await page.$eval('#gallery', e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
        const f = await page.$eval('.footer-content', e => getComputedStyle(e).gridTemplateColumns.split(' ').length);
        expect(g).toBe(1);
        expect(f).toBe(1);
        await ctx.close();
    });

    test('prefers-reduced-motion: sem grão e sem cursor customizado', async ({ browser }) => {
        const ctx = await browser.newContext({ reducedMotion: 'reduce' });
        const page = await ctx.newPage();
        await page.route('**/youtube/**', r => r.fulfill({ json: { items: [] } }));
        await page.goto('/');
        await page.mouse.move(300, 300);
        await expect(page.locator('body')).not.toHaveClass(/cursor-on/);
        expect(await page.$eval('body', e => getComputedStyle(e, '::after').display)).toBe('none');
        await ctx.close();
    });

    test('imagens têm alt e botões de ícone têm aria-label', async ({ site: page }) => {
        const noAlt = await page.$$eval('img', i => i.filter(x => !x.hasAttribute('alt')).map(x => x.src));
        expect(noAlt).toEqual([]);
        const unlabeled = await page.$$eval('button', b =>
            b.filter(x => !x.textContent.trim() && !x.getAttribute('aria-label') && !x.title).map(x => x.id || x.className));
        expect(unlabeled).toEqual([]);
    });

    test('maroon só aparece como acento (nenhum fundo de seção usa #7A0000)', async ({ site: page }) => {
        const bad = await page.$$eval('section, footer, header', els =>
            els.filter(e => getComputedStyle(e).backgroundColor === 'rgb(122, 0, 0)').map(e => e.id || e.tagName));
        expect(bad).toEqual([]);
    });
});
