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
        try {
            const [linhas] = await pool.query(
                "INSERT INTO Usuarios SET ?",
                [dadosForm]
            );
            console.log("Usuário inserido com sucesso:", linhas);
            return linhas;
        } catch (error) {
            console.error("Erro ao inserir no banco:", error.message, error);
            throw error;
        }
    },

    // Criar um usuário Nutricionista
    createNutricionista: async (dadosUsuarios, dadosNutricionistas, especializacoes = []) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
    
            const [usuarioResult] = await conn.query(
                "INSERT INTO Usuarios SET ?", [dadosUsuarios]
            );
            const usuarioId = usuarioResult.insertId;
    
            const [nutricionistaResult] = await conn.query(
                "INSERT INTO Nutricionistas SET ?", [{
                    UsuarioId: usuarioId,
                    Crn: dadosNutricionistas.Crn,
                    RazaoSocial: dadosNutricionistas.RazaoSocial || dadosUsuarios.NomeCompleto
                }]
            );
            const nutricionistaId = nutricionistaResult.insertId;
    
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
