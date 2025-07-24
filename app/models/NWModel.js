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

    // Criar um usuário Cliente
    createCliente: async (dadosUsuario, cpfLimpo, imagemPerfil = null, imagemBanner = null, interessesSelecionados = []) => {
        let conn;
        
        try {
            console.log('Iniciando criação de cliente...');
            
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            console.log('Conexão obtida do pool');
            
            await conn.beginTransaction();
            console.log('Transação iniciada');
    
            // 1. Inserir usuário
            const [usuarioResult] = await conn.query(
                "INSERT INTO Usuarios SET ?", 
                [dadosUsuario]
            );
            const usuarioId = usuarioResult.insertId;
            console.log('Usuário inserido:', usuarioId);
    
            // 2. Inserir cliente
            const [clienteResult] = await conn.query(
                "INSERT INTO Clientes (UsuarioId, CPF) VALUES (?, ?)", 
                [usuarioId, cpfLimpo]
            );
            const clienteId = clienteResult.insertId;
            console.log('Cliente inserido:', clienteId, 'com CPF:', cpfLimpo);
    
            // 3. Inserir perfil com imagens (se houver)
            if (imagemPerfil || imagemBanner) {
                const dadosPerfil = {
                    UsuarioId: usuarioId
                };
    
                if (imagemPerfil) {
                    if (imagemPerfil.buffer.length > 16 * 1024 * 1024) {
                        throw new Error('Foto de perfil muito grande. Máximo permitido: 16MB');
                    }
                    dadosPerfil.FotoPerfil = imagemPerfil.buffer;
                    console.log('Foto de perfil adicionada:', imagemPerfil.originalname, `(${imagemPerfil.buffer.length} bytes)`);
                }
    
                if (imagemBanner) {
                    if (imagemBanner.buffer.length > 16 * 1024 * 1024) {
                        throw new Error('Banner muito grande. Máximo permitido: 16MB');
                    }
                    dadosPerfil.FotoBanner = imagemBanner.buffer;
                    console.log('Banner adicionado:', imagemBanner.originalname, `(${imagemBanner.buffer.length} bytes)`);
                }
    
                const [perfilResult] = await conn.query(
                    "INSERT INTO Perfis SET ?", 
                    [dadosPerfil]
                );
                console.log('Perfil inserido com ID:', perfilResult.insertId);
            } else {
                console.log('Nenhuma imagem fornecida - perfil criado sem fotos');
            }
    
            // 4. Processar interesses nutricionais
            if (interessesSelecionados && interessesSelecionados.length > 0) {
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
                        await conn.query(
                            "INSERT INTO ClientesInteresses (ClienteId, InteresseId) VALUES (?, ?)",
                            [clienteId, interesseId]
                        );
                    }
                }
                
                console.log('Interesses nutricionais salvos:', interessesSelecionados);
            }
    
            await conn.commit();
            console.log('Transação commitada com sucesso');
            
            return { 
                usuarioId, 
                clienteId,
                cpfSalvo: cpfLimpo, // 🔧 RETORNA O CPF LIMPO SALVO
                temImagens: !!(imagemPerfil || imagemBanner),
                interessesSalvos: interessesSelecionados.length
            };
    
        } catch (err) {
            console.error("Erro ao criar cliente:", err.message);
            
            if (conn) {
                try {
                    await conn.rollback();
                    console.log('Rollback executado');
                } catch (rollbackErr) {
                    console.error('Erro no rollback:', rollbackErr.message);
                }
            }
            
            throw err;
            
        } finally {
            if (conn) {
                try {
                    conn.release();
                    console.log('Conexão liberada para o pool');
                } catch (releaseErr) {
                    console.error('Erro ao liberar conexão:', releaseErr.message);
                }
            }
        }
    },

    // Criar um usuário Nutricionista
    createNutricionista: async (dadosUsuario, dadosNutricionista, especializacoes = [], imagemPerfil = null, imagemBanner = null, formacao = {}, certificados = {}) => {
        let conn;
        
        try {
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000))
            ]);
            
            console.log('Conexão obtida');
            await conn.beginTransaction();
    
            // 1. Inserir usuário
            const [usuarioResult] = await conn.query("INSERT INTO Usuarios SET ?", [dadosUsuario]);
            const usuarioId = usuarioResult.insertId;
            console.log('Usuário inserido:', usuarioId);
    
            // 2. Inserir nutricionista
            const [nutricionistaResult] = await conn.query("INSERT INTO Nutricionistas SET ?", [{
                UsuarioId: usuarioId,
                Crn: dadosNutricionista.Crn,
                RazaoSocial: dadosNutricionista.RazaoSocial
            }]);
            const nutricionistaId = nutricionistaResult.insertId;
            console.log('Nutricionista inserido:', nutricionistaId);
    
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
    
                await conn.query("INSERT INTO Perfis SET ?", [dadosPerfil]);
                console.log('Perfil inserido');
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
                    console.log('Especializações inseridas:', rows.length);
                }
            }
    
            // 5. TODO: Inserir formação acadêmica e certificados
            // (Você pode criar tabelas específicas para isso)
    
            await conn.commit();
            console.log('Transação commitada');
            
            return { usuarioId, nutricionistaId };
    
        } catch (err) {
            console.error("Erro ao criar nutricionista:", err.message);
            
            if (conn) {
                try {
                    await conn.rollback();
                    console.log('Rollback executado');
                } catch (rollbackErr) {
                    console.error('Erro no rollback:', rollbackErr.message);
                }
            }
            
            throw err;
            
        } finally {
            if (conn) {
                try {
                    conn.release();
                    console.log('Conexão liberada');
                } catch (releaseErr) {
                    console.error('Erro ao liberar conexão:', releaseErr.message);
                }
            }
        }
    },

    verificarEmailExistente: async (email) => {
        let conn;
        try {
            console.log('Verificando se email já existe:', email);
            
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            console.log('Conexão obtida para verificação de email');
            
            const [rows] = await conn.query(
                "SELECT id FROM Usuarios WHERE email = ? LIMIT 1",
                [email]
            );
            
            console.log('Resultado da verificação de email:', rows.length > 0 ? 'Existe' : 'Não existe');
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar email:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
                console.log('Conexão liberada após verificação de email');
            }
        }
    },

    verificarTelefoneExistente: async (ddd, telefone) => {
        let conn;
        try {
            const telefoneCompleto = ddd + telefone;
            console.log('Verificando se telefone já existe:', telefoneCompleto);
            
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            console.log('Conexão obtida para verificação de telefone');
            
            const [rows] = await conn.query(
                "SELECT id FROM Usuarios WHERE telefone = ? LIMIT 1",
                [telefoneCompleto]
            );
            
            console.log('Resultado da verificação de telefone:', rows.length > 0 ? 'Existe' : 'Não existe');
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar telefone:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
                console.log('Conexão liberada após verificação de telefone');
            }
        }
    },

    verificarCrnExistente: async (crn) => {
        let conn;
        try {
            console.log('Verificando se CRN já existe:', crn);
            
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            console.log('Conexão obtida para verificação de CRN');
            
            // Busca na tabela Nutricionistas pelo CRN
            const [rows] = await conn.query(
                "SELECT id FROM Nutricionistas WHERE Crn = ? LIMIT 1",
                [crn]
            );
            
            console.log('Resultado da verificação de CRN:', rows.length > 0 ? 'Existe' : 'Não existe');
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar CRN:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
                console.log('Conexão liberada após verificação de CRN');
            }
        }
    },

    verificarCPFExistente: async (cpf) => {
        let conn;
        try {
            cpf = cpf.replace(/[^\d]/g, '');
            console.log('Verificando se CPF já existe:', cpf);
            
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            console.log('Conexão obtida para verificação de CPF');
            
            const [rows] = await conn.query(
                "SELECT id FROM Clientes WHERE cpf = ? LIMIT 1",
                [cpf]
            );
            
            console.log('Resultado da verificação de CPF:', rows.length > 0 ? 'Existe' : 'Não existe');
            return rows.length > 0;
            
        } catch (error) {
            console.error("Erro ao verificar CPF:", error.message);
            throw error;
        } finally {
            if (conn) {
                conn.release();
                console.log('Conexão liberada após verificação de CPF');
            }
        }
    },

    // Atualizar dados de um usuário
    update: async (dadosForm, id) => {
        try {
            const [linhas] = await pool.query(
                "UPDATE Usuarios SET ? WHERE id = ?",
                [dadosForm, id]
            );
            return linhas;
        } catch (error) {
            return error;
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
    }
};

module.exports = NWModel;
