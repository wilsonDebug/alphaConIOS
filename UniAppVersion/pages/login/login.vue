<template>
  <view class="login-container">
    <view class="logo-container">
      <image class="logo" src="/static/logo.png" mode="aspectFit"></image>
    </view>
    
    <view class="form-container">
      <text class="title">登录</text>
      
      <!-- 公司ID -->
      <view class="input-container">
        <uni-icons type="shop" size="20" color="#666"></uni-icons>
        <input 
          class="input" 
          placeholder="公司ID" 
          v-model="formData.companyId"
          :disabled="loading"
        />
      </view>
      
      <!-- 员工ID -->
      <view class="input-container">
        <uni-icons type="person" size="20" color="#666"></uni-icons>
        <input 
          class="input" 
          placeholder="员工ID" 
          v-model="formData.staffId"
          :disabled="loading"
        />
      </view>
      
      <!-- 密码 -->
      <view class="input-container">
        <uni-icons type="locked" size="20" color="#666"></uni-icons>
        <input 
          class="input" 
          placeholder="密码" 
          :password="!showPassword"
          v-model="formData.password"
          :disabled="loading"
        />
        <uni-icons 
          :type="showPassword ? 'eye-slash' : 'eye'" 
          size="20" 
          color="#666"
          @click="togglePassword"
        ></uni-icons>
      </view>
      
      <!-- 登录按钮 -->
      <button 
        class="login-btn" 
        :class="{ disabled: loading }"
        :disabled="loading"
        @click="handleLogin"
      >
        <text v-if="loading">登录中...</text>
        <text v-else>登录</text>
      </button>
      
      <!-- 生物识别登录 -->
      <button 
        v-if="biometricSupported && biometricEnabled"
        class="biometric-btn"
        @click="handleBiometricLogin"
        :disabled="loading"
      >
        <uni-icons type="fingerprint" size="20" color="#007AFF"></uni-icons>
        <text>使用生物识别登录</text>
      </button>
    </view>
  </view>
</template>

<script>
import AuthService from '@/services/AuthService.js'
import BiometricService from '@/services/BiometricService.js'

export default {
  data() {
    return {
      formData: {
        companyId: '',
        staffId: '',
        password: ''
      },
      loading: false,
      showPassword: false,
      biometricSupported: false,
      biometricEnabled: false
    }
  },
  
  onLoad() {
    this.checkBiometricSupport()
  },
  
  methods: {
    // 切换密码显示
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    
    // 检查生物识别支持
    async checkBiometricSupport() {
      try {
        const support = await BiometricService.checkSupport()
        this.biometricSupported = support.available
        
        if (support.available) {
          const enabled = await BiometricService.isEnabled()
          this.biometricEnabled = enabled
        }
      } catch (error) {
        console.error('检查生物识别支持失败:', error)
      }
    },
    
    // 传统登录
    async handleLogin() {
      const { companyId, staffId, password } = this.formData
      
      if (!companyId.trim() || !staffId.trim() || !password.trim()) {
        uni.showToast({
          title: '请填写所有必填字段',
          icon: 'none'
        })
        return
      }
      
      this.loading = true
      
      try {
        const result = await AuthService.login(
          companyId.trim(), 
          staffId.trim(), 
          password.trim()
        )
        
        if (result.success) {
          // 询问是否启用生物识别
          if (this.biometricSupported && !this.biometricEnabled) {
            this.showBiometricSetupDialog()
          } else {
            this.navigateToMain()
          }
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '登录失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 生物识别登录
    async handleBiometricLogin() {
      this.loading = true
      
      try {
        const result = await BiometricService.authenticate()
        
        if (result.success) {
          // 使用保存的凭据登录
          const loginResult = await AuthService.login(
            this.formData.companyId || 'saved',
            result.username,
            result.password
          )
          
          if (loginResult.success) {
            this.navigateToMain()
          }
        }
      } catch (error) {
        uni.showToast({
          title: error.message || '生物识别登录失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 显示生物识别设置对话框
    showBiometricSetupDialog() {
      uni.showModal({
        title: '启用生物识别登录',
        content: '是否要启用指纹或面容识别登录？',
        confirmText: '启用',
        cancelText: '跳过',
        success: (res) => {
          if (res.confirm) {
            this.enableBiometric()
          } else {
            this.navigateToMain()
          }
        }
      })
    },
    
    // 启用生物识别
    async enableBiometric() {
      try {
        await BiometricService.enable(
          this.formData.staffId, 
          this.formData.password
        )
        
        this.biometricEnabled = true
        
        uni.showToast({
          title: '生物识别登录已启用',
          icon: 'success'
        })
        
        setTimeout(() => {
          this.navigateToMain()
        }, 1500)
      } catch (error) {
        uni.showToast({
          title: error.message || '启用失败',
          icon: 'none'
        })
        this.navigateToMain()
      }
    },
    
    // 导航到主页
    navigateToMain() {
      uni.reLaunch({
        url: '/pages/main/main'
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.logo-container {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 240rpx;
  height: 240rpx;
}

.form-container {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1);
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  text-align: center;
  color: #333;
  margin-bottom: 60rpx;
}

.input-container {
  display: flex;
  align-items: center;
  border: 2rpx solid #ddd;
  border-radius: 16rpx;
  padding: 0 30rpx;
  margin-bottom: 30rpx;
  background-color: #f9f9f9;
}

.input {
  flex: 1;
  height: 100rpx;
  font-size: 32rpx;
  color: #333;
  margin-left: 20rpx;
}

.login-btn {
  width: 100%;
  height: 100rpx;
  background-color: #007AFF;
  color: #fff;
  border: none;
  border-radius: 16rpx;
  font-size: 32rpx;
  font-weight: bold;
  margin-top: 20rpx;
}

.login-btn.disabled {
  background-color: #ccc;
}

.biometric-btn {
  width: 100%;
  height: 100rpx;
  background-color: transparent;
  color: #007AFF;
  border: 2rpx solid #007AFF;
  border-radius: 16rpx;
  font-size: 32rpx;
  margin-top: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.biometric-btn text {
  margin-left: 16rpx;
}
</style>
