const stars = document.querySelectorAll('.star');

// Função para remover a classe "hovered" de todas as estrelas
function resetHover() {
    stars.forEach((star) => star.classList.remove('hovered'));
}

// Função para marcar as estrelas até a atual como "hovered"
function applyHover(index) {
    for (let i = 0; i <= index; i++) {
        stars[i].classList.add('hovered');
    }
}

// Evento de clique para marcar/desmarcar as estrelas selecionadas
stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        const isActive = star.classList.contains('active');

        // Se a estrela clicada já estiver ativa, desativa todas as estrelas a partir dela
        if (isActive) {
            for (let i = index; i < stars.length; i++) {
                stars[i].classList.remove('active');
            }
        } else {
            // Remove a classe "active" de todas as estrelas
            stars.forEach((s) => s.classList.remove('active'));

            // Adiciona a classe "active" até a estrela clicada
            for (let i = 0; i <= index; i++) {
                stars[i].classList.add('active');
            }
        }
    });
});