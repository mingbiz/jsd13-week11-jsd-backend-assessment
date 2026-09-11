/* =========================================================================
 * CUSTOM MIDDLEWARE: Request Logger
 * ทำงาน "ก่อน" ทุก route — บันทึก method, url, status และเวลาที่ใช้
 * ========================================================================= */
export function logger(req, res, next) {
  const startedAt = Date.now(); // ---- จับเวลาเริ่มต้นของ request ----

  // ---- ดักจับ event 'finish' เพื่ออ่าน status code หลัง response ถูกส่งแล้ว ----
  res.on('finish', () => {
    const duration = Date.now() - startedAt;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ` +
      `→ ${res.statusCode} (${duration}ms)`
    );
  });

  next(); // ---- สำคัญมาก: ส่งต่อไปยัง middleware/route ถัดไป ----
}