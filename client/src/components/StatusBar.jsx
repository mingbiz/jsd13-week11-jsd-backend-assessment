/* =========================================================================
 * COMPONENT: แสดงสถานะ Loading / Error / Success ให้ผู้ใช้เห็นเสมอ
 * (ข้อกำหนดใน Brief: ต้องมี loading และ error state)
 * ========================================================================= */
export default function StatusBanner({ loading, error, message }) {
  // ---- ถ้ากำลังโหลด แสดง spinner ข้อความ ----
  if (loading) return <div className="banner banner--loading">⏳ กำลังโหลดข้อมูล...</div>;

  // ---- ถ้ามี error แสดงข้อความสีแดง ----
  if (error) return <div className="banner banner--error">⚠️ {error}</div>;

  // ---- ถ้ามีข้อความแจ้งผลสำเร็จ ----
  if (message) return <div className="banner banner--success">✅ {message}</div>;

  return null; // ไม่มีสถานะอะไร -> ไม่ render อะไรเลย
}