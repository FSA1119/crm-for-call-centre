# Dosya Senkronizasyonu (Atlas Sync Mode)
Sen şimdi SENKRONİZASYON UZMANI modundasın.
## Görevin
İki Google Sheets dosyası arasında veri senkronizasyonu yap.
## MEVCUT SİSTEM
### ✅ ÇALIŞAN (Dokunma!)
- Temsilci → Yönetici (Tek yönlü)
- manager-sync.js dosyası çalışıyor
- Değiştirme, bozabilirsin!
### KURAL: "If it ain't broke, don't fix it!"
## SENKRONİZASYON PRENSİPLERİ
### 1. BATCH OPERATIONS (Zorunlu!)
```javascript
❌ YAVAŞ:
for (let i = 2; i <= 100; i++) {
  const value = sheet.getRange(i, 1).getValue(); // 100 API call!
}
✅ HIZLI:
const values = sheet.getRange(2, 1, 100, 1).getValues(); // 1 API call!
2. INCREMENTAL SYNC (Sadece Yeni Veri)

// Son işlenen satırı sakla
const lastSyncRow = cache.get('lastSync_SB004');
// Sadece YENİ satırları işle
const newRowCount = sheet.getLastRow() - lastSyncRow;
const newData = sheet.getRange(lastSyncRow + 1, 1, newRowCount, 10).getValues();
3. CACHE KULLAN

// Dosyayı cache'le (1 saat)
const cacheKey = `sheet_${employeeCode}`;
const cachedSheet = cache.get(cacheKey);
if (cachedSheet) {
  return cachedSheet; // 0.01s - ÇOK HIZLI!
}
4. VALIDATION TEMİZLE

// setValue() önce validation temizle
const range = sheet.getRange(row, col, 1, values.length);
range.clearDataValidations();
range.setValues([values]);
PERFORMANS HEDEFLERİ
Tek satır sync: <1s
Batch sync (10 satır): <2s
Cache hit: <0.1s
SYNC AKIŞI
1. Temsilci dosyasını cache'den al (veya aç)
   ↓
2. Son sync satırını oku (cache)
   ↓
3. Yeni satırları toplu oku (batch)
   ↓
4. Yönetici dosyasına toplu yaz (batch)
   ↓
5. Cache'i güncelle
   ↓
6. Performans logla
HATA YÖNETİMİ
Validation Hatası

try {
  sheet.setValues(data);
} catch (error) {
  if (error.message.includes('validation')) {
    // Sadece o kolonun validation'ını temizle
    handleValidationError(error, sheet);
    // Tekrar dene
    sheet.setValues(data);
  }
}
Array-Header Uyumsuzluğu

// ZORUNLU: Yazmadan önce kontrol et
validateArrayHeaderSync(dataRow, headers);
ÇIKTI FORMATI
✅ BAŞARILI:

📊 Sync Tamamlandı
- Temsilci: SB 004
- Yeni satır: 5
- Süre: 1.2s
- Cache: Hit
❌ HATA:

❌ Sync Hatası
- Hata: Validation error (L kolonu)
- Çözüm: Validation temizlendi, tekrar deneniyor
- Durum: Başarılı (2. denemede)
⏱️ PERFORMANS:

⏱️ SYNC PERFORMANCE:
  📊 Veri okuma: 0.3s
  📊 İşleme: 0.1s
  📊 Yazma: 0.8s
  ✅ TOPLAM: 1.2s (Hedef: <2s) ✅
ÖZEL KURALLAR
Mevcut Formatlara Uyum
Tarih formatı: DD/MM/YYYY (değiştirme!)
Saat formatı: 9:05 (padStart YOK!)
Telefon formatı: E.164 (+905551234567)
Tutarlılık Kuralı
Yönetici dosyasındaki format = Temsilci formatı
Değişiklik yapma, uyum sağla!
KULLANIM ÖRNEĞİ
/sync-files

Temsilci: SB 004
Yön: Temsilci → Yönetici
Sheet: Randevularım
Agent otomatik olarak:

Dosyaları açar (cache'den)
Yeni satırları bulur
Batch ile senkronize eder
Performansı raporlar
DEBUGGING
Sorun varsa kontrol et:

❓ Cache dolu mu? → cache.get('sheet_SB004')
❓ Validation var mı? → clearDataValidations()
❓ Header uyumlu mu? → validateArrayHeaderSync()
❓ Batch kullanılıyor mu? → Loop içinde API call var mı?
@manager-sync.js @backend.js