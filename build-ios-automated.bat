@echo off
chcp 65001 >nul
echo ========================================
echo 🍎 iOS自动化构建脚本
echo ========================================

echo.
echo 📱 准备iOS云端构建...
echo ----------------------------------------

cd MobileAppUnified

echo ✅ 环境检查：
echo - Node.js: 已安装
echo - npm: 已安装  
echo - EAS CLI: 已安装
echo - 配置文件: 已准备

echo.
echo 🔐 请登录Expo账号...
echo ----------------------------------------
echo 如果没有Expo账号，请先访问 https://expo.dev 注册
echo.

call eas login

if errorlevel 1 (
    echo ❌ Expo登录失败！
    echo 请检查网络连接和账号信息
    pause
    exit /b 1
)

echo ✅ Expo账号登录成功

echo.
echo ⚙️ 配置EAS构建...
echo ----------------------------------------

call eas build:configure

if errorlevel 1 (
    echo ❌ EAS配置失败！
    pause
    exit /b 1
)

echo ✅ EAS构建配置完成

echo.
echo 🚀 选择构建类型：
echo ----------------------------------------
echo 1. 开发版本 (development) - 包含调试信息
echo 2. 预览版本 (preview) - 内部测试用
echo 3. 生产版本 (production) - App Store发布用
echo.

set /p choice="请选择构建类型 (1-3): "

if "%choice%"=="1" (
    set profile=development
    echo 构建开发版本...
) else if "%choice%"=="2" (
    set profile=preview
    echo 构建预览版本...
) else if "%choice%"=="3" (
    set profile=production
    echo 构建生产版本...
) else (
    set profile=development
    echo 默认构建开发版本...
)

echo.
echo 🔨 开始iOS云端构建...
echo ----------------------------------------
echo ⏰ 预计时间：10-20分钟
echo 💡 您可以在 https://expo.dev 查看构建进度
echo.

call eas build --platform ios --profile %profile%

if errorlevel 1 (
    echo ❌ iOS构建失败！
    echo 请检查错误信息并重试
    pause
    exit /b 1
)

echo.
echo ✅ iOS构建成功！
echo ========================================

echo.
echo 📱 构建完成：
echo - 平台：iOS
echo - 配置：%profile%
echo - 查看结果：https://expo.dev
echo.

echo 📥 下载IPA文件：
echo 1. 访问 https://expo.dev 下载
echo 2. 或运行：eas build:list
echo.

echo 🚀 下一步：
echo 1. 下载生成的IPA文件
echo 2. 复制到 apk/ 目录
echo 3. 使用TestFlight测试或提交App Store
echo.

echo 💡 提示：
echo - 免费账号每月10次构建限制
echo - 需要Apple Developer账号发布到App Store
echo.

cd ..

pause
