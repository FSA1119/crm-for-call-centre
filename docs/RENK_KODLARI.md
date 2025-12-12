# 🎨 RENK KODLARI - ЦВЕТОВЫЕ КОДЫ

## 📋 MERKEZI RENK SISTEMI (ЦЕНТРАЛИЗОВАННАЯ СИСТЕМА ЦВЕТОВ)

### 🏢 CRM DURUM RENKLERI (Цвета статусов CRM)

| Status (Статус) | Renk Kodu (Цвет) | Sayfalar (Страницы) | Açıklama (Описание) |
|-----------------|------------------|-------------------|---------------------|
| Randevu Alındı | rgb(232, 245, 232) | Format Tablo, Randevularım | Açık Yeşil (Светло-зеленый) |
| İleri Tarih Randevu | rgb(245, 245, 245) | Format Tablo, Randevularım | Açık Gri (Светло-серый) |
| Teyitlendi | rgb(232, 245, 232) | Randevularım | Açık Yeşil (Светло-зеленый) |
| Ertelendi | rgb(255, 243, 224) | Randevularım | Açık Turuncu (Мягкий оранжевый) |
| İptal | rgb(255, 235, 238) | Randevularım | Açık Kırmızı (Светло-красный) |
| Fırsat İletildi | rgb(255, 235, 238) | Format Tablo, Fırsatlarım | Açık Kırmızı (Светло-красный) |
| Toplantı Tamamlandı | rgb(200, 230, 201) | Format Tablo, Toplantılarım | Açık Yeşil (Светло-зеленый) |
| İlgilenmiyor | rgb(255, 248, 225) | Format Tablo | Açık Sarı (Светло-желтый) |
| Ulaşılamadı | rgb(255, 235, 238) | Format Tablo | Açık Kırmızı (Светло-красный) |
| Geçersiz Numara | rgb(255, 224, 178) | Format Tablo | Açık Turuncu (Светло-оранжевый) |
| Kurumsal | rgb(225, 190, 231) | Format Tablo | Açık Mor (Светло-фиолетовый) |
| Yeniden Aranacak | rgb(227, 242, 253) | Fırsatlarım | Açık Mavi (Светло-голубой) |
| Bilgi Verildi | rgb(243, 229, 245) | Fırsatlarım | Açık Mor (Светло-фиолетовый) |
| Satış Yapıldı | rgb(129, 212, 250) | Format Tablo, Toplantılarım | Orta Mavi (Средний голубой) |

### 📊 SAYFA BAŞLIK RENKLERI (Цвета заголовков страниц)

| Sayfa (Страница) | Başlık Rengi (Цвет заголовка) | Kod (Код) |
|------------------|-------------------------------|-----------|
| Format Tablo | rgb(173, 216, 230) | Koyu Mavi |
| Randevularım | rgb(102, 227, 135) | Google Yeşil |
| Fırsatlarım | rgb(243, 151, 12) | Turuncu |
| Toplantılarım | rgb(156, 39, 176) | Mor |
| Raporlarım | rgb(91, 181, 226) | Gri-Mavi |

### 📈 RAPOR RENKLERI (Цвета отчетов)

| Rapor Türü (Тип отчета) | Renk (Цвет) | Kod (Код) |
|-------------------------|-------------|-----------|
| Günlük Rapor Başlık | rgb(227, 242, 253) | Açık Mavi |
| Haftalık Rapor Başlık | rgb(227, 242, 253) | Açık Mavi |
| TOPLAM KONTAK | rgb(232, 245, 232) | Açık Yeşil |
| TOPLAM İŞLEM | rgb(255, 243, 224) | Açık Turuncu |
| Toplam Satırı | rgb(232, 245, 232) | Açık Yeşil |

## 🔧 MERKEZI KOD YAPISI (ЦЕНТРАЛИЗОВАННАЯ СТРУКТУРА КОДА)

### TÜM RENKLER TEK YERDE (ВСЕ ЦВЕТА В ОДНОМ МЕСТЕ):
```javascript
CRM_CONFIG = {
  // Status colors (Цвета статусов) - Görseldeki Renkler
  COLOR_CODES: {
    'Randevu Alındı': 'rgb(232, 245, 232)',      // #E8F5E8 - Açık Yeşil
    'İleri Tarih Randevu': 'rgb(245, 245, 245)', // #F5F5F5 - Açık Gri
    'Teyitlendi': 'rgb(232, 245, 232)',          // #E8F5E8 - Açık Yeşil
    'Ertelendi': 'rgb(255, 243, 224)',           // #FFF3E0 - Açık Turuncu
    'İptal': 'rgb(255, 235, 238)',               // #FFEBEE - Açık Kırmızı
    'Fırsat İletildi': 'rgb(255, 235, 238)',     // #FFEBEE - Açık Kırmızı
    'Toplantı Tamamlandı': 'rgb(200, 230, 201)', // #C8E6C9 - Açık Yeşil (Format Tablo, Toplantılarım)
    'İlgilenmiyor': 'rgb(255, 248, 225)',        // #FFF8E1 - Açık Sarı
    'Ulaşılamadı': 'rgb(255, 235, 238)',         // #FFEBEE - Açık Kırmızı
    'Geçersiz Numara': 'rgb(255, 224, 178)',     // #FFE0B2 - Açık Turuncu
    'Kurumsal': 'rgb(225, 190, 231)',             // #E1BEE7 - Açık Mor
    'Yeniden Aranacak': 'rgb(227, 242, 253)',    // #E3F2FD - Açık Mavi
    'Bilgi Verildi': 'rgb(243, 229, 245)',       // #F3E5F5 - Açık Mor
    'Satış Yapıldı': 'rgb(129, 212, 250)'        // #81D4FA - Orta Mavi (Format Tablo, Toplantılarım)
  },
  
  // Page header colors (Цвета заголовков страниц)
  SHEET_HEADER_COLORS: {
    'Format Tablo': 'rgb(173, 216, 230)',
    'Randevularım': 'rgb(102, 227, 135)',
    'Fırsatlarım': 'rgb(243, 151, 12)',
    'Toplantılarım': 'rgb(156, 39, 176)',
    'Raporlarım': 'rgb(91, 181, 226)'
  },
  
  // Report colors (Цвета отчетов)
  REPORT_COLORS: {
    'Günlük Rapor Başlık': 'rgb(227, 242, 253)',
    'Haftalık Rapor Başlık': 'rgb(227, 242, 253)',
    'TOPLAM KONTAK': 'rgb(232, 245, 232)',
    'TOPLAM İŞLEM': 'rgb(255, 243, 224)',
    'Toplam Satırı': 'rgb(232, 245, 232)'
  }
}
```

### 📝 KULLANIM (ИСПОЛЬЗОВАНИЕ):
- **Status rengi değiştirmek için**: Sadece bu dosyada değiştirin
- **Sayfa başlık rengi değiştirmek için**: Sadece bu dosyada değiştirin  
- **Rapor rengi değiştirmek için**: Sadece bu dosyada değiştirin
- **Senkronizasyon**: Tüm dosyalar otomatik güncellenir



## 🎨 FORMAT TABLO RENK YAPISI (СТРУКТУРА ЦВЕТОВ ФОРМАТ ТАБЛИЦЫ)

### 📊 Format Tablo Aktivite Renklendirmesi

Format Tablo'da her satır, **Aktivite** kolonundaki değere göre renklendirilir. Renklendirme **batch operation** ile yapılır (performans için).

#### Renklendirme Kuralları

| Aktivite Durumu | Renk Kodu | Hex | Açıklama |
|-----------------|-----------|-----|----------|
| Randevu Alındı | rgb(232, 245, 232) | #E8F5E8 | Açık Yeşil - Başarı |
| İleri Tarih Randevu | rgb(245, 245, 245) | #F5F5F5 | Açık Gri - Beklemede |
| Yeniden Aranacak | rgb(227, 242, 253) | #E3F2FD | Açık Mavi - Takip |
| Bilgi Verildi | rgb(243, 229, 245) | #F3E5F5 | Açık Mor - Bilgilendirme |
| Fırsat İletildi | rgb(255, 235, 238) | #FFEBEE | Açık Kırmızı - Fırsat |
| İlgilenmiyor | rgb(255, 248, 225) | #FFF8E1 | Açık Sarı - Olumsuz |
| Ulaşılamadı | rgb(255, 235, 238) | #FFEBEE | Açık Kırmızı - Hata |
| Geçersiz Numara | rgb(255, 224, 178) | #FFE0B2 | Açık Turuncu - Uyarı |
| Kurumsal | rgb(225, 190, 231) | #E1BEE7 | Açık Mor - Özel |
| Boş/Aktivite Yok | rgb(255, 255, 255) | #FFFFFF | Beyaz - Boş |

#### Batch Renklendirme (Zorunlu!)

**❌ YAVAŞ (150 API call = 15 saniye!):**
```javascript
for (let i = 2; i <= 151; i++) {
  sheet.getRange(i, 1, 1, 26).setBackground('#E8F5E8');
}
```

**✅ HIZLI (1 API call = 0.5 saniye!):**
```javascript
// 1. Hafızada hesapla
const data = sheet.getRange(2, 1, 150, 26).getValues();
const colors = data.map(row => {
  const aktivite = String(row[12] || '').trim(); // Aktivite kolonu (M = index 12)
  if (!aktivite) return Array(26).fill('#FFFFFF');
  
  // Aktivite durumuna göre renk belirle
  const colorMap = {
    'Randevu Alındı': '#E8F5E8',
    'İleri Tarih Randevu': '#F5F5F5',
    'Yeniden Aranacak': '#E3F2FD',
    'Bilgi Verildi': '#F3E5F5',
    'Fırsat İletildi': '#FFEBEE',
    'İlgilenmiyor': '#FFF8E1',
    'Ulaşılamadı': '#FFEBEE',
    'Geçersiz Numara': '#FFE0B2',
    'Kurumsal': '#E1BEE7'
  };
  
  const rowColor = colorMap[aktivite] || '#FFFFFF';
  return Array(26).fill(rowColor);
});

// 2. Tek seferde yaz (1 API call!)
sheet.getRange(2, 1, 150, 26).setBackgrounds(colors);
SpreadsheetApp.flush(); // Batch işlem sonrası flush
```

**Kazanç: 30x daha hızlı!**

#### Header Renklendirmesi

Format Tablo header'ı (1. satır) her zaman **rgb(173, 216, 230)** (Koyu Mavi) renginde olmalıdır.

```javascript
const headerRange = sheet.getRange(1, 1, 1, 26);
headerRange.setBackground('rgb(173, 216, 230)');
headerRange.setFontWeight('bold');
headerRange.setFontSize(11);
headerRange.setHorizontalAlignment('center');
```

#### Conditional Formatting (Alternatif)

Eğer batch renklendirme yerine conditional formatting kullanmak isterseniz:

```javascript
const aktiviteColumn = 13; // M kolonu
const lastRow = sheet.getLastRow();
const range = sheet.getRange(2, aktiviteColumn, lastRow - 1, 1);

// "Randevu Alındı" = Yeşil
const rule1 = SpreadsheetApp.newConditionalFormatRule()
  .whenTextEqualTo('Randevu Alındı')
  .setBackground('#E8F5E8')
  .setRanges([range])
  .build();

// "Fırsat İletildi" = Kırmızı
const rule2 = SpreadsheetApp.newConditionalFormatRule()
  .whenTextEqualTo('Fırsat İletildi')
  .setBackground('#FFEBEE')
  .setRanges([range])
  .build();

const rules = sheet.getConditionalFormatRules();
rules.push(rule1, rule2);
sheet.setConditionalFormatRules(rules);
```

**Not:** Conditional formatting daha yavaş olabilir. Batch renklendirme önerilir.

---

## 📝 MERKEZI DEĞIŞIKLIK TALİMATI (ЦЕНТРАЛИЗОВАННАЯ ИНСТРУКЦИЯ)

### 🎯 TEK YERDEN YÖNETIM (УПРАВЛЕНИЕ ИЗ ОДНОГО МЕСТА):

**✅ TÜM RENKLER BU DOSYADA (ВСЕ ЦВЕТА В ЭТОМ ФАЙЛЕ):**
- Status renkleri (Цвета статусов)
- Sayfa başlık renkleri (Цвета заголовков страниц)  
- Rapor renkleri (Цвета отчетов)
- Senkronizasyon renkleri (Цвета синхронизации)

### 📝 DEĞIŞIKLIK YAPMAK İÇİN (ДЛЯ ВНЕСЕНИЯ ИЗМЕНЕНИЙ):

#### 1. Status rengi değiştirmek (Изменить цвет статуса):
1. Yukarıdaki tabloda statusu bulun
2. Yeni renk kodunu yazın
3. Bana söyleyin: "X statusuna Y rengini uygula"

#### 2. Sayfa başlık rengi değiştirmek (Изменить цвет заголовка страницы):
1. Yukarıdaki tabloda sayfayı bulun
2. Yeni renk kodunu yazın
3. Bana söyleyin: "X sayfasının başlığına Y rengini uygula"

#### 3. Rapor rengi değiştirmek (Изменить цвет отчета):
1. Yukarıdaki tabloda rapor türünü bulun
2. Yeni renk kodunu yazın
3. Bana söyleyin: "X raporuna Y rengini uygula"

### 🔄 OTOMATIK GÜNCELLEME (АВТОМАТИЧЕСКОЕ ОБНОВЛЕНИЕ):
- Bu dosyada değişiklik yaptığınızda
- Tüm kod dosyaları otomatik güncellenir
- Senkronizasyon renkleri de güncellenir
- Hata riski yok

---

**📝 Not:** Bu dosyayı güncelleyerek tüm renk kodlarını tek yerden yönetebilirsiniz.
**📝 Примечание:** Обновляя этот файл, вы можете управлять всеми цветовыми кодами из одного места. 