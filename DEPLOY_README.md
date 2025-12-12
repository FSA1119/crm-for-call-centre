# 🚀 Çok Temsilcili Deploy Sistemi

Bu sistem, tüm temsilcilere aynı anda deploy yapmanıza olanak sağlar.

## 📋 Dosyalar

- `deploy-config.json` - Tüm Script ID'leri burada tanımlı
- `deploy-test.py` - Test ortamına deploy eder
- `deploy-all.py` - Tüm temsilcilere deploy eder

## 🔧 Kurulum

### 1. Script ID'leri Ekle

`deploy-config.json` dosyasını düzenle:

```json
{
  "test": {
    "scriptId": "TEST_SCRIPT_ID_BURAYA",
    "name": "Test Environment"
  },
  "employees": [
    {
      "code": "SB 004",
      "name": "Sinem Bakalcı",
      "scriptId": "GERÇEK_SCRIPT_ID_BURAYA"
    }
  ]
}
```

**Script ID Nasıl Bulunur?**
1. Google Apps Script'te projeyi aç
2. Proje Ayarları → Script ID'yi kopyala
3. `deploy-config.json`'a yapıştır

## 📝 Kullanım

### Test Deploy (Önce Bu!)

```bash
python3 deploy-test.py
```

Bu komut:
- Sadece test ortamına deploy eder
- Test yapmanız için zaman verir
- Test başarılıysa production'a geçebilirsiniz

### Production Deploy (Tüm Temsilciler)

```bash
python3 deploy-all.py
```

Bu komut:
- Tüm temsilcilere sırayla deploy eder
- Her deploy'ın sonucunu gösterir
- Başarılı/hatalı deploy sayısını özetler

## ⚠️ Önemli Notlar

1. **Test Önce!** Her zaman önce `deploy-test.py` çalıştır, test et, sonra `deploy-all.py` çalıştır.

2. **Script ID'leri Güncel Tut!** Yeni temsilci eklendiğinde veya Script ID değiştiğinde `deploy-config.json`'ı güncelle.

3. **Deploy Sırası:** 
   - Test → Test et → Production
   - Production deploy sırasında işlem yapmayın

4. **Hata Durumunda:** Eğer bir deploy başarısız olursa, o temsilcinin Script ID'sini kontrol et.

## 🔍 Script ID Nasıl Bulunur?

1. Google Sheets'te Extensions → Apps Script
2. Sol üstte proje adına tıkla
3. "Project settings" seç
4. "Script ID" kopyala

## 📊 Deploy Edilen Dosyalar

Her deploy'da şu dosyalar push edilir:
- `src/agents/backend.js`
- `src/managers/cms_detector.gs`
- `appsscript.json`
- `appointmentDialog.html`
- `meetingDialog.html`
- `opportunityDialog.html`
- `saleDialog.html`

## 🎯 Workflow Örneği

```bash
# 1. Test deploy
python3 deploy-test.py

# 2. Test yap (Google Sheets'te kontrol et)

# 3. Test başarılıysa production deploy
python3 deploy-all.py

# 4. Sonuçları kontrol et
```

## ❓ Sorun Giderme

**"clasp: command not found"**
```bash
npm install -g @google/clasp
clasp login
```

**"Script ID bulunamadı"**
- `deploy-config.json` dosyasını kontrol et
- Script ID'lerin doğru olduğundan emin ol

**"Deploy başarısız"**
- İnternet bağlantını kontrol et
- `clasp login` yapıldığından emin ol
- Script ID'nin doğru olduğunu kontrol et