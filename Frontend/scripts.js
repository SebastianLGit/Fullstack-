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

// 🔑 Inloggning (Backend-autentisering)
async function login() {
    const användarnamn = document.getElementById("username").value;
    const lösenord = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ användarnamn, lösenord })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem("token", data.token);
            window.location.href = "admin.html"; // Navigera till admin-sidan efter inloggning
        } else {
            document.getElementById("loginError").textContent = data.message;
        }
    } catch (error) {
        console.error("Fel vid inloggning:", error);
    }
}

// 🔐 Kontrollera om användaren är inloggad
function checkLogin() {
    const token = localStorage.getItem("token");
    if (token) {
        document.getElementById("adminBtn").style.display = "inline";
        document.getElementById("logoutBtn").style.display = "inline";
    }
}

// 🚪 Logga ut
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html"; // Navigera till startsidan efter utloggning
}

checkLogin(); // Kontrollera vid sidladdning om användaren är inloggad

// 🌍 Växla mellan sidor (home, login, admin)
function showPage(page) {
    document.getElementById("home").style.display = page === "home" ? "block" : "none";
    document.getElementById("login").style.display = page === "login" ? "block" : "none";
    document.getElementById("admin").style.display = page === "admin" && localStorage.getItem("token") ? "block" : "none";
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

// 🚀 Hämta alla recept
fetchRecipes();
