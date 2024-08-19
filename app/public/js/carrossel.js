// document.addEventListener('DOMContentLoaded', function() {
//     const items = document.querySelectorAll('.carousel-item');
//     const totalItems = items.length;
//     let currentIndex = 0;
//     let autoPlayInterval;

//     function showNextItem() {
//         items[currentIndex].classList.remove('active');
//         currentIndex = (currentIndex + 1) % totalItems;
//         items[currentIndex].classList.add('active');
//     }

//     function showPrevItem() {
//         items[currentIndex].classList.remove('active');
//         currentIndex = (currentIndex - 1 + totalItems) % totalItems;
//         items[currentIndex].classList.add('active');
//     }

//     function startAutoPlay() {
//         autoPlayInterval = setInterval(showNextItem, 3000);
//     }

//     function stopAutoPlay() {
//         clearInterval(autoPlayInterval);
//     }

//     document.querySelector('.carousel-control-next').addEventListener('click', function() {
//         stopAutoPlay(); 
//         showNextItem();
//         startAutoPlay(); 
//     });

//     document.querySelector('.carousel-control-prev').addEventListener('click', function() {
//         stopAutoPlay();
//         showPrevItem();
//         startAutoPlay(); 
//     });

//     startAutoPlay();
// });

// document.addEventListener('DOMContentLoaded', function() {
//     const items = document.querySelectorAll('.carousel-item-mobile');
//     const totalItems = items.length;
//     let currentIndex = 0;
//     let autoPlayInterval;

//     function showNextItem() {
//         items[currentIndex].classList.remove('active');
//         currentIndex = (currentIndex + 1) % totalItems;
//         items[currentIndex].classList.add('active');
//     }

//     function showPrevItem() {
//         items[currentIndex].classList.remove('active');
//         currentIndex = (currentIndex - 1 + totalItems) % totalItems;
//         items[currentIndex].classList.add('active');
//     }

//     function startAutoPlay() {
//         autoPlayInterval = setInterval(showNextItem, 3000);
//     }

//     function stopAutoPlay() {
//         clearInterval(autoPlayInterval);
//     }

//     document.querySelector('.carousel-control-next-mobile').addEventListener('click', function() {
//         stopAutoPlay(); 
//         showNextItem();
//         startAutoPlay(); 
//     });

//     document.querySelector('.carousel-control-prev-mobile').addEventListener('click', function() {
//         stopAutoPlay();
//         showPrevItem();
//         startAutoPlay(); 
//     });

//     startAutoPlay();
// });

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

    function AutoPlay() {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarousel(carouselItems, thirdImageButton, currentIndex);
    }
 
    function AutoPlayMobile() {
        currentIndexMobile = (currentIndexMobile + 1) % carouselItemsMobile.length;
        updateCarousel(carouselItemsMobile, thirdImageButtonMobile, currentIndexMobile, true);
    }

    function stopAutoPlay() {
        clearInterval(setInterval);
        clearInterval(setIntervalMobile);
    }
 
    setInterval(AutoPlay, 3000);
    setInterval(AutoPlayMobile, 3000);

    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % carouselItems.length;
        updateCarousel(carouselItems, thirdImageButton, currentIndex);
    });

    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + carouselItems.length) % carouselItems.length;
        updateCarousel(carouselItems, thirdImageButton, currentIndex);
    });

    nextButtonMobile.addEventListener('click', () => {
        currentIndexMobile = (currentIndexMobile + 1) % carouselItemsMobile.length;
        updateCarousel(carouselItemsMobile, thirdImageButtonMobile, currentIndexMobile, true);
    });

    prevButtonMobile.addEventListener('click', () => {
        currentIndexMobile = (currentIndexMobile - 1 + carouselItemsMobile.length) % carouselItemsMobile.length;
        updateCarousel(carouselItemsMobile, thirdImageButtonMobile, currentIndexMobile, true);
    });

    updateCarousel(carouselItems, thirdImageButton, currentIndex);
    updateCarousel(carouselItemsMobile, thirdImageButtonMobile, currentIndexMobile, true);
});