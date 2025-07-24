CREATE TABLE `Usuarios` (
	`id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
	`Telefone` CHAR(11) NOT NULL UNIQUE,
	`Email` VARCHAR(50) NOT NULL UNIQUE,
	`NomeCompleto` VARCHAR(125) NOT NULL,
    `CEP` CHAR(8),
	`DataNascimento` DATE,
	`UsuarioTipo` ENUM('C', 'N', 'A') NOT NULL DEFAULT 'C',
	`Senha` VARCHAR(25) NOT NULL,
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
 





