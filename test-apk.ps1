# APK测试脚本
# 用于测试MobileAppUnified Release版本

Write-Host "🚀 开始测试APK..." -ForegroundColor Green

# 设置Android SDK路径
$env:ANDROID_HOME = "D:\Android\Sdk"
$adb = "$env:ANDROID_HOME\platform-tools\adb.exe"
$emulator = "$env:ANDROID_HOME\emulator\emulator.exe"

# 检查ADB是否可用
Write-Host "📱 检查ADB连接..." -ForegroundColor Yellow
& $adb devices

# 检查可用的模拟器
Write-Host "🔍 检查可用模拟器..." -ForegroundColor Yellow
& $emulator -list-avds

# 安装最新的Release APK
$apkPath = "apk\MobileAppUnified-v1.5-BottomNavigation-RELEASE.apk"
if (Test-Path $apkPath) {
    Write-Host "📦 安装APK: $apkPath" -ForegroundColor Green
    & $adb install -r $apkPath
    
    # 启动应用
    Write-Host "🚀 启动应用..." -ForegroundColor Green
    & $adb shell am start -n com.mobileappunified/.MainActivity
    
    Write-Host "✅ APK测试完成！" -ForegroundColor Green
    Write-Host "请在模拟器中测试以下功能：" -ForegroundColor Cyan
    Write-Host "1. 登录功能 (admin/1)" -ForegroundColor White
    Write-Host "2. 相机权限测试" -ForegroundColor White
    Write-Host "3. 人脸识别功能" -ForegroundColor White
    Write-Host "4. 二维码扫描" -ForegroundColor White
    Write-Host "5. 位置服务" -ForegroundColor White
} else {
    Write-Host "❌ APK文件不存在: $apkPath" -ForegroundColor Red
}

Write-Host "📋 测试完成！" -ForegroundColor Green
