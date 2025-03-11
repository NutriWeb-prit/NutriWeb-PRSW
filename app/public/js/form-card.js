document.addEventListener('DOMContentLoaded', function() {
    const continuar = document.querySelectorAll('.continuar');
    const cards = [
        document.getElementById('card-two'),
        document.getElementById('card-three'),
        document.getElementById('card-four')
    ];
    const barraProgresso = document.querySelectorAll('.barra-progresso .progresso');

    let currentIndex = 0;

    continuar.forEach(function(barra, index) {
        barra.addEventListener('click', function() {
            cards[currentIndex].style.display = 'none';

            currentIndex++;

            if (cards[currentIndex]) {
                cards[currentIndex].style.display = 'block';
                barraProgresso[currentIndex+1].classList.add('ativo');
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

function irLogin() {
    window.location.href = '/login';
}