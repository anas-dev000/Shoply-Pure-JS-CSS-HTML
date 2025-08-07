import { db } from "./firebase-config.js";
import {
  ref,
  get,
  onValue,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin")
  window.location.href = "../Pages/login.html";

const orderList = document.getElementById("orderList");

if (orderList) {
  onValue(
    ref(db, "orders"),
    (snapshot) => {
      console.log("Orders snapshot:", snapshot.val());
      clearElement(orderList);
      if (!snapshot.exists()) {
        orderList.appendChild(
          createElement(
            "li",
            { className: "list-item" },
            `<div class="item-content"><p>No orders found.</p></div>`
          )
        );
        return;
      }
      snapshot.forEach((child) => {
        const data = child.val();
        const id = child.key;
      
        const total = data.items
          ? Object.values(data.items).reduce(
              (sum, item) => sum + (item.price || 0) * (item.qty || 0),
              0
            )
          : 0;
      
        const statusClass =
          data.status === "pending"
            ? "status-pending"
            : data.status === "confirmed"
            ? "status-confirmed"
            : "status-rejected";
      
        const itemsList = data.items
          ? data.items.map(
              (item) =>
                `<li>${item.name} => <strong>Quantity:</strong> ${item.qty} — <strong>Price:</strong> $${item.price}</li>`
            ).join("")
          : "<li>No items</li>";
      
        const li = createElement(
          "li",
          { className: "list-item" },
          `
          <div class="item-content">
            <h3>Order #${id.substring(0, 8)}</h3>
            <p><strong>Customer:</strong> ${data.customer || "Unknown"}</p>
            <p><strong>Ordered at:</strong> ${new Date(data.timestamp).toLocaleString()}</p>
            <p><strong>Items:</strong></p>
            <ul>${itemsList}</ul>
            <p><strong>Total:</strong> $${total.toFixed(2)}</p>
            <p><strong>Status:</strong> <span class="${statusClass}">${data.status.toUpperCase()}</span></p>
          </div>
          <div class="item-actions">
            ${
              data.status === "pending"
                ? `
                <button onclick="confirmOrder('${id}')" class="btn btn-success"> Confirm</button>
                <button onclick="rejectOrder('${id}')" class="btn btn-warning"> Reject</button>
                `
                : ""
            }
            <button onclick="deleteOrder('${id}')" class="btn btn-error"> Delete</button>
          </div>
        `
        );
      
        orderList.appendChild(li);
      });
      
    },
    (error) => {
      console.error("Error fetching orders:", error);
      clearElement(orderList);
      orderList.appendChild(
        createElement(
          "li",
          { className: "list-item" },
          `<div class="item-content"><p>Error loading orders.</p></div>`
        )
      );
    }
  );
}

window.confirmOrder = async function (id) {
  if (confirm("Are you sure you want to confirm this order?")) {
    try {
      await update(ref(db, `orders/${id}`), { status: "confirmed" });
      alert("Order confirmed successfully");
    } catch (err) {
      alert("Failed to confirm order");
      console.error("Error confirming order:", err);
    }
  }
};
window.rejectOrder = async function (id) {
  if (confirm("Are you sure you want to reject this order?")) {
    const message = prompt("Enter message to customer about the rejection:");
    if (message === null) return; 

    try {
      const orderSnap = await get(ref(db, `orders/${id}`));
      if (orderSnap.exists()) {
        const orderData = orderSnap.val();
        const items = Array.isArray(orderData.items)
          ? orderData.items
          : Object.values(orderData.items || {});

        for (const item of items) {
          const productRef = ref(db, `products/${item.id}`);
          const prodSnap = await get(productRef);
          if (prodSnap.exists()) {
            const prodData = prodSnap.val();
            const updatedStock = (prodData.stock || 0) + item.qty;
            await update(productRef, { stock: updatedStock });
          }
        }
      }

      await update(ref(db, `orders/${id}`), {
        status: "rejected",
        adminMessage: message,
      });

      alert("Order rejected and stock updated");
    } catch (err) {
      alert("Failed to reject order");
      console.error("Error rejecting order:", err);
    }
  }
};



window.deleteOrder = async function (id) {
  if (confirm("Are you sure you want to delete this order?")) {
    try {
      const orderSnap = await get(ref(db, `orders/${id}`));
      if (orderSnap.exists()) {
        const orderData = orderSnap.val();
        const items = Array.isArray(orderData.items)
          ? orderData.items
          : Object.values(orderData.items || {});

        for (const item of items) {
          const productRef = ref(db, `products/${item.id}`);
          const prodSnap = await get(productRef);
          if (prodSnap.exists()) {
            const prodData = prodSnap.val();
            const updatedStock = (prodData.stock || 0) + item.qty;
            await update(productRef, { stock: updatedStock });
          }
        }
      }

      await remove(ref(db, `orders/${id}`));
      alert("Order deleted and stock updated");
    } catch (err) {
      alert("Failed to delete order");
      console.error("Error deleting order:", err);
    }
  }
};

