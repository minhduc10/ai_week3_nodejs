import openai
import os
from dotenv import load_dotenv

load_dotenv()  # Load biến từ file .env
api_key = os.getenv('OPENAI_API_KEYTST')
if not api_key:
    print("❌ Không tìm thấy API key trong file .env")
    print("💡 Vui lòng kiểm tra file .env có chứa: OPENAI_API_KEYTST=your-key")
    exit(1)

def llm_call(prompt, model="gpt-4.1"):
    client = openai.OpenAI(api_key=api_key)
    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": "You are a helpful assistant who outputs only structured data in JSON."},
            {"role": "user", "content": prompt}
        ]
    )
    return response.choices[0].message.content

raw_info = """
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
"""

step1_prompt = f"""Extract Shara's working hours and existing bookings from the following text. 
Output the result in JSON with two keys: "working_hours" and "bookings", each with day names as keys 
and time ranges in 24-hour format. Example time format: "13:00-17:00".

Assistant info:
{raw_info}
"""

step1_response = llm_call(step1_prompt)
print("Step 1 Output:", step1_response)


step2_prompt = f"""
Given this assistant schedule, subtract the bookings from the working hours to find available times.

Input JSON:
{step1_response}

Output format: 
Return a JSON with key "free_slots" that lists the available time ranges per day in 24-hour format.
"""

step2_response = llm_call(step2_prompt)
print("Step 2 Output:", step2_response)


step3_prompt = f"""
Given the following free time slots, return only the time ranges that are at least 2 hours long.

Input:
{step2_response}

Output format:
Same JSON structure, but only include time ranges with duration >= 2 hours.
"""

step3_response = llm_call(step3_prompt)
print("Step 3 Output:", step3_response)