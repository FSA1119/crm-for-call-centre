#!/usr/bin/env python3
"""
Deploy All Script - Tüm temsilcilere deploy eder
Kullanım: python3 deploy-all.py
"""

import json
import subprocess
import os
import sys
from pathlib import Path

def main():
    # Config dosyasını oku
    config_file = Path(__file__).parent / "deploy-config.json"
    
    if not config_file.exists():
        print("❌ deploy-config.json bulunamadı!")
        sys.exit(1)
    
    with open(config_file, 'r', encoding='utf-8') as f:
        config = json.load(f)
    
    print("🚀 TÜM TEMSİLCİLERE DEPLOY BAŞLATILIYOR...")
    print("")
    
    # Mevcut .clasp.json'ı yedekle
    clasp_file = Path(".clasp.json")
    clasp_backup = Path(".clasp.json.backup")
    
    if clasp_file.exists():
        clasp_file.rename(clasp_backup)
    
    success_count = 0
    error_count = 0
    total_count = 0
    
    # Tüm employee'lere deploy et
    for employee in config.get("employees", []):
        script_id = employee.get("scriptId", "")
        code = employee.get("code", "")
        name = employee.get("name", "")
        
        # Script ID kontrolü
        if not script_id or script_id == "BURAYA_SCRIPT_ID_YAZ":
            print(f"⚠️  {code} - {name}: Script ID tanımlanmamış, atlanıyor...")
            continue
        
        total_count += 1
        print(f"📦 [{total_count}] {code} - {name} deploy ediliyor...")
        
        # Geçici .clasp.json oluştur
        clasp_config = {
            "scriptId": script_id,
            "rootDir": str(Path.cwd())
        }
        
        with open(clasp_file, 'w', encoding='utf-8') as f:
            json.dump(clasp_config, f, indent=2)
        
        # Deploy yap
        try:
            result = subprocess.run(
                ["clasp", "push"],
                capture_output=True,
                text=True,
                timeout=120  # 2 dakika timeout
            )
            
            if result.returncode == 0:
                print(f"  ✅ Başarılı!")
                success_count += 1
            else:
                print(f"  ❌ Hata: {result.stderr[:100]}")
                error_count += 1
        except subprocess.TimeoutExpired:
            print(f"  ❌ Timeout!")
            error_count += 1
        except Exception as e:
            print(f"  ❌ Hata: {str(e)}")
            error_count += 1
        
        print("")
    
    # Orijinal .clasp.json'ı geri yükle
    if clasp_backup.exists():
        clasp_backup.rename(clasp_file)
    
    # Özet
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("📊 DEPLOY ÖZETİ:")
    print(f"  ✅ Başarılı: {success_count}")
    print(f"  ❌ Hatalı: {error_count}")
    print(f"  📦 Toplam: {total_count}")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    if error_count == 0:
        print("")
        print("🎉 TÜM DEPLOY'LAR BAŞARILI!")
        sys.exit(0)
    else:
        print("")
        print("⚠️  Bazı deploy'lar başarısız oldu. Yukarıdaki hataları kontrol et.")
        sys.exit(1)

if __name__ == "__main__":
    main()