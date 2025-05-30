function handleImageUpload(event, imageElement) {
    const file = event.target.files[0];

    if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
            imageElement.src = e.target.result;
        }

        reader.readAsDataURL(file);
    }
}

document.getElementById('input-imagem').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const previewImage = document.getElementById('preview-image');
    const uploadArea = document.querySelector('.upload-area');

    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            previewImage.style.display = 'block';
            uploadArea.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
});

const banner = document.getElementById('placeholder-banner');
const bannerUpload = document.getElementById('input-banner');

if (banner && bannerUpload) {
    bannerUpload.addEventListener('change', function(event) {
        handleImageUpload(event, banner);
    });
}

const image = document.getElementById('placeholder');
const imageUpload = document.getElementById('imageUpload');

if (image && imageUpload) {
    imageUpload.addEventListener('change', function(event) {
        handleImageUpload(event, image);
    });
}