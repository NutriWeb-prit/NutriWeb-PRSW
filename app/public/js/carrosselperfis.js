document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.cards-container-profissional');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const cards = document.querySelectorAll('.card-nutri');
    
    const cardWidth = 200 + 30;
    const visibleCards = 4;
    
    function updateCarouselButtons() {
        const scrollLeft = container.scrollLeft;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
        prevButton.style.display = scrollLeft <= 0 ? 'none' : 'block';
    
        nextButton.style.display = scrollLeft >= maxScrollLeft ? 'none' : 'block';
    }
    
    prevButton.addEventListener('click', () => {
        container.scrollBy({
            left: -cardWidth * visibleCards,
            behavior: 'smooth'
        });
    });
    
    nextButton.addEventListener('click', () => {
        container.scrollBy({
            left: cardWidth * visibleCards,
            behavior: 'smooth'
        });
    });
    
    updateCarouselButtons();
    
    container.addEventListener('scroll', updateCarouselButtons);
    
    window.addEventListener('resize', updateCarouselButtons);
})