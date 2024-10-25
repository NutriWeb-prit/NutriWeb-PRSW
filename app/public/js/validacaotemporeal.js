const passwordInput = document.getElementById('senha');
const requirementsPopup = document.getElementById('password-requirements');

const lengthRequirement = document.getElementById('length');
const uppercaseRequirement = document.getElementById('uppercase');
const lowercaseRequirement = document.getElementById('lowercase');
const numberRequirement = document.getElementById('number');
const specialRequirement = document.getElementById('special');

passwordInput.addEventListener('keyup', () => {
    const password = passwordInput.value;

    if (password.length >= 8) {
        lengthRequirement.classList.remove('invalid');
        lengthRequirement.classList.add('valid');
    } else {
        lengthRequirement.classList.remove('valid');
        lengthRequirement.classList.add('invalid');
    }

    if (/[A-Z]/.test(password)) {
        uppercaseRequirement.classList.remove('invalid');
        uppercaseRequirement.classList.add('valid');
    } else {
        uppercaseRequirement.classList.remove('valid');
        uppercaseRequirement.classList.add('invalid');
    }

    if (/[a-z]/.test(password)) {
        lowercaseRequirement.classList.remove('invalid');
        lowercaseRequirement.classList.add('valid');
    } else {
        lowercaseRequirement.classList.remove('valid');
        lowercaseRequirement.classList.add('invalid');
    }

    if (/\d/.test(password)) {
        numberRequirement.classList.remove('invalid');
        numberRequirement.classList.add('valid');
    } else {
        numberRequirement.classList.remove('valid');
        numberRequirement.classList.add('invalid');
    }

    if (/[\W_]/.test(password)) {
        specialRequirement.classList.remove('invalid');
        specialRequirement.classList.add('valid');
    } else {
        specialRequirement.classList.remove('valid');
        specialRequirement.classList.add('invalid');
    }
});