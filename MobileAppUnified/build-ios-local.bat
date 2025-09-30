@echo off
echo ========================================
echo 🍎 iOS本地构建脚本 (无需Expo账号)
echo ========================================
echo.

echo 📋 检查构建环境...
echo.

REM 检查是否在Windows环境
echo ⚠️  注意: iOS应用只能在macOS环境中本地构建
echo 💡 Windows用户推荐使用以下方案:
echo    1. EAS Build云端构建 (需要Expo账号)
echo    2. GitHub Actions自动构建 (免费)
echo    3. 远程Mac服务
echo.

echo 🌐 可用的iOS构建方案:
echo.
echo 1. EAS Build云端构建 ⭐⭐⭐⭐⭐
echo    - 无需Mac环境
echo    - 专业优化构建
echo    - 每月10次免费
echo    - 需要Expo账号
echo.
echo 2. GitHub Actions构建 ⭐⭐⭐⭐
echo    - 完全免费
echo    - 自动化构建
echo    - 代码推送触发
echo    - 已配置工作流
echo.
echo 3. 远程Mac服务 ⭐⭐⭐
echo    - MacStadium
echo    - AWS EC2 Mac
echo    - MacinCloud
echo.

echo 请选择构建方案:
echo 1. 设置EAS Build (推荐)
echo 2. 使用GitHub Actions
echo 3. 查看远程Mac服务信息
echo 4. 退出
echo.
set /p choice=请选择 (1-4): 

if "%choice%"=="1" goto setup_eas
if "%choice%"=="2" goto github_actions
if "%choice%"=="3" goto remote_mac
if "%choice%"=="4" goto end

:setup_eas
echo.
echo 🌐 设置EAS Build云端构建
echo ========================================
echo.
echo 📝 步骤1: 注册Expo账号
echo    访问: https://expo.dev/signup
echo    注册免费账号并验证邮箱
echo.
echo 🔑 步骤2: 登录EAS CLI
echo    运行命令: eas login
echo    输入您的Expo账号和密码
echo.
echo 🏗️ 步骤3: 开始构建
echo    运行命令: eas build --platform ios --profile preview
echo.
echo 📱 步骤4: 下载IPA
echo    构建完成后从 https://expo.dev/ 下载
echo.
echo 💡 提示: 构建时间约10-20分钟
echo.
echo 是否现在打开Expo注册页面? (y/n)
set /p open_expo=
if /i "%open_expo%"=="y" (
    start https://expo.dev/signup
)
echo.
echo 注册完成后，请运行以下命令:
echo   eas login
echo   eas build --platform ios --profile preview
echo.
goto end

:github_actions
echo.
echo 🤖 GitHub Actions自动构建
echo ========================================
echo.
echo ✅ 工作流已配置: .github/workflows/ios-build-advanced.yml
echo.
echo 🚀 触发构建方法:
echo    1. 推送代码到master分支
echo    2. 创建Pull Request
echo    3. 手动触发 (GitHub网页)
echo.
echo 📥 获取构建结果:
echo    1. 访问GitHub仓库
echo    2. 点击Actions标签
echo    3. 查看最新的构建任务
echo    4. 下载Artifacts中的IPA文件
echo.
echo 💡 优势:
echo    - 完全免费
echo    - 自动化构建
echo    - 无需本地环境
echo    - 支持多种触发方式
echo.
echo 是否现在推送代码触发构建? (y/n)
set /p push_code=
if /i "%push_code%"=="y" (
    echo 正在推送代码...
    git add .
    git commit -m "trigger: iOS构建工作流"
    git push
    echo.
    echo ✅ 代码已推送，GitHub Actions将自动开始构建
    echo 📊 查看构建进度: https://github.com/your-repo/actions
)
echo.
goto end

:remote_mac
echo.
echo 🖥️ 远程Mac服务信息
echo ========================================
echo.
echo 1. MacStadium
echo    - 专业Mac云服务
echo    - 按小时计费
echo    - 网址: https://www.macstadium.com/
echo.
echo 2. AWS EC2 Mac实例
echo    - Amazon云服务
echo    - 按需付费
echo    - 网址: https://aws.amazon.com/ec2/instance-types/mac/
echo.
echo 3. MacinCloud
echo    - Mac云桌面服务
echo    - 多种套餐
echo    - 网址: https://www.macincloud.com/
echo.
echo 4. Scaleway Mac mini
echo    - 欧洲云服务商
echo    - 性价比较高
echo    - 网址: https://www.scaleway.com/en/apple-silicon/
echo.
echo 💡 使用远程Mac服务的步骤:
echo    1. 注册并租用Mac实例
echo    2. 通过VNC或SSH连接
echo    3. 安装Xcode和开发工具
echo    4. 克隆项目代码
echo    5. 本地构建iOS应用
echo.
goto end

:end
echo.
echo 📋 iOS构建方案总结:
echo ========================================
echo.
echo 🥇 推荐方案: EAS Build
echo    - 最简单易用
echo    - 专业优化
echo    - 免费额度充足
echo.
echo 🥈 备选方案: GitHub Actions  
echo    - 完全免费
echo    - 自动化程度高
echo    - 已配置完成
echo.
echo 🥉 高级方案: 远程Mac服务
echo    - 完全控制
echo    - 适合复杂需求
echo    - 需要付费
echo.
echo 📱 无论选择哪种方案，都能成功构建iOS应用！
echo.
pause
