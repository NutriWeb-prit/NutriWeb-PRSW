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