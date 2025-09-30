# AlphaCon 项目集合

这是一个包含多个应用程序的综合项目，涵盖了 Web 应用、移动应用、管理系统等多个平台的解决方案。

## 📁 项目目录结构

### 🌐 Web 应用
- **`AdminApp/`** - 管理后台系统
  - 基于现代 Web 技术栈的管理系统
  - 提供用户管理、权限控制、数据统计等功能
  - 包含完整的 API 接口供其他应用调用

- **`WebsiteExample/`** - 网站示例项目
  - 展示网站开发的最佳实践
  - 包含响应式设计和现代 UI 组件

### 📱 移动应用（跨平台）
- **`MobileApp/`** - 主要移动应用 ⭐ **推荐**
  - **技术栈**: React Native 0.72.6
  - **功能**: 登录系统、生物识别、推送通知、WebView 集成
  - **平台**: 同时支持 iOS 和 Android
  - **特点**: 复用 AdminApp API，功能最完整
  - **主要文件**:
    - `App.js` - 应用主入口
    - `src/screens/` - 页面组件（登录、主页、WebView、通知）
    - `src/services/` - 服务层（认证、生物识别、通知）
    - `android/` - Android 特定代码和配置
    - `ios/` - iOS 特定代码和配置
    - `package.json` - 项目依赖和脚本配置

- **`TestApp/`** - 测试应用
  - **技术栈**: React Native 0.81.4 + TypeScript
  - **用途**: 用于测试新功能和技术验证
  - **特点**: 使用更新的 React Native 版本，支持 TypeScript

- **`UniAppVersion/`** - uni-app 版本
  - **技术栈**: uni-app (基于 Vue.js)
  - **特点**: 一套代码多端运行（小程序、H5、App）
  - **文件结构**:
    - `pages/` - 页面组件
    - `services/` - 服务层

### 🤖 Android 原生应用
- **`SimpleAndroidApp/`** - 简单 Android 应用
  - **技术栈**: 原生 Android (Kotlin)
  - **功能**: 基础的 Android 应用，包含 Material Design 界面
  - **构建产物**: 生成的 APK 文件存放在 `apk/` 目录

### 🧪 测试项目
- **`SimpleTest/`** - 简单测试项目
  - 用于快速原型开发和功能测试

### 📦 构建产物
- **`apk/`** - Android APK 文件存储目录
  - `SimpleAndroidApp-debug.apk` - SimpleAndroidApp 的调试版本

### 📋 文档
- **`DEPLOYMENT_GUIDE.md`** - 部署指南
  - 包含各个项目的部署说明和配置指导

## 🚀 快速开始

### 移动应用开发（推荐 MobileApp）
```bash
cd MobileApp
npm install

# Android 开发
npm run android

# iOS 开发  
npm run ios
```

### Android 原生应用
```bash
cd SimpleAndroidApp
./gradlew assembleDebug
```

## 🔧 技术栈总览

| 项目 | 技术栈 | 平台支持 | 状态 |
|------|--------|----------|------|
| AdminApp | Web 技术栈 | Web | ✅ 生产就绪 |
| MobileApp | React Native | iOS + Android | ✅ 功能完整 |
| TestApp | React Native + TS | iOS + Android | 🧪 测试中 |
| UniAppVersion | uni-app (Vue) | 多端 | 🚧 开发中 |
| SimpleAndroidApp | Android Native | Android | ✅ 基础版本 |

## 📋 开发规范

### 代码提交规范
- 不提交 `node_modules/` 目录
- 不提交构建产物（除了 `apk/` 目录中的发布版本）
- 不提交 IDE 配置文件
- 不提交敏感信息（API 密钥、证书等）

### 项目依赖管理
- 使用 `package.json` 管理 Node.js 项目依赖
- 使用 `build.gradle` 管理 Android 项目依赖
- 定期更新依赖版本以确保安全性

## 🔗 项目关联

- **MobileApp** 复用 **AdminApp** 的 API 接口
- **SimpleAndroidApp** 可作为原生功能的补充
- **TestApp** 用于验证新技术和功能
- 所有移动应用都可以通过 WebView 集成 **AdminApp** 的 Web 界面

## 📞 支持

如有问题，请查看各项目目录下的 README.md 文件或联系开发团队。

## 📄 许可证

MIT License
