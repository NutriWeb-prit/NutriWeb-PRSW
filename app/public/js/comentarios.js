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
            <span class="menu-pontos-comentarios">⋮</span>
        </section>
        <p class="texto-comentario">${texto}</p>
        `;

    listaComentarios.appendChild(novoComentario);

    inputComentario.value = '';
  }
}

btnEnviar.addEventListener('click', enviarComentario);

inputComentario.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    enviarComentario();
  }
});