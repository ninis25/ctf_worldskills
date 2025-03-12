const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Les flags corrects pour chaque challenge
const flags = {
    1: 'FLAG{CRYPTO_EASY}',
    2: 'FLAG{IMAGE_SECRETE}',
    3: 'FLAG{HTML_SOURCE}',
    4: 'FLAG{NETWORK_MASTER}',
    5: 'FLAG{SQL_INJECTION}',
    6: 'FLAG{HIDDEN_FILE}'
};

// Route principale
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes pour les challenges
app.get('/challenge/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', `challenge${req.params.id}.html`));
});

// API pour vérifier les flags
app.post('/api/verify', (req, res) => {
    const { challengeId, flag } = req.body;
    if (flags[challengeId] && flags[challengeId].toLowerCase() === flag.toLowerCase()) {
        res.json({ success: true, message: 'Bravo! Flag correct!' });
    } else {
        res.json({ success: false, message: 'Flag incorrect, réessayez!' });
    }
});

// Servir les fichiers statiques
app.use('/files', express.static(path.join(__dirname, 'public/files')));

app.listen(port, () => {
    console.log(`CTF running at http://localhost:${port}`);
}); 