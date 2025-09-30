import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  BackHandler,
  ActivityIndicator,
  Text,
  StatusBar,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from '@react-native-community/geolocation';

const WebViewScreen = ({ navigation, route }) => {
  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  // 从路由参数获取网站URL，或使用默认URL
  const websiteUrl = route.params?.url || 'https://your-website.com';

  useEffect(() => {
    // 处理Android返回键
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  /**
   * 处理返回键
   */
  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  /**
   * 请求权限
   */
  const requestPermission = async (permission) => {
    try {
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Request permission error:', error);
      return false;
    }
  };

  /**
   * 检查权限
   */
  const checkPermission = async (permission) => {
    try {
      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('Check permission error:', error);
      return false;
    }
  };

  /**
   * JavaScript Bridge - 处理来自网站的消息
   */
  const handleMessage = async (event) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      console.log('Received message from website:', message);

      switch (message.type) {
        case 'REQUEST_CAMERA_PERMISSION':
          await handleCameraPermissionRequest();
          break;
        case 'REQUEST_LOCATION_PERMISSION':
          await handleLocationPermissionRequest();
          break;
        case 'GET_CURRENT_LOCATION':
          await handleGetCurrentLocation();
          break;
        case 'BIOMETRIC_LOGIN':
          await handleBiometricLogin(message.data);
          break;
        case 'CLOSE_APP':
          navigation.goBack();
          break;
        case 'OPEN_EXTERNAL_URL':
          await handleOpenExternalURL(message.data);
          break;
        case 'START_QR_SCAN':
          await handleStartQRScan();
          break;
        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Handle message error:', error);
    }
  };

  /**
   * 处理相机权限请求
   */
  const handleCameraPermissionRequest = async () => {
    const permission = Platform.OS === 'ios' 
      ? PERMISSIONS.IOS.CAMERA 
      : PERMISSIONS.ANDROID.CAMERA;

    const hasPermission = await checkPermission(permission);
    
    if (!hasPermission) {
      const granted = await requestPermission(permission);
      sendMessageToWebsite({
        type: 'CAMERA_PERMISSION_RESULT',
        granted
      });
    } else {
      sendMessageToWebsite({
        type: 'CAMERA_PERMISSION_RESULT',
        granted: true
      });
    }
  };

  /**
   * 处理位置权限请求
   */
  const handleLocationPermissionRequest = async () => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const hasPermission = await checkPermission(permission);
    
    if (!hasPermission) {
      const granted = await requestPermission(permission);
      sendMessageToWebsite({
        type: 'LOCATION_PERMISSION_RESULT',
        granted
      });
    } else {
      sendMessageToWebsite({
        type: 'LOCATION_PERMISSION_RESULT',
        granted: true
      });
    }
  };

  /**
   * 处理获取当前位置
   */
  const handleGetCurrentLocation = async () => {
    const permission = Platform.OS === 'ios'
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const hasPermission = await checkPermission(permission);
    
    if (!hasPermission) {
      sendMessageToWebsite({
        type: 'LOCATION_ERROR',
        error: 'Location permission not granted'
      });
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        sendMessageToWebsite({
          type: 'LOCATION_SUCCESS',
          data: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          }
        });
      },
      (error) => {
        sendMessageToWebsite({
          type: 'LOCATION_ERROR',
          error: error.message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  };

  /**
   * 处理生物识别登录
   */
  const handleBiometricLogin = async (data) => {
    try {
      // 这里可以调用 BiometricService
      // const result = await BiometricService.authenticateWithBiometric();
      
      // 模拟生物识别结果
      sendMessageToWebsite({
        type: 'BIOMETRIC_RESULT',
        success: true,
        data: {
          authenticated: true,
          // 可以包含用户信息或token
        }
      });
    } catch (error) {
      sendMessageToWebsite({
        type: 'BIOMETRIC_RESULT',
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 处理打开外部URL
   */
  const handleOpenExternalURL = async (data) => {
    try {
      const { Linking } = require('react-native');
      const url = data.url || data;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        sendMessageToWebsite({
          type: 'EXTERNAL_URL_RESULT',
          success: true,
          message: '外部链接已打开'
        });
      } else {
        throw new Error('无法打开此链接');
      }
    } catch (error) {
      sendMessageToWebsite({
        type: 'EXTERNAL_URL_RESULT',
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 处理启动二维码扫描
   */
  const handleStartQRScan = async () => {
    try {
      // 这里可以集成二维码扫描库，如 react-native-qrcode-scanner
      // 或者使用相机权限后自定义扫描界面

      // 模拟二维码扫描结果
      setTimeout(() => {
        sendMessageToWebsite({
          type: 'QR_SCAN_RESULT',
          success: true,
          data: 'https://example.com/qr-test-result-' + Date.now()
        });
      }, 2000);

      sendMessageToWebsite({
        type: 'QR_SCAN_RESULT',
        success: false,
        error: '二维码扫描功能需要安装 react-native-qrcode-scanner 库'
      });
    } catch (error) {
      sendMessageToWebsite({
        type: 'QR_SCAN_RESULT',
        success: false,
        error: error.message
      });
    }
  };

  /**
   * 发送消息到网站
   */
  const sendMessageToWebsite = (message) => {
    if (webViewRef.current) {
      const script = `
        window.dispatchEvent(new CustomEvent('nativeMessage', {
          detail: ${JSON.stringify(message)}
        }));
      `;
      webViewRef.current.injectJavaScript(script);
    }
  };

  /**
   * WebView 导航状态变化
   */
  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCurrentUrl(navState.url);
  };

  /**
   * WebView 加载完成
   */
  const handleLoadEnd = () => {
    setLoading(false);
    
    // 注入初始化脚本
    const initScript = `
      // 为网站提供原生功能接口
      window.NativeApp = {
        // 请求相机权限
        requestCameraPermission: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'REQUEST_CAMERA_PERMISSION'
          }));
        },
        
        // 请求位置权限
        requestLocationPermission: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'REQUEST_LOCATION_PERMISSION'
          }));
        },
        
        // 获取当前位置
        getCurrentLocation: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'GET_CURRENT_LOCATION'
          }));
        },
        
        // 生物识别登录
        biometricLogin: function(data) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'BIOMETRIC_LOGIN',
            data: data
          }));
        },
        
        // 关闭应用
        closeApp: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'CLOSE_APP'
          }));
        },

        // 打开外部URL
        openExternalURL: function(url) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'OPEN_EXTERNAL_URL',
            data: { url: url }
          }));
        },

        // 启动二维码扫描
        startQRScan: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'START_QR_SCAN'
          }));
        }
      };
      
      // 监听原生消息
      window.addEventListener('nativeMessage', function(event) {
        console.log('Received native message:', event.detail);
        // 网站可以监听这个事件来处理原生响应
      });
      
      true; // 必须返回true
    `;
    
    webViewRef.current?.injectJavaScript(initScript);
  };

  /**
   * WebView 错误处理
   */
  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    
    Alert.alert(
      '加载失败',
      '网页加载失败，请检查网络连接',
      [
        { text: '重试', onPress: () => webViewRef.current?.reload() },
        { text: '返回', onPress: () => navigation.goBack() }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: websiteUrl }}
        style={styles.webview}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={true}
        // 允许文件上传
        allowFileAccess={true}
        allowFileAccessFromFileURLs={true}
        allowUniversalAccessFromFileURLs={true}
        // 相机和麦克风权限
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        // 地理位置权限
        geolocationEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default WebViewScreen;
