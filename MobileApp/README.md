# MobileApp - 跨平台移动应用

基于 AdminApp 的跨平台移动应用，支持 Android 和 iOS，提供登录、通知、WebView 等功能。

## 功能特性

### ✅ 核心功能
- **登录系统**: 复用 AdminApp 的登录 API (`/api/oauth/company`)
- **指纹/生物识别登录**: 支持指纹识别和面容识别
- **推送通知**: 复用 AdminApp 的通知 API (`/api/inboxMessage`)
- **WebView 集成**: 嵌入网站，支持原生功能桥接

### ✅ WebView 中的网站功能支持
- **QR码扫描**: 使用 `getUserMedia` API + JavaScript 库
- **GPS定位**: 使用标准的 `Geolocation` API
- **相机拍照**: 使用 `<input type="file" capture="camera">` 或 `getUserMedia`
- **文件上传**: 支持从相册选择或拍照上传
- **JavaScript Bridge**: 原生功能与网站的双向通信

## 技术架构

- **框架**: React Native 0.72.6
- **导航**: React Navigation 6.x
- **状态管理**: React Hooks + Context
- **网络请求**: Axios
- **生物识别**: react-native-biometrics
- **推送通知**: Firebase Cloud Messaging
- **WebView**: react-native-webview
- **权限管理**: react-native-permissions

## 项目结构

```
MobileApp/
├── src/
│   ├── services/           # 服务层
│   │   ├── AuthService.js      # 认证服务（复用AdminApp API）
│   │   ├── BiometricService.js # 生物识别服务
│   │   └── NotificationService.js # 通知服务
│   ├── screens/            # 页面组件
│   │   ├── LoginScreen.js      # 登录页面
│   │   ├── MainScreen.js       # 主页面
│   │   ├── WebViewScreen.js    # WebView容器
│   │   └── NotificationScreen.js # 通知页面
│   └── components/         # 通用组件
├── android/                # Android 特定代码
├── ios/                    # iOS 特定代码
└── package.json
```

## 安装和运行

### 环境要求
- Node.js >= 16
- React Native CLI
- Android Studio (Android 开发)
- Xcode (iOS 开发)

### 安装依赖
```bash
cd MobileApp
npm install

# iOS 额外步骤
cd ios && pod install && cd ..
```

### 运行应用
```bash
# Android
npm run android

# iOS
npm run ios
```

## 配置说明

### 1. API 配置
在 `src/services/AuthService.js` 中修改 API 基础URL：
```javascript
this.baseURL = 'https://your-api-domain.com'; // 替换为实际的API域名
```

### 2. 网站URL配置
在 `src/screens/MainScreen.js` 中修改网站URL：
```javascript
navigation.navigate('WebView', {
  url: 'https://your-website.com' // 替换为实际的网站URL
});
```

### 3. Firebase 配置
1. 在 Firebase Console 创建项目
2. 下载 `google-services.json` (Android) 和 `GoogleService-Info.plist` (iOS)
3. 将文件放置到对应的目录中

## WebView 中的网站开发指南

### JavaScript Bridge API

网站可以通过以下 API 与原生应用通信：

```javascript
// 请求相机权限
window.NativeApp.requestCameraPermission();

// 请求位置权限
window.NativeApp.requestLocationPermission();

// 获取当前位置
window.NativeApp.getCurrentLocation();

// 生物识别登录
window.NativeApp.biometricLogin({ username: 'user123' });

// 关闭应用
window.NativeApp.closeApp();
```

### 监听原生响应

```javascript
window.addEventListener('nativeMessage', function(event) {
  const message = event.detail;
  
  switch (message.type) {
    case 'LOCATION_SUCCESS':
      console.log('位置信息:', message.data);
      break;
    case 'BIOMETRIC_RESULT':
      console.log('生物识别结果:', message.success);
      break;
    // ... 其他消息类型
  }
});
```

### 网站功能实现示例

#### 1. QR码扫描
```html
<video id="video" width="300" height="200"></video>
<script src="https://unpkg.com/@zxing/library@latest"></script>
<script>
const codeReader = new ZXing.BrowserQRCodeReader();
codeReader.decodeFromVideoDevice(null, 'video', (result, err) => {
  if (result) {
    console.log('扫描结果:', result.text);
  }
});
</script>
```

#### 2. GPS定位
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log('位置:', position.coords.latitude, position.coords.longitude);
  },
  (error) => {
    console.error('定位失败:', error);
  }
);
```

#### 3. 相机拍照
```html
<input type="file" accept="image/*" capture="camera" onchange="handlePhoto(event)">
<script>
function handlePhoto(event) {
  const file = event.target.files[0];
  if (file) {
    console.log('拍照文件:', file);
    // 处理图片上传
  }
}
</script>
```

## 权限说明

### Android 权限
- `CAMERA`: 相机访问
- `ACCESS_FINE_LOCATION`: 精确位置
- `READ_EXTERNAL_STORAGE`: 读取存储
- `USE_BIOMETRIC`: 生物识别

### iOS 权限
- `NSCameraUsageDescription`: 相机使用说明
- `NSLocationWhenInUseUsageDescription`: 位置使用说明
- `NSFaceIDUsageDescription`: Face ID 使用说明

## API 兼容性

### 登录 API
```
POST /api/oauth/company
{
  "grant_type": "password",
  "companyId": "company123",
  "staffId": "staff123", 
  "password": "password123",
  "clientId": "MOBILE_APP"
}
```

### 通知 API
```
GET /api/inboxMessage?appType=MOBILE_APP&fromDate=2023-01-01
Authorization: Bearer {token}
```

## 部署说明

### Android 打包
```bash
cd android
./gradlew assembleRelease
```

### iOS 打包
1. 在 Xcode 中打开 `ios/MobileApp.xcworkspace`
2. 选择 Product > Archive
3. 按照 App Store 发布流程操作

## 常见问题

### Q: WebView 中的相机功能不工作？
A: 确保在 AndroidManifest.xml 和 Info.plist 中正确配置了相机权限，并且 WebView 设置了 `mediaPlaybackRequiresUserAction={false}`。

### Q: 生物识别功能在某些设备上不可用？
A: 检查设备是否支持生物识别，并确保用户已在系统设置中启用。

### Q: 推送通知收不到？
A: 检查 Firebase 配置是否正确，确保设备已获得通知权限。

## 支持

如有问题，请查看：
1. [React Native 官方文档](https://reactnative.dev/)
2. [Firebase 文档](https://firebase.google.com/docs)
3. 项目 Issues 页面

## 许可证

MIT License
