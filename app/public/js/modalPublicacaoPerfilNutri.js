document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = typeof headerUsuario !== 'undefined' && headerUsuario.estaLogado;
    const dadosUsuario = usuarioLogado ? headerUsuario : null;

    const posts = document.querySelectorAll('.img-post, .post_img');
    const modal = document.getElementById('modal-publicacao');
    const closeModal = document.getElementById('close-modal-publicacao');
    
    const modalImg = document.getElementById('modal-img');
    const modalImgMobile = document.getElementById('modal-img-mobile');
    const modalProfile = document.getElementById('modal-profile');
    const modalName = document.getElementById('modal-name');
    const modalProfession = document.querySelector('.modal-card-publicacao .profession');
    const modalDescription = document.querySelector('.modal-description-publicacao');
    const modalLink = document.querySelector('.card-perfil-modal');

    const inputComentario = document.getElementById('input-comentario-publicacao');
    const btnEnviar = document.getElementById('btn-enviar-publicacao');
    const listaComentarios = document.getElementById('comentarios-lista-publicacao');
    const textoSemComentarios = document.getElementById('sem-comentarios-publicacao');
    
    const btnFavorite = document.querySelector('.btn-favorite');
    const btnComment = document.querySelector('.btn-comment');
    
    const menuPontos = document.getElementById('menu-pontos');
    const denunciarOpcao = document.getElementById('denunciar-opcao');
    const modalDenuncia = document.getElementById('modal-denuncia-publicacao');
    const btnFecharDenuncia = document.getElementById('close-denuncia-publicacao');
    const formDenuncia = modalDenuncia?.querySelector('.modal-content-denuncia');
    const mensagemConfirmacao = modalDenuncia?.querySelector('.mensagem-confirmacao');
    const btnEnviarDenuncia = modalDenuncia?.querySelector('.btn-enviar-denuncia');
    const btnFecharMsg = modalDenuncia?.querySelector('.fechar-msg');
    const botoesMotivoDenuncia = modalDenuncia?.querySelectorAll('.btn-denuncia');
    const textareaDenuncia = modalDenuncia?.querySelector('textarea');

    let comentariosVisiveis = false;
    let comentarioSendoDenunciado = null;

    function verificarAutenticacao(acao) {
        if (!usuarioLogado) {
            alert(`Você precisa estar logado para ${acao}!`);
            window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    }

    posts.forEach(post => {
        post.addEventListener('click', function(e) {
            e.preventDefault();
            
            let elemento = this;
            
            if (this.tagName === 'IMG') {
                elemento = this.closest('.img-post, .card');
            }
            
            if (!elemento || !elemento.dataset) {
                console.error('Elemento sem dados encontrado:', elemento);
                return;
            }

            const imgConteudo = elemento.dataset.imgconteudo || '';
            const imgPerfil = elemento.dataset.imgperfil || 'imagens/foto_perfil.jpg';
            const nome = elemento.dataset.nome || 'Nutricionista';
            const profissao = elemento.dataset.profissao || 'Nutricionista';
            const id = elemento.dataset.id || '1';
            const titulo = elemento.dataset.titulo || 'Publicação';
            const conteudo1 = elemento.dataset.conteudo1 || '';
            const subtitulo1 = elemento.dataset.subtitulo1 || '';
            const conteudo2 = elemento.dataset.conteudo2 || '';
            const subtitulo2 = elemento.dataset.subtitulo2 || '';
            const conteudo3 = elemento.dataset.conteudo3 || '';

            if (modalImg && imgConteudo) modalImg.src = imgConteudo;
            if (modalImgMobile && imgConteudo) modalImgMobile.src = imgConteudo;
            
            if (modalProfile && imgPerfil) modalProfile.src = imgPerfil;
            if (modalName) modalName.textContent = nome;
            if (modalProfession) modalProfession.textContent = profissao;
            if (modalLink) modalLink.href = `/perfilnutri?id=${id}`;

            if (modalDescription) {
                let htmlContent = '';
                
                if (titulo) htmlContent += `<h2>${titulo}</h2>`;
                if (conteudo1) htmlContent += `<p>${conteudo1}</p>`;
                if (subtitulo1) htmlContent += `<h3>${subtitulo1}</h3>`;
                if (conteudo2) htmlContent += `<p>${conteudo2}</p>`;
                if (subtitulo2) htmlContent += `<h3>${subtitulo2}</h3>`;
                if (conteudo3) htmlContent += `<p>${conteudo3}</p>`;
                
                modalDescription.innerHTML = htmlContent || '<p>Sem descrição disponível.</p>';
            }

            resetarModal();
            adicionarComentarioInicial();
            
            modal.style.display = 'flex';
            document.body.classList.add('body-no-scroll');
        });
    });

    if (closeModal) {
        closeModal.addEventListener('click', fecharModalPublicacao);
    }

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            fecharModalPublicacao();
        }
    });

    function fecharModalPublicacao() {
        modal.style.display = 'none';
        document.body.classList.remove('body-no-scroll');
        resetarModal();
    }

    function resetarModal() {
        if (btnFavorite) {
            btnFavorite.classList.remove('ativo');
        }
        
        if (listaComentarios) {
            listaComentarios.innerHTML = '';
            listaComentarios.style.display = 'none';
        }
        
        comentariosVisiveis = false;
        comentarioSendoDenunciado = null;
        
        if (inputComentario) {
            inputComentario.value = '';
        }
        
        if (menuPontos) menuPontos.style.display = 'inline-block';
        if (denunciarOpcao) denunciarOpcao.style.display = 'none';
    }

    function adicionarComentarioInicial() {
        if (!listaComentarios) return;
        
        const comentarioInicial = document.createElement('section');
        comentarioInicial.classList.add('comentario-publicacao');
        comentarioInicial.dataset.usuarioId = '999';
        
        comentarioInicial.innerHTML = `
            <section class="comentario-topo">
                <img src="imagens/foto-exemplo-comentario.jpg" alt="Foto de perfil" class="foto-perfil" 
                     onerror="this.src='imagens/foto_perfil.jpg'">
                <section class="comentario-header">
                    <span class="nome-usuario">Luis Henrique</span>
                </section>
                <section class="menu-denunciar-comentario">
                    <span class="menu-pontos-comentarios">⋮</span>
                    <section class="opcoes-comentario" style="display: none;">
                        <span class="denunciar-comentario">Denunciar</span>
                    </section>
                </section>
            </section>
            <p class="texto-comentario">Que post maravilhoso! ❤️</p>
        `;
        
        listaComentarios.appendChild(comentarioInicial);
        configurarMenuComentario(comentarioInicial);
        listaComentarios.style.display = 'block';
    }

    if (btnFavorite) {
        btnFavorite.addEventListener('click', () => {
            if (!verificarAutenticacao('curtir')) {
                return;
            }
            btnFavorite.classList.toggle('ativo');
        });
    }

    if (btnComment) {
        btnComment.addEventListener('click', () => {
            comentariosVisiveis = !comentariosVisiveis;
            if (listaComentarios) {
                listaComentarios.style.display = comentariosVisiveis ? 'block' : 'none';
            }
        });
    }

    function enviarComentario() {
        if (!verificarAutenticacao('comentar')) {
            return;
        }

        if (!inputComentario || !listaComentarios) return;
        
        const texto = inputComentario.value.trim();
        if (texto !== '') {
            const semComentarios = listaComentarios.querySelector('.sem-comentarios');
            if (semComentarios) {
                semComentarios.remove();
            }

            const fotoPerfil = dadosUsuario.fotoPerfil || 'imagens/foto_perfil.jpg';
            const nomeUsuario = dadosUsuario.nome || 'Usuário';

            const novoComentario = document.createElement('section');
            novoComentario.classList.add('comentario-publicacao');
            novoComentario.dataset.usuarioId = dadosUsuario.id;
            
            novoComentario.innerHTML = `
                <section class="comentario-topo">
                    <img src="${fotoPerfil}" alt="Foto de perfil" class="foto-perfil" 
                         onerror="this.src='imagens/foto_perfil.jpg'">
                    <section class="comentario-header">
                        <span class="nome-usuario">${nomeUsuario}</span>
                    </section>
                    <section class="menu-denunciar-comentario">
                        <span class="menu-pontos-comentarios">⋮</span>
                        <section class="opcoes-comentario" style="display: none;">
                            <span class="apagar-comentario">Apagar</span>
                        </section>
                    </section>
                </section>
                <p class="texto-comentario">${texto}</p>
            `;
            
            listaComentarios.appendChild(novoComentario);
            configurarMenuComentario(novoComentario);
            
            inputComentario.value = '';
            listaComentarios.style.display = 'block';
            comentariosVisiveis = true;
        }
    }

    if (btnEnviar) {
        btnEnviar.addEventListener('click', enviarComentario);
    }

    if (inputComentario) {
        inputComentario.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                enviarComentario();
            }
        });

        inputComentario.addEventListener('focus', () => {
            if (!verificarAutenticacao('comentar')) {
                inputComentario.blur();
            }
        });
    }

    if (menuPontos && denunciarOpcao) {
        menuPontos.addEventListener('click', (e) => {
            e.stopPropagation();
            menuPontos.style.display = 'none';
            denunciarOpcao.style.display = 'inline-block';
        });

        denunciarOpcao.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (!verificarAutenticacao('denunciar')) {
                return;
            }

            comentarioSendoDenunciado = null;
            
            if (modalDenuncia) {
                modalDenuncia.style.display = 'flex';
            }
            menuPontos.style.display = 'inline-block';
            denunciarOpcao.style.display = 'none';
        });
    }

    document.addEventListener('click', () => {
        if (menuPontos) menuPontos.style.display = 'inline-block';
        if (denunciarOpcao) denunciarOpcao.style.display = 'none';

        document.querySelectorAll('.menu-denunciar-comentario').forEach(menu => {
            const ponto = menu.querySelector('.menu-pontos-comentarios');
            const opcoes = menu.querySelector('.opcoes-comentario');
            if (ponto) ponto.style.display = 'inline-block';
            if (opcoes) opcoes.style.display = 'none';
        });
    });

    function configurarMenuComentario(comentario) {
        const menuPontosComentario = comentario.querySelector('.menu-pontos-comentarios');
        const opcoesMenu = comentario.querySelector('.opcoes-comentario');
        const usuarioComentarioId = comentario.dataset.usuarioId;

        if (menuPontosComentario && opcoesMenu) {
            menuPontosComentario.addEventListener('click', (e) => {
                e.stopPropagation();
                
                document.querySelectorAll('.opcoes-comentario').forEach(menu => {
                    if (menu !== opcoesMenu) {
                        menu.style.display = 'none';
                    }
                });
                
                menuPontosComentario.style.display = 'none';
                opcoesMenu.style.display = 'block';
            });

            const btnDenunciar = opcoesMenu.querySelector('.denunciar-comentario');
            if (btnDenunciar) {
                btnDenunciar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (!verificarAutenticacao('denunciar')) {
                        return;
                    }

                    comentarioSendoDenunciado = comentario;
                    
                    if (modalDenuncia) {
                        modalDenuncia.style.display = 'flex';
                    }
                    menuPontosComentario.style.display = 'inline-block';
                    opcoesMenu.style.display = 'none';
                });
            }

            const btnApagar = opcoesMenu.querySelector('.apagar-comentario');
            if (btnApagar) {
                btnApagar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    if (confirm('Tem certeza que deseja apagar este comentário?')) {
                        comentario.remove();
                        
                        const comentariosRestantes = listaComentarios.querySelectorAll('.comentario-publicacao');
                        if (comentariosRestantes.length === 0) {
                            listaComentarios.innerHTML = '<p class="sem-comentarios">Seja o primeiro a comentar!</p>';
                        }
                    }
                    
                    menuPontosComentario.style.display = 'inline-block';
                    opcoesMenu.style.display = 'none';
                });
            }
        }
    }

   if (botoesMotivoDenuncia) {
        botoesMotivoDenuncia.forEach(btn => {
            btn.addEventListener('click', () => {
                botoesMotivoDenuncia.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                if (textareaDenuncia) textareaDenuncia.value = '';
            });
        });
    }

    if (textareaDenuncia) {
        textareaDenuncia.addEventListener('focus', () => {
            botoesMotivoDenuncia.forEach(b => b.classList.remove('selected'));
        });
    }

    function enviarDenuncia() {
        if (!textareaDenuncia || !formDenuncia || !mensagemConfirmacao) return;
        
        const texto = textareaDenuncia.value.trim();
        const algumSelecionado = [...botoesMotivoDenuncia].some(btn => btn.classList.contains('selected'));

        if (texto !== '' || algumSelecionado) {
            let tipoDenuncia = comentarioSendoDenunciado ? 'comentario' : 'post';
            
            console.log('Denúncia enviada:', {
                tipo: tipoDenuncia,
                comentarioId: comentarioSendoDenunciado?.dataset.usuarioId || null,
                motivo: texto || [...botoesMotivoDenuncia].find(btn => btn.classList.contains('selected'))?.textContent
            });

            formDenuncia.style.display = 'none';
            mensagemConfirmacao.style.display = 'block';
            textareaDenuncia.value = '';
            botoesMotivoDenuncia.forEach(b => b.classList.remove('selected'));
            
            comentarioSendoDenunciado = null;
        } else {
            alert('Por favor, selecione um motivo ou escreva um.');
        }
    }

    if (btnEnviarDenuncia) {
        btnEnviarDenuncia.addEventListener('click', enviarDenuncia);
    }

    if (modalDenuncia) {
        modalDenuncia.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                enviarDenuncia();
            }
        });
    }

    function fecharModalDenuncia() {
        if (!modalDenuncia) return;
        
        if (textareaDenuncia) textareaDenuncia.value = '';
        if (botoesMotivoDenuncia) {
            botoesMotivoDenuncia.forEach(b => b.classList.remove('selected'));
        }
        if (mensagemConfirmacao) mensagemConfirmacao.style.display = 'none';
        if (formDenuncia) formDenuncia.style.display = 'block';
        modalDenuncia.style.display = 'none';
        
        comentarioSendoDenunciado = null;
    }

    if (btnFecharDenuncia) {
        btnFecharDenuncia.addEventListener('click', fecharModalDenuncia);
    }

    if (btnFecharMsg) {
        btnFecharMsg.addEventListener('click', () => {
            if (mensagemConfirmacao) mensagemConfirmacao.style.display = 'none';
            fecharModalDenuncia();
        });
    }

    window.addEventListener('click', (event) => {
        if (event.target === modalDenuncia) {
            fecharModalDenuncia();
        }
    });
});