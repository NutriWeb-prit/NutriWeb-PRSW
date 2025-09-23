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
        13: { imagem: 'imagens/profissional13.png'},
        14: { imagem: 'imagens/profissional14.png'},
        15: { imagem: 'imagens/profissional15.png'},
        16: { imagem: 'imagens/profissional16.png'},
        17: { imagem: 'imagens/profissional17.png'},
        18: { imagem: 'imagens/profissional18.png'},
        19: { imagem: 'imagens/profissional19.png'},
        20: { imagem: 'imagens/profissional20.png'},
        21: { imagem: 'imagens/profissional21.png'},
        22: { imagem: 'imagens/profissional22.png'},
        23: { imagem: 'imagens/profissional23.png'},
        24: { imagem: 'imagens/profissional24.jpg'},
        25: { imagem: 'imagens/profissional25.png'},
        26: { imagem: 'imagens/profissional26.png'},
        27: { imagem: 'imagens/profissional27.png'},
        28: { imagem: 'imagens/profissional28.png'},
        29: { imagem: 'imagens/profissional29.png'},
        30: { imagem: 'imagens/profissional30.png'},
        31: { imagem: 'imagens/profissional31.png'},
        32: { imagem: 'imagens/profissional32.png'},
        33: { imagem: 'imagens/profissional33.png'},
        34: { imagem: 'imagens/profissional34.png'},
        35: { imagem: 'imagens/profissional35.png'},
        36: { imagem: 'imagens/profissional36.png'},

    };

    if (id >=0 && id <= 36) {
        const nutri = nutricionistas[id];

        if (nutri) {
            document.getElementById('foto-perfil').src = nutri.imagem;
            document.getElementById('img-post').dataset.imgperfil = nutri.imagem;
        }
    }
});