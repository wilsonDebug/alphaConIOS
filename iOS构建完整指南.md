# 🍎 iOS构建完整指南

## 📋 **前置要求**

### **必需环境**
- ✅ Node.js (已安装: v22.15.1)
- ✅ npm (已安装: v10.9.2)  
- ✅ EAS CLI (已安装: v16.19.3)
- 🔑 Expo账号 (需要注册)

### **可选环境**
- 🍎 macOS + Xcode (本地构建)
- 👨‍💻 Apple Developer账号 (App Store发布)

## 🚀 **构建方案对比**

### **方案1: EAS Build云端构建** ⭐⭐⭐⭐⭐ (推荐)

#### **优势**
- ✅ **无需Mac**: Windows环境即可构建iOS应用
- ✅ **专业优化**: 专为React Native设计的构建环境
- ✅ **免费额度**: 每月10次免费构建
- ✅ **快速构建**: 10-20分钟完成
- ✅ **自动配置**: 自动处理证书和配置文件

#### **构建步骤**
```bash
# 1. 登录Expo账号
eas login

# 2. 开始构建
eas build --platform ios --profile preview

# 3. 等待构建完成
# 4. 从Expo Dashboard下载IPA
```

### **方案2: GitHub Actions** ⭐⭐⭐⭐

#### **优势**
- ✅ **完全免费**: 无构建次数限制
- ✅ **自动化**: 代码推送自动触发构建
- ✅ **版本控制**: 与Git完美集成

#### **配置文件** (已准备)
```yaml
# .github/workflows/ios-build.yml
name: Build iOS
on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build-ios:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Build iOS
        run: |
          cd ios
          xcodebuild -workspace MobileAppUnified.xcworkspace \
                     -scheme MobileAppUnified \
                     -configuration Release \
                     -archivePath MobileAppUnified.xcarchive \
                     archive
```

### **方案3: 本地Mac构建** ⭐⭐⭐

#### **要求**
- 🍎 macOS系统
- 📱 Xcode (最新版本)
- 🔧 CocoaPods

#### **构建步骤**
```bash
# 1. 安装依赖
cd ios
pod install

# 2. 打开Xcode项目
open MobileAppUnified.xcworkspace

# 3. 在Xcode中构建和归档
# Product -> Archive
```

## 🛠️ **立即开始iOS构建**

### **快速启动** (推荐)
```bash
# 运行自动化脚本
.\build-ios-complete.bat
```

### **手动步骤**

#### **1. 注册Expo账号**
- 访问: https://expo.dev/signup
- 注册免费账号
- 验证邮箱

#### **2. 登录EAS CLI**
```bash
eas login
```

#### **3. 选择构建类型**
```bash
# 开发版 (用于测试)
eas build --platform ios --profile development

# 预览版 (推荐)
eas build --platform ios --profile preview

# 生产版 (App Store)
eas build --platform ios --profile production
```

#### **4. 等待构建完成**
- ⏱️ 构建时间: 10-20分钟
- 📊 进度查看: https://expo.dev/
- 📧 完成通知: 邮件通知

#### **5. 下载IPA文件**
- 登录 https://expo.dev/
- 进入项目页面
- 在Builds页面下载IPA

## 📱 **安装到iOS设备**

### **方案1: TestFlight** (推荐)
- 需要Apple Developer账号 ($99/年)
- 上传到App Store Connect
- 通过TestFlight分发给测试用户

### **方案2: AltStore** (免费)
- 下载AltStore: https://altstore.io/
- 使用Apple ID签名安装
- 每7天需要重新签名

### **方案3: 企业证书**
- 需要Apple Developer Enterprise账号
- 可以直接安装，无需App Store

## 🔧 **项目配置详情**

### **EAS配置** (`eas.json`)
```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "preview": {
      "distribution": "internal", 
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "production": {
      "ios": {
        "resourceClass": "m-medium"
      }
    }
  }
}
```

### **iOS权限配置** (`Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>需要相机权限来扫描二维码和人脸识别功能</string>
<key>NSFaceIDUsageDescription</key>
<string>使用Face ID进行生物识别登录，提供更安全便捷的登录体验</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>需要位置权限来获取GPS坐标和地图定位功能</string>
```

## 🎯 **构建优化建议**

### **性能优化**
- 🚀 使用`m-medium`资源类别 (更快构建)
- 📦 启用代码分割和压缩
- 🔄 利用构建缓存

### **安全配置**
- 🔐 配置App Transport Security
- 🛡️ 设置适当的权限描述
- 🔒 使用代码混淆

### **用户体验**
- 📱 配置启动画面
- 🎨 设置应用图标
- 📝 添加版本信息

## 🚨 **常见问题解决**

### **构建失败**
1. 检查网络连接
2. 确认Expo账号有效
3. 验证项目配置
4. 查看构建日志

### **证书问题**
1. 检查Bundle ID唯一性
2. 确认开发者账号状态
3. 重新生成证书

### **依赖问题**
1. 清理node_modules
2. 重新安装依赖
3. 检查版本兼容性

## 🎉 **成功标志**

构建成功后，您将获得:
- 📱 **IPA文件**: 可安装的iOS应用包
- 🔗 **下载链接**: 从Expo Dashboard获取
- 📊 **构建报告**: 详细的构建信息
- 📧 **邮件通知**: 构建完成通知

---

## 🚀 **立即开始**

**推荐流程**:
1. 运行 `.\build-ios-complete.bat`
2. 按提示注册/登录Expo账号
3. 选择构建类型 (推荐Preview)
4. 等待10-20分钟构建完成
5. 从Expo Dashboard下载IPA
6. 安装到iOS设备测试

**现在就开始您的iOS构建之旅吧！** 🍎📱✨
