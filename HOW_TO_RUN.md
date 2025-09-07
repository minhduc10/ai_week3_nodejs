# 🚀 HƯỚNG DẪN CHẠY CHATBOT

## Cách 1: Chạy tự động (KHUYẾN NGHỊ)

### Bước 1: Chạy file batch
```
Kích đúp vào file: setup_and_run.bat
```

File này sẽ tự động:
- ✅ Tạo file .env với API key
- ✅ Cài đặt tất cả thư viện cần thiết
- ✅ Khởi động server

### Bước 2: Mở chatbot
Sau khi server chạy, mở file `index.html` trong trình duyệt

---

## Cách 2: Chạy thủ công

### Bước 1: Tạo file .env
```bash
python create_env.py
```

### Bước 2: Cài đặt thư viện
```bash
pip install flask flask-cors python-dotenv openai
```

### Bước 3: Chạy server
```bash
python chatbot_server.py
```

### Bước 4: Mở chatbot
Mở file `index.html` trong trình duyệt

---

## 🔧 Troubleshooting

### Lỗi "Module not found"
```bash
pip install flask flask-cors python-dotenv openai
```

### Lỗi "Port already in use"
- Tắt các ứng dụng khác đang dùng port 5000
- Hoặc thay đổi port trong `chatbot_server.py`

### Kiểm tra server có chạy không
Mở: http://localhost:5000/health

---

## 📱 Test Commands

Trong Console trình duyệt (F12):
```javascript
testServer()    // Kiểm tra kết nối server
debugServer()   // Xem thông tin debug
```
