# 🍎 iOS版本打包指南 - Windows环境

## 🎯 **方案对比**

| 方案 | 成本 | 难度 | 推荐度 | 说明 |
|------|------|------|--------|------|
| **EAS Build** | 免费/付费 | ⭐ | ⭐⭐⭐⭐⭐ | 专为React Native设计 |
| **GitHub Actions** | 免费 | ⭐⭐ | ⭐⭐⭐⭐ | 开源项目首选 |
| **远程Mac服务** | 付费 | ⭐⭐ | ⭐⭐⭐ | 真实Mac环境 |
| **虚拟机macOS** | 免费 | ⭐⭐⭐⭐ | ⭐ | 不推荐（法律风险） |

## 🚀 **方案1：EAS Build（强烈推荐）**

### **优势**
- ✅ 专为React Native设计
- ✅ 免费额度：每月10次构建
- ✅ 无需Mac设备
- ✅ 自动处理证书和配置
- ✅ 支持TestFlight和App Store发布

### **快速开始**

#### **1. 安装EAS CLI**
```bash
npm install -g @expo/eas-cli
```

#### **2. 登录Expo账号**
```bash
eas login
```

#### **3. 初始化EAS配置**
```bash
eas build:configure
```

#### **4. 构建iOS版本**
```bash
# 构建开发版本
eas build --platform ios --profile development

# 构建生产版本
eas build --platform ios --profile production
```

### **配置文件示例**

#### **eas.json**
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
  },
  "submit": {
    "production": {}
  }
}
```

## 🔧 **方案2：GitHub Actions**

### **优势**
- ✅ 完全免费（开源项目）
- ✅ 与Git集成
- ✅ 自动化构建
- ✅ 可自定义构建流程

### **配置步骤**

#### **1. 创建工作流文件**
`.github/workflows/ios-build.yml`

```yaml
name: iOS Build

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: macos-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm install
    
    - name: Setup Ruby
      uses: ruby/setup-ruby@v1
      with:
        ruby-version: '3.0'
        bundler-cache: true
    
    - name: Install CocoaPods
      run: |
        cd ios
        pod install
    
    - name: Build iOS
      run: |
        cd ios
        xcodebuild -workspace MobileAppUnified.xcworkspace \
                   -scheme MobileAppUnified \
                   -configuration Release \
                   -destination generic/platform=iOS \
                   -archivePath build/MobileAppUnified.xcarchive \
                   archive
    
    - name: Upload IPA
      uses: actions/upload-artifact@v3
      with:
        name: ios-app
        path: ios/build/MobileAppUnified.xcarchive
```

## 🌐 **方案3：远程Mac服务**

### **推荐服务商**
- **MacStadium** - 专业Mac云服务
- **MacinCloud** - 按小时付费
- **AWS EC2 Mac** - 亚马逊云服务

### **使用步骤**
1. 租用远程Mac服务器
2. 通过VNC/SSH连接
3. 安装Xcode和开发工具
4. 上传项目代码
5. 执行构建命令

## ⚠️ **方案4：虚拟机macOS（不推荐）**

### **风险提示**
- ❌ **法律风险** - 违反Apple软件许可协议
- ❌ **性能问题** - 虚拟化性能损失
- ❌ **稳定性差** - 容易出现问题
- ❌ **技术复杂** - 配置困难

### **如果必须使用**
1. 使用VMware Workstation Pro
2. 下载macOS镜像（合法获取）
3. 配置虚拟机参数
4. 安装Xcode和开发工具

## 🎯 **推荐实施方案**

### **对于你的项目，我推荐：**

#### **第一选择：EAS Build**
```bash
# 1. 安装EAS CLI
npm install -g @expo/eas-cli

# 2. 在项目目录执行
cd MobileAppUnified
eas login
eas build:configure
eas build --platform ios
```

#### **第二选择：GitHub Actions**
1. 将项目推送到GitHub
2. 添加iOS构建工作流
3. 配置Apple Developer证书
4. 自动构建和发布

## 📱 **Apple Developer要求**

### **必需条件**
- 🍎 **Apple Developer账号** ($99/年)
- 📱 **iOS开发证书**
- 🔐 **Provisioning Profile**
- 📋 **App ID配置**

### **证书配置**
```bash
# 使用EAS自动管理证书
eas credentials

# 或手动上传证书
eas credentials:configure
```

## 🚀 **快速开始脚本**

### **EAS Build一键脚本**
```bash
#!/bin/bash
echo "🍎 开始iOS构建..."

# 检查EAS CLI
if ! command -v eas &> /dev/null; then
    echo "安装EAS CLI..."
    npm install -g @expo/eas-cli
fi

# 登录（如果需要）
eas whoami || eas login

# 配置构建
eas build:configure

# 构建iOS
echo "开始构建iOS版本..."
eas build --platform ios --profile production

echo "✅ 构建完成！请在Expo Dashboard查看结果"
```

## 📊 **成本对比**

| 方案 | 月成本 | 年成本 | 构建次数限制 |
|------|--------|--------|-------------|
| EAS Build免费版 | $0 | $0 | 10次/月 |
| EAS Build付费版 | $29 | $348 | 无限制 |
| GitHub Actions | $0 | $0 | 2000分钟/月 |
| MacStadium | $79 | $948 | 无限制 |
| Apple Developer | - | $99 | - |

## 🎉 **总结**

**对于你的MobileAppUnified项目，最佳方案是：**

1. **立即可用**：EAS Build（10分钟内完成配置）
2. **长期使用**：GitHub Actions（完全免费）
3. **专业需求**：远程Mac服务（最接近本地开发）

**推荐操作流程：**
1. 先用EAS Build快速生成iOS版本
2. 如果满意，可以设置GitHub Actions自动化
3. 申请Apple Developer账号准备上架

**你想先尝试哪种方案？我可以帮你详细配置！** 🚀
