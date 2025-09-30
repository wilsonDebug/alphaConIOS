/**
 * MobileApp Unified - Cross Platform (Android + iOS)
 * Migrated from SimpleAndroidApp with all features
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import ReactNativeBiometrics from 'react-native-biometrics';
import Geolocation from 'react-native-geolocation-service';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';


const { width, height } = Dimensions.get('window');

interface AppState {
  isLoggedIn: boolean;
  showWebView: boolean;
  webViewUrl: string;
  webViewTitle: string;
  username: string;
  password: string;
  biometricEnabled: boolean;
  currentTab: 'admin' | 'demo' | 'profile';
  currentPage: 'main' | 'settings';
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    showWebView: false,
    webViewUrl: '',
    webViewTitle: '',
    username: '',
    password: '',
    biometricEnabled: false,
    currentTab: 'admin',
    currentPage: 'main',
  });

  useEffect(() => {
    checkBiometricSupport();
    requestLocationPermission();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const { available } = await ReactNativeBiometrics.isSensorAvailable();
      setState(prev => ({ ...prev, biometricEnabled: available }));
    } catch (error) {
      console.log('Biometric check error:', error);
    }
  };

  const requestLocationPermission = async () => {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      const result = await request(permission);
      console.log('Location permission:', result);
    } catch (error) {
      console.log('Permission error:', error);
    }
  };

  const handleLogin = () => {
    if (state.username === 'admin' && state.password === '1') {
      setState(prev => ({ ...prev, isLoggedIn: true }));
      Alert.alert('登录成功', `欢迎，${state.username}！`);
    } else {
      Alert.alert('登录失败', '用户名或密码错误');
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const { available } = await ReactNativeBiometrics.isSensorAvailable();

      if (!available) {
        // 模拟器环境，提供模拟登录
        Alert.alert(
          '模拟器环境',
          '检测到模拟器环境，是否使用模拟生物识别登录？',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '模拟登录',
              onPress: () => {
                setState(prev => ({ ...prev, isLoggedIn: true, username: 'admin' }));
                Alert.alert('登录成功', '模拟生物识别验证通过！在实际设备上将使用真实的生物识别功能。');
              }
            }
          ]
        );
        return;
      }

      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: '请验证您的身份',
        cancelButtonText: '取消',
      });

      if (success) {
        setState(prev => ({ ...prev, isLoggedIn: true, username: 'admin' }));
        Alert.alert('登录成功', '生物识别验证通过！');
      }
    } catch (error: any) {
      console.log('Biometric Login Error:', error);
      Alert.alert('验证失败', `生物识别验证失败: ${error.message || '未知错误'}`);
    }
  };

  const handleFingerprintLogin = async () => {
    try {
      const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();

      if (!available) {
        // 模拟器环境，提供模拟登录
        Alert.alert(
          '模拟器环境',
          '检测到模拟器环境，是否使用模拟指纹登录？',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '模拟登录',
              onPress: () => {
                setState(prev => ({ ...prev, isLoggedIn: true, username: 'admin' }));
                Alert.alert('登录成功', '模拟指纹验证通过！在实际设备上将使用真实的指纹识别功能。');
              }
            }
          ]
        );
        return;
      }

      if (available && (biometryType === 'TouchID' || biometryType === 'Fingerprint')) {
        const { success } = await ReactNativeBiometrics.simplePrompt({
          promptMessage: '请将手指放在指纹传感器上',
          cancelButtonText: '取消'
        });

        if (success) {
          setState(prev => ({ ...prev, isLoggedIn: true, username: 'admin' }));
          Alert.alert('指纹登录成功', '指纹验证通过！');
        }
      } else {
        Alert.alert('指纹识别不可用', '设备不支持指纹识别或未设置指纹');
      }
    } catch (error: any) {
      console.log('Fingerprint Login Error:', error);
      Alert.alert('指纹识别失败', error.message || '验证过程中出现错误');
    }
  };

  const handleLogout = () => {
    setState(prev => ({
      ...prev,
      isLoggedIn: false,
      showWebView: false,
      username: '',
      password: '',
    }));
  };

  const openWebView = (url: string, title: string) => {
    setState(prev => ({
      ...prev,
      showWebView: true,
      webViewUrl: url,
      webViewTitle: title
    }));
  };

  const closeWebView = () => {
    setState(prev => ({
      ...prev,
      showWebView: false,
      webViewUrl: '',
      webViewTitle: ''
    }));
  };

  const handleQRScan = async () => {
    try {
      const permission = await request(
        Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
      );

      if (permission === RESULTS.GRANTED) {
        Alert.alert(
          '二维码扫描',
          '相机功能正在开发中，请使用WebQR.com进行扫描',
          [
            { text: '使用WebQR', onPress: () => openWebView('https://webqr.com/', 'WebQR.com 扫描') },
            { text: '取消', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('权限被拒绝', '需要相机权限才能扫描二维码');
      }
    } catch (error) {
      Alert.alert('错误', '无法启动相机');
    }
  };

  const handleFaceRecognition = async () => {
    try {
      const permission = await request(
        Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA
      );

      if (permission === RESULTS.GRANTED) {
        Alert.alert(
          '人脸识别',
          '相机人脸识别功能正在开发中，请使用生物识别登录功能',
          [
            { text: '使用生物识别', onPress: handleBiometricLogin },
            { text: '取消', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('权限被拒绝', '需要相机权限才能进行人脸识别');
      }
    } catch (error) {
      Alert.alert('错误', '无法启动相机');
    }
  };

  const handleWebQR = () => {
    openWebView('https://webqr.com/', 'WebQR.com 扫描');
  };

  const handleAMap = () => {
    openWebView('https://ditu.amap.com/', '高德地图定位');
  };

  const handleTestWeb = () => {
    openWebView('https://flexpdt.flexsystem.cn/test.html', '网页高德查经纬度');
  };

  const handleFaceSetup = async () => {
    try {
      const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();

      if (!available) {
        // 模拟器环境或不支持生物识别的设备，提供模拟功能
        Alert.alert(
          '模拟器环境',
          '检测到模拟器环境，是否启用模拟人脸识别功能？',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '启用模拟功能',
              onPress: () => {
                setState(prev => ({ ...prev, biometricEnabled: true }));
                Alert.alert('设置成功', '模拟人脸识别已启用！在实际设备上将使用真实的生物识别功能。');
              }
            }
          ]
        );
        return;
      }

      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: '设置人脸识别登录',
        cancelButtonText: '取消',
      });

      if (success) {
        setState(prev => ({ ...prev, biometricEnabled: true }));
        Alert.alert('设置成功', '人脸识别已启用！');
      }
    } catch (error: any) {
      console.log('Face Setup Error:', error);
      Alert.alert('设置失败', `人脸识别设置失败: ${error.message || '未知错误'}`);
    }
  };

  const handleFingerprintSetup = async () => {
    try {
      const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();

      if (!available) {
        // 模拟器环境或不支持生物识别的设备，提供模拟功能
        Alert.alert(
          '模拟器环境',
          '检测到模拟器环境，是否启用模拟指纹识别功能？',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '启用模拟功能',
              onPress: () => {
                setState(prev => ({ ...prev, biometricEnabled: true }));
                Alert.alert('设置成功', '模拟指纹识别已启用！在实际设备上将使用真实的生物识别功能。');
              }
            }
          ]
        );
        return;
      }

      if (biometryType !== 'TouchID' && biometryType !== 'Fingerprint') {
        Alert.alert('不支持', '设备不支持指纹识别，请使用其他生物识别方式');
        return;
      }

      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: '请验证指纹以启用指纹登录',
        cancelButtonText: '取消'
      });

      if (success) {
        setState(prev => ({ ...prev, biometricEnabled: true }));
        Alert.alert('设置成功', '指纹识别已启用！');
      }
    } catch (error: any) {
      console.log('Fingerprint Setup Error:', error);
      Alert.alert('设置失败', `指纹识别设置失败: ${error.message || '未知错误'}`);
    }
  };

  const handleTouchIDLogin = async () => {
    try {
      const { available, biometryType } = await ReactNativeBiometrics.isSensorAvailable();

      if (!available) {
        // 模拟器环境，提供模拟登录
        Alert.alert(
          '模拟器环境',
          '检测到模拟器环境，是否使用模拟TouchID登录？',
          [
            { text: '取消', style: 'cancel' },
            {
              text: '模拟登录',
              onPress: () => {
                setState(prev => ({ ...prev, isLoggedIn: true, username: 'admin' }));
                Alert.alert('登录成功', '模拟TouchID验证通过！在实际设备上将使用真实的TouchID功能。');
              }
            }
          ]
        );
        return;
      }

      if (biometryType !== 'TouchID' && biometryType !== 'Fingerprint') {
        Alert.alert('不支持', '设备不支持指纹识别，请使用生物识别登录');
        return;
      }

      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: '请验证指纹以登录',
        cancelButtonText: '取消'
      });

      if (success) {
        setState(prev => ({ ...prev, isLoggedIn: true, username: 'admin' }));
        Alert.alert('登录成功', '指纹验证成功！');
      }
    } catch (error: any) {
      console.log('TouchID Login Error:', error);
      Alert.alert('登录失败', `指纹验证失败: ${error.message || '未知错误'}`);
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        Alert.alert(
          'GPS坐标',
          `纬度: ${latitude.toFixed(6)}\n经度: ${longitude.toFixed(6)}`
        );
      },
      (error) => {
        Alert.alert('定位失败', error.message);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // 导航相关函数
  const switchTab = (tab: 'admin' | 'demo' | 'profile') => {
    setState(prev => ({ ...prev, currentTab: tab, currentPage: 'main' }));
  };

  const navigateToSettings = () => {
    setState(prev => ({ ...prev, currentPage: 'settings' }));
  };

  const navigateToMain = () => {
    setState(prev => ({ ...prev, currentPage: 'main' }));
  };

  const openAdminPage = () => {
    openWebView('https://flexpdt.flexsystem.cn/admin.html', 'Admin管理页面');
  };

  // 渲染Admin页面内容
  const renderAdminContent = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🔧 Admin管理</Text>
      <TouchableOpacity style={[styles.button, styles.adminButton]} onPress={openAdminPage}>
        <Text style={styles.buttonText}>🌐 打开Admin管理页面</Text>
      </TouchableOpacity>
      <Text style={styles.infoText}>点击上方按钮访问系统管理页面</Text>
    </View>
  );

  // 渲染功能演示页面内容
  const renderDemoContent = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>🎯 功能演示</Text>

      <TouchableOpacity style={[styles.button, styles.locationButton]} onPress={getCurrentLocation}>
        <Text style={styles.buttonText}>📍 获取GPS坐标</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.mapButton]} onPress={handleTestWeb}>
        <Text style={styles.buttonText}>🗺️ 网页高德查经纬度</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.qrButton]} onPress={handleQRScan}>
        <Text style={styles.buttonText}>📱 扫描二维码 (相机)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.faceRecognitionButton]} onPress={handleFaceRecognition}>
        <Text style={styles.buttonText}>📷 人脸识别 (相机)</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染我的页面内容
  const renderProfileContent = () => {
    if (state.currentPage === 'settings') {
      return renderSettingsPage();
    }

    return (
      <View style={styles.tabContent}>
        <Text style={styles.tabTitle}>👤 我的</Text>
        <View style={styles.profileInfo}>
          <Text style={styles.profileText}>用户名: {state.username || 'admin'}</Text>
          <Text style={styles.profileText}>生物识别: {state.biometricEnabled ? '已启用' : '未启用'}</Text>
        </View>

        <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={navigateToSettings}>
          <Text style={styles.buttonText}>⚙️ 设置</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 渲染设置页面
  const renderSettingsPage = () => (
    <View style={styles.tabContent}>
      <View style={styles.settingsHeader}>
        <TouchableOpacity style={styles.backButton} onPress={navigateToMain}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.tabTitle}>⚙️ 设置</Text>
      </View>

      <TouchableOpacity style={[styles.button, styles.faceButton]} onPress={handleFaceSetup}>
        <Text style={styles.buttonText}>😊 人脸识别设置</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.fingerprintButton]} onPress={handleFingerprintSetup}>
        <Text style={styles.buttonText}>👆 指纹设置</Text>
      </TouchableOpacity>
    </View>
  );

  // 渲染底部导航栏
  const renderBottomNavigation = () => (
    <View style={styles.bottomNavigation}>
      <TouchableOpacity
        style={[styles.navItem, state.currentTab === 'admin' && styles.activeNavItem]}
        onPress={() => switchTab('admin')}
      >
        <Text style={[styles.navText, state.currentTab === 'admin' && styles.activeNavText]}>
          🔧 Admin
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, state.currentTab === 'demo' && styles.activeNavItem]}
        onPress={() => switchTab('demo')}
      >
        <Text style={[styles.navText, state.currentTab === 'demo' && styles.activeNavText]}>
          🎯 功能演示
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, state.currentTab === 'profile' && styles.activeNavItem]}
        onPress={() => switchTab('profile')}
      >
        <Text style={[styles.navText, state.currentTab === 'profile' && styles.activeNavText]}>
          👤 我的
        </Text>
      </TouchableOpacity>
    </View>
  );



  // WebView Screen
  if (state.showWebView) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.webViewHeader}>
          <TouchableOpacity style={styles.backButton} onPress={closeWebView}>
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>{state.webViewTitle}</Text>
        </View>
        <WebView
          source={{ uri: state.webViewUrl }}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          geolocationEnabled={true}
          onError={(error) => {
            Alert.alert('加载失败', '网页加载失败，请检查网络连接');
          }}
          onGeolocationPermissionsShowPrompt={(origin, callback) => {
            // 自动授权地理位置权限
            callback(origin, true, false);
          }}
        />
      </SafeAreaView>
    );
  }

  // Login Screen
  if (!state.isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={styles.loginContainer}>
            <Text style={styles.title}>🚀 MobileApp 跨平台版</Text>
            <Text style={styles.subtitle}>
              {Platform.OS === 'ios' ? '🍎 iOS版本' : '🤖 Android版本'}
            </Text>
            <Text style={styles.subtitle}>请登录以继续使用</Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="用户名"
                value={state.username}
                onChangeText={(text) => setState(prev => ({ ...prev, username: text }))}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="密码"
                value={state.password}
                onChangeText={(text) => setState(prev => ({ ...prev, password: text }))}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>登录</Text>
            </TouchableOpacity>

            {state.biometricEnabled && (
              <TouchableOpacity style={styles.biometricButton} onPress={handleBiometricLogin}>
                <Text style={styles.biometricButtonText}>
                  {Platform.OS === 'ios' ? '🔐 Face ID / Touch ID 登录' : '🔐 生物识别登录'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.touchIdButton} onPress={handleFingerprintLogin}>
              <Text style={styles.touchIdButtonText}>👆 指纹登录</Text>
            </TouchableOpacity>

            <Text style={styles.hint}>提示：用户名 admin，密码 1</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main Screen with Bottom Navigation
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚀 MobileApp</Text>
        <Text style={styles.headerSubtitle}>
          {Platform.OS === 'ios' ? '🍎 iOS版本' : '🤖 Android版本'}
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>退出</Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <ScrollView style={styles.contentArea} contentInsetAdjustmentBehavior="automatic">
        {state.currentTab === 'admin' && renderAdminContent()}
        {state.currentTab === 'demo' && renderDemoContent()}
        {state.currentTab === 'profile' && renderProfileContent()}
      </ScrollView>

      {/* Bottom Navigation */}
      {renderBottomNavigation()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: height - 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  biometricButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  biometricButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 20,
  },
  button: {
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugButton: {
    backgroundColor: '#E91E63',
  },
  qrButton: {
    backgroundColor: '#FF9800',
  },
  webQRButton: {
    backgroundColor: '#00BCD4',
  },
  mapButton: {
    backgroundColor: '#FF5722',
  },
  testWebButton: {
    backgroundColor: '#9C27B0',
  },
  faceButton: {
    backgroundColor: '#4CAF50',
  },
  fingerprintButton: {
    backgroundColor: '#795548',
  },
  infoContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 15,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webViewTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  // Camera styles
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    padding: 15,
  },
  cameraTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  camera: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  cameraText: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
    textAlign: 'center',
  },
  buttonTouchable: {
    fontSize: 21,
    backgroundColor: '#ff0066',
    marginTop: 32,
    width: 160,
    textAlign: 'center',
    marginLeft: 'auto',
    marginRight: 'auto',
    borderRadius: 8,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
    textAlign: 'center',
  },
  touchIdButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#FF9800',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  touchIdButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  faceRecognitionButton: {
    backgroundColor: '#9C27B0',
  },
  // 新增样式 - 底部导航和页面布局
  contentArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContent: {
    flex: 1,
    padding: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 20,
    textAlign: 'center',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  activeNavItem: {
    backgroundColor: '#e3f2fd',
  },
  navText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  activeNavText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  // 个人页面样式
  profileInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  profileText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  // 设置页面样式
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  // 按钮样式扩展
  adminButton: {
    backgroundColor: '#f44336',
  },
  settingsButton: {
    backgroundColor: '#607D8B',
  },
  locationButton: {
    backgroundColor: '#4CAF50',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default App;
