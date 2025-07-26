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

document.getElementById('certificadoFaculdade').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const button = e.target.nextElementSibling;
    
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('Certificado de faculdade muito grande. Máximo permitido: 10MB');
            e.target.value = '';
            return;
        }
        
        const tiposPermitidos = [
            'application/pdf', 
            'image/jpeg', 
            'image/jpg', 
            'image/png', 
            'image/gif', 
            'image/webp'
        ];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de certificado não suportado. Use: PDF, JPEG, PNG, GIF ou WEBP');
            e.target.value = '';
            return;
        }
        
        criarPreviewCertificado('certificadoFaculdade', file, button);
    }
});

document.getElementById('certificadoCurso').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const button = e.target.nextElementSibling;
    
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert('Certificado de curso muito grande. Máximo permitido: 10MB');
            e.target.value = '';
            return;
        }

        const tiposPermitidos = [
            'application/pdf', 
            'image/jpeg', 
            'image/jpg', 
            'image/png', 
            'image/gif', 
            'image/webp'
        ];
        if (!tiposPermitidos.includes(file.type)) {
            alert('Formato de certificado não suportado. Use: PDF, JPEG, PNG, GIF ou WEBP');
            e.target.value = '';
            return;
        }
        
        criarPreviewCertificado('certificadoCurso', file, button);
    }
});

function criarPreviewCertificado(inputId, file, button) {
    const previewExistente = document.getElementById(`preview-${inputId}`);
    if (previewExistente) {
        previewExistente.remove();
    }
    
    const previewContainer = document.createElement('div');
    previewContainer.id = `preview-${inputId}`;
    previewContainer.className = 'preview-certificado';
    
    const icone = document.createElement('span');
    icone.className = 'material-icons';
    icone.style.cssText = `
        font-size: 32px;
        color: #4CAF50;
    `;
    
    if (file.type === 'application/pdf') {
        icone.textContent = 'picture_as_pdf';
    } else {
        icone.textContent = 'image';
    }
    
    const infoContainer = document.createElement('div');
    infoContainer.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 5px;
    `;
    
    const nomeArquivo = document.createElement('span');
    nomeArquivo.textContent = file.name;
    nomeArquivo.style.cssText = `
        font-weight: bold;
        color: #333;
        font-size: 14px;
    `;
    
    const tamanhoArquivo = document.createElement('span');
    tamanhoArquivo.textContent = `Tamanho: ${formatarTamanho(file.size)}`;
    tamanhoArquivo.style.cssText = `
        color: #666;
        font-size: 12px;
    `;
    
    const tipoArquivo = document.createElement('span');
    tipoArquivo.textContent = `Tipo: ${file.type}`;
    tipoArquivo.style.cssText = `
        color: #666;
        font-size: 12px;
    `;
    
    const botaoRemover = document.createElement('button');
    botaoRemover.type = 'button';
    botaoRemover.innerHTML = '<span class="material-icons">delete</span>';
    botaoRemover.style.cssText = `
        color: white;
        background: none;
        border: none;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.3s;
    `;
    
    botaoRemover.onclick = function() {
        document.getElementById(inputId).value = '';
        previewContainer.remove();
        button.innerHTML = `
            <span class="material-icons icone-upload">cloud_upload</span>
            Faça o Upload do Certificado
        `;
    };
    
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgPreview = document.createElement('img');
            imgPreview.src = e.target.result;
            imgPreview.style.cssText = `
                max-width: 80px;
                max-height: 80px;
                border-radius: 4px;
                object-fit: cover;
                border: 1px solid #ddd;
            `;
            previewContainer.insertBefore(imgPreview, infoContainer);
        };
        reader.readAsDataURL(file);
    }
    
    infoContainer.appendChild(nomeArquivo);
    infoContainer.appendChild(tamanhoArquivo);
    infoContainer.appendChild(tipoArquivo);
    
    previewContainer.appendChild(icone);
    previewContainer.appendChild(infoContainer);
    previewContainer.appendChild(botaoRemover);
    
    button.parentNode.insertBefore(previewContainer, button.nextSibling);
    
    button.innerHTML = `
        <span class="material-icons icone-upload">check_circle</span>
        Arquivo Selecionado
    `;
    button.style.backgroundColor = '#4CAF50';
}

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