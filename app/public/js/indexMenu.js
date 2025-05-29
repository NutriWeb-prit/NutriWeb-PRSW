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
    const listafiltrarmobile = document.querySelector('.listafiltrarmobile')

    filterbutton.addEventListener('click', function() {
        listafiltrar.classList.toggle('hidden');
    });

    filterbuttonmobile.addEventListener('click', function() {
        listafiltrarmobile.classList.toggle('hidden');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const buttonavaliar = document.querySelector('.bookmarkBtn');
    const buttonavaliarmobile = document.querySelector('bookmarkBtn');
    const overlay = document.querySelector('.overlay');

    buttonavaliar.addEventListener('click', function() {
        overlay.classList.toggle('hidden');
    });

    buttonavaliarmobile.addEventListener('click', function() {
        overlay.classList.toggle('hidden');
    });
});

function fecharMenu() {
    document.querySelector('.overlay').classList.toggle('hidden');    
};