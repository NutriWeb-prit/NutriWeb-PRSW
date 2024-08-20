document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');
    const menuClose = document.querySelector('.menu-close');

    menuIcon.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');
        document.menuIcon.style.display = "none";
        menuClose.classList.toggle('active');
    });
});