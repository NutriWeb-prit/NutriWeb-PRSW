document.addEventListener('DOMContentLoaded', function() {
    function processarNotificacoes() {
        const urlParams = new URLSearchParams(window.location.search);
       
        const configuracoes = {
            erro: {
                param: 'erro',
                mensagens: {
                    'nutricionista_nao_encontrado': 'Nutricionista não encontrado.',
                    'acesso_negado': 'Acesso negado. Faça login.',
                    'nutricionista_sem_dados': 'Nutricionista não possui dados cadastrados.',
                    'erro_interno': 'Erro interno do servidor. Tente novamente.',
                    'login_necessario': 'É necessário fazer login para acessar esta página.',
                    'permissao_negada': 'Você não tem permissão para acessar este recurso.',
                    'logout': 'Erro ao fazer logout.',
                    'nenhuma_imagem': 'Nenhuma imagem foi selecionada.',
                    'nenhum_dado_alterado': 'Nenhum dado foi alterado.',
                    'token_ausente': 'Link de recuperação inválido.',
                    'token_invalido': 'Link expirado ou inválido. Solicite um novo link.',
                    'erro_envio': 'Erro ao enviar email. Tente novamente.',
                    'erro_redefinir': 'Erro ao redefinir senha. Tente novamente.',
                    'transacao_nao_encontrada': 'Transação não encontrada. Tente novamente.',
                    'processamento': 'Erro ao processar pagamento. Tente novamente.',
                    'plano_ativo': 'Você já possui um plano ativo.',
                    'apenas_nutricionistas': 'Apenas nutricionistas podem assinar planos premium.',
                    'dados_incompletos': 'Preencha todos os dados para continuar.',
                    'pagamento_recusado': 'Pagamento recusado. Verifique os dados e tente novamente.',
                    'pagamento_cancelado': 'Pagamento cancelado pelo usuário.',
                    'erro_mercadopago': 'Erro ao conectar com Mercado Pago. Tente novamente.',
                    'apenas_nutricionistas_publicacao': 'Apenas nutricionistas podem criar publicações.',
                    'imagem_obrigatoria': 'A imagem é obrigatória para criar uma publicação.',
                    'imagem_invalida': 'Formato de imagem inválido. Use: JPEG, PNG, GIF ou WEBP (máx. 5MB).',
                    'dados_invalidos': 'Dados da publicação são inválidos. Verifique e tente novamente.',
                    'erro_criar_publicacao': 'Erro ao criar publicação. Tente novamente.',
                    'erro_editar_publicacao': 'Erro ao editar publicação. Tente novamente.',
                    'erro_excluir_publicacao': 'Erro ao excluir publicação. Tente novamente.'
                },
                padrao: 'Ocorreu um erro inesperado.'
            },
            sucesso: {
                param: 'sucesso',
                mensagens: {
                    'dados_atualizados': 'Dados atualizados com sucesso!',
                    'imagens_atualizadas': 'Imagens atualizadas com sucesso!',
                    'email_enviado': 'Email enviado! Verifique sua caixa de entrada e spam.',
                    'senha_alterada': 'Senha alterada com sucesso! Faça login com sua nova senha.',
                    'assinatura_confirmada': '🎉 Assinatura Premium ativada! Bem-vindo(a)!',
                    'pagamento_processando': 'Pagamento em processamento. Você receberá confirmação em breve.',
                    'publicacao_criada': '✅ Publicação criada com sucesso!',
                    'publicacao_atualizada': '✅ Publicação atualizada com sucesso!',
                    'publicacao_excluida': '✅ Publicação excluída com sucesso!'
                },
                padrao: 'Operação realizada com sucesso!'
            },
            login: {
                param: 'login',
                mensagens: {
                    'sucesso': 'Login efetuado com sucesso!',
                    'logout': 'Logout realizado com sucesso.',
                    'cadastro_realizado': 'Cadastro realizado com sucesso!'
                },
                padrao: 'Operação realizada.'
            },
            
            pagamento: {
                param: 'pagamento',
                mensagens: {
                    'sucesso': '✅ Pagamento aprovado! Seu plano Premium está ativo.',
                    'pendente': '⏳ Pagamento em análise. Aguarde a confirmação.',
                    'erro': '❌ Erro no pagamento. Tente novamente.',
                    'cancelado': 'Pagamento cancelado.'
                },
                padrao: 'Status de pagamento atualizado.'
            }
        };

        const notificacoes = [];
        const parametrosParaRemover = [];

        Object.keys(configuracoes).forEach(tipo => {
            const config = configuracoes[tipo];
            const valor = urlParams.get(config.param);
           
            if (valor) {
                const mensagem = config.mensagens[valor] || config.padrao;
                notificacoes.push({ mensagem, tipo });
                parametrosParaRemover.push(config.param);
            }
        });

        if (notificacoes.length > 0) {
            setTimeout(() => {
                mostrarNotificacoesSequenciais(notificacoes, () => {
                    limparParametrosDaUrl(parametrosParaRemover, urlParams);
                });
            }, 500);
        }
    }

    function mostrarNotificacoesSequenciais(notificacoes, callback) {
        let indice = 0;
       
        function mostrarProxima() {
            if (indice < notificacoes.length) {
                const { mensagem, tipo } = notificacoes[indice];
                alert(mensagem);
                indice++;
                setTimeout(mostrarProxima, 100);
            } else if (callback) {
                callback();
            }
        }
       
        mostrarProxima();
    }

    function limparParametrosDaUrl(parametros, urlParams) {
        parametros.forEach(param => urlParams.delete(param));
       
        const novaUrl = window.location.pathname +
            (urlParams.toString() ? '?' + urlParams.toString() : '');
       
        if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, novaUrl);
        }
    }

    processarNotificacoes();
});

window.mostrarNotificacao = function(mensagem, delay = 0) {
    setTimeout(() => {
        alert(mensagem);
    }, delay);
};