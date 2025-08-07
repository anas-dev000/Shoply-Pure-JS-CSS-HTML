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
import { validateProduct } from "../utils/validation.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") window.location.href = "login.html";

const productForm = document.getElementById("productForm");
const productList = document.getElementById("productList");
const productCategory = document.getElementById("productCategory");

if (productForm) {
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
        alert("Product updated successfully");
      } else {
        const newRef = push(ref(db, "products"));
        await set(newRef, productData);
        alert("Product added successfully");
      }
      productForm.reset();
      document.getElementById("productId").value = "";
    } catch (err) {
      alert("Failed to save product");
      console.error("Error saving product:", err);
    }
  });
}

if (productList) {
  onValue(
    ref(db, "products"),
    (snapshot) => {
      console.log("Products snapshot:", snapshot.val());
      clearElement(productList);
      if (!snapshot.exists()) {
        productList.appendChild(
          createElement(
            "li",
            { className: "list-item" },
            `<div class="item-content"><p>No products found.</p></div>`
          )
        );
        return;
      }
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
          <p>${data.description}</p>
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
    },
    (error) => {
      console.error("Error fetching products:", error);
      clearElement(productList);
      productList.appendChild(
        createElement(
          "li",
          { className: "list-item" },
          `<div class="item-content"><p>Error loading products.</p></div>`
        )
      );
    }
  );
}

if (productCategory) {
  onValue(
    ref(db, "categories"),
    (snapshot) => {
      console.log("Categories for product dropdown:", snapshot.val());
      clearElement(productCategory);
      productCategory.appendChild(
        createElement("option", { value: "", textContent: "Select Category" })
      );
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const data = child.val();
          const opt = createElement("option", {
            value: data.name,
            textContent: data.name,
          });
          productCategory.appendChild(opt);
        });
      }
    },
    (error) => {
      console.error("Error fetching categories for dropdown:", error);
    }
  );
}

window.editProduct = async function (id) {
  try {
    const snapshot = await get(ref(db, `products/${id}`));
    if (snapshot.exists()) {
      const data = snapshot.val();
      const productForm = document.getElementById("productForm");
      productForm.scrollIntoView({ behavior: "smooth" });
      document.getElementById("productName").value = data.name;
      document.getElementById("productImage").value = data.image;
      document.getElementById("productCategory").value = data.category;
      document.getElementById("productPrice").value = data.price;
      document.getElementById("productDescription").value = data.description;
      document.getElementById("productStock").value = data.stock;
      document.getElementById("productId").value = id;
    }
  } catch (err) {
    alert("Failed to load product for editing");
    console.error("Error loading product:", err);
  }
};

window.deleteProduct = async function (id) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      await remove(ref(db, `products/${id}`));
      alert("Product deleted successfully");
    } catch (err) {
      alert("Failed to delete product");
      console.error("Error deleting product:", err);
    }
  }
};
