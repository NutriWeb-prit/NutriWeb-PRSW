document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.content-img');
    const modal = document.getElementById('modal');
    const closeButton = document.getElementById('close-modal');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            modal.style.display = 'flex'; 
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

const cards = document.querySelectorAll('.card');
const modal = document.getElementById('modal');
const closeModal = document.getElementById('close-modal');

const modalImg = document.querySelectorAll('#modal-img');
const modalProfile = document.getElementById('modal-profile');
const modalName = document.getElementById('modal-name');
const modalProfession = document.querySelector('.modal-card .profession');
const modalDescription = document.querySelector('.modal-description');
const modalLink = document.querySelector('.card-perfil-modal');

cards.forEach(card => {
    card.addEventListener('click', () => {
        const id = card.dataset.id;
        const nome = card.dataset.nome;
        const profissao = card.dataset.profissao;
        const imgPerfil = card.dataset.imgperfil;
        const imgConteudo = card.dataset.imgconteudo;
        const titulo = card.dataset.titulo;
        const conteudo1 = card.dataset.conteudo1;
        const subtitulo1 = card.dataset.subtitulo1;
        const conteudo2 = card.dataset.conteudo2;
        const subtitulo2 = card.dataset.subtitulo2;
        const conteudo3 = card.dataset.conteudo3;

        modalImg.forEach(img => img.src = imgConteudo);

        modalProfile.src = imgPerfil;
        modalName.textContent = nome;
        modalProfession.textContent = profissao;
        modalLink.href = `/perfilnutri?id=${id}`;

        modalDescription.innerHTML = `
            <h2>${titulo}</h2>
            <p>${conteudo1}</p>
            <h3>${subtitulo1}</h3>
            <p>${conteudo2}</p>
            <h3>${subtitulo2}</h3>
            <p>${conteudo3}</p>
        `;

        modal.style.display = 'flex';
    });
});

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});