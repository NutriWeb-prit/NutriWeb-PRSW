(() => {
    const abrir = document.getElementById("novapublicacao");
    const modal = document.getElementById("modal");
    const fechar = document.getElementById("fecharModal");

    abrir.addEventListener("click", (e) => {
        e.preventDefault();
        modal.style.display = "flex";
        document.body.classList.add("body-no-scroll");
    });

    fechar.addEventListener("click", () => {
        modal.style.display = "none";
        document.body.classList.remove("body-no-scroll"); 
    });

    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            document.body.classList.remove("body-no-scroll"); 
        }
    });
})();