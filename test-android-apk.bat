@echo off
echo ========================================
echo 📱 MobileApp Unified - Android APK测试
echo ========================================

echo.
echo 📱 APK文件信息:
echo 文件名: MobileAppUnified-v1.0-CrossPlatform-DEBUG.apk
echo 位置: apk\MobileAppUnified-v1.0-CrossPlatform-DEBUG.apk
echo 版本: v1.0.0 Debug版本
echo 包名: com.mobileappunified

echo.
echo 🔍 检查APK文件是否存在...
if exist "apk\MobileAppUnified-v1.0-CrossPlatform-DEBUG.apk" (
    echo ✅ APK文件存在
    for %%A in ("apk\MobileAppUnified-v1.0-CrossPlatform-DEBUG.apk") do (
        set size=%%~zA
        set /a sizeMB=!size!/1024/1024
        echo 📊 文件大小: !sizeMB! MB
    )
) else (
    echo ❌ APK文件不存在！
    echo 请先运行构建脚本生成APK文件
    pause
    exit /b 1
)

echo.
echo 🔌 检查ADB连接...
adb version >nul 2>&1
if errorlevel 1 (
    echo ❌ 未找到ADB工具！
    echo 请安装Android SDK或Android Studio
    echo 或将ADB添加到系统PATH环境变量
    echo.
    echo 💡 替代方案：
    echo 1. 将APK文件复制到Android设备
    echo 2. 在设备上直接安装APK文件
    pause
    exit /b 1
)

echo ✅ ADB工具已找到

echo.
echo 📱 检查Android设备连接...
adb devices > temp_devices.txt
findstr /C:"device" temp_devices.txt | findstr /V /C:"List of devices" > nul
if errorlevel 1 (
    echo ❌ 未检测到Android设备！
    echo.
    echo 📋 请检查以下设置：
    echo 1. USB线连接设备到电脑
    echo 2. 启用开发者选项（设置→关于手机→连续点击版本号7次）
    echo 3. 启用USB调试（开发者选项→USB调试）
    echo 4. 允许USB调试授权（设备上弹出的对话框）
    echo.
    echo 🔄 设置完成后请重新运行此脚本
    del temp_devices.txt
    pause
    exit /b 1
)

echo ✅ 检测到Android设备
adb devices
del temp_devices.txt

echo.
echo 🗑️ 卸载旧版本（如果存在）...
adb uninstall com.mobileappunified >nul 2>&1
echo ✅ 清理完成

echo.
echo 📦 安装APK到设备...
echo 正在安装，请稍候...
adb install "apk\MobileAppUnified-v1.0-CrossPlatform-DEBUG.apk"

if errorlevel 1 (
    echo ❌ APK安装失败！
    echo.
    echo 🔧 可能的解决方案：
    echo 1. 检查设备存储空间是否充足
    echo 2. 检查是否允许安装未知来源应用
    echo 3. 尝试重启设备后重新安装
    echo 4. 检查Android版本是否支持（需要Android 6.0+）
    pause
    exit /b 1
)

echo ✅ APK安装成功！

echo.
echo 🚀 启动应用...
adb shell am start -n com.mobileappunified/.MainActivity

if errorlevel 1 (
    echo ⚠️ 自动启动失败，请手动在设备上启动应用
) else (
    echo ✅ 应用已启动
)

echo.
echo 📋 测试功能清单:
echo ----------------------------------------
echo 🔐 登录功能测试:
echo   - 用户名: admin
echo   - 密码: 1
echo   - 测试生物识别登录
echo.
echo 📱 主界面功能测试:
echo   - 🔍 获取GPS坐标
echo   - 📱 扫描二维码
echo   - 🌐 WebQR.com扫描
echo   - 🗺️ 高德地图定位
echo   - 🌍 网页高德查经纬度
echo   - 😊 设置人脸识别
echo   - 👆 设置指纹识别
echo.
echo 🌐 WebView功能测试:
echo   - 网页正常加载
echo   - 返回按钮功能
echo   - 地理位置权限授权
echo.
echo 🔒 权限测试:
echo   - 相机权限请求
echo   - 位置权限请求
echo   - 生物识别权限请求

echo.
echo 📊 性能观察:
echo   - 启动速度（目标 < 3秒）
echo   - 界面响应（应该流畅无卡顿）
echo   - 内存使用（目标 < 100MB）

echo.
echo 🐛 如果遇到问题，可以查看日志:
echo adb logcat ^| findstr MobileAppUnified

echo.
echo 📱 测试完成后的操作:
echo 1. 记录测试结果
echo 2. 报告发现的问题
echo 3. 如果测试通过，可以开始iOS版本构建

echo.
echo ========================================
echo 🎉 Android APK测试准备完成！
echo ========================================

echo.
echo 💡 提示：
echo - 应用已安装到设备，请在设备上进行功能测试
echo - 测试过程中注意观察应用性能和稳定性
echo - 如有问题，请查看上方的故障排除建议

echo.
set /p continue="是否要查看实时日志？(y/n): "
if /i "%continue%"=="y" (
    echo.
    echo 📋 显示应用日志（按Ctrl+C停止）:
    echo ----------------------------------------
    adb logcat | findstr MobileAppUnified
) else (
    echo.
    echo ✅ 测试脚本执行完成！
    echo 请在设备上测试应用功能
)

pause
