document.addEventListener("DOMContentLoaded", () => {
    const containers = document.querySelectorAll(".cards-container");

    function isMobileView() {
        return window.innerWidth < 768;
    }

    function aplicarAnimacaoCards() {
        containers.forEach(container => {
        const cards = container.querySelectorAll(".card");

        function handleScroll() {
            if (!isMobileView()) {
            cards.forEach(card => card.classList.remove("active"));
            return;
            }

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

        container.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleScroll);
        handleScroll(); 
        });
    }

    aplicarAnimacaoCards();
});