# iOS 应用发布配置完整指南

## 🚨 重要说明

**当前状态**: 项目使用默认配置，无法直接发布到 App Store
**需要行动**: 必须先完成开发者账号和应用配置

## 📋 发布前必备清单

### 第一步：获得 Apple Developer 账号

#### 个人开发者账号 ($99/年)
```bash
适用场景：
✅ 个人开发者
✅ 小型团队
✅ 独立应用发布

申请流程：
1. 访问 https://developer.apple.com
2. 点击 "Account" 注册
3. 选择 "Individual" 账号类型
4. 支付 $99 年费
5. 等待审核通过 (1-2个工作日)
```

#### 企业开发者账号 ($299/年)
```bash
适用场景：
✅ 公司/企业
✅ 团队开发
✅ 企业内部分发

申请流程：
1. 准备企业营业执照
2. 访问 https://developer.apple.com
3. 选择 "Organization" 账号类型
4. 提交企业认证材料
5. 支付 $299 年费
6. 等待审核通过 (3-7个工作日)
```

### 第二步：配置应用信息

#### 1. 确定 Bundle ID
```bash
当前配置: org.reactjs.native.example.MobileAppUnified
问题: 这是 React Native 默认模板 ID

建议配置:
- 个人开发者: com.yourname.mobileappunified
- 企业开发者: com.yourcompany.mobileappunified
- 示例: com.alphacon.mobileappunified

注意: Bundle ID 必须全球唯一，一旦确定不能更改
```

#### 2. 获取 Team ID
```bash
获取方式：
1. 登录 https://developer.apple.com
2. 进入 "Account" -> "Membership"
3. 查看 "Team ID" (10位字符串)
4. 示例: ABCD123456

用途：
- 代码签名
- 应用分发
- 证书管理
```

#### 3. 创建 App Store Connect 应用
```bash
步骤：
1. 访问 https://appstoreconnect.apple.com
2. 点击 "My Apps" -> "+" -> "New App"
3. 填写应用信息：
   - Name: MobileAppUnified (或您的应用名称)
   - Bundle ID: 选择已注册的 Bundle ID
   - SKU: 唯一标识符 (如: mobileappunified2025)
   - User Access: Full Access
```

## 🔧 项目配置更新

### 更新 Bundle ID 配置

#### 方法1: 通过 Xcode (推荐)
```bash
1. 打开 MobileAppUnified.xcworkspace
2. 选择项目根节点
3. 在 "Signing & Capabilities" 中：
   - Team: 选择您的开发者团队
   - Bundle Identifier: 输入新的 Bundle ID
4. Xcode 会自动处理证书和描述文件
```

#### 方法2: 手动修改配置文件