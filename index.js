const express = require('express');
const app = express();
const path = require('path'); 
const bodyParser = require("body-parser");

__path = process.cwd();

const PORT = process.env.PORT || 8000;
let code = require('./bot');

require('events').EventEmitter.defaultMaxListeners = 500;

/* ---------- MIDDLEWARES ---------- */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// public folder serve
app.use(express.static(path.join(__dirname, 'fruntend')));

/* ---------- ROUTES ---------- */
app.use('/code', code);

// /pair → public/pair.html
app.get('/bot', (req, res) => {
    res.sendFile(path.join(__dirname, 'fruntend', 'pair.html'));
});

// / → public/main.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'fruntend', 'main.html'));
});

/* ---------- SERVER ---------- */
app.listen(PORT, () => {
    console.log(`
Don't Forget To Give Star ‼️

Server running on http://localhost:${PORT}
`);
});

module.exports = app;
