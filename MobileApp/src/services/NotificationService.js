import messaging from '@react-native-firebase/messaging';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AuthService from './AuthService';

class NotificationService {
  constructor() {
    this.baseURL = 'https://your-api-domain.com'; // 替换为实际的API域名
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
    });
  }

  /**
   * 初始化推送通知服务
   */
  async initialize() {
    try {
      // 请求通知权限
      await this.requestPermission();
      
      // 获取 FCM token
      const token = await this.getFCMToken();
      if (token) {
        await this.saveFCMToken(token);
      }

      // 设置消息处理器
      this.setupMessageHandlers();
      
      return true;
    } catch (error) {
      console.error('Initialize notification service error:', error);
      return false;
    }
  }

  /**
   * 请求通知权限
   */
  async requestPermission() {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        throw new Error('通知权限被拒绝');
      }

      console.log('Notification permission granted');
      return true;
    } catch (error) {
      console.error('Request notification permission error:', error);
      throw error;
    }
  }

  /**
   * 获取 FCM token
   */
  async getFCMToken() {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Get FCM token error:', error);
      return null;
    }
  }

  /**
   * 保存 FCM token
   */
  async saveFCMToken(token) {
    try {
      await AsyncStorage.setItem('fcmToken', token);
    } catch (error) {
      console.error('Save FCM token error:', error);
    }
  }

  /**
   * 设置消息处理器
   */
  setupMessageHandlers() {
    // 前台消息处理
    messaging().onMessage(async remoteMessage => {
      console.log('Foreground message received:', remoteMessage);
      this.handleForegroundMessage(remoteMessage);
    });

    // 后台消息处理
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);
    });

    // 应用从通知打开时的处理
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('App opened from notification:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });

    // 应用从关闭状态通过通知打开时的处理
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('App opened from quit state by notification:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });

    // Token 刷新处理
    messaging().onTokenRefresh(token => {
      console.log('FCM token refreshed:', token);
      this.saveFCMToken(token);
    });
  }

  /**
   * 处理前台消息
   */
  handleForegroundMessage(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    if (notification) {
      Alert.alert(
        notification.title || '新消息',
        notification.body || '',
        [
          {
            text: '忽略',
            style: 'cancel'
          },
          {
            text: '查看',
            onPress: () => this.handleNotificationOpen(remoteMessage)
          }
        ]
      );
    }
  }

  /**
   * 处理通知点击
   */
  handleNotificationOpen(remoteMessage) {
    const { data } = remoteMessage;
    
    // 根据通知数据进行相应的导航或处理
    if (data && data.type) {
      switch (data.type) {
        case 'message':
          // 导航到消息页面
          break;
        case 'announcement':
          // 导航到公告页面
          break;
        default:
          // 默认处理
          break;
      }
    }
  }

  /**
   * 获取通知列表 - 复用 AdminApp 的 API
   * @param {number} offset 
   * @param {number} limit 
   * @param {string} fromDate 
   * @returns {Promise<Array>}
   */
  async getNotificationList(offset = 0, limit = 20, fromDate = null) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        throw new Error('未登录');
      }

      const params = {
        appType: 'MOBILE_APP',
        offset,
        limit
      };

      if (fromDate) {
        params.fromDate = fromDate;
      }

      const response = await this.api.get('/api/inboxMessage', {
        headers: {
          'Authorization': `Bearer ${token.access_token}`
        },
        params
      });

      return response.data.map(notification => ({
        id: notification.id,
        title: notification.title || notification.title_TC,
        body: notification.body || notification.body_TC,
        senderName: notification.senderName,
        senderImage: notification.senderImage,
        createdAt: notification.createdAt,
        read: notification.read || false,
        type: notification.inboxType,
        data: notification
      }));
    } catch (error) {
      console.error('Get notification list error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 标记通知为已读
   * @param {Array<number>} notificationIds 
   * @returns {Promise<boolean>}
   */
  async markNotificationsAsRead(notificationIds) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        throw new Error('未登录');
      }

      await this.api.post('/api/inboxMessage/markAsRead', {
        ids: notificationIds
      }, {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      return true;
    } catch (error) {
      console.error('Mark notifications as read error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 删除通知
   * @param {Array<number>} notificationIds 
   * @returns {Promise<boolean>}
   */
  async deleteNotifications(notificationIds) {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        throw new Error('未登录');
      }

      await this.api.delete('/api/inboxMessage', {
        headers: {
          'Authorization': `Bearer ${token.access_token}`,
          'Content-Type': 'application/json'
        },
        data: {
          ids: notificationIds
        }
      });

      return true;
    } catch (error) {
      console.error('Delete notifications error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取未读通知数量
   * @returns {Promise<number>}
   */
  async getUnreadCount() {
    try {
      const token = await AuthService.getToken();
      if (!token) {
        return 0;
      }

      const response = await this.api.get('/api/inboxMessage/unreadCount', {
        headers: {
          'Authorization': `Bearer ${token.access_token}`
        },
        params: {
          appType: 'MOBILE_APP'
        }
      });

      return response.data.count || 0;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  }

  /**
   * 订阅主题
   * @param {string} topic 
   */
  async subscribeToTopic(topic) {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error('Subscribe to topic error:', error);
    }
  }

  /**
   * 取消订阅主题
   * @param {string} topic 
   */
  async unsubscribeFromTopic(topic) {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error('Unsubscribe from topic error:', error);
    }
  }

  /**
   * 错误处理
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 401:
          return new Error('认证失败，请重新登录');
        case 403:
          return new Error('权限不足');
        case 404:
          return new Error('服务不可用');
        case 500:
          return new Error('服务器内部错误');
        default:
          return new Error(data?.message || '操作失败，请重试');
      }
    } else if (error.request) {
      return new Error('网络连接失败，请检查网络设置');
    } else {
      return new Error(error.message || '未知错误');
    }
  }
}

export default new NotificationService();
