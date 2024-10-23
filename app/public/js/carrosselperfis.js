document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.cards-container-profissional');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const cards = document.querySelectorAll('.card-nutri');
    
    // Largura de cada card (inclui o gap entre eles)
    const cardWidth = 200 + 30; // 200px de largura + 30px de gap
    const visibleCards = 4; // Número de cards visíveis de uma vez
    
    // Função para atualizar o estado dos botões
    function updateCarouselButtons() {
        const scrollLeft = container.scrollLeft;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
    
        // Esconde o botão "prev" se estivermos no início do carrossel
        prevButton.style.display = scrollLeft <= 0 ? 'none' : 'block';
    
        // Esconde o botão "next" se estivermos no final do carrossel
        nextButton.style.display = scrollLeft >= maxScrollLeft ? 'none' : 'block';
    }
    
    // Rola para a esquerda
    prevButton.addEventListener('click', () => {
        container.scrollBy({
            left: -cardWidth * visibleCards, // Mover 4 cards para a esquerda
            behavior: 'smooth'
        });
    });
    
    // Rola para a direita
    nextButton.addEventListener('click', () => {
        container.scrollBy({
            left: cardWidth * visibleCards, // Mover 4 cards para a direita
            behavior: 'smooth'
        });
    });
    
    // Atualiza os botões ao inicializar
    updateCarouselButtons();
    
    // Atualiza os botões sempre que o container rolar
    container.addEventListener('scroll', updateCarouselButtons);
    
    // Atualiza os botões ao redimensionar a janela
    window.addEventListener('resize', updateCarouselButtons);
})