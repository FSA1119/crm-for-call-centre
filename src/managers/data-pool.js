// ========================================
// 📊 DATA POOL - Ham Veri → Format Tablo İşlemleri
// ========================================
// Merkezi Data Pool sistemi
// Tüm Ham Veri → Format Tablo dönüşümleri burada yönetilir
// ========================================

// ========================================
// 📋 CRM CONFIGURATION
// ========================================

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
    'OC 23': 'Özlem Çoksatan',
    'SS 014': 'Seçil Sayan',
    'NK 015': 'Neslihan Kaya',
    'AD 016': 'Aslı Doğan',
    'NB 017': 'Neşe Bülbül'
  },
  
  // Manager file
  MANAGER_FILE: 'FSA_019 - Yonetici Takip Dosyasi',
  MANAGER_FILE_ID: '11IsZpaGgXtgpxrie9F_uVwp6uJPcueGhqB73WhZn60A'
};

// ========================================
// 📋 FORMAT TABLO YAPISI (26 Sütun - SABİT)
// ========================================

const FORMAT_TABLE_HEADERS = [
  'Kod',              // A - Temsilci kodu (otomatik)
  'Keyword',          // B
  'Location',         // C
  'Company name',     // D - ⚠️ ZORUNLU
  'Category',         // E
  'Website',          // F
  'CMS Adı',          // G
  'CMS Grubu',        // H
  'Phone',            // I - ⚠️ ZORUNLU
  'Yetkili Tel',      // J
  'Mail',             // K
  'İsim Soyisim',     // L
  'Aktivite',         // M - Dropdown
  'Aktivite Tarihi',  // N - Datepicker
  'Yorum',            // O
  'Yönetici Not',     // P
  'E-Ticaret İzi',    // Q
  'Site Hızı',         // R
  'Site Trafiği',      // S
  'Log',               // T
  'Toplantı formatı',  // U - Dropdown
  'Address',           // V
  'City',              // W
  'Rating count',      // X
  'Review',            // Y - Özel format: "R{value}"
  'Maplink'            // Z
];

// ========================================
// 📋 AKTİVİTE SEÇENEKLERİ
// ========================================

const ACTIVITY_OPTIONS = [
  'Randevu Alındı',
  'İleri Tarih Randevu',
  'Yeniden Aranacak',
  'Bilgi Verildi',
  'Fırsat İletildi',
  'İlgilenmiyor',
  'Ulaşılamadı',
  'Geçersiz Numara',
  'Kurumsal'
];

const MEETING_FORMAT_OPTIONS = [
  'Yüz Yüze',
  'Online',
  'Telefon'
];

// ========================================
// 🔧 UTILITY FUNCTIONS
// ========================================

/**
 * Sütun adını bul (case-insensitive, kısmi eşleşme)
 * @param {Array} headers - Header array
 * @param {string|Array} columnNames - Aranacak sütun adı veya adları
 * @returns {number} - Sütun index'i (-1 bulunamazsa)
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

/**
 * Format Tablo sayfası mı kontrol et
 * @param {Sheet} sheet - Kontrol edilecek sayfa
 * @returns {boolean} - Format Tablo ise true
 */
function isFormatTable(sheet) {
  const sheetName = sheet.getName();
  
  // Hariç tutulan sayfalar
  const excludedSheets = [
    'Ham veri', 'ham veri',
    'Randevularım', 'Fırsatlarım', 'Toplantılarım',
    'Raporlarım', 'Günlük Rapor', 'Haftalık Rapor', 'Detaylı Rapor',
    'Config', 'config', 'CONFIG'
  ];
  
  // Hariç tutulan sayfalar Format Tablo değildir
  if (excludedSheets.includes(sheetName)) {
    return false;
  }
  
  // Diğer tüm sayfalar Format Tablo'dur
  return true;
}

/**
 * Türkçe karakter decode
 * @param {string} text - Decode edilecek metin
 * @returns {string} - Decode edilmiş metin
 */
function decodeTurkishText(text) {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  try {
    // URL decoding
    let decoded = decodeURIComponent(text);
    
    // Türkçe karakter replacements
    const turkishReplacements = {
      '%C4%B0': 'İ', '%C4%B1': 'ı',
      '%C3%96': 'Ö', '%C3%B6': 'ö',
      '%C3%9C': 'Ü', '%C3%BC': 'ü',
      '%C5%9E': 'Ş', '%C5%9F': 'ş',
      '%C4%9E': 'Ğ', '%C4%9F': 'ğ',
      '%C3%87': 'Ç', '%C3%A7': 'ç'
    };
    
    Object.keys(turkishReplacements).forEach(encoded => {
      decoded = decoded.replace(new RegExp(encoded, 'g'), turkishReplacements[encoded]);
    });
    
    return decoded;
  } catch (error) {
    console.warn('Error decoding text:', text, error);
    return text; // Orijinal metni döndür
  }
}

/**
 * URL normalize et
 * @param {string} url - Normalize edilecek URL
 * @returns {string} - Normalize edilmiş URL
 */
function normalizeUrl(url) {
  if (!url) return '';
  let cleaned = String(url).trim();
  if (!cleaned) return '';
  
  // Boşlukları temizle
  cleaned = cleaned.replace(/\s+/g, '');
  
  // Zaten normalize edilmişse atla
  if (/^https?:\/\//i.test(cleaned)) {
    cleaned = cleaned.replace(/\/+$/, ''); // Trailing slash temizle
    return cleaned;
  }
  
  // http/https yoksa ekle
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  
  // Trailing slash temizle
  cleaned = cleaned.replace(/\/+$/, '');
  
  return cleaned;
}

// ========================================
// 📊 HAM VERİ → FORMAT TABLO MAPPING
// ========================================

/**
 * Ham Veri'yi Format Tablo formatına dönüştür
 * @param {Array} hamVeriData - Ham Veri array (header + rows)
 * @param {string} sourceType - Ham Veri tipi: 'A_EXTRAKTOR' | 'B_SCRAPPER' | 'C_APIFY'
 * @returns {Array} - Format Tablo array (header + rows)
 */
function mapHamVeriToFormatTable(hamVeriData, sourceType = 'A_EXTRAKTOR') {
  if (!hamVeriData || hamVeriData.length === 0) {
    throw new Error('Ham Veri boş!');
  }
  
  const hamVeriHeaders = hamVeriData[0];
  const hamVeriRows = hamVeriData.slice(1);
  
  // Format Tablo header'ı
  const formatTableData = [FORMAT_TABLE_HEADERS];
  
  // Spreadsheet adından temsilci kodunu çıkar
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = ss.getName();
  const temsilciKodu = sheetName.split(' - ')[0] || 'Unknown';
  
  // Her satırı map et
  for (const row of hamVeriRows) {
    const mappedRow = new Array(FORMAT_TABLE_HEADERS.length).fill('');
    
    // Kod (A kolonu) - Temsilci kodu
    mappedRow[0] = temsilciKodu;
    
    // Mapping kuralları (case-insensitive)
    const keywordIdx = findColumnIndex(hamVeriHeaders, ['Keyword', 'Searched Keyword', 'keyword']);
    const locationIdx = findColumnIndex(hamVeriHeaders, ['Location', 'location']);
    const companyIdx = findColumnIndex(hamVeriHeaders, ['Company name', 'Title', 'title', 'Company', 'company']);
    const categoryIdx = findColumnIndex(hamVeriHeaders, ['Category', 'categoryName', 'category']);
    const websiteIdx = findColumnIndex(hamVeriHeaders, ['Website', 'website', 'url']);
    const phoneIdx = findColumnIndex(hamVeriHeaders, ['Phone', 'phone']);
    const emailIdx = findColumnIndex(hamVeriHeaders, ['Email 1', 'Email', 'email', 'Mail', 'mail']);
    const addressIdx = findColumnIndex(hamVeriHeaders, ['Address', 'street', 'address']);
    const cityIdx = findColumnIndex(hamVeriHeaders, ['City', 'city']);
    const ratingCountIdx = findColumnIndex(hamVeriHeaders, ['Rating count', 'Ratings', 'reviewsCount', 'rating count']);
    const reviewIdx = findColumnIndex(hamVeriHeaders, ['Review', 'Raviews', 'totalScore', 'review']);
    const cidIdx = findColumnIndex(hamVeriHeaders, ['Cid', 'CID', 'cid']);
    
    // Mapping
    if (keywordIdx !== -1) mappedRow[1] = decodeTurkishText(row[keywordIdx] || '');
    if (locationIdx !== -1) mappedRow[2] = decodeTurkishText(row[locationIdx] || '');
    if (companyIdx !== -1) mappedRow[3] = decodeTurkishText(row[companyIdx] || '');
    if (categoryIdx !== -1) mappedRow[4] = decodeTurkishText(row[categoryIdx] || '');
    if (websiteIdx !== -1) mappedRow[5] = normalizeUrl(row[websiteIdx] || '');
    if (phoneIdx !== -1) mappedRow[8] = (row[phoneIdx] || '').toString().trim();
    if (emailIdx !== -1) mappedRow[10] = (row[emailIdx] || '').toString().trim();
    if (addressIdx !== -1) mappedRow[21] = decodeTurkishText(row[addressIdx] || '');
    if (cityIdx !== -1) mappedRow[22] = decodeTurkishText(row[cityIdx] || '');
    if (ratingCountIdx !== -1) mappedRow[23] = (row[ratingCountIdx] || '').toString();
    
    // Review özel formatı: R{value}
    if (reviewIdx !== -1) {
      let reviewValue = row[reviewIdx];
      if (reviewValue instanceof Date) {
        const month = reviewValue.getMonth() + 1;
        const day = reviewValue.getDate();
        reviewValue = `${month}.${day}`;
      }
      mappedRow[24] = `R${String(reviewValue || '')}`;
    }
    
    // Maplink - CID'den Google Maps linki
    if (cidIdx !== -1 && row[cidIdx]) {
      const cid = row[cidIdx].toString();
      const cidMatch = cid.match(/cid=(\d+)/);
      if (cidMatch) {
        mappedRow[25] = `https://maps.google.com/?cid=${cidMatch[1]}`;
      } else {
        mappedRow[25] = `https://maps.google.com/?cid=${cid}`;
      }
    }
    
    // Log - Otomatik ekle
    mappedRow[19] = `Ham veri'den aktarıldı - ${new Date().toLocaleString('tr-TR')}`;
    
    // Zorunlu alan kontrolü: Company name ve Phone
    const companyName = mappedRow[3];
    const phone = mappedRow[8];
    
    if (!companyName || !phone || phone.replace(/\D+/g, '').length < 7) {
      continue; // Satırı atla
    }
    
    formatTableData.push(mappedRow);
  }
  
  return formatTableData;
}

/**
 * Format Tablo oluştur
 * @param {string} sheetName - Yeni sayfa adı
 * @param {Array} formatTableData - Format Tablo data (header + rows)
 * @returns {Sheet} - Oluşturulan sayfa
 */
function createFormatTable(sheetName, formatTableData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sayfa var mı kontrol et
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    // Varsa temizle
    sheet.clear();
  } else {
    // Yoksa oluştur
    sheet = ss.insertSheet(sheetName);
  }
  
  // Header'ı yaz
  sheet.getRange(1, 1, 1, FORMAT_TABLE_HEADERS.length).setValues([FORMAT_TABLE_HEADERS]);
  
  // Veriyi yaz (batch operation)
  if (formatTableData.length > 1) {
    const dataRows = formatTableData.slice(1);
    sheet.getRange(2, 1, dataRows.length, FORMAT_TABLE_HEADERS.length).setValues(dataRows);
  }
  
  // Styling uygula
  applyFormatTableStyling(sheet);
  
  // Validation uygula
  setDataValidation(sheet);
  
  return sheet;
}

/**
 * Format Tablo styling uygula
 * @param {Sheet} sheet - Styling uygulanacak sayfa
 */
function applyFormatTableStyling(sheet) {
  // Header styling
  const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  headerRange.setBackground('#4285f4');  // Mavi
  headerRange.setFontColor('white');
  headerRange.setFontWeight('bold');
  
  // Freeze header row
  sheet.setFrozenRows(1);
  
  // Auto-resize columns
  sheet.autoResizeColumns(1, sheet.getLastColumn());
  
  // Borders
  const dataRange = sheet.getDataRange();
  dataRange.setBorder(true, true, true, true, true, true);
  
  // Kod ve Review kolonlarını text formatına zorla
  const kodIndex = FORMAT_TABLE_HEADERS.indexOf('Kod') + 1;
  const reviewIndex = FORMAT_TABLE_HEADERS.indexOf('Review') + 1;
  
  if (kodIndex > 0) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, kodIndex, lastRow - 1, 1).setNumberFormat('@'); // Text format
    }
  }
  
  if (reviewIndex > 0) {
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.getRange(2, reviewIndex, lastRow - 1, 1).setNumberFormat('@'); // Text format
    }
  }
}

/**
 * Format Tablo validation uygula
 * @param {Sheet} sheet - Validation uygulanacak sayfa
 */
function setDataValidation(sheet) {
  const aktiviteIndex = FORMAT_TABLE_HEADERS.indexOf('Aktivite') + 1;
  const toplantiFormatIndex = FORMAT_TABLE_HEADERS.indexOf('Toplantı formatı') + 1;
  
  // Minimum 1000 satır için validation uygula
  const minRows = 1000;
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const rowsToValidate = Math.max(minRows, lastRow - 1);
  
  // Aktivite validation
  if (aktiviteIndex > 0) {
    const aktiviteRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(ACTIVITY_OPTIONS, true)
      .setAllowInvalid(true)
      .build();
    
    const validationRange = sheet.getRange(2, aktiviteIndex, rowsToValidate, 1);
    
    // Önce temizle + flush
    validationRange.clearDataValidations();
    SpreadsheetApp.flush(); // ✅ ZORUNLU!
    
    // Sonra ekle + flush
    validationRange.setDataValidation(aktiviteRule);
    SpreadsheetApp.flush(); // ✅ ZORUNLU!
  }
  
  // Toplantı formatı validation
  if (toplantiFormatIndex > 0) {
    const toplantiRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(MEETING_FORMAT_OPTIONS, true)
      .setAllowInvalid(true)
      .build();
    
    const validationRange = sheet.getRange(2, toplantiFormatIndex, rowsToValidate, 1);
    
    // Önce temizle + flush
    validationRange.clearDataValidations();
    SpreadsheetApp.flush(); // ✅ ZORUNLU!
    
    // Sonra ekle + flush
    validationRange.setDataValidation(toplantiRule);
    SpreadsheetApp.flush(); // ✅ ZORUNLU!
  }
}

// ========================================
// 🧹 DATA CLEANUP FUNCTIONS
// ========================================

/**
 * Mükerrerleri bul (Company name + Phone)
 * @param {Sheet} sheet - Kontrol edilecek sayfa
 * @returns {Array} - Mükerrer grupları
 */
function findDuplicatesInFormatTable(sheet) {
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) {
    return [];
  }
  
  const headers = data[0];
  const companyIdx = findColumnIndex(headers, ['Company name', 'Company Name']);
  const phoneIdx = findColumnIndex(headers, ['Phone', 'phone']);
  
  if (companyIdx === -1 || phoneIdx === -1) {
    throw new Error("'Company name' veya 'Phone' kolonu bulunamadı");
  }
  
  // Key oluşturma: company (lowercase) + phone (sadece rakamlar, min 7 hane)
  const keyToRows = new Map();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const company = (row[companyIdx] || '').toString().trim();
    const phoneRaw = (row[phoneIdx] || '').toString();
    const phoneDigits = phoneRaw.replace(/\D+/g, ''); // Sadece rakamlar
    const phoneKey = phoneDigits.length >= 7 ? phoneDigits : ''; // Min 7 hane
    
    if (!company || !phoneKey) continue;
    
    const key = `${company.toLowerCase()}|${phoneKey}`;
    
    if (!keyToRows.has(key)) {
      keyToRows.set(key, []);
    }
    keyToRows.get(key).push(i + 1); // Satır numarası (1-based)
  }
  
  // Mükerrer grupları (2 veya daha fazla satır)
  const duplicates = [...keyToRows.entries()]
    .filter(([, rows]) => rows.length > 1)
    .map(([key, rows]) => {
      const [company, phone] = key.split('|');
      return {
        key,
        company,
        phone,
        count: rows.length,
        rows: rows.sort((a, b) => a - b)
      };
    });
  
  return duplicates;
}

/**
 * Mükerrerleri sil (onaylı)
 * @param {Sheet} sheet - İşlem yapılacak sayfa
 * @returns {Object} - Sonuç bilgisi
 */
function deleteDuplicateRowsWithConfirm(sheet) {
  const ui = SpreadsheetApp.getUi();
  const duplicates = findDuplicatesInFormatTable(sheet);
  
  if (duplicates.length === 0) {
    ui.alert('Mükerrer bulunamadı', 'Tekrar eden kayıt bulunamadı.', ui.ButtonSet.OK);
    return { success: true, deleted: 0 };
  }
  
  // Silinecek satırları topla (her grupta ilk satır kalır)
  const rowsToKeep = new Set();
  const rowsToDelete = [];
  const groupDetails = [];
  
  for (const dup of duplicates) {
    const sortedRows = [...dup.rows].sort((a, b) => a - b);
    const keepRow = sortedRows[0];        // En eski (ilk satır)
    const deleteRows = sortedRows.slice(1); // Diğerleri silinecek
    
    rowsToKeep.add(keepRow);
    rowsToDelete.push(...deleteRows);
    
    groupDetails.push({
      company: dup.company,
      count: dup.count,
      keep: keepRow,
      delete: deleteRows
    });
  }
  
  // Satır numaralarını büyükten küçüğe sırala
  rowsToDelete.sort((a, b) => b - a);
  
  const totalGroups = duplicates.length;
  const totalRows = rowsToDelete.length;
  
  // Özet mesaj
  let summaryMsg = `Mükerrer tarama sonucu:\n\n`;
  summaryMsg += `• Toplam tekrar grup: ${totalGroups}\n`;
  summaryMsg += `• Silinecek toplam satır: ${totalRows}\n`;
  summaryMsg += `• Korunacak kayıt: ${rowsToKeep.size}\n\n`;
  summaryMsg += `Gruplar (ilk 5):\n`;
  
  for (let i = 0; i < Math.min(5, groupDetails.length); i++) {
    const g = groupDetails[i];
    summaryMsg += `\n${i + 1}. "${g.company}" (${g.count} adet):\n`;
    summaryMsg += `   ✅ KALACAK: Satır ${g.keep}\n`;
    summaryMsg += `   🗑️ SİLİNECEK: Satırlar ${g.delete.join(', ')}`;
  }
  
  if (groupDetails.length > 5) {
    summaryMsg += `\n\n... ve ${groupDetails.length - 5} grup daha`;
  }
  
  summaryMsg += `\n\n⚠️ Her grupta en eski kayıt korunacak, diğerleri silinecek.`;
  summaryMsg += `\n\nDevam etmek istiyor musunuz?`;
  
  const confirm = ui.alert('🗑️ Mükerrerleri Sil', summaryMsg, ui.ButtonSet.YES_NO);
  
  if (confirm !== ui.Button.YES) {
    ui.alert('İptal edildi', 'Silme işlemi iptal edildi.', ui.ButtonSet.OK);
    return { success: false, deleted: 0, cancelled: true };
  }
  
  // Satırları sil (büyükten küçüğe)
  let deleted = 0;
  for (const rowNum of rowsToDelete) {
    if (!rowsToKeep.has(rowNum)) {
      try {
        sheet.deleteRow(rowNum);
        deleted++;
      } catch (err) {
        console.error(`Satır ${rowNum} silinirken hata:`, err);
      }
    }
  }
  
  ui.alert('İşlem tamamlandı', `${deleted} satır başarıyla silindi.\n${totalGroups} mükerrer grup temizlendi.`, ui.ButtonSet.OK);
  return { success: true, deleted, totalGroups };
}

/**
 * Telefonu olmayanları sil
 * @param {Sheet} sheet - İşlem yapılacak sayfa
 * @returns {Object} - Sonuç bilgisi
 */
function deleteRowsWithoutPhone(sheet) {
  const ui = SpreadsheetApp.getUi();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const phoneIdx = findColumnIndex(headers, ['Phone', 'phone']);
  
  if (phoneIdx === -1) {
    throw new Error("'Phone' kolonu bulunamadı");
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    ui.alert('Silinecek satır bulunamadı');
    return { success: true, deleted: 0 };
  }
  
  // Batch read
  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  // Silinecek satırları topla
  const rowsToDelete = [];
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const phoneRaw = row[phoneIdx];
    const phoneStr = (phoneRaw || '').toString();
    const digits = phoneStr.replace(/\D+/g, '');
    const hasValidPhone = digits.length >= 7; // Min 7 hane
    
    if (!hasValidPhone) {
      rowsToDelete.push(i + 2); // Satır numarası (1-based, header hariç)
    }
  }
  
  if (rowsToDelete.length === 0) {
    ui.alert('Silinecek satır bulunamadı', 'Tüm satırlarda geçerli telefon numarası var.', ui.ButtonSet.OK);
    return { success: true, deleted: 0 };
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
  
  ui.alert(`📵 Telefonu olmayan satırlar silindi: ${deleted}`);
  return { success: true, deleted };
}

/**
 * Websitesi olmayanları sil
 * @param {Sheet} sheet - İşlem yapılacak sayfa
 * @returns {Object} - Sonuç bilgisi
 */
function deleteRowsWithoutWebsite(sheet) {
  const ui = SpreadsheetApp.getUi();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const websiteIdx = findColumnIndex(headers, ['Website', 'website']);
  
  if (websiteIdx === -1) {
    throw new Error("'Website' kolonu bulunamadı");
  }
  
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    ui.alert('Silinecek satır bulunamadı');
    return { success: true, deleted: 0 };
  }
  
  // Batch read
  const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  
  // Silinecek satırları topla
  const rowsToDelete = [];
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const websiteRaw = (row[websiteIdx] || '').toString().trim();
    const hasWebsite = websiteRaw.length > 0;
    
    if (!hasWebsite) {
      rowsToDelete.push(i + 2); // Satır numarası (1-based, header hariç)
    }
  }
  
  if (rowsToDelete.length === 0) {
    ui.alert('Silinecek satır bulunamadı', 'Tüm satırlarda website var.', ui.ButtonSet.OK);
    return { success: true, deleted: 0 };
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
  
  ui.alert(`🌐 Websitesi olmayan satırlar silindi: ${deleted}`);
  return { success: true, deleted };
}

/**
 * URL'leri normalize et
 * @param {Sheet} sheet - İşlem yapılacak sayfa
 * @returns {Object} - Sonuç bilgisi
 */
function urlTemizleTumunu(sheet) {
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
  
  // URL'leri kontrol et ve normalize et
  const updates = [];
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
  let updated = 0;
  for (const u of updates) {
    sheet.getRange(u.row, websiteIdx + 1).setValue(u.new);
    updated++;
  }
  
  ui.alert('İşlem tamamlandı', `${updated} URL başarıyla temizlendi.`, ui.ButtonSet.OK);
  return { success: true, updated };
}

/**
 * URL tekrarlarını sil
 * @param {Sheet} sheet - İşlem yapılacak sayfa
 * @returns {Object} - Sonuç bilgisi
 */
function urlTekrarlariniSil(sheet) {
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
  return { success: true, deleted, totalGroups };
}

/**
 * Tüm Format Tablo sayfalarında validation'ı yenile
 * @returns {Object} - Sonuç bilgisi
 */
function refreshFormatTableValidation() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const allSheets = ss.getSheets();
    
    console.log(`🔄 Tüm Format Tablo sayfalarında validation yenileniyor...`);
    console.log(`📋 ACTIVITY_OPTIONS (${ACTIVITY_OPTIONS.length} adet):`, ACTIVITY_OPTIONS);
    
    // Tüm Format Tablo sayfalarını bul
    const formatTableSheets = allSheets.filter(sheet => isFormatTable(sheet));
    
    if (formatTableSheets.length === 0) {
      console.log('ℹ️ Format Tablo sayfası bulunamadı');
      return { success: true, message: 'Format Tablo sayfası bulunamadı', processedSheets: 0 };
    }
    
    console.log(`📊 ${formatTableSheets.length} Format Tablo sayfası bulundu`);
    
    // Her Format Tablo sayfasında validation uygula
    let successCount = 0;
    let errorCount = 0;
    
    formatTableSheets.forEach((sheet, index) => {
      try {
        const sheetName = sheet.getName();
        console.log(`  ${index + 1}/${formatTableSheets.length} - ${sheetName} işleniyor...`);
        
        setDataValidation(sheet);
        
        console.log(`  ✅ ${sheetName} - Validation uygulandı`);
        successCount++;
      } catch (error) {
        const sheetName = sheet.getName();
        console.error(`  ❌ ${sheetName} - Hata:`, error.message);
        errorCount++;
      }
    });
    
    console.log(`\n✅ Validation tamamlandı!`);
    console.log(`  ✅ Başarılı: ${successCount} sayfa`);
    if (errorCount > 0) {
      console.log(`  ❌ Hatalı: ${errorCount} sayfa`);
    }
    console.log(`📋 Aktivite seçenekleri (${ACTIVITY_OPTIONS.length} adet):`);
    ACTIVITY_OPTIONS.forEach((opt, idx) => {
      console.log(`  ${idx + 1}. ${opt}`);
    });
    
    return { 
      success: true, 
      processedSheets: successCount,
      errorSheets: errorCount,
      totalSheets: formatTableSheets.length,
      activityOptions: ACTIVITY_OPTIONS 
    };
  } catch (error) {
    console.error('❌ refreshFormatTableValidation error:', error);
    console.error('❌ Hata detayı:', error.message);
    console.error('❌ Stack trace:', error.stack);
    throw error;
  }
}

// ========================================
// 🎯 MAIN FUNCTIONS (Menu Items)
// ========================================

/**
 * Yeni Format Tablo oluştur (Ham Veri'den)
 * @param {Object} parameters - { sheetName: string, sourceSheetName?: string }
 */
function createNewTable(parameters) {
  try {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Sheet name input
    const sheetNameResponse = ui.prompt(
      '📋 Yeni Format Tablo Oluştur',
      'Format Tablo adını girin:',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (sheetNameResponse.getSelectedButton() !== ui.Button.OK) {
      return { success: false, cancelled: true };
    }
    
    const sheetName = sheetNameResponse.getResponseText().trim();
    
    if (!sheetName) {
      ui.alert('Hata', 'Sayfa adı boş olamaz!', ui.ButtonSet.OK);
      return { success: false };
    }
    
    // Ham Veri sayfasını bul
    const hamVeriSheet = ss.getSheetByName('Ham veri') || ss.getSheetByName('ham veri');
    
    if (!hamVeriSheet) {
      ui.alert('Hata', "'Ham veri' sayfası bulunamadı!", ui.ButtonSet.OK);
      return { success: false };
    }
    
    // Ham Veri'yi oku (batch operation)
    const hamVeriData = hamVeriSheet.getDataRange().getValues();
    
    if (hamVeriData.length <= 1) {
      ui.alert('Hata', 'Ham Veri sayfasında veri bulunamadı!', ui.ButtonSet.OK);
      return { success: false };
    }
    
    // Map et
    const formatTableData = mapHamVeriToFormatTable(hamVeriData, 'A_EXTRAKTOR');
    
    // Format Tablo oluştur
    const newSheet = createFormatTable(sheetName, formatTableData);
    
    ui.alert('✅ Başarılı', `Format Tablo "${sheetName}" oluşturuldu!\n${formatTableData.length - 1} satır aktarıldı.`, ui.ButtonSet.OK);
    
    return { 
      success: true, 
      sheetName: sheetName,
      rowCount: formatTableData.length - 1
    };
  } catch (error) {
    console.error('❌ createNewTable error:', error);
    SpreadsheetApp.getUi().alert('Hata', `Format Tablo oluşturulamadı: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// ========================================
// 🔧 UTILITY FUNCTIONS (Additional)
// ========================================

/**
 * Input validasyonu
 * @param {Object} parameters - Validasyon edilecek parametreler
 * @returns {boolean} - Geçerli ise true
 */
function validateInput(parameters) {
  if (!parameters || typeof parameters !== 'object') {
    console.error('Invalid parameters: must be an object');
    return false;
  }
  return true;
}

// ========================================
// 🗑️ DUPLICATE DELETION FUNCTIONS
// ========================================

/**
 * Tüm mükerrerleri otomatik sil (onaylı)
 * Her gruptaki TÜM satırları siler (orijinal + kopyalar)
 * @param {Object} parameters - Parametreler
 * @returns {Object} - Sonuç bilgisi
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
    
    // Silinecek tüm satır numaralarını topla
    const rowsToDelete = [];
    const groupDetails = [];
    
    for (const [key, rowNums] of dupGroups) {
      const [companyKey, phoneKey] = key.split('|');
      const sortedRows = [...rowNums].sort((a, b) => a - b);
      
      groupDetails.push({
        company: companyKey || '',
        phone: phoneKey || '',
        count: sortedRows.length,
        rows: sortedRows
      });
      
      // TÜM satırları silinecek listesine ekle
      rowsToDelete.push(...sortedRows);
    }
    
    // Özet mesaj hazırla
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
    
    // Toplu silme - satır numaralarını küçükten büyüğe sırala
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
// 📊 ARCHIVE & REPORTING FUNCTIONS
// ========================================

/**
 * Format Tablo sayfasını analiz eder ve istatistikler döndürür
 * @param {Sheet} formatTableSheet - Format Tablo sayfası
 * @param {string} sheetName - Sayfa adı
 * @returns {Object} Analiz sonuçları
 */
function analyzeFormatTableForArchive(formatTableSheet, sheetName) {
  const startTime = Date.now();
  console.log(`📊 Format Tablo analizi başlatılıyor: ${sheetName}`);
  
  try {
    if (!formatTableSheet || formatTableSheet.getLastRow() <= 1) {
      throw new Error('Format Tablo boş veya bulunamadı');
    }
    
    // Batch read: Tüm veriyi tek seferde oku (Google best practice)
    const allData = formatTableSheet.getDataRange().getValues();
    const headers = allData[0] || [];
    const rows = allData.slice(1);
    
    // Kolon indekslerini bul
    const aktiviteIdx = headers.findIndex(h => 
      h && (String(h).toLowerCase().includes('aktivite') && !String(h).toLowerCase().includes('tarihi'))
    );
    const aktiviteTarihiIdx = headers.findIndex(h => 
      h && (String(h).toLowerCase().includes('aktivite tarihi') || String(h).toLowerCase().includes('tarih'))
    );
    const logIdx = headers.findIndex(h => 
      h && String(h).toLowerCase().includes('log')
    );
    const kaynakIdx = headers.indexOf('Kaynak');
    
    // Toplam kontak sayısı (boş olmayan satırlar)
    const totalContacts = rows.filter(r => r.some(c => c && String(c).trim() !== '')).length;
    
    // Aktivite sayımları
    let aramaYapilan = 0; // Aktivite dolu satırlar
    let aktiviteTarihiDolu = 0; // Aktivite Tarihi dolu satırlar
    let logDolu = 0; // Log dolu satırlar
    
    const aktiviteCounts = {
      'Ulaşılamadı': 0,
      'İlgilenmiyor': 0,
      'Geçersiz Numara': 0,
      'Randevu Alındı': 0,
      'Fırsat Oluşturuldu': 0,
      'Toplantı Yapıldı': 0,
      'Diğer': 0
    };
    
    // Her satırı analiz et (batch processing)
    rows.forEach((row, index) => {
      // Boş satırları atla
      if (!row.some(c => c && String(c).trim() !== '')) return;
      
      // Aktivite kontrolü
      const aktivite = aktiviteIdx !== -1 ? String(row[aktiviteIdx] || '').trim() : '';
      if (aktivite) {
        aramaYapilan++;
        
        // Aktivite tipine göre say
        if (aktiviteCounts.hasOwnProperty(aktivite)) {
          aktiviteCounts[aktivite]++;
        } else {
          aktiviteCounts['Diğer']++;
        }
      }
      
      // Aktivite Tarihi kontrolü
      if (aktiviteTarihiIdx !== -1 && row[aktiviteTarihiIdx] && String(row[aktiviteTarihiIdx]).trim()) {
        aktiviteTarihiDolu++;
      }
      
      // Log kontrolü
      if (logIdx !== -1 && row[logIdx] && String(row[logIdx]).trim()) {
        logDolu++;
      }
    });
    
    // "Hepsi arandı mı" kontrolü
    // Üç kriterden biri tamamlanmışsa "arandı" kabul edilir
    const tumuAranmis = (
      aramaYapilan >= totalContacts ||
      aktiviteTarihiDolu >= totalContacts ||
      logDolu >= totalContacts
    );
    
    // Randevu/Fırsat/Toplantı sayımları (Randevularım, Fırsatlarım, Toplantılarım sayfalarından)
    const ss = formatTableSheet.getParent();
    const randevuSheet = ss.getSheetByName('Randevularım');
    const firsatSheet = ss.getSheetByName('Fırsatlarım');
    const toplantiSheet = ss.getSheetByName('Toplantılarım');
    
    // Kaynak kolonuna göre say (batch read)
    let randevuAlindi = 0;
    let toplantiYapildi = 0;
    let satisYapildi = 0;
    
    if (randevuSheet && kaynakIdx !== -1) {
      const randevuData = randevuSheet.getDataRange().getValues();
      const randevuHeaders = randevuData[0] || [];
      const randevuRows = randevuData.slice(1);
      const randevuKaynakIdx = randevuHeaders.indexOf('Kaynak');
      const randevuDurumIdx = randevuHeaders.indexOf('Randevu durumu');
      
      if (randevuKaynakIdx !== -1 && randevuDurumIdx !== -1) {
        randevuAlindi = randevuRows.filter(r => {
          const kaynak = String(r[randevuKaynakIdx] || '').trim();
          const durum = String(r[randevuDurumIdx] || '').trim();
          return kaynak === sheetName && (
            durum === 'Randevu Alındı' ||
            durum === 'Randevu Teyitlendi' ||
            durum === 'İleri Tarih Randevu'
          );
        }).length;
      }
    }
    
    if (toplantiSheet && kaynakIdx !== -1) {
      const toplantiData = toplantiSheet.getDataRange().getValues();
      const toplantiHeaders = toplantiData[0] || [];
      const toplantiRows = toplantiData.slice(1);
      const toplantiKaynakIdx = toplantiHeaders.indexOf('Kaynak');
      const toplantiSonucIdx = toplantiHeaders.indexOf('Toplantı Sonucu');
      
      if (toplantiKaynakIdx !== -1 && toplantiSonucIdx !== -1) {
        toplantiYapildi = toplantiRows.filter(r => {
          const kaynak = String(r[toplantiKaynakIdx] || '').trim();
          return kaynak === sheetName;
        }).length;
        
        satisYapildi = toplantiRows.filter(r => {
          const kaynak = String(r[toplantiKaynakIdx] || '').trim();
          const sonuc = String(r[toplantiSonucIdx] || '').trim();
          return kaynak === sheetName && sonuc === 'Satış Yapıldı';
        }).length;
      }
    }
    
    // Başarı puanı hesapla (randevu sayısı / toplam kontak × 100)
    const basariPuani = totalContacts > 0 
      ? Math.round((randevuAlindi / totalContacts) * 100 * 10) / 10 
      : 0;
    
    const duration = Date.now() - startTime;
    console.log(`✅ Format Tablo analizi tamamlandı (${duration}ms)`);
    
    return {
      sheetName: sheetName,
      totalContacts: totalContacts,
      aramaYapilan: aramaYapilan,
      aktiviteTarihiDolu: aktiviteTarihiDolu,
      logDolu: logDolu,
      tumuAranmis: tumuAranmis,
      aktiviteCounts: aktiviteCounts,
      randevuAlindi: randevuAlindi,
      toplantiYapildi: toplantiYapildi,
      satisYapildi: satisYapildi,
      basariPuani: basariPuani,
      duration: duration
    };
    
  } catch (error) {
    console.error(`❌ Format Tablo analiz hatası: ${error.message}`);
    throw error;
  }
}

/**
 * Format Tablo sayfasını Google Drive klasörüne arşivler
 * @param {Sheet} formatTableSheet - Format Tablo sayfası
 * @param {string} archiveFolderId - Google Drive klasör ID
 * @param {string} uniqueCode - Özel kod (Sayfa İsmi_Uzman Kodu_Tarih)
 * @returns {Object} Arşivleme sonucu
 */
function archiveFormatTableToDrive(formatTableSheet, archiveFolderId, uniqueCode) {
  const startTime = Date.now();
  console.log(`📦 Format Tablo arşivleniyor: ${uniqueCode}`);
  
  try {
    if (!formatTableSheet) {
      throw new Error('Format Tablo sayfası bulunamadı');
    }
    
    if (!archiveFolderId) {
      throw new Error('Arşiv klasör ID belirtilmedi');
    }
    
    // Klasörü al
    const archiveFolder = DriveApp.getFolderById(archiveFolderId);
    
    // Sayfanın bağlı olduğu dosyayı al
    const spreadsheet = formatTableSheet.getParent();
    
    // Yeni dosya oluştur (sadece bu sayfayı içeren)
    const archiveFileName = `${uniqueCode}_Arşiv.xlsx`;
    
    // Sayfanın içeriğini yeni bir spreadsheet'e kopyala
    const newSpreadsheet = SpreadsheetApp.create(archiveFileName);
    const newSheet = newSpreadsheet.getActiveSheet();
    
    // Veriyi kopyala (batch read + batch write)
    const allData = formatTableSheet.getDataRange().getValues();
    if (allData.length > 0) {
      newSheet.getRange(1, 1, allData.length, allData[0].length).setValues(allData);
    }
    
    // Formatları kopyala (opsiyonel - yavaş olabilir, gerekirse kaldırılabilir)
    try {
      const formats = formatTableSheet.getDataRange().getBackgrounds();
      if (formats.length > 0) {
        newSheet.getRange(1, 1, formats.length, formats[0].length).setBackgrounds(formats);
      }
    } catch (formatError) {
      console.warn('⚠️ Format kopyalama hatası (devam ediliyor):', formatError.message);
    }
    
    // Dosyayı arşiv klasörüne taşı
    const newSpreadsheetFile = DriveApp.getFileById(newSpreadsheet.getId());
    newSpreadsheetFile.moveTo(archiveFolder);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Format Tablo arşivlendi: ${archiveFileName} (${duration}ms)`);
    
    return {
      success: true,
      archiveFileName: archiveFileName,
      archiveFileId: newSpreadsheetFile.getId(),
      archiveFolderId: archiveFolderId,
      duration: duration
    };
    
  } catch (error) {
    console.error(`❌ Arşivleme hatası: ${error.message}`);
    throw error;
  }
}

/**
 * Log Arşivi'nden Format Tablo için istatistikleri çıkarır
 * @param {Spreadsheet} spreadsheet - Temsilci dosyası
 * @param {string} formatTableName - Format Tablo adı
 * @returns {Object} İstatistikler
 */
function extractLogStatisticsFromArchive(spreadsheet, formatTableName) {
  try {
    // Log Arşivi sayfasını bul
    let logArchiveSheet = spreadsheet.getSheetByName('📋 Log Arşivi');
    if (!logArchiveSheet) {
      logArchiveSheet = spreadsheet.getSheetByName('Log Arşivi');
    }
    
    if (!logArchiveSheet || logArchiveSheet.getLastRow() <= 1) {
      console.log('⚠️ Log Arşivi bulunamadı veya boş');
      return {
        totalLogs: 0,
        activityDistribution: {}
      };
    }
    
    // Batch read: Tüm veriyi tek seferde oku
    const allData = logArchiveSheet.getDataRange().getValues();
    const headers = allData[0] || [];
    const rows = allData.slice(1);
    
    // Kolon indekslerini bul
    const kaynakSayfaIdx = headers.findIndex(h => 
      h && (String(h).toLowerCase().includes('kaynak') || String(h).toLowerCase().includes('kaynak sayfa'))
    );
    const aktiviteIdx = headers.findIndex(h => 
      h && String(h).toLowerCase().includes('aktivite')
    );
    
    if (kaynakSayfaIdx === -1 || aktiviteIdx === -1) {
      console.log('⚠️ Log Arşivi kolonları bulunamadı');
      return {
        totalLogs: 0,
        activityDistribution: {}
      };
    }
    
    // Format Tablo'ya ait logları filtrele
    const formatLogs = rows.filter(row => {
      const kaynakSayfa = String(row[kaynakSayfaIdx] || '').trim();
      return kaynakSayfa === formatTableName;
    });
    
    // Aktivite dağılımını hesapla
    const activityDistribution = {};
    formatLogs.forEach(row => {
      const aktivite = String(row[aktiviteIdx] || '').trim();
      if (aktivite) {
        activityDistribution[aktivite] = (activityDistribution[aktivite] || 0) + 1;
      }
    });
    
    return {
      totalLogs: formatLogs.length,
      activityDistribution: activityDistribution
    };
    
  } catch (error) {
    console.error('❌ Log Arşivi istatistik hatası:', error);
    return {
      totalLogs: 0,
      activityDistribution: {}
    };
  }
}

/**
 * Yönetici dosyasında "Arşiv" sheet'ini oluşturur veya alır
 * @param {Spreadsheet} managerFile - Yönetici dosyası
 * @returns {Sheet} Arşiv sheet'i
 */
function getOrCreateArchiveSheet(managerFile) {
  let archiveSheet = managerFile.getSheetByName('Arşiv');
  
  if (!archiveSheet) {
    archiveSheet = managerFile.insertSheet('Arşiv');
    
    // Başlık satırı (1. satır)
    archiveSheet.getRange(1, 1, 1, 10).merge();
    archiveSheet.getRange(1, 1).setValue('📦 FORMAT TABLO ARŞİVİ');
    archiveSheet.getRange(1, 1).setBackground('#1a73e8');
    archiveSheet.getRange(1, 1).setFontColor('#ffffff');
    archiveSheet.getRange(1, 1).setFontWeight('bold');
    archiveSheet.getRange(1, 1).setFontSize(16);
    archiveSheet.getRange(1, 1).setHorizontalAlignment('center');
    archiveSheet.setRowHeight(1, 40);
    
    // Açıklama satırı (2. satır)
    archiveSheet.getRange(2, 1, 1, 10).merge();
    archiveSheet.getRange(2, 1).setValue('Arşivlenen Format Tablo\'ların özet bilgileri - Kart formatında');
    archiveSheet.getRange(2, 1).setBackground('#e8f0fe');
    archiveSheet.getRange(2, 1).setFontColor('#1967d2');
    archiveSheet.getRange(2, 1).setFontSize(10);
    archiveSheet.getRange(2, 1).setHorizontalAlignment('center');
    archiveSheet.setRowHeight(2, 30);
    
    // Boş satır (3. satır)
    archiveSheet.setRowHeight(3, 10);
    
    console.log('✅ "Arşiv" sheet\'i oluşturuldu');
  }
  
  return archiveSheet;
}

/**
 * Arşiv kartı oluşturur (5-10 satır, okunabilir format)
 * @param {string} dataName - Data adı
 * @param {string} formatCode - Format kodu
 * @param {string} temsilciKodu - Temsilci kodu
 * @param {string} tarih - Tarih (YYYY-MM-DD)
 * @param {Object} logStats - Log istatistikleri
 * @returns {Array} Kart verisi (her satır bir array)
 */
function createArchiveCard(dataName, formatCode, temsilciKodu, tarih, logStats) {
  const card = [];
  
  // Satır 1: Başlık (Data Adı - Format Kodu)
  card.push([`📦 ${dataName} - ${formatCode}`, '', '', '', '', '', '', '', '', '']);
  
  // Satır 2: Temsilci ve Tarih
  card.push([`👤 Temsilci: ${temsilciKodu || 'Bilinmiyor'}`, `📅 Tarih: ${tarih}`, '', '', '', '', '', '', '', '']);
  
  // Satır 3: Toplam Log
  card.push([`📊 Toplam Log: ${logStats.totalLogs}`, '', '', '', '', '', '', '', '', '']);
  
  // Satır 4: Aktivite Dağılımı Başlığı
  card.push([`📈 Aktivite Dağılımı:`, '', '', '', '', '', '', '', '', '']);
  
  // Satır 5-10: Aktivite dağılımı (her aktivite bir satır)
  const activities = Object.entries(logStats.activityDistribution || {});
  if (activities.length > 0) {
    activities.forEach(([activity, count]) => {
      card.push([`  • ${activity}: ${count}`, '', '', '', '', '', '', '', '', '']);
    });
  } else {
    card.push([`  • Aktivite bulunamadı`, '', '', '', '', '', '', '', '', '']);
  }
  
  // Boş satır (ayırıcı)
  card.push(['', '', '', '', '', '', '', '', '', '']);
  
  return card;
}

/**
 * Arşiv kartını sheet'e ekler
 * @param {Sheet} archiveSheet - Arşiv sheet'i
 * @param {Array} card - Kart verisi
 */
function addArchiveCardToSheet(archiveSheet, card) {
  const startRow = archiveSheet.getLastRow() + 1;
  
  // Kart verilerini yaz
  archiveSheet.getRange(startRow, 1, card.length, 10).setValues(card);
  
  // Stil uygula
  const cardRange = archiveSheet.getRange(startRow, 1, card.length, 10);
  
  // Başlık satırı (ilk satır)
  archiveSheet.getRange(startRow, 1, 1, 10).merge();
  archiveSheet.getRange(startRow, 1).setFontWeight('bold');
  archiveSheet.getRange(startRow, 1).setFontSize(14);
  archiveSheet.getRange(startRow, 1).setBackground('#e3f2fd');
  archiveSheet.setRowHeight(startRow, 35);
  
  // İkinci satır (Temsilci ve Tarih)
  archiveSheet.getRange(startRow + 1, 1, 1, 2).setFontSize(11);
  archiveSheet.setRowHeight(startRow + 1, 25);
  
  // Üçüncü satır (Toplam Log)
  archiveSheet.getRange(startRow + 2, 1).setFontWeight('bold');
  archiveSheet.getRange(startRow + 2, 1).setFontSize(12);
  archiveSheet.setRowHeight(startRow + 2, 25);
  
  // Aktivite dağılımı başlığı
  archiveSheet.getRange(startRow + 3, 1).setFontWeight('bold');
  archiveSheet.setRowHeight(startRow + 3, 25);
  
  // Aktivite satırları
  for (let i = 4; i < card.length - 1; i++) {
    archiveSheet.setRowHeight(startRow + i, 20);
  }
  
  // Son boş satır
  archiveSheet.setRowHeight(startRow + card.length - 1, 10);
  
  console.log(`✅ Arşiv kartı eklendi (${card.length} satır)`);
}

/**
 * Yönetici dosyasına Dataset Raporu ekle (manager-sync.js'den çağrılır)
 * Bu fonksiyon manager-sync.js'deki fonksiyonu çağırır
 */
function addDatasetReportToManager(uzmanKodu, sheetName, tarih, analysisResult, archiveFileId, archiveFileName) {
  try {
    // manager-sync.js'deki fonksiyonu çağır (Google Apps Script global scope)
    if (typeof addDatasetReportToManagerSync === 'function') {
      return addDatasetReportToManagerSync(uzmanKodu, sheetName, tarih, analysisResult, archiveFileId, archiveFileName);
    } else {
      console.warn('⚠️ addDatasetReportToManagerSync fonksiyonu bulunamadı, manager-sync.js yüklü mü kontrol edin');
      throw new Error('Manager sync fonksiyonu bulunamadı');
    }
  } catch (error) {
    console.error('❌ Yönetici raporu ekleme hatası:', error);
    throw error;
  }
}

/**
 * Format Tablo'yu raporla (Basit versiyon)
 * Temsilci dosyasında "Format Tablo Raporları" sayfası oluşturur ve özet rapor yazar
 * @returns {Object} İşlem sonucu
 */
function reportFormatTable() {
  const startTime = Date.now();
  console.log('📊 Format Tablo raporlama başlatılıyor...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    const activeSheet = ss.getActiveSheet();
    const sheetName = activeSheet.getName();
    
    // Format Tablo kontrolü
    if (!isFormatTable(activeSheet)) {
      ui.alert('❌ Hata', 'Aktif sayfa bir Format Tablo değil!', ui.ButtonSet.OK);
      return { success: false, error: 'Not a Format Table' };
    }
    
    // Temsilci kodunu otomatik bul (dosya adından)
    let uzmanKodu = '';
    const fileName = ss.getName();
    console.log('📁 Dosya adı:', fileName);
    
    // Dosya adından kod çıkarmayı dene
    for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
      if (fileName.includes(code)) {
        uzmanKodu = code;
        console.log(`✅ Temsilci kodu bulundu: ${uzmanKodu}`);
        break;
      }
    }
    
    // Bulunamazsa kullanıcıya sor
    if (!uzmanKodu) {
      const codeResp = ui.prompt(
        '📋 Temsilci Kodu',
        'Temsilci kodunu girin (örn: SB 004):\n\n(Boş bırakırsanız kod olmadan devam eder)',
        ui.ButtonSet.OK_CANCEL
      );
      
      if (codeResp.getSelectedButton() === ui.Button.OK) {
        uzmanKodu = codeResp.getResponseText().trim();
      }
    }
    
    // Format Tablo'yu analiz et
    console.log('📊 Format Tablo analiz ediliyor...');
    const analysisResult = analyzeFormatTableForArchive(activeSheet, sheetName);
    
    // Tarih formatı: YYYY-MM-DD
    const today = Utilities.formatDate(new Date(), 'Europe/Istanbul', 'yyyy-MM-dd');
    
    // Özel kod oluştur (Sayfa İsmi_Uzman Kodu_Tarih)
    const uniqueCode = uzmanKodu 
      ? `${sheetName}_${uzmanKodu}_${today}` 
      : `${sheetName}_${today}`;
    
    // "Format Tablo Raporları" sayfasını oluştur veya al
    let reportSheet = ss.getSheetByName('Format Tablo Raporları');
    if (!reportSheet) {
      reportSheet = ss.insertSheet('Format Tablo Raporları');
      console.log('✅ "Format Tablo Raporları" sayfası oluşturuldu');
    }
    
    // Eğer sayfa boşsa (header yoksa) başlık ve header ekle
    const hasHeader = reportSheet.getLastRow() >= 4; // Header 4. satırda olmalı
    if (!hasHeader) {
      // Başlık satırı (1. satır)
      reportSheet.getRange(1, 1, 1, 10).merge();
      reportSheet.getRange(1, 1).setValue('📊 FORMAT TABLO RAPORLARI');
      reportSheet.getRange(1, 1).setBackground('#1a73e8');
      reportSheet.getRange(1, 1).setFontColor('#ffffff');
      reportSheet.getRange(1, 1).setFontWeight('bold');
      reportSheet.getRange(1, 1).setFontSize(16);
      reportSheet.getRange(1, 1).setHorizontalAlignment('center');
      reportSheet.setRowHeight(1, 40);
      
      // Açıklama satırı (2. satır)
      reportSheet.getRange(2, 1, 1, 10).merge();
      reportSheet.getRange(2, 1).setValue('Format Tablo analiz raporları - Her satır bir Format Tablo\'nun özet bilgilerini içerir');
      reportSheet.getRange(2, 1).setBackground('#e8f0fe');
      reportSheet.getRange(2, 1).setFontColor('#1967d2');
      reportSheet.getRange(2, 1).setFontSize(10);
      reportSheet.getRange(2, 1).setHorizontalAlignment('center');
      reportSheet.setRowHeight(2, 30);
      
      // Boş satır (3. satır)
      reportSheet.setRowHeight(3, 10);
      
      // Header satırı (4. satır)
      const headers = [
        'Kod',
        'Tarih',
        'Format Tablo Adı',
        'Toplam Kontak',
        'Arama Yapılan',
        'Randevu Alındı',
        'Toplantı Yapıldı',
        'Satış Yapıldı',
        'Başarı Puanı (%)',
        'Tümü Arandı'
      ];
      reportSheet.getRange(4, 1, 1, headers.length).setValues([headers]);
      
      // Header stilleri
      const headerRange = reportSheet.getRange(4, 1, 1, headers.length);
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      headerRange.setFontSize(11);
      headerRange.setHorizontalAlignment('center');
      reportSheet.setRowHeight(4, 35);
      
      // Kolon genişlikleri
      reportSheet.setColumnWidth(1, 200); // Kod
      reportSheet.setColumnWidth(2, 100); // Tarih
      reportSheet.setColumnWidth(3, 200); // Format Tablo Adı
      reportSheet.setColumnWidth(4, 100); // Toplam Kontak
      reportSheet.setColumnWidth(5, 120); // Arama Yapılan
      reportSheet.setColumnWidth(6, 120); // Randevu Alındı
      reportSheet.setColumnWidth(7, 120); // Toplantı Yapıldı
      reportSheet.setColumnWidth(8, 120); // Satış Yapıldı
      reportSheet.setColumnWidth(9, 120); // Başarı Puanı
      reportSheet.setColumnWidth(10, 100); // Tümü Arandı
    }
    
    // Yeni satır ekle (header'dan sonra - header 4. satırda)
    const newRow = reportSheet.getLastRow() + 1;
    
    // Rapor verilerini yaz
    const rowData = [
      uniqueCode, // Kod
      today, // Tarih
      sheetName, // Format Tablo Adı
      analysisResult.totalContacts, // Toplam Kontak
      analysisResult.aramaYapilan, // Arama Yapılan
      analysisResult.randevuAlindi, // Randevu Alındı
      analysisResult.toplantiYapildi, // Toplantı Yapıldı
      analysisResult.satisYapildi, // Satış Yapıldı
      analysisResult.basariPuani, // Başarı Puanı (%)
      analysisResult.tumuAranmis ? 'Evet' : 'Hayır' // Tümü Arandı
    ];
    
    reportSheet.getRange(newRow, 1, 1, rowData.length).setValues([rowData]);
    
    // Başarı puanına göre renklendirme
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
    
    // Sayfaya geç
    reportSheet.activate();
    
    const duration = Date.now() - startTime;
    console.log(`✅ Format Tablo raporlama tamamlandı (${duration}ms)`);
    
    // Başarı mesajı
    ui.alert(
      '✅ Format Tablo Raporlandı',
      `📊 ${sheetName} için rapor oluşturuldu!\n\n` +
      `📋 Rapor sayfası: "Format Tablo Raporları"\n` +
      `🆔 Kod: ${uniqueCode}\n` +
      `📊 Toplam Kontak: ${analysisResult.totalContacts}\n` +
      `🔍 Arama Yapılan: ${analysisResult.aramaYapilan}\n` +
      `📅 Randevu Alındı: ${analysisResult.randevuAlindi}\n` +
      `📈 Başarı Puanı: %${analysisResult.basariPuani}\n` +
      `✅ Tümü Arandı: ${analysisResult.tumuAranmis ? 'Evet' : 'Hayır'}\n\n` +
      `⏱️ Süre: ${(duration / 1000).toFixed(1)}s`,
      ui.ButtonSet.OK
    );
    
    return {
      success: true,
      uniqueCode: uniqueCode,
      reportSheet: 'Format Tablo Raporları',
      rowNumber: newRow,
      analysis: analysisResult,
      duration: duration
    };
    
  } catch (error) {
    console.error('❌ Format Tablo raporlama hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Raporlama hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return { success: false, error: error.message };
  }
}

/**
 * Format Tablo sayfasını sil
 * @returns {Object} İşlem sonucu
 */
function deleteFormatTable() {
  const startTime = Date.now();
  console.log('🗑️ Format Tablo silme başlatılıyor...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    const activeSheet = ss.getActiveSheet();
    const sheetName = activeSheet.getName();
    
    // Format Tablo kontrolü
    if (!isFormatTable(activeSheet)) {
      ui.alert('❌ Hata', 'Aktif sayfa bir Format Tablo değil!', ui.ButtonSet.OK);
      return { success: false, error: 'Not a Format Table' };
    }
    
    // Onay iste
    const confirmResp = ui.alert(
      '⚠️ Format Tablo Silme',
      `"${sheetName}" sayfasını silmek istediğinizden emin misiniz?\n\n` +
      `⚠️ Bu işlem geri alınamaz!\n\n` +
      `Lütfen önce sayfayı arşivlediğinizden emin olun.`,
      ui.ButtonSet.YES_NO
    );
    
    if (confirmResp !== ui.Button.YES) {
      return { success: false, message: 'İptal edildi' };
    }
    
    // Sayfayı sil
    ss.deleteSheet(activeSheet);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Format Tablo silindi: ${sheetName} (${duration}ms)`);
    
    ui.alert('✅ Format Tablo Silindi', `"${sheetName}" sayfası başarıyla silindi.`, ui.ButtonSet.OK);
    
    return {
      success: true,
      deletedSheetName: sheetName,
      duration: duration
    };
    
  } catch (error) {
    console.error('❌ Format Tablo silme hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Silme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return { success: false, error: error.message };
  }
}

/**
 * Format Tablo Arşivleme Fonksiyonu
 * Log Arşivi'nden istatistikleri çıkarır ve yönetici dosyasına "Arşiv" sheet'ine kart formatında ekler
 * Format sheet'ini gizler ve gereksiz sheet'leri siler
 * @returns {Object} İşlem sonucu
 */
function archiveFormatTable() {
  const startTime = Date.now();
  console.log('📦 Format Tablo arşivleme başlatılıyor...');
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();
    const activeSheet = ss.getActiveSheet();
    const sheetName = activeSheet.getName();
    
    // Format Tablo kontrolü
    if (!isFormatTable(activeSheet)) {
      ui.alert('❌ Hata', 'Aktif sayfa bir Format Tablo değil!', ui.ButtonSet.OK);
      return { success: false, error: 'Not a Format Table' };
    }
    
    // 1. Format kodu ve Data adı sor
    const formatCodeResp = ui.prompt(
      '📦 Format Tablo Arşivle',
      'Format kodu nedir? (örn: TeksBH):',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (formatCodeResp.getSelectedButton() !== ui.Button.OK) {
      return { success: false, message: 'İptal edildi' };
    }
    
    const formatCode = formatCodeResp.getResponseText().trim();
    if (!formatCode) {
      ui.alert('❌ Hata', 'Format kodu boş olamaz!', ui.ButtonSet.OK);
      return { success: false, error: 'Format code is required' };
    }
    
    const dataNameResp = ui.prompt(
      '📦 Format Tablo Arşivle',
      'Data adı nedir? (örn: Tekstil Anadolu):',
      ui.ButtonSet.OK_CANCEL
    );
    
    if (dataNameResp.getSelectedButton() !== ui.Button.OK) {
      return { success: false, message: 'İptal edildi' };
    }
    
    const dataName = dataNameResp.getResponseText().trim();
    if (!dataName) {
      ui.alert('❌ Hata', 'Data adı boş olamaz!', ui.ButtonSet.OK);
      return { success: false, error: 'Data name is required' };
    }
    
    // 2. Temsilci kodunu bul (dosya adından)
    let temsilciKodu = '';
    const fileName = ss.getName();
    for (const code in CRM_CONFIG.EMPLOYEE_CODES) {
      if (fileName.includes(code)) {
        temsilciKodu = code;
        break;
      }
    }
    
    // 3. Log Arşivi'nden istatistikleri çıkar
    console.log('📊 Log Arşivi\'nden istatistikler çıkarılıyor...');
    const logStats = extractLogStatisticsFromArchive(ss, sheetName);
    
    // 4. Yönetici dosyasına "Arşiv" sheet'ine kart formatında ekle
    console.log('📦 Yönetici dosyasına arşiv kaydı ekleniyor...');
    const managerFile = SpreadsheetApp.openById(CRM_CONFIG.MANAGER_FILE_ID);
    const archiveSheet = getOrCreateArchiveSheet(managerFile);
    
    const today = Utilities.formatDate(new Date(), 'Europe/Istanbul', 'yyyy-MM-dd');
    const archiveCard = createArchiveCard(
      dataName,
      formatCode,
      temsilciKodu,
      today,
      logStats
    );
    
    addArchiveCardToSheet(archiveSheet, archiveCard);
    
    // 5. Format sheet'ini gizle
    console.log('🔒 Format Tablo gizleniyor...');
    activeSheet.hideSheet();
    
    // 6. Gereksiz sheet'leri sil (varsa)
    console.log('🗑️ Gereksiz sheet\'ler kontrol ediliyor...');
    const datasetSheet = ss.getSheetByName('Dataset Raporu');
    if (datasetSheet) {
      ss.deleteSheet(datasetSheet);
      console.log('✅ "Dataset Raporu" sheet\'i silindi');
    }
    
    // Not: "Format Tablo Raporları" sheet'i silinmeyecek (raporlar için gerekli)
    
    const duration = Date.now() - startTime;
    console.log(`✅ Format Tablo arşivleme tamamlandı (${duration}ms)`);
    
    ui.alert(
      '✅ Format Tablo Arşivlendi',
      `"${sheetName}" başarıyla arşivlendi!\n\n` +
      `📦 Format Kodu: ${formatCode}\n` +
      `📋 Data Adı: ${dataName}\n` +
      `👤 Temsilci: ${temsilciKodu || 'Bilinmiyor'}\n` +
      `📊 Toplam Log: ${logStats.totalLogs}\n` +
      `⏱️ Süre: ${(duration / 1000).toFixed(1)}s`,
      ui.ButtonSet.OK
    );
    
    return {
      success: true,
      formatCode,
      dataName,
      temsilciKodu,
      logStats,
      duration: duration
    };
    
  } catch (error) {
    console.error('❌ Format Tablo arşivleme hatası:', error);
    SpreadsheetApp.getUi().alert('❌ Hata', `Arşivleme hatası: ${error.message}`, SpreadsheetApp.getUi().ButtonSet.OK);
    return { success: false, error: error.message };
  }
}
