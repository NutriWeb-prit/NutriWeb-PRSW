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
                    'erro_redefinir': 'Erro ao redefinir senha. Tente novamente.'
                },
                padrao: 'Ocorreu um erro inesperado.'
            },
            sucesso: {
                param: 'sucesso',
                mensagens: {
                    'dados_atualizados': 'Dados atualizados com sucesso!',
                    'imagens_atualizadas': 'Imagens atualizadas com sucesso!',
                    'email_enviado': 'Email enviado! Verifique sua caixa de entrada e spam.',
                    'senha_alterada': 'Senha alterada com sucesso! Faça login com sua nova senha.'
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