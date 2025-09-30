# 部署和使用指南

## 项目概述

这个解决方案包含两个主要部分：
1. **MobileApp**: React Native 跨平台移动应用
2. **WebsiteExample**: 在 WebView 中运行的网站示例

## 快速开始

### 第一步：环境准备

#### 1. 安装 Node.js 和开发工具
```bash
# 安装 Node.js (推荐 v16+)
# 从 https://nodejs.org/ 下载安装

# 安装 React Native CLI
npm install -g react-native-cli

# 安装 CocoaPods (iOS 开发需要)
sudo gem install cocoapods
```

#### 2. 安装 Android Studio (Android 开发)
- 下载并安装 Android Studio
- 配置 Android SDK
- 创建 Android 虚拟设备 (AVD)

#### 3. 安装 Xcode (iOS 开发，仅 macOS)
- 从 App Store 安装 Xcode
- 安装 Xcode Command Line Tools

### 第二步：项目配置

#### 1. 克隆并安装依赖
```bash
# 进入项目目录
cd MobileApp

# 安装依赖
npm install

# iOS 额外步骤
cd ios && pod install && cd ..
```

#### 2. 配置 API 地址
编辑 `src/services/AuthService.js`:
```javascript
// 第 8 行，替换为您的 API 域名
this.baseURL = 'https://your-api-domain.com';
```

编辑 `src/services/NotificationService.js`:
```javascript
// 第 10 行，替换为您的 API 域名
this.baseURL = 'https://your-api-domain.com';
```

#### 3. 配置网站 URL
编辑 `src/screens/MainScreen.js`:
```javascript
// 第 67 行，替换为您的网站 URL
url: 'https://your-website.com'
```

#### 4. 配置 Firebase (推送通知)
1. 在 [Firebase Console](https://console.firebase.google.com/) 创建项目
2. 添加 Android 应用，下载 `google-services.json` 到 `android/app/`
3. 添加 iOS 应用，下载 `GoogleService-Info.plist` 到 `ios/MobileApp/`

### 第三步：运行应用

#### Android
```bash
# 启动 Metro bundler
npm start

# 在新终端中运行 Android 应用
npm run android
```

#### iOS
```bash
# 启动 Metro bundler
npm start

# 在新终端中运行 iOS 应用
npm run ios
```

## API 集成说明

### 登录 API 兼容性

应用使用与 AdminApp 相同的登录 API：

```http
POST /api/oauth/company
Content-Type: application/x-www-form-urlencoded

grant_type=password&companyId=COMPANY123&staffId=STAFF123&password=PASSWORD123&clientId=MOBILE_APP
```

**响应格式**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 用户信息 API

```http
GET /api/staff/byLoggedStaff
Authorization: Bearer {access_token}
```

### 通知 API

```http
GET /api/inboxMessage?appType=MOBILE_APP&fromDate=2023-01-01
Authorization: Bearer {access_token}
```

## 网站开发指南

### 基本结构

将您的网站部署到可访问的 URL，确保支持 HTTPS。网站可以使用以下原生功能：

### 1. JavaScript Bridge API

```javascript
// 检查是否在移动应用中
if (window.NativeApp) {
  // 可以使用原生功能
}

// 请求权限
window.NativeApp.requestCameraPermission();
window.NativeApp.requestLocationPermission();

// 获取位置
window.NativeApp.getCurrentLocation();

// 生物识别
window.NativeApp.biometricLogin({ username: 'user123' });

// 关闭应用
window.NativeApp.closeApp();
```

### 2. 监听原生响应

```javascript
window.addEventListener('nativeMessage', function(event) {
  const message = event.detail;
  
  switch (message.type) {
    case 'LOCATION_SUCCESS':
      console.log('位置:', message.data);
      break;
    case 'BIOMETRIC_RESULT':
      console.log('生物识别:', message.success);
      break;
  }
});
```

### 3. 标准 Web API

网站也可以直接使用标准的 Web API：

```javascript
// 地理位置
navigator.geolocation.getCurrentPosition(success, error);

// 相机拍照
<input type="file" accept="image/*" capture="camera">

// 媒体流 (相机/麦克风)
navigator.mediaDevices.getUserMedia({ video: true, audio: true });
```

## 功能测试

### 使用提供的测试网站

1. 将 `WebsiteExample/index.html` 部署到 Web 服务器
2. 在移动应用中将网站 URL 指向测试页面
3. 测试各项功能：
   - QR码扫描
   - GPS定位
   - 相机拍照
   - 生物识别
   - 权限请求

### 测试步骤

1. **登录测试**
   - 使用 AdminApp 的用户凭据登录
   - 测试指纹/面容识别登录

2. **通知测试**
   - 检查通知列表显示
   - 测试通知标记已读/删除功能

3. **WebView 功能测试**
   - 打开测试网站
   - 逐一测试各项原生功能
   - 检查权限请求和响应

## 部署到生产环境

### Android 打包

```bash
cd android

# 生成签名密钥 (首次)
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 配置签名 (编辑 android/app/build.gradle)
# 添加签名配置

# 打包 APK
./gradlew assembleRelease

# APK 文件位置: android/app/build/outputs/apk/release/app-release.apk
```

### iOS 打包

1. 在 Xcode 中打开 `ios/MobileApp.xcworkspace`
2. 选择 Product > Archive
3. 按照 App Store Connect 流程上传

### 网站部署

1. 将网站文件上传到 Web 服务器
2. 确保支持 HTTPS
3. 配置适当的 CORS 头部（如果需要）

## 常见问题解决

### Q: 应用无法连接到 API
**A**: 检查以下项目：
- API 地址配置是否正确
- 网络连接是否正常
- API 服务器是否支持 CORS
- 证书是否有效（HTTPS）

### Q: 生物识别功能不工作
**A**: 确认：
- 设备支持生物识别
- 用户已在系统设置中启用
- 应用已获得生物识别权限

### Q: WebView 中的相机功能无法使用
**A**: 检查：
- 相机权限是否已授予
- WebView 配置是否正确
- 网站是否使用 HTTPS

### Q: 推送通知收不到
**A**: 验证：
- Firebase 配置文件是否正确放置
- 应用是否已获得通知权限
- FCM token 是否正确上传到服务器

## 技术支持

如需技术支持，请提供：
1. 详细的错误描述
2. 设备型号和系统版本
3. 应用版本号
4. 相关的日志信息

## 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持登录、通知、WebView 功能
- 支持生物识别登录
- 完整的原生功能桥接
