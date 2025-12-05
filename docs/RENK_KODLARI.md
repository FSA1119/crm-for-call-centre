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
| Toplantı Tamamlandı | rgb(200, 230, 201) | Toplantılarım | Açık Yeşil (Светло-зеленый) |
| İlgilenmiyor | rgb(255, 248, 225) | Format Tablo | Açık Sarı (Светло-желтый) |
| Ulaşılamadı | rgb(255, 235, 238) | Format Tablo | Açık Kırmızı (Светло-красный) |
| Geçersiz Numara | rgb(255, 224, 178) | Format Tablo | Açık Turuncu (Светло-оранжевый) |
| Kurumsal | rgb(225, 190, 231) | Format Tablo | Açık Mor (Светло-фиолетовый) |
| Yeniden Aranacak | rgb(227, 242, 253) | Fırsatlarım | Açık Mavi (Светло-голубой) |
| Bilgi Verildi | rgb(243, 229, 245) | Fırsatlarım | Açık Mor (Светло-фиолетовый) |
| Toplantı Tamamlandı | rgb(200, 230, 201) | Format Tablo, Toplantılarım | Açık Yeşil (Светло-зеленый) |
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
    'Toplantı Tamamlandı': 'rgb(200, 230, 201)', // #C8E6C9 - Açık Yeşil
    'İlgilenmiyor': 'rgb(255, 248, 225)',        // #FFF8E1 - Açık Sarı
    'Ulaşılamadı': 'rgb(255, 235, 238)',         // #FFEBEE - Açık Kırmızı
    'Geçersiz Numara': 'rgb(255, 224, 178)',     // #FFE0B2 - Açık Turuncu
    'Kurumsal': 'rgb(225, 190, 231)',             // #E1BEE7 - Açık Mor
    'Yeniden Aranacak': 'rgb(227, 242, 253)',    // #E3F2FD - Açık Mavi
    'Bilgi Verildi': 'rgb(243, 229, 245)',       // #F3E5F5 - Açık Mor
    'Toplantı Tamamlandı': 'rgb(200, 230, 201)', // #C8E6C9 - Açık Yeşil
    'Satış Yapıldı': 'rgb(129, 212, 250)'        // #81D4FA - Orta Mavi
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