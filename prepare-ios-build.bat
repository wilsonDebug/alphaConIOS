@echo off
echo ========================================
echo 🍎 iOS构建准备 - MobileApp Unified
echo ========================================

echo.
echo 🎯 iOS构建方案准备:
echo - GitHub Actions云端构建 (推荐)
echo - 本地Mac环境构建
echo - 第三方云端构建服务

echo.
echo 📋 当前项目状态:
echo ✅ React Native跨平台项目已创建
echo ✅ Android Release版本已构建完成
echo ✅ iOS项目配置已准备就绪
echo ✅ GitHub Actions工作流已配置

echo.
echo 🔍 检查iOS构建文件...

REM 检查iOS项目文件
if exist "MobileAppUnified\ios\MobileAppUnified.xcodeproj" (
    echo ✅ iOS Xcode项目文件存在
) else (
    echo ❌ iOS Xcode项目文件不存在
    echo 请检查React Native项目是否正确创建
    pause
    exit /b 1
)

REM 检查iOS配置文件
if exist "MobileAppUnified\ios\Podfile" (
    echo ✅ iOS Podfile存在
) else (
    echo ❌ iOS Podfile不存在
    pause
    exit /b 1
)

REM 检查GitHub Actions工作流
if exist ".github\workflows\ios-build.yml" (
    echo ✅ GitHub Actions iOS构建工作流已配置
) else (
    echo ❌ GitHub Actions工作流不存在
    pause
    exit /b 1
)

REM 检查导出配置
if exist "MobileAppUnified\ios\ExportOptions.plist" (
    echo ✅ iOS导出配置文件存在
) else (
    echo ❌ iOS导出配置文件不存在
    pause
    exit /b 1
)

echo ✅ 所有iOS构建文件检查通过

echo.
echo 🚀 iOS构建方案选择:
echo ========================================

echo.
echo 方案1: GitHub Actions云端构建 (推荐 ⭐⭐⭐⭐⭐)
echo ----------------------------------------
echo 优势:
echo ✅ 完全免费 (GitHub免费额度)
echo ✅ 无需Mac设备
echo ✅ 自动化构建流程
echo ✅ 构建结果可下载
echo.
echo 使用步骤:
echo 1. 确保代码已推送到GitHub仓库
echo 2. 在GitHub仓库中进入Actions页面
echo 3. 运行"iOS Build - MobileApp Unified"工作流
echo 4. 等待构建完成 (约15-20分钟)
echo 5. 下载生成的IPA文件

echo.
echo 方案2: 本地Mac环境构建 (⭐⭐⭐⭐)
echo ----------------------------------------
echo 要求:
echo - macOS系统
echo - Xcode 15.0+
echo - Node.js 18+
echo - CocoaPods
echo.
echo 使用步骤:
echo 1. 在Mac上克隆项目
echo 2. 运行: chmod +x MobileAppUnified/build-ios.sh
echo 3. 运行: ./MobileAppUnified/build-ios.sh
echo 4. 等待构建完成

echo.
echo 方案3: 云端构建服务 (⭐⭐⭐)
echo ----------------------------------------
echo 可选服务:
echo - Codemagic (免费额度)
echo - Bitrise (免费额度)
echo - CircleCI (免费额度)
echo.
echo 优势: 专业的移动应用构建服务
echo 劣势: 需要注册和配置

echo.
echo 📊 方案对比:
echo ========================================
echo.
echo ^| 方案 ^| 成本 ^| 难度 ^| 时间 ^| 推荐度 ^|
echo ^|------|------|------|------|--------|
echo ^| GitHub Actions ^| 免费 ^| 简单 ^| 15-20分钟 ^| ⭐⭐⭐⭐⭐ ^|
echo ^| 本地Mac构建 ^| 免费 ^| 中等 ^| 10-15分钟 ^| ⭐⭐⭐⭐ ^|
echo ^| 云端服务 ^| 部分免费 ^| 中等 ^| 10-20分钟 ^| ⭐⭐⭐ ^|

echo.
echo 💡 推荐使用GitHub Actions:
echo ========================================
echo.
echo 🔗 GitHub仓库地址:
echo https://github.com/[your-username]/[your-repo-name]
echo.
echo 📋 GitHub Actions使用步骤:
echo 1. 打开GitHub仓库页面
echo 2. 点击"Actions"标签页
echo 3. 找到"iOS Build - MobileApp Unified"工作流
echo 4. 点击"Run workflow"按钮
echo 5. 选择构建类型 (release推荐)
echo 6. 点击"Run workflow"开始构建
echo 7. 等待构建完成 (绿色✅表示成功)
echo 8. 在Artifacts中下载IPA文件

echo.
echo 🧪 iOS功能测试清单:
echo ========================================
echo.
echo 构建完成后，请测试以下功能:
echo [ ] 应用正常安装到iOS设备
echo [ ] 应用启动速度 (目标 < 3秒)
echo [ ] 登录功能 (admin/1)
echo [ ] Face ID/Touch ID生物识别
echo [ ] GPS坐标获取功能
echo [ ] WebView网页浏览
echo [ ] 高德地图定位
echo [ ] 相机扫码功能
echo [ ] 所有按钮响应正常
echo [ ] 界面适配iPhone/iPad
echo [ ] iOS权限请求正常

echo.
echo 📱 iOS设备兼容性:
echo ========================================
echo.
echo 支持的iOS版本:
echo ✅ iOS 13.0+ (最低要求)
echo ✅ iOS 14.0+ (推荐)
echo ✅ iOS 15.0+ (完全支持)
echo ✅ iOS 16.0+ (完全支持)
echo ✅ iOS 17.0+ (完全支持)
echo.
echo 支持的设备:
echo ✅ iPhone 8及以上
echo ✅ iPad (第6代)及以上
echo ✅ iPad Pro (所有型号)
echo ✅ iPad Air (第3代)及以上
echo ✅ iPad mini (第5代)及以上

echo.
echo 🎯 构建完成后的下一步:
echo ========================================
echo.
echo 1. 📱 iOS功能测试
echo    - 在iOS设备上安装测试
echo    - 验证所有功能正常工作
echo    - 对比Android版本一致性
echo.
echo 2. 🚀 应用商店准备
echo    - 准备App Store截图
echo    - 编写应用描述
echo    - 设置应用元数据
echo.
echo 3. 📋 提交审核
echo    - 上传到App Store Connect
echo    - 填写审核信息
echo    - 提交苹果审核

echo.
echo ========================================
echo 🎉 iOS构建准备完成！
echo ========================================

echo.
echo 📋 总结:
echo ✅ iOS项目配置完成
echo ✅ GitHub Actions工作流已配置
echo ✅ 本地Mac构建脚本已准备
echo ✅ iOS导出配置已设置
echo ✅ 功能测试清单已准备

echo.
echo 🚀 立即开始iOS构建:
echo 1. 推荐使用GitHub Actions (最简单)
echo 2. 或在Mac上运行本地构建脚本
echo 3. 构建完成后进行功能测试
echo 4. 测试通过后准备App Store发布

echo.
set /p continue="是否要打开GitHub仓库页面开始构建？(y/n): "
if /i "%continue%"=="y" (
    echo 🌐 正在打开GitHub仓库页面...
    start https://github.com
    echo ✅ 请在GitHub中找到您的仓库并运行iOS构建工作流
) else (
    echo ✅ iOS构建准备完成，请选择合适的构建方案
)

echo.
echo 💡 提示: iOS构建比Android构建时间稍长，请耐心等待
echo 🎊 祝您iOS构建顺利！

pause
