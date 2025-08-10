// ========================================
// GOOGLE SHEETS CRM - DATASET REPORTS
// ========================================

/**
 * 📦 Dataset Raporu oluşturur: Seçilen Format Tablo adı (dataset) için tüm sayfalarda özet çıkarır
 * Çıktı: "Data Raporları" sayfasına yazılır
 */
function generateDatasetReport(parameters) {
  console.log('Function started:', parameters);
  
  try {
    if (!validateInput(parameters || {})) {
      throw new Error('Invalid input provided');
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ui = SpreadsheetApp.getUi();

    // Mevcut Format Tablo sayfalarını topla
    const sheets = ss.getSheets();
    const datasetNames = sheets
      .map(s => s.getName())
      .filter(name => isFormatTable(ss.getSheetByName(name)));

    if (datasetNames.length === 0) {
      ui.alert('Bilgi', 'Herhangi bir Format Tablo bulunamadı.', ui.ButtonSet.OK);
      return { success: true };
    }

    // Prompt ile dataset adı seç
    const resp = ui.prompt('Dataset Raporu', `Dataset (Format Tablo) seçin:\n${datasetNames.join(', ')}`, ui.ButtonSet.OK_CANCEL);
    if (resp.getSelectedButton() !== ui.Button.OK) {
      return { success: false, message: 'İptal edildi' };
    }
    const dataset = resp.getResponseText().trim();
    if (!dataset) throw new Error('Dataset adı boş olamaz');

    // Rapor sayfası
    const reportName = 'Data Raporları';
    let report = ss.getSheetByName(reportName) || ss.insertSheet(reportName);
    // Temizlemeden önce satır ekle stratejisi: her dataset için blok ekleyelim
    const startRow = report.getLastRow() + 2;

    // 1) Format Tablo sayımı
    const ftSheet = ss.getSheetByName(dataset);
    if (!ftSheet) throw new Error(`Format Tablo bulunamadı: ${dataset}`);
    const ftData = ftSheet.getDataRange().getValues();
    const ftHeaders = ftData[0] || [];
    const ftRows = ftData.slice(1);
    const idxAktivite = ftHeaders.indexOf('Aktivite');
    const totalContacts = ftRows.filter(r => r.some(c => c !== '')).length;
    const ftCounts = countByValues(ftRows, idxAktivite, ['İlgilenmiyor','Ulaşılamadı','Randevu Alındı','İleri Tarih Randevu','Bilgi Verildi','Yeniden Aranacak','Fırsat İletildi']);

    // 2) Randevularım
    const rSheet = ss.getSheetByName('Randevularım');
    const rCounts = rSheet ? countBySource(rSheet, dataset, ['Randevu durumu'], ['Randevu Alındı','Randevu Teyitlendi','Randevu Ertelendi','Randevu İptal oldu','İleri Tarih Randevu']) : {};

    // 3) Fırsatlarım
    const fSheet = ss.getSheetByName('Fırsatlarım');
    const fCounts = fSheet ? countBySource(fSheet, dataset, ['Fırsat Durumu'], ['Yeniden Aranacak','Bilgi Verildi','Fırsat İletildi']) : {};

    // 4) Toplantılarım (Kaynak artık dataset)
    const tSheet = ss.getSheetByName('Toplantılarım');
    const tCounts = tSheet ? countBySource(tSheet, dataset, ['Toplantı Sonucu'], ['Satış Yapıldı','Teklif iletildi','Beklemede','Satış İptal']) : {};

    // Oranlar
    const safe = (v) => Number(v || 0);
    const percent = (v, base) => base > 0 ? Math.round((safe(v)/base)*1000)/10 : 0; // 1 hane

    const rows = [];
    rows.push([`📦 DATASET RAPORU – ${dataset}`]);
    rows.push([]);
    rows.push(['Toplam Kontak', totalContacts]);
    rows.push(['Randevu Alındı', safe(rCounts['Randevu Alındı']||0), `%${percent(rCounts['Randevu Alındı'], totalContacts)}`]);
    rows.push(['Fırsat İletildi', safe(fCounts['Fırsat İletildi']||0), `%${percent(fCounts['Fırsat İletildi'], totalContacts)}`]);
    rows.push(['Satış Yapıldı', safe(tCounts['Satış Yapıldı']||0), `%${percent(tCounts['Satış Yapıldı'], totalContacts)}`]);
    rows.push([]);
    rows.push(['Ulaşılamadı', safe(ftCounts['Ulaşılamadı']||0), `%${percent(ftCounts['Ulaşılamadı'], totalContacts)}`]);
    rows.push(['İlgilenmiyor', safe(ftCounts['İlgilenmiyor']||0), `%${percent(ftCounts['İlgilenmiyor'], totalContacts)}`]);
    rows.push([]);
    rows.push(['Randevu Dağılımı']);
    rows.push(['Randevu Alındı', safe(rCounts['Randevu Alındı']||0)]);
    rows.push(['Randevu Teyitlendi', safe(rCounts['Randevu Teyitlendi']||0)]);
    rows.push(['Randevu Ertelendi', safe(rCounts['Randevu Ertelendi']||0)]);
    rows.push(['Randevu İptal oldu', safe(rCounts['Randevu İptal oldu']||0)]);
    rows.push(['İleri Tarih Randevu', safe(rCounts['İleri Tarih Randevu']||0)]);
    rows.push([]);
    rows.push(['Fırsat Dağılımı']);
    rows.push(['Yeniden Aranacak', safe(fCounts['Yeniden Aranacak']||0)]);
    rows.push(['Bilgi Verildi', safe(fCounts['Bilgi Verildi']||0)]);
    rows.push(['Fırsat İletildi', safe(fCounts['Fırsat İletildi']||0)]);
    rows.push([]);
    rows.push(['Toplantı Sonuçları']);
    rows.push(['Satış Yapıldı', safe(tCounts['Satış Yapıldı']||0)]);
    rows.push(['Teklif iletildi', safe(tCounts['Teklif iletildi']||0)]);
    rows.push(['Beklemede', safe(tCounts['Beklemede']||0)]);
    rows.push(['Satış İptal', safe(tCounts['Satış İptal']||0)]);

    if (rows.length > 0) {
      report.getRange(startRow, 1, rows.length, Math.max(...rows.map(r => r.length))).setValues(rows);
      // Basit biçimleme
      report.getRange(startRow, 1).setFontWeight('bold').setFontSize(13).setFontColor('#1a73e8');
      report.getRange(startRow+2, 1, 1, 2).setFontWeight('bold');
      report.getRange(startRow+6, 1, 1, 2).setFontWeight('bold');
    }

    ui.alert('✅ Dataset Raporu', `${dataset} için rapor yazıldı.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { dataset });
    return { success: true };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

function countByValues(rows, valueIdx, keys) {
  const counts = {};
  keys.forEach(k => counts[k] = 0);
  if (valueIdx === -1) return counts;
  rows.forEach(r => {
    const v = (r[valueIdx] || '').toString().trim();
    if (v && counts.hasOwnProperty(v)) counts[v]++;
  });
  return counts;
}

function countBySource(sheet, dataset, statusHeaderAliases, keys) {
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return {};
  const headers = data[0];
  const rows = data.slice(1);
  const kaynakIdx = headers.indexOf('Kaynak');
  const statusIdx = findColumnIndex(headers, statusHeaderAliases);
  const counts = {};
  keys.forEach(k => counts[k] = 0);
  if (kaynakIdx === -1 || statusIdx === -1) return counts;
  rows.forEach(r => {
    const k = (r[kaynakIdx] || '').toString().trim();
    if (k !== dataset) return;
    const v = (r[statusIdx] || '').toString().trim();
    if (counts.hasOwnProperty(v)) counts[v]++;
  });
  return counts;
}

/**
 * CRM menüsüne Dataset rapor girişini eklemek için çağrılacak sarmalayıcı
 */
function showDatasetReportDialog() {
  console.log('Showing dataset report flow');
  generateDatasetReport({});
}
