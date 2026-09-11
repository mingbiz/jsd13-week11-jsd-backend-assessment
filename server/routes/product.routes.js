/* =========================================================================
 * ROUTES: รวมทุก endpoint ของ /products
 * ใช้ express.Router() เพื่อแยกความรับผิดชอบออกจาก index.js
 * ========================================================================= */
import express from 'express';
import * as Product from '../models/product.model.js';

const router = express.Router();

/* -------------------------------------------------------------------------
 * Helper: ตรวจสอบความถูกต้องของข้อมูลสินค้า (validation)
 * คืนค่าเป็นข้อความ error ถ้าไม่ผ่าน, คืน null ถ้าผ่าน
 * ----------------------------------------------------------------------- */
function validateProduct(body, { partial = false } = {}) {
  // โหมด partial (PATCH) จะตรวจเฉพาะฟิลด์ที่ส่งมาเท่านั้น
  if (!partial || body.name !== undefined) {
    if (!body.name || !String(body.name).trim()) return 'name is required';
  }
  if (!partial || body.price !== undefined) {
    if (body.price === undefined || body.price === '') return 'price is required';
    if (isNaN(Number(body.price)) || Number(body.price) < 0)
      return 'price must be a non-negative number';
  }
  if (body.stock !== undefined && (isNaN(Number(body.stock)) || Number(body.stock) < 0)) {
    return 'stock must be a non-negative number';
  }
  return null;
}

/* -------------------------------------------------------------------------
 * [GET] /products — อ่านสินค้าทั้งหมด + รองรับ query string
 * ตัวอย่าง: /products?search=mouse&category=accessory&sort=price
 * ----------------------------------------------------------------------- */
router.get('/', (req, res, next) => {
  try {
    const { search, category, sort } = req.query; // <-- อ่านค่าจาก query string
    const data = Product.findAll({ search, category, sort });
    res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err); // ส่ง error ไปให้ errorHandler
  }
});

/* -------------------------------------------------------------------------
 * [GET] /products/:id — อ่านสินค้ารายตัวจาก route parameter
 * ----------------------------------------------------------------------- */
router.get('/:id', (req, res, next) => {
  try {
    const product = Product.findById(req.params.id); // <-- อ่านค่าจาก req.params
    if (!product) {
      return res.status(404).json({ success: false, message: `ไม่พบสินค้า id = ${req.params.id}` });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------------------------
 * [POST] /products — สร้างสินค้าใหม่
 * ต้องมี express.json() ทำงานก่อน ไม่งั้น req.body จะเป็น undefined
 * สำเร็จ -> ตอบ 201 Created
 * ----------------------------------------------------------------------- */
router.post('/', (req, res, next) => {
  try {
    const errorMessage = validateProduct(req.body); // <-- อ่านค่าจาก req.body
    if (errorMessage) {
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const created = Product.create(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------------------------
 * [PUT] /products/:id — แทนที่ข้อมูลทั้งก้อน (ต้องส่งฟิลด์หลักมาครบ)
 * ----------------------------------------------------------------------- */
router.put('/:id', (req, res, next) => {
  try {
    const errorMessage = validateProduct(req.body);
    if (errorMessage) {
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const updated = Product.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: `ไม่พบสินค้า id = ${req.params.id}` });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------------------------
 * [PATCH] /products/:id — แก้ไขเฉพาะบางฟิลด์
 * ----------------------------------------------------------------------- */
router.patch('/:id', (req, res, next) => {
  try {
    const errorMessage = validateProduct(req.body, { partial: true });
    if (errorMessage) {
      return res.status(400).json({ success: false, message: errorMessage });
    }
    const updated = Product.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: `ไม่พบสินค้า id = ${req.params.id}` });
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

/* -------------------------------------------------------------------------
 * [DELETE] /products/:id — ลบสินค้า
 * ----------------------------------------------------------------------- */
router.delete('/:id', (req, res, next) => {
  try {
    const deleted = Product.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `ไม่พบสินค้า id = ${req.params.id}` });
    }
    res.status(200).json({ success: true, message: 'ลบสินค้าเรียบร้อย', data: deleted });
  } catch (err) {
    next(err);
  }
});

export default router;