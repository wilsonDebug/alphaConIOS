# iOS构建完成指南

## 🎉 准备工作已完成

✅ **已完成的配置：**
- EAS CLI已安装 (版本: 16.19.3)
- eas.json配置文件已创建
- app.json已更新为Expo格式
- assets目录已创建

## 📱 下一步：完成iOS构建

### 1. 登录Expo账号
```bash
cd MobileAppUnified
eas login
```
输入您的Expo账号邮箱和密码。如果没有账号，请先在 https://expo.dev 注册。

### 2. 配置构建
```bash
eas build:configure
```
按提示选择平台和配置选项。

### 3. 开始iOS构建
```bash
# 构建开发版本
eas build --platform ios --profile development

# 或构建生产版本
eas build --platform ios --profile production
```

### 4. 监控构建进度
- 构建将在Expo的云端服务器上进行
- 您可以在终端中看到构建进度
- 也可以访问 https://expo.dev 查看详细状态

### 5. 下载IPA文件
构建完成后：
- 在Expo Dashboard中下载生成的IPA文件
- 或使用命令行下载：`eas build:list`

## 📋 重要说明

### 免费账号限制
- 每月10次免费构建
- 构建时间约10-20分钟

### Apple Developer账号
- 发布到App Store需要Apple Developer账号
- 可以使用TestFlight进行内部测试

### 构建配置
当前配置支持三种构建类型：
- **development**: 开发版本，包含调试信息
- **preview**: 预览版本，用于内部测试
- **production**: 生产版本，用于App Store发布

## 🚀 快速开始命令

```bash
# 进入项目目录
cd MobileAppUnified

# 登录Expo
eas login

# 开始构建
eas build --platform ios --profile production
```

## 📞 需要帮助？

如果遇到问题：
1. 检查网络连接
2. 确保Expo账号有效
3. 查看构建日志获取详细错误信息
4. 访问 https://docs.expo.dev/build/introduction/ 获取官方文档

---

**构建完成后，请将生成的IPA文件保存到 `apk/` 目录中，以便统一管理。**
