/* =========================================================================
 * ERROR-HANDLING MIDDLEWARE (ต้องมี 4 พารามิเตอร์ Express ถึงจะรู้จัก)
 * เป็นด่านสุดท้ายของ pipeline — รวมทุก error ให้ตอบกลับเป็น JSON รูปแบบเดียว
 * ========================================================================= */
export function errorHandler(err, req, res, next) {
  // ---- ส่วนที่ 1: กำหนด status code (ถ้าไม่ระบุถือว่าเป็น 500) ----
  const status = err.status || 500;

  // ---- ส่วนที่ 2: log ไว้ฝั่ง server สำหรับ debug ----
  console.error(`❌ [${status}] ${err.message}`);

  // ---- ส่วนที่ 3: ส่ง response กลับให้ client ในโครงสร้างมาตรฐาน ----
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // แสดง stack trace เฉพาะตอน development เท่านั้น
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}