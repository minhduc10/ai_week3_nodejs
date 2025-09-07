@echo off
echo ================================================
echo    🚀 THIẾT LẬP CHATBOT SERVER 🚀
echo ================================================

echo.
echo 📝 Bước 1: Tạo file .env...
python create_env.py

echo.
echo 📦 Bước 2: Cài đặt thư viện cần thiết...
pip install flask flask-cors python-dotenv openai

echo.
echo 🔧 Bước 3: Kiểm tra cài đặt...
python -c "import flask, flask_cors, dotenv, openai; print('✅ Tất cả thư viện đã được cài đặt!')"

echo.
echo 🚀 Bước 4: Khởi động server...
echo Server sẽ chạy tại: http://localhost:5000
echo Để dừng server, nhấn Ctrl+C
echo.
python chatbot_server.py

pause
