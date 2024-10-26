function showModal(cardId) {
    const postImages = {
        1: 'imagens/img-login.jpg',
        2: 'imagens/img-post-whey.jpg',
        3: 'imagens/img-post-frutas.jfif',
        4: 'imagens/img-post-kiwi.jpg'
    };

    const imageUrl = postImages[cardId];
    document.getElementById('modal-img').src = imageUrl;

    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    // Oculta o modal
    document.getElementById('modal').style.display = 'none';
}
