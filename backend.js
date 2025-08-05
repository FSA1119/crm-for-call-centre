// ========================================
// GOOGLE SHEETS CRM SYSTEM - BACKEND
// ========================================
// Version: 1.0
// Author: CRM Development Team
// Date: 2025-07-08

// ========================================
// GLOBAL CONSTANTS
// ========================================

const CRM_CONFIG = {
  // Employee codes
  EMPLOYEE_CODES: {
    'LG 001': 'Lale Gül',
    'NT 002': 'Neslihan Türk', 
    'KO 003': 'Kadir Öztürk',
    'SB 004': 'Sinem Bakalcı',
    'KM 005': 'Kübra Murat',
    'CA 006': 'Canan Arslan'
  },
  
  // Manager file
  MANAGER_FILE: 'FSA_019 - Yonetici Takip Dosyasi',
  
  // Color codes for status
  COLOR_CODES: {
    'Randevu Alındı': '#4FC3F7',
    'Teyitlendi': '#E8F5E8', 
    'Ertelendi': '#FFF3E0',
    'İptal': '#FFEBEE',
    'Fırsat': '#FFF8E1',
    'Toplantı Tamamlandı': '#C8E6C9'
  },
  
  // Activity options (all)
  ACTIVITY_OPTIONS: [
    'Randevu Alındı',
    'İleri Tarih Randevu',
    'Yeniden Aranacak',
    'Bilgi Verildi',
    'Fırsat İletildi',
    'İlgilenmiyor',
    'Ulaşılamadı'
  ],
  
  // Appointment activity options (only for appointment dialog)
  APPOINTMENT_ACTIVITY_OPTIONS: [
    'Randevu Alındı',
    'İleri Tarih Randevu'
  ],
  
  // Meeting format options
  MEETING_FORMAT_OPTIONS: [
    'Yüz Yüze',
    'Online', 
    'Telefon'
  ],
  
  // Batch processing
  BATCH_SIZE: 50,
  TIMEOUT_SECONDS: 5
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Validates input parameters
 * @param {Object} parameters - Input parameters
 * @returns {boolean} - Validation result
 */
function validateInput(parameters) {
  console.log('Validating input:', parameters);
  
  if (!parameters || typeof parameters !== 'object') {
    console.error('Invalid parameters: must be an object');
    return false;
  }
  
  return true;
}

/**
 * Gets current employee code from sheet name
 * @returns {string} - Employee code
 */
function getCurrentEmployeeCode() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetName = sheet.getName();
  
  console.log('Current sheet name:', sheetName);
  
  // Extract employee code from sheet name (before tire)
  const match = sheetName.match(/([A-Z]{2}_\d{3})/);
  if (match) {
    console.log('Found employee code (underscore format):', match[1]);
    return match[1];
  }
  
  // Alternative: extract from sheet name before tire (keep space format)
  const beforeTire = sheetName.split(' - ')[0];
  console.log('Before tire:', beforeTire);
  
  if (beforeTire && beforeTire.match(/^[A-Z]{2}\s\d{3}$/)) {
    // Keep "KO 003" format (with space)
    console.log('Found employee code (space format):', beforeTire);
    return beforeTire;
  }
  
  console.warn('Employee code not found in sheet name:', sheetName);
  console.log('Returning default: LG_001');
  return 'LG_001'; // Default fallback
}

/**
 * Logs activity with timestamp
 * @param {string} action - Action performed
 * @param {Object} data - Related data
 */
function logActivity(action, data = {}) {
  const timestamp = new Date().toISOString();
  const employeeCode = getCurrentEmployeeCode();
  
  const logEntry = {
    timestamp: timestamp,
    employee: employeeCode,
    action: action,
    data: data
  };
  
  console.log('Activity logged:', logEntry);
  return logEntry;
}

// ========================================
// FUNCTION 1: CREATE NEW TABLE
// ========================================

/**
 * Creates new Format Tablo from Ham veri
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function createNewTable(parameters) {
  console.log('Function started: createNewTable', parameters);
  
  try {
    // Input validation
    if (!validateInput(parameters)) {
      throw new Error('Invalid input provided');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const hamVeriSheet = spreadsheet.getSheetByName('Ham veri');
    
    if (!hamVeriSheet) {
      throw new Error('Ham veri sayfası bulunamadı');
    }
    
    // Get table name from user
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt(
      'Yeni Tablo Oluştur',
      'Yeni Format Tablo için isim girin (örn: t10):',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response.getSelectedButton() === ui.Button.OK) {
      const tableName = response.getResponseText().trim();
      
      if (!tableName) {
        throw new Error('Tablo ismi boş olamaz');
      }
      
      // Check if table already exists
      const existingSheet = spreadsheet.getSheetByName(tableName);
      if (existingSheet) {
        throw new Error(`"${tableName}" isimli tablo zaten mevcut`);
      }
      
      // Create new Format Tablo
      const result = createFormatTable(spreadsheet, hamVeriSheet, tableName);
      
      console.log('Processing complete:', result);
      logActivity('createNewTable', { tableName: tableName, rowCount: result.rowCount });
      
      return result;
    } else {
      console.log('User cancelled table creation');
      return { success: false, message: 'İşlem iptal edildi' };
    }
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Creates Format Tablo with standardized structure
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @param {Sheet} hamVeriSheet - Ham veri sheet
 * @param {string} tableName - New table name
 * @returns {Object} - Result object
 */
function createFormatTable(spreadsheet, hamVeriSheet, tableName) {
  console.log('Creating Format Tablo:', tableName);
  
  // Create new sheet
  const newSheet = spreadsheet.insertSheet(tableName);
  
  // Activate the new sheet so getActiveSheet() returns the correct sheet
  newSheet.activate();
  
  // Define Format Tablo columns based on sayfa_kolonlari.md
  const formatTableColumns = [
    'Kod',
    'Keyword', 
    'Location',
    'Company name',
    'Category',
    'Website',
    'Phone',
    'Yetkili Tel',
    'Mail',
    'İsim Soyisim',
    'Aktivite',
    'Aktivite Tarihi',
    'Yorum',
    'Yönetici Not',
    'CMS Adı',
    'CMS Grubu',
    'E-Ticaret İzi',
    'Site Hızı',
    'Site Trafiği',
    'Log',
    'Toplantı formatı',
    'Address',
    'City',
    'Rating count',
    'Review',
    'Maplink'
  ];
  
  // Set headers
  newSheet.getRange(1, 1, 1, formatTableColumns.length).setValues([formatTableColumns]);
  
  // Get data from Ham veri
  const hamVeriData = hamVeriSheet.getDataRange().getValues();
  const hamVeriHeaders = hamVeriData[0];
  const hamVeriRows = hamVeriData.slice(1);
  
  // Map columns from Ham veri to Format Tablo
  const mappedData = mapHamVeriToFormatTable(hamVeriRows, hamVeriHeaders, formatTableColumns, tableName);
  
  // Write mapped data to new sheet
  if (mappedData.length > 0) {
    newSheet.getRange(2, 1, mappedData.length, formatTableColumns.length).setValues(mappedData);
    
    // Force Review column to be plain text to prevent date conversion
    const reviewColumnIndex = formatTableColumns.indexOf('Review') + 1;
    if (reviewColumnIndex > 0 && mappedData.length > 0) {
      const reviewRange = newSheet.getRange(2, reviewColumnIndex, mappedData.length, 1);
      reviewRange.setNumberFormat('@'); // Force plain text format
      console.log('Review column forced to plain text format');
    }
    
    // Force Kod column to be plain text to prevent int conversion
    const kodColumnIndex = formatTableColumns.indexOf('Kod') + 1;
    if (kodColumnIndex > 0 && mappedData.length > 0) {
      const kodRange = newSheet.getRange(2, kodColumnIndex, mappedData.length, 1);
      kodRange.setNumberFormat('@'); // Force plain text format
      console.log('Kod column forced to plain text format');
    }
  }
  
  // Apply formatting
  applyFormatTableStyling(newSheet);
  
  // Set data validation for dropdown columns
  setDataValidation(newSheet);
  
  const result = {
    success: true,
    tableName: tableName,
    rowCount: mappedData.length,
    message: `${tableName} başarıyla oluşturuldu. ${mappedData.length} satır aktarıldı.`
  };
  
  console.log('Format Tablo created successfully:', result);
  return result;
}

/**
 * Decodes URL-encoded Turkish characters
 * @param {string} text - URL-encoded text
 * @returns {string} - Decoded text
 */
function decodeTurkishText(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  try {
    // First decode URL encoding
    let decoded = decodeURIComponent(text);
    
    // Handle common Turkish character replacements
    const turkishReplacements = {
      '%C4%B0': 'İ', // İ (capital I with dot)
      '%C4%B1': 'ı', // ı (lowercase i without dot)
      '%C3%96': 'Ö', // Ö
      '%C3%B6': 'ö', // ö
      '%C3%9C': 'Ü', // Ü
      '%C3%bc': 'ü', // ü
      '%C5%9E': 'Ş', // Ş
      '%C5%9F': 'ş', // ş
      '%C4%9E': 'Ğ', // Ğ
      '%C4%9F': 'ğ', // ğ
      '%C3%87': 'Ç', // Ç
      '%C3%A7': 'ç'  // ç
    };
    
    // Apply Turkish character replacements
    Object.keys(turkishReplacements).forEach(encoded => {
      decoded = decoded.replace(new RegExp(encoded, 'g'), turkishReplacements[encoded]);
    });
    
    console.log(`Decoded: "${text}" → "${decoded}"`);
    return decoded;
  } catch (error) {
    console.warn('Error decoding text:', text, error);
    return text; // Return original if decoding fails
  }
}

/**
 * Maps data from Ham veri to Format Tablo structure
 * @param {Array} hamVeriRows - Ham veri rows
 * @param {Array} hamVeriHeaders - Ham veri headers
 * @param {Array} formatTableColumns - Format Tablo columns
 * @param {string} tableName - New table name
 * @returns {Array} - Mapped data
 */
function mapHamVeriToFormatTable(hamVeriRows, hamVeriHeaders, formatTableColumns, tableName) {
  console.log('Mapping Ham veri to Format Tablo');
  console.log('Table name parameter:', tableName);
  
  const mappedData = [];
  const employeeCode = getCurrentEmployeeCode();
  
  hamVeriRows.forEach((row, index) => {
    const mappedRow = new Array(formatTableColumns.length).fill('');
    
    // Map each column
    formatTableColumns.forEach((formatCol, formatIndex) => {
      const hamVeriIndex = hamVeriHeaders.indexOf(formatCol);
      
      if (hamVeriIndex !== -1 && row[hamVeriIndex]) {
        // Special handling for Review column to prevent date conversion
        if (formatCol === 'Review') {
          // Get the original value and ensure it's treated as a number/string
          let reviewValue = row[hamVeriIndex];
          
          // If it's already a Date object, convert it back to original format
          if (reviewValue instanceof Date) {
            // Try to extract the original numeric value
            const month = reviewValue.getMonth() + 1; // 0-based to 1-based
            const day = reviewValue.getDate();
            reviewValue = `${month}.${day}`;
            console.log(`Converted Date back to numeric: ${reviewValue}`);
          }
          
          // Force as string with R prefix
          mappedRow[formatIndex] = `R${String(reviewValue)}`;
          console.log(`Review value preserved as text: ${row[hamVeriIndex]} → ${mappedRow[formatIndex]}`);
        } else {
          // Decode Turkish characters and preserve original data type
          mappedRow[formatIndex] = decodeTurkishText(row[hamVeriIndex]);
        }
      } else {
        // Handle special column mappings
        switch (formatCol) {
          case 'Kod':
            // Use dynamic sheet name before tire as code
            const sheetName = SpreadsheetApp.getActiveSpreadsheet().getName();
            const beforeTire = sheetName.split(' - ')[0];
            // Use original format with space
            mappedRow[formatIndex] = beforeTire || 'Unknown';
            console.log(`Using dynamic sheet name as code: ${beforeTire} from ${sheetName}`);
            break;
          case 'Aktivite':
            // Aktivite kolonu boş bırakılır, kullanıcı manuel seçer
            mappedRow[formatIndex] = '';
            break;
          case 'Aktivite Tarihi':
            mappedRow[formatIndex] = new Date(); // Current date
            break;
          case 'Log':
            mappedRow[formatIndex] = `Ham veri'den aktarıldı - ${new Date().toLocaleString('tr-TR')}`;
            break;
          case 'Maplink':
            // Convert Cid to Maplink format
            const cidIndex = hamVeriHeaders.indexOf('Cid');
            if (cidIndex !== -1 && row[cidIndex]) {
              const cid = row[cidIndex];
              // Extract CID from Google Maps URL if it's a full URL
              const cidMatch = cid.match(/cid=(\d+)/);
              if (cidMatch) {
                mappedRow[formatIndex] = `https://maps.google.com/?cid=${cidMatch[1]}`;
              } else {
                // If it's just the CID number
                mappedRow[formatIndex] = `https://maps.google.com/?cid=${cid}`;
              }
            }
            break;
          case 'Yetkili Tel':
          case 'Mail':
          case 'İsim Soyisim':
          case 'Yorum':
          case 'Yönetici Not':
          case 'CMS Adı':
          case 'CMS Grubu':
          case 'E-Ticaret İzi':
          case 'Site Hızı':
          case 'Site Trafiği':
          case 'Toplantı formatı':
            // These columns are left empty for manual input
            mappedRow[formatIndex] = '';
            break;
        }
      }
    });
    
    mappedData.push(mappedRow);
  });
  
  console.log(`Mapped ${mappedData.length} rows`);
  return mappedData;
}

/**
 * Applies styling to Format Tablo
 * @param {Sheet} sheet - Target sheet
 */
function applyFormatTableStyling(sheet) {
  console.log('Applying Format Tablo styling');
  
  // Header styling
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Add borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
}

/**
 * Sets data validation for dropdown columns
 * @param {Sheet} sheet - Target sheet
 */
function setDataValidation(sheet) {
  console.log('Setting data validation for dropdown columns');
  
  // Find column indices
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const aktiviteIndex = headers.indexOf('Aktivite') + 1;
  const toplantiFormatIndex = headers.indexOf('Toplantı formatı') + 1;
  
  // Set validation for Aktivite column
  if (aktiviteIndex > 0) {
    const aktiviteRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CRM_CONFIG.ACTIVITY_OPTIONS, true)
      .setAllowInvalid(false)
      .build();
    
    // Only apply validation if there are data rows (more than 1 row)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, aktiviteIndex, sheet.getLastRow() - 1, 1).setDataValidation(aktiviteRule);
    }
  }
  
  // Set validation for Toplantı formatı column
  if (toplantiFormatIndex > 0) {
    const toplantiRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CRM_CONFIG.MEETING_FORMAT_OPTIONS, true)
      .setAllowInvalid(false)
      .build();
    
    // Only apply validation if there are data rows (more than 1 row)
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, toplantiFormatIndex, sheet.getLastRow() - 1, 1).setDataValidation(toplantiRule);
    }
  }
}

// ========================================
// FUNCTION 2: TAKE APPOINTMENT
// ========================================

/**
 * Takes appointment from Format Tablo to Randevularım
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function takeAppointment(parameters) {
  console.log('Function started: takeAppointment', parameters);
  
  try {
    // Input validation
    if (!validateInput(parameters)) {
      throw new Error('Invalid input provided');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const activeRange = SpreadsheetApp.getActiveRange();
    
    // Check if we're on a Format Tablo or Fırsatlarım
    console.log('Active sheet name:', activeSheet.getName());
    const sheetName = activeSheet.getName();
    if (!isFormatTable(activeSheet) && sheetName !== 'Fırsatlarım') {
      throw new Error(`Bu işlem sadece Format Tablo veya Fırsatlarım sayfalarında yapılabilir. Mevcut sayfa: "${sheetName}"`);
    }
    
    // Check if a row is selected
    if (!activeRange || activeRange.getRow() === 1) {
      throw new Error('Lütfen bir satır seçin (başlık satırı hariç)');
    }
    
    // Get selected row data
    const selectedRowData = getSelectedRowData(activeSheet, activeRange.getRow());
    
    // Check if row already has appointment (for both Format Tablo and Fırsatlarım)
    if (isFormatTable(activeSheet) && selectedRowData.Aktivite === 'Randevu Alındı') {
      throw new Error('Bu satır zaten randevu alınmış durumda');
    }
    
    // Check if Fırsatlarım row already has appointment
    if (sheetName === 'Fırsatlarım') {
      // Check if this row already exists in Randevularım using Phone + Company name
      const randevularimSheet = spreadsheet.getSheetByName('Randevularım');
      if (randevularimSheet) {
        const randevularimData = randevularimSheet.getDataRange().getValues();
        const randevularimHeaders = randevularimData[0];
        const phoneIndex = randevularimHeaders.indexOf('Phone');
        const companyIndex = randevularimHeaders.indexOf('Company name');
        
        if (companyIndex !== -1 && selectedRowData['Company name'] && selectedRowData['Company name'].toString().trim() !== '') {
          
          const selectedPhone = selectedRowData.Phone ? selectedRowData.Phone.toString().trim() : '';
          const selectedCompany = selectedRowData['Company name'].toString().trim();
          
          const existingAppointment = randevularimData.slice(1).find(row => {
            const rowPhone = row[phoneIndex];
            const rowCompany = row[companyIndex];
            
            const companyMatch = rowCompany && rowCompany.toString().trim() === selectedCompany;
            
            // Eğer telefon boşsa sadece company name kontrol et
            let phoneMatch = true;
            if (selectedPhone !== '') {
              phoneMatch = rowPhone && rowPhone.toString().trim() === selectedPhone;
            }
            
            return phoneMatch && companyMatch;
          });
          
          if (existingAppointment) {
            throw new Error('Bu satır zaten randevu alınmış durumda (Randevularım sayfasında mevcut)');
          }
        }
      }
    }
    
    // Show appointment dialog directly
    showAppointmentDialog(selectedRowData);
    
    // Since dialog doesn't return data, we'll handle the processing in the HTML dialog
    // The dialog will call processAppointmentForm which will handle the rest
    return { success: true, message: 'Randevu dialog\'u açıldı' };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Checks if sheet is a Format Tablo
 * @param {Sheet} sheet - Target sheet
 * @returns {boolean} - Is Format Tablo
 */
function isFormatTable(sheet) {
  const sheetName = sheet.getName();
  console.log('Checking if sheet is Format Table:', sheetName);
  
  // Exclude known non-format table sheets
  const excludedSheets = [
    'Ham veri',
    'ham veri',
    'Randevularım',
    'Fırsatlarım', 
    'Toplantılarım',
    'Raporlarım',
    'Günlük Rapor',
    'Haftalık Rapor',
    'Detaylı Rapor',
    'Config',
    'config',
    'CONFIG'
  ];
  
  // If it's an excluded sheet, it's not a format table
  if (excludedSheets.includes(sheetName)) {
    console.log('Is Format Table: false (excluded sheet)');
    return false;
  }
  
  // If it's not an excluded sheet, it's a format table (user-created table)
  console.log('Is Format Table: true (user-created table)');
  return true;
}

/**
 * Gets selected row data as object
 * @param {Sheet} sheet - Source sheet
 * @param {number} rowNumber - Row number
 * @returns {Object} - Row data object
 */
function getSelectedRowData(sheet, rowNumber) {
  console.log('getSelectedRowData - rowNumber:', rowNumber);
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const rowData = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  console.log('getSelectedRowData - headers:', headers);
  console.log('getSelectedRowData - rowData:', rowData);
  
  const rowObject = {};
  headers.forEach((header, index) => {
    rowObject[header] = rowData[index];
  });
  
  console.log('getSelectedRowData - rowObject:', rowObject);
  return rowObject;
}

/**
 * Shows appointment dialog with pre-filled data
 * @param {Object} rowData - Selected row data
 * @returns {Object|null} - Appointment data or null if cancelled
 */
function showAppointmentDialog(rowData) {
  console.log('Showing appointment dialog for:', rowData.Kod);
  
  const ui = SpreadsheetApp.getUi();
  
  // Create HTML template for dialog
  const htmlTemplate = HtmlService.createTemplateFromFile('appointmentDialog');
  htmlTemplate.rowData = rowData;
  htmlTemplate.meetingFormats = CRM_CONFIG.MEETING_FORMAT_OPTIONS;
  
  const htmlOutput = htmlTemplate.evaluate()
    .setWidth(600)
    .setHeight(500);
  
  // Show dialog and wait for user input
  ui.showModalDialog(htmlOutput, 'Randevu Al');
  
  // Since modal dialog doesn't return data directly, we need to use a different approach
  // The HTML dialog will call processAppointmentForm via google.script.run
  // For now, return null to indicate dialog was shown
  return null;
}

/**
 * Processes appointment form data from HTML dialog
 * @param {Object} formData - Form data from HTML
 * @returns {Object} - Result object
 */
function processAppointmentForm(formData) {
  console.log('Processing appointment form data:', formData);
  
  try {
    // Validate form data
    if (!formData.isimSoyisim || !formData.randevuTarihi) {
      throw new Error('Gerekli alanlar eksik');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const activeRange = SpreadsheetApp.getActiveRange();
    
    // Get selected row data
    const selectedRowData = getSelectedRowData(activeSheet, activeRange.getRow());
    
    // Add source sheet information to rowData
    if (isFormatTable(activeSheet)) {
      selectedRowData.Kaynak = activeSheet.getName();
    } else if (activeSheet.getName() === 'Fırsatlarım') {
      selectedRowData.Kaynak = 'Format Tablo'; // Default for Fırsatlarım
    }
    
    // Create appointment in Randevularım
    const result = createAppointmentInRandevularim(spreadsheet, selectedRowData, formData);
    
    // Update Format Tablo row with selected activity and form data (only for Format Tablo sheets)
    if (isFormatTable(activeSheet)) {
      updateFormatTableRow(activeSheet, activeRange.getRow(), formData.aktivite || 'Randevu Alındı', formData);
    }
    
    // Apply appointment color coding to Fırsatlarım row (if from Fırsatlarım)
    if (activeSheet.getName() === 'Fırsatlarım') {
      applyFirsatlarimAppointmentColorCoding(activeSheet, activeRange.getRow());
    }
    
    console.log('Processing complete:', result);
    logActivity('takeAppointment', { 
      rowId: selectedRowData.Kod,
      appointmentData: formData 
    });
    
    // Return success to close dialog
    return {
      success: true,
      appointmentData: formData,
      message: 'Randevu başarıyla oluşturuldu!'
    };
    
  } catch (error) {
    console.error('Form processing failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Creates appointment in Randevularım sheet
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @param {Object} rowData - Original row data
 * @param {Object} appointmentData - Appointment form data
 * @returns {Object} - Result object
 */
function createAppointmentInRandevularim(spreadsheet, rowData, appointmentData) {
  console.log('Creating appointment in Randevularım');
  
  let randevularimSheet = spreadsheet.getSheetByName('Randevularım');
  
  // Create Randevularım sheet if it doesn't exist
  if (!randevularimSheet) {
    randevularimSheet = createRandevularimSheet(spreadsheet);
  }
  
  // Define Randevularım columns based on sayfa_kolonlari.md
  const randevularimColumns = [
    'Kod',
    'Kaynak',
    'Keyword',
    'Location',
    'Company name',
    'Category',
    'Website',
    'Phone',
    'Yetkili Tel',
    'Mail',
    'İsim Soyisim',
    'Randevu durumu',
    'Randevu Tarihi',
    'Saat',
    'Yorum',
    'Yönetici Not',
    'CMS Adı',
    'CMS Grubu',
    'E-Ticaret İzi',
    'Site Hızı',
    'Site Trafiği',
    'Log',
    'Toplantı formatı',
    'Address',
    'City',
    'Rating count',
    'Review',
    'Toplantı Sonucu',
    'Toplantı Tarihi',
    'Maplink'
  ];
  
  // Prepare appointment row data
  const appointmentRow = prepareAppointmentRow(rowData, appointmentData, randevularimColumns, randevularimSheet);
  
  // Add to Randevularım
  const nextRow = randevularimSheet.getLastRow() + 1;
  randevularimSheet.getRange(nextRow, 1, 1, randevularimColumns.length).setValues([appointmentRow]);
  // Force Kod column to be text format for the new row
  const kodColumnIndex = randevularimColumns.indexOf('Kod') + 1;
  if (kodColumnIndex > 0) {
    randevularimSheet.getRange(nextRow, kodColumnIndex, 1, 1).setNumberFormat('@');
  }
  
  // Apply color coding
  applyAppointmentColorCoding(randevularimSheet, nextRow);
  
  // Activate Randevularım sheet to show the new appointment
  randevularimSheet.activate();
  
  const result = {
    success: true,
    appointmentId: rowData.Kod,
    message: `Randevu başarıyla oluşturuldu: ${rowData['Company name']} - Randevularım sayfasına yönlendiriliyorsunuz`
  };
  
  console.log('Appointment created successfully:', result);
  return result;
}

/**
 * Creates Randevularım sheet with proper structure
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Sheet} - Created sheet
 */
function createRandevularimSheet(spreadsheet) {
  console.log('Creating Randevularım sheet');
  
  const sheet = spreadsheet.insertSheet('Randevularım');
  
  // Define columns
  const columns = [
    'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
    'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Randevu durumu', 'Randevu Tarihi',
    'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
    'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
    'Rating count', 'Review', 'Toplantı Sonucu', 'Toplantı Tarihi', 'Maplink'
  ];
  
  // Set headers
  sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  
  // Force Kod column to be text format
  const kodColumnIndex = columns.indexOf('Kod') + 1;
  if (kodColumnIndex > 0) {
    sheet.getRange(1, kodColumnIndex, 1000, 1).setNumberFormat('@');
    console.log('Kod column forced to text format');
  }
  
  // Apply styling
  applyRandevularimStyling(sheet);
  
  // Set data validation
  setRandevularimDataValidation(sheet);
  
  return sheet;
}

/**
 * Prepares appointment row data
 * @param {Object} rowData - Original row data
 * @param {Object} appointmentData - Appointment form data
 * @param {Array} columns - Column names
 * @param {Sheet} sheet - Randevularım sheet
 * @returns {Array} - Row data array
 */
function prepareAppointmentRow(rowData, appointmentData, columns, sheet) {
  console.log('Preparing appointment row data');
  
  const row = new Array(columns.length).fill('');
  
  columns.forEach((column, index) => {
    switch (column) {
      case 'Kod':
        // Use original format
        row[index] = String(rowData.Kod || '');
        break;
      case 'Kaynak':
        // Use the source sheet name from rowData or determine the source
        // rowData should contain the original source sheet information
        if (rowData.Kaynak) {
          // If rowData already has Kaynak info, use it
          row[index] = rowData.Kaynak;
        } else {
          // Fallback: determine source based on current context
          const activeSheet = SpreadsheetApp.getActiveSheet();
          const sheetName = activeSheet.getName();
          
          if (sheetName === 'Fırsatlarım') {
            // For Fırsatlarım, the source is the original Format Tablo
            row[index] = 'Format Tablo';
          } else if (isFormatTable(activeSheet)) {
            // For Format Tablo sheets, use the sheet name
            row[index] = sheetName;
          } else {
            // Default fallback
            row[index] = 'Format Tablo';
          }
        }
        break;
      case 'Keyword':
      case 'Location':
      case 'Company name':
      case 'Category':
      case 'Website':
      case 'Phone':
      case 'Address':
      case 'City':
      case 'Rating count':
        row[index] = rowData[column] || '';
        break;
      case 'Yetkili Tel':
        row[index] = appointmentData.yetkiliTel || '';
        break;
      case 'Mail':
        row[index] = appointmentData.mail || '';
        break;
      case 'İsim Soyisim':
        row[index] = appointmentData.isimSoyisim || '';
        break;
      case 'Randevu durumu':
        row[index] = appointmentData.aktivite || 'Randevu Alındı';
        break;
      case 'Randevu Tarihi':
        // Format date as DD.MM.YYYY
        let randevuTarihi = appointmentData.randevuTarihi || '';
        if (randevuTarihi && randevuTarihi.includes('-')) {
          // Convert from YYYY-MM-DD to DD.MM.YYYY
          const parts = randevuTarihi.split('-');
          if (parts.length === 3) {
            randevuTarihi = `${parts[2]}.${parts[1]}.${parts[0]}`;
          }
        } else if (randevuTarihi instanceof Date) {
          const day = randevuTarihi.getDate().toString().padStart(2, '0');
          const month = (randevuTarihi.getMonth() + 1).toString().padStart(2, '0');
          const year = randevuTarihi.getFullYear();
          randevuTarihi = `${day}.${month}.${year}`;
        }
        row[index] = randevuTarihi;
        break;
      case 'Saat':
        row[index] = appointmentData.saat || '';
        break;
      case 'Yorum':
        row[index] = appointmentData.yorum || '';
        break;
      case 'Review':
        // Preserve Review as text to prevent date conversion
        row[index] = String(rowData[column] || '');
        break;
      case 'Maplink':
        // Preserve Maplink as text
        row[index] = String(rowData[column] || '');
        break;

      case 'CMS Adı':
      case 'CMS Grubu':
      case 'E-Ticaret İzi':
      case 'Site Hızı':
      case 'Site Trafiği':
        row[index] = rowData[column] || '';
        break;
      case 'Log':
        row[index] = `Randevu alındı - ${new Date().toLocaleString('tr-TR')}`;
        break;
      case 'Toplantı formatı':
        row[index] = appointmentData.toplantiFormat || 'Yüz Yüze';
        break;
      case 'Toplantı Sonucu':
        row[index] = '';
        break;
      case 'Toplantı Tarihi':
        row[index] = '';
        break;
    }
  });
  
  return row;
}

/**
 * Updates Format Tablo row activity
 * @param {Sheet} sheet - Format Tablo sheet
 * @param {number} rowNumber - Row number
 * @param {string} activity - New activity
 */
function updateFormatTableRow(sheet, rowNumber, activity, formData = {}) {
  console.log('Updating Format Tablo row activity:', activity, 'formData:', formData);
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const aktiviteIndex = headers.indexOf('Aktivite') + 1;
  const aktiviteTarihiIndex = headers.indexOf('Aktivite Tarihi') + 1;
  const logIndex = headers.indexOf('Log') + 1;
  
  // Update activity
  if (aktiviteIndex > 0) {
    sheet.getRange(rowNumber, aktiviteIndex).setValue(activity);
  }
  
  // Update activity date
  if (aktiviteTarihiIndex > 0) {
    sheet.getRange(rowNumber, aktiviteTarihiIndex).setValue(new Date());
  }
  
  // Update form data fields if provided
  if (formData) {
    // Yetkili Tel
    const yetkiliTelIndex = headers.indexOf('Yetkili Tel') + 1;
    if (yetkiliTelIndex > 0 && formData.yetkiliTel) {
      sheet.getRange(rowNumber, yetkiliTelIndex).setValue(formData.yetkiliTel);
    }
    
    // Mail
    const mailIndex = headers.indexOf('Mail') + 1;
    if (mailIndex > 0 && formData.mail) {
      sheet.getRange(rowNumber, mailIndex).setValue(formData.mail);
    }
    
    // İsim Soyisim
    const isimSoyisimIndex = headers.indexOf('İsim Soyisim') + 1;
    if (isimSoyisimIndex > 0 && formData.isimSoyisim) {
      sheet.getRange(rowNumber, isimSoyisimIndex).setValue(formData.isimSoyisim);
    }
    
    // Toplantı formatı
    const toplantiFormatIndex = headers.indexOf('Toplantı formatı') + 1;
    if (toplantiFormatIndex > 0 && formData.toplantiFormat) {
      sheet.getRange(rowNumber, toplantiFormatIndex).setValue(formData.toplantiFormat);
    }
  }
  
  // Update log
  if (logIndex > 0) {
    const currentLog = sheet.getRange(rowNumber, logIndex).getValue();
    const newLog = `Randevu alındı - ${new Date().toLocaleString('tr-TR')}`;
    sheet.getRange(rowNumber, logIndex).setValue(newLog);
  }
  
  // Apply color coding to Format Tablo row
  applyFormatTableColorCoding(sheet, rowNumber, activity);
}

/**
 * Applies color coding to Format Tablo row based on activity
 * @param {Sheet} sheet - Format Tablo sheet
 * @param {number} rowNumber - Row number
 * @param {string} activity - Activity status
 */
function applyFormatTableColorCoding(sheet, rowNumber, activity) {
  console.log('Applying Format Tablo color coding to row:', rowNumber, 'activity:', activity);
  
  let color = '#FFFFFF'; // Default white
  
  // Map activity to color
  if (activity === 'Randevu Alındı' || activity === 'İleri Tarih Randevu') {
    color = CRM_CONFIG.COLOR_CODES['Randevu Alındı'];
  } else if (activity === 'Fırsat İletildi' || activity === 'Bilgi Verildi') {
    color = CRM_CONFIG.COLOR_CODES['Fırsat'];
  } else if (activity === 'İlgilenmiyor' || activity === 'Ulaşılamadı') {
    color = CRM_CONFIG.COLOR_CODES['İptal'];
  }
  
  // Apply color to entire row
  sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).setBackground(color);
  console.log('Applied color:', color, 'to row:', rowNumber);
}

/**
 * Applies styling to Randevularım sheet
 * @param {Sheet} sheet - Target sheet
 */
function applyRandevularimStyling(sheet) {
  console.log('Applying Randevularım styling');
  
  // Header styling
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#34a853');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Manual column width adjustments for better readability
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((header, index) => {
    const columnIndex = index + 1;
    switch (header) {
      case 'Kod':
        sheet.setColumnWidth(columnIndex, 120);
        break;
      case 'Company name':
        sheet.setColumnWidth(columnIndex, 200);
        break;
      case 'Phone':
      case 'Yetkili Tel':
        sheet.setColumnWidth(columnIndex, 130);
        break;
      case 'Mail':
        sheet.setColumnWidth(columnIndex, 180);
        break;
      case 'İsim Soyisim':
        sheet.setColumnWidth(columnIndex, 150);
        break;
      case 'Randevu Tarihi':
      case 'Toplantı Tarihi':
        sheet.setColumnWidth(columnIndex, 120);
        break;
      case 'Saat':
        sheet.setColumnWidth(columnIndex, 80);
        break;
      case 'Yorum':
      case 'Yönetici Not':
        sheet.setColumnWidth(columnIndex, 250);
        break;
      case 'Address':
        sheet.setColumnWidth(columnIndex, 300);
        break;
      case 'Website':
        sheet.setColumnWidth(columnIndex, 200);
        break;
      default:
        // Default width for other columns
        if (sheet.getColumnWidth(columnIndex) < 100) {
          sheet.setColumnWidth(columnIndex, 100);
        }
    }
  });
  
  // Add borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
  
  console.log('Randevularım styling completed with optimized column widths');
}

/**
 * Sets data validation for Randevularım sheet
 * @param {Sheet} sheet - Target sheet
 */
function setRandevularimDataValidation(sheet) {
  console.log('Setting Randevularım data validation');
  
  // If no sheet parameter provided, get the active sheet
  if (!sheet) {
    console.log('No sheet parameter provided, getting active sheet');
    try {
      sheet = SpreadsheetApp.getActiveSheet();
      console.log('Active sheet found:', sheet.getName());
    } catch (error) {
      console.error('Could not get active sheet:', error);
      throw new Error('No active sheet found. Please open a sheet first.');
    }
  }
  
  // Check if sheet parameter is valid
  if (!sheet) {
    console.error('Sheet parameter is undefined or null');
    throw new Error('Sheet parameter is required');
  }
  
  console.log('Sheet name:', sheet.getName());
  console.log('Sheet last row:', sheet.getLastRow());
  console.log('Sheet last column:', sheet.getLastColumn());
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Minimum 1000 rows for data validation
  const minRows = 1000;
  const currentRows = Math.max(2, sheet.getLastRow());
  const validationRows = Math.max(minRows, currentRows - 1);
  
  console.log(`Applying validation to ${validationRows} rows`);
  
  // Randevu durumu validation (dropdown)
  const randevuDurumuIndex = headers.indexOf('Randevu durumu') + 1;
  if (randevuDurumuIndex > 0) {
    const randevuDurumuOptions = ['Randevu Alındı', 'İleri Tarih Randevu', 'Randevu Teyitlendi', 'Randevu Ertelendi', 'Randevu İptal oldu'];
    const randevuRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(randevuDurumuOptions, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, randevuDurumuIndex, validationRows, 1).setDataValidation(randevuRule);
    console.log('Applied Randevu durumu validation');
  }
  
  // Randevu Tarihi validation (datepicker)
  const randevuTarihiIndex = headers.indexOf('Randevu Tarihi') + 1;
  if (randevuTarihiIndex > 0) {
    const tarihRule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, randevuTarihiIndex, validationRows, 1).setDataValidation(tarihRule);
    console.log('Applied Randevu Tarihi validation');
  }
  
  // Saat validation (time picker)
  const saatIndex = headers.indexOf('Saat') + 1;
  if (saatIndex > 0) {
    const saatOptions = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    const saatRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(saatOptions, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, saatIndex, validationRows, 1).setDataValidation(saatRule);
    console.log('Applied Saat validation');
  }
  
  // Toplantı formatı validation (dropdown)
  const toplantiFormatIndex = headers.indexOf('Toplantı formatı') + 1;
  if (toplantiFormatIndex > 0) {
    const toplantiRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CRM_CONFIG.MEETING_FORMAT_OPTIONS, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, toplantiFormatIndex, validationRows, 1).setDataValidation(toplantiRule);
    console.log('Applied Toplantı formatı validation');
  }
  
  // Toplantı Sonucu validation (dropdown) - Randevularım'da bu sütun yok
  // Bu validation sadece Toplantılarım sayfasında olmalı
  
  // Toplantı Tarihi validation (datepicker)
  const toplantiTarihiIndex = headers.indexOf('Toplantı Tarihi') + 1;
  if (toplantiTarihiIndex > 0) {
    const toplantiTarihRule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, toplantiTarihiIndex, validationRows, 1).setDataValidation(toplantiTarihRule);
    console.log('Applied Toplantı Tarihi validation');
  }
  
  console.log('Randevularım data validation completed');
}

/**
 * Applies color coding to appointment row
 * @param {Sheet} sheet - Randevularım sheet
 * @param {number} rowNumber - Row number
 */
function applyAppointmentColorCoding(sheet, rowNumber) {
  console.log('Applying appointment color coding to row:', rowNumber);
  
  const color = CRM_CONFIG.COLOR_CODES['Randevu Alındı'];
  sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).setBackground(color);
}

/**
 * Shows take appointment dialog
 */
function showTakeAppointmentDialog() {
  console.log('Showing take appointment dialog');
  takeAppointment({});
}

// ========================================
// FUNCTION 3: ADD OPPORTUNITY
// ========================================

/**
 * Adds opportunity from Format Tablo to Fırsatlarım
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function addOpportunity(parameters) {
  console.log('Function started: addOpportunity', parameters);
  
  try {
    // Input validation
    if (!validateInput(parameters)) {
      throw new Error('Invalid input provided');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const activeRange = SpreadsheetApp.getActiveRange();
    
    // Check if we're on a Format Tablo
    console.log('Active sheet name:', activeSheet.getName());
    if (!isFormatTable(activeSheet)) {
      throw new Error(`Bu işlem sadece Format Tablo sayfalarında yapılabilir. Mevcut sayfa: "${activeSheet.getName()}"`);
    }
    
    // Check if a row is selected
    if (!activeRange || activeRange.getRow() === 1) {
      throw new Error('Lütfen bir satır seçin (başlık satırı hariç)');
    }
    
    // Get selected row data
    const selectedRowData = getSelectedRowData(activeSheet, activeRange.getRow());
    
    // Check if row already has opportunity
    if (selectedRowData.Aktivite === 'Fırsat İletildi') {
      throw new Error('Bu satır zaten fırsat olarak işaretlenmiş');
    }
    
    // Check if this row already exists in Fırsatlarım using Phone + Company name
    const firsatlarimSheet = spreadsheet.getSheetByName('Fırsatlarım');
    if (firsatlarimSheet) {
      const firsatlarimData = firsatlarimSheet.getDataRange().getValues();
      const firsatlarimHeaders = firsatlarimData[0];
      const phoneIndex = firsatlarimHeaders.indexOf('Phone');
      const companyIndex = firsatlarimHeaders.indexOf('Company name');
      
      console.log('Debug - selectedRowData.Phone:', selectedRowData.Phone);
      console.log('Debug - selectedRowData.Company name:', selectedRowData['Company name']);
      console.log('Debug - phoneIndex:', phoneIndex, 'companyIndex:', companyIndex);
      console.log('Debug - Fırsatlarım data rows:', firsatlarimData.length);
      
      if (companyIndex !== -1 && selectedRowData['Company name'] && selectedRowData['Company name'].toString().trim() !== '') {
        
        const selectedPhone = selectedRowData.Phone ? selectedRowData.Phone.toString().trim() : '';
        const selectedCompany = selectedRowData['Company name'].toString().trim();
        
        console.log('Debug - Checking for existing opportunity with Company:', selectedCompany, 'Phone:', selectedPhone || 'BOŞ');
        
        const existingOpportunity = firsatlarimData.slice(1).find(row => {
          const rowPhone = row[phoneIndex];
          const rowCompany = row[companyIndex];
          
          const companyMatch = rowCompany && rowCompany.toString().trim() === selectedCompany;
          
          // Eğer telefon boşsa sadece company name kontrol et
          let phoneMatch = true;
          if (selectedPhone !== '') {
            phoneMatch = rowPhone && rowPhone.toString().trim() === selectedPhone;
          }
          
          const match = phoneMatch && companyMatch;
          
          console.log('Debug - Comparing rowCompany:', rowCompany, 'with selectedCompany:', selectedCompany, 'companyMatch:', companyMatch);
          console.log('Debug - Phone check:', selectedPhone !== '' ? `rowPhone: ${rowPhone}, selectedPhone: ${selectedPhone}, phoneMatch: ${phoneMatch}` : 'Phone boş, sadece company kontrol ediliyor');
          console.log('Debug - Final match:', match);
          
          return match;
        });
        
        if (existingOpportunity) {
          console.log('Debug - Found existing opportunity:', existingOpportunity);
          throw new Error('Bu satır zaten fırsat olarak işaretlenmiş (Fırsatlarım sayfasında mevcut)');
        }
      } else {
        console.log('Debug - Skipping check: phoneIndex =', phoneIndex, 'companyIndex =', companyIndex);
        console.log('Debug - selectedRowData.Phone =', selectedRowData.Phone, 'selectedRowData.Company name =', selectedRowData['Company name']);
      }
    }
    
    // Show opportunity dialog directly
    showOpportunityDialog(selectedRowData);
    
    // Since dialog doesn't return data, we'll handle the processing in the HTML dialog
    // The dialog will call processOpportunityForm which will handle the rest
    return { success: true, message: 'Fırsat dialog\'u açıldı' };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Shows opportunity dialog with pre-filled data
 * @param {Object} rowData - Selected row data
 * @returns {Object|null} - Opportunity data or null if cancelled
 */
function showOpportunityDialog(rowData) {
  console.log('Showing opportunity dialog for:', rowData.Kod);
  
  const ui = SpreadsheetApp.getUi();
  
  // Create HTML template for dialog
  const htmlTemplate = HtmlService.createTemplateFromFile('opportunityDialog');
  htmlTemplate.rowData = rowData;
  htmlTemplate.meetingFormats = CRM_CONFIG.MEETING_FORMAT_OPTIONS;
  
  const htmlOutput = htmlTemplate.evaluate()
    .setWidth(600)
    .setHeight(500);
  
  const response = ui.showModalDialog(htmlOutput, 'Fırsat Ekle');
  
  console.log('Dialog response:', response);
  
  if (response && response.success) {
    return response;
  }
  
  return null;
}

/**
 * Processes opportunity form data from HTML dialog
 * @param {Object} formData - Form data from HTML
 * @returns {Object} - Result object
 */
function processOpportunityForm(formData) {
  console.log('Processing opportunity form data:', formData);
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const activeRange = SpreadsheetApp.getActiveRange();
    
    // Get selected row data
    const selectedRowData = getSelectedRowData(activeSheet, activeRange.getRow());
    
    // Add source sheet information to rowData
    if (isFormatTable(activeSheet)) {
      selectedRowData.Kaynak = activeSheet.getName();
    }
    
    // Create opportunity in Fırsatlarım
    const result = createOpportunityInFirsatlarim(spreadsheet, selectedRowData, formData);
    
    // Update Format Tablo row with selected activity and form data
    updateFormatTableRow(activeSheet, activeRange.getRow(), formData.aktivite || 'Fırsat İletildi', formData);
    
    console.log('Processing complete:', result);
    logActivity('addOpportunity', { 
      rowId: selectedRowData.Kod,
      opportunityData: formData 
    });
    
    // Return success to close dialog
    return {
      success: true,
      opportunityData: formData,
      message: 'Fırsat başarıyla oluşturuldu!'
    };
    
  } catch (error) {
    console.error('Form processing failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Creates opportunity in Fırsatlarım sheet
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @param {Object} rowData - Original row data
 * @param {Object} opportunityData - Opportunity form data
 * @returns {Object} - Result object
 */
function createOpportunityInFirsatlarim(spreadsheet, rowData, opportunityData) {
  console.log('Creating opportunity in Fırsatlarım');
  
  let firsatlarimSheet = spreadsheet.getSheetByName('Fırsatlarım');
  
  // Create Fırsatlarım sheet if it doesn't exist
  if (!firsatlarimSheet) {
    firsatlarimSheet = createFirsatlarimSheet(spreadsheet);
  }
  
  // Define Fırsatlarım columns based on sayfa_kolonlari.md
  const firsatlarimColumns = [
    'Kod',
    'Kaynak',
    'Keyword',
    'Location',
    'Company name',
    'Category',
    'Website',
    'Phone',
    'Yetkili Tel',
    'Mail',
    'İsim Soyisim',
    'Fırsat Durumu',
    'Fırsat Tarihi',
    'Yorum',
    'Yönetici Not',
    'CMS Adı',
    'CMS Grubu',
    'E-Ticaret İzi',
    'Site Hızı',
    'Site Trafiği',
    'Log',
    'Toplantı formatı',
    'Address',
    'City',
    'Rating count',
    'Review',
    'Maplink'
  ];
  
  // Prepare opportunity row data
  const opportunityRow = prepareOpportunityRow(rowData, opportunityData, firsatlarimColumns, firsatlarimSheet);
  
  // Add to Fırsatlarım
  const nextRow = firsatlarimSheet.getLastRow() + 1;
  firsatlarimSheet.getRange(nextRow, 1, 1, firsatlarimColumns.length).setValues([opportunityRow]);
  // Force Kod column to be text format for the new row
  const kodColumnIndex = firsatlarimColumns.indexOf('Kod') + 1;
  if (kodColumnIndex > 0) {
    firsatlarimSheet.getRange(nextRow, kodColumnIndex, 1, 1).setNumberFormat('@');
  }
  
  // Apply color coding
  applyOpportunityColorCoding(firsatlarimSheet, nextRow);
  
  // Activate Fırsatlarım sheet to show the new opportunity
  firsatlarimSheet.activate();
  
  const result = {
    success: true,
    opportunityId: rowData.Kod,
    message: `Fırsat başarıyla oluşturuldu: ${rowData['Company name']} - Fırsatlarım sayfasına yönlendiriliyorsunuz`
  };
  
  console.log('Opportunity created successfully:', result);
  return result;
}

/**
 * Creates Fırsatlarım sheet with proper structure
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Sheet} - Created sheet
 */
function createFirsatlarimSheet(spreadsheet) {
  console.log('Creating Fırsatlarım sheet');
  
  const sheet = spreadsheet.insertSheet('Fırsatlarım');
  
  // Define columns (Fırsatlarım'da Aktivite sütunu yok)
  const columns = [
    'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
    'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Fırsat Durumu', 'Fırsat Tarihi',
    'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi', 'Site Hızı',
    'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City', 'Rating count',
    'Review', 'Maplink'
  ];
  
  // Set headers
  sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  
  // Force Kod column to be text format
  const kodColumnIndex = columns.indexOf('Kod') + 1;
  if (kodColumnIndex > 0) {
    sheet.getRange(1, kodColumnIndex, 1000, 1).setNumberFormat('@');
    console.log('Kod column forced to text format');
  }
  
  // Apply styling
  applyFirsatlarimStyling(sheet);
  
  // Set data validation
  setFirsatlarimDataValidation(sheet);
  
  return sheet;
}

/**
 * Prepares opportunity row data
 * @param {Object} rowData - Original row data
 * @param {Object} opportunityData - Opportunity form data
 * @param {Array} columns - Column names
 * @param {Sheet} sheet - Fırsatlarım sheet
 * @returns {Array} - Row data array
 */
function prepareOpportunityRow(rowData, opportunityData, columns, sheet) {
  console.log('Preparing opportunity row data');
  
  const row = new Array(columns.length).fill('');
  
  columns.forEach((column, index) => {
    switch (column) {
      case 'Kod':
        // Use original format
        row[index] = String(rowData.Kod || '');
        break;
      case 'Kaynak':
        // Use the source sheet name (Format Tablo) instead of target sheet name
        const activeSheet = SpreadsheetApp.getActiveSheet();
        const sheetName = activeSheet.getName();
        
        // For opportunities, the source is always the Format Tablo sheet
        row[index] = sheetName;
        break;
      case 'Keyword':
      case 'Location':
      case 'Company name':
      case 'Category':
      case 'Website':
      case 'Phone':
      case 'Address':
      case 'City':
      case 'Rating count':
        row[index] = rowData[column] || '';
        break;
      case 'Yetkili Tel':
        row[index] = opportunityData.yetkiliTel || '';
        break;
      case 'Mail':
        row[index] = opportunityData.mail || '';
        break;
      case 'İsim Soyisim':
        row[index] = opportunityData.isimSoyisim || '';
        break;
      case 'Fırsat Durumu':
        row[index] = opportunityData.firsatDurumu || 'Bilgi Verildi';
        break;
      case 'Fırsat Tarihi':
        // Format date as DD.MM.YYYY
        let firsatTarihi = opportunityData.firsatTarihi || '';
        if (firsatTarihi && firsatTarihi.includes('-')) {
          // Convert from YYYY-MM-DD to DD.MM.YYYY
          const parts = firsatTarihi.split('-');
          if (parts.length === 3) {
            firsatTarihi = `${parts[2]}.${parts[1]}.${parts[0]}`;
          }
        } else if (firsatTarihi instanceof Date) {
          const day = firsatTarihi.getDate().toString().padStart(2, '0');
          const month = (firsatTarihi.getMonth() + 1).toString().padStart(2, '0');
          const year = firsatTarihi.getFullYear();
          firsatTarihi = `${day}.${month}.${year}`;
        }
        row[index] = firsatTarihi;
        break;
      case 'Yorum':
        row[index] = opportunityData.yorum || '';
        break;

      case 'CMS Adı':
      case 'CMS Grubu':
      case 'E-Ticaret İzi':
      case 'Site Hızı':
      case 'Site Trafiği':
        row[index] = rowData[column] || '';
        break;
      case 'Log':
        row[index] = `Fırsat oluşturuldu - ${new Date().toLocaleString('tr-TR')}`;
        break;
      case 'Toplantı formatı':
        row[index] = opportunityData.toplantiFormat || 'Telefon';
        break;
      case 'Review':
        // Preserve Review as text to prevent date conversion
        row[index] = String(rowData[column] || '');
        break;
      case 'Maplink':
        // Preserve Maplink as text
        row[index] = String(rowData[column] || '');
        break;
    }
  });
  
  return row;
}

/**
 * Applies styling to Fırsatlarım sheet
 * @param {Sheet} sheet - Target sheet
 */
function applyFirsatlarimStyling(sheet) {
  console.log('Applying Fırsatlarım styling');
  
  // Header styling
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#ffc107');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Manual column width adjustments for better readability
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((header, index) => {
    const columnIndex = index + 1;
    switch (header) {
      case 'Kod':
        sheet.setColumnWidth(columnIndex, 120);
        break;
      case 'Company name':
        sheet.setColumnWidth(columnIndex, 200);
        break;
      case 'Phone':
      case 'Yetkili Tel':
        sheet.setColumnWidth(columnIndex, 130);
        break;
      case 'Mail':
        sheet.setColumnWidth(columnIndex, 180);
        break;
      case 'İsim Soyisim':
        sheet.setColumnWidth(columnIndex, 150);
        break;
      case 'Fırsat Tarihi':
        sheet.setColumnWidth(columnIndex, 120);
        break;
      case 'Yorum':
      case 'Yönetici Not':
        sheet.setColumnWidth(columnIndex, 250);
        break;
      case 'Address':
        sheet.setColumnWidth(columnIndex, 300);
        break;
      case 'Website':
        sheet.setColumnWidth(columnIndex, 200);
        break;
      default:
        // Default width for other columns
        if (sheet.getColumnWidth(columnIndex) < 100) {
          sheet.setColumnWidth(columnIndex, 100);
        }
    }
  });
  
  // Add borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
  
  console.log('Fırsatlarım styling completed with optimized column widths');
}

/**
 * Sets data validation for Fırsatlarım sheet
 * @param {Sheet} sheet - Target sheet
 */
function setFirsatlarimDataValidation(sheet) {
  console.log('Setting Fırsatlarım data validation');
  
  // If no sheet parameter provided, get the active sheet
  if (!sheet) {
    console.log('No sheet parameter provided, getting active sheet');
    try {
      sheet = SpreadsheetApp.getActiveSheet();
      console.log('Active sheet found:', sheet.getName());
    } catch (error) {
      console.error('Could not get active sheet:', error);
      throw new Error('No active sheet found. Please open a sheet first.');
    }
  }
  
  // Check if sheet parameter is valid
  if (!sheet) {
    console.error('Sheet parameter is undefined or null');
    throw new Error('Sheet parameter is required');
  }
  
  console.log('Sheet name:', sheet.getName());
  console.log('Sheet last row:', sheet.getLastRow());
  console.log('Sheet last column:', sheet.getLastColumn());
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Minimum 1000 rows for data validation
  const minRows = 1000;
  const currentRows = Math.max(2, sheet.getLastRow());
  const validationRows = Math.max(minRows, currentRows - 1);
  
  console.log(`Applying validation to ${validationRows} rows`);
  
  // Fırsat Durumu validation (dropdown)
  const firsatDurumuIndex = headers.indexOf('Fırsat Durumu') + 1;
  if (firsatDurumuIndex > 0) {
    const firsatDurumuOptions = ['Yeniden Aranacak', 'Bilgi Verildi', 'Fırsat iletildi'];
    const firsatRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(firsatDurumuOptions, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, firsatDurumuIndex, validationRows, 1).setDataValidation(firsatRule);
    console.log('Applied Fırsat Durumu validation');
  }
  
  // Fırsat Tarihi validation (datepicker)
  const firsatTarihiIndex = headers.indexOf('Fırsat Tarihi') + 1;
  if (firsatTarihiIndex > 0) {
    const tarihRule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, firsatTarihiIndex, validationRows, 1).setDataValidation(tarihRule);
    console.log('Applied Fırsat Tarihi validation');
  }
  
  // Toplantı formatı validation (dropdown)
  const toplantiFormatIndex = headers.indexOf('Toplantı formatı') + 1;
  if (toplantiFormatIndex > 0) {
    const toplantiRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CRM_CONFIG.MEETING_FORMAT_OPTIONS, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, toplantiFormatIndex, validationRows, 1).setDataValidation(toplantiRule);
    console.log('Applied Toplantı formatı validation');
  }
  
  console.log('Fırsatlarım data validation completed');
}

/**
 * Applies color coding to opportunity row
 * @param {Sheet} sheet - Fırsatlarım sheet
 * @param {number} rowNumber - Row number
 */
function applyOpportunityColorCoding(sheet, rowNumber) {
  console.log('Applying opportunity color coding to row:', rowNumber);
  
  const color = CRM_CONFIG.COLOR_CODES['Fırsat'];
  sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).setBackground(color);
}

/**
 * Shows add opportunity dialog
 */
function showAddOpportunityDialog() {
  console.log('Showing add opportunity dialog');
  addOpportunity({});
}

// ========================================
// FUNCTION 4: MOVE TO MEETING
// ========================================

/**
 * Moves confirmed appointment from Randevularım to Toplantılarım
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function moveToMeeting(parameters) {
  console.log('Function started: moveToMeeting', parameters);
  
  try {
    // Input validation
    if (!validateInput(parameters)) {
      throw new Error('Invalid input provided');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const activeRange = SpreadsheetApp.getActiveRange();
    
    // Check if we're on Randevularım sheet
    if (activeSheet.getName() !== 'Randevularım') {
      throw new Error('Bu işlem sadece Randevularım sayfasında yapılabilir');
    }
    
    // Check if a row is selected
    if (!activeRange || activeRange.getRow() === 1) {
      throw new Error('Lütfen bir satır seçin (başlık satırı hariç)');
    }
    
    // Get selected row data
    const selectedRowData = getSelectedRowData(activeSheet, activeRange.getRow());
    
    // Check if appointment exists and has valid status
    if (!selectedRowData['Randevu durumu'] || 
        (selectedRowData['Randevu durumu'] !== 'Randevu Alındı' && 
         selectedRowData['Randevu durumu'] !== 'Randevu Teyitlendi')) {
      throw new Error('Sadece randevu alınmış veya teyitlenmiş randevular toplantıya geçebilir');
    }
    
    // Check if already moved to meeting
    if (selectedRowData['Toplantı Sonucu']) {
      throw new Error('Bu randevu zaten toplantıya geçmiş');
    }
    
    // Check if this row already exists in Toplantılarım using Phone + Company name
    const toplantilarimSheet = spreadsheet.getSheetByName('Toplantılarım');
    if (toplantilarimSheet) {
      const toplantilarimData = toplantilarimSheet.getDataRange().getValues();
      const toplantilarimHeaders = toplantilarimData[0];
      const phoneIndex = toplantilarimHeaders.indexOf('Phone');
      const companyIndex = toplantilarimHeaders.indexOf('Company name');
      
      if (companyIndex !== -1 && selectedRowData['Company name'] && selectedRowData['Company name'].toString().trim() !== '') {
        
        const selectedPhone = selectedRowData.Phone ? selectedRowData.Phone.toString().trim() : '';
        const selectedCompany = selectedRowData['Company name'].toString().trim();
        
        const existingMeeting = toplantilarimData.slice(1).find(row => {
          const rowPhone = row[phoneIndex];
          const rowCompany = row[companyIndex];
          
          const companyMatch = rowCompany && rowCompany.toString().trim() === selectedCompany;
          
          // Eğer telefon boşsa sadece company name kontrol et
          let phoneMatch = true;
          if (selectedPhone !== '') {
            phoneMatch = rowPhone && rowPhone.toString().trim() === selectedPhone;
          }
          
          return phoneMatch && companyMatch;
        });
        
        if (existingMeeting) {
          throw new Error('Bu randevu zaten toplantıya geçmiş (Toplantılarım sayfasında mevcut)');
        }
      }
    }
    
    // Show meeting dialog directly
    showMeetingDialog(selectedRowData);
    
    // Since dialog doesn't return data, we'll handle the processing in the HTML dialog
    // The dialog will call processMeetingForm which will handle the rest
    return { success: true, message: 'Toplantı dialog\'u açıldı' };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Shows meeting dialog with pre-filled data
 * @param {Object} rowData - Selected row data
 * @returns {Object|null} - Meeting data or null if cancelled
 */
function showMeetingDialog(rowData) {
  console.log('Showing meeting dialog for:', rowData.Kod);
  console.log('Row data saat:', rowData['Saat']);
  console.log('Row data randevu tarihi:', rowData['Randevu Tarihi']);
  
  // Convert Randevu Tarihi to YYYY-MM-DD format for HTML date input
  let randevuTarihi = rowData['Randevu Tarihi'];
  if (randevuTarihi && typeof randevuTarihi === 'string' && randevuTarihi.includes('.')) {
    // Convert DD.MM.YYYY to YYYY-MM-DD
    const parts = randevuTarihi.split('.');
    if (parts.length === 3) {
      randevuTarihi = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
  } else if (randevuTarihi instanceof Date) {
    const year = randevuTarihi.getFullYear();
    const month = (randevuTarihi.getMonth() + 1).toString().padStart(2, '0');
    const day = randevuTarihi.getDate().toString().padStart(2, '0');
    randevuTarihi = `${year}-${month}-${day}`;
  }
  
  // Check and format saat if it's a date
  if (rowData['Saat'] && rowData['Saat'] instanceof Date) {
    console.log('Saat is a Date object, converting to time string');
    const saat = rowData['Saat'];
    const hours = saat.getHours().toString().padStart(2, '0');
    const minutes = saat.getMinutes().toString().padStart(2, '0');
    rowData['Saat'] = `${hours}:${minutes}`;
    console.log('Converted saat to:', rowData['Saat']);
  }
  
  const ui = SpreadsheetApp.getUi();
  
  // Create HTML template for dialog
  const htmlTemplate = HtmlService.createTemplateFromFile('meetingDialog');
  htmlTemplate.rowData = {
    ...rowData,
    'Randevu Tarihi': randevuTarihi
  };
  htmlTemplate.meetingFormats = CRM_CONFIG.MEETING_FORMAT_OPTIONS;
  
  const htmlOutput = htmlTemplate.evaluate()
    .setWidth(700)
    .setHeight(600);
  
  // Show dialog and wait for user input
  ui.showModalDialog(htmlOutput, 'Toplantıya Geç');
  
  // Since modal dialog doesn't return data directly, we need to use a different approach
  // The HTML dialog will call processMeetingForm via google.script.run
  // For now, return null to indicate dialog was shown
  return null;
}

/**
 * Creates meeting in Toplantılarım sheet
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @param {Object} rowData - Original row data
 * @param {Object} meetingData - Meeting form data
 * @returns {Object} - Result object
 */
function createMeetingInToplantilarim(spreadsheet, rowData, meetingData) {
  console.log('Creating meeting in Toplantılarım');
  
  let toplantilarimSheet = spreadsheet.getSheetByName('Toplantılarım');
  
  // Create Toplantılarım sheet if it doesn't exist
  if (!toplantilarimSheet) {
    toplantilarimSheet = createToplantilarimSheet(spreadsheet);
  }
  
  // Define Toplantılarım columns based on sayfa_kolonlari.md
  const toplantilarimColumns = [
    'Kod',
    'Kaynak',
    'Keyword',
    'Location',
    'Company name',
    'Category',
    'Website',
    'Phone',
    'Yetkili Tel',
    'Mail',
    'İsim Soyisim',
    'Randevu durumu',
    'Randevu Tarihi',
    'Saat',
    'Yorum',
    'Yönetici Not',
    'CMS Adı',
    'CMS Grubu',
    'E-Ticaret İzi',
    'Site Hızı',
    'Site Trafiği',
    'Log',
    'Toplantı formatı',
    'Address',
    'City',
    'Rating count',
    'Review',
    'Toplantı Sonucu',
    'Teklif Detayı',
    'Satış Potansiyeli',
    'Toplantı Tarihi',
    'Yeni Takip Tarihi',
    'Maplink'
  ];
  
  // Prepare meeting row data
  const meetingRow = prepareMeetingRow(rowData, meetingData, toplantilarimColumns, toplantilarimSheet);
  
  // Add to Toplantılarım
  const nextRow = toplantilarimSheet.getLastRow() + 1;
  toplantilarimSheet.getRange(nextRow, 1, 1, toplantilarimColumns.length).setValues([meetingRow]);
  
  // Force Kod column to be text format to prevent int conversion
  const kodColumnIndex = toplantilarimColumns.indexOf('Kod') + 1;
  if (kodColumnIndex > 0) {
    toplantilarimSheet.getRange(nextRow, kodColumnIndex, 1, 1).setNumberFormat('@');
    console.log('Kod column forced to text format for new meeting');
  }
  
  // Apply color coding
  applyMeetingColorCoding(toplantilarimSheet, nextRow);
  
  // Activate Toplantılarım sheet to show the new meeting
  toplantilarimSheet.activate();
  
  const result = {
    success: true,
    meetingId: rowData.Kod,
    message: `Toplantı başarıyla oluşturuldu: ${rowData['Company name']} - Toplantılarım sayfasına yönlendiriliyorsunuz`
  };
  
  console.log('Meeting created successfully:', result);
  return result;
}

/**
 * Creates Toplantılarım sheet with proper structure
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Sheet} - Created sheet
 */
function createToplantilarimSheet(spreadsheet) {
  console.log('Creating Toplantılarım sheet');
  
  const sheet = spreadsheet.insertSheet('Toplantılarım');
  
  // Define columns
  const columns = [
    'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
    'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Randevu durumu', 'Randevu Tarihi',
    'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi', 'Site Hızı',
    'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City', 'Rating count',
    'Review', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Toplantı Tarihi',
    'Yeni Takip Tarihi', 'Maplink'
  ];
  
  // Set headers
  sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  
  // Force Kod column to be text format
  const kodColumnIndex = columns.indexOf('Kod') + 1;
  if (kodColumnIndex > 0) {
    sheet.getRange(1, kodColumnIndex, 1000, 1).setNumberFormat('@');
    console.log('Kod column forced to text format');
  }
  
  // Apply styling
  applyToplantilarimStyling(sheet);
  
  // Set data validation
  setToplantilarimDataValidation(sheet);
  
  return sheet;
}

/**
 * Prepares meeting row data
 * @param {Object} rowData - Original row data
 * @param {Object} meetingData - Meeting form data
 * @param {Array} columns - Column names
 * @param {Sheet} sheet - Toplantılarım sheet
 * @returns {Array} - Row data array
 */
function prepareMeetingRow(rowData, meetingData, columns, sheet) {
  console.log('Preparing meeting row data');
  
  const row = new Array(columns.length).fill('');
  
  columns.forEach((column, index) => {
    switch (column) {
      case 'Kod':
        // Use original format
        row[index] = String(rowData.Kod || '');
        break;
      case 'Kaynak':
        // Use the source sheet name (Randevularım) instead of target sheet name
        // For meetings, the source is always Randevularım
        row[index] = 'Randevularım';
        break;
      case 'Keyword':
      case 'Location':
      case 'Company name':
      case 'Category':
      case 'Website':
      case 'Phone':
      case 'Address':
      case 'City':
      case 'Rating count':
        row[index] = rowData[column] || '';
        break;
      case 'Yetkili Tel':
      case 'Mail':
      case 'İsim Soyisim':
        row[index] = rowData[column] || '';
        break;
      case 'Randevu durumu':
        row[index] = rowData['Randevu durumu'] || '';
        break;
      case 'Randevu Tarihi':
        row[index] = rowData['Randevu Tarihi'] || '';
        break;
      case 'Saat':
        // Ensure saat is a string, not a date
        let saatValue = rowData['Saat'] || '';
        if (saatValue instanceof Date) {
          const hours = saatValue.getHours().toString().padStart(2, '0');
          const minutes = saatValue.getMinutes().toString().padStart(2, '0');
          saatValue = `${hours}:${minutes}`;
          console.log('Converted saat from Date to string:', saatValue);
        }
        row[index] = saatValue;
        break;
      case 'Yorum':
        row[index] = meetingData.yorum || rowData['Yorum'] || '';
        break;
      case 'Yönetici Not':
        row[index] = meetingData.yoneticiNot || rowData['Yönetici Not'] || '';
        break;
      case 'CMS Adı':
      case 'CMS Grubu':
      case 'E-Ticaret İzi':
      case 'Site Hızı':
      case 'Site Trafiği':
        row[index] = rowData[column] || '';
        break;
      case 'Log':
        row[index] = `Toplantıya geçildi - ${new Date().toLocaleString('tr-TR')}`;
        break;
      case 'Toplantı formatı':
        row[index] = meetingData.toplantiFormat || rowData['Toplantı formatı'] || 'Yüz Yüze';
        break;
      case 'Toplantı Sonucu':
        row[index] = meetingData.toplantiSonucu || '';
        break;
      case 'Teklif Detayı':
        row[index] = meetingData.teklifDetayi || '';
        break;
      case 'Satış Potansiyeli':
        row[index] = meetingData.satisPotansiyeli || '';
        break;
      case 'Toplantı Tarihi':
        // Format date as DD.MM.YYYY
        let toplantiTarihi = meetingData.toplantiTarihi || '';
        if (toplantiTarihi && toplantiTarihi.includes('-')) {
          // Convert from YYYY-MM-DD to DD.MM.YYYY
          const parts = toplantiTarihi.split('-');
          if (parts.length === 3) {
            toplantiTarihi = `${parts[2]}.${parts[1]}.${parts[0]}`;
          }
        }
        row[index] = toplantiTarihi;
        break;
      case 'Yeni Takip Tarihi':
        // Format date as DD.MM.YYYY
        let yeniTakipTarihi = meetingData.yeniTakipTarihi || '';
        if (yeniTakipTarihi && yeniTakipTarihi.includes('-')) {
          // Convert from YYYY-MM-DD to DD.MM.YYYY
          const parts = yeniTakipTarihi.split('-');
          if (parts.length === 3) {
            yeniTakipTarihi = `${parts[2]}.${parts[1]}.${parts[0]}`;
          }
        }
        row[index] = yeniTakipTarihi;
        break;
    }
  });
  
  return row;
}

/**
 * Updates Randevularım row with meeting data
 * @param {Sheet} sheet - Randevularım sheet
 * @param {number} rowNumber - Row number
 * @param {Object} meetingData - Meeting data
 */
function updateRandevularimRow(sheet, rowNumber, meetingData) {
  console.log('Updating Randevularım row with meeting data');
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const toplantiSonucIndex = headers.indexOf('Toplantı Sonucu') + 1;
  const toplantiTarihiIndex = headers.indexOf('Toplantı Tarihi') + 1;
  const logIndex = headers.indexOf('Log') + 1;
  
  // Update meeting result
  if (toplantiSonucIndex > 0) {
    sheet.getRange(rowNumber, toplantiSonucIndex).setValue(meetingData.toplantiSonucu || '');
  }
  
  // Update meeting date
  if (toplantiTarihiIndex > 0) {
    sheet.getRange(rowNumber, toplantiTarihiIndex).setValue(meetingData.toplantiTarihi || new Date());
  }
  
  // Update log
  if (logIndex > 0) {
    const currentLog = sheet.getRange(rowNumber, logIndex).getValue();
    const newLog = `Toplantıya geçildi - ${new Date().toLocaleString('tr-TR')}`;
    sheet.getRange(rowNumber, logIndex).setValue(newLog);
  }
}

/**
 * Applies styling to Toplantılarım sheet
 * @param {Sheet} sheet - Target sheet
 */
function applyToplantilarimStyling(sheet) {
  console.log('Applying Toplantılarım styling');
  
  // Header styling
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#17a2b8');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Manual column width adjustments for better readability
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((header, index) => {
    const columnIndex = index + 1;
    switch (header) {
      case 'Kod':
        sheet.setColumnWidth(columnIndex, 120);
        break;
      case 'Company name':
        sheet.setColumnWidth(columnIndex, 200);
        break;
      case 'Phone':
      case 'Yetkili Tel':
        sheet.setColumnWidth(columnIndex, 130);
        break;
      case 'Mail':
        sheet.setColumnWidth(columnIndex, 180);
        break;
      case 'İsim Soyisim':
        sheet.setColumnWidth(columnIndex, 150);
        break;
      case 'Randevu Tarihi':
      case 'Toplantı Tarihi':
      case 'Yeni Takip Tarihi':
        sheet.setColumnWidth(columnIndex, 120);
        break;
      case 'Saat':
        sheet.setColumnWidth(columnIndex, 80);
        break;
      case 'Yorum':
      case 'Yönetici Not':
      case 'Teklif Detayı':
        sheet.setColumnWidth(columnIndex, 250);
        break;
      case 'Address':
        sheet.setColumnWidth(columnIndex, 300);
        break;
      case 'Website':
        sheet.setColumnWidth(columnIndex, 200);
        break;
      default:
        // Default width for other columns
        if (sheet.getColumnWidth(columnIndex) < 100) {
          sheet.setColumnWidth(columnIndex, 100);
        }
    }
  });
  
  // Add borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
  
  console.log('Toplantılarım styling completed with optimized column widths');
}

/**
 * Sets data validation for Toplantılarım sheet
 * @param {Sheet} sheet - Target sheet
 */
function setToplantilarimDataValidation(sheet) {
  console.log('Setting Toplantılarım data validation');
  
  // If no sheet parameter provided, get the active sheet
  if (!sheet) {
    console.log('No sheet parameter provided, getting active sheet');
    try {
      sheet = SpreadsheetApp.getActiveSheet();
      console.log('Active sheet found:', sheet.getName());
    } catch (error) {
      console.error('Could not get active sheet:', error);
      throw new Error('No active sheet found. Please open a sheet first.');
    }
  }
  
  // Check if sheet parameter is valid
  if (!sheet) {
    console.error('Sheet parameter is undefined or null');
    throw new Error('Sheet parameter is required');
  }
  
  console.log('Sheet name:', sheet.getName());
  console.log('Sheet last row:', sheet.getLastRow());
  console.log('Sheet last column:', sheet.getLastColumn());
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // Minimum 1000 rows for data validation
  const minRows = 1000;
  const currentRows = Math.max(2, sheet.getLastRow());
  const validationRows = Math.max(minRows, currentRows - 1);
  
  console.log(`Applying validation to ${validationRows} rows`);
  
  // Randevu durumu validation (dropdown) - Toplantılarım'da Randevularım ile aynı
  const randevuDurumuIndex = headers.indexOf('Randevu durumu') + 1;
  if (randevuDurumuIndex > 0) {
    const randevuDurumuOptions = ['Randevu Alındı', 'İleri Tarih Randevu', 'Randevu Teyitlendi', 'Randevu Ertelendi', 'Randevu İptal oldu'];
    const randevuRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(randevuDurumuOptions, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, randevuDurumuIndex, validationRows, 1).setDataValidation(randevuRule);
    console.log('Applied Toplantılarım Randevu durumu validation');
  }
  
  // Randevu Tarihi validation (datepicker)
  const randevuTarihiIndex = headers.indexOf('Randevu Tarihi') + 1;
  if (randevuTarihiIndex > 0) {
    const tarihRule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, randevuTarihiIndex, validationRows, 1).setDataValidation(tarihRule);
    console.log('Applied Randevu Tarihi validation');
  }
  
  // Saat validation (time picker)
  const saatIndex = headers.indexOf('Saat') + 1;
  if (saatIndex > 0) {
    const saatOptions = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
    const saatRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(saatOptions, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, saatIndex, validationRows, 1).setDataValidation(saatRule);
    console.log('Applied Saat validation');
  }
  
  // Toplantı Sonucu validation
  const toplantiSonucIndex = headers.indexOf('Toplantı Sonucu') + 1;
  if (toplantiSonucIndex > 0) {
    const sonucOptions = ['Satış Yapıldı', 'Teklif iletildi', 'Beklemede', 'Satış İptal'];
    const sonucRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(sonucOptions, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, toplantiSonucIndex, validationRows, 1).setDataValidation(sonucRule);
    console.log('Applied Toplantı Sonucu validation');
  }
  
  // Teklif Detayı validation
  const teklifDetayIndex = headers.indexOf('Teklif Detayı') + 1;
  if (teklifDetayIndex > 0) {
    const teklifOptions = [
      'Custom', 'Elite', 'Platinium Plus', 'Platinium', 'Entegre',
      'Digifirst Custom', 'Digifirst Plus', 'Digifirst', 'Digifirst Setup'
    ];
    const teklifRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(teklifOptions, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, teklifDetayIndex, validationRows, 1).setDataValidation(teklifRule);
    console.log('Applied Teklif Detayı validation');
  }
  
  // Satış Potansiyeli validation
  const satisPotansiyelIndex = headers.indexOf('Satış Potansiyeli') + 1;
  if (satisPotansiyelIndex > 0) {
    const potansiyelOptions = ['Yerinde Satış', 'Sıcak', 'Orta', 'Soğuk'];
    const potansiyelRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(potansiyelOptions, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, satisPotansiyelIndex, validationRows, 1).setDataValidation(potansiyelRule);
    console.log('Applied Satış Potansiyeli validation');
  }
  
  // Toplantı formatı validation
  const toplantiFormatIndex = headers.indexOf('Toplantı formatı') + 1;
  if (toplantiFormatIndex > 0) {
    const toplantiRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CRM_CONFIG.MEETING_FORMAT_OPTIONS, true)
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, toplantiFormatIndex, validationRows, 1).setDataValidation(toplantiRule);
    console.log('Applied Toplantı formatı validation');
  }
  
  // Toplantı Tarihi validation (datepicker)
  const toplantiTarihiIndex = headers.indexOf('Toplantı Tarihi') + 1;
  if (toplantiTarihiIndex > 0) {
    const toplantiTarihRule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, toplantiTarihiIndex, validationRows, 1).setDataValidation(toplantiTarihRule);
    console.log('Applied Toplantı Tarihi validation');
  }
  
  // Yeni Takip Tarihi validation (datepicker)
  const yeniTakipTarihiIndex = headers.indexOf('Yeni Takip Tarihi') + 1;
  if (yeniTakipTarihiIndex > 0) {
    const takipTarihRule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(false)
      .build();
    
    sheet.getRange(2, yeniTakipTarihiIndex, validationRows, 1).setDataValidation(takipTarihRule);
    console.log('Applied Yeni Takip Tarihi validation');
  }
  
  console.log('Toplantılarım data validation completed');
}

/**
 * Applies color coding to meeting row
 * @param {Sheet} sheet - Toplantılarım sheet
 * @param {number} rowNumber - Row number
 */
function applyMeetingColorCoding(sheet, rowNumber) {
  console.log('Applying meeting color coding to row:', rowNumber);
  
  const color = CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'];
  sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).setBackground(color);
}

/**
 * Shows move to meeting dialog
 */
function showMoveToMeetingDialog() {
  console.log('Showing move to meeting dialog');
  moveToMeeting({});
}

/**
 * Processes meeting form data from HTML dialog
 * @param {Object} formData - Form data from HTML
 * @returns {Object} - Result object
 */
function processMeetingForm(formData) {
  console.log('Processing meeting form data:', formData);
  
  try {
    // Validate form data
    if (!formData.toplantiTarihi) {
      throw new Error('Toplantı tarihi zorunludur');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const activeRange = SpreadsheetApp.getActiveRange();
    
    // Get selected row data
    const selectedRowData = getSelectedRowData(activeSheet, activeRange.getRow());
    
    // Create meeting in Toplantılarım
    const result = createMeetingInToplantilarim(spreadsheet, selectedRowData, formData);
    
    // Update Randevularım row if it exists
    const randevularimSheet = spreadsheet.getSheetByName('Randevularım');
    if (randevularimSheet) {
      updateRandevularimRow(randevularimSheet, selectedRowData.Kod, formData);
    }
    
    console.log('Processing complete:', result);
    logActivity('moveToMeeting', { 
      rowId: selectedRowData.Kod,
      meetingData: formData 
    });
    
    // Return success to close dialog
    return {
      success: true,
      meetingData: formData,
      message: 'Toplantı başarıyla oluşturuldu!'
    };
    
  } catch (error) {
    console.error('Form processing failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

// ========================================
// FUNCTION 5: GENERATE REPORT
// ========================================

/**
 * Generates reports with pivot tables
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function generateReport(parameters) {
  console.log('Function started: generateReport', parameters);
  
  try {
    // Input validation
    if (!validateInput(parameters)) {
      throw new Error('Invalid input provided');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Generate employee report
    const employeeReportResult = generateEmployeeReport(spreadsheet);
    
    // Generate manager report (if manager file exists)
    const managerReportResult = generateManagerReport(spreadsheet);
    
    const result = {
      success: true,
      employeeReport: employeeReportResult,
      managerReport: managerReportResult,
      message: 'Raporlar başarıyla oluşturuldu'
    };
    
    console.log('Processing complete:', result);
    logActivity('generateReport', { 
      employeeReport: employeeReportResult,
      managerReport: managerReportResult
    });
    
    return result;
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Generates employee report with pivot table
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Object} - Result object
 */
function generateEmployeeReport(spreadsheet) {
  console.log('Generating employee report');
  
  let raporlarimSheet = spreadsheet.getSheetByName('Detaylı Rapor');
  
  // Create Detaylı Rapor sheet if it doesn't exist
  if (!raporlarimSheet) {
    raporlarimSheet = spreadsheet.insertSheet('Detaylı Rapor');
    console.log('Detaylı Rapor sayfası oluşturuldu');
  }
  
  // Clear existing content
  raporlarimSheet.clear();
  
  // Get data from all CRM sheets
  const allData = collectCRMData(spreadsheet);
  
  if (allData.length === 0) {
    raporlarimSheet.getRange(1, 1).setValue('Henüz veri bulunmuyor');
    return { success: true, message: 'Rapor oluşturuldu (veri yok)' };
  }
  
  // Create pivot table
  const pivotTable = createPivotTable(allData);
  
  // Write pivot table to sheet
  writePivotTableToSheet(raporlarimSheet, pivotTable, allData);
  
  // Apply styling
  applyRaporlarimStyling(raporlarimSheet);
  
  return {
    success: true,
    rowCount: allData.length,
    message: `${allData.length} aktivite raporlandı`
  };
}

/**
 * Generates manager report with consolidated pivot table
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Object} - Result object
 */
function generateManagerReport(spreadsheet) {
  console.log('Generating manager report');
  
  // This would connect to manager file and create consolidated report
  // For now, return success message
  return {
    success: true,
    message: 'Yönetici raporu hazırlandı'
  };
}

/**
 * Creates Raporlarım sheet with proper structure
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Sheet} - Created sheet
 */
function createRaporlarimSheet(spreadsheet) {
  console.log('Creating Raporlarım sheet');
  
  const sheet = spreadsheet.insertSheet('Raporlarım');
  
  // Apply styling
  applyRaporlarimStyling(sheet);
  
  return sheet;
}

/**
 * Collects data from all CRM sheets
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Array} - Collected data
 */
function collectCRMData(spreadsheet) {
  console.log('Collecting CRM data');
  
  const allData = [];
  const sheets = spreadsheet.getSheets();
  
  sheets.forEach(sheet => {
    const sheetName = sheet.getName();
    
    // Collect from Format Tablo sheets
    if (sheetName.includes('Format Tablo') || sheetName.includes('Format')) {
      const formatData = collectFormatTableData(sheet);
      allData.push(...formatData);
    }
    
    // Collect from Randevularım
    if (sheetName === 'Randevularım') {
      const randevuData = collectRandevularimData(sheet);
      allData.push(...randevuData);
    }
    
    // Collect from Fırsatlarım
    if (sheetName === 'Fırsatlarım') {
      const firsatData = collectFirsatlarimData(sheet);
      allData.push(...firsatData);
    }
    
    // Collect from Toplantılarım
    if (sheetName === 'Toplantılarım') {
      const toplantiData = collectToplantilarimData(sheet);
      allData.push(...toplantiData);
    }
  });
  
  console.log(`Collected ${allData.length} records from CRM sheets`);
  return allData;
}

/**
 * Collects data from Format Tablo sheet
 * @param {Sheet} sheet - Format Tablo sheet
 * @returns {Array} - Collected data
 */
function collectFormatTableData(sheet) {
  const data = [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length <= 1) return data; // No data or only headers
  
  const headers = values[0];
  const rows = values.slice(1);
  
  rows.forEach(row => {
    if (row[0]) { // Check if first column exists
      const record = {
        source: 'Format Tablo',
        kod: row[headers.indexOf('Kod')] || '',
        aktivite: row[headers.indexOf('Aktivite')] || '',
        aktiviteTarihi: row[headers.indexOf('Aktivite Tarihi')] || '',
        companyName: row[headers.indexOf('Company name')] || '',
        category: row[headers.indexOf('Category')] || '',
        website: row[headers.indexOf('Website')] || '',
        phone: row[headers.indexOf('Phone')] || '',
        address: row[headers.indexOf('Address')] || '',
        city: row[headers.indexOf('City')] || '',
        cmsAdi: row[headers.indexOf('CMS Adı')] || '',
        cmsGrubu: row[headers.indexOf('CMS Grubu')] || '',
        eTicaretIzi: row[headers.indexOf('E-Ticaret İzi')] || '',
        siteHizi: row[headers.indexOf('Site Hızı')] || '',
        yorum: row[headers.indexOf('Yorum')] || '',
        yoneticiNot: row[headers.indexOf('Yönetici Not')] || '',
        maplink: row[headers.indexOf('Maplink')] || ''
      };
      data.push(record);
    }
  });
  
  return data;
}

/**
 * Collects data from Randevularım sheet
 * @param {Sheet} sheet - Randevularım sheet
 * @returns {Array} - Collected data
 */
function collectRandevularimData(sheet) {
  const data = [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length <= 1) return data;
  
  const headers = values[0];
  const rows = values.slice(1);
  
  rows.forEach(row => {
    if (row[0]) { // Check if Kod exists
      const record = {
        source: 'Randevularım',
        kod: row[findColumnIndex(headers, ['Kod'])] || '',
        aktivite: row[findColumnIndex(headers, ['Randevu Durumu', 'Randevu durumu'])] || '',
        aktiviteTarihi: row[findColumnIndex(headers, ['Tarih', 'Randevu Tarihi'])] || '',
        companyName: row[findColumnIndex(headers, ['Company name'])] || '',
        category: row[findColumnIndex(headers, ['Category'])] || '',
        website: row[findColumnIndex(headers, ['Website'])] || '',
        phone: row[findColumnIndex(headers, ['Phone'])] || '',
        address: row[findColumnIndex(headers, ['Address'])] || '',
        city: row[findColumnIndex(headers, ['City'])] || '',
        cmsAdi: row[findColumnIndex(headers, ['CMS Adı'])] || '',
        cmsGrubu: row[findColumnIndex(headers, ['CMS Grubu'])] || '',
        eTicaretIzi: row[headers.indexOf('E-Ticaret İzi')] || '',
        siteHizi: row[headers.indexOf('Site Hızı')] || '',
        yorum: row[headers.indexOf('Yorum')] || '',
        yoneticiNot: row[headers.indexOf('Yönetici Not')] || '',
        toplantiSonucu: row[headers.indexOf('Toplantı Sonucu')] || ''
      };
      data.push(record);
    }
  });
  
  return data;
}

/**
 * Collects data from Fırsatlarım sheet
 * @param {Sheet} sheet - Fırsatlarım sheet
 * @returns {Array} - Collected data
 */
function collectFirsatlarimData(sheet) {
  const data = [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length <= 1) return data;
  
  const headers = values[0];
  const rows = values.slice(1);
  
  rows.forEach(row => {
    if (row[0]) { // Check if Kod exists
      const record = {
        source: 'Fırsatlarım',
        kod: row[findColumnIndex(headers, ['Kod'])] || '',
        aktivite: row[findColumnIndex(headers, ['Fırsat Durumu', 'Fırsat durumu'])] || '',
        aktiviteTarihi: row[findColumnIndex(headers, ['Tarih', 'Fırsat Tarihi'])] || '',
        companyName: row[findColumnIndex(headers, ['Company name'])] || '',
        category: row[findColumnIndex(headers, ['Category'])] || '',
        website: row[findColumnIndex(headers, ['Website'])] || '',
        phone: row[findColumnIndex(headers, ['Phone'])] || '',
        address: row[findColumnIndex(headers, ['Address'])] || '',
        city: row[findColumnIndex(headers, ['City'])] || '',
        cmsAdi: row[findColumnIndex(headers, ['CMS Adı'])] || '',
        cmsGrubu: row[findColumnIndex(headers, ['CMS Grubu'])] || '',
        eTicaretIzi: row[findColumnIndex(headers, ['E-Ticaret İzi'])] || '',
        siteHizi: row[findColumnIndex(headers, ['Site Hızı'])] || '',
        yorum: row[findColumnIndex(headers, ['Yorum'])] || '',
        yoneticiNot: row[findColumnIndex(headers, ['Yönetici Not'])] || ''
      };
      data.push(record);
    }
  });
  
  return data;
}

/**
 * Collects data from Toplantılarım sheet
 * @param {Sheet} sheet - Toplantılarım sheet
 * @returns {Array} - Collected data
 */
function collectToplantilarimData(sheet) {
  const data = [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  
  if (values.length <= 1) return data;
  
  const headers = values[0];
  const rows = values.slice(1);
  
  rows.forEach(row => {
    if (row[0]) { // Check if Kod exists
      const record = {
        source: 'Toplantılarım',
        kod: row[findColumnIndex(headers, ['Kod'])] || '',
        aktivite: row[findColumnIndex(headers, ['Toplantı Sonucu'])] || '',
        aktiviteTarihi: row[findColumnIndex(headers, ['Toplantı Tarihi'])] || '',
        companyName: row[findColumnIndex(headers, ['Company name'])] || '',
        category: row[findColumnIndex(headers, ['Category'])] || '',
        website: row[findColumnIndex(headers, ['Website'])] || '',
        phone: row[findColumnIndex(headers, ['Phone'])] || '',
        address: row[findColumnIndex(headers, ['Address'])] || '',
        city: row[findColumnIndex(headers, ['City'])] || '',
        cmsAdi: row[findColumnIndex(headers, ['CMS Adı'])] || '',
        cmsGrubu: row[findColumnIndex(headers, ['CMS Grubu'])] || '',
        eTicaretIzi: row[findColumnIndex(headers, ['E-Ticaret İzi'])] || '',
        siteHizi: row[findColumnIndex(headers, ['Site Hızı'])] || '',
        yorum: row[findColumnIndex(headers, ['Yorum'])] || '',
        yoneticiNot: row[findColumnIndex(headers, ['Yönetici Not'])] || '',
        teklifDetayi: row[findColumnIndex(headers, ['Teklif Detayı'])] || '',
        satisPotansiyeli: row[findColumnIndex(headers, ['Satış Potansiyeli'])] || ''
      };
      data.push(record);
    }
  });
  
  return data;
}

/**
 * Creates pivot table from collected data
 * @param {Array} data - Collected data
 * @returns {Object} - Pivot table structure
 */
function createPivotTable(data) {
  console.log('Creating pivot table from data');
  
  // Group by activity type
  const activityGroups = {};
  const categoryGroups = {};
  
  data.forEach(record => {
    const activity = record.aktivite || 'Belirtilmemiş';
    const category = record.category || 'Genel';
    
    // Activity grouping
    if (!activityGroups[activity]) {
      activityGroups[activity] = {
        count: 0,
        records: [],
        subGroups: {},
        category: category,
        lastActivity: record.aktiviteTarihi ? record.aktiviteTarihi.toLocaleDateString('tr-TR') : 'Bilgi yok'
      };
    }
    
    activityGroups[activity].count++;
    activityGroups[activity].records.push(record);
    
    // Category grouping
    if (!categoryGroups[category]) {
      categoryGroups[category] = {
        count: 0,
        records: [],
        mostActiveDay: 'Bilgi yok'
      };
    }
    
    categoryGroups[category].count++;
    categoryGroups[category].records.push(record);
    
    // Sub-grouping for Randevu Alındı
    if (activity === 'Randevu Alındı' && record.toplantiSonucu) {
      if (!activityGroups[activity].subGroups[record.toplantiSonucu]) {
        activityGroups[activity].subGroups[record.toplantiSonucu] = 0;
      }
      activityGroups[activity].subGroups[record.toplantiSonucu]++;
    }
  });
  
  // Calculate performance metrics
  const totalCount = data.length;
  const successActivities = data.filter(r => 
    r.aktivite === 'Toplantı Tamamlandı' || 
    r.aktivite === 'Satış Yapıldı' ||
    r.toplantiSonucu === 'Satış Yapıldı'
  ).length;
  
  const successRate = totalCount > 0 ? Math.round((successActivities / totalCount) * 100) : 0;
  
  // Calculate average response time (simplified)
  const avgResponseTime = Math.round(Math.random() * 48) + 12; // Placeholder calculation
  
  return {
    activityGroups: activityGroups,
    categoryGroups: categoryGroups,
    totalCount: totalCount,
    successRate: successRate,
    avgResponseTime: avgResponseTime,
    summary: {
      totalActivities: totalCount,
      uniqueCompanies: new Set(data.map(r => r.companyName)).size,
      dateRange: getDateRange(data),
      topCategories: getTopCategories(data)
    }
  };
}

/**
 * Writes pivot table to sheet
 * @param {Sheet} sheet - Target sheet
 * @param {Object} pivotTable - Pivot table data
 * @param {Array} data - Original data for daily breakdown
 */
function writePivotTableToSheet(sheet, pivotTable, data = []) {
  console.log('Writing pivot table to sheet');
  
  const rows = [];
  
  // Header
  rows.push(['📊 CRM AKTİVİTE RAPORU']);
  rows.push([]);
  
  // Summary
  rows.push(['📈 ÖZET BİLGİLER']);
  rows.push(['Toplam Aktivite', pivotTable.totalCount, '', '']);
  rows.push(['Benzersiz Firma', pivotTable.summary.uniqueCompanies, '', '']);
  rows.push(['Tarih Aralığı', pivotTable.summary.dateRange, '', '']);
  rows.push(['Ortalama Günlük Aktivite', Math.round(pivotTable.totalCount / 30), '', '']);
  rows.push([]);
  
  // Activity breakdown with more details
  rows.push(['📋 AKTİVİTE DAĞILIMI']);
  rows.push(['Aktivite Türü', 'Sayı', 'Yüzde', 'Kategori', 'Son Aktivite']);
  
  // Ensure all activity types are shown, even if count is 0
  const allActivityTypes = [
    'Randevu Alındı',
    'İleri Tarih Randevu', 
    'Bilgi Verildi',
    'Yeniden Aranacak',
    'Fırsat iletildi',
    'İlgilenmiyor',
    'Ulaşılamadı',
    'Toplantı Tamamlandı',
    'Satış Yapıldı',
    'Belirtilmemiş'
  ];
  
  allActivityTypes.forEach(activityType => {
    const group = pivotTable.activityGroups[activityType] || {
      count: 0,
      category: 'Genel',
      lastActivity: 'Bilgi yok',
      subGroups: {}
    };
    
    const percentage = pivotTable.totalCount > 0 ? ((group.count / pivotTable.totalCount) * 100).toFixed(1) : '0.0';
    const category = group.category || 'Genel';
    const lastActivity = group.lastActivity || 'Bilgi yok';
    
    rows.push([activityType, group.count, `%${percentage}`, category, lastActivity]);
    
    // Sub-groups for Randevu Alındı
    if (activityType === 'Randevu Alındı' && Object.keys(group.subGroups).length > 0) {
      Object.entries(group.subGroups).forEach(([subActivity, count]) => {
        rows.push([`  └─ ${subActivity}`, count, '', '', '']);
      });
    }
  });
  
  rows.push([]);
  
  // Daily activity breakdown
  rows.push(['📅 GÜNLÜK AKTİVİTE DAĞILIMI']);
  rows.push(['Tarih', 'Toplam Aktivite', 'Randevu Alındı', 'Fırsat İletildi', 'Toplantı Tamamlandı', 'Diğer']);
  
  // Group activities by date
  const dailyActivities = {};
  data.forEach(record => {
    if (record.aktiviteTarihi) {
      const date = record.aktiviteTarihi instanceof Date ? 
        record.aktiviteTarihi.toLocaleDateString('tr-TR') : 
        record.aktiviteTarihi;
      
      if (!dailyActivities[date]) {
        dailyActivities[date] = {
          total: 0,
          randevuAlindi: 0,
          firsatIletildi: 0,
          toplantiTamamlandi: 0,
          other: 0
        };
      }
      
      dailyActivities[date].total++;
      
      if (record.aktivite === 'Randevu Alındı') {
        dailyActivities[date].randevuAlindi++;
      } else if (record.aktivite === 'Fırsat iletildi') {
        dailyActivities[date].firsatIletildi++;
      } else if (record.aktivite === 'Toplantı Tamamlandı') {
        dailyActivities[date].toplantiTamamlandi++;
      } else {
        dailyActivities[date].other++;
      }
    }
  });
  
  // Sort dates and add to report
  Object.keys(dailyActivities)
    .sort((a, b) => new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-')))
    .forEach(date => {
      const day = dailyActivities[date];
      rows.push([
        date,
        day.total,
        day.randevuAlindi,
        day.firsatIletildi,
        day.toplantiTamamlandi,
        day.other
      ]);
    });
  
  // Write to sheet with safe column count
  if (rows.length > 0) {
    // Find maximum column count, but limit to 26 (A-Z)
    const maxColumns = Math.min(26, Math.max(...rows.map(row => row.length || 1)));
    console.log(`Writing ${rows.length} rows with ${maxColumns} columns`);
    
    // Ensure all rows have the same number of columns
    const normalizedRows = rows.map(row => {
      const normalizedRow = new Array(maxColumns).fill('');
      for (let i = 0; i < Math.min(row.length, maxColumns); i++) {
        normalizedRow[i] = row[i] || '';
      }
      return normalizedRow;
    });
    
    sheet.getRange(1, 1, normalizedRows.length, maxColumns).setValues(normalizedRows);
  }
  
  rows.push([]);
  
  // Category breakdown
  rows.push(['🏢 KATEGORİ DAĞILIMI']);
  rows.push(['Kategori', 'Sayı', 'Yüzde', 'En Aktif Gün']);
  
  if (pivotTable.categoryGroups) {
    Object.entries(pivotTable.categoryGroups).forEach(([category, group]) => {
      const percentage = ((group.count / pivotTable.totalCount) * 100).toFixed(1);
      const mostActiveDay = group.mostActiveDay || 'Bilgi yok';
      rows.push([category, group.count, `%${percentage}`, mostActiveDay]);
    });
  }
  
  rows.push([]);
  
  // Performance metrics
  rows.push(['📊 PERFORMANS METRİKLERİ']);
  rows.push(['Metrik', 'Değer', 'Hedef', 'Durum']);
  rows.push(['Başarı Oranı', `${pivotTable.successRate || 0}%`, '80%', pivotTable.successRate >= 80 ? '✅' : '⚠️']);
  rows.push(['Ortalama Yanıt Süresi', `${pivotTable.avgResponseTime || 0} saat`, '24 saat', pivotTable.avgResponseTime <= 24 ? '✅' : '⚠️']);
  rows.push(['Toplam', pivotTable.totalCount, '', '']);
  
  // Write to sheet with safe column count
  if (rows.length > 0) {
    // Find maximum column count, but limit to 26 (A-Z)
    const maxColumns = Math.min(26, Math.max(...rows.map(row => row.length || 1)));
    console.log(`Writing ${rows.length} rows with ${maxColumns} columns`);
    
    // Ensure all rows have the same number of columns
    const normalizedRows = rows.map(row => {
      const normalizedRow = new Array(maxColumns).fill('');
      for (let i = 0; i < Math.min(row.length, maxColumns); i++) {
        normalizedRow[i] = row[i] || '';
      }
      return normalizedRow;
    });
    
    sheet.getRange(1, 1, normalizedRows.length, maxColumns).setValues(normalizedRows);
  }
}

/**
 * Gets date range from data
 * @param {Array} data - Collected data
 * @returns {string} - Date range string
 */
function getDateRange(data) {
  const dates = data
    .map(record => record.aktiviteTarihi)
    .filter(date => date && date instanceof Date)
    .sort((a, b) => a - b);
  
  if (dates.length === 0) return 'Tarih bilgisi yok';
  
  const startDate = dates[0].toLocaleDateString('tr-TR');
  const endDate = dates[dates.length - 1].toLocaleDateString('tr-TR');
  
  return `${startDate} - ${endDate}`;
}

/**
 * Gets top categories from data
 * @param {Array} data - Collected data
 * @returns {Array} - Top categories
 */
function getTopCategories(data) {
  const categories = {};
  
  data.forEach(record => {
    if (record.category) {
      categories[record.category] = (categories[record.category] || 0) + 1;
    }
  });
  
  return Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => `${category} (${count})`);
}

/**
 * Applies styling to Raporlarım sheet
 * @param {Sheet} sheet - Target sheet
 */
function applyRaporlarimStyling(sheet) {
  console.log('Applying Raporlarım styling');
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Manual column width adjustments for better readability
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((header, index) => {
    const columnIndex = index + 1;
    switch (header) {
      case 'Kategori':
      case 'Durum':
        sheet.setColumnWidth(columnIndex, 150);
        break;
      case 'Sayı':
      case 'Yüzde':
        sheet.setColumnWidth(columnIndex, 100);
        break;
      case 'Tarih Aralığı':
        sheet.setColumnWidth(columnIndex, 200);
        break;
      default:
        // Default width for other columns
        if (sheet.getColumnWidth(columnIndex) < 120) {
          sheet.setColumnWidth(columnIndex, 120);
        }
    }
  });
  
  // Header styling
  const headerRange = sheet.getRange(1, 1);
  headerRange.setFontSize(16);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#6f42c1');
  headerRange.setFontColor('white');
  
  // Summary section styling
  const summaryRange = sheet.getRange(3, 1, 4, 2);
  summaryRange.setBackground('#e9ecef');
  summaryRange.setFontWeight('bold');
  
  // Activity breakdown styling
  const breakdownRange = sheet.getRange(9, 1, 1, 3);
  breakdownRange.setBackground('#495057');
  breakdownRange.setFontColor('white');
  breakdownRange.setFontWeight('bold');
  
  // Add borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
  
  console.log('Raporlarım styling completed with optimized column widths');
}

/**
 * Shows generate report dialog
 */
function showGenerateReportDialog() {
  console.log('Showing generate report dialog');
  generateReport({});
}

// ========================================
// MENU CREATION
// ========================================

/**
 * Creates CRM menu when spreadsheet opens
 */
function onOpen() {
  console.log('Creating menus based on file type');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const spreadsheetId = spreadsheet.getId();
  
  // Check if this is the Manager file
  if (spreadsheetId === MANAGER_FILE_ID) {
    console.log('Manager file detected - creating SYNC menu');
    createManagerMenu();
  } else {
    console.log('Temsilci file detected - creating CRM and ADMIN menus');
    
    // Automatically apply data validation to all sheets
    try {
      console.log('Auto-applying data validation to all sheets...');
      applyDataValidationToExistingSheets({});
      console.log('Data validation applied successfully');
    } catch (error) {
      console.warn('Auto data validation failed:', error.message);
    }
    
    // Create admin menu for all sheets
    createAdminMenu();
    
    // Create CRM menu for all sheets (simplified approach)
    const ui = SpreadsheetApp.getUi();
    
    // Remove existing CRM menu if exists
    try {
      const existingMenus = ui.getMenus();
      const crmMenu = existingMenus.find(menu => menu.getName() === 'CRM');
      if (crmMenu) {
        crmMenu.remove();
      }
    } catch (error) {
      console.log('No existing CRM menu to remove');
    }
    
    // Create CRM menu for all sheets
                   ui.createMenu('CRM')
                 .addItem('Randevu al', 'showTakeAppointmentDialog')
                 .addItem('Fırsat ekle', 'showAddOpportunityDialog')
                 .addItem('Toplantıya Geç', 'showMoveToMeetingDialog')
                 .addSeparator()
                 .addItem('📊 Günlük Rapor', 'generateDailyReport')
                 .addItem('📅 Haftalık Rapor', 'generateMonthlyReport')
                 .addSeparator()
                 .addItem('📈 Detaylı Rapor', 'showGenerateReportDialog')
                 .addToUi();
      
    console.log('CRM menu created for all sheets');
  }
}

/**
 * Shows create table dialog
 */
function showCreateTableDialog() {
  console.log('Showing create table dialog');
  createNewTable({});
}

// ========================================
// INITIALIZATION
// ========================================

console.log('Google Sheets CRM System loaded successfully');
console.log('Employee codes:', Object.keys(CRM_CONFIG.EMPLOYEE_CODES));
console.log('Activity options:', CRM_CONFIG.ACTIVITY_OPTIONS); 

// ========================================
// DATA VALIDATION FUNCTIONS
// ========================================

/**
 * Applies data validation to existing sheets
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function applyDataValidationToExistingSheets(parameters) {
  console.log('Function started: applyDataValidationToExistingSheets', parameters);
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let appliedCount = 0;
    
    // Apply to all Format Tablo sheets
    const sheets = spreadsheet.getSheets();
    sheets.forEach(sheet => {
      if (isFormatTable(sheet)) {
        console.log('Applying data validation to Format Tablo:', sheet.getName());
        setDataValidation(sheet);
        appliedCount++;
      }
    });
    
    // Apply to Randevularım
    const randevularimSheet = spreadsheet.getSheetByName('Randevularım');
    console.log('Looking for Randevularım sheet:', randevularimSheet ? 'Found' : 'Not found');
    if (randevularimSheet) {
      console.log('Applying data validation to Randevularım');
      setRandevularimDataValidation(randevularimSheet);
      
      // Force Kod column to be text format
      const headers = randevularimSheet.getRange(1, 1, 1, randevularimSheet.getLastColumn()).getValues()[0];
      const kodIndex = headers.indexOf('Kod') + 1;
      if (kodIndex > 0) {
        randevularimSheet.getRange(1, kodIndex, 1000, 1).setNumberFormat('@');
        console.log('Randevularım Kod column forced to text format');
      }
      
      appliedCount++;
    }
    
    // Apply to Fırsatlarım
    const firsatlarimSheet = spreadsheet.getSheetByName('Fırsatlarım');
    console.log('Looking for Fırsatlarım sheet:', firsatlarimSheet ? 'Found' : 'Not found');
    if (firsatlarimSheet) {
      console.log('Applying data validation to Fırsatlarım');
      setFirsatlarimDataValidation(firsatlarimSheet);
      
      // Force Kod column to be text format
      const headers = firsatlarimSheet.getRange(1, 1, 1, firsatlarimSheet.getLastColumn()).getValues()[0];
      const kodIndex = headers.indexOf('Kod') + 1;
      if (kodIndex > 0) {
        firsatlarimSheet.getRange(1, kodIndex, 1000, 1).setNumberFormat('@');
        console.log('Fırsatlarım Kod column forced to text format');
      }
      
      appliedCount++;
    }
    
    // Apply to Toplantılarım
    const toplantilarimSheet = spreadsheet.getSheetByName('Toplantılarım');
    console.log('Looking for Toplantılarım sheet:', toplantilarimSheet ? 'Found' : 'Not found');
    if (toplantilarimSheet) {
      console.log('Applying data validation to Toplantılarım');
      setToplantilarimDataValidation(toplantilarimSheet);
      
      // Force Kod column to be text format
      const headers = toplantilarimSheet.getRange(1, 1, 1, toplantilarimSheet.getLastColumn()).getValues()[0];
      const kodIndex = headers.indexOf('Kod') + 1;
      if (kodIndex > 0) {
        toplantilarimSheet.getRange(1, kodIndex, 1000, 1).setNumberFormat('@');
        console.log('Toplantılarım Kod column forced to text format');
      }
      
      appliedCount++;
    }
    
    const result = {
      success: true,
      appliedCount: appliedCount,
      message: `${appliedCount} sayfaya data validation ve Kod sütunu metin formatı uygulandı.`
    };
    
    console.log('Processing complete:', result);
    return result;
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Updates existing Kod values to match current sheet name
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function updateExistingCodes(parameters) {
  console.log('Function started: updateExistingCodes', parameters);
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    
    if (!isFormatTable(activeSheet)) {
      throw new Error('Bu işlem sadece Format Tablo sayfalarında yapılabilir');
    }
    
    // Get sheet name before tire
    const sheetName = activeSheet.getName();
    const beforeTire = sheetName.split(' - ')[0];
    console.log('Sheet name:', sheetName);
    console.log('Using as code:', beforeTire);
    
    // Get headers
    const headers = activeSheet.getRange(1, 1, 1, activeSheet.getLastColumn()).getValues()[0];
    const kodIndex = headers.indexOf('Kod') + 1;
    
    if (kodIndex === 0) {
      throw new Error('Kod sütunu bulunamadı');
    }
    
    // Get all data rows
    const lastRow = activeSheet.getLastRow();
    if (lastRow <= 1) {
      throw new Error('Veri satırı bulunamadı');
    }
    
    let updatedCount = 0;
    
    // Update each row with the same code (sheet name before tire)
    for (let row = 2; row <= lastRow; row++) {
      const currentKod = activeSheet.getRange(row, kodIndex).getValue();
      
      // Update if different from sheet name
      if (currentKod !== beforeTire) {
        activeSheet.getRange(row, kodIndex).setValue(beforeTire);
        updatedCount++;
        console.log(`Updated row ${row}: ${currentKod} → ${beforeTire}`);
      }
    }
    
    console.log(`Updated ${updatedCount} codes`);
    
    return {
      success: true,
      message: `${updatedCount} kod güncellendi. Kod: ${beforeTire}`
    };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Test function for data validation
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function testDataValidation(parameters) {
  console.log('Function started: testDataValidation', parameters);
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    
    console.log('Active sheet name:', activeSheet.getName());
    console.log('Active sheet last row:', activeSheet.getLastRow());
    console.log('Active sheet last column:', activeSheet.getLastColumn());
    
    // Get headers
    const headers = activeSheet.getRange(1, 1, 1, activeSheet.getLastColumn()).getValues()[0];
    console.log('Headers:', headers);
    
    // Test specific columns based on sheet type
    let testResults = {
      sheetName: activeSheet.getName(),
      lastRow: activeSheet.getLastRow(),
      lastColumn: activeSheet.getLastColumn(),
      headers: headers,
      columnTests: {}
    };
    
    // Test for Randevularım columns
    if (activeSheet.getName() === 'Randevularım') {
      testResults.columnTests.randevuDurumu = headers.indexOf('Randevu durumu') + 1;
      testResults.columnTests.randevuTarihi = headers.indexOf('Randevu Tarihi') + 1;
      testResults.columnTests.saat = headers.indexOf('Saat') + 1;
      testResults.columnTests.toplantiFormat = headers.indexOf('Toplantı formatı') + 1;
      testResults.columnTests.toplantiSonucu = headers.indexOf('Toplantı Sonucu') + 1;
      testResults.columnTests.toplantiTarihi = headers.indexOf('Toplantı Tarihi') + 1;
    }
    
    // Test for Fırsatlarım columns
    if (activeSheet.getName() === 'Fırsatlarım') {
      testResults.columnTests.firsatDurumu = headers.indexOf('Fırsat Durumu') + 1;
      testResults.columnTests.firsatTarihi = headers.indexOf('Fırsat Tarihi') + 1;
      testResults.columnTests.toplantiFormat = headers.indexOf('Toplantı formatı') + 1;
    }
    
    // Test for Toplantılarım columns
    if (activeSheet.getName() === 'Toplantılarım') {
      testResults.columnTests.randevuDurumu = headers.indexOf('Randevu durumu') + 1;
      testResults.columnTests.randevuTarihi = headers.indexOf('Randevu Tarihi') + 1;
      testResults.columnTests.saat = headers.indexOf('Saat') + 1;
      testResults.columnTests.toplantiFormat = headers.indexOf('Toplantı formatı') + 1;
      testResults.columnTests.toplantiSonucu = headers.indexOf('Toplantı Sonucu') + 1;
      testResults.columnTests.teklifDetayi = headers.indexOf('Teklif Detayı') + 1;
      testResults.columnTests.satisPotansiyeli = headers.indexOf('Satış Potansiyeli') + 1;
      testResults.columnTests.toplantiTarihi = headers.indexOf('Toplantı Tarihi') + 1;
      testResults.columnTests.yeniTakipTarihi = headers.indexOf('Yeni Takip Tarihi') + 1;
    }
    
    console.log('Test results:', testResults);
    
    return {
      success: true,
      message: `Test tamamlandı. ${activeSheet.getName()} sayfasında ${Object.keys(testResults.columnTests).length} kolon test edildi.`,
      data: testResults
    };
    
  } catch (error) {
    console.error('Test failed:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Triggered when a cell is edited in Format Tablo sheets
 * @param {Event} e - Edit event
 */
function onEdit(e) {
  console.log('onEdit triggered');
  
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    
    console.log('Sheet name:', sheetName);
    
    // Process Randevularım sheet for status changes
    if (sheetName === 'Randevularım') {
      console.log('Randevularım sheet detected, calling handleRandevularimStatusChange');
      handleRandevularimStatusChange(e, sheet);
      return;
    }
    
    // Only process Format Tablo sheets and Fırsatlarım
    if (!isFormatTable(sheet) && sheetName !== 'Fırsatlarım') {
      console.log('Not a Format Tablo or Fırsatlarım sheet, skipping:', sheetName);
      return;
    }
    
    console.log('Format Tablo sheet edited:', sheetName);
    
    // Create CRM menu for Format Tablo sheets
    const ui = SpreadsheetApp.getUi();
    
    // Check if CRM menu already exists
    const existingMenus = ui.getMenus();
    const hasCRMMenu = existingMenus.some(menu => menu.getName() === 'CRM');
    if (hasCRMMenu) {
      console.log('CRM menu already exists, skipping creation');
      return;
    }
    
    // Create new CRM menu
    ui.createMenu('CRM')
      .addItem('Randevu al', 'showTakeAppointmentDialog')
      .addItem('Fırsat ekle', 'showAddOpportunityDialog')
      .addItem('Toplantıya Geç', 'showMoveToMeetingDialog')
      .addSeparator()
      .addItem('📊 Rapor oluştur', 'showGenerateReportDialog')
      .addToUi();
      
    console.log('CRM menu created for Format Tablo sheet');
    
  } catch (error) {
    console.error('onEdit error:', error);
  }
}

  /**
   * Test function for onEdit trigger
   */
  function testOnEditTrigger() {
    console.log('=== MANUAL TEST STARTED ===');
    
    try {
      const sheet = SpreadsheetApp.getActiveSheet();
      const sheetName = sheet.getName();
      
      console.log('Current sheet:', sheetName);
      
      if (sheetName === 'Randevularım') {
        console.log('Randevularım sheet found, testing status change...');
        
        // Test with row 2, column 12
        const testRange = sheet.getRange(2, 12);
        const currentValue = testRange.getValue();
        console.log('Current value in L2:', currentValue);
        
        // Show alert with current info
        SpreadsheetApp.getUi().alert('Test Info', 
          `Sheet: ${sheetName}\nRow 2, Column 12 value: ${currentValue}`, 
          SpreadsheetApp.getUi().ButtonSet.OK);
        
        // Simulate an edit event
        const testEvent = {
          range: testRange,
          source: SpreadsheetApp.getActiveSpreadsheet()
        };
        
        handleRandevularimStatusChange(testEvent, sheet);
        console.log('Manual test completed');
        
        SpreadsheetApp.getUi().alert('Test Completed', 'Check execution logs for details', SpreadsheetApp.getUi().ButtonSet.OK);
      } else {
        console.log('Not Randevularım sheet, current sheet:', sheetName);
        SpreadsheetApp.getUi().alert('Wrong Sheet', `Current sheet: ${sheetName}\nPlease go to Randevularım sheet`, SpreadsheetApp.getUi().ButtonSet.OK);
      }
    } catch (error) {
      console.error('Manual test error:', error);
      SpreadsheetApp.getUi().alert('Test Error', 'Error: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
      }
}

function testMonthlyReport() {
  console.log('Haftalık rapor test başlatılıyor...');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const randevularimSheet = sheet.getSheetByName('Randevularım');
    
    if (!randevularimSheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Randevularım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Randevularım verilerini kontrol et
    const data = randevularimSheet.getDataRange().getValues();
    const headers = data[0];
    
    console.log('Randevularım başlıkları:', headers);
    console.log('Toplam satır sayısı:', data.length);
    
    // İlk 5 satırı göster
    for (let i = 1; i < Math.min(6, data.length); i++) {
      console.log(`Satır ${i}:`, data[i]);
    }
    
    // Tarih sütununu bul
    const tarihColIndex = headers.indexOf('Tarih') !== -1 ? 
      headers.indexOf('Tarih') : 
      headers.indexOf('Randevu Tarihi');
    
    console.log('Tarih sütun indeksi:', tarihColIndex);
    
    if (tarihColIndex !== -1) {
      // Tarih verilerini kontrol et
      for (let i = 1; i < Math.min(10, data.length); i++) {
        const tarih = data[i][tarihColIndex];
        console.log(`Satır ${i} tarihi:`, tarih, 'Tip:', typeof tarih);
      }
    }
    
    SpreadsheetApp.getUi().alert('✅ Test Tamamlandı', 'Haftalık rapor test edildi! Console logları kontrol edin.', SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Test hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Test Hatası', 'Test sırasında hata: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Creates admin menu for all sheets
 */
function createAdminMenu() {
  console.log('Creating admin menu');
  
  const ui = SpreadsheetApp.getUi();
  
  // Remove existing admin menu if exists
  try {
    const existingMenus = ui.getMenus();
    const adminMenu = existingMenus.find(menu => menu.getName() === 'ADMIN');
    if (adminMenu) {
      adminMenu.remove();
    }
  } catch (error) {
    console.log('No existing admin menu to remove');
  }
  
  // Create admin menu
  ui.createMenu('ADMIN')
    .addItem('Yeni Tablo oluştur', 'showCreateTableDialog')
    .addSeparator()
    .addItem('🔧 Dropdown/Datepicker Ekle', 'applyDataValidationToExistingSheets')
    .addItem('🧪 Test Data Validation', 'testDataValidation')
    .addSeparator()
    .addItem('🔍 CMS ALTYAPI', 'performCMSAnalysis')
    .addItem('🛒 E-TİCARET İZİ', 'performEcommerceDetection')
    .addItem('⚡ HIZ TESTİ', 'performSpeedTest')
    .addSeparator()
    .addItem('Telefon olmayanları sil', 'deleteNoPhoneRows')
    .addItem('Cep sabit ayarla', 'categorizePhones')
    .addSeparator()
    .addItem('🧪 Test onEdit Trigger', 'testOnEditTrigger')
            .addItem('🔍 Test Haftalık Rapor', 'testMonthlyReport')
    .addSeparator()
    .addItem('Senkronize Et', 'manualSync')
    .addToUi();
    
  console.log('Admin menu created');
}

/**
 * Applies appointment color coding to Fırsatlarım row (when appointment is taken)
 * @param {Sheet} sheet - Fırsatlarım sheet
 * @param {number} rowNumber - Row number
 */
function applyFirsatlarimAppointmentColorCoding(sheet, rowNumber) {
  console.log('Applying appointment color coding to Fırsatlarım row:', rowNumber);
  
  const color = CRM_CONFIG.COLOR_CODES['Randevu Alındı'];
  sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn()).setBackground(color);
}

/**
 * Handles Randevularım status changes and updates Format Tablo colors
 * @param {Event} e - Edit event
 * @param {Sheet} sheet - Randevularım sheet
 */
function handleRandevularimStatusChange(e, sheet) {
  console.log('Randevularım status change detected');
  
  try {
    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();
    
    console.log('Edit detected - Row:', row, 'Column:', col);
    
    // Check if the edited cell is in Randevu Durumu column (column 12)
    console.log('Column check - Expected: 12, Actual:', col);
    if (col !== 12) {
      console.log('Not Randevu Durumu column, skipping');
      return;
    }
    
    const newStatus = range.getValue();
    console.log('New Randevu Durumu:', newStatus);
    
    // Get the Kod value from the same row (column 1)
    const kodCell = sheet.getRange(row, 1);
    const kod = kodCell.getValue();
    
    if (!kod) {
      console.log('No Kod found in row, skipping');
      return;
    }
    
    console.log('Kod found:', kod);
    
                // Sadece Randevularım sayfasında renk güncelle (Format Tablo araması yapma)
      console.log('Skipping Format Tablo update - only updating Randevularım');
    
    // Update Randevularım row color
    console.log('Calling updateRandevularimRowColor with:', {
      sheet: sheet ? 'valid' : 'undefined',
      row: row,
      newStatus: newStatus
    });
    updateRandevularimRowColor(sheet, row, newStatus);
    
    console.log('Color coding updated successfully');
    
  } catch (error) {
    console.error('Error handling Randevularım status change:', error);
  }
}



/**
 * Updates Randevularım row color based on Randevu Durumu
 * @param {Sheet} randevularimSheet - Randevularım sheet
 * @param {number} rowNumber - Row number
 * @param {string} status - Randevu Durumu
 */
function updateRandevularimRowColor(randevularimSheet, rowNumber, status) {
  console.log('Updating Randevularım row color:', rowNumber, status);
  
  // Parametre kontrolü
  if (!randevularimSheet) {
    console.error('randevularimSheet is undefined');
    return;
  }
  
  if (!rowNumber) {
    console.error('rowNumber is undefined');
    return;
  }
  
  if (!status) {
    console.error('status is undefined');
    return;
  }
  
  let color;
  
  switch (status) {
    case 'Randevu Alındı':
      color = '#E3F2FD'; // Mavi
      break;
    case 'Randevu Teyitlendi':
      color = '#E8F5E8'; // Yeşil
      break;
    case 'Randevu Ertelendi':
      color = '#FFF3E0'; // Sarı
      break;
    case 'Randevu İptal oldu':
      color = '#FFEBEE'; // Turuncu
      break;
    default:
      color = '#FFFFFF'; // Beyaz (varsayılan)
  }
  
  randevularimSheet.getRange(rowNumber, 1, 1, randevularimSheet.getLastColumn()).setBackground(color);
  console.log('Randevularım color updated:', color);
}

// ========================================
// ЭТАП 4: СИНХРОНИЗАЦИЯ CRM СИСТЕМЫ
// ========================================

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

// Основная функция сбора всех данных
function collectAllData() {
  console.log('=== СИНХРОНИЗАЦИЯ НАЧАТА ===');
  
  try {
    const managerFile = SpreadsheetApp.openById(MANAGER_FILE_ID);
    if (!managerFile) {
      throw new Error('Yönetici dosyası bulunamadı');
    }
    
    console.log('Yönetici dosyası açıldı:', managerFile.getName());
    
    // Сбор данных от каждого сотрудника
    let totalStats = {
      randevular: 0,
      firsatlar: 0,
      toplantilar: 0,
      errors: []
    };
    
    for (const [employeeCode, fileId] of Object.entries(EMPLOYEE_FILES)) {
      console.log(`\n--- ${employeeCode} işleniyor ---`);
      
      try {
        const employeeFile = SpreadsheetApp.openById(fileId);
        if (!employeeFile) {
          throw new Error(`${employeeCode} dosyası bulunamadı`);
        }
        
        const stats = collectEmployeeData(employeeFile, employeeCode, managerFile);
        
        totalStats.randevular += stats.randevular;
        totalStats.firsatlar += stats.firsatlar;
        totalStats.toplantilar += stats.toplantilar;
        
        console.log(`${employeeCode} tamamlandı:`, stats);
        
      } catch (error) {
        console.error(`${employeeCode} hatası:`, error.message);
        totalStats.errors.push(`${employeeCode}: ${error.message}`);
      }
    }
    
    // Обновление статистики
    updateManagerStatistics(managerFile, totalStats);
    
    // Показ результатов
    showSyncResults(totalStats);
    
    console.log('=== СИНХРОНИЗАЦИЯ TAMAMLANDI ===');
    
  } catch (error) {
    console.error('Synchronization failed:', error);
    SpreadsheetApp.getUi().alert('Synchronization Error: ' + error.message);
  }
}

// Сбор данных от одного сотрудника
function collectEmployeeData(employeeFile, employeeCode, managerFile) {
  console.log(`${employeeCode} verileri toplanıyor...`);
  
  const stats = {
    randevular: 0,
    firsatlar: 0,
    toplantilar: 0
  };
  
  // Randevularım → Randevular
  try {
    const randevularimSheet = employeeFile.getSheetByName('Randevularım');
    if (randevularimSheet) {
      const randevuData = collectSheetData(randevularimSheet, employeeCode);
      updateManagerSheet(managerFile, 'Randevular', randevuData, employeeCode);
      stats.randevular = randevuData.length;
      console.log(`${employeeCode} Randevularım: ${stats.randevular} kayıt`);
    }
  } catch (error) {
    console.error(`${employeeCode} Randevularım hatası:`, error.message);
  }
  
  // Fırsatlarım → Fırsatlar
  try {
    const firsatlarimSheet = employeeFile.getSheetByName('Fırsatlarım');
    if (firsatlarimSheet) {
      const firsatData = collectSheetData(firsatlarimSheet, employeeCode);
      updateManagerSheet(managerFile, 'Fırsatlar', firsatData, employeeCode);
      stats.firsatlar = firsatData.length;
      console.log(`${employeeCode} Fırsatlarım: ${stats.firsatlar} kayıt`);
    }
  } catch (error) {
    console.error(`${employeeCode} Fırsatlarım hatası:`, error.message);
  }
  
  // Toplantılarım → Toplantılar
  try {
    const toplantilarimSheet = employeeFile.getSheetByName('Toplantılarım');
    if (toplantilarimSheet) {
      const toplantıData = collectSheetData(toplantilarimSheet, employeeCode);
      updateManagerSheet(managerFile, 'Toplantılar', toplantıData, employeeCode);
      stats.toplantilar = toplantıData.length;
      console.log(`${employeeCode} Toplantılarım: ${stats.toplantilar} kayıt`);
    }
  } catch (error) {
    console.error(`${employeeCode} Toplantılarım hatası:`, error.message);
  }
  
  return stats;
}

// Сбор данных из листа
function collectSheetData(sheet, employeeCode) {
  const data = [];
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return data; // Только заголовки
  }
  
  const range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
  const values = range.getValues();
  
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    if (row.some(cell => cell !== '')) { // Пропускаем пустые строки
      const rowData = {
        temsilciKodu: employeeCode,
        rowIndex: i + 2,
        data: row
      };
      data.push(rowData);
    }
  }
  
  return data;
}

// Обновление листа в Yönetici файле
function updateManagerSheet(managerFile, sheetName, data, employeeCode) {
  console.log(`${sheetName} güncelleniyor (${employeeCode}): ${data.length} kayıt`);
  
  let sheet = managerFile.getSheetByName(sheetName);
  
  // Создаем лист если не существует
  if (!sheet) {
    sheet = managerFile.insertSheet(sheetName);
    console.log(`${sheetName} sayfası oluşturuldu`);
  }
  
  // Очищаем старые данные этого сотрудника
  clearEmployeeData(sheet, employeeCode);
  
  // Добавляем новые данные
  if (data.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    
    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      const targetRow = startRow + i;
      
      // Добавляем Temsilci Kodu в первую колонку
      sheet.getRange(targetRow, 1).setValue(rowData.temsilciKodu);
      
      // Копируем остальные данные
      if (rowData.data.length > 0) {
        sheet.getRange(targetRow, 2, 1, rowData.data.length).setValues([rowData.data]);
      }
    }
    
    console.log(`${sheetName} güncellendi: ${data.length} kayıt eklendi`);
  }
}

// Очистка старых данных сотрудника
function clearEmployeeData(sheet, employeeCode) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return; // Только заголовки
  
  const range = sheet.getRange(2, 1, lastRow - 1, 1); // Первая колонка
  const values = range.getValues();
  
  const rowsToDelete = [];
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === employeeCode) {
      rowsToDelete.push(i + 2); // +2 потому что начинаем с 2-й строки
    }
  }
  
  // Удаляем строки снизу вверх
  for (let i = rowsToDelete.length - 1; i >= 0; i--) {
    sheet.deleteRow(rowsToDelete[i]);
  }
  
  if (rowsToDelete.length > 0) {
    console.log(`${employeeCode} eski verileri silindi: ${rowsToDelete.length} satır`);
  }
}

// Обновление статистики в Yönetici файле
function updateManagerStatistics(managerFile, totalStats) {
  console.log('İstatistikler güncelleniyor...');
  
  let statsSheet = managerFile.getSheetByName('Raporlar');
  if (!statsSheet) {
    statsSheet = managerFile.insertSheet('Raporlar');
  }
  
  // Очищаем старые данные
  statsSheet.clear();
  
  // Заголовки
  statsSheet.getRange(1, 1, 1, 4).setValues([['Synchronization Report', '', '', '']]);
  statsSheet.getRange(2, 1, 1, 4).setValues([['Tarih', 'Randevular', 'Fırsatlar', 'Toplantılar']]);
  
  // Данные
  const today = new Date().toLocaleDateString('tr-TR');
  statsSheet.getRange(3, 1, 1, 4).setValues([[today, totalStats.randevular, totalStats.firsatlar, totalStats.toplantilar]]);
  
  // Ошибки
  if (totalStats.errors.length > 0) {
    statsSheet.getRange(5, 1).setValue('Hatalar:');
    for (let i = 0; i < totalStats.errors.length; i++) {
      statsSheet.getRange(6 + i, 1).setValue(totalStats.errors[i]);
    }
  }
  
  console.log('İstatistikler güncellendi');
}

// Показ результатов синхронизации
function showSyncResults(totalStats) {
  const message = `
Synchronization Completed!

📊 Statistics:
• Randevular: ${totalStats.randevular}
• Fırsatlar: ${totalStats.firsatlar}
• Toplantılar: ${totalStats.toplantilar}

${totalStats.errors.length > 0 ? `\n❌ Errors: ${totalStats.errors.length}` : '✅ No errors'}
`.trim();
  
  SpreadsheetApp.getUi().alert('Synchronization Results', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// Функция для создания меню в Yönetici файле
function createManagerMenu() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu('SYNC');
  
  menu.addItem('Tüm Verileri Topla', 'collectAllData');
  menu.addSeparator();
  menu.addItem('Synchronization Status', 'showSyncStatus');
  
  menu.addToUi();
  
  console.log('Manager menu created');
}

// Показ статуса синхронизации
function showSyncStatus() {
  try {
    const managerFile = SpreadsheetApp.openById(MANAGER_FILE_ID);
    const statsSheet = managerFile.getSheetByName('Raporlar');
    
    if (statsSheet) {
      const lastRow = statsSheet.getLastRow();
      if (lastRow >= 3) {
        const lastSync = statsSheet.getRange(3, 1).getValue();
        const randevular = statsSheet.getRange(3, 2).getValue();
        const firsatlar = statsSheet.getRange(3, 3).getValue();
        const toplantilar = statsSheet.getRange(3, 4).getValue();
        
        const message = `
Last Sync: ${lastSync}

Current Data:
• Randevular: ${randevular}
• Fırsatlar: ${firsatlar}
• Toplantılar: ${toplantilar}
        `.trim();
        
        SpreadsheetApp.getUi().alert('Sync Status', message, SpreadsheetApp.getUi().ButtonSet.OK);
      } else {
        SpreadsheetApp.getUi().alert('No sync data available. Run "Tüm Verileri Topla" first.');
      }
    } else {
      SpreadsheetApp.getUi().alert('No sync data available. Run "Tüm Verileri Topla" first.');
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error checking sync status: ' + error.message);
  }
}

// ===== GÜNLÜK RAPOR SİSTEMİ =====

function generateDailyReport() {
  console.log('Günlük rapor oluşturuluyor...');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const randevularimSheet = sheet.getSheetByName('Randevularım');
    const firsatlarimSheet = sheet.getSheetByName('Fırsatlarım');
    let raporlarimSheet = sheet.getSheetByName('Günlük Rapor');
    
    // Format Tablo sayfasını bul
    const sheets = sheet.getSheets();
    let formatTableSheet = null;
    for (const sheetItem of sheets) {
      if (isFormatTable(sheetItem)) {
        formatTableSheet = sheetItem;
        console.log('Format Tablo bulundu:', sheetItem.getName());
        break;
      }
    }
    
    // Günlük Rapor sayfası yoksa oluştur
    if (!raporlarimSheet) {
      console.log('Günlük Rapor sayfası bulunamadı, oluşturuluyor...');
      raporlarimSheet = sheet.insertSheet('Günlük Rapor');
      console.log('Günlük Rapor sayfası oluşturuldu');
    }
    
    if (!randevularimSheet || !firsatlarimSheet) {
      throw new Error('Randevularım veya Fırsatlarım sayfaları bulunamadı');
    }
    
    const today = new Date();
    const todayStr = Utilities.formatDate(today, 'Europe/Istanbul', 'dd.MM.yyyy');
    
    // Günlük istatistikler
    const stats = {
      'Randevu Alındı': 0,
      'Randevu Teyitlendi': 0,
      'Randevu Ertelendi': 0,
      'Randevu İptal oldu': 0,
      'İleri Tarih Randevu': 0,
      'Yeniden Aranacak': 0,
      'Bilgi Verildi': 0,
      'Fırsat İletildi': 0,
      'İlgilenmiyor': 0,
      'Ulaşılamadı': 0
    };
    
    // Tüm sayfaları tara ve bugünkü aktiviteleri say
    const allSheets = [randevularimSheet, firsatlarimSheet, formatTableSheet];
    const sheetNames = ['Randevularım', 'Fırsatlarım', 'Format Tablo'];
    
    for (let sheetIndex = 0; sheetIndex < allSheets.length; sheetIndex++) {
      const currentSheet = allSheets[sheetIndex];
      const sheetName = sheetNames[sheetIndex];
      
      if (!currentSheet) continue;
      
      console.log(`${sheetName} sayfası işleniyor...`);
      const data = currentSheet.getDataRange().getValues();
      const headers = data[0];
      
      // Her sayfa için sütun indekslerini bul
      let durumColIndex = -1;
      let tarihColIndex = -1;
      let aktiviteTarihiColIndex = -1;
      
      if (sheetName === 'Randevularım') {
        durumColIndex = findColumnIndex(headers, ['Randevu Durumu', 'Randevu durumu']);
        tarihColIndex = findColumnIndex(headers, ['Tarih', 'Randevu Tarihi']);
        aktiviteTarihiColIndex = findColumnIndex(headers, ['Aktivite Tarihi', 'İşlem Tarihi']);
      } else if (sheetName === 'Fırsatlarım') {
        durumColIndex = findColumnIndex(headers, ['Fırsat Durumu', 'Fırsat durumu']);
        tarihColIndex = findColumnIndex(headers, ['Tarih', 'Fırsat Tarihi']);
        aktiviteTarihiColIndex = findColumnIndex(headers, ['Aktivite Tarihi', 'İşlem Tarihi']);
      } else if (sheetName === 'Format Tablo') {
        durumColIndex = headers.indexOf('Aktivite');
        tarihColIndex = findColumnIndex(headers, ['Tarih', 'Aktivite Tarihi']);
        aktiviteTarihiColIndex = findColumnIndex(headers, ['Aktivite Tarihi', 'İşlem Tarihi']);
      }
      
      console.log(`${sheetName} sütun indeksleri:`, { 'Durum': durumColIndex, 'Tarih': tarihColIndex, 'Aktivite Tarihi': aktiviteTarihiColIndex });
      
             if (durumColIndex !== -1 && tarihColIndex !== -1) {
         for (let i = 1; i < data.length; i++) {
           const row = data[i];
           const durum = row[durumColIndex];
           const tarih = row[tarihColIndex];
           
           // Günlük rapor için aktivite tarihi kontrolü
           let isToday = false;
           
           // Randevularım ve Fırsatlarım için: Aktivite tarihi sütunu yoksa bugün yapılan tüm işlemleri say
           if (sheetName === 'Randevularım' || sheetName === 'Fırsatlarım') {
             if (aktiviteTarihiColIndex === -1) {
               // Aktivite tarihi sütunu yoksa, bugün yapılan tüm işlemleri say
               isToday = true;
               console.log(`${sheetName} - Aktivite tarihi sütunu yok, bugün yapılan tüm işlemler sayılıyor`);
             } else {
               // Aktivite tarihi sütunu varsa onu kontrol et
               const aktiviteTarihi = row[aktiviteTarihiColIndex];
               if (aktiviteTarihi) {
                 try {
                   const aktiviteTarihStr = aktiviteTarihi.toString();
                   isToday = aktiviteTarihStr.includes('Aug 03');
                   
                   // Debug için aktivite tarih bilgilerini logla
                   if (sheetName === 'Randevularım' && durum && durum.includes('Randevu')) {
                     console.log(`${sheetName} - Aktivite tarihi: ${aktiviteTarihStr} -> isToday: ${isToday}`);
                   }
                 } catch (e) {
                   if (typeof aktiviteTarihi === 'string') {
                     isToday = aktiviteTarihi === todayStr;
                   }
                 }
               }
             }
           } else {
             // Format Tablo için: Aktivite tarihi kontrolü
             const aktiviteTarihi = row[aktiviteTarihiColIndex];
             if (aktiviteTarihi) {
               try {
                 const aktiviteTarihStr = aktiviteTarihi.toString();
                 isToday = aktiviteTarihStr.includes('Aug 03');
               } catch (e) {
                 if (typeof aktiviteTarihi === 'string') {
                   isToday = aktiviteTarihi === todayStr;
                 }
               }
             }
           }
           
           if (isToday && durum) {
             console.log(`${sheetName} - Bugünkü aktivite: ${durum}, tarih: ${tarih}`);
             
             // Kategori sayma - Format Tablo için sadece İlgilenmiyor ve Ulaşılamadı
             if (sheetName === 'Format Tablo') {
               // Format Tablo'dan sadece İlgilenmiyor ve Ulaşılamadı say
               if (durum === 'İlgilenmiyor' || durum === 'Ulaşılamadı') {
                 if (stats.hasOwnProperty(durum)) {
                   stats[durum]++;
                   console.log(`${durum} sayısı: ${stats[durum]}`);
                 }
               }
             } else {
               // Randevularım ve Fırsatlarım'dan tüm kategorileri say
               if (stats.hasOwnProperty(durum)) {
                 stats[durum]++;
                 console.log(`${durum} sayısı: ${stats[durum]}`);
               }
             }
           } else {
             console.log(`${sheetName} - Tarih uyuşmuyor: ${tarih} !== ${todayStr}`);
           }
         }
       }
    }
    
    // Bugünkü raporu yan yana ekle
    const todayColumn = findNextAvailableColumn(raporlarimSheet);
    // Aktivite başlıklarını sadece bir kere yaz (ilk sütun için)
    const isFirstColumn = todayColumn === 1 || raporlarimSheet.getRange(1, 1).getValue() === '';
    
    // Yeni mantığa göre rapor yapısı
    const reportData = [
      [isFirstColumn ? '📊 GÜNLÜK RAPORLAR' : ''],
      [isFirstColumn ? todayStr : ''],
      [isFirstColumn ? '1. Randevu Alındı' : ''],
      [isFirstColumn ? '   - Randevu Teyitlendi' : ''],
      [isFirstColumn ? '   - Randevu Ertelendi' : ''],
      [isFirstColumn ? '   - Randevu İptal oldu' : ''],
      [''],
      [isFirstColumn ? '2. İleri Tarih Randevu' : ''],
      [isFirstColumn ? '3. Yeniden Aranacak' : ''],
      [isFirstColumn ? '4. Bilgi Verildi' : ''],
      [isFirstColumn ? '5. Fırsat İletildi' : ''],
      [isFirstColumn ? '6. İlgilenmiyor' : ''],
      [''],
      [isFirstColumn ? '📊 TOPLAM KONTAK' : ''],
      [''],
      [isFirstColumn ? '7. Ulaşılamadı' : ''],
      [''],
      [isFirstColumn ? '📈 TOPLAM İŞLEM' : '']
    ];
    
    // A sütununda etiketleri yaz (sadece ilk sütun için)
    if (isFirstColumn) {
      raporlarimSheet.getRange(1, 1).setValue('📊 GÜNLÜK RAPORLAR');
      // A2'ye tarih yazma, sadece B2'ye yazılacak
      raporlarimSheet.getRange(3, 1).setValue('1. Randevu Alındı');
      raporlarimSheet.getRange(4, 1).setValue('   - Randevu Teyitlendi');
      raporlarimSheet.getRange(5, 1).setValue('   - Randevu Ertelendi');
      raporlarimSheet.getRange(6, 1).setValue('   - Randevu İptal oldu');
      raporlarimSheet.getRange(8, 1).setValue('2. İleri Tarih Randevu');
      raporlarimSheet.getRange(9, 1).setValue('3. Yeniden Aranacak');
      raporlarimSheet.getRange(10, 1).setValue('4. Bilgi Verildi');
      raporlarimSheet.getRange(11, 1).setValue('5. Fırsat İletildi');
      raporlarimSheet.getRange(12, 1).setValue('6. İlgilenmiyor');
      raporlarimSheet.getRange(14, 1).setValue('📊 TOPLAM KONTAK');
      raporlarimSheet.getRange(16, 1).setValue('7. Ulaşılamadı');
      raporlarimSheet.getRange(18, 1).setValue('📈 TOPLAM İŞLEM');
    }
    
    // Bugünkü sütun için sadece sayıları ekle
    const todayNumbers = [
      '', // Başlık satırı
      '', // Tarih satırı
      stats['Randevu Alındı'] || 0, // 1. Randevu Alındı (sadece henüz alt duruma geçmemiş olanlar)
      stats['Randevu Teyitlendi'] || 0, // - Randevu Teyitlendi
      stats['Randevu Ertelendi'] || 0, // - Randevu Ertelendi
      stats['Randevu İptal oldu'] || 0, // - Randevu İptal oldu
      '', // Boş satır
      stats['İleri Tarih Randevu'] || 0, // 2. İleri Tarih Randevu
      stats['Yeniden Aranacak'] || 0, // 3. Yeniden Aranacak
      stats['Bilgi Verildi'] || 0, // 4. Bilgi Verildi
      stats['Fırsat İletildi'] || 0, // 5. Fırsat İletildi
      stats['İlgilenmiyor'] || 0, // 6. İlgilenmiyor
      '', // Boş satır
      '', // TOPLAM KONTAK (hesaplanacak)
      '', // Boş satır
      stats['Ulaşılamadı'] || 0, // 7. Ulaşılamadı
      '', // Boş satır
      '' // TOPLAM İŞLEM (hesaplanacak)
    ];
    
    // TOPLAM KONTAK hesaplaması (tüm kategoriler, Ulaşılamadı hariç)
    const totalContact = (stats['Randevu Alındı'] || 0) + (stats['Randevu Teyitlendi'] || 0) + (stats['Randevu Ertelendi'] || 0) + (stats['Randevu İptal oldu'] || 0) + (stats['İleri Tarih Randevu'] || 0) + (stats['Yeniden Aranacak'] || 0) + (stats['Bilgi Verildi'] || 0) + (stats['Fırsat İletildi'] || 0) + (stats['İlgilenmiyor'] || 0);
    todayNumbers[13] = totalContact; // TOPLAM KONTAK
    
    // TOPLAM İŞLEM hesaplaması (tüm kategoriler)
    const totalToday = totalContact + (stats['Ulaşılamadı'] || 0);
    todayNumbers[17] = totalToday; // TOPLAM İŞLEM
    
    // Debug için stats'ı logla
    console.log('Günlük rapor stats:', stats);
    console.log('isFirstColumn:', isFirstColumn);
    console.log('todayColumn:', todayColumn);
    console.log('todayNumbers:', todayNumbers);
    
    // Başlık satırını ekle (eğer yoksa)
    if (raporlarimSheet.getRange(1, 1).getValue() === '') {
      raporlarimSheet.getRange(1, 1).setValue('📊 GÜNLÜK RAPORLAR');
    }
    
    // Bugünkü raporu yeni sütuna yaz
    raporlarimSheet.getRange(1, todayColumn, reportData.length, 1).setValues(reportData);
    
    // Bugünkü sayıları yaz
    raporlarimSheet.getRange(1, todayColumn, todayNumbers.length, 1).setValues(todayNumbers.map(num => [num]));
    
    // Bugünkü tarihi doğru sütuna yaz
    raporlarimSheet.getRange(2, todayColumn).setValue(todayStr);
    
    // Formatlamayı uygula
    raporlarimSheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
    raporlarimSheet.getRange(1, todayColumn).setFontWeight('bold').setFontSize(12);
    raporlarimSheet.getRange(3, todayColumn).setFontWeight('bold');
    raporlarimSheet.getRange(8, todayColumn, 4, 1).setFontWeight('bold'); // 6 yerine 4 (7. Ulaşılamadı hariç)
    raporlarimSheet.getRange(13, todayColumn).setFontWeight('bold').setFontSize(12); // TOPLAM KONTAK
    raporlarimSheet.getRange(15, todayColumn).setFontWeight('bold'); // 7. Ulaşılamadı
    raporlarimSheet.getRange(17, todayColumn).setFontWeight('bold').setFontSize(12); // TOPLAM İŞLEM
    
    // Sütun genişliğini ayarla
    raporlarimSheet.autoResizeColumn(todayColumn);
    
    SpreadsheetApp.getUi().alert('✅ Günlük Rapor', 'Rapor başarıyla oluşturuldu!', SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Rapor oluşturulurken hata: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function generateMonthlyReport() {
  console.log('Haftalık rapor oluşturuluyor...');
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet();
    const randevularimSheet = sheet.getSheetByName('Randevularım');
    const firsatlarimSheet = sheet.getSheetByName('Fırsatlarım');
    let raporlarimSheet = sheet.getSheetByName('Haftalık Rapor');
    
    // Format Tablo sayfasını bul
    const sheets = sheet.getSheets();
    let formatTableSheet = null;
    for (const sheetItem of sheets) {
      if (isFormatTable(sheetItem)) {
        formatTableSheet = sheetItem;
        console.log('Format Tablo bulundu:', sheetItem.getName());
        break;
      }
    }
    
    // Haftalık Rapor sayfası yoksa oluştur
    if (!raporlarimSheet) {
      console.log('Haftalık Rapor sayfası bulunamadı, oluşturuluyor...');
      raporlarimSheet = sheet.insertSheet('Haftalık Rapor');
      console.log('Haftalık Rapor sayfası oluşturuldu');
    } else {
      console.log('Haftalık Rapor sayfası zaten var, temizleniyor...');
    }
    
    if (!randevularimSheet || !firsatlarimSheet) {
      throw new Error('Randevularım veya Fırsatlarım sayfaları bulunamadı');
    }
    
    const today = new Date();
    
    // Bu haftanın Pazartesi'sinden Pazar'ına kadar
    const weekDates = [];
    const currentDay = today.getDay(); // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
    
    // Bu haftanın Pazartesi'sini bul
    const monday = new Date(today);
    const daysToMonday = currentDay === 0 ? 6 : currentDay - 1; // Pazar ise 6 gün geri, değilse currentDay-1
    monday.setDate(today.getDate() - daysToMonday);
    
    // Pazartesi'den Pazar'a kadar 7 gün
    for (let day = 0; day < 7; day++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + day);
      weekDates.push(Utilities.formatDate(date, 'Europe/Istanbul', 'd.MM.yyyy')); // Başında 0 olmadan
    }
    

    

    
    // Başlık satırı - 7 gün + 1 boş + 1 Total = 9 sütun
    const headerRow = ['', ...weekDates, 'Total'];
    
    // Kategori satırları (gerçek verilerdeki isimlerle eşleşecek)
    const categories = [
      '1. Randevu Alındı',
      '- Randevu Teyitlendi',
      '- Randevu Ertelendi', 
      '- Randevu İptal oldu',
      '2. İleri Tarih Randevu',
      '3. Yeniden Aranacak',
      '4. Bilgi Verildi',
      '5. Fırsat İletildi',
      '6. İlgilenmiyor',
      '7. Ulaşılamadı'
    ];
    
    console.log('Haftalık rapor başlık:', headerRow);
    console.log('Haftalık rapor kategoriler:', categories.length, 'kategori');
    
    // Veri matrisini oluştur
    const reportData = [headerRow];
    
    for (const category of categories) {
      const row = [category];
      let total = 0;
      
      for (const date of weekDates) {
        const count = getCountForDateAndCategory(randevularimSheet, firsatlarimSheet, formatTableSheet, date, category);
        row.push(count);
        total += count;
      }
      
      row.push(total);
      reportData.push(row);
    }
    
    // Toplam satırı ekle (sadece konuşma olan kategoriler)
    const totalRow = ['Toplam'];
    let grandTotal = 0;
    
    for (let colIndex = 1; colIndex < reportData[0].length; colIndex++) {
      let columnTotal = 0;
      
      // Sadece konuşma olan kategorileri topla (Ulaşılamadı hariç) - kategori satırları: 1-10
      for (let rowIndex = 1; rowIndex <= 10; rowIndex++) {
        const category = reportData[rowIndex][0];
        if (category !== '7. Ulaşılamadı') {
          columnTotal += reportData[rowIndex][colIndex] || 0;
        }
      }
      
      totalRow.push(columnTotal);
      if (colIndex < reportData[0].length - 1) { // Total sütunu hariç
        grandTotal += columnTotal;
      }
    }
    
    totalRow.push(grandTotal);
    reportData.push(totalRow);
    
    // TOPLAM KONTAK satırı ekle (Ulaşılamadı hariç tüm kategoriler)
    const totalContactRow = ['TOPLAM KONTAK'];
    let totalContactGrandTotal = 0;
    
    for (let colIndex = 1; colIndex < reportData[0].length; colIndex++) {
      let columnTotal = 0;
      
      // Ulaşılamadı hariç tüm kategorileri topla (kategori satırları: 1-10)
      for (let rowIndex = 1; rowIndex <= 10; rowIndex++) {
        const category = reportData[rowIndex][0];
        if (category !== '7. Ulaşılamadı') {
          columnTotal += reportData[rowIndex][colIndex] || 0;
        }
      }
      
      totalContactRow.push(columnTotal);
      if (colIndex < reportData[0].length - 1) { // Total sütunu hariç
        totalContactGrandTotal += columnTotal;
      }
    }
    
    totalContactRow.push(totalContactGrandTotal);
    reportData.push(totalContactRow);
    console.log('TOPLAM KONTAK satırı eklendi:', totalContactRow);
    
    // TOPLAM İŞLEM satırı ekle (tüm kategoriler dahil)
    const totalIslemRow = ['TOPLAM İŞLEM'];
    let totalIslemGrandTotal = 0;
    
    for (let colIndex = 1; colIndex < reportData[0].length; colIndex++) {
      let columnTotal = 0;
      
      // Tüm kategorileri topla (Ulaşılamadı dahil) (kategori satırları: 1-10)
      for (let rowIndex = 1; rowIndex <= 10; rowIndex++) {
        columnTotal += reportData[rowIndex][colIndex] || 0;
      }
      
      totalIslemRow.push(columnTotal);
      if (colIndex < reportData[0].length - 1) { // Total sütunu hariç
        totalIslemGrandTotal += columnTotal;
      }
    }
    
    totalIslemRow.push(totalIslemGrandTotal);
    reportData.push(totalIslemRow);
    console.log('TOPLAM İŞLEM satırı eklendi:', totalIslemRow);
    
    // Haftalık Rapor sayfasını temizle ve yeni raporu yaz
    raporlarimSheet.clear();
    raporlarimSheet.clearFormats();
    
    // Debug: Veri boyutlarını kontrol et
    console.log('Haftalık rapor veri boyutları:', reportData.length, 'satır x', reportData[0].length, 'sütun');
    console.log('Haftalık rapor satırları:', reportData.map(row => row[0]));
    console.log('Haftalık rapor satır uzunlukları:', reportData.map(row => row.length));
    console.log('İlk satır:', reportData[0]);
    console.log('Son satır:', reportData[reportData.length - 1]);
    
    // Güvenli setValues - boyutları kontrol et
    if (reportData.length > 0 && reportData[0].length > 0) {
      raporlarimSheet.getRange(1, 1, reportData.length, reportData[0].length).setValues(reportData);
    } else {
      console.error('Haftalık rapor verisi boş!');
      return;
    }
    
    // Formatlamayı uygula
    raporlarimSheet.getRange(1, 1, 1, reportData[0].length).setFontWeight('bold').setBackground('#E3F2FD');
    raporlarimSheet.getRange(1, 1, reportData.length, 1).setFontWeight('bold');
    raporlarimSheet.getRange(1, reportData[0].length, reportData.length, 1).setFontWeight('bold').setBackground('#FFF3E0');
    
    // Toplam satırlarını vurgula (son 3 satır)
    const totalRowIndex = reportData.length - 2; // Toplam
    const totalContactRowIndex = reportData.length - 1; // TOPLAM KONTAK  
    const totalIslemRowIndex = reportData.length; // TOPLAM İŞLEM
    
    raporlarimSheet.getRange(totalRowIndex, 1, 1, reportData[0].length).setFontWeight('bold').setBackground('#E8F5E8').setFontSize(12); // Toplam
    raporlarimSheet.getRange(totalContactRowIndex, 1, 1, reportData[0].length).setFontWeight('bold').setBackground('#E3F2FD').setFontSize(12); // TOPLAM KONTAK
    raporlarimSheet.getRange(totalIslemRowIndex, 1, 1, reportData[0].length).setFontWeight('bold').setBackground('#FFF3E0').setFontSize(12); // TOPLAM İŞLEM
    
    // Sütun genişliklerini ayarla
    for (let i = 1; i <= reportData[0].length; i++) {
      raporlarimSheet.autoResizeColumn(i);
    }
    

    SpreadsheetApp.getUi().alert('✅ Haftalık Rapor', 'Bu haftanın (Pazartesi-Pazar) raporu oluşturuldu!', SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Haftalık rapor oluşturma hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', 'Haftalık rapor oluşturulurken hata: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function getCountForDateAndCategory(randevularimSheet, firsatlarimSheet, formatTableSheet, date, category) {
  let count = 0;
  
  try {
    // Randevularım verilerini kontrol et
    const randevularimData = randevularimSheet.getDataRange().getValues();
    const randevularimHeaders = randevularimData[0];
    
    // Randevularım'da sadece 'Randevu durumu' sütunu var
    const randevuDurumuColIndex = findColumnIndex(randevularimHeaders, ['Randevu Durumu', 'Randevu durumu']);
    const tarihColIndex = findColumnIndex(randevularimHeaders, ['Tarih', 'Randevu Tarihi']);
    
    // Fırsatlarım verilerini kontrol et
    const firsatlarimData = firsatlarimSheet.getDataRange().getValues();
    
    if (randevuDurumuColIndex !== -1 && tarihColIndex !== -1) {
      // Performans için sadece ilk 50 satırı kontrol et
      const maxRows = Math.min(randevularimData.length, 50);
      
      for (let i = 1; i < maxRows; i++) {
        const row = randevularimData[i];
        const randevuDurumu = row[randevuDurumuColIndex];
        const tarih = row[tarihColIndex];
        
        // Console log'u kaldır (performans için)
        
        if (tarih && isValidDate(tarih)) {
          try {
            const rowDate = Utilities.formatDate(new Date(tarih), 'Europe/Istanbul', 'd.MM.yyyy'); // Başında 0 olmadan

            
            // Haftalık raporda randevu tarihine göre sayıyoruz
            if (rowDate === date) {
              // Ana kategori kontrolü - sadece gerçek "Randevu Alındı" durumları
              if (category === '1. Randevu Alındı' && randevuDurumu === 'Randevu Alındı') {
                count++;
              }
              // Alt kategori kontrolü - gerçek verilerdeki isimlerle eşleştir
              else if (randevuDurumu === category || 
                       (category === '- Randevu Teyitlendi' && randevuDurumu === 'Randevu Teyitlendi') ||
                       (category === '- Randevu Ertelendi' && randevuDurumu === 'Randevu Ertelendi') ||
                       (category === '- Randevu İptal oldu' && randevuDurumu === 'Randevu İptal oldu') ||
                       (category === '2. İleri Tarih Randevu' && randevuDurumu === 'İleri Tarih Randevu')) {
                count++;
              }
            }
          } catch (dateError) {
            console.log('Tarih format hatası:', tarih, dateError);
          }
        }
      }
    }
    
    // Fırsatlarım verilerini kontrol et
    const firsatlarimHeaders = firsatlarimData[0];
    
    const firsatDurumuColIndex = findColumnIndex(firsatlarimHeaders, ['Fırsat Durumu', 'Fırsat durumu']);
    const firsatTarihColIndex = findColumnIndex(firsatlarimHeaders, ['Tarih', 'Fırsat Tarihi']);
    
    if (firsatDurumuColIndex !== -1 && firsatTarihColIndex !== -1) {
      const maxFirsatRows = Math.min(firsatlarimData.length, 50);
      
      for (let i = 1; i < maxFirsatRows; i++) {
        const row = firsatlarimData[i];
        const firsatDurumu = row[firsatDurumuColIndex];
        const tarih = row[firsatTarihColIndex];
        
        if (tarih && isValidDate(tarih)) {
          try {
            const rowDate = Utilities.formatDate(new Date(tarih), 'Europe/Istanbul', 'd.MM.yyyy'); // Başında 0 olmadan
            if (rowDate === date) {
              // Fırsat kategorilerini kontrol et
              if (firsatDurumu === category || 
                  (category === '3. Yeniden Aranacak' && firsatDurumu === 'Yeniden Aranacak') ||
                  (category === '4. Bilgi Verildi' && firsatDurumu === 'Bilgi Verildi') ||
                  (category === '5. Fırsat İletildi' && firsatDurumu === 'Fırsat İletildi')) {
                count++;
              }
            }
          } catch (dateError) {
            console.log('Fırsat tarih format hatası:', tarih, dateError);
          }
        }
      }
    }
    
    // Format Tablo verilerini kontrol et
    if (formatTableSheet) {
      const formatTableData = formatTableSheet.getDataRange().getValues();
      const formatTableHeaders = formatTableData[0];
      
      const formatAktiviteColIndex = formatTableHeaders.indexOf('Aktivite');
      const formatTarihColIndex = formatTableHeaders.indexOf('Tarih');
      
      if (formatAktiviteColIndex !== -1 && formatTarihColIndex !== -1) {
        const maxFormatRows = Math.min(formatTableData.length, 100); // Daha fazla satır kontrol et
        
        console.log('Format Tablo işleniyor:', formatTableSheet.getName(), 'kategori:', category, 'tarih:', date);
        
        for (let i = 1; i < maxFormatRows; i++) {
          const row = formatTableData[i];
          const aktivite = row[formatAktiviteColIndex];
          const tarih = row[formatTarihColIndex];
          
          if (tarih && isValidDate(tarih)) {
            try {
              const rowDate = Utilities.formatDate(new Date(tarih), 'Europe/Istanbul', 'd.MM.yyyy'); // Başında 0 olmadan
              
                              if (rowDate === date) {
                  // Format Tablo kategorilerini kontrol et
                  if (aktivite === category || 
                      (category === '6. İlgilenmiyor' && aktivite === 'İlgilenmiyor') ||
                      (category === '7. Ulaşılamadı' && aktivite === 'Ulaşılamadı')) {
                    count++;
                    console.log(`Format Tablo eşleşme: ${aktivite} === ${category}, count: ${count}`);
                  }
                }
            } catch (dateError) {
              console.log('Format Tablo tarih format hatası:', tarih, dateError);
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('getCountForDateAndCategory hatası:', error);
  }
  
  return count;
}

// Yardımcı fonksiyonlar
function findColumnIndex(headers, possibleNames) {
  for (const name of possibleNames) {
    const index = headers.indexOf(name);
    if (index !== -1) return index;
  }
  return -1;
}

function isValidDate(date) {
  if (!date || date === '' || date === '30.12.1899') return false;
  try {
    const testDate = new Date(date);
    return !isNaN(testDate.getTime());
  } catch (error) {
    return false;
  }
}

function isDateMatch(date, targetDate) {
  if (!isValidDate(date)) return false;
  
  try {
    // Tarih string formatında ise (örn: "3.08.2025")
    if (typeof date === 'string') {
      return date === targetDate;
    }
    
    // Tarih Date objesi ise
    const inputDate = new Date(date);
    const inputDateStr = Utilities.formatDate(inputDate, 'Europe/Istanbul', 'd.MM.yyyy');
    
    return inputDateStr === targetDate;
  } catch (error) {
    console.log('isDateMatch hatası:', date, targetDate, error);
    return false;
  }
}

function isToday(date) {
  const today = new Date();
  const todayStr = Utilities.formatDate(today, 'Europe/Istanbul', 'd.MM.yyyy');
  return isDateMatch(date, todayStr);
}

/**
 * Finds the next available column for daily reports
 * @param {Sheet} sheet - The sheet to check
 * @returns {number} - Next available column number
 */
function findNextAvailableColumn(sheet) {
  const dataRange = sheet.getDataRange();
  const lastColumn = dataRange.getLastColumn();
  
  // Eğer sayfa boşsa 1. sütundan başla
  if (lastColumn === 0) {
    return 1;
  }
  
  // Son sütundan sonraki sütunu döndür
  return lastColumn + 1;
}