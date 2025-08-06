import { db } from "./firebase-config.js";
import {
  ref,
  set,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { validateUser, validateLogin } from "../utils/validation.js";

function showError(msg) {
  const errorDiv = document.getElementById("errorMessage");
  if (errorDiv) {
    errorDiv.textContent = msg;
    errorDiv.classList.add("show");
  } else {
    console.error("Error div not found");
  }
}

function saveUser(userData) {
  localStorage.setItem("user", JSON.stringify(userData));
}

function redirect(role) {
  if (role === "admin") window.location.href = "admin.html";
  else if (role === "customer") window.location.href = "customer.html";
}

// Restrict username input to letters and spaces
const registerNameInput = document.getElementById("registerName");
if (registerNameInput) {
  registerNameInput.addEventListener("keypress", (e) => {
    if (!/[a-zA-Z\s]/.test(e.key)) {
      e.preventDefault();
    }
  });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) errorDiv.classList.remove("show"); // Clear previous errors
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
      if (snapshot.exists()) return showError("This email is already registered");
      await set(userRef, userData);
      saveUser(userData);
      window.location.href = "../Pages/login.html";
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
    const errorDiv = document.getElementById("errorMessage");
    if (errorDiv) errorDiv.classList.remove("show"); // Clear previous errors
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const userData = { email, password };
    const error = validateLogin(userData);
    if (error) return showError(error);
    const userId = email.replace(".", "_");
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) return showError("No account found with this email");
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
  localStorage.removeItem("cart");
  localStorage.removeItem("wishlist");
  window.location.href = "login.html";
}

// Make logout available globally
window.logout = logout;