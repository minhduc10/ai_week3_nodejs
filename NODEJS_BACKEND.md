#  MindTek AI Chatbot - Node.js Backend

##  Chuyển đổi hoàn tất từ Python Flask sang Node.js Express

###  Files đã được tạo:

- **`server.js`** - Backend Node.js thay thế cho `chatbot_server.py`
- **`package.json`** - Dependencies và scripts Node.js  
- **`vercel.json`** - Cấu hình deployment cho Vercel
- **`run_nodejs_server.bat`** - Script chạy server Node.js

###  Cách chạy Local Development:

```bash
# 1. Cài đặt dependencies (chỉ cần chạy 1 lần)
npm install

# 2. Chạy server Node.js
node server.js
# HOẶC
npm start
# HOẶC double-click file: run_nodejs_server.bat
```

###  Deploy lên Vercel:

```bash
# 1. Cài đặt Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Cấu hình environment variables trên Vercel dashboard:
# OPENAI_API_KEYTST = your-openai-api-key
```

###  So sánh Python vs Node.js:

| Tính năng | Python Flask | Node.js Express | 
|-----------|--------------|-----------------|
| **File chính** | `chatbot_server.py` | `server.js` |
| **Chạy server** | `python chatbot_server.py` | `node server.js` |
| **Dependencies** | `requirements.txt` | `package.json` |
| **Vercel deploy** | Chậm hơn |  Nhanh hơn |
| **Performance** | Tốt |  Tốt hơn |
| **Cold start** | ~2-3 giây |  ~500ms |

###  API Endpoints (giống hệt Python version):

- **Health Check**: `GET /health` 
- **Chat API**: `POST /chat`
- **Root**: `GET /` - API info

###  Frontend tương thích:

-  `index.html` + `script.js` hoạt động bình thường
-  Auto-detect localhost vs production  
-  Không cần thay đổi frontend code

###  Lợi ích của Node.js:

1. ** Deploy nhanh hơn trên Vercel**
2. ** Ecosystem JavaScript nhất quán** 
3. ** Chi phí thấp hơn (cold start nhanh)**
4. ** Performance tốt hơn cho API calls**
5. ** npm packages phong phú**

###  Lưu ý:

- File `.env` vẫn giữ nguyên format cũ
- API response format hoàn toàn giống Python version
- Tất cả tính năng được giữ nguyên: CORS, error handling, logging

###  Test thành công:

-  Server khởi động OK
-  Health endpoint hoạt động  
-  API key được load đúng
-  CORS đã được cấu hình
-  Frontend kết nối thành công

** Backend đã sẵn sàng deploy lên Vercel!**
