document.addEventListener('DOMContentLoaded', function () {
    const etapaAtual = parseInt(document.querySelector('input[name="etapa"]').value);

    const todosOsCards = document.querySelectorAll('.card, .card-others');
    todosOsCards.forEach(card => card.style.display = 'none');

    if (etapaAtual === 1) {
        document.getElementById('card').style.display = 'block';
    } else if (etapaAtual === 2) {
        document.getElementById('card-two').style.display = 'block';
    } else if (etapaAtual === 3) {
        document.getElementById('card-three').style.display = 'block';
    } else if (etapaAtual === 4) {
        document.getElementById('card-four').style.display = 'block';
    }

    const barraProgresso = document.querySelectorAll('.barra-progresso .progresso');
    for (let i = 0; i < etapaAtual; i++) {
        if (barraProgresso[i]) {
            barraProgresso[i].classList.add('ativo');
        }
    }
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

