// ========================================
// HAM VERİ → FORMAT TABLO MAPPER
// Dinamik sütun eşleştirme sistemi
// ========================================

/**
 * HAM VERİ TİPLERİ ve HEADERS
 */
const RAW_DATA_TYPES = {
  A_EXTRAKTOR: {
    name: 'Ham Veri A (Extraktor)',
    headers: ['Keyword', 'Location', 'Company name', 'Category', 'Website', 
              'Phone', 'Email 1', 'Email 2', 'Email 3', 'Address', 'City', 
              'State', 'Pincode', 'Rating count', 'Review', 'Cid']
  },
  
  B_SCRAPPER: {
    name: 'Ham Veri B (Scrapper)',
    headers: ['Website', 'Title', 'Email', 'Phone', 'WhatsApp', 'Category', 
              'Description', 'Address', 'Ratings', 'Raviews', 'Latitude', 
              'Longitude', 'CID', 'Map Link', 'Country', 'Searched Keyword']
  },
  
  C_APIFY: {
    name: 'Ham Veri C (Apify)',
    headers: ['title', 'totalScore', 'reviewsCount', 'street', 'city', 'state', 
              'countryCode', 'website', 'phone', 'categoryName', 'url']
  }
};

/**
 * FORMAT TABLO STANDART (26 sütun)
 */
const FORMAT_TABLE_HEADERS = [
  'Kod', 'Keyword', 'Location', 'Company name', 'Category', 'Website',
  'CMS Adı', 'CMS Grubu', 'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim',
  'Aktivite', 'Aktivite Tarihi', 'Yorum', 'Yönetici Not', 'IdeaSoft Oranı',
  'Pahalı Paket Oranı', 'Ucuz Paket Oranı', 'Log', 'Toplantı formatı',
  'Address', 'City', 'Rating count', 'Review', 'Maplink'
];

/**
 * MAPPING KURALLARI
 * Ham Veri sütunu → Format Tablo sütunu
 */
const MAPPING_RULES = {
  A_EXTRAKTOR: {
    'Keyword': 'Keyword',
    'Location': 'Location',
    'Company name': 'Company name',
    'Category': 'Category',
    'Website': 'Website',
    'Phone': 'Phone',
    'Email 1': 'Mail',
    'Address': 'Address',
    'City': 'City',
    'Rating count': 'Rating count',
    'Review': 'Review',
    'Cid': 'Maplink'
  },
  
  B_SCRAPPER: {
    'Searched Keyword': 'Keyword',
    'Title': 'Company name',
    'Category': 'Category',
    'Website': 'Website',
    'Phone': 'Phone',
    'Email': 'Mail',
    'Address': 'Address',
    'Ratings': 'Rating count',
    'Raviews': 'Review',
    'Map Link': 'Maplink'
  },
  
  C_APIFY: {
    'title': 'Company name',
    'categoryName': 'Category',
    'website': 'Website',
    'phone': 'Phone',
    'street': 'Address',
    'city': 'City',
    'reviewsCount': 'Rating count',
    'totalScore': 'Review',
    'url': 'Maplink'
  }
};

/**
 * Ham Veri tipini otomatik tespit et
 * @param {Array} headers - Sheet'ten okunan header'lar
 * @returns {string|null} - Tespit edilen tip (A_EXTRAKTOR, B_SCRAPPER, C_APIFY)
 */
function detectRawDataType(headers) {
  console.log('🔍 Ham Veri tipi tespit ediliyor...');
  console.log('Bulunan headers:', headers);
  
  let bestMatch = null;
  let bestScore = 0;
  
  for (const [typeKey, typeData] of Object.entries(RAW_DATA_TYPES)) {
    let matchCount = 0;
    
    // Header'ları karşılaştır (case-insensitive)
    for (const expectedHeader of typeData.headers) {
      if (headers.some(h => 
        h && h.toString().toLowerCase().trim() === expectedHeader.toLowerCase().trim()
      )) {
        matchCount++;
      }
    }
    
    const matchScore = matchCount / typeData.headers.length;
    console.log(`${typeData.name}: %${(matchScore * 100).toFixed(0)} eşleşme`);
    
    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = typeKey;
    }
  }
  
  // En az %70 eşleşme gerekli
  if (bestScore >= 0.7) {
    console.log(`✅ Tespit edildi: ${RAW_DATA_TYPES[bestMatch].name} (%${(bestScore * 100).toFixed(0)})`);
    return bestMatch;
  }
  
  console.error('❌ Ham Veri tipi tespit edilemedi!');
  console.error(`En iyi eşleşme: %${(bestScore * 100).toFixed(0)}`);
  return null;
}

/**
 * Ham Veri'yi Format Tablo'ya dönüştür
 * @param {GoogleAppsScript.Spreadsheet.Sheet} rawSheet - Ham Veri sheet'i
 * @param {string} rawDataType - Ham Veri tipi (A_EXTRAKTOR, B_SCRAPPER, C_APIFY)
 * @returns {Array} - Format Tablo formatında data (26 sütun)
 */
function transformRawToFormat(rawSheet, rawDataType) {
  console.log('=== HAM VERİ → FORMAT TABLO DÖNÜŞÜMÜ ===');
  console.log(`Tip: ${RAW_DATA_TYPES[rawDataType].name}`);
  
  try {
    // 1. Ham Veri'yi oku
    const lastRow = rawSheet.getLastRow();
    if (lastRow <= 1) {
      console.log('⚠️ Veri yok');
      return [];
    }
    
    const headers = rawSheet.getRange(1, 1, 1, rawSheet.getLastColumn()).getValues()[0];
    const rawData = rawSheet.getRange(2, 1, lastRow - 1, rawSheet.getLastColumn()).getValues();
    
    console.log(`📊 ${rawData.length} satır ham veri okundu`);
    
    // 2. Header index mapping oluştur
    const headerIndexMap = {};
    headers.forEach((header, index) => {
      if (header) {
        headerIndexMap[header.toString().trim()] = index;
      }
    });
    
    // 3. Mapping kurallarını al
    const mappingRules = MAPPING_RULES[rawDataType];
    
    // 4. Her satırı dönüştür
    const transformedData = [];
    
    for (let i = 0; i < rawData.length; i++) {
      const rawRow = rawData[i];
      const formatRow = Array(26).fill(''); // 26 sütun boş array
      
      // Format Tablo header'larını gez
      FORMAT_TABLE_HEADERS.forEach((formatHeader, formatIndex) => {
        // Bu Format sütunu için mapping kuralını bul
        const rawHeader = Object.keys(mappingRules).find(
          key => mappingRules[key] === formatHeader
        );
        
        if (rawHeader && headerIndexMap[rawHeader] !== undefined) {
          const rawIndex = headerIndexMap[rawHeader];
          formatRow[formatIndex] = rawRow[rawIndex] || '';
        }
      });
      
      // Boş satırları atla
      if (formatRow.some(cell => cell !== '')) {
        transformedData.push(formatRow);
      }
    }
    
    console.log(`✅ ${transformedData.length} satır Format Tablo'ya dönüştürüldü`);
    return transformedData;
    
  } catch (error) {
    console.error('❌ Dönüştürme hatası:', error);
    throw error;
  }
}

/**
 * Ham Veri validasyonu - format değişmiş mi kontrol et
 * @param {Array} headers - Sheet'ten okunan header'lar
 * @param {string} rawDataType - Beklenen Ham Veri tipi
 * @returns {Object} - { valid: boolean, missingColumns: [], extraColumns: [] }
 */
function validateRawDataFormat(headers, rawDataType) {
  console.log('🔍 Ham Veri formatı kontrol ediliyor...');
  
  const expectedHeaders = RAW_DATA_TYPES[rawDataType].headers;
  const actualHeaders = headers.map(h => h ? h.toString().trim() : '').filter(h => h);
  
  const missingColumns = [];
  const extraColumns = [];
  
  // Eksik sütunlar
  expectedHeaders.forEach(expected => {
    if (!actualHeaders.some(actual => 
      actual.toLowerCase() === expected.toLowerCase()
    )) {
      missingColumns.push(expected);
    }
  });
  
  // Fazla sütunlar
  actualHeaders.forEach(actual => {
    if (!expectedHeaders.some(expected => 
      actual.toLowerCase() === expected.toLowerCase()
    )) {
      extraColumns.push(actual);
    }
  });
  
  const valid = missingColumns.length === 0;
  
  if (valid) {
    console.log('✅ Ham Veri formatı geçerli');
  } else {
    console.warn('⚠️ Ham Veri formatında değişiklik tespit edildi!');
    if (missingColumns.length > 0) {
      console.warn('Eksik sütunlar:', missingColumns);
    }
    if (extraColumns.length > 0) {
      console.warn('Fazla sütunlar:', extraColumns);
    }
  }
  
  return { valid, missingColumns, extraColumns };
}

/**
 * MENÜ FONKSİYONU - Ham Veri → Format Tablo dönüştür
 */
function convertRawToFormatTable() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // 1. Aktif sheet'i al
    const rawSheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    if (!rawSheet) {
      ui.alert('Hata', 'Lütfen Ham Veri sayfasını seçin!', ui.ButtonSet.OK);
      return;
    }
    
    // 2. Header'ları oku
    const headers = rawSheet.getRange(1, 1, 1, rawSheet.getLastColumn()).getValues()[0];
    
    // 3. Ham Veri tipini tespit et
    const detectedType = detectRawDataType(headers);
    
    if (!detectedType) {
      // Otomatik tespit edemediyse kullanıcıya sor
      const response = ui.alert(
        'Ham Veri Tipi Seçin',
        'Otomatik tespit başarısız. Hangi Ham Veri tipini kullanıyorsunuz?\n\n' +
        'A = Extraktor\n' +
        'B = Scrapper\n' +
        'C = Apify',
        ui.ButtonSet.OK_CANCEL
      );
      
      if (response !== ui.Button.OK) return;
      
      const typeInput = ui.prompt('Ham Veri Tipi', 'A, B veya C giriniz:', ui.ButtonSet.OK_CANCEL);
      if (typeInput.getSelectedButton() !== ui.Button.OK) return;
      
      const typeMap = { 'A': 'A_EXTRAKTOR', 'B': 'B_SCRAPPER', 'C': 'C_APIFY' };
      const selectedType = typeMap[typeInput.getResponseText().toUpperCase().trim()];
      
      if (!selectedType) {
        ui.alert('Hata', 'Geçersiz tip! A, B veya C giriniz.', ui.ButtonSet.OK);
        return;
      }
      
      // Validasyon yap
      const validation = validateRawDataFormat(headers, selectedType);
      if (!validation.valid) {
        const continueResponse = ui.alert(
          'Format Uyarısı',
          `⚠️ Ham Veri formatında değişiklik tespit edildi!\n\n` +
          `Eksik sütunlar: ${validation.missingColumns.join(', ') || 'yok'}\n` +
          `Fazla sütunlar: ${validation.extraColumns.join(', ') || 'yok'}\n\n` +
          `Devam etmek istiyor musunuz?`,
          ui.ButtonSet.YES_NO
        );
        
        if (continueResponse !== ui.Button.YES) return;
      }
      
      // Dönüştür
      const formatData = transformRawToFormat(rawSheet, selectedType);
      
      // Format Tablo sheet'ine yaz
      writeToFormatTable(formatData);
      
    } else {
      // Otomatik tespit başarılı
      const validation = validateRawDataFormat(headers, detectedType);
      
      let confirmMessage = `Ham Veri tipi: ${RAW_DATA_TYPES[detectedType].name}\n\n`;
      
      if (!validation.valid) {
        confirmMessage += `⚠️ Format değişikliği tespit edildi!\n` +
          `Eksik: ${validation.missingColumns.join(', ') || 'yok'}\n` +
          `Fazla: ${validation.extraColumns.join(', ') || 'yok'}\n\n`;
      }
      
      confirmMessage += 'Format Tablo\'ya dönüştürmek istiyor musunuz?';
      
      const response = ui.alert('Onay', confirmMessage, ui.ButtonSet.YES_NO);
      
      if (response !== ui.Button.YES) return;
      
      // Dönüştür
      const formatData = transformRawToFormat(rawSheet, detectedType);
      
      // Format Tablo sheet'ine yaz
      writeToFormatTable(formatData);
    }
    
  } catch (error) {
    console.error('❌ Dönüştürme hatası:', error);
    ui.alert('Hata', `Dönüştürme başarısız:\n${error.message}`, ui.ButtonSet.OK);
  }
}

/**
 * Format Tablo'ya yaz
 * @param {Array} formatData - Format Tablo formatında data
 */
function writeToFormatTable(formatData) {
  const ui = SpreadsheetApp.getUi();
  
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let formatSheet = ss.getSheetByName('Format Tablo');
    
    // Format Tablo yoksa oluştur
    if (!formatSheet) {
      formatSheet = ss.insertSheet('Format Tablo');
      
      // Header'ları yaz
      formatSheet.getRange(1, 1, 1, FORMAT_TABLE_HEADERS.length)
        .setValues([FORMAT_TABLE_HEADERS])
        .setFontWeight('bold')
        .setBackground('#4A90E2');
    }
    
    if (formatData.length === 0) {
      ui.alert('Uyarı', 'Dönüştürülecek veri yok!', ui.ButtonSet.OK);
      return;
    }
    
    // Validation temizle
    const dataRange = formatSheet.getRange(2, 1, formatSheet.getMaxRows() - 1, 26);
    dataRange.clearDataValidations();
    SpreadsheetApp.flush();
    
    // Veriyi yaz
    formatSheet.getRange(2, 1, formatData.length, 26).setValues(formatData);
    
    console.log(`✅ ${formatData.length} satır Format Tablo'ya yazıldı`);
    ui.alert('Başarılı', `✅ ${formatData.length} satır Format Tablo'ya aktarıldı!`, ui.ButtonSet.OK);
    
  } catch (error) {
    console.error('❌ Format Tablo yazma hatası:', error);
    throw error;
  }
}

console.log('✅ Ham Veri → Format Tablo Mapper yüklendi');
