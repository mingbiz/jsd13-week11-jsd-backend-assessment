/* =========================================================================
 * MAIN COMPONENT: ศูนย์กลางของ state ทั้งหมด (single source of truth)
 * รับผิดชอบ: โหลดข้อมูล, เพิ่ม, แก้ไข, ลบ และ sync กับ API
 * ========================================================================= */
import { useState, useEffect, useCallback } from 'react';
import * as api from './api/productApi.js';
import ProductForm from './components/ProductForm.jsx';
import ProductList from './components/ProductList.jsx';
import StatusBanner from './components/StatusBar.jsx';

export default function App() {
  /* -----------------------------------------------------------------------
   * ส่วนที่ 1: ประกาศ state ทั้งหมด
   * products  = ข้อมูลที่ได้จาก API
   * loading   = กำลังดึงข้อมูลอยู่หรือไม่
   * error     = ข้อความ error ล่าสุด
   * editing   = สินค้าที่กำลังแก้ไข (null = โหมดเพิ่ม)
   * --------------------------------------------------------------------- */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');

  /* -----------------------------------------------------------------------
   * ส่วนที่ 2: ฟังก์ชันโหลดข้อมูลจาก API
   * useCallback ป้องกันการสร้างฟังก์ชันใหม่ทุก render (กัน useEffect ลูปไม่รู้จบ)
   * --------------------------------------------------------------------- */
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);       // เปิดสถานะ loading
      setError('');           // ล้าง error เดิม
      const data = await api.getProducts({ search, sort });
      setProducts(data);      // setState -> React re-render อัตโนมัติ
    } catch (err) {
      setError(err.message);  // จับ error จาก network/server มาแสดงผล
    } finally {
      setLoading(false);      // ปิด loading ไม่ว่าจะสำเร็จหรือล้มเหลว
    }
  }, [search, sort]);

  /* -----------------------------------------------------------------------
   * ส่วนที่ 3: useEffect — ดึงข้อมูลครั้งแรกตอน component mount
   * และดึงซ้ำเมื่อ search/sort เปลี่ยน (ผ่าน dependency ของ loadProducts)
   * ใช้ setTimeout ทำ debounce กันการยิง API ถี่เกินไปตอนพิมพ์ค้นหา
   * --------------------------------------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer); // cleanup: ยกเลิก timer ตัวเก่า
  }, [loadProducts]);

  // ---- ส่วนที่ 4: ตัวช่วยแสดงข้อความสำเร็จแล้วซ่อนอัตโนมัติใน 2.5 วินาที ----
  function flash(text) {
    setMessage(text);
    setTimeout(() => setMessage(''), 2500);
  }

  /* -----------------------------------------------------------------------
   * ส่วนที่ 5: CREATE หรือ UPDATE (ใช้ฟอร์มเดียวกัน)
   * หลังสำเร็จจะอัปเดต state ในหน่วยความจำทันที = UI เปลี่ยนเร็ว
   * --------------------------------------------------------------------- */
  async function handleSubmit(payload) {
    try {
      setSubmitting(true);
      setError('');

      if (editing) {
        // ---- โหมดแก้ไข: เรียก PUT แล้วแทนที่รายการเดิมใน array ----
        const updated = await api.updateProduct(editing.id, payload);
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        setEditing(null);
        flash('แก้ไขสินค้าเรียบร้อยแล้ว');
      } else {
        // ---- โหมดเพิ่ม: เรียก POST แล้วต่อท้าย array ----
        const created = await api.createProduct(payload);
        setProducts((prev) => [...prev, created]);
        flash('เพิ่มสินค้าเรียบร้อยแล้ว');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  /* -----------------------------------------------------------------------
   * ส่วนที่ 6: DELETE — ลบที่ server ก่อน แล้วค่อยเอาออกจาก state
   * --------------------------------------------------------------------- */
  async function handleDelete(id) {
    try {
      setBusyId(id);
      setError('');
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editing?.id === id) setEditing(null); // ถ้ากำลังแก้ไขตัวที่ลบ ให้ออกจากโหมดแก้ไข
      flash('ลบสินค้าเรียบร้อยแล้ว');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  // ---- ส่วนที่ 7: เข้าสู่โหมดแก้ไข + เลื่อนหน้าจอขึ้นไปที่ฟอร์ม ----
  function handleEdit(product) {
    setEditing(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---- ส่วนที่ 8: ส่วนแสดงผลหลัก ----
  return (
    <div className="container">
      <header className="header">
        <h1>🛒 Product Manager</h1>
        <p>Fullstack CRUD — React (Vite) + Express.js</p>
      </header>

      {/* ---- แถบแสดงสถานะ loading / error / success ---- */}
      <StatusBanner loading={loading} error={error} message={message} />

      {/* ---- ฟอร์มเพิ่ม/แก้ไขสินค้า ---- */}
      <ProductForm
        onSubmit={handleSubmit}
        editingProduct={editing}
        onCancelEdit={() => setEditing(null)}
        submitting={submitting}
      />

      {/* ---- แถบค้นหาและเรียงลำดับ (ส่งเป็น query string ไปยัง backend) ---- */}
      <div className="card toolbar">
        <input
          className="toolbar__search"
          placeholder="🔍 ค้นหาชื่อสินค้า..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">เรียงตามค่าเริ่มต้น</option>
          <option value="name">ชื่อ A→Z</option>
          <option value="price">ราคาน้อย→มาก</option>
          <option value="-price">ราคามาก→น้อย</option>
        </select>
        <button className="btn btn--ghost" onClick={loadProducts}>🔄 รีเฟรช</button>
      </div>

      {/* ---- ตารางรายการสินค้า (ซ่อนตอนโหลดครั้งแรก) ---- */}
      {!loading && (
        <ProductList
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
          busyId={busyId}
        />
      )}
    </div>
  );
}