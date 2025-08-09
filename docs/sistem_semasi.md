# 🏢 CRM Sistemi - Kısa Sistem Şeması

Eski tam sürüm: `docs/archive/sistem_semasi-2025-08-09.md`.

## 🧭 Navigasyon
- Mimari ve Roller
- Veri Akışı
- Senkronizasyon (tek yön) ve plan (çift yön)
- Format Tablo Tarih Mantığı
- Raporlama Mantığı (Günlük vs Haftalık) ve Toplamlar
- Genişleme: Çoklu Yönetici/Alt-Yönetici, Rapor Alt-Fonksiyonları
- Planlı İyileştirmeler (CMS, Kalite Skoru, Renk Normalize, Admin Temizlik)

---

## 🏗️ Mimari ve Roller
- 6 Temsilci dosyası + 1+ Yönetici dosyası (çoklu yönetici desteklenir)
- Yönetici dosyasında konsolide: Randevular, Fırsatlar, Toplantılar, Raporlar
- Temsilci dosyalarında: Randevularım, Fırsatlarım, Toplantılarım, Raporlarım

Rol Özeti:  
- Temsilci: Kayıt oluşturur ve günceller  
- Yönetici: Konsolide görüntüler; not ekleyebilir (ileri plan: geri-iterme)

Alt-Yönetici Modeli (plan):  
- Yöneticiye temsilci bazlı erişim kapsamı tanımlanır (subset ataması)

---

## 🔄 Veri Akışı
Ham veri → Format Tablo → (Randevularım | Fırsatlarım) → (Toplantılarım) → Raporlarım  
Yönetici dosyası, temsilcilerden gelen verileri konsolide eder.

---

## 🔗 Senkronizasyon
- Otomatik: `onEdit` → Temsilci → Yönetici
- Manuel: Menü CRM → "Senkronize Et"

Çift Yön (plan):  
- Yalnızca belirli kolonlar (örn. "Yönetici Not") geri-iterilir  
- Çakışma çözümü: Zaman damgası + manuel onay  
- Aşamalı devreye alma ve loglama şart

---

## 🗓️ Format Tablo Tarih Mantığı
- Format Tablo oluşturulurken `Aktivite Tarihi` boş kalır
- `Aktivite` seçildiğinde `Aktivite Tarihi` otomatik bugün (DD.MM.YYYY) yapılır
- Amaç: manuel hatayı önlemek, rapor doğruluğu sağlamak

---

## 📊 Raporlama Mantığı

Kaynak Sayfalar:  
- Randevu Alındı, İleri Tarih Randevu → `Randevularım`  
- Yeniden Aranacak, Bilgi Verildi, Fırsat İletildi → `Fırsatlarım`  
- İlgilenmiyor, Ulaşılamadı → `Format Tablo`

Günlük Rapor: Bugün yapılan işlemleri sayar (oluşturma/güncelleme günü)  
Haftalık Rapor: Aktivite tarihine göre sayar (Randevu Tarihi / Fırsat Tarihi / Aktivite Tarihi)

Toplamlar:  
- TOPLAM KONTAK = Ana aktiviteler (1-6)  
- TOPLAM İŞLEM = TOPLAM KONTAK + Ulaşılamadı  
- Sayılmayanlar: Randevu Teyitlendi, Ertelendi, İptal (alt kategoriler)

Detay ve örnekler: `docs/archive/sistem_semasi-2025-08-09.md`

---

## 🧩 Genişleme
- Çoklu Yönetici: Birden fazla yönetici dosyası desteklenir (plan: temsilci bazlı yetkilendirme)
- Raporlarım Alt-Fonksiyonları: Günlük, Haftalık, Aylık vb. tek menü altında alt seçenekler

---

## 🛠️ Planlı İyileştirmeler (Özet)
- CMS Analizi: Doğruluk iyileştirme; test turu 20-30 URL; hedef ≥ %95 doğruluk  
- Website Kalite Skoru: 0-100; boyutlar (Performans, UX, İçerik), rapora uygun format  
- Renk Normalize: Eski satır renklerini yeni palete eşitleyen "Renkleri Yenile" komutu (temsilci+yönetici)  
- Renk Bugları: "Fırsat İletildi" renklendirme ve yönetici "Fırsatlar" sayfası renklendirme düzeltmesi  
- Çift Yönlü Senkronizasyon: Sınırlı alanlar, onaylı geri-iterme, çakışma politikası  
- Temizlik: Admin panelde kullanılmayan fonksiyonların kaldırılması (arşivlenerek)

Bağlantılar:  
- Kolonlar: `docs/sayfa_kolonlari.md`  
- Renkler: `docs/RENK_KODLARI.md`  
- Teknik detaylar: `docs/technical-specification.md` 