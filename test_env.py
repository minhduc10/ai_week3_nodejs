#!/usr/bin/env python3
# Script để test file .env

import os
from dotenv import load_dotenv

print("🔍 KIỂM TRA FILE .ENV")
print("=" * 40)

# Kiểm tra file .env có tồn tại không
if os.path.exists('.env'):
    print("✅ File .env tồn tại")
    
    # Đọc nội dung file .env
    print("\n📄 Nội dung file .env:")
    with open('.env', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        for i, line in enumerate(lines, 1):
            # Ẩn API key để bảo mật
            if 'API' in line.upper() and '=' in line:
                key, value = line.split('=', 1)
                print(f"   {i}: {key.strip()}={value.strip()[:20]}...")
            else:
                print(f"   {i}: {line.strip()}")
else:
    print("❌ File .env KHÔNG tồn tại")

print("\n🔄 Load .env...")
load_dotenv()

print("\n🔑 Kiểm tra API key:")
api_key = os.getenv("OPENAI_API_KEYTST")
if api_key:
    print(f"✅ API key found: {api_key[:20]}...")
    print(f"📏 Length: {len(api_key)} characters")
else:
    print("❌ Không tìm thấy OPENAI_API_KEYTST")

# Kiểm tra tất cả biến môi trường có chứa OPENAI
print("\n📋 Tất cả biến môi trường liên quan đến OpenAI:")
openai_vars = {k: v for k, v in os.environ.items() if 'OPENAI' in k.upper()}
if openai_vars:
    for key, value in openai_vars.items():
        print(f"   - {key}: {value[:20]}...")
else:
    print("   Không có biến môi trường nào chứa 'OPENAI'")

print("\n" + "=" * 40)
print("✅ Kiểm tra hoàn tất!")
