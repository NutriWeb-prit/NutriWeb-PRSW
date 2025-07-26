
function selecionarPagamento(metodo) {
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.querySelector(`[data-method="${metodo}"]`).classList.add('active');
    
    const cartaoForm = document.getElementById('cartaoForm');
    if (metodo === 'cartao') {
        cartaoForm.style.display = 'block';
    } else {
        cartaoForm.style.display = 'none';
    }
}

// Função para atualizar resumo baseado no plano
function atualizarResumo() {
    const planoSelect = document.getElementById('tipoPlano');
    const labelAssinatura = document.getElementById('labelAssinatura');
    const valorAssinatura = document.getElementById('valorAssinatura');
    const valorDesconto = document.getElementById('valorDesconto');
    const valorTotal = document.getElementById('valorTotal');
    
    const plano = planoSelect.value;
    let preco, desconto, total, labelTexto;
    
    switch(plano) {
        case 'mensal':
            preco = 29.90;
            desconto = 4.19;
            total = 25.71;
            labelTexto = 'Assinatura (Mensal)';
            break;
        case 'semestral':
            preco = 179.40;
            desconto = 25.12;
            total = 154.28;
            labelTexto = 'Assinatura (Semestral)';
            break;
        case 'anual':
            preco = 358.80;
            desconto = 50.23;
            total = 308.57;
            labelTexto = 'Assinatura (Anual)';
            break;
    }
    
    labelAssinatura.textContent = labelTexto;
    valorAssinatura.textContent = `R$ ${preco.toFixed(2).replace('.', ',')}`;
    valorDesconto.textContent = `R$ -${desconto.toFixed(2).replace('.', ',')}`;
    valorTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}