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
    create: async (dadosForm) => {
        let conn;
        
        try {
            console.log('Iniciando criação de usuário...');
            
            // Timeout para obter conexão (10 segundos)
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            console.log('Conexão obtida do pool');
            
            const [linhas] = await conn.query(
                "INSERT INTO Usuarios SET ?",
                [dadosForm]
            );
            
            console.log("Usuário inserido com sucesso:", linhas);
            return linhas;
            
        } catch (error) {
            console.error("Erro ao inserir no banco:", error.message, error);
            throw error;
            
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
    createNutricionista: async (dadosUsuarios, dadosNutricionistas, especializacoes = []) => {
        let conn;
        
        try {
            // Timeout para obter conexão (10 segundos)
            conn = await Promise.race([
                pool.getConnection(),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout ao obter conexão')), 10000)
                )
            ]);
            
            console.log('Conexão obtida do pool');
            
            await conn.beginTransaction();
            console.log('Transação iniciada');
    
            const [usuarioResult] = await conn.query(
                "INSERT INTO Usuarios SET ?", [dadosUsuarios]
            );
            const usuarioId = usuarioResult.insertId;
            console.log('Usuário inserido:', usuarioId);
    
            const [nutricionistaResult] = await conn.query(
                "INSERT INTO Nutricionistas SET ?", [{
                    UsuarioId: usuarioId,
                    Crn: dadosNutricionistas.Crn,
                    RazaoSocial: dadosNutricionistas.RazaoSocial || dadosUsuarios.NomeCompleto
                }]
            );
            const nutricionistaId = nutricionistaResult.insertId;
            console.log('Nutricionista inserido:', nutricionistaId);
    
            if (Array.isArray(especializacoes) && especializacoes.length > 0) {
                const nomes = especializacoes.map(() => '?').join(',');
                const [rows] = await conn.query(
                    `SELECT id, Nome FROM Especializacoes WHERE Nome IN (${nomes})`,
                    especializacoes
                );
    
                const insertValues = rows.map(({ id }) => [nutricionistaId, id]);
                if (insertValues.length > 0) {
                    await conn.query(
                        "INSERT INTO NutricionistasEspecializacoes (NutricionistaId, EspecializacaoId) VALUES ?",
                        [insertValues]
                    );
                }
                console.log('Especializações inseridas');
            }
    
            await conn.commit();
            console.log('Transação commitada com sucesso');
            
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
                    console.log('Conexão liberada para o pool');
                } catch (releaseErr) {
                    console.error('Erro ao liberar conexão:', releaseErr.message);
                }
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
