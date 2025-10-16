document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card');
    const modal = document.getElementById('modal');
    const closeButton = document.getElementById('close-modal');
    const seloPremium = document.getElementById('modal-selo-premium');
    
    cards.forEach(card => {
        const linkPerfil = card.querySelector('.card-perfil');
        if (linkPerfil) {
            linkPerfil.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        card.addEventListener('click', () => {
            const publicacaoId = card.dataset.id;
            const nome = card.dataset.nome;
            const profissao = card.dataset.profissao;
            const imgPerfil = card.dataset.imgperfil;
            const imgConteudo = card.dataset.imgconteudo;
            const legenda = card.dataset.legenda;

            const nutricionistaId = card.dataset.nutricionistaId || '1';
            
            const temPremium = card.dataset.premium === 'true';
            const premiumDuracao = card.dataset.premiumDuracao || 'Premium';
            
            document.querySelectorAll('#modal-img').forEach(img => img.src = imgConteudo);
            document.getElementById('modal-profile').src = imgPerfil;
            document.getElementById('modal-name').textContent = nome;
            document.querySelector('.modal-card .profession').textContent = profissao;
            document.querySelector('.card-perfil-modal').href = `/perfilnutri?id=${nutricionistaId || '1'}`;
            document.querySelector('.modal-description').innerHTML = `<p>${legenda}</p>`;
            
            if (temPremium && seloPremium) {
                seloPremium.style.display = 'flex'; 
                seloPremium.setAttribute('title', `Nutricionista Premium - Plano ${premiumDuracao}`);
            } else if (seloPremium) {
                seloPremium.style.display = 'none';
            }
            
            publicacaoAtualId = parseInt(publicacaoId);
            
            modal.style.display = 'flex';
            document.body.classList.add("body-no-scroll");
        });
    });
    
    const linkPerfilModal = modal.querySelector('.card-perfil-modal');
    if (linkPerfilModal) {
        linkPerfilModal.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log("🔗 Navegando para o perfil do nutricionista (via modal)");
        });
    }
    
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