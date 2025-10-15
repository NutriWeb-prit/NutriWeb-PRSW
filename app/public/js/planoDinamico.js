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
            preco = 79.90;
            desconto = 11.18;
            total = 68.72;
            labelTexto = 'Assinatura (Mensal)';
            break;
        case 'semestral':
            preco = 479.40;
            desconto = 67.12;
            total = 412.28;
            labelTexto = 'Assinatura (Semestral)';
            break;
        case 'anual':
            preco = 958.80;
            desconto = 134.23;
            total = 824.57;
            labelTexto = 'Assinatura (Anual)';
            break;
    }
    
    labelAssinatura.textContent = labelTexto;
    valorAssinatura.textContent = `R$ ${preco.toFixed(2).replace('.', ',')}`;
    valorDesconto.textContent = `R$ -${desconto.toFixed(2).replace('.', ',')}`;
    valorTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}