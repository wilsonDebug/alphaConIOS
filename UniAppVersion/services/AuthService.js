// uni-app 版本的认证服务
class AuthService {
  constructor() {
    this.baseURL = 'https://your-api-domain.com'
  }

  /**
   * 登录功能 - 复用 AdminApp 的登录 API
   */
  async login(companyId, staffId, password) {
    try {
      const response = await uni.request({
        url: `${this.baseURL}/api/oauth/company`,
        method: 'POST',
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data: {
          grant_type: 'password',
          companyId: companyId,
          staffId: staffId,
          password: password,
          clientId: 'MOBILE_APP'
        }
      })

      if (response.statusCode !== 200) {
        throw new Error('登录请求失败')
      }

      const tokenData = response.data
      
      // 保存 token
      await this.saveToken(tokenData)
      
      // 获取用户信息
      const userInfo = await this.getUserInfo(tokenData.access_token)
      
      // 更新设备信息
      await this.updateDeviceInfo(tokenData.access_token)
      
      return {
        success: true,
        token: tokenData,
        user: userInfo
      }
    } catch (error) {
      console.error('Login error:', error)
      throw this.handleError(error)
    }
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(token) {
    try {
      const response = await uni.request({
        url: `${this.baseURL}/api/staff/byLoggedStaff`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.statusCode !== 200) {
        throw new Error('获取用户信息失败')
      }

      const userInfo = response.data
      await this.saveUserInfo(userInfo)
      
      return userInfo
    } catch (error) {
      console.error('Get user info error:', error)
      throw this.handleError(error)
    }
  }

  /**
   * 更新设备信息
   */
  async updateDeviceInfo(token) {
    try {
      const systemInfo = uni.getSystemInfoSync()
      
      const deviceInfo = {
        type: 'MOBILE_APP',
        instanceId: await this.getDeviceId(),
        languageCode: 'EN',
        deviceOS: systemInfo.platform,
        osVersion: systemInfo.system,
        appVersion: systemInfo.appVersion || '1.0.0',
        appBuildNumber: '1'
      }

      await uni.request({
        url: `${this.baseURL}/api/device/update`,
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: deviceInfo
      })
    } catch (error) {
      console.warn('Update device info failed:', error)
    }
  }

  /**
   * 保存认证 token
   */
  async saveToken(tokenData) {
    try {
      await uni.setStorage({
        key: 'authToken',
        data: tokenData
      })
      
      await uni.setStorage({
        key: 'tokenTimestamp',
        data: Date.now()
      })
    } catch (error) {
      console.error('Save token error:', error)
    }
  }

  /**
   * 保存用户信息
   */
  async saveUserInfo(userInfo) {
    try {
      await uni.setStorage({
        key: 'userInfo',
        data: userInfo
      })
    } catch (error) {
      console.error('Save user info error:', error)
    }
  }

  /**
   * 获取保存的 token
   */
  async getToken() {
    try {
      const tokenRes = await uni.getStorage({
        key: 'authToken'
      })
      
      const timestampRes = await uni.getStorage({
        key: 'tokenTimestamp'
      })

      const token = tokenRes.data
      const timestamp = timestampRes.data

      // 检查 token 是否过期
      if (this.isTokenExpired(token, timestamp)) {
        await this.clearToken()
        return null
      }

      return token
    } catch (error) {
      console.error('Get token error:', error)
      return null
    }
  }

  /**
   * 检查 token 是否过期
   */
  isTokenExpired(token, timestamp) {
    if (!token.expires_in || !timestamp) return true
    
    const expirationTime = timestamp + (token.expires_in * 1000)
    return Date.now() >= expirationTime
  }

  /**
   * 清除认证信息
   */
  async clearToken() {
    try {
      await uni.removeStorage({ key: 'authToken' })
      await uni.removeStorage({ key: 'tokenTimestamp' })
      await uni.removeStorage({ key: 'userInfo' })
    } catch (error) {
      console.error('Clear token error:', error)
    }
  }

  /**
   * 登出
   */
  async logout() {
    await this.clearToken()
  }

  /**
   * 检查是否已登录
   */
  async isLoggedIn() {
    const token = await this.getToken()
    return token !== null
  }

  /**
   * 获取设备ID
   */
  async getDeviceId() {
    try {
      // uni-app 获取设备ID的方法
      const res = await uni.getStorage({ key: 'deviceId' })
      return res.data
    } catch (error) {
      // 生成新的设备ID
      const deviceId = this.generateDeviceId()
      await uni.setStorage({
        key: 'deviceId',
        data: deviceId
      })
      return deviceId
    }
  }

  /**
   * 生成设备ID
   */
  generateDeviceId() {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 错误处理
   */
  handleError(error) {
    if (error.statusCode) {
      switch (error.statusCode) {
        case 401:
          return new Error('用户名或密码错误')
        case 403:
          return new Error('账户被禁用或权限不足')
        case 404:
          return new Error('服务不可用')
        case 500:
          return new Error('服务器内部错误')
        default:
          return new Error('登录失败，请重试')
      }
    } else {
      return new Error(error.message || '网络连接失败')
    }
  }
}

export default new AuthService()
