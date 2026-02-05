document.addEventListener('DOMContentLoaded', () => {

// Lógica básica para abrir/fechar menu em mobile
const menuBtn = document.getElementById('mobile-menu-btn');
const nav = document.getElementById('site-nav');

if (menuBtn) {
    menuBtn.addEventListener('click', () => {
        nav.classList.toggle('active-mobile');
    });
}

    // === 1. Lógica do Banner ===
    const slides = document.querySelectorAll('.slide');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');
    const progressBar = document.getElementById('progress-fill');
    const indicatorsContainer = document.getElementById('carousel-indicators');

    // === Lógica de toque para dispositivos móveis ===
const carousel = document.querySelector('.carousel-container');
let touchStartX = 0;
let touchEndX = 0;

if (carousel) {
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; 
        if (touchStartX - touchEndX > swipeThreshold) {
            updateSlide((currentSlide + 1) % slides.length);
        } else if (touchEndX - touchStartX > swipeThreshold) {
            updateSlide((currentSlide - 1 + slides.length) % slides.length);
        }
    }
}
    let currentSlide = 0;
    let autoPlayTimer = null;
    const duration = 8000; 

    if (slides.length > 0) {
        function updateSlide(newIndex) {
            slides[currentSlide].classList.remove('active');
            slides[currentSlide].classList.add('prev');

            slides[newIndex].classList.add('active');
            slides[newIndex].classList.remove('prev');

            setTimeout(() => {
                slides.forEach((s, i) => { if(i !== newIndex) s.classList.remove('prev'); });
            }, 800);

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
            if (autoPlayTimer) clearInterval(autoPlayTimer);
            resetProgressBar();
            autoPlayTimer = setInterval(() => {
                updateSlide((currentSlide + 1) % slides.length);
            }, duration);
        }

        if (btnNext) btnNext.addEventListener('click', () => updateSlide((currentSlide + 1) % slides.length));
        if (btnPrev) btnPrev.addEventListener('click', () => updateSlide((currentSlide - 1 + slides.length) % slides.length));

        if (indicatorsContainer && indicatorsContainer.innerHTML === "") {
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.classList.add('indicator');
                if (i === 0) dot.classList.add('active');
                dot.addEventListener('click', () => updateSlide(i));
                indicatorsContainer.appendChild(dot);
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
    { file: "infinito-logo.png", url: "https://www.agenciainfinito.com.br/" },
    { file: "sebrae.png", url: "http://www.sebrae.com.br/" },
    { file: "imip-logo.png", url: "http://www.imip.org.br/" },
    { file: "peconstrutora.png", url: "http://www.pernambucoconstrutora.com.br/" },
    { file: "cdlrecife.png", url: "http://www.cdlrecife.com.br/" },
    { file: "fcdlpe.png", url: "http://www.fcdlpe.com.br/" },
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
    { file: "habitat.png", url: "http://www.habitatbrasil.org.br/" }
];

const renderClients = () => {
    const clientsGrid = document.getElementById('clients-grid');
    if (clientsGrid) {
        clientsGrid.innerHTML = ''; 
        clientData.forEach(client => {
            const clientName = client.file.split('.')[0].replace(/_|-/g, ' ');
            
            const div = document.createElement('div');
            div.className = 'client-item';
            div.title = clientName;
            
            div.innerHTML = `
                <a href="${client.url}" target="_blank" rel="noopener noreferrer">
                    <img src="images/clientes/${client.file}" alt="${clientName}" class="client-logo">
                </a>
            `;
            clientsGrid.appendChild(div);
        });
    }
};

renderClients();
});