import json

data = {"year": 2025}

while True:
    # Lấy input từ người dùng và xóa khoảng trống
    user_input = input("You: ").strip()

    if user_input.lower() == "quit":
        break
 
    # mở file .json và ghi vào file
    with open("text.json", "w") as file:
        json.dump(data, file)
        
    print(user_input)