/* =========================================================================
 * API LAYER: รวมการเรียก HTTP ทั้งหมดไว้ที่เดียว
 * ทำให้ component ไม่ต้องรู้จัก URL หรือ fetch โดยตรง (แก้ง่าย/ทดสอบง่าย)
 * ========================================================================= */

// ---- ส่วนที่ 1: อ่าน base URL จาก .env (ไม่ hard-code ใน component) ----
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

/* -------------------------------------------------------------------------
 * ส่วนที่ 2: ตัวช่วยกลางสำหรับเรียก fetch
 * - ใส่ header Content-Type ให้อัตโนมัติ
 * - แปลง response เป็น JSON
 * - ถ้า status ไม่ใช่ 2xx ให้ throw error พร้อมข้อความจาก backend
 * ----------------------------------------------------------------------- */
async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `Request failed (${response.status})`);
  }
  return result;
}

/* -------------------------------------------------------------------------
 * ส่วนที่ 3: ฟังก์ชัน CRUD ที่ map ตรงกับ endpoint ฝั่ง server
 * ----------------------------------------------------------------------- */

// GET /products (+ query string เช่น ?search=...&sort=price)
export async function getProducts(params = {}) {
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined)
  ).toString();
  const result = await request(`/products${query ? `?${query}` : ''}`);
  return result.data;
}

// GET /products/:id
export async function getProductById(id) {
  const result = await request(`/products/${id}`);
  return result.data;
}

// POST /products
export async function createProduct(payload) {
  const result = await request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return result.data;
}

// PUT /products/:id
export async function updateProduct(id, payload) {
  const result = await request(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return result.data;
}

// DELETE /products/:id
export async function deleteProduct(id) {
  const result = await request(`/products/${id}`, { method: 'DELETE' });
  return result.data;
}