const mp = new MercadoPago('APP_USR-d7fc2323-3d04-4de7-b78d-7a5b7ad7dd38', {
    locale: 'pt-BR'
});

let checkoutButton = null;

document.querySelector('.confirmar-btn').addEventListener('click', async function(e) {
    e.preventDefault();
    
    this.disabled = true;
    this.textContent = 'Processando...';
    
    try {
        const dadosAssinatura = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.replace(/\D/g, ''),
            cpf: document.getElementById('cpf').value.replace(/\D/g, ''),
            tipoPlano: document.getElementById('tipoPlano').value
        };
        
        if (!validarFormulario(dadosAssinatura)) {
            if (typeof window.mostrarNotificacao === 'function') {
                window.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 0);
            } else {
                alert('Por favor, preencha todos os campos obrigatórios');
            }
            this.disabled = false;
            this.textContent = 'CONFIRMAR PAGAMENTO';
            return;
        }
        
        const response = await fetch('/assinatura/criar-preferencia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosAssinatura)
        });
        
        if (!response.ok) {
            const error = await response.json();
            
            if (error.errors && Array.isArray(error.errors)) {
                const mensagensErro = error.errors.map(err => err.msg).join('\n');
                throw new Error(mensagensErro);
            }
            
            throw new Error(error.error || 'Erro ao processar pagamento');
        }
        
        const data = await response.json();
        
        console.log('Preferência criada:', data.preferenceId);
        
        await mostrarAreaPagamento();
        
        await criarBotaoCheckout(data.preferenceId);
        
    } catch (error) {
        console.error('Erro:', error);
        alert(error.message || 'Erro ao processar pagamento. Tente novamente.');
        this.disabled = false;
        this.textContent = 'CONFIRMAR PAGAMENTO';
    }
});

function validarFormulario(dados) {
    if (!dados.nome || dados.nome.length < 3) {
        console.log('Nome inválido');
        return false;
    }
    if (!dados.email || !dados.email.includes('@')) {
        console.log('Email inválido');
        return false;
    }
    if (!dados.cpf || dados.cpf.length !== 11) {
        console.log('CPF inválido');
        return false;
    }
    if (!dados.tipoPlano) {
        console.log('Plano não selecionado');
        return false;
    }
    return true;
}

async function criarBotaoCheckout(preferenceId) {
    try {
        console.log('Criando botão de checkout para preferência:', preferenceId);
        
        const bricksBuilder = mp.bricks();
        
        if (checkoutButton) {
            console.log('Removendo botão existente...');
            await checkoutButton.unmount();
        }
        
        const container = document.getElementById('wallet_container');
        if (!container) {
            throw new Error('Container do checkout não encontrado');
        }
        
        container.innerHTML = '';
        
        console.log('Montando novo botão...');
        checkoutButton = await bricksBuilder.create('wallet', 'wallet_container', {
            initialization: {
                preferenceId: preferenceId
            },
            customization: {
                texts: {
                    valueProp: 'smart_option'
                }
            }
        });
        
        console.log('Botão criado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao criar botão de checkout:', error);
        throw new Error('Erro ao carregar botão de pagamento');
    }
}

function mostrarAreaPagamento() {
    return new Promise((resolve) => {
        console.log('Mostrando área de pagamento...');
        
        const formContainer = document.querySelector('.left-container form');
        formContainer.style.opacity = '0';
        formContainer.style.transition = 'opacity 0.3s';
        
        setTimeout(() => {
            formContainer.style.display = 'none';
            
            let paymentContainer = document.getElementById('payment-container');
            if (!paymentContainer) {
                console.log('Criando container de pagamento...');
                paymentContainer = document.createElement('section');
                paymentContainer.id = 'payment-container';
                paymentContainer.className = 'payment-container';
                paymentContainer.innerHTML = `
                    <h2>Finalize seu pagamento</h2>
                    <p style="margin-bottom: 20px; color: #666;">
                        Escolha sua forma de pagamento abaixo:
                    </p>
                    <section id="wallet_container"></section>
                    <button class="voltar-btn" onclick="voltarParaFormulario()" style="margin-top: 20px;">
                        Voltar
                    </button>
                `;
                document.querySelector('.left-container').appendChild(paymentContainer);
            }
            
            paymentContainer.style.display = 'block';
            paymentContainer.style.opacity = '0';
            
            setTimeout(() => {
                paymentContainer.style.opacity = '1';
                paymentContainer.style.transition = 'opacity 0.3s';
                console.log('Container de pagamento exibido');
                resolve();
            }, 50);
        }, 300);
    });
}

function voltarParaFormulario() {
    console.log('Voltando para formulário...');
    
    const paymentContainer = document.getElementById('payment-container');
    const formContainer = document.querySelector('.left-container form');
    const botao = document.querySelector('.confirmar-btn');
    
    if (checkoutButton) {
        checkoutButton.unmount();
        checkoutButton = null;
    }
    
    paymentContainer.style.opacity = '0';
    
    setTimeout(() => {
        paymentContainer.style.display = 'none';
        formContainer.style.display = 'block';
        
        setTimeout(() => {
            formContainer.style.opacity = '1';
            botao.disabled = false;
            botao.textContent = 'CONFIRMAR PAGAMENTO';
        }, 50);
    }, 300);
}

function atualizarResumo() {
    const tipoPlano = document.getElementById('tipoPlano').value;
    const valores = {
        'mensal': 29.90,
        'semestral': 149.90,
        'anual': 269.90
    };
    
    const labels = {
        'mensal': 'Assinatura (Mensal)',
        'semestral': 'Assinatura (Semestral)',
        'anual': 'Assinatura (Anual)'
    };
    
    const valorBase = valores[tipoPlano];
    const desconto = valorBase * 0.14;
    const valorFinal = valorBase - desconto;
    
    document.getElementById('labelAssinatura').textContent = labels[tipoPlano];
    document.getElementById('valorAssinatura').textContent = `R$ ${valorBase.toFixed(2)}`;
    document.getElementById('valorDesconto').textContent = `R$ -${desconto.toFixed(2)}`;
    document.getElementById('valorTotal').textContent = `R$ ${valorFinal.toFixed(2)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    atualizarResumo();
    console.log('Checkout inicializado');
});