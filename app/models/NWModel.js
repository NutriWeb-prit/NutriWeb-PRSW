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
                    CASE WHEN p.CaminhoFotoPerfil IS NOT NULL THEN 1 ELSE 0 END as FotoPerfil,
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
    
            if (tipoUsuario === 'N' && dadosEspecificos.Crn) {
                await conn.query(
                    `UPDATE Nutricionistas SET Crn = ? WHERE UsuarioId = ?`,
                    [dadosEspecificos.Crn, usuarioId]
                );
            }
    
            if (dadosPerfil.SobreMim !== undefined) {
                const [perfilExistente] = await conn.query(
                    `SELECT id FROM Perfis WHERE UsuarioId = ?`,
                    [usuarioId]
                );
                
                if (perfilExistente.length > 0) {
                    await conn.query(
                        `UPDATE Perfis SET SobreMim = ? WHERE UsuarioId = ?`,
                        [dadosPerfil.SobreMim, usuarioId]
                    );
                } else {
                    await conn.query(
                        `INSERT INTO Perfis (UsuarioId, SobreMim) VALUES (?, ?)`,
                        [usuarioId, dadosPerfil.SobreMim]
                    );
                }
            }
    
            if (tipoUsuario === 'N' && especializacoes && especializacoes.length > 0) {
                await conn.query(
                    `DELETE ne FROM NutricionistasEspecializacoes ne
                     INNER JOIN Nutricionistas n ON ne.NutricionistaId = n.id
                     WHERE n.UsuarioId = ?`,
                    [usuarioId]
                );

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

    atualizarImagensUsuario: async (usuarioId, caminhoFotoPerfil = null, caminhoFotoBanner = null) => {
        let conn;
        
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            await conn.beginTransaction();
    
            const [perfilExistente] = await conn.query(
                "SELECT id FROM Perfis WHERE UsuarioId = ?",
                [usuarioId]
            );
    
            let dadosPerfil = {};
            let temAtualizacao = false;
    
            if (caminhoFotoPerfil) {
                console.log('Salvando caminho de foto de perfil:', caminhoFotoPerfil);
                dadosPerfil.CaminhoFotoPerfil = caminhoFotoPerfil;
                temAtualizacao = true;
            }
    
            if (caminhoFotoBanner) {
                console.log('Salvando caminho de foto de banner:', caminhoFotoBanner);
                dadosPerfil.CaminhoFotoBanner = caminhoFotoBanner;
                temAtualizacao = true;
            }
    
            if (!temAtualizacao) {
                throw new Error('Nenhuma imagem válida foi fornecida para atualização');
            }
    
            let resultado;
    
            if (perfilExistente.length > 0) {
                console.log('Atualizando perfil existente, ID:', perfilExistente[0].id);
                
                const campos = [];
                const valores = [];
    
                if (caminhoFotoPerfil) {
                    campos.push('CaminhoFotoPerfil = ?');
                    valores.push(caminhoFotoPerfil);
                }
    
                if (caminhoFotoBanner) {
                    campos.push('CaminhoFotoBanner = ?');
                    valores.push(caminhoFotoBanner);
                }
    
                valores.push(usuarioId);
    
                const queryUpdate = `UPDATE Perfis SET ${campos.join(', ')} WHERE UsuarioId = ?`;
                console.log('Query de update:', queryUpdate);
    
                const [updateResult] = await conn.query(queryUpdate, valores);
                console.log('Resultado do UPDATE:', updateResult);
    
                resultado = {
                    perfilId: perfilExistente[0].id,
                    operacao: 'atualizado',
                    linhasAfetadas: updateResult.affectedRows
                };
    
            } else {
                console.log('Criando novo perfil para usuário:', usuarioId);
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
            console.log('Imagens atualizadas com sucesso no banco');
            
            return {
                usuarioId,
                ...resultado,
                imagensAtualizadas: {
                    fotoPerfil: !!caminhoFotoPerfil,
                    fotoBanner: !!caminhoFotoBanner
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
            
            if (dados.email) {
                checks.push(`(SELECT COUNT(*) FROM Usuarios WHERE Email = ? AND id != ? AND UsuarioStatus = 1) as email_existe`);
                params.push(dados.email, usuarioId);
            }
            
            if (dados.telefone) {
                checks.push(`(SELECT COUNT(*) FROM Usuarios WHERE Telefone = ? AND id != ? AND UsuarioStatus = 1) as telefone_existe`);
                params.push(dados.telefone, usuarioId);
            }
            
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
            const termoBusca = `%${termo}%`;
            
            const queryPublicacoes = `
                SELECT 
                    p.id,
                    p.Legenda,
                    p.Categoria,
                    p.MediaEstrelas,
                    p.CaminhoFoto,
                    u.NomeCompleto as autor_nome,
                    perf.CaminhoFotoPerfil as autor_foto,
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
    
            const queryNutricionistas = `
                SELECT 
                    u.id as usuario_id,
                    u.NomeCompleto,
                    u.CEP,
                    perf.CaminhoFotoPerfil,
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
    
            const [publicacoes] = await pool.query(queryPublicacoes, [termoBusca, termoBusca]);
            const [nutricionistas] = await pool.query(queryNutricionistas, [termoBusca, termoBusca, termoBusca]);
    
            const publicacoesProcessadas = publicacoes.map(pub => {
                let resumo = '';
                if (pub.Legenda) {
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
                    temFoto: pub.CaminhoFoto ? true : false, 
                    autor: {
                        id: pub.autor_id,
                        nutricionistaId: pub.nutricionista_id,
                        nome: pub.autor_nome,
                        fotoPerfil: pub.autor_foto || null
                    },
                    url: `/publicacao/${pub.id}`
                };
            });
    
            const nutricionistasProcessados = nutricionistas.map(nut => {
                let localizacao = 'Localização não informada';
                if (nut.CEP) {
                    localizacao = `CEP: ${nut.CEP}`;
                }
    
                return {
                    id: nut.usuario_id,
                    nutricionistaId: nut.nutricionista_id,
                    nome: nut.NomeCompleto,
                    razaoSocial: nut.RazaoSocial,
                    fotoPerfil: nut.CaminhoFotoPerfil || null,
                    sobreMim: nut.SobreMim || '',
                    especializacoes: nut.especializacoes || 'Sem especialização definida',
                    localizacao: localizacao,
                    mediaAvaliacoes: nut.media_avaliacoes ? parseFloat(nut.media_avaliacoes).toFixed(1) : 'Sem avaliações',
                    totalPublicacoes: nut.total_publicacoes || 0,
                    url: `/perfilnutri?id=${nut.nutricionista_id}`
                };
            });
    
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
            if (!req.session.usuario || req.session.usuario.tipo !== 'C') {
                return res.redirect('/login?erro=acesso_negado');
            }
            
            const usuarioId = req.session.usuario.id;
            console.log("Carregando perfil do cliente ID:", usuarioId);
            
            const dadosCliente = await NWModel.findPerfilCompleto(usuarioId);
            
            if (!dadosCliente || dadosCliente.cliente === null) {
                console.log("Cliente não encontrado");
                return res.render("pages/indexPerfilCliente", {
                    erro: "Dados do cliente não encontrados",
                    cliente: null,
                    publicacoesCurtidas: []
                });
            }
            
            const { cliente, publicacoes } = dadosCliente;
    
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
                
                fotoPerfil: cliente.FotoPerfil ? `/imagem/perfil/${usuarioId}` : 'imagens/foto_perfil.jpg',
                fotoBanner: cliente.FotoBanner ? `/imagem/banner/${usuarioId}` : null,
                
                publicacoes: publicacoes.map(pub => ({
                    id: pub.PublicacaoId,
                    imagem: pub.FotoPublicacao ? `/imagem/publicacao/${pub.PublicacaoId}` : 'imagens/placeholder-post.jpg',
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

    buscarPublicacoes: async () => {
        try {
            console.log("Executando query de publicações...");
            
            const [publicacoes] = await pool.query(`
                SELECT
                    p.id as PublicacaoId,
                    p.Legenda,
                    p.Categoria,
                    p.MediaEstrelas,
                    p.CaminhoFoto,
                    p.DataCriacao,
                    
                    u.id as UsuarioId,
                    u.NomeCompleto,
                    
                    n.id as NutricionistaId,
                    
                    perf.CaminhoFotoPerfil as FotoPerfil,
                    
                    GROUP_CONCAT(DISTINCT esp.Nome SEPARATOR ', ') as Especializacoes
                FROM Publicacoes p
                
                INNER JOIN NutricionistaPublicacao np ON p.id = np.PublicacaoId
                INNER JOIN Nutricionistas n ON np.NutricionistaId = n.id
                INNER JOIN Usuarios u ON n.UsuarioId = u.id
                
                LEFT JOIN Perfis perf ON u.id = perf.UsuarioId
                LEFT JOIN NutricionistasEspecializacoes ne ON n.id = ne.NutricionistaId
                LEFT JOIN Especializacoes esp ON ne.EspecializacaoId = esp.id
                
                WHERE u.UsuarioStatus = 1
                
                GROUP BY p.id, u.id, n.id, p.Legenda, p.Categoria, p.MediaEstrelas, 
                         p.CaminhoFoto, p.DataCriacao, perf.CaminhoFotoPerfil
                ORDER BY p.MediaEstrelas DESC, p.DataCriacao DESC
                LIMIT 12
            `);
            
            console.log(`Publicações encontradas: ${publicacoes.length}`);
            return publicacoes;
            
        } catch (error) {
            console.error("Erro ao buscar publicações no banco:", error.message);
            throw error;
        }
    },

    findPublicacoesNutricionista: async (nutricionistaId) => {
        try {
            console.log("Buscando publicações do nutricionista ID:", nutricionistaId);
            
            const [publicacoes] = await pool.query(`
                SELECT
                    p.id as PublicacaoId,
                    p.Legenda,
                    p.Categoria,
                    p.MediaEstrelas,
                    p.CaminhoFoto,
                    p.DataCriacao,
                    
                    u.id as UsuarioId,
                    u.NomeCompleto,
                    
                    n.id as NutricionistaId,
                    
                    perf.CaminhoFotoPerfil as FotoPerfil,
                    
                    GROUP_CONCAT(DISTINCT esp.Nome SEPARATOR ', ') as Especializacoes
                FROM Publicacoes p
                
                INNER JOIN NutricionistaPublicacao np ON p.id = np.PublicacaoId
                INNER JOIN Nutricionistas n ON np.NutricionistaId = n.id
                INNER JOIN Usuarios u ON n.UsuarioId = u.id
                
                LEFT JOIN Perfis perf ON u.id = perf.UsuarioId
                LEFT JOIN NutricionistasEspecializacoes ne ON n.id = ne.NutricionistaId
                LEFT JOIN Especializacoes esp ON ne.EspecializacaoId = esp.id
                
                WHERE n.id = ? AND u.UsuarioStatus = 1
                
                GROUP BY p.id, u.id, n.id, p.Legenda, p.Categoria, p.MediaEstrelas, 
                         p.CaminhoFoto, p.DataCriacao, perf.CaminhoFotoPerfil
                ORDER BY p.DataCriacao DESC
                LIMIT 50
            `, [nutricionistaId]);
            
            console.log(`Publicações encontradas para nutricionista ${nutricionistaId}:`, publicacoes.length);
            
            return publicacoes;
            
        } catch (error) {
            console.error("Erro ao buscar publicações do nutricionista:", error.message);
            throw error;
        }
    },

    /* ---------------------------- PUBLICAÇÕES ---------------------------------*/

    criarPublicacao: async (dadosPublicacao, nutricionistaId) => {
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();

            console.log('Criando publicação para nutricionista ID:', nutricionistaId);

            const [publicacaoResult] = await conn.query(
                `INSERT INTO Publicacoes (CaminhoFoto, Legenda, Categoria, UsuarioId) 
                 VALUES (?, ?, ?, ?)`,
                [
                    dadosPublicacao.CaminhoFoto,
                    dadosPublicacao.Legenda,
                    dadosPublicacao.Categoria,
                    dadosPublicacao.UsuarioId
                ]
            );
            
            const publicacaoId = publicacaoResult.insertId;

            await conn.query(
                `INSERT INTO NutricionistaPublicacao (NutricionistaId, PublicacaoId) 
                 VALUES (?, ?)`,
                [nutricionistaId, publicacaoId]
            );

            await conn.commit();
            console.log('✅ Publicação criada com sucesso - ID:', publicacaoId);

            return { publicacaoId, nutricionistaId };

        } catch (error) {
            await conn.rollback();
            console.error('Erro ao criar publicação:', error.message);
            throw error;
        } finally {
            conn.release();
        }
    },

    verificarPropriedadePublicacao: async (publicacaoId, usuarioId) => {
        try {
            const [rows] = await pool.query(
                `SELECT p.id 
                 FROM Publicacoes p
                 WHERE p.id = ? AND p.UsuarioId = ?`,
                [publicacaoId, usuarioId]
            );

            return rows.length > 0;

        } catch (error) {
            console.error('Erro ao verificar propriedade da publicação:', error.message);
            throw error;
        }
    },

    buscarPublicacaoPorId: async (publicacaoId) => {
        try {
            const [rows] = await pool.query(
                `SELECT 
                    p.id as PublicacaoId,
                    p.Legenda,
                    p.Categoria,
                    p.MediaEstrelas,
                    p.CaminhoFoto,
                    p.DataCriacao,
                    u.id as UsuarioId,
                    u.NomeCompleto,
                    n.id as NutricionistaId,
                    perf.CaminhoFotoPerfil as FotoPerfil,
                    GROUP_CONCAT(DISTINCT esp.Nome SEPARATOR ', ') as Especializacoes
                FROM Publicacoes p
                INNER JOIN NutricionistaPublicacao np ON p.id = np.PublicacaoId
                INNER JOIN Nutricionistas n ON np.NutricionistaId = n.id
                INNER JOIN Usuarios u ON n.UsuarioId = u.id
                LEFT JOIN Perfis perf ON u.id = perf.UsuarioId
                LEFT JOIN NutricionistasEspecializacoes ne ON n.id = ne.NutricionistaId
                LEFT JOIN Especializacoes esp ON ne.EspecializacaoId = esp.id
                WHERE p.id = ? AND u.UsuarioStatus = 1
                GROUP BY p.id, u.id, n.id, p.Legenda, p.Categoria, p.MediaEstrelas, 
                         p.CaminhoFoto, p.DataCriacao, perf.CaminhoFotoPerfil`,
                [publicacaoId]
            );

            if (rows.length === 0) {
                return null;
            }

            const publicacao = rows[0];
            
            return {
                id: publicacao.PublicacaoId,
                legenda: publicacao.Legenda || '',
                categoria: publicacao.Categoria,
                mediaEstrelas: publicacao.MediaEstrelas || 0,
                dataCriacao: publicacao.DataCriacao,
                imgConteudo: publicacao.CaminhoFoto ? `/imagem/publicacao/${publicacao.PublicacaoId}` : null,
                autor: {
                    id: publicacao.UsuarioId,
                    nutricionistaId: publicacao.NutricionistaId,
                    nome: publicacao.NomeCompleto,
                    fotoPerfil: publicacao.FotoPerfil ? `/imagem/perfil/${publicacao.UsuarioId}` : 'imagens/foto_perfil.jpg',
                    profissao: publicacao.Especializacoes || 'Nutricionista'
                }
            };

        } catch (error) {
            console.error('Erro ao buscar publicação por ID:', error.message);
            throw error;
        }
    },

    /* ---------------------------- PUBLICAÇÕES ---------------------------------*/

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
                    CASE WHEN p.CaminhoFotoPerfil IS NOT NULL THEN 1 ELSE 0 END as FotoPerfil,
                    CASE WHEN p.CaminhoFotoBanner IS NOT NULL THEN 1 ELSE 0 END as FotoBanner,
                    p.SobreMim,
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
                    CASE WHEN p.CaminhoFoto IS NOT NULL THEN 1 ELSE 0 END as FotoPublicacao
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
                    p.CaminhoFotoPerfil as FotoPerfil,
                    p.CaminhoFotoBanner as FotoBanner,
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
                    CASE WHEN CaminhoArquivo IS NOT NULL THEN 1 ELSE 0 END as CertificadoArquivo
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
                contatosSociais: contatosSociais.length,
                temFotoPerfil: !!nutricionista.FotoPerfil,
                temFotoBanner: !!nutricionista.FotoBanner
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
                "SELECT CaminhoFotoPerfil FROM Perfis WHERE UsuarioId = ?",
                [usuarioId]
            );
            
            return result.length > 0 ? result[0].CaminhoFotoPerfil : null;
        } catch (erro) {
            console.log("Erro ao buscar caminho de imagem de perfil:", erro);
            return null;
        }
    },
    
    findImagemBanner: async (usuarioId) => {
        try {
            console.log("Buscando caminho de banner para usuarioId:", usuarioId);
            const [result] = await pool.query(
                'SELECT CaminhoFotoBanner FROM Perfis WHERE UsuarioId = ? AND CaminhoFotoBanner IS NOT NULL',
                [usuarioId]
            );
            
            console.log("Resultado da query banner:", result.length > 0 ? "Encontrado" : "Não encontrado");
            return result.length > 0 ? result[0].CaminhoFotoBanner : null;
        } catch (erro) {
            console.log("Erro ao buscar caminho de banner:", erro);
            return null;
        }
    },
    
    findImagemPublicacao: async (publicacaoId) => {
        try {
            const [result] = await pool.query(
                "SELECT CaminhoFoto FROM Publicacoes WHERE id = ?",
                [publicacaoId]
            );
            
            return result.length > 0 ? result[0].CaminhoFoto : null;
        } catch (erro) {
            console.log("Erro ao buscar caminho da imagem de publicação:", erro);
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

    findCertificado: async (formacaoId) => {
        try {
            const [result] = await pool.query(
                `SELECT 
                    CaminhoArquivo,
                    NomeArquivo,
                    TipoArquivo
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

    createCliente: async (dadosUsuario, cpfLimpo, caminhoFotoPerfil = null, caminhoFotoBanner = null, interessesSelecionados = []) => {
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
    
            const [usuarioResult] = await conn.query(
                "INSERT INTO Usuarios SET ?", 
                [dadosUsuario]
            );
            const usuarioId = usuarioResult.insertId;
    
            const [clienteResult] = await conn.query(
                "INSERT INTO Clientes (UsuarioId, CPF) VALUES (?, ?)", 
                [usuarioId, cpfLimpo]
            );
            const clienteId = clienteResult.insertId;
    
            if (caminhoFotoPerfil || caminhoFotoBanner) {
                const dadosPerfil = { UsuarioId: usuarioId };
    
                if (caminhoFotoPerfil) {
                    console.log('Armazenando caminho de foto de perfil:', caminhoFotoPerfil);
                    dadosPerfil.CaminhoFotoPerfil = caminhoFotoPerfil;
                }
    
                if (caminhoFotoBanner) {
                    console.log('Armazenando caminho de foto de banner:', caminhoFotoBanner);
                    dadosPerfil.CaminhoFotoBanner = caminhoFotoBanner;
                }
    
                await conn.query("INSERT INTO Perfis SET ?", [dadosPerfil]);
            }
    
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
                temImagens: !!(caminhoFotoPerfil || caminhoFotoBanner),
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
    
    createNutricionista: async (dadosUsuario, dadosNutricionista, especializacoes = [], caminhoFotoPerfil = null, caminhoFotoBanner = null, formacao = {}) => {
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
    
            console.log('=== SALVANDO NUTRICIONISTA NO BANCO ===');
            console.log('Caminho foto perfil recebido:', caminhoFotoPerfil);
            console.log('Caminho foto banner recebido:', caminhoFotoBanner);
    
            const [usuarioResult] = await conn.query("INSERT INTO Usuarios SET ?", [dadosUsuario]);
            const usuarioId = usuarioResult.insertId;
    
            const [nutricionistaResult] = await conn.query("INSERT INTO Nutricionistas SET ?", [{
                UsuarioId: usuarioId,
                Crn: dadosNutricionista.Crn,
                RazaoSocial: dadosNutricionista.RazaoSocial
            }]);
            const nutricionistaId = nutricionistaResult.insertId;
    
            if (caminhoFotoPerfil || caminhoFotoBanner || dadosNutricionista.SobreMim) {
                const dadosPerfil = { UsuarioId: usuarioId };
                
                if (caminhoFotoPerfil) {
                    console.log('Salvando CaminhoFotoPerfil no banco:', caminhoFotoPerfil);
                    dadosPerfil.CaminhoFotoPerfil = caminhoFotoPerfil;
                }
                
                if (caminhoFotoBanner) {
                    console.log('Salvando CaminhoFotoBanner no banco:', caminhoFotoBanner);
                    dadosPerfil.CaminhoFotoBanner = caminhoFotoBanner;
                }
    
                if (dadosNutricionista.SobreMim) {
                    dadosPerfil.SobreMim = dadosNutricionista.SobreMim;
                }
    
                const [perfilResult] = await conn.query("INSERT INTO Perfis SET ?", [dadosPerfil]);
                console.log('✅ Perfil inserido com ID:', perfilResult.insertId);
            }
    
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
                    dadosGraduacao.CaminhoArquivo = cert.filepath;
                    dadosGraduacao.NomeArquivo = cert.filename;
                    dadosGraduacao.TipoArquivo = cert.mimetype;
                    dadosGraduacao.TamanhoArquivo = cert.size;
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
                    dadosCurso.CaminhoArquivo = cert.filepath;
                    dadosCurso.NomeArquivo = cert.filename;
                    dadosCurso.TipoArquivo = cert.mimetype;
                    dadosCurso.TamanhoArquivo = cert.size;
                }
    
                formacoesParaInserir.push(dadosCurso);
            }
    
            for (const formacaoData of formacoesParaInserir) {
                await conn.query("INSERT INTO NutricionistasFormacoes SET ?", [formacaoData]);
            }
    
            await conn.commit();
            console.log('✅✅ Nutricionista cadastrado com sucesso!');
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
