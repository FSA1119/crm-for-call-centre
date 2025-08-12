/**
 * CMS / E-Ticaret Platform Tespiti – Satış Odaklı
 * Version: 4.4
 * Çıktı kuralları:
 *  - Bilinen platform: sadece CMS adı
 *  - Pazar yeri/sosyal mağaza alan adı: "Sitesi Yok"
 *  - Bilinmeyen (custom): kalite analizine göre "Düşük Kalite" | "Yüksek Kalite"
 */

function cmsDetectFunctionStarted(parameters) {
  console.log('Function started:', parameters);
}

/**
 * Ana giriş – tek URL için tespit
 * @param {string} rawUrl URL veya domain
 * @returns {string} Sonuç (ör: "Shopify" | "WooCommerce" | "Sitesi Yok" | "Düşük Kalite" | "Yüksek Kalite")
 */
function detectCMSForUrl(rawUrl) {
  cmsDetectFunctionStarted({ rawUrl });
  try {
    const url = normalizeUrl(rawUrl);
    if (!url) return '';

    const domain = extractDomain(url);
    if (isMarketplaceOrSocial(domain)) {
      console.log('Marketplace/social detected:', domain);
      return 'Sitesi Yok';
    }

    const fetched = fetchSiteWithRedirects(url);
    if (fetched && (fetched.unreachable || (fetched.statusCode && fetched.statusCode >= 400))) {
      return 'Erişilemedi';
    }
    const signals = buildSignals(fetched);

    let known = detectKnownCMS(signals);
    if (known) {
      // Eğer Shopify ve site kapalı ise (4xx/5xx veya body'de offline ibareleri), Erişilemedi yaz
      if (known === 'Shopify') {
        const offlineHint = /(store\s+is\s+unavailable|we\'re\s+currently\s+unavailable|site\s+is\s+down|coming\s+soon|password\s+page)/i;
        if ((signals.statusCode && signals.statusCode >= 400) || offlineHint.test(signals.html)) {
          return 'Erişilemedi';
        }
      }
      console.log('Known CMS matched:', known, { url: fetched.finalUrl });
      return known;
    }

    // Deep probe (accurate mode fallback)
    known = deepProbeCMS(fetched.finalUrl);
    if (known) {
      console.log('Deep probe matched:', known, { url: fetched.finalUrl });
      return known;
    }

    const quality = classifyCustomQuality(signals);
    console.log('Custom build classified:', quality, { url: fetched.finalUrl });
    return quality; // "Düşük Kalite" | "Yüksek Kalite"
  } catch (error) {
    console.error('Function failed:', error);
    try { SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK); } catch(_) {}
    // Hata durumunda lead potansiyelini kaybetmemek adına "Düşük Kalite" döndürmek mantıklı olabilir
    return 'Düşük Kalite';
  }
}

function deepProbeCMS(finalUrl) {
  try {
    if (!finalUrl) return '';
    var base = '';
    try { base = (new (this.URL || Url)(finalUrl)).origin; } catch(_) { base = finalUrl.replace(/^(https?:\/\/[^\/]+).*/, '$1'); }
    const probes = [
      { name: 'Shopify', url: base + '/cart.js', type: 'json', mustContain: 'items' },
      { name: 'Shopify', url: base + '/collections.json', type: 'json' },
      { name: 'WordPress', url: base + '/wp-json/', type: 'json' },
      { name: 'WordPress', url: base + '/wp-login.php', type: 'text', mustContain: 'WordPress' },
      { name: 'WooCommerce', url: base + '/wp-content/plugins/woocommerce/readme.txt', type: 'text', mustContain: 'WooCommerce' },
      { name: 'WooCommerce', url: base + '/?wc-ajax=cart', type: 'json' }
    ];
    const reqs = probes.map(p => ({ url: p.url, muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (LeadBot; CRM-Detector)' } }));
    const resps = UrlFetchApp.fetchAll(reqs);
    for (let i = 0; i < resps.length; i++) {
      try {
        const ct = String(resps[i].getHeaders()['Content-Type'] || '').toLowerCase();
        const body = resps[i].getContentText();
        const p = probes[i];
        if (p.type === 'json' && /json/.test(ct)) return p.name;
        if (p.type === 'text') {
          if (!p.mustContain || body.indexOf(p.mustContain) !== -1) return p.name;
        }
      } catch(_) {}
    }
    return '';
  } catch (_) { return ''; }
}

/**
 * Çoklu URL için toplu tespit
 * @param {string[]} urls
 * @returns {string[]} sonuçlar sırayla
 */
function detectCMSBatch(urls) {
  cmsDetectFunctionStarted({ size: urls && urls.length });
  try {
    if (!Array.isArray(urls) || urls.length === 0) return [];
    const out = [];
    for (const u of urls) {
      out.push(detectCMSForUrl(u));
    }
    console.log('Processing complete:', { size: out.length });
    return out;
  } catch (error) {
    console.error('Function failed:', error);
    return urls.map(_ => 'Düşük Kalite');
  }
}

/**
 * Paralel hızlı toplu tespit (redirect takibi yok; 1 dakikalık toplu taramalar için)
 */
function detectCMSBatchFast(urls) {
  cmsDetectFunctionStarted({ fast: true, size: urls && urls.length });
  try {
    if (!Array.isArray(urls) || urls.length === 0) return [];
    const reqs = urls.map(u => ({ url: normalizeUrl(u), muteHttpExceptions: true, followRedirects: true, headers: { 'User-Agent': 'Mozilla/5.0 (LeadBot; CRM-Detector)' } }));
    const resps = UrlFetchApp.fetchAll(reqs);
    const out = [];
    for (let i = 0; i < resps.length; i++) {
      try {
        const html = resps[i].getContentText();
        const headers = normalizeHeaders(resps[i].getAllHeaders());
        const finalUrl = reqs[i].url;
        const signals = { html, headers, finalUrl, domain: extractDomain(finalUrl) };
        if (isMarketplaceOrSocial(signals.domain)) { out.push('Sitesi Yok'); continue; }
        const known = detectKnownCMS(signals);
        out.push(known || classifyCustomQuality(signals));
      } catch (e) {
        out.push('Düşük Kalite');
      }
    }
    return out;
  } catch (error) {
    console.error('Function failed:', error);
    return urls.map(_ => 'Düşük Kalite');
  }
}

function mapCmsGroup(name) {
  const n = String(name||'').toLowerCase();
  if (!n) return '';
  // Özel etiketler
  if (['ticimax','t-soft','ikas'].some(k=>n.indexOf(k)!==-1)) return 'Rakip';
  if (['ideasoft'].some(k=>n.indexOf(k)!==-1)) return 'Bizim';
  // Genel gruplar
  if (['shopify','wix','bigcommerce','squarespace','ecwid','webflow','weebly','volusion','shift4shop','bigcartel','selz','godaddy'].some(k=>n.indexOf(k)!==-1)) return 'SaaS';
  if (['woocommerce','magento','prestashop','opencart','shopware','oscommerce','zencart','nopcommerce','bagisto','saleor','sylius','spree'].some(k=>n.indexOf(k)!==-1)) return 'Açık Kaynak';
  if (['ticimax','t-soft','ikas','ideasoft','platinmarket','projesoft','faprika','neticaret','eticaretsoft','smart e-ticaret','shopphp','softtr','demresa','bilgikurumsal','quka','imagaza','akinsoft','hipotenus','ticifly','alkissoft','kobimaster','vatansoft','inplato','eticaretim','jettycart','dogruajans'].some(k=>n.indexOf(k)!==-1)) return 'TR Hazır';
  return 'Custom';
}

function getCmsDefaults() {
  try {
    if (typeof CRM_CONFIG !== 'undefined' && CRM_CONFIG && CRM_CONFIG.CMS_DETECTOR) {
      return CRM_CONFIG.CMS_DETECTOR;
    }
  } catch(_) {}
  return {
    DEFAULT_CHUNK_SIZE: 100,
    MAX_CHUNK_SIZE: 200,
    DEFAULT_LIMIT_ROWS: 100,
    TARGET_SHEETS: ['Randevularım','Randevular'],
    WEBSITE_COLUMN: 'Website',
    CMS_NAME_COLUMN: 'CMS Adı',
    CMS_GROUP_COLUMN: 'CMS Grubu'
  };
}

/**
 * Aktif (temsilci) dosyada toplu CMS taraması
 * options: { chunkSize?: number, limitRows?: number, sheetNames?: string[] }
 */
function runCMSDetectionForCurrentAgent(options) {
  cmsDetectFunctionStarted({ scope: 'current-agent', options });
  const DEF = getCmsDefaults();
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const chunkSize = Math.max(10, Math.min(DEF.MAX_CHUNK_SIZE, (options && options.chunkSize) || DEF.DEFAULT_CHUNK_SIZE));
    const limitRows = options && options.limitRows ? Number(options.limitRows) : (options && options.limitRows === 0 ? 0 : DEF.DEFAULT_LIMIT_ROWS);
    const targetSheets = (options && options.sheetNames) || DEF.TARGET_SHEETS;

    let total = 0, updated = 0;
    for (const name of targetSheets) {
      const sh = ss.getSheetByName(name);
      if (!sh) continue;
      const lastRow = sh.getLastRow();
      if (lastRow <= 1) continue;
      const headers = sh.getRange(1,1,1,sh.getLastColumn()).getDisplayValues()[0];
      const iWebsite = headers.indexOf(DEF.WEBSITE_COLUMN);
      if (iWebsite === -1) continue;
      const iCms = headers.indexOf(DEF.CMS_NAME_COLUMN) !== -1 ? headers.indexOf(DEF.CMS_NAME_COLUMN) : -1;
      const iGroup = headers.indexOf(DEF.CMS_GROUP_COLUMN) !== -1 ? headers.indexOf(DEF.CMS_GROUP_COLUMN) : -1;

      const rowsCount = limitRows>0 ? Math.min(limitRows, lastRow-1) : (lastRow-1);
      const urls = sh.getRange(2, iWebsite+1, rowsCount, 1).getDisplayValues().map(r=>String(r[0]||''));
      total += urls.length;

      for (let start=0; start<urls.length; start+=chunkSize) {
        const part = urls.slice(start, start+chunkSize);
        const res = detectCMSBatchFast(part);
        for (let j=0; j<res.length; j++) {
          const rowIndex = 2 + start + j;
          const cmsName = res[j] || '';
          if (iCms !== -1) sh.getRange(rowIndex, iCms+1).setValue(cmsName);
          if (iGroup !== -1) sh.getRange(rowIndex, iGroup+1).setValue(mapCmsGroup(cmsName));
          updated++;
        }
      }
    }
    SpreadsheetApp.getUi().alert('CMS Analizi', `${ss.getName()} → ${updated}/${total} satır işlendi`, SpreadsheetApp.getUi().ButtonSet.OK);
    return { total, updated };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function openCMSDetectionCurrentAgentFast() {
  return runCMSDetectionForCurrentAgent({ chunkSize: getCmsDefaults().DEFAULT_CHUNK_SIZE, limitRows: getCmsDefaults().DEFAULT_LIMIT_ROWS, sheetNames: getCmsDefaults().TARGET_SHEETS });
}

function openCMSDetectionCurrentAgentAll() {
  return runCMSDetectionForCurrentAgent({ chunkSize: getCmsDefaults().DEFAULT_CHUNK_SIZE, sheetNames: getCmsDefaults().TARGET_SHEETS, limitRows: 0 });
}

/**
 * Seçili satırlar için (aktif sayfada) CMS taraması
 * options: { chunkSize?: number }
 */
function runCMSDetectionForSelection(options) {
  console.log('Function started:', options);
  try {
    if (!validateInput(options || {})) {
      throw new Error('Invalid input provided');
    }

    const DEF = getCmsDefaults();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const sheetName = sheet.getName();
    const ui = SpreadsheetApp.getUi();

    const isAllowed = (typeof isFormatTable === 'function' && isFormatTable(sheet)) || DEF.TARGET_SHEETS.some(n => n.toLowerCase() === sheetName.toLowerCase());
    if (!isAllowed) {
      ui.alert('Bilgi', `Bu işlem sadece Format Tablo veya ${DEF.TARGET_SHEETS.join(' / ')} sayfalarında yapılabilir.`, ui.ButtonSet.OK);
      return { total: 0, updated: 0 };
    }

    const lastCol = sheet.getLastColumn();
    if (lastCol < 1 || sheet.getLastRow() <= 1) {
      ui.alert('Bilgi', 'Veri bulunamadı.', ui.ButtonSet.OK);
      return { total: 0, updated: 0 };
    }

    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    const iWebsite = headers.indexOf(DEF.WEBSITE_COLUMN);
    const iCms = headers.indexOf(DEF.CMS_NAME_COLUMN);
    const iGroup = headers.indexOf(DEF.CMS_GROUP_COLUMN);

    if (iWebsite === -1) {
      ui.alert('Hata', `'${DEF.WEBSITE_COLUMN}' kolonu bulunamadı.`, ui.ButtonSet.OK);
      return { total: 0, updated: 0 };
    }

    // Seçili satırları topla
    const rangeList = sheet.getActiveRangeList();
    if (!rangeList) {
      ui.alert('Bilgi', 'Lütfen önce satır(lar) seçin.', ui.ButtonSet.OK);
      return { total: 0, updated: 0 };
    }
    const ranges = rangeList.getRanges();
    const selectedRowsSet = new Set();
    ranges.forEach(r => {
      const start = r.getRow();
      const numRows = r.getNumRows();
      for (let i = 0; i < numRows; i++) {
        const rowIndex = start + i;
        if (rowIndex >= 2) selectedRowsSet.add(rowIndex);
      }
    });

    const selectedRows = Array.from(selectedRowsSet).sort((a,b)=>a-b);
    if (selectedRows.length === 0) {
      ui.alert('Bilgi', 'Başlık satırı dışında seçim yapın (2. satırdan itibaren).', ui.ButtonSet.OK);
      return { total: 0, updated: 0 };
    }

    const chunkSize = Math.max(10, Math.min(DEF.MAX_CHUNK_SIZE, (options && options.chunkSize) || DEF.DEFAULT_CHUNK_SIZE));

    // URL'leri oku
    const urls = selectedRows.map(row => String(sheet.getRange(row, iWebsite + 1).getDisplayValue() || ''));

    // Boş URL'leri filtrele, ama satır indeks eşlemesini koru
    const workItems = [];
    for (let k = 0; k < selectedRows.length; k++) {
      const url = urls[k];
      if (url && url.trim()) {
        workItems.push({ row: selectedRows[k], url });
      }
    }

    if (workItems.length === 0) {
      ui.alert('Bilgi', 'Seçimde web sitesi bulunan satır yok.', ui.ButtonSet.OK);
      return { total: 0, updated: 0 };
    }

    let updated = 0;
    for (let s = 0; s < workItems.length; s += chunkSize) {
      const slice = workItems.slice(s, s + chunkSize);
      const res = detectCMSBatchFast(slice.map(x => x.url));
      for (let j = 0; j < res.length; j++) {
        const cmsName = res[j] || '';
        const rowIndex = slice[j].row;
        if (iCms !== -1) sheet.getRange(rowIndex, iCms + 1).setValue(cmsName);
        if (iGroup !== -1) sheet.getRange(rowIndex, iGroup + 1).setValue(mapCmsGroup(cmsName));
        updated++;
      }
    }

    ui.alert('CMS Analizi', `${sheetName} → ${updated}/${workItems.length} satır işlendi`, ui.ButtonSet.OK);
    console.log('Processing complete:', { updated, total: workItems.length });
    return { total: workItems.length, updated };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

function openCMSDetectionCurrentAgentSelection() {
  console.log('Function started:', { mode: 'selection' });
  try {
    return runCMSDetectionForSelection({ chunkSize: getCmsDefaults().DEFAULT_CHUNK_SIZE });
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * Seçili satırlar için doğruluk odaklı tarama (redirect + derin imza)
 */
function runCMSDetectionForSelectionAccurate() {
  console.log('Function started:', { mode: 'selection-accurate' });
  const DEF = getCmsDefaults();
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const sheetName = sheet.getName();
    const ui = SpreadsheetApp.getUi();

    const isAllowed = (typeof isFormatTable === 'function' && isFormatTable(sheet)) || DEF.TARGET_SHEETS.some(n => n.toLowerCase() === sheetName.toLowerCase());
    if (!isAllowed) {
      ui.alert('Bilgi', `Bu işlem sadece Format Tablo veya ${DEF.TARGET_SHEETS.join(' / ')} sayfalarında yapılabilir.`, ui.ButtonSet.OK);
      return { total: 0, updated: 0 };
    }

    const headersRow = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
    const iWebsite = headersRow.indexOf(DEF.WEBSITE_COLUMN);
    const iCms = headersRow.indexOf(DEF.CMS_NAME_COLUMN);
    const iGroup = headersRow.indexOf(DEF.CMS_GROUP_COLUMN);
    if (iWebsite === -1) {
      ui.alert('Hata', `'${DEF.WEBSITE_COLUMN}' kolonu bulunamadı.`, ui.ButtonSet.OK);
      return { total: 0, updated: 0 };
    }

    const rangeList = sheet.getActiveRangeList();
    if (!rangeList) { ui.alert('Bilgi', 'Lütfen satır(lar) seçin.', ui.ButtonSet.OK); return { total: 0, updated: 0 }; }
    const rows = Array.from(new Set(rangeList.getRanges().flatMap(r => Array.from({length:r.getNumRows()}, (_,i)=>r.getRow()+i)).filter(r=>r>=2))).sort((a,b)=>a-b);
    if (rows.length === 0) { ui.alert('Bilgi', 'Başlık satırı dışında seçim yapın (2+).', ui.ButtonSet.OK); return { total: 0, updated: 0 }; }

    let updated = 0;
    for (const row of rows) {
      const url = String(sheet.getRange(row, iWebsite+1).getDisplayValue() || '').trim();
      if (!url) continue;
      const cmsName = detectCMSForUrl(url) || '';
      if (iCms !== -1) sheet.getRange(row, iCms+1).setValue(cmsName);
      if (iGroup !== -1) sheet.getRange(row, iGroup+1).setValue(mapCmsGroup(cmsName));
      updated++;
    }

    ui.alert('CMS Analizi (Doğruluk)', `${sheetName} → ${updated}/${rows.length} satır işlendi`, ui.ButtonSet.OK);
    return { total: rows.length, updated };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

function openCMSDetectionCurrentAgentSelectionAccurate() {
  return runCMSDetectionForSelectionAccurate();
}

/**
 * Format Tablo: CMS Adı = IdeaSoft olanları Referans olarak işaretle, mavi boya ve üste taşı
 */
function markIdeaSoftReferencesOnActiveFormatTable() {
  console.log('Function started:', { action: 'mark-ideasof-references' });
  try {
    const ui = SpreadsheetApp.getUi();
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    const isAllowed = (typeof isFormatTable === 'function' && isFormatTable(sheet));
    if (!isAllowed) {
      ui.alert('Bilgi', 'Bu işlem sadece Format Tablo sayfalarında yapılabilir.', ui.ButtonSet.OK);
      return { updated: 0 };
    }

    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1) { ui.alert('Bilgi', 'Veri yok.', ui.ButtonSet.OK); return { updated: 0 }; }

    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    const iCmsName = headers.indexOf('CMS Adı');
    const iCmsGroup = headers.indexOf('CMS Grubu');
    if (iCmsName === -1) { ui.alert('Hata', "'CMS Adı' kolonu bulunamadı.", ui.ButtonSet.OK); return { updated: 0 }; }

    const dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
    const values = dataRange.getDisplayValues();

    // Geçici rank kolonu ekle
    const rankCol = lastCol + 1;
    sheet.getRange(1, rankCol).setValue('rank_tmp');
    const rankVals = [];
    const groupUpdates = (iCmsGroup !== -1) ? sheet.getRange(2, iCmsGroup + 1, lastRow - 1, 1).getValues() : null;

    let updated = 0;
    for (let r = 0; r < values.length; r++) {
      const cmsName = String(values[r][iCmsName] || '').toLowerCase();
      const isRef = cmsName === 'ideasoft';
      rankVals.push([isRef ? 0 : 1]);
      if (isRef) {
        // Grup güncelle
        if (groupUpdates) { groupUpdates[r][0] = 'Referans'; }
        // Satırı mavi boya
        sheet.getRange(2 + r, 1, 1, sheet.getMaxColumns()).setBackground('#E3F2FD');
        updated++;
      }
    }

    // Grupları yaz
    if (groupUpdates) {
      sheet.getRange(2, iCmsGroup + 1, lastRow - 1, 1).setValues(groupUpdates);
    }

    // Rank yaz ve sırala
    sheet.getRange(2, rankCol, lastRow - 1, 1).setValues(rankVals);
    SpreadsheetApp.flush();
    sheet.getRange(2, 1, lastRow - 1, rankCol).sort([{ column: rankCol, ascending: true }]);
    // Geçici kolonu kaldır
    sheet.deleteColumn(rankCol);

    ui.alert('Tamam', `${updated} satır Referans olarak işaretlendi ve üste taşındı.`, ui.ButtonSet.OK);
    console.log('Processing complete:', { updated });
    return { updated };
  } catch (error) {
    console.error('Function failed:', error);
    try { SpreadsheetApp.getUi().alert('Hata: ' + error.message); } catch (_) {}
    throw error;
  }
}

/**
 * Temsilci dosyasında Website -> CMS Adı / CMS Grubu yaz
 * options: { chunkSize: number, limitRows?: number, sheetNames?: string[] }
 */
function runAgentCMSDetection(employeeCode, options) {
  cmsDetectFunctionStarted({ employeeCode, options });
  try {
    const chunkSize = Math.max(10, Math.min(200, (options && options.chunkSize) || 100));
    const limitRows = options && options.limitRows ? Number(options.limitRows) : 0;
    const targetSheets = (options && options.sheetNames) || ['Randevular'];

    const file = findEmployeeFile(employeeCode);
    if (!file) throw new Error('Temsilci dosyası bulunamadı');

    let total = 0, updated = 0;
    for (const sheetName of targetSheets) {
      const sh = file.getSheetByName(sheetName);
      if (!sh) continue;
      const lastRow = sh.getLastRow();
      if (lastRow <= 1) continue;
      const lastCol = sh.getLastColumn();
      const headers = sh.getRange(1,1,1,lastCol).getDisplayValues()[0];
      const iWebsite = headers.indexOf('Website');
      const iCms = headers.indexOf('CMS Adı');
      const iGroup = headers.indexOf('CMS Grubu');
      if (iWebsite === -1) continue;

      const rowsCount = limitRows>0 ? Math.min(limitRows, lastRow-1) : (lastRow-1);
      const urls = sh.getRange(2, iWebsite+1, rowsCount, 1).getDisplayValues().map(r=>String(r[0]||''));
      total += urls.length;

      // parça parça fetchAll
      for (let start=0; start<urls.length; start+=chunkSize){
        const part = urls.slice(start, start+chunkSize);
        const res = detectCMSBatchFast(part);
        // yaz
        for (let j=0;j<res.length;j++){
          const rowIndex = 2 + start + j;
          const cmsName = res[j] || '';
          if (iCms !== -1) sh.getRange(rowIndex, iCms+1).setValue(cmsName);
          if (iGroup !== -1) sh.getRange(rowIndex, iGroup+1).setValue(mapCmsGroup(cmsName));
          updated++;
        }
      }
    }

    SpreadsheetApp.getUi().alert('CMS Analizi', `${employeeCode} → ${updated}/${total} satır işlendi`, SpreadsheetApp.getUi().ButtonSet.OK);
    return { total, updated };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata', String(error && error.message || error), SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

function openAgentCMSDetectionPromptFast() {
  try {
    const ui = SpreadsheetApp.getUi();
    const res = ui.prompt('CMS Analizi – Temsilci Kodu', 'Örn: SB 004 (ilk 100 satır, hızlı)', ui.ButtonSet.OK_CANCEL);
    if (res.getSelectedButton() !== ui.Button.OK) return;
    const code = (res.getResponseText()||'').trim();
    if (!code) return;
    return runAgentCMSDetection(code, { chunkSize: 100, limitRows: 100, sheetNames: ['Randevular'] });
  } catch (e) { console.error(e); }
}

function openAgentCMSDetectionPromptAll() {
  try {
    const ui = SpreadsheetApp.getUi();
    const res = ui.prompt('CMS Analizi – Temsilci Kodu (Tümü)', 'Örn: SB 004 (tüm satırlar – 6 dakikaya kadar sürebilir)', ui.ButtonSet.OK_CANCEL);
    if (res.getSelectedButton() !== ui.Button.OK) return;
    const code = (res.getResponseText()||'').trim();
    if (!code) return;
    return runAgentCMSDetection(code, { chunkSize: 100, sheetNames: ['Randevular'] });
  } catch (e) { console.error(e); }
}

// ----------------- Yardımcılar -----------------

function normalizeUrl(raw) {
  try {
    if (!raw) return '';
    let s = String(raw).trim();
    if (!/^https?:\/\//i.test(s)) s = 'http://' + s; // http ile dene, sonra https fallback
    return s;
  } catch (_) { return ''; }
}

function extractDomain(url) {
  try {
    const u = new URL(url);
    return u.hostname.toLowerCase();
  } catch (_) { return ''; }
}

function isMarketplaceOrSocial(domain) {
  const LIST = REF_LIST.pazar_yerleri_sosyal_magazalar;
  return LIST.some(host => domain === host || domain.endsWith('.' + host));
}

function fetchSiteWithRedirects(url) {
  const seen = new Set();
  const initial = normalizeUrl(url);
  const variations = (function(){
    try {
      const U = (this.URL || Url);
      const u = new U(initial);
      const host = u.hostname;
      const path = u.pathname || '/';
      const scheme = (u.protocol || 'http:').replace(':','');
      const toggled = scheme === 'https' ? 'http' : 'https';
      const hasWww = /^www\./i.test(host);
      const withWww = hasWww ? host : 'www.' + host;
      const noWww = host.replace(/^www\./i, '');
      return [
        `${scheme}://${host}${path}`,
        `${toggled}://${host}${path}`,
        `${scheme}://${withWww}${path}`,
        `${toggled}://${withWww}${path}`,
        `${scheme}://${noWww}${path}`,
        `${toggled}://${noWww}${path}`
      ];
    } catch(_) { return [initial]; }
  })();

  let current = variations[0];
  let lastResp = null;
  for (let v = 0; v < variations.length; v++) {
    current = variations[v];
    for (let i = 0; i < 3; i++) {
      if (seen.has(current)) break;
      seen.add(current);
      let resp = null;
      try {
        resp = UrlFetchApp.fetch(current, {
          muteHttpExceptions: true,
          followRedirects: false,
          validateHttpsCertificates: true,
          headers: { 'User-Agent': 'Mozilla/5.0 (LeadBot; CRM-Detector)' }
        });
      } catch (e) {
        resp = null; // DNS/SSL/timeout -> sonraki varyasyon
        break;
      }
      lastResp = resp;
      const code = resp.getResponseCode();
      if (code >= 300 && code < 400) {
        const location = (resp.getAllHeaders()['Location'] || resp.getAllHeaders()['location'] || '').toString();
        if (location) {
          current = normalizeUrl(resolveUrl(current, location));
          continue;
        }
      }
      // redirect değil -> tamam
      break;
    }
    if (lastResp) break;
  }

  if (!lastResp) {
    return { finalUrl: current, html: '', headers: {}, unreachable: true };
  }
  const finalUrl = current;
  const text = (lastResp && lastResp.getContentText()) || '';
  const headers = (lastResp && lastResp.getAllHeaders()) || {};
  const statusCode = (lastResp && lastResp.getResponseCode && lastResp.getResponseCode()) || 0;
  return { finalUrl, html: text, headers, statusCode, unreachable: false };
}

function resolveUrl(base, relative) {
  try {
    return new URL(relative, base).toString();
  } catch (_) {
    try {
      const b = new URL(base);
      const origin = b.origin;
      if (/^\//.test(relative)) return origin + relative;
      const baseDir = b.pathname.replace(/[^\/]*$/, '');
      return origin + baseDir + relative;
    } catch (e) {
      return base;
    }
  }
}

function buildSignals(fetched) {
  const html = (fetched.html || '');
  const headers = normalizeHeaders(fetched.headers || {});
  const finalUrl = fetched.finalUrl || '';
  const domain = extractDomain(finalUrl);
  const statusCode = fetched.statusCode || 0;
  return { html, headers, finalUrl, domain, statusCode };
}

function normalizeHeaders(h) {
  const out = {};
  Object.keys(h || {}).forEach(k => { out[String(k).toLowerCase()] = String(h[k]); });
  return out;
}

// ----------------- Bilinen CMS Tespiti -----------------

function escapeRegExp(s) {
  try { return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); } catch (_) { return String(s || ''); }
}

const CMS_SIGNATURES = (function buildCMS() {
  const sig = [];
  // Türkiye hazır e-ticaret
  addDomainSig(sig, 'Ticimax', ['ticimax.com']);
  addDomainSig(sig, 'IdeaSoft', ['ideasoft.com.tr']);
  addDomainSig(sig, 'T-Soft', ['tsoft.com.tr','tsoftcdn.com','tsoftcdn2.com','tsoftstatic.com']);
  addDomainSig(sig, 'İkas', ['ikas.com']);
  addDomainSig(sig, 'PlatinMarket', ['platinmarket.com']);
  addDomainSig(sig, 'Projesoft', ['projesoft.com.tr']);
  addDomainSig(sig, 'Faprika', ['faprika.com']);
  addDomainSig(sig, 'Neticaret', ['neticaret.com']);
  addDomainSig(sig, 'E-Ticaret Soft', ['eticaretsoft.com']);
  addDomainSig(sig, 'Smart E-Ticaret', ['smarteticaret.com']);
  addDomainSig(sig, 'ShopPHP', ['shopphp.net']);
  addDomainSig(sig, 'JettyCart', ['jettycart.com']);
  addDomainSig(sig, 'Doğru Ajans', ['dogruajans.com']);
  addDomainSig(sig, 'Softtr', ['softtr.com']);
  addDomainSig(sig, 'Demresa', ['demresa.com']);
  addDomainSig(sig, 'BilgiKurumsal', ['bilgikurumsal.com']);
  addDomainSig(sig, 'Quka Soft', ['qukasoft.com']);
  addDomainSig(sig, 'iMağaza', ['imagaza.net']);
  addDomainSig(sig, 'Akınsoft', ['akinsoft.com.tr']);
  addDomainSig(sig, 'Hipotenüs', ['hipotenus.com.tr']);
  addDomainSig(sig, 'Ticifly', ['ticifly.com']);
  addDomainSig(sig, 'Alkissoft', ['alkissoft.com']);
  addDomainSig(sig, 'Kobimaster', ['kobimaster.com']);
  addDomainSig(sig, 'Vatansoft', ['vatansoft.com']);
  addDomainSig(sig, 'Inplato', ['inplato.com']);
  addDomainSig(sig, 'eticaretim', ['eticaretim.com']);
  // Dünya SaaS
  addDomainSig(sig, 'Shopify', ['cdn.shopify.com', 'myshopify.com']);
  addDomainSig(sig, 'Wix', ['wixstatic.com', 'wix.com', 'wixsite.com']);
  addDomainSig(sig, 'BigCommerce', ['bigcommerce.com']);
  addDomainSig(sig, 'Squarespace', ['squarespace-cdn.com', 'squarespace.com']);
  addDomainSig(sig, 'Ecwid', ['ecwid.com']);
  addDomainSig(sig, 'Webflow', ['webflow.com', 'webflow.io']);
  // Açık kaynak / self-hosted işaretler (WooCommerce > WordPress önceliği)
  sig.push({ name: 'WooCommerce', html: [/woocommerce(?!\s*\.com)/i, /wc-ajax/i, /woocommerce_params/i, /wc_cart_fragments/i], headers: [/woocommerce_session/i] });
  sig.push({ name: 'WordPress', html: [/wp-content\//i, /wp-include/i], headers: [/x-powered-by.*wordpress/i] });
  sig.push({ name: 'Magento', html: [/Magento/i, /mage\.(init|require)/i] });
  sig.push({ name: 'PrestaShop', html: [/PrestaShop/i, /prestashop/i] });
  sig.push({ name: 'OpenCart', html: [/index\.php\?route=/i, /opencart/i] });
  sig.push({ name: 'Shopware', html: [/shopware/i] });
  sig.push({ name: 'OsCommerce', html: [/oscommerce/i] });
  sig.push({ name: 'Zen Cart', html: [/zencart/i] });
  sig.push({ name: 'NopCommerce', html: [/nopcommerce/i] });
  // Footer attribution / metin tabanlı imzalar (TR sağlayıcılar)
  sig.push({ name: 'IdeaSoft', html: [/ideasoft/i] });
  sig.push({ name: 'T-Soft', html: [/T-Soft\s+E-?Ticaret\s+Sistemleri/i, /TEKROM\s+Teknoloji/i] });
  sig.push({ name: 'Ticimax', html: [/ticimax/i] });
  sig.push({ name: 'İkas', html: [/\bikas\b/i] });
  sig.push({ name: 'PlatinMarket', html: [/platinmarket/i] });
  sig.push({ name: 'Projesoft', html: [/projesoft/i] });
  sig.push({ name: 'Faprika', html: [/faprika/i] });
  sig.push({ name: 'Neticaret', html: [/neticaret/i] });
  sig.push({ name: 'E-Ticaret Soft', html: [/eticaretsoft|e[- ]ticaret soft/i] });
  sig.push({ name: 'Smart E-Ticaret', html: [/smarteticaret|smart e[- ]ticaret/i] });
  sig.push({ name: 'ShopPHP', html: [/shopphp/i] });
  sig.push({ name: 'JettyCart', html: [/jettycart/i] });
  return sig;
  
  function addDomainSig(arr, name, domains){
    arr.push({ name, assets: domains.map(d=>new RegExp(escapeRegExp(d), 'i')) });
  }
})();

function detectKnownCMS(signals) {
  const { html, headers, finalUrl } = signals;
  const lowHtml = String(html || '').toLowerCase();
  const headerPairs = Object.entries(headers || {});

  // 0) Meta generator
  const genMatch = /<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)["']/i.exec(html || '');
  if (genMatch && genMatch[1]) {
    const g = genMatch[1].toLowerCase();
    if (/wordpress|woocommerce/.test(g)) return /woocommerce/.test(g) ? 'WooCommerce' : 'WordPress';
    if (/shopify/.test(g)) return 'Shopify';
    if (/squarespace/.test(g)) return 'Squarespace';
    if (/prestashop/.test(g)) return 'PrestaShop';
    if (/opencart/.test(g)) return 'OpenCart';
    if (/magento/.test(g)) return 'Magento';
    if (/shopware/.test(g)) return 'Shopware';
    if (/t-?soft/.test(g)) return 'T-Soft';
    if (/ideasoft/.test(g)) return 'IdeaSoft';
  }

  // 1) Varlık URL parmak izleri (cdn, asset ve final domain)
  for (const s of CMS_SIGNATURES) {
    if (s.assets) {
      for (const re of s.assets) {
        if (re.test(finalUrl) || re.test(lowHtml)) return s.name;
      }
    }
    // domain eşleşmesi (ör: ikas.com, tsoft.com.tr vs.)
    try {
      const u = new URL(finalUrl);
      const host = u.hostname.toLowerCase();
      if (s.assets && s.assets.some(re => re.test(host))) return s.name;
    } catch(_) {}
  }
  // 2) HTML gövde parmak izleri
  for (const s of CMS_SIGNATURES) {
    if (s.html) {
      for (const re of s.html) { if (re.test(html)) return s.name; }
    }
  }
  // 3) Header parmak izleri ve cookie adları
  const headersJoined = Object.entries(headers||{}).map(([k,v]) => `${k}: ${v}`).join('\n');
  for (const s of CMS_SIGNATURES) {
    if (s.headers) {
      for (const re of s.headers) {
        if (re.test(headersJoined)) return s.name;
      }
    }
  }
  return '';
}

// ----------------- Kalite Analizi (Custom) -----------------

function classifyCustomQuality(signals) {
  const { html, headers, finalUrl } = signals;
  let score = 0;

  // Güvenlik & temel hijyen
  if (/^https:/i.test(finalUrl)) score += 2; else score -= 2;
  if (/content-security-policy/i.test(headers['content-security-policy'] || '')) score += 1;
  if (/strict-transport-security/i.test(headers['strict-transport-security'] || '')) score += 1;

  // SEO / semantik
  if (/<title>[^<]{3,}\/?.<\/title>/i.test(html)) score += 1;
  if (/<meta[^>]+name=["']description["'][^>]+content=/i.test(html)) score += 1;
  if (/<link[^>]+rel=["']canonical["']/i.test(html)) score += 1;
  if (/<meta[^>]+property=["']og:/i.test(html)) score += 1; // OpenGraph

  // Mobil uyum
  if (/<meta[^>]+name=["']viewport["'][^>]+/i.test(html)) score += 1;

  // Yapılandırılmış veri / modern JS
  if (/<script[^>]+type=["']application\/ld\+json["']/i.test(html)) score += 1;
  if (/\bwebpackJsonp\b|\b__NEXT_DATA__\b|data-reactroot|ng-version|vue/i.test(html)) score += 1;

  // Kod kokuları – negatifler
  if (/<font\b|<marquee\b/i.test(html)) score -= 2;
  if (/<table[^>]*>[^]*<\/table>/i.test(html) && !/role="table"|aria/i.test(html)) score -= 1; // layout amaçlı tablo
  if (!/<img[^>]+alt=/i.test(html) && /<img/i.test(html)) score -= 1;
  if (html.length < 1000) score -= 1; // çok zayıf içerik

  // Basit eşik
  return (score >= 2) ? 'Yüksek Kalite' : 'Düşük Kalite';
}

// ----------------- Referans Listeleri -----------------

const REF_LIST = {
  turkiye_hazir_eticaret: [
    'ideasoft.com.tr','ikas.com','ticimax.com','tsoft.com.tr','softtr.com','platinmarket.com','projesoft.com.tr','faprika.com','demresa.com','bilgikurumsal.com','shopphp.net','qukasoft.com','imagaza.net','akinsoft.com.tr','hipotenus.com.tr','ticifly.com','alkissoft.com','kobimaster.com','vatansoft.com','inplato.com','neticaret.com','eticaretsoft.com','smarteticaret.com','eticaretim.com','paratika.com','berqnet.com'
  ],
  dunya_acik_kaynak: [
    'woocommerce.com','magento.com','prestashop.com','opencart.com','bagisto.com','saleor.io','sylius.com','shopware.com','spreecommerce.org','nopcommerce.com','virtuemart.net','oscommerce.com','zencart.com'
  ],
  dunya_saas_kapali: [
    'shopify.com','wix.com','bigcommerce.com','squarespace.com','ecwid.com','weebly.com','volusion.com','shift4shop.com','bigcartel.com','selz.com','godaddy.com','webflow.com'
  ],
  pazar_yerleri_sosyal_magazalar: [
    'trendyol.com','hepsiburada.com','n11.com','ciceksepeti.com','pttavm.com','gittigidiyor.com','amazon.com.tr','morhipo.com','instagram.com','facebook.com','tiktokglobalshop.com','shopier.com'
  ]
};

// ----------------- Basit testler -----------------

function runCmsDetectorTests() {
  console.log('🧪 CMS Detector tests');
  const samples = [
    'https://www.shopify.com',
    'https://woocommerce.com',
    'https://www.wix.com',
    'https://www.trendyol.com',
    'https://opencart.com',
    'https://magento.com',
    'https://www.google.com'
  ];
  const results = detectCMSBatch(samples);
  console.log('Test results:', results);
  SpreadsheetApp.getUi().alert('CMS Detector', results.map((r,i)=>samples[i]+ ' -> ' + r).join('\n'), SpreadsheetApp.getUi().ButtonSet.OK);
}

// === UI helpers for standalone usage ===
function addCmsMenuToUi() {
  console.log('Adding CMS menu to UI');
  try {
    const ui = SpreadsheetApp.getUi();
    // Top-level CMS Analizi menüsü (çakışmaları önlemek için tek başına)
    ui.createMenu('CMS Analizi')
      .addItem('⚡ Seçili Satırlar', 'openCMSDetectionCurrentAgentSelection')
      .addItem('🛡️ Seçili Satırlar (Doğruluk)', 'openCMSDetectionCurrentAgentSelectionAccurate')
      .addItem('⭐ Referansları Üste Taşı (Format Tablo)', 'markIdeaSoftReferencesOnActiveFormatTable')
      .addItem('∞ Tümü (chunk=100)', 'openCMSDetectionCurrentAgentAll')
      .addToUi();
    console.log('CMS menu added');
  } catch (error) {
    console.error('Failed to add CMS menu:', error);
    try { SpreadsheetApp.getUi().alert('Hata: CMS menüsü eklenemedi — ' + error.message); } catch(_) {}
  }
}

function installCmsMenuOnOpenTrigger() {
  console.log('Installing onOpen trigger for CMS menu');
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const triggers = ScriptApp.getProjectTriggers();
    const exists = triggers.some(t => t.getHandlerFunction && t.getHandlerFunction() === 'addCmsMenuToUi');
    if (!exists) {
      ScriptApp.newTrigger('addCmsMenuToUi')
        .forSpreadsheet(ss)
        .onOpen()
        .create();
      console.log('onOpen trigger created');
    } else {
      console.log('onOpen trigger already exists');
    }
    // Menü anında yüklensin
    addCmsMenuToUi();
  } catch (error) {
    console.error('Failed to install trigger:', error);
    try { SpreadsheetApp.getUi().alert('Hata: Trigger kurulamadı — ' + error.message); } catch(_) {}
    throw error;
  }
}
