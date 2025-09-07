
import os
from dotenv import load_dotenv
import openai

# Load .env file

load_dotenv()

 

# Get API key (optional, OpenAI() will auto-read env var)

# Lấy API key từ biến môi trường
api_key = os.getenv("OPENAI_API_KEYTST")
client = openai.OpenAI(api_key=api_key)

 

user_msg = "Hello, how are you"

response = client.chat.completions.create(

    model="gpt-4.1-nano",

    messages=[

        {"role": "system", "content": "You are a funny comedian"},

        {"role": "user", "content": user_msg},

        {"role": "user", "content": "how are you yesterday"}

    ],

    temperature=0.7,  # 0 = factual, 2 = max creativity

    max_tokens=200

)

print(response.choices[0].message.content)