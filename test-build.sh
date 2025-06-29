#!/bin/bash
echo "🧪 測試前端構建..."

# 清理
rm -rf dist/ node_modules/.vite

# 安裝依賴
echo "📦 安裝依賴..."
npm install --legacy-peer-deps

# 嘗試不同的構建方法
echo ""
echo "🔨 方法 1: 常規構建"
if npm run build; then
    echo "✅ 常規構建成功"
    exit 0
fi

echo ""
echo "🔨 方法 2: 僅構建（跳過類型檢查）"
if npm run build-only 2>/dev/null || npx vite build --mode production; then
    echo "✅ 無類型檢查構建成功"
    exit 0
fi

echo ""
echo "🔨 方法 3: 使用簡化配置構建"
if npx vite build --config vite.config.simple.js; then
    echo "✅ 簡化配置構建成功"
    exit 0
fi

echo "❌ 所有構建方法都失敗了"
echo "請檢查具體錯誤信息"
exit 1
