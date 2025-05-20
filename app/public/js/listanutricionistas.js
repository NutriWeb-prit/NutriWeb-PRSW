document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    /*
        Esportiva: 5/8
        Clínica: 5/8
        Estética: 5/8
        Vegetariana: 4/8
        Materno-Infantil: 4/8
        Geriátrica: 4/8
        Preventiva: 4/8
        Balanceada: 4/8
        Funcional: 4/8
    */

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
        13: { nome: 'Bruno Teixeira', especialidade: 'Nutrição Esportiva', imagem: 'imagens/profissional13.png', contato: { whatsapp: '(61) 91234-5678', instagram: '@bruno_teixeira', email: 'bruno@nutricionista.com', sobre: "Sou Bruno Teixeira, nutricionista esportivo dedicado a impulsionar sua performance com uma alimentação adequada ao seu estilo de treino. Vamos alcançar juntos sua melhor forma física e mental!" } },
        14: { nome: 'Larissa Monteiro', especialidade: 'Nutrição Estética', imagem: 'imagens/profissional14.png', contato: { whatsapp: '(85) 99876-5432', instagram: '@larissa_monteiro', email: 'larissa@nutricionista.com', sobre: "Olá! Eu sou Larissa Monteiro, nutricionista estética apaixonada por ajudar pessoas a se sentirem bem consigo mesmas. Com nutrição personalizada, vamos destacar sua beleza natural de dentro para fora!" } },
        15: { nome: 'Daniela Castro', especialidade: 'Nutrição Clínica', imagem: 'imagens/profissional15.png', contato: { whatsapp: '(19) 92345-6789', instagram: '@daniela_castro', email: 'daniela@nutricionista.com', sobre: "Sou Daniela Castro, especialista em nutrição clínica. Acredito na força da alimentação como aliada no tratamento e prevenção de doenças. Estou aqui para te ajudar a viver melhor!" } },
        16: { nome: 'Henrique Lopes', especialidade: 'Nutrição Vegetariana', imagem: 'imagens/profissional16.png', contato: { whatsapp: '(47) 93456-7890', instagram: '@henrique_lopes', email: 'henrique@nutricionista.com', sobre: "Olá! Eu sou Henrique Lopes, especialista em nutrição vegetariana. Ajudo você a ter uma alimentação equilibrada, saudável e ética, respeitando seu estilo de vida e promovendo saúde em cada refeição." } },
        17: { nome: 'Mirella Cunha', especialidade: 'Nutrição Materno-Infantil', imagem: 'imagens/profissional17.png', contato: { whatsapp: '(31) 99812-3456', instagram: '@mirella_cunha', email: 'mirella@nutricionista.com', sobre: "Sou Mirella Cunha, especialista em nutrição materno-infantil. Minha missão é cuidar da alimentação de mães e bebês, garantindo um desenvolvimento saudável desde os primeiros momentos da vida." } },
        18: { nome: 'Gustavo Ribeiro', especialidade: 'Nutrição Geriátrica', imagem: 'imagens/profissional18.png', contato: { whatsapp: '(62) 98345-6781', instagram: '@gustavo_ribeiro', email: 'gustavo@nutricionista.com', sobre: "Olá! Eu sou Gustavo Ribeiro, nutricionista geriátrico. Trabalho para promover saúde, vitalidade e bem-estar na terceira idade, com planos alimentares adaptados às necessidades dessa fase da vida." } },
        19: { nome: 'Tatiane Moura', especialidade: 'Nutrição Preventiva', imagem: 'imagens/profissional19.png', contato: { whatsapp: '(27) 97654-3210', instagram: '@tatiane_moura', email: 'tatiane@nutricionista.com', sobre: "Oi, sou Tatiane Moura, nutricionista preventiva. Meu trabalho é ajudar você a evitar doenças e manter a saúde com escolhas alimentares conscientes e estratégias nutricionais eficazes." } },
        20: { nome: 'Eduardo Lima', especialidade: 'Nutrição Balanceada', imagem: 'imagens/profissional20.png', contato: { whatsapp: '(44) 91234-0987', instagram: '@eduardo_lima', email: 'eduardo@nutricionista.com', sobre: "Sou Eduardo Lima, especialista em nutrição balanceada. Acredito no equilíbrio como chave para uma vida saudável. Com um plano alimentar ajustado às suas rotinas, vamos atingir seus objetivos com prazer e saúde." } },
        21: { nome: 'Amanda Torres', especialidade: 'Nutrição Funcional', imagem: 'imagens/profissional21.png', contato: { whatsapp: '(45) 99887-6655', instagram: '@amanda_torres', email: 'amanda@nutricionista.com', sobre: "Olá! Eu sou Amanda Torres, nutricionista funcional. Minha missão é tratar a causa dos seus sintomas com uma nutrição estratégica, promovendo saúde de forma integrada e duradoura." } },
        22: { nome: 'Fernando Paiva', especialidade: 'Nutrição Preventiva', imagem: 'imagens/profissional22.png', contato: { whatsapp: '(16) 97654-1209', instagram: '@fernando_paiva', email: 'fernando@nutricionista.com', sobre: "Eu sou Fernando Paiva, nutricionista voltado à prevenção. Através da alimentação correta, ajudo você a manter o organismo em equilíbrio e prevenir doenças antes que elas apareçam." } },
        23: { nome: 'Isabela Martins', especialidade: 'Nutrição Materno-Infantil', imagem: 'imagens/profissional23.png', contato: { whatsapp: '(41) 97890-1234', instagram: '@isabela_martins', email: 'isabela@nutricionista.com', sobre: "Oi! Sou Isabela Martins, nutricionista materno-infantil. Acompanho gestantes, lactantes e crianças em suas fases mais importantes, com foco em nutrição adequada para crescimento e saúde duradoura." } },
        24: { nome: 'Vitor Amaral', especialidade: 'Nutrição Funcional', imagem: 'imagens/profissional24.png', contato: { whatsapp: '(13) 98654-7654', instagram: '@vitor_amaral', email: 'vitor@nutricionista.com', sobre: "Sou Vitor Amaral, especialista em nutrição funcional. Acredito no poder dos alimentos como terapia. Vamos juntos construir uma rotina alimentar que trate a raiz dos seus desequilíbrios e promova saúde real." } },
        25: { nome: 'Bianca Freire', especialidade: 'Nutrição Vegetariana', imagem: 'imagens/profissional25.png', contato: { whatsapp: '(41) 92345-6732', instagram: '@bianca_freire', email: 'bianca@nutricionista.com', sobre: "Olá! Eu sou Bianca Freire, nutricionista especializada em alimentação vegetariana. Meu trabalho é garantir que sua dieta seja completa, saborosa e equilibrada, respeitando seus valores e estilo de vida. Vamos construir saúde com consciência!" } },
        26: { nome: 'Thiago Nery', especialidade: 'Nutrição Vegetariana', imagem: 'imagens/profissional26.png', contato: { whatsapp: '(27) 81423-6781', instagram: '@thiago_nery', email: 'thiago@nutricionista.com', sobre: "Sou Thiago Nery, nutricionista voltado à alimentação vegetariana e plant-based. Ajudo você a manter uma dieta rica, consciente e balanceada, promovendo saúde e bem-estar com base na natureza." } },
        27: { nome: 'Helena Luz', especialidade: 'Nutrição Vegetariana', imagem: 'imagens/profissional27.png', contato: { whatsapp: '(62) 98123-4567', instagram: '@helena_luz', email: 'helena@nutricionista.com', sobre: "Sou Helena Luz, nutricionista apaixonada por alimentação vegetal e consciente. Meu objetivo é te ajudar a conquistar equilíbrio e saúde por meio de escolhas alimentares éticas e funcionais." } },
        28: { nome: 'Fernanda Couto', especialidade: 'Nutrição Materno-Infantil', imagem: 'imagens/profissional28.png', contato: { whatsapp: '(85) 93456-7812', instagram: '@fernanda_couto', email: 'fernanda@nutricionista.com', sobre: "Sou Fernanda Couto, nutricionista materno-infantil. Meu objetivo é acompanhar você desde a gestação até a introdução alimentar do seu bebê, promovendo saúde e vínculo com muito carinho e conhecimento." } },
        29: { nome: 'Eduarda Klein', especialidade: 'Nutrição Materno-Infantil', imagem: 'imagens/profissional29.png', contato: { whatsapp: '(48) 91234-6578', instagram: '@eduarda_klein', email: 'eduarda@nutricionista.com', sobre: "Olá! Eu sou Eduarda Klein, especialista em nutrição materno-infantil. Acredito que a alimentação nos primeiros anos é essencial para toda a vida. Estou aqui para apoiar mães, pais e cuidadores com orientação prática e empática." } },
        30: { nome: 'Marcos Teixeira', especialidade: 'Nutrição Geriátrica', imagem: 'imagens/profissional30.png', contato: { whatsapp: '(61) 94567-1234', instagram: '@marcos_teixeira', email: 'marcos@nutricionista.com', sobre: "Olá! Eu sou Marcos Teixeira, nutricionista especializado em saúde do idoso. Trabalho com foco em longevidade e qualidade de vida, ajustando a alimentação para garantir energia, prevenção e bem-estar na terceira idade." } },
        31: { nome: 'Helena Diniz', especialidade: 'Nutrição Geriátrica', imagem: 'imagens/profissional31.png', contato: { whatsapp: '(13) 93412-8765', instagram: '@helena_diniz', email: 'helena@nutricionista.com', sobre: "Sou Helena Diniz, especialista em nutrição geriátrica. Acredito que uma alimentação adequada na maturidade é a chave para envelhecer com saúde, autonomia e prazer à mesa. Vamos cuidar do seu futuro com carinho e ciência." } },
        32: { nome: 'Eduardo Novaes', especialidade: 'Nutrição Geriátrica', imagem: 'imagens/profissional32.png', contato: { whatsapp: '(82) 98765-3321', instagram: '@eduardo_novaes', email: 'eduardo@nutricionista.com', sobre: "Me chamo Eduardo Novaes e sou nutricionista focado na terceira idade. Minha missão é auxiliar idosos e familiares a manterem hábitos saudáveis que tragam vitalidade, prevenção de doenças e bem-estar contínuo." } },
        33: { nome: 'Laura Teles', especialidade: 'Nutrição Preventiva', imagem: 'imagens/profissional33.png', contato: { whatsapp: '(11) 99834-1122', instagram: '@laura_teles', email: 'laura@nutricionista.com', sobre: "Sou Laura Teles, especialista em nutrição preventiva. Acredito que a alimentação é a base para uma vida longa e saudável. Meu trabalho é ajudar você a evitar doenças e fortalecer o corpo com escolhas inteligentes todos os dias." } },
        34: { nome: 'Fernando Dias', especialidade: 'Nutrição Preventiva', imagem: 'imagens/profissional34.png', contato: { whatsapp: '(71) 91234-7856', instagram: '@fernando_dias', email: 'fernando@nutricionista.com', sobre: "Olá! Eu sou Fernando Dias, nutricionista com foco em prevenção e promoção da saúde. Com orientação personalizada, ajudo você a construir hábitos que evitam doenças e aumentam sua qualidade de vida. Vamos viver melhor?" } },
        35: { nome: 'Vanessa Prado', especialidade: 'Nutrição Balanceada', imagem: 'imagens/profissional35.png', contato: { whatsapp: '(41) 98765-4432', instagram: '@vanessa_prado', email: 'vanessa@nutricionista.com', sobre: "Olá! Sou Vanessa Prado, nutricionista com foco em alimentação balanceada. Acredito no equilíbrio como chave para o bem-estar, sem restrições extremas. Vamos construir juntos hábitos saudáveis e sustentáveis para sua rotina!" } },
        36: { nome: 'Thiago Lopes', especialidade: 'Nutrição Balanceada', imagem: 'imagens/profissional36.png', contato: { whatsapp: '(62) 94562-1188', instagram: '@thiago_lopes', email: 'thiago@nutricionista.com', sobre: "Sou Thiago Lopes, nutricionista especialista em dietas balanceadas. Minha proposta é ajudar você a comer melhor de forma prática, saborosa e sem exageros. Uma nutrição possível para o seu dia a dia!" } },
        37: { nome: 'Amanda Rezende', especialidade: 'Nutrição Balanceada', imagem: 'imagens/profissional37.png', contato: { whatsapp: '(27) 99876-5532', instagram: '@amanda_rezende', email: 'amanda@nutricionista.com', sobre: "Oi! Eu sou Amanda Rezende, e trabalho com foco em alimentação equilibrada e consciente. Vamos juntos construir uma rotina alimentar que respeite seus gostos, promova saúde e traga bem-estar sem culpa!" } },
        38: { nome: 'Daniela Muniz', especialidade: 'Nutrição Funcional', imagem: 'imagens/profissional38.png', contato: { whatsapp: '(85) 91234-7766', instagram: '@daniela_muniz', email: 'daniela@nutricionista.com', sobre: "Olá! Eu sou Daniela Muniz, nutricionista funcional. Acredito no poder dos alimentos como ferramenta de cura e prevenção. Meu trabalho é olhar o seu corpo como um todo e usar a nutrição para equilibrar funções, melhorar sintomas e promover saúde de dentro para fora." } },
        39: { nome: 'Bruno Ferreira', especialidade: 'Nutrição Funcional', imagem: 'imagens/profissional39.png', contato: { whatsapp: '(19) 94321-8899', instagram: '@bruno_ferreira', email: 'bruno@nutricionista.com', sobre: "Sou Bruno Ferreira, especialista em nutrição funcional. Trabalho de forma integrada para entender as causas dos desequilíbrios e trazer soluções naturais por meio da alimentação. Vamos fortalecer seu organismo com o que ele realmente precisa." } },
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

        13: {nome1: 'Rafael', nome2: 'Lucas', nome3: 'Diego', nome4: 'Fernanda',
            comentario1: 'Excelente profissional! Minha performance melhorou muito com o plano alimentar dele.',
            comentario2: 'Muito atencioso e entende as necessidades de quem treina pesado.',
            comentario3: 'Recomendo demais! Alimentação focada em resultado real.',
            comentario4: 'Clareza, compromisso e muito conhecimento. Gostei bastante do acompanhamento.'},

        14: {nome1: 'Bianca', nome2: 'Júlia', nome3: 'Michele', nome4: 'Renata',
            comentario1: 'A Larissa é incrível! Minha pele e cabelo melhoraram muito.',
            comentario2: 'Muito querida e profissional. Explica tudo com muita paciência.',
            comentario3: 'Senti mais autoestima e bem-estar desde que comecei com ela',
            comentario4: 'Atendimento acolhedor e personalizado. Estou amando o resultado!'},

        15: {nome1: 'Tiago', nome2: 'Cláudia', nome3: 'José', nome4: 'Marina',
            comentario1: 'A Daniela realmente entende de nutrição clínica. Me ajudou com meu problema digestivo.',
            comentario2: 'Super dedicada e competente. Me sinto muito melhor!',
            comentario3: 'Plano alimentar feito sob medida. Estou me sentindo mais saudável.',
            comentario4: 'Muito ética e cuidadosa. Gostei da abordagem prática dela.'},

        16: {nome1: 'Camila', nome2: 'Pedro', nome3: 'Alice', nome4: 'Igor',
            comentario1: 'Achei incrível como ele respeita o estilo de vida vegetariano e ainda equilibra tudo.',
            comentario2: 'Nunca me senti tão bem com uma dieta! Henrique é sensacional.',
            comentario3: 'Atendimento humanizado e super informativo.',
            comentario4: 'Ótimo profissional! Me ensinou muito sobre combinações nutricionais vegetarianas.'},

        17: {
            nome1: 'Vanessa', nome2: 'Lorena', nome3: 'Aline', nome4: 'Renata',
            comentario1: 'Me ajudou muito na fase da gestação. Sou grata demais!',
            comentario2: 'Excelente com crianças! Meu filho adorou as dicas.',
            comentario3: 'Muito doce e competente. Recomendo para todas as mamães!',
            comentario4: 'O plano alimentar funcionou super bem com meu bebê.'
        },
            
        18: {
            nome1: 'Flávia', nome2: 'Paulo', nome3: 'Sandra', nome4: 'Marina',
            comentario1: 'Muito atencioso com os idosos. Meu pai se adaptou super bem.',
            comentario2: 'Fez um plano alimentar ideal para a idade da minha avó. Resultado excelente.',
            comentario3: 'Trata os pacientes com carinho e respeito.',
            comentario4: 'Confiável e experiente. Nota 10!'
        },
            
        19: {
            nome1: 'Letícia', nome2: 'Rafael', nome3: 'Eliane', nome4: 'João',
            comentario1: 'Com Tatiane aprendi que alimentação previne mais do que remédio.',
            comentario2: 'Ela é prática e vai direto ao ponto. Adorei!',
            comentario3: 'Agora me alimento melhor e não fico mais doente com frequência.',
            comentario4: 'Abordagem consciente e informativa. Me senti cuidada.'
        },
            
        20: {
            nome1: 'Priscila', nome2: 'Gustavo', nome3: 'Tainá', nome4: 'Henrique',
            comentario1: 'Plano equilibrado e fácil de seguir. Já vejo diferença!',
            comentario2: 'Sabe adaptar a dieta à rotina. Excelente profissional.',
            comentario3: 'Gostei da forma como ele prioriza o equilíbrio. Nada radical.',
            comentario4: 'Finalmente encontrei uma alimentação sustentável pra mim.'
        },
            
        21: {
            nome1: 'Jéssica', nome2: 'Carol', nome3: 'Felipe', nome4: 'Beatriz',
            comentario1: 'A Amanda mudou minha vida! Tratou causas que ninguém percebia.',
            comentario2: 'A nutrição funcional realmente faz diferença. Recomendo muito!',
            comentario3: 'Muito dedicada e conhecedora. Adorei o atendimento.',
            comentario4: 'Melhorei sintomas que tinha há anos. Sou muito grata!'
        },
            
        22: {
            nome1: 'Luana', nome2: 'Eduardo', nome3: 'Simone', nome4: 'Fábio',
            comentario1: 'Trabalho preventivo que realmente funciona. Profissional excelente!',
            comentario2: 'Aprendi muito sobre o impacto da alimentação no meu dia a dia.',
            comentario3: 'Gostei muito da abordagem focada na saúde a longo prazo.',
            comentario4: 'Consulta leve, educativa e super eficiente.'
        },
            
        23: {
            nome1: 'Juliana', nome2: 'Paula', nome3: 'Letícia', nome4: 'Mônica',
            comentario1: 'Muito carinhosa com as crianças. Minha filha adora!',
            comentario2: 'Foi essencial no meu pós-parto. Recomendo!',
            comentario3: 'Traz informações claras e práticas. Me ajudou bastante.',
            comentario4: 'Atendimento excelente para mães e bebês. Nota 10!'
        },
            
        24: {
            nome1: 'André', nome2: 'Karina', nome3: 'Tatiane', nome4: 'Rodrigo',
            comentario1: 'Trabalho incrível! Meu corpo e mente estão mais equilibrados.',
            comentario2: 'O Vitor é muito atento aos detalhes. A nutrição funcional fez toda a diferença.',
            comentario3: 'Recuperei minha disposição e saúde com a ajuda dele.',
            comentario4: 'Explica tudo com paciência e embasamento. Recomendo de olhos fechados!'
        },

        25: {
            nome1: 'Carlos', nome2: 'Ana', nome3: 'Daniela', nome4: 'Rodrigo',
            comentario1: 'Com a Bianca, aprendi a montar pratos vegetarianos completos e nutritivos.',
            comentario2: 'Excelente profissional! Atenciosa e muito bem informada.',
            comentario3: 'Nunca imaginei que fosse tão fácil manter uma dieta vegetariana equilibrada.',
            comentario4: 'Ela respeitou minhas escolhas e me ajudou a melhorar minha energia no dia a dia.'
        },

        26: {
            nome1: 'Luiza', nome2: 'Gabriel', nome3: 'Joana', nome4: 'Felipe',
            comentario1: 'Thiago me ajudou a adaptar minha alimentação sem sofrimento.',
            comentario2: 'Muito experiente em nutrição vegetariana! Recomendo com certeza.',
            comentario3: 'Consulta completa e cheia de dicas práticas para o dia a dia.',
            comentario4: 'Passei a me alimentar melhor, com mais energia e consciência.'
        },

        27: {
            nome1: 'Marcelo', nome2: 'Tatiane', nome3: 'Isadora', nome4: 'Bruno',
            comentario1: 'A Helena me mostrou que é possível ter uma alimentação vegetariana completa.',
            comentario2: 'Muito preparada, me senti confiante desde a primeira consulta.',
            comentario3: 'O plano alimentar dela é realista e fácil de seguir.',
            comentario4: 'Ela me ajudou a corrigir deficiências sem precisar mudar meu estilo de vida.'
        },

        28: {
            nome1: 'Patrícia', nome2: 'Juliano', nome3: 'Michele', nome4: 'Rafaela',
            comentario1: 'A Fernanda foi essencial durante minha gravidez e no início da introdução alimentar.',
            comentario2: 'Muito profissional, atenciosa e cheia de conhecimento!',
            comentario3: 'Me senti muito segura com as orientações que ela passou para minha filha.',
            comentario4: 'Ela entende profundamente as fases do bebê e ajuda com carinho e paciência.'
        },

        29: {
            nome1: 'Camila', nome2: 'Larissa', nome3: 'André', nome4: 'Luciana',
            comentario1: 'A Eduarda me ajudou muito na alimentação da minha bebê. Super didática!',
            comentario2: 'Consulta acolhedora e cheia de informações úteis.',
            comentario3: 'Trouxe soluções práticas para o dia a dia. Mudou minha rotina para melhor.',
            comentario4: 'Excelente profissional, transmite muita confiança!'
        },

        30: {
            nome1: 'Rosângela', nome2: 'Sérgio', nome3: 'Cláudia', nome4: 'Antonio',
            comentario1: 'Marcos cuidou da alimentação da minha mãe com muita atenção e paciência.',
            comentario2: 'Ajudou meu pai a melhorar a energia e controlar a diabetes.',
            comentario3: 'Explicações claras, empatia e muito conhecimento.',
            comentario4: 'Recomendo muito! Profissional dedicado e sensível às necessidades dos idosos.'
        },

        31: {
            nome1: 'Lúcia', nome2: 'Beatriz', nome3: 'Otávio', nome4: 'Valéria',
            comentario1: 'A Helena mudou completamente a saúde da minha avó.',
            comentario2: 'Ela trouxe leveza e clareza para nossa rotina alimentar.',
            comentario3: 'Excelente com idosos! Muito respeitosa e acolhedora.',
            comentario4: 'Trabalho sensível, focado no bem-estar do idoso. Amei!'
        },

        32: {
            nome1: 'Rafael', nome2: 'Denise', nome3: 'Silvana', nome4: 'José',
            comentario1: 'Eduardo foi essencial na recuperação da saúde da minha tia.',
            comentario2: 'Muito humano e preparado. Sabe escutar e orientar com paciência.',
            comentario3: 'Acompanhamento completo e bem personalizado.',
            comentario4: 'Cuidou muito bem do meu avô. Ganhou nossa confiança.'
        },

        33: {
            nome1: 'Renata', nome2: 'Julio', nome3: 'Tânia', nome4: 'Bruno',
            comentario1: 'Laura me ajudou a mudar minha alimentação antes de qualquer problema aparecer.',
            comentario2: 'Hoje tenho mais energia e foco, tudo com a ajuda dela.',
            comentario3: 'Excelente abordagem preventiva, com explicações fáceis e eficazes.',
            comentario4: 'Ela foca na saúde como um todo, não só na alimentação. Muito humana.'
        },

        34: {
            nome1: 'Márcia', nome2: 'Eduardo', nome3: 'Lorena', nome4: 'Gustavo',
            comentario1: 'Com o Fernando, aprendi a cuidar da minha saúde antes de ficar doente.',
            comentario2: 'Consultas detalhadas e com foco em prevenção mesmo. Muito diferenciado.',
            comentario3: 'Me ajudou a evitar uso de medicamentos só com ajuste na alimentação.',
            comentario4: 'Mudou meu estilo de vida para melhor. Recomendo demais!'
        },

        35: {
            nome1: 'Kelly', nome2: 'Danilo', nome3: 'Juliana', nome4: 'Fábio',
            comentario1: 'A Vanessa me ajudou a manter uma alimentação saudável sem abrir mão do prazer de comer.',
            comentario2: 'Encontrei equilíbrio e resultado de forma leve. Excelente profissional!',
            comentario3: 'Muito didática e flexível. Finalmente parei de fazer dietas malucas.',
            comentario4: 'Consulta completa e focada na realidade do paciente. Amei!'
        },

        36: {
            nome1: 'Patrícia', nome2: 'Rafael', nome3: 'Érica', nome4: 'Luan',
            comentario1: 'O Thiago me ajudou a encaixar uma boa alimentação na minha rotina corrida.',
            comentario2: 'Dieta prática, sem sofrimento. Profissional muito sensato.',
            comentario3: 'Acompanhamento excelente, com metas possíveis e sustentáveis.',
            comentario4: 'Me fez enxergar que comer bem não precisa ser complicado.'
        },

        
        37: {
            nome1: 'Gisele', nome2: 'Matheus', nome3: 'Renata', nome4: 'Robson',
            comentario1: 'Amanda me fez entender a importância do equilíbrio e da escuta ao corpo.',
            comentario2: 'Ela respeitou meu estilo de vida e adaptou tudo com carinho.',
            comentario3: 'Muito humana e atualizada, adorei cada consulta!',
            comentario4: 'Com ela, recuperei o prazer de comer sem culpa. Maravilhosa!'
        },

        38: {
            nome1: 'Lorena', nome2: 'Rodrigo', nome3: 'Natália', nome4: 'Bruna',
            comentario1: 'A Daniela me ajudou a tratar minha enxaqueca com alimentação. Incrível!',
            comentario2: 'Muito atenciosa, entende o corpo como um todo.',
            comentario3: 'Mudou minha relação com a comida e com minha saúde.',
            comentario4: 'Recomendo demais! Tratamento funcional realmente funciona!'
        },
        
        39: {
            nome1: 'Carlos', nome2: 'Isadora', nome3: 'Felipe', nome4: 'Vanessa',
            comentario1: 'O Bruno encontrou desequilíbrios que ninguém antes percebeu.',
            comentario2: 'Consultas muito completas e personalizadas.',
            comentario3: 'Finalmente entendi o que meu corpo estava pedindo. Me sinto muito melhor.',
            comentario4: 'Trabalho sério, baseado em ciência e com resultados reais.'
        },
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