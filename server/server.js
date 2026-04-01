const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'users.json');

function ensureDataFile() {
    if (!fs.existsSync(DATA_FILE)) {
        fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    }
}

function readUsers() {
    ensureDataFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    try {
        return JSON.parse(raw) || [];
    } catch (error) {
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf8');
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

app.post('/api/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
    }

    const users = readUsers();
    const existingUser = users.find((user) => user.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
        return res.status(409).json({ message: 'Email sudah terdaftar.' });
    }

    users.push({ id: Date.now(), name, email: email.toLowerCase(), password });
    writeUsers(users);

    return res.status(201).json({ message: 'Akun berhasil dibuat.' });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Semua kolom wajib diisi.' });
    }

    const users = readUsers();
    const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Email atau password salah.' });
    }

    return res.json({ message: 'Login berhasil.', name: user.name });
});

app.listen(PORT, () => {
    console.log(`StudyBuddy backend berjalan di http://localhost:${PORT}`);
});
