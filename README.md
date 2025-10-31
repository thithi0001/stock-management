# Stock Management — Quick start

Các bước ngắn gọn (bỏ qua cấu hình .env — bạn đã có sẵn):

1. Database (MySQL)
- Chạy file SQL khởi tạo:
  - Từ PowerShell/CMD:
    mysql -u <DB_USER> -p <DB_NAME> < "your_path\stock-management\sql\init.sql"
  - Hoặc vào mysql client và dùng:
    SOURCE your_path/stock-management/sql/init.sql;
  - Hoặc mở MySQL Workbench từ 8.0 trở lên:
    tạo connection mới
    chạy file init.sql

2. Backend
```bash
cd backend
npm install
npx prisma generate
npm run dev
```

3. Frontend
```bash
cd frontend
npm install
npm start
```

Ghi chú ngắn:
- Đảm bảo MySQL đang chạy trước khi import SQL và trước khi khởi chạy backend.  
- Nếu cần kiểm tra Prisma/DB: `npx prisma studio`.  
- Frontend mặc định chạy trên http://localhost:3000, backend thường trên http://localhost:5000.