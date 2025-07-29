const botoes = document.querySelectorAll('.btn-denuncia');
const textarea = document.querySelector('.modal-content-denuncia textarea');
const btnEnviarDenuncia = document.querySelector('.btn-enviar-denuncia');
const btnFecharDenuncia = document.querySelector('.close-denuncia');
const denunciaModal = document.getElementById('modal-denuncia');

const formDenuncia = document.querySelector('.modal-content-denuncia');
const mensagemConfirmacao = document.querySelector('.mensagem-confirmacao');

const botoesAbrirDenuncia = document.querySelectorAll('.menu-pontos');

function mostrarBotoesAbrir() {
    botoesAbrirDenuncia.forEach(b => {
        b.style.display = 'flex';
    });
}

function esconderBotoesAbrir() {
    botoesAbrirDenuncia.forEach(b => {
        b.style.display = 'none';
    });
}

botoes.forEach(btn => {
    btn.addEventListener('click', () => {
        botoes.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        textarea.value = '';
    });
});

textarea.addEventListener('focus', () => {
    botoes.forEach(b => b.classList.remove('selected'));
});

btnEnviarDenuncia.addEventListener('click', () => {
    const texto = textarea.value.trim();
    const algumSelecionado = [...botoes].some(btn => btn.classList.contains('selected'));

    if (texto !== '' || algumSelecionado) {
        formDenuncia.style.display = 'none';
        mensagemConfirmacao.style.display = 'block';

        textarea.value = '';
        botoes.forEach(b => b.classList.remove('selected'));
    } else {
        // alert('Por favor, selecione um motivo ou escreva um.');
    }
});

function fecharModalDenuncia() {
    textarea.value = '';
    botoes.forEach(b => b.classList.remove('selected'));

    mensagemConfirmacao.style.display = 'none';
    formDenuncia.style.display = 'block';

    denunciaModal.style.display = 'none';

    esconderBotoesAbrir();
}

btnFecharDenuncia.addEventListener('click', fecharModalDenuncia);

const btnFecharMsg = document.querySelector('.mensagem-confirmacao .fechar-msg');
btnFecharMsg.addEventListener('click', () => {
    mensagemConfirmacao.style.display = 'none';
    fecharModalDenuncia();
});