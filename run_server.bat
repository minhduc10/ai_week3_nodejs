@echo off
echo ================================================
echo    🤖 KHỞI ĐỘNG CHATBOT SERVER 🤖
echo ================================================

echo.
echo 📝 Kiểm tra file .env...
python create_env.py

echo.
echo 🚀 Khởi động server...
echo Server sẽ chạy tại: http://localhost:5000
echo Sau khi server chạy, mở file index.html trong trình duyệt
echo Để dừng server, nhấn Ctrl+C
echo.

python chatbot_server.py

pause
