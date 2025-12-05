// ========================================
// GOOGLE SHEETS CRM SYSTEM - DEVELOPER AGENT
// ========================================
// Version: 1.0
// Author: Auto (Cursor AI Assistant) - CRM Development Team
// Date: 2025-01-XX
// Purpose: Development, Testing, and Debugging Tools

console.log('🔧 DEBUG: developer.js dosyası yüklendi - Developer Agent aktif!');

// ========================================
// GLOBAL CONSTANTS & VARIABLES
// ========================================

const DEVELOPER_CONFIG = {
  // Test settings
  TEST_BATCH_SIZE: 10,
  TEST_TIMEOUT_MS: 30000,
  
  // Required sheets for system check
  REQUIRED_SHEETS: [
    'Randevularım',
    'Fırsatlarım',
    'Toplantılarım',
    'Raporlarım'
  ],
  
  // Required columns for validation
  REQUIRED_COLUMNS: {
    'Randevularım': ['Randevu Durumu', 'Randevu Tarihi', 'Company name'],
    'Fırsatlarım': ['Fırsat Durumu', 'Company name'],
    'Toplantılarım': ['Toplantı Sonucu', 'Toplantı Tarihi', 'Company name']
  }
};

// ========================================
// 🔧 UTILITY FUNCTIONS
// ========================================

/**
 * Input validation for developer functions
 * @param {Object} parameters - Parameters to validate
 * @returns {boolean} - Validation result
 */
function validateInput(parameters) {
  console.log('Validating input:', parameters);
  
  try {
    if (parameters === null || parameters === undefined) {
      return true; // Empty parameters are allowed
    }
    
    if (typeof parameters !== 'object') {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

/**
 * Find column index by name (case-insensitive)
 * @param {Array} headers - Array of header names
 * @param {Array|string} columnNames - Column name(s) to find
 * @returns {number} - Column index (-1 if not found)
 */
function findColumnIndex(headers, columnNames) {
  const names = Array.isArray(columnNames) ? columnNames : [columnNames];
  const lowerHeaders = headers.map(h => (h || '').toString().toLowerCase().trim());
  
  for (const name of names) {
    const lowerName = name.toLowerCase().trim();
    const index = lowerHeaders.indexOf(lowerName);
    if (index !== -1) return index;
  }
  
  return -1;
}

// ========================================
// 🧪 TESTING FUNCTIONS
// ========================================

/**
 * 🧪 Quick System Check - Проверка системы
 * Проверяет наличие всех необходимых листов и колонок
 */
function quickSystemCheck(parameters) {
  console.log('Function started: quickSystemCheck', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    const results = {
      success: true,
      errors: [],
      warnings: [],
      info: []
    };
    
    // Проверка листов
    const sheets = ss.getSheets();
    const sheetNames = sheets.map(s => s.getName());
    
    for (const requiredSheet of DEVELOPER_CONFIG.REQUIRED_SHEETS) {
      if (!sheetNames.includes(requiredSheet)) {
        results.errors.push(`Sayfa "${requiredSheet}" bulunamadı`);
      } else {
        results.info.push(`✓ Sayfa "${requiredSheet}" bulundu`);
      }
    }
    
    // Проверка колонок на каждом листе
    for (const sheetName of DEVELOPER_CONFIG.REQUIRED_SHEETS) {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const requiredCols = DEVELOPER_CONFIG.REQUIRED_COLUMNS[sheetName] || [];
        
        for (const colName of requiredCols) {
          const colIndex = findColumnIndex(headers, colName);
          if (colIndex === -1) {
            results.errors.push(`"${sheetName}" sayfasında "${colName}" kolonu bulunamadı`);
          } else {
            results.info.push(`✓ "${sheetName}" sayfasında "${colName}" kolonu bulundu`);
          }
        }
      }
    }
    
    // Формирование отчета
    let report = '=== SİSTEM KONTROLÜ ===\n\n';
    
    if (results.info.length > 0) {
      report += '✓ Başarılı:\n' + results.info.join('\n') + '\n\n';
    }
    
    if (results.warnings.length > 0) {
      report += '⚠ Uyarılar:\n' + results.warnings.join('\n') + '\n\n';
    }
    
    if (results.errors.length > 0) {
      report += '✗ Hatalar:\n' + results.errors.join('\n') + '\n\n';
      results.success = false;
    }
    
    if (results.errors.length === 0 && results.warnings.length === 0) {
      report += '✅ Sistem düzgün çalışıyor!';
    }
    
    console.log('System check complete:', results);
    ui.alert('Sistem Kontrolü', report, ui.ButtonSet.OK);
    
    return results;
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🧪 Test Data Validation - Тестирование валидации данных
 * Проверяет валидность данных на активном листе
 */
function testDataValidation(parameters) {
  console.log('Function started: testDataValidation', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const sheetName = sheet.getName();
    
    const results = {
      totalRows: 0,
      validRows: 0,
      invalidRows: [],
      issues: []
    };
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Sayfada veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, message: 'Kontrol edilecek veri yok' };
    }
    
    results.totalRows = data.length - 1; // Exclude header
    const headers = data[0];
    
    // Проверка обязательных колонок
    const requiredCols = DEVELOPER_CONFIG.REQUIRED_COLUMNS[sheetName] || [];
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      let rowValid = true;
      const rowIssues = [];
      
      for (const colName of requiredCols) {
        const colIndex = findColumnIndex(headers, colName);
        if (colIndex !== -1) {
          const value = row[colIndex];
          if (!value || value.toString().trim() === '') {
            rowValid = false;
            rowIssues.push(`Пустое значение в "${colName}"`);
          }
        }
      }
      
      if (rowValid) {
        results.validRows++;
      } else {
        results.invalidRows.push({
          row: i + 1,
          issues: rowIssues
        });
      }
    }
    
    // Формирование отчета
    let report = `=== VERİ KONTROLÜ: ${sheetName} ===\n\n`;
    report += `Toplam satır: ${results.totalRows}\n`;
    report += `Geçerli: ${results.validRows}\n`;
    report += `Geçersiz: ${results.invalidRows.length}\n\n`;
    
    if (results.invalidRows.length > 0) {
      report += 'Sorunlu satırlar:\n';
      results.invalidRows.slice(0, 10).forEach(item => {
        report += `Satır ${item.row}: ${item.issues.join(', ')}\n`;
      });
      if (results.invalidRows.length > 10) {
        report += `... ve ${results.invalidRows.length - 10} satır daha\n`;
      }
    } else {
      report += '✅ Tüm veriler geçerli!';
    }
    
    console.log('Data validation complete:', results);
    ui.alert('Veri Kontrolü', report, ui.ButtonSet.OK);
    
    return results;
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🧪 Test Column Structure - Проверка структуры колонок
 * Сравнивает структуру листа с эталонной
 */
function testColumnStructure(parameters) {
  console.log('Function started: testColumnStructure', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const sheetName = sheet.getName();
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const expectedCols = DEVELOPER_CONFIG.REQUIRED_COLUMNS[sheetName] || [];
    
    const results = {
      found: [],
      missing: [],
      extra: []
    };
    
    // Проверка ожидаемых колонок
    for (const colName of expectedCols) {
      const index = findColumnIndex(headers, colName);
      if (index !== -1) {
        results.found.push(colName);
      } else {
        results.missing.push(colName);
      }
    }
    
    // Поиск лишних колонок (если есть эталон)
    if (expectedCols.length > 0) {
      const lowerExpected = expectedCols.map(c => c.toLowerCase());
      headers.forEach((header, index) => {
        const lowerHeader = (header || '').toString().toLowerCase().trim();
        if (lowerHeader && !lowerExpected.includes(lowerHeader)) {
          results.extra.push({
            name: header,
            index: index + 1
          });
        }
      });
    }
    
    // Формирование отчета
    let report = `=== KOLON YAPISI: ${sheetName} ===\n\n`;
    
    if (results.found.length > 0) {
      report += `✓ Bulundu (${results.found.length}):\n${results.found.join(', ')}\n\n`;
    }
    
    if (results.missing.length > 0) {
      report += `✗ Eksik (${results.missing.length}):\n${results.missing.join(', ')}\n\n`;
    }
    
    if (results.extra.length > 0) {
      report += `⚠ Ekstra kolonlar (${results.extra.length}):\n`;
      results.extra.forEach(col => {
        report += `  - "${col.name}" (kolon ${col.index})\n`;
      });
      report += '\n';
    }
    
    if (results.missing.length === 0 && results.extra.length === 0) {
      report += '✅ Yapı gereksinimlere uygun!';
    }
    
    console.log('Column structure check complete:', results);
    ui.alert('Kolon Yapısı Kontrolü', report, ui.ButtonSet.OK);
    
    return results;
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

// ========================================
// 🔍 DEBUGGING FUNCTIONS
// ========================================

/**
 * 🔍 Debug Sheet Info - Отладочная информация о листе
 * Выводит подробную информацию о текущем листе
 */
function debugSheetInfo(parameters) {
  console.log('Function started: debugSheetInfo', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    
    const info = {
      name: sheet.getName(),
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn(),
      numRows: sheet.getMaxRows(),
      numColumns: sheet.getMaxColumns(),
      frozenRows: sheet.getFrozenRows(),
      frozenColumns: sheet.getFrozenColumns()
    };
    
    // Получение заголовков
    const headers = sheet.getRange(1, 1, 1, info.lastColumn).getValues()[0];
    
    // Формирование отчета
    let report = `=== SAYFA BİLGİSİ ===\n\n`;
    report += `Ad: ${info.name}\n`;
    report += `Son satır: ${info.lastRow}\n`;
    report += `Son kolon: ${info.lastColumn}\n`;
    report += `Maks. satır: ${info.numRows}\n`;
    report += `Maks. kolon: ${info.numColumns}\n`;
    report += `Sabitlenmiş satır: ${info.frozenRows}\n`;
    report += `Sabitlenmiş kolon: ${info.frozenColumns}\n\n`;
    report += `Kolonlar (${headers.length}):\n`;
    
    headers.forEach((header, index) => {
      report += `  ${index + 1}. ${header || '(boş)'}\n`;
    });
    
    console.log('Sheet info:', info);
    console.log('Headers:', headers);
    ui.alert('Sayfa Bilgisi', report, ui.ButtonSet.OK);
    
    return info;
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🔍 Debug Selected Range - Отладка выбранного диапазона
 * Выводит информацию о выбранном диапазоне
 */
function debugSelectedRange(parameters) {
  console.log('Function started: debugSelectedRange', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const range = sheet.getActiveRange();
    
    if (!range) {
      ui.alert('Bilgi', 'Aralık seçilmedi.', ui.ButtonSet.OK);
      return { success: false, message: 'No range selected' };
    }
    
    const info = {
      a1Notation: range.getA1Notation(),
      row: range.getRow(),
      column: range.getColumn(),
      numRows: range.getNumRows(),
      numColumns: range.getNumColumns(),
      values: range.getValues(),
      formulas: range.getFormulas(),
      backgrounds: range.getBackgrounds(),
      fontColors: range.getFontColors()
    };
    
    // Формирование отчета
    let report = `=== ARALIK BİLGİSİ ===\n\n`;
    report += `A1 notasyonu: ${info.a1Notation}\n`;
    report += `Satır: ${info.row}\n`;
    report += `Kolon: ${info.column}\n`;
    report += `Satır sayısı: ${info.numRows}\n`;
    report += `Kolon sayısı: ${info.numColumns}\n\n`;
    report += `Değerler:\n`;
    
    info.values.forEach((row, rowIdx) => {
      report += `  Satır ${info.row + rowIdx}: [${row.join(', ')}]\n`;
    });
    
    console.log('Range info:', info);
    ui.alert('Aralık Bilgisi', report, ui.ButtonSet.OK);
    
    return info;
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🔍 Debug Formulas - Отладка формул
 * Показывает все формулы на листе
 */
function debugFormulas(parameters) {
  console.log('Function started: debugFormulas', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const ss = sheet.getParent();
    
    const dataRange = sheet.getDataRange();
    const formulas = dataRange.getFormulas();
    const formulasList = [];
    
    formulas.forEach((row, rowIdx) => {
      row.forEach((formula, colIdx) => {
        if (formula && formula.toString().trim() !== '') {
          formulasList.push({
            row: rowIdx + 1,
            column: colIdx + 1,
            a1: sheet.getRange(rowIdx + 1, colIdx + 1).getA1Notation(),
            formula: formula
          });
        }
      });
    });
    
    if (formulasList.length === 0) {
      ui.alert('Bilgi', 'Sayfada formül bulunamadı.', ui.ButtonSet.OK);
      return { success: true, count: 0 };
    }
    
    // Создание отчета
    const reportName = '🧪 Formüller - ' + sheet.getName();
    let reportSheet = ss.getSheetByName(reportName);
    if (!reportSheet) {
      reportSheet = ss.insertSheet(reportName);
    }
    reportSheet.clear();
    
    const headers = [['Satır', 'Kolon', 'A1', 'Formül']];
    const data = formulasList.map(f => [f.row, f.column, f.a1, f.formula]);
    
    reportSheet.getRange(1, 1, 1, 4).setValues(headers).setFontWeight('bold');
    reportSheet.getRange(2, 1, data.length, 4).setValues(data);
    reportSheet.setFrozenRows(1);
    reportSheet.autoResizeColumns(1, 4);
    
    ui.alert('Formüller bulundu', `${formulasList.length} formül bulundu.\nDetaylar "${reportName}" sayfasında.`, ui.ButtonSet.OK);
    
    console.log('Formulas found:', formulasList.length);
    return { success: true, count: formulasList.length, formulas: formulasList };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

// ========================================
// 📊 PERFORMANCE MONITORING
// ========================================

/**
 * 📊 Performance Test - Тест производительности
 * Измеряет время выполнения операций
 */
function performanceTest(parameters) {
  console.log('Function started: performanceTest', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    
    const results = {
      operations: []
    };
    
    // Тест 1: Чтение данных
    const startRead = new Date();
    const data = sheet.getDataRange().getValues();
    const endRead = new Date();
    const readTime = endRead - startRead;
    results.operations.push({
      name: 'Чтение данных',
      time: readTime,
      rows: data.length,
      columns: data[0] ? data[0].length : 0
    });
    
    // Тест 2: Поиск колонок
    const startSearch = new Date();
    const headers = data[0];
    for (let i = 0; i < 10; i++) {
      findColumnIndex(headers, 'Company name');
    }
    const endSearch = new Date();
    const searchTime = endSearch - startSearch;
    results.operations.push({
      name: 'Поиск колонок (10 итераций)',
      time: searchTime
    });
    
    // Формирование отчета
    let report = `=== PERFORMANS TESTİ ===\n\n`;
    results.operations.forEach(op => {
      report += `${op.name}:\n`;
      report += `  Süre: ${op.time} ms\n`;
      if (op.rows) {
        report += `  Satır: ${op.rows}\n`;
        report += `  Kolon: ${op.columns}\n`;
      }
      report += '\n';
    });
    
    const totalTime = results.operations.reduce((sum, op) => sum + op.time, 0);
    report += `Toplam süre: ${totalTime} ms\n`;
    
    console.log('Performance test complete:', results);
    ui.alert('Performans Testi', report, ui.ButtonSet.OK);
    
    return results;
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

// ========================================
// 🛠️ DEVELOPMENT HELPERS
// ========================================

/**
 * 🛠️ Clear Test Data - Очистка тестовых данных
 * Удаляет тестовые данные с листа
 */
function clearTestData(parameters) {
  console.log('Function started: clearTestData', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    
    const confirm = ui.alert(
      'Veri Temizleme',
      'Bu sayfadaki tüm verileri (başlıklar hariç) temizlemek istediğinizden emin misiniz?',
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      ui.alert('İptal edildi', 'Temizleme iptal edildi.', ui.ButtonSet.OK);
      return { success: false, cancelled: true };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
      ui.alert('Tamamlandı', 'Veriler temizlendi.', ui.ButtonSet.OK);
      console.log('Test data cleared');
      return { success: true, deletedRows: lastRow - 1 };
    } else {
      ui.alert('Bilgi', 'Temizlenecek veri yok.', ui.ButtonSet.OK);
      return { success: true, deletedRows: 0 };
    }
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🛠️ Export Sheet Structure - Экспорт структуры листа
 * Экспортирует структуру листа в JSON
 */
function exportSheetStructure(parameters) {
  console.log('Function started: exportSheetStructure', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    
    const structure = {
      name: sheet.getName(),
      headers: [],
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn(),
      frozenRows: sheet.getFrozenRows(),
      frozenColumns: sheet.getFrozenColumns()
    };
    
    if (structure.lastColumn > 0) {
      const headers = sheet.getRange(1, 1, 1, structure.lastColumn).getValues()[0];
      structure.headers = headers.map((h, index) => ({
        index: index + 1,
        name: h || '',
        a1: sheet.getRange(1, index + 1).getA1Notation()
      }));
    }
    
    const json = JSON.stringify(structure, null, 2);
    
    // Создание листа с JSON
    const ss = sheet.getParent();
    const reportName = '🧪 Структура - ' + sheet.getName();
    let reportSheet = ss.getSheetByName(reportName);
    if (!reportSheet) {
      reportSheet = ss.insertSheet(reportName);
    }
    reportSheet.clear();
    
    reportSheet.getRange(1, 1).setValue(json);
    reportSheet.getRange(1, 1).setFontFamily('Courier New');
    
    ui.alert('Dışa aktarma tamamlandı', `Yapı "${reportName}" sayfasına aktarıldı.`, ui.ButtonSet.OK);
    
    console.log('Sheet structure exported:', structure);
    return structure;
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

// ========================================
// 📋 MENU CREATION
// ========================================

/**
 * Creates Developer menu for all sheets
 */
function createDeveloperMenu() {
  console.log('Creating developer menu');
  
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Create Developer menu
    const menu = ui.createMenu('🧪 Developer');
    
    // 🧪 Testing
    const testingSubmenu = ui.createMenu('🧪 Test')
      .addItem('⚡ Hızlı Sistem Kontrolü', 'quickSystemCheck')
      .addItem('✅ Veri Doğrulama Kontrolü', 'testDataValidation')
      .addItem('📋 Kolon Yapısı Kontrolü', 'testColumnStructure')
      .addSeparator()
      .addItem('📊 Performans Testi', 'performanceTest');
    menu.addSubMenu(testingSubmenu);
    
    // 🔍 Debugging
    const debuggingSubmenu = ui.createMenu('🔍 Hata Ayıklama')
      .addItem('📄 Sayfa Bilgisi', 'debugSheetInfo')
      .addItem('📊 Aralık Bilgisi', 'debugSelectedRange')
      .addItem('🔢 Sayfadaki Formüller', 'debugFormulas');
    menu.addSubMenu(debuggingSubmenu);
    
    // 🛠️ Development Helpers
    const helpersSubmenu = ui.createMenu('🛠️ Araçlar')
      .addItem('🗑️ Test Verilerini Temizle', 'clearTestData')
      .addItem('📤 Sayfa Yapısını Dışa Aktar', 'exportSheetStructure');
    menu.addSubMenu(helpersSubmenu);
    
    // Add menu to UI
    menu.addToUi();
    
    console.log('Developer menu created');
    
  } catch (error) {
    console.error('Failed to create developer menu:', error);
  }
}

/**
 * Auto-create menu on spreadsheet open
 */
function onOpen() {
  createDeveloperMenu();
}

console.log('Developer Agent готов к работе!');

