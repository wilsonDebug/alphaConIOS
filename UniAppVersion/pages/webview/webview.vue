<template>
  <view class="webview-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <uni-load-more status="loading" :content-text="loadingText"></uni-load-more>
    </view>
    
    <!-- WebView -->
    <web-view 
      :src="websiteUrl" 
      @message="handleMessage"
      @load="handleLoad"
      @error="handleError"
    ></web-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      websiteUrl: 'https://your-website.com',
      loading: true,
      loadingText: {
        contentdown: '加载中...',
        contentrefresh: '加载中...',
        contentnomore: '加载完成'
      }
    }
  },
  
  onLoad(options) {
    // 从参数获取网站URL
    if (options.url) {
      this.websiteUrl = decodeURIComponent(options.url)
    }
    
    // 请求必要权限
    this.requestPermissions()
  },
  
  methods: {
    /**
     * 请求必要权限
     */
    async requestPermissions() {
      try {
        // 请求相机权限
        await this.requestCameraPermission()
        
        // 请求位置权限
        await this.requestLocationPermission()
      } catch (error) {
        console.error('请求权限失败:', error)
      }
    },
    
    /**
     * 请求相机权限
     */
    async requestCameraPermission() {
      try {
        const result = await uni.authorize({
          scope: 'scope.camera'
        })
        console.log('相机权限已授予')
      } catch (error) {
        console.warn('相机权限被拒绝')
      }
    },
    
    /**
     * 请求位置权限
     */
    async requestLocationPermission() {
      try {
        const result = await uni.authorize({
          scope: 'scope.userLocation'
        })
        console.log('位置权限已授予')
      } catch (error) {
        console.warn('位置权限被拒绝')
      }
    },
    
    /**
     * 处理来自 WebView 的消息
     */
    handleMessage(event) {
      try {
        const message = JSON.parse(event.detail.data[0])
        console.log('收到网站消息:', message)
        
        switch (message.type) {
          case 'REQUEST_CAMERA_PERMISSION':
            this.handleCameraPermissionRequest()
            break
          case 'REQUEST_LOCATION_PERMISSION':
            this.handleLocationPermissionRequest()
            break
          case 'GET_CURRENT_LOCATION':
            this.handleGetCurrentLocation()
            break
          case 'BIOMETRIC_LOGIN':
            this.handleBiometricLogin(message.data)
            break
          case 'CLOSE_APP':
            this.closeApp()
            break
          default:
            console.warn('未知消息类型:', message.type)
        }
      } catch (error) {
        console.error('处理消息失败:', error)
      }
    },
    
    /**
     * 处理相机权限请求
     */
    async handleCameraPermissionRequest() {
      try {
        await uni.authorize({
          scope: 'scope.camera'
        })
        
        this.sendMessageToWebsite({
          type: 'CAMERA_PERMISSION_RESULT',
          granted: true
        })
      } catch (error) {
        this.sendMessageToWebsite({
          type: 'CAMERA_PERMISSION_RESULT',
          granted: false
        })
      }
    },
    
    /**
     * 处理位置权限请求
     */
    async handleLocationPermissionRequest() {
      try {
        await uni.authorize({
          scope: 'scope.userLocation'
        })
        
        this.sendMessageToWebsite({
          type: 'LOCATION_PERMISSION_RESULT',
          granted: true
        })
      } catch (error) {
        this.sendMessageToWebsite({
          type: 'LOCATION_PERMISSION_RESULT',
          granted: false
        })
      }
    },
    
    /**
     * 获取当前位置
     */
    async handleGetCurrentLocation() {
      try {
        const result = await uni.getLocation({
          type: 'gcj02',
          altitude: true
        })
        
        this.sendMessageToWebsite({
          type: 'LOCATION_SUCCESS',
          data: {
            latitude: result.latitude,
            longitude: result.longitude,
            accuracy: result.accuracy,
            altitude: result.altitude,
            timestamp: Date.now()
          }
        })
      } catch (error) {
        this.sendMessageToWebsite({
          type: 'LOCATION_ERROR',
          error: error.errMsg || '获取位置失败'
        })
      }
    },
    
    /**
     * 处理生物识别登录
     */
    async handleBiometricLogin(data) {
      try {
        // uni-app 中的生物识别需要使用插件
        // 这里模拟生物识别过程
        const result = await this.authenticateWithBiometric()
        
        this.sendMessageToWebsite({
          type: 'BIOMETRIC_RESULT',
          success: result.success,
          data: result.data
        })
      } catch (error) {
        this.sendMessageToWebsite({
          type: 'BIOMETRIC_RESULT',
          success: false,
          error: error.message
        })
      }
    },
    
    /**
     * 生物识别验证 (需要插件支持)
     */
    async authenticateWithBiometric() {
      // 这里需要使用 uni-app 的生物识别插件
      // 例如: uni-biometric 或其他第三方插件
      
      return new Promise((resolve, reject) => {
        // 模拟生物识别过程
        uni.showModal({
          title: '生物识别验证',
          content: '请进行生物识别验证',
          confirmText: '验证成功',
          cancelText: '验证失败',
          success: (res) => {
            if (res.confirm) {
              resolve({
                success: true,
                data: {
                  authenticated: true,
                  timestamp: Date.now()
                }
              })
            } else {
              reject(new Error('生物识别验证失败'))
            }
          }
        })
      })
    },
    
    /**
     * 发送消息到网站
     */
    sendMessageToWebsite(message) {
      // uni-app 的 web-view 组件发送消息的方法有限
      // 通常需要通过 URL 参数或其他方式传递信息
      console.log('发送消息到网站:', message)
      
      // 这里可能需要使用其他方式，比如:
      // 1. 修改 WebView 的 URL 参数
      // 2. 使用 postMessage (如果支持)
      // 3. 通过服务器中转
    },
    
    /**
     * WebView 加载完成
     */
    handleLoad() {
      this.loading = false
      console.log('WebView 加载完成')
    },
    
    /**
     * WebView 加载错误
     */
    handleError(error) {
      this.loading = false
      console.error('WebView 加载错误:', error)
      
      uni.showModal({
        title: '加载失败',
        content: '网页加载失败，请检查网络连接',
        confirmText: '重试',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            // 重新加载
            this.loading = true
          } else {
            // 返回上一页
            uni.navigateBack()
          }
        }
      })
    },
    
    /**
     * 关闭应用
     */
    closeApp() {
      uni.navigateBack()
    }
  },
  
  onBackPress() {
    // 处理返回键
    return false // 允许返回
  }
}
</script>

<style scoped>
.webview-container {
  width: 100%;
  height: 100vh;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}
</style>
