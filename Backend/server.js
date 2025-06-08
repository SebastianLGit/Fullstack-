require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json());
app.use(cookieParser());

function checkLogin(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    res.locals.loggedIn = false;
    return next();
  }
  jwt.verify(token, JWT_SECRET, (error, decodedData) => {
    if (error) {
      res.locals.loggedIn = false;
      return next();
    }
    res.locals.loggedIn = true;
    res.locals.user = decodedData;
    next();
  });
}

function requireLogin(req, res, next) {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
  if (!token) return res.status(401).json({ message: "Not authorized" });

  jwt.verify(token, JWT_SECRET, (error, decodedData) => {
    if (error) return res.status(401).json({ message: "Invalid token" });
    req.user = decodedData;
    next();
  });
}

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fullstack"
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ MySQL connected!");
  }
});

app.get("/", checkLogin, (req, res) => {
  res.render("index", { greeting: "Welcome!" });
});

app.get("/login", checkLogin, (req, res) => {
  res.render("login", { error: null });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/");
});

app.get("/menu", checkLogin, (req, res) => {
  db.query("SELECT * FROM recipe", (err, recipes) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Database error");
    }
    res.render("menu", { recipes, loggedIn: res.locals.loggedIn });
  });
});

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    return res.status(400).json({ message: "Username and password are required" });
  }

  db.query("SELECT * FROM user WHERE username = ?", [username.trim()], (err, users) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    if (users.length === 0) return res.status(401).json({ message: "Incorrect username or password" });

    const user = users[0];
    bcrypt.compare(password, user.password, (err, matched) => {
      if (err) {
        console.error("Password check error:", err);
        return res.status(500).json({ message: "Error checking password" });
      }
      if (!matched) return res.status(401).json({ message: "Incorrect username or password" });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.cookie("token", token, {
        httpOnly: true,
        maxAge: 3600000,
        sameSite: "lax"
      }).json({ message: "Login successful" });
    });
  });
});

app.get("/api/recipe", checkLogin, (req, res) => {
  const sql = `
    SELECT r.id, r.dish, r.description, r.categori_id, c.name AS categori,
           ri.id AS ingredient_id, ri.amount,
           i.name AS ingredient_name
    FROM recipe r
    LEFT JOIN categories c ON r.categori_id = c.id
    LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
    LEFT JOIN ingredients i ON ri.ingredients_id = i.id
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Database error fetching recipes" });
    }

    const recipesMap = new Map();

    rows.forEach(row => {
      if (!recipesMap.has(row.id)) {
        recipesMap.set(row.id, {
          id: row.id,
          dish: row.dish,
          description: row.description,
          categori_id: row.categori_id,
          categori: row.categori,
          ingredients: []
        });
      }
      if (row.ingredient_id) {
        recipesMap.get(row.id).ingredients.push({
          id: row.ingredient_id,
          name: row.ingredient_name,
          amount: row.amount
        });
      }
    });

    res.json(Array.from(recipesMap.values()));
  });
});

app.get("/api/categories", (req, res) => {
  db.query("SELECT * FROM categories", (err, categories) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(categories);
  });
});

app.post("/api/recipe", requireLogin, (req, res) => {
  const { dish, description, categori_id } = req.body;

  if (!dish || !description || !categori_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "INSERT INTO recipe (dish, description, categori_id) VALUES (?, ?, ?)";
  db.query(sql, [dish, description, categori_id], (err, result) => {
    if (err) {
      console.error("Database error adding recipe:", err);
      return res.status(500).json({ message: "Could not add recipe" });
    }
    res.status(201).json({ message: "Recipe added", id: result.insertId });
  });
});

app.put("/api/recipe/:id", requireLogin, (req, res) => {
  const recipeId = req.params.id;
  const { dish, description, categori_id } = req.body;

  if (!dish || !description || !categori_id) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const sql = "UPDATE recipe SET dish = ?, description = ?, categori_id = ? WHERE id = ?";
  db.query(sql, [dish, description, categori_id, recipeId], (err, result) => {
    if (err) {
      console.error("Database error updating recipe:", err);
      return res.status(500).json({ message: "Could not update recipe" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json({ message: "Recipe updated" });
  });
});

app.delete("/api/recipe/:id", requireLogin, (req, res) => {
  const recipeId = req.params.id;

  db.query("DELETE FROM recipe_ingredients WHERE id = ?", [recipeId], (err) => {
    if (err) {
      console.error("Error deleting recipe ingredients:", err);
      return res.status(500).json({ message: "Could not delete recipe ingredients" });
    }

    db.query("DELETE FROM recipe WHERE id = ?", [recipeId], (err, result) => {
      if (err) {
        console.error("Error deleting recipe:", err);
        return res.status(500).json({ message: "Could not delete recipe" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json({ message: "Recipe deleted" });
    });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
