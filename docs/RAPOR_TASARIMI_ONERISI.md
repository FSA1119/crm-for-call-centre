# 📊 RAPOR TASARIMI ÖNERİSİ

**Tarih:** 2024-12-08  
**Standart:** 23. Bölüm - LOG RAPORLAMA ve DASHBOARD STANDARTLARI  
**Hazırlayan:** Atlas CRM Agent

---

## 🎯 ÖNERİLEN RAPOR YAPISI

### 1️⃣ OPERATIONAL DASHBOARD (Temsilci - Günlük)

**Kime:** Her temsilci (kendi performansı)  
**Ne zaman:** Real-time (her 5 dakika güncellenir)  
**Amaç:** Günlük hedefleri takip et, bugün ne yapmalıyım?

#### Yapı:

**HEADER:**
- Tarih: Bugün (08.12.2024)
- Temsilci: SB 004 - Sude Bal
- Format/Proje: [Seçilebilir dropdown]

**KPI CARDS (4 Kart - Üstte):**
1. **📞 Toplam Temas**
   - Değer: 45
   - Hedef: 50
   - İlerleme: %90 (Progress bar)
   - Trend: ↑ +5 (dün 40)

2. **🎯 Randevu Alındı**
   - Değer: 3
   - Hedef: 5
   - İlerleme: %60
   - Trend: → (dün 3)

3. **✅ Connection Rate**
   - Değer: %52
   - Benchmark: %25-35 ✅ İyi
   - Trend: ↑ +2% (dün %50)

4. **📈 Conversion Rate**
   - Değer: %6.7
   - Benchmark: %5-15 ⚠️ Orta
   - Trend: ↓ -1% (dün %7.7)

**AKTİVİTE DAĞILIMI (Bar Chart):**
- Randevu Alındı: 3 (%6.7)
- İleri Tarih: 2 (%4.4)
- Bilgi Verildi: 5 (%11.1)
- Ulaşılamadı: 20 (%44.4)
- İlgilenmiyor: 15 (%33.3)

**GÜNLÜK TREND (Line Chart - Son 7 Gün):**
- X: Günler (Pzt, Sal, Çar...)
- Y: Arama sayısı (mavi çizgi)
- Y2: Randevu sayısı (yeşil çizgi)

**BAŞARILAR ve GELİŞTİRME:**
- ✅ Pozitif: Connection rate %52 (benchmark üstü)
- ⚠️ İyileştirme: Conversion rate %6.7 (hedef %10)
- 💡 Aksiyon: Görüşme kalitesi artırılmalı

**YARIN İÇİN PLAN:**
- Bekleyen: 5 follow-up
- Öncelik: İlgilenmeyen 15 kişiye alternatif teklif

---

### 2️⃣ TACTICAL DASHBOARD (Takım Lideri - Haftalık)

**Kime:** Takım lideri, Portföy yöneticisi  
**Ne zaman:** Haftalık (Pazartesi sabahı)  
**Amaç:** Takım performansını izle, kim desteklenmeli?

#### Yapı:

**EXECUTIVE SUMMARY (30 saniye):**
- 🟢 Takım hedefi %105 tamamlandı
- ⚠️ 2 temsilci düşük performans (SB 004, NT 002)
- ✅ En iyi: MK 009 (180 randevu)

**HAFTALIK METRİKLER TABLOSU:**

| Metrik | Bu Hafta | Geçen Hafta | Hedef | Durum |
|--------|----------|-------------|-------|-------|
| Toplam Temas | 1,250 | 1,180 | 1,200 | 🟢 +%5.9 |
| Randevu | 85 | 78 | 80 | 🟢 +%6.3 |
| Connection Rate | %48 | %45 | %35 | 🟢 +%3 |
| Conversion Rate | %6.8 | %6.6 | %10 | ⚠️ -%3.2 |
| Ortalama Arama/Gün | 62 | 59 | 60 | 🟢 +%5 |

**GÜNLÜK TREND (5 İş Günü - Line Chart):**
- Pazartesi: 200 temas, 12 randevu
- Salı: 180 temas, 10 randevu
- Çarşamba: 250 temas, 18 randevu (en iyi gün)
- Perşembe: 220 temas, 15 randevu
- Cuma: 200 temas, 12 randevu

**LEADERBOARD (Top 5):**
1. 🏆 MK 009 - 180 temas, 18 randevu (%10 conversion)
2. 🥈 KM 005 - 165 temas, 12 randevu (%7.3 conversion)
3. 🥉 NT 012 - 150 temas, 11 randevu (%7.3 conversion)
4. SB 004 - 140 temas, 8 randevu (%5.7 conversion) ⚠️
5. NT 002 - 130 temas, 7 randevu (%5.4 conversion) ⚠️

**TAKIM KARŞILAŞTIRMASI:**
- Ortalama: 156 temas/temsilci
- En iyi: 180 (MK 009)
- En düşük: 130 (NT 002)
- Fark: 50 temas (%38)

**DETAYLI ANALİZ:**
- En iyi gün: Çarşamba (250 temas, 18 randevu)
- En zayıf gün: Salı (180 temas, 10 randevu)
- Pattern: Çarşamba-Perşembe en verimli

**SONRAKİ HAFTA PLANI:**
- SB 004 ve NT 002 için coaching (conversion düşük)
- Çarşamba-Perşembe pattern'ini diğer günlere yay
- Hedef: 1,300 temas, 90 randevu

---

### 3️⃣ STRATEGIC DASHBOARD (Yönetici - Aylık)

**Kime:** Yönetici, C-Level  
**Ne zaman:** Aylık (ayın ilk haftası)  
**Amaç:** Stratejik kararlar al, trend analizi

#### Yapı:

**EXECUTIVE SUMMARY (1 dakika):**
1. 🟢 Ay sonu hedefi %110 tamamlandı (5,500 temas, hedef 5,000)
2. ⚠️ Conversion rate %6.8 (hedef %10) - İyileştirme gerekli
3. ✅ Connection rate %48 (benchmark üstü) - Güçlü yön
4. 📈 Trend: 3 aydır yukarı (4,200 → 4,800 → 5,500)
5. 💡 Öneri: Görüşme kalitesi training'i gerekli

**AYLIK PERFORMANS KARTLARI (8 KPI):**

1. **Toplam Temas**
   - Bu Ay: 5,500
   - Geçen Ay: 4,800
   - Hedef: 5,000
   - Trend: ↑ +%14.6

2. **Randevu Alındı**
   - Bu Ay: 375
   - Geçen Ay: 320
   - Hedef: 350
   - Trend: ↑ +%17.2

3. **Connection Rate**
   - Bu Ay: %48
   - Geçen Ay: %45
   - Benchmark: %35 ✅
   - Trend: ↑ +%3

4. **Conversion Rate**
   - Bu Ay: %6.8
   - Geçen Ay: %6.7
   - Hedef: %10 ⚠️
   - Trend: → +%0.1

5. **Ortalama Arama/Gün**
   - Bu Ay: 55
   - Geçen Ay: 48
   - Hedef: 50
   - Trend: ↑ +%14.6

6. **No Answer Rate**
   - Bu Ay: %45
   - Geçen Ay: %48
   - Benchmark: <50% ✅
   - Trend: ↓ -%3

7. **Follow-up Rate**
   - Bu Ay: %85
   - Geçen Ay: %82
   - Hedef: >80% ✅
   - Trend: ↑ +%3

8. **Pipeline Value**
   - Bu Ay: 2,500,000 TL
   - Geçen Ay: 2,200,000 TL
   - Trend: ↑ +%13.6

**TREND ANALİZİ (3 Ay - Line Chart):**
- X: Aylar (Ekim, Kasım, Aralık)
- Y: Temas (mavi), Randevu (yeşil), Conversion (turuncu)
- Yorum: Tüm metrikler yukarı, conversion durgun

**SEGMENTASYON ANALİZİ:**
- Portföy Yöneticisi bazlı:
  - RS 22: 1,800 temas, 120 randevu (%6.7)
  - SO 003: 1,500 temas, 105 randevu (%7.0)
  - OC 23: 1,200 temas, 80 randevu (%6.7)

**TAKIM PERFORMANSI:**
- Leaderboard (Top 10)
- Dağılım: 8 temsilci hedef üstü, 4 temsilci hedef altı
- Ortalama: 458 temas/temsilci

**ÖNÜMÜZDEKİ AY TAHMİNİ:**
- Linear regression: 5,800 temas (↑ +%5.5)
- Risk: Conversion düşük kalırsa randevu artmayabilir
- Öneri: Training + script iyileştirme

**STRATEJİK AKSİYONLAR:**
1. Conversion training (tüm takım) - Bu ay
2. Script iyileştirme (value proposition) - Bu ay
3. Hedef artırma: 6,000 temas - Gelecek ay

---

### 4️⃣ PERFORMANCE SCORECARD (Bireysel Performans)

**Kime:** Temsilci + Takım Lideri  
**Ne zaman:** Aylık (1-on-1 toplantılarında)  
**Amaç:** Bireysel değerlendirme, coaching planı

#### Yapı:

**PERFORMANS KARNESİ:**

| Kategori | Ağırlık | Puan | Ağırlıklı |
|----------|---------|------|-----------|
| Activity | %30 | 85/100 | 25.5 |
| Effectiveness | %40 | 70/100 | 28.0 |
| Quality | %20 | 80/100 | 16.0 |
| Results | %10 | 75/100 | 7.5 |
| **TOPLAM** | **100%** | - | **77/100** |

**Seviye:** ✅ Good (80-89 arası)

**DETAYLI SKORLAMA:**

**Activity (%30):**
- Arama sayısı: 1,800 (hedef 1,500) → 100/100
- Aktivite çeşitliliği: 8/10 aktivite → 80/100
- Çalışma saatleri: 8 saat/gün → 90/100
- **Ortalama: 85/100**

**Effectiveness (%40):**
- Connection rate: %48 (hedef %35) → 90/100
- Conversion rate: %6.8 (hedef %10) → 68/100
- Appointment show rate: %75 (hedef %70) → 85/100
- **Ortalama: 70/100**

**Quality (%20):**
- Lead quality: Yüksek → 85/100
- Follow-up rate: %85 (hedef %80) → 90/100
- Müşteri geri bildirimi: İyi → 75/100
- **Ortalama: 80/100**

**Results (%10):**
- Randevu sayısı: 120 (hedef 100) → 100/100
- Pipeline value: 500K (hedef 400K) → 100/100
- Closed deals: 8 (hedef 10) → 60/100
- **Ortalama: 75/100**

**9-BOX GRID:**
- Performans: Orta-Yüksek (77/100)
- Potansiyel: Yüksek
- **Kategori:** 📈 High Potential
- **Aksiyon:** Coach, develop (skill development)

**SKILL GAP ANALYSIS:**

| Yetenek | Mevcut | Hedef | Gap |
|---------|--------|-------|-----|
| Prospecting | 85 | 90 | -5 |
| Qualification | 70 | 85 | -15 ⚠️ |
| Presentation | 75 | 80 | -5 |
| Closing | 60 | 75 | -15 ⚠️ |
| Relationship | 80 | 85 | -5 |

**En büyük gap:** Qualification ve Closing (-15)

**COACHING PLAN:**
- **30 gün hedef:** Conversion rate %8.5
- **Aksiyonlar:**
  1. BANT training (Qualification) - Bu hafta
  2. Role-play (Closing techniques) - Gelecek hafta
  3. Shadowing (top performer) - Bu ay
- **Takip:** Haftalık 1-on-1

---

### 5️⃣ FUNNEL REPORT (Mevcut - İyileştirilmiş)

**Kime:** Tüm seviyeler  
**Ne zaman:** On-demand  
**Amaç:** Dönüşüm aşamalarını görselleştir

#### Yapı:

**FUNNEL CHART:**
```
1,000 Arama
    ↓ (%48)
  480 Ulaşılan
    ↓ (%14)
   68 Randevu Alındı
    ↓ (%75)
   51 Toplantı Yapıldı
    ↓ (%20)
   10 Satış Yapıldı
```

**DÖNÜŞÜM ORANLARI:**
- Arama → Ulaşılan: %48 ✅
- Ulaşılan → Randevu: %14.2 ⚠️ (hedef %20)
- Randevu → Toplantı: %75 ✅
- Toplantı → Satış: %19.6 ⚠️ (hedef %25)

**KAYIP ANALİZİ:**
- Ulaşılamadı: 520 (%52)
- İlgilenmiyor: 350 (%35)
- Randevu iptal: 17 (%25)
- Toplantı sonrası kayıp: 41 (%80)

**İYİLEŞTİRME ÖNERİLERİ:**
1. Ulaşılan → Randevu: Script iyileştirme (value proposition)
2. Toplantı → Satış: Closing training

---

## 📋 RAPOR ÖZELLİKLERİ

### ✅ STANDART ÖZELLİKLER

1. **KPI Hesaplama:**
   - Primary KPIs (Total Contacts, Connection Rate, Conversion Rate)
   - Negative KPIs (No Answer Rate, Not Interested Rate)
   - Benchmark karşılaştırması

2. **Trend Analizi:**
   - Time series (günlük/haftalık/aylık)
   - Moving averages
   - Period comparison (WoW, MoM, YoY)

3. **Karşılaştırma:**
   - Self (bu dönem vs geçen dönem)
   - Team average
   - Top performer
   - Target

4. **Görselleştirme:**
   - KPI Cards (Material Design)
   - Line charts (trend)
   - Bar charts (karşılaştırma)
   - Funnel charts (dönüşüm)
   - Gauge charts (hedef)

5. **Drill-Down:**
   - Summary → Breakdown → Detail → Raw Data
   - Click-to-expand
   - Filter & segment

6. **Executive Summary:**
   - 30-second rule
   - Traffic light system (🟢🟡🔴)
   - Action-oriented

---

## 🎨 TASARIM PRENSİPLERİ

### Renk Paleti:
- 🟢 Yeşil: Başarı, hedef üstü
- 🔴 Kırmızı: Alarm, hedef altı
- 🟡 Sarı: Dikkat, orta seviye
- 🔵 Mavi: Nötr, bilgi

### Layout:
- 12-column grid system
- KPI Cards: 2 satır (üstte)
- Charts: 4-6 satır (ortada)
- Tables: 3-5 satır (altta)

### Mobile:
- Responsive design
- Touch-friendly (44x44px min)
- Single column layout

---

## 🚀 UYGULAMA ÖNCELİĞİ

### Faz 1 (Hemen):
1. ✅ Operational Dashboard (Temsilci)
2. ✅ Tactical Dashboard (Takım Lideri)
3. ✅ KPI hesaplama fonksiyonları (zaten eklendi)

### Faz 2 (Bu Hafta):
4. Strategic Dashboard (Yönetici)
5. Performance Scorecard
6. Executive Summary

### Faz 3 (Gelecek):
7. Trend analizi (moving averages)
8. Forecasting
9. Drill-down detayları

---

## ❓ ONAY BEKLİYORUM

**Soru 1:** Bu rapor yapısı uygun mu? Değişiklik ister misiniz?

**Soru 2:** Hangi raporlardan başlayalım? (Öneri: Operational Dashboard)

**Soru 3:** Hangi KPI'lar en önemli? (Öneri: Connection Rate, Conversion Rate, Randevu)

**Soru 4:** Dashboard'lar Google Sheets'te mi yoksa ayrı sayfalar mı? (Öneri: Ayrı sayfalar, "📊 Dashboard - Temsilci" gibi)

**Soru 5:** Otomatik güncelleme var mı? (Öneri: Time-driven trigger, günlük 18:00)

---

**Hazırlayan:** Atlas CRM Agent  
**Tarih:** 2024-12-08  
**Versiyon:** 1.0

