# 🧪 Test Senaryoları: CMS Batch Operations

## ✅ Optimize Edilen Fonksiyon
**Fonksiyon:** `runCMSDetectionForSelectionAccurate`  
**Dosya:** `src/managers/cms_detector.gs`  
**Satırlar:** 469-592

---

## 📋 Test Senaryoları

### Senaryo 1: Ardışık Satırlar (En Hızlı)
**Hedef:** Batch read + batch write (3 API call)

**Adımlar:**
1. Google Sheets'te bir Format Tablo sayfası açın
2. **Ardışık 5 satır seçin** (örn: Satır 2-6)
3. Website kolonunda URL'ler olsun (örn: `shopify.com`, `woocommerce.com`)
4. Menüden: **Admin → Website Analizi → CMS Analizi (Seçili)**
5. Console'u açın: **View → Logs** veya **Execution transcript**

**Beklenen Console Log:**
```
Function started: { mode: 'selection-accurate' }
📊 [BATCH] 5 satır için batch operations başlatılıyor...
✅ [BATCH] 5 satır işlendi (3 API call: 1 read + 2 write)
```

**Beklenen Sonuç:**
- ✅ CMS Adı kolonu dolduruldu
- ✅ CMS Grubu kolonu dolduruldu
- ✅ İşlem süresi: < 5 saniye
- ✅ Alert: "CMS Analizi (Doğruluk) → Format Tablo → 5/5 satır işlendi"

---

### Senaryo 2: Ardışık Olmayan Satırlar
**Hedef:** Batch read + individual write (daha az API call)

**Adımlar:**
1. Google Sheets'te bir Format Tablo sayfası açın
2. **Ardışık olmayan satırlar seçin** (örn: Satır 2, 5, 8, 12)
3. Website kolonunda URL'ler olsun
4. Menüden: **Admin → Website Analizi → CMS Analizi (Seçili)**
5. Console'u açın

**Beklenen Console Log:**
```
Function started: { mode: 'selection-accurate' }
📊 [BATCH] 4 satır için batch operations başlatılıyor...
✅ [BATCH] 4 satır işlendi (9 API call: 1 read + 8 write)
⚠️ Not: Ardışık olmayan satırlar için batch write kullanılamadı, ama batch read kullanıldı
```

**Beklenen Sonuç:**
- ✅ CMS Adı kolonu dolduruldu
- ✅ CMS Grubu kolonu dolduruldu
- ✅ İşlem süresi: < 10 saniye
- ✅ Alert: "CMS Analizi (Doğruluk) → Format Tablo → 4/4 satır işlendi"

---

### Senaryo 3: Boş URL'ler
**Hedef:** Boş URL'ler için hata vermemeli

**Adımlar:**
1. Google Sheets'te bir Format Tablo sayfası açın
2. **5 satır seçin** (bazıları boş URL)
3. Menüden: **Admin → Website Analizi → CMS Analizi (Seçili)**
4. Console'u açın

**Beklenen Console Log:**
```
Function started: { mode: 'selection-accurate' }
📊 [BATCH] 5 satır için batch operations başlatılıyor...
✅ [BATCH] 3 satır işlendi (3 API call: 1 read + 2 write)
```

**Beklenen Sonuç:**
- ✅ Boş URL'ler için CMS Adı/Grubu boş kalmalı
- ✅ Dolu URL'ler için sonuçlar yazılmalı
- ✅ Hata mesajı OLMAMALI

---

### Senaryo 4: Hata Durumu (Erişilemeyen URL)
**Hedef:** Try-catch ile hata yakalanmalı

**Adımlar:**
1. Google Sheets'te bir Format Tablo sayfası açın
2. **3 satır seçin** (biri geçersiz URL: `http://invalid-domain-xyz-123.com`)
3. Menüden: **Admin → Website Analizi → CMS Analizi (Seçili)**
4. Console'u açın

**Beklenen Console Log:**
```
Function started: { mode: 'selection-accurate' }
📊 [BATCH] 3 satır için batch operations başlatılıyor...
❌ Satır 5 analiz hatası: [error details]
✅ [BATCH] 2 satır işlendi (3 API call: 1 read + 2 write)
```

**Beklenen Sonuç:**
- ✅ Hata yakalanmalı (try-catch)
- ✅ Hatalı satır için "Erişilemedi" yazılmalı
- ✅ Diğer satırlar normal işlenmeli
- ✅ Program çökmemeli

---

### Senaryo 5: Performance Test (10+ Satır)
**Hedef:** Batch operations hızını ölç

**Adımlar:**
1. Google Sheets'te bir Format Tablo sayfası açın
2. **10-20 satır seçin** (ardışık)
3. Website kolonunda URL'ler olsun
4. **Zamanlayıcı başlatın** (telefon/stopwatch)
5. Menüden: **Admin → Website Analizi → CMS Analizi (Seçili)**
6. **Zamanlayıcıyı durdurun**

**Beklenen Sonuç:**
- ✅ 10 satır: < 15 saniye
- ✅ 20 satır: < 30 saniye
- ✅ Console'da API call sayısı: 3 (ardışık satırlar için)

**Karşılaştırma (Eski Kod):**
- ❌ 10 satır: ~30 saniye (300 API call)
- ❌ 20 satır: ~60 saniye (600 API call)

**Beklenen İyileştirme:**
- 🚀 **~10x daha hızlı** (batch operations sayesinde)

---

## 🔍 Kontrol Listesi

### ✅ Kod Kontrolü
- [x] Syntax hatası yok (linter passed)
- [x] Try-catch blokları var
- [x] Console.log'lar mevcut
- [x] Batch read kullanılıyor
- [x] Batch write kullanılıyor (ardışık satırlar için)

### ✅ Fonksiyonellik Kontrolü
- [ ] Senaryo 1: Ardışık satırlar test edildi
- [ ] Senaryo 2: Ardışık olmayan satırlar test edildi
- [ ] Senaryo 3: Boş URL'ler test edildi
- [ ] Senaryo 4: Hata durumu test edildi
- [ ] Senaryo 5: Performance test edildi

### ✅ Sonuç Kontrolü
- [ ] CMS Adı kolonu doğru dolduruldu
- [ ] CMS Grubu kolonu doğru dolduruldu
- [ ] Console log'ları doğru görünüyor
- [ ] Alert mesajı doğru
- [ ] Hata durumunda program çökmedi

---

## 📊 Test Sonuçları

**Test Tarihi:** [TARİH]  
**Test Eden:** [İSİM]  
**Google Sheets URL:** [URL]

### Senaryo 1: Ardışık Satırlar
- **Seçilen Satırlar:** [örn: 2-6]
- **İşlem Süresi:** [örn: 4.2 saniye]
- **API Call Sayısı:** [örn: 3]
- **Sonuç:** ✅ Başarılı / ❌ Başarısız
- **Notlar:** [varsa]

### Senaryo 2: Ardışık Olmayan Satırlar
- **Seçilen Satırlar:** [örn: 2, 5, 8, 12]
- **İşlem Süresi:** [örn: 8.5 saniye]
- **API Call Sayısı:** [örn: 9]
- **Sonuç:** ✅ Başarılı / ❌ Başarısız
- **Notlar:** [varsa]

### Senaryo 3: Boş URL'ler
- **Seçilen Satırlar:** [örn: 2-6]
- **Boş URL Sayısı:** [örn: 2]
- **Sonuç:** ✅ Başarılı / ❌ Başarısız
- **Notlar:** [varsa]

### Senaryo 4: Hata Durumu
- **Seçilen Satırlar:** [örn: 2-4]
- **Hatalı URL:** [örn: invalid-domain.com]
- **Sonuç:** ✅ Başarılı / ❌ Başarısız
- **Notlar:** [varsa]

### Senaryo 5: Performance Test
- **Seçilen Satırlar:** [örn: 2-21]
- **Satır Sayısı:** [örn: 20]
- **İşlem Süresi:** [örn: 25 saniye]
- **API Call Sayısı:** [örn: 3]
- **Eski Kod Süresi (tahmini):** [örn: 60 saniye]
- **İyileştirme:** [örn: 2.4x daha hızlı]
- **Sonuç:** ✅ Başarılı / ❌ Başarısız
- **Notlar:** [varsa]

---

## 🚀 Sonraki Adımlar

1. ✅ Test senaryolarını çalıştır
2. ✅ Sonuçları bu dosyaya yaz
3. ✅ Başarılı ise: Git commit yap
4. ✅ Başarısız ise: Hata raporu hazırla

---

## 📝 Notlar

- Console log'larını mutlaka kontrol et
- Execution transcript'i kaydet
- Hata durumunda screenshot al
- Performance test için zamanlayıcı kullan

