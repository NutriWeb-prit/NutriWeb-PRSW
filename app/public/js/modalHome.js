document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.content-img');
    const modal = document.getElementById('modal');
    const closeButton = document.getElementById('close-modal');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            modal.style.display = 'flex'; 
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

