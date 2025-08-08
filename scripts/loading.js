// Loading functionality
function showLoading() {
  const overlay = document.createElement("div");
  overlay.className = "loading-overlay";

  const spinner = document.createElement("div");
  spinner.className = "loading-spinner";

  overlay.appendChild(spinner);
  document.body.appendChild(overlay);

  // Remove the loading overlay after 600ms
  setTimeout(() => {
    overlay.classList.add("fade-out");
    setTimeout(() => {
      overlay.remove();
    }, 300); // Remove after fade animation
  }, 600);
}

// Add loading on page load
document.addEventListener("DOMContentLoaded", showLoading);
