/* =========================================================================
 * MODEL: จำลอง "ฐานข้อมูล" ด้วย Array ในหน่วยความจำ (in-memory storage)
 * ข้อมูลจะหายเมื่อ restart server — เป็นไปตามข้อกำหนดของ Assessment
 * ========================================================================= */

// ---- ส่วนที่ 1: ข้อมูลตั้งต้น (seed data) ----
let products = [
  { id: 1, name: 'Wireless Mouse',    price: 590,   category: 'accessory', stock: 25 },
  { id: 2, name: 'Mechanical Keyboard', price: 2490, category: 'accessory', stock: 12 },
  { id: 3, name: 'USB-C Hub 7-in-1',  price: 1290,  category: 'accessory', stock: 30 },
  { id: 4, name: '27" 4K Monitor',    price: 11900, category: 'display',   stock: 7 },
];

// ---- ส่วนที่ 2: ตัวนับ id อัตโนมัติ (auto-increment) ----
// เริ่มจากค่า id สูงสุดที่มีอยู่ เพื่อไม่ให้ id ซ้ำกัน
let nextId = products.length
  ? Math.max(...products.map((p) => p.id)) + 1
  : 1;

/* -------------------------------------------------------------------------
 * ส่วนที่ 3: READ ทั้งหมด + รองรับ query string
 * search   -> ค้นหาจากชื่อสินค้า (ไม่สนตัวพิมพ์เล็ก/ใหญ่)
 * category -> กรองตามหมวดหมู่
 * sort     -> price | -price | name
 * ----------------------------------------------------------------------- */
export function findAll({ search, category, sort } = {}) {
  let result = [...products]; // copy ก่อน เพื่อไม่ไปแก้ array ต้นฉบับ

  if (search) {
    const keyword = String(search).toLowerCase();
    result = result.filter((p) => p.name.toLowerCase().includes(keyword));
  }

  if (category) {
    result = result.filter((p) => p.category === category);
  }

  if (sort === 'price')  result.sort((a, b) => a.price - b.price);
  if (sort === '-price') result.sort((a, b) => b.price - a.price);
  if (sort === 'name')   result.sort((a, b) => a.name.localeCompare(b.name));

  return result;
}

// ---- ส่วนที่ 4: READ รายตัว (ใช้กับ route parameter /:id) ----
export function findById(id) {
  return products.find((p) => p.id === Number(id)) || null;
}

// ---- ส่วนที่ 5: CREATE — สร้างสินค้าใหม่จาก req.body ----
export function create({ name, price, category = 'general', stock = 0 }) {
  const newProduct = {
    id: nextId++,                 // ออก id ใหม่แล้วเพิ่มตัวนับ
    name: String(name).trim(),
    price: Number(price),
    category: String(category).trim(),
    stock: Number(stock),
  };
  products.push(newProduct);
  return newProduct;
}

// ---- ส่วนที่ 6: UPDATE — รวมข้อมูลเดิมกับข้อมูลใหม่ (รองรับทั้ง PUT/PATCH) ----
export function update(id, payload) {
  const index = products.findIndex((p) => p.id === Number(id));
  if (index === -1) return null;   // ไม่เจอ -> ให้ controller ตอบ 404

  const current = products[index];
  const updated = {
    ...current,
    ...payload,                    // ทับเฉพาะฟิลด์ที่ส่งมา
    id: current.id,                // ห้ามเปลี่ยน id เด็ดขาด
  };

  // แปลงชนิดข้อมูลให้ถูกต้องเสมอ (ค่าจาก JSON อาจเป็น string)
  if (payload.price !== undefined) updated.price = Number(payload.price);
  if (payload.stock !== undefined) updated.stock = Number(payload.stock);

  products[index] = updated;
  return updated;
}

// ---- ส่วนที่ 7: DELETE — ลบออกจาก array แล้วคืนตัวที่ถูกลบ ----
export function remove(id) {
  const index = products.findIndex((p) => p.id === Number(id));
  if (index === -1) return null;
  const [deleted] = products.splice(index, 1);
  return deleted;
}