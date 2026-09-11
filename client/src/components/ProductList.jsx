/* =========================================================================
 * COMPONENT: แสดงรายการสินค้าทั้งหมดในรูปแบบตาราง
 * ใช้ .map() วนสร้าง <ProductItem /> โดยต้องมี key ที่ไม่ซ้ำกัน
 * ========================================================================= */
import ProductItem from './ProductItem.jsx';

export default function ProductList({ products, onEdit, onDelete, busyId }) {
  // ---- ส่วนที่ 1: กรณีไม่มีข้อมูล แสดง empty state แทนตารางว่างๆ ----
  if (!products.length) {
    return <div className="card empty">📭 ยังไม่มีสินค้าในระบบ ลองเพิ่มรายการแรกดูสิ</div>;
  }

  // ---- ส่วนที่ 2: render ตารางสินค้า ----
  return (
    <div className="card">
      <h2>📦 รายการสินค้า ({products.length})</h2>
      <table className="table">
        <thead>
          <tr>
            <th>ID</th><th>ชื่อสินค้า</th><th>หมวดหมู่</th><th>ราคา</th><th>คงเหลือ</th><th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {/* ---- วนลูปสร้างแถว: key ช่วยให้ React re-render เฉพาะแถวที่เปลี่ยน ---- */}
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onEdit={onEdit}
              onDelete={onDelete}
              busy={busyId === product.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}