# 🏢 CRM Sistemi - Tam Şema

## 📊 **Sistem Genel Bakış**

### 🎯 **Ana Amaç:**
Google Sheets üzerinde çok kullanıcılı CRM sistemi ile temsilci-yönetici senkronizasyonu ve değişiklik takibi.

### 🏢 **CRM SİSTEM MİMARİSİ:**

**1️⃣ TEMSİLCİ DOSYALARI (6 adet):**
- **LG 001 - Calisma Dosyasi** (Temsilci 1 - Levent Gül)
- **AK 002 - Calisma Dosyasi** (Temsilci 2 - Ahmet Kaya)
- **MT 003 - Calisma Dosyasi** (Temsilci 3 - Mehmet Tekin)
- **AY 004 - Calisma Dosyasi** (Temsilci 4 - Ayşe Yılmaz)
- **FD 005 - Calisma Dosyasi** (Temsilci 5 - Fatma Demir)
- **SK 006 - Calisma Dosyasi** (Temsilci 6 - Selim Korkmaz)

**Her Temsilci Dosyasında:**
- 📅 **Randevularım** sayfası
- 💼 **Fırsatlarım** sayfası
- 🤝 **Toplantılarım** sayfası
- 📊 **Raporlarım** sayfası

**2️⃣ YÖNETİCİ DOSYASI (1 adet):**
- **FSA 019 - Yonetici Takip Dosyasi** (Merkezi kontrol)

**Yönetici Dosyasında:**
- 📅 **Randevular** (Tüm temsilcilerin randevuları)
- 💼 **Fırsatlar** (Tüm temsilcilerin fırsatları)
- 🤝 **Toplantılar** (Tüm temsilcilerin toplantıları)
- 📊 **Raporlar** (Tüm temsilcilerin raporları)
- ⚙️ **Config** (Sistem ayarları ve loglar)

**ÖNEMLİ:** Yönetici dosyasında Ham veri ve Format Tablo sayfaları YOK! Bu sayfalar sadece temsilci dosyalarında bulunur.

### 🔄 **VERİ AKIŞI MİMARİSİ:**

```
Temsilci 1 (LG 001 - Levent Gül) → Yönetici Dashboard
Temsilci 2 (AK 002 - Ahmet Kaya) → Yönetici Dashboard
Temsilci 3 (MT 003 - Mehmet Tekin) → Yönetici Dashboard
Temsilci 4 (AY 004 - Ayşe Yılmaz) → Yönetici Dashboard
Temsilci 5 (FD 005 - Fatma Demir) → Yönetici Dashboard
Temsilci 6 (SK 006 - Selim Korkmaz) → Yönetici Dashboard
```

### ⚙️ **SENKRONİZASYON MANTIĞI:**

**Her Temsilci Dosyasında:**
- Temsilci kendi verilerini girer
- **Otomatik Senkronizasyon:** Her değişiklikte Apps Script otomatik olarak Yönetici Dashboard'a gönderir
- **Manuel Buton:** "Senkronize Et" butonu ile manuel tetikleme
- Yönetici tüm temsilcilerin verilerini tek yerden görür
- Aynı Apps Script kodu tüm temsilci dosyalarında kullanılır

### 🔄 **SENKRONİZASYON YÖNTEMLERİ:**

**1️⃣ OTOMATİK SENKRONİZASYON:**
- **Trigger:** Google Sheets `onEdit` eventi
- **Çalışma:** Her hücre değişikliğinde tetiklenir
- **Kapsam:** Sadece CRM sayfaları (Randevularım, Fırsatlarım, Toplantılarım)
- **Hız:** Anında (1-2 saniye)

**2️⃣ MANUEL BUTON:**
- **Konum:** Google Sheets menüsünde "CRM" sekmesi
- **Buton:** "Senkronize Et" butonu
- **Çalışma:** Tüm verileri toplu olarak gönderir
- **Kullanım:** İnternet sorunu, test, manuel kontrol için

### ⚡ **TEKNİK DETAYLAR:**

**Otomatik Sistem:**
```javascript
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName();
  
  if (['Randevularım', 'Fırsatlarım', 'Toplantılarım'].includes(sheetName)) {
    syncToManager(e);
  }
}
```

**Manuel Buton:**
```javascript
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('CRM')
    .addItem('Senkronize Et', 'manualSync')
    .addToUi();
}
```

---

## 👥 **Kullanıcı Rolleri**

### 👤 **Temsilciler (Arama Yapanlar):**
- **Randevularım** → Kişisel randevuları
- **Fırsatlarım** → Kişisel fırsatları  
- **Toplantılarım** → Kişisel toplantıları
- **Raporlarım** → Kişisel aktivite sayıları (Pivot Table)

### 👨‍💼 **Yöneticiler (Toplantı Yapanlar):**
- **Randevular** → Tüm temsilcilerin randevuları
- **Fırsatlar** → Tüm temsilcilerin fırsatları
- **Toplantılar** → Tüm temsilcilerin toplantıları
- **Raporlar** → Tüm temsilcilerin aktivite sayıları (Pivot Table)

### 📊 **Raporlarım/Raporlar Özellikleri:**
- **Dinamik Pivot Tablolar:** Otomatik güncellenen raporlar
- **Filtreleme:** Tarih, aktivite türü, durum bazında
- **Alt Kırılımlar:** Randevu Alındı → Teyitlendi/Ertelendi/İptal
- **Tüm Aktiviteler:** Format Tablo'daki tüm aktivite türleri dahil

---

## 🔄 **Veri Akışı**

```
1. VERİ TOPLAMA
   ↓
Google Extractor (v1, v2, v3...): Web'den veri çıkarır (versiyonlar değişebilir)
Trendyol Data: Pazaryeri verilerini toplar (ileri zamanlarda)
Diğer Pazaryerleri: Farklı sitelerden veri alır (ileri zamanlarda)
   ↓
2. VERİ İŞLEME
   ↓
Ham veri ──→ Format tablo (Standartlaştırma) → "Yeni Tablo 1, 2, 3..."
   ↓
3. CRM MODÜLLERİ
   ↓
Format Tablo (Randevu Alındı) → Randevularım → Toplantılarım
Format Tablo (Fırsat) → Fırsatlarım → Randevularım (duruma göre)
   ↓
4. RAPORLAMA
   ↓
Raporlarım (Pivot Table)
```

### 📋 **Detaylı Açıklama:**

**1. VERİ TOPLAMA:**
- **Google Extractor (v1, v2, v3...):** Web'den veri çıkarır (versiyonlar değişebilir)
- **Trendyol Data:** Pazaryeri verilerini toplar (ileri zamanlarda)
- **Diğer Pazaryerleri:** Farklı sitelerden veri alır (ileri zamanlarda)
- **Format Tablo:** Tüm farklı formatları standart formata çevirir (sabit yapı)

**2. VERİ İŞLEME (Sadece Temsilci Dosyalarında):**
- **Format tablo:** Veriler düzenli hale getirilir, "Yeni Tablo 1, 2, 3..." isimlendirilir
- **Standartlaştırma:** Tüm farklı formatları standart formata çevirir (sabit yapı)

**3. CRM MODÜLLERİ (Temsilci → Yönetici):**
- **Temsilci:** Randevularım, Fırsatlarım, Toplantılarım, Raporlarım
- **Yönetici:** Randevular, Fırsatlar, Toplantılar, Raporlar
- **Senkronizasyon:** Temsilci verileri otomatik olarak yönetici dosyasına aktarılır

**4. RAPORLAMA:**
- **Temsilci Raporlarım:** Kişisel aktivite sayıları (Pivot Table)
- **Yönetici Raporlar:** Tüm temsilcilerin toplam aktiviteleri (Pivot Table)

### 📅 **Randevu Süreci:**

**Format Tablo → Randevularım:**
- Format Tablo'da "Randevu Alındı" seçilen veriler Randevularım'a geçer
- Randevularım sayfası sabit kalır, yeni tablolar eklenir

**Randevu Durumu Değişiklikleri:**
- **Temsilci/Yönetici** arayıp durumu günceller
- **Durumlar:** Teyitlendi, Ertelendi, İptal oldu
- **Alt aktivite:** Randevu Alındı'nın alt kırılımı

**Randevularım → Toplantılarım:**
- Randevu teyitlendiğinde Toplantılarım'a geçer
- Format Tablo'dan direkt Toplantılarım'a geçiş YOK!

### 💼 **Fırsat Süreci:**

**Fırsatlarım → Randevularım:**
- Fırsat takibi sırasında müşteri randevu isterse
- Fırsatlarım'dan satır seçilir → Randevu Alındı yapılır
- **Aktivite değişir:** Bilgi Verildi → Randevu Alındı
- **Renk değişir:** Fırsat rengi → Randevu rengi
- **Kopyalanır:** Fırsatlarım → Randevularım

---

## 🔗 **Senkronizasyon Sistemi**

### 📊 **Sayfa Eşleşmeleri:**

```
Temsilci Sayfaları          Yönetici Sayfaları
├── Randevularım    ←→       Randevular
├── Fırsatlarım     ←→       Fırsatlar  
├── Toplantılarım   ←→       Toplantılar
└── Raporlarım      ←→       Raporlar
```

### 🔄 **Senkronizasyon Kuralları:**

**1. Randevu Sistemi:**
```
Temsilci: Randevularım'da değişiklik → Yönetici: Randevular'da görünür
Yönetici: Randevular'da değişiklik → Temsilci: Randevularım'ında güncellenir
```

**2. Fırsat Sistemi:**
```
Temsilci: Fırsatlarım'da değişiklik → Yönetici: Fırsatlar'da görünür
Yönetici: Fırsatlar'da değişiklik → Temsilci: Fırsatlarım'ında güncellenir
```

**3. Toplantı Sistemi:**
```
Temsilci: Toplantılarım'da değişiklik → Yönetici: Toplantılar'da görünür
Yönetici: Toplantılar'da değişiklik → Temsilci: Toplantılarım'ında güncellenir
```

**4. Rapor Sistemi:**
```
Temsilci: Raporlarım (Pivot) → Kişisel aktivite sayıları
Yönetici: Raporlar (Pivot) → Tüm temsilcilerin toplam aktiviteleri
```

**Rapor Senkronizasyonu:**
- Temsilci aktiviteleri değiştiğinde → Yönetici raporunda otomatik güncellenir
- Yönetici filtreleme yaptığında → Temsilci bazında detay görünür
- Pivot tablolar dinamik olarak güncellenir

### ⚙️ **Teknik Detaylar:**
- ✅ **Tüm kolonlar** senkronize edilir
- ✅ **Tam eşleşme** sağlanır
- ✅ **Gerçek zamanlı** güncelleme
- ✅ **Değişiklik takibi** otomatik kaydedilir

---

## 📈 **Raporlama Sistemi (Pivot Table)**

### 📊 **Temsilci Raporlarım (Pivot):**
```
Filtreler:
├── Tarih aralığı
├── Aktivite türü (TÜM AKTİVİTELER)
└── Durum

Görünüm:
├── Aktivite Türü | Sayı
├── Randevu Alındı | 12
│   ├── Teyitlendi | 8
│   ├── Ertelendi | 3
│   └── İptal | 1
├── İleri Tarih Randevu | 5
├── Yeniden Aranacak | 8
├── Bilgi Verildi | 15
├── Teklif İletildi | 10
├── İlgilenmiyor | 3
├── Ulaşılamadı | 2
└── TOPLAM | 55
```

### 👨‍💼 **Yönetici Raporlar (Pivot):**
```
Filtreler:
├── Temsilci (Ahmet, Ayşe, Mehmet...)
├── Tarih aralığı
├── Aktivite türü (TÜM AKTİVİTELER)
└── Durum

Görünüm:
├── Temsilci | Randevu Alındı | İleri Tarih | Yeniden Aranacak | Bilgi Verildi | Teklif İletildi | İlgilenmiyor | Ulaşılamadı | TOPLAM
│           │   ├─Teyitlendi  │             │                  │               │                │              │             │
│           │   ├─Ertelendi   │             │                  │               │                │              │             │
│           │   └─İptal       │             │                  │               │                │              │             │
├── Ahmet    | 5              | 2           | 3                | 8             | 4              | 3            | 2           | 27
│           │ ├─3 Teyitlendi │             │                  │               │                │              │             │
│           │ ├─1 Ertelendi  │             │                  │               │                │              │             │
│           │ └─1 İptal      │             │                  │               │                │              │             │
├── Ayşe     | 3              | 1           | 2                | 5             | 3              | 2            | 1           | 17
├── Mehmet   | 4              | 2           | 3                | 2             | 3              | 1            | 1           | 16
└── GENEL TOPLAM | 12         | 5           | 8                | 15            | 10             | 6            | 4           | 60
```

---

## 🔍 **Değişiklik Takibi**

### 📝 **Kaydedilen Bilgiler:**
- **Kim:** Hangi kullanıcı değişiklik yaptı
- **Ne:** Hangi veriyi değiştirdi
- **Ne zaman:** Değişiklik tarihi ve saati
- **Hangi sayfa:** Hangi sayfada değişiklik yapıldı
- **Hangi hücre:** Satır ve kolon bilgisi
- **Eski değer:** Değişiklik öncesi veri
- **Yeni değer:** Değişiklik sonrası veri

### 📊 **Raporlama:**
- ✅ **Otomatik kayıt:** Her değişiklik anında kaydedilir
- ✅ **Filtreleme:** Tarih, kullanıcı, sayfa bazında
- ✅ **Özet raporlar:** Günlük, haftalık, aylık
- ✅ **E-posta bildirimleri:** Önemli değişiklikler için

---

## 🎯 **Sistem Avantajları**

### ✅ **Özellikler:**
- **4 sayfa senkronizasyonu**
- **Otomatik sayım sistemi**
- **Gerçek zamanlı güncelleme**
- **Yönetici tüm aktiviteleri görür**
- **Mevcut yapıyı bozmaz**
- **Filtreleme ve analiz**
- **Karşılaştırmalı raporlar**

### 🚀 **Performans:**
- **Hızlı senkronizasyon**
- **Güvenilir veri tutarlılığı**
- **Kolay kullanım**
- **Detaylı raporlama**

---

## 🔧 **Sistem Fonksiyonları (12 Ana Fonksiyon)**

## 🎛️ **3 Ayrı Butonlu Site Analiz Sistemi**

### ⚡ **HIZ TESTİ BUTONU**
- 200-300 URL için ~2-3 dakika
- HTTP response time ölçümü
- API key gerektirmez
- "Site Hızı" kolonuna yazılır

### 🔍 **CMS ALTYAPI BUTONU**
- 200-300 URL için ~2-3 dakika
- HTML kaynak kodundan CMS tespiti
- Türkiye ve uluslararası CMS'ler
- "CMS Adı" ve "CMS Grubu" kolonlarına yazılır

### 🛒 **E-TİCARET İZİ BUTONU**
- 200-300 URL için ~2-3 dakika
- 5 farklı yöntemle e-ticaret tespiti
- Güven skoru hesaplama (0-100%)
- "E-Ticaret İzi" kolonuna yazılır

**Her buton bağımsız çalışır, istediğiniz sırayla kullanabilirsiniz!**

---

### 📄 **Funktion 1: Yeni Tablo oluştur (Create New Table)**

**Buton Adı:** Yeni Tablo oluştur (Create New Table)

**İlgili Sayfalar:** `Ham veri` → `Format Tablo`

**Nasıl Çalışır:** Kullanıcı "format" butonuna tıkladığında sistem isim sorar. Ham veriyi alır ve verilen isimle yeni bir `Format Tablo` oluşturur, ilgili kolonları önceden tanımlanmış başlıklar altında akıllıca yerleştirir.

**Amaç:** Çeşitli kaynaklardan gelen verileri (farklı kolon düzenlemeleri olabilir) tutarlı bir formata standartlaştırmak, aranabilir ve kullanılabilir hale getirmek.

**Özel Kural:** Ham verinin orijinal formatı (örn. sayı, metin) `Format Tablo`'ya aktarılırken korunur.

**Kolon Detayları:**
- **Otomatik Kolonlar:** Keyword, Location, Company name, Category, Website, Phone, Address, City, Rating count, Review, Maplink
- **Manuel Kolonlar:** Yetkili Tel, Mail, İsim Soyisim, Yorum, Yönetici Not
- **Sistem Kolonları:** Kod (otomatik üretilir), Aktivite, Aktivite Tarihi, Log
- **Analiz Kolonları:** CMS Adı, CMS Grubu, E-Ticaret İzi, Site Hızı, Site Trafiği

---

### 📄 **Funktion 2: Randevu al (Take Appointment)**

**Buton Adı:** Randevu al (Take Appointment)

**İlgili Sayfalar:** `Format Tablo`'dan seçilen satır → `Randevularım`

**Nasıl Çalışır:** Kullanıcı `Format Tablo`'da bir satır seçer ve "Randevu al"a tıklar. Bazı bilgileri önceden dolduran bir pop-up penceresi açılır. Kullanıcı ek detayları manuel olarak girer ve satır `Randevularım` sayfasına aktarılır.

**Amaç:** `Format Tablo` öncelikle arama için, `Randevularım` ise randevu takibi için kullanılır.

**Özel Kurallar:**
- Belirli bir satır sadece bir kez aktarılabilir. İkinci bir deneme yapılırsa uyarı mesajı görünür.
- Randevu alındıktan sonra durumu "Ertelendi" veya "İptal oldu" olarak güncellenebilir.

Açılan pencere formatı 
Otomatık doldurulan 
Kod	9.Keyword	10.Location	11.Company name	12.Category	13.Website	14.Phone Address	15.City 16.Maplink
Manuel girilen 
1.İsim Soyisim (zorunlu) 4.Saat 5.Yetkili Tel	6.Mail	 7.Yorum	8.Yönetici Not  

Yarı otomatık yarı manuel gırılen 

2.Aktivite (varsayılan Randevu Alındı çıkar ama İleri Tarih Randevu ya da manuel çevire bilir)	3.Aktivite Tarihi (varsayılan yarınki tarih çıkar ama isterse elle değişe bilir) 


---

### 📄 **Funktion 3: Fırsat ekle (Add Opportunity)**

**Buton Adı:** Fırsat ekle (Add Opportunity)

**İlgili Sayfalar:** `Format Tablo`'dan seçilen satır → `Fırsatlarım`

**Nasıl Çalışır:** Kullanıcı `Format Tablo`'da bir satır seçer ve "Fırsat ekle"ye tıklar. Bazı bilgileri önceden dolduran bir pop-up penceresi açılır. Kullanıcı ek detayları manuel olarak girer ve satır `Fırsatlarım` sayfasına aktarılır.

**Amaç:** `Format Tablo` öncelikle arama için, `Fırsatlarım` ise satış fırsatlarını takip etmek için kullanılır.

**Özel Kurallar:**
- Belirli bir satır sadece bir kez aktarılabilir. İkinci bir deneme yapılırsa uyarı mesajı görünür.
- **Funktion 3a:** `Fırsatlarım`'daki bir fırsat daha sonra randevuya dönüşebilir. Bu durumda o satır `Randevularım` sayfasına kopyalanmalıdır.

---

### 📄 **Funktion 4: Randevularım'dan Toplantılarım'a Kopyalama**

**Buton Adı:** Toplantıya Geç (Move to Meeting)

**İlgili Sayfalar:** `Randevularım` → `Toplantılarım`

**Nasıl Çalışır:** Randevularım sayfasında gerçekleşen toplantıyı Toplantılarım sayfasına kopyalar.

**Amaç:** Randevu teyitlendiğinde toplantı sürecine geçiş yapmak.

**Özel Kurallar:**
- Sadece teyitlenmiş randevular toplantıya geçebilir.
- Toplantı tamamlandıktan sonra sonuç kaydedilir.

---

### 📄 **Funktion 5: Rapor oluştur (Generate Report)**

**Buton Adı:** Rapor oluştur (Generate Report)

**İlgili Sayfalar:** `Randevularım`, `Fırsatlarım`, `Toplantılarım` → `Raporlarım`

**Nasıl Çalışır:** `Randevularım`, `Fırsatlarım` ve `Toplantılarım`'daki satırlar ve durumlar kullanılarak `Raporlarım`'da günlük, haftalık, aylık, çeyreklik ve yıllık raporlar oluşturulur. Bu ayrıca `Format Tablo`'dan ayrı sayfaları olmayan "Ulaşılamadı" ve "İlgilenmiyor" durumlarını da içerir. Raporlama için pivot tablolar ve grafikler kullanılabilir.

**Amaç:** Aktiviteleri sayısal formda görselleştirmek ve takip etmek.

**Özel Kural:** Raporlar mevcut aktivitelerden dinamik olarak veri çekecek ve aktiviteler değiştikçe sayısal değerler otomatik olarak güncellenecektir.

---

### 📄 **Funktion 6: CMS analizi yapıyor (Performs CMS analysis)**

**Buton Adı:** 🔍 CMS ALTYAPI BUTONU

**İlgili Sayfalar:** `Format Tablo`

**Nasıl Çalışır:** 
- Sistem seçilen satırlardaki web sitelerinin HTML kaynak kodunu analiz eder
- CMS tespit algoritması ile kullanılan CMS'i belirler
- CMS grubunu kategorize eder (Türkiye E-ticaret, Uluslararası E-ticaret, Blog CMS, vb.)
- Sonuçları "CMS Adı" ve "CMS Grubu" kolonlarına kaydeder

**Tespit Edilen CMS'ler:**
- **Türkiye E-ticaret:** İdeasoft, Ticimax, T-Soft, Softtr, İkas
- **Uluslararası E-ticaret:** WooCommerce, Shopify, PrestaShop, OpenCart, Magento
- **Blog CMS:** WordPress, Joomla, Drupal
- **Website Builder:** Wix, Tilda, Squarespace

**Teknik Detaylar:**
- HTML kaynak kodundan regex pattern'ları ile tespit
- 50'şerli gruplar halinde paralel işlem
- 5 saniye timeout ile hızlı analiz
- Tanınmayan CMS'ler için "Tanınmayan CMS" etiketi

**Amaç:** Potansiyel müşterilerin kullandığı CMS teknolojileri hakkında ön bilgi toplamak ve e-ticaret potansiyelini değerlendirmek.

---

### 📄 **Funktion 7: Site e ticaret yapıyor mu yapmıyor mu onu araştırıyor**

**Buton Adı:** 🛒 E-TİCARET İZİ BUTONU

**İlgili Sayfalar:** `Format Tablo`

**Nasıl Çalışır:** 
- Sistem seçilen satırlardaki web sitelerinin HTML kaynak kodunu analiz eder
- 5 farklı yöntemle e-ticaret tespiti yapar
- Güven skoru hesaplar (0-100%)
- Sonuçları "E-Ticaret İzi" kolonuna kaydeder

**Tespit Yöntemleri:**
1. **HTML İmzaları:** "Sepete ekle", "Ödeme", "₺", "Kredi kartı" vb.
2. **Meta Tag'ler:** E-ticaret platform meta bilgileri
3. **JavaScript Dosyaları:** WooCommerce, Shopify, İdeasoft vb. JS dosyaları
4. **Form Analizi:** Ödeme formları, kredi kartı alanları
5. **URL Yapısı:** /product/, /shop/, /cart/ vb. e-ticaret URL'leri

**E-ticaret Platformları:**
- **Türkiye:** İdeasoft, Ticimax, T-Soft, Softtr, İkas
- **Uluslararası:** WooCommerce, Shopify, PrestaShop, OpenCart, Magento

**Güven Skorları:**
- **95%:** E-ticaret platformu tespit edildi
- **70%:** 2+ e-ticaret imzası bulundu
- **40%:** 1 e-ticaret imzası bulundu
- **0%:** E-ticaret izi bulunamadı

**Teknik Detaylar:**
- 50'şerli gruplar halinde paralel işlem
- 5 saniye timeout ile hızlı analiz
- 200-300 URL için ~2-3 dakika tahmini süre

**Amaç:** Potansiyel müşterilerin e-ticaret web siteleri işletip işletmediğini belirlemek ve satış potansiyelini değerlendirmek.

---

### 📄 **Funktion 8: Site hızlı mı yavaş mı onu araştırıyor**

**Buton Adı:** ⚡ HIZ TESTİ BUTONU

**İlgili Sayfalar:** `Format Tablo`

**Nasıl Çalışır:** 
- Sistem seçilen satırlardaki web sitelerinin yükleme hızını ölçer
- HTTP response time ile basit hız ölçümü yapar
- Sonuçları "Site Hızı" kolonuna kaydeder
- 50'şerli gruplar halinde paralel işlem yapar

**Ölçüm Detayları:**
- **Basit HTTP Ölçümü:** API key gerektirmez, hızlı sonuç
- **Yükleme Süresi:** Milisaniye cinsinden (örn: 1200ms)
- **HTTP Durumu:** 200, 404, 500 vb.
- **İçerik Boyutu:** Content-length header'ından alınır

**İsteğe Bağlı Detaylı Ölçüm:**
- Google PageSpeed API ile detaylı analiz
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Genel performans skoru (0-100)

**Teknik Detaylar:**
- 5 saniye timeout ile hızlı ölçüm
- Başarısız siteler için "Bilinmiyor" etiketi
- 200-300 URL için ~2-3 dakika tahmini süre

**Amaç:** Potansiyel müşterilerin web sitelerinin hızlı mı yavaş mı olduğunu anlamak ve performans değerlendirmesi yapmak.

---

### 📄 **Funktion 9: Telefon olmayan satırları siliyor**

**Buton Adı:** Telefon olmayanları sil (Delete those without phone)

**İlgili Sayfalar:** `Format Tablo`

**Nasıl Çalışır:** Sistem `Format Tablo`'da telefon numarası içermeyen satırları tanımlar ve siler, silinen satır sayısını raporlar.

**Amaç:** Telefon iletişim bilgisi olmayan girişleri kaldırarak veriyi temizlemek.

---

### 📄 **Funktion 10: Cep ve sabit telefonlar ayırt ediyor**

**Buton Adı:** Cep sabit ayarla (Set mobile/landline)

**İlgili Sayfalar:** `Format Tablo`

**Nasıl Çalışır:** Sistem kolonlardaki telefon numaralarını sıralar, bunları cep telefonu veya sabit telefon olarak kategorize eder.

**Amaç:** Veri içindeki cep telefonu ve sabit telefon numaralarını ayırt etmek.

**Açıklama:** Genellikle 005, 05 veya +905 ile başlayan numaralar cep telefon olarak tanımlanır, diğerleri sabit telefon olarak kabul edilir.

---

### 📄 **Funktion 11: Bir sheetten diğer sheete kopyalamak**

**Buton Adı:** Sheet paylaş (Share Sheet)

**İlgili Sayfalar:** `Randevularım`, `Fırsatlarım`, `Toplantılarım`, `Raporlarım` (temsilcinin kişisel sayfaları)

**Nasıl Çalışır:** Bu fonksiyon temsilcinin kişisel sayfalarından (`Randevularım`, `Fırsatlarım`, `Toplantılarım`, `Raporlarım`) yöneticinin konsolide sayfalarına (`Randevular`, `Fırsatlar`, `Toplantılar`, `Raporlar`) aynı başlıkları koruyarak veri gönderir. Bu, yöneticilerin kendi konsolide sayfalarından tüm temsilcilerin aktivitelerini gözetlemesine olanak tanır.

**Amaç:** Yöneticilerin tek bir konsolide görünümden tüm temsilcilerin aktivitelerini takip etmesini sağlamak.

**Özel Kural:** Bu süreç çift yönlü entegrasyon içerir, yani değişiklikler her iki yönde de akar.

---

### 📄 **Funktion 12: Satırları renklendirme**

**Buton Adı:** Ayrı buton gerekmez; mevcut fonksiyonlara eklenecek.

**İlgili Sayfalar:** `Randevularım-Randevular`, `Fırsatlarım-Fırsatlar`, `Toplantılarım-Toplantılar`, `Raporlarım-Raporlar`

**Nasıl Çalışır:** 
- Satırlar durumlarına göre otomatik renklendirilir
- Renk değişiklikleri hem temsilci hem yönetici sayfalarında senkronize olur
- Durum değiştiğinde renk otomatik güncellenir

**Renk Kodları:**
- **Randevu Alındı:** Açık Mavi (#E3F2FD)
- **Teyitlendi:** Yeşil (#E8F5E8)
- **Ertelendi:** Turuncu (#FFF3E0)
- **İptal:** Kırmızı (#FFEBEE)
- **Fırsat:** Sarı (#FFF8E1)
- **Toplantı Tamamlandı:** Koyu Yeşil (#C8E6C9)
- **Toplantı İptal:** Koyu Kırmızı (#FFCDD2)

**Teknik Detaylar:**
- Google Sheets API ile conditional formatting
- Renk kodları tüm sayfalarda tutarlı
- Otomatik senkronizasyon ile renk güncellemesi
- Durum değişikliği anında renk değişimi

**Amaç:** Farklı durumları görsel olarak ayırt etmek ve CRM süreçlerini kolaylaştırmak.

**Özel Kural:** Renk kodları tüm sistemde tutarlı olmalı ve kullanıcı deneyimini iyileştirmelidir. 