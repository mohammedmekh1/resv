# 🏨 RESV Dashboard – لوحة تحكم فنادق مكة المكرمة

> لوحة تحكم Next.js متكاملة لنظام RESV، تعرض بيانات حية من Google Sheets وتتكامل مع جميع الأنظمة العشرة.

---

## 🚀 النشر على Vercel (5 دقائق)

### 1. رفع المشروع على GitHub
```bash
cd resv-dashboard
git init
git add .
git commit -m "RESV Dashboard v2.0"
git remote add origin https://github.com/YOUR_USER/resv-dashboard.git
git push -u origin main
```

### 2. النشر على Vercel
```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel --prod
```

أو عبر vercel.com:
1. اذهب إلى vercel.com/new
2. استورد الـ repo من GitHub
3. أضف متغيرات البيئة (انظر .env.example)
4. اضغط Deploy ✅

### 3. متغيرات البيئة في Vercel
اذهب إلى Settings → Environment Variables وأضف:

| المتغير | القيمة |
|---------|--------|
| `GOOGLE_SHEET_ID` | `1FOp8T6YvD1qg6XXnCg7RJopHG_uOAr8A74q2tFu26HA` |
| `NEXT_PUBLIC_SHEET_API_KEY` | مفتاح Google Sheets API |
| `N8N_BASE_URL` | `https://n8n.srv1332143.hstgr.cloud` |

---

## 🔑 إعداد Google Sheets API

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com)
2. أنشئ مشروع جديد أو اختر موجود
3. فعّل **Google Sheets API**
4. أنشئ **API Key** من Credentials
5. قيّد الـ API Key لـ Sheets API فقط
6. **اجعل الشيت عاماً للقراءة:**
   - افتح الشيت → Share → Anyone with the link → Viewer

---

## 📊 هيكل الشيت المطلوب

الشيت: `Makkah_Hotel_MasterSheets_FINAL`

| التبويب | gid | المُغذِّي |
|---------|-----|-----------|
| `leads` | 1136316584 | F1,F2,F3,F4,F6 |
| `social_posts` | 966952321 | F7,F8 |
| `articles` | 1427001239 | F10,FWP |
| `daily_reports` | 1610612762 | F9 |
| `publish_log` | 1848411495 | F8 |
| `interactions_log` | 862175237 | F2 |
| `consent_log` | 882831808 | F2,F5 |
| `journey_log` | 1417386966 | F4 |
| `delivery_log` | 1759159568 | F5 |
| `sales_tasks` | 1511983230 | F6 |
| `workflow_errors` | 1659619068 | F1-F10 |

---

## 🛠️ التطوير المحلي

```bash
npm install
cp .env.example .env.local
# أضف قيم المتغيرات في .env.local
npm run dev
# افتح http://localhost:3000
```

---

## 🎨 الميزات

- **4 تبويبات:** نظرة عامة، العملاء، المحتوى، الأنظمة
- **KPI Cards:** 6+ مؤشرات أداء رئيسية مع تغييرات نسبية
- **رسوم بيانية:** Area, Bar, Line, Pie charts بـ Recharts
- **جدول عملاء:** مع درجات وشارات ملونة
- **حالة الأنظمة:** مؤشر LIVE لكل وورك فلو
- **رؤى AI:** تحليل يومي تلقائي من F9
- **تحديث تلقائي:** كل 5 دقائق
- **وضع Demo:** يعمل بدون API key ببيانات وهمية واقعية
- **RTL كامل:** دعم عربي تام
- **تصميم داكن:** أسلوب luxury مستوحى من الهوية الإسلامية

---

## 📁 هيكل المشروع

```
resv-dashboard/
├── app/
│   ├── globals.css          # الأنماط العامة + Tailwind
│   ├── layout.tsx           # Layout الجذر
│   ├── page.tsx             # 🌟 لوحة التحكم الرئيسية
│   └── api/
│       └── kpis/route.ts    # API endpoint للـ KPIs
├── lib/
│   └── sheets.ts            # Google Sheets data layer
├── next.config.js
├── tailwind.config.js
├── vercel.json
└── package.json
```

---

## 🔄 دورة البيانات

```
n8n Workflows → Google Sheets → Sheets API → Next.js → Dashboard
     ↑                                           ↓
Flow #9 (يومي 8AM)                    تحديث تلقائي كل 5 دقائق
```

---

*RESV Dashboard v2.0 | Makkah Hotel Booking System*
