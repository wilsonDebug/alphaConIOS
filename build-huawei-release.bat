@echo off
echo ========================================
echo 📱 华为设备专用 Release APK 构建
echo ========================================

echo.
echo 🎯 构建目标:
echo - 华为 Meta 60 Pro 兼容
echo - Release 签名版本
echo - 优化性能和兼容性

echo.
echo 📋 构建信息:
echo - 项目: MobileApp Unified
echo - 版本: v1.0.0 Release
echo - 签名: 专用Release密钥
echo - 优化: 华为设备优化

echo.
echo 🔧 检查构建环境...

REM 检查项目目录
if not exist "MobileAppUnified\android" (
    echo ❌ 错误：未找到Android项目目录
    echo 请确保在正确的项目根目录运行此脚本
    pause
    exit /b 1
)

echo ✅ 项目目录检查通过

REM 检查密钥库文件
if not exist "MobileAppUnified\android\app\mobileapp-release-key.keystore" (
    echo ❌ 错误：未找到Release密钥库文件
    echo 正在创建Release密钥库...
    
    cd MobileAppUnified\android\app
    keytool -genkey -v -keystore mobileapp-release-key.keystore -alias mobileapp-key-alias -keyalg RSA -keysize 2048 -validity 10000 -storepass mobileapp123 -keypass mobileapp123 -dname "CN=MobileApp, OU=Development, O=MobileApp, L=City, S=State, C=CN"
    
    if errorlevel 1 (
        echo ❌ 密钥库创建失败
        cd ..\..\..
        pause
        exit /b 1
    )
    
    echo ✅ Release密钥库创建成功
    cd ..\..\..
)

echo ✅ Release密钥库检查通过

echo.
echo 🧹 清理构建缓存...
cd MobileAppUnified\android
call .\gradlew.bat clean

if errorlevel 1 (
    echo ❌ 清理失败
    cd ..\..
    pause
    exit /b 1
)

echo ✅ 构建缓存清理完成

echo.
echo 🔨 开始构建Release APK...
echo 这可能需要10-20分钟，请耐心等待...
echo ----------------------------------------

call .\gradlew.bat assembleRelease

if errorlevel 1 (
    echo ❌ Release APK构建失败！
    echo.
    echo 🔧 可能的解决方案：
    echo 1. 检查Java版本（推荐Java 17）
    echo 2. 检查Android SDK配置
    echo 3. 清理项目后重试
    echo 4. 检查网络连接（下载依赖）
    cd ..\..
    pause
    exit /b 1
)

echo ✅ Release APK构建成功！

echo.
echo 📁 检查生成的APK文件...

if exist "app\build\outputs\apk\release\app-release.apk" (
    echo ✅ 找到Release APK文件
    
    REM 复制到发布目录
    echo 📦 复制APK到发布目录...
    copy "app\build\outputs\apk\release\app-release.apk" "..\..\apk\MobileAppUnified-v1.0-HUAWEI-RELEASE.apk"
    
    if errorlevel 1 (
        echo ⚠️ 复制失败，但APK已生成
        echo APK位置: MobileAppUnified\android\app\build\outputs\apk\release\app-release.apk
    ) else (
        echo ✅ APK已复制到: apk\MobileAppUnified-v1.0-HUAWEI-RELEASE.apk
    )
    
    REM 显示APK信息
    echo.
    echo 📊 APK文件信息:
    for %%A in ("..\..\apk\MobileAppUnified-v1.0-HUAWEI-RELEASE.apk") do (
        set size=%%~zA
        set /a sizeMB=!size!/1024/1024
        echo - 文件大小: !sizeMB! MB
        echo - 生成时间: %%~tA
    )
    
) else (
    echo ❌ 未找到Release APK文件
    echo 请检查构建日志中的错误信息
    cd ..\..
    pause
    exit /b 1
)

cd ..\..

echo.
echo ========================================
echo 🎉 华为设备Release APK构建完成！
echo ========================================

echo.
echo 📱 APK文件信息:
echo - 文件名: MobileAppUnified-v1.0-HUAWEI-RELEASE.apk
echo - 位置: apk\MobileAppUnified-v1.0-HUAWEI-RELEASE.apk
echo - 类型: Release签名版本
echo - 目标设备: 华为 Meta 60 Pro

echo.
echo 🚀 安装到华为设备:
echo 1. 方法一: 直接安装
echo    - 将APK复制到华为设备
echo    - 在设备上安装APK文件
echo.
echo 2. 方法二: ADB安装
echo    adb install "apk\MobileAppUnified-v1.0-HUAWEI-RELEASE.apk"

echo.
echo 🧪 测试功能清单:
echo - 🔐 登录系统 (admin/1)
echo - 📱 生物识别登录
echo - 🔍 GPS坐标获取
echo - 🌐 WebView网页浏览
echo - 🗺️ 高德地图定位
echo - 📱 相机扫码功能

echo.
echo 💡 华为设备优化特性:
echo - ✅ Release签名，确保安装兼容性
echo - ✅ 禁用代码混淆，提高稳定性
echo - ✅ 优化资源打包，减少安装问题
echo - ✅ 启用ZIP对齐，提升运行性能

echo.
echo 📋 下一步操作:
echo 1. 测试APK在华为设备上的安装和运行
echo 2. 验证所有功能正常工作
echo 3. 如果测试通过，可以开始iOS版本构建
echo 4. 记录测试结果和发现的问题

echo.
pause
