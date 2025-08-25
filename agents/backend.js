
// ========================================
// 🔍 URL TEKRAR BULMA VE SİLME
// ========================================

/**
 * 🔧 URL'yi normalize eder (http://, https://, www. kısımlarını ve path'leri kaldırır)
 */
function normalizeUrl(url) {
  console.log(`🔧 normalizeUrl çağrıldı: "${url}"`);
  if (!url) {
    console.log(`🔧 URL boş, null döndürülüyor`);
    return null;
  }
  
  let normalized = url.toLowerCase().trim();
  console.log(`🔧 Küçük harf ve trim: "${normalized}"`);
  
  // http/https kaldır
  normalized = normalized.replace(/^https?:\/\//, '');
  console.log(`🔧 http/https kaldırıldı: "${normalized}"`);
  
  // www kaldır
  normalized = normalized.replace(/^www\./, '');
  console.log(`🔧 www kaldırıldı: "${normalized}"`);
  
  // Sondaki / kaldır
  normalized = normalized.replace(/\/$/, '');
  console.log(`🔧 Sondaki / kaldırıldı: "${normalized}"`);
  
  // Sondaki .com, .com.tr, .net gibi uzantıları koru
  // Ama path'leri kaldır (örn: /urunler, /hakkimizda)
  if (normalized.includes('/')) {
    normalized = normalized.split('/')[0];
    console.log(`🔧 Path kaldırıldı, sadece domain: "${normalized}"`);
  }
  
  console.log(`🔧 Final sonuç: "${normalized}"`);
  return normalized;
}

/**
 * 🗑️ URL Tekrarları Sil - Aynı URL'ye sahip tekrarlanan satırları siler
 * @returns {Object} - İşlem sonucu
 */
function urlTekrarlariniSil() {
  console.log('Function started: urlTekrarlariniSil');
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const ui = SpreadsheetApp.getUi();
    const response = ui.alert(
      '🗑️ URL Tekrarları Silme',
      'Aynı URL\'ye sahip tekrarlanan satırları sileceğim. Her URL\'den sadece bir tane (orijinal) kalacak.\n\nDevam etmek istiyor musunuz?',
      ui.ButtonSet.YES_NO
    );
    if (response !== ui.Button.YES) {
      console.log('Kullanıcı iptal etti');
      return { success: false, message: 'İşlem iptal edildi' };
    }
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const urlColumnIndex = findColumnIndex(headers, ['Website', 'URL', 'Site', 'Web']); // Gelişmiş sütun bulma
    if (urlColumnIndex === -1) {
      throw new Error('URL sütunu bulunamadı. Lütfen "Website", "URL", "Site" veya "Web" başlıklı bir sütun ekleyin.');
    }
    console.log(`🔍 URL sütunu bulundu: ${headers[urlColumnIndex]} (Sütun ${urlColumnIndex + 1})`);
    console.log(`🔍 Kullanılan URL sütunu: ${headers[urlColumnIndex]} (Sütun ${urlColumnIndex + 1})`);
    const urlGroups = new Map();
    console.log(`🔍 Toplam satır sayısı: ${data.length}`);
    console.log(`🔍 URL sütun indeksi: ${urlColumnIndex}`);
    console.log(`🔍 URL sütun başlığı: "${data[0][urlColumnIndex]}"`);
    for (let i = 1; i < data.length; i++) {
      let url = data[i][urlColumnIndex];
      console.log(`🔍 Satır ${i + 1}: Ham veri: "${url}" (tip: ${typeof url})`);
      if (url && typeof url === 'string') {
        console.log(`🔍 Satır ${i + 1}: Orijinal URL: "${url}"`);
        const normalizedUrl = normalizeUrl(url);
        console.log(`🔍 Satır ${i + 1}: Normalize edilmiş: "${normalizedUrl}"`);
        if (normalizedUrl) {
          if (!urlGroups.has(normalizedUrl)) {
            urlGroups.set(normalizedUrl, []);
            console.log(`🔍 Yeni URL grubu oluşturuldu: "${normalizedUrl}"`);
          }
          urlGroups.get(normalizedUrl).push(i + 1);
          console.log(`🔍 Satır ${i + 1}: URL grubuna eklendi`);
        } else {
          console.log(`🔍 Satır ${i + 1}: URL normalize edilemedi`);
        }
      } else {
        console.log(`🔍 Satır ${i + 1}: URL bulunamadı veya string değil`);
      }
    }
    console.log(`🔍 Toplam URL grubu sayısı: ${urlGroups.size}`);
    for (const [url, rows] of urlGroups) {
      console.log(`🔍 URL: "${url}" - ${rows.length} satır`);
    }
    let deletedCount = 0;
    let processedUrls = 0;
    const rowsToDelete = [];
    for (const [url, rowNumbers] of urlGroups) {
      if (rowNumbers.length > 1) {
        console.log(`🔍 URL: ${url} - ${rowNumbers.length} kez tekrarlanıyor (Satırlar: ${rowNumbers.join(', ')})`);
        const originalRow = rowNumbers[0];
        const duplicateRows = rowNumbers.slice(1);
        console.log(`   Orijinal: Satır ${originalRow}`);
        console.log(`   Silinecek: Satırlar ${duplicateRows.join(', ')}`);
        duplicateRows.reverse().forEach(rowNum => {
          rowsToDelete.push(rowNum);
        });
        deletedCount += duplicateRows.length;
        processedUrls++;
      }
    }
    if (rowsToDelete.length > 0) {
      rowsToDelete.sort((a, b) => b - a);
      for (const rowNum of rowsToDelete) {
        sheet.deleteRow(rowNum);
        console.log(`🗑️ Satır ${rowNum} silindi`);
      }
    }
    const resultMessage = `🗑️ URL Tekrar Temizleme Tamamlandı!\n\n` +
      `🔍 İşlenen URL: ${processedUrls}\n` +
      `🗑️ Silinen tekrarlanan satır: ${deletedCount}\n` +
      `✅ Her URL'den sadece bir tane (orijinal) kaldı\n\n` +
      `📊 Detaylar console'da görüntüleniyor`;
    ui.alert('🗑️ URL Tekrar Temizleme', resultMessage, ui.ButtonSet.OK);
    console.log(`🗑️ ${processedUrls} farklı URL için toplam ${deletedCount} tekrarlanan satır silindi`);
    return { success: true, processedUrls, deletedCount };
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('Hata: ' + error.message);
    throw error;
  }
}

/**
 * 🔍 Sütun indeksini bulur (gelişmiş sütun bulma)
 */
function findColumnIndex(headers, possibleNames) {
  for (const name of possibleNames) {
    const index = headers.findIndex(header => 
      header && header.toString().toLowerCase().includes(name.toLowerCase())
    );
    if (index !== -1) {
      return index;
    }
  }
  return -1;
}

