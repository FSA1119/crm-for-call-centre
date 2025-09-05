// ========================================
// MANAGER SYNC - YÖNETİCİ AKIŞLARI
// Version: 4.5
// 
// 📊 PERFORMANCE DASHBOARD SİSTEMİ DAHİL EDİLDİ
// performance-dashboard.gs dosyasından import edildi
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
    'GŞ 006': 'Gamze Şafaklıoğlu',
    'BH 007': 'Bilge Hin',
    'TD 008': 'Tuğçe Duman'
  },
  
  // 📁 File Management - Data Sources
  MANAGER_FILE: 'FSA_019 - Yonetici Takip Dosyasi',

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
    
    // Meeting Colors
    'Toplantı Tamamlandı': 'rgb(200, 230, 201)',  // Light Green
    'Toplantı Teklif': 'rgb(165, 214, 167)',      // Darker Green
    'Toplantı Beklemede': 'rgb(255, 243, 224)',   // Soft Orange
    'Toplantı İptal': 'rgb(255, 235, 238)',       // Light Red
    'Satış Yapıldı': 'rgb(187, 222, 251)',        // Light Blue
    'Potansiyel Sıcak': '#FFE0B2',                // Light Orange
    'Potansiyel Orta': '#E1F5FE',                 // Light Blue
    'Potansiyel Soğuk': '#ECEFF1'                 // Light Gray
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
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getMaxColumns());
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
    // Choose contrasting font color (black for light backgrounds)
    const lightBg = /rgb\((2[0-9]{2}|1[5-9][0-9]),\s*(2[0-9]{2}|1[5-9][0-9]),\s*(2[0-9]{2}|1[5-9][0-9])\)/.test(headerColor);
    headerRange.setFontColor(lightBg ? 'black' : 'white');
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

// Parse dd.MM.yyyy to Date (global utility)
function parseDdMmYyyy(str) {
  try {
    const s = String(str || '').trim();
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return null;
    const [dd, mm, yyyy] = s.split('.').map(n => parseInt(n, 10));
    const d = new Date(yyyy, mm - 1, dd);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
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
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    let statusColumnIndex = -1;
    const lowerName = String(sheetName || '').toLowerCase();
    if (lowerName.includes('randevu')) {
      statusColumnIndex = headers.indexOf('Randevu durumu');
      if (statusColumnIndex === -1) statusColumnIndex = headers.indexOf('Randevu Durumu');
      var randevuMeetingResultIdx = headers.indexOf('Toplantı Sonucu');
      if (randevuMeetingResultIdx === -1) randevuMeetingResultIdx = headers.indexOf('Toplantı sonucu');
    } else if (lowerName.includes('fırsat') || lowerName.includes('firsat')) {
      statusColumnIndex = headers.indexOf('Fırsat Durumu');
      if (statusColumnIndex === -1) statusColumnIndex = headers.indexOf('Aktivite');
    } else if (lowerName.includes('toplant')) {
      // Try multiple candidates for meeting status - T Toplantılar için
      statusColumnIndex = headers.indexOf('Toplantı Sonucu');
      if (statusColumnIndex === -1) statusColumnIndex = headers.indexOf('Toplantı durumu');
      if (statusColumnIndex === -1) statusColumnIndex = headers.indexOf('Randevu durumu');
      // Ayrıca Toplantı Sonucu için indeks
      var meetingResultIdx = headers.indexOf('Toplantı Sonucu');
    } else {
      statusColumnIndex = headers.indexOf('Aktivite');
    }
    
    // Temsilci kodu rengi: yalnızca 'T Aktivite Özet' için (diğer sayfalar durum bazlı)
    let employeeCodeColumnIndex = -1;
    employeeCodeColumnIndex = headers.indexOf('Temsilci Kodu');
    if (employeeCodeColumnIndex === -1) employeeCodeColumnIndex = headers.indexOf('Kod');
    if (employeeCodeColumnIndex === -1) {
      // Esnek arama (küçük/büyük, boşluk/aksan toleransı)
      const lowered = headers.map(h => String(h || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''));
      employeeCodeColumnIndex = lowered.indexOf('temsilci kodu');
      if (employeeCodeColumnIndex === -1) employeeCodeColumnIndex = lowered.indexOf('kod');
      if (employeeCodeColumnIndex === -1) employeeCodeColumnIndex = 0; // Fallback: ilk sütun
    }
    console.log(`🎨 ${sheetName}: Temsilci Kodu sütunu bulundu: ${employeeCodeColumnIndex} (${headers[employeeCodeColumnIndex] || 'bulunamadı'})`);
    
    // T Aktivite Özet/Tümü için status sütunu zorunlu değil
    if (statusColumnIndex === -1 && (sheetName !== 'T Aktivite Özet' && sheetName !== 'T Aktivite (Tümü)')) {
      console.log(`⚠️ ${sheetName}: Status column not found (${statusColumnIndex}), skipping color coding`);
      return;
    }
    
    // T sayfaları için özel debug
    if (lowerName.includes('toplant')) {
      console.log(`🎨 T Toplantılar Debug: StatusCol=${statusColumnIndex}, MeetingResultIdx=${meetingResultIdx}, Headers=${headers.join(', ')}`);
    } else if (lowerName.includes('fırsat') || lowerName.includes('firsat')) {
      console.log(`🎨 T Fırsatlar Debug: StatusCol=${statusColumnIndex}, Headers=${headers.join(', ')}`);
    } else if (lowerName.includes('randevu')) {
      console.log(`🎨 T Randevular Debug: StatusCol=${statusColumnIndex}, RandevuMeetingResultIdx=${randevuMeetingResultIdx}, Headers=${headers.join(', ')}`);
    }
    
    console.log(`🎨 applyColorCodingToManagerData: Sheet=${sheetName}, StatusCol=${statusColumnIndex}, EmployeeCol=${employeeCodeColumnIndex}, Rows=${rowCount}`);
    for (let i = 0; i < rowCount; i++) {
      const rowNumber = startRow + i;
      console.log(`🎨 Processing row ${rowNumber} for ${sheetName}`);
      
      // T Aktivite Özet için status kontrolü yapma
      let status = '';
      let normStatusStr = '';
      if (!(sheetName === 'T Aktivite Özet' || sheetName === 'T Aktivite (Tümü)')) {
        const statusCell = sheet.getRange(rowNumber, statusColumnIndex + 1);
        status = String(statusCell.getDisplayValue() || '').trim();
        normStatusStr = status.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
        console.log(`Manager color coding - Row ${rowNumber}, Status: "${status}", Sheet: ${sheetName}`);
      }
      
      // Her satır için color değişkeni tanımla
      let color = 'rgb(255, 255, 255)';
      
      // T Aktivite Özet için sadece temsilci koduna göre renk
      console.log(`🔍 Row ${rowNumber}: sheetName="${sheetName}", lowerName="${lowerName}"`);
      
                         if (sheetName === 'T Aktivite Özet' || sheetName === 'T Aktivite (Tümü)') {
        // T Aktivite Özet/Tümü: durum dikkate alınmaz, temsilci kodu görsel kimlik
        color = 'rgb(255, 255, 255)';
        console.log(`🎨 ${sheetName} row ${rowNumber}: Status bypassed, using employee code`);
      }
      if (status && status !== '' && !(sheetName === 'T Aktivite Özet' || sheetName === 'T Aktivite (Tümü)')) {
        if (lowerName.includes('toplant')) {
          var resultVal = '';
          try { if (typeof meetingResultIdx === 'number' && meetingResultIdx >= 0) { resultVal = String(sheet.getRange(rowNumber, meetingResultIdx + 1).getDisplayValue() || ''); } } catch(e) {}
          const rv = String(resultVal).toLowerCase();
          const isSale = (rv === 'satış yapıldı' || rv === 'satis yapildi');
          const isOffer = (!isSale && rv.indexOf('teklif') !== -1);
          const isCancel = (!isSale && rv.indexOf('iptal') !== -1);
          
          console.log(`🎨 T Toplantılar Row ${rowNumber}: resultVal="${resultVal}", rv="${rv}", isSale=${isSale}, isOffer=${isOffer}, isCancel=${isCancel}`);
          // Potansiyel rengi oku (Satış/Teklif/İptal değilse)
          let potentialColor = '';
          try {
            const potIdx = headers.indexOf('Satış Potansiyeli');
            if (potIdx !== -1) {
              const pot = String(sheet.getRange(rowNumber, potIdx + 1).getDisplayValue() || '').toLowerCase();
              if (pot === 'sıcak' || pot === 'sicak') potentialColor = CRM_CONFIG.COLOR_CODES['Potansiyel Sıcak'];
              else if (pot === 'orta') potentialColor = CRM_CONFIG.COLOR_CODES['Potansiyel Orta'];
              else if (pot === 'soğuk' || pot === 'soguk') potentialColor = CRM_CONFIG.COLOR_CODES['Potansiyel Soğuk'];
              console.log(`🎨 T Toplantılar Row ${rowNumber}: pot="${pot}", potentialColor="${potentialColor}"`);
            } else {
              console.log(`🎨 T Toplantılar Row ${rowNumber}: Satış Potansiyeli sütunu bulunamadı (potIdx=${potIdx})`);
            }
          } catch(e) {
            console.log(`🎨 T Toplantılar Row ${rowNumber}: Potansiyel renk okuma hatası:`, e && e.message);
          }
          if (isSale) {
            color = CRM_CONFIG.COLOR_CODES['Satış Yapıldı'];
          } else if (isOffer) {
            // Teklif: potansiyele göre renklendir (varsa), yoksa koyu yeşil
            color = potentialColor || CRM_CONFIG.COLOR_CODES['Toplantı Teklif'];
          } else if (isCancel) {
            color = CRM_CONFIG.COLOR_CODES['Toplantı İptal'];
          } else if (potentialColor) {
            color = potentialColor;
          } else {
            color = CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'];
          }
          
          console.log(`🎨 T Toplantılar Row ${rowNumber}: Final color determined: ${color}`);
        } else if (lowerName.includes('randevu')) {
          // Randevular: kesin eşleşme (TR başlıklar)
          const raw = String(status || '').trim();
          const n = normStatusStr;
          
          console.log(`🎨 T Randevular Row ${rowNumber}: raw="${raw}", n="${n}"`);
          
          if (raw === 'Randevu Alındı' || n.indexOf('randevu alindi') !== -1) {
            color = CRM_CONFIG.COLOR_CODES['Randevu Alındı'];
          } else if (raw === 'İleri Tarih Randevu' || (n.indexOf('ileri') !== -1 && n.indexOf('tarih') !== -1)) {
            color = CRM_CONFIG.COLOR_CODES['İleri Tarih Randevu'];
          } else if (raw === 'Randevu Teyitlendi' || n.indexOf('teyit') !== -1) {
            color = CRM_CONFIG.COLOR_CODES['Randevu Teyitlendi'];
          } else if (raw === 'Randevu Ertelendi' || n.indexOf('erte') !== -1) {
            color = CRM_CONFIG.COLOR_CODES['Randevu Ertelendi'];
          } else if (raw === 'Randevu İptal oldu' || n.indexOf('iptal') !== -1) {
            color = CRM_CONFIG.COLOR_CODES['Randevu İptal oldu'];
          }
          
          console.log(`🎨 T Randevular Row ${rowNumber}: Initial color determined: ${color}`);
          // Toplantı Sonucu override'ları
          if (typeof randevuMeetingResultIdx === 'number' && randevuMeetingResultIdx >= 0) {
            try {
              const res = String(sheet.getRange(rowNumber, randevuMeetingResultIdx + 1).getDisplayValue() || '').trim();
              const resLower = res.toLowerCase();
              
              console.log(`🎨 T Randevular Row ${rowNumber}: Toplantı Sonucu="${res}", resLower="${resLower}"`);
              
              if (res === 'Satış Yapıldı') {
                color = CRM_CONFIG.COLOR_CODES['Satış Yapıldı'];
                console.log(`🎨 T Randevular Row ${rowNumber}: Override to Satış Yapıldı: ${color}`);
              } else if (resLower.indexOf('teklif') !== -1) {
                color = CRM_CONFIG.COLOR_CODES['Toplantı Teklif'];
                console.log(`🎨 T Randevular Row ${rowNumber}: Override to Toplantı Teklif: ${color}`);
              }
            } catch (e) {
              console.log(`🎨 T Randevular Row ${rowNumber}: Toplantı Sonucu okuma hatası:`, e && e.message);
            }
          }
          
          console.log(`🎨 T Randevular Row ${rowNumber}: Final color determined: ${color}`);
        } else {
          // Fırsatlar ve diğerleri
          console.log(`🎨 T Fırsatlar Row ${rowNumber}: status="${status}", normStatusStr="${normStatusStr}"`);
          
          if (status === 'Fırsat İletildi' || String(status).toLowerCase().includes('teklif')) {
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
          
          console.log(`🎨 T Fırsatlar Row ${rowNumber}: Final color determined: ${color}`);
        }
      }
      
      // Her satır için final color belirle
      let finalColor = color;
      
      // T Aktivite Özet için her satırda employee code işle
      console.log(`🔍 Row ${rowNumber}: Employee code check - sheetName="${sheetName}"`);
      
      // T Aktivite Özet için employee code işle
      if (sheetName === 'T Aktivite Özet') {
        console.log(`🎨 T Aktivite Özet row ${rowNumber}: Processing employee code...`);
        
        if (employeeCodeColumnIndex !== -1) {
          try {
            const employeeCode = String(sheet.getRange(rowNumber, employeeCodeColumnIndex + 1).getDisplayValue() || '').trim();
            console.log(`🔍 Row ${rowNumber}: Employee code found: "${employeeCode}"`);
            
            if (employeeCode) {
              const employeeColor = getEmployeeColor(employeeCode);
              console.log(`🎨 Row ${rowNumber}: getEmployeeColor("${employeeCode}") = ${employeeColor}`);
              
              if (employeeColor) {
                finalColor = employeeColor;
                console.log(`🎨 Employee color applied: ${employeeCode} → ${employeeColor}`);
              } else {
                console.log(`⚠️ Row ${rowNumber}: No color found for employee code "${employeeCode}"`);
              }
            } else {
              console.log(`⚠️ Row ${rowNumber}: Empty employee code`);
            }
          } catch (e) {
            console.log('Employee color lookup failed:', e && e.message);
          }
        } else {
          console.log(`⚠️ Row ${rowNumber}: employeeCodeColumnIndex = ${employeeCodeColumnIndex}`);
        }
      } else if (employeeCodeColumnIndex !== -1 && sheetName === 'T Aktivite Özet') {
        // Sadece T Aktivite Özet için employee color uygula
        try {
          const employeeCode = String(sheet.getRange(rowNumber, employeeCodeColumnIndex + 1).getDisplayValue() || '').trim();
          if (employeeCode) {
            const employeeColor = getEmployeeColor(employeeCode);
            if (employeeColor) {
              finalColor = employeeColor;
              console.log(`🎨 Employee color applied: ${employeeCode} → ${employeeColor}`);
            }
          }
        } catch (e) {
          console.log('Employee color lookup failed:', e && e.message);
        }
      }
      
      // Renk uygulama
      try {
        if (sheetName === 'T Aktivite Özet' || sheetName === 'T Aktivite (Tümü)') {
          // Sadece 'Kod' hücresini temsilci rengine boya, diğer hücreleri beyaz bırak
          const rowRange = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
          rowRange.setBackground('white');
          try {
            const codeCell = sheet.getRange(rowNumber, (employeeCodeColumnIndex > -1 ? employeeCodeColumnIndex : 0) + 1);
            const empCode = String(codeCell.getDisplayValue() || '').trim();
            const empColor = empCode ? getEmployeeColor(empCode) : null;
            if (empColor) codeCell.setBackground(empColor);
          } catch (ecErr) { console.log('Employee cell color failed:', ecErr && ecErr.message); }
          console.log(`🎨 Row ${rowNumber}: ${sheetName} → only Kod colored`);
        } else {
          // Diğer sayfalarda tüm satıra durum rengi uygula
          const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
          range.setBackground(finalColor);
          console.log(`🎨 Row ${rowNumber}: Background color set: ${finalColor} (Sheet: ${sheetName})`);
          
          // T sayfaları için özel debug
          if (lowerName.includes('toplant') || lowerName.includes('fırsat') || lowerName.includes('firsat') || lowerName.includes('randevu')) {
            console.log(`🎨 T Sayfa Row ${rowNumber}: finalColor="${finalColor}", sheetName="${sheetName}"`);
          }
        }
      } catch(e) {
        console.log('setBackground fail', e && e.message);
      }

      // Yeni: Randevular'da Toplantı Sonucu doluysa kursiv+kalın; boşsa normal
      try {
        if (lowerName.includes('randevu') && typeof randevuMeetingResultIdx === 'number' && randevuMeetingResultIdx >= 0) {
          const resDisp = String(sheet.getRange(rowNumber, randevuMeetingResultIdx + 1).getDisplayValue() || '').trim();
          const rowRange = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
          if (resDisp) {
            rowRange.setFontStyle('italic');
            rowRange.setFontWeight('bold');
          } else {
            rowRange.setFontStyle('normal');
            rowRange.setFontWeight('normal');
          }
        }
      } catch (styleErr) {
        console.log('⚠️ Font style apply skipped:', styleErr && styleErr.message);
      }
    }
  } catch (error) {
    console.error('Error applying color coding to manager data:', error);
  }
}

/**
 * 🎨 Get Employee Color by Code - Visual Identity
 * @param {string} employeeCode - Employee code (e.g., 'LG 001')
 * @returns {string} - RGB color code
 */
function getEmployeeColor(employeeCode) {
  const employeeColors = {
    'LG 001': 'rgb(173, 216, 230)',    // Light Blue
    'NT 002': 'rgb(144, 238, 144)',    // Light Green
    'KO 003': 'rgb(255, 165, 0)',      // Orange
    'SB 004': 'rgb(221, 160, 221)',    // Plum
    'KM 005': 'rgb(255, 182, 193)',    // Light Red
    'GŞ 006': 'rgb(178, 235, 242)'     // Light Cyan (distinct from KM 005)
  };
  
  console.log(`🎨 getEmployeeColor("${employeeCode}") called, returning: ${employeeColors[employeeCode] || 'null'}`);
  return employeeColors[employeeCode] || null;
}

// Bu fonksiyon kaldırıldı - kullanılmıyor

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
    // "Tüm Verileri Senkronize Et" kaldırıldı - artık gerekli değil
    // Dashboard sistemi direkt temsilci dosyalarından veri çekiyor

    // Bu menü kaldırıldı - kullanılmıyor

    // Sırayla (Üstüne Ekle) - Kullanılıyor
    const appendSubmenu = ui.createMenu('➕ Sırayla (Üstüne Ekle)');
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      // Boşlukları alt çizgi ile değiştir ve doğru fonksiyon ismini oluştur
      const functionName = `syncSingleEmployeeAppend_${employeeCode.replace(/\s+/g, '_')}`;
      appendSubmenu.addItem(`${employeeCode} - ${employeeName}`, functionName);
    }
    menu.addSubMenu(appendSubmenu)
        .addSeparator();

    // 📊 Log Özeti - Sadece log analizi
    const logAnalysisSubmenu = ui.createMenu('📊 Log Özeti');
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      // Boşlukları alt çizgi ile değiştir ve doğru fonksiyon ismini oluştur
      const functionName = `logAnalysis_${employeeCode.replace(/\s+/g, '_')}`;
      logAnalysisSubmenu.addItem(`📊 ${employeeCode} - ${employeeName}`, functionName);
    }
    menu.addSubMenu(logAnalysisSubmenu)
        .addSeparator();

    // Performans
    const perfSubmenu = ui.createMenu('⚡ Performans');
    const onlyTouched = getOnlyColorTouchedRowsFlag();
    perfSubmenu.addItem(`Renkleme: Yalnızca Yeni/Güncellenen (Şu an: ${onlyTouched ? 'Açık' : 'Kapalı'})`, 'toggleOnlyColorTouchedRows');
    menu.addSubMenu(perfSubmenu)
        .addSeparator();

    // Sıralama
    menu.addItem('↕️ T Randevular: Tarihe Göre Sırala (Artan)', 'sortTRandevularByDateAscending')
        .addSeparator();

    // Seçili randevuyu toplantıya taşı
    menu.addItem('📥 Seçili Randevuyu Toplantıya Taşı', 'moveSelectedRandevuToMeeting')
        .addSeparator();

    // Test fonksiyonları kaldırıldı - kullanılmıyor

    // Aktivite özeti
    menu.addItem('📊 Aktivite Özeti Yenile', 'refreshActivitySummaryAll')
        .addSeparator();

    // Karşılaştırma raporları
    addReportsComparisonMenu(menu);

    // Raporlar (Genel)
    const reportsGeneral = ui.createMenu('Raporlar (Genel)');
    reportsGeneral.addItem('Günlük', 'generateDailyReportAutoSeriesManager')
                  .addItem('Haftalık', 'generateReportsGeneralWeekly')
                  .addItem('Aylık', 'generateReportsGeneralMonthly');
    menu.addSubMenu(reportsGeneral);

    // Raporlar (Seçili Temsilci)
    const reportsPerEmployee = ui.createMenu('Raporlar (Seçili Temsilci)');
    reportsPerEmployee.addItem('Günlük', 'generateReportsForEmployeeDailyPrompt')
                      .addItem('Haftalık', 'generateReportsForEmployeeWeeklyPrompt')
                      .addItem('Aylık', 'generateReportsForEmployeeMonthlyPrompt');
    menu.addSubMenu(reportsPerEmployee)
        .addSeparator();

    // Bakım
    const maintenance = ui.createMenu('🧼 Bakım');
    maintenance.addItem('🎨 (Yönetici) Renk Kodlaması – Tüm Sayfalar', 'forceRefreshManagerColorCoding')
               .addItem('🎨 (Yönetici) Bu Sayfayı Yenile', 'applyManualManagerColorCoding')
               .addItem('🎨 Tüm T Sayfalarında Renklendirme', 'applyColorCodingToAllManagerSheets')
               .addItem('🧭 Sadece Sırala (Toplantılar)', 'sortMeetingsManual')
               .addSeparator()
               .addItem('🎨 (Temsilci) Renkleri Yenile – Tümü', 'refreshAgentColorCodingAll')
               .addItem('🎨 (Temsilci) Renkleri Yenile – Seçili Kod', 'refreshAgentColorCodingPrompt')
               .addSeparator()
               .addItem('📊 Özet (Tek Kod)', 'refreshActivitySummaryForCodePrompt')
               .addItem('📊 Özet (Hızlı Parti)', 'refreshActivitySummaryAllFast');
    menu.addSubMenu(maintenance)
        .addSeparator();

    // Görünüm
    const viewMenu = ui.createMenu('👁️ Görünüm');
    viewMenu.addItem('Okunabilir Yap (Bu Sayfa)', 'applyReadableView')
            .addItem('Görünümü Sıfırla (Bu Sayfa)', 'resetReadableView');
    menu.addSubMenu(viewMenu)
        .addSeparator();

    // 🔄 DASHBOARD SENKRONİZASYON - TEK BUTON
    menu.addItem('🔄 Dashboard Senkronize Et & Göster', 'syncAllEmployeesAndShowDashboard')
        .addSeparator();
    
    
    menu.addItem('Senkronizasyon Durumu', 'showSyncStatus')
        .addSeparator()
        .addItem('Verileri Temizle', 'cleanManagerData')
        .addSeparator()
        // Bu menü öğesi kaldırıldı - kullanılmıyor
        .addToUi();
  } catch (error) {
    console.error('Error creating manager menu:', error);
  }
}

function applyReadableView() {
  console.log('Function started:', { action: 'applyReadableView' });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    if (!sheet) {
      throw new Error('Aktif sayfa bulunamadı');
    }
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) {
      SpreadsheetApp.getUi().alert('Uyarı', 'Bu sayfada kolon bulunmuyor.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    const lowered = headers.map(h => String(h || '').toLowerCase());
    function idxOf(cands){ for (const c of cands){ const i = lowered.indexOf(String(c).toLowerCase()); if (i!==-1) return i; } return -1; }

    const idxYorum = idxOf(['Yorum']);
    const idxYonNot = idxOf(['Yönetici Not','Yonetici Not']);
    const idxLog   = idxOf(['Log']);

    const targets = [];
    if (idxYorum !== -1) targets.push({ idx: idxYorum + 1, width: 280 });
    if (idxYonNot !== -1) targets.push({ idx: idxYonNot + 1, width: 300 });
    if (idxLog   !== -1) targets.push({ idx: idxLog + 1,   width: 360 });

    for (const t of targets) {
      try {
        sheet.setColumnWidth(t.idx, t.width);
        if (lastRow > 1) {
          const rng = sheet.getRange(2, t.idx, lastRow - 1, 1);
          rng.setWrap(true);
          rng.setVerticalAlignment('TOP');
        }
      } catch (colErr) {
        console.log('⚠️ Column format skipped:', { col: t.idx, error: colErr && colErr.message });
      }
    }

    if (lastRow > 1) {
      try { sheet.setRowHeights(2, lastRow - 1, 54); } catch (rhErr) {}
    }

    console.log('Processing complete:', { wrappedCols: targets.map(t => t.idx) });
    SpreadsheetApp.getUi().alert('Tamam', 'Bu sayfa okunabilir yapıldı (metin kaydırma ve sütun genişlikleri uygulandı).', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function resetReadableView() {
  console.log('Function started:', { action: 'resetReadableView' });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    if (!sheet) {
      throw new Error('Aktif sayfa bulunamadı');
    }
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastCol === 0) {
      SpreadsheetApp.getUi().alert('Uyarı', 'Bu sayfada kolon bulunmuyor.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    const lowered = headers.map(h => String(h || '').toLowerCase());
    function idxOf(cands){ for (const c of cands){ const i = lowered.indexOf(String(c).toLowerCase()); if (i!==-1) return i; } return -1; }

    const idxYorum = idxOf(['Yorum']);
    const idxYonNot = idxOf(['Yönetici Not','Yonetici Not']);
    const idxLog   = idxOf(['Log']);

    const targets = [];
    if (idxYorum !== -1) targets.push(idxYorum + 1);
    if (idxYonNot !== -1) targets.push(idxYonNot + 1);
    if (idxLog   !== -1) targets.push(idxLog + 1);

    for (const col of targets) {
      try {
        if (lastRow > 1) {
          const rng = sheet.getRange(2, col, lastRow - 1, 1);
          rng.setWrap(false);
          rng.setVerticalAlignment('BOTTOM');
        }
        try { sheet.autoResizeColumn(col); } catch (arErr) {}
      } catch (colErr) {
        console.log('⚠️ Column reset skipped:', { col, error: colErr && colErr.message });
      }
    }

    if (lastRow > 1) {
      try { sheet.setRowHeights(2, lastRow - 1, 21); } catch (rhErr) {}
    }

    console.log('Processing complete:', { resetCols: targets });
    SpreadsheetApp.getUi().alert('Tamam', 'Görünüm sıfırlandı (metin kaydırma kapatıldı ve sütunlar otomatik boyutlandı).', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// Bu fonksiyon kaldırıldı - kullanılmıyor



// Bu fonksiyon kaldırıldı - kullanılmıyor

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
    const totalStats = { totalRecords: 0, employeeStats: {}, errors: [] };
    const employeeData = collectEmployeeData(managerFile, employeeCode);
    const employeeStats = { employeeCode, totalRecords: 0, sheetStats: {} };
    for (const [sheetName, data] of Object.entries(employeeData)) {
      if (data && data.length > 0) {
        const op = updateManagerSheet(managerFile, sheetName, data, employeeCode, mode) || { totalIncoming: data.length };
        employeeStats.sheetStats[sheetName] = op;
        employeeStats.totalRecords += op.totalIncoming;
      }
    }

    // Collect negatives from Format Tablo as summary counts
    const employeeFile = findEmployeeFile(employeeCode);
    const negRows = collectFormatTableNegativeSummary(employeeFile, employeeCode);
    updateManagerActivitySummary(managerFile, negRows, employeeCode, 'replace');
    try { employeeStats.sheetStats['T Aktivite Özet'] = Array.isArray(negRows) ? negRows.length : 0; } catch (_) {}
    try {
      const fullRows = computeFullActivityWideRows(managerFile, employeeCode);
      updateManagerFullActivitySummaryWide(managerFile, fullRows, employeeCode, mode === 'append' ? 'append' : 'replace');
      try { employeeStats.sheetStats['T Aktivite (Tümü)'] = Array.isArray(fullRows) ? fullRows.length : 0; } catch (_) {}
      // Zorunlu renklendirme: Sadece T Aktivite (Tümü)
      try {
        const shTumu = managerFile.getSheetByName('T Aktivite (Tümü)');
        if (shTumu && shTumu.getLastRow() > 1) {
          applyColorCodingToManagerData(shTumu, 'T Aktivite (Tümü)', 2, shTumu.getLastRow() - 1);
        }
      } catch (colErr1) { console.log('⚠️ Recolor T Aktivite (Tümü) skipped:', colErr1 && colErr1.message); }
    } catch (e) { console.log('⚠️ Full activity summary generation skipped:', e && e.message); }

    totalStats.employeeStats[employeeCode] = employeeStats;
    totalStats.totalRecords += employeeStats.totalRecords;

    // Append modunda ilgili T sayfasına otomatik geçiş yap
    if (mode === 'append') {
      try {
        const prefer = ['T Toplantılar', 'T Fırsatlar', 'T Randevular'];
        for (const name of prefer) {
          const sh = managerFile.getSheetByName(name);
          if (sh && sh.getLastRow() > 1) { managerFile.setActiveSheet(sh); break; }
        }
      } catch (_) {}
    }

    showSyncResults(totalStats);
    // Removed global recoloring/validation to avoid O(N) cost across all sheets
    return totalStats;
  } catch (error) {
    console.error(`Error synchronizing employee ${employeeCode}:`, error);
    const ui = SpreadsheetApp.getUi();
    ui.alert('Hata', `${employeeCode} senkronizasyonu başarısız oldu: ${error.message}`, ui.ButtonSet.OK);
  }
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
    
    // Skip auto color coding on open (performance)
    console.log('⏭️ Skipping auto color coding on open');
    
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
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    
    // Serbest metin kolonlarındaki eski validasyonları temizle (ör. Kaynak)
    try {
      const idxKaynak = headers.indexOf('Kaynak');
      if (idxKaynak !== -1 && sheet.getLastRow() > 1) {
        sheet.getRange(2, idxKaynak + 1, sheet.getLastRow() - 1, 1).clearDataValidations();
      }
      const idxLocation = headers.indexOf('Location');
      if (idxLocation !== -1 && sheet.getLastRow() > 1) {
        sheet.getRange(2, idxLocation + 1, sheet.getLastRow() - 1, 1).clearDataValidations();
      }
      const idxKeyword = headers.indexOf('Keyword');
      if (idxKeyword !== -1 && sheet.getLastRow() > 1) {
        sheet.getRange(2, idxKeyword + 1, sheet.getLastRow() - 1, 1).clearDataValidations();
      }
    } catch (e) { console.log('Validation clear skipped:', e && e.message); }
    
    // Apply validation based on sheet type
    switch (sheetName) {
      case 'Randevular':
        try { sheet.setConditionalFormatRules([]); } catch (cfErr) { console.log('⚠️ CF clear skipped:', cfErr && cfErr.message); }
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

        // Add validation for Toplantı Sonucu
        const toplantiSonucuIdx = headers.indexOf('Toplantı Sonucu');
        if (toplantiSonucuIdx !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(CRM_CONFIG.MEETING_RESULT_OPTIONS, true)
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, toplantiSonucuIdx + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }

        // Add validation for Satış Potansiyeli
        const sPotIdx = headers.indexOf('Satış Potansiyeli');
        if (sPotIdx !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireValueInList(['Yerinde Satış', 'Sıcak', 'Orta', 'Soğuk'], true)
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, sPotIdx + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
        }

        // Add validation for Yeni Takip Tarihi (date)
        const yeniTakipIdx = headers.indexOf('Yeni Takip Tarihi');
        if (yeniTakipIdx !== -1) {
          const validation = SpreadsheetApp.newDataValidation()
            .requireDate()
            .setAllowInvalid(true)
            .build();
          sheet.getRange(2, yeniTakipIdx + 1, sheet.getLastRow() - 1, 1).setDataValidation(validation);
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
    // Full recolor regardless of performance flag
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
    
    if (String(sheetName||'').toLowerCase().includes('randevu')) {
      console.log('Applying color coding to Randevular/T Randevular');
      
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
        SpreadsheetApp.getUi().alert('✅ Tamamlandı', `${sheetName} renk kodlaması uygulandı`, SpreadsheetApp.getUi().ButtonSet.OK);
      } else {
        SpreadsheetApp.getUi().alert('❌ Hata', 'Randevu durumu sütunu bulunamadı', SpreadsheetApp.getUi().ButtonSet.OK);
      }
    } else if (String(sheetName||'').toLowerCase().includes('fırsat') || String(sheetName||'').toLowerCase().includes('firsat')) {
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
    } else if (String(sheetName || '').toLowerCase().includes('toplant')) {
      console.log('Applying color coding to Toplantılar');
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        applyColorCodingToManagerData(sheet, sheetName, 2, lastRow - 1);
        try { sortMeetingsSalesTop(sheet); } catch (e) { console.log('⚠️ sortMeetingsSalesTop skipped:', e && e.message); }
        SpreadsheetApp.getUi().alert('✅ Tamamlandı', 'Toplantılar renk + sıralama uygulandı', SpreadsheetApp.getUi().ButtonSet.OK);
      }
    } else if (String(sheetName || '').toLowerCase().includes('aktivite')) {
      console.log('Applying color coding to Aktivite sayfaları');
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        applyColorCodingToManagerData(sheet, sheetName, 2, lastRow - 1);
        SpreadsheetApp.getUi().alert('✅ Tamamlandı', `${sheetName} renk kodlaması uygulandı`, SpreadsheetApp.getUi().ButtonSet.OK);
      }
    } else {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Bu fonksiyon Randevular/Fırsatlar/Toplantılar/T Aktivite sayfalarında çalışır', SpreadsheetApp.getUi().ButtonSet.OK);
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
// collectAllData fonksiyonu kaldırıldı - artık gerekli değil
// Dashboard sistemi direkt temsilci dosyalarından veri çekiyor
// Senkronizasyon işlemleri için "Sırayla Ekle" ve "Odak" fonksiyonları kullanılıyor

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
        'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
        'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
        'Rating count', 'Review', 'Maplink'
      ];
    } else if (sourceLower.includes('toplant')) {
      targetColumns = [
        'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'İsim Soyisim',
        'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Toplantı Tarihi', 'Yeni Takip Tarihi', 'Toplantıyı Yapan',
        'Category', 'Website', 'Phone', 'Yetkili Tel', 'Mail', 'Randevu durumu', 'Randevu Tarihi',
        'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
        'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
        'Rating count', 'Review'
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
        let hasValidDate = false;
        
        // Start from index 1 to skip 'Kod' (employee code is added later)
        for (let j = 1; j < targetColumns.length; j++) {
          const columnName = targetColumns[j];
          let columnIndex = columnIndices[columnName];
          
          // Fallback mapping for common column name variations
          if (columnIndex === undefined) {
            const fallbackMappings = {
              'Company name': ['Company', 'Firma', 'Şirket'],
              'İsim Soyisim': ['İsim', 'Soyisim', 'Name', 'Contact'],
              'Randevu Tarihi': ['Tarih', 'Date', 'Randevu Tarih'],
              'Toplantı Tarihi': ['Tarih', 'Date', 'Toplantı Tarih'],
              'Saat': ['Time', 'Zaman'],
              'Randevu durumu': ['Durum', 'Status', 'Randevu Durum'],
              'Toplantı durumu': ['Durum', 'Status', 'Toplantı Durum'],
              'Phone': ['Telefon', 'Tel', 'Phone Number'],
              'Yetkili Tel': ['Yetkili Telefon', 'Contact Phone'],
              'Mail': ['Email', 'E-mail', 'E-posta'],
              'Location': ['Konum', 'Lokasyon'],
              'Website': ['URL', 'Web Site', 'Site'],
              'Category': ['Kategori', 'Kategorisi'],
              'Yorum': ['Comment', 'Not', 'Açıklama'],
              'Yönetici Not': ['Manager Note', 'Yönetici Notu'],
              'CMS Adı': ['CMS', 'CMS Name'],
              'CMS Grubu': ['CMS Group', 'CMS Kategorisi'],
              'E-Ticaret İzi': ['E-commerce', 'E-ticaret'],
              'Site Hızı': ['Site Speed', 'Hız'],
              'Site Trafiği': ['Site Traffic', 'Trafik'],
              'Toplantı formatı': ['Meeting Format', 'Format'],
              'Address': ['Adres', 'Adres'],
              'City': ['Şehir', 'İl'],
              'Rating count': ['Rating', 'Değerlendirme'],
              'Review': ['Yorum', 'İnceleme'],
              'Log': ['Activity Log', 'Aktivite Log']
            };
            
            if (fallbackMappings[columnName]) {
              for (const fallback of fallbackMappings[columnName]) {
                if (columnIndices[fallback] !== undefined) {
                  columnIndex = columnIndices[fallback];
                  break;
                }
              }
            }
          }
          
          if (columnIndex !== undefined) {
            let cellValue = row[columnIndex];
            if (columnName === 'Saat') {
              cellValue = formatTimeValue(cellValue);
            }
            if (columnName && columnName.includes('Tarihi')) {
              cellValue = formatDateValue(cellValue);
              // Tarih varsa geçerli satır olarak işaretle
              if (cellValue && cellValue !== '') {
                hasValidDate = true;
              }
            }
            if (columnName === 'Fırsat Durumu') {
              cellValue = normalizeOpportunityStatus(cellValue);
            }
            orderedRow.push(cellValue);
          } else {
            orderedRow.push('');
          }
        }
        
        // Sadece geçerli tarihi olan satırları ekle
        if (hasValidDate) {
          const rowData = { temsilciKodu: employeeCode, rowIndex: i + 2, data: orderedRow };
          data.push(rowData);
        }
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

    // Replace mode: Randevular'da yöneticinin girdiği alanları korumak için satırları silme
    if (effectiveMode !== 'append') {
      const baseLower = String(baseTypeForHeaders || '').toLowerCase();
      const isRandevuBase = baseLower.includes('randevu') && String(targetSheetName) === 'Randevular';
      if (!isRandevuBase) {
        clearEmployeeData(sheet, employeeCode);
      }
    }

    const opStats = { totalIncoming: data.length, sameCount: 0, updateCount: 0, newCount: 0 };

    if (data.length > 0) {
      const allData = [];
      for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        const rowDataCopy = [...rowData.data];
        rowDataCopy.unshift(rowData.temsilciKodu);
        allData.push(rowDataCopy);
      }

      // Upsert logic (restricted to same employee code)
      let rowsToAppend = [];
      const lastCol = sheet.getLastColumn();
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      const existing = sheet.getLastRow() > 1
        ? sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues()
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

      function canonicalCode(value) { return String(value || '').trim(); }
      function canonicalCompany(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
      function canonicalStatus(value) {
        const v = String(value || '').toLowerCase();
        if (v.includes('ilet')) return 'Fırsat İletildi';
        if (v.includes('bilgi')) return 'Bilgi Verildi';
        if (v.includes('yeniden') || v.includes('ara')) return 'Yeniden Aranacak';
        return String(value || '').trim();
      }
      function canonicalDate(value) { return formatDateValue(value); }

      function strictKey(row) {
        return [
          canonicalCode(idxCode >= 0 ? row[idxCode] : ''),
          canonicalCompany(idxCompany >= 0 ? row[idxCompany] : ''),
          canonicalStatus(idxStatus >= 0 ? row[idxStatus] : ''),
          canonicalDate(idxDate >= 0 ? row[idxDate] : '')
        ].join('||');
      }
      function softKey(row) {
        return [
          canonicalCode(idxCode >= 0 ? row[idxCode] : ''),
          canonicalCompany(idxCompany >= 0 ? row[idxCompany] : '')
        ].join('||');
      }

      // Normalized comparison helpers to avoid false updates
      function normalizeForCompare(value, headerName) {
        const name = String(headerName || '');
        if (/tarih/i.test(name)) {
          return String(formatDateValue(value) || '').trim();
        }
        if (/^saat$/i.test(name)) {
          return String(formatTimeValue(value) || '').trim();
        }
        const s = String(value == null ? '' : value);
        return s.replace(/\s+/g, ' ').trim();
      }
      const excludeCompareCols = ['Yönetici Not','Yonetici Not','CMS Adı','CMS Adi','CMS Grubu','E-Ticaret İzi','Site Hızı','Site Hizı','Site Hizi','Site Trafiği','Site Trafik','Log','Toplantı formatı','Address','City','Rating count','Review','Maplink','Toplantı Sonucu','Toplanti Sonucu','Teklif Detayı','Teklif Detayi','Satış Potansiyeli','Satis Potansiyeli','Toplantı Tarihi','Toplanti Tarihi','Yeni Takip Tarihi','Toplantıyı Yapan','Toplantiyi Yapan'];
      const loweredHeaders = headers.map(h => String(h || '').toLowerCase());
      const excludeIdxSet = new Set(excludeCompareCols.map(n => loweredHeaders.indexOf(String(n).toLowerCase())).filter(i => i >= 0));
      function areRowsEqualByColumns(currentDisplayRow, incomingRow) {
        for (let i = 0; i < headers.length; i++) {
          if (excludeIdxSet.has(i)) continue;
          const curNorm = normalizeForCompare(currentDisplayRow[i], headers[i]);
          const inNorm = normalizeForCompare(incomingRow[i], headers[i]);
          if (curNorm !== inNorm) return false;
        }
        return true;
      }

      const codeNorm = canonicalCode(employeeCode);

      // Build existing maps only for the same employee
      const strictMap = new Map();              // strictKey -> rowIndex
      const softMap = new Map();                // softKey -> rowIndex (or -1 if ambiguous)
      for (let i = 0; i < existing.length; i++) {
        const r = existing[i];
        if (canonicalCode(r[idxCode]) !== codeNorm) continue; // restrict to same employee
        const sKey = strictKey(r);
        strictMap.set(sKey, i + 2); // 2-based
        const soKey = softKey(r);
        if (!softMap.has(soKey)) softMap.set(soKey, i + 2);
        else softMap.set(soKey, i + 2); // prefer last occurrence (latest row) for update
      }

      const updates = []; // {rowIndex, values}

      for (const r of allData) {
        // ensure row's code is the intended employee code
        r[idxCode] = codeNorm;
        const sKey = strictKey(r);
        if (strictMap.has(sKey)) {
          const rowIndex = strictMap.get(sKey);
          const currentDisplay = sheet.getRange(rowIndex, 1, 1, lastCol).getDisplayValues()[0];
          const changed = !areRowsEqualByColumns(currentDisplay, r);
          if (changed) {
            try {
              const diffs = [];
              for (let i = 0; i < headers.length; i++) {
                if (excludeIdxSet.has(i)) continue;
                const curNorm = normalizeForCompare(currentDisplay[i], headers[i]);
                const inNorm = normalizeForCompare(r[i], headers[i]);
                if (curNorm !== inNorm) diffs.push({ col: headers[i], from: curNorm, to: inNorm });
              }
              if (diffs.length) console.log('🔍 Diff (strict match update)', { sheetName, employeeCode, rowIndex, diffs });
            } catch (_) {}
            updates.push({ rowIndex, values: r }); opStats.updateCount++;
          } else { opStats.sameCount++; }
          continue;
        }
        const soKey = softKey(r);
        if (softMap.has(soKey)) {
          const rowIndex = softMap.get(soKey);
          const currentDisplay = sheet.getRange(rowIndex, 1, 1, lastCol).getDisplayValues()[0];
          // Fırsatlar ve Randevular: tarih/statu değişimi olsa dahi append etme, mevcut satırı güncelle
          const baseLower = String(baseTypeForHeaders || '').toLowerCase();
          // Randevular: tarih/durum değişse bile mevcut satırı güncelle, append etme
          if (baseLower.includes('randevu')) {
            const changed = !areRowsEqualByColumns(currentDisplay, r);
            if (changed) {
              try {
                const diffs = [];
                for (let i = 0; i < headers.length; i++) {
                  if (excludeIdxSet.has(i)) continue;
                  const curNorm = normalizeForCompare(currentDisplay[i], headers[i]);
                  const inNorm = normalizeForCompare(r[i], headers[i]);
                  if (curNorm !== inNorm) diffs.push({ col: headers[i], from: curNorm, to: inNorm });
                }
                if (diffs.length) console.log('🔍 Diff (soft match update - Randevular)', { sheetName, employeeCode, rowIndex, diffs });
              } catch (_) {}
              updates.push({ rowIndex, values: r }); opStats.updateCount++;
            } else { opStats.sameCount++; }
            continue;
          }
          // Diğer sayfalar: tarih farklıysa yeni aktivite olarak ekle
          if (!(baseLower.includes('fırsat') || baseLower.includes('firsat')) && idxDate >= 0) {
            const existingDate = canonicalDate(currentDisplay[idxDate]);
            const incomingDate = canonicalDate(r[idxDate]);
            if (existingDate && incomingDate && existingDate !== incomingDate) {
              rowsToAppend.push(r);
              opStats.newCount++;
              continue;
            }
          }
          const changed = !areRowsEqualByColumns(currentDisplay, r);
          if (changed) {
            try {
              const diffs = [];
              for (let i = 0; i < headers.length; i++) {
                if (excludeIdxSet.has(i)) continue;
                const curNorm = normalizeForCompare(currentDisplay[i], headers[i]);
                const inNorm = normalizeForCompare(r[i], headers[i]);
                if (curNorm !== inNorm) diffs.push({ col: headers[i], from: curNorm, to: inNorm });
              }
              if (diffs.length) console.log('🔍 Diff (soft match update - others)', { sheetName, employeeCode, rowIndex, diffs });
            } catch (_) {}
            updates.push({ rowIndex, values: r }); opStats.updateCount++;
          } else { opStats.sameCount++; }
          continue;
        }
        rowsToAppend.push(r);
        opStats.newCount++;
      }

      // Apply updates
      for (const u of updates) {
        // Randevular ana sayfasında (yönetici) kullanıcı tarafından girilen alanları koru
        const baseLower = String(baseTypeForHeaders || '').toLowerCase();
        const isManagerRandevular = baseLower.includes('randevu') && String(targetSheetName) === 'Randevular';
        if (isManagerRandevular) {
          const headersNow = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
          const lowered = headersNow.map(h => String(h||'').toLowerCase());
          const protectCols = ['Toplantı Sonucu','Toplanti Sonucu','Toplantı sonucu','Toplanti sonucu','Teklif Detayı','Teklif Detayi','Satış Potansiyeli','Satis Potansiyeli','Toplantı Tarihi','Toplanti Tarihi','Yeni Takip Tarihi','Toplantıyı Yapan','Toplantiyi Yapan','Yönetici Not','Yonetici Not'];
          const protectedIdx = protectCols.map(n => lowered.indexOf(String(n).toLowerCase())).filter(i => i >= 0);
          const currentRow = sheet.getRange(u.rowIndex, 1, 1, lastCol).getValues()[0];
          protectedIdx.forEach(i => { u.values[i] = currentRow[i]; });
        }
        sheet.getRange(u.rowIndex, 1, 1, lastCol).setValues([u.values]);
        // Renkler en sonda topluca uygulanacak
      }

              // Apply appends
        if (rowsToAppend.length > 0 && rowsToAppend[0].length > 0) {
          const startRow = sheet.getLastRow() + 1;
          sheet.getRange(startRow, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
          
          // Renk kodlaması uygula - TÜM SAYFALAR İÇİN
          console.log(`🎨 Appended ${rowsToAppend.length} rows to ${sheet.getName()} (colors will be applied after all ops)`);
        }

      // Per-sheet formatting/validation only for touched sheet
      optimizeColumnWidths(sheet, baseTypeForHeaders);
            applyManagerSheetDataValidation(sheet, baseTypeForHeaders);
     try { sheet.setConditionalFormatRules([]); } catch (e) {}

      // Deduplicate only for Toplantılar to avoid collapsing distinct opportunity/appointment actions
      try {
        const lowerBase = String(baseTypeForHeaders || '').toLowerCase();
        if (lowerBase.includes('toplant')) {
          removeDuplicatesInAggregateSheet(sheet, baseTypeForHeaders);
        }
      } catch (_) {}

      // Sorting for aggregate sheets
      try {
        const lastRow = sheet.getLastRow();
        if (lastRow > 2) {
          const lowerBase = String(baseTypeForHeaders || '').toLowerCase();
          // For T Randevular and T Toplantılar: sort by date, but in meetings keep 'Satış Yapıldı' on top
          if (lowerBase.includes('randevu')) {
            const statusIdx = findIdx(['Randevu durumu','Durum']);
            const dateIdx = findIdx(['Randevu Tarihi','Tarih']);
            const timeIdx = findIdx(['Saat']);
            const rng = sheet.getRange(2, 1, lastRow - 1, lastCol);
            const values = rng.getValues();
            function getActDate(row){
              if (dateIdx>=0) {
                const v = row[dateIdx];
                if (v instanceof Date && !isNaN(v.getTime())) return v;
                const d1 = parseDdMmYyyy(v);
                if (d1) return d1;
                const d2 = new Date(v);
                if (!isNaN(d2.getTime())) return d2;
              }
              return new Date('2099-12-31');
            }
            function parseTime(v){
              if (v instanceof Date && !isNaN(v.getTime())) return v.getHours()*60+v.getMinutes();
              const s = String(v || '').trim();
              const m = s.match(/^(\d{1,2}):(\d{2})/);
              if (m) return Number(m[1])*60 + Number(m[2]);
              return 0;
            }
            function groupRank(row){
              const s = String(statusIdx>=0 ? row[statusIdx] : '').toLowerCase();
              if (s.includes('iptal')) return 0; // Randevu İptal oldu
              if (s.includes('erte')) return 1; // Randevu Ertelendi
              if (s.includes('teyit')) return 2; // Randevu Teyitlendi
              if (s.includes('randevu al')) return 3; // Randevu Alındı
              if (s.includes('ileri')) return 4; // İleri Tarih Randevu
              return 5; // diğerleri
            }
            values.sort(function(a,b){
              const ra = groupRank(a);
              const rb = groupRank(b);
              if (ra !== rb) return ra - rb;
              const da = getActDate(a);
              const db = getActDate(b);
              if (da.getTime() !== db.getTime()) return da - db;
              if (timeIdx >= 0) return parseTime(a[timeIdx]) - parseTime(b[timeIdx]);
              return 0;
            });
            rng.setValues(values);
          } else if (lowerBase.includes('fırsat') || lowerBase.includes('firsat')) {
            const dateIdx = findIdx(['Fırsat Tarihi','Firsat Tarihi','Tarih']);
            const logIdx = findIdx(['Log']);
            const rng = sheet.getRange(2, 1, lastRow - 1, lastCol);
            const values = rng.getValues();
            function parseDd2(s){
              const v = String(s||'').trim();
              const m = v.match(/(\d{2}\.\d{2}\.\d{4})/);
              if (m) {
                const [dd,mm,yy] = m[1].split('.');
                const d = new Date(Number(yy), Number(mm)-1, Number(dd));
                if (!isNaN(d.getTime())) return d;
              }
              return null;
            }
            function getDate(row){
              const dLog = logIdx>=0 ? parseDd2(row[logIdx]) : null;
              if (dLog) return dLog;
              if (dateIdx>=0) {
                const d = parseDdMmYyyy(row[dateIdx]);
                if (d) return d;
              }
              // Tarihsiz satırları en sona koy (2100 yerine 2099 kullan)
              return new Date('2099-12-31');
            }
            values.sort(function(a,b){
              const da = getDate(a);
              const db = getDate(b);
              return da - db;
            });
            rng.setValues(values);
          } else if (lowerBase.includes('toplant')) {
            // Sadece T Toplantılar için çalıştır
            if (!/^T\s/i.test(sheet.getName())) {
              // Yönetici ana Toplantılar sayfasında sıralama yapma
            }
            // Toplantılar (append): Öncelik: Satış Yapıldı > Yerinde Satış > Sıcak > Orta > Soğuk > Tarih
            const resultIdx = findIdx(['Toplantı Sonucu']);
            const dateIdx = findIdx(['Toplantı Tarihi']);
            const potIdx = findIdx(['Satış Potansiyeli']);
            if (resultIdx >= 0 && dateIdx >= 0) {
              const rng = sheet.getRange(2, 1, lastRow - 1, lastCol);
              const values = rng.getValues();
              function potRank(v){
                const s = String(v||'').toLowerCase();
                if (s === 'yerinde satış' || s === 'yerinde satis') return 1; // satıştan hemen sonra
                if (s === 'sıcak' || s === 'sicak') return 2;
                if (s === 'orta') return 3;
                if (s === 'soğuk' || s === 'soguk') return 4;
                return 9;
              }
              values.sort(function(a,b){
                const aRes = String(a[resultIdx]||'');
                const bRes = String(b[resultIdx]||'');
                const aSale = aRes === 'Satış Yapıldı' ? 0 : 1;
                const bSale = bRes === 'Satış Yapıldı' ? 0 : 1;
                if (aSale !== bSale) return aSale - bSale; // Satış Yapıldı en üstte
                if (potIdx >= 0) {
                  const ar = potRank(a[potIdx]);
                  const br = potRank(b[potIdx]);
                  if (ar !== br) return ar - br;
                }
                const da = parseDdMmYyyy(a[dateIdx]) || new Date('2100-12-31');
                const db = parseDdMmYyyy(b[dateIdx]) || new Date('2100-12-31');
                return da - db;
              });
              rng.setValues(values);
            }
          } else if (idxCode >= 0) {
            // Other aggregate sheets: keep grouped by code
            sheet.getRange(2, 1, lastRow - 1, lastCol).sort([{ column: idxCode + 1, ascending: true }]);
          }
        }
      } catch (sortErr) {
        console.log('⚠️ Sorting skipped:', sortErr && sortErr.message);
      }
    }

    // Final: apply colors after all operations to prevent late overrides
    try {
      const lr = sheet.getLastRow();
      if (lr > 1) {
        // Tüm sayfa için renklendirmeyi uygula (görünür olma şartı olmadan)
        applyColorCodingToManagerData(sheet, sheet.getName(), 2, lr - 1);
      }
    } catch (finalColErr) {
      console.log('⚠️ Final recolor skipped:', finalColErr && finalColErr.message);
    }

    return opStats;
  } catch (error) {
    console.error(`❌ Error updating manager sheet ${sheetName}:`, error);
    return { totalIncoming: data ? data.length : 0, sameCount: 0, updateCount: 0, newCount: 0 };
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
          'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
          'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
          'Rating count', 'Review', 'Maplink'
        ];
        break;
      case 'Toplantılar':
        headers = [
          'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'İsim Soyisim',
          'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Toplantı Tarihi', 'Yeni Takip Tarihi', 'Toplantıyı Yapan',
          'Category', 'Website', 'Phone', 'Yetkili Tel', 'Mail', 'Randevu durumu', 'Randevu Tarihi',
          'Saat', 'Yorum', 'Yönetici Not', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
          'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
          'Rating count', 'Review'
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
    function extractDateFromLog(logValue) {
      try {
        const s = String(logValue || '');
        const m = s.match(/(\d{2}\.\d{2}\.\d{4})/);
        if (m && m[1]) {
          return parseDdMmYyyy(m[1]);
        }
        return null;
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
        for (const [sheetName, recordInfo] of Object.entries(stats.sheetStats)) {
          const recordCount = typeof recordInfo === 'number' ? recordInfo : (recordInfo.totalIncoming || 0);

          let minDate = null;
          let maxDate = null;
          try {
            const sheet = ss.getSheetByName(sheetName);
            if (sheet && sheet.getLastRow() > 1) {
              const lastCol = sheet.getLastColumn();
              const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

              // Date column per sheet (tolerant of prefixes like 'T ')
              const lowerName = String(sheetName || '').toLowerCase();
              let dateHeader = '';
              if (lowerName.includes('randevu')) dateHeader = 'Randevu Tarihi';
              else if (lowerName.includes('fırsat') || lowerName.includes('firsat')) dateHeader = 'Fırsat Tarihi';
              else if (lowerName.includes('toplant')) dateHeader = 'Toplantı Tarihi';
              else dateHeader = 'Tarih';
              const dateIdx = headers.indexOf(dateHeader);

              // Employee code column can be 'Temsilci Kodu' or 'Kod'
              let codeIdx = headers.indexOf('Temsilci Kodu');
              if (codeIdx === -1) codeIdx = headers.indexOf('Kod');

              // Prefer activity date from Log
              const logIdx = headers.indexOf('Log');

              if (codeIdx !== -1) {
                const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getValues();
                for (let i = 0; i < values.length; i++) {
                  const row = values[i];
                  if (String(row[codeIdx]) !== String(employeeCode)) continue;

                  let activityDate = null;
                  if (logIdx !== -1) {
                    activityDate = extractDateFromLog(row[logIdx]);
                  }
                  if (!activityDate && dateIdx !== -1) {
                    activityDate = parseDdMmYyyy(row[dateIdx]);
                  }
                  if (!activityDate) continue;

                  if (!minDate || activityDate < minDate) minDate = activityDate;
                  if (!maxDate || activityDate > maxDate) maxDate = activityDate;
                }
              }
            }
          } catch (innerErr) {
            console.log('⚠️ Date range computation error:', { employeeCode, sheetName, error: innerErr && innerErr.message });
          }

          // Update overall range
          if (minDate && (!overallMin || minDate < overallMin)) overallMin = minDate;
          if (maxDate && (!overallMax || maxDate > overallMax)) overallMax = maxDate;

          const breakdownCounts = (typeof recordInfo === 'object')
            ? ` (Eklendi: ${recordInfo.newCount || 0}, Güncellendi: ${recordInfo.updateCount || 0}, Aynı: ${recordInfo.sameCount || 0})`
            : '';

          if (minDate && maxDate) {
            breakdownLines.push(`  - ${sheetName}: ${recordCount} kayıt${breakdownCounts} (Tarih: ${formatDdMmYyyy(minDate)} – ${formatDdMmYyyy(maxDate)})`);
          } else {
            breakdownLines.push(`  - ${sheetName}: ${recordCount} kayıt${breakdownCounts}`);
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

// Konfiğurasyon dosyaları için senkronizasyon
const EMPLOYEE_FILES = {
  'LG 001': '1JdU8uIXOcmSQ1c70OOklcR97tqdmDTeCeikpa8DHltE',
  'NT 002': '1Q6IIfbIlTTM8hf1Nv67KLiHGzoAJUBWIhp7rOel9ngQ',
  'KO 003': '1uLufPJqFSfm1WxqSzcvDOKW_hAv8AMhkQwljeiD51mc',
  'SB 004': '17RWqUrQ_m9h0ktJQ_E_55dt-Ao-RA01O6pUFbZ9DxDs',
  'KM 005': '15mwfzEBth_qIDEA8WofxOR5T3P8s-rMcMaLheBoV9uI',
  'GŞ 006': '1XiIyORsVR14hMNu7xJjLs2wHxBYmDskGCzCHGb0IwN8',
  'BH 007': '1X0k3uUh7KoiywGO3ewg7ULMAWOrY86I2NCBV7zaHUus',
  'TD 008': '1tokFq-zPejBe-Npc1f4RHlRC15tgHn57qJIIIeVdXtQ'
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

// Güvenli kapsayıcılar – eğer mevcut ise çağrıcıları çağır; aksi takdirde bilgi göster
function generateDailyReportAutoSeriesManager(options) {
  console.log('Function started:', options || {});
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName('Günlük Seri');
    let lastDate = null;
    if (sh && sh.getLastRow() > 1) {
      // Find the max date key in column A
      const vals = sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(r => r[0]).filter(Boolean);
      if (vals.length > 0) {
        const dates = vals.map(v => parseDdMmYyyy(String(v))).filter(Boolean);
        if (dates.length > 0) {
          dates.sort((a,b)=>b-a);
          lastDate = dates[0];
        }
      }
    }
    const today = new Date(); today.setHours(0,0,0,0);
    let days = 7;
    if (lastDate) {
      // Generate from lastDate+1 to today (inclusive)
      const diffMs = today.getTime() - lastDate.getTime();
      const diffDays = Math.floor(diffMs / (24*3600*1000));
      days = Math.max(1, Math.min(90, diffDays));
    }
    return generateDailyReportSeriesManager({ days });
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
 
    // Canonicalizers to avoid duplicate keys due to format/case differences
    function canonCode(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().toUpperCase(); }
    function canonCompany(v) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().toLowerCase(); }
    function canonDate(v) { return formatDateValue(v) || ''; }
    function canonStatus(v) {
      const s = String(v || '').toLowerCase();
      if (baseSheetName === 'Fırsatlar') {
        if (s.indexOf('ilet') !== -1) return 'fırsat iletildi';
        if (s.indexOf('bilgi') !== -1) return 'bilgi verildi';
        if (s.indexOf('yeniden') !== -1 || s.indexOf('ara') !== -1) return 'yeniden aranacak';
      }
      // For randevu/toplantı use lowercased trimmed status
      return s.replace(/\s+/g, ' ').trim();
    }
 
    function strictKeyFromArray(arr) {
      const parts = [
        iCode >= 0 ? canonCode(arr[iCode]) : '',
        iComp >= 0 ? canonCompany(arr[iComp]) : '',
        iDate >= 0 ? canonDate(arr[iDate]) : '',
        iStatus >= 0 ? canonStatus(arr[iStatus]) : ''
      ];
      return parts.join('||');
    }
    function softKeyFromArray(arr) {
      const parts = [
        iCode >= 0 ? canonCode(arr[iCode]) : '',
        iComp >= 0 ? canonCompany(arr[iComp]) : ''
      ];
      return parts.join('||');
    }
 
    // Build existing index maps (key -> rowIndex) for same employee only
    const employeeCodeNorm = canonCode(employeeCode);
    const existingRowsCount = sheet.getLastRow() > 1 ? sheet.getLastRow() - 1 : 0;
    const existingValues = existingRowsCount > 0 ? sheet.getRange(2, 1, existingRowsCount, lastColT).getValues() : [];
    const strictMap = new Map();
    const softMap = new Map(); // softKey -> rowIndex (or -1 if ambiguous)
    for (let r = 0; r < existingValues.length; r++) {
      const arr = existingValues[r];
      if (canonCode(arr[iCode]) !== employeeCodeNorm) continue; // only same employee
      const sKey = strictKeyFromArray(arr);
      strictMap.set(sKey, r + 2);
      const soKey = softKeyFromArray(arr);
      if (!softMap.has(soKey)) softMap.set(soKey, r + 2); else softMap.set(soKey, -1);
    }
 
    let sameCount = 0, updateCount = 0, newCount = 0;
    const rowsToAppend = [];
    const updates = []; // {rowIndex, values}
 
    // Ensure uniqueness also within the incoming batch
    const seenIncomingStrictKeys = new Set();
    const seenIncomingSoftKeys = new Set();
 
    // Prepare each incoming row against existing
    for (let i = 0; i < data.length; i++) {
      const rowData = data[i];
      const rowCopy = [...rowData.data];
      rowCopy.unshift(rowData.temsilciKodu); // first column code
 
      // Ensure target row length equals header length
      while (rowCopy.length < headersT.length) rowCopy.push('');
      if (rowCopy.length > headersT.length) rowCopy.length = headersT.length;
 
      // Force canonical employee code in target row
      if (iCode >= 0) rowCopy[iCode] = employeeCodeNorm;
 
      const sKey = strictKeyFromArray(rowCopy);
      const soKey = softKeyFromArray(rowCopy);
 
      if (strictMap.has(sKey)) {
        const targetRow = strictMap.get(sKey);
        const current = sheet.getRange(targetRow, 1, 1, lastColT).getValues()[0];
        const changed = current.some((v, idx) => String(v) !== String(rowCopy[idx]));
        if (changed) { updates.push({ rowIndex: targetRow, values: rowCopy }); updateCount++; }
        else { sameCount++; }
        seenIncomingStrictKeys.add(sKey);
        continue;
      }
 
      // Soft fallback: update single matched company for same employee
      if (softMap.has(soKey) && softMap.get(soKey) > 0) {
        const targetRow = softMap.get(soKey);
        const current = sheet.getRange(targetRow, 1, 1, lastColT).getValues()[0];
        const changed = current.some((v, idx) => String(v) !== String(rowCopy[idx]));
        if (changed) { updates.push({ rowIndex: targetRow, values: rowCopy }); updateCount++; }
        else { sameCount++; }
        seenIncomingSoftKeys.add(soKey);
        continue;
      }
 
      // Append if neither strict nor unique soft match exists (and not duplicated in the same batch)
      if (!seenIncomingStrictKeys.has(sKey) && !seenIncomingSoftKeys.has(soKey)) {
        rowsToAppend.push(rowCopy);
        seenIncomingStrictKeys.add(sKey);
        seenIncomingSoftKeys.add(soKey);
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
      sheet.getRange(startRow, 1, rowsToAppend.length, lastColT).setValues(rowsToAppend.map(r => {
        const rc = [...r];
        while (rc.length < lastColT) rc.push('');
        if (rc.length > lastColT) rc.length = lastColT;
        return rc;
      }));
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

// Bu izole fonksiyonları kaldırıldı - kullanılmıyor

function moveSelectedRandevuToMeeting() {
  console.log('Function started:', {});
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const nameLower = String(sheet && sheet.getName ? sheet.getName() : '').toLowerCase();
    if (!sheet || !nameLower.includes('randevu')) {
      SpreadsheetApp.getUi().alert('Bilgi', 'Lütfen Randevular veya T Randevular sayfasında bir satır seçin.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const range = sheet.getActiveRange();
    if (!range || range.getNumRows() !== 1 || range.getRow() <= 1) {
      SpreadsheetApp.getUi().alert('Bilgi', 'Lütfen başlık dışında tek bir veri satırı seçin.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const rowIndex = range.getRow();
    copyRandevuRowToToplantilar(sheet, rowIndex, { navigateToMeetings: true });
    console.log('Processing complete:', { rowIndex });
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function copyRandevuRowToToplantilar(randevularSheet, rowIndex, options) {
  console.log('Function started:', { rowIndex });
  try {
    const ss = randevularSheet.getParent();
    // Hedef sayfa: her zaman 'T Toplantılar'
    let toplantilarSheet = ss.getSheetByName('T Toplantılar');
    if (!toplantilarSheet) {
      toplantilarSheet = ss.insertSheet('T Toplantılar');
      createManagerSheetHeaders(toplantilarSheet, 'Toplantılar');
    }

    // Ensure schema has all required columns
    toplantilarSheet = ensureToplantilarSchema(ss, 'T Toplantılar');

    const lastColR = randevularSheet.getLastColumn();
    const headersR = randevularSheet.getRange(1, 1, 1, lastColR).getValues()[0];
    const rowR = randevularSheet.getRange(rowIndex, 1, 1, lastColR).getValues()[0];

    const lastColT = toplantilarSheet.getLastColumn();
    const headersT = toplantilarSheet.getRange(1, 1, 1, lastColT).getValues()[0];

    function idxR(name) { return headersR.indexOf(name); }
    function idxT(name) { return headersT.indexOf(name); }
    function findIdxInsensitive(arr, candidates) {
      const lower = arr.map(h => String(h || '').trim().toLowerCase());
      for (const cand of candidates) {
        const i = lower.indexOf(String(cand).toLowerCase());
        if (i !== -1) return i;
      }
      return -1;
    }

    const output = new Array(headersT.length).fill('');

    // Map common fields by exact header if exists (display values)
    const headersRDisplay = randevularSheet.getRange(1,1,1,lastColR).getDisplayValues()[0];
    headersT.forEach((h, i) => {
      const srcIdx = headersRDisplay.indexOf(h);
      if (srcIdx !== -1) output[i] = rowR[srcIdx];
    });

    // Comprehensive mappings to align all possible header names
    const mapPairs = [
      // Kod mappings
      ['Kod', 'Kod'],
      ['Kod', 'Temsilci Kodu'],
      ['Temsilci Kodu', 'Kod'],
      ['Temsilci Kodu', 'Temsilci Kodu'],
      
      // Company mappings
      ['Company name', 'Company name'],
      ['Company', 'Company name'],
      ['Company name', 'Company'],
      
      // İsim mappings
      ['İsim Soyisim', 'İsim Soyisim'],
      ['İsim', 'İsim Soyisim'],
      ['Soyisim', 'İsim Soyisim'],
      
      // Tarih mappings
      ['Randevu Tarihi', 'Randevu Tarihi'],
      ['Toplantı Tarihi', 'Toplantı Tarihi'],
      ['Tarih', 'Randevu Tarihi'],
      ['Tarih', 'Toplantı Tarihi'],
      
      // Saat mappings
      ['Saat', 'Saat'],
      ['Time', 'Saat'],
      
      // Durum mappings
      ['Randevu durumu', 'Randevu durumu'],
      ['Durum', 'Randevu durumu'],
      ['Status', 'Randevu durumu'],
      
      // Toplantı mappings
      ['Toplantı Sonucu', 'Toplantı Sonucu'],
      ['Toplantı formatı', 'Toplantı formatı'],
      ['Meeting Result', 'Toplantı Sonucu'],
      ['Meeting Format', 'Toplantı formatı'],
      
      // Contact mappings
      ['Phone', 'Phone'],
      ['Yetkili Tel', 'Yetkili Tel'],
      ['Mail', 'Mail'],
      ['Email', 'Mail'],
      
      // Location mappings
      ['Location', 'Location'],
      ['Address', 'Address'],
      ['City', 'City'],
      
      // Website mappings
      ['Website', 'Website'],
      ['URL', 'Website'],
      
      // Category mappings
      ['Category', 'Category'],
      ['Kategori', 'Category'],
      
      // Comment mappings
      ['Yorum', 'Yorum'],
      ['Comment', 'Yorum'],
      ['Yönetici Not', 'Yönetici Not'],
      ['Manager Note', 'Yönetici Not'],
      
      // CMS mappings
      ['CMS Adı', 'CMS Adı'],
      ['CMS Grubu', 'CMS Grubu'],
      ['E-Ticaret İzi', 'E-Ticaret İzi'],
      
      // Performance mappings
      ['Site Hızı', 'Site Hızı'],
      ['Site Trafiği', 'Site Trafiği'],
      ['Rating count', 'Rating count'],
      ['Review', 'Review'],
      
      // Log mappings
      ['Log', 'Log'],
      ['Activity Log', 'Log']
    ];
    
    mapPairs.forEach(([dst, src]) => {
      const si = idxR(src);
      const di = idxT(dst);
      if (si !== -1 && di !== -1 && (output[di] === '' || output[di] === undefined)) {
        output[di] = rowR[si];
      }
    });

    // Force-assign Kod from source (case-insensitive search) if still empty
    const iKodDst = idxT('Kod') !== -1 ? idxT('Kod') : idxT('Temsilci Kodu');
    if (iKodDst !== -1 && (output[iKodDst] === '' || output[iKodDst] === undefined)) {
      const srcCodeIdx = findIdxInsensitive(headersR, ['Kod','Temsilci Kodu']);
      if (srcCodeIdx !== -1) output[iKodDst] = rowR[srcCodeIdx];
    }

    // Sanitize placeholder times (e.g., 30.12.1899)
    const iSaat = idxT('Saat');
    if (iSaat !== -1) {
      const v = output[iSaat];
      if (String(v) === '30.12.1899' || (v instanceof Date && v.getFullYear && v.getFullYear() === 1899)) {
        output[iSaat] = '';
      }
    }

    // Set required defaults
    const dDurum = idxT('Toplantı durumu');
    if (dDurum !== -1) output[dDurum] = 'Toplantı Tamamlandı';

    // Upsert: avoid duplicates (by Kod + Company name + Toplantı Tarihi). If tarih boşsa Kod+Company ile güncelle.
    let iKodKey = idxT('Kod') !== -1 ? idxT('Kod') : idxT('Temsilci Kodu');
    const iComp = idxT('Company name');
    const iDate = idxT('Toplantı Tarihi');

    const keyStrict = [output[iKodKey] || rowR[idxR('Kod')] || rowR[idxR('Temsilci Kodu')], output[iComp], output[iDate]].join('||');

    let existingRow = -1;
    const existing = toplantilarSheet.getLastRow() > 1 ? toplantilarSheet.getRange(2, 1, toplantilarSheet.getLastRow() - 1, lastColT).getValues() : [];
    for (let i = 0; i < existing.length; i++) {
      const r = existing[i];
      const k = [r[iKodKey], r[iComp], r[iDate]].join('||');
      if (k === keyStrict) { existingRow = i + 2; break; }
    }
    // Soft match if date empty/changed: match by code+company
    if (existingRow === -1) {
      const softKey = [output[iKodKey] || rowR[idxR('Kod')] || rowR[idxR('Temsilci Kodu')], output[iComp]].join('||');
      for (let i = 0; i < existing.length; i++) {
        const r = existing[i];
        const kSoft = [r[iKodKey], r[iComp]].join('||');
        if (kSoft === softKey) { existingRow = i + 2; break; }
      }
    }

    if (existingRow === -1) {
      const startRow = toplantilarSheet.getLastRow() + 1;
      toplantilarSheet.getRange(startRow, 1, 1, output.length).setValues([output]);
      if (getOnlyColorTouchedRowsFlag()) {
        applyColorCodingToManagerData(toplantilarSheet, 'Toplantılar', startRow, 1);
      }
    } else {
      toplantilarSheet.getRange(existingRow, 1, 1, output.length).setValues([output]);
      if (getOnlyColorTouchedRowsFlag()) {
        applyColorCodingToManagerData(toplantilarSheet, 'Toplantılar', existingRow, 1);
      }
    }

    // Sıralama: her iki sayfada da uygula (T Toplantılar ve Toplantılar)
    sortMeetingsSalesTop(toplantilarSheet);

    optimizeColumnWidths(toplantilarSheet, 'Toplantılar');
    applyManagerSheetDataValidation(toplantilarSheet, 'Toplantılar');

    // Görsel geri bildirim: Kaynak satırın randevu DURUMUNA göre rengi korunsun; sadece stil vurgusu yap
    try {
      applyColorCodingToManagerData(randevularSheet, 'Randevular', rowIndex, 1);
      const srcRange = randevularSheet.getRange(rowIndex, 1, 1, randevularSheet.getLastColumn());
      srcRange.setFontStyle('italic').setFontWeight('bold');
    } catch (colorErr) {
      console.log('⚠️ Source row style highlight failed:', colorErr && colorErr.message);
    }

    // Temsilci dosyasına da yansıt (anında geri yazma)
    try {
      // Temsilci kodunu randevudan al
      var empCodeIdx = findIdxInsensitive(headersR, ['Kod','Temsilci Kodu']);
      var employeeCode = empCodeIdx !== -1 ? String(rowR[empCodeIdx] || '').trim() : '';
      if (employeeCode) {
        var employeeFile = findEmployeeFile(employeeCode);
        if (employeeFile) {
          var empSheet = employeeFile.getSheetByName('Toplantılar');
          if (!empSheet) { empSheet = employeeFile.insertSheet('Toplantılar'); }
          empSheet = ensureToplantilarSchema(employeeFile, 'Toplantılar');

          var lastColE = empSheet.getLastColumn();
          var headersE = empSheet.getRange(1, 1, 1, lastColE).getValues()[0];
          function idxE(name){ return headersE.indexOf(name); }

          // Çıkış dizisi: temsilci sayfasının başlıklarına göre doldur
          var empOut = new Array(headersE.length).fill('');
          // Birebir eşleşen başlıkları kopyala
          headersE.forEach(function(h,i){ var sIdx=headersR.indexOf(h); if (sIdx!==-1) empOut[i]=rowR[sIdx]; });
          // Farklı isimli başlıklar için eşleştirme
          var pairs = [
            ['Kod','Kod'],
            ['Kod','Temsilci Kodu'],
            ['Randevu durumu','Randevu durumu'],
            ['Randevu Tarihi','Randevu Tarihi'],
            ['Toplantı Tarihi','Toplantı Tarihi'],
            ['Saat','Saat'],
            ['Toplantı Sonucu','Toplantı Sonucu'],
            ['Toplantı formatı','Toplantı formatı']
          ];
          pairs.forEach(function(p){ var di=idxE(p[0]); var si=idxR(p[1]); if (di!==-1 && si!==-1) empOut[di]=rowR[si]; });
          // Varsayılan toplantı durumu
          var eDur = idxE('Toplantı durumu'); if (eDur!==-1 && !empOut[eDur]) empOut[eDur]='Toplantı Tamamlandı';
          // Saat temizleme
          var eSaat = idxE('Saat'); if (eSaat!==-1){ var vv=empOut[eSaat]; if (String(vv)==='30.12.1899' || (vv instanceof Date && vv.getFullYear && vv.getFullYear()===1899)) empOut[eSaat]=''; }

          // Unique key: Kod + Company name + Toplantı Tarihi (yoksa Kod+Company)
          var eKod = idxE('Kod')!==-1? idxE('Kod'): idxE('Temsilci Kodu');
          var eComp = idxE('Company name');
          var eDate = idxE('Toplantı Tarihi');
          var eKey = [empOut[eKod] || rowR[idxR('Kod')] || rowR[idxR('Temsilci Kodu')], empOut[eComp], empOut[eDate]].join('||');

          var eExisting = empSheet.getLastRow()>1? empSheet.getRange(2,1,empSheet.getLastRow()-1,lastColE).getValues(): [];
          var eRow = -1;
          for (var i2=0;i2<eExisting.length;i2++){ var rr=eExisting[i2]; var kk=[rr[eKod], rr[eComp], rr[eDate]].join('||'); if (kk===eKey){ eRow=i2+2; break; } }
          if (eRow===-1){
            // Soft key fallback
            var softKey = [empOut[eKod] || rowR[idxR('Kod')] || rowR[idxR('Temsilci Kodu')], empOut[eComp]].join('||');
            for (var i3=0;i3<eExisting.length;i3++){ var rr2=eExisting[i3]; var kk2=[rr2[eKod], rr2[eComp]].join('||'); if (kk2===softKey){ eRow=i3+2; break; } }
          }
          if (eRow===-1){
            var eStart = empSheet.getLastRow()+1;
            empSheet.getRange(eStart,1,1,empOut.length).setValues([empOut]);
            if (getOnlyColorTouchedRowsFlag()) applyColorCodingToManagerData(empSheet, 'Toplantılar', eStart, 1);
          } else {
            empSheet.getRange(eRow,1,1,empOut.length).setValues([empOut]);
            if (getOnlyColorTouchedRowsFlag()) applyColorCodingToManagerData(empSheet, 'Toplantılar', eRow, 1);
          }
          optimizeColumnWidths(empSheet, 'Toplantılar');
          applyManagerSheetDataValidation(empSheet, 'Toplantılar');
        } else {
          console.log('⚠️ Employee file not found for code:', employeeCode);
        }
      }
    } catch (mirrorErr) {
      console.log('⚠️ Mirror to employee failed:', mirrorErr && mirrorErr.message);
    }

    // Navigasyon: İsteğe bağlı toplantılar sayfasına geç veya randevularda kal
    try {
      const wantsNav = options && options.navigateToMeetings;
      if (wantsNav) {
        ss.setActiveSheet(toplantilarSheet);
        toplantilarSheet.setActiveSelection(toplantilarSheet.getRange(Math.max(2, toplantilarSheet.getLastRow()), 1));
      } else {
        ss.setActiveSheet(randevularSheet);
        randevularSheet.setActiveSelection(randevularSheet.getRange(rowIndex, 1));
      }
    } catch (navErr) {
      console.log('⚠️ Navigation restore failed:', navErr && navErr.message);
    }

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
    if (!sheet) return;

    const nameLower = String(sheet.getName() || '').toLowerCase();
    // Only handle Randevular or Toplantılar
    if (!nameLower.includes('randevu') && !nameLower.includes('toplant')) return;

    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    const editedCol = e.range.getColumn();
    const header = headers[editedCol - 1] || '';
    const headerLower = String(header).toLowerCase();

    function idxOf(names){
      const lowered = headers.map(h => String(h||'').toLowerCase());
      for (const n of names){ const i = lowered.indexOf(String(n).toLowerCase()); if (i!==-1) return i; }
      return -1;
    }

    // Interested in meeting-related edits
    const isMeetingResult = headerLower.indexOf('toplantı sonucu') !== -1 || headerLower.indexOf('toplanti sonucu') !== -1;
    const isMeetingDate = headerLower.indexOf('toplantı tarihi') !== -1 || headerLower.indexOf('toplanti tarihi') !== -1;
    const isRandevuStatus = headerLower.indexOf('randevu durumu') !== -1 || headerLower.indexOf('randevu') !== -1;
    if (!(isMeetingResult || isMeetingDate || isRandevuStatus)) return;

    const rowIndex = e.range.getRow();
    if (rowIndex <= 1) return;

    const idxSonuc = idxOf(['Toplantı Sonucu','Toplanti Sonucu']);
    const idxTarih = idxOf(['Toplantı Tarihi','Toplanti Tarihi']);

    // If meeting result cleared, clear its date and recolor, then stop
    if (isMeetingResult && (!e.value || String(e.value).trim() === '')) {
      if (idxTarih !== -1) sheet.getRange(rowIndex, idxTarih + 1).clearContent();
      applyColorCodingToManagerData(sheet, sheet.getName(), rowIndex, 1);
      // Yeni: kursiv/kalın stilini sıfırla
      try { sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).setFontStyle('normal').setFontWeight('normal'); } catch (styleResetErr) {}
      return;
    }

    // If result chosen but meeting date empty, set today's date automatically
    if (isMeetingResult && idxTarih !== -1) {
      const curDate = sheet.getRange(rowIndex, idxTarih + 1).getValue();
      if (!curDate) {
        const today = new Date();
        sheet.getRange(rowIndex, idxTarih + 1).setValue(today);
      }
    }

    // Re-color the edited row to reflect new state immediately
    applyColorCodingToManagerData(sheet, sheet.getName(), rowIndex, 1);

    // Copy to meetings only when editing Randevular
    if (nameLower.includes('randevu')) {
      const valSonuc = idxSonuc !== -1 ? sheet.getRange(rowIndex, idxSonuc + 1).getDisplayValue() : '';
      const valTarih = idxTarih !== -1 ? sheet.getRange(rowIndex, idxTarih + 1).getValue() : '';
      const hasMeeting = (String(valSonuc||'').trim() !== '') || !!valTarih;
      if (hasMeeting) {
        copyRandevuRowToToplantilar(sheet, rowIndex, { navigateToMeetings: false });
      }
    }
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

const PERFORMANCE_KEYS = {
  ONLY_COLOR_TOUCHED_ROWS: 'ONLY_COLOR_TOUCHED_ROWS'
};

function getOnlyColorTouchedRowsFlag() {
  try {
    const props = PropertiesService.getDocumentProperties();
    const val = props.getProperty(PERFORMANCE_KEYS.ONLY_COLOR_TOUCHED_ROWS);
    return val === null ? true : String(val) === 'true';
  } catch (error) {
    console.error('❌ Error reading performance flag:', error);
    return true;
  }
}

function setOnlyColorTouchedRowsFlag(value) {
  try {
    const props = PropertiesService.getDocumentProperties();
    props.setProperty(PERFORMANCE_KEYS.ONLY_COLOR_TOUCHED_ROWS, String(!!value));
  } catch (error) {
    console.error('❌ Error setting performance flag:', error);
  }
}

function toggleOnlyColorTouchedRows() {
  try {
    const current = getOnlyColorTouchedRowsFlag();
    const next = !current;
    setOnlyColorTouchedRowsFlag(next);
    const ui = SpreadsheetApp.getUi();
    ui.alert('Performans Modu', `Renkleme: Sadece Yeni/Güncellenen Satırlar = ${next ? 'Açık' : 'Kapalı'}`, ui.ButtonSet.OK);
  } catch (error) {
    console.error('❌ Error toggling performance flag:', error);
  }
}

function ensureToplantilarSchema(ss, sheetNameOverride) {
  console.log('Function started:', { action: 'ensureToplantilarSchema' });
  try {
    const desiredName = sheetNameOverride || 'Toplantılar';
    let sheet = ss.getSheetByName(desiredName);
    if (!sheet) {
      sheet = ss.insertSheet(desiredName);
      createManagerSheetHeaders(sheet, 'Toplantılar');
      applyManagerSheetDataValidation(sheet, 'Toplantılar');
      return sheet;
    }

    const requiredHeaders = [
      'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'İsim Soyisim',
      'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Toplantı Tarihi', 'Yeni Takip Tarihi', 'Toplantıyı Yapan',
      'Category', 'Website', 'Phone', 'Yetkili Tel', 'Mail', 'Randevu durumu', 'Randevu Tarihi',
      'Saat', 'Yorum', 'Yönetici Not',
      'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi',
      'Site Hızı', 'Site Trafiği', 'Log', 'Toplantı formatı', 'Address', 'City',
      'Rating count', 'Review'
    ];

    const lastCol = sheet.getLastColumn();
    const currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

    let appended = 0;
    for (const h of requiredHeaders) {
      if (currentHeaders.indexOf(h) === -1) {
        sheet.insertColumnAfter(sheet.getLastColumn() || 1);
        const newColIndex = sheet.getLastColumn();
        sheet.getRange(1, newColIndex).setValue(h);
        appended++;
      }
    }

    // Reorder: Move meeting fields right after 'İsim Soyisim' and ensure 'İsim Soyisim' follows 'Company name'
    try {
      const headersNow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      const idxCompany = headersNow.indexOf('Company name');
      const idxIsim = headersNow.indexOf('İsim Soyisim');
      if (idxCompany !== -1 && idxIsim !== -1 && idxIsim !== idxCompany + 1) {
        sheet.moveColumns(sheet.getRange(1, idxIsim + 1, sheet.getMaxRows(), 1), idxCompany + 2);
      }
      const headersAfter = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      const idxIsimNow = headersAfter.indexOf('İsim Soyisim');
      const toMove = ['Toplantı Sonucu','Teklif Detayı','Satış Potansiyeli','Toplantı Tarihi','Yeni Takip Tarihi','Toplantıyı Yapan'];
      if (idxIsimNow !== -1) {
        let insertPos = idxIsimNow + 2; // after İsim Soyisim
        for (const name of toMove) {
          const curIdx = headersAfter.indexOf(name);
          if (curIdx !== -1 && curIdx + 1 !== insertPos) {
            sheet.moveColumns(sheet.getRange(1, curIdx + 1, sheet.getMaxRows(), 1), insertPos);
            insertPos++;
          } else if (curIdx !== -1) {
            insertPos++;
          }
        }
      }
    } catch (reorderErr) {
      console.log('⚠️ Reorder skipped:', reorderErr && reorderErr.message);
    }

    if (appended > 0) {
      applyManagerSheetDataValidation(sheet, 'Toplantılar');
      optimizeColumnWidths(sheet, 'Toplantılar');
      console.log('Toplantılar schema updated with missing headers:', appended);
    }

    return sheet;
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function openMeetingDetailsEditor() {
  console.log('Function started:', { action: 'openMeetingDetailsEditor' });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const nameLower = String(sheet && sheet.getName ? sheet.getName() : '').toLowerCase();
    if (!nameLower.includes('toplant')) {
      SpreadsheetApp.getUi().alert('Bilgi', 'Lütfen Toplantılar sayfasında bir satır seçin.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const range = sheet.getActiveRange();
    if (!range || range.getNumRows() !== 1 || range.getRow() === 1) {
      SpreadsheetApp.getUi().alert('Bilgi', 'Lütfen tek bir toplantı satırı seçin.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    const rowIndex = range.getRow();

    const html = HtmlService.createHtmlOutput(`
      <html>
      <head>
        <base target="_top" />
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          label { display:block; margin-top: 12px; font-weight: 600; }
          .row { margin-top: 8px; }
          .actions { margin-top: 16px; display:flex; gap:8px; }
        </style>
      </head>
      <body>
        <h3>Toplantı Detayı</h3>
        <form id="f">
          <input type="hidden" name="rowIndex" value="${rowIndex}" />
          <label>Teklif Detayı (çoklu seçim)</label>
          <div class="row">
            ${['Custom','Elite','Platinium Plus','Platinium','Entegre','Digifirst Custom','Digifirst Plus','Digifirst','Digifirst Setup'].map(opt => `
              <label><input type="checkbox" name="teklifDetayi" value="${opt}"> ${opt}</label>
            `).join('')}
          </div>
          <label>Satış Potansiyeli</label>
          <div class="row">
            <select name="satisPotansiyeli">
              <option value="">(seçiniz)</option>
              <option>Yerinde Satış</option>
              <option>Sıcak</option>
              <option>Orta</option>
              <option>Soğuk</option>
            </select>
          </div>
                     <label>Yeni Takip Tarihi</label>
           <div class="row">
             <input type="date" name="yeniTakipTarihi" />
           </div>
           <label>Toplantıyı Yapan (İsim / E-posta)</label>
           <div class="row">
             <input type="text" name="toplantiyiYapan" placeholder="Ad Soyad veya e-posta" style="width:100%" />
           </div>
           <label>Yönetici Not</label>
          <div class="row">
            <textarea name="yoneticiNot" rows="4" style="width:100%"></textarea>
          </div>
          <div class="actions">
            <button type="button" onclick="submitForm()">Kaydet</button>
            <button type="button" onclick="google.script.host.close()">Kapat</button>
          </div>
        </form>
        <script>
          function submitForm(){
            const form = document.getElementById('f');
            const data = {
              rowIndex: Number(form.rowIndex.value),
              teklifDetayi: Array.from(form.querySelectorAll('input[name="teklifDetayi"]:checked')).map(i=>i.value).join(', '),
              satisPotansiyeli: form.satisPotansiyeli.value || '',
              yeniTakipTarihi: form.yeniTakipTarihi.value || '',
              toplantiyiYapan: form.toplantiyiYapan.value || '',
              yoneticiNot: form.yoneticiNot.value || ''
            };
            google.script.run.withSuccessHandler(function(){google.script.host.close();}).processMeetingDetailsForm(data);
          }
        </script>
      </body>
      </html>
    `).setWidth(500).setHeight(600);

    SpreadsheetApp.getUi().showModalDialog(html, 'Toplantı Detayı Düzenle');
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function processMeetingDetailsForm(formData) {
  console.log('Function started:', formData);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const nameLower = String(sheet && sheet.getName ? sheet.getName() : '').toLowerCase();
    if (!nameLower.includes('toplant')) {
      throw new Error('Bu işlem sadece Toplantılar sayfasında çalışır');
    }
    const rowIndex = Number(formData.rowIndex);
    if (!rowIndex || rowIndex <= 1) throw new Error('Geçersiz satır');

    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    function idx(h){ return headers.indexOf(h); }
    const idxTeklif = idx('Teklif Detayı');
    const idxPot = idx('Satış Potansiyeli');
    const idxYeni = idx('Yeni Takip Tarihi');
    const idxYapan = idx('Toplantıyı Yapan');
    const idxNot = idx('Yönetici Not');

    if (idxTeklif !== -1) sheet.getRange(rowIndex, idxTeklif + 1).setValue(formData.teklifDetayi || '');
    if (idxPot !== -1) sheet.getRange(rowIndex, idxPot + 1).setValue(formData.satisPotansiyeli || '');

    if (idxYeni !== -1) {
      const d = String(formData.yeniTakipTarihi || '');
      if (d) {
        const parts = d.split('-'); // yyyy-mm-dd
        const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        sheet.getRange(rowIndex, idxYeni + 1).setValue(dateObj);
      } else {
        sheet.getRange(rowIndex, idxYeni + 1).setValue('');
      }
    }

    if (idxYapan !== -1) sheet.getRange(rowIndex, idxYapan + 1).setValue(formData.toplantiyiYapan || '');

    if (idxNot !== -1) sheet.getRange(rowIndex, idxNot + 1).setValue(formData.yoneticiNot || '');

    applyManagerSheetDataValidation(sheet, 'Toplantılar');
    if (getOnlyColorTouchedRowsFlag()) applyColorCodingToManagerData(sheet, 'Toplantılar', rowIndex, 1);

    console.log('Processing complete:', { rowIndex });
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function normalizeToplantilarHeadersExact() {
  console.log('Function started:', { action: 'normalizeToplantilarHeadersExact' });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('Toplantılar');
    if (!sheet) return;
    const desired = ['Kod','Kaynak','Keyword','Location','Company name','Category','Website','Phone','Yetkili Tel','Mail','İsim Soyisim','Randevu durumu','Randevu Tarihi','Saat','Yorum','Yönetici Not','CMS Adı','CMS Grubu','E-Ticaret İzi','Site Hızı','Site Trafiği','Log','Toplantı formatı','Address','City','Rating count','Review','Toplantı Sonucu','Teklif Detayı','Satış Potansiyeli','Toplantı Tarihi','Yeni Takip Tarihi','Maplink'];
    sheet.clear();
    sheet.getRange(1,1,1,desired.length).setValues([desired]);
    applyHeaderStyling(sheet, 'Toplantılar');
    optimizeColumnWidths(sheet, 'Toplantılar');
    applyManagerSheetDataValidation(sheet, 'Toplantılar');
  } catch (error) {
    console.error('Function failed:', error);
  }
}

function applyStrongDatePickers(sheet, headerNames) {
  try {
    if (!sheet) return;
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1,1,1, lastCol).getValues()[0];
    for (const h of headerNames) {
      const idx = headers.indexOf(h);
      if (idx !== -1) {
        const validation = SpreadsheetApp.newDataValidation().requireDate().setAllowInvalid(true).build();
        sheet.getRange(2, idx + 1, Math.max(sheet.getLastRow() - 1, 1), 1).setDataValidation(validation);
      }
    }
  } catch (error) {
    console.error('Function failed:', error);
  }
}

// Strengthen date pickers on all sheets after schema ensure
function refreshAllDatePickers() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    for (const sh of sheets) {
      const name = sh.getName();
      const lower = String(name || '').toLowerCase();
      if (lower.includes('randevu')) {
        applyStrongDatePickers(sh, ['Randevu Tarihi','Toplantı Tarihi']);
      } else if (lower.includes('fırsat') || lower.includes('firsat')) {
        applyStrongDatePickers(sh, ['Fırsat Tarihi']);
      } else if (lower.includes('toplant')) {
        applyStrongDatePickers(sh, ['Randevu Tarihi','Toplantı Tarihi','Yeni Takip Tarihi']);
      }
    }
  } catch (error) {
    console.error('Function failed:', error);
  }
}

function generateDailyReportManager(options) {
  console.log('Function started:', options || {});
  try {
    const scope = (options && options.scope) || 'all'; // 'all' | 'employee'
    const filterCode = (options && options.employeeCode) || '';

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const todayKey = Utilities.formatDate(today, Session.getScriptTimeZone(), 'dd.MM.yyyy');

    function isTodayDate(value) {
      try {
        if (!value) return false;
        const d = value instanceof Date ? value : new Date(String(value));
        if (isNaN(d.getTime())) return false;
        const key = Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy');
        return key === todayKey;
      } catch (err) { return false; }
    }

    function extractDateFromLog(logValue) {
      const s = String(logValue || '');
      const m = s.match(/(\d{2}\.\d{2}\.\d{4})/);
      if (m && m[1]) {
        const parts = m[1].split('.');
        const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        if (!isNaN(d.getTime())) return d;
      }
      return null;
    }

    function getActivityDate(headers, row, mainDateHeader) {
      // Prefer the current cell date (manual override), fallback to Log
      const idxMain = headers.indexOf(mainDateHeader);
      if (idxMain !== -1 && row[idxMain]) return row[idxMain];
      const idxLog = headers.indexOf('Log');
      if (idxLog !== -1) {
        const d = extractDateFromLog(row[idxLog]);
        if (d) return d;
      }
      return '';
    }

    const counts = {
      'Randevu Alındı': 0,
      'İleri Tarih Randevu': 0,
      'Randevu Teyitlendi': 0,
      'Randevu Ertelendi': 0,
      'Randevu İptal oldu': 0,
      'Yeniden Aranacak': 0,
      'Bilgi Verildi': 0,
      'Fırsat İletildi': 0,
      'İlgilenmiyor': 0,
      'Ulaşılamadı': 0
    };

    // Randevular (pozitifler)
    const shR = ss.getSheetByName('T Randevular') || ss.getSheetByName('Randevular');
    if (shR && shR.getLastRow() > 1) {
      const lastCol = shR.getLastColumn();
      const headers = shR.getRange(1,1,1,lastCol).getValues()[0];
      const values = shR.getRange(2,1,shR.getLastRow()-1,lastCol).getValues();
      const idxCode = headers.indexOf('Kod') !== -1 ? headers.indexOf('Kod') : headers.indexOf('Temsilci Kodu');
      const idxStatus = headers.indexOf('Randevu durumu');
      for (const row of values) {
        if (scope === 'employee' && filterCode && idxCode !== -1 && String(row[idxCode]) !== String(filterCode)) continue;
        const actDate = getActivityDate(headers, row, 'Randevu Tarihi');
        if (!isTodayDate(actDate)) continue;
        const status = idxStatus !== -1 ? String(row[idxStatus] || '') : '';
        if (!status) continue;
        if (counts.hasOwnProperty(status)) counts[status]++;
      }
    }

    // Fırsatlar (exclude İlgilenmiyor/Ulaşılamadı; they come from summary)
    const shF = ss.getSheetByName('Fırsatlar') || ss.getSheetByName('T Fırsatlar');
    if (shF && shF.getLastRow() > 1) {
      const lastCol = shF.getLastColumn();
      const headers = shF.getRange(1,1,1,lastCol).getValues()[0];
      const values = shF.getRange(2,1,shF.getLastRow()-1,lastCol).getValues();
      const idxCode = headers.indexOf('Kod') !== -1 ? headers.indexOf('Kod') : headers.indexOf('Temsilci Kodu');
      const idxStatus = headers.indexOf('Fırsat Durumu');
      for (const row of values) {
        if (scope === 'employee' && filterCode && idxCode !== -1 && String(row[idxCode]) !== String(filterCode)) continue;
        const actDate = getActivityDate(headers, row, 'Fırsat Tarihi');
        if (!isTodayDate(actDate)) continue;
        const status = idxStatus !== -1 ? String(row[idxStatus] || '') : '';
        if (!status) continue;
        const s = status.toLowerCase();
        const norm = s.includes('ilet') ? 'Fırsat İletildi' : s.includes('bilgi') ? 'Bilgi Verildi' : s.includes('yeniden') || s.includes('ara') ? 'Yeniden Aranacak' : '';
        if (norm && counts.hasOwnProperty(norm)) counts[norm]++;
      }
    }

    // Negatifler: yalnızca T Aktivite Özet
    const negRowsDaily = getNegativeSummaryRows(scope, filterCode);
    for (const r of negRowsDaily) {
      const [kod, tarih, ilgi, ulas] = r;
      if (scope === 'employee' && filterCode && String(kod) !== String(filterCode)) continue;
      if (String(tarih) === todayKey) {
        counts['İlgilenmiyor'] += Number(ilgi || 0);
        counts['Ulaşılamadı'] += Number(ulas || 0);
      }
    }

    const toplamKontak = counts['Randevu Alındı'] + counts['İleri Tarih Randevu'] + counts['Yeniden Aranacak'] + counts['Bilgi Verildi'] + counts['Fırsat İletildi'] + counts['İlgilenmiyor'];
    const toplamIslem = toplamKontak + counts['Ulaşılamadı'];

    // Write report
    const title = scope === 'employee' && filterCode ? `Günlük Rapor (${filterCode}) - ${todayKey}` : `Günlük Rapor (Genel) - ${todayKey}`;
    let report = ss.getSheetByName(title);
    if (!report) report = ss.insertSheet(title);
    else report.clear();

    const rows = [
      ['📊 GÜNLÜK RAPORLAR', todayKey],
      ['1. Randevu Alındı', counts['Randevu Alındı']],
      ['- Randevu Teyitlendi', counts['Randevu Teyitlendi']],
      ['- Randevu Ertelendi', counts['Randevu Ertelendi']],
      ['- Randevu İptal oldu', counts['Randevu İptal oldu']],
      ['2. İleri Tarih Randevu', counts['İleri Tarih Randevu']],
      ['3. Yeniden Aranacak', counts['Yeniden Aranacak']],
      ['4. Bilgi Verildi', counts['Bilgi Verildi']],
      ['5. Fırsat İletildi', counts['Fırsat İletildi']],
      ['6. İlgilenmiyor', counts['İlgilenmiyor']],
      ['📊 TOPLAM KONTAK', toplamKontak],
      ['7. Ulaşılamadı', counts['Ulaşılamadı']],
      ['📈 TOPLAM İŞLEM', toplamIslem]
    ];

    report.getRange(1,1,rows.length,2).setValues(rows);
    report.getRange(1,1,1,2).setFontWeight('bold');
    report.getRange(2,2,rows.length-1,1).setHorizontalAlignment('center').setFontStyle('italic');
    // Highlight totals rows lightly
    try {
      const labels = rows.map(r => r[0]);
      const idxKontak = labels.indexOf('📊 TOPLAM KONTAK');
      const idxIslem = labels.indexOf('📈 TOPLAM İŞLEM');
      if (idxKontak !== -1) report.getRange(idxKontak + 1, 1, 1, 2).setBackground('#E3F2FD');
      if (idxIslem !== -1) report.getRange(idxIslem + 1, 1, 1, 2).setBackground('#E8F5E8');
    } catch(e) { console.log('⚠️ Daily totals highlight failed:', e && e.message); }
    report.getRange(rows.length,1,1,2).setFontStyle('italic').setHorizontalAlignment('center');
    report.autoResizeColumns(1,2);

    console.log('Processing complete:', { scope, filterCode, todayKey });
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function collectFormatTableNegativeSummary(employeeFile, employeeCode) {
  console.log('Function started:', { action: 'collectFormatTableNegativeSummary', employeeCode });
  try {
    if (!employeeFile || !employeeCode) return [];
    const sheets = employeeFile.getSheets();
    const resultMap = new Map(); // key date -> {ilgi, ulas}

    function pushCount(dateKey, type) {
      if (!dateKey) return;
      if (!resultMap.has(dateKey)) resultMap.set(dateKey, { ilgi: 0, ulas: 0 });
      const obj = resultMap.get(dateKey);
      if (type === 'İlgilenmiyor') obj.ilgi++;
      else if (type === 'Ulaşılamadı') obj.ulas++;
    }

    function extractDateFromLog(logValue) {
      const s = String(logValue || '');
      const m = s.match(/(\d{2}\.\d{2}\.\d{4})/);
      if (m && m[1]) return m[1];
      return '';
    }

    function toDdMmYyyy(value) {
      if (!value) return '';
      if (value instanceof Date && !isNaN(value.getTime())) {
        const d = ('0' + value.getDate()).slice(-2);
        const m = ('0' + (value.getMonth() + 1)).slice(-2);
        const y = value.getFullYear();
        return `${d}.${m}.${y}`;
      }
      const s = String(value).trim();
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;
      const d = new Date(s);
      if (!isNaN(d.getTime())) return toDdMmYyyy(d);
      return '';
    }

    function norm(s) {
      return String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    }

    function findHeaderIdx(headers, candidates) {
      const lower = headers.map(h => norm(h));
      for (const cand of candidates) {
        const i = lower.indexOf(norm(cand));
        if (i !== -1) return i;
      }
      return -1;
    }

    for (const sh of sheets) {
      const lastRow = sh.getLastRow();
      if (lastRow <= 1) continue;
      const lastCol = sh.getLastColumn();
      const headers = sh.getRange(1,1,1,lastCol).getValues()[0];

      // Skip known consolidated sheets by distinctive headers
      const isRandevuSheet = findHeaderIdx(headers, ['Randevu durumu']) !== -1;
      const isFirsatSheet  = findHeaderIdx(headers, ['Fırsat Durumu','Firsat Durumu']) !== -1;
      const isToplSheet    = findHeaderIdx(headers, ['Toplantı durumu','Toplanti durumu']) !== -1;
      if (isRandevuSheet || isFirsatSheet || isToplSheet) continue;

      // Detect Format Tablo by headers (name-agnostic): must have Aktivite and (Aktivite Tarihi/Tarih or Log)
      const idxAktivite = findHeaderIdx(headers, ['Aktivite','Aktivite Durumu','Durum']);
      const idxTarih = findHeaderIdx(headers, ['Aktivite Tarihi','Aktivite tarihi','Tarih']);
      const idxLog = findHeaderIdx(headers, ['Log','Günlük']);
      if (idxAktivite === -1 || (idxTarih === -1 && idxLog === -1)) continue;

      const values = sh.getRange(2,1,lastRow-1,lastCol).getValues();
      for (const row of values) {
        const actNorm = norm(row[idxAktivite]);
        const isIlgi = /\bilgilenm/i.test(actNorm) || /\bilgi yok/i.test(actNorm) || /\bilg yok/i.test(actNorm);
        const isUlas = /(ulasilam|ulasam|ulasilamadi|^ulas| cevap yok|mesgul|erisile|erise|yanit yok|a\u00E7ilmadi|acilmadi)/i.test(actNorm);
        if (!isIlgi && !isUlas) continue;
        let dateKey = '';
        // Prefer current cell date first; fallback to Log
        if (idxTarih !== -1) dateKey = toDdMmYyyy(row[idxTarih]);
        if (!dateKey && idxLog !== -1) dateKey = extractDateFromLog(row[idxLog]);
        if (!dateKey) continue;
        pushCount(dateKey, isIlgi ? 'İlgilenmiyor' : 'Ulaşılamadı');
      }
    }

    const out = [];
    for (const [dateKey, obj] of resultMap.entries()) {
      out.push([employeeCode, dateKey, obj.ilgi, obj.ulas]);
    }
    console.log('Processing complete:', { rows: out.length });
    return out;
  } catch (error) {
    console.error('Function failed:', error);
    return [];
  }
}

// Negatif aktiviteleri yalnızca 'T Aktivite Özet'ten okuyan yardımcı (fallback yok)
function getNegativeSummaryRows(scope, filterCode) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shS = ss.getSheetByName('T Aktivite Özet');
    if (!shS || shS.getLastRow() <= 1) return [];
    const rows = shS.getRange(2,1,shS.getLastRow()-1,4).getValues();
    if (scope === 'employee' && filterCode) {
      return rows.filter(function(r){ return String(r[0]) === String(filterCode); });
    }
    return rows;
  } catch (err) {
    console.error('getNegativeSummaryRows failed:', err);
    return [];
  }
}

function collectFormatTableNegativeSummaryWithSources(employeeFile, employeeCode) {
  console.log('Function started:', { action: 'collectFormatTableNegativeSummaryWithSources', employeeCode });
  try {
    if (!employeeFile || !employeeCode) return { rows: [], sources: new Map() };
    const sheets = employeeFile.getSheets();
    const resultMap = new Map(); // dateKey -> { ilgi, ulas }
    const sourceMap = new Map(); // dateKey -> Set(sourceNames)

    function pushCount(dateKey, type, sourceName) {
      if (!dateKey) return;
      if (!resultMap.has(dateKey)) resultMap.set(dateKey, { ilgi: 0, ulas: 0 });
      const obj = resultMap.get(dateKey);
      if (type === 'İlgilenmiyor') obj.ilgi++;
      else if (type === 'Ulaşılamadı') obj.ulas++;
      if (!sourceMap.has(dateKey)) sourceMap.set(dateKey, new Set());
      if (sourceName) sourceMap.get(dateKey).add(sourceName);
    }

    function extractDateFromLog(logValue) {
      const s = String(logValue || '');
      const m = s.match(/(\d{2}\.\d{2}\.\d{4})/);
      if (m && m[1]) return m[1];
      return '';
    }

    function toDdMmYyyy(value) {
      if (!value) return '';
      if (value instanceof Date && !isNaN(value.getTime())) {
        const d = ('0' + value.getDate()).slice(-2);
        const m = ('0' + (value.getMonth() + 1)).slice(-2);
        const y = value.getFullYear();
        return `${d}.${m}.${y}`;
      }
      const s = String(value).trim();
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;
      const d = new Date(s);
      if (!isNaN(d.getTime())) return toDdMmYyyy(d);
      return '';
    }

    function norm(s) {
      return String(s || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
    }

    function findHeaderIdx(headers, candidates) {
      const lower = headers.map(h => norm(h));
      for (const cand of candidates) {
        const i = lower.indexOf(norm(cand));
        if (i !== -1) return i;
      }
      return -1;
    }

    for (const sh of sheets) {
      const lastRow = sh.getLastRow();
      if (lastRow <= 1) continue;
      const lastCol = sh.getLastColumn();
      const headers = sh.getRange(1,1,1,lastCol).getValues()[0];
      const sheetName = sh.getName();

      // Skip consolidated sheets
      const isRandevuSheet = findHeaderIdx(headers, ['Randevu durumu']) !== -1;
      const isFirsatSheet  = findHeaderIdx(headers, ['Fırsat Durumu','Firsat Durumu']) !== -1;
      const isToplSheet    = findHeaderIdx(headers, ['Toplantı durumu','Toplanti durumu']) !== -1;
      if (isRandevuSheet || isFirsatSheet || isToplSheet) continue;

      // Detect Format Tablo-ish sheets
      const idxAktivite = findHeaderIdx(headers, ['Aktivite','Aktivite Durumu','Durum']);
      const idxTarih = findHeaderIdx(headers, ['Aktivite Tarihi','Aktivite tarihi','Tarih']);
      const idxLog = findHeaderIdx(headers, ['Log','Günlük']);
      if (idxAktivite === -1 || (idxTarih === -1 && idxLog === -1)) continue;

      const values = sh.getRange(2,1,lastRow-1,lastCol).getValues();
      for (const row of values) {
        const actNorm = norm(row[idxAktivite]);
        const isIlgi = /\bilgilenm/i.test(actNorm) || /\bilgi yok/i.test(actNorm) || /\bilg yok/i.test(actNorm);
        const isUlas = /(ulasilam|ulasam|ulasilamadi|^ulas| cevap yok|mesgul|erisile|erise|yanit yok|a\u00E7ilmadi|acilmadi)/i.test(actNorm);
        if (!isIlgi && !isUlas) continue;
        let dateKey = '';
        if (idxLog !== -1) dateKey = extractDateFromLog(row[idxLog]);
        if (!dateKey && idxTarih !== -1) dateKey = toDdMmYyyy(row[idxTarih]);
        if (!dateKey) continue;
        pushCount(dateKey, isIlgi ? 'İlgilenmiyor' : 'Ulaşılamadı', sheetName);
      }
    }

    const out = [];
    for (const [dateKey, obj] of resultMap.entries()) {
      out.push([employeeCode, dateKey, obj.ilgi, obj.ulas]);
    }
    // sort by date asc
    out.sort((a,b)=>{
      const [ad,am,ay] = String(a[1]||'').split('.');
      const [bd,bm,by] = String(b[1]||'').split('.');
      const da = new Date(Number(ay), Number(am)-1, Number(ad));
      const db = new Date(Number(by), Number(bm)-1, Number(bd));
      return da - db;
    });

    console.log('Processing complete:', { rows: out.length, sources: sourceMap.size });
    return { rows: out, sources: sourceMap };
  } catch (error) {
    console.error('Function failed:', error);
    return { rows: [], sources: new Map() };
  }
}

function updateManagerActivitySummaryWithSources(managerFile, dataObj, employeeCode) {
  console.log('Function started:', { action: 'updateManagerActivitySummaryWithSources', employeeCode });
  try {
    if (!managerFile || !employeeCode || !dataObj) return;
    const sheetName = 'T Aktivite Özet (Kaynak)';
    let sheet = managerFile.getSheetByName(sheetName);
    if (!sheet) {
      sheet = managerFile.insertSheet(sheetName);
      sheet.getRange(1,1,1,5).setValues([[
        'Kod','Tarih','İlgilenmiyor','Ulaşılamadı','Kaynak Sayfalar'
      ]]);
      applyHeaderStyling(sheet, sheetName);
    }
    const rows = dataObj.rows || [];
    const sourcesMap = dataObj.sources || new Map();

    // Clear previous rows of this employee
    const data = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1, sheet.getLastColumn()).getValues() : [];
    const idxCode = 0;
    for (let i = data.length - 1; i >= 0; i--) {
      if (String(data[i][idxCode]) === String(employeeCode)) sheet.deleteRow(i + 2);
    }

    if (rows.length === 0) return;

    const enriched = rows.map(r => {
      const srcSet = sourcesMap.get(r[1]) || new Set();
      const src = Array.from(srcSet).join(', ');
      return [...r, src];
    });

    sheet.getRange(sheet.getLastRow()+1, 1, enriched.length, 5).setValues(enriched);
  } catch (error) {
    console.error('Function failed:', error);
  }
}

function updateManagerActivitySummary(managerFile, rows, employeeCode, mode) {
  console.log('Function started:', { action: 'updateManagerActivitySummary', rows: rows ? rows.length : 0, employeeCode, mode });
  try {
    if (!managerFile || !employeeCode) return;
    const sheetName = 'T Aktivite Özet';
    let sheet = managerFile.getSheetByName(sheetName);
    if (!sheet) {
      sheet = managerFile.insertSheet(sheetName);
      sheet.getRange(1,1,1,4).setValues([['Kod','Tarih','İlgilenmiyor','Ulaşılamadı']]);
      applyHeaderStyling(sheet, sheetName);
    }

    // Replace mode: clear previous rows of this employee
    if ((mode || 'replace') !== 'append') {
      const data = sheet.getLastRow() > 1 ? sheet.getRange(2,1,sheet.getLastRow()-1, sheet.getLastColumn()).getValues() : [];
      const idxCode = 0;
      for (let i = data.length - 1; i >= 0; i--) {
        if (String(data[i][idxCode]) === String(employeeCode)) {
          sheet.deleteRow(i + 2);
        }
      }
    }

    if (!rows || rows.length === 0) return;

    // Upsert by Kod+Tarih
    const headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    const lastRow = sheet.getLastRow();
    const existing = lastRow > 1 ? sheet.getRange(2,1,lastRow-1,headers.length).getValues() : [];
    function toDdMmYyyy(value) {
      if (!value) return '';
      if (value instanceof Date && !isNaN(value.getTime())) {
        const d = ('0' + value.getDate()).slice(-2);
        const m = ('0' + (value.getMonth() + 1)).slice(-2);
        const y = value.getFullYear();
        return `${d}.${m}.${y}`;
      }
      const s = String(value).trim();
      if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;
      const d = new Date(s);
      if (!isNaN(d.getTime())) return toDdMmYyyy(d);
      return '';
    }
    const keyToRow = new Map();
    for (let i = 0; i < existing.length; i++) {
      const r = existing[i];
      const key = `${r[0]}||${toDdMmYyyy(r[1])}`;
      keyToRow.set(key, i + 2);
    }

    const appends = [];
    for (const r of rows) {
      const key = `${r[0]}||${toDdMmYyyy(r[1])}`;
      if (keyToRow.has(key)) {
        sheet.getRange(keyToRow.get(key), 1, 1, r.length).setValues([r]);
      } else {
        appends.push(r);
      }
    }
    if (appends.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, appends.length, appends[0].length).setValues(appends);
    }
    // DEDUPE + SORT: Kod+Tarih bazında tekilleştir ve kronolojik sırala
    try {
      const lastRowAll = sheet.getLastRow();
      if (lastRowAll > 1) {
        const rng = sheet.getRange(2, 1, lastRowAll - 1, 4).getValues(); // [Kod, Tarih, İlgilenmiyor, Ulaşılamadı]
        function normDate(val){
          if (!val) return '';
          if (val instanceof Date && !isNaN(val.getTime())) {
            const d = ('0'+val.getDate()).slice(-2);
            const m = ('0'+(val.getMonth()+1)).slice(-2);
            const y = val.getFullYear();
            return `${d}.${m}.${y}`;
          }
          const s = String(val).trim();
          const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
          if (m) {
            const d = ('0'+Number(m[1])).slice(-2);
            const mm = ('0'+Number(m[2])).slice(-2);
            const y = m[3];
            return `${d}.${mm}.${y}`;
          }
          const parsed = Date.parse(s);
          if (!isNaN(parsed)) {
            const dt = new Date(parsed);
            const d = ('0'+dt.getDate()).slice(-2);
            const mm = ('0'+(dt.getMonth()+1)).slice(-2);
            const y = dt.getFullYear();
            return `${d}.${mm}.${y}`;
          }
          return s;
        }
        const map = new Map();
        for (const r of rng){
          const kod = String(r[0]||'').trim();
          const dt = normDate(r[1]);
          if (!kod || !dt) continue;
          const key = `${kod}||${dt}`;
          const ilgi = Number(r[2]||0);
          const ulas = Number(r[3]||0);
          if (!map.has(key)) map.set(key, [kod, dt, 0, 0]);
          const arr = map.get(key);
          arr[2] += isNaN(ilgi)? 0 : ilgi;
          arr[3] += isNaN(ulas)? 0 : ulas;
        }
        const out = Array.from(map.values());
        // sort by Kod asc, then Tarih asc
        function toDate(s){ const [d,m,y] = s.split('.'); return new Date(Number(y), Number(m)-1, Number(d)); }
        out.sort((a,b)=> a[0]===b[0] ? (toDate(a[1]) - toDate(b[1])) : (String(a[0]).localeCompare(String(b[0]))));
        // rewrite
        const targetRows = out.length;
        // Clear old
        if (lastRowAll > 1) sheet.getRange(2,1,lastRowAll-1,4).clearContent();
        if (targetRows>0) sheet.getRange(2,1,targetRows,4).setValues(out);
      }
    } catch (e) { console.log('T Aktivite Özet dedupe/sort skipped:', e && e.message); }

    // Renk kodlaması: T Aktivite Özet (temsilci bazlı)
    try {
      const lastRowFinal = sheet.getLastRow();
      if (lastRowFinal > 1) {
        applyColorCodingToManagerData(sheet, sheetName, 2, lastRowFinal - 1);
      }
    } catch (colErr) {
      console.log('T Aktivite Özet recolor skipped:', colErr && colErr.message);
    }

    console.log('Processing complete:', { appended: appends.length });
  } catch (error) {
    console.error('Function failed:', error);
  }
}

function computeFullActivityWideRows(managerFile, employeeCode) {
  console.log('Function started:', { action: 'computeFullActivityWideRows', employeeCode });
  try {
    const ss = managerFile;
    const agg = new Map();
    const srcMap = new Map();
    function toKey(d){ return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy'); }
    function parseDateLike(val){ if (val instanceof Date && !isNaN(val.getTime())) return val; const s=String(val||'').trim(); const m=s.match(/(\d{2})\.(\d{2})\.(\d{4})/); if(m){return new Date(Number(m[3]),Number(m[2])-1,Number(m[1]));} const d=new Date(s); return isNaN(d.getTime())? null: d; }
    function extractFromLog(val){ const s=String(val||''); const m=s.match(/(\d{2}\.\d{2}\.\d{4})/); return m&&m[1]? parseDateLike(m[1]) : null; }
    function getActDate(headers,row,main){ const iL=headers.indexOf('Log'); if(iL!==-1){ const d=extractFromLog(row[iL]); if(d) return d;} const i=headers.indexOf(main); if(i!==-1 && row[i]){ const d=parseDateLike(row[i]); if(d) return d; } return null; }
    function normStatus(v){ const s=String(v||'').toLowerCase(); if(s.includes('randevu al')) return 'Randevu Alındı'; if(s.includes('ileri tarih')) return 'İleri Tarih Randevu'; if(s.includes('teyit')) return 'Randevu Teyitlendi'; if(s.includes('erte')) return 'Randevu Ertelendi'; if(s.includes('iptal')) return 'Randevu İptal oldu'; if(s.includes('fırsat')||s.includes('firsat')||s.includes('ilet')) return 'Fırsat İletildi'; if(s.includes('bilgi')) return 'Bilgi Verildi'; if(s.includes('yeniden')||s.includes('ara')) return 'Yeniden Aranacak'; if(s.includes('satış')||s.includes('satis')) return 'Satış Yapıldı'; if(s.includes('teklif')) return 'Toplantı Teklif'; if(s.includes('tamam')) return 'Toplantı Tamamlandı'; return ''; }
    function ensureAgg(code,dateKey){ const k=`${code}||${dateKey}`; if(!agg.has(k)) agg.set(k,{ code, dateKey, RA:0, IT:0, RT:0, RE:0, RI:0, FI:0, BV:0, YA:0, IG:0, UL:0 }); return agg.get(k);} 
    function addSource(code,dateKey,src){ const k=`${code}||${dateKey}`; if(!srcMap.has(k)) srcMap.set(k, new Set()); if(src) srcMap.get(k).add(src); }


    function readAndAccumulate(sheetName, statusHeader, dateHeader) {
      const sh = ss.getSheetByName(sheetName);
      if (!sh || sh.getLastRow() <= 1) return;
      const lc = sh.getLastColumn();
      const headers = sh.getRange(1,1,1,lc).getDisplayValues()[0];
      let codeIdx = headers.indexOf('Temsilci Kodu'); if (codeIdx === -1) codeIdx = headers.indexOf('Kod');
      const statusIdx = headers.indexOf(statusHeader);
      const srcIdx = headers.indexOf('Kaynak');
      const values = sh.getRange(2,1,sh.getLastRow()-1,lc).getDisplayValues();
      for (const row of values) {
        if (String(row[codeIdx]) !== String(employeeCode)) continue;
        const dateObj = getActDate(headers, row, dateHeader);
        if (!dateObj) continue;
        const dateKey = toKey(dateObj);
        const srcVal = srcIdx !== -1 ? String(row[srcIdx]||'').trim() : '';
        const source = srcVal || '—';
        const label = normStatus(row[statusIdx]);
        if (!label) continue;
        const o = ensureAgg(employeeCode, dateKey);
        addSource(employeeCode, dateKey, source);
        if (label === 'Randevu Alındı') o.RA++;
        else if (label === 'İleri Tarih Randevu') o.IT++;
        else if (label === 'Randevu Teyitlendi') o.RT++;
        else if (label === 'Randevu Ertelendi') o.RE++;
        else if (label === 'Randevu İptal oldu') o.RI++;
        else if (label === 'Fırsat İletildi') o.FI++;
        else if (label === 'Bilgi Verildi') o.BV++;
        else if (label === 'Yeniden Aranacak') o.YA++;
      }
    }

    readAndAccumulate('T Randevular','Randevu durumu','Randevu Tarihi');
    readAndAccumulate('T Fırsatlar','Fırsat Durumu','Fırsat Tarihi');
    readAndAccumulate('T Toplantılar','Toplantı Sonucu','Toplantı Tarihi');

    const ta = ss.getSheetByName('T Aktivite Özet');
    if (ta && ta.getLastRow() > 1) {
      const lc = ta.getLastColumn();
      const headers = ta.getRange(1,1,1,lc).getDisplayValues()[0];
      const vals = ta.getRange(2,1,ta.getLastRow()-1,lc).getDisplayValues();
      const idxCode = 0, idxDate = 1, idxIlg = 2, idxUlas = 3, idxSrc = headers.indexOf('Kaynaklar');
      for (const r of vals) {
        if (String(r[idxCode]) !== String(employeeCode)) continue;
        const d = parseDateLike(r[idxDate]); if (!d) continue; const dateKey = toKey(d);
        const sources = (idxSrc !== -1 ? String(r[idxSrc]||'') : '').split(',').map(s=>s.trim()).filter(Boolean);
        const srcList = sources.length ? sources : ['—'];
        const o = ensureAgg(employeeCode, dateKey);
        addSource(employeeCode, dateKey, srcList.join(', '));
        o.IG += Number(r[idxIlg]||0);
        o.UL += Number(r[idxUlas]||0);
      }
    }

    const rows = [];
    for (const [k, o] of Array.from(agg.entries())) {
      const sourceCsv = Array.from(srcMap.get(k) || new Set()).join(', ');
      const aktifRandevu = (o.RA + o.RT);
      const aktifFirsat = (o.FI + o.BV + o.YA);
      const toplamKontak = (o.RA + o.IT + o.RT + o.RE + o.RI + o.FI + o.BV + o.YA + o.IG);
      const toplamIslem = toplamKontak + (o.UL);
      rows.push([o.code, o.dateKey, sourceCsv, o.RA, o.IT, o.RT, o.RE, o.RI, aktifRandevu, o.FI, o.BV, o.YA, aktifFirsat, o.IG, toplamKontak, o.UL, toplamIslem]);
    }
    function toDate(s){ const [d,m,y] = s.split('.'); return new Date(Number(y), Number(m)-1, Number(d)); }
    rows.sort((a,b)=> { const d = toDate(a[1]) - toDate(b[1]); if (d!==0) return d; const c = String(a[0]).localeCompare(String(b[0])); if (c!==0) return c; return 0; });
    return rows;
  } catch (error) {
    console.error('Function failed:', error);
    return [];
  }
}

function updateManagerFullActivitySummaryWide(managerFile, rows, employeeCode, mode) {
  console.log('Function started:', { action: 'updateManagerFullActivitySummaryWide', rows: rows ? rows.length : 0, employeeCode, mode });
  try {
    if (!managerFile) return;
    const sheetName = 'T Aktivite (Tümü)';
    let sheet = managerFile.getSheetByName(sheetName);
    const headers = ['Kod','Tarih','Kaynak','Randevu Alındı','İleri Tarih Randevu','Randevu Teyitlendi','Randevu Ertelendi','Randevu İptal oldu','Aktif Randevu','Fırsat İletildi','Bilgi Verildi','Yeniden Aranacak','Aktif Fırsat','İlgilenmiyor','TOPLAM KONTAK','Ulaşılamadı','TOPLAM İŞLEM'];
    if (!sheet) {
      sheet = managerFile.insertSheet(sheetName);
      sheet.getRange(1,1,1,headers.length).setValues([headers]);
      applyHeaderStyling(sheet, sheetName);
      try { sheet.setFrozenRows(1); sheet.setFrozenColumns(2); } catch(e) {}
    } else {
      const lc = sheet.getLastColumn();
      const cur = sheet.getRange(1,1,1,lc).getDisplayValues()[0].slice(0, headers.length);
      const need = cur.join('|') !== headers.join('|');
      if (need) {
        sheet.clear();
        sheet.getRange(1,1,1,headers.length).setValues([headers]);
        applyHeaderStyling(sheet, sheetName);
        try { sheet.setFrozenRows(1); sheet.setFrozenColumns(2); } catch(e) {}
      }
    }

    if ((mode||'replace') !== 'append') {
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.getRange(2,1,lastRow-1, sheet.getLastColumn()).clearContent();
    }

    if (rows && rows.length) {
      // Upsert by Kod + Tarih
      const lastRowExisting = sheet.getLastRow();
      const existing = lastRowExisting>1 ? sheet.getRange(2,1,lastRowExisting-1,headers.length).getDisplayValues() : [];
      const idxKod = 0, idxTarih = 1;
      const keyToRow = new Map();
      for (let i=0;i<existing.length;i++){ keyToRow.set(`${existing[i][idxKod]}||${existing[i][idxTarih]}`, i+2); }
      const toAppend = [];
      for (const r of rows){
        const k = `${r[idxKod]}||${r[idxTarih]}`;
        const rowIndex = keyToRow.get(k);
        if (rowIndex){ sheet.getRange(rowIndex,1,1,headers.length).setValues([r]); }
        else { toAppend.push(r); }
      }
      if (toAppend.length){ sheet.getRange(sheet.getLastRow()+1,1,toAppend.length,headers.length).setValues(toAppend); }
    }

    // Readability: highlight computed columns
        try {
      function colorHeader(h, hex){ const i=headers.indexOf(h); if(i!==-1) sheet.getRange(1, i+1).setBackground(hex).setFontWeight('bold'); }
      colorHeader('Randevu Ertelendi', '#FFF3E0');
      colorHeader('Randevu İptal oldu', '#FFEBEE');
      colorHeader('Randevu Teyitlendi', '#E8F5E8');
      colorHeader('Aktif Randevu', '#A7FFEB');
      colorHeader('Aktif Fırsat', '#A7FFEB');
      colorHeader('TOPLAM KONTAK', '#00E5FF');
      colorHeader('TOPLAM İŞLEM', '#00E5FF');
      // Optional: number format for data columns (no decimals)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1 && headers.length > 3) {
        sheet.getRange(2, 4, lastRow-1, headers.length-3).setNumberFormat('0').setHorizontalAlignment('center');
        // Alignments/styles for key computed columns
        const idxAR = headers.indexOf('Aktif Randevu');
        const idxAF = headers.indexOf('Aktif Fırsat');
        const idxTK = headers.indexOf('TOPLAM KONTAK');
        const idxTI = headers.indexOf('TOPLAM İŞLEM');
        if (idxAR !== -1) sheet.getRange(2, idxAR + 1, lastRow - 1, 1).setHorizontalAlignment('center');
        if (idxAF !== -1) sheet.getRange(2, idxAF + 1, lastRow - 1, 1).setHorizontalAlignment('center');
        if (idxTK !== -1) sheet.getRange(2, idxTK + 1, lastRow - 1, 1).setHorizontalAlignment('center').setFontWeight('bold').setFontStyle('normal');
        if (idxTI !== -1) sheet.getRange(2, idxTI + 1, lastRow - 1, 1).setHorizontalAlignment('center').setFontWeight('bold').setFontStyle('normal');
      }
    } catch(_) {}

    // Global sort by Tarih then Kod
    try {
      const lastRow2 = sheet.getLastRow();
      if (lastRow2 > 2) {
        const rng = sheet.getRange(2, 1, lastRow2 - 1, headers.length);
        const vals = rng.getValues();
        function parseDdMmYyyyLocal(s){ if (s instanceof Date && !isNaN(s.getTime())) return s; const v=String(s||'').trim(); const m=v.match(/(\d{2})\.(\d{2})\.(\d{4})/); if(m){ return new Date(Number(m[3]), Number(m[2])-1, Number(m[1])); } return new Date('2100-12-31'); }
        vals.sort(function(a,b){ const da=parseDdMmYyyyLocal(a[1]); const db=parseDdMmYyyyLocal(b[1]); if (da.getTime()!==db.getTime()) return da - db; const ca=String(a[0]||''); const cb=String(b[0]||''); return ca.localeCompare(cb); });
        rng.setValues(vals);
      }
    } catch (eSort) { console.log('⚠️ Global sort skipped:', eSort && eSort.message); }

    // Recolor: Kod hücresini temsilci rengine boya (T Aktivite (Tümü))
    try {
      const lastRow3 = sheet.getLastRow();
      if (lastRow3 > 1) {
        applyColorCodingToManagerData(sheet, sheetName, 2, lastRow3 - 1);
      }
    } catch (eCol) { console.log('⚠️ T Aktivite (Tümü) recolor skipped:', eCol && eCol.message); }

    return { appended: rows ? rows.length : 0 };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function applySourcesToMainActivitySummary(managerFile, dataObj, employeeCode) {
  console.log('Function started:', { action: 'applySourcesToMainActivitySummary', employeeCode });
  try {
    if (!managerFile || !dataObj) return;
    const sheetName = 'T Aktivite Özet';
    const sh = managerFile.getSheetByName(sheetName);
    if (!sh || sh.getLastRow() <= 1) return;

    // Ensure header has 5th column "Kaynaklar"
    const lastCol = sh.getLastColumn();
    const headers = sh.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    let idxKaynak = headers.indexOf('Kaynaklar');
    if (idxKaynak === -1) {
      sh.insertColumnAfter(Math.max(4, lastCol));
      const newIdx = Math.max(4, lastCol) + 1; // 1-based
      sh.getRange(1, newIdx).setValue('Kaynaklar');
      idxKaynak = newIdx - 1; // zero-based
    }

    const sourcesMap = dataObj.sources || new Map();
    const dateToCsv = new Map();
    if (sourcesMap && sourcesMap.entries) {
      for (const [dateKey, setVal] of sourcesMap.entries()) {
        const csv = Array.from(setVal).join(', ');
        dateToCsv.set(String(dateKey), csv);
      }
    }

    const lastRow = sh.getLastRow();
    for (let r = 2; r <= lastRow; r++) {
      const code = String(sh.getRange(r, 1).getDisplayValue() || '');
      const dateKey = String(sh.getRange(r, 2).getDisplayValue() || '');
      if (code !== String(employeeCode)) continue;
      const csv = dateToCsv.get(dateKey) || '';
      sh.getRange(r, idxKaynak + 1).setValue(csv);
    }
  } catch (error) {
    console.error('Function failed:', error);
  }
}

function refreshActivitySummaryAll() {
  console.log('Function started:', { action: 'refreshActivitySummaryAll' });
  const ui = SpreadsheetApp.getUi();
  const lock = LockService.getDocumentLock();
  try {
    if (!lock.tryLock(30000)) {
      ui.alert('Meşgul', 'Önceki işlem bitmedi. Lütfen biraz sonra tekrar deneyin.', ui.ButtonSet.OK);
      return { success: false, reason: 'locked' };
    }
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    const codes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    for (const code of codes) {
      const employeeFile = findEmployeeFile(code);
      const rows = collectFormatTableNegativeSummary(employeeFile, code);
      updateManagerActivitySummary(managerFile, rows, code, 'replace');
      try {
        const withSrc = collectFormatTableNegativeSummaryWithSources(employeeFile, code);
        applySourcesToMainActivitySummary(managerFile, withSrc, code);
      } catch (_) {}
    }
    console.log('Processing complete:', { updatedEmployees: codes.length });
    ui.alert('✅ Tamamlandı', 'T Aktivite Özet güncellendi', ui.ButtonSet.OK);
    return { success: true, updated: codes.length };
  } catch (error) {
    console.error('Function failed:', error);
    ui.alert('❌ Hata', String(error && error.message || error), ui.ButtonSet.OK);
    throw error;
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

// Tek temsilci için hızlı özet güncelleme
function refreshActivitySummaryForCode(code) {
  console.log('Function started:', { action: 'refreshActivitySummaryForCode', code: code });
  try {
    if (!code) throw new Error('Temsilci kodu boş');
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    const employeeFile = findEmployeeFile(String(code));
    const rows = collectFormatTableNegativeSummary(employeeFile, String(code));
    updateManagerActivitySummary(managerFile, rows, String(code), 'replace');
    SpreadsheetApp.getUi().alert('Tamam', `${code} için T Aktivite Özet güncellendi (${rows.length} satır).`, SpreadsheetApp.getUi().ButtonSet.OK);
    return { success: true, updated: rows.length };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function refreshActivitySummaryForCodePrompt() {
  console.log('Function started:', { action: 'refreshActivitySummaryForCodePrompt' });
  try {
    const ui = SpreadsheetApp.getUi();
    const resp = ui.prompt('Temsilci Kodu', 'Örn: KM 005', ui.ButtonSet.OK_CANCEL);
    if (resp.getSelectedButton() !== ui.Button.OK) return;
    const code = (resp.getResponseText()||'').trim();
    if (!code) { ui.alert('Hata', 'Kod boş olamaz', ui.ButtonSet.OK); return; }
    return refreshActivitySummaryForCode(code);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// 6 dk limitini aşmamak için partiler halinde çalışır. Her çağrıda küçük bir grup işler.
function refreshActivitySummaryAllFast() {
  console.log('Function started:', { action: 'refreshActivitySummaryAllFast' });
  const ui = SpreadsheetApp.getUi();
  const lock = LockService.getDocumentLock();
  const props = PropertiesService.getDocumentProperties();
  try {
    if (!lock.tryLock(30000)) {
      ui.alert('Meşgul', 'Önceki işlem bitmedi. Lütfen biraz sonra tekrar deneyin.', ui.ButtonSet.OK);
      return { success: false, reason: 'locked' };
    }
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    const codes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    const batchSize = Number(props.getProperty('NEG_SUMMARY_BATCH_SIZE') || '2');
    let offset = Number(props.getProperty('NEG_SUMMARY_NEXT_INDEX') || '0');
    if (offset < 0 || offset >= codes.length) offset = 0;

    const end = Math.min(offset + batchSize, codes.length);
    let updated = 0;
    for (let i = offset; i < end; i++) {
      const code = codes[i];
      const employeeFile = findEmployeeFile(code);
      const rows = collectFormatTableNegativeSummary(employeeFile, code);
      updateManagerActivitySummary(managerFile, rows, code, 'replace');
      updated++;
    }

    if (end >= codes.length) {
      props.deleteProperty('NEG_SUMMARY_NEXT_INDEX');
      ui.alert('Tamam', `T Aktivite Özet tamamlandı. (Güncellenen temsilci: ${updated}, Toplam: ${codes.length})`, ui.ButtonSet.OK);
      console.log('Processing complete:', { updatedEmployees: codes.length });
      return { success: true, done: true };
    } else {
      props.setProperty('NEG_SUMMARY_NEXT_INDEX', String(end));
      ui.alert('Devam Edin', `Ara güncelleme bitti. Şimdi komutu tekrar çalıştırın. (İlerleme: ${end}/${codes.length})`, ui.ButtonSet.OK);
      console.log('Partial complete:', { progress: `${end}/${codes.length}` });
      return { success: true, done: false, nextIndex: end };
    }
  } catch (error) {
    console.error('Function failed:', error);
    ui.alert('Hata', String(error && error.message || error), ui.ButtonSet.OK);
    throw error;
  } finally {
    try { lock.releaseLock(); } catch (e) {}
  }
}

function generateWeeklyReportManager(options) {
  console.log('Function started:', options || {});
  try {
    const scope = (options && options.scope) || 'all'; // 'all' | 'employee'
    const filterCode = (options && options.employeeCode) || '';

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Week range (Mon-Sun)
    function startOfWeek(d) {
      const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const day = dt.getDay(); // 0 Sun - 6 Sat
      const diff = (day === 0 ? -6 : 1 - day); // Monday as start
      dt.setDate(dt.getDate() + diff);
      dt.setHours(0,0,0,0);
      return dt;
    }
    function endOfWeek(d) {
      const start = startOfWeek(d);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23,59,59,999);
      return end;
    }

    const today = new Date();
    const wkStart = startOfWeek(today);
    const wkEnd = endOfWeek(today);

    function toKey(d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy'); }
    const rangeLabel = `${toKey(wkStart)} – ${toKey(wkEnd)}`;

    function withinWeek(value) {
      try {
        if (!value) return false;
        const d = value instanceof Date ? value : new Date(String(value));
        if (isNaN(d.getTime())) return false;
        return d >= wkStart && d <= wkEnd;
      } catch (err) { return false; }
    }

    function parseDdMmYyyy(str) {
      const s = String(str || '').trim();
      if (!/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return null;
      const [dd, mm, yyyy] = s.split('.');
      const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? null : d;
    }

    function extractDateFromLog(logValue) {
      const s = String(logValue || '');
      const m = s.match(/(\d{2}\.\d{2}\.\d{4})/);
      if (m && m[1]) return parseDdMmYyyy(m[1]);
      return null;
    }

    function getActivityDate(headers, row, mainDateHeader) {
      // Prefer the current cell date (manual override), fallback to Log
      const idxMain = headers.indexOf(mainDateHeader);
      if (idxMain !== -1 && row[idxMain]) return row[idxMain];
      const idxLog = headers.indexOf('Log');
      if (idxLog !== -1) {
        const d = extractDateFromLog(row[idxLog]);
        if (d) return d;
      }
      return '';
    }

    const counts = {
      'Randevu Alındı': 0,
      'İleri Tarih Randevu': 0,
      'Randevu Teyitlendi': 0,
      'Randevu Ertelendi': 0,
      'Randevu İptal oldu': 0,
      'Yeniden Aranacak': 0,
      'Bilgi Verildi': 0,
      'Fırsat İletildi': 0,
      'İlgilenmiyor': 0,
      'Ulaşılamadı': 0
    };

    // Randevular
    const shR = ss.getSheetByName('T Randevular') || ss.getSheetByName('Randevular');
    if (shR && shR.getLastRow() > 1) {
      const lastCol = shR.getLastColumn();
      const headers = shR.getRange(1,1,1,lastCol).getValues()[0];
      const values = shR.getRange(2,1,shR.getLastRow()-1,lastCol).getValues();
      const idxCode = headers.indexOf('Kod') !== -1 ? headers.indexOf('Kod') : headers.indexOf('Temsilci Kodu');
      const idxStatus = headers.indexOf('Randevu durumu');
      for (const row of values) {
        if (scope === 'employee' && filterCode && idxCode !== -1 && String(row[idxCode]) !== String(filterCode)) continue;
        const actDate = getActivityDate(headers, row, 'Randevu Tarihi');
        if (!withinWeek(actDate)) continue;
        const status = idxStatus !== -1 ? String(row[idxStatus] || '') : '';
        if (!status) continue;
        if (counts.hasOwnProperty(status)) counts[status]++;
      }
    }

    // Fırsatlar (exclude İlgilenmiyor/Ulaşılamadı; they come from summary)
    const shF = ss.getSheetByName('T Fırsatlar') || ss.getSheetByName('Fırsatlar');
    if (shF && shF.getLastRow() > 1) {
      const lastCol = shF.getLastColumn();
      const headers = shF.getRange(1,1,1,lastCol).getValues()[0];
      const values = shF.getRange(2,1,shF.getLastRow()-1,lastCol).getValues();
      const idxCode = headers.indexOf('Kod') !== -1 ? headers.indexOf('Kod') : headers.indexOf('Temsilci Kodu');
      const idxStatus = headers.indexOf('Fırsat Durumu');
      for (const row of values) {
        if (scope === 'employee' && filterCode && idxCode !== -1 && String(row[idxCode]) !== String(filterCode)) continue;
        const actDate = getActivityDate(headers, row, 'Fırsat Tarihi');
        if (!withinWeek(actDate)) continue;
        const status = idxStatus !== -1 ? String(row[idxStatus] || '') : '';
        if (!status) continue;
        const s = status.toLowerCase();
        const norm = s.includes('ilet') ? 'Fırsat İletildi' : s.includes('bilgi') ? 'Bilgi Verildi' : s.includes('yeniden') || s.includes('ara') ? 'Yeniden Aranacak' : '';
        if (norm && counts.hasOwnProperty(norm)) counts[norm]++;
      }
    }

    // Negatifler: özet ya da fallback
    const negRows = getNegativeSummaryRows(scope, filterCode);
    for (const r of negRows) {
      const [kod, tarih, ilgi, ulas] = r;
      if (scope === 'employee' && filterCode && String(kod) !== String(filterCode)) continue;
      const d = parseDdMmYyyy(tarih);
      if (!d) continue;
      if (d >= wkStart && d <= wkEnd) {
        counts['İlgilenmiyor'] += Number(ilgi || 0);
        counts['Ulaşılamadı'] += Number(ulas || 0);
      }
    }

    const toplamKontak = counts['Randevu Alındı'] + counts['İleri Tarih Randevu'] + counts['Yeniden Aranacak'] + counts['Bilgi Verildi'] + counts['Fırsat İletildi'] + counts['İlgilenmiyor'];
    const toplamIslem = toplamKontak + counts['Ulaşılamadı'];

    // Write report
    const title = scope === 'employee' && filterCode ? `Haftalık Rapor (${filterCode}) - ${rangeLabel}` : `Haftalık Rapor (Genel) - ${rangeLabel}`;
    let report = ss.getSheetByName(title);
    if (!report) report = ss.insertSheet(title);
    else report.clear();

    const rows = [
      ['📊 HAFTALIK RAPOR', rangeLabel],
      ['1. Randevu Alındı', counts['Randevu Alındı']],
      ['- Randevu Teyitlendi', counts['Randevu Teyitlendi']],
      ['- Randevu Ertelendi', counts['Randevu Ertelendi']],
      ['- Randevu İptal oldu', counts['Randevu İptal oldu']],
      ['2. İleri Tarih Randevu', counts['İleri Tarih Randevu']],
      ['3. Yeniden Aranacak', counts['Yeniden Aranacak']],
      ['4. Bilgi Verildi', counts['Bilgi Verildi']],
      ['5. Fırsat İletildi', counts['Fırsat İletildi']],
      ['6. İlgilenmiyor', counts['İlgilenmiyor']],
      ['📊 TOPLAM KONTAK', toplamKontak],
      ['7. Ulaşılamadı', counts['Ulaşılamadı']],
      ['📈 TOPLAM İŞLEM', toplamIslem]
    ];

    report.getRange(1,1,rows.length,2).setValues(rows);
    report.getRange(1,1,1,2).setFontWeight('bold');
    report.getRange(2,2,rows.length-1,1).setHorizontalAlignment('center').setFontStyle('italic');
    try {
      const labels = rows.map(r => r[0]);
      const idxKontak = labels.indexOf('📊 TOPLAM KONTAK');
      const idxIslem = labels.indexOf('📈 TOPLAM İŞLEM');
      if (idxKontak !== -1) report.getRange(idxKontak + 1, 1, 1, 2).setBackground('#E3F2FD');
      if (idxIslem !== -1) report.getRange(idxIslem + 1, 1, 1, 2).setBackground('#E8F5E8');
    } catch(e) { console.log('⚠️ Weekly totals highlight failed:', e && e.message); }
    report.getRange(rows.length,1,1,2).setFontStyle('italic').setHorizontalAlignment('center');
    report.autoResizeColumns(1,2);

    console.log('Processing complete:', { scope, filterCode, rangeLabel });
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function openEmployeeMultiSelectReport(period) {
  console.log('Function started:', { action: 'openEmployeeMultiSelectReport', period });
  try {
    const employees = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    const html = HtmlService.createHtmlOutput(`
      <html>
      <head>
        <base target="_top" />
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          .list { max-height: 260px; overflow:auto; border:1px solid #ddd; padding:8px; }
          .row { margin:4px 0; }
          .actions { margin-top: 12px; display:flex; gap:8px; }
          .field { margin:8px 0; }
          label { font-size: 12px; color: #444; }
        </style>
      </head>
      <body>
        <h3>Temsilcileri Seç</h3>
        <div id="dateRow" class="field" style="display:none;">
          <label>Başlangıç Günü (Günlük Seri):</label><br/>
          <input type="date" id="startDate" />
        </div>
        <div class="list">
          ${employees.map(code => `<label class="row"><input type="checkbox" name="emp" value="${code}"> ${code} - ${CRM_CONFIG.EMPLOYEE_CODES[code]}</label>`).join('')}
        </div>
        <div class="actions">
          <button onclick="submitSel()">Oluştur</button>
          <button onclick="google.script.host.close()">Kapat</button>
        </div>
        <script>
          (function init(){
            if ('${period}'==='daily-series'){
              document.getElementById('dateRow').style.display='block';
              const today = new Date();
              const yyyy = today.getFullYear();
              const mm = String(today.getMonth()+1).padStart(2,'0');
              const dd = String(today.getDate()).padStart(2,'0');
              document.getElementById('startDate').value = yyyy + '-' + mm + '-' + dd;
            }
          })();
          
          function submitSel(){
            console.log('submitSel() called - starting...');
            
            // Prevent multiple clicks
            const submitBtn = document.querySelector('button[onclick="submitSel()"]');
            if (submitBtn.disabled) {
              console.log('Button already clicked, ignoring...');
              return;
            }
            
            // Disable button to prevent multiple clicks
            submitBtn.disabled = true;
            submitBtn.textContent = 'İşleniyor...';
            
            try {
              const codes = Array.from(document.querySelectorAll('input[name="emp"]:checked')).map(function(i){return i.value;});
              console.log('Selected codes:', codes);
              
              if (codes.length===0){ 
                alert('En az bir temsilci seçiniz'); 
                submitBtn.disabled = false;
                submitBtn.textContent = 'Oluştur';
                return; 
              }
              
              var payload = { period: '${period}', codes: codes };
              console.log('Payload:', payload);
              
              if ('${period}'==='daily-series'){
                var sd = document.getElementById('startDate').value || '';
                payload.startDate = sd;
              }
              
              console.log('Calling generateComparisonReportManager with payload:', payload);
              
              google.script.run
                .withSuccessHandler(function(result){
                  console.log('Success:', result);
                  google.script.host.close();
                })
                .withFailureHandler(function(error){
                  console.error('Error:', error);
                  alert('Hata: ' + error.message);
                  submitBtn.disabled = false;
                  submitBtn.textContent = 'Oluştur';
                })
                .generateComparisonReportManager(payload);
                
            } catch (error) {
              console.error('Error in submitSel:', error);
              alert('Hata: ' + error.message);
              submitBtn.disabled = false;
              submitBtn.textContent = 'Oluştur';
            }
          }
        </script>
      </body>
      </html>
    `).setWidth(420).setHeight(520);
    SpreadsheetApp.getUi().showModalDialog(html, 'Rapor – Temsilci Seç');
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function addReportsComparisonMenu(menu) {
  const sub = SpreadsheetApp.getUi().createMenu('Raporlar (Karşılaştırma)');
  sub.addItem('Günlük', 'openEmployeeMultiSelectReportDaily')
     .addItem('Günlük Seri', 'openEmployeeMultiSelectReportDailySeries')
     .addItem('Haftalık', 'openEmployeeMultiSelectReportWeekly')
     .addItem('Haftalık Seri', 'generateWeeklyReportSeriesManager')
     .addItem('Haftalık Seri (Karşılaştırma)', 'openEmployeeMultiSelectReportWeeklySeries')
     .addItem('Pivot Tabanı (Güncel)', 'generatePivotBaseReportManager')
     .addItem('Aylık', 'openEmployeeMultiSelectReportMonthly');
  menu.addSubMenu(sub);
}

function openEmployeeMultiSelectReportDaily(){ openEmployeeMultiSelectReport('daily'); }
function openEmployeeMultiSelectReportWeekly(){ openEmployeeMultiSelectReport('weekly'); }
function openEmployeeMultiSelectReportMonthly(){ openEmployeeMultiSelectReport('monthly'); }

function generateComparisonReportManager(params) {
  if (params && params.period === 'daily-series') {
    return generateComparisonSeriesManager(params);
  }
  if (params && params.period === 'weekly-series') {
    return generateComparisonWeeklySeriesManager(params);
  }
  console.log('Function started:', params || {});
  try {
    const period = (params && params.period) || 'daily';
    const codes = (params && params.codes) || [];
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Time windows
    function toKey(d){ return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy'); }
    function startOfWeek(d){ const dt=new Date(d.getFullYear(),d.getMonth(),d.getDate()); const day=dt.getDay(); const diff=(day===0?-6:1-day); dt.setDate(dt.getDate()+diff); dt.setHours(0,0,0,0); return dt; }
    function endOfWeek(d){ const s=startOfWeek(d); const e=new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return e; }
    function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1, 0,0,0,0); }
    function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59,999); }
    function withinRange(value, a, b){ try{ if(!value) return false; const d=value instanceof Date? value: new Date(String(value)); if(isNaN(d.getTime())) return false; return d>=a && d<=b; }catch(e){return false;} }

    const today = new Date();
    let rangeStart=today, rangeEnd=today, label='';
    if (period==='daily'){ rangeStart=new Date(today.getFullYear(),today.getMonth(),today.getDate(),0,0,0,0); rangeEnd=new Date(today.getFullYear(),today.getMonth(),today.getDate(),23,59,59,999); label=toKey(today); }
    else if (period==='weekly'){ rangeStart=startOfWeek(today); rangeEnd=endOfWeek(today); label=`${toKey(rangeStart)} – ${toKey(rangeEnd)}`; }
    else { rangeStart=startOfMonth(today); rangeEnd=endOfMonth(today); label=`${toKey(rangeStart)} – ${toKey(rangeEnd)}`; }

    function extractDateFromLog(logValue){ const s=String(logValue||''); const m=s.match(/(\d{2}\.\d{2}\.\d{4})/); if(m&&m[1]){ const [dd,mm,yy]=m[1].split('.'); const d=new Date(Number(yy),Number(mm)-1,Number(dd)); if(!isNaN(d.getTime())) return d; } return null; }
    function getActivityDate(headers,row,mainHeader){ const iH=headers.indexOf(mainHeader); if(iH!==-1 && row[iH]) return row[iH]; const iL=headers.indexOf('Log'); if(iL!==-1){ const d=extractDateFromLog(row[iL]); if(d) return d; } return ''; }

    function countForCode(code){
      const out = { 'Randevu Alındı':0,'İleri Tarih Randevu':0,'Randevu Teyitlendi':0,'Randevu Ertelendi':0,'Randevu İptal oldu':0,'Yeniden Aranacak':0,'Bilgi Verildi':0,'Fırsat İletildi':0,'İlgilenmiyor':0,'Ulaşılamadı':0 };
      // Randevular
      const shR = ss.getSheetByName('T Randevular') || ss.getSheetByName('Randevular');
      if (shR && shR.getLastRow()>1){
        const lc=shR.getLastColumn(); const h=shR.getRange(1,1,1,lc).getDisplayValues()[0]; const v=shR.getRange(2,1,shR.getLastRow()-1,lc).getDisplayValues();
        const iCode = h.indexOf('Kod')!==-1? h.indexOf('Kod'): h.indexOf('Temsilci Kodu');
        const iStatus = h.indexOf('Randevu durumu');
        for (const r of v){ 
          if (iCode!==-1 && String(r[iCode])!==String(code)) continue; 
          const d=getActivityDate(h,r,'Randevu Tarihi'); if (!withinRange(d,rangeStart,rangeEnd)) continue; 
          const sRaw=String(r[iStatus]||'').toLowerCase();
          const s = sRaw.includes('erte')? 'Randevu Ertelendi' : sRaw.includes('iptal')? 'Randevu İptal oldu' : r[iStatus];
          if(out.hasOwnProperty(s)) out[s]++;
        }
      }
      // Fırsatlar (exclude negatifler)
      const shF = ss.getSheetByName('T Fırsatlar') || ss.getSheetByName('Fırsatlar');
      if (shF && shF.getLastRow()>1){
        const lc=shF.getLastColumn(); const h=shF.getRange(1,1,1,lc).getValues()[0]; const v=shF.getRange(2,1,shF.getLastRow()-1,lc).getValues();
        const iCode = h.indexOf('Kod')!==-1? h.indexOf('Kod'): h.indexOf('Temsilci Kodu');
        const iStatus = h.indexOf('Fırsat Durumu');
        for (const r of v){ if (iCode!==-1 && String(r[iCode])!==String(code)) continue; const d=getActivityDate(h,r,'Fırsat Tarihi'); if (!withinRange(d,rangeStart,rangeEnd)) continue; const s=String(r[iStatus]||'').toLowerCase(); const norm = s.includes('ilet')? 'Fırsat İletildi': s.includes('bilgi')? 'Bilgi Verildi': s.includes('yeniden')||s.includes('ara')? 'Yeniden Aranacak': ''; if(norm) out[norm]++; }
      }
      // Negatifler
      const shS = ss.getSheetByName('T Aktivite Özet');
      if (shS && shS.getLastRow()>1){ 
        const v=shS.getRange(2,1,shS.getLastRow()-1,4).getValues(); 
        for (const r of v){ 
          if (String(r[0])!==String(code)) continue; 
          
          let d = null;
          const dateValue = r[1];
          
          // Date objesi mi string mi kontrol et
          if (dateValue instanceof Date) {
            d = dateValue;
          } else if (typeof dateValue === 'string') {
            const m = dateValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (m) {
              d = new Date(Number(m[3]), Number(m[2])-1, Number(m[1]));
            }
          }
          
          if(!d || isNaN(d.getTime())) continue; 
          if (d>=rangeStart && d<=rangeEnd){ 
            out['İlgilenmiyor']+=Number(r[2]||0); 
            out['Ulaşılamadı']+=Number(r[3]||0);
          } 
        } 
      }
      return out;
    }

    // Build sheet
    const sheetName = period==='daily'? `Günlük Karşılaştırma – ${label}` : period==='weekly'? `Haftalık Karşılaştırma – ${label}` : `Aylık Karşılaştırma – ${label}`;
    let sh = ss.getSheetByName(sheetName); if (!sh) sh = ss.insertSheet(sheetName);
    // Header
    const header = ['Kod','Randevu Alındı','İleri Tarih Randevu','Yeniden Aranacak','Bilgi Verildi','Fırsat İletildi','İlgilenmiyor','Ulaşılamadı','TOPLAM KONTAK','TOPLAM İŞLEM','Ulaşılamadı %','İlgilenmiyor %','Ulaşma Oranı %','Fırsat Oranı %'];
    sh.getRange(1,1,1,header.length).setValues([header]).setFontWeight('bold');

    // Upsert rows per code
    const existing = sh.getLastRow()>1? sh.getRange(2,1,sh.getLastRow()-1,header.length).getValues(): [];
    const codeToRow = new Map(); for (let i=0;i<existing.length;i++){ const c=existing[i][0]; if(c) codeToRow.set(String(c), i+2); }

    for (const code of codes){
      const c = countForCode(code);
      const toplamKontak = c['Randevu Alındı'] + c['İleri Tarih Randevu'] + c['Yeniden Aranacak'] + c['Bilgi Verildi'] + c['Fırsat İletildi'] + c['İlgilenmiyor'];
      const toplamIslem = toplamKontak + c['Ulaşılamadı'];
      const ulasPerc = toplamIslem>0? (c['Ulaşılamadı']/toplamIslem*100):0;
      const ilgiPerc = toplamKontak>0? (c['İlgilenmiyor']/toplamKontak*100):0;
      const ulasmaOrani = toplamIslem>0? ((toplamIslem - c['Ulaşılamadı'])/toplamIslem*100):0;
      const firsatOrani = toplamKontak>0? (c['Fırsat İletildi']/toplamKontak*100):0;
      const row = [code, c['Randevu Alındı'], c['İleri Tarih Randevu'], c['Yeniden Aranacak'], c['Bilgi Verildi'], c['Fırsat İletildi'], c['İlgilenmiyor'], c['Ulaşılamadı'], toplamKontak, toplamIslem, ulasPerc, ilgiPerc, ulasmaOrani, firsatOrani];
      if (codeToRow.has(String(code))) sh.getRange(codeToRow.get(String(code)), 1, 1, row.length).setValues([row]);
      else sh.getRange(sh.getLastRow()+1, 1, 1, row.length).setValues([row]);
    }

    sh.autoResizeColumns(1, header.length);
    return { success:true };

  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Haftalık Seri Karşılaştırma Raporu - Çalışan bazında haftalık karşılaştırma
 */
function generateComparisonWeeklySeriesManager(params) {
  console.log('Function started:', { action: 'generateComparisonWeeklySeriesManager', params });
  try {
    const codes = (params && params.codes) || [];
    if (!codes || codes.length === 0) {
      throw new Error('Temsilci kodu seçilmedi');
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Son 8 hafta için haftalık veri topla (eskiden yeniye doğru)
    const weeks = [];
    const today = new Date();
    
    for (let i = 7; i >= 0; i--) { // 7'den 0'a doğru (eskiden yeniye)
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (today.getDay() + 7 * i));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Yılın kaçıncı haftası olduğunu hesapla
      const weekNumber = Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
      
      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: `Hafta ${weekNumber} (${Utilities.formatDate(weekStart, Session.getScriptTimeZone(), 'dd.MM.yyyy')} - ${Utilities.formatDate(weekEnd, Session.getScriptTimeZone(), 'dd.MM.yyyy')})`
      });
    }

    // Her çalışan için haftalık veri topla
    const employeeData = {};
    
    console.log('Starting to collect data for employees:', codes);
    console.log('Week ranges:', weeks.map(w => ({ label: w.label, start: w.start, end: w.end })));
    
    for (const code of codes) {
      employeeData[code] = {};
      console.log(`\n=== Processing employee: ${code} ===`);
      
      for (const week of weeks) {
        console.log(`\n--- Week: ${week.label} (${week.start.toDateString()} to ${week.end.toDateString()}) ---`);
        const weekData = countActivitiesForPeriod(code, week.start, week.end);
        console.log(`Week data for ${code}:`, weekData);
        employeeData[code][week.label] = weekData;
      }
    }
    
    // DEBUG: Mevcut Log verilerini kontrol et
    console.log('\n=== DEBUG: Mevcut Log verilerini kontrol et ===');
    const shR = ss.getSheetByName('T Randevular');
    if (shR && shR.getLastRow() > 1) {
      const headers = shR.getRange(1, 1, 1, shR.getLastColumn()).getValues()[0];
      const values = shR.getRange(2, 1, Math.min(10, shR.getLastRow() - 1), shR.getLastColumn()).getValues();
      const idxCode = headers.indexOf('Kod') !== -1 ? headers.indexOf('Kod') : headers.indexOf('Temsilci Kodu');
      const idxLog = headers.indexOf('Log');
      
      console.log('Headers:', headers);
      console.log('Log column index:', idxLog);
      console.log('Sample Log data:');
      for (let i = 0; i < Math.min(5, values.length); i++) {
        const row = values[i];
        if (idxCode !== -1 && idxLog !== -1) {
          console.log(`Row ${i+1}: Code=${row[idxCode]}, Log="${row[idxLog]}"`);
        }
      }
    }
    
    console.log('\n=== FINAL EMPLOYEE DATA ===');
    console.log(JSON.stringify(employeeData, null, 2));

    // Rapor sayfasını oluştur - Tablo format
    const sheetName = 'Haftalık Seri Karşılaştırma';
    let sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      sheet.clear();
    } else {
      sheet = ss.insertSheet(sheetName);
    }

    // Activity türleri - Ertelenen ve İptal dahil
    const activityTypes = [
      'Randevu Alındı',
      'Ertelendi',
      'İptal',
      'Aktif Randevu', // Randevu Alındı - Ertelendi - İptal
      'İleri Tarih Randevu', 
      'Yeniden Aranacak',
      'Bilgi Verildi',
      'Fırsat İletildi',
      'İlgilenmiyor',
      'Ulaşılamadı'
    ];

    // Veri satırları - Tablo format
    const dataRows = [];
    console.log('Building data rows in table format...');
    
    for (const week of weeks) {
      // Hafta başlığı
      dataRows.push([week.label]);
      console.log(`Added week header: ${week.label}`);
      
      // Activity başlıkları
      const headerRow = ['Çalışan'];
      for (const activity of activityTypes) {
        headerRow.push(activity);
      }
      dataRows.push(headerRow);
      
      // Her çalışan için veri satırı
      for (const code of codes) {
        const weekData = employeeData[code][week.label] || {};
        console.log(`  ${code} week data:`, weekData);
        
        const dataRow = [code];
        for (const activity of activityTypes) {
          const value = weekData[activity] || 0;
          dataRow.push(value);
        }
        dataRows.push(dataRow);
        console.log(`    Added data row for ${code}:`, dataRow);
      }
      
      // Haftalar arası boşluk - 8 sütunlu boş satır
      const emptyRow = new Array(1 + activityTypes.length).fill('');
      dataRows.push(emptyRow);
    }

    console.log('Final dataRows count:', dataRows.length);
    
    // DEBUG: Her satırın sütun sayısını kontrol et
    console.log('DEBUG: Checking column counts for each row:');
    for (let i = 0; i < Math.min(5, dataRows.length); i++) {
      console.log(`Row ${i}: ${dataRows[i].length} columns - [${dataRows[i].join(', ')}]`);
    }

    if (dataRows.length > 0) {
      // Sütun sayısını hesapla (Çalışan + Activity türleri)
      const columnCount = 1 + activityTypes.length; // 1 (Çalışan) + 7 (Activity türleri) = 8
      console.log('Expected column count:', columnCount);
      
      // Her satırın doğru sütun sayısında olduğundan emin ol
      for (let i = 0; i < dataRows.length; i++) {
        if (dataRows[i].length !== columnCount) {
          console.log(`WARNING: Row ${i} has ${dataRows[i].length} columns, expected ${columnCount}`);
          // Eksik sütunları doldur
          while (dataRows[i].length < columnCount) {
            dataRows[i].push('');
          }
          // Fazla sütunları kes
          if (dataRows[i].length > columnCount) {
            dataRows[i] = dataRows[i].slice(0, columnCount);
          }
        }
      }
      
      sheet.getRange(1, 1, dataRows.length, columnCount).setValues(dataRows);
      console.log('Data written to sheet successfully');
      console.log('Column count:', columnCount, 'Data rows:', dataRows.length);
    } else {
      console.log('No data rows to write');
    }

    sheet.autoResizeColumns(1, activityTypes.length + 1); // Çalışan + Activity sütunları
    
    SpreadsheetApp.getUi().alert('Tamam', 'Haftalık Seri Karşılaştırma raporu oluşturuldu.', SpreadsheetApp.getUi().ButtonSet.OK);
    
    return { success: true, weeks: weeks.length, employees: codes.length };

  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Belirli bir dönem için aktivite sayımlarını hesapla
 */
function countActivitiesForPeriod(employeeCode, startDate, endDate) {
  console.log(`\n🔍 countActivitiesForPeriod called for ${employeeCode} from ${startDate.toDateString()} to ${endDate.toDateString()}`);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    function withinRange(value, start, end) {
      try {
        if (!value) return false;
        const d = value instanceof Date ? value : new Date(String(value));
        if (isNaN(d.getTime())) return false;
        return d >= start && d <= end;
      } catch (e) { return false; }
    }

    function parseDdMmYyyy(dateStr) {
      if (!dateStr) return null;
      const m = String(dateStr).match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
      if (m) {
        return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
      }
      return null;
    }

    const counts = {
      'Randevu Alındı': 0,
      'Ertelendi': 0,
      'İptal': 0,
      'Aktif Randevu': 0, // Hesaplanacak
      'İleri Tarih Randevu': 0,
      'Yeniden Aranacak': 0,
      'Bilgi Verildi': 0,
      'Fırsat İletildi': 0,
      'İlgilenmiyor': 0,
      'Ulaşılamadı': 0
    };

    // Randevular - Log kolonundan işlem tarihini çıkar
    const shR = ss.getSheetByName('T Randevular');
    if (shR && shR.getLastRow() > 1) {
      const headers = shR.getRange(1, 1, 1, shR.getLastColumn()).getValues()[0];
      const values = shR.getRange(2, 1, shR.getLastRow() - 1, shR.getLastColumn()).getValues();
      const idxCode = headers.indexOf('Kod') !== -1 ? headers.indexOf('Kod') : headers.indexOf('Temsilci Kodu');
      const idxStatus = headers.indexOf('Randevu durumu');
      const idxLog = headers.indexOf('Log');
      
      console.log(`  📋 T Randevular headers:`, headers);
      console.log(`  🔍 Log kolonu index: ${idxLog}`);
      console.log(`  📅 Randevu Tarihi index: ${headers.indexOf('Randevu Tarihi')}`);
      
      for (const row of values) {
        if (idxCode !== -1 && String(row[idxCode]) !== String(employeeCode)) continue;
        
        // Log kolonundan işlem tarihini çıkar
        let processDate = null;
        if (idxLog !== -1 && row[idxLog]) {
          const logText = String(row[idxLog]);
          console.log(`  📝 Log text: "${logText}"`);
          const dateMatch = logText.match(/(\d{2}\.\d{2}\.\d{4})/);
          if (dateMatch) {
            processDate = parseDdMmYyyy(dateMatch[1]);
            console.log(`  ✅ Log'dan tarih çıkarıldı: ${dateMatch[1]} → ${processDate}`);
          }
        }
        
        // Eğer Log'dan tarih çıkarılamazsa, Randevu Tarihi'ni kullan
        if (!processDate) {
          const idxDate = headers.indexOf('Randevu Tarihi');
          if (idxDate !== -1) {
            processDate = row[idxDate];
            console.log(`  ⚠️ Log bulunamadı, Randevu Tarihi kullanıldı: ${processDate}`);
          }
        }
        
        if (!withinRange(processDate, startDate, endDate)) continue;
        const status = idxStatus !== -1 ? String(row[idxStatus] || '') : '';
        
        // Randevu durumlarını kontrol et
        if (status.toLowerCase().includes('ertelen') || status.toLowerCase().includes('ertelendi')) {
          counts['Ertelendi']++;
        } else if (status.toLowerCase().includes('iptal') || status.toLowerCase().includes('iptal edildi')) {
          counts['İptal']++;
        } else if (counts.hasOwnProperty(status)) {
          counts[status]++;
        }
      }
    }

    // Fırsatlar - Log kolonundan işlem tarihini çıkar
    const shF = ss.getSheetByName('T Fırsatlar');
    if (shF && shF.getLastRow() > 1) {
      const headers = shF.getRange(1, 1, 1, shF.getLastColumn()).getValues()[0];
      const values = shF.getRange(2, 1, shF.getLastRow() - 1, shF.getLastColumn()).getValues();
      const idxCode = headers.indexOf('Kod') !== -1 ? headers.indexOf('Kod') : headers.indexOf('Temsilci Kodu');
      const idxStatus = headers.indexOf('Fırsat Durumu');
      const idxLog = headers.indexOf('Log');
      
      for (const row of values) {
        if (idxCode !== -1 && String(row[idxCode]) !== String(employeeCode)) continue;
        
        // Log kolonundan işlem tarihini çıkar
        let processDate = null;
        if (idxLog !== -1 && row[idxLog]) {
          const logText = String(row[idxLog]);
          const dateMatch = logText.match(/(\d{2}\.\d{2}\.\d{4})/);
          if (dateMatch) {
            processDate = parseDdMmYyyy(dateMatch[1]);
          }
        }
        
        // Eğer Log'dan tarih çıkarılamazsa, Fırsat Tarihi'ni kullan
        if (!processDate) {
          const idxDate = headers.indexOf('Fırsat Tarihi');
          if (idxDate !== -1) {
            processDate = row[idxDate];
          }
        }
        
        if (!withinRange(processDate, startDate, endDate)) continue;
        const status = idxStatus !== -1 ? String(row[idxStatus] || '') : '';
        const s = status.toLowerCase();
        const norm = s.includes('ilet') ? 'Fırsat İletildi' : s.includes('bilgi') ? 'Bilgi Verildi' : s.includes('yeniden') || s.includes('ara') ? 'Yeniden Aranacak' : '';
        if (norm && counts.hasOwnProperty(norm)) counts[norm]++;
      }
    }

    // Negatifler - T Aktivite Özet'ten
    const shS = ss.getSheetByName('T Aktivite Özet');
    if (shS && shS.getLastRow() > 1) {
      const values = shS.getRange(2, 1, shS.getLastRow() - 1, 4).getValues();
      
      for (const row of values) {
        if (String(row[0]) !== String(employeeCode)) continue;
        let date = null;
        const dateValue = row[1];
        
        // Date objesi mi string mi kontrol et
        if (dateValue instanceof Date) {
          date = dateValue;
        } else if (typeof dateValue === 'string') {
          const m = dateValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
          if (m) {
            date = new Date(Number(m[3]), Number(m[2])-1, Number(m[1]));
          }
        }
        
        if (!date || isNaN(date.getTime()) || !withinRange(date, startDate, endDate)) continue;
        
        const ilgi = Number(row[2] || 0);
        const ulas = Number(row[3] || 0);
        
        if (ilgi > 0) counts['İlgilenmiyor'] += ilgi;
        if (ulas > 0) counts['Ulaşılamadı'] += ulas;
      }
    }

    // Aktif Randevu = Randevu Alındı + Randevu Teyitlendi (satır bazlı, bağımsız)
    counts['Aktif Randevu'] = (counts['Randevu Alındı'] + counts['Randevu Teyitlendi']);
    
    // Toplamları hesapla
    counts['TOPLAM KONTAK'] = counts['Randevu Alındı'] + counts['İleri Tarih Randevu'] + counts['Yeniden Aranacak'] + counts['Bilgi Verildi'] + counts['Fırsat İletildi'] + counts['İlgilenmiyor'];
    counts['TOPLAM İŞLEM'] = counts['TOPLAM KONTAK'] + counts['Ulaşılamadı'];

    return counts;

  } catch (error) {
    console.error('countActivitiesForPeriod failed:', error);
    return {};
  }
}

function generateMonthlyReportManager(options) {
  console.log('Function started:', options || {});
  try {
    const scope = (options && options.scope) || 'all'; // 'all' | 'employee'
    const filterCode = (options && options.employeeCode) || '';

    const ss = SpreadsheetApp.getActiveSpreadsheet();

    // Month range
    function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1, 0,0,0,0); }
    function endOfMonth(d){ return new Date(d.getFullYear(), d.getMonth()+1, 0, 23,59,59,999); }

    const today = new Date();
    const mStart = startOfMonth(today);
    const mEnd = endOfMonth(today);

    function toKey(d) { return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy'); }
    const rangeLabel = `${toKey(mStart)} – ${toKey(mEnd)}`;

    function withinMonth(value) {
      try {
        if (!value) return false;
        const d = value instanceof Date ? value : new Date(String(value));
        if (isNaN(d.getTime())) return false;
        return d >= mStart && d <= mEnd;
      } catch (err) { return false; }
    }

    function extractDateFromLog(logValue) {
      const s = String(logValue || '');
      const m = s.match(/(\d{2}\.\d{2}\.\d{4})/);
      if (m && m[1]) return parseDdMmYyyy(m[1]);
      return null;
    }

    function getActivityDate(headers, row, mainDateHeader) {
      // Prefer the current cell date (manual override), fallback to Log
      const idxMain = headers.indexOf(mainDateHeader);
      if (idxMain !== -1 && row[idxMain]) return row[idxMain];
      const idxLog = headers.indexOf('Log');
      if (idxLog !== -1) {
        const d = extractDateFromLog(row[idxLog]);
        if (d) return d;
      }
      return '';
    }

    const counts = {
      'Randevu Alındı': 0,
      'İleri Tarih Randevu': 0,
      'Randevu Teyitlendi': 0,
      'Randevu Ertelendi': 0,
      'Randevu İptal oldu': 0,
      'Yeniden Aranacak': 0,
      'Bilgi Verildi': 0,
      'Fırsat İletildi': 0,
      'İlgilenmiyor': 0,
      'Ulaşılamadı': 0
    };

    // Randevular
    const shR = ss.getSheetByName('T Randevular') || ss.getSheetByName('Randevular');
    if (shR && shR.getLastRow() > 1) {
      const lastCol = shR.getLastColumn();
      const headers = shR.getRange(1,1,1,lastCol).getValues()[0];
      const values = shR.getRange(2,1,shR.getLastRow()-1,lastCol).getValues();
      const idxCode = headers.indexOf('Kod') !== -1 ? headers.indexOf('Kod') : headers.indexOf('Temsilci Kodu');
      const idxStatus = headers.indexOf('Randevu durumu');
      for (const row of values) {
        if (scope === 'employee' && filterCode && idxCode !== -1 && String(row[idxCode]) !== String(filterCode)) continue;
        const actDate = getActivityDate(headers, row, 'Randevu Tarihi');
        if (!withinMonth(actDate)) continue;
        const status = idxStatus !== -1 ? String(row[idxStatus] || '') : '';
        if (!status) continue;
        if (counts.hasOwnProperty(status)) counts[status]++;
      }
    }

    // Fırsatlar (exclude İlgilenmiyor/Ulaşılamadı; they come from summary)
    const shF = ss.getSheetByName('T Fırsatlar') || ss.getSheetByName('Fırsatlar');
    if (shF && shF.getLastRow() > 1) {
      const lastCol = shF.getLastColumn();
      const headers = shF.getRange(1,1,1,lastCol).getValues()[0];
      const values = shF.getRange(2,1,shF.getLastRow()-1,lastCol).getValues();
      const idxCode = headers.indexOf('Kod') !== -1 ? headers.indexOf('Kod') : headers.indexOf('Temsilci Kodu');
      const idxStatus = headers.indexOf('Fırsat Durumu');
      for (const row of values) {
        if (scope === 'employee' && filterCode && idxCode !== -1 && String(row[idxCode]) !== String(filterCode)) continue;
        const actDate = getActivityDate(headers, row, 'Fırsat Tarihi');
        if (!withinMonth(actDate)) continue;
        const status = idxStatus !== -1 ? String(row[idxStatus] || '') : '';
        if (!status) continue;
        const s = status.toLowerCase();
        const norm = s.includes('ilet') ? 'Fırsat İletildi' : s.includes('bilgi') ? 'Bilgi Verildi' : s.includes('yeniden') || s.includes('ara') ? 'Yeniden Aranacak' : '';
        if (norm && counts.hasOwnProperty(norm)) counts[norm]++;
      }
    }

    // Negatifler: özet ya da fallback
    const negRowsMonthly = getNegativeSummaryRows(scope, filterCode);
    for (const r of negRowsMonthly) {
      const [kod, tarih, ilgi, ulas] = r;
      if (scope === 'employee' && filterCode && String(kod) !== String(filterCode)) continue;
      let d = null;
      if (tarih instanceof Date) {
        d = tarih;
      } else if (typeof tarih === 'string') {
        const m = tarih.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (m) {
          d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        }
      }
      
      if (!d || isNaN(d.getTime())) continue;
      if (d >= mStart && d <= mEnd) {
        counts['İlgilenmiyor'] += Number(ilgi || 0);
        counts['Ulaşılamadı'] += Number(ulas || 0);
      }
    }

    const toplamKontak = counts['Randevu Alındı'] + counts['İleri Tarih Randevu'] + counts['Yeniden Aranacak'] + counts['Bilgi Verildi'] + counts['Fırsat İletildi'] + counts['İlgilenmiyor'];
    const toplamIslem = toplamKontak + counts['Ulaşılamadı'];

    // Write report
    const title = scope === 'employee' && filterCode ? `Aylık Rapor (${filterCode}) - ${rangeLabel}` : `Aylık Rapor (Genel) - ${rangeLabel}`;
    let report = ss.getSheetByName(title);
    if (!report) report = ss.insertSheet(title);
    else report.clear();

    const rows = [
      ['📊 AYLIK RAPOR', rangeLabel],
      ['1. Randevu Alındı', counts['Randevu Alındı']],
      ['- Randevu Teyitlendi', counts['Randevu Teyitlendi']],
      ['- Randevu Ertelendi', counts['Randevu Ertelendi']],
      ['- Randevu İptal oldu', counts['Randevu İptal oldu']],
      ['2. İleri Tarih Randevu', counts['İleri Tarih Randevu']],
      ['3. Yeniden Aranacak', counts['Yeniden Aranacak']],
      ['4. Bilgi Verildi', counts['Bilgi Verildi']],
      ['5. Fırsat İletildi', counts['Fırsat İletildi']],
      ['6. İlgilenmiyor', counts['İlgilenmiyor']],
      ['📊 TOPLAM KONTAK', toplamKontak],
      ['7. Ulaşılamadı', counts['Ulaşılamadı']],
      ['📈 TOPLAM İŞLEM', toplamIslem]
    ];

    report.getRange(1,1,rows.length,2).setValues(rows);
    report.getRange(1,1,1,2).setFontWeight('bold');
    report.getRange(2,2,rows.length-1,1).setHorizontalAlignment('center').setFontStyle('italic');
    try {
      const labels = rows.map(r => r[0]);
      const idxKontak = labels.indexOf('📊 TOPLAM KONTAK');
      const idxIslem = labels.indexOf('📈 TOPLAM İŞLEM');
      if (idxKontak !== -1) report.getRange(idxKontak + 1, 1, 1, 2).setBackground('#E3F2FD');
      if (idxIslem !== -1) report.getRange(idxIslem + 1, 1, 1, 2).setBackground('#E8F5E8');
    } catch(e) { console.log('⚠️ Monthly totals highlight failed:', e && e.message); }
    report.getRange(rows.length,1,1,2).setFontStyle('italic').setHorizontalAlignment('center');
    report.autoResizeColumns(1,2);

    console.log('Processing complete:', { scope, filterCode, rangeLabel });
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function generateDailyReportSeriesManager(options) {
  console.log('Function started:', options || {});
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const daysBack = (options && options.days) ? Math.max(1, Math.min(90, Number(options.days))) : 7; // default last 7 days

    // Helper
    function toKey(d){ return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy'); }
    function extractDateFromLog(logValue){ 
      const s=String(logValue||''); 
      const m=s.match(/(\d{2}\.\d{2}\.\d{4})/); 
      if(m&&m[1]) {
        const [dd, mm, yy] = m[1].split('.');
        return new Date(Number(yy), Number(mm) - 1, Number(dd));
      }
      return null; 
    }
    function getActionDate(headers,row,mainHeader){ const iMain=headers.indexOf(mainHeader); if(iMain!==-1 && row[iMain]) return row[iMain]; const iLog=headers.indexOf('Log'); if(iLog!==-1){ const d=extractDateFromLog(row[iLog]); if(d) return d; } return null; }

    // Prepare target sheet
    const sheetName = 'Günlük Seri';
    let sh = ss.getSheetByName(sheetName); if (!sh) sh = ss.insertSheet(sheetName);
    const header = ['Tarih','Randevu Alındı','İleri Tarih Randevu','Yeniden Aranacak','Bilgi Verildi','Fırsat İletildi','İlgilenmiyor','Ulaşılamadı','TOPLAM KONTAK','TOPLAM İŞLEM'];
    sh.getRange(1,1,1,header.length).setValues([header]).setFontWeight('bold');

    // Build a date list (today going backwards)
    const today = new Date(); today.setHours(0,0,0,0);
    const dateKeys = [];
    for (let i=0;i<daysBack;i++){ const d=new Date(today); d.setDate(today.getDate()-i); dateKeys.push(toKey(d)); }

    // Build index for upsert
    const existing = sh.getLastRow()>1? sh.getRange(2,1,sh.getLastRow()-1,header.length).getValues(): [];
    const dateToRow = new Map(); for (let i=0;i<existing.length;i++){ const k=String(existing[i][0]||''); if(k) dateToRow.set(k, i+2); }

    // Count function for a date key
    function countForDateKey(key){
      const counts = { 'Randevu Alındı':0,'İleri Tarih Randevu':0,'Randevu Teyitlendi':0,'Randevu Ertelendi':0,'Randevu İptal oldu':0,'Yeniden Aranacak':0,'Bilgi Verildi':0,'Fırsat İletildi':0,'İlgilenmiyor':0,'Ulaşılamadı':0 };
      const keyStart = (() => {
        const m = key.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
        if (m) {
          return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
        }
        return null;
      })();
      if (!keyStart) return counts;
      const a = new Date(keyStart.getFullYear(), keyStart.getMonth(), keyStart.getDate(), 0,0,0,0);
      const b = new Date(keyStart.getFullYear(), keyStart.getMonth(), keyStart.getDate(), 23,59,59,999);

      // Randevular
      const shR = ss.getSheetByName('T Randevular');
      if (shR && shR.getLastRow()>1){ const lc=shR.getLastColumn(); const h=shR.getRange(1,1,1,lc).getValues()[0]; const v=shR.getRange(2,1,shR.getLastRow()-1,lc).getValues(); const iStatus=h.indexOf('Randevu durumu'); for (const r of v){ const d=getActionDate(h,r,'Randevu Tarihi'); if(!d) continue; if (d>=a && d<=b){ const s=String(r[iStatus]||''); if(counts.hasOwnProperty(s)) counts[s]++; } } }
      // Fırsatlar (exclude negatifler)
      const shF = ss.getSheetByName('T Fırsatlar');
      if (shF && shF.getLastRow()>1){ const lc=shF.getLastColumn(); const h=shF.getRange(1,1,1,lc).getValues()[0]; const v=shF.getRange(2,1,shF.getLastRow()-1,lc).getValues(); const iStatus=h.indexOf('Fırsat Durumu'); for (const r of v){ const d=getActionDate(h,r,'Fırsat Tarihi'); if(!d) continue; if (d>=a && d<=b){ const s=String(r[iStatus]||'').toLowerCase(); const norm=s.includes('ilet')? 'Fırsat İletildi': s.includes('bilgi')? 'Bilgi Verildi': s.includes('yeniden')||s.includes('ara')? 'Yeniden Aranacak': ''; if(norm) counts[norm]++; } } }
      // Negatifler
      const shS = ss.getSheetByName('T Aktivite Özet');
      if (shS && shS.getLastRow()>1){ 
        const v=shS.getRange(2,1,shS.getLastRow()-1,4).getValues(); 
        for (const r of v){ 
          let d = null;
          const dateValue = r[1];
          
          // Date objesi mi string mi kontrol et
          if (dateValue instanceof Date) {
            d = dateValue;
          } else if (typeof dateValue === 'string') {
            const m = dateValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (m) {
              d = new Date(Number(m[3]), Number(m[2])-1, Number(m[1]));
            }
          }
          
          if(!d || isNaN(d.getTime())) continue; 
          if (toKey(d)===key){ 
            counts['İlgilenmiyor']+=Number(r[2]||0); 
            counts['Ulaşılamadı']+=Number(r[3]||0);
          } 
        } 
      }
      return counts;
    }

    for (const key of dateKeys){
      const c = countForDateKey(key);
      const toplamKontak = c['Randevu Alındı'] + c['İleri Tarih Randevu'] + c['Yeniden Aranacak'] + c['Bilgi Verildi'] + c['Fırsat İletildi'] + c['İlgilenmiyor'];
      const toplamIslem = toplamKontak + c['Ulaşılamadı'];
      const row = [key, c['Randevu Alındı'], c['İleri Tarih Randevu'], c['Yeniden Aranacak'], c['Bilgi Verildi'], c['Fırsat İletildi'], c['İlgilenmiyor'], c['Ulaşılamadı'], toplamKontak, toplamIslem];
      if (dateToRow.has(key)) sh.getRange(dateToRow.get(key), 1, 1, row.length).setValues([row]);
      else sh.getRange(sh.getLastRow()+1, 1, 1, row.length).setValues([row]);
    }

    sh.autoResizeColumns(1, header.length);
    return { success:true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// Add menu item under Reports (General) to run daily series
function createManagerMenu_v2_deprecated() {
  try {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('YÖNETİCİ');
    // "Tüm Verileri Senkronize Et" kaldırıldı - artık gerekli değil
    // Dashboard sistemi direkt temsilci dosyalarından veri çekiyor
    // ... existing code remains ...
    const reportsGeneral = ui.createMenu('Raporlar (Genel)');
    reportsGeneral.addItem('Günlük', 'generateDailyReportAutoSeriesManager')
                  .addItem('Haftalık', 'generateReportsGeneralWeekly')
                  .addItem('Aylık', 'generateReportsGeneralMonthly');
    menu.addSubMenu(reportsGeneral);
    // ... existing code remains ...
    menu.addToUi();
  } catch (error) {
    console.error('Error creating manager menu:', error);
  }
}

function openEmployeeMultiSelectReportDailySeries(){ openEmployeeMultiSelectReport('daily-series'); }
function openEmployeeMultiSelectReportWeeklySeries(){ openEmployeeMultiSelectReport('weekly-series'); }

function generateComparisonSeriesManager(params) {
  console.log('Function started:', params || {});
  try {
    // Girdi doğrulama
    if (!params || !Array.isArray(params.codes) || params.codes.length === 0) {
      SpreadsheetApp.getUi().alert('Uyarı', 'Lütfen en az bir temsilci seçiniz.', SpreadsheetApp.getUi().ButtonSet.OK);
      return { success: false, reason: 'no-codes' };
    }

    const selectedCodes = params.codes.map(String);
    const ss = SpreadsheetApp.getActiveSpreadsheet();

    function toKey(dateObj) {
      return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'dd.MM.yyyy');
    }
    function parseDdMmYyyy(str) {
      const s = String(str || '').trim();
      if (!/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return null;
      const [dd, mm, yy] = s.split('.');
      const d = new Date(Number(yy), Number(mm) - 1, Number(dd));
      return isNaN(d.getTime()) ? null : d;
    }
    function getDateObj(value) {
      if (value instanceof Date && !isNaN(value.getTime())) return value;
      return parseDdMmYyyy(value);
    }
    function extractDateFromLog(logValue) {
      const s = String(logValue || '');
      const m = s.match(/(\d{2}\.\d{2}\.\d{4})/);
      if (m && m[1]) return parseDdMmYyyy(m[1]);
      return null;
    }
    function getActionDate(headers, row, mainHeader) {
      // Günlük mantığı: LOG tarihi öncelik, hücredeki tarih yedek
      const idxLog = headers.indexOf('Log');
      if (idxLog !== -1) {
        const d = extractDateFromLog(row[idxLog]);
        if (d) return d;
      }
      const idxMain = headers.indexOf(mainHeader);
      if (idxMain !== -1) {
        const d = getDateObj(row[idxMain]);
        if (d) return d;
      }
      return null;
    }
    function findIndex(headers, candidates) {
      for (const name of candidates) {
        let idx = headers.indexOf(name);
        if (idx !== -1) return idx;
      }
      // Case-insensitive fallback
      const lowered = headers.map(h => String(h || '').toLowerCase());
      for (const name of candidates) {
        const j = lowered.indexOf(String(name).toLowerCase());
        if (j !== -1) return j;
      }
      return -1;
    }

    // Hedef sayfa
    const sheetName = 'Günlük Karşılaştırma Seri';
    let targetSheet = ss.getSheetByName(sheetName);
    if (!targetSheet) targetSheet = ss.insertSheet(sheetName);

    const header = [
      'Tarih', 'Kod',
      'Randevu Alındı', 'İleri Tarih Randevu',
      'Yeniden Aranacak', 'Bilgi Verildi', 'Fırsat İletildi',
      'İlgilenmiyor', 'Ulaşılamadı',
      'TOPLAM KONTAK', 'TOPLAM İŞLEM',
      'Ulaşılamadı %', 'İlgilenmiyor %', 'Ulaşma Oranı %', 'Fırsat Oranı %'
    ];
    targetSheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');

    // Kaynakları tek seferde oku
    const shR = ss.getSheetByName('T Randevular');
    const shF = ss.getSheetByName('T Fırsatlar');
    const shS = ss.getSheetByName('T Aktivite Özet');

    let rHeaders = [], rValues = [];
    if (shR && shR.getLastRow() > 1) {
      const lc = shR.getLastColumn();
      rHeaders = shR.getRange(1, 1, 1, lc).getValues()[0];
      rValues = shR.getRange(2, 1, shR.getLastRow() - 1, lc).getValues();
    }

    let fHeaders = [], fValues = [];
    if (shF && shF.getLastRow() > 1) {
      const lc = shF.getLastColumn();
      fHeaders = shF.getRange(1, 1, 1, lc).getValues()[0];
      fValues = shF.getRange(2, 1, shF.getLastRow() - 1, lc).getValues();
    }

    let sValues = [];
    if (shS && shS.getLastRow() > 1) {
      // Beklenen: [Kod, Tarih, İlgilenmiyor, Ulaşılamadı]
      sValues = shS.getRange(2, 1, shS.getLastRow() - 1, 4).getValues();
    }

    // Tarih aralığını belirle (seçilen temsilciler bazında min-max)
    let minDate = null;
    let maxDate = null;

    const rIdxCode = rHeaders.length ? findIndex(rHeaders, ['Kod', 'Temsilci Kodu']) : -1;
    const rIdxStatus = rHeaders.length ? findIndex(rHeaders, ['Randevu durumu', 'Randevu Durumu']) : -1;
    for (const row of rValues) {
      if (rIdxCode === -1) break;
      if (!selectedCodes.includes(String(row[rIdxCode]))) continue;
      const d = getActionDate(rHeaders, row, 'Randevu Tarihi');
      if (!d) continue;
      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;
    }

    const fIdxCode = fHeaders.length ? findIndex(fHeaders, ['Kod', 'Temsilci Kodu']) : -1;
    const fIdxStatus = fHeaders.length ? findIndex(fHeaders, ['Fırsat Durumu']) : -1;
    for (const row of fValues) {
      if (fIdxCode === -1) break;
      if (!selectedCodes.includes(String(row[fIdxCode]))) continue;
      const d = getActionDate(fHeaders, row, 'Fırsat Tarihi');
      if (!d) continue;
      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;
    }

    for (const row of sValues) {
      const code = String(row[0] || '');
      if (!selectedCodes.includes(code)) continue;
      const d = parseDdMmYyyy(String(row[1] || ''));
      if (!d) continue;
      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;
    }

    if (!minDate || !maxDate) {
      // Hiç veri yoksa en azından bugünü yaz
      const today = new Date(); today.setHours(0, 0, 0, 0);
      minDate = new Date(today);
      maxDate = new Date(today);
    } else {
      // Zamanı sıfırla
      minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
    }
    // Başlangıç günü (opsiyonel): params.startDate 'YYYY-MM-DD'
    if (params && params.startDate) {
      try {
        const sd = new Date(String(params.startDate));
        if (!isNaN(sd.getTime())) {
          const start = new Date(sd.getFullYear(), sd.getMonth(), sd.getDate(), 0,0,0,0);
          const today = new Date(); today.setHours(0,0,0,0);
          minDate = start;
          maxDate = today;
        }
      } catch(e) {}
    }

    // Gün listesi (artarak)
    const dayKeys = [];
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
      dayKeys.push(toKey(d));
    }

    // Sayaçlar: key = `${dayKey}||${code}`
    const bucket = new Map();
    function ensureCounter(k) {
      if (!bucket.has(k)) {
        bucket.set(k, {
          randevuAlindi: 0,
          ileriTarih: 0,
          yenidenAranacak: 0,
          bilgiVerildi: 0,
          firsatIletildi: 0,
          ilgilenmiyor: 0,
          ulasilamadi: 0
        });
      }
      return bucket.get(k);
    }

    // Randevular sayımı (HAM veri'den aktarıldı hariç)
    if (rValues.length && rIdxCode !== -1 && rIdxStatus !== -1) {
      const iLog = rHeaders.indexOf('Log');
      for (const row of rValues) {
        const code = String(row[rIdxCode] || '');
        if (!selectedCodes.includes(code)) continue;
        if (iLog !== -1 && String(row[iLog]||'').includes("Ham veri'den aktarıldı")) continue;
        const d = getActionDate(rHeaders, row, 'Randevu Tarihi');
        if (!d) continue;
        const key = toKey(d);
        const status = String(row[rIdxStatus] || '');
        const c = ensureCounter(`${key}||${code}`);
        if (status === 'Randevu Alındı') c.randevuAlindi++;
        else if (status === 'İleri Tarih Randevu') c.ileriTarih++;
      }
    }

    // Fırsatlar sayımı (negatifler hariç, HAM veri'den aktarıldı hariç)
    if (fValues.length && fIdxCode !== -1 && fIdxStatus !== -1) {
      const iLogF = fHeaders.indexOf('Log');
      for (const row of fValues) {
        const code = String(row[fIdxCode] || '');
        if (!selectedCodes.includes(code)) continue;
        if (iLogF !== -1 && String(row[iLogF]||'').includes("Ham veri'den aktarıldı")) continue;
        const d = getActionDate(fHeaders, row, 'Fırsat Tarihi');
        if (!d) continue;
        const key = toKey(d);
        const s = String(row[fIdxStatus] || '').toLowerCase();
        const c = ensureCounter(`${key}||${code}`);
        if (s.includes('ilet')) c.firsatIletildi++;
        else if (s.includes('bilgi')) c.bilgiVerildi++;
        else if (s.includes('yeniden') || s.includes('ara')) c.yenidenAranacak++;
      }
    }

    // Negatifler: T Aktivite Özet (Kod, Tarih, İlgilenmiyor, Ulaşılamadı)
    if (sValues.length) {
      for (const row of sValues) {
        const code = String(row[0] || '');
        if (!selectedCodes.includes(code)) continue;
        const d = parseDdMmYyyy(String(row[1] || ''));
        if (!d) continue;
        const key = toKey(d);
        const c = ensureCounter(`${key}||${code}`);
        c.ilgilenmiyor += Number(row[2] || 0);
        c.ulasilamadi += Number(row[3] || 0);
      }
    }

    // ÇIKIŞ: Tarih -> seçilen kodlar sırasıyla. Aktivite yoksa metrikler boş.
    // Önce tüm eski veriyi temizleyip düzenli sırayla yazacağız
    const totalRows = dayKeys.length * selectedCodes.length;
    if (totalRows === 0) {
      targetSheet.getRange(2, 1, Math.max(0, targetSheet.getLastRow() - 1), header.length).clearContent();
      return { success: true, rows: 0 };
    }

    // Yazılacak matris (tarih bir kez yazılsın)
    const output = new Array(totalRows);
    const dateRows = [];
    let idx = 0;
    for (const dayKey of dayKeys) {
      for (let ci = 0; ci < selectedCodes.length; ci++) {
        const code = selectedCodes[ci];
        const k = `${dayKey}||${code}`;
        const isFirstOfDay = (ci === 0);
        const dateCell = isFirstOfDay ? dayKey : '';
        if (bucket.has(k)) {
          const c = bucket.get(k);
          const toplamKontak = c.randevuAlindi + c.ileriTarih + c.yenidenAranacak + c.bilgiVerildi + c.firsatIletildi + c.ilgilenmiyor;
          const toplamIslem = toplamKontak + c.ulasilamadi;
          const ulasilamadiYuzde = toplamIslem > 0 ? (c.ulasilamadi / toplamIslem * 100) : '';
          const ilgilenmiyorYuzde = toplamKontak > 0 ? (c.ilgilenmiyor / toplamKontak * 100) : '';
          const ulasmaOrani = toplamIslem > 0 ? ((toplamIslem - c.ulasilamadi) / toplamIslem * 100) : '';
          const firsatOrani = toplamKontak > 0 ? (c.firsatIletildi / toplamKontak * 100) : '';
          output[idx] = [
            dateCell, code,
            c.randevuAlindi, c.ileriTarih,
            c.yenidenAranacak, c.bilgiVerildi, c.firsatIletildi,
            c.ilgilenmiyor, c.ulasilamadi,
            toplamKontak, toplamIslem,
            ulasilamadiYuzde, ilgilenmiyorYuzde, ulasmaOrani, firsatOrani
          ];
        } else {
          // Aktivite yok: metrikler boş
          output[idx] = [dateCell, code, '', '', '', '', '', '', '', '', '', '', '', '', ''];
        }
        if (isFirstOfDay) {
          const rowNumber = 2 + idx; // header satırı +1, 0-index düzeltmesi +1
          dateRows.push(rowNumber);
        }
        idx++;
      }
    }

    // Eski veri temizle ve yeni veriyi tek seferde yaz
    if (targetSheet.getLastRow() > 1) {
      targetSheet.getRange(2, 1, targetSheet.getLastRow() - 1, header.length).clearContent();
    }
    if (output.length > 0) {
      // Mevcut birleşmeleri kaldır (tarih sütunu)
      targetSheet.getRange(2, 1, output.length, 1).breakApart();
      targetSheet.getRange(2, 1, output.length, header.length).setValues(output);
      // Tarih hücrelerini italik ve vurgulu yap
      if (dateRows.length > 0) {
        const ranges = dateRows.map(r => `A${r}:A${r}`);
        targetSheet.getRangeList(ranges).setFontStyle('italic').setFontWeight('bold').setFontSize(11);
        // Alternatif arka plan şeritleri uygula (gün bazlı zebra)
        for (let i = 0; i < dateRows.length; i++) {
          const startRow = dateRows[i];
          const endRow = (i + 1 < dateRows.length) ? dateRows[i + 1] - 1 : (1 + output.length);
          const isEven = (i % 2 === 0);
          const bg = isEven ? '#fafafa' : '#ffffff';
          targetSheet.getRange(startRow, 1, endRow - startRow + 1, header.length).setBackground(bg);
          // Tarih hücresini dikey birleştir
          if (endRow > startRow) {
            const mergeRange = targetSheet.getRange(startRow, 1, endRow - startRow + 1, 1);
            mergeRange.merge();
            mergeRange.setVerticalAlignment('middle');
          }
        }
        // Her tarih grubunun ilk satırına üst sınır çizgisi ekle
        const topBorders = dateRows.map(r => targetSheet.getRange(r, 1, 1, header.length));
        topBorders.forEach(function(range){ range.setBorder(true, null, null, null, null, null, 'black', SpreadsheetApp.BorderStyle.SOLID_THIN); });
      }
      // Başlığı ve görünümü düzenle
      targetSheet.setFrozenRows(1);
      targetSheet.setFrozenColumns(2);
      targetSheet.setColumnWidths(1, 1, 110); // Tarih
      targetSheet.setColumnWidths(2, 1, 90);  // Kod
      // Başlık arka planı
      targetSheet.getRange(1, 1, 1, header.length).setBackground('#f1f3f4');
      // Sayısal/%, ortalı ve italik biçimlendirme, TOPLAM kolonlarını renklendir
      const rowsCount = output.length;
      if (rowsCount > 0) {
        // Sayısal sütunlar (3..11): ortala, italik, binlik ayraç
        targetSheet.getRange(2, 3, rowsCount, 9)
          .setHorizontalAlignment('center')
          .setFontStyle('italic')
          .setNumberFormat('#,##0');
        // Yüzde sütunları (12..15): ortala, italik, yüzde formatı
        targetSheet.getRange(2, 12, rowsCount, 4)
          .setHorizontalAlignment('center')
          .setFontStyle('italic')
          .setNumberFormat('0.0%');
        // TOPLAM sütunlarını kalın ve arka planlı yap (10..11)
        targetSheet.getRange(2, 10, rowsCount, 2)
          .setFontWeight('bold')
          .setBackground('#E3F2FD');
      }
    }
    targetSheet.autoResizeColumns(3, header.length - 2);

    console.log('Processing complete:', { rowsWritten: output.length, days: dayKeys.length, codes: selectedCodes.length });
    return { success: true, rows: output.length };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function generateWeeklyReportSeriesManager(options) {
  console.log('Function started:', options || {});
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const weeksBack = (options && options.weeks) ? Math.max(1, Math.min(26, Number(options.weeks))) : 8; // default last 8 weeks

    function toKey(d){ return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy'); }
    function startOfWeek(d){ const dt=new Date(d.getFullYear(),d.getMonth(),d.getDate()); const day=dt.getDay(); const diff=(day===0?-6:1-day); dt.setDate(dt.getDate()+diff); dt.setHours(0,0,0,0); return dt; }
    function endOfWeek(d){ const s=startOfWeek(d); const e=new Date(s); e.setDate(s.getDate()+6); e.setHours(23,59,59,999); return e; }
    function withinRange(value,a,b){ try{ if(!value) return false; const d=value instanceof Date? value: new Date(String(value)); if(isNaN(d.getTime())) return false; return d>=a && d<=b; }catch(e){return false;} }
    function extractDateFromLog(logValue){ const s=String(logValue||''); const m=s.match(/(\d{2}\.\d{2}\.\d{4})/); if(m&&m[1]){ const [dd,mm,yy]=m[1].split('.'); const d=new Date(Number(yy),Number(mm)-1,Number(dd)); if(!isNaN(d.getTime())) return d; } return null; }
    function getActivityDate(headers,row,mainHeader){ const iH=headers.indexOf(mainHeader); if(iH!==-1 && row[iH]) return row[iH]; const iL=headers.indexOf('Log'); if(iL!==-1){ const d=extractDateFromLog(row[iL]); if(d) return d; } return ''; }

    // Prepare target sheet
    const sheetName = 'Haftalık Seri';
    let sh = ss.getSheetByName(sheetName); if (!sh) sh = ss.insertSheet(sheetName); else sh.clear();
    const header = ['Hafta','Randevu Alındı','İleri Tarih Randevu','Yeniden Aranacak','Bilgi Verildi','Fırsat İletildi','İlgilenmiyor','Ulaşılamadı','TOPLAM KONTAK','TOPLAM İŞLEM'];
    sh.getRange(1,1,1,header.length).setValues([header]).setFontWeight('bold');

    // Data sources (prefer T sheets)
    const shR = ss.getSheetByName('T Randevular') || ss.getSheetByName('Randevular');
    const shF = ss.getSheetByName('T Fırsatlar') || ss.getSheetByName('Fırsatlar');
    const shS = ss.getSheetByName('T Aktivite Özet');

    const weeks = [];
    const today = new Date(); today.setHours(0,0,0,0);
    const thisWeekStart = startOfWeek(today);
    for (let i=0;i<weeksBack;i++){
      const ws = new Date(thisWeekStart); ws.setDate(thisWeekStart.getDate()-7*i);
      const we = endOfWeek(ws);
      weeks.push({ label: `${toKey(ws)} – ${toKey(we)}`, a: ws, b: we });
    }

    // Helpers to read headers/values once
    function readSheet(sh){ if(!sh || sh.getLastRow()<=1) return null; const lc=sh.getLastColumn(); return { h: sh.getRange(1,1,1,lc).getValues()[0], v: sh.getRange(2,1,sh.getLastRow()-1,lc).getValues() } }
    const R = readSheet(shR), F = readSheet(shF), S = readSheet(shS);

    function countBetween(a,b){
      const c = { 'Randevu Alındı':0,'İleri Tarih Randevu':0,'Randevu Teyitlendi':0,'Randevu Ertelendi':0,'Randevu İptal oldu':0,'Yeniden Aranacak':0,'Bilgi Verildi':0,'Fırsat İletildi':0,'İlgilenmiyor':0,'Ulaşılamadı':0 };
      // Randevular
      if (R){ const iStatus=R.h.indexOf('Randevu durumu'); for (const r of R.v){ const d=getActivityDate(R.h,r,'Randevu Tarihi'); if(!withinRange(d,a,b)) continue; const s=String(r[iStatus]||''); if(c.hasOwnProperty(s)) c[s]++; } }
      // Fırsatlar
      if (F){ const iStatus=F.h.indexOf('Fırsat Durumu'); for (const r of F.v){ const d=getActivityDate(F.h,r,'Fırsat Tarihi'); if(!withinRange(d,a,b)) continue; const s=String(r[iStatus]||'').toLowerCase(); const norm=s.includes('ilet')? 'Fırsat İletildi': s.includes('bilgi')? 'Bilgi Verildi': s.includes('yeniden')||s.includes('ara')? 'Yeniden Aranacak': ''; if(norm) c[norm]++; } }
      // Negatifler
      if (S){ 
        for (const r of S.v){ 
          let d = null;
          const dateValue = r[1];
          
          // Date objesi mi string mi kontrol et
          if (dateValue instanceof Date) {
            d = dateValue;
          } else if (typeof dateValue === 'string') {
            const m = dateValue.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (m) {
              d = new Date(Number(m[3]), Number(m[2])-1, Number(m[1]));
            }
          }
          
          if(!d || isNaN(d.getTime())) continue; 
          if (d>=a && d<=b){ 
            c['İlgilenmiyor']+=Number(r[2]||0); 
            c['Ulaşılamadı']+=Number(r[3]||0); 
          } 
        } 
      }
      return c;
    }

    let rowIdx = 2;
    for (const w of weeks){
      const c = countBetween(w.a,w.b);
      const toplamKontak = c['Randevu Alındı'] + c['İleri Tarih Randevu'] + c['Yeniden Aranacak'] + c['Bilgi Verildi'] + c['Fırsat İletildi'] + c['İlgilenmiyor'];
      const toplamIslem = toplamKontak + c['Ulaşılamadı'];
      const row = [w.label, c['Randevu Alındı'], c['İleri Tarih Randevu'], c['Yeniden Aranacak'], c['Bilgi Verildi'], c['Fırsat İletildi'], c['İlgilenmiyor'], c['Ulaşılamadı'], toplamKontak, toplamIslem];
      sh.getRange(rowIdx,1,1,row.length).setValues([row]);
      rowIdx++;
    }

    sh.autoResizeColumns(1, header.length);
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// Satış Yapıldı > Yerinde Satış > Sıcak > Orta > Soğuk > Toplantı Tarihi sıralaması
function sortMeetingsSalesTop(sheet) {
  console.log("🔄 sortMeetingsSalesTop başlatıldı - Toplantılar sıralama");
  try { sheet.getRange(1,1,1,1).getValues(); } catch(e) { SpreadsheetApp.flush(); }
  try {
    if (!sheet) {
      console.log("❌ Sheet objesi bulunamadı");
      return;
    }
    const lastRow = sheet.getLastRow();
    if (lastRow <= 2) {
      console.log("⚠️ Sıralanacak satır yok (lastRow <= 2)");
      return;
    }
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    console.log("📋 Başlıklar:", headers);
    
    function findIdx(cands){
      const lowered = headers.map(h => String(h||"").trim().toLowerCase());
      for (const c of cands){ const i = lowered.indexOf(String(c).toLowerCase()); if (i!==-1) return i; }
      return -1;
    }
    
    const idxResult = findIdx(["Toplantı Sonucu","Toplantı sonucu"]);
    const idxDate = findIdx(["Toplantı Tarihi","Toplantı tarihi"]);
    const idxPotential = findIdx(["Satış Potansiyeli"]);
    
    console.log("🔍 Bulunan sütun indeksleri:", {
      "Toplantı Sonucu": idxResult,
      "Toplantı Tarihi": idxDate,
      "Satış Potansiyeli": idxPotential
    });
    
    if (idxResult === -1 || idxDate === -1) {
      console.log("❌ Gerekli sütunlar bulunamadı");
      return;
    }

    // Tüm verileri oku
    const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headerRow = allData[0];
    const dataRows = allData.slice(1);
    
    console.log("📊 " + dataRows.length + " satır veri okundu");
    
    // Sıralama için yeni bir veri dizisi oluştur
    const sortableData = dataRows.map((row, index) => {
      const resultText = idxResult !== -1 ? String(row[idxResult] || "").toLowerCase().trim() : "";
      const potentialText = idxPotential !== -1 ? String(row[idxPotential] || "").toLowerCase().trim() : "";
      
      // Debug için satır içeriğini logla
      if (index < 5) {
        console.log("📝 Satır " + (index+2) + " - Sonuç: \"" + resultText + "\", Potansiyel: \"" + potentialText + "\"");
      }
      
      return {
        originalRow: row,
        originalIndex: index,
        resultText: resultText,
        potentialText: potentialText,
        date: row[idxDate]
      };
    });
    
    // Önce sıralama değerlerini hesapla
    sortableData.forEach(item => {
      // Varsayılan sıralama değeri (en düşük öncelik)
      let rank = 9;
      
      // Satış Yapıldı en yüksek önceliğe sahip
      if (item.resultText === "satış yapıldı" || item.resultText === "satis yapildi") {
        rank = 0;
      } else if (item.potentialText) {
        // Potansiyel değerine göre sırala
        if (item.potentialText === "yerinde satış" || item.potentialText === "yerinde satis") {
          rank = 1;
        } else if (item.potentialText === "sıcak" || item.potentialText === "sicak") {
          rank = 2;
        } else if (item.potentialText === "orta") {
          rank = 3;
        } else if (item.potentialText === "soğuk" || item.potentialText === "soguk") {
          rank = 4;
        }
      }
      
      item.rank = rank;
      
      // Debug için ilk 5 satırın rank değerlerini logla
      if (item.originalIndex < 5) {
        console.log("🏆 Satır " + (item.originalIndex+2) + " - Rank: " + rank);
      }
    });
    
    // Sıralama kriterleri:
    // 1. Rank (düşük değer önce)
    // 2. Tarih (eski tarih önce)
    sortableData.sort((a, b) => {
      // Önce rank'e göre sırala
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }
      
      // Rank aynıysa tarihe göre sırala
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateA - dateB;
      }
      
      // Tarihler geçersizse orijinal sırayı koru
      return a.originalIndex - b.originalIndex;
    });
    
    // Sıralanmış verileri yeniden düzenle
    const sortedRows = sortableData.map(item => item.originalRow);
    
    // Sıralanmış verileri sayfaya yaz
    sheet.getRange(2, 1, sortedRows.length, lastCol).setValues(sortedRows);
    
    console.log("✅ Sıralama tamamlandı");
    
    // Sıralama sonuçlarını logla
    console.log("📋 İlk 5 satır sıralama sonrası:");
    for (let i = 0; i < Math.min(5, sortedRows.length); i++) {
      const resultText = idxResult !== -1 ? sortedRows[i][idxResult] : "N/A";
      const potentialText = idxPotential !== -1 ? sortedRows[i][idxPotential] : "N/A";
      console.log("📌 Satır " + (i+2) + " - Sonuç: \"" + resultText + "\", Potansiyel: \"" + potentialText + "\"");
    }
  } catch (err) {
    console.error("❌ sortMeetingsSalesTop hatası:", err);
    console.error("❌ Hata detayı:", err.stack);
  }
}

function refreshAgentColorCodingAll() {
  console.log('Function started:', { action: 'refreshAgentColorCodingAll' });
  try {
    let processed = 0;
    for (const [code, fileId] of Object.entries(EMPLOYEE_FILES)) {
      try {
        const file = SpreadsheetApp.openById(fileId);
        const sheets = file.getSheets();
        for (const sh of sheets) {
          const name = sh.getName();
          const low = String(name||'').toLowerCase();
          if (low.includes('randevu') || low.includes('fırsat') || low.includes('firsat') || low.includes('toplant')) {
            const rows = sh.getLastRow();
            if (rows > 1) {
              applyColorCodingToManagerData(sh, name, 2, rows - 1);
              processed++;
            }
          }
        }
      } catch (errFile) {
        console.log('⚠️ Agent color refresh failed:', code, errFile && errFile.message);
      }
    }
    SpreadsheetApp.getUi().alert('Renk Yenileme', `Temsilci dosyalarında ${processed} sayfa renklendirildi.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
  }
}

function refreshAgentColorCodingPrompt() {
  console.log('Function started:', { action: 'refreshAgentColorCodingPrompt' });
  try {
    const ui = SpreadsheetApp.getUi();
    const resp = ui.prompt('Temsilci Kodu', 'Örn: SB 004', ui.ButtonSet.OK_CANCEL);
    if (resp.getSelectedButton() !== ui.Button.OK) return;
    const code = (resp.getResponseText()||'').trim();
    if (!EMPLOYEE_FILES[code]) { ui.alert('Hata', 'Geçersiz temsilci kodu', ui.ButtonSet.OK); return; }
    const file = findEmployeeFile(code);
    if (!file) { ui.alert('Hata', 'Dosya açılamadı', ui.ButtonSet.OK); return; }
    const sheets = file.getSheets();
    let processed = 0;
    for (const sh of sheets) {
      const name = sh.getName();
      const low = String(name||'').toLowerCase();
      if (low.includes('randevu') || low.includes('fırsat') || low.includes('firsat') || low.includes('toplant')) {
        const rows = sh.getLastRow();
        if (rows > 1) {
          applyColorCodingToManagerData(sh, name, 2, rows - 1);
          processed++;
        }
      }
    }
    ui.alert('Renk Yenileme', `${code} için ${processed} sayfa renklendirildi.`, ui.ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
  }
}

// ========================================
// 🔠 REFERENCE-SAFE SORTING (DYNAMIC DIALOG)
// ========================================

/**
 * Referans (CMS Grubu=Referans) satırlarını en üstte sabit tutarak,
 * kullanıcıya seçtirdiği bir veya birden fazla sütuna göre A→Z/Z→A sıralama yapar.
 * Yalnızca "Format Tablo" sayfalarında çalışır.
 */
// Dinamik sıralama diyalogu yönetici dosyasından kaldırıldı; temsilci tarafına taşındı.
/**
 * Dialogdan gelen seçimlere göre sıralamayı uygular. Referans (CMS Grubu=Referans)
 * satırları için geçici rank kolonu kullanılır (0=Referans, 1=Diğer).
 * @param {{ selections: { headerName: string, direction: 'asc'|'desc' }[] }} parameters 
 */
// Referans-sabit sıralama uygulaması yönetici tarafında yok; temsilci tarafında uygulanır.

// === DEDUPE: remove duplicates in aggregate T sheets ===
function removeDuplicatesInAggregateSheet(sheet, baseTypeForHeaders) {
  try {
    if (!sheet || sheet.getLastRow() < 2) return;
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];

    // Column indices (tolerant names)
    let idxCode = headers.indexOf('Temsilci Kodu');
    if (idxCode === -1) idxCode = headers.indexOf('Kod');
    const idxCompany = headers.indexOf('Company name');

    let dateHeader = '';
    if (String(baseTypeForHeaders).toLowerCase().includes('randevu')) dateHeader = 'Randevu Tarihi';
    else if (String(baseTypeForHeaders).toLowerCase().includes('fırsat') || String(baseTypeForHeaders).toLowerCase().includes('firsat')) dateHeader = 'Fırsat Tarihi';
    else if (String(baseTypeForHeaders).toLowerCase().includes('toplant')) dateHeader = 'Toplantı Tarihi';
    let idxDate = headers.indexOf(dateHeader);

    const idxTime = headers.indexOf('Saat');

    if (idxCode === -1 || idxCompany === -1 || idxDate === -1) return;

    const range = sheet.getRange(2, 1, sheet.getLastRow() - 1, lastCol).getDisplayValues();

    function norm(x) { return String(x || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
    function normDate(x) {
      try {
        if (x instanceof Date && !isNaN(x.getTime())) return Utilities.formatDate(x, Session.getScriptTimeZone(), 'dd.MM.yyyy');
        const s = String(x || '').trim();
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return s;
        const d = new Date(s);
        return isNaN(d.getTime()) ? '' : Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy');
      } catch (_) { return String(x || '').trim(); }
    }

    const seen = new Set();
    const rowsToDelete = [];
    // Iterate from top to bottom, but keep last occurrence: mark previous as delete
    for (let i = 0; i < range.length; i++) {
      const r = range[i];
      const key = [norm(r[idxCode]), norm(r[idxCompany]), normDate(r[idxDate]), idxTime !== -1 ? norm(r[idxTime]) : ''].join('||');
      if (seen.has(key)) {
        rowsToDelete.push(i + 2); // 2-based row index
      } else {
        seen.add(key);
      }
    }
    // Delete from bottom to top
    for (let j = rowsToDelete.length - 1; j >= 0; j--) {
      sheet.deleteRow(rowsToDelete[j]);
    }
  } catch (error) {
    console.error('removeDuplicatesInAggregateSheet error:', error);
  }
}

function runDedupeOnAllTAggregates() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const names = ['T Randevular', 'T Fırsatlar', 'T Toplantılar'];
    for (const name of names) {
      const sh = ss.getSheetByName(name);
      if (!sh) continue;
      const base = name.replace(/^T\s+/, '');
      removeDuplicatesInAggregateSheet(sh, base);
    }
    SpreadsheetApp.getUi().alert('Tamam', 'T sayfalarında mükerrer kayıtlar temizlendi.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Hata', String(e && e.message || e), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function generatePivotBaseReportManager() {
  console.log('Function started: generatePivotBaseReportManager');
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const shR = ss.getSheetByName('T Randevular') || ss.getSheetByName('Randevular');
    const shF = ss.getSheetByName('T Fırsatlar') || ss.getSheetByName('Fırsatlar');
    const shT = ss.getSheetByName('T Toplantılar') || ss.getSheetByName('Toplantılar');
    const shS = ss.getSheetByName('T Aktivite Özet');

    function toKey(d){ return Utilities.formatDate(d, Session.getScriptTimeZone(), 'dd.MM.yyyy'); }
    function extractDateFromLog(logValue){ const s=String(logValue||''); const m=s.match(/(\d{2}\.\d{2}\.\d{4})/); if(m&&m[1]){ const [dd,mm,yy]=m[1].split('.'); const d=new Date(Number(yy),Number(mm)-1,Number(dd)); if(!isNaN(d.getTime())) return d; } return null; }
    function getDate(headers,row,main){ const i=headers.indexOf(main); if(i!==-1 && row[i]) return row[i]; const iL=headers.indexOf('Log'); if(iL!==-1){ const d=extractDateFromLog(row[iL]); if(d) return d; } return null; }

    // Etiket normalizasyonu (etiket eşlemesi)
    function normStr(s){
      return String(s||'')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g,' ')
        .trim();
    }
    function normalizeLabel(raw, context){
      const n = normStr(raw);
      // Negatifler
      if (/(ulasil|ulasila|ulas|cevap yok|yanit yok|mesgul|erise|eri\u015file)/.test(n)) return 'Ulaşılamadı';
      if (/(ilgilenm|ilgi yok|ilgi-yok|ilgi bulunm|ilgi duymuyor)/.test(n)) return 'İlgilenmiyor';
      // Fırsat durumları (pozitifler)
      if (context === 'firsat') {
        if (n.includes('ilet')) return 'Fırsat İletildi';
        if (n.includes('bilgi')) return 'Bilgi Verildi';
        if (n.includes('yeniden') || n.includes('ara')) return 'Yeniden Aranacak';
        return '';
      }
      // Diğerleri aynen
      return String(raw||'').trim();
    }

    function read(sh){ 
      console.log('read() function called with sheet:', sh ? sh.getName() : 'null');
      if(!sh || sh.getLastRow()<=1) {
        console.log('Sheet is null or has <=1 row. Last row:', sh ? sh.getLastRow() : 'N/A');
        return null; 
      }
      const lc=sh.getLastColumn();
      console.log('Sheet dimensions:', { lastRow: sh.getLastRow(), lastCol: lc });
      const headers = sh.getRange(1,1,1,lc).getValues()[0];
      const values = sh.getRange(2,1,sh.getLastRow()-1,lc).getValues();
      console.log('Read data:', { headers: headers, valueCount: values.length });
      return { h: headers, v: values }; 
    }
    const R = read(shR), F = read(shF), Tm = read(shT), S = read(shS);

    let rows = [['Kod','Tarih','Aktivite','Adet']];
    const activityMap = new Map(); // key: "Kod|Tarih|Aktivite" -> count

    // Helper function to add/update activity count
    function addActivity(code, date, activity, count = 1) {
      const key = `${code}|${date}|${activity}`;
      if (activityMap.has(key)) {
        activityMap.set(key, activityMap.get(key) + count);
      } else {
        activityMap.set(key, count);
      }
    }

    // Randevular: etiketleri normalize et ve topla
    if (R){
      const iCode=R.h.indexOf('Kod')!==-1? R.h.indexOf('Kod'): R.h.indexOf('Temsilci Kodu');
      const iStatus=R.h.indexOf('Randevu durumu');
      for (const r of R.v){
        const d=getDate(R.h,r,'Randevu Tarihi'); if(!d) continue;
        const raw = String(r[iStatus]||'').trim(); if(!raw) continue;
        const s = normalizeLabel(raw, 'randevu'); if(!s) continue;
        addActivity(String(r[iCode]||'').trim(), toKey(d), s, 1);
      }
    }

    // Fırsatlar: normalize ederek sadece ilgili pozitifleri al ve topla
    if (F){
      const iCode=F.h.indexOf('Kod')!==-1? F.h.indexOf('Kod'): F.h.indexOf('Temsilci Kodu');
      const iStatus=F.h.indexOf('Fırsat Durumu');
      for (const r of F.v){
        const d=getDate(F.h,r,'Fırsat Tarihi'); if(!d) continue;
        const s = normalizeLabel(String(r[iStatus]||''), 'firsat'); if(!s) continue;
        addActivity(String(r[iCode]||'').trim(), toKey(d), s, 1);
      }
    }

    // Toplantılar: olduğu gibi, gerekirse küçük normalizasyon yapılabilir ve topla
    if (Tm){
      const iCode=Tm.h.indexOf('Kod')!==-1? Tm.h.indexOf('Kod'): Tm.h.indexOf('Temsilci Kodu');
      const iStatus=Tm.h.indexOf('Toplantı Sonucu');
      for (const r of Tm.v){
        const d=getDate(Tm.h,r,'Toplantı Tarihi'); if(!d) continue;
        const s=String(r[iStatus]||'').trim(); if(!s) continue;
        addActivity(String(r[iCode]||'').trim(), toKey(d), s, 1);
      }
    }

    // Özet (Format Tablo'dan toplanan negatifler): varsa ekle
    if (S){
      console.log('Processing T Aktivite Özet data:', S.v.length, 'rows');
      console.log('Sample data from T Aktivite Özet:', S.v.slice(0, 3));
      console.log('Headers from T Aktivite Özet:', S.h);
      
      for (const r of S.v){
        const code=String(r[0]||'').trim();
        const ds=String(r[1]||'');
        console.log('Processing row:', { code, date: ds, ilgi: r[2], ulas: r[3] });
        
        // Daha esnek tarih parsing - hem Date objesi hem string formatını destekle
        let d = null;
        if (ds) {
          if (ds instanceof Date) {
            // Zaten Date objesi
            d = ds;
            console.log('Date object found:', { original: ds, parsed: d, toKey: toKey(d) });
          } else if (typeof ds === 'string') {
            // Önce dd.MM.yyyy formatını dene
            const m1 = ds.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
            if (m1) {
              d = new Date(Number(m1[3]), Number(m1[2])-1, Number(m1[1]));
              console.log('Date parsed from dd.MM.yyyy:', { original: ds, parsed: d, toKey: toKey(d) });
            } else {
              // Sonra Date.parse() ile dene (Thu Aug 07 2025 formatı için)
              const parsed = Date.parse(ds);
              if (!isNaN(parsed)) {
                d = new Date(parsed);
                console.log('Date parsed from Date.parse():', { original: ds, parsed: d, toKey: toKey(d) });
              } else {
                console.log('Date parsing failed for string:', ds);
              }
            }
          }
        }
        
        if(!code || !d || isNaN(d.getTime())) {
          console.log('Skipping invalid row:', { code, date: ds, parsed: d, isValid: !isNaN(d?.getTime()) });
          continue;
        }
        
        const ilgi=Number(r[2]||0); 
        const ulas=Number(r[3]||0);
        
        console.log('Valid row found:', { code, date: toKey(d), ilgi, ulas });
        
        if (ilgi>0) {
          addActivity(code, toKey(d), 'İlgilenmiyor', ilgi);
          console.log('Added İlgilenmiyor:', code, toKey(d), 'İlgilenmiyor', ilgi);
        }
        if (ulas>0) {
          addActivity(code, toKey(d), 'Ulaşılamadı', ulas);
          console.log('Added Ulaşılamadı:', code, toKey(d), 'Ulaşılamadı', ulas);
        }
      }
      console.log('T Aktivite Özet processing complete.');
    } else {
      console.log('T Aktivite Özet sheet is null or empty. Sheet object:', shS);
      if (shS) {
        console.log('Sheet exists but read() returned null. Last row:', shS.getLastRow());
        console.log('Sheet name:', shS.getName());
        if (shS.getLastRow() > 1) {
          console.log('First few rows of T Aktivite Özet:');
          const sampleData = shS.getRange(1, 1, Math.min(5, shS.getLastRow()), shS.getLastColumn()).getValues();
          console.log(sampleData);
        }
      }
    }

    // Convert activityMap to rows and sort by date
    console.log('Converting activityMap to rows...');
    for (const [key, count] of activityMap.entries()) {
      const [code, date, activity] = key.split('|');
      rows.push([code, date, activity, count]);
    }

    // Sort rows by date (skip header row)
    console.log('Sorting rows by date...');
    const headerRow = rows[0];
    const dataRows = rows.slice(1);
    
    dataRows.sort((a, b) => {
      const dateA = new Date(a[1].split('.').reverse().join('-'));
      const dateB = new Date(b[1].split('.').reverse().join('-'));
      return dateA - dateB;
    });
    
    rows = [headerRow, ...dataRows];
    
    console.log('Final rows structure (first 10):', rows.slice(0, 10));
    console.log('Total rows:', rows.length);

    let pv = ss.getSheetByName('Pivot Veri'); if (!pv) pv = ss.insertSheet('Pivot Veri'); else pv.clear();
    pv.getRange(1,1,rows.length,4).setValues(rows);
    pv.autoResizeColumns(1,4);
    SpreadsheetApp.getUi().alert('Tamam', 'Pivot tabanı güncellendi (Pivot Veri).', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}
/**
 * Toplantılar sayfasını manuel olarak sıralar
 * Satış Yapıldı > Yerinde Satış > Sıcak > Orta > Soğuk > Toplantı Tarihi
 */
function sortMeetingsManual() {
  console.log('Manuel toplantı sıralama başlatıldı');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    if (sheet.getName() === 'Toplantılar' || sheet.getName() === 'T Toplantılar') {
      console.log('Toplantılar sayfası tespit edildi: ' + sheet.getName());
      sortMeetingsSalesTop(sheet);
      SpreadsheetApp.getUi().alert('Toplantılar başarıyla sıralandı.');
    } else {
      console.log('Uygun olmayan sayfa: ' + sheet.getName());
      SpreadsheetApp.getUi().alert('Lütfen Toplantılar veya T Toplantılar sayfasında çalışırken bu fonksiyonu kullanın.');
    }
  } catch (error) {
    console.error('Toplantı sıralama hatası:', error);
    SpreadsheetApp.getUi().alert('Sıralama sırasında bir hata oluştu: ' + error.message);
  }
}

function sortTRandevularByDateAscending() {
  console.log('Function started:', {});
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('T Randevular');
    if (!sheet) {
      SpreadsheetApp.getUi().alert('T Randevular sayfası bulunamadı');
      return;
    }
    const lastRow = sheet.getLastRow();
    if (lastRow <= 2) {
      SpreadsheetApp.getUi().alert('Sıralanacak veri yok');
      return;
    }
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    function findIdx(cands){
      const lowered = headers.map(h => String(h||"").trim().toLowerCase());
      for (const c of cands){ const i = lowered.indexOf(String(c).toLowerCase()); if (i!==-1) return i; }
      return -1;
    }
    const idxStatus = findIdx(['Randevu durumu','Durum']);
    const idxDate = findIdx(['Randevu Tarihi','Tarih']);
    const idxTime = findIdx(['Saat']);
    if (idxDate === -1) {
      SpreadsheetApp.getUi().alert('Randevu Tarihi sütunu bulunamadı');
      return;
    }
    const rng = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = rng.getValues();
    function parseTime(v){
      if (v instanceof Date && !isNaN(v.getTime())) return v.getHours()*60+v.getMinutes();
      const s = String(v || '').trim();
      const m = s.match(/^(\d{1,2}):(\d{2})/);
      if (m) return Number(m[1])*60 + Number(m[2]);
      return 0;
    }
    function groupRank(row){
      const s = String(idxStatus>=0 ? row[idxStatus] : '').toLowerCase();
      if (s.includes('iptal')) return 0;
      if (s.includes('erte')) return 0;
      if (s.includes('teyit')) return 1;
      if (s.includes('randevu al')) return 1;
      return 2;
    }
    values.sort(function(a,b){
      const ra = groupRank(a);
      const rb = groupRank(b);
      if (ra !== rb) return ra - rb;
      const da = parseDdMmYyyy(a[idxDate]) || new Date('2099-12-31');
      const db = parseDdMmYyyy(b[idxDate]) || new Date('2099-12-31');
      if (da.getTime() !== db.getTime()) return da - db;
      if (idxTime >= 0) return parseTime(a[idxTime]) - parseTime(b[idxTime]);
      return 0;
    });
    rng.setValues(values);
    SpreadsheetApp.getUi().alert('T Randevular durum önceliği (İptal/Ertelendi üstte) ve tarih artan şekilde sıralandı.');
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}
// ========================================
// 📊 PERFORMANS DASHBOARD SİSTEMİ
// Version: 1.0
// ========================================

/**
 * 🎯 Günlük Performans Dashboard - Tüm temsilcilerin günlük aktivite özeti
 * GÜNCELLENDİ: Direkt temsilci dosyalarından veri çekiyor
 */
function generateDailyPerformanceDashboard() {
  console.log('Function started: generateDailyPerformanceDashboard - SYNC VERSION');
  
  try {
    if (!validateInput({})) {
      throw new Error('Invalid input provided');
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const todayKey = Utilities.formatDate(today, 'Europe/Istanbul', 'dd.MM.yyyy');
    
    console.log('Senkronizasyon sonrası dashboard oluşturuluyor:', todayKey);
    
    // Mevcut verilerden dashboard oluştur
    let dashboardSheet = ss.getSheetByName('📊 Günlük Performans');
    if (!dashboardSheet) {
      dashboardSheet = ss.insertSheet('📊 Günlük Performans');
    } else {
      dashboardSheet.clear();
    }
    
    // Basit dashboard
    dashboardSheet.getRange('A1').setValue('📊 GÜNLÜK PERFORMANS DASHBOARD');
    dashboardSheet.getRange('A1:D1').merge();
    dashboardSheet.getRange('A1').setFontSize(16).setFontWeight('bold').setBackground('#4285F4').setFontColor('white');
    
    dashboardSheet.getRange('A2').setValue(`📅 Tarih: ${todayKey}`);
    dashboardSheet.getRange('A2:D2').merge();
    
    dashboardSheet.getRange('A3').setValue('🔄 Veri Kaynağı: Senkronizasyon Sistemi');
    dashboardSheet.getRange('A3:D3').merge();
    
    dashboardSheet.activate();
    
    return { success: true, dashboardCreated: true };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Dashboard Hatası', 'Dashboard oluşturulurken hata: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// Haftalık performans grafiği kaldırıldı - senkronizasyon sistemi kullanılıyor

// Zaman analizi raporu kaldırıldı - senkronizasyon sistemi kullanılıyor

// Canlı dashboard yenileme kaldırıldı - senkronizasyon sistemi kullanılıyor

// ========================================
// 🔄 DASHBOARD SENKRONİZASYON - TEK BUTON
// ========================================

/**
 * 🎯 TEK TEMSİLCİ ANALİZİ - Hızlı ve güvenilir
 * Her temsilci için ayrı buton - Timeout riski yok
 */
function analyzeSingleEmployee(employeeCode) {
  console.log(`🎯 Function started: analyzeSingleEmployee - ${employeeCode}`);
  
  try {
    const ui = SpreadsheetApp.getUi();
    const employeeName = CRM_CONFIG.EMPLOYEE_CODES[employeeCode];
    
    if (!employeeName) {
      ui.alert('❌ Hata', `${employeeCode} temsilci kodu bulunamadı!`, ui.ButtonSet.OK);
      return;
    }
    
    // Kullanıcıya bilgi ver
    const response = ui.alert(
      `🎯 ${employeeCode} - ${employeeName} Analizi`,
      `${employeeCode} temsilcisinin bugünkü performansını analiz edeceğim.\n\n⏱️ Tahmini süre: 5-10 saniye\n\nDevam etmek istiyor musunuz?`,
      ui.ButtonSet.OK_CANCEL
    );
    
    if (String(response) !== 'OK') {
      console.log('❌ Kullanıcı iptal etti');
      return;
    }
    
    console.log(`🚀 ${employeeCode} analizi başlatılıyor...`);
    
    // ⏰ Hızlı analiz - 30 saniye timeout
    const startTime = new Date();
    const timeoutLimit = 30 * 1000; // 30 saniye
    
    // Temsilci dosyasını EMPLOYEE_FILES mapping'den al (syncSingleEmployee gibi)
    const employeeSpreadsheet = findEmployeeFile(employeeCode);
    
    if (!employeeSpreadsheet) {
      ui.alert('❌ Dosya Bulunamadı', 
        `${employeeCode} - ${employeeName} dosyası bulunamadı!\n\n` +
        `Dosya ID'si sistemde tanımlı değil. Lütfen EMPLOYEE_FILES mapping'ini kontrol edin.`, 
        ui.ButtonSet.OK);
      return;
    }
    
    console.log(`✅ ${employeeCode} dosyası başarıyla açıldı`);
    
    // Format Tablo sayfasını analiz et
    const formatTableSheet = employeeSpreadsheet.getSheetByName('Format Tablo');
    if (!formatTableSheet || formatTableSheet.getLastRow() <= 1) {
      ui.alert('❌ Veri Yok', `${employeeCode} için Format Tablo sayfasında veri bulunamadı!`, ui.ButtonSet.OK);
      return;
    }
    
    // ⏰ Hızlı veri toplama
    const todayData = collectTodayDataFast(employeeSpreadsheet, employeeCode, timeoutLimit);
    
    // Timeout kontrolü
    if (new Date() - startTime > timeoutLimit) {
      ui.alert('⏰ Timeout', `${employeeCode} analizi çok uzun sürdü, kısmi sonuç gösteriliyor.`, ui.ButtonSet.OK);
    }
    
    // Sonuçları göster
    showEmployeeResults(employeeCode, employeeName, todayData);
    
    console.log(`✅ ${employeeCode} analizi tamamlandı:`, todayData);
    
  } catch (error) {
    console.error(`❌ ${employeeCode} analizi hatası:`, error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Analiz sırasında hata oluştu: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ⚡ Hızlı veri toplama - Timeout korumalı
 */
function collectTodayDataFast(spreadsheet, employeeCode, timeoutLimit) {
  try {
    const startTime = new Date();
    const today = new Date();
    const todayKey = Utilities.formatDate(today, 'Europe/Istanbul', 'dd.MM.yyyy');
    
    const formatTableSheet = spreadsheet.getSheetByName('Format Tablo');
    if (!formatTableSheet) return null;
    
    const headers = formatTableSheet.getRange(1, 1, 1, formatTableSheet.getLastColumn()).getDisplayValues()[0];
    const data = formatTableSheet.getRange(2, 1, formatTableSheet.getLastRow() - 1, formatTableSheet.getLastColumn()).getDisplayValues();
    
    const aktiviteIdx = headers.indexOf('Aktivite');
    const aktiviteTarihiIdx = headers.indexOf('Aktivite Tarihi');
    const logIdx = headers.indexOf('Log');
    
    if (aktiviteIdx === -1) return null;
    
    const result = {
      totalActivities: 0,
      positiveActivities: 0,
      negativeActivities: 0,
      appointments: 0,
      opportunities: 0,
      activities: [],
      workStart: null,
      workEnd: null,
      workDuration: 0
    };
    
    // Hızlı analiz - Her 50 satırda timeout kontrolü
    for (let i = 0; i < data.length; i++) {
      // ⏰ Timeout kontrolü
      if (i % 50 === 0 && new Date() - startTime > timeoutLimit) {
        console.log(`⏰ ${employeeCode} - Veri toplama timeout, ${i} satır işlendi`);
        break;
      }
      
      const row = data[i];
      const aktivite = String(row[aktiviteIdx] || '').trim();
      if (!aktivite) continue;
      
      const tarih = aktiviteTarihiIdx !== -1 ? row[aktiviteTarihiIdx] : null;
      const log = logIdx !== -1 ? row[logIdx] : null;
      
      // Bugünkü aktivite mi kontrol et
      let isToday = false;
      if (tarih === todayKey) {
        isToday = true;
      } else if (log && log.includes(todayKey)) {
        isToday = true;
      }
      
      if (isToday) {
        result.totalActivities++;
        
        if (['İlgilenmiyor', 'Ulaşılamadı'].includes(aktivite)) {
          result.negativeActivities++;
        } else {
          result.positiveActivities++;
          if (aktivite.includes('Randevu')) {
            result.appointments++;
          }
          if (aktivite.includes('Fırsat')) {
            result.opportunities++;
          }
        }
        
        // Aktivite zamanını çıkar
        const activityTime = extractTimeFromLog(log);
        if (activityTime) {
          result.activities.push({
            activity: aktivite,
            time: activityTime
          });
          
          if (!result.workStart || activityTime < result.workStart) {
            result.workStart = activityTime;
          }
          if (!result.workEnd || activityTime > result.workEnd) {
            result.workEnd = activityTime;
          }
        }
      }
    }
    
    // Çalışma süresini hesapla
    if (result.workStart && result.workEnd) {
      result.workDuration = calculateWorkDuration(result.workStart, result.workEnd);
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ ${employeeCode} veri toplama hatası:`, error);
    return null;
  }
}

/**
 * 📊 Temsilci sonuçlarını göster
 */
function showEmployeeResults(employeeCode, employeeName, data) {
  try {
    if (!data) {
      SpreadsheetApp.getUi().alert('❌ Veri Yok', `${employeeCode} için veri bulunamadı!`, SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    const message = `🎯 ${employeeCode} - ${employeeName} Analiz Sonuçları\n\n` +
      `📊 Bugünkü Performans:\n` +
      `• Toplam Aktivite: ${data.totalActivities}\n` +
      `• Pozitif: ${data.positiveActivities}\n` +
      `• Negatif: ${data.negativeActivities}\n` +
      `• Randevu: ${data.appointments}\n` +
      `• Fırsat: ${data.opportunities}\n` +
      `• Çalışma Süresi: ${data.workDuration > 0 ? data.workDuration + ' dakika' : 'Belirlenemedi'}\n\n` +
      `📅 Son Aktivite: ${data.activities.length > 0 ? data.activities[data.activities.length - 1].activity : 'Aktivite yok'}`;
    
    SpreadsheetApp.getUi().alert('✅ Analiz Tamamlandı', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
  } catch (error) {
    console.error('Sonuç gösterme hatası:', error);
  }
}



// ========================================
// ➕ SIRAYLA EKLE FONKSİYONLARI
// ========================================

/**
 * ➕ LG 001 - Lale Gül Sırayla Ekle
 */
function syncSingleEmployeeAppend_LG_001() {
  console.log('🔄 LG 001 append fonksiyonu çağrıldı!');
  
  try {
    // Sadece sırayla ekleme (hızlı)
    const syncResult = syncSingleEmployee('LG 001', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    
  } catch (error) {
    console.error('❌ LG 001 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `LG 001 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ➕ NT 002 - Neslihan Türk Sırayla Ekle
 */
function syncSingleEmployeeAppend_NT_002() {
  console.log('🔄 NT 002 append fonksiyonu çağrıldı!');
  
  try {
    // Sadece sırayla ekleme (hızlı)
    const syncResult = syncSingleEmployee('NT 002', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    
  } catch (error) {
    console.error('❌ NT 002 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `NT 002 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ➕ KO 003 - Kadir Öztürk Sırayla Ekle
 */
function syncSingleEmployeeAppend_KO_003() {
  console.log('🔄 KO 003 append fonksiyonu çağrıldı!');
  
  try {
    // Sadece sırayla ekleme (hızlı)
    const syncResult = syncSingleEmployee('KO 003', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    
  } catch (error) {
    console.error('❌ KO 003 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `KO 003 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ➕ SB 004 - Sinem Bakalcı Sırayla Ekle
 */
function syncSingleEmployeeAppend_SB_004() {
  console.log('🔄 SB 004 append fonksiyonu çağrıldı!');
  
  try {
    // Sadece sırayla ekleme (hızlı)
    const syncResult = syncSingleEmployee('SB 004', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    
  } catch (error) {
    console.error('❌ SB 004 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `SB 004 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ➕ KM 005 - Kübra Murat Sırayla Ekle
 */
function syncSingleEmployeeAppend_KM_005() {
  console.log('🔄 KM 005 append fonksiyonu çağrıldı!');
  
  try {
    // Sadece sırayla ekleme (hızlı)
    const syncResult = syncSingleEmployee('KM 005', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    
  } catch (error) {
    console.error('❌ KM 005 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `KM 005 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ➕ GŞ 006 - Gamze Şafaklıoğlu Sırayla Ekle
 */
function syncSingleEmployeeAppend_GŞ_006() {
  console.log('🔄 GŞ 006 append fonksiyonu çağrıldı!');
  
  try {
    // Sadece sırayla ekleme (hızlı)
    const syncResult = syncSingleEmployee('GŞ 006', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    
  } catch (error) {
    console.error('❌ GŞ 006 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `GŞ 006 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ➕ BH 007 - Bilge Hin Sırayla Ekle
 */
function syncSingleEmployeeAppend_BH_007() {
  console.log('🔄 BH 007 append fonksiyonu çağrıldı!');
  
  try {
    const syncResult = syncSingleEmployee('BH 007', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
  } catch (error) {
    console.error('❌ BH 007 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `BH 007 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ➕ TD 008 - Tuğçe Duman Sırayla Ekle
 */
function syncSingleEmployeeAppend_TD_008() {
  console.log('🔄 TD 008 append fonksiyonu çağrıldı!');
  
  try {
    const syncResult = syncSingleEmployee('TD 008', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
  } catch (error) {
    console.error('❌ TD 008 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `TD 008 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ========================================
// 📊 LOG ÖZETİ FONKSİYONLARI - SADECE LOG ANALİZİ
// ========================================

/**
 * 📊 LG 001 - Lale Gül Log Özeti
 */
function logAnalysis_LG_001() {
  console.log('📊 LG 001 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('LG 001', 'Lale Gül');
  } catch (error) {
    console.error('❌ LG 001 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `LG 001 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 NT 002 - Neslihan Türk Log Özeti
 */
function logAnalysis_NT_002() {
  console.log('📊 NT 002 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('NT 002', 'Neslihan Türk');
  } catch (error) {
    console.error('❌ NT 002 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `NT 002 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 KO 003 - Kadir Öztürk Log Özeti
 */
function logAnalysis_KO_003() {
  console.log('📊 KO 003 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('KO 003', 'Kadir Öztürk');
  } catch (error) {
    console.error('❌ KO 003 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `KO 003 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 SB 004 - Sinem Bakalcı Log Özeti
 */
function logAnalysis_SB_004() {
  console.log('📊 SB 004 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('SB 004', 'Sinem Bakalcı');
  } catch (error) {
    console.error('❌ SB 004 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `SB 004 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 KM 005 - Kübra Murat Log Özeti
 */
function logAnalysis_KM_005() {
  console.log('📊 KM 005 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('KM 005', 'Kübra Murat');
  } catch (error) {
    console.error('❌ KM 005 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `KM 005 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 GŞ 006 - Gamze Şafaklıoğlu Log Özeti
 */
function logAnalysis_GŞ_006() {
  console.log('📊 GŞ 006 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('GŞ 006', 'Gamze Şafaklıoğlu');
  } catch (error) {
    console.error('❌ GŞ 006 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `GŞ 006 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 BH 007 - Bilge Hin Log Özeti
 */
function logAnalysis_BH_007() {
  console.log('📊 BH 007 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('BH 007', 'Bilge Hin');
  } catch (error) {
    console.error('❌ BH 007 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `BH 007 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 TD 008 - Tuğçe Duman Log Özeti
 */
function logAnalysis_TD_008() {
  console.log('📊 TD 008 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('TD 008', 'Tuğçe Duman');
  } catch (error) {
    console.error('❌ TD 008 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `TD 008 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}



/**
 * 📊 Temsilci Tüm Günlerdeki Log'ları Getir
 * Tarih bazlı gruplama ile tüm aktiviteleri göster
 */
function getAllEmployeeLogsByDate(employeeCode, employeeName) {
  try {
    console.log(`📊 getAllEmployeeLogsByDate başlatıldı: ${employeeCode}`);
    
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    const employeeFile = findEmployeeFile(employeeCode);
    
    if (!employeeFile) {
      throw new Error(`${employeeCode} temsilci dosyası bulunamadı`);
    }
    
    // GEÇİCİ: Son güncelleme tarihi kontrolünü devre dışı bırak
    // TODO: Tarih karşılaştırması daha sonra aktif edilecek
    const lastUpdateKey = `LAST_UPDATE_${employeeCode}`;
    // const lastUpdateDate = PropertiesService.getScriptProperties().getProperty(lastUpdateKey);
    const lastUpdateDate = null; // GEÇİCİ: Tüm log'ları al
    
    console.log(`🔍 Son güncelleme tarihi: ${lastUpdateDate || 'İlk giriş (tüm log\'lar alınacak)'}`);
    
    // Tüm Format Tablo sayfalarını bul - header'lara göre
    const formatTableSheets = [];
    const sheets = employeeFile.getSheets();
    
    console.log(`🔍 Mevcut sayfalar: ${sheets.map(s => s.getName()).join(', ')}`);
    
    for (const sheet of sheets) {
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) continue;
      
      const lastCol = sheet.getLastColumn();
      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      
      console.log(`🔍 Sayfa "${sheet.getName()}" headers: ${headers.join(' | ')}`);
      
      // Skip known consolidated sheets by distinctive headers (T-Aktivite Özet mantığı)
      const isRandevuSheet = headers.some(h => h && h.toString().toLowerCase().includes('randevu durumu'));
      const isFirsatSheet = headers.some(h => h && h.toString().toLowerCase().includes('fırsat durumu') || h && h.toString().toLowerCase().includes('firsat durumu'));
      const isToplSheet = headers.some(h => h && h.toString().toLowerCase().includes('toplantı durumu') || h && h.toString().toLowerCase().includes('toplanti durumu'));
      if (isRandevuSheet || isFirsatSheet || isToplSheet) {
        console.log(`⏭️ Bilinen sayfa atlandı: "${sheet.getName()}"`);
        continue;
      }
      
      // Format Tablo header'larını kontrol et: Aktivite + (Aktivite Tarihi veya Log) - T-Aktivite Özet mantığı
      const hasAktivite = headers.some(h => h && h.toString().toLowerCase().includes('aktivite'));
      const hasTarihi = headers.some(h => h && h.toString().toLowerCase().includes('aktivite tarihi') || h && h.toString().toLowerCase().includes('tarih'));
      const hasLog = headers.some(h => h && h.toString().toLowerCase().includes('log') || h && h.toString().toLowerCase().includes('günlük'));
      
      // Daha esnek kontrol: Aktivite + (Tarih veya Log) - T-Aktivite Özet mantığı
      const aktiviteIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('aktivite'));
      const tarihIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('aktivite tarihi') || h && h.toString().toLowerCase().includes('tarih'));
      const logIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('log') || h && h.toString().toLowerCase().includes('günlük'));
      
      console.log(`🔍 "${sheet.getName()}" kontrol: Aktivite=${hasAktivite}(${aktiviteIndex}), Tarih=${hasTarihi}(${tarihIndex}), Log=${hasLog}(${logIndex})`);
      
      // Sıkı kontrol: Aktivite + Tarih + Log - HEPSİ OLMALI
      if (hasAktivite && hasTarihi && hasLog && aktiviteIndex !== -1 && tarihIndex !== -1 && logIndex !== -1) {
        // Header'lar uygunsa sayfayı al - veri kontrolü yapma (çok yavaş)
        formatTableSheets.push({
          sheet: sheet,
          aktiviteIndex: aktiviteIndex,
          tarihIndex: tarihIndex,
          logIndex: logIndex
        });
        console.log(`✅ Format Tablo sayfası bulundu: "${sheet.getName()}" (header kontrolü ile)`);
      }
    }
    
    if (formatTableSheets.length === 0) {
      const sheetNames = sheets.map(sheet => sheet.getName());
      throw new Error(`Format Tablo sayfası bulunamadı. Mevcut sayfalar: ${sheetNames.join(', ')}`);
    }
    
    console.log(`📊 ${formatTableSheets.length} adet Format Tablo sayfası bulundu`);
    
    // Tüm sayfalardan veri topla
    let allData = [];
    for (const formatSheet of formatTableSheets) {
      const sheet = formatSheet.sheet;
      const lastRow = sheet.getLastRow();
      console.log(`📊 "${sheet.getName()}" sayfasından veri okunuyor (${lastRow} satır)`);
      
      if (lastRow > 1) {
        const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getDisplayValues();
        console.log(`📊 "${sheet.getName()}" sayfasından ${data.length} satır veri alındı`);
        allData.push(...data.map(row => ({
          ...row,
          _sheetName: sheet.getName(),
          _aktiviteIndex: formatSheet.aktiviteIndex,
          _tarihIndex: formatSheet.tarihIndex,
          _logIndex: formatSheet.logIndex
        })));
      }
    }
    
    console.log(`📊 Toplam ${allData.length} satır veri toplandı`);
    
    // Veri işleme için kolon indekslerini kullan (ilk sayfadan)
    const firstSheet = formatTableSheets[0];
    const logIdx = firstSheet.logIndex;
    const aktiviteTarihiIdx = firstSheet.tarihIndex;
    const aktiviteIdx = firstSheet.aktiviteIndex;
    
    console.log(`🔍 Kolon indeksleri (ilk sayfadan): Log=${logIdx}, Tarih=${aktiviteTarihiIdx}, Aktivite=${aktiviteIdx}`);
    
    // Tarih bazlı gruplama
    const logsByDate = new Map();
    
    console.log(`📊 Toplam ${allData.length} satır okunacak`);
    
    // GEÇİCİ: Mevcut log özeti sayfasından eski verileri alma işlemini devre dışı bırak
    // TODO: Bu işlem daha sonra aktif edilecek
    const existingLogsByDate = new Map();
    console.log(`🔄 Mevcut log özeti sayfasından eski veriler alınmayacak (tüm log'lar yeniden işlenecek)`);
    
    // Yeni verileri işle
    let newLogsCount = 0;
    console.log(`🚀 LOG İŞLEME BAŞLIYOR: ${allData.length} satır işlenecek`);
    
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      
      // Her satırın kendi indekslerini kullan
      const logValue = row[row._logIndex];
      const aktiviteTarihi = row[row._tarihIndex];
      const aktivite = row[row._aktiviteIndex];
      
      // İlk 10 satırı detaylı göster (debug için)
      if (i < 10) {
        console.log(`🔍 SATIR ${i + 1} DETAYI:`);
        console.log(`   Aktivite: "${aktivite}" (tip: ${typeof aktivite})`);
        console.log(`   Tarih: "${aktiviteTarihi}" (tip: ${typeof aktiviteTarihi})`);
        console.log(`   Log: "${logValue?.substring(0, 50)}..." (tip: ${typeof logValue})`);
        console.log(`   Kaynak: "${row._sheetName}"`);
        console.log(`   İndeksler: Aktivite=${row._aktiviteIndex}, Tarih=${row._tarihIndex}, Log=${row._logIndex}`);
        console.log(`   Ham satır:`, row);
      }
      
      // "Ham veri'den aktarıldı" kontrolü - bunları atla
      const isHamVeri = logValue && String(logValue).toLowerCase().includes('ham veri');
      
      if (isHamVeri) {
        console.log(`⏭️ Ham veri satırı atlandı: "${logValue?.substring(0, 30)}..."`);
        continue; // Bu satırı atla
      }
      
      // Boş değer kontrolü
      const hasAktiviteTarihi = aktiviteTarihi && String(aktiviteTarihi).trim() !== '';
      const hasLogValue = logValue && String(logValue).trim() !== '';
      const hasAktivite = aktivite && String(aktivite).trim() !== '';
      
      if (hasAktiviteTarihi && hasLogValue && hasAktivite) {
        // GEÇİCİ: Tüm log'ları al (tarih karşılaştırmasını devre dışı bırak)
        // TODO: Tarih karşılaştırması daha sonra aktif edilecek
        
        if (!logsByDate.has(aktiviteTarihi)) {
          logsByDate.set(aktiviteTarihi, []);
        }
        
        logsByDate.get(aktiviteTarihi).push({
          rowIndex: i + 2,
          log: logValue,
          aktivite: aktivite,
          aktiviteTarihi: aktiviteTarihi,
          sourceSheet: row._sheetName
        });
        
        newLogsCount++;
        console.log(`✅ Yeni log eklendi: ${aktiviteTarihi} - ${aktivite} (Kaynak: ${row._sheetName})`);
      } else {
        console.log(`❌ Log atlandı: Tarih="${aktiviteTarihi}" (boş: ${!hasAktiviteTarihi}), Aktivite="${aktivite}" (boş: ${!hasAktivite}), Log="${logValue?.substring(0, 30)}..." (boş: ${!hasLogValue})`);
      }
    }
    
    console.log(`🎯 LOG İŞLEME TAMAMLANDI:`);
    console.log(`   Toplam satır: ${allData.length}`);
    console.log(`   İşlenen log: ${newLogsCount}`);
    console.log(`   Tarih sayısı: ${logsByDate.size}`);
    console.log(`   Tarihler: ${Array.from(logsByDate.keys()).join(', ')}`);
    
    // GEÇİCİ: Sadece yeni verileri kullan (eski veriler birleştirilmeyecek)
    const allLogsByDate = new Map([...logsByDate]);
    
    console.log(`📊 ${allLogsByDate.size} farklı günde log bulundu (${newLogsCount} yeni)`);
    
    // GEÇİCİ: Son güncelleme tarihini kaydetme işlemini devre dışı bırak
    // TODO: Bu işlem daha sonra aktif edilecek
    // const currentDate = new Date().toISOString().split('T')[0];
    // PropertiesService.getScriptProperties().setProperty(lastUpdateKey, currentDate);
    // console.log(`💾 Son güncelleme tarihi kaydedildi: ${currentDate}`);
    
    console.log(`📊 ${allLogsByDate.size} farklı günde log bulundu (${newLogsCount} yeni)`);
    
    // Yönetici dosyasında log özeti sayfası oluştur
    const logSheet = createEmployeeLogSummarySheet(managerFile, employeeCode, employeeName, allLogsByDate);
    
    // Sonuç raporu
    let resultMessage = `📊 ${employeeCode} - ${employeeName} Log Özeti!\n\n`;
    resultMessage += `📅 Toplam gün sayısı: ${allLogsByDate.size}\n`;
    
    let totalLogs = 0;
    for (const [date, logs] of allLogsByDate) {
      resultMessage += `📅 ${date}: ${logs.length} log\n`;
      totalLogs += logs.length;
    }
    
    if (newLogsCount > 0) {
      resultMessage += `\n🆕 Yeni eklenen log: ${newLogsCount}`;
    }
    
    resultMessage += `\n📊 Toplam log sayısı: ${totalLogs}`;
    resultMessage += `\n📈 Detaylı log özeti için "📊 ${employeeCode} Log Özeti" sayfasına bakın`;
    
    SpreadsheetApp.getUi().alert('📊 Log Özeti Tamamlandı', resultMessage, SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log(`✅ ${employeeCode} log özeti tamamlandı`);
    
  } catch (error) {
    console.error(`❌ getAllEmployeeLogsByDate hatası:`, error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Log özeti hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 Temsilci Log Özet Sayfası Oluştur
 * Tarih bazlı gruplama ile tüm log'ları göster
 */
function createEmployeeLogSummarySheet(managerFile, employeeCode, employeeName, logsByDate) {
  try {
    const sheetName = `📊 ${employeeCode} Log Özeti`;
    
    // Eski sayfayı sil (varsa)
    const existingSheet = managerFile.getSheetByName(sheetName);
    if (existingSheet) {
      managerFile.deleteSheet(existingSheet);
    }
    
    // Yeni sayfa oluştur
    const sheet = managerFile.insertSheet(sheetName);
    
    // Başlık
    sheet.getRange(1, 1).setValue(`📊 ${employeeCode} - ${employeeName} Log Özeti`);
    sheet.getRange(1, 1, 1, 4).merge();
    sheet.getRange(1, 1).setFontWeight('bold').setFontSize(14);
    
    // ZAMAN ANALİZİ - ÜSTTE
    addTimeAnalysis(sheet, logsByDate);
    
    // Özet bilgiler
    let row = 10; // Zaman analizi sonrası başla
    sheet.getRange(row, 1).setValue('📅 Toplam Gün:');
    sheet.getRange(row, 2).setValue(logsByDate.size);
    row++;
    
    let totalLogs = 0;
    for (const [date, logs] of logsByDate) {
      totalLogs += logs.length;
    }
    
    sheet.getRange(row, 1).setValue('📊 Toplam Log:');
    sheet.getRange(row, 2).setValue(totalLogs);
    row++;
    
    // Tarih bazlı log'ları ekle - En eski tarihten en yeniye sırala
    row += 2; // Biraz boşluk bırak
    
    // Tarihleri sırala: En yeni tarihten en eskiye
    const sortedDates = Array.from(logsByDate.keys()).sort((a, b) => {
      const dateA = new Date(a.split('.').reverse().join('-'));
      const dateB = new Date(b.split('.').reverse().join('-'));
      return dateB - dateA; // En yeni tarih önce
    });
    
    for (const date of sortedDates) {
      const logs = logsByDate.get(date);
      // Tarih başlığı
      sheet.getRange(row, 1).setValue(`📅 ${date} (${logs.length} log)`);
      sheet.getRange(row, 1, 1, 5).merge();
      sheet.getRange(row, 1).setFontWeight('bold').setBackground('#E3F2FD');
      row++;
      
      // Kaynak bazlı gruplama
      const logsBySource = new Map();
      for (const log of logs) {
        const source = log.sourceSheet || 'Bilinmiyor';
        if (!logsBySource.has(source)) {
          logsBySource.set(source, []);
        }
        logsBySource.get(source).push(log);
      }
      
      // Her kaynak için ayrı bölüm
      for (const [source, sourceLogs] of logsBySource) {
        // Kaynak başlığı
        sheet.getRange(row, 1).setValue(`📊 ${source} (${sourceLogs.length} log)`);
        sheet.getRange(row, 1, 1, 5).merge();
        sheet.getRange(row, 1).setFontWeight('bold').setBackground('#FFF3E0');
        row++;
        
        // Tablo başlıkları
        sheet.getRange(row, 1).setValue('Saat');
        sheet.getRange(row, 2).setValue('Aktivite');
        sheet.getRange(row, 3).setValue('Log Detayı');
        sheet.getRange(row, 4).setValue('Kaynak');
        sheet.getRange(row, 5).setValue('Satır No');
        sheet.getRange(row, 1, 1, 5).setFontWeight('bold').setBackground('#F5F5F5');
        row++;
        
        // Log verilerini ekle - Saat sıralaması ile
        const sortedLogs = sourceLogs.sort((a, b) => {
          const timeA = a.log.match(/(\d{1,2}):(\d{2})/);
          const timeB = b.log.match(/(\d{1,2}):(\d{2})/);
          
          if (!timeA || !timeB) return 0;
          
          const minutesA = parseInt(timeA[1]) * 60 + parseInt(timeA[2]);
          const minutesB = parseInt(timeB[1]) * 60 + parseInt(timeB[2]);
          
          return minutesA - minutesB; // En düşük saatten yükseğe
        });
        
        for (const log of sortedLogs) {
          // Log'dan saat bilgisini çıkar
          const timeMatch = log.log.match(/(\d{1,2}):(\d{2})/);
          const time = timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : 'Bilinmiyor';
          
          sheet.getRange(row, 1).setValue(time);
          sheet.getRange(row, 2).setValue(log.aktivite);
          sheet.getRange(row, 3).setValue(log.log);
          sheet.getRange(row, 4).setValue(log.sourceSheet || 'Bilinmiyor');
          sheet.getRange(row, 5).setValue(log.rowIndex);
          
          // Aktivite türüne göre renklendirme - CRM_CONFIG'den
          const aktivite = log.aktivite.toString();
          let backgroundColor = null;
          
          // CRM_CONFIG'den renk bul
          for (const [status, color] of Object.entries(CRM_CONFIG.COLOR_CODES)) {
            if (aktivite.toLowerCase().includes(status.toLowerCase())) {
              backgroundColor = color;
              break;
            }
          }
          
          // Eğer renk bulunamadıysa varsayılan (Ulaşılamadı ve İlgilenmiyor hariç)
          if (!backgroundColor) {
            if (aktivite.toLowerCase().includes('randevu alındı') || aktivite.toLowerCase().includes('fırsat eklendi')) {
              backgroundColor = 'rgb(232, 245, 232)'; // Açık Yeşil
            } else if (aktivite.toLowerCase().includes('bilgi verildi') || aktivite.toLowerCase().includes('yeniden aranacak')) {
              backgroundColor = 'rgb(255, 248, 225)'; // Açık Sarı
            }
            // İlgilenmiyor ve Ulaşılamadı için renk yok - beyaz kalacak
          }
          
          // Renk uygula
          if (backgroundColor) {
            sheet.getRange(row, 1, 1, 5).setBackground(backgroundColor);
          }
          
          row++;
        }
        
        // Kaynaklar arası boşluk
        row++;
      }
      
      // Günler arası boşluk
      row++;
    }
    
    // ZAMAN ANALİZİ - TÜM LOG'LAR EKLENDİKTEN SONRA
    addTimeAnalysis(sheet, logsByDate);
    
    // Sütun genişliklerini ayarla
    sheet.autoResizeColumns(1, 5);
    
    console.log(`✅ ${sheetName} sayfası oluşturuldu`);
    return sheet;
    
  } catch (error) {
    console.error('❌ createEmployeeLogSummarySheet hatası:', error);
    throw error;
  }
}

// ========================================
// ⏰ ZAMAN ANALİZİ SİSTEMİ
// ========================================

/**
 * ⏰ Log'lar arası zaman analizi yapar
 * Her aktivite türü için ortalama süre hesaplar
 */
function addTimeAnalysis(sheet, logsByDate) {
  try {
    console.log('⏰ Zaman analizi başlatılıyor...');
    
    // Tüm log'ları tek array'de topla
    const allLogs = [];
    for (const [date, logs] of logsByDate) {
      for (const log of logs) {
        allLogs.push({ ...log, date: date });
      }
    }
    
    console.log(`🔍 ZAMAN ANALİZİ DEBUG: Toplam ${allLogs.length} log toplandı`);
    console.log(`🔍 İlk 3 log örneği:`, allLogs.slice(0, 3).map(l => ({ log: l.log, date: l.date })));
    
    // Tarih ve saate göre sırala
    allLogs.sort((a, b) => {
      const dateA = new Date(a.date.split('.').reverse().join('-'));
      const dateB = new Date(b.date.split('.').reverse().join('-'));
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      const timeA = a.log.match(/\s(\d{1,2}):(\d{2}):(\d{2})/);
      const timeB = b.log.match(/\s(\d{1,2}):(\d{2}):(\d{2})/);
      if (timeA && timeB) {
        const totalSecondsA = parseInt(timeA[1]) * 3600 + parseInt(timeA[2]) * 60 + parseInt(timeA[3]);
        const totalSecondsB = parseInt(timeB[1]) * 3600 + parseInt(timeB[2]) * 60 + parseInt(timeB[3]);
        return totalSecondsA - totalSecondsB;
      }
      return 0;
    });
    
    console.log(`🔍 Sıralama sonrası ilk 3 log:`, allLogs.slice(0, 3).map(l => ({ log: l.log, date: l.date })));
    
    // Aktivite türüne göre grupla
    const activityStats = new Map();
    let totalTime = 0;
    let logCount = 0;
    
    for (let i = 0; i < allLogs.length - 1; i++) {
      const currentLog = allLogs[i];
      const nextLog = allLogs[i + 1];
      
      // İki log arası süre hesapla
      const timeDiff = calculateTimeDifference(currentLog, nextLog);
      
      // Debug: İlk 5 hesaplamayı göster
      if (i < 5) {
        console.log(`🔍 ZAMAN HESAPLAMA ${i + 1}:`);
        console.log(`   Log1: "${currentLog.log}" (${currentLog.date})`);
        console.log(`   Log2: "${nextLog.log}" (${nextLog.date})`);
        console.log(`   Fark: ${timeDiff} dakika`);
      }
      
      if (timeDiff > 0) {
        const aktivite = currentLog.aktivite.toString().toLowerCase();
        
        if (!activityStats.has(aktivite)) {
          activityStats.set(aktivite, { count: 0, totalTime: 0, avgTime: 0 });
        }
        
        const stats = activityStats.get(aktivite);
        stats.count++;
        stats.totalTime += timeDiff;
        stats.avgTime = stats.totalTime / stats.count;
        
        totalTime += timeDiff;
        logCount++;
      }
    }
    
    // Zaman analizi özetini ekle - ÜSTTE
    let row = 3; // Başlıktan sonra başla
    
    // Başlık
    sheet.getRange(row, 1).setValue('⏰ ZAMAN ANALİZİ');
    sheet.getRange(row, 1, 1, 5).merge();
    sheet.getRange(row, 1).setFontWeight('bold').setFontSize(14).setBackground('#E3F2FD');
    row++;
    
    // Genel ortalama
    const generalAvg = logCount > 0 ? (totalTime / logCount).toFixed(2) : 0;
    sheet.getRange(row, 1).setValue('📊 Genel Ortalama:');
    sheet.getRange(row, 1, 1, 2).merge();
    sheet.getRange(row, 3).setValue(`${generalAvg} dakika/log`);
    sheet.getRange(row, 1, 1, 3).setFontWeight('bold').setBackground('#F5F5F5');
    row++;
    
    // Aktivite türüne göre detaylar
    for (const [aktivite, stats] of activityStats) {
      sheet.getRange(row, 1).setValue(`📈 ${aktivite}:`);
      sheet.getRange(row, 2).setValue(`${stats.count} log`);
      sheet.getRange(row, 3).setValue(`${stats.avgTime.toFixed(2)} dakika/log`);
      sheet.getRange(row, 4).setValue(`Toplam: ${stats.totalTime} dakika`);
      row++;
    }
    
    console.log('⏰ Zaman analizi tamamlandı');
    
  } catch (error) {
    console.error('❌ Zaman analizi hatası:', error);
  }
}

/**
 * ⏰ İki log arası zaman farkını hesaplar (dakika cinsinden)
 */
function calculateTimeDifference(log1, log2) {
  try {
    const date1 = new Date(log1.date.split('.').reverse().join('-'));
    const date2 = new Date(log2.date.split('.').reverse().join('-'));
    
    const time1 = log1.log.match(/\s(\d{1,2}):(\d{2}):(\d{2})/);
    const time2 = log2.log.match(/\s(\d{1,2}):(\d{2}):(\d{2})/);
    
    if (!time1 || !time2) return 0;
    
    const dateTime1 = new Date(date1);
    dateTime1.setHours(parseInt(time1[1]), parseInt(time1[2]), parseInt(time1[3]), 0);
    
    const dateTime2 = new Date(date2);
    dateTime2.setHours(parseInt(time2[1]), parseInt(time2[2]), parseInt(time2[3]), 0);
    
    const diffMs = dateTime2.getTime() - dateTime1.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    
    return diffMinutes > 0 ? diffMinutes : 0;
    
  } catch (error) {
    console.error('❌ Zaman hesaplama hatası:', error);
    return 0;
  }
}

// ========================================
// 🚀 AKILLI PERFORMANS TAKİP SİSTEMİ
// ========================================

/**
 * 🚀 Akıllı Performans Dashboard - 15 saniyede hazır!
 * Her temsilcinin günlük performansını direkt loglardan analiz eder
 */
function syncAllEmployeesAndShowDashboard() {
  console.log('Function started: syncAllEmployeesAndShowDashboard - AKILLI SİSTEM');
  
  try {
    const ui = SpreadsheetApp.getUi();
    const startTime = new Date();
    
    // Kullanıcıya bilgi ver - OK_CANCEL kullanarak daha güvenilir
    console.log('🚀 Dialog açılıyor...');
    const response = ui.alert(
      '🚀 Akıllı Performans Takibi',
      'Tüm temsilcilerin bugünkü performansını analiz edeceğim. Bu işlem sadece 15-20 saniye sürecek.\n\nDevam etmek istiyor musunuz?',
      ui.ButtonSet.OK_CANCEL
    );
    
    console.log('🚀 Dialog yanıtı:', response);
    console.log('🚀 Response string:', String(response));
    
    // OK_CANCEL için string karşılaştırması
    if (String(response) !== 'OK') {
      console.log('❌ Kullanıcı iptal etti. Response:', String(response));
      return;
    }
    
    console.log('✅ Kullanıcı OK dedi, devam ediliyor...');
    
    console.log('🚀 Akıllı performans analizi başlatılıyor...');
    
    // Progress göster
    ui.alert(
      '🔄 Analiz Başladı',
      'Temsilci performansları analiz ediliyor...\n\nLütfen bekleyin, işlem çok hızlı tamamlanacak!',
      ui.ButtonSet.OK
    );
    
    // Akıllı performans analizi
    console.log('🚀 analyzeEmployeePerformance çağrılıyor...');
    const performanceData = analyzeEmployeePerformance();
    console.log('🚀 analyzeEmployeePerformance tamamlandı:', performanceData);
    
    // Dashboard oluştur
    console.log('🚀 createSmartPerformanceDashboard çağrılıyor...');
    const dashboardResult = createSmartPerformanceDashboard(performanceData);
    console.log('🚀 createSmartPerformanceDashboard tamamlandı:', dashboardResult);
    
    // Süre hesapla
    const endTime = new Date();
    const duration = Math.round((endTime - startTime) / 1000);
    
    // Sonuç raporu
    const totalActivities = Object.values(performanceData).reduce((sum, emp) => sum + emp.totalActivities, 0);
    const activeEmployees = Object.values(performanceData).filter(emp => emp.totalActivities > 0).length;
    
    let resultMessage = `🚀 AKILLI PERFORMANS ANALİZİ TAMAMLANDI!\n\n`;
    resultMessage += `⏱️ İşlem Süresi: ${duration} saniye\n`;
    resultMessage += `📊 Sonuçlar:\n`;
    resultMessage += `• Aktif Temsilci: ${activeEmployees}/${Object.keys(performanceData).length}\n`;
    resultMessage += `• Toplam Aktivite: ${totalActivities}\n`;
    resultMessage += `• En Aktif: ${getMostActiveEmployee(performanceData)}\n`;
    resultMessage += `• Ortalama Çalışma: ${getAverageWorkTime(performanceData)}\n\n`;
    
    if (dashboardResult.success) {
      resultMessage += `✅ Dashboard başarıyla oluşturuldu!\n`;
      resultMessage += `📈 Detaylı analiz için "📊 Günlük Performans" sayfasına bakın`;
    }
    
    ui.alert('🚀 Performans Analizi Tamamlandı', resultMessage, ui.ButtonSet.OK);
    
    console.log('Akıllı performans analizi tamamlandı:', { duration, performanceData, dashboardResult });
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert(
      '❌ Performans Analizi Hatası', 
      'Analiz sırasında hata: ' + error.message, 
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    throw error;
  }
}

/**
 * 🧠 Akıllı performans analizi - Her temsilcinin günlük verilerini direkt çeker
 * ⏰ Timeout korumalı - 5 dakika sınırı
 */
function analyzeEmployeePerformance() {
  console.log('🧠 Akıllı performans analizi başlatılıyor...');
  
  try {
    // ⏰ Timeout kontrolü - 5 dakika sınırı
    const startTime = new Date();
    const timeoutLimit = 5 * 60 * 1000; // 5 dakika
    
    console.log('🧠 CRM_CONFIG.EMPLOYEE_CODES:', CRM_CONFIG.EMPLOYEE_CODES);
    
    const today = new Date();
    const todayKey = Utilities.formatDate(today, 'Europe/Istanbul', 'dd.MM.yyyy');
    console.log('🧠 Bugünkü tarih:', todayKey);
    
    const performanceData = {};
    
    // Her temsilci için performans analizi - Timeout kontrolü ile
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      // ⏰ Her temsilci sonrası timeout kontrolü
      if (new Date() - startTime > timeoutLimit) {
        console.log('⏰ TIMEOUT: Analiz çok uzun sürdü, kısmi sonuç döndürülüyor');
        break;
      }
      
      console.log(`📊 ${employeeCode} analiz ediliyor...`);
    
    performanceData[employeeCode] = {
      name: employeeName,
      code: employeeCode,
      totalActivities: 0,
      positiveActivities: 0,
      negativeActivities: 0,
      appointments: 0,
      opportunities: 0,
      workStart: null,
      workEnd: null,
      workDuration: 0,
      averageCallInterval: 0,
      productivityScore: 0,
      activities: [],
      lastActivity: null
    };
    
    try {
    // Temsilci dosyasını bul ve aç
    const fileName = `${employeeCode} - ${employeeName}`;
    const files = DriveApp.getFilesByName(fileName);
    
      if (files.hasNext()) {
    const file = files.next();
    const employeeSpreadsheet = SpreadsheetApp.openById(file.getId());
    
    // Format Tablo sayfasını analiz et
    const formatTableSheet = employeeSpreadsheet.getSheetByName('Format Tablo');
        if (formatTableSheet && formatTableSheet.getLastRow() > 1) {
          analyzeFormatTableSheet(formatTableSheet, performanceData[employeeCode], todayKey);
        }
        
        // Performans skorunu hesapla
        calculateProductivityScore(performanceData[employeeCode]);
      }
    } catch (error) {
      console.error(`${employeeCode} analiz hatası:`, error.message);
    }
  }
  
  console.log('🧠 Performans analizi tamamlandı:', performanceData);
  return performanceData;
  } catch (error) {
    console.error('🧠 analyzeEmployeePerformance hatası:', error);
    throw error;
  }
}

/**
 * 📋 Format Tablo sayfasını akıllıca analiz et - Hızlı ve optimize
 */
function analyzeFormatTableSheet(sheet, employeeData, todayKey) {
  try {
    // ⏰ Timeout kontrolü - 2 dakika sınırı
    const startTime = new Date();
    const timeoutLimit = 2 * 60 * 1000; // 2 dakika
    
    console.log(`📋 ${employeeData.code} Format Tablo analizi başlatılıyor...`);
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
    
    const kodIdx = headers.indexOf('Kod');
    const aktiviteIdx = headers.indexOf('Aktivite');
    const aktiviteTarihiIdx = headers.indexOf('Aktivite Tarihi');
    const logIdx = headers.indexOf('Log');
    
    if (aktiviteIdx === -1) {
      console.log(`❌ ${employeeData.code} - Aktivite sütunu bulunamadı`);
      return;
    }
    
    const todayActivities = [];
    const activityTimes = [];
    let rowCount = 0;
    
    // Hızlı analiz - Her 100 satırda timeout kontrolü
    for (const row of data) {
      rowCount++;
      
      // ⏰ Her 100 satırda timeout kontrolü
      if (rowCount % 100 === 0) {
        if (new Date() - startTime > timeoutLimit) {
          console.log(`⏰ ${employeeData.code} - Format Tablo analizi timeout, ${rowCount} satır işlendi`);
        break;
        }
      }
      
      const aktivite = String(row[aktiviteIdx] || '').trim();
      if (!aktivite) continue;
      
      const tarih = aktiviteTarihiIdx !== -1 ? row[aktiviteTarihiIdx] : null;
      const log = logIdx !== -1 ? row[logIdx] : null;
      
      // Bugünkü aktivite mi kontrol et - Hızlı kontrol
      let isToday = false;
      if (tarih === todayKey) {
        isToday = true;
      } else if (log && log.includes(todayKey)) {
        isToday = true;
      }
      
      if (isToday) {
        // Aktivite zamanını çıkar
        const activityTime = extractTimeFromLog(log);
        if (activityTime) {
          activityTimes.push(activityTime);
          todayActivities.push({
            activity: aktivite,
            time: activityTime,
            timestamp: parseTimeToMinutes(activityTime)
          });
        }
        
        // Aktivite sayılarını güncelle
        employeeData.totalActivities++;
        
        if (['İlgilenmiyor', 'Ulaşılamadı'].includes(aktivite)) {
          employeeData.negativeActivities++;
        } else {
          employeeData.positiveActivities++;
          if (aktivite.includes('Randevu')) {
            employeeData.appointments++;
          }
          if (aktivite.includes('Fırsat')) {
            employeeData.opportunities++;
          }
        }
      }
    }
    
    // Zaman analizi - Hızlı hesaplama
    if (activityTimes.length > 0) {
      employeeData.workStart = Math.min(...activityTimes);
      employeeData.workEnd = Math.max(...activityTimes);
      employeeData.workDuration = calculateWorkDuration(employeeData.workStart, employeeData.workEnd);
      employeeData.lastActivity = todayActivities[todayActivities.length - 1];
      
      // Arama aralıkları - Optimize edilmiş
      if (activityTimes.length > 1) {
        const sortedTimes = activityTimes.sort();
        const intervals = [];
        for (let i = 1; i < sortedTimes.length; i++) {
          const interval = calculateTimeDifference(sortedTimes[i-1], sortedTimes[i]);
          if (interval > 0 && interval < 480) { // 8 saatten az
            intervals.push(interval);
          }
        }
        if (intervals.length > 0) {
          employeeData.averageCallInterval = Math.round(intervals.reduce((sum, int) => sum + int, 0) / intervals.length);
        }
      }
    }
    
    employeeData.activities = todayActivities;
    console.log(`✅ ${employeeData.code} Format Tablo analizi tamamlandı: ${todayActivities.length} aktivite bulundu`);
    
  } catch (error) {
    console.error(`❌ ${employeeData.code} Format Tablo analizi hatası:`, error);
  }
}

/**
 * 🎯 Verimlilik skorunu hesapla - Hızlı ve optimize
 */
function calculateProductivityScore(employeeData) {
  try {
    // ⏰ Hızlı hesaplama - Timeout korumalı
    const startTime = new Date();
    const timeoutLimit = 30 * 1000; // 30 saniye
    
    if (employeeData.totalActivities === 0) {
      employeeData.productivityScore = 0;
      return;
    }
    
    let score = 0;
    
    // Aktivite sayısı (0-40 puan) - Hızlı hesaplama
    score += Math.min(employeeData.totalActivities * 4, 40);
    
    // Pozitif aktivite oranı (0-30 puan) - Hızlı hesaplama
    if (employeeData.totalActivities > 0) {
      const positiveRatio = employeeData.positiveActivities / employeeData.totalActivities;
      score += positiveRatio * 30;
    }
    
    // Çalışma süresi (0-20 puan) - Hızlı hesaplama
    if (employeeData.workDuration > 0) {
      const workHours = employeeData.workDuration / 60;
      score += Math.min(workHours * 2, 20);
    }
    
    // Randevu ve fırsat (0-10 puan) - Hızlı hesaplama
    score += Math.min((employeeData.appointments + employeeData.opportunities) * 2, 10);
    
    // Timeout kontrolü
    if (new Date() - startTime > timeoutLimit) {
      console.log(`⏰ ${employeeData.code} - Verimlilik hesaplama timeout, varsayılan skor atanıyor`);
      employeeData.productivityScore = Math.round(score * 0.8); // %80 skor
      return;
    }
    
    employeeData.productivityScore = Math.round(score);
    console.log(`✅ ${employeeData.code} - Verimlilik skoru hesaplandı: ${employeeData.productivityScore}/100`);
    
  } catch (error) {
    console.error(`❌ ${employeeData.code} - Verimlilik hesaplama hatası:`, error);
    employeeData.productivityScore = 0;
  }
}

/**
 * 📊 Akıllı performans dashboard'u oluştur
 */
function createSmartPerformanceDashboard(performanceData) {
  console.log('📊 Akıllı dashboard oluşturuluyor...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const todayKey = Utilities.formatDate(today, 'Europe/Istanbul', 'dd.MM.yyyy');
    
    // Dashboard sayfasını oluştur
    let dashboardSheet = ss.getSheetByName('📊 Günlük Performans');
    if (!dashboardSheet) {
      dashboardSheet = ss.insertSheet('📊 Günlük Performans');
    } else {
      dashboardSheet.clear();
    }
    
    // Başlık ve bilgiler
    dashboardSheet.getRange('A1').setValue('🚀 AKILLI PERFORMANS DASHBOARD');
    dashboardSheet.getRange('A1:I1').merge();
    dashboardSheet.getRange('A1').setFontSize(18).setFontWeight('bold').setBackground('#1a73e8').setFontColor('white');
    
    dashboardSheet.getRange('A2').setValue(`📅 Tarih: ${todayKey} | 🕐 Oluşturulma: ${new Date().toLocaleTimeString('tr-TR')}`);
    dashboardSheet.getRange('A2:I2').merge();
    dashboardSheet.getRange('A2').setFontSize(12).setFontWeight('bold').setBackground('#f8f9fa');
    
    dashboardSheet.getRange('A3').setValue('🔄 Veri Kaynağı: Direkt Temsilci Logları | ⚡ Süre: 15-20 saniye');
    dashboardSheet.getRange('A3:I3').merge();
    dashboardSheet.getRange('A3').setFontSize(10).setFontColor('#666');
    
    // Başlık satırı
    const headers = [
      '👤 Temsilci', '📊 Verimlilik', '📞 Toplam Aktivite', '✅ Pozitif', '❌ Negatif',
      '📅 Randevu', '💰 Fırsat', '�� Çalışma Süresi', '📋 Son Aktivite'
    ];
    
    dashboardSheet.getRange('A5:I5').setValues([headers]);
    dashboardSheet.getRange('A5:I5').setFontWeight('bold').setBackground('#e8f5e8').setFontSize(11);
    
    // Veri satırları
    let row = 6;
    const sortedEmployees = Object.values(performanceData).sort((a, b) => b.productivityScore - a.productivityScore);
    
    for (const emp of sortedEmployees) {
      if (emp.totalActivities > 0) {
        const productivityColor = getProductivityColor(emp.productivityScore);
        const workTime = emp.workDuration > 0 ? emp.workDuration : 'Belirlenemedi';
        const lastActivity = emp.lastActivity ? `${emp.lastActivity.activity} (${emp.lastActivity.time})` : 'Aktivite yok';
        
        const rowData = [
          `${emp.code} - ${emp.name}`,
          `${emp.productivityScore}/100`,
          emp.totalActivities,
          emp.positiveActivities,
          emp.negativeActivities,
          emp.appointments,
          emp.opportunities,
          workTime,
          lastActivity
        ];
        
        dashboardSheet.getRange(row, 1, 1, 9).setValues([rowData]);
        
        // Satır renklendirme
        const rowRange = dashboardSheet.getRange(row, 1, 1, 9);
        rowRange.setBackground(productivityColor);
        
        // Verimlilik sütununu özel renklendir
        dashboardSheet.getRange(row, 2).setBackground(getProductivityColor(emp.productivityScore));
        
        row++;
      }
    }
    
    // Toplam satırı
    if (row > 5) {
      dashboardSheet.getRange(row, 1).setValue('📊 TOPLAM');
      dashboardSheet.getRange(row, 1).setFontWeight('bold').setBackground('#1a73e8').setFontColor('white');
      
      const totalActivities = Object.values(performanceData).reduce((sum, emp) => sum + emp.totalActivities, 0);
      const totalPositive = Object.values(performanceData).reduce((sum, emp) => sum + emp.positiveActivities, 0);
      const totalNegative = Object.values(performanceData).reduce((sum, emp) => sum + emp.negativeActivities, 0);
      const totalAppointments = Object.values(performanceData).reduce((sum, emp) => sum + emp.appointments, 0);
      const totalOpportunities = Object.values(performanceData).reduce((sum, emp) => sum + emp.opportunities, 0);
      
      dashboardSheet.getRange(row, 3).setValue(totalActivities);
      dashboardSheet.getRange(row, 4).setValue(totalPositive);
      dashboardSheet.getRange(row, 4).setValue(totalNegative);
      dashboardSheet.getRange(row, 6).setValue(totalAppointments);
      dashboardSheet.getRange(row, 7).setValue(totalOpportunities);
      
      // Toplam satırını renklendir
      dashboardSheet.getRange(row, 3, 1, 5).setBackground('#1a73e8').setFontColor('white').setFontWeight('bold');
    }
    
    // Sütun genişliklerini ayarla
    dashboardSheet.autoResizeColumns(1, 9);
    
    // Dashboard'u aktif sayfa yap
    dashboardSheet.activate();
    
    console.log('📊 Akıllı dashboard oluşturuldu');
    return { success: true, dashboardCreated: true };
    
  } catch (error) {
    console.error('Dashboard oluşturma hatası:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 🎨 Verimlilik skoruna göre renk döndür
 */
function getProductivityColor(score) {
  if (score >= 80) return '#d4edda'; // Açık yeşil - mükemmel
  if (score >= 60) return '#d1ecf1'; // Açık mavi - iyi
  if (score >= 40) return '#fff3cd'; // Açık sarı - orta
  if (score >= 20) return '#f8d7da'; // Açık kırmızı - zayıf
  return '#f5c6cb'; // Koyu kırmızı - çok zayıf
}

/**
 * 🏆 En aktif temsilciyi bul
 */
function getMostActiveEmployee(performanceData) {
  const mostActive = Object.values(performanceData).reduce((max, emp) => 
    emp.totalActivities > max.totalActivities ? emp : max, { totalActivities: 0 });
  
  return mostActive.totalActivities > 0 ? `${mostActive.code} (${mostActive.totalActivities} aktivite)` : 'Aktivite yok';
}

/**
 * ⏰ Ortalama çalışma süresini hesapla
 */
function getAverageWorkTime(performanceData) {
  const activeEmployees = Object.values(performanceData).filter(emp => emp.workDuration > 0);
  if (activeEmployees.length === 0) return 'Belirlenemedi';
  
  const totalDuration = activeEmployees.reduce((sum, emp) => sum + emp.workDuration, 0);
  const averageMinutes = Math.round(totalDuration / activeEmployees.length);
  
  const hours = Math.floor(averageMinutes / 60);
  const minutes = averageMinutes % 60;
  
  if (hours > 0) {
    return `${hours}s ${minutes}d`;
  } else {
    return `${minutes}d`;
  }
}

/**
 * ⏰ Log'dan zaman çıkar (HH:mm formatında)
 */
function extractTimeFromLog(log) {
  if (!log || typeof log !== 'string') return null;
  
  try {
    // HH:mm:ss formatını ara
    const timeMatch = log.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (timeMatch) {
      return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    }
    
    // HH:mm formatını ara
    const timeMatch2 = log.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch2) {
      return `${timeMatch[2].padStart(2, '0')}:${timeMatch[2]}`;
    }
    
    return null;
  } catch (error) {
    console.error('Zaman çıkarma hatası:', error);
    return null;
  }
}

/**
 * ⏱️ Zamanı dakikaya çevir (HH:mm → dakika)
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
  } catch (error) {
    console.error('Zaman parse hatası:', error);
    return 0;
  }
}

/**
 * ⏱️ İki zaman arasındaki farkı hesapla (dakika)
 */
function calculateTimeDifference(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  
  try {
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    
    if (endMinutes >= startMinutes) {
      return endMinutes - startMinutes;
    } else {
      // Gece yarısını geçen durum için
      return (24 * 60 - startMinutes) + endMinutes;
    }
  } catch (error) {
    console.error('Zaman farkı hesaplama hatası:', error);
    return 0;
  }
}

/**
 * 🕐 Çalışma süresini formatla
 */
function calculateWorkDuration(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  
  try {
    const duration = calculateTimeDifference(startTime, endTime);
    return duration;
  } catch (error) {
    console.error('Çalışma süresi hesaplama hatası:', error);
    return 0;
  }
}
/**
 * 🎨 Tüm Yönetici Sayfalarında Renk Kodlaması
 * T Toplantılar renk problemi için özel çözüm
 */
function applyColorCodingToAllManagerSheets() {
  console.log('🎨 Function started: applyColorCodingToAllManagerSheets');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = ss.getSheets();
    let processedSheets = 0;
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      const lowerName = String(sheetName).toLowerCase();
      
      // T sayfalarını işle (T Randevular, T Fırsatlar, T Toplantılar, T Aktivite Özet)
      if (lowerName.startsWith('t ') || lowerName.includes('t randevu') || lowerName.includes('t fırsat') || lowerName.includes('t toplant') || lowerName.includes('t aktivite')) {
        const lastRow = sheet.getLastRow();
        
        if (lastRow > 1) {
          console.log(`🎨 ${sheetName} sayfası renklendiriliyor (${lastRow} satır)`);
          
          // T Toplantılar için özel debug
          if (lowerName.includes('toplant')) {
            console.log(`🎨 T Toplantılar özel işleme başlıyor...`);
          }
          
          // Renk kodlamasını uygula
          applyColorCodingToManagerData(sheet, sheetName, 2, lastRow - 1);
          processedSheets++;
          
          console.log(`✅ ${sheetName} renklendirildi`);
        }
      }
    }
    
    const message = `🎨 Renk Kodlaması Tamamlandı!\n\n✅ İşlenen sayfa: ${processedSheets}\n📋 Tüm T sayfaları renklendirildi`;
    SpreadsheetApp.getUi().alert('🎨 Renk Kodlaması', message, SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log(`🎨 applyColorCodingToAllManagerSheets tamamlandı: ${processedSheets} sayfa işlendi`);
    
  } catch (error) {
    console.error('🎨 applyColorCodingToAllManagerSheets hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Renk Kodlaması Hatası', `Hata: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

console.log("🔧 DEBUG: Ana dosyaya eklendi");
