# 🍎 iOS开发环境配置指南

## 📋 **必需软件和工具**

### **1. macOS系统**
- **要求**：macOS 10.15 (Catalina) 或更高版本
- **推荐**：macOS 12 (Monterey) 或更高版本
- **注意**：iOS开发必须在Mac上进行

### **2. Xcode**
- **版本**：Xcode 14.0 或更高版本
- **下载**：从Mac App Store免费下载
- **大小**：约12GB
- **包含**：iOS SDK、模拟器、调试工具

### **3. Node.js**
- **版本**：Node.js 16 或更高版本
- **下载**：https://nodejs.org/
- **验证**：`node --version`

### **4. React Native CLI**
```bash
npm install -g react-native-cli
# 或使用npx（推荐）
npx react-native --version
```

### **5. CocoaPods**
```bash
sudo gem install cocoapods
pod --version
```

### **6. iOS模拟器**
- **包含在Xcode中**
- **支持多种设备**：iPhone、iPad
- **支持多个iOS版本**

## 🚀 **快速开始步骤**

### **步骤1：创建React Native项目**
```bash
npx react-native init MobileAppIOS
cd MobileAppIOS
```

### **步骤2：安装iOS依赖**
```bash
cd ios
pod install
cd ..
```

### **步骤3：启动iOS模拟器**
```bash
npx react-native run-ios
```

### **步骤4：在真机上测试**
1. **连接iPhone到Mac**
2. **在Xcode中配置签名**
3. **运行到真机**：`npx react-native run-ios --device`

## 📱 **Apple Developer账号**

### **免费账号（个人开发）**
- ✅ **模拟器测试**：完全免费
- ✅ **真机测试**：7天有效期
- ❌ **App Store发布**：不支持
- ❌ **TestFlight分发**：不支持

### **付费账号（$99/年）**
- ✅ **无限真机测试**
- ✅ **App Store发布**
- ✅ **TestFlight分发**
- ✅ **推送通知**
- ✅ **高级功能**

## 🔧 **开发工具推荐**

### **代码编辑器**
- **VS Code**：免费，插件丰富
- **WebStorm**：付费，功能强大
- **Xcode**：iOS原生开发必备

### **调试工具**
- **React Native Debugger**
- **Flipper**：Facebook开发的调试工具
- **Xcode Instruments**：性能分析

### **模拟器管理**
- **Simulator**：Xcode内置
- **支持设备**：iPhone 12/13/14/15系列
- **支持系统**：iOS 14/15/16/17

## 📋 **权限配置（Info.plist）**

### **相机权限**
```xml
<key>NSCameraUsageDescription</key>
<string>需要相机权限来扫描二维码和人脸识别</string>
```

### **位置权限**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>需要位置权限来获取GPS坐标</string>
```

### **Face ID权限**
```xml
<key>NSFaceIDUsageDescription</key>
<string>使用Face ID进行生物识别登录</string>
```

## 🎯 **功能实现对照表**

| Android功能 | iOS对应实现 | 难度 |
|------------|------------|------|
| 相机扫码 | AVFoundation | ⭐⭐ |
| WebView | WKWebView | ⭐ |
| 指纹识别 | Touch ID | ⭐ |
| 人脸识别 | Face ID | ⭐ |
| GPS定位 | CoreLocation | ⭐⭐ |
| 网络请求 | URLSession | ⭐ |

## 📱 **测试设备建议**

### **模拟器测试**
- **iPhone 14 Pro**：最新功能
- **iPhone SE**：小屏幕适配
- **iPad**：平板适配

### **真机测试**
- **iPhone 12或更新**：Face ID测试
- **iPhone 8或更新**：Touch ID测试
- **不同iOS版本**：兼容性测试

## 🔄 **开发流程**

### **1. 功能移植优先级**
```
1. 基础界面 ✅ 简单
2. 登录功能 ✅ 简单
3. WebView集成 ✅ 简单
4. 相机扫码 ⭐⭐ 中等
5. 生物识别 ⭐ 简单
6. GPS定位 ⭐⭐ 中等
```

### **2. 开发阶段**
```
阶段1：基础框架搭建（1-2天）
阶段2：核心功能实现（3-5天）
阶段3：iOS特性适配（2-3天）
阶段4：测试和优化（2-3天）
```

## 💡 **快速演示方案**

### **最快方案：Web App**
如果只是为了演示，可以考虑：

1. **PWA（Progressive Web App）**
   - 在Safari中运行
   - 支持添加到主屏幕
   - 支持大部分功能

2. **响应式网页**
   - 适配iPhone屏幕
   - 支持触摸操作
   - 快速部署

### **中期方案：React Native**
- 1-2周开发时间
- 接近原生体验
- 支持App Store发布

### **长期方案：原生iOS**
- 2-4周开发时间
- 最佳性能和体验
- 完整iOS生态集成
