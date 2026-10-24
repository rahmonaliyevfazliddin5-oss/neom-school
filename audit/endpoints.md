# NEOM School — Marshrutlar va API Endpointlari Ro‘yxati (Endpoints Inventory)

Mazkur hujjat loyihaning to‘liq auditi doirasida tuzilgan bo‘lib, tizimdagi barcha foydalanuvchi sahifalari (Frontend Routes), Next.js API yo‘nalishlari va NestJS mikroxizmatlari endpointlarini o‘z ichiga oladi.

---

## 1. Frontend Sahifalari (Web Pages)

| № | URL Yo‘li | Sahifa Nomi / Maqsadi | Ruxsat / Himoya darajasi |
|---|-----------|-----------------------|--------------------------|
| 1 | `/` | Bosh sahifa (Landing page) — Maktab tanishuvi, yangiliklar, yutuqlar | Ochiq (Public) |
| 2 | `/yangiliklar/[id]` | Yangilik yoki tadbirning batafsil sahifasi | Ochiq (Public) |
| 3 | `/kirish` | Tizimga kirish (Login sahifasi) | Ochiq (Public) |
| 4 | `/panel/direktor` | Direktor boshqaruv paneli — Maktab nazorati va umumiy monitoring | Faqat `DIRECTOR` roli (JWT) |
| 5 | `/panel/direktor/xodimlar` | Direktor: Xodimlar va ustozlar shtati boshqaruvi | Faqat `DIRECTOR` roli (JWT) |
| 6 | `/panel/direktor/hisobotlar`| Direktor: Davomat va ta’lim umumiy hisobotlari | Faqat `DIRECTOR` roli (JWT) |
| 7 | `/panel/zavuch` | Zavuch boshqaruv paneli — Bugungi kunlik davomat monitoringi | Faqat `ZAVUCH` roli (JWT) |
| 8 | `/panel/zavuch/sinflar` | Zavuch: Sinflarni yaratish, sinf rahbarlariga login-parol berish | Faqat `ZAVUCH` roli (JWT) |
| 9 | `/panel/zavuch/yangiliklar`| Zavuch: Maktab yangiliklari, tadbirlari va rejalarini boshqarish | Faqat `ZAVUCH` roli (JWT) |
| 10| `/panel/ustoz` | O‘qituvchi bosh paneli — Kunlik davomat jurnali | Faqat `TEACHER` roli (JWT) |
| 11| `/panel/ustoz/sinflar` | O‘qituvchi: O‘z sinfidagi o‘quvchilar ro‘yxatini boshqarish | Faqat `TEACHER` roli (JWT) |
| 12| `/panel/ustoz/hisobot` | O‘qituvchi: Oylik/choraklik/yillik sinf davomat hisoboti (Excel) | Faqat `TEACHER` roli (JWT) |

> **Xavfsizlik eslatmasi:** `/panel/*` yo‘llari `middleware.ts` orqali qat’iy himoyalangan. Ruxsatsiz yoki mavjud bo‘lmagan panel yo‘llari (masalan, `/panel/admin`) darhol **404 Not Found** qaytaradi.

---

## 2. Next.js Ichki API Yo‘nalishlari (`apps/web/src/app/api`)

| № | Endpoint | HTTP Metod | Vazifasi / Maqsadi | Ruxsat talabi |
|---|----------|------------|---------------------|---------------|
| 1 | `/api/auth/login` | `POST` | Tizimga kirish, JWT access va refresh tokenlarni berish | Ochiq |
| 2 | `/api/auth/logout` | `POST` | Tizimdan chiqish, sessiya kukilarini tozalash | Autentifikatsiyalangan |
| 3 | `/api/auth/me` | `GET` | Joriy kirgan xodim profilini olish | JWT Kuki |
| 4 | `/api/auth/refresh` | `POST` | Muddati tugagan tokenni yangilash | Refresh Token |
| 5 | `/api/attendance/director/overview` | `GET` | Direktor uchun umumiy maktab davomat ko‘rsatkichlari | Direktor |
| 6 | `/api/attendance/zavuch/dashboard` | `GET` | Zavuch uchun bugungi qatnashuv statistikasi va sababsizlar | Zavuch |
| 7 | `/api/attendance/my-class` | `GET` | O‘qituvchining biriktirilgan sinf o‘quvchilari va davomati | O‘qituvchi |
| 8 | `/api/attendance/mark` | `POST` | O‘quvchiga davomat holatini belgilash (Keldi/Qoldi/Sababli) | O‘qituvchi |
| 9 | `/api/attendance/submit` | `POST` | Kunlik davomatni Zavuchga tasdiqlash uchun yuborish | O‘qituvchi |
| 10| `/api/classes` | `GET`, `POST` | Barcha sinflar ro‘yxatini olish va yangi sinf/ustoz yaratish | Zavuch / Rahbariyat |
| 11| `/api/staff` | `GET`, `POST`, `DELETE` | Maktab xodimlari ro‘yxatini boshqarish | Direktor |
| 12| `/api/students` | `GET`, `POST` | Sinf o‘quvchilari ro‘yxatini olish va yangi o‘quvchi qo‘shish | O‘qituvchi / Zavuch |
| 13| `/api/reports/class` | `GET` | Sinfning oylik/choraklik batafsil davomat tahlili | O‘qituvchi / Direktor |
| 14| `/api/posts` | `GET`, `POST`, `PUT`, `DELETE` | Yangilik va e’lonlarni boshqarish (CRUD) | Zavuch |
| 15| `/api/public/posts` | `GET` | Bosh sahifa uchun ommaviy yangiliklar ro‘yxati | Ochiq |
| 16| `/api/public/posts/[id]` | `GET` | Bitta yangilik tafsiloti va ko‘rishlar sonini oshirish | Ochiq |
| 17| `/api/public/settings` | `GET` | Maktabning ommaviy kontaktlari va statistik ko‘rsatkichlari | Ochiq |

---

## 3. NestJS Backend Modullari (`apps/api/src/modules`)

| № | Modul | Asosiy Controller | Endpointlar Prefiksi | Vazifasi |
|---|-------|-------------------|----------------------|----------|
| 1 | Auth | `auth.controller.ts` | `/api/v1/auth` | Argon2id va JWT asosidagi markazlashgan avtorizatsiya |
| 2 | Attendance | `attendance.controller.ts` | `/api/v1/attendance` | Davomat jurnallari va tahlillar |
| 3 | Classes | `classes.controller.ts` | `/api/v1/classes` | Sinflar va auditoriyalar boshqaruvi |
| 4 | Students | `students.controller.ts` | `/api/v1/students` | O‘quvchilar ma’lumotlar bazasi |
| 5 | Users | `users.controller.ts` | `/api/v1/users` | Tizim foydalanuvchilari va rollar |
| 6 | Posts | `posts.controller.ts` | `/api/v1/posts` | Yangiliklar va blog postlari |
| 7 | Audit | `audit.controller.ts` | `/api/v1/audit` | Xavfsizlik hodisalari va harakatlar jurnali (Audit logs) |
| 8 | Media | `media.controller.ts` | `/api/v1/media` | Fayllar va rasmlar yuklash |
| 9 | Public | `public.controller.ts` | `/api/v1/public` | Ommaviy ma’lumotlar |
| 10| Health | `health.controller.ts` | `/health` | Terminus / Liveness va Readiness tekshiruvi |
