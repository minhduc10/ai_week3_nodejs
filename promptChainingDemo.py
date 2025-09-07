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
  messages=[
    {"role": "user", "content": """
        I need my assistant to go with me to a meeting for 2 hours, what time she is available?

        Here is the information of assistant:

        Shara:
        Assistant working hours:
          Monday 6am-6pm
          Tuesday 9am-12pm
          Wednesday 1pm-5pm

        Booking already schedule:
        Monday: 
          6am-10am
          10:30am-12:30pm
          12:30pm-3:15pm
          5pm-6pm

        Tuesday:
          9am-10am

        Wednesday:
          1pm-4pm

        Kevin:
        Assistant working hours:
          Friday: 12pm-5pm

        Booking already schedule:
          12pm-3pm
          3pm-4:30pm

        Only output the suitable timeslot"""}
  ]
)
print(response.choices[0].message.content)
