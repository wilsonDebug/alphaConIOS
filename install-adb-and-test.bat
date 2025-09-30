@echo off
echo ========================================
echo 📱 Android APK测试 - ADB安装方案
echo ========================================

echo.
echo 🔍 检查ADB工具...
adb version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到ADB工具
    echo.
    echo 📦 ADB工具安装选项:
    echo.
    echo 选项1: 安装Android Studio（推荐）
    echo - 下载: https://developer.android.com/studio
    echo - 安装后ADB会自动可用
    echo.
    echo 选项2: 仅安装SDK Platform Tools
    echo - 下载: https://developer.android.com/studio/releases/platform-tools
    echo - 解压后将目录添加到PATH环境变量
    echo.
    echo 选项3: 使用便携版ADB
    echo - 下载: https://dl.google.com/android/repository/platform-tools-latest-windows.zip
    echo - 解压到当前目录
    echo.
    echo 💡 或者使用直接安装方法（见Android APK测试指南.md）
    pause
    exit /b 1
)

echo ✅ ADB工具已找到

echo.
echo 📱 检查Android设备连接...
adb devices

echo.
echo 📦 安装APK...
if exist "apk\MobileAppUnified-v1.0-CrossPlatform-DEBUG.apk" (
    echo 正在安装APK到设备...
    adb install -r "apk\MobileAppUnified-v1.0-CrossPlatform-DEBUG.apk"
    
    if errorlevel 1 (
        echo ❌ 安装失败
        echo 请检查设备连接和权限设置
    ) else (
        echo ✅ 安装成功
        echo.
        echo 🚀 启动应用...
        adb shell am start -n com.mobileappunified/.MainActivity
    )
) else (
    echo ❌ APK文件不存在
    echo 请先构建APK文件
)

pause
