document.addEventListener('DOMContentLoaded', () => {
    // === 1. Header Dinâmico ===
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('smaller-header');
        else header.classList.remove('smaller-header');
    });

    // === 2. Lógica do Banner (Código unificado) ===
    const slides = document.querySelectorAll('.slide');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const progressBar = document.getElementById('progress-fill');
    const indicatorsContainer = document.getElementById('carousel-indicators');
    
    let currentSlide = 0;
    let autoPlayTimer = null;
    const duration = 8000; 

    if (slides.length === 0) {
        console.error("Erro: Nenhum slide encontrado com a classe .slide");
        return;
    }

    function updateSlide(newIndex) {
        slides.forEach((slide) => {
            slide.classList.remove('active', 'prev');
        });

        slides[currentSlide].classList.add('prev');
        slides[newIndex].classList.add('active');

        const dots = document.querySelectorAll('.indicator');
        dots.forEach((dot, i) => dot.classList.toggle('active', i === newIndex));

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

    if (btnNext) {
        btnNext.addEventListener('click', () => {
            updateSlide((currentSlide + 1) % slides.length);
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            updateSlide((currentSlide - 1 + slides.length) % slides.length);
        });
    }

    if (indicatorsContainer && indicatorsContainer.innerHTML === "") {
        slides.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.classList.add('indicator');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                updateSlide(i);
            });
            indicatorsContainer.appendChild(dot);
        });
    }

    // Inicialização
    startAutoPlay();

    const carousel = document.querySelector('.hero-carousel');
    if (carousel) {
        carousel.addEventListener('mouseenter');
        carousel.addEventListener('mouseleave');
    }

    // === 3. Lógica de Clientes ===
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