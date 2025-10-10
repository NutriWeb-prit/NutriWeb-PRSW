document.addEventListener('DOMContentLoaded', function () {
    const elements = {
        desktop: {
            items: document.querySelectorAll('.carousel-item'),
            next: document.querySelector('.carousel-control-next'),
            prev: document.querySelector('.carousel-control-prev'),
            thirdImage: document.querySelector('.carousel-item:nth-child(3) img'),
            fifthImage: document.querySelector('.carousel-item:nth-child(5) img')
        },
        mobile: {
            items: document.querySelectorAll('.carousel-item-mobile'),
            next: document.querySelector('.carousel-control-next-mobile'),
            prev: document.querySelector('.carousel-control-prev-mobile'),
            thirdImage: document.querySelector('.carousel-item-mobile:nth-child(3) img'),
            fifthImage: document.querySelector('.carousel-item-mobile:nth-child(5) img')
        },
        indicators: document.querySelectorAll('.indicator')
    };

    const state = {
        desktop: { currentIndex: 0, intervalId: null },
        mobile: { currentIndex: 0, intervalId: null }
    };

    const AUTOPLAY_DELAY = 3000;

    function updateCarousel(type, index) {
        const { items, thirdImage, fifthImage } = elements[type];
        const currentState = state[type];
        
        items.forEach((item, i) => {
            item.classList.remove('active');
            item.style.zIndex = i === index ? '2' : '1';
        });
        
        items[index]?.classList.add('active');
        
        if (thirdImage) {
            if (index === 2) {
                thirdImage.setAttribute('onclick', 'irPagina()');
                thirdImage.style.cursor = 'pointer';
            } else {
                thirdImage.removeAttribute('onclick');
                thirdImage.style.cursor = 'default';
            }
        }
        
        if (fifthImage) {
            if (index === 4) {
                fifthImage.setAttribute('onclick', 'irAgroBox()');
                fifthImage.style.cursor = 'pointer';
            } else {
                fifthImage.removeAttribute('onclick');
                fifthImage.style.cursor = 'default';
            }
        }
        
        if (type === 'desktop') {
            elements.indicators[currentState.currentIndex]?.classList.remove('active');
            elements.indicators[index]?.classList.add('active');
        }
        
        currentState.currentIndex = index;
    }

    function startAutoPlay(type) {
        const currentState = state[type];
        const itemsLength = elements[type].items.length;
        
        currentState.intervalId = setInterval(() => {
            const nextIndex = (currentState.currentIndex + 1) % itemsLength;
            updateCarousel(type, nextIndex);
        }, AUTOPLAY_DELAY);
    }

    function resetAutoPlay(type) {
        clearInterval(state[type].intervalId);
        startAutoPlay(type);
    }

    function navigate(type, direction) {
        const itemsLength = elements[type].items.length;
        let nextIndex;
        
        if (direction === 'next') {
            nextIndex = (state[type].currentIndex + 1) % itemsLength;
        } else {
            nextIndex = (state[type].currentIndex - 1 + itemsLength) % itemsLength;
        }
        
        updateCarousel(type, nextIndex);
        resetAutoPlay(type);
    }

    function setupEventListeners() {
        elements.desktop.next?.addEventListener('click', () => navigate('desktop', 'next'));
        elements.desktop.prev?.addEventListener('click', () => navigate('desktop', 'prev'));
        
        elements.mobile.next?.addEventListener('click', () => navigate('mobile', 'next'));
        elements.mobile.prev?.addEventListener('click', () => navigate('mobile', 'prev'));
        
        elements.indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                updateCarousel('desktop', index);
                resetAutoPlay('desktop');
            });
        });
    }

    function init() {
        updateCarousel('desktop', 0);
        updateCarousel('mobile', 0);
        
        if (elements.desktop.items.length > 0) startAutoPlay('desktop');
        if (elements.mobile.items.length > 0) startAutoPlay('mobile');
        
        setupEventListeners();
    }

    init();
});

function irPagina() {
    window.location.href = "/quiz";
}

function irAgroBox() {
    window.open("https://agrobox.onrender.com/", "_blank");
}