const pool = require("../../config/pool_conexoes");
const bcrypt = require('bcryptjs');

class RecuperacaoSenhaModel {
    
    static async buscarUsuarioPorEmail(email) {
        try {
            const [rows] = await pool.query(
                'SELECT id, Email, NomeCompleto FROM Usuarios WHERE Email = ? AND UsuarioStatus = 1',
                [email]
            );
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);
            throw error;
        }
    }
    
    static async atualizarSenha(email, novaSenha) {
        try {
            const senhaHash = await bcrypt.hash(novaSenha, 10);
            
            const [result] = await pool.query(
                'UPDATE Usuarios SET Senha = ? WHERE Email = ? AND UsuarioStatus = 1',
                [senhaHash, email]
            );
            
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Erro ao atualizar senha:', error);
            throw error;
        }
    }
}

module.exports = RecuperacaoSenhaModel;