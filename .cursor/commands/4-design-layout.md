# Tasarım ve Layout (Atlas Design Mode)
Sen şimdi TASARIM ve LAYOUT UZMANI modundasın.
## Görevin
Google Sheets sayfalarını Material Design standartlarına göre tasarla.
## RENK SİSTEMİ
### Primary Colors (Material Design)
```javascript
const COLORS = {
  success: '#34A853',      // 🟢 Yeşil - Başarı
  warning: '#FBBC04',      // 🟡 Sarı - Uyarı
  error: '#EA4335',        // 🔴 Kırmızı - Hata
  info: '#4285F4',         // 🔵 Mavi - Bilgi
  
  lightGreen: '#E8F5E8',   // Açık yeşil (arka plan)
  lightYellow: '#FFF9E6',  // Açık sarı (arka plan)
  lightRed: '#FCE8E6',     // Açık kırmızı (arka plan)
  white: '#FFFFFF',        // Beyaz (boş)
  lightGray: '#F5F5F5'     // Header
};
Renk Kuralları
Başarı → Yeşil
Uyarı → Sarı
Hata → Kırmızı
Boş hücre → Beyaz (renklendirme ama batch!)
BATCH RENKLENDIRME (Zorunlu!)
❌ YAVAŞ:


for (let i = 2; i <= 151; i++) {
  sheet.getRange(i, 1, 1, 10).setBackground('#E8F5E8');
}
// 150 API call = 15 saniye!
✅ HIZLI:


// 1. Hafızada hesapla
const data = sheet.getRange(2, 1, 150, 10).getValues();
const colors = data.map(row => 
  row.map(cell => {
    if (!cell) return '#FFFFFF';
    if (cell === 'Randevu Alındı') return '#E8F5E8';
    return '#FFFFFF';
  })
);
// 2. Tek seferde yaz (1 API call = 0.5s!)
sheet.getRange(2, 1, 150, 10).setBackgrounds(colors);
Kazanç: 30x daha hızlı!

PRENSİP: Calculate in memory, write once

SAYFA BOYUTLARI
Google Sheets Limitleri

const LIMITS = {
  maxCells: 5000000,        // 5 milyon hücre
  maxColumns: 18278,        // Z kolonu sonrası
  maxCellSize: 50000        // Hücre başı 50K karakter
};
Önerilen Boyutlar

const RECOMMENDED = {
  columns: 20,              // Max 20 kolon
  visibleRows: 100,         // İlk görünüm
  freezeRows: 1,            // Header sabitle
  freezeColumns: 2,         // İlk 2 kolon sabitle
  
  columnWidth: {
    narrow: 100,            // ID, Kod
    medium: 150,            // İsim, Telefon
    wide: 200,              // Açıklama
    auto: -1                // Otomatik
  }
};
HEADER TASARIMI

function formatHeader(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  
  headerRange.setBackground('#F5F5F5');        // Açık gri
  headerRange.setFontWeight('bold');           // Kalın
  headerRange.setFontSize(11);                 // 11pt
  headerRange.setHorizontalAlignment('center'); // Ortala
  headerRange.setVerticalAlignment('middle');
  
  // Freeze
  sheet.setFrozenRows(1);
}
KOLON GENİŞLİKLERİ

function setColumnWidths(sheet) {
  const widths = {
    1: 80,    // Kod
    2: 120,   // Kaynak
    3: 180,   // Şirket
    4: 130,   // Telefon
    5: 180,   // Email
    6: 200,   // Açıklama
    7: 110,   // Tarih
    8: 120    // Temsilci
  };
  
  Object.entries(widths).forEach(([col, width]) => {
    sheet.setColumnWidth(parseInt(col), width);
  });
}
CONDITIONAL FORMATTING

function applyConditionalFormatting(sheet, column) {
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(2, column, lastRow - 1, 1);
  
  // "Randevu Alındı" = Yeşil
  const rule1 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Randevu Alındı')
    .setBackground('#E8F5E8')
    .setRanges([range])
    .build();
  
  // "İlgilenmedi" = Kırmızı
  const rule2 = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('İlgilenmedi')
    .setBackground('#FCE8E6')
    .setRanges([range])
    .build();
  
  const rules = sheet.getConditionalFormatRules();
  rules.push(rule1, rule2);
  sheet.setConditionalFormatRules(rules);
}
DATA VALIDATION (Dropdown)

function createDropdown(sheet, column, values) {
  const lastRow = sheet.getLastRow();
  const range = sheet.getRange(2, column, lastRow - 1, 1);
  
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .build();
  
  range.setDataValidation(rule);
}
// Kullanım:
createDropdown(sheet, 5, [
  'Randevu Alındı',
  'İleri Tarih',
  'Bilgi Verildi',
  'İlgilenmedi'
]);
TAM SAYFA DÜZENI

function setupPageLayout(sheet, config) {
  // 1. Header
  formatHeader(sheet);
  
  // 2. Kolon genişlikleri
  setColumnWidths(sheet);
  
  // 3. Conditional formatting
  applyConditionalFormatting(sheet, config.statusColumn);
  
  // 4. Dropdown
  createDropdown(sheet, config.statusColumn, config.statusValues);
  
  // 5. Freeze
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(config.freezeColumns || 2);
  
  console.log('✅ Sayfa düzeni tamamlandı');
}
// Kullanım:
setupPageLayout(sheet, {
  statusColumn: 5,
  statusValues: ['Randevu Alındı', 'İlgilenmedi'],
  freezeColumns: 2
});
ÇIKTI FORMATI
🎨 TASARIM TAMAMLANDI

📊 UYGULANAN:
  ✅ Header formatı
  ✅ Kolon genişlikleri (8 kolon)
  ✅ Conditional formatting (2 kural)
  ✅ Dropdown (4 değer)
  ✅ Freeze (1 satır, 2 kolon)

⏱️ PERFORMANS:
  Renklendirme: 0.8s (150 satır)
  ✅ Hedef: <2s

🎨 RENK PALETİ:
  🟢 #E8F5E8 - Başarı
  🟡 #FFF9E6 - Uyarı
  🔴 #FCE8E6 - Hata

📐 BOYUTLAR:
  Kolonlar: 8
  Freeze: 1 satır, 2 kolon
KULLANIM ÖRNEĞİ
/design-layout

Sheet: Randevularım
Durum kolonu: 5 (E)
Freeze: 2 kolon
Agent otomatik olarak:

Header formatlar
Kolon genişliklerini ayarlar
Renklendirme kuralları ekler
Dropdown oluşturur
@RENK_KODLARI.md @docs/sayfa_kolonlari.md


Kolon genişliklerini ayarlar
Renklendirme kuralları ekler
Dropdown oluşturur
@RENK_KODLARI.md @docs/sayfa_kolonlari.md



## 🔄 HAM VERİ OTOMATİK İŞLEME SÜRECİ
### Desteklenen Ham Veri Tipleri
Sistem **3 farklı ham veri tipini** otomatik algılar ve Format Tablo'ya dönüştürür:
#### **A_EXTRAKTOR** (16 sütun)
```javascript
headers: [
  'Keyword', 'Location', 'Company name', 'Category', 'Website',
  'Phone', 'Email 1', 'Email 2', 'Email 3', 'Address', 'City',
  'State', 'Pincode', 'Rating count', 'Review', 'Cid'
]
```

####  **B_SCRAPPER** (16 sütun)
```javascript

headers: [
  'Website', 'Title', 'Email', 'Phone', 'WhatsApp', 'Category',
  'Description', 'Address', 'Ratings', 'Raviews', 'Latitude',
  'Longitude', 'CID', 'Map Link', 'Country', 'Searched Keyword'
]
```

#### **C_APIFY** (11 sütun)
```javascript

headers: [
  'title', 'totalScore', 'reviewsCount', 'street', 'city', 'state',
  'countryCode', 'website', 'phone', 'categoryName', 'url'
]
```


 ### Otomatik Tip Tespiti

Dosya: src/shared/smart-column-mapping.js

Fonksiyon: detectRawDataType(headers)

Algoritma:

Ham Veri sayfasının header'larını oku
Her tip için eşleşme oranı hesapla (case-insensitive)
%70+ eşleşme varsa → Tip tespit edildi
Eşleşme yoksa → Hata ver

// Örnek kullanım:
const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
const detectedType = detectRawDataType(headers);
if (detectedType) {
  console.log(`✅ Ham veri tipi: ${detectedType.type}`);
  // A_EXTRAKTOR, B_SCRAPPER veya C_APIFY
}
Menü Entegrasyonu
Fonksiyon: convertRawToFormatTable()

Menü Konumu:

"📊 Data Pool İşlemleri" → "🔄 Ham Veri → Format Tablo"
Çalışma Mantığı:

Aktif sayfayı kontrol et (Ham Veri mi?)
detectRawDataType() ile tipi otomatik tespit et
İlgili mapping kuralını uygula
Format Tablo oluştur (26 sütun - SABİT)
Styling ve validation uygula
Tek Buton - 3 Tip Desteği:

✅ A_EXTRAKTOR → Otomatik algılar, dönüştürür
✅ B_SCRAPPER → Otomatik algılar, dönüştürür
✅ C_APIFY → Otomatik algılar, dönüştürür
İlgili Dosyalar
Referans:

@src/shared/smart-column-mapping.js - Ham veri işleme mantığı
@.cursor/rules/data-pool-operations.md - İşlem kuralları
@docs/sayfa_kolonlari.md - Format Tablo yapısı


## 🔄 HAM VERİ → FORMAT TABLO DÖNÜŞÜMÜ (DİNAMİK)
### Amaç
Farklı kaynaklardan gelen ham veriyi standart Format Tablo yapısına dönüştür.
Format Tablo yapısı SABİT kalmalı, Fırsatlarım/Randevularım ile uyumlu olmalı.
---
### Temel Kurallar
1. **Ham veri kaynağı farklı olabilir**
   - Kaynak 1, 2, 3... farklı sütun yapıları olabilir
   - Sütun isimleri farklı olabilir (Şirket/Firma/Company)
   - Sütun sayısı farklı olabilir
2. **Format Tablo yapısı SABİT**
   - Her zaman aynı 26 sütun (A-Z)
   - Sütun sırası ASLA değişmez
   - Fırsatlarım/Randevularım ile uyumlu
3. **Sütun mapping dinamik**
   - Ham veri sütunları otomatik algılanır
   - Benzer isimler eşleştirilir
   - Eksik alanlar boş bırakılır
4. **Satır yapısı korunmalı**
   - Temsilci → Yönetici senkronizasyonunda
   - Satırlar üst üste gelmemeli
---
### Format Tablo Yapısı (SABİT)
**Referans:** `@docs/sayfa_kolonlari.md` → "Format Tablo" bölümü
```javascript
const FORMAT_TABLE_STRUCTURE = {
  columns: [
    'Kod',              // [A]
    'Keyword',          // [B]
    'Location',         // [C]
    'Company name',     // [D] - ZORUNLU
    'Category',         // [E]
    'Website',          // [F]
    'CMS Adı',          // [G]
    'CMS Grubu',        // [H]
    'Phone',            // [I] - ZORUNLU
    'Yetkili Tel',      // [J]
    'Mail',             // [K]
    'İsim Soyisim',     // [L]
    'Aktivite',         // [M] - Dropdown
    'Aktivite Tarihi',  // [N]
    'Yorum',            // [O]
    'Yönetici Not',     // [P]
    'E-Ticaret İzi',    // [Q]
    'Site Hızı',        // [R]
    'Site Trafiği',     // [S]
    'Log',              // [T]
    'Toplantı formatı', // [U] - Dropdown
    'Address',          // [V]
    'City',             // [W]
    'Rating count',     // [X]
    'Review',           // [Y]
    'Maplink'           // [Z]
  ],
  requiredFields: ['Company name', 'Phone']
};
Dönüşüm Fonksiyonu

/**
 * Ham veriyi Format Tablo yapısına dönüştürür
 */
function convertHamVeriToFormatTable(sourceSheet, targetSheet) {
  const startTime = new Date();
  console.log('🔄 Ham Veri → Format Tablo başlıyor...');
  
  // 1️⃣ Ham veriyi oku
  const lastCol = sourceSheet.getLastColumn();
  const lastRow = sourceSheet.getLastRow();
  
  if (lastRow <= 1) {
    return {success: false, message: 'Ham veri boş'};
  }
  
  const sourceHeaders = sourceSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const sourceData = sourceSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  console.log(`📥 Ham veri: ${sourceData.length} satır, ${sourceHeaders.length} sütun`);
  
  // 2️⃣ Format Tablo sütunları (26 sütun - SABİT)
  const formatTableHeaders = [
    'Kod', 'Keyword', 'Location', 'Company name', 'Category', 
    'Website', 'CMS Adı', 'CMS Grubu', 'Phone', 'Yetkili Tel', 
    'Mail', 'İsim Soyisim', 'Aktivite', 'Aktivite Tarihi', 
    'Yorum', 'Yönetici Not', 'E-Ticaret İzi', 'Site Hızı', 
    'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 
    'City', 'Rating count', 'Review', 'Maplink'
  ];
  
  // 3️⃣ Dinamik mapping oluştur
  const mapping = createColumnMapping(sourceHeaders, formatTableHeaders);
  console.log('🗺️ Mapping tamamlandı');
  
  // 4️⃣ Veriyi dönüştür (batch)
  const transformedData = [];
  let validRows = 0;
  let skippedRows = 0;
  
  sourceData.forEach((row, index) => {
    const newRow = new Array(26).fill(''); // 26 sütun
    
    // Mapping'e göre kopyala
    Object.entries(mapping).forEach(([srcIdx, tgtIdx]) => {
      if (tgtIdx !== -1) {
        newRow[tgtIdx] = row[parseInt(srcIdx)] || '';
      }
    });
    
    // Zorunlu alan kontrolü
    const companyName = newRow[3]; // D kolonu
    const phone = newRow[8];       // I kolonu
    
    if (companyName && phone) {
      transformedData.push(newRow);
      validRows++;
    } else {
      console.log(`⚠️ Satır ${index + 2} atlandı (zorunlu alan eksik)`);
      skippedRows++;
    }
  });
  
  console.log(`✅ Dönüştürülen: ${validRows}`);
  console.log(`⚠️ Atlanan: ${skippedRows}`);
  
  // 5️⃣ Format Tablo'ya yaz
  targetSheet.clear();
  targetSheet.getRange(1, 1, 1, 26).setValues([formatTableHeaders]);
  
  if (transformedData.length > 0) {
    targetSheet.getRange(2, 1, transformedData.length, 26).setValues(transformedData);
  }
  
  SpreadsheetApp.flush(); // ✅ KRİTİK!
  
  // 6️⃣ Layout uygula
  formatHeader(targetSheet);
  setColumnWidths(targetSheet);
  applyConditionalFormatting(targetSheet, 13); // Aktivite kolonu
  targetSheet.setFrozenRows(1);
  targetSheet.setFrozenColumns(4);
  
  const elapsed = (new Date() - startTime) / 1000;
  console.log(`✅ Tamamlandı: ${validRows} satır, ${elapsed.toFixed(2)}s`);
  
  return {
    success: true,
    validRows: validRows,
    skippedRows: skippedRows,
    elapsed: elapsed
  };
}
/**
 * Dinamik sütun mapping
 */
function createColumnMapping(sourceHeaders, targetHeaders) {
  const mapping = {};
  
  sourceHeaders.forEach((sourceCol, idx) => {
    const norm = (sourceCol || '').toLowerCase().trim();
    let targetIdx = -1;
    
    // Mapping kuralları
    if (norm.includes('kod') || norm.includes('id')) {
      targetIdx = targetHeaders.indexOf('Kod');
    }
    else if (norm.includes('keyword') || norm.includes('anahtar')) {
      targetIdx = targetHeaders.indexOf('Keyword');
    }
    else if (norm.includes('location') || norm.includes('konum')) {
      targetIdx = targetHeaders.indexOf('Location');
    }
    else if (norm.includes('şirket') || norm.includes('firma') || 
             norm.includes('company') || norm.includes('isim')) {
      targetIdx = targetHeaders.indexOf('Company name');
    }
    else if (norm.includes('category') || norm.includes('kategori')) {
      targetIdx = targetHeaders.indexOf('Category');
    }
    else if (norm.includes('website') || norm.includes('site')) {
      targetIdx = targetHeaders.indexOf('Website');
    }
    else if (norm.includes('cms')) {
      if (norm.includes('grup')) {
        targetIdx = targetHeaders.indexOf('CMS Grubu');
      } else {
        targetIdx = targetHeaders.indexOf('CMS Adı');
      }
    }
    else if (norm.includes('phone') || norm.includes('telefon') || norm.includes('tel')) {
      if (norm.includes('yetkili')) {
        targetIdx = targetHeaders.indexOf('Yetkili Tel');
      } else {
        targetIdx = targetHeaders.indexOf('Phone');
      }
    }
    else if (norm.includes('mail') || norm.includes('email')) {
      targetIdx = targetHeaders.indexOf('Mail');
    }
    else if (norm.includes('isim soyisim') || norm.includes('yetkili')) {
      targetIdx = targetHeaders.indexOf('İsim Soyisim');
    }
    else if (norm.includes('aktivite') || norm.includes('durum')) {
      targetIdx = targetHeaders.indexOf('Aktivite');
    }
    else if (norm.includes('tarih') || norm.includes('date')) {
      targetIdx = targetHeaders.indexOf('Aktivite Tarihi');
    }
    else if (norm.includes('yorum') || norm.includes('not')) {
      if (norm.includes('yönetici')) {
        targetIdx = targetHeaders.indexOf('Yönetici Not');
      } else {
        targetIdx = targetHeaders.indexOf('Yorum');
      }
    }
    else if (norm.includes('e-ticaret') || norm.includes('ecommerce')) {
      targetIdx = targetHeaders.indexOf('E-Ticaret İzi');
    }
    else if (norm.includes('hız') || norm.includes('speed')) {
      targetIdx = targetHeaders.indexOf('Site Hızı');
    }
    else if (norm.includes('trafik') || norm.includes('traffic')) {
      targetIdx = targetHeaders.indexOf('Site Trafiği');
    }
    else if (norm.includes('log')) {
      targetIdx = targetHeaders.indexOf('Log');
    }
    else if (norm.includes('toplantı') || norm.includes('meeting')) {
      targetIdx = targetHeaders.indexOf('Toplantı formatı');
    }
    else if (norm.includes('address') || norm.includes('adres')) {
      targetIdx = targetHeaders.indexOf('Address');
    }
    else if (norm.includes('city') || norm.includes('şehir')) {
      targetIdx = targetHeaders.indexOf('City');
    }
    else if (norm.includes('rating')) {
      targetIdx = targetHeaders.indexOf('Rating count');
    }
    else if (norm.includes('review')) {
      targetIdx = targetHeaders.indexOf('Review');
    }
    else if (norm.includes('map') || norm.includes('harita')) {
      targetIdx = targetHeaders.indexOf('Maplink');
    }
    
    if (targetIdx !== -1) {
      mapping[idx] = targetIdx;
      console.log(`  ✅ "${sourceCol}" → "${targetHeaders[targetIdx]}"`);
    } else {
      console.log(`  ⚠️ "${sourceCol}" → (atlandı)`);
    }
  });
  
  return mapping;
}
Kullanım Örneği
Chat'te:

/4-design-layout "Ham Veri 1" sheet'ini "Format Tablo" yapısına dönüştür

Agent:
1. Ham veri sütunlarını analiz eder
2. Format Tablo'ya map eder
3. Veriyi dönüştürür (batch)
4. Layout uygular
5. Performans rapor eder
Beklenen Çıktı
🔄 Ham Veri → Format Tablo başlıyor...
📥 Ham veri: 87 satır, 12 sütun

🗺️ Mapping:
  ✅ "ID" → "Kod"
  ✅ "Firma Adı" → "Company name"
  ✅ "Telefon No" → "Phone"
  ✅ "E-posta" → "Mail"
  ⚠️ "Sektör" → (atlandı)

✅ Dönüştürülen: 85
⚠️ Atlanan: 2

🎨 Layout uygulanıyor...
✅ Tamamlandı: 85 satır, 2.34s
📚 İLGİLİ DÖKÜMANLARI GÜNCELLE
Ham Veri → Format Tablo değişikliği yapıldığında şu dosyaları da güncelle:

1️⃣ docs/RENK_KODLARI.md
Format Tablo renk yapısı ekle
Yeni durum varsa renk tanımla
Header rengi güncelle
2️⃣ docs/sayfa_kolonlari.md
Format Tablo sütun yapısını güncelle
Yeni sütun eklenirse tanımla
Dropdown değerleri güncelle
Ham veri dönüşüm kuralları ekle
3️⃣ README.md
Ham Veri dönüşüm süreci açıkla
Format Tablo yapısı dokümante et
Kullanım örnekleri ekle
4️⃣ src/shared/smart-column-mapping.js
Mapping kuralları güncelle
Yeni sütun isimleri ekle
✅ Güncelleme Checklist
✅ 4-design-layout.md güncellendi
✅ docs/RENK_KODLARI.md kontrol edildi
✅ docs/sayfa_kolonlari.md kontrol edildi
✅ README.md kontrol edildi
✅ src/shared/smart-column-mapping.js kontrol edildi
✅ Tüm dosyalar senkronize
Agent Kullanımı
/4-design-layout Tüm dökümanları Format Tablo yapısına göre güncelle

Agent:
1. RENK_KODLARI.md'yi okur ve Format Tablo renk bölümü ekler
2. sayfa_kolonlari.md'ye ham veri dönüşüm kuralları ekler
3. README.md'ye kullanım örnekleri ekler
4. Tüm dosyaları senkronize eder
5. Güncelleme raporu verir


---
## 🔄 FORMAT TABLO YAPISI DEĞİŞİRSE
### Ne Zaman Değişir?
- Yeni sütun eklenir (örn: "Şehir İlçe")
- Sütun çıkarılır (artık kullanılmayan alan)
- Sütun sırası değişir (optimizasyon)
- Dropdown seçenekleri güncellenir
### Değişiklik Olduğunda YAPILMASI GEREKENLER
#### 1️⃣ **4-design-layout.md** (bu dosya)
```javascript
// Format Tablo yapısını güncelle:
const formatTableHeaders = [
  'Kod', 'Keyword', ..., 'YENİ SÜTUN', ...
];
// createColumnMapping fonksiyonuna yeni mapping ekle:
else if (norm.includes('yeni') || norm.includes('new')) {
  targetIdx = targetHeaders.indexOf('YENİ SÜTUN');
}
```2️⃣ docs/sayfa_kolonlari.md

## Format Tablo
| Kolon | Tip |
|---|---|
| ... mevcut kolonlar ... |
| YENİ SÜTUN | input/dropdown | ← EKLE
3️⃣ docs/RENK_KODLARI.md
Yeni sütuna renk kuralı varsa ekle
Yeni dropdown değeri varsa renk tanımla
4️⃣ README.md
Format Tablo sütun sayısını güncelle (26 → 27)
Yeni sütun açıklaması ekle
5️⃣ src/agents/backend.js
CRM_CONFIG.FORMAT_TABLE_COLUMNS güncelle
İlgili fonksiyonları güncelle (varsa)
6️⃣ src/shared/smart-column-mapping.js
Yeni sütun için mapping kuralı ekle
✅ Format Tablo Değişiklik Checklist
Format Tablo değiştiğinde kontrol et:

✅ 4-design-layout.md → formatTableHeaders dizisi güncellendi
✅ 4-design-layout.md → createColumnMapping() güncellendi
✅ docs/sayfa_kolonlari.md → Format Tablo tablosu güncellendi
✅ docs/RENK_KODLARI.md → Yeni renk kuralları eklendi (varsa)
✅ README.md → Sütun sayısı güncellendi
✅ README.md → Yeni sütun dokümante edildi
✅ src/agents/backend.js → CRM_CONFIG güncellendi
✅ src/shared/smart-column-mapping.js → Mapping güncellendi
✅ Tüm dosyalar senkronize
✅ Test edildi (ham veri → format tablo dönüşümü)
Agent Kullanımı
/4-design-layout Format Tablo'ya "Şehir İlçe" sütunu eklendi, tüm dosyaları güncelle

Agent:
1. Format Tablo yapısını günceller
2. Mapping fonksiyonunu günceller
3. Tüm ilgili dökümanları günceller
4. Güncelleme checklist'i verir
5. Test önerir
Örnek: Yeni Sütun Ekleme
Senaryo: "Şehir İlçe" sütunu ekleniyor (W kolonundan sonra)

Değişiklikler:

formatTableHeaders:

const formatTableHeaders = [
  ...,
  'City',             // [W]
  'Şehir İlçe',       // [X] ← YENİ
  'Rating count',     // [Y] (X'ten kaydı)
  'Review',           // [Z] (Y'den kaydı)
  'Maplink'           // [AA] (Z'den kaydı)
];
createColumnMapping:

else if (norm.includes('ilçe') || norm.includes('district')) {
  targetIdx = targetHeaders.indexOf('Şehir İlçe');
}
Sütun sayısı: 26 → 27

---

## ✅ ŞIMDI NE YAPALIM?

**SEÇENEK A:** Hemen ekle, sonra agent'i çalıştır

**SEÇENEK B:** Önce mevcut güncellemeyi tamamla, sonra ekle

---