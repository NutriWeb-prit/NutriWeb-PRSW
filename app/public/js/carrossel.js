document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.carousel-item');
    const totalItems = items.length;
    let currentIndex = 0;
    let autoPlayInterval;

    function showNextItem() {
        items[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % totalItems;
        items[currentIndex].classList.add('active');
    }

    function showPrevItem() {
        items[currentIndex].classList.remove('active');
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        items[currentIndex].classList.add('active');
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(showNextItem, 3000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    document.querySelector('.carousel-control-next').addEventListener('click', function() {
        stopAutoPlay(); 
        showNextItem();
        startAutoPlay(); 
    });

    document.querySelector('.carousel-control-prev').addEventListener('click', function() {
        stopAutoPlay();
        showPrevItem();
        startAutoPlay(); 
    });

    startAutoPlay();
});

document.addEventListener('DOMContentLoaded', function() {
    const items = document.querySelectorAll('.carousel-item-mobile');
    const totalItems = items.length;
    let currentIndex = 0;
    let autoPlayInterval;

    function showNextItem() {
        items[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % totalItems;
        items[currentIndex].classList.add('active');
    }

    function showPrevItem() {
        items[currentIndex].classList.remove('active');
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        items[currentIndex].classList.add('active');
    }

    function startAutoPlay() {
        autoPlayInterval = setInterval(showNextItem, 3000);
    }

    function stopAutoPlay() {
        clearInterval(autoPlayInterval);
    }

    document.querySelector('.carousel-control-next-mobile').addEventListener('click', function() {
        stopAutoPlay(); 
        showNextItem();
        startAutoPlay(); 
    });

    document.querySelector('.carousel-control-prev-mobile').addEventListener('click', function() {
        stopAutoPlay();
        showPrevItem();
        startAutoPlay(); 
    });

    startAutoPlay();
});

