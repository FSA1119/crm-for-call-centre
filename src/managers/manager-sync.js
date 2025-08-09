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
    const lowerName = String(sheetName || '').toLowerCase();
    if (lowerName.includes('randevu')) {
      statusColumnIndex = headers.indexOf('Randevu durumu');
    } else if (lowerName.includes('fırsat') || lowerName.includes('firsat')) {
      statusColumnIndex = headers.indexOf('Fırsat Durumu');
      if (statusColumnIndex === -1) {
        statusColumnIndex = headers.indexOf('Aktivite'); // Fallback for Fırsatlar
      }
    } else if (lowerName.includes('toplant')) {
      statusColumnIndex = headers.indexOf('Toplantı durumu');
    } else {
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
          console.log('Status column index:', statusColumnIndex);
          console.log('Headers:', headers);
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

    const replaceSubmenu = ui.createMenu('🎯 Odak (Temizle & Yaz)');
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      replaceSubmenu.addItem(`${employeeCode} - ${employeeName}`, `syncSingleEmployee_${employeeCode.replace(/\s+/g, '_')}`);
    }
    menu.addSubMenu(replaceSubmenu)
        .addSeparator();

    const appendSubmenu = ui.createMenu('➕ Sırayla (Üstüne Ekle)');
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      appendSubmenu.addItem(`${employeeCode} - ${employeeName}`, `syncSingleEmployeeAppend_${employeeCode.replace(/\s+/g, '_')}`);
    }
    menu.addSubMenu(appendSubmenu)
        .addSeparator();

    const isolatedSubmenu = ui.createMenu('🗂️ Kişisel Sekmeler (İzole)');
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      isolatedSubmenu.addItem(`${employeeCode} - ${employeeName}`, `syncSingleEmployeeIsolated_${employeeCode.replace(/\s+/g, '_')}`);
    }
    menu.addSubMenu(isolatedSubmenu)
        .addSeparator();

    // Quick action to move selected appointment to meetings
    menu.addItem('📥 Seçili Randevuyu Toplantıya Taşı', 'moveSelectedRandevuToMeeting')
        .addSeparator();

    const reportsGeneral = ui.createMenu('Raporlar (Genel)');
    reportsGeneral.addItem('Günlük', 'generateReportsGeneralDaily')
                  .addItem('Haftalık', 'generateReportsGeneralWeekly')
                  .addItem('Aylık', 'generateReportsGeneralMonthly');
    menu.addSubMenu(reportsGeneral);

    const reportsPerEmployee = ui.createMenu('Raporlar (Seçili Temsilci)');
    reportsPerEmployee.addItem('Günlük', 'generateReportsForEmployeeDailyPrompt')
                      .addItem('Haftalık', 'generateReportsForEmployeeWeeklyPrompt')
                      .addItem('Aylık', 'generateReportsForEmployeeMonthlyPrompt');
    menu.addSubMenu(reportsPerEmployee)
        .addSeparator();

    menu.addItem('🎨 Renk Kodlaması Yenile', 'forceRefreshManagerColorCoding')
        .addItem('🎨 Manuel Renk Uygula', 'applyManualManagerColorCoding')
        .addItem('🔄 Dropdown Yenile', 'applyDataValidationToAllManagerSheets')
        .addSeparator();
    menu.addItem('Senkronizasyon Durumu', 'showSyncStatus')
        .addSeparator()
        .addItem('Verileri Temizle', 'cleanManagerData')
        .addSeparator()
        .addItem('Toplantıya Geç (Eski Pencere)', 'openMeetingDialog')
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
function syncSingleEmployee(employeeCode, options) {
  try {
    const mode = options && options.mode ? options.mode : 'replace'; // replace | append
    console.log(`🔄 syncSingleEmployee started for ${employeeCode} with mode=${mode}`);

    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    if (!managerFile) {
      throw new Error('Yönetici dosyası bulunamadı');
    }

    // Focus mode: clear entire manager sheets to show only this employee's data
    if (mode === 'replace') {
      clearAllDataExceptHeadersForFocus(managerFile);
    }

    const totalStats = { totalRecords: 0, employeeStats: {}, errors: [] };
    const employeeData = collectEmployeeData(managerFile, employeeCode);
    const employeeStats = { employeeCode, totalRecords: 0, sheetStats: {} };
    for (const [sheetName, data] of Object.entries(employeeData)) {
      if (data && data.length > 0) {
        updateManagerSheet(managerFile, sheetName, data, employeeCode, mode);
        employeeStats.sheetStats[sheetName] = data.length;
        employeeStats.totalRecords += data.length;
      }
    }
    totalStats.employeeStats[employeeCode] = employeeStats;
    totalStats.totalRecords += employeeStats.totalRecords;
    showSyncResults(totalStats);
    applyColorCodingToAllManagerSheets();
    applyDataValidationToAllManagerSheets();
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
function syncSingleEmployee_LG_001() { console.log('🔄 Starting sync for single employee: LG 001'); syncSingleEmployee('LG 001', { mode: 'replace' }); }

/**
 * NT 002 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_NT_002() { console.log('🔄 Starting sync for single employee: NT 002'); syncSingleEmployee('NT 002', { mode: 'replace' }); }

/**
 * KO 003 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_KO_003() { console.log('🔄 Starting sync for single employee: KO 003'); syncSingleEmployee('KO 003', { mode: 'replace' }); }

/**
 * SB 004 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_SB_004() { console.log('🔄 Starting sync for single employee: SB 004'); syncSingleEmployee('SB 004', { mode: 'replace' }); }

/**
 * KM 005 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_KM_005() { console.log('🔄 Starting sync for single employee: KM 005'); syncSingleEmployee('KM 005', { mode: 'replace' }); }

/**
 * CA 006 için senkronizasyon fonksiyonu
 */
function syncSingleEmployee_CA_006() { console.log('🔄 Starting sync for single employee: CA 006'); syncSingleEmployee('CA 006', { mode: 'replace' }); }

// Append-mode wrappers
function syncSingleEmployeeAppend_LG_001() { console.log('🔄 Starting APPEND sync: LG 001'); syncSingleEmployee('LG 001', { mode: 'append' }); }
function syncSingleEmployeeAppend_NT_002() { console.log('🔄 Starting APPEND sync: NT 002'); syncSingleEmployee('NT 002', { mode: 'append' }); }
function syncSingleEmployeeAppend_KO_003() { console.log('🔄 Starting APPEND sync: KO 003'); syncSingleEmployee('KO 003', { mode: 'append' }); }
function syncSingleEmployeeAppend_SB_004() { console.log('🔄 Starting APPEND sync: SB 004'); syncSingleEmployee('SB 004', { mode: 'append' }); }
function syncSingleEmployeeAppend_KM_005() { console.log('🔄 Starting APPEND sync: KM 005'); syncSingleEmployee('KM 005', { mode: 'append' }); }
function syncSingleEmployeeAppend_CA_006() { console.log('🔄 Starting APPEND sync: CA 006'); syncSingleEmployee('CA 006', { mode: 'append' }); }

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
        // Add validation for Aktivite
        const aktiviteIndex = headers.indexOf('Aktivite');
        if (aktiviteIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(CRM_CONFIG.ACTIVITY_OPTIONS, true)
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, aktiviteIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        
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
        // Add validation for Aktivite
        const firsatAktiviteIndex = headers.indexOf('Aktivite');
        if (firsatAktiviteIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(CRM_CONFIG.ACTIVITY_OPTIONS, true)
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, firsatAktiviteIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        
        // Add validation for Fırsat Durumu
        const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
        if (firsatDurumuIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(['Fırsat İletildi', 'Bilgi Verildi', 'Yeniden Aranacak'], true)
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, firsatDurumuIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        
        // Add validation for Fırsat Tarihi
        const firsatTarihiIndex = headers.indexOf('Fırsat Tarihi');
        if (firsatTarihiIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireDate()
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, firsatTarihiIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }
        
        // Add validation for Toplantı formatı
        const firsatToplantiFormatIndex = headers.indexOf('Toplantı formatı');
        if (firsatToplantiFormatIndex !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(CRM_CONFIG.MEETING_FORMAT_OPTIONS, true)
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, firsatToplantiFormatIndex + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
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
    SpreadsheetApp.getUi().alert('✅ Tamamlandı', 'Tüm sayfalar için renk kodlaması yenilendi', SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('❌ Error refreshing manager colors:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Renk kodlaması yenilenirken bir hata oluştu', SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 🎨 Manual Color Coding for Manager - Force Apply Colors
 */
function applyManualManagerColorCoding() {
  console.log('🎨 Applying manual color coding to manager');
  
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    
    console.log('Current sheet:', sheetName);
    
    if (sheetName === 'Randevular') {
      console.log('Applying color coding to Randevular');
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const randevuDurumuIndex = headers.indexOf('Randevu durumu');
      
      if (randevuDurumuIndex !== -1) {
        for (let i = 1; i < data.length; i++) {
          const status = data[i][randevuDurumuIndex];
          if (status && status !== '') {
            console.log(`Row ${i + 1}: ${status}`);
            applyColorCodingToManagerData(sheet, sheetName, i + 1, 1);
          }
        }
        SpreadsheetApp.getUi().alert('✅ Tamamlandı', 'Randevular renk kodlaması uygulandı', SpreadsheetApp.getUi().ButtonSet.OK);
      } else {
        SpreadsheetApp.getUi().alert('❌ Hata', 'Randevu durumu sütunu bulunamadı', SpreadsheetApp.getUi().ButtonSet.OK);
      }
    } else if (sheetName === 'Fırsatlar') {
      console.log('Applying color coding to Fırsatlar');
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
      
      if (firsatDurumuIndex !== -1) {
        for (let i = 1; i < data.length; i++) {
          const status = data[i][firsatDurumuIndex];
          if (status && status !== '') {
            console.log(`Row ${i + 1}: ${status}`);
            applyColorCodingToManagerData(sheet, sheetName, i + 1, 1);
          }
        }
        SpreadsheetApp.getUi().alert('✅ Tamamlandı', 'Fırsatlar renk kodlaması uygulandı', SpreadsheetApp.getUi().ButtonSet.OK);
      } else {
        SpreadsheetApp.getUi().alert('❌ Hata', 'Fırsat Durumu sütunu bulunamadı', SpreadsheetApp.getUi().ButtonSet.OK);
      }
    } else {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Bu fonksiyon sadece Randevular veya Fırsatlar sayfalarında çalışır', SpreadsheetApp.getUi().ButtonSet.OK);
    }
    
  } catch (error) {
    console.error('Error applying manual manager color coding:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Renk kodlaması uygulanırken hata: ' + error.message);
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
    
    SpreadsheetApp.getUi().alert('🧹 Tamamlandı', `${cleanedCount} sayfa temizlendi. Başlıklar korundu.`, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('❌ Error cleaning manager data:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Veriler temizlenirken bir hata oluştu', SpreadsheetApp.getUi().ButtonSet.OK);
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
    SpreadsheetApp.getUi().alert('🧪 Test Sonuçları', resultMessage, SpreadsheetApp.getUi().ButtonSet.OK);
    
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
            // full sync always replace
            updateManagerSheet(managerFile, sheetName, data, employeeCode, 'replace');
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
    
    // Auto-apply colors and validations after sync
    try {
      applyColorCodingToAllManagerSheets();
      applyDataValidationToAllManagerSheets();
    } catch (postSyncError) {
      console.error('Post-sync styling/validation error:', postSyncError);
    }
    
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
      const lower = String(sheetName || '').toLowerCase();
      let targetSheetName = '';
      if (lower.includes('randevu')) targetSheetName = 'Randevular';
      else if (lower.includes('fırsat') || lower.includes('firsat')) targetSheetName = 'Fırsatlar';
      else if (lower.includes('toplant')) targetSheetName = 'Toplantılar';
      else continue;

      const sheetData = collectSheetData(sheet, employeeCode);
      if (sheetData && sheetData.length > 0) {
        employeeData[targetSheetName] = sheetData;
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

    // Determine target columns based on source sheet name (tolerant)
    const sourceName = sheet.getName();
    const sourceLower = String(sourceName || '').toLowerCase();
    let targetColumns = [];
    if (sourceLower.includes('randevu')) {
      targetColumns = [
        'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
        'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Randevu durumu', 'Randevu Tarihi',
        'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
        'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
        'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
      ];
    } else if (sourceLower.includes('fırsat') || sourceLower.includes('firsat')) {
      // Meeting-only columns removed for opportunities target
      targetColumns = [
        'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
        'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Fırsat Durumu', 'Fırsat Tarihi',
        'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
        'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
        'Rating count', 'Review', 'Maplink'
      ];
    } else if (sourceLower.includes('toplant')) {
      targetColumns = [
        'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
        'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Toplantı durumu', 'Toplantı Tarihi',
        'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
        'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
        'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
      ];
    } else {
      // Fallback (keep previous default)
      targetColumns = [
        'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
        'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Randevu durumu', 'Randevu Tarihi',
        'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
        'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
        'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
      ];
    }

    const columnIndices = {};
    headers.forEach((header, index) => {
      columnIndices[header] = index;
    });

    function normalizeOpportunityStatus(value) {
      const v = String(value || '').toLowerCase();
      if (!v) return '';
      if (v.indexOf('ilet') !== -1) return 'Fırsat İletildi';
      if (v.indexOf('bilgi') !== -1) return 'Bilgi Verildi';
      if (v.indexOf('yeniden') !== -1 || v.indexOf('ara') !== -1) return 'Yeniden Aranacak';
      return '';
    }

    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row.some(cell => cell !== '' && cell !== null && cell !== undefined && cell !== 'undefined' && cell !== 'null')) {
        const orderedRow = [];
        // Start from index 1 to skip 'Kod' (employee code is added later)
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
            if (columnName === 'Fırsat Durumu') {
              cellValue = normalizeOpportunityStatus(cellValue);
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
function updateManagerSheet(managerFile, sheetName, data, employeeCode, mode) {
  try {
    if (!managerFile || !sheetName || !data || !employeeCode) {
      return;
    }
    const effectiveMode = mode || 'replace';

    // In append mode, use aggregate sheets with 'T ' prefix (e.g., T Randevular)
    const targetSheetName = effectiveMode === 'append' ? `T ${sheetName}` : sheetName;
    const baseTypeForHeaders = sheetName; // Randevular | Fırsatlar | Toplantılar

    let sheet = managerFile.getSheetByName(targetSheetName);
    if (!sheet) {
      sheet = managerFile.insertSheet(targetSheetName);
      // Create headers according to base sheet type (not the prefixed name)
      createManagerSheetHeaders(sheet, baseTypeForHeaders);
    }

    // Replace mode: clear previous rows of this employee (within the target sheet)
    if (effectiveMode !== 'append') {
      clearEmployeeData(sheet, employeeCode);
    }

    if (data.length > 0) {
      const allData = [];
      for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        const rowDataCopy = [...rowData.data];
        rowDataCopy.unshift(rowData.temsilciKodu);
        allData.push(rowDataCopy);
      }

      // Upsert logic
      let rowsToAppend = [];
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const existing = sheet.getLastRow() > 1
        ? sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getValues()
        : [];

      function findIdx(names) {
        for (let i = 0; i < headers.length; i++) {
          const h = String(headers[i] || '').trim().toLowerCase();
          for (const name of names) {
            if (h === String(name).trim().toLowerCase()) return i;
          }
        }
        return -1;
      }

      const idxCode = findIdx(['Temsilci Kodu', 'Kod']);
      const idxCompany = findIdx(['Company name', 'Company']);
      const idxStatus = findIdx(['Fırsat Durumu', 'Randevu durumu', 'Toplantı durumu', 'Durum']);
      const idxDate = findIdx(['Fırsat Tarihi', 'Randevu Tarihi', 'Toplantı Tarihi', 'Tarih']);

      function canonicalCode(value) {
        return String(value || '').trim();
      }
      function canonicalCompany(value) {
        return String(value || '').replace(/\s+/g, ' ').trim();
      }
      function canonicalStatus(value) {
        const v = String(value || '').toLowerCase();
        if (v.includes('ilet')) return 'Fırsat İletildi';
        if (v.includes('bilgi')) return 'Bilgi Verildi';
        if (v.includes('yeniden') || v.includes('ara')) return 'Yeniden Aranacak';
        return String(value || '').trim();
      }
      function canonicalDate(value) {
        return formatDateValue(value);
      }

      function upsertKey(row) {
        const parts = [];
        parts.push(canonicalCode(idxCode >= 0 ? row[idxCode] : ''));
        parts.push(canonicalCompany(idxCompany >= 0 ? row[idxCompany] : ''));
        parts.push(canonicalStatus(idxStatus >= 0 ? row[idxStatus] : ''));
        parts.push(canonicalDate(idxDate >= 0 ? row[idxDate] : ''));
        return parts.join('||');
      }

      // Build existing key -> rowIndex map
      const keyToRowIndex = new Map();
      for (let i = 0; i < existing.length; i++) {
        keyToRowIndex.set(upsertKey(existing[i]), i + 2); // 2-based
      }

      // Track updates to apply
      const updates = []; // {rowIndex, values}

      for (const r of allData) {
        const key = upsertKey(r);
        if (keyToRowIndex.has(key)) {
          // Compare and update if any difference
          const rowIndex = keyToRowIndex.get(key);
          const current = sheet.getRange(rowIndex, 1, 1, headers.length).getValues()[0];
          const changed = current.some((v, idx) => String(v) !== String(r[idx]));
          if (changed) {
            updates.push({ rowIndex, values: r });
          }
        } else {
          rowsToAppend.push(r);
        }
      }

      // Apply updates
      for (const u of updates) {
        sheet.getRange(u.rowIndex, 1, 1, headers.length).setValues([u.values]);
        applyColorCodingToManagerData(sheet, sheet.getName(), u.rowIndex, 1);
      }

      // Apply appends
      if (rowsToAppend.length > 0 && rowsToAppend[0].length > 0) {
        const startRow = sheet.getLastRow() + 1;
        const targetRange = sheet.getRange(startRow, 1, rowsToAppend.length, rowsToAppend[0].length);
        targetRange.setValues(rowsToAppend);
        // For color coding, pass the actual sheet name; detection is tolerant
        applyColorCodingToManagerData(sheet, sheet.getName(), startRow, rowsToAppend.length);
        optimizeColumnWidths(sheet, baseTypeForHeaders);
      }
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
          'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
          'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Fırsat Durumu', 'Fırsat Tarihi',
          'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
          'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
          'Rating count', 'Review', 'Maplink'
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
    // Support both 'Temsilci Kodu' and 'Kod' as first identifier column
    let temsilciKoduIndex = headers.indexOf('Temsilci Kodu');
    if (temsilciKoduIndex === -1) {
      temsilciKoduIndex = headers.indexOf('Kod');
    }
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

    // Helper format/parse for dd.MM.yyyy
    function formatDdMmYyyy(dateObj) {
      try {
        if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';
        const d = String(dateObj.getDate()).padStart(2, '0');
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const y = dateObj.getFullYear();
        return `${d}.${m}.${y}`;
      } catch (err) {
        return '';
      }
    }
    function parseDdMmYyyy(value) {
      try {
        if (!value) return null;
        if (value instanceof Date && !isNaN(value.getTime())) return value;
        const str = String(value).trim();
        // Accept dd.MM.yyyy or valid Date string
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(str)) {
          const [dd, mm, yyyy] = str.split('.')
            .map(part => parseInt(part, 10));
          const d = new Date(yyyy, mm - 1, dd);
          return isNaN(d.getTime()) ? null : d;
        }
        const d = new Date(str);
        return isNaN(d.getTime()) ? null : d;
      } catch (err) {
        return null;
      }
    }

    // Build base message
    let resultMessage = '📊 **SENKRONİZASYON SONUÇLARI**\n\n';
    resultMessage += `📈 **Toplam Kayıt**: ${totalStats.totalRecords} kayıt\n`;
    resultMessage += `👥 **İşlenen Temsilci**: ${Object.keys(totalStats.employeeStats).length}\n`;
    resultMessage += `❌ **Hata Sayısı**: ${totalStats.errors.length}\n\n`;

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Add employee details with sheet breakdown and date ranges
    resultMessage += '**Temsilci Detayları:**\n';
    for (const [employeeCode, stats] of Object.entries(totalStats.employeeStats)) {
      const employeeName = CRM_CONFIG.EMPLOYEE_CODES[employeeCode] || employeeCode;

      // Compute overall min/max across sheets for this employee
      let overallMin = null;
      let overallMax = null;

      // Compose per-sheet breakdown lines with date ranges
      const breakdownLines = [];
      if (stats.sheetStats && Object.keys(stats.sheetStats).length > 0) {
        for (const [sheetName, recordCount] of Object.entries(stats.sheetStats)) {
          let minDate = null;
          let maxDate = null;
          try {
            const sheet = ss.getSheetByName(sheetName);
            if (sheet && sheet.getLastRow() > 1) {
              const lastCol = sheet.getLastColumn();
              const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

              // Employee code column can be 'Temsilci Kodu' or 'Kod'
              let codeIdx = headers.indexOf('Temsilci Kodu');
              if (codeIdx === -1) codeIdx = headers.indexOf('Kod');

              // Date column per sheet
              let dateHeader = '';
              if (sheetName === 'Randevular') dateHeader = 'Randevu Tarihi';
              else if (sheetName === 'Fırsatlar') dateHeader = 'Fırsat Tarihi';
              else if (sheetName === 'Toplantılar') dateHeader = 'Toplantı Tarihi';
              else dateHeader = 'Tarih';
              const dateIdx = headers.indexOf(dateHeader);

              if (codeIdx !== -1 && dateIdx !== -1) {
                const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues();
                for (let i = 0; i < values.length; i++) {
                  const row = values[i];
                  if (String(row[codeIdx]) !== String(employeeCode)) continue;
                  const parsed = parseDdMmYyyy(row[dateIdx]);
                  if (!parsed) continue;
                  if (!minDate || parsed < minDate) minDate = parsed;
                  if (!maxDate || parsed > maxDate) maxDate = parsed;
                }
              }
            }
          } catch (innerErr) {
            console.log('⚠️ Date range computation error:', { employeeCode, sheetName, error: innerErr && innerErr.message });
          }

          // Update overall range
          if (minDate && (!overallMin || minDate < overallMin)) overallMin = minDate;
          if (maxDate && (!overallMax || maxDate > overallMax)) overallMax = maxDate;

          if (minDate && maxDate) {
            breakdownLines.push(`  - ${sheetName}: ${recordCount} kayıt (Tarih: ${formatDdMmYyyy(minDate)} – ${formatDdMmYyyy(maxDate)})`);
          } else {
            breakdownLines.push(`  - ${sheetName}: ${recordCount} kayıt`);
          }
        }
      }

      // Employee header line with overall range if available
      if (overallMin && overallMax) {
        resultMessage += `• ${employeeCode} (${employeeName}): ${stats.totalRecords} kayıt — Tarih: ${formatDdMmYyyy(overallMin)} – ${formatDdMmYyyy(overallMax)}\n`;
      } else {
        resultMessage += `• ${employeeCode} (${employeeName}): ${stats.totalRecords} kayıt\n`;
      }
      // Append per-sheet lines
      for (const line of breakdownLines) {
        resultMessage += `${line}\n`;
      }
    }

    // Add errors if any
    if (totalStats.errors.length > 0) {
      resultMessage += '\n**Hatalar:**\n';
      for (const error of totalStats.errors) {
        resultMessage += `• ${error.employeeCode}: ${error.error}\n`;
      }
    }

    // Ui.alert with correct signature
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
  'KM 005': '15mwfzEBth_qIDEA8WofxOR5T3P8s-rMcMaLheBoV9uI',
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

function promptEmployeeCodeForReports() {
  console.log('Function started:', {});
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt('Rapor – Temsilci Kodu', 'Örn: SB 004 (tam yazım)', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() !== ui.Button.OK) {
      return '';
    }
    const code = (response.getResponseText() || '').trim();
    if (!CRM_CONFIG.EMPLOYEE_CODES[code]) {
      ui.alert('Hata', 'Geçersiz temsilci kodu. Örn: SB 004', ui.ButtonSet.OK);
      return '';
    }
    console.log('Processing complete:', { code });
    return code;
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// Safe wrappers – call generators if present; otherwise show info
function generateReportsGeneralDaily() {
  console.log('Function started:', { scope: 'all', period: 'daily' });
  try {
    if (typeof generateDailyReportManager === 'function') {
      return generateDailyReportManager({ scope: 'all' });
    }
    SpreadsheetApp.getUi().alert('Bilgi', 'Günlük (Genel) rapor jeneratörü sonraki sürümde. Veriler indirildikten sonra bu menüden çalışacaktır.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function generateReportsGeneralWeekly() {
  console.log('Function started:', { scope: 'all', period: 'weekly' });
  try {
    if (typeof generateWeeklyReportManager === 'function') {
      return generateWeeklyReportManager({ scope: 'all' });
    }
    SpreadsheetApp.getUi().alert('Bilgi', 'Haftalık (Genel) rapor jeneratörü sonraki sürümde. Veriler indirildikten sonra bu menüden çalışacaktır.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function generateReportsGeneralMonthly() {
  console.log('Function started:', { scope: 'all', period: 'monthly' });
  try {
    if (typeof generateMonthlyReportManager === 'function') {
      return generateMonthlyReportManager({ scope: 'all' });
    }
    SpreadsheetApp.getUi().alert('Bilgi', 'Aylık (Genel) rapor jeneratörü sonraki sürümde.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function generateReportsForEmployeeDailyPrompt() {
  console.log('Function started:', { scope: 'employee', period: 'daily' });
  try {
    const code = promptEmployeeCodeForReports();
    if (!code) return;
    if (typeof generateDailyReportManager === 'function') {
      return generateDailyReportManager({ scope: 'employee', employeeCode: code });
    }
    SpreadsheetApp.getUi().alert('Bilgi', `Günlük rapor ( ${code} ) jeneratörü sonraki sürümde.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function generateReportsForEmployeeWeeklyPrompt() {
  console.log('Function started:', { scope: 'employee', period: 'weekly' });
  try {
    const code = promptEmployeeCodeForReports();
    if (!code) return;
    if (typeof generateWeeklyReportManager === 'function') {
      return generateWeeklyReportManager({ scope: 'employee', employeeCode: code });
    }
    SpreadsheetApp.getUi().alert('Bilgi', `Haftalık rapor ( ${code} ) jeneratörü sonraki sürümde.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function generateReportsForEmployeeMonthlyPrompt() {
  console.log('Function started:', { scope: 'employee', period: 'monthly' });
  try {
    const code = promptEmployeeCodeForReports();
    if (!code) return;
    if (typeof generateMonthlyReportManager === 'function') {
      return generateMonthlyReportManager({ scope: 'employee', employeeCode: code });
    }
    SpreadsheetApp.getUi().alert('Bilgi', `Aylık rapor ( ${code} ) jeneratörü sonraki sürümde.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function inferBaseTypeFromIsolatedName(name) {
  console.log('Function started:', { name });
  try {
    const lower = String(name || '').toLowerCase();
    if (lower.includes('randevular')) return 'Randevular';
    if (lower.includes('fırsatlar') || lower.includes('firsatlar')) return 'Fırsatlar';
    if (lower.includes('toplantılar') || lower.includes('toplantilar')) return 'Toplantılar';
    return '';
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function createHeadersForIsolatedSheet(sheet, baseType) {
  console.log('Function started:', { sheetName: sheet && sheet.getName ? sheet.getName() : null, baseType });
  try {
    if (!baseType) return;
    // Reuse existing header creator by passing the base type
    createManagerSheetHeaders(sheet, baseType);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function updateManagerSheetIsolated(managerFile, baseSheetName, data, employeeCode) {
  console.log('Function started:', { employeeCode, baseSheetName, rows: data ? data.length : 0 });
  try {
    const isolatedName = `${employeeCode} – ${baseSheetName}`; // e.g., "SB 004 – Fırsatlar"
    let sheet = managerFile.getSheetByName(isolatedName) || managerFile.getSheetByName(`${employeeCode} - ${baseSheetName}`) || managerFile.getSheetByName(`${employeeCode} – ${baseSheetName}`);
    if (!sheet) {
      sheet = managerFile.insertSheet(`${employeeCode} - ${baseSheetName}`);
      createHeadersForIsolatedSheet(sheet, baseSheetName);
    }
 
    const lastColT = sheet.getLastColumn();
    const headersT = sheet.getRange(1, 1, 1, lastColT).getValues()[0];
 
    function idxT(name) { return headersT.indexOf(name); }
    const iCode = idxT('Temsilci Kodu') !== -1 ? idxT('Temsilci Kodu') : idxT('Kod');
    const iComp = idxT('Company name');
    const iDate = baseSheetName === 'Randevular' ? idxT('Randevu Tarihi')
                  : baseSheetName === 'Fırsatlar' ? idxT('Fırsat Tarihi')
                  : idxT('Toplantı Tarihi');
    const iStatus = baseSheetName === 'Randevular' ? idxT('Randevu durumu')
                    : baseSheetName === 'Fırsatlar' ? idxT('Fırsat Durumu')
                    : idxT('Toplantı durumu');
 
    // Canonicalizers to avoid duplicate keys due to format differences
    function canonStr(v) { return String(v == null ? '' : v).trim(); }
    function canonDate(v) { return formatDateValue(v); }
    function canonStatus(v) {
      if (baseSheetName !== 'Fırsatlar') return canonStr(v);
      const s = String(v || '').toLowerCase();
      if (s.indexOf('ilet') !== -1) return 'Fırsat İletildi';
      if (s.indexOf('bilgi') !== -1) return 'Bilgi Verildi';
      if (s.indexOf('yeniden') !== -1 || s.indexOf('ara') !== -1) return 'Yeniden Aranacak';
      return canonStr(v);
    }
 
    // Build existing index map (key -> rowIndex)
    const existingRowsCount = sheet.getLastRow() > 1 ? sheet.getLastRow() - 1 : 0;
    const existingValues = existingRowsCount > 0 ? sheet.getRange(2, 1, existingRowsCount, lastColT).getValues() : [];
    function rowKeyFromArray(arr) {
      const parts = [
        iCode >= 0 ? canonStr(arr[iCode]) : '',
        iComp >= 0 ? canonStr(arr[iComp]) : '',
        iDate >= 0 ? canonDate(arr[iDate]) : '',
        iStatus >= 0 ? canonStatus(arr[iStatus]) : ''
      ];
      return parts.join('||');
    }
    const keyToRowIndex = new Map();
    for (let r = 0; r < existingValues.length; r++) {
      keyToRowIndex.set(rowKeyFromArray(existingValues[r]), r + 2); // 2-based with header
    }
 
    let sameCount = 0, updateCount = 0, newCount = 0;
    const rowsToAppend = [];
    const updates = []; // {rowIndex, values}
 
    // Prepare each incoming row against existing
    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      const rowCopy = [...rowData.data];
      rowCopy.unshift(rowData.temsilciKodu); // first column code
 
      // Ensure target row length equals header length
      while (rowCopy.length < headersT.length) rowCopy.push('');
      if (rowCopy.length > headersT.length) rowCopy.length = headersT.length;
 
      const key = rowKeyFromArray(rowCopy);
      if (keyToRowIndex.has(key)) {
        const targetRow = keyToRowIndex.get(key);
        const current = sheet.getRange(targetRow, 1, 1, lastColT).getValues()[0];
        const changed = current.some((v, idx) => String(v) !== String(rowCopy[idx]));
        if (changed) {
          updates.push({ rowIndex: targetRow, values: rowCopy });
          updateCount++;
        } else {
          sameCount++;
        }
      } else {
        rowsToAppend.push(rowCopy);
        newCount++;
      }
    }
 
    // Apply updates
    for (const u of updates) {
      sheet.getRange(u.rowIndex, 1, 1, lastColT).setValues([u.values]);
      applyColorCodingToManagerData(sheet, baseSheetName, u.rowIndex, 1);
    }
 
    // Apply appends
    if (rowsToAppend.length > 0) {
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rowsToAppend.length, lastColT).setValues(rowsToAppend);
      applyColorCodingToManagerData(sheet, baseSheetName, startRow, rowsToAppend.length);
    }
 
    optimizeColumnWidths(sheet, baseSheetName);
    applyManagerSheetDataValidation(sheet, baseSheetName);
 
    SpreadsheetApp.getUi().alert(
      '✅ Tamamlandı',
      `${employeeCode} – ${baseSheetName}\nAynı (değişmedi): ${sameCount}\nGüncellendi: ${updateCount}\nYeni eklendi: ${newCount}`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
 
    console.log('Processing complete:', { isolatedName: sheet.getName(), sameCount, updateCount, newCount });
    return { success: true, sheet: sheet.getName(), sameCount, updateCount, newCount };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function syncSingleEmployeeIsolated(employeeCode) {
  console.log('Function started:', { employeeCode });
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    if (!managerFile) throw new Error('Yönetici dosyası bulunamadı');

    const employeeData = collectEmployeeData(managerFile, employeeCode);
    for (const [sheetName, data] of Object.entries(employeeData)) {
      // sheetName is target base: Randevular | Fırsatlar | Toplantılar
      updateManagerSheetIsolated(managerFile, sheetName, data, employeeCode);
    }

    SpreadsheetApp.getUi().alert('✅ Tamamlandı', `${employeeCode} için ayrı sekmeler güncellendi`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// Isolated wrappers per employee
function syncSingleEmployeeIsolated_LG_001() { syncSingleEmployeeIsolated('LG 001'); }
function syncSingleEmployeeIsolated_NT_002() { syncSingleEmployeeIsolated('NT 002'); }
function syncSingleEmployeeIsolated_KO_003() { syncSingleEmployeeIsolated('KO 003'); }
function syncSingleEmployeeIsolated_SB_004() { syncSingleEmployeeIsolated('SB 004'); }
function syncSingleEmployeeIsolated_KM_005() { syncSingleEmployeeIsolated('KM 005'); }
function syncSingleEmployeeIsolated_CA_006() { syncSingleEmployeeIsolated('CA 006'); }

function moveSelectedRandevuToMeeting() {
  console.log('Function started:', {});
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    if (!sheet || sheet.getName() !== 'Randevular') {
      SpreadsheetApp.getUi().alert('Bilgi', 'Lütfen Randevular sayfasında bir satır seçin.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const range = sheet.getActiveRange();
    if (!range || range.getNumRows() !== 1) {
      SpreadsheetApp.getUi().alert('Bilgi', 'Lütfen tek bir satır seçin.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const rowIndex = range.getRow();
    copyRandevuRowToToplantilar(sheet, rowIndex);
    console.log('Processing complete:', { rowIndex });
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function copyRandevuRowToToplantilar(randevularSheet, rowIndex) {
  console.log('Function started:', { rowIndex });
  try {
    const ss = randevularSheet.getParent();
    let toplantilarSheet = ss.getSheetByName('Toplantılar');
    if (!toplantilarSheet) {
      toplantilarSheet = ss.insertSheet('Toplantılar');
      createManagerSheetHeaders(toplantilarSheet, 'Toplantılar');
    }

    const lastColR = randevularSheet.getLastColumn();
    const headersR = randevularSheet.getRange(1, 1, 1, lastColR).getValues()[0];
    const rowR = randevularSheet.getRange(rowIndex, 1, 1, lastColR).getValues()[0];

    const lastColT = toplantilarSheet.getLastColumn();
    const headersT = toplantilarSheet.getRange(1, 1, 1, lastColT).getValues()[0];

    function idxR(name) { return headersR.indexOf(name); }
    function idxT(name) { return headersT.indexOf(name); }

    const output = new Array(headersT.length).fill('');

    // Map common fields by exact header if exists
    headersT.forEach((h, i) => {
      const srcIdx = headersR.indexOf(h);
      if (srcIdx !== -1) output[i] = rowR[srcIdx];
    });

    // Explicit mappings
    const mapPairs = [
      ['Toplantı durumu', 'Toplantı durumu'],
      ['Toplantı Tarihi', 'Toplantı Tarihi'],
      ['Saat', 'Saat'],
      ['Toplantı Sonucu', 'Toplantı Sonucu'],
      ['Toplantı formatı', 'Toplantı formatı'],
    ];
    mapPairs.forEach(([dst, src]) => {
      const si = idxR(src);
      const di = idxT(dst);
      if (si !== -1 && di !== -1) output[di] = rowR[si];
    });

    // Set required defaults
    const dDurum = idxT('Toplantı durumu');
    if (dDurum !== -1) output[dDurum] = 'Toplantı Tamamlandı';

    // Upsert: avoid duplicates (by Kod + Company name + Toplantı Tarihi)
    const iKod = idxT('Temsilci Kodu') !== -1 ? idxT('Temsilci Kodu') : idxT('Kod');
    const iComp = idxT('Company name');
    const iDate = idxT('Toplantı Tarihi');

    const key = [output[iKod] || rowR[idxR('Temsilci Kodu')] || rowR[idxR('Kod')], output[iComp], output[iDate]].join('||');

    let existingRow = -1;
    const existing = toplantilarSheet.getLastRow() > 1 ? toplantilarSheet.getRange(2, 1, toplantilarSheet.getLastRow() - 1, lastColT).getValues() : [];
    for (let i = 0; i < existing.length; i++) {
      const r = existing[i];
      const k = [r[iKod], r[iComp], r[iDate]].join('||');
      if (k === key) { existingRow = i + 2; break; }
    }

    if (existingRow === -1) {
      const startRow = toplantilarSheet.getLastRow() + 1;
      toplantilarSheet.getRange(startRow, 1, 1, output.length).setValues([output]);
      applyColorCodingToManagerData(toplantilarSheet, 'Toplantılar', startRow, 1);
    } else {
      toplantilarSheet.getRange(existingRow, 1, 1, output.length).setValues([output]);
      applyColorCodingToManagerData(toplantilarSheet, 'Toplantılar', existingRow, 1);
    }

    optimizeColumnWidths(toplantilarSheet, 'Toplantılar');
    applyManagerSheetDataValidation(toplantilarSheet, 'Toplantılar');

  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function onEdit(e) {
  console.log('Function started:', { range: e && e.range ? e.range.getA1Notation() : null });
  try {
    if (!e || !e.range) return;
    const sheet = e.range.getSheet();
    if (!sheet || sheet.getName() !== 'Randevular') return;

    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const editedCol = e.range.getColumn();
    const header = headers[editedCol - 1];

    // Trigger when Toplantı Sonucu or Toplantı Tarihi edited
    if (header !== 'Toplantı Sonucu' && header !== 'Toplantı Tarihi') return;

    const rowIndex = e.range.getRow();
    if (rowIndex <= 1) return;

    const idxSonuc = headers.indexOf('Toplantı Sonucu');
    const idxTarih = headers.indexOf('Toplantı Tarihi');
    const valSonuc = idxSonuc !== -1 ? sheet.getRange(rowIndex, idxSonuc + 1).getValue() : '';
    const valTarih = idxTarih !== -1 ? sheet.getRange(rowIndex, idxTarih + 1).getValue() : '';

    // Require at least meeting date or result to create meeting
    if (!valSonuc && !valTarih) return;

    copyRandevuRowToToplantilar(sheet, rowIndex);
  } catch (error) {
    console.error('Function failed:', error);
    // Non-blocking onEdit
  }
}

function clearAllDataExceptHeadersForFocus(managerFile) {
  console.log('Function started:', { scope: 'focus-clear' });
  try {
    if (!managerFile) {
      console.error('❌ Invalid managerFile for focus clear');
      return;
    }
    const targetSheets = ['Randevular', 'Fırsatlar', 'Toplantılar'];
    for (const name of targetSheets) {
      const sheet = managerFile.getSheetByName(name);
      if (!sheet) continue;
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow > 1 && lastCol > 0) {
        const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
        dataRange.clearContent();
        // Reset backgrounds so previous color coding does not linger
        dataRange.setBackground('white');
        console.log(`🧹 Focus mode: cleared data and backgrounds in ${name}`);
      }
    }
    console.log('Processing complete:', { cleared: true });
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}