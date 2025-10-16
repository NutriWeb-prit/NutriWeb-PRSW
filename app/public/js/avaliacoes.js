window.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = typeof headerUsuario !== 'undefined' && headerUsuario.estaLogado;
    const dadosUsuario = usuarioLogado ? headerUsuario : null;

    const overlay = document.querySelector('.overlay');
    const containerAvaliacoes = document.getElementById('container-avaliacoes');
    const avaliarNutriSection = document.getElementById('avaliar_nutri');
    const textareaAvaliacao = document.getElementById('avaliacao');
    const btnPostar = document.getElementById('postar');
    const btnAvaliar = document.querySelector('.bookmarkBtn');
    const btnCancelar = document.querySelector('.cancelar');
    const stars = document.querySelectorAll('#rating .star');
    const ratingContainer = document.getElementById('rating');
    
    let avaliacaoSelecionada = 0;
    let avaliacoes = [];
    let paginaAtual = 0;
    let btnCarregarMais = null;
    
    const isMobile = window.innerWidth <= 1100;
    const ITENS_POR_PAGINA = isMobile ? 3 : 6;

    function verificarAutenticacao() {
        if (!usuarioLogado) {
            alert('Você precisa estar logado para avaliar!');
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    }

    if (stars.length > 0) {
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const value = parseInt(star.getAttribute('data-value'));
                highlightStars(value);
            });

            star.addEventListener('click', () => {
                avaliacaoSelecionada = parseInt(star.getAttribute('data-value'));
                highlightStars(avaliacaoSelecionada);
                stars.forEach(s => s.classList.remove('active'));
                for(let i = 0; i < avaliacaoSelecionada; i++) {
                    stars[i].classList.add('active');
                }
            });
        });

        if (ratingContainer) {
            ratingContainer.addEventListener('mouseleave', () => {
                if (avaliacaoSelecionada > 0) {
                    highlightStars(avaliacaoSelecionada);
                } else {
                    stars.forEach(s => s.classList.remove('hovered', 'active'));
                }
            });
        }
    }

    function highlightStars(count) {
        stars.forEach((star, index) => {
            star.classList.toggle('hovered', index < count);
        });
    }

    if (btnAvaliar) {
        btnAvaliar.addEventListener('click', function(e) {
            e.preventDefault();
            if (verificarAutenticacao()) {
                overlay?.classList.remove('hidden');
                document.body.classList.add('body-no-scroll');
            }
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener('click', fecharMenu);
    }

    if (overlay) {
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) fecharMenu();
        });
    }

    window.fecharMenu = fecharMenu;

    function fecharMenu() {
        overlay?.classList.add('hidden');
        document.body.classList.remove('body-no-scroll');
        limparFormulario();
    }

    function limparFormulario() {
        if (textareaAvaliacao) textareaAvaliacao.value = '';
        avaliacaoSelecionada = 0;
        stars.forEach(s => s.classList.remove('hovered', 'active'));
    }

    if (btnPostar) {
        btnPostar.addEventListener('click', enviarAvaliacao);
    }

    function enviarAvaliacao() {
        const textoAvaliacao = textareaAvaliacao?.value.trim() || '';

        if (avaliacaoSelecionada === 0) {
            alert('Por favor, selecione uma classificação de estrelas!');
            return;
        }

        if (textoAvaliacao === '') {
            alert('Por favor, escreva um comentário sobre sua experiência!');
            return;
        }

        const novaAvaliacao = {
            id: Date.now(),
            nome: dadosUsuario.nome || 'Usuário',
            foto: dadosUsuario.fotoPerfil || 'imagens/foto_perfil.jpg',
            comentario: textoAvaliacao,
            estrelas: avaliacaoSelecionada,
            usuarioId: dadosUsuario.id
        };

        avaliacoes.unshift(novaAvaliacao);
        paginaAtual = 0;
        renderizarAvaliacoes();
        fecharMenu();
    }

    function renderizarAvaliacoes() {
        if (!containerAvaliacoes) return;
        
        if (avaliacoes.length === 0) {
            containerAvaliacoes.innerHTML = '<section class="sem-avaliacoes"><p>Seja o primeiro a avaliar!</p></section>';
            removerBotaoCarregarMais();
            return;
        }

        const inicio = paginaAtual * ITENS_POR_PAGINA;
        const fim = inicio + ITENS_POR_PAGINA;
        const avaliacoesVisibles = avaliacoes.slice(inicio, fim);

        containerAvaliacoes.innerHTML = '';
        avaliacoesVisibles.forEach(avaliacao => {
            containerAvaliacoes.appendChild(criarElementoAvaliacao(avaliacao));
        });

        if (fim < avaliacoes.length) {
            criarBotaoCarregarMais();
        } else {
            removerBotaoCarregarMais();
        }
    }

    function criarBotaoCarregarMais() {
        if (!avaliarNutriSection) return;
        
        removerBotaoCarregarMais();

        btnCarregarMais = document.createElement('button');
        btnCarregarMais.className = 'btn-carregar-mais';
        btnCarregarMais.textContent = 'Carregar Mais';
        btnCarregarMais.addEventListener('click', () => {
            paginaAtual++;
            
            const inicio = paginaAtual * ITENS_POR_PAGINA;
            const fim = inicio + ITENS_POR_PAGINA;
            const novasAvaliacoes = avaliacoes.slice(inicio, fim);

            novasAvaliacoes.forEach(avaliacao => {
                containerAvaliacoes.appendChild(criarElementoAvaliacao(avaliacao));
            });

            if (fim >= avaliacoes.length) {
                removerBotaoCarregarMais();
            }
        });

        if (btnAvaliar) {
            avaliarNutriSection.insertBefore(btnCarregarMais, btnAvaliar);
        } else {
            avaliarNutriSection.appendChild(btnCarregarMais);
        }
    }

    function removerBotaoCarregarMais() {
        if (btnCarregarMais && btnCarregarMais.parentNode) {
            btnCarregarMais.remove();
            btnCarregarMais = null;
        }
    }

    function criarElementoAvaliacao(avaliacao) {
        const article = document.createElement('article');
        article.classList.add('avaliacao');
        article.dataset.avaliacaoId = avaliacao.id;

        const estrelasHTML = gerarEstrelasHTML(avaliacao.estrelas);

        article.innerHTML = `
            <section class="nome_avaliador">
                <section id="nome">
                    <img src="${avaliacao.foto}" alt="avaliador" onerror="this.src='imagens/foto_perfil.jpg'">
                    <p class="nome-escrito">${avaliacao.nome}</p>
                </section>
            </section>
            <p class="comentario">${avaliacao.comentario}</p>
            <section id="container-estrela">
                ${estrelasHTML}
            </section>
        `;

        return article;
    }

    function gerarEstrelasHTML(quantidade) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= quantidade) {
                html += '<img src="imagens/estrela-ativa.png" alt="">';
            } else {
                html += '<img src="imagens/estrela.png" class="stay-desativada" alt="">';
            }
        }
        return html;
    }

    function inicializar() {
        if (!containerAvaliacoes) return;

        const avaliacoesExistentes = containerAvaliacoes.querySelectorAll('.avaliacao');
        
        if (avaliacoesExistentes.length > 0) {
            avaliacoesExistentes.forEach((elem, index) => {
                const nome = elem.querySelector('.nome-escrito')?.textContent || 'Usuário';
                const foto = elem.querySelector('#nome img')?.src || 'imagens/foto_perfil.jpg';
                const comentario = elem.querySelector('.comentario')?.textContent?.trim() || '';
                const estrelasAtivas = elem.querySelectorAll('#container-estrela img[src*="estrela-ativa"]').length;
                
                if (comentario && comentario !== 'Comentário sobre o nutricionista') {
                    avaliacoes.push({
                        id: Date.now() + index,
                        nome: nome,
                        foto: foto,
                        comentario: comentario,
                        estrelas: estrelasAtivas,
                        usuarioId: 'existente_' + index
                    });
                }
            });
        }
        
        if (avaliacoes.length === 0) {
            containerAvaliacoes.innerHTML = '<section class="sem-avaliacoes"><p>Seja o primeiro a avaliar!</p></section>';
        } else {
            renderizarAvaliacoes();
        }
    }

    inicializar();
});