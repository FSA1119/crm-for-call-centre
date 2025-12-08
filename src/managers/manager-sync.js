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
  // Mevcut 6 aktif personel
  EMPLOYEE_CODES: {
    'NT 002': 'Neslihan Türk', 
    'SB 004': 'Sinem Bakalcı',
    'KM 005': 'Kübra Murat',
    'BH 007': 'Bilge Hin',
    'MK 009': 'Merve Kılıç',
    'NT 012': 'Nazlı Tutuşan'
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
    'Ulaşılamadı': 'rgb(255, 235, 238)',         // #FFEBEE - Light Red
    'Geçersiz Numara': 'rgb(255, 224, 178)',     // #FFE0B2 - Light Orange (mavi değil, farklı)
    'Kurumsal': 'rgb(225, 190, 231)',             // #E1BEE7 - Light Purple (farklı ton)
    
    // Meeting Colors
    'Toplantı Tamamlandı': 'rgb(200, 230, 201)',  // #C8E6C9 - Light Green
    'Toplantı Gerçekleşti': 'rgb(200, 230, 201)', // #C8E6C9 - Light Green (aynı)
    'Toplantı Teklif': 'rgb(165, 214, 167)',      // #A5D6A7 - Darker Green
    'Toplantı Beklemede': 'rgb(255, 243, 224)',   // #FFF3E0 - Soft Orange
    'Toplantı İptal': 'rgb(255, 235, 238)',       // #FFEBEE - Light Red
    'Satış Yapıldı': 'rgb(129, 212, 250)',        // #81D4FA - Medium Blue (farklı ton, #BBDEFB yerine)
    'Potansiyel Sıcak': 'rgb(255, 224, 178)',     // #FFE0B2 - Light Orange
    'Potansiyel Orta': 'rgb(225, 245, 254)',      // #E1F5FE - Light Blue
    'Potansiyel Soğuk': 'rgb(236, 239, 241)',     // #ECEFF1 - Light Gray
    'Çift Kayıt': 'rgb(255, 249, 196)'            // #FFF9C4 - Light Yellow for duplicate highlight
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

var FAST_SYNC = false; // Hızlı mod: ağır adımları atla (renk/validation/auto-resize)

// ========================================
// 🚀 PERFORMANCE OPTIMIZATION HELPERS
// ========================================

/**
 * Cache helper - Header'ları cache'le (Amazon pattern)
 * @param {string} cacheKey - Unique cache key (e.g., 'headers_Firsatlarim')
 * @param {Function} fetchFunction - Function that returns the data
 * @param {number} ttlSeconds - Time to live in seconds (default: 3600 = 1 hour)
 * @returns {*} - Cached or fresh data
 */
function getCachedData(cacheKey, fetchFunction, ttlSeconds = 3600) {
  try {
    const cache = CacheService.getScriptCache();
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Cache miss - fetch fresh data
    const freshData = fetchFunction();
    
    // Store in cache
    try {
      cache.put(cacheKey, JSON.stringify(freshData), ttlSeconds);
    } catch (cacheError) {
      // Cache write failed - continue with fresh data
    }
    
    return freshData;
  } catch (error) {
    // Cache error - return fresh data
    return fetchFunction();
  }
}

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

// ========================================
// 📅 DATE UTILITIES - TEMPORAL INTELLIGENCE
// ========================================

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
* 📅 Ay sütunu için ARRAYFORMULA veya doğrudan değer ataması yapar
* @param {Sheet} sheet - Çalışma sayfası
* @param {Array} dateHeaderCandidates - Tarih sütunu başlık adayları
*/
function setMonthArrayFormulaIfAbsent(sheet, dateHeaderCandidates) {
try {
  if (!sheet) return;
  
  console.log('📅 setMonthArrayFormulaIfAbsent başlatıldı:', { sheet: sheet.getName(), dateHeaderCandidates });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const ayIdx = headers.indexOf('Ay');
  
  if (ayIdx === -1) {
    console.log('📅 Ay sütunu bulunamadı');
    return;
  }
  
  // Tarih sütununu bul
  let dateIdx = -1;
  for (const candidate of dateHeaderCandidates) {
    const idx = headers.indexOf(candidate);
    if (idx !== -1) {
      dateIdx = idx;
      break;
    }
  }
  
  if (dateIdx === -1) {
    console.log('📅 Tarih sütunu bulunamadı:', dateHeaderCandidates);
    return;
  }
  
  console.log('📅 Ay sütunu bulundu:', { ayIdx, dateIdx, dateHeader: headers[dateIdx] });
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  // Doğrudan değer atama yaklaşımı
  const dateColumn = sheet.getRange(2, dateIdx + 1, lastRow - 1, 1).getValues();
  const ayValues = [];
  
  for (let i = 0; i < dateColumn.length; i++) {
    const dateValue = dateColumn[i][0];
    let monthName = '';
    
    if (dateValue) {
      try {
        let dateObj;
        if (dateValue instanceof Date) {
          dateObj = dateValue;
        } else if (typeof dateValue === 'string') {
          dateObj = parseDdMmYyyy(dateValue);
        }
        
        if (dateObj && !isNaN(dateObj.getTime())) {
          monthName = getTurkishMonthName(dateObj.getMonth());
        }
      } catch (e) {
        console.log('📅 Tarih dönüştürme hatası:', e);
      }
    }
    
    ayValues.push([monthName]);
  }
  
  // Ay değerlerini yaz
  if (ayValues.length > 0) {
    sheet.getRange(2, ayIdx + 1, ayValues.length, 1).setValues(ayValues);
    console.log('📅 Ay değerleri güncellendi:', { count: ayValues.length });
  }
  
} catch (error) {
  console.error('📅 setMonthArrayFormulaIfAbsent hatası:', error);
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
    
    // Personel sheet'i için renklendirme yapma (yönetim sheet'i)
    if (sheetName === 'Personel') {
      console.log('🎨 Personel sheet atlandı (renklendirme gerektirmez)');
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
    
    // T Aktivite Özet için status sütunu zorunlu değil
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
    const lastCol = sheet.getLastColumn();
    for (let i = 0; i < rowCount; i++) {
      const rowNumber = startRow + i;
      console.log(`🎨 Processing row ${rowNumber} for ${sheetName}`);
      
      // Boş satır kontrolü: TÜM kolonları kontrol et
      let isRowEmpty = true;
      const rowData = sheet.getRange(rowNumber, 1, 1, lastCol).getDisplayValues()[0];
      for (let c = 0; c < lastCol; c++) {
        const cellValue = String(rowData[c] || '').trim();
        if (cellValue !== '') {
          isRowEmpty = false;
          break;
        }
      }
      
      if (isRowEmpty) {
        // Tamamen boş satır - beyaz bırak (renk uygulama)
        console.log(`🎨 Row ${rowNumber}: Empty row, skipping color coding`);
        continue;
      }
      
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

/**
 * 🔄 Synchronize a single employee
 * @param {string} employeeCode - Employee code to synchronize
 */



// ========================================
// 🚀 INITIALIZATION SYSTEM - SYSTEM STARTUP
// ========================================

/**
 * 🚀 Manager System Initialization - Master Control
 */

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
        // NOT: Toplantı durumu, Randevu durumu, Randevu Tarihi, Saat validasyonları kaldırıldı - bu sütunlar artık yok
        
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
      // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
      targetColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Randevu durumu', 'Randevu Tarihi',
        'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
      ];
    } else if (sourceLower.includes('fırsat') || sourceLower.includes('firsat')) {
      // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
      targetColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Fırsat Durumu', 'Fırsat Tarihi',
        'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
      ];
    } else if (sourceLower.includes('toplant')) {
      // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
      targetColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan', 'Toplantı Tarihi',
        'Ay', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Yeni Takip Tarihi',
        'Yorum', 'Yönetici Not', 'Address', 'Maplink'
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
  console.log('Function started:', { action: 'updateManagerSheet', sheetName, employeeCode, mode, dataLength: data ? data.length : 0 });
  try {
    if (!managerFile || !sheetName || !data || !employeeCode) {
      console.error('Invalid parameters for updateManagerSheet');
      return { totalIncoming: data ? data.length : 0, sameCount: 0, updateCount: 0, newCount: 0 };
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

    // Replace mode: Tüm veriyi temizle ve yeniden yükle (duplicate önleme)
    if (effectiveMode !== 'append') {
      // Tüm sayfalar için çalışan bazında temizleme yap (duplicate önleme)
      if (employeeCode === 'ALL') {
        // Tüm çalışan verilerini temizle (Personel sheet'inden)
        const codes = getAllEmployeeCodes();
        for (const code of codes) {
          clearEmployeeData(sheet, code);
        }
      } else {
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
      const rowIndexToExistingIndex = new Map(); // rowIndex -> existing array index
      for (let i = 0; i < existing.length; i++) {
        const r = existing[i];
        if (canonicalCode(r[idxCode]) !== codeNorm) continue; // restrict to same employee
        const rowIndex = i + 2; // 2-based
        const sKey = strictKey(r);
        strictMap.set(sKey, rowIndex);
        rowIndexToExistingIndex.set(rowIndex, i);
        const soKey = softKey(r);
        if (!softMap.has(soKey)) softMap.set(soKey, rowIndex);
        else softMap.set(soKey, rowIndex); // prefer last occurrence (latest row) for update
      }

      // OPTIMIZATION: Batch read all display values for rows that might need updates
      const allRowIndices = new Set();
      const updates = []; // {rowIndex, values}
      
      // First pass: collect all row indices that might need comparison
      for (const r of allData) {
        r[idxCode] = codeNorm;
        const sKey = strictKey(r);
        if (strictMap.has(sKey)) {
          allRowIndices.add(strictMap.get(sKey));
        }
        const soKey = softKey(r);
        if (softMap.has(soKey)) {
          allRowIndices.add(softMap.get(soKey));
        }
      }
      
      // Batch read all display values at once
      const displayValuesCache = new Map();
      const valuesCache = new Map();
      if (allRowIndices.size > 0) {
        const sortedRowIndices = Array.from(allRowIndices).sort((a, b) => a - b);
        const minRow = sortedRowIndices[0];
        const maxRow = sortedRowIndices[sortedRowIndices.length - 1];
        const batchRange = sheet.getRange(minRow, 1, maxRow - minRow + 1, lastCol);
        const batchDisplayValues = batchRange.getDisplayValues();
        const batchValues = batchRange.getValues();
        
        sortedRowIndices.forEach((rowIndex, idx) => {
          displayValuesCache.set(rowIndex, batchDisplayValues[rowIndex - minRow]);
          valuesCache.set(rowIndex, batchValues[rowIndex - minRow]);
        });
      }

      for (const r of allData) {
        // ensure row\'s code is the intended employee code
        r[idxCode] = codeNorm;
        const sKey = strictKey(r);
        if (strictMap.has(sKey)) {
          const rowIndex = strictMap.get(sKey);
          const currentDisplay = displayValuesCache.get(rowIndex) || [];
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
          const currentDisplay = displayValuesCache.get(rowIndex) || [];
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

      // OPTIMIZATION: Batch process updates - apply protected columns and write in batches
      const baseLower = String(baseTypeForHeaders || '').toLowerCase();
      const isManagerRandevular = baseLower.includes('randevu') && String(targetSheetName) === 'Randevular';
      let protectedIdx = [];
      let headersNow = [];
      
      if (isManagerRandevular && updates.length > 0) {
        // Read headers once
        headersNow = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
        const lowered = headersNow.map(h => String(h||'').toLowerCase());
        const protectCols = ['Toplantı Sonucu','Toplanti Sonucu','Toplantı sonucu','Toplanti sonucu','Teklif Detayı','Teklif Detayi','Satış Potansiyeli','Satis Potansiyeli','Toplantı Tarihi','Toplanti Tarihi','Yeni Takip Tarihi','Toplantıyı Yapan','Toplantiyi Yapan','Yönetici Not','Yonetici Not'];
        protectedIdx = protectCols.map(n => lowered.indexOf(String(n).toLowerCase())).filter(i => i >= 0);
        
        // Batch read protected columns from cache (already read earlier)
        if (protectedIdx.length > 0) {
          for (const u of updates) {
            const currentRow = valuesCache.get(u.rowIndex);
            if (currentRow) {
              protectedIdx.forEach(i => { u.values[i] = currentRow[i]; });
            }
          }
        }
      }
      
      // OPTIMIZATION: Batch write all updates - group consecutive rows for maximum performance
      if (updates.length > 0) {
        updates.sort((a, b) => a.rowIndex - b.rowIndex);
        
        let batchStart = 0;
        for (let i = 1; i <= updates.length; i++) {
          const isLast = i === updates.length;
          const isConsecutive = !isLast && updates[i].rowIndex === updates[i-1].rowIndex + 1;
          
          if (!isConsecutive || isLast) {
            const batchEnd = isLast && isConsecutive ? i : i;
            const batch = updates.slice(batchStart, batchEnd);
            
            if (batch.length === 1) {
              // Single row update
              sheet.getRange(batch[0].rowIndex, 1, 1, lastCol).setValues([batch[0].values]);
            } else {
              // Multiple consecutive rows - batch write for maximum performance
              const firstRow = batch[0].rowIndex;
              const batchValues = batch.map(u => u.values);
              sheet.getRange(firstRow, 1, batch.length, lastCol).setValues(batchValues);
            }
            batchStart = i;
          }
        }
      }

      // Apply appends
      if (rowsToAppend.length > 0 && rowsToAppend[0].length > 0) {
        const startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
        
        // Renk kodlaması uygula - TÜM SAYFALAR İÇİN
        console.log(`🎨 Appended ${rowsToAppend.length} rows to ${sheet.getName()} (colors will be applied after all ops)`);
      }

      // Per-sheet formatting/validation only for touched sheet
      if (!FAST_SYNC) { optimizeColumnWidths(sheet, baseTypeForHeaders); applyManagerSheetDataValidation(sheet, baseTypeForHeaders); try { sheet.setConditionalFormatRules([]); } catch (e) {} }

      // Deduplicate for ALL sheets to prevent duplicate records
      try {
          removeDuplicatesInAggregateSheet(sheet, baseTypeForHeaders);
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
              const m = v.match(/(\\d{2}\\.\\d{2}\\.\\d{4})/);
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
            if (!/^T\\s/i.test(sheet.getName())) {
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
    } // if (data.length > 0) bloğunu kapatıyor

    // Final: apply colors after all operations to prevent late overrides
    try {
      const lr = sheet.getLastRow();
      if (lr > 1 && !FAST_SYNC) {
        applyColorCodingToManagerData(sheet, sheet.getName(), 2, lr - 1);
      }
    } catch (finalColErr) {
      console.log('⚠️ Final recolor skipped:', finalColErr && finalColErr.message);
    }

    console.log('Function complete, returning opStats:', opStats);
    return opStats;
  } catch (error) {
    console.error(`❌ Error updating manager sheet ${sheetName}:`, error);
    return { totalIncoming: data ? data.length : 0, sameCount: 0, updateCount: 0, newCount: 0 };
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
      const hours = value.getHours();
      const minutes = value.getMinutes();
      // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
      return `${hours}:${String(minutes).padStart(2, '0')}`;
    }
    
    // Handle string dates (like "30.12.1899")
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!isNaN(date.getTime()) && date.getFullYear() !== 1899) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
        return `${hours}:${String(minutes).padStart(2, '0')}`;
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



/**
* 📅 Ay sütunu için ARRAYFORMULA veya doğrudan değer ataması yapar
* @param {Sheet} sheet - Çalışma sayfası
* @param {Array} dateHeaderCandidates - Tarih sütunu başlık adayları
*/
function setMonthArrayFormulaIfAbsent(sheet, dateHeaderCandidates) {
try {
  if (!sheet) return;
  
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const ayIdx = headers.indexOf('Ay');
  
  if (ayIdx === -1) {
    console.log('📅 Ay sütunu bulunamadı');
    return;
  }
  
  // Tarih sütununu bul
  let dateIdx = -1;
  for (const candidate of dateHeaderCandidates) {
    const idx = headers.indexOf(candidate);
    if (idx !== -1) {
      dateIdx = idx;
      break;
    }
  }
  
  if (dateIdx === -1) {
    console.log('📅 Tarih sütunu bulunamadı:', dateHeaderCandidates);
    return;
  }
  
  console.log('📅 Ay sütunu bulundu:', { ayIdx, dateIdx, dateHeader: headers[dateIdx] });
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  // Doğrudan değer atama yaklaşımı
  const dateColumn = sheet.getRange(2, dateIdx + 1, lastRow - 1, 1).getValues();
  const ayValues = [];
  
  for (let i = 0; i < dateColumn.length; i++) {
    const dateValue = dateColumn[i][0];
    let monthName = '';
    
    if (dateValue) {
      try {
        let dateObj;
        if (dateValue instanceof Date) {
          dateObj = dateValue;
        } else if (typeof dateValue === 'string') {
          dateObj = parseDdMmYyyy(dateValue);
        }
        
        if (dateObj && !isNaN(dateObj.getTime())) {
          monthName = getTurkishMonthName(dateObj.getMonth());
        }
      } catch (e) {
        console.log('📅 Tarih dönüştürme hatası:', e);
      }
    }
    
    ayValues.push([monthName]);
  }
  
  // Ay değerlerini yaz
  if (ayValues.length > 0) {
    sheet.getRange(2, ayIdx + 1, ayValues.length, 1).setValues(ayValues);
    console.log('📅 Ay değerleri güncellendi:', { count: ayValues.length });
  }
  
} catch (error) {
  console.error('📅 setMonthArrayFormulaIfAbsent hatası:', error);
}
}

/**
* 📅 Date parsing utility for dd.MM.yyyy format
* @param {string} str - Date string in dd.MM.yyyy format
* @returns {Date|null} - Parsed date or null if invalid
*/
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

/**
 * 🔄 Synchronize a single employee
 * @param {string} employeeCode - Employee code to synchronize
 */



// ========================================
// 🚀 INITIALIZATION SYSTEM - SYSTEM STARTUP
// ========================================

/**
 * 🚀 Manager System Initialization - Master Control
 */

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
        // NOT: Toplantı durumu, Randevu durumu, Randevu Tarihi, Saat validasyonları kaldırıldı - bu sütunlar artık yok
        
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
      // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
      targetColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Randevu durumu', 'Randevu Tarihi',
        'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
      ];
    } else if (sourceLower.includes('fırsat') || sourceLower.includes('firsat')) {
      // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
      targetColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Fırsat Durumu', 'Fırsat Tarihi',
        'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
      ];
    } else if (sourceLower.includes('toplant')) {
      // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
      targetColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan', 'Toplantı Tarihi',
        'Ay', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Yeni Takip Tarihi',
        'Yorum', 'Yönetici Not', 'Address', 'Maplink'
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

/**
* 📊 A1 formatında sütun harfini döndürür
* @param {number} columnIndex - Sütun indeksi (0-tabanlı)
* @returns {string} - Sütun harfi (A, B, C, ... AA, AB, ...)
*/
function columnToLetter(columnIndex) {
let temp, letter = '';
columnIndex++;
while (columnIndex > 0) {
  temp = (columnIndex - 1) % 26;
  letter = String.fromCharCode(temp + 65) + letter;
  columnIndex = (columnIndex - temp - 1) / 26;
}
return letter;
}

/**
* 📅 Date parsing utility for dd.MM.yyyy format
* @param {string} str - Date string in dd.MM.yyyy format
* @returns {Date|null} - Parsed date or null if invalid
*/
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

// ========================================
// 🎨 MANAGER MENU SYSTEM - CONTROL CENTER
// ========================================

/**
 * 📋 onOpen - Menüyü otomatik oluştur
 */
function onOpen() {
  try {
    createManagerMenu();
  } catch (error) {
    console.error('Error in onOpen:', error);
  }
}

/**
 * 🎨 Manager Menu Creation - Control Panel
 */
function createManagerMenu() {
  try {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('YÖNETİCİ');
    // "Tüm Verileri Senkronize Et" kaldırıldı - artık gerekli değil
    // Dashboard sistemi direkt temsilci dosyalarından veri çekiyor

    // Sırayla (Üstüne Ekle) - Kullanılıyor (Personel sheet'inden dinamik)
    const appendSubmenu = ui.createMenu('➕ Sırayla (Üstüne Ekle)');
    const allEmployees = getPersonelFromSheet();
    const employeesToShow = allEmployees && allEmployees.length > 0 
      ? allEmployees.filter(p => p.durum === 'Aktif')
      : Object.entries(CRM_CONFIG.EMPLOYEE_CODES).map(([code, name]) => ({
          code, name, durum: 'Aktif'
        }));
    
    for (const emp of employeesToShow) {
      const employeeCode = emp.code;
      const employeeName = emp.name || CRM_CONFIG.EMPLOYEE_CODES[employeeCode] || employeeCode;
      const functionName = `syncSingleEmployeeAppend_${employeeCode.replace(/\s+/g, '_')}`;
      appendSubmenu.addItem(`${employeeCode} - ${employeeName}`, functionName);
    }
    appendSubmenu.addSeparator()
      .addItem('Tüm Kodlar - Randevular', 'syncAllEmployeesAppend_Randevular')
      .addItem('Tüm Kodlar - Fırsatlar', 'syncAllEmployeesAppend_Firsatlar')
      .addItem('Tüm Kodlar - Toplantılar', 'syncAllEmployeesAppend_Toplantilar')
      .addSeparator()
      .addItem('Raporları Güncelle - Tüm Kodlar', 'syncReportsAllEmployees');
    menu.addSubMenu(appendSubmenu)
        .addSeparator();

    // 📊 Log Özeti - Sadece log analizi (Dinamik - Personel sheet'inden)
    const logAnalysisSubmenu = ui.createMenu('📊 Log Özeti');
    logAnalysisSubmenu.addItem('🌐 Genel Log Analizi - Tüm Temsilciler', 'showGeneralLogAnalysis');
    logAnalysisSubmenu.addSeparator();
    logAnalysisSubmenu.addItem('📊 Funnel Raporu', 'showFunnelReportDialog');
    logAnalysisSubmenu.addItem('💾 Funnel Raporu Excel Export', 'exportFunnelReportToExcel');
    logAnalysisSubmenu.addSeparator();
    
    // Personel sheet'inden dinamik oku (aktif olanlar)
    const allEmployeesForLog = getPersonelFromSheet();
    const employeesToShowForLog = allEmployeesForLog && allEmployeesForLog.length > 0 
      ? allEmployeesForLog.filter(p => p.durum === 'Aktif')
      : Object.entries(CRM_CONFIG.EMPLOYEE_CODES).map(([code, name]) => ({
          code, name, durum: 'Aktif'
        }));
    
    for (const emp of employeesToShowForLog) {
      const employeeCode = emp.code;
      const employeeName = emp.name || CRM_CONFIG.EMPLOYEE_CODES[employeeCode] || employeeCode;
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

    // Bakım
    const maintenance = ui.createMenu('🧼 Bakım');
    maintenance.addItem('🎨 (Yönetici) Renk Kodlaması – Tüm Sayfalar', 'forceRefreshManagerColorCoding')
               .addItem('🎨 (Yönetici) Bu Sayfayı Yenile', 'applyManualManagerColorCoding')
               .addItem('🎨 Tüm T Sayfalarında Renklendirme', 'applyColorCodingToAllManagerSheets')
               .addSeparator()
               .addItem('🎨 Sadece T Randevular Renkle', 'recolorTRandevularOnly')
               .addItem('🎨 Sadece T Fırsatlar Renkle', 'recolorTFirsatlarOnly')
               .addItem('🎨 Sadece T Toplantılar Renkle', 'recolorTToplantilarOnly')
               .addSeparator()
               .addItem('🧭 Sadece Sırala (Toplantılar)', 'sortMeetingsManual')
               .addSeparator()
               .addItem('🎨 (Temsilci) Renkleri Yenile – Tümü', 'refreshAgentColorCodingAll')
               .addItem('🎨 (Temsilci) Renkleri Yenile – Seçili Kod', 'refreshAgentColorCodingPrompt')
               .addSeparator()
               .addItem('📊 Özet (Tek Kod)', 'refreshActivitySummaryForCodePrompt')
               .addItem('📊 Özet (Hızlı Parti)', 'refreshActivitySummaryAllFast');
    maintenance.addItem('🔎 Çift Toplantıları Bul (Company name)', 'highlightDuplicateMeetingsByCompany');
    maintenance.addItem("🎨 Tüm Sayfayı Renklendir", "applyColorCodingToEntireSheet")
               .addSeparator()
               .addItem('🔧 T Randevular Sütun Sıralamasını Düzenle', 'fixTRandevularColumnOrder')
               .addItem('🔧 T Toplantılar Sütun Sıralamasını Düzenle', 'fixTToplantilarColumnOrder')
               .addItem('🔧 T Fırsatlar Sütun Sıralamasını Düzenle', 'fixTFirsatlarColumnOrder')
               .addSeparator()
               .addItem('👥 Personel Sheet Oluştur/Güncelle', 'createOrUpdatePersonelSheet');
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
        // NOT: Toplantı durumu, Randevu durumu, Randevu Tarihi, Saat validasyonları kaldırıldı - bu sütunlar artık yok
        
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
      // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
      targetColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Randevu durumu', 'Randevu Tarihi',
        'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
      ];
    } else if (sourceLower.includes('fırsat') || sourceLower.includes('firsat')) {
      // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
      targetColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Fırsat Durumu', 'Fırsat Tarihi',
        'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
      ];
    } else if (sourceLower.includes('toplant')) {
      // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
      targetColumns = [
        'Kod', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
        'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan', 'Toplantı Tarihi',
        'Ay', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Yeni Takip Tarihi',
        'Yorum', 'Yönetici Not', 'Address', 'Maplink'
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
 * 🎨 Manager Sheet Headers - Professional Structure
 * @param {Sheet} sheet - Target sheet
 * @param {string} sheetName - Sheet name
 */
function createManagerSheetHeaders(sheet, sheetName) {
  try {
    let headers = [];
    switch (sheetName) {
      case 'Randevular':
        // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
        headers = [
          'Temsilci Kodu', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
          'Website', 'Mail', 'Toplantı formatı', 'Randevu durumu', 'Randevu Tarihi',
          'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
         ];
         break;
      case 'Fırsatlar':
        // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
        headers = [
          'Temsilci Kodu', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
          'Website', 'Mail', 'Toplantı formatı', 'Fırsat Durumu', 'Fırsat Tarihi',
          'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
        ];
        break;
      case 'Toplantılar':
        // YENİ DÜZEN - Agent ile aynı (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
        headers = [
          'Temsilci Kodu', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
          'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan', 'Toplantı Tarihi',
          'Ay', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Yeni Takip Tarihi',
          'Yorum', 'Yönetici Not', 'Address', 'Maplink'
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
    console.log(`[START] clearEmployeeData: ${employeeCode}`);
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
    
    // OPTIMIZATION: Collect rows to delete first, then delete in reverse order (bottom to top)
    const rowsToDelete = [];
    for (let i = data.length - 1; i > 0; i--) {
      const row = data[i];
      const rowTemsilciKodu = row[temsilciKoduIndex];
      if (rowTemsilciKodu === employeeCode) {
        rowsToDelete.push(i + 1); // 1-based row index
      }
    }
    
    // Batch delete: Delete from bottom to top to maintain correct indices
    let deletedRows = 0;
    for (const rowIndex of rowsToDelete) {
      sheet.deleteRow(rowIndex);
      deletedRows++;
    }
    
    console.log(`[RESULT] clearEmployeeData: ${deletedRows} rows deleted for ${employeeCode}`);
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
 * @performance Fast lookup via EMPLOYEE_FILES mapping (no DriveApp.getFilesByName)
 * @note Spreadsheet objects cannot be cached (not serializable), but fileId lookup is already fast
 * @update Now also reads from Personel sheet (dynamic employee management)
 */
function findEmployeeFile(employeeCode) { 
  try {
    let fileId = null;
    
    // 1. Önce EMPLOYEE_FILES mapping'inden bak (hızlı)
    if (EMPLOYEE_FILES[employeeCode]) {
      fileId = EMPLOYEE_FILES[employeeCode];
    } else {
      // 2. Personel sheet'inden oku (dinamik - yeni personeller için)
      try {
        const managerFile = SpreadsheetApp.getActiveSpreadsheet();
        const personelSheet = managerFile.getSheetByName('Personel');
        
        if (personelSheet && personelSheet.getLastRow() > 1) {
          // Personel sheet'inden batch oku
          const lastRow = personelSheet.getLastRow();
          const lastCol = personelSheet.getLastColumn();
          const data = personelSheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
          
          // Header mapping (esnek)
          const headers = personelSheet.getRange(1, 1, 1, lastCol).getValues()[0];
          const kodIndex = headers.findIndex(h => String(h).trim().toLowerCase() === 'kod');
          const dosyaIdIndex = headers.findIndex(h => String(h).trim().toLowerCase().includes('dosya') || String(h).trim().toLowerCase().includes('file'));
          const durumIndex = headers.findIndex(h => String(h).trim().toLowerCase() === 'durum');
          
          if (kodIndex !== -1 && dosyaIdIndex !== -1) {
            // Temsilci kodunu bul
            for (const row of data) {
              const code = String(row[kodIndex] || '').trim();
              const durum = durumIndex !== -1 ? String(row[durumIndex] || '').trim() : 'Aktif';
              
              if (code === employeeCode && durum === 'Aktif') {
                fileId = String(row[dosyaIdIndex] || '').trim();
                if (fileId) {
                  console.log(`✅ ${employeeCode}: Personel sheet'inden fileId bulundu: ${fileId.substring(0, 20)}...`);
                  break;
                }
              }
            }
          }
        }
      } catch (personelError) {
        console.warn(`⚠️ Personel sheet okuma hatası (${employeeCode}):`, personelError);
      }
    }
    
    // 3. FileId bulunduysa dosyayı aç
    if (fileId) {
      try {
        const employeeFile = SpreadsheetApp.openById(fileId);
        return employeeFile;
      } catch (openError) {
        console.error(`❌ ${employeeCode}: Dosya açılamadı (fileId: ${fileId.substring(0, 20)}...):`, openError);
        return null;
      }
    } else {
      console.warn(`⚠️ ${employeeCode}: FileId bulunamadı (EMPLOYEE_FILES ve Personel sheet'inde yok)`);
      return null;
    }
    
  } catch (error) {
    console.error(`❌ findEmployeeFile hatası (${employeeCode}):`, error);
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
  
  if (FAST_SYNC) {
    try {
      const safeTotal = totalStats && typeof totalStats === 'object' ? totalStats : {};
      const empStats = safeTotal.employeeStats || {};
      const totalRecords = safeTotal.totalRecords || 0;
      const errorCount = (Array.isArray(safeTotal.errors) ? safeTotal.errors.length : 0);
      let resultMessage = '📊 **SENKRONİZASYON SONUÇLARI (Hızlı)**\n\n';
      resultMessage += `📈 **Toplam Kayıt**: ${totalRecords} kayıt\n`;
      resultMessage += `👥 **İşlenen Temsilci**: ${Object.keys(empStats).length}\n`;
      resultMessage += `❌ **Hata Sayısı**: ${errorCount}\n`;
      SpreadsheetApp.getUi().alert('📊 Senkronizasyon Sonuçları', resultMessage, SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    } catch (e) {
      SpreadsheetApp.getUi().alert('📊 Senkronizasyon Sonuçları', 'Hızlı özet gösterilemedi: ' + (e && e.message), SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
  }
  
  try {
    if (!totalStats) {
      console.error('❌ No sync results to show');
      return;
    }

    // Helper format/parse for dd.MM.yyyy
    // Parse dd.MM.yyyy to Date (helper function)
    function parseDdMmYyyy(str) {
      try {
        const s = String(str || "").trim();
        if (!/^\d{2}\.\d{2}\.\d{4}$/.test(s)) return null;
        const [dd, mm, yyyy] = s.split(".").map(n => parseInt(n, 10));
        const d = new Date(yyyy, mm - 1, dd);
        return isNaN(d.getTime()) ? null : d;
      } catch (e) {
        return null;
      }
    }
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

/**
* 📅 Ay sütunu için ARRAYFORMULA veya doğrudan değer ataması yapar
* @param {Sheet} sheet - Çalışma sayfası
* @param {Array} dateHeaderCandidates - Tarih sütunu başlık adayları
*/
function setMonthArrayFormulaIfAbsent(sheet, dateHeaderCandidates) {
try {
  if (!sheet) return;
  
  console.log('📅 setMonthArrayFormulaIfAbsent başlatıldı:', { sheet: sheet.getName(), dateHeaderCandidates });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const ayIdx = headers.indexOf('Ay');
  
  if (ayIdx === -1) {
    console.log('📅 Ay sütunu bulunamadı');
    return;
  }
  
  // Tarih sütununu bul
  let dateIdx = -1;
  for (const candidate of dateHeaderCandidates) {
    const idx = headers.indexOf(candidate);
    if (idx !== -1) {
      dateIdx = idx;
      break;
    }
  }
  
  if (dateIdx === -1) {
    console.log('📅 Tarih sütunu bulunamadı:', dateHeaderCandidates);
    return;
  }
  
  console.log('📅 Ay sütunu bulundu:', { ayIdx, dateIdx, dateHeader: headers[dateIdx] });
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  // Doğrudan değer atama yaklaşımı
  const dateColumn = sheet.getRange(2, dateIdx + 1, lastRow - 1, 1).getValues();
  const ayValues = [];
  
  for (let i = 0; i < dateColumn.length; i++) {
    const dateValue = dateColumn[i][0];
    let monthName = '';
    
    if (dateValue) {
      try {
        let dateObj;
        if (dateValue instanceof Date) {
          dateObj = dateValue;
        } else if (typeof dateValue === 'string') {
          dateObj = parseDdMmYyyy(dateValue);
        }
        
        if (dateObj && !isNaN(dateObj.getTime())) {
          monthName = getTurkishMonthName(dateObj.getMonth());
        }
      } catch (e) {
        console.log('📅 Tarih dönüştürme hatası:', e);
      }
    }
    
    ayValues.push([monthName]);
  }
  
  // Ay değerlerini yaz
  if (ayValues.length > 0) {
    sheet.getRange(2, ayIdx + 1, ayValues.length, 1).setValues(ayValues);
    console.log('📅 Ay değerleri güncellendi:', { count: ayValues.length });
  }
  
} catch (error) {
  console.error('📅 setMonthArrayFormulaIfAbsent hatası:', error);
}
}

/**
* 📊 A1 formatında sütun harfini döndürür
* @param {number} columnIndex - Sütun indeksi (0-tabanlı)
* @returns {string} - Sütun harfi (A, B, C, ... AA, AB, ...)
*/
function columnToLetter(columnIndex) {
let temp, letter = '';
columnIndex++;
while (columnIndex > 0) {
  temp = (columnIndex - 1) % 26;
  letter = String.fromCharCode(temp + 65) + letter;
  columnIndex = (columnIndex - temp - 1) / 26;
}
return letter;
}
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
  'NT 012': '16EUHISXUqxGxkyfzYb5myKyl-p6O7yfuUWuPEhWWCyA',
  'GŞ 006': '1XiIyORsVR14hMNu7xJjLs2wHxBYmDskGCzCHGb0IwN8',
  'BH 007': '1X0k3uUh7KoiywGO3ewg7ULMAWOrY86I2NCBV7zaHUus',
  'TD 008': '1tokFq-zPejBe-Npc1f4RHlRC15tgHn57qJIIIeVdXtQ',
  'MK 009': '1xje6Kf9OZt1T2mB3XAjQgRMle-i-gbuKdh9AYmjPrIA',
  'TİA 010': '1ltRrpcd4EWQT9sZOnEn8fVRdWTSMfG96L7_wb82nrLk'
};

const MANAGER_FILE_ID = '11IsZpaGgXtgpxrie9F_uVwp6uJPcueGhqB73WhZn60A';

/**
 * 📊 Dataset Raporunu Yönetici Dosyasına Ekle
 * Format Tablo arşivlendikten sonra bu fonksiyon yönetici dosyasındaki "Dataset Raporları" sayfasına ekler
 * 
 * @param {string} uzmanKodu - Uzman kodu (örn: 'SB 004')
 * @param {string} sheetName - Format Tablo sayfa adı
 * @param {string} tarih - Tarih (YYYY-MM-DD formatında)
 * @param {Object} analysisResult - Analiz sonuçları (analyzeFormatTableForArchive'den gelir)
 * @param {string} archiveFileId - Arşivlenen dosyanın Google Drive ID'si
 * @param {string} archiveFileName - Arşivlenen dosya adı
 * @returns {Object} İşlem sonucu
 */
function addDatasetReportToManagerSync(uzmanKodu, sheetName, tarih, analysisResult, archiveFileId, archiveFileName) {
  const startTime = Date.now();
  console.log(`📊 Dataset Raporu yönetici dosyasına ekleniyor: ${uzmanKodu} - ${sheetName}`);
  
  try {
    // Yönetici dosyasını aç
    const managerFile = SpreadsheetApp.openById(MANAGER_FILE_ID);
    
    // "Dataset Raporları" sayfasını al veya oluştur
    let reportSheet = managerFile.getSheetByName('Dataset Raporları');
    if (!reportSheet) {
      reportSheet = managerFile.insertSheet('Dataset Raporları');
      
      // Header'ları oluştur
      const headers = [
        'Tarih',
        'Uzman Kodu',
        'Sayfa İsmi',
        'Toplam Kontak',
        'Arama Yapılan',
        'Randevu Alındı',
        'Toplantı Yapıldı',
        'Satış Yapıldı',
        'Başarı Puanı (%)',
        'Tümü Arandı',
        'Arşiv Dosya ID',
        'Arşiv Dosya Adı'
      ];
      
      reportSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      
      // Header stillerini uygula
      const headerRange = reportSheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setFontSize(11);
      
      // Kolon genişliklerini ayarla
      reportSheet.setColumnWidth(1, 100); // Tarih
      reportSheet.setColumnWidth(2, 100); // Uzman Kodu
      reportSheet.setColumnWidth(3, 150); // Sayfa İsmi
      reportSheet.setColumnWidth(4, 100); // Toplam Kontak
      reportSheet.setColumnWidth(5, 120); // Arama Yapılan
      reportSheet.setColumnWidth(6, 100); // Randevu Alındı
      reportSheet.setColumnWidth(7, 120); // Toplantı Yapıldı
      reportSheet.setColumnWidth(8, 100); // Satış Yapıldı
      reportSheet.setColumnWidth(9, 100); // Başarı Puanı
      reportSheet.setColumnWidth(10, 100); // Tümü Arandı
      reportSheet.setColumnWidth(11, 200); // Arşiv Dosya ID
      reportSheet.setColumnWidth(12, 200); // Arşiv Dosya Adı
      
      console.log('✅ "Dataset Raporları" sayfası oluşturuldu');
    }
    
    // Yeni satır ekle (header'dan sonra)
    const newRow = reportSheet.getLastRow() + 1;
    
    // Veriyi hazırla
    const rowData = [
      tarih, // Tarih
      uzmanKodu, // Uzman Kodu
      sheetName, // Sayfa İsmi
      analysisResult.totalContacts, // Toplam Kontak
      analysisResult.aramaYapilan, // Arama Yapılan
      analysisResult.randevuAlindi, // Randevu Alındı
      analysisResult.toplantiYapildi, // Toplantı Yapıldı
      analysisResult.satisYapildi, // Satış Yapıldı
      analysisResult.basariPuani, // Başarı Puanı (%)
      analysisResult.tumuAranmis ? 'Evet' : 'Hayır', // Tümü Arandı
      archiveFileId, // Arşiv Dosya ID
      archiveFileName // Arşiv Dosya Adı
    ];
    
    // Satırı yaz (batch write)
    reportSheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Başarı puanına göre renklendirme (opsiyonel)
    try {
      const basariPuaniRange = reportSheet.getRange(newRow, 9); // Başarı Puanı kolonu
      if (analysisResult.basariPuani >= 20) {
        basariPuaniRange.setBackground('#c8e6c9'); // Yeşil - İyi
      } else if (analysisResult.basariPuani >= 10) {
        basariPuaniRange.setBackground('#fff9c4'); // Sarı - Orta
      } else {
        basariPuaniRange.setBackground('#ffcdd2'); // Kırmızı - Düşük
      }
    } catch (colorError) {
      console.warn('⚠️ Renklendirme hatası (devam ediliyor):', colorError.message);
    }
    
    // Tümü arandı kolonunu renklendir
    try {
      const tumuAranmisRange = reportSheet.getRange(newRow, 10); // Tümü Arandı kolonu
      if (analysisResult.tumuAranmis) {
        tumuAranmisRange.setBackground('#c8e6c9'); // Yeşil
      } else {
        tumuAranmisRange.setBackground('#ffcdd2'); // Kırmızı
      }
    } catch (colorError) {
      console.warn('⚠️ Renklendirme hatası (devam ediliyor):', colorError.message);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Dataset Raporu yönetici dosyasına eklendi (${duration}ms)`);
    
    return {
      success: true,
      sheetName: 'Dataset Raporları',
      rowNumber: newRow,
      duration: duration
    };
    
  } catch (error) {
    console.error(`❌ Dataset Raporu ekleme hatası: ${error.message}`);
    throw error;
  }
}

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

/**
 * 📊 YENİ RAPOR SİSTEMİ - Günlük (Genel)
 * Tüm temsilcileri kıyaslayan günlük performans raporu
 */
function generateReportsGeneralDaily() {
  console.log('📊 Yeni Günlük Rapor (Genel) başlatıldı');
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const dayLabel = formatDate(today);
    
    // Tüm temsilciler için veri topla
    const employeeCodes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    const reportData = collectDailyReportData(employeeCodes, todayStart, todayEnd);
    
    // Rapor sayfası oluştur
    createDailyReportSheet(ss, reportData, dayLabel, todayStart, todayEnd, 'all');
    
    SpreadsheetApp.getUi().alert(
      '✅ Rapor Oluşturuldu',
      `📊 Günlük performans raporu hazır!\n\n${dayLabel}\n\n"📊 Günlük Rapor - Genel" sayfasına bakın.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    console.error('❌ Günlük rapor hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Rapor oluşturma hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 YENİ RAPOR SİSTEMİ - Haftalık (Genel)
 * Tüm temsilcileri kıyaslayan haftalık performans raporu
 */
function generateReportsGeneralWeekly() {
  console.log('📊 Yeni Haftalık Rapor (Genel) başlatıldı');
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    
    // Bu hafta (Pazartesi-Pazar)
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    // Hafta numarası (yılın kaçıncı haftası)
    const weekNumber = getWeekNumberForReport(weekStart);
    const weekLabel = `Hafta ${weekNumber} (${formatDate(weekStart)} - ${formatDate(weekEnd)})`;
    
    // Tüm temsilciler için veri topla
    const employeeCodes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    const reportData = collectWeeklyReportData(employeeCodes, weekStart, weekEnd);
    
    // Rapor sayfası oluştur
    createWeeklyReportSheet(ss, reportData, weekLabel, weekStart, weekEnd, 'all');
    
    SpreadsheetApp.getUi().alert(
      '✅ Rapor Oluşturuldu',
      `📊 Haftalık performans raporu hazır!\n\n${weekLabel}\n\n"📊 Haftalık Rapor - Genel" sayfasına bakın.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    console.error('❌ Haftalık rapor hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Rapor oluşturma hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 YENİ RAPOR SİSTEMİ - Aylık (Genel)
 * Tüm temsilcileri kıyaslayan aylık performans raporu
 */
function generateReportsGeneralMonthly() {
  console.log('📊 Yeni Aylık Rapor (Genel) başlatıldı');
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    
    // Bu ay
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthLabel = `${getTurkishMonthName(today.getMonth())} ${today.getFullYear()}`;
    
    // Tüm temsilciler için veri topla
    const employeeCodes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    const reportData = collectMonthlyReportData(employeeCodes, monthStart, monthEnd);
    
    // Rapor sayfası oluştur
    createMonthlyReportSheet(ss, reportData, monthLabel, monthStart, monthEnd, 'all');
    
    SpreadsheetApp.getUi().alert(
      '✅ Rapor Oluşturuldu',
      `📊 Aylık performans raporu hazır!\n\n${monthLabel}\n\n"📊 Aylık Rapor - Genel" sayfasına bakın.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    console.error('❌ Aylık rapor hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Rapor oluşturma hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 YENİ RAPOR SİSTEMİ - Günlük (Seçili Temsilci)
 */
function generateReportsForEmployeeDailyPrompt() {
  console.log('📊 Yeni Günlük Rapor (Seçili Temsilci) başlatıldı');
  try {
    const code = promptEmployeeCodeForReports();
    if (!code) return;
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    
    const reportData = collectDailyReportData([code], todayStart, todayEnd);
    createDailyReportSheet(ss, reportData, formatDate(today), todayStart, todayEnd, 'employee', code);
    
    SpreadsheetApp.getUi().alert(
      '✅ Rapor Oluşturuldu',
      `📊 ${code} - Günlük performans raporu hazır!\n\n"📊 Günlük Rapor - ${code}" sayfasına bakın.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    console.error('❌ Günlük rapor hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Rapor oluşturma hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 YENİ RAPOR SİSTEMİ - Haftalık (Seçili Temsilci)
 */
function generateReportsForEmployeeWeeklyPrompt() {
  console.log('📊 Yeni Haftalık Rapor (Seçili Temsilci) başlatıldı');
  try {
    const code = promptEmployeeCodeForReports();
    if (!code) return;
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const weekStart = getWeekStart(today);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    const weekNumber = getWeekNumber(weekStart);
    const weekLabel = `Hafta ${weekNumber} (${formatDate(weekStart)} - ${formatDate(weekEnd)})`;
    
    const reportData = collectWeeklyReportData([code], weekStart, weekEnd);
    createWeeklyReportSheet(ss, reportData, weekLabel, weekStart, weekEnd, 'employee', code);
    
    SpreadsheetApp.getUi().alert(
      '✅ Rapor Oluşturuldu',
      `📊 ${code} - Haftalık performans raporu hazır!\n\n${weekLabel}\n\n"📊 Haftalık Rapor - ${code}" sayfasına bakın.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    console.error('❌ Haftalık rapor hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Rapor oluşturma hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 YENİ RAPOR SİSTEMİ - Aylık (Seçili Temsilci)
 */
function generateReportsForEmployeeMonthlyPrompt() {
  console.log('📊 Yeni Aylık Rapor (Seçili Temsilci) başlatıldı');
  try {
    const code = promptEmployeeCodeForReports();
    if (!code) return;
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    const monthLabel = `${getTurkishMonthName(today.getMonth())} ${today.getFullYear()}`;
    
    const reportData = collectMonthlyReportData([code], monthStart, monthEnd);
    createMonthlyReportSheet(ss, reportData, monthLabel, monthStart, monthEnd, 'employee', code);
    
    SpreadsheetApp.getUi().alert(
      '✅ Rapor Oluşturuldu',
      `📊 ${code} - Aylık performans raporu hazır!\n\n${monthLabel}\n\n"📊 Aylık Rapor - ${code}" sayfasına bakın.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    console.error('❌ Aylık rapor hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Rapor oluşturma hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
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

/**
* 🎨 Tüm sayfayı renklendirme fonksiyonu
* @param {string} sheetName - Renklendirmek istenen sayfa adı
*/
function applyColorCodingToEntireSheet(sheetName) {
try {
  console.log("🎨 applyColorCodingToEntireSheet başlatıldı:", { sheetName });
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet;
  
  if (sheetName) {
    sheet = ss.getSheetByName(sheetName);
  } else {
    sheet = ss.getActiveSheet();
    sheetName = sheet.getName();
  }
  
  if (!sheet) {
    console.error("🎨 Sayfa bulunamadı:", sheetName);
    SpreadsheetApp.getUi().alert("Hata", "Belirtilen sayfa bulunamadı: " + sheetName, SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    console.log("🎨 Sayfada veri yok:", sheetName);
    SpreadsheetApp.getUi().alert("Bilgi", "Sayfada renklendirilebilecek veri bulunamadı.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }
  
  // Tüm satırları renklendirme
  applyColorCodingToManagerData(sheet, sheetName, 2, lastRow - 1);
  
  // Ay sütununu güncelleme
  const sheetNameLower = sheetName.toLowerCase();
  if (sheetNameLower.includes("randevu")) {
    setMonthArrayFormulaIfAbsent(sheet, ["Randevu Tarihi", "Tarih"]);
  } else if (sheetNameLower.includes("toplant")) {
    setMonthArrayFormulaIfAbsent(sheet, ["Toplantı Tarihi", "Tarih"]);
  } else if (sheetNameLower.includes("fırsat") || sheetNameLower.includes("firsat")) {
    setMonthArrayFormulaIfAbsent(sheet, ["Fırsat Tarihi", "Tarih"]);
  }
  
  // Saat formatını düzeltme
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const saatIdx = headers.indexOf("Saat");
  
  if (saatIdx !== -1 && lastRow > 1) {
    const saatColumn = sheet.getRange(2, saatIdx + 1, lastRow - 1, 1);
    const saatValues = saatColumn.getValues();
    const formattedValues = [];
    
    for (let i = 0; i < saatValues.length; i++) {
      const value = saatValues[i][0];
      formattedValues.push([formatTimeValue(value)]);
    }
    
    saatColumn.setValues(formattedValues);
    console.log("🎨 Saat formatları düzeltildi:", { count: formattedValues.length });
  }
  
  console.log("🎨 Tüm sayfa renklendirme tamamlandı:", { sheetName, rows: lastRow - 1 });
  SpreadsheetApp.getUi().alert("✅ Tamamlandı", `${sheetName} sayfasındaki ${lastRow - 1} satır renklendirildi, ay değerleri ve saat formatları güncellendi.`, SpreadsheetApp.getUi().ButtonSet.OK);
  
} catch (error) {
  console.error("🎨 applyColorCodingToEntireSheet hatası:", error);
  SpreadsheetApp.getUi().alert("Hata", "Renklendirme sırasında bir hata oluştu: " + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
}
}

/**
* 🎨 T Randevular sayfasını renklendir
*/
function recolorTRandevularOnly() {
applyColorCodingToEntireSheet("T Randevular");
}

/**
* 🎨 T Fırsatlar sayfasını renklendir
*/
function recolorTFirsatlarOnly() {
applyColorCodingToEntireSheet("T Fırsatlar");
}

/**
* 🎨 T Toplantılar sayfasını renklendir
*/
function recolorTToplantilarOnly() {
applyColorCodingToEntireSheet("T Toplantılar");
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

    // YENİ FORMAT - sayfa_kolonlari.md ile TAM uyumlu
    // NOT: Ay, Location, Rating count, Review sütunları kaldırıldı
    const requiredHeaders = [
      'Kod', 'Company name', 'İsim Soyisim', 'Toplantıyı Yapan', 'Toplantı formatı',
      'Toplantı Tarihi', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Yeni Takip Tarihi',
      'Yorum', 'Yönetici Not', 'Kaynak', 'Keyword', 'Category', 'Phone', 'Yetkili Tel', 'Mail', 'Website',
      'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi', 'Site Hızı', 'Site Trafiği', 'Log', 'Address', 'City', 'Maplink'
    ];

    const lastCol = sheet.getLastColumn();
    const currentHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];

    // Eski sütunları kaldır (Randevu durumu, Randevu Tarihi, Saat)
    // Eski sütunları kaldır (Randevu durumu, Randevu Tarihi, Saat, Ay, Location, Rating count, Review)
    const columnsToRemove = ['Randevu durumu', 'Randevu Tarihi', 'Saat', 'Ay', 'Location', 'Rating count', 'Review'];
    let removedCount = 0;
    
    // Sağdan sola sil (index kaymasını önlemek için)
    for (let i = currentHeaders.length - 1; i >= 0; i--) {
      const header = String(currentHeaders[i] || '').trim();
      if (columnsToRemove.includes(header)) {
        const columnNumber = i + 1;
        console.log(`🗑️ Eski sütun kaldırılıyor: ${header} (Sütun ${columnNumber})`);
        
        // Sütunu silmeden önce veriyi yedekle (isteğe bağlı - şu an sadece sütunu siliyoruz)
        sheet.deleteColumn(columnNumber);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`✅ ${removedCount} eski sütun kaldırıldı`);
    }
    
    // Şimdi mevcut header'ları tekrar al (silme sonrası)
    const updatedHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];

    let appended = 0;
    for (const h of requiredHeaders) {
      if (updatedHeaders.indexOf(h) === -1) {
        sheet.insertColumnAfter(sheet.getLastColumn() || 1);
        const newColIndex = sheet.getLastColumn();
        sheet.getRange(1, newColIndex).setValue(h);
        appended++;
      }
    }

    // Reorder: Yeni formata göre sütunları yeniden düzenle
    // YENİ FORMAT: Kod, Company name, İsim Soyisim, Toplantıyı Yapan, Toplantı formatı, ...
    try {
      const headersAfter = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
      const lastRow = sheet.getLastRow();
      
      // Tüm verileri oku (header hariç)
      const allData = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues() : [];
      
      // Yeni sıraya göre verileri yeniden düzenle
      const reorderedData = [];
      for (let rowIdx = 0; rowIdx < allData.length; rowIdx++) {
        const newRow = [];
        for (const targetColumn of requiredHeaders) {
          const colIndex = headersAfter.indexOf(targetColumn);
          if (colIndex !== -1) {
            newRow.push(allData[rowIdx][colIndex] || '');
          } else {
            newRow.push(''); // Yeni sütun için boş değer
          }
        }
        reorderedData.push(newRow);
      }
      
      // Header'ları yeni sıraya göre yaz
      sheet.getRange(1, 1, 1, requiredHeaders.length).setValues([requiredHeaders]);
      
      // Yeniden düzenlenmiş verileri yaz
      if (reorderedData.length > 0) {
        sheet.getRange(2, 1, reorderedData.length, requiredHeaders.length).setValues(reorderedData);
      }
      
      console.log('✅ Toplantılar sayfası yeni formata göre yeniden düzenlendi');
    } catch (reorderErr) {
      console.log('⚠️ Reorder skipped:', reorderErr && reorderErr.message);
    }

    // Her durumda validation'ları yenile (eski sütunlar kaldırıldı, yeni sütunlar eklendi)
      applyManagerSheetDataValidation(sheet, 'Toplantılar');
      optimizeColumnWidths(sheet, 'Toplantılar');
    
    if (appended > 0 || removedCount > 0) {
      console.log(`Toplantılar schema updated: ${appended} yeni sütun eklendi, ${removedCount} eski sütun kaldırıldı`);
    }

    return sheet;
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Mevcut T Toplantılar sayfasını yeni kolon düzenine göre düzenle
 * Temsilci dosyasındaki fixToplantilarimColumnOrder mantığıyla birebir aynı
 */
function fixTToplantilarColumnOrder() {
  console.log('[START] fixTToplantilarColumnOrder');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('T Toplantılar');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'T Toplantılar sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
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
      '• "Ay" kolonunu otomatik dolduracak\n' +
      '• Toplantı formatı, Toplantı Sonucu, Satış Potansiyeli değerlerini normalize edecek\n\n' +
      'Devam etmek istiyor musunuz?',
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      return;
    }
    
    // Yeni sütun sıralaması - YENİ DÜZEN (Manager'da Temsilci Kodu kullanılıyor)
    const newColumns = [
      'Temsilci Kodu', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
      'Website', 'Mail', 'Toplantı formatı', 'Toplantıyı Yapan', 'Toplantı Tarihi',
      'Ay', 'Toplantı Sonucu', 'Teklif Detayı', 'Satış Potansiyeli', 'Yeni Takip Tarihi',
      'Yorum', 'Yönetici Not', 'Address', 'Maplink'
    ];
    
    // Mevcut verileri oku
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      ui.alert('ℹ️ Bilgi', 'T Toplantılar sayfasında düzenlenecek veri bulunamadı.', ui.ButtonSet.OK);
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
      
      const validFormats = ['Yüz Yüze', 'Online', 'Telefon'];
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
      
      if (potansiyelLower === 'yerinde' || potansiyelLower === 'yerinde satış') {
        return 'Yerinde Satış';
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
      
      const validOptions = ['Yerinde Satış', 'Sıcak', 'Orta', 'Soğuk'];
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
        
        // Temsilci Kodu veya Kod mapping
        let targetColName = oldColName;
        if (oldColName === 'Kod') {
          targetColName = 'Temsilci Kodu';
        }
        
        // Yeni kolon index'ini bul
        const newColIndex = newColumns.indexOf(targetColName);
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
    
    // Temsilci Kodu kolonunu text formatında zorla
    const kodColumnIndex = newColumns.indexOf('Temsilci Kodu') + 1;
    if (kodColumnIndex > 0) {
      sheet.getRange(2, kodColumnIndex, newDataRows.length, 1).setNumberFormat('@');
    }
    
    // Validation'ları yeniden uygula
    try {
      applyManagerSheetDataValidation(sheet, 'Toplantılar');
      console.log('✅ Validation kuralları yeniden uygulandı');
    } catch (validationErr) {
      console.error('⚠️ Validation uygulama hatası:', validationErr);
    }
    
    // Flush to ensure all changes are applied
    SpreadsheetApp.flush();
    
    let message = `T Toplantılar sayfası yeni yapıya göre düzenlendi!\n\n`;
    message += `• Keyword, Location, Category, CMS Adı, CMS Grubu, E-Ticaret İzi, Site Hızı, Site Trafiği, Log kolonları silindi\n`;
    message += `• ${newDataRows.length} satır veri taşındı\n`;
    message += `• "Ay" kolonu otomatik dolduruldu\n`;
    message += `• Toplantı formatı ve Toplantı Sonucu değerleri normalize edildi\n`;
    
    ui.alert('✅ Başarılı', message, ui.ButtonSet.OK);
    
    console.log('[RESULT] T Toplantılar kolon düzeni güncellendi');
    
  } catch (error) {
    console.error('[ERROR] fixTToplantilarColumnOrder:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Sütun düzenleme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Mevcut T Randevular sayfasını yeni kolon düzenine göre düzenle
 */
function fixTRandevularColumnOrder() {
  console.log('[START] fixTRandevularColumnOrder');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('T Randevular');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'T Randevular sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
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
      '• "Ay" kolonunu otomatik dolduracak\n' +
      '• "Saat" formatlarını düzeltecek\n\n' +
      'Devam etmek istiyor musunuz?',
      ui.ButtonSet.YES_NO
    );
    
    if (confirm !== ui.Button.YES) {
      return;
    }
    
    console.log('📊 T Randevular kolon yapısı düzenleme başlıyor...');
    
    // Yeni kolon yapısı - YENİ DÜZEN (Manager'da Temsilci Kodu kullanılıyor)
    const newColumns = [
      'Temsilci Kodu', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
      'Website', 'Mail', 'Toplantı formatı', 'Randevu durumu', 'Randevu Tarihi',
      'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
    ];
    
    // Mevcut verileri oku
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      ui.alert('ℹ️ Bilgi', 'T Randevular sayfasında düzenlenecek veri bulunamadı.', ui.ButtonSet.OK);
      return;
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
        
        // Silinecek kolonları atla
        const columnsToRemove = ['Keyword', 'Location', 'Category', 'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi', 
                                  'Site Hızı', 'Site Trafiği', 'Log', 'Review', 'City', 'Rating count',
                                  'Toplantı Sonucu', 'Toplantı Tarihi'];
        if (columnsToRemove.includes(oldColName)) {
          continue;
        }
        
        // Temsilci Kodu veya Kod mapping
        let targetColName = oldColName;
        if (oldColName === 'Kod') {
          targetColName = 'Temsilci Kodu';
        }
        
        // Yeni kolon index'ini bul
        const newColIndex = newColumns.indexOf(targetColName);
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
          const hours = saatValue.getHours();
          const minutes = saatValue.getMinutes();
          // ✅ DÜZELTME 21.6.1: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
          newRow[saatColIndex] = `${hours}:${String(minutes).padStart(2, '0')}`;
        } else if (typeof saatValue === 'string' && saatValue.includes('.')) {
          // Yanlış format (tarih gibi), temizle
          console.warn(`⚠️ Satır ${rowIdx + 2}: Saat formatı yanlış: "${saatValue}", temizleniyor...`);
          newRow[saatColIndex] = '';
        } else if (typeof saatValue === 'string') {
          // HH:mm formatında mı kontrol et
          const timeMatch = saatValue.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            const hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
              // ✅ DÜZELTME 21.6.1: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
              newRow[saatColIndex] = `${hours}:${String(minutes).padStart(2, '0')}`;
            }
          }
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
    
    // Temsilci Kodu kolonunu text formatında zorla
    const kodColumnIndex = newColumns.indexOf('Temsilci Kodu') + 1;
    if (kodColumnIndex > 0) {
      sheet.getRange(2, kodColumnIndex, newDataRows.length, 1).setNumberFormat('@');
    }
    
    // Saat kolonunu text formatına zorla
    const saatColumnIndex = newColumns.indexOf('Saat') + 1;
    if (saatColumnIndex > 0 && newDataRows.length > 0) {
      sheet.getRange(2, saatColumnIndex, newDataRows.length, 1).setNumberFormat('@');
    }
    
    // Validation'ları yeniden uygula
    try {
      applyManagerSheetDataValidation(sheet, 'Randevular');
      console.log('✅ Validation kuralları yeniden uygulandı');
    } catch (validationErr) {
      console.error('⚠️ Validation uygulama hatası:', validationErr);
    }
    
    // Tüm satırlara renklendirme uygula
    console.log('🎨 Tüm satırlara renklendirme uygulanıyor...');
    let colorAppliedCount = 0;
    
    if (newDataRows.length > 0) {
      for (let rowIdx = 0; rowIdx < newDataRows.length; rowIdx++) {
        const rowNum = rowIdx + 2; // +2 çünkü header row=1, data starts at row=2
        
        try {
          applyColorCodingToManagerData(sheet, 'Randevular', rowNum, 1);
          colorAppliedCount++;
        } catch (colorErr) {
          console.error(`⚠️ Satır ${rowNum} renklendirme hatası:`, colorErr);
        }
      }
    }
    
    console.log(`✅ ${colorAppliedCount} satır renklendirildi`);
    
    // Flush to ensure all changes are applied
    SpreadsheetApp.flush();
    
    let message = `T Randevular sayfası yeni yapıya göre düzenlendi!\n\n`;
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
    
    console.log('✅ T Randevular kolon yapısı düzenleme tamamlandı');
    
  } catch (error) {
    console.error('❌ T Randevular kolon yapısı düzenleme hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Düzenleme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Mevcut T Fırsatlar sayfasını yeni kolon düzenine göre düzenle
 */
function fixTFirsatlarColumnOrder() {
  console.log('[START] fixTFirsatlarColumnOrder');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName('T Fırsatlar');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'T Fırsatlar sayfası bulunamadı!', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
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
      return;
    }
    
    console.log('📊 T Fırsatlar kolon yapısı düzenleme başlıyor...');
    
    // Yeni kolon yapısı - YENİ DÜZEN (Log Arşivi kullanıldığı için Log kolonu kaldırıldı)
    const newColumns = [
      'Temsilci Kodu', 'Kaynak', 'Company name', 'İsim Soyisim', 'Phone', 'Yetkili Tel',
      'Website', 'Mail', 'Toplantı formatı', 'Fırsat Durumu', 'Fırsat Tarihi',
      'Ay', 'Saat', 'Yorum', 'Yönetici Not', 'Address', 'Maplink'
    ];
    
    // Mevcut verileri oku
    const lastRow = sheet.getLastRow();
    
    if (lastRow < 2) {
      ui.alert('ℹ️ Bilgi', 'T Fırsatlar sayfasında düzenlenecek veri bulunamadı.', ui.ButtonSet.OK);
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
    
    // Yeni veri array'ini oluştur
    const newDataRows = [];
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    
    // Fırsat Tarihi kolon indexini bul (Temsilci Kodu veya Kod olabilir)
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
        
        // Temsilci Kodu veya Kod mapping
        let targetColName = oldColName;
        if (oldColName === 'Kod') {
          targetColName = 'Temsilci Kodu';
        }
        
        // Yeni kolon index'ini bul
        const newColIndex = newColumns.indexOf(targetColName);
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
          const hours = saatValue.getHours();
          const minutes = saatValue.getMinutes();
          // ✅ DÜZELTME 21.6.1: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
          newRow[saatColIndex] = `${hours}:${String(minutes).padStart(2, '0')}`;
        } else if (typeof saatValue === 'string' && saatValue.includes('.')) {
          // Yanlış format (tarih gibi), temizle
          console.warn(`⚠️ Satır ${rowIdx + 2}: Saat formatı yanlış: "${saatValue}", temizleniyor...`);
          newRow[saatColIndex] = '';
        } else if (typeof saatValue === 'string') {
          // HH:mm formatında mı kontrol et
          const timeMatch = saatValue.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            const hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
              // ✅ DÜZELTME 21.6.1: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
              newRow[saatColIndex] = `${hours}:${String(minutes).padStart(2, '0')}`;
            }
          }
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
    
    // Temsilci Kodu kolonunu text formatında zorla
    const kodColumnIndex = newColumns.indexOf('Temsilci Kodu') + 1;
    if (kodColumnIndex > 0) {
      sheet.getRange(2, kodColumnIndex, newDataRows.length, 1).setNumberFormat('@');
    }
    
    // Saat kolonunu text formatına zorla
    const saatColumnIndex = newColumns.indexOf('Saat') + 1;
    if (saatColumnIndex > 0 && newDataRows.length > 0) {
      sheet.getRange(2, saatColumnIndex, newDataRows.length, 1).setNumberFormat('@');
    }
    
    // Validation'ları yeniden uygula
    try {
      applyManagerSheetDataValidation(sheet, 'Fırsatlar');
      console.log('✅ Validation kuralları yeniden uygulandı');
    } catch (validationErr) {
      console.error('⚠️ Validation uygulama hatası:', validationErr);
    }
    
    // Flush to ensure all changes are applied
    SpreadsheetApp.flush();
    
    let message = `T Fırsatlar sayfası yeni yapıya göre düzenlendi!\n\n`;
    message += `• Keyword, Location, Category, CMS Adı, CMS Grubu, E-Ticaret İzi, Site Hızı, Site Trafiği, Log, City, Rating count, Review kolonları silindi\n`;
    message += `• ${newDataRows.length} satır veri taşındı\n`;
    message += `• "Ay" kolonu otomatik dolduruldu\n`;
    
    ui.alert('✅ Başarılı', message, ui.ButtonSet.OK);
    
    console.log('✅ T Fırsatlar kolon yapısı düzenleme tamamlandı');
    
  } catch (error) {
    console.error('❌ T Fırsatlar kolon yapısı düzenleme hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Düzenleme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
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
            ${['Next','Elite','Platinium Plus','Platinium','Entegre','Pro','Digifirst','Custom'].map(opt => `
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
/**
* 📅 Türkçe ay adını döndür
* @param {number} month - Ay numarası (0-11)
* @returns {string} - Türkçe ay adı
*/
function getTurkishMonthName(month) {
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

if (month >= 0 && month <= 11) {
  return monthNames[month];
}

return '';
}

/**
* 📅 Ay sütunu için ARRAYFORMULA veya doğrudan değer ataması yapar
* @param {Sheet} sheet - Çalışma sayfası
* @param {Array} dateHeaderCandidates - Tarih sütunu başlık adayları
*/
function setMonthArrayFormulaIfAbsent(sheet, dateHeaderCandidates) {
try {
  if (!sheet) return;
  
  console.log('📅 setMonthArrayFormulaIfAbsent başlatıldı:', { sheet: sheet.getName(), dateHeaderCandidates });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const ayIdx = headers.indexOf('Ay');
  
  if (ayIdx === -1) {
    console.log('📅 Ay sütunu bulunamadı');
    return;
  }
  
  // Tarih sütununu bul
  let dateIdx = -1;
  for (const candidate of dateHeaderCandidates) {
    const idx = headers.indexOf(candidate);
    if (idx !== -1) {
      dateIdx = idx;
      break;
    }
  }
  
  if (dateIdx === -1) {
    console.log('📅 Tarih sütunu bulunamadı:', dateHeaderCandidates);
    return;
  }
  
  console.log('📅 Ay sütunu bulundu:', { ayIdx, dateIdx, dateHeader: headers[dateIdx] });
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  // Doğrudan değer atama yaklaşımı
  const dateColumn = sheet.getRange(2, dateIdx + 1, lastRow - 1, 1).getValues();
  const ayValues = [];
  
  for (let i = 0; i < dateColumn.length; i++) {
    const dateValue = dateColumn[i][0];
    let monthName = '';
    
    if (dateValue) {
      try {
        let dateObj;
        if (dateValue instanceof Date) {
          dateObj = dateValue;
        } else if (typeof dateValue === 'string') {
          dateObj = parseDdMmYyyy(dateValue);
        }
        
        if (dateObj && !isNaN(dateObj.getTime())) {
          monthName = getTurkishMonthName(dateObj.getMonth());
        }
      } catch (e) {
        console.log('📅 Tarih dönüştürme hatası:', e);
      }
    }
    
    ayValues.push([monthName]);
  }
  
  // Ay değerlerini yaz
  if (ayValues.length > 0) {
    sheet.getRange(2, ayIdx + 1, ayValues.length, 1).setValues(ayValues);
    console.log('📅 Ay değerleri güncellendi:', { count: ayValues.length });
  }
  
} catch (error) {
  console.error('📅 setMonthArrayFormulaIfAbsent hatası:', error);
}
}

/**
* 📊 A1 formatında sütun harfini döndürür
* @param {number} columnIndex - Sütun indeksi (0-tabanlı)
* @returns {string} - Sütun harfi (A, B, C, ... AA, AB, ...)
*/
function columnToLetter(columnIndex) {
let temp, letter = '';
columnIndex++;
while (columnIndex > 0) {
  temp = (columnIndex - 1) % 26;
  letter = String.fromCharCode(temp + 65) + letter;
  columnIndex = (columnIndex - temp - 1) / 26;
}
return letter;
}
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
/**
* 📅 Türkçe ay adını döndür
* @param {number} month - Ay numarası (0-11)
* @returns {string} - Türkçe ay adı
*/
function getTurkishMonthName(month) {
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

if (month >= 0 && month <= 11) {
  return monthNames[month];
}

return '';
}

/**
* 📅 Ay sütunu için ARRAYFORMULA veya doğrudan değer ataması yapar
* @param {Sheet} sheet - Çalışma sayfası
* @param {Array} dateHeaderCandidates - Tarih sütunu başlık adayları
*/
function setMonthArrayFormulaIfAbsent(sheet, dateHeaderCandidates) {
try {
  if (!sheet) return;
  
  console.log('📅 setMonthArrayFormulaIfAbsent başlatıldı:', { sheet: sheet.getName(), dateHeaderCandidates });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const ayIdx = headers.indexOf('Ay');
  
  if (ayIdx === -1) {
    console.log('📅 Ay sütunu bulunamadı');
    return;
  }
  
  // Tarih sütununu bul
  let dateIdx = -1;
  for (const candidate of dateHeaderCandidates) {
    const idx = headers.indexOf(candidate);
    if (idx !== -1) {
      dateIdx = idx;
      break;
    }
  }
  
  if (dateIdx === -1) {
    console.log('📅 Tarih sütunu bulunamadı:', dateHeaderCandidates);
    return;
  }
  
  console.log('📅 Ay sütunu bulundu:', { ayIdx, dateIdx, dateHeader: headers[dateIdx] });
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  // Doğrudan değer atama yaklaşımı
  const dateColumn = sheet.getRange(2, dateIdx + 1, lastRow - 1, 1).getValues();
  const ayValues = [];
  
  for (let i = 0; i < dateColumn.length; i++) {
    const dateValue = dateColumn[i][0];
    let monthName = '';
    
    if (dateValue) {
      try {
        let dateObj;
        if (dateValue instanceof Date) {
          dateObj = dateValue;
        } else if (typeof dateValue === 'string') {
          dateObj = parseDdMmYyyy(dateValue);
        }
        
        if (dateObj && !isNaN(dateObj.getTime())) {
          monthName = getTurkishMonthName(dateObj.getMonth());
        }
      } catch (e) {
        console.log('📅 Tarih dönüştürme hatası:', e);
      }
    }
    
    ayValues.push([monthName]);
  }
  
  // Ay değerlerini yaz
  if (ayValues.length > 0) {
    sheet.getRange(2, ayIdx + 1, ayValues.length, 1).setValues(ayValues);
    console.log('📅 Ay değerleri güncellendi:', { count: ayValues.length });
  }
  
} catch (error) {
  console.error('📅 setMonthArrayFormulaIfAbsent hatası:', error);
}
}

/**
* 📊 A1 formatında sütun harfini döndürür
* @param {number} columnIndex - Sütun indeksi (0-tabanlı)
* @returns {string} - Sütun harfi (A, B, C, ... AA, AB, ...)
*/
function columnToLetter(columnIndex) {
let temp, letter = '';
columnIndex++;
while (columnIndex > 0) {
  temp = (columnIndex - 1) % 26;
  letter = String.fromCharCode(temp + 65) + letter;
  columnIndex = (columnIndex - temp - 1) / 26;
}
return letter;
}
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
     .addItem('Haftalık Seri (Karşılaştırma)', 'openEmployeeMultiSelectReportWeeklySeries')
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
    
    // Son 8 hafta (Pazartesi-Pazar mantığı ile)
    for (let i = 7; i >= 0; i--) { // 7'den 0'a doğru (eskiden yeniye)
      const weekDate = new Date(today);
      weekDate.setDate(today.getDate() - (7 * i)); // i hafta öncesi
      
      // Pazartesi'yi bul
      const weekStart = getWeekStart(weekDate);
      
      // Pazar = Pazartesi + 6 gün
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      // Yılın kaçıncı haftası olduğunu hesapla
      const weekNumber = getWeekNumberForReport(weekStart);
      
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
/**
* 📅 Türkçe ay adını döndür
* @param {number} month - Ay numarası (0-11)
* @returns {string} - Türkçe ay adı
*/
function getTurkishMonthName(month) {
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

if (month >= 0 && month <= 11) {
  return monthNames[month];
}

return '';
}

/**
* 📅 Ay sütunu için ARRAYFORMULA veya doğrudan değer ataması yapar
* @param {Sheet} sheet - Çalışma sayfası
* @param {Array} dateHeaderCandidates - Tarih sütunu başlık adayları
*/
function setMonthArrayFormulaIfAbsent(sheet, dateHeaderCandidates) {
try {
  if (!sheet) return;
  
  console.log('📅 setMonthArrayFormulaIfAbsent başlatıldı:', { sheet: sheet.getName(), dateHeaderCandidates });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const ayIdx = headers.indexOf('Ay');
  
  if (ayIdx === -1) {
    console.log('📅 Ay sütunu bulunamadı');
    return;
  }
  
  // Tarih sütununu bul
  let dateIdx = -1;
  for (const candidate of dateHeaderCandidates) {
    const idx = headers.indexOf(candidate);
    if (idx !== -1) {
      dateIdx = idx;
      break;
    }
  }
  
  if (dateIdx === -1) {
    console.log('📅 Tarih sütunu bulunamadı:', dateHeaderCandidates);
    return;
  }
  
  console.log('📅 Ay sütunu bulundu:', { ayIdx, dateIdx, dateHeader: headers[dateIdx] });
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  // Doğrudan değer atama yaklaşımı
  const dateColumn = sheet.getRange(2, dateIdx + 1, lastRow - 1, 1).getValues();
  const ayValues = [];
  
  for (let i = 0; i < dateColumn.length; i++) {
    const dateValue = dateColumn[i][0];
    let monthName = '';
    
    if (dateValue) {
      try {
        let dateObj;
        if (dateValue instanceof Date) {
          dateObj = dateValue;
        } else if (typeof dateValue === 'string') {
          dateObj = parseDdMmYyyy(dateValue);
        }
        
        if (dateObj && !isNaN(dateObj.getTime())) {
          monthName = getTurkishMonthName(dateObj.getMonth());
        }
      } catch (e) {
        console.log('📅 Tarih dönüştürme hatası:', e);
      }
    }
    
    ayValues.push([monthName]);
  }
  
  // Ay değerlerini yaz
  if (ayValues.length > 0) {
    sheet.getRange(2, ayIdx + 1, ayValues.length, 1).setValues(ayValues);
    console.log('📅 Ay değerleri güncellendi:', { count: ayValues.length });
  }
  
} catch (error) {
  console.error('📅 setMonthArrayFormulaIfAbsent hatası:', error);
}
}

/**
* 📊 A1 formatında sütun harfini döndürür
* @param {number} columnIndex - Sütun indeksi (0-tabanlı)
* @returns {string} - Sütun harfi (A, B, C, ... AA, AB, ...)
*/
function columnToLetter(columnIndex) {
let temp, letter = '';
columnIndex++;
while (columnIndex > 0) {
  temp = (columnIndex - 1) % 26;
  letter = String.fromCharCode(temp + 65) + letter;
  columnIndex = (columnIndex - temp - 1) / 26;
}
return letter;
}
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
/**
* 📅 Türkçe ay adını döndür
* @param {number} month - Ay numarası (0-11)
* @returns {string} - Türkçe ay adı
*/
function getTurkishMonthName(month) {
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

if (month >= 0 && month <= 11) {
  return monthNames[month];
}

return '';
}

/**
* 📅 Ay sütunu için ARRAYFORMULA veya doğrudan değer ataması yapar
* @param {Sheet} sheet - Çalışma sayfası
* @param {Array} dateHeaderCandidates - Tarih sütunu başlık adayları
*/
function setMonthArrayFormulaIfAbsent(sheet, dateHeaderCandidates) {
try {
  if (!sheet) return;
  
  console.log('📅 setMonthArrayFormulaIfAbsent başlatıldı:', { sheet: sheet.getName(), dateHeaderCandidates });
  
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const ayIdx = headers.indexOf('Ay');
  
  if (ayIdx === -1) {
    console.log('📅 Ay sütunu bulunamadı');
    return;
  }
  
  // Tarih sütununu bul
  let dateIdx = -1;
  for (const candidate of dateHeaderCandidates) {
    const idx = headers.indexOf(candidate);
    if (idx !== -1) {
      dateIdx = idx;
      break;
    }
  }
  
  if (dateIdx === -1) {
    console.log('📅 Tarih sütunu bulunamadı:', dateHeaderCandidates);
    return;
  }
  
  console.log('📅 Ay sütunu bulundu:', { ayIdx, dateIdx, dateHeader: headers[dateIdx] });
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;
  
  // Doğrudan değer atama yaklaşımı
  const dateColumn = sheet.getRange(2, dateIdx + 1, lastRow - 1, 1).getValues();
  const ayValues = [];
  
  for (let i = 0; i < dateColumn.length; i++) {
    const dateValue = dateColumn[i][0];
    let monthName = '';
    
    if (dateValue) {
      try {
        let dateObj;
        if (dateValue instanceof Date) {
          dateObj = dateValue;
        } else if (typeof dateValue === 'string') {
          dateObj = parseDdMmYyyy(dateValue);
        }
        
        if (dateObj && !isNaN(dateObj.getTime())) {
          monthName = getTurkishMonthName(dateObj.getMonth());
        }
      } catch (e) {
        console.log('📅 Tarih dönüştürme hatası:', e);
      }
    }
    
    ayValues.push([monthName]);
  }
  
  // Ay değerlerini yaz
  if (ayValues.length > 0) {
    sheet.getRange(2, ayIdx + 1, ayValues.length, 1).setValues(ayValues);
    console.log('📅 Ay değerleri güncellendi:', { count: ayValues.length });
  }
  
} catch (error) {
  console.error('📅 setMonthArrayFormulaIfAbsent hatası:', error);
}
}

/**
* 📊 A1 formatında sütun harfini döndürür
* @param {number} columnIndex - Sütun indeksi (0-tabanlı)
* @returns {string} - Sütun harfi (A, B, C, ... AA, AB, ...)
*/
function columnToLetter(columnIndex) {
let temp, letter = '';
columnIndex++;
while (columnIndex > 0) {
  temp = (columnIndex - 1) % 26;
  letter = String.fromCharCode(temp + 65) + letter;
  columnIndex = (columnIndex - temp - 1) / 26;
}
return letter;
}
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
    function getActDate(v){
      if (v instanceof Date && !isNaN(v.getTime())) return v;
      const d1 = parseDdMmYyyy(v);
      if (d1) return d1;
      const d2 = new Date(v);
      if (!isNaN(d2.getTime())) return d2;
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
      const s = String(idxStatus>=0 ? row[idxStatus] : '').toLowerCase();
      if (s.includes('iptal')) return 0; // İptal üstte
      if (s.includes('erte')) return 1; // Ertelendi sonra
      if (s.includes('teyit')) return 2; // Teyitlendi
      if (s.includes('randevu al')) return 3; // Alındı
      if (s.includes('ileri')) return 4; // İleri Tarih Randevu
      return 5;
    }
    values.sort(function(a,b){
      const ra = groupRank(a);
      const rb = groupRank(b);
      if (ra !== rb) return ra - rb;
      const da = getActDate(a[idxDate]);
      const db = getActDate(b[idxDate]);
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

function syncSingleEmployeeAppend_MK_009() {
  console.log('🔄 MK 009 append fonksiyonu çağrıldı!');
  
  try {
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('MK 009', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
    console.error('❌ MK 009 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `MK 009 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function syncSingleEmployeeAppend_TİA_010() {
  console.log('🔄 TİA 010 append fonksiyonu çağrıldı!');
  
  try {
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('TİA 010', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
    console.error('❌ TİA 010 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `TİA 010 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * ➕ LG 001 - Lale Gül Sırayla Ekle
 */
function syncSingleEmployeeAppend_LG_001() {
  console.log('🔄 LG 001 append fonksiyonu çağrıldı!');
  
  try {
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('LG 001', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
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
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('NT 002', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
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
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('KO 003', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
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
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('SB 004', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
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
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('KM 005', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
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
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('GŞ 006', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
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
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('BH 007', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
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
    FAST_SYNC = true;
    const syncResult = syncSingleEmployee('TD 008', { mode: 'append' });
    console.log('✅ Sırayla ekleme tamamlandı:', syncResult);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict skipped:', e && e.message); }
    FAST_SYNC = false;
  } catch (error) {
    FAST_SYNC = false;
    console.error('❌ TD 008 append hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `TD 008 hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

// ========================================
// 📊 LOG ÖZETİ FONKSİYONLARI - SADECE LOG ANALİZİ
// ========================================

function logAnalysis_MK_009() {
  console.log('📊 MK 009 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('MK 009', 'Merve Kılıç');
  } catch (error) {
    console.error('❌ MK 009 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `MK 009 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

function logAnalysis_TİA_010() {
  console.log('📊 TİA 010 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('TİA 010', 'Tuğçe İlkay Adsız');
  } catch (error) {
    console.error('❌ TİA 010 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `TİA 010 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

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
 * 📊 NT 012 - Nazlı Tutuşan Log Özeti
 */
function logAnalysis_NT_012() {
  console.log('📊 NT 012 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('NT 012', 'Nazlı Tutuşan');
  } catch (error) {
    console.error('❌ NT 012 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `NT 012 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 SS 014 - Seçil Sayan Log Özeti
 */
function logAnalysis_SS_014() {
  console.log('📊 SS 014 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('SS 014', 'Seçil Sayan');
  } catch (error) {
    console.error('❌ SS 014 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `SS 014 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 NK 015 - Neslihan Kaya Log Özeti
 */
function logAnalysis_NK_015() {
  console.log('📊 NK 015 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('NK 015', 'Neslihan Kaya');
  } catch (error) {
    console.error('❌ NK 015 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `NK 015 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 AD 016 - Aslı Doğan Log Özeti
 */
function logAnalysis_AD_016() {
  console.log('📊 AD 016 log analizi çağrıldı!');
  try {
    getAllEmployeeLogsByDate('AD 016', 'Aslı Doğan');
  } catch (error) {
    console.error('❌ AD 016 log analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `AD 016 log analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 🌐 Genel Log Analizi - Tüm Temsilciler
 * Tüm temsilcilerin loglarını tek sayfada gösterir
 */
function showGeneralLogAnalysis() {
  console.log('🌐 Genel Log Analizi başlatıldı');
  try {
    // UI kontrolü
    const ui = SpreadsheetApp.getUi();
    if (!ui) {
      throw new Error('UI erişilemiyor. Lütfen Google Sheets içinden çalıştırın.');
    }
    
    // Tarih seçimi için HTML dialog oluştur (Funnel Report'taki gibi)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Roboto', Arial, sans-serif;
      background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
      color: white;
      padding: 24px;
      text-align: center;
    }
    .header h2 {
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }
    .content {
      padding: 24px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
    }
    select, input[type="date"] {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
    }
    select:focus, input[type="date"]:focus {
      outline: none;
      border-color: #1976D2;
    }
    .radio-group {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .radio-item {
      flex: 1;
      min-width: 120px;
    }
    .radio-item input[type="radio"] {
      display: none;
    }
    .radio-item label {
      display: block;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }
    .radio-item input[type="radio"]:checked + label {
      background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
      color: white;
      border-color: #1976D2;
    }
    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    button {
      flex: 1;
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.4);
    }
    .btn-secondary {
      background: #f5f5f5;
      color: #666;
    }
    .btn-secondary:hover {
      background: #e0e0e0;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🌐 Genel Log Analizi</h2>
      <p>Tüm Temsilciler - Tarih Seçimi</p>
    </div>
    <div class="content">
      <div class="form-group">
        <label>⏰ Zaman Filtresi:</label>
        <div class="radio-group">
          <div class="radio-item">
            <input type="radio" id="daily" name="timeFilter" value="daily" checked>
            <label for="daily">📅 Günlük</label>
          </div>
          <div class="radio-item">
            <input type="radio" id="weekly" name="timeFilter" value="weekly">
            <label for="weekly">📆 Haftalık</label>
          </div>
          <div class="radio-item">
            <input type="radio" id="monthly" name="timeFilter" value="monthly">
            <label for="monthly">📊 Aylık</label>
          </div>
        </div>
      </div>
      
      <!-- Günlük seçenekleri -->
      <div class="form-group" id="dailyOptions" style="display: block;">
        <label for="dailyFilter">📅 Günlük Seçenek:</label>
        <select id="dailyFilter">
          <option value="today">Bugün</option>
          <option value="yesterday">Dün</option>
          <option value="dateRange">Tarih Aralığı</option>
        </select>
      </div>
      
      <!-- Haftalık seçenekleri -->
      <div class="form-group" id="weeklyOptions" style="display: none;">
        <label for="weeklyFilter">📆 Haftalık Seçenek:</label>
        <select id="weeklyFilter">
          <option value="thisWeek">Bu Hafta</option>
          <option value="lastWeek">Geçen Hafta</option>
          <option value="weekList">Hafta Listesi</option>
        </select>
      </div>
      
      <!-- Aylık seçenekleri -->
      <div class="form-group" id="monthlyOptions" style="display: none;">
        <label for="monthlyFilter">📊 Aylık Seçenek:</label>
        <select id="monthlyFilter">
          <option value="thisMonth">Bu Ay</option>
          <option value="lastMonth">Geçen Ay</option>
          <option value="monthList">Ay Listesi</option>
        </select>
      </div>
      
      <!-- Tarih aralığı (Günlük için) -->
      <div class="form-group" id="dateRangeGroup" style="display: none;">
        <label for="startDate">Başlangıç Tarihi:</label>
        <input type="date" id="startDate">
        <label for="endDate" style="margin-top: 10px;">Bitiş Tarihi:</label>
        <input type="date" id="endDate">
      </div>
      
      <!-- Hafta listesi (Haftalık için) -->
      <div class="form-group" id="weekListGroup" style="display: none;">
        <label for="weekSelect">Hafta Seçin:</label>
        <select id="weekSelect">
          <option value="">Hafta Seçin</option>
        </select>
      </div>
      
      <!-- Ay listesi (Aylık için) -->
      <div class="form-group" id="monthListGroup" style="display: none;">
        <label for="monthSelect">Ay Seçin:</label>
        <select id="monthSelect">
          <option value="">Ay Seçin</option>
        </select>
      </div>
      
      <div class="button-group">
        <button class="btn-secondary" onclick="cancel()">İptal</button>
        <button class="btn-primary" onclick="submit()">Tamam</button>
      </div>
    </div>
  </div>

  <script>
    // Zaman filtresi değiştiğinde seçenekleri göster/gizle
    document.querySelectorAll('input[name="timeFilter"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        const timeFilter = this.value;
        document.getElementById('dailyOptions').style.display = timeFilter === 'daily' ? 'block' : 'none';
        document.getElementById('weeklyOptions').style.display = timeFilter === 'weekly' ? 'block' : 'none';
        document.getElementById('monthlyOptions').style.display = timeFilter === 'monthly' ? 'block' : 'none';
        
        // Tüm alt seçenekleri gizle
        document.getElementById('dateRangeGroup').style.display = 'none';
        document.getElementById('weekListGroup').style.display = 'none';
        document.getElementById('monthListGroup').style.display = 'none';
      });
    });
    
    // Günlük seçenekleri güncelle
    function updateDailyOptions() {
      const dailyFilter = document.getElementById('dailyFilter');
      const dateRangeGroup = document.getElementById('dateRangeGroup');
      
      if (dailyFilter.value === 'dateRange') {
        dateRangeGroup.style.display = 'block';
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
        document.getElementById('endDate').value = today;
      } else {
        dateRangeGroup.style.display = 'none';
      }
    }
    
    document.getElementById('dailyFilter').addEventListener('change', updateDailyOptions);
    
    // Haftalık seçenekleri güncelle
    function updateWeeklyOptions() {
      const weeklyFilter = document.getElementById('weeklyFilter');
      const weekListGroup = document.getElementById('weekListGroup');
      
      if (weeklyFilter.value === 'weekList') {
        weekListGroup.style.display = 'block';
        loadWeekList();
      } else {
        weekListGroup.style.display = 'none';
      }
    }
    
    document.getElementById('weeklyFilter').addEventListener('change', updateWeeklyOptions);
    
    // Aylık seçenekleri güncelle
    function updateMonthlyOptions() {
      const monthlyFilter = document.getElementById('monthlyFilter');
      const monthListGroup = document.getElementById('monthListGroup');
      
      if (monthlyFilter.value === 'monthList') {
        monthListGroup.style.display = 'block';
        loadMonthList();
      } else {
        monthListGroup.style.display = 'none';
      }
    }
    
    document.getElementById('monthlyFilter').addEventListener('change', updateMonthlyOptions);
    
    // Hafta listesini yükle
    function loadWeekList() {
      google.script.run
        .withSuccessHandler(function(weeks) {
          const select = document.getElementById('weekSelect');
          select.innerHTML = '<option value="">Hafta Seçin</option>';
          weeks.forEach(function(week) {
            const option = document.createElement('option');
            option.value = week.value;
            option.textContent = week.label;
            select.appendChild(option);
          });
        })
        .withFailureHandler(function(error) {
          console.error('Hafta listesi yüklenemedi:', error);
        })
        .getWeekListForFunnel();
    }
    
    // Ay listesini yükle
    function loadMonthList() {
      google.script.run
        .withSuccessHandler(function(months) {
          const select = document.getElementById('monthSelect');
          select.innerHTML = '<option value="">Ay Seçin</option>';
          months.forEach(function(month) {
            const option = document.createElement('option');
            option.value = month.value;
            option.textContent = month.label;
            select.appendChild(option);
          });
        })
        .withFailureHandler(function(error) {
          console.error('Ay listesi yüklenemedi:', error);
        })
        .getMonthListForFunnel();
    }
    
    // İlk yüklemede günlük seçeneklerini göster
    updateDailyOptions();

    function submit() {
      const timeFilter = document.querySelector('input[name="timeFilter"]:checked').value;
      let timeFilterValue = timeFilter;
      let startDate = null;
      let endDate = null;
      
      if (timeFilter === 'daily') {
        const dailyFilter = document.getElementById('dailyFilter').value;
        if (dailyFilter === 'today') {
          timeFilterValue = 'daily_today';
        } else if (dailyFilter === 'yesterday') {
          timeFilterValue = 'daily_yesterday';
        } else if (dailyFilter === 'dateRange') {
          timeFilterValue = 'daily_range';
          startDate = document.getElementById('startDate').value;
          endDate = document.getElementById('endDate').value;
          if (!startDate || !endDate) {
            alert('Lütfen başlangıç ve bitiş tarihlerini seçin.');
            return;
          }
        }
      } else if (timeFilter === 'weekly') {
        const weeklyFilter = document.getElementById('weeklyFilter').value;
        if (weeklyFilter === 'thisWeek') {
          timeFilterValue = 'weekly_thisWeek';
        } else if (weeklyFilter === 'lastWeek') {
          timeFilterValue = 'weekly_lastWeek';
        } else if (weeklyFilter === 'weekList') {
          const weekSelect = document.getElementById('weekSelect').value;
          if (!weekSelect) {
            alert('Lütfen bir hafta seçin.');
            return;
          }
          timeFilterValue = 'weekly_' + weekSelect;
        }
      } else if (timeFilter === 'monthly') {
        const monthlyFilter = document.getElementById('monthlyFilter').value;
        if (monthlyFilter === 'thisMonth') {
          timeFilterValue = 'monthly_thisMonth';
        } else if (monthlyFilter === 'lastMonth') {
          timeFilterValue = 'monthly_lastMonth';
        } else if (monthlyFilter === 'monthList') {
          const monthSelect = document.getElementById('monthSelect').value;
          if (!monthSelect) {
            alert('Lütfen bir ay seçin.');
            return;
          }
          timeFilterValue = 'monthly_' + monthSelect;
        }
      }
      
      // Butonu devre dışı bırak
      const submitBtn = document.querySelector('.btn-primary');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'İşleniyor...';
      }
      
      google.script.run
        .withSuccessHandler(function() {
          google.script.host.close();
        })
        .withFailureHandler(function(error) {
          alert('Hata: ' + (error.message || error));
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Tamam';
          }
        })
        .continueGeneralLogAnalysis(timeFilterValue, startDate, endDate);
    }

    function cancel() {
      google.script.host.close();
    }
  </script>
</body>
</html>`;
    
    const html = HtmlService.createHtmlOutput(htmlContent)
      .setWidth(600)
      .setHeight(600);
    
    console.log('📋 Dialog HTML oluşturuldu, gösteriliyor...');
    ui.showModalDialog(html, '🌐 Genel Log Analizi - Tarih Seçimi');
    console.log('✅ Dialog gösterildi');
  } catch (error) {
    console.error('❌ Genel Log Analizi hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Genel Log Analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 🌐 Genel Log Analizi - Devam
 * Tarih aralığı seçildikten sonra çağrılır
 */
function continueGeneralLogAnalysis(timeFilter, startDateStr, endDateStr) {
  console.log('🔍 continueGeneralLogAnalysis çağrıldı:', { timeFilter, startDateStr, endDateStr });
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    
    // Tarihleri parse et (calculateDateRange helper kullan)
    let dateRange;
    if (timeFilter === 'daily_range' && startDateStr && endDateStr) {
      // Manuel tarih aralığı
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      endDate.setHours(23, 59, 59, 999);
      dateRange = { start: startDate, end: endDate };
    } else {
      // calculateDateRange helper kullan
      dateRange = calculateDateRange(timeFilter);
    }
    
    const startDate = dateRange.start;
    const endDate = dateRange.end;
    
    console.log('📅 Tarih filtresi:', Utilities.formatDate(startDate, 'Europe/Istanbul', 'dd.MM.yyyy'), '-', Utilities.formatDate(endDate, 'Europe/Istanbul', 'dd.MM.yyyy'));
    
    // Tüm temsilcilerin loglarını topla
    const allEmployeeLogs = new Map(); // employeeCode -> logs array
    const employeeCodes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    
    console.log(`📊 ${employeeCodes.length} temsilci kontrol edilecek...`);
    console.log(`👥 Temsilci kodları:`, employeeCodes);
    
    // PARALLEL PROCESSING: Chunk'lara böl (Google Apps Script limiti: 6 paralel max)
    // Not: Google Apps Script single-threaded, ama chunk yapısı gelecekte parallel processing için hazır
    const CHUNK_SIZE = 6; // Google Apps Script paralel işlem limiti
    const chunks = [];
    for (let i = 0; i < employeeCodes.length; i += CHUNK_SIZE) {
      chunks.push(employeeCodes.slice(i, i + CHUNK_SIZE));
    }
    
    console.log(`📦 ${chunks.length} chunk oluşturuldu (${CHUNK_SIZE}'şar temsilci)`);
    
    // Her chunk'ı işle (şimdilik sıralı, gelecekte parallel yapılabilir)
    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
      const chunk = chunks[chunkIndex];
      console.log(`📦 Chunk ${chunkIndex + 1}/${chunks.length} işleniyor (${chunk.length} temsilci)...`);
      
      // Chunk içindeki her temsilciyi işle
      for (let i = 0; i < chunk.length; i++) {
        const employeeCode = chunk[i];
        const employeeName = CRM_CONFIG.EMPLOYEE_CODES[employeeCode];
        const globalIndex = chunkIndex * CHUNK_SIZE + i + 1;
        console.log(`📊 ${employeeCode} işleniyor... (${globalIndex}/${employeeCodes.length})`);
        
        try {
          const employeeFile = findEmployeeFile(employeeCode);
          if (!employeeFile) {
            console.log(`⚠️ ${employeeCode} dosyası bulunamadı (EMPLOYEE_FILES mapping'inde yok olabilir)`);
            continue;
          }
          
          console.log(`✅ ${employeeCode} dosyası açıldı`);
          
          // HİBRİT YAKLAŞIM: Önce Log Arşivi'nden, yoksa Format Tablo'lardan çek
          let logsFromArchive = [];
          let logsFromFormatTables = [];
        
        // 1. Log Arşivi'nden veri çek (Gizli sayfalar dahil)
        let logArchiveSheet = employeeFile.getSheetByName('Log Arşivi');
        
        // Gizli sayfaları da kontrol et (esnek arama)
        if (!logArchiveSheet) {
          const allSheets = employeeFile.getSheets();
          for (const sheet of allSheets) {
            const sheetName = sheet.getName().trim();
            if (sheetName === 'Log Arşivi' || 
                sheetName.toLowerCase() === 'log arşivi' ||
                (sheetName.toLowerCase().includes('log') && sheetName.toLowerCase().includes('arşiv'))) {
              logArchiveSheet = sheet;
              break;
            }
          }
        }
        
        if (logArchiveSheet && logArchiveSheet.getLastRow() > 1) {
          console.log(`📊 ${employeeCode}: Log Arşivi'nden veri okunuyor...`);
          
          // INCREMENTAL SYNC: Sadece yeni satırları oku (100x hızlı!)
          const lastRow = logArchiveSheet.getLastRow();
          const cacheKey = `lastProcessedRow_LogArchive_${employeeCode}`;
          const lastProcessedRow = getCachedData(cacheKey, () => 1, 3600); // Default: 1 (header'dan sonra başla)
          
          // Yeni satır sayısını hesapla
          const newRowCount = lastRow - lastProcessedRow;
          
          if (newRowCount > 0) {
            console.log(`📊 ${employeeCode}: Log Arşivi'nden ${newRowCount} yeni satır okunuyor (${lastRow} toplam, ${lastProcessedRow} zaten işlenmiş)`);
            
            // Header + Yeni satırları oku (incremental sync)
            const lastCol = logArchiveSheet.getLastColumn();
            const allData = logArchiveSheet.getRange(1, 1, lastRow, lastCol).getValues();
            const headers = allData[0];
            
            // STANDART LOG ARŞİVİ KOLONLARI (backend.js ile aynı)
            const tarihIndex = headers.indexOf('Tarih');
            const saatIndex = headers.indexOf('Saat');
            const aktiviteIndex = headers.indexOf('Aktivite');
            const logDetayIndex = headers.indexOf('Log Detayı');
            const kaynakSayfaIndex = headers.indexOf('Kaynak Sayfa');
            const kodIndex = headers.indexOf('Kod');
            const companyNameIndex = headers.indexOf('Company name');
            
            // Tüm zorunlu kolonlar mevcut mu kontrol et
            if (tarihIndex !== -1 && saatIndex !== -1 && aktiviteIndex !== -1 && logDetayIndex !== -1) {
              // Sadece yeni satırları işle (incremental sync)
              const startRow = lastProcessedRow + 1; // Header'dan sonra başla
              for (let row = startRow; row < allData.length; row++) {
                const tarih = allData[row][tarihIndex];
                const saat = allData[row][saatIndex];
                const aktivite = allData[row][aktiviteIndex];
                let logDetay = allData[row][logDetayIndex];
                const kaynakSayfa = kaynakSayfaIndex !== -1 ? allData[row][kaynakSayfaIndex] : '';
                const kod = kodIndex !== -1 ? allData[row][kodIndex] : '';
                const companyName = companyNameIndex !== -1 ? allData[row][companyNameIndex] : '';
                
                if (!tarih || !aktivite) continue;
                
                // Log Detayı boşsa, standart format oluştur
                if (!logDetay || String(logDetay).trim() === '') {
                  logDetay = aktivite;
                  if (companyName) logDetay += ` - ${companyName}`;
                  if (tarih) {
                    const tarihStr = tarih instanceof Date 
                      ? Utilities.formatDate(tarih, 'Europe/Istanbul', 'dd.MM.yyyy')
                      : String(tarih);
                    logDetay += ` - ${tarihStr}`;
                  }
                }
                
                // Saat bilgisini log'a ekle (eğer yoksa)
                if (saat && !extractTimeFromLog(logDetay)) {
                  const saatStr = String(saat).trim();
                  // Saat formatını kontrol et (HH:mm:ss veya HH:mm)
                  if (saatStr.match(/\d{1,2}:\d{2}(:\d{2})?/)) {
                    logDetay = `${logDetay} ${saatStr}`;
                  }
                }
                
                // Tarih parse etme (standart format: dd.MM.yyyy)
                let logDate = null;
                if (tarih instanceof Date) {
                  logDate = new Date(tarih);
                } else {
                  logDate = parseDdMmYyyy(tarih);
                  if (!logDate) {
                    try {
                      logDate = new Date(String(tarih));
                      if (isNaN(logDate.getTime())) continue;
                    } catch (e) {
                      continue;
                    }
                  }
                }
                
                if (!logDate || isNaN(logDate.getTime())) continue;
                
                // Tarih karşılaştırması
                const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
                const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                
                if (logDateOnly >= startDateOnly && logDateOnly <= endDateOnly) {
                  logsFromArchive.push({
                    date: tarih,
                    log: logDetay,
                    aktivite: aktivite,
                    source: 'Log Arşivi',
                    kaynakSayfa: kaynakSayfa || '',
                    kod: kod || '',
                    companyName: companyName || ''
                  });
                }
              }
              
              // Son işlenen satır numarasını cache'e kaydet
              const cache = CacheService.getScriptCache();
              cache.put(cacheKey, lastRow.toString(), 3600);
              console.log(`💾 ${employeeCode}: Log Arşivi için son işlenen satır güncellendi: ${lastRow}`);
            } else {
              console.log(`⚠️ ${employeeCode}: Log Arşivi'nde gerekli kolonlar bulunamadı`);
            }
          } else {
            console.log(`⏭️ ${employeeCode}: Log Arşivi'nde yeni satır yok (${lastRow} toplam, ${lastProcessedRow} zaten işlenmiş)`);
          }
        }
        
        // 2. Log Arşivi'nde tarih aralığına uygun veri yoksa Format Tablo'lardan çek
        // NOT: Log Arşivi'nde veri varsa bile, eğer tarih aralığına uygun değilse Format Tablo'lardan çek
        if (logsFromArchive.length === 0) {
          console.log(`📊 ${employeeCode}: Log Arşivi'nde tarih aralığına uygun veri yok, Format Tablo'lardan çekiliyor...`);
          logsFromFormatTables = collectLogsFromFormatTables(employeeFile, startDate, endDate);
        }
        
        // 3. İki kaynağı birleştir ve duplicate'leri temizle
        // ÖNEMLİ: Aynı tarih + aktivite + log kombinasyonu sadece bir kez sayılır
        const allLogs = [...logsFromArchive, ...logsFromFormatTables];
        const uniqueLogs = new Map();
        
        for (const log of allLogs) {
          // Duplicate kontrolü: tarih + aktivite + log kombinasyonu (daha detaylı)
          const dateStr = log.date instanceof Date 
            ? Utilities.formatDate(log.date, 'Europe/Istanbul', 'dd.MM.yyyy')
            : String(log.date);
          const aktiviteStr = String(log.aktivite || '').trim();
          const logStr = String(log.log || '').substring(0, 50); // İlk 50 karakter
          const key = `${dateStr}_${aktiviteStr}_${logStr}`;
          
          // Log Arşivi öncelikli (daha güncel ve doğru)
          if (!uniqueLogs.has(key)) {
            uniqueLogs.set(key, log);
          } else {
            // Eğer mevcut kayıt Format Tablo'dan geliyorsa ve yeni kayıt Log Arşivi'ndense, Log Arşivi'ni kullan
            const existing = uniqueLogs.get(key);
            if (existing.source === 'Format Tablo' && log.source === 'Log Arşivi') {
              uniqueLogs.set(key, log);
            }
          }
        }
        
        const finalLogs = Array.from(uniqueLogs.values());
        
        if (finalLogs.length > 0) {
          allEmployeeLogs.set(employeeCode, finalLogs);
          const uniqueDays = new Set(finalLogs.map(l => {
            const d = parseDdMmYyyy(l.date) || (l.date instanceof Date ? l.date : new Date(String(l.date)));
            if (d instanceof Date && !isNaN(d.getTime())) {
              return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            }
            return String(l.date);
          }));
          console.log(`✅ ${employeeCode}: Log Arşivi: ${logsFromArchive.length}, Format Tablo: ${logsFromFormatTables.length}, Toplam (unique): ${finalLogs.length} log, ${uniqueDays.size} gün`);
        } else {
          console.log(`⚠️ ${employeeCode}: Tarih aralığında log bulunamadı`);
        }
        } catch (error) {
          console.error(`❌ ${employeeCode} işleme hatası:`, error);
        }
      }
      
      console.log(`✅ Chunk ${chunkIndex + 1}/${chunks.length} tamamlandı`);
    }
    
    console.log(`📊 Toplam ${allEmployeeLogs.size} temsilcide log bulundu`);
    
    // Genel Log Analizi sayfası oluştur
    createGeneralLogAnalysisSheet(managerFile, allEmployeeLogs, startDate, endDate);
    
    SpreadsheetApp.getUi().alert(
      '✅ Genel Log Analizi Tamamlandı',
      `📊 ${allEmployeeLogs.size} temsilci kontrol edildi\n📅 Tarih aralığı: ${Utilities.formatDate(startDate, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(endDate, 'Europe/Istanbul', 'dd.MM.yyyy')}\n\n"GENEL LOG ANALİZİ - TÜM TEMSİLCİLER" sayfasına bakın.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } catch (error) {
    console.error('❌ continueGeneralLogAnalysis hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Genel Log Analizi hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * 📊 Genel Log Analizi Sayfası Oluştur
 * Tüm özellikler: 30 sn alarm, 5 dk alarm, aktivite analizi, karşılaştırma
 * Tarih aralığına göre dinamik: Günlük/Haftalık/Aylık
 */
function createGeneralLogAnalysisSheet(managerFile, allEmployeeLogs, startDate, endDate) {
  try {
    const sheetName = 'GENEL LOG ANALİZİ - TÜM TEMSİLCİLER';
    
    // Eski sayfayı SİLME; varsa sadece içeriğini temizle (veri kaybını önle!)
    let sheet = managerFile.getSheetByName(sheetName);
    if (!sheet) {
      sheet = managerFile.insertSheet(sheetName);
    } else {
      // Sayfayı silmek yerine sadece içeriği temizle (veri korunur)
      try {
        const lr = sheet.getLastRow();
        const lc = sheet.getLastColumn();
        if (lr > 0 && lc > 0) {
          sheet.getRange(1, 1, lr, lc).clearContent();
          sheet.getRange(1, 1, lr, lc).clearFormat();
        }
      } catch (clearError) {
        console.warn('⚠️ Sayfa temizleme hatası (devam ediliyor):', clearError);
      }
    }
    
    // Tarih aralığını analiz et
    const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    let periodType = 'Günlük';
    if (daysDiff > 30) {
      periodType = 'Aylık';
    } else if (daysDiff > 7) {
      periodType = 'Haftalık';
    } else {
      periodType = 'Günlük';
    }
    
    let currentRow = 1;
    
    // ========================================
    // BAŞLIK BÖLÜMÜ
    // ========================================
    sheet.getRange(currentRow, 1).setValue('🌐 GENEL LOG ANALİZİ - TÜM TEMSİLCİLER');
    sheet.getRange(currentRow, 1, 1, 15).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(18).setBackground('#1976D2').setFontColor('#FFFFFF');
    currentRow++;
    
    const dateRangeText = `${Utilities.formatDate(startDate, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(endDate, 'Europe/Istanbul', 'dd.MM.yyyy')} (${daysDiff} gün)`;
    sheet.getRange(currentRow, 1).setValue(`📅 Tarih Aralığı: ${dateRangeText}`);
    sheet.getRange(currentRow, 1, 1, 15).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setBackground('#E3F2FD');
    currentRow++;
    
    sheet.getRange(currentRow, 1).setValue(`📊 Analiz Tipi: ${periodType} Analiz`);
    sheet.getRange(currentRow, 1, 1, 15).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(12).setBackground('#BBDEFB');
    currentRow += 2;
    
    // ========================================
    // EXECUTIVE SUMMARY - ÖZET SONUÇLAR (YUKARIYA TAŞINDI - Section 23.4)
    // ========================================
    const comparisonData = calculateComparisonData(allEmployeeLogs);
    if (comparisonData.length > 0) {
      sheet.getRange(currentRow, 1).setValue('📊 EXECUTIVE SUMMARY - TEMSİLCİ KARŞILAŞTIRMA RAPORU');
      sheet.getRange(currentRow, 1, 1, 20).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(16).setBackground('#FF9800').setFontColor('#FFFFFF');
      currentRow++;
      
      // Standart sıralama ile başlıklar
      const standardActivities = getStandardActivityOrder();
      const headers = ['Temsilci', 'Toplam Log', '15sn Altı', '5dk+ Pasif', ...standardActivities];
      
      for (let i = 0; i < headers.length; i++) {
        sheet.getRange(currentRow, i + 1).setValue(headers[i]);
      }
      sheet.getRange(currentRow, 1, 1, headers.length).setFontWeight('bold').setBackground('#FFE0B2');
      currentRow++;
      
      // Karşılaştırma verilerini yaz
      for (const data of comparisonData) {
        sheet.getRange(currentRow, 1).setValue(data.employeeCode);
        sheet.getRange(currentRow, 2).setValue(data.totalLogs);
        sheet.getRange(currentRow, 3).setValue(data.fastLogs);
        sheet.getRange(currentRow, 4).setValue(data.longPauses);
        
        // Tüm aktiviteleri standart sırayla yaz
        let col = 5;
        for (const activity of standardActivities) {
          const key = activity.toLowerCase()
            .replace(/\s+/g, '')
            .replace(/ı/g, 'i')
            .replace(/ş/g, 's')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c');
          sheet.getRange(currentRow, col).setValue(data[key] || 0);
          col++;
        }
        currentRow++;
      }
      currentRow += 2;
    }
    
    // ========================================
    // ALARM SİSTEMİ (30 SN VE 5 DK)
    // ========================================
    const alarms = detectAlarms(allEmployeeLogs);
    if (alarms.length > 0) {
      sheet.getRange(currentRow, 1).setValue('🚨 ZORUNLU ALARM SİSTEMİ');
      sheet.getRange(currentRow, 1, 1, 15).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#FF5252').setFontColor('#FFFFFF');
      currentRow++;
      
      // Alarm başlıkları
      sheet.getRange(currentRow, 1).setValue('Temsilci');
      sheet.getRange(currentRow, 2).setValue('Tarih');
      sheet.getRange(currentRow, 3).setValue('Saat');
      sheet.getRange(currentRow, 4).setValue('Alarm Tipi');
      sheet.getRange(currentRow, 5).setValue('Detay');
      sheet.getRange(currentRow, 1, 1, 5).setFontWeight('bold').setBackground('#FFCDD2');
      currentRow++;
      
      // ✅ DÜZELTME 21.6.2: Alarmları batch yaz (önce hafızada, sonra tek API call)
      const alarmRows = [];
      const alarmColors = [];
      const richTextData = [];
      
      for (const alarm of alarms) {
        // Veriyi hazırla
        alarmRows.push([
          alarm.employeeCode,
          alarm.date,
          alarm.time,
          alarm.type,
          alarm.detail // RichTextValue sonra uygulanacak
        ]);
        
        // Renk belirle (21.6.2: Önce hafızada hesapla)
        let rowColor = '#FFEBEE'; // Varsayılan kırmızı
        if (alarm.alarmType === '15sn') {
          rowColor = '#FFEB3B'; // Sarı
        } else if (alarm.alarmType === '5dk') {
          rowColor = '#E1BEE7'; // Açık mor
        }
        alarmColors.push(Array(5).fill(rowColor)); // 5 kolon için aynı renk
        
        // RichTextValue için veri hazırla
        let detailText = alarm.detail;
        let boldText = '';
        let boldStart = 0;
        
        if (alarm.alarmType === '15sn' && alarm.seconds) {
          boldText = `${alarm.seconds} saniye`;
          detailText = `${boldText} içinde arandı`;
          boldStart = 0;
        } else if (alarm.alarmType === '5dk' && alarm.minutes !== undefined) {
          boldText = `${alarm.minutes} dakika`;
          detailText = `>${boldText} arama yapılmadı`;
          boldStart = 1;
        }
        
        if (boldText && detailText.includes(boldText)) {
          richTextData.push({
            row: currentRow + alarmRows.length - 1,
            col: 5,
            text: detailText,
            boldText: boldText,
            boldStart: boldStart
          });
        }
      }
      
      // Batch yaz: Veri + Renk (21.6.2: Tek API call!)
      if (alarmRows.length > 0) {
        const startRow = currentRow;
        const numRows = alarmRows.length;
        const numCols = 5;
        
        // Veriyi yaz (batch)
        sheet.getRange(startRow, 1, numRows, numCols).setValues(alarmRows);
        
        // Renkleri yaz (batch - 1 API call!)
        sheet.getRange(startRow, 1, numRows, numCols).setBackgrounds(alarmColors);
        
        // RichTextValue'ları uygula (her biri ayrı ama az sayıda)
        for (const rtv of richTextData) {
          const richText = SpreadsheetApp.newRichTextValue()
            .setText(rtv.text)
            .setTextStyle(rtv.boldStart, rtv.boldStart + rtv.boldText.length, SpreadsheetApp.newTextStyle().setBold(true).build())
            .build();
          sheet.getRange(rtv.row, rtv.col).setRichTextValue(richText);
        }
        
        currentRow += numRows;
      }
      currentRow += 2;
    }
    
    // ========================================
    // PERİYODİK AKTİVİTE ANALİZİ (GÜNLÜK/HAFTALIK/AYLIK)
    // ========================================
    let activityAnalysisData;
    let analysisTitle;
    
    if (periodType === 'Günlük') {
      activityAnalysisData = calculateDailyActivityAnalysis(allEmployeeLogs);
      analysisTitle = '📈 GÜNLÜK AKTİVİTE ANALİZİ';
    } else if (periodType === 'Haftalık') {
      activityAnalysisData = calculateWeeklyActivityAnalysis(allEmployeeLogs, startDate, endDate);
      analysisTitle = '📈 HAFTALIK AKTİVİTE ANALİZİ';
    } else {
      activityAnalysisData = calculateMonthlyActivityAnalysis(allEmployeeLogs, startDate, endDate);
      analysisTitle = '📈 AYLIK AKTİVİTE ANALİZİ';
    }
    
    if (activityAnalysisData && activityAnalysisData.length > 0) {
      sheet.getRange(currentRow, 1).setValue(analysisTitle);
      sheet.getRange(currentRow, 1, 1, 10).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(16).setBackground('#4CAF50').setFontColor('#FFFFFF');
      currentRow += 2;
      
      // GÜNLÜK: Tek tek loglar gösterilir
      // HAFTALIK/AYLIK: Sadece kümülatif özet gösterilir (tek tek loglar değil)
      if (periodType === 'Günlük') {
        // Her gün için detaylı analiz
        for (const periodData of activityAnalysisData) {
          const periodHeader = `📅 ${periodData.period} (${periodData.totalLogs} log)`;
          
          sheet.getRange(currentRow, 1).setValue(periodHeader);
          sheet.getRange(currentRow, 1, 1, 10).merge();
          sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(13).setBackground('#81C784').setFontColor('#FFFFFF');
          currentRow++;
          
          // İlk ve son log saatleri
          sheet.getRange(currentRow, 1).setValue(`İlk Log Saati`);
          sheet.getRange(currentRow, 2).setValue(periodData.firstLogTime);
          sheet.getRange(currentRow, 1, 1, 2).setFontWeight('bold').setBackground('#C8E6C9');
          currentRow++;
          
          sheet.getRange(currentRow, 1).setValue(`Son Log Saati`);
          sheet.getRange(currentRow, 2).setValue(periodData.lastLogTime);
          sheet.getRange(currentRow, 1, 1, 2).setFontWeight('bold').setBackground('#C8E6C9');
          currentRow += 2;
          
          // Aktivite analizi başlığı
          sheet.getRange(currentRow, 1).setValue(`📊 GÜNLÜK AKTİVİTE ANALİZİ`);
          sheet.getRange(currentRow, 1, 1, 7).merge();
          sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(12).setBackground('#A5D6A7');
          currentRow++;
          
          // Tablo başlıkları
          const headers = ['Aktivite', 'Sayı', 'Toplam Süre', 'Ortalama Süre', 'Yüzdelik', 'Dağılım'];
          for (let i = 0; i < headers.length; i++) {
            sheet.getRange(currentRow, i + 1).setValue(headers[i]);
          }
          sheet.getRange(currentRow, 1, 1, headers.length)
            .setFontWeight('bold')
            .setFontSize(11)
            .setBackground('#66BB6A')
            .setFontColor('#FFFFFF')
            .setHorizontalAlignment('center')
            .setVerticalAlignment('middle');
          currentRow++;
          
          // ✅ DÜZELTME 21.6.2: Aktivite verilerini batch yaz (önce hafızada, sonra tek API call)
          const activityRows = [];
          const activityColors = [];
          
          for (let i = 0; i < periodData.activities.length; i++) {
            const activity = periodData.activities[i];
            
            // Veriyi hazırla
            activityRows.push([
              activity.type,
              activity.count,
              activity.totalDurationFormatted,
              activity.avgDurationFormatted,
              activity.percentageFormatted,
              activity.distributionFormatted
            ]);
            
            // Renk belirle (21.6.2: Önce hafızada hesapla)
            const rowColor = (i % 2 === 0) ? '#F1F8E9' : '#FFFFFF';
            activityColors.push(Array(headers.length).fill(rowColor));
          }
          
          // Batch yaz: Veri + Renk (21.6.2: Tek API call!)
          if (activityRows.length > 0) {
            const startRow = currentRow;
            const numRows = activityRows.length;
            const numCols = headers.length;
            
            // Veriyi yaz (batch)
            sheet.getRange(startRow, 1, numRows, numCols).setValues(activityRows);
            
            // Renkleri yaz (batch - 1 API call!)
            sheet.getRange(startRow, 1, numRows, numCols).setBackgrounds(activityColors);
            
            // Sayıları sağa hizala (batch - tek seferde)
            const rightAlignCols = [2, 3, 4, 5, 6]; // B, C, D, E, F kolonları
            for (const col of rightAlignCols) {
              if (col <= numCols) {
                sheet.getRange(startRow, col, numRows, 1).setHorizontalAlignment('right');
              }
            }
            
            currentRow += numRows;
          }
          
          currentRow += 3; // Periyotlar arası boşluk
        }
      } else {
        // HAFTALIK/AYLIK: Sadece kümülatif özet (tek tek loglar değil)
        // Trend analizi ile birlikte göster
        
        // Toplam özet tablosu
        sheet.getRange(currentRow, 1).setValue(`📊 ${periodType.toUpperCase()} KÜMÜLATİF ÖZET`);
        sheet.getRange(currentRow, 1, 1, 7).merge();
        sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#4CAF50').setFontColor('#FFFFFF');
        currentRow++;
        
        // Tüm periyotların toplamını hesapla
        const totalSummary = {
          totalLogs: 0,
          activities: new Map()
        };
        
        for (const periodData of activityAnalysisData) {
          totalSummary.totalLogs += periodData.totalLogs;
          for (const activity of periodData.activities) {
            if (!totalSummary.activities.has(activity.type)) {
              totalSummary.activities.set(activity.type, {
                type: activity.type,
                count: 0,
                totalDuration: 0,
                durations: []
              });
            }
            const summary = totalSummary.activities.get(activity.type);
            summary.count += activity.count;
            // Süre bilgisi varsa ekle
            if (activity.totalDurationFormatted) {
              summary.totalDuration += parseFloat(activity.totalDurationFormatted.replace(/[^\d.]/g, '')) || 0;
            }
          }
        }
        
        // Tablo başlıkları
        const headers = ['Aktivite', 'Toplam Sayı', 'Toplam Süre', 'Ortalama Süre', 'Yüzdelik'];
        for (let i = 0; i < headers.length; i++) {
          sheet.getRange(currentRow, i + 1).setValue(headers[i]);
        }
        sheet.getRange(currentRow, 1, 1, headers.length)
          .setFontWeight('bold')
          .setFontSize(11)
          .setBackground('#66BB6A')
          .setFontColor('#FFFFFF')
          .setHorizontalAlignment('center');
        currentRow++;
        
        // ✅ DÜZELTME 21.6.2: Kümülatif aktivite verilerini batch yaz
        const sortedActivities = Array.from(totalSummary.activities.values())
          .sort((a, b) => b.count - a.count);
        
        const summaryRows = [];
        const summaryColors = [];
        
        for (let i = 0; i < sortedActivities.length; i++) {
          const activity = sortedActivities[i];
          const percentage = totalSummary.totalLogs > 0 ? (activity.count / totalSummary.totalLogs * 100).toFixed(1) : '0.0';
          const avgDuration = activity.count > 0 ? (activity.totalDuration / activity.count).toFixed(1) + ' dk' : '-';
          const totalDurationFormatted = activity.totalDuration > 0 ? activity.totalDuration.toFixed(1) + ' dk' : '-';
          
          // Veriyi hazırla
          summaryRows.push([
            activity.type,
            activity.count,
            totalDurationFormatted,
            avgDuration,
            `%${percentage}`
          ]);
          
          // Renk belirle (21.6.2: Önce hafızada hesapla)
          const rowColor = (i % 2 === 0) ? '#F1F8E9' : '#FFFFFF';
          summaryColors.push(Array(headers.length).fill(rowColor));
        }
        
        // Batch yaz: Veri + Renk (21.6.2: Tek API call!)
        if (summaryRows.length > 0) {
          const startRow = currentRow;
          const numRows = summaryRows.length;
          const numCols = headers.length;
          
          // Veriyi yaz (batch)
          sheet.getRange(startRow, 1, numRows, numCols).setValues(summaryRows);
          
          // Renkleri yaz (batch - 1 API call!)
          sheet.getRange(startRow, 1, numRows, numCols).setBackgrounds(summaryColors);
          
          // Sayıları sağa hizala (batch - tek seferde)
          const rightAlignCols = [2, 3, 4, 5]; // B, C, D, E kolonları
          for (const col of rightAlignCols) {
            if (col <= numCols) {
              sheet.getRange(startRow, col, numRows, 1).setHorizontalAlignment('right');
            }
          }
          
          currentRow += numRows;
        }
        
        currentRow += 2;
        
        // TREND ANALİZİ: Periyotlar arası karşılaştırma
        if (activityAnalysisData.length > 1) {
          sheet.getRange(currentRow, 1).setValue(`📈 ${periodType.toUpperCase()} TREND ANALİZİ`);
          sheet.getRange(currentRow, 1, 1, 10).merge();
          sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#9C27B0').setFontColor('#FFFFFF');
          currentRow++;
          
          // Trend tablosu: Her periyot için toplam log sayısı
          sheet.getRange(currentRow, 1).setValue('Periyot');
          sheet.getRange(currentRow, 2).setValue('Toplam Log');
          sheet.getRange(currentRow, 3).setValue('Değişim');
          sheet.getRange(currentRow, 4).setValue('Trend');
          sheet.getRange(currentRow, 1, 1, 4).setFontWeight('bold').setBackground('#CE93D8');
          currentRow++;
          
          let previousTotal = null;
          for (let i = 0; i < activityAnalysisData.length; i++) {
            const periodData = activityAnalysisData[i];
            const currentTotal = periodData.totalLogs;
            
            sheet.getRange(currentRow, 1).setValue(periodData.period);
            sheet.getRange(currentRow, 2).setValue(currentTotal);
            
            if (previousTotal !== null) {
              const change = currentTotal - previousTotal;
              const changePercent = previousTotal > 0 ? ((change / previousTotal) * 100).toFixed(1) : '0.0';
              sheet.getRange(currentRow, 3).setValue(`${change > 0 ? '+' : ''}${change} (${changePercent > 0 ? '+' : ''}${changePercent}%)`);
              
              // Trend okunu göster
              if (change > 0) {
                sheet.getRange(currentRow, 4).setValue('↑ Artış');
                sheet.getRange(currentRow, 4).setFontColor('#4CAF50');
              } else if (change < 0) {
                sheet.getRange(currentRow, 4).setValue('↓ Azalış');
                sheet.getRange(currentRow, 4).setFontColor('#F44336');
              } else {
                sheet.getRange(currentRow, 4).setValue('→ Sabit');
                sheet.getRange(currentRow, 4).setFontColor('#FF9800');
              }
            } else {
              sheet.getRange(currentRow, 3).setValue('-');
              sheet.getRange(currentRow, 4).setValue('-');
            }
            
            // Sayıları sağa hizala
            sheet.getRange(currentRow, 2).setHorizontalAlignment('right');
            sheet.getRange(currentRow, 3).setHorizontalAlignment('right');
            
            previousTotal = currentTotal;
            currentRow++;
          }
          
          currentRow += 2;
        }
        
        // AYLIK İÇİN: Günlük trend grafiği (ay içindeki günlük dağılım)
        if (periodType === 'Aylık' && activityAnalysisData.length > 0) {
          // Ay içindeki günlük logları hesapla
          const dailyLogsInMonth = new Map(); // date -> totalLogs
          
          for (const [employeeCode, logs] of allEmployeeLogs) {
            for (const log of logs) {
              const logDate = parseDdMmYyyy(log.date) || new Date(log.date);
              if (!logDate || isNaN(logDate.getTime())) continue;
              
              // Ay içinde mi kontrol et
              if (logDate >= startDate && logDate <= endDate) {
                const dateKey = Utilities.formatDate(logDate, 'Europe/Istanbul', 'dd.MM.yyyy');
                if (!dailyLogsInMonth.has(dateKey)) {
                  dailyLogsInMonth.set(dateKey, 0);
                }
                dailyLogsInMonth.set(dateKey, dailyLogsInMonth.get(dateKey) + 1);
              }
            }
          }
          
          if (dailyLogsInMonth.size > 0) {
            sheet.getRange(currentRow, 1).setValue(`📈 AY İÇİNDE GÜNLÜK TREND`);
            sheet.getRange(currentRow, 1, 1, 5).merge();
            sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#2196F3').setFontColor('#FFFFFF');
            currentRow++;
            
            // Günlük trend tablosu
            sheet.getRange(currentRow, 1).setValue('Tarih');
            sheet.getRange(currentRow, 2).setValue('Toplam Log');
            sheet.getRange(currentRow, 3).setValue('Değişim');
            sheet.getRange(currentRow, 4).setValue('Trend');
            sheet.getRange(currentRow, 1, 1, 4).setFontWeight('bold').setBackground('#90CAF9');
            currentRow++;
            
            // Tarihe göre sırala
            const sortedDailyLogs = Array.from(dailyLogsInMonth.entries())
              .sort((a, b) => {
                const dateA = parseDdMmYyyy(a[0]) || new Date(a[0]);
                const dateB = parseDdMmYyyy(b[0]) || new Date(b[0]);
                return dateA.getTime() - dateB.getTime();
              });
            
            let previousDailyTotal = null;
            for (const [dateKey, totalLogs] of sortedDailyLogs) {
              sheet.getRange(currentRow, 1).setValue(dateKey);
              sheet.getRange(currentRow, 2).setValue(totalLogs);
              
              if (previousDailyTotal !== null) {
                const change = totalLogs - previousDailyTotal;
                const changePercent = previousDailyTotal > 0 ? ((change / previousDailyTotal) * 100).toFixed(1) : '0.0';
                sheet.getRange(currentRow, 3).setValue(`${change > 0 ? '+' : ''}${change} (${changePercent > 0 ? '+' : ''}${changePercent}%)`);
                
                // Trend okunu göster
                if (change > 0) {
                  sheet.getRange(currentRow, 4).setValue('↑ Artış');
                  sheet.getRange(currentRow, 4).setFontColor('#4CAF50');
                } else if (change < 0) {
                  sheet.getRange(currentRow, 4).setValue('↓ Azalış');
                  sheet.getRange(currentRow, 4).setFontColor('#F44336');
                } else {
                  sheet.getRange(currentRow, 4).setValue('→ Sabit');
                  sheet.getRange(currentRow, 4).setFontColor('#FF9800');
                }
              } else {
                sheet.getRange(currentRow, 3).setValue('-');
                sheet.getRange(currentRow, 4).setValue('-');
              }
              
              // Sayıları sağa hizala
              sheet.getRange(currentRow, 2).setHorizontalAlignment('right');
              sheet.getRange(currentRow, 3).setHorizontalAlignment('right');
              
              previousDailyTotal = totalLogs;
              currentRow++;
            }
            
            currentRow += 2;
          }
        }
      }
      currentRow += 1;
    }
    
    // NOT: Karşılaştırma raporu artık yukarıda (Executive Summary) gösteriliyor
    
    // Kolon genişliklerini ayarla - Daha okunur
    sheet.setColumnWidth(1, 180); // Aktivite
    sheet.setColumnWidth(2, 80);  // Sayı
    sheet.setColumnWidth(3, 120); // Toplam Süre
    sheet.setColumnWidth(4, 130); // Ortalama Süre
    sheet.setColumnWidth(5, 100); // Yüzdelik
    sheet.setColumnWidth(6, 100); // Dağılım
    sheet.setColumnWidth(7, 400); // Log Detayı (varsa)
    
    // Sayfayı aktif et
    sheet.activate();
    
    console.log('✅ Genel Log Analizi sayfası oluşturuldu (tüm özellikler dahil)');
  } catch (error) {
    console.error('❌ createGeneralLogAnalysisSheet hatası:', error);
    throw error;
  }
}

/**
 * 🚨 Alarm Tespiti (15 sn ve 5 dk)
 */
function detectAlarms(allEmployeeLogs) {
  const alarms = [];
  console.log('🚨 detectAlarms başlatıldı, toplam temsilci:', allEmployeeLogs.size);
  
  for (const [employeeCode, logs] of allEmployeeLogs) {
    console.log(`🔍 ${employeeCode}: ${logs.length} log kontrol ediliyor...`);
    
    // ÖNEMLİ: Sadece zaman bilgisi olan logları kullan (alarm hesaplaması için gerekli)
    const logsWithTime = logs.filter(log => {
      const time = extractTimeFromLog(log.log);
      return time !== null && time !== 0;
    });
    
    console.log(`📊 ${employeeCode}: ${logsWithTime.length} log zaman bilgisi içeriyor (toplam ${logs.length} log'dan)`);
    
    if (logsWithTime.length < 2) {
      console.log(`⚠️ ${employeeCode}: Alarm hesaplaması için yeterli log yok (en az 2 log gerekli)`);
      continue;
    }
    
    // Logları tarih ve saate göre sırala
    const sortedLogs = [...logsWithTime].sort((a, b) => {
      const dateA = parseDdMmYyyy(a.date) || (a.date instanceof Date ? a.date : new Date(String(a.date)));
      const dateB = parseDdMmYyyy(b.date) || (b.date instanceof Date ? b.date : new Date(String(b.date)));
      
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      
      const timeA = extractTimeFromLog(a.log);
      const timeB = extractTimeFromLog(b.log);
      return (timeA || 0) - (timeB || 0);
    });
    
    console.log(`📊 ${employeeCode}: ${sortedLogs.length} log sıralandı`);
    
    // 15 saniye alarm kontrolü
    let fastLogCount = 0;
    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const current = sortedLogs[i];
      const next = sortedLogs[i + 1];
      
      const timeDiff = calculateTimeDifferenceSeconds(current, next);
      
      // Debug: İlk 10 kontrolü detaylı logla
      if (i < 10) {
        console.log(`🔍 ${employeeCode} - Log ${i+1}: date1=${current.date}, log1="${current.log?.substring(0, 50)}", date2=${next.date}, log2="${next.log?.substring(0, 50)}", diff=${timeDiff}s`);
      }
      
      if (timeDiff > 0 && timeDiff < 15) {
        fastLogCount++;
        console.log(`🚨 ${employeeCode} - 15sn alarm bulundu: ${timeDiff}s (log1: "${current.log?.substring(0, 50)}", log2: "${next.log?.substring(0, 50)}")`);
        alarms.push({
          employeeCode: employeeCode,
          date: current.date,
          time: extractTimeString(current.log) || 'Bilinmiyor',
          type: '⚡ 15 Saniyeden Daha Hızlı Log', // Yıldırım simgesi
          alarmType: '15sn',
          seconds: timeDiff,
          detail: `${timeDiff} saniye içinde arandı`
        });
      }
    }
    
    // 5 dakika pasif zaman kontrolü
    let longPauseCount = 0;
    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const current = sortedLogs[i];
      const next = sortedLogs[i + 1];
      
      const timeDiff = calculateTimeDifferenceSeconds(current, next);
      
      // Debug: 5dk+ alarmları logla
      if (timeDiff >= 300) {
        const minutes = Math.floor(timeDiff / 60);
        console.log(`🚨 ${employeeCode} - 5dk+ alarm bulundu: ${minutes} dakika (${timeDiff}s) (log1: "${current.log?.substring(0, 50)}", log2: "${next.log?.substring(0, 50)}")`);
      }
      
      if (timeDiff >= 300) { // 5 dakika = 300 saniye
        longPauseCount++;
        const minutes = Math.floor(timeDiff / 60);
        const timeText = minutes > 0 ? `${minutes} dakika` : `${timeDiff} saniye`;
        alarms.push({
          employeeCode: employeeCode,
          date: current.date,
          time: extractTimeString(current.log) || 'Bilinmiyor',
          type: '⏸️ 5 Dakikadan Uzun Hiçbir Log Yok', // Duraklama simgesi
          alarmType: '5dk',
          minutes: minutes,
          seconds: timeDiff,
          detail: `>${timeText} arama yapılmadı`
        });
      }
    }
    
    console.log(`✅ ${employeeCode}: ${fastLogCount} hızlı log, ${longPauseCount} uzun pasif bulundu`);
  }
  
  console.log(`🚨 Toplam ${alarms.length} alarm tespit edildi`);
  return alarms;
}

/**
 * 📈 Günlük Aktivite Analizi Hesaplama
 * Her gün için ayrı analiz yapar
 */
function calculateDailyActivityAnalysis(allEmployeeLogs) {
  // Tüm logları tarihe göre grupla
  const logsByDate = new Map();
  
  for (const [employeeCode, logs] of allEmployeeLogs) {
    for (const log of logs) {
      const date = log.date;
      if (!logsByDate.has(date)) {
        logsByDate.set(date, []);
      }
      logsByDate.get(date).push({
        ...log,
        employeeCode: employeeCode
      });
    }
  }
  
  const results = [];
  
  // Her gün için analiz yap
  for (const [date, logs] of logsByDate) {
    // Logları saate göre sırala
    const sortedLogs = [...logs].sort((a, b) => {
      const timeA = extractTimeFromLog(a.log);
      const timeB = extractTimeFromLog(b.log);
      return timeA - timeB;
    });
    
    // İlk ve son log saatleri
    const firstLogTime = sortedLogs.length > 0 ? extractTimeString(sortedLogs[0].log) : '';
    const lastLogTime = sortedLogs.length > 0 ? extractTimeString(sortedLogs[sortedLogs.length - 1].log) : '';
    
    // Aktivite türüne göre grupla
    const activityMap = new Map();
    let totalLogs = logs.length;
    
    for (const log of logs) {
      const activity = log.aktivite;
      if (!activity) continue;
      
      if (!activityMap.has(activity)) {
        activityMap.set(activity, {
          count: 0,
          totalDuration: 0,
          durations: []
        });
      }
      
      const stats = activityMap.get(activity);
      stats.count++;
      
      // Log arası süre hesapla (bir sonraki log ile)
      const logIndex = sortedLogs.findIndex(l => l.log === log.log && l.date === log.date);
      if (logIndex >= 0 && logIndex < sortedLogs.length - 1) {
        const nextLog = sortedLogs[logIndex + 1];
        const timeDiff = calculateTimeDifferenceMinutes(log, nextLog);
        if (timeDiff > 0) {
          stats.totalDuration += timeDiff;
          stats.durations.push(timeDiff);
        }
      }
    }
    
    // Aktivite analizlerini hesapla (ortak fonksiyon kullan)
    const activityAnalysis = calculateActivityStatsForPeriod(sortedLogs);
    const activities = activityAnalysis.activities;
    
    // Standart sıralama kullan (zaten calculateActivityStatsForPeriod içinde sıralanmış)
    
    results.push({
      period: date,
      totalLogs: totalLogs,
      firstLogTime: firstLogTime,
      lastLogTime: lastLogTime,
      activities: activities
    });
  }
  
  // Tarihe göre sırala (en yeni en üstte)
  results.sort((a, b) => {
    const dateA = parseDdMmYyyy(a.period) || new Date(a.period);
    const dateB = parseDdMmYyyy(b.period) || new Date(b.period);
    return dateB.getTime() - dateA.getTime();
  });
  
  return results;
}

/**
 * 📈 Haftalık Aktivite Analizi Hesaplama
 * Her hafta için ayrı analiz yapar
 */
function calculateWeeklyActivityAnalysis(allEmployeeLogs, startDate, endDate) {
  // Tüm logları haftaya göre grupla (Pazartesi-Pazar)
  const logsByWeek = new Map();
  
  for (const [employeeCode, logs] of allEmployeeLogs) {
    for (const log of logs) {
      const logDate = parseDdMmYyyy(log.date) || new Date(log.date);
      if (!logDate || isNaN(logDate.getTime())) continue;
      
      // Log'un hangi haftaya ait olduğunu bul (Pazartesi başlangıç)
      const weekStart = getWeekStart(logDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Pazar
      weekEnd.setHours(23, 59, 59, 999);
      
      // Hafta numarasını hesapla
      const weekNumber = getWeekNumberForReport(weekStart);
      const weekKey = `Hafta ${weekNumber} (${getWeekDateRange(logDate)})`;
      
      if (!logsByWeek.has(weekKey)) {
        logsByWeek.set(weekKey, {
          weekStart: weekStart,
          weekEnd: weekEnd,
          logs: []
        });
      }
      logsByWeek.get(weekKey).logs.push({
        ...log,
        employeeCode: employeeCode,
        dateObj: logDate
      });
    }
  }
  
  const results = [];
  
  // Her hafta için analiz yap
  for (const [weekKey, weekData] of logsByWeek) {
    const logs = weekData.logs;
    
    // Logları tarih ve saate göre sırala
    const sortedLogs = [...logs].sort((a, b) => {
      if (a.dateObj.getTime() !== b.dateObj.getTime()) {
        return a.dateObj.getTime() - b.dateObj.getTime();
      }
      const timeA = extractTimeFromLog(a.log);
      const timeB = extractTimeFromLog(b.log);
      return timeA - timeB;
    });
    
    // İlk ve son log saatleri
    const firstLogTime = sortedLogs.length > 0 ? extractTimeString(sortedLogs[0].log) : '';
    const lastLogTime = sortedLogs.length > 0 ? extractTimeString(sortedLogs[sortedLogs.length - 1].log) : '';
    
    // Aktivite analizi (günlük ile aynı mantık)
    const activityAnalysis = calculateActivityStatsForPeriod(sortedLogs);
    
    results.push({
      period: weekKey,
      totalLogs: logs.length,
      firstLogTime: firstLogTime,
      lastLogTime: lastLogTime,
      activities: activityAnalysis.activities,
      weekStart: weekData.weekStart,
      weekEnd: weekData.weekEnd
    });
  }
  
  // Hafta numarasına göre sırala (en yeni en üstte)
  results.sort((a, b) => {
    const weekNumA = parseInt(a.period.match(/Hafta (\d+)/)?.[1] || '0');
    const weekNumB = parseInt(b.period.match(/Hafta (\d+)/)?.[1] || '0');
    return weekNumB - weekNumA;
  });
  
  return results;
}

/**
 * 📈 Aylık Aktivite Analizi Hesaplama
 * Her ay için ayrı analiz yapar
 */
function calculateMonthlyActivityAnalysis(allEmployeeLogs, startDate, endDate) {
  // Tüm logları aya göre grupla
  const logsByMonth = new Map();
  
  for (const [employeeCode, logs] of allEmployeeLogs) {
    for (const log of logs) {
      const logDate = parseDdMmYyyy(log.date) || new Date(log.date);
      if (!logDate || isNaN(logDate.getTime())) continue;
      
      const monthKey = Utilities.formatDate(logDate, 'Europe/Istanbul', 'MMMM yyyy');
      
      if (!logsByMonth.has(monthKey)) {
        logsByMonth.set(monthKey, []);
      }
      logsByMonth.get(monthKey).push({
        ...log,
        employeeCode: employeeCode,
        dateObj: logDate
      });
    }
  }
  
  const results = [];
  
  // Her ay için analiz yap
  for (const [monthKey, logs] of logsByMonth) {
    // Logları tarih ve saate göre sırala
    const sortedLogs = [...logs].sort((a, b) => {
      if (a.dateObj.getTime() !== b.dateObj.getTime()) {
        return a.dateObj.getTime() - b.dateObj.getTime();
      }
      const timeA = extractTimeFromLog(a.log);
      const timeB = extractTimeFromLog(b.log);
      return timeA - timeB;
    });
    
    // İlk ve son log saatleri
    const firstLogTime = sortedLogs.length > 0 ? extractTimeString(sortedLogs[0].log) : '';
    const lastLogTime = sortedLogs.length > 0 ? extractTimeString(sortedLogs[sortedLogs.length - 1].log) : '';
    
    // Aktivite analizi
    const activityAnalysis = calculateActivityStatsForPeriod(sortedLogs);
    
    results.push({
      period: monthKey,
      totalLogs: logs.length,
      firstLogTime: firstLogTime,
      lastLogTime: lastLogTime,
      activities: activityAnalysis.activities
    });
  }
  
  // Aya göre sırala (en yeni en üstte)
  results.sort((a, b) => {
    const dateA = new Date(a.period);
    const dateB = new Date(b.period);
    return dateB.getTime() - dateA.getTime();
  });
  
  return results;
}

/**
 * 📊 Periyot için aktivite istatistikleri hesaplama (ortak fonksiyon)
 * ÖNEMLİ: Süre hesaplama sadece aynı temsilciye ait loglar arasında yapılır
 */
function calculateActivityStatsForPeriod(sortedLogs) {
  const activityMap = new Map();
  let totalLogs = sortedLogs.length;
  
  // Logları temsilciye göre grupla (süre hesaplama için)
  const logsByEmployee = new Map();
  for (const log of sortedLogs) {
    const employeeCode = log.employeeCode || 'UNKNOWN';
    if (!logsByEmployee.has(employeeCode)) {
      logsByEmployee.set(employeeCode, []);
    }
    logsByEmployee.get(employeeCode).push(log);
  }
  
  // Her temsilci için loglarını sırala ve süre hesapla
  for (const [employeeCode, employeeLogs] of logsByEmployee) {
    const sortedEmployeeLogs = [...employeeLogs].sort((a, b) => {
      const dateA = parseDdMmYyyy(a.date) || new Date(a.date);
      const dateB = parseDdMmYyyy(b.date) || new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      const timeA = extractTimeFromLog(a.log);
      const timeB = extractTimeFromLog(b.log);
      return timeA - timeB;
    });
    
    // Aynı temsilciye ait loglar arasında süre hesapla
    for (let i = 0; i < sortedEmployeeLogs.length; i++) {
      const log = sortedEmployeeLogs[i];
      const activity = log.aktivite;
      if (!activity) continue;
      
      if (!activityMap.has(activity)) {
        activityMap.set(activity, {
          count: 0,
          totalDuration: 0,
          durations: []
        });
      }
      
      const stats = activityMap.get(activity);
      stats.count++;
      
      // Sadece aynı temsilciye ait bir sonraki log ile süre hesapla
      if (i < sortedEmployeeLogs.length - 1) {
        const nextLog = sortedEmployeeLogs[i + 1];
        const timeDiff = calculateTimeDifferenceMinutes(log, nextLog);
        if (timeDiff > 0) {
          stats.totalDuration += timeDiff;
          stats.durations.push(timeDiff);
        }
      }
    }
  }
  
  // Aktivite analizlerini hesapla
  const activities = [];
  for (const [activity, stats] of activityMap) {
    const percentage = totalLogs > 0 ? (stats.count / totalLogs) * 100 : 0;
    const avgDuration = stats.count > 0 ? stats.totalDuration / stats.count : 0;
    
    // Toplam süre formatı
    const totalHours = Math.floor(stats.totalDuration / 60);
    const totalMinutes = Math.round(stats.totalDuration % 60);
    const totalDurationFormatted = totalHours > 0 
      ? `${totalHours}s ${totalMinutes}dk` 
      : `${totalMinutes}dk`;
    
    // Ortalama süre formatı
    const avgDurationFormatted = `${avgDuration.toFixed(1)} dk`;
    
    // Yüzdelik formatı
    const percentageFormatted = `%${percentage.toFixed(1)}`;
    
    // Dağılım formatı
    const distributionFormatted = `%${percentage.toFixed(1)}`;
    
    activities.push({
      type: activity,
      count: stats.count,
      totalDuration: stats.totalDuration,
      totalDurationFormatted: totalDurationFormatted,
      avgDuration: avgDuration,
      avgDurationFormatted: avgDurationFormatted,
      percentage: percentage,
      percentageFormatted: percentageFormatted,
      distributionFormatted: distributionFormatted
    });
  }
  
  // Standart sıralama kullan
  const sortedActivities = sortActivitiesByStandardOrder(activities);
  
  return { activities: sortedActivities };
}

/**
 * 📅 Hafta numarası hesaplama (ISO 8601)
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * 📅 Hafta tarih aralığı hesaplama (Pazartesi-Pazar)
 * @param {Date} date - Herhangi bir tarih
 * @returns {string} - "dd.MM - dd.MM.yyyy" formatında hafta aralığı
 */
function getWeekDateRange(date) {
  // Pazartesi'yi bul
  const monday = getWeekStart(date);
  // Pazar = Pazartesi + 6 gün
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  
  return `${Utilities.formatDate(monday, 'Europe/Istanbul', 'dd.MM')} - ${Utilities.formatDate(sunday, 'Europe/Istanbul', 'dd.MM.yyyy')}`;
}

/**
 * ⏰ İki log arası süre hesaplama (dakika cinsinden)
 */
function calculateTimeDifferenceMinutes(log1, log2) {
  try {
    const time1 = extractTimeFromLog(log1.log);
    const time2 = extractTimeFromLog(log2.log);
    const date1 = parseDdMmYyyy(log1.date) || new Date(log1.date);
    const date2 = parseDdMmYyyy(log2.date) || new Date(log2.date);
    
    if (!time1 || !time2) return 0;
    
    const dateTime1 = new Date(date1);
    dateTime1.setHours(Math.floor(time1 / 60), time1 % 60, 0, 0);
    
    const dateTime2 = new Date(date2);
    dateTime2.setHours(Math.floor(time2 / 60), time2 % 60, 0, 0);
    
    const diffMs = dateTime2.getTime() - dateTime1.getTime();
    return Math.round(diffMs / (1000 * 60)); // Dakika cinsinden
  } catch (error) {
    return 0;
  }
}

/**
 * 📊 Standart Aktivite Sıralama Fonksiyonu
 * Her yerde aynı sıralama: Negatifler → Fırsatlar → Randevu/Toplantı/Satış
 */
function getStandardActivityOrder() {
  return [
    // Negatifler
    'İlgilenmiyor',
    'Ulaşılamadı',
    'Geçersiz Numara',
    'Kurumsal',
    // Fırsatlar
    'Yeniden Aranacak',
    'Bilgi Verildi',
    'Fırsat İletildi',
    // Randevu/Toplantı/Satış
    'Randevu Alındı',
    'İleri Tarih Randevu',
    'Toplantı Tamamlandı',
    'Satış Yapıldı'
  ];
}

/**
 * 📊 Aktivite sıralama fonksiyonu (standart sıralama)
 */
function sortActivitiesByStandardOrder(activities) {
  const order = getStandardActivityOrder();
  const orderMap = new Map();
  order.forEach((activity, index) => {
    orderMap.set(activity, index);
  });
  
  return activities.sort((a, b) => {
    const activityA = typeof a === 'string' ? a : a.type || a.aktivite || a.name || '';
    const activityB = typeof b === 'string' ? b : b.type || b.aktivite || b.name || '';
    
    const orderA = orderMap.has(activityA) ? orderMap.get(activityA) : 999;
    const orderB = orderMap.has(activityB) ? orderMap.get(activityB) : 999;
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // Aynı sıradaysa alfabetik
    return activityA.localeCompare(activityB, 'tr');
  });
}

/**
 * 📊 Karşılaştırma Verisi Hesaplama
 * Tüm durumları içerir ve standart sıralama kullanır
 */
function calculateComparisonData(allEmployeeLogs) {
  const results = [];
  const standardActivities = getStandardActivityOrder();
  
  for (const [employeeCode, logs] of allEmployeeLogs) {
    let totalLogs = logs.length;
    let fastLogs = 0;
    let longPauses = 0;
    
    // Tüm aktiviteler için sayaç
    const activityCounts = new Map();
    standardActivities.forEach(activity => {
      activityCounts.set(activity, 0);
    });
    
    // Aktivite sayıları için tüm logları kullan
    for (const log of logs) {
      const activity = log.aktivite;
      if (activity && activityCounts.has(activity)) {
        activityCounts.set(activity, activityCounts.get(activity) + 1);
      }
    }
    
    // Alarm hesaplaması için sadece zaman bilgisi olan logları kullan
    const logsWithTime = logs.filter(log => {
      const time = extractTimeFromLog(log.log);
      return time !== null && time !== 0;
    });
    
    // Zaman bilgisi olan logları sırala
    const sortedLogsWithTime = [...logsWithTime].sort((a, b) => {
      const dateA = parseDdMmYyyy(a.date) || (a.date instanceof Date ? a.date : new Date(String(a.date)));
      const dateB = parseDdMmYyyy(b.date) || (b.date instanceof Date ? b.date : new Date(String(b.date)));
      
      if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
        return 0;
      }
      
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      const timeA = extractTimeFromLog(a.log);
      const timeB = extractTimeFromLog(b.log);
      return (timeA || 0) - (timeB || 0);
    });
    
    // Alarm istatistiklerini hesapla (sadece zaman bilgisi olan loglar için)
    for (let i = 0; i < sortedLogsWithTime.length - 1; i++) {
      const current = sortedLogsWithTime[i];
      const next = sortedLogsWithTime[i + 1];
      
      const timeDiff = calculateTimeDifferenceSeconds(current, next);
      
      // 15 sn altı log
      if (timeDiff > 0 && timeDiff < 15) {
        fastLogs++;
      }
      
      // 5 dk+ pasif
      if (timeDiff >= 300) {
        longPauses++;
      }
    }
    
    // Sonuç objesi oluştur
    const result = {
      employeeCode: employeeCode,
      totalLogs: totalLogs,
      fastLogs: fastLogs,
      longPauses: longPauses
    };
    
    // Tüm aktiviteleri ekle
    standardActivities.forEach(activity => {
      const key = activity.toLowerCase()
        .replace(/\s+/g, '')
        .replace(/ı/g, 'i')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
      result[key] = activityCounts.get(activity) || 0;
    });
    
    results.push(result);
  }
  
  // Randevu Alındı sayısına göre sırala (en çoktan en aza)
  results.sort((a, b) => {
    const randevuA = a.randevualindi || 0;
    const randevuB = b.randevualindi || 0;
    return randevuB - randevuA;
  });
  
  return results;
}

/**
 * ⏰ İki log arası süre hesaplama (saniye cinsinden)
 * Geliştirilmiş: Log string'inden direkt tam tarih+saat+saniye çıkarır
 */
function calculateTimeDifferenceSeconds(log1, log2) {
  try {
    // Log string'inden direkt tam tarih+saat+saniye çıkar
    let dateTime1 = extractFullDateTimeFromLog(log1);
    let dateTime2 = extractFullDateTimeFromLog(log2);
    
    // Eğer log string'inden bulunamadıysa, date ve time field'larından dene
    if (!dateTime1) {
      dateTime1 = buildDateTimeFromFields(log1);
    }
    if (!dateTime2) {
      dateTime2 = buildDateTimeFromFields(log2);
    }
    
    // Validasyon
    if (!dateTime1 || !dateTime2 || isNaN(dateTime1.getTime()) || isNaN(dateTime2.getTime())) {
      return 0;
    }
    
    const diffMs = dateTime2.getTime() - dateTime1.getTime();
    const diffSeconds = Math.round(diffMs / 1000);
    
    // Negatif fark kontrolü (loglar yanlış sıralanmış olabilir)
    if (diffSeconds < 0) {
      // Negatif fark - loglar yanlış sıralanmış, ama mutlak değer al
      return Math.abs(diffSeconds);
    }
    
    return diffSeconds;
  } catch (error) {
    console.error('❌ calculateTimeDifferenceSeconds hatası:', error, 'log1:', log1, 'log2:', log2);
    return 0;
  }
}

/**
 * ⏰ Log string'inden tam tarih+saat+saniye çıkarma
 * Format: "Aktivite - dd.MM.yyyy HH:mm:ss" veya "dd.MM.yyyy HH:mm:ss"
 */
function extractFullDateTimeFromLog(logObj) {
  try {
    const logStr = String(logObj.log || '');
    if (!logStr) return null;
    
    // Format 1: "Aktivite - dd.MM.yyyy HH:mm:ss" (örn: "İlgilenmiyor - 28.11.2025 11:14:18")
    const match1 = logStr.match(/(\d{2})\.(\d{2})\.(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);
    if (match1) {
      const day = parseInt(match1[1]);
      const month = parseInt(match1[2]) - 1; // JavaScript'te ay 0-11 arası
      const year = parseInt(match1[3]);
      const hours = parseInt(match1[4]);
      const minutes = parseInt(match1[5]);
      const seconds = parseInt(match1[6]);
      
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60) {
        const date = new Date(year, month, day, hours, minutes, seconds);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // Format 2: Sadece "HH:mm:ss" ve date field'ından tarih al
    const match2 = logStr.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (match2 && logObj.date) {
      const hours = parseInt(match2[1]);
      const minutes = parseInt(match2[2]);
      const seconds = parseInt(match2[3]);
      
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60 && seconds >= 0 && seconds < 60) {
        let date = parseDdMmYyyy(logObj.date);
        if (!date || isNaN(date.getTime())) {
          if (logObj.date instanceof Date) {
            date = new Date(logObj.date);
          } else {
            date = new Date(String(logObj.date));
          }
        }
        
        if (date && !isNaN(date.getTime())) {
          date.setHours(hours, minutes, seconds);
          return date;
        }
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * ⏰ Date ve time field'larından DateTime oluşturma
 */
function buildDateTimeFromFields(logObj) {
  try {
    let date = null;
    
    // Tarih parse et
    if (logObj.date) {
      date = parseDdMmYyyy(logObj.date);
      if (!date || isNaN(date.getTime())) {
        if (logObj.date instanceof Date) {
          date = new Date(logObj.date);
        } else {
          date = new Date(String(logObj.date));
        }
      }
    }
    
    if (!date || isNaN(date.getTime())) {
      return null;
    }
    
    // Zaman parse et
    let time = null;
    if (logObj.log) {
      time = extractTimeFromLog(logObj.log);
    }
    if (!time && logObj.time) {
      time = extractTimeFromLog(logObj.time);
    }
    
    if (!time || time === 0) {
      return null;
    }
    
    // Tarih ve zamanı birleştir (saniyeler 0 olarak ayarlanır)
    const dateTime = new Date(date);
    dateTime.setHours(Math.floor(time / 60), time % 60, 0, 0);
    
    return dateTime;
  } catch (error) {
    return null;
  }
}

/**
 * ⏰ Log'dan zaman çıkarma (dakika cinsinden)
 * Geliştirilmiş: Farklı zaman formatlarını destekler
 */
function extractTimeFromLog(logStr) {
  if (!logStr) return null;
  
  try {
    const str = String(logStr);
    
    // Format 1: HH:mm:ss (örn: 14:30:45)
    const match1 = str.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (match1) {
      const hours = parseInt(match1[1]);
      const minutes = parseInt(match1[2]);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return hours * 60 + minutes;
      }
    }
    
    // Format 2: HH:mm (örn: 14:30)
    const match2 = str.match(/(\d{1,2}):(\d{2})(?!\d)/);
    if (match2) {
      const hours = parseInt(match2[1]);
      const minutes = parseInt(match2[2]);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return hours * 60 + minutes;
      }
    }
    
    // Format 3: Log içinde tarih ve saat birlikte (örn: "Randevu alındı - 30.11.2025 14:30:45")
    const match3 = str.match(/(\d{2}\.\d{2}\.\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/);
    if (match3) {
      const hours = parseInt(match3[2]);
      const minutes = parseInt(match3[3]);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return hours * 60 + minutes;
      }
    }
    
    // Format 4: Log içinde sadece saat (örn: "14:30:45 - Randevu alındı")
    const match4 = str.match(/^(\d{1,2}):(\d{2}):(\d{2})/);
    if (match4) {
      const hours = parseInt(match4[1]);
      const minutes = parseInt(match4[2]);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return hours * 60 + minutes;
      }
    }
    
  } catch (error) {
    // Sessizce null döndür
    return null;
  }
  
  return null;
}

/**
 * ⏰ Log'dan zaman string'i çıkarma
 */
function extractTimeString(logStr) {
  try {
    // ✅ DÜZELTME: Saat formatı - Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
    const match = String(logStr).match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return `${hours}:${String(minutes).padStart(2, '0')}`;
      }
    }
    const match2 = String(logStr).match(/(\d{1,2}):(\d{2})/);
    if (match2) {
      const hours = parseInt(match2[1], 10);
      const minutes = parseInt(match2[2], 10);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return `${hours}:${String(minutes).padStart(2, '0')}`;
      }
    }
  } catch (error) {
    return '';
  }
  return '';
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
    
    // ⏱️ Son 30 gün filtresi
    const today = new Date();
    const cutoffDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    cutoffDate.setDate(cutoffDate.getDate() - 30);
    console.log(`⏱️ Son 30 gün filtresi aktif. Eşik: ${Utilities.formatDate(cutoffDate, 'Europe/Istanbul', 'dd.MM.yyyy')} ve sonrası`);
    
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
      
      // Format Tablo header'larını kontrol et: Aktivite + Aktivite Tarihi (Log kolonu opsiyonel - varsa kullanılır)
      const hasAktivite = headers.some(h => h && h.toString().toLowerCase().includes('aktivite'));
      const hasTarihi = headers.some(h => h && h.toString().toLowerCase().includes('aktivite tarihi') || h && h.toString().toLowerCase().includes('tarih'));
      const hasLog = headers.some(h => h && h.toString().toLowerCase().includes('log'));
      
      // Format Tablo kontrolü: Aktivite + Aktivite Tarihi olmalı (Log kolonu opsiyonel)
      const aktiviteIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('aktivite'));
      const tarihIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('aktivite tarihi') || h && h.toString().toLowerCase().includes('tarih'));
      const logIndex = headers.findIndex(h => h && h.toString().toLowerCase().includes('log'));
      
      console.log(`🔍 "${sheet.getName()}" kontrol: Aktivite=${hasAktivite}(${aktiviteIndex}), Tarih=${hasTarihi}(${tarihIndex}), Log=${hasLog}(${logIndex})`);
      
      // Format Tablo kontrolü: Aktivite + Aktivite Tarihi olmalı (Log kolonu opsiyonel - varsa kullanılır)
      if (hasAktivite && hasTarihi && aktiviteIndex !== -1 && tarihIndex !== -1) {
        // Header'lar uygunsa sayfayı al - veri kontrolü yapma (çok yavaş)
        formatTableSheets.push({
          sheet: sheet,
          aktiviteIndex: aktiviteIndex,
          tarihIndex: tarihIndex,
          logIndex: logIndex !== -1 ? logIndex : null // Log kolonu varsa index, yoksa null
        });
        console.log(`✅ Format Tablo sayfası bulundu: "${sheet.getName()}" (Log kolonu: ${logIndex !== -1 ? 'VAR' : 'YOK'})`);
      }
    }
    
    if (formatTableSheets.length === 0) {
      const sheetNames = sheets.map(sheet => sheet.getName());
      throw new Error(`Format Tablo sayfası bulunamadı. Mevcut sayfalar: ${sheetNames.join(', ')}`);
    }
    
    console.log(`📊 ${formatTableSheets.length} adet Format Tablo sayfası bulundu`);
    
    // ✅ DÜZELTME: Cache kontrolünü KALDIR - Tarih filtresi sonradan uygulanacak!
    // ❌ SORUN: Cache kontrolü tarih filtresinden ÖNCE yapılıyordu
    // ✅ ÇÖZÜM: Tüm satırları oku, sonra tarih filtresini uygula (21.6 kuralları: Cache kaldır, basit tut!)
    let allData = [];
    for (const formatSheet of formatTableSheets) {
      const sheet = formatSheet.sheet;
      const sheetName = sheet.getName();
      const lastRow = sheet.getLastRow();
      
      // Tüm satırları oku (cache kontrolü YOK - tarih filtresi sonradan uygulanacak)
      if (lastRow > 1) {
        const dataRowCount = lastRow - 1; // Header hariç
        console.log(`📊 "${sheetName}" sayfasından ${dataRowCount} satır okunuyor (${lastRow} toplam, header hariç)`);
        
        // BATCH OPERATIONS: Tüm satırları tek seferde oku (Google best practice)
        const data = sheet.getRange(2, 1, dataRowCount, sheet.getLastColumn()).getDisplayValues();
        console.log(`📊 "${sheetName}" sayfasından ${data.length} satır veri alındı`);
        
        // DEBUG: İlk 5 satırın tarih kolonunu göster
        if (data.length > 0) {
          const tarihIndex = formatSheet.tarihIndex;
          console.log(`🔍 DEBUG "${sheetName}": İlk 5 satırın Tarih kolonu (index ${tarihIndex}):`);
          for (let i = 0; i < Math.min(5, data.length); i++) {
            const tarihValue = data[i][tarihIndex];
            console.log(`  Satır ${i + 2}: "${tarihValue}" (tip: ${typeof tarihValue})`);
          }
        }
        
        allData.push(...data.map(row => ({
          ...row,
          _sheetName: sheetName,
          _aktiviteIndex: formatSheet.aktiviteIndex,
          _tarihIndex: formatSheet.tarihIndex,
          _logIndex: formatSheet.logIndex // Log kolonu varsa index, yoksa null
        })));
      } else {
        console.log(`⏭️ "${sheetName}" sayfası boş (sadece header var)`);
      }
    }
    
    console.log(`📊 Toplam ${allData.length} satır veri toplandı`);
    
    // Veri işleme için kolon indekslerini kullan (ilk sayfadan)
    const firstSheet = formatTableSheets[0];
    const aktiviteTarihiIdx = firstSheet.tarihIndex;
    const aktiviteIdx = firstSheet.aktiviteIndex;
    const logIdx = firstSheet.logIndex;
    
    console.log(`🔍 Kolon indeksleri (ilk sayfadan): Tarih=${aktiviteTarihiIdx}, Aktivite=${aktiviteIdx}, Log=${logIdx !== null ? logIdx : 'YOK (standart format kullanılacak)'}`);
    
    // Tarih bazlı gruplama
    const logsByDate = new Map();
    let skippedOlderThanCutoff = 0;
    
    // DUPLICATE KONTROLÜ: Aynı log birden fazla kez sayılmamalı
    // Key: "aktivite|log|tarih" formatında unique identifier
    const seenLogs = new Set();
    
    console.log(`📊 Toplam ${allData.length} satır okunacak (Son 30 gün filtresi ile)`);
    
    // GEÇİCİ: Mevcut log özeti sayfasından eski verileri alma işlemini devre dışı bırak
    // TODO: Bu işlem daha sonra aktif edilecek
    const existingLogsByDate = new Map();
    console.log(`🔄 Mevcut log özeti sayfasından eski veriler alınmayacak (tüm log'lar yeniden işlenecek)`);
    
    // Yeni verileri işle
    let newLogsCount = 0;
    let hamVeriSkippedCount = 0;
    let invalidLogsCount = 0;
    let duplicateLogsCount = 0;
    console.log(`🚀 LOG İŞLEME BAŞLIYOR: ${allData.length} satır işlenecek`);
    
    for (let i = 0; i < allData.length; i++) {
      const row = allData[i];
      
      // Her satırın kendi indekslerini kullan
      const aktiviteTarihi = row[row._tarihIndex];
      const aktivite = row[row._aktiviteIndex];
      
      // Log değerini al: Önce Log kolonunu kontrol et (varsa kullan, yoksa standart format oluştur)
      let logValue = '';
      if (row._logIndex !== null && row._logIndex !== undefined) {
        logValue = String(row[row._logIndex] || '').trim();
      }
      
      // Eğer Log kolonu yoksa veya boşsa, standart format oluştur (Log Arşivi ile aynı - DETAYLI)
      if (!logValue || logValue === '') {
        // İsim Soyisim kolonunu bul (standart format oluşturmak için)
        const sheet = formatTableSheets.find(ft => ft.sheet.getName() === row._sheetName)?.sheet;
        let isimSoyisim = '';
        if (sheet) {
          const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          const isimSoyisimIndex = headers.indexOf('İsim Soyisim');
          if (isimSoyisimIndex !== -1) {
            isimSoyisim = String(row[isimSoyisimIndex] || '').trim();
          }
        }
        
        // Aktivite Tarihi'nden saat bilgisini çıkar (eğer varsa)
        let aktiviteTarihiWithTime = String(aktiviteTarihi || '').trim();
        // Format: "08.12.2025 15:51:51" veya "08.12.2025" veya Date object
        let extractedTime = '';
        try {
          // Önce string olarak kontrol et
          const tarihStr = String(aktiviteTarihi || '');
          // "08.12.2025 15:51:51" formatı
          const timeMatch = tarihStr.match(/(\d{1,2}):(\d{2}):(\d{2})/);
          if (timeMatch) {
            extractedTime = `${timeMatch[1]}:${timeMatch[2]}:${timeMatch[3]}`;
          } else {
            // Date object ise, saat bilgisini çıkar
            if (aktiviteTarihi instanceof Date) {
              const h = aktiviteTarihi.getHours();
              const m = aktiviteTarihi.getMinutes();
              const s = aktiviteTarihi.getSeconds();
              if (h !== undefined && m !== undefined) {
                // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05:23, 13:09:45)
                extractedTime = `${h}:${String(m).padStart(2, '0')}:${String(s || 0).padStart(2, '0')}`;
              }
            }
          }
        } catch (e) {
          // Hata durumunda devam et
        }
        
        // ✅ DÜZELTME 4: Log formatı - ESKİ FORMATA DÖN (21.6 kuralları: Mevcut formatı değiştirme!)
        // DOĞRU FORMAT: "Aktivite - DD.MM.YYYY HH:MM:SS"
        // ÖRNEK: "Randevu Alındı - 09.12.2024 13:05:42"
        // İsim Soyisim YOK! ISO 8601 (2025-12-10) KULLANMA! DD.MM.YYYY kullan!
        
        // Tarih formatını düzelt (DD.MM.YYYY)
        let tarihStr = '';
        if (aktiviteTarihi instanceof Date) {
          // Date object ise DD.MM.YYYY formatına çevir
          const day = aktiviteTarihi.getDate();
          const month = aktiviteTarihi.getMonth() + 1;
          const year = aktiviteTarihi.getFullYear();
          tarihStr = `${day}.${String(month).padStart(2, '0')}.${year}`;
        } else {
          // String ise, zaten DD.MM.YYYY formatında olmalı
          const tarihMatch = String(aktiviteTarihi || '').match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
          if (tarihMatch) {
            tarihStr = `${tarihMatch[1]}.${tarihMatch[2].padStart(2, '0')}.${tarihMatch[3]}`;
          } else {
            // ISO 8601 formatı (2025-12-10) ise DD.MM.YYYY'ye çevir
            const isoMatch = String(aktiviteTarihi || '').match(/(\d{4})-(\d{2})-(\d{2})/);
            if (isoMatch) {
              tarihStr = `${parseInt(isoMatch[3], 10)}.${isoMatch[2]}.${isoMatch[1]}`;
            } else {
              tarihStr = String(aktiviteTarihi || '');
            }
          }
        }
        
        // Saat formatını düzelt (HH:MM:SS)
        let saatStr = '';
        if (extractedTime) {
          // extractedTime zaten "H:MM:SS" formatında (21.6.1 kuralına uygun)
          saatStr = extractedTime;
        } else {
          // Saat yoksa, aktiviteTarihi'nden çıkar
          if (aktiviteTarihi instanceof Date) {
            const h = aktiviteTarihi.getHours();
            const m = aktiviteTarihi.getMinutes();
            const s = aktiviteTarihi.getSeconds();
            // ✅ 21.6.1: Saat padStart YOK, Dakika/Saniye padStart VAR
            saatStr = `${h}:${String(m).padStart(2, '0')}:${String(s || 0).padStart(2, '0')}`;
          }
        }
        
        // ✅ DOĞRU FORMAT: "Aktivite - DD.MM.YYYY HH:MM:SS" (İsim Soyisim YOK!)
        if (saatStr) {
          logValue = `${aktivite} - ${tarihStr} ${saatStr}`;
        } else {
          logValue = `${aktivite} - ${tarihStr}`;
        }
      }
      
      // "Ham veri'den aktarıldı" kontrolü - bunları atla
      const isHamVeri = String(aktivite || '').toLowerCase().includes('ham veri');
      
      if (isHamVeri) {
        hamVeriSkippedCount++;
        continue; // Bu satırı atla
      }
      
      // Boş değer kontrolü
      const hasAktiviteTarihi = aktiviteTarihi && String(aktiviteTarihi).trim() !== '';
      const hasAktivite = aktivite && String(aktivite).trim() !== '';

      // Son 30 gün filtresi (Aktivite Tarihi üzerinden)
      if (hasAktiviteTarihi) {
        // DEBUG: Tarih parse etme
        let dt = null;
        try {
          dt = parseDdMmYyyy(aktiviteTarihi);
          if (!dt || isNaN(dt.getTime())) {
            dt = new Date(String(aktiviteTarihi));
          }
        } catch (e) {
          dt = new Date(String(aktiviteTarihi));
        }
        
        const valid = dt instanceof Date && !isNaN(dt.getTime());
        
        // DEBUG: İlk 5 satır için detaylı log
        if (i < 5) {
          const dtOnly = valid ? new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()) : null;
          const cutoffOnly = new Date(cutoffDate.getFullYear(), cutoffDate.getMonth(), cutoffDate.getDate());
          console.log(`🔍 DEBUG Satır ${i + 1}: Tarih="${aktiviteTarihi}" → Parse="${valid ? Utilities.formatDate(dt, 'Europe/Istanbul', 'dd.MM.yyyy') : 'GEÇERSİZ'}" | Eşik="${Utilities.formatDate(cutoffDate, 'Europe/Istanbul', 'dd.MM.yyyy')}" | Geçerli=${valid && dtOnly >= cutoffOnly}`);
        }
        
        if (!valid || dt < cutoffDate) {
          skippedOlderThanCutoff++;
          continue;
        }
      }
      
      if (hasAktiviteTarihi && hasAktivite) {
        // GEÇİCİ: Tüm log'ları al (tarih karşılaştırmasını devre dışı bırak)
        // TODO: Tarih karşılaştırması daha sonra aktif edilecek
        
        // KRİTİK: Tarih key'ini normalize et (saat kısmını çıkar)
        // Aynı gün için farklı formatlar ("08.12.2025" vs "08.12.2025 15:51:51") aynı key olmalı
        let normalizedDateKey = String(aktiviteTarihi || '').trim();
        
        // Saat kısmını çıkar (eğer varsa)
        // Format: "08.12.2025 15:51:51" -> "08.12.2025"
        normalizedDateKey = normalizedDateKey.replace(/\s+\d{1,2}:\d{2}(:\d{2})?/g, '').trim();
        
        // Date object ise, dd.MM.yyyy formatına çevir
        if (aktiviteTarihi instanceof Date && !isNaN(aktiviteTarihi.getTime())) {
          const d = String(aktiviteTarihi.getDate()).padStart(2, '0');
          const m = String(aktiviteTarihi.getMonth() + 1).padStart(2, '0');
          const y = aktiviteTarihi.getFullYear();
          normalizedDateKey = `${d}.${m}.${y}`;
        }
        
        // Eğer hala geçerli bir tarih formatı değilse, parse et
        if (!normalizedDateKey.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          const parsedDate = parseDdMmYyyy(aktiviteTarihi);
          if (parsedDate && !isNaN(parsedDate.getTime())) {
            const d = String(parsedDate.getDate()).padStart(2, '0');
            const m = String(parsedDate.getMonth() + 1).padStart(2, '0');
            const y = parsedDate.getFullYear();
            normalizedDateKey = `${d}.${m}.${y}`;
          } else {
            // Parse edilemezse, orijinal değeri kullan (ama saat kısmını çıkar)
            normalizedDateKey = normalizedDateKey.replace(/\s+\d{1,2}:\d{2}(:\d{2})?/g, '').trim();
          }
        }
        
        // DUPLICATE KONTROLÜ: Aynı log birden fazla kez eklenmemeli
        // Key: "aktivite|log|tarih" formatında unique identifier
        const duplicateKey = `${aktivite}|${logValue}|${normalizedDateKey}`;
        if (seenLogs.has(duplicateKey)) {
          duplicateLogsCount++;
          console.log(`⚠️ Duplicate log atlandı: ${duplicateKey.substring(0, 50)}...`);
          continue; // Bu log zaten eklenmiş, atla
        }
        seenLogs.add(duplicateKey);
        
        // Normalize edilmiş tarih key'i ile grupla
        if (!logsByDate.has(normalizedDateKey)) {
          logsByDate.set(normalizedDateKey, []);
        }
        
        // Log'dan zaman bilgisini çıkar (sıralama için)
        // ÖNCE aktiviteTarihi'nden saat bilgisini çıkar (eğer varsa)
        let timeFromTarih = 0;
        let timeStr = '';
        try {
          const tarihStr = String(aktiviteTarihi || '');
          // "08.12.2025 15:51:51" formatı
          const timeMatch = tarihStr.match(/(\d{1,2}):(\d{2}):(\d{2})/);
          if (timeMatch) {
            const h = parseInt(timeMatch[1]);
            const m = parseInt(timeMatch[2]);
            if (h >= 0 && h < 24 && m >= 0 && m < 60) {
              timeFromTarih = h * 60 + m;
              // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
              timeStr = `${h}:${String(m).padStart(2, '0')}`;
            }
          } else {
            // Date object ise
            if (aktiviteTarihi instanceof Date && !isNaN(aktiviteTarihi.getTime())) {
              const h = aktiviteTarihi.getHours();
              const m = aktiviteTarihi.getMinutes();
              if (h !== undefined && m !== undefined) {
                timeFromTarih = h * 60 + m;
                // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
                timeStr = `${h}:${String(m).padStart(2, '0')}`;
              }
            }
          }
        } catch (e) {
          // Hata durumunda log'dan çıkarmaya çalış
        }
        
        // Eğer aktiviteTarihi'nden saat bulunamadıysa, logValue'dan çıkar
        if (!timeStr || timeFromTarih === 0) {
          const timeFromLog = extractTimeFromLog(logValue);
          if (timeFromLog && timeFromLog > 0 && timeFromLog < 1440) {
            timeFromTarih = timeFromLog;
            const h = Math.floor(timeFromLog / 60);
            const m = timeFromLog % 60;
            // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
            timeStr = `${h}:${String(m).padStart(2, '0')}`;
          } else {
            // Log string'inden manuel çıkar
            try {
              const s = String(logValue || '');
              const m = s.match(/(\d{1,2}):(\d{2}):(\d{2})/);
              if (m) {
                const h = parseInt(m[1]);
                const min = parseInt(m[2]);
                if (h >= 0 && h < 24 && min >= 0 && min < 60) {
                  timeFromTarih = h * 60 + min;
                  // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
                  timeStr = `${h}:${String(min).padStart(2, '0')}`;
                }
              } else {
                const m2 = s.match(/(\d{1,2}):(\d{2})(?!\d)/);
                if (m2) {
                  const h = parseInt(m2[1]);
                  const min = parseInt(m2[2]);
                  if (h >= 0 && h < 24 && min >= 0 && min < 60) {
                    timeFromTarih = h * 60 + min;
                    // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
                    timeStr = `${h}:${String(min).padStart(2, '0')}`;
                  }
                }
              }
            } catch (e) {
              // Hata durumunda boş bırak
            }
          }
        }
        
        // ✅ DÜZELTME 2: Format kodunu çıkar (kaynak için)
        let formatCode = '';
        if (row._sheetName) {
          const sheetName = String(row._sheetName);
          // Sheet adından format kodunu çıkar
          // Örnek: "Format Tablo - TeksBH" → "TeksBH"
          const formatMatch = sheetName.match(/[-–—]\s*([^-–—]+)$/);
          if (formatMatch) {
            formatCode = formatMatch[1].trim();
          } else if (!sheetName.toLowerCase().includes('format tablo')) {
            formatCode = sheetName; // Zaten format kodu gibi görünüyor
          }
        }
        
        logsByDate.get(normalizedDateKey).push({
          rowIndex: i + 2,
          log: logValue,
          aktivite: aktivite,
          aktiviteTarihi: normalizedDateKey, // Normalize edilmiş tarih key'i kullan
          sourceSheet: row._sheetName,
          kaynakSayfa: formatCode, // ✅ DÜZELTME: Format kodu (TeksBH, otoanadolu)
          timeMinutes: timeFromTarih || 0, // Sıralama için zaman (dakika cinsinden)
          timeStr: timeStr // Görüntüleme için zaman string'i
        });
        
        newLogsCount++;
      } else {
        invalidLogsCount++;
      }
    }
    
    // Her gün için logları zamana göre sırala (sayfa bazlı değil, zaman bazlı)
    console.log('🔄 Loglar zamana göre sıralanıyor...');
    for (const [dateKey, logs] of logsByDate) {
      logs.sort((a, b) => {
        // Önce zaman bilgisine göre sırala
        if (a.timeMinutes !== b.timeMinutes) {
          return a.timeMinutes - b.timeMinutes;
        }
        // Aynı saatte ise, log string'ine göre sırala
        return String(a.log || '').localeCompare(String(b.log || ''));
      });
      console.log(`✅ ${dateKey}: ${logs.length} log zamana göre sıralandı`);
    }
    
    console.log(`🎯 LOG İŞLEME TAMAMLANDI:`);
    console.log(`   Toplam satır: ${allData.length}`);
    console.log(`   İşlenen log: ${newLogsCount}`);
    console.log(`   Duplicate (atlanan): ${duplicateLogsCount}`);
    console.log(`   30+ gün eski (atlanan): ${skippedOlderThanCutoff}`);
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
    let resultMessage = `📊 ${employeeCode} - ${employeeName} Log Özeti (Son 30 gün)\n\n`;
    resultMessage += `📅 Toplam gün sayısı: ${allLogsByDate.size}\n`;
    
    let totalLogs = 0;
    for (const [date, logs] of allLogsByDate) {
      resultMessage += `📅 ${date}: ${logs.length} log\n`;
      totalLogs += logs.length;
    }
    
    if (newLogsCount > 0) {
      resultMessage += `\n🆕 Yeni eklenen log: ${newLogsCount}`;
    }
    if (skippedOlderThanCutoff > 0) {
      resultMessage += `\n⏭️ 30+ gün eski (atlanan): ${skippedOlderThanCutoff}`;
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

    // ÖNCE VERİ KONTROLÜ: Eğer veri yoksa sayfayı temizleme ve mesaj yaz
    const hasData = logsByDate && logsByDate.size > 0 && Array.from(logsByDate.values()).some(logs => logs && logs.length > 0);
    
    // Eski sayfayı SİLME; varsa sadece içeriğini temizle (başlıkları yeniden yazacağız)
    let sheet = managerFile.getSheetByName(sheetName);
    if (!sheet) {
      sheet = managerFile.insertSheet(sheetName);
    }

    // Eğer veri yoksa, bilgilendirici mesaj yaz ve çık (SAYFAYI TEMİZLEME!)
    if (!hasData) {
      // Önce sayfayı temizle (sadece veri yokken)
      try {
        const lr = sheet.getLastRow();
        const lc = sheet.getLastColumn();
        if (lr > 0 && lc > 0) {
          sheet.getRange(1, 1, lr, lc).clearContent();
          sheet.getRange(1, 1, lr, lc).clearFormat();
        }
      } catch (_) {}
      
      const columns = ['Saat', 'Aktivite', 'Log Detayı', 'Kaynak', 'Satır No'];
      sheet.getRange(1, 1, 1, columns.length).setValues([columns]);
      sheet.getRange(1, 1, 1, columns.length).setFontWeight('bold').setBackground('#E3F2FD');
      
      // Bilgilendirici mesaj
      sheet.getRange(2, 1).setValue('📭 Son 30 gün içinde log bulunamadı');
      sheet.getRange(2, 1, 1, columns.length).merge();
      sheet.getRange(2, 1).setFontStyle('italic').setBackground('#FFF9C4');
      
      // Formatting
      try { sheet.autoResizeColumns(1, columns.length); } catch (_) {}
      try { SpreadsheetApp.flush(); } catch (_) {}
      
      console.log(`⚠️ ${employeeCode} için log verisi bulunamadı`);
      return sheet;
    }
    
    // VERİ VARSA: Sayfayı temizle
    try {
      const lr = sheet.getLastRow();
      const lc = sheet.getLastColumn();
      if (lr > 0 && lc > 0) {
        sheet.getRange(1, 1, lr, lc).clearContent();
        sheet.getRange(1, 1, lr, lc).clearFormat();
      }
    } catch (_) {}

    // Gruplu görünüm: Gün → Kaynak → Başlık satırı → Kayıtlar
    const columns = ['Saat', 'Aktivite', 'Log Detayı', 'Kaynak', 'Satır No'];
    const rows = [];

    function parseKeyToDate(key) {
      try {
        const parts = String(key || '').split('.');
        if (parts.length === 3) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      } catch (_) {}
      return new Date('1900-01-01');
    }

    function toMinutesFromLog(obj) {
      const s = String(obj && obj.log || '');
      const m = s.match(/(\d{1,2}):(\d{2})/);
      return m ? (Number(m[1]) * 60 + Number(m[2])) : 0;
    }

    function extractTimeStr(logStr) {
      const s = String(logStr || '');
      // ✅ DÜZELTME: Saat formatı - Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
      const m = s.match(/(\d{1,2}):(\d{2}):(\d{2})/);
      if (m) {
        const hours = parseInt(m[1], 10);
        const minutes = parseInt(m[2], 10);
        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          return `${hours}:${String(minutes).padStart(2, '0')}`;
        }
      }
      const m2 = s.match(/(\d{1,2}):(\d{2})(?!\d)/);
      if (m2) {
        const hours = parseInt(m2[1], 10);
        const minutes = parseInt(m2[2], 10);
        if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
          return `${hours}:${String(minutes).padStart(2, '0')}`;
        }
      }
      return '';
    }

    // ✅ DÜZELTME 1: Gelecek tarihleri filtrele (21.1 + 21.6 kuralları)
    // Bugünün tarihini al (sadece tarih, saat yok)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Gelecek tarihleri filtrele
    const validDates = Array.from(logsByDate.keys()).filter(dateKey => {
      const date = parseKeyToDate(dateKey);
      // Bugünden sonraki tarihleri filtrele
      if (date > today) {
        console.warn(`⚠️ Gelecek tarih filtrelendi: ${dateKey} (Bugün: ${Utilities.formatDate(today, 'Europe/Istanbul', 'dd.MM.yyyy')})`);
        return false;
      }
      return true;
    });
    
    const sortedDates = validDates.sort((a, b) => parseKeyToDate(b) - parseKeyToDate(a));
    
    // Tüm alarm satırlarını tut (RichTextValue için)
    const alarmRows = [];

    // İşbaşı saati (11:00)
    const WORK_START_HOUR = 11;
    const WORK_START_MINUTE = 0;
    const WORK_START_MINUTES = WORK_START_HOUR * 60 + WORK_START_MINUTE; // 660 dakika
    
    for (const dateKey of sortedDates) {
      const dayList = (logsByDate.get(dateKey) || []).slice();
      
      // Gün özeti hesapla - ÖNCE logları zamana göre sırala
      // Her log için timeMinutes MUTLAKA doğru hesapla (dayList.sort YAPMA, direkt logsWithTime'da sırala)
      const logsWithTime = dayList.map(item => {
        // Önce mevcut timeMinutes'i kontrol et
        let timeMinutes = item.timeMinutes;
        
        // Eğer geçerli bir değer yoksa, log'dan direkt çıkar
        if (!timeMinutes || timeMinutes === 0 || timeMinutes === null || isNaN(timeMinutes)) {
          timeMinutes = extractTimeFromLog(item.log);
        }
        
        // Hala geçersizse, log string'inden manuel çıkar
        if (!timeMinutes || timeMinutes === 0 || timeMinutes === null || isNaN(timeMinutes)) {
          const logStr = String(item.log || '');
          // Format: "İlgilenmiyor - 28.11.2025 11:47:42" veya "11:47:42" veya "11:47"
          const timeMatch1 = logStr.match(/(\d{2}\.\d{2}\.\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/); // Tarih + saat
          if (timeMatch1) {
            const h = parseInt(timeMatch1[2]);
            const m = parseInt(timeMatch1[3]);
            if (h >= 0 && h < 24 && m >= 0 && m < 60) {
              timeMinutes = h * 60 + m;
            }
          } else {
            const timeMatch2 = logStr.match(/(\d{1,2}):(\d{2}):(\d{2})/); // Sadece saat:dd:mm:ss
            if (timeMatch2) {
              const h = parseInt(timeMatch2[1]);
              const m = parseInt(timeMatch2[2]);
              if (h >= 0 && h < 24 && m >= 0 && m < 60) {
                timeMinutes = h * 60 + m;
              }
            } else {
              const timeMatch3 = logStr.match(/(\d{1,2}):(\d{2})(?!\d)/); // Sadece saat:dd:mm
              if (timeMatch3) {
                const h = parseInt(timeMatch3[1]);
                const m = parseInt(timeMatch3[2]);
                if (h >= 0 && h < 24 && m >= 0 && m < 60) {
                  timeMinutes = h * 60 + m;
                }
              }
            }
          }
        }
        
        // Son çare: 0 veya çok büyük bir sayı (hatalı hesaplamaları filtrelemek için)
        if (!timeMinutes || timeMinutes === 0 || timeMinutes === null || isNaN(timeMinutes) || timeMinutes > 1440) {
          timeMinutes = 9999; // Zamanı olmayan loglar en sona gitsin
        }
        
        return {
          ...item,
          timeMinutes: timeMinutes
        };
      });
      
      // Zamana göre sırala (erken saat yukarıda, zamanı olmayanlar en sonda)
      // KESIN ÇÖZÜM: Her log için zamanı tekrar çıkar ve sırala
      logsWithTime.sort((a, b) => {
        // Her ikisi için de zamanı tekrar hesapla (güvenlik için)
        let timeA = a.timeMinutes;
        let timeB = b.timeMinutes;
        
        // Eğer geçersizse, log string'inden direkt çıkar
        if (!timeA || timeA === 0 || timeA === null || isNaN(timeA) || timeA === 9999) {
          timeA = extractTimeFromLog(a.log) || 9999;
        }
        if (!timeB || timeB === 0 || timeB === null || isNaN(timeB) || timeB === 9999) {
          timeB = extractTimeFromLog(b.log) || 9999;
        }
        
        // Hala geçersizse, log string'inden manuel çıkar
        if (!timeA || timeA === 0 || timeA === null || isNaN(timeA) || timeA === 9999) {
          const logStrA = String(a.log || '');
          const matchA = logStrA.match(/(\d{1,2}):(\d{2}):(\d{2})/) || logStrA.match(/(\d{1,2}):(\d{2})(?!\d)/);
          if (matchA) {
            const h = parseInt(matchA[1]);
            const m = parseInt(matchA[2]);
            if (h >= 0 && h < 24 && m >= 0 && m < 60) {
              timeA = h * 60 + m;
            }
          }
          if (!timeA || timeA === 0 || timeA === null || isNaN(timeA)) timeA = 9999;
        }
        
        if (!timeB || timeB === 0 || timeB === null || isNaN(timeB) || timeB === 9999) {
          const logStrB = String(b.log || '');
          const matchB = logStrB.match(/(\d{1,2}):(\d{2}):(\d{2})/) || logStrB.match(/(\d{1,2}):(\d{2})(?!\d)/);
          if (matchB) {
            const h = parseInt(matchB[1]);
            const m = parseInt(matchB[2]);
            if (h >= 0 && h < 24 && m >= 0 && m < 60) {
              timeB = h * 60 + m;
            }
          }
          if (!timeB || timeB === 0 || timeB === null || isNaN(timeB)) timeB = 9999;
        }
        
        // Zaman bazlı sıralama
        if (timeA !== timeB) {
          return timeA - timeB;
        }
        // Aynı saatte ise, log string'ine göre sırala
        return String(a.log || '').localeCompare(String(b.log || ''));
      });
      
      let firstLogTime = null;
      let lastLogTime = null;
      let totalDelayMinutes = 0; // Toplam gecikme (dakika)
      let totalPauseMinutes = 0; // Toplam mola süresi (5dk+ molalar, dakika)
      let pauseCount = 0; // Mola sayısı
      
      if (logsWithTime.length > 0) {
        // İlk log'un zamanını al (geçerli zamanları bul)
        for (const log of logsWithTime) {
          const time = log.timeMinutes || extractTimeFromLog(log.log);
          // Geçerli zaman kontrolü: 0-1440 arası olmalı (9999 değil!)
          if (time && time > 0 && time < 1440 && time !== 9999) {
            if (firstLogTime === null || time < firstLogTime) {
              firstLogTime = time;
            }
            if (lastLogTime === null || time > lastLogTime) {
              lastLogTime = time;
            }
          }
        }
        
        // Gecikme hesapla (11:00'dan sonra başladıysa - 11:05 değil, 11:00)
        if (firstLogTime && firstLogTime > 0 && firstLogTime < 1440 && firstLogTime > WORK_START_MINUTES) {
          totalDelayMinutes = firstLogTime - WORK_START_MINUTES;
        }
        
        // 5 dakikadan fazla molaları hesapla (sıralı loglar üzerinden)
        // KESIN MANTIK:
        // 1. Sabah gecikmesi = 11:00 ile ilk log arasındaki fark (sadece gecikme, mola değil)
        // 2. İlk log ile ikinci log arasındaki fark = MOLA DEĞİL (işe yeni başlamış, henüz mola vermemiş)
        // 3. Mola = İkinci log ile üçüncü log arasından itibaren, tüm 5dk+ duraklamalar
        // Yani: i=0 (ilk log) ve i=0 ile i=1 arası atlanır, i=1 (ikinci log) ile i+1=2 (üçüncü log) arasından başlar
        // Ama döngü i=1'den başlıyor, yani ikinci log (i=1) ile üçüncü log (i+1=2) arası sayılıyor - BU DOĞRU
        // ÖNEMLİ: İlk log (i=0) ile ikinci log (i=1) arası ATLANMALI, çünkü bu işe başlama süresi, mola değil
        
        // Debug: İlk birkaç log'un zamanlarını göster
        if (logsWithTime.length >= 2) {
          const log0Time = logsWithTime[0].timeMinutes || extractTimeFromLog(logsWithTime[0].log) || 0;
          const log1Time = logsWithTime[1].timeMinutes || extractTimeFromLog(logsWithTime[1].log) || 0;
          // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
          const log0TimeStr = logsWithTime[0].timeStr || `${Math.floor(log0Time/60)}:${String(log0Time%60).padStart(2,'0')}`;
          const log1TimeStr = logsWithTime[1].timeStr || `${Math.floor(log1Time/60)}:${String(log1Time%60).padStart(2,'0')}`;
          console.log(`🔍 ${dateKey} - İlk iki log: ${log0TimeStr} → ${log1TimeStr} = ${log1Time - log0Time}min (ATLANACAK - mola değil, işe başlama)`);
        }
        
        // Mola hesaplama: İkinci log'dan itibaren (i=1), bir sonraki log ile fark hesapla
        console.log(`🔍 ${dateKey} - Mola hesaplama başlıyor: ${logsWithTime.length} log, i=1'den başlıyor (ikinci log ile üçüncü log arası)`);
        
        for (let i = 1; i < logsWithTime.length - 1; i++) {
          const currentItem = logsWithTime[i];
          const nextItem = logsWithTime[i + 1];
          
          // Zaman farkını hesapla (dakika cinsinden)
          let currentTime = currentItem.timeMinutes || extractTimeFromLog(currentItem.log) || 0;
          let nextTime = nextItem.timeMinutes || extractTimeFromLog(nextItem.log) || 0;
          
          // Geçerli zaman kontrolü: 0-1440 arası olmalı (9999 değil!)
          if (currentTime >= 1440 || currentTime === 9999) currentTime = 0;
          if (nextTime >= 1440 || nextTime === 9999) nextTime = 0;
          
          // Her iki zaman da geçerli olmalı
          if (currentTime > 0 && currentTime < 1440 && nextTime > 0 && nextTime < 1440 && nextTime > currentTime) {
            // Negatif zaman farkları sıralama hatası gösterebilir, bunları atla
            const timeDiffMinutes = nextTime - currentTime;
            
            // Farklı günler arasındaki farkı atla (gece yarısını geçiyorsa - maksimum 12 saat = 720 dakika)
            // Eğer fark çok büyükse (> 720 dakika), bu muhtemelen farklı günler arasındaki farktır, atla
            if (timeDiffMinutes > 720) {
              console.log(`⚠️ ${dateKey} - Çok büyük zaman farkı atlandı: ${timeDiffMinutes} dakika (muhtemelen farklı günler)`);
              continue;
            }
            
            // 5 dakika veya daha fazla mola (ikinci log'dan itibaren)
            // ÖNEMLİ: timeDiffMinutes pozitif olmalı (nextTime > currentTime kontrolü yapıldı)
            if (timeDiffMinutes >= 5 && timeDiffMinutes <= 720) {
              // Debug: Tüm molaları detaylı göster
              // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
              const currentTimeStr = currentItem.timeStr || `${Math.floor(currentTime/60)}:${String(currentTime%60).padStart(2,'0')}`;
              const nextTimeStr = nextItem.timeStr || `${Math.floor(nextTime/60)}:${String(nextTime%60).padStart(2,'0')}`;
              console.log(`⏸️ ${dateKey} - Mola #${pauseCount + 1}: ${currentTimeStr} → ${nextTimeStr} = ${timeDiffMinutes} dakika (Log[${i}] → Log[${i+1}])`);
              
              totalPauseMinutes += timeDiffMinutes;
              pauseCount++;
            }
          } else {
            // Zaman bilgisi yoksa, calculateTimeDifferenceSeconds kullan
            // ÖNEMLİ: Sadece aynı gün içindeki loglar arasındaki farkı hesapla
            const log1 = {
              date: dateKey,
              log: currentItem.log,
              aktivite: currentItem.aktivite
            };
            const log2 = {
              date: dateKey,
              log: nextItem.log,
              aktivite: nextItem.aktivite
            };
            
            const timeDiff = calculateTimeDifferenceSeconds(log1, log2);
            
            // Farklı günler arasındaki farkı atla (maksimum 12 saat = 43200 saniye)
            // Eğer fark çok büyükse (> 43200 saniye = 720 dakika), bu muhtemelen farklı günler arasındaki farktır, atla
            if (timeDiff >= 300 && timeDiff <= 43200) { // 5 dakika - 12 saat arası
              const minutes = Math.floor(timeDiff / 60);
              totalPauseMinutes += minutes;
              pauseCount++;
            } else if (timeDiff > 43200) {
              console.log(`⚠️ ${dateKey} - Çok büyük zaman farkı atlandı: ${Math.floor(timeDiff / 60)} dakika (muhtemelen farklı günler)`);
            }
          }
        }
        
        // Debug: Toplam mola özeti
        console.log(`📊 ${dateKey} - Mola özeti: ${totalPauseMinutes} dakika, ${pauseCount} adet`);
      }
      
      // Gün başlığı ve özeti - Her bilgi ayrı satırda (düzgün dizayn)
      rows.push([`📅 ${dateKey}`, '', '', '', '']); // Tarih
      rows.push([`📊 ${dayList.length} log`, '', '', '', '']); // Log sayısı
      
      // Gün özeti bilgileri (her biri ayrı satır)
      // KRİTİK: firstLogTime ve lastLogTime geçerli olmalı (0-1440 arası, 9999 değil!)
      if (firstLogTime && firstLogTime > 0 && firstLogTime < 1440 && firstLogTime !== 9999) {
        const startHours = Math.floor(firstLogTime / 60);
        const startMins = firstLogTime % 60;
        // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
        const startTimeStr = `${startHours}:${String(startMins).padStart(2, '0')}`;
        
        if (lastLogTime && lastLogTime > 0 && lastLogTime < 1440 && lastLogTime !== 9999) {
          const endHours = Math.floor(lastLogTime / 60);
          const endMins = lastLogTime % 60;
          // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
          const endTimeStr = `${endHours}:${String(endMins).padStart(2, '0')}`;
          
          rows.push([`⏰ ${startTimeStr} - ${endTimeStr}`, '', '', '', '']); // Başlama - Bitiş
        } else {
          rows.push([`⏰ Başlama: ${startTimeStr}`, '', '', '', '']); // Sadece başlama
        }
        
        // Gecikme bilgisi
        if (totalDelayMinutes > 0) {
          rows.push([`⏳ Gecikme: ${totalDelayMinutes} dakika`, '', '', '', '']); // Gecikme
        }
        
        // Mola özeti
        if (pauseCount > 0) {
          rows.push([`⏸️ Toplam Mola: ${totalPauseMinutes} dakika (${pauseCount} mola)`, '', '', '', '']); // Mola
        }
      }
      
      rows.push(['', '', '', '', '']); // Boş satır (ayırıcı)
      
      // Kolon başlıkları
      rows.push(columns.slice());
      
      // Kayıtlar + Alarm satırları (zamana göre sıralı, logsWithTime kullan)
      for (let i = 0; i < logsWithTime.length; i++) {
        const item = logsWithTime[i];
        
        // Eğer item veya item.log yoksa, bu satırı atla
        if (!item || !item.log) {
          console.log(`⚠️ Boş item atlandı: index ${i}`);
          continue;
        }
        
        // ✅ DÜZELTME 3: Saat parse - Daha agresif, her satırda saat olmalı!
        let finalTimeStr = item.timeStr || '';
        
        // 1. Önce item.timeStr'den al
        if (!finalTimeStr && item.log) {
          finalTimeStr = extractTimeStr(item.log);
        }
        
        // 2. Hala boşsa, aktiviteTarihi'nden çıkar
        if (!finalTimeStr && item.aktiviteTarihi) {
          try {
            if (item.aktiviteTarihi instanceof Date) {
              const h = item.aktiviteTarihi.getHours();
              const m = item.aktiviteTarihi.getMinutes();
              // ✅ 21.6.1: Saat padStart YOK, Dakika padStart VAR
              finalTimeStr = `${h}:${String(m).padStart(2, '0')}`;
            } else {
              // String ise parse et
              const timeMatch = String(item.aktiviteTarihi).match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
              if (timeMatch) {
                const h = parseInt(timeMatch[1], 10);
                const m = parseInt(timeMatch[2], 10);
                if (h >= 0 && h < 24 && m >= 0 && m < 60) {
                  finalTimeStr = `${h}:${String(m).padStart(2, '0')}`;
                }
              }
            }
          } catch (e) {
            console.warn(`⚠️ aktiviteTarihi'nden saat çıkarılamadı: ${e.message}`);
          }
        }
        
        // 3. Hala boşsa, log string'inden daha agresif parse et
        if (!finalTimeStr && item.log) {
          const logStr = String(item.log || '');
          // "09.12.2024 13:05:42" formatından saat çıkar
          const timeMatch = logStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
          if (timeMatch) {
            const h = parseInt(timeMatch[1], 10);
            const m = parseInt(timeMatch[2], 10);
            if (h >= 0 && h < 24 && m >= 0 && m < 60) {
              finalTimeStr = `${h}:${String(m).padStart(2, '0')}`;
            }
          }
        }
        
        // ✅ KRİTİK: Saat formatını doğrula ve düzelt (01:9 → 01:09)
        if (finalTimeStr) {
          // ✅ DÜZELTME: Saat formatı - Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
          const timeMatch = finalTimeStr.match(/^(\d{1,2}):(\d{1,2})$/);
          if (timeMatch) {
            const hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
              // Format: Saat padStart YOK, Dakika padStart VAR
              finalTimeStr = `${hours}:${String(minutes).padStart(2, '0')}`;
            } else {
              // Geçersiz saat formatı, boş bırak
              console.warn(`⚠️ Geçersiz saat formatı: "${finalTimeStr}" → boş bırakıldı`);
              finalTimeStr = '';
            }
          } else {
            // Format uyumsuz, tekrar parse et
            const reExtracted = extractTimeStr(item.log || '');
            if (reExtracted) {
              finalTimeStr = reExtracted;
            } else {
              finalTimeStr = '';
            }
          }
        }
        
        // ✅ DEBUG: Saat parse sonucu
        if (!finalTimeStr) {
          console.warn(`⚠️ Saat parse edilemedi: log="${item.log?.substring(0, 50)}", aktiviteTarihi="${item.aktiviteTarihi}", timeStr="${item.timeStr}"`);
        }
        
        // Aktivite ve log kontrolü - eksik veri varsa uyar ama satırı ekle
        const aktivite = String(item.aktivite || '').trim();
        const logDetail = String(item.log || '').trim();
        
        // Eksik veri uyarısı (ama satırı ekle - istatistikler doğru kalsın)
        if (!aktivite || aktivite.length === 0) {
          console.log(`⚠️ Aktivite boş: Saat=${finalTimeStr}, Log="${logDetail?.substring(0, 30)}"`);
        }
        
        if (!logDetail || logDetail.length === 0) {
          console.log(`⚠️ Log detayı boş: Saat=${finalTimeStr}, Aktivite="${aktivite}"`);
        }
        
        // ✅ DÜZELTME 2: Kaynak kolonu - Format kodunu yaz (TeksBH, otoanadolu), "Log Arşivi" YAZMA!
        let kaynakStr = '';
        
        // Önce kaynakSayfa'yı kontrol et (Log Arşivi'nden gelen veriler için)
        if (item.kaynakSayfa && String(item.kaynakSayfa).trim() !== '') {
          kaynakStr = String(item.kaynakSayfa).trim();
        } else if (item.sourceSheet) {
          // Format Tablo'lardan gelen veriler için sheet adından format kodunu çıkar
          const sheetName = String(item.sourceSheet);
          // Sheet adından format kodunu çıkar
          // Örnek: "Format Tablo - TeksBH" → "TeksBH"
          // Örnek: "Format Tablo - otoanadolu" → "otoanadolu"
          // Örnek: "TeksBH" → "TeksBH"
          const formatMatch = sheetName.match(/[-–—]\s*([^-–—]+)$/); // Son kısım (tire'den sonra)
          if (formatMatch) {
            kaynakStr = formatMatch[1].trim();
          } else if (sheetName.toLowerCase().includes('format tablo')) {
            // "Format Tablo" içeriyorsa ama format kodu yoksa, sheet adının kendisini kullan
            kaynakStr = sheetName.replace(/format\s+tablo\s*-?\s*/i, '').trim();
            if (!kaynakStr || kaynakStr.toLowerCase() === 'format tablo') {
              kaynakStr = ''; // Boş bırak
            }
          } else {
            kaynakStr = sheetName; // Zaten format kodu gibi görünüyor
          }
        }
        
        // "Log Arşivi" yazma!
        if (kaynakStr.toLowerCase().includes('log arşivi')) {
          kaynakStr = ''; // Boş bırak
        }
        
        // Satırı ekle (eksik veri olsa bile - kullanıcı sorunu görsün)
        rows.push([
          finalTimeStr, // Saat kolonu (A kolonu) - her zaman göster
          aktivite, // Aktivite kolonu (B kolonu) - boş olabilir
          logDetail, // Log Detayı kolonu (C kolonu) - boş olabilir
          kaynakStr, // Kaynak kolonu (D kolonu) - Format kodu (TeksBH, otoanadolu)
          String(item.rowIndex || '') // Satır No kolonu (E kolonu)
        ]);
        
        // Alarm kontrolü: Bir sonraki log ile arasındaki süreyi hesapla
        if (i < logsWithTime.length - 1) {
          const currentItem = item;
          const nextItem = logsWithTime[i + 1];
          
          // Log objelerini calculateTimeDifferenceSeconds formatına çevir
          const log1 = {
            date: dateKey,
            log: currentItem.log,
            aktivite: currentItem.aktivite
          };
          const log2 = {
            date: dateKey,
            log: nextItem.log,
            aktivite: nextItem.aktivite
          };
          
          const timeDiff = calculateTimeDifferenceSeconds(log1, log2);
          
          // 15 saniyeden az alarm
          if (timeDiff > 0 && timeDiff < 15) {
            const boldText = `${timeDiff} saniye`;
            const detailText = `${boldText} içinde arandı`;
            
            rows.push([
              '', // Saat
              '⚡ 15 Saniyeden Daha Hızlı Log', // Aktivite (yıldırım simgesi)
              detailText, // Log Detayı (normal string, sonra RichTextValue yapılacak)
              '', // Kaynak
              '' // Satır No
            ]);
            
            // RichTextValue için işaretle
            alarmRows.push({
              row: rows.length, // Yeni eklenen satır
              col: 3, // Log Detayı kolonu
              text: detailText,
              boldText: boldText,
              boldStart: 0
            });
          }
          
          // 5 dakikadan fazla alarm
          if (timeDiff >= 300) { // 5 dakika = 300 saniye
            const minutes = Math.floor(timeDiff / 60);
            const boldText = `${minutes} dakika`;
            const detailText = `>${boldText} arama yapılmadı`;
            
            rows.push([
              '', // Saat (boş - alarm satırı)
              '⏸️ 5 Dakikadan Uzun Hiçbir Log Yok', // Aktivite (duraklama simgesi)
              detailText, // Log Detayı (normal string, sonra RichTextValue yapılacak)
              '', // Kaynak (boş)
              '' // Satır No (boş)
            ]);
            
            // RichTextValue için işaretle
            alarmRows.push({
              row: rows.length, // Yeni eklenen satır
              col: 3, // Log Detayı kolonu
              text: detailText,
              boldText: boldText,
              boldStart: 1, // ">" karakterinden sonra
              alarmType: '5dk' // Alarm tipi (renklendirme için)
            });
          }
        }
      }
      
      // Gün sonu boş satır (ayırıcı)
      rows.push(['', '', '', '', '']);
      rows.push(['', '', '', '', '']);
    }

    if (rows.length > 0) {
      const chunkSize = 1000;
      let written = 0;
      while (written < rows.length) {
        const end = Math.min(written + chunkSize, rows.length);
        const chunk = rows.slice(written, end);
        sheet.getRange(1 + written, 1, chunk.length, columns.length).setValues(chunk);
        written = end;
      }
      try { SpreadsheetApp.flush(); } catch (_) {}
    }
    
    // Alarm satırları için RichTextValue uygula
    try {
      for (const alarmRow of alarmRows) {
        const cell = sheet.getRange(alarmRow.row, alarmRow.col);
        const richText = SpreadsheetApp.newRichTextValue()
          .setText(alarmRow.text)
          .setTextStyle(alarmRow.boldStart, alarmRow.boldStart + alarmRow.boldText.length, SpreadsheetApp.newTextStyle().setBold(true).build())
          .build();
        cell.setRichTextValue(richText);
      }
    } catch (richTextErr) {
      console.log('⚠️ RichTextValue uygulama hatası:', richTextErr && richTextErr.message);
    }

    try { if (rows.length <= 2000) sheet.autoResizeColumns(1, columns.length); } catch (_) {}

    // NEW: Apply color coding to log summary for readability + Alarm renklendirme
    try {
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow > 0 && lastCol > 0) {
        const values = sheet.getRange(1, 1, lastRow, lastCol).getDisplayValues();
        const backgrounds = [];
        const richTextValues = [];

        function getActivityColor(activityRaw) {
          try {
            const s = String(activityRaw || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
            if (!s) return '';
            if (s.indexOf('ulasil') !== -1 || s.indexOf('ulas') !== -1) return CRM_CONFIG.COLOR_CODES['Ulaşılamadı'];
            if (s.indexOf('ilgilenmiyor') !== -1 || s.indexOf('ilgi yok') !== -1) return CRM_CONFIG.COLOR_CODES['İlgilenmiyor'];
            if (s.indexOf('gecersiz numara') !== -1 || s.indexOf('geçersiz numara') !== -1) return CRM_CONFIG.COLOR_CODES['Geçersiz Numara'];
            if (s.indexOf('randevu al') !== -1) return CRM_CONFIG.COLOR_CODES['Randevu Alındı'];
            if (s.indexOf('teyit') !== -1) return CRM_CONFIG.COLOR_CODES['Randevu Teyitlendi'];
            if (s.indexOf('erte') !== -1) return CRM_CONFIG.COLOR_CODES['Randevu Ertelendi'];
            if (s.indexOf('iptal') !== -1) return CRM_CONFIG.COLOR_CODES['Randevu İptal oldu'];
            if (s.indexOf('yeniden') !== -1 || s.indexOf('ara') !== -1) return CRM_CONFIG.COLOR_CODES['Yeniden Aranacak'];
            if (s.indexOf('bilgi') !== -1) return CRM_CONFIG.COLOR_CODES['Bilgi Verildi'];
            if (s.indexOf('firsat') !== -1 || s.indexOf('fırsat') !== -1 || s.indexOf('ilet') !== -1) return CRM_CONFIG.COLOR_CODES['Fırsat İletildi'];
            if (s.indexOf('toplanti') !== -1 || s.indexOf('toplantı') !== -1) return CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'];
            if (s.indexOf('satış yapildi') !== -1 || s.indexOf('satis yapildi') !== -1 || s.indexOf('satis yap') !== -1) return CRM_CONFIG.COLOR_CODES['Satış Yapıldı'];
            return '';
          } catch (e) {
            return '';
          }
        }

        // ✅ 21.6.2: Tüm satırları işle, boş satırlar için null kullan
        for (let r = 0; r < lastRow; r++) {
          const rowBgs = new Array(lastCol).fill('white');
          const firstCell = String(values[r][0] || '').trim();
          const activity = String(values[r][1] || '').trim();
          const logDetail = String(values[r][2] || '').trim();
          const source = String(values[r][3] || '').trim();
          const rowNo = String(values[r][4] || '').trim();
          
          // ✅ DÜZELTME 3: Boş satır kontrolü - TÜM kolonları kontrol et (21.6.2 kuralları)
          let isRowEmpty = true;
          for (let c = 0; c < lastCol; c++) {
            const cellValue = String(values[r][c] || '').trim();
            if (cellValue !== '') {
              isRowEmpty = false;
              break;
            }
          }
          
          if (isRowEmpty) {
            // ✅ 21.6.2: Tamamen boş satır - null ekle (renklendirme yok!)
            backgrounds.push(null);
            continue;
          }
          
          // Hangi kolonların dolu olduğunu belirle (sadece dolu kolonlara renk ver)
          // ÖNEMLİ: Sadece gerçekten içerik olan kolonlara renk ver
          const filledCols = [];
          if (firstCell && firstCell.trim() !== '') filledCols.push(0); // A kolonu (Saat)
          if (activity && activity.trim() !== '') filledCols.push(1); // B kolonu (Aktivite)
          if (logDetail && logDetail.trim() !== '') filledCols.push(2); // C kolonu (Log Detayı)
          if (source && source.trim() !== '') filledCols.push(3); // D kolonu (Kaynak)
          if (rowNo && rowNo.trim() !== '') filledCols.push(4); // E kolonu (Satır No)
          
          // F kolonu ve sonrası için açıkça beyaz bırak (gereksiz renklendirme önleme)
          for (let f = 5; f < lastCol; f++) {
            rowBgs[f] = 'white'; // F kolonu ve sonrası her zaman beyaz
          }
          
          // ✅ KRİTİK: Sadece gerçekten veri olan satırları renklendir
          // Gün başlığı ve özeti satırları için özel renklendirme
          if (firstCell.includes('📅') || firstCell.includes('⏰') || firstCell.includes('⏳') || firstCell.includes('⏸️') || firstCell.includes('📊')) {
            // Gün başlığı satırları - sadece dolu kolonlara renk ver
            if (filledCols.length > 0) {
              filledCols.filter(col => col < 5).forEach(col => rowBgs[col] = '#E3F2FD'); // Açık mavi (gün başlığı)
            }
            // Gün başlığı satırlarını bold yap
            sheet.getRange(r + 1, 1, 1, lastCol).setFontWeight('bold');
          } else if (firstCell === '' && activity === '' && logDetail === '' && source === '' && rowNo === '') {
            // ✅ 21.6.2: Tamamen boş ayırıcı satır - backgrounds array'ine EKLEME (renklendirme yok!)
            // Bu satır zaten yukarıda kontrol edildi ama ekstra güvenlik için
            continue;
          } else if (activity.includes('15 Saniyeden Daha Hızlı Log') || activity.includes('⚡')) {
            // Alarm satırları için özel renklendirme - sadece dolu kolonlara (A-E)
            if (filledCols.length > 0) {
              filledCols.filter(col => col < 5).forEach(col => rowBgs[col] = '#FFEB3B'); // Sarı
            }
          } else if (activity.includes('5 Dakikadan Uzun Hiçbir Log Yok') || activity.includes('⏸️')) {
            // Alarm satırları için özel renklendirme - sadece dolu kolonlara (A-E)
            if (filledCols.length > 0) {
              filledCols.filter(col => col < 5).forEach(col => rowBgs[col] = '#E1BEE7'); // Açık mor
            }
          } else if (activity && logDetail) {
            // ✅ DÜZELTME: Normal log satırı - aktivite VE log detayı varsa renklendir
            // Sadece saat varsa ama aktivite/log yoksa renklendirme YOK
            const color = getActivityColor(activity);
            if (color && filledCols.length > 0) {
              // Sadece dolu kolonlara renk ver (A-E arası)
              filledCols.filter(col => col < 5).forEach(col => rowBgs[col] = color);
            }
          }
          // ✅ Eğer sadece saat varsa (aktivite veya log yoksa), renk uygulama (beyaz bırak)
          
          backgrounds.push(rowBgs);
          
          // RichTextValue için işaretle (alarm satırlarında - simgeleri de kontrol et)
          if (activity.includes('15 Saniyeden') || activity.includes('⚡') || 
              activity.includes('5 Dakikadan') || activity.includes('⏸️')) {
            richTextValues.push({ row: r + 1, col: 3 }); // Log Detayı kolonu
          }
        }
        
        // ✅ DÜZELTME 21.6.2: Background renkleri batch uygula - Minimal range (sadece dolu alan)
        // KRİTİK: F kolonu (index 5) ve sonrası için renklendirme YAPMA!
        const maxColToColor = Math.min(5, lastCol); // A-E kolonları (index 0-4, yani 5 kolon)
        if (maxColToColor > 0 && backgrounds.length > 0) {
          // ✅ 21.6.2: Minimal range - Sadece dolu satırları kapsayan range (boş satırları atla)
          // backgrounds array'i null içerebilir (boş satırlar için)
          // Sadece null olmayan satırları filtrele ve batch yaz
          
          // Null olmayan satırları filtrele ve satır numaralarını sakla
          const filledRows = [];
          const filledBgs = [];
          
          for (let r = 0; r < backgrounds.length; r++) {
            if (backgrounds[r] !== null) {
              filledRows.push(r + 1); // Sheet'te 1-based
              filledBgs.push(backgrounds[r].slice(0, maxColToColor));
            }
          }
          
          // ✅ 21.6.2: Batch yaz - Ardışık satırları grupla, tek API call
          if (filledRows.length > 0 && filledBgs.length > 0) {
            // Ardışık satırları grupla
            let startRow = filledRows[0];
            let startBgIndex = 0;
            
            for (let i = 0; i < filledRows.length; i++) {
              const currentRow = filledRows[i];
              const nextRow = i < filledRows.length - 1 ? filledRows[i + 1] : null;
              
              // Eğer bir sonraki satır ardışık değilse veya son satırsa, mevcut grubu yaz
              if (nextRow === null || nextRow !== currentRow + 1) {
                const numRows = currentRow - startRow + 1;
                const bgSlice = filledBgs.slice(startBgIndex, i + 1);
                
                if (bgSlice.length > 0) {
                  sheet.getRange(startRow, 1, numRows, maxColToColor).setBackgrounds(bgSlice);
                }
                
                // Yeni grup başlat
                if (nextRow !== null) {
                  startRow = nextRow;
                  startBgIndex = i + 1;
                }
              }
            }
          }
          
          // ✅ 21.6.2: F kolonu ve sonrası için renklendirme YOK (boş hücreyi renklendirme)
          // Zaten boş olduğu için renklendirmeye gerek yok
        }
        
        // RichTextValue'ları uygula (alarm satırları için)
        for (const rtv of richTextValues) {
          const cellValue = sheet.getRange(rtv.row, rtv.col).getValue();
          if (cellValue && typeof cellValue === 'object' && cellValue.getText) {
            // Zaten RichTextValue ise, tekrar uygulamaya gerek yok
            continue;
          }
          // Eğer string ise, RichTextValue'ya çevir
          const text = String(sheet.getRange(rtv.row, rtv.col).getValue() || '');
          if (text) {
            // 15sn alarmı: "X saniye içinde arandı"
            const match15sn = text.match(/(\d+)\s*saniye\s*içinde/);
            if (match15sn) {
              const boldText = `${match15sn[1]} saniye`;
              const boldStart = text.indexOf(boldText);
              if (boldStart !== -1) {
                const richText = SpreadsheetApp.newRichTextValue()
                  .setText(text)
                  .setTextStyle(boldStart, boldStart + boldText.length, SpreadsheetApp.newTextStyle().setBold(true).build())
                  .build();
                sheet.getRange(rtv.row, rtv.col).setRichTextValue(richText);
                continue;
              }
            }
            
            // 5dk alarmı: ">X dakika arama yapılmadı"
            const match5dk = text.match(/>(\d+)\s*dakika/);
            if (match5dk) {
              const boldText = `${match5dk[1]} dakika`;
              const boldStart = text.indexOf(boldText);
              if (boldStart !== -1) {
                const richText = SpreadsheetApp.newRichTextValue()
                  .setText(text)
                  .setTextStyle(boldStart, boldStart + boldText.length, SpreadsheetApp.newTextStyle().setBold(true).build())
                  .build();
                sheet.getRange(rtv.row, rtv.col).setRichTextValue(richText);
                continue;
              }
            }
          }
        }
      }
    } catch (colorErr) {
      console.log('⚠️ Log summary color coding skipped:', colorErr && colorErr.message);
    }

    return sheet;
  } catch (error) {
    console.error('❌ createEmployeeLogSummarySheet error:', error);
    return null;
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
    // ✅ DÜZELTME: Saat padStart YOK, Dakika padStart VAR (9:05, 13:09)
    const timeMatch = log.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return `${hours}:${String(minutes).padStart(2, '0')}`;
      }
    }
    
    // HH:mm formatını ara
    const timeMatch2 = log.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch2) {
      const hours = parseInt(timeMatch2[1], 10);
      const minutes = parseInt(timeMatch2[2], 10);
      if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        return `${hours}:${String(minutes).padStart(2, '0')}`;
      }
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

function syncAllEmployeesAppend_Randevular() {
  FAST_SYNC = true;
  console.log('Function started:', { action: 'syncAllEmployeesAppend_Randevular' });
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    if (!managerFile) throw new Error('Yönetici dosyası bulunamadı');

    // Tüm çalışan verilerini tek seferde topla
    const allEmployeeData = {};
    const codes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    for (const code of codes) {
      const dataBySheet = collectEmployeeData(managerFile, code);
      const data = dataBySheet && dataBySheet['Randevular'];
      if (Array.isArray(data) && data.length > 0) {
        allEmployeeData[code] = data;
      }
    }

    // Tüm veriyi birleştir ve tek seferde işle
    const combinedData = [];
    for (const [code, data] of Object.entries(allEmployeeData)) {
      for (const row of data) {
        combinedData.push({ temsilciKodu: code, data: row.data });
      }
    }

    const allStats = { totalRecords: 0, employeeStats: {} };

    // Tüm veriyi tek seferde işle (duplicate önleme ile)
    if (combinedData.length > 0) {
      const op = updateManagerSheet(managerFile, 'Randevular', combinedData, 'ALL', 'replace') || {};
      allStats.employeeStats['ALL'] = op;
      allStats.totalRecords = op.totalIncoming || 0;
    }

    showSyncResults(allStats);
    try { sortTRandevularStrict(); } catch (e) { console.log('⚠️ sortTRandevularStrict after sync skipped:', e && e.message); }
    FAST_SYNC = false;
    SpreadsheetApp.getUi().alert('Tamam', `Tüm kodlar için ${combinedData.length} randevu eklendi.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', 'Randevular (tüm kodlar) üstüne ekle: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function syncAllEmployeesAppend_Firsatlar() {
  FAST_SYNC = true;
  console.log('Function started:', { action: 'syncAllEmployeesAppend_Firsatlar' });
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    if (!managerFile) throw new Error('Yönetici dosyası bulunamadı');

    // Tüm çalışan verilerini tek seferde topla
    const allEmployeeData = {};
    const codes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    for (const code of codes) {
      const dataBySheet = collectEmployeeData(managerFile, code);
      const data = dataBySheet && dataBySheet['Fırsatlar'];
      if (Array.isArray(data) && data.length > 0) {
        allEmployeeData[code] = data;
      }
    }

    // Tüm veriyi birleştir ve tek seferde işle
    const combinedData = [];
    for (const [code, data] of Object.entries(allEmployeeData)) {
      for (const row of data) {
        combinedData.push({ temsilciKodu: code, data: row.data });
      }
    }

    const allStats = { totalRecords: 0, employeeStats: {} };

    // Tüm veriyi tek seferde işle (duplicate önleme ile)
    if (combinedData.length > 0) {
      const op = updateManagerSheet(managerFile, 'Fırsatlar', combinedData, 'ALL', 'replace') || {};
      allStats.employeeStats['ALL'] = op;
      allStats.totalRecords = op.totalIncoming || 0;
    }

    showSyncResults(allStats);
    FAST_SYNC = false;
    SpreadsheetApp.getUi().alert('Tamam', `Tüm kodlar için ${combinedData.length} fırsat eklendi.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', 'Fırsatlar (tüm kodlar) üstüne ekle: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function syncAllEmployeesAppend_Toplantilar() {
  FAST_SYNC = true;
  console.log('Function started:', { action: 'syncAllEmployeesAppend_Toplantilar' });
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    if (!managerFile) throw new Error('Yönetici dosyası bulunamadı');

    // Tüm çalışan verilerini tek seferde topla
    const allEmployeeData = {};
    const codes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    for (const code of codes) {
      const dataBySheet = collectEmployeeData(managerFile, code);
      const data = dataBySheet && dataBySheet['Toplantılar'];
      if (Array.isArray(data) && data.length > 0) {
        allEmployeeData[code] = data;
      }
    }

    // Tüm veriyi birleştir ve tek seferde işle
    const combinedData = [];
    for (const [code, data] of Object.entries(allEmployeeData)) {
      for (const row of data) {
        combinedData.push({ temsilciKodu: code, data: row.data });
      }
    }

    const allStats = { totalRecords: 0, employeeStats: {} };

    // Tüm veriyi tek seferde işle (duplicate önleme ile)
    if (combinedData.length > 0) {
      const op = updateManagerSheet(managerFile, 'Toplantılar', combinedData, 'ALL', 'replace') || {};
      allStats.employeeStats['ALL'] = op;
      allStats.totalRecords = op.totalIncoming || 0;
    }

    showSyncResults(allStats);
    FAST_SYNC = false;
    SpreadsheetApp.getUi().alert('Tamam', `Tüm kodlar için ${combinedData.length} toplantı eklendi.`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', 'Toplantılar (tüm kodlar) üstüne ekle: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function syncReportsAllEmployees() {
  FAST_SYNC = true;
  console.log('Function started:', { action: 'syncReportsAllEmployees' });
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    if (!managerFile) throw new Error('Yönetici dosyası bulunamadı');
    const codes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    for (const code of codes) {
      const employeeFile = findEmployeeFile(code);
      if (!employeeFile) continue;
      const negRows = collectFormatTableNegativeSummary(employeeFile, code);
      updateManagerActivitySummary(managerFile, negRows, code, 'replace');
      const fullRows = computeFullActivityWideRows(managerFile, code);
      updateManagerFullActivitySummaryWide(managerFile, fullRows, code, 'replace');
    }
    try {
      const shTumu = managerFile.getSheetByName('T Aktivite (Tümü)');
      if (shTumu && shTumu.getLastRow() > 1) {
        applyColorCodingToManagerData(shTumu, 'T Aktivite (Tümü)', 2, shTumu.getLastRow() - 1);
      }
    } catch (e) {}
    SpreadsheetApp.getUi().alert('Tamam', 'Raporlar tüm kodlar için güncellendi.', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', 'Rapor güncelleme hatası: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/* createTypeBasedMenu kaldırıldı: Tüm Kodlar aksiyonları artık '➕ Sırayla (Üstüne Ekle)' altında */

function sortTRandevularStrict() {
  console.log('Function started:', { action: 'sortTRandevularStrict' });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('T Randevular') || ss.getSheetByName('Randevular');
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
    const lowered = headers.map(h => String(h || '').trim().toLowerCase());
    function findIdx(cands){ for (const c of cands){ const i = lowered.indexOf(String(c).trim().toLowerCase()); if (i!==-1) return i; } return -1; }
    const idxStatus = findIdx(['Randevu durumu','Durum']);
    const idxDate = findIdx(['Randevu Tarihi','Tarih']);
    const idxTime = findIdx(['Saat']);
    const rng = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = rng.getDisplayValues();
    function parseDate(v){
      if (v instanceof Date && !isNaN(v.getTime())) return v;
      const d1 = parseDdMmYyyy(v); if (d1) return d1;
      const d2 = new Date(String(v)); if (!isNaN(d2.getTime())) return d2;
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
      function norm(x){
        try { return String(x||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,''); } catch(_) { return String(x||'').toLowerCase(); }
      }
      const s = norm(idxStatus>=0 ? row[idxStatus] : '');
      if (s.includes('iptal')) return 0; // Randevu İptal oldu
      if (s.includes('erte')) return 1; // Randevu Ertelendi
      return 2; // Diğerleri (Alındı/Teyit/İleri)
    }
    values.sort(function(a,b){
      const ra = groupRank(a), rb = groupRank(b);
      if (ra !== rb) return ra - rb;
      const da = parseDate(idxDate>=0 ? a[idxDate] : null);
      const db = parseDate(idxDate>=0 ? b[idxDate] : null);
      if (da.getTime() !== db.getTime()) return da - db;
      if (idxTime >= 0) return parseTime(a[idxTime]) - parseTime(b[idxTime]);
      return 0;
    });
    rng.setValues(values);
    SpreadsheetApp.getUi().alert('T Randevular: İptal > Ertelendi > Diğerleri ve Randevu Tarihi (artan) ile sıralandı.');
  } catch (error) {
    console.error('Function failed:', error);
  }
}

// ========================================
// 📊 YENİ RAPOR SİSTEMİ - YARDIMCI FONKSİYONLAR
// ========================================

/**
 * 📅 Hafta başlangıcı (Pazartesi)
 */
function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day); // Pazartesi
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * 📅 Hafta numarası (yılın kaçıncı haftası) - Rapor için
 */
function getWeekNumberForReport(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * 📅 Hafta numarası (getWeekNumber ile aynı)
 */
function getWeekNumber(date) {
  return getWeekNumberForReport(date);
}

/**
 * 📅 Tarih formatla
 */
function formatDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'dd.MM.yyyy');
}

/**
 * 📅 Türkçe ay adını döndür
 * @param {number} month - Ay numarası (0-11)
 * @returns {string} - Türkçe ay adı
 */
function getTurkishMonthName(month) {
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  if (month >= 0 && month <= 11) {
    return monthNames[month];
  }
  
  return '';
}

/**
 * 📋 Format Tablo sayfalarından log verisi çekme (geriye dönük veriler için)
 * @param {Spreadsheet} employeeFile - Temsilci dosyası
 * @param {Date} startDate - Başlangıç tarihi
 * @param {Date} endDate - Bitiş tarihi
 * @returns {Array} - Log verileri array'i
 */
function collectLogsFromFormatTables(employeeFile, startDate, endDate) {
  const logs = [];
  
  try {
    const sheets = employeeFile.getSheets();
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    console.log(`🔍 Format Tablo arama: ${Utilities.formatDate(startDateOnly, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(endDateOnly, 'Europe/Istanbul', 'dd.MM.yyyy')}`);
    
    // Tüm Format Tablo sayfalarını bul
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      // Sistem sayfalarını atla
      if (sheetName.includes('T Randevular') || 
          sheetName.includes('T Fırsatlar') || 
          sheetName.includes('T Toplantılar') ||
          sheetName.includes('T Aktivite') ||
          sheetName.includes('Log Arşivi') ||
          sheetName.includes('Ham veri')) {
        continue;
      }
      
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const aktiviteIndex = headers.indexOf('Aktivite');
      const aktiviteTarihiIndex = headers.indexOf('Aktivite Tarihi') !== -1 ? headers.indexOf('Aktivite Tarihi') : headers.indexOf('Tarih');
      const logIndex = headers.indexOf('Log'); // Log kolonu varsa kullan (yedek kaynak)
      
      // Format Tablo kontrolü: Aktivite + Aktivite Tarihi olmalı (Log kolonu opsiyonel - varsa kullanılır)
      if (aktiviteIndex === -1 || aktiviteTarihiIndex === -1) {
        continue;
      }
      
      // Veri oku (getDisplayValues kullan - tarihler string olarak gelir)
      const lastRow = sheet.getLastRow();
      if (lastRow <= 1) continue;
      
      const data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getDisplayValues();
      
      for (let row = 0; row < data.length; row++) {
        const aktivite = String(data[row][aktiviteIndex] || '').trim();
        if (!aktivite) continue;
        
        // Tarih bul (Log kolonu artık yok - sadece Aktivite Tarihi kullan)
        const aktiviteTarihi = data[row][aktiviteTarihiIndex];
        if (!aktiviteTarihi) continue;
        
        // Tarih parse et
        let logDate = parseDdMmYyyy(aktiviteTarihi);
        if (!logDate) {
          try {
            logDate = new Date(String(aktiviteTarihi));
            if (isNaN(logDate.getTime())) continue;
          } catch (e) {
            continue;
          }
        }
        
        // Tarih filtresi
        const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
        
        // Debug: İlk birkaç log'un tarih kontrolünü göster
        if (logs.length < 5) {
          const dateStr = String(aktiviteTarihi);
          const parsedStr = Utilities.formatDate(logDate, 'Europe/Istanbul', 'dd.MM.yyyy');
          const rangeStr = `${Utilities.formatDate(startDateOnly, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(endDateOnly, 'Europe/Istanbul', 'dd.MM.yyyy')}`;
          const inRange = logDateOnly >= startDateOnly && logDateOnly <= endDateOnly;
          console.log(`🔍 Format Tablo: "${sheetName}" - Tarih="${dateStr}", Parse=${parsedStr}, Aralık=${rangeStr}, Uygun=${inRange}, Aktivite="${aktivite}"`);
        }
        
        if (logDateOnly < startDateOnly || logDateOnly > endDateOnly) continue;
        
        // Log değeri oluştur (STANDART FORMAT: Aktivite - İsim Soyisim - Tarih)
        // Önce Log kolonunu kontrol et (varsa kullan, yoksa standart format oluştur)
        let logValue = '';
        if (logIndex !== -1) {
          logValue = String(data[row][logIndex] || '').trim();
        }
        
        // Eğer Log kolonu yoksa veya boşsa, standart format oluştur (Log Arşivi ile aynı)
        if (!logValue || logValue === '') {
          const isimSoyisimIndex = headers.indexOf('İsim Soyisim');
          const isimSoyisim = isimSoyisimIndex !== -1 ? String(data[row][isimSoyisimIndex] || '').trim() : '';
          
          // Standart format: Aktivite - İsim Soyisim - Tarih (Log Arşivi ile aynı)
          const parts = [aktivite];
          if (isimSoyisim) parts.push(isimSoyisim);
          parts.push(aktiviteTarihi);
          logValue = parts.join(' - ');
        }
        
        logs.push({
          date: aktiviteTarihi,
          log: logValue,
          aktivite: aktivite,
          source: 'Format Tablo',
          sheetName: sheetName
        });
      }
    }
  } catch (error) {
    console.error('❌ Format Tablo\'lardan veri çekme hatası:', error);
  }
  
  return logs;
}

/**
 * 📊 Haftalık rapor verisi toplama
 * Hibrit yaklaşım: Önce Log Arşivi'nden, yoksa Format Tablo'lardan çeker
 */
function collectWeeklyReportData(employeeCodes, weekStart, weekEnd) {
  const reportData = [];
  
  console.log(`📊 collectWeeklyReportData başlatıldı`);
  console.log(`📅 Tarih aralığı: ${Utilities.formatDate(weekStart, 'Europe/Istanbul', 'dd.MM.yyyy HH:mm')} - ${Utilities.formatDate(weekEnd, 'Europe/Istanbul', 'dd.MM.yyyy HH:mm')}`);
  console.log(`👥 Temsilci sayısı: ${employeeCodes.length}`);
  
  // Tüm aktivite türleri
  const allActivities = [
    'Randevu Alındı',
    'İleri Tarih Randevu',
    'Fırsat İletildi',
    'Bilgi Verildi',
    'Yeniden Aranacak',
    'İlgilenmiyor',
    'Ulaşılamadı',
    'Geçersiz Numara',
    'Kurumsal',
    'Toplantı Tamamlandı',
    'Satış Yapıldı'
  ];
  
  for (const code of employeeCodes) {
    try {
      const employeeFile = findEmployeeFile(code);
      if (!employeeFile) {
        console.log(`⚠️ ${code}: Dosya bulunamadı`);
        continue;
      }
      
      // Veri yapısını oluştur - tüm aktiviteler için
      const data = {
        employeeCode: code,
        employeeName: CRM_CONFIG.EMPLOYEE_CODES[code] || code,
        randevuAlindi: 0,
        ileriTarihRandevu: 0,
        firsatIletildi: 0,
        bilgiVerildi: 0,
        yenidenAranacak: 0,
        ilgilenmiyor: 0,
        ulasilamadi: 0,
        gecersizNumara: 0,
        kurumsal: 0,
        toplantiTamamlandi: 0,
        satisYapildi: 0,
        toplamAktivite: 0
      };
      
      // HİBRİT YAKLAŞIM: Önce Log Arşivi'nden, yoksa Format Tablo'lardan çek
      let logsFromArchive = [];
      let logsFromFormatTables = [];
      
      // 1. Log Arşivi'nden veri çek (ÖNCELİKLİ) - Gizli sayfalar dahil
      let logArchiveSheet = employeeFile.getSheetByName('Log Arşivi');
      
      // Gizli sayfaları da kontrol et (esnek arama)
      if (!logArchiveSheet) {
        const allSheets = employeeFile.getSheets();
        for (const sheet of allSheets) {
          const sheetName = sheet.getName().trim();
          if (sheetName === 'Log Arşivi' || 
              sheetName.toLowerCase() === 'log arşivi' ||
              (sheetName.toLowerCase().includes('log') && sheetName.toLowerCase().includes('arşiv'))) {
            logArchiveSheet = sheet;
            break;
          }
        }
      }
      
      if (logArchiveSheet && logArchiveSheet.getLastRow() > 1) {
        console.log(`📊 ${code}: Log Arşivi'nden veri okunuyor...`);
        const allData = logArchiveSheet.getDataRange().getValues();
        
        if (allData.length >= 2) {
          const headers = allData[0];
          const aktiviteTarihiIndex = headers.indexOf('Tarih') !== -1 ? headers.indexOf('Tarih') : headers.indexOf('Aktivite Tarihi');
          const aktiviteIndex = headers.indexOf('Aktivite');
          
          if (aktiviteTarihiIndex !== -1 && aktiviteIndex !== -1) {
            for (let row = 1; row < allData.length; row++) {
              const aktiviteTarihi = allData[row][aktiviteTarihiIndex];
              const aktivite = String(allData[row][aktiviteIndex] || '').trim();
              
              if (!aktiviteTarihi || !aktivite) continue;
              
              // Tarih parse etme
              let logDate = null;
              if (aktiviteTarihi instanceof Date) {
                logDate = new Date(aktiviteTarihi);
              } else {
                logDate = parseDdMmYyyy(aktiviteTarihi);
                if (!logDate) {
                  try {
                    logDate = new Date(String(aktiviteTarihi));
                    if (isNaN(logDate.getTime())) continue;
                  } catch (e) {
                    continue;
                  }
                }
              }
              
              if (!logDate || isNaN(logDate.getTime())) continue;
              
              // Tarih aralığı kontrolü
              const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
              const weekStartOnly = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
              const weekEndOnly = new Date(weekEnd.getFullYear(), weekEnd.getMonth(), weekEnd.getDate());
              
              // Debug: İlk birkaç log'un tarih kontrolünü göster
              if (row <= 5) {
                const dateStr = aktiviteTarihi instanceof Date 
                  ? Utilities.formatDate(aktiviteTarihi, 'Europe/Istanbul', 'dd.MM.yyyy')
                  : String(aktiviteTarihi);
                console.log(`🔍 ${code} - Log[${row}]: Tarih="${dateStr}", Parse=${Utilities.formatDate(logDate, 'Europe/Istanbul', 'dd.MM.yyyy')}, Aralık=${Utilities.formatDate(weekStartOnly, 'Europe/Istanbul', 'dd.MM.yyyy')}-${Utilities.formatDate(weekEndOnly, 'Europe/Istanbul', 'dd.MM.yyyy')}, Uygun=${logDateOnly >= weekStartOnly && logDateOnly <= weekEndOnly}`);
              }
              
              if (logDateOnly >= weekStartOnly && logDateOnly <= weekEndOnly) {
                logsFromArchive.push({
                  date: aktiviteTarihi,
                  aktivite: aktivite,
                  source: 'Log Arşivi'
                });
              }
            }
          }
        }
      }
      
      // 2. Log Arşivi'nde tarih aralığına uygun veri yoksa Format Tablo'lardan çek
      // NOT: Log Arşivi'nde veri varsa bile, eğer tarih aralığına uygun değilse Format Tablo'lardan çek
      if (logsFromArchive.length === 0) {
        console.log(`📊 ${code}: Log Arşivi'nde tarih aralığına uygun veri yok (${logsFromArchive.length} log), Format Tablo'lardan çekiliyor...`);
        logsFromFormatTables = collectLogsFromFormatTables(employeeFile, weekStart, weekEnd);
        console.log(`📊 ${code}: Format Tablo'lardan ${logsFromFormatTables.length} log bulundu`);
      } else {
        console.log(`📊 ${code}: Log Arşivi'nden ${logsFromArchive.length} log bulundu, Format Tablo kontrol edilmedi`);
      }
      
      // 3. İki kaynağı birleştir ve duplicate'leri temizle
      // ÖNEMLİ: Aynı tarih + aktivite kombinasyonu sadece bir kez sayılır
      const allLogs = [...logsFromArchive, ...logsFromFormatTables];
      const uniqueLogs = new Map();
      
      for (const log of allLogs) {
        // Duplicate kontrolü: tarih + aktivite kombinasyonu (aynı gün aynı aktivite = duplicate)
        const dateStr = log.date instanceof Date 
          ? Utilities.formatDate(log.date, 'Europe/Istanbul', 'dd.MM.yyyy')
          : String(log.date);
        const aktiviteStr = String(log.aktivite || '').trim();
        const key = `${dateStr}_${aktiviteStr}`;
        
        // Log Arşivi öncelikli (daha güncel ve doğru)
        if (!uniqueLogs.has(key)) {
          uniqueLogs.set(key, log);
        } else {
          // Eğer mevcut kayıt Format Tablo'dan geliyorsa ve yeni kayıt Log Arşivi'ndense, Log Arşivi'ni kullan
          const existing = uniqueLogs.get(key);
          if (existing.source === 'Format Tablo' && log.source === 'Log Arşivi') {
            uniqueLogs.set(key, log);
          }
        }
      }
      
      const finalLogs = Array.from(uniqueLogs.values());
      console.log(`📊 ${code}: Log Arşivi: ${logsFromArchive.length}, Format Tablo: ${logsFromFormatTables.length}, Toplam (unique): ${finalLogs.length}`);
      
      // 4. Aktivite sayımı
      let activityCounted = 0;
      for (const log of finalLogs) {
        const aktivite = String(log.aktivite || '').trim();
        if (!aktivite) continue;
        
        activityCounted++;
        
        if (aktivite === 'Randevu Alındı') {
          data.randevuAlindi++;
          data.toplamAktivite++;
        } else if (aktivite === 'İleri Tarih Randevu') {
          data.ileriTarihRandevu++;
          data.toplamAktivite++;
        } else if (aktivite === 'Fırsat İletildi') {
          data.firsatIletildi++;
          data.toplamAktivite++;
        } else if (aktivite === 'Bilgi Verildi') {
          data.bilgiVerildi++;
          data.toplamAktivite++;
        } else if (aktivite === 'Yeniden Aranacak') {
          data.yenidenAranacak++;
          data.toplamAktivite++;
        } else if (aktivite === 'İlgilenmiyor') {
          data.ilgilenmiyor++;
          data.toplamAktivite++;
        } else if (aktivite === 'Ulaşılamadı') {
          data.ulasilamadi++;
          data.toplamAktivite++;
        } else if (aktivite === 'Geçersiz Numara') {
          data.gecersizNumara++;
          data.toplamAktivite++;
        } else if (aktivite === 'Kurumsal') {
          data.kurumsal++;
          data.toplamAktivite++;
        } else if (aktivite === 'Toplantı Tamamlandı') {
          data.toplantiTamamlandi++;
          data.toplamAktivite++;
        } else if (aktivite === 'Satış Yapıldı') {
          data.satisYapildi++;
          data.toplamAktivite++;
        }
      }
      
      console.log(`✅ ${code}: Toplam ${activityCounted} aktivite sayıldı, Toplam: ${data.toplamAktivite}`);
      
      reportData.push(data);
    } catch (error) {
      console.error(`❌ ${code} veri toplama hatası:`, error);
      // Hata olsa bile boş data ekle
      reportData.push({
        employeeCode: code,
        employeeName: CRM_CONFIG.EMPLOYEE_CODES[code] || code,
        randevuAlindi: 0,
        ileriTarihRandevu: 0,
        firsatIletildi: 0,
        bilgiVerildi: 0,
        yenidenAranacak: 0,
        ilgilenmiyor: 0,
        ulasilamadi: 0,
        gecersizNumara: 0,
        kurumsal: 0,
        toplantiTamamlandi: 0,
        satisYapildi: 0,
        toplamAktivite: 0
      });
    }
  }
  
  // Mantıklı sıralama: Negatifler → Fırsatlar → Randevu/Toplantı/Satış
  // Sıralama kriteri: Toplam aktiviteye göre (en çoktan en aza)
  reportData.sort((a, b) => {
    // Önce toplam aktiviteye göre
    if (b.toplamAktivite !== a.toplamAktivite) {
      return b.toplamAktivite - a.toplamAktivite;
    }
    // Sonra randevu alındı'ya göre
    return b.randevuAlindi - a.randevuAlindi;
  });
  
  console.log(`📊 Toplam ${reportData.length} temsilci verisi toplandı`);
  return reportData;
}

/**
 * 📊 Aylık rapor verisi toplama
 */
function collectMonthlyReportData(employeeCodes, monthStart, monthEnd) {
  // Haftalık ile aynı mantık, sadece tarih aralığı farklı
  return collectWeeklyReportData(employeeCodes, monthStart, monthEnd);
}

/**
 * 📊 Günlük rapor verisi toplama
 */
function collectDailyReportData(employeeCodes, dayStart, dayEnd) {
  // Haftalık ile aynı mantık, sadece tarih aralığı farklı
  return collectWeeklyReportData(employeeCodes, dayStart, dayEnd);
}

/**
 * 📊 Haftalık Rapor Sayfası Oluştur
 */
function createWeeklyReportSheet(ss, reportData, weekLabel, weekStart, weekEnd, scope, employeeCode = null) {
  try {
    const sheetName = scope === 'all' 
      ? '📊 Haftalık Rapor - Genel'
      : `📊 Haftalık Rapor - ${employeeCode}`;
    
    let sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      ss.deleteSheet(sheet);
    }
    sheet = ss.insertSheet(sheetName);
    
    let currentRow = 1;
    
    // Başlık
    sheet.getRange(currentRow, 1).setValue(`📊 HAFTALIK PERFORMANS RAPORU`);
    sheet.getRange(currentRow, 1, 1, 10).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(18).setBackground('#1976D2').setFontColor('#FFFFFF');
    currentRow++;
    
    sheet.getRange(currentRow, 1).setValue(weekLabel);
    sheet.getRange(currentRow, 1, 1, 10).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#E3F2FD');
    currentRow += 2;
    
    // Tablo başlıkları - Mantıklı sıralama: Negatifler → Fırsatlar → Randevu/Toplantı/Satış
    // Her aktivite için 2 kolon: Sayı ve Oran
    const activityHeaders = [
      // Negatifler
      { name: 'İlgilenmiyor', key: 'ilgilenmiyor', base: 'toplamAktivite' },
      { name: 'Ulaşılamadı', key: 'ulasilamadi', base: 'toplamAktivite' },
      { name: 'Geçersiz Numara', key: 'gecersizNumara', base: 'toplamAktivite' },
      { name: 'Kurumsal', key: 'kurumsal', base: 'toplamAktivite' },
      // Fırsatlar
      { name: 'Yeniden Aranacak', key: 'yenidenAranacak', base: 'toplamAktivite' },
      { name: 'Bilgi Verildi', key: 'bilgiVerildi', base: 'toplamAktivite' },
      { name: 'Fırsat İletildi', key: 'firsatIletildi', base: 'toplamAktivite' },
      // Randevu/Toplantı/Satış
      { name: 'Randevu Alındı', key: 'randevuAlindi', base: 'toplamAktivite' },
      { name: 'İleri Tarih Randevu', key: 'ileriTarihRandevu', base: 'toplamAktivite' },
      { name: 'Toplantı Tamamlandı', key: 'toplantiTamamlandi', base: 'randevuAlindi' },
      { name: 'Satış Yapıldı', key: 'satisYapildi', base: 'toplantiTamamlandi' },
      { name: 'Toplam Aktivite', key: 'toplamAktivite', base: null }
    ];
    
    // Header satırı: Aktivite isimleri
    sheet.getRange(currentRow, 1).setValue('Temsilci');
    let col = 2;
    for (const header of activityHeaders) {
      sheet.getRange(currentRow, col).setValue(header.name);
      // Toplam Aktivite için merge yapma (sadece 1 kolon)
      if (header.key !== 'toplamAktivite') {
        sheet.getRange(currentRow, col, 1, 2).merge(); // Sayı ve oran için merge
      }
      col += 2;
    }
    
    sheet.getRange(currentRow, 1, 1, col - 1)
      .setFontWeight('bold')
      .setFontSize(11)
      .setBackground('#4CAF50')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
    currentRow++;
    
    // Alt başlık: Sayı / Oran
    sheet.getRange(currentRow, 1).setValue('');
    col = 2;
    for (const header of activityHeaders) {
      if (header.key === 'toplamAktivite') {
        sheet.getRange(currentRow, col).setValue('Toplam');
      } else {
        sheet.getRange(currentRow, col).setValue('Sayı');
        sheet.getRange(currentRow, col + 1).setValue('Oran');
      }
      col += 2;
    }
    sheet.getRange(currentRow, 1, 1, col - 1)
      .setFontWeight('bold')
      .setFontSize(10)
      .setBackground('#81C784')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
    currentRow++;
    
    // Verileri yaz
    for (const data of reportData) {
      sheet.getRange(currentRow, 1).setValue(`${data.employeeCode} - ${data.employeeName}`);
      
      col = 2;
      for (const header of activityHeaders) {
        const value = data[header.key] || 0;
        
        if (header.key === 'toplamAktivite') {
          // Toplam Aktivite için sadece sayı
          sheet.getRange(currentRow, col).setValue(value);
          sheet.getRange(currentRow, col).setHorizontalAlignment('right');
        } else {
          // Sayı
          sheet.getRange(currentRow, col).setValue(value);
          sheet.getRange(currentRow, col).setHorizontalAlignment('right');
          
          // Oran hesapla
          let percentage = 0;
          let baseValue = 0;
          if (header.base === 'toplamAktivite') {
            baseValue = data.toplamAktivite || 0;
            percentage = baseValue > 0 ? (value / baseValue) * 100 : 0;
          } else if (header.base === 'randevuAlindi') {
            baseValue = data.randevuAlindi || 0;
            percentage = baseValue > 0 ? (value / baseValue) * 100 : 0;
          } else if (header.base === 'toplantiTamamlandi') {
            baseValue = data.toplantiTamamlandi || 0;
            percentage = baseValue > 0 ? (value / baseValue) * 100 : 0;
          }
          
          const percentageText = percentage > 0 ? `%${percentage.toFixed(1)}` : '-';
          sheet.getRange(currentRow, col + 1).setValue(percentageText);
          sheet.getRange(currentRow, col + 1).setHorizontalAlignment('right');
          sheet.getRange(currentRow, col + 1).setFontStyle('italic');
        }
        
        col += 2;
      }
      
      // Çift satırlar için alternatif renk
      if (currentRow % 2 === 0) {
        sheet.getRange(currentRow, 1, 1, col - 1).setBackground('#F1F8E9');
      }
      
      currentRow++;
    }
    
    // Açıklama satırı
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('📊 Oran Açıklaması:');
    sheet.getRange(currentRow, 1).setFontWeight('bold');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Negatifler (İlgilenmiyor, Ulaşılamadı, Geçersiz Numara, Kurumsal): Toplam aramaya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Fırsatlar (Yeniden Aranacak, Bilgi Verildi, Fırsat İletildi): Toplam aramaya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Randevu Alındı: Toplam aramaya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Toplantı Tamamlandı: Randevu Alındı\'ya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Satış Yapıldı: Toplantı Tamamlandı\'ya göre');
    
    // Kolon genişlikleri - Her aktivite için 2 kolon (sayı + oran)
    sheet.setColumnWidth(1, 200); // Temsilci
    col = 2;
    for (const header of activityHeaders) {
      if (header.key === 'toplamAktivite') {
        sheet.setColumnWidth(col, 100);
      } else {
        sheet.setColumnWidth(col, 80); // Sayı
        sheet.setColumnWidth(col + 1, 70); // Oran
      }
      col += 2;
    }
    
    sheet.activate();
    console.log('✅ Haftalık rapor oluşturuldu');
  } catch (error) {
    console.error('❌ Haftalık rapor sayfası hatası:', error);
    throw error;
  }
}

/**
 * 📊 Aylık Rapor Sayfası Oluştur
 */
function createMonthlyReportSheet(ss, reportData, monthLabel, monthStart, monthEnd, scope, employeeCode = null) {
  try {
    const sheetName = scope === 'all' 
      ? '📊 Aylık Rapor - Genel'
      : `📊 Aylık Rapor - ${employeeCode}`;
    
    let sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      ss.deleteSheet(sheet);
    }
    sheet = ss.insertSheet(sheetName);
    
    let currentRow = 1;
    
    // Başlık
    sheet.getRange(currentRow, 1).setValue(`📊 AYLIK PERFORMANS RAPORU`);
    sheet.getRange(currentRow, 1, 1, 10).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(18).setBackground('#FF9800').setFontColor('#FFFFFF');
    currentRow++;
    
    sheet.getRange(currentRow, 1).setValue(monthLabel);
    sheet.getRange(currentRow, 1, 1, 10).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#FFE0B2');
    currentRow += 2;
    
    // Tablo başlıkları - Mantıklı sıralama: Negatifler → Fırsatlar → Randevu/Toplantı/Satış
    const activityHeaders = [
      { name: 'İlgilenmiyor', key: 'ilgilenmiyor', base: 'toplamAktivite' },
      { name: 'Ulaşılamadı', key: 'ulasilamadi', base: 'toplamAktivite' },
      { name: 'Geçersiz Numara', key: 'gecersizNumara', base: 'toplamAktivite' },
      { name: 'Kurumsal', key: 'kurumsal', base: 'toplamAktivite' },
      { name: 'Yeniden Aranacak', key: 'yenidenAranacak', base: 'toplamAktivite' },
      { name: 'Bilgi Verildi', key: 'bilgiVerildi', base: 'toplamAktivite' },
      { name: 'Fırsat İletildi', key: 'firsatIletildi', base: 'toplamAktivite' },
      { name: 'Randevu Alındı', key: 'randevuAlindi', base: 'toplamAktivite' },
      { name: 'İleri Tarih Randevu', key: 'ileriTarihRandevu', base: 'toplamAktivite' },
      { name: 'Toplantı Tamamlandı', key: 'toplantiTamamlandi', base: 'randevuAlindi' },
      { name: 'Satış Yapıldı', key: 'satisYapildi', base: 'toplantiTamamlandi' },
      { name: 'Toplam Aktivite', key: 'toplamAktivite', base: null }
    ];
    
    // Header satırı
    sheet.getRange(currentRow, 1).setValue('Temsilci');
    let col = 2;
    for (const header of activityHeaders) {
      sheet.getRange(currentRow, col).setValue(header.name);
      // Toplam Aktivite için merge yapma (sadece 1 kolon)
      if (header.key !== 'toplamAktivite') {
        sheet.getRange(currentRow, col, 1, 2).merge();
      }
      col += 2;
    }
    
    sheet.getRange(currentRow, 1, 1, col - 1)
      .setFontWeight('bold')
      .setFontSize(11)
      .setBackground('#FF9800')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
    currentRow++;
    
    // Alt başlık
    sheet.getRange(currentRow, 1).setValue('');
    col = 2;
    for (const header of activityHeaders) {
      if (header.key === 'toplamAktivite') {
        sheet.getRange(currentRow, col).setValue('Toplam');
      } else {
        sheet.getRange(currentRow, col).setValue('Sayı');
        sheet.getRange(currentRow, col + 1).setValue('Oran');
      }
      col += 2;
    }
    sheet.getRange(currentRow, 1, 1, col - 1)
      .setFontWeight('bold')
      .setFontSize(10)
      .setBackground('#FFB74D')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
    currentRow++;
    
    // Verileri yaz
    for (const data of reportData) {
      sheet.getRange(currentRow, 1).setValue(`${data.employeeCode} - ${data.employeeName}`);
      
      col = 2;
      for (const header of activityHeaders) {
        const value = data[header.key] || 0;
        
        if (header.key === 'toplamAktivite') {
          sheet.getRange(currentRow, col).setValue(value);
          sheet.getRange(currentRow, col).setHorizontalAlignment('right');
        } else {
          sheet.getRange(currentRow, col).setValue(value);
          sheet.getRange(currentRow, col).setHorizontalAlignment('right');
          
          let percentage = 0;
          let baseValue = 0;
          if (header.base === 'toplamAktivite') {
            baseValue = data.toplamAktivite || 0;
            percentage = baseValue > 0 ? (value / baseValue) * 100 : 0;
          } else if (header.base === 'randevuAlindi') {
            baseValue = data.randevuAlindi || 0;
            percentage = baseValue > 0 ? (value / baseValue) * 100 : 0;
          } else if (header.base === 'toplantiTamamlandi') {
            baseValue = data.toplantiTamamlandi || 0;
            percentage = baseValue > 0 ? (value / baseValue) * 100 : 0;
          }
          
          const percentageText = percentage > 0 ? `%${percentage.toFixed(1)}` : '-';
          sheet.getRange(currentRow, col + 1).setValue(percentageText);
          sheet.getRange(currentRow, col + 1).setHorizontalAlignment('right');
          sheet.getRange(currentRow, col + 1).setFontStyle('italic');
        }
        
        col += 2;
      }
      
      if (currentRow % 2 === 0) {
        sheet.getRange(currentRow, 1, 1, col - 1).setBackground('#FFF3E0');
      }
      
      currentRow++;
    }
    
    // Açıklama satırı
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('📊 Oran Açıklaması:');
    sheet.getRange(currentRow, 1).setFontWeight('bold');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Negatifler (İlgilenmiyor, Ulaşılamadı, Geçersiz Numara, Kurumsal): Toplam aramaya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Fırsatlar (Yeniden Aranacak, Bilgi Verildi, Fırsat İletildi): Toplam aramaya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Randevu Alındı: Toplam aramaya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Toplantı Tamamlandı: Randevu Alındı\'ya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Satış Yapıldı: Toplantı Tamamlandı\'ya göre');
    
    // Kolon genişlikleri - Her aktivite için 2 kolon (sayı + oran)
    sheet.setColumnWidth(1, 200); // Temsilci
    col = 2;
    for (const header of activityHeaders) {
      if (header.key === 'toplamAktivite') {
        sheet.setColumnWidth(col, 100);
      } else {
        sheet.setColumnWidth(col, 80); // Sayı
        sheet.setColumnWidth(col + 1, 70); // Oran
      }
      col += 2;
    }
    
    sheet.activate();
    console.log('✅ Aylık rapor oluşturuldu');
  } catch (error) {
    console.error('❌ Aylık rapor sayfası hatası:', error);
    throw error;
  }
}

/**
 * 📊 Günlük Rapor Sayfası Oluştur
 */
function createDailyReportSheet(ss, reportData, dayLabel, dayStart, dayEnd, scope, employeeCode = null) {
  try {
    const sheetName = scope === 'all' 
      ? '📊 Günlük Rapor - Genel'
      : `📊 Günlük Rapor - ${employeeCode}`;
    
    let sheet = ss.getSheetByName(sheetName);
    if (sheet) {
      ss.deleteSheet(sheet);
    }
    sheet = ss.insertSheet(sheetName);
    
    let currentRow = 1;
    
    // Başlık
    sheet.getRange(currentRow, 1).setValue(`📊 GÜNLÜK PERFORMANS RAPORU`);
    sheet.getRange(currentRow, 1, 1, 10).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(18).setBackground('#9C27B0').setFontColor('#FFFFFF');
    currentRow++;
    
    sheet.getRange(currentRow, 1).setValue(dayLabel);
    sheet.getRange(currentRow, 1, 1, 10).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#E1BEE7');
    currentRow += 2;
    
    // Tablo başlıkları - Mantıklı sıralama: Negatifler → Fırsatlar → Randevu/Toplantı/Satış
    const activityHeaders = [
      { name: 'İlgilenmiyor', key: 'ilgilenmiyor', base: 'toplamAktivite' },
      { name: 'Ulaşılamadı', key: 'ulasilamadi', base: 'toplamAktivite' },
      { name: 'Geçersiz Numara', key: 'gecersizNumara', base: 'toplamAktivite' },
      { name: 'Kurumsal', key: 'kurumsal', base: 'toplamAktivite' },
      { name: 'Yeniden Aranacak', key: 'yenidenAranacak', base: 'toplamAktivite' },
      { name: 'Bilgi Verildi', key: 'bilgiVerildi', base: 'toplamAktivite' },
      { name: 'Fırsat İletildi', key: 'firsatIletildi', base: 'toplamAktivite' },
      { name: 'Randevu Alındı', key: 'randevuAlindi', base: 'toplamAktivite' },
      { name: 'İleri Tarih Randevu', key: 'ileriTarihRandevu', base: 'toplamAktivite' },
      { name: 'Toplantı Tamamlandı', key: 'toplantiTamamlandi', base: 'randevuAlindi' },
      { name: 'Satış Yapıldı', key: 'satisYapildi', base: 'toplantiTamamlandi' },
      { name: 'Toplam Aktivite', key: 'toplamAktivite', base: null }
    ];
    
    // Header satırı
    sheet.getRange(currentRow, 1).setValue('Temsilci');
    let col = 2;
    for (const header of activityHeaders) {
      sheet.getRange(currentRow, col).setValue(header.name);
      // Toplam Aktivite için merge yapma (sadece 1 kolon)
      if (header.key !== 'toplamAktivite') {
        sheet.getRange(currentRow, col, 1, 2).merge();
      }
      col += 2;
    }
    
    sheet.getRange(currentRow, 1, 1, col - 1)
      .setFontWeight('bold')
      .setFontSize(11)
      .setBackground('#9C27B0')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
    currentRow++;
    
    // Alt başlık
    sheet.getRange(currentRow, 1).setValue('');
    col = 2;
    for (const header of activityHeaders) {
      if (header.key === 'toplamAktivite') {
        sheet.getRange(currentRow, col).setValue('Toplam');
      } else {
        sheet.getRange(currentRow, col).setValue('Sayı');
        sheet.getRange(currentRow, col + 1).setValue('Oran');
      }
      col += 2;
    }
    sheet.getRange(currentRow, 1, 1, col - 1)
      .setFontWeight('bold')
      .setFontSize(10)
      .setBackground('#BA68C8')
      .setFontColor('#FFFFFF')
      .setHorizontalAlignment('center');
    currentRow++;
    
    // Verileri yaz
    for (const data of reportData) {
      sheet.getRange(currentRow, 1).setValue(`${data.employeeCode} - ${data.employeeName}`);
      
      col = 2;
      for (const header of activityHeaders) {
        const value = data[header.key] || 0;
        
        if (header.key === 'toplamAktivite') {
          sheet.getRange(currentRow, col).setValue(value);
          sheet.getRange(currentRow, col).setHorizontalAlignment('right');
        } else {
          sheet.getRange(currentRow, col).setValue(value);
          sheet.getRange(currentRow, col).setHorizontalAlignment('right');
          
          let percentage = 0;
          let baseValue = 0;
          if (header.base === 'toplamAktivite') {
            baseValue = data.toplamAktivite || 0;
            percentage = baseValue > 0 ? (value / baseValue) * 100 : 0;
          } else if (header.base === 'randevuAlindi') {
            baseValue = data.randevuAlindi || 0;
            percentage = baseValue > 0 ? (value / baseValue) * 100 : 0;
          } else if (header.base === 'toplantiTamamlandi') {
            baseValue = data.toplantiTamamlandi || 0;
            percentage = baseValue > 0 ? (value / baseValue) * 100 : 0;
          }
          
          const percentageText = percentage > 0 ? `%${percentage.toFixed(1)}` : '-';
          sheet.getRange(currentRow, col + 1).setValue(percentageText);
          sheet.getRange(currentRow, col + 1).setHorizontalAlignment('right');
          sheet.getRange(currentRow, col + 1).setFontStyle('italic');
        }
        
        col += 2;
      }
      
      if (currentRow % 2 === 0) {
        sheet.getRange(currentRow, 1, 1, col - 1).setBackground('#F3E5F5');
      }
      
      currentRow++;
    }
    
    // Açıklama satırı
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('📊 Oran Açıklaması:');
    sheet.getRange(currentRow, 1).setFontWeight('bold');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Negatifler (İlgilenmiyor, Ulaşılamadı, Geçersiz Numara, Kurumsal): Toplam aramaya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Fırsatlar (Yeniden Aranacak, Bilgi Verildi, Fırsat İletildi): Toplam aramaya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Randevu Alındı: Toplam aramaya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Toplantı Tamamlandı: Randevu Alındı\'ya göre');
    currentRow++;
    sheet.getRange(currentRow, 1).setValue('• Satış Yapıldı: Toplantı Tamamlandı\'ya göre');
    
    // Kolon genişlikleri - Her aktivite için 2 kolon (sayı + oran)
    sheet.setColumnWidth(1, 200); // Temsilci
    col = 2;
    for (const header of activityHeaders) {
      if (header.key === 'toplamAktivite') {
        sheet.setColumnWidth(col, 100);
      } else {
        sheet.setColumnWidth(col, 80); // Sayı
        sheet.setColumnWidth(col + 1, 70); // Oran
      }
      col += 2;
    }
    
    sheet.activate();
    console.log('✅ Günlük rapor oluşturuldu');
  } catch (error) {
    console.error('❌ Günlük rapor sayfası hatası:', error);
    throw error;
  }
}

/**
 * 👤 Temsilci kodu seçimi için prompt
 */
function promptEmployeeCodeForReports() {
  const ui = SpreadsheetApp.getUi();
  const employeeCodes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
  const employeeList = employeeCodes.map(code => `${code} - ${CRM_CONFIG.EMPLOYEE_CODES[code]}`).join('\n');
  
  const response = ui.prompt(
    'Temsilci Seçin',
    `Lütfen temsilci kodunu girin:\n\n${employeeList}`,
    ui.ButtonSet.OK_CANCEL
  );
  
  if (response.getSelectedButton() === ui.Button.OK) {
    const code = response.getResponseText().trim();
    if (employeeCodes.includes(code)) {
      return code;
    } else {
      ui.alert('Hata', 'Geçersiz temsilci kodu!', ui.ButtonSet.OK);
      return null;
    }
  }
  
  return null;
}

function recolorTRandevularOnly(){ try{ const ss=SpreadsheetApp.getActiveSpreadsheet(); const sh=ss.getSheetByName('T Randevular'); if(sh && sh.getLastRow()>1){ applyColorCodingToManagerData(sh,'T Randevular',2,sh.getLastRow()-1); SpreadsheetApp.getUi().alert('Tamam','T Randevular renklendirildi.',SpreadsheetApp.getUi().ButtonSet.OK);} else { SpreadsheetApp.getUi().alert('Uyarı','T Randevular sayfası bulunamadı veya boş.',SpreadsheetApp.getUi().ButtonSet.OK);} }catch(e){ SpreadsheetApp.getUi().alert('Hata', String(e && e.message || e), SpreadsheetApp.getUi().ButtonSet.OK);} }
function recolorTFirsatlarOnly(){ try{ const ss=SpreadsheetApp.getActiveSpreadsheet(); const sh=ss.getSheetByName('T Fırsatlar'); if(sh && sh.getLastRow()>1){ applyColorCodingToManagerData(sh,'T Fırsatlar',2,sh.getLastRow()-1); SpreadsheetApp.getUi().alert('Tamam','T Fırsatlar renklendirildi.',SpreadsheetApp.getUi().ButtonSet.OK);} else { SpreadsheetApp.getUi().alert('Uyarı','T Fırsatlar sayfası bulunamadı veya boş.',SpreadsheetApp.getUi().ButtonSet.OK);} }catch(e){ SpreadsheetApp.getUi().alert('Hata', String(e && e.message || e), SpreadsheetApp.getUi().ButtonSet.OK);} }
function recolorTToplantilarOnly(){ try{ const ss=SpreadsheetApp.getActiveSpreadsheet(); const sh=ss.getSheetByName('T Toplantılar'); if(sh && sh.getLastRow()>1){ applyColorCodingToManagerData(sh,'T Toplantılar',2,sh.getLastRow()-1); SpreadsheetApp.getUi().alert('Tamam','T Toplantılar renklendirildi.',SpreadsheetApp.getUi().ButtonSet.OK);} else { SpreadsheetApp.getUi().alert('Uyarı','T Toplantılar sayfası bulunamadı veya boş.',SpreadsheetApp.getUi().ButtonSet.OK);} }catch(e){ SpreadsheetApp.getUi().alert('Hata', String(e && e.message || e), SpreadsheetApp.getUi().ButtonSet.OK);} }

function highlightDuplicateMeetingsByCompany(){
  console.log('Function started:', { action: 'highlightDuplicateMeetingsByCompany' });
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('T Toplantılar') || ss.getActiveSheet();
    if (!sheet) { SpreadsheetApp.getUi().alert('Hata','Sayfa bulunamadı', SpreadsheetApp.getUi().ButtonSet.OK); return; }
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 2 || lastCol < 1) { SpreadsheetApp.getUi().alert('Uyarı','Veri yok', SpreadsheetApp.getUi().ButtonSet.OK); return; }
    const headers = sheet.getRange(1,1,1,lastCol).getDisplayValues()[0];
    const lowered = headers.map(h => String(h||'').trim().toLowerCase());
    function findIdx(cands){ for(const c of cands){ const i = lowered.indexOf(String(c).trim().toLowerCase()); if(i!==-1) return i; } return -1; }
    const idxCompany = findIdx(['company name','firma','şirket','sirket']);
    const idxDate    = findIdx(['toplantı tarihi','toplanti tarihi','tarih']);
    const idxTime    = findIdx(['saat']);
    if (idxCompany === -1) { SpreadsheetApp.getUi().alert('Hata','Company name sütunu bulunamadı', SpreadsheetApp.getUi().ButtonSet.OK); return; }

    const values = sheet.getRange(2,1,lastRow-1,lastCol).getDisplayValues();
    function canon(s){ return String(s||'').replace(/\s+/g,' ').trim().toLowerCase(); }
    function parseDate(v){
      if (v instanceof Date && !isNaN(v.getTime())) return v;
      const s = String(v||'').trim();
      const m = s.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (m){ return new Date(Number(m[3]), Number(m[2])-1, Number(m[1])); }
      const d = new Date(s); return isNaN(d.getTime()) ? null : d;
    }
    function minutes(v){
      if (v instanceof Date && !isNaN(v.getTime())) return v.getHours()*60+v.getMinutes();
      const s = String(v||'').trim(); const m = s.match(/(\d{1,2}):(\d{2})/); return m? Number(m[1])*60+Number(m[2]) : 0;
    }

    // Grupla: key = şirket
    const groups = new Map();
    for (let r=0;r<values.length;r++){
      const row = values[r];
      const key = canon(row[idxCompany]);
      if (!key) continue;
      const d = idxDate>=0 ? parseDate(row[idxDate]) : null;
      const t = idxTime>=0 ? minutes(row[idxTime]) : 0;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push({r:r+2, d, t});
    }

    const dupColor   = (CRM_CONFIG && CRM_CONFIG.COLOR_CODES && CRM_CONFIG.COLOR_CODES['Çift Kayıt']) || 'rgb(255, 249, 196)';
    const masterColor= CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'] || 'rgb(200, 230, 201)';
    let masters = 0, dups = 0;

    groups.forEach(list => {
      if (list.length <= 1) return;
      // En eski (tarih+saat) MASTER, geri kalan DUP
      list.sort((a,b)=>{
        const da = a.d ? a.d.getTime() : Number.POSITIVE_INFINITY;
        const db = b.d ? b.d.getTime() : Number.POSITIVE_INFINITY;
        if (da !== db) return da - db;
        return a.t - b.t;
      });
      const master = list[0];
      sheet.getRange(master.r, 1, 1, lastCol).setBackground(masterColor).setNote(''); masters++;
      for (let i=1;i<list.length;i++){
        const noteText = `DUPE OF #${master.r}`;
        sheet.getRange(list[i].r, 1, 1, lastCol).setBackground(dupColor).setNote(noteText); dups++;
      }
    });

    SpreadsheetApp.getUi().alert('Tamam', `Gruplar işaretlendi. Master: ${masters}, Çift: ${dups}`, SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// ========================================
// 📊 FUNNEL REPORT SYSTEM - YENİ FUNNEL RAPORU
// ========================================

/**
 * 📊 Funnel Raporu Dialog'unu Göster
 * Modern HTML dialog ile zaman filtresi ve temsilci seçimi
 */
function showFunnelReportDialog() {
  console.log('📊 Funnel Raporu başlatıldı');
  try {
    const ui = SpreadsheetApp.getUi();
    if (!ui) {
      throw new Error('UI erişilemiyor');
    }
    
    // HTML Dialog içeriği (Material Design)
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>📊 Funnel Raporu</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 24px;
      text-align: center;
    }
    .header h2 {
      font-size: 24px;
      font-weight: 500;
      margin: 0;
    }
    .header p {
      font-size: 14px;
      opacity: 0.9;
      margin-top: 8px;
    }
    .content {
      padding: 24px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
    }
    select, input[type="date"] {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.3s;
      background: white;
    }
    select:focus, input[type="date"]:focus {
      outline: none;
      border-color: #667eea;
    }
    .radio-group {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .radio-item {
      flex: 1;
      min-width: 120px;
    }
    .radio-item input[type="radio"] {
      display: none;
    }
    .radio-item label {
      display: block;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      font-weight: 500;
    }
    .radio-item input[type="radio"]:checked + label {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-color: #667eea;
    }
    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }
    button {
      flex: 1;
      padding: 14px 24px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .btn-secondary {
      background: #f5f5f5;
      color: #666;
    }
    .btn-secondary:hover {
      background: #e0e0e0;
    }
    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .info-box {
      background: #e3f2fd;
      border-left: 4px solid #2196F3;
      padding: 12px;
      border-radius: 4px;
      margin-top: 16px;
      font-size: 13px;
      color: #1976D2;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>📊 Funnel Raporu</h2>
      <p>Pozitif ve Negatif Funnel Analizi</p>
    </div>
    <div class="content">
      <div class="form-group">
        <label>⏰ Zaman Filtresi:</label>
        <div class="radio-group">
          <div class="radio-item">
            <input type="radio" id="daily" name="timeFilter" value="daily" checked>
            <label for="daily">📅 Günlük</label>
          </div>
          <div class="radio-item">
            <input type="radio" id="weekly" name="timeFilter" value="weekly">
            <label for="weekly">📆 Haftalık</label>
          </div>
          <div class="radio-item">
            <input type="radio" id="monthly" name="timeFilter" value="monthly">
            <label for="monthly">📊 Aylık</label>
          </div>
        </div>
      </div>
      
      <!-- Günlük seçenekleri -->
      <div class="form-group" id="dailyOptions" style="display: block;">
        <label for="dailyFilter">📅 Günlük Seçenek:</label>
        <select id="dailyFilter">
          <option value="today">Bugün</option>
          <option value="yesterday">Dün</option>
          <option value="dateRange">Tarih Aralığı</option>
        </select>
      </div>
      
      <!-- Haftalık seçenekleri -->
      <div class="form-group" id="weeklyOptions" style="display: none;">
        <label for="weeklyFilter">📆 Haftalık Seçenek:</label>
        <select id="weeklyFilter">
          <option value="thisWeek">Bu Hafta</option>
          <option value="lastWeek">Geçen Hafta</option>
          <option value="weekList">Hafta Listesi</option>
        </select>
      </div>
      
      <!-- Aylık seçenekleri -->
      <div class="form-group" id="monthlyOptions" style="display: none;">
        <label for="monthlyFilter">📊 Aylık Seçenek:</label>
        <select id="monthlyFilter">
          <option value="thisMonth">Bu Ay</option>
          <option value="lastMonth">Geçen Ay</option>
          <option value="monthList">Ay Listesi</option>
        </select>
      </div>
      
      <!-- Tarih aralığı (Günlük için) -->
      <div class="form-group" id="dateRangeGroup" style="display: none;">
        <label for="startDate">Başlangıç Tarihi:</label>
        <input type="date" id="startDate">
        <label for="endDate" style="margin-top: 10px;">Bitiş Tarihi:</label>
        <input type="date" id="endDate">
      </div>
      
      <!-- Hafta listesi (Haftalık için) -->
      <div class="form-group" id="weekListGroup" style="display: none;">
        <label for="weekSelect">Hafta Seç:</label>
        <select id="weekSelect">
          <option value="">Yükleniyor...</option>
        </select>
      </div>
      
      <!-- Ay listesi (Aylık için) -->
      <div class="form-group" id="monthListGroup" style="display: none;">
        <label for="monthSelect">Ay Seç:</label>
        <select id="monthSelect">
          <option value="">Yükleniyor...</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="filterType">👥 Filtre Tipi:</label>
        <select id="filterType">
          <option value="temsilci">Portföy Uzmanı</option>
          <option value="portfoy">Portföy Yöneticisi</option>
          <option value="bolge">Bölge Yöneticisi</option>
        </select>
      </div>
      
      <div class="form-group" id="temsilciGroup">
        <label for="employeeSelect">👤 Portföy Uzmanı Seçimi:</label>
        <select id="employeeSelect">
          <option value="ALL">Tüm Portföy Uzmanları</option>
        </select>
      </div>
      
      <div class="form-group" id="portfoyGroup" style="display: none;">
        <label for="portfoySelect">👔 Portföy Yöneticisi Seçimi:</label>
        <select id="portfoySelect">
          <option value="ALL">Tüm Portföy Yöneticileri</option>
        </select>
      </div>
      
      <div class="form-group" id="bolgeGroup" style="display: none;">
        <label for="bolgeSelect">🌍 Bölge Yöneticisi:</label>
        <select id="bolgeSelect">
          <option value="ALL">Tüm Satış Yapanlar</option>
        </select>
      </div>
      
      <div class="form-group" id="sortGroup" style="display: none;">
        <label for="sortSelect">📊 Sıralama Metriği:</label>
        <select id="sortSelect">
          <option value="Satış">Satış</option>
          <option value="Toplantı">Toplantı</option>
          <option value="Randevu">Randevu</option>
          <option value="Fırsat">Fırsat</option>
          <option value="Arama">Arama</option>
        </select>
      </div>
      
      <div class="info-box">
        <strong>ℹ️ Bilgi:</strong> Rapor, Gizli Log Arşivi'nden veri çeker. Log eksikse yedek kaynaklar (Randevularım, Fırsatlarım, Toplantılarım) kullanılır.
      </div>
      
      <div class="button-group">
        <button class="btn-secondary" onclick="cancel()">İptal</button>
        <button class="btn-primary" onclick="submit()" id="submitBtn">Rapor Oluştur</button>
      </div>
    </div>
  </div>

  <script>
    // Zaman filtresi değiştiğinde seçenekleri göster/gizle
    document.querySelectorAll('input[name="timeFilter"]').forEach(function(radio) {
      radio.addEventListener('change', function() {
        const timeFilter = this.value;
        const dailyOptions = document.getElementById('dailyOptions');
        const weeklyOptions = document.getElementById('weeklyOptions');
        const monthlyOptions = document.getElementById('monthlyOptions');
        const dateRangeGroup = document.getElementById('dateRangeGroup');
        const weekListGroup = document.getElementById('weekListGroup');
        const monthListGroup = document.getElementById('monthListGroup');
        
        // Tüm seçenekleri gizle
        dailyOptions.style.display = 'none';
        weeklyOptions.style.display = 'none';
        monthlyOptions.style.display = 'none';
        dateRangeGroup.style.display = 'none';
        weekListGroup.style.display = 'none';
        monthListGroup.style.display = 'none';
        
        // Seçilen filtreye göre göster
        if (timeFilter === 'daily') {
          dailyOptions.style.display = 'block';
          updateDailyOptions();
        } else if (timeFilter === 'weekly') {
          weeklyOptions.style.display = 'block';
          updateWeeklyOptions();
        } else if (timeFilter === 'monthly') {
          monthlyOptions.style.display = 'block';
          updateMonthlyOptions();
        }
      });
    });
    
    // Günlük seçenekleri güncelle
    function updateDailyOptions() {
      const dailyFilter = document.getElementById('dailyFilter');
      const dateRangeGroup = document.getElementById('dateRangeGroup');
      
      if (dailyFilter.value === 'dateRange') {
        dateRangeGroup.style.display = 'block';
        // Bugünün tarihini varsayılan yap
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
        document.getElementById('endDate').value = today;
      } else {
        dateRangeGroup.style.display = 'none';
      }
    }
    
    document.getElementById('dailyFilter').addEventListener('change', updateDailyOptions);
    
    // Haftalık seçenekleri güncelle
    function updateWeeklyOptions() {
      const weeklyFilter = document.getElementById('weeklyFilter');
      const weekListGroup = document.getElementById('weekListGroup');
      
      if (weeklyFilter.value === 'weekList') {
        weekListGroup.style.display = 'block';
        loadWeekList();
      } else {
        weekListGroup.style.display = 'none';
      }
    }
    
    document.getElementById('weeklyFilter').addEventListener('change', updateWeeklyOptions);
    
    // Aylık seçenekleri güncelle
    function updateMonthlyOptions() {
      const monthlyFilter = document.getElementById('monthlyFilter');
      const monthListGroup = document.getElementById('monthListGroup');
      
      if (monthlyFilter.value === 'monthList') {
        monthListGroup.style.display = 'block';
        loadMonthList();
      } else {
        monthListGroup.style.display = 'none';
      }
    }
    
    document.getElementById('monthlyFilter').addEventListener('change', updateMonthlyOptions);
    
    // Hafta listesini yükle
    function loadWeekList() {
      google.script.run
        .withSuccessHandler(function(weeks) {
          const select = document.getElementById('weekSelect');
          select.innerHTML = '<option value="">Hafta Seçin</option>';
          weeks.forEach(function(week) {
            const option = document.createElement('option');
            option.value = week.value;
            option.textContent = week.label;
            select.appendChild(option);
          });
        })
        .withFailureHandler(function(error) {
          console.error('Hafta listesi yüklenemedi:', error);
        })
        .getWeekListForFunnel();
    }
    
    // Ay listesini yükle
    function loadMonthList() {
      google.script.run
        .withSuccessHandler(function(months) {
          const select = document.getElementById('monthSelect');
          select.innerHTML = '<option value="">Ay Seçin</option>';
          months.forEach(function(month) {
            const option = document.createElement('option');
            option.value = month.value;
            option.textContent = month.label;
            select.appendChild(option);
          });
        })
        .withFailureHandler(function(error) {
          console.error('Ay listesi yüklenemedi:', error);
        })
        .getMonthListForFunnel();
    }
    
    // Filtre tipi değiştiğinde dropdown'ları göster/gizle
    document.getElementById('filterType').addEventListener('change', function() {
      const filterType = this.value;
      const temsilciGroup = document.getElementById('temsilciGroup');
      const portfoyGroup = document.getElementById('portfoyGroup');
      const bolgeGroup = document.getElementById('bolgeGroup');
      const sortGroup = document.getElementById('sortGroup');
      
      // Tüm grupları gizle
      temsilciGroup.style.display = 'none';
      portfoyGroup.style.display = 'none';
      bolgeGroup.style.display = 'none';
      sortGroup.style.display = 'none';
      
      // Seçilen filtre tipine göre göster
      if (filterType === 'temsilci') {
        temsilciGroup.style.display = 'block';
        if (document.getElementById('employeeSelect').value === 'ALL') {
          sortGroup.style.display = 'block';
        }
      } else if (filterType === 'portfoy') {
        portfoyGroup.style.display = 'block';
        sortGroup.style.display = 'block';
      } else if (filterType === 'bolge') {
        bolgeGroup.style.display = 'block';
        sortGroup.style.display = 'block';
      }
    });
    
    // İlk yükleme: Temsilci listesini yükle
    (function() {
      // Temsilci listesi
      google.script.run
        .withSuccessHandler(function(employees) {
          const select = document.getElementById('employeeSelect');
          employees.forEach(function(emp) {
            const option = document.createElement('option');
            option.value = emp.code;
            option.textContent = emp.code + ' - ' + emp.name;
            select.appendChild(option);
          });
          
          select.addEventListener('change', function() {
            const sortGroup = document.getElementById('sortGroup');
            if (this.value === 'ALL') {
              sortGroup.style.display = 'block';
            } else {
              sortGroup.style.display = 'none';
            }
          });
        })
        .withFailureHandler(function(error) {
          console.error('Temsilci listesi yüklenemedi:', error);
        })
        .getEmployeeListForFunnel();
      
      // Portföy Yöneticisi listesi
      google.script.run
        .withSuccessHandler(function(yoneticiler) {
          const select = document.getElementById('portfoySelect');
          yoneticiler.forEach(function(yon) {
            const option = document.createElement('option');
            option.value = yon.code;
            option.textContent = yon.code + ' - ' + yon.name;
            select.appendChild(option);
          });
        })
        .withFailureHandler(function(error) {
          console.error('Portföy Yöneticisi listesi yüklenemedi:', error);
        })
        .getPortfoyYoneticileri();
      
      // Bölge Yöneticisi = Tüm satış yapanlar (otomatik liste)
      google.script.run
        .withSuccessHandler(function(personel) {
          const select = document.getElementById('bolgeSelect');
          // Tüm aktif personeller (satış yapanlar)
          personel.forEach(function(emp) {
            const option = document.createElement('option');
            option.value = emp.code;
            option.textContent = emp.code + ' - ' + emp.name;
            select.appendChild(option);
          });
        })
        .withFailureHandler(function(error) {
          console.error('Bölge Yöneticisi listesi yüklenemedi:', error);
        })
        .getPersonelFromSheet();
    })();
    
    // İlk yüklemede günlük seçeneklerini göster
    updateDailyOptions();

    function submit() {
      const timeFilter = document.querySelector('input[name="timeFilter"]:checked').value;
      const filterType = document.getElementById('filterType').value;
      
      // Tarih aralığını belirle
      let timeFilterValue = timeFilter;
      let startDate = null;
      let endDate = null;
      
      if (timeFilter === 'daily') {
        const dailyFilter = document.getElementById('dailyFilter').value;
        if (dailyFilter === 'today') {
          timeFilterValue = 'daily_today';
        } else if (dailyFilter === 'yesterday') {
          timeFilterValue = 'daily_yesterday';
        } else if (dailyFilter === 'dateRange') {
          timeFilterValue = 'daily_range';
          startDate = document.getElementById('startDate').value;
          endDate = document.getElementById('endDate').value;
          if (!startDate || !endDate) {
            alert('Lütfen başlangıç ve bitiş tarihlerini seçin.');
            return;
          }
        }
      } else if (timeFilter === 'weekly') {
        const weeklyFilter = document.getElementById('weeklyFilter').value;
        if (weeklyFilter === 'thisWeek') {
          timeFilterValue = 'weekly_thisWeek';
        } else if (weeklyFilter === 'weekList') {
          const weekValue = document.getElementById('weekSelect').value;
          if (!weekValue) {
            alert('Lütfen bir hafta seçin.');
            return;
          }
          timeFilterValue = 'weekly_' + weekValue;
        }
      } else if (timeFilter === 'monthly') {
        const monthlyFilter = document.getElementById('monthlyFilter').value;
        if (monthlyFilter === 'thisMonth') {
          timeFilterValue = 'monthly_thisMonth';
        } else if (monthlyFilter === 'monthList') {
          const monthValue = document.getElementById('monthSelect').value;
          if (!monthValue) {
            alert('Lütfen bir ay seçin.');
            return;
          }
          timeFilterValue = 'monthly_' + monthValue;
        }
      }
      
      // Filtre tipine göre employeeCode belirle
      let employeeCode = 'ALL';
      if (filterType === 'temsilci') {
        employeeCode = document.getElementById('employeeSelect').value;
      } else if (filterType === 'portfoy') {
        const portfoyCode = document.getElementById('portfoySelect').value;
        if (portfoyCode === 'ALL') {
          employeeCode = 'ALL';
        } else {
          employeeCode = 'PORTFOY_' + portfoyCode; // Özel prefix
        }
      } else if (filterType === 'bolge') {
        const bolgeCode = document.getElementById('bolgeSelect').value;
        if (bolgeCode === 'ALL') {
          employeeCode = 'ALL';
        } else {
          employeeCode = 'BOLGE_' + bolgeCode; // Özel prefix
        }
      }
      
      const sortBy = (employeeCode === 'ALL' || filterType !== 'temsilci')
        ? document.getElementById('sortSelect').value 
        : 'Satış';
      
      // Butonu devre dışı bırak
      const submitBtn = document.getElementById('submitBtn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'İşleniyor...';
      
      google.script.run
        .withSuccessHandler(function(result) {
          setTimeout(function() {
            try {
              google.script.host.close();
            } catch (e) {
              // Dialog zaten kapalıysa hata verme
            }
          }, 1000);
        })
        .withFailureHandler(function(error) {
          alert('Hata: ' + (error.message || error));
          submitBtn.disabled = false;
          submitBtn.textContent = 'Rapor Oluştur';
        })
        .generateFunnelReport(timeFilterValue, employeeCode, sortBy, startDate, endDate);
    }

    function cancel() {
      google.script.host.close();
    }
  </script>
</body>
</html>`;
    
    const html = HtmlService.createHtmlOutput(htmlContent)
      .setWidth(650)
      .setHeight(500);
    
    console.log('📋 Funnel Report dialog HTML oluşturuldu, gösteriliyor...');
    ui.showModalDialog(html, '📊 Funnel Raporu');
    console.log('✅ Dialog gösterildi');
  } catch (error) {
    console.error('❌ Funnel Report dialog hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Funnel Raporu dialog hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Temsilci listesini döndür (Funnel Report dialog için)
 */
/**
 * Tüm aktif personel kodlarını döndür (Personel sheet'inden veya CRM_CONFIG'den)
 * @returns {Array<string>} Tüm aktif personel kodları
 */
function getAllEmployeeCodes() {
  try {
    const personel = getPersonelFromSheet();
    if (personel && personel.length > 0) {
      // Personel sheet'inden sadece aktif olanları filtrele
      const activeCodes = personel
        .filter(p => p.durum === 'Aktif')
        .map(p => p.code);
      if (activeCodes.length > 0) {
        console.log(`✅ ${activeCodes.length} aktif personel Personel sheet'inden alındı`);
        return activeCodes;
      }
    }
  } catch (error) {
    console.warn('⚠️ Personel sheet okunamadı, CRM_CONFIG kullanılıyor:', error.message);
  }
  
  // Fallback: CRM_CONFIG
  const codes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
  console.log(`✅ ${codes.length} personel CRM_CONFIG'den alındı (fallback)`);
  return codes;
}

/**
 * Personel sheet'inden aktif personelleri oku (Cache'li)
 * @returns {Array<Object>} [{code: string, name: string, durum: string, fileId: string, portfoyYoneticisi: string}]
 */
function getPersonelFromSheet() {
  return getCachedData('personelList', () => {
    try {
      const managerFile = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = managerFile.getSheetByName('Personel');
      
      if (!sheet || sheet.getLastRow() <= 1) {
        console.warn('⚠️ Personel sheet bulunamadı veya boş, CRM_CONFIG kullanılıyor');
        // Fallback: CRM_CONFIG'den al
        const employees = [];
        for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
          employees.push({ 
            code: code, 
            name: CRM_CONFIG.EMPLOYEE_CODES[code],
            durum: 'Aktif',
            fileId: EMPLOYEE_FILES[code] || '',
            portfoyYoneticisi: ''
          });
        }
        return employees;
      }
      
      // Personel sheet'inden oku (batch)
      const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).getValues();
      const employees = [];
      
      for (const row of data) {
        const code = String(row[0] || '').trim();
        const name = String(row[1] || '').trim();
        const durum = String(row[2] || '').trim();
        const fileId = String(row[3] || '').trim();
        const portfoyYoneticisi = String(row[4] || '').trim();
        
        if (code && name) {
          employees.push({ code, name, durum, fileId, portfoyYoneticisi });
        }
      }
      
      console.log(`✅ Personel sheet'inden ${employees.length} personel okundu`);
      return employees;
      
    } catch (error) {
      console.error('❌ Personel sheet okuma hatası:', error);
      // Fallback: CRM_CONFIG'den al
      const employees = [];
      for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
        employees.push({ 
          code: code, 
          name: CRM_CONFIG.EMPLOYEE_CODES[code],
          durum: 'Aktif',
          fileId: EMPLOYEE_FILES[code] || '',
          portfoyYoneticisi: ''
        });
      }
      return employees;
    }
  }, 3600); // 1 saat cache
}

/**
 * Portföy Yöneticilerini getir (Personel sheet'inden)
 * @returns {Array<Object>} [{code: string, name: string}]
 */
function getPortfoyYoneticileri() {
  try {
    const personel = getPersonelFromSheet();
    
    // Portföy Yöneticisi = Portföy Yöneticisi kolonu BOŞ olanlar (kendisi yönetici)
    // VE kod numarası >= 20 veya özel kodlar (SO 003, RS 22, OC 23)
    let yoneticiler = personel
      .filter(p => {
        if (p.durum !== 'Aktif') return false;
        if (p.portfoyYoneticisi && p.portfoyYoneticisi.trim() !== '') return false; // Portföy Yöneticisi kolonu doluysa temsilcidir
        
        // Kod numarası kontrolü
        const codeMatch = String(p.code).match(/(\d+)/);
        const codeNumber = codeMatch ? parseInt(codeMatch[1], 10) : 0;
        const isSpecialManager = p.code === 'SO 003' || p.code === 'RS 22' || p.code === 'OC 23';
        
        // Portföy Yöneticisi: kod numarası >= 20 veya özel kodlar
        return (codeNumber >= 20 || isSpecialManager);
      })
      .map(p => ({ code: p.code, name: p.name }));
    
    // Eğer Personel sheet'inden yönetici yoksa, fallback olarak CRM_CONFIG'den al
    if (yoneticiler.length === 0) {
      console.warn('⚠️ Personel sheet\'inden portföy yöneticisi bulunamadı, CRM_CONFIG kullanılıyor');
      yoneticiler = [];
      
      for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
        const name = CRM_CONFIG.EMPLOYEE_CODES[code];
        const codeMatch = String(code).match(/(\d+)/);
        const codeNumber = codeMatch ? parseInt(codeMatch[1], 10) : 0;
        const isSpecialManager = code === 'SO 003' || code === 'RS 22' || code === 'OC 23';
        
        // Portföy Yöneticisi kontrolü
        if (codeNumber >= 20 || isSpecialManager) {
          yoneticiler.push({ code: code, name: name });
        }
      }
    }
    
    console.log(`✅ ${yoneticiler.length} portföy yöneticisi bulundu`);
    return yoneticiler;
    
  } catch (error) {
    console.error('❌ getPortfoyYoneticileri hatası:', error);
    // Fallback: CRM_CONFIG'den
    const yoneticiler = [];
    for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
      const name = CRM_CONFIG.EMPLOYEE_CODES[code];
      const codeMatch = String(code).match(/(\d+)/);
      const codeNumber = codeMatch ? parseInt(codeMatch[1], 10) : 0;
      const isSpecialManager = code === 'SO 003' || code === 'RS 22' || code === 'OC 23';
      
      if (codeNumber >= 20 || isSpecialManager) {
        yoneticiler.push({ code: code, name: name });
      }
    }
    return yoneticiler;
  }
}

/**
 * Temsilcileri getir (Personel sheet'inden - Portföy Yöneticisi kolonu dolu olanlar)
 * @returns {Array<Object>} [{code: string, name: string, portfoyYoneticisi: string}]
 */
function getTemsilciler() {
  const personel = getPersonelFromSheet();
  
  // Temsilci = Portföy Yöneticisi kolonu dolu olanlar
  const temsilciler = personel
    .filter(p => p.durum === 'Aktif' && p.portfoyYoneticisi)
    .map(p => ({ code: p.code, name: p.name, portfoyYoneticisi: p.portfoyYoneticisi }));
  
  console.log(`✅ ${temsilciler.length} temsilci bulundu`);
  return temsilciler;
}

/**
 * Belirli bir Portföy Yöneticisine bağlı temsilcileri getir
 * @param {string} portfoyYoneticisiCode - Portföy Yöneticisi kodu (örn: 'SO 003')
 * @returns {Array<Object>} [{code: string, name: string}]
 */
function getTemsilcilerByPortfoyYoneticisi(portfoyYoneticisiCode) {
  const temsilciler = getTemsilciler();
  
  return temsilciler
    .filter(t => t.portfoyYoneticisi === portfoyYoneticisiCode)
    .map(t => ({ code: t.code, name: t.name }));
}

/**
 * Temsilci listesini döndür (HTML dialog için - optimize edilmiş)
 * @returns {Array<Object>} [{code: string, name: string}]
 */
function getEmployeeListForFunnel() {
  try {
    // Personel sheet'inden oku (cache'li)
    const personel = getPersonelFromSheet();
    
    // Sadece aktif temsilcileri döndür (Portföy Yöneticisi kolonu dolu olanlar)
    let temsilciler = personel
      .filter(p => p.durum === 'Aktif' && p.portfoyYoneticisi)
      .map(p => ({ code: p.code, name: p.name }));
    
    // Eğer Personel sheet'inden temsilci yoksa, fallback olarak CRM_CONFIG'den al
    if (temsilciler.length === 0) {
      console.warn('⚠️ Personel sheet\'inden temsilci bulunamadı, CRM_CONFIG kullanılıyor');
      temsilciler = [];
      
      // CRM_CONFIG'den tüm çalışanları al
      for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
        const name = CRM_CONFIG.EMPLOYEE_CODES[code];
        // Temsilci olup olmadığını kontrol et (Portföy Yöneticisi değilse temsilcidir)
        // Kod numarası < 20 ise temsilci kabul edilir
        const codeMatch = String(code).match(/(\d+)/);
        const codeNumber = codeMatch ? parseInt(codeMatch[1], 10) : 0;
        const isSpecialManager = code === 'SO 003' || code === 'RS 22' || code === 'OC 23';
        
        // Yönetici değilse temsilcidir
        if (!(codeNumber >= 20 || isSpecialManager)) {
          temsilciler.push({ code: code, name: name });
        }
      }
    }
    
    console.log(`✅ ${temsilciler.length} temsilci bulundu (Funnel Report için)`);
    return temsilciler;
    
  } catch (error) {
    console.error('❌ getEmployeeListForFunnel hatası:', error);
    // Hata durumunda CRM_CONFIG'den fallback
    const temsilciler = [];
    for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
      const name = CRM_CONFIG.EMPLOYEE_CODES[code];
      const codeMatch = String(code).match(/(\d+)/);
      const codeNumber = codeMatch ? parseInt(codeMatch[1], 10) : 0;
      const isSpecialManager = code === 'SO 003' || code === 'RS 22' || code === 'OC 23';
      
      if (!(codeNumber >= 20 || isSpecialManager)) {
        temsilciler.push({ code: code, name: name });
      }
    }
    return temsilciler;
  }
}

/**
 * Hafta listesini getir (52 hafta - Hafta 1, Hafta 2, ...)
 * @returns {Array<Object>} [{value: string, label: string}]
 */
function getWeekListForFunnel() {
  const weeks = [];
  const currentYear = new Date().getFullYear();
  
  // 52 hafta (Hafta 1 = Ocak'ın ilk haftası)
  for (let week = 1; week <= 52; week++) {
    weeks.push({
      value: `${currentYear}_W${week}`,
      label: `Hafta ${week} (${currentYear})`
    });
  }
  
  return weeks;
}

/**
 * Ay listesini getir (Ocak, Şubat, Mart, ...)
 * @returns {Array<Object>} [{value: string, label: string}]
 */
function getMonthListForFunnel() {
  const months = [];
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const currentYear = new Date().getFullYear();
  
  // Son 12 ay + gelecek 3 ay
  for (let i = -12; i <= 3; i++) {
    const date = new Date(currentYear, new Date().getMonth() + i, 1);
    const year = date.getFullYear();
    const month = date.getMonth();
    
    months.push({
      value: `${year}_${month + 1}`,
      label: `${monthNames[month]} ${year}`
    });
  }
  
  return months;
}

/**
 * 📊 Funnel Raporu Oluştur
 * @param {string} timeFilter - 'daily', 'weekly', 'monthly' veya genişletilmiş format ('daily_today', 'weekly_2025_W1', vb.)
 * @param {string} employeeCode - Temsilci kodu, 'ALL', 'PORTFOY_XXX', veya 'BOLGE_XXX'
 * @param {string} sortBy - Sıralama metriği: 'Satış', 'Toplantı', 'Randevu', 'Fırsat', 'Arama'
 * @param {string} startDate - Tarih aralığı için başlangıç tarihi (YYYY-MM-DD formatında, opsiyonel)
 * @param {string} endDate - Tarih aralığı için bitiş tarihi (YYYY-MM-DD formatında, opsiyonel)
 */
function generateFunnelReport(timeFilter, employeeCode, sortBy, startDate, endDate) {
  console.log('📊 Funnel Raporu oluşturuluyor:', { timeFilter, employeeCode, sortBy });
  const startTime = Date.now();
  
  // Varsayılan sıralama
  if (!sortBy) {
    sortBy = 'Satış';
  }
  
  try {
    // 1. Tarih aralığını hesapla
    let dateRange;
    if (startDate && endDate) {
      // Tarih aralığı manuel olarak verilmiş
      dateRange = {
        start: new Date(startDate + 'T00:00:00'),
        end: new Date(endDate + 'T23:59:59')
      };
    } else {
      // Otomatik hesapla
      dateRange = calculateDateRange(timeFilter);
    }
    const startDateObj = dateRange.start;
    const endDateObj = dateRange.end;
    
    console.log(`📅 Tarih aralığı: ${Utilities.formatDate(startDateObj, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(endDateObj, 'Europe/Istanbul', 'dd.MM.yyyy')}`);
    
    // Employee code'u işle (Portföy Yöneticisi veya Bölge Yöneticisi)
    let actualEmployeeCodes = [];
    if (employeeCode.startsWith('PORTFOY_')) {
      // Portföy Yöneticisi seçildi - tüm temsilcilerini getir
      const portfoyCode = employeeCode.replace('PORTFOY_', '');
      const temsilciler = getTemsilcilerByPortfoyYoneticisi(portfoyCode);
      actualEmployeeCodes = temsilciler.map(t => t.code);
      console.log(`👔 Portföy Yöneticisi ${portfoyCode}: ${actualEmployeeCodes.length} temsilci bulundu`);
    } else if (employeeCode.startsWith('BOLGE_')) {
      // Bölge Yöneticisi = Tüm satış yapanlar (tek kişi)
      const bolgeCode = employeeCode.replace('BOLGE_', '');
      actualEmployeeCodes = [bolgeCode];
      console.log(`🌍 Bölge Yöneticisi: ${bolgeCode}`);
    } else if (employeeCode === 'ALL') {
      // Tüm temsilciler
      actualEmployeeCodes = [];
      console.log(`👥 Tüm temsilciler seçildi`);
    } else {
      // Tek temsilci
      actualEmployeeCodes = [employeeCode];
      console.log(`👤 Tek temsilci: ${employeeCode}`);
    }
    
    // CACHE KONTROLÜ: Önce cache'den kontrol et (17,200x hızlı!)
    const cache = CacheService.getScriptCache();
    const cacheKey = `funnelReport_${timeFilter}_${employeeCode}_${sortBy}_${startDateObj.getTime()}_${endDateObj.getTime()}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      console.log('✅ Funnel Raporu cache\'den alındı (0.01s)');
      const cachedData = JSON.parse(cached);
      
      // Date objelerini geri yükle (timestamp'ten)
      const cachedStartDate = new Date(cachedData.startDate);
      const cachedEndDate = new Date(cachedData.endDate);
      
      // Rapor sayfası oluştur (cache'den gelen veri ile)
      const managerFile = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = createFunnelReportSheet(managerFile, cachedData.processedFunnel, timeFilter, cachedStartDate, cachedEndDate, employeeCode, sortBy);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Funnel Raporu cache'den oluşturuldu (${duration}ms)`);
      
      const employeeText = getEmployeeDisplayText(employeeCode);
      
      SpreadsheetApp.getUi().alert(
        '✅ Funnel Raporu Tamamlandı (Cache)',
        `📊 Rapor cache'den alındı!\n\n` +
        `📅 Tarih: ${Utilities.formatDate(cachedStartDate, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(cachedEndDate, 'Europe/Istanbul', 'dd.MM.yyyy')}\n` +
        `👥 Filtre: ${employeeText}\n` +
        `📈 Sıralama: ${sortBy}\n` +
        `⏱️ Süre: ${(duration / 1000).toFixed(2)}s (Cache)\n\n` +
        `"FUNNEL RAPORU" sayfasına bakın.`,
        SpreadsheetApp.getUi().ButtonSet.OK
      );
      
      return { success: true, sheetName: sheet.getName(), duration: duration, fromCache: true };
    }
    
    // Cache miss - Normal işlem akışı
    console.log('📊 Funnel Raporu cache\'de yok, yeni oluşturuluyor...');
    
    // 2. Veri topla (Batch Operations)
    const funnelData = collectFunnelData(actualEmployeeCodes.length > 0 ? actualEmployeeCodes : 'ALL', startDateObj, endDateObj);
    
    // 3. Funnel işleme (Temsilci bazında veya toplam)
    const processedFunnel = (employeeCode === 'ALL' || actualEmployeeCodes.length > 1)
      ? processFunnelDataByEmployee(funnelData, sortBy)
      : processFunnelData(funnelData);
    
    // 4. Sonucu cache'le (1 saat TTL)
    try {
      cache.put(cacheKey, JSON.stringify({
        processedFunnel: processedFunnel,
        startDate: startDateObj.getTime(), // Date objesi serialize edilemez, timestamp kullan
        endDate: endDateObj.getTime()
      }), 3600);
      console.log('💾 Funnel Raporu cache\'lendi (1 saat)');
    } catch (cacheError) {
      console.warn('⚠️ Cache yazma hatası (devam ediliyor):', cacheError);
    }
    
    // 5. Rapor sayfası oluştur
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = createFunnelReportSheet(managerFile, processedFunnel, timeFilter, startDateObj, endDateObj, employeeCode, sortBy);
    
    // 6. Excel export (opsiyonel - otomatik)
    // Excel export'u kullanıcı butonuna tıklayınca yapılacak
    
    const duration = Date.now() - startTime;
    console.log(`✅ Funnel Raporu oluşturuldu (${duration}ms)`);
    
    const employeeText = getEmployeeDisplayText(employeeCode);
    
    SpreadsheetApp.getUi().alert(
      '✅ Funnel Raporu Tamamlandı',
      `📊 Rapor oluşturuldu!\n\n` +
      `📅 Tarih: ${Utilities.formatDate(startDateObj, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(endDateObj, 'Europe/Istanbul', 'dd.MM.yyyy')}\n` +
      `👥 Filtre: ${employeeText}\n` +
      `📈 Sıralama: ${sortBy}\n` +
      `⏱️ Süre: ${(duration / 1000).toFixed(1)}s\n\n` +
      `"FUNNEL RAPORU" sayfasına bakın.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return { success: true, sheetName: sheet.getName(), duration: duration, fromCache: false };
    
  } catch (error) {
    console.error('❌ generateFunnelReport hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Funnel Raporu hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Employee code'dan görüntüleme metni oluştur
 * @param {string} employeeCode - Temsilci kodu, 'ALL', 'PORTFOY_XXX', veya 'BOLGE_XXX'
 * @returns {string} Görüntüleme metni
 */
function getEmployeeDisplayText(employeeCode) {
  if (employeeCode === 'ALL') {
    return 'Tümü';
  } else if (employeeCode.startsWith('PORTFOY_')) {
    const portfoyCode = employeeCode.replace('PORTFOY_', '');
    const personel = getPersonelFromSheet();
    const yonetici = personel.find(p => p.code === portfoyCode);
    return yonetici ? `Portföy Yöneticisi: ${portfoyCode} - ${yonetici.name}` : portfoyCode;
  } else if (employeeCode.startsWith('BOLGE_')) {
    const bolgeCode = employeeCode.replace('BOLGE_', '');
    const personel = getPersonelFromSheet();
    const bolge = personel.find(p => p.code === bolgeCode);
    return bolge ? `Bölge Yöneticisi: ${bolgeCode} - ${bolge.name}` : bolgeCode;
  } else {
    const personel = getPersonelFromSheet();
    const emp = personel.find(p => p.code === employeeCode);
    return emp ? `${employeeCode} - ${emp.name}` : employeeCode;
  }
}

/**
 * Tarih aralığını hesapla (Günlük/Haftalık/Aylık - Genişletilmiş)
 * @param {string} timeFilter - 'daily', 'weekly', 'monthly' veya genişletilmiş format ('daily_today', 'weekly_2025_W1', vb.)
 * @returns {Object} {start: Date, end: Date}
 */
function calculateDateRange(timeFilter) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate, endDate;
  
  // Günlük filtreler
  if (timeFilter === 'daily' || timeFilter === 'daily_today') {
    // Bugün
    startDate = new Date(today);
    endDate = new Date(today);
  } else if (timeFilter === 'daily_yesterday') {
    // Dün
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 1);
    endDate = new Date(startDate);
  } else if (timeFilter === 'daily_range') {
    // Tarih aralığı (manuel olarak verilir, burada default)
    startDate = new Date(today);
    endDate = new Date(today);
  }
  // Haftalık filtreler
  else if (timeFilter === 'weekly' || timeFilter === 'weekly_thisWeek') {
    // Bu haftanın Pazartesi - Pazar
    const dayOfWeek = today.getDay(); // 0 = Pazar, 1 = Pazartesi, ...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Pazartesi'ye git
    startDate = new Date(today);
    startDate.setDate(today.getDate() + mondayOffset);
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // Pazar
  } else if (timeFilter.startsWith('weekly_')) {
    // Hafta listesi: 'weekly_2025_W1' formatında
    const match = timeFilter.match(/weekly_(\d+)_W(\d+)/);
    if (match) {
      const year = parseInt(match[1], 10);
      const week = parseInt(match[2], 10);
      
      // Hafta 1 = Ocak'ın ilk Pazartesi'si
      const jan1 = new Date(year, 0, 1);
      const dayOfWeek = jan1.getDay(); // 0 = Pazar, 1 = Pazartesi, ...
      const mondayOffset = dayOfWeek === 0 ? 1 : (dayOfWeek === 1 ? 0 : 8 - dayOfWeek);
      const firstMonday = new Date(year, 0, 1 + mondayOffset);
      
      // İstenen haftanın Pazartesi'si
      startDate = new Date(firstMonday);
      startDate.setDate(firstMonday.getDate() + (week - 1) * 7);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Pazar
    } else {
      // Fallback: Bu hafta
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(today);
      startDate.setDate(today.getDate() + mondayOffset);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
    }
  }
  // Aylık filtreler
  else if (timeFilter === 'monthly' || timeFilter === 'monthly_thisMonth') {
    // Bu ayın 1. günü - Son günü
    startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Ayın son günü
  } else if (timeFilter === 'monthly_lastMonth') {
    // Geçen ayın 1. günü - Son günü
    const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1; // Ocak ise Aralık
    const lastMonthYear = today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();
    startDate = new Date(lastMonthYear, lastMonth, 1);
    endDate = new Date(lastMonthYear, lastMonth + 1, 0); // Ayın son günü
  } else if (timeFilter.startsWith('monthly_')) {
    // Ay listesi: 'monthly_2025_1' formatında (1 = Ocak, 12 = Aralık)
    const match = timeFilter.match(/monthly_(\d+)_(\d+)/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // 0-based (0 = Ocak)
      
      startDate = new Date(year, month, 1);
      endDate = new Date(year, month + 1, 0); // Ayın son günü
    } else {
      // Fallback: Bu ay
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
  } else {
    throw new Error('Geçersiz zaman filtresi: ' + timeFilter);
  }
  
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { start: startDate, end: endDate };
}

/**
 * Funnel verilerini topla (Batch Operations)
 * Log Arşivi öncelikli, yoksa yedek kaynaklar
 * @param {string|Array<string>} employeeCodeOrCodes - Temsilci kodu, 'ALL', veya kod listesi
 * @param {Date} startDate - Başlangıç tarihi
 * @param {Date} endDate - Bitiş tarihi
 */
function collectFunnelData(employeeCodeOrCodes, startDate, endDate) {
  const allActivities = [];
  
  // Temsilci kodları
  let employeeCodes = [];
  if (employeeCodeOrCodes === 'ALL') {
    // Tüm aktif temsilciler (Personel sheet'inden)
    const personel = getPersonelFromSheet();
    employeeCodes = personel
      .filter(p => p.durum === 'Aktif' && p.portfoyYoneticisi) // Sadece temsilciler (Portföy Yöneticisi kolonu dolu)
      .map(p => p.code);
    
    // Fallback: CRM_CONFIG'den al
    if (employeeCodes.length === 0) {
      employeeCodes = Object.keys(CRM_CONFIG.EMPLOYEE_CODES);
    }
  } else if (Array.isArray(employeeCodeOrCodes)) {
    // Kod listesi (Portföy Yöneticisi için)
    employeeCodes = employeeCodeOrCodes;
  } else {
    // Tek kod
    employeeCodes = [employeeCodeOrCodes];
  }
  
  console.log(`🔍 Funnel veri toplama başladı: ${employeeCodes.length} temsilci, Tarih: ${Utilities.formatDate(startDate, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(endDate, 'Europe/Istanbul', 'dd.MM.yyyy')}`);
  
  // Her temsilci için veri topla (Batch - findEmployeeFile kullan, DriveApp.getFilesByName yerine)
  for (const empCode of employeeCodes) {
    try {
      const employeeFile = findEmployeeFile(empCode);
      if (!employeeFile) {
        console.log(`⚠️ ${empCode}: Dosya bulunamadı (EMPLOYEE_FILES mapping'inde yok olabilir)`);
        continue;
      }
      
      console.log(`✅ ${empCode}: Dosya bulundu`);
      
      // 1. Log Arşivi'nden veri çek (ÖNCELİKLİ) - Gizli sayfalar dahil
      let logArchiveSheet = employeeFile.getSheetByName('Log Arşivi');
      
      // Gizli sayfaları da kontrol et (esnek arama)
      if (!logArchiveSheet) {
        const allSheets = employeeFile.getSheets();
        const allSheetNames = allSheets.map(s => s.getName());
        console.log(`🔍 ${empCode}: Tüm sayfalar:`, allSheetNames);
        
        // Case-insensitive ve boşluk toleranslı arama
        for (const sheet of allSheets) {
          const sheetName = sheet.getName().trim();
          if (sheetName === 'Log Arşivi' || 
              sheetName.toLowerCase() === 'log arşivi' ||
              (sheetName.toLowerCase().includes('log') && sheetName.toLowerCase().includes('arşiv'))) {
            logArchiveSheet = sheet;
            console.log(`✅ ${empCode}: Log Arşivi bulundu (esnek arama): "${sheetName}"`);
            break;
          }
        }
      }
      
      if (!logArchiveSheet) {
        // Tüm sayfa isimlerini listele (debug için)
        const allSheets = employeeFile.getSheets();
        const sheetNames = allSheets.map(s => s.getName());
        console.log(`⚠️ ${empCode}: Log Arşivi sayfası bulunamadı. Mevcut sayfalar:`, sheetNames);
      } else if (logArchiveSheet.getLastRow() <= 1) {
        console.log(`⚠️ ${empCode}: Log Arşivi boş (${logArchiveSheet.getLastRow()} satır)`);
      } else {
        console.log(`📊 ${empCode}: Log Arşivi bulundu (${logArchiveSheet.getLastRow()} satır)`);
        const allData = logArchiveSheet.getDataRange().getValues(); // ✅ BATCH READ
        
        if (allData.length >= 2) {
          const headers = allData[0];
          console.log(`📋 ${empCode}: Kolonlar:`, headers);
          
          const aktiviteTarihiIndex = headers.indexOf('Tarih') !== -1 
            ? headers.indexOf('Tarih') 
            : headers.indexOf('Aktivite Tarihi');
          const aktiviteIndex = headers.indexOf('Aktivite');
          const logIndex = headers.indexOf('Log Detayı') !== -1 
            ? headers.indexOf('Log Detayı') 
            : headers.indexOf('Log');
          
          console.log(`🔍 ${empCode}: Kolon indeksleri - Tarih: ${aktiviteTarihiIndex}, Aktivite: ${aktiviteIndex}, Log: ${logIndex}`);
          
          if (aktiviteTarihiIndex === -1 || aktiviteIndex === -1) {
            console.log(`❌ ${empCode}: Gerekli kolonlar bulunamadı! Tarih kolonu: ${aktiviteTarihiIndex === -1 ? 'YOK' : 'VAR'}, Aktivite kolonu: ${aktiviteIndex === -1 ? 'YOK' : 'VAR'}`);
          } else {
            let processedCount = 0;
            let matchedCount = 0;
            
            for (let row = 1; row < allData.length; row++) {
              const aktiviteTarihi = allData[row][aktiviteTarihiIndex];
              const aktivite = String(allData[row][aktiviteIndex] || '').trim();
              const log = logIndex !== -1 ? String(allData[row][logIndex] || '') : '';
              
              if (!aktiviteTarihi || !aktivite) continue;
              
              processedCount++;
              
              // Tarih parse etme
              let logDate = null;
              if (aktiviteTarihi instanceof Date) {
                logDate = new Date(aktiviteTarihi);
              } else {
                const dateStr = String(aktiviteTarihi);
                logDate = parseDdMmYyyy(dateStr);
                if (!logDate || isNaN(logDate.getTime())) {
                  try {
                    logDate = new Date(dateStr);
                    if (isNaN(logDate.getTime())) {
                      console.log(`⚠️ ${empCode} Satır ${row + 1}: Tarih parse edilemedi: "${dateStr}"`);
                      continue;
                    }
                  } catch (e) {
                    console.log(`⚠️ ${empCode} Satır ${row + 1}: Tarih parse hatası: "${dateStr}"`);
                    continue;
                  }
                }
              }
              
              if (!logDate || isNaN(logDate.getTime())) continue;
              
              // Tarih karşılaştırması
              const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
              const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
              const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
              
              if (logDateOnly >= startDateOnly && logDateOnly <= endDateOnly) {
                matchedCount++;
                allActivities.push({
                  employeeCode: empCode,
                  date: logDate,
                  aktivite: aktivite,
                  log: log,
                  source: 'Log Arşivi',
                  ciro: 0 // Log Arşivi'nde ciro yok (Satışlarım'dan alınacak)
                });
              }
            }
            
            console.log(`📊 ${empCode}: ${processedCount} satır işlendi, ${matchedCount} satır tarih aralığına uydu, ${allActivities.filter(a => a.employeeCode === empCode).length} aktivite eklendi`);
          }
        }
      }
      
      // 2. Log Arşivi'nde veri yoksa yedek kaynaklardan çek
      const empActivities = allActivities.filter(a => a.employeeCode === empCode);
      if (empActivities.length === 0) {
        console.log(`📊 ${empCode}: Log Arşivi'nde veri yok, yedek kaynaklardan çekiliyor...`);
        // Yedek kaynaklar: Randevularım, Fırsatlarım, Toplantılarım
        const backupActivities = collectFunnelDataFromBackup(employeeFile, startDate, endDate);
        console.log(`📊 ${empCode}: Yedek kaynaklardan ${backupActivities.length} aktivite bulundu`);
        backupActivities.forEach(activity => {
          activity.employeeCode = empCode;
          activity.source = 'Yedek Kaynak';
          allActivities.push(activity);
        });
      }
      
    } catch (error) {
      console.error(`❌ ${empCode} işleme hatası:`, error);
    }
  }
  
  console.log(`✅ Funnel veri toplama tamamlandı: Toplam ${allActivities.length} aktivite`);
  return allActivities;
}

/**
 * Yedek kaynaklardan veri topla (Randevularım, Fırsatlarım, Toplantılarım)
 */
function collectFunnelDataFromBackup(employeeFile, startDate, endDate) {
  const activities = [];
  
  // Randevularım
  const randevularimSheet = employeeFile.getSheetByName('Randevularım');
  if (randevularimSheet && randevularimSheet.getLastRow() > 1) {
    const data = randevularimSheet.getDataRange().getValues();
    const headers = data[0];
    // Randevularım'da "Randevu durumu" kolonu var, "Aktivite" yok
    let aktiviteIndex = headers.indexOf('Randevu durumu');
    if (aktiviteIndex === -1) {
      // Fallback: "Aktivite" kolonunu dene
      aktiviteIndex = headers.indexOf('Aktivite');
    }
    const tarihIndex = headers.findIndex(h => {
      const hStr = String(h || '').toLowerCase();
      return hStr.includes('randevu tarihi') || hStr.includes('tarih');
    });
    
    console.log(`🔍 Randevularım: Aktivite kolonu index=${aktiviteIndex}, Tarih kolonu index=${tarihIndex}`);
    
    if (aktiviteIndex !== -1 && tarihIndex !== -1) {
      let randevuCount = 0;
      for (let row = 1; row < data.length; row++) {
        const aktivite = String(data[row][aktiviteIndex] || '').trim();
        const tarih = data[row][tarihIndex];
        if (aktivite && tarih) {
          let logDate = parseDdMmYyyy(tarih) || (tarih instanceof Date ? new Date(tarih) : null);
          if (logDate && !isNaN(logDate.getTime())) {
            const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            if (logDateOnly >= startDateOnly && logDateOnly <= endDateOnly) {
              // Randevu durumu değerlerini aktivite ismine çevir
              let mappedActivity = aktivite;
              
              // Randevu durumu değerlerini normalize et
              if (aktivite === 'Randevu Alındı' || aktivite === 'Randevu alındı' || aktivite === 'İleri Tarih Randevu' || aktivite === 'Randevu Teyitlendi') {
                mappedActivity = 'Randevu Alındı';
              } else if (aktivite === 'Randevu Ertelendi' || aktivite === 'Randevu İptal oldu' || aktivite === 'Randevu iptal oldu') {
                mappedActivity = aktivite; // Negatif olarak sayılacak
              } else if (aktivite === 'Toplantı Gerçekleşti' || aktivite === 'Toplantı gerçekleşti') {
                mappedActivity = 'Toplantı Tamamlandı'; // Toplantıya geçti
              }
              
              console.log(`📊 Randevularım Satır ${row + 1}: "${aktivite}" → "${mappedActivity}" (${Utilities.formatDate(logDate, 'Europe/Istanbul', 'dd.MM.yyyy')})`);
              
              activities.push({
                date: logDate,
                aktivite: mappedActivity,
                log: aktivite,
                source: 'Randevularım',
                ciro: 0 // Randevularım'da ciro yok
              });
              randevuCount++;
            }
          }
        }
      }
      console.log(`📊 Randevularım: ${randevuCount} randevu aktivitesi eklendi`);
    } else {
      console.log(`⚠️ Randevularım: Aktivite veya Tarih kolonu bulunamadı`);
    }
  }
  
  // Fırsatlarım
  const firsatlarimSheet = employeeFile.getSheetByName('Fırsatlarım');
  if (firsatlarimSheet && firsatlarimSheet.getLastRow() > 1) {
    const data = firsatlarimSheet.getDataRange().getValues();
    const headers = data[0];
    // Fırsatlarım'da "Fırsat Durumu" kolonu var, "Aktivite" yok
    let aktiviteIndex = headers.indexOf('Fırsat Durumu');
    if (aktiviteIndex === -1) {
      // Fallback: "Aktivite" kolonunu dene
      aktiviteIndex = headers.indexOf('Aktivite');
    }
    const tarihIndex = headers.findIndex(h => {
      const hStr = String(h || '').toLowerCase();
      return hStr.includes('fırsat tarihi') || hStr.includes('tarih');
    });
    
    console.log(`🔍 Fırsatlarım: Aktivite kolonu index=${aktiviteIndex}, Tarih kolonu index=${tarihIndex}`);
    
    if (aktiviteIndex !== -1 && tarihIndex !== -1) {
      let firsatCount = 0;
      for (let row = 1; row < data.length; row++) {
        const aktivite = String(data[row][aktiviteIndex] || '').trim();
        const tarih = data[row][tarihIndex];
        if (aktivite && tarih) {
          let logDate = parseDdMmYyyy(tarih) || (tarih instanceof Date ? new Date(tarih) : null);
          if (logDate && !isNaN(logDate.getTime())) {
            const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            if (logDateOnly >= startDateOnly && logDateOnly <= endDateOnly) {
              // Fırsat Durumu değerlerini aktivite ismine çevir
              let mappedActivity = aktivite;
              
              // Fırsat Durumu değerlerini normalize et
              if (aktivite === 'Fırsat İletildi' || aktivite === 'Fırsat iletildi') {
                mappedActivity = 'Fırsat İletildi';
              } else if (aktivite === 'Fırsat Kaybedildi' || aktivite === 'Fırsat kaybedildi' || aktivite === 'Fırsat Kaybedilen') {
                mappedActivity = 'Fırsat Kaybedilen'; // Negatif olarak sayılacak
              } else if (aktivite === 'Yeniden Aranacak' || aktivite === 'Bilgi Verildi') {
                mappedActivity = aktivite; // Bu değerler mapping'de yok, olduğu gibi bırak
              }
              
              console.log(`📊 Fırsatlarım Satır ${row + 1}: "${aktivite}" → "${mappedActivity}" (${Utilities.formatDate(logDate, 'Europe/Istanbul', 'dd.MM.yyyy')})`);
              
              activities.push({
                date: logDate,
                aktivite: mappedActivity,
                log: aktivite,
                source: 'Fırsatlarım',
                ciro: 0 // Fırsatlarım'da ciro yok
              });
              firsatCount++;
            }
          }
        }
      }
      console.log(`📊 Fırsatlarım: ${firsatCount} fırsat aktivitesi eklendi`);
    } else {
      console.log(`⚠️ Fırsatlarım: Aktivite veya Tarih kolonu bulunamadı`);
    }
  }
  
  // Toplantılarım
  const toplantilarimSheet = employeeFile.getSheetByName('Toplantılarım');
  if (toplantilarimSheet && toplantilarimSheet.getLastRow() > 1) {
    const data = toplantilarimSheet.getDataRange().getValues();
    const headers = data[0];
    // Toplantılarım'da "Toplantı Sonucu" kolonu var, "Aktivite" yok
    let aktiviteIndex = headers.indexOf('Toplantı Sonucu');
    if (aktiviteIndex === -1) {
      // Fallback: "Aktivite" kolonunu dene
      aktiviteIndex = headers.indexOf('Aktivite');
    }
    const tarihIndex = headers.findIndex(h => {
      const hStr = String(h || '').toLowerCase();
      return hStr.includes('toplantı tarihi') || hStr.includes('tarih');
    });
    
    console.log(`🔍 Toplantılarım: Aktivite kolonu index=${aktiviteIndex}, Tarih kolonu index=${tarihIndex}`);
    
    if (aktiviteIndex !== -1 && tarihIndex !== -1) {
      let toplantiCount = 0;
      for (let row = 1; row < data.length; row++) {
        const aktivite = String(data[row][aktiviteIndex] || '').trim();
        const tarih = data[row][tarihIndex];
        if (aktivite && tarih) {
          let logDate = parseDdMmYyyy(tarih) || (tarih instanceof Date ? new Date(tarih) : null);
          if (logDate && !isNaN(logDate.getTime())) {
            const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            if (logDateOnly >= startDateOnly && logDateOnly <= endDateOnly) {
              // Toplantı Sonucu değerlerini aktivite ismine çevir
              // Toplantı Sonucu dropdown değerleri: "Satış Yapıldı", "Teklif iletildi", "Beklemede", "Satış İptal"
              let mappedActivity = aktivite;
              
              // Toplantı Sonucu değerlerini normalize et
              if (aktivite === 'Satış Yapıldı' || aktivite === 'Satış yapıldı') {
                mappedActivity = 'Satış Yapıldı';
              } else if (aktivite === 'Teklif iletildi' || aktivite === 'Teklif İletildi') {
                mappedActivity = 'Toplantı Tamamlandı'; // Teklif = Toplantı tamamlandı sayılır
              } else if (aktivite === 'Toplantı Tamamlandı' || aktivite === 'Toplantı tamamlandı' || aktivite === 'Toplantı Gerçekleşti' || aktivite === 'Toplantı gerçekleşti') {
                mappedActivity = 'Toplantı Tamamlandı';
              } else if (aktivite === 'Beklemede' || aktivite === 'Satış İptal') {
                // Bu değerler negatif değil, ama pozitif de değil - atla veya özel işle
                mappedActivity = 'Toplantı Tamamlandı'; // Beklemede de toplantı yapıldı sayılır
              }
              
              console.log(`📊 Toplantılarım Satır ${row + 1}: "${aktivite}" → "${mappedActivity}" (${Utilities.formatDate(logDate, 'Europe/Istanbul', 'dd.MM.yyyy')})`);
              
              activities.push({
                date: logDate,
                aktivite: mappedActivity,
                log: aktivite,
                source: 'Toplantılarım',
                ciro: 0 // Toplantılarım'da ciro yok
              });
              toplantiCount++;
            }
          }
        }
      }
      console.log(`📊 Toplantılarım: ${toplantiCount} toplantı aktivitesi eklendi`);
    } else {
      console.log(`⚠️ Toplantılarım: Aktivite veya Tarih kolonu bulunamadı`);
    }
  }
  
  // Satışlarım - Ciro bilgisini topla
  const satislarimSheet = employeeFile.getSheetByName('Satışlarım');
  if (satislarimSheet && satislarimSheet.getLastRow() > 1) {
    const data = satislarimSheet.getDataRange().getValues();
    const headers = data[0];
    const satisTarihiIndex = headers.findIndex(h => {
      const hStr = String(h || '').toLowerCase();
      return hStr.includes('satış tarihi') || hStr.includes('satis tarihi');
    });
    const ciroIndex = headers.indexOf('Ciro');
    
    console.log(`🔍 Satışlarım: Satış Tarihi kolonu index=${satisTarihiIndex}, Ciro kolonu index=${ciroIndex}`);
    
    if (satisTarihiIndex !== -1 && ciroIndex !== -1) {
      let satisCount = 0;
      let totalCiro = 0;
      for (let row = 1; row < data.length; row++) {
        const satisTarihi = data[row][satisTarihiIndex];
        const ciro = parseFloat(data[row][ciroIndex] || 0);
        
        if (satisTarihi && !isNaN(ciro) && ciro > 0) {
          let logDate = parseDdMmYyyy(satisTarihi) || (satisTarihi instanceof Date ? new Date(satisTarihi) : null);
          if (logDate && !isNaN(logDate.getTime())) {
            const logDateOnly = new Date(logDate.getFullYear(), logDate.getMonth(), logDate.getDate());
            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            if (logDateOnly >= startDateOnly && logDateOnly <= endDateOnly) {
              // Satış aktivitesi ekle (ciro bilgisi ile)
              activities.push({
                date: logDate,
                aktivite: 'Satış Yapıldı',
                log: 'Satış Yapıldı',
                source: 'Satışlarım',
                ciro: ciro
              });
              satisCount++;
              totalCiro += ciro;
            }
          }
        }
      }
      console.log(`📊 Satışlarım: ${satisCount} satış aktivitesi eklendi, Toplam Ciro: ${totalCiro.toFixed(2)} ₺`);
    } else {
      console.log(`⚠️ Satışlarım: Satış Tarihi veya Ciro kolonu bulunamadı`);
    }
  }
  
  return activities;
}

/**
 * Aktivite ismini normalize et (büyük/küçük harf tutarsızlığı için)
 */
function normalizeActivityName(aktivite) {
  const normalized = String(aktivite || '').trim();
  // İlk harfi büyük yap, geri kalanı küçük (basit normalizasyon)
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

/**
 * Funnel verilerini işle (Pozitif ve Negatif kol) - Tek temsilci için
 */
function processFunnelData(activities) {
  console.log('📊 Funnel verileri işleniyor...');
  
  // Aktivite tiplerini normalize et ve kategorize et
  const positiveFunnel = {
    'Arama': 0,           // Başlangıç (tüm aktiviteler)
    'Fırsat': 0,          // Fırsat İletildi
    'Randevu': 0,         // Randevu Alındı, İleri Tarih Randevu
    'Toplantı': 0,        // Toplantı Tamamlandı
    'Satış': 0            // Satış Yapıldı
  };
  
  const negativeFunnel = {
    'Geçersiz Numara': 0,
    'Ulaşılamadı': 0,
    'İlgilenmiyor': 0,
    'Kurumsal': 0,
    'Randevu İptal/Ertelendi': 0,
    'Fırsat Kaybedilen': 0
  };
  
  // Ciro toplamı (sadece satışlar için)
  let totalCiro = 0;
  
  // Aktivite mapping (case-insensitive)
  const activityMap = getActivityMapping();
  
  // Tüm aktiviteleri say
  let totalActivities = 0;
  
  for (const activity of activities) {
    const aktivite = String(activity.aktivite || '').trim();
    if (!aktivite) continue;
    
    totalActivities++;
    
    // Ciro bilgisini topla (sadece satışlar için)
    const ciro = parseFloat(activity.ciro || 0);
    if (!isNaN(ciro) && ciro > 0) {
      totalCiro += ciro;
    }
    
    // Aktivite mapping'den bul
    const mappedActivity = activityMap[aktivite] || null;
    
    if (mappedActivity) {
      // Pozitif funnel
      if (positiveFunnel.hasOwnProperty(mappedActivity)) {
        positiveFunnel[mappedActivity]++;
      }
      // Negatif funnel
      if (negativeFunnel.hasOwnProperty(mappedActivity)) {
        negativeFunnel[mappedActivity]++;
      }
    }
  }
  
  // Arama = Tüm aktiviteler
  positiveFunnel['Arama'] = totalActivities;
  
  // Yüzdeleri hesapla
  const positivePercentages = {};
  const negativePercentages = {};
  
  Object.keys(positiveFunnel).forEach(key => {
    if (key === 'Arama') {
      // Arama = Başlangıç noktası (100%)
      positivePercentages[key] = 100;
    } else if (key === 'Fırsat') {
      // Fırsat = Arama'ya göre % (direkt aramadan fırsat oluşturulabilir)
      const aramaCount = positiveFunnel['Arama'] || 0;
      positivePercentages[key] = aramaCount > 0 
        ? ((positiveFunnel[key] / aramaCount) * 100).toFixed(1)
        : '0.0';
    } else if (key === 'Randevu') {
      // Randevu = Arama'ya göre % (direkt aramadan randevu alınabilir, fırsattan da gelebilir)
      const aramaCount = positiveFunnel['Arama'] || 0;
      positivePercentages[key] = aramaCount > 0 
        ? ((positiveFunnel[key] / aramaCount) * 100).toFixed(1)
        : '0.0';
    } else if (key === 'Toplantı') {
      // Toplantı = Randevu'ya göre % (randevudan toplantı)
      const randevuCount = positiveFunnel['Randevu'] || 0;
      positivePercentages[key] = randevuCount > 0 
        ? ((positiveFunnel[key] / randevuCount) * 100).toFixed(1)
        : '0.0';
    } else if (key === 'Satış') {
      // Satış = Toplantı'ya göre % (toplantıdan satış)
      const toplantiCount = positiveFunnel['Toplantı'] || 0;
      positivePercentages[key] = toplantiCount > 0 
        ? ((positiveFunnel[key] / toplantiCount) * 100).toFixed(1)
        : '0.0';
    }
  });
  
  Object.keys(negativeFunnel).forEach(key => {
    negativePercentages[key] = totalActivities > 0
      ? ((negativeFunnel[key] / totalActivities) * 100).toFixed(1)
      : '0.0';
  });
  
  return {
    positive: {
      counts: positiveFunnel,
      percentages: positivePercentages
    },
    negative: {
      counts: negativeFunnel,
      percentages: negativePercentages
    },
    total: totalActivities,
    totalCiro: totalCiro
  };
}

/**
 * Funnel verilerini temsilci bazında işle (Tüm Temsilciler için)
 * Her temsilci için ayrı veri döndürür, seçilen metriğe göre sıralar
 * @param {Array} activities - Aktivite listesi
 * @param {string} sortBy - Sıralama metriği: 'Satış', 'Toplantı', 'Randevu', 'Fırsat', 'Arama'
 */
function processFunnelDataByEmployee(activities, sortBy) {
  console.log('📊 Funnel verileri temsilci bazında işleniyor...', { sortBy });
  
  // Varsayılan sıralama
  if (!sortBy) {
    sortBy = 'Satış';
  }
  
  // Temsilci bazında grupla
  const employeeData = new Map();
  
  for (const activity of activities) {
    const empCode = activity.employeeCode || 'Bilinmeyen';
    
    if (!employeeData.has(empCode)) {
      employeeData.set(empCode, []);
    }
    employeeData.get(empCode).push(activity);
  }
  
  // Her temsilci için funnel hesapla
  const employeeFunnels = [];
  
  for (const [empCode, empActivities] of employeeData) {
    const employeeName = CRM_CONFIG.EMPLOYEE_CODES[empCode] || empCode;
    const funnel = processFunnelData(empActivities);
    
    employeeFunnels.push({
      employeeCode: empCode,
      employeeName: employeeName,
      funnel: funnel,
      totalActivities: funnel.total
    });
  }
  
  // Seçilen metriğe göre sırala (yüksekten düşüğe - en iyi en üstte)
  employeeFunnels.sort((a, b) => {
    // Seçilen metriğe göre değer al
    const valueA = a.funnel.positive.counts[sortBy] || 0;
    const valueB = b.funnel.positive.counts[sortBy] || 0;
    
    // Önce seçilen metriğe göre (yüksekten düşüğe)
    if (valueB !== valueA) {
      return valueB - valueA;
    }
    
    // Eşitse ikincil sıralama: Satış sayısına göre
    const salesA = a.funnel.positive.counts['Satış'] || 0;
    const salesB = b.funnel.positive.counts['Satış'] || 0;
    if (salesB !== salesA) {
      return salesB - salesA;
    }
    
    // Eşitse toplam aktiviteye göre
    return b.totalActivities - a.totalActivities;
  });
  
  // Toplam hesapla (ciro dahil)
  let totalCiro = 0;
  for (const emp of employeeFunnels) {
    totalCiro += emp.funnel.totalCiro || 0;
  }
  
  const totalFunnel = {
    positive: {
      counts: {
        'Arama': 0,
        'Fırsat': 0,
        'Randevu': 0,
        'Toplantı': 0,
        'Satış': 0
      },
      percentages: {}
    },
    negative: {
      counts: {
        'Geçersiz Numara': 0,
        'Ulaşılamadı': 0,
        'İlgilenmiyor': 0,
        'Kurumsal': 0,
        'Randevu İptal/Ertelendi': 0,
        'Fırsat Kaybedilen': 0
      },
      percentages: {}
    },
    total: 0
  };
  
  for (const empFunnel of employeeFunnels) {
    const f = empFunnel.funnel;
    totalFunnel.total += f.total;
    
    // Pozitif toplam
    Object.keys(totalFunnel.positive.counts).forEach(key => {
      totalFunnel.positive.counts[key] += f.positive.counts[key] || 0;
    });
    
    // Negatif toplam
    Object.keys(totalFunnel.negative.counts).forEach(key => {
      totalFunnel.negative.counts[key] += f.negative.counts[key] || 0;
    });
  }
  
  // Toplam yüzdeleri hesapla
  Object.keys(totalFunnel.positive.counts).forEach(key => {
    if (key === 'Arama') {
      // Arama = Başlangıç noktası (100%)
      totalFunnel.positive.percentages[key] = 100;
    } else if (key === 'Fırsat') {
      // Fırsat = Arama'ya göre % (direkt aramadan fırsat oluşturulabilir)
      const aramaCount = totalFunnel.positive.counts['Arama'] || 0;
      totalFunnel.positive.percentages[key] = aramaCount > 0 
        ? ((totalFunnel.positive.counts[key] / aramaCount) * 100).toFixed(1)
        : '0.0';
    } else if (key === 'Randevu') {
      // Randevu = Arama'ya göre % (direkt aramadan randevu alınabilir, fırsattan da gelebilir)
      const aramaCount = totalFunnel.positive.counts['Arama'] || 0;
      totalFunnel.positive.percentages[key] = aramaCount > 0 
        ? ((totalFunnel.positive.counts[key] / aramaCount) * 100).toFixed(1)
        : '0.0';
    } else if (key === 'Toplantı') {
      // Toplantı = Randevu'ya göre % (randevudan toplantı)
      const randevuCount = totalFunnel.positive.counts['Randevu'] || 0;
      totalFunnel.positive.percentages[key] = randevuCount > 0 
        ? ((totalFunnel.positive.counts[key] / randevuCount) * 100).toFixed(1)
        : '0.0';
    } else if (key === 'Satış') {
      // Satış = Toplantı'ya göre % (toplantıdan satış)
      const toplantiCount = totalFunnel.positive.counts['Toplantı'] || 0;
      totalFunnel.positive.percentages[key] = toplantiCount > 0 
        ? ((totalFunnel.positive.counts[key] / toplantiCount) * 100).toFixed(1)
        : '0.0';
    }
  });
  
  Object.keys(totalFunnel.negative.counts).forEach(key => {
    totalFunnel.negative.percentages[key] = totalFunnel.total > 0
      ? ((totalFunnel.negative.counts[key] / totalFunnel.total) * 100).toFixed(1)
      : '0.0';
  });
  
  return {
    employees: employeeFunnels,
    total: totalFunnel
  };
}

/**
 * Aktivite mapping'i döndür (DRY prensibi)
 * 
 * ⚠️ ÖNEMLİ: Bu fonksiyon güncellendiğinde dokümantasyonu da güncelle:
 * - docs/sayfa_kolonlari.md → "📊 Aktivite Mapping (Funnel Raporu)" bölümü
 * - README.md → Raporlar bölümü (eğer mapping referansı varsa)
 * 
 * @returns {Object} Aktivite isimlerinden funnel kategorilerine mapping
 */
function getActivityMapping() {
  return {
    // Pozitif (Türkçe)
    'Fırsat İletildi': 'Fırsat',
    'Fırsat iletildi': 'Fırsat',
    'Yeniden Aranacak': 'Fırsat', // Fırsat Durumu: Yeniden Aranacak = Fırsat
    'Yeniden aranacak': 'Fırsat',
    'Bilgi Verildi': 'Fırsat', // Fırsat Durumu: Bilgi Verildi = Fırsat
    'Bilgi verildi': 'Fırsat',
    'Randevu Alındı': 'Randevu',
    'Randevu alındı': 'Randevu',
    'İleri Tarih Randevu': 'Randevu',
    'İleri tarih randevu': 'Randevu',
    'Randevu Teyitlendi': 'Randevu', // Randevu durumu: Randevu Teyitlendi = Randevu
    'Randevu teyitlendi': 'Randevu',
    'Toplantı Tamamlandı': 'Toplantı',
    'Toplantı tamamlandı': 'Toplantı',
    'Toplantı Gerçekleşti': 'Toplantı',
    'Toplantı gerçekleşti': 'Toplantı',
    'Teklif iletildi': 'Toplantı', // Toplantı Sonucu: Teklif iletildi = Toplantı
    'Teklif İletildi': 'Toplantı',
    'Beklemede': 'Toplantı', // Toplantı Sonucu: Beklemede = Toplantı (toplantı yapıldı sayılır)
    'Satış Yapıldı': 'Satış',
    'Satış yapıldı': 'Satış',
    // Pozitif (İngilizce - eski log'lar için)
    'takeAppointment': 'Randevu',
    'createOpportunity': 'Fırsat',
    'moveToMeeting': 'Toplantı',
    'createSale': 'Satış',
    // Negatif (Türkçe)
    'Geçersiz Numara': 'Geçersiz Numara',
    'Geçersiz numara': 'Geçersiz Numara',
    'Ulaşılamadı': 'Ulaşılamadı',
    'ulaşılamadı': 'Ulaşılamadı',
    'İlgilenmiyor': 'İlgilenmiyor',
    'ilgilenmiyor': 'İlgilenmiyor',
    'Kurumsal': 'Kurumsal',
    'kurumsal': 'Kurumsal',
    'Randevu İptal oldu': 'Randevu İptal/Ertelendi',
    'Randevu iptal oldu': 'Randevu İptal/Ertelendi',
    'Randevu Ertelendi': 'Randevu İptal/Ertelendi',
    'Randevu ertelendi': 'Randevu İptal/Ertelendi',
    'Fırsat kaybedilen': 'Fırsat Kaybedilen',
    'Fırsat Kaybedilen': 'Fırsat Kaybedilen',
    'Fırsat Kaybedildi': 'Fırsat Kaybedilen', // Fırsat Durumu: Fırsat Kaybedildi
    'Fırsat kaybedildi': 'Fırsat Kaybedilen',
    // Negatif (İngilizce - eski log'lar için)
    'invalidNumber': 'Geçersiz Numara',
    'unreachable': 'Ulaşılamadı',
    'notInterested': 'İlgilenmiyor',
    'corporate': 'Kurumsal',
    'appointmentCancelled': 'Randevu İptal/Ertelendi',
    'appointmentPostponed': 'Randevu İptal/Ertelendi',
    'opportunityLost': 'Fırsat Kaybedilen'
  };
}

/**
 * Funnel Raporu sayfası oluştur
 */
function createFunnelReportSheet(managerFile, funnelData, timeFilter, startDate, endDate, employeeCode, sortBy) {
  try {
    const sheetName = 'FUNNEL RAPORU';
    
    // Eski sayfayı sil veya temizle
    let sheet = managerFile.getSheetByName(sheetName);
    if (sheet) {
      managerFile.deleteSheet(sheet);
    }
    sheet = managerFile.insertSheet(sheetName);
    
    let currentRow = 1;
    
    // ========================================
    // BAŞLIK BÖLÜMÜ
    // ========================================
    sheet.getRange(currentRow, 1).setValue('📊 FUNNEL RAPORU');
    sheet.getRange(currentRow, 1, 1, 15).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(18).setBackground('#667eea').setFontColor('#FFFFFF');
    currentRow++;
    
    const timeFilterText = timeFilter === 'daily' ? 'Günlük' : timeFilter === 'weekly' ? 'Haftalık' : 'Aylık';
    const employeeText = employeeCode === 'ALL' ? 'Tüm Temsilciler' : `${employeeCode} - ${CRM_CONFIG.EMPLOYEE_CODES[employeeCode] || employeeCode}`;
    const dateRangeText = `${Utilities.formatDate(startDate, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(endDate, 'Europe/Istanbul', 'dd.MM.yyyy')}`;
    const sortByText = employeeCode === 'ALL' && sortBy ? ` | 📊 Sıralama: ${sortBy}` : '';
    
    sheet.getRange(currentRow, 1).setValue(`📅 Tarih Aralığı: ${dateRangeText}`);
    sheet.getRange(currentRow, 1, 1, 15).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setBackground('#E3F2FD');
    currentRow++;
    
    sheet.getRange(currentRow, 1).setValue(`⏰ Filtre: ${timeFilterText} | 👥 Temsilci: ${employeeText}${sortByText}`);
    sheet.getRange(currentRow, 1, 1, 15).merge();
    sheet.getRange(currentRow, 1).setFontWeight('bold').setBackground('#BBDEFB');
    currentRow += 2;
    
    // ========================================
    // TÜM TEMSİLCİLER İÇİN TABLO FORMATI
    // ========================================
    if (employeeCode === 'ALL' && funnelData.employees) {
      // Başlık
      sheet.getRange(currentRow, 1).setValue('👥 TEMSİLCİ BAZINDA FUNNEL RAPORU');
      sheet.getRange(currentRow, 1, 1, 15).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#9C27B0').setFontColor('#FFFFFF');
      currentRow++;
      
      // ========================================
      // POZİTİF FUNNEL TABLOSU
      // ========================================
      sheet.getRange(currentRow, 1).setValue('✅ POZİTİF FUNNEL');
      sheet.getRange(currentRow, 1, 1, 7).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#4CAF50').setFontColor('#FFFFFF');
      currentRow++;
      
      const positiveHeaders = [
        'Temsilci',
        'Arama',
        'Fırsat',
        'Randevu',
        'Toplantı',
        'Satış',
        'Ciro (₺)'
      ];
      
      for (let col = 1; col <= positiveHeaders.length; col++) {
        sheet.getRange(currentRow, col).setValue(positiveHeaders[col - 1]);
        sheet.getRange(currentRow, col).setFontWeight('bold').setBackground('#C8E6C9');
      }
      currentRow++;
      
      // Her temsilci için satır (seçilen metriğe göre sıralı)
      for (let i = 0; i < funnelData.employees.length; i++) {
        const emp = funnelData.employees[i];
        const f = emp.funnel;
        
        let col = 1;
        sheet.getRange(currentRow, col++).setValue(`${emp.employeeCode} - ${emp.employeeName}`);
        sheet.getRange(currentRow, col++).setValue(f.positive.counts['Arama'] || 0); // Arama = Tüm aktiviteler
        sheet.getRange(currentRow, col++).setValue(f.positive.counts['Fırsat'] || 0);
        sheet.getRange(currentRow, col++).setValue(f.positive.counts['Randevu'] || 0);
        sheet.getRange(currentRow, col++).setValue(f.positive.counts['Toplantı'] || 0);
        sheet.getRange(currentRow, col++).setValue(f.positive.counts['Satış'] || 0);
        const empCiroValue = emp.totalCiro || 0;
        sheet.getRange(currentRow, col++).setValue(empCiroValue);
        sheet.getRange(currentRow, col - 1).setNumberFormat('#,##0.00" ₺"');
        
        // Zebra striping
        if (i % 2 === 0) {
          sheet.getRange(currentRow, 1, 1, positiveHeaders.length).setBackground('#E8F5E9');
        }
        
        currentRow++;
      }
      
      // POZİTİF TOPLAM SATIRI
      currentRow++;
      let col = 1;
      sheet.getRange(currentRow, col++).setValue('📊 TOPLAM');
      sheet.getRange(currentRow, col++).setValue(funnelData.total.positive.counts['Arama'] || 0); // Arama = Tüm aktiviteler
      sheet.getRange(currentRow, col++).setValue(funnelData.total.positive.counts['Fırsat'] || 0);
      sheet.getRange(currentRow, col++).setValue(funnelData.total.positive.counts['Randevu'] || 0);
      sheet.getRange(currentRow, col++).setValue(funnelData.total.positive.counts['Toplantı'] || 0);
      sheet.getRange(currentRow, col++).setValue(funnelData.total.positive.counts['Satış'] || 0);
      const totalCiroValue = funnelData.total.totalCiro || 0;
      sheet.getRange(currentRow, col++).setValue(totalCiroValue);
      sheet.getRange(currentRow, col - 1).setNumberFormat('#,##0.00" ₺"');
      
      // Toplam satırını vurgula
      sheet.getRange(currentRow, 1, 1, positiveHeaders.length)
        .setFontWeight('bold')
        .setBackground('#2E7D32')
        .setFontColor('#FFFFFF');
      
      currentRow += 3;
      
      // ========================================
      // NEGATİF FUNNEL TABLOSU
      // ========================================
      sheet.getRange(currentRow, 1).setValue('❌ NEGATİF FUNNEL');
      sheet.getRange(currentRow, 1, 1, 7).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#F44336').setFontColor('#FFFFFF');
      currentRow++;
      
      const negativeHeaders = [
        'Temsilci',
        'Geçersiz Numara',
        'Ulaşılamadı',
        'İlgilenmiyor',
        'Kurumsal',
        'Randevu İptal/Ertelendi',
        'Fırsat Kaybedilen'
      ];
      
      for (let col = 1; col <= negativeHeaders.length; col++) {
        sheet.getRange(currentRow, col).setValue(negativeHeaders[col - 1]);
        sheet.getRange(currentRow, col).setFontWeight('bold').setBackground('#FFCDD2');
      }
      currentRow++;
      
      // Her temsilci için satır (aynı sıralama)
      for (let i = 0; i < funnelData.employees.length; i++) {
        const emp = funnelData.employees[i];
        const f = emp.funnel;
        
        let col = 1;
        sheet.getRange(currentRow, col++).setValue(`${emp.employeeCode} - ${emp.employeeName}`);
        sheet.getRange(currentRow, col++).setValue(f.negative.counts['Geçersiz Numara'] || 0);
        sheet.getRange(currentRow, col++).setValue(f.negative.counts['Ulaşılamadı'] || 0);
        sheet.getRange(currentRow, col++).setValue(f.negative.counts['İlgilenmiyor'] || 0);
        sheet.getRange(currentRow, col++).setValue(f.negative.counts['Kurumsal'] || 0);
        sheet.getRange(currentRow, col++).setValue(f.negative.counts['Randevu İptal/Ertelendi'] || 0);
        sheet.getRange(currentRow, col++).setValue(f.negative.counts['Fırsat Kaybedilen'] || 0);
        
        // Zebra striping
        if (i % 2 === 0) {
          sheet.getRange(currentRow, 1, 1, negativeHeaders.length).setBackground('#FFEBEE');
        }
        
        currentRow++;
      }
      
      // NEGATİF TOPLAM SATIRI
      currentRow++;
      col = 1;
      sheet.getRange(currentRow, col++).setValue('📊 TOPLAM');
      sheet.getRange(currentRow, col++).setValue(funnelData.total.negative.counts['Geçersiz Numara'] || 0);
      sheet.getRange(currentRow, col++).setValue(funnelData.total.negative.counts['Ulaşılamadı'] || 0);
      sheet.getRange(currentRow, col++).setValue(funnelData.total.negative.counts['İlgilenmiyor'] || 0);
      sheet.getRange(currentRow, col++).setValue(funnelData.total.negative.counts['Kurumsal'] || 0);
      sheet.getRange(currentRow, col++).setValue(funnelData.total.negative.counts['Randevu İptal/Ertelendi'] || 0);
      sheet.getRange(currentRow, col++).setValue(funnelData.total.negative.counts['Fırsat Kaybedilen'] || 0);
      
      // Toplam satırını vurgula
      sheet.getRange(currentRow, 1, 1, negativeHeaders.length)
        .setFontWeight('bold')
        .setBackground('#C62828')
        .setFontColor('#FFFFFF');
      
      currentRow += 2;
      
      // Sütun genişliklerini ayarla
      sheet.setColumnWidth(1, 250); // Temsilci
      for (let c = 2; c <= 6; c++) {
        sheet.setColumnWidth(c, 120);
      }
      sheet.setColumnWidth(7, 150); // Ciro kolonu daha geniş
      
    } else {
      // ========================================
      // TEK TEMSİLCİ İÇİN DETAYLI FORMAT
      // ========================================
      
      // POZİTİF FUNNEL
      sheet.getRange(currentRow, 1).setValue('✅ POZİTİF FUNNEL (Sales Funnel)');
      sheet.getRange(currentRow, 1, 1, 5).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#4CAF50').setFontColor('#FFFFFF');
      currentRow++;
      
      // Başlıklar
      sheet.getRange(currentRow, 1).setValue('Adım');
      sheet.getRange(currentRow, 2).setValue('Aktivite');
      sheet.getRange(currentRow, 3).setValue('Sayı');
      sheet.getRange(currentRow, 4).setValue('Yüzde');
      sheet.getRange(currentRow, 5).setValue('Görsel');
      sheet.getRange(currentRow, 1, 1, 5).setFontWeight('bold').setBackground('#C8E6C9');
      currentRow++;
      
      // Pozitif funnel verileri
      const positiveSteps = [
        { key: 'Arama', label: '1. Arama' },
        { key: 'Fırsat', label: '2. Fırsat' },
        { key: 'Randevu', label: '3. Randevu' },
        { key: 'Toplantı', label: '4. Toplantı' },
        { key: 'Satış', label: '5. Satış' }
      ];
      
      for (const step of positiveSteps) {
        const count = funnelData.positive.counts[step.key] || 0;
        const percentage = funnelData.positive.percentages[step.key] || '0.0';
        
        sheet.getRange(currentRow, 1).setValue(step.label);
        sheet.getRange(currentRow, 2).setValue(step.key);
        sheet.getRange(currentRow, 3).setValue(count);
        sheet.getRange(currentRow, 4).setValue(percentage + '%');
        
        // Görsel bar (basit)
        const barLength = Math.min(20, Math.round(count / Math.max(funnelData.positive.counts['Arama'] || 1, 1) * 20));
        sheet.getRange(currentRow, 5).setValue('█'.repeat(barLength));
        sheet.getRange(currentRow, 5).setFontColor('#4CAF50');
        
        currentRow++;
      }
      
      // Ciro satırı ekle
      currentRow++;
      sheet.getRange(currentRow, 1).setValue('💰 TOPLAM CİRO');
      sheet.getRange(currentRow, 1, 1, 2).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setBackground('#FFC107').setFontColor('#000000');
      const totalCiroValue = funnelData.totalCiro || 0;
      sheet.getRange(currentRow, 3).setValue(totalCiroValue);
      sheet.getRange(currentRow, 3).setNumberFormat('#,##0.00" ₺"').setFontWeight('bold').setFontSize(14);
      sheet.getRange(currentRow, 3, 1, 2).merge();
      currentRow += 2;
      
      // NEGATİF FUNNEL
      sheet.getRange(currentRow, 1).setValue('❌ NEGATİF FUNNEL (Loss Funnel)');
      sheet.getRange(currentRow, 1, 1, 5).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#F44336').setFontColor('#FFFFFF');
      currentRow++;
      
      // Başlıklar
      sheet.getRange(currentRow, 1).setValue('Kategori');
      sheet.getRange(currentRow, 2).setValue('Aktivite');
      sheet.getRange(currentRow, 3).setValue('Sayı');
      sheet.getRange(currentRow, 4).setValue('Yüzde');
      sheet.getRange(currentRow, 5).setValue('Görsel');
      sheet.getRange(currentRow, 1, 1, 5).setFontWeight('bold').setBackground('#FFCDD2');
      currentRow++;
      
      // Negatif funnel verileri
      const negativeCategories = Object.keys(funnelData.negative.counts);
      for (const category of negativeCategories) {
        const count = funnelData.negative.counts[category] || 0;
        const percentage = funnelData.negative.percentages[category] || '0.0';
        
        sheet.getRange(currentRow, 1).setValue(category);
        sheet.getRange(currentRow, 2).setValue(category);
        sheet.getRange(currentRow, 3).setValue(count);
        sheet.getRange(currentRow, 4).setValue(percentage + '%');
        
        // Görsel bar
        const maxNegative = Math.max(...Object.values(funnelData.negative.counts));
        const barLength = maxNegative > 0 ? Math.min(20, Math.round(count / maxNegative * 20)) : 0;
        sheet.getRange(currentRow, 5).setValue('█'.repeat(barLength));
        sheet.getRange(currentRow, 5).setFontColor('#F44336');
        
        currentRow++;
      }
      
      currentRow += 2;
      
      // ÖZET
      sheet.getRange(currentRow, 1).setValue('📊 ÖZET');
      sheet.getRange(currentRow, 1, 1, 5).merge();
      sheet.getRange(currentRow, 1).setFontWeight('bold').setFontSize(14).setBackground('#FF9800').setFontColor('#FFFFFF');
      currentRow++;
      
      sheet.getRange(currentRow, 1).setValue('Toplam Aktivite:');
      sheet.getRange(currentRow, 2).setValue(funnelData.total);
      sheet.getRange(currentRow, 1).setFontWeight('bold');
      currentRow++;
      
      const positiveTotal = Object.values(funnelData.positive.counts).reduce((a, b) => a + b, 0) - funnelData.positive.counts['Arama'];
      const negativeTotal = Object.values(funnelData.negative.counts).reduce((a, b) => a + b, 0);
      
      sheet.getRange(currentRow, 1).setValue('Pozitif Toplam:');
      sheet.getRange(currentRow, 2).setValue(positiveTotal);
      sheet.getRange(currentRow, 1).setFontWeight('bold');
      currentRow++;
      
      sheet.getRange(currentRow, 1).setValue('Negatif Toplam:');
      sheet.getRange(currentRow, 2).setValue(negativeTotal);
      sheet.getRange(currentRow, 1).setFontWeight('bold');
      currentRow++;
      
      // Sütun genişliklerini ayarla
      sheet.setColumnWidth(1, 200);
      sheet.setColumnWidth(2, 200);
      sheet.setColumnWidth(3, 100);
      sheet.setColumnWidth(4, 100);
      sheet.setColumnWidth(5, 300);
    }
    
    // Excel export butonu ekle
    currentRow += 2;
    sheet.getRange(currentRow, 1).setValue('💾 Excel Export için: Menüden "Funnel Raporu Excel Export" seçin');
    sheet.getRange(currentRow, 1, 1, 15).merge();
    sheet.getRange(currentRow, 1).setFontStyle('italic').setFontColor('#666');
    
    console.log('✅ Funnel Raporu sayfası oluşturuldu');
    return sheet;
    
  } catch (error) {
    console.error('❌ createFunnelReportSheet hatası:', error);
    throw error;
  }
}

/**
 * 📊 Funnel Raporu Excel Export
 * CSV formatında export eder
 */
function exportFunnelReportToExcel() {
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = managerFile.getSheetByName('FUNNEL RAPORU');
    
    if (!sheet) {
      SpreadsheetApp.getUi().alert('❌ Hata', 'Funnel Raporu sayfası bulunamadı. Önce raporu oluşturun.', SpreadsheetApp.getUi().ButtonSet.OK);
      return;
    }
    
    // Veriyi al
    const data = sheet.getDataRange().getValues();
    
    // CSV formatına çevir
    const csv = data.map(row => 
      row.map(cell => {
        const value = String(cell || '');
        // CSV için özel karakterleri escape et
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    ).join('\n');
    
    // BOM ekle (UTF-8 için Excel uyumluluğu)
    const csvWithBOM = '\uFEFF' + csv;
    
    // Blob oluştur
    const blob = Utilities.newBlob(csvWithBOM, 'text/csv;charset=utf-8', 'Funnel_Raporu.csv');
    
    // Drive'a kaydet
    const folder = DriveApp.getRootFolder(); // Veya belirli bir klasör
    const file = folder.createFile(blob);
    
    // Download URL oluştur
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${file.getId()}`;
    
    SpreadsheetApp.getUi().alert(
      '✅ Excel Export Tamamlandı',
      `📊 Funnel Raporu Excel formatında export edildi!\n\n📁 Dosya: ${file.getName()}\n🔗 Link: ${file.getUrl()}\n\nDosyayı Drive'dan indirebilirsiniz.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    console.log('✅ Funnel Raporu Excel export edildi:', file.getUrl());
    return { success: true, url: file.getUrl(), filename: file.getName() };
    
  } catch (error) {
    console.error('❌ exportFunnelReportToExcel hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Excel export hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * Temsilci dosyasını al
 */
/**
 * @deprecated Bu fonksiyon yavaş (DriveApp.getFilesByName kullanıyor)
 * Bunun yerine findEmployeeFile() kullan (EMPLOYEE_FILES mapping ile hızlı)
 */
function getEmployeeFile(employeeCode) {
  // findEmployeeFile kullan (100x daha hızlı - direkt file ID ile)
  return findEmployeeFile(employeeCode);
}

// ========================================
// 👥 PERSONEL SHEET YÖNETİMİ
// ========================================

/**
 * 👥 Personel Sheet'ini Oluştur/Güncelle
 * Yönetici dosyasında "Personel" sheet'ini oluşturur ve mevcut verileri doldurur
 * 
 * Kolonlar:
 * - Kod: Temsilci/Portföy Yöneticisi kodu
 * - İsim Soyisim: Tam isim
 * - Durum: Aktif/Pasif
 * - Dosya ID: Google Sheets dosya ID
 * - Portföy Yöneticisi: Bağlı olduğu portföy yöneticisi kodu (boş = kendisi yönetici)
 * 
 * Mantık:
 * - Kod numarası ≥ 20 veya özel kodlar (SO 003, RS 22) = Portföy Yöneticisi (Portföy Yöneticisi boş)
 * - Kod numarası < 20 = Temsilci (Portföy Yöneticisi doldurulabilir)
 */
function createOrUpdatePersonelSheet() {
  console.log('👥 Personel sheet oluşturuluyor/güncelleniyor...');
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = 'Personel';
    
    // Sheet'i al veya oluştur
    let sheet = managerFile.getSheetByName(sheetName);
    if (!sheet) {
      sheet = managerFile.insertSheet(sheetName);
      console.log(`✅ "${sheetName}" sheet'i oluşturuldu`);
    } else {
      console.log(`✅ "${sheetName}" sheet'i mevcut, güncelleniyor`);
    }
    
    // Header'ları oluştur
    const headers = ['Kod', 'İsim Soyisim', 'Durum', 'Dosya ID', 'Portföy Yöneticisi'];
    const lastCol = sheet.getLastColumn();
    
    // Header'ları kontrol et ve güncelle
    if (lastCol === 0 || lastCol !== headers.length) {
      // Header'ları yaz
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      console.log('✅ Header\'lar yazıldı');
    } else {
      // Mevcut header'ları kontrol et
      const existingHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      const headersMatch = existingHeaders.every((h, i) => String(h).trim() === headers[i]);
      
      if (!headersMatch) {
        // Header'ları güncelle
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        console.log('✅ Header\'lar güncellendi');
      }
    }
    
    // Header stillerini uygula
    applyHeaderStyling(sheet, 'Personel');
    
    // Mevcut verileri topla (EMPLOYEE_CODES ve EMPLOYEE_FILES'den)
    const employeeData = [];
    
    // Tüm kodları birleştir (EMPLOYEE_CODES + EMPLOYEE_FILES)
    const allCodes = new Set();
    
    // EMPLOYEE_CODES'dan ekle
    for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
      allCodes.add(code);
    }
    
    // EMPLOYEE_FILES'den ekle (EMPLOYEE_CODES'da olmayanları)
    for (const code in EMPLOYEE_FILES) {
      allCodes.add(code);
    }
    
    // YENİ PERSONEL KAYITLARI (Manuel eklenenler)
    const newEmployees = [
      { code: 'SS 014', name: 'Seçil Sayan', portfoyYoneticisi: 'RS 22', fileId: '1bb5bxhIU-uIZ9zXEDjJN-JkkcCvwm9EFkMU2CMIUAcc' },
      { code: 'NK 015', name: 'Neslihan Kaya', portfoyYoneticisi: 'RS 22', fileId: '1raSTU4mZdMc63i27KRCFLw3GNDOd3c4u60lc9H8Tdu4' },
      { code: 'AD 016', name: 'Aslı Doğan', portfoyYoneticisi: 'OC 23', fileId: '1eLrz837xfkWn1Subfbnu9oN2CLCPFnp35ttmSiIUoSM' }
    ];
    
    // Yeni personelleri ekle
    for (const emp of newEmployees) {
      allCodes.add(emp.code);
    }
    
    // Her kod için veri hazırla
    for (const code of allCodes) {
      // Yeni personel kayıtlarından kontrol et
      const newEmp = newEmployees.find(e => e.code === code);
      
      let name = '';
      let portfoyYoneticisi = '';
      
      if (newEmp) {
        // Yeni personel kaydı
        name = newEmp.name;
        portfoyYoneticisi = newEmp.portfoyYoneticisi || '';
        // Yeni personel için dosya ID'yi de al
        if (newEmp.fileId) {
          // fileId'yi özel olarak kullan
        }
      } else {
        // Mevcut kayıtlardan
        name = CRM_CONFIG.EMPLOYEE_CODES[code] || ''; // İsim varsa al
        
        // Portföy Yöneticisi mantığı
        // Kod numarasını parse et (örn: "SB 004" -> 4, "RS 22" -> 22)
        const codeMatch = String(code).match(/(\d+)/);
        const codeNumber = codeMatch ? parseInt(codeMatch[1], 10) : 0;
        
        // Özel portföy yöneticileri: SO 003, RS 22, OC 23 (Özlem Çoksatan)
        const isSpecialManager = code === 'SO 003' || code === 'RS 22' || code === 'OC 23';
        
        // Portföy Yöneticisi belirleme:
        // - Kod numarası ≥ 20 veya özel kodlar = Portföy Yöneticisi (boş)
        // - Kod numarası < 20 = Temsilci (şimdilik boş, kullanıcı doldurur)
        if (codeNumber >= 20 || isSpecialManager) {
          // Portföy Yöneticisi (kendisi yönetici, boş bırak)
          portfoyYoneticisi = '';
        } else {
          // Temsilci (şimdilik boş, kullanıcı manuel doldurur)
          portfoyYoneticisi = '';
        }
      }
      
      // Dosya ID'yi belirle (yeni personel için özel, diğerleri için EMPLOYEE_FILES)
      let fileId = '';
      if (newEmp && newEmp.fileId) {
        fileId = newEmp.fileId;
      } else {
        fileId = EMPLOYEE_FILES[code] || '';
      }
      
      // BH 007'yi pasif yap
      let durum = 'Aktif'; // Varsayılan "Aktif"
      if (code === 'BH 007') {
        durum = 'Pasif';
      }
      
      employeeData.push([code, name, durum, fileId, portfoyYoneticisi]);
    }
    
    // Mevcut verileri kontrol et (duplicate önleme)
    const lastRow = sheet.getLastRow();
    let existingData = [];
    let existingCodes = new Set();
    
    if (lastRow > 1) {
      // Mevcut verileri oku (batch)
      existingData = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
      existingCodes = new Set(existingData.map(row => String(row[0] || '').trim()));
    }
    
    // Yeni verileri ekle veya güncelle (mevcut verileri koru)
    const rowsToUpdate = [];
    const rowsToAdd = [];
    
    for (const rowData of employeeData) {
      const code = String(rowData[0] || '').trim();
      
      if (existingCodes.has(code)) {
        // Mevcut satırı güncelle (ama mevcut verileri koru)
        const existingRowIndex = existingData.findIndex(row => String(row[0] || '').trim() === code) + 2;
        if (existingRowIndex > 1) {
          // Mevcut satırdan verileri al
          const existingRow = existingData[existingRowIndex - 2];
          const updatedRow = [
            code, // Kod (değişmez)
            rowData[1] || existingRow[1] || '', // İsim (yeni varsa güncelle, yoksa mevcut)
            code === 'BH 007' ? 'Pasif' : (existingRow[2] || rowData[2] || 'Aktif'), // Durum (BH 007 pasif, diğerleri mevcut)
            rowData[3] || existingRow[3] || '', // Dosya ID (yeni varsa güncelle, yoksa mevcut)
            rowData[4] || existingRow[4] || '' // Portföy Yöneticisi (yeni varsa güncelle, yoksa mevcut)
          ];
          rowsToUpdate.push({ row: existingRowIndex, data: updatedRow });
        }
      } else {
        // Yeni satır ekle
        rowsToAdd.push(rowData);
      }
    }
    
    // Batch güncelleme
    if (rowsToUpdate.length > 0) {
      for (const update of rowsToUpdate) {
        sheet.getRange(update.row, 1, 1, headers.length).setValues([update.data]);
      }
      console.log(`✅ ${rowsToUpdate.length} satır güncellendi`);
    }
    
    // Batch ekleme
    if (rowsToAdd.length > 0) {
      const nextRow = lastRow + 1;
      sheet.getRange(nextRow, 1, rowsToAdd.length, headers.length).setValues(rowsToAdd);
      console.log(`✅ ${rowsToAdd.length} yeni satır eklendi`);
    }
    
    // Kolon genişliklerini optimize et
    sheet.setColumnWidth(1, 100);  // Kod
    sheet.setColumnWidth(2, 200);  // İsim Soyisim
    sheet.setColumnWidth(3, 100); // Durum
    sheet.setColumnWidth(4, 250);  // Dosya ID
    sheet.setColumnWidth(5, 180);  // Portföy Yöneticisi
    
    // Data validation: Durum kolonu için
    const durumIndex = headers.indexOf('Durum') + 1; // 1-based
    const lastDataRow = sheet.getLastRow();
    if (lastDataRow > 1) {
      const durumRange = sheet.getRange(2, durumIndex, lastDataRow - 1, 1);
      const durumRule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['Aktif', 'Pasif'], true)
        .build();
      durumRange.setDataValidation(durumRule);
    }
    
    console.log('✅ Personel sheet başarıyla oluşturuldu/güncellendi');
    
    SpreadsheetApp.getUi().alert(
      '✅ Personel Sheet Hazır',
      `📊 ${employeeData.length} personel kaydı işlendi\n\n` +
      `📋 Kolonlar:\n` +
      `- Kod\n` +
      `- İsim Soyisim\n` +
      `- Durum\n` +
      `- Dosya ID\n` +
      `- Portföy Yöneticisi\n\n` +
      `💡 Portföy Yöneticisi kolonunu manuel olarak doldurun.`,
      SpreadsheetApp.getUi().ButtonSet.OK
    );
    
    return { success: true, sheetName: sheetName, totalRecords: employeeData.length };
    
  } catch (error) {
    console.error('❌ createOrUpdatePersonelSheet hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Personel sheet oluşturma hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// ========================================
// 📊 LOG SİSTEMİ İYİLEŞTİRMELERİ (23. Bölüm Standartları)
// ========================================

/**
 * 23.1 - PRIMARY KPI'LARI HESAPLA
 * Log kayıtlarından KPI'ları hesaplar (Salesforce/HubSpot standartları)
 * @param {Array} logs - Log kayıtları [{date, aktivite, log, ...}]
 * @returns {Object} KPI objesi
 */
function calculateKPIs(logs) {
  try {
    const totalContacts = logs.length;
    
    if (totalContacts === 0) {
      return {
        totalContacts: 0,
        attempts: 0,
        connections: 0,
        connectionRate: 0,
        leadsQualified: 0,
        opportunitiesCreated: 0,
        conversionRate: 0,
        opportunityWinRate: 0,
        noAnswerRate: 0,
        notInterestedRate: 0,
        invalidRate: 0,
        aktiviteCounts: {},
        positiveCount: 0,
        negativeCount: 0
      };
    }
    
    // Aktivite bazlı sayım (normalize edilmiş)
    const aktiviteCounts = {};
    logs.forEach(log => {
      const aktivite = normalizeActivity(log.aktivite || '');
      aktiviteCounts[aktivite] = (aktiviteCounts[aktivite] || 0) + 1;
    });
    
    // Negatif aktiviteler (23.1 - Negative Metrics)
    const negativeActivities = ['Ulaşılamadı', 'İlgilenmiyor', 'Geçersiz Numara', 'Kurumsal'];
    const negativeCount = negativeActivities.reduce((sum, act) => 
      sum + (aktiviteCounts[act] || 0), 0
    );
    
    // Pozitif aktiviteler (23.1 - Conversion Metrics)
    const positiveActivities = [
      'Randevu Alındı', 
      'İleri Tarih Randevu',
      'Fırsat İletildi', 
      'Toplantı Tamamlandı', 
      'Satış Yapıldı',
      'Bilgi Verildi'
    ];
    const positiveCount = positiveActivities.reduce((sum, act) => 
      sum + (aktiviteCounts[act] || 0), 0
    );
    
    // Connections (Ulaşılan) = Total - Ulaşılamadı - Geçersiz Numara
    const connections = totalContacts - (aktiviteCounts['Ulaşılamadı'] || 0) - (aktiviteCounts['Geçersiz Numara'] || 0);
    
    // KPI Hesaplamaları (23.1 - Primary KPIs)
    const kpis = {
      // Activity Metrics
      totalContacts: totalContacts,
      attempts: totalContacts,
      connections: connections,
      connectionRate: totalContacts > 0 ? (connections / totalContacts) * 100 : 0,
      
      // Conversion Metrics
      leadsQualified: (aktiviteCounts['Randevu Alındı'] || 0) + 
                      (aktiviteCounts['İleri Tarih Randevu'] || 0) +
                      (aktiviteCounts['Fırsat İletildi'] || 0) + 
                      (aktiviteCounts['Bilgi Verildi'] || 0),
      opportunitiesCreated: (aktiviteCounts['Randevu Alındı'] || 0) + 
                            (aktiviteCounts['İleri Tarih Randevu'] || 0),
      conversionRate: connections > 0 ? 
        (((aktiviteCounts['Randevu Alındı'] || 0) + (aktiviteCounts['İleri Tarih Randevu'] || 0)) / connections) * 100 : 0,
      opportunityWinRate: (aktiviteCounts['Randevu Alındı'] || 0) > 0 
        ? ((aktiviteCounts['Satış Yapıldı'] || 0) / (aktiviteCounts['Randevu Alındı'] || 0)) * 100 
        : 0,
      
      // Negative Metrics
      noAnswerRate: totalContacts > 0 ? ((aktiviteCounts['Ulaşılamadı'] || 0) / totalContacts) * 100 : 0,
      notInterestedRate: connections > 0 ? ((aktiviteCounts['İlgilenmiyor'] || 0) / connections) * 100 : 0,
      invalidRate: totalContacts > 0 ? ((aktiviteCounts['Geçersiz Numara'] || 0) / totalContacts) * 100 : 0,
      
      // Activity Breakdown
      aktiviteCounts: aktiviteCounts,
      positiveCount: positiveCount,
      negativeCount: negativeCount
    };
    
    return kpis;
    
  } catch (error) {
    console.error('❌ calculateKPIs hatası:', error);
    throw error;
  }
}

/**
 * Aktivite ismini normalize et (büyük/küçük harf, boşluk, typo toleranslı)
 * @param {string} aktivite - Ham aktivite ismi
 * @returns {string} Normalize edilmiş aktivite ismi
 */
function normalizeActivity(aktivite) {
  if (!aktivite || typeof aktivite !== 'string') return '';
  
  const normalized = aktivite.trim();
  
  // Aktivite mapping (typo toleranslı)
  const activityMap = {
    'randevu alındı': 'Randevu Alındı',
    'randevu alindi': 'Randevu Alındı',
    'ileri tarih randevu': 'İleri Tarih Randevu',
    'ileri tarih': 'İleri Tarih Randevu',
    'fırsat iletildi': 'Fırsat İletildi',
    'firsat iletildi': 'Fırsat İletildi',
    'toplantı tamamlandı': 'Toplantı Tamamlandı',
    'toplanti tamamlandi': 'Toplantı Tamamlandı',
    'satış yapıldı': 'Satış Yapıldı',
    'satis yapildi': 'Satış Yapıldı',
    'bilgi verildi': 'Bilgi Verildi',
    'yeniden aranacak': 'Yeniden Aranacak',
    'ulaşılamadı': 'Ulaşılamadı',
    'ulasilamadi': 'Ulaşılamadı',
    'ilgilenmiyor': 'İlgilenmiyor',
    'geçersiz numara': 'Geçersiz Numara',
    'gecersiz numara': 'Geçersiz Numara',
    'kurumsal': 'Kurumsal',
    'randevu iptal oldu': 'Randevu İptal oldu',
    'randevu ertelendi': 'Randevu Ertelendi',
    'fırsat kaybedilen': 'Fırsat Kaybedilen'
  };
  
  const lowerKey = normalized.toLowerCase();
  return activityMap[lowerKey] || normalized; // Mapping'de yoksa olduğu gibi döndür
}

/**
 * Log formatını standardize et (23.1 standartlarına göre)
 * @param {Object} log - Ham log objesi
 * @returns {Object} Standardize edilmiş log objesi
 */
function standardizeLogFormat(log) {
  try {
    // Tarih parse et
    let date = null;
    if (log.date instanceof Date) {
      date = log.date;
    } else if (log.Tarih instanceof Date) {
      date = log.Tarih;
    } else if (log.date || log.Tarih) {
      date = parseDdMmYyyy(log.date || log.Tarih) || new Date(String(log.date || log.Tarih));
    } else {
      date = new Date(); // Varsayılan: bugün
    }
    
    // Aktivite normalize et
    const activity = normalizeActivity(log.aktivite || log.Aktivite || '');
    
    // Log detayı
    const logDetail = log.log || log['Log Detayı'] || '';
    
    // Saat parse et
    let time = null;
    if (log.time || log.Saat) {
      const timeStr = String(log.time || log.Saat || '').trim();
      if (timeStr) {
        // HH:mm:ss veya HH:mm formatını parse et
        const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
        if (timeMatch) {
          const hours = parseInt(timeMatch[1], 10);
          const minutes = parseInt(timeMatch[2], 10);
          const seconds = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
          time = hours * 3600 + minutes * 60 + seconds; // Saniye cinsinden
        }
      }
    }
    
    return {
      timestamp: date.toISOString(),
      date: date,
      time: time,
      activity: activity,
      logDetail: logDetail,
      source: log.source || log['Kaynak Sayfa'] || 'Format Tablo',
      code: log.code || log.Kod || '',
      companyName: log.companyName || log['Company name'] || '',
      employeeCode: log.employeeCode || log.employee || ''
    };
    
  } catch (error) {
    console.error('❌ standardizeLogFormat hatası:', error);
    // Hata durumunda minimum format döndür
    return {
      timestamp: new Date().toISOString(),
      date: new Date(),
      time: null,
      activity: String(log.aktivite || log.Aktivite || '').trim(),
      logDetail: String(log.log || log['Log Detayı'] || '').trim(),
      source: 'Format Tablo',
      code: '',
      companyName: '',
      employeeCode: ''
    };
  }
}

/**
 * Tarih parse et (dd.MM.yyyy formatından)
 * @param {string|Date} dateStr - Tarih string veya Date objesi
 * @returns {Date|null} Parse edilmiş Date objesi
 */
function parseDdMmYyyy(dateStr) {
  if (!dateStr) return null;
  if (dateStr instanceof Date) return dateStr;
  
  const str = String(dateStr).trim();
  
  // dd.MM.yyyy formatı
  const match = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // JavaScript month 0-based
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }
  
  // yyyy-MM-dd formatı
  const match2 = str.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (match2) {
    const year = parseInt(match2[1], 10);
    const month = parseInt(match2[2], 10) - 1;
    const day = parseInt(match2[3], 10);
    return new Date(year, month, day);
  }
  
  // Varsayılan Date parse
  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

console.log("🔧 DEBUG: Ana dosyaya eklendi");




