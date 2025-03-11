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

const foto = document.getElementById('placeholder-foto');
const fotoUpload = document.getElementById('input-imagem');

if (foto && fotoUpload) {
    fotoUpload.addEventListener('change', function(event) {
        handleImageUpload(event, foto);
    });
}

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