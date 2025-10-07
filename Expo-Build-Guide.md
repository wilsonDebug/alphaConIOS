# Expo iOS 构建指南

## 快速开始 🚀

### 1. 安装 Expo CLI
```bash
npm install -g @expo/cli
```

### 2. 登录 Expo 账户
```bash
npx expo login
```
如果没有账户，访问 https://expo.dev 免费注册

### 3. 初始化项目
```bash
cd MobileAppUnified
npx expo install
```

### 4. 构建 iOS 应用
```bash
# 构建 iOS 应用 (云端构建，免费)
npx eas build --platform ios --profile preview

# 或者构建开发版本
npx eas build --platform ios --profile development
```

### 5. 下载构建结果
构建完成后，您将获得：
- 📱 `.ipa` 文件 (用于 Appetize.io 测试)
- 🔗 直接下载链接
- 📊 构建日志和详情

## 优势
✅ **免费使用**: 每月免费构建额度  
✅ **无需 Mac**: 云端 macOS 环境  
✅ **自动配置**: 无需复杂的 Xcode 设置  
✅ **快速构建**: 通常 5-10 分钟完成  

## 用于 Appetize.io 测试
1. 下载生成的 `.ipa` 文件
2. 访问 https://appetize.io
3. 上传 `.ipa` 文件
4. 开始在线 iOS 测试

## 备选方案
如果 Expo 不适合，还可以尝试：
- **CodeMagic**: https://codemagic.io (免费额度)
- **Bitrise**: https://www.bitrise.io (免费额度)
- **AppCenter**: https://appcenter.ms (微软提供)

立即开始使用 Expo 构建您的 iOS 应用！