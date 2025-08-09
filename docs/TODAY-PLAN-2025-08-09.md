# 📌 Bugünkü Plan (09.08.2025)

Kritik kural: Mevcut çalışan kodu bozma. Refactor sadece tekrarları azaltır; davranışı değiştirmez. Tüm değişiklikler arşivlenir ve geri alınabilir.

## ✅ Hedefler ve Kabul Kriterleri

- [ ] Doküman sıkılaştırma (README, sistem şeması, sayfa kolonları)
  - Kabul: Eski sürümler `docs/archive/` altında; yeni dosyalarda kısa TOC, linkler güncel
- [ ] Çoklu Yönetici ve Alt-Yönetici modeli (tasarım/dokümantasyon)
  - Kabul: `docs/sistem_semasi.md` içinde mimari ve yetki kapsamı (temsilci bazlı erişim) açık
- [ ] Raporlarım alt-fonksiyonları (Günlük/Haftalık/Aylık) tasarımı
  - Kabul: `Raporlarım` tek menü, alt-fonksiyonlar buton/menü olarak listelenmiş
- [ ] CMS Analizi iyileştirme planı + doğruluk ölçümü
  - Kabul: Test prosedürü (20-30 URL), hedef doğruluk %95+, iteratif geliştirme notu
- [ ] Website kalite skoru (UX/İçerik/Performans) tasarım
  - Kabul: Skorlama rubriği (0-100), alt boyutlar, örnek çıktı tanımı
- [ ] Renk bugları: “Fırsat İletildi” renksiz; yönetici Fırsatlar renksiz; eski renklerin normalize edilmesi
  - Kabul: Renk yenileme komutu ve kapsam (temsilci+yönetici); test senaryosu tanımlı
- [ ] Çift yönlü senkronizasyon değerlendirmesi
  - Kabul: Çakışma çözüm kuralı, manuel onaylı geri-iterme, riskler ve aşamalı devreye alma planı
- [ ] “Website yok” satırlarını sil butonu
  - Kabul: İşlem sonrası özet mesajı: kaç satır silindi; geri alma stratejisi notu
- [ ] Admin panel temizlik
  - Kabul: Kullanılmayan fonksiyon envanteri, silme listesi ve arşivleme yöntemi

## 🔁 Sıralama (kolaydan zora)
1) Doküman sıkılaştırma (bu adım)
2) "Website yok" temizliği butonu (tasarım ve doküman)
3) Renk yenileme/normalize etme komutu (tasarım ve doküman)
4) Raporlarım alt-fonksiyonları (doküman/UI plan)
5) Çoklu Yönetici / Alt-Yönetici (mimari ve erişim modeli)
6) CMS Analizi kalite iyileştirme planı
7) Website kalite skoru tasarımı
8) Çift yönlü senkronizasyon değerlendirmesi
9) Admin panel temizlik planı

## 🧭 Notlar
- Tarih formatı: DD.MM.YYYY
- Renk kodları merkezi: `docs/RENK_KODLARI.md`
- Rapor mantığı merkezi: `docs/sistem_semasi.md`
- Kolonların tek kaynağı: `docs/sayfa_kolonlari.md`
