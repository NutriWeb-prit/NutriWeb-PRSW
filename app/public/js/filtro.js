document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.card-nutri');

    function attachFilterBehavior(formSelector) {
        const checkboxes = document.querySelectorAll(`${formSelector} input[type="checkbox"]`);
        
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                filterCards(formSelector);
            });
        });
    }

    function filterCards(formSelector) {
        const checkboxes = document.querySelectorAll(`${formSelector} input[type="checkbox"]`);
        const selectedFilters = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.labels[0].innerText.trim());

        cards.forEach(card => {
            const specialty = card.querySelector('.card-specialty').innerText.trim();
            if (selectedFilters.length === 0 || selectedFilters.includes(specialty)) {
                card.parentElement.style.display = 'block';
            } else {
                card.parentElement.style.display = 'none';
            }
        });
        if (window.updateCarouselButtons) {
            setTimeout(() => {
                window.updateCarouselButtons();
            }, 100);
        }

        document.querySelector('.cards-container-profissional').scrollLeft = 0;
    }

    attachFilterBehavior('.listafiltrar');
    attachFilterBehavior('.listafiltrarmobile');
});