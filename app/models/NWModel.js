const pool = require("../../config/pool_conexoes");

const NWModel = {
    // Método para retornar todos os usuários ativos
    findAll: async () => {
        try {
            const [resultados, estrutura] = await pool.query(
                "SELECT * FROM Usuarios WHERE UsuarioStatus = 1"
            );
            console.log(resultados);
            console.log(estrutura);
            return resultados;
        } catch (erro) {
            console.log(erro);
            return false;
        }
    },

    // Buscar um usuário pelo ID
    findId: async (id) => {
        try {
            const [linhas] = await pool.query(
                "SELECT * FROM Usuarios WHERE UsuarioStatus = 1 AND id = ?",
                [id]
            );
            console.log(linhas);
            return linhas;
        } catch (erro) {
            console.log(erro);
            return false;
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

    // Inativar um usuário (soft delete)
    delete: async (id) => {
        try {
            const [linhas] = await pool.query(
                "UPDATE Usuarios SET UsuarioStatus = 0 WHERE id = ?",
                [id]
            );
            return linhas;
        } catch (error) {
            return error;
        }
    },

    atualizarDadosUsuario: async (usuarioId, dadosUsuario, dadosEspecificos = {}, dadosPerfil = {}, especializacoes = [], tipoUsuario) => {
        let conn;
        
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000))
            ]);
            
            await conn.beginTransaction();
    
            // 1. Atualizar dados básicos do usuário
            const camposUsuario = [];
            const valoresUsuario = [];
            
            Object.keys(dadosUsuario).forEach(campo => {
                camposUsuario.push(`${campo} = ?`);
                valoresUsuario.push(dadosUsuario[campo]);
            });
            
            if (camposUsuario.length > 0) {
                valoresUsuario.push(usuarioId);
                await conn.query(
                    `UPDATE Usuarios SET ${camposUsuario.join(', ')} WHERE id = ?`,
                    valoresUsuario
                );
                console.log("Dados básicos do usuário atualizados");
            }
    
            // 2. Atualizar ou inserir dados do perfil (SobreMim)
            if (Object.keys(dadosPerfil).length > 0) {
                // Verificar se já existe um perfil para este usuário
                const [perfilExistente] = await conn.query(
                    'SELECT id FROM Perfis WHERE UsuarioId = ?',
                    [usuarioId]
                );
                
                if (perfilExistente.length > 0) {
                    // Atualizar perfil existente
                    const camposPerfil = [];
                    const valoresPerfil = [];
                    
                    Object.keys(dadosPerfil).forEach(campo => {
                        camposPerfil.push(`${campo} = ?`);
                        valoresPerfil.push(dadosPerfil[campo]);
                    });
                    
                    valoresPerfil.push(usuarioId);
                    await conn.query(
                        `UPDATE Perfis SET ${camposPerfil.join(', ')} WHERE UsuarioId = ?`,
                        valoresPerfil
                    );
                    console.log("Perfil existente atualizado");
                } else {
                    // Criar novo perfil
                    const campos = ['UsuarioId', ...Object.keys(dadosPerfil)];
                    const valores = [usuarioId, ...Object.values(dadosPerfil)];
                    const placeholders = campos.map(() => '?').join(',');
                    
                    await conn.query(
                        `INSERT INTO Perfis (${campos.join(', ')}) VALUES (${placeholders})`,
                        valores
                    );
                    console.log("Novo perfil criado");
                }
            }
    
            // 3. Atualizar dados específicos baseado no tipo de usuário
            if (tipoUsuario === 'N' && Object.keys(dadosEspecificos).length > 0) {
                // Atualizar dados do nutricionista
                const camposNutri = [];
                const valoresNutri = [];
                
                Object.keys(dadosEspecificos).forEach(campo => {
                    camposNutri.push(`${campo} = ?`);
                    valoresNutri.push(dadosEspecificos[campo]);
                });
                
                if (camposNutri.length > 0) {
                    valoresNutri.push(usuarioId);
                    await conn.query(
                        `UPDATE Nutricionistas SET ${camposNutri.join(', ')} WHERE UsuarioId = ?`,
                        valoresNutri
                    );
                    console.log("Dados específicos do nutricionista atualizados");
                }
    
                // 4. Atualizar especializações do nutricionista
                if (especializacoes.length >= 0) { // Permite array vazio para remover todas
                    // Primeiro, buscar o ID do nutricionista
                    const [nutriResult] = await conn.query(
                        'SELECT id FROM Nutricionistas WHERE UsuarioId = ?',
                        [usuarioId]
                    );
                    
                    if (nutriResult.length > 0) {
                        const nutricionistaId = nutriResult[0].id;
                        
                        // Remover especializações antigas
                        await conn.query(
                            'DELETE FROM NutricionistasEspecializacoes WHERE NutricionistaId = ?',
                            [nutricionistaId]
                        );
                        console.log("Especializações antigas removidas");
                        
                        // Adicionar novas especializações (se houver)
                        if (especializacoes.length > 0) {
                            // Buscar IDs das especializações
                            const placeholders = especializacoes.map(() => '?').join(',');
                            const [especRows] = await conn.query(
                                `SELECT id, Nome FROM Especializacoes WHERE Nome IN (${placeholders})`,
                                especializacoes
                            );
                            
                            if (especRows.length > 0) {
                                const insertValues = especRows.map(({ id }) => [nutricionistaId, id]);
                                await conn.query(
                                    'INSERT INTO NutricionistasEspecializacoes (NutricionistaId, EspecializacaoId) VALUES ?',
                                    [insertValues]
                                );
                                console.log(`${especRows.length} especializações adicionadas`);
                            } else {
                                console.warn("Nenhuma especialização válida encontrada para:", especializacoes);
                            }
                        }
                    }
                }
            } else if (tipoUsuario === 'C' && Object.keys(dadosEspecificos).length > 0) {
                // Atualizar dados específicos do cliente (se necessário no futuro)
                const camposCliente = [];
                const valoresCliente = [];
                
                Object.keys(dadosEspecificos).forEach(campo => {
                    camposCliente.push(`${campo} = ?`);
                    valoresCliente.push(dadosEspecificos[campo]);
                });
                
                if (camposCliente.length > 0) {
                    valoresCliente.push(usuarioId);
                    await conn.query(
                        `UPDATE Clientes SET ${camposCliente.join(', ')} WHERE UsuarioId = ?`,
                        valoresCliente
                    );
                    console.log("Dados específicos do cliente atualizados");
                }
            }
    
            await conn.commit();
            console.log("Transação commitada com sucesso");
            return { usuarioId };
    
        } catch (err) {
            console.error("Erro ao atualizar dados do usuário:", err.message);
            
            if (conn) {
                try {
                    await conn.rollback();
                    console.log("Rollback executado");
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

    verificarTelefoneExistenteParaAtualizacao: async (ddd, telefone, usuarioId) => {
        let conn;
        try {
            const telefoneCompleto = ddd + telefone;
            
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            const [rows] = await conn.query(
                "SELECT id FROM Usuarios WHERE Telefone = ? AND id != ? AND UsuarioStatus = 1 LIMIT 1",
                [telefoneCompleto, usuarioId]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar telefone para atualização:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
            }
        }
    },
    
    verificarEmailExistenteParaAtualizacao: async (email, usuarioId) => {
        let conn;
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            const [rows] = await conn.query(
                "SELECT id FROM Usuarios WHERE Email = ? AND id != ? AND UsuarioStatus = 1 LIMIT 1",
                [email, usuarioId]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar email para atualização:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
            }
        }
    },
    
    verificarCrnExistenteParaAtualizacao: async (crn, usuarioId) => {
        let conn;
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            const [rows] = await conn.query(
                "SELECT n.id FROM Nutricionistas n INNER JOIN Usuarios u ON n.UsuarioId = u.id WHERE n.Crn = ? AND n.UsuarioId != ? AND u.UsuarioStatus = 1 LIMIT 1",
                [crn, usuarioId]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar CRN para atualização:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
            }
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
        let conn;
        
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
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
    
            // 3. Inserir perfil com imagens
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
    
                // Inserir na tabela ClientesInteresses
                for (const interesse of interessesSelecionados) {
                    const interesseId = mapeamentoInteresses[interesse];
                    if (interesseId) {
                        try {
                            await conn.query(
                                "INSERT INTO ClientesInteresses (ClienteId, InteresseId) VALUES (?, ?)",
                                [clienteId, interesseId]
                            );
                        } catch (insertError) {
                            console.error(`Erro ao inserir interesse ${interesse}:`, insertError.message);
                        }
                    }
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
            console.error("Erro ao criar cliente:", err.message);
            
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

    // Criar um usuário Nutricionista
    
    createNutricionista: async (dadosUsuario, dadosNutricionista, especializacoes = [], imagemPerfil = null, imagemBanner = null, formacao = {}) => {
        let conn;
        
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000))
            ]);
            
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

            // 3. Inserir perfil com imagens
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

            // 4. Inserir especializações
            if (especializacoes.length > 0) {
                const placeholders = especializacoes.map(() => '?').join(',');
                const [rows] = await conn.query(
                    `SELECT id, Nome FROM Especializacoes WHERE Nome IN (${placeholders})`,
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
            if (formacao.graduacao || formacao.curso) {
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

                    await conn.query("INSERT INTO NutricionistasFormacoes SET ?", [dadosGraduacao]);
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

                    await conn.query("INSERT INTO NutricionistasFormacoes SET ?", [dadosCurso]);
                }
            }

            await conn.commit();
            return { usuarioId, nutricionistaId };

        } catch (err) {
            console.error("Erro ao criar nutricionista:", err.message);
            
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

    verificarEmailExistente: async (email) => {
        let conn;
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            const [rows] = await conn.query(
                "SELECT id FROM Usuarios WHERE email = ? LIMIT 1",
                [email]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar email:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
            }
        }
    },

    verificarTelefoneExistente: async (ddd, telefone) => {
        let conn;
        try {
            const telefoneCompleto = ddd + telefone;
            
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            const [rows] = await conn.query(
                "SELECT id FROM Usuarios WHERE telefone = ? LIMIT 1",
                [telefoneCompleto]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar telefone:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
            }
        }
    },

    verificarCrnExistente: async (crn) => {
        let conn;
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            const [rows] = await conn.query(
                "SELECT id FROM Nutricionistas WHERE Crn = ? LIMIT 1",
                [crn]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar CRN:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
            }
        }
    },

    verificarCPFExistente: async (cpf) => {
        let conn;
        try {
            cpf = cpf.replace(/[^\d]/g, '');
            
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            const [rows] = await conn.query(
                "SELECT id FROM Clientes WHERE cpf = ? LIMIT 1",
                [cpf]
            );
            
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar CPF:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
            }
        }
    }

};

module.exports = NWModel;
