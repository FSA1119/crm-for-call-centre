// ========================================
// SİNKRONİZASYON TEST FONKSİYONLARI
// ========================================

// Test function - checks connections
function testConnections() {
  console.log('=== BAĞLANTI TESTLERİ ===');
  
  try {
    const results = {};
    
    for (const [employeeCode, fileId] of Object.entries(EMPLOYEE_FILES)) {
      try {
        const file = SpreadsheetApp.openById(fileId);
        if (file) {
          results[employeeCode] = '✅ Bağlantı başarılı';
          console.log(`${employeeCode}: ✅ Bağlantı başarılı`);
        } else {
          results[employeeCode] = '❌ Dosya bulunamadı';
          console.log(`${employeeCode}: ❌ Dosya bulunamadı`);
        }
      } catch (error) {
        results[employeeCode] = `❌ Hata: ${error.message}`;
        console.log(`${employeeCode}: ❌ Hata: ${error.message}`);
      }
    }
    
    // Manager file test
    try {
      const managerFile = SpreadsheetApp.openById(MANAGER_FILE_ID);
      if (managerFile) {
        results['Manager'] = '✅ Bağlantı başarılı';
        console.log('Manager: ✅ Bağlantı başarılı');
      } else {
        results['Manager'] = '❌ Dosya bulunamadı';
        console.log('Manager: ❌ Dosya bulunamadı');
      }
    } catch (error) {
      results['Manager'] = `❌ Hata: ${error.message}`;
      console.log(`Manager: ❌ Hata: ${error.message}`);
    }
    
    // Sonuçları göster
    let message = 'Bağlantı Test Sonuçları:\n\n';
    for (const [file, result] of Object.entries(results)) {
      message += `${file}: ${result}\n`;
    }
    
    SpreadsheetApp.getUi().alert('Bağlantı Testleri', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Bağlantı test hatası:', error);
    SpreadsheetApp.getUi().alert('Test Hatası', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ========================================
// TEK TEK TEMSİLCİ TEST FONKSİYONLARI
// ========================================

// LG 001 özel test
function testLG001Only() {
  console.log('=== LG 001 ÖZEL TESTİ ===');
  testSingleEmployeeSync('LG 001');
}

// NT 002 özel test
function testNT002Only() {
  console.log('=== NT 002 ÖZEL TESTİ ===');
  testSingleEmployeeSync('NT 002');
}

// KO 003 özel test
function testKO003Only() {
  console.log('=== KO 003 ÖZEL TESTİ ===');
  testSingleEmployeeSync('KO 003');
}

// SB 004 özel test
function testSB004Only() {
  console.log('=== SB 004 ÖZEL TESTİ ===');
  testSingleEmployeeSync('SB 004');
}

// KM 005 özel test
function testKM005Only() {
  console.log('=== KM 005 ÖZEL TESTİ ===');
  testSingleEmployeeSync('KM 005');
}

// GŞ 006 özel test
function testGS006Only() {
  console.log('=== GŞ 006 ÖZEL TESTİ ===');
  testSingleEmployeeSync('GŞ 006');
}

// Tek temsilci senkronizasyon testi
function testSingleEmployeeSync(employeeCode) {
  try {
    const fileId = EMPLOYEE_FILES[employeeCode];
    const file = SpreadsheetApp.openById(fileId);
    
    if (!file) {
      throw new Error(`${employeeCode} dosyası bulunamadı`);
    }
    
    console.log(`${employeeCode} dosyası açıldı:`, file.getName());
    
    const stats = {
      randevular: 0,
      firsatlar: 0,
      toplantilar: 0,
      raporlar: 0
    };
    
    // Randevularım test
    const randevularimSheet = file.getSheetByName('Randevularım');
    if (randevularimSheet) {
      const lastRow = randevularimSheet.getLastRow();
      stats.randevular = lastRow > 1 ? lastRow - 1 : 0;
      console.log(`${employeeCode} Randevularım: ${stats.randevular} kayıt`);
    }
    
    // Fırsatlarım test
    const firsatlarimSheet = file.getSheetByName('Fırsatlarım');
    if (firsatlarimSheet) {
      const lastRow = firsatlarimSheet.getLastRow();
      stats.firsatlar = lastRow > 1 ? lastRow - 1 : 0;
      console.log(`${employeeCode} Fırsatlarım: ${stats.firsatlar} kayıt`);
    }
    
    // Toplantılarım test
    const toplantilarimSheet = file.getSheetByName('Toplantılarım');
    if (toplantilarimSheet) {
      const lastRow = toplantilarimSheet.getLastRow();
      stats.toplantilar = lastRow > 1 ? lastRow - 1 : 0;
      console.log(`${employeeCode} Toplantılarım: ${stats.toplantilar} kayıt`);
    }
    
    // Raporlarım test
    const raporlarimSheet = file.getSheetByName('Raporlarım');
    if (raporlarimSheet) {
      const lastRow = raporlarimSheet.getLastRow();
      stats.raporlar = lastRow > 1 ? lastRow - 1 : 0;
      console.log(`${employeeCode} Raporlarım: ${stats.raporlar} kayıt`);
    }
    
    const totalRecords = stats.randevular + stats.firsatlar + stats.toplantilar + stats.raporlar;
    
    const message = `
${employeeCode} Test Sonucu:

📊 Veriler:
• Randevular: ${stats.randevular}
• Fırsatlar: ${stats.firsatlar}
• Toplantılar: ${stats.toplantilar}
• Raporlar: ${stats.raporlar}

Toplam: ${totalRecords} kayıt
✅ Test başarılı
    `.trim();
    
    SpreadsheetApp.getUi().alert(`${employeeCode} Test`, message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error(`${employeeCode} test hatası:`, error);
    SpreadsheetApp.getUi().alert(`${employeeCode} Test Hatası`, error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// Test function - checks sheet structure
function testSheetStructure(employeeCode) {
  console.log(`=== ${employeeCode} SAYFA YAPISI TESTİ ===`);
  
  try {
    const fileId = EMPLOYEE_FILES[employeeCode];
    const file = SpreadsheetApp.openById(fileId);
    
    if (!file) {
      throw new Error(`${employeeCode} dosyası bulunamadı`);
    }
    
    const sheets = file.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    
    console.log(`${employeeCode} sayfaları:`, sheetNames);
    
    const requiredSheets = ['Randevularım', 'Fırsatlarım', 'Toplantılarım', 'Raporlarım'];
    const missingSheets = requiredSheets.filter(sheet => !sheetNames.includes(sheet));
    
    let message = `${employeeCode} Sayfa Yapısı:\n\n`;
    message += `Mevcut sayfalar:\n`;
    sheetNames.forEach(sheet => {
      message += `• ${sheet}\n`;
    });
    
    if (missingSheets.length > 0) {
      message += `\n❌ Eksik sayfalar:\n`;
      missingSheets.forEach(sheet => {
        message += `• ${sheet}\n`;
      });
    } else {
      message += `\n✅ Tüm gerekli sayfalar mevcut`;
    }
    
    SpreadsheetApp.getUi().alert(`${employeeCode} Sayfa Yapısı`, message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error(`${employeeCode} sayfa yapısı test hatası:`, error);
    SpreadsheetApp.getUi().alert(`${employeeCode} Test Hatası`, error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// Test function - tests all files
function testAllFiles() {
  console.log('=== TÜM DOSYALAR TESTİ ===');
  
  try {
    const results = {};
    
    for (const employeeCode of Object.keys(EMPLOYEE_FILES)) {
      console.log(`\n--- ${employeeCode} Test Ediliyor ---`);
      try {
        testSingleEmployeeSync(employeeCode);
        results[employeeCode] = '✅ Başarılı';
      } catch (error) {
        results[employeeCode] = `❌ Hata: ${error.message}`;
      }
    }
    
    // Sonuçları raporla
    let report = 'Tüm Dosyalar Test Sonuçları:\n\n';
    for (const [employeeCode, result] of Object.entries(results)) {
      report += `${employeeCode}: ${result}\n`;
    }
    
    SpreadsheetApp.getUi().alert('Toplu Test Raporu', report, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Toplu test hatası:', error);
    SpreadsheetApp.getUi().alert('Test Hatası', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// Test function - checks Manager file structure
function testManagerFile() {
  console.log('=== YÖNETİCİ DOSYASI TESTİ ===');
  
  try {
    const managerFile = SpreadsheetApp.openById(MANAGER_FILE_ID);
    
    if (!managerFile) {
      throw new Error('Yönetici dosyası bulunamadı');
    }
    
    const sheets = managerFile.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    
    console.log('Yönetici dosyası sayfaları:', sheetNames);
    
    const requiredSheets = ['Randevular', 'Fırsatlar', 'Toplantılar', 'Raporlar'];
    const missingSheets = requiredSheets.filter(sheet => !sheetNames.includes(sheet));
    
    let message = 'Yönetici Dosyası Yapısı:\n\n';
    message += `Mevcut sayfalar:\n`;
    sheetNames.forEach(sheet => {
      message += `• ${sheet}\n`;
    });
    
    if (missingSheets.length > 0) {
      message += `\n❌ Eksik sayfalar:\n`;
      missingSheets.forEach(sheet => {
        message += `• ${sheet}\n`;
      });
    } else {
      message += `\n✅ Tüm gerekli sayfalar mevcut`;
    }
    
    SpreadsheetApp.getUi().alert('Yönetici Dosyası Test', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Yönetici dosyası test hatası:', error);
    SpreadsheetApp.getUi().alert('Test Hatası', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// Test function - tests menu creation
function testMenuCreation() {
  console.log('=== MENÜ OLUŞTURMA TESTİ ===');
  
  try {
    createManagerMenu();
    SpreadsheetApp.getUi().alert('Menü Test', '✅ Menü başarıyla oluşturuldu!', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Menü oluşturma test hatası:', error);
    SpreadsheetApp.getUi().alert('Test Hatası', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// Main test function
function runAllTests() {
  console.log('=== TÜM TESTLER BAŞLADI ===');
  
  try {
    // Bağlantı testleri
    testConnections();
    
    // Yönetici dosyası testi
    testManagerFile();
    
    // Menü testi
    testMenuCreation();
    
    // Tüm dosyalar testi
    testAllFiles();
    
    console.log('=== TÜM TESTLER TAMAMLANDI ===');
    SpreadsheetApp.getUi().alert('Test Tamamlandı', '✅ Tüm testler başarıyla tamamlandı!', SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Test hatası:', error);
    SpreadsheetApp.getUi().alert('Test Hatası', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

console.log('Synchronization test functions loaded'); 