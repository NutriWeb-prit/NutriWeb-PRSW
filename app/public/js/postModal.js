const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const closeModal = document.querySelector(".close-modal");

document.querySelectorAll(".post_img").forEach(img => {
        img.addEventListener("click", () => {
        modal.style.display = "block";
        modalImg.src = img.dataset.img;
    });
});

closeModal.onclick = () => {
    modal.style.display = "none";
};

window.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};