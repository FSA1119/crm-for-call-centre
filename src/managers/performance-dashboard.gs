// ========================================
// 📊 PERFORMANS DASHBOARD SİSTEMİ
// Version: 1.0
// ========================================

/**
 * 🎯 Günlük Performans Dashboard - Tüm temsilcilerin günlük aktivite özeti
 */
function generateDailyPerformanceDashboard() {
  console.log('Function started: generateDailyPerformanceDashboard');
  
  try {
    if (!validateInput({})) {
      throw new Error('Invalid input provided');
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const todayKey = Utilities.formatDate(today, 'Europe/Istanbul', 'dd.MM.yyyy');
    
    console.log('Günlük performans dashboard başlatılıyor:', todayKey);
    
    // Tüm temsilci verilerini topla
    const employeeStats = {};
    
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      employeeStats[employeeCode] = {
        name: employeeName,
        code: employeeCode,
        activities: [],
        firstActivity: null,
        lastActivity: null,
        totalCalls: 0,
        positiveActivities: 0,
        negativeActivities: 0,
        appointments: 0,
        opportunities: 0
      };
    }
    
    // Format Tablo sayfalarından veri topla
    const sheets = ss.getSheets();
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      if (sheetName.includes('Format Tablo') && sheet.getLastRow() > 1) {
        console.log('Format Tablo işleniyor:', sheetName);
        
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
        const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
        
        const kodIdx = headers.indexOf('Kod');
        const aktiviteIdx = headers.indexOf('Aktivite');
        const aktiviteTarihiIdx = headers.indexOf('Aktivite Tarihi');
        const logIdx = headers.indexOf('Log');
        
        if (kodIdx !== -1 && aktiviteIdx !== -1) {
          for (const row of data) {
            const kod = String(row[kodIdx] || '').trim();
            const aktivite = String(row[aktiviteIdx] || '').trim();
            const tarih = aktiviteTarihiIdx !== -1 ? row[aktiviteTarihiIdx] : null;
            const log = logIdx !== -1 ? row[logIdx] : null;
            
            if (kod && aktivite && employeeStats[kod]) {
              // Tarih kontrolü - bugün mü?
              let isToday = false;
              if (tarih === todayKey) {
                isToday = true;
              } else if (log && log.includes(todayKey)) {
                isToday = true;
              }
              
              if (isToday) {
                const activityTime = extractTimeFromLog(log);
                const activityData = {
                  activity: aktivite,
                  time: activityTime,
                  timestamp: new Date()
                };
                
                employeeStats[kod].activities.push(activityData);
                employeeStats[kod].totalCalls++;
                
                // İlk ve son aktivite zamanı
                if (!employeeStats[kod].firstActivity || activityTime < employeeStats[kod].firstActivity) {
                  employeeStats[kod].firstActivity = activityTime;
                }
                if (!employeeStats[kod].lastActivity || activityTime > employeeStats[kod].lastActivity) {
                  employeeStats[kod].lastActivity = activityTime;
                }
                
                // Aktivite kategorileri
                if (['İlgilenmiyor', 'Ulaşılamadı'].includes(aktivite)) {
                  employeeStats[kod].negativeActivities++;
                } else {
                  employeeStats[kod].positiveActivities++;
                  if (aktivite.includes('Randevu')) {
                    employeeStats[kod].appointments++;
                  }
                  if (aktivite.includes('Fırsat')) {
                    employeeStats[kod].opportunities++;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Dashboard sayfasını oluştur
    let dashboardSheet = ss.getSheetByName('📊 Günlük Performans');
    if (!dashboardSheet) {
      dashboardSheet = ss.insertSheet('📊 Günlük Performans');
    } else {
      dashboardSheet.clear();
    }
    
    // Dashboard başlığı
    dashboardSheet.getRange('A1').setValue('📊 GÜNLÜK PERFORMANS DASHBOARD');
    dashboardSheet.getRange('A1:D1').merge();
    dashboardSheet.getRange('A1').setFontSize(16).setFontWeight('bold').setBackground('#4285F4').setFontColor('white');
    
    // Tarih bilgisi
    dashboardSheet.getRange('A2').setValue(`📅 Tarih: ${todayKey}`);
    dashboardSheet.getRange('A2:D2').merge();
    dashboardSheet.getRange('A2').setFontSize(12).setFontWeight('bold');
    
    // Başlık satırı
    const headers = [
      '👤 Temsilci', '🕐 Çalışma Süresi', '📞 Toplam Arama', 
      '✅ Pozitif', '❌ Negatif', '📅 Randevu', '💰 Fırsat', '📋 Son Aktivite'
    ];
    
    dashboardSheet.getRange('A4:H4').setValues([headers]);
    dashboardSheet.getRange('A4:H4').setFontWeight('bold').setBackground('#E8F5E8');
    
    // Veri satırları
    let row = 5;
    for (const [code, stats] of Object.entries(employeeStats)) {
      if (stats.totalCalls > 0) {
        const workDuration = calculateWorkDuration(stats.firstActivity, stats.lastActivity);
        const lastActivity = stats.activities.length > 0 ? 
          `${stats.activities[stats.activities.length - 1].activity} - ${stats.activities[stats.activities.length - 1].time}` : 
          'Aktivite yok';
        
        const rowData = [
          `${code} - ${stats.name}`,
          workDuration,
          stats.totalCalls,
          stats.positiveActivities,
          stats.negativeActivities,
          stats.appointments,
          stats.opportunities,
          lastActivity
        ];
        
        dashboardSheet.getRange(row, 1, 1, 8).setValues([rowData]);
        
        // Satır renklendirme
        const rowRange = dashboardSheet.getRange(row, 1, 1, 8);
        if (stats.positiveActivities > stats.negativeActivities) {
          rowRange.setBackground('#E8F5E8'); // Açık yeşil
        } else if (stats.negativeActivities > stats.positiveActivities) {
          rowRange.setBackground('#FFEBEE'); // Açık kırmızı
        } else {
          rowRange.setBackground('#FFF8E1'); // Açık sarı
        }
        
        row++;
      }
    }
    
    // Sütun genişliklerini ayarla
    dashboardSheet.autoResizeColumns(1, 8);
    
    // Toplam satırı
    if (row > 5) {
      dashboardSheet.getRange(row, 1).setValue('📊 TOPLAM');
      dashboardSheet.getRange(row, 1).setFontWeight('bold').setBackground('#4285F4').setFontColor('white');
      
      // Toplam hesaplamaları
      const totalCalls = Object.values(employeeStats).reduce((sum, stats) => sum + stats.totalCalls, 0);
      const totalPositive = Object.values(employeeStats).reduce((sum, stats) => sum + stats.positiveActivities, 0);
      const totalNegative = Object.values(employeeStats).reduce((sum, stats) => sum + stats.negativeActivities, 0);
      
      dashboardSheet.getRange(row, 3).setValue(totalCalls);
      dashboardSheet.getRange(row, 4).setValue(totalPositive);
      dashboardSheet.getRange(row, 5).setValue(totalNegative);
    }
    
    // Dashboard'u aktif sayfa yap
    dashboardSheet.activate();
    
    SpreadsheetApp.getUi().alert('✅ Dashboard Oluşturuldu', 
      `Günlük performans dashboard'u başarıyla oluşturuldu!\n\n📊 Toplam Temsilci: ${Object.keys(employeeStats).length}\n📞 Toplam Aktivite: ${Object.values(employeeStats).reduce((sum, stats) => sum + stats.totalCalls, 0)}`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log('Processing complete:', { dashboardCreated: true, employeeCount: Object.keys(employeeStats).length });
    return { success: true, dashboardCreated: true };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Dashboard Hatası', 'Dashboard oluşturulurken hata: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * 📈 Haftalık Performans Grafiği - Haftalık trend analizi
 */
function generateWeeklyPerformanceChart() {
  console.log('Function started: generateWeeklyPerformanceChart');
  
  try {
    if (!validateInput({})) {
      throw new Error('Invalid input provided');
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1); // Pazartesi
    
    console.log('Haftalık performans grafiği başlatılıyor:', weekStart.toDateString());
    
    // Haftalık veri toplama
    const weeklyData = {};
    const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateKey = Utilities.formatDate(date, 'Europe/Istanbul', 'dd.MM.yyyy');
      weeklyData[dateKey] = {
        date: dateKey,
        day: daysOfWeek[i],
        totalActivities: 0,
        positiveActivities: 0,
        negativeActivities: 0,
        appointments: 0,
        opportunities: 0
      };
    }
    
    // Format Tablo sayfalarından haftalık veri topla
    const sheets = ss.getSheets();
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      if (sheetName.includes('Format Tablo') && sheet.getLastRow() > 1) {
        console.log('Format Tablo işleniyor:', sheetName);
        
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
        const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
        
        const aktiviteIdx = headers.indexOf('Aktivite');
        const aktiviteTarihiIdx = headers.indexOf('Aktivite Tarihi');
        const logIdx = headers.indexOf('Log');
        
        if (aktiviteIdx !== -1) {
          for (const row of data) {
            const aktivite = String(row[aktiviteIdx] || '').trim();
            const tarih = aktiviteTarihiIdx !== -1 ? row[aktiviteTarihiIdx] : null;
            const log = logIdx !== -1 ? row[logIdx] : null;
            
            if (aktivite) {
              // Tarih kontrolü - bu hafta mı?
              let activityDate = null;
              if (tarih && weeklyData[tarih]) {
                activityDate = tarih;
              } else if (log) {
                // Log'dan tarih çıkar
                for (const dateKey of Object.keys(weeklyData)) {
                  if (log.includes(dateKey)) {
                    activityDate = dateKey;
                    break;
                  }
                }
              }
              
              if (activityDate && weeklyData[activityDate]) {
                weeklyData[activityDate].totalActivities++;
                
                if (['İlgilenmiyor', 'Ulaşılamadı'].includes(aktivite)) {
                  weeklyData[activityDate].negativeActivities++;
                } else {
                  weeklyData[activityDate].positiveActivities++;
                  if (aktivite.includes('Randevu')) {
                    weeklyData[activityDate].appointments++;
                  }
                  if (aktivite.includes('Fırsat')) {
                    weeklyData[activityDate].opportunities++;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Haftalık grafik sayfasını oluştur
    let chartSheet = ss.getSheetByName('📈 Haftalık Performans');
    if (!chartSheet) {
      chartSheet = ss.insertSheet('📈 Haftalık Performans');
    } else {
      chartSheet.clear();
    }
    
    // Başlık
    chartSheet.getRange('A1').setValue('📈 HAFTALIK PERFORMANS GRAFİĞİ');
    chartSheet.getRange('A1:F1').merge();
    chartSheet.getRange('A1').setFontSize(16).setFontWeight('bold').setBackground('#4285F4').setFontColor('white');
    
    // Hafta bilgisi
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    chartSheet.getRange('A2').setValue(`📅 Hafta: ${Utilities.formatDate(weekStart, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(weekEnd, 'Europe/Istanbul', 'dd.MM.yyyy')}`);
    chartSheet.getRange('A2:F2').merge();
    chartSheet.getRange('A2').setFontSize(12).setFontWeight('bold');
    
    // Başlık satırı
    const headers = ['📅 Gün', '📊 Toplam Aktivite', '✅ Pozitif', '❌ Negatif', '📅 Randevu', '💰 Fırsat'];
    chartSheet.getRange('A4:F4').setValues([headers]);
    chartSheet.getRange('A4:F4').setFontWeight('bold').setBackground('#E8F5E8');
    
    // Veri satırları
    let row = 5;
    for (const dateKey of Object.keys(weeklyData)) {
      const data = weeklyData[dateKey];
      const rowData = [
        data.day,
        data.totalActivities,
        data.positiveActivities,
        data.negativeActivities,
        data.appointments,
        data.opportunities
      ];
      
      chartSheet.getRange(row, 1, 1, 6).setValues([rowData]);
      
      // Satır renklendirme
      const rowRange = chartSheet.getRange(row, 1, 1, 6);
      if (data.positiveActivities > data.negativeActivities) {
        rowRange.setBackground('#E8F5E8'); // Açık yeşil
      } else if (data.negativeActivities > data.positiveActivities) {
        rowRange.setBackground('#FFEBEE'); // Açık kırmızı
      } else {
        rowRange.setBackground('#FFF8E1'); // Açık sarı
      }
      
      row++;
    }
    
    // Sütun genişliklerini ayarla
    chartSheet.autoResizeColumns(1, 6);
    
    // Grafik oluştur
    try {
      const chartRange = chartSheet.getRange('A4:F' + (row - 1));
      const chart = chartSheet.newChart()
        .setChartType(Charts.ChartType.COLUMN)
        .addRange(chartRange)
        .setPosition(1, 1, 0, 0)
        .setOption('title', 'Haftalık Aktivite Dağılımı')
        .setOption('legend', { position: 'bottom' })
        .setOption('colors', ['#4285F4', '#34A853', '#EA4335', '#FBBC04', '#FF6D01'])
        .setOption('vAxes', { 0: { title: 'Aktivite Sayısı' } })
        .setOption('hAxes', { 0: { title: 'Günler' } });
      
      chartSheet.insertChart(chart);
      console.log('Haftalık grafik oluşturuldu');
    } catch (chartError) {
      console.log('Grafik oluşturulamadı:', chartError.message);
    }
    
    // Sayfayı aktif yap
    chartSheet.activate();
    
    SpreadsheetApp.getUi().alert('✅ Haftalık Grafik Oluşturuldu', 
      `Haftalık performans grafiği başarıyla oluşturuldu!\n\n📊 Hafta: ${Utilities.formatDate(weekStart, 'Europe/Istanbul', 'dd.MM.yyyy')} - ${Utilities.formatDate(weekEnd, 'Europe/Istanbul', 'dd.MM.yyyy')}\n📈 Toplam Aktivite: ${Object.values(weeklyData).reduce((sum, data) => sum + data.totalActivities, 0)}`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log('Processing complete:', { weeklyChartCreated: true });
    return { success: true, weeklyChartCreated: true };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Grafik Hatası', 'Haftalık grafik oluşturulurken hata: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * ⏰ Zaman Analizi Raporu - Çalışma saatleri ve verimlilik analizi
 */
function generateTimeAnalysisReport() {
  console.log('Function started: generateTimeAnalysisReport');
  
  try {
    if (!validateInput({})) {
      throw new Error('Invalid input provided');
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const today = new Date();
    const todayKey = Utilities.formatDate(today, 'Europe/Istanbul', 'dd.MM.yyyy');
    
    console.log('Zaman analizi raporu başlatılıyor:', todayKey);
    
    // Temsilci zaman analizi
    const timeAnalysis = {};
    
    for (const [employeeCode, employeeName] of Object.entries(CRM_CONFIG.EMPLOYEE_CODES)) {
      timeAnalysis[employeeCode] = {
        name: employeeName,
        code: employeeCode,
        activities: [],
        workStart: null,
        workEnd: null,
        totalWorkTime: 0,
        averageCallDuration: 0,
        callIntervals: [],
        productivityScore: 0
      };
    }
    
    // Format Tablo sayfalarından zaman verisi topla
    const sheets = ss.getSheets();
    for (const sheet of sheets) {
      const sheetName = sheet.getName();
      if (sheetName.includes('Format Tablo') && sheet.getLastRow() > 1) {
        console.log('Format Tablo zaman analizi:', sheetName);
        
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
        const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).getDisplayValues();
        
        const kodIdx = headers.indexOf('Kod');
        const aktiviteIdx = headers.indexOf('Aktivite');
        const logIdx = headers.indexOf('Log');
        
        if (kodIdx !== -1 && aktiviteIdx !== -1 && logIdx !== -1) {
          for (const row of data) {
            const kod = String(row[kodIdx] || '').trim();
            const aktivite = String(row[aktiviteIdx] || '').trim();
            const log = String(row[logIdx] || '').trim();
            
            if (kod && aktivite && log && timeAnalysis[kod] && log.includes(todayKey)) {
              const activityTime = extractTimeFromLog(log);
              if (activityTime) {
                const activityData = {
                  activity: aktivite,
                  time: activityTime,
                  timestamp: parseTimeToMinutes(activityTime)
                };
                
                timeAnalysis[kod].activities.push(activityData);
                
                // İş başlangıç ve bitiş zamanı
                if (!timeAnalysis[kod].workStart || activityTime < timeAnalysis[kod].workStart) {
                  timeAnalysis[kod].workStart = activityTime;
                }
                if (!timeAnalysis[kod].workEnd || activityTime > timeAnalysis[kod].workEnd) {
                  timeAnalysis[kod].workEnd = activityTime;
                }
              }
            }
          }
        }
      }
    }
    
    // Zaman hesaplamaları
    for (const [code, analysis] of Object.entries(timeAnalysis)) {
      if (analysis.activities.length > 1) {
        // Çalışma süresi
        if (analysis.workStart && analysis.workEnd) {
          analysis.totalWorkTime = calculateTimeDifference(analysis.workStart, analysis.workEnd);
        }
        
        // Arama aralıkları
        const sortedActivities = analysis.activities.sort((a, b) => a.timestamp - b.timestamp);
        for (let i = 1; i < sortedActivities.length; i++) {
          const interval = sortedActivities[i].timestamp - sortedActivities[i-1].timestamp;
          if (interval > 0 && interval < 480) { // 8 saatten az
            analysis.callIntervals.push(interval);
          }
        }
        
        // Ortalama arama süresi
        if (analysis.callIntervals.length > 0) {
          analysis.averageCallDuration = Math.round(analysis.callIntervals.reduce((sum, interval) => sum + interval, 0) / analysis.callIntervals.length);
        }
        
        // Verimlilik skoru (basit hesaplama)
        analysis.productivityScore = Math.round((analysis.activities.length / Math.max(1, analysis.totalWorkTime / 60)) * 10);
      }
    }
    
    // Zaman analizi sayfasını oluştur
    let timeSheet = ss.getSheetByName('⏰ Zaman Analizi');
    if (!timeSheet) {
      timeSheet = ss.insertSheet('⏰ Zaman Analizi');
    } else {
      timeSheet.clear();
    }
    
    // Başlık
    timeSheet.getRange('A1').setValue('⏰ ZAMAN ANALİZİ RAPORU');
    timeSheet.getRange('A1:H1').merge();
    timeSheet.getRange('A1').setFontSize(16).setFontWeight('bold').setBackground('#4285F4').setFontColor('white');
    
    // Tarih bilgisi
    timeSheet.getRange('A2').setValue(`📅 Tarih: ${todayKey}`);
    timeSheet.getRange('A2:H2').merge();
    timeSheet.getRange('A2').setFontSize(12).setFontWeight('bold');
    
    // Başlık satırı
    const headers = [
      '👤 Temsilci', '🕐 İş Başlangıcı', '🕐 İş Bitişi', '⏱️ Çalışma Süresi',
      '📞 Toplam Aktivite', '⏰ Ort. Arama Süresi', '📊 Verimlilik Skoru', '📋 Detay'
    ];
    
    timeSheet.getRange('A4:H4').setValues([headers]);
    timeSheet.getRange('A4:H4').setFontWeight('bold').setBackground('#E8F5E8');
    
    // Veri satırları
    let row = 5;
    for (const [code, analysis] of Object.entries(timeAnalysis)) {
      if (analysis.activities.length > 0) {
        const workStart = analysis.workStart || 'Belirlenemedi';
        const workEnd = analysis.workEnd || 'Belirlenemedi';
        const workTime = analysis.totalWorkTime > 0 ? `${Math.floor(analysis.totalWorkTime / 60)}s ${analysis.totalWorkTime % 60}d` : 'Belirlenemedi';
        const avgCallTime = analysis.averageCallDuration > 0 ? `${analysis.averageCallDuration} dk` : 'Belirlenemedi';
        const productivity = analysis.productivityScore > 0 ? `${analysis.productivityScore}/10` : 'Belirlenemedi';
        
        const detail = analysis.activities.length > 0 ? 
          `${analysis.activities[0].activity} → ${analysis.activities[analysis.activities.length - 1].activity}` : 
          'Aktivite yok';
        
        const rowData = [
          `${code} - ${analysis.name}`,
          workStart,
          workEnd,
          workTime,
          analysis.activities.length,
          avgCallTime,
          productivity,
          detail
        ];
        
        timeSheet.getRange(row, 1, 1, 8).setValues([rowData]);
        
        // Satır renklendirme
        const rowRange = timeSheet.getRange(row, 1, 1, 8);
        if (analysis.productivityScore >= 7) {
          rowRange.setBackground('#E8F5E8'); // Açık yeşil - yüksek verimlilik
        } else if (analysis.productivityScore >= 4) {
          rowRange.setBackground('#FFF8E1'); // Açık sarı - orta verimlilik
        } else {
          rowRange.setBackground('#FFEBEE'); // Açık kırmızı - düşük verimlilik
        }
        
        row++;
      }
    }
    
    // Sütun genişliklerini ayarla
    timeSheet.autoResizeColumns(1, 8);
    
    // Sayfayı aktif yap
    timeSheet.activate();
    
    SpreadsheetApp.getUi().alert('✅ Zaman Analizi Tamamlandı', 
      `Zaman analizi raporu başarıyla oluşturuldu!\n\n📊 Analiz Edilen Temsilci: ${Object.values(timeAnalysis).filter(a => a.activities.length > 0).length}\n⏰ Toplam Aktivite: ${Object.values(timeAnalysis).reduce((sum, a) => sum + a.activities.length, 0)}`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log('Processing complete:', { timeAnalysisCreated: true });
    return { success: true, timeAnalysisCreated: true };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Zaman Analizi Hatası', 'Zaman analizi oluşturulurken hata: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

/**
 * 🔄 Canlı Dashboard Yenile - Tüm dashboard'ları güncelle
 */
function refreshLiveDashboard() {
  console.log('Function started: refreshLiveDashboard');
  
  try {
    if (!validateInput({})) {
      throw new Error('Invalid input provided');
    }

    console.log('Canlı dashboard yenileme başlatılıyor...');
    
    // Tüm dashboard fonksiyonlarını çalıştır
    const results = {};
    
    try {
      results.daily = generateDailyPerformanceDashboard();
      console.log('Günlük dashboard yenilendi');
    } catch (error) {
      console.error('Günlük dashboard hatası:', error.message);
      results.daily = { error: error.message };
    }
    
    try {
      results.weekly = generateWeeklyPerformanceChart();
      console.log('Haftalık grafik yenilendi');
    } catch (error) {
      console.error('Haftalık grafik hatası:', error.message);
      results.weekly = { error: error.message };
    }
    
    try {
      results.time = generateTimeAnalysisReport();
      console.log('Zaman analizi yenilendi');
    } catch (error) {
      console.error('Zaman analizi hatası:', error.message);
      results.time = { error: error.message };
    }
    
    // Sonuç raporu
    const successCount = Object.values(results).filter(r => r.success).length;
    const errorCount = Object.values(results).filter(r => r.error).length;
    
    SpreadsheetApp.getUi().alert('🔄 Dashboard Yenileme Tamamlandı', 
      `Tüm dashboard'lar yenilendi!\n\n✅ Başarılı: ${successCount}\n❌ Hata: ${errorCount}\n\n📊 Günlük Performans: ${results.daily.success ? '✅' : '❌'}\n📈 Haftalık Grafik: ${results.weekly.success ? '✅' : '❌'}\n⏰ Zaman Analizi: ${results.time.success ? '✅' : '❌'}`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
    
    console.log('Processing complete:', { dashboardRefresh: true, results });
    return { success: true, dashboardRefresh: true, results };
    
  } catch (error) {
    console.error('Function failed:', error);
    SpreadsheetApp.getUi().alert('❌ Dashboard Yenileme Hatası', 'Dashboard yenileme sırasında hata: ' + error.message, SpreadsheetApp.getUi().ButtonSet.OK);
    throw error;
  }
}

// ========================================
// 🔧 DASHBOARD YARDIMCI FONKSİYONLARI
// ========================================

/**
 * ⏰ Log'dan zaman çıkar (HH:mm formatında)
 */
function extractTimeFromLog(log) {
  if (!log || typeof log !== 'string') return null;
  
  try {
    // HH:mm:ss formatını ara
    const timeMatch = log.match(/(\d{1,2}):(\d{2}):(\d{2})/);
    if (timeMatch) {
      return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    }
    
    // HH:mm formatını ara
    const timeMatch2 = log.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch2) {
      return `${timeMatch2[1].padStart(2, '0')}:${timeMatch2[2]}`;
    }
    
    return null;
  } catch (error) {
    console.error('Zaman çıkarma hatası:', error);
    return null;
  }
}

/**
 * ⏱️ Zamanı dakikaya çevir (HH:mm → dakika)
 */
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  
  try {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours * 60) + minutes;
  } catch (error) {
    console.error('Zaman parse hatası:', error);
    return 0;
  }
}

/**
 * ⏱️ İki zaman arasındaki farkı hesapla (dakika)
 */
function calculateTimeDifference(startTime, endTime) {
  if (!startTime || !endTime) return 0;
  
  try {
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = parseTimeToMinutes(endTime);
    
    if (endMinutes >= startMinutes) {
      return endMinutes - startMinutes;
    } else {
      // Gece yarısını geçen durum için
      return (24 * 60 - startMinutes) + endMinutes;
    }
  } catch (error) {
    console.error('Zaman farkı hesaplama hatası:', error);
    return 0;
  }
}

/**
 * 🕐 Çalışma süresini formatla
 */
function calculateWorkDuration(startTime, endTime) {
  if (!startTime || !endTime) return 'Belirlenemedi';
  
  try {
    const duration = calculateTimeDifference(startTime, endTime);
    if (duration <= 0) return 'Belirlenemedi';
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours > 0) {
      return `${hours}s ${minutes}d`;
    } else {
      return `${minutes}d`;
    }
  } catch (error) {
    console.error('Çalışma süresi hesaplama hatası:', error);
    return 'Belirlenemedi';
  }
}
