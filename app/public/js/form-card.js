document.addEventListener('DOMContentLoaded', function() {
    const barras = document.querySelectorAll('.barra-progresso .progresso');
    const cards = [
        document.getElementById('card'),
        document.getElementById('card-two'),
        document.getElementById('card-three'),
        document.getElementById('card-four')
    ];

    barras.forEach(function(barra, index) {
        barra.addEventListener('click', function() {
            barras.forEach(function(item) {
                item.classList.remove('ativo');
            });

            cards.forEach(function(card) {
                card.style.display = 'none';
            });

            if (cards[index]) {
                cards[index].style.display = 'block';
            }
            for (let i = 0; i <= index; i++) {
                barras[i].classList.add('ativo');
            }
        });
    });
});

function toggleInfo() {
    const info = document.getElementById('informacao');
    if (info.style.display === 'none') {
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
}