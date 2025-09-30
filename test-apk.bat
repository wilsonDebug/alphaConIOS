@echo off
echo 🚀 开始测试APK...

REM 设置Android SDK路径
set ANDROID_HOME=D:\Android\Sdk
set ADB=%ANDROID_HOME%\platform-tools\adb.exe
set EMULATOR=%ANDROID_HOME%\emulator\emulator.exe

echo 📱 检查ADB连接...
"%ADB%" devices

echo 🔍 检查可用模拟器...
"%EMULATOR%" -list-avds

echo 📦 安装APK...
"%ADB%" install -r "apk\MobileAppUnified-v1.5-BottomNavigation-RELEASE.apk"

echo 🚀 启动应用...
"%ADB%" shell am start -n com.mobileappunified/.MainActivity

echo ✅ APK测试完成！
echo 请在模拟器中测试以下功能：
echo 1. 登录功能 (admin/1)
echo 2. 相机权限测试
echo 3. 人脸识别功能
echo 4. 二维码扫描
echo 5. 位置服务

pause
