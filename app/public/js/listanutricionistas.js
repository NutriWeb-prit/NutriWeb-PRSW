document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const nutricionistas = {
        1: { imagem: 'imagens/profissional1.png'},
        2: { imagem: 'imagens/profissional2.png'},
        3: { imagem: 'imagens/profissional3.png'},
        4: { imagem: 'imagens/profissional4.png'},
        5: { imagem: 'imagens/profissional5.png'},
        6: { imagem: 'imagens/profissional6.png'},
        7: { imagem: 'imagens/profissional7.png'},
        8: { imagem: 'imagens/profissional8.jpg'},
        9: { imagem: 'imagens/profissional9.png'},
        10: { imagem: 'imagens/profissional10.png'},
        11: { imagem: 'imagens/profissional11.png'},
        12: { imagem: 'imagens/profissional12.png'},
    };

    if (id >=0 && id <= 12) {
        const nutri = nutricionistas[id];

        if (nutri) {
            document.getElementById('foto-perfil').src = nutri.imagem;
        }
    }
});