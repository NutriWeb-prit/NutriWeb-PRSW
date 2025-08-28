document.addEventListener('DOMContentLoaded', function() {
    const menuItems = document.querySelectorAll('.left-panel ul li');
    const sections = document.querySelectorAll('.config-section');
    
    menuItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            menuItems.forEach(mi => mi.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('ativo'));
            
            item.classList.add('active');
            sections[index].classList.add('ativo');
        });
    });
    
    const inputPerfil = document.getElementById('input-foto-perfil');
    const previewPerfil = document.getElementById('preview-perfil');
    const inputBanner = document.getElementById('input-foto-banner');
    const previewBanner = document.getElementById('preview-banner');
    
    inputPerfil.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Arquivo muito grande. Máximo permitido: 5MB');
                this.value = '';
                return;
            }
            
            const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!tiposPermitidos.includes(file.type)) {
                alert('Formato não suportado. Use: JPEG, PNG, GIF ou WEBP');
                this.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewPerfil.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    inputBanner.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Arquivo muito grande. Máximo permitido: 5MB');
                this.value = '';
                return;
            }
            
            const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!tiposPermitidos.includes(file.type)) {
                alert('Formato não suportado. Use: JPEG, PNG, GIF ou WEBP');
                this.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                previewBanner.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.querySelector('.botao.cancel').addEventListener('click', function() {
        if (confirm('Tem certeza que deseja cancelar as alterações?')) {
            previewPerfil.src = '<%= headerUsuario.fotoPerfil %>';
            previewBanner.src = '<%= headerUsuario.fotoBanner %>';
            
            inputPerfil.value = '';
            inputBanner.value = '';
        }
    });
});