# 🔄 CRM SİNKRONİZASYON SİSTEMİ - KURULUM VE KULLANIM

## 📋 GENEL BAKIŞ

Bu sistem, 6 Temsilci dosyasından verileri toplayıp 1 Yönetici dosyasında birleştiren otomatik senkronizasyon sistemidir.

### 🏗️ MİMARİ
- **6 Temsilci Dosyası** → **1 Yönetici Dosyası**
- **Randevularım** → **Randevular**
- **Fırsatlarım** → **Fırsatlar**  
- **Toplantılarım** → **Toplantılar**

## 📁 DOSYA YAPISI

### Temsilci Dosyaları (6 adet):
```
LG 001: 1JdU8uIXOcmSQ1c70OOklcR97tqdmDTeCeikpa8DHltE
NT 002: 1Q6IIfbIlTTM8hf1Nv67KLiHGzoAJUBWIhp7rOel9ngQ
KO 003: 1uLufPJqFSfm1WxqSzcvDOKW_hAv8AMhkQwljeiD51mc
SB 004: 17RWqUrQ_m9h0ktJQ_E_55dt-Ao-RA01O6pUFbZ9DxDs
KM 005: 11veeCnPYRPGEWMzZzpLiwUOSNvPhp8n_qHEiDi7lXlw
CA 006: 1XiIyORsVR14hMNu7xJjLs2wHxBYmDskGCzCHGb0IwN8
```

### Yönetici Dosyası (1 adet):
```
FSA 019: 11IsZpaGgXtgpxrie9F_uVwp6uJPcueGhqB73WhZn60A
```

## 🚀 KURULUM ADIMLARI

### 1. YÖNETİCİ DOSYASINA KOD EKLEME

1. **FSA 019** dosyasını açın
2. **Extensions** → **Apps Script** menüsüne gidin
3. **Code.gs** dosyasını açın
4. `manager-sync.js` dosyasının içeriğini kopyalayıp yapıştırın
5. **Save** butonuna tıklayın

### 2. HTML DİALOG EKLEME

1. **+** butonuna tıklayın (yeni dosya)
2. **HTML** seçin
3. Dosya adını `managerMeetingDialog` olarak değiştirin
4. `managerMeetingDialog.html` dosyasının içeriğini kopyalayıp yapıştırın
5. **Save** butonuna tıklayın

### 3. İZİNLERİ AYARLAMA

1. **Deploy** → **New deployment** tıklayın
2. **Type**: **Web app** seçin
3. **Execute as**: **Me** seçin
4. **Who has access**: **Only myself** seçin
5. **Deploy** butonuna tıklayın

## 🎯 KULLANIM

### YÖNETİCİ DOSYASINDA MENÜLER

Açıldığında otomatik olarak **SYNC** menüsü oluşur:

```
SYNC
├── Tüm Verileri Topla
├── Toplantı Ekle
└── Synchronization Status
```

### 📊 VERİ TOPLAMA

1. **SYNC** → **Tüm Verileri Topla** tıklayın
2. Sistem otomatik olarak:
   - Her Temsilci dosyasına bağlanır
   - Randevularım, Fırsatlarım, Toplantılarım verilerini okur
   - Yönetici dosyasında ilgili sayfalara kopyalar
   - Temsilci Kodu kolonu ekler
   - İstatistikleri günceller

### 📈 SONUÇLAR

**Randevular** sayfasında:
- Temsilci Kodu | Kod | Şirket Adı | Telefon | Mail | Adres | Randevu Tarihi | Aktivite | Kaynak | Yönetici Not

**Fırsatlar** sayfasında:
- Temsilci Kodu | Kod | Şirket Adı | Telefon | Mail | Adres | Fırsat Tarihi | Fırsat Durumu | Kaynak | Yönetici Not

**Toplantılar** sayfasında:
- Temsilci Kodu | Kod | Şirket Adı | Telefon | Mail | Adres | Toplantı Tarihi | Toplantı Saati | Randevu Durumu | Toplantı Sonucu | Kaynak | Yönetici Not

**Raporlar** sayfasında:
- Senkronizasyon tarihi ve istatistikler

### 🗓️ YÖNETİCİ TOPLANTI EKLEME

1. **SYNC** → **Toplantı Ekle** tıklayın
2. Hangi Temsilci için toplantı eklemek istediğinizi seçin
3. Formu doldurun:
   - Şirket Adı (zorunlu)
   - Telefon, Mail, Adres (opsiyonel)
   - Toplantı Tarihi ve Saati (zorunlu)
   - Randevu Durumu (zorunlu)
   - Toplantı Sonucu (zorunlu)
   - Yönetici Not (opsiyonel)
4. **Toplantı Ekle** butonuna tıklayın
5. Sistem otomatik olarak:
   - Seçilen Temsilci dosyasına toplantıyı ekler
   - Yönetici dosyasını günceller

## 🔧 TEKNİK DETAYLAR

### FONKSİYONLAR

**Ana Fonksiyonlar:**
- `collectAllData()` - Tüm verileri toplar
- `collectEmployeeData()` - Tek Temsilci verilerini toplar
- `updateManagerSheet()` - Yönetici sayfasını günceller
- `addManagerMeeting()` - Yönetici toplantı ekler

**Yardımcı Fonksiyonlar:**
- `showSyncStatus()` - Senkronizasyon durumunu gösterir
- `createManagerMenu()` - Menüyü oluşturur

### HATA YÖNETİMİ

- Her Temsilci dosyası ayrı ayrı işlenir
- Hata durumunda diğer dosyalar etkilenmez
- Hatalar Raporlar sayfasında listelenir
- Console'da detaylı loglar tutulur

### GÜVENLİK

- Sadece yetkili kullanıcılar erişebilir
- Veri değişikliği yapılmaz, sadece kopyalanır
- Eski veriler temizlenir, yenileri eklenir

## 📝 NOTLAR

### ÖNEMLİ UYARILAR:
1. **İnternet bağlantısı** gereklidir
2. **Google Sheets API limitleri** vardır
3. **Büyük dosyalar** için zaman aşımı olabilir
4. **Temsilci dosyaları** açık olmalıdır

### PERFORMANS:
- 6 dosya için ~30-60 saniye
- Her dosya ~5-10 saniye
- Büyük veri setleri için daha uzun sürebilir

### YEDEKLEME:
- Senkronizasyon öncesi yedek alın
- Kritik veriler için manuel kontrol yapın
- Raporlar sayfasındaki istatistikleri kontrol edin

## 🆘 SORUN GİDERME

### YAYGIN SORUNLAR:

**"Dosya bulunamadı" hatası:**
- Dosya ID'lerini kontrol edin
- Dosya erişim izinlerini kontrol edin
- Dosyanın silinmediğinden emin olun

**"İzin hatası":**
- Google hesabınızı kontrol edin
- Dosya sahipliğini kontrol edin
- Apps Script izinlerini yeniden verin

**"Zaman aşımı" hatası:**
- İnternet bağlantınızı kontrol edin
- Dosya boyutunu kontrol edin
- Tek tek Temsilci dosyalarını deneyin

### DESTEK:
- Console loglarını kontrol edin
- Raporlar sayfasındaki hataları okuyun
- Tek dosya ile test edin

## 🎉 BAŞARI KRİTERLERİ

✅ Yönetici dosyasında **SYNC** menüsü görünür
✅ **Tüm Verileri Topla** çalışır
✅ **Randevular**, **Fırsatlar**, **Toplantılar** sayfaları oluşur
✅ **Temsilci Kodu** kolonu eklenir
✅ **Raporlar** sayfasında istatistikler görünür
✅ **Toplantı Ekle** fonksiyonu çalışır
✅ Hata durumunda bilgi verilir

---

**Sistem hazır! 🚀** 