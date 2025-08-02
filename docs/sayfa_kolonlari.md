# 📋 Sayfa Kolonları Şeması

## 📄 Extractor Old (v1)

| Kolon Adı | Veri Tipi | Açıklama |
|-----------|-----------|----------|
| Keyword | input | |
| Location | input | |
| Company name | input | |
| Category | input | |
| Website | input | |
| CountryCode | input | |
| Phone | input | |
| Email 1 | input | |
| Email 2 | input | |
| Email 3 | input | |
| Lat | input | |
| Long | input | |
| Address | input | |
| City | input | |
| State | input | |
| Pincode | input | |
| Rating count | input | |
| Review | input | |
| Cid | input | |
| Maplink | input | |

---

## 📄 Extractor (v2)

| Kolon Adı | Veri Tipi | Açıklama |
|-----------|-----------|----------|
| Keyword | input | |
| Location | input | |
| Company name | input | |
| Category | input | |
| Website | input | |
| Phone | input | |
| Email 1 | input | |
| Email 2 | input | |
| Email 3 | input | |
| Address | input | |
| City | input | |
| State | input | |
| Pincode | input | |
| Rating count | input | |
| Review | input | |
| Cid | input | |

## 📄 Extractor New (v3)

| Kolon Adı | Veri Tipi | Açıklama |
|-----------|-----------|----------|
| Keyword | input | Arama anahtar kelimesi |
| Location | input | Konum bilgisi |
| Company name | input | Firma adı |
| Category | input | Firma kategorisi |
| Website | input | Firma web sitesi URL'si |
| Phone | input | Müşteri telefon numarası |
| Email 1 | input | E-posta adresi 1 |
| Email 2 | input | E-posta adresi 2 |
| Email 3 | input | E-posta adresi 3 |
| Address | input | Müşteri adresi |
| City | input | Şehir bilgisi |
| State | input | Eyalet/İl bilgisi |
| Pincode | input | Posta kodu |
| Rating count | input | Değerlendirme sayısı |
| Review | input | Değerlendirme metni |
| Cid | input | Google Maps CID (Maplink'e dönüştürülür) |


### 📝 **Not:**
- **Extractor versiyonları** zamanla değişebilir (v1, v2, v3...)
- **Yeni versiyonlar** geldiğinde bu dosya güncellenir
- **Format Tablo** her zaman aynı kalır (standart yapı)
- **Trendyol Data** ve **Diğer Pazaryerleri** ileri zamanlarda eklenecek

### ⚠️ **ÖNEMLİ KURAL:**
- **Sadece Format Tablo'da yazılı olan kolonlar** kullanılacak
- **Ham veride var ama Format Tablo'da olmayan kolonlar** dikkate alınmayacak
- **Kullanılmayacak kolonlar:** Email 1,2,3, State, Pincode
- **Özel dönüştürme:** Cid → Maplink (otomatik)

---

## 📄 Format Tablo

| Kolon Adı | Veri Tipi | Açıklama |
|-----------|-----------|----------|
| Kod | input | Otomatik üretilir (sayfa isminden) |
| Keyword | input | Arama anahtar kelimesi (otomatik) |
| Location | input | Konum bilgisi (otomatik) |
| Company name | input | Firma adı (otomatik) |
| Category | input | Firma kategorisi (otomatik) |
| Website | input | Firma web sitesi URL'si (otomatik) |
| Phone | input | Müşteri telefon numarası (otomatik) |
| Yetkili Tel | input | Yetkili kişi telefonu (manuel) |
| Mail | input | Müşteri e-posta adresi (manuel) |
| İsim Soyisim | input | Müşteri adı soyadı (manuel) |
| Aktivite | dropdown | Aşağıdaki seçeneklerden biri |
| Aktivite Tarihi | datepicker | Aktivite yapıldığı tarih |
| Yorum | input | Temsilci yorumları (manuel) |
| Yönetici Not | input | Yönetici notları (manuel) |
| CMS Adı | input | CMS tespiti (otomatik) |
| CMS Grubu | input | CMS kategorisi (otomatik) |
| E-Ticaret İzi | input | E-ticaret tespiti (otomatik) |
| Site Hızı | input | Site hızı ölçümü (otomatik) |
| Site Trafiği | input | Site trafiği (gelecekte API ile) |
| Log | input | Sistem aktivite logu (otomatik) |
| Toplantı formatı | dropdown | Aşağıdaki seçeneklerden biri |
| Address | input | Müşteri adresi (otomatik) |
| City | input | Şehir bilgisi (otomatik) |
| Rating count | input | Değerlendirme sayısı (otomatik) |
| Review | input | Değerlendirme metni (otomatik) |
| Maplink | input | Google Maps linki (Cid'den otomatik dönüştürülür) |

### Aktivite (dropdown) Seçenekleri:
1. Randevu Alındı
2. İleri Tarih Randevu
3. Yeniden Aranacak
4. Bilgi Verildi
5. Fırsat İletildi
6. İlgilenmiyor
7. Ulaşılamadı

### 📋 **Örnek Ham Veri (v3):**
```
Keyword	Location	Company name	Category	Website	Phone	Email 1	Email 2	Email 3	Address	City	State	Pincode	Rating count	Review	Cid
hırdavat	izmit	MAZLUM TEKNİK HIRDAVAT	Department store		0532 748 04 20				İZMİT SANAYİ SİTESİ 401 BLOK NO, D:5, 41140 Kocaeli	İzmit/Kocaeli		41140	264	4.2	https://maps.google.com/?cid=13065953095889504726
```

### Toplantı formatı (dropdown) Seçenekleri:
1. Yüz Yüze
2. Online
3. Telefon

---

## 📄 Randevularım / Randevular

| Kolon Adı | Veri Tipi | Açıklama |
|-----------|-----------|----------|
| Kod | input | |
| Kaynak | input | |
| Keyword | input | |
| Location | input | |
| Company name | input | |
| Category | input | |
| Website | input | |
| Phone | input | |
| Yetkili Tel | input | |
| Mail | input | |
| İsim Soyisim | input | |
| Randevu durumu | dropdown | Aşağıdaki seçeneklerden biri |
| Randevu Tarihi | datepicker | |
| Saat | datepicker | |
| Yorum | input | |
| Yönetici Not | input | |
| CMS Adı | input | |
| CMS Grubu | input | |
| E-Ticaret İzi | input | |
| Site Hızı | input | |
| Site Trafiği | input | |
| Log | input | |
| Toplantı formatı | dropdown | Aşağıdaki seçeneklerden biri |
| Address | input | |
| City | input | |
| Rating count | input | |
| Review | input | |
| Toplantı Sonucu | dropdown | Aşağıdaki seçeneklerden biri |
| Toplantı Tarihi | datepicker | |
| Maplink | input | |

### Randevu durumu (dropdown) Seçenekleri:
**Ana Durum:** Randevu Alındı
**Alt Kırılımlar:**
- Randevu Teyitlendi
- Randevu Ertelendi  
- Randevu İptal oldu

**Not:** Bu alt kırılımlar raporlarda "Randevu Alındı" ana başlığı altında görünür.

### Toplantı formatı (dropdown) Seçenekleri:
1. Yüz Yüze
2. Online
3. Telefon

### Toplantı Sonucu (dropdown) Seçenekleri:
1. Satış Yapıldı
2. Teklif İletildi
3. Beklemede
4. Satış İptal

---

## 📄 Fırsatlarım / Fırsatlar

| Kolon Adı | Veri Tipi | Açıklama |
|-----------|-----------|----------|
| Kod | input | |
| Kaynak | input | |
| Keyword | input | |
| Location | input | |
| Company name | input | |
| Category | input | |
| Website | input | |
| Phone | input | |
| Yetkili Tel | input | |
| Mail | input | |
| İsim Soyisim | input | |
| Fırsat Durumu | dropdown | Aşağıdaki seçeneklerden biri |
| Fırsat Tarihi | datepicker | |
| Yorum | input | |
| Yönetici Not | input | |
| CMS Adı | input | |
| CMS Grubu | input | |
| E-Ticaret İzi | input | |
| Site Hızı | input | |
| Site Trafiği | input | |
| Log | input | |
| Toplantı formatı | dropdown | Aşağıdaki seçeneklerden biri |
| Address | input | |
| City | input | |
| Rating count | input | |
| Review | input | |
| Maplink | input | |

### Fırsat Durumu (dropdown) Seçenekleri:
1. Yeniden Aranacak
2. Bilgi Verildi
3. Fırsat iletildi

### Toplantı formatı (dropdown) Seçenekleri:
1. Yüz Yüze
2. Online
3. Telefon

---

## 📄 Toplantılarım / Toplantılar

| Kolon Adı | Veri Tipi | Açıklama |
|-----------|-----------|----------|
| Kod | input | |
| Kaynak | input | |
| Keyword | input | |
| Location | input | |
| Company name | input | |
| Category | input | |
| Website | input | |
| Phone | input | |
| Yetkili Tel | input | |
| Mail | input | |
| İsim Soyisim | input | |
| Randevu durumu | dropdown | Randevularım ile aynı |
| Randevu Tarihi | datepicker | |
| Saat | datepicker | |
| Yorum | input | |
| Yönetici Not | input | |
| CMS Adı | input | |
| CMS Grubu | input | |
| E-Ticaret İzi | input | |
| Site Hızı | input | |
| Site Trafiği | input | |
| Log | input | |
| Toplantı formatı | dropdown | Aşağıdaki seçeneklerden biri |
| Address | input | |
| City | input | |
| Rating count | input | |
| Review | input | |
| Toplantı Sonucu | dropdown | Aşağıdaki seçeneklerden biri |
| Teklif Detayı | multiselect | Aşağıdaki seçeneklerden birden fazla |
| Satış Potansiyeli | dropdown | Aşağıdaki seçeneklerden biri |
| Toplantı Tarihi | datepicker | |
| Yeni Takip Tarihi | datepicker | |
| Maplink | input | |

### Toplantı formatı (dropdown) Seçenekleri:
1. Yüz Yüze
2. Online
3. Telefon

### Toplantı Sonucu (dropdown) Seçenekleri:
1. Satış Yapıldı
2. Teklif iletildi
3. Beklemede
4. Satış İptal

### Teklif Detayı (multiselect) Seçenekleri:
- Custom
- Elite
- Platinium Plus
- Platinium
- Entegre
- Digifirst Custom
- Digifirst Plus
- Digifirst
- Digifirst Setup

### Satış Potansiyeli (dropdown) Seçenekleri:
1. Yerinde Satış
2. Sıcak
3. Orta
4. Soğuk

---

## 📊 Raporlarım / Raporlar

**Not:** Bu sayfalar Pivot Table olarak çalışır ve otomatik olarak diğer sayfalardaki verilerden oluşturulur.

### 📈 **Pivot Table Özellikleri:**
- **Kaynak veri:** Format Tablo'daki aktiviteler
- **Filtreleme:** Tarih, aktivite türü, temsilci bazında
- **Hesaplama:** Otomatik sayım ve toplamlar
- **Görünüm:** Aktivite türü bazında sayılar
- **Alt Kırılımlar:** Randevu Alındı → Teyitlendi/Ertelendi/İptal

### 🔄 **Senkronizasyon:**
- Temsilci Raporlarım ↔ Yönetici Raporlar
- Tüm aktivite türleri dahil
- Gerçek zamanlı güncelleme 