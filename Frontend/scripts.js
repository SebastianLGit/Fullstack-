const API_URL = "http://localhost:3000/api"; // Anpassa URL efter din backend

// 🚀 Hämta och visa recept
async function fetchRecipes() {
    const response = await fetch(`${API_URL}/recipes`);
    const recipes = await response.json();
    document.getElementById("recipe-list").innerHTML = recipes.map(recipe =>
        `<div class="recipe-card">
            <h2>${recipe.titel}</h2>
            <p>${recipe.beskrivning}</p>
        </div>`
    ).join("");
}
fetchRecipes();

// 🔑 Simulerad inloggning (ersätt med riktig backend-check)
function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === "admin" && password === "password123") { 
        sessionStorage.setItem("loggedIn", "true");
        document.getElementById("adminBtn").style.display = "inline";
        document.getElementById("logoutBtn").style.display = "inline";
        showPage('admin');
    } else {
        document.getElementById("loginError").textContent = "Fel användarnamn eller lösenord!";
    }
}

// 🔒 Logga ut
function logout() {
    sessionStorage.removeItem("loggedIn");
    document.getElementById("adminBtn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "none";
    showPage('home');
}

// 🛠️ Hantera admin-recept (simulerad databas)
let recipes = [];

function addRecipe() {
    const title = document.getElementById("newRecipeTitle").value;
    if (title) {
        recipes.push({ titel: title, beskrivning: "Beskrivning saknas" });
        renderAdminRecipes();
    }
}

function renderAdminRecipes() {
    document.getElementById("admin-recipe-list").innerHTML = recipes.map((r, index) =>
        `<div class="recipe-card">
            <h2>${r.titel}</h2>
            <button onclick="deleteRecipe(${index})">❌ Ta bort</button>
        </div>`
    ).join("");
}

function deleteRecipe(index) {
    recipes.splice(index, 1);
    renderAdminRecipes();
}

// 🌍 Växla mellan sidor
function showPage(page) {
    document.getElementById("home").style.display = page === "home" ? "block" : "none";
    document.getElementById("login").style.display = page === "login" ? "block" : "none";
    document.getElementById("admin").style.display = page === "admin" && sessionStorage.getItem("loggedIn") ? "block" : "none";
}

// 🚀 Kontrollera om admin redan är inloggad
if (sessionStorage.getItem("loggedIn")) {
    document.getElementById("adminBtn").style.display = "inline";
    document.getElementById("logoutBtn").style.display = "inline";
}
