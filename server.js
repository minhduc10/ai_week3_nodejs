// MindTek AI Chatbot Server - Node.js Version
// Chuyển đổi từ Python Flask sang Express.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware setup
app.use(cors()); // Cho phép CORS cho frontend
app.use(express.json()); // Parse JSON bodies

// Conversations directory setup
const conversationsDir = path.join(process.cwd(), 'conversations');
if (!fs.existsSync(conversationsDir)) {
    fs.mkdirSync(conversationsDir, { recursive: true });
}

// Helpers
function generateConversationId() {
    const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    return `chat_${stamp}`;
}

async function saveConversation(messages, filename, latestAssistantReply) {
    const now = new Date();
    const basePath = path.join(conversationsDir, filename);
    const jsonPath = `${basePath}.json`;
    const txtPath = `${basePath}.txt`;

    // --- JSON: append-style persistence ---
    let mergedMessages = [];
    if (fs.existsSync(jsonPath)) {
        try {
            const existing = JSON.parse(await fs.promises.readFile(jsonPath, 'utf8'));
            const existingMessages = Array.isArray(existing.messages) ? existing.messages : [];
            // Append only the suffix not already stored (avoid duplicates)
            const startIdx = existingMessages.length;
            mergedMessages = existingMessages.concat(messages.slice(startIdx));
        } catch (_) {
            mergedMessages = messages;
        }
    } else {
        mergedMessages = messages;
    }

    const jsonData = { messages: mergedMessages, updated_at: now.toISOString() };
    await fs.promises.writeFile(jsonPath, JSON.stringify(jsonData, null, 2), 'utf8');

    // --- TXT: append latest turn only (append mode) ---
    if (!fs.existsSync(txtPath)) {
        const header = `Conversation started: ${now.toISOString().replace('T', ' ').slice(0, 19)}\n\n`;
        await fs.promises.writeFile(txtPath, header, 'utf8');
    }

    // Find the latest user message and append pair (user + assistant)
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (lastUser) {
        const pairText = `User: ${lastUser.content}\nAssistant: ${latestAssistantReply || ''}\n\n`;
        await fs.promises.appendFile(txtPath, pairText, 'utf8');
    }

    return { jsonPath, txtPath };
}

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

// In-memory store for per-session conversation accumulation
const conversationStore = new Map(); // Map<conversationId, messages[]>

// Chat endpoint - POST /chat
app.post('/chat', async (req, res) => {
    try {
        // Lấy dữ liệu từ frontend
        const { messages, conversationId: incomingConversationId } = req.body;
        
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                success: false,
                error: 'Messages array is required'
            });
        }
        
        const conversationId = incomingConversationId || generateConversationId();
        console.log(` Received request with ${messages.length} messages (conversationId: ${conversationId})`);
        
        // Gọi OpenAI API
        const response = await openai.chat.completions.create({
            model: 'gpt-4.1-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 200
        });
        
        const reply = response.choices[0].message.content;
        console.log(` OpenAI response: ${reply.substring(0, 50)}...`);
        
        // Accumulate full conversation in memory and persist
        const lastUser = [...messages].reverse().find(m => m.role === 'user');
        let currentLog = conversationStore.get(conversationId) || [];
        if (currentLog.length === 0) {
            // Seed with provided messages (usually contains system + first user)
            currentLog = messages.filter(m => m.role === 'system' || m.role === 'user');
        } else if (lastUser) {
            currentLog.push({ role: 'user', content: lastUser.content });
        }
        if (reply) {
            currentLog.push({ role: 'assistant', content: reply });
        }
        conversationStore.set(conversationId, currentLog);

        try {
            await saveConversation(currentLog, conversationId, reply);
        } catch (saveErr) {
            console.warn(' Could not save conversation:', saveErr.message);
        }

        res.json({
            success: true,
            message: reply,
            conversationId
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
