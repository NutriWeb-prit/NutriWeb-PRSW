document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const nutricionistas = {
        1: { nome: 'Julia Barros', especialidade: 'Nutrição Esportiva', imagem: 'imagens/profissional1.png', contato: { whatsapp: '(11) 12345-6789', instagram: '@julia_barros', email: 'julia@nutricionista.com', sobre: "Sou Júlia Barros, especialista em nutrição esportiva. Meu objetivo é ajudar você a melhorar seu desempenho e alcançar suas metas com uma alimentação estratégica. Vamos juntos rumo ao seu melhor!" } },
        2: { nome: 'Roberta Santos', especialidade: 'Nutrição Clínica', imagem: 'imagens/profissional2.png', contato: { whatsapp: '(21) 98765-4321', instagram: '@roberta_santos', email: 'roberta@nutricionista.com', sobre: "Me chamo Roberta Santos, nutricionista clínica. Trabalho para promover saúde e bem-estar, ajustando a alimentação para tratar e prevenir doenças. Cada pessoa é única, e estou aqui para te guiar nesse processo." } },
        3: { nome: 'Flávia Flins', especialidade: 'Nutrição Estética', imagem: 'imagens/profissional3.png', contato: { whatsapp: '(31) 45678-1234', instagram: '@flavia_flins', email: 'flavia@nutricionista.com', sobre: "Oi, sou Flávia Flins e minha missão é unir nutrição e estética. Vou te ajudar a melhorar sua pele, cabelos e autoestima com uma alimentação equilibrada. Beleza começa de dentro para fora!" } },
        4: { nome: 'Pablo Parron', especialidade: 'Nutrição Clínica', imagem: 'imagens/profissional4.png', contato: { whatsapp: '(11) 42444-4978', instagram: '@pablo_parron', email: 'pablo@nutricionista.com', sobre: "Sou Pablo Parron, nutricionista clínico. Acredito na alimentação como chave para uma vida saudável. Vou te ajudar a controlar doenças e melhorar sua saúde com soluções práticas e personalizadas." } },
        5: { nome: 'Sophia Silva', especialidade: 'Nutrição Estética', imagem: 'imagens/profissional5.png', contato: { whatsapp: '(11) 84762-3462', instagram: '@sophia_silva', email: 'sophia@nutricionista.com', sobre: "Oi! Eu sou Sophia Silva, nutricionista estética. Acredito que a beleza vem de dentro para fora. Com uma alimentação personalizada, vou ajudar você a alcançar uma pele radiante, cabelo saudável e um corpo equilibrado. Vamos realçar sua beleza." } },
        6: { nome: 'Camila Ocanã', especialidade: 'Nutrição Estética', imagem: 'imagens/profissional6.png', contato: { whatsapp: '(18) 78267-0918 ', instagram: '@camila_ocana', email: 'camila@nutricionista.com', sobre: "Oi! Eu sou Camila Ocanã, nutricionista estética. Com um enfoque holístico e individualizado, vou te guiar na busca pela harmonia entre saúde, beleza e bem-estar. Juntas, vamos realçar sua melhor versão através da nutrição!" } },
        7: { nome: 'Agatha Matos', especialidade: 'Nutrição Estética', imagem: 'imagens/profissional7.png', contato: { whatsapp: '(37) 83714-1134', instagram: '@agatha_matos', email: 'agatha@nutricionista.com', sobre: "Olá! Eu sou Agatha Matos, nutricionista estética. Meu propósito é transformar sua relação com a alimentação, promovendo saúde e autoestima através de um plano nutricional adaptado às suas necessidades. Vamos cuidar do seu corpo de maneira equilibrada e eficaz!" } },
        8: { nome: 'Roberto Carlos', especialidade: 'Nutrição Esportiva', imagem: 'imagens/profissional8.jpg', contato: { whatsapp: '(54) 24525-2938 ', instagram: '@roberto_carlos', email: 'roberto@nutricionista.com', sobre: "Olá! Eu sou Roberto Carlos, nutricionista esportivo. Minha missão é potencializar sua performance através de uma alimentação planejada e ajustada às suas necessidades. Juntos, vamos alcançar seus objetivos com mais energia e saúde!" } },
        9: { nome: 'Mariana Alves', especialidade: 'Nutrição Esportiva', imagem: 'imagens/profissional9.png', contato: { whatsapp: '(21) 87264-0817 ', instagram: '@mariana_alves', email: 'mariana@nutricionista.com', sobre: "Oi! Eu sou Mariana Alves, nutricionista Esportiva. Meu objetivo é transformar sua saúde e bem-estar através de uma alimentação equilibrada e personalizada. Vamos encontrar juntos a melhor versão de você!" } },
        10: { nome: 'Lucas Mendes', especialidade: 'Nutrição Clínica', imagem: 'imagens/profissional10.png', contato: { whatsapp: '(73) 56535-2746 ', instagram: '@lucas_mendes', email: 'lucas@nutricionista.com', sobre: "Olá! Sou Lucas Mendes, nutricionista clínico. Meu foco é ajudar você a prevenir e tratar doenças por meio de uma alimentação equilibrada e adequada. Saúde é prioridade, e estou aqui para orientar você nesse caminho!" } },
        11: { nome: 'Carla Souza', especialidade: 'Nutrição Clínica', imagem: 'imagens/profissional11.png', contato: { whatsapp: '(43) 76452-2938 ', instagram: '@carla_souza', email: 'carla@nutricionista.com', sobre: "Prazer, sou Carla Souza, especialista em nutrição clínica. Quero ajudar você a garantir uma nutrição adequada para sua vida, criando hábitos saudáveis que vão durar para a vida toda!" } },
        12: { nome: 'Renata Dias', especialidade: 'Nutrição Esportiva', imagem: 'imagens/profissional12.png', contato: { whatsapp: '(34) 91767-3918', instagram: '@renata_dias', email: 'renata@nutricionista.com', sobre: "Eu sou Renata Dias, especializado em nutrição esportiva de alta performance. Se você é um atleta ou busca otimizar seu rendimento, estou aqui para ajustar sua alimentação e levar você ao seu máximo potencial." } },
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
            comentario4: 'O Pablo é super atencioso e conseguiu montar um plano alimentar que se encaixa perfeitamente nas minhas necessidades. Estou muito satisfeito!'},

        5: {nome1: 'Letícia', nome2: 'Arthur', nome3: 'Pedro', nome4: 'Kaique', 
            comentario1: 'Graças à Sophia, consegui melhorar minha digestão e atingir meus objetivos de forma saudável!', 
            comentario2: 'Com o plano nutricional da Sophia, minha energia e performance no treino aumentaram muito!', 
            comentario3: 'Sophia me ajudou a entender melhor meu corpo e a ter uma alimentação equilibrada, sem restrições excessivas.', 
            comentario4: 'A Sophia trouxe uma abordagem personalizada que fez toda a diferença na minha saúde.'},

        6: {nome1: 'Daniel', nome2: 'Jeanete', nome3: 'Lidia', nome4: 'Anderson', 
            comentario1: 'Adorei o atendimento da Camila, ela transformou minha relação com a comida.', 
            comentario2: 'Com o suporte da Camila, consegui reduzir meu percentual de gordura sem abrir mão dos alimentos que gosto.', 
            comentario3: 'Camila fez um plano focado nas minhas necessidades, e os resultados foram incríveis!', 
            comentario4: 'Camila foi muito atencioso e me ajudou a atingir minhas metas esportivas de forma saudável.'},

        7: {nome1: 'Márcio', nome2: 'Giovani', nome3: 'Joel', nome4: 'Renato', 
            comentario1: 'Com a Agatha, aprendi a fazer escolhas inteligentes que melhoraram minha saúde e estética.', 
            comentario2: 'Agatha entende muito de nutrição esportiva, e sua orientação foi essencial para minha performance.', 
            comentario3: 'Agatha montou um plano nutricional focado em melhorar minha pele e disposição, e funcionou muito bem!', 
            comentario4: 'A Agatha me ajudou a equilibrar minha alimentação e reduzir o inchaço que tanto me incomodava.'},

        8: {nome1: 'Paula', nome2: 'Felipe', nome3: 'Beatriz', nome4: 'João', 
            comentario1: 'Roberto é super dedicada e sempre pronta para adaptar meu plano conforme minhas necessidades.', 
            comentario2: 'Graças ao Roberto, atingi meus objetivos de ganho de massa muscular de forma saudável e eficiente.', 
            comentario3: 'O Roberto me ensinou a importância de cada alimento na minha rotina, trazendo resultados visíveis no meu corpo.', 
            comentario4: 'O Roberto é muito competente e me ajudou a alcançar minhas metas de forma natural e sustentável.'},

        9: {nome1: 'Juliana', nome2: 'Rafael', nome3: 'Carla', nome4: 'Eduardo', 
            comentario1: 'Com a Mariana, minha relação com a alimentação mudou completamente, e me sinto muito melhor!', 
            comentario2: 'A Mariana foi essencial para minha jornada de perda de peso, sempre me motivando e ajustando o plano conforme meu progresso.', 
            comentario3: 'A Mariana me ajudou a ter mais energia durante o dia, o que impactou positivamente em todas as áreas da minha vida.', 
            comentario4: 'A Mariana conseguiu adaptar meu plano alimentar à minha rotina corrida, sem complicações.'},

        10: {nome1: 'Isabela', nome2: 'Vinícius', nome3: 'Amanda', nome4: 'Rodrigo', 
            comentario1: 'O Lucas é um profissional excelente, sempre disposto a ajustar o plano para otimizar meus resultados estéticos.', 
            comentario2: 'Lucas me ajudou a melhorar minha alimentação para fortalecer o sistema imunológico, o que fez uma grande diferença no meu bem-estar.', 
            comentario3: 'O Lucas criou um plano personalizado que respeita minhas preferências alimentares e me trouxe ótimos resultados.', 
            comentario4: 'O plano nutricional do Lucas fez com que eu tivesse mais disposição para enfrentar o dia a dia.'},

        11: {nome1: 'Débora', nome2: 'Pedro', nome3: 'Carolina', nome4: 'Luana  ', 
            comentario1: 'A Carla me ensinou a comer de forma consciente, o que transformou minha saúde e bem-estar.', 
            comentario2: 'A Carla é um excelente nutricionista, me ajudou a melhorar minha composição corporal com um plano eficiente.', 
            comentario3: 'Com a orientação da Carla, consegui controlar minha ansiedade e melhorar minha relação com a comida.', 
            comentario4: 'A Carla foi incrível, com dicas práticas que me ajudaram a incorporar uma alimentação saudável no meu dia a dia. Sinto-me mais leve e com mais disposição para as atividades que amo!'},

        12: {nome1: 'Renato', nome2: 'Larissa', nome3: 'Leandro', nome4: 'Ana Paula', 
            comentario1: 'Renata personalizou o plano de acordo com meus objetivos estéticos e os resultados foram surpreendentes.', 
            comentario2: 'Renata me acompanhou de perto, ajustando meu plano conforme minhas necessidades e progressos.', 
            comentario3: 'Renata me ajudou a ganhar massa magra com um plano alimentar ajustado ao meu treino e estilo de vida.', 
            comentario4: 'A Renata me mostrou que é possível comer bem sem abrir mão do prazer, e ainda obter ótimos resultados para a saúde.'}, 
    };

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
    };

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
    };
});