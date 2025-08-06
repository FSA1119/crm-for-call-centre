// ========================================
// YÖNETİCİ DOSYASI - SİNKRONİZASYON SİSTEMİ
// ========================================

// ========================================
// 🏗️ MANAGER CONFIGURATION - CENTRALIZED CONTROL
// ========================================

const CRM_CONFIG = {
  // 👥 Employee Management - Team Structure
  EMPLOYEE_CODES: {
    'LG 001': 'Lale Gül',
    'NT 002': 'Neslihan Türk', 
    'KO 003': 'Kadir Öztürk',
    'SB 004': 'Sinem Bakalcı',
    'KM 005': 'Kübra Murat',
    'CA 006': 'Canan Arslan'
  },
  
  // 📁 File Management - Data Sources
  MANAGER_FILE: 'FSA_019 - Yonetici Takip Dosyasi',
  
  // 🎨 Centralized Color System - Visual Harmony (SYNCED WITH TEMSILCI)
  COLOR_CODES: {
    // Primary Status Colors
    'Randevu Alındı': 'rgb(25, 172, 240)',      // Professional Blue
    'İleri Tarih Randevu': 'rgb(135, 206, 250)', // Light Blue
    'Randevu Teyitlendi': 'rgb(67, 206, 67)',    // Success Green
    'Randevu Ertelendi': 'rgb(195, 169, 128)',   // Warning Orange
    'Randevu İptal oldu': 'rgb(218, 92, 111)',   // Error Red
    
    // Opportunity Colors
    'Fırsat İletildi': 'rgb(199, 171, 235)',     // Purple
    'Bilgi Verildi': 'rgb(199, 171, 235)',       // Purple (same as Fırsat İletildi)
    'Yeniden Aranacak': 'rgb(228, 145, 226)',    // Pink
    
    // Negative Status Colors
    'İlgilenmiyor': 'rgb(138, 118, 89)',         // Brown
    'Ulaşılamadı': 'rgb(255, 205, 210)',         // Light Red
    
    // Meeting Colors
    'Toplantı Tamamlandı': 'rgb(72, 224, 77)'    // Success Green
  },
  
  // 🎨 Manager Sheet Header Colors - Visual Hierarchy
  SHEET_HEADER_COLORS: {
    'Randevular': 'rgb(102, 227, 135)',      // Green
    'Fırsatlar': 'rgb(243, 151, 12)',        // Orange
    'Toplantılar': 'rgb(156, 39, 176)',      // Purple
    'Format Tablo': 'rgb(173, 216, 230)'     // Light Blue
  },
  
  // 📊 Meeting Result Options - Randevularım Dropdown
  MEETING_RESULT_OPTIONS: [
    'Satış Yapıldı',
    'Teklif İletildi',
    'Beklemede',
    'Satış İptal'
  ],
  
  // 🤝 Meeting Format Options - For Validation
  MEETING_FORMAT_OPTIONS: [
    'Yüz Yüze',
    'Online', 
    'Telefon'
  ],
  
  // 📋 Activity Options - For Validation
  ACTIVITY_OPTIONS: [
    'Randevu Alındı',
    'İleri Tarih Randevu', 
    'Yeniden Aranacak',
    'Bilgi Verildi',
    'Fırsat İletildi',
    'İlgilenmiyor',
    'Ulaşılamadı'
  ],
  
  // ⚡ Performance Configuration
  BATCH_SIZE: 50,
  TIMEOUT_SECONDS: 5
};

// ========================================
// 🔧 UTILITY FUNCTIONS - FOUNDATION LAYER
// ========================================

/**
 * 🛡️ Input Validation - Data Integrity Guardian
 * @param {Object} parameters - Input parameters to validate
 * @returns {boolean} - Validation result
 */
function validateInput(parameters) {
  console.log('🔍 Validating input:', parameters);
  
  try {
    if (!parameters || typeof parameters !== 'object') {
      console.error('❌ Invalid parameters object');
      return false;
    }
    
    console.log('✅ Input validation passed');
    return true;
    
  } catch (error) {
    console.error('❌ Input validation failed:', error);
    return false;
  }
}

/**
 * 📝 Activity Logging - Audit Trail System
 * @param {string} action - Action performed
 * @param {Object} data - Additional data
 */
function logActivity(action, data = {}) {
  const timestamp = new Date().toISOString();
  
  console.log('📝 Manager Activity Log:', {
    timestamp,
    action,
    data
  });
}

// ========================================
// 🎨 STYLING SYSTEM - VISUAL EXCELLENCE
// ========================================

/**
 * 🎨 Universal Color Application - Visual Consistency
 * @param {Sheet} sheet - Target sheet
 * @param {number} rowNumber - Row to color
 * @param {string} color - RGB color code
 */
function applyRowColor(sheet, rowNumber, color) {
  try {
    if (!sheet || !rowNumber || !color) {
      console.error('❌ Invalid parameters for color application');
      return;
    }
    
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
    range.setBackground(color);
    console.log(`🎨 Applied color ${color} to row ${rowNumber}`);
    
  } catch (error) {
    console.error('❌ Color application failed:', error);
  }
}

/**
 * 🎨 Header Styling - Professional Appearance
 * @param {Sheet} sheet - Target sheet
 * @param {string} sheetType - Type of sheet for color selection
 */
function applyHeaderStyling(sheet, sheetType) {
  try {
    if (!sheet) {
      console.error('❌ Invalid sheet for header styling');
      return;
    }
    
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const headerColor = CRM_CONFIG.SHEET_HEADER_COLORS[sheetType] || 'rgb(227, 242, 253)';
    
    headerRange.setBackground(headerColor);
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
    
    console.log(`🎨 Applied header styling for ${sheetType}`);
    
  } catch (error) {
    console.error('❌ Header styling failed:', error);
  }
}

// ========================================
// 📅 DATE UTILITIES - TEMPORAL INTELLIGENCE
// ========================================

/**
 * 📅 Date Validation - Temporal Integrity
 * @param {*} date - Date to validate
 * @returns {boolean} - Validation result
 */
function isValidDate(date) {
  if (!date || date === '' || date === null || date === undefined || date === '30.12.1899') return false;
  
  if (date === 'Invalid Date' || date === 'NaN') return false;
  
  try {
    // Handle Date objects directly
    if (date instanceof Date) {
      if (isNaN(date.getTime())) return false;
      const year = date.getFullYear();
      if (year < 1900 || year > 2100) return false;
      return true;
    }
    
    const testDate = new Date(date);
    
    if (isNaN(testDate.getTime())) return false;
    
    const year = testDate.getFullYear();
    if (year < 1900 || year > 2100) return false;
    
    return true;
  } catch (error) {
    console.log('📅 Date validation error:', error, 'for date:', date);
    return false;
  }
}

/**
 * 🕐 Time Value Formatting - Temporal Display
 * @param {*} value - Time value to format
 * @returns {string} - Formatted time
 */
function formatTimeValue(value) {
  try {
    if (!value || value === '' || value === null || value === undefined) return '';
    
    // Handle Date objects
    if (value instanceof Date) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // Handle string dates (like "30.12.1899")
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime()) && date.getFullYear() !== 1899) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
    }
    
    // Handle invalid dates
    if (value === '30.12.1899' || value === 'Invalid Date') {
      return '';
    }
    
    return value.toString();
    
  } catch (error) {
    console.log('🕐 Time formatting error:', error, 'for value:', value);
    return '';
  }
}

/**
 * 📅 Date Value Formatting - Temporal Display
 * @param {*} value - Date value to format
 * @returns {string} - Formatted date
 */
function formatDateValue(value) {
  try {
    if (!value || value === '' || value === null || value === undefined) return '';
    
    // Handle Date objects
    if (value instanceof Date) {
      const day = value.getDate().toString().padStart(2, '0');
      const month = (value.getMonth() + 1).toString().padStart(2, '0');
      const year = value.getFullYear();
      return `${day}.${month}.${year}`;
    }
    
    // Handle string dates
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime()) && date.getFullYear() !== 1899) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
      }
    }
    
    // Handle invalid dates
    if (value === '30.12.1899' || value === 'Invalid Date') {
      return '';
    }
    
    return value.toString();
    
  } catch (error) {
    console.log('📅 Date formatting error:', error, 'for value:', value);
    return '';
  }
}

// ========================================
// 📏 COLUMN WIDTH SYSTEM - OPTIMAL LAYOUT
// ========================================

/**
 * 📏 Universal Column Width Optimizer - Professional Layout
 * @param {Sheet} sheet - Target sheet
 * @param {string} sheetType - Type of sheet for specific optimizations
 */
function optimizeColumnWidths(sheet, sheetType = 'default') {
  console.log(`📏 Optimizing column widths for ${sheetType} sheet`);
  
  try {
    if (!sheet) {
      console.error('❌ Invalid sheet for column width optimization');
      return;
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    headers.forEach((header, index) => {
      const columnIndex = index + 1;
      const optimalWidth = getOptimalColumnWidth(header, sheetType);
      sheet.setColumnWidth(columnIndex, optimalWidth);
    });
    
    console.log(`✅ Column widths optimized for ${sheetType} sheet`);
    
  } catch (error) {
    console.error(`❌ Error optimizing column widths for ${sheetType}:`, error);
  }
}

/**
 * 📏 Get Optimal Column Width - Smart Sizing
 * @param {string} header - Column header
 * @param {string} sheetType - Sheet type
 * @returns {number} - Optimal width in pixels
 */
function getOptimalColumnWidth(header, sheetType) {
  // Base widths for different column types
  const widthMap = {
    // Employee/Manager Codes
    'Kod': 120,
    'Temsilci Kodu': 120,
    
    // Company Information
    'Company name': 200,
    'Kaynak': 100,
    'Keyword': 150,
    'Location': 120,
    'Category': 120,
    'Website': 200,
    
    // Contact Information
    'Phone': 130,
    'Yetkili Tel': 130,
    'Mail': 180,
    'İsim Soyisim': 150,
    
    // Status and Activity
    'Aktivite': 140,
    'Randevu durumu': 140,
    'Fırsat Durumu': 140,
    'Toplantı durumu': 140,
    'Durum': 140,
    
    // Dates and Times
    'Tarih': 100,
    'Randevu Tarihi': 120,
    'Fırsat Tarihi': 120,
    'Toplantı Tarihi': 120,
    'Aktivite Tarihi': 120,
    'Saat': 80,
    
    // Notes and Comments
    'Yorum': 250,
    'Yönetici Not': 200,
    
    // Technical Information
    'CMS Adı': 120,
    'CMS Grubu': 120,
    'E-Ticaret İzi': 120,
    'Site Hızı': 100,
    'Site Trafiği': 120,
    'Log': 100,
    'Toplantı formatı': 120,
    
    // Address Information
    'Address': 300,
    'City': 100,
    
    // Analytics
    'Rating count': 100,
    'Review': 100,
    'Toplantı Sonucu': 150,
    
    // Links
    'Maplink': 200
  };
  
  // Return optimal width or default
  return widthMap[header] || 100;
}

// ========================================
// 🎨 COLOR CODING SYSTEM - VISUAL INTELLIGENCE
// ========================================

/**
 * 🎨 Manager Data Color Coding - Visual Status
 * @param {Sheet} sheet - Target sheet
 * @param {string} sheetName - Sheet name
 * @param {number} startRow - Starting row
 * @param {number} rowCount - Number of rows
 */
function applyColorCodingToManagerData(sheet, sheetName, startRow, rowCount) {
  console.log(`🎨 Applying color coding to manager data: ${sheetName}, rows ${startRow}-${startRow + rowCount - 1}`);
  
  try {
    if (!sheet || !sheetName || !startRow || !rowCount) {
      console.error('❌ Invalid parameters for color coding');
      return;
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let statusColumnIndex = -1;
    
    // Find status column based on sheet type
    switch (sheetName) {
      case 'Randevular':
        statusColumnIndex = headers.indexOf('Randevu durumu');
        break;
      case 'Fırsatlar':
        statusColumnIndex = headers.indexOf('Fırsat Durumu');
        break;
      case 'Toplantılar':
        statusColumnIndex = headers.indexOf('Toplantı durumu');
        break;
      default:
        statusColumnIndex = headers.indexOf('Aktivite');
    }
    
    if (statusColumnIndex === -1) {
      console.log('⚠️ No status column found for color coding');
      return;
    }
    
    // Apply colors to each row
    for (let i = 0; i < rowCount; i++) {
      const rowNumber = startRow + i;
      const statusCell = sheet.getRange(rowNumber, statusColumnIndex + 1);
      const status = statusCell.getValue();
      
      if (status && status !== '') {
        let color = 'rgb(255, 255, 255)'; // Default white
        
        // Map status to color
        if (status === 'Randevu Alındı') {
          color = CRM_CONFIG.COLOR_CODES['Randevu Alındı'];
        } else if (status === 'İleri Tarih Randevu') {
          color = CRM_CONFIG.COLOR_CODES['İleri Tarih Randevu'];
        } else if (status === 'Randevu Teyitlendi') {
          color = CRM_CONFIG.COLOR_CODES['Randevu Teyitlendi'];
        } else if (status === 'Randevu Ertelendi') {
          color = CRM_CONFIG.COLOR_CODES['Randevu Ertelendi'];
        } else if (status === 'Randevu İptal oldu') {
          color = CRM_CONFIG.COLOR_CODES['Randevu İptal oldu'];
        } else if (status === 'Fırsat İletildi') {
          color = CRM_CONFIG.COLOR_CODES['Fırsat İletildi'];
        } else if (status === 'Bilgi Verildi') {
          color = CRM_CONFIG.COLOR_CODES['Bilgi Verildi'];
        } else if (status === 'Yeniden Aranacak') {
          color = CRM_CONFIG.COLOR_CODES['Yeniden Aranacak'];
        } else if (status === 'İlgilenmiyor') {
          color = CRM_CONFIG.COLOR_CODES['İlgilenmiyor'];
        } else if (status === 'Ulaşılamadı') {
          color = CRM_CONFIG.COLOR_CODES['Ulaşılamadı'];
        } else if (status === 'Toplantı Tamamlandı') {
          color = CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'];
        }
        
        applyRowColor(sheet, rowNumber, color);
      }
    }
    
    console.log(`✅ Color coding applied to ${rowCount} rows in ${sheetName}`);
    
  } catch (error) {
    console.error(`❌ Error applying color coding to manager data:`, error);
  }
}

// ========================================
// 🎨 MANAGER MENU SYSTEM - CONTROL CENTER
// ========================================

/**
 * 🎨 Manager Menu Creation - Control Panel
 */
function createManagerMenu() {
  console.log('🎨 Creating manager menu');
  
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Remove existing manager menu if exists
    try {
      const existingMenus = ui.getMenus();
      const managerMenu = existingMenus.find(menu => menu.getName() === 'YÖNETİCİ');
      if (managerMenu) {
        managerMenu.remove();
      }
    } catch (error) {
      console.log('⚠️ No existing manager menu to remove');
    }
    
    // Create main manager menu
    const menu = ui.createMenu('YÖNETİCİ');
    
    // Add main sync options
    menu.addItem('🔄 Tüm Verileri Senkronize Et', 'collectAllData')
        .addSeparator();
    
    // Add individual employee sync options
    const submenu = ui.createMenu('👤 Tek Temsilci Senkronize Et');
    
    // Add each employee as a menu item
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      submenu.addItem(`${employeeCode} - ${employeeName}`, `syncSingleEmployee_${employeeCode.replace(/\s+/g, '_')}`);
    }
    
    // Add the submenu to the main menu
    menu.addSubMenu(submenu)
        .addSeparator();
    
    // Add other options
    menu.addItem('📊 Senkronizasyon Durumu', 'showSyncStatus')
        .addSeparator()
        .addItem('🧹 Verileri Temizle', 'cleanManagerData')
        .addToUi();
      
    console.log('✅ Manager menu created with individual employee sync options');
    
  } catch (error) {
    console.error('❌ Error creating manager menu:', error);
  }
}

/**
 * 🔄 Synchronize a single employee
 * @param {string} employeeCode - Employee code to synchronize
 */
function syncSingleEmployee(employeeCode) {
  console.log(`🔄 Synchronizing single employee: ${employeeCode}`);
  
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!managerFile) {
      throw new Error('Yönetici dosyası bulunamadı');
    }
    
    const totalStats = {
      totalRecords: 0,
      employeeStats: {},
      errors: []
    };
    
    console.log(`👤 Processing employee: ${employeeCode}`);
    
    const employeeData = collectEmployeeData(managerFile, employeeCode);
    const employeeStats = {
      employeeCode,
      totalRecords: 0,
      sheetStats: {}
    };
    
    // Update manager sheets with employee data
    for (const [sheetName, data] of Object.entries(employeeData)) {
      if (data && data.length > 0) {
        updateManagerSheet(managerFile, sheetName, data, employeeCode);
        employeeStats.sheetStats[sheetName] = data.length;
        employeeStats.totalRecords += data.length;
      }
    }
    
    totalStats.employeeStats[employeeCode] = employeeStats;
    totalStats.totalRecords += employeeStats.totalRecords;
    
    console.log(`✅ Employee ${employeeCode} processed: ${employeeStats.totalRecords} records`);
    
    // Show results
    showSyncResults(totalStats);
    
    // Apply color coding to all sheets
    applyColorCodingToAllManagerSheets();
    
    return totalStats;
    
  } catch (error) {
    console.error(`❌ Error synchronizing employee ${employeeCode}:`, error);
    // Düzeltme: Ui.alert() için doğru imza kullanımı
    const ui = SpreadsheetApp.getUi();
    ui.alert('Hata', `${employeeCode} senkronizasyonu başarısız oldu: ${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * LG 001 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_LG_001() {
  console.log('🔄 Starting sync for single employee: LG 001');
  syncSingleEmployee('LG 001');
}

/**
 * NT 002 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_NT_002() {
  console.log('🔄 Starting sync for single employee: NT 002');
  syncSingleEmployee('NT 002');
}

/**
 * KO 003 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_KO_003() {
  console.log('🔄 Starting sync for single employee: KO 003');
  syncSingleEmployee('KO 003');
}

/**
 * SB 004 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_SB_004() {
  console.log('🔄 Starting sync for single employee: SB 004');
  syncSingleEmployee('SB 004');
}

/**
 * KM 005 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_KM_005() {
  console.log('🔄 Starting sync for single employee: KM 005');
  syncSingleEmployee('KM 005');
}

/**
 * CA 006 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_CA_006() {
  console.log('🔄 Starting sync for single employee: CA 006');
  syncSingleEmployee('CA 006');
}

// ========================================
// 🚀 INITIALIZATION SYSTEM - SYSTEM STARTUP
// ========================================

/**
 * 🚀 Manager System Initialization - Master Control
 */
function onOpen() {
  console.log('🚀 Manager spreadsheet opened - creating menus');
  
  try {
    createManagerMenu();
    
    // Apply color coding to all sheets automatically
    applyColorCodingToAllManagerSheets();
    
    // Apply data validation to all sheets
    applyDataValidationToAllManagerSheets();
    
    console.log('✅ Manager system initialized');
    
  } catch (error) {
    console.error('❌ Error initializing manager system:', error);
  }
}

/**
 * 🎨 Apply Color Coding to All Manager Sheets - Automatic Styling
 */
function applyColorCodingToAllManagerSheets() {
  console.log('🎨 Applying color coding to all manager sheets');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Skip system sheets
      if (sheetName.includes('Günlük Rapor') || 
          sheetName.includes('Haftalık Rapor') || 
          sheetName.includes('Detaylı Rapor')) {
        continue;
      }
      
      try {
        const data = sheet.getDataRange().getValues();
        if (data.length > 1) {
          applyColorCodingToManagerData(sheet, sheetName, 2, data.length - 1);
        }
      } catch (error) {
        console.error(`❌ Error applying color coding to ${sheetName}:`, error);
      }
    }
    
    console.log('✅ Color coding applied to all manager sheets');
    
  } catch (error) {
    console.error('❌ Error applying color coding to manager sheets:', error);
  }
}

/**
 * ✅ Apply Data Validation to All Manager Sheets - Data Integrity
 */
function applyDataValidationToAllManagerSheets() {
  console.log('✅ Applying data validation to all manager sheets');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Skip system sheets
      if (sheetName.includes('Günlük Rapor') || 
          sheetName.includes('Haftalık Rapor') || 
          sheetName.includes('Detaylı Rapor')) {
        continue;
      }
      
      try {
        applyManagerSheetDataValidation(sheet, sheetName);
      } catch (error) {
        console.error(`❌ Error applying data validation to ${sheetName}:`, error);
      }
    }
    
    console.log('✅ Data validation applied to all manager sheets');
    
  } catch (error) {
    console.error('❌ Error applying data validation to manager sheets:', error);
  }
}

/**
 * ✅ Apply Data Validation to Manager Sheet - Data Integrity
 * @param {Sheet} sheet - Target sheet
 * @param {string} sheetName - Sheet name
 */
function applyManagerSheetDataValidation(sheet, sheetName) {
  console.log(`✅ Applying data validation to ${sheetName}`);
  
  try {
    if (!sheet || !sheetName) {
      console.error('❌ Invalid parameters for data validation');
      return;
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Apply validation based on sheet type
    switch (sheetName) {
      case 'Randevular':
        // Add validation for Randevu durumu
        const randevuDurumuIndex = headers.indexOf('Randevu durumu');
        if (randevuDurumuIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(['Randevu Alındı', 'İleri Tarih Randevu', 'Randevu Teyitlendi', 'Randevu Ertelendi', 'Randevu İptal oldu'], true)
            .setAllowInvalid(false)
            .build();
          sheet.getRange(2, randevuDurumuIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        
        // Add validation for Toplantı Sonucu
        const toplantiSonucuIndex = headers.indexOf('Toplantı Sonucu');
        if (toplantiSonucuIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(CRM_CONFIG.MEETING_RESULT_OPTIONS, true)
            .setAllowInvalid(false)
            .build();
          sheet.getRange(2, toplantiSonucuIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        break;
        
      case 'Fırsatlar':
        // Add validation for Fırsat Durumu
        const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
        if (firsatDurumuIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(['Fırsat İletildi', 'Bilgi Verildi', 'Yeniden Aranacak', 'İlgilenmiyor', 'Ulaşılamadı'], true)
            .setAllowInvalid(false)
            .build();
          sheet.getRange(2, firsatDurumuIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        break;
        
      case 'Toplantılar':
        // Add validation for Toplantı durumu
        const toplantiDurumuIndex = headers.indexOf('Toplantı durumu');
        if (toplantiDurumuIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(['Toplantı Tamamlandı'], true)
            .setAllowInvalid(false)
            .build();
          sheet.getRange(2, toplantiDurumuIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        
        // Add validation for Toplantı formatı
        const toplantiFormatiIndex = headers.indexOf('Toplantı formatı');
        if (toplantiFormatiIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(CRM_CONFIG.MEETING_FORMAT_OPTIONS, true)
            .setAllowInvalid(false)
            .build();
          sheet.getRange(2, toplantiFormatiIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        break;
    }
    
    console.log(`✅ Data validation applied to ${sheetName}`);
    
  } catch (error) {
    console.error(`❌ Error applying data validation to ${sheetName}:`, error);
  }
}

// ========================================
// 🎨 LEGACY FUNCTION PLACEHOLDERS - COMPATIBILITY
// ========================================

function forceRefreshManagerColorCoding() { 
  console.log('🎨 Force refreshing manager colors'); 
  
  try {
    applyColorCodingToAllManagerSheets();
    SpreadsheetApp.getUi().alert('✅ Tamamlandı', 'Tüm sayfalar için renk kodlaması yenilendi');
    
  } catch (error) {
    console.error('❌ Error refreshing manager colors:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Renk kodlaması yenilenirken bir hata oluştu');
  }
}

function cleanManagerData() { 
  console.log('🧹 Cleaning manager data'); 
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    let cleanedCount = 0;
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Skip system sheets
      if (sheetName.includes('Günlük Rapor') || 
          sheetName.includes('Haftalık Rapor') || 
          sheetName.includes('Detaylı Rapor')) {
        continue;
      }
      
      try {
        const data = sheet.getDataRange().getValues();
        if (data.length > 1) {
          // Clear all data except headers
          sheet.getRange(2, 1, data.length - 1, data[0].length).clearContent();
          cleanedCount++;
        }
      } catch (error) {
        console.error(`❌ Error cleaning ${sheetName}:`, error);
      }
    }
    
    SpreadsheetApp.getUi().alert('🧹 Tamamlandı', `${cleanedCount} sayfa temizlendi. Başlıklar korundu.`);
    
  } catch (error) {
    console.error('❌ Error cleaning manager data:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Veriler temizlenirken bir hata oluştu');
  }
}

function runAllTests() { 
  console.log('🧪 Running all tests'); 
  
  try {
    const testResults = [];
    
    // Test 1: Check if all sheets exist
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    const sheetNames = sheets.map(sheet => sheet.getName());
    
    const requiredSheets = ['Randevular', 'Fırsatlar', 'Toplantılar'];
    for (const requiredSheet of requiredSheets) {
      if (sheetNames.includes(requiredSheet)) {
        testResults.push(`✅ ${requiredSheet} - mevcut`);
      } else {
        testResults.push(`❌ ${requiredSheet} - bulunamadı`);
      }
    }
    
    // Test 2: Check CRM_CONFIG
    if (CRM_CONFIG && CRM_CONFIG.COLOR_CODES) {
      testResults.push('✅ CRM_CONFIG - doğru yapılandırılmış');
    } else {
      testResults.push('❌ CRM_CONFIG - yapılandırma hatası');
    }
    
    // Test 3: Check employee codes
    if (CRM_CONFIG.EMPLOYEE_CODES && Object.keys(CRM_CONFIG.EMPLOYEE_CODES).length > 0) {
      testResults.push(`✅ Temsilci kodları - ${Object.keys(CRM_CONFIG.EMPLOYEE_CODES).length} temsilci bulundu`);
    } else {
      testResults.push('❌ Temsilci kodları - bulunamadı');
    }
    
    const resultMessage = testResults.join('\n');
    SpreadsheetApp.getUi().alert('🧪 Test Sonuçları', resultMessage);
    
  } catch (error) {
    console.error('❌ Error running tests:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Testler çalıştırılırken bir hata oluştu');
  }
}

// ========================================
// 🔄 SYNCHRONIZATION SYSTEM - DATA CONSOLIDATION
// ========================================

/**
 * 🔄 Complete Data Collection - Master Synchronization
 * @returns {Object} - Complete synchronization results
 */
function collectAllData() {
  console.log('🔄 Starting complete data collection');
  
  try {
    // Get current spreadsheet instead of hardcoded ID
    let managerFile;
    try {
      managerFile = SpreadsheetApp.getActiveSpreadsheet();
      if (!managerFile) {
        throw new Error('Yönetici dosyası bulunamadı');
      }
    } catch (error) {
      throw new Error(`Manager файл недоступен: ${error.message}`);
    }
    
    const totalStats = {
      totalRecords: 0,
      employeeStats: {},
      errors: []
    };
    
    // Process each employee
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      try {
        console.log(`👤 Processing employee: ${employeeCode} - ${employeeName}`);
        
        const employeeData = collectEmployeeData(managerFile, employeeCode);
        const employeeStats = {
          employeeCode,
          totalRecords: 0,
          sheetStats: {}
        };
        
        // Update manager sheets with employee data
        for (const [sheetName, data] of Object.entries(employeeData)) {
          if (data && data.length > 0) {
            updateManagerSheet(managerFile, sheetName, data, employeeCode);
            employeeStats.sheetStats[sheetName] = data.length;
            employeeStats.totalRecords += data.length;
          }
        }
        
        totalStats.employeeStats[employeeCode] = employeeStats;
        totalStats.totalRecords += employeeStats.totalRecords;
        
        console.log(`✅ Employee ${employeeCode} processed: ${employeeStats.totalRecords} records`);
        
      } catch (error) {
        console.error(`❌ Error processing employee ${employeeCode}:`, error);
        totalStats.errors.push({
          employeeCode,
          error: error.message
        });
      }
    }
    
    // Update manager statistics
    updateManagerStatistics(managerFile, totalStats);
    
    // Show results
    showSyncResults(totalStats);
    
    console.log('✅ Complete data collection finished');
    return totalStats;
    
  } catch (error) {
    console.error('❌ Complete data collection failed:', error);
    throw error;
  }
}

/**
 * 🔄 Employee Data Collection - Individual Processing
 * @param {Spreadsheet} managerFile - Manager file
 * @param {string} employeeCode - Employee code
 * @returns {Object} - Employee data by sheet
 */
function collectEmployeeData(managerFile, employeeCode) {
  console.log(`🔄 Collecting data for employee: ${employeeCode}`);
  
  try {
    // Find employee file
    const employeeFile = findEmployeeFile(employeeCode);
    if (!employeeFile) {
      console.log(`⚠️ Employee file not found for: ${employeeCode}`);
      return {};
    }
    
    const employeeData = {};
    
    // Collect data from each relevant sheet
    const sheets = employeeFile.getSheets();
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Sadece önemli sayfaları topla: Randevularım, Fırsatlarım, Toplantılarım
      // Ham veri ve diğer sayfaları atla
      if (sheetName === 'Randevularım' || 
          sheetName === 'Fırsatlarım' || 
          sheetName === 'Toplantılarım') {
        
        try {
          console.log(`📊 Collecting data from important sheet: ${sheetName}`);
          const sheetData = collectSheetData(sheet, employeeCode);
          if (sheetData && sheetData.length > 0) {
            // Önemli sayfaları doğrudan eşleştir
            const targetSheetName = sheetName === 'Randevularım' ? 'Randevular' : 
                                   sheetName === 'Fırsatlarım' ? 'Fırsatlar' : 
                                   sheetName === 'Toplantılarım' ? 'Toplantılar' : sheetName;
            
            employeeData[targetSheetName] = sheetData;
          }
        } catch (error) {
          console.error(`❌ Error collecting data from sheet ${sheetName}:`, error);
        }
      } else if (sheetName.includes('Format Tablo')) {
        // Format Tablo sayfalarını atla
        console.log(`⏭️ Skipping Format Tablo sheet: ${sheetName}`);
      } else if (sheetName.includes('Ham Veri')) {
        // Ham Veri sayfalarını atla
        console.log(`⏭️ Skipping Ham Veri sheet: ${sheetName}`);
      } else if (sheetName.includes('Günlük Rapor') || 
                sheetName.includes('Haftalık Rapor') || 
                sheetName.includes('Detaylı Rapor')) {
        // Rapor sayfalarını atla
        console.log(`⏭️ Skipping Report sheet: ${sheetName}`);
      } else {
        // Diğer sayfaları atla
        console.log(`⏭️ Skipping other sheet: ${sheetName}`);
      }
    }
    
    console.log(`✅ Employee ${employeeCode} data collected from ${Object.keys(employeeData).length} important sheets`);
    return employeeData;
    
  } catch (error) {
    console.error(`❌ Error collecting employee data for ${employeeCode}:`, error);
    return {};
  }
}

/**
 * 🔄 Sheet Data Collection - Raw Data Extraction
 * @param {Sheet} sheet - Source sheet
 * @param {string} employeeCode - Employee code
 * @returns {Array} - Sheet data
 */
function collectSheetData(sheet, employeeCode) {
  console.log(`📄 Collecting data from sheet: ${sheet.getName()}`);
  
  try {
    if (!sheet) {
      console.error('❌ Invalid sheet for data collection');
      return [];
    }
    
    const values = sheet.getDataRange().getValues();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    if (!values || values.length <= 1) {
      console.log(`⚠️ No data found in sheet: ${sheet.getName()}`);
      return [];
    }
    
    const data = [];
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      
      // Skip empty rows with strict validation
      if (row.some(cell => cell !== '' && cell !== null && cell !== undefined && cell !== 'undefined' && cell !== 'null')) {
        // Clean and format row data
        const cleanRow = row.map((cell, index) => {
          const headerName = headers[index];
          
          // Format time values
          if (headerName === 'Saat') {
            return formatTimeValue(cell);
          }
          
          // Format date values
          if (headerName && headerName.includes('Tarihi')) {
            return formatDateValue(cell);
          }
          
          return cell;
        });
        
        // Remove the original 'Kod' column (first element)
        const dataWithoutKod = cleanRow.slice(1);
        
        const rowData = {
          temsilciKodu: employeeCode,
          rowIndex: i + 2,
          data: dataWithoutKod
        };
        
        data.push(rowData);
      }
    }
    
    console.log(`✅ Collected ${data.length} records from sheet: ${sheet.getName()}`);
    return data;
    
  } catch (error) {
    console.error(`❌ Error collecting sheet data from ${sheet.getName()}:`, error);
    return [];
  }
}

/**
 * 🔄 Manager Sheet Update - Data Integration
 * @param {Spreadsheet} managerFile - Manager file
 * @param {string} sheetName - Sheet name
 * @param {Array} data - Data to update
 * @param {string} employeeCode - Employee code
 */
function updateManagerSheet(managerFile, sheetName, data, employeeCode) {
  console.log(`${sheetName} güncelleniyor (${employeeCode}): ${data.length} kayıt`);
  
  try {
    if (!managerFile || !sheetName || !data || !employeeCode) {
      console.error('❌ Invalid parameters for manager sheet update');
      return;
    }
  
    let sheet = managerFile.getSheetByName(sheetName);
  
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = managerFile.insertSheet(sheetName);
      console.log(`${sheetName} sayfası oluşturuldu`);
      
      // Create proper headers based on sheet type
      createManagerSheetHeaders(sheet, sheetName);
    }
    
    // Clear old data for this employee
    clearEmployeeData(sheet, employeeCode);
  
    // Add new data
    if (data.length > 0) {
      console.log(`${sheetName} için ${data.length} kayıt ekleniyor...`);
    
      // Prepare all data in array format
      const allData = [];
      for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        // Replace first element (Kod) with temsilciKodu, keep others as is
        const rowDataCopy = [...rowData.data];
        rowDataCopy.unshift(rowData.temsilciKodu); // Temsilci kodunu ilk sütuna ekle
        allData.push(rowDataCopy);
      }
      
      // Write all data at once
      const startRow = sheet.getLastRow() + 1;
      
      // Check if there's data to write
      if (allData.length > 0 && allData[0].length > 0) {
        const targetRange = sheet.getRange(startRow, 1, allData.length, allData[0].length);
        targetRange.setValues(allData);
      } else {
        console.log('No data to write for', sheetName);
        return;
      }
    
      console.log(`${sheetName} güncellendi: ${data.length} kayıt eklendi (satır ${startRow}-${startRow + data.length - 1})`);
      
      // Apply color coding to new data
      applyColorCodingToManagerData(sheet, sheetName, startRow, allData.length);
      
      // Optimize column widths
      optimizeColumnWidths(sheet, sheetName);
    }
    
  } catch (error) {
    console.error(`❌ Error updating manager sheet ${sheetName}:`, error);
  }
}

/**
 * 🎨 Manager Sheet Headers - Professional Structure
 * @param {Sheet} sheet - Target sheet
 * @param {string} sheetName - Sheet name
 */
function createManagerSheetHeaders(sheet, sheetName) {
  console.log(`Creating headers for ${sheetName}`);
  
  try {
    if (!sheet || !sheetName) {
      console.error('❌ Invalid parameters for header creation');
      return;
    }
    
    let headers = [];
    
    switch (sheetName) {
      case 'Randevular':
        headers = [
          'Temsilci Kodu', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
          'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Randevu durumu', 'Randevu Tarihi',
          'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
          'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
          'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
        ];
        break;
        
      case 'Fırsatlar':
        headers = [
          'Temsilci Kodu', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
          'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Fırsat Durumu', 'Fırsat Tarihi',
          'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
          'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
          'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
        ];
        break;
        
      case 'Toplantılar':
        headers = [
          'Temsilci Kodu', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
          'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Toplantı durumu', 'Toplantı Tarihi',
          'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
          'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
          'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
        ];
        break;
        
      default:
        // For other sheets use basic structure
        headers = [
          'Temsilci Kodu', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
          'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Durum', 'Tarih',
          'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
          'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
          'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
        ];
    }
    
    // Set headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Apply header styling
    applyHeaderStyling(sheet, sheetName);
    
    // Optimize column widths using universal function
    optimizeColumnWidths(sheet, sheetName);
    
    console.log(`✅ Headers created for ${sheetName} with optimized column widths`);
    
  } catch (error) {
    console.error(`❌ Error creating headers for ${sheetName}:`, error);
  }
}

/**
 * 🧹 Employee Data Clearing - Clean Slate
 * @param {Sheet} sheet - Target sheet
 * @param {string} employeeCode - Employee code
 */
function clearEmployeeData(sheet, employeeCode) {
  console.log(`🧹 Clearing data for employee: ${employeeCode}`);
  
  try {
    if (!sheet || !employeeCode) {
      console.error('❌ Invalid parameters for data clearing');
      return;
    }
    
    const data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) {
      console.log('⚠️ No data to clear');
      return;
    }
    
    const headers = data[0];
    const temsilciKoduIndex = headers.indexOf('Temsilci Kodu');
    
    if (temsilciKoduIndex === -1) {
      console.log('⚠️ No Temsilci Kodu column found');
      return;
    }
    
    let deletedRows = 0;
    
    // Delete rows from bottom to top to avoid index issues
    for (let i = data.length - 1; i > 0; i--) {
      const row = data[i];
      const rowTemsilciKodu = row[temsilciKoduIndex];
      
      if (rowTemsilciKodu === employeeCode) {
        sheet.deleteRow(i + 1);
        deletedRows++;
      }
    }
    
    console.log(`✅ Cleared ${deletedRows} rows for employee: ${employeeCode}`);
    
  } catch (error) {
    console.error(`❌ Error clearing data for employee ${employeeCode}:`, error);
  }
}

/**
 * 🔄 Single Employee Data Collection - Focused Harvesting
 * @param {string} employeeCode - Employee code
 * @returns {Object} - Employee statistics
 */
function collectEmployeeDataOnly() {
  console.log('🔄 Starting employee data collection');
  
  try {
    // Get current spreadsheet instead of hardcoded ID
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    
    if (!managerFile) {
      throw new Error('Manager file not found');
    }
    
    const totalStats = {
      totalRecords: 0,
      employeeStats: {},
      errors: []
    };
    
    // Process each employee
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      try {
        console.log(`👤 Processing employee: ${employeeCode} - ${employeeName}`);
        
        const employeeStats = collectSingleEmployeeData(employeeCode);
        totalStats.employeeStats[employeeCode] = employeeStats;
        totalStats.totalRecords += employeeStats.totalRecords;
        
        console.log(`✅ Employee ${employeeCode} processed: ${employeeStats.totalRecords} records`);
        
      } catch (error) {
        console.error(`❌ Error processing employee ${employeeCode}:`, error);
        totalStats.errors.push({
          employeeCode,
          error: error.message
        });
      }
    }
    
    console.log('✅ Employee data collection completed');
    return totalStats;
    
  } catch (error) {
    console.error('❌ Employee data collection failed:', error);
    throw error;
  }
}

/**
 * 🔄 Single Employee Data Collection - Focused Harvesting
 * @param {string} employeeCode - Employee code
 * @returns {Object} - Employee statistics
 */
function collectSingleEmployeeData(employeeCode) {
  console.log(`🔄 Collecting data for employee: ${employeeCode}`);
  
  try {
    const managerFile = SpreadsheetApp.openById('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
    
    if (!managerFile) {
      throw new Error('Manager file not found');
    }
    
    const employeeStats = {
      employeeCode,
      totalRecords: 0,
      sheetStats: {},
      errors: []
    };
    
    // Collect data from employee file
    const employeeData = collectEmployeeData(null, employeeCode, managerFile);
    
    // Update statistics
    for (const [sheetName, data] of Object.entries(employeeData)) {
      if (data && data.length > 0) {
        employeeStats.sheetStats[sheetName] = data.length;
        employeeStats.totalRecords += data.length;
      }
    }
    
    console.log(`✅ Employee ${employeeCode} data collected: ${employeeStats.totalRecords} total records`);
    return employeeStats;
    
  } catch (error) {
    console.error(`❌ Error collecting data for employee ${employeeCode}:`, error);
    throw error;
  }
}

/**
 * 🔍 Find Employee File - File Discovery
 * @param {string} employeeCode - Employee code
 * @returns {Spreadsheet|null} - Employee file or null
 */
function findEmployeeFile(employeeCode) { 
  console.log(`🔍 Finding employee file for ${employeeCode}`); 
  
  try {
    // Check if employee code exists in the EMPLOYEE_FILES mapping
    if (EMPLOYEE_FILES[employeeCode]) {
      const fileId = EMPLOYEE_FILES[employeeCode];
      console.log(`📄 Found employee file ID for ${employeeCode}: ${fileId}`);
      
      try {
        const employeeFile = SpreadsheetApp.openById(fileId);
        console.log(`✅ Successfully opened employee file for ${employeeCode}`);
        return employeeFile;
      } catch (openError) {
        console.error(`❌ Error opening employee file for ${employeeCode}:`, openError);
        return null;
      }
    } else {
      console.log(`⚠️ No file ID found for employee code: ${employeeCode}`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ Error finding employee file for ${employeeCode}:`, error);
    return null;
  }
}

/**
 * 📊 Update Manager Statistics - Data Analytics
 * @param {Spreadsheet} managerFile - Manager file
 * @param {Object} totalStats - Total statistics
 */
function updateManagerStatistics(managerFile, totalStats) { 
  console.log('📊 Updating manager statistics'); 
  
  try {
    if (!managerFile || !totalStats) {
      console.error('❌ Invalid parameters for statistics update');
      return;
    }
    
    // Create or update statistics sheet
    let statsSheet = managerFile.getSheetByName('İstatistikler');
    if (!statsSheet) {
      statsSheet = managerFile.insertSheet('İstatistikler');
    }
    
    // Clear existing data
    statsSheet.clear();
    
    // Create headers
    const headers = ['Metrik', 'Değer', 'Tarih'];
    statsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Add statistics
    const now = new Date();
    const statsData = [
      ['Toplam Kayıt', totalStats.totalRecords, now],
      ['Çalışan Sayısı', Object.keys(totalStats.employeeStats).length, now],
      ['Hata Sayısı', totalStats.errors.length, now]
    ];
    
    if (statsData.length > 0) {
      statsSheet.getRange(2, 1, statsData.length, statsData[0].length).setValues(statsData);
    }
    
    console.log('✅ Manager statistics updated');
    
  } catch (error) {
    console.error('❌ Error updating manager statistics:', error);
  }
}

/**
 * 📊 Show Sync Results - Results Display
 * @param {Object} totalStats - Total statistics
 */
function showSyncResults(totalStats) { 
  console.log('📊 Showing sync results'); 
  
  try {
    if (!totalStats) {
      console.error('❌ No sync results to show');
      return;
    }
    
    let resultMessage = '📊 **SENKRONİZASYON SONUÇLARI**\n\n';
    resultMessage += `📈 **Toplam Kayıt**: ${totalStats.totalRecords} kayıt\n`;
    resultMessage += `👥 **İşlenen Temsilci**: ${Object.keys(totalStats.employeeStats).length}\n`;
    resultMessage += `❌ **Hata Sayısı**: ${totalStats.errors.length}\n\n`;
    
    // Add employee details
    resultMessage += '**Temsilci Detayları:**\n';
    for (const [employeeCode, stats] of Object.entries(totalStats.employeeStats)) {
      const employeeName = CRM_CONFIG.EMPLOYEE_CODES[employeeCode] || employeeCode;
      resultMessage += `• ${employeeCode} (${employeeName}): ${stats.totalRecords} kayıt\n`;
    }
    
    // Add errors if any
    if (totalStats.errors.length > 0) {
      resultMessage += '\n**Hatalar:**\n';
      for (const error of totalStats.errors) {
        resultMessage += `• ${error.employeeCode}: ${error.error}\n`;
      }
    }
    
    SpreadsheetApp.getUi().alert('📊 Senkronizasyon Sonuçları', resultMessage);
    
  } catch (error) {
    console.error('❌ Error showing sync results:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Senkronizasyon sonuçları gösterilirken bir hata oluştu');
  }
}

/**
 * 📊 Show Sync Status - Status Display
 */
function showSyncStatus() { 
  console.log('📊 Showing sync status'); 
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    let statusMessage = '📊 **SENKRONİZASYON DURUMU**\n\n';
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Skip system sheets
      if (sheetName.includes('Günlük Rapor') || 
          sheetName.includes('Haftalık Rapor') || 
          sheetName.includes('Detaylı Rapor')) {
        continue;
      }
      
      const data = sheet.getDataRange().getValues();
      const recordCount = data.length > 1 ? data.length - 1 : 0;
      
      statusMessage += `📄 **${sheetName}**: ${recordCount} kayıt\n`;
    }
    
    SpreadsheetApp.getUi().alert('📊 Senkronizasyon Durumu', statusMessage);
    
  } catch (error) {
    console.error('❌ Error showing sync status:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Senkronizasyon durumu gösterilirken bir hata oluştu');
  }
}

// ========================================
// 🎨 SYSTEM INITIALIZATION - MASTERPIECE COMPLETE
// ========================================

console.log('🎨 Google Sheets CRM Manager - Masterpiece loaded successfully');
console.log('👥 Employee codes:', Object.keys(CRM_CONFIG.EMPLOYEE_CODES));
console.log('🎨 Color codes:', Object.keys(CRM_CONFIG.COLOR_CODES));
console.log('🚀 Manager system ready for production use');

// Конфигурация файлов для синхронизации
const EMPLOYEE_FILES = {
  'LG 001': '1JdU8uIXOcmSQ1c70OOklcR97tqdmDTeCeikpa8DHltE',
  'NT 002': '1Q6IIfbIlTTM8hf1Nv67KLiHGzoAJUBWIhp7rOel9ngQ',
  'KO 003': '1uLufPJqFSfm1WxqSzcvDOKW_hAv8AMhkQwljeiD51mc',
  'SB 004': '17RWqUrQ_m9h0ktJQ_E_55dt-Ao-RA01O6pUFbZ9DxDs',
  'KM 005': '11veeCnPYRPGEWMzZzpLiwUOSNvPhp8n_qHEiDi7lXlw',
  'CA 006': '1XiIyORsVR14hMNu7xJjLs2wHxBYmDskGCzCHGb0IwN8'
};

const MANAGER_FILE_ID = '11IsZpaGgXtgpxrie9F_uVwp6uJPcueGhqB73WhZn60A';

// ========================================
// 🎨 SYSTEM INITIALIZATION - MASTERPIECE COMPLETE
// ========================================

console.log('🎨 Google Sheets CRM Manager - Masterpiece loaded successfully');
console.log('👥 Employee codes:', Object.keys(CRM_CONFIG.EMPLOYEE_CODES));
console.log('🎨 Color codes:', Object.keys(CRM_CONFIG.COLOR_CODES));
console.log('🚀 Manager system ready for production use');