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

            // Recuperar dados da transação da sessão
            const transacaoAtual = req.session.transacaoAtual;

            if (!transacaoAtual) {
                console.error("Transação não encontrada na sessão");
                return res.redirect('/premium?erro=transacao_nao_encontrada');
            }

            // Mapear status do Mercado Pago para seu sistema
            let novoStatus;
            let mensagem;
            let sucesso = false;

            switch (status) {
                case 'approved':
                    novoStatus = 'Pagamento Confirmado';
                    mensagem = 'Pagamento aprovado! Bem-vindo ao Premium';
                    sucesso = true;
                    break;
                case 'pending':
                case 'in_process':
                    novoStatus = 'Em andamento';
                    mensagem = 'Pagamento em análise';
                    break;
                case 'rejected':
                case 'cancelled':
                    novoStatus = 'Cancelado';
                    mensagem = 'Pagamento recusado ou cancelado';
                    break;
                default:
                    novoStatus = 'A pagar';
                    mensagem = 'Status desconhecido';
            }

            // Atualizar status da transação
            await pagamentoModel.atualizarStatusTransacao(
                transacaoAtual.transacaoId,
                novoStatus,
                payment_id
            );

            // Limpar sessão
            delete req.session.transacaoAtual;

            // Redirecionar com feedback
            if (sucesso) {
                req.session.mensagemSucesso = mensagem;
                return res.redirect('/premium?pagamento=sucesso');
            } else {
                req.session.mensagemErro = mensagem;
                return res.redirect('/premium?pagamento=erro');
            }

        } catch (error) {
            console.error("Erro ao processar feedback:", error);
            res.redirect('/premium?erro=processamento');
        }
    },

    // ========== WEBHOOK ==========
    async receberWebhook(req, res) {
        try {
            const { type, data } = req.body;

            // Responder imediatamente para o MP
            res.status(200).send('OK');

            // Processar webhook em background
            if (type === 'payment') {
                const paymentId = data.id;
                
                // Registrar no log de webhooks
                await pagamentoModel.registrarWebhook({
                    tipoEvento: type,
                    paymentId: paymentId,
                    dadosJson: JSON.stringify(req.body)
                });
                
                console.log(`Webhook recebido - Payment ID: ${paymentId}`);
            }

        } catch (error) {
            console.error("Erro no webhook:", error);
            res.status(500).send('Error');
        }
    }
};

module.exports = pagamentoController;