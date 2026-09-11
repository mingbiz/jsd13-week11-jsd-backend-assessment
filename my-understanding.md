# My Understanding
## AI Code Contribution Scale

ระดับ  ความหมาย
0  ไม่ได้ใช้ AI เลย 
1  ใช้ AI ถามแนวคิด/อธิบายเท่านั้น ไม่ได้คัดลอกโค้ด 
2  ใช้ AI ช่วยบางส่วนเล็กน้อย แล้วเขียน/แก้เองเป็นหลัก 
3  ใช้ AI ร่างโค้ดบางไฟล์ แล้วตรวจ แก้ และเข้าใจทั้งหมด 
4  AI สร้างโค้ดเป็นส่วนใหญ่ ผู้เขียนตรวจสอบและปรับแก้ 
5  AI สร้างโค้ดทั้งหมด โดยผู้เขียนเข้าใจอย่างจำกัด 

**คะแนนที่ให้ตัวเอง: 4**

เหตุผล: ใช้ AI ช่วยร่างโครงสร้างเริ่มต้นของโปรแกรม และไฟล์ที่ควรมี สร้างทีละไฟล์ ได้อ่าน ตรวจสอบ ปรับแก้ และทดสอบด้วยตนเอง 
---

## Backend

### 1. HTTP methods (GET, POST, PUT/PATCH, DELETE) หมายถึงอะไร และใช้ทำไม

HTTP method คือ "คำกริยา" ที่บอก server ว่าเราต้องการทำอะไรกับข้อมูลที่ URL นั้น

 GET = ขอข้อมูลอย่างเดียว ไม่เปลี่ยนแปลงอะไรใน server เช่น `GET /products` ดึงสินค้าทั้งหมด
 POST =  สร้างข้อมูลใหม่ ส่งข้อมูลมาใน body เช่น `POST /products` เพิ่มสินค้า
 PUT = แทนที่ข้อมูลเดิมทั้งก้อน ต้องส่งฟิลด์มาให้ครบ
 PATCH = แก้ไขเฉพาะบางฟิลด์ ส่งมาเท่าที่จะเปลี่ยน
 DELETE = ลบข้อมูลตาม id ที่ระบุ

ที่ต้องแยก method เพราะ URL เดียวกันอย่าง `/products/3` สามารถทำได้หลายอย่าง
ถ้าไม่มี method มาแยก server จะไม่รู้ว่าเราจะ "อ่าน" "แก้" หรือ "ลบ"
นอกจากนี้มันยังทำให้ API อ่านแล้วเดาพฤติกรรมได้ทันทีโดยไม่ต้องเปิดเอกสาร

### 2. `express.json()` ทำอะไร และถ้าไม่ใส่จะเกิดอะไรขึ้น

ข้อมูลที่ client ส่งมากับ POST/PUT จะเดินทางมาเป็น stream ของ text ไม่ใช่ object
`express.json()` คือ built-in middleware ที่คอยอ่าน stream นั้น ตรวจว่า header เป็น
`Content-Type: application/json` แล้วแปลงเป็น JavaScript object ใส่ไว้ใน `req.body`

ในโปรเจกต์นี้อยู่ที่ `server/index.js`:
app.use(express.json());
ถ้าไม่ใส่: `req.body` จะเป็น `undefined` ทำให้ `req.body.name` พังทันที
(`Cannot read properties of undefined`) ตอนแรกผมเจอ error นี้จริง ๆ ตอนยิง POST
แล้ว validation ตอบ 400 ทุกครั้งทั้งที่ส่งข้อมูลครบ

### 3. ความต่างของ `req.body`, `req.params`, `req.query`
body    ข้อมูลที่แนบมาใน body ของ request ใช้ส่งข้อมูลก้อนใหญ่ที่จะบันทึก 
params  ใช้ระบุ Parameter ว่า "ตัวไหน" ระบุตัวตนของ Resource เฉพาะเจาะจง
query   ใช้ปรับแต่งผลลัพธ์ (ค้นหา/กรอง/เรียง)


### 4. HTTP status code คืออะไร และ API นี้ใช้อะไรบ้าง

Status code คือตัวเลข 3 หลักที่ server ส่งกลับมาบอกผลลัพธ์ของ request
ทำให้ client รู้ว่าควรทำอะไรต่อโดยไม่ต้องอ่านข้อความ เช่น
200 OK  สำเร็จ = GET, PUT, PATCH, DELETE ที่ทำงานได้ 
201 Created สร้างข้อมูลใหม่สำเร็จ POST `/products` 
400 Bad Request ข้อมูลจาก client ไม่ถูกต้อง ไม่ส่ง `name` หรือส่ง `price` ติดลบ
404 Not Found ไม่พบสิ่งที่ขอ `GET /products/999` หรือยิง URL ที่ไม่มีอยู่
500 Internal Server Error server พังเอง error ที่ไม่คาดคิด จับโดย `errorHandler`
ความต่างสำคัญคือ 4xx = ความผิดฝั่ง client (แก้ request แล้วลองใหม่ได้)
ส่วน 5xx = ความผิดฝั่ง server (client ทำอะไรไม่ได้)

### 5. Middleware คืออะไร พร้อมตัวอย่างจากโค้ด

Middleware คือฟังก์ชันที่ทำงาน "ระหว่างทาง" ตั้งแต่ request เข้ามาจนถึง response ออกไป
รับ `(req, res, next)` และสามารถอ่าน/แก้ `req` `res` แล้วเรียก `next()` เพื่อส่งต่อ
หรือจบ request เองเลยก็ได้ เปรียบเหมือนด่านตรวจที่เรียงต่อกันเป็นสายพาน

ในโปรเจกต์ใช้ middleware 5 ตัว: `cors()`, `express.json()`, `logger`, `notFound`
และ `errorHandler` (ตัวสุดท้ายพิเศษตรงที่รับ 4 พารามิเตอร์ `(err, req, res, next)`
Express จึงรู้ว่าเป็น error handler)

### 6. ทำไมลำดับของ middleware จึงสำคัญ
เพราะ Express ทำงานจากบนลงล่างตามลำดับที่ `app.use()` ถูกเรียก
ลำดับที่ผมใช้ใน `index.js` คือ:
cors() → express.json() → logger → /products routes → notFound → errorHandler
- `express.json()` ต้องมา ก่อน routes ไม่งั้น `req.body` เป็น undefined
- `cors()` ต้องมาเกือบบนสุด ไม่งั้น response บาง case ไม่ได้แนบ CORS header
- `notFound` ต้องอยู่ หลัง ทุก route ถ้าเอาไว้บนสุดจะดัก request ทุกอันเป็น 404 หมด
- `errorHandler` ต้องอยู่ ล่างสุด เพราะมันคือปลายทางที่รับ error จาก `next(err)` ทั้งหมด

สรุปคือลำดับ = ตรรกะการทำงาน สลับที่เมื่อไหร่พฤติกรรมเปลี่ยนทันที

### 7. Walkthrough: POST /products ทีละขั้น

1. Client กดปุ่ม "เพิ่มสินค้า" → `ProductForm` เรียก `onSubmit` → `App.jsx` เรียก
   `api.createProduct(payload)` → `fetch` ยิง `POST http://localhost:5000/products`
   พร้อม header `Content-Type: application/json` และ body ที่ผ่าน `JSON.stringify()`
2. CORS middleware ตรวจว่า origin `http://localhost:5173` อยู่ใน whitelist → ผ่าน
3. `express.json()` อ่าน body ที่เป็น text แล้วแปลงเป็น object ใส่ `req.body`
4. `logger` บันทึกเวลาเริ่ม แล้วเรียก `next()`
5. Router จับคู่ `POST /` ใน `products.routes.js`
6. Validation เรียก `validateProduct(req.body)` — ถ้าไม่ผ่านตอบ 400 แล้วจบทันที
7. Model เรียก `Product.create()` → สร้าง id ใหม่จากตัวนับ `nextId++` →
   `products.push(newProduct)`
8. Response ตอบกลับ `res.status(201).json({ success: true, data: created })`
9. Client `request()` ตรวจ `response.ok` → แปลงเป็น JSON → `App.jsx` เรียก
   `setProducts(prev => [...prev, created])`
10. React เห็นว่า state เปลี่ยน จึง re-render `ProductList` → สินค้าใหม่โผล่ขึ้นตาราง
    โดยไม่ต้องรีเฟรชหน้า

### 8. CRUD คืออะไร และ map กับ method/route อย่างไร

CRUD = การกระทำพื้นฐาน 4 อย่างกับข้อมูล ย่อมาจากตัวหน้าของแต่ละคำสั่ง คือ
Create  POST  `/products`  `create()`
Read (ทั้งหมด)  GET  `/products`  `findAll()`
Read (รายตัว)  GET  `/products/:id`  `findById()`
Update  PUT / PATCH  `/products/:id`  `update()`
Delete  DELETE  `/products/:id`  `remove()`

สังเกตว่า route มีแค่ 2 แบบ (`/products` กับ `/products/:id`) แต่ทำได้ 5 อย่าง
เพราะ method เป็นตัวแยกหน้าที่ นี่คือหลักคิดของ REST API

### 9. API ตอบ error อย่างไร เช่นเมื่อขอ id ที่ไม่มีอยู่

ผมออกแบบให้ error ทุกตัวมีโครงสร้าง JSON เหมือนกัน เพื่อให้ frontend จัดการที่เดียวจบ:
json
{ "success": false, "message": "ไม่พบสินค้า id = 999" }

- id ไม่มีอยู่ → model คืน `null` → route ตอบ `404` พร้อมข้อความบอกชัดว่า id ไหน
- ข้อมูลไม่ถูกต้อง → ตอบ `400` พร้อมบอกว่าฟิลด์ไหนผิด เช่น `"price must be a non-negative number"`
- URL ไม่มีอยู่ → `notFound` สร้าง Error ที่มี `status = 404` แล้ว `next(error)`
- error ที่ไม่คาดคิด → ทุก route ครอบด้วย `try/catch` แล้ว `next(err)` ไปที่
  `errorHandler` ซึ่งตอบ `500` และแสดง stack trace เฉพาะตอน development

ฝั่ง client ตัวช่วย `request()` ใน `productApi.js` จะ `throw new Error(result.message)`
ทำให้ข้อความจาก server ถูกส่งต่อไปแสดงใน `StatusBanner` โดยตรง
---

## Frontend & Integration

### 10. CORS คืออะไร ทำไมต้องมี และถ้าไม่ใส่เบราว์เซอร์จะทำอย่างไร

CORS (Cross-Origin Resource Sharing) เป็นกลไกความปลอดภัยของเบราว์เซอร์
โดยปกติเบราว์เซอร์ใช้กฎ Same-Origin Policy คือ JavaScript จากเว็บหนึ่ง
ห้ามอ่าน response จากอีก origin หนึ่ง (origin = protocol + domain + port)

ในโปรเจกต์นี้ frontend อยู่ที่ `localhost:5173` แต่ backend อยู่ที่ `localhost:5000`
พอร์ตต่างกัน = คนละ origin เบราว์เซอร์จึงบล็อกโดยอัตโนมัติ

การใส่ `app.use(cors({ origin: CLIENT_ORIGIN }))` คือการให้ server ติด header
`Access-Control-Allow-Origin: http://localhost:5173` กลับมา เป็นการ "อนุญาต" อย่างชัดเจน

ถ้าไม่ใส่: ใน Network tab จะเห็นว่า request สำเร็จ status 200 ด้วยซ้ำ
แต่ Console ขึ้น `blocked by CORS policy` และ `fetch` จะ reject
จุดที่สับสนคือ **เบราว์เซอร์เป็นคนบล็อก ไม่ใช่ server** — ยิงด้วย Postman จะผ่านปกติ

### 11. ดึงข้อมูลอย่างไร ทำไมใช้ `useEffect` และทำไมไม่เรียกใน body ของ component
ดึงข้อมูลผ่าน `useEffect` ใน `App.jsx`:
js
const loadProducts = useCallback(async () => {
  try {
    setLoading(true);
    setError('');
    const data = await api.getProducts({ search, sort });
    setProducts(data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}, [search, sort]);

useEffect(() => {
  const timer = setTimeout(loadProducts, 300);
  return () => clearTimeout(timer);
}, [loadProducts]);


ทำไมต้อง `useEffect`: การ fetch เป็น *side effect* คืองานที่อยู่นอกโลกของการคำนวณ UI
React ออกแบบให้ function component ทำหน้าที่ "รับ state แล้วคืน JSX" เท่านั้น
`useEffect` คือที่ทางที่ถูกต้องสำหรับงานแบบนี้ โดยทำงาน หลัง render เสร็จแล้ว

ทำไมห้ามเรียกใน body: ถ้าเขียน `api.getProducts()` ตรง ๆ ใน body มันจะยิงทุกครั้งที่ render
พอได้ข้อมูลมาก็ `setProducts` → state เปลี่ยน → re-render → ยิงใหม่อีก
กลายเป็น **infinite loop** ที่ถล่ม server ตัวเอง

dependency array คือตัวควบคุมว่าจะรันเมื่อไหร่: `[]` = ครั้งเดียวตอน mount,
`[loadProducts]` = รันใหม่เมื่อ `search`/`sort` เปลี่ยน
ส่วน `return () => clearTimeout(timer)` คือ cleanup ทำ debounce ไม่ให้ยิง API ทุกตัวอักษรที่พิมพ์

### 12. API base URL เก็บไว้ที่ไหน และทำไม

เก็บไว้ใน `client/.env`:
VITE_API_BASE_URL=http://localhost:5000
แล้วอ่านที่ `client/src/api/productApi.js`:
js
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

เหตุผล:
1. เปลี่ยนที่เดียวจบ — ตอน deploy ขึ้น production แค่แก้ `.env` ไม่ต้องไล่แก้ทุก component
2. แยก config ออกจาก code ตามหลัก 12-Factor App โค้ดชุดเดียวใช้ได้ทุก environment
3. ไม่ hard-code ซ้ำ ๆ ถ้ากระจาย URL ไว้ใน 5 component แล้วลืมแก้ไปอันเดียวคือบั๊กเงียบ

ข้อสังเกต: Vite บังคับให้ตัวแปรขึ้นต้นด้วย `VITE_` เท่านั้นถึงจะเข้าถึงได้จากฝั่ง client
เพื่อป้องกันการเผลอเอา secret ไปฝังใน bundle โดยไม่ตั้งใจ
และเพราะค่านี้ถูกฝังลงไฟล์ build จริง จึงห้ามใส่ API key หรือ password ที่นี่เด็ดขาด

### 13. Round-trip เต็มรูปแบบ: ผู้ใช้กดลบสินค้า

1. ผู้ใช้กดปุ่ม "ลบ" ใน `ProductItem` → `window.confirm()` ขึ้นมาให้ยืนยัน
2. ยืนยันแล้วเรียก `onDelete(product.id)` ซึ่งคือ `handleDelete` ที่ส่งลงมาทาง props
3. `handleDelete` เรียก `setBusyId(id)` → ปุ่มของแถวนั้น disable กันกดซ้ำ
4. เรียก `api.deleteProduct(id)` → `fetch('http://localhost:5000/products/3', { method:'DELETE' })`
5. Server: cors → express.json → logger → router จับคู่ `DELETE /:id`
6. `Product.remove(3)` หา index ด้วย `findIndex` → `splice` ออกจาก array → คืนตัวที่ลบ
7. ถ้าเจอ → ตอบ `200` + `{ success:true, data: deleted }` / ถ้าไม่เจอ → ตอบ `404`
8. Client แปลง JSON, ตรวจ `response.ok`
9. `setProducts(prev => prev.filter(p => p.id !== id))` — ตัดออกจาก state
10. React เปรียบเทียบ virtual DOM แล้วลบเฉพาะ `<tr>` แถวนั้นออกจากหน้าจอ
11. `finally { setBusyId(null) }` ปลดล็อกปุ่ม + `flash('ลบสินค้าเรียบร้อยแล้ว')` แสดงแบนเนอร์เขียว

ทั้งหมดนี้ไม่มีการรีโหลดหน้าเลยแม้แต่ครั้งเดียว

### 14. UI บอกอะไรผู้ใช้ตอนกำลังโหลด และตอน fetch ล้มเหลว

ใช้ 3 state คุมทั้งหมด: `loading`, `error`, `message` แล้วส่งเข้า `<StatusBanner />`
ตอนโหลด:
- แสดงแบนเนอร์ฟ้า `⏳ กำลังโหลดข้อมูล...`
- ซ่อนตาราง (`{!loading && <ProductList />}`) ไม่ให้เห็นข้อมูลเก่าค้าง
- ปุ่ม submit เปลี่ยนข้อความเป็น "กำลังบันทึก..." และ disable กันกดซ้ำ
- ปุ่มแก้ไข/ลบของแถวที่กำลังทำงานจะ disable ผ่าน `busyId`

ตอนล้มเหลว:
- แสดงแบนเนอร์แดงพร้อมข้อความจริงจาก server เช่น `⚠️ ไม่พบสินค้า id = 999`
- ถ้าเป็น network error (server ปิด) จะเห็น `Failed to fetch` ซึ่งบอกผู้ใช้ว่าต่อ server ไม่ได้
- ข้อมูลเดิมยังอยู่ครบ ไม่ถูกล้าง ผู้ใช้กด "🔄 รีเฟรช" ลองใหม่ได้
- ใช้ `finally { setLoading(false) }` เพื่อให้แน่ใจว่า loading ปิดเสมอ ไม่ค้างหมุนตลอดกาล

ตอนสำเร็จ: แบนเนอร์เขียวที่หายเองใน 2.5 วินาทีผ่านฟังก์ชัน `flash()`

### 15. React re-render หลังเพิ่ม/แก้/ลบ ได้อย่างไร

React จะ re-render เมื่อ state เปลี่ยน reference เท่านั้น
ผมจึงไม่เคยแก้ array เดิมโดยตรง แต่สร้าง array ใหม่ทุกครั้ง:
js
// เพิ่ม — สร้าง array ใหม่ด้วย spread
setProducts(prev => [...prev, created]);

// แก้ไข — map คืน array ใหม่ สลับเฉพาะตัวที่ id ตรง
setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));

// ลบ — filter คืน array ใหม่ที่ไม่มีตัวนั้น
setProducts(prev => prev.filter(p => p.id !== id));

ถ้าเผลอใช้ `products.push(created)` แล้ว `setProducts(products)` จะ ไม่เกิดอะไรขึ้นเลย
เพราะ reference เดิม React เลยคิดว่าไม่มีอะไรเปลี่ยน 

อีกจุดคือใช้ `prev => ...` (updater function) แทนการอ้าง `products` ตรง ๆ
เพื่อให้แน่ใจว่าได้ค่าล่าสุดเสมอ แม้จะมีการอัปเดตซ้อนกันหลายครั้ง

และที่ `ProductList` ผมใส่ `key={product.id}` ใน `.map()` เพื่อให้ React รู้ว่า
แต่ละแถวคือ element ไหน จะได้อัปเดตเฉพาะแถวที่เปลี่ยน ไม่ต้องวาดใหม่ทั้งตาราง

### 16. อะไรยากที่สุดในการเชื่อม frontend กับ backend และแก้อย่างไร

สิ่งที่ยากที่สุดคือ CORS ตอนยิง `GET /products` ครั้งแรก Console ขึ้นว่า
`has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header`
สิ่งที่งงคือใน Network tab เห็น status 200 และ response มีข้อมูลครบ
แต่ React กลับเข้า catch block ทุกครั้ง

วิธีที่ใช้แก้:
1. ทดสอบด้วย `curl http://localhost:5000/products` → ได้ข้อมูลปกติ
   ตัดปัญหาว่าไม่ใช่ที่ logic ของ server
2. เข้าใจว่าปัญหาอยู่ที่ เบราว์เซอร์เป็นคนบล็อก ไม่ใช่ server ตอบผิด
3. ติดตั้ง `npm install cors` แล้วใส่ `app.use(cors({ origin: 'http://localhost:5173' }))`
   ไว้ บนสุดก่อน routes

สิ่งที่ยากรองลงมา คือเรื่อง type ของข้อมูล — ค่าจาก `<input>` เป็น string เสมอ
ทำให้ `price` ที่ส่งไปเป็น `"590"` แล้วการ sort ตามราคาผิดเพี้ยน (`"1000" < "590"` เพราะเทียบทีละตัวอักษร)
แก้โดยแปลงด้วย `Number()` ทั้งฝั่ง client ก่อนส่ง และฝั่ง server ใน `model.create()`/`update()`
สรุปบทเรียนคือ อย่าเชื่อ type ของข้อมูลที่ข้าม network มา ต้องแปลงและ validate ทั้งสองฝั่ง
---
## AI Process

### 17. แบ่งงานเป็น prompt อย่างไร

ผมไม่ได้ขอให้ AI สร้างทั้งแอปในครั้งเดียว แต่แบ่งเป็นขั้น ๆ ตามลำดับที่ผมทดสอบได้จริง:

1. ขอโครง Express server เปล่า + middleware พื้นฐาน แล้วทดสอบ health check ให้ผ่านก่อน
2. ขอ `product.model.js` ที่เก็บข้อมูลใน array พร้อม CRUD functions
3. ขอ routes ทีละ endpoint แล้วยิงทดสอบทุกอันก่อนไปต่อ
4. ย้ายมาฝั่ง React: ขอ `productApi.js` เป็น layer แยกก่อน แล้วค่อยทำ component
5. ขอ component ทีละตัว (Form → List → Item) แล้วประกอบเข้า `App.jsx` เอง

เหตุผลที่แบ่งย่อยคือถ้ามีอะไรพัง ผมจะรู้ทันทีว่าพังตรงไหน
ถ้าได้โค้ด 500 บรรทัดมาทีเดียวแล้ว error ผมจะ debug ไม่ออก

### 18. อะไรที่ AI สร้างมาแล้วผมแก้หรือไม่ใช้
สิ่งที่แก้:
- AI เขียน error response เป็น `res.send('Not found')` เป็น plain text
  ผมเปลี่ยนเป็น JSON โครงสร้างเดียวกันทั้งหมด (`{ success, message }`) เพื่อให้ฝั่ง client
  เขียนตัวจัดการที่เดียวจบ
- AI ใส่ URL `http://localhost:5000` แบบ hard-code ไว้ในทุก component
  ผมย้ายไป `.env` และรวมการ fetch ทั้งหมดไว้ใน `productApi.js`
- AI ไม่ได้แปลง type ของ `price`/`stock` ผมเพิ่ม `Number()` เองหลังเจอบั๊กเรื่อง sort

สิ่งที่ไม่ใช้:
- AI เสนอให้ติดตั้ง `axios` ผมเลือกใช้ `fetch` ที่ติดมากับ browser แทน
  เพราะโปรเจกต์ขนาดนี้ยังไม่ต้องการ feature เพิ่มของ axios และอยากลด dependency
- AI เสนอ MongoDB ตั้งแต่แรก ผมตัดออกเพราะโจทย์ระบุชัดว่าใช้ in-memory ก็พอ
  ควรทำ core ให้เสร็จก่อนค่อยคิดถึง stretch goal

### 19. บั๊กที่เจอและวิธี debug

บั๊ก:กดปุ่ม "เพิ่มสินค้า" แล้วขึ้น `400 Bad Request: name is required`
ทั้งที่กรอกชื่อครบทุกช่อง
ขั้นตอนที่ใช้หา:
1. เปิด Network tab ดู request payload → เห็นว่าข้อมูลถูกส่งไปครบจริง
2. ใส่ `console.log(req.body)` ใน route ฝั่ง server → ได้ `undefined`
3. เข้าใจว่าปัญหาไม่ได้อยู่ที่ฝั่งส่ง แต่อยู่ที่ฝั่งรับที่แปลง body ไม่ได้
4. กลับไปดู `index.js` พบว่าวาง `app.use(express.json())` ไว้ **หลัง**
   `app.use('/products', productRoutes)`
5. ย้ายขึ้นมาก่อน routes → แก้ได้ทันที

สิ่งที่ได้เรียนรู้: error message ที่เห็น (`name is required`) เป็นแค่ อาการ
ไม่ใช่ สาเหตุ การไล่ดูว่าข้อมูลหายไปตรงจุดไหนของ pipeline สำคัญกว่าการเดา
และเหตุการณ์นี้ทำให้ผมเข้าใจเรื่อง "ลำดับ middleware สำคัญ" แบบไม่มีวันลืม

### 20. อธิบาย route หรือ component ที่ AI ช่วยเขียน ด้วยคำพูดของตัวเอง
ขออธิบาย `errorHandler.js` ซึ่ง AI ช่วยร่างให้
js
export function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  console.error(`❌ [${status}] ${err.message}`);
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
}

ทำงานอย่างไร:
- สิ่งที่ทำให้ Express รู้ว่านี่คือ error handler คือ จำนวนพารามิเตอร์ = 4 ตัว
  ถ้าเขียนแค่ 3 ตัว Express จะมองเป็น middleware ธรรมดาและข้ามไปเลย
  แม้ `next` จะไม่ถูกใช้ก็ต้องประกาศทิ้งไว้
- `err.status || 500` — ถ้า error ถูกโยนมาพร้อมรหัส (เช่น `notFound` ตั้ง 404 ไว้)
  ก็ใช้รหัสนั้น ถ้าเป็น error ที่ไม่คาดคิดก็ถือเป็น 500
- `console.error` log ไว้ฝั่ง server สำหรับนักพัฒนา แยกจากสิ่งที่ส่งให้ผู้ใช้
- บรรทัด spread ที่มีเงื่อนไข: แสดง `stack` เฉพาะตอน development
  เพราะ stack trace เปิดเผยโครงสร้างไฟล์ภายในซึ่งเป็นความเสี่ยงด้านความปลอดภัยบน production
  เทคนิคนี้อาศัยว่า `...(false)` จะไม่เพิ่ม key อะไรเลย
- มันจะทำงานก็ต่อเมื่อมีการเรียก `next(err)` เท่านั้น ผมจึงครอบทุก route ด้วย `try/catch`
  แล้ว `next(err)` ใน catch block

ประโยชน์: ทำให้ error ทุกแบบออกมาในรูปแบบเดียวกัน ไม่ต้องเขียน `res.status(500)`
ซ้ำ ๆ ในทุก route และ frontend เขียนตัวจัดการ error แค่ที่เดียวใน `productApi.js` ก็พอ
