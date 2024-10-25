document.addEventListener('DOMContentLoaded', function() {
    const menuIcon = document.querySelector('.menu-icon');
    const mobileMenu = document.querySelector('.mobile-menu');

    menuIcon.addEventListener('click', function() {
        mobileMenu.classList.toggle('hidden');

        if (menuIcon.textContent === 'menu') {
            menuIcon.textContent = 'close';
        } else {
            menuIcon.textContent = 'menu';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const filterbutton = document.querySelector('.filter-button');
    const filterbuttonmobile = document.getElementById('filter-mobile');
    const listafiltrar = document.querySelector('.listafiltrar');

    filterbutton.addEventListener('click', function() {
        listafiltrar.classList.toggle('hidden');
    });

    filterbuttonmobile.addEventListener('click', function() {
        listafiltrar.classList.toggle('hidden');
    });
});