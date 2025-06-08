const API_URL = "http://localhost:3000/api";

async function fetchRecipes() {
  try {
    const res = await fetch(`${API_URL}/recipe`);
    const recipes = await res.json();
    const list = document.getElementById("recipe-list");

    if (list) {
      list.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
          <h2>${recipe.dish}</h2>
          <p>${recipe.description}</p>
          <p><strong>Category:</strong> ${recipe.categori || "No category"}</p>
          <h3>Ingredients:</h3>
          <ul>
            ${recipe.ingredients.map(ing => `<li>${ing.name}: ${ing.amount}</li>`).join("")}
          </ul>
        </div>
      `).join("");
    }
  } catch (err) {
    console.error("Error fetching recipes:", err);
  }
}

async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (res.ok) {
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      alert("Login successful!");
      window.location.href = "/";
    } else {
      document.getElementById("loginError").textContent = data.message || "Login failed.";
      document.getElementById("username").value = username;
      document.getElementById("password").value = "";
    }
  } catch (error) {
    console.error("Login error:", error);
    document.getElementById("loginError").textContent = "Technical error during login.";
  }
}

function checkLogin() {
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const adminBtn = document.getElementById("adminBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  if (adminBtn) adminBtn.style.display = isLoggedIn ? "inline" : "none";
  if (logoutBtn) logoutBtn.style.display = isLoggedIn ? "inline" : "none";

  const header = document.querySelector("h1");
  if (header && isLoggedIn) {
    header.textContent = "Welcome back! Here are your recipes:";
  }
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/";
}

let recipes = [];

function addRecipe() {
  const title = document.getElementById("newRecipeTitle").value;
  if (title) {
    recipes.push({ title, description: "Description missing" });
    renderAdminRecipes();
  }
}

function renderAdminRecipes() {
  const list = document.getElementById("admin-recipe-list");
  if (list) {
    list.innerHTML = recipes.map((r, i) => `
      <div class="recipe-card">
        <h2>${r.title}</h2>
        <button onclick="deleteRecipe(${i})">❌ Remove</button>
      </div>
    `).join("");
  }
}

function deleteRecipe(index) {
  recipes.splice(index, 1);
  renderAdminRecipes();
}

document.addEventListener("DOMContentLoaded", () => {
  fetchRecipes();
  checkLogin();

  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      login();
    });
  }
});

const galleryImages = [
  "/images/plate1.jpg",
  "/images/plate2.jpg",
  "/images/plate3.jpg",
  "/images/plate4.jpg",
];

let currentImageIndex = 0;

function showImage(index) {
  const img = document.getElementById("gallery-image");
  if (!img) return;

  currentImageIndex = (index + galleryImages.length) % galleryImages.length;
  img.src = galleryImages[currentImageIndex];
}

function nextImage() {
  showImage(currentImageIndex + 1);
}

function prevImage() {
  showImage(currentImageIndex - 1);
}

document.addEventListener("DOMContentLoaded", () => {
  showImage(currentImageIndex);

  const nextBtn = document.getElementById("next-btn");
  const prevBtn = document.getElementById("prev-btn");

  if (nextBtn) nextBtn.addEventListener("click", nextImage);
  if (prevBtn) prevBtn.addEventListener("click", prevImage);

  setInterval(nextImage, 5000);
});

async function deleteRecipe(id) {
  if (!confirm("Are you sure you want to delete this recipe?")) return;

  try {
    const res = await fetch(`/api/recipe/${id}`, {
      method: "DELETE",
      credentials: "include"
    });
    if (res.ok) {
      alert("Recipe deleted!");
      location.reload();
    } else {
      const data = await res.json();
      alert(data.message || "Could not delete the recipe.");
    }
  } catch {
    alert("Error deleting recipe.");
  }
}

function editRecipe(id) {
  const newDish = prompt("Enter new dish name:");
  if (newDish === null) return;

  const newDescription = prompt("Enter new description:");
  if (newDescription === null) return;

  const categori_id = 1;

  fetch(`/api/recipe/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ dish: newDish, description: newDescription, categori_id })
  }).then(res => {
    if (res.ok) {
      alert("Recipe updated!");
      location.reload();
    } else {
      res.json().then(data => alert(data.message || "Could not update the recipe."));
    }
  }).catch(() => alert("Error updating recipe."));
}
