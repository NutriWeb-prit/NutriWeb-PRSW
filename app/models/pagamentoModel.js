const pool = require("../../config/pool_conexoes");

const pagamentoModel = {
    async criarPlano(dados) {
        try {
            const query = `
                INSERT INTO Planos (
                    NutricionistaId, 
                    TipoPlano, 
                    Duracao, 
                    PagamentoAutomatico, 
                    ValorSubtotal
                ) VALUES (?, ?, ?, ?, ?)
            `;
            
            const [result] = await pool.query(query, [
                dados.nutricionistaId,
                dados.tipoPlano,
                dados.duracao,
                dados.pagamentoAutomatico || false,
                dados.valorSubtotal
            ]);
            
            return result.insertId;
        } catch (error) {
            console.error("Erro ao criar plano:", error);
            throw error;
        }
    },

    async criarTransacao(dados) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const [statusRows] = await connection.query(
                'SELECT id FROM Status WHERE TituloStatus = ?',
                ['A pagar']
            );
            
            if (!statusRows || statusRows.length === 0) {
                console.log("Status 'A pagar' não encontrado. Criando...");
                const [insertStatus] = await connection.query(
                    "INSERT INTO Status (TituloStatus) VALUES ('A pagar')"
                );
                var statusId = insertStatus.insertId;
            } else {
                var statusId = statusRows[0].id;
            }
            
            console.log("StatusId encontrado/criado:", statusId);
            
            const query = `
                INSERT INTO Transacoes (
                    PlanoId,
                    StatusId,
                    MetodoPagamento,
                    PagamentoAutomatico,
                    DataTransacao,
                    ValorTotal
                ) VALUES (?, ?, ?, ?, NOW(), ?)
            `;
            
            const [result] = await connection.query(query, [
                dados.planoId,
                statusId,
                dados.metodoPagamento,
                dados.pagamentoAutomatico || false,
                dados.valorTotal
            ]);
            
            await connection.commit();
            return result.insertId;
            
        } catch (error) {
            await connection.rollback();
            console.error("Erro ao criar transação:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    async atualizarStatusTransacao(transacaoId, novoStatus, paymentId = null) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const [statusRows] = await connection.query(
                'SELECT id FROM Status WHERE TituloStatus = ?',
                [novoStatus]
            );
            
            if (!statusRows || statusRows.length === 0) {
                throw new Error(`Status '${novoStatus}' não encontrado no banco de dados`);
            }
            
            const statusId = statusRows[0].id;
            
            await connection.query(
                'UPDATE Transacoes SET StatusId = ? WHERE id = ?',
                [statusId, transacaoId]
            );
            
            if (paymentId) {
                await connection.query(
                    'UPDATE Transacoes SET MercadoPagoPaymentId = ? WHERE id = ?',
                    [paymentId, transacaoId]
                );
            }
            
            await connection.commit();
            
        } catch (error) {
            await connection.rollback();
            console.error("Erro ao atualizar status:", error);
            throw error;
        } finally {
            connection.release();
        }
    },

    async buscarNutricionistaPorUsuarioId(usuarioId) {
        try {
            const query = `
                SELECT id FROM Nutricionistas WHERE UsuarioId = ?
            `;
            const [rows] = await pool.query(query, [usuarioId]);
            return rows[0];
        } catch (error) {
            console.error("Erro ao buscar nutricionista:", error);
            throw error;
        }
    },

    async verificarPlanoAtivo(nutricionistaId) {
        try {
            const query = `
                SELECT p.*, t.StatusId 
                FROM Planos p
                INNER JOIN Transacoes t ON t.PlanoId = p.id
                WHERE p.NutricionistaId = ?
                AND t.StatusId IN (
                    SELECT id FROM Status 
                    WHERE TituloStatus IN ('Em andamento', 'Pagamento Confirmado')
                )
                ORDER BY t.DataTransacao DESC
                LIMIT 1
            `;
            const [rows] = await pool.query(query, [nutricionistaId]);
            return rows[0] || null;
        } catch (error) {
            console.error("Erro ao verificar plano ativo:", error);
            throw error;
        }
    },

    async verificarPremiumAtivo(nutricionistaId) {
    try {
        const query = `
            SELECT 
                p.id as PlanoId,
                p.TipoPlano,
                p.Duracao,
                t.DataTransacao,
                s.TituloStatus
            FROM Planos p
            INNER JOIN Transacoes t ON t.PlanoId = p.id
            INNER JOIN Status s ON t.StatusId = s.id
            WHERE p.NutricionistaId = ?
            AND p.TipoPlano = 'Premium'
            AND s.TituloStatus = 'Pagamento Confirmado'
            ORDER BY t.DataTransacao DESC
            LIMIT 1
        `;
        
        const [rows] = await pool.query(query, [nutricionistaId]);
        
        if (rows.length === 0) {
            return { temPremium: false };
        }
        
        const plano = rows[0];
        
        const dataTransacao = new Date(plano.DataTransacao);
        let dataExpiracao = new Date(dataTransacao);
        
        switch (plano.Duracao) {
            case 'Mensal':
                dataExpiracao.setMonth(dataExpiracao.getMonth() + 1);
                break;
            case 'Semestral':
                dataExpiracao.setMonth(dataExpiracao.getMonth() + 6);
                break;
            case 'Anual':
                dataExpiracao.setFullYear(dataExpiracao.getFullYear() + 1);
                break;
        }
        
        const hoje = new Date();
        const estaAtivo = hoje <= dataExpiracao;
        
        return {
            temPremium: estaAtivo,
            planoId: plano.PlanoId,
            duracao: plano.Duracao,
            dataExpiracao: dataExpiracao.toISOString(),
            diasRestantes: estaAtivo ? Math.ceil((dataExpiracao - hoje) / (1000 * 60 * 60 * 24)) : 0
        };
        
        } catch (error) {
            console.error("Erro ao verificar Premium ativo:", error);
            return { temPremium: false };
        }
    },
    
    async garantirStatusExistem() {
        const connection = await pool.getConnection();
        
        try {
            const statusNecessarios = [
                'A pagar',
                'Em andamento',
                'Pagamento Confirmado',
                'Cancelado',
                'Finalizado'
            ];
            
            for (const status of statusNecessarios) {
                const [rows] = await connection.query(
                    'SELECT id FROM Status WHERE TituloStatus = ?',
                    [status]
                );
                
                if (!rows || rows.length === 0) {
                    await connection.query(
                        'INSERT INTO Status (TituloStatus) VALUES (?)',
                        [status]
                    );
                    console.log(`Status '${status}' criado com sucesso`);
                }
            }
            
        } catch (error) {
            console.error("Erro ao garantir status:", error);
        } finally {
            connection.release();
        }
    },
    
    async buscarPlanoExistente(nutricionistaId) {
        try {
            const query = `
                SELECT id FROM Planos 
                WHERE NutricionistaId = ?
                LIMIT 1
            `;
            const [rows] = await pool.query(query, [nutricionistaId]);
            return rows[0] ? rows[0].id : null;
        } catch (error) {
            console.error("Erro ao buscar plano existente:", error);
            throw error;
        }
    },
    
    async atualizarPlano(planoId, dados) {
        try {
            const query = `
                UPDATE Planos 
                SET TipoPlano = ?,
                    Duracao = ?,
                    ValorSubtotal = ?
                WHERE id = ?
            `;
            
            await pool.query(query, [
                dados.tipoPlano,
                dados.duracao,
                dados.valorSubtotal,
                planoId
            ]);
            
            console.log(`Plano ${planoId} atualizado com sucesso`);
            
        } catch (error) {
            console.error("Erro ao atualizar plano:", error);
            throw error;
        }
    },
    
    async registrarWebhook(dados) {
        try {
            const query = `
                INSERT INTO WebhookLogs (
                    TipoEvento,
                    PaymentId,
                    DadosJson
                ) VALUES (?, ?, ?)
            `;
            
            await pool.query(query, [
                dados.tipoEvento,
                dados.paymentId,
                dados.dadosJson
            ]);
            
        } catch (error) {
            console.error("Erro ao registrar webhook:", error);
        }
    }
};

module.exports = pagamentoModel;