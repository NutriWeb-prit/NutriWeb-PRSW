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
('34917673918', 'renata@nutriweb.com', 'Renata Dias', '12345678', '1981-01-15', 'N', '$2b$10$exemplo.hash.senha', 1);

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
(12, 'CRN-2468');

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
(12, 'Eu sou Renata Dias, especializado em nutrição esportiva de alta performance. Se você é um atleta ou busca otimizar seu rendimento, estou aqui para ajustar sua alimentação e levar você ao seu máximo potencial.');

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
(12, 1);

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
(12, 'graduacao', 'Nutrição', 'Universidade Ibirapuera');