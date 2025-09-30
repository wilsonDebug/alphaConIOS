import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthService from '../services/AuthService';
import NotificationService from '../services/NotificationService';
import BiometricService from '../services/BiometricService';

const MainScreen = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    initializeScreen();
    
    // 设置导航焦点监听器，每次进入页面时刷新数据
    const unsubscribe = navigation.addListener('focus', () => {
      loadUnreadCount();
    });

    return unsubscribe;
  }, [navigation]);

  /**
   * 初始化页面
   */
  const initializeScreen = async () => {
    await loadUnreadCount();
    await checkBiometricStatus();
  };

  /**
   * 加载未读通知数量
   */
  const loadUnreadCount = async () => {
    try {
      const count = await NotificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Load unread count error:', error);
    }
  };

  /**
   * 检查生物识别状态
   */
  const checkBiometricStatus = async () => {
    try {
      const enabled = await BiometricService.isBiometricEnabled();
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Check biometric status error:', error);
    }
  };

  /**
   * 打开网站
   */
  const openWebsite = () => {
    navigation.navigate('WebView', {
      url: 'https://your-website.com' // 替换为实际的网站URL
    });
  };

  /**
   * 打开通知页面
   */
  const openNotifications = () => {
    navigation.navigate('Notification');
  };

  /**
   * 打开设置页面
   */
  const openSettings = () => {
    navigation.navigate('Settings');
  };

  /**
   * 登出
   */
  const handleLogout = () => {
    Alert.alert(
      '确认登出',
      '确定要登出当前账户吗？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '登出',
          style: 'destructive',
          onPress: async () => {
            try {
              await AuthService.logout();
              navigation.replace('Login');
            } catch (error) {
              Alert.alert('错误', '登出失败，请重试');
            }
          }
        }
      ]
    );
  };

  /**
   * 切换生物识别设置
   */
  const toggleBiometric = async () => {
    try {
      if (biometricEnabled) {
        // 禁用生物识别
        BiometricService.showBiometricDisableDialog(
          async () => {
            try {
              await BiometricService.disableBiometricLogin();
              setBiometricEnabled(false);
              Alert.alert('成功', '生物识别登录已禁用');
            } catch (error) {
              Alert.alert('错误', error.message);
            }
          },
          () => {} // 取消回调
        );
      } else {
        // 启用生物识别
        const support = await BiometricService.checkBiometricSupport();
        if (!support.available) {
          Alert.alert('不支持', '您的设备不支持生物识别功能');
          return;
        }

        BiometricService.showBiometricSetupDialog(
          async () => {
            try {
              // 这里需要用户重新输入密码来启用生物识别
              Alert.alert(
                '需要验证',
                '启用生物识别登录需要重新输入密码进行验证',
                [
                  { text: '取消', style: 'cancel' },
                  { text: '去验证', onPress: () => navigation.navigate('BiometricSetup') }
                ]
              );
            } catch (error) {
              Alert.alert('错误', error.message);
            }
          },
          () => {} // 取消回调
        );
      }
    } catch (error) {
      Alert.alert('错误', error.message);
    }
  };

  /**
   * 渲染功能卡片
   */
  const renderFeatureCard = (title, subtitle, iconName, onPress, badge = null) => (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <View style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <Icon name={iconName} size={32} color="#007AFF" />
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <Icon name="chevron-right" size={24} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* 头部 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>欢迎回来</Text>
          <Text style={styles.appName}>移动应用</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="logout" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* 主要功能区域 */}
      <View style={styles.content}>
        {/* 网站入口 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>主要功能</Text>
          {renderFeatureCard(
            '打开网站',
            '访问主要业务功能',
            'web',
            openWebsite
          )}
        </View>

        {/* 通知和设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他功能</Text>
          
          {renderFeatureCard(
            '通知消息',
            '查看最新通知和消息',
            'notifications',
            openNotifications,
            unreadCount > 0 ? unreadCount : null
          )}

          {renderFeatureCard(
            '生物识别',
            biometricEnabled ? '已启用' : '未启用',
            'fingerprint',
            toggleBiometric
          )}

          {renderFeatureCard(
            '设置',
            '应用设置和账户管理',
            'settings',
            openSettings
          )}
        </View>
      </View>

      {/* 底部信息 */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>版本 1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    position: 'relative',
    marginRight: 15,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});

export default MainScreen;
