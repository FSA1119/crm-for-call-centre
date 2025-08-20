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

Toplantı formatı (dropdown): Yüz Yüze, Online, Telefon

---

## Randevularım / Randevular
| Kolon | Tip |
|---|---|
| Kod | input |
| Kaynak | input |
| Keyword | input |
| Location | input |
| Company name | input |
| Category | input |
| Website | input |
| Phone | input |
| Yetkili Tel | input |
| Mail | input |
| İsim Soyisim | input |
| Randevu durumu | dropdown |
| Randevu Tarihi | datepicker |
| Saat | datepicker |
| Yorum | input |
| Yönetici Not | input |
| CMS Adı | input |
| CMS Grubu | input |
| E-Ticaret İzi | input |
| Site Hızı | input |
| Site Trafiği | input |
| Log | input |
| Toplantı formatı | dropdown |
| Address | input |
| City | input |
| Rating count | input |
| Review | input |
| Toplantı Sonucu | dropdown |
| Toplantı Tarihi | datepicker |
| Maplink | input |

Randevu durumu (dropdown):  
- Ana: Randevu Alındı  
- Alt: Randevu Teyitlendi, Randevu Ertelendi, Randevu İptal oldu

Toplantı formatı (dropdown): Yüz Yüze, Online, Telefon  
Toplantı Sonucu (dropdown): Satış Yapıldı, Teklif İletildi, Beklemede, Satış İptal

---

## Fırsatlarım / Fırsatlar
| Kolon | Tip |
|---|---|
| Kod | input |
| Kaynak | input |
| Keyword | input |
| Location | input |
| Company name | input |
| Category | input |
| Website | input |
| Phone | input |
| Yetkili Tel | input |
| Mail | input |
| İsim Soyisim | input |
| Fırsat Durumu | dropdown |
| Fırsat Tarihi | datepicker |
| Yorum | input |
| Yönetici Not | input |
| CMS Adı | input |
| CMS Grubu | input |
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

Fırsat Durumu (dropdown): Yeniden Aranacak, Bilgi Verildi, Fırsat İletildi  
Toplantı formatı (dropdown): Yüz Yüze, Online, Telefon

---

## Toplantılarım / Toplantılar
| Kolon | Tip |
|---|---|
| Kod | input |
| Kaynak | input |
| Keyword | input |
| Location | input |
| Company name | input |
| İsim Soyisim | input |
| Toplantı Sonucu | dropdown |
| Teklif Detayı | multiselect |
| Satış Potansiyeli | dropdown |
| Toplantı Tarihi | datepicker |
| Yeni Takip Tarihi | datepicker |
| Toplantıyı Yapan | input |
| Category | input |
| Website | input |
| Phone | input |
| Yetkili Tel | input |
| Mail | input |
| Randevu durumu | dropdown |
| Randevu Tarihi | datepicker |
| Saat | datepicker |
| Yorum | input |
| Yönetici Not | input |
| CMS Adı | input |
| CMS Grubu | input |
| E-Ticaret İzi | input |
| Site Hızı | input |
| Site Trafiği | input |
| Log | input |
| Toplantı formatı | dropdown |
| Address | input |
| City | input |
| Rating count | input |
| Review | input |

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
