import { db } from "./firebase-config.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createElement, clearElement } from "../utils/dom.js";

const cartList = document.getElementById("cartList");
let cart = JSON.parse(localStorage.getItem("cart")) || [];

window.renderCart = async function () {
  if (!cartList) {
    console.warn("#cartList doesn't exsist in the page");
    return;
  }

  clearElement(cartList);
  if (cart.length === 0) {
    cartList.appendChild(createElement("p", { textContent: "Cart is empty" }));
    return;
  }

  for (const item of cart) {
    const prodSnap = await get(ref(db, `products/${item.id}`));
    if (prodSnap.exists()) {
      const p = prodSnap.val();
      const li = createElement(
        "li",
        { className: "list-item" },
        `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}" class="cart-img">
          <div class="cart-details">
            <h4 class="cart-name">${p.name}</h4>
            <p>Price per item: $${p.price}</p>
            <p><strong>Total:</strong> $${(p.price * item.qty).toFixed(2)}</p>
          </div>
          <div class="cart-controls">
            <button onclick="updateCartQty('${item.id}', -1, this)">-</button>
            <strong>Quantity: ${item.qty}</strong>
            <button onclick="updateCartQty('${
              item.id
            }', 1, this)">+</button><br>
            Delete Item:
            <button onclick="removeFromCart('${item.id}')">🗑️</button>
            <div class="cart-msg" style="color: red; margin-top: 5px;"></div>
          </div>
        </div>
        `
      );

      cartList.appendChild(li);
    }
  }
};

window.updateCartQty = async function (id, delta, btn) {
  const index = cart.findIndex((i) => i.id === id);
  if (index >= 0) {
    if (delta > 0) {
      const prodSnap = await get(ref(db, `products/${id}`));
      if (prodSnap.exists()) {
        const prod = prodSnap.val();
        const maxStock = prod.stock || 0;

        if (cart[index].qty >= maxStock) {
          showCartMessage(btn, `Only ${maxStock} item(s) in stock!`);
          return;
        }
      } else {
        showCartMessage(btn, "Product not found!");
        return;
      }
    }

    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
};
function showCartMessage(button, message) {
  const parent = button.closest(".cart-controls");
  const msgBox = parent.querySelector(".cart-msg");
  if (msgBox) {
    msgBox.textContent = message;
    setTimeout(() => {
      msgBox.textContent = "";
    }, 3000);
  }
}

window.removeFromCart = function (id) {
  cart = cart.filter((i) => i.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
  updateCounters();
};

renderCart();
