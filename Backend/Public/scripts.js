const API_URL = "http://localhost:3000/api";

// Hämta recept
async function fetchRecipes() {
    try {
        const res = await fetch(`${API_URL}/recipe`);
        const recipes = await res.json();
        const list = document.getElementById("recipe-list");

        if (list) {
            list.innerHTML = recipes.map(recipe => `
                <div class="recipe-card">
                    <h2>${recipe.titel}</h2>
                    <p>${recipe.beskrivning}</p>
                </div>
            `).join("");
        }
    } catch (err) {
        console.error("Fel vid hämtning av recept:", err);
    }
}

// Inloggning
async function login() {
    const användarnamn = document.getElementById("username").value;
    const lösenord = document.getElementById("password").value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ användarnamn, lösenord })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem("token", data.token);
            alert("Inloggning lyckades!");
            window.location.href = "/"; // Navigera till startsidan
        } else {
            document.getElementById("loginError").textContent = data.message || "Inloggning misslyckades.";
        }
    } catch (error) {
        console.error("Fel vid inloggning:", error);
        document.getElementById("loginError").textContent = "Tekniskt fel vid inloggning.";
    }
}

// Kontrollera inloggning
function checkLogin() {
    const token = localStorage.getItem("token");
    const isLoggedIn = !!token;

    const adminBtn = document.getElementById("adminBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    if (adminBtn) adminBtn.style.display = isLoggedIn ? "inline" : "none";
    if (logoutBtn) logoutBtn.style.display = isLoggedIn ? "inline" : "none";

    const header = document.querySelector("h1");
    if (header && isLoggedIn) {
        header.textContent = "Välkommen tillbaka! Här är dina recept:";
    }
}

// Logga ut
function logout() {
    localStorage.removeItem("token");
    window.location.href = "/"; // Tillbaka till startsidan
}

// Lägg till recept i adminläge (lokal simulation)
let recipes = [];

function addRecipe() {
    const title = document.getElementById("newRecipeTitle").value;
    if (title) {
        recipes.push({ titel: title, beskrivning: "Beskrivning saknas" });
        renderAdminRecipes();
    }
}

function renderAdminRecipes() {
    const list = document.getElementById("admin-recipe-list");
    if (list) {
        list.innerHTML = recipes.map((r, i) => `
            <div class="recipe-card">
                <h2>${r.titel}</h2>
                <button onclick="deleteRecipe(${i})">❌ Ta bort</button>
            </div>
        `).join("");
    }
}

function deleteRecipe(index) {
    recipes.splice(index, 1);
    renderAdminRecipes();
}

// Init
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
