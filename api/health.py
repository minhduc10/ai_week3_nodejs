from http.server import BaseHTTPRequestHandler
import json
import os

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
    def do_GET(self):
        api_key = os.getenv("OPENAI_API_KEYTST") or os.getenv("OPENAI_API_KEY")
        
        response_data = {
            'status': 'ok',
            'message': 'Chatbot server is running!',
            'api_key_configured': bool(api_key),
            'environment': 'vercel',
            'api_key_preview': api_key[:15] + '...' if api_key else 'None'
        }
        
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response_data).encode('utf-8'))
