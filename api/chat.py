from http.server import BaseHTTPRequestHandler
import json
import os
import openai

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
    def do_POST(self):
        try:
            # Lấy API key từ environment variables
            api_key = os.getenv("OPENAI_API_KEYTST") or os.getenv("OPENAI_API_KEY")
            
            if not api_key:
                self.send_error_response({
                    'success': False,
                    'error': 'API key not configured',
                    'debug': 'No OPENAI_API_KEYTST or OPENAI_API_KEY found'
                }, 500)
                return
            
            # Đọc request body
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            messages = data.get('messages', [])
            print(f"📨 Received request with {len(messages)} messages")
            
            # Khởi tạo OpenAI client và gọi API
            client = openai.OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=200
            )
            
            reply = response.choices[0].message.content
            print(f"✅ OpenAI response: {reply[:50]}...")
            
            self.send_success_response({
                'success': True,
                'message': reply
            })
            
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            self.send_error_response({
                'success': False,
                'error': str(e)
            }, 500)
    
    def send_success_response(self, data):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def send_error_response(self, data, status_code):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
