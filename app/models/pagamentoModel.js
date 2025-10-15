const pool = require("../../config/pool_conexoes");

const pagamentoModel = {
    // Criar novo plano na tabela Planos
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

    // Criar transação inicial (status: A pagar)
    async criarTransacao(dados) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // PASSO 1: Buscar o StatusId ANTES de fazer o INSERT
            const [statusRows] = await connection.query(
                'SELECT id FROM Status WHERE TituloStatus = ?',
                ['A pagar']
            );
            
            // PASSO 2: Verificar se encontrou o status
            if (!statusRows || statusRows.length === 0) {
                // Se não existe, criar o status
                console.log("Status 'A pagar' não encontrado. Criando...");
                const [insertStatus] = await connection.query(
                    "INSERT INTO Status (TituloStatus) VALUES ('A pagar')"
                );
                var statusId = insertStatus.insertId;
            } else {
                var statusId = statusRows[0].id;
            }
            
            console.log("StatusId encontrado/criado:", statusId);
            
            // PASSO 3: Agora sim, inserir a transação com o StatusId correto
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
                statusId,  // Usar o ID que encontramos/criamos
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

    // Atualizar status da transação após pagamento
    async atualizarStatusTransacao(transacaoId, novoStatus, paymentId = null) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            // PASSO 1: Buscar o StatusId do novo status
            const [statusRows] = await connection.query(
                'SELECT id FROM Status WHERE TituloStatus = ?',
                [novoStatus]
            );
            
            if (!statusRows || statusRows.length === 0) {
                throw new Error(`Status '${novoStatus}' não encontrado no banco de dados`);
            }
            
            const statusId = statusRows[0].id;
            
            // PASSO 2: Atualizar a transação
            await connection.query(
                'UPDATE Transacoes SET StatusId = ? WHERE id = ?',
                [statusId, transacaoId]
            );
            
            // PASSO 3: Se tiver paymentId do Mercado Pago, atualizar também
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

    // Buscar nutricionista por ID de usuário
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

    // Verificar se nutricionista já tem plano ativo
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
    
    // NOVO: Garantir que todos os status necessários existam
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
    
    // NOVO: Buscar plano existente (mesmo que inativo)
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
    
    // NOVO: Atualizar dados de um plano existente
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
    
    // NOVO: Registrar webhook recebido
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
            // Não lançar erro para não afetar o webhook
        }
    }
};

module.exports = pagamentoModel;