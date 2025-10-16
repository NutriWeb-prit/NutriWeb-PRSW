document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal');
    const btnNovaPublicacao = document.getElementById('novapublicacao'); // Botão que abre o modal
    const fecharModal = document.getElementById('fecharModal');
    const inputImagem = document.getElementById('input-imagem');
    const previewImage = document.getElementById('preview-image');
    const uploadArea = document.querySelector('.upload-area');
    const legendaTextarea = document.getElementById('legenda');
    const charCount = document.getElementById('char-count');
    const btnPostar = document.querySelector('.btn-postar');

    let selectCategoria = document.getElementById('categoria');
    
    if (!selectCategoria && legendaTextarea) {
        const categoriaContainer = document.createElement('section');
        categoriaContainer.className = 'categoria-container';
        categoriaContainer.style.marginBottom = '15px';
        
        categoriaContainer.innerHTML = `
            <label for="categoria" style="display: block; margin-bottom: 8px; font-weight: 600;">
                Categoria *
            </label>
            <select id="categoria" name="categoria" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
                <option value="">Selecione uma categoria</option>
                <option value="Dica">Dica</option>
                <option value="Receita">Receita</option>
            </select>
        `;
        
        legendaTextarea.parentElement.parentElement.insertBefore(
            categoriaContainer, 
            legendaTextarea.parentElement
        );
        
        selectCategoria = document.getElementById('categoria');
    }

    let imagemSelecionada = null;

    if (btnNovaPublicacao) {
        btnNovaPublicacao.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModal();
        });
    }

    if (fecharModal) {
        fecharModal.addEventListener('click', fecharModalFunc);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                fecharModalFunc();
            }
        });
    }

    if (inputImagem) {
        inputImagem.addEventListener('change', function(e) {
            const arquivo = e.target.files[0];
            
            if (arquivo) {
                if (arquivo.size > 5 * 1024 * 1024) {
                    mostrarNotificacao('Imagem muito grande. Máximo: 5MB');
                    inputImagem.value = '';
                    return;
                }

                const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!tiposPermitidos.includes(arquivo.type)) {
                    mostrarNotificacao('Formato não suportado. Use: JPEG, PNG, GIF ou WEBP');
                    inputImagem.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(event) {
                    previewImage.src = event.target.result;
                    previewImage.style.display = 'block';
                    if (uploadArea) {
                        uploadArea.style.display = 'none';
                    }
                    imagemSelecionada = arquivo;
                };
                reader.readAsDataURL(arquivo);
            }
        });
    }

    if (legendaTextarea) {
        legendaTextarea.addEventListener('input', function() {
            const count = this.value.length;
            if (charCount) {
                charCount.textContent = `${count} / 1000`;
            }

            if (count > 1000) {
                this.value = this.value.substring(0, 1000);
                if (charCount) {
                    charCount.textContent = '1000 / 1000';
                }
            }
        });
    }

    if (btnPostar) {
        btnPostar.addEventListener('click', async function(e) {
            e.preventDefault();
            await publicarPost();
        });
    }

    function abrirModal() {
        if (modal) {
            modal.style.display = 'flex';
            limparModal();
        }
    }

    function fecharModalFunc() {
        if (modal) {
            modal.style.display = 'none';
            limparModal();
        }
    }

    function limparModal() {
        if (inputImagem) inputImagem.value = '';
        if (previewImage) {
            previewImage.src = '';
            previewImage.style.display = 'none';
        }
        if (uploadArea) uploadArea.style.display = 'flex';
        if (legendaTextarea) legendaTextarea.value = '';
        if (charCount) charCount.textContent = '0 / 1000';
        if (selectCategoria) selectCategoria.value = '';
        imagemSelecionada = null;
    }

    async function publicarPost() {
        if (!imagemSelecionada) {
            mostrarNotificacao('Por favor, selecione uma imagem');
            return;
        }

        if (!selectCategoria || !selectCategoria.value) {
            mostrarNotificacao('Por favor, selecione uma categoria');
            return;
        }

        const legenda = legendaTextarea ? legendaTextarea.value.trim() : '';
        
        if (legenda.length > 1000) {
            mostrarNotificacao('A legenda deve ter no máximo 1000 caracteres');
            return;
        }

        btnPostar.disabled = true;
        btnPostar.textContent = 'Publicando...';

        try {
            const formData = new FormData();
            formData.append('imagem', imagemSelecionada);
            formData.append('legenda', legenda);
            formData.append('categoria', selectCategoria.value);

            const response = await fetch('/publicacao/criar', {
                method: 'POST',
                body: formData
            });

            if (response.redirected) {
                window.location.href = response.url;
            } else if (response.ok) {
                window.location.href = '/perfilnutri?sucesso=publicacao_criada';
            } else {
                window.location.href = '/perfilnutri?erro=erro_criar_publicacao';
            }

        } catch (error) {
            console.error('Erro ao publicar:', error);
            mostrarNotificacao('Erro ao publicar. Tente novamente.');
            btnPostar.disabled = false;
            btnPostar.textContent = 'Postar';
        }
    }
});

function mostrarNotificacao(mensagem, delay = 0) {
    setTimeout(() => {
        alert(mensagem);
    }, delay);
}