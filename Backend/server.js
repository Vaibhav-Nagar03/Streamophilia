// ============================================================
// STREAMOPHILIA / NEON NOCTURNE -- Backend Server
// ============================================================
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Serve the frontend files
app.use(express.static(path.join(__dirname, '..', 'Streamophilia')));

// --- Database Helpers (JSON file) ---
const DB_PATH = path.join(__dirname, 'data', 'users.json');

function readUsers() {
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeUsers(users) {
    fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2), 'utf-8');
}

// ============================================================
// API ROUTES
// ============================================================

// --- Sign Up ---
app.post('/api/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        if (username.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });
        }

        const users = readUsers();

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            return res.status(409).json({ error: 'This email is already registered.' });
        }
        // Check if username already exists
        if (users.find(u => u.username === username)) {
            return res.status(409).json({ error: 'This username is already taken.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        users.push(newUser);
        writeUsers(users);

        console.log(`New user registered: ${username} (${email})`);

        res.status(201).json({
            message: 'Account created successfully!',
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// --- Sign In ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const users = readUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        writeUsers(users);

        console.log(`User logged in: ${user.username} (${user.email})`);

        res.json({
            message: 'Login successful!',
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error. Please try again.' });
    }
});

// --- Get All Users (Admin) ---
app.get('/api/users', (req, res) => {
    const users = readUsers();
    // Don't send passwords
    const safeUsers = users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
    }));

    res.json({
        totalUsers: safeUsers.length,
        users: safeUsers
    });
});

// --- Stats ---
app.get('/api/stats', (req, res) => {
    const users = readUsers();
    res.json({
        totalUsers: users.length,
        lastSignup: users.length > 0 ? users[users.length - 1].createdAt : null
    });
});

// --- Admin Dashboard Page ---
app.get('/admin', (req, res) => {
    const users = readUsers();
    const safeUsers = users.map(u => ({
        username: u.username,
        email: u.email,
        createdAt: u.createdAt,
        lastLogin: u.lastLogin
    }));

    res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Neon Nocturne - Admin Dashboard</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Space Grotesk', sans-serif;
                background: #0e0e11;
                color: #fbf8fc;
                min-height: 100vh;
                padding: 40px;
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            .header h1 {
                font-size: 2rem;
                background: linear-gradient(135deg, #cf96ff, #ff6e84);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .header p { color: #acaaae; margin-top: 8px; }
            .stats {
                display: flex;
                gap: 20px;
                justify-content: center;
                margin-bottom: 40px;
                flex-wrap: wrap;
            }
            .stat-card {
                background: linear-gradient(135deg, rgba(207,150,255,0.1), rgba(255,110,132,0.1));
                border: 1px solid rgba(207,150,255,0.3);
                border-radius: 16px;
                padding: 24px 40px;
                text-align: center;
                min-width: 200px;
            }
            .stat-card .number {
                font-size: 3rem;
                font-weight: 700;
                background: linear-gradient(135deg, #cf96ff, #ff6e84);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .stat-card .label {
                color: #acaaae;
                font-size: 0.9rem;
                margin-top: 4px;
            }
            table {
                width: 100%;
                max-width: 900px;
                margin: 0 auto;
                border-collapse: collapse;
                background: #19191d;
                border-radius: 16px;
                overflow: hidden;
            }
            th {
                background: linear-gradient(135deg, rgba(207,150,255,0.2), rgba(255,110,132,0.2));
                padding: 16px 20px;
                text-align: left;
                font-weight: 600;
                color: #cf96ff;
                font-size: 0.85rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            td {
                padding: 14px 20px;
                border-bottom: 1px solid #25252a;
                color: #acaaae;
                font-size: 0.9rem;
            }
            tr:last-child td { border-bottom: none; }
            tr:hover td { background: rgba(207,150,255,0.05); color: #fbf8fc; }
            .username { color: #cf96ff; font-weight: 600; }
            .empty-state {
                text-align: center;
                padding: 60px;
                color: #767578;
                font-size: 1.1rem;
            }
            .refresh-btn {
                display: block;
                margin: 30px auto;
                padding: 12px 32px;
                background: linear-gradient(135deg, #cf96ff, #a533ff);
                color: #0e0e11;
                border: none;
                border-radius: 12px;
                font-family: inherit;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .refresh-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 24px rgba(207,150,255,0.3);
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>NEON NOCTURNE - Admin Dashboard</h1>
            <p>Registered Users Overview</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="number">${users.length}</div>
                <div class="label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="number">${users.length > 0 ? new Date(users[users.length - 1].createdAt).toLocaleDateString() : 'N/A'}</div>
                <div class="label">Last Signup</div>
            </div>
        </div>

        ${users.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Signed Up</th>
                    <th>Last Login</th>
                </tr>
            </thead>
            <tbody>
                ${safeUsers.map((u, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td class="username">${u.username}</td>
                    <td>${u.email}</td>
                    <td>${new Date(u.createdAt).toLocaleString()}</td>
                    <td>${new Date(u.lastLogin).toLocaleString()}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<div class="empty-state">No users yet. Go sign up on the login page!</div>'}

        <button class="refresh-btn" onclick="location.reload()">Refresh</button>
    </body>
    </html>
    `);
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
    console.log('');
    console.log('  ================================================');
    console.log('  NEON NOCTURNE - Backend Server');
    console.log('  ================================================');
    console.log(`  Frontend:  http://localhost:${PORT}/login.html`);
    console.log(`  Admin:     http://localhost:${PORT}/admin`);
    console.log(`  API:       http://localhost:${PORT}/api/users`);
    console.log('  ================================================');
    console.log('');
});
