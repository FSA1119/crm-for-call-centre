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
    // Primary Status Colors - Görseldeki Renkler
    'Randevu Alındı': 'rgb(232, 245, 232)',      // #E8F5E8 - Light Green
    'İleri Tarih Randevu': 'rgb(245, 245, 245)', // #F5F5F5 - Light Gray
    'Randevu Teyitlendi': 'rgb(232, 245, 232)',  // #E8F5E8 - Light Green
    'Randevu Ertelendi': 'rgb(255, 248, 225)',   // #FFF8E1 - Light Yellow (Açık Sarı)
    'Randevu İptal oldu': 'rgb(255, 235, 238)',  // #FFEBEE - Light Red (Açık Kırmızı)
    
    // Opportunity Colors - Görseldeki Renkler
    'Fırsat İletildi': 'rgb(255, 235, 238)',     // #FFEBEE - Light Red
    'Bilgi Verildi': 'rgb(243, 229, 245)',       // #F3E5F5 - Light Purple
    'Yeniden Aranacak': 'rgb(227, 242, 253)',    // #E3F2FD - Light Blue
    
    // Negative Status Colors - Görseldeki Renkler
    'İlgilenmiyor': 'rgb(255, 248, 225)',        // #FFF8E1 - Light Yellow
    'Ulaşılamadı': 'rgb(255, 235, 238)',         // #FFEBEE - Light Red (Yeniden arama için farklı)
    
    // Meeting Colors
    'Toplantı Tamamlandı': 'rgb(200, 230, 201)'  // Light Green
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
  if (!parameters || typeof parameters !== 'object') {
    console.error('Invalid parameters object');
    return false;
  }
  return true;
}

/**
 * 📝 Activity Logging - Audit Trail System
 * @param {string} action - Action performed
 * @param {Object} data - Additional data
 */
function logActivity(action, data = {}) {
  const timestamp = new Date().toISOString();
  console.log('Manager Activity Log:', { timestamp, action, data });
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
      console.error('Invalid parameters for color application');
      return;
    }
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
    range.setBackground(color);
  } catch (error) {
    console.error('Color application failed:', error);
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
      console.error('Invalid sheet for header styling');
      return;
    }
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    const headerColor = CRM_CONFIG.SHEET_HEADER_COLORS[sheetType] || 'rgb(227, 242, 253)';
    headerRange.setBackground(headerColor);
    headerRange.setFontColor('white');
    headerRange.setFontWeight('bold');
  } catch (error) {
    console.error('Header styling failed:', error);
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
  try {
    if (!sheet || !sheetName || !startRow || !rowCount) {
      console.error('Invalid parameters for color coding');
      return;
    }
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let statusColumnIndex = -1;
    switch (sheetName) {
      case 'Randevular':
        statusColumnIndex = headers.indexOf('Randevu durumu');
        break;
      case 'Fırsatlar':
        statusColumnIndex = headers.indexOf('Fırsat Durumu');
        if (statusColumnIndex === -1) {
          statusColumnIndex = headers.indexOf('Aktivite'); // Fallback for Fırsatlar
        }
        break;
      case 'Toplantılar':
        statusColumnIndex = headers.indexOf('Toplantı durumu');
        break;
      default:
        statusColumnIndex = headers.indexOf('Aktivite');
    }
    if (statusColumnIndex === -1) {
      return;
    }
    for (let i = 0; i < rowCount; i++) {
      const rowNumber = startRow + i;
      const statusCell = sheet.getRange(rowNumber, statusColumnIndex + 1);
      const status = statusCell.getValue();
      console.log(`Manager color coding - Row ${rowNumber}, Status: "${status}", Sheet: ${sheetName}`);
      if (status && status !== '') {
        let color = 'rgb(255, 255, 255)';
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
        } else {
          // Debug: Log unknown status
          console.log('Unknown status in manager:', status);
          console.log('Sheet name:', sheetName);
          console.log('Available colors:', Object.keys(CRM_CONFIG.COLOR_CODES));
        }
        
        applyRowColor(sheet, rowNumber, color);
      }
    }
  } catch (error) {
    console.error('Error applying color coding to manager data:', error);
  }
}

// ========================================
// 🎨 MANAGER MENU SYSTEM - CONTROL CENTER
// ========================================

/**
 * 🎨 Manager Menu Creation - Control Panel
 */
function createManagerMenu() {
  try {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('YÖNETİCİ');
    menu.addItem('Tüm Verileri Senkronize Et', 'collectAllData')
        .addSeparator();
    const submenu = ui.createMenu('Tek Temsilci Senkronize Et');
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      submenu.addItem(`${employeeCode} - ${employeeName}`, `syncSingleEmployee_${employeeCode.replace(/\s+/g, '_')}`);
    }
    menu.addSubMenu(submenu)
        .addSeparator();
    menu.addItem('Senkronizasyon Durumu', 'showSyncStatus')
        .addSeparator()
        .addItem('Verileri Temizle', 'cleanManagerData')
        .addSeparator()
        .addItem('Toplantıya Geç', 'openMeetingDialog')
        .addToUi();
  } catch (error) {
    console.error('Error creating manager menu:', error);
  }
}

/**
 * 📅 Open Meeting Dialog - Opens a dialog for the selected appointment
 */
function openMeetingDialog() {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const range = sheet.getActiveRange();
    
    if (!range || range.getNumRows() !== 1) {
      SpreadsheetApp.getUi().alert('Lütfen bir randevu satırı seçin.');
      return;
    }
    
    const rowIndex = range.getRow();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const rowData = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Randevu bilgilerini hazırla
    const employeeCode = getColumnValue(headers, rowData, 'Temsilci Kodu');
    const companyName = getColumnValue(headers, rowData, 'Company name') || getColumnValue(headers, rowData, 'Company');
    const phone = getColumnValue(headers, rowData, 'Phone');
    const mail = getColumnValue(headers, rowData, 'Mail');
    const address = getColumnValue(headers, rowData, 'Address');
    
    // HTML dialog'u aç
    const htmlTemplate = HtmlService.createTemplateFromFile('managerMeetingDialog');
    htmlTemplate.employeeCode = employeeCode;
    htmlTemplate.companyName = companyName;
    htmlTemplate.phone = phone;
    htmlTemplate.mail = mail;
    htmlTemplate.address = address;
    
    const htmlOutput = htmlTemplate.evaluate()
      .setWidth(500)
      .setHeight(700);
    
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Yönetici Toplantı Ekle');
    
  } catch (error) {
    console.error('❌ Error opening meeting dialog:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Toplantı penceresi açılırken bir hata oluştu: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 🔍 Get column value by header name
 * @param {Array} headers - Column headers
 * @param {Array} rowData - Row data
 * @param {string} headerName - Header name to find
 * @returns {string} - Column value
 */
function getColumnValue(headers, rowData, headerName) {
  try {
    const columnIndex = headers.findIndex(header => header === headerName);
    if (columnIndex !== -1 && rowData[columnIndex]) {
      return rowData[columnIndex].toString();
    }
    return '';
  } catch (error) {
    console.error('❌ Error getting column value:', error);
    return '';
  }
}



/**
 * 💾 Process manager meeting form data
 * @param {Object} formData - Form data from HTML dialog
 */
function processManagerMeetingForm(formData) {
  try {
    console.log('💾 Processing manager meeting form:', formData);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const range = sheet.getActiveRange();
    
    if (!range || range.getNumRows() !== 1) {
      throw new Error('Geçerli bir satır seçilmedi');
    }
    
    const rowIndex = range.getRow();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Toplantı bilgilerini güncelle
    const updates = [
      { header: 'Company name', value: formData.sirketAdi },
      { header: 'Phone', value: formData.telefon },
      { header: 'Mail', value: formData.mail },
      { header: 'Address', value: formData.adres },
      { header: 'Toplantı Tarihi', value: formData.toplamtiTarihi },
      { header: 'Saat', value: formData.toplamtiSaati },
      { header: 'Toplantı formatı', value: formData.toplamtiFormat },
      { header: 'Toplantı Sonucu', value: formData.toplamtiSonucu },
      { header: 'Teklif Detayı', value: formData.teklifDetayi },
      { header: 'Satış Potansiyeli', value: formData.satisPotansiyeli },
      { header: 'Yeni Takip Tarihi', value: formData.yeniTakipTarihi },
      { header: 'Yönetici Not', value: formData.yoneticiNot }
    ];
    
    for (const update of updates) {
      const columnIndex = headers.findIndex(header => header === update.header);
      if (columnIndex !== -1) {
        sheet.getRange(rowIndex, columnIndex + 1).setValue(update.value);
      }
    }
    
    // Renk kodlamasını yenile
    applyColorCodingToManagerData(sheet, sheet.getName(), rowIndex, 1);
    
    console.log('✅ Manager meeting data saved successfully');
    
  } catch (error) {
    console.error('❌ Error processing manager meeting form:', error);
    throw error;
  }
}

/**
 * 🔄 Synchronize a single employee
 * @param {string} employeeCode - Employee code to synchronize
 */
function syncSingleEmployee(employeeCode) {
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    if (!managerFile) {
      throw new Error('Yönetici dosyası bulunamadı');
    }
    const totalStats = { totalRecords: 0, employeeStats: {}, errors: [] };
    const employeeData = collectEmployeeData(managerFile, employeeCode);
    const employeeStats = { employeeCode, totalRecords: 0, sheetStats: {} };
    for (const [sheetName, data] of Object.entries(employeeData)) {
      if (data && data.length > 0) {
        updateManagerSheet(managerFile, sheetName, data, employeeCode);
        employeeStats.sheetStats[sheetName] = data.length;
        employeeStats.totalRecords += data.length;
      }
    }
    totalStats.employeeStats[employeeCode] = employeeStats;
    totalStats.totalRecords += employeeStats.totalRecords;
    showSyncResults(totalStats);
    applyColorCodingToAllManagerSheets();
    return totalStats;
  } catch (error) {
    console.error(`Error synchronizing employee ${employeeCode}:`, error);
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
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, randevuDurumuIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        
        // Add validation for Toplantı Sonucu
        const toplantiSonucuIndex = headers.indexOf('Toplantı Sonucu');
        if (toplantiSonucuIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(CRM_CONFIG.MEETING_RESULT_OPTIONS, true)
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, toplantiSonucuIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        break;
        
      case 'Fırsatlar':
        // Add validation for Fırsat Durumu
        const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
        if (firsatDurumuIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(['Fırsat İletildi', 'Bilgi Verildi', 'Yeniden Aranacak'], true)
            .setAllowInvalid(true)
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
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, toplantiDurumuIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        
        // Add validation for Toplantı formatı
        const toplantiFormatiIndex = headers.indexOf('Toplantı formatı');
        if (toplantiFormatiIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(CRM_CONFIG.MEETING_FORMAT_OPTIONS, true)
            .setAllowInvalid(true)
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
  try {
    const employeeFile = findEmployeeFile(employeeCode);
    if (!employeeFile) {
      return {};
    }
    const employeeData = {};
    const sheets = employeeFile.getSheets();
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      if (sheetName === 'Randevularım' || sheetName === 'Fırsatlarım' || sheetName === 'Toplantılarım') {
        const sheetData = collectSheetData(sheet, employeeCode);
        if (sheetData && sheetData.length > 0) {
          const targetSheetName = sheetName === 'Randevularım' ? 'Randevular' :
                                 sheetName === 'Fırsatlarım' ? 'Fırsatlar' :
                                 sheetName === 'Toplantılarım' ? 'Toplantılar' : sheetName;
          employeeData[targetSheetName] = sheetData;
        }
      }
    }
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
  try {
    if (!sheet) {
      return [];
    }
    const values = sheet.getDataRange().getValues();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (!values || values.length <= 1) {
      return [];
    }
    const data = [];
    const targetColumns = [
      'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
      'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Randevu durumu', 'Randevu Tarihi',
      'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
      'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
      'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
    ];
    const columnIndices = {};
    headers.forEach((header, index) => {
      columnIndices[header] = index;
    });
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row.some(cell => cell !== '' && cell !== null && cell !== undefined && cell !== 'undefined' && cell !== 'null')) {
        const orderedRow = [];
        for (let j = 1; j < targetColumns.length; j++) {
          const columnName = targetColumns[j];
          const columnIndex = columnIndices[columnName];
          if (columnIndex !== undefined) {
            let cellValue = row[columnIndex];
            if (columnName === 'Saat') {
              cellValue = formatTimeValue(cellValue);
            }
            if (columnName && columnName.includes('Tarihi')) {
              cellValue = formatDateValue(cellValue);
            }
            orderedRow.push(cellValue);
          } else {
            orderedRow.push('');
          }
        }
        const rowData = { temsilciKodu: employeeCode, rowIndex: i + 2, data: orderedRow };
        data.push(rowData);
      }
    }
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
  try {
    if (!managerFile || !sheetName || !data || !employeeCode) {
      return;
    }
    let sheet = managerFile.getSheetByName(sheetName);
    if (!sheet) {
      sheet = managerFile.insertSheet(sheetName);
      createManagerSheetHeaders(sheet, sheetName);
    }
    clearEmployeeData(sheet, employeeCode);
    if (data.length > 0) {
      const allData = [];
      for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        const rowDataCopy = [...rowData.data];
        rowDataCopy.unshift(rowData.temsilciKodu);
        allData.push(rowDataCopy);
      }
      const startRow = sheet.getLastRow() + 1;
      if (allData.length > 0 && allData[0].length > 0) {
        const targetRange = sheet.getRange(startRow, 1, allData.length, allData[0].length);
        targetRange.setValues(allData);
      }
      applyColorCodingToManagerData(sheet, sheetName, startRow, allData.length);
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
  try {
    if (!sheet || !sheetName) {
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
        headers = [
          'Temsilci Kodu', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
          'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Durum', 'Tarih',
          'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
          'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
          'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
        ];
    }
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    applyHeaderStyling(sheet, sheetName);
    optimizeColumnWidths(sheet, sheetName);
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
  try {
    if (!sheet || !employeeCode) {
      return;
    }
    const data = sheet.getDataRange().getValues();
    if (!data || data.length <= 1) {
      return;
    }
    const headers = data[0];
    const temsilciKoduIndex = headers.indexOf('Temsilci Kodu');
    if (temsilciKoduIndex === -1) {
      return;
    }
    let deletedRows = 0;
    for (let i = data.length - 1; i > 0; i--) {
      const row = data[i];
      const rowTemsilciKodu = row[temsilciKoduIndex];
      if (rowTemsilciKodu === employeeCode) {
        sheet.deleteRow(i + 1);
        deletedRows++;
      }
    }
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
    
    // Add employee details with sheet breakdown
    resultMessage += '**Temsilci Detayları:**\n';
    for (const [employeeCode, stats] of Object.entries(totalStats.employeeStats)) {
      const employeeName = CRM_CONFIG.EMPLOYEE_CODES[employeeCode] || employeeCode;
      resultMessage += `• ${employeeCode} (${employeeName}): ${stats.totalRecords} kayıt\n`;
      
      // Add sheet breakdown if available
      if (stats.sheetStats && Object.keys(stats.sheetStats).length > 0) {
        for (const [sheetName, recordCount] of Object.entries(stats.sheetStats)) {
          resultMessage += `  - ${sheetName}: ${recordCount} kayıt\n`;
        }
      }
    }
    
    // Add errors if any
    if (totalStats.errors.length > 0) {
      resultMessage += '\n**Hatalar:**\n';
      for (const error of totalStats.errors) {
        resultMessage += `• ${error.employeeCode}: ${error.error}\n`;
      }
    }
    
    // Düzeltme: Ui.alert için doğru imza kullanımı
    const ui = SpreadsheetApp.getUi();
    ui.alert('📊 Senkronizasyon Sonuçları', resultMessage, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('❌ Error showing sync results:', error);
    // Düzeltme: Ui.alert için doğru imza kullanımı
    const ui = SpreadsheetApp.getUi();
    ui.alert('❌ Hata', 'Senkronizasyon sonuçları gösterilirken bir hata oluştu', ui.ButtonSet.OK);
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
    
    // Düzeltme: Ui.alert için doğru imza kullanımı
    const ui = SpreadsheetApp.getUi();
    ui.alert('📊 Senkronizasyon Durumu', statusMessage, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('❌ Error showing sync status:', error);
    // Düzeltme: Ui.alert için doğru imza kullanımı
    const ui = SpreadsheetApp.getUi();
    ui.alert('❌ Hata', 'Senkronizasyon durumu gösterilirken bir hata oluştu', ui.ButtonSet.OK);
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