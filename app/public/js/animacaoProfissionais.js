document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll(".cards-container");

    function aplicarAnimacaoCards() {
        containers.forEach(container => {
            const cards = container.querySelectorAll(".card");

            function handleScroll() {
                const containerCenter = container.scrollLeft + container.offsetWidth / 2;
                let closestCard = null;
                let closestDistance = Infinity;

                cards.forEach(card => {
                    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                    const distance = Math.abs(containerCenter - cardCenter);

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestCard = card;
                    }
                });

                cards.forEach(card => card.classList.remove("active"));
                if (closestCard) closestCard.classList.add("active");
            }

            container.addEventListener("scroll", () => {
                clearTimeout(container._scrollTimeout);
                container._scrollTimeout = setTimeout(handleScroll, 50);
            });

            window.addEventListener("resize", handleScroll);

            handleScroll();
        });
    }

    aplicarAnimacaoCards();
});

document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.cards-container');

    containers.forEach((container, containerIndex) => {
        const cards = container.querySelectorAll('.card');

        let indicatorsContainer = document.getElementById(`carousel-indicators-${containerIndex}`);
        if (!indicatorsContainer) {
            indicatorsContainer = document.createElement('section');
            indicatorsContainer.id = `carousel-indicators-${containerIndex}`;
            indicatorsContainer.className = 'indicators';
            container.after(indicatorsContainer); 
        }

        cards.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                cards[index].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            });
            indicatorsContainer.appendChild(dot);
        });

        const dots = indicatorsContainer.querySelectorAll('.dot');

        let scrollTimeout;
        container.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const containerRect = container.getBoundingClientRect();
                let closestIndex = 0;
                let minDistance = Infinity;

                cards.forEach((card, index) => {
                    const cardRect = card.getBoundingClientRect();
                    const cardCenter = cardRect.left + cardRect.width / 2;
                    const containerCenter = containerRect.left + containerRect.width / 2;
                    const distance = Math.abs(containerCenter - cardCenter);

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestIndex = index;
                    }
                });

                dots.forEach(dot => dot.classList.remove('active'));
                if (dots[closestIndex]) dots[closestIndex].classList.add('active');
            }, 100);
        });
    });
});