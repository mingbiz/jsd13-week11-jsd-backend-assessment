# Fullstack Product CRUD (Express + React)

แอปจัดการสินค้าแบบ CRUD เต็มรูปแบบ  
Backend = Express.js (in-memory storage) | Frontend = React + Vite

## Requirements
- Node.js 18 ขึ้นไป
- npm

## 1. ติดตั้งและรัน Backend
```bash
cd server
npm install
npm run dev        # รันที่ http://localhost:5000
```

## 2. ติดตั้งและรัน Frontend (เปิด terminal ใหม่)
```bash
cd client
npm install
npm run dev        # รันที่ http://localhost:5173
```

## 3. Environment Variables
`server/.env`
```
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```
`client/.env`
```
VITE_API_BASE_URL=http://localhost:5000
```

## API Endpoints
| Method | Route | Description |
|---|---|---|
| GET | `/products` | ดึงสินค้าทั้งหมด (รองรับ `?search=`, `?category=`, `?sort=price`) |
| GET | `/products/:id` | ดึงสินค้าตาม id |
| POST | `/products` | เพิ่มสินค้าใหม่ |
| PUT | `/products/:id` | แก้ไขสินค้าทั้งก้อน |
| PATCH | `/products/:id` | แก้ไขบางฟิลด์ |
| DELETE | `/products/:id` | ลบสินค้า |