@echo off
chcp 65001 >nul
title MobileAppUnified v1.5 快速启动

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                MobileAppUnified v1.5 快速启动                ║
echo ║                     Release版本测试工具                      ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM 设置Android SDK路径
set ANDROID_HOME=D:\Android\Sdk
set ADB=%ANDROID_HOME%\platform-tools\adb.exe
set EMULATOR=%ANDROID_HOME%\emulator\emulator.exe

echo 🔍 检查环境配置...
if not exist "%ADB%" (
    echo ❌ 错误: ADB工具未找到
    echo    请确认Android SDK已正确安装在: %ANDROID_HOME%
    pause
    exit /b 1
)

if not exist "apk\MobileAppUnified-v1.5-BottomNavigation-RELEASE.apk" (
    echo ❌ 错误: APK文件未找到
    echo    请确认APK文件存在: apk\MobileAppUnified-v1.5-BottomNavigation-RELEASE.apk
    pause
    exit /b 1
)

echo ✅ 环境检查完成
echo.

:MENU
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                        选择操作                             ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  1. 检查连接的设备                                          ║
echo ║  2. 启动Android模拟器                                       ║
echo ║  3. 安装APK到设备                                           ║
echo ║  4. 启动MobileAppUnified应用                                 ║
echo ║  5. 查看应用日志                                            ║
echo ║  6. 卸载应用                                                ║
echo ║  7. 完整测试流程 (推荐)                                     ║
echo ║  8. 打开测试指南                                            ║
echo ║  0. 退出                                                    ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
set /p choice=请选择操作 (0-8): 

if "%choice%"=="1" goto CHECK_DEVICES
if "%choice%"=="2" goto START_EMULATOR
if "%choice%"=="3" goto INSTALL_APK
if "%choice%"=="4" goto START_APP
if "%choice%"=="5" goto VIEW_LOGS
if "%choice%"=="6" goto UNINSTALL_APP
if "%choice%"=="7" goto FULL_TEST
if "%choice%"=="8" goto OPEN_GUIDE
if "%choice%"=="0" goto EXIT
goto MENU

:CHECK_DEVICES
echo.
echo 📱 检查连接的设备...
"%ADB%" devices
echo.
pause
goto MENU

:START_EMULATOR
echo.
echo 🚀 启动Android模拟器...
echo 可用的模拟器:
"%EMULATOR%" -list-avds
echo.
echo 正在启动Pixel_7_API_33模拟器...
start "" "%EMULATOR%" -avd Pixel_7_API_33
echo 模拟器正在启动，请等待约30-60秒...
echo.
pause
goto MENU

:INSTALL_APK
echo.
echo 📦 安装APK到设备...
echo 正在安装: MobileAppUnified-v1.5-BottomNavigation-RELEASE.apk
"%ADB%" install -r "apk\MobileAppUnified-v1.5-BottomNavigation-RELEASE.apk"
if %ERRORLEVEL% EQU 0 (
    echo ✅ APK安装成功！
) else (
    echo ❌ APK安装失败！请检查设备连接。
)
echo.
pause
goto MENU

:START_APP
echo.
echo 🚀 启动MobileAppUnified应用...
"%ADB%" shell am start -n com.mobileappunified/.MainActivity
if %ERRORLEVEL% EQU 0 (
    echo ✅ 应用启动成功！
    echo 📱 请在设备上查看应用界面
    echo 🔑 登录信息: 用户名=admin, 密码=1
) else (
    echo ❌ 应用启动失败！请确认APK已安装。
)
echo.
pause
goto MENU

:VIEW_LOGS
echo.
echo 📋 查看应用日志...
echo 按Ctrl+C停止日志查看
echo.
"%ADB%" logcat -s ReactNativeJS
pause
goto MENU

:UNINSTALL_APP
echo.
echo 🗑️ 卸载应用...
"%ADB%" uninstall com.mobileappunified
if %ERRORLEVEL% EQU 0 (
    echo ✅ 应用卸载成功！
) else (
    echo ❌ 应用卸载失败或应用未安装。
)
echo.
pause
goto MENU

:FULL_TEST
echo.
echo 🧪 开始完整测试流程...
echo.
echo 步骤1: 检查设备连接
"%ADB%" devices
echo.

echo 步骤2: 安装APK
echo 正在安装APK...
"%ADB%" install -r "apk\MobileAppUnified-v1.5-BottomNavigation-RELEASE.apk"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ APK安装失败！
    pause
    goto MENU
)
echo ✅ APK安装成功
echo.

echo 步骤3: 启动应用
echo 正在启动应用...
"%ADB%" shell am start -n com.mobileappunified/.MainActivity
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 应用启动失败！
    pause
    goto MENU
)
echo ✅ 应用启动成功
echo.

echo ╔══════════════════════════════════════════════════════════════╗
echo ║                      测试完成！                             ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  📱 请在设备上进行以下测试:                                  ║
echo ║                                                              ║
echo ║  1. 登录测试 (admin/1)                                      ║
echo ║  2. 底部导航功能测试                                        ║
echo ║  3. 相机权限测试 (重点!)                                    ║
echo ║  4. 人脸识别功能测试                                        ║
echo ║  5. 指纹识别功能测试                                        ║
echo ║  6. 二维码扫描功能测试                                      ║
echo ║  7. 位置服务功能测试                                        ║
echo ║                                                              ║
echo ║  📋 详细测试步骤请查看: 手动测试指南.md                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
pause
goto MENU

:OPEN_GUIDE
echo.
echo 📖 打开测试指南...
if exist "手动测试指南.md" (
    start "" "手动测试指南.md"
    echo ✅ 测试指南已打开
) else (
    echo ❌ 测试指南文件未找到: 手动测试指南.md
)
echo.
pause
goto MENU

:EXIT
echo.
echo 👋 感谢使用MobileAppUnified测试工具！
echo 📋 测试结果请参考: APK测试报告.md
echo 📖 详细指南请查看: 手动测试指南.md
echo.
pause
exit /b 0
