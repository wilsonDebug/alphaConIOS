@echo off
echo ========================================
echo 🚀 MobileApp Unified - 快速构建
echo ========================================

echo.
echo 📱 准备构建环境...
echo ----------------------------------------

REM 停止Metro服务器
taskkill /f /im node.exe 2>nul

REM 清理缓存
echo 🧹 清理构建缓存...
rmdir /s /q node_modules\.cache 2>nul
rmdir /s /q android\build 2>nul
rmdir /s /q android\app\build 2>nul

echo.
echo 📦 重新安装依赖...
call npm install --production

echo.
echo 🔨 构建Android Release版本...
echo ----------------------------------------

cd android

REM 清理Gradle缓存
call gradlew.bat clean

REM 构建Release APK
call gradlew.bat assembleRelease --no-daemon --parallel

if exist "app\build\outputs\apk\release\app-release.apk" (
    echo.
    echo ✅ Android APK构建成功！
    echo 📁 APK位置: android\app\build\outputs\apk\release\app-release.apk
    
    REM 获取APK大小
    for %%A in ("app\build\outputs\apk\release\app-release.apk") do set size=%%~zA
    set /a sizeMB=%size%/1024/1024
    echo 📊 APK大小: %sizeMB% MB
    
    REM 复制到发布目录
    if not exist "..\..\..\apk" mkdir "..\..\..\apk"
    copy "app\build\outputs\apk\release\app-release.apk" "..\..\..\apk\MobileAppUnified-v1.0-CrossPlatform-RELEASE.apk"
    
    echo.
    echo ✅ APK已复制到发布目录:
    echo 📁 apk\MobileAppUnified-v1.0-CrossPlatform-RELEASE.apk
    
    echo.
    echo 🎉 Android版本构建完成！
    echo ========================================
    
) else (
    echo.
    echo ❌ Android APK构建失败！
    echo 请检查构建日志中的错误信息。
    echo ========================================
)

cd ..

echo.
echo 📱 构建总结:
echo ----------------------------------------
if exist "..\apk\MobileAppUnified-v1.0-CrossPlatform-RELEASE.apk" (
    echo ✅ Android APK: 构建成功
    echo 📁 位置: apk\MobileAppUnified-v1.0-CrossPlatform-RELEASE.apk
) else (
    echo ❌ Android APK: 构建失败
)

echo 🍎 iOS IPA: 需要Mac环境构建
echo 📁 使用脚本: build-ios.sh

echo.
echo 🚀 下一步操作:
echo 1. 测试Android APK文件
echo 2. 在Mac上构建iOS版本
echo 3. 发布到应用商店

echo.
pause
