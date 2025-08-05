import { db } from "./firebase-config.js";
import {
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { validateUser } from "../utils/validation.js";
function showError(msg) {
  alert(msg);
}

function saveUser(userData) {
  localStorage.setItem("user", JSON.stringify(userData));
}

function redirect(role) {
  if (role === "admin") window.location.href = "admin.html";
  else if (role === "customer") window.location.href = "customer.html";
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const role = document.getElementById("registerRole").value;
    const userData = { name, email, password, role };
    const error = validateUser(userData);
    if (error) return showError(error);
    const userId = email.replace(".", "_");
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) return showError("User already exists");
      await set(userRef, userData);
      saveUser(userData);
      redirect(role);
    } catch (err) {
      showError("Registration failed. Please try again.");
      console.error(err);
    }
  });
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const userData = { name: "", email, password, role: "" };
    const error = validateUser(userData);
    if (
      error &&
      error !== "Name is required" &&
      error !== "Valid role is required"
    )
      return showError(error);
    const userId = email.replace(".", "_");
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) return showError("User not found");
      const userData = snapshot.val();
      if (userData.password !== password)
        return showError("Incorrect password");
      saveUser(userData);
      redirect(userData.role);
    } catch (err) {
      showError("Login failed. Please try again.");
      console.error(err);
    }
  });
}

export function logout() {
  localStorage.removeItem("user");
  // localStorage.removeItem("cart");
  // localStorage.removeItem("wishlist");
  window.location.href = "login.html";
}

window.logout = logout;
