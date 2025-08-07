import { db } from "./firebase-config.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createElement, clearElement } from "../utils/dom.js";

const orderDetailsDiv = document.getElementById("orderDetails");
const params = new URLSearchParams(window.location.search);
const orderId = params.get("id");

if (!orderId) {
  orderDetailsDiv.textContent = "No order ID provided.";
} else {
  const orderRef = ref(db, `orders/${orderId}`);

  get(orderRef)
    .then(async (snap) => {
      if (!snap.exists()) {
        orderDetailsDiv.textContent = "Order not found.";
        return;
      }

      const order = snap.val();
      let totalPrice = 0;

      const itemsList = await Promise.all(
        order.items.map(async (item) => {
          const prodSnap = await get(ref(db, `products/${item.id}`));
          const prod = prodSnap.exists()
            ? prodSnap.val()
            : { name: "Unknown", price: 0, image: "" };

          const itemTotal = prod.price * item.qty;
          totalPrice += itemTotal;

          return `
            <li class="order-item" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
              <img src="${prod.image}" alt="${prod.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 5px;">
              <div>
                <strong>${prod.name}</strong><br>
                Quantity: ${item.qty}<br>
                Total: $${itemTotal.toFixed(2)}
              </div>
            </li>
          `;
        })
      );

      orderDetailsDiv.innerHTML = ` 
        <h2>Order #${orderId.substring(0, 8)}</h2>
        <p><strong>Customer:</strong> ${order.customer}</p>
        <p><strong>Date:</strong> ${new Date(order.timestamp).toLocaleString()}</p>
        <p><strong>Status:</strong> <span class="status-${order.status}">${order.status.toUpperCase()}</span></p>
        ${order.adminMessage ? `
        <p style="color: red; font-weight: bold;">
        reason: ${order.adminMessage}
        </p>` : ""}
        <h3>Items:</h3>
        <ul style="list-style: none; padding-left: 0;">${itemsList.join("")}</ul>
        <h3 style="margin-top: 20px;">Total Order Price: $${totalPrice.toFixed(2)}</h3>
      `;
    })
    .catch((error) => {
      console.error("Error loading order details:", error);
      orderDetailsDiv.textContent = "Failed to load order details.";
    });
}
