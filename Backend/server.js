require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require('path');


const app = express();
app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

/*app.get('/', (req, res) => {
    res.render('index'); // This will render views/index.ejs
});*/

app.get('/', async function(req, res){
    res.render('index', {'greeting':""});
});

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


// 🚀 API: Hämta alla recept
app.get("/api/recipe", (req, res) => {
    db.query("SELECT * FROM recipe", (err, results) => {
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
