const clients = [
    { name: "Google", logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" },
    { name: "Amazon", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" },
    { name: "IBM", logo: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
    { name: "Samsung", logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
    { name: "Apple", logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
    { name: "Microsoft", logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" },
    { name: "Netflix", logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg" },
    { name: "Spotify", logo: "https://upload.wikimedia.org/wikipedia/commons/9/96/Spotify_logo_without_text.svg" },
    { name: "YouTube", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e1/Logo_of_YouTube_%282015-2017%29.svg" },
    { name: "Facebook", logo: "https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" },
    { name: "Twitter", logo: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg" },
    { name: "Instagram", logo: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" }
];

const renderClients = () => {
    const clientsGrid = document.getElementById('clients-grid');
    if (clientsGrid) {
        // Limpa o grid antes de renderizar para evitar duplicatas ao recarregar scripts
        clientsGrid.innerHTML = ''; 

        clients.forEach(client => {
            const div = document.createElement('div');
            div.className = 'client-item';
            div.title = client.name;
            div.innerHTML = `<img src="${client.logo}" alt="${client.name}" class="client-logo">`;
            clientsGrid.appendChild(div);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    renderClients();
    const header = document.getElementById('site-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) header.classList.add('smaller-header');
        else header.classList.remove('smaller-header');
    });

    // Lógica do Banner
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const delay = 8000; // Tempo original

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        slides[index].classList.add('active');
        currentSlide = index;
    }

    document.getElementById('nextslide')?.addEventListener('click', () => {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    });

    document.getElementById('prevslide')?.addEventListener('click', () => {
        let prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    });

    // Troca automática
    setInterval(() => {
        let next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }, delay);
});

