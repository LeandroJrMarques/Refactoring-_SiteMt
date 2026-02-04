document.addEventListener('DOMContentLoaded', () => {
    // Header Dinâmico
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

