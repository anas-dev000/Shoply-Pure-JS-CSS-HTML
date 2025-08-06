import { db } from "./firebase-config.js";
import {
  ref,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "customer") location.href = "./login.html";

const productList = document.getElementById("productList");
const filterCategory = document.getElementById("filterCategory");
const customerNameElement = document.getElementById("customerName");

if (customerNameElement) {
  customerNameElement.textContent = user.name;
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if (filterCategory) {
  onValue(ref(db, "categories"), (snap) => {
    clearElement(filterCategory);
    filterCategory.appendChild(
      createElement("option", { value: "", textContent: "All Categories" })
    );
    snap.forEach((child) => {
      const cat = child.val().name;
      filterCategory.appendChild(
        createElement("option", { value: cat, textContent: cat })
      );
    });
  });
}

function renderProducts() {
  onValue(ref(db, "products"), (snap) => {
    clearElement(productList);
    const selectedCat = filterCategory.value;
    if (!snap.exists()) {
      productList.appendChild(
        createElement(
          "li",
          { className: "list-item" },
          `<div class="item-content"><p>No products found.</p></div>`
        )
      );
      return;
    }
    snap.forEach((child) => {
      const prod = child.val();
      const id = child.key;
      if (!selectedCat || prod.category === selectedCat) {
        const li = createElement(
          "li",
          { className: "list-item" },
          `
          <a href="./product.html?id=${id}">
            <img src="${prod.image}" alt="${
            prod.name
          }" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
            <div class="item-content">
              <h3>${prod.name}</h3>
              <p>${prod.category} - $${prod.price.toFixed(2)}</p>
              <p>${prod.description}</p>
              <p>Stock: ${prod.stock}</p>
            </div>
          </a>
          <div class="item-actions">
            <button onclick="addToCart('${id}')" class="btn btn-success">🛒 Add to Cart</button>
            <button onclick="addToWishlist('${id}')" class="btn btn-primary">❤️ Add to Wishlist</button>
          </div>
        `
        );
        productList.appendChild(li);
      }
    });
  });
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

window.addToWishlist = function (id) {
  const wish = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (!wish.includes(id)) {
    wish.push(id);
    localStorage.setItem("wishlist", JSON.stringify(wish));
    alert("Added to wishlist");
  }
};

window.removeFromWishlist = function (id) {
  const wish = JSON.parse(localStorage.getItem("wishlist")) || [];
  const updatedWish = wish.filter((item) => item !== id);
  localStorage.setItem("wishlist", JSON.stringify(updatedWish));
  alert("Removed from wishlist");
};

if (productList) {
  renderProducts();
}

if (filterCategory) {
  filterCategory.addEventListener("change", renderProducts);
}
