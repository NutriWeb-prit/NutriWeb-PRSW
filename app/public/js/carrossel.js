document.addEventListener('DOMContentLoaded', function () {
    const carouselItems = document.querySelectorAll('.carousel-item');
    const carouselItemsMobile = document.querySelectorAll('.carousel-item-mobile');
    const nextButton = document.querySelector('.carousel-control-next');
    const prevButton = document.querySelector('.carousel-control-prev');
    const nextButtonMobile = document.querySelector('.carousel-control-next-mobile');
    const prevButtonMobile = document.querySelector('.carousel-control-prev-mobile');
    const thirdImageButton = document.getElementById('btn-sabeMais');
    const thirdImageButtonMobile = document.getElementById('btn-sabeMais-mobile');

    let currentIndex = 0;
    let currentIndexMobile = 0;
    let intervalId;
    let intervalIdMobile;


    function updateCarousel(items, button, index, isMobile = false) {
        items.forEach((item, i) => {
            item.classList.remove('active');
            if (i === index) {
                item.classList.add('active');   
                if (i === 2) { 
                    if (isMobile) {
                        button.classList.remove('hidden');
                    } else {
                        button.classList.remove('hidden');
                    }
                } else {
                    button.classList.add('hidden');
                }
            }
        });
    }

    function startAutoPlay() {
        intervalId = setInterval(AutoPlay, 3000);
    }
 
    function startAutoPlayMobile() {
        intervalIdMobile = setInterval(AutoPlayMobile, 3000);
    }
 
    function resetAutoPlay() {
        clearInterval(intervalId);
        startAutoPlay();
    }
 
    function resetAutoPlayMobile() {
        clearInterval(intervalIdMobile);
        startAutoPlayMobile();
    }
 
    function AutoPlay() {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarousel(carouselItems, thirdImageButton, currentIndex);
    }
 
    function AutoPlayMobile() {
        currentIndexMobile = (currentIndexMobile + 1) % carouselItemsMobile.length;
        updateCarousel(carouselItemsMobile, thirdImageButtonMobile, currentIndexMobile, true);
    }

    startAutoPlay();
    startAutoPlayMobile();

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarousel(carouselItems, thirdImageButton, currentIndex);
        resetAutoPlay()
    });

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
        updateCarousel(carouselItems, thirdImageButton, currentIndex);
        resetAutoPlay()
    });

    nextButtonMobile.addEventListener('click', () => {
        currentIndexMobile = (currentIndexMobile + 1) % carouselItemsMobile.length;
        updateCarousel(carouselItemsMobile, thirdImageButtonMobile, currentIndexMobile, true);
        resetAutoPlayMobile()
    });

    prevButtonMobile.addEventListener('click', () => {
        currentIndexMobile = (currentIndexMobile - 1 + carouselItemsMobile.length) % carouselItemsMobile.length;
        updateCarousel(carouselItemsMobile, thirdImageButtonMobile, currentIndexMobile, true);
        resetAutoPlayMobile()
    });

    updateCarousel(carouselItems, thirdImageButton, currentIndex);
    updateCarousel(carouselItemsMobile, thirdImageButtonMobile, currentIndexMobile, true);
});

function irPagina() {
    window.location.href = "/tiponutri";
}