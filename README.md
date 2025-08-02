# 🏢 Google Sheets CRM System

## 📋 Proje Özeti

Google Sheets üzerinde çok kullanıcılı CRM sistemi ile temsilci-yönetici senkronizasyonu ve değişiklik takibi.

## 🎯 Ana Özellikler

- **6 Temsilci Dosyası** + **1 Yönetici Dosyası**
- **12 Ana Fonksiyon** ile tam CRM yönetimi
- **Otomatik Senkronizasyon** sistemi
- **Website Analiz** araçları (CMS, E-ticaret, Hız testi)
- **Pivot Table** raporlama sistemi
- **Renk Kodlu** durum takibi

## 📁 Dosya Yapısı

```
Google-Sheets-CRM/
├── backend.js              # Ana CRM sistemi
├── test.js                 # Test fonksiyonları
├── appointmentDialog.html  # Randevu dialog template
├── opportunityDialog.html  # Fırsat dialog template
├── meetingDialog.html      # Toplantı dialog template
├── README.md              # Bu dosya
└── docs/
    ├── technical-specification.md  # Teknik özellikler
    ├── sistem_semasi.md           # Sistem şeması
    └── sayfa_kolonlari.md         # Sayfa kolonları
```

## 🚀 Kurulum

### 0. Ham Veri Formatı

**Desteklenen Ham Veri Formatı (v3):**
```
Keyword | Location | Company name | Category | Website | Phone | Email 1 | Email 2 | Email 3 | Address | City | State | Pincode | Rating count | Review | Cid
```

**Örnek Veri:**
```
hırdavat | izmit | MAZLUM TEKNİK HIRDAVAT | Department store | | 0532 748 04 20 | | | | İZMİT SANAYİ SİTESİ 401 BLOK NO, D:5, 41140 Kocaeli | İzmit/Kocaeli | | 41140 | 264 | 4.2 | https://maps.google.com/?cid=13065953095889504726
```

### 1. Google Sheets'e Kod Ekleme

1. Google Sheets dosyanızı açın
2. **Extensions** → **Apps Script** seçin
3. `backend.js` dosyasının içeriğini kopyalayıp yapıştırın
4. HTML dosyalarını da ekleyin:
   - `appointmentDialog.html`
   - `opportunityDialog.html`
   - `meetingDialog.html`

### 2. Test Fonksiyonları

1. `test.js` dosyasının içeriğini de ekleyin
2. `quickSystemCheck()` fonksiyonunu çalıştırın
3. Tüm testlerin başarılı olduğunu kontrol edin

## 📊 CRM Fonksiyonları

### 🔧 Core CRM Fonksiyonları (1-5)

#### 1. Yeni Tablo oluştur
- **Buton:** "Yeni Tablo oluştur"
- **İşlev:** Ham veri → Format Tablo
- **Kullanım:** Ham veriyi standart formata çevirir

#### 2. Randevu al
- **Buton:** "Randevu al"
- **İşlev:** Format Tablo → Randevularım
- **Kullanım:** Seçilen satırdan randevu oluşturur

#### 3. Fırsat ekle
- **Buton:** "Fırsat ekle"
- **İşlev:** Format Tablo → Fırsatlarım
- **Kullanım:** Seçilen satırdan fırsat oluşturur

#### 4. Toplantıya Geç
- **Buton:** "Toplantıya Geç"
- **İşlev:** Randevularım → Toplantılarım
- **Kullanım:** Teyitlenmiş randevuyu toplantıya çevirir

#### 5. Rapor oluştur
- **Buton:** "📊 Rapor oluştur"
- **İşlev:** Pivot Table raporları oluşturur
- **Kullanım:** Tüm aktiviteleri analiz eder

### 🌐 Website Analiz Fonksiyonları (6-8)

#### 6. CMS ALTYAPI
- **Buton:** "🔍 CMS ALTYAPI"
- **İşlev:** Website CMS tespiti
- **Çıktı:** CMS Adı, CMS Grubu kolonları

#### 7. E-TİCARET İZİ
- **Buton:** "🛒 E-TİCARET İZİ"
- **İşlev:** E-ticaret tespiti
- **Çıktı:** E-Ticaret İzi kolonu (0-100% güven)

#### 8. HIZ TESTİ
- **Buton:** "⚡ HIZ TESTİ"
- **İşlev:** Website hız ölçümü
- **Çıktı:** Site Hızı kolonu

### 🛠️ Veri Yönetimi Fonksiyonları (9-10)

#### 9. Telefon olmayanları sil
- **Buton:** "Telefon olmayanları sil"
- **İşlev:** Telefon numarası olmayan satırları siler

#### 10. Cep sabit ayarla
- **Buton:** "Cep sabit ayarla"
- **İşlev:** Telefon numaralarını kategorize eder

### 🔄 Senkronizasyon Sistemi (11-12)

#### 11. Otomatik Senkronizasyon
- **Trigger:** `onEdit` eventi
- **İşlev:** Temsilci → Yönetici otomatik senkronizasyon

#### 12. Manuel Senkronizasyon
- **Buton:** "Senkronize Et"
- **İşlev:** Manuel toplu senkronizasyon

## 🎨 Renk Kodları

| Durum | Renk Kodu | Açıklama |
|-------|-----------|----------|
| Randevu Alındı | #E3F2FD | Açık Mavi |
| Teyitlendi | #E8F5E8 | Yeşil |
| Ertelendi | #FFF3E0 | Turuncu |
| İptal | #FFEBEE | Kırmızı |
| Fırsat | #FFF8E1 | Sarı |
| Toplantı Tamamlandı | #C8E6C9 | Koyu Yeşil |

## 📋 Kullanım Kılavuzu

### 1. İlk Kurulum

```javascript
// Google Apps Script'te çalıştırın
function setupCRM() {
  quickSystemCheck();
  console.log('CRM sistemi hazır!');
}
```

### 2. Yeni Tablo Oluşturma

1. **Ham veri** sayfasına verilerinizi yükleyin (v3 formatı)
2. CRM menüsünden **"Yeni Tablo oluştur"** seçin
3. Tablo ismini girin (örn: "Format Tablo 1")
4. Sistem otomatik olarak:
   - Tüm kolonları eşleştirir
   - Cid'yi Maplink'e dönüştürür
   - Gerekli sistem kolonlarını ekler
   - Renk kodlaması uygular

### 3. Randevu Alma

1. **Format Tablo**'da bir satır seçin
2. CRM menüsünden **"Randevu al"** seçin
3. Formu doldurun ve **"Randevu Oluştur"** tıklayın
4. Sistem otomatik olarak **Randevularım**'a ekler

### 4. Fırsat Ekleme

1. **Format Tablo**'da bir satır seçin
2. CRM menüsünden **"Fırsat ekle"** seçin
3. Formu doldurun ve **"Fırsat Oluştur"** tıklayın
4. Sistem otomatik olarak **Fırsatlarım**'a ekler

### 5. Toplantıya Geçme

1. **Randevularım**'da teyitlenmiş bir randevu seçin
2. CRM menüsünden **"Toplantıya Geç"** seçin
3. Toplantı detaylarını girin
4. Sistem otomatik olarak **Toplantılarım**'a ekler

### 6. Rapor Oluşturma

1. CRM menüsünden **"📊 Rapor oluştur"** seçin
2. Sistem otomatik olarak **Raporlarım** sayfasında pivot table oluşturur
3. Aktivite dağılımı ve özet bilgileri görüntülenir

## 🔧 Test Sistemi

### Hızlı Test

```javascript
// Temel sistem kontrolü
quickSystemCheck();
```

### Tam Test

```javascript
// Tüm fonksiyonları test eder
testCRMSystem();
```

### Belirli Fonksiyon Testi

```javascript
// Belirli bir fonksiyonu test eder
testSpecificFunction('createNewTable');
```

## 📊 Raporlama

### Temsilci Raporları

- **Kaynak:** Kişisel aktivite verileri
- **İçerik:** Aktivite türü, sayı, yüzde
- **Alt Kırılımlar:** Randevu Alındı → Teyitlendi/Ertelendi/İptal

### Yönetici Raporları

- **Kaynak:** Tüm temsilcilerin verileri
- **İçerik:** Temsilci bazında aktivite dağılımı
- **Filtreleme:** Tarih, temsilci, aktivite türü

## 🔄 Senkronizasyon

### Otomatik Senkronizasyon

- **Trigger:** Her hücre değişikliğinde
- **Kapsam:** Randevularım, Fırsatlarım, Toplantılarım
- **Hız:** Anında (1-2 saniye)

### Manuel Senkronizasyon

- **Buton:** CRM → "Senkronize Et"
- **Kapsam:** Tüm veriler
- **Kullanım:** İnternet sorunu, test, manuel kontrol

## 🛠️ Sorun Giderme

### Yaygın Sorunlar

1. **Menü görünmüyor**
   - Sayfayı yenileyin
   - `onOpen()` fonksiyonunu manuel çalıştırın

2. **Dialog açılmıyor**
   - HTML dosyalarının doğru eklendiğini kontrol edin
   - Console'da hata mesajlarını kontrol edin

3. **Veri kaydedilmiyor**
   - Seçili satırın doğru olduğunu kontrol edin
   - Başlık satırını seçmediğinizden emin olun

4. **Renk kodları çalışmıyor**
   - Conditional formatting ayarlarını kontrol edin
   - Durum değerlerinin doğru olduğunu kontrol edin

### Debug Modu

```javascript
// Debug modunu aktifleştirin
function enableDebugMode() {
  console.log('Debug mode enabled');
  // Tüm console.log çıktılarını görün
}
```

## 📞 Destek

### Sistem Gereksinimleri

- Google Sheets hesabı
- Apps Script erişimi
- Modern web tarayıcısı

### Performans

- **Website Analizi:** 200-300 URL için ~2-3 dakika
- **Batch İşlem:** 50 URL/grup
- **Timeout:** 5 saniye/URL
- **Senkronizasyon:** Anında

## 🔄 Güncellemeler

### v1.0 (2025-07-08)
- ✅ Core CRM fonksiyonları (1-5)
- ✅ HTML dialog template'leri
- ✅ Test sistemi
- ✅ Renk kodlama
- ✅ Pivot table raporlama

### Gelecek Sürümler
- 🔄 Website analiz fonksiyonları (6-8)
- 🔄 Veri yönetimi fonksiyonları (9-10)
- 🔄 Gelişmiş senkronizasyon sistemi (11-12)
- 🔄 API entegrasyonları
- 🔄 Mobil uygulama desteği

## 📄 Lisans

Bu proje özel kullanım için geliştirilmiştir.

---

**📧 İletişim:** CRM Development Team  
**📅 Son Güncelleme:** 08.07.2025  
**🔧 Versiyon:** 1.0 