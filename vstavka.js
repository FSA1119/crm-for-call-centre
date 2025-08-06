// ========================================
// TÜM RENKLENDİRME SİSTEMİ
// ========================================

const CRM_CONFIG = {
  // 🎨 Centralized Color System - Visual Harmony (SYNCED WITH BACKEND)
  COLOR_CODES: {
    // Primary Status Colors
    'Randevu Alındı': 'rgb(25, 172, 240)',      // Professional Blue
    'İleri Tarih Randevu': 'rgb(135, 206, 250)', // Light Blue
    'Randevu Teyitlendi': 'rgb(67, 206, 67)',    // Success Green
    'Randevu Ertelendi': 'rgb(195, 169, 128)',   // Warning Orange
    'Randevu İptal oldu': 'rgb(218, 92, 111)',   // Error Red
    
    // Opportunity Colors
    'Fırsat İletildi': 'rgb(199, 171, 235)',     // Purple
    'Bilgi Verildi': 'rgb(90, 191, 238)',        // Info Blue
    'Yeniden Aranacak': 'rgb(228, 145, 226)',    // Pink
    
    // Negative Status Colors
    'İlgilenmiyor': 'rgb(138, 118, 89)',         // Brown
    'Ulaşılamadı': 'rgb(255, 205, 210)',         // Light Red
    
    // Meeting Colors
    'Toplantı Tamamlandı': 'rgb(72, 224, 77)'    // Success Green
  }
};

/**
 * Applies Format Tablo color coding to specific row
 * @param {Sheet} sheet - Target sheet
 * @param {number} rowNumber - Row number to color
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
    if (!sheet || !rowNumber || !activity) {
      console.error('❌ Invalid parameters for color coding');
      return;
    }
    
    let color = 'rgb(255, 255, 255)'; // Default white
    
    // Map activity to color using centralized system
    if (activity === 'Randevu Alındı') {
      color = CRM_CONFIG.COLOR_CODES['Randevu Alındı'];
      console.log('🎨 Applied Randevu Alındı color:', color);
    } else if (activity === 'İleri Tarih Randevu') {
      color = CRM_CONFIG.COLOR_CODES['İleri Tarih Randevu'];
      console.log('🎨 Applied İleri Tarih Randevu color:', color);
    } else if (activity === 'Randevu Teyitlendi') {
      color = CRM_CONFIG.COLOR_CODES['Randevu Teyitlendi'];
      console.log('🎨 Applied Randevu Teyitlendi color:', color);
    } else if (activity === 'Randevu Ertelendi') {
      color = CRM_CONFIG.COLOR_CODES['Randevu Ertelendi'];
      console.log('🎨 Applied Randevu Ertelendi color:', color);
    } else if (activity === 'Randevu İptal oldu') {
      color = CRM_CONFIG.COLOR_CODES['Randevu İptal oldu'];
      console.log('🎨 Applied Randevu İptal oldu color:', color);
    } else if (activity === 'Fırsat İletildi') {
      color = CRM_CONFIG.COLOR_CODES['Fırsat İletildi'];
      console.log('🎨 Applied Fırsat İletildi color:', color);
    } else if (activity === 'Bilgi Verildi') {
      color = CRM_CONFIG.COLOR_CODES['Bilgi Verildi'];
      console.log('🎨 Applied Bilgi Verildi color:', color);
    } else if (activity === 'Yeniden Aranacak') {
      color = CRM_CONFIG.COLOR_CODES['Yeniden Aranacak'];
      console.log('🎨 Applied Yeniden Aranacak color:', color);
    } else if (activity === 'İlgilenmiyor') {
      color = CRM_CONFIG.COLOR_CODES['İlgilenmiyor'];
      console.log('🎨 Applied İlgilenmiyor color:', color);
    } else if (activity === 'Ulaşılamadı') {
      color = CRM_CONFIG.COLOR_CODES['Ulaşılamadı'];
      console.log('🎨 Applied Ulaşılamadı color:', color);
    } else if (activity === 'Toplantı Tamamlandı') {
      color = CRM_CONFIG.COLOR_CODES['Toplantı Tamamlandı'];
      console.log('🎨 Applied Toplantı Tamamlandı color:', color);
    } else {
      console.log('⚠️ Unknown activity:', activity, '- using default white');
    }
    
    // Apply color to entire row
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
    range.setBackground(color);
    
    console.log(`✅ Applied color ${color} to row ${rowNumber}`);
    
  } catch (error) {
    console.error('❌ Error applying Format Tablo color coding:', error);
  }
}

/**
 * Applies opportunity color coding to Fırsatlarım sheet
 * @param {Sheet} sheet - Target sheet
 * @param {number} rowNumber - Row number to color
 */
/**
 * 🎨 Opportunity Color Coding - Visual Status
 * @param {Sheet} sheet - Target sheet
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
    const statusColumn = findColumnIndex(sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0], ['Fırsat Durumu']);
    if (statusColumn === -1) {
      console.error('❌ Fırsat Durumu column not found');
      return;
    }
    
    const status = sheet.getRange(rowNumber, statusColumn).getValue();
    console.log('📋 Status found:', status, 'in row:', rowNumber);
    
    let color = 'rgb(255, 255, 255)'; // Default white
    
    // Map status to color using centralized system
    if (status === 'Fırsat İletildi') {
      color = CRM_CONFIG.COLOR_CODES['Fırsat İletildi'];
      console.log('🎨 Applied Fırsat İletildi color:', color);
    } else if (status === 'Bilgi Verildi') {
      color = CRM_CONFIG.COLOR_CODES['Bilgi Verildi'];
      console.log('🎨 Applied Bilgi Verildi color:', color);
    } else if (status === 'Yeniden Aranacak') {
      color = CRM_CONFIG.COLOR_CODES['Yeniden Aranacak'];
      console.log('🎨 Applied Yeniden Aranacak color:', color);
    } else if (status === 'İlgilenmiyor') {
      color = CRM_CONFIG.COLOR_CODES['İlgilenmiyor'];
      console.log('🎨 Applied İlgilenmiyor color:', color);
    } else if (status === 'Ulaşılamadı') {
      color = CRM_CONFIG.COLOR_CODES['Ulaşılamadı'];
      console.log('🎨 Applied Ulaşılamadı color:', color);
    } else {
      console.log('⚠️ Unknown status:', status, '- using default white');
    }
    
    // Apply color to entire row
    const range = sheet.getRange(rowNumber, 1, 1, sheet.getLastColumn());
    range.setBackground(color);
    
    console.log(`✅ Applied color ${color} to row ${rowNumber}`);
    
  } catch (error) {
    console.error('❌ Error in applyOpportunityColorCoding:', error);
  }
}

/**
 * Helper function to find column index by possible names
 * @param {Array} headers - Array of header names
 * @param {Array} possibleNames - Array of possible column names
 * @returns {number} - Column index (1-based) or -1 if not found
 */
function findColumnIndex(headers, possibleNames) {
  for (let i = 0; i < headers.length; i++) {
    if (possibleNames.includes(headers[i])) {
      return i + 1; // Return 1-based index
    }
  }
  return -1;
}

/**
 * Checks if a sheet is a Format Tablo
 * @param {Sheet} sheet - Sheet to check
 * @returns {boolean} - True if Format Tablo
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
 * Applies color coding to all sheets when spreadsheet opens
 */
function applyColorCodingToAllSheetsOnOpen() {
  console.log('🎨 Applying color coding to all sheets on open');
  
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheets = spreadsheet.getSheets();
    let appliedCount = 0;
    
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      
      if (sheetName === 'Fırsatlarım') {
        console.log('🎨 Applying color coding to Fırsatlarım');
        const dataRange = sheet.getDataRange();
        const rowCount = dataRange.getNumRows();
        
        if (rowCount > 1) {
          for (let row = 2; row <= rowCount; row++) {
            applyOpportunityColorCoding(sheet, row);
          }
          appliedCount++;
          console.log(`✅ Applied color coding to ${rowCount - 1} rows in Fırsatlarım`);
        }
      } else if (isFormatTable(sheet)) {
        console.log('🎨 Applying color coding to Format Tablo:', sheetName);
        const dataRange = sheet.getDataRange();
        const rowCount = dataRange.getNumRows();
        
        if (rowCount > 1) {
          const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
          const aktiviteIndex = headers.indexOf('Aktivite');
          
          if (aktiviteIndex !== -1) {
            for (let row = 2; row <= rowCount; row++) {
              const activity = sheet.getRange(row, aktiviteIndex + 1).getValue();
              if (activity && activity !== '') {
                applyFormatTableColorCoding(sheet, row, activity);
              }
            }
            appliedCount++;
            console.log(`✅ Applied color coding to ${rowCount - 1} rows in ${sheetName}`);
          }
        }
      }
    }
    
    console.log(`🎨 Color coding applied to ${appliedCount} sheets`);
    
  } catch (error) {
    console.error('❌ Error applying color coding on open:', error);
  }
}

/**
 * onEdit trigger for automatic color coding
 * @param {Event} e - Edit event
 */
function onEdit(e) {
  console.log('onEdit triggered');
  
  try {
    const sheet = e.source.getActiveSheet();
    const sheetName = sheet.getName();
    
    console.log('Sheet name:', sheetName);
    
    // Process Format Tablo sheets for activity changes
    if (isFormatTable(sheet)) {
      console.log('Format Tablo sheet detected, checking for activity changes');
      
      const range = e.range;
      const row = range.getRow();
      const col = range.getColumn();
      
      // Check if the edited cell is in the Aktivite column
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const aktiviteIndex = headers.indexOf('Aktivite');
      
      if (aktiviteIndex !== -1 && col === aktiviteIndex + 1 && row > 1) {
        console.log('Activity cell edited in row:', row);
        const newActivity = range.getValue();
        console.log('New activity value:', newActivity);
        
        // Apply color coding based on new activity
        applyFormatTableColorCoding(sheet, row, newActivity);
        console.log('Color coding applied for activity:', newActivity);
      }
      
      return;
    }
    
    // Process Fırsatlarım sheet for status changes
    if (sheetName === 'Fırsatlarım') {
      console.log('Fırsatlarım sheet detected, checking for status changes');
      
      const range = e.range;
      const row = range.getRow();
      const col = range.getColumn();
      
      console.log('Edit detected - Row:', row, 'Column:', col);
      
      // Check if the edited cell is in the Fırsat Durumu column
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
      
      console.log('Headers:', headers);
      console.log('Fırsat Durumu index:', firsatDurumuIndex);
      console.log('Expected column:', firsatDurumuIndex + 1, 'Actual column:', col);
      
      if (firsatDurumuIndex !== -1 && col === firsatDurumuIndex + 1 && row > 1) {
        console.log('✅ Fırsat Durumu cell edited in row:', row);
        const newStatus = range.getValue();
        console.log('✅ New Fırsat Durumu value:', newStatus);
        
        // Apply color coding based on new status
        applyOpportunityColorCoding(sheet, row);
        console.log('✅ Color coding applied for Fırsat Durumu:', newStatus);
      } else {
        console.log('❌ Not Fırsat Durumu column or invalid row');
        console.log('❌ Conditions: firsatDurumuIndex !== -1:', firsatDurumuIndex !== -1);
        console.log('❌ Conditions: col === firsatDurumuIndex + 1:', col === firsatDurumuIndex + 1);
        console.log('❌ Conditions: row > 1:', row > 1);
        console.log('❌ Column being edited:', col);
        console.log('❌ Expected column:', firsatDurumuIndex + 1);
        console.log('❌ Row being edited:', row);
      }
      
      return;
    }
    
    console.log('Not a Format Tablo or Fırsatlarım sheet, skipping:', sheetName);
    
  } catch (error) {
    console.error('onEdit error:', error);
  }
}

/**
 * Test function for onEdit trigger
 */
function testOnEditTrigger() {
  console.log('🧪 Testing onEdit trigger');
  
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const sheetName = sheet.getName();
    
    console.log('Active sheet:', sheetName);
    
    if (isFormatTable(sheet)) {
      console.log('✅ Sheet is Format Tablo');
      
      // Simulate editing activity column
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const aktiviteIndex = headers.indexOf('Aktivite');
      
      if (aktiviteIndex !== -1) {
        console.log('✅ Aktivite column found at index:', aktiviteIndex);
        
        // Test with first data row
        const testRow = 2;
        const testActivity = 'İlgilenmiyor';
        
        console.log('🧪 Testing with row:', testRow, 'activity:', testActivity);
        applyFormatTableColorCoding(sheet, testRow, testActivity);
        console.log('✅ Test completed');
      } else {
        console.log('❌ Aktivite column not found');
      }
    } else if (sheetName === 'Fırsatlarım') {
      console.log('✅ Sheet is Fırsatlarım');
      
      // Simulate editing Fırsat Durumu column
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const firsatDurumuIndex = headers.indexOf('Fırsat Durumu');
      
      if (firsatDurumuIndex !== -1) {
        console.log('✅ Fırsat Durumu column found at index:', firsatDurumuIndex);
        
        // Test with first data row
        const testRow = 2;
        
        console.log('🧪 Testing with row:', testRow);
        applyOpportunityColorCoding(sheet, testRow);
        console.log('✅ Test completed');
      } else {
        console.log('❌ Fırsat Durumu column not found');
      }
    } else {
      console.log('❌ Sheet is not Format Tablo or Fırsatlarım');
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}
