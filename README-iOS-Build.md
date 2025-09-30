# iOS 打包指南

本项目包含三个可以进行iOS打包的React Native应用：
- **MobileAppUnified** - 功能最完整的应用
- **StableApp** - 稳定版本应用  
- **TestApp** - 测试应用

## 🛠️ 环境要求

### 必需工具
- **macOS** (iOS打包只能在macOS上进行)
- **Xcode** (最新版本，从App Store安装)
- **Node.js** (版本 >= 20)
- **CocoaPods** (`sudo gem install cocoapods`)
- **React Native CLI** (`npm install -g @react-native-community/cli`)

### 开发者账号
- Apple Developer Account (用于代码签名)
- 配置好的证书和描述文件

## 📱 快速打包

### 方法1: 使用PowerShell脚本 (Windows + macOS)

```powershell
# 基础打包 (开发版本)
.\ios-build.ps1 -Project MobileAppUnified

# 发布版本打包
.\ios-build.ps1 -Project MobileAppUnified -Configuration Release -ExportMethod app-store

# 企业版打包
.\ios-build.ps1 -Project StableApp -Configuration Release -ExportMethod enterprise -TeamID "YOUR_TEAM_ID"

# 清理构建
.\ios-build.ps1 -Project TestApp -CleanBuild
```

### 方法2: 使用Bash脚本 (macOS/Linux)

```bash
# 给脚本执行权限
chmod +x ios-build-simple.sh

# 基础打包
./ios-build-simple.sh MobileAppUnified

# 指定配置
./ios-build-simple.sh StableApp Release development
```

## 🔧 手动打包步骤

### 1. 准备环境
```bash
# 进入项目目录
cd MobileAppUnified

# 安装依赖
npm install

# 安装iOS依赖
cd ios
pod install
cd ..
```

### 2. 在Xcode中打包
```bash
# 打开Xcode工作空间
open ios/MobileAppUnified.xcworkspace
```

在Xcode中：
1. 选择 **Product** → **Archive**
2. 等待构建完成
3. 在Organizer中选择 **Distribute App**
4. 选择分发方式并导出IPA

### 3. 命令行打包
```bash
# 创建Archive
xcodebuild archive \
    -workspace ios/MobileAppUnified.xcworkspace \
    -scheme MobileAppUnified \
    -configuration Release \
    -archivePath build/MobileAppUnified.xcarchive

# 导出IPA
xcodebuild -exportArchive \
    -archivePath build/MobileAppUnified.xcarchive \
    -exportPath build/ipa \
    -exportOptionsPlist ios/ExportOptions.plist
```

## ⚙️ 配置说明

### ExportOptions.plist 配置
每个项目的 `ios/ExportOptions.plist` 文件控制导出选项：

```xml
<key>method</key>
<string>development</string>  <!-- 导出方式: development, ad-hoc, app-store, enterprise -->

<key>teamID</key>
<string>YOUR_TEAM_ID</string>  <!-- 开发者团队ID -->
```

### 导出方式说明
- **development**: 开发版本，用于开发设备测试
- **ad-hoc**: 临时分发版本，用于内部测试
- **app-store**: App Store版本，用于上架
- **enterprise**: 企业版本，用于企业内部分发

## 📋 项目特性对比

| 项目 | React Native版本 | 特殊依赖 | 推荐用途 |
|------|------------------|----------|----------|
| **MobileAppUnified** | 0.81.4 | 生物识别、地理位置、WebView等 | 生产环境 |
| **StableApp** | 0.70.15 | 基础功能 | 稳定测试 |
| **TestApp** | 0.81.4 | 基础功能 | 快速测试 |

## 🚨 常见问题

### 1. 代码签名错误
```bash
# 解决方案：在Xcode中配置正确的Team和Bundle ID
# 或在命令行中添加 -allowProvisioningUpdates 参数
```

### 2. Pod安装失败
```bash
# 清理并重新安装
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

### 3. 构建缓存问题
```bash
# 清理构建缓存
xcodebuild clean -workspace ios/MobileAppUnified.xcworkspace -scheme MobileAppUnified
```

### 4. 依赖版本冲突
```bash
# 清理npm缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📁 输出文件

成功打包后，IPA文件将生成在：
```
build/
├── ipa/
│   ├── MobileAppUnified.ipa
│   └── ExportOptions.plist
└── MobileAppUnified.xcarchive/
```

## 🔐 安全注意事项

1. **不要提交证书和私钥**到版本控制
2. **TeamID和签名信息**应该通过环境变量或配置文件管理
3. **生产环境**使用App Store Connect进行分发
4. **测试版本**使用TestFlight或企业分发

## 📞 技术支持

如果遇到打包问题，请检查：
1. Xcode版本是否最新
2. 证书和描述文件是否有效
3. Bundle ID是否正确配置
4. 依赖版本是否兼容

---

**提示**: 推荐使用 `MobileAppUnified` 项目进行生产环境打包，因为它包含了最完整的功能和最新的依赖版本。