require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');


const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "Public")));

app.use(cors());
app.use(express.json());

// MySQL-anslutning
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "fullstack"
});

db.connect(err => {
  if (err) console.error("❌ MySQL-anslutning misslyckades:", err);
  else console.log("✅ MySQL ansluten!");
});

// Startsida
app.get("/", (req, res) => {
  res.render("index", { greeting: "" });
});

app.get('/login', (req, res) => {
    res.render('login', { error: null });
  });  
  app.post('/api/login', (req, res) => {
    res.send(req.body);
  });

// Hämta alla recept (med valfri kategori-filter)
app.get("/api/recipe", (req, res) => {
  const category = req.query.category;
  const query = category
    ? "SELECT * FROM recipe WHERE kategori_id = ?"
    : "SELECT * FROM recipe";

  db.query(query, category ? [category] : [], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Hämta ett specifikt recept (detaljer)
app.get("/api/recipe/:id", (req, res) => {
  const recipeId = req.params.id;
  const sql = `
    SELECT r.*, k.namn AS kategori, ri.mängd, i.namn AS ingrediens
    FROM recipe r
    LEFT JOIN kategorier k ON r.kategori_id = k.id
    LEFT JOIN recept_ingredienser ri ON r.id = ri.recept_id
    LEFT JOIN ingredienser i ON ri.ingrediens_id = i.id
    WHERE r.id = ?
  `;
  db.query(sql, [recipeId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: "Recept ej hittat" });
    res.json(results);
  });
});

// Hämta kategorier
app.get("/api/categories", (req, res) => {
  db.query("SELECT * FROM kategorier", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Lägg till nytt recept
app.post("/api/recipe", (req, res) => {
  const { titel, beskrivning, kategori_id } = req.body;
  db.query(
    "INSERT INTO recipe (titel, beskrivning, kategori_id) VALUES (?, ?, ?)",
    [titel, beskrivning, kategori_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Recept tillagt!", id: results.insertId });
    }
  );
});

// Uppdatera recept
app.put("/api/recipe/:id", (req, res) => {
  const id = req.params.id;
  const { titel, beskrivning, kategori_id } = req.body;
  db.query(
    "UPDATE recipe SET titel = ?, beskrivning = ?, kategori_id = ? WHERE id = ?",
    [titel, beskrivning, kategori_id, id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Recept uppdaterat!" });
    }
  );
});

// Ta bort recept
app.delete("/api/recipe/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM recipe WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Recept borttaget!" });
  });
});

// Starta servern
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servern körs på http://localhost:${PORT}`));
