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
        <img src="${p.image}" alt="${p.name}">
        <div>
          ${p.name} x${item.qty} - $${(p.price * item.qty).toFixed(2)}
        </div>
        <div>
          <button onclick="updateCartQty('${item.id}', -1)">-</button>
          <button onclick="updateCartQty('${item.id}', 1)">+</button>
          <button onclick="removeFromCart('${item.id}')">X</button>
        </div>
      `
      );
      cartList.appendChild(li);
    }
  }
};

window.updateCartQty = function (id, delta) {
  const index = cart.findIndex((i) => i.id === id);
  if (index >= 0) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart();
  }
};

window.removeFromCart = function (id) {
  cart = cart.filter((i) => i.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCart();
};

renderCart();
