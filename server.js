// MindTek AI Chatbot Server - Node.js Version
// Chuyển đổi từ Python Flask sang Express.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();

// Middleware setup
app.use(cors()); // Cho phép CORS cho frontend
app.use(express.json()); // Parse JSON bodies

// Lấy API key từ biến môi trường
const apiKey = process.env.OPENAI_API_KEYTST || process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

// Kiểm tra API key
if (!apiKey) {
    console.log(' Đang tìm kiếm API key...');
    console.log(' Đường dẫn hiện tại:', process.cwd());
    console.log(' Các biến môi trường có sẵn:');
    
    Object.keys(process.env).forEach(key => {
        if (key.toUpperCase().includes('OPENAI')) {
            console.log(`   - ${key}: ${process.env[key].substring(0, 20)}...`);
        }
    });
    
    console.log(' Không tìm thấy API key trong file .env');
    console.log(' Vui lòng kiểm tra file .env có chứa: OPENAI_API_KEYTST=your-key');
    process.exit(1);
}

// Khởi tạo OpenAI client
const openai = new OpenAI({
    apiKey: apiKey
});

// Chat endpoint - POST /chat
app.post('/chat', async (req, res) => {
    try {
        // Lấy dữ liệu từ frontend
        const { messages } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                error: 'Messages array is required'
            });
        }
        
        console.log(` Received request with ${messages.length} messages`);
        
        // Gọi OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: messages,
            temperature: 0.7,
            max_tokens: 200
        });
        
        const reply = response.choices[0].message.content;
        console.log(` OpenAI response: ${reply.substring(0, 50)}...`);
        
        res.json({
            success: true,
            message: reply
        });
        
    } catch (error) {
        console.error(` Error: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint - GET /health
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Chatbot server is running!',
        api_key_configured: !!apiKey,
        timestamp: new Date().toISOString()
    });
});

// Default route
app.get('/', (req, res) => {
    res.json({
        message: ' MindTek AI Chatbot Server - Node.js',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            chat: '/chat (POST)'
        }
    });
});

// Vercel export
module.exports = app;

// Local development server
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    
    console.log('='.repeat(50));
    console.log('     MINDTEK AI CHATBOT SERVER (Node.js) ');
    console.log('='.repeat(50));
    
    if (!apiKey) {
        console.log(' WARNING: OPENAI_API_KEYTST not found in environment variables!');
        console.log(' Please configure environment variables on your platform');
        process.exit(1);
    } else {
        console.log(' API key loaded successfully!');
        console.log(` API key starts with: ${apiKey.substring(0, 15)}...`);
    }
    
    console.log(` Starting chatbot server on http://localhost:${PORT}`);
    console.log(' Server endpoints:');
    console.log(`   - Health check: http://localhost:${PORT}/health`);
    console.log(`   - Chat API: http://localhost:${PORT}/chat`);
    console.log(' Để dừng server, nhấn Ctrl+C');
    console.log('-'.repeat(50));
    
    app.listen(PORT, () => {
        console.log(` Server đang chạy trên port ${PORT}`);
    });
}
