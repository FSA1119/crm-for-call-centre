// ========================================
// SİNKRONİZASYON TEST FONKSİYONLARI
// ========================================

// Test fonksiyonu - bağlantıları kontrol eder
function testConnections() {
  console.log('=== BAĞLANTI TESTLERİ BAŞLADI ===');
  
  const results = {
    success: [],
    errors: []
  };
  
  // Temsilci dosyalarını test et
  for (const [employeeCode, fileId] of Object.entries(EMPLOYEE_FILES)) {
    try {
      console.log(`${employeeCode} dosyası test ediliyor...`);
      const file = SpreadsheetApp.openById(fileId);
      
      if (file) {
        const sheetNames = file.getSheets().map(sheet => sheet.getName());
        console.log(`${employeeCode} bağlantısı başarılı. Sayfalar:`, sheetNames);
        
        results.success.push({
          employeeCode,
          fileName: file.getName(),
          sheets: sheetNames
        });
      } else {
        throw new Error('Dosya açılamadı');
      }
      
    } catch (error) {
      console.error(`${employeeCode} bağlantı hatası:`, error.message);
      results.errors.push({
        employeeCode,
        error: error.message
      });
    }
  }
  
  // Sonuçları göster
  console.log('\n=== TEST SONUÇLARI ===');
  console.log('Başarılı bağlantılar:', results.success.length);
  console.log('Hatalar:', results.errors.length);
  
  if (results.errors.length > 0) {
    console.log('Hata detayları:', results.errors);
  }
  
  return results;
}

// Test fonksiyonu - tek dosya senkronizasyonu
function testSingleFileSync(employeeCode) {
  console.log(`=== ${employeeCode} TEK DOSYA TESTİ ===`);
  
  try {
    const fileId = EMPLOYEE_FILES[employeeCode];
    if (!fileId) {
      throw new Error('Geçersiz temsilci kodu');
    }
    
    const employeeFile = SpreadsheetApp.openById(fileId);
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    
    console.log(`${employeeCode} dosyası açıldı:`, employeeFile.getName());
    
    const stats = collectEmployeeData(employeeFile, employeeCode, managerFile);
    
    console.log(`${employeeCode} test sonuçları:`, stats);
    
    return {
      success: true,
      employeeCode,
      stats
    };
    
  } catch (error) {
    console.error(`${employeeCode} test hatası:`, error.message);
    return {
      success: false,
      employeeCode,
      error: error.message
    };
  }
}

// Test fonksiyonu - sayfa yapısını kontrol eder
function testSheetStructure(employeeCode) {
  console.log(`=== ${employeeCode} SAYFA YAPISI TESTİ ===`);
  
  try {
    const fileId = EMPLOYEE_FILES[employeeCode];
    const file = SpreadsheetApp.openById(fileId);
    
    const requiredSheets = ['Randevularım', 'Fırsatlarım', 'Toplantılarım'];
    const existingSheets = file.getSheets().map(sheet => sheet.getName());
    
    const results = {
      employeeCode,
      existingSheets,
      missingSheets: [],
      availableSheets: []
    };
    
    for (const requiredSheet of requiredSheets) {
      if (existingSheets.includes(requiredSheet)) {
        results.availableSheets.push(requiredSheet);
        
        // Sayfa verilerini kontrol et
        const sheet = file.getSheetByName(requiredSheet);
        const lastRow = sheet.getLastRow();
        const lastCol = sheet.getLastColumn();
        
        console.log(`${requiredSheet}: ${lastRow} satır, ${lastCol} sütun`);
        
      } else {
        results.missingSheets.push(requiredSheet);
      }
    }
    
    console.log(`${employeeCode} sayfa yapısı:`, results);
    return results;
    
  } catch (error) {
    console.error(`${employeeCode} sayfa yapısı test hatası:`, error.message);
    return {
      employeeCode,
      error: error.message
    };
  }
}

// Test fonksiyonu - tüm dosyaları test eder
function testAllFiles() {
  console.log('=== TÜM DOSYALAR TEST EDİLİYOR ===');
  
  const results = {
    connections: testConnections(),
    sheetStructures: [],
    syncTests: []
  };
  
  // Her dosya için sayfa yapısını test et
  for (const employeeCode of Object.keys(EMPLOYEE_FILES)) {
    const structureResult = testSheetStructure(employeeCode);
    results.sheetStructures.push(structureResult);
  }
  
  // Başarılı bağlantılar için senkronizasyon testi
  for (const successResult of results.connections.success) {
    const syncResult = testSingleFileSync(successResult.employeeCode);
    results.syncTests.push(syncResult);
  }
  
  // Özet rapor
  console.log('\n=== GENEL TEST RAPORU ===');
  console.log('Bağlantı testleri:', results.connections.success.length, 'başarılı,', results.connections.errors.length, 'hata');
  console.log('Sayfa yapısı testleri:', results.sheetStructures.length, 'tamamlandı');
  console.log('Senkronizasyon testleri:', results.syncTests.length, 'tamamlandı');
  
  return results;
}

// Test fonksiyonu - Yönetici dosyası yapısını kontrol eder
function testManagerFile() {
  console.log('=== YÖNETİCİ DOSYASI TESTİ ===');
  
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = managerFile.getSheets();
    
    const results = {
      fileName: managerFile.getName(),
      totalSheets: sheets.length,
      sheetNames: sheets.map(sheet => sheet.getName()),
      requiredSheets: ['Randevular', 'Fırsatlar', 'Toplantılar', 'Raporlar'],
      missingSheets: []
    };
    
    for (const requiredSheet of results.requiredSheets) {
      if (!results.sheetNames.includes(requiredSheet)) {
        results.missingSheets.push(requiredSheet);
      }
    }
    
    console.log('Yönetici dosyası yapısı:', results);
    return results;
    
  } catch (error) {
    console.error('Yönetici dosyası test hatası:', error.message);
    return {
      error: error.message
    };
  }
}

// Test fonksiyonu - menü oluşturmayı test eder
function testMenuCreation() {
  console.log('=== MENÜ OLUŞTURMA TESTİ ===');
  
  try {
    createManagerMenu();
    console.log('Menü oluşturma başarılı');
    return { success: true };
  } catch (error) {
    console.error('Menü oluşturma hatası:', error.message);
    return { success: false, error: error.message };
  }
}

// Ana test fonksiyonu
function runAllTests() {
  console.log('=== TÜM TESTLER BAŞLADI ===');
  
  const startTime = new Date();
  
  const testResults = {
    managerFile: testManagerFile(),
    menuCreation: testMenuCreation(),
    allFiles: testAllFiles(),
    timestamp: startTime.toISOString()
  };
  
  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;
  
  console.log(`\n=== TEST TAMAMLANDI (${duration} saniye) ===`);
  console.log('Test sonuçları:', testResults);
  
  // Sonuçları göster
  const successCount = testResults.allFiles.connections.success.length;
  const errorCount = testResults.allFiles.connections.errors.length;
  
  const message = `
Test Tamamlandı!

📊 Sonuçlar:
• Başarılı bağlantılar: ${successCount}
• Hatalar: ${errorCount}
• Süre: ${duration} saniye

${errorCount > 0 ? '❌ Bazı hatalar var. Console loglarını kontrol edin.' : '✅ Tüm testler başarılı!'}
  `.trim();
  
  SpreadsheetApp.getUi().alert('Test Sonuçları', message, SpreadsheetApp.getUi().ButtonSet.OK);
  
  return testResults;
}

console.log('Synchronization test functions loaded'); 