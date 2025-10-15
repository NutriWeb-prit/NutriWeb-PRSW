document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    const modal = document.getElementById('modal');
    const closeButton = document.getElementById('close-modal');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const publicacaoId = card.dataset.id;
            const nome = card.dataset.nome;
            const profissao = card.dataset.profissao;
            const imgPerfil = card.dataset.imgperfil;
            const imgConteudo = card.dataset.imgconteudo;
            const legenda = card.dataset.legenda;

            console.log("🔍 Card clicado:");
            console.log("  - ID da publicação:", publicacaoId);
            console.log("  - Nome:", nome);

            document.querySelectorAll('#modal-img').forEach(img => img.src = imgConteudo);
            document.getElementById('modal-profile').src = imgPerfil;
            document.getElementById('modal-name').textContent = nome;
            document.querySelector('.modal-card .profession').textContent = profissao;
            document.querySelector('.card-perfil-modal').href = `/perfilnutri?id=${card.dataset.nutricionistaId || '1'}`;
            document.querySelector('.modal-description').innerHTML = `<p>${legenda}</p>`;

            publicacaoAtualId = parseInt(publicacaoId);
            console.log("✅ publicacaoAtualId definido como:", publicacaoAtualId);

            modal.style.display = 'flex';
            document.body.classList.add("body-no-scroll");

            setTimeout(() => {
                inicializarSistemaComentarios(publicacaoAtualId);
            }, 100);
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove("body-no-scroll");
        publicacaoAtualId = null;
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove("body-no-scroll");
            publicacaoAtualId = null;
        }
    });
});

function obterPublicacaoId() {
    if (publicacaoAtualId) {
        return publicacaoAtualId;
    }
    
    const modal = document.getElementById('modal');
    if (modal && modal.dataset.publicacaoId) {
        return parseInt(modal.dataset.publicacaoId);
    }
    
    console.warn("⚠️ publicacaoAtualId não definido!");
    return null;
}