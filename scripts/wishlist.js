import { db } from "./firebase-config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "customer") window.location.href = "./login.html";

const wishlistElement = document.getElementById("wishlist");
const customerNameElement = document.getElementById("customerName");

if (customerNameElement) {
  customerNameElement.textContent = user.name;
}

async function renderWishlist() {
  const wish = JSON.parse(localStorage.getItem("wishlist")) || [];
  clearElement(wishlistElement);

  if (wish.length === 0) {
    wishlistElement.appendChild(
      createElement(
        "li",
        { className: "list-item" },
        `<div class="item-content"><p>Your wishlist is empty.</p></div>`
      )
    );
    return;
  }

  for (const id of wish) {
    try {
      const prodSnap = await get(ref(db, `products/${id}`));
      if (prodSnap.exists()) {
        const prod = prodSnap.val();
        const li = createElement(
          "li",
          { className: "list-item" },
          `
          <img src="${prod.image}" alt="${
            prod.name
          }" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
          <div class="item-content">
            <h3>${prod.name}</h3>
            <p>${prod.category} - $${prod.price.toFixed(2)}</p>
            <p>${prod.description}</p>
            <p>Stock: ${prod.stock}</p>
          </div>
          <div class="item-actions">
            <button onclick="addToCart('${id}')" class="btn btn-success">🛒 Add to Cart</button>
            <button onclick="removeFromWishlist('${id}')" class="btn btn-error">❌ Remove</button>
          </div>
        `
        );
        wishlistElement.appendChild(li);
      } else {
        const updatedWish = wish.filter((item) => item !== id);
        localStorage.setItem("wishlist", JSON.stringify(updatedWish));
      }
    } catch (err) {
      console.error("Error fetching product:", err);
    }
  }
}

window.addToCart = async function (id) {
  const prodSnap = await get(ref(db, `products/${id}`));
  if (!prodSnap.exists() || prodSnap.val().stock <= 0) {
    return alert("Product out of stock");
  }
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const index = cart.findIndex((i) => i.id === id);
  if (index >= 0) cart[index].qty += 1;
  else cart.push({ id, qty: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Added to cart");
  if (typeof window.renderCart === "function") {
    window.renderCart();
  }
};

window.removeFromWishlist = function (id) {
  const wish = JSON.parse(localStorage.getItem("wishlist")) || [];
  const updatedWish = wish.filter((item) => item !== id);
  localStorage.setItem("wishlist", JSON.stringify(updatedWish));
  alert("Removed from wishlist");
  renderWishlist();
};

// Initialize display
renderWishlist();
