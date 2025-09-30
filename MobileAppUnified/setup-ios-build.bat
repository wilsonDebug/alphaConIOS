@echo off
echo ========================================
echo 🍎 iOS构建环境配置 - EAS Build
echo ========================================

echo.
echo 📱 准备iOS云端构建环境...
echo ----------------------------------------

REM 检查Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到Node.js！
    echo 请先安装Node.js: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js已安装

REM 检查npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误：未找到npm！
    pause
    exit /b 1
)

echo ✅ npm已安装

echo.
echo 📦 安装EAS CLI...
echo ----------------------------------------

REM 安装EAS CLI
call npm install -g @expo/eas-cli

if errorlevel 1 (
    echo ❌ EAS CLI安装失败！
    pause
    exit /b 1
)

echo ✅ EAS CLI安装成功

echo.
echo 🔐 配置Expo账号...
echo ----------------------------------------

echo 请在浏览器中登录Expo账号，然后返回终端...
call eas login

if errorlevel 1 (
    echo ❌ Expo登录失败！
    echo 请确保网络连接正常，并拥有有效的Expo账号
    pause
    exit /b 1
)

echo ✅ Expo账号登录成功

echo.
echo ⚙️ 初始化EAS配置...
echo ----------------------------------------

REM 创建eas.json配置文件
if not exist "eas.json" (
    echo 创建eas.json配置文件...
    (
        echo {
        echo   "cli": {
        echo     "version": "^= 5.9.0"
        echo   },
        echo   "build": {
        echo     "development": {
        echo       "developmentClient": true,
        echo       "distribution": "internal",
        echo       "ios": {
        echo         "resourceClass": "m-medium"
        echo       }
        echo     },
        echo     "preview": {
        echo       "distribution": "internal",
        echo       "ios": {
        echo         "resourceClass": "m-medium"
        echo       }
        echo     },
        echo     "production": {
        echo       "ios": {
        echo         "resourceClass": "m-medium"
        echo       }
        echo     }
        echo   },
        echo   "submit": {
        echo     "production": {}
        echo   }
        echo }
    ) > eas.json
    echo ✅ eas.json配置文件已创建
) else (
    echo ✅ eas.json配置文件已存在
)

REM 配置EAS构建
call eas build:configure

if errorlevel 1 (
    echo ❌ EAS配置失败！
    pause
    exit /b 1
)

echo ✅ EAS构建配置完成

echo.
echo 🚀 开始iOS构建...
echo ----------------------------------------

echo 选择构建类型：
echo 1. 开发版本 (development)
echo 2. 预览版本 (preview) 
echo 3. 生产版本 (production)
echo.

set /p choice="请选择 (1-3): "

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
echo 🔨 开始云端构建iOS应用...
echo 这可能需要10-20分钟，请耐心等待...
echo ----------------------------------------

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
echo 📱 构建结果：
echo - 构建平台：iOS
echo - 构建配置：%profile%
echo - 查看结果：https://expo.dev/accounts/[your-account]/projects/mobileappunified/builds
echo.

echo 🚀 下一步操作：
echo 1. 在Expo Dashboard查看构建状态
echo 2. 下载生成的IPA文件
echo 3. 使用TestFlight进行测试
echo 4. 提交到App Store审核

echo.
echo 💡 提示：
echo - 免费账号每月有10次构建限制
echo - 需要Apple Developer账号才能发布到App Store
echo - 可以使用TestFlight进行内部测试

echo.
pause
