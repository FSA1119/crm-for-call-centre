function findColumnIndexByAliases(headers, aliases) {
  console.log('Function started:', { headersCount: headers ? headers.length : 0, aliases: aliases });
  try {
    if (!headers || !headers.length || !aliases || !aliases.length) {
      throw new Error('Invalid input provided');
    }

    var loweredAliases = aliases.map(function(alias) { return String(alias || '').trim().toLowerCase(); });
    for (var i = 0; i < headers.length; i++) {
      var h = String(headers[i] || '').trim().toLowerCase();
      if (loweredAliases.indexOf(h) !== -1) {
        console.log('Processing complete:', { index: i, header: headers[i] });
        return i;
      }
    }
    console.log('Processing complete:', { index: -1 });
    return -1;
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    throw error;
  }
}

// Normalizes opportunity status to canonical values
function normalizeFirsatDurumu(value) {
  console.log('Function started:', { value: value });
  try {
    var v = (value == null) ? '' : String(value).trim().toLowerCase();
    if (!v) {
      console.log('Processing complete:', '');
      return '';
    }
    if (v.indexOf('ilet') !== -1) {
      console.log('Processing complete:', 'Fırsat İletildi');
      return 'Fırsat İletildi';
    }
    if (v.indexOf('bilgi') !== -1) {
      console.log('Processing complete:', 'Bilgi Verildi');
      return 'Bilgi Verildi';
    }
    if (v.indexOf('yeniden') !== -1 || v.indexOf('ara') !== -1) {
      console.log('Processing complete:', 'Yeniden Aranacak');
      return 'Yeniden Aranacak';
    }
    console.log('Processing complete:', '');
    return '';
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    throw error;
  }
}

// Parses dd.MM.yyyy string to Date
function parseDate_ddMMyyyy(s) {
  console.log('Function started:', { s: s });
  try {
    if (s instanceof Date) {
      console.log('Processing complete:', { date: s });
      return s;
    }
    var str = String(s || '').trim();
    if (!str) {
      console.log('Processing complete:', '');
      return '';
    }
    var parts = str.split('.');
    if (parts.length !== 3) {
      console.log('Processing complete:', '');
      return '';
    }
    var d = Number(parts[0]);
    var m = Number(parts[1]) - 1;
    var y = Number(parts[2]);
    var dt = new Date(y, m, d);
    if (isNaN(dt.getTime())) {
      console.log('Processing complete:', '');
      return '';
    }
    console.log('Processing complete:', { date: dt });
    return dt;
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    throw error;
  }
}

function getCanonicalFirsatlarHeaders() {
  console.log('Function started:', {});
  try {
    var headers = [
      'Kod', 'Kaynak', 'Keyword', 'Location', 'Company name', 'Category',
      'Website', 'Phone', 'Yetkili Tel', 'Mail', 'İsim Soyisim',
      'Fırsat Durumu', 'Fırsat Tarihi', 'Yorum', 'Yönetici Not',
      'CMS Adı', 'CMS Grubu', 'E-Ticaret İzi', 'Site Hızı', 'Site Trafiği',
      'Log', 'Toplantı formatı', 'Address', 'City', 'Rating count', 'Review', 'Maplink'
    ];
    console.log('Processing complete:', { headers: headers });
    return headers;
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    throw error;
  }
}

// Migrates/standardizes the manager 'Fırsatlar' sheet to canonical headers and formats
function migrateManagerFirsatlarSheet() {
  console.log('Function started:', {});
  try {
    var ss = SpreadsheetApp.getActive();
    var ui = SpreadsheetApp.getUi();
    var sheet = ss.getSheetByName('Fırsatlar');
    if (!sheet) {
      throw new Error('Fırsatlar sayfası bulunamadı');
    }

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var existingHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    var data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, Math.max(1, lastCol)).getValues() : [];

    var backupName = 'Fırsatlar_yedek_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    sheet.copyTo(ss).setName(backupName);

    var canonical = getCanonicalFirsatlarHeaders();
    var tmp = ss.insertSheet('Fırsatlar_tmp');
    tmp.getRange(1, 1, 1, canonical.length).setValues([canonical]);

    var out = [];
    for (var r = 0; r < data.length; r++) {
      var dstRow = new Array(canonical.length).fill('');
      // map by same-name headers first
      for (var c = 0; c < canonical.length; c++) {
        var targetHeader = canonical[c];
        var srcIdx = findColumnIndexByAliases(existingHeaders, [targetHeader, String(targetHeader).toLowerCase(), String(targetHeader).toUpperCase()]);
        if (srcIdx !== -1) {
          dstRow[c] = data[r][srcIdx];
        }
      }
      // enforce required fields
      var dDurum = findColumnIndexByAliases(canonical, ['Fırsat Durumu']);
      var dTarih = findColumnIndexByAliases(canonical, ['Fırsat Tarihi']);
      var dSaat  = findColumnIndexByAliases(canonical, ['Saat']); // canonical does not include 'Saat' but keep hook if later added

      if (dDurum !== -1) {
        dstRow[dDurum] = normalizeFirsatDurumu(dstRow[dDurum]);
      }
      if (dTarih !== -1) {
        var parsed = parseDate_ddMMyyyy(dstRow[dTarih]);
        dstRow[dTarih] = parsed || '';
      }
      // Saat optional derive from date if exists and Saat column exists
      if (dSaat !== -1) {
        var sVal = dstRow[dSaat];
        if (!sVal && dTarih !== -1 && dstRow[dTarih] instanceof Date) {
          var dt = dstRow[dTarih];
          var hh = dt.getHours().toString().padStart(2, '0');
          var mm = dt.getMinutes().toString().padStart(2, '0');
          sVal = hh + ':' + mm;
        }
        dstRow[dSaat] = sVal || '';
      }

      out.push(dstRow);
    }

    if (out.length > 0) {
      tmp.getRange(2, 1, out.length, canonical.length).setValues(out);
    }

    // Replace original sheet
    var originalIndex = sheet.getIndex();
    ss.deleteSheet(sheet);
    tmp.setName('Fırsatlar');
    ss.setActiveSheet(tmp);
    ss.moveActiveSheet(originalIndex);

    // Formatting and validation
    var newLastRow = tmp.getLastRow();
    var newLastCol = tmp.getLastColumn();
    var headers = tmp.getRange(1, 1, 1, newLastCol).getValues()[0];
    var durumIdx = findColumnIndexByAliases(headers, ['Fırsat Durumu']);
    var tarihIdx = findColumnIndexByAliases(headers, ['Fırsat Tarihi']);

    if (tarihIdx !== -1 && newLastRow > 1) {
      tmp.getRange(2, tarihIdx + 1, newLastRow - 1, 1).setNumberFormat('dd.MM.yyyy');
    }

    if (durumIdx !== -1) {
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['Yeniden Aranacak', 'Bilgi Verildi', 'Fırsat İletildi'], true)
        .setAllowInvalid(true)
        .build();
      tmp.getRange(2, durumIdx + 1, Math.max(1, newLastRow - 1), 1).setDataValidation(rule);
    }

    // Apply color coding using local helper if global is not present
    if (typeof applyColorCodingToAllManagerSheets === 'function') {
      applyColorCodingToAllManagerSheets();
    } else {
      applyColorCodingToManagerOpportunities(tmp);
    }

    console.log('Processing complete:', { rows: out.length, backup: backupName });
    ui.alert('Fırsatlar sayfası standardize edildi. Yedek: ' + backupName);
    return { success: true, backupSheet: backupName, migratedRows: out.length };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    throw error;
  }
}

// Color coding for manager opportunities sheet based on 'Fırsat Durumu'
function applyColorCodingToManagerOpportunities(sheet) {
  console.log('Function started:', { sheetName: sheet && sheet.getName ? sheet.getName() : null });
  try {
    if (!sheet) throw new Error('Invalid input provided');
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2) {
      console.log('Processing complete:', { coloredRows: 0 });
      return { coloredRows: 0 };
    }

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var durumIdx = findColumnIndexByAliases(headers, ['Fırsat Durumu', 'Fırsat durumu', 'Durum']);
    if (durumIdx === -1) {
      console.log('Processing complete:', { coloredRows: 0, reason: 'Durum column not found' });
      return { coloredRows: 0 };
    }

    var range = sheet.getRange(2, 1, lastRow - 1, lastCol);
    var values = range.getValues();
    var backgrounds = range.getBackgrounds();

    for (var i = 0; i < values.length; i++) {
      var status = normalizeFirsatDurumu(values[i][durumIdx]);
      var color = '';
      if (status === 'Fırsat İletildi' && CRM_CONFIG && CRM_CONFIG.COLOR_CODES) {
        color = CRM_CONFIG.COLOR_CODES['Fırsat İletildi'] || '';
      } else if (status === 'Bilgi Verildi' && CRM_CONFIG && CRM_CONFIG.COLOR_CODES) {
        color = CRM_CONFIG.COLOR_CODES['Bilgi Verildi'] || '';
      } else if (status === 'Yeniden Aranacak' && CRM_CONFIG && CRM_CONFIG.COLOR_CODES) {
        color = CRM_CONFIG.COLOR_CODES['Yeniden Aranacak'] || '';
      }

      for (var c = 0; c < backgrounds[i].length; c++) {
        backgrounds[i][c] = color || '#ffffff';
      }
    }

    range.setBackgrounds(backgrounds);
    console.log('Processing complete:', { coloredRows: values.length });
    return { coloredRows: values.length };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    throw error;
  }
}

// Helper to run after a sync completes (fills/normalizes key columns and reapplies coloring)
function postSyncFixFirsatlar() {
  console.log('Function started:', {});
  try {
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName('Fırsatlar');
    if (!sheet) throw new Error('Fırsatlar sayfası bulunamadı');

    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2) {
      console.log('Processing complete:', { updatedRows: 0 });
      return { updatedRows: 0 };
    }

    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var dDurum = findColumnIndexByAliases(headers, ['Fırsat Durumu', 'Fırsat durumu', 'Durum']);
    var dTarih = findColumnIndexByAliases(headers, ['Fırsat Tarihi', 'Fırsat tarihi', 'Tarih']);

    var range = sheet.getRange(2, 1, lastRow - 1, lastCol);
    var values = range.getValues();

    for (var i = 0; i < values.length; i++) {
      if (dDurum !== -1) values[i][dDurum] = normalizeFirsatDurumu(values[i][dDurum]);
      if (dTarih !== -1) {
        var parsed = parseDate_ddMMyyyy(values[i][dTarih]);
        values[i][dTarih] = parsed || '';
      }
    }

    range.setValues(values);

    // formats
    if (dTarih !== -1) {
      sheet.getRange(2, dTarih + 1, lastRow - 1, 1).setNumberFormat('dd.MM.yyyy');
    }

    // recolor
    applyColorCodingToManagerOpportunities(sheet);

    console.log('Processing complete:', { updatedRows: values.length });
    return { updatedRows: values.length };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    throw error;
  }
}

// Optional admin menu hook
function adminMigrateFirsatlar() {
  console.log('Function started:', {});
  try {
    var result = migrateManagerFirsatlarSheet();
    console.log('Processing complete:', result);
    return result;
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    throw error;
  }
}

function forceStandardizeFirsatlarNoBackup() {
  console.log('Function started:', {});
  try {
    var ss = SpreadsheetApp.getActive();
    var sheet = ss.getSheetByName('Fırsatlar');
    if (!sheet) throw new Error('Fırsatlar sayfası bulunamadı');

    var canonical = getCanonicalFirsatlarHeaders();
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    var existingHeaders = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
    var data = lastRow > 1 ? sheet.getRange(2, 1, lastRow - 1, Math.max(1, lastCol)).getValues() : [];

    var out = [];
    for (var r = 0; r < data.length; r++) {
      var dstRow = new Array(canonical.length).fill('');
      for (var c = 0; c < canonical.length; c++) {
        var targetHeader = canonical[c];
        var srcIdx = findColumnIndexByAliases(existingHeaders, [targetHeader, String(targetHeader).toLowerCase(), String(targetHeader).toUpperCase()]);
        if (srcIdx !== -1) dstRow[c] = data[r][srcIdx];
      }
      // enforce required
      var dDurum = findColumnIndexByAliases(canonical, ['Fırsat Durumu']);
      var dTarih = findColumnIndexByAliases(canonical, ['Fırsat Tarihi']);
      if (dDurum !== -1) dstRow[dDurum] = normalizeFirsatDurumu(dstRow[dDurum]);
      if (dTarih !== -1) dstRow[dTarih] = parseDate_ddMMyyyy(dstRow[dTarih]) || '';
      out.push(dstRow);
    }

    // Ensure column count equals canonical length
    var currentMaxCols = sheet.getMaxColumns();
    if (currentMaxCols > canonical.length) {
      sheet.deleteColumns(canonical.length + 1, currentMaxCols - canonical.length);
    } else if (currentMaxCols < canonical.length) {
      sheet.insertColumnsAfter(currentMaxCols, canonical.length - currentMaxCols);
    }

    // Clear and rewrite
    sheet.clear();
    sheet.getRange(1, 1, 1, canonical.length).setValues([canonical]);
    if (out.length > 0) {
      sheet.getRange(2, 1, out.length, canonical.length).setValues(out);
    }

    // Formats & validation
    var tarihIdx = findColumnIndexByAliases(canonical, ['Fırsat Tarihi']);
    var durumIdx = findColumnIndexByAliases(canonical, ['Fırsat Durumu']);
    var lastRowNew = sheet.getLastRow();
    if (tarihIdx !== -1 && lastRowNew > 1) {
      sheet.getRange(2, tarihIdx + 1, lastRowNew - 1, 1).setNumberFormat('dd.MM.yyyy');
    }
    if (durumIdx !== -1) {
      var rule = SpreadsheetApp.newDataValidation()
        .requireValueInList(['Yeniden Aranacak', 'Bilgi Verildi', 'Fırsat İletildi'], true)
        .setAllowInvalid(true)
        .build();
      sheet.getRange(2, durumIdx + 1, Math.max(1, lastRowNew - 1), 1).setDataValidation(rule);
    }

    // Recolor
    applyColorCodingToManagerOpportunities(sheet);

    console.log('Processing complete:', { rows: out.length });
    return { success: true, rewrittenRows: out.length };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Error: ' + error.message);
    throw error;
  }
}
