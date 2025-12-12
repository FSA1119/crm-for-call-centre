/**
 * ========================================
 * 📊 DATA POOL İŞLEMLERİ - MENÜ SİSTEMİ
 * ========================================
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('📊 Data Pool')
    .addItem('🔄 Ham Veri → Format Tablo', 'convertRawToFormatTable')
    .addSeparator()
    .addItem('📋 Yardım', 'showDataPoolHelp')
    .addToUi();
}

function showDataPoolHelp() {
  const ui = SpreadsheetApp.getUi();
  
  ui.alert(
    '📚 Data Pool - Yardım',
    'Desteklenen Tipler:\n' +
    '• A_EXTRAKTOR (16 sütun)\n' +
    '• B_SCRAPPER (16 sütun)\n' +
    '• C_APIFY (11 sütun)\n\n' +
    'Kullanım:\n' +
    '1. Ham veri sayfasını aç\n' +
    '2. Menüden seç: 🔄 Ham Veri → Format Tablo\n' +
    '3. Sistem otomatik tespit yapar\n' +
    '4. Format Tablo (26 sütun) oluşur',
    ui.ButtonSet.OK
  );
}
