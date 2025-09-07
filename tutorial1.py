import openai
import os
from dotenv import load_dotenv

# Nạp các biến môi trường từ file .env
load_dotenv()

# Lấy API key từ biến môi trường (an toàn)
api_key = os.getenv("OPENAI_API_KEYTST")
if not api_key:
    print("❌ Không tìm thấy API key trong file .env")
    print("💡 Vui lòng kiểm tra file .env có chứa: OPENAI_API_KEYTST=your-key")
    exit(1)

client = openai.OpenAI(api_key=api_key)

response = client.chat.completions.create(
    model="gpt-4.1-nano",
    messages = [
         {"role": "system", "content": "You are a grumpy assistant."},
        {"role": "user", "content": "Explain what is promt chaining?"}
    ],
    temperature=0.3,
    max_tokens=400
)

print(response.choices[0].message.content)
