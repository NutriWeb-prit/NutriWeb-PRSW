const usuarioLogado = typeof headerUsuario !== 'undefined' && headerUsuario.estaLogado;
const dadosUsuario = usuarioLogado ? headerUsuario : null;

const inputComentario = document.getElementById('input-comentario');
const btnEnviar = document.getElementById('btn-enviar');
const listaComentarios = document.getElementById('comentarios-lista');
const textoSemComentarios = document.getElementById('sem-comentarios');
const btnFavorite = document.querySelector('.btn-favorite');
const btnComment = document.querySelector('.btn-comment');

let comentarioSendoDenunciado = null;
window.comentarioSendoDenunciado = null;

function verificarAutenticacao(acao) {
    if (!usuarioLogado) {
        alert(`Você precisa estar logado para ${acao}!`);
        window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
        return false;
    }
    return true;
}

function adicionarComentarioInicial() {
    textoSemComentarios.style.display = 'none';
    
    const comentarioInicial = document.createElement('section');
    comentarioInicial.classList.add('comentario');
    comentarioInicial.dataset.usuarioId = '1';
    
    comentarioInicial.innerHTML = `
        <section class="comentario-topo">
            <img src="imagens/foto-exemplo-comentario.jpg" alt="Foto de perfil" class="foto-perfil" 
                 onerror="this.src='imagens/foto_perfil.jpg'">
            <section class="comentario-header">
                <section class="nome-usuario">Luis Henrique</section>
            </section>
            <section class="menu-denunciar-comentario">
                <section class="menu-pontos-comentarios">⋮</section>
                <section class="opcoes-comentario" style="display: none;">
                    <section class="denunciar-comentario">Denunciar</section>
                </section>
            </section>
        </section>
        <p class="texto-comentario">Que post maravilhoso! ❤️</p>
    `;
    
    listaComentarios.appendChild(comentarioInicial);
    configurarMenuComentario(comentarioInicial);
    listaComentarios.style.display = 'block';
}

function enviarComentario() {
    if (!verificarAutenticacao('comentar')) {
        return;
    }

    const texto = inputComentario.value.trim();
    
    if (texto !== '') {
        textoSemComentarios.style.display = 'none';
        
        const novoComentario = document.createElement('section');
        novoComentario.classList.add('comentario');
        novoComentario.dataset.usuarioId = dadosUsuario.id;
        
        const fotoPerfil = dadosUsuario.fotoPerfil || 'imagens/foto_perfil.jpg';
        const nomeUsuario = dadosUsuario.nome || 'Usuário';
        
        novoComentario.innerHTML = `
            <section class="comentario-topo">
                <img src="${fotoPerfil}" alt="Foto de perfil" class="foto-perfil" 
                     onerror="this.src='imagens/foto_perfil.jpg'">
                <section class="comentario-header">
                    <section class="nome-usuario">${nomeUsuario}</section>
                </section>
                <section class="menu-denunciar-comentario">
                    <section class="menu-pontos-comentarios">⋮</section>
                    <section class="opcoes-comentario" style="display: none;">
                        <section class="apagar-comentario">Apagar</section>
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

const menuPontos = document.getElementById('menu-pontos');
const denunciarOpcao = document.getElementById('denunciar-opcao');

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
        
        window.comentarioSendoDenunciado = null; 
        const modalDenuncia = document.getElementById('modal-denuncia');
        if (modalDenuncia) {
            modalDenuncia.style.display = 'flex';
        }
        
        menuPontos.style.display = 'inline-block';
        denunciarOpcao.style.display = 'none';
    });
}

document.addEventListener('click', () => {
    if (menuPontos && denunciarOpcao) {
        menuPontos.style.display = 'inline-block';
        denunciarOpcao.style.display = 'none';
    }
    
    document.querySelectorAll('.menu-denunciar-comentario').forEach(menu => {
        const ponto = menu.querySelector('.menu-pontos-comentarios');
        const opcoes = menu.querySelector('.opcoes-comentario');
        if (ponto && opcoes) {
            ponto.style.display = 'inline-block';
            opcoes.style.display = 'none';
        }
    });
});

function configurarMenuComentario(comentario) {
    const menuPontos = comentario.querySelector('.menu-pontos-comentarios');
    const opcoesMenu = comentario.querySelector('.opcoes-comentario');
    const usuarioComentarioId = comentario.dataset.usuarioId;
    
    if (menuPontos && opcoesMenu) {
        menuPontos.addEventListener('click', (e) => {
            e.stopPropagation();
            
            document.querySelectorAll('.opcoes-comentario').forEach(menu => {
                if (menu !== opcoesMenu) {
                    menu.style.display = 'none';
                }
            });
            
            menuPontos.style.display = 'none';
            opcoesMenu.style.display = 'block';
        });
        
        const btnDenunciar = opcoesMenu.querySelector('.denunciar-comentario');
        if (btnDenunciar) {
            btnDenunciar.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (!verificarAutenticacao('denunciar')) {
                    return;
                }
                
                window.comentarioSendoDenunciado = comentario;
                
                const modalDenuncia = document.getElementById('modal-denuncia');
                if (modalDenuncia) {
                    modalDenuncia.style.display = 'flex';
                }
                
                menuPontos.style.display = 'inline-block';
                opcoesMenu.style.display = 'none';
            });
        }
        
        const btnApagar = opcoesMenu.querySelector('.apagar-comentario');
        if (btnApagar) {
            btnApagar.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (confirm('Tem certeza que deseja apagar este comentário?')) {
                    comentario.remove();
                    
                    const comentariosRestantes = listaComentarios.querySelectorAll('.comentario');
                    if (comentariosRestantes.length === 0) {
                        textoSemComentarios.style.display = 'block';
                    }
                }
                
                menuPontos.style.display = 'inline-block';
                opcoesMenu.style.display = 'none';
            });
        }
    }
}

if (btnFavorite) {
    btnFavorite.addEventListener('click', () => {
        if (!verificarAutenticacao('curtir')) {
            return;
        }
        
        btnFavorite.classList.toggle('ativo');
    });
}

let comentariosVisiveis = false;

if (btnComment) {
    btnComment.addEventListener('click', () => {
        comentariosVisiveis = !comentariosVisiveis;
        listaComentarios.style.display = comentariosVisiveis ? 'block' : 'none';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    adicionarComentarioInicial();
});