document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const nutricionistas = {
        1: { nome: 'Julia Barros', especialidade: 'Nutrição Esportiva', imagem: 'imagens/profissional1.png', contato: { whatsapp: '(11) 12345-6789', instagram: '@julia_barros', email: 'julia@nutricionista.com', sobre: "Sou Júlia Barros, especialista em nutrição esportiva. Meu objetivo é ajudar você a melhorar seu desempenho e alcançar suas metas com uma alimentação estratégica. Vamos juntos rumo ao seu melhor!" } },
        2: { nome: 'Roberta Santos', especialidade: 'Nutrição Clínica', imagem: 'imagens/profissional2.png', contato: { whatsapp: '(21) 98765-4321', instagram: '@roberta_santos', email: 'roberta@nutricionista.com', sobre: "Me chamo Roberta Santos, nutricionista clínica. Trabalho para promover saúde e bem-estar, ajustando a alimentação para tratar e prevenir doenças. Cada pessoa é única, e estou aqui para te guiar nesse processo." } },
        3: { nome: 'Flávia Flins', especialidade: 'Nutrição Estética', imagem: 'imagens/profissional3.png', contato: { whatsapp: '(31) 45678-1234', instagram: '@flavia_flins', email: 'flavia@nutricionista.com', sobre: "Oi, sou Flávia Flins e minha missão é unir nutrição e estética. Vou te ajudar a melhorar sua pele, cabelos e autoestima com uma alimentação equilibrada. Beleza começa de dentro para fora!" } },
        4: { nome: 'Pablo Parron', especialidade: 'Nutrição Clínica', imagem: 'imagens/profissional4.png', contato: { whatsapp: '(11) 42444-4978', instagram: '@pablo_parron', email: 'pablo@nutricionista.com', sobre: "Sou Pablo Parron, nutricionista clínico. Acredito na alimentação como chave para uma vida saudável. Vou te ajudar a controlar doenças e melhorar sua saúde com soluções práticas e personalizadas." } }
    };

    const comentarios = {
        1: {nome1: 'Thiago', nome2: 'Beatriz', nome3: 'Eduardo', nome4: 'Rafaela', 
            comentario1: 'Depois que comecei a seguir as orientações da Júlia, minha resistência nas atividades físicas melhorou muito. Ela realmente entende do que faz!', 
            comentario2: 'Os resultados foram incríveis! Consegui ganhar massa muscular e melhorar minha performance nos treinos. A Júlia me deu todo o suporte que eu precisava.', 
            comentario3: 'Recomendo demais o trabalho da Júlia. Ela conseguiu adaptar minha dieta ao meu ritmo de treino de maneira perfeita.', 
            comentario4: 'Senti muita diferença no meu desempenho depois do plano alimentar que ela montou. Profissional super competente!'},

        2: {nome1: 'Fernanda', nome2: 'João Pedro', nome3: 'Camila', nome4: 'Renata', 
            comentario1: 'A Roberta foi essencial no processo de controle da minha diabetes. Ela me orientou de forma simples e eficiente.', 
            comentario2: 'Estou seguindo as recomendações da Roberta há alguns meses e já noto grandes mudanças na minha saúde. Excelente profissional!', 
            comentario3: 'Minha qualidade de vida melhorou muito desde que comecei a consulta com a Roberta. Ela é super atenciosa e cuidadosa.', 
            comentario4: 'Profissional muito dedicada! As orientações foram fundamentais para meu tratamento nutricional. Recomendo!'},
        
        3: {nome1: 'Isabela', nome2: 'Patrícia', nome3: 'Julia', nome4: 'Carolina', 
            comentario1: 'Com as dicas da Flávia, minha pele e cabelos nunca estiveram tão bonitos. Adorei o acompanhamento!', 
            comentario2: 'A Flávia é muito detalhista e conseguiu ajustar minha alimentação para que eu visse resultados rapidamente. Ótima experiência.', 
            comentario3: 'Super recomendo! O trabalho da Flávia realmente traz resultados estéticos visíveis. Estou muito feliz com o acompanhamento.', 
            comentario4: 'Gostei muito do atendimento e das orientações. Minha pele e unhas melhoraram bastante desde que comecei a seguir o plano alimentar.'},

        4: {nome1: 'André', nome2: 'Viviane', nome3: 'Rafael', nome4: 'Daniela', 
            comentario1: 'O Pablo me ajudou a equilibrar minha dieta e controlar melhor minha pressão arterial. Estou muito mais saudável!', 
            comentario2: 'Profissional excelente! As consultas com o Pablo fizeram toda a diferença na minha alimentação e saúde.', 
            comentario3: 'Graças ao acompanhamento do Pablo, consegui controlar minha alimentação e melhorar minha saúde geral. Recomendo muito!', 
            comentario4: 'O Pablo é super atencioso e conseguiu montar um plano alimentar que se encaixa perfeitamente nas minhas necessidades. Estou muito satisfeito!'}
    }

    const nutri = nutricionistas[id];

    const comentario = comentarios[id];

    if (nutri) {
        document.getElementById('foto-perfil').src = nutri.imagem;
        document.getElementById('nomenutri').textContent = nutri.nome;
        document.getElementById('tipo-nutri').textContent = nutri.especialidade;
        document.getElementById('whatsapp').textContent = nutri.contato.whatsapp;
        document.getElementById('instagram').textContent = nutri.contato.instagram;
        document.getElementById('email').textContent = nutri.contato.email;
        document.getElementById('sobremim').textContent = nutri.contato.sobre;
    } else {
        document.getElementById('info_perfil').innerHTML = '<p>Nutricionista não encontrado.</p>';
    }

    if (comentario) {
        document.getElementById('nome1').textContent = comentario.nome1;
        document.getElementById('nome2').textContent = comentario.nome2;
        document.getElementById('nome3').textContent = comentario.nome3;
        document.getElementById('nome4').textContent = comentario.nome4;
        document.getElementById('comentario1').textContent = comentario.comentario1;
        document.getElementById('comentario2').textContent = comentario.comentario2;
        document.getElementById('comentario3').textContent = comentario.comentario3;
        document.getElementById('comentario4').textContent = comentario.comentario4;
    } else {
        document.getElementById('info_perfil').innerHTML = '<p>Nutricionista não encontrado.</p>';
    }
});