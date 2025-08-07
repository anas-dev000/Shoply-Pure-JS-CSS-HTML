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
import { validateCategory } from "../utils/validation.js";
import { createElement, clearElement } from "../utils/dom.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user || user.role !== "admin") window.location.href = "login.html";

const categoryForm = document.getElementById("categoryForm");
const categoryList = document.getElementById("categoryList");

if (categoryForm) {
  categoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("categoryName").value.trim();
    const categoryId = document.getElementById("categoryId").value;
    const error = validateCategory(name);
    if (error) return alert(error);
    try {
      if (categoryId) {
        await update(ref(db, `categories/${categoryId}`), { name });
        alert("Category updated successfully");
      } else {
        const newRef = push(ref(db, "categories"));
        await set(newRef, { name });
        alert("Category added successfully");
      }
      categoryForm.reset();
      document.getElementById("categoryId").value = "";
    } catch (err) {
      alert("Failed to save category");
      console.error("Error saving category:", err);
    }
  });
}

if (categoryList) {
  onValue(
    ref(db, "categories"),
    (snapshot) => {
      console.log("Categories snapshot:", snapshot.val());
      clearElement(categoryList);
      if (!snapshot.exists()) {
        categoryList.appendChild(
          createElement(
            "li",
            { className: "list-item" },
            `<div class="item-content"><p>No categories found.</p></div>`
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
      });
    },
    (error) => {
      console.error("Error fetching categories:", error);
      clearElement(categoryList);
      categoryList.appendChild(
        createElement(
          "li",
          { className: "list-item" },
          `<div class="item-content"><p>Error loading categories.</p></div>`
        )
      );
    }
  );
}

window.editCategory = function (id, name) {
  const categoryForm = document.getElementById("categoryForm");
  categoryForm.scrollIntoView({ behavior: "smooth" });
  document.getElementById("categoryName").value = name;
  document.getElementById("categoryId").value = id;
};

window.deleteCategory = async function (id) {
  try {
    // First, get the category name
    const categorySnap = await get(ref(db, `categories/${id}`));
    if (!categorySnap.exists()) {
      alert("Category not found");
      return;
    }
    const categoryName = categorySnap.val().name;

    // Check for products in this category
    const productsSnap = await get(ref(db, "products"));
    const relatedProducts = [];

    if (productsSnap.exists()) {
      productsSnap.forEach((child) => {
        if (child.val().category === categoryName) {
          relatedProducts.push(child.key);
        }
      });
    }

    let confirmMessage = "Are you sure you want to delete this category?";
    if (relatedProducts.length > 0) {
      confirmMessage = `Warning: This category contains ${relatedProducts.length} products. Deleting this category will also delete all related products. Are you sure you want to continue?`;
    }

    if (confirm(confirmMessage)) {
      // Delete all related products first
      for (const productId of relatedProducts) {
        await remove(ref(db, `products/${productId}`));
      }

      // Then delete the category
      await remove(ref(db, `categories/${id}`));

      if (relatedProducts.length > 0) {
        alert(
          `Category and ${relatedProducts.length} related products deleted successfully`
        );
      } else {
        alert("Category deleted successfully");
      }
    }
  } catch (err) {
    alert("Failed to delete category");
    console.error("Error deleting category:", err);
  }
};
