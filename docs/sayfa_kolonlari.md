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

# Rapor örnek 1
1. Randevu Alındı
- Randevu Teyitlendi 
- Randevu Ertelendi  
- Randevu İptal oldu
2. İleri Tarih Randevu
3. Yeniden Aranacak
4. Bilgi Verildi
5. Fırsat İletildi
6. İlgilenmiyor
7. Ulaşılamadı



	1.08.2025	2.08.2025	3.08.2025	4.08.2025	5.08.2025	6.08.2025	7.08.2025	8.08.2025	9.08.2025	10.08.2025	11.08.2025	12.08.2025	13.08.2025	14.08.2025	15.08.2025	16.08.2025	17.08.2025	18.08.2025	19.08.2025	20.08.2025	21.08.2025	22.08.2025	23.08.2025	24.08.2025	25.08.2025	26.08.2025	27.08.2025	28.08.2025	29.08.2025	30.08.2025	31.08.2025	Total
1. Randevu Alındı	4	2	6	3	3																											18
- Randevu Teyitlendi	3	2	3	1	2																											11
- Randevu Ertelendi	1	0	2	1	1																											5
- Randevu İptal oldu	0	0	1	1	0																											2
2. İleri Tarih Randevu	0	2	3	2	1																											8
3. Yeniden Aranacak	1	2	2	2	3																											10
4. Bilgi Verildi	2	3	2	0	1																											8
5. Fırsat İletildi	2	1	0	1	2																											6
6. İlgilenmiyor	15	5	7	9	12																											48
Toplam kontak	24	15	20	17	22																											98
7. Ulaşılamadı	15	12	14	12	11																											64


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

---

## 📊 Günlük Rapor

### 📋 **Rapor Yapısı:**
```
A1: GÜNLÜK RAPORLAR
B1: 03.08.2025
C1: 04.08.2025
D1: 05.08.2025
...

A3: 1. Randevu Alındı
B3: 10
C3: 5
D3: 8

A4:    - Randevu Teyitlendi
B4: 0
C4: 2
D4: 3

A5:    - Randevu Ertelendi
B5: 0
C5: 1
D5: 2

A6:    - Randevu İptal oldu
B6: 0
C6: 0
D6: 1

A8: 2. İleri Tarih Randevu
B8: 0
C8: 3
D8: 1

A9: 3. Yeniden Aranacak
B9: 1
C9: 2
D9: 4

A10: 4. Bilgi Verildi
B10: 3
C10: 4
D10: 2

A11: 5. Fırsat İletildi
B11: 0
C11: 1
D11: 0

A12: 6. İlgilenmiyor
B12: 1
C12: 0
D12: 2

A13: TOPLAM KONTAK
B13: 15
C13: 18
D13: 20

A15: 7. Ulaşılamadı
B15: 1
C15: 2
D15: 3

A17: TOPLAM İŞLEM
B17: 16
C17: 20
D17: 23
```

### 🎯 **Günlük Rapor Mantığı:**
- **A sütunu:** Aktivite etiketleri (hiç değişmiyor)
- **B sütunu:** İlk gün sayıları
- **C sütunu:** İkinci gün sayıları
- **D sütunu:** Üçüncü gün sayıları
- **Ve böyle devam ediyor...**

### 📊 **Hesaplama Mantığı:**
- **TOPLAM KONTAK:** Kategoriler 1-6'nın toplamı (Ulaşılamadı hariç)
- **TOPLAM İŞLEM:** Tüm kategorilerin toplamı (1-7)
- **Ulaşılamadı:** Konuşma olmadığı için ayrı kategori

### 🔄 **Günlük Rapor Özellikleri:**
- **Yan yana yazma:** Her gün yeni sütun eklenir
- **Gelişim takibi:** Günlük karşılaştırma mümkün
- **Otomatik hesaplama:** TOPLAM KONTAK ve TOPLAM İŞLEM
- **Aktivite etiketleri:** Sadece A sütununda (bir kere yazılır)
- **Sayılar:** İlgili günün sütununda 
