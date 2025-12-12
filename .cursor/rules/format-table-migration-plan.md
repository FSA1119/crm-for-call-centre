# 📋 Format Tablo Migration Plan - backend.js Analizi

Bu dosya, `backend.js`'den Data Pool'a taşınacak ve temsilci dosyasında kalacak fonksiyonların detaylı analizini içerir.

**Amaç:** Hata olmadan, güvenli bir şekilde fonksiyonları ayırmak.

---

## 📊 Özet Tablo

| Fonksiyon | Durum | Açıklama |
|-----------|-------|----------|
| **TEMSİLCİDE KALACAK** | | |
| `takeAppointment()` | ✅ KALACAK | Format Tablo'dan Randevu alır |
| `addOpportunity()` | ✅ KALACAK | Format Tablo'dan Fırsat alır |
| `takeMeeting()` | ✅ KALACAK | Format Tablo'dan Toplantı alır |
| `takeSale()` | ✅ KALACAK | Format Tablo'dan Satış alır |
| `updateFormatTableRow()` | ✅ KALACAK | Format Tablo aktivite güncelleme |
| `applyFormatTableColorCoding()` | ✅ KALACAK | Format Tablo renklendirme |
| `collectFormatTableData()` | ✅ KALACAK | Format Tablo veri toplama (raporlama) |
| `isFormatTable()` | ✅ KALACAK | Format Tablo tespiti (her iki yerde de gerekli) |
| `processAppointmentForm()` | ✅ KALACAK | Randevu form işleme |
| `processOpportunityForm()` | ✅ KALACAK | Fırsat form işleme |
| `onEdit()` (Format Tablo kısmı) | ✅ KALACAK | Aktivite değişikliklerini yakalar |
| **DATA POOL'A TAŞINACAK** | | |
| `createFormatTable()` | 🔄 TAŞINACAK | Format Tablo oluşturma |
| `createNewTable()` | 🔄 TAŞINACAK | Yeni tablo oluşturma (createFormatTable çağırır) |
| `mapHamVeriToFormatTable()` | 🔄 TAŞINACAK | Mapping kuralları |
| `applyFormatTableStyling()` | 🔄 TAŞINACAK | Styling kuralları |
| `setDataValidation()` | 🔄 TAŞINACAK | Validation kuralları (Format Tablo için) |
| `findDuplicatesInFormatTable()` | 🔄 TAŞINACAK | Mükerrer bulma |
| `deleteDuplicateRowsWithConfirm()` | 🔄 TAŞINACAK | Mükerrer silme (onaylı) |
| `deleteAllDuplicatesAuto()` | 🔄 TAŞINACAK | Tüm mükerrerleri silme |
| `deleteRowsWithoutPhone()` | 🔄 TAŞINACAK | Telefonu olmayanları silme |
| `deleteRowsWithoutWebsite()` | 🔄 TAŞINACAK | Websitesi olmayanları silme |
| `urlTekrarlariniSil()` | 🔄 TAŞINACAK | URL tekrarlarını silme |
| `urlTemizleTumunu()` | 🔄 TAŞINACAK | URL normalize etme |
| `analyzeFormatTableForArchive()` | 🔄 TAŞINACAK | Arşiv analizi |
| `archiveFormatTableToDrive()` | 🔄 TAŞINACAK | Arşivleme |
| `reportFormatTable()` | 🔄 TAŞINACAK | Raporlama |
| `deleteFormatTable()` | 🔄 TAŞINACAK | Format Tablo silme |
| `archiveFormatTable()` | 🔄 TAŞINACAK | Arşivleme |
| `extractLogStatisticsFromArchive()` | 🔄 TAŞINACAK | Log istatistikleri |
| `refreshFormatTableValidation()` | 🔄 TAŞINACAK | Validation yenileme |
| `decodeTurkishText()` | 🔄 TAŞINACAK | Türkçe karakter decode |

---

## 🔍 Detaylı Analiz

### 1. TEMSİLCİDE KALACAK FONKSİYONLAR

#### 1.1. `takeAppointment()` - ✅ KALACAK

**Satır:** 995-1086

**Bağımlılıklar:**
- `isFormatTable()` - Format Tablo tespiti
- `getSelectedRowData()` - Satır verisi okuma
- `showAppointmentDialog()` - Dialog gösterme
- `processAppointmentForm()` - Form işleme (Format Tablo güncelleme içerir)

**Kullanım:**
- Format Tablo'dan veya Fırsatlarım'dan Randevu alır
- Format Tablo'yu günceller (`updateFormatTableRow()`)

**Neden Kalacak:**
- Format Tablo **hazır** olduktan sonraki işlem
- Temsilci Format Tablo'dan randevu alır

---

#### 1.2. `addOpportunity()` / `takeOpportunity()` - ✅ KALACAK

**Satır:** 2900-3072

**Bağımlılıklar:**
- `isFormatTable()` - Format Tablo tespiti
- `getSelectedRowData()` - Satır verisi okuma
- `showOpportunityDialog()` - Dialog gösterme
- `processOpportunityForm()` - Form işleme (Format Tablo güncelleme içerir)

**Kullanım:**
- Format Tablo'dan Fırsat alır
- Format Tablo'yu günceller (`updateFormatTableRow()`)

**Neden Kalacak:**
- Format Tablo **hazır** olduktan sonraki işlem
- Temsilci Format Tablo'dan fırsat alır

---

#### 1.3. `takeMeeting()` - ✅ KALACAK

**Satır:** (bulunamadı, muhtemelen benzer yapıda)

**Kullanım:**
- Format Tablo'dan Toplantı alır
- Format Tablo'yu günceller

**Neden Kalacak:**
- Format Tablo **hazır** olduktan sonraki işlem
- Temsilci Format Tablo'dan toplantı alır

---

#### 1.4. `takeSale()` - ✅ KALACAK

**Satır:** (bulunamadı, muhtemelen benzer yapıda)

**Kullanım:**
- Format Tablo'dan Satış alır
- Format Tablo'yu günceller

**Neden Kalacak:**
- Format Tablo **hazır** olduktan sonraki işlem
- Temsilci Format Tablo'dan satış alır

---

#### 1.5. `updateFormatTableRow()` - ✅ KALACAK

**Satır:** 2342-2514

**Bağımlılıklar:**
- `applyFormatTableColorCoding()` - Renklendirme
- `formatTimeValue()` - Saat formatı
- `formatDateValue()` - Tarih formatı
- `CRM_CONFIG.ACTIVITY_OPTIONS` - Aktivite seçenekleri

**Kullanım:**
- Format Tablo'da aktivite günceller
- Aktivite Tarihi, Yorum, Log günceller
- Renklendirme yapar

**Neden Kalacak:**
- Temsilci Format Tablo'da aktivite günceller
- Randevu/Fırsat/Toplantı/Satış aldığında Format Tablo'yu günceller

**KRİTİK NOT:** Bu fonksiyon temsilci tarafında **MUTLAKA** kalmalı!

---

#### 1.6. `applyFormatTableColorCoding()` - ✅ KALACAK

**Satır:** 2530-2547

**Bağımlılıklar:**
- `CRM_CONFIG.COLOR_CODES` - Renk kodları

**Kullanım:**
- Format Tablo'da aktiviteye göre renklendirme yapar

**Neden Kalacak:**
- Temsilci Format Tablo'da aktivite değiştirdiğinde renklendirme yapılır
- `onEdit()` içinde çağrılır

---

#### 1.7. `collectFormatTableData()` - ✅ KALACAK

**Satır:** 7476-7500

**Kullanım:**
- Format Tablo verilerini toplar (raporlama için)

**Neden Kalacak:**
- Temsilci raporlama yaparken Format Tablo verilerini toplar
- Manager-sync tarafından kullanılır

---

#### 1.8. `isFormatTable()` - ✅ KALACAK (Her İki Yerde de Gerekli)

**Satır:** 1093-1122

**Kullanım:**
- Format Tablo sayfasını tespit eder
- Hariç tutulan sayfalar: Ham veri, Randevularım, Fırsatlarım, Toplantılarım, Raporlarım, Config

**Neden Her İki Yerde de Gerekli:**
- **Data Pool:** Format Tablo oluştururken tespit için
- **Temsilci:** Format Tablo'dan işlem yaparken tespit için

**ÇÖZÜM:** Her iki dosyada da aynı fonksiyon olacak (duplicate OK)

---

#### 1.9. `processAppointmentForm()` - ✅ KALACAK

**Satır:** 1215-1294

**Bağımlılıklar:**
- `isFormatTable()` - Format Tablo tespiti
- `updateFormatTableRow()` - Format Tablo güncelleme
- `createAppointmentInRandevularim()` - Randevu oluşturma

**Kullanım:**
- Randevu form verilerini işler
- Format Tablo'yu günceller

**Neden Kalacak:**
- Temsilci randevu aldığında Format Tablo'yu günceller

---

#### 1.10. `processOpportunityForm()` - ✅ KALACAK

**Satır:** 3107-3150

**Bağımlılıklar:**
- `isFormatTable()` - Format Tablo tespiti
- `updateFormatTableRow()` - Format Tablo güncelleme
- `createOpportunityInFirsatlarim()` - Fırsat oluşturma

**Kullanım:**
- Fırsat form verilerini işler
- Format Tablo'yu günceller

**Neden Kalacak:**
- Temsilci fırsat aldığında Format Tablo'yu günceller

---

#### 1.11. `onEdit()` (Format Tablo Kısmı) - ✅ KALACAK

**Satır:** 8464-10486

**Kullanım:**
- Format Tablo'da aktivite değişikliklerini yakalar
- Otomatik renklendirme yapar

**Neden Kalacak:**
- Temsilci Format Tablo'da aktivite değiştirdiğinde otomatik renklendirme yapılır

---

### 2. DATA POOL'A TAŞINACAK FONKSİYONLAR

#### 2.1. `createFormatTable()` - 🔄 TAŞINACAK

**Satır:** 788-820

**Bağımlılıklar:**
- `mapHamVeriToFormatTable()` - Mapping
- `applyFormatTableStyling()` - Styling
- `setDataValidation()` - Validation

**Kullanım:**
- Ham Veri'den Format Tablo oluşturur

**Neden Taşınacak:**
- Ham Veri → Format Tablo dönüşümü Data Pool'da yapılacak

---

#### 2.2. `createNewTable()` - 🔄 TAŞINACAK

**Satır:** 747-779

**Bağımlılıklar:**
- `createFormatTable()` - Format Tablo oluşturma

**Kullanım:**
- Kullanıcıdan tablo adı alır
- `createFormatTable()` çağırır

**Neden Taşınacak:**
- Ham Veri → Format Tablo dönüşümü Data Pool'da yapılacak

---

#### 2.3. `mapHamVeriToFormatTable()` - 🔄 TAŞINACAK

**Satır:** 873-928

**Bağımlılıklar:**
- `decodeTurkishText()` - Türkçe karakter decode
- `getCurrentEmployeeCode()` - Temsilci kodu

**Kullanım:**
- Ham Veri satırlarını Format Tablo formatına dönüştürür

**Neden Taşınacak:**
- Mapping kuralları Data Pool'da olacak

**NOT:** `getCurrentEmployeeCode()` Data Pool'da farklı olabilir (merkezi sistem)

---

#### 2.4. `applyFormatTableStyling()` - 🔄 TAŞINACAK

**Satır:** 934-943

**Kullanım:**
- Format Tablo'ya styling uygular (header, borders, freeze)

**Neden Taşınacak:**
- Format Tablo oluşturulurken styling yapılır

---

#### 2.5. `setDataValidation()` - 🔄 TAŞINACAK

**Satır:** 949-984

**Bağımlılıklar:**
- `CRM_CONFIG.ACTIVITY_OPTIONS` - Aktivite seçenekleri
- `CRM_CONFIG.MEETING_FORMAT_OPTIONS` - Toplantı formatı seçenekleri

**Kullanım:**
- Format Tablo'ya dropdown validation ekler

**Neden Taşınacak:**
- Format Tablo oluşturulurken validation eklenir

**NOT:** `CRM_CONFIG` Data Pool'da da olmalı

---

#### 2.6. `findDuplicatesInFormatTable()` - 🔄 TAŞINACAK

**Satır:** 8727-8789

**Kullanım:**
- Format Tablo'da mükerrer bulur (Company name + Phone)

**Neden Taşınacak:**
- Format Tablo hazırlanırken mükerrer kontrolü yapılır

---

#### 2.7. `deleteDuplicateRowsWithConfirm()` - 🔄 TAŞINACAK

**Satır:** 11723-11906

**Kullanım:**
- Format Tablo'da mükerrer siler (onaylı)

**Neden Taşınacak:**
- Format Tablo hazırlanırken mükerrer temizlenir

---

#### 2.8. `deleteAllDuplicatesAuto()` - 🔄 TAŞINACAK

**Satır:** 11792-11958

**Kullanım:**
- Format Tablo'da tüm mükerrerleri siler (otomatik)

**Neden Taşınacak:**
- Format Tablo hazırlanırken mükerrer temizlenir

---

#### 2.9. `deleteRowsWithoutPhone()` - 🔄 TAŞINACAK

**Satır:** 12787-12856

**Kullanım:**
- Telefonu olmayan satırları siler

**Neden Taşınacak:**
- Format Tablo hazırlanırken geçersiz satırlar temizlenir

---

#### 2.10. `deleteRowsWithoutWebsite()` - 🔄 TAŞINACAK

**Satır:** 12863-12927

**Kullanım:**
- Websitesi olmayan satırları siler

**Neden Taşınacak:**
- Format Tablo hazırlanırken geçersiz satırlar temizlenir

---

#### 2.11. `urlTekrarlariniSil()` - 🔄 TAŞINACAK

**Satır:** 13051-13172

**Kullanım:**
- Aynı URL'ye sahip mükerrer satırları siler

**Neden Taşınacak:**
- Format Tablo hazırlanırken URL mükerrerleri temizlenir

---

#### 2.12. `urlTemizleTumunu()` - 🔄 TAŞINACAK

**Satır:** 12936-13050

**Kullanım:**
- Website kolonundaki URL'leri normalize eder

**Neden Taşınacak:**
- Format Tablo hazırlanırken URL'ler normalize edilir

---

#### 2.13. `analyzeFormatTableForArchive()` - 🔄 TAŞINACAK

**Satır:** 8991-9154

**Kullanım:**
- Format Tablo'yu arşiv için analiz eder

**Neden Taşınacak:**
- Format Tablo arşivlenirken analiz yapılır

---

#### 2.14. `archiveFormatTableToDrive()` - 🔄 TAŞINACAK

**Satır:** 9160-9250

**Kullanım:**
- Format Tablo'yu Google Drive'a arşivler

**Neden Taşınacak:**
- Format Tablo arşivleme Data Pool'da yapılır

---

#### 2.15. `reportFormatTable()` - 🔄 TAŞINACAK

**Satır:** 9251-9463

**Kullanım:**
- Format Tablo raporu oluşturur

**Neden Taşınacak:**
- Format Tablo raporlama Data Pool'da yapılır

---

#### 2.16. `deleteFormatTable()` - 🔄 TAŞINACAK

**Satır:** 9464-9519

**Kullanım:**
- Format Tablo'yu siler

**Neden Taşınacak:**
- Format Tablo silme Data Pool'da yapılır

---

#### 2.17. `archiveFormatTable()` - 🔄 TAŞINACAK

**Satır:** 9520-9645

**Kullanım:**
- Format Tablo'yu arşivler

**Neden Taşınacak:**
- Format Tablo arşivleme Data Pool'da yapılır

---

#### 2.18. `extractLogStatisticsFromArchive()` - 🔄 TAŞINACAK

**Satır:** 9649-9762

**Kullanım:**
- Arşivden log istatistikleri çıkarır

**Neden Taşınacak:**
- Log istatistikleri Data Pool'da çıkarılır

---

#### 2.19. `refreshFormatTableValidation()` - 🔄 TAŞINACAK

**Satır:** 14870-14926

**Kullanım:**
- Tüm Format Tablo sayfalarında validation yeniler

**Neden Taşınacak:**
- Validation yenileme Data Pool'da yapılır

---

#### 2.20. `decodeTurkishText()` - 🔄 TAŞINACAK

**Satır:** 827-863

**Kullanım:**
- URL-encoded Türkçe karakterleri decode eder

**Neden Taşınacak:**
- Ham Veri → Format Tablo dönüşümünde kullanılır

---

## 🚫 TAŞINMAYACAK FONKSİYONLAR

### CMS Detector - ✅ TAŞINMAYACAK

**Durum:** Zaten ayrı dosyada (`src/cms_detector.js` veya `src/managers/cms_detector.gs`)

**Kural:**
- CMS Detector **olduğu yerde kalacak**
- `backend.js`'te sadece **referans** bırakılacak
- Temsilciler Format Tablo'dan arama yapabilmek için CMS Detector'a ihtiyaç duyarlar

**Neden Taşınmıyor:**
- Temsilci dosyalarında kalması gerekiyor (Format Tablo'dan arama için)
- Zaten ayrı bir dosyada, backend.js'ten bağımsız

**Yapılacak:**
- `backend.js`'te CMS Detector fonksiyonları **SİLİNMEYECEK**
- Sadece referans kalacak (import/require gibi)

---

## ⚠️ KRİTİK BAĞIMLILIKLAR

### 1. `CRM_CONFIG` - Her İki Yerde de Gerekli

**Kullanıldığı Yerler:**
- `CRM_CONFIG.ACTIVITY_OPTIONS` - Aktivite seçenekleri
- `CRM_CONFIG.MEETING_FORMAT_OPTIONS` - Toplantı formatı seçenekleri
- `CRM_CONFIG.COLOR_CODES` - Renk kodları

**Çözüm:**
- `CRM_CONFIG` her iki dosyada da olmalı (shared config)
- Veya merkezi bir config dosyasından import edilmeli

---

### 2. `isFormatTable()` - Her İki Yerde de Gerekli

**Kullanıldığı Yerler:**
- Data Pool: Format Tablo oluştururken
- Temsilci: Format Tablo'dan işlem yaparken

**Çözüm:**
- Her iki dosyada da aynı fonksiyon olacak (duplicate OK)
- Veya shared utility dosyasından import edilmeli

---

### 3. `getCurrentEmployeeCode()` - Farklı Olabilir

**Kullanıldığı Yerler:**
- `mapHamVeriToFormatTable()` - Kod kolonu için

**Çözüm:**
- Data Pool'da: Merkezi sistem kodu
- Temsilci'de: Temsilci kodu

**NOT:** Data Pool'da bu fonksiyon farklı implement edilebilir

---

## 🎯 Migration Stratejisi

### Adım 1: Data Pool Dosyası Oluştur
1. Yeni dosya: `src/data-pool/data-pool-processor.js`
2. Taşınacak fonksiyonları kopyala
3. Bağımlılıkları çöz (CRM_CONFIG, isFormatTable, vb.)

### Adım 2: backend.js'den Çıkar
1. Taşınacak fonksiyonları sil
2. Bağımlılıkları kontrol et
3. Test et (hata olmamalı)

### Adım 3: Test
1. Format Tablo oluşturma (Data Pool'da)
2. Format Tablo'dan randevu alma (Temsilci'de)
3. Format Tablo güncelleme (Temsilci'de)
4. Renklendirme (Temsilci'de)

---

## ✅ Kontrol Listesi

### Data Pool'a Taşınacaklar
- [ ] `createFormatTable()`
- [ ] `createNewTable()`
- [ ] `mapHamVeriToFormatTable()`
- [ ] `applyFormatTableStyling()`
- [ ] `setDataValidation()` (Format Tablo için)
- [ ] `findDuplicatesInFormatTable()`
- [ ] `deleteDuplicateRowsWithConfirm()`
- [ ] `deleteAllDuplicatesAuto()`
- [ ] `deleteRowsWithoutPhone()`
- [ ] `deleteRowsWithoutWebsite()`
- [ ] `urlTekrarlariniSil()`
- [ ] `urlTemizleTumunu()`
- [ ] `analyzeFormatTableForArchive()`
- [ ] `archiveFormatTableToDrive()`
- [ ] `reportFormatTable()`
- [ ] `deleteFormatTable()`
- [ ] `archiveFormatTable()`
- [ ] `extractLogStatisticsFromArchive()`
- [ ] `refreshFormatTableValidation()`
- [ ] `decodeTurkishText()`

### Temsilci'de Kalacaklar
- [ ] `takeAppointment()`
- [ ] `addOpportunity()` / `takeOpportunity()`
- [ ] `takeMeeting()`
- [ ] `takeSale()`
- [ ] `updateFormatTableRow()`
- [ ] `applyFormatTableColorCoding()`
- [ ] `collectFormatTableData()`
- [ ] `isFormatTable()` (duplicate OK)
- [ ] `processAppointmentForm()`
- [ ] `processOpportunityForm()`
- [ ] `onEdit()` (Format Tablo kısmı)

### Taşınmayacaklar (Ayrı Dosyada)
- [ ] CMS Detector fonksiyonları (zaten ayrı dosyada, olduğu yerde kalacak)
- [ ] `backend.js`'te sadece referans bırakılacak

### Bağımlılıklar
- [ ] `CRM_CONFIG` - Her iki yerde de olmalı
- [ ] `isFormatTable()` - Her iki yerde de olmalı (duplicate OK)
- [ ] `getCurrentEmployeeCode()` - Data Pool'da farklı olabilir

---

## 🚨 DİKKAT EDİLMESİ GEREKENLER

1. **`updateFormatTableRow()` MUTLAKA temsilci'de kalmalı!**
   - Randevu/Fırsat/Toplantı/Satış aldığında Format Tablo'yu günceller
   - Bu fonksiyon olmadan temsilci Format Tablo'yu güncelleyemez

2. **`isFormatTable()` her iki yerde de olmalı**
   - Data Pool: Format Tablo oluştururken
   - Temsilci: Format Tablo'dan işlem yaparken
   - Duplicate OK (her iki dosyada aynı fonksiyon)

3. **`CRM_CONFIG` her iki yerde de olmalı**
   - Aktivite seçenekleri
   - Toplantı formatı seçenekleri
   - Renk kodları

4. **CMS Detector TAŞINMAYACAK!**
   - Zaten ayrı dosyada (`src/cms_detector.js` veya `src/managers/cms_detector.gs`)
   - `backend.js`'te sadece referans bırakılacak
   - Temsilciler Format Tablo'dan arama yapabilmek için CMS Detector'a ihtiyaç duyarlar

5. **Menu item'ları güncelle**
   - Data Pool'a taşınan fonksiyonların menu item'ları Data Pool'da olmalı
   - Temsilci'de kalan fonksiyonların menu item'ları temsilci'de olmalı
   - CMS Detector menu item'ları temsilci'de kalacak

---

## 📝 Sonuç

**Toplam Fonksiyon:**
- Temsilci'de Kalacak: **11 fonksiyon**
- Data Pool'a Taşınacak: **20 fonksiyon**
- Taşınmayacak (Ayrı Dosyada): **CMS Detector fonksiyonları**

**Risk Seviyesi:** 🟡 ORTA
- Bağımlılıklar iyi analiz edildi
- Kritik fonksiyonlar tespit edildi
- Migration stratejisi hazır

**Öneri:** 
- Önce test ortamında yap
- Her adımda test et
- Hata olursa geri al
