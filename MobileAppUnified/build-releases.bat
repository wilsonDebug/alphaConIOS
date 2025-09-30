@echo off
echo ========================================
echo 🚀 MobileApp Unified - 构建发布版本
echo ========================================

echo.
echo 📱 开始构建Android Release版本...
echo ----------------------------------------

cd android
call gradlew.bat clean
call gradlew.bat assembleRelease

if exist "app\build\outputs\apk\release\app-release.apk" (
    echo ✅ Android APK构建成功！
    echo 📁 位置: android\app\build\outputs\apk\release\app-release.apk
    
    REM 复制到apk目录
    if not exist "..\..\..\apk" mkdir "..\..\..\apk"
    copy "app\build\outputs\apk\release\app-release.apk" "..\..\..\apk\MobileAppUnified-v1.0-CrossPlatform-RELEASE.apk"
    echo ✅ APK已复制到: apk\MobileAppUnified-v1.0-CrossPlatform-RELEASE.apk
) else (
    echo ❌ Android APK构建失败！
)

cd ..

echo.
echo 🍎 iOS版本构建说明
echo ----------------------------------------
echo iOS版本需要在Mac环境中构建：
echo 1. 在Mac上运行: cd ios ^&^& pod install
echo 2. 使用Xcode打开: ios/MobileAppUnified.xcworkspace
echo 3. 选择 Product ^> Archive 构建IPA文件
echo 4. 上传到App Store Connect或导出IPA文件

echo.
echo ========================================
echo 🎉 构建完成！
echo ========================================

pause
