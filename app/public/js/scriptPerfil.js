document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');

    menuIcon.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
});

// conteúdo mobile

const publiSelector = document.getElementById('publi_selecionar');
const avaliarSelector = document.getElementById('avaliacao_selecionar');
const avaliacoes = document.getElementById('avaliar_nutri')
const publicacoes = document.getElementById('publi')

function clicarUm(){
    publiSelector.style.background = "none";
    publiSelector.style.color = "black";

    avaliarSelector.style.background = "green";
    avaliarSelector.style.color = "white";

    avaliacoes.style.display = 'block';
    publicacoes.style.display = 'none';
}

function clicarDois(){
    avaliarSelector.style.background = "none";
    avaliarSelector.style.color = "black";

    publiSelector.style.background = "green";
    publiSelector.style.color = "white";

    avaliacoes.style.display = 'none';
    publicacoes.style.display = 'grid';
}