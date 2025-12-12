#!/bin/bash

# Deploy All Script - Tüm temsilcilere deploy eder
# Kullanım: ./deploy-all.sh

cd "$(dirname "$0")"

# Config dosyasını oku
CONFIG_FILE="deploy-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ deploy-config.json bulunamadı!"
  exit 1
fi

echo "🚀 TÜM TEMSİLCİLERE DEPLOY BAŞLATILIYOR..."
echo ""

# Mevcut .clasp.json'ı yedekle
if [ -f ".clasp.json" ]; then
  cp .clasp.json .clasp.json.backup
fi

# Employee listesini oku ve deploy et
SUCCESS_COUNT=0
ERROR_COUNT=0
TOTAL_COUNT=0

# JSON'dan employee'leri parse et (basit yöntem)
while IFS= read -r line; do
  if [[ $line =~ "scriptId" ]]; then
    SCRIPT_ID=$(echo "$line" | grep -oP '"scriptId":\s*"\K[^"]+')
    EMPLOYEE_CODE=$(echo "$line" | grep -B 5 "scriptId" | grep -oP '"code":\s*"\K[^"]+' | tail -1)
    EMPLOYEE_NAME=$(echo "$line" | grep -B 5 "scriptId" | grep -oP '"name":\s*"\K[^"]+' | tail -1)
    
    if [ ! -z "$SCRIPT_ID" ] && [ "$SCRIPT_ID" != "BURAYA_SCRIPT_ID_YAZ" ]; then
      TOTAL_COUNT=$((TOTAL_COUNT + 1))
      echo "📦 [$TOTAL_COUNT] $EMPLOYEE_CODE - $EMPLOYEE_NAME deploy ediliyor..."
      
      # Geçici .clasp.json oluştur
      cat > .clasp.json <<EOF
{
  "scriptId": "$SCRIPT_ID",
  "rootDir": "$(pwd)"
}
EOF
      
      # Deploy yap
      clasp push > /dev/null 2>&1
      
      if [ $? -eq 0 ]; then
        echo "  ✅ Başarılı!"
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
      else
        echo "  ❌ Hata!"
        ERROR_COUNT=$((ERROR_COUNT + 1))
      fi
      
      echo ""
    fi
  fi
done < "$CONFIG_FILE"

# Orijinal .clasp.json'ı geri yükle
if [ -f ".clasp.json.backup" ]; then
  mv .clasp.json.backup .clasp.json
fi

# Özet
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 DEPLOY ÖZETİ:"
echo "  ✅ Başarılı: $SUCCESS_COUNT"
echo "  ❌ Hatalı: $ERROR_COUNT"
echo "  📦 Toplam: $TOTAL_COUNT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERROR_COUNT -eq 0 ]; then
  echo ""
  echo "🎉 TÜM DEPLOY'LAR BAŞARILI!"
  exit 0
else
  echo ""
  echo "⚠️  Bazı deploy'lar başarısız oldu. Yukarıdaki hataları kontrol et."
  exit 1
fi