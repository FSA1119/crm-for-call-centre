# 📊 Dataset Raporu ve Format Tablo Raporlama - Veri Kaynakları

## 🎯 Genel Bakış

Bu dokümantasyon, **Dataset Raporu** ve **Format Tablo Raporlama** fonksiyonlarının verileri **nereden** aldığını açıklar.

---

## 📋 Fonksiyonlar ve Veri Akışı

### 1️⃣ `analyzeFormatTableForArchive()` - Format Tablo Analizi

**Konum:** `src/agents/backend.js` (Satır 8610-8770)

**Veri Kaynakları:**

#### ✅ **Format Tablo Sayfası** (Ana Kaynak)
```javascript
// Batch read: Tüm veriyi tek seferde oku
const allData = formatTableSheet.getDataRange().getValues();
const headers = allData[0] || [];
const rows = allData.slice(1);
```

**Okunan Kolonlar:**
- **Aktivite** kolonu → `aramaYapilan` sayısı
- **Aktivite Tarihi** kolonu → `aktiviteTarihiDolu` sayısı
- **Log** kolonu → `logDolu` sayısı
- **Kaynak** kolonu → Diğer sayfalarla eşleştirme için

**Hesaplanan Metrikler:**
- `totalContacts`: Boş olmayan satır sayısı
- `aramaYapilan`: Aktivite dolu satır sayısı
- `aktiviteTarihiDolu`: Aktivite Tarihi dolu satır sayısı
- `logDolu`: Log dolu satır sayısı
- `tumuAranmis`: Üç kriterden biri tamamlanmışsa `true`

---

#### ✅ **Randevularım Sayfası** (İlişkili Veri)
```javascript
const randevuSheet = ss.getSheetByName('Randevularım');
const randevuData = randevuSheet.getDataRange().getValues();
```

**Eşleştirme Mantığı:**
- Format Tablo'daki **"Kaynak"** kolonu = Randevularım'daki **"Kaynak"** kolonu
- Format Tablo adı (örn: "Format Tablo 1") = Randevularım'daki "Kaynak" değeri

**Filtreleme:**
```javascript
randevuAlindi = randevuRows.filter(r => {
  const kaynak = String(r[randevuKaynakIdx] || '').trim();
  const durum = String(r[randevuDurumIdx] || '').trim();
  return kaynak === sheetName && (
    durum === 'Randevu Alındı' ||
    durum === 'Randevu Teyitlendi' ||
    durum === 'İleri Tarih Randevu'
  );
}).length;
```

**Okunan Kolonlar:**
- **Kaynak** kolonu → Format Tablo adıyla eşleştirme
- **Randevu durumu** kolonu → Durum kontrolü

---

#### ✅ **Toplantılarım Sayfası** (İlişkili Veri)
```javascript
const toplantiSheet = ss.getSheetByName('Toplantılarım');
const toplantiData = toplantiSheet.getDataRange().getValues();
```

**Eşleştirme Mantığı:**
- Format Tablo'daki **"Kaynak"** kolonu = Toplantılarım'daki **"Kaynak"** kolonu

**Filtreleme:**
```javascript
// Toplantı sayısı
toplantiYapildi = toplantiRows.filter(r => {
  const kaynak = String(r[toplantiKaynakIdx] || '').trim();
  return kaynak === sheetName;
}).length;

// Satış sayısı
satisYapildi = toplantiRows.filter(r => {
  const kaynak = String(r[toplantiKaynakIdx] || '').trim();
  const sonuc = String(r[toplantiSonucIdx] || '').trim();
  return kaynak === sheetName && sonuc === 'Satış Yapıldı';
}).length;
```

**Okunan Kolonlar:**
- **Kaynak** kolonu → Format Tablo adıyla eşleştirme
- **Toplantı Sonucu** kolonu → "Satış Yapıldı" kontrolü

---

#### ⚠️ **Fırsatlarım Sayfası** (Şu An Kullanılmıyor)
```javascript
const firsatSheet = ss.getSheetByName('Fırsatlarım');
// Şu an kod içinde tanımlı ama kullanılmıyor!
```

**Not:** Kod içinde `firsatSheet` tanımlı ama şu an kullanılmıyor. Gelecekte eklenebilir.

---

### 2️⃣ `reportFormatTable()` - Format Tablo Raporlama

**Konum:** `src/agents/backend.js` (Satır 8870-9050)

**Veri Kaynakları:**

#### ✅ **Aktif Sayfa** (Format Tablo)
```javascript
const activeSheet = ss.getActiveSheet();
const sheetName = activeSheet.getName();
```

**Kontrol:**
```javascript
if (!isFormatTable(activeSheet)) {
  ui.alert('❌ Hata', 'Aktif sayfa bir Format Tablo değil!');
  return;
}
```

#### ✅ **Dosya Adı** (Temsilci Kodu Tespiti)
```javascript
const fileName = ss.getName();
// Örn: "SB_004 - Sinem Bakalcı" veya "SB 004"
```

**Otomatik Kod Tespiti:**
```javascript
for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
  if (fileName.includes(code)) {
    uzmanKodu = code;
    break;
  }
}
```

**Bulunamazsa:**
- Kullanıcıya prompt gösterilir
- Boş bırakılabilir (kod olmadan devam eder)

#### ✅ **`analyzeFormatTableForArchive()` Sonucu**
```javascript
const analysisResult = analyzeFormatTableForArchive(activeSheet, sheetName);
```

**Yazılan Sayfa:**
- **"Format Tablo Raporları"** sayfası (Temsilci dosyasında)
- Satır 4'ten itibaren veri yazılır
- Satır 1-3: Başlık ve açıklama

---

### 3️⃣ `addDatasetReportToManagerSync()` - Yönetici Dosyasına Ekleme

**Konum:** `src/managers/manager-sync.js` (Satır 4168-4270)

**Veri Kaynakları:**

#### ✅ **`analysisResult` Parametresi** (Zaten Hesaplanmış)
```javascript
function addDatasetReportToManagerSync(uzmanKodu, sheetName, tarih, analysisResult, archiveFileId, archiveFileName)
```

**İçerik:**
```javascript
{
  totalContacts: 100,
  aramaYapilan: 85,
  randevuAlindi: 12,
  toplantiYapildi: 8,
  satisYapildi: 2,
  basariPuani: 12.0,
  tumuAranmis: true
}
```

**Yazılan Sayfa:**
- **"Dataset Raporları"** sayfası (Yönetici dosyasında)
- `MANAGER_FILE_ID` ile açılan dosyaya yazılır

---

## 🔄 Veri Akış Şeması

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FORMAT TABLO SAYFASI (Temsilci Dosyası)                   │
│    ├─ Aktivite kolonu → aramaYapilan                         │
│    ├─ Aktivite Tarihi kolonu → aktiviteTarihiDolu            │
│    ├─ Log kolonu → logDolu                                    │
│    └─ Kaynak kolonu → Eşleştirme için                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. RANDEVULARIM SAYFASI (Temsilci Dosyası)                   │
│    ├─ Kaynak kolonu = Format Tablo adı                       │
│    └─ Randevu durumu → randevuAlindi                         │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. TOPLANTILARIM SAYFASI (Temsilci Dosyası)                  │
│    ├─ Kaynak kolonu = Format Tablo adı                       │
│    ├─ Toplantı Sonucu → toplantiYapildi                      │
│    └─ Toplantı Sonucu = "Satış Yapıldı" → satisYapildi       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. analyzeFormatTableForArchive()                             │
│    └─ Tüm metrikleri hesapla ve döndür                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
        ┌──────────────────┴──────────────────┐
        ↓                                      ↓
┌───────────────────────┐        ┌──────────────────────────┐
│ 5a. reportFormatTable()│        │ 5b. addDatasetReportTo   │
│    (Temsilci Dosyası)  │        │    ManagerSync()         │
│                        │        │    (Yönetici Dosyası)    │
│ └─ Format Tablo        │        │                          │
│    Raporları sayfasına │        │ └─ Dataset Raporları     │
│    yaz                 │        │    sayfasına yaz         │
└───────────────────────┘        └──────────────────────────┘
```

---

## 📊 Veri Eşleştirme Mantığı

### 🔗 "Kaynak" Kolonu Eşleştirmesi

**Format Tablo'dan:**
- Format Tablo sayfasının **adı** (örn: "Format Tablo 1")
- Bu ad, diğer sayfalardaki **"Kaynak"** kolonuyla eşleştirilir

**Randevularım'da:**
```javascript
kaynak === sheetName && (
  durum === 'Randevu Alındı' ||
  durum === 'Randevu Teyitlendi' ||
  durum === 'İleri Tarih Randevu'
)
```

**Toplantılarım'da:**
```javascript
kaynak === sheetName  // Tüm toplantılar
kaynak === sheetName && sonuc === 'Satış Yapıldı'  // Sadece satışlar
```

---

## ⚡ Performance Optimizasyonları

### ✅ Batch Operations
```javascript
// ❌ YAVAŞ: Her satır ayrı okuma
for (let i = 2; i <= 1000; i++) {
  const row = sheet.getRange(i, 1, 1, 10).getValues();
}

// ✅ HIZLI: Tüm veriyi tek seferde okuma
const allData = sheet.getDataRange().getValues();
```

### ✅ JavaScript Filter (Hafızada İşleme)
```javascript
// Google Sheets API çağrısı YOK!
randevuAlindi = randevuRows.filter(r => {
  return kaynak === sheetName && durum === 'Randevu Alındı';
}).length;
```

---

## 🎯 Özet

| Fonksiyon | Veri Kaynağı | Okunan Kolonlar | Hesaplanan Metrikler |
|-----------|--------------|-----------------|----------------------|
| `analyzeFormatTableForArchive()` | **Format Tablo** | Aktivite, Aktivite Tarihi, Log, Kaynak | `totalContacts`, `aramaYapilan`, `aktiviteTarihiDolu`, `logDolu`, `tumuAranmis` |
| | **Randevularım** | Kaynak, Randevu durumu | `randevuAlindi` |
| | **Toplantılarım** | Kaynak, Toplantı Sonucu | `toplantiYapildi`, `satisYapildi` |
| `reportFormatTable()` | **Aktif Sayfa** | Format Tablo verileri | `analysisResult` (yukarıdaki fonksiyondan) |
| | **Dosya Adı** | - | `uzmanKodu` (otomatik tespit) |
| `addDatasetReportToManagerSync()` | **Parametre** | `analysisResult` | Zaten hesaplanmış veriler |

---

## 🔍 Önemli Notlar

1. **"Kaynak" Kolonu Kritik:** Format Tablo adı ile diğer sayfalardaki "Kaynak" kolonu eşleşmeli!
2. **Batch Operations:** Tüm veriler tek seferde okunur (performans için kritik)
3. **JavaScript Filter:** Eşleştirme işlemleri hafızada yapılır (API çağrısı yok)
4. **Fırsatlarım Kullanılmıyor:** Şu an kod içinde tanımlı ama kullanılmıyor
5. **Temsilci Kodu:** Dosya adından otomatik tespit edilir, bulunamazsa kullanıcıya sorulur

---

**Son Güncelleme:** 2025-01-08
**Dokümantasyon:** Atlas CRM Agent

