import os
import json
from datetime import datetime
from dotenv import load_dotenv
import openai

# Nạp các biến môi trường từ file .env
load_dotenv()

# Lấy API key từ biến môi trường
api_key = os.getenv("OPENAI_API_KEYTST")
client = openai.OpenAI(api_key=api_key)


# Hàm lưu lịch sử hội thoại vào cả file .txt và .json
def save_conversation(conversation_history, filename):
    # Save as text
    with open(f"conversations/{filename}.txt", "w", encoding="utf-8") as file:
        file.write(f"Conversation: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        for message in conversation_history:
            if message["role"] != "system":  # Không in role system
                file.write(f"{message['role'].title()}: {message['content']}\n\n")
    
    # Save as JSON
    data = {"messages": conversation_history, "timestamp": datetime.now().isoformat()}
    with open(f"conversations/{filename}.json", "w", encoding="utf-8") as file:
        json.dump(data, file, indent=2)

# Tạo thư mục "conversations" nếu chưa tồn tại
if not os.path.exists("conversations"):
    os.makedirs("conversations")

# Tạo tên file theo thời gian hiện tại để không bị trùng
filename = f"chat_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

# Start conversation
conversation_history = [
    {"role": "system", "content": "You are a helpful assistant"}
]

while True:
    user_input = input("You: ").strip()
    
    # Nếu người dùng gõ 'quit' thì thoát và lưu lịch sử
    if user_input.lower() == 'quit':
        save_conversation(conversation_history, filename)
        break
    elif not user_input:
        continue
    
    conversation_history.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=conversation_history,  # type: ignore
        temperature=0.7,
        max_tokens=200
    )

    reply = response.choices[0].message.content
    print("AI:", reply)

    # Nếu có câu trả lời, thêm vào lịch sử và lưu lại file
    if reply is not None:
        conversation_history.append({"role": "assistant", "content": reply})
        save_conversation(conversation_history, filename)