class Chatbot {
    constructor() {
        // Kiểm tra elements có tồn tại không
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.typingIndicator = document.getElementById('typingIndicator');
        
        if (!this.chatMessages || !this.messageInput || !this.sendButton || !this.typingIndicator) {
            console.error('❌ Some required elements not found!');
            console.log('chatMessages:', this.chatMessages);
            console.log('messageInput:', this.messageInput);
            console.log('sendButton:', this.sendButton);
            console.log('typingIndicator:', this.typingIndicator);
            return;
        }
        
        console.log('✅ All elements found successfully');
        
        // Khởi tạo conversation history với system prompt
        this.conversationHistory = [
            {
                "role": "system", 
                "content": `You are a helpful assistant
        You are the MindTek AI Assistant — a friendly and helpful virtual assistant representing MindTek AI, a company that offers AI consulting and implementation services.

                            Your goal is to guide users through a structured discovery conversation to understand their industry, challenges, and contact details, and recommend appropriate services.

                            💬 Always keep responses short, helpful, and polite.
                            💬 Always reply in the same language the user speaks.
                            💬 Ask only one question at a time.

                            🔍 RECOMMENDED SERVICES:
                            - For real estate: Mention customer data extraction from documents, integration with CRM, and lead generation via 24/7 chatbots.
                            - For education: Mention email automation and AI training.
                            - For retail/customer service: Mention voice-based customer service chatbots, digital marketing, and AI training.
                            - For other industries: Mention chatbots, process automation, and digital marketing.
                            ✅ BENEFITS: Emphasize saving time, reducing costs, and improving customer satisfaction.
                            💰 PRICING: Only mention "starting from $1000 USD" if the user explicitly asks about pricing.

                            🧠 CONVERSATION FLOW:
                            1. Ask what industry the user works in.
                            2. Then ask what specific challenges or goals they have.
                            3. Based on that, recommend relevant MindTek AI services.
                            4. Ask if they would like to learn more about the solutions.
                            5. If yes, collect their name → email → phone number (one at a time).
                            6. Provide a more technical description of the solution and invite them to book a free consultation.
                            7. Finally, ask if they have any notes or questions before ending the chat.
                            ⚠️ OTHER RULES:
                            - Be friendly but concise.
                            - Do not ask multiple questions at once.
                            - Do not mention pricing unless asked.
                            - Stay on-topic and professional throughout the conversation.`
            }
        ];
        
        // Cấu hình cho deployment (Vercel hoặc local)
        const hostname = window.location.hostname;
        const port = window.location.port;
        const isLocalEnv = (
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            port === '5500'
        );
        this.apiUrl = isLocalEnv
            ? 'http://localhost:5000/chat'  // Local development (Node/Flask server)
            : '/chat';  // Production (Vercel)

        // Khởi tạo bộ nhớ cục bộ cho lịch sử hội thoại (chỉ cho 1 phiên/tab)
        this.persistKey = 'chat_history';
        
        this.init();
    }
    
    init() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
        
        // Khởi tạo phiên: nếu chưa có conversationId thì tạo mới, có rồi thì dùng lại
        try {
            this.conversationId = sessionStorage.getItem('conversation_id') || null;
        } catch (_) {
            this.conversationId = null;
        }

        // Khôi phục lịch sử của phiên hiện tại để hiển thị trên dialog
        const cached = this.loadMessagesFromStorage();
        if (Array.isArray(cached) && cached.length > 0) {
            for (const m of cached) {
                this.conversationHistory.push({ role: m.role, content: m.content });
            }
            this.renderFromHistory();
        }

        this.messageInput.focus();
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;
        
        this.addMessage(message, 'user');
        this.messageInput.value = '';
        
        // Thêm tin nhắn người dùng vào lịch sử hội thoại
        this.conversationHistory.push({"role": "user", "content": message});
        // Lưu ngay vào localStorage (tạm thời) và sẽ cập nhật sau khi có phản hồi
        this.saveMessagesToStorage();
        
        this.showTypingIndicator();
        
        try {
            const response = await this.generateResponse();
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
            
            // Thêm phản hồi của AI vào lịch sử hội thoại
            this.conversationHistory.push({"role": "assistant", "content": response});
            this.saveMessagesToStorage();
            // Đảm bảo giao diện hiển thị đầy đủ lịch sử 20 tin gần nhất
            this.renderFromHistory();
        } catch (error) {
            this.hideTypingIndicator();
            const errorMessage = "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.";
            this.addMessage(errorMessage, 'bot');
            console.error('Error:', error);
        }
    }
    
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const time = new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        messageDiv.innerHTML = `
            <div class="message-bubble">${this.escapeHtml(text)}</div>
            <div class="message-time">${time}</div>
        `;
        
        this.chatMessages.insertBefore(messageDiv, this.typingIndicator);
        this.scrollToBottom();
    }

    // Render lại UI từ conversationHistory (giữ tối đa 20 tin, bỏ system)
    renderFromHistory() {
        // Xóa các bong bóng tin nhắn hiện có (không xóa typing-indicator)
        const existing = this.chatMessages.querySelectorAll('.message');
        existing.forEach(node => node.remove());

        const recent = this.conversationHistory
            .filter(m => m.role !== 'system')
            .slice(-20);

        for (const msg of recent) {
            const sender = msg.role === 'assistant' ? 'bot' : 'user';
            this.addMessage(msg.content, sender);
        }
    }

    // Lưu tối đa 20 tin nhắn gần nhất vào localStorage
    saveMessagesToStorage() {
        try {
            const recent = this.conversationHistory
                .filter(m => m.role !== 'system')
                .slice(-20); // chỉ giữ 20 tin gần nhất
            localStorage.setItem(this.persistKey, JSON.stringify(recent));
        } catch (e) {
            console.warn('Không thể lưu lịch sử hội thoại:', e.message);
        }
    }

    // Tải lịch sử hội thoại từ localStorage
    loadMessagesFromStorage() {
        try {
            const raw = localStorage.getItem(this.persistKey);
            if (!raw) return [];
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return [];
            return parsed.slice(-20);
        } catch (_) {
            return [];
        }
    }
    
    async generateResponse() {
        console.log('🔍 Đang gửi request tới local server...');
        console.log('Conversation history:', this.conversationHistory);

        try {
            const requestBody = {
                messages: this.conversationHistory,
                conversationId: this.conversationId || null
            };
            
            console.log('Request body:', requestBody);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('✅ Server Response successful:', data);
            
            // Lưu conversationId trong bộ nhớ phiên (sessionStorage) để giữ nguyên trong phiên hiện tại
            if (data.conversationId) {
                this.conversationId = data.conversationId;
                try { sessionStorage.setItem('conversation_id', this.conversationId); } catch (_) {}
            }

            if (data.success) {
                return data.message;
            } else {
                throw new Error(data.error || 'Unknown server error');
            }
        } catch (error) {
            console.error('❌ Server Error Details:', error);
            
            // Xử lý các loại lỗi khác nhau
            let errorMessage = "Xin lỗi, có lỗi xảy ra với dịch vụ AI.";
            
            if (error.message.includes('Failed to fetch')) {
                errorMessage = "🔌 Không thể kết nối đến server. Vui lòng chạy: python chatbot_server.py";
            } else if (error.message.includes('500')) {
                errorMessage = "🚨 Lỗi server. Vui lòng kiểm tra API key trong file .env";
            }
            
            // Lưu lỗi như một tin nhắn bot để người dùng thấy trong UI
            const errorText = errorMessage + `\n\n🔧 Chi tiết lỗi: ${error.message}`;
            this.conversationHistory.push({ role: 'assistant', content: errorText });
            this.saveMessagesToStorage();
            return errorText;
        }
    }
    
    showTypingIndicator() {
        this.typingIndicator.style.display = 'flex';
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.typingIndicator.style.display = 'none';
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Method để tải API key từ localStorage
    loadApiKey() {
        return localStorage.getItem('openai_api_key') || '';
    }
    
    // Method để lưu API key vào localStorage
    setApiKey(key) {
        this.apiKey = key;
        localStorage.setItem('openai_api_key', key);
    }
    
    // Method để xóa lịch sử hội thoại
    clearConversation() {
        this.conversationHistory = [this.conversationHistory[0]]; // Giữ lại system prompt
        this.chatMessages.innerHTML = '<div id="typingIndicator" class="typing-indicator"><span></span><span></span><span></span></div>';
        this.typingIndicator = document.getElementById('typingIndicator');
    }
    
    // Method để xuất lịch sử hội thoại
    exportConversation() {
        const conversation = {
            timestamp: new Date().toISOString(),
            messages: this.conversationHistory.slice(1) // Bỏ system prompt
        };
        return JSON.stringify(conversation, null, 2);
    }
}

// Khởi tạo chatbot khi trang web được tải
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded, initializing chatbot...');
    try {
        window.chatbot = new Chatbot();
        console.log('✅ Chatbot initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing chatbot:', error);
    }
    
    // Thêm helper functions để dễ sử dụng
    window.clearChat = () => window.chatbot.clearConversation();
    window.exportChat = () => window.chatbot.exportConversation();
    window.debugServer = () => {
        console.log('🔍 Debug Server Information:');
        console.log('Server URL:', window.chatbot.apiUrl);
        console.log('Conversation History Length:', window.chatbot.conversationHistory.length);
        return 'Check console for debug info';
    };
    window.testServer = async () => {
        console.log('🧪 Testing server connection...');
        const hostname = window.location.hostname;
        const port = window.location.port;
        const isLocal = (hostname === 'localhost' || hostname === '127.0.0.1' || port === '5500');
        
        const healthUrls = isLocal 
            ? ['http://localhost:5000/health', 'http://127.0.0.1:5000/health']
            : ['/health', '/api/health'];
        
        for (const healthUrl of healthUrls) {
            try {
                console.log(`Testing: ${healthUrl}`);
                const response = await fetch(healthUrl);
                const data = await response.json();
                console.log('✅ Server test successful:', data);
                return data;
            } catch (error) {
                console.warn(`❌ Failed ${healthUrl}:`, error.message);
            }
        }
        
        return 'All health endpoints failed';
    };
    
    // Hiển thị tin nhắn chào mừng CHỈ khi chưa có tin nhắn nào trong phiên hiện tại
    setTimeout(() => {
        const hasHistory = window.chatbot.conversationHistory.some(m => m.role !== 'system');
        const hasRenderedMessages = window.chatbot.chatMessages.querySelectorAll('.message.user, .message.bot').length > 0;
        if (hasHistory || hasRenderedMessages) return;

        const hostname = window.location.hostname;
        const port = window.location.port;
        const isLocal = (hostname === 'localhost' || hostname === '127.0.0.1' || port === '5500');
        const welcomeMessage = isLocal 
            ? "Chào mừng bạn đến chatbot của công ty TST! 🤖\n\n" +
              "🔒 Chúng tôi là Đại lý lớn nhất của SKF tại Việt Nam.\n" +
              "1. Chạy: python chatbot_server.py\n" +
              "2. Cấu hình API key trong file .env\n" +
              "3. Bắt đầu trò chuyện!\n\n" +
              "Hãy bắt đầu bằng cách cho tôi biết bạn làm việc trong lĩnh vực gì? 😊"
            : "Chào mừng bạn đến với MindTek AI Assistant! 🤖\n\n" +
              "💡 Tôi đã sẵn sàng tư vấn dịch vụ AI cho doanh nghiệp của bạn!\n\n" +
              "Hãy bắt đầu bằng cách cho tôi biết bạn làm việc trong lĩnh vực gì? 😊";
        window.chatbot.addMessage(welcomeMessage, 'bot');
    }, 1000);
});
