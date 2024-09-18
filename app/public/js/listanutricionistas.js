document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const nutricionistas = {
        1: { nome: 'Julia Barros', especialidade: 'Nutrição Esportiva', imagem: 'imagens/profissional1.png', contato: { whatsapp: '(11) 12345-6789', instagram: '@julia_barros', email: 'julia@nutricionista.com' } },
        2: { nome: 'Roberta Santos', especialidade: 'Nutrição Clínica', imagem: 'imagens/profissional2.png', contato: { whatsapp: '(21) 98765-4321', instagram: '@roberta_santos', email: 'roberta@nutricionista.com' } },
        3: { nome: 'Flávia Flins', especialidade: 'Nutrição Estética', imagem: 'imagens/profissional3.png', contato: { whatsapp: '(31) 45678-1234', instagram: '@flavia_flins', email: 'flavia@nutricionista.com' } },
        4: { nome: 'Pablo Parron', especialidade: 'Nutrição Esportiva', imagem: 'imagens/profissional4.png', contato: { whatsapp: '(11) 42444-4978', instagram: '@pablo_parron', email: 'pablo@nutricionista.com' } }
    };

    const nutri = nutricionistas[id];

    if (nutri) {
        document.getElementById('foto-perfil').src = nutri.imagem;
        document.getElementById('nomenutri').textContent = nutri.nome;
        document.getElementById('tipo-nutri').textContent = nutri.especialidade;
        document.getElementById('whatsapp').textContent = nutri.contato.whatsapp;
        document.getElementById('instagram').textContent = nutri.contato.instagram;
        document.getElementById('email').textContent = nutri.contato.email;
    } else {
        document.getElementById('info_perfil').innerHTML = '<p>Nutricionista não encontrado.</p>';
    }
});