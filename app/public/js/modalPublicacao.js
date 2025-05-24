(() => {
    const abrir = document.getElementById("novapublicacao");
    const modal = document.getElementById("modal");
    const fechar = document.getElementById("fecharModal");

    abrir.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "flex";
    });

    fechar.addEventListener("click", () => {
        modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
        if (e.target == modal) {
            modal.style.display = "none";
        }
    });
})();