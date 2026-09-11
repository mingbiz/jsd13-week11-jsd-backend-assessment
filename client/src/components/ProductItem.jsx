/* =========================================================================
 * COMPONENT: แสดงสินค้า 1 รายการ (1 แถวในตาราง)
 * รับข้อมูลผ่าน props และส่ง event กลับขึ้นไปที่ parent
 * ========================================================================= */
export default function ProductItem({ product, onEdit, onDelete, busy }) {
  return (
    <tr>
      {/* ---- ส่วนแสดงข้อมูลของสินค้า ---- */}
      <td>{product.id}</td>
      <td className="cell--name">{product.name}</td>
      <td>{product.category}</td>
      <td className="cell--price">{Number(product.price).toLocaleString('th-TH')} ฿</td>
      <td>{product.stock}</td>

      {/* ---- ส่วนปุ่มจัดการ: แก้ไข / ลบ ---- */}
      <td className="cell--actions">
        <button className="btn btn--small" onClick={() => onEdit(product)} disabled={busy}>
          แก้ไข
        </button>
        <button
          className="btn btn--small btn--danger"
          disabled={busy}
          onClick={() => {
            // ---- ยืนยันก่อนลบ เพื่อกันผู้ใช้กดพลาด ----
            if (window.confirm(`ต้องการลบ "${product.name}" ใช่หรือไม่?`)) {
              onDelete(product.id);
            }
          }}
        >
          ลบ
        </button>
      </td>
    </tr>
  );
}