// ========================================
// GOOGLE SHEETS CRM - AGENT UTILITIES
// ========================================

/**
 * 🔎 Mükerrerleri Bul (Firma + Telefon)
 * Aktif sayfadaki tekrarlanan satırları tespit eder ve bir özet sayfasında listeler.
 * Kriter: Company name (+ varsa Phone). Boş company name kayıtları raporlanmaz.
 */
function findDuplicatesInFormatTable(parameters) {
  console.log('Function started:', parameters);
  
  try {
    // Input validation
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }

    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const sheetName = sheet.getName();

    // Yalnızca CRM sayfalarında çalıştır
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
      if (!company) continue; // boş şirket adı atla
      const phoneRaw = phoneIdx !== -1 ? (row[phoneIdx] || '').toString() : '';
      const phoneDigits = phoneRaw.replace(/\D+/g, '');
      const phoneKey = phoneDigits.length >= 7 ? phoneDigits : ''; // kısa telefonları eşleştirmeye katma
      const key = `${company.toLowerCase()}|${phoneKey}`;
      if (!keyToRows.has(key)) keyToRows.set(key, []);
      keyToRows.get(key).push(i + 1); // gerçek satır numarası
    }

    const duplicates = [...keyToRows.entries()].filter(([, rows]) => rows.length > 1);
    console.log('Duplicate groups:', duplicates.length);

    // Rapor sayfası oluştur/temizle
    const ss = sheet.getParent();
    const reportName = '🧪 Mükerrer Raporu';
    let report = ss.getSheetByName(reportName) || ss.insertSheet(reportName);
    report.clear();

    // Başlıklar
    const headerRow = ['Key', 'Şirket', 'Telefon', 'Tekrar Sayısı', 'Satırlar'];
    report.getRange(1, 1, 1, headerRow.length).setValues([headerRow]).setFontWeight('bold');

    // Satırları yaz
    let r = 2;
    duplicates.forEach(([key, rows]) => {
      const [companyKey, phoneKey] = key.split('|');
      const company = companyKey ? companyKey : '';
      const phone = phoneKey ? phoneKey : '';
      report.getRange(r, 1, 1, 5).setValues([[key, company, phone, rows.length, rows.join(', ')]]);
      r++;
    });

    // Biçimleme
    if (r > 2) {
      report.setFrozenRows(1);
      report.getRange(1, 1, r - 1, headerRow.length).setBorder(true, true, true, true, true, true);
      report.autoResizeColumns(1, headerRow.length);
    }

    ui.alert('Mükerrer tarama tamamlandı', `Toplam grup: ${duplicates.length}\nDetaylar '${reportName}' sayfasında.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { groups: duplicates.length });
    return { success: true, groups: duplicates.length };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🧭 Lokasyona göre sırala (A→Z)
 * Aktif sayfada 'Location' kolonuna göre A→Z sıralar. Başlık sabit kalır.
 */
function sortActiveSheetByLocation(parameters) {
  console.log('Function started:', parameters);
  
  try {
    // Input validation
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
    console.log('Processing complete:', { sortedRows: rows.length });
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🧰 Sektör Yardımcısı – aktif satırdaki Category için referansları gösterir
 */
function showSectorHelperDialog(parameters) {
  console.log('Function started:', parameters);
  
  try {
    // Input validation
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }

    const sheet = SpreadsheetApp.getActiveSheet();
    const range = SpreadsheetApp.getActiveRange();
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const categoryIdx = findColumnIndex(headers, ['Category']);

    let currentCategory = '';
    if (range && range.getRow() > 1 && categoryIdx !== -1) {
      currentCategory = (sheet.getRange(range.getRow(), categoryIdx + 1).getValue() || '').toString();
    }

    const refs = getSectorReferences(currentCategory);

    const tmpl = HtmlService.createTemplateFromFile('helperDialog');
    tmpl.category = currentCategory;
    tmpl.references = refs;

    const html = tmpl.evaluate().setWidth(600).setHeight(500);
    SpreadsheetApp.getUi().showSidebar(html);
    console.log('Processing complete:', { category: currentCategory });
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Sektör referanslarını saklayan/gelen yardımcılar (Config sheet kullanır)
 */
function ensureSectorReferenceSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Config - Sektör Referans';
  let s = ss.getSheetByName(sheetName);
  if (!s) {
    s = ss.insertSheet(sheetName);
    s.getRange(1, 1, 1, 3).setValues([[
      'Category',
      'Referanslar (satır içi; \n ile ayrılmış)',
      'Notlar'
    ]]);
    s.setFrozenRows(1);
  }
  return s;
}

function getSectorReferences(category) {
  const s = ensureSectorReferenceSheet();
  const lastRow = s.getLastRow();
  if (lastRow <= 1) return { category: category || '', references: [], notes: '' };
  const vals = s.getRange(2, 1, lastRow - 1, 3).getValues();
  for (const row of vals) {
    if ((row[0] || '').toString().trim().toLowerCase() === (category || '').toString().trim().toLowerCase()) {
      const refs = (row[1] || '').toString().split('\n').filter(Boolean);
      return { category, references: refs, notes: (row[2] || '').toString() };
    }
  }
  return { category: category || '', references: [], notes: '' };
}

function saveSectorReferences(payload) {
  console.log('Saving sector references:', payload);
  try {
    const s = ensureSectorReferenceSheet();
    const lastRow = s.getLastRow();
    const vals = lastRow > 1 ? s.getRange(2, 1, lastRow - 1, 3).getValues() : [];
    const target = (payload.category || '').toString().trim().toLowerCase();
    let found = false;
    for (let i = 0; i < vals.length; i++) {
      const cat = (vals[i][0] || '').toString().trim().toLowerCase();
      if (cat === target) {
        s.getRange(i + 2, 1, 1, 3).setValues([[payload.category || '', (payload.references || []).join('\n'), payload.notes || '']]);
        found = true;
        break;
      }
    }
    if (!found) {
      s.getRange(lastRow + 1, 1, 1, 3).setValues([[payload.category || '', (payload.references || []).join('\n'), payload.notes || '']]);
    }
    console.log('Processing complete: sector references saved');
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}
