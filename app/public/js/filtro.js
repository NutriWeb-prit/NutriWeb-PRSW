document.addEventListener('DOMContentLoaded', function () {
    const checkboxes = document.querySelectorAll('.listafiltrar input[type="checkbox"]');
    const cards = document.querySelectorAll('.card-nutri');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            filterCards();
        });
    });
    
    function filterCards() {
        const selectedFilters = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.labels[0].innerText); // Obtém o texto do label associado
    
        cards.forEach(card => {
            const specialty = card.querySelector('.card-specialty').innerText;
    
            // Verifica se o card corresponde a algum filtro selecionado
            if (selectedFilters.length === 0 || selectedFilters.includes(specialty)) {
                card.parentElement.style.display = 'block'; // Mostra o card
            } else {
                card.parentElement.style.display = 'none'; // Esconde o card
            }
        });
    
        // Recalcula o carrossel para ajustar os botões
        checkCarouselButtons();
    }
})