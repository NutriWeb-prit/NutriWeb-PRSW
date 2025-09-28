document.addEventListener('DOMContentLoaded', function() {
    configurarVerMais();
    aplicarEventListenersModalCards(document.querySelectorAll('.card'));
});

function configurarVerMais() {
    const btnVerMais = document.querySelector('.btn-verMais');
    const cardsContainer = document.querySelector('.cards-container');
    const bannerCardMeio = document.querySelector('.banner-card-meio');
    const cardsWrapperOriginal = document.querySelector('.cards-wrapper');
    
    if (!btnVerMais || !cardsContainer || !bannerCardMeio || !cardsWrapperOriginal) return;
    
    const bannersDisponiveis = [
        "imagens/banner1.png",
        "imagens/banner2.jpg", 
        "imagens/banner4.png",
        "imagens/banner-agrobox-desktop.png"
    ];
    
    let ultimoBannerUsado = null;
    
    function obterBannerAtual() {
        const bannerAtual = bannerCardMeio.querySelector('img');
        return bannerAtual ? bannerAtual.src : null;
    }
    
    const bannerOriginal = obterBannerAtual();
    if (bannerOriginal) {
        const nomeArquivo = bannerOriginal.split('/').pop();
        ultimoBannerUsado = bannersDisponiveis.find(banner => banner.includes(nomeArquivo)) || bannersDisponiveis[0];
    }
    
    const cardsOriginais = Array.from(cardsWrapperOriginal.querySelectorAll('.card'));
    
    function selecionarBannerDiferente() {
        let bannersParaEscolher = bannersDisponiveis.filter(banner => banner !== ultimoBannerUsado);
        
        if (bannersParaEscolher.length === 0) {
            bannersParaEscolher = bannersDisponiveis;
        }
        
        const bannerEscolhido = bannersParaEscolher[Math.floor(Math.random() * bannersParaEscolher.length)];
        ultimoBannerUsado = bannerEscolhido;
        
        return bannerEscolhido;
    }
    
    function criarBannerAleatorio() {
        const bannerSection = document.createElement('section');
        bannerSection.className = 'banner-card-meio';
        
        const img = document.createElement('img');
        const imagemAleatoria = selecionarBannerDiferente();
        img.src = imagemAleatoria;
        img.alt = "BannerPatrocinio";
        
        if (imagemAleatoria.includes('banner-agrobox-desktop')) {
            img.onclick = function() { irAgroBox(); };
            img.style.cursor = 'pointer';
        }
        
        bannerSection.appendChild(img);
        return bannerSection;
    }
    
    btnVerMais.addEventListener('click', function() {
        this.remove();
        
        const novoCardsWrapper = document.createElement('section');
        novoCardsWrapper.className = 'cards-wrapper';
        
        const novosCards = [];
        
        cardsOriginais.forEach(card => {
            const novoCard = card.cloneNode(true);
            novoCardsWrapper.appendChild(novoCard);
            novosCards.push(novoCard);
        });
        
        aplicarEventListenersModalCards(novosCards);
        
        const novoBanner = criarBannerAleatorio();
        
        const ultimoElemento = cardsContainer.lastElementChild === this ? 
                              cardsContainer.children[cardsContainer.children.length - 2] : 
                              cardsContainer.lastElementChild;
        
        ultimoElemento.insertAdjacentElement('afterend', novoCardsWrapper);
        novoCardsWrapper.insertAdjacentElement('afterend', novoBanner);
        
        cardsContainer.appendChild(this);
        this.addEventListener('click', arguments.callee);
    });
}

function aplicarEventListenersModalCards(cards) {
    cards.forEach(card => {
        const novoCard = card.cloneNode(true);
        if (card.parentNode) {
            card.parentNode.replaceChild(novoCard, card);
        }
        
        novoCard.addEventListener('click', function(e) {
            if (e.target.closest('a')) {
                return;
            }
            
            abrirModalComDados(this);
        });
        
        const contentImg = novoCard.querySelector('.content-img');
        if (contentImg) {
            contentImg.addEventListener('click', function(e) {
                e.stopPropagation();
                abrirModalComDados(novoCard);
            });
        }
    });
}

function abrirModalComDados(card) {
    const modal = document.getElementById('modal');
    if (!modal) {
        return;
    }
    
    const modalImg = document.querySelectorAll('#modal-img');
    const modalProfile = document.getElementById('modal-profile');
    const modalName = document.getElementById('modal-name');
    const modalProfession = document.querySelector('.modal-card .profession');
    const modalDescription = document.querySelector('.modal-description');
    const modalLink = document.querySelector('.card-perfil-modal');
    
    const dados = {
        id: card.dataset.id,
        nome: card.dataset.nome,
        profissao: card.dataset.profissao,
        imgPerfil: card.dataset.imgperfil,
        imgConteudo: card.dataset.imgconteudo,
        titulo: card.dataset.titulo,
        conteudo1: card.dataset.conteudo1,
        subtitulo1: card.dataset.subtitulo1,
        conteudo2: card.dataset.conteudo2,
        subtitulo2: card.dataset.subtitulo2,
        conteudo3: card.dataset.conteudo3
    };
    
    try {
        if (modalImg && modalImg.length > 0) {
            modalImg.forEach(img => {
                img.src = dados.imgConteudo;
                img.alt = dados.titulo || 'Imagem do post';
            });
        }
        
        if (modalProfile) {
            modalProfile.src = dados.imgPerfil;
            modalProfile.alt = dados.nome;
        }
        
        if (modalName) {
            modalName.textContent = dados.nome;
        }
        
        if (modalProfession) {
            modalProfession.textContent = dados.profissao;
        }
        
        if (modalLink) {
            modalLink.href = `/perfilnutri?id=${dados.id}`;
        }
        
        if (modalDescription) {
            modalDescription.innerHTML = `
                <h2>${dados.titulo || 'Sem título'}</h2>
                <p>${dados.conteudo1 || ''}</p>
                <h3>${dados.subtitulo1 || ''}</h3>
                <p>${dados.conteudo2 || ''}</p>
                <h3>${dados.subtitulo2 || ''}</h3>
                <p>${dados.conteudo3 || ''}</p>
            `;
        }
        
        modal.style.display = 'flex';
        document.body.classList.add("body-no-scroll");
        
    } catch (error) {
    }
}