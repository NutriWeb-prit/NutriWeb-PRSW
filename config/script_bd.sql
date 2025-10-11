CREATE TABLE `Usuarios` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`Telefone` CHAR(11) NOT NULL UNIQUE,
	`Email` VARCHAR(50) NOT NULL UNIQUE,
	`NomeCompleto` VARCHAR(125) NOT NULL,
    `CEP` CHAR(8),
	`DataNascimento` DATE,
	`UsuarioTipo` ENUM('C', 'N', 'A') NOT NULL DEFAULT 'C',
	`Senha` VARCHAR(255) NOT NULL,
	`UsuarioStatus` INT NOT NULL DEFAULT '1',
	PRIMARY KEY(`id`)
);

CREATE TABLE `Clientes` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`UsuarioId` INTEGER UNSIGNED NOT NULL UNIQUE,
	`CPF` CHAR(11) NOT NULL UNIQUE,
	PRIMARY KEY(`id`),
	FOREIGN KEY (`UsuarioId`) REFERENCES `Usuarios`(`id`)
);

CREATE TABLE `Administradores` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`CPF` CHAR(11),
	PRIMARY KEY(`id`),
	FOREIGN KEY (`id`) REFERENCES `Usuarios`(`id`)
);

CREATE TABLE `ContatoSociais` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`Tipo` ENUM('WhatsApp', 'Facebook', 'YouTube', 'X', 'Instagram', 'Email') NOT NULL,
    `Link` VARCHAR(255) NOT NULL,
	PRIMARY KEY(`id`)
);

CREATE TABLE `Nutricionistas` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`UsuarioId` INTEGER UNSIGNED NOT NULL UNIQUE,
	`Crn` CHAR(11) NOT NULL UNIQUE,
	`RazaoSocial` VARCHAR(255),
	`ContatoSociaisId` INTEGER UNSIGNED,
	PRIMARY KEY(`id`),
	FOREIGN KEY (`UsuarioId`) REFERENCES `Usuarios`(`id`),
	FOREIGN KEY (`ContatoSociaisId`) REFERENCES `ContatoSociais`(`id`)
);

CREATE TABLE `NutricionistasFormacoes` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `NutricionistaId` INTEGER UNSIGNED NOT NULL,
    `TipoFormacao` ENUM('graduacao', 'curso') NOT NULL,
    `NomeFormacao` VARCHAR(255) NOT NULL,
    `NomeInstituicao` VARCHAR(255) NOT NULL,
    `CertificadoArquivo` LONGBLOB NULL,
    `CertificadoNome` VARCHAR(255) NULL,
    `CertificadoTipo` VARCHAR(100) NULL,
    `CertificadoTamanho` INT NULL,
    `DataCriacao` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`NutricionistaId`) REFERENCES `Nutricionistas`(`id`) ON DELETE CASCADE
);

CREATE TABLE `NutricionistaContatoSociais` (
    `NutricionistaId` INTEGER UNSIGNED NOT NULL,
    `ContatoSociaisId` INTEGER UNSIGNED NOT NULL,
    PRIMARY KEY (`NutricionistaId`, `ContatoSociaisId`),
    FOREIGN KEY (`NutricionistaId`) REFERENCES `Nutricionistas`(`id`),
    FOREIGN KEY (`ContatoSociaisId`) REFERENCES `ContatoSociais`(`id`)
);

CREATE TABLE `Perfis` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`FotoPerfil` MEDIUMBLOB,
	`FotoBanner` MEDIUMBLOB,
	`SobreMim` VARCHAR(400),
	`UsuarioId` INTEGER UNSIGNED NOT NULL,
	PRIMARY KEY(`id`),
	FOREIGN KEY (`UsuarioId`) REFERENCES `Usuarios`(`id`)
);


CREATE TABLE `Publicacoes` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`FotoPublicacao` BLOB,
	`Legenda` VARCHAR(1000),
    `Categoria` enum('Dica', 'Receita') NOT NULL,
	`MediaEstrelas` DECIMAL(2,1) DEFAULT 0.0,
	PRIMARY KEY(`id`)
);

CREATE TABLE `Avaliacoes` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`ClienteId` INTEGER UNSIGNED NOT NULL,
	`PublicacaoId` INTEGER UNSIGNED NOT NULL,
	`Comentario` VARCHAR(1300),
	`DataAvaliacao` DATETIME NOT NULL,
	`imgAvaliacao` BLOB,
	`Classificao` DECIMAL(2,1),
	PRIMARY KEY(`id`),
	FOREIGN KEY (`ClienteId`) REFERENCES `Clientes`(`id`),
	FOREIGN KEY (`PublicacaoId`) REFERENCES `Publicacoes`(`id`)
);

CREATE TABLE `Planos` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`NutricionistaId` INTEGER UNSIGNED NOT NULL UNIQUE,
	`TipoPlano` ENUM('Basico', 'Premium') NOT NULL,
	`Duracao` ENUM('Mensal', 'Trimestral', 'Anual') DEFAULT NULL,
	`PagamentoAutomatico` BOOLEAN DEFAULT FALSE,
	`ValorSubtotal` DECIMAL(10,2),
	PRIMARY KEY(`id`),
	FOREIGN KEY (`NutricionistaId`) REFERENCES `Nutricionistas`(`id`)
);

CREATE TABLE `Status` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`TituloStatus` ENUM('A pagar', 'Em andamento', 'Finalizado', 'Cancelado', 'Pedido Realizado', 'Pagamento Confirmado') NOT NULL,
	PRIMARY KEY(`id`)
);

CREATE TABLE `Transacoes` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`PlanoId` INTEGER unsigned NOT NULL,
	`StatusId` INTEGER Unsigned  NOT NULL,
	`MetodoPagamento` ENUM('Pix', 'CartaoCredito', 'CartaoDebito') NOT NULL,
	`PagamentoAutomatico` BOOLEAN DEFAULT FALSE,
	`DataTransacao` DATETIME NOT NULL,
	`ValorTotal` DECIMAL(10,2),
	PRIMARY KEY(`id`),
	FOREIGN KEY (`PlanoId`) REFERENCES `Planos`(`id`),
	FOREIGN KEY (`StatusId`) REFERENCES `Status`(`id`)
);

CREATE TABLE `NotasFiscais` (
	`id` INTEGER NOT NULL AUTO_INCREMENT,
	`Transacaoid` INTEGER unsigned NOT NULL,
	`NumeroNota` VARCHAR(50) NOT NULL,
	`Serie` VARCHAR(10) NOT NULL,
	`DataEmissao` DATETIME NOT NULL,
	`ChaveAcesso` VARCHAR(45) NOT NULL,
	PRIMARY KEY(`id`),
	FOREIGN KEY (`Transacaoid`) REFERENCES `Transacoes`(`id`)
);

CREATE TABLE `Especializacoes` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`Nome` VARCHAR(150),
	PRIMARY KEY(`id`)
);

INSERT INTO `Especializacoes` (Nome) VALUES
('Esportiva'),
('Clínica'),
('Materno-Infantil'),
('Preventiva'),
('Funcional'),
('Estética'),
('Vegetariana'),
('Geriátrica'),
('Balanceada');

CREATE TABLE `NutricionistasEspecializacoes` (
	`NutricionistaId` INTEGER unsigned NOT NULL,
	`EspecializacaoId` INTEGER unsigned NOT NULL,
	PRIMARY KEY(`NutricionistaId`, `EspecializacaoId`),
	FOREIGN KEY (`NutricionistaId`) REFERENCES `Nutricionistas`(`id`),
	FOREIGN KEY (`EspecializacaoId`) REFERENCES `Especializacoes`(`id`)
);

CREATE TABLE `NutricionistaPublicacao` (
	`NutricionistaId` INTEGER UNSIGNED NOT NULL,
	`PublicacaoId` INTEGER UNSIGNED NOT NULL,
	PRIMARY KEY(`NutricionistaId`, `PublicacaoId`),
	FOREIGN KEY (`NutricionistaId`) REFERENCES `Nutricionistas`(`id`),
	FOREIGN KEY (`PublicacaoId`) REFERENCES `Publicacoes`(`id`)
);

CREATE TABLE `InteressesNutricionais` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `Nome` VARCHAR(150) NOT NULL,
    PRIMARY KEY(id)
);

INSERT INTO `InteressesNutricionais` (Nome) VALUES
('Emagrecimento'),
('Ganho de Massa Muscular'),
('Controle de Doenças'),
('Estética Corporal'),
('Doenças Crônicas'),
('Dieta Vegetariana'),
('Gestantes/Crianças'),
('Saúde Idoso'),
('Alimentação Saudável');

CREATE TABLE `ClientesInteresses` (
    `ClienteId` INTEGER UNSIGNED NOT NULL,
    `InteresseId` INTEGER UNSIGNED NOT NULL,
    PRIMARY KEY (ClienteId, InteresseId),
    FOREIGN KEY (ClienteId) REFERENCES Clientes(id),
    FOREIGN KEY (InteresseId) REFERENCES InteressesNutricionais(id)
);

CREATE TABLE `Curtidas` (
  `ClienteId` INT UNSIGNED NOT NULL,
  `PublicacaoId` INT UNSIGNED NOT NULL,
  `DataCurtida` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ClienteId, PublicacaoId),
  FOREIGN KEY (ClienteId) REFERENCES Clientes(id),
  FOREIGN KEY (PublicacaoId) REFERENCES Publicacoes(id)
);
 
CREATE TABLE `CurtidasPublicacoes` (
  `ClienteId` INT UNSIGNED NOT NULL,
  `PublicacaoId` INT UNSIGNED NOT NULL,
  `DataCurtida` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (ClienteId, PublicacaoId),
  FOREIGN KEY (ClienteId) REFERENCES Clientes(id),
  FOREIGN KEY (PublicacaoId) REFERENCES Publicacoes(id)
);

INSERT INTO `Usuarios` (Telefone, Email, NomeCompleto, CEP, DataNascimento, UsuarioTipo, Senha, UsuarioStatus) VALUES
('11123456789', 'julia@nutriweb.com', 'Julia Barros', '01310100', '1985-03-15', 'N', '$2b$10$exemplo.hash.senha', 1),
('21987654321', 'roberta@nutriweb.com', 'Roberta Santos', '04567890', '1982-07-22', 'N', '$2b$10$exemplo.hash.senha', 1),
('31456781234', 'flavia@nutriweb.com', 'Flávia Flins', '02345678', '1988-11-10', 'N', '$2b$10$exemplo.hash.senha', 1),
('11424444978', 'pablo@nutriweb.com', 'Pablo Parron', '03456789', '1979-05-18', 'N', '$2b$10$exemplo.hash.senha', 1),
('11847623462', 'sophia@nutriweb.com', 'Sophia Silva', '05678901', '1990-09-25', 'N', '$2b$10$exemplo.hash.senha', 1),
('18782670918', 'camila@nutriweb.com', 'Camila Ocanã', '06789012', '1986-12-03', 'N', '$2b$10$exemplo.hash.senha', 1),
('37837141134', 'agatha@nutriweb.com', 'Agatha Matos', '07890123', '1991-02-14', 'N', '$2b$10$exemplo.hash.senha', 1),
('54245252938', 'roberto@nutriweb.com', 'Roberto Carlos', '08901234', '1983-08-07', 'N', '$2b$10$exemplo.hash.senha', 1),
('21872640817', 'mariana@nutriweb.com', 'Mariana Alves', '09012345', '1987-04-30', 'N', '$2b$10$exemplo.hash.senha', 1),
('73565352746', 'lucas@nutriweb.com', 'Lucas Mendes', '10123456', '1984-10-12', 'N', '$2b$10$exemplo.hash.senha', 1),
('43764522938', 'carla@nutriweb.com', 'Carla Souza', '11234567', '1989-06-28', 'N', '$2b$10$exemplo.hash.senha', 1),
('34917673918', 'renata@nutriweb.com', 'Renata Dias', '12345678', '1981-01-15', 'N', '$2b$10$exemplo.hash.senha', 1),
('11987654321', 'bruno.teixeira@nutriweb.com', 'Bruno Teixeira', '01234567', '1987-04-12', 'N', '$2b$10$exemplo.hash.senha', 1),
('21876543210', 'larissa.lobato@nutriweb.com', 'Larissa Lobato', '02345671', '1990-08-25', 'N', '$2b$10$exemplo.hash.senha', 1),
('31765432109', 'daniela.castro@nutriweb.com', 'Daniela Castro', '03456712', '1988-11-03', 'N', '$2b$10$exemplo.hash.senha', 1),
('41654321098', 'henrique.lopes@nutriweb.com', 'Henrique Lopes', '04567123', '1985-07-18', 'N', '$2b$10$exemplo.hash.senha', 1),
('51543210987', 'mirella.cunha@nutriweb.com', 'Mirella Cunha', '05671234', '1989-02-14', 'N', '$2b$10$exemplo.hash.senha', 1),
('61432109876', 'gustavo.ribeiro@nutriweb.com', 'Gustavo Ribeiro', '06712345', '1986-09-30', 'N', '$2b$10$exemplo.hash.senha', 1),
('71321098765', 'tatiane.moura@nutriweb.com', 'Tatiane Moura', '07123456', '1991-05-22', 'N', '$2b$10$exemplo.hash.senha', 1),
('81210987654', 'eduardo.lima@nutriweb.com', 'Eduardo Lima', '08234567', '1983-12-08', 'N', '$2b$10$exemplo.hash.senha', 1),
('91109876543', 'amanda.torres@nutriweb.com', 'Amanda Torres', '09345678', '1987-06-15', 'N', '$2b$10$exemplo.hash.senha', 1),
('10987654321', 'fernando.lins@nutriweb.com', 'Fernando Lins', '10456789', '1984-03-27', 'N', '$2b$10$exemplo.hash.senha', 1),
('19876543210', 'isabela.martins@nutriweb.com', 'Isabela Martins', '11567890', '1982-10-11', 'N', '$2b$10$exemplo.hash.senha', 1),
('29166324210', 'marina.lima@nutriweb.com', 'Marina Lima', '11942145', '1992-10-11', 'N', '$2b$10$exemplo.hash.senha', 1),
('11555123456', 'laura.figueira@nutriweb.com', 'Laura Figueira', '12678901', '1986-03-20', 'N', '$2b$10$exemplo.hash.senha', 1),
('21444234567', 'rafael.reis@nutriweb.com', 'Rafael Reis', '13789012', '1989-07-14', 'N', '$2b$10$exemplo.hash.senha', 1),
('31333345678', 'camila.duarte@nutriweb.com', 'Camila Duarte', '14890123', '1985-11-28', 'N', '$2b$10$exemplo.hash.senha', 1),
('41222456789', 'bruno.salles@nutriweb.com', 'Bruno Salles', '15901234', '1987-09-05', 'N', '$2b$10$exemplo.hash.senha', 1),
('51111567890', 'mariana.prado@nutriweb.com', 'Mariana Prado', '16012345', '1990-01-18', 'N', '$2b$10$exemplo.hash.senha', 1),
('61000678901', 'jorge.cardoso@nutriweb.com', 'Jorge Cardoso', '17123456', '1984-05-12', 'N', '$2b$10$exemplo.hash.senha', 1),
('70999789012', 'juliana.nunes@nutriweb.com', 'Juliana Nunes', '18234567', '1988-08-23', 'N', '$2b$10$exemplo.hash.senha', 1),
('80888890123', 'andre.vale@nutriweb.com', 'Andre Vale', '19345678', '1983-12-07', 'N', '$2b$10$exemplo.hash.senha', 1),
('90777901234', 'bianca.moura@nutriweb.com', 'Bianca Moura', '20456789', '1991-04-15', 'N', '$2b$10$exemplo.hash.senha', 1),
('10666012345', 'daniel.peixoto@nutriweb.com', 'Daniel Peixoto', '21567890', '1986-10-30', 'N', '$2b$10$exemplo.hash.senha', 1),
('19555123456', 'vanessa.luz@nutriweb.com', 'Vanessa Luz', '22678901', '1989-06-19', 'N', '$2b$10$exemplo.hash.senha', 1),
('18444234567', 'gabriel.lemos@nutriweb.com', 'Gabriel Lemos', '23789012', '1987-02-26', 'N', '$2b$10$exemplo.hash.senha', 1),
('00000000000', 'nutriweb.prit@gmail.com', 'NutriWeb', '00000000', '2023-02-08', 'A', '$2b$12$ZoWb8LtJKcQGSM23Jrdlku2BmjpClb/k.S7vWutsvjwR2a17XZm6G', 1);

INSERT INTO `Nutricionistas` (UsuarioId, Crn) VALUES
(1, 'CRN-1234'),
(2, 'CRN-2345'),
(3, 'CRN-3456'),
(4, 'CRN-4567'),
(5, 'CRN-5678'),
(6, 'CRN-6789'),
(7, 'CRN-7890'),
(8, 'CRN-8901'),
(9, 'CRN-9012'),
(10, 'CRN-0123'),
(11, 'CRN-1357'),
(12, 'CRN-2468'),
(13, 'CRN-1111'),
(14, 'CRN-2222'),
(15, 'CRN-3333'),
(16, 'CRN-4444'),
(17, 'CRN-5555'),
(18, 'CRN-6666'),
(19, 'CRN-7777'),
(20, 'CRN-8888'),
(21, 'CRN-9999'),
(22, 'CRN-0000'),
(23, 'CRN-1010'),
(24, 'CRN-9175'),
(25, 'CRN-2525'),
(26, 'CRN-2626'),
(27, 'CRN-2727'),
(28, 'CRN-2828'),
(29, 'CRN-2929'),
(30, 'CRN-3030'),
(31, 'CRN-3131'),
(32, 'CRN-3232'),
(33, 'CRN-9827'),
(34, 'CRN-3434'),
(35, 'CRN-3535'),
(36, 'CRN-3636');

INSERT INTO `Perfis` (UsuarioId, SobreMim) VALUES
(1, 'Sou Júlia Barros, especialista em nutrição esportiva. Meu objetivo é ajudar você a melhorar seu desempenho e alcançar suas metas com uma alimentação estratégica. Vamos juntos rumo ao seu melhor!'),
(2, 'Me chamo Roberta Santos, nutricionista clínica. Trabalho para promover saúde e bem-estar, ajustando a alimentação para tratar e prevenir doenças. Cada pessoa é única, e estou aqui para te guiar nesse processo.'),
(3, 'Oi, sou Flávia Flins e minha missão é unir nutrição e estética. Vou te ajudar a melhorar sua pele, cabelos e autoestima com uma alimentação equilibrada. Beleza começa de dentro para fora!'),
(4, 'Sou Pablo Parron, nutricionista clínico. Acredito na alimentação como chave para uma vida saudável. Vou te ajudar a controlar doenças e melhorar sua saúde com soluções práticas e personalizadas.'),
(5, 'Oi! Eu sou Sophia Silva, nutricionista estética. Acredito que a beleza vem de dentro para fora. Com uma alimentação personalizada, vou ajudar você a alcançar uma pele radiante, cabelo saudável e um corpo equilibrado. Vamos realçar sua beleza.'),
(6, 'Oi! Eu sou Camila Ocanã, nutricionista estética. Com um enfoque holístico e individualizado, vou te guiar na busca pela harmonia entre saúde, beleza e bem-estar. Juntas, vamos realçar sua melhor versão através da nutrição!'),
(7, 'Olá! Eu sou Agatha Matos, nutricionista estética. Meu propósito é transformar sua relação com a alimentação, promovendo saúde e autoestima através de um plano nutricional adaptado às suas necessidades. Vamos cuidar do seu corpo de maneira equilibrada e eficaz!'),
(8, 'Olá! Eu sou Roberto Carlos, nutricionista esportivo. Minha missão é potencializar sua performance através de uma alimentação planejada e ajustada às suas necessidades. Juntos, vamos alcançar seus objetivos com mais energia e saúde!'),
(9, 'Oi! Eu sou Mariana Alves, nutricionista Esportiva. Meu objetivo é transformar sua saúde e bem-estar através de uma alimentação equilibrada e personalizada. Vamos encontrar juntos a melhor versão de você!'),
(10, 'Olá! Sou Lucas Mendes, nutricionista clínico. Meu foco é ajudar você a prevenir e tratar doenças por meio de uma alimentação equilibrada e adequada. Saúde é prioridade, e estou aqui para orientar você nesse caminho!'),
(11, 'Prazer, sou Carla Souza, especialista em nutrição clínica. Quero ajudar você a garantir uma nutrição adequada para sua vida, criando hábitos saudáveis que vão durar para a vida toda!'),
(12, 'Eu sou Renata Dias, especializado em nutrição esportiva de alta performance. Se você é um atleta ou busca otimizar seu rendimento, estou aqui para ajustar sua alimentação e levar você ao seu máximo potencial.'),
(13, 'Olá! Sou Bruno Teixeira, nutricionista especializado em alimentação vegetariana. Acredito que uma dieta plant-based bem planejada pode transformar sua saúde e energia. Vamos descobrir juntos o poder das plantas!'),
(14, 'Oi! Eu sou Larissa Lobato, apaixonada por nutrição vegetariana. Meu objetivo é mostrar que é possível ter uma alimentação deliciosa, nutritiva e sustentável sem produtos de origem animal. Vamos nessa jornada verde!'),
(15, 'Prazer, sou Daniela Castro! Especialista em nutrição vegetariana, trabalho para desmistificar conceitos e criar planos alimentares equilibrados e saborosos. Alimentação consciente é o caminho para uma vida plena!'),
(16, 'Olá! Sou Henrique Lopes, nutricionista vegetariano. Minha missão é ajudar você a ter uma transição suave e saudável para o vegetarianismo, garantindo todos os nutrientes necessários para seu bem-estar.'),
(17, 'Oi! Sou Mirella Cunha, nutricionista materno-infantil. Especializo-me no cuidado nutricional de gestantes, lactantes e crianças, promovendo desenvolvimento saudável desde os primeiros momentos da vida.'),
(18, 'Olá! Eu sou Gustavo Ribeiro, focado em nutrição materno-infantil. Acompanho famílias na jornada da maternidade, garantindo nutrição adequada para mães e bebês em cada fase especial.'),
(19, 'Prazer! Sou Tatiane Moura, especialista em nutrição materno-infantil. Trabalho para garantir que mães e crianças tenham toda nutrição necessária para crescer com saúde, amor e cuidado.'),
(20, 'Olá! Sou Eduardo Lima, nutricionista materno-infantil. Dedico-me a orientar famílias sobre alimentação saudável desde a gestação até a adolescência, criando bases sólidas para toda vida.'),
(21, 'Oi! Eu sou Amanda Torres, especializada em nutrição geriátrica. Trabalho para melhorar a qualidade de vida dos idosos através de uma alimentação adequada, promovendo saúde e vitalidade na terceira idade.'),
(22, 'Olá! Sou Fernando Lins, nutricionista geriátrico. Meu foco é criar planos nutricionais específicos para idosos, considerando suas necessidades especiais e promovendo envelhecimento ativo e saudável.'),
(23, 'Prazer! Sou Isabela Martins, especialista em nutrição geriátrica. Acredito que nunca é tarde para cuidar da alimentação. Vou ajudar você ou seu familiar a ter mais energia e qualidade de vida na melhor idade.'),
(24, 'Oi! Eu sou Marina Lima, especializada em nutrição geriátrica. Trabalho para melhorar a qualidade de vida dos idosos através de uma alimentação adequada, promovendo saúde e vitalidade na terceira idade.'),
(25, 'Olá! Sou Laura Figueira, especialista em nutrição preventiva. Acredito que a alimentação é a melhor medicina. Trabalho para prevenir doenças e promover longevidade através de hábitos alimentares saudáveis.'),
(26, 'Oi! Eu sou Rafael Reis, focado em nutrição preventiva. Minha missão é ajudar você a construir uma base alimentar sólida que previne doenças e mantém sua saúde em dia ao longo da vida.'),
(27, 'Prazer! Sou Camila Duarte, nutricionista preventiva. Trabalho com estratégias alimentares para fortalecer seu sistema imunológico e prevenir problemas de saúde antes que eles apareçam.'),
(28, 'Olá! Sou Bruno Salles, especializado em nutrição preventiva. Ajudo pessoas a desenvolver hábitos alimentares que funcionam como escudo protetor contra doenças crônicas e degenerativas.'),
(29, 'Oi! Eu sou Mariana Prado, especialista em nutrição balanceada. Acredito no equilíbrio como chave para uma vida saudável. Vamos encontrar a harmonia perfeita entre prazer e saúde na sua alimentação!'),
(30, 'Olá! Sou Jorge Cardoso, focado em nutrição balanceada. Meu objetivo é criar um plano alimentar sustentável e equilibrado que se adapte ao seu estilo de vida, sem extremos ou restrições desnecessárias.'),
(31, 'Prazer! Sou Juliana Nunes, nutricionista balanceada. Trabalho para que você tenha uma relação saudável com a comida, encontrando o equilíbrio ideal entre todos os grupos alimentares.'),
(32, 'Olá! Sou Andre Vale, especialista em nutrição balanceada. Ajudo você a criar um estilo de vida alimentar equilibrado, promovendo saúde e bem-estar de forma natural e sustentável.'),
(33, 'Oi! Eu sou Bianca Moura, nutricionista funcional. Trabalho investigando as causas dos desequilíbrios no seu organismo, usando a alimentação como ferramenta para restaurar sua saúde de forma integral.'),
(34, 'Olá! Sou Daniel Peixoto, especializado em nutrição funcional. Meu foco é entender como seu corpo funciona e personalizar sua alimentação para otimizar todos os seus sistemas internos.'),
(35, 'Prazer! Sou Vanessa Luz, nutricionista funcional. Acredito que cada pessoa é única, por isso investigo profundamente suas necessidades individuais para criar protocolos alimentares personalizados.'),
(36, 'Olá! Sou Gabriel Lemos, focado em nutrição funcional. Trabalho com uma abordagem integrativa, usando alimentos como medicina para corrigir desequilíbrios e otimizar o funcionamento do seu organismo.');

INSERT INTO `NutricionistasEspecializacoes` (NutricionistaId, EspecializacaoId) VALUES
(1, 1),
(2, 2),
(3, 6),
(4, 2),
(5, 6),
(6, 6),
(7, 6),
(8, 1),
(9, 1),
(10, 2),
(11, 2),
(12, 1),
(13, 7), 
(14, 7),
(15, 7),
(16, 7),
(17, 3),
(18, 3),
(19, 3),
(20, 3),
(21, 8),
(22, 8),
(23, 8),
(24, 8),
(25, 4),
(26, 4),
(27, 4),
(28, 4),
(29, 9),
(30, 9),
(31, 9),
(32, 9),
(33, 5),
(34, 5),
(35, 5),
(36, 5);

INSERT INTO `NutricionistasFormacoes` (NutricionistaId, TipoFormacao, NomeFormacao, NomeInstituicao) VALUES
(1, 'graduacao', 'Nutrição', 'Universidade de São Paulo'),
(1, 'curso', 'Especialização em Nutrição Esportiva', 'Instituto de Nutrição Esportiva'),

(2, 'graduacao', 'Nutrição', 'Universidade Federal de São Paulo'),

(3, 'graduacao', 'Nutrição', 'PUC-SP'),

(4, 'graduacao', 'Nutrição', 'Universidade Mackenzie'),

(5, 'graduacao', 'Nutrição', 'UNINOVE'),

(6, 'graduacao', 'Nutrição', 'Universidade São Judas'),

(7, 'graduacao', 'Nutrição', 'Universidade Cruzeiro do Sul'),

(8, 'graduacao', 'Nutrição', 'Universidade Anhembi Morumbi'),

(9, 'graduacao', 'Nutrição', 'Universidade Paulista'),

(10, 'graduacao', 'Nutrição', 'Centro Universitário FMU'),

(11, 'graduacao', 'Nutrição', 'Universidade São Camilo'),

(12, 'graduacao', 'Nutrição', 'Universidade Ibirapuera'),

(13, 'graduacao', 'Nutrição', 'Universidade Federal de São Paulo'),
(13, 'curso', 'Especialização em Nutrição Vegetariana', 'Instituto de Alimentação Natural'),

(14, 'graduacao', 'Nutrição', 'PUC-SP'),
(14, 'curso', 'Pós-graduação em Nutrição Plant-Based', 'Centro de Estudos em Nutrição Vegana'),

(15, 'graduacao', 'Nutrição', 'Universidade de São Paulo'),
(15, 'curso', 'Especialização em Alimentação Vegetariana', 'Instituto Brasileiro de Nutrição'),

(16, 'graduacao', 'Nutrição', 'Universidade Mackenzie'),
(16, 'curso', 'Curso de Nutrição Vegetariana e Vegana', 'Escola de Nutrição Sustentável'),

(17, 'graduacao', 'Nutrição', 'UNINOVE'),
(17, 'curso', 'Especialização em Nutrição Materno-Infantil', 'Hospital das Clínicas - USP'),

(18, 'graduacao', 'Nutrição', 'Universidade São Judas'),
(18, 'curso', 'Pós-graduação em Nutrição Pediátrica', 'Instituto da Criança - HC'),

(19, 'graduacao', 'Nutrição', 'Universidade Cruzeiro do Sul'),
(19, 'curso', 'Especialização em Nutrição na Gestação', 'Maternidade Pro Matre'),

(20, 'graduacao', 'Nutrição', 'Universidade Anhembi Morumbi'),
(20, 'curso', 'Curso de Alimentação Infantil', 'Instituto Pensi - Sabará'),

(21, 'graduacao', 'Nutrição', 'Universidade Paulista'),
(21, 'curso', 'Especialização em Nutrição Geriátrica', 'Instituto de Geriatria e Gerontologia'),

(22, 'graduacao', 'Nutrição', 'Centro Universitário FMU'),
(22, 'curso', 'Pós-graduação em Envelhecimento Saudável', 'Escola Paulista de Medicina'),

(23, 'graduacao', 'Nutrição', 'Universidade São Camilo'),
(23, 'curso', 'Especialização em Nutrição do Idoso', 'Hospital do Servidor Público Estadual'),

(24, 'graduacao', 'Nutrição', 'Universidade Paulista'),

(25, 'graduacao', 'Nutrição', 'Universidade Federal do Rio de Janeiro'),
(25, 'curso', 'Especialização em Nutrição Preventiva', 'Instituto de Medicina Preventiva'),

(26, 'graduacao', 'Nutrição', 'Universidade Federal de Minas Gerais'),
(26, 'curso', 'Pós-graduação em Saúde Pública e Nutrição', 'Escola Nacional de Saúde Pública'),

(27, 'graduacao', 'Nutrição', 'Universidade de Brasília'),
(27, 'curso', 'Especialização em Nutrição Clínica Preventiva', 'Hospital Sírio-Libanês'),

(28, 'graduacao', 'Nutrição', 'Universidade Federal do Paraná'),
(28, 'curso', 'Curso de Medicina Preventiva e Nutricional', 'Instituto Brasileiro de Medicina Integrativa'),

(29, 'graduacao', 'Nutrição', 'Universidade Federal Fluminense'),
(29, 'curso', 'Especialização em Nutrição Equilibrada', 'Centro de Estudos em Nutrição Balanceada'),

(30, 'graduacao', 'Nutrição', 'Universidade Federal da Bahia'),
(30, 'curso', 'Pós-graduação em Comportamento Alimentar', 'Instituto de Psiquiatria - USP'),

(31, 'graduacao', 'Nutrição', 'Universidade Federal do Ceará'),
(31, 'curso', 'Especialização em Nutrição Comportamental', 'Centro Brasileiro de Nutrição'),

(32, 'graduacao', 'Nutrição', 'Universidade Federal de Pernambuco'),
(32, 'curso', 'Curso de Alimentação Consciente e Sustentável', 'Instituto de Alimentação Natural'),

(33, 'graduacao', 'Nutrição', 'Universidade Federal do Rio Grande do Sul'),
(33, 'curso', 'Especialização em Nutrição Funcional', 'Instituto de Medicina Funcional'),

(34, 'graduacao', 'Nutrição', 'Universidade Federal de Santa Catarina'),
(34, 'curso', 'Pós-graduação em Nutrigenômica e Medicina Funcional', 'Centro de Medicina Integrativa'),

(35, 'graduacao', 'Nutrição', 'Universidade Federal de Goiás'),
(35, 'curso', 'Especialização em Fitoterapia e Nutrição Funcional', 'Instituto Brasileiro de Plantas Medicinais'),

(36, 'graduacao', 'Nutrição', 'Universidade Federal do Espírito Santo'),
(36, 'curso', 'Curso de Nutrição Ortomolecular e Funcional', 'Academia Brasileira de Medicina Ortomolecular');