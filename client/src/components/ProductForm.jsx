/* =========================================================================
 * COMPONENT: ฟอร์มสำหรับ "เพิ่ม" และ "แก้ไข" สินค้า (ใช้ร่วมกัน)
 * - ถ้า prop editingProduct มีค่า -> โหมดแก้ไข
 * - ถ้าเป็น null -> โหมดเพิ่มใหม่
 * ========================================================================= */
import { useState, useEffect } from 'react';

// ---- ส่วนที่ 1: ค่าเริ่มต้นของฟอร์ม (ใช้ reset หลังบันทึก) ----
const EMPTY_FORM = { name: '', price: '', category: 'general', stock: '' };

export default function ProductForm({ onSubmit, editingProduct, onCancelEdit, submitting }) {
  // ---- ส่วนที่ 2: state เก็บค่าในฟอร์ม (controlled component) ----
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  /* -----------------------------------------------------------------------
   * ส่วนที่ 3: เมื่อ editingProduct เปลี่ยน ให้เติมข้อมูลเดิมลงในฟอร์ม
   * dependency array [editingProduct] = ทำงานใหม่เฉพาะตอนค่านี้เปลี่ยน
   * --------------------------------------------------------------------- */
  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        price: editingProduct.price,
        category: editingProduct.category,
        stock: editingProduct.stock,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setFormError('');
  }, [editingProduct]);

  // ---- ส่วนที่ 4: อัปเดต state ทุกครั้งที่ผู้ใช้พิมพ์ ----
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  /* -----------------------------------------------------------------------
   * ส่วนที่ 5: ตอน submit
   * - preventDefault() เพื่อไม่ให้เบราว์เซอร์ refresh หน้า
   * - validate ฝั่ง client ก่อนยิง API (ลด request ที่ไม่จำเป็น)
   * - ส่งข้อมูลขึ้นไปให้ App.jsx ผ่าน callback onSubmit
   * --------------------------------------------------------------------- */
  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) return setFormError('กรุณากรอกชื่อสินค้า');
    if (form.price === '' || Number(form.price) < 0) return setFormError('ราคาต้องเป็นตัวเลข ≥ 0');

    setFormError('');
    await onSubmit({
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category.trim() || 'general',
      stock: Number(form.stock || 0),
    });

    // ---- เคลียร์ฟอร์มเฉพาะตอนเพิ่มสินค้าใหม่ ----
    if (!editingProduct) setForm(EMPTY_FORM);
  }

  // ---- ส่วนที่ 6: ส่วนแสดงผล (UI) ----
  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h2>{editingProduct ? `✏️ แก้ไขสินค้า #${editingProduct.id}` : '➕ เพิ่มสินค้าใหม่'}</h2>

      <div className="form__row">
        <label>ชื่อสินค้า
          <input name="name" value={form.name} onChange={handleChange} placeholder="เช่น Wireless Mouse" />
        </label>
        <label>ราคา (บาท)
          <input name="price" type="number" min="0" value={form.price} onChange={handleChange} placeholder="0" />
        </label>
      </div>

      <div className="form__row">
        <label>หมวดหมู่
          <input name="category" value={form.category} onChange={handleChange} placeholder="accessory" />
        </label>
        <label>จำนวนคงเหลือ
          <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
        </label>
      </div>

      {/* ---- แสดง error ของฟอร์ม (ถ้ามี) ---- */}
      {formError && <p className="form__error">⚠️ {formError}</p>}

      <div className="form__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? 'กำลังบันทึก...' : editingProduct ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
        </button>
        {/* ---- ปุ่มยกเลิกจะโผล่เฉพาะโหมดแก้ไข ---- */}
        {editingProduct && (
          <button type="button" className="btn btn--ghost" onClick={onCancelEdit}>ยกเลิก</button>
        )}
      </div>
    </form>
  );
}