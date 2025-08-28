document.addEventListener('DOMContentLoaded', function() {
    // Função para processar notificações com delay
    function processarNotificacoes() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Configuração centralizada de mensagens
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
                    'logout': 'Erro ao fazer logout.'
                },
                padrao: 'Ocorreu um erro inesperado.'
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
            sucesso: {
                param: 'sucesso',
                mensagens: {
                    'perfil_atualizado': 'Perfil atualizado com sucesso!',
                    'dados_salvos': 'Dados salvos com sucesso!',
                    'operacao_concluida': 'Operação concluída com sucesso!',
                    'imagens_atualizadas': 'Imagens atualizadas com sucesso!'
                },
                padrao: 'Operação realizada com sucesso!'
            }
        };

        const notificacoes = [];
        const parametrosParaRemover = [];

        Object.keys(configuracoes).forEach(tipo => {
            const config = configuracoes[tipo];
            const valor = urlParams.get(config.param);
            
            if (valor) {
                const mensagem = config.mensagens[valor] || config.padrao;
                notificacoes.push(mensagem);
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

    function mostrarNotificacoesSequenciais(mensagens, callback) {
        let indice = 0;
        
        function mostrarProxima() {
            if (indice < mensagens.length) {
                alert(mensagens[indice]);
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