# 🎨 RENK KODLARI - ЦВЕТОВЫЕ КОДЫ

## 📋 MERKEZI RENK SISTEMI (ЦЕНТРАЛИЗОВАННАЯ СИСТЕМА ЦВЕТОВ)

### 🏢 CRM DURUM RENKLERI (Цвета статусов CRM)

| Status (Статус) | Renk Kodu (Цвет) | Sayfalar (Страницы) | Açıklama (Описание) |
|-----------------|------------------|-------------------|---------------------|
| Randevu Alındı | rgb(25, 172, 240) | Format Tablo, Randevularım | Mavi (Синий) |
| İleri Tarih Randevu | rgb(135, 206, 250) | Format Tablo, Randevularım | Açık Mavi (Голубой) |
| Teyitlendi | rgb(67, 206, 67) | Randevularım | Yeşil (Зеленый) |
| Ertelendi | rgb(195, 169, 128) | Randevularım | Turuncu (Оранжевый) |
| İptal | rgb(218, 92, 111) | Randevularım | Kırmızı (Красный) |
| Fırsat İletildi | rgb(199, 171, 235) | Format Tablo, Fırsatlarım | Mor (Фиолетовый) |
| Toplantı Tamamlandı | rgb(72, 224, 77) | Toplantılarım | Koyu Yeşil (Темно-зеленый) |
| İlgilenmiyor | rgb(138, 118, 89) | Format Tablo | Açık Turuncu (Светло-оранжевый) |
| Ulaşılamadı | rgb(255, 205, 210) | Format Tablo | Açık Pembe (Светло-розовый) |
| Yeniden Aranacak | rgb(228, 145, 226) | Fırsatlarım | Mor (Фиолетовый) |
| Bilgi Verildi | rgb(199, 171, 235) | Fırsatlarım | Mor (Фиолетовый) |

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
  // Status colors (Цвета статусов)
  COLOR_CODES: {
    'Randevu Alındı': 'rgb(25, 172, 240)',
    'İleri Tarih Randevu': 'rgb(135, 206, 250)',
    'Teyitlendi': 'rgb(67, 206, 67)', 
    'Ertelendi': 'rgb(195, 169, 128)',
    'İptal': 'rgb(218, 92, 111)',
    'Fırsat İletildi': 'rgb(199, 171, 235)',
    'Toplantı Tamamlandı': 'rgb(72, 224, 77)',
    'İlgilenmiyor': 'rgb(138, 118, 89)',
    'Ulaşılamadı': 'rgb(255, 205, 210)',
    'Yeniden Aranacak': 'rgb(228, 145, 226)',
    'Bilgi Verildi': 'rgb(199, 171, 235)'
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