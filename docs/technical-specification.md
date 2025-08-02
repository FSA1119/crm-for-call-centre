# GOOGLE SHEETS CRM - TECHNICAL SPECIFICATION

## PROJECT OVERVIEW
Multi-user CRM system in Google Sheets with employee-manager synchronization.

## FILE STRUCTURE

### Employee Files (6 files)
- LG 001 - Calisma Dosyasi (Levent Gül)
- AK 002 - Calisma Dosyasi (Ahmet Kaya)
- MT 003 - Calisma Dosyasi (Mehmet Tekin)
- AY 004 - Calisma Dosyasi (Ayşe Yılmaz)
- FD 005 - Calisma Dosyasi (Fatma Demir)
- SK 006 - Calisma Dosyasi (Selim Korkmaz)

Each employee file contains:
- Dynamic pages: Ham veri, Format Tablo (multiple)
- 4 stable pages: Randevularım, Fırsatlarım, Toplantılarım, Raporlarım

### Manager File (1 file)
- FSA 019 - Yonetici Takip Dosyasi

Manager file contains:
- 4 consolidated pages: Randevular, Fırsatlar, Toplantılar, Raporlar
- Config page: System settings and logs

## CORE WORKFLOW

### Phase 1: Data Preparation
1. Load raw data into `Ham veri`
2. Click "Yeni Tablo oluştur" button
3. System creates `Format Tablo` with standardized structure
4. Auto-map columns from Ham veri to Format Tablo

### Phase 2: CRM Operations
1. **Take Appointment**: Format Tablo → Randevularım
2. **Add Opportunity**: Format Tablo → Fırsatlarım
3. **Move to Meeting**: Randevularım → Toplantılarım
4. **Opportunity to Appointment**: Fırsatlarım → Randevularım

### Phase 3: Website Analysis (3 independent buttons)
1. **⚡ HIZ TESTİ**: Measure site speed → Site Hızı column
2. **🔍 CMS ALTYAPI**: Detect CMS → CMS Adı, CMS Grubu columns
3. **🛒 E-TİCARET İZİ**: Detect e-commerce → E-Ticaret İzi column

## 12 CORE FUNCTIONS

### Function 1: Create New Table
- Button: "Yeni Tablo oluştur"
- Process: Ham veri → Format Tablo
- Auto-map columns, preserve data types

### Function 2: Take Appointment
- Button: "Randevu al"
- Process: Format Tablo → Randevularım
- Modal dialog with pre-filled and manual fields

### Function 3: Add Opportunity
- Button: "Fırsat ekle"
- Process: Format Tablo → Fırsatlarım
- Modal dialog with opportunity-specific fields

### Function 4: Move to Meeting
- Button: "Toplantıya Geç"
- Process: Randevularım → Toplantılarım
- Only for confirmed appointments

### Function 5: Generate Reports
- Auto-generate pivot tables in Raporlarım/Raporlar
- Dynamic updates based on activity data

### Function 6: CMS Analysis
- Button: "🔍 CMS ALTYAPI"
- Analyze HTML source code for CMS detection
- Support Turkish and international CMS platforms

### Function 7: E-commerce Detection
- Button: "🛒 E-TİCARET İZİ"
- 5-method e-commerce detection
- Confidence scoring (0-100%)

### Function 8: Speed Test
- Button: "⚡ HIZ TESTİ"
- HTTP response time measurement
- Batch processing (50 URLs/group)

### Function 9: Delete No Phone
- Button: "Telefon olmayanları sil"
- Remove rows without phone numbers

### Function 10: Categorize Phones
- Button: "Cep sabit ayarla"
- Distinguish mobile vs landline phones

### Function 11: Sheet Synchronization
- Auto-sync between employee and manager files
- Employee code format: [Initials]_[Number]

### Function 12: Color Coding
- Auto-apply colors based on status
- Consistent across all sheets

## SYNCHRONIZATION SYSTEM

### Auto-Sync Trigger
```javascript
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const sheetName = sheet.getName();
  
  if (['Randevularım', 'Fırsatlarım', 'Toplantılarım'].includes(sheetName)) {
    syncToManager(e);
  }
}

Manual Sync Button
Menu: CRM → "Senkronize Et"
Full data synchronization
UI REQUIREMENTS
Modal Dialogs
Pre-fill from selected row
Default values (80-90% filled)
Manual input fields
Dropdown validation
Date pickers for date fields
Color Coding
Randevu Alındı: #E3F2FD
Teyitlendi: #E8F5E8
Ertelendi: #FFF3E0
İptal: #FFEBEE
Fırsat: #FFF8E1
Toplantı Tamamlandı: #C8E6C9
TECHNICAL SPECIFICATIONS
Performance Requirements
Website analysis: 200-300 URLs in 2-3 minutes
Batch processing: 50 URLs per group
Timeout: 5 seconds per URL
Parallel processing for efficiency
Data Validation
Strict dropdown validation against sayfa_kolonlari.md
Phone number format validation
Date format validation
Required field validation
Error Handling
User-friendly error messages
Console logging for debugging
Graceful failure handling
Data integrity protection
PIVOT TABLE SPECIFICATIONS
Employee Reports (Raporlarım)
Source: All activity data
Grouping: Activity type, date, status
Sub-categories: Randevu Alındı → Teyitlendi/Ertelendi/İptal
Manager Reports (Raporlar)
Source: All employees' data
Grouping: Employee, activity type, date
Consolidated view of all activities
DEVELOPMENT PRIORITIES
Core CRM functions (1-5)
Website analysis functions (6-8)
Data management functions (9-10)
Synchronization system (11)
UI enhancements (12)