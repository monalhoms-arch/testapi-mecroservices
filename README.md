# 🚀 API Tester Dashboard — منصة خدمتي

واجهة تجريبية موحدة مبنية بـ **React + Vite** لاختبار ثلاثة Microservices مستقلة (WhatsApp، PDF، GPS) من مكان واحد.

---

## 📸 معاينة

| WhatsApp Tab | PDF Tab | GPS Tab |
|---|---|---|
| حجز مواعيد · موقع جغرافي · تذكيرات | نماذج فواتير ديناميكية | روابط خرائط · معاينة مباشرة |

---

## 🧩 الخدمات المدعومة

| الخدمة | المنفذ | المستودع |
|--------|--------|----------|
| 💬 WhatsApp Service | `8000` | [whatsapp-api](https://github.com/monalhoms-arch/whatsapp-api) |
| 📄 PDF Invoice Service | `8002` | [pdf-api](https://github.com/monalhoms-arch/pdf-api) |
| 📍 GPS & Maps Service | `8001` | [gps-api](https://github.com/monalhoms-arch/gps-api) |

---

## ✨ مزايا الواجهة

### 💬 تبويب WhatsApp (المنفذ 8000)
- ✅ اختيار مزود الخدمة من بطاقات تفاعلية
- ✅ حجز موعد (Date & Time Picker)
- ✅ مشاركة الموقع الجغرافي تلقائياً أو يدوياً
- ✅ إرسال رسالة واتساب مع رابط مباشر
- ✅ إنشاء فاتورة PDF مع رابط تحميل
- ✅ عرض التذكيرات المجدولة (APScheduler)
- ✅ فحص حالة السيرفر (Online/Offline)

### 📄 تبويب PDF (المنفذ 8002)
- ✅ نموذج كامل: عنوان، زبون، مزود، عملة
- ✅ إضافة بنود الفاتورة ديناميكياً (وصف + كمية + سعر)
- ✅ حساب الإجمالي الكلي تلقائياً
- ✅ دعم عملات متعددة (DZD, USD, EUR, SAR)
- ✅ تحميل الفاتورة مباشرة من المتصفح

### 📍 تبويب GPS (المنفذ 8001)
- ✅ تحديد الموقع الجغرافي تلقائياً
- ✅ مواقع سريعة جاهزة (الجزائر، وهران، قسنطينة، عنابة)
- ✅ توليد روابط لـ: Google Maps، Apple Maps، OpenStreetMap
- ✅ تنسيق الإحداثيات كرابط Google مباشر
- ✅ معاينة خريطة حية داخل الصفحة (OpenStreetMap Embed)

---

## 🛠️ التقنيات المستخدمة

```
Frontend:  React 18 + Vite
Styling:   Vanilla CSS (Dark Mode · Glassmorphism · Micro-animations)
Fonts:     Inter + Tajawal (Google Fonts)
Language:  Arabic RTL
```

---

## 🚀 تشغيل المشروع

### 1. تثبيت وتشغيل الـ Frontend

```bash
git clone https://github.com/monalhoms-arch/testapi-mecroservices.git
cd testapi-mecroservices
npm install
npm run dev
```

الواجهة ستعمل على: **http://localhost:5173**

---

### 2. تشغيل سيرفرات الـ Backend

افتح **3 نوافذ Terminal** منفصلة:

**النافذة 1 — WhatsApp Service (المنفذ 8000):**
```bash
git clone https://github.com/monalhoms-arch/whatsapp-api.git
cd whatsapp-api
pip install -r requirements.txt
python main.py
```

**النافذة 2 — GPS Service (المنفذ 8001):**
```bash
git clone https://github.com/monalhoms-arch/gps-api.git
cd gps-api
pip install -r requirements.txt
python main.py
```

**النافذة 3 — PDF Service (المنفذ 8002):**
```bash
git clone https://github.com/monalhoms-arch/pdf-api.git
cd pdf-api
pip install -r requirements.txt
python main.py
```

---

### 3. إعداد قاعدة البيانات (لخدمة WhatsApp)

```sql
-- استورد ملف abc.sql في phpMyAdmin أو MySQL Workbench
mysql -u root -p < whatsapp-api/abc.sql
```

---

## 📁 هيكل المشروع

```
api-dashboard/
├── index.html
├── package.json
└── src/
    ├── main.jsx              ← نقطة الدخول
    ├── App.jsx               ← التطبيق الرئيسي + Toast Context
    ├── App.css               ← نظام التصميم الكامل
    ├── index.css             ← المتغيرات والعناصر الأساسية
    └── components/
        ├── Sidebar.jsx       ← القائمة الجانبية
        ├── Toast.jsx         ← الإشعارات المنبثقة
        ├── WhatsAppTab.jsx   ← تبويب واتساب
        ├── PdfTab.jsx        ← تبويب الفواتير
        └── GpsTab.jsx        ← تبويب الخرائط
```

---

## ⚙️ متطلبات النظام

- **Node.js** ≥ 18
- **Python** ≥ 3.10
- **MySQL** (لخدمة WhatsApp)
- متصفح حديث يدعم Geolocation API

---

## 👨‍💻 المطور

مشروع تخرج — هندسة البرمجيات  
منصة **خدمتي** — نظام إدارة العمالة عبر WhatsApp

---

## 📄 الرخصة

MIT License © 2025
