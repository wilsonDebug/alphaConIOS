#!/bin/bash

# iOS 简化打包脚本 (适用于 macOS)
# 使用方法: ./ios-build-simple.sh [项目名称] [配置]

PROJECT_NAME=${1:-"MobileAppUnified"}
CONFIGURATION=${2:-"Release"}
EXPORT_METHOD=${3:-"development"}

echo "🚀 开始 iOS 打包流程..."
echo "项目: $PROJECT_NAME"
echo "配置: $CONFIGURATION"
echo "导出方式: $EXPORT_METHOD"

# 检查项目是否存在
if [ ! -d "$PROJECT_NAME" ]; then
    echo "❌ 项目目录 $PROJECT_NAME 不存在"
    exit 1
fi

# 进入项目目录
cd "$PROJECT_NAME"

echo "📦 安装依赖..."
npm install

echo "🍎 安装 iOS 依赖..."
cd ios
pod install --repo-update
cd ..

echo "🔨 构建项目..."
# 创建构建目录
mkdir -p ../build

# 构建 Archive
xcodebuild archive \
    -workspace "ios/$PROJECT_NAME.xcworkspace" \
    -scheme "$PROJECT_NAME" \
    -configuration "$CONFIGURATION" \
    -archivePath "../build/$PROJECT_NAME.xcarchive" \
    -allowProvisioningUpdates

if [ $? -ne 0 ]; then
    echo "❌ Archive 构建失败"
    exit 1
fi

echo "📦 导出 IPA..."
# 导出 IPA
xcodebuild -exportArchive \
    -archivePath "../build/$PROJECT_NAME.xcarchive" \
    -exportPath "../build/ipa" \
    -exportOptionsPlist "ios/ExportOptions.plist" \
    -allowProvisioningUpdates

if [ $? -ne 0 ]; then
    echo "❌ IPA 导出失败"
    exit 1
fi

echo "✅ 构建完成！"
echo "📱 IPA 文件位置: ../build/ipa/$PROJECT_NAME.ipa"