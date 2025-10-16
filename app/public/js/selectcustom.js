document.addEventListener('DOMContentLoaded', function() {
    const selectCustomElements = document.querySelectorAll('.select-selected, .select-items');
    selectCustomElements.forEach(el => el.remove());
    
    const selects = document.querySelectorAll('.custom-select select');
    selects.forEach(select => {
        select.style.display = 'block';
    });
    
    console.log('Select nativo ativado');
});