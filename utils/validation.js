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
//add
export function validateUser({ name, email, password, role }) {
if (!name || name.trim().length === 0) {
    return "Name is required";
  }

  if (name.trim().length < 3) {
    return "Name must be at least 3 characters long";
  }  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Valid email is required";
  if (!password || password.length < 6)
    return "Password must be at least 6 characters";
  if (!role || !["admin", "customer"].includes(role))
    return "Valid role is required";
  return "";
}
