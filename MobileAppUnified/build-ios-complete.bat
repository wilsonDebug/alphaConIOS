@echo off
echo ========================================
echo 🍎 iOS构建完整流程脚本
echo ========================================
echo.

echo 📋 检查环境...
echo.

REM 检查Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js未安装，请先安装Node.js
    pause
    exit /b 1
)
echo ✅ Node.js: 
node --version

REM 检查npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm未安装
    pause
    exit /b 1
)
echo ✅ npm: 
npm --version

REM 检查EAS CLI
eas --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ EAS CLI未安装，正在安装...
    npm install -g @expo/eas-cli
    if %errorlevel% neq 0 (
        echo ❌ EAS CLI安装失败
        pause
        exit /b 1
    )
)
echo ✅ EAS CLI: 
eas --version

echo.
echo 🔐 检查登录状态...
eas whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未登录Expo账号
    echo 📝 请先注册Expo账号: https://expo.dev/signup
    echo 🔑 然后运行登录命令: eas login
    echo.
    echo 是否现在登录? (y/n)
    set /p login_choice=
    if /i "%login_choice%"=="y" (
        eas login
        if %errorlevel% neq 0 (
            echo ❌ 登录失败
            pause
            exit /b 1
        )
    ) else (
        echo ⚠️  跳过登录，无法进行云端构建
        pause
        exit /b 1
    )
)

echo ✅ 已登录用户: 
eas whoami

echo.
echo 🏗️  开始iOS构建...
echo.

echo 📱 选择构建类型:
echo 1. Development (开发版)
echo 2. Preview (预览版)  
echo 3. Production (生产版)
echo.
set /p build_type=请选择构建类型 (1-3): 

if "%build_type%"=="1" (
    set build_profile=development
    echo 🔧 构建开发版...
) else if "%build_type%"=="2" (
    set build_profile=preview
    echo 👀 构建预览版...
) else if "%build_type%"=="3" (
    set build_profile=production
    echo 🚀 构建生产版...
) else (
    echo ❌ 无效选择，默认使用预览版
    set build_profile=preview
)

echo.
echo 🍎 开始iOS云端构建...
echo ⏱️  预计时间: 10-20分钟
echo 📊 构建进度可在Expo Dashboard查看: https://expo.dev/
echo.

eas build --platform ios --profile %build_profile%

if %errorlevel% neq 0 (
    echo.
    echo ❌ iOS构建失败
    echo 💡 常见解决方案:
    echo    1. 检查网络连接
    echo    2. 确认Expo账号有效
    echo    3. 检查项目配置文件
    echo    4. 查看构建日志获取详细错误信息
    echo.
    pause
    exit /b 1
)

echo.
echo 🎉 iOS构建完成！
echo.
echo 📱 下载IPA文件:
echo    1. 访问 https://expo.dev/
echo    2. 登录您的账号
echo    3. 进入项目页面
echo    4. 在Builds页面下载IPA文件
echo.
echo 📲 安装到设备:
echo    1. 使用TestFlight (需要Apple Developer账号)
echo    2. 使用第三方工具如AltStore
echo    3. 使用企业证书分发
echo.
echo ✅ iOS构建流程完成！
pause
