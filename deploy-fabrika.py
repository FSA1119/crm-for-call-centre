#!/usr/bin/env python3
"""
Deploy Fabrika Script - Sadece Fabrika dosyasına deploy eder
Kullanım: python3 deploy-fabrika.py
"""

import json
import subprocess
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
    
    # Fabrika Script ID'sini al
    fabrika_config = config.get("fabrika", {})
    fabrika_script_id = fabrika_config.get("scriptId", "")
    
    if not fabrika_script_id or fabrika_script_id == "FABRIKA_SCRIPT_ID_BURAYA":
        print("❌ Fabrika Script ID tanımlanmamış!")
        print("📝 deploy-config.json dosyasında 'fabrika.scriptId' değerini düzenle.")
        sys.exit(1)
    
    print("🏭 FABRIKA DOSYASINA DEPLOY BAŞLATILIYOR...")
    print(f"📋 Script ID: {fabrika_script_id}")
    print("")
    
    # Mevcut .clasp.json'ı yedekle
    clasp_file = Path(".clasp.json")
    clasp_backup = Path(".clasp.json.backup")
    
    if clasp_file.exists():
        clasp_file.rename(clasp_backup)
    
    # Geçici .clasp.json oluştur
    clasp_config = {
        "scriptId": fabrika_script_id,
        "rootDir": str(Path.cwd())
    }
    
    with open(clasp_file, 'w', encoding='utf-8') as f:
        json.dump(clasp_config, f, indent=2)
    
    # Deploy yap
    print("🚀 Deploy ediliyor...")
    try:
        result = subprocess.run(
            ["clasp", "push"],
            capture_output=False,
            timeout=120
        )
        
        if result.returncode == 0:
            print("")
            print("✅ FABRIKA DOSYASINA DEPLOY BAŞARILI!")
        else:
            print("")
            print("❌ DEPLOY BAŞARISIZ!")
            sys.exit(1)
    except subprocess.TimeoutExpired:
        print("")
        print("❌ DEPLOY TIMEOUT!")
        sys.exit(1)
    except Exception as e:
        print("")
        print(f"❌ HATA: {str(e)}")
        sys.exit(1)
    finally:
        # Orijinal .clasp.json'ı geri yükle
        if clasp_backup.exists():
            clasp_backup.rename(clasp_file)
    
    print("")
    print("✅ İşlem tamamlandı!")

if __name__ == "__main__":
    main()
