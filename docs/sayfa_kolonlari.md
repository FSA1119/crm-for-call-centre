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
- Randevu Teyitlendi
- Randevu Ertelendi
- Randevu İptal oldu
- Toplantı Gerçekleşti (✅ YENİ: Otomatik Toplantılarım'a taşınır, koyu yeşil renk)

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
Satış Potansiyeli (dropdown): Yerinde Satış, Sıcak, Orta, Soğuk 

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
