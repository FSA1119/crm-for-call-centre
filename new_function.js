function sortMeetingsSalesTop(sheet) {
  console.log('🔄 sortMeetingsSalesTop başlatıldı - Toplantılar sıralama');
  try { sheet.getRange(1,1,1,1).getValues(); } catch(e) { SpreadsheetApp.flush(); }
  try {
    if (!sheet) {
      console.log('❌ Sheet objesi bulunamadı');
      return;
    }
    const lastRow = sheet.getLastRow();
    if (lastRow <= 2) {
      console.log('⚠️ Sıralanacak satır yok (lastRow <= 2)');
      return;
    }
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    console.log('📋 Başlıklar:', headers);
    
    function findIdx(cands){
      const lowered = headers.map(h => String(h||'').trim().toLowerCase());
      for (const c of cands){ const i = lowered.indexOf(String(c).toLowerCase()); if (i!==-1) return i; }
      return -1;
    }
    
    const idxResult = findIdx(['Toplantı Sonucu','Toplantı sonucu']);
    const idxDate = findIdx(['Toplantı Tarihi','Toplantı tarihi']);
    const idxPotential = findIdx(['Satış Potansiyeli']);
    
    console.log('🔍 Bulunan sütun indeksleri:', {
      'Toplantı Sonucu': idxResult,
      'Toplantı Tarihi': idxDate,
      'Satış Potansiyeli': idxPotential
    });
    
    if (idxResult === -1 || idxDate === -1) {
      console.log('❌ Gerekli sütunlar bulunamadı');
      return;
    }

    // Tüm verileri oku
    const allData = sheet.getRange(1, 1, lastRow, lastCol).getValues();
    const headerRow = allData[0];
    const dataRows = allData.slice(1);
    
    console.log('📊 ' + dataRows.length + ' satır veri okundu');
    
    // Sıralama için yeni bir veri dizisi oluştur
    const sortableData = dataRows.map((row, index) => {
      const resultText = idxResult !== -1 ? String(row[idxResult] || '').toLowerCase().trim() : '';
      const potentialText = idxPotential !== -1 ? String(row[idxPotential] || '').toLowerCase().trim() : '';
      
      // Debug için satır içeriğini logla
      if (index < 5) {
        console.log('📝 Satır ' + (index+2) + ' - Sonuç: "' + resultText + '", Potansiyel: "' + potentialText + '"');
      }
      
      return {
        originalRow: row,
        originalIndex: index,
        resultText: resultText,
        potentialText: potentialText,
        date: row[idxDate]
      };
    });
    
    // Önce sıralama değerlerini hesapla
    sortableData.forEach(item => {
      // Varsayılan sıralama değeri (en düşük öncelik)
      let rank = 9;
      
      // Satış Yapıldı en yüksek önceliğe sahip
      if (item.resultText === 'satış yapıldı' || item.resultText === 'satis yapildi') {
        rank = 0;
      } else if (item.potentialText) {
        // Potansiyel değerine göre sırala
        if (item.potentialText === 'yerinde satış' || item.potentialText === 'yerinde satis') {
          rank = 1;
        } else if (item.potentialText === 'sıcak' || item.potentialText === 'sicak') {
          rank = 2;
        } else if (item.potentialText === 'orta') {
          rank = 3;
        } else if (item.potentialText === 'soğuk' || item.potentialText === 'soguk') {
          rank = 4;
        }
      }
      
      item.rank = rank;
      
      // Debug için ilk 5 satırın rank değerlerini logla
      if (item.originalIndex < 5) {
        console.log('🏆 Satır ' + (item.originalIndex+2) + ' - Rank: ' + rank);
      }
    });
    
    // Sıralama kriterleri:
    // 1. Rank (düşük değer önce)
    // 2. Tarih (eski tarih önce)
    sortableData.sort((a, b) => {
      // Önce rank'e göre sırala
      if (a.rank !== b.rank) {
        return a.rank - b.rank;
      }
      
      // Rank aynıysa tarihe göre sırala
      const dateA = a.date instanceof Date ? a.date : new Date(a.date);
      const dateB = b.date instanceof Date ? b.date : new Date(b.date);
      
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return dateA - dateB;
      }
      
      // Tarihler geçersizse orijinal sırayı koru
      return a.originalIndex - b.originalIndex;
    });
    
    // Sıralanmış verileri yeniden düzenle
    const sortedRows = sortableData.map(item => item.originalRow);
    
    // Sıralanmış verileri sayfaya yaz
    sheet.getRange(2, 1, sortedRows.length, lastCol).setValues(sortedRows);
    
    console.log('✅ Sıralama tamamlandı');
    
    // Sıralama sonuçlarını logla
    console.log('📋 İlk 5 satır sıralama sonrası:');
    for (let i = 0; i < Math.min(5, sortedRows.length); i++) {
      const resultText = idxResult !== -1 ? sortedRows[i][idxResult] : 'N/A';
      const potentialText = idxPotential !== -1 ? sortedRows[i][idxPotential] : 'N/A';
      console.log('📌 Satır ' + (i+2) + ': Sonuç="' + resultText + '", Potansiyel="' + potentialText + '"');
    }
  } catch (err) {
    console.error('❌ sortMeetingsSalesTop hatası:', err);
    console.error('❌ Hata detayı:', err.stack);
  }
}
