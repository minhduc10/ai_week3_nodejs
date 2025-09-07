import os
from dotenv import load_dotenv
import openai

# Nạp các biến môi trường từ file .env
load_dotenv()

# Lấy API key từ biến môi trường
api_key = os.getenv("OPENAI_API_KEYTST")
client = openai.OpenAI(api_key=api_key)

conversation_history = [
    {"role": "system", "content": "You are a helpful assistant"}
]

while True:
    # Nhận đầu vào từ người dùng
    user_input = input("You: ").strip()

    # Nếu người dùng gõ 'quit' thì thoát
    if user_input.lower() == 'quit':
        print("Goodbye!")
        break
    
    conversation_history.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model = "gpt-4.1-nano",
        messages = conversation_history, # type: ignore
        temperature = 0.7, 
        max_tokens = 200
    )

    reply = response.choices[0].message.content
    print("AI:", reply)

    # Nếu có câu trả lời, thêm vào lịch sử
    if reply is not None:
        conversation_history.append({"role": "assistant", "content": reply})