import json

# --- Ghi dữ liệu vào file JSON ---
data = {
    "name": "Alice",
    "age": 25,
    "skills": ["Python", "Machine Learning", "Data Science"]
}

# Ghi vào file demo.json
with open("demo.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Đã ghi dữ liệu vào demo.json")

# --- Đọc dữ liệu từ file JSON ---
with open("demo.json", "r", encoding="utf-8") as f:
    loaded_data = json.load(f)

print("Dữ liệu đọc từ file:")
print(loaded_data)