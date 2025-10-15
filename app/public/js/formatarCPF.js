function formatarCPF(input) {
    let cpf = input.value.replace(/\D/g, '');
    
    cpf = cpf.substring(0, 11);
    
    if (cpf.length <= 3) {
        input.value = cpf;
    } else if (cpf.length <= 6) {
        input.value = cpf.substring(0, 3) + '.' + cpf.substring(3);
    } else if (cpf.length <= 9) {
        input.value = cpf.substring(0, 3) + '.' + cpf.substring(3, 6) + '.' + cpf.substring(6);
    } else {
        input.value = cpf.substring(0, 3) + '.' + cpf.substring(3, 6) + '.' + cpf.substring(6, 9) + '-' + cpf.substring(9);
    }
}

function formatarTelefone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        if (value.length <= 2) {
            value = value.replace(/(\d{2})/, '($1');
        } else if (value.length <= 7) {
            value = value.replace(/(\d{2})(\d{4,5})/, '($1) $2');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
    }
    
    input.value = value;
}

function formatarCartao(input) {
    let value = input.value.replace(/\D/g, '');
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = value;
}

function formatarValidade(input) {
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.replace(/(\d{2})(\d)/, '$1/$2');
    }
    input.value = value;
}