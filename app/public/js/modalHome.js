document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    const modal = document.getElementById('modal');
    const closeButton = document.getElementById('close-modal');
    const seloPremium = document.getElementById('modal-selo-premium'); // Referência ao selo
    
    cards.forEach(card => {
        // 1. NOVIDADE: Impede que o link do perfil abra o modal
        const linkPerfil = card.querySelector('.card-perfil');
        if (linkPerfil) {
            linkPerfil.addEventListener('click', (e) => {
                e.stopPropagation(); // Para a propagação do evento
                console.log("🔗 Navegando para o perfil do nutricionista");
                // O link funciona normalmente, mas não abre o modal
            });
        }
        
        card.addEventListener('click', () => {
            // 1. Pega todos os dados do card
            const publicacaoId = card.dataset.id;
            const nome = card.dataset.nome;
            const profissao = card.dataset.profissao;
            const imgPerfil = card.dataset.imgperfil;
            const imgConteudo = card.dataset.imgconteudo;
            const legenda = card.dataset.legenda;
            
            // Acessa corretamente o data-nutricionista-id
            const nutricionistaId = card.dataset.nutricionistaId || '1';
            
            // 2. NOVIDADE: Pega os dados de Premium
            const temPremium = card.dataset.premium === 'true';
            const premiumDuracao = card.dataset.premiumDuracao || 'Premium';
            
            console.log("🔍 Card clicado:");
            console.log("  - ID da publicação:", publicacaoId);
            console.log("  - Nome:", nome);
            console.log("  - Nutricionista ID:", nutricionistaId);
            console.log("  - Tem Premium?", temPremium);
            console.log("  - Duração do Premium:", premiumDuracao);
            
            // 3. Preenche os dados normais do modal
            document.querySelectorAll('#modal-img').forEach(img => img.src = imgConteudo);
            document.getElementById('modal-profile').src = imgPerfil;
            document.getElementById('modal-name').textContent = nome;
            document.querySelector('.modal-card .profession').textContent = profissao;
            document.querySelector('.card-perfil-modal').href = `/perfilnutri?id=${nutricionistaId || '1'}`;
            document.querySelector('.modal-description').innerHTML = `<p>${legenda}</p>`;
            
            // 4. NOVIDADE: Exibe ou esconde o selo Premium
            if (temPremium && seloPremium) {
                seloPremium.style.display = 'flex'; // Mostra o selo
                seloPremium.setAttribute('title', `Nutricionista Premium - Plano ${premiumDuracao}`);
                console.log("✅ Selo Premium exibido no modal");
            } else if (seloPremium) {
                seloPremium.style.display = 'none'; // Esconde o selo
                console.log("❌ Selo Premium escondido (nutricionista não é premium)");
            }
            
            // 5. Define o ID da publicação atual e abre o modal
            publicacaoAtualId = parseInt(publicacaoId);
            console.log("✅ publicacaoAtualId definido como:", publicacaoAtualId);
            
            modal.style.display = 'flex';
            document.body.classList.add("body-no-scroll");
            
            // 6. Inicializa o sistema de comentários
            setTimeout(() => {
                inicializarSistemaComentarios(publicacaoAtualId);
            }, 100);
        });
    });
    
    // 2. NOVIDADE: Impede que o link do perfil NO MODAL feche o modal
    const linkPerfilModal = modal.querySelector('.card-perfil-modal');
    if (linkPerfilModal) {
        linkPerfilModal.addEventListener('click', (e) => {
            e.stopPropagation(); // Para a propagação do evento
            console.log("🔗 Navegando para o perfil do nutricionista (via modal)");
            // O link funciona normalmente e navega para o perfil
        });
    }
    
    // Fecha o modal ao clicar no X
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove("body-no-scroll");
        publicacaoAtualId = null;
    });
    
    // Fecha o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove("body-no-scroll");
            publicacaoAtualId = null;
        }
    });
});

// Função auxiliar (mantém a original)
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