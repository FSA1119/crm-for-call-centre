# 📊 Data Pool Operations - Ham Veri → Format Tablo İşlemleri

Bu dosya, **merkezi Data Pool** sisteminde Ham Veri'yi Format Tablo'ya dönüştürme ve analiz etme kurallarını içerir.

**Amaç:** Temsilci dosyalarından (`backend.js`) Ham Veri → Format Tablo işlemlerini çıkarıp merkezi bir yerde toplamak.

---


## 🔄 Ham Veri Otomatik İşleme Süreci

### Otomatik Tip Tespiti

Sistem smart-column-mapping.js dosyasındaki detectRawDataType() fonksiyonu ile ham veri tipini otomatik tespit eder:

**Algoritma:**
1. Ham Veri sayfasının header'larını oku
2. Her tip için eşleşme oranı hesapla (case-insensitive)
3. %70+ eşleşme varsa → Tip tespit edildi
4. Eşleşme yoksa → Hata ver

### Menü Entegrasyonu

**Fonksiyon:** convertRawToFormatTable()

**Çalışma Mantığı:**
1. Aktif sayfayı kontrol et (Ham Veri mi?)
2. detectRawDataType() ile tipi tespit et
3. İlgili mapping kuralını uygula
4. Format Tablo oluştur (26 sütun)
5. Styling ve validation uygula

**Menü Konumu:**
- Menü: "📊 Data Pool İşlemleri"
- Alt menü: "🔄 Ham Veri → Format Tablo"

**Tek Buton - 3 Tip Desteği:**
- A_EXTRAKTOR → Otomatik algılar ve dönüştürür
- B_SCRAPPER → Otomatik algılar ve dönüştürür
- C_APIFY → Otomatik algılar ve dönüştürür

---


## 📋 İçindekiler

1. [Ham Veri → Format Tablo Mapping Kuralları](#1-ham-veri--format-tablo-mapping-kuralları)
2. [Format Tablo Analiz Kuralları](#2-format-tablo-analiz-kuralları)
3. [Format Tablo Styling ve Validation Kuralları](#3-format-tablo-styling-ve-validation-kuralları)
4. [Temsilciye Gönderme Kuralları](#4-temsilciye-gönderme-kuralları)

---

## 1. Ham Veri → Format Tablo Mapping Kuralları

### 1.1. Format Tablo Yapısı (26 Sütun - SABİT)

Format Tablo **her zaman** aynı 26 sütuna sahiptir. Sütun sırası **ASLA** değişmez:

```javascript
const FORMAT_TABLE_HEADERS = [
  'Kod',              // A - Temsilci kodu (otomatik)
  'Keyword',          // B
  'Location',         // C
  'Company name',     // D - ⚠️ ZORUNLU
  'Category',         // E
  'Website',          // F
  'CMS Adı',          // G
  'CMS Grubu',        // H
  'Phone',            // I - ⚠️ ZORUNLU
  'Yetkili Tel',      // J
  'Mail',             // K
  'İsim Soyisim',     // L
  'Aktivite',         // M - Dropdown
  'Aktivite Tarihi',  // N - Datepicker
  'Yorum',            // O
  'Yönetici Not',     // P
  'E-Ticaret İzi',    // Q
  'Site Hızı',         // R
  'Site Trafiği',      // S
  'Log',               // T
  'Toplantı formatı',  // U - Dropdown
  'Address',           // V
  'City',              // W
  'Rating count',      // X
  'Review',            // Y - Özel format: "R{value}"
  'Maplink'            // Z
];
```

### 1.2. Ham Veri Tipleri

Sistem 3 farklı Ham Veri tipini destekler:

#### A_EXTRAKTOR
```javascript
headers: [
  'Keyword', 'Location', 'Company name', 'Category', 'Website',
  'Phone', 'Email 1', 'Email 2', 'Email 3', 'Address', 'City',
  'State', 'Pincode', 'Rating count', 'Review', 'Cid'
]
```

#### B_SCRAPPER
```javascript
headers: [
  'Website', 'Title', 'Email', 'Phone', 'WhatsApp', 'Category',
  'Description', 'Address', 'Ratings', 'Raviews', 'Latitude',
  'Longitude', 'CID', 'Map Link', 'Country', 'Searched Keyword'
]
```

#### C_APIFY
```javascript
headers: [
  'title', 'totalScore', 'reviewsCount', 'street', 'city', 'state',
  'countryCode', 'website', 'phone', 'categoryName', 'url'
]
```

### 1.3. Mapping Kuralları

#### Dinamik Mapping Algoritması

1. **Case-insensitive arama:** Büyük/küçük harf duyarsız
2. **Tam eşleşme öncelikli:** Önce tam eşleşme aranır
3. **Kısmi eşleşme:** Tam eşleşme yoksa kısmi eşleşme denenir
4. **İlk bulunan kullanılır:** Çoklu eşleşme durumunda ilk bulunan kullanılır

#### Özel Mapping Kuralları

| Ham Veri Sütunu | Format Tablo Sütunu | Notlar |
|-----------------|---------------------|--------|
| `Email 1`, `Email`, `email` | `Mail` | İlk e-posta kullanılır |
| `Title`, `title` | `Company name` | B_SCRAPPER ve C_APIFY için |
| `Searched Keyword` | `Keyword` | B_SCRAPPER için |
| `Cid`, `CID` | `Maplink` | Google Maps CID formatına dönüştürülür |
| `Review`, `Raviews`, `totalScore` | `Review` | Özel format: `R{value}` |

### 1.4. Özel Dönüşümler

#### Review Kolonu
```javascript
// Tarih ise: "R{month}.{day}" formatına çevir
if (reviewValue instanceof Date) {
  const month = reviewValue.getMonth() + 1;
  const day = reviewValue.getDate();
  reviewValue = `${month}.${day}`;
}
mappedRow[reviewIndex] = `R${String(reviewValue)}`;
```

#### Kod Kolonu
```javascript
// Spreadsheet adından temsilci kodunu çıkar
// Örnek: "NT 002 - Neslihan Türk" → "NT 002"
const sheetName = SpreadsheetApp.getActiveSpreadsheet().getName();
const beforeTire = sheetName.split(' - ')[0];
mappedRow[kodIndex] = beforeTire || 'Unknown';
```

#### Maplink Kolonu
```javascript
// CID'den Google Maps linki oluştur
const cidIndex = hamVeriHeaders.indexOf('Cid');
if (cidIndex !== -1 && row[cidIndex]) {
  const cid = row[cidIndex];
  const cidMatch = cid.match(/cid=(\d+)/);
  if (cidMatch) {
    mappedRow[maplinkIndex] = `https://maps.google.com/?cid=${cidMatch[1]}`;
  } else {
    mappedRow[maplinkIndex] = `https://maps.google.com/?cid=${cid}`;
  }
}
```

#### Log Kolonu
```javascript
// Otomatik log ekle
mappedRow[logIndex] = `Ham veri'den aktarıldı - ${new Date().toLocaleString('tr-TR')}`;
```

#### Aktivite ve Aktivite Tarihi
```javascript
// Boş bırak (kullanıcı doldurur)
mappedRow[aktiviteIndex] = '';
mappedRow[aktiviteTarihiIndex] = '';
```

### 1.5. Zorunlu Alan Kontrolü

**KURAL:** `Company name` (D kolonu) ve `Phone` (I kolonu) **ZORUNLU** alanlardır.

```javascript
// Bu alanlar boş olan satırlar atlanır
const companyName = mappedRow[3]; // D kolonu
const phone = mappedRow[8];        // I kolonu

if (!companyName || !phone) {
  // Satırı atla
  continue;
}
```

### 1.6. Türkçe Karakter Dönüşümü

Ham Veri'deki URL-encoded Türkçe karakterler decode edilir:

```javascript
function decodeTurkishText(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  try {
    // URL decoding
    let decoded = decodeURIComponent(text);
    
    // Türkçe karakter replacements
    const turkishReplacements = {
      '%C4%B0': 'İ', '%C4%B1': 'ı',
      '%C3%96': 'Ö', '%C3%B6': 'ö',
      '%C3%9C': 'Ü', '%C3%BC': 'ü',
      '%C5%9E': 'Ş', '%C5%9F': 'ş',
      '%C4%9E': 'Ğ', '%C4%9F': 'ğ',
      '%C3%87': 'Ç', '%C3%A7': 'ç'
    };
    
    Object.keys(turkishReplacements).forEach(encoded => {
      decoded = decoded.replace(new RegExp(encoded, 'g'), turkishReplacements[encoded]);
    });
    
    return decoded;
  } catch (error) {
    console.warn('Error decoding text:', text, error);
    return text; // Orijinal metni döndür
  }
}
```

### 1.7. Batch Operations (ZORUNLU!)

**KURAL:** ASLA loop içinde API call yapma!

```javascript
// ❌ YANLIŞ (1000 API call - 100 saniye!)
for (let i = 0; i < 1000; i++) {
  const value = sheet.getRange(i + 2, 1).getValue();
  processValue(value);
}

// ✅ DOĞRU (1 API call - 0.5 saniye!)
const values = sheet.getRange(2, 1, 1000, 1).getValues();
values.forEach(row => processValue(row[0]));
```

**Kazanç:** 200x daha hızlı!

---

## 2. Format Tablo Analiz Kuralları

### 2.1. Mükerrer Bulma (Company name + Phone)

**Algoritma:**
1. Her satır için `Company name` (lowercase) + `Phone` (sadece rakamlar, min 7 hane) kombinasyonu oluştur
2. Aynı kombinasyona sahip satırları grupla
3. 2 veya daha fazla satır varsa → Mükerrer grup

```javascript
// Key oluşturma
const company = (row[companyIdx] || '').toString().trim();
const phoneRaw = phoneIdx !== -1 ? (row[phoneIdx] || '').toString() : '';
const phoneDigits = phoneRaw.replace(/\D+/g, ''); // Sadece rakamlar
const phoneKey = phoneDigits.length >= 7 ? phoneDigits : ''; // Min 7 hane
const key = `${company.toLowerCase()}|${phoneKey}`;

// Gruplama
const keyToRows = new Map();
keyToRows.get(key).push(rowNumber);

// Mükerrer grupları bul
const duplicates = [...keyToRows.entries()].filter(([, rows]) => rows.length > 1);
```

**Rapor Formatı:**
- Key: `{company}|{phone}`
- Şirket: Orijinal company name
- Telefon: Orijinal phone
- Tekrar Sayısı: Grup içindeki satır sayısı
- Satırlar: Satır numaraları (virgülle ayrılmış)

### 2.2. Mükerrer Silme Kuralları

#### 2.2.1. Onaylı Silme (`deleteDuplicateRowsWithConfirm`)

**Kural:** Her grupta **en eski kayıt kalır**, diğerleri silinir.

```javascript
// Her grup için
const sortedRows = [...rowNums].sort((a, b) => a - b); // Küçükten büyüğe
const rowToKeep = sortedRows[0];        // En eski (ilk satır)
const rowsToDelete = sortedRows.slice(1); // Diğerleri silinecek

// Güvenlik: Kalacak satırları kaydet
rowsToKeep.add(rowToKeep);

// Silme: Yüksekten düşüğe sırala (satır numaraları değişmeyecek)
finalRowsToDelete.sort((a, b) => b - a);
for (const rowNum of finalRowsToDelete) {
  if (!rowsToKeep.has(rowNum)) {
    sheet.deleteRow(rowNum);
  }
}
```

**Özet Mesaj Formatı:**
```
Mükerrer tarama sonucu:

• Toplam tekrar grup: {totalGroups}
• Silinecek toplam satır: {totalRows}
• Korunacak kayıt: {rowsToKeep.size}

Gruplar:
1. "{company}" ({count} adet):
   ✅ KALACAK: Satır {keepRow}
   🗑️ SİLİNECEK: Satırlar {deleteRows.join(', ')}
```

#### 2.2.2. Otomatik Silme (`deleteAllDuplicatesAuto`)

**Kural:** Her gruptaki **TÜM satırlar** silinir (hiçbiri tutulmaz).

```javascript
// TÜM satırları silinecek listesine ekle
for (const [key, rowNums] of dupGroups) {
  rowsToDelete.push(...rowNums);
}

// Tek seferde onay al
const confirm = ui.alert('🗑️ Mükerrerleri Hepsini Sil', summaryMsg, ui.ButtonSet.YES_NO);
```

### 2.3. Telefonu Olmayanları Silme

**Kural:** `Phone` kolonu boş veya geçersiz (7'den az rakam) olan satırlar silinir.

```javascript
const phoneRaw = row[phoneIdx];
const phoneStr = (phoneRaw || '').toString();
const digits = phoneStr.replace(/\D+/g, ''); // Sadece rakamlar
const hasValidPhone = digits.length >= 7;    // Min 7 hane

if (!hasValidPhone) {
  rowsToDelete.push(rowNumber);
}
```

**Kapsam:**
- Seçim varsa: Sadece seçili satırlar
- Seçim yoksa: Tüm veri

### 2.4. Websitesi Olmayanları Silme

**Kural:** `Website` kolonu boş olan satırlar silinir.

```javascript
const websiteRaw = (row[websiteIdx] || '').toString().trim();
const hasWebsite = websiteRaw.length > 0;

if (!hasWebsite) {
  rowsToDelete.push(startRow + i);
}
```

**Kapsam:**
- Seçim varsa: Sadece seçili satırlar
- Seçim yoksa: Tüm veri

### 2.5. URL Tekrarlarını Silme

**Algoritma:**
1. Her satır için `Website` kolonunu normalize et (lowercase, trim)
2. Aynı URL'ye sahip satırları grupla
3. Her grupta **ilk satır kalır**, diğerleri silinir

```javascript
// URL normalize
const url = (data[i][websiteIdx] || '').toString().trim().toLowerCase();

// Gruplama
const urlToRows = new Map();
urlToRows.get(url).push(rowNum);

// Mükerrer URL grupları (2 veya daha fazla satır)
const dupGroups = [...urlToRows.entries()].filter(([, rows]) => rows.length > 1);

// Her grupta ilk satırı tut
for (const [url, rowNums] of dupGroups) {
  const sortedRows = [...rowNums].sort((a, b) => a - b);
  const keepRow = sortedRows[0];      // İlk satır
  const deleteRows = sortedRows.slice(1); // Diğerleri
  rowsToDelete.push(...deleteRows);
}
```

### 2.6. URL Normalize Etme

**Kural:** Website kolonundaki URL'leri standart formata çevir.

```javascript
function normalizeUrl(url) {
  if (!url) return '';
  let cleaned = String(url).trim();
  if (!cleaned) return '';
  
  // Boşlukları temizle
  cleaned = cleaned.replace(/\s+/g, '');
  
  // Zaten normalize edilmişse atla
  if (/^https?:\/\//i.test(cleaned)) {
    cleaned = cleaned.replace(/\/+$/, ''); // Trailing slash temizle
    return cleaned;
  }
  
  // http/https yoksa ekle
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  
  // Trailing slash temizle
  cleaned = cleaned.replace(/\/+$/, '');
  
  return cleaned;
}
```

---

## 3. Format Tablo Styling ve Validation Kuralları

### 3.1. Styling Kuralları

```javascript
function applyFormatTableStyling(sheet) {
  // Header styling
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#4285f4');  // Mavi
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
}
```

### 3.2. Data Validation Kuralları

#### 3.2.1. Aktivite Dropdown

**Kolon:** `Aktivite` (M kolonu)

**Seçenekler:**
```javascript
const ACTIVITY_OPTIONS = [
  'Randevu Alındı',
  'İleri Tarih Randevu',
  'Yeniden Aranacak',
  'Bilgi Verildi',
  'Fırsat İletildi',
  'İlgilenmiyor',
  'Ulaşılamadı',
  'Geçersiz Numara',
  'Kurumsal'
];
```

**Validation Kuralı:**
```javascript
const aktiviteRule = SpreadsheetApp.newDataValidation()
  .requireValueInList(ACTIVITY_OPTIONS, true)
  .setAllowInvalid(true) // Geçersiz değerlere izin ver
  .build();

// Minimum 1000 satır için validation uygula
const minRows = 1000;
const lastRow = Math.max(sheet.getLastRow(), 2);
const rowsToValidate = Math.max(minRows, lastRow - 1);
const validationRange = sheet.getRange(2, aktiviteIndex, rowsToValidate, 1);

// Önce temizle + flush
validationRange.clearDataValidations();
SpreadsheetApp.flush(); // ✅ ZORUNLU!

// Sonra ekle + flush
validationRange.setDataValidation(aktiviteRule);
SpreadsheetApp.flush(); // ✅ ZORUNLU!
```

#### 3.2.2. Toplantı Formatı Dropdown

**Kolon:** `Toplantı formatı` (U kolonu)

**Seçenekler:**
```javascript
const MEETING_FORMAT_OPTIONS = [
  'Yüz Yüze',
  'Online',
  'Telefon'
];
```

**Validation Kuralı:**
```javascript
const toplantiRule = SpreadsheetApp.newDataValidation()
  .requireValueInList(MEETING_FORMAT_OPTIONS, true)
  .setAllowInvalid(true)
  .build();

// Aynı şekilde uygula (clear + flush → set + flush)
```

### 3.3. Özel Format Kuralları

#### Review Kolonu (Y kolonu)
```javascript
// Text formatına zorla (R{value} formatı için)
const reviewColumnIndex = formatTableColumns.indexOf('Review') + 1;
if (reviewColumnIndex > 0 && mappedData.length > 0) {
  const reviewRange = newSheet.getRange(2, reviewColumnIndex, mappedData.length, 1);
  reviewRange.setNumberFormat('@'); // Text format
}
```

#### Kod Kolonu (A kolonu)
```javascript
// Text formatına zorla (temsilci kodu için)
const kodColumnIndex = formatTableColumns.indexOf('Kod') + 1;
if (kodColumnIndex > 0 && mappedData.length > 0) {
  const kodRange = newSheet.getRange(2, kodColumnIndex, mappedData.length, 1);
  kodRange.setNumberFormat('@'); // Text format
}
```

### 3.4. flush() Kuralı (KRİTİK!)

**KURAL:** Validation işlemlerinden **HEMEN SONRA** `flush()` çağrılmalı!

```javascript
// ✅ DOĞRU
range.clearDataValidations();
SpreadsheetApp.flush(); // ← ZORUNLU!
range.setDataValidation(validation);
SpreadsheetApp.flush(); // ← ZORUNLU!

// ❌ YANLIŞ
range.clearDataValidations();
range.setDataValidation(validation); // flush() yok → Validation uygulanmayabilir!
```

---

## 4. Temsilciye Gönderme Kuralları

### 4.1. Manuel Gönderme

**KURAL:** Format Tablo hazır olduğunda, kullanıcı **manuel olarak** ilgili temsilciye gönderir.

**Süreç:**
1. Data Pool'da Format Tablo hazır
2. Kullanıcı Format Tablo'yu kontrol eder
3. Kullanıcı Format Tablo'yu kopyalar/taşır
4. Temsilci dosyasına yapıştırır

**Not:** Bu işlem **otomatik değildir**. Kullanıcı kontrolü gerektirir.

### 4.2. Format Tablo Tespiti

**Kural:** Format Tablo sayfaları şu şekilde tespit edilir:

```javascript
function isFormatTable(sheet) {
  const sheetName = sheet.getName();
  
  // Hariç tutulan sayfalar
  const excludedSheets = [
    'Ham veri', 'ham veri',
    'Randevularım', 'Fırsatlarım', 'Toplantılarım',
    'Raporlarım', 'Günlük Rapor', 'Haftalık Rapor', 'Detaylı Rapor',
    'Config', 'config', 'CONFIG'
  ];
  
  // Hariç tutulan sayfalar Format Tablo değildir
  if (excludedSheets.includes(sheetName)) {
    return false;
  }
  
  // Diğer tüm sayfalar Format Tablo'dur
  return true;
}
```

### 4.3. CMS Detector (Temsilci Dosyasında Kalacak)

**Not:** CMS Detector (`cms_detector.js`) temsilci dosyalarında kalacaktır. Temsilciler Format Tablo'dan arama yapabilmek için bu fonksiyona ihtiyaç duyarlar.

---

## 📊 Özet: Çıkarılacak Fonksiyonlar

### backend.js'den Çıkarılacak Fonksiyonlar:

1. ✅ `createFormatTable()` - Format Tablo oluşturma
2. ✅ `mapHamVeriToFormatTable()` - Mapping kuralları
3. ✅ `applyFormatTableStyling()` - Styling kuralları
4. ✅ `setDataValidation()` - Validation kuralları (Format Tablo için)
5. ✅ `findDuplicatesInFormatTable()` - Mükerrer bulma
6. ✅ `deleteDuplicateRowsWithConfirm()` - Mükerrer silme (onaylı)
7. ✅ `deleteAllDuplicatesAuto()` - Tüm mükerrerleri silme
8. ✅ `deleteRowsWithoutPhone()` - Telefonu olmayanları silme
9. ✅ `deleteRowsWithoutWebsite()` - Websitesi olmayanları silme
10. ✅ `urlTekrarlariniSil()` - URL tekrarlarını silme
11. ✅ `urlTemizleTumunu()` - URL normalize etme
12. ✅ `refreshFormatTableValidation()` - Validation yenileme
13. ✅ `decodeTurkishText()` - Türkçe karakter decode
14. ✅ `isFormatTable()` - Format Tablo tespiti (Data Pool için)

### backend.js'de Kalacak Fonksiyonlar:

1. ✅ `updateFormatTableRow()` - Format Tablo güncelleme (temsilci işlemi)
2. ✅ `applyFormatTableColorCoding()` - Renklendirme (temsilci işlemi)
3. ✅ `takeAppointment()` - Randevu alma (Format Tablo'dan)
4. ✅ `takeOpportunity()` - Fırsat alma (Format Tablo'dan)
5. ✅ `takeMeeting()` - Toplantı alma (Format Tablo'dan)
6. ✅ `takeSale()` - Satış alma (Format Tablo'dan)
7. ✅ CMS Detector referansları (zaten ayrı dosyada, `src/managers/cms_detector.gs`)
   - **NOT:** CMS Detector fonksiyonları taşınmayacak, sadece referans kalacak

---

## 🎯 Best Practices

### 1. Batch Operations
- ✅ `getValues()` tek seferde kullan
- ✅ `setValues()` tek seferde kullan
- ❌ Loop içinde API call yapma

### 2. flush() Kullanımı
- ✅ `clearDataValidations()` sonrası → `flush()` ZORUNLU
- ✅ `setDataValidation()` sonrası → `flush()` ZORUNLU
- ❌ Her küçük işlemde `flush()` yapma (yavaş olur)

### 3. Error Handling
- ✅ Her fonksiyonda `try-catch` kullan
- ✅ Structured logging (JSON format)
- ✅ Kullanıcıya açıklayıcı mesajlar

### 4. Performance
- ✅ Tek işlem: <1s
- ✅ Batch işlem: <3s
- ✅ Rapor: <5s

---

## 📝 Notlar

- Bu kurallar **merkezi Data Pool** sisteminde uygulanacaktır
- Temsilci dosyaları (`backend.js`) sadece **Format Tablo hazır** durumundan sonraki işlemlere odaklanacaktır
- **CMS Detector TAŞINMAYACAK:**
  - Zaten ayrı dosyada (`src/managers/cms_detector.gs`)
  - `backend.js`'te sadece **referans** bırakılacak
  - Temsilciler Format Tablo'dan arama yapabilmek için CMS Detector'a ihtiyaç duyarlar
  - Olduğu yerde kalacak (taşınmayacak)
