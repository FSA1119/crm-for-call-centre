# 🇹🇷 Türkiye Hazır E‑Ticaret Altyapı Sağlayıcıları (Referans)

Bu liste CMS tespitte TR Hazır grubu için kullanılan sağlayıcı alan adlarını içerir. Güncel tutalım.

- Softtr — softtr.com — Not: Fiyat odaklı, rakip değil
- PlatinMarket — platinmarket.com — Not: Rakip değil
- İkas — ikas.com — Not: RAKİP
- Ticimax — ticimax.com — Not: RAKİP
- T‑Soft — tsoft.com.tr — Not: RAKİP
- IdeaSoft — ideasoft.com.tr — Not: Rakip değil
- Projesoft — projesoft.com.tr — Not: Rakip değil
- Faprika — faprika.com — Not: Rakip değil
- Demresa — demresa.com — Not: Rakip değil
- BilgiKurumsal — bilgikurumsal.com — Not: Eskiden iyiydi, artık rakip değil
- ShopPHP — shopphp.net — Not: Lisanslı model
- Quka Soft — qukasoft.com — Not: Fiyat odaklı, rakip değil
- iMağaza — imagaza.net — Not: Rakip değil
- Akınsoft — akinsoft.com.tr — Not: ERP odaklı, rakip değil
- Hipotenüs — hipotenus.com.tr — Not: Tekstil odaklı, rakip değil
- Ticifly — ticifly.com — Not: Rakip değil
- Alkissoft — alkissoft.com — Not: (ek)
- Kobimaster — kobimaster.com — Not: (ek)
- Vatansoft — vatansoft.com — Not: (ek)
- Inplato — inplato.com — Not: (ek)
- Neticaret — neticaret.com — Not: (mevcut)
- E‑Ticaret Soft — eticaretsoft.com — Not: (mevcut)
- Smart E‑Ticaret — smarteticaret.com — Not: (mevcut)
- Eticaretim — eticaretim.com — Not: (ek)
- JettyCart — jettycart.com — Not: Rakip değil
- Doğru Ajans — dogruajans.com — Not: Rakip değil (ajans; e-ticaret yapıyor)

Bakım:
- Kod referansı: `src/managers/cms_detector.gs` içindeki `REF_LIST.turkiye_hazir_eticaret` ve `CMS_SIGNATURES`
- Grup eşleme: `mapCmsGroup()` → “TR Hazır”

Değişiklikte süreç:
- Önce `REF_LIST` alan adını ekle
- Ardından `CMS_SIGNATURES` için `addDomainSig` ile imza ekle
- Gerekirse `mapCmsGroup` anahtarlarına küçük harf varyantını ekle
