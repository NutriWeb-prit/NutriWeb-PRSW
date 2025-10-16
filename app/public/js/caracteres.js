const textarea = document.getElementById('legenda');
const counter = document.getElementById('char-count');

  textarea.addEventListener('input', () => {
    const length = textarea.value.length;
    counter.textContent = `${length} / 1000`;
});