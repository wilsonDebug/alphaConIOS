# iOS 打包脚本
# 支持 MobileAppUnified, StableApp, TestApp 三个项目

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("MobileAppUnified", "StableApp", "TestApp")]
    [string]$Project,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("Debug", "Release")]
    [string]$Configuration = "Release",
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("development", "ad-hoc", "app-store", "enterprise")]
    [string]$ExportMethod = "development",
    
    [Parameter(Mandatory=$false)]
    [string]$TeamID = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$CleanBuild = $false
)

Write-Host "🚀 开始 iOS 打包流程..." -ForegroundColor Green
Write-Host "项目: $Project" -ForegroundColor Cyan
Write-Host "配置: $Configuration" -ForegroundColor Cyan
Write-Host "导出方式: $ExportMethod" -ForegroundColor Cyan

# 检查必要工具
function Check-Requirements {
    Write-Host "🔍 检查构建环境..." -ForegroundColor Yellow
    
    # 检查 Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
        exit 1
    }
    
    # 检查 Xcode
    try {
        $xcodeVersion = xcodebuild -version | Select-Object -First 1
        Write-Host "✅ $xcodeVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ 未找到 Xcode，请确保已安装 Xcode" -ForegroundColor Red
        exit 1
    }
    
    # 检查 CocoaPods
    try {
        $podVersion = pod --version
        Write-Host "✅ CocoaPods: $podVersion" -ForegroundColor Green
    } catch {
        Write-Host "❌ 未找到 CocoaPods，请先安装: sudo gem install cocoapods" -ForegroundColor Red
        exit 1
    }
}

# 安装依赖
function Install-Dependencies {
    Write-Host "📦 安装项目依赖..." -ForegroundColor Yellow
    
    Set-Location $Project
    
    # 安装 npm 依赖
    Write-Host "安装 npm 依赖..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ npm install 失败" -ForegroundColor Red
        exit 1
    }
    
    # 安装 iOS 依赖
    Write-Host "安装 iOS 依赖..." -ForegroundColor Cyan
    Set-Location ios
    
    if ($CleanBuild) {
        Write-Host "清理 Pods..." -ForegroundColor Cyan
        Remove-Item -Recurse -Force Pods -ErrorAction SilentlyContinue
        Remove-Item -Force Podfile.lock -ErrorAction SilentlyContinue
    }
    
    pod install --repo-update
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ pod install 失败" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ..
    Set-Location ..
}

# 构建项目
function Build-Project {
    Write-Host "🔨 构建 iOS 项目..." -ForegroundColor Yellow
    
    $workspacePath = "$Project/ios/$Project.xcworkspace"
    $scheme = $Project
    $archivePath = "build/$Project.xcarchive"
    $exportPath = "build/ipa"
    
    # 创建构建目录
    New-Item -ItemType Directory -Force -Path "build" | Out-Null
    
    if ($CleanBuild) {
        Write-Host "清理构建缓存..." -ForegroundColor Cyan
        xcodebuild clean -workspace $workspacePath -scheme $scheme -configuration $Configuration
    }
    
    # 构建 Archive
    Write-Host "创建 Archive..." -ForegroundColor Cyan
    xcodebuild archive `
        -workspace $workspacePath `
        -scheme $scheme `
        -configuration $Configuration `
        -archivePath $archivePath `
        -allowProvisioningUpdates
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Archive 构建失败" -ForegroundColor Red
        exit 1
    }
    
    # 更新 ExportOptions.plist
    Update-ExportOptions -Project $Project -ExportMethod $ExportMethod -TeamID $TeamID
    
    # 导出 IPA
    Write-Host "导出 IPA 文件..." -ForegroundColor Cyan
    $exportOptionsPath = "$Project/ios/ExportOptions.plist"
    
    xcodebuild -exportArchive `
        -archivePath $archivePath `
        -exportPath $exportPath `
        -exportOptionsPlist $exportOptionsPath `
        -allowProvisioningUpdates
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ IPA 导出失败" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ 构建完成！" -ForegroundColor Green
    Write-Host "IPA 文件位置: build/ipa/$Project.ipa" -ForegroundColor Cyan
}

# 更新导出选项
function Update-ExportOptions {
    param($Project, $ExportMethod, $TeamID)
    
    $exportOptionsPath = "$Project/ios/ExportOptions.plist"
    
    # 读取现有的 plist 文件
    $plistContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>$ExportMethod</string>
    <key>teamID</key>
    <string>$TeamID</string>
    <key>compileBitcode</key>
    <false/>
    <key>uploadBitcode</key>
    <false/>
    <key>uploadSymbols</key>
    <true/>
    <key>signingStyle</key>
    <string>automatic</string>
    <key>destination</key>
    <string>export</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>thinning</key>
    <string><none></string>
</dict>
</plist>
"@
    
    Set-Content -Path $exportOptionsPath -Value $plistContent -Encoding UTF8
    Write-Host "✅ 更新 ExportOptions.plist" -ForegroundColor Green
}

# 主执行流程
try {
    Check-Requirements
    Install-Dependencies
    Build-Project
    
    Write-Host "🎉 iOS 打包完成！" -ForegroundColor Green
    Write-Host "📱 IPA 文件已生成在 build/ipa/ 目录中" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ 打包过程中出现错误: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}