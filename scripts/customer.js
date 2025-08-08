import { db } from "./firebase-config.js";
import {
  ref,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "customer") {
  console.error("User not logged in or not a customer, redirecting to login");
  location.href = "./login.html";
}

const productList = document.getElementById("productList");
const filterCategory = document.getElementById("filterCategory");
const customerNameElement = document.getElementById("customerName");

if (customerNameElement) {
  customerNameElement.textContent = user.name;
} else {
  console.warn("customerNameElement not found in DOM");
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if (filterCategory) {
  onValue(
    ref(db, "categories"),
    (snap) => {
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
    },
    (error) => {
      console.error("Error fetching categories:", error);
    }
  );
} else {
  console.warn("filterCategory element not found in DOM");
}

function renderProducts() {
  if (!productList) {
    console.error("productList element not found in DOM");
    return;
  }

  onValue(
    ref(db, "products"),
    (snap) => {
      clearElement(productList);
      const selectedCat = filterCategory ? filterCategory.value : "";
      const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];

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
        const isInWishlist = wishlist.includes(id);
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
            <button onclick="addToCart('${id}')" class="btn btn-success btn-cart">Add to Cart</button>
            <button onclick="toggleWishlist('${id}')" class="btn btn-primary wishlist-btn ${
              isInWishlist ? "wishlist-active" : ""
            }">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        `
          );
          productList.appendChild(li);
        }
      });
    },
    (error) => {
      console.error("Error fetching products:", error);
      productList.appendChild(
        createElement(
          "li",
          { className: "list-item" },
          `<div class="item-content"><p>Error loading products: ${error.message}</p></div>`
        )
      );
    }
  );
}

window.addToCart = async function (id) {
  try {
    const prodSnap = await get(ref(db, `products/${id}`));
    if (!prodSnap.exists() || prodSnap.val().stock <= 0) {
      alert("Product out of stock");
      return;
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
    updateCounters();
  } catch (error) {
    console.error("Error adding to cart:", error);
    alert("Failed to add to cart");
  }
};

window.toggleWishlist = function (id) {
  try {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    if (wishlist.includes(id)) {
      const updatedWishlist = wishlist.filter((item) => item !== id);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      alert("Removed from wishlist");
    } else {
      wishlist.push(id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      alert("Added to wishlist");
    }
    renderProducts();
    updateCounters();
  } catch (error) {
    console.error("Error toggling wishlist:", error);
    alert("Failed to update wishlist");
  }
};

if (productList) {
  renderProducts();
} else {
  console.error("productList element not found, cannot render products");
}

if (filterCategory) {
  filterCategory.addEventListener("change", renderProducts);
}
