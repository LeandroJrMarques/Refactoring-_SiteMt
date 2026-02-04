document.addEventListener('DOMContentLoaded', () => {
    // === Header Dinâmico ===
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('smaller-header');
        else header.classList.remove('smaller-header');
    });

    // === Lógica do Banner ===
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const delay = 8000;

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        slides[index].classList.add('active');
        currentSlide = index;
    }

    document.getElementById('nextslide')?.addEventListener('click', () => {
        showSlide((currentSlide + 1) % slides.length);
    });

    document.getElementById('prevslide')?.addEventListener('click', () => {
        showSlide((currentSlide - 1 + slides.length) % slides.length);
    });

    setInterval(() => {
        showSlide((currentSlide + 1) % slides.length);
    }, delay);

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