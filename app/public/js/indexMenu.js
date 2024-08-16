document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');

    menuIcon.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
    });
});

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