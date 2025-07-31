const inputComentario = document.getElementById('input-comentario');
const btnEnviar = document.getElementById('btn-enviar');
const listaComentarios = document.getElementById('comentarios-lista');
const textoSemComentarios = document.getElementById('sem-comentarios');

function enviarComentario() {
    const texto = inputComentario.value.trim();

    if (texto !== '') {
      textoSemComentarios.style.display = 'none';

      const novoComentario = document.createElement('section');
      novoComentario.classList.add('comentario');

      novoComentario.innerHTML = `
        <section class="comentario-topo">
            <img src="imagens/foto_perfil.jpg" alt="Foto de perfil" class="foto-perfil">
            <section class="comentario-header">
                <span class="nome-usuario">Você</span>
            </section>
            <section class="menu-denunciar-comentario">
                <span class="menu-pontos-comentarios">⋮</span>
                <section class="denunciar-comentario" style="display: none;">Denunciar</section>
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

btnEnviar.addEventListener('click', enviarComentario);

inputComentario.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      enviarComentario();
    }
});

const menuPontos = document.getElementById('menu-pontos');
const denunciarOpcao = document.getElementById('denunciar-opcao');

if (menuPontos && denunciarOpcao) {
    menuPontos.addEventListener('click', (e) => {
      e.stopPropagation();
      menuPontos.style.display = 'none';
      denunciarOpcao.style.display = 'inline-block';
    });
}

document.addEventListener('click', () => {
    if (menuPontos && denunciarOpcao) {
      menuPontos.style.display = 'inline-block';
      denunciarOpcao.style.display = 'none';
    }

document.querySelectorAll('.menu-denunciar-comentario').forEach(menu => {
      const ponto = menu.querySelector('.menu-pontos-comentarios');
      const denunciar = menu.querySelector('.denunciar-comentario');
      if (ponto && denunciar) {
        ponto.style.display = 'inline-block';
        denunciar.style.display = 'none';
      }
    });
});

function configurarMenuComentario(comentario) {
    const menuPontos = comentario.querySelector('.menu-pontos-comentarios');
    const denunciarOp = comentario.querySelector('.denunciar-comentario');

      if (menuPontos && denunciarOp) {
          menuPontos.addEventListener('click', (e) => {
              e.stopPropagation();
              menuPontos.style.display = 'none';
              denunciarOp.style.display = 'inline-block';
          });

          denunciarOp.addEventListener('click', (e) => {
      e.stopPropagation();

      const modalDenuncia = document.getElementById('modal-denuncia');
      if (modalDenuncia) {
          modalDenuncia.style.display = 'flex';
      }

      menuPontos.style.display = 'inline-block';
      denunciarOp.style.display = 'none';
});
    }
}

const btnFavorite = document.querySelector('.btn-favorite');
const btnComment = document.querySelector('.btn-comment');

btnFavorite.addEventListener('click', () => {
    btnFavorite.classList.toggle('ativo');
});

let comentariosVisiveis = false;

btnComment.addEventListener('click', () => {
    comentariosVisiveis = !comentariosVisiveis;
    listaComentarios.style.display = comentariosVisiveis ? 'block' : 'none';
});