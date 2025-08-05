import { db } from "./firebase-config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "customer") location.href = "login.html";

const productDetails = document.getElementById("productDetails");
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

if (productId) {
  get(ref(db, `products/${productId}`))
    .then((snapshot) => {
      if (snapshot.exists()) {
        const prod = snapshot.val();
        clearElement(productDetails);
        productDetails.appendChild(
          createElement(
            "div",
            { className: "product-card" },
            `
        <img src="${prod.image}" alt="${prod.name
            }" onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
        <div>
          <h3>${prod.name}</h3>
          <p>Category: ${prod.category}</p>
          <p>Price: $${prod.price.toFixed(2)}</p>
          <p>Description: ${prod.description}</p>
          <p>Stock: ${prod.stock}</p>
        </div>
      `
          )
        );
        window.addToCart = async () => {
          const prodSnap = await get(ref(db, `products/${productId}`));
          if (!prodSnap.exists() || prodSnap.val().stock <= 0)
            return alert("Product out of stock");
          const cart = JSON.parse(localStorage.getItem("cart")) || [];
          const index = cart.findIndex((i) => i.id === productId);
          if (index >= 0) cart[index].qty += 1;
          else cart.push({ id: productId, qty: 1 });
          localStorage.setItem("cart", JSON.stringify(cart));
          alert("Added to cart");
        };
        window.addToWishlist = () => {
          const wish = JSON.parse(localStorage.getItem("wishlist")) || [];
          if (!wish.includes(productId)) {
            wish.push(productId);
            localStorage.setItem("wishlist", JSON.stringify(wish));
            alert("Added to wishlist");
          }
        };
      } else {
        clearElement(productDetails);
        productDetails.appendChild(
          createElement("p", { textContent: "Product not found" })
        );
      }
    })
    .catch((err) => {
      console.error(err);
      clearElement(productDetails);
      productDetails.appendChild(
        createElement("p", { textContent: "Error loading product" })
      );
    });
} else {
  clearElement(productDetails);
  productDetails.appendChild(
    createElement("p", { textContent: "No product selected" })
  );
}
