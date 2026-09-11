/* =========================================================================
 * ENTRY POINT ของ Backend
 * ลำดับ middleware มีความสำคัญมาก: CORS → JSON parser → logger →
 * routes → notFound → errorHandler
 * ========================================================================= */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import productRoutes from './routes/product.routes.js';
import { logger } from './middleware/logger.js';
import { notFound } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

// ---- ส่วนที่ 1: โหลดค่าจากไฟล์ .env เข้าสู่ process.env ----
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

/* -------------------------------------------------------------------------
 * ส่วนที่ 2: CORS
 * เบราว์เซอร์บล็อก request ข้าม origin (5173 -> 5000) โดยค่าเริ่มต้น
 * middleware นี้ใส่ header Access-Control-Allow-Origin ให้อัตโนมัติ
 * ----------------------------------------------------------------------- */
app.use(cors({
  origin: CLIENT_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));

/* -------------------------------------------------------------------------
 * ส่วนที่ 3: Body parser
 * แปลง JSON ใน request body ให้กลายเป็น object ใน req.body
 * ต้องวางก่อน routes เสมอ มิฉะนั้น req.body จะเป็น undefined
 * ----------------------------------------------------------------------- */
app.use(express.json());

// ---- ส่วนที่ 4: Custom logger middleware (log ทุก request) ----
app.use(logger);

// ---- ส่วนที่ 5: Health check เอาไว้เช็กว่า server ยังมีชีวิตอยู่ ----
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Product API is running 🚀' });
});

// ---- ส่วนที่ 6: Mount routes ทั้งหมดไว้ใต้ prefix /products ----
app.use('/products', productRoutes);

// ---- ส่วนที่ 7: ถ้ามาถึงตรงนี้แปลว่าไม่มี route ไหนตรง -> 404 ----
app.use(notFound);

// ---- ส่วนที่ 8: ด่านสุดท้าย จับทุก error ที่ถูก next(err) ส่งเข้ามา ----
app.use(errorHandler);

// ---- ส่วนที่ 9: เริ่มฟัง request ----
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
  console.log(`✅ Allowed client origin: ${CLIENT_ORIGIN}`);
});