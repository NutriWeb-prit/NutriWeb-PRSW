document.getElementById('input-imagem').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('preview-image');
    
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('Foto de perfil muito grande. Máximo permitido: 5MB');
            e.target.value = '';
            return;
        }
        
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de foto de perfil não suportado. Use: JPEG, PNG, GIF ou WEBP');
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById('input-banner').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const preview = document.getElementById('placeholder-banner');
    
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert('Banner muito grande. Máximo permitido: 5MB');
            e.target.value = '';
            return;
        }
        
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de banner não suportado. Use: JPEG, PNG, GIF ou WEBP');
            e.target.value = '';
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

function formatarTamanho(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
}

function toggleInfo() {
    const info = document.getElementById('informacao');
    if (info.style.display === 'none') {
        info.style.display = 'block';
    } else {
        info.style.display = 'none';
    }
}