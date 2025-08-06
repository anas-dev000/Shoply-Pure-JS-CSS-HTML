import { db } from "./firebase-config.js";
import {
  ref,
  set,
  push,
  get,
  onValue,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { validateCategory, validateProduct } from "../utils/validation.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") window.location.href = "login.html";

const categoryForm = document.getElementById("categoryForm");
const categoryList = document.getElementById("categoryList");
const productCategory = document.getElementById("productCategory");
const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const ordersList = document.getElementById("ordersList");

// Categories
categoryForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("categoryName").value.trim();
  const categoryId = document.getElementById("categoryId").value;
  const error = validateCategory(name);
  if (error) return alert(error);
  try {
    if (categoryId) {
      await update(ref(db, `categories/${categoryId}`), { name });
      alert("Category updated");
    } else {
      const newRef = push(ref(db, "categories"));
      await set(newRef, { name });
      alert("Category added");
    }
    categoryForm.reset();
    document.getElementById("categoryId").value = "";
  } catch (err) {
    alert("Failed to save category");
    console.error(err);
  }
});

onValue(ref(db, "categories"), (snapshot) => {
  clearElement(categoryList);
  clearElement(productCategory);
  productCategory.appendChild(
    createElement("option", { value: "", textContent: "Select Category" })
  );
  snapshot.forEach((child) => {
    const data = child.val();
    const id = child.key;
    const li = createElement(
      "li",
      { className: "list-item" },
      `
      <div class="item-content">
        <h3>${data.name}</h3>
      </div>
      <div class="item-actions">
        <button onclick="editCategory('${id}', '${data.name}')" class="btn btn-warning">✏️ Edit</button>
        <button onclick="deleteCategory('${id}')" class="btn btn-error">❌ Delete</button>
      </div>
    `
    );
    categoryList.appendChild(li);
    const opt = createElement("option", {
      value: data.name,
      textContent: data.name,
    });
    productCategory.appendChild(opt);
  });
});

window.editCategory = function (id, name) {
  document.getElementById("categoryName").value = name;
  document.getElementById("categoryId").value = id;
};

window.deleteCategory = async function (id) {
  if (confirm("Delete this category?")) {
    try {
      await remove(ref(db, `categories/${id}`));
      alert("Category deleted");
    } catch (err) {
      alert("Failed to delete category");
      console.error(err);
    }
  }
};

// Products
productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const productId = document.getElementById("productId").value;
  const productData = {
    name: document.getElementById("productName").value.trim(),
    image: document.getElementById("productImage").value.trim(),
    category: productCategory.value,
    price: +document.getElementById("productPrice").value,
    description: document.getElementById("productDescription").value.trim(),
    stock: +document.getElementById("productStock").value,
  };
  const error = validateProduct(productData);
  if (error) return alert(error);
  try {
    if (productId) {
      await update(ref(db, `products/${productId}`), productData);
      alert("Product updated");
    } else {
      const newRef = push(ref(db, "products"));
      await set(newRef, productData);
      alert("Product added");
    }
    productForm.reset();
    document.getElementById("productId").value = "";
  } catch (err) {
    alert("Failed to save product");
    console.error(err);
  }
});

onValue(ref(db, "products"), (snapshot) => {
  clearElement(productList);
  snapshot.forEach((child) => {
    const data = child.val();
    const id = child.key;
    const li = createElement(
      "li",
      { className: "list-item" },
      `
      <img src="${data.image}" alt="${
        data.name
      }" onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'">
      <div class="item-content">
        <h3>${data.name}</h3>
        <p>${data.category} - $${data.price.toFixed(2)}</p>
        <p>Stock: ${data.stock}</p>
      </div>
      <div class="item-actions">
        <button onclick="editProduct('${id}')" class="btn btn-warning">✏️ Edit</button>
        <button onclick="deleteProduct('${id}')" class="btn btn-error">❌ Delete</button>
      </div>
    `
    );
    productList.appendChild(li);
  });
});

window.editProduct = async function (id) {
  const snapshot = await get(ref(db, `products/${id}`));
  if (snapshot.exists()) {
    const data = snapshot.val();
    document.getElementById("productName").value = data.name;
    document.getElementById("productImage").value = data.image;
    document.getElementById("productCategory").value = data.category;
    document.getElementById("productPrice").value = data.price;
    document.getElementById("productDescription").value = data.description;
    document.getElementById("productStock").value = data.stock;
    document.getElementById("productId").value = id;
  }
};

window.deleteProduct = async function (id) {
  if (confirm("Delete this product?")) {
    try {
      await remove(ref(db, `products/${id}`));
      alert("Product deleted");
    } catch (err) {
      alert("Failed to delete product");
      console.error(err);
    }
  }
};

// Orders - Load and display orders
console.log("Loading orders...");
ordersList.appendChild(
  createElement(
    "li",
    { className: "list-item" },
    `<div class="item-content"><p>Loading orders...</p></div>`
  )
);

onValue(ref(db, "orders"), async (snapshot) => {
  console.log("Orders snapshot received:", snapshot.exists());
  clearElement(ordersList);

  if (!snapshot.exists()) {
    ordersList.appendChild(
      createElement(
        "li",
        { className: "list-item" },
        `<div class="item-content">
          <p>No orders found. Orders will appear here when customers place them.</p>
        </div>`
      )
    );
    return;
  }

  const promises = [];
  snapshot.forEach((child) => {
    const order = child.val();
    const id = child.key;

    if (!order || !order.items) {
      console.log("Invalid order data:", order);
      return;
    }

    const promise = Promise.all(
      order.items.map(async (item) => {
        try {
          const prodSnap = await get(ref(db, `products/${item.id}`));
          const prod = prodSnap.exists()
            ? prodSnap.val()
            : { name: "Unknown Product" };
          return `${prod.name} x${item.qty}`;
        } catch (error) {
          console.error("Error fetching product:", error);
          return `Unknown Product x${item.qty}`;
        }
      })
    )
      .then((items) => {
        const li = createElement(
          "li",
          { className: "list-item" },
          `
        <div class="item-content">
          <h3>Order from: ${order.customer || "Unknown Customer"}</h3>
          <p><strong>Status:</strong> ${(
            order.status || "pending"
          ).toUpperCase()}</p>
          <p><strong>Items:</strong> ${items.join(" | ")}</p>
          <p><strong>Ordered at:</strong> ${new Date(
            order.timestamp || Date.now()
          ).toLocaleString()}</p>
        </div>
        <div class="item-actions">
          <button onclick="confirmOrder('${id}')" class="btn btn-success">✅ Confirm</button>
          <button onclick="rejectOrder('${id}')" class="btn btn-error">❌ Reject</button>
        </div>
      `
        );
        ordersList.appendChild(li);
      })
      .catch((error) => {
        console.error("Error processing order:", error);
        const li = createElement(
          "li",
          { className: "list-item" },
          `<div class="item-content">
          <p>Error loading order from ${
            order.customer || "Unknown Customer"
          }</p>
        </div>`
        );
        ordersList.appendChild(li);
      });

    promises.push(promise);
  });

  await Promise.all(promises);
});

window.confirmOrder = async function (id) {
  if (!confirm("Are you sure you want to confirm this order?")) return;

  try {
    await update(ref(db, `orders/${id}`), { status: "confirmed" });
    alert("Order confirmed successfully!");
    console.log("Order confirmed:", id);
  } catch (err) {
    alert("Failed to confirm order");
    console.error("Error confirming order:", err);
  }
};

window.rejectOrder = async function (id) {
  if (!confirm("Are you sure you want to reject this order?")) return;

  try {
    await update(ref(db, `orders/${id}`), { status: "rejected" });
    alert("Order rejected successfully!");
    console.log("Order rejected:", id);
  } catch (err) {
    alert("Failed to reject order");
    console.error("Error rejecting order:", err);
  }
};
