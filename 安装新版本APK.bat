@echo off
chcp 65001 >nul
title 安装MobileAppUnified v1.6 - 生物识别修复版

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║           MobileAppUnified v1.6 - 生物识别修复版            ║
echo ║                    模拟器环境优化版本                        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM 设置Android SDK路径
set ANDROID_HOME=D:\Android\Sdk
set ADB=%ANDROID_HOME%\platform-tools\adb.exe

echo 🔍 检查ADB连接...
"%ADB%" devices
echo.

echo 📦 安装新版本APK...
echo 正在安装: MobileAppUnified\android\app\build\outputs\apk\release\app-release.apk
"%ADB%" install -r "MobileAppUnified\android\app\build\outputs\apk\release\app-release.apk"

if %ERRORLEVEL% EQU 0 (
    echo ✅ APK安装成功！
    echo.
    echo 🚀 启动应用...
    "%ADB%" shell am start -n com.mobileappunified/.MainActivity
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ 应用启动成功！
        echo.
        echo ╔══════════════════════════════════════════════════════════════╗
        echo ║                    v1.6版本新功能                           ║
        echo ╠══════════════════════════════════════════════════════════════╣
        echo ║  🔧 生物识别模拟器支持: 在模拟器中提供模拟生物识别功能      ║
        echo ║  👆 指纹识别优化: 改进指纹识别错误处理                      ║
        echo ║  😊 人脸识别优化: 改进人脸识别错误处理                      ║
        echo ║  🎯 模拟器友好: 专门为模拟器环境优化                        ║
        echo ║                                                              ║
        echo ║  📱 测试步骤:                                                ║
        echo ║  1. 登录 (admin/1)                                          ║
        echo ║  2. 点击"设置人脸识别" - 选择"启用模拟功能"                 ║
        echo ║  3. 点击"设置指纹识别" - 选择"启用模拟功能"                 ║
        echo ║  4. 退出登录后使用生物识别登录 - 选择"模拟登录"             ║
        echo ╚══════════════════════════════════════════════════════════════╝
    ) else (
        echo ❌ 应用启动失败！
    )
) else (
    echo ❌ APK安装失败！请检查设备连接。
)

echo.
pause
