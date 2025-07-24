document.getElementById('input-imagem').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('preview-image');
    
    if (file) {
        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Foto de perfil muito grande. Máximo permitido: 5MB');
            e.target.value = '';
            return;
        }
        
        // Validar tipo
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de foto de perfil não suportado. Use: JPEG, PNG, GIF ou WEBP');
            e.target.value = '';
            return;
        }
        
        // Mostrar preview
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Preview do banner
document.getElementById('input-banner').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('placeholder-banner');
    
    if (file) {
        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Banner muito grande. Máximo permitido: 5MB');
            e.target.value = '';
            return;
        }
        
        // Validar tipo
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de banner não suportado. Use: JPEG, PNG, GIF ou WEBP');
            e.target.value = '';
            return;
        }
        
        // Mostrar preview
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Função para toggle da informação (se não existir)
function toggleInfo() {
    const info = document.getElementById('informacao');
    if (info.style.display === 'none') {
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
}