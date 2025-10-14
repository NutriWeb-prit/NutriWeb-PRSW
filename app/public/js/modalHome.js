document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    const modal = document.getElementById('modal');
    const closeButton = document.getElementById('close-modal');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Extrair dados do card
            const publicacaoId = card.dataset.id;
            const nome = card.dataset.nome;
            const profissao = card.dataset.profissao;
            const imgPerfil = card.dataset.imgperfil;
            const imgConteudo = card.dataset.imgconteudo;
            const legenda = card.dataset.legenda;

            console.log("🔍 Card clicado:");
            console.log("  - ID da publicação:", publicacaoId);
            console.log("  - Nome:", nome);

            // Atualizar os dados do modal
            document.querySelectorAll('#modal-img').forEach(img => img.src = imgConteudo);
            document.getElementById('modal-profile').src = imgPerfil;
            document.getElementById('modal-name').textContent = nome;
            document.querySelector('.modal-card .profession').textContent = profissao;
            document.querySelector('.card-perfil-modal').href = `/perfilnutri?id=${card.dataset.nutricionistaId || '1'}`;
            document.querySelector('.modal-description').innerHTML = `<p>${legenda}</p>`;

            // ✅ IMPORTANTE: Inicializar o sistema de comentários ANTES de abrir o modal
            publicacaoAtualId = parseInt(publicacaoId);
            console.log("✅ publicacaoAtualId definido como:", publicacaoAtualId);

            // Abrir modal
            modal.style.display = 'flex';
            document.body.classList.add("body-no-scroll");

            // Inicializar comentários e curtidas
            setTimeout(() => {
                inicializarSistemaComentarios(publicacaoAtualId);
            }, 100);
        });
    });

    // Fechar modal
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove("body-no-scroll");
        publicacaoAtualId = null; // Limpar ID ao fechar
    });

    // Fechar ao clicar fora
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove("body-no-scroll");
            publicacaoAtualId = null;
        }
    });
});

// ============ UTILITÁRIO: Verificar se publicação está carregada ============

function obterPublicacaoId() {
    if (publicacaoAtualId) {
        return publicacaoAtualId;
    }
    
    // Fallback: tentar extrair do data attribute do modal
    const modal = document.getElementById('modal');
    if (modal && modal.dataset.publicacaoId) {
        return parseInt(modal.dataset.publicacaoId);
    }
    
    console.warn("⚠️ publicacaoAtualId não definido!");
    return null;
}

// ============ TESTE E DEBUG ============

function testarConexaoAPI() {
    const pubId = obterPublicacaoId();
    
    if (!pubId) {
        console.error("❌ Nenhuma publicação carregada!");
        window.mostrarNotificacao("Erro: Nenhuma publicação carregada", 0);
        return;
    }

    console.log("📡 Testando API com publicação ID:", pubId);
    
    fetch(`/api/comentarios/${pubId}`)
        .then(res => res.json())
        .then(data => {
            console.log("✅ API respondeu:");
            console.log(data);
        })
        .catch(err => {
            console.error("❌ Erro na API:", err);
        });
}