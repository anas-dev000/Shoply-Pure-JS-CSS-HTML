import { db } from "./firebase-config.js";
import {
  ref,
  push,
  onValue,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
const ordersList = document.getElementById("ordersList");


window.placeOrder = async function () {
  if (!user || user.role !== "customer") return;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) return alert("Cart is empty");
  const items = await Promise.all(
    cart.map(async (item) => {
      const prodSnap = await get(ref(db, `products/${item.id}`));
      const prod = prodSnap.exists()
        ? prodSnap.val()
        : { name: "Unknown Product" };
      return {
        id: item.id,
        qty: item.qty,
        name: prod.name,
        price: prod.price || 0,
      };
    })
  );
  const orderData = {
    customer: user.name,
    items,
    status: "pending",
    timestamp: Date.now(),
  };
  try {
    await push(ref(db, "orders"), orderData);
    alert("Order placed!");
    localStorage.removeItem("cart");
    cart.length = 0;
    // Update cart display if function exists
    if (typeof window.renderCart === "function") {
      window.renderCart();
    }
    // Reload page to refresh all displays
    window.location.reload();
  } catch (err) {
    alert("Failed to place order");
    console.error(err);
  }
};

onValue(ref(db, "orders"), async (snap) => {
 if (!window.location.pathname.includes("orders.html")) return;


  clearElement(ordersList);

  if (!snap.exists()) {
    ordersList.appendChild(
      createElement(
        "li",
        { className: "list-item" },
        `<div class="item-content">
          <p>No orders found. Your orders will appear here after you place them.</p>
        </div>`
      )
    );
    return;
  }

  const userOrders = [];
  snap.forEach((child) => {
    const order = child.val();
    if (order && order.customer === user.name) {
      userOrders.push({ id: child.key, ...order });
    }
  });

  if (userOrders.length === 0) {
    ordersList.appendChild(
      createElement(
        "li",
        { className: "list-item" },
        `<div class="item-content">
          <p>You haven't placed any orders yet.</p>
        </div>`
      )
    );
    return;
  }

  for (const order of userOrders) {
    try {
      const itemDetails = await Promise.all(
        order.items.map(async (item) => {
          try {
            if (item.name) {
              return `${item.name} x${item.qty}`;
            } else {
              const prodSnap = await get(ref(db, `products/${item.id}`));
              const prod = prodSnap.exists()
                ? prodSnap.val()
                : { name: "Unknown Product" };
              return `${prod.name} (x${item.qty})`;
            }
          } catch (error) {
            console.error("Error fetching product details:", error);
            return `Unknown Product x${item.qty}`;
          }
        })
      );

      const li = createElement(
        "li",
        { className: "list-item" },
        `
        <div class="item-content">
          <h3>Order #${order.id.substring(0, 8)}</h3>
          <p><strong>Ordered at:</strong> ${new Date(
            data.timestamp
          ).toLocaleString()}</p>
          <p><strong>Items:</strong> ${itemDetails.join(", ")}</p>
          <p><strong>Status:</strong> <span class="status-${order.status}">${order.status.toUpperCase()}</span></p>
        </div>
      `
      );

      ordersList.appendChild(li);
    } catch (error) {
      console.error("Error processing order:", error);
      const li = createElement(
        "li",
        { className: "list-item" },
        `<div class="item-content">
          <p>Error loading order details</p>
        </div>`
      );
      ordersList.appendChild(li);
    }
  }
});
