import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

class AuthService {
  constructor() {
    // 复用 AdminApp 的 API 基础URL
    this.baseURL = 'https://your-api-domain.com'; // 替换为实际的API域名
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });
  }

  /**
   * 登录功能 - 复用 AdminApp 的登录 API
   * @param {string} companyId 
   * @param {string} staffId 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  async login(companyId, staffId, password) {
    try {
      // 复用 AdminApp 的登录 API: POST /api/oauth/company
      const response = await this.api.post('/api/oauth/company', {
        grant_type: 'password',
        companyId: companyId,
        staffId: staffId,
        password: password,
        clientId: 'MOBILE_APP' // 区分移动应用
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const tokenData = response.data;
      
      // 保存 token
      await this.saveToken(tokenData);
      
      // 获取用户信息
      const userInfo = await this.getUserInfo(tokenData.access_token);
      
      // 更新设备信息
      await this.updateDeviceInfo(tokenData.access_token);
      
      return {
        success: true,
        token: tokenData,
        user: userInfo
      };
    } catch (error) {
      console.error('Login error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取用户信息 - 复用 AdminApp 的 API
   * @param {string} token 
   * @returns {Promise<Object>}
   */
  async getUserInfo(token) {
    try {
      const response = await this.api.get('/api/staff/byLoggedStaff', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const userInfo = response.data;
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      return userInfo;
    } catch (error) {
      console.error('Get user info error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 更新设备信息 - 复用 AdminApp 的逻辑
   * @param {string} token 
   */
  async updateDeviceInfo(token) {
    try {
      const deviceInfo = {
        type: 'MOBILE_APP',
        instanceId: await this.getFirebaseToken(), // 如果使用 Firebase
        languageCode: 'EN', // 或根据用户设置
        deviceOS: Platform.OS === 'ios' ? 'iOS' : 'Android',
        osVersion: DeviceInfo.getSystemVersion(),
        appVersion: DeviceInfo.getVersion(),
        appBuildNumber: DeviceInfo.getBuildNumber()
      };

      await this.api.post('/api/device/update', deviceInfo, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.warn('Update device info failed:', error);
      // 不抛出错误，因为这不是关键功能
    }
  }

  /**
   * 保存认证 token
   * @param {Object} tokenData 
   */
  async saveToken(tokenData) {
    try {
      await AsyncStorage.setItem('authToken', JSON.stringify(tokenData));
      await AsyncStorage.setItem('tokenTimestamp', Date.now().toString());
    } catch (error) {
      console.error('Save token error:', error);
    }
  }

  /**
   * 获取保存的 token
   * @returns {Promise<Object|null>}
   */
  async getToken() {
    try {
      const tokenStr = await AsyncStorage.getItem('authToken');
      if (!tokenStr) return null;
      
      const token = JSON.parse(tokenStr);
      const timestamp = await AsyncStorage.getItem('tokenTimestamp');
      
      // 检查 token 是否过期
      if (this.isTokenExpired(token, timestamp)) {
        await this.clearToken();
        return null;
      }
      
      return token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  /**
   * 检查 token 是否过期
   * @param {Object} token 
   * @param {string} timestamp 
   * @returns {boolean}
   */
  isTokenExpired(token, timestamp) {
    if (!token.expires_in || !timestamp) return true;
    
    const expirationTime = parseInt(timestamp) + (token.expires_in * 1000);
    return Date.now() >= expirationTime;
  }

  /**
   * 清除认证信息
   */
  async clearToken() {
    try {
      await AsyncStorage.multiRemove(['authToken', 'tokenTimestamp', 'userInfo']);
    } catch (error) {
      console.error('Clear token error:', error);
    }
  }

  /**
   * 登出
   */
  async logout() {
    await this.clearToken();
  }

  /**
   * 检查是否已登录
   * @returns {Promise<boolean>}
   */
  async isLoggedIn() {
    const token = await this.getToken();
    return token !== null;
  }

  /**
   * 获取 Firebase token (如果使用推送通知)
   * @returns {Promise<string>}
   */
  async getFirebaseToken() {
    try {
      // 这里需要根据实际的 Firebase 配置来实现
      return '';
    } catch (error) {
      console.warn('Get Firebase token failed:', error);
      return '';
    }
  }

  /**
   * 错误处理
   * @param {Error} error 
   * @returns {Error}
   */
  handleError(error) {
    if (error.response) {
      // 服务器响应错误
      const { status, data } = error.response;
      switch (status) {
        case 401:
          return new Error('用户名或密码错误');
        case 403:
          return new Error('账户被禁用或权限不足');
        case 404:
          return new Error('服务不可用');
        case 500:
          return new Error('服务器内部错误');
        default:
          return new Error(data?.message || '登录失败，请重试');
      }
    } else if (error.request) {
      // 网络错误
      return new Error('网络连接失败，请检查网络设置');
    } else {
      // 其他错误
      return new Error(error.message || '未知错误');
    }
  }
}

export default new AuthService();
