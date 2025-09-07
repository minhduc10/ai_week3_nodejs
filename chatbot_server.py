
import os
from dotenv import load_dotenv
import openai

# Nạp các biến môi trường từ file .env
load_dotenv()

app = Flask(__name__)
CORS(app)  # Cho phép CORS cho frontend

# Lấy API key từ biến môi trường (sử dụng file .env của bạn)
api_key = os.getenv("OPENAI_API_KEYTST")

# Nếu không tìm thấy trong .env, in thông báo debug
if not api_key:
    print("🔍 Đang tìm kiếm API key...")
    print("📁 Đường dẫn hiện tại:", os.getcwd())
    print("📋 Các biến môi trường có sẵn:")
    for key in os.environ:
        if 'OPENAI' in key.upper():
            print(f"   - {key}: {os.environ[key][:20]}...")
    
    # Thử các tên biến khác có thể có
    api_key = (os.getenv("OPENAI_API_KEY") or 
               os.getenv("OPENAI_API_KEYTST") or 
               os.getenv("OPENAI_KEY"))
    
    if not api_key:
        print("❌ Không tìm thấy API key trong file .env")
        print("💡 Vui lòng kiểm tra file .env có chứa: OPENAI_API_KEYTST=your-key")
        exit(1)
client = openai.OpenAI(api_key=api_key)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        # Lấy dữ liệu từ frontend
        data = request.json
        messages = data.get('messages', [])
        
        print(f"📨 Received request with {len(messages)} messages")
        
        # Gọi OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )
        
        reply = response.choices[0].message.content
        print(f"✅ OpenAI response: {reply[:50]}...")
        
        return jsonify({
            'success': True,
            'message': reply
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'message': 'Chatbot server is running!',
        'api_key_configured': bool(api_key)
    })

# For Vercel deployment - export app
def handler(request):
    return app(request)

# Export app for Vercel
app = app

if __name__ == '__main__':
    print("=" * 50)
    print("    🤖 MINDTEK AI CHATBOT SERVER 🤖")
    print("=" * 50)
    
    if not api_key:
        print("❌ WARNING: OPENAI_API_KEYTST not found in environment variables!")
        print("💡 Please configure environment variables on your platform")
        exit(1)
    else:
        print("✅ API key loaded successfully!")
        print(f"🔑 API key starts with: {api_key[:15]}...")
    
    print("🚀 Starting chatbot server on http://localhost:5000")
    print("🌐 Server endpoints:")
    print("   - Health check: http://localhost:5000/health")
    print("   - Chat API: http://localhost:5000/chat")
    print("💡 Để dừng server, nhấn Ctrl+C")
    print("-" * 50)
    
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except KeyboardInterrupt:
        print("\n🛑 Server đã dừng. Tạm biệt!")
    except Exception as e:
        print(f"❌ Lỗi khi khởi động server: {e}")
        print("💡 Hãy thử chạy: pip install flask flask-cors python-dotenv openai")
