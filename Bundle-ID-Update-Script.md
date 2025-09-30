# Bundle ID 更新脚本和指南

## 🔄 自动更新 Bundle ID

### PowerShell 脚本 (Windows)
```powershell
# update-bundle-id.ps1
param(
    [Parameter(Mandatory=$true)]
    [string]$NewBundleId,
    
    [Parameter(Mandatory=$true)]
    [string]$TeamId,
    
    [string]$AppName = "MobileAppUnified"
)

Write-Host "更新 Bundle ID 到: $NewBundleId" -ForegroundColor Green
Write-Host "使用 Team ID: $TeamId" -ForegroundColor Green

# 更新 ExportOptions.plist
$exportOptionsPath = "MobileAppUnified/ios/ExportOptions.plist"
if (Test-Path $exportOptionsPath) {
    $content = Get-Content $exportOptionsPath -Raw
    $content = $content -replace '<string></string>', "<string>$TeamId</string>"
    Set-Content $exportOptionsPath $content
    Write-Host "✅ 已更新 ExportOptions.plist" -ForegroundColor Green
}

# 更新 project.pbxproj
$projectPath = "MobileAppUnified/ios/MobileAppUnified.xcodeproj/project.pbxproj"
if (Test-Path $projectPath) {
    $content = Get-Content $projectPath -Raw
    $oldBundleId = "org.reactjs.native.example.`$(PRODUCT_NAME:rfc1034identifier)"
    $content = $content -replace [regex]::Escape($oldBundleId), $NewBundleId
    Set-Content $projectPath $content
    Write-Host "✅ 已更新 project.pbxproj" -ForegroundColor Green
}

Write-Host "🎉 Bundle ID 更新完成！" -ForegroundColor Yellow
Write-Host "⚠️  请在 Xcode 中验证配置并重新生成证书" -ForegroundColor Yellow
```

### 使用方法
```bash
# 示例：更新为您的 Bundle ID
.\update-bundle-id.ps1 -NewBundleId "com.yourcompany.mobileappunified" -TeamId "ABCD123456"
```

## 📝 手动更新步骤

### 1. 更新 ExportOptions.plist
```xml
<!-- 当前配置 -->
<key>teamID</key>
<string></string>

<!-- 更新为 -->
<key>teamID</key>
<string>YOUR_TEAM_ID</string>
```

### 2. 更新 project.pbxproj
```bash
查找并替换：
FROM: org.reactjs.native.example.$(PRODUCT_NAME:rfc1034identifier)
TO:   com.yourcompany.mobileappunified
```

### 3. 验证配置
```bash
检查文件：
□ MobileAppUnified/ios/ExportOptions.plist - Team ID 已更新
□ MobileAppUnified/ios/MobileAppUnified.xcodeproj/project.pbxproj - Bundle ID 已更新
□ 在 Xcode 中打开项目验证签名配置
```

## 🎯 不同发布场景的配置

### 场景1: 个人开发者 - 内测版本
```xml
<!-- ExportOptions.plist -->
<key>method</key>
<string>development</string>
<key>teamID</key>
<string>YOUR_PERSONAL_TEAM_ID</string>

Bundle ID 建议: com.yourname.mobileappunified
```

### 场景2: 企业开发者 - 内部分发
```xml
<!-- ExportOptions.plist -->
<key>method</key>
<string>enterprise</string>
<key>teamID</key>
<string>YOUR_ENTERPRISE_TEAM_ID</string>

Bundle ID 建议: com.yourcompany.mobileappunified
```

### 场景3: App Store 发布
```xml
<!-- ExportOptions.plist -->
<key>method</key>
<string>app-store</string>
<key>teamID</key>
<string>YOUR_TEAM_ID</string>

Bundle ID 建议: com.yourcompany.mobileappunified
```

### 场景4: TestFlight 测试
```xml
<!-- ExportOptions.plist -->
<key>method</key>
<string>app-store</string>
<key>teamID</key>
<string>YOUR_TEAM_ID</string>

Bundle ID: 与 App Store 版本相同
```

## ⚠️ 重要注意事项

### Bundle ID 命名规则
```bash
✅ 正确格式:
- com.company.appname
- com.developer.appname
- org.organization.appname

❌ 避免使用:
- 包含空格或特殊字符
- 以数字开头
- 使用保留关键词
- 复制他人的 Bundle ID
```

### Team ID 获取方法
```bash
方法1: Apple Developer 网站
1. 登录 https://developer.apple.com
2. Account -> Membership
3. 查看 Team ID

方法2: Xcode
1. 打开 Xcode
2. Preferences -> Accounts
3. 选择您的 Apple ID
4. 查看 Team ID

方法3: 命令行 (macOS)
security find-identity -v -p codesigning
```

## 🔄 更新后的验证步骤

### 1. 构建验证
```bash
cd MobileAppUnified
npx react-native run-ios --configuration Release
```

### 2. 签名验证
```bash
# 在 macOS 上验证签名
codesign -dv --verbose=4 ios/build/Build/Products/Release-iphonesimulator/MobileAppUnified.app
```

### 3. Archive 测试
```bash
# 创建 Archive 测试
xcodebuild archive \
    -workspace ios/MobileAppUnified.xcworkspace \
    -scheme MobileAppUnified \
    -configuration Release \
    -archivePath build/MobileAppUnified.xcarchive
```

## 📞 常见问题解决

### 问题1: "No matching provisioning profiles found"
```bash
解决方案:
1. 在 Xcode 中选择 "Automatically manage signing"
2. 确保 Team ID 正确
3. 重新生成 Provisioning Profile
```

### 问题2: "Bundle identifier is not available"
```bash
解决方案:
1. 更换 Bundle ID (确保唯一性)
2. 检查是否已在其他项目中使用
3. 联系 Apple 支持 (如果确认未使用)
```

### 问题3: "Invalid Team ID"
```bash
解决方案:
1. 重新获取正确的 Team ID
2. 确认开发者账号状态正常
3. 检查账号权限设置
```

---

**重要提醒**: 完成配置更新后，需要重新运行构建流程才能生成可发布的应用文件。