document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.content-img');
    const modal = document.getElementById('modal');
    const closeButton = document.getElementById('close-modal');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            modal.style.display = 'flex'; 
            document.body.classList.add("body-no-scroll");
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove("body-no-scroll");
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove("body-no-scroll");
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const posts = document.querySelectorAll('.img-post');
    const modal = document.getElementById('modal-publicacao');
    const closeButton = document.getElementById('close-modal');

    posts.forEach(posts => {
        posts.addEventListener('click', () => {
            modal.style.display = 'flex';
            document.body.classList.add("body-no-scroll");
        });
    });

    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        document.body.classList.remove("body-no-scroll");
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.classList.remove("body-no-scroll");
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

document.addEventListener('DOMContentLoaded', function () {
    const posts = document.querySelectorAll('.post_img');
    const modal = document.getElementById('modal-publicacao');
    const closeModal = document.getElementById('close-modal');

    const modalImg = document.querySelectorAll('#modal-img');
    const modalProfile = document.getElementById('modal-profile');
    const modalName = document.getElementById('modal-name');
    const modalProfession = document.querySelector('.modal-card-publicacao .profession');
    const modalDescription = document.querySelector('.modal-description-publicacao');
    const modalLink = document.querySelector('.card-perfil-modal');

    posts.forEach(post => {
        post.addEventListener('click', () => {
            const imgConteudo = post.dataset.imgconteudo;
            const imgPerfil = post.dataset.imgperfil;
            const nome = post.dataset.nome;
            const profissao = post.dataset.profissao;
            const id = post.dataset.id;
            const titulo = post.dataset.titulo;
            const conteudo1 = post.dataset.conteudo1;
            const subtitulo1 = post.dataset.subtitulo1;
            const conteudo2 = post.dataset.conteudo2;
            const subtitulo2 = post.dataset.subtitulo2;
            const conteudo3 = post.dataset.conteudo3;

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

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

const btnDenunciar = document.getElementById("denunciar-opcao");
const modalDenuncia = document.getElementById("modal-denuncia");
const fecharDenuncia = document.getElementById("close-denuncia");

btnDenunciar.addEventListener("click", () => {
    modalDenuncia.style.display = "flex";
});

fecharDenuncia.addEventListener("click", () => {
    modalDenuncia.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target === modalDenuncia) {
        modalDenuncia.style.display = "none";
    }
});