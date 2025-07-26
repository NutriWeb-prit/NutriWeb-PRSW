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
