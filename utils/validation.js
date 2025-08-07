export function validateCategory(name) {
  if (!name || name.trim().length === 0) return "Category name is required";
  if (name.length > 50) return "Category name must be less than 50 characters";
  return "";
}

export function validateProduct({
  name,
  image,
  category,
  price,
  description,
  stock,
}) {
  if (!name || name.trim().length === 0) return "Product name is required";
  if (name.length > 100) return "Product name must be less than 100 characters";
  if (!category) return "Category is required";
  if (!price || price <= 0) return "Price must be greater than 0";
  if (!description || description.trim().length === 0)
    return "Description is required";
  if (stock < 0) return "Stock cannot be negative";
  return "";
}

export function validateUser({ name, email, password, role }) {
  const errors = {};

  if (!name || name.trim().length < 3) {
    errors.name = "Full name must be at least 3 characters long";
  } else if (!/^[a-zA-Z\s]+$/.test(name)) {
    errors.name = "Full name must contain only letters and spaces";
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  if (!role || !["admin", "customer"].includes(role)) {
    errors.role = "Please select a valid role (Admin or Customer)";
  }

  return errors;
}


export function validateLogin({ email, password }) {
  const errors = {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!password || password.length < 6) {
    errors.password = "Password must be at least 6 characters long";
  }

  return errors;
}