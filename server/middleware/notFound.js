/* =========================================================================
 * MIDDLEWARE: จับ route ที่ไม่มีอยู่จริง (404)
 * ต้องวางไว้ "หลัง" ทุก route แต่ "ก่อน" errorHandler
 * ========================================================================= */
export function notFound(req, res, next) {
  const error = new Error(`ไม่พบ endpoint: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error); // ---- โยนต่อให้ error handler จัดการรูปแบบ response ----
}