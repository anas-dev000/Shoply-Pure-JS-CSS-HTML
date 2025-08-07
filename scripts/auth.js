
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

    ["nameError", "emailError", "passwordError", "roleError"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const role = document.getElementById("registerRole").value;

    const userData = { name, email, password, role };
    const errors = validateUser(userData);

    let hasError = false;

    if (errors.name) {
      document.getElementById("nameError").textContent = errors.name;
      hasError = true;
    }
    if (errors.email) {
      document.getElementById("emailError").textContent = errors.email;
      hasError = true;
    }
    if (errors.password) {
      document.getElementById("passwordError").textContent = errors.password;
      hasError = true;
    }
    if (errors.role) {
      document.getElementById("roleError").textContent = errors.role;
      hasError = true;
    }

    if (hasError) return;

    const userId = email.replace(/\./g, "_");
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        document.getElementById("emailError").textContent = "This email is already registered";
        return;
      }

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

    ["loginEmailError", "loginPasswordError"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = "";
    });

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const userData = { email, password };
    const errors = validateLogin(userData);

    let hasError = false;

    if (errors.email) {
      document.getElementById("loginEmailError").textContent = errors.email;
      hasError = true;
    }
    if (errors.password) {
      document.getElementById("loginPasswordError").textContent = errors.password;
      hasError = true;
    }

    if (hasError) return;

    const userId = email.replace(/\./g, "_");
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        document.getElementById("loginEmailError").textContent = "No account found with this email";
        return;
      }

      const userData = snapshot.val();
      if (userData.password !== password) {
        document.getElementById("loginPasswordError").textContent = "Incorrect password";
        return;
      }

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

window.logout = logout;
