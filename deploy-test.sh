#!/bin/bash

# Deploy Test Script - Sadece test ortamına deploy eder
# Kullanım: ./deploy-test.sh

cd "$(dirname "$0")"

# Config dosyasını oku
CONFIG_FILE="deploy-config.json"
if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ deploy-config.json bulunamadı!"
  exit 1
fi

# Test Script ID'sini al
TEST_SCRIPT_ID=$(cat "$CONFIG_FILE" | grep -A 2 '"test"' | grep '"scriptId"' | cut -d'"' -f4)

if [ -z "$TEST_SCRIPT_ID" ] || [ "$TEST_SCRIPT_ID" == "TEST_SCRIPT_ID_BURAYA" ]; then
  echo "❌ Test Script ID tanımlanmamış! deploy-config.json dosyasını düzenle."
  exit 1
fi

echo "🧪 TEST ORTAMINA DEPLOY BAŞLATILIYOR..."
echo "📋 Script ID: $TEST_SCRIPT_ID"
echo ""

# Geçici .clasp.json oluştur
TEMP_CLASP=".clasp.json.temp"
cat > "$TEMP_CLASP" <<EOF
{
  "scriptId": "$TEST_SCRIPT_ID",
  "rootDir": "$(pwd)"
}
EOF

# Mevcut .clasp.json'ı yedekle
if [ -f ".clasp.json" ]; then
  cp .clasp.json .clasp.json.backup
fi

# Geçici .clasp.json'ı kullan
cp "$TEMP_CLASP" .clasp.json

# Deploy yap
echo "🚀 Deploy ediliyor..."
clasp push

# Başarılı mı kontrol et
if [ $? -eq 0 ]; then
  echo ""
  echo "✅ TEST ORTAMINA DEPLOY BAŞARILI!"
  echo "📝 Test yap ve sonucu kontrol et."
  echo "✅ Test başarılıysa: ./deploy-all.sh çalıştır"
else
  echo ""
  echo "❌ DEPLOY BAŞARISIZ!"
  exit 1
fi

# Orijinal .clasp.json'ı geri yükle
if [ -f ".clasp.json.backup" ]; then
  mv .clasp.json.backup .clasp.json
fi

# Geçici dosyayı temizle
rm -f "$TEMP_CLASP"

echo ""
echo "✅ İşlem tamamlandı!"