@echo off
echo ========================================
echo 📱 华为设备Release APK测试
echo ========================================

echo.
echo 🎯 测试目标:
echo - 华为 Meta 60 Pro 专用Release版本
echo - 完整功能验证
echo - 性能和兼容性测试

echo.
echo 📱 APK文件信息:
echo - 文件名: MobileAppUnified-v1.0-HUAWEI-RELEASE.apk
echo - 版本: v1.0.0 Release
echo - 构建时间: 2025-01-18 17:20
echo - 构建耗时: 12分46秒

echo.
echo 🔍 检查Release APK文件...
if exist "apk\MobileAppUnified-v1.0-HUAWEI-RELEASE.apk" (
    echo ✅ Release APK文件存在
    
    REM 显示文件大小
    for %%A in ("apk\MobileAppUnified-v1.0-HUAWEI-RELEASE.apk") do (
        set size=%%~zA
        set /a sizeMB=!size!/1024/1024
        echo 📊 文件大小: !sizeMB! MB
        echo 📅 修改时间: %%~tA
    )
) else (
    echo ❌ Release APK文件不存在！
    echo 请先运行构建脚本生成Release版本
    pause
    exit /b 1
)

echo.
echo 📱 华为设备安装方法:
echo ----------------------------------------
echo.
echo 方法1: 直接安装 (推荐 ⭐⭐⭐⭐⭐)
echo 1. 将APK文件复制到华为设备
echo 2. 设置→安全→更多安全设置→安装未知应用
echo 3. 允许从文件管理器安装应用
echo 4. 在设备上点击APK文件安装
echo.
echo 方法2: 华为HiSuite安装
echo 1. 电脑安装华为HiSuite
echo 2. USB连接华为设备
echo 3. HiSuite→应用管理→安装本地应用
echo 4. 选择APK文件安装
echo.
echo 方法3: ADB安装 (需要开发者选项)
echo 1. 华为设备启用开发者选项和USB调试
echo 2. 运行: adb install "apk\MobileAppUnified-v1.0-HUAWEI-RELEASE.apk"

echo.
echo 🧪 华为设备功能测试清单:
echo ----------------------------------------
echo.
echo 📋 基本功能测试:
echo [ ] 应用正常安装 (无错误提示)
echo [ ] 应用启动速度 (目标 < 3秒)
echo [ ] 登录功能 (admin/1)
echo [ ] 生物识别登录 (华为指纹/面部识别)
echo.
echo 📋 主界面功能测试:
echo [ ] 🔍 获取GPS坐标 (显示坐标对话框)
echo [ ] 📱 扫描二维码 (相机权限和功能)
echo [ ] 🌐 WebQR.com扫描 (WebView加载)
echo [ ] 🗺️ 高德地图定位 (地图显示)
echo [ ] 🌍 网页高德查经纬度 (测试网页)
echo [ ] 😊 设置人脸识别 (华为面部识别)
echo [ ] 👆 设置指纹识别 (华为指纹识别)
echo.
echo 📋 华为特性测试:
echo [ ] EMUI/HarmonyOS界面适配
echo [ ] 华为权限管理兼容性
echo [ ] 华为生物识别服务
echo [ ] 华为应用市场检测通过
echo [ ] 华为移动服务兼容性
echo.
echo 📋 性能测试:
echo [ ] 启动时间 < 3秒
echo [ ] 内存使用 < 100MB
echo [ ] 界面响应流畅
echo [ ] 网络请求 < 5秒
echo [ ] 电池消耗正常

echo.
echo 🔧 如果遇到安装问题:
echo ----------------------------------------
echo.
echo 问题1: "无法安装应用"
echo 解决: 设置→安全→更多安全设置→安装未知应用→允许
echo.
echo 问题2: "应用未经验证"
echo 解决: 这是正常的，点击"仍要安装"继续
echo.
echo 问题3: "权限被拒绝"
echo 解决: 设置→应用→权限管理→手动授予权限
echo.
echo 问题4: "应用崩溃"
echo 解决: 清除应用数据，重新启动应用

echo.
echo 📊 测试结果记录:
echo ----------------------------------------
echo.
echo 请在华为设备上完成测试后记录结果:
echo.
echo 设备信息:
echo - 设备型号: 华为Meta 60 Pro
echo - 系统版本: HarmonyOS ____
echo - EMUI版本: EMUI ____
echo - 测试日期: %date%
echo.
echo 测试结果:
echo - 安装状态: [ ] 成功 [ ] 失败
echo - 启动状态: [ ] 成功 [ ] 失败
echo - 功能测试: [ ] 全部通过 [ ] 部分通过 [ ] 失败
echo - 性能表现: [ ] 优秀 [ ] 良好 [ ] 一般 [ ] 差
echo - 兼容性: [ ] 完全兼容 [ ] 基本兼容 [ ] 有问题
echo.
echo 发现的问题:
echo 1. ________________________
echo 2. ________________________
echo 3. ________________________

echo.
echo 💡 测试提示:
echo ----------------------------------------
echo - 测试时注意观察应用响应速度
echo - 检查所有按钮和功能是否正常
echo - 验证权限请求是否符合华为规范
echo - 测试生物识别功能的华为特性
echo - 观察内存和电池使用情况

echo.
echo ========================================
echo 🎉 华为设备Release APK测试准备完成！
echo ========================================

echo.
echo 📱 下一步操作:
echo 1. 将APK文件传输到华为Meta 60 Pro
echo 2. 在华为设备上安装APK
echo 3. 按照测试清单逐项验证功能
echo 4. 记录测试结果和发现的问题
echo 5. 如果测试通过，可以开始iOS版本构建

echo.
set /p continue="是否要打开APK文件所在目录？(y/n): "
if /i "%continue%"=="y" (
    explorer "apk"
    echo ✅ 已打开APK文件目录
) else (
    echo ✅ 测试准备完成，请手动复制APK到华为设备
)

echo.
echo 🚀 祝测试顺利！华为Meta 60 Pro Release版本等待您的验证！
pause
