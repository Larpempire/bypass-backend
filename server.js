const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// ===== COOKIE-URILE TALE =====
const MASTER_COOKIE = 'Authentication=SW%2BbKm%2B%2FJ3jyh3DWmRHWnnd6bjRIMG03bzZrLytGcnRXVnA0eTgrc21KWHpFaHdTaFhXMEt3YVYyRlE9; Authentication2=ony91bNfwt03QRiJ1qZai0U3dTZXL29SSnV5UXhQK3F6L1hra0RwNVNVa0JHTjFzMThCdFluK1VGQitWTnVCN2VuWTVJNmFCWmxiR25sNmVET01NaWdIZStVSld0OU9wRkE2YVlnPT0%3D';

const API_URL = 'https://immortal.st/pages//misc/2FABypassers.php';

let sessionCookie = MASTER_COOKIE;
let sessionExpiry = Date.now() + 3600000;

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
];

async function refreshSession() {
    console.log('🔄 Reîmprospătare sesiune...');
    try {
        const response = await fetch('https://immortal.st/dashboard', {
            method: 'GET',
            headers: {
                'User-Agent': userAgents[0],
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Cookie': sessionCookie
            }
        });
        const cookies = response.headers.get('set-cookie');
        if (cookies) {
            sessionCookie = cookies;
            sessionExpiry = Date.now() + 3600000;
            console.log('✅ Sesiune reîmprospătată');
        } else {
            console.log('⚠️ Sesiunea existentă');
        }
    } catch (error) {
        console.error('❌ Eroare reîmprospătare:', error.message);
    }
}

// ===== RUTA PENTRU RĂDĂCINĂ (elimină 404) =====
app.get('/', (req, res) => {
    res.send('✅ Bypass Backend is live! Use /api/bypass for requests.');
});

app.post('/api/bypass', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) {
        return res.status(400).json({ error: 'Token și parolă necesare' });
    }
    if (Date.now() > sessionExpiry) {
        await refreshSession();
    }
    const delay = Math.floor(Math.random() * 3000) + 2000;
    await new Promise(resolve => setTimeout(resolve, delay));
    const ua = userAgents[Math.floor(Math.random() * userAgents.length)];
    console.log(`📤 Bypass pentru token: ${token.substring(0, 30)}...`);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': ua,
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://immortal.st/dashboard',
                'Origin': 'https://immortal.st',
                'Cookie': sessionCookie,
                'Cache-Control': 'no-cache'
            },
            body: JSON.stringify({ token, password, type: 'Age' })
        });
        const data = await response.text();
        if (data.toLowerCase().includes('eggywall')) {
            console.log('⚠️ Eggywall detectat, retry...');
            await new Promise(resolve => setTimeout(resolve, 5000));
            const retryUA = userAgents[Math.floor(Math.random() * userAgents.length)];
            const retryResponse = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': retryUA,
                    'Accept': 'application/json',
                    'Referer': 'https://immortal.st/dashboard',
                    'Origin': 'https://immortal.st',
                    'Cookie': sessionCookie
                },
                body: JSON.stringify({ token, password, type: 'Age' })
            });
            const retryData = await retryResponse.text();
            if (retryData.toLowerCase().includes('eggywall')) {
                return res.status(403).json({ status: 'error', message: 'Eggywall detected - retry failed' });
            }
            return res.json(JSON.parse(retryData));
        }
        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch {
            res.json({ status: 'raw', data: data });
        }
    } catch (error) {
        console.error('❌ Eroare:', error.message);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        sessionActive: sessionCookie ? 'da' : 'nu',
        sessionExpiry: new Date(sessionExpiry).toISOString()
    });
});

app.get('/ping', (req, res) => {
    res.status(200).send('OK');
});

refreshSession();
setInterval(refreshSession, 25 * 60 * 1000);

app.listen(process.env.PORT || 3000, () => {
    console.log(`🚀 Server rulând pe port ${process.env.PORT || 3000}`);
    console.log(`📋 Sesiune activă: ${sessionCookie ? 'da' : 'nu'}`);
    console.log(`📌 Ping endpoint: /ping`);
});
