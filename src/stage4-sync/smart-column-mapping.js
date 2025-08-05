// ========================================
// AKILLI SÜTUN EŞLEŞTİRME SİSTEMİ
// ========================================

// Sütun eşleştirme konfigürasyonu
const COLUMN_MAPPING = {
  // Standart sütun isimleri
  'Kod': ['Kod', 'Code', 'ID', 'Müşteri Kodu'],
  'Şirket Adı': ['Şirket Adı', 'Company', 'Firma', 'Şirket', 'Company Name'],
  'Telefon': ['Telefon', 'Phone', 'Tel', 'Telefon No', 'Phone Number'],
  'Mail': ['Mail', 'Email', 'E-mail', 'E-posta'],
  'Adres': ['Adres', 'Address', 'Konum', 'Location'],
  'Randevu Tarihi': ['Randevu Tarihi', 'Appointment Date', 'Tarih', 'Date'],
  'Fırsat Tarihi': ['Fırsat Tarihi', 'Opportunity Date', 'Tarih', 'Date'],
  'Toplantı Tarihi': ['Toplantı Tarihi', 'Meeting Date', 'Tarih', 'Date'],
  'Aktivite': ['Aktivite', 'Activity', 'Durum', 'Status'],
  'Fırsat Durumu': ['Fırsat Durumu', 'Opportunity Status', 'Durum', 'Status'],
  'Toplantı Saati': ['Toplantı Saati', 'Meeting Time', 'Saat', 'Time'],
  'Randevu Durumu': ['Randevu Durumu', 'Appointment Status', 'Durum', 'Status'],
  'Toplantı Sonucu': ['Toplantı Sonucu', 'Meeting Result', 'Sonuç', 'Result'],
  'Kaynak': ['Kaynak', 'Source', 'Origin'],
  'Yönetici Not': ['Yönetici Not', 'Manager Note', 'Not', 'Note']
};

// Akıllı sütun eşleştirme fonksiyonu
function detectColumnMapping(sheet) {
  console.log('=== AKILLI SÜTUN EŞLEŞTİRME BAŞLADI ===');
  
  try {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    console.log('Bulunan başlıklar:', headers);
    
    const mapping = {};
    const detectedColumns = {};
    
    // Her standart sütun için eşleştirme yap
    for (const [standardColumn, possibleNames] of Object.entries(COLUMN_MAPPING)) {
      let foundIndex = -1;
      
      // Başlıklarda ara
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i];
        if (header && possibleNames.some(name => 
          header.toString().toLowerCase().includes(name.toLowerCase())
        )) {
          foundIndex = i;
          break;
        }
      }
      
      if (foundIndex !== -1) {
        mapping[standardColumn] = foundIndex;
        detectedColumns[foundIndex] = standardColumn;
        console.log(`✅ ${standardColumn} → Sütun ${foundIndex + 1} (${headers[foundIndex]})`);
      } else {
        console.log(`❌ ${standardColumn} bulunamadı`);
      }
    }
    
    // Eşleşmeyen sütunları raporla
    const unmatchedColumns = [];
    for (let i = 0; i < headers.length; i++) {
      if (!detectedColumns[i] && headers[i]) {
        unmatchedColumns.push({
          index: i,
          name: headers[i]
        });
      }
    }
    
    if (unmatchedColumns.length > 0) {
      console.log('⚠️ Eşleşmeyen sütunlar:');
      unmatchedColumns.forEach(col => {
        console.log(`   Sütun ${col.index + 1}: ${col.name}`);
      });
    }
    
    console.log('=== AKILLI SÜTUN EŞLEŞTİRME TAMAMLANDI ===');
    return mapping;
    
  } catch (error) {
    console.error('Sütun eşleştirme hatası:', error);
    return null;
  }
}

// Veriyi standart formata dönüştür
function transformDataToStandardFormat(sheet, columnMapping) {
  console.log('=== VERİ DÖNÜŞTÜRME BAŞLADI ===');
  
  try {
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('Veri yok');
      return [];
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    const transformedData = [];
    
    // Standart sütun sırası
    const standardColumns = [
      'Kod', 'Şirket Adı', 'Telefon', 'Mail', 'Adres', 
      'Randevu Tarihi', 'Fırsat Tarihi', 'Toplantı Tarihi',
      'Aktivite', 'Fırsat Durumu', 'Toplantı Saati', 
      'Randevu Durumu', 'Toplantı Sonucu', 'Kaynak', 'Yönetici Not'
    ];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const transformedRow = [];
      
      // Her standart sütun için veriyi al
      for (const columnName of standardColumns) {
        const sourceIndex = columnMapping[columnName];
        if (sourceIndex !== undefined && sourceIndex < row.length) {
          transformedRow.push(row[sourceIndex] || '');
        } else {
          transformedRow.push(''); // Boş değer
        }
      }
      
      // Boş satırları atla
      if (transformedRow.some(cell => cell !== '')) {
        transformedData.push(transformedRow);
      }
    }
    
    console.log(`${transformedData.length} satır dönüştürüldü`);
    console.log('=== VERİ DÖNÜŞTÜRME TAMAMLANDI ===');
    
    return transformedData;
    
  } catch (error) {
    console.error('Veri dönüştürme hatası:', error);
    return [];
  }
}

// Gelişmiş veri toplama fonksiyonu
function collectSheetDataWithSmartMapping(sheet, employeeCode) {
  console.log(`=== ${employeeCode} AKILLI VERİ TOPLAMA ===`);
  
  try {
    // Sütun eşleştirmesini tespit et
    const columnMapping = detectColumnMapping(sheet);
    
    if (!columnMapping) {
      throw new Error('Sütun eşleştirmesi yapılamadı');
    }
    
    // Veriyi standart formata dönüştür
    const transformedData = transformDataToStandardFormat(sheet, columnMapping);
    
    // Sonuç formatına çevir
    const result = [];
    for (let i = 0; i < transformedData.length; i++) {
      result.push({
        temsilciKodu: employeeCode,
        rowIndex: i + 2,
        data: transformedData[i]
      });
    }
    
    console.log(`${employeeCode} için ${result.length} kayıt hazırlandı`);
    return result;
    
  } catch (error) {
    console.error(`${employeeCode} akıllı veri toplama hatası:`, error);
    return [];
  }
}

// Test fonksiyonu
function testSmartMapping(employeeCode) {
  console.log(`=== ${employeeCode} AKILLI EŞLEŞTİRME TESTİ ===`);
  
  try {
    const fileId = EMPLOYEE_FILES[employeeCode];
    const file = SpreadsheetApp.openById(fileId);
    
    // Randevularım test
    const randevularimSheet = file.getSheetByName('Randevularım');
    if (randevularimSheet) {
      console.log('\n--- Randevularım Test ---');
      const randevuData = collectSheetDataWithSmartMapping(randevularimSheet, employeeCode);
      console.log(`Randevularım: ${randevuData.length} kayıt`);
    }
    
    // Fırsatlarım test
    const firsatlarimSheet = file.getSheetByName('Fırsatlarım');
    if (firsatlarimSheet) {
      console.log('\n--- Fırsatlarım Test ---');
      const firsatData = collectSheetDataWithSmartMapping(firsatlarimSheet, employeeCode);
      console.log(`Fırsatlarım: ${firsatData.length} kayıt`);
    }
    
    // Toplantılarım test
    const toplantilarimSheet = file.getSheetByName('Toplantılarım');
    if (toplantilarimSheet) {
      console.log('\n--- Toplantılarım Test ---');
      const toplantıData = collectSheetDataWithSmartMapping(toplantilarimSheet, employeeCode);
      console.log(`Toplantılarım: ${toplantıData.length} kayıt`);
    }
    
    SpreadsheetApp.getUi().alert('Test Tamamlandı', `${employeeCode} için akıllı eşleştirme testi tamamlandı. Console loglarını kontrol edin.`, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Akıllı eşleştirme test hatası:', error);
    SpreadsheetApp.getUi().alert('Test Hatası', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

console.log('Akıllı sütun eşleştirme sistemi yüklendi'); 