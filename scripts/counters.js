function updateCounters() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCounters = document.querySelectorAll("#cartCounter");
  cartCounters.forEach((counter) => {
    counter.textContent = cart.reduce((total, item) => total + item.qty, 0);
  });

  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const wishlistCounters = document.querySelectorAll("#wishlistCounter");
  wishlistCounters.forEach((counter) => {
    const count = wishlist.length;
    counter.textContent = count;
    counter.style.display = count > 0 ? "inline-flex" : "none";
  });
}

window.updateCounters = updateCounters;
document.addEventListener("DOMContentLoaded", updateCounters);
window.addEventListener("storage", (e) => {
  if (e.key === "wishlist" || e.key === "cart") updateCounters();
});

export { updateCounters };
