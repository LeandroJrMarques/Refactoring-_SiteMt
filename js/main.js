document.addEventListener('DOMContentLoaded', () => {

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // === 1. Lógica do Banner ===
    const slides = document.querySelectorAll('.slide');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const progressBar = document.getElementById('progress-fill');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    const hero = document.querySelector('.hero-carousel');
    const carousel = document.querySelector('.carousel-container');

    let currentSlide = 0;
    let autoPlayTimer = null;
    const duration = 8000;

    // Quebra cada título em palavras mascaradas (efeito de subida)
    document.querySelectorAll('.slide-title').forEach(title => {
        const words = title.textContent.trim().split(/\s+/);
        title.setAttribute('aria-label', title.textContent.trim());
        title.innerHTML = words
            .map((w, i) => `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`)
            .join(' ');
    });

    function updateSlide(newIndex) {
        if (newIndex === currentSlide) return;
        slides[currentSlide].classList.remove('active');
        slides[currentSlide].classList.add('prev');

        slides[newIndex].classList.add('active');
        slides[newIndex].classList.remove('prev');

        setTimeout(() => {
            slides.forEach((s, i) => { if (i !== newIndex) s.classList.remove('prev'); });
        }, 1000);

        document.querySelectorAll('.indicator')
            .forEach((dot, i) => dot.classList.toggle('active', i === newIndex));

        const counter = document.getElementById('counter-current');
        if (counter) counter.textContent = String(newIndex + 1).padStart(2, '0');

        currentSlide = newIndex;
        startAutoPlay();
    }

    function resetProgressBar() {
        if (!progressBar) return;
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        void progressBar.offsetHeight;
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '100%';
    }

    function startAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
        resetProgressBar();
        autoPlayTimer = setInterval(() => {
            updateSlide((currentSlide + 1) % slides.length);
        }, duration);
    }

    if (slides.length > 0) {
        const next = () => updateSlide((currentSlide + 1) % slides.length);
        const prev = () => updateSlide((currentSlide - 1 + slides.length) % slides.length);

        btnNext?.addEventListener('click', next);
        btnPrev?.addEventListener('click', prev);

        if (indicatorsContainer && indicatorsContainer.innerHTML === '') {
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.classList.add('indicator');
                dot.setAttribute('aria-label', `Slide ${i + 1}`);
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => updateSlide(i));
                indicatorsContainer.appendChild(dot);
            });
        }

        // Toque (swipe) e teclado
        let touchStartX = 0;
        carousel?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        carousel?.addEventListener('touchend', e => {
            const dx = e.changedTouches[0].screenX - touchStartX;
            if (dx < -50) next();
            else if (dx > 50) prev();
        }, { passive: true });

        document.addEventListener('keydown', e => {
            if (window.scrollY > window.innerHeight * 0.6) return;
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        });

        // Parallax do banner acompanhando o mouse
        if (hero && finePointer && !reduceMotion) {
            hero.addEventListener('mousemove', e => {
                const r = hero.getBoundingClientRect();
                hero.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
                hero.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
            });
            hero.addEventListener('mouseleave', () => {
                hero.style.setProperty('--mx', 0);
                hero.style.setProperty('--my', 0);
            });
        }

        slides.forEach(s => s.classList.remove('active', 'prev'));
        slides[0].classList.add('active');
        startAutoPlay();
    }

    // === 2. Lógica de Clientes com Links ===
    const clientData = [
        { file: "grupojcpm-logo.png", url: "http://www.jcpm.com.br/" },
        { file: "shoppingriomarrecife-logo.png", url: "http://riomarrecife.com.br/" },
        { file: "salvadornorteshopping-logo.png", url: "http://salvadornorteshopping.com.br/" },
        { file: "stgobain.png", url: "http://www.sgpam.com.br/" },
        { file: "compesa.png", url: "http://www.compesa.com.br/" },
        { file: "Neoenergia_Logo.png", url: "http://www.neoenergia.com/" },
        { file: "Cagepa_Logo.png", url: "https://www.cagepa.pb.gov.br/" },
        { file: "Rio_Ave_Logo.png", url: "https://rioave.com.br/" },
        { file: "energisa-logo.png", url: "http://grupoenergisa.com.br" },
        { file: "claro-logo.png", url: "https://claro.com.br/" },
        { file: "tim-logo.png", url: "http://www.tim.com.br/" },
        { file: "iquine-logo.png", url: "http://iquine.com.br/" },
        { file: "jucepe.png", url: "http://www.jucepe.pe.gov.br/" },
        { file: "assolan-logo.png", url: "http://www.assolan.com.br/" },
        { file: "mmsagencia-logo.png", url: "https://www.mms.com.br/" },
        { file: "infinito-logo.png" },
        { file: "sebrae.png", url: "http://www.sebrae.com.br/" },
        { file: "imip-logo.png", url: "http://www.imip.org.br/" },
        { file: "peconstrutora.png", url: "http://www.pernambucoconstrutora.com.br/" },
        { file: "cdlrecife.png", url: "http://www.cdlrecife.com.br/" },
        { file: "fcdlpe.png", url: "https://fcdlpe.org/" },
        { file: "sindilojas.png", url: "http://www.sindilojasrecife.com.br/" },
        { file: "cattan.png", url: "http://www.cattan.com.br/" },
        { file: "o-i.png", url: "http://www.o-i.com/" },
        { file: "prefeitura_recife.png", url: "http://www2.recife.pe.gov.br/" },
        { file: "prefeiturapaulista-logo.png", url: "https://www.paulista.pe.gov.br/site/" },
        { file: "abreu.png", url: "http://www.abreuelima.pe.gov.br/" },
        { file: "auxiliadora.png", url: "http://www.colegioauxiliadora.com.br/" },
        { file: "mazzarello.png", url: "https://mazzarellorecife.com.br/" },
        { file: "rocha.png", url: "http://www.portalrocha.com.br/" },
        { file: "amway.png", url: "http://www.amway.com.br/" },
        { file: "habitat.png", url: "http://www.habitatbrasil.org.br/" },
        { file: "EquatorialEnergia.png", url: "http://www.equatorialenergia.com.br/" },
        { file: "Heineken.png", url: "http://www.heinekenbrasil.com.br/" },
        { file: "LorealParis.png", url: "http://www.loreal-paris.com.br/" },
        { file: "Embasa.png", url: "http://www.embasa.ba.com.br/" },
        { file: "RoraimaEnergia.png", url: "http://www.roraimaenergia.com.br/" },
        { file: "EDP.png", url: "http://www.edp.com.br/" },
        { file: "Moura.png", url: "http://www.moura.com.br/" }
    ];

    const buildClient = client => {
        const clientName = client.file.split('.')[0].replace(/_|-/g, ' ');
        const div = document.createElement('div');
        div.className = 'client-item';
        div.title = clientName;
        const img = `<img src="images/clientes/${client.file}" alt="${clientName}" class="client-logo">`;
        div.innerHTML = client.url
            ? `<a href="${client.url}" target="_blank" rel="noopener noreferrer">${img}</a>`
            : `<a>${img}</a>`;
        div.querySelector('img').addEventListener('error', () => div.remove());
        return div;
    };

    // Duas faixas infinitas, em sentidos opostos
    const buildRow = (items, reverse) => {
        const row = document.createElement('div');
        row.className = 'marquee-row' + (reverse ? ' reverse' : '');
        // o conjunto é repetido para o loop não ter emenda
        const tracks = [0, 1].map(() => {
            const track = document.createElement('div');
            track.className = 'marquee-track';
            if (!row.firstChild) { /* primeira cópia é lida por leitores de tela */ }
            else track.setAttribute('aria-hidden', 'true');
            items.forEach(c => track.appendChild(buildClient(c)));
            return track;
        });
        tracks.forEach(t => row.appendChild(t));
        return row;
    };

    const clientsGrid = document.getElementById('clients-grid');
    if (clientsGrid) {
        clientsGrid.innerHTML = '';
        const half = Math.ceil(clientData.length / 2);
        clientsGrid.appendChild(buildRow(clientData.slice(0, half), false));
        clientsGrid.appendChild(buildRow(clientData.slice(half), true));
    }

    // === 3. Header, progresso de rolagem e botão de topo ===
    const header = document.querySelector('#site-header');
    const progress = document.getElementById('scroll-progress');
    const toTop = document.getElementById('to-top');

    const onScroll = () => {
        const y = window.scrollY;
        header?.classList.toggle('smaller-header', y > 50);
        toTop?.classList.toggle('show', y > window.innerHeight);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progress) progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Menu mobile
    const menuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('site-nav');
    const setMenu = open => {
        nav?.classList.toggle('mobile-active', open);
        menuBtn?.setAttribute('aria-expanded', String(open));
        const icon = menuBtn?.querySelector('i');
        if (icon) icon.className = open ? 'fas fa-xmark' : 'fas fa-bars';
    };
    menuBtn?.addEventListener('click', () => setMenu(!nav.classList.contains('mobile-active')));
    nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));

    // === 4. Revelação ao rolar (com escalonamento) ===
    document.getElementById('year').textContent = new Date().getFullYear();

    const revealObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target); // não some de novo quando a página cresce
        });
    }, { threshold: 0.12 });

    document.querySelectorAll('.empresa-text, .trabalhe-box').forEach(group => {
        group.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--d', `${i * 0.12}s`));
    });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // === 5. Cursor personalizado ===
    if (finePointer && !reduceMotion) {
        const dot = document.getElementById('cursor-dot');
        const ring = document.getElementById('cursor-ring');
        let mx = 0, my = 0, rx = 0, ry = 0;

        window.addEventListener('mousemove', e => {
            mx = e.clientX; my = e.clientY;
            document.body.classList.add('cursor-on');
            dot.style.transform = `translate(${mx}px, ${my}px)`;
        });
        document.addEventListener('mouseleave', () => document.body.classList.remove('cursor-on'));

        const loop = () => {
            rx += (mx - rx) * 0.16;
            ry += (my - ry) * 0.16;
            ring.style.transform = `translate(${rx}px, ${ry}px)`;
            requestAnimationFrame(loop);
        };
        loop();

        const hoverSel = 'a, button, .video-card, .btn-filter, .client-item';
        document.addEventListener('mouseover', e => ring.classList.toggle('is-hover', !!e.target.closest(hoverSel)));
    }

    // === 6. Botões magnéticos + ripple ===
    document.querySelectorAll('[data-magnetic]').forEach(btn => {
        if (finePointer && !reduceMotion) {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.28;
                const y = (e.clientY - r.top - r.height / 2) * 0.4;
                btn.style.transform = `translate(${x}px, ${y}px)`;
            });
            btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
        }
    });

    document.addEventListener('click', e => {
        const btn = e.target.closest('.btn-load-more, .btn-recrutamento, .slide-cta, .btn-filter');
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 2;
        const span = document.createElement('span');
        span.className = 'ripple';
        span.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
        btn.appendChild(span);
        setTimeout(() => span.remove(), 700);
    });

    // === 7. Inclinação 3D + brilho nos cards (delegação: cards nascem via API) ===
    if (finePointer && !reduceMotion) {
        const gallery = document.getElementById('gallery');
        gallery?.addEventListener('mousemove', e => {
            const card = e.target.closest('.video-card');
            if (!card) return;
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--ry', `${((px - 0.5) * 14).toFixed(2)}deg`);
            card.style.setProperty('--rx', `${((0.5 - py) * 14).toFixed(2)}deg`);
            card.style.setProperty('--px', `${(px * 100).toFixed(1)}%`);
            card.style.setProperty('--py', `${(py * 100).toFixed(1)}%`);
        });
        gallery?.addEventListener('mouseout', e => {
            const card = e.target.closest('.video-card');
            if (!card || card.contains(e.relatedTarget)) return;
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });

        // Cartão da logo em "Quem Somos"
        document.querySelectorAll('[data-tilt]').forEach(el => {
            const card = el.querySelector('.logo-card');
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                const px = (e.clientX - r.left) / r.width - 0.5;
                const py = (e.clientY - r.top) / r.height - 0.5;
                card.style.transform = `translateZ(40px) rotateY(${px * 22}deg) rotateX(${-py * 22}deg) rotate(-3deg)`;
            });
            el.addEventListener('mouseleave', () => { card.style.transform = ''; });
        });
    }
});
