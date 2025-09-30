#!/bin/bash

echo "========================================"
echo "🍎 MobileApp Unified - iOS构建脚本"
echo "========================================"

echo ""
echo "📱 开始构建iOS版本..."
echo "----------------------------------------"

# 检查是否在Mac环境
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ 错误：iOS构建需要在Mac环境中进行！"
    echo "请在Mac上运行此脚本。"
    exit 1
fi

# 检查Xcode是否安装
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ 错误：未找到Xcode！"
    echo "请先安装Xcode。"
    exit 1
fi

# 检查CocoaPods是否安装
if ! command -v pod &> /dev/null; then
    echo "❌ 错误：未找到CocoaPods！"
    echo "请先安装CocoaPods: sudo gem install cocoapods"
    exit 1
fi

echo "✅ 环境检查通过"

# 安装iOS依赖
echo ""
echo "📦 安装iOS依赖..."
cd ios
pod install

if [ $? -eq 0 ]; then
    echo "✅ iOS依赖安装成功！"
else
    echo "❌ iOS依赖安装失败！"
    exit 1
fi

# 构建iOS项目
echo ""
echo "🔨 构建iOS项目..."

# 构建Release版本
xcodebuild -workspace MobileAppUnified.xcworkspace \
           -scheme MobileAppUnified \
           -configuration Release \
           -destination generic/platform=iOS \
           -archivePath build/MobileAppUnified.xcarchive \
           archive

if [ $? -eq 0 ]; then
    echo "✅ iOS Archive构建成功！"
    
    # 导出IPA文件
    echo ""
    echo "📦 导出IPA文件..."
    
    # 创建导出配置文件
    cat > ExportOptions.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>ad-hoc</string>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
    <key>compileBitcode</key>
    <false/>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
</dict>
</plist>
EOF

    xcodebuild -exportArchive \
               -archivePath build/MobileAppUnified.xcarchive \
               -exportPath build/ipa \
               -exportOptionsPlist ExportOptions.plist

    if [ $? -eq 0 ]; then
        echo "✅ IPA文件导出成功！"
        echo "📁 位置: ios/build/ipa/MobileAppUnified.ipa"
        
        # 复制到apk目录
        cd ..
        mkdir -p ../../../apk
        cp ios/build/ipa/MobileAppUnified.ipa ../../../apk/MobileAppUnified-v1.0-CrossPlatform-iOS.ipa
        echo "✅ IPA已复制到: apk/MobileAppUnified-v1.0-CrossPlatform-iOS.ipa"
    else
        echo "❌ IPA文件导出失败！"
    fi
else
    echo "❌ iOS Archive构建失败！"
fi

cd ..

echo ""
echo "========================================"
echo "🎉 iOS构建完成！"
echo "========================================"

echo ""
echo "📱 构建结果："
echo "- Archive: ios/build/MobileAppUnified.xcarchive"
echo "- IPA文件: ios/build/ipa/MobileAppUnified.ipa"
echo ""
echo "🚀 下一步："
echo "1. 使用Xcode打开Archive进行进一步配置"
echo "2. 上传到App Store Connect"
echo "3. 或直接使用IPA文件进行测试分发"
