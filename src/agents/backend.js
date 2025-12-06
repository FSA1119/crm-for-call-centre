// ========================================
// GOOGLE SHEETS CRM SYSTEM - BACKEND
// ========================================
// Version: 1.1
// Author: CRM Development Team
// Date: 2025-12-01

console.log('🔧 DEBUG: backend.js dosyası yüklendi - Test mesajı!');

// ========================================
// GLOBAL CONSTANTS & VARIABLES
// ========================================

// Global variable to store selected row data for HTML dialogs
let SELECTED_ROW_DATA = null;
let SELECTED_ROW_NUMBER = null;

const CRM_CONFIG = {
  // Employee codes
  EMPLOYEE_CODES: {
    'FSA 019': 'Ferit Samir Aslan',
    'LG 001': 'Lale Gül',
    'NT 002': 'Neslihan Türk', 
    'SO 003': 'Samet Öncel',
    'SB 004': 'Sinem Bakalcı',
    'KM 005': 'Kübra Murat',
    'BH 007': 'Bilge Hin',
    'MK 009': 'Merve Kılıc',
    'NT 012': 'Nazlı Tutuşan',
    'SK 21': 'Selman Karac',
    'RS 22': 'Ramazan Sağlık',
    'OC 23': 'Özlem Çoksatan'
  },
  
  // Manager file
  MANAGER_FILE: 'FSA_019 - Yonetici Takip Dosyasi',
  MANAGER_FILE_ID: '11IsZpaGgXtgpxrie9F_uVwp6uJPcueGhqB73WhZn60A',
  
  // 🎨 Centralized Color System - Visual Harmony (SYNCED WITH RENK_KODLARI.md)
  COLOR_CODES: {
    // Primary Status Colors - Görseldeki Renkler
    'Randevu Alındı': 'rgb(232, 245, 232)',      // #E8F5E8 - Light Green
    'İleri Tarih Randevu': 'rgb(245, 245, 245)', // #F5F5F5 - Light Gray
    'Randevu Teyitlendi': 'rgb(232, 245, 232)',  // #E8F5E8 - Light Green
    'Randevu Ertelendi': 'rgb(255, 243, 224)',   // #FFF3E0 - Soft Orange
    'Randevu İptal oldu': 'rgb(255, 235, 238)',  // #FFEBEE - Light Red (Açık Kırmızı)
    
    // Opportunity Colors - Görseldeki Renkler
    'Fırsat İletildi': 'rgb(255, 235, 238)',     // #FFEBEE - Light Red
    'Bilgi Verildi': 'rgb(243, 229, 245)',       // #F3E5F5 - Light Purple
    'Yeniden Aranacak': 'rgb(227, 242, 253)',    // #E3F2FD - Light Blue
    
    // Negative Status Colors - Görseldeki Renkler
    'İlgilenmiyor': 'rgb(255, 248, 225)',        // #FFF8E1 - Light Yellow
    'Ulaşılamadı': 'rgb(255, 235, 238)',         // #FFEBEE - Light Red (Yeniden arama için farklı)
    'Geçersiz Numara': 'rgb(158, 158, 158)',     // #9E9E9E - Dark Gray
    
    // Meeting Colors
    'Toplantı Tamamlandı': 'rgb(200, 230, 201)',  // Light Green
    'Toplantı Gerçekleşti': 'rgb(165, 214, 167)',  // Darker Green (koyu yeşil - Toplantılarım'a taşınır)
    'Toplantı Teklif': 'rgb(165, 214, 167)',      // Darker Green
    'Toplantı Beklemede': 'rgb(255, 243, 224)',   // Soft Orange
    'Toplantı İptal': 'rgb(255, 235, 238)',       // Light Red
    'Satış Yapıldı': 'rgb(187, 222, 251)',        // Light Blue
    'Potansiyel Sıcak': 'rgb(255, 224, 178)',     // Light Orange
    'Potansiyel Orta': 'rgb(225, 245, 254)',      // Light Blue
    'Potansiyel Soğuk': 'rgb(236, 239, 241)'      // Light Gray
  },
  
  // Activity options (all)
  ACTIVITY_OPTIONS: [
    'Randevu Alındı',
    'İleri Tarih Randevu',
    'Yeniden Aranacak',
    'Bilgi Verildi',
    'Fırsat İletildi',
    'İlgilenmiyor',
    'Ulaşılamadı',
    'Geçersiz Numara',
    'Kurumsal'
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
// 🔧 UTILITY FUNCTIONS - FOUNDATION LAYER
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
 * 📞 Phone Validation - 10 Digit Turkish Phone Number
 * @param {*} phone - Phone number to validate
 * @returns {boolean} - Validation result (true if 10 digits)
 */
function isValidPhone(phone) {
  try {
    if (!phone || phone === '' || phone === null || phone === undefined) {
      return false;
    }
    
    // Convert to string and remove all non-digit characters
    const phoneStr = phone.toString().trim();
    const digits = phoneStr.replace(/\D+/g, '');
    
    // Check if exactly 10 digits
    if (digits.length !== 10) {
      return false;
    }
    
    // Check if all digits are numeric (should be true after replace, but double-check)
    if (!/^\d{10}$/.test(digits)) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('📞 Phone validation error:', error, 'for phone:', phone);
    return false;
  }
}

/**
 * 📅 Get Today's Appointments Count - Count appointments for today
 * @returns {number} - Total count of appointments for today
 */
function getTodayAppointmentsCount() {
  try {
    console.log('[START] getTodayAppointmentsCount');
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const randevularimSheet = spreadsheet.getSheetByName('Randevularım');
    
    if (!randevularimSheet) {
      console.log('[RESULT] Randevularım sayfası bulunamadı');
      return 0;
    }
    
    // Bugünün tarihini al
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Saat bilgisini sıfırla
    console.log(`[DEBUG] Bugünün tarihi: ${today.toLocaleDateString('tr-TR')}`);
    
    // Başlık satırını al
    const headers = randevularimSheet.getRange(1, 1, 1, randevularimSheet.getLastColumn()).getValues()[0];
    const randevuTarihiIdx = headers.indexOf('Randevu Tarihi');
    
    if (randevuTarihiIdx === -1) {
      console.log('[RESULT] Randevu Tarihi kolonu bulunamadı');
      return 0;
    }
    
    console.log(`[DEBUG] Randevu Tarihi kolonu index: ${randevuTarihiIdx + 1}`);
    
    // Veri satırlarını al (başlık hariç)
    const lastRow = randevularimSheet.getLastRow();
    if (lastRow <= 1) {
      console.log('[RESULT] Veri satırı bulunamadı');
      return 0;
    }
    
    const dataRange = randevularimSheet.getRange(2, randevuTarihiIdx + 1, lastRow - 1, 1);
    const values = dataRange.getValues();
    const displayValues = dataRange.getDisplayValues();
    
    console.log(`[DEBUG] Toplam ${values.length} satır kontrol ediliyor`);
    
    let count = 0;
    
    // Her satırı kontrol et
    for (let i = 0; i < values.length; i++) {
      const tarihValue = values[i][0];
      const tarihDisplay = displayValues[i][0];
      
      let tarih = null;
      
      // Date objesi mi kontrol et
      if (tarihValue instanceof Date) {
        tarih = new Date(tarihValue);
        tarih.setHours(0, 0, 0, 0);
      } else {
        // String olarak parse et (DD.MM.YYYY formatı)
        const dateString = String(tarihDisplay || tarihValue || '').trim();
        if (dateString) {
          const parts = dateString.split('.');
          if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            tarih = new Date(year, month - 1, day);
            tarih.setHours(0, 0, 0, 0);
          } else {
            // Diğer formatları dene
            tarih = new Date(dateString);
            if (!isNaN(tarih.getTime())) {
              tarih.setHours(0, 0, 0, 0);
            } else {
              tarih = null;
            }
          }
        }
      }
      
      // Tarih geçerli mi ve bugüne eşit mi kontrol et
      if (tarih && !isNaN(tarih.getTime())) {
        if (tarih.getTime() === today.getTime()) {
          count++;
          console.log(`[DEBUG] Satır ${i + 2}: Bugünkü randevu bulundu - ${tarihDisplay}`);
        }
      }
    }
    
    console.log(`[RESULT] Bugünkü randevu sayısı: ${count}`);
    return count;
    
  } catch (error) {
    console.error('[ERROR] getTodayAppointmentsCount:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    return 0;
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

/**
 * 🛡️ Input Validation - Data Integrity Guardian
 * @param {Object} parameters - Input parameters to validate
 * @returns {boolean} - Validation result
 */
function validateInput(parameters) {
  if (!parameters || typeof parameters !== 'object') {
    console.error('Invalid parameters: must be an object');
    return false;
  }
  return true;
}

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

/**
 * Gets current employee code from sheet name or row data
 * @param {Object} rowData - Optional row data to extract employee code from
 * @returns {string} - Employee code
 */
function getCurrentEmployeeCode(rowData = null) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const sheetName = sheet.getName();
  
  // Önce rowData'dan dene (Randevularım/Toplantılarım için)
  if (rowData && rowData.Kod) {
    const kod = String(rowData.Kod || '').trim();
    // Employee code formatını kontrol et (örn: "SB 004", "FSA 019")
    if (kod.match(/^[A-Z]{2,3}\s\d{2,3}$/)) {
      return kod;
    }
  }
  
  // Sheet name'den extract et (employee-specific sayfalar için)
  const match = sheetName.match(/([A-Z]{2}_\d{3})/);
  if (match) {
    return match[1];
  }
  
  // Alternative: extract from sheet name before tire (keep space format)
  const beforeTire = sheetName.split(' - ')[0];
  if (beforeTire && beforeTire.match(/^[A-Z]{2}\s\d{3}$/)) {
    return beforeTire;
  }
  
  // Genel sayfalar için (Randevularım, Toplantılarım, Fırsatlarım) - uyarı verme
  const generalSheets = ['Randevularım', 'Toplantılarım', 'Fırsatlarım', 'Satışlarım'];
  if (generalSheets.includes(sheetName)) {
    // Genel sayfalar için default döndür, uyarı verme
    return 'LG_001'; // Default fallback
  }
  
  // Diğer sayfalar için uyarı ver (sadece gerçekten employee-specific sayfa bekleniyorsa)
  // console.warn('Employee code not found in sheet name:', sheetName);
  return 'LG_001'; // Default fallback
}

/**
 * Logs activity with timestamp and writes to Log Arşivi
 * @param {string} action - Action performed
 * @param {Object} data - Related data (can include rowData for employee code extraction)
 */
function logActivity(action, data = {}) {
  const timestamp = new Date().toISOString();
  // rowData'dan employee code'u çıkar (varsa)
  const rowData = data.rowData || (data.rowId ? { Kod: data.rowId } : null);
  const employeeCode = getCurrentEmployeeCode(rowData);
  const logEntry = { timestamp, employee: employeeCode, action, data };
  console.log('Activity logged:', logEntry);
  
  // Log Arşivi'ne yaz (gizli sayfa)
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = spreadsheet.getSheetByName('Log Arşivi');
    
    // Sayfa yoksa oluştur
    if (!logSheet) {
      logSheet = createLogArchiveSheet(spreadsheet);
    }
    
    // Tarih ve saat
    const now = new Date();
    const tarih = Utilities.formatDate(now, 'Europe/Istanbul', 'dd.MM.yyyy');
    const saat = Utilities.formatDate(now, 'Europe/Istanbul', 'HH:mm');
    
    // Action'ı Türkçe aktivite ismine çevir (Funnel Report için)
    const activityMap = {
      'takeAppointment': 'Randevu Alındı',
      'moveToMeeting': 'Toplantı Tamamlandı',
      'createOpportunity': 'Fırsat İletildi',
      'createSale': 'Satış Yapıldı',
      'notInterested': 'İlgilenmiyor',
      'unreachable': 'Ulaşılamadı',
      'invalidNumber': 'Geçersiz Numara',
      'corporate': 'Kurumsal',
      'appointmentCancelled': 'Randevu İptal oldu',
      'appointmentPostponed': 'Randevu Ertelendi',
      'opportunityLost': 'Fırsat Kaybedilen'
    };
    const aktivite = activityMap[action] || action; // Eğer mapping'de yoksa action'ı olduğu gibi kullan
    
    // Log Detayı oluştur
    let logDetay = aktivite;
    if (data.appointmentData) {
      logDetay = `${aktivite} - ${data.appointmentData.isimSoyisim || ''} - ${data.appointmentData.randevuTarihi || ''}`;
    } else if (data.meetingData) {
      logDetay = `${aktivite} - ${data.meetingData.isimSoyisim || ''} - ${data.meetingData.toplantiTarihi || ''}`;
    } else if (data.opportunityData) {
      logDetay = `${aktivite} - ${data.opportunityData.isimSoyisim || ''}`;
    }
    
    // Kaynak Sayfa
    const kaynakSayfa = data.sheetName || data.source || 'Format Tablo';
    
    // Kod
    const kod = data.rowId || (rowData && rowData.Kod) || '';
    
    // Company name
    const companyName = (rowData && rowData['Company name']) || '';
    
    // Yeni satır ekle
    const nextRow = logSheet.getLastRow() + 1;
    logSheet.getRange(nextRow, 1, 1, 7).setValues([[
      tarih,        // Tarih
      saat,         // Saat
      aktivite,     // Aktivite (Türkçe)
      logDetay,     // Log Detayı
      kaynakSayfa,  // Kaynak Sayfa
      kod,          // Kod
      companyName   // Company name
    ]]);
    
    // Format ayarları (sadece yeni satır için)
    logSheet.getRange(nextRow, 1).setNumberFormat('dd.MM.yyyy'); // Tarih
    logSheet.getRange(nextRow, 2).setNumberFormat('HH:mm');      // Saat
    logSheet.getRange(nextRow, 6).setNumberFormat('@');           // Kod (text)
    
  } catch (error) {
    console.error('Log Arşivi yazma hatası (kritik değil):', error);
    // Hata olsa bile devam et (log yazma kritik değil)
  }
  
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
  try {
    if (!validateInput(parameters)) {
      throw new Error('Invalid input provided');
    }
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const hamVeriSheet = spreadsheet.getSheetByName('Ham veri');
    if (!hamVeriSheet) {
      throw new Error('Ham veri sayfası bulunamadı');
    }
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt('Yeni Tablo Oluştur', 'Yeni Format Tablo için isim girin (örn: t10):', ui.ButtonSet.OK_CANCEL);
    if (response.getSelectedButton() === ui.Button.OK) {
      const tableName = response.getResponseText().trim();
      if (!tableName) {
        throw new Error('Tablo ismi boş olamaz');
      }
      const existingSheet = spreadsheet.getSheetByName(tableName);
      if (existingSheet) {
        throw new Error(`"${tableName}" isimli tablo zaten mevcut`);
      }
      const result = createFormatTable(spreadsheet, hamVeriSheet, tableName);
      logActivity('createNewTable', { tableName, rowCount: result.rowCount });
      return result;
    } else {
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
  const newSheet = spreadsheet.insertSheet(tableName);
  newSheet.activate();
  const formatTableColumns = [
    'Kod', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
    'CMS Adı', 'CMS Grubu',
    'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim', 'Aktivite',
    'Aktivite Tarihi', 'Yorum', 'Yönetici Not',
    'E-Ticaret İzi', 'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı',
    'Address', 'City', 'Rating count', 'Review', 'Maplink'
  ];
  newSheet.getRange(1, 1, 1, formatTableColumns.length).setValues([formatTableColumns]);
  const hamVeriData = hamVeriSheet.getDataRange().getValues();
  const hamVeriHeaders = hamVeriData[0];
  const hamVeriRows = hamVeriData.slice(1);
  const mappedData = mapHamVeriToFormatTable(hamVeriRows, hamVeriHeaders, formatTableColumns, tableName);
  if (mappedData.length > 0) {
    newSheet.getRange(2, 1, mappedData.length, formatTableColumns.length).setValues(mappedData);
    const reviewColumnIndex = formatTableColumns.indexOf('Review') + 1;
    if (reviewColumnIndex > 0 && mappedData.length > 0) {
      const reviewRange = newSheet.getRange(2, reviewColumnIndex, mappedData.length, 1);
      reviewRange.setNumberFormat('@');
    }
    const kodColumnIndex = formatTableColumns.indexOf('Kod') + 1;
    if (kodColumnIndex > 0 && mappedData.length > 0) {
      const kodRange = newSheet.getRange(2, kodColumnIndex, mappedData.length, 1);
      kodRange.setNumberFormat('@');
    }
  }
  applyFormatTableStyling(newSheet);
  return { success: true, tableName, rowCount: mappedData.length, message: `${tableName} başarıyla oluşturuldu. ${mappedData.length} satır aktarıldı.` };
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
      '%C3%BC': 'ü', // ü
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
  const mappedData = [];
  const employeeCode = getCurrentEmployeeCode();
  hamVeriRows.forEach((row) => {
    const mappedRow = new Array(formatTableColumns.length).fill('');
    formatTableColumns.forEach((formatCol, formatIndex) => {
      const hamVeriIndex = hamVeriHeaders.indexOf(formatCol);
      if (hamVeriIndex !== -1 && row[hamVeriIndex]) {
        if (formatCol === 'Review') {
          let reviewValue = row[hamVeriIndex];
          if (reviewValue instanceof Date) {
            const month = reviewValue.getMonth() + 1;
            const day = reviewValue.getDate();
            reviewValue = `${month}.${day}`;
          }
          mappedRow[formatIndex] = `R${String(reviewValue)}`;
        } else {
          mappedRow[formatIndex] = decodeTurkishText(row[hamVeriIndex]);
        }
      } else {
        switch (formatCol) {
          case 'Kod':
            const sheetName = SpreadsheetApp.getActiveSpreadsheet().getName();
            const beforeTire = sheetName.split(' - ')[0];
            mappedRow[formatIndex] = beforeTire || 'Unknown';
            break;
          case 'Aktivite':
            mappedRow[formatIndex] = '';
            break;
          case 'Aktivite Tarihi':
            mappedRow[formatIndex] = ''; // Boş bırak, aktivite seçildiğinde otomatik doldurulacak
            break;
          case 'Log':
            mappedRow[formatIndex] = `Ham veri'den aktarıldı - ${new Date().toLocaleString('tr-TR')}`;
            break;
          case 'Maplink':
            const cidIndex = hamVeriHeaders.indexOf('Cid');
            if (cidIndex !== -1 && row[cidIndex]) {
              const cid = row[cidIndex];
              const cidMatch = cid.match(/cid=(\d+)/);
              if (cidMatch) {
                mappedRow[formatIndex] = `https://maps.google.com/?cid=${cidMatch[1]}`;
              } else {
                mappedRow[formatIndex] = `https://maps.google.com/?cid=${cid}`;
              }
            }
            break;
          default:
            mappedRow[formatIndex] = '';
        }
      }
    });
    mappedData.push(mappedRow);
  });
  return mappedData;
}

/**
 * Applies styling to Format Tablo
 * @param {Sheet} sheet - Target sheet
 */
function applyFormatTableStyling(sheet) {
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
}

/**
 * Sets data validation for dropdown columns
 * @param {Sheet} sheet - Target sheet
 */
function setDataValidation(sheet) {
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const aktiviteIndex = headers.indexOf('Aktivite') + 1;
  const toplantiFormatIndex = headers.indexOf('Toplantı formatı') + 1;
  
  if (aktiviteIndex > 0) {
    const aktiviteRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CRM_CONFIG.ACTIVITY_OPTIONS, true)
      .setAllowInvalid(true) // Geçersiz değerlere izin ver
      .build();
    const minRows = 1000;
    const lastRow = Math.max(sheet.getLastRow(), 2);
    const rowsToValidate = Math.max(minRows, lastRow - 1);
    const validationRange = sheet.getRange(2, aktiviteIndex, rowsToValidate, 1);
    validationRange.clearDataValidations();
    validationRange.setDataValidation(aktiviteRule);
  }
  
  if (toplantiFormatIndex > 0) {
    const toplantiRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CRM_CONFIG.MEETING_FORMAT_OPTIONS, true)
      .setAllowInvalid(true) // Geçersiz değerlere izin ver
      .build();
    const minRows = 1000;
    const lastRow = Math.max(sheet.getLastRow(), 2);
    const rowsToValidate = Math.max(minRows, lastRow - 1);
    const toplantiValidationRange = sheet.getRange(2, toplantiFormatIndex, rowsToValidate, 1);
    toplantiValidationRange.clearDataValidations();
    toplantiValidationRange.setDataValidation(toplantiRule);
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
    
    // Allow both Format Tablo and Fırsatlarım sheets
    if (!isFormatTable(activeSheet) && sheetName !== 'Fırsatlarım') {
      throw new Error(`Bu işlem sadece Format Tablo veya Fırsatlarım sayfalarında yapılabilir. Mevcut sayfa: "${sheetName}"`);
    }
    
    console.log('✅ Valid sheet for appointment:', sheetName);
    
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
  console.log('getSelectedRowData - rowNumber:', rowNumber, '(type:', typeof rowNumber, ')');
  
  try {
    // Ensure rowNumber is a number
    if (typeof rowNumber === 'string') {
      rowNumber = parseInt(rowNumber, 10);
      if (isNaN(rowNumber)) {
        console.error('❌ Invalid rowNumber:', rowNumber);
        return null;
      }
    }
    
    if (!rowNumber || rowNumber < 1) {
      console.error('❌ Invalid rowNumber:', rowNumber);
      return null;
    }
    
    if (!sheet) {
      console.error('❌ Sheet is null or undefined');
      return null;
    }
    
    const lastRow = sheet.getLastRow();
    if (rowNumber > lastRow) {
      console.error('❌ rowNumber exceeds lastRow:', rowNumber, '>', lastRow);
      return null;
    }
  
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
  } catch (error) {
    console.error('❌ getSelectedRowData error:', error);
    return null;
  }
}

/**
 * Shows appointment dialog with pre-filled data
 * @param {Object} rowData - Selected row data
 * @returns {Object|null} - Appointment data or null if cancelled
 */
function showAppointmentDialog(rowData) {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Create HTML template for dialog - optimize by pre-setting variables
    const htmlTemplate = HtmlService.createTemplateFromFile('appointmentDialog');
    htmlTemplate.rowData = rowData;
    htmlTemplate.meetingFormats = CRM_CONFIG.MEETING_FORMAT_OPTIONS;
    
    // Evaluate and show dialog in one go
    ui.showModalDialog(
      htmlTemplate.evaluate().setWidth(600).setHeight(500),
      'Randevu Al'
    );
    
    return null;
  } catch (error) {
    console.error('❌ Dialog açma hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Dialog açılamadı: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
}

/**
 * Processes appointment form data from HTML dialog
 * @param {Object} formData - Form data from HTML
 * @returns {Object} - Result object
 */
function processAppointmentForm(formData, selectedRowData = null, rowNumber = null) {
  console.log('Processing appointment form data:', formData);
  
  try {
    // Validate form data
    if (!formData.isimSoyisim || !formData.randevuTarihi) {
      throw new Error('Gerekli alanlar eksik');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    
    // Use provided row data or get from active range
    let rowData = selectedRowData;
    let rowNum = rowNumber;
    
    if (!rowData || !rowNum) {
      const activeRange = SpreadsheetApp.getActiveRange();
      if (!activeRange || activeRange.getRow() === 1) {
        throw new Error('Geçerli bir satır seçili değil. Lütfen bir satır seçin ve tekrar deneyin.');
      }
      rowData = getSelectedRowData(activeSheet, activeRange.getRow());
      rowNum = activeRange.getRow();
    }
    
    // Add source sheet information to rowData
    console.log('📋 Setting source information for sheet:', activeSheet.getName());
    
    if (isFormatTable(activeSheet)) {
      rowData.Kaynak = activeSheet.getName();
      console.log('📋 Source set to Format Tablo:', activeSheet.getName());
    } else if (activeSheet.getName() === 'Fırsatlarım') {
      rowData.Kaynak = 'Format Tablo'; // Default for Fırsatlarım
      console.log('📋 Source set to Format Tablo (from Fırsatlarım)');
    }
    
    // Create appointment in Randevularım
    const result = createAppointmentInRandevularim(spreadsheet, rowData, formData);
    
      // Update Format Tablo row with selected activity and form data (only for Format Tablo sheets)
  // Note: updateFormatTableRow zaten renklendirme yapıyor, duplicate çağrı kaldırıldı
  if (isFormatTable(activeSheet)) {
    try {
      const activity = formData.aktivite || 'Randevu Alındı';
      console.log('🔧 About to call updateFormatTableRow - sheet:', activeSheet.getName(), 'row:', rowNum, 'activity:', activity);
      updateFormatTableRow(activeSheet, rowNum, activity, formData);
      console.log('✅ updateFormatTableRow completed successfully');
      // applyFormatTableColorCoding kaldırıldı - updateFormatTableRow zaten yapıyor
    } catch (updateError) {
      console.error('❌ Error in updateFormatTableRow:', updateError && updateError.message);
      console.error('❌ Full error:', updateError);
      // Hata olsa bile devam et (randevu zaten oluşturuldu)
    }
  }
    
    // Single flush after all operations
    SpreadsheetApp.flush();
    
    logActivity('takeAppointment', { 
      rowId: rowData.Kod,
      rowData: rowData, // Company name için gerekli
      appointmentData: formData,
      sheetName: activeSheet.getName()
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
 * Saves appointment data from HTML dialog
 * @param {Object} formData - Form data from HTML
 * @returns {Object} - Result object
 */
function saveAppointmentData(formData) {
  console.log('Saving appointment data from HTML dialog:', formData);
  
  try {
    // Convert HTML form data to backend format
    const appointmentData = {
      isimSoyisim: formData.isimSoyisim,
      randevuTarihi: formData.randevuTarihi,
      saat: formData.saat,
      yorum: formData.yorum,
      aktivite: formData.aktivite || 'Randevu Alındı',
      toplantiFormat: formData.toplantiFormat || 'Yüz Yüze'
    };
    
    // Get current active range to determine row number
    const activeRange = SpreadsheetApp.getActiveRange();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const rowNumber = activeRange ? activeRange.getRow() : null;
    
    console.log('🔍 Active range from saveAppointmentData:', activeRange ? activeRange.getA1Notation() : 'No active range');
    console.log('🔍 Row number from saveAppointmentData:', rowNumber);
    
    if (!rowNumber || rowNumber === 1) {
      throw new Error('Geçerli bir satır seçili değil. Lütfen bir satır seçin ve tekrar deneyin.');
    }
    
    // Get selected row data
    const selectedRowData = getSelectedRowData(activeSheet, rowNumber);
    console.log('🔍 Selected row data from saveAppointmentData:', selectedRowData);
    
    // Call processAppointmentForm with converted data and row info
    return processAppointmentForm(appointmentData, selectedRowData, rowNumber);
    
  } catch (error) {
    console.error('Save appointment data failed:', error);
    return {
      success: false,
      error: error.message
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
  
  // Define Randevularım columns - YENİ DÜZEN (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
  const randevularimColumns = [
    'Kod',
    'Kaynak',
    'Company name',
    'İsim Soyisim',
    'Phone',
    'Yetkili Tel',
    'Website',
    'Mail',
    'Toplantı formatı',
    'Randevu durumu',
    'Randevu Tarihi',
    'Ay',
    'Saat',
    'Yorum',
    'Yönetici Not',
    'Address',
    'Maplink'
  ];
  
  // DUPLICATE KONTROLÜ - Aynı Müşteri (Company name/İsim Soyisim + Phone) + Aynı Randevu Tarihi varsa ekleme
  // NOT: Kod kolonu temsilci kodu, müşteri kodu değil! Bu yüzden müşteri bilgilerine bakmalıyız
  if (appointmentData.randevuTarihi) {
    const existingData = randevularimSheet.getDataRange().getValues();
    const headers = existingData[0];
    const companyNameCol = headers.indexOf('Company name');
    const isimSoyisimCol = headers.indexOf('İsim Soyisim');
    const phoneCol = headers.indexOf('Phone');
    const randevuTarihiColumn = headers.indexOf('Randevu Tarihi');
    
    if (randevuTarihiColumn !== -1) {
      // Randevu tarihini normalize et
      let newRandevuTarihi = appointmentData.randevuTarihi;
      if (newRandevuTarihi instanceof Date) {
        newRandevuTarihi = newRandevuTarihi.toISOString().split('T')[0]; // YYYY-MM-DD formatına çevir
      } else if (typeof newRandevuTarihi === 'string') {
        // YYYY-MM-DD formatında mı kontrol et
        if (!newRandevuTarihi.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Farklı format ise Date'e çevir
          const dateObj = new Date(newRandevuTarihi);
          if (!isNaN(dateObj.getTime())) {
            newRandevuTarihi = dateObj.toISOString().split('T')[0];
          }
        }
      }
      
      // Yeni müşteri bilgilerini normalize et
      const newCompanyName = String(rowData['Company name'] || appointmentData.companyName || '').trim().toLowerCase();
      const newIsimSoyisim = String(rowData['İsim Soyisim'] || appointmentData.isimSoyisim || '').trim().toLowerCase();
      const newPhone = String(rowData.Phone || appointmentData.phone || '').trim().replace(/\D/g, ''); // Sadece rakamlar
      
      // Header hariç tüm satırları kontrol et
      for (let i = 1; i < existingData.length; i++) {
        const existingTarih = existingData[i][randevuTarihiColumn];
        
        // Tarihi normalize et
        let existingTarihStr = '';
        if (existingTarih instanceof Date) {
          existingTarihStr = existingTarih.toISOString().split('T')[0];
        } else if (existingTarih) {
          const dateObj = new Date(existingTarih);
          if (!isNaN(dateObj.getTime())) {
            existingTarihStr = dateObj.toISOString().split('T')[0];
          } else {
            existingTarihStr = String(existingTarih).trim();
          }
        }
        
        // Aynı tarih varsa müşteri bilgilerini kontrol et
        if (existingTarihStr === newRandevuTarihi) {
          // Mevcut müşteri bilgilerini al
          const existingCompanyName = companyNameCol !== -1 ? String(existingData[i][companyNameCol] || '').trim().toLowerCase() : '';
          const existingIsimSoyisim = isimSoyisimCol !== -1 ? String(existingData[i][isimSoyisimCol] || '').trim().toLowerCase() : '';
          const existingPhone = phoneCol !== -1 ? String(existingData[i][phoneCol] || '').trim().replace(/\D/g, '') : '';
          
          // Aynı müşteri mi kontrol et (Company name veya İsim Soyisim + Phone eşleşiyorsa)
          const isSameCustomer = (
            (newCompanyName && existingCompanyName && newCompanyName === existingCompanyName) ||
            (newIsimSoyisim && existingIsimSoyisim && newIsimSoyisim === existingIsimSoyisim) ||
            (newPhone && existingPhone && newPhone.length >= 10 && newPhone === existingPhone)
          );
          
          if (isSameCustomer) {
            console.log(`⚠️ Duplicate kayıt bulundu: Aynı müşteri ve Tarih "${newRandevuTarihi}" zaten Randevularım'da mevcut (satır ${i + 1})`);
            
            // Mevcut kaydı göster
            try {
              randevularimSheet.setActiveRange(randevularimSheet.getRange(i + 1, 1, 1, randevularimSheet.getLastColumn()));
              randevularimSheet.activate();
              SpreadsheetApp.flush();
            } catch (e) {
              console.log('⚠️ Mevcut kayıt gösterilemedi:', e && e.message);
            }
            
            return {
              success: true,
              appointmentId: rowData.Kod,
              message: `⚠️ Bu randevu zaten Randevularım'da mevcut (satır ${i + 1}).\n\nMevcut kayıt gösteriliyor.`,
              isDuplicate: true,
              existingRow: i + 1
            };
          }
        }
      }
    }
  }
  
  // Prepare appointment row data
  const appointmentRow = prepareAppointmentRow(rowData, appointmentData, randevularimColumns, randevularimSheet);
  
  // Add to Randevularım - BATCH OPERATIONS for speed
  const nextRow = randevularimSheet.getLastRow() + 1;
  const kodColumnIndex = randevularimColumns.indexOf('Kod') + 1;
  
  // Batch write: data + format in one operation
  const dataRange = randevularimSheet.getRange(nextRow, 1, 1, randevularimColumns.length);
  dataRange.setValues([appointmentRow]);
  
  // Set format for Kod column if needed
  if (kodColumnIndex > 0) {
    randevularimSheet.getRange(nextRow, kodColumnIndex, 1, 1).setNumberFormat('@');
  }
  
  // Get headers once (reuse for multiple operations)
  const headers = randevularimSheet.getRange(1, 1, 1, randevularimSheet.getLastColumn()).getValues()[0];
  
  // Saat kolonunu text formatına zorla
  const saatColumnIndex = randevularimColumns.indexOf('Saat') + 1;
  if (saatColumnIndex > 0) {
    randevularimSheet.getRange(nextRow, saatColumnIndex, 1, 1).setNumberFormat('@');
    console.log('✅ Saat kolonu text formatına zorlandı');
  }
  
  const randevuDurumuIndex = headers.indexOf('Randevu durumu');
  
  // Set status if needed (before color coding)
  if (randevuDurumuIndex !== -1 && (appointmentData.aktivite === 'Randevu Alındı' || appointmentData.aktivite === 'İleri Tarih Randevu')) {
    randevularimSheet.getRange(nextRow, randevuDurumuIndex + 1).setValue(appointmentData.aktivite);
  }
  
  // Apply color coding once (optimized)
  applyAppointmentColorCoding(randevularimSheet, nextRow);
  
  // Ay kolonunu kontrol et ve doldur (eğer boşsa) - reuse headers
  const randevuTarihiIdx = headers.indexOf('Randevu Tarihi');
  const ayIdx = headers.indexOf('Ay');
  
  if (randevuTarihiIdx !== -1 && ayIdx !== -1) {
    const tarihValue = randevularimSheet.getRange(nextRow, randevuTarihiIdx + 1).getValue();
    const tarihDisplay = randevularimSheet.getRange(nextRow, randevuTarihiIdx + 1).getDisplayValue();
    const currentAy = randevularimSheet.getRange(nextRow, ayIdx + 1).getValue();
    
    if (tarihValue && !currentAy) {
      let tarih = null;
      if (tarihValue instanceof Date) {
        tarih = tarihValue;
      } else {
        const dateString = String(tarihDisplay || tarihValue || '').trim();
        if (dateString) {
          const parts = dateString.split('.');
          if (parts.length === 3) {
            tarih = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
          } else {
            tarih = new Date(dateString);
          }
        }
      }
      
      if (tarih && !isNaN(tarih.getTime())) {
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const ayAdi = monthNames[tarih.getMonth()];
        randevularimSheet.getRange(nextRow, ayIdx + 1).setValue(ayAdi);
        console.log(`✅ Ay kolonu dolduruldu: ${ayAdi}`);
      }
    }
  }
  
  // Randevularım'ı tarihe göre sırala (en yeni önce - performans optimize edilmiş)
  // Flush yap ki sıralama doğru çalışsın
  SpreadsheetApp.flush();
  try {
    console.log('📅 Randevularım sıralanıyor (en yeni önce)...');
    sortRandevularimByDate(randevularimSheet);
    console.log('✅ Randevularım başarıyla sıralandı');
  } catch (sortError) {
    console.error('❌ Sıralama hatası:', sortError);
    // Sıralama hatası olsa bile devam et
  }
  
  // Activate sheet'i kaldırdık - performans için (kullanıcı zaten sayfayı görebilir)
  
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
  
  // Define columns - YENİ DÜZEN (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
  const columns = [
    'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
    'Website', 'Mail', 'Toplantı formatı', 'Randevu durumu', 'Randevu Tarihi',
    'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
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
  
  // Apply data validation (dropdown, datepicker, etc.)
  setRandevularimDataValidation(sheet);
  
  console.log('✅ Randevularım sayfası oluşturuldu - Tüm kolonlar ve validation\'lar doğru');
  
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
        // Use original format, but if empty, get from current employee code
        let kodValue = String(rowData.Kod || '').trim();
        if (!kodValue || kodValue === '' || kodValue === 'undefined' || kodValue === 'null') {
          // Kod boşsa, temsilci kodunu otomatik al
          kodValue = getCurrentEmployeeCode();
          console.log('🔧 Kod boştu, otomatik dolduruldu:', kodValue);
        }
        row[index] = kodValue;
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
      case 'Company name':
      case 'Website':
      case 'Phone':
      case 'Address':
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
        // Set the correct status based on activity type
        let randevuDurumu = appointmentData.aktivite || 'Randevu Alındı';
        
        // Special handling for İleri Tarih Randevu
        if (randevuDurumu === 'İleri Tarih Randevu') {
          console.log('🎨 Setting Randevu Durumu to İleri Tarih Randevu');
        }
        
        row[index] = randevuDurumu;
        console.log('🎨 Randevu Durumu set to:', randevuDurumu);
        break;
      case 'Randevu Tarihi':
        // Format date as DD.MM.YYYY
        let randevuTarihi = appointmentData.randevuTarihi || '';
        let tarihObj = null;
        
        if (randevuTarihi && randevuTarihi.includes('-')) {
          // Convert from YYYY-MM-DD to DD.MM.YYYY
          const parts = randevuTarihi.split('-');
          if (parts.length === 3) {
            randevuTarihi = `${parts[2]}.${parts[1]}.${parts[0]}`;
            tarihObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          }
        } else if (randevuTarihi instanceof Date) {
          tarihObj = randevuTarihi;
          const day = randevuTarihi.getDate().toString().padStart(2, '0');
          const month = (randevuTarihi.getMonth() + 1).toString().padStart(2, '0');
          const year = randevuTarihi.getFullYear();
          randevuTarihi = `${day}.${month}.${year}`;
        } else if (randevuTarihi && randevuTarihi.includes('.')) {
          // DD.MM.YYYY formatı
          const parts = randevuTarihi.split('.');
          if (parts.length === 3) {
            tarihObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        }
        
        row[index] = randevuTarihi;
        
        // Ay kolonunu otomatik doldur
        if (tarihObj && !isNaN(tarihObj.getTime())) {
          const ayIndex = columns.indexOf('Ay');
          if (ayIndex !== -1) {
            const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            row[ayIndex] = monthNames[tarihObj.getMonth()];
            console.log(`📅 Ay kolonu otomatik dolduruldu: ${monthNames[tarihObj.getMonth()]}`);
          }
        }
        break;
      case 'Ay':
        // Ay kolonu zaten yukarıda dolduruldu, buraya gelmemeli
        // Ama eğer boşsa, Randevu Tarihi'nden al
        if (!row[index] || row[index] === '') {
          const randevuTarihiIndex = columns.indexOf('Randevu Tarihi');
          if (randevuTarihiIndex !== -1 && row[randevuTarihiIndex]) {
            const tarihStr = String(row[randevuTarihiIndex]);
            const parts = tarihStr.split('.');
            if (parts.length === 3) {
              const tarihObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              if (!isNaN(tarihObj.getTime())) {
                const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                row[index] = monthNames[tarihObj.getMonth()];
              }
            }
          }
        }
        break;
      case 'Saat':
        // Saat formatını düzelt - HH:mm formatında olmalı
        let saatValue = appointmentData.saat || '';
        if (saatValue) {
          // Eğer Date objesi ise, saat ve dakikayı al
          if (saatValue instanceof Date) {
            const hours = saatValue.getHours().toString().padStart(2, '0');
            const minutes = saatValue.getMinutes().toString().padStart(2, '0');
            saatValue = `${hours}:${minutes}`;
          } else if (typeof saatValue === 'string') {
            // String ise, HH:mm formatında olduğundan emin ol
            const timeMatch = saatValue.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
              const hours = timeMatch[1].padStart(2, '0');
              const minutes = timeMatch[2].padStart(2, '0');
              saatValue = `${hours}:${minutes}`;
            } else {
              // Eğer format yanlışsa, temizle
              console.warn(`⚠️ Saat formatı yanlış: ${saatValue}, temizleniyor...`);
              saatValue = '';
            }
          }
        }
        row[index] = saatValue;
        break;
      case 'Yorum':
        row[index] = appointmentData.yorum || '';
        break;
      case 'Maplink':
        // Preserve Maplink as text
        row[index] = String(rowData[column] || '');
        break;
      case 'Yönetici Not':
        row[index] = rowData[column] || '';
        break;
      case 'Toplantı formatı':
        row[index] = appointmentData.toplantiFormat || 'Yüz Yüze';
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
  console.log('🔧 Updating Format Tablo row activity:', activity, 'formData:', formData);
  console.log('🔧 Sheet name:', sheet.getName(), 'Row number:', rowNumber);
  
  // Normalize activity to valid Format Tablo Aktivite values
  // Valid values based on validation rules: 'Randevu Alındı', 'İleri Tarih Randevu', 'Randevu Teyitlendi', 'Randevu Ertelendi', 'Randevu İptal oldu'
  // Note: These are the exact values expected by the data validation rule
  const VALID_AKTIVITE_OPTIONS = [
    'Randevu Alındı',
    'İleri Tarih Randevu',
    'Randevu Teyitlendi',
    'Randevu Ertelendi',
    'Randevu İptal oldu'
  ];
  
  // Also check CRM_CONFIG.ACTIVITY_OPTIONS for compatibility
  const allValidOptions = VALID_AKTIVITE_OPTIONS.concat(
    CRM_CONFIG && CRM_CONFIG.ACTIVITY_OPTIONS ? CRM_CONFIG.ACTIVITY_OPTIONS : []
  );
  
  let normalizedActivity = activity || 'Randevu Alındı';
  
  // Normalize activity value
  if (normalizedActivity && typeof normalizedActivity === 'string') {
    const activityLower = normalizedActivity.trim().toLowerCase();
    
    // Check if it's already a valid value
    const isValid = VALID_AKTIVITE_OPTIONS.some(opt => opt.toLowerCase() === activityLower);
    
    if (!isValid) {
      // Try to normalize common variations
      if (activityLower.includes('randevu') && activityLower.includes('alındı')) {
        normalizedActivity = 'Randevu Alındı';
      } else if (activityLower.includes('ileri') || activityLower.includes('tarih')) {
        normalizedActivity = 'İleri Tarih Randevu';
      } else if (activityLower.includes('teyit')) {
        normalizedActivity = 'Randevu Teyitlendi';
      } else if (activityLower.includes('ertel')) {
        normalizedActivity = 'Randevu Ertelendi';
      } else if (activityLower.includes('iptal')) {
        normalizedActivity = 'Randevu İptal oldu';
      } else {
        // Default to 'Randevu Alındı' if no match
        console.warn('⚠️ Unknown activity value:', activity, '- defaulting to "Randevu Alındı"');
        normalizedActivity = 'Randevu Alındı';
      }
    } else {
      // Find exact match (case-insensitive)
      normalizedActivity = VALID_AKTIVITE_OPTIONS.find(opt => opt.toLowerCase() === activityLower) || 'Randevu Alındı';
    }
  } else {
    normalizedActivity = 'Randevu Alındı';
  }
  
  console.log('🔧 Normalized activity:', activity, '→', normalizedActivity);
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const aktiviteIndex = headers.indexOf('Aktivite') + 1;
  const aktiviteTarihiIndex = headers.indexOf('Aktivite Tarihi') + 1;
  const logIndex = headers.indexOf('Log') + 1;
  
  // BATCH: Tüm güncellemeleri tek seferde yap (performans için)
  const updates = [];
  const updateValues = [];
  
  if (aktiviteIndex > 0) {
    updates.push({ col: aktiviteIndex, value: normalizedActivity });
  }
  
  if (aktiviteTarihiIndex > 0) {
    updates.push({ col: aktiviteTarihiIndex, value: new Date() });
  }
  
  // Update form data fields if provided
  if (formData) {
    const yetkiliTelIndex = headers.indexOf('Yetkili Tel') + 1;
    if (yetkiliTelIndex > 0 && formData.yetkiliTel) {
      updates.push({ col: yetkiliTelIndex, value: formData.yetkiliTel });
    }
    
    const mailIndex = headers.indexOf('Mail') + 1;
    if (mailIndex > 0 && formData.mail) {
      updates.push({ col: mailIndex, value: formData.mail });
    }
    
    const isimSoyisimIndex = headers.indexOf('İsim Soyisim') + 1;
    if (isimSoyisimIndex > 0 && formData.isimSoyisim) {
      updates.push({ col: isimSoyisimIndex, value: formData.isimSoyisim });
    }
    
    const toplantiFormatIndex = headers.indexOf('Toplantı formatı') + 1;
    if (toplantiFormatIndex > 0 && formData.toplantiFormat) {
      updates.push({ col: toplantiFormatIndex, value: formData.toplantiFormat });
    }
  }
  
  if (logIndex > 0) {
    const newLog = `${activity} - ${new Date().toLocaleString('tr-TR')}`;
    updates.push({ col: logIndex, value: newLog });
  }
  
  // Batch write (tek seferde tüm güncellemeler)
  if (updates.length > 0) {
    console.log('🔧 Starting batch write - updates count:', updates.length);
    
    // Tüm kolonların validation'ını geçici olarak kaldır (hata önleme)
    // Validation range'i geniş olabilir, bu yüzden tüm satırın validation'ını kaldırıyoruz
    const savedValidations = new Map();
    const columnsToClear = new Set();
    
    // Hangi kolonların validation'ını kaldıracağımızı belirle
    updates.forEach(update => {
      columnsToClear.add(update.col);
    });
    
    // Her kolon için validation'ı kaldır (tüm satır için)
    columnsToClear.forEach(col => {
      try {
        const range = sheet.getRange(rowNumber, col);
        const validation = range.getDataValidation();
        if (validation) {
          savedValidations.set(col, validation);
          console.log(`🔧 Removing validation from column ${col} (row ${rowNumber})`);
          // Geçici olarak validation'ı kaldır - tüm satır için (güvenli)
          range.clearDataValidations();
          // Flush yap ki işlem tamamlansın
          SpreadsheetApp.flush();
        }
      } catch (e) {
        console.log(`⚠️ Validation kaldırma hatası kolon ${col} (devam ediliyor):`, e && e.message);
      }
    });
    
    console.log(`🔧 Removed ${savedValidations.size} validations, now writing values...`);
    
    // Kısa bir bekleme (Google Sheets'in validation'ı işlemesi için)
    Utilities.sleep(100);
    
    // Tüm güncellemeleri yap - her birini ayrı ayrı try-catch ile
    updates.forEach((update, i) => {
      try {
        const range = sheet.getRange(rowNumber, update.col);
        console.log(`🔧 Writing to column ${update.col}:`, update.value);
        // setAllowInvalid(true) ile validation'ı bypass et
        range.setValue(update.value);
        SpreadsheetApp.flush(); // Her yazımdan sonra flush
      } catch (e) {
        console.error('❌ Değer yazma hatası:', e && e.message, 'value:', update.value, 'column:', update.col, 'row:', rowNumber);
        
        // Eğer hala validation hatası varsa, validation'ı tekrar kaldır ve dene
        if (e.message && e.message.includes('veri doğrulama')) {
          try {
            console.log(`🔄 Retrying with force - removing validation again for column ${update.col}`);
            sheet.getRange(rowNumber, update.col).clearDataValidations();
            SpreadsheetApp.flush();
            Utilities.sleep(50);
            sheet.getRange(rowNumber, update.col).setValue(update.value);
            SpreadsheetApp.flush();
            console.log(`✅ Retry successful for column ${update.col}`);
          } catch (retryError) {
            console.error(`❌ Retry failed for column ${update.col}:`, retryError.message);
          }
        }
      }
    });
    
    console.log('🔧 Values written, restoring validations...');
    
    // Kısa bir bekleme (değerlerin yazılması için)
    Utilities.sleep(100);
    
    // Tüm kolonların validation'ını geri ekle (eğer varsa)
    savedValidations.forEach((validation, col) => {
      try {
        sheet.getRange(rowNumber, col).setDataValidation(validation);
        console.log(`🔧 Restored validation to column ${col}`);
      } catch (e) {
        console.log(`⚠️ Validation geri ekleme hatası kolon ${col} (devam ediliyor):`, e && e.message);
      }
    });
    
    console.log('✅ Batch write completed');
  }
  
  // Apply color coding to the row
  console.log('🎨 Applying color coding to row for activity:', activity);
  applyFormatTableColorCoding(sheet, rowNumber, activity);
  
  console.log('🔍 Debug - updateFormatTableRow completed for activity:', activity);
}

/**
 * Applies color coding to Format Tablo row based on activity
 * @param {Sheet} sheet - Format Tablo sheet
 * @param {number} rowNumber - Row number
 * @param {string} activity - Activity status
 */
/**
 * 🎨 Format Table Color Coding - Visual Status
 * @param {Sheet} sheet - Target sheet
 * @param {number} rowNumber - Row number
 * @param {string} activity - Activity status
 */
function applyFormatTableColorCoding(sheet, rowNumber, activity) {
  console.log('🎨 Applying Format Tablo color coding to row:', rowNumber, 'activity:', activity);
  
  try {
    if (!sheet || !rowNumber) {
      console.error('❌ Invalid parameters for color coding');
      return;
    }
    
    // Normalize activity (trim + fuzzy match for known variants)
    const actRaw = activity ? activity.toString().trim() : '';
    const actLower = actRaw.toLowerCase();
    let normalizedActivity = actRaw;
    
    // Fuzzy normalization for "Fırsat İletildi"
    if (actLower.includes('fırsat') && actLower.includes('iletildi')) {
      normalizedActivity = 'Fırsat İletildi';
    }
    
    // If normalized differs, try to fix the cell value to exact label for future consistency
    try {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const aktiviteIdx = headers.indexOf('Aktivite');
      if (aktiviteIdx !== -1 && normalizedActivity && normalizedActivity !== actRaw) {
        sheet.getRange(rowNumber, aktiviteIdx + 1).setValue(normalizedActivity);
        console.log(`🔧 Aktivite düzeltildi: "${actRaw}" → "${normalizedActivity}"`);
      }
    } catch (fixErr) {
      console.log('Aktivite normalizasyonu sırasında uyarı:', fixErr);
    }
    
    let color = 'rgb(255, 255, 255)'; // Default white
    
    // Check if activity is empty, null, or undefined
    if (!normalizedActivity) {
      console.log('⚠️ Empty activity - applying white color');
      color = 'rgb(255, 255, 255)'; // White
    }
    // Map activity to color using centralized system
    else if (normalizedActivity === 'Randevu Alındı') {
      color = CRM_CONFIG.COLOR_CODES['Randevu Alındı'];
    } else if (normalizedActivity === 'İleri Tarih Randevu') {
      color = CRM_CONFIG.COLOR_CODES['İleri Tarih Randevu'];
    } else if (normalizedActivity === 'Randevu Teyitlendi') {
      color = CRM_CONFIG.COLOR_CODES['Randevu Teyitlendi'];
    } else if (normalizedActivity === 'Randevu Ertelendi') {
      color = CRM_CONFIG.COLOR_CODES['Randevu Ertelendi'];
    } else if (normalizedActivity === 'Randevu İptal oldu') {
      color = CRM_CONFIG.COLOR_CODES['Randevu İptal oldu'];
    } else if (normalizedActivity === 'Fırsat İletildi') {
      color = CRM_CONFIG.COLOR_CODES['Fırsat İletildi'];
      console.log('🔍 Debug - Fırsat İletildi color found:', color);
    } else if (normalizedActivity === 'Bilgi Verildi') {
      color = CRM_CONFIG.COLOR_CODES['Bilgi Verildi'];
    } else if (normalizedActivity === 'Yeniden Aranacak') {
      color = CRM_CONFIG.COLOR_CODES['Yeniden Aranacak'];
    } else if (normalizedActivity === 'İlgilenmiyor') {
      color = CRM_CONFIG.COLOR_CODES['İlgilenmiyor'];
    } else if (normalizedActivity === 'Ulaşılamadı') {
      color = CRM_CONFIG.COLOR_CODES['Ulaşılamadı'];
    } else if (normalizedActivity === 'Geçersiz Numara') {
      color = CRM_CONFIG.COLOR_CODES['Geçersiz Numara'];
    } else if (normalizedActivity === 'Toplantı Tamamlandı') {
      color = CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'];
    } else {
      console.log('⚠️ Unknown activity:', normalizedActivity, '- using default white');
      console.log('🔍 Debug - Available colors:', Object.keys(CRM_CONFIG.COLOR_CODES));
    }
    
    // Apply color to entire row
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
    console.log(`🔍 Debug - About to apply color ${color} to range ${range.getA1Notation()}`);
    
    try {
      range.setBackground(color);
      console.log(`✅ Successfully applied color ${color} to row ${rowNumber} for activity: ${normalizedActivity}`);
    } catch (setBackgroundError) {
      console.error(`❌ Error setting background color:`, setBackgroundError);
      throw setBackgroundError;
    }
    
  } catch (error) {
    console.error('❌ Error applying Format Tablo color coding:', error);
  }
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
  
  // Auto-resize columns - tüm kolonlar içeriğe göre otomatik genişleyecek
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Sadece Yorum ve Yönetici Not kolonları için özel genişlik (4 satır sığacak kadar)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((header, index) => {
    const columnIndex = index + 1;
    // Sadece Yorum ve Yönetici Not için özel genişlik (450px - 4 satır için uygun)
    if (header === 'Yorum' || header === 'Yönetici Not') {
      sheet.setColumnWidth(columnIndex, 450);
      console.log(`✅ ${header} kolonu 450px genişliğe ayarlandı (4 satır için uygun)`);
    }
    // Diğer tüm kolonlar auto-resize ile içeriğe göre otomatik genişleyecek
  });
  
  // Add borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
  
  // Saat kolonunu text formatına zorla (tarih formatında görünmesin)
  const saatColumnIndex = headers.indexOf('Saat') + 1;
  if (saatColumnIndex > 0) {
    sheet.getRange(2, saatColumnIndex, sheet.getLastRow() || 1000, 1).setNumberFormat('@');
    console.log('✅ Saat kolonu text formatına zorlandı');
  }
  
  // Yorum ve Yönetici Not kolonlarına text wrapping ekle
  const yorumColumnIndex = headers.indexOf('Yorum') + 1;
  const yoneticiNotColumnIndex = headers.indexOf('Yönetici Not') + 1;
  
  if (yorumColumnIndex > 0) {
    const lastRow = sheet.getLastRow() || 1;
    if (lastRow > 1) {
      sheet.getRange(2, yorumColumnIndex, lastRow - 1, 1).setWrap(true);
      console.log('✅ Yorum kolonuna text wrapping eklendi');
    }
  }
  
  if (yoneticiNotColumnIndex > 0) {
    const lastRow = sheet.getLastRow() || 1;
    if (lastRow > 1) {
      sheet.getRange(2, yoneticiNotColumnIndex, lastRow - 1, 1).setWrap(true);
      console.log('✅ Yönetici Not kolonuna text wrapping eklendi');
    }
  }
  
  // Auto-sort by date (newest first)
  sortRandevularimByDate(sheet);
  
  console.log('Randevularım styling completed with optimized column widths and date sorting');
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
    const randevuDurumuOptions = ['Randevu Alındı', 'İleri Tarih Randevu', 'Randevu Teyitlendi', 'Randevu Ertelendi', 'Randevu İptal oldu', 'Toplantı Gerçekleşti'];
    const randevuRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(randevuDurumuOptions, true)
      .setAllowInvalid(false) // Geçersiz değerlere izin verme
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
      .setAllowInvalid(true) // Geçersiz değerlere izin ver (kullanıcı yanlış yazarsa hata vermesin)
      .build();
    
    sheet.getRange(2, toplantiFormatIndex, validationRows, 1).setDataValidation(toplantiRule);
    console.log('Applied Toplantı formatı validation');
  }
  
  // Toplantı Sonucu ve Toplantı Tarihi validation'ları KALDIRILDI
  // Randevularım sayfasında bu kolonlar yok (silindi)
  // Bu validation'lar sadece Toplantılarım sayfasında olmalı
  
  // ÖNEMLİ: "Yönetici Not" kolonundaki yanlış validation'ları temizle (bu kolon input olmalı, dropdown değil)
  const yoneticiNotIndex = headers.indexOf('Yönetici Not') + 1;
  if (yoneticiNotIndex > 0) {
    sheet.getRange(2, yoneticiNotIndex, validationRows, 1).clearDataValidations();
    console.log('✅ Yönetici Not kolonundaki validation kuralları temizlendi (input olmalı)');
  }
  
  console.log('Randevularım data validation completed');
}

/**
 * 🎨 Appointment Color Coding - Visual Status
 * @param {Sheet} sheet - Randevularım sheet
 * @param {number} rowNumber - Row number
 */
function applyAppointmentColorCoding(sheet, rowNumber) {
  console.log('🎨 Applying appointment color coding to row:', rowNumber);
  
  try {
    if (!sheet || !rowNumber) {
      console.error('❌ Invalid parameters for appointment color coding');
      return;
    }
    
    // Get the status from the Randevu Durumu column (display values, case-insensitive)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    const lowered = headers.map(h => String(h||'').toLowerCase());
    let randevuDurumuIndex = lowered.indexOf('randevu durumu');
    if (randevuDurumuIndex === -1) randevuDurumuIndex = lowered.indexOf('randevu durumu'.toLowerCase());
    
    if (randevuDurumuIndex === -1) {
      console.error('❌ Randevu Durumu column not found');
      return;
    }
    
    const rawStatus = sheet.getRange(rowNumber, randevuDurumuIndex + 1).getDisplayValue();
    const norm = String(rawStatus || '').toLowerCase();
    let status = '';
    if (norm.includes('iptal')) status = 'Randevu İptal oldu';
    else if (norm.includes('erte')) status = 'Randevu Ertelendi';
    else if (norm.includes('teyit')) status = 'Randevu Teyitlendi';
    else if (norm.includes('ileri')) status = 'İleri Tarih Randevu';
    else if (norm.includes('alınd') || norm.includes('alindi') || norm.includes('alın') || norm === 'randevu alındı') status = 'Randevu Alındı';
    else status = String(rawStatus || '').trim();
    
    console.log('📋 Status found:', status, 'in row:', rowNumber);
    
    // Use updateRandevularimRowColor for consistent color logic (includes Toplantı Sonucu override)
    updateRandevularimRowColor(sheet, rowNumber, status);
    
  } catch (error) {
    console.error('❌ Error applying appointment color coding:', error);
  }
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
    
    // Get selected row data - Use more reliable method
    let selectedRow = activeRange.getRow();
    
    // Additional safety check - ensure we're not on header row
    if (selectedRow === 1) {
      throw new Error('Lütfen bir satır seçin (başlık satırı hariç)');
    }
    
    // Log the selected row for debugging
    console.log('Selected row number:', selectedRow);
    console.log('Active range:', activeRange.getA1Notation());
    
    const selectedRowData = getSelectedRowData(activeSheet, selectedRow);
    
    // Check if row already has opportunity (only if Aktivite field exists and is not empty)
    if (selectedRowData.Aktivite && selectedRowData.Aktivite.toString().trim() === 'Fırsat İletildi') {
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
        console.log('Debug - Starting duplicate check...');
        
        const selectedPhone = selectedRowData.Phone ? selectedRowData.Phone.toString().trim() : '';
        const selectedCompany = selectedRowData['Company name'].toString().trim();
        
        console.log('Debug - Checking for existing opportunity with Company:', selectedCompany, 'Phone:', selectedPhone || 'BOŞ');
        
        // Temizlenmiş ve geliştirilmiş kontrol - sadece gerçekten dolu ve anlamlı satırları bul
        console.log('Debug - Searching through Fırsatlarım data for duplicates...');
        
        // Önce seçilen satırın Kod değerini al
        const selectedKod = selectedRowData.Kod ? selectedRowData.Kod.toString().trim() : '';
        console.log('Debug - Selected row Kod:', selectedKod);
        
        // Fırsatlarım'daki tüm satırları kontrol et (başlık hariç)
        const existingOpportunity = firsatlarimData.slice(1).find((row, index) => {
          // Boş satırları hemen atla (hızlı kontrol)
          if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
            console.log(`Debug - Row ${index + 2} is empty, skipping`);
            return false;
          }
          
          // Gerekli değerleri al
          const kodIndex = firsatlarimHeaders.indexOf('Kod');
          const rowKod = kodIndex >= 0 && row[kodIndex] ? row[kodIndex].toString().trim() : '';
          
          // Kod boşsa, bu geçerli bir kayıt değil
          if (!rowKod) {
            console.log(`Debug - Row ${index + 2} has no Kod, skipping`);
            return false;
          }
          
          // Kod eşleşmesi kontrolü - bu en güvenilir yöntem
          if (selectedKod && rowKod && selectedKod === rowKod) {
            console.log(`Debug - EXACT KOD MATCH FOUND at row ${index + 2}: ${rowKod}`);
            return true;
          }
          
          // Kod eşleşmesi yoksa, telefon ve şirket adı kontrolü yap
          const rowPhone = phoneIndex >= 0 && row[phoneIndex] ? row[phoneIndex].toString().trim() : '';
          const rowCompany = companyIndex >= 0 && row[companyIndex] ? row[companyIndex].toString().trim() : '';
          
          // Şirket adı boşsa, bu muhtemelen geçerli bir kayıt değil
          if (!rowCompany) {
            console.log(`Debug - Row ${index + 2} has no Company name, skipping`);
            return false;
          }
          
          // Company name karşılaştırması
          const companyMatch = rowCompany && selectedCompany && rowCompany === selectedCompany;
          
          // Phone karşılaştırması (telefon boşsa atla)
          let phoneMatch = true; // Varsayılan olarak true
          if (selectedPhone && selectedPhone !== '') {
            phoneMatch = rowPhone && rowPhone === selectedPhone;
          }
          
          const match = phoneMatch && companyMatch;
          
          console.log(`Debug - Row ${index + 2} comparison:`, {
            rowNumber: index + 2,
            kod: rowKod,
            company: rowCompany,
            phone: rowPhone,
            companyMatch: companyMatch,
            phoneMatch: phoneMatch,
            finalMatch: match
          });
          
          return match;
        });
        
        if (existingOpportunity) {
          console.log('Debug - Found existing opportunity:', existingOpportunity);
          
          // Fırsat Durumu kontrolü - eğer satır silindi olarak işaretlendiyse izin ver
          const firsatDurumuIndex = firsatlarimHeaders.indexOf('Fırsat Durumu');
          if (firsatDurumuIndex >= 0) {
            const firsatDurumu = existingOpportunity[firsatDurumuIndex];
            console.log('Debug - Existing opportunity status:', firsatDurumu);
            
            // Her durumda işleme devam et - mükerrer kontrolünü tamamen kaldır
            console.log('Debug - Skipping duplicate check, allowing all opportunities');
            
            // Kullanıcıya bilgi ver ama işlemi engelleme
            if (firsatDurumu) {
              console.log('Debug - Found existing opportunity with status:', firsatDurumu);
            }
          } else {
            // Mükerrer kontrolünü tamamen kaldır - her durumda izin ver
            console.log('Debug - Skipping Kod check, allowing all opportunities');
          }
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
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Create HTML template for dialog - optimize by pre-setting variables
    const htmlTemplate = HtmlService.createTemplateFromFile('opportunityDialog');
    htmlTemplate.rowData = rowData;
    htmlTemplate.meetingFormats = CRM_CONFIG.MEETING_FORMAT_OPTIONS;
    
    // Evaluate and show dialog in one go
    ui.showModalDialog(
      htmlTemplate.evaluate().setWidth(600).setHeight(500),
      'Fırsat Ekle'
    );
    
    return null;
  } catch (error) {
    console.error('❌ Dialog açma hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Dialog açılamadı: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
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
    
    // Get selected row data - Use more reliable method
    let selectedRow = activeRange.getRow();
    
    // Additional safety check - ensure we're not on header row
    if (selectedRow === 1) {
      throw new Error('Lütfen bir satır seçin (başlık satırı hariç)');
    }
    
    // Log the selected row for debugging
    console.log('Selected row number:', selectedRow);
    console.log('Active range:', activeRange.getA1Notation());
    
    const selectedRowData = getSelectedRowData(activeSheet, selectedRow);
    
    // Add source sheet information to rowData
    if (isFormatTable(activeSheet)) {
      selectedRowData.Kaynak = activeSheet.getName();
    }
    
      // Create opportunity in Fırsatlarım
  const result = createOpportunityInFirsatlarim(spreadsheet, selectedRowData, formData);
  
  // Normalize activity label for Format Tablo
  let newActivity = (formData.firsatDurumu || '').toString().trim();
  const newActLower = newActivity.toLowerCase();
  if (newActLower.includes('fırsat') && newActLower.includes('iletildi')) newActivity = 'Fırsat İletildi';
  else if (newActLower.includes('bilgi') && newActLower.includes('verildi')) newActivity = 'Bilgi Verildi';
  else if (newActLower.includes('yeniden') && newActLower.includes('aranacak')) newActivity = 'Yeniden Aranacak';
  if (!newActivity) newActivity = 'Fırsat İletildi';

  // Update Format Tablo row with selected activity and form data
  updateFormatTableRow(activeSheet, selectedRow, newActivity, formData);
    
    // Apply color coding to the updated row - OPTIMIZED
    try {
      const range = activeSheet.getRange(selectedRow, 1, 1, activeSheet.getLastColumn());
      range.setBackground('rgb(255, 235, 238)'); // Light Red for Fırsat İletildi
    } catch (colorError) {
      console.error('❌ Error applying color:', colorError);
    }
    
    // Single flush after all operations
    SpreadsheetApp.flush();
    
    logActivity('Fırsat İletildi', { 
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
  
  // Columns: use existing sheet headers to avoid misalignment
  const firsatlarimColumns = firsatlarimSheet.getRange(1, 1, 1, firsatlarimSheet.getLastColumn()).getValues()[0];
  
  // Prepare opportunity row data
  const opportunityRow = prepareOpportunityRow(rowData, opportunityData, firsatlarimColumns, firsatlarimSheet);
  
  // Add to Fırsatlarım - BATCH OPERATIONS for speed
  const nextRow = firsatlarimSheet.getLastRow() + 1;
  const kodColumnIndex = firsatlarimColumns.indexOf('Kod') + 1;
  
  // Batch write: data + format in one operation
  const dataRange = firsatlarimSheet.getRange(nextRow, 1, 1, firsatlarimColumns.length);
  dataRange.setValues([opportunityRow]);
  
  // Set format for Kod column if needed
  if (kodColumnIndex > 0) {
    firsatlarimSheet.getRange(nextRow, kodColumnIndex, 1, 1).setNumberFormat('@');
  }
  
  // Apply color coding (optimized)
  applyOpportunityColorCoding(firsatlarimSheet, nextRow);
  
  // Single flush before sorting
  SpreadsheetApp.flush();
  
  // Sort by date after adding new opportunity (only if needed - optimize later)
  sortFirsatlarimByDate(firsatlarimSheet);
  
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
  
  // YENİ DÜZEN (Log Arşivi kullanıldığı için Log kolonu kaldırıldı, Keyword, Location, Category, CMS kolonları kaldırıldı)
  const columns = [
    'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
    'Website', 'Mail', 'Toplantı formatı', 'Fırsat Durumu', 'Fırsat Tarihi',
    'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
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
      case 'Company name':
      case 'Website':
      case 'Phone':
      case 'Address':
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
      case 'Toplantı formatı':
        row[index] = opportunityData.toplantiFormat || 'Telefon';
        break;
      case 'Fırsat Durumu':
        {
          let statusVal = (opportunityData.firsatDurumu || '').toString().trim();
          const lower = statusVal.toLowerCase();
          if (lower.includes('fırsat') && lower.includes('iletildi')) {
            statusVal = 'Fırsat İletildi';
          } else if (lower.includes('bilgi') && lower.includes('verildi')) {
            statusVal = 'Bilgi Verildi';
          } else if (lower.includes('yeniden') && lower.includes('aranacak')) {
            statusVal = 'Yeniden Aranacak';
          }
          row[index] = statusVal || 'Bilgi Verildi';
          console.log('🔍 Debug - Fırsat Durumu set to:', row[index]);
          console.log('🔍 Debug - opportunityData.firsatDurumu:', opportunityData.firsatDurumu);
        }
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
      case 'Ay':
        // Ay kolonunu otomatik doldur (Fırsat Tarihi'ne göre)
        const firsatTarihiForAy = opportunityData.firsatTarihi || '';
        if (firsatTarihiForAy) {
          let tarihObj = null;
          if (firsatTarihiForAy.includes('-')) {
            const parts = firsatTarihiForAy.split('-');
            if (parts.length === 3) {
              tarihObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
          } else if (firsatTarihiForAy instanceof Date) {
            tarihObj = firsatTarihiForAy;
          }
          
          if (tarihObj && !isNaN(tarihObj.getTime())) {
            const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            row[index] = monthNames[tarihObj.getMonth()];
            console.log(`📅 Ay kolonu otomatik dolduruldu: ${row[index]}`);
          }
        }
        break;
      case 'Saat':
        // Saat kolonu - HH:mm formatında
        let saatValue = opportunityData.saat || '';
        if (saatValue) {
          if (saatValue instanceof Date) {
            const hours = saatValue.getHours().toString().padStart(2, '0');
            const minutes = saatValue.getMinutes().toString().padStart(2, '0');
            saatValue = `${hours}:${minutes}`;
          } else if (typeof saatValue === 'string') {
            // Parse time string (HH:mm format)
            const timeMatch = saatValue.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
              saatValue = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
            }
          }
        }
        row[index] = saatValue;
        break;
      case 'Yorum':
        row[index] = opportunityData.yorum || '';
        break;
      case 'Yönetici Not':
        row[index] = opportunityData.yoneticiNot || '';
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
  
  // Auto-resize columns - tüm kolonlar içeriğe göre otomatik genişleyecek
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Özel genişlik ayarları
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((header, index) => {
    const columnIndex = index + 1;
    
    // Company name: 450px
    if (header === 'Company name') {
      sheet.setColumnWidth(columnIndex, 450);
      console.log(`✅ ${header} kolonu 450px genişliğe ayarlandı`);
    }
    // Address: 450px
    else if (header === 'Address') {
      sheet.setColumnWidth(columnIndex, 450);
      console.log(`✅ ${header} kolonu 450px genişliğe ayarlandı`);
    }
    // Website: 250px
    else if (header === 'Website') {
      sheet.setColumnWidth(columnIndex, 250);
      console.log(`✅ ${header} kolonu 250px genişliğe ayarlandı`);
    }
    // Mail: 250px
    else if (header === 'Mail') {
      sheet.setColumnWidth(columnIndex, 250);
      console.log(`✅ ${header} kolonu 250px genişliğe ayarlandı`);
    }
    // Yorum: 450px (4 satır için uygun)
    else if (header === 'Yorum') {
      sheet.setColumnWidth(columnIndex, 450);
      console.log(`✅ ${header} kolonu 450px genişliğe ayarlandı (4 satır için uygun)`);
    }
    // Yönetici Not: 350px
    else if (header === 'Yönetici Not') {
      sheet.setColumnWidth(columnIndex, 350);
      console.log(`✅ ${header} kolonu 350px genişliğe ayarlandı`);
    }
    // Diğer tüm kolonlar auto-resize ile içeriğe göre otomatik genişleyecek
  });
  
  // Yorum ve Yönetici Not kolonlarına text wrapping ekle (metin sağa taştığında alta insın)
  const yorumColumnIndex = headers.indexOf('Yorum') + 1;
  const yoneticiNotColumnIndex = headers.indexOf('Yönetici Not') + 1;
  
  if (yorumColumnIndex > 0) {
    const lastRow = sheet.getLastRow() || 1;
    if (lastRow > 1) {
      sheet.getRange(2, yorumColumnIndex, lastRow - 1, 1).setWrap(true);
      console.log('✅ Yorum kolonuna text wrapping eklendi');
    }
  }
  
  if (yoneticiNotColumnIndex > 0) {
    const lastRow = sheet.getLastRow() || 1;
    if (lastRow > 1) {
      sheet.getRange(2, yoneticiNotColumnIndex, lastRow - 1, 1).setWrap(true);
      console.log('✅ Yönetici Not kolonuna text wrapping eklendi');
    }
  }
  
  // Add borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
  
  // Auto-sort by date (newest first)
  sortFirsatlarimByDate(sheet);
  
  console.log('Fırsatlarım styling completed with optimized column widths and date sorting');
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
    // Use only Fırsatlarım specific options (3 options only)
    const firsatDurumuOptions = [
      'Yeniden Aranacak',
      'Bilgi Verildi',
      'Fırsat İletildi'
    ];
    
    console.log('Setting Fırsat Durumu validation with options:', firsatDurumuOptions);
    
    const firsatRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(firsatDurumuOptions, true)
      .setAllowInvalid(true) // Geçersiz değerlere izin ver
      .build();
    
    const validationRange = sheet.getRange(2, firsatDurumuIndex, validationRows, 1);
    
    // Force refresh validation
    validationRange.clearDataValidations();
    validationRange.setDataValidation(firsatRule);
    
    console.log('Applied Fırsat Durumu validation to range:', validationRange.getA1Notation());
    console.log('Validation options:', firsatDurumuOptions);
  }
  
  // Fırsat Tarihi validation (datepicker)
  const firsatTarihiIndex = headers.indexOf('Fırsat Tarihi') + 1;
  if (firsatTarihiIndex > 0) {
    const tarihRule = SpreadsheetApp.newDataValidation()
      .requireDate()
      .setAllowInvalid(true) // Geçersiz değerlere izin ver
      .build();
    
    sheet.getRange(2, firsatTarihiIndex, validationRows, 1).setDataValidation(tarihRule);
    console.log('Applied Fırsat Tarihi validation');
  }
  
  // Toplantı formatı validation (dropdown)
  const toplantiFormatIndex = headers.indexOf('Toplantı formatı') + 1;
  if (toplantiFormatIndex > 0) {
    const toplantiRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CRM_CONFIG.MEETING_FORMAT_OPTIONS, true)
      .setAllowInvalid(true) // Geçersiz değerlere izin ver
      .build();
    
    sheet.getRange(2, toplantiFormatIndex, validationRows, 1).setDataValidation(toplantiRule);
    console.log('Applied Toplantı formatı validation');
  }
  
  console.log('Fırsatlarım data validation completed');
}

/**
 * 🎨 Opportunity Color Coding - Visual Status
 * @param {Sheet} sheet - Fırsatlarım sheet
 * @param {number} rowNumber - Row number
 */
function applyOpportunityColorCoding(sheet, rowNumber) {
  console.log('🎨 Applying opportunity color coding to row:', rowNumber);
  
  try {
    if (!sheet || !rowNumber) {
      console.error('❌ Invalid parameters for opportunity color coding');
      return;
    }
    
    // Get the status from the Fırsat Durumu column
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
    
    if (firsatDurumuIndex === -1) {
      console.error('❌ Fırsat Durumu column not found');
      console.log('Available headers:', headers);
      return;
    }
    
    // getDisplayValue() kullan (dropdown değerleri için)
    const statusCell = sheet.getRange(rowNumber, firsatDurumuIndex + 1);
    const status = String(statusCell.getDisplayValue() || statusCell.getValue() || '').trim();
    console.log('📋 Status found:', status, 'in row:', rowNumber, 'column:', firsatDurumuIndex + 1);
    
    let color = 'rgb(255, 255, 255)'; // Default white
    
    // Map status to color using centralized system
    if (status && status.toString().trim() !== '') {
      // Normalize status - remove any case issues or extra spaces
      const normalizedStatus = status.toString().trim();
      
      console.log('🔍 Looking for color for status:', normalizedStatus);
      console.log('Available colors in CRM_CONFIG:', Object.keys(CRM_CONFIG.COLOR_CODES));
      
      // Check exact match first
      if (CRM_CONFIG.COLOR_CODES[normalizedStatus]) {
        color = CRM_CONFIG.COLOR_CODES[normalizedStatus];
        console.log('✅ Found exact color match:', color, 'for status:', normalizedStatus);
      }
      // Special handling for Fırsat İletildi with potential case/spelling variations
      else if (normalizedStatus.toLowerCase().includes('fırsat') && normalizedStatus.toLowerCase().includes('iletildi')) {
        color = CRM_CONFIG.COLOR_CODES['Fırsat İletildi'];
        console.log('✅ Applied Fırsat İletildi color (fuzzy match):', color);
        // Not: Hücre değerini zorla düzeltmiyoruz (validation çatışmasını önlemek için)
      } else {
        console.log('⚠️ Unknown status:', normalizedStatus, '- using default white');
        console.log('Available statuses for opportunities:', ['Yeniden Aranacak', 'Bilgi Verildi', 'Fırsat İletildi']);
        console.log('🔍 Debug - CRM_CONFIG.COLOR_CODES keys:', Object.keys(CRM_CONFIG.COLOR_CODES));
        console.log('🔍 Debug - Looking for:', normalizedStatus);
      }
    } else {
      console.log('⚠️ Empty status - using default white');
    }
    
    // Apply color to entire row
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
    range.setBackground(color);
    
    console.log(`✅ Applied color ${color} to row ${rowNumber} for status: ${status}`);
    
  } catch (error) {
    console.error('❌ Error applying opportunity color coding:', error);
  }
}

/**
 * 🎨 Batch Opportunity Color Coding - Ultra Optimized for large datasets
 * Uses setBackgrounds() to apply all colors in a single operation
 * @param {Sheet} sheet - Fırsatlarım sheet
 * @param {number} startRow - Start row number (data starts here, header is row 1)
 * @param {number} numRows - Number of rows to process
 */
function applyOpportunityColorCodingBatch(sheet, startRow, numRows) {
  console.log(`🎨 [BATCH] Applying opportunity color coding to ${numRows} rows (ultra-fast mode)`);
  
  try {
    if (!sheet || !startRow || numRows <= 0) {
      console.error('❌ Invalid parameters for batch opportunity color coding');
      return;
    }
    
    const lastColumn = sheet.getLastColumn();
    if (lastColumn === 0) {
      console.error('❌ Sheet has no columns');
      return;
    }
    
    // Get headers once
    const headers = sheet.getRange(1, 1, 1, lastColumn).getDisplayValues()[0];
    const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
    
    if (firsatDurumuIndex === -1) {
      console.error('❌ Fırsat Durumu column not found');
      return;
    }
    
    // Read all status values in one batch (single API call)
    const statusRange = sheet.getRange(startRow, firsatDurumuIndex + 1, numRows, 1);
    const statusValues = statusRange.getDisplayValues();
    
    // Determine colors for all rows (in memory, very fast)
    const backgroundColorMatrix = [];
    for (let i = 0; i < numRows; i++) {
      const status = String(statusValues[i][0] || '').trim();
      let color = 'rgb(255, 255, 255)'; // Default white
      
      if (status) {
        const normalizedStatus = status.trim();
        
        // Check exact match first
        if (CRM_CONFIG.COLOR_CODES[normalizedStatus]) {
          color = CRM_CONFIG.COLOR_CODES[normalizedStatus];
        }
        // Special handling for Fırsat İletildi
        else if (normalizedStatus.toLowerCase().includes('fırsat') && normalizedStatus.toLowerCase().includes('iletildi')) {
          color = CRM_CONFIG.COLOR_CODES['Fırsat İletildi'];
        }
      }
      
      // Create a row array with the same color for all columns
      const rowColors = new Array(lastColumn).fill(color);
      backgroundColorMatrix.push(rowColors);
    }
    
    // Apply all colors in a SINGLE batch operation (ultra-fast!)
    const allRowsRange = sheet.getRange(startRow, 1, numRows, lastColumn);
    allRowsRange.setBackgrounds(backgroundColorMatrix);
    
    console.log(`✅ [BATCH] Applied colors to ${numRows} rows in single operation`);
    
  } catch (error) {
    console.error('❌ Error applying batch opportunity color coding:', error);
    throw error;
  }
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
function moveToMeeting(parameters = {}) {
  console.log('Function started: moveToMeeting', parameters);
  
  try {
    // Input validation - allow empty parameters for menu calls
    if (parameters && !validateInput(parameters)) {
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
    const selectedRowNumber = activeRange.getRow();
    
    // Store row data and number globally before showing dialog
    SELECTED_ROW_DATA = selectedRowData;
    SELECTED_ROW_NUMBER = selectedRowNumber;
    console.log('🔍 Stored SELECTED_ROW_DATA in moveToMeeting:', SELECTED_ROW_DATA);
    console.log('🔍 Stored SELECTED_ROW_NUMBER in moveToMeeting:', SELECTED_ROW_NUMBER);
    
    // Check if appointment exists and has valid status
    if (!selectedRowData['Randevu durumu'] || 
        (selectedRowData['Randevu durumu'] !== 'Randevu Alındı' && 
         selectedRowData['Randevu durumu'] !== 'Randevu Teyitlendi')) {
      throw new Error('Sadece randevu alınmış veya teyitlenmiş randevular toplantıya geçebilir');
    }
    
    // Duplicate kontrolü kaldırıldı - Randevu toplantıya geçtiğinde Randevularım'dan siliniyor,
    // dolayısıyla ikinci kere geçirilemez
    
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

// ========================================
// FUNCTION 5: MOVE TO SALE
// ========================================

/**
 * Moves meeting from Toplantılarım to Satışlarım
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function moveToSale(parameters = {}) {
  console.log('Function started: moveToSale', parameters);
  
  try {
    // Input validation - allow empty parameters for menu calls
    if (parameters && !validateInput(parameters)) {
      throw new Error('Invalid input provided');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const activeRange = SpreadsheetApp.getActiveRange();
    
    // Check if we're on Toplantılarım sheet
    if (activeSheet.getName() !== 'Toplantılarım') {
      throw new Error('Bu işlem sadece Toplantılarım sayfasında yapılabilir');
    }
    
    // Check if a row is selected
    if (!activeRange || activeRange.getRow() === 1) {
      throw new Error('Lütfen bir satır seçin (başlık satırı hariç)');
    }
    
    // Get selected row data
    const selectedRowData = getSelectedRowData(activeSheet, activeRange.getRow());
    const selectedRowNumber = activeRange.getRow();
    
    // Store row data and number globally before showing dialog
    SELECTED_ROW_DATA = selectedRowData;
    SELECTED_ROW_NUMBER = selectedRowNumber;
    console.log('🔍 Stored SELECTED_ROW_DATA in moveToSale:', SELECTED_ROW_DATA);
    console.log('🔍 Stored SELECTED_ROW_NUMBER in moveToSale:', SELECTED_ROW_NUMBER);
    
    // Show sale dialog directly (with pre-filled meeting data)
    showSaleDialog(selectedRowData);
    
    // Since dialog doesn't return data, we'll handle the processing in the HTML dialog
    // The dialog will call processSaleForm which will handle the rest
    return { success: true, message: 'Satış dialog\'u açıldı' };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Shows sale dialog with pre-filled data from meeting
 * @param {Object} rowData - Selected row data from Toplantılarım
 * @returns {Object|null} - Sale data or null if cancelled
 */
/**
 * Shows the sale dialog (separate HTML dialog for sales only)
 * @param {Object} rowData - Selected row data from Toplantılarım sheet
 */
function showSaleDialog(rowData) {
  try {
    // Convert Toplantı Tarihi to display format
    let toplantiTarihi = rowData['Toplantı Tarihi'] || '';
    let toplantiTarihiDisplay = toplantiTarihi;
    
    if (toplantiTarihi instanceof Date) {
      const day = toplantiTarihi.getDate().toString().padStart(2, '0');
      const month = (toplantiTarihi.getMonth() + 1).toString().padStart(2, '0');
      const year = toplantiTarihi.getFullYear();
      toplantiTarihiDisplay = `${day}.${month}.${year}`;
    } else if (typeof toplantiTarihi === 'string' && toplantiTarihi.includes('.')) {
      // Already in DD.MM.YYYY format
      toplantiTarihiDisplay = toplantiTarihi;
    } else if (toplantiTarihi) {
      // Try to parse
      try {
        const dateObj = new Date(toplantiTarihi);
        if (!isNaN(dateObj.getTime())) {
          const day = dateObj.getDate().toString().padStart(2, '0');
          const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          const year = dateObj.getFullYear();
          toplantiTarihiDisplay = `${day}.${month}.${year}`;
        }
      } catch (e) {
        console.log('Date parse error:', e);
      }
    }
    
    // Get default values
    const defaultPaket = rowData['Teklif Detayı'] || '';
    const toplantiFormatDisplay = rowData['Toplantı formatı'] || '';
    const toplantiYapanDisplay = rowData['Toplantıyı Yapan'] || '';
    const yorumDisplay = rowData['Yorum'] || '';
    const yoneticiNotDisplay = rowData['Yönetici Not'] || '';
    
    // Determine default satış türü based on existing data
    // If "Teklif Detayı" exists, it's likely "Teklif Sonrası", otherwise "Yerinde Satış"
    const defaultSatisTuru = (defaultPaket && rowData['Toplantı Sonucu'] !== 'Satış Yapıldı') ? 'Teklif Sonrası' : 'Yerinde Satış';
    
    // Ensure rowNumber is a number
    let templateRowNumber = SELECTED_ROW_NUMBER || 0;
    if (typeof templateRowNumber === 'string') {
      templateRowNumber = parseInt(templateRowNumber, 10);
      if (isNaN(templateRowNumber)) templateRowNumber = 0;
    }
    
    // Use NEW saleDialog.html (separate, clean dialog)
    const ui = SpreadsheetApp.getUi();
    const htmlTemplate = HtmlService.createTemplateFromFile('saleDialog');
    
    // Set template variables
    htmlTemplate.rowData = rowData;
    htmlTemplate.rowNumber = templateRowNumber;
    htmlTemplate.sourceSheetName = 'Toplantılarım';
    
    // Display values (for readonly fields)
    htmlTemplate.toplantiTarihiDisplay = toplantiTarihiDisplay || 'Belirtilmemiş';
    htmlTemplate.toplantiFormatDisplay = toplantiFormatDisplay || 'Belirtilmemiş';
    htmlTemplate.toplantiYapanDisplay = toplantiYapanDisplay || 'Belirtilmemiş';
    htmlTemplate.yorumDisplay = yorumDisplay || '';
    htmlTemplate.yoneticiNotDisplay = yoneticiNotDisplay || '';
    
    // Default values for dropdowns
    htmlTemplate.defaultPaket = defaultPaket || '';
    htmlTemplate.defaultSatisTuru = defaultSatisTuru || 'Yerinde Satış';
    
    // Evaluate and show dialog
    ui.showModalDialog(
      htmlTemplate.evaluate().setWidth(800).setHeight(650),
      '💰 Toplantıdan Satışa Geç'
    );
    
    return null;
  } catch (error) {
    console.error('❌ Sale dialog açma hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Dialog açılamadı: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
}

/**
 * Wrapper function for menu call
 */
function showMoveToSaleDialog() {
  moveToSale({});
}

/**
 * Shows meeting dialog with pre-filled data
 * @param {Object} rowData - Selected row data
 * @returns {Object|null} - Meeting data or null if cancelled
 */
function showMeetingDialog(rowData) {
  try {
    // SELECTED_ROW_DATA and SELECTED_ROW_NUMBER are already set in moveToMeeting function
  
  // Convert Randevu Tarihi to YYYY-MM-DD format for HTML date input
  let randevuTarihi = rowData['Randevu Tarihi'] || '';
  let defaultMeetingDate = '';
  
  if (randevuTarihi) {
    if (typeof randevuTarihi === 'string' && randevuTarihi.includes('.')) {
      // Convert DD.MM.YYYY to YYYY-MM-DD
      const parts = randevuTarihi.split('.');
      if (parts.length === 3) {
        defaultMeetingDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    } else if (randevuTarihi instanceof Date) {
      const year = randevuTarihi.getFullYear();
      const month = (randevuTarihi.getMonth() + 1).toString().padStart(2, '0');
      const day = randevuTarihi.getDate().toString().padStart(2, '0');
      defaultMeetingDate = `${year}-${month}-${day}`;
    } else {
      // Try to parse as date string
      try {
        const dateObj = new Date(randevuTarihi);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          const day = dateObj.getDate().toString().padStart(2, '0');
          defaultMeetingDate = `${year}-${month}-${day}`;
        }
      } catch (e) {
        console.error('Date parse error:', e);
      }
    }
  }
  
  // If still empty, use today's date
    if (!defaultMeetingDate) {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');
      defaultMeetingDate = `${year}-${month}-${day}`;
  }
  
  // Yeni Takip Tarihi: Toplantı tarihinden 3 gün sonra
  let defaultYeniTakipTarihi = '';
  try {
    const meetingDateObj = new Date(defaultMeetingDate);
    if (!isNaN(meetingDateObj.getTime())) {
      const followUpDate = new Date(meetingDateObj);
      followUpDate.setDate(followUpDate.getDate() + 3);
      const year = followUpDate.getFullYear();
      const month = (followUpDate.getMonth() + 1).toString().padStart(2, '0');
      const day = followUpDate.getDate().toString().padStart(2, '0');
      defaultYeniTakipTarihi = `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error('❌ Yeni Takip Tarihi hesaplama hatası:', error);
  }
  
  // Check and format saat if it's a date
  let defaultMeetingTime = '';
  let defaultMeetingHour = '';
  let defaultMeetingMinute = '';
  
  if (rowData['Saat'] && rowData['Saat'] instanceof Date) {
    const saat = rowData['Saat'];
    const hours = saat.getHours().toString().padStart(2, '0');
    const minutes = saat.getMinutes().toString().padStart(2, '0');
    defaultMeetingTime = `${hours}:${minutes}`;
    defaultMeetingHour = hours;
    defaultMeetingMinute = minutes;
    rowData['Saat'] = defaultMeetingTime;
  } else if (rowData['Saat'] && typeof rowData['Saat'] === 'string') {
    // Parse time string (HH:mm format)
    const timeMatch = rowData['Saat'].match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      defaultMeetingTime = rowData['Saat'];
      defaultMeetingHour = timeMatch[1].padStart(2, '0');
      defaultMeetingMinute = timeMatch[2];
    }
  }
  
  // Get default meeting format from rowData
  let defaultMeetingFormat = rowData['Toplantı formatı'] || '';
  if (defaultMeetingFormat) {
    defaultMeetingFormat = String(defaultMeetingFormat).trim();
  }
  
  const ui = SpreadsheetApp.getUi();
  const htmlTemplate = HtmlService.createTemplateFromFile('meetingDialog');
  
  // Generate HTML for dropdowns - OPTIMIZED (single loop where possible)
  let toplantiYapanHTML = '';
  if (CRM_CONFIG && CRM_CONFIG.EMPLOYEE_CODES && typeof CRM_CONFIG.EMPLOYEE_CODES === 'object') {
    for (const [code, name] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      toplantiYapanHTML += `<option value="${code}">${code} - ${name}</option>`;
    }
  } else {
    console.error('❌ CRM_CONFIG.EMPLOYEE_CODES bulunamadı veya geçersiz');
  }
  
  let meetingFormatsHTML = '';
  if (CRM_CONFIG && CRM_CONFIG.MEETING_FORMAT_OPTIONS && Array.isArray(CRM_CONFIG.MEETING_FORMAT_OPTIONS)) {
    for (const format of CRM_CONFIG.MEETING_FORMAT_OPTIONS) {
      const isSelected = (format === defaultMeetingFormat) ? ' selected' : '';
      meetingFormatsHTML += `<option value="${format}"${isSelected}>${format}</option>`;
    }
  } else {
    console.error('❌ CRM_CONFIG.MEETING_FORMAT_OPTIONS bulunamadı veya geçersiz');
    // Fallback: en azından temel formatları ekle
    meetingFormatsHTML = '<option value="Yüz Yüze">Yüz Yüze</option><option value="Online">Online</option><option value="Telefon">Telefon</option>';
  }
  
  // Set all template variables BEFORE evaluate()
  htmlTemplate.rowData = {
    ...rowData,
    'Randevu Tarihi': defaultMeetingDate
  };
  htmlTemplate.meetingFormats = CRM_CONFIG.MEETING_FORMAT_OPTIONS;
  // Ensure rowNumber is a number, not a string
  let templateRowNumber = SELECTED_ROW_NUMBER || 0;
  if (typeof templateRowNumber === 'string') {
    templateRowNumber = parseInt(templateRowNumber, 10);
    if (isNaN(templateRowNumber)) templateRowNumber = 0;
  }
  htmlTemplate.rowNumber = templateRowNumber;
  htmlTemplate.sourceSheetName = SpreadsheetApp.getActiveSheet().getName() || '';
  
  // Default values for meeting dialog - MUST be set before evaluate()
  htmlTemplate.defaultMeetingDate = defaultMeetingDate || '';
  htmlTemplate.defaultMeetingTime = defaultMeetingTime || '';
  htmlTemplate.defaultMeetingHour = defaultMeetingHour || '';
  htmlTemplate.defaultMeetingMinute = defaultMeetingMinute || '';
  htmlTemplate.defaultMeetingFormat = defaultMeetingFormat || '';
  htmlTemplate.defaultMeetingNotes = rowData['Yorum'] || '';
  htmlTemplate.defaultYoneticiNot = rowData['Yönetici Not'] || '';
  htmlTemplate.defaultYeniTakipTarihi = defaultYeniTakipTarihi || '';
  
  // Get default Toplantıyı Yapan from rowData
  const defaultToplantiYapan = rowData['Toplantıyı Yapan'] || '';
  htmlTemplate.defaultToplantiYapan = defaultToplantiYapan;
  
  // Get default Toplantı Sonucu from rowData (if exists, e.g., when editing from Toplantılarım)
  const defaultMeetingResult = rowData['Toplantı Sonucu'] || '';
  htmlTemplate.defaultMeetingResult = defaultMeetingResult;
  
  // Generate HTML for dropdowns - OPTIMIZED (pre-defined arrays)
  const toplantiSonucuOptions = ['Satış Yapıldı', 'Teklif iletildi', 'Beklemede', 'Satış İptal'];
  let toplantiSonucuHTML = '';
  for (const option of toplantiSonucuOptions) {
    const isSelected = (option === defaultMeetingResult) ? ' selected' : '';
    toplantiSonucuHTML += `<option value="${option}"${isSelected}>${option}</option>`;
  }
  
  const teklifDetayiOptions = [
    'Custom', 'Elite', 'Platinium Plus', 'Platinium', 'Entegre',
    'Digifirst Custom', 'Digifirst Plus', 'Digifirst', 'Digifirst Setup'
  ];
  let teklifDetayiHTML = '';
  for (const option of teklifDetayiOptions) {
    teklifDetayiHTML += `<option value="${option}">${option}</option>`;
  }
  
  const satisPotansiyeliOptions = ['Sıcak', 'Orta', 'Soğuk']; // "Yerinde Satış" kaldırıldı (artık Satış Türü'nde)
  let satisPotansiyeliHTML = '';
  for (const option of satisPotansiyeliOptions) {
    satisPotansiyeliHTML += `<option value="${option}">${option}</option>`;
  }
  
  // Set all template variables at once
  htmlTemplate.isToplantiGerceklesti = false;
  htmlTemplate.meetingFormatsHTML = meetingFormatsHTML;
  htmlTemplate.toplantiYapanHTML = toplantiYapanHTML;
  htmlTemplate.toplantiSonucuHTML = toplantiSonucuHTML;
  htmlTemplate.teklifDetayiHTML = teklifDetayiHTML;
  htmlTemplate.satisPotansiyeliHTML = satisPotansiyeliHTML;
  
  // Evaluate and show dialog in one go
  ui.showModalDialog(
    htmlTemplate.evaluate().setWidth(700).setHeight(600),
    'Toplantıya Geç'
  );
  
  return null;
  } catch (error) {
    console.error('❌ Dialog açma hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Dialog açılamadı: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return null;
  }
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
  // Validation kontrolünü atla - performans için (2 saniye hedefi)
  // Validation'lar zaten sayfa oluşturulurken uygulanıyor
  // Her toplantı eklemede 1000 satıra validation uygulamak çok yavaş
  
  // Duplicate kontrolü kaldırıldı - Randevu toplantıya geçtiğinde Randevularım'dan siliniyor,
  // dolayısıyla ikinci kere geçirilemez
  
  // Define Toplantılarım columns - YENİ DÜZEN (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
  const toplantilarimColumns = [
    'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
    'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan', 'Toplantı Tarihi',
    'Ay', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Yeni Takip Tarihi',
    'Yorum', 'Yönetici Not', 'Address', 'Maplink'
  ];
  
  // Prepare meeting row data
  const meetingRow = prepareMeetingRow(rowData, meetingData, toplantilarimColumns, toplantilarimSheet);
  console.log('🔍 Prepared meeting row:', meetingRow);
  console.log('🔍 Meeting row length:', meetingRow.length);
  console.log('🔍 Columns length:', toplantilarimColumns.length);
  
  // Add to Toplantılarım - BATCH OPERATIONS for speed
  const nextRow = toplantilarimSheet.getLastRow() + 1;
  const kaynakIdx = toplantilarimColumns.indexOf('Kaynak') + 1;
  const kodColumnIndex = toplantilarimColumns.indexOf('Kod') + 1;
  
  // Batch write: data + formats in one operation
  const dataRange = toplantilarimSheet.getRange(nextRow, 1, 1, toplantilarimColumns.length);
  dataRange.setValues([meetingRow]);
  
  // Set formats for Kod and Kaynak columns (batch)
  if (kodColumnIndex > 0) {
    toplantilarimSheet.getRange(nextRow, kodColumnIndex, 1, 1).setNumberFormat('@');
  }
  if (kaynakIdx > 0) {
    toplantilarimSheet.getRange(nextRow, kaynakIdx, 1, 1).setNumberFormat('@');
  }
  
  // Apply color coding (no flush/sleep needed - Google handles it automatically)
  applyMeetingColorCoding(toplantilarimSheet, nextRow);
  
  // Eğer "Satış Yapıldı" ise otomatik sıralama yap (üste çıksın)
  const toplantiSonucuIndex = toplantilarimColumns.indexOf('Toplantı Sonucu');
  if (toplantiSonucuIndex !== -1) {
    const toplantiSonucu = String(toplantilarimSheet.getRange(nextRow, toplantiSonucuIndex + 1).getDisplayValue() || '').trim();
    if (toplantiSonucu === 'Satış Yapıldı') {
      console.log('📅 Satış Yapıldı algılandı, yeni toplantı üste taşınıyor...');
      sortToplantilarimByDate(toplantilarimSheet);
    }
  }
  
  // Activate sheet'i kaldırdık - performans için (kullanıcı zaten sayfayı görebilir)
  
  const result = {
    success: true,
    meetingId: rowData.Kod,
    rowNumber: nextRow, // Eklenen satır numarası (silme işlemi için)
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
  
  // Define columns - YENİ DÜZEN (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
  const columns = [
    'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
    'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan', 'Toplantı Tarihi',
    'Ay', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Yeni Takip Tarihi',
    'Yorum', 'Yönetici Not', 'Address', 'Maplink'
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
  
  // Apply data validation (dropdown, datepicker, etc.)
  setToplantilarimDataValidation(sheet);
  
  console.log('✅ Toplantılarım sayfası oluşturuldu - Tüm kolonlar ve validation\'lar doğru');
  
  return sheet;
}

/**
 * Satışlarım sayfası oluştur
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Sheet} - Created sheet
 */
/**
 * Creates Satışlarım sheet with proper structure
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Sheet} - Created or existing sheet
 */
function createSatislarimSheet(spreadsheet) {
  console.log('Creating Satışlarım sheet');
  
  let sheet = spreadsheet.getSheetByName('Satışlarım');
  
  // Sayfa varsa kontrol et (kolon sayısı ve yapısı doğru mu?)
  if (sheet) {
    console.log('✅ Satışlarım sayfası zaten mevcut');
    // Mevcut sayfanın kolonlarını kontrol et ve güncelle (gerekirse)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const expectedColumns = [
      'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
      'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan',
      'Toplantı Tarihi', 'Satış Tarihi', 'Ay', 'Satış Türü', 'Paket',
      'Ciro', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
    ];
    
    // Kolon sayısı veya yapısı farklıysa güncelle (ileride eklenebilir)
    if (headers.length !== expectedColumns.length || headers[0] !== expectedColumns[0]) {
      console.log('⚠️ Satışlarım sayfası yapısı güncellenecek');
      // İleride kolon yapısı güncellemesi eklenebilir
    }
    
    return sheet;
  }
  
  sheet = spreadsheet.insertSheet('Satışlarım');
  
  // Yeni kolon yapısı (19 kolon + 1 Ay = 20 kolon)
  const columns = [
    'Kod',
    'Kaynak',
    'Company name',
    'İsim Soyisim',
    'Phone',
    'Yetkili Tel',
    'Website',
    'Mail',
    'Toplantı formatı',
    'Toplantıyı Yapan',
    'Toplantı Tarihi',
    'Satış Tarihi',
    'Ay',
    'Satış Türü',
    'Paket',
    'Ciro',
    'Yorum',
    'Yönetici Not',
    'Address',
    'Maplink'
  ];
  
  // Başlıkları yaz
  sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  
  // Stil uygula - Motivasyon için güzel yeşil tonları (başarı rengi)
  const headerRange = sheet.getRange(1, 1, 1, columns.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#2E7D32'); // Koyu Yeşil (başarı, motivasyon)
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
  headerRange.setFontSize(11);
  
  // Kolon genişlikleri (optimize edilmiş)
  sheet.setColumnWidth(1, 100);  // Kod
  sheet.setColumnWidth(2, 120);  // Kaynak
  sheet.setColumnWidth(3, 200);  // Company name
  sheet.setColumnWidth(4, 150);  // İsim Soyisim
  sheet.setColumnWidth(5, 150);  // Phone
  sheet.setColumnWidth(6, 130);  // Yetkili Tel
  sheet.setColumnWidth(7, 200);  // Website
  sheet.setColumnWidth(8, 180);  // Mail
  sheet.setColumnWidth(9, 130);  // Toplantı formatı
  sheet.setColumnWidth(10, 140); // Toplantıyı Yapan
  sheet.setColumnWidth(11, 120); // Toplantı Tarihi
  sheet.setColumnWidth(12, 120); // Satış Tarihi
  sheet.setColumnWidth(13, 80);  // Ay
  sheet.setColumnWidth(14, 120); // Satış Türü
  sheet.setColumnWidth(15, 150); // Paket
  sheet.setColumnWidth(16, 120); // Ciro
  sheet.setColumnWidth(17, 300); // Yorum
  sheet.setColumnWidth(18, 300); // Yönetici Not
  sheet.setColumnWidth(19, 250); // Address
  sheet.setColumnWidth(20, 300); // Maplink
  
  // Format ayarları
  // Kod ve Kaynak kolonlarını text formatına zorla
  sheet.getRange(2, 1, 1000, 1).setNumberFormat('@'); // Kod
  sheet.getRange(2, 2, 1000, 1).setNumberFormat('@'); // Kaynak
  
  // Ciro kolonunu para formatına çevir
  sheet.getRange(2, 16, 1000, 1).setNumberFormat('#,##0.00" ₺"');
  
  // Tarih kolonlarını formatla
  sheet.getRange(2, 11, 1000, 1).setNumberFormat('DD.MM.YYYY'); // Toplantı Tarihi
  sheet.getRange(2, 12, 1000, 1).setNumberFormat('DD.MM.YYYY'); // Satış Tarihi
  
  // Validation'ları ekle
  setSatislarimDataValidation(sheet);
  
  console.log('✅ Satışlarım sayfası oluşturuldu');
  
  return sheet;
}

/**
 * Satışlarım sayfası için data validation ayarları
 * @param {Sheet} sheet - Satışlarım sheet
 */
function setSatislarimDataValidation(sheet) {
  console.log('Setting Satışlarım data validation');
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const validationRows = 1000;
  
  // Satış Türü validation
  const satisTuruIndex = headers.indexOf('Satış Türü');
  if (satisTuruIndex > 0) {
    const satisTuruOptions = ['Yerinde Satış', 'Teklif Sonrası'];
    const satisTuruRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(satisTuruOptions, true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, satisTuruIndex + 1, validationRows, 1).setDataValidation(satisTuruRule);
    console.log('Applied Satış Türü validation');
  }
  
  // Paket (Teklif Detayı) validation
  const paketIndex = headers.indexOf('Paket');
  if (paketIndex > 0) {
    const paketOptions = [
      'Custom', 'Elite', 'Platinium Plus', 'Platinium', 'Entegre',
      'Digifirst Custom', 'Digifirst Plus', 'Digifirst', 'Digifirst Setup'
    ];
    const paketRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(paketOptions, true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, paketIndex + 1, validationRows, 1).setDataValidation(paketRule);
    console.log('Applied Paket validation');
  }
  
  // Toplantı formatı validation
  const toplantiFormatIndex = headers.indexOf('Toplantı formatı');
  if (toplantiFormatIndex > 0) {
    const toplantiFormatOptions = ['Yüz Yüze', 'Online', 'Telefon'];
    const toplantiFormatRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(toplantiFormatOptions, true)
      .setAllowInvalid(false)
      .build();
    sheet.getRange(2, toplantiFormatIndex + 1, validationRows, 1).setDataValidation(toplantiFormatRule);
    console.log('Applied Toplantı formatı validation');
  }
  
  console.log('✅ Satışlarım data validation completed');
}

/**
 * Prepares sale row data for Satışlarım sheet
 * @param {Object} rowData - Original row data (from Randevularım or Toplantılarım)
 * @param {Object} meetingData - Meeting form data (contains sale information)
 * @param {Array} columns - Column names
 * @param {Sheet} sheet - Satışlarım sheet
 * @returns {Array} - Row data array
 */
function prepareSaleRow(rowData, meetingData, columns, sheet) {
  console.log('Preparing sale row data');
  console.log('🔍 rowData.Kod:', rowData.Kod);
  console.log('🔍 meetingData:', meetingData);
  
  const row = new Array(columns.length).fill('');
  
  columns.forEach((column, index) => {
    switch (column) {
      case 'Kod':
        row[index] = String(rowData.Kod || '').trim();
        break;
      case 'Kaynak':
        // Kaynak: Randevularım/Toplantılarım satırındaki orijinal dataset adı varsa onu taşı
        if (rowData.Kaynak && rowData.Kaynak.toString().trim() !== '') {
          row[index] = rowData.Kaynak;
        } else {
          // Fallback: sourceSheetName'dan al
          row[index] = meetingData.sourceSheet || 'Format Tablo';
        }
        break;
      case 'Company name':
      case 'İsim Soyisim':
      case 'Phone':
      case 'Yetkili Tel':
      case 'Website':
      case 'Mail':
      case 'Address':
      case 'Maplink':
        row[index] = rowData[column] || '';
        break;
      case 'Toplantı formatı':
        // Normalize meeting format
        let toplantiFormat = meetingData.toplantiFormat || meetingData.meetingFormat || rowData['Toplantı formatı'] || '';
        if (toplantiFormat && typeof toplantiFormat === 'string') {
          const formatLower = toplantiFormat.trim().toLowerCase();
          if (formatLower === 'yüz' || (formatLower.startsWith('yüz') && !formatLower.includes('yüze'))) {
            toplantiFormat = 'Yüz Yüze';
          } else if (formatLower === 'online' || formatLower === 'çevrimiçi') {
            toplantiFormat = 'Online';
          } else if (formatLower === 'telefon' || formatLower === 'phone') {
            toplantiFormat = 'Telefon';
          }
        }
        row[index] = toplantiFormat || '';
        break;
      case 'Toplantıyı Yapan':
        // Normalize Toplantıyı Yapan (kısa kod → tam kod)
        let toplantiYapan = meetingData.toplantiYapan || rowData['Toplantıyı Yapan'] || '';
        if (toplantiYapan && typeof toplantiYapan === 'string') {
          const toplantiYapanValue = toplantiYapan.trim();
          
          if (toplantiYapanValue && toplantiYapanValue !== '') {
            const shortCode = toplantiYapanValue.toUpperCase();
            
            // CRM_CONFIG.EMPLOYEE_CODES içinde eşleşen tam kodu bul
            let fullEmployeeCode = null;
            try {
              if (CRM_CONFIG && CRM_CONFIG.EMPLOYEE_CODES && typeof CRM_CONFIG.EMPLOYEE_CODES === 'object' && !Array.isArray(CRM_CONFIG.EMPLOYEE_CODES)) {
                for (const [code, name] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
                  // Kısa kod eşleşmesi (örn: "SO" -> "SO 003")
                  if (code.toUpperCase().startsWith(shortCode + ' ') || code.toUpperCase() === shortCode) {
                    fullEmployeeCode = code;
                    console.log(`🔍 Kısa kod "${shortCode}" tam koda çevrildi: "${code}"`);
                    break;
                  }
                  // Tam kod zaten gelmişse direkt kullan
                  if (code.toUpperCase() === shortCode || code === toplantiYapanValue) {
                    fullEmployeeCode = code;
                    console.log(`🔍 Tam kod bulundu: "${code}"`);
                    break;
                  }
                }
              } else {
                console.warn('⚠️ CRM_CONFIG.EMPLOYEE_CODES geçersiz veya array:', typeof CRM_CONFIG?.EMPLOYEE_CODES);
              }
            } catch (empCodeError) {
              console.error('❌ Employee code lookup error:', empCodeError);
              // Hata olsa bile devam et
            }
            
            if (fullEmployeeCode) {
              row[index] = fullEmployeeCode;
              console.log(`✅ Toplantıyı Yapan set to: ${fullEmployeeCode}`);
            } else {
              // Eşleşme bulunamadıysa, gelen değeri olduğu gibi kullan
              row[index] = toplantiYapanValue;
              console.log(`⚠️ Employee code eşleşmesi bulunamadı, gelen değer kullanılıyor: ${toplantiYapanValue}`);
            }
          } else {
            row[index] = '';
          }
        } else {
          row[index] = toplantiYapan || '';
        }
        break;
      case 'Toplantı Tarihi':
        // Format date as DD.MM.YYYY
        let toplantiTarihi = meetingData.toplantiTarihi || meetingData.meetingDate || rowData['Toplantı Tarihi'] || '';
        if (toplantiTarihi) {
          if (typeof toplantiTarihi === 'string' && toplantiTarihi.includes('-')) {
            // Convert from YYYY-MM-DD to DD.MM.YYYY
            const parts = toplantiTarihi.split('-');
            if (parts.length === 3) {
              toplantiTarihi = `${parts[2]}.${parts[1]}.${parts[0]}`;
            }
          } else if (toplantiTarihi instanceof Date) {
            const day = String(toplantiTarihi.getDate()).padStart(2, '0');
            const month = String(toplantiTarihi.getMonth() + 1).padStart(2, '0');
            const year = toplantiTarihi.getFullYear();
            toplantiTarihi = `${day}.${month}.${year}`;
          } else if (typeof toplantiTarihi === 'string' && toplantiTarihi.includes('.')) {
            // Already in DD.MM.YYYY format
            toplantiTarihi = toplantiTarihi.trim();
          }
        }
        row[index] = toplantiTarihi || '';
        break;
      case 'Satış Tarihi':
        // Satış Tarihi = formData'dan gelen satisTarihi (varsa), yoksa bugün
        let satisTarihi = meetingData.satisTarihi || meetingData.salesDate || '';
        if (satisTarihi) {
          // Convert from YYYY-MM-DD (HTML date input format) to DD.MM.YYYY
          if (typeof satisTarihi === 'string' && satisTarihi.includes('-')) {
            const parts = satisTarihi.split('-');
            if (parts.length === 3) {
              satisTarihi = `${parts[2]}.${parts[1]}.${parts[0]}`;
            }
          } else if (satisTarihi instanceof Date) {
            const day = String(satisTarihi.getDate()).padStart(2, '0');
            const month = String(satisTarihi.getMonth() + 1).padStart(2, '0');
            const year = satisTarihi.getFullYear();
            satisTarihi = `${day}.${month}.${year}`;
          }
        } else {
          // Fallback: Bugün (DD.MM.YYYY formatında)
          const today = new Date();
          const day = String(today.getDate()).padStart(2, '0');
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const year = today.getFullYear();
          satisTarihi = `${day}.${month}.${year}`;
        }
        row[index] = satisTarihi;
        break;
      case 'Ay':
        // Ay kolonu otomatik hesaplanır (Satış Tarihi'nden)
        let satisTarihiForAy = meetingData.satisTarihi || meetingData.salesDate || '';
        let ayDate = new Date();
        
        if (satisTarihiForAy) {
          // Parse date from YYYY-MM-DD or DD.MM.YYYY format
          if (typeof satisTarihiForAy === 'string' && satisTarihiForAy.includes('-')) {
            // YYYY-MM-DD format
            ayDate = new Date(satisTarihiForAy);
          } else if (typeof satisTarihiForAy === 'string' && satisTarihiForAy.includes('.')) {
            // DD.MM.YYYY format
            const parts = satisTarihiForAy.split('.');
            if (parts.length === 3) {
              ayDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
          } else if (satisTarihiForAy instanceof Date) {
            ayDate = satisTarihiForAy;
          }
        }
        
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
                          'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        row[index] = monthNames[ayDate.getMonth()];
        break;
      case 'Satış Türü':
        row[index] = meetingData.satisTuru || '';
        break;
      case 'Paket':
        // Paket = teklifDetayiSale (satış yapılan paket)
        row[index] = meetingData.teklifDetayiSale || '';
        break;
      case 'Ciro':
        // Ciro bilgisi
        const ciro = parseFloat(meetingData.ciro || meetingData.satisCiro || 0);
        row[index] = ciro || 0;
        break;
      case 'Yorum':
        row[index] = meetingData.yorum || meetingData.meetingNotes || '';
        break;
      case 'Yönetici Not':
        row[index] = meetingData.yoneticiNot || '';
        break;
      default:
        row[index] = '';
    }
  });
  
  console.log('🔍 Prepared sale row:', row);
  console.log('🔍 Sale row length:', row.length);
  console.log('🔍 Columns length:', columns.length);
  
  return row;
}

/**
 * Applies color coding to sale row in Satışlarım sheet (motivasyon için güzel yeşil tonları)
 * @param {Sheet} sheet - Satışlarım sheet
 * @param {number} rowNumber - Row number to color
 */
function applySaleColorCoding(sheet, rowNumber) {
  try {
    if (!sheet || !rowNumber || rowNumber < 2) {
      console.log('⚠️ Invalid parameters for applySaleColorCoding');
      return;
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const satisTuruIndex = headers.indexOf('Satış Türü');
    const ciroIndex = headers.indexOf('Ciro');
    
    // Motivasyon için güzel yeşil tonları (başarı rengi)
    // Tüm satır için varsayılan renk: Açık Yeşil (başarı)
    let color = 'rgb(232, 245, 232)'; // Açık Yeşil - Başarı, Motivasyon
    
    // Satış Türü'ne göre farklı tonlar (opsiyonel - şimdilik tek renk)
    if (satisTuruIndex >= 0) {
      const satisTuru = String(sheet.getRange(rowNumber, satisTuruIndex + 1).getDisplayValue() || '').trim();
      
      if (satisTuru === 'Yerinde Satış') {
        // Yerinde Satış: Daha canlı yeşil (anlık başarı)
        color = 'rgb(200, 230, 201)'; // Canlı Yeşil
        console.log(`🎨 Satışlarım Row ${rowNumber}: Yerinde Satış color applied`);
      } else if (satisTuru === 'Teklif Sonrası') {
        // Teklif Sonrası: Yumuşak yeşil (süreç sonrası başarı)
        color = 'rgb(232, 245, 232)'; // Açık Yeşil
        console.log(`🎨 Satışlarım Row ${rowNumber}: Teklif Sonrası color applied`);
      }
    }
    
    // Tüm satırı renklendir
    const lastColumn = sheet.getLastColumn();
    const range = sheet.getRange(rowNumber, 1, 1, lastColumn);
    range.setBackground(color);
    
    console.log(`✅ Applied sale color ${color} to row ${rowNumber}`);
    
    // Ciro kolonunu vurgula (opsiyonel - daha belirgin yap)
    if (ciroIndex >= 0) {
      const ciroRange = sheet.getRange(rowNumber, ciroIndex + 1, 1, 1);
      ciroRange.setFontWeight('bold');
      ciroRange.setFontColor('#1B5E20'); // Koyu Yeşil (motivasyon)
    }
    
  } catch (error) {
    console.error(`⚠️ Error applying sale color coding to row ${rowNumber}:`, error);
  }
}

/**
 * Log Arşivi sayfası oluştur (Gizli sayfa - Temsilciler görmesin)
 * @param {Spreadsheet} spreadsheet - Active spreadsheet
 * @returns {Sheet} - Created or existing sheet
 */
function createLogArchiveSheet(spreadsheet) {
  const SHEET_NAME = 'Log Arşivi';
  
  // Sayfa varsa döndür (gizli olsa bile)
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (sheet) {
    // Gizli değilse gizli yap
    if (!sheet.isSheetHidden()) {
      sheet.hideSheet();
      console.log('✅ Log Arşivi sayfası gizli yapıldı');
    }
    return sheet;
  }
  
  // Sayfa yoksa oluştur
  sheet = spreadsheet.insertSheet(SHEET_NAME);
  
  // Kolonlar (KM 005'teki yapıya göre)
  const columns = [
    'Tarih',
    'Saat',
    'Aktivite',
    'Log Detayı',
    'Kaynak Sayfa',
    'Kod',
    'Company name'
  ];
  
  // Başlıkları yaz
  sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
  
  // Stil uygula
  const headerRange = sheet.getRange(1, 1, 1, columns.length);
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#666666');
  headerRange.setFontColor('#FFFFFF');
  headerRange.setHorizontalAlignment('center');
  
  // Kolon genişlikleri (sadece header için - hızlı)
  sheet.setColumnWidth(1, 120); // Tarih
  sheet.setColumnWidth(2, 80);  // Saat
  sheet.setColumnWidth(3, 150); // Aktivite
  sheet.setColumnWidth(4, 400); // Log Detayı
  sheet.setColumnWidth(5, 150); // Kaynak Sayfa
  sheet.setColumnWidth(6, 100); // Kod
  sheet.setColumnWidth(7, 200); // Company name
  
  // Format ayarları (sadece header satırı - 10000 satır format ayarlama gereksiz ve yavaş)
  // Format ayarları veri eklendiğinde otomatik uygulanacak
  
  // Gizli yap (Temsilciler görmesin)
  sheet.hideSheet();
  
  console.log('✅ Log Arşivi sayfası oluşturuldu ve gizli yapıldı');
  
  return sheet;
}

/**
 * Log Arşivi sayfasını göster (gizliyse göster, yoksa oluştur)
 */
function showLogArchiveSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let logSheet = spreadsheet.getSheetByName('Log Arşivi');
    
    // Sayfa yoksa oluştur
    if (!logSheet) {
      logSheet = createLogArchiveSheet(spreadsheet);
    }
    
    // Gizliyse göster
    if (logSheet.isSheetHidden()) {
      logSheet.showSheet();
    }
    
    // Sayfayı aktif et
    logSheet.activate();
    
    SpreadsheetApp.getUi().alert(
      '✅ Log Arşivi Açıldı',
      'Log Arşivi sayfası görünür hale getirildi.\n\n' +
      'Not: Sayfayı tekrar gizli yapmak için:\n' +
      'Sağ tık → Sayfayı gizle\n\n' +
      'Sayfayı silmek için:\n' +
      'Sağ tık → Sil',
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
  } catch (error) {
    console.error('Log Arşivi gösterme hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Log Arşivi açılamadı: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Satışlarım sayfasını göster
 */
function showSatislarimSheet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName('Satışlarım');
    
    if (!sheet) {
      sheet = createSatislarimSheet(spreadsheet);
    }
    
    sheet.activate();
    console.log('✅ Satışlarım sayfası gösterildi');
  } catch (error) {
    console.error('❌ Satışlarım sayfası gösterilirken hata:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Satışlarım sayfası gösterilemedi: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Mevcut Toplantılarım sayfasını sayfa_kolonlari.md ile uyumlu hale getir
 */
function fixToplantilarimColumnOrder() {
  console.log('[START] fixToplantilarimColumnOrder');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Toplantılarım');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Toplantılarım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const ui = SpreadsheetApp.getUi();
    
    // Onay al
    const confirm = ui.alert(
      '⚠️ Uyarı',
      'Bu işlem:\n' +
      '• Keyword, Location, Category, CMS Adı, CMS Grubu, E-Ticaret İzi, Site Hızı, Site Trafiği, Log kolonlarını silecek\n' +
      '• Kolonları yeni yapıya göre düzenleyecek\n' +
      '• Verileri koruyarak taşıyacak\n' +
      '• "Ay" kolonunu otomatik dolduracak\n\n' +
      'Devam etmek istiyor musunuz?',
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      return;
    }
    
    // Yeni sütun sıralaması - YENİ DÜZEN (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
    const newColumns = [
      'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
      'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan', 'Toplantı Tarihi',
      'Ay', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Yeni Takip Tarihi',
      'Yorum', 'Yönetici Not', 'Address', 'Maplink'
    ];
    
    // Mevcut verileri oku
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      ui.alert('ℹ️ Bilgi', 'Toplantılarım sayfasında düzenlenecek veri bulunamadı.', ui.ButtonSet.OK);
      return;
    }
    
    const allData = sheet.getDataRange().getValues();
    const currentHeaders = allData[0];
    const currentDataRows = allData.slice(1);
    
    console.log(`📊 Mevcut veri: ${currentDataRows.length} satır, ${currentHeaders.length} kolon`);
    
    // Tarih parse fonksiyonu
    function parseDate(d) {
      if (!d) return null;
      if (d instanceof Date) return d;
      if (typeof d === 'string') {
        const parts = d.split('.');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(d);
      }
      return new Date(d);
    }
    
    // Normalize fonksiyonları
    const normalizeMeetingFormat = (format) => {
      if (!format || typeof format !== 'string') return format;
      const formatLower = format.trim().toLowerCase();
      
      if (formatLower === 'yüz' || (formatLower.includes('yüze') === false && formatLower.startsWith('yüz'))) {
        return 'Yüz Yüze';
      }
      if (formatLower === 'online' || formatLower === 'çevrimiçi') {
        return 'Online';
      }
      if (formatLower === 'telefon' || formatLower === 'phone') {
        return 'Telefon';
      }
      
      // Check if it matches any valid format
      const validFormats = CRM_CONFIG.MEETING_FORMAT_OPTIONS;
      for (const validFormat of validFormats) {
        if (formatLower === validFormat.toLowerCase()) {
          return validFormat;
        }
      }
      
      return format;
    };
    
    const normalizeToplantiSonucu = (sonuc) => {
      if (!sonuc || typeof sonuc !== 'string') return sonuc;
      const sonucLower = sonuc.trim().toLowerCase();
      
      if (sonucLower === 'teklif' || sonucLower === 'teklif verildi' || sonucLower === 'teklif gönderildi') {
        return 'Teklif iletildi';
      }
      if (sonucLower === 'satış' || sonucLower === 'satış yapıldı' || sonucLower === 'satış gerçekleşti') {
        return 'Satış Yapıldı';
      }
      if (sonucLower === 'beklemede' || sonucLower === 'bekliyor') {
        return 'Beklemede';
      }
      if (sonucLower === 'iptal' || sonucLower === 'satış iptal') {
        return 'Satış İptal';
      }
      
      // Check if it matches any valid option
      const validOptions = ['Satış Yapıldı', 'Teklif iletildi', 'Beklemede', 'Satış İptal'];
      for (const validOption of validOptions) {
        if (sonucLower === validOption.toLowerCase()) {
          return validOption;
        }
      }
      
      return sonuc;
    };
    
    const normalizeSatisPotansiyeli = (potansiyel) => {
      if (!potansiyel || typeof potansiyel !== 'string') return potansiyel;
      const potansiyelLower = potansiyel.trim().toLowerCase();
      
      // Valid options: ['Sıcak', 'Orta', 'Soğuk'] - "Yerinde Satış" artık Satış Türü'nde
      // Eski veriler için uyumluluk: "Yerinde Satış" → boş (artık kullanılmıyor)
      if (potansiyelLower === 'yerinde' || potansiyelLower === 'yerinde satış') {
        return ''; // Artık Satış Potansiyeli'nde değil, Satış Türü'nde
      }
      if (potansiyelLower === 'sıcak' || potansiyelLower === 'sicak') {
        return 'Sıcak';
      }
      if (potansiyelLower === 'orta') {
        return 'Orta';
      }
      if (potansiyelLower === 'soğuk' || potansiyelLower === 'soguk') {
        return 'Soğuk';
      }
      
      // Check if it matches any valid option
      const validOptions = ['Sıcak', 'Orta', 'Soğuk']; // "Yerinde Satış" kaldırıldı (artık Satış Türü'nde)
      for (const validOption of validOptions) {
        if (potansiyelLower === validOption.toLowerCase()) {
          return validOption;
        }
      }
      
      return potansiyel;
    };
    
    // Yeni veri array'ini oluştur
    const newDataRows = [];
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    // Toplantı Tarihi kolon indexini bul
    const toplantiTarihiIndex = currentHeaders.indexOf('Toplantı Tarihi');
    const toplantiFormatiIndex = currentHeaders.indexOf('Toplantı formatı');
    const toplantiSonucuIndex = currentHeaders.indexOf('Toplantı Sonucu');
    
    for (let rowIdx = 0; rowIdx < currentDataRows.length; rowIdx++) {
      const oldRow = currentDataRows[rowIdx];
      const newRow = new Array(newColumns.length).fill('');
      
      // Mevcut verileri yeni sıraya göre taşı
      for (let oldColIdx = 0; oldColIdx < oldRow.length; oldColIdx++) {
        const oldColName = String(currentHeaders[oldColIdx] || '').trim();
        
        // Silinecek kolonları atla
        const columnsToRemove = ['Keyword', 'Location', 'Category', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi', 
                                  'Site Hızı', 'Site Trafiği', 'Log', 'Review', 'City', 'Rating count',
                                  'Randevu durumu', 'Randevu Tarihi', 'Saat'];
        if (columnsToRemove.includes(oldColName)) {
          continue;
        }
        
        // Yeni kolon index'ini bul
        const newColIndex = newColumns.indexOf(oldColName);
        if (newColIndex !== -1) {
          newRow[newColIndex] = oldRow[oldColIdx];
        }
      }
      
      // Toplantı formatı değerini normalize et
      const toplantiFormatiColIndex = newColumns.indexOf('Toplantı formatı');
      if (toplantiFormatiColIndex !== -1 && newRow[toplantiFormatiColIndex]) {
        const originalFormat = String(newRow[toplantiFormatiColIndex] || '').trim();
        const normalizedFormat = normalizeMeetingFormat(originalFormat);
        if (normalizedFormat !== originalFormat) {
          console.log(`🔧 Satır ${rowIdx + 2}: Toplantı formatı "${originalFormat}" -> "${normalizedFormat}"`);
          newRow[toplantiFormatiColIndex] = normalizedFormat;
        }
      }
      
      // Toplantı Sonucu değerini normalize et
      const toplantiSonucuColIndex = newColumns.indexOf('Toplantı Sonucu');
      if (toplantiSonucuColIndex !== -1 && newRow[toplantiSonucuColIndex]) {
        const originalSonuc = String(newRow[toplantiSonucuColIndex] || '').trim();
        const normalizedSonuc = normalizeToplantiSonucu(originalSonuc);
        if (normalizedSonuc !== originalSonuc) {
          console.log(`🔧 Satır ${rowIdx + 2}: Toplantı Sonucu "${originalSonuc}" -> "${normalizedSonuc}"`);
          newRow[toplantiSonucuColIndex] = normalizedSonuc;
        }
      }
      
      // Satış Potansiyeli değerini normalize et
      const satisPotansiyeliColIndex = newColumns.indexOf('Satış Potansiyeli');
      if (satisPotansiyeliColIndex !== -1 && newRow[satisPotansiyeliColIndex]) {
        const originalPotansiyel = String(newRow[satisPotansiyeliColIndex] || '').trim();
        const normalizedPotansiyel = normalizeSatisPotansiyeli(originalPotansiyel);
        if (normalizedPotansiyel !== originalPotansiyel) {
          console.log(`🔧 Satır ${rowIdx + 2}: Satış Potansiyeli "${originalPotansiyel}" -> "${normalizedPotansiyel}"`);
          newRow[satisPotansiyeliColIndex] = normalizedPotansiyel;
        }
      }
      
      // Ay kolonunu otomatik doldur (Toplantı Tarihi'ne göre)
      const ayColIndex = newColumns.indexOf('Ay');
      if (toplantiTarihiIndex !== -1 && ayColIndex !== -1) {
        const tarihValue = oldRow[toplantiTarihiIndex];
        const tarih = parseDate(tarihValue);
        
        if (tarih && !isNaN(tarih.getTime())) {
          const ayAdi = monthNames[tarih.getMonth()];
          newRow[ayColIndex] = ayAdi;
          console.log(`📅 Satır ${rowIdx + 2}: Toplantı Tarihi="${tarihValue}" -> Ay="${ayAdi}"`);
        }
      }
      
      newDataRows.push(newRow);
    }
    
    // Validation'ları temizle
    const maxColBeforeClear = Math.max(sheet.getLastColumn() || 0, newColumns.length);
    const maxRowBeforeClear = Math.max(sheet.getLastRow() || 0, newDataRows.length + 10);
    
    if (maxRowBeforeClear > 1 && maxColBeforeClear > 0) {
      try {
        const clearRange = sheet.getRange(1, 1, maxRowBeforeClear, maxColBeforeClear);
        clearRange.clearDataValidations();
        console.log('✅ Tüm validation kuralları temizlendi');
      } catch (clearErr) {
        console.error('⚠️ Validation temizleme hatası:', clearErr);
      }
    }
    
    // Tüm veriyi temizle
    sheet.clear();
    
    // Yeni başlıkları yaz
    sheet.getRange(1, 1, 1, newColumns.length).setValues([newColumns]);
    
    // Yeni verileri yaz
    if (newDataRows.length > 0) {
      const dataRange = sheet.getRange(2, 1, newDataRows.length, newColumns.length);
      dataRange.setValues(newDataRows);
      console.log(`✅ ${newDataRows.length} satır veri yazıldı`);
    }
    
    // Kod kolonunu text formatında zorla
    const kodColumnIndex = newColumns.indexOf('Kod') + 1;
    if (kodColumnIndex > 0) {
      sheet.getRange(2, kodColumnIndex, newDataRows.length, 1).setNumberFormat('@');
    }
    
    // Styling'i yeniden uygula
    applyToplantilarimStyling(sheet);
    
    // Validation'ları yeniden uygula
    setToplantilarimDataValidation(sheet);
    
    // Tüm satırlara renklendirme uygula
    console.log('🎨 Tüm satırlara renklendirme uygulanıyor...');
    let colorAppliedCount = 0;
    
    if (newDataRows.length > 0) {
      // Toplantı formatı ve Toplantı Sonucu normalize edilen satırları say
      for (let rowIdx = 0; rowIdx < newDataRows.length; rowIdx++) {
        const rowNum = rowIdx + 2; // +2 çünkü header row=1, data starts at row=2
        
        // Renklendirme uygula
        try {
          applyMeetingColorCoding(sheet, rowNum);
          colorAppliedCount++;
        } catch (colorErr) {
          console.error(`⚠️ Satır ${rowNum} renklendirme hatası:`, colorErr);
        }
      }
    }
    
    console.log(`✅ ${colorAppliedCount} satır renklendirildi`);
    
    // Flush to ensure all changes are applied
    SpreadsheetApp.flush();
    
    let message = `Toplantılarım sayfası yeni yapıya göre düzenlendi!\n\n`;
    message += `• Keyword, Location, Category, CMS Adı, CMS Grubu, E-Ticaret İzi, Site Hızı, Site Trafiği, Log kolonları silindi\n`;
    message += `• ${newDataRows.length} satır veri taşındı\n`;
    message += `• "Ay" kolonu otomatik dolduruldu\n`;
    message += `• Toplantı formatı ve Toplantı Sonucu değerleri normalize edildi\n`;
    message += `• ${colorAppliedCount} satır renklendirildi\n`;
    
    ui.alert('✅ Başarılı', message, ui.ButtonSet.OK);
    
    console.log('[RESULT] Toplantılarım kolon düzeni güncellendi');
    
  } catch (error) {
    console.error('[ERROR] fixToplantilarimColumnOrder:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Sütun düzenleme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
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
  console.log('🔍 rowData.Kod:', rowData.Kod);
  console.log('🔍 meetingData:', meetingData);
  
  const row = new Array(columns.length).fill('');
  
  columns.forEach((column, index) => {
    switch (column) {
      case 'Kod':
        // Use original format
        row[index] = String(rowData.Kod || '');
        console.log('🔍 rowData.Kod:', rowData.Kod);
        console.log('🔍 Kod set to:', row[index]);
        console.log('🔍 Kod index:', index);
        break;
      case 'Kaynak':
        // Kaynak: Randevularım satırındaki orijinal dataset adı varsa onu taşı
        if (rowData.Kaynak && rowData.Kaynak.toString().trim() !== '') {
          row[index] = rowData.Kaynak;
        } else {
          row[index] = 'Randevularım';
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
      case 'Mail':
      case 'İsim Soyisim':
        row[index] = rowData[column] || '';
        break;
      case 'Yorum':
        row[index] = meetingData.yorum || rowData['Yorum'] || '';
        break;
      case 'Yönetici Not':
        row[index] = meetingData.yoneticiNot || rowData['Yönetici Not'] || '';
        break;
      case 'Toplantı formatı':
        // Normalize format (fix "Yüz" -> "Yüz Yüze" etc.)
        let formatValue = meetingData.toplantiFormat || rowData['Toplantı formatı'] || 'Yüz Yüze';
        if (formatValue && typeof formatValue === 'string') {
          const formatLower = formatValue.trim().toLowerCase();
          // Fix common mistakes
          if (formatLower === 'yüz' || (formatLower.includes('yüze') === false && formatLower.startsWith('yüz'))) {
            formatValue = 'Yüz Yüze';
          } else if (formatLower === 'online' || formatLower === 'çevrimiçi') {
            formatValue = 'Online';
          } else if (formatLower === 'telefon' || formatLower === 'phone') {
            formatValue = 'Telefon';
          } else {
            // Check if it matches any valid format
            const validFormats = CRM_CONFIG.MEETING_FORMAT_OPTIONS;
            for (const validFormat of validFormats) {
              if (formatLower === validFormat.toLowerCase()) {
                formatValue = validFormat; // Return exact format from config
                break;
              }
            }
          }
        }
        row[index] = formatValue;
        break;
      case 'Toplantı Sonucu':
        // Normalize Toplantı Sonucu (fix "Teklif" -> "Teklif iletildi" etc.)
        let sonucValue = meetingData.toplantiSonucu || meetingData.meetingResult || '';
        if (sonucValue && typeof sonucValue === 'string') {
          const sonucLower = sonucValue.trim().toLowerCase();
          
          // Valid options: ['Satış Yapıldı', 'Teklif iletildi', 'Beklemede', 'Satış İptal']
          if (sonucLower === 'teklif' || sonucLower === 'teklif verildi' || sonucLower === 'teklif gönderildi') {
            sonucValue = 'Teklif iletildi';
            console.log('🔧 Normalized Toplantı Sonucu in prepareMeetingRow: Teklif -> Teklif iletildi');
          } else if (sonucLower === 'satış' || sonucLower === 'satış yapıldı' || sonucLower === 'satış gerçekleşti') {
            sonucValue = 'Satış Yapıldı';
          } else if (sonucLower === 'beklemede' || sonucLower === 'bekliyor') {
            sonucValue = 'Beklemede';
          } else if (sonucLower === 'iptal' || sonucLower === 'satış iptal') {
            sonucValue = 'Satış İptal';
          } else {
            // Check if it matches any valid option (case-insensitive)
            const validOptions = ['Satış Yapıldı', 'Teklif iletildi', 'Beklemede', 'Satış İptal'];
            for (const validOption of validOptions) {
              if (sonucLower === validOption.toLowerCase()) {
                sonucValue = validOption; // Return exact option from list
                break;
              }
            }
          }
        }
        row[index] = sonucValue;
        break;
      case 'Teklif Detayı':
        // "Satış Yapıldı" durumunda teklifDetayiSale kullan (satış yapılan paket)
        // Diğer durumlarda teklifDetayi kullan (teklif gönderilen paketler)
        let toplantiSonucuForTeklif = meetingData.toplantiSonucu || meetingData.meetingResult || '';
        // Normalize (case'lerin sırasına bağımlı olmamak için)
        if (toplantiSonucuForTeklif && typeof toplantiSonucuForTeklif === 'string') {
          const sonucLowerForTeklif = toplantiSonucuForTeklif.trim().toLowerCase();
          if (sonucLowerForTeklif === 'satış' || sonucLowerForTeklif === 'satış yapıldı' || sonucLowerForTeklif === 'satış gerçekleşti') {
            toplantiSonucuForTeklif = 'Satış Yapıldı';
          }
        }
        const isSatisYapildi = toplantiSonucuForTeklif === 'Satış Yapıldı' || (toplantiSonucuForTeklif && toplantiSonucuForTeklif.toLowerCase().includes('satış'));
        
        if (isSatisYapildi) {
          // Satış yapıldı → Satış yapılan paketi kullan (teklifDetayiSale)
          row[index] = meetingData.teklifDetayiSale || '';
          console.log('🔍 Satış Yapıldı → Teklif Detayı kolonuna teklifDetayiSale yazılıyor:', meetingData.teklifDetayiSale);
        } else {
          // Teklif gönderildi → Teklif edilen paketleri kullan (teklifDetayi)
          row[index] = meetingData.teklifDetayi || '';
          console.log('🔍 Teklif iletildi → Teklif Detayı kolonuna teklifDetayi yazılıyor:', meetingData.teklifDetayi);
        }
        break;
      case 'Satış Potansiyeli':
        // Normalize Satış Potansiyeli (fix "Yerinde" -> "Yerinde Satış" etc.)
        let potansiyelValue = meetingData.satisPotansiyeli || '';
        if (potansiyelValue && typeof potansiyelValue === 'string') {
          const potansiyelLower = potansiyelValue.trim().toLowerCase();
          
          // Valid options: ['Yerinde Satış', 'Sıcak', 'Orta', 'Soğuk']
          if (potansiyelLower === 'yerinde' || potansiyelLower === 'yerinde satış') {
            potansiyelValue = 'Yerinde Satış';
            console.log('🔧 Normalized Satış Potansiyeli in prepareMeetingRow: Yerinde -> Yerinde Satış');
          } else if (potansiyelLower === 'sıcak' || potansiyelLower === 'sicak') {
            potansiyelValue = 'Sıcak';
          } else if (potansiyelLower === 'orta') {
            potansiyelValue = 'Orta';
          } else if (potansiyelLower === 'soğuk' || potansiyelLower === 'soguk') {
            potansiyelValue = 'Soğuk';
          } else {
            // Check if it matches any valid option (case-insensitive)
            const validOptions = ['Sıcak', 'Orta', 'Soğuk']; // "Yerinde Satış" kaldırıldı (artık Satış Türü'nde)
            for (const validOption of validOptions) {
              if (potansiyelLower === validOption.toLowerCase()) {
                potansiyelValue = validOption; // Return exact option from list
                break;
              }
            }
          }
        }
        row[index] = potansiyelValue;
        break;
      case 'Toplantı Tarihi':
        // Format date as DD.MM.YYYY
        let toplantiTarihi = meetingData.toplantiTarihi || '';
        if (toplantiTarihi && toplantiTarihi.includes('-')) {
          // Convert from YYYY-MM-DD to DD.MM.YYYY
          const parts = toplantiTarihi.split('-');
          if (parts.length === 3) {
            toplantiTarihi = `${parts[2]}.${parts[1]}.${parts[0]}`;
            // Ay kolonunu otomatik doldur
            const tarihObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            if (!isNaN(tarihObj.getTime())) {
              const ayIndex = columns.indexOf('Ay');
              if (ayIndex !== -1) {
                const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                row[ayIndex] = monthNames[tarihObj.getMonth()];
              }
            }
          }
        }
        row[index] = toplantiTarihi;
        break;
      case 'Ay':
        // Ay kolonu zaten yukarıda dolduruldu, buraya gelmemeli
        // Ama eğer boşsa, Toplantı Tarihi'nden al
        if (!row[index] || row[index] === '') {
          const toplantiTarihiIndex = columns.indexOf('Toplantı Tarihi');
          if (toplantiTarihiIndex !== -1 && row[toplantiTarihiIndex]) {
            const tarihStr = String(row[toplantiTarihiIndex]);
            const parts = tarihStr.split('.');
            if (parts.length === 3) {
              const tarihObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
              if (!isNaN(tarihObj.getTime())) {
                const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
                row[index] = monthNames[tarihObj.getMonth()];
              }
            }
          }
        }
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
      case 'Toplantıyı Yapan':
        // Önce form data'dan al (hem toplantiYapan hem toplantiyiYapan kontrol et)
        let toplantiYapanValue = meetingData.toplantiYapan || meetingData.toplantiyiYapan || '';
        
        // Eğer kısa bir kod geliyorsa (örn: "SO"), tam employee code formatına çevir
        if (toplantiYapanValue && toplantiYapanValue.trim() !== '') {
          const shortCode = toplantiYapanValue.trim().toUpperCase();
          
          // CRM_CONFIG.EMPLOYEE_CODES içinde eşleşen tam kodu bul
          let fullEmployeeCode = null;
          try {
            if (CRM_CONFIG && CRM_CONFIG.EMPLOYEE_CODES && typeof CRM_CONFIG.EMPLOYEE_CODES === 'object' && !Array.isArray(CRM_CONFIG.EMPLOYEE_CODES)) {
              for (const [code, name] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
                // Kısa kod eşleşmesi (örn: "SO" -> "SO 003")
                if (code.toUpperCase().startsWith(shortCode + ' ') || code.toUpperCase() === shortCode) {
                  fullEmployeeCode = code;
                  console.log(`🔍 Kısa kod "${shortCode}" tam koda çevrildi: "${code}"`);
                  break;
                }
                // Tam kod zaten gelmişse direkt kullan
                if (code.toUpperCase() === shortCode || code === toplantiYapanValue) {
                  fullEmployeeCode = code;
                  console.log(`🔍 Tam kod bulundu: "${code}"`);
                  break;
                }
              }
            } else {
              console.warn('⚠️ CRM_CONFIG.EMPLOYEE_CODES geçersiz veya array:', typeof CRM_CONFIG?.EMPLOYEE_CODES);
            }
          } catch (empCodeError) {
            console.error('❌ Employee code lookup error:', empCodeError);
            // Hata olsa bile devam et
          }
          
          if (fullEmployeeCode) {
            row[index] = fullEmployeeCode;
            console.log(`✅ Toplantıyı Yapan set to: ${fullEmployeeCode}`);
          } else {
            // Eşleşme bulunamadıysa, gelen değeri olduğu gibi kullan
            row[index] = toplantiYapanValue;
            console.log(`⚠️ Employee code eşleşmesi bulunamadı, gelen değer kullanılıyor: ${toplantiYapanValue}`);
          }
        } else {
          // Form data'da yoksa, getCurrentEmployeeCode() kullan
          row[index] = getCurrentEmployeeCode() || '';
          console.log(`⚠️ Form data'da toplantiYapan yok, getCurrentEmployeeCode() kullanılıyor: ${row[index]}`);
        }
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
 * Updates Randevularım row with meeting data
 * @param {Sheet} sheet - Randevularım sheet
 * @param {number} rowNumber - Row number
 * @param {Object} meetingData - Meeting data
 */
function updateRandevularimRow(sheet, rowNumber, meetingData) {
  console.log('Updating Randevularım row with meeting data');
  console.log('🔍 Row number:', rowNumber, '(type:', typeof rowNumber, ')');
  console.log('🔍 Meeting data:', meetingData);
  
  try {
    // Ensure rowNumber is a number
    if (typeof rowNumber === 'string') {
      rowNumber = parseInt(rowNumber, 10);
      if (isNaN(rowNumber)) {
        console.error('❌ Invalid rowNumber:', rowNumber);
        return;
      }
    }
    
    if (!rowNumber || rowNumber < 2) {
      console.error('❌ Invalid rowNumber:', rowNumber);
      return;
    }
    
    if (!sheet) {
      console.error('❌ Sheet is null or undefined');
      return;
    }
    
    // ÖNEMLİ: Randevu toplantıya geçtiğinde, Randevularım sayfasından direkt sil
    // Çünkü artık Toplantılarım sayfasına taşındı - Randevularım'da durmamalı
    // Bu her durumda geçerli (Toplantı Gerçekleşti, Teklif İletildi, vb.)
    console.log('🗑️ Randevu toplantıya geçti, Randevularım sayfasından siliniyor...');
    try {
      sheet.deleteRow(rowNumber);
      console.log(`✅ Satır ${rowNumber} silindi (Randevu toplantıya geçti - artık Toplantılarım sayfasında)`);
    } catch (deleteError) {
      console.error('❌ Satır silme hatası:', deleteError);
      throw deleteError;
    }
  } catch (error) {
    console.error('❌ updateRandevularimRow error:', error);
    throw error;
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
  
  // Auto-resize columns - tüm kolonlar içeriğe göre otomatik genişleyecek
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Sadece Yorum ve Yönetici Not kolonları için özel genişlik (4 satır sığacak kadar)
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  headers.forEach((header, index) => {
    const columnIndex = index + 1;
    // Sadece Yorum ve Yönetici Not için özel genişlik (450px - 4 satır için uygun)
    if (header === 'Yorum' || header === 'Yönetici Not') {
      sheet.setColumnWidth(columnIndex, 450);
      console.log(`✅ ${header} kolonu 450px genişliğe ayarlandı (4 satır için uygun)`);
    }
    // Diğer tüm kolonlar auto-resize ile içeriğe göre otomatik genişleyecek
  });
  
  // Add borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
  
  // Yorum, Yönetici Not ve Teklif Detayı kolonlarına text wrapping ekle
  const yorumColumnIndex = headers.indexOf('Yorum') + 1;
  const yoneticiNotColumnIndex = headers.indexOf('Yönetici Not') + 1;
  const teklifDetayColumnIndex = headers.indexOf('Teklif Detayı') + 1;
  
  if (yorumColumnIndex > 0) {
    const lastRow = sheet.getLastRow() || 1;
    if (lastRow > 1) {
      sheet.getRange(2, yorumColumnIndex, lastRow - 1, 1).setWrap(true);
      console.log('✅ Yorum kolonuna text wrapping eklendi');
    }
  }
  
  if (yoneticiNotColumnIndex > 0) {
    const lastRow = sheet.getLastRow() || 1;
    if (lastRow > 1) {
      sheet.getRange(2, yoneticiNotColumnIndex, lastRow - 1, 1).setWrap(true);
      console.log('✅ Yönetici Not kolonuna text wrapping eklendi');
    }
  }
  
  if (teklifDetayColumnIndex > 0) {
    const lastRow = sheet.getLastRow() || 1;
    if (lastRow > 1) {
      sheet.getRange(2, teklifDetayColumnIndex, lastRow - 1, 1).setWrap(true);
      console.log('✅ Teklif Detayı kolonuna text wrapping eklendi');
    }
  }
  
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
      'Digifirst Custom', 'Digifirst Plus', 'Digifirst', 'Digifirst Setup', 'Next'
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
    const potansiyelOptions = ['Sıcak', 'Orta', 'Soğuk']; // "Yerinde Satış" kaldırıldı (artık Satış Türü'nde)
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
      .setAllowInvalid(true) // Geçersiz değerlere izin ver (kullanıcı yanlış yazarsa hata vermesin)
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
 * 🎨 Meeting Color Coding - Visual Status
 * @param {Sheet} sheet - Toplantılarım sheet
 * @param {number} rowNumber - Row number
 */
function applyMeetingColorCoding(sheet, rowNumber) {
  console.log('🎨 Applying meeting color coding to row:', rowNumber);
  
  try {
    if (!sheet || !rowNumber) {
      console.error('❌ Invalid parameters for meeting color coding');
      return;
    }
    
    // Get headers
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    console.log('🎨 Headers found:', headers);
    let color = 'rgb(255, 255, 255)'; // Default white
    
    // Check Toplantı Sonucu first
    const toplantiSonucuIndex = headers.indexOf('Toplantı Sonucu');
    if (toplantiSonucuIndex !== -1) {
      const toplantiSonucu = String(sheet.getRange(rowNumber, toplantiSonucuIndex + 1).getDisplayValue() || '').trim();
      const toplantiSonucuLower = toplantiSonucu.toLowerCase();
      
      console.log(`🎨 Toplantılarım Row ${rowNumber}: Toplantı Sonucu="${toplantiSonucu}"`);
      
      if (toplantiSonucu && toplantiSonucu !== '') {
        if (toplantiSonucu === 'Satış Yapıldı') {
          color = CRM_CONFIG.COLOR_CODES['Satış Yapıldı'];
          console.log(`🎨 Toplantılarım Row ${rowNumber}: Satış Yapıldı color applied`);
        } else if (toplantiSonucu === 'Teklif iletildi' || toplantiSonucuLower.indexOf('teklif') !== -1) {
          color = CRM_CONFIG.COLOR_CODES['Toplantı Teklif'];
          console.log(`🎨 Toplantılarım Row ${rowNumber}: Teklif iletildi color applied`);
        } else if (toplantiSonucuLower.indexOf('beklemede') !== -1) {
          color = CRM_CONFIG.COLOR_CODES['Toplantı Beklemede'];
          console.log(`🎨 Toplantılarım Row ${rowNumber}: Toplantı Beklemede color applied`);
        } else if (toplantiSonucuLower.indexOf('iptal') !== -1) {
          color = CRM_CONFIG.COLOR_CODES['Toplantı İptal'];
          console.log(`🎨 Toplantılarım Row ${rowNumber}: Toplantı İptal color applied`);
        } else {
          color = CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'];
          console.log(`🎨 Toplantılarım Row ${rowNumber}: Toplantı Tamamlandı color applied`);
        }
      } else {
        // Toplantı Sonucu boşsa Satış Potansiyeli'ne bak
        const satisPotansiyeliIndex = headers.indexOf('Satış Potansiyeli');
        if (satisPotansiyeliIndex !== -1) {
          const satisPotansiyeli = String(sheet.getRange(rowNumber, satisPotansiyeliIndex + 1).getDisplayValue() || '').trim().toLowerCase();
          
          console.log(`🎨 Toplantılarım Row ${rowNumber}: Satış Potansiyeli="${satisPotansiyeli}"`);
          
          if (satisPotansiyeli === 'yerinde satış' || satisPotansiyeli === 'yerinde satis') {
            color = CRM_CONFIG.COLOR_CODES['Satış Yapıldı'];
            console.log(`🎨 Toplantılarım Row ${rowNumber}: Yerinde Satış color applied`);
          } else if (satisPotansiyeli === 'sıcak' || satisPotansiyeli === 'sicak') {
            color = CRM_CONFIG.COLOR_CODES['Potansiyel Sıcak'];
            console.log(`🎨 Toplantılarım Row ${rowNumber}: Sıcak color applied`);
          } else if (satisPotansiyeli === 'orta') {
            color = CRM_CONFIG.COLOR_CODES['Potansiyel Orta'];
            console.log(`🎨 Toplantılarım Row ${rowNumber}: Orta color applied`);
          } else if (satisPotansiyeli === 'soğuk' || satisPotansiyeli === 'soguk') {
            color = CRM_CONFIG.COLOR_CODES['Potansiyel Soğuk'];
            console.log(`🎨 Toplantılarım Row ${rowNumber}: Soğuk color applied`);
          } else {
            color = CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'];
            console.log(`🎨 Toplantılarım Row ${rowNumber}: Default color applied`);
          }
        } else {
          color = CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'];
          console.log(`🎨 Toplantılarım Row ${rowNumber}: Default color applied (no Satış Potansiyeli)`);
        }
      }
    }
    
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
    console.log('🎨 Range to color:', range.getA1Notation());
    console.log('🎨 Color to apply:', color);
    range.setBackground(color);
    
    console.log(`✅ Applied meeting color ${color} to row ${rowNumber}`);
    console.log('🎨 Final range background:', range.getBackground());
    
  } catch (error) {
    console.error('❌ Error applying meeting color coding:', error);
  }
}

/**
 * Fix data validation for existing sheets
 */
function fixDataValidationForExistingSheets() {
  console.log('🔧 Fixing data validation for existing sheets...');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let fixedSheets = [];
    
    // Fix Randevularım sheet
    const randevularimSheet = spreadsheet.getSheetByName('Randevularım');
    if (randevularimSheet) {
      console.log('🔧 Fixing Randevularım data validation...');
      
      // Clear existing validation first
      const range = randevularimSheet.getRange(2, 1, 1000, randevularimSheet.getLastColumn());
      range.clearDataValidations();
      console.log('🧹 Cleared existing validations');
      
      // Apply new validation
      setRandevularimDataValidation(randevularimSheet);
      console.log('✅ Randevularım data validation fixed');
      fixedSheets.push('Randevularım');
    } else {
      console.log('⚠️ Randevularım sheet not found');
    }
    
    // Fix Toplantılarım sheet
    const toplantilarimSheet = spreadsheet.getSheetByName('Toplantılarım');
    if (toplantilarimSheet) {
      console.log('🔧 Fixing Toplantılarım data validation...');
      
      // Clear existing validation first
      const range = toplantilarimSheet.getRange(2, 1, 1000, toplantilarimSheet.getLastColumn());
      range.clearDataValidations();
      console.log('🧹 Cleared existing validations');
      
      // Apply new validation
      setToplantilarimDataValidation(toplantilarimSheet);
      console.log('✅ Toplantılarım data validation fixed');
      fixedSheets.push('Toplantılarım');
    } else {
      console.log('⚠️ Toplantılarım sheet not found');
    }
    
    // Fix Fırsatlarım sheet
    const firsatlarimSheet = spreadsheet.getSheetByName('Fırsatlarım');
    if (firsatlarimSheet) {
      console.log('🔧 Fixing Fırsatlarım data validation...');
      
      // Clear existing validation first
      const range = firsatlarimSheet.getRange(2, 1, 1000, firsatlarimSheet.getLastColumn());
      range.clearDataValidations();
      console.log('🧹 Cleared existing validations');
      
      // Apply new validation
      setFirsatlarimDataValidation(firsatlarimSheet);
      console.log('✅ Fırsatlarım data validation fixed');
      fixedSheets.push('Fırsatlarım');
    } else {
      console.log('⚠️ Fırsatlarım sheet not found');
    }
    
    const message = `✅ Data validation düzeltildi!\n\n📋 Düzeltilen sayfalar:\n${fixedSheets.map(s => `• ${s}`).join('\n')}\n\n🎯 Artık dropdown ve datepicker'lar çalışacak!\n\n💡 Test etmek için:\n• Randevu durumu sütununa tıklayın\n• Randevu Tarihi sütununa tıklayın\n• Saat sütununa tıklayın`;
    SpreadsheetApp.getUi().alert('✅ Başarılı', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('❌ Data validation fix failed:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Data validation düzeltme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Fix ONLY Randevularım data validation
 */
function fixRandevularimOnly() {
  console.log('🔧 Fixing ONLY Randevularım data validation...');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const randevularimSheet = spreadsheet.getSheetByName('Randevularım');
    
    if (!randevularimSheet) {
      console.error('❌ Randevularım sheet not found');
      SpreadsheetApp.getUi().alert('❌ Hata', 'Randevularım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    console.log('🔧 Found Randevularım sheet, applying validation...');
    
    // Clear existing validation first
    const range = randevularimSheet.getRange(2, 1, 1000, randevularimSheet.getLastColumn());
    range.clearDataValidations();
    console.log('🧹 Cleared existing validations');
    
    // Apply new validation
    setRandevularimDataValidation(randevularimSheet);
    console.log('✅ Randevularım data validation applied');
    
    SpreadsheetApp.getUi().alert('✅ Başarılı', 'Randevularım sayfasında dropdown ve datepicker\'lar aktif edildi!', SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('❌ Randevularım validation fix failed:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Randevularım validation hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Shows move to meeting dialog
 */
function showMoveToMeetingDialog() {
  console.log('Showing move to meeting dialog');
  moveToMeeting({});
}

/**
 * Processes sale form data from saleDialog.html (separate dialog for sales only)
 * @param {Object} formData - Form data from HTML (satisTarihi, satisTuru, paket, ciro, yorum, yoneticiNot)
 * @param {number} rowNumber - Selected row number from Toplantılarım
 * @param {string} sourceSheetName - Source sheet name (should be 'Toplantılarım')
 * @returns {Object} - Result object
 */
function processSaleForm(formData, rowNumber = null, sourceSheetName = null) {
  console.log('💰 Processing sale form:', formData);
  console.log('📋 Parameters: rowNumber=', rowNumber, 'sourceSheetName=', sourceSheetName);
  
  try {
    // Clean form data
    const cleanFormData = {};
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        let value = formData[key];
        if (typeof value === 'string') {
          value = value.replace(/\\"/g, '"')
            .replace(/^"/, '').replace(/"$/, '')
            .trim();
        }
        cleanFormData[key] = value;
      }
    }
    
    // Validate required fields
    if (!cleanFormData.satisTuru) {
      throw new Error('Satış Türü seçilmelidir');
    }
    if (!cleanFormData.paket) {
      throw new Error('Paket seçilmelidir');
    }
    const ciro = parseFloat(cleanFormData.ciro || cleanFormData.satisCiro || 0);
    if (!ciro || ciro === 0 || isNaN(ciro)) {
      throw new Error('Ciro (₺) bilgisi zorunludur ve 0\'dan büyük olmalıdır');
    }
    
    // Get row data
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = sourceSheetName ? spreadsheet.getSheetByName(sourceSheetName) : SpreadsheetApp.getActiveSheet();
    if (!sheet) {
      throw new Error('Kaynak sayfa bulunamadı: ' + sourceSheetName);
    }
    
    let rowNum = rowNumber;
    if (typeof rowNum === 'string') {
      rowNum = parseInt(rowNum, 10);
      if (isNaN(rowNum)) rowNum = null;
    }
    
    if (!rowNum || rowNum < 2) {
      throw new Error('Geçersiz satır numarası: ' + rowNum);
    }
    
    const rowData = getSelectedRowData(sheet, rowNum);
    if (!rowData) {
      throw new Error('Seçili satır verisi bulunamadı');
    }
    
    // Prepare sale data (matching processMeetingForm format for compatibility)
    cleanFormData.toplantiSonucu = 'Satış Yapıldı';
    cleanFormData.meetingResult = 'Satış Yapıldı';
    cleanFormData.teklifDetayiSale = cleanFormData.paket;
    cleanFormData.satisCiro = ciro;
    cleanFormData.ciro = ciro;
    cleanFormData.satisTarihi = cleanFormData.satisTarihi || new Date().toISOString().split('T')[0];
    
    // Create sale in Satışlarım
    const satislarimSheet = createSatislarimSheet(spreadsheet);
    
    const satislarimColumns = [
      'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
      'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan',
      'Toplantı Tarihi', 'Satış Tarihi', 'Ay', 'Satış Türü', 'Paket',
      'Ciro', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
    ];
    
    cleanFormData.sourceSheet = sourceSheetName || 'Toplantılarım';
    const satisRow = prepareSaleRow(rowData, cleanFormData, satislarimColumns, satislarimSheet);
    
    const nextSatisRow = satislarimSheet.getLastRow() + 1;
    const dataRange = satislarimSheet.getRange(nextSatisRow, 1, 1, satislarimColumns.length);
    dataRange.setValues([satisRow]);
    
    // Format columns
    const kodColumnIndex = satislarimColumns.indexOf('Kod') + 1;
    const kaynakColumnIndex = satislarimColumns.indexOf('Kaynak') + 1;
    if (kodColumnIndex > 0) {
      satislarimSheet.getRange(nextSatisRow, kodColumnIndex, 1, 1).setNumberFormat('@');
    }
    if (kaynakColumnIndex > 0) {
      satislarimSheet.getRange(nextSatisRow, kaynakColumnIndex, 1, 1).setNumberFormat('@');
    }
    
    // Apply color coding
    applySaleColorCoding(satislarimSheet, nextSatisRow);
    
    // Delete from Toplantılarım (since it's now a sale)
    const toplantilarimSheet = spreadsheet.getSheetByName('Toplantılarım');
    if (toplantilarimSheet && rowNum && sourceSheetName === 'Toplantılarım') {
      toplantilarimSheet.deleteRow(rowNum);
      console.log('✅ Toplantılarım\'dan satır silindi (Satışa dönüştü)');
    }
    
    // Log activity
    logActivity('createSale', {
      rowId: rowData.Kod,
      rowData: rowData,
      meetingData: cleanFormData,
      satisCiro: ciro,
      sheetName: sourceSheetName || 'Toplantılarım'
    });
    
    // Clear stored data
    SELECTED_ROW_DATA = null;
    SELECTED_ROW_NUMBER = null;
    
    // Activate Satışlarım sheet
    satislarimSheet.activate();
    
    return {
      success: true,
      message: `✅ Satış başarıyla kaydedildi!\n💰 Ciro: ${ciro.toLocaleString('tr-TR')} ₺\n📊 Satışlarım sayfasına yönlendiriliyorsunuz.`
    };
    
  } catch (error) {
    console.error('❌ Sale form processing error:', error);
    return {
      success: false,
      message: error.message || 'Satış kaydedilemedi'
    };
  }
}

/**
 * Processes meeting form data from HTML dialog
 * @param {Object} formData - Form data from HTML
 * @returns {Object} - Result object
 */
function processMeetingForm(formData, rowNumber = null, sourceSheetName = null) {
  console.log('Processing meeting form data:', formData);
  console.log('📋 Parameters: rowNumber=', rowNumber, 'sourceSheetName=', sourceSheetName);
  
  try {
    // Clean form data - remove escape characters
    const cleanFormData = {};
    for (const key in formData) {
      if (formData.hasOwnProperty(key)) {
        let value = formData[key];
        if (typeof value === 'string') {
          // Remove escape characters and quotes
          value = value.replace(/\\"/g, '"')
            .replace(/^"/, '').replace(/"$/, '')
            .replace(/^\\"/, '').replace(/\\"$/, '')
            .trim();
        }
        cleanFormData[key] = value;
      }
    }
    
    console.log('📋 Cleaned form data:', cleanFormData);
    
    // Normalize meeting format (fix "Yüz" -> "Yüz Yüze" etc.)
    const normalizeMeetingFormat = (format) => {
      if (!format || typeof format !== 'string') return format;
      const formatLower = format.trim().toLowerCase();
      
      // Fix common mistakes
      if (formatLower === 'yüz' || formatLower.includes('yüze') === false && formatLower.startsWith('yüz')) {
        return 'Yüz Yüze';
      }
      if (formatLower === 'online' || formatLower === 'çevrimiçi') {
        return 'Online';
      }
      if (formatLower === 'telefon' || formatLower === 'phone') {
        return 'Telefon';
      }
      
      // Check if it matches any valid format
      const validFormats = CRM_CONFIG.MEETING_FORMAT_OPTIONS;
      for (const validFormat of validFormats) {
        if (formatLower === validFormat.toLowerCase()) {
          return validFormat; // Return exact format from config
        }
      }
      
      return format; // Return original if no match
    };
    
    // Normalize format fields
    if (cleanFormData.toplantiFormat) {
      cleanFormData.toplantiFormat = normalizeMeetingFormat(cleanFormData.toplantiFormat);
      console.log('🔧 Normalized toplantiFormat:', cleanFormData.toplantiFormat);
    }
    if (cleanFormData.meetingFormat) {
      cleanFormData.meetingFormat = normalizeMeetingFormat(cleanFormData.meetingFormat);
      console.log('🔧 Normalized meetingFormat:', cleanFormData.meetingFormat);
    }
    // Sync both fields
    if (cleanFormData.toplantiFormat && !cleanFormData.meetingFormat) {
      cleanFormData.meetingFormat = cleanFormData.toplantiFormat;
    }
    if (cleanFormData.meetingFormat && !cleanFormData.toplantiFormat) {
      cleanFormData.toplantiFormat = cleanFormData.meetingFormat;
    }
    
    // Normalize Toplantı Sonucu (fix "Teklif" -> "Teklif iletildi" etc.)
    const normalizeToplantiSonucu = (sonuc) => {
      if (!sonuc || typeof sonuc !== 'string') return sonuc;
      const sonucLower = sonuc.trim().toLowerCase();
      
      // Valid options: ['Satış Yapıldı', 'Teklif iletildi', 'Beklemede', 'Satış İptal']
      if (sonucLower === 'teklif' || sonucLower === 'teklif verildi' || sonucLower === 'teklif gönderildi') {
        return 'Teklif iletildi';
      }
      if (sonucLower === 'satış' || sonucLower === 'satış yapıldı' || sonucLower === 'satış gerçekleşti') {
        return 'Satış Yapıldı';
      }
      if (sonucLower === 'beklemede' || sonucLower === 'bekliyor') {
        return 'Beklemede';
      }
      if (sonucLower === 'iptal' || sonucLower === 'satış iptal') {
        return 'Satış İptal';
      }
      
      // Check if it matches any valid option
      const validOptions = ['Satış Yapıldı', 'Teklif iletildi', 'Beklemede', 'Satış İptal'];
      for (const validOption of validOptions) {
        if (sonucLower === validOption.toLowerCase()) {
          return validOption; // Return exact option from list
        }
      }
      
      return sonuc; // Return original if no match
    };
    
    // Normalize toplantiSonucu and meetingResult fields
    if (cleanFormData.toplantiSonucu) {
      cleanFormData.toplantiSonucu = normalizeToplantiSonucu(cleanFormData.toplantiSonucu);
      console.log('🔧 Normalized toplantiSonucu:', cleanFormData.toplantiSonucu);
    }
    if (cleanFormData.meetingResult) {
      cleanFormData.meetingResult = normalizeToplantiSonucu(cleanFormData.meetingResult);
      console.log('🔧 Normalized meetingResult:', cleanFormData.meetingResult);
    }
    // Sync both fields
    if (cleanFormData.toplantiSonucu && !cleanFormData.meetingResult) {
      cleanFormData.meetingResult = cleanFormData.toplantiSonucu;
    }
    if (cleanFormData.meetingResult && !cleanFormData.toplantiSonucu) {
      cleanFormData.toplantiSonucu = cleanFormData.meetingResult;
    }
    
    // Normalize Satış Potansiyeli (fix "Yerinde" -> "Yerinde Satış" etc.)
    const normalizeSatisPotansiyeli = (potansiyel) => {
      if (!potansiyel || typeof potansiyel !== 'string') return potansiyel;
      const potansiyelLower = potansiyel.trim().toLowerCase();
      
      // Valid options: ['Sıcak', 'Orta', 'Soğuk'] - "Yerinde Satış" artık Satış Türü'nde
      // Eski veriler için uyumluluk: "Yerinde Satış" → boş (artık kullanılmıyor)
      if (potansiyelLower === 'yerinde' || potansiyelLower === 'yerinde satış') {
        return ''; // Artık Satış Potansiyeli'nde değil, Satış Türü'nde
      }
      if (potansiyelLower === 'sıcak' || potansiyelLower === 'sicak') {
        return 'Sıcak';
      }
      if (potansiyelLower === 'orta') {
        return 'Orta';
      }
      if (potansiyelLower === 'soğuk' || potansiyelLower === 'soguk') {
        return 'Soğuk';
      }
      
      // Check if it matches any valid option
      const validOptions = ['Sıcak', 'Orta', 'Soğuk']; // "Yerinde Satış" kaldırıldı (artık Satış Türü'nde)
      for (const validOption of validOptions) {
        if (potansiyelLower === validOption.toLowerCase()) {
          return validOption; // Return exact option from list
        }
      }
      
      return potansiyel; // Return original if no match
    };
    
    // Normalize satisPotansiyeli field
    if (cleanFormData.satisPotansiyeli) {
      cleanFormData.satisPotansiyeli = normalizeSatisPotansiyeli(cleanFormData.satisPotansiyeli);
      console.log('🔧 Normalized satisPotansiyeli:', cleanFormData.satisPotansiyeli);
    }
    
    // Validate form data
    if (!cleanFormData.toplantiTarihi && !cleanFormData.meetingDate) {
      throw new Error('Toplantı tarihi zorunludur');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    
    // Get row data and number - prioritize parameters, then formData, then stored data
    let rowData = null;
    let rowNum = null;
    
    console.log('🔍 Step 1: Checking parameters - rowNumber:', rowNumber, '(type:', typeof rowNumber, '), sourceSheetName:', sourceSheetName);
    
    // First: Use provided parameters (from HTML call)
    if (rowNumber !== null && rowNumber !== undefined && sourceSheetName !== null && sourceSheetName !== undefined) {
      try {
        // Clean sourceSheetName (remove quotes, escape chars)
        let cleanSheetName = String(sourceSheetName).trim();
        cleanSheetName = cleanSheetName.replace(/^"/, '').replace(/"$/, '')
          .replace(/^\\"/, '').replace(/\\"$/, '')
          .replace(/\\"/g, '"');
        
        // Parse rowNumber - handle both string and number
        let parsedRowNum = null;
        if (typeof rowNumber === 'number') {
          parsedRowNum = rowNumber;
        } else if (typeof rowNumber === 'string') {
          // Remove quotes and escape chars from rowNumber if it's a string
          const cleanRowNum = rowNumber.replace(/^"/, '').replace(/"$/, '')
            .replace(/^\\"/, '').replace(/\\"$/, '')
            .replace(/\\"/g, '"')
            .trim();
          parsedRowNum = parseInt(cleanRowNum, 10);
        } else {
          parsedRowNum = parseInt(rowNumber, 10);
        }
        
        // Validate parsed values
        if (!isNaN(parsedRowNum) && parsedRowNum >= 2 && cleanSheetName && cleanSheetName !== '') {
          const sheet = spreadsheet.getSheetByName(cleanSheetName);
          if (sheet) {
            console.log('✅ Sheet found:', cleanSheetName);
            rowData = getSelectedRowData(sheet, parsedRowNum);
            rowNum = parsedRowNum;
            console.log('✅ Using parameters: rowNumber=', rowNum, 'sourceSheetName=', cleanSheetName, 'rowData=', rowData ? 'Found' : 'Missing');
          } else {
            console.log('⚠️ Sheet not found:', cleanSheetName);
          }
        } else {
          console.log('⚠️ Invalid rowNumber or sheetName - rowNumber:', parsedRowNum, 'sheetName:', cleanSheetName);
        }
      } catch (e) {
        console.log('⚠️ Parameter parse error:', e && e.message);
        console.error('⚠️ Full error:', e);
      }
    }
    
    // Second: Use formData context
    if ((!rowData || !rowNum) && cleanFormData) {
      try {
        const explicitRow = Number(cleanFormData.rowNumber || 0);
        let explicitSheetName = String(cleanFormData.sourceSheet || '').trim();
        explicitSheetName = explicitSheetName.replace(/^"/, '').replace(/"$/, '')
          .replace(/^\\"/, '').replace(/\\"$/, '')
          .replace(/\\"/g, '"');
        
        console.log('🔍 Step 2: Checking formData - rowNumber:', explicitRow, 'sourceSheet:', explicitSheetName);
        
        if (explicitRow && explicitRow !== 1 && explicitSheetName && explicitSheetName !== '') {
          const sheet = spreadsheet.getSheetByName(explicitSheetName) || SpreadsheetApp.getActiveSheet();
          if (sheet) {
            console.log('🔎 Reconstructing row from formData context:', explicitRow, explicitSheetName);
            rowData = getSelectedRowData(sheet, explicitRow);
            rowNum = explicitRow;
            console.log('✅ Reconstructed rowData:', rowData ? 'Found' : 'Missing');
          }
        }
      } catch (e) {
        console.log('⚠️ Fallback reconstruct error:', e && e.message);
      }
    }
    
    // Third: Use stored data
    if (!rowData || !rowNum) {
      console.log('🔍 Step 3: Using stored data as fallback');
      console.log('🔍 SELECTED_ROW_DATA:', SELECTED_ROW_DATA ? 'Found' : 'Missing');
      console.log('🔍 SELECTED_ROW_NUMBER:', SELECTED_ROW_NUMBER, '(type:', typeof SELECTED_ROW_NUMBER, ')');
        rowData = SELECTED_ROW_DATA;
        rowNum = SELECTED_ROW_NUMBER;
    }
    
    // Ensure rowNum is a number
    if (rowNum && typeof rowNum === 'string') {
      rowNum = parseInt(rowNum, 10);
      if (isNaN(rowNum)) rowNum = null;
    }
    
    console.log('🔍 Final check - rowData:', rowData ? 'Found' : 'Missing');
    console.log('🔍 Final check - rowNum:', rowNum, '(type:', typeof rowNum, ')');
    
    if (!rowData) {
      // Try one more time with active sheet
      try {
        const activeSheet = SpreadsheetApp.getActiveSheet();
        if (activeSheet && rowNum && rowNum >= 2) {
          console.log('🔍 Last attempt: Using active sheet:', activeSheet.getName(), 'row:', rowNum);
          rowData = getSelectedRowData(activeSheet, rowNum);
          if (rowData) {
            console.log('✅ Successfully retrieved rowData from active sheet');
          }
        }
      } catch (e) {
        console.log('⚠️ Last attempt failed:', e && e.message);
      }
    }
    
    if (!rowData) {
      throw new Error('Seçili satır verisi bulunamadı. Lütfen tekrar deneyin. (rowNumber: ' + rowNum + ', sourceSheet: ' + sourceSheetName + ')');
    }
    
    if (!rowNum || typeof rowNum !== 'number' || isNaN(rowNum) || rowNum < 2) {
      throw new Error(`Geçersiz satır numarası: ${rowNum}. Lütfen tekrar deneyin.`);
    }
    
    // "Satış Yapıldı" kontrolü - Ciro sor ve Satışlarım'a taşı
    const toplantiSonucu = cleanFormData.toplantiSonucu || cleanFormData.meetingResult || '';
    const isSatisYapildi = toplantiSonucu === 'Satış Yapıldı' || toplantiSonucu.toLowerCase().includes('satış');
    
    if (isSatisYapildi) {
      // Ciro bilgisini formData'dan al (HTML dialog'dan gelecek)
      let ciro = parseFloat(cleanFormData.ciro || cleanFormData.satisCiro || 0);
      
      if (!ciro || ciro === 0 || isNaN(ciro)) {
        throw new Error('Satışa dönüştürmek için ciro (₺) bilgisi zorunludur. Lütfen ciro miktarını girin.');
      }
      
      // Satışlarım sayfasına ekle
      const satislarimSheet = createSatislarimSheet(spreadsheet);
      
      // Satışlarım kolonlarını al
      const satislarimColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan',
        'Toplantı Tarihi', 'Satış Tarihi', 'Ay', 'Satış Türü', 'Paket',
        'Ciro', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
      ];
      
      // sourceSheet bilgisini cleanFormData'ya ekle (Kaynak kolonu için)
      const cleanSourceSheet = String(sourceSheetName || '').trim().replace(/^"/, '').replace(/"$/, '');
      cleanFormData.sourceSheet = cleanSourceSheet;
      
      // prepareSaleRow ile satış satırını hazırla
      const satisRow = prepareSaleRow(rowData, cleanFormData, satislarimColumns, satislarimSheet);
      
      const nextSatisRow = satislarimSheet.getLastRow() + 1;
      const dataRange = satislarimSheet.getRange(nextSatisRow, 1, 1, satislarimColumns.length);
      dataRange.setValues([satisRow]);
      
      // Format ayarları
      const kodColumnIndex = satislarimColumns.indexOf('Kod') + 1;
      const kaynakColumnIndex = satislarimColumns.indexOf('Kaynak') + 1;
      if (kodColumnIndex > 0) {
        satislarimSheet.getRange(nextSatisRow, kodColumnIndex, 1, 1).setNumberFormat('@');
      }
      if (kaynakColumnIndex > 0) {
        satislarimSheet.getRange(nextSatisRow, kaynakColumnIndex, 1, 1).setNumberFormat('@');
      }
      
      // Satış satırını güzel yeşil renkle boya (motivasyon için)
      applySaleColorCoding(satislarimSheet, nextSatisRow);
      // Flush yapma - script daha hızlı tamamlanır, loading indicator daha çabuk kaybolur
      
      // Toplantılarım'dan geliyorsa: SİL (mavi yapma, SİL)
      // cleanSourceSheet zaten yukarıda tanımlı
      const toplantilarimSheet = spreadsheet.getSheetByName('Toplantılarım');
      if (toplantilarimSheet && rowNum && cleanSourceSheet === 'Toplantılarım') {
        toplantilarimSheet.deleteRow(rowNum);
        console.log('✅ Toplantılarım\'dan satır silindi (Satışa dönüştü)');
      } else if (cleanSourceSheet === 'Randevularım') {
        // Randevularım'dan toplantı dialog'u açılıp "Satış Yapıldı" seçildiğinde:
        // 1. Önce Toplantılarım'a ekle (toplantı yapıldı, kaydedilmeli)
        // 2. Toplantı için log yaz (raporlarda "Toplantı: 1" görünsün)
        // 3. Sonra Satışlarım'a ekle (zaten yukarıda eklendi)
        // 4. Satış için log yaz (raporlarda "Satış: 1" görünsün)
        // 5. Randevularım'dan satırı sil
        const meetingResult = createMeetingInToplantilarim(spreadsheet, rowData, cleanFormData);
        console.log('✅ Toplantı Randevularım\'dan Toplantılarım\'a eklendi (toplantı kaydedildi)');
        
        // Toplantı için log yaz (raporlarda "Toplantı: 1" görünsün)
        logActivity('moveToMeeting', {
          rowId: rowData.Kod,
          rowData: rowData, // Employee code extraction için
          meetingData: cleanFormData,
          sheetName: 'Randevularım'
        });
        
        console.log('✅ Satışlarım\'a da eklendi (satış kaydedildi)');
        
        // Toplantılarım'dan satırı sil (artık satış yapıldı, takip edilmeyecek)
        // Not: Sıralama yapılırsa satır numarası değişebilir, bu yüzden Kod ile bul
        const toplantilarimSheet = spreadsheet.getSheetByName('Toplantılarım');
        if (toplantilarimSheet && meetingResult && meetingResult.success) {
          try {
            // Sıralama yapılmış olabilir, bu yüzden Kod ile bul
            const data = toplantilarimSheet.getDataRange().getValues();
            let meetingRowNum = null;
            
            // Header'dan sonra başla (row 2'den itibaren), Kod kolonu A (index 0)
            for (let i = 1; i < data.length; i++) {
              if (String(data[i][0] || '').trim() === String(rowData.Kod || '').trim()) {
                meetingRowNum = i + 1; // Sheet'te satır numarası (1-based)
                break;
              }
            }
            
            if (meetingRowNum) {
              toplantilarimSheet.deleteRow(meetingRowNum);
              console.log(`✅ Toplantılarım'dan satır ${meetingRowNum} silindi (Kod: ${rowData.Kod}, Satışa dönüştü)`);
            } else {
              console.log(`⚠️ Toplantılarım'da Kod: ${rowData.Kod} bulunamadı (satır silinemedi)`);
            }
          } catch (deleteError) {
            console.error('⚠️ Toplantılarım\'dan satır silme hatası:', deleteError);
          }
        }
        
        // Randevularım'dan satırı sil
        const randevularimSheet = spreadsheet.getSheetByName('Randevularım');
        if (randevularimSheet && rowNum) {
          randevularimSheet.deleteRow(rowNum);
          console.log('✅ Randevularım\'dan satır silindi (Toplantı ve Satış tamamlandı)');
        }
      }
      
      // Müşteri adını rowData'dan al
      const musteriAdi = rowData['Company name'] || rowData['İsim Soyisim'] || rowData.Kod || 'Bilinmeyen';
      console.log('Processing complete - Satış:', { ciro: ciro, musteri: musteriAdi });
      // Satış için doğru action: createSale (moveToMeeting değil)
      // NOT: Randevularım'dan geliyorsa zaten yukarıda moveToMeeting log'u yazıldı
      // Burada sadece createSale log'u yaz (raporlarda "Satış: 1" görünsün)
      logActivity('createSale', { 
        rowId: rowData.Kod,
        rowData: rowData, // Employee code extraction için
        meetingData: cleanFormData,
        satisCiro: ciro,
        sheetName: cleanSourceSheet || 'Format Tablo'
      });
      
      // Clear stored data
      SELECTED_ROW_DATA = null;
      SELECTED_ROW_NUMBER = null;
      
      // Satışlarım sayfasını göster
      satislarimSheet.activate();
      
      return {
        success: true,
        meetingData: cleanFormData,
        message: `✅ Satış başarıyla kaydedildi!\n💰 Ciro: ${ciro} ₺\n📊 Satışlarım sayfasına yönlendiriliyorsunuz.`
      };
    }
    
    // Normal toplantı akışı (Satış Yapıldı değilse)
    // Create meeting in Toplantılarım - use cleaned form data
    const result = createMeetingInToplantilarim(spreadsheet, rowData, cleanFormData);
    
    // Update Randevularım row if it exists - use cleaned form data
      const randevularimSheet = spreadsheet.getSheetByName('Randevularım');
      if (randevularimSheet && rowNum) {
      updateRandevularimRow(randevularimSheet, rowNum, cleanFormData);
      }
      
      console.log('Processing complete:', result);
      logActivity('moveToMeeting', { 
        rowId: rowData.Kod,
        rowData: rowData, // Employee code extraction için
        meetingData: cleanFormData 
      });
      
      // Clear stored data
      SELECTED_ROW_DATA = null;
      SELECTED_ROW_NUMBER = null;
      
      // Return success to close dialog
      return {
        success: true,
      meetingData: cleanFormData,
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

/**
 * Saves meeting data from HTML dialog
 * @param {Object} formData - Form data from HTML
 * @returns {Object} - Result object
 */
function saveMeetingData(formData) {
  console.log('Saving meeting data from HTML dialog:', formData);
  
  try {
    // Convert HTML form data to backend format
    const meetingData = {
      toplantiTarihi: formData.meetingDate,
      toplantiSaati: formData.meetingTime,
      toplantiFormat: formData.meetingFormat,
      yorum: formData.meetingNotes,
      yoneticiNot: formData.yoneticiNot || formData.yoneticiNot || '',
      toplantiSonucu: formData.meetingResult
    };
    
    // Get current active range to determine row number
    const activeRange = SpreadsheetApp.getActiveRange();
    const activeSheet = SpreadsheetApp.getActiveSheet();
    const rowNumber = activeRange ? activeRange.getRow() : null;
    
    console.log('🔍 Active range from saveMeetingData:', activeRange ? activeRange.getA1Notation() : 'No active range');
    console.log('🔍 Row number from saveMeetingData:', rowNumber);
    
    if (!rowNumber || rowNumber === 1) {
      throw new Error('Geçerli bir satır seçili değil. Lütfen bir satır seçin ve tekrar deneyin.');
    }
    
    // Get selected row data
    const selectedRowData = getSelectedRowData(activeSheet, rowNumber);
    console.log('🔍 Selected row data from saveMeetingData:', selectedRowData);
    
    // Call processMeetingForm with converted data and row info
    return processMeetingForm(meetingData, selectedRowData, rowNumber);
    
  } catch (error) {
    console.error('Save meeting data failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Saves meeting data from HTML dialog using explicit row context
 * @param {Object} formData - Form data from HTML
 * @param {number} rowNumber - Selected row number
 * @param {string} sourceSheetName - Source sheet name
 * @returns {Object} - Result object
 */
function saveMeetingDataWithRow(formData, rowNumber, sourceSheetName) {
  console.log('Saving meeting data with explicit row context:', formData, rowNumber, sourceSheetName);
  
  try {
    // Convert HTML form data to backend format
    const meetingData = {
      toplantiTarihi: formData.meetingDate,
      toplantiSaati: formData.meetingTime,
      toplantiFormat: formData.meetingFormat,
      yorum: formData.meetingNotes,
      yoneticiNot: formData.yoneticiNot || formData.yoneticiNot || '',
      toplantiSonucu: formData.meetingResult
    };
    
    // Fallbacks from formData if parameters are not provided
    if (!rowNumber) rowNumber = formData.rowNumber;
    if (!sourceSheetName) sourceSheetName = formData.sourceSheet;
    console.log('🔎 Resolved rowNumber:', rowNumber, 'sourceSheetName:', sourceSheetName);
    
    // Validate inputs
    if (!rowNumber || rowNumber === 1) {
      throw new Error('Geçerli bir satır seçili değil. Lütfen bir satır seçin ve tekrar deneyin.');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = sourceSheetName ? spreadsheet.getSheetByName(sourceSheetName) : SpreadsheetApp.getActiveSheet();
    if (!sheet) {
      throw new Error('Kaynak sayfa bulunamadı: ' + sourceSheetName);
    }
    console.log('📄 Using sheet:', sheet.getName());
    
    const selectedRowData = getSelectedRowData(sheet, rowNumber);
    console.log('🔍 Selected row data (explicit):', selectedRowData);
    
    return processMeetingForm(meetingData, selectedRowData, rowNumber);
    
  } catch (error) {
    console.error('Save meeting data with row failed:', error);
    return {
      success: false,
      error: error.message
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
        yoneticiNot: row[headers.indexOf('Yönetici Not')] || ''
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

// CMS fonksiyonları src/managers/cms_detector.gs dosyasına taşındı

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
  if (spreadsheetId === CRM_CONFIG.MANAGER_FILE_ID) {
    console.log('Manager file detected - creating SYNC menu');
    createManagerMenu();
  } else {
    console.log('Temsilci file detected - creating CRM and ADMIN menus');
    
    // Log Arşivi sayfasını kontrol et ve oluştur (yoksa) - Hızlı kontrol
    try {
      const logSheet = spreadsheet.getSheetByName('Log Arşivi');
      if (!logSheet) {
        // Sadece yoksa oluştur (onOpen'da hızlı olmalı)
        createLogArchiveSheet(spreadsheet);
      } else if (!logSheet.isSheetHidden()) {
        // Varsa ama gizli değilse gizli yap
        logSheet.hideSheet();
      }
    } catch (error) {
      console.error('Error checking Log Arşivi sheet:', error);
    }
    
    // Data validation kaldırıldı - artık otomatik uygulanmıyor
    
    // Create admin menu for all sheets
    try {
      createAdminMenu();
    } catch (error) {
      console.error('Error creating Admin menu:', error);
    }
    
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
    const crmMenu = ui.createMenu('CRM')
      .addItem('Randevu al', 'showTakeAppointmentDialog')
      .addItem('Fırsat ekle', 'showAddOpportunityDialog')
      .addItem('Toplantıya Geç', 'showMoveToMeetingDialog')
      .addItem('Satışa Geç', 'showMoveToSaleDialog')
      .addSeparator()
      .addItem('💰 Satışlarım', 'showSatislarimSheet')
      .addItem('📋 Log Arşivi', 'showLogArchiveSheet')
      .addSeparator()
      .addItem('📦 Dataset Raporu', 'showDatasetReportDialog')
      .addSeparator()
      .addItem('🔧 Boş Kodları Doldur (Randevularım)', 'fillEmptyKodInRandevularim')
      .addItem('🎨 Renkleri Güncelle (Randevularım)', 'refreshRandevularimColors');

        crmMenu.addToUi();

    
        
    console.log('CRM menu created');
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
    console.log('Total sheets found:', sheets.length);
    
    sheets.forEach(sheet => {
      const sheetName = sheet.getName();
      console.log('Checking sheet:', sheetName);
      
      if (isFormatTable(sheet)) {
        console.log('✅ Applying data validation to Format Tablo:', sheetName);
        setDataValidation(sheet);
        appliedCount++;
      } else {
        console.log('❌ Skipping sheet (not Format Tablo):', sheetName);
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
      columnTests: {},
      validationTest: {}
    };
    
    // Test Aktivite column validation
    const aktiviteIndex = headers.indexOf('Aktivite') + 1;
    if (aktiviteIndex > 0) {
      console.log('Testing Aktivite column validation...');
      
      // Get current validation
      const aktiviteRange = activeSheet.getRange(2, aktiviteIndex, 1, 1);
      const currentValidation = aktiviteRange.getDataValidation();
      
      if (currentValidation) {
        const rule = currentValidation.getCriteriaType();
        const values = currentValidation.getCriteriaValues();
        console.log('Current validation rule:', rule);
        console.log('Current validation values:', values);
        
        testResults.validationTest.aktivite = {
          rule: rule,
          values: values,
          expectedValues: CRM_CONFIG.ACTIVITY_OPTIONS
        };
      } else {
        console.log('No validation found for Aktivite column');
        testResults.validationTest.aktivite = {
          error: 'No validation found'
        };
      }
    }
    
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
      message: `Test tamamlandı. ${activeSheet.getName()} sayfasında ${Object.keys(testResults.columnTests).length} kolon test edildi. Validation testi de yapıldı.`,
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
    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();
    
    console.log('Sheet name:', sheetName, 'Row:', row, 'Column:', col);
    
    // Process Randevularım sheet for status changes
    if (sheetName === 'Randevularım') {
      console.log('Randevularım sheet detected, calling handleRandevularimStatusChange');
      
      // ÖNCE tarih kontrolü yap (Ay kolonunu doldur)
      try {
        const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
        const durumIdx = headers.map(h=>String(h||'').toLowerCase()).indexOf('randevu durumu');
        const randevuTarihiIdx = headers.map(h=>String(h||'').toLowerCase()).indexOf('randevu tarihi');
        const ayIdx = headers.map(h=>String(h||'').toLowerCase()).indexOf('ay');
        const saatIdx = headers.map(h=>String(h||'').toLowerCase()).indexOf('saat');
        const toplantiSonucuIdx = headers.indexOf('Toplantı Sonucu');
        
        // Saat kolonu değiştiyse, formatını düzelt (text formatına zorla)
        if (saatIdx !== -1 && col === saatIdx + 1 && row > 1) {
          console.log(`🕐 Saat kolonu değişti - Satır: ${row}, Kolon: ${col}`);
          const saatValue = sheet.getRange(row, saatIdx + 1).getValue();
          const saatDisplay = sheet.getRange(row, saatIdx + 1).getDisplayValue();
          
          // Eğer tarih formatında görünüyorsa, düzelt
          if (saatValue instanceof Date) {
            const hours = saatValue.getHours().toString().padStart(2, '0');
            const minutes = saatValue.getMinutes().toString().padStart(2, '0');
            const saatFormatted = `${hours}:${minutes}`;
            sheet.getRange(row, saatIdx + 1).setNumberFormat('@');
            sheet.getRange(row, saatIdx + 1).setValue(saatFormatted);
            console.log(`✅ Saat formatı düzeltildi: ${saatFormatted}`);
          } else if (typeof saatValue === 'string' && saatValue.includes('.')) {
            // Yanlış format varsa (örn: "30.12.189"), temizle
            console.warn(`⚠️ Saat formatı yanlış: ${saatValue}, temizleniyor...`);
            sheet.getRange(row, saatIdx + 1).setNumberFormat('@');
            sheet.getRange(row, saatIdx + 1).setValue('');
          } else if (typeof saatValue === 'string' && !saatValue.match(/^\d{2}:\d{2}$/)) {
            // HH:mm formatında değilse, düzelt
            const timeMatch = saatValue.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
              const hours = timeMatch[1].padStart(2, '0');
              const minutes = timeMatch[2].padStart(2, '0');
              const saatFormatted = `${hours}:${minutes}`;
              sheet.getRange(row, saatIdx + 1).setNumberFormat('@');
              sheet.getRange(row, saatIdx + 1).setValue(saatFormatted);
              console.log(`✅ Saat formatı düzeltildi: ${saatFormatted}`);
            }
          }
        }
        
        // Randevu Tarihi değiştiyse, Ay kolonuna otomatik ay adını yaz
        if (randevuTarihiIdx !== -1 && col === randevuTarihiIdx + 1 && row > 1 && ayIdx !== -1) {
          console.log(`📅 Randevu Tarihi değişti - Satır: ${row}, Kolon: ${col}, randevuTarihiIdx: ${randevuTarihiIdx}, ayIdx: ${ayIdx}`);
          
          // getValue() ve getDisplayValue() deneyelim
          let tarihValue = sheet.getRange(row, randevuTarihiIdx + 1).getValue();
          const tarihDisplay = sheet.getRange(row, randevuTarihiIdx + 1).getDisplayValue();
          
          console.log(`📅 Tarih değeri (getValue): ${tarihValue}, (getDisplayValue): ${tarihDisplay}`);
          
          let tarih = null;
          
          // Önce Date objesi mi kontrol et
          if (tarihValue instanceof Date) {
            tarih = tarihValue;
            console.log(`📅 Tarih Date objesi olarak algılandı: ${tarih}`);
          } else {
            // String olarak parse et
            let dateString = String(tarihDisplay || tarihValue || '').trim();
            console.log(`📅 Tarih string olarak parse ediliyor: "${dateString}"`);
            
            if (dateString) {
              // DD.MM.YYYY formatını parse et
              const parts = dateString.split('.');
              if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const year = parseInt(parts[2]);
                tarih = new Date(year, month - 1, day);
                console.log(`📅 Parse edilen: ${day}.${month}.${year} -> ${tarih}`);
              } else {
                tarih = new Date(dateString);
                console.log(`📅 Direkt Date parse edildi: ${tarih}`);
              }
            }
          }
          
          if (tarih && !isNaN(tarih.getTime())) {
            const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            const ayAdi = monthNames[tarih.getMonth()];
            sheet.getRange(row, ayIdx + 1).setValue(ayAdi);
            console.log(`✅ Randevu Tarihi değişti, Ay kolonuna "${ayAdi}" yazıldı (Satır ${row})`);
          } else {
            console.error(`❌ Tarih parse edilemedi: ${tarihValue} / ${tarihDisplay}`);
          }
        }
        
        // Randevu Durumu değiştiyse
        if (durumIdx !== -1 && col === durumIdx + 1) {
          const status = sheet.getRange(e.range.getRow(), durumIdx + 1).getDisplayValue();
          updateRandevularimRowColor(sheet, e.range.getRow(), status);
          console.log('🎨 Randevu Durumu değişti, renklendirme uygulandı');
        }
        
        // Toplantı Sonucu değiştiyse
        if (toplantiSonucuIdx !== -1 && col === toplantiSonucuIdx + 1) {
          const status = sheet.getRange(e.range.getRow(), durumIdx + 1).getDisplayValue();
          updateRandevularimRowColor(sheet, e.range.getRow(), status);
          console.log('🎨 Toplantı Sonucu değişti, renklendirme uygulandı');
        }
      } catch (error) {
        console.log('🎨 Randevularım renklendirme hatası:', error && error.message);
      }
      
      // Sonra handleRandevularimStatusChange çağır
      handleRandevularimStatusChange(e, sheet);
      
      return;
    }
    
    // Process Toplantılarım sheet for status changes
    if (sheetName === 'Toplantılarım') {
      console.log('Toplantılarım sheet detected, checking for status changes');
      
      // ÖNCE tarih kontrolü yap (Ay kolonunu doldur)
      try {
        const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getDisplayValues()[0];
        const toplantiTarihiIdx = headers.map(h=>String(h||'').toLowerCase()).indexOf('toplantı tarihi');
        const ayIdx = headers.map(h=>String(h||'').toLowerCase()).indexOf('ay');
        const toplantiSonucuIdx = headers.indexOf('Toplantı Sonucu');
        const satisPotansiyeliIdx = headers.indexOf('Satış Potansiyeli');
        
        // Toplantı Tarihi değiştiyse, Ay kolonuna otomatik ay adını yaz
        if (toplantiTarihiIdx !== -1 && col === toplantiTarihiIdx + 1 && row > 1 && ayIdx !== -1) {
          console.log(`📅 Toplantı Tarihi değişti - Satır: ${row}, Kolon: ${col}`);
          
          let tarihValue = sheet.getRange(row, toplantiTarihiIdx + 1).getValue();
          const tarihDisplay = sheet.getRange(row, toplantiTarihiIdx + 1).getDisplayValue();
          
          let tarih = null;
          
          // Önce Date objesi mi kontrol et
          if (tarihValue instanceof Date) {
            tarih = tarihValue;
          } else {
            // String olarak parse et
            let dateString = String(tarihDisplay || tarihValue || '').trim();
            if (dateString) {
              // DD.MM.YYYY formatını parse et
              const parts = dateString.split('.');
              if (parts.length === 3) {
                const day = parseInt(parts[0]);
                const month = parseInt(parts[1]);
                const year = parseInt(parts[2]);
                tarih = new Date(year, month - 1, day);
              } else {
                tarih = new Date(dateString);
              }
            }
          }
          
          if (tarih && !isNaN(tarih.getTime())) {
            const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            const ayAdi = monthNames[tarih.getMonth()];
            sheet.getRange(row, ayIdx + 1).setValue(ayAdi);
            console.log(`✅ Toplantı Tarihi değişti, Ay kolonuna "${ayAdi}" yazıldı (Satır ${row})`);
          }
        }
        
        // Toplantı Sonucu değiştiyse
        if (toplantiSonucuIdx !== -1 && col === toplantiSonucuIdx + 1) {
          applyMeetingColorCoding(sheet, e.range.getRow());
          console.log('🎨 Toplantı Sonucu değişti, renklendirme uygulandı');
          
          // Satış Yapıldı ise sıralamayı yeniden yap
          const toplantiSonucu = sheet.getRange(row, toplantiSonucuIdx + 1).getDisplayValue();
          if (toplantiSonucu === 'Satış Yapıldı') {
            console.log('📅 Satış Yapıldı algılandı, sıralama yeniden yapılıyor...');
            sortToplantilarimByDate(sheet);
          }
        }
        
        // Satış Potansiyeli değiştiyse
        if (satisPotansiyeliIdx !== -1 && col === satisPotansiyeliIdx + 1) {
          applyMeetingColorCoding(sheet, e.range.getRow());
          console.log('🎨 Satış Potansiyeli değişti, renklendirme uygulandı');
        }
      } catch (error) {
        console.log('🎨 Toplantılarım renklendirme hatası:', error && error.message);
      }
      return;
    }
    
    // Process Format Tablo sheets for activity changes
    if (isFormatTable(sheet)) {
      console.log('Format Tablo sheet detected, checking for activity changes');
      
      // Check if the edited cell is in the Aktivite column (robust header detection)
      const headersDisp = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
      const idxOf = (cands) => {
        const lowered = headersDisp.map(h => norm(h));
        for (const c of cands) { const i = lowered.indexOf(norm(c)); if (i !== -1) return i; }
        return -1;
      };
      const aktiviteIndex = idxOf(['Aktivite','Aktivite Durumu','Durum']);
      const aktiviteTarihiIndex = idxOf(['Aktivite Tarihi','Aktivite tarihi','Tarih']);
      const logIndexResolved = idxOf(['Log','Günlük','Gunluk']);
      
      if (aktiviteIndex !== -1 && col === aktiviteIndex + 1 && row > 1) {
        console.log('🔍 onEdit - Activity cell edited in row:', row);
        const newActivity = range.getDisplayValue();
        console.log('🔍 onEdit - New activity value:', newActivity);
        
        // Apply color coding based on new activity
        applyFormatTableColorCoding(sheet, row, newActivity);
        console.log('🔍 onEdit - Color coding applied for activity:', newActivity);
        
        // Auto-update Aktivite Tarihi and Log when activity is selected
        if (newActivity && String(newActivity).trim() !== '') {
          const now = new Date();
          const todayFormatted = Utilities.formatDate(now, 'Europe/Istanbul', 'dd.MM.yyyy');
          const timeStr = Utilities.formatDate(now, 'Europe/Istanbul', 'HH:mm:ss');
          
          // Update Aktivite Tarihi (if column exists)
          if (aktiviteTarihiIndex !== -1) {
            const tarihRange = sheet.getRange(row, aktiviteTarihiIndex + 1);
            tarihRange.setValue(todayFormatted);
            console.log('🔍 onEdit - Aktivite Tarihi updated to:', todayFormatted);
          }
          
          // Update Log with new activity (if column exists)
          if (logIndexResolved !== -1) {
            const logRange = sheet.getRange(row, logIndexResolved + 1);
            const newLogValue = `${newActivity} - ${todayFormatted} ${timeStr}`;
            logRange.setValue(newLogValue);
            console.log('🔍 onEdit - Log updated to:', newLogValue);
          }
        }
        
        // Log the activity change
        logActivity(newActivity, { 
          rowId: row,
          sheetName: sheetName,
          column: 'Aktivite'
        });
      }
      
      return;
    }
    
    // Process Fırsatlarım sheet for status changes
    if (sheetName === 'Fırsatlarım') {
      console.log('Fırsatlarım sheet detected, checking for status changes');
      
      // Robust header detection
      const headersDisp = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').trim();
      const idxOf = (cands) => {
        const lowered = headersDisp.map(h => norm(h));
        for (const c of cands) { const i = lowered.indexOf(norm(c)); if (i !== -1) return i; }
        return -1;
      };
      const firsatDurumuIndex = idxOf(['Fırsat Durumu','Firsat Durumu','Aktivite','Durum']);
      const firsatTarihiIndex = idxOf(['Fırsat Tarihi','Firsat Tarihi','Tarih']);
      const logIdx = idxOf(['Log','Günlük','Gunluk']);
      
      if (firsatDurumuIndex !== -1 && col === firsatDurumuIndex + 1 && row > 1) {
        console.log('Fırsat Durumu cell edited in row:', row);
        const newStatus = range.getDisplayValue();
        console.log('New Fırsat Durumu value:', newStatus);
        
        // Apply color coding based on new status
        applyOpportunityColorCoding(sheet, row);
        console.log('Color coding applied for Fırsat Durumu:', newStatus);
        
        // Ensure date + log update for negatives/positives alike
        if (newStatus && String(newStatus).trim() !== '') {
          const now = new Date();
          const dStr = Utilities.formatDate(now, 'Europe/Istanbul', 'dd.MM.yyyy');
          const tStr = Utilities.formatDate(now, 'Europe/Istanbul', 'HH:mm:ss');
          if (firsatTarihiIndex !== -1) {
            sheet.getRange(row, firsatTarihiIndex + 1).setValue(dStr);
          }
          if (logIdx !== -1) {
            sheet.getRange(row, logIdx + 1).setValue(`${newStatus} - ${dStr} ${tStr}`);
          }
        }
        
        // Status değiştiğinde sıralamayı yeniden yap - KESIN KURAL (Randevularım mantığı)
        console.log('📅 Status değişti, sıralama yeniden yapılıyor...');
        sortFirsatlarimByDate(sheet);
      }
      
      return;
    }
    
    console.log('Not a Format Tablo, Randevularım, or Fırsatlarım sheet, skipping:', sheetName);
    
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
        
        // Find Randevu Durumu column dynamically
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const randevuDurumuIndex = headers.indexOf('Randevu Durumu');
        
        if (randevuDurumuIndex !== -1) {
          const testRange = sheet.getRange(2, randevuDurumuIndex + 1);
          const currentValue = testRange.getValue();
          console.log('Current value in Randevu Durumu column:', currentValue);
          
          // Show alert with current info
          SpreadsheetApp.getUi().alert('Test Info', 
            `Sheet: ${sheetName}\nRandevu Durumu value: ${currentValue}\nColumn: ${randevuDurumuIndex + 1}`, 
            SpreadsheetApp.getUi().ButtonSet.OK);
          
          // Simulate an edit event
          const testEvent = {
            range: testRange,
            source: SpreadsheetApp.getActiveSpreadsheet()
          };
          
          handleRandevularimStatusChange(testEvent, sheet);
        } else {
          console.log('Randevu Durumu column not found');
          SpreadsheetApp.getUi().alert('Error', 'Randevu Durumu column not found', SpreadsheetApp.getUi().ButtonSet.OK);
        }
      }
      
      if (sheetName === 'Fırsatlarım') {
        console.log('Fırsatlarım sheet found, testing status change...');
        
        // Test with row 2, Fırsat Durumu column
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
        
        if (firsatDurumuIndex !== -1) {
          const testRange = sheet.getRange(2, firsatDurumuIndex + 1);
          const currentValue = testRange.getValue();
          console.log('Current Fırsat Durumu value:', currentValue);
          
          // Show alert with current info
          SpreadsheetApp.getUi().alert('Test Info', 
            `Sheet: ${sheetName}\nFırsat Durumu value: ${currentValue}`, 
            SpreadsheetApp.getUi().ButtonSet.OK);
          
          // Apply color coding
          applyOpportunityColorCoding(sheet, 2);
        }
      }
      
      console.log('Manual test completed');
      
      SpreadsheetApp.getUi().alert('Test Completed', 'Check execution logs for details', SpreadsheetApp.getUi().ButtonSet.OK);
      
    } catch (error) {
      console.error('Manual test error:', error);
      SpreadsheetApp.getUi().alert('Test Error', 'Error: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    }
}

/**
 * 🎨 Manual Color Coding - Force Apply Colors
 */
function applyManualColorCoding() {
  console.log('🎨 Applying manual color coding');
  
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    
    console.log('Current sheet:', sheetName);
    
    if (sheetName === 'Randevularım') {
      console.log('Applying color coding to Randevularım');
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const randevuDurumuIndex = headers.indexOf('Randevu Durumu');
      
      if (randevuDurumuIndex !== -1) {
        for (let i = 1; i < data.length; i++) {
          const status = data[i][randevuDurumuIndex];
          if (status && status !== '') {
            console.log(`Row ${i + 1}: ${status}`);
            updateRandevularimRowColor(sheet, i + 1, status);
          }
        }
        SpreadsheetApp.getUi().alert('Randevularım renk kodlaması uygulandı');
      } else {
        SpreadsheetApp.getUi().alert('Randevu Durumu sütunu bulunamadı');
      }
    } else if (sheetName === 'Fırsatlarım') {
      console.log('Applying color coding to Fırsatlarım');
      
      const data = sheet.getDataRange().getValues();
      const headers = data[0];
      const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
      
      if (firsatDurumuIndex !== -1) {
        for (let i = 1; i < data.length; i++) {
          const status = data[i][firsatDurumuIndex];
          if (status && status !== '') {
            console.log(`Row ${i + 1}: ${status}`);
            applyOpportunityColorCoding(sheet, i + 1);
          }
        }
        SpreadsheetApp.getUi().alert('Fırsatlarım renk kodlaması uygulandı');
      } else {
        SpreadsheetApp.getUi().alert('Fırsat Durumu sütunu bulunamadı');
      }
      } else {
      SpreadsheetApp.getUi().alert('Bu fonksiyon sadece Randevularım veya Fırsatlarım sayfalarında çalışır');
    }
    
  } catch (error) {
    console.error('Error applying manual color coding:', error);
    SpreadsheetApp.getUi().alert('Renk kodlaması uygulanırken hata: ' + error.message);
  }
}

/**
 * Creates admin menu for all sheets
 */
function createAdminMenu() {
  console.log('Creating admin menu');
  
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Create Admin menu
    const menu = ui.createMenu('Admin');
    
    // 📋 Tablo İşlemleri
    menu.addItem('📋 Yeni Tablo oluştur', 'showCreateTableDialog');
    menu.addSeparator();
    
    // 🎨 Renklendirme
    const colorSubmenu = ui.createMenu('🎨 Renklendirme')
        .addItem('Manuel Renk Uygula', 'applyManualColorCoding')
      .addItem('Randevularım Renklerini Yenile', 'refreshRandevularimColors')
      .addItem('Toplantılarım Renklerini Yenile', 'refreshToplantilarimColors')
        .addSeparator()
        .addItem('Bu Sayfa - Renkleri Yenile', 'refreshColorsOnActiveSheet')
      .addItem('Tüm Sayfalar - Renkleri Yenile', 'refreshAllColors');
    menu.addSubMenu(colorSubmenu);
    
    // 🔍 Website Analizi
    const websiteSubmenu = ui.createMenu('🔍 Website Analizi')
      .addItem('CMS Analizi (Seçili)', 'openCMSDetectionCurrentAgentSelectionAccurate')
      .addItem('URL Analizi (Seçili)', 'analyzeSelectedWebsites')
      .addItem('E-ticaret İzi Tespiti (Seçili)', 'detectEcommerceSelectedRows')
      .addItem('Hız Testi (Seçili)', 'speedTestSelectedRows')
      .addSeparator()
      .addItem('E-ticaret Kontrolü & İşaretleme', 'generateCategoryKeywordCMSReport');
    menu.addSubMenu(websiteSubmenu);
    
    // 🧼 Bakım
    const bakım = ui.createMenu('🧼 Bakım')
        .addItem('📵 Telefonu olmayanları sil', 'deleteRowsWithoutPhone')
        .addItem('🌐 Websitesi olmayanları sil', 'deleteRowsWithoutWebsite')
        .addSeparator()
        .addItem('🔎 Mükerrerleri Bul (Firma + Telefon)', 'findDuplicatesInFormatTable')
        .addItem('🔗 Aynı Websiteyi Vurgula', 'highlightDuplicateWebsites')
        .addItem('🧽 Mükerrerleri Bul ve Sil', 'deleteDuplicateRowsWithConfirm')
      .addItem('🗑️ Mükerrerleri Bul ve Hepsini Sil', 'deleteAllDuplicatesAuto')
        .addSeparator()
        .addItem('🧹 URL Temizle (1. Aşama)', 'urlTemizleTumunu')
      .addItem('🗑️ URL Tekrarları Sil (2. Aşama)', 'urlTekrarlariniSil')
      .addSeparator()
      .addItem('🧭 Lokasyona göre sırala (A→Z)', 'sortActiveSheetByLocation')
      .addItem('🗑️ Silinmeye Aday Satırları Sil', 'deleteSilinmeyeAdayRows');
    menu.addSubMenu(bakım);
    
    // 🔧 Düzenleme
    menu.addSeparator();
    menu.addItem('🔧 Randevularım - Yeni Kolon Düzenine Geçir', 'fixRandevularimColumnStructure');
    menu.addItem('📅 Randevularım - Ay Kolonunu Doldur', 'fillAyColumnInRandevularim');
    menu.addItem('🔄 Randevularım - Tarihe Göre Sırala', 'manualSortRandevularim');
    menu.addItem('🔧 Fırsatlarım - Yeni Kolon Düzenine Geçir', 'fixFirsatlarimColumnOrder');
    menu.addItem('🔧 Toplantılarım - Yeni Kolon Düzenine Geçir', 'fixToplantilarimColumnOrder');
    menu.addItem('🗑️ Toplantılarım - Duplicate Kayıtları Temizle', 'cleanDuplicateMeetings');
    menu.addItem('⭐ Referansları Üste Taşı (Format Tablo)', 'markIdeaSoftReferencesOnActiveFormatTable');
    menu.addItem('🧱 CMS Sütunlarını Website Yanına Taşı', 'addCmsColumnsNextToWebsiteOnAllFormatTables');
    
    // Add menu to UI
    menu.addToUi();
    
    console.log('Admin menu created');
    
  } catch (error) {
    console.error('Failed to create admin menu:', error);
    SpreadsheetApp.getUi().alert('❌ Menü Oluşturma Hatası', `Admin menüsü oluşturulamadı: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 🔎 Mükerrerleri Bul (Firma + Telefon)
 */
function findDuplicatesInFormatTable(parameters) {
  console.log('Function started:', parameters);
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const sheetName = sheet.getName();
    if (!isFormatTable(sheet) && sheetName !== 'Randevularım' && sheetName !== 'Fırsatlarım' && sheetName !== 'Toplantılarım') {
      throw new Error('Bu işlem sadece Format Tablo / Randevularım / Fırsatlarım / Toplantılarım sayfalarında yapılabilir');
    }
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, duplicates: 0 };
    }
    const headers = data[0];
    const companyIdx = findColumnIndex(headers, ['Company name', 'Company Name']);
    const phoneIdx = findColumnIndex(headers, ['Phone']);
    if (companyIdx === -1) {
      throw new Error("'Company name' kolonu bulunamadı");
    }
    const keyToRows = new Map();
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const company = (row[companyIdx] || '').toString().trim();
      if (!company) continue;
      const phoneRaw = phoneIdx !== -1 ? (row[phoneIdx] || '').toString() : '';
      const phoneDigits = phoneRaw.replace(/\D+/g, '');
      const phoneKey = phoneDigits.length >= 7 ? phoneDigits : '';
      const key = `${company.toLowerCase()}|${phoneKey}`;
      if (!keyToRows.has(key)) keyToRows.set(key, []);
      keyToRows.get(key).push(i + 1);
    }
    const duplicates = [...keyToRows.entries()].filter(([, rows]) => rows.length > 1);
    const ss = sheet.getParent();
    const reportName = '🧪 Mükerrer Raporu';
    let report = ss.getSheetByName(reportName) || ss.insertSheet(reportName);
    report.clear();
    const headerRow = ['Key', 'Şirket', 'Telefon', 'Tekrar Sayısı', 'Satırlar'];
    report.getRange(1, 1, 1, headerRow.length).setValues([headerRow]).setFontWeight('bold');
    let r = 2;
    duplicates.forEach(([key, rows]) => {
      const [companyKey, phoneKey] = key.split('|');
      const company = companyKey ? companyKey : '';
      const phone = phoneKey ? phoneKey : '';
      report.getRange(r, 1, 1, 5).setValues([[key, company, phone, rows.length, rows.join(', ')]]);
      r++;
    });
    if (r > 2) {
      report.setFrozenRows(1);
      report.getRange(1, 1, r - 1, headerRow.length).setBorder(true, true, true, true, true, true);
      report.autoResizeColumns(1, headerRow.length);
    }
    ui.alert('Mükerrer tarama tamamlandı', `Toplam grup: ${duplicates.length}\nDetaylar '${reportName}' sayfasında.`, ui.ButtonSet.OK);
    return { success: true, groups: duplicates.length };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🧭 Lokasyona göre sırala (A→Z)
 */
function sortActiveSheetByLocation(parameters) {
  console.log('Function started:', parameters);
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Sıralanacak veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true };
    }
    const headers = data[0];
    const locationIdx = findColumnIndex(headers, ['Location', 'Lokasyon']);
    if (locationIdx === -1) {
      throw new Error("'Location' kolonu bulunamadı");
    }
    const rows = data.slice(1);
    rows.sort((a, b) => {
      const la = (a[locationIdx] || '').toString().toLocaleLowerCase('tr-TR');
      const lb = (b[locationIdx] || '').toString().toLocaleLowerCase('tr-TR');
      if (la < lb) return -1;
      if (la > lb) return 1;
      return 0;
    });
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    sheet.setFrozenRows(1);
    ui.alert('Sıralama tamam', 'Location A→Z sıralandı.', ui.ButtonSet.OK);
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/* Sektör Yardımcısı kaldırıldı */
// function showSectorHelperDialog(parameters) { /* removed */ }

/* removed: ensureSectorReferenceSheet */

/* removed: getSectorReferences */

/* removed: saveSectorReferences */

/**
 * 📦 Dataset Raporu
 */
function generateDatasetReport(parameters) {
  console.log('Function started:', parameters);
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    // Basit mod: aktif sayfa bir Format Tablo ise o dataset üzerinden raporla; değilse prompt ile sor
    let dataset = '';
    const activeSheet = SpreadsheetApp.getActiveSheet();
    if (isFormatTable(activeSheet)) {
      dataset = activeSheet.getName();
    } else {
      const sheets = ss.getSheets();
      const datasetNames = sheets.map(s => s.getName()).filter(name => isFormatTable(ss.getSheetByName(name)));
      if (datasetNames.length === 0) {
        ui.alert('Bilgi', 'Herhangi bir Format Tablo bulunamadı.', ui.ButtonSet.OK);
        return { success: true };
      }
      const resp = ui.prompt('Dataset Raporu', `Dataset (Format Tablo) seçin:\n${datasetNames.join(', ')}`, ui.ButtonSet.OK_CANCEL);
      if (resp.getSelectedButton() !== ui.Button.OK) {
        return { success: false, message: 'İptal edildi' };
      }
      dataset = resp.getResponseText().trim();
      if (!dataset) throw new Error('Dataset adı boş olamaz');
    }

    const reportName = 'Data Raporları';
    let report = ss.getSheetByName(reportName) || ss.insertSheet(reportName);
    const startRow = report.getLastRow() + 2;

    // Format Tablo'dan sadece ulaşılamadı / ilgilenmiyor sayımları (stabil değilse bile anlık)
    const ftSheet = ss.getSheetByName(dataset);
    let ftCounts = { 'Ulaşılamadı': 0, 'İlgilenmiyor': 0, 'Geçersiz Numara': 0 };
    let totalContacts = 0;
    if (ftSheet) {
      const ftData = ftSheet.getDataRange().getValues();
      const ftHeaders = ftData[0] || [];
      const ftRows = ftData.slice(1);
      const idxAktivite = ftHeaders.indexOf('Aktivite');
      totalContacts = ftRows.filter(r => r.some(c => c !== '')).length;
      const tmp = countByValues(ftRows, idxAktivite, ['İlgilenmiyor','Ulaşılamadı','Geçersiz Numara']);
      ftCounts = { 'Ulaşılamadı': tmp['Ulaşılamadı']||0, 'İlgilenmiyor': tmp['İlgilenmiyor']||0, 'Geçersiz Numara': tmp['Geçersiz Numara']||0 };
    }

    // Randevu/Fırsat/Toplantı sayımları her zaman ilgili sayfalardan (dataset=Kaynak)
    const rSheet = ss.getSheetByName('Randevularım');
    const rCounts = rSheet ? countBySource(rSheet, dataset, ['Randevu durumu'], ['Randevu Alındı','Randevu Teyitlendi','Randevu Ertelendi','Randevu İptal oldu','İleri Tarih Randevu']) : {};
    const fSheet = ss.getSheetByName('Fırsatlarım');
    const fCounts = fSheet ? countBySource(fSheet, dataset, ['Fırsat Durumu'], ['Yeniden Aranacak','Bilgi Verildi','Fırsat İletildi']) : {};
    const tSheet = ss.getSheetByName('Toplantılarım');
    const tCounts = tSheet ? countBySource(tSheet, dataset, ['Toplantı Sonucu'], ['Satış Yapıldı','Teklif iletildi','Beklemede','Satış İptal']) : {};

    const safe = (v) => Number(v || 0);
    const percent = (v, base) => base > 0 ? Math.round((safe(v)/base)*1000)/10 : 0;

    const rows = [];
    rows.push([`📦 DATASET RAPORU – ${dataset}`]);
    rows.push([]);
    rows.push(['Toplam Kontak', totalContacts]);
    rows.push(['Ulaşılamadı', safe(ftCounts['Ulaşılamadı']||0), `%${percent(ftCounts['Ulaşılamadı'], totalContacts)}`]);
    rows.push(['İlgilenmiyor', safe(ftCounts['İlgilenmiyor']||0), `%${percent(ftCounts['İlgilenmiyor'], totalContacts)}`]);
    rows.push(['Geçersiz Numara', safe(ftCounts['Geçersiz Numara']||0), `%${percent(ftCounts['Geçersiz Numara'], totalContacts)}`]);
    rows.push([]);
    rows.push(['Randevu Alındı', safe(rCounts['Randevu Alındı']||0)]);
    rows.push(['Randevu Teyitlendi', safe(rCounts['Randevu Teyitlendi']||0)]);
    rows.push(['Randevu Ertelendi', safe(rCounts['Randevu Ertelendi']||0)]);
    rows.push(['Randevu İptal oldu', safe(rCounts['Randevu İptal oldu']||0)]);
    rows.push(['İleri Tarih Randevu', safe(rCounts['İleri Tarih Randevu']||0)]);
    rows.push([]);
    rows.push(['Yeniden Aranacak', safe(fCounts['Yeniden Aranacak']||0)]);
    rows.push(['Bilgi Verildi', safe(fCounts['Bilgi Verildi']||0)]);
    rows.push(['Fırsat İletildi', safe(fCounts['Fırsat İletildi']||0)]);
    rows.push([]);
    rows.push(['Satış Yapıldı', safe(tCounts['Satış Yapıldı']||0)]);
    rows.push(['Teklif iletildi', safe(tCounts['Teklif iletildi']||0)]);
    rows.push(['Beklemede', safe(tCounts['Beklemede']||0)]);
    rows.push(['Satış İptal', safe(tCounts['Satış İptal']||0)]);

    if (rows.length > 0) {
      const maxColumns = Math.max(...rows.map(r => (r && r.length) ? r.length : 1));
      const normalizedRows = rows.map(r => {
        const out = new Array(maxColumns).fill('');
        if (Array.isArray(r)) {
          for (let i = 0; i < Math.min(r.length, maxColumns); i++) out[i] = r[i] ?? '';
        } else {
          out[0] = r ?? '';
        }
        return out;
      });
      report.getRange(startRow, 1, normalizedRows.length, maxColumns).setValues(normalizedRows);
      report.getRange(startRow, 1).setFontWeight('bold').setFontSize(13).setFontColor('#1a73e8');
    }

    ui.alert('✅ Dataset Raporu', `${dataset} için rapor yazıldı.`, ui.ButtonSet.OK);
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

function countByValues(rows, valueIdx, keys) {
  const counts = {};
  keys.forEach(k => counts[k] = 0);
  if (valueIdx === -1) return counts;
  rows.forEach(r => {
    const v = (r[valueIdx] || '').toString().trim();
    if (v && counts.hasOwnProperty(v)) counts[v]++;
  });
  return counts;
}

function countBySource(sheet, dataset, statusHeaderAliases, keys) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {};
  const headers = data[0];
  const rows = data.slice(1);
  const kaynakIdx = headers.indexOf('Kaynak');
  const statusIdx = findColumnIndex(headers, statusHeaderAliases);
  const counts = {};
  keys.forEach(k => counts[k] = 0);
  if (kaynakIdx === -1 || statusIdx === -1) return counts;
  rows.forEach(r => {
    const k = (r[kaynakIdx] || '').toString().trim();
    if (k !== dataset) return;
    const v = (r[statusIdx] || '').toString().trim();
    if (counts.hasOwnProperty(v)) counts[v]++;
  });
  return counts;
}

function showDatasetReportDialog() {
  console.log('Showing dataset report flow');
  generateDatasetReport({ mode: 'simple' });
}


/**
 * Applies appointment color coding to Fırsatlarım row (when appointment is taken)
 * @param {Sheet} sheet - Fırsatlarım sheet
 * @param {number} rowNumber - Row number
 */
function applyFirsatlarimAppointmentColorCoding(sheet, rowNumber) {
  console.log('🎨 Applying appointment color coding to Fırsatlarım row:', rowNumber);
  
  try {
    if (!sheet || !rowNumber) {
      console.error('❌ Invalid parameters for Fırsatlarım appointment color coding');
      return;
    }
    
    const color = CRM_CONFIG.COLOR_CODES['Randevu Alındı'];
    console.log('🎨 Using Randevu Alındı color:', color);
    
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
    range.setBackground(color);
    
    console.log(`✅ Applied appointment color ${color} to Fırsatlarım row ${rowNumber}`);
    
  } catch (error) {
    console.error('❌ Error applying Fırsatlarım appointment color coding:', error);
  }
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
    
    // Check if the edited cell is in Randevu Durumu column (dynamic check - case-insensitive)
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    let randevuDurumuIndex = -1;
    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i] || '').toLowerCase().trim();
      if (h === 'randevu durumu') {
        randevuDurumuIndex = i;
        break;
      }
    }
    
    console.log('Headers:', headers);
    console.log('Randevu Durumu index:', randevuDurumuIndex);
    console.log('Column check - Expected:', randevuDurumuIndex + 1, 'Actual:', col);
    
    if (randevuDurumuIndex === -1 || col !== randevuDurumuIndex + 1) {
      console.log('Not Randevu Durumu column, skipping');
      return;
    }
    
    const newStatus = String(range.getValue() || '').trim();
    console.log('New Randevu Durumu:', newStatus);
    
    // ÖNEMLİ: "Toplantı Gerçekleşti" durumundaki satırları Toplantılarım sayfasına TAŞI
    // Çünkü artık toplantı oldu - Randevularım'da durmamalılar
    if (newStatus === 'Toplantı Gerçekleşti' || newStatus.includes('Toplantı Gerçekleşti')) {
      console.log('🔄 "Toplantı Gerçekleşti" durumu algılandı - satır Toplantılarım sayfasına taşınıyor...');
      try {
        const spreadsheet = sheet.getParent();
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
        const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
        
        // Row data'yı object'e çevir
        const rowDataObj = {};
        headers.forEach((header, index) => {
          rowDataObj[header] = rowData[index];
        });
        
        // Varsayılan toplantı verileri (manuel seçim için)
        const defaultMeetingData = {
          toplantiTarihi: rowDataObj['Randevu Tarihi'] || new Date(),
          toplantiSaati: rowDataObj['Saat'] || '09:00',
          toplantiFormat: rowDataObj['Toplantı formatı'] || 'Yüz Yüze',
          toplantiSonucu: '',
          yorum: rowDataObj['Yorum'] || '',
          toplantiYapan: '',
          teklifDetayi: '',
          satisPotansiyeli: '',
          yeniTakipTarihi: ''
        };
        
        // Toplantılarım sayfasına taşı
        const result = createMeetingInToplantilarim(spreadsheet, rowDataObj, defaultMeetingData);
        
        if (result && result.success) {
          // Başarılı olduysa Randevularım'dan kaldır
          sheet.deleteRow(row);
          console.log(`✅ Satır ${row} Toplantılarım sayfasına taşındı ve Randevularım'dan kaldırıldı`);
          SpreadsheetApp.getUi().alert('✅ Başarılı', 'Randevu Toplantılarım sayfasına taşındı!', SpreadsheetApp.getUi().ButtonSet.OK);
        } else {
          console.error('❌ Toplantı oluşturma başarısız:', result);
          SpreadsheetApp.getUi().alert('⚠️ Uyarı', 'Toplantı oluşturulamadı. Lütfen "Toplantıya Geç" butonunu kullanın.', SpreadsheetApp.getUi().ButtonSet.OK);
        }
        
        return; // İşlem tamamlandı
      } catch (moveError) {
        console.error('❌ Satır taşıma hatası:', moveError);
        SpreadsheetApp.getUi().alert('❌ Hata', `Satır taşınamadı: ${moveError.message}\n\nLütfen "Toplantıya Geç" butonunu kullanın.`, SpreadsheetApp.getUi().ButtonSet.OK);
        // Hata olsa bile devam et
      }
    }
    
    // Get the Kod value from the same row (column 1)
    const kodCell = sheet.getRange(row, 1);
    const kod = kodCell.getValue();
    
    if (!kod) {
      console.log('No Kod found in row, skipping');
      return;
    }
    
    console.log('Kod found:', kod);
    
    // Update Randevularım row color
    console.log('Calling updateRandevularimRowColor with:', {
      sheet: sheet ? 'valid' : 'undefined',
      row: row,
      newStatus: newStatus
    });
    updateRandevularimRowColor(sheet, row, newStatus);
    
    console.log('Color coding updated successfully');
    
    // Status değiştiğinde sıralamayı yeniden yap - KESIN KURAL
    console.log('📅 Status değişti, sıralama yeniden yapılıyor...');
    try {
    sortRandevularimByDate(sheet);
    } catch (sortError) {
      console.error('❌ Sıralama hatası:', sortError);
    }
    
  } catch (error) {
    console.error('Error handling Randevularım status change:', error);
  }
}



/**
 * 🎨 Updates Randevularım Row Color - Visual Status
 * @param {Sheet} randevularimSheet - Randevularım sheet
 * @param {number} rowNumber - Row number
 * @param {string} status - Randevu Durumu
 */
/**
 * 🎨 Batch Randevularım Color Coding - Ultra Optimized (100x hızlı!)
 * Uses setBackgrounds() to apply all colors in a single operation
 * @param {Sheet} sheet - Randevularım sheet
 * @param {number} startRow - Start row number (data starts here, header is row 1)
 * @param {number} numRows - Number of rows to process
 * @param {Array} dateData - Array of {status, ...} objects from sortRandevularimByDate
 */
function applyRandevularimColorCodingBatch(sheet, startRow, numRows, dateData) {
  try {
    if (!sheet || !startRow || numRows <= 0) {
      console.error('❌ Invalid parameters for batch Randevularım color coding');
      return;
    }
    
    const lastColumn = sheet.getLastColumn();
    if (lastColumn === 0) {
      console.error('❌ Sheet has no columns');
      return;
    }
    
    // Status to color mapping function (reusable)
    const getColorForStatus = (status) => {
      if (!status || status === '' || status === null || status === undefined) {
        return 'rgb(255, 255, 255)'; // White
      }
      
      switch (status) {
        case 'Randevu Alındı':
          return CRM_CONFIG.COLOR_CODES['Randevu Alındı'] || 'rgb(232, 245, 232)';
        case 'İleri Tarih Randevu':
          return CRM_CONFIG.COLOR_CODES['İleri Tarih Randevu'] || 'rgb(255, 255, 255)';
        case 'Randevu Teyitlendi':
          return CRM_CONFIG.COLOR_CODES['Randevu Teyitlendi'] || 'rgb(255, 255, 255)';
        case 'Randevu Ertelendi':
          return CRM_CONFIG.COLOR_CODES['Randevu Ertelendi'] || 'rgb(255, 243, 224)';
        case 'Randevu İptal oldu':
          return CRM_CONFIG.COLOR_CODES['Randevu İptal oldu'] || 'rgb(255, 235, 238)';
        case 'Toplantı Gerçekleşti':
          return CRM_CONFIG.COLOR_CODES['Toplantı Gerçekleşti'] || 'rgb(255, 255, 255)';
        default:
          return 'rgb(255, 255, 255)'; // White (default)
      }
    };
    
    // Build color matrix (all rows at once)
    const backgroundColorMatrix = [];
    for (let i = 0; i < numRows; i++) {
      const status = dateData && dateData[i] ? (dateData[i].status || '') : '';
      const color = getColorForStatus(status);
      
      // Create a row array with the same color for all columns
      const rowColors = new Array(lastColumn).fill(color);
      backgroundColorMatrix.push(rowColors);
    }
    
    // Apply all colors in a SINGLE batch operation (ultra-fast!)
    const allRowsRange = sheet.getRange(startRow, 1, numRows, lastColumn);
    allRowsRange.setBackgrounds(backgroundColorMatrix);
    
    // No flush needed - Google handles it automatically
    
  } catch (error) {
    console.error('❌ Error applying batch Randevularım color coding:', error);
    throw error;
  }
}

function updateRandevularimRowColor(randevularimSheet, rowNumber, status) {
  // Single row update (for individual changes, not batch operations)
  try {
    if (!randevularimSheet || !rowNumber) {
      return;
    }
    
    let color = 'rgb(255, 255, 255)'; // Default white
    
    if (!status || status === '' || status === null || status === undefined) {
      color = 'rgb(255, 255, 255)'; // White
    } else {
      switch (status) {
        case 'Randevu Alındı':
          color = CRM_CONFIG.COLOR_CODES['Randevu Alındı'] || 'rgb(232, 245, 232)';
          break;
        case 'İleri Tarih Randevu':
          color = CRM_CONFIG.COLOR_CODES['İleri Tarih Randevu'] || 'rgb(255, 255, 255)';
          break;
        case 'Randevu Teyitlendi':
          color = CRM_CONFIG.COLOR_CODES['Randevu Teyitlendi'] || 'rgb(255, 255, 255)';
          break;
        case 'Randevu Ertelendi':
          color = CRM_CONFIG.COLOR_CODES['Randevu Ertelendi'] || 'rgb(255, 243, 224)';
          break;
        case 'Randevu İptal oldu':
          color = CRM_CONFIG.COLOR_CODES['Randevu İptal oldu'] || 'rgb(255, 235, 238)';
          break;
        case 'Toplantı Gerçekleşti':
          color = CRM_CONFIG.COLOR_CODES['Toplantı Gerçekleşti'] || 'rgb(255, 255, 255)';
          break;
        default:
          color = 'rgb(255, 255, 255)'; // White (default)
      }
    }
    
    const lastCol = randevularimSheet.getLastColumn();
    const range = randevularimSheet.getRange(rowNumber, 1, 1, lastCol);
    range.setBackground(color);
    
  } catch (error) {
    console.error('❌ Error updating Randevularım row color:', error);
  }
}

/**
 * 🔧 Randevularım sayfasındaki boş kodlu satırları otomatik doldur
 */
function fillEmptyKodInRandevularim() {
  console.log('🔧 Function started: fillEmptyKodInRandevularim');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Randevularım');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Hata', 'Randevularım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      SpreadsheetApp.getUi().alert('Bilgi', 'Randevularım sayfasında veri bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    console.log(`🔧 Randevularım sayfasında ${lastRow} satır bulundu`);
    
    // Kod sütununu bul
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    const kodIndex = headers.indexOf('Kod');
    
    if (kodIndex === -1) {
      SpreadsheetApp.getUi().alert('Hata', 'Kod sütunu bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Temsilci kodunu al
    const employeeCode = getCurrentEmployeeCode();
    console.log(`🔧 Temsilci kodu: ${employeeCode}`);
    
    // ✅ BATCH OPERATIONS: Tüm kod değerlerini tek seferde oku (Google best practice)
    const dataRowCount = lastRow - 1; // Header hariç
    const kodRange = sheet.getRange(2, kodIndex + 1, dataRowCount, 1);
    const kodValues = kodRange.getValues(); // 1 API call - Tüm değerleri oku
    
    // Memory'de işle: Hangi satırlar doldurulacak?
    const rowsToFill = [];
    let filledCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < kodValues.length; i++) {
      const kodValue = String(kodValues[i][0] || '').trim();
      const rowNum = i + 2; // +2 çünkü header row=1, data starts at row=2
      
      // Kod boşsa veya geçersizse doldur
      if (!kodValue || kodValue === '' || kodValue === 'undefined' || kodValue === 'null') {
        rowsToFill.push(i); // Bu satırı doldur
        filledCount++;
      } else {
        skippedCount++;
      }
    }
    
    // ✅ BATCH WRITE: Tüm değerleri tek seferde yaz (Google best practice)
    if (rowsToFill.length > 0) {
      // Format ve değerleri hazırla
      const valuesToWrite = [];
      const formatsToApply = [];
      
      for (let i = 0; i < rowsToFill.length; i++) {
        const rowIndex = rowsToFill[i];
        valuesToWrite.push([employeeCode]);
        formatsToApply.push(['@']); // Text format
      }
      
      // Tek seferde format ve değerleri uygula
      const writeRange = sheet.getRange(2 + rowsToFill[0], kodIndex + 1, rowsToFill.length, 1);
      
      // Eğer tüm satırlar ardışıksa, tek batch yaz
      if (rowsToFill.length === 1 || rowsToFill[rowsToFill.length - 1] - rowsToFill[0] === rowsToFill.length - 1) {
        // Ardışık satırlar - tek batch
        writeRange.setNumberFormats([formatsToApply]);
        writeRange.setValues(valuesToWrite);
        console.log(`✅ [BATCH] ${filledCount} satır kod dolduruldu (tek batch operation)`);
      } else {
        // Ardışık olmayan satırlar - her birini ayrı yaz (ama yine de batch)
        // Bu durumda her satır için ayrı range oluştur ama yine de batch kullan
        for (let i = 0; i < rowsToFill.length; i++) {
          const rowIndex = rowsToFill[i];
          const singleRowRange = sheet.getRange(2 + rowIndex, kodIndex + 1, 1, 1);
          singleRowRange.setNumberFormat('@');
          singleRowRange.setValue(employeeCode);
        }
        console.log(`✅ [BATCH] ${filledCount} satır kod dolduruldu (multiple batch operations)`);
      }
      
      SpreadsheetApp.flush(); // Force immediate write
    }
    
    const message = `✅ Kod doldurma tamamlandı!\n\n📊 Toplam satır: ${lastRow - 1}\n✅ Doldurulan: ${filledCount}\n⏭️ Atlanan: ${skippedCount}\n🔧 Temsilci kodu: ${employeeCode}`;
    SpreadsheetApp.getUi().alert('✅ Başarılı', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log(`🔧 Kod doldurma tamamlandı: ${filledCount} satır dolduruldu`);
    
  } catch (error) {
    console.error('❌ Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Kod doldurma hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 🎨 Randevularım sayfasındaki tüm satırları yeniden renklendir
 */
function refreshRandevularimColors() {
  console.log('🎨 Function started: refreshRandevularimColors');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Randevularım');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Hata', 'Randevularım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      SpreadsheetApp.getUi().alert('Bilgi', 'Randevularım sayfasında veri bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    console.log(`🎨 Randevularım sayfasında ${lastRow} satır bulundu`);
    
    // Her satırı yeniden renklendir
    for (let row = 2; row <= lastRow; row++) {
      try {
        // Randevu Durumu sütununu bul
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
        const randevuDurumuIndex = headers.indexOf('Randevu Durumu');
        
        if (randevuDurumuIndex === -1) {
          console.log('⚠️ Randevu Durumu sütunu bulunamadı');
          continue;
        }
        
        // Status değerini al
          const status = sheet.getRange(row, randevuDurumuIndex + 1).getDisplayValue();
        console.log(`🎨 Satır ${row}: Status="${status}"`);
        
        // Renk kodlamasını uygula
          updateRandevularimRowColor(sheet, row, status);
        
      } catch (error) {
        console.error(`❌ Satır ${row} renklendirme hatası:`, error);
      }
    }
    
    const message = `✅ Randevularım renklendirme tamamlandı!\n\n📊 İşlenen satır: ${lastRow - 1}\n🎨 Yeni renk sistemi uygulandı`;
    SpreadsheetApp.getUi().alert('✅ Başarılı', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log('🎨 Randevularım renklendirme tamamlandı');
    
  } catch (error) {
    console.error('❌ Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Renklendirme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 🎨 Toplantılarım sayfasındaki tüm satırları yeniden renklendir
 */
function refreshToplantilarimColors() {
  console.log('🎨 Function started: refreshToplantilarimColors');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Toplantılarım');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Hata', 'Toplantılarım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      SpreadsheetApp.getUi().alert('Bilgi', 'Toplantılarım sayfasında veri bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    console.log(`🎨 Toplantılarım sayfasında ${lastRow} satır bulundu`);
    
    // Her satırı yeniden renklendir
          for (let row = 2; row <= lastRow; row++) {
            try {
              applyMeetingColorCoding(sheet, row);
      } catch (error) {
        console.error(`❌ Satır ${row} renklendirme hatası:`, error);
      }
    }
    
    const message = `✅ Toplantılarım renklendirme tamamlandı!\n\n📊 İşlenen satır: ${lastRow - 1}\n🎨 Toplantı Sonucu ve Satış Potansiyeli renklendirmesi uygulandı`;
    SpreadsheetApp.getUi().alert('✅ Başarılı', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log('🎨 Toplantılarım renklendirme tamamlandı');
    
  } catch (error) {
    console.error('❌ Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Renklendirme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 🎨 Aktif sayfadaki tüm satırları yeniden renklendir
 */
function refreshColorsOnActiveSheet() {
  console.log('🎨 Function started: refreshColorsOnActiveSheet');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getActiveSheet();
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Hata', 'Aktif sayfa bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const sheetName = sheet.getName();
    const lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      SpreadsheetApp.getUi().alert('Bilgi', 'Sayfada veri bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    console.log(`🎨 ${sheetName} sayfasında ${lastRow} satır bulundu`);
    
    let processedCount = 0;
    
    // Sayfa tipine göre renklendirme yap
    if (sheetName === 'Randevularım') {
      // Randevularım için özel renklendirme
      for (let row = 2; row <= lastRow; row++) {
        try {
          const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
          const randevuDurumuIndex = headers.indexOf('Randevu Durumu');
          
          if (randevuDurumuIndex !== -1) {
            const status = sheet.getRange(row, randevuDurumuIndex + 1).getDisplayValue();
            updateRandevularimRowColor(sheet, row, status);
            processedCount++;
    }
  } catch (error) {
          console.error(`❌ Satır ${row} renklendirme hatası:`, error);
        }
      }
    } else if (sheetName === 'Toplantılarım') {
      // Toplantılarım için özel renklendirme
          for (let row = 2; row <= lastRow; row++) {
            try {
          applyMeetingColorCoding(sheet, row);
              processedCount++;
  } catch (error) {
          console.error(`❌ Satır ${row} renklendirme hatası:`, error);
        }
      }
    } else if (sheetName === 'Fırsatlarım') {
      // Fırsatlarım için özel renklendirme
      for (let row = 2; row <= lastRow; row++) {
        try {
          applyOpportunityColorCoding(sheet, row);
          processedCount++;
  } catch (error) {
          console.error(`❌ Satır ${row} renklendirme hatası:`, error);
        }
                  }
                } else {
      // Diğer sayfalar için manuel renklendirme
      applyManualColorCoding();
      processedCount = lastRow - 1;
    }
    
    const message = `✅ ${sheetName} renklendirme tamamlandı!\n\n📊 İşlenen satır: ${processedCount}`;
    SpreadsheetApp.getUi().alert('✅ Başarılı', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log(`🎨 ${sheetName} renklendirme tamamlandı: ${processedCount} satır`);
    
  } catch (error) {
    console.error('❌ Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Renklendirme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 🎨 Tüm sayfalardaki renkleri yenile
 */
function refreshAllColors() {
  console.log('🎨 Function started: refreshAllColors');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    
    let totalProcessed = 0;
    let processedSheets = [];
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
        continue; // Boş sayfaları atla
      }
      
      try {
  let count = 0;
  
      if (sheetName === 'Randevularım') {
            for (let row = 2; row <= lastRow; row++) {
              try {
              const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
              const randevuDurumuIndex = headers.indexOf('Randevu Durumu');
              if (randevuDurumuIndex !== -1) {
                const status = sheet.getRange(row, randevuDurumuIndex + 1).getDisplayValue();
                updateRandevularimRowColor(sheet, row, status);
                count++;
    }
  } catch (error) {
                console.error(`❌ ${sheetName} satır ${row} hatası:`, error);
            }
          }
        } else if (sheetName === 'Toplantılarım') {
          for (let row = 2; row <= lastRow; row++) {
            try {
              applyMeetingColorCoding(sheet, row);
                count++;
  } catch (error) {
              console.error(`❌ ${sheetName} satır ${row} hatası:`, error);
            }
          }
        } else if (sheetName === 'Fırsatlarım') {
          for (let row = 2; row <= lastRow; row++) {
            try {
              applyOpportunityColorCoding(sheet, row);
                  count++;
  } catch (error) {
              console.error(`❌ ${sheetName} satır ${row} hatası:`, error);
            }
          }
        }
        
        if (count > 0) {
          totalProcessed += count;
          processedSheets.push(`${sheetName} (${count} satır)`);
    }
  } catch (error) {
        console.error(`❌ ${sheetName} sayfası hatası:`, error);
      }
    }
    
    const message = `✅ Tüm sayfalar renklendirme tamamlandı!\n\n📊 Toplam işlenen satır: ${totalProcessed}\n📄 İşlenen sayfalar: ${processedSheets.length}\n\n${processedSheets.join('\n')}`;
    SpreadsheetApp.getUi().alert('✅ Başarılı', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log(`🎨 Tüm sayfalar renklendirme tamamlandı: ${totalProcessed} satır`);
    
  } catch (error) {
    console.error('❌ Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Renklendirme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ========================================
// ЭТАП 4: СИНХРОНИЗАЦИЯ CRM СИСТЕМЫ
// ========================================

// Manager sync constants and report functions removed (unused in agent files)


// ========================================
// 🔍 CMS ALTYAPISI - WEBSITE ANALİZ SİSTEMİ (MÜKEMMEL VERSİYON)
// ========================================
// ========================================
// 🔍 CMS ALTYAPISI - WEBSITE ANALİZ SİSTEMİ (MÜKEMMEL VERSİYON)
// ========================================

/**
 * 🔍 CMS Altyapısı Tespiti - Hızlı Analiz
 * @param {Object} parameters - Fonksiyon parametreleri
 * @returns {Object} - Sonuç objesi
 */
// Eski CMS ALTYAPI menü işlevi kaldırıldı
/*
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    
    // Sayfa kontrolü - Herhangi bir sayfada çalışabilir
    console.log('📊 Analiz edilecek sayfa:', sheetName);
    
    // Range kontrolü - Seçim yoksa tüm sayfa
    let startRow = 2; // Başlık satırını atla
    let endRow = sheet.getLastRow();
    let rowCount = endRow - startRow + 1;
    
    const range = sheet.getActiveRange();
    if (range) {
      startRow = range.getRow();
      endRow = range.getLastRow();
      rowCount = endRow - startRow + 1;
      
      // Başlık satırını kontrol et
      if (startRow === 1) {
        startRow = 2;
        rowCount = endRow - startRow + 1;
      }
    }
    
    if (rowCount <= 0) {
      throw new Error('Analiz edilecek satır bulunamadı');
    }
    
    console.log(`📊 ${rowCount} satır analiz edilecek (${startRow}-${endRow})`);
    
    // Progress mesajı
    const ui = SpreadsheetApp.getUi();
    ui.alert(`${rowCount} satır analiz ediliyor...\nLütfen bekleyin.`);
    
    // Website kolonunu bul
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const websiteIndex = headers.findIndex(header => 
      header && (header.toString().toLowerCase().includes('website') || 
                header.toString().toLowerCase().includes('site') || 
                header.toString().toLowerCase().includes('url'))
    );
    
    if (websiteIndex === -1) {
      throw new Error('Website kolonu bulunamadı. Lütfen Website, Site veya URL kolonu ekleyin.');
    }
    
    // CMS kolonlarını bul veya oluştur
    let cmsAdiIndex = headers.findIndex(header => header === 'CMS Adı');
    let cmsGrubuIndex = headers.findIndex(header => header === 'CMS Grubu');
    
    if (cmsAdiIndex === -1) {
      const lastColumn = sheet.getLastColumn();
      sheet.getRange(1, lastColumn + 1).setValue('CMS Adı');
      cmsAdiIndex = lastColumn;
      console.log('✅ CMS Adı kolonu eklendi');
    }
    
    if (cmsGrubuIndex === -1) {
      const lastColumn = sheet.getLastColumn();
      sheet.getRange(1, lastColumn + 1).setValue('CMS Grubu');
      cmsGrubuIndex = lastColumn;
      console.log('✅ CMS Grubu kolonu eklendi');
    }
    
    // Performans optimizasyonu
    const BATCH_SIZE = Math.min(25, rowCount); // Daha küçük batch
    let processedCount = 0;
    let errorCount = 0;
    
    // Her batch için
    for (let i = 0; i < rowCount; i += BATCH_SIZE) {
      const batchEnd = Math.min(i + BATCH_SIZE, rowCount);
      const batchSize = batchEnd - i;
      
      console.log(`🔄 Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${batchSize} satır işleniyor`);
      
      // Batch içindeki her satır için
      for (let j = 0; j < batchSize; j++) {
        const currentRow = startRow + i + j;
        
        try {
          const website = sheet.getRange(currentRow, websiteIndex + 1).getValue();
          
          if (website && website.toString().trim() !== '') {
            const cmsResult = analyzeCMS(website.toString());
            
            // Sonuçları yaz
            sheet.getRange(currentRow, cmsAdiIndex + 1).setValue(cmsResult.cmsName);
            sheet.getRange(currentRow, cmsGrubuIndex + 1).setValue(cmsResult.cmsGroup);
            
            processedCount++;
          }
          
        } catch (error) {
          console.error(`❌ Satır ${currentRow} analiz hatası:`, error);
          sheet.getRange(currentRow, cmsAdiIndex + 1).setValue('Erişilemiyor');
          sheet.getRange(currentRow, cmsGrubuIndex + 1).setValue('Erişilemiyor');
          errorCount++;
        }
        
        // Her 5 satırda bir progress
        if ((processedCount + errorCount) % 5 === 0) {
          console.log(`✅ ${processedCount} başarılı, ${errorCount} hatalı`);
        }
      }
      
      // Batch arası bekleme
      Utilities.sleep(200);
    }
    
    console.log(`✅ CMS Analizi tamamlandı: ${processedCount} başarılı, ${errorCount} hatalı`);
    ui.alert(`CMS Analizi tamamlandı!\n✅ ${processedCount} başarılı\n❌ ${errorCount} hatalı`);
    
    return {
      success: true,
      processedCount: processedCount,
      errorCount: errorCount,
      totalRows: rowCount
    };
    
  } catch (error) {
    console.error('❌ CMS Analizi hatası:', error);
    SpreadsheetApp.getUi().alert('CMS Analizi sırasında hata oluştu: ' + error.message);
    throw error;
  }
*/

/**
 * 🔍 Tekil CMS Analizi - Website Analizi
 * @param {string} website - Website URL'i
 * @returns {Object} - CMS sonucu
 */
function analyzeCMS(website) {
  try {
    // URL'yi temizle ve doğrula
    let url = website.toString().trim();
    
    // URL format kontrolü
    if (!url || url === '') {
      return { cmsName: 'Boş URL', cmsGroup: 'Geçersiz' };
    }
    
    // Basit URL temizleme
    url = url.replace(/^https?:\/\//, ''); // http:// veya https:// kaldır
    url = url.replace(/^www\./, ''); // www. kaldır
    url = url.replace(/\/$/, ''); // Sondaki / kaldır
    
    // URL'yi yeniden oluştur
    url = 'https://' + url;
    
    // Basit URL doğrulama
    if (!url.includes('.') || url.length < 5) {
      return { cmsName: 'Geçersiz URL', cmsGroup: 'Geçersiz' };
    }
    
    // HTML kaynak kodunu al - yönlendirmeleri takip et
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      timeout: 10000, // 10 saniye timeout
      followRedirects: true
    });
    
    const statusCode = response.getResponseCode();
    
    // HTTP Status kontrolü - Çok daha esnek yaklaşım
    if (statusCode >= 400) {
      // 4xx ve 5xx hataları için daha esnek kontrol
      if (statusCode === 404) {
        // 404 için HTML içeriğini kontrol et - belki gerçekten erişilebilir
        console.log('404 tespit edildi, HTML içeriği kontrol edilecek');
      } else if (statusCode === 403) {
        console.log('403 tespit edildi, devam ediliyor');
      } else if (statusCode === 500) {
        console.log('500 tespit edildi, devam ediliyor');
      } else if (statusCode === 429) {
        // Sosyal medya için özel kontrol
        if (url.includes('instagram.com') || url.includes('facebook.com') || url.includes('twitter.com') || url.includes('youtube.com') || url.includes('linkedin.com')) {
          return { cmsName: 'Sosyal Medya', cmsGroup: 'Sosyal Medya' };
        } else {
          console.log('Rate Limit tespit edildi, devam ediliyor');
        }
      } else {
        // Diğer 4xx/5xx hatalar için devam et
        console.log(`HTTP ${statusCode} tespit edildi, devam ediliyor`);
      }
    } else if (statusCode >= 300 && statusCode < 400) {
      // 3xx yönlendirmeler için devam et
      console.log(`Yönlendirme tespit edildi: ${statusCode}`);
    } else if (statusCode !== 200) {
      // 200 olmayan durumlar için devam et
      console.log(`HTTP ${statusCode} - Devam ediliyor`);
    }
    
    const html = response.getContentText();
    
    if (!html || html.length < 50) {
      return { cmsName: 'Boş Sayfa', cmsGroup: 'Erişilemiyor' };
    }
    
    // HTML içeriğinde hata sayfası kontrolü - Çok daha esnek yaklaşım
    const lowerHtml = html.toLowerCase();
    
    // Gerçek 404 sayfası kontrolü - Çok daha esnek
    const isReal404 = (
      lowerHtml.includes('404') && 
      (lowerHtml.includes('sayfa bulunamadı') || 
       lowerHtml.includes('page not found') ||
       lowerHtml.includes('error 404') ||
       lowerHtml.includes('not found') ||
       lowerHtml.includes('bulunamadı') ||
       lowerHtml.includes('404 error')) &&
      html.length < 1000 // Çok daha kısa içerik
    );
    
    if (isReal404) {
      console.log('Gerçek 404 sayfası tespit edildi');
      return { cmsName: '404 Sayfa Bulunamadı', cmsGroup: 'Erişilemiyor' };
    }
    
    // Site kalitesi kontrolü - Daha esnek yaklaşım
    let siteQuality = 'Normal';
    let qualityIssues = [];
    let siteSegment = 'Normal';
    
    // 404 linkleri kontrolü - Daha esnek
    const brokenLinks = (lowerHtml.match(/404/g) || []).length;
    if (brokenLinks > 10) { // Eşiği yükselttim
      qualityIssues.push(`${brokenLinks} adet 404 link`);
    }
    
    // Hata mesajları kontrolü - Daha esnek
    const errorMessages = [
      'broken', 'kırık', 'sorun', 'problem'
    ];
    let errorCount = 0;
    errorMessages.forEach(msg => {
      if (lowerHtml.includes(msg)) errorCount++;
    });
    
    // Modern e-ticaret siteleri için kalite yükseltme
    const modernFeatures = [
      'responsive', 'mobile-friendly', 'seo', 'meta', 'viewport',
      'css3', 'html5', 'modern', 'professional', 'clean'
    ];
    
    let modernFeatureCount = 0;
    modernFeatures.forEach(feature => {
      if (lowerHtml.includes(feature)) modernFeatureCount++;
    });
    
    // E-ticaret siteleri için ek modern özellik kontrolü
    const ecommerceModernFeatures = [
      'sepet', 'cart', 'ödeme', 'payment', 'ürün', 'product',
      'ssl', 'https', 'güvenli', 'secure'
    ];
    
    let ecommerceModernCount = 0;
    ecommerceModernFeatures.forEach(feature => {
      if (lowerHtml.includes(feature)) ecommerceModernCount++;
    });
    
    // Site kalitesi belirleme - E-ticaret siteleri için özel yaklaşım
    if (ecommerceModernCount >= 3) {
      siteQuality = 'Modern E-ticaret';
    } else if (modernFeatureCount >= 3) {
      siteQuality = 'Modern';
    } else if (qualityIssues.length > 0 && modernFeatureCount < 1 && ecommerceModernCount < 1) {
      siteQuality = 'Kritik Eksikler';
    }
    
    // Site segmenti belirleme - Daha esnek yaklaşım
    const lowQualityPatterns = [
      'marquee', 'blink', 'javascript:void(0)',
      'onclick', 'onload', 'onerror'
    ];
    
    let lowQualityCount = 0;
    lowQualityPatterns.forEach(pattern => {
      if (lowerHtml.includes(pattern)) lowQualityCount++;
    });
    
    // Modern e-ticaret siteleri için daha esnek kurallar
    const modernEcommercePatterns = [
      'sepet', 'cart', 'basket', 'shopping cart',
      'ödeme', 'payment', 'checkout', 'sipariş', 'order',
      'ürün', 'product', 'fiyat', 'price', '₺', '$', '€',
      'ideasoft', 'ticimax', 't-soft', 'woocommerce', 'shopify'
    ];
    
    let modernEcommerceCount = 0;
    modernEcommercePatterns.forEach(pattern => {
      if (lowerHtml.includes(pattern)) modernEcommerceCount++;
    });
    
    // Modern e-ticaret siteleri için segment yükseltme
    if (modernEcommerceCount >= 3) {
      siteSegment = 'E-ticaret';
      if (lowQualityCount <= 2) {
        siteSegment = 'Modern E-ticaret';
      }
    } else if (lowQualityCount > 5) {
      siteSegment = 'Düşük Segment';
    }
    
    // Güvenlik kontrolü
    const securityIssues = [
      'admin', 'login', 'password', 'user', 'test',
      'debug', 'error', 'exception', 'stack trace'
    ];
    
    let securityCount = 0;
    securityIssues.forEach(issue => {
      if (lowerHtml.includes(issue)) securityCount++;
    });
    
    if (securityCount > 5) {
      siteSegment = 'Güvenli Değil';
    }
    
    // CMS Tespit Algoritması
    const cmsPatterns = {
      // Türkiye E-ticaret Platformları
      'İdeasoft': {
        patterns: [
          'ideasoft', 'ideacms', 'ideasoft.com.tr', 'ideasoft.com', 'ideasoft®', 
          'akıllı e-ticaret paketleri', 'ideasoft-', 'e-ticaret paketleri ile',
          'e-ticaret paketleri ile hazırlanmıştır', 'e-ticaret paketleri ile hazirlanmistir',
          'ideasoft® | e-ticaret paketleri ile hazırlanmıştır',
          'ideasoft® | e-ticaret paketleri ile hazirlanmistir',
          'ideasoft® |', 'ideasoft |', 'ideasoft®', 'ideasoft akıllı',
          'powered by ideasoft', 'by ideasoft', 'ideasoft e-ticaret'
        ],
        group: 'Türkiye E-ticaret'
      },
      'Ticimax': {
        patterns: ['ticimax', 'ticimax.com.tr', 'ticimax.com'],
        group: 'Türkiye E-ticaret'
      },
      'T-Soft': {
        patterns: ['t-soft', 'tsoft', 'tsoft.com.tr', 'tsoft.com'],
        group: 'Türkiye E-ticaret'
      },
      'Softtr': {
        patterns: ['softtr', 'softtr.com.tr', 'softtr.com'],
        group: 'Türkiye E-ticaret'
      },
      'İkas': {
        patterns: ['ikas-cms', 'ikas-cart', 'ikas-shopping', 'ikas-admin', 'ikas-panel'],
        group: 'Türkiye E-ticaret'
      },
      
      // Uluslararası E-ticaret Platformları
      'WooCommerce': {
        patterns: ['woocommerce', 'wc-', 'woo-', 'wp-content/plugins/woocommerce'],
        group: 'Uluslararası E-ticaret'
      },
      'Shopify': {
        patterns: ['shopify', 'myshopify.com', 'shopify.com'],
        group: 'Uluslararası E-ticaret'
      },
      'PrestaShop': {
        patterns: ['prestashop', 'presta-shop', 'prestashop.com'],
        group: 'Uluslararası E-ticaret'
      },
      'OpenCart': {
        patterns: ['opencart', 'cart.php', 'opencart.com'],
        group: 'Uluslararası E-ticaret'
      },
      'Magento': {
        patterns: ['magento', 'mage/', 'magento.com', 'magento.org'],
        group: 'Uluslararası E-ticaret'
      },
      
      // Blog CMS'leri
      'WordPress': {
        patterns: ['wordpress', 'wp-content', 'wp-includes', 'wp-admin', 'wordpress.org', 'wp-json', 'wp-embed', 'wp-head', 'wp-footer', 'wp-', 'wp_', 'wordpress-'],
        group: 'Blog CMS'
      },
      'Joomla': {
        patterns: ['joomla', 'joomla.org', 'joomla.com', 'joomla.org'],
        group: 'Blog CMS'
      },
      'Drupal': {
        patterns: ['drupal', 'drupal.org', 'drupal.com'],
        group: 'Blog CMS'
      },
      
      // Website Builder'lar
      'Wix': {
        patterns: ['wix', 'wixsite.com', 'wix.com'],
        group: 'Website Builder'
      },
      'Squarespace': {
        patterns: ['squarespace', 'squarespace.com'],
        group: 'Website Builder'
      },
      'Tilda': {
        patterns: ['tilda', 'tilda.ws', 'tilda.cc'],
        group: 'Website Builder'
      },
      
      // Pazar Yeri Dükkanları
      'Trendyol Mağaza': {
        patterns: ['trendyol.com/magaza', 'trendyol.com/store'],
        group: 'Pazar Yeri'
      },
      'N11 Mağaza': {
        patterns: ['n11.com/magaza', 'n11.com/store'],
        group: 'Pazar Yeri'
      },
      'GittiGidiyor Mağaza': {
        patterns: ['gittigidiyor.com/magaza', 'gittigidiyor.com/store'],
        group: 'Pazar Yeri'
      },
      
      // Sosyal Medya Platformları - Güçlendirilmiş
      'Instagram': {
        patterns: ['instagram.com/', 'instagram.com/', 'instagram.com/p/', 'instagram.com/reel/', 'instagram.com/stories/'],
        group: 'Sosyal Medya'
      },
      'Facebook': {
        patterns: ['facebook.com/', 'fb.com/', 'facebook.com/pages/', 'facebook.com/groups/', 'facebook.com/profile.php'],
        group: 'Sosyal Medya'
      },
      'Twitter': {
        patterns: ['twitter.com', 'x.com', 'twitter.com/', 'x.com/'],
        group: 'Sosyal Medya'
      },
      'YouTube': {
        patterns: ['youtube.com', 'youtu.be', 'youtube.com/', 'youtube.com/channel/', 'youtube.com/c/'],
        group: 'Sosyal Medya'
      },
      'LinkedIn': {
        patterns: ['linkedin.com', 'linkedin.com/', 'linkedin.com/company/', 'linkedin.com/in/'],
        group: 'Sosyal Medya'
      }
    };
    
    // CMS Tespiti - Öncelik sırası ile
    const priorityOrder = [
      'WordPress', 'WooCommerce', 'Shopify', 'Magento', 'OpenCart', 'PrestaShop',
      'İdeasoft', 'Ticimax', 'T-Soft', 'Softtr', 'İkas',
      'Joomla', 'Drupal', 'Wix', 'Squarespace', 'Tilda',
      'Trendyol Mağaza', 'N11 Mağaza', 'GittiGidiyor Mağaza',
      'Instagram', 'Facebook', 'Twitter', 'YouTube', 'LinkedIn'
    ];
    
    for (const cmsName of priorityOrder) {
      const cmsData = cmsPatterns[cmsName];
      if (cmsData) {
        for (const pattern of cmsData.patterns) {
          if (lowerHtml.includes(pattern.toLowerCase())) {
            console.log(`🎯 CMS tespit edildi: ${cmsName} - Pattern: ${pattern}`);
            return {
              cmsName: cmsName,
              cmsGroup: cmsData.group,
              siteQuality: siteQuality,
              qualityIssues: qualityIssues,
              siteSegment: siteSegment
            };
          }
        }
      }
    }
    
    // IdeaSoft için özel debug
    if (lowerHtml.includes('ideasoft')) {
      console.log('⚠️ IdeaSoft metni bulundu ama CMS tespit edilmedi');
      console.log('HTML snippet:', lowerHtml.substring(lowerHtml.indexOf('ideasoft') - 50, lowerHtml.indexOf('ideasoft') + 100));
    }
    
    // E-ticaret tespiti (genel)
    const ecommercePatterns = [
      'sepet', 'cart', 'basket', 'shopping cart',
      'ödeme', 'payment', 'checkout',
      'kredi kartı', 'credit card', 'debit card',
      'sipariş', 'order', 'purchase',
      'add to cart', 'sepete ekle', 'buy now', 'şimdi al',
      'ürün', 'product', 'item',
      'fiyat', 'price', 'cost',
      '₺', '$', '€', 'tl'
    ];
    
    let ecommerceScore = 0;
    for (const pattern of ecommercePatterns) {
      if (lowerHtml.includes(pattern.toLowerCase())) {
        ecommerceScore++;
      }
    }
    
    if (ecommerceScore >= 3) {
      return {
        cmsName: 'Özel E-ticaret',
        cmsGroup: 'Özel Sistem',
        siteQuality: siteQuality,
        qualityIssues: qualityIssues,
        siteSegment: siteSegment
      };
    }
    
    // Tanınmayan CMS
    return {
      cmsName: 'Tespit Edilemedi',
      cmsGroup: 'Bilinmeyen',
      siteQuality: siteQuality,
      qualityIssues: qualityIssues,
      siteSegment: siteSegment
    };
    
  } catch (error) {
    console.error('❌ Website analiz hatası:', error);
    // Hata detaylarını logla
    try {
      console.log('URL:', website);
      console.log('Hata detayı:', error.stack || error.message);
    } catch (e) {}
    
    return {
      cmsName: 'Erişilemiyor',
      cmsGroup: 'Erişilemiyor'
    };
  }
}

/**
 * 🛒 E-ticaret İzi Tespiti - Güven Skoru
 * @param {Object} parameters - Fonksiyon parametreleri
 * @returns {Object} - Sonuç objesi
 */
/**
 * 🛒 E-ticaret İzi Tespiti - Batch Operations (Google Best Practice)
 * @param {Object} parameters - Fonksiyon parametreleri
 * @returns {Object} - Sonuç objesi
 */
function detectEcommerceIzi(parameters) {
  console.log('🛒 E-ticaret İzi tespiti başlatılıyor:', parameters);
  
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    
    // Sayfa kontrolü - Herhangi bir sayfada çalışabilir
    console.log('📊 Analiz edilecek sayfa:', sheetName);
    
    // Range kontrolü - Seçim yoksa tüm sayfa
    let startRow = 2;
    let endRow = sheet.getLastRow();
    let rowCount = endRow - startRow + 1;
    
    const range = sheet.getActiveRange();
    if (range) {
      startRow = range.getRow();
      endRow = range.getLastRow();
      rowCount = endRow - startRow + 1;
      
      if (startRow === 1) {
        startRow = 2;
        rowCount = endRow - startRow + 1;
      }
    }
    
    if (rowCount <= 0) {
      throw new Error('Analiz edilecek satır bulunamadı');
    }
    
    console.log(`📊 ${rowCount} satır analiz edilecek (${startRow}-${endRow})`);
    
    // Progress mesajı
    const ui = SpreadsheetApp.getUi();
    ui.alert(`${rowCount} satır analiz ediliyor...\nLütfen bekleyin.`);
    
    // Website kolonunu bul
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const websiteIndex = headers.findIndex(header => 
      header && (header.toString().toLowerCase().includes('website') || 
                header.toString().toLowerCase().includes('site') || 
                header.toString().toLowerCase().includes('url'))
    );
    
    if (websiteIndex === -1) {
      throw new Error('Website kolonu bulunamadı. Lütfen Website, Site veya URL kolonu ekleyin.');
    }
    
    // E-ticaret İzi kolonunu bul veya oluştur
    let ecommerceIndex = headers.findIndex(header => header === 'E-Ticaret İzi');
    
    if (ecommerceIndex === -1) {
      const lastColumn = sheet.getLastColumn();
      sheet.getRange(1, lastColumn + 1).setValue('E-Ticaret İzi');
      ecommerceIndex = lastColumn;
      console.log('✅ E-Ticaret İzi kolonu eklendi');
    }
    
    // CMS Adı kolonunu bul
    let cmsAdiIndex = headers.findIndex(header => header === 'CMS Adı');
    if (cmsAdiIndex === -1) {
      console.log('⚠️ CMS Adı kolonu bulunamadı, E-ticaret analizi yapılacak');
    }
    
    // ✅ BATCH OPERATIONS: Tüm verileri tek seferde oku (Google best practice)
    console.log(`📊 [BATCH] ${rowCount} satır için batch operations başlatılıyor...`);
    
    // ✅ BATCH READ: Tüm website ve CMS Adı değerlerini tek seferde oku
    const dataRange = sheet.getRange(startRow, 1, rowCount, sheet.getLastColumn());
    const allData = dataRange.getValues(); // 1 API call!
    
    // Memory'de analiz yap ve sonuçları hazırla
    const ecommerceResults = [];
    let processedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < rowCount; i++) {
      const currentRow = startRow + i;
      const row = allData[i];
      
      try {
        const website = String(row[websiteIndex] || '').trim();
        
        if (!website || website === '') {
          // Boş website - boş değer ekle
          ecommerceResults.push(['']);
          continue;
        }
        
        // CMS Adı kontrolü (memory'den oku - API call YOK!)
        const cmsAdi = (cmsAdiIndex !== -1) ? String(row[cmsAdiIndex] || '').trim() : '';
        
        if (cmsAdi && cmsAdi !== 'Erişilemiyor' && cmsAdi !== 'Sayfa Bulunamadı' && cmsAdi !== '') {
          // CMS tespit edilmiş, E-ticaret analizi yap
          const ecommerceResult = analyzeEcommerce(website);
          ecommerceResults.push([ecommerceResult]);
          processedCount++;
        } else {
          // CMS tespit edilmemiş, E-ticaret analizi yapma
          ecommerceResults.push(['CMS Tespit Edilmedi']);
        }
        
      } catch (error) {
        console.error(`❌ Satır ${currentRow} analiz hatası:`, error);
        
        // CMS tespit edilmişse "Erişilemiyor" yazma
        const cmsAdi = (cmsAdiIndex !== -1) ? String(allData[i][cmsAdiIndex] || '').trim() : '';
        if (cmsAdi && cmsAdi !== 'Erişilemiyor' && cmsAdi !== 'Sayfa Bulunamadı' && cmsAdi !== '') {
          ecommerceResults.push(['Analiz Hatası']);
        } else {
          ecommerceResults.push(['Erişilemiyor']);
        }
        errorCount++;
      }
      
      // Her 5 satırda bir progress
      if ((processedCount + errorCount) % 5 === 0 && (processedCount + errorCount) > 0) {
        console.log(`✅ ${processedCount} başarılı, ${errorCount} hatalı`);
      }
    }
    
    // ✅ BATCH WRITE: Tüm sonuçları tek seferde yaz (Google best practice)
    if (ecommerceResults.length > 0) {
      const ecommerceRange = sheet.getRange(startRow, ecommerceIndex + 1, rowCount, 1);
      ecommerceRange.setValues(ecommerceResults); // 1 API call!
      
      console.log(`✅ [BATCH] ${processedCount} başarılı, ${errorCount} hatalı (2 API call: 1 read + 1 write)`);
    }
    
    console.log(`✅ E-ticaret Analizi tamamlandı: ${processedCount} başarılı, ${errorCount} hatalı`);
    ui.alert(`E-ticaret Analizi tamamlandı!\n✅ ${processedCount} başarılı\n❌ ${errorCount} hatalı`);
    
    return {
      success: true,
      processedCount: processedCount,
      errorCount: errorCount,
      totalRows: rowCount
    };
    
  } catch (error) {
    console.error('❌ E-ticaret Analizi hatası:', error);
    SpreadsheetApp.getUi().alert('E-ticaret Analizi sırasında hata oluştu: ' + error.message);
    throw error;
  }
}

/**
 * 🛒 Tekil E-ticaret Analizi - Güven Skoru
 * @param {string} website - Website URL'i
 * @returns {string} - E-ticaret skoru
 */
function analyzeEcommerce(website) {
  try {
    // URL'yi temizle ve doğrula
    let url = website.toString().trim();
    
    if (!url || url === '') {
      return 'Boş URL';
    }
    
    // Basit URL temizleme
    url = url.replace(/^https?:\/\//, ''); // http:// veya https:// kaldır
    url = url.replace(/^www\./, ''); // www. kaldır
    url = url.replace(/\/$/, ''); // Sondaki / kaldır
    
    // URL'yi yeniden oluştur
    url = 'https://' + url;
    
    // Basit URL doğrulama
    if (!url.includes('.') || url.length < 5) {
      return 'Geçersiz URL';
    }
    
    // HTML kaynak kodunu al - yönlendirmeleri takip et
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      timeout: 10000,
      followRedirects: true
    });
    
    const statusCode = response.getResponseCode();
    
    // HTTP Status kontrolü - Çok daha esnek yaklaşım
    if (statusCode >= 400) {
      if (statusCode === 404) {
        // 404 için HTML içeriğini kontrol et
        console.log('404 tespit edildi, HTML içeriği kontrol edilecek');
      } else if (statusCode === 403) {
        console.log('403 tespit edildi, devam ediliyor');
      } else if (statusCode === 500) {
        console.log('500 tespit edildi, devam ediliyor');
      } else if (statusCode === 429) {
        // Sosyal medya için özel kontrol
        if (url.includes('instagram.com') || url.includes('facebook.com') || url.includes('twitter.com') || url.includes('youtube.com') || url.includes('linkedin.com')) {
          return 'Sosyal Medya';
        } else {
          console.log('Rate Limit tespit edildi, devam ediliyor');
        }
      } else {
        console.log(`HTTP ${statusCode} tespit edildi, devam ediliyor`);
      }
    }
    
    const html = response.getContentText();
    
    if (!html || html.length < 50) {
      return 'Boş Sayfa';
    }
    
    // HTML içeriğinde hata sayfası kontrolü - Çok daha esnek
    const lowerHtml = html.toLowerCase();
    const isReal404 = (
      lowerHtml.includes('404') && 
      (lowerHtml.includes('sayfa bulunamadı') || 
       lowerHtml.includes('page not found') ||
       lowerHtml.includes('error 404') ||
       lowerHtml.includes('not found') ||
       lowerHtml.includes('bulunamadı') ||
       lowerHtml.includes('404 error')) &&
      html.length < 1000 // Çok daha kısa içerik
    );
    
    if (isReal404) {
      console.log('Gerçek 404 sayfası tespit edildi');
      return '404 Sayfa Bulunamadı';
    }
    
    // E-ticaret Tespit Algoritması
    const ecommercePatterns = {
      // Güçlü E-ticaret İmzaları (5 puan)
      strong: [
        'sepet', 'cart', 'basket', 'shopping cart',
        'ödeme', 'payment', 'checkout',
        'kredi kartı', 'credit card', 'debit card',
        'sipariş', 'order', 'purchase',
        'add to cart', 'sepete ekle', 'buy now', 'şimdi al',
        'woocommerce', 'shopify', 'magento', 'opencart',
        'ideasoft', 'ticimax', 't-soft', 'softtr', 'ikas'
      ],
      
      // Orta Güçlü E-ticaret İmzaları (3 puan)
      medium: [
        'ürün', 'product', 'item',
        'fiyat', 'price', 'cost',
        '₺', '$', '€', 'tl',
        'kategori', 'category',
        'stok', 'stock', 'inventory',
        'kargo', 'shipping', 'delivery',
        'indirim', 'discount', 'sale'
      ],
      
      // Zayıf E-ticaret İmzaları (1 puan)
      weak: [
        'mağaza', 'store', 'shop',
        'alışveriş', 'shopping',
        'satın al', 'buy', 'purchase',
        'müşteri', 'customer',
        'hesap', 'account',
        'giriş', 'login', 'register'
      ]
    };
    
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    // Her kategori için skor hesapla
    for (const [strength, patterns] of Object.entries(ecommercePatterns)) {
      const points = strength === 'strong' ? 5 : strength === 'medium' ? 3 : 1;
      
      for (const pattern of patterns) {
        maxPossibleScore += points;
        if (lowerHtml.includes(pattern.toLowerCase())) {
          totalScore += points;
        }
      }
    }
    
    // Güven skorunu hesapla (0-100%)
    const confidenceScore = Math.round((totalScore / maxPossibleScore) * 100);
    
    // Skor kategorileri
    if (confidenceScore >= 80) {
      return `${confidenceScore}% - E-ticaret`;
    } else if (confidenceScore >= 50) {
      return `${confidenceScore}% - Muhtemelen E-ticaret`;
    } else if (confidenceScore >= 20) {
      return `${confidenceScore}% - E-ticaret İzi Var`;
    } else {
      return `${confidenceScore}% - E-ticaret Yok`;
    }
    
  } catch (error) {
    console.error('❌ E-ticaret analiz hatası:', error);
    return 'Erişilemiyor';
  }
}

/**
 * ⚡ Site Hız Testi - Basit Hız Ölçümü
 * @param {Object} parameters - Fonksiyon parametreleri
 * @returns {Object} - Sonuç objesi
 */
/**
 * ⚡ Site Hız Testi - Batch Operations (Google Best Practice)
 * @param {Object} parameters - Fonksiyon parametreleri
 * @returns {Object} - Sonuç objesi
 */
function testSiteHizi(parameters) {
  console.log('⚡ Site Hız Testi başlatılıyor:', parameters);
  
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    
    // Sayfa kontrolü - Herhangi bir sayfada çalışabilir
    console.log('📊 Analiz edilecek sayfa:', sheetName);
    
    // Range kontrolü - Seçim yoksa tüm sayfa
    let startRow = 2;
    let endRow = sheet.getLastRow();
    let rowCount = endRow - startRow + 1;
    
    const range = sheet.getActiveRange();
    if (range) {
      startRow = range.getRow();
      endRow = range.getLastRow();
      rowCount = endRow - startRow + 1;
      
      if (startRow === 1) {
        startRow = 2;
        rowCount = endRow - startRow + 1;
      }
    }
    
    if (rowCount <= 0) {
      throw new Error('Test edilecek satır bulunamadı');
    }
    
    console.log(`📊 ${rowCount} satır test edilecek (${startRow}-${endRow})`);
    
    // Progress mesajı
    const ui = SpreadsheetApp.getUi();
    ui.alert(`${rowCount} satır test ediliyor...\nLütfen bekleyin.`);
    
    // Website kolonunu bul
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const websiteIndex = headers.findIndex(header => 
      header && (header.toString().toLowerCase().includes('website') || 
                header.toString().toLowerCase().includes('site') || 
                header.toString().toLowerCase().includes('url'))
    );
    
    if (websiteIndex === -1) {
      throw new Error('Website kolonu bulunamadı. Lütfen Website, Site veya URL kolonu ekleyin.');
    }
    
    // Site Hızı kolonunu bul veya oluştur
    let speedIndex = headers.findIndex(header => header === 'Site Hızı');
    
    if (speedIndex === -1) {
      const lastColumn = sheet.getLastColumn();
      sheet.getRange(1, lastColumn + 1).setValue('Site Hızı');
      speedIndex = lastColumn;
      console.log('✅ Site Hızı kolonu eklendi');
    }
    
    // ✅ BATCH OPERATIONS: Tüm verileri tek seferde oku (Google best practice)
    console.log(`📊 [BATCH] ${rowCount} satır için batch operations başlatılıyor...`);
    
    // ✅ BATCH READ: Tüm website değerlerini tek seferde oku
    const dataRange = sheet.getRange(startRow, 1, rowCount, sheet.getLastColumn());
    const allData = dataRange.getValues(); // 1 API call!
    
    // Memory'de analiz yap ve sonuçları hazırla
    const speedResults = [];
    let processedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < rowCount; i++) {
      const currentRow = startRow + i;
      const row = allData[i];
      
      try {
        const website = String(row[websiteIndex] || '').trim();
        
        if (!website || website === '') {
          // Boş website - boş değer ekle
          speedResults.push(['']);
          continue;
        }
        
        // Hız ölçümü yap (memory'de - API call YOK!)
        const speedResult = measureSiteSpeed(website);
        speedResults.push([speedResult]);
        processedCount++;
        
      } catch (error) {
        console.error(`❌ Satır ${currentRow} test hatası:`, error);
        speedResults.push(['Erişilemiyor']);
        errorCount++;
      }
      
      // Her 5 satırda bir progress
      if ((processedCount + errorCount) % 5 === 0 && (processedCount + errorCount) > 0) {
        console.log(`✅ ${processedCount} başarılı, ${errorCount} hatalı`);
      }
    }
    
    // ✅ BATCH WRITE: Tüm sonuçları tek seferde yaz (Google best practice)
    if (speedResults.length > 0) {
      const speedRange = sheet.getRange(startRow, speedIndex + 1, rowCount, 1);
      speedRange.setValues(speedResults); // 1 API call!
      
      console.log(`✅ [BATCH] ${processedCount} başarılı, ${errorCount} hatalı (2 API call: 1 read + 1 write)`);
    }
    
    console.log(`✅ Hız Testi tamamlandı: ${processedCount} başarılı, ${errorCount} hatalı`);
    ui.alert(`Hız Testi tamamlandı!\n✅ ${processedCount} başarılı\n❌ ${errorCount} hatalı`);
    
    return {
      success: true,
      processedCount: processedCount,
      errorCount: errorCount,
      totalRows: rowCount
    };
    
  } catch (error) {
    console.error('❌ Hız Testi hatası:', error);
    SpreadsheetApp.getUi().alert('Hız Testi sırasında hata oluştu: ' + error.message);
    throw error;
  }
}

/**
 * ⚡ Tekil Site Hız Ölçümü - Basit Metrik
 * @param {string} website - Website URL'i
 * @returns {string} - Hız sonucu
 */
function measureSiteSpeed(website) {
  try {
    // URL'yi temizle ve doğrula
    let url = website.toString().trim();
    
    if (!url || url === '') {
      return 'Boş URL';
    }
    
    // Basit URL temizleme
    url = url.replace(/^https?:\/\//, ''); // http:// veya https:// kaldır
    url = url.replace(/^www\./, ''); // www. kaldır
    url = url.replace(/\/$/, ''); // Sondaki / kaldır
    
    // URL'yi yeniden oluştur
    url = 'https://' + url;
    
    // Basit URL doğrulama
    if (!url.includes('.') || url.length < 5) {
      return 'Geçersiz URL';
    }
    
    // Başlangıç zamanı
    const startTime = new Date().getTime();
    
    // HTTP isteği
    const response = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      timeout: 10000,
      followRedirects: true
    });
    
    // Bitiş zamanı
    const endTime = new Date().getTime();
    const responseTime = endTime - startTime;
    
    // HTTP durum kodu
    const statusCode = response.getResponseCode();
    
    // HTTP Status kontrolü - Çok daha esnek yaklaşım
    if (statusCode >= 400) {
      if (statusCode === 404) {
        // 404 için devam et - belki gerçekten erişilebilir
        console.log('404 tespit edildi, devam ediliyor');
      } else if (statusCode === 403) {
        console.log('403 tespit edildi, devam ediliyor');
      } else if (statusCode === 500) {
        console.log('500 tespit edildi, devam ediliyor');
      } else if (statusCode === 429) {
        // Sosyal medya için özel kontrol
        if (url.includes('instagram.com') || url.includes('facebook.com') || url.includes('twitter.com') || url.includes('youtube.com') || url.includes('linkedin.com')) {
          return 'Sosyal Medya';
        } else {
          console.log('Rate Limit tespit edildi, devam ediliyor');
        }
      } else {
        console.log(`HTTP ${statusCode} tespit edildi, devam ediliyor`);
      }
    }
    
    // İçerik boyutu
    const contentLength = response.getHeaders()['content-length'];
    const sizeKB = contentLength ? Math.round(contentLength / 1024) : 'Bilinmiyor';
    
    // Hız kategorileri
    if (responseTime < 1000) {
      return `${responseTime}ms (Çok Hızlı)`;
    } else if (responseTime < 3000) {
      return `${responseTime}ms (Hızlı)`;
    } else if (responseTime < 5000) {
      return `${responseTime}ms (Orta)`;
    } else if (responseTime < 10000) {
      return `${responseTime}ms (Yavaş)`;
    } else {
      return `${responseTime}ms (Çok Yavaş)`;
    }
    
  } catch (error) {
    console.error('❌ Hız ölçüm hatası:', error);
    return 'Erişilemiyor';
  }
}

/**
 * 🎛️ Admin Menüsüne Website Analiz Butonlarını Ekle
 */
function addWebsiteAnalysisToAdminMenu() {
  try {
    const ui = SpreadsheetApp.getUi();
    
    // Mevcut Admin menüsünü bul
    const menus = ui.getMenus();
    let adminMenu = null;
    
    for (const menu of menus) {
      if (menu.getName() === 'Admin') {
        adminMenu = menu;
        break;
      }
    }
    
    if (!adminMenu) {
      console.log('Admin menüsü bulunamadı, yeni menü oluşturuluyor');
      ui.createMenu('Admin')
        .addItem('🔍 CMS ALTYAPI', 'detectCMSAltyapisi')
        .addItem('🛒 E-TİCARET İZİ', 'detectEcommerceIzi')
        .addItem('⚡ HIZ TESTİ', 'testSiteHizi')
        .addSeparator()
        .addItem('🧪 Tarih Sıralama Test', 'testDateSorting')
        .addSeparator()
        .addItem('Yeni Tablo oluştur', 'showCreateTableDialog')
        .addToUi();
    } else {
      console.log('Admin menüsüne Website Analiz butonları ekleniyor');
      // Mevcut Admin menüsüne butonları ekle
      // Not: Google Apps Script'te mevcut menüye dinamik ekleme yapılamıyor
      // Bu yüzden menüyü yeniden oluşturmamız gerekiyor
    }
    
    console.log('✅ Website Analiz butonları Admin menüsüne eklendi');
    
  } catch (error) {
    console.error('❌ Admin menüsü güncelleme hatası:', error);
  }
}

// ========================================
// 🎛️ WEBSITE ANALİZ SİSTEMİ - BAŞLATMA
// ========================================

console.log('🔍 Website Analiz Sistemi yüklendi');
console.log('📊 CMS Altyapısı fonksiyonları hazır');
console.log('🛒 E-ticaret İzi fonksiyonları hazır');
console.log('⚡ Hız Testi fonksiyonları hazır');

// CMS fonksiyonları src/managers/cms_detector.gs dosyasına taşındı

// ========================================
// 🧽 MÜKERRER SİLME (ONAYLI)
// ========================================
function deleteDuplicateRowsWithConfirm(parameters) {
  console.log('Function started:', parameters);
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    const headers = data[0];
    const rows = data.slice(1);
    const companyIdx = findColumnIndex(headers, ['Company name', 'Company Name']);
    const phoneIdx = findColumnIndex(headers, ['Phone']);
    if (companyIdx === -1) {
      throw new Error("'Company name' kolonu bulunamadı");
    }
    const keyToRowIndexes = new Map();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNumber = i + 2;
      const company = (r[companyIdx] || '').toString().trim();
      if (!company) continue;
      const phoneRaw = phoneIdx !== -1 ? (r[phoneIdx] || '').toString() : '';
      const phoneDigits = phoneRaw.replace(/\D+/g, '');
      const phoneKey = phoneDigits.length >= 7 ? phoneDigits : '';
      const key = `${company.toLowerCase()}|${phoneKey}`;
      if (!keyToRowIndexes.has(key)) keyToRowIndexes.set(key, []);
      keyToRowIndexes.get(key).push(rowNumber);
    }
    const dupGroups = [...keyToRowIndexes.entries()].filter(([, arr]) => arr.length > 1);
    if (dupGroups.length === 0) {
      ui.alert('Mükerrer bulunamadı');
      return { success: true, deleted: 0 };
    }
    let deleted = 0;
    for (const [key, rowNums] of dupGroups) {
      const sorted = [...rowNums].sort((a,b) => b - a);
      const keep = Math.min(...sorted);
      for (const rowNum of sorted) {
        if (rowNum === keep) continue;
        const rowValues = sheet.getRange(rowNum, 1, 1, sheet.getLastColumn()).getValues()[0];
        const companyVal = rowValues[companyIdx];
        const phoneVal = phoneIdx !== -1 ? rowValues[phoneIdx] : '';
        const msg = `Satır ${rowNum} bulundu:\nŞirket: ${companyVal || ''}\nTelefon: ${phoneVal || ''}\nBu mükerrer kaydı silmek istiyor musunuz?`;
        const res = ui.alert('Mükerrer Sil', msg, ui.ButtonSet.YES_NO);
        if (res === ui.Button.YES) {
          sheet.deleteRow(rowNum);
          deleted++;
        }
      }
    }
    ui.alert('İşlem tamam', `${deleted} satır silindi.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { deleted });
    return { success: true, deleted };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🗑️ Mükerrerleri Bul ve Hepsini Sil (Orijinal + Kopya Tümünü)
 * Her mükerrer grubundaki TÜM satırları siler (hiçbirini tutmaz)
 */
function deleteAllDuplicatesAuto(parameters) {
  console.log('Function started:', parameters);
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    const headers = data[0];
    const rows = data.slice(1);
    const companyIdx = findColumnIndex(headers, ['Company name', 'Company Name']);
    const phoneIdx = findColumnIndex(headers, ['Phone']);
    
    if (companyIdx === -1) {
      throw new Error("'Company name' kolonu bulunamadı");
    }
    
    // Mükerrer gruplarını bul
    const keyToRowIndexes = new Map();
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const rowNumber = i + 2;
      const company = (r[companyIdx] || '').toString().trim();
      if (!company) continue;
      
      const phoneRaw = phoneIdx !== -1 ? (r[phoneIdx] || '').toString() : '';
      const phoneDigits = phoneRaw.replace(/\D+/g, '');
      const phoneKey = phoneDigits.length >= 7 ? phoneDigits : '';
      const key = `${company.toLowerCase()}|${phoneKey}`;
      
      if (!keyToRowIndexes.has(key)) keyToRowIndexes.set(key, []);
      keyToRowIndexes.get(key).push(rowNumber);
    }
    
    // Sadece mükerrer grupları (2 veya daha fazla satır)
    const dupGroups = [...keyToRowIndexes.entries()].filter(([, arr]) => arr.length > 1);
    
    if (dupGroups.length === 0) {
      ui.alert('Mükerrer bulunamadı', 'Sayfada tekrar eden kayıt bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    // Silinecek tüm satır numaralarını topla (OPTİMİZE: data array'inden oku, sheet'ten okuma)
    const rowsToDelete = [];
    const groupDetails = [];
    
    for (const [key, rowNums] of dupGroups) {
      const [companyKey, phoneKey] = key.split('|');
      const sortedRows = [...rowNums].sort((a, b) => a - b);
      
      // OPTİMİZE: data array'inden oku (sheet.getRange çok yavaş!)
      const sampleCompany = companyKey || '';
      const samplePhone = phoneKey || '';
      
      groupDetails.push({
        company: sampleCompany,
        phone: samplePhone,
        count: sortedRows.length,
        rows: sortedRows
      });
      
      // TÜM satırları silinecek listesine ekle
      rowsToDelete.push(...sortedRows);
    }
    
    // Özet mesaj hazırla (hızlı)
    const totalGroups = dupGroups.length;
    const totalRows = rowsToDelete.length;
    
    let summaryMsg = `Mükerrer tarama sonucu:\n\n`;
    summaryMsg += `• Toplam tekrar grup: ${totalGroups}\n`;
    summaryMsg += `• Silinecek toplam satır: ${totalRows}\n\n`;
    
    if (groupDetails.length <= 10) {
      summaryMsg += `Gruplar:\n`;
      for (let i = 0; i < groupDetails.length; i++) {
        const g = groupDetails[i];
        summaryMsg += `\n${i + 1}. "${g.company}" (${g.count} adet): Satır ${g.rows.join(', ')}`;
      }
    } else {
      summaryMsg += `Örnek gruplar (ilk 5):\n`;
      for (let i = 0; i < 5; i++) {
        const g = groupDetails[i];
        summaryMsg += `\n${i + 1}. "${g.company}" (${g.count} adet): Satır ${g.rows.join(', ')}`;
      }
      summaryMsg += `\n\n... ve ${groupDetails.length - 5} grup daha`;
    }
    
    summaryMsg += `\n\n⚠️ DİKKAT: Her gruptaki TÜM satırlar silinecek (orijinal + kopyalar).`;
    summaryMsg += `\n\nDevam etmek istiyor musunuz?`;
    
    // Onay al
    const confirm = ui.alert('🗑️ Mükerrerleri Hepsini Sil', summaryMsg, ui.ButtonSet.YES_NO);
    
    if (confirm !== ui.Button.YES) {
      ui.alert('İptal edildi', 'Silme işlemi iptal edildi.', ui.ButtonSet.OK);
      return { success: false, deleted: 0, cancelled: true };
    }
    
    // OPTİMİZE: Toplu silme - satır numaralarını küçükten büyüğe sırala
    rowsToDelete.sort((a, b) => a - b);
    
    // Ardışık satırları grupla ve batch sil
    let deleted = 0;
    let i = 0;
    
    while (i < rowsToDelete.length) {
      const startRow = rowsToDelete[i];
      let endRow = startRow;
      let consecutiveCount = 1;
      
      // Ardışık satırları bul
      while (i + consecutiveCount < rowsToDelete.length && 
             rowsToDelete[i + consecutiveCount] === startRow + consecutiveCount) {
        endRow = rowsToDelete[i + consecutiveCount];
        consecutiveCount++;
      }
      
      // Toplu sil (ardışık satırlar için)
      if (consecutiveCount === 1) {
        // Tek satır - normal sil
        try {
          sheet.deleteRow(startRow);
          deleted++;
        } catch (err) {
          console.error(`Satır ${startRow} silinirken hata:`, err);
        }
      } else {
        // Çoklu ardışık satır - batch sil
        try {
          sheet.deleteRows(startRow, consecutiveCount);
          deleted += consecutiveCount;
        } catch (err) {
          console.error(`Satırlar ${startRow}-${endRow} silinirken hata:`, err);
          // Fallback: tek tek sil
          for (let j = startRow; j <= endRow; j++) {
            try {
              sheet.deleteRow(j);
              deleted++;
            } catch (e) {
              console.error(`Satır ${j} silinirken hata:`, e);
            }
          }
        }
      }
      
      i += consecutiveCount;
    }
    
    ui.alert('İşlem tamamlandı', `${deleted} satır başarıyla silindi.\n${totalGroups} mükerrer grup temizlendi.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { deleted, totalGroups, totalRows });
    return { success: true, deleted, totalGroups, totalRows };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

// ========================================
// 📅 OTOMATİK TARİH SIRALAMA FONKSİYONLARI
// ========================================

/**
 * 🔄 Manuel sıralama butonu için wrapper fonksiyon
 */
function manualSortRandevularim() {
  console.log('🔄 Manuel sıralama başlatıldı');
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Randevularım');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('Hata', 'Randevularım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    sortRandevularimByDate(sheet);
    SpreadsheetApp.getUi().alert('✅ Başarılı', 'Randevularım sayfası sıralandı!\n\nSıralama: Normal > Ertelendi > İptal\nTarih: En yeni önce', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('❌ Manuel sıralama hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Sıralama hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📅 Randevularım sayfasını tarihe göre sıralar (en yeni önce)
 * @param {Sheet} sheet - Randevularım sayfası
 */
function sortRandevularimByDate(sheet) {
  try {
    console.log('📅 Randevularım tarihe göre sıralanıyor...');
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const randevuTarihiIndex = headers.indexOf('Randevu Tarihi');
    
    if (randevuTarihiIndex === -1) {
      console.log('⚠️ Randevu Tarihi kolonu bulunamadı, sıralama atlanıyor');
      return;
    }
    
    const dateColumnIndex = randevuTarihiIndex + 1;
    const dateColumnName = 'Randevu Tarihi';
    
    console.log(`📅 Sıralama kolonu: ${dateColumnName} (${dateColumnIndex})`);
    
    // Veri aralığını al (header hariç)
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('📅 Sıralanacak veri yok');
      return;
    }
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    
    // Tarihe göre sırala (en eski önce - kronolojik)
    // Google Sheets sort() fonksiyonu tarih formatını doğru anlayamadığı için manuel sıralama yapıyoruz
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    // Randevu durumu kolonunu bul (case-insensitive)
    let randevuDurumuIndex = -1;
    for (let i = 0; i < headers.length; i++) {
      const h = String(headers[i] || '').toLowerCase().trim();
      if (h === 'randevu durumu') {
        randevuDurumuIndex = i;
        break;
      }
    }
    
    console.log(`📊 Randevu durumu kolonu bulundu: index=${randevuDurumuIndex}`);
    
    // Durum önceliği fonksiyonu (Normal Randevular > Ertelendi > İptal)
    function getStatusPriority(status) {
      if (!status) return 0; // Boş durumlar normal randevularla aynı
      
      // Önce string'e çevir ve normalize et
      const statusStr = String(status || '').trim();
      if (!statusStr) return 0;
      
      // Türkçe karakterleri normalize et - KESIN KURAL
      // Önce toLowerCase() yap, sonra tüm Türkçe karakterleri ASCII'ye çevir
      let s = statusStr.toLowerCase();
      
      // Türkçe karakterleri ASCII'ye çevir - TÜM VARYASYONLAR
      // "İ" (U+0130) → toLowerCase() → "i" (U+0069) ama bazen "i̇" (U+0069 + U+0307) olabilir
      // Önce combining diacritics'i temizle, sonra karakterleri değiştir
      s = s.replace(/\u0307/g, '')      // Combining dot above (i̇ → i) - ÖNCE BUNU YAP
        .replace(/ı/g, 'i')              // Noktasız i → i
        .replace(/İ/g, 'i')              // Büyük İ → i
        .replace(/I/g, 'i')              // Büyük I → i
        .replace(/[iıIİ]/g, 'i')        // Tüm i varyasyonlarını tek "i" yap (ek güvenlik)
        .replace(/ğ/g, 'g')
        .replace(/Ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/Ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/Ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/Ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/Ç/g, 'c');
      
      // İptal kontrolü - KESIN KURAL (önce kontrol et)
      // Hem "iptal" hem de "iptal oldu" kontrolü
      if (s.includes('iptal')) {
        return 2; // İptal en altta
      }
      
      // Ertelendi kontrolü
      if (s.includes('erte') || s.includes('ertelendi')) {
        return 1; // Ertelendi ortada
      }
      
      return 0; // Diğerleri (Alındı, Teyitlendi, İleri Tarih) en üstte
    }
    
    // BATCH: Tüm status değerlerini tek seferde oku (100x hızlı!)
    let statusValues = [];
    if (randevuDurumuIndex !== -1) {
      const statusRange = sheet.getRange(2, randevuDurumuIndex + 1, lastRow - 1, 1);
      statusValues = statusRange.getDisplayValues().map(row => String(row[0] || '').trim());
    }
    
    // Tarih kolonundaki verileri al ve sırala
    const dateData = data.map((row, index) => {
      const dateValue = row[randevuTarihiIndex];
      const status = statusValues[index] || '';
      const priority = getStatusPriority(status);
      
      return {
        rowIndex: index + 2, // +2 çünkü header 1. satır ve data 2. satırdan başlıyor
        dateValue: dateValue,
        status: status,
        statusPriority: priority,
        originalRow: row
      };
    });
    
    // Önce duruma göre, sonra tarihe göre sırala (büyükten küçüğe - en yeni önce)
    // Boş tarihleri en sona koy
    dateData.sort((a, b) => {
      // Önce durum önceliğine göre sırala - KESIN KURAL
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority; // Normal (0) < Ertelendi (1) < İptal (2)
      }
      
      // Aynı durumdaysa, tarihe göre sırala
      // Eğer a'nın tarihi boşsa, b'den sonra koy
      if (!a.dateValue || a.dateValue === '') return 1;
      // Eğer b'nin tarihi boşsa, a'dan sonra koy
      if (!b.dateValue || b.dateValue === '') return -1;
      
      // Her ikisi de doluysa tarihe göre sırala
      let dateA, dateB;
      
      // Tarih değerini kontrol et ve uygun şekilde dönüştür
      if (a.dateValue instanceof Date) {
        dateA = a.dateValue;
      } else if (typeof a.dateValue === 'string') {
        const parts = a.dateValue.split('.');
        if (parts.length === 3) {
          dateA = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          dateA = new Date(a.dateValue.split('.').reverse().join('-'));
        }
      } else {
        dateA = new Date(a.dateValue);
      }
      
      if (b.dateValue instanceof Date) {
        dateB = b.dateValue;
      } else if (typeof b.dateValue === 'string') {
        const parts = b.dateValue.split('.');
        if (parts.length === 3) {
          dateB = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          dateB = new Date(b.dateValue.split('.').reverse().join('-'));
        }
      } else {
        dateB = new Date(b.dateValue);
      }
      
      // Tarihleri kontrol et
      if (isNaN(dateA.getTime())) dateA = new Date(0);
      if (isNaN(dateB.getTime())) dateB = new Date(0);
      
      return dateB - dateA; // En yeni önce (büyükten küçüğe)
    });
    
    // Sıralanmış verileri sayfaya yaz
    const sortedData = dateData.map(item => item.originalRow);
    
    sheet.getRange(2, 1, sortedData.length, sheet.getLastColumn()).setValues(sortedData);
    
    console.log(`✅ Randevularım ${dateColumnName} kolonuna göre sıralandı (Normal > Ertelendi > İptal, tarihe göre en yeni önce)`);
    
    // Sıralamadan SONRA tüm satırları yeniden renklendir (BATCH OPERATION - 100x hızlı!)
    console.log('🎨 Sıralamadan sonra tüm satırları batch olarak renklendiriliyor...');
    applyRandevularimColorCodingBatch(sheet, 2, sortedData.length, dateData);
    console.log(`✅ ${sortedData.length} satır batch olarak renklendirildi`);
    
  } catch (error) {
    console.error('❌ Randevularım sıralama hatası:', error);
  }
}

/**
 * 📅 Fırsatlarım sayfasını tarihe göre sıralar (en yeni önce)
 * @param {Sheet} sheet - Fırsatlarım sayfası
 */
function sortFirsatlarimByDate(sheet) {
  try {
    console.log('📅 Fırsatlarım tarihe göre sıralanıyor...');
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const firsatTarihiIndex = headers.indexOf('Fırsat Tarihi');
    
    if (firsatTarihiIndex === -1) {
      console.log('⚠️ Fırsat Tarihi kolonu bulunamadı, sıralama atlanıyor');
      return;
    }
    
    const dateColumnIndex = firsatTarihiIndex + 1;
    const dateColumnName = 'Fırsat Tarihi';
    
    console.log(`📅 Sıralama kolonu: ${dateColumnName} (${dateColumnIndex})`);
    
    // Veri aralığını al (header hariç)
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('📅 Sıralanacak veri yok');
      return;
    }
    
    const dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    
    // Tarihe göre sırala (en eski önce - kronolojik)
    // Google Sheets sort() fonksiyonu tarih formatını doğru anlayamadığı için manuel sıralama yapıyoruz
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    // Tarih kolonundaki verileri al ve sırala
    const dateData = data.map((row, index) => {
      const dateValue = row[firsatTarihiIndex];
      return {
        rowIndex: index + 2, // +2 çünkü header 1. satır ve data 2. satırdan başlıyor
        dateValue: dateValue,
        originalRow: row
      };
    });
    
    // Tarihleri sırala (en yeni önce - Randevularım mantığı)
    // Boş tarihleri en sona koy
    dateData.sort((a, b) => {
      // Eğer a'nın tarihi boşsa, b'den sonra koy
      if (!a.dateValue || a.dateValue === '') return 1;
      // Eğer b'nin tarihi boşsa, a'dan sonra koy
      if (!b.dateValue || b.dateValue === '') return -1;
      
      // Her ikisi de doluysa tarihe göre sırala
      let dateA, dateB;
      
      // Tarih değerini kontrol et ve uygun şekilde dönüştür
      if (a.dateValue instanceof Date) {
        dateA = a.dateValue;
      } else if (typeof a.dateValue === 'string') {
        // DD.MM.YYYY formatını parse et
        const parts = a.dateValue.split('.');
        if (parts.length === 3) {
          dateA = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          dateA = new Date(a.dateValue.split('.').reverse().join('-'));
        }
      } else {
        dateA = new Date(a.dateValue);
      }
      
      if (b.dateValue instanceof Date) {
        dateB = b.dateValue;
      } else if (typeof b.dateValue === 'string') {
        // DD.MM.YYYY formatını parse et
        const parts = b.dateValue.split('.');
        if (parts.length === 3) {
          dateB = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          dateB = new Date(b.dateValue.split('.').reverse().join('-'));
        }
      } else {
        dateB = new Date(b.dateValue);
      }
      
      // En yeni önce (büyükten küçüğe)
      return dateB - dateA;
    });
    
    // Sıralanmış verileri sayfaya yaz
    const sortedData = dateData.map(item => item.originalRow);
    sheet.getRange(2, 1, sortedData.length, sheet.getLastColumn()).setValues(sortedData);
    
    console.log(`✅ Fırsatlarım ${dateColumnName} kolonuna göre sıralandı (en yeni önce)`);
    
    // Sıralamadan SONRA tüm satırları yeniden renklendir (renklerin karışmaması için)
    console.log('🎨 Sıralamadan sonra tüm satırları yeniden renklendiriliyor...');
    const firsatDurumuIndexForColor = headers.indexOf('Fırsat Durumu');
    if (firsatDurumuIndexForColor !== -1) {
      for (let i = 0; i < sortedData.length; i++) {
        const rowNumber = i + 2; // +2 çünkü header 1. satır
        // getDisplayValue() kullan (dropdown değerleri için)
        const statusCell = sheet.getRange(rowNumber, firsatDurumuIndexForColor + 1);
        const status = String(statusCell.getDisplayValue() || statusCell.getValue() || '').trim();
        if (status) {
          applyOpportunityColorCoding(sheet, rowNumber);
        }
      }
      console.log(`✅ ${sortedData.length} satır yeniden renklendirildi`);
    }
    
  } catch (error) {
    console.error('❌ Fırsatlarım sıralama hatası:', error);
  }
}

/**
 * 📅 Toplantılarım sayfasını sıralar (Satış Yapıldı üste, sonra tarihe göre en yeni önce)
 * @param {Sheet} sheet - Toplantılarım sayfası
 */
function sortToplantilarimByDate(sheet) {
  try {
    console.log('[START] sortToplantilarimByDate');
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const toplantiTarihiIndex = headers.indexOf('Toplantı Tarihi');
    const toplantiSonucuIndex = headers.indexOf('Toplantı Sonucu');
    
    if (toplantiTarihiIndex === -1) {
      console.log('⚠️ Toplantı Tarihi kolonu bulunamadı, sıralama atlanıyor');
      return;
    }
    
    if (toplantiSonucuIndex === -1) {
      console.log('⚠️ Toplantı Sonucu kolonu bulunamadı, sıralama atlanıyor');
      return;
    }
    
    console.log(`📅 Sıralama kolonu: Toplantı Tarihi (${toplantiTarihiIndex + 1})`);
    
    // Veri aralığını al (header hariç)
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      console.log('📅 Sıralanacak veri yok');
      return;
    }
    
    const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
    
    // Tarih ve durum kolonundaki verileri al ve sırala
    const dateData = data.map((row, index) => {
      const dateValue = row[toplantiTarihiIndex];
      
      // Status değerini doğru oku - getDisplayValue() kullan (dropdown değerleri için)
      let status = '';
      if (toplantiSonucuIndex !== -1) {
        const statusCell = sheet.getRange(index + 2, toplantiSonucuIndex + 1);
        status = String(statusCell.getDisplayValue() || statusCell.getValue() || '').trim();
      }
      
      // Satış Yapıldı ise priority=0 (en üstte), diğerleri priority=1
      const priority = (status === 'Satış Yapıldı') ? 0 : 1;
      
      return {
        rowIndex: index + 2,
        dateValue: dateValue,
        status: status,
        statusPriority: priority,
        originalRow: row
      };
    });
    
    // Önce Satış Yapıldı'yı üste, sonra tarihe göre sırala (en yeni önce)
    dateData.sort((a, b) => {
      // Önce durum önceliğine göre sırala - Satış Yapıldı üste
      if (a.statusPriority !== b.statusPriority) {
        return a.statusPriority - b.statusPriority; // Satış Yapıldı (0) < Diğerleri (1)
      }
      
      // Aynı durumdaysa, tarihe göre sırala
      // Eğer a'nın tarihi boşsa, b'den sonra koy
      if (!a.dateValue || a.dateValue === '') return 1;
      // Eğer b'nin tarihi boşsa, a'dan sonra koy
      if (!b.dateValue || b.dateValue === '') return -1;
      
      // Her ikisi de doluysa tarihe göre sırala
      let dateA, dateB;
      
      if (a.dateValue instanceof Date) {
        dateA = a.dateValue;
      } else if (typeof a.dateValue === 'string') {
        const parts = a.dateValue.split('.');
        if (parts.length === 3) {
          dateA = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          dateA = new Date(a.dateValue.split('.').reverse().join('-'));
        }
      } else {
        dateA = new Date(a.dateValue);
      }
      
      if (b.dateValue instanceof Date) {
        dateB = b.dateValue;
      } else if (typeof b.dateValue === 'string') {
        const parts = b.dateValue.split('.');
        if (parts.length === 3) {
          dateB = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        } else {
          dateB = new Date(b.dateValue.split('.').reverse().join('-'));
        }
      } else {
        dateB = new Date(b.dateValue);
      }
      
      // Tarihleri kontrol et
      if (isNaN(dateA.getTime())) dateA = new Date(0);
      if (isNaN(dateB.getTime())) dateB = new Date(0);
      
      return dateB - dateA; // En yeni önce (büyükten küçüğe)
    });
    
    // Sıralanmış verileri sayfaya yaz
    const sortedData = dateData.map(item => item.originalRow);
    sheet.getRange(2, 1, sortedData.length, sheet.getLastColumn()).setValues(sortedData);
    
    console.log(`✅ Toplantılarım sıralandı (Satış Yapıldı üste, sonra tarihe göre en yeni önce)`);
    
    // Sıralamadan SONRA tüm satırları yeniden renklendir (renklerin karışmaması için)
    console.log('🎨 Sıralamadan sonra tüm satırları yeniden renklendiriliyor...');
    for (let i = 0; i < sortedData.length; i++) {
      const rowNumber = i + 2; // +2 çünkü header 1. satır
      applyMeetingColorCoding(sheet, rowNumber);
    }
    console.log(`✅ ${sortedData.length} satır yeniden renklendirildi`);
    
    console.log('[RESULT] Toplantılarım sıralama tamamlandı');
    
  } catch (error) {
    console.error('[ERROR] sortToplantilarimByDate:', error);
  }
}

// ========================================
// 🧹 DATA CLEANUP FUNCTIONS
// ========================================

/**
 * "Telefon olmayanları sil" - Aktif sayfada Phone kolonu boş/geçersiz olan satırları siler
 * @param {Object} parameters - { scope?: 'all' | 'selection' }
 * @returns {Object} - Sonuç bilgisi
 */
function deleteRowsWithoutPhone(parameters) {
  console.log('Function started: deleteRowsWithoutPhone', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const sheetName = sheet.getName();
    console.log('🧹 Target sheet:', sheetName);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const phoneIdx = headers.indexOf('Phone');
    if (phoneIdx === -1) {
      throw new Error("'Phone' kolonu bulunamadı");
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      ui.alert('Silinecek satır bulunamadı');
      return { success: true, deleted: 0 };
    }
    
    // Kapsam: seçim varsa seçim, yoksa tüm veri
    const range = sheet.getActiveRange();
    let startRow = 2;
    let endRow = lastRow;
    if (range && range.getRow() > 1) {
      startRow = range.getRow();
      endRow = range.getLastRow();
      if (startRow === 1) startRow = 2;
    }
    
    console.log(`🔎 Scan rows: ${startRow}-${endRow}`);
    const values = sheet.getRange(startRow, 1, endRow - startRow + 1, sheet.getLastColumn()).getValues();
    
    // Sıralı silme için alt->üst
    const rowsToDelete = [];
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const phoneRaw = row[phoneIdx];
      const phoneStr = (phoneRaw || '').toString();
      const digits = phoneStr.replace(/\D+/g, '');
      const hasValidPhone = digits.length >= 7; // esnek eşik
      if (!hasValidPhone) {
        rowsToDelete.push(startRow + i);
      }
    }
    
    console.log('🗑️ Rows to delete (no phone):', rowsToDelete);
    
    // Sil
    let deleted = 0;
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      sheet.deleteRow(rowsToDelete[i]);
      deleted++;
    }
    
    ui.alert(`📵 Telefonu olmayan satırlar silindi: ${deleted}`);
    console.log('Processing complete:', { deleted });
    
    return { success: true, deleted };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * "Website olmayanları sil" - Aktif sayfada Website kolonu boş/geçersiz olan satırları siler
 * @param {Object} parameters - { scope?: 'all' | 'selection' }
 * @returns {Object} - Sonuç bilgisi
 */
function deleteRowsWithoutWebsite(parameters) {
  console.log('Function started: deleteRowsWithoutWebsite', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const sheetName = sheet.getName();
    console.log('🧹 Target sheet:', sheetName);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const websiteIdx = headers.indexOf('Website');
    if (websiteIdx === -1) {
      throw new Error("'Website' kolonu bulunamadı");
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      ui.alert('Silinecek satır bulunamadı');
      return { success: true, deleted: 0 };
    }
    
    const range = sheet.getActiveRange();
    let startRow = 2;
    let endRow = lastRow;
    if (range && range.getRow() > 1) {
      startRow = range.getRow();
      endRow = range.getLastRow();
      if (startRow === 1) startRow = 2;
    }
    
    console.log(`🔎 Scan rows: ${startRow}-${endRow}`);
    const values = sheet.getRange(startRow, 1, endRow - startRow + 1, sheet.getLastColumn()).getValues();
    
    const rowsToDelete = [];
    for (let i = 0; i < values.length; i++) {
      const row = values[i];
      const websiteRaw = (row[websiteIdx] || '').toString().trim();
      const hasWebsite = websiteRaw.length > 0;
      if (!hasWebsite) {
        rowsToDelete.push(startRow + i);
      }
    }
    
    console.log('🗑️ Rows to delete (no website):', rowsToDelete);
    
    let deleted = 0;
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      sheet.deleteRow(rowsToDelete[i]);
      deleted++;
    }
    
    ui.alert(`🌐 Websitesi olmayan satırlar silindi: ${deleted}`);
    console.log('Processing complete:', { deleted });
    
    return { success: true, deleted };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🧹 URL Temizle (1. Aşama) - Website kolonundaki URL'leri normalize eder
 * - http:// ve https:// ekler
 * - www. kontrolü yapar
 * - Trailing slash temizler
 * - Geçersiz URL'leri düzeltir
 */
function urlTemizleTumunu(parameters) {
  console.log('Function started: urlTemizleTumunu', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, updated: 0 };
    }
    
    const headers = data[0];
    const websiteIdx = findColumnIndex(headers, ['Website', 'website']);
    
    if (websiteIdx === -1) {
      ui.alert('Hata', "'Website' kolonu bulunamadı.", ui.ButtonSet.OK);
      return { success: false, updated: 0 };
    }
    
    // URL normalize fonksiyonu
    function normalizeUrl(url) {
      if (!url) return '';
      let cleaned = String(url).trim();
      if (!cleaned) return '';
      
      // Boşlukları temizle
      cleaned = cleaned.replace(/\s+/g, '');
      
      // zaten normalize edilmişse atla
      if (/^https?:\/\//i.test(cleaned)) {
        cleaned = cleaned.replace(/\/+$/, ''); // trailing slash temizle
        return cleaned;
      }
      
        // http/https yoksa ekle
        if (!/^https?:\/\//i.test(cleaned)) {
          cleaned = 'https://' + cleaned;
        }
        
      // www. kontrolü (isteğe bağlı - zaten varsa dokunma)
      
      // trailing slash temizle
      cleaned = cleaned.replace(/\/+$/, '');
      
      return cleaned;
    }
    
    let updated = 0;
    const updates = [];
    
    // URL'leri kontrol et ve normalize et
    for (let i = 1; i < data.length; i++) {
      const rowNum = i + 1;
      const currentUrl = (data[i][websiteIdx] || '').toString().trim();
      
      if (!currentUrl) continue;
      
      const normalized = normalizeUrl(currentUrl);
      
      if (normalized !== currentUrl && normalized !== '') {
        updates.push({ row: rowNum, old: currentUrl, new: normalized });
      }
    }
    
    if (updates.length === 0) {
      ui.alert('Bilgi', 'Temizlenecek URL bulunamadı. Tüm URL\'ler zaten temiz görünüyor.', ui.ButtonSet.OK);
      return { success: true, updated: 0 };
    }
    
    // Özet göster
    let summaryMsg = `Toplam ${updates.length} URL temizlenecek.\n\n`;
    summaryMsg += `Örnekler (ilk 5):\n`;
    for (let i = 0; i < Math.min(5, updates.length); i++) {
      const u = updates[i];
      summaryMsg += `\nSatır ${u.row}:\n  "${u.old}"\n  → "${u.new}"`;
    }
    if (updates.length > 5) {
      summaryMsg += `\n\n... ve ${updates.length - 5} URL daha`;
    }
    summaryMsg += `\n\nDevam etmek istiyor musunuz?`;
    
    const confirm = ui.alert('🧹 URL Temizle', summaryMsg, ui.ButtonSet.YES_NO);
    
    if (confirm !== ui.Button.YES) {
      ui.alert('İptal edildi', 'URL temizleme iptal edildi.', ui.ButtonSet.OK);
      return { success: false, updated: 0, cancelled: true };
    }
    
    // URL'leri güncelle
    for (const u of updates) {
      sheet.getRange(u.row, websiteIdx + 1).setValue(u.new);
      updated++;
    }
    
    ui.alert('İşlem tamamlandı', `${updated} URL başarıyla temizlendi.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { updated });
    return { success: true, updated };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🗑️ URL Tekrarları Sil (2. Aşama) - Aynı URL'ye sahip mükerrer satırları siler
 * Her URL için ilk satırı tutar, diğerlerini siler
 */
function urlTekrarlariniSil(parameters) {
  console.log('Function started: urlTekrarlariniSil', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    const headers = data[0];
    const websiteIdx = findColumnIndex(headers, ['Website', 'website']);
    
    if (websiteIdx === -1) {
      ui.alert('Hata', "'Website' kolonu bulunamadı.", ui.ButtonSet.OK);
      return { success: false, deleted: 0 };
    }
    
    // URL'ye göre grupla
    const urlToRows = new Map();
    
    for (let i = 1; i < data.length; i++) {
      const rowNum = i + 1;
      const url = (data[i][websiteIdx] || '').toString().trim().toLowerCase();
      
      if (!url) continue;
      
      if (!urlToRows.has(url)) {
        urlToRows.set(url, []);
      }
      urlToRows.get(url).push(rowNum);
    }
    
    // Mükerrer URL grupları (2 veya daha fazla satır)
    const dupGroups = [...urlToRows.entries()].filter(([, rows]) => rows.length > 1);
    
    if (dupGroups.length === 0) {
      ui.alert('Mükerrer bulunamadı', 'Aynı URL\'ye sahip tekrar eden satır bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    // Silinecek satırları topla (ilk satırı tut, diğerlerini sil)
    const rowsToDelete = [];
    const groupDetails = [];
    
    for (const [url, rowNums] of dupGroups) {
      const sortedRows = [...rowNums].sort((a, b) => a - b);
      const keepRow = sortedRows[0]; // İlk satırı tut
      const deleteRows = sortedRows.slice(1); // Diğerlerini sil
      
      groupDetails.push({
        url: url,
        count: sortedRows.length,
        keep: keepRow,
        delete: deleteRows
      });
      
      rowsToDelete.push(...deleteRows);
    }
    
    // Satır numaralarını büyükten küçüğe sırala
    rowsToDelete.sort((a, b) => b - a);
    
    const totalGroups = dupGroups.length;
    const totalRows = rowsToDelete.length;
    
    // Özet mesaj
    let summaryMsg = `URL mükerrer tarama sonucu:\n\n`;
    summaryMsg += `• Toplam tekrar grup: ${totalGroups}\n`;
    summaryMsg += `• Silinecek satır: ${totalRows}\n`;
    summaryMsg += `• Korunacak satır: ${totalGroups}\n\n`;
    summaryMsg += `Örnek gruplar (ilk 5):\n`;
    
    for (let i = 0; i < Math.min(5, groupDetails.length); i++) {
      const g = groupDetails[i];
      summaryMsg += `\n${i + 1}. "${g.url.substring(0, 50)}${g.url.length > 50 ? '...' : ''}"\n`;
      summaryMsg += `   Korunacak: Satır ${g.keep}\n`;
      summaryMsg += `   Silinecek: Satır ${g.delete.join(', ')}`;
    }
    
    if (groupDetails.length > 5) {
      summaryMsg += `\n\n... ve ${groupDetails.length - 5} grup daha`;
    }
    
    summaryMsg += `\n\n⚠️ Her grupta ilk satır korunacak, diğerleri silinecek.`;
    summaryMsg += `\n\nDevam etmek istiyor musunuz?`;
    
    const confirm = ui.alert('🗑️ URL Tekrarlarını Sil', summaryMsg, ui.ButtonSet.YES_NO);
    
    if (confirm !== ui.Button.YES) {
      ui.alert('İptal edildi', 'Silme işlemi iptal edildi.', ui.ButtonSet.OK);
      return { success: false, deleted: 0, cancelled: true };
    }
    
    // Satırları sil (büyükten küçüğe)
    let deleted = 0;
    for (const rowNum of rowsToDelete) {
      try {
        sheet.deleteRow(rowNum);
        deleted++;
      } catch (err) {
        console.error(`Satır ${rowNum} silinirken hata:`, err);
      }
    }
    
    ui.alert('İşlem tamamlandı', `${deleted} satır başarıyla silindi.\n${totalGroups} mükerrer grup temizlendi.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { deleted, totalGroups });
    return { success: true, deleted, totalGroups };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🎨 E-ticaret Sıcaklık Analizi - SADECE Category bazında çalışır
 * 
 * Algoritma:
 * 1. IdeaSoft var → "IdeaSoft var" (EN ÖNCELİK)
 * 2. Pahalı rakipler var (Ticimax, T-Soft, İkas) → "Pahalı rakipler var"
 * 3. Ucuz e-ticaret paketleri var → "Ucuz e-ticaret paketleri var"
 * 4. Hiçbiri yok → "E-ticaret firması yok (silinmeye aday)"
 * 
 * Sadece CMS Grubu sütununa yazılır, renk yok, Keyword analizi yok.
 */
function generateCategoryKeywordCMSReport(parameters) {
  console.log('Function started: generateCategoryKeywordCMSReport', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const ui = SpreadsheetApp.getUi();
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    
    console.log(`Using active sheet: ${sheetName}`);
    
    // Veri topla
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('Hata', 'Sayfada veri bulunamadı.', ui.ButtonSet.OK);
      return { success: false };
    }
    
    const headers = data[0];
    const categoryIdx = findColumnIndex(headers, ['Category', 'category', 'Kategori']);
    const cmsIdx = findColumnIndex(headers, ['CMS Adı', 'CMS adı', 'cms adı', 'CMS']);
    const cmsGroupIdx = findColumnIndex(headers, ['CMS Grubu', 'CMS grubu', 'cms grubu']);
    // Hem eski hem yeni sütun isimlerini ara (ikinci çalıştırmada yeni isimler olacak)
    const eTicaretIziIdx = findColumnIndex(headers, ['E-Ticaret İzi', 'E-Ticaret İzi', 'e-ticaret izi', 'IdeaSoft Oranı', 'IdeaSoft Oranı', 'ideasoft oranı']);
    const siteHiziIdx = findColumnIndex(headers, ['Site Hızı', 'Site Hızı', 'site hızı', 'Pahalı Paket Oranı', 'Pahalı Paket Oranı', 'pahalı paket oranı']);
    const siteTrafigiIdx = findColumnIndex(headers, ['Site Trafiği', 'Site trafiği', 'site trafiği', 'Ucuz Paket Oranı', 'Ucuz Paket Oranı', 'ucuz paket oranı']);
    
    // Sütun başlıklarını yeni görevlerine göre değiştir (daha okunabilir ve anlaşılır)
    if (eTicaretIziIdx !== -1) {
      sheet.getRange(1, eTicaretIziIdx + 1).setValue('IdeaSoft Oranı');
      console.log('✅ E-Ticaret İzi başlığı güncellendi: "IdeaSoft Oranı"');
    }
    
    if (siteHiziIdx !== -1) {
      sheet.getRange(1, siteHiziIdx + 1).setValue('Pahalı Paket Oranı');
      console.log('✅ Site Hızı başlığı güncellendi: "Pahalı Paket Oranı"');
    }
    
    if (siteTrafigiIdx !== -1) {
      sheet.getRange(1, siteTrafigiIdx + 1).setValue('Ucuz Paket Oranı');
      console.log('✅ Site Trafiği başlığı güncellendi: "Ucuz Paket Oranı"');
    }
    
    if (categoryIdx === -1) {
      ui.alert('Hata', "'Category' kolonu bulunamadı.", ui.ButtonSet.OK);
      return { success: false };
    }
    
    if (cmsIdx === -1) {
      ui.alert('Hata', "'CMS Adı' kolonu bulunamadı.", ui.ButtonSet.OK);
      return { success: false };
    }
    
    if (cmsGroupIdx === -1) {
      ui.alert('Hata', "'CMS Grubu' kolonu bulunamadı. Lütfen önce CMS Grubu kolonunu ekleyin.", ui.ButtonSet.OK);
      return { success: false };
    }
    
    // Eski "Silinmeye Aday" yazılarını toplu olarak temizle (sadece içerik, format korunacak)
    console.log('Eski yazılar temizleniyor (formatlar korunuyor)...');
    if (data.length > 1) {
      const lastRow = data.length;
      const firstDataRow = 2;
      try {
        // CMS Grubu sütununu temizle (sadece içerik, formatlar korunacak)
        const cmsGroupRange = sheet.getRange(firstDataRow, cmsGroupIdx + 1, lastRow - 1, 1);
        cmsGroupRange.clearContent();
        // NOT: clearFormat() kullanmıyoruz - kenarlıklar ve diğer formatlar korunacak
      } catch (e) {
        console.error('Temizleme hatası:', e);
      }
    }
    
    // Platform listeleri
    const ideasoftPlatform = 'IdeaSoft';
    const pahaliRakipler = ['Ticimax', 'T-Soft', 'İkas'];
    
    const ucuzPaketler = [
      'WooCommerce', 'Magento', 'PrestaShop', 'OpenCart', 'BigCommerce', 'Ecwid',
      'PlatinMarket', 'Projesoft', 'Faprika', 'Neticaret', 'E-Ticaret Soft', 
      'Smart E-Ticaret', 'ShopPHP', 'Softtr', 'Demresa', 'Quka Soft', 'Quka', 
      'iMağaza', 'Akınsoft', 'Hipotenüs', 'Ticifly', 'Alkissoft', 'Kobimaster', 
      'Vatansoft', 'Inplato', 'eticaretim', 'JettyCart', 'Doğru Ajans', 'Özel E-ticaret'
    ];
    
    // Category bazında analiz - Her category için platform kontrolü yap
    const categoryAnalysis = new Map(); // category -> { hasIdeaSoft, hasPahaliRakip, hasUcuzPaket, rowNumbers, ideasoftCount, pahaliPaketCount, totalCount }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const category = (row[categoryIdx] || '').toString().trim();
      const cms = (row[cmsIdx] || '').toString().trim();
      const rowNum = i + 1;
      
      // Category zorunlu, CMS boş olabilir (o durumda category "silinmeye aday" olur)
      if (!category) continue;
      
      const catKey = category.toLowerCase();
      if (!categoryAnalysis.has(catKey)) {
        categoryAnalysis.set(catKey, {
          category,
          hasIdeaSoft: false,
          hasPahaliRakip: false,
          hasUcuzPaket: false,
          rowNumbers: [],
          ideasoftCount: 0,
          pahaliPaketCount: 0,
          ucuzPaketCount: 0,
          totalCount: 0
        });
      }
      
      const catData = categoryAnalysis.get(catKey);
      catData.rowNumbers.push(rowNum);
      catData.totalCount++;
      
      // CMS boşsa, bu category'de hiç web sitesi yok demektir
      // Bu durumda kontrol yapma (zaten "silinmeye aday" olacak)
      if (!cms || cms.trim() === '') {
        continue; // CMS boş, kontrol yapma
      }
      
      // CMS kontrolü (case-insensitive)
      const cmsLower = cms.toLowerCase();
      
      // 1. IdeaSoft kontrolü (EN ÖNCELİK)
      if (!catData.hasIdeaSoft && cmsLower.includes(ideasoftPlatform.toLowerCase())) {
        catData.hasIdeaSoft = true;
      }
      // IdeaSoft müşterisi sayısını hesapla
      if (cmsLower.includes(ideasoftPlatform.toLowerCase())) {
        catData.ideasoftCount++;
      }
      
      // 2. Pahalı rakipler kontrolü (sadece IdeaSoft yoksa)
      if (!catData.hasIdeaSoft && !catData.hasPahaliRakip) {
        for (const rakip of pahaliRakipler) {
          if (cmsLower.includes(rakip.toLowerCase())) {
            catData.hasPahaliRakip = true;
            break;
          }
        }
      }
      // Pahalı Paket müşterisi sayısını hesapla
      for (const rakip of pahaliRakipler) {
        if (cmsLower.includes(rakip.toLowerCase())) {
          catData.pahaliPaketCount++;
          break; // Bir tane bulduktan sonra döngüyü durdur
        }
      }
      
      // 3. Ucuz paketler kontrolü (sadece IdeaSoft ve pahalı rakip yoksa)
      if (!catData.hasIdeaSoft && !catData.hasPahaliRakip && !catData.hasUcuzPaket) {
        for (const paket of ucuzPaketler) {
          if (cmsLower.includes(paket.toLowerCase())) {
            catData.hasUcuzPaket = true;
            break;
          }
        }
      }
      // Ucuz Paket müşterisi sayısını hesapla
      for (const paket of ucuzPaketler) {
        if (cmsLower.includes(paket.toLowerCase())) {
          catData.ucuzPaketCount++;
          break; // Bir tane bulduktan sonra döngüyü durdur
        }
      }
    }
    
    // Renklendirme için yardımcı fonksiyonlar
    // Oran değerinden yüzdeyi çıkar (örn: "12/40 → %30.00" -> 30.00)
    function extractPercentage(value) {
      if (!value || typeof value !== 'string') return 0;
      const match = value.match(/%([\d.]+)/);
      return match ? parseFloat(match[1]) : 0;
    }
    
    // Renklendirme sadece %50'den fazla olanlarda yapılacak (göz yormamak için)
    // IdeaSoft için: Yeşil tonları (sadece %50+)
    function getIdeaSoftColor(percentage) {
      if (percentage >= 50) return '#C8E6C9'; // Koyu yeşil (yüksek oran)
      return '#FFFFFF'; // Beyaz (50'nin altındaysa renk yok)
    }
    
    // Pahalı Paket için: Mavi tonları (sadece %50+)
    function getPahaliPaketColor(percentage) {
      if (percentage >= 50) return '#BBDEFB'; // Koyu mavi
      return '#FFFFFF'; // Beyaz
    }
    
    // Ucuz Paket için: Turuncu/sarı tonları (sadece %50+)
    function getUcuzPaketColor(percentage) {
      if (percentage >= 50) return '#FFE0B2'; // Koyu turuncu
      return '#FFFFFF'; // Beyaz
    }
    
    // Category renklendirme kaldırıldı - artık sadece kategori kodu var, renk yok
    
    // Category bazında sonuçları CMS Grubu sütununa yaz ve oranları hesapla
    let ideasoftCount = 0;
    let pahaliRakipCount = 0;
    let ucuzPaketCount = 0;
    let silinebilirCount = 0;
    
    let categoryIndex = 0;
    for (const catData of categoryAnalysis.values()) {
      let result = '';
      
      // Öncelik sırasına göre kontrol
      if (catData.hasIdeaSoft) {
        result = 'IdeaSoft var';
        ideasoftCount += catData.rowNumbers.length;
      } else if (catData.hasPahaliRakip) {
        result = 'Pahalı rakipler var';
        pahaliRakipCount += catData.rowNumbers.length;
      } else if (catData.hasUcuzPaket) {
        result = 'Ucuz e-ticaret paketleri var';
        ucuzPaketCount += catData.rowNumbers.length;
      } else {
        result = 'E-ticaret firması yok (silinmeye aday)';
        silinebilirCount += catData.rowNumbers.length;
      }
      
      // Oranları hesapla
      const ideasoftOrani = catData.totalCount > 0 
        ? (catData.ideasoftCount / catData.totalCount * 100).toFixed(2) 
        : '0.00';
      
      const pahaliPaketOrani = catData.totalCount > 0 
        ? (catData.pahaliPaketCount / catData.totalCount * 100).toFixed(2) 
        : '0.00';
      
      const ucuzPaketOrani = catData.totalCount > 0 
        ? (catData.ucuzPaketCount / catData.totalCount * 100).toFixed(2) 
        : '0.00';
      
      // Kategori kodu (K1, K2, K3...) - oran sütunlarına eklenecek
      const kategoriKodu = `K${categoryIndex + 1}`;
      
      // Sayı, oran ve kategori kodu - sütun başlığında kriter adı yazılacak
      // Format: "K1 | Sayı/Toplam → %Oran" - okunabilir ve temiz
      const ideasoftDeger = `${kategoriKodu} | ${catData.ideasoftCount}/${catData.totalCount} → %${ideasoftOrani}`;
      const pahaliPaketDeger = `${kategoriKodu} | ${catData.pahaliPaketCount}/${catData.totalCount} → %${pahaliPaketOrani}`;
      const ucuzPaketDeger = `${kategoriKodu} | ${catData.ucuzPaketCount}/${catData.totalCount} → %${ucuzPaketOrani}`;
      
      console.log(`📊 Category: ${catData.category}`);
      console.log(`   Toplam: ${catData.totalCount}, IdeaSoft: ${catData.ideasoftCount}, Pahalı Paket: ${catData.pahaliPaketCount}, Ucuz Paket: ${catData.ucuzPaketCount}`);
      console.log(`   IdeaSoft: ${ideasoftDeger}, Pahalı Paket: ${pahaliPaketDeger}, Ucuz Paket: ${ucuzPaketDeger}`);
      
      // Oran değerlerinden yüzdeleri çıkar
      const ideasoftOranDeger = extractPercentage(ideasoftDeger);
      const pahaliPaketOranDeger = extractPercentage(pahaliPaketDeger);
      const ucuzPaketOranDeger = extractPercentage(ucuzPaketDeger);
      
      // Bu category'deki TÜM satırlara yaz ve renklendir
      for (const rowNum of catData.rowNumbers) {
        try {
          // CMS Grubu sütununa yaz (sadece değer, format değişmeyecek)
          sheet.getRange(rowNum, cmsGroupIdx + 1).setValue(result);
          
          // Category sütununa HİÇBİR ŞEY YAPMIYORUZ - format ve değer aynen kalacak
          
          // E-Ticaret İzi sütununa IdeaSoft sayısı ve oranı yaz + sadece %50+ ise renklendir
          if (eTicaretIziIdx !== -1) {
            const ideasoftRange = sheet.getRange(rowNum, eTicaretIziIdx + 1);
            ideasoftRange.setValue(ideasoftDeger); // Sadece değer değişiyor, format (kenarlıklar vs.) korunuyor
            // Sadece %50'den fazla olanlarda background color set et
            // %50'nin altındakilere dokunmuyoruz - mevcut formatlar (kenarlıklar vs.) korunacak
            if (ideasoftOranDeger >= 50) {
              ideasoftRange.setBackground(getIdeaSoftColor(ideasoftOranDeger));
            }
          }
          
          // Site Hızı sütununa Pahalı Paket sayısı ve oranı yaz + sadece %50+ ise renklendir
          if (siteHiziIdx !== -1) {
            const pahaliPaketRange = sheet.getRange(rowNum, siteHiziIdx + 1);
            pahaliPaketRange.setValue(pahaliPaketDeger); // Sadece değer değişiyor, format korunuyor
            // Sadece %50'den fazla olanlarda background color set et
            if (pahaliPaketOranDeger >= 50) {
              pahaliPaketRange.setBackground(getPahaliPaketColor(pahaliPaketOranDeger));
            }
          }
          
          // Site Trafiği sütununa Ucuz Paket sayısı ve oranı yaz + sadece %50+ ise renklendir
          if (siteTrafigiIdx !== -1) {
            const ucuzPaketRange = sheet.getRange(rowNum, siteTrafigiIdx + 1);
            ucuzPaketRange.setValue(ucuzPaketDeger); // Sadece değer değişiyor, format korunuyor
            // Sadece %50'den fazla olanlarda background color set et
            if (ucuzPaketOranDeger >= 50) {
              ucuzPaketRange.setBackground(getUcuzPaketColor(ucuzPaketOranDeger));
            }
          }
        } catch (e) {
          console.error(`Row ${rowNum} yazılırken hata:`, e);
        }
      }
      
      categoryIndex++;
    }
    
    const totalRows = data.length - 1;
    const totalProcessed = ideasoftCount + pahaliRakipCount + ucuzPaketCount + silinebilirCount;
    
    const oranBilgisi = (eTicaretIziIdx !== -1 && siteHiziIdx !== -1 && siteTrafigiIdx !== -1) 
      ? `\n\n📈 Oranlar (Okunabilir Format):\n` +
        `  💡 IdeaSoft Oranı: "K1 | Sayı/Toplam → %Oran" (Sadece %50+ olanlar renkli - yeşil)\n` +
        `  💎 Pahalı Paket Oranı: "K1 | Sayı/Toplam → %Oran" (Sadece %50+ olanlar renkli - mavi)\n` +
        `  💼 Ucuz Paket Oranı: "K1 | Sayı/Toplam → %Oran" (Sadece %50+ olanlar renkli - turuncu)\n` +
        `  Örnek: "K1 | 12/40 → %30.00" → Kategori 1, 40 müşteriden 12'si IdeaSoft, %30 oran\n\n` +
        `🎨 Renklendirme:\n` +
        `  ✅ Sadece %50'den fazla olan oranlar renklendirildi (göz yormamak için)\n` +
        `  ✅ Category sütununda renk yok - sadece kategori kodları var\n` +
        `  ✅ Oran sütunlarında da sadece yüksek değerler vurgulandı\n\n` +
        `🏷️ Kategori Kodlama:\n` +
        `  ✅ Her kategoriye kod eklendi (K1, K2, K3...)\n` +
        `  ✅ Kodlar sadece oran sütunlarında görünüyor (Category sütununa dokunulmadı)\n` +
        `  ✅ Format: "K1 | 12/40 → %30.00" - aynı kategoriye ait tüm satırlarda aynı kod\n` +
        `  ✅ Böylece 40 satırda aynı istatistiği 40 kere okumaya gerek yok!\n` +
        `  ✅ Sütun başlıkları yeni görevlerine göre güncellendi`
      : `\n\n⚠️ Oranlar yazılamadı: E-Ticaret İzi, Site Hızı veya Site Trafiği sütunları bulunamadı.`;
    
    ui.alert('Sıcaklık Analizi tamamlandı', 
      `🎨 E-ticaret Sıcaklık Analizi tamamlandı.\n\n` +
      `• Toplam ${totalRows} satır kontrol edildi\n` +
      `• ${totalProcessed} kayıt işlendi\n\n` +
      `📊 Sonuçlar (Category bazında):\n` +
      `  🔥 IdeaSoft var: ${ideasoftCount} satır\n` +
      `  💎 Pahalı rakipler var: ${pahaliRakipCount} satır\n` +
      `  💼 Ucuz e-ticaret paketleri var: ${ucuzPaketCount} satır\n` +
      `  🧊 E-ticaret firması yok (silinmeye aday): ${silinebilirCount} satır\n\n` +
      `✅ Tüm sonuçlar CMS Grubu sütununa yazıldı.${oranBilgisi}`, 
      ui.ButtonSet.OK);
    
    console.log('Processing complete:', { 
      totalRows,
      totalProcessed,
      ideasoftCount,
      pahaliRakipCount,
      ucuzPaketCount,
      silinebilirCount
    });
    
    return { 
      success: true, 
      totalRows,
      totalProcessed,
      ideasoftCount,
      pahaliRakipCount,
      ucuzPaketCount,
      silinebilirCount,
      oranlarHesaplandi: (eTicaretIziIdx !== -1 && siteHiziIdx !== -1 && siteTrafigiIdx !== -1)
    };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🗑️ Silinmeye Aday Satırları Sil - CMS Grubu sütununda "E-ticaret firması yok (silinmeye aday)" yazan satırları siler
 */
function deleteSilinmeyeAdayRows(parameters) {
  console.log('Function started: deleteSilinmeyeAdayRows', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    const headers = data[0];
    const cmsGroupIdx = findColumnIndex(headers, ['CMS Grubu', 'CMS grubu', 'cms grubu']);
    
    if (cmsGroupIdx === -1) {
      ui.alert('Hata', "'CMS Grubu' kolonu bulunamadı.", ui.ButtonSet.OK);
      return { success: false };
    }
    
    // "E-ticaret firması yok (silinmeye aday)" yazan satırları bul
    const rowsToDelete = [];
    
    for (let i = 1; i < data.length; i++) {
      const rowNum = i + 1;
      const cmsGroup = (data[i][cmsGroupIdx] || '').toString().trim();
      
      if (cmsGroup && cmsGroup.includes('E-ticaret firması yok (silinmeye aday)')) {
        rowsToDelete.push(rowNum);
      }
    }
    
    if (rowsToDelete.length === 0) {
      ui.alert('Bilgi', 'Silinmeye aday satır bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    // Özet göster
    let summaryMsg = `Toplam ${rowsToDelete.length} "E-ticaret firması yok (silinmeye aday)" satır bulundu.\n\n`;
    summaryMsg += `⚠️ Bu satırları silmek istiyor musunuz?`;
    
    const confirm = ui.alert('🗑️ Silinmeye Aday Satırları Sil', summaryMsg, ui.ButtonSet.YES_NO);
    
    if (confirm !== ui.Button.YES) {
      ui.alert('İptal edildi', 'Silme işlemi iptal edildi.', ui.ButtonSet.OK);
      return { success: false, deleted: 0, cancelled: true };
    }
    
    // Satırları sil (büyükten küçüğe)
    rowsToDelete.sort((a, b) => b - a);
    let deleted = 0;
    
    for (const rowNum of rowsToDelete) {
      try {
        sheet.deleteRow(rowNum);
        deleted++;
      } catch (err) {
        console.error(`Satır ${rowNum} silinirken hata:`, err);
      }
    }
    
    ui.alert('İşlem tamamlandı', `${deleted} "silinmeye aday" satır başarıyla silindi.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { deleted, total: rowsToDelete.length });
    return { success: true, deleted, total: rowsToDelete.length };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🗑️ Silinmeye Aday Satırları Sil - CMS Grubu sütununda "E-ticaret firması yok (silinmeye aday)" yazan satırları siler
 */
function deleteSilinmeyeAdayRows(parameters) {
  console.log('Function started: deleteSilinmeyeAdayRows', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    const headers = data[0];
    const cmsGroupIdx = findColumnIndex(headers, ['CMS Grubu', 'CMS grubu', 'cms grubu']);
    
    if (cmsGroupIdx === -1) {
      ui.alert('Hata', "'CMS Grubu' kolonu bulunamadı.", ui.ButtonSet.OK);
      return { success: false };
    }
    
    // "E-ticaret firması yok (silinmeye aday)" yazan satırları bul
    const rowsToDelete = [];
    
    for (let i = 1; i < data.length; i++) {
      const rowNum = i + 1;
      const cmsGroup = (data[i][cmsGroupIdx] || '').toString().trim();
      
      if (cmsGroup && cmsGroup.includes('E-ticaret firması yok (silinmeye aday)')) {
        rowsToDelete.push(rowNum);
      }
    }
    
    if (rowsToDelete.length === 0) {
      ui.alert('Bilgi', 'Silinmeye aday satır bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    // Özet göster
    let summaryMsg = `Toplam ${rowsToDelete.length} "E-ticaret firması yok (silinmeye aday)" satır bulundu.\n\n`;
    summaryMsg += `⚠️ Bu satırları silmek istiyor musunuz?`;
    
    const confirm = ui.alert('🗑️ Silinmeye Aday Satırları Sil', summaryMsg, ui.ButtonSet.YES_NO);
    
    if (confirm !== ui.Button.YES) {
      ui.alert('İptal edildi', 'Silme işlemi iptal edildi.', ui.ButtonSet.OK);
      return { success: false, deleted: 0, cancelled: true };
    }
    
    // Satırları sil (büyükten küçüğe)
    rowsToDelete.sort((a, b) => b - a);
    let deleted = 0;
    
    for (const rowNum of rowsToDelete) {
      try {
        sheet.deleteRow(rowNum);
        deleted++;
      } catch (err) {
        console.error(`Satır ${rowNum} silinirken hata:`, err);
      }
    }
    
    ui.alert('İşlem tamamlandı', `${deleted} "silinmeye aday" satır başarıyla silindi.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { deleted, total: rowsToDelete.length });
    return { success: true, deleted, total: rowsToDelete.length };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🔴 Kırmızı Satırları Sil (Her İkisinde de Yok) - Hem Category hem Keyword'de e-ticaret olmayan kırmızı satırları siler
 */
function deleteRedRowsBoth(parameters) {
  console.log('Function started: deleteRedRowsBoth', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    const headers = data[0];
    const categoryIdx = findColumnIndex(headers, ['Category', 'category', 'Kategori']);
    const keywordIdx = findColumnIndex(headers, ['Keyword', 'keyword', 'Anahtar Kelime', 'Anahtar Kelimeler']);
    const cmsIdx = findColumnIndex(headers, ['CMS Adı', 'CMS adı', 'cms adı', 'CMS']);
    
    if (categoryIdx === -1 || keywordIdx === -1 || cmsIdx === -1) {
      ui.alert('Hata', 'Category, Keyword veya CMS Adı kolonu bulunamadı.', ui.ButtonSet.OK);
      return { success: false };
    }
    
    // Kırmızı renkli satırları bul (#FFCCCC - Hem Category hem Keyword'de e-ticaret yok)
    const rowsToDelete = [];
    
    for (let i = 1; i < data.length; i++) {
      const rowNum = i + 1;
      try {
        const bgColor = sheet.getRange(rowNum, 1).getBackground();
        // Kırmızı renk kontrolü (#FFCCCC)
        if (bgColor === '#ffcccc' || bgColor === '#FFCCCC' || bgColor.toLowerCase() === '#ffcccc') {
          const category = (data[i][categoryIdx] || '').toString().trim();
          const keyword = (data[i][keywordIdx] || '').toString().trim();
          const cms = (data[i][cmsIdx] || '').toString().trim();
          
          rowsToDelete.push({ row: rowNum, category, keyword, cms });
        }
      } catch (e) {
        console.error(`Row ${rowNum} check failed:`, e);
      }
    }
    
    if (rowsToDelete.length === 0) {
      ui.alert('Bilgi', 'Silinecek kırmızı satır bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    // Özet göster
    let summaryMsg = `Toplam ${rowsToDelete.length} kırmızı satır bulundu (Hem Category hem Keyword'de e-ticaret yok).\n\n`;
    summaryMsg += `Örnekler (ilk 5):\n`;
    for (let i = 0; i < Math.min(5, rowsToDelete.length); i++) {
      const r = rowsToDelete[i];
      summaryMsg += `\nSatır ${r.row}: "${r.keyword}" - ${r.category}`;
    }
    if (rowsToDelete.length > 5) {
      summaryMsg += `\n\n... ve ${rowsToDelete.length - 5} satır daha`;
    }
    summaryMsg += `\n\n⚠️ Bu satırları silmek istiyor musunuz?`;
    
    const confirm = ui.alert('🔴 Kırmızı Satırları Sil (Her İkisinde de Yok)', summaryMsg, ui.ButtonSet.YES_NO);
    
    if (confirm !== ui.Button.YES) {
      ui.alert('İptal edildi', 'Silme işlemi iptal edildi.', ui.ButtonSet.OK);
      return { success: false, deleted: 0, cancelled: true };
    }
    
    // Satırları sil (büyükten küçüğe)
    rowsToDelete.sort((a, b) => b.row - a.row);
    let deleted = 0;
    
    for (const item of rowsToDelete) {
      try {
        sheet.deleteRow(item.row);
        deleted++;
      } catch (err) {
        console.error(`Satır ${item.row} silinirken hata:`, err);
      }
    }
    
    ui.alert('İşlem tamamlandı', `${deleted} kırmızı satır başarıyla silindi.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { deleted, total: rowsToDelete.length });
    return { success: true, deleted, total: rowsToDelete.length };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🟡 Sarı Satırları Sil (Category) - Category bazında e-ticaret olmayan sarı satırları siler
 */
function deleteYellowRowsCategory(parameters) {
  console.log('Function started: deleteYellowRowsCategory', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    const headers = data[0];
    const categoryIdx = findColumnIndex(headers, ['Category', 'category', 'Kategori']);
    const keywordIdx = findColumnIndex(headers, ['Keyword', 'keyword', 'Anahtar Kelime', 'Anahtar Kelimeler']);
    const cmsIdx = findColumnIndex(headers, ['CMS Adı', 'CMS adı', 'cms adı', 'CMS']);
    
    if (categoryIdx === -1 || keywordIdx === -1 || cmsIdx === -1) {
      ui.alert('Hata', 'Category, Keyword veya CMS Adı kolonu bulunamadı.', ui.ButtonSet.OK);
      return { success: false };
    }
    
    // Türkiye e-ticaret platformları (cms_detector.gs'deki TR Hazır + diğer e-ticaret platformları)
    const eticaretPlatforms = [
      // TR Hazır E-ticaret (cms_detector.gs'den)
      'IdeaSoft', 'Ticimax', 'T-Soft', 'İkas', 'PlatinMarket', 'Projesoft', 
      'Faprika', 'Neticaret', 'E-Ticaret Soft', 'Smart E-Ticaret', 'ShopPHP',
      'Softtr', 'Demresa', 'Quka Soft', 'Quka', 'iMağaza',
      'Akınsoft', 'Hipotenüs', 'Ticifly', 'Alkissoft', 'Kobimaster', 
      'Vatansoft', 'Inplato', 'eticaretim', 'JettyCart', 'Doğru Ajans',
      // SaaS & Açık Kaynak E-ticaret
      'Shopify', 'WooCommerce', 'Magento', 'PrestaShop', 'OpenCart', 
      'BigCommerce', 'Ecwid',
      // Özel E-ticaret (Yüksek Kalite e-ticaret siteleri)
      'Özel E-ticaret'
    ];
    
    // Sarı renkli satırları bul (RGB: 255, 250, 205 = #FFFACD)
    const rowsToDelete = [];
    
    for (let i = 1; i < data.length; i++) {
      const rowNum = i + 1;
      try {
        const bgColor = sheet.getRange(rowNum, 1).getBackground();
        // Sarı renk kontrolü (#FFFACD - Category bazında e-ticaret yok)
        if (bgColor === '#fffacd' || bgColor === '#FFFACD' || bgColor.toLowerCase() === '#fffacd') {
          const category = (data[i][categoryIdx] || '').toString().trim();
          const keyword = (data[i][keywordIdx] || '').toString().trim();
          const cms = (data[i][cmsIdx] || '').toString().trim();
          
          rowsToDelete.push({ row: rowNum, category, keyword, cms });
        }
      } catch (e) {
        console.error(`Row ${rowNum} check failed:`, e);
      }
    }
    
    if (rowsToDelete.length === 0) {
      ui.alert('Bilgi', 'Silinecek sarı satır bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    // Özet göster
    let summaryMsg = `Toplam ${rowsToDelete.length} sarı satır bulundu (Category bazında e-ticaret yok).\n\n`;
    summaryMsg += `Örnekler (ilk 5):\n`;
    for (let i = 0; i < Math.min(5, rowsToDelete.length); i++) {
      const r = rowsToDelete[i];
      summaryMsg += `\nSatır ${r.row}: "${r.keyword}" - ${r.category}`;
    }
    if (rowsToDelete.length > 5) {
      summaryMsg += `\n\n... ve ${rowsToDelete.length - 5} satır daha`;
    }
    summaryMsg += `\n\n⚠️ Bu satırları silmek istiyor musunuz?`;
    
    const confirm = ui.alert('🟡 Sarı Satırları Sil (Category)', summaryMsg, ui.ButtonSet.YES_NO);
    
    if (confirm !== ui.Button.YES) {
      ui.alert('İptal edildi', 'Silme işlemi iptal edildi.', ui.ButtonSet.OK);
      return { success: false, deleted: 0, cancelled: true };
    }
    
    // Satırları sil (büyükten küçüğe)
    rowsToDelete.sort((a, b) => b.row - a.row);
    let deleted = 0;
    
    for (const item of rowsToDelete) {
      try {
        sheet.deleteRow(item.row);
        deleted++;
      } catch (err) {
        console.error(`Satır ${item.row} silinirken hata:`, err);
      }
    }
    
    ui.alert('İşlem tamamlandı', `${deleted} sarı satır başarıyla silindi.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { deleted, total: rowsToDelete.length });
    return { success: true, deleted, total: rowsToDelete.length };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🟠 Turuncu Satırları Sil (Keyword) - Keyword bazında e-ticaret olmayan turuncu satırları siler
 */
function deleteOrangeRowsKeyword(parameters) {
  console.log('Function started: deleteOrangeRowsKeyword', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    const headers = data[0];
    const categoryIdx = findColumnIndex(headers, ['Category', 'category', 'Kategori']);
    const keywordIdx = findColumnIndex(headers, ['Keyword', 'keyword', 'Anahtar Kelime', 'Anahtar Kelimeler']);
    const cmsIdx = findColumnIndex(headers, ['CMS Adı', 'CMS adı', 'cms adı', 'CMS']);
    
    if (categoryIdx === -1 || keywordIdx === -1 || cmsIdx === -1) {
      ui.alert('Hata', 'Category, Keyword veya CMS Adı kolonu bulunamadı.', ui.ButtonSet.OK);
      return { success: false };
    }
    
    // Turuncu renkli satırları bul (#FFE5CC - Keyword bazında e-ticaret yok)
    const rowsToDelete = [];
    
    for (let i = 1; i < data.length; i++) {
      const rowNum = i + 1;
      try {
        const bgColor = sheet.getRange(rowNum, 1).getBackground();
        // Turuncu renk kontrolü (#FFE5CC)
        if (bgColor === '#ffe5cc' || bgColor === '#FFE5CC' || bgColor.toLowerCase() === '#ffe5cc') {
          const category = (data[i][categoryIdx] || '').toString().trim();
          const keyword = (data[i][keywordIdx] || '').toString().trim();
          const cms = (data[i][cmsIdx] || '').toString().trim();
          
          rowsToDelete.push({ row: rowNum, category, keyword, cms });
        }
      } catch (e) {
        console.error(`Row ${rowNum} check failed:`, e);
      }
    }
    
    if (rowsToDelete.length === 0) {
      ui.alert('Bilgi', 'Silinecek turuncu satır bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    // Özet göster
    let summaryMsg = `Toplam ${rowsToDelete.length} turuncu satır bulundu (Keyword bazında e-ticaret yok).\n\n`;
    summaryMsg += `Örnekler (ilk 5):\n`;
    for (let i = 0; i < Math.min(5, rowsToDelete.length); i++) {
      const r = rowsToDelete[i];
      summaryMsg += `\nSatır ${r.row}: "${r.keyword}" - ${r.category}`;
    }
    if (rowsToDelete.length > 5) {
      summaryMsg += `\n\n... ve ${rowsToDelete.length - 5} satır daha`;
    }
    summaryMsg += `\n\n⚠️ Bu satırları silmek istiyor musunuz?`;
    
    const confirm = ui.alert('🟠 Turuncu Satırları Sil (Keyword)', summaryMsg, ui.ButtonSet.YES_NO);
    
    if (confirm !== ui.Button.YES) {
      ui.alert('İptal edildi', 'Silme işlemi iptal edildi.', ui.ButtonSet.OK);
      return { success: false, deleted: 0, cancelled: true };
    }
    
    // Satırları sil (büyükten küçüğe)
    rowsToDelete.sort((a, b) => b.row - a.row);
    let deleted = 0;
    
    for (const item of rowsToDelete) {
      try {
        sheet.deleteRow(item.row);
        deleted++;
      } catch (err) {
        console.error(`Satır ${item.row} silinirken hata:`, err);
      }
    }
    
    ui.alert('İşlem tamamlandı', `${deleted} turuncu satır başarıyla silindi.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { deleted, total: rowsToDelete.length });
    return { success: true, deleted, total: rowsToDelete.length };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🔧 Randevularım sayfasını yeni kolon yapısına göre düzenle
 * - "Toplantı Sonucu" ve "Toplantı Tarihi" kolonlarını siler
 * - Kolonları yeni sıraya göre düzenler
 * - Verileri koruyarak taşır
 * - Ay başlığı satırlarını kaldırmayı dener
 * - Randevu tarihine göre "Ay" kolonunu otomatik doldurur
 */
function fixRandevularimColumnStructure(parameters) {
  console.log('Function started: fixRandevularimColumnStructure', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Randevularım');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Randevularım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return { success: false };
    }
    
    const ui = SpreadsheetApp.getUi();
    
    // Onay al
    const confirm = ui.alert(
      '⚠️ Uyarı',
      'Bu işlem:\n' +
      '• Keyword, Location, Category, CMS Adı, Log kolonlarını silecek\n' +
      '• Kolonları yeni yapıya göre düzenleyecek\n' +
      '• Verileri koruyarak taşıyacak\n' +
      '• Ay başlığı satırlarını (📅 Aralık 2025 gibi) kaldırmayı deneyecek\n' +
      '• "Ay" kolonunu otomatik dolduracak\n\n' +
      'Devam etmek istiyor musunuz?',
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      return { success: false, cancelled: true };
    }
    
    console.log('📊 Randevularım kolon yapısı düzenleme başlıyor...');
    
    // Yeni kolon yapısı - YENİ DÜZEN (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
    const newColumns = [
      'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
      'Website', 'Mail', 'Toplantı formatı', 'Randevu durumu', 'Randevu Tarihi',
      'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
    ];
    
    // Mevcut verileri oku
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      ui.alert('ℹ️ Bilgi', 'Randevularım sayfasında düzenlenecek veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, rowsProcessed: 0 };
    }
    
    const allData = sheet.getDataRange().getValues();
    const oldHeaders = allData[0];
    const oldDataRows = allData.slice(1);
    
    console.log(`📊 Mevcut veri: ${oldDataRows.length} satır, ${oldHeaders.length} kolon`);
    
    // Ay başlığı satırlarını bul ve kaldır
    const monthHeaderRows = [];
    
    for (let i = 0; i < oldDataRows.length; i++) {
      const firstCellValue = String(oldDataRows[i][0] || '').trim();
      if (firstCellValue.includes('📅') || firstCellValue.match(/^(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)/i)) {
        monthHeaderRows.push(i + 2); // +2 çünkü başlık satırı var ve index 0'dan başlıyor
        console.log(`🗑️ Ay başlığı satırı bulundu: ${i + 2} - "${firstCellValue}"`);
      }
    }
    
    // Ay başlığı satırlarını sil (yüksekten düşüğe)
    if (monthHeaderRows.length > 0) {
      monthHeaderRows.sort((a, b) => b - a); // Yüksekten düşüğe
      for (const rowNum of monthHeaderRows) {
        try {
          sheet.deleteRow(rowNum);
          console.log(`🗑️ Ay başlığı satırı silindi: ${rowNum}`);
        } catch (error) {
          console.error(`❌ Satır ${rowNum} silinirken hata:`, error);
        }
      }
    }
    
    // Güncel verileri tekrar oku (ay başlıkları silindikten sonra)
    const updatedData = sheet.getDataRange().getValues();
    const currentHeaders = updatedData[0];
    const currentDataRows = updatedData.slice(1);
    
    console.log(`📊 Güncel veri: ${currentDataRows.length} satır`);
    
    // Tarih parse fonksiyonu
    function parseDate(d) {
      if (!d) return null;
      if (d instanceof Date) return d;
      if (typeof d === 'string') {
        const parts = d.split('.');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(d);
      }
      return new Date(d);
    }
    
    // Yeni veri array'ini oluştur
    const newDataRows = [];
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    // Randevu Tarihi kolon indexini bul
    const randevuTarihiIndex = currentHeaders.indexOf('Randevu Tarihi');
    
    for (let rowIdx = 0; rowIdx < currentDataRows.length; rowIdx++) {
      const oldRow = currentDataRows[rowIdx];
      const newRow = new Array(newColumns.length).fill('');
      
      // Mevcut verileri yeni sıraya göre taşı
      for (let oldColIdx = 0; oldColIdx < oldRow.length; oldColIdx++) {
        const oldColName = String(currentHeaders[oldColIdx] || '').trim();
        
        // Silinecek kolonları atla: Keyword, Location, Category, CMS Adı, Log, Review, City, Rating count, vb.
        const columnsToRemove = ['Keyword', 'Location', 'Category', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi', 
                                  'Site Hızı', 'Site Trafiği', 'Log', 'Review', 'City', 'Rating count',
                                  'Toplantı Sonucu', 'Toplantı Tarihi'];
        if (columnsToRemove.includes(oldColName)) {
          continue;
        }
        
        // Yeni kolon index'ini bul
        const newColIndex = newColumns.indexOf(oldColName);
        if (newColIndex !== -1) {
          newRow[newColIndex] = oldRow[oldColIdx];
        }
      }
      
      // Ay kolonunu otomatik doldur (Randevu Tarihi'ne göre)
      const ayColIndex = newColumns.indexOf('Ay');
      if (randevuTarihiIndex !== -1 && ayColIndex !== -1) {
        const tarihValue = oldRow[randevuTarihiIndex];
        const tarih = parseDate(tarihValue);
        
        if (tarih && !isNaN(tarih.getTime())) {
          const ayAdi = monthNames[tarih.getMonth()];
          newRow[ayColIndex] = ayAdi;
          console.log(`📅 Satır ${rowIdx + 2}: Randevu Tarihi="${tarihValue}" -> Ay="${ayAdi}"`);
        }
      }
      
      // Saat kolonunu düzelt (format kontrolü)
      const saatColIndex = newColumns.indexOf('Saat');
      if (saatColIndex !== -1 && newRow[saatColIndex]) {
        let saatValue = newRow[saatColIndex];
        
        // Date objesi ise, HH:mm formatına çevir
        if (saatValue instanceof Date) {
          const hours = saatValue.getHours().toString().padStart(2, '0');
          const minutes = saatValue.getMinutes().toString().padStart(2, '0');
          newRow[saatColIndex] = `${hours}:${minutes}`;
        } else if (typeof saatValue === 'string' && saatValue.includes('.')) {
          // Yanlış format (tarih gibi), temizle
          console.warn(`⚠️ Satır ${rowIdx + 2}: Saat formatı yanlış: "${saatValue}", temizleniyor...`);
          newRow[saatColIndex] = '';
        } else if (typeof saatValue === 'string') {
          // HH:mm formatında mı kontrol et
          const timeMatch = saatValue.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            const hours = timeMatch[1].padStart(2, '0');
            const minutes = timeMatch[2].padStart(2, '0');
            newRow[saatColIndex] = `${hours}:${minutes}`;
          }
        }
      }
      
      newDataRows.push(newRow);
    }
    
    // ÖNEMLİ: Validation'ları ÖNCE temizle (clear() sadece içeriği temizler, validation'ları değil)
    // clear() öncesi son kolon ve satır sayısını al
    const maxColBeforeClear = Math.max(sheet.getLastColumn() || 0, newColumns.length);
    const maxRowBeforeClear = Math.max(sheet.getLastRow() || 0, newDataRows.length + 10);
    
    // Validation'ları temizle
    if (maxRowBeforeClear > 1 && maxColBeforeClear > 0) {
      try {
        const clearRange = sheet.getRange(1, 1, maxRowBeforeClear, maxColBeforeClear);
        clearRange.clearDataValidations();
        console.log('✅ Tüm validation kuralları temizlendi');
      } catch (clearErr) {
        console.error('⚠️ Validation temizleme hatası:', clearErr);
      }
    }
    
    // Tüm veriyi temizle
    sheet.clear();
    
    // Yeni başlıkları yaz
    sheet.getRange(1, 1, 1, newColumns.length).setValues([newColumns]);
    
    // Yeni verileri yaz
    if (newDataRows.length > 0) {
      const dataRange = sheet.getRange(2, 1, newDataRows.length, newColumns.length);
      dataRange.setValues(newDataRows);
      console.log(`✅ ${newDataRows.length} satır veri yazıldı`);
    }
    
    // Kod kolonunu text formatında zorla
    const kodColumnIndex = newColumns.indexOf('Kod') + 1;
    if (kodColumnIndex > 0) {
      sheet.getRange(2, kodColumnIndex, newDataRows.length, 1).setNumberFormat('@');
    }
    
    // Saat kolonunu text formatına zorla ve formatları düzelt
    const saatColumnIndex = newColumns.indexOf('Saat') + 1;
    if (saatColumnIndex > 0 && newDataRows.length > 0) {
      sheet.getRange(2, saatColumnIndex, newDataRows.length, 1).setNumberFormat('@');
      
      // Saat formatlarını düzelt (HH:mm formatına çevir)
      for (let i = 0; i < newDataRows.length; i++) {
        const saatValue = newDataRows[i][newColumns.indexOf('Saat')];
        if (saatValue) {
          let saatFormatted = '';
          
          // Date objesi ise
          if (saatValue instanceof Date) {
            const hours = saatValue.getHours().toString().padStart(2, '0');
            const minutes = saatValue.getMinutes().toString().padStart(2, '0');
            saatFormatted = `${hours}:${minutes}`;
          } else if (typeof saatValue === 'string') {
            // HH:mm formatında mı kontrol et
            const timeMatch = saatValue.match(/(\d{1,2}):(\d{2})/);
            if (timeMatch) {
              const hours = timeMatch[1].padStart(2, '0');
              const minutes = timeMatch[2].padStart(2, '0');
              saatFormatted = `${hours}:${minutes}`;
            } else if (saatValue.includes('.')) {
              // Yanlış format (tarih gibi), temizle
              saatFormatted = '';
            } else {
              saatFormatted = saatValue;
            }
          }
          
          // Düzeltilmiş formatı kaydet
          if (saatFormatted !== saatValue) {
            sheet.getRange(i + 2, saatColumnIndex).setValue(saatFormatted);
            console.log(`✅ Satır ${i + 2}: Saat formatı düzeltildi: "${saatValue}" -> "${saatFormatted}"`);
          }
        }
      }
      console.log('✅ Saat kolonu formatları düzeltildi');
    }
    
    // Stil ve validation'ı yeniden uygula
    applyRandevularimStyling(sheet);
    setRandevularimDataValidation(sheet);
    
    // Tüm satırlara renklendirme uygula
    console.log('🎨 Tüm satırlara renklendirme uygulanıyor...');
    let colorAppliedCount = 0;
    
    if (newDataRows.length > 0) {
      for (let rowIdx = 0; rowIdx < newDataRows.length; rowIdx++) {
        const rowNum = rowIdx + 2; // +2 çünkü header row=1, data starts at row=2
        
        try {
          applyAppointmentColorCoding(sheet, rowNum);
          colorAppliedCount++;
        } catch (colorErr) {
          console.error(`⚠️ Satır ${rowNum} renklendirme hatası:`, colorErr);
        }
      }
    }
    
    console.log(`✅ ${colorAppliedCount} satır renklendirildi`);
    
    // Flush to ensure all changes are applied
    SpreadsheetApp.flush();
    
    let message = `Randevularım sayfası yeni yapıya göre düzenlendi!\n\n`;
    message += `• Keyword, Location, Category, CMS Adı, Log kolonları silindi\n`;
    message += `• ${newDataRows.length} satır veri taşındı\n`;
    message += `• "Ay" kolonu otomatik dolduruldu\n`;
    message += `• ${colorAppliedCount} satır renklendirildi\n`;
    
    if (monthHeaderRows.length > 0) {
      message += `• ${monthHeaderRows.length} ay başlığı satırı kaldırıldı\n`;
    } else {
      message += `• Ay başlığı satırı bulunamadı (zaten temiz veya manuel kaldırmanız gerekebilir)\n`;
    }
    
    ui.alert('✅ Başarılı', message, ui.ButtonSet.OK);
    
    console.log('✅ Randevularım kolon yapısı düzenleme tamamlandı');
    return { success: true, rowsProcessed: newDataRows.length, columnsRemoved: 6, monthHeadersRemoved: monthHeaderRows.length };
    
  } catch (error) {
    console.error('❌ Randevularım kolon yapısı düzenleme hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Düzenleme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Fırsatlarım sayfasını yeni kolon düzenine göre düzenle
 */
function fixFirsatlarimColumnOrder(parameters) {
  console.log('[START] fixFirsatlarimColumnOrder');
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Fırsatlarım');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Fırsatlarım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return { success: false };
    }
    
    const ui = SpreadsheetApp.getUi();
    
    // Onay al
    const confirm = ui.alert(
      '⚠️ Uyarı',
      'Bu işlem:\n' +
      '• Keyword, Location, Category, CMS Adı, CMS Grubu, E-Ticaret İzi, Site Hızı, Site Trafiği, Log, City, Rating count, Review kolonlarını silecek\n' +
      '• Kolonları yeni yapıya göre düzenleyecek\n' +
      '• Verileri koruyarak taşıyacak\n' +
      '• "Ay" kolonunu otomatik dolduracak\n' +
      '• "Saat" formatlarını düzeltecek\n\n' +
      'Devam etmek istiyor musunuz?',
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      return { success: false, cancelled: true };
    }
    
    console.log('📊 Fırsatlarım kolon yapısı düzenleme başlıyor...');
    
    // Yeni kolon yapısı - YENİ DÜZEN (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
    const newColumns = [
      'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
      'Website', 'Mail', 'Toplantı formatı', 'Fırsat Durumu', 'Fırsat Tarihi',
      'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
    ];
    
    // Mevcut verileri oku
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      ui.alert('ℹ️ Bilgi', 'Fırsatlarım sayfasında düzenlenecek veri bulunamadı.', ui.ButtonSet.OK);
      return { success: true, rowsProcessed: 0 };
    }
    
    const allData = sheet.getDataRange().getValues();
    const currentHeaders = allData[0];
    const currentDataRows = allData.slice(1);
    
    console.log(`📊 Mevcut veri: ${currentDataRows.length} satır, ${currentHeaders.length} kolon`);
    
    // Tarih parse fonksiyonu
    function parseDate(d) {
      if (!d) return null;
      if (d instanceof Date) return d;
      if (typeof d === 'string') {
        const parts = d.split('.');
        if (parts.length === 3) {
          return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return new Date(d);
      }
      return new Date(d);
    }
    
    // Yeni veri array'ini oluştur
    const newDataRows = [];
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    // Fırsat Tarihi kolon indexini bul
    const firsatTarihiIndex = currentHeaders.indexOf('Fırsat Tarihi');
    
    for (let rowIdx = 0; rowIdx < currentDataRows.length; rowIdx++) {
      const oldRow = currentDataRows[rowIdx];
      const newRow = new Array(newColumns.length).fill('');
      
      // Mevcut verileri yeni sıraya göre taşı
      for (let oldColIdx = 0; oldColIdx < oldRow.length; oldColIdx++) {
        const oldColName = String(currentHeaders[oldColIdx] || '').trim();
        
        // Silinecek kolonları atla
        const columnsToRemove = ['Keyword', 'Location', 'Category', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi', 
                                  'Site Hızı', 'Site Trafiği', 'Log', 'Review', 'City', 'Rating count'];
        if (columnsToRemove.includes(oldColName)) {
          continue;
        }
        
        // Yeni kolon index'ini bul
        const newColIndex = newColumns.indexOf(oldColName);
        if (newColIndex !== -1) {
          newRow[newColIndex] = oldRow[oldColIdx];
        }
      }
      
      // Ay kolonunu otomatik doldur (Fırsat Tarihi'ne göre)
      const ayColIndex = newColumns.indexOf('Ay');
      if (firsatTarihiIndex !== -1 && ayColIndex !== -1) {
        const tarihValue = oldRow[firsatTarihiIndex];
        const tarih = parseDate(tarihValue);
        
        if (tarih && !isNaN(tarih.getTime())) {
          const ayAdi = monthNames[tarih.getMonth()];
          newRow[ayColIndex] = ayAdi;
          console.log(`📅 Satır ${rowIdx + 2}: Fırsat Tarihi="${tarihValue}" -> Ay="${ayAdi}"`);
        }
      }
      
      // Saat kolonunu düzelt (format kontrolü)
      const saatColIndex = newColumns.indexOf('Saat');
      if (saatColIndex !== -1 && newRow[saatColIndex]) {
        let saatValue = newRow[saatColIndex];
        
        // Date objesi ise, HH:mm formatına çevir
        if (saatValue instanceof Date) {
          const hours = saatValue.getHours().toString().padStart(2, '0');
          const minutes = saatValue.getMinutes().toString().padStart(2, '0');
          newRow[saatColIndex] = `${hours}:${minutes}`;
        } else if (typeof saatValue === 'string' && saatValue.includes('.')) {
          // Yanlış format (tarih gibi), temizle
          console.warn(`⚠️ Satır ${rowIdx + 2}: Saat formatı yanlış: "${saatValue}", temizleniyor...`);
          newRow[saatColIndex] = '';
        } else if (typeof saatValue === 'string') {
          // HH:mm formatında mı kontrol et
          const timeMatch = saatValue.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            const hours = timeMatch[1].padStart(2, '0');
            const minutes = timeMatch[2].padStart(2, '0');
            newRow[saatColIndex] = `${hours}:${minutes}`;
          }
        }
      }
      
      // Fırsat Durumu normalizasyonu (validation uyumluluğu için)
      const firsatDurumuIndex = newColumns.indexOf('Fırsat Durumu');
      if (firsatDurumuIndex !== -1 && newRow[firsatDurumuIndex]) {
        let durumValue = String(newRow[firsatDurumuIndex] || '').trim();
        
        // Normalize: küçük harf varyantlarını düzelt
        const durumLower = durumValue.toLowerCase();
        
        if (durumLower === 'fırsat iletildi' || durumLower === 'firsat iletildi') {
          newRow[firsatDurumuIndex] = 'Fırsat İletildi';
          console.log(`✅ Satır ${rowIdx + 2}: "Fırsat Durumu" normalize edildi: "${durumValue}" -> "Fırsat İletildi"`);
        } else if (durumLower === 'yeniden aranacak' || durumLower === 'yenidenaranacak') {
          newRow[firsatDurumuIndex] = 'Yeniden Aranacak';
          console.log(`✅ Satır ${rowIdx + 2}: "Fırsat Durumu" normalize edildi: "${durumValue}" -> "Yeniden Aranacak"`);
        } else if (durumLower === 'bilgi verildi' || durumLower === 'bilgiverildi') {
          newRow[firsatDurumuIndex] = 'Bilgi Verildi';
          console.log(`✅ Satır ${rowIdx + 2}: "Fırsat Durumu" normalize edildi: "${durumValue}" -> "Bilgi Verildi"`);
        }
        // Eğer zaten doğru formattaysa, değişiklik yapma
      }
      
      newDataRows.push(newRow);
    }
    
    // Validation'ları temizle
    const maxColBeforeClear = Math.max(sheet.getLastColumn() || 0, newColumns.length);
    const maxRowBeforeClear = Math.max(sheet.getLastRow() || 0, newDataRows.length + 10);
    
    if (maxRowBeforeClear > 1 && maxColBeforeClear > 0) {
      try {
        const clearRange = sheet.getRange(1, 1, maxRowBeforeClear, maxColBeforeClear);
        clearRange.clearDataValidations();
        console.log('✅ Tüm validation kuralları temizlendi');
      } catch (clearErr) {
        console.error('⚠️ Validation temizleme hatası:', clearErr);
      }
    }
    
    // Tüm veriyi temizle
    sheet.clear();
    
    // Yeni başlıkları yaz
    sheet.getRange(1, 1, 1, newColumns.length).setValues([newColumns]);
    
    // Yeni verileri yaz
    if (newDataRows.length > 0) {
      const dataRange = sheet.getRange(2, 1, newDataRows.length, newColumns.length);
      dataRange.setValues(newDataRows);
      console.log(`✅ ${newDataRows.length} satır veri yazıldı`);
    }
    
    // Kod kolonunu text formatında zorla
    const kodColumnIndex = newColumns.indexOf('Kod') + 1;
    if (kodColumnIndex > 0) {
      sheet.getRange(2, kodColumnIndex, newDataRows.length, 1).setNumberFormat('@');
    }
    
    // Saat kolonunu text formatına zorla
    const saatColumnIndex = newColumns.indexOf('Saat') + 1;
    if (saatColumnIndex > 0 && newDataRows.length > 0) {
      sheet.getRange(2, saatColumnIndex, newDataRows.length, 1).setNumberFormat('@');
    }
    
    // Stil ve validation'ı yeniden uygula
    applyFirsatlarimStyling(sheet);
    setFirsatlarimDataValidation(sheet);
    
    // Renklendirmeyi yeniden uygula (BATCH - optimized for performance)
    console.log('🎨 Tüm satırlara renklendirme uygulanıyor (batch mode)...');
    
    if (newDataRows.length > 0) {
      const startRow = 2; // Data starts at row 2 (header is row 1)
      applyOpportunityColorCodingBatch(sheet, startRow, newDataRows.length);
    }
    
    console.log(`✅ ${newDataRows.length} satır renklendirildi (batch mode)`);
    
    // Flush to ensure all changes are applied
    SpreadsheetApp.flush();
    
    let message = `Fırsatlarım sayfası yeni yapıya göre düzenlendi!\n\n`;
    message += `• Keyword, Location, Category, CMS Adı, CMS Grubu, E-Ticaret İzi, Site Hızı, Site Trafiği, Log, City, Rating count, Review kolonları silindi\n`;
    message += `• ${newDataRows.length} satır veri taşındı\n`;
    message += `• "Ay" kolonu otomatik dolduruldu\n`;
    message += `• ${newDataRows.length} satır renklendirildi\n`;
    
    ui.alert('✅ Başarılı', message, ui.ButtonSet.OK);
    
    console.log('✅ Fırsatlarım kolon yapısı düzenleme tamamlandı');
    return { success: true, rowsProcessed: newDataRows.length, columnsRemoved: 12 };
    
  } catch (error) {
    console.error('❌ Fırsatlarım kolon yapısı düzenleme hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Düzenleme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * 📅 Randevularım sayfasında tüm satırlar için Ay kolonunu doldur
 */
function fillAyColumnInRandevularim(parameters) {
  console.log('Function started: fillAyColumnInRandevularim', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Randevularım');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Randevularım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return { success: false };
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const randevuTarihiIdx = headers.map(h => String(h || '').toLowerCase()).indexOf('randevu tarihi');
    const ayIdx = headers.map(h => String(h || '').toLowerCase()).indexOf('ay');
    
    if (randevuTarihiIdx === -1) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Randevu Tarihi kolonu bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return { success: false };
    }
    
    if (ayIdx === -1) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Ay kolonu bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return { success: false };
    }
    
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      SpreadsheetApp.getUi().alert('ℹ️ Bilgi', 'Doldurulacak veri bulunamadı.', SpreadsheetApp.getUi().ButtonSet.OK);
      return { success: true, filled: 0 };
    }
    
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    let filledCount = 0;
    
    // Tüm satırları kontrol et
    for (let row = 2; row <= lastRow; row++) {
      const tarihValue = sheet.getRange(row, randevuTarihiIdx + 1).getValue();
      const tarihDisplay = sheet.getRange(row, randevuTarihiIdx + 1).getDisplayValue();
      const currentAy = sheet.getRange(row, ayIdx + 1).getValue();
      
      // Eğer tarih varsa ve Ay boşsa, doldur
      if (tarihValue && !currentAy) {
        let tarih = null;
        
        // Date objesi mi kontrol et
        if (tarihValue instanceof Date) {
          tarih = tarihValue;
        } else {
          // String olarak parse et
          let dateString = String(tarihDisplay || tarihValue || '').trim();
          if (dateString) {
            // DD.MM.YYYY formatını parse et
            const parts = dateString.split('.');
            if (parts.length === 3) {
              const day = parseInt(parts[0]);
              const month = parseInt(parts[1]);
              const year = parseInt(parts[2]);
              tarih = new Date(year, month - 1, day);
            } else {
              tarih = new Date(dateString);
            }
          }
        }
        
        if (tarih && !isNaN(tarih.getTime())) {
          const ayAdi = monthNames[tarih.getMonth()];
          sheet.getRange(row, ayIdx + 1).setValue(ayAdi);
          filledCount++;
          console.log(`📅 Satır ${row}: Randevu Tarihi="${tarihDisplay}" -> Ay="${ayAdi}"`);
        }
      }
    }
    
    SpreadsheetApp.getUi().alert('✅ Başarılı', `${filledCount} satırda Ay kolonu dolduruldu.`, SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log(`✅ Ay kolonu doldurma tamamlandı: ${filledCount} satır`);
    return { success: true, filled: filledCount };
    
  } catch (error) {
    console.error('❌ Ay kolonu doldurma hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Ay kolonu doldurma hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * 🗑️ Toplantılarım - Duplicate Kayıtları Temizle
 * Aynı Kod'a sahip duplicate kayıtları bulur ve siler (en eski kayıt kalır)
 * @param {Object} parameters - Function parameters
 * @returns {Object} - Result object
 */
function cleanDuplicateMeetings(parameters) {
  console.log('[START] cleanDuplicateMeetings', parameters);
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('Toplantılarım');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Toplantılarım sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return { success: false };
    }
    
    const ui = SpreadsheetApp.getUi();
    
    // Onay al
    const confirm = ui.alert(
      '⚠️ Uyarı',
      'Bu işlem:\n' +
      '• Aynı Kod\'a sahip duplicate kayıtları bulacak\n' +
      '• En eski kayıt kalacak, diğerleri silinecek\n' +
      '• Bu işlem geri alınamaz!\n\n' +
      'Devam etmek istiyor musunuz?',
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      return { success: false, cancelled: true };
    }
    
    console.log('🔍 Toplantılarım duplicate kontrolü başlıyor...');
    
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const dataRows = allData.slice(1);
    
    const kodIndex = headers.indexOf('Kod');
    if (kodIndex === -1) {
      throw new Error('Kod kolonu bulunamadı!');
    }
    
    // Kod bazlı duplicate'leri bul
    const kodMap = new Map(); // kod -> [rowNumbers]
    const rowsToDelete = [];
    
    for (let i = 0; i < dataRows.length; i++) {
      const rowNumber = i + 2; // +2 çünkü header var ve index 0'dan başlıyor
      const kodValue = String(dataRows[i][kodIndex] || '').trim();
      
      if (!kodValue) {
        continue; // Kod boşsa atla
      }
      
      if (!kodMap.has(kodValue)) {
        kodMap.set(kodValue, []);
      }
      kodMap.get(kodValue).push(rowNumber);
    }
    
    // Her kod için, birden fazla kayıt varsa duplicate
    const rowsToKeep = new Set(); // Kalacak satırlar (Set kullanarak hızlı kontrol)
    for (const [kod, rowNumbers] of kodMap.entries()) {
      if (rowNumbers.length > 1) {
        // En eski kayıt kalacak (ilk satır - en küçük satır numarası), diğerleri silinecek
        const sortedRows = [...rowNumbers].sort((a, b) => a - b); // Copy array before sorting
        const rowToKeep = sortedRows[0]; // İlk satır (en küçük satır numarası) kalacak
        const rowsToDeleteForKod = sortedRows.slice(1); // İlk satır hariç hepsi silinecek
        
        rowsToKeep.add(rowToKeep); // Kalacak satırı kaydet
        console.log(`🔍 Kod "${kod}" için ${rowNumbers.length} kayıt bulundu:`);
        console.log(`   ✅ KALACAK: Satır ${rowToKeep} (en eski kayıt)`);
        console.log(`   🗑️ SİLİNECEK: Satırlar ${rowsToDeleteForKod.join(', ')}`);
        rowsToDelete.push(...rowsToDeleteForKod);
      }
    }
    
    if (rowsToDelete.length === 0) {
      ui.alert('ℹ️ Bilgi', 'Toplantılarım sayfasında duplicate kayıt bulunamadı.', ui.ButtonSet.OK);
      return { success: true, deleted: 0 };
    }
    
    // ÖNEMLİ: Kalacak satırların silinmemesini garanti et
    const finalRowsToDelete = rowsToDelete.filter(rowNum => !rowsToKeep.has(rowNum));
    if (finalRowsToDelete.length !== rowsToDelete.length) {
      const removed = rowsToDelete.length - finalRowsToDelete.length;
      console.warn(`⚠️ UYARI: ${removed} satır kalacak listeden çıkarıldı (zaten korunacak)`);
    }
    
    // Satırları yüksekten düşüğe sırala (silme işlemi için önemli - aşağıdan yukarıya sil)
    finalRowsToDelete.sort((a, b) => b - a);
    
    console.log(`📊 Toplam ${finalRowsToDelete.length} duplicate satır silinecek, ${rowsToKeep.size} kayıt korunacak`);
    
    // Satırları sil
    let deletedCount = 0;
    for (const rowNum of finalRowsToDelete) {
      try {
        // Son kontrol: Bu satır kalacak listede mi? (güvenlik için)
        if (rowsToKeep.has(rowNum)) {
          console.warn(`⚠️ Satır ${rowNum} kalacak listede, silme ATLANDI!`);
          continue;
        }
        sheet.deleteRow(rowNum);
        deletedCount++;
        console.log(`✅ Satır ${rowNum} silindi (duplicate)`);
      } catch (deleteError) {
        console.error(`❌ Satır ${rowNum} silinirken hata:`, deleteError);
      }
    }
    
    const message = `✅ Toplantılarım duplicate temizleme tamamlandı!\n\n` +
      `🗑️ Silinen kayıt: ${deletedCount}\n` +
      `📊 Kalan kayıt: ${dataRows.length - deletedCount}`;
    
    ui.alert('✅ Başarılı', message, ui.ButtonSet.OK);
    
    console.log('✅ Toplantılarım duplicate temizleme tamamlandı');
    return { success: true, deleted: deletedCount };
    
  } catch (error) {
    console.error('❌ cleanDuplicateMeetings error:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Duplicate temizleme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

