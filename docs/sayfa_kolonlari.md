# 📋 Sayfa Kolonları (Kısa)

Eski tam sürüm: `docs/archive/sayfa_kolonlari-2025-08-09.md`.  
Bu dosya sadece kolonları ve dropdown seçeneklerini tanımlar. Rapor mantığı ve renkler için ilgili dosyalara bakın.

- Tarih formatı: DD.MM.YYYY
- Genel tarih kuralı: Raporlamada tarih için `Log` içindeki dd.MM.yyyy önceliklidir; yoksa ilgili ana tarih kolonu kullanılır
- Sadece bu dosyada yazılı kolonlar kullanılabilir
- Dropdown değerleri burada tanımlandığı gibi doğrulanır
- Renk kodları ayrı dosyada tutulur

Bağlantılar:  
- Sistem Şeması ve Rapor Mantığı: `docs/sistem_semasi.md`  
- Renk Kodları: `docs/RENK_KODLARI.md`  
- Aktivite Mapping: Aşağıdaki "📊 Aktivite Mapping (Funnel Raporu)" bölümüne bakın

---

## Format Tablo
| Kolon | Tip |
|---|---|
| Kod | input |
| Keyword | input |
| Location | input |
| Company name | input |
| Category | input |
| Website | input |
| CMS Adı | input |
| CMS Grubu | input |
| Phone | input |
| Yetkili Tel | input |
| Mail | input |
| İsim Soyisim | input |
| Aktivite | dropdown |
| Aktivite Tarihi | datepicker |
| Yorum | input |
| Yönetici Not | input |
| E-Ticaret İzi | input |
| Site Hızı | input |
| Site Trafiği | input |
| Log | input |
| Toplantı formatı | dropdown |
| Address | input |
| City | input |
| Rating count | input |
| Review | input |
| Maplink | input |

Aktivite (dropdown):  
- Randevu Alındı  
- İleri Tarih Randevu  
- Yeniden Aranacak  
- Bilgi Verildi  
- Fırsat İletildi  
- İlgilenmiyor  
- Ulaşılamadı  
- Geçersiz Numara  
- Kurumsal

Toplantı formatı (dropdown): Yüz Yüze, Online, Telefon

---

## 🔄 HAM VERİ → FORMAT TABLO DÖNÜŞÜMÜ (DİNAMİK)

### Amaç
Farklı kaynaklardan gelen ham veriyi standart Format Tablo yapısına dönüştür.

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

4. **Zorunlu alanlar**
   - `Company name` (D kolonu) - ZORUNLU
   - `Phone` (I kolonu) - ZORUNLU
   - Bu alanlar boş olan satırlar atlanır

### Dinamik Sütun Mapping Kuralları

Ham veri sütun isimleri otomatik olarak Format Tablo sütunlarına map edilir:

| Ham Veri İsmi (Örnekler) | Format Tablo Sütunu | Kolon |
|-------------------------|---------------------|-------|
| Kod, ID, Kodu | Kod | A |
| Keyword, Anahtar Kelime | Keyword | B |
| Location, Konum, Lokasyon | Location | C |
| Şirket, Firma, Company, Company name, İsim | Company name | D ⚠️ ZORUNLU |
| Category, Kategori, Sektör | Category | E |
| Website, Site, Web | Website | F |
| CMS Adı, CMS, CMS Name | CMS Adı | G |
| CMS Grubu, CMS Group | CMS Grubu | H |
| Phone, Telefon, Tel, Telefon No | Phone | I ⚠️ ZORUNLU |
| Yetkili Tel, Yetkili Telefon | Yetkili Tel | J |
| Mail, Email, E-posta | Mail | K |
| İsim Soyisim, Yetkili, Yetkili İsim | İsim Soyisim | L |
| Aktivite, Durum, Status | Aktivite | M |
| Aktivite Tarihi, Tarih, Date | Aktivite Tarihi | N |
| Yorum, Not, Açıklama | Yorum | O |
| Yönetici Not, Manager Note | Yönetici Not | P |
| E-Ticaret, Ecommerce | E-Ticaret İzi | Q |
| Hız, Speed | Site Hızı | R |
| Trafik, Traffic | Site Trafiği | S |
| Log, Günlük | Log | T |
| Toplantı, Meeting, Format | Toplantı formatı | U |
| Address, Adres | Address | V |
| City, Şehir | City | W |
| Rating, Rating Count | Rating count | X |
| Review, Yorum | Review | Y |
| Map, Maplink, Harita | Maplink | Z |

### Mapping Algoritması

1. **Case-insensitive arama:** Büyük/küçük harf duyarsız
2. **Kısmi eşleşme:** "Telefon" → "Phone" eşleşir
3. **Öncelik sırası:** Tam eşleşme > Kısmi eşleşme
4. **Çoklu eşleşme:** İlk bulunan kullanılır

### Dönüşüm Fonksiyonu Örneği

```javascript
/**
 * Ham veriyi Format Tablo yapısına dönüştürür
 */
function convertHamVeriToFormatTable(sourceSheet, targetSheet) {
  // 1. Ham veriyi oku
  const lastCol = sourceSheet.getLastColumn();
  const lastRow = sourceSheet.getLastRow();
  const sourceHeaders = sourceSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const sourceData = sourceSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  // 2. Format Tablo sütunları (26 sütun - SABİT)
  const formatTableHeaders = [
    'Kod', 'Keyword', 'Location', 'Company name', 'Category', 
    'Website', 'CMS Adı', 'CMS Grubu', 'Phone', 'Yetkili Tel', 
    'Mail', 'İsim Soyisim', 'Aktivite', 'Aktivite Tarihi', 
    'Yorum', 'Yönetici Not', 'E-Ticaret İzi', 'Site Hızı', 
    'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 
    'City', 'Rating count', 'Review', 'Maplink'
  ];
  
  // 3. Dinamik mapping oluştur
  const mapping = createColumnMapping(sourceHeaders, formatTableHeaders);
  
  // 4. Veriyi dönüştür (batch)
  const transformedData = [];
  sourceData.forEach((row) => {
    const newRow = new Array(26).fill('');
    
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
    }
  });
  
  // 5. Format Tablo'ya yaz (batch)
  targetSheet.clear();
  targetSheet.getRange(1, 1, 1, 26).setValues([formatTableHeaders]);
  if (transformedData.length > 0) {
    targetSheet.getRange(2, 1, transformedData.length, 26).setValues(transformedData);
  }
  SpreadsheetApp.flush();
}
```

### Kullanım Örneği

**Ham Veri Sheet:**
| ID | Firma Adı | Telefon No | E-posta |
|----|-----------|------------|---------|
| 1 | ABC Şirket | 05551234567 | info@abc.com |

**Dönüşüm Sonrası Format Tablo:**
| Kod | Keyword | Location | Company name | ... | Phone | ... | Mail |
|-----|---------|----------|--------------|-----|-------|-----|------|
| 1 | | | ABC Şirket | ... | 05551234567 | ... | info@abc.com |

**Not:** Eşleşmeyen sütunlar boş bırakılır.

---

## Randevularım / Randevular
| Kolon | Tip |
|---|---|
| Kod | input |
| Kaynak | input |
| Company name | input |
| İsim Soyisim | input |
| Phone | input |
| Yetkili Tel | input |
| Website | input |
| Mail | input |
| Toplantı formatı | dropdown |
| Randevu durumu | dropdown |
| Randevu Tarihi | datepicker |
| Ay | text |
| Saat | datepicker |
| Yorum | input |
| Yönetici Not | input |
| Address | input |
| Maplink | input |

**Not:** Log kolonu kaldırıldı - Log Arşivi'nden okunuyor. Keyword, Location, Category, CMS Adı kolonları kaldırıldı.



Randevu durumu (dropdown):  
- Randevu Alındı  
- İleri Tarih Randevu
- Yeniden Aranacak
- Bilgi Verildi
- Fırsat İletildi
- İlgilenmiyor
- Ulaşılamadı
- Geçersiz Numara
- Kurumsal

Toplantı formatı (dropdown): Yüz Yüze, Online, Telefon  
Toplantı Sonucu (dropdown): Satış Yapıldı, Teklif İletildi, Beklemede, Satış İptal

---

## Fırsatlarım / Fırsatlar
| Kolon | Tip |
|---|---|
| Kod | input |
| Kaynak | input |
| Company name | input |
| İsim Soyisim | input |
| Phone | input |
| Yetkili Tel | input |
| Website | input |
| Mail | input |
| Toplantı formatı | dropdown |
| Fırsat Durumu | dropdown |
| Fırsat Tarihi | datepicker |
| Ay | text |
| Saat | datepicker |
| Yorum | input |
| Yönetici Not | input |
| Address | input |
| Maplink | input |

**Not:** Log kolonu kaldırıldı - Log Arşivi'nden okunuyor. Keyword, Location, Category, CMS Adı, CMS Grubu, E-Ticaret İzi, Site Hızı, Site Trafiği kolonları kaldırıldı.

Fırsat Durumu (dropdown):  
- Yeniden Aranacak
- Bilgi Verildi
- Fırsat İletildi
- Fırsat Kaybedildi (✅ YENİ: İptal gibi en aşağıya çekilir, açık kırmızı renk)  
Toplantı formatı (dropdown): Yüz Yüze, Online, Telefon

---

## Toplantılarım / Toplantılar
| Kolon | Tip |
|---|---|
| Kod | input |
| Kaynak | input |
| Company name | input |
| İsim Soyisim | input |
| Phone | input |
| Yetkili Tel | input |
| Website | input |
| Mail | input |
| Toplantı formatı | dropdown |
| Toplantıyı Yapan | input |
| Toplantı Tarihi | datepicker |
| Ay | text |
| Toplantı Sonucu | dropdown |
| Teklif Detayı | multiselect |
| Satış Potansiyeli | dropdown |
| Yeni Takip Tarihi | datepicker |
| Yorum | input |
| Yönetici Not | input |
| Address | input |
| Maplink | input |

**Not:** Log kolonu kaldırıldı - Log Arşivi'nden okunuyor. Keyword, Location, Category, CMS Adı, CMS Grubu, E-Ticaret İzi, Site Hızı, Site Trafiği kolonları kaldırıldı.
Toplantı formatı (dropdown): Yüz Yüze, Online, Telefon  
Toplantı Sonucu (dropdown): Satış Yapıldı, Teklif iletildi, Beklemede, Satış İptal  
Teklif Detayı (multiselect): Custom, Elite, Platinium Plus, Platinium, Entegre, Digifirst Custom, Digifirst Plus, Digifirst, Digifirst Setup  
Satış Potansiyeli (dropdown): Sıcak, Orta, Soğuk  
**Not:** "Yerinde Satış" seçeneği kaldırıldı (artık Toplantı Dialog'unda "Satış Türü" olarak ayrı bir alan)

### 📝 Toplantı Dialog (meetingDialog.html) - Özel Alanlar

**Koşullu Gösterim:**

1. **"Satış Yapıldı" seçildiğinde görünen alanlar:**
   - **Satış Türü** (dropdown, zorunlu):
     - Yerinde Satış: Toplantı sırasında direkt satış yapıldı
     - Teklif Sonrası: Teklif gönderildi, incelendi, sonradan satış yapıldı
   - **Paket (Teklif Detayı)** (dropdown, zorunlu): Satış yapılan paket
     - Seçenekler: Custom, Elite, Platinium Plus, Platinium, Entegre, Digifirst Custom, Digifirst Plus, Digifirst, Digifirst Setup
   - **Ciro (₺)** (number, zorunlu): Satış tutarı
   
   **Gizlenen alanlar:**
   - **Teklif Detayı (İsteğe Bağlı)**: Artık gerek yok, çünkü "Paket (Teklif Detayı)" ile hangi paket satıldığı belirtiliyor
   - **Satış Potansiyeli**: Artık satış yapıldı, takip edilmeyeceği için

2. **"Teklif iletildi" veya "Beklemede" seçildiğinde görünen alanlar:**
   - **Teklif Detayı (İsteğe Bağlı)** (multiselect, opsiyonel): Müşteriye gönderilecek teklif paketleri (3-4 paket seçilebilir, müşterinin incelemesi için)
     - Seçenekler: Custom, Elite, Platinium Plus, Platinium, Entegre, Digifirst Custom, Digifirst Plus, Digifirst, Digifirst Setup
   - **Satış Potansiyeli** (dropdown, opsiyonel): Sıcak, Orta, Soğuk
   - **Yeni Takip Tarihi** (datepicker, opsiyonel)
   
   **Gizlenen alanlar:**
   - **Paket (Teklif Detayı)**: Henüz satış yapılmadı, sadece teklif gönderiliyor

**Önemli:** 
- **"Paket (Teklif Detayı)"** sadece satış yapıldığında görünür (hangi paket satıldığı)
- **"Teklif Detayı (İsteğe Bağlı)"** sadece teklif gönderildiğinde görünür (hangi paketler teklif edildiği)
- İki alan aynı anda görünmez

---

## Satışlarım

| Kolon | Tip | Açıklama |
|---|---|---|
| Kod | input | Temsilci kodu |
| Kaynak | input | Orijinal dataset adı (Format Tablo, vb.) |
| Company name | input | Şirket adı |
| İsim Soyisim | input | Yetkili isim |
| Phone | input | Telefon |
| Yetkili Tel | input | Yetkili telefon |
| Website | input | Website |
| Mail | input | E-posta |
| Toplantı formatı | dropdown | Yüz Yüze, Online, Telefon |
| Toplantıyı Yapan | input | Toplantıyı yapan temsilci kodu |
| Toplantı Tarihi | datepicker | Toplantının yapıldığı tarih (DD.MM.YYYY) |
| Satış Tarihi | datepicker | Satışın yapıldığı tarih (DD.MM.YYYY) - Otomatik: Bugün |
| Ay | text | Satış ayı - Otomatik hesaplanır (Satış Tarihi'nden) |
| Satış Türü | dropdown | Yerinde Satış, Teklif Sonrası |
| Paket | dropdown | Satış yapılan paket: Custom, Elite, Platinium Plus, Platinium, Entegre, Digifirst Custom, Digifirst Plus, Digifirst, Digifirst Setup |
| Ciro | number | Satış tutarı (₺) |
| Yorum | input | Genel notlar |
| Yönetici Not | input | Yönetici notları |
| Address | input | Adres |
| Maplink | input | Harita linki |

**Notlar:**
- Bu sayfa "Satış Yapıldı" seçildiğinde otomatik oluşturulur.
- **Ay kolonu:** Satış Tarihi'nden otomatik hesaplanır (Ocak, Şubat, Mart, vb.).
- **Toplantı Tarihi:** Toplantıdan satışa geçiş süresini hesaplamak için kullanılır (raporlama için).
- **Renklendirme:** Satışlarım sayfası motivasyon için güzel yeşil tonlarıyla renklendirilir (başarı rengi).
- **Satış Türü:**
  - **Yerinde Satış:** Toplantı sırasında direkt satış yapıldı (daha canlı yeşil renk)
  - **Teklif Sonrası:** Teklif gönderildi, incelendi, sonradan satış yapıldı (yumuşak yeşil renk)

---

## T Aktivite (Tümü)
| Kolon | Tip |
|---|---|
| Kod | input |
| Tarih | date |
| Kaynak | input |
| Randevu Alındı | number |
| İleri Tarih Randevu | number |
| Randevu Teyitlendi | number |
| Randevu Ertelendi | number |
| Randevu İptal oldu | number |
| Aktif Randevu | number |
| Fırsat İletildi | number |
| Bilgi Verildi | number |
| Yeniden Aranacak | number |
| Aktif Fırsat | number |
| İlgilenmiyor | number |
| TOPLAM KONTAK | number |
| Ulaşılamadı | number |
| TOPLAM İŞLEM | number |

Kurallar (kısa):
- Aktif Randevu = Randevu Alındı + Randevu Teyitlendi (satır bazlı, bağımsız)
- Aktif Fırsat = Fırsat İletildi + Bilgi Verildi + Yeniden Aranacak
- TOPLAM KONTAK = Randevu Alındı + İleri Tarih Randevu + Randevu Teyitlendi + Randevu Ertelendi + Randevu İptal oldu + Fırsat İletildi + Bilgi Verildi + Yeniden Aranacak + İlgilenmiyor
- TOPLAM İŞLEM = TOPLAM KONTAK + Ulaşılamadı

---

## 📊 Aktivite Mapping (Funnel Raporu)

Funnel Raporu'nda aktivite isimleri kategorilere map edilir. Bu mapping `getActivityMapping()` fonksiyonunda tanımlıdır (`src/managers/manager-sync.js`).

### ✅ Pozitif Funnel Mapping

#### Fırsat Kategorisi
- `Fırsat İletildi` → `Fırsat`
- `Yeniden Aranacak` → `Fırsat`
- `Bilgi Verildi` → `Fırsat`

#### Randevu Kategorisi
- `Randevu Alındı` → `Randevu`
- `İleri Tarih Randevu` → `Randevu`
- `Randevu Teyitlendi` → `Randevu`

#### Toplantı Kategorisi
- `Toplantı Tamamlandı` → `Toplantı`
- `Toplantı Gerçekleşti` → `Toplantı`
- `Teklif iletildi` → `Toplantı` (Toplantı Sonucu)
- `Teklif İletildi` → `Toplantı`
- `Beklemede` → `Toplantı` (Toplantı Sonucu)

#### Satış Kategorisi
- `Satış Yapıldı` → `Satış`

### ❌ Negatif Funnel Mapping

- `Geçersiz Numara` → `Geçersiz Numara`
- `Ulaşılamadı` → `Ulaşılamadı`
- `İlgilenmiyor` → `İlgilenmiyor`
- `Kurumsal` → `Kurumsal`
- `Randevu İptal oldu` → `Randevu İptal/Ertelendi`
- `Randevu Ertelendi` → `Randevu İptal/Ertelendi`
- `Fırsat Kaybedildi` → `Fırsat Kaybedilen`
- `Fırsat Kaybedilen` → `Fırsat Kaybedilen`

### 📝 Notlar

1. **Arama Kategorisi:** Tüm aktiviteler otomatik olarak "Arama" kategorisine sayılır (toplam aktivite sayısı).

2. **Case-Insensitive:** Mapping büyük/küçük harf duyarsızdır (örn: `'Fırsat iletildi'` ve `'Fırsat İletildi'` aynı).

3. **Yedek Kaynak Kolonları:**
   - **Randevularım:** `Randevu durumu` kolonu kullanılır (fallback: `Aktivite`)
   - **Fırsatlarım:** `Fırsat Durumu` kolonu kullanılır (fallback: `Aktivite`)
   - **Toplantılarım:** `Toplantı Sonucu` kolonu kullanılır (fallback: `Aktivite`)

4. **Güncelleme:** Yeni aktivite eklendiğinde veya mapping değiştiğinde:
   - `src/managers/manager-sync.js` → `getActivityMapping()` fonksiyonu güncellenir
   - Bu dokümantasyon (`docs/sayfa_kolonlari.md`) güncellenir
   - README.md güncellenir (eğer mapping bölümü varsa)

5. **Dialog Alanları Güncelleme:** Toplantı Dialog'unda yeni alan eklendiğinde veya dropdown seçenekleri değiştiğinde:
   - `src/html-dialogs/meetingDialog.html` güncellenir
   - `src/agents/backend.js` → `processMeetingForm()` fonksiyonu güncellenir
   - Bu dokümantasyon (`docs/sayfa_kolonlari.md`) → "Toplantı Dialog" bölümü güncellenir 
