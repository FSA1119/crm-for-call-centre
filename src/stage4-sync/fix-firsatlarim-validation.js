// ========================================
// FIRSATLARIM VALIDATION FIX SCRIPT
// ========================================

// KO 003 Fırsatlarım sayfasındaki veri doğrulama hatalarını düzelt
function fixFirsatlarimValidation() {
  console.log('=== FIRSATLARIM VALIDATION FIX BAŞLADI ===');
  
  try {
    const fileId = '1uLufPJqFSfm1WxqSzcvDOKW_hAv8AMhkQwljeiD51mc'; // KO 003
    const file = SpreadsheetApp.openById(fileId);
    const sheet = file.getSheetByName('Fırsatlarım');
    
    if (!sheet) {
      throw new Error('Fırsatlarım sayfası bulunamadı');
    }
    
    console.log('KO 003 Fırsatlarım sayfası açıldı');
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('Veri yok, işlem tamamlandı');
      return;
    }
    
    // Verileri oku
    const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    const values = range.getValues();
    
    let fixedCount = 0;
    
    // Her satırı kontrol et ve düzelt
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      let needsUpdate = false;
      
      // Boş hücreleri temizle
      const cleanRow = row.map((cell, colIndex) => {
        if (cell === null || cell === undefined || cell === '') {
          needsUpdate = true;
          return '';
        }
        return cell;
      });
      
      // Eğer değişiklik varsa güncelle
      if (needsUpdate) {
        const rowIndex = i + 2; // +2 çünkü 1. satır başlık, 2. satırdan başlıyoruz
        sheet.getRange(rowIndex, 1, 1, cleanRow.length).setValues([cleanRow]);
        fixedCount++;
        console.log(`Satır ${rowIndex} düzeltildi`);
      }
    }
    
    // Veri doğrulama kurallarını yeniden uygula
    setFirsatlarimDataValidation(sheet);
    
    console.log(`Toplam ${fixedCount} satır düzeltildi`);
    console.log('=== FIRSATLARIM VALIDATION FIX TAMAMLANDI ===');
    
    SpreadsheetApp.getUi().alert('Başarılı', `${fixedCount} satır düzeltildi ve veri doğrulama kuralları yeniden uygulandı.`, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Fırsatlarım validation fix hatası:', error);
    SpreadsheetApp.getUi().alert('Hata', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// Fırsatlarım için veri doğrulama kurallarını uygula
function setFirsatlarimDataValidation(sheet) {
  console.log('Fırsatlarım veri doğrulama kuralları uygulanıyor...');
  
  const lastRow = Math.max(1000, sheet.getLastRow());
  
  // Fırsat Tarihi - Date picker
  try {
    const firsatTarihiRange = sheet.getRange(2, 6, lastRow - 1, 1); // F sütunu
    const firsatTarihiRule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(false)
      .setHelpText('Lütfen geçerli bir tarih seçin')
      .build();
    firsatTarihiRange.setDataValidation(firsatTarihiRule);
    console.log('Fırsat Tarihi date picker uygulandı');
  } catch (error) {
    console.error('Fırsat Tarihi validation hatası:', error);
  }
  
  // Fırsat Durumu - Dropdown
  try {
    const firsatDurumuOptions = [
      'Fırsat İletildi',
      'Bilgi Verildi',
      'Teklif Hazırlandı',
      'Teklif Gönderildi',
      'Müzakere Edildi',
      'Anlaşma Sağlandı',
      'Satış Tamamlandı',
      'Fırsat Kaybedildi',
      'İleri Tarih',
      'Yeniden Aranacak'
    ];
    
    const firsatDurumuRange = sheet.getRange(2, 7, lastRow - 1, 1); // G sütunu
    const firsatDurumuRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(firsatDurumuOptions, true)
      .setAllowInvalid(false)
      .setHelpText('Lütfen listeden bir seçenek seçin')
      .build();
    firsatDurumuRange.setDataValidation(firsatDurumuRule);
    console.log('Fırsat Durumu dropdown uygulandı');
  } catch (error) {
    console.error('Fırsat Durumu validation hatası:', error);
  }
  
  console.log('Fırsatlarım veri doğrulama kuralları tamamlandı');
}

// Test fonksiyonu
function testFirsatlarimFix() {
  console.log('=== FIRSATLARIM FIX TEST ===');
  fixFirsatlarimValidation();
}

console.log('Fırsatlarım validation fix script loaded'); 