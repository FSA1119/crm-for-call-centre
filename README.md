# 🏢 Google Sheets CRM System

Kısa, okunabilir özet. Detaylar ilgili dokümanlara linklenmiştir. Eski tam sürüm: `docs/archive/README-2025-08-09.md`.

## 📋 Proje Özeti
- Google Sheets tabanlı CRM
- 6 Temsilci dosyası + 1+ Yönetici (çoklu yönetici desteklenir)  
- Otomatik senkronizasyon, raporlar, renk kodları, website analizleri

## 📁 Yapı
```
Google-Sheets-CRM/
├── src/
│   ├── agents/backend.js
│   ├── managers/manager-sync.js
│   ├── html-dialogs/
│   └── shared/, utils/
├── docs/
│   ├── sistem_semasi.md     # Mimari ve rapor mantığı
│   ├── sayfa_kolonlari.md   # Tek kolon kaynağı
│   ├── RENK_KODLARI.md      # Tek renk kaynağı
│   └── technical-specification.md
└── README.md
```

## 🚀 Kurulum ve Hızlı Başlangıç
1) Google Sheets → Extensions → Apps Script
2) Temsilci: `src/agents/backend.js` + ilgili HTML dialogları
3) Yönetici: `src/managers/manager-sync.js` + `managerMeetingDialog.html`
4) Çalıştır: `quickSystemCheck()`

## 🔄 Senkronizasyon
- Otomatik `onEdit`: Temsilci → Yönetici
- Manuel: Menü CRM → Senkronize Et
- İleri plan: Çift yönlü senkronizasyon (manuel onaylı geri-iterme) — bkz: `docs/sistem_semasi.md`

## 📊 Raporlar
- `Raporlarım` tek menü; alt-fonksiyonlar: Günlük, Haftalık, Aylık (tasarım)  
- Mantık (kaynak sayfalar, tarihler, toplam formülleri): `docs/sistem_semasi.md`
- **Funnel Raporu:** Aktivite mapping için `docs/sayfa_kolonlari.md` → "📊 Aktivite Mapping (Funnel Raporu)" bölümüne bakın

## 🎨 Renkler
- Merkez: `docs/RENK_KODLARI.md`
- Not: Eski satır renklerini yeni koda uyarlamak için “Renkleri Yenile” komutu (plan)  

## 🌐 Website Analizi
- CMS, E-Ticaret, Hız testleri  
- CMS doğruluk iyileştirmesi ve test süreci (20-30 URL, hedef ≥%95) — plan  

## 🛠️ Yardımcı Araçlar
- “Telefon olmayanları sil” + “Website olmayanları sil” (plan)  
- Admin Panel temizlik (plan)

## 🧭 Referans Dokümanlar
- Sistem Şeması: `docs/sistem_semasi.md`
- Sayfa Kolonları: `docs/sayfa_kolonlari.md`
- Renk Kodları: `docs/RENK_KODLARI.md`
- Teknik Detaylar: `docs/technical-specification.md`

## 🔄 Versiyon
- Mevcut: v1.3 — Ayrıntılar ve geçmiş: `docs/archive/README-2025-08-09.md` 