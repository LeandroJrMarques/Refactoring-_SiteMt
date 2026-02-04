document.addEventListener('DOMContentLoaded', () => {
    // === Header Dinâmico ===
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('smaller-header');
        else header.classList.remove('smaller-header');
    });

    // === Lógica do Banner ===
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const progressBar = document.getElementById('progress-fill');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    let currentSlide = 0;
    let autoPlayTimer = null;
    const duration = 5000; // 5 segundos

    if (slides.length === 0) {
        console.error("Erro: Nenhum slide encontrado com a classe .slide");
        return;
    }

    // Função para mudar o slide
    function updateSlide(newIndex) {
        // Remove classes de todos
        slides.forEach((slide) => {
            slide.classList.remove('active', 'prev');
        });

        // Adiciona classe 'prev' ao que vai sair e 'active' ao novo
        slides[currentSlide].classList.add('prev');
        slides[newIndex].classList.add('active');

        // Atualiza bolinhas (indicators)
        const dots = document.querySelectorAll('.indicator');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === newIndex));

        // Atualiza contador
        const counter = document.getElementById('counter-current');
        if (counter) counter.textContent = String(newIndex + 1).padStart(2, '0');

        currentSlide = newIndex;
        resetProgressBar();
    }

    function resetProgressBar() {
        if (!progressBar) return;
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
        progressBar.offsetHeight; 
        progressBar.style.transition = `width ${duration}ms linear`;
        progressBar.style.width = '100%';
    }

    function startAutoPlay() {
        stopAutoPlay();
        resetProgressBar();
        autoPlayTimer = setInterval(() => {
            let next = (currentSlide + 1) % slides.length;
            updateSlide(next);
        }, duration);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) clearInterval(autoPlayTimer);
    }

    // Configurar botões
    if (btnNext) {
        btnNext.addEventListener('click', () => {
            let next = (currentSlide + 1) % slides.length;
            updateSlide(next);
            startAutoPlay(); // Reinicia o tempo ao clicar
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            let prev = (currentSlide - 1 + slides.length) % slides.length;
            updateSlide(prev);
            startAutoPlay();
        });
    }

    // Criar indicadores dinâmicos se o container existir
    if (indicatorsContainer && indicatorsContainer.innerHTML === "") {
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('indicator');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                updateSlide(i);
                startAutoPlay();
            });
            indicatorsContainer.appendChild(dot);
        });
    }

    // Iniciar
    updateSlide(0);
    startAutoPlay();

    // Pausa ao passar o rato
    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
    }
});

    // === Lógica de Clientes (Modularizada e Local) ===
    const clientImages = [
        "Cagepa_Logo.png", "Neoenergia_Logo.png", "Rio_Ave_Logo.png", "abreu.png",
        "ade.png", "amway.png", "assolan-logo.png", "auxiliadora.png", 
        "batatela.png", "bilio.png", "cattan.png", "cdlrecife.png", 
        "celpe.png", "claro-logo.png", "clinilaser.png", "coelba-logo.png",
        "compesa.png", "cosern-logo.png", "energisa-logo.png", "fcdlpe.png",
        "grupojcpm-logo.png", "habitat.png", "imip-logo.png", "infinito-logo.png",
        "iquine-logo.png", "jucepe.png", "marambaia.png", "mazzarello.png",
        "mmsagencia-logo.png", "peconstrutora.png", "prefeitura_recife.png",
        "rocha.png", "sebrae.png", "sindilojas.png", "stgobain.png", "tim-logo.png"
    ];

    const renderClients = () => {
        const clientsGrid = document.getElementById('clients-grid');
        if (clientsGrid) {
            clientsGrid.innerHTML = ''; 
            clientImages.forEach(fileName => {
                const div = document.createElement('div');
                div.className = 'client-item';
                const clientName = fileName.split('.')[0].replace(/_|-/g, ' ');
                div.title = clientName;
                div.innerHTML = `<img src="images/clientes/${fileName}" alt="${clientName}" class="client-logo">`;
                clientsGrid.appendChild(div);
            });
        }
    };

    renderClients();
});