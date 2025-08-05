export function createElement(tag, attributes = {}, content = "") {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === "className") element.className = value;
    else if (key === "textContent") element.textContent = value;
    else element.setAttribute(key, value);
  });
  if (content) element.innerHTML = content;
  return element;
}


export function clearElement(element) {
  if (element) {
    element.innerHTML = "";
  } else {
    console.warn("clearElement: element doesn't exsist or it's value is null.");
  }
}
