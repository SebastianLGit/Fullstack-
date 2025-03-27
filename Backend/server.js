require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json()); // Gör så att vi kan ta emot JSON

// 📌 Koppla upp mot MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root", // Ändra om du har annat användarnamn
    password: "", // Lägg in ditt lösenord om du har ett
    database: "fullstack"
});

db.connect(err => {
    if (err) {
        console.error("❌ MySQL-anslutning misslyckades:", err);
    } else {
        console.log("✅ MySQL ansluten!");
    }
});

app.get('/', async function(req, res){
    res.send("🚀 hello world")
});

// 🚀 API: Hämta alla recept
app.get("/api/recipe", (req, res) => {
    db.query("SELECT * FROM recept", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 🛠 API: Lägg till recept
app.post("/api/recipe", (req, res) => {
    const { titel, beskrivning } = req.body;
    db.query("INSERT INTO recept (titel, beskrivning) VALUES (?, ?)", 
    [titel, beskrivning], 
    (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Recept tillagt!", id: results.insertId });
    });
});

// 🔥 Starta servern
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servern körs på http://localhost:${PORT}`));
