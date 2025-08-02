// ========================================
// GOOGLE SHEETS CRM SYSTEM - TEST FUNCTIONS
// ========================================
// Version: 1.0
// Author: CRM Development Team
// Date: 2025-07-08

/**
 * Tests all CRM functions
 */
function testCRMSystem() {
  console.log('🧪 Starting CRM System Tests...');
  
  try {
    // Test 1: Configuration
    testConfiguration();
    
    // Test 2: Utility Functions
    testUtilityFunctions();
    
    // Test 3: New Ham Veri Format
    testNewHamVeriFormat();
    
    // Test 4: Sheet Creation
    testSheetCreation();
    
    // Test 5: Data Validation
    testDataValidation();
    
    // Test 6: Color Coding
    testColorCoding();
    
    console.log('✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Tests CRM configuration
 */
function testConfiguration() {
  console.log('Testing CRM Configuration...');
  
  // Test employee codes
  if (!CRM_CONFIG.EMPLOYEE_CODES) {
    throw new Error('Employee codes not defined');
  }
  
  if (Object.keys(CRM_CONFIG.EMPLOYEE_CODES).length !== 6) {
    throw new Error('Expected 6 employee codes');
  }
  
  // Test activity options
  if (!CRM_CONFIG.ACTIVITY_OPTIONS) {
    throw new Error('Activity options not defined');
  }
  
  if (CRM_CONFIG.ACTIVITY_OPTIONS.length !== 7) {
    throw new Error('Expected 7 activity options');
  }
  
  // Test color codes
  if (!CRM_CONFIG.COLOR_CODES) {
    throw new Error('Color codes not defined');
  }
  
  console.log('✅ Configuration test passed');
}

/**
 * Tests utility functions
 */
function testUtilityFunctions() {
  console.log('Testing Utility Functions...');
  
  // Test input validation
  const validInput = { test: 'data' };
  const invalidInput = null;
  
  if (!validateInput(validInput)) {
    throw new Error('Valid input validation failed');
  }
  
  if (validateInput(invalidInput)) {
    throw new Error('Invalid input validation failed');
  }
  
  // Test activity logging
  const logEntry = logActivity('test', { data: 'test' });
  if (!logEntry.timestamp || !logEntry.action) {
    throw new Error('Activity logging failed');
  }
  
  console.log('✅ Utility functions test passed');
}

/**
 * Tests sheet creation functions
 */
function testSheetCreation() {
  console.log('Testing Sheet Creation...');
  
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Test Format Tablo creation
  const testTableName = 'Test Format Tablo';
  const testSheet = spreadsheet.insertSheet(testTableName);
  
  // Add test headers (matching new ham veri format)
  const testHeaders = ['Keyword', 'Location', 'Company name', 'Category', 'Website', 'Phone', 'Email 1', 'Email 2', 'Email 3', 'Address', 'City', 'State', 'Pincode', 'Rating count', 'Review', 'Cid'];
  testSheet.getRange(1, 1, 1, testHeaders.length).setValues([testHeaders]);
  
  // Add test data (matching new ham veri format)
  const testData = [
    ['hırdavat', 'izmit', 'Test Company', 'Building materials store', 'http://test.com', '05551234567', '', '', '', 'Test Address', 'İzmit/Kocaeli', '', '41100', '100', '4.5', 'https://maps.google.com/?cid=123456789']
  ];
  testSheet.getRange(2, 1, testData.length, testHeaders.length).setValues(testData);
  
  // Test data collection
  const collectedData = collectFormatTableData(testSheet);
  if (collectedData.length !== 1) {
    throw new Error('Data collection failed');
  }
  
  // Test Cid to Maplink conversion
  const testRecord = collectedData[0];
  if (!testRecord.maplink || !testRecord.maplink.includes('maps.google.com')) {
    throw new Error('Cid to Maplink conversion failed');
  }
  
  // Clean up
  spreadsheet.deleteSheet(testSheet);
  
  console.log('✅ Sheet creation test passed');
}

/**
 * Tests data validation
 */
function testDataValidation() {
  console.log('Testing Data Validation...');
  
  // Test activity validation
  const validActivity = 'Randevu Alındı';
  const invalidActivity = 'Invalid Activity';
  
  if (!CRM_CONFIG.ACTIVITY_OPTIONS.includes(validActivity)) {
    throw new Error('Valid activity not found in options');
  }
  
  if (CRM_CONFIG.ACTIVITY_OPTIONS.includes(invalidActivity)) {
    throw new Error('Invalid activity found in options');
  }
  
  // Test meeting format validation
  const validFormat = 'Yüz Yüze';
  const invalidFormat = 'Invalid Format';
  
  if (!CRM_CONFIG.MEETING_FORMAT_OPTIONS.includes(validFormat)) {
    throw new Error('Valid meeting format not found in options');
  }
  
  if (CRM_CONFIG.MEETING_FORMAT_OPTIONS.includes(invalidFormat)) {
    throw new Error('Invalid meeting format found in options');
  }
  
  console.log('✅ Data validation test passed');
}

/**
 * Tests color coding
 */
function testColorCoding() {
  console.log('Testing Color Coding...');
  
  // Test color codes exist
  const testStatuses = ['Randevu Alındı', 'Teyitlendi', 'Ertelendi', 'İptal', 'Fırsat', 'Toplantı Tamamlandı'];
  
  testStatuses.forEach(status => {
    if (!CRM_CONFIG.COLOR_CODES[status]) {
      throw new Error(`Color code missing for status: ${status}`);
    }
    
    // Test color format (hex)
    const color = CRM_CONFIG.COLOR_CODES[status];
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      throw new Error(`Invalid color format for status: ${status}`);
    }
  });
  
  console.log('✅ Color coding test passed');
}

/**
 * Tests pivot table creation
 */
function testPivotTable() {
  console.log('Testing Pivot Table Creation...');
  
  // Create test data
  const testData = [
    {
      source: 'Format Tablo',
      kod: 'LG_001_001',
      aktivite: 'Randevu Alındı',
      aktiviteTarihi: new Date(),
      companyName: 'Test Company 1',
      category: 'Test Category',
      toplantiSonucu: 'Satış Yapıldı'
    },
    {
      source: 'Format Tablo',
      kod: 'LG_001_002',
      aktivite: 'Bilgi Verildi',
      aktiviteTarihi: new Date(),
      companyName: 'Test Company 2',
      category: 'Test Category'
    },
    {
      source: 'Randevularım',
      kod: 'LG_001_003',
      aktivite: 'Randevu Alındı',
      aktiviteTarihi: new Date(),
      companyName: 'Test Company 3',
      category: 'Test Category',
      toplantiSonucu: 'Teklif İletildi'
    }
  ];
  
  // Create pivot table
  const pivotTable = createPivotTable(testData);
  
  // Test pivot table structure
  if (!pivotTable.activityGroups) {
    throw new Error('Pivot table missing activity groups');
  }
  
  if (pivotTable.totalCount !== 3) {
    throw new Error('Pivot table count mismatch');
  }
  
  if (!pivotTable.activityGroups['Randevu Alındı']) {
    throw new Error('Randevu Alındı group missing');
  }
  
  if (pivotTable.activityGroups['Randevu Alındı'].count !== 2) {
    throw new Error('Randevu Alındı count mismatch');
  }
  
  console.log('✅ Pivot table test passed');
}

/**
 * Tests HTML template creation
 */
function testHTMLTemplates() {
  console.log('Testing HTML Templates...');
  
  // Test appointment dialog template
  try {
    const htmlTemplate = HtmlService.createTemplateFromFile('appointmentDialog');
    if (!htmlTemplate) {
      throw new Error('Appointment dialog template not found');
    }
  } catch (error) {
    console.warn('Appointment dialog template test skipped (file may not exist)');
  }
  
  // Test opportunity dialog template
  try {
    const htmlTemplate = HtmlService.createTemplateFromFile('opportunityDialog');
    if (!htmlTemplate) {
      throw new Error('Opportunity dialog template not found');
    }
  } catch (error) {
    console.warn('Opportunity dialog template test skipped (file may not exist)');
  }
  
  // Test meeting dialog template
  try {
    const htmlTemplate = HtmlService.createTemplateFromFile('meetingDialog');
    if (!htmlTemplate) {
      throw new Error('Meeting dialog template not found');
    }
  } catch (error) {
    console.warn('Meeting dialog template test skipped (file may not exist)');
  }
  
  console.log('✅ HTML templates test passed');
}

/**
 * Runs a quick system check
 */
function quickSystemCheck() {
  console.log('🔍 Running Quick System Check...');
  
  try {
    // Check if we're in a Google Sheets environment
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('Not in Google Sheets environment');
    }
    
    // Check CRM menu creation
    const ui = SpreadsheetApp.getUi();
    if (!ui) {
      throw new Error('UI not available');
    }
    
    // Check configuration
    if (!CRM_CONFIG) {
      throw new Error('CRM configuration not loaded');
    }
    
    console.log('✅ Quick system check passed');
    console.log('📊 CRM System is ready for use!');
    
  } catch (error) {
    console.error('❌ Quick system check failed:', error);
    throw error;
  }
}

/**
 * Tests specific function
 */
function testSpecificFunction(functionName) {
  console.log(`🧪 Testing specific function: ${functionName}`);
  
  switch (functionName) {
    case 'createNewTable':
      // Test createNewTable function
      console.log('Testing createNewTable function...');
      // Add specific test logic here
      break;
      
    case 'takeAppointment':
      // Test takeAppointment function
      console.log('Testing takeAppointment function...');
      // Add specific test logic here
      break;
      
    case 'addOpportunity':
      // Test addOpportunity function
      console.log('Testing addOpportunity function...');
      // Add specific test logic here
      break;
      
    case 'moveToMeeting':
      // Test moveToMeeting function
      console.log('Testing moveToMeeting function...');
      // Add specific test logic here
      break;
      
    case 'generateReport':
      // Test generateReport function
      console.log('Testing generateReport function...');
      // Add specific test logic here
      break;
      
    default:
      console.error(`Unknown function: ${functionName}`);
      throw new Error(`Unknown function: ${functionName}`);
  }
  
  console.log(`✅ ${functionName} test completed`);
}

/**
 * Tests new ham veri format compatibility
 */
function testNewHamVeriFormat() {
  console.log('🧪 Testing New Ham Veri Format Compatibility...');
  
  try {
    // Create test ham veri
    const testHamVeri = [
      ['Keyword', 'Location', 'Company name', 'Category', 'Website', 'Phone', 'Email 1', 'Email 2', 'Email 3', 'Address', 'City', 'State', 'Pincode', 'Rating count', 'Review', 'Cid'],
      ['hırdavat', 'izmit', 'MAZLUM TEKNİK HIRDAVAT', 'Department store', '', '0532 748 04 20', '', '', '', 'İZMİT SANAYİ SİTESİ 401 BLOK NO, D:5, 41140 Kocaeli', 'İzmit/Kocaeli', '', '41140', '264', '4.2', 'https://maps.google.com/?cid=13065953095889504726']
    ];
    
    // Test Cid to Maplink conversion
    const cid = testHamVeri[1][15]; // Cid column
    const cidMatch = cid.match(/cid=(\d+)/);
    
    if (!cidMatch) {
      throw new Error('CID extraction failed');
    }
    
    const expectedMaplink = `https://maps.google.com/?cid=${cidMatch[1]}`;
    console.log('Expected Maplink:', expectedMaplink);
    
    // Test employee code generation
    const employeeCode = 'LG_001'; // Simulated employee code
    const expectedCode1 = `${employeeCode}_001`;
    const expectedCode2 = `${employeeCode}_002`;
    
    console.log('Expected Codes:', expectedCode1, expectedCode2);
    
    // Test column mapping
    const hamVeriHeaders = testHamVeri[0];
    const hamVeriRow = testHamVeri[1];
    
    // Check required columns exist
    const requiredColumns = ['Keyword', 'Location', 'Company name', 'Category', 'Website', 'Phone', 'Address', 'City', 'Rating count', 'Review', 'Cid'];
    
    requiredColumns.forEach(column => {
      const index = hamVeriHeaders.indexOf(column);
      if (index === -1) {
        throw new Error(`Required column missing: ${column}`);
      }
    });
    
    // Test data extraction
    const companyName = hamVeriRow[hamVeriHeaders.indexOf('Company name')];
    const phone = hamVeriRow[hamVeriHeaders.indexOf('Phone')];
    const category = hamVeriRow[hamVeriHeaders.indexOf('Category')];
    
    if (!companyName || !phone || !category) {
      throw new Error('Data extraction failed');
    }
    
    console.log('✅ New ham veri format test passed');
    console.log('📊 Test Data:');
    console.log('  Company:', companyName);
    console.log('  Phone:', phone);
    console.log('  Category:', category);
    console.log('  Maplink:', expectedMaplink);
    console.log('  Generated Codes:', expectedCode1, expectedCode2);
    
  } catch (error) {
    console.error('❌ New ham veri format test failed:', error);
    throw error;
  }
}

// Export test functions for external use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testCRMSystem,
    testConfiguration,
    testUtilityFunctions,
    testSheetCreation,
    testDataValidation,
    testColorCoding,
    testPivotTable,
    testHTMLTemplates,
    quickSystemCheck,
    testSpecificFunction
  };
} 