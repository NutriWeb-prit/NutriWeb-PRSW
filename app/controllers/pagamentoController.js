const { MercadoPagoConfig, Preference } = require('mercadopago');
const { body, validationResult } = require('express-validator');
const pagamentoModel = require('../models/pagamentoModel');

// Configurar Mercado Pago com credenciais
const client = new MercadoPagoConfig({
    accessToken: process.env.accessToken
});

const pagamentoController = {
    // ========== VALIDAÇÕES ==========
    validacaoAssinatura: [
        body("nome")
            .isLength({min: 3})
            .withMessage("O nome deve conter pelo menos 3 caracteres!")
            .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
            .withMessage("O nome deve conter apenas letras!"),
        
        body("email")
            .isEmail()
            .withMessage("Insira um email válido!")
            .normalizeEmail(),
        
        body("telefone")
            .isLength({min: 10, max: 11})
            .withMessage("Insira um número de telefone válido!")
            .matches(/^[0-9]+$/)
            .withMessage("O telefone deve conter apenas números!"),
        
        body("cpf")
            .custom((cpf) => {
                const cpfLimpo = cpf.replace(/\D/g, '');
                
                if (cpfLimpo.length !== 11) {
                    throw new Error('O CPF deve conter exatamente 11 dígitos!');
                }
                
                // Validação de CPF
                function validarCPF(cpf) {
                    if (/^(\d)\1{10}$/.test(cpf)) return false;
                    
                    let soma = 0;
                    for (let i = 0; i < 9; i++) {
                        soma += parseInt(cpf.charAt(i)) * (10 - i);
                    }
                    let resto = soma % 11;
                    let digito1 = resto < 2 ? 0 : 11 - resto;
                    
                    if (parseInt(cpf.charAt(9)) !== digito1) return false;
                    
                    soma = 0;
                    for (let i = 0; i < 10; i++) {
                        soma += parseInt(cpf.charAt(i)) * (11 - i);
                    }
                    resto = soma % 11;
                    let digito2 = resto < 2 ? 0 : 11 - resto;
                    
                    return parseInt(cpf.charAt(10)) === digito2;
                }
                
                if (!validarCPF(cpfLimpo)) {
                    throw new Error('CPF inválido!');
                }
                
                return true;
            }),
        
        body("tipoPlano")
            .isIn(['mensal', 'semestral', 'anual'])
            .withMessage("Selecione um plano válido!")
    ],

    // Mapear valores dos planos
    valoresPlanos: {
        'mensal': { valor: 29.90, descricao: 'Plano Premium Mensal' },
        'semestral': { valor: 149.90, descricao: 'Plano Premium Semestral' },
        'anual': { valor: 269.90, descricao: 'Plano Premium Anual' }
    },

    // ========== CRIAR PREFERÊNCIA ==========
    async criarPreferencia(req, res) {
        try {
            // Validar dados recebidos
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ 
                    error: 'Dados inválidos',
                    errors: errors.array()
                });
            }

            const { tipoPlano, nome, email, cpf, telefone } = req.body;

            // Verificar se usuário está autenticado
            if (!req.session.usuario || !req.session.usuario.id) {
                return res.status(401).json({ 
                    error: 'Usuário não autenticado' 
                });
            }

            // Verificar se é nutricionista
            if (req.session.usuario.tipo !== 'N') {
                return res.status(403).json({ 
                    error: 'Apenas nutricionistas podem assinar planos premium' 
                });
            }

            // Buscar dados do plano
            const planoInfo = pagamentoController.valoresPlanos[tipoPlano];
            if (!planoInfo) {
                return res.status(400).json({ 
                    error: 'Tipo de plano inválido' 
                });
            }

            // Aplicar desconto se aplicável (cupom BEMVINDO = 14%)
            const valorOriginal = planoInfo.valor;
            const desconto = valorOriginal * 0.14;
            const valorFinal = valorOriginal - desconto;

            // Buscar nutricionista
            const nutricionista = await pagamentoModel.buscarNutricionistaPorUsuarioId(
                req.session.usuario.id
            );

            if (!nutricionista) {
                return res.status(404).json({ 
                    error: 'Nutricionista não encontrado' 
                });
            }

            // Verificar se já tem plano ativo
            const planoAtivo = await pagamentoModel.verificarPlanoAtivo(nutricionista.id);
            if (planoAtivo) {
                return res.status(400).json({ 
                    error: 'Você já possui um plano ativo' 
                });
            }

            // Verificar se JÁ existe um plano (mesmo inativo) e pegar seu ID
            let planoId = await pagamentoModel.buscarPlanoExistente(nutricionista.id);
            
            if (planoId) {
                // Se já existe um plano, apenas atualizar suas informações
                console.log(`Plano existente encontrado (ID: ${planoId}). Atualizando...`);
                await pagamentoModel.atualizarPlano(planoId, {
                    tipoPlano: 'Premium',
                    duracao: tipoPlano.charAt(0).toUpperCase() + tipoPlano.slice(1),
                    valorSubtotal: valorOriginal
                });
            } else {
                // Se não existe, criar novo plano
                console.log('Criando novo plano...');
                planoId = await pagamentoModel.criarPlano({
                    nutricionistaId: nutricionista.id,
                    tipoPlano: 'Premium',
                    duracao: tipoPlano.charAt(0).toUpperCase() + tipoPlano.slice(1),
                    pagamentoAutomatico: false,
                    valorSubtotal: valorOriginal
                });
            }

            // Criar transação pendente
            const transacaoId = await pagamentoModel.criarTransacao({
                planoId: planoId,
                metodoPagamento: 'MercadoPago',
                pagamentoAutomatico: false,
                valorTotal: valorFinal
            });

            // Armazenar IDs na sessão para usar no feedback
            req.session.transacaoAtual = {
                transacaoId,
                planoId,
                tipoPlano
            };

            // Criar preferência no Mercado Pago
            const preference = new Preference(client);
            
            const preferenceData = {
                items: [
                    {
                        title: planoInfo.descricao,
                        description: `Assinatura ${tipoPlano} NutriWeb Premium`,
                        unit_price: Number(valorFinal.toFixed(2)),
                        quantity: 1,
                        currency_id: 'BRL'
                    }
                ],
                payer: {
                    name: nome,
                    email: email,
                    identification: {
                        type: 'CPF',
                        number: cpf.replace(/\D/g, '')
                    },
                    phone: {
                        number: telefone ? telefone.replace(/\D/g, '') : ''
                    }
                },
                back_urls: {
                    success: `${process.env.BASE_URL || 'http://localhost:3000'}/assinatura/feedback`,
                    failure: `${process.env.BASE_URL || 'http://localhost:3000'}/assinatura/feedback`,
                    pending: `${process.env.BASE_URL || 'http://localhost:3000'}/assinatura/feedback`
                },
                auto_return: 'approved',
                statement_descriptor: 'NUTRIWEB',
                external_reference: `T-${transacaoId}`,
                notification_url: `${process.env.BASE_URL || 'http://localhost:3000'}/webhook/mercadopago`
            };

            const response = await preference.create({ body: preferenceData });

            res.json({ 
                preferenceId: response.id,
                initPoint: response.init_point 
            });

        } catch (error) {
            console.error("Erro ao criar preferência:", error);
            res.status(500).json({ 
                error: 'Erro ao processar pagamento. Tente novamente.' 
            });
        }
    },

    // ========== PROCESSAR FEEDBACK ==========
    async processarFeedback(req, res) {
    try {
        const { 
            payment_id, 
            status, 
            external_reference, 
            payment_type 
        } = req.query;

        console.log('Feedback recebido:', { payment_id, status, payment_type });

        // Recuperar dados da transação da sessão
        const transacaoAtual = req.session.transacaoAtual;

        if (!transacaoAtual) {
            console.error("Transação não encontrada na sessão");
            return res.redirect('/premium?erro=transacao_nao_encontrada');
        }

        // Mapear status do Mercado Pago para seu sistema
        let novoStatus;
        let mensagem;
        let tipoRedirecionamento; // 'sucesso', 'pendente', 'erro'

        switch (status) {
            case 'approved':
                novoStatus = 'Pagamento Confirmado';
                mensagem = 'Pagamento aprovado! Bem-vindo ao Premium 🎉';
                tipoRedirecionamento = 'sucesso';
                break;
                
            case 'pending':
            case 'in_process':
                novoStatus = 'Em andamento';
                
                // Mensagem específica baseada no tipo de pagamento
                if (payment_type === 'ticket') {
                    mensagem = 'Aguardando pagamento do boleto. Você receberá uma confirmação por email';
                } else if (payment_type === 'bank_transfer') {
                    mensagem = 'Transferência bancária em processamento. Aguarde a confirmação';
                } else {
                    mensagem = 'Pagamento em análise. Você será notificado quando for aprovado';
                }
                
                tipoRedirecionamento = 'pendente';
                break;
                
            case 'rejected':
                novoStatus = 'Cancelado';
                mensagem = 'Pagamento recusado. Verifique os dados do cartão ou tente outro método';
                tipoRedirecionamento = 'erro';
                break;
                
            case 'cancelled':
                novoStatus = 'Cancelado';
                mensagem = 'Pagamento cancelado. Você pode tentar novamente quando quiser';
                tipoRedirecionamento = 'erro';
                break;
                
            default:
                novoStatus = 'A pagar';
                mensagem = 'Status de pagamento desconhecido. Entre em contato com o suporte';
                tipoRedirecionamento = 'erro';
        }

        // Atualizar status da transação
        await pagamentoModel.atualizarStatusTransacao(
            transacaoAtual.transacaoId,
            novoStatus,
            payment_id
        );

        console.log(`Transação ${transacaoAtual.transacaoId} atualizada para: ${novoStatus}`);

        // Limpar sessão
        delete req.session.transacaoAtual;

        // Redirecionar com feedback apropriado
        switch (tipoRedirecionamento) {
            case 'sucesso':
                req.session.mensagemSucesso = mensagem;
                return res.redirect('/premium?pagamento=sucesso');
                
            case 'pendente':
                req.session.mensagemPendente = mensagem;
                return res.redirect('/premium?pagamento=pendente');
                
            case 'erro':
                req.session.mensagemErro = mensagem;
                return res.redirect('/premium?pagamento=erro');
        }

        } catch (error) {
            console.error("Erro ao processar feedback:", error);
            req.session.mensagemErro = 'Erro ao processar retorno do pagamento. Entre em contato com o suporte';
            res.redirect('/premium?pagamento=erro');
        }
    },

    // ========== WEBHOOK ==========
    async receberWebhook(req, res) {
    try {
        const { type, data, action } = req.body;

        console.log('========================================');
        console.log('Webhook recebido do Mercado Pago');
        console.log('Tipo:', type);
        console.log('Action:', action);
        console.log('Data:', JSON.stringify(data, null, 2));
        console.log('========================================');

        // Responder imediatamente para o MP (IMPORTANTE!)
        res.status(200).send('OK');

        // Processar apenas eventos de pagamento
        if (type === 'payment') {
            const paymentId = data.id;
            
            // Registrar no log de webhooks
            await pagamentoModel.registrarWebhook({
                tipoEvento: type,
                paymentId: paymentId,
                dadosJson: JSON.stringify(req.body)
            });
            
            // Buscar detalhes do pagamento no Mercado Pago
            try {
                const client = new MercadoPagoConfig({
                    accessToken: process.env.accessToken
                });
                
                const payment = new Payment(client);
                const pagamentoInfo = await payment.get({ id: paymentId });
                
                console.log('Detalhes do pagamento:', {
                    id: pagamentoInfo.id,
                    status: pagamentoInfo.status,
                    status_detail: pagamentoInfo.status_detail,
                    external_reference: pagamentoInfo.external_reference,
                    payment_type: pagamentoInfo.payment_type_id
                });
                
                // Extrair ID da transação da external_reference
                const externalRef = pagamentoInfo.external_reference;
                if (!externalRef || !externalRef.startsWith('T-')) {
                    console.log('External reference inválida:', externalRef);
                    return;
                }
                
                const transacaoId = parseInt(externalRef.replace('T-', ''));
                
                // Mapear status
                let novoStatus;
                
                switch (pagamentoInfo.status) {
                    case 'approved':
                        novoStatus = 'Pagamento Confirmado';
                        console.log(`✅ PAGAMENTO APROVADO - Transação ${transacaoId}`);
                        
                        // Aqui você pode enviar email de confirmação ao cliente
                        // await enviarEmailConfirmacao(transacaoId);
                        break;
                        
                    case 'pending':
                    case 'in_process':
                        novoStatus = 'Em andamento';
                        console.log(`⏳ Pagamento em processamento - Transação ${transacaoId}`);
                        break;
                        
                    case 'rejected':
                    case 'cancelled':
                        novoStatus = 'Cancelado';
                        console.log(`❌ Pagamento recusado/cancelado - Transação ${transacaoId}`);
                        break;
                        
                    case 'refunded':
                    case 'charged_back':
                        novoStatus = 'Cancelado';
                        console.log(`🔙 Pagamento estornado - Transação ${transacaoId}`);
                        break;
                        
                    default:
                        console.log(`⚠️ Status desconhecido: ${pagamentoInfo.status}`);
                        return;
                }
                
                // Atualizar status no banco
                await pagamentoModel.atualizarStatusTransacao(
                    transacaoId,
                    novoStatus,
                    paymentId
                );
                
                console.log(`✅ Status atualizado: Transação ${transacaoId} -> ${novoStatus}`);
                
                // Marcar webhook como processado
                await pagamentoModel.marcarWebhookProcessado(paymentId, 'Processado');
                
            } catch (error) {
                console.error('Erro ao processar pagamento:', error.message);
                
                // Marcar webhook com erro
                await pagamentoModel.marcarWebhookProcessado(paymentId, 'Erro');
            }
        }

        } catch (error) {
            console.error("Erro no webhook:", error);
        }
    }
};

module.exports = pagamentoController;