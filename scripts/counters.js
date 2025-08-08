// Function to update all counters across pages
function updateCounters() {
  // Update cart counter
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCounters = document.querySelectorAll("#cartCounter");
  cartCounters.forEach((counter) => {
    counter.textContent = cart.reduce((total, item) => total + item.qty, 0);
  });

  // Update wishlist counter
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  const wishlistCounters = document.querySelectorAll("#wishlistCounter");
  wishlistCounters.forEach((counter) => {
    counter.textContent = wishlist.length;
  });
}

// Call updateCounters when the page loads
document.addEventListener("DOMContentLoaded", updateCounters);

// Export the function to be used by other modules
export { updateCounters };
