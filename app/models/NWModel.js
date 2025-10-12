const pool = require("../../config/pool_conexoes");

const NWModel = {
    findAll: async () => {
        try {
            const [usuarios] = await pool.query(
                `SELECT 
                    u.id,
                    u.NomeCompleto,
                    u.Email,
                    u.Telefone,
                    u.UsuarioTipo,
                    u.UsuarioStatus,
                    CASE 
                        WHEN u.UsuarioTipo = 'C' THEN 'Cliente'
                        WHEN u.UsuarioTipo = 'N' THEN 'Nutricionista'
                        WHEN u.UsuarioTipo = 'A' THEN 'Administrador'
                        ELSE 'Desconhecido'
                    END as TipoUsuarioNome,
                    CASE 
                        WHEN u.UsuarioStatus = 1 THEN 'Ativo'
                        ELSE 'Inativo'
                    END as StatusNome
                FROM Usuarios u
                ORDER BY u.NomeCompleto ASC`
            );
            
            console.log("Usuários carregados:", usuarios.length);
            return usuarios;
        } catch (erro) {
            console.error("Erro ao listar usuários:", erro);
            throw erro;
        }
    },
    
    findId: async (id) => {
        try {
            const [resultado] = await pool.query(
                `SELECT 
                    u.id,
                    u.NomeCompleto,
                    u.Email,
                    u.Telefone,
                    u.UsuarioTipo,
                    u.UsuarioStatus,
                    u.CEP,
                    u.DataNascimento,
                    -- Verificar se existe foto de perfil
                    CASE WHEN p.FotoPerfil IS NOT NULL THEN 1 ELSE 0 END as FotoPerfil,
                    CASE 
                        WHEN u.UsuarioTipo = 'C' THEN 'Cliente'
                        WHEN u.UsuarioTipo = 'N' THEN 'Nutricionista'
                        WHEN u.UsuarioTipo = 'A' THEN 'Administrador'
                        ELSE 'Desconhecido'
                    END as TipoUsuarioNome,
                    CASE 
                        WHEN u.UsuarioStatus = 1 THEN 'Ativo'
                        ELSE 'Inativo'
                    END as StatusNome
                FROM Usuarios u
                LEFT JOIN Perfis p ON u.id = p.UsuarioId
                WHERE u.id = ?`,
                [id]
            );
            
            if (resultado.length === 0) {
                return null;
            }
    
            const usuario = resultado[0];
            
            if (usuario.UsuarioTipo === 'N') {
                const [nutriData] = await pool.query(
                    `SELECT Crn, RazaoSocial FROM Nutricionistas WHERE UsuarioId = ?`,
                    [id]
                );
                
                if (nutriData.length > 0) {
                    usuario.Crn = nutriData[0].Crn;
                    usuario.RazaoSocial = nutriData[0].RazaoSocial;
                }
            }
            
            if (usuario.UsuarioTipo === 'C') {
                const [clientData] = await pool.query(
                    `SELECT CPF FROM Clientes WHERE UsuarioId = ?`,
                    [id]
                );
                
                if (clientData.length > 0) {
                    usuario.CPF = clientData[0].CPF;
                }
            }
            
            console.log("Usuário encontrado:", usuario.NomeCompleto, "- Tem foto:", !!usuario.FotoPerfil);
            return usuario;
        } catch (erro) {
            console.error("Erro ao buscar usuário por ID:", erro);
            throw erro;
        }
    },
    
    // ===== ATUALIZAÇÃO =====
    atualizarUsuarioADM: async (usuarioId, dadosAtualizacao) => {
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            await conn.query(
                `UPDATE Usuarios SET 
                    NomeCompleto = ?,
                    Email = ?,
                    Telefone = ?,
                    UsuarioStatus = ?
                WHERE id = ?`,
                [
                    dadosAtualizacao.NomeCompleto,
                    dadosAtualizacao.Email,
                    dadosAtualizacao.Telefone,
                    dadosAtualizacao.UsuarioStatus,
                    usuarioId
                ]
            );
            
            await conn.commit();
            console.log("Usuário atualizado com sucesso - ID:", usuarioId);
            return true;
            
        } catch (erro) {
            await conn.rollback();
            console.error("Erro ao atualizar usuário ADM:", erro);
            throw erro;
        } finally {
            conn.release();
        }
    },
    
    atualizarUsuarioCompletoADM: async (usuarioId, dadosAtualizacao, dadosEspecificos, tipoUsuario) => {
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
    
            console.log("Iniciando transação de atualização - Usuário ID:", usuarioId);
    
            const camposUsuario = Object.keys(dadosAtualizacao)
                .map(campo => `${campo} = ?`)
                .join(', ');
            
            const valoresUsuario = Object.values(dadosAtualizacao);
            valoresUsuario.push(usuarioId);
    
            const queryUsuario = `UPDATE Usuarios SET ${camposUsuario} WHERE id = ?`;
            
            await conn.query(queryUsuario, valoresUsuario);
            console.log("✓ Dados gerais do usuário atualizados");
    
            if (dadosEspecificos.fotoPerfil) {
                console.log("Processando atualização de avatar...");
    
                const [perfilExistente] = await conn.query(
                    'SELECT id FROM Perfis WHERE UsuarioId = ?',
                    [usuarioId]
                );
    
                if (perfilExistente.length > 0) {
                    await conn.query(
                        'UPDATE Perfis SET FotoPerfil = ? WHERE UsuarioId = ?',
                        [dadosEspecificos.fotoPerfil, usuarioId]
                    );
                    console.log("✓ Avatar atualizado em perfil existente");
                } else {
                    await conn.query(
                        'INSERT INTO Perfis (UsuarioId, FotoPerfil) VALUES (?, ?)',
                        [usuarioId, dadosEspecificos.fotoPerfil]
                    );
                    console.log("✓ Novo perfil criado com avatar");
                }
            }
    
            if (tipoUsuario === 'N') {
                const camposNutri = [];
                const valoresNutri = [];
    
                if (dadosEspecificos.Crn !== undefined && dadosEspecificos.Crn !== null) {
                    camposNutri.push('Crn = ?');
                    valoresNutri.push(dadosEspecificos.Crn);
                }
    
                if (dadosEspecificos.RazaoSocial !== undefined && dadosEspecificos.RazaoSocial !== null) {
                    camposNutri.push('RazaoSocial = ?');
                    valoresNutri.push(dadosEspecificos.RazaoSocial);
                }
    
                if (camposNutri.length > 0) {
                    valoresNutri.push(usuarioId);
                    const queryNutri = `UPDATE Nutricionistas SET ${camposNutri.join(', ')} WHERE UsuarioId = ?`;
                    await conn.query(queryNutri, valoresNutri);
                    console.log("✓ Dados do nutricionista atualizados");
                }
    
                if (dadosEspecificos.SobreMim !== undefined) {
                    const [perfilExistente] = await conn.query(
                        'SELECT id FROM Perfis WHERE UsuarioId = ?',
                        [usuarioId]
                    );
    
                    if (perfilExistente.length > 0) {
                        await conn.query(
                            'UPDATE Perfis SET SobreMim = ? WHERE UsuarioId = ?',
                            [dadosEspecificos.SobreMim, usuarioId]
                        );
                    } else {
                        await conn.query(
                            'INSERT INTO Perfis (UsuarioId, SobreMim) VALUES (?, ?)',
                            [usuarioId, dadosEspecificos.SobreMim]
                        );
                    }
                    console.log("✓ Perfil (Sobre Mim) atualizado");
                }
            } else if (tipoUsuario === 'C') {
                console.log("✓ Cliente atualizado (CPF é imutável)");
            }
    
            await conn.commit();
            console.log("✓✓ Transação confirmada com sucesso");
            return true;
    
        } catch (erro) {
            await conn.rollback();
            console.error("✗ Erro na transação:", erro.message);
            throw erro;
        } finally {
            conn.release();
        }
    },

    // ===== EXCLUSÃO =====
    delete: async (id) => {
        try {
            const [resultado] = await pool.query(
                `UPDATE Usuarios SET UsuarioStatus = 0 WHERE id = ?`,
                [id]
            );
            
            console.log("Usuário inativado - ID:", id);
            return resultado;
        } catch (erro) {
            console.error("Erro ao excluir usuário:", erro);
            throw erro;
        }
    },

    // Buscar usuário por email para login
    findByEmail: async (email) => {
        try {
            const [linhas] = await pool.query(
                "SELECT * FROM Usuarios WHERE Email = ? AND UsuarioStatus = 1",
                [email]
            );
            console.log("Resultado da consulta:", linhas);
            return linhas;
        } catch (erro) {
            console.log(erro);
            return false;
        }
    },

    contarUsuarios: async () => {
        try {
            const [resultado] = await pool.query(
                `SELECT COUNT(*) as total FROM Usuarios WHERE UsuarioStatus = 1`
            );
            
            const total = resultado[0].total || 0;
            console.log("Total de usuários:", total);
            return total;
        } catch (erro) {
            console.error("Erro ao contar usuários:", erro);
            return 0;
        }
    },
    
    contarClientes: async () => {
        try {
            const [resultado] = await pool.query(
                `SELECT COUNT(DISTINCT c.id) as total 
                 FROM Clientes c
                 INNER JOIN Usuarios u ON c.UsuarioId = u.id
                 WHERE u.UsuarioStatus = 1 AND u.UsuarioTipo = 'C'`
            );
            
            const total = resultado[0].total || 0;
            console.log("Total de clientes:", total);
            return total;
        } catch (erro) {
            console.error("Erro ao contar clientes:", erro);
            return 0;
        }
    },
    
    contarNutricionistas: async () => {
        try {
            const [resultado] = await pool.query(
                `SELECT COUNT(DISTINCT n.id) as total 
                 FROM Nutricionistas n
                 INNER JOIN Usuarios u ON n.UsuarioId = u.id
                 WHERE u.UsuarioStatus = 1 AND u.UsuarioTipo = 'N'`
            );
            
            const total = resultado[0].total || 0;
            console.log("Total de nutricionistas:", total);
            return total;
        } catch (erro) {
            console.error("Erro ao contar nutricionistas:", erro);
            return 0;
        }
    },

    atualizarEBuscarDados: async (usuarioId, dadosUsuario, dadosEspecificos, dadosPerfil, especializacoes, tipoUsuario) => {
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            // Atualizar dados do usuário
            await conn.query(
                `UPDATE Usuarios SET 
                    NomeCompleto = ?, 
                    Email = ?, 
                    Telefone = ?
                    ${dadosUsuario.Senha ? ', Senha = ?' : ''} 
                WHERE id = ?`,
                dadosUsuario.Senha ? 
                    [dadosUsuario.NomeCompleto, dadosUsuario.Email, dadosUsuario.Telefone, dadosUsuario.Senha, usuarioId] :
                    [dadosUsuario.NomeCompleto, dadosUsuario.Email, dadosUsuario.Telefone, usuarioId]
            );
    
            // Atualizar dados específicos do tipo de usuário
            if (tipoUsuario === 'N' && dadosEspecificos.Crn) {
                await conn.query(
                    `UPDATE Nutricionistas SET Crn = ? WHERE UsuarioId = ?`,
                    [dadosEspecificos.Crn, usuarioId]
                );
            }
    
            // Atualizar perfil - Verificar se existe registro primeiro
            if (dadosPerfil.SobreMim !== undefined) {
                // Verificar se já existe um perfil para o usuário
                const [perfilExistente] = await conn.query(
                    `SELECT id FROM Perfis WHERE UsuarioId = ?`,
                    [usuarioId]
                );
                
                if (perfilExistente.length > 0) {
                    // Atualizar perfil existente
                    await conn.query(
                        `UPDATE Perfis SET SobreMim = ? WHERE UsuarioId = ?`,
                        [dadosPerfil.SobreMim, usuarioId]
                    );
                } else {
                    // Criar novo perfil
                    await conn.query(
                        `INSERT INTO Perfis (UsuarioId, SobreMim) VALUES (?, ?)`,
                        [usuarioId, dadosPerfil.SobreMim]
                    );
                }
            }
    
            // Atualizar especializações para nutricionistas
            if (tipoUsuario === 'N' && especializacoes && especializacoes.length > 0) {
                // Remover especializações antigas
                await conn.query(
                    `DELETE ne FROM NutricionistasEspecializacoes ne
                     INNER JOIN Nutricionistas n ON ne.NutricionistaId = n.id
                     WHERE n.UsuarioId = ?`,
                    [usuarioId]
                );
    
                // Inserir novas especializações
                const [nutricionistaResult] = await conn.query(
                    `SELECT id FROM Nutricionistas WHERE UsuarioId = ?`,
                    [usuarioId]
                );
    
                if (nutricionistaResult.length > 0) {
                    const nutricionistaId = nutricionistaResult[0].id;
                    
                    for (const especializacao of especializacoes) {
                        await conn.query(
                            `INSERT INTO NutricionistasEspecializacoes (NutricionistaId, EspecializacaoId)
                             SELECT ?, e.id FROM Especializacoes e WHERE e.Nome = ?`,
                            [nutricionistaId, especializacao]
                        );
                    }
                }
            }
    
            await conn.commit();
            
            // Buscar dados atualizados na mesma conexão
            let dadosAtualizados = {};
            if (tipoUsuario === 'N') {
                const [rows] = await conn.query(
                    `SELECT 
                        u.NomeCompleto,
                        u.Email,
                        u.Telefone,
                        n.Crn,
                        p.SobreMim,
                        (SELECT GROUP_CONCAT(e.Nome SEPARATOR ', ') 
                         FROM NutricionistasEspecializacoes ne 
                         INNER JOIN Especializacoes e ON ne.EspecializacaoId = e.id 
                         WHERE ne.NutricionistaId = n.id) as Especializacoes
                    FROM Usuarios u
                    INNER JOIN Nutricionistas n ON u.id = n.UsuarioId
                    LEFT JOIN Perfis p ON u.id = p.UsuarioId
                    WHERE u.id = ?`,
                    [usuarioId]
                );
                
                if (rows.length > 0) {
                    const dados = rows[0];
                    dadosAtualizados = {
                        nome: dados.NomeCompleto,
                        email: dados.Email,
                        telefone: dados.Telefone.slice(-9),
                        ddd: dados.Telefone.slice(0, 2),
                        crn: dados.Crn,
                        sobreMim: dados.SobreMim || '',
                        area: dados.Especializacoes ? dados.Especializacoes.split(', ') : [],
                        senha: ''
                    };
                }
            } else {
                const [rows] = await conn.query(
                    `SELECT 
                        u.NomeCompleto,
                        u.Email,
                        u.Telefone
                    FROM Usuarios u
                    WHERE u.id = ?`,
                    [usuarioId]
                );
                
                if (rows.length > 0) {
                    const dados = rows[0];
                    dadosAtualizados = {
                        nome: dados.NomeCompleto,
                        email: dados.Email,
                        telefone: dados.Telefone.slice(-9),
                        ddd: dados.Telefone.slice(0, 2),
                        senha: ''
                    };
                }
            }
            
            return dadosAtualizados;
            
        } catch (error) {
            await conn.rollback();
            console.error("Erro na transação de atualização:", error);
            throw error;
        } finally {
            conn.release();
        }
    },

    atualizarImagensUsuario: async (usuarioId, fotoPerfil = null, fotoBanner = null) => {
        let conn;
        
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            await conn.beginTransaction();
    
            // Verificar se o usuário já tem um perfil
            const [perfilExistente] = await conn.query(
                "SELECT id FROM Perfis WHERE UsuarioId = ?",
                [usuarioId]
            );
    
            let dadosPerfil = {};
            let temAtualizacao = false;
    
            // Preparar dados para atualização
            if (fotoPerfil) {
                if (fotoPerfil.buffer.length > 16 * 1024 * 1024) {
                    throw new Error('Foto de perfil muito grande. Máximo permitido: 16MB');
                }
                dadosPerfil.FotoPerfil = fotoPerfil.buffer;
                temAtualizacao = true;
            }
    
            if (fotoBanner) {
                if (fotoBanner.buffer.length > 16 * 1024 * 1024) {
                    throw new Error('Banner muito grande. Máximo permitido: 16MB');
                }
                dadosPerfil.FotoBanner = fotoBanner.buffer;
                temAtualizacao = true;
            }
    
            if (!temAtualizacao) {
                throw new Error('Nenhuma imagem válida foi fornecida para atualização');
            }
    
            let resultado;
    
            if (perfilExistente.length > 0) {
                console.log('Atualizando perfil existente, ID:', perfilExistente[0].id);
                
                // Atualizar perfil existente
                const campos = [];
                const valores = [];
    
                if (fotoPerfil) {
                    campos.push('FotoPerfil = ?');
                    valores.push(fotoPerfil.buffer);
                    console.log('Adicionando foto de perfil, tamanho buffer:', fotoPerfil.buffer.length);
                }
    
                if (fotoBanner) {
                    campos.push('FotoBanner = ?');
                    valores.push(fotoBanner.buffer);
                    console.log('Adicionando foto de banner, tamanho buffer:', fotoBanner.buffer.length);
                }
    
                valores.push(usuarioId);
    
                const queryUpdate = `UPDATE Perfis SET ${campos.join(', ')} WHERE UsuarioId = ?`;
                console.log('Query de update:', queryUpdate);
                console.log('Valores (sem buffers):', valores.length, 'valores');
    
                const [updateResult] = await conn.query(queryUpdate, valores);
                console.log('Resultado do UPDATE:', updateResult);
    
                resultado = {
                    perfilId: perfilExistente[0].id,
                    operacao: 'atualizado',
                    linhasAfetadas: updateResult.affectedRows
                };
    
            } else {
                // Criar novo perfil
                dadosPerfil.UsuarioId = usuarioId;
                
                const [insertResult] = await conn.query(
                    "INSERT INTO Perfis SET ?",
                    [dadosPerfil]
                );
    
                resultado = {
                    perfilId: insertResult.insertId,
                    operacao: 'criado',
                    linhasAfetadas: insertResult.affectedRows
                };
            }
    
            await conn.commit();
            
            return {
                usuarioId,
                ...resultado,
                imagensAtualizadas: {
                    fotoPerfil: !!fotoPerfil,
                    fotoBanner: !!fotoBanner
                }
            };
    
        } catch (err) {
            console.error("Erro ao atualizar imagens do usuário:", err.message);
            
            if (conn) {
                try {
                    await conn.rollback();
                } catch (rollbackErr) {
                    console.error('Erro no rollback:', rollbackErr.message);
                }
            }
            
            throw err;
            
        } finally {
            if (conn) {
                try {
                    conn.release();
                } catch (releaseErr) {
                    console.error('Erro ao liberar conexão:', releaseErr.message);
                }
            }
        }
    },

    buscarDadosParaComparacao: async (usuarioId, tipoUsuario) => {
        try {
            if (tipoUsuario === 'N') {
                const [rows] = await pool.query(
                    `SELECT 
                        u.NomeCompleto as nome,
                        u.Email as email,
                        u.Telefone as telefone,
                        n.Crn as crn,
                        p.SobreMim as sobreMim,
                        (SELECT GROUP_CONCAT(e.Nome SEPARATOR ', ') 
                         FROM NutricionistasEspecializacoes ne 
                         INNER JOIN Especializacoes e ON ne.EspecializacaoId = e.id 
                         WHERE ne.NutricionistaId = n.id) as especializacoes_str
                    FROM Usuarios u
                    INNER JOIN Nutricionistas n ON u.id = n.UsuarioId
                    LEFT JOIN Perfis p ON u.id = p.UsuarioId
                    WHERE u.id = ? AND u.UsuarioStatus = 1`,
                    [usuarioId]
                );
                
                if (rows.length === 0) return null;
                
                const dados = rows[0];
                return {
                    nome: dados.nome,
                    email: dados.email,
                    telefone: dados.telefone,
                    crn: dados.crn,
                    sobreMim: dados.sobreMim || '',
                    especializacoes: dados.especializacoes_str ? dados.especializacoes_str.split(', ') : []
                };
            } else {
                const [rows] = await pool.query(
                    `SELECT 
                        u.NomeCompleto as nome,
                        u.Email as email,
                        u.Telefone as telefone
                    FROM Usuarios u
                    INNER JOIN Clientes c ON u.id = c.UsuarioId
                    WHERE u.id = ? AND u.UsuarioStatus = 1`,
                    [usuarioId]
                );
                
                if (rows.length === 0) return null;
                
                return {
                    nome: rows[0].nome,
                    email: rows[0].email,
                    telefone: rows[0].telefone
                };
            }
        } catch (erro) {
            console.error("Erro ao buscar dados para comparação:", erro);
            throw erro;
        }
    },

    verificarDadosExistentesParaAtualizacao: async (dados, usuarioId) => {
        try {
            const checks = [];
            const params = [];
            
            // Verificar email
            if (dados.email) {
                checks.push(`(SELECT COUNT(*) FROM Usuarios WHERE Email = ? AND id != ? AND UsuarioStatus = 1) as email_existe`);
                params.push(dados.email, usuarioId);
            }
            
            // Verificar telefone
            if (dados.telefone) {
                checks.push(`(SELECT COUNT(*) FROM Usuarios WHERE Telefone = ? AND id != ? AND UsuarioStatus = 1) as telefone_existe`);
                params.push(dados.telefone, usuarioId);
            }
            
            // Verificar CRN
            if (dados.crn) {
                checks.push(`(SELECT COUNT(*) FROM Nutricionistas n INNER JOIN Usuarios u ON n.UsuarioId = u.id WHERE n.Crn = ? AND n.UsuarioId != ? AND u.UsuarioStatus = 1) as crn_existe`);
                params.push(dados.crn, usuarioId);
            }
            
            if (checks.length === 0) {
                return { email: false, telefone: false, crn: false };
            }
            
            const query = `SELECT ${checks.join(', ')}`;
            const [rows] = await pool.query(query, params);
            
            return {
                email: dados.email ? rows[0].email_existe > 0 : false,
                telefone: dados.telefone ? rows[0].telefone_existe > 0 : false,
                crn: dados.crn ? rows[0].crn_existe > 0 : false
            };
            
        } catch (error) {
            console.error("Erro ao verificar dados existentes:", error.message);
            throw error;
        }
    },

    buscarConteudo: async (termo) => {
        try {
            // Preparamos o termo para busca (adiciona % para busca parcial)
            const termoBusca = `%${termo}%`;
            
            // Busca publicações que contenham o termo na legenda ou categoria
            const queryPublicacoes = `
                SELECT 
                    p.id,
                    p.Legenda,
                    p.Categoria,
                    p.MediaEstrelas,
                    p.FotoPublicacao,
                    u.NomeCompleto as autor_nome,
                    perf.FotoPerfil as autor_foto,
                    u.id as autor_id,
                    n.id as nutricionista_id
                FROM Publicacoes p
                INNER JOIN NutricionistaPublicacao np ON p.id = np.PublicacaoId
                INNER JOIN Nutricionistas n ON np.NutricionistaId = n.id
                INNER JOIN Usuarios u ON n.UsuarioId = u.id
                LEFT JOIN Perfis perf ON u.id = perf.UsuarioId
                WHERE (p.Legenda LIKE ? OR p.Categoria LIKE ?)
                  AND u.UsuarioStatus = 1
                ORDER BY p.MediaEstrelas DESC, p.id DESC
                LIMIT 10
            `;
    
            // Busca nutricionistas que contenham o termo no nome ou nas especializações
            const queryNutricionistas = `
                SELECT 
                    u.id as usuario_id,
                    u.NomeCompleto,
                    u.CEP,
                    perf.FotoPerfil,
                    perf.SobreMim,
                    n.id as nutricionista_id,
                    n.RazaoSocial,
                    GROUP_CONCAT(DISTINCT esp.Nome SEPARATOR ', ') as especializacoes,
                    AVG(p.MediaEstrelas) as media_avaliacoes,
                    COUNT(DISTINCT np.PublicacaoId) as total_publicacoes
                FROM Usuarios u
                INNER JOIN Nutricionistas n ON u.id = n.UsuarioId
                LEFT JOIN Perfis perf ON u.id = perf.UsuarioId
                LEFT JOIN NutricionistasEspecializacoes ne ON n.id = ne.NutricionistaId
                LEFT JOIN Especializacoes esp ON ne.EspecializacaoId = esp.id
                LEFT JOIN NutricionistaPublicacao np ON n.id = np.NutricionistaId
                LEFT JOIN Publicacoes p ON np.PublicacaoId = p.id
                WHERE u.UsuarioTipo = 'N' 
                  AND u.UsuarioStatus = 1
                  AND (u.NomeCompleto LIKE ? 
                       OR esp.Nome LIKE ? 
                       OR n.RazaoSocial LIKE ?)
                GROUP BY u.id, n.id
                ORDER BY media_avaliacoes DESC, u.NomeCompleto ASC
                LIMIT 10
            `;
    
            // Executa as duas consultas ao banco de dados
            const [publicacoes] = await pool.query(queryPublicacoes, [termoBusca, termoBusca]);
            const [nutricionistas] = await pool.query(queryNutricionistas, [termoBusca, termoBusca, termoBusca]);
    
            // Processa os resultados das publicações
            const publicacoesProcessadas = publicacoes.map(pub => {
                let resumo = '';
                if (pub.Legenda) {
                    // Pega apenas os primeiros 150 caracteres da legenda
                    resumo = pub.Legenda.length > 150 
                        ? pub.Legenda.substring(0, 150) + '...' 
                        : pub.Legenda;
                }
    
                return {
                    id: pub.id,
                    legenda: pub.Legenda || '',
                    resumo: resumo,
                    categoria: pub.Categoria,
                    mediaEstrelas: pub.MediaEstrelas ? parseFloat(pub.MediaEstrelas).toFixed(1) : '0.0',
                    temFoto: pub.FotoPublicacao ? true : false,
                    autor: {
                        id: pub.autor_id,
                        nutricionistaId: pub.nutricionista_id,
                        nome: pub.autor_nome,
                        fotoPerfil: pub.autor_foto || null
                    },
                    // URL para a publicação completa
                    url: `/publicacao/${pub.id}`
                };
            });
    
            // Processa os resultados dos nutricionistas
            const nutricionistasProcessados = nutricionistas.map(nut => {
                let localizacao = 'Localização não informada';
                if (nut.CEP) {
                    // Você pode implementar uma função para converter CEP em cidade/estado
                    localizacao = `CEP: ${nut.CEP}`;
                }
    
                return {
                    id: nut.usuario_id,
                    nutricionistaId: nut.nutricionista_id,
                    nome: nut.NomeCompleto,
                    razaoSocial: nut.RazaoSocial,
                    fotoPerfil: nut.FotoPerfil || null,
                    sobreMim: nut.SobreMim || '',
                    especializacoes: nut.especializacoes || 'Sem especialização definida',
                    localizacao: localizacao,
                    mediaAvaliacoes: nut.media_avaliacoes ? parseFloat(nut.media_avaliacoes).toFixed(1) : 'Sem avaliações',
                    totalPublicacoes: nut.total_publicacoes || 0,
                    // URL para o perfil do nutricionista
                    url: `/perfilnutri?id=${nut.nutricionista_id}`
                };
            });
    
            // Retorna os resultados organizados
            return {
                publicacoes: publicacoesProcessadas,
                nutricionistas: nutricionistasProcessados
            };
    
        } catch (error) {
            console.error('Erro ao buscar conteúdo:', error);
            throw new Error('Erro ao realizar busca no banco de dados');
        }
    },

    mostrarPerfilCliente: async (req, res) => {
        try {
            // Verificar se o usuário está logado
            if (!req.session.usuario || req.session.usuario.tipo !== 'C') {
                return res.redirect('/login?erro=acesso_negado');
            }
            
            const usuarioId = req.session.usuario.id;
            console.log("Carregando perfil do cliente ID:", usuarioId);
            
            // Buscar dados completos do cliente
            const dadosCliente = await NWModel.findClienteCompleto(usuarioId);
            
            if (!dadosCliente || dadosCliente.length === 0) {
                console.log("Cliente não encontrado");
                return res.render("pages/indexPerfilCliente", {
                    erro: "Dados do cliente não encontrados",
                    cliente: null,
                    publicacoesCurtidas: []
                });
            }
            
            const cliente = dadosCliente[0];

            const publicacoesCurtidas = await NWModel.findPublicacoesCurtidas(usuarioId);
            
            const dadosProcessados = {
                id: cliente.id,
                nome: cliente.NomeCompleto,
                email: cliente.Email,
                telefone: cliente.Telefone ? 
                    `(${cliente.Telefone.substring(0,2)}) ${cliente.Telefone.substring(2,7)}-${cliente.Telefone.substring(7)}` : 
                    null,
                cpf: cliente.CPF,
                cep: cliente.CEP,
                dataNascimento: cliente.DataNascimento,
                objetivos: cliente.SobreMim || "Ainda não definiu seus objetivos nutricionais.",
                interesses: cliente.InteressesNutricionais || "Nenhum interesse cadastrado",
                
                // Processar fotos
                fotoPerfil: cliente.FotoPerfil ? 
                    `data:image/jpeg;base64,${cliente.FotoPerfil.toString('base64')}` : 
                    'imagens/foto_perfil.jpg',
                
                fotoBanner: cliente.FotoBanner ? 
                    `data:image/jpeg;base64,${cliente.FotoBanner.toString('base64')}` : 
                    null,
                
                publicacoes: publicacoesCurtidas.map(pub => ({
                    id: pub.id,
                    imagem: pub.FotoPublicacao ? 
                        `data:image/jpeg;base64,${pub.FotoPublicacao.toString('base64')}` : 
                        'imagens/placeholder-post.jpg',
                    legenda: pub.Legenda,
                    categoria: pub.Categoria,
                    estrelas: pub.MediaEstrelas,
                    dataCurtida: pub.DataCurtida
                }))
            };
            
            console.log("Dados processados para o cliente:", {
                nome: dadosProcessados.nome,
                email: dadosProcessados.email,
                quantidadePublicacoes: dadosProcessados.publicacoes.length,
                temFotoPerfil: !!cliente.FotoPerfil,
                temObjetivos: !!cliente.SobreMim
            });
            
            return res.render("pages/indexPerfilCliente", {
                erro: null,
                cliente: dadosProcessados,
                publicacoesCurtidas: dadosProcessados.publicacoes
            });
            
        } catch (erro) {
            console.error("Erro ao carregar perfil do cliente:", erro);
            return res.render("pages/indexPerfilCliente", {
                erro: "Erro interno. Tente novamente mais tarde.",
                cliente: null,
                publicacoesCurtidas: []
            });
        }
    },

    findPerfilCompleto: async (usuarioId) => {
        try {
            const [clienteResult] = await pool.query(
                `SELECT 
                    u.id,
                    u.NomeCompleto,
                    u.Email,
                    u.Telefone,
                    u.CEP,
                    u.DataNascimento,
                    c.id as ClienteId,
                    c.CPF,
                    -- Verificar SE existe foto, mas não carregar os dados
                    CASE WHEN p.FotoPerfil IS NOT NULL THEN 1 ELSE 0 END as FotoPerfil,
                    CASE WHEN p.FotoBanner IS NOT NULL THEN 1 ELSE 0 END as FotoBanner,
                    p.SobreMim,
                    -- Otimizar GROUP_CONCAT com LIMIT
                    (SELECT GROUP_CONCAT(i.Nome SEPARATOR ', ') 
                     FROM ClientesInteresses ci 
                     INNER JOIN InteressesNutricionais i ON ci.InteresseId = i.id 
                     WHERE ci.ClienteId = c.id 
                     LIMIT 10) as InteressesNutricionais
                FROM Usuarios u
                INNER JOIN Clientes c ON u.id = c.UsuarioId
                LEFT JOIN Perfis p ON u.id = p.UsuarioId
                WHERE u.id = ? AND u.UsuarioStatus = 1`,
                [usuarioId]
            );
            
            if (clienteResult.length === 0) {
                return { cliente: null, publicacoes: [] };
            }
            
            const cliente = clienteResult[0];
            
            const [publicacoes] = await pool.query(
                `SELECT 
                    p.id as PublicacaoId,
                    p.Legenda,
                    p.Categoria,
                    p.MediaEstrelas,
                    cp.DataCurtida,
                    -- Verificar SE existe foto, mas não carregar os dados
                    CASE WHEN p.FotoPublicacao IS NOT NULL THEN 1 ELSE 0 END as FotoPublicacao
                FROM Publicacoes p
                INNER JOIN CurtidasPublicacoes cp ON p.id = cp.PublicacaoId
                WHERE cp.ClienteId = ?
                ORDER BY cp.DataCurtida DESC
                LIMIT 12`,
                [cliente.ClienteId]
            );
            
            console.log("Perfil carregado otimizado:", {
                clienteId: cliente.id,
                publicacoesCurtidas: publicacoes.length
            });
            
            return {
                cliente: cliente,
                publicacoes: publicacoes
            };
            
        } catch (erro) {
            console.log("Erro ao buscar perfil otimizado:", erro);
            return { cliente: null, publicacoes: [] };
        }
    },

    findPerfilNutri: async (usuarioId) => {
        try {
            const [nutricionistaResult] = await pool.query(
                `SELECT 
                    u.id,
                    u.NomeCompleto,
                    u.Email,
                    u.Telefone,
                    n.id as NutricionistaId,
                    n.Crn,
                    CASE WHEN p.FotoPerfil IS NOT NULL THEN 1 ELSE 0 END as FotoPerfil,
                    CASE WHEN p.FotoBanner IS NOT NULL THEN 1 ELSE 0 END as FotoBanner,
                    p.SobreMim,
                    (SELECT GROUP_CONCAT(e.Nome SEPARATOR ', ') 
                     FROM NutricionistasEspecializacoes ne 
                     INNER JOIN Especializacoes e ON ne.EspecializacaoId = e.id 
                     WHERE ne.NutricionistaId = n.id 
                     LIMIT 10) as Especializacoes
                FROM Usuarios u
                INNER JOIN Nutricionistas n ON u.id = n.UsuarioId
                LEFT JOIN Perfis p ON u.id = p.UsuarioId
                WHERE u.id = ? AND u.UsuarioStatus = 1`,
                [usuarioId]
            );
            
            if (nutricionistaResult.length === 0) {
                return { nutricionista: null, formacoes: [], contatosSociais: [] };
            }
            
            const nutricionista = nutricionistaResult[0];
            
            const [formacoes] = await pool.query(
                `SELECT 
                    id,
                    TipoFormacao,
                    NomeFormacao,
                    NomeInstituicao,
                    CASE WHEN CertificadoArquivo IS NOT NULL THEN 1 ELSE 0 END as CertificadoArquivo
                FROM NutricionistasFormacoes
                WHERE NutricionistaId = ?
                ORDER BY TipoFormacao DESC, DataCriacao DESC`,
                [nutricionista.NutricionistaId]
            );
            
            const [contatosSociais] = await pool.query(
                `SELECT 
                    cs.Tipo,
                    cs.Link
                FROM ContatoSociais cs
                INNER JOIN NutricionistaContatoSociais ncs ON cs.id = ncs.ContatoSociaisId
                WHERE ncs.NutricionistaId = ?`,
                [nutricionista.NutricionistaId]
            );
            
            console.log("Perfil básico carregado:", {
                nutricionistaId: nutricionista.id,
                formacoes: formacoes.length,
                contatosSociais: contatosSociais.length
            });
            
            return {
                nutricionista: nutricionista,
                formacoes: formacoes,
                contatosSociais: contatosSociais
            };
            
        } catch (erro) {
            console.log("Erro ao buscar perfil básico do nutricionista:", erro);
            return { nutricionista: null, formacoes: [], contatosSociais: [] };
        }
    },
    
    findImagemPerfil: async (usuarioId) => {
        try {
            const [result] = await pool.query(
                "SELECT FotoPerfil FROM Perfis WHERE UsuarioId = ?",
                [usuarioId]
            );
            
            return result.length > 0 ? result[0].FotoPerfil : null;
        } catch (erro) {
            console.log("Erro ao buscar imagem de perfil:", erro);
            return null;
        }
    },
    
    findImagemBanner: async (usuarioId) => {
        try {
            console.log("Buscando banner para usuarioId:", usuarioId);
            const [result] = await pool.query(
                'SELECT FotoBanner FROM Perfis WHERE UsuarioId = ? AND FotoBanner IS NOT NULL',
                [usuarioId]
            );
            
            console.log("Resultado da query banner:", result.length > 0 ? "Encontrado" : "Não encontrado");
            return result.length > 0 ? result[0].FotoBanner : null;
        } catch (erro) {
            console.log("Erro ao buscar imagem de banner:", erro);
            return null;
        }
    },
    
    findImagemPublicacao: async (publicacaoId) => {
        try {
            const [result] = await pool.query(
                "SELECT FotoPublicacao FROM Publicacoes WHERE id = ?",
                [publicacaoId]
            );
            
            return result.length > 0 ? result[0].FotoPublicacao : null;
        } catch (erro) {
            console.log("Erro ao buscar imagem da publicação:", erro);
            return null;
        }
    },
    
    findUsuarioIdByNutricionistaId: async (nutricionistaId) => {
        try {
            const [result] = await pool.query(
                'SELECT UsuarioId FROM Nutricionistas WHERE id = ? AND EXISTS (SELECT 1 FROM Usuarios WHERE id = Nutricionistas.UsuarioId AND UsuarioStatus = 1)',
                [nutricionistaId]
            );
            
            return result.length > 0 ? result[0].UsuarioId : null;
        } catch (erro) {
            console.log("Erro ao buscar UsuarioId por NutricionistaId:", erro);
            return null;
        }
    },
    
    findNutricionistaIdByUsuarioId: async (usuarioId) => {
        try {
            const [result] = await pool.query(
                'SELECT id FROM Nutricionistas WHERE UsuarioId = ? AND EXISTS (SELECT 1 FROM Usuarios WHERE id = ? AND UsuarioStatus = 1)',
                [usuarioId, usuarioId]
            );
            
            return result.length > 0 ? result[0].id : null;
        } catch (erro) {
            console.log("Erro ao buscar NutricionistaId por UsuarioId:", erro);
            return null;
        }
    },

    // Função para servir certificados (mantida igual)
    findCertificado: async (formacaoId) => {
        try {
            const [result] = await pool.query(
                `SELECT 
                    CertificadoArquivo,
                    CertificadoNome,
                    CertificadoTipo
                FROM NutricionistasFormacoes 
                WHERE id = ?`,
                [formacaoId]
            );
            
            return result.length > 0 ? result[0] : null;
        } catch (erro) {
            console.log("Erro ao buscar certificado:", erro);
            return null;
        }
    },

    // Criar um usuário Cliente
    createCliente: async (dadosUsuario, cpfLimpo, imagemPerfil = null, imagemBanner = null, interessesSelecionados = []) => {
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
    
            // 1. Inserir usuário
            const [usuarioResult] = await conn.query(
                "INSERT INTO Usuarios SET ?", 
                [dadosUsuario]
            );
            const usuarioId = usuarioResult.insertId;
    
            // 2. Inserir cliente
            const [clienteResult] = await conn.query(
                "INSERT INTO Clientes (UsuarioId, CPF) VALUES (?, ?)", 
                [usuarioId, cpfLimpo]
            );
            const clienteId = clienteResult.insertId;
    
            // 3. Inserir perfil com imagens (se houver)
            if (imagemPerfil || imagemBanner) {
                const dadosPerfil = { UsuarioId: usuarioId };
    
                if (imagemPerfil) {
                    if (imagemPerfil.buffer.length > 16 * 1024 * 1024) {
                        throw new Error('Foto de perfil muito grande. Máximo permitido: 16MB');
                    }
                    dadosPerfil.FotoPerfil = imagemPerfil.buffer;
                }
    
                if (imagemBanner) {
                    if (imagemBanner.buffer.length > 16 * 1024 * 1024) {
                        throw new Error('Banner muito grande. Máximo permitido: 16MB');
                    }
                    dadosPerfil.FotoBanner = imagemBanner.buffer;
                }
    
                await conn.query("INSERT INTO Perfis SET ?", [dadosPerfil]);
            }
    
            // 4. Processar interesses nutricionais
            if (interessesSelecionados && Array.isArray(interessesSelecionados) && interessesSelecionados.length > 0) {
                const mapeamentoInteresses = {
                    'emagrecimento': 1,
                    'massaMuscular': 2,
                    'Controle': 3,
                    'estetica': 4,
                    'doençasCronicas': 5,
                    'dietaVegetariana': 6,
                    'gestantesCrianças': 7,
                    'saudeIdoso': 8,
                    'alimentacaoSaudavel': 9
                };
    
                // Inserir interesses em lote
                const interessesParaInserir = [];
                for (const interesse of interessesSelecionados) {
                    const interesseId = mapeamentoInteresses[interesse];
                    if (interesseId) {
                        interessesParaInserir.push([clienteId, interesseId]);
                    }
                }
                
                if (interessesParaInserir.length > 0) {
                    await conn.query(
                        "INSERT INTO ClientesInteresses (ClienteId, InteresseId) VALUES ?",
                        [interessesParaInserir]
                    );
                }
            }
    
            await conn.commit();
            
            return { 
                usuarioId, 
                clienteId,
                cpfSalvo: cpfLimpo,
                temImagens: !!(imagemPerfil || imagemBanner),
                interessesSalvos: interessesSelecionados ? interessesSelecionados.length : 0
            };
    
        } catch (err) {
            await conn.rollback();
            console.error("Erro ao criar cliente:", err.message);
            throw err;
        } finally {
            conn.release();
        }
    },
    
    // Criar Nutricionista
    createNutricionista: async (dadosUsuario, dadosNutricionista, especializacoes = [], imagemPerfil = null, imagemBanner = null, formacao = {}) => {
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
    
            // 1. Inserir usuário
            const [usuarioResult] = await conn.query("INSERT INTO Usuarios SET ?", [dadosUsuario]);
            const usuarioId = usuarioResult.insertId;
    
            // 2. Inserir nutricionista
            const [nutricionistaResult] = await conn.query("INSERT INTO Nutricionistas SET ?", [{
                UsuarioId: usuarioId,
                Crn: dadosNutricionista.Crn,
                RazaoSocial: dadosNutricionista.RazaoSocial
            }]);
            const nutricionistaId = nutricionistaResult.insertId;
    
            // 3. Inserir perfil com imagens e sobre mim
            if (imagemPerfil || imagemBanner || dadosNutricionista.SobreMim) {
                const dadosPerfil = { UsuarioId: usuarioId };
                
                if (imagemPerfil) {
                    if (imagemPerfil.buffer.length > 16 * 1024 * 1024) {
                        throw new Error('Foto de perfil muito grande. Máximo: 16MB');
                    }
                    dadosPerfil.FotoPerfil = imagemPerfil.buffer;
                }
                
                if (imagemBanner) {
                    if (imagemBanner.buffer.length > 16 * 1024 * 1024) {
                        throw new Error('Banner muito grande. Máximo: 16MB');
                    }
                    dadosPerfil.FotoBanner = imagemBanner.buffer;
                }
    
                if (dadosNutricionista.SobreMim) {
                    dadosPerfil.SobreMim = dadosNutricionista.SobreMim;
                }
    
                await conn.query("INSERT INTO Perfis SET ?", [dadosPerfil]);
            }
    
            // 4. Inserir especializações (em lote)
            if (especializacoes.length > 0) {
                const placeholders = especializacoes.map(() => '?').join(',');
                const [rows] = await conn.query(
                    `SELECT id FROM Especializacoes WHERE Nome IN (${placeholders})`,
                    especializacoes
                );
    
                if (rows.length > 0) {
                    const insertValues = rows.map(({ id }) => [nutricionistaId, id]);
                    await conn.query(
                        "INSERT INTO NutricionistasEspecializacoes (NutricionistaId, EspecializacaoId) VALUES ?",
                        [insertValues]
                    );
                }
            }
    
            // 5. Inserir formações acadêmicas
            const formacoesParaInserir = [];
            
            if (formacao.graduacao && formacao.graduacao.nome && formacao.graduacao.instituicao) {
                const dadosGraduacao = {
                    NutricionistaId: nutricionistaId,
                    TipoFormacao: 'graduacao',
                    NomeFormacao: formacao.graduacao.nome,
                    NomeInstituicao: formacao.graduacao.instituicao
                };
    
                if (formacao.graduacao.certificado) {
                    const cert = formacao.graduacao.certificado;
                    if (cert.buffer.length > 16 * 1024 * 1024) {
                        throw new Error('Certificado de graduação muito grande. Máximo: 16MB');
                    }
                    dadosGraduacao.CertificadoArquivo = cert.buffer;
                    dadosGraduacao.CertificadoNome = cert.originalname;
                    dadosGraduacao.CertificadoTipo = cert.mimetype;
                    dadosGraduacao.CertificadoTamanho = cert.size;
                }
    
                formacoesParaInserir.push(dadosGraduacao);
            }
    
            if (formacao.curso && formacao.curso.nome && formacao.curso.instituicao) {
                const dadosCurso = {
                    NutricionistaId: nutricionistaId,
                    TipoFormacao: 'curso',
                    NomeFormacao: formacao.curso.nome,
                    NomeInstituicao: formacao.curso.instituicao
                };
    
                if (formacao.curso.certificado) {
                    const cert = formacao.curso.certificado;
                    if (cert.buffer.length > 16 * 1024 * 1024) {
                        throw new Error('Certificado de curso muito grande. Máximo: 16MB');
                    }
                    dadosCurso.CertificadoArquivo = cert.buffer;
                    dadosCurso.CertificadoNome = cert.originalname;
                    dadosCurso.CertificadoTipo = cert.mimetype;
                    dadosCurso.CertificadoTamanho = cert.size;
                }
    
                formacoesParaInserir.push(dadosCurso);
            }
    
            // Inserir formações
            for (const formacaoData of formacoesParaInserir) {
                await conn.query("INSERT INTO NutricionistasFormacoes SET ?", [formacaoData]);
            }
    
            await conn.commit();
            return { usuarioId, nutricionistaId };
    
        } catch (err) {
            await conn.rollback();
            console.error("Erro ao criar nutricionista:", err.message);
            throw err;
        } finally {
            conn.release();
        }
    },

    verificarEmailExistente: async (email) => {
        try {
            const [rows] = await pool.query(
                "SELECT id FROM Usuarios WHERE Email = ? AND UsuarioStatus = 1 LIMIT 1",
                [email]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar email:", error.message);
            throw error;
        }
    },
    
    verificarTelefoneExistente: async (ddd, telefone) => {
        try {
            const telefoneCompleto = ddd + telefone;
            
            const [rows] = await pool.query(
                "SELECT id FROM Usuarios WHERE Telefone = ? AND UsuarioStatus = 1 LIMIT 1",
                [telefoneCompleto]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar telefone:", error.message);
            throw error;
        }
    },
    
    verificarCrnExistente: async (crn) => {
        try {
            const [rows] = await pool.query(
                "SELECT id FROM Nutricionistas WHERE Crn = ? LIMIT 1",
                [crn]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar CRN:", error.message);
            throw error;
        }
    },
    
    verificarCPFExistente: async (cpf) => {
        try {
            const cpfLimpo = cpf.replace(/[^\d]/g, '');
            
            const [rows] = await pool.query(
                "SELECT id FROM Clientes WHERE CPF = ? LIMIT 1",
                [cpfLimpo]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar CPF:", error.message);
            throw error;
        }
    }

};

module.exports = NWModel;
