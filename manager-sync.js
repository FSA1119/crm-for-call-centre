// ========================================
// YÖNETİCİ DOSYASI - SİNKRONİZASYON SİSTEMİ
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
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
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
    
    // Добавляем заголовки
    const headers = ['Temsilci Kodu'];
    if (sheetName === 'Randevular') {
      headers.push('Kod', 'Şirket Adı', 'Telefon', 'Mail', 'Adres', 'Randevu Tarihi', 'Aktivite', 'Kaynak', 'Yönetici Not');
    } else if (sheetName === 'Fırsatlar') {
      headers.push('Kod', 'Şirket Adı', 'Telefon', 'Mail', 'Adres', 'Fırsat Tarihi', 'Fırsat Durumu', 'Kaynak', 'Yönetici Not');
    } else if (sheetName === 'Toplantılar') {
      headers.push('Kod', 'Şirket Adı', 'Telefon', 'Mail', 'Adres', 'Toplantı Tarihi', 'Toplantı Saati', 'Randevu Durumu', 'Toplantı Sonucu', 'Kaynak', 'Yönetici Not');
    }
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    console.log(`${sheetName} başlıkları eklendi`);
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
  menu.addItem('Toplantı Ekle', 'addManagerMeeting');
  menu.addSeparator();
  menu.addItem('Synchronization Status', 'showSyncStatus');
  menu.addSeparator();
  menu.addItem('🧪 Test Sistemi', 'runAllTests');
  
  menu.addToUi();
  
  console.log('Manager menu created');
}

// Показ статуса синхронизации
function showSyncStatus() {
  try {
    const managerFile = SpreadsheetApp.getActiveSpreadsheet();
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

// Функция onOpen для Yönetici файла
function onOpen() {
  console.log('Yönetici dosyası açıldı - SYNC menüsü oluşturuluyor');
  createManagerMenu();
}

// ========================================
// YÖNETİCİ TOPLANTI EKLEME FONKSİYONLARI
// ========================================

// Добавление встречи напрямую в Yönetici файле
function addManagerMeeting() {
  console.log('Yönetici toplantı ekleme başlatıldı');
  
  try {
    const ui = SpreadsheetApp.getUi();
    const response = ui.prompt(
      'Toplantı Ekle',
      'Hangi temsilci için toplantı eklemek istiyorsunuz?\n\n' + 
      Object.keys(EMPLOYEE_FILES).join('\n'),
      ui.ButtonSet.OK_CANCEL
    );
    
    if (response.getSelectedButton() === ui.Button.OK) {
      const selectedEmployee = response.getResponseText().trim();
      
      if (EMPLOYEE_FILES[selectedEmployee]) {
        showManagerMeetingDialog(selectedEmployee);
      } else {
        ui.alert('Hata', 'Geçersiz temsilci kodu. Lütfen listeden birini seçin.');
      }
    }
  } catch (error) {
    console.error('Manager meeting dialog error:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
  }
}

// Показ диалога добавления встречи
function showManagerMeetingDialog(employeeCode) {
  console.log(`Manager meeting dialog for ${employeeCode}`);
  
  const htmlTemplate = HtmlService.createTemplateFromFile('managerMeetingDialog');
  htmlTemplate.employeeCode = employeeCode;
  
  const htmlOutput = htmlTemplate.evaluate()
    .setWidth(500)
    .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Yönetici Toplantı Ekle');
}

// Обработка формы встречи от Yönetici
function processManagerMeetingForm(formData) {
  console.log('Manager meeting form processed:', formData);
  
  try {
    const employeeCode = formData.employeeCode;
    const employeeFileId = EMPLOYEE_FILES[employeeCode];
    
    if (!employeeFileId) {
      throw new Error('Geçersiz temsilci kodu');
    }
    
    const employeeFile = SpreadsheetApp.openById(employeeFileId);
    const toplantilarimSheet = employeeFile.getSheetByName('Toplantılarım');
    
    if (!toplantilarimSheet) {
      throw new Error('Toplantılarım sayfası bulunamadı');
    }
    
    // Добавляем встречу в Temsilci файл
    const meetingData = {
      temsilciKodu: employeeCode,
      sirketAdi: formData.sirketAdi,
      telefon: formData.telefon,
      mail: formData.mail,
      adres: formData.adres,
      toplantiTarihi: formData.toplamtiTarihi,
      toplantiSaati: formData.toplamtiSaati,
      randevuDurumu: formData.randevuDurumu,
      toplantiSonucu: formData.toplamtiSonucu,
      yoneticiNot: formData.yoneticiNot
    };
    
    addMeetingToEmployeeFile(toplantilarimSheet, meetingData);
    
    // Обновляем Yönetici файл
    collectAllData();
    
    SpreadsheetApp.getUi().alert('Başarılı', 'Toplantı başarıyla eklendi ve senkronize edildi.');
    
  } catch (error) {
    console.error('Manager meeting processing error:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
  }
}

// Добавление встречи в файл сотрудника
function addMeetingToEmployeeFile(sheet, meetingData) {
  const lastRow = sheet.getLastRow() + 1;
  
  const rowData = [
    meetingData.temsilciKodu,
    meetingData.sirketAdi,
    meetingData.telefon,
    meetingData.mail,
    meetingData.adres,
    meetingData.toplamtiTarihi,
    meetingData.toplamtiSaati,
    meetingData.randevuDurumu,
    meetingData.toplamtiSonucu,
    'Yönetici Ekleme',
    meetingData.yoneticiNot
  ];
  
  sheet.getRange(lastRow, 1, 1, rowData.length).setValues([rowData]);
  console.log('Meeting added to employee file');
}

console.log('Yönetici synchronization system loaded'); 