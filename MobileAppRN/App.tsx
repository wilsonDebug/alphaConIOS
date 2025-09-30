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
  username: string;
  password: string;
  biometricEnabled: boolean;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    isLoggedIn: false,
    showWebView: false,
    webViewUrl: '',
    username: '',
    password: '',
    biometricEnabled: false,
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
      const { success } = await ReactNativeBiometrics.simplePrompt({
        promptMessage: '请验证您的身份',
        cancelButtonText: '取消',
      });

      if (success) {
        setState(prev => ({ ...prev, isLoggedIn: true, username: 'admin' }));
        Alert.alert('登录成功', '生物识别验证通过！');
      }
    } catch (error) {
      Alert.alert('验证失败', '生物识别验证失败');
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

  const openWebView = (url: string) => {
    setState(prev => ({ ...prev, showWebView: true, webViewUrl: url }));
  };

  const closeWebView = () => {
    setState(prev => ({ ...prev, showWebView: false, webViewUrl: '' }));
  };

  const handleQRScan = () => {
    Alert.alert('二维码扫描', '启动相机扫描二维码功能');
    // 这里可以集成 react-native-qrcode-scanner
  };

  const handleWebQR = () => {
    openWebView('https://webqr.com/');
  };

  const handleAMap = () => {
    openWebView('https://ditu.amap.com/');
  };

  const handleTestWeb = () => {
    openWebView('https://flexpdt.flexsystem.cn/test.html');
  };

  const handleFaceSetup = () => {
    Alert.alert('人脸识别', '设置Face ID/Touch ID功能');
  };

  const handleFingerprintSetup = () => {
    Alert.alert('指纹识别', '设置Touch ID功能');
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

  if (state.showWebView) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.webViewHeader}>
          <TouchableOpacity style={styles.backButton} onPress={closeWebView}>
            <Text style={styles.backButtonText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>网页浏览</Text>
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
        />
      </SafeAreaView>
    );
  }

  if (!state.isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentInsetAdjustmentBehavior="automatic">
          <View style={styles.loginContainer}>
            <Text style={styles.title}>🚀 MobileApp iOS版</Text>
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

            <Text style={styles.hint}>提示：用户名 admin，密码 1</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🚀 MobileApp 主界面</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>退出</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.debugButton]} onPress={getCurrentLocation}>
            <Text style={styles.buttonText}>🔍 获取GPS坐标</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.qrButton]} onPress={handleQRScan}>
            <Text style={styles.buttonText}>📱 扫描二维码 (相机)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.webQRButton]} onPress={handleWebQR}>
            <Text style={styles.buttonText}>🌐 WebQR.com 扫描</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.mapButton]} onPress={handleAMap}>
            <Text style={styles.buttonText}>🗺️ 高德地图定位</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.testWebButton]} onPress={handleTestWeb}>
            <Text style={styles.buttonText}>🌍 网页高德查经纬度</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.faceButton]} onPress={handleFaceSetup}>
            <Text style={styles.buttonText}>😊 设置人脸识别</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.fingerprintButton]} onPress={handleFingerprintSetup}>
            <Text style={styles.buttonText}>👆 设置指纹识别</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📱 iOS版本特性</Text>
          <Text style={styles.infoText}>
            ✅ Face ID / Touch ID 支持{'\n'}
            ✅ 原生相机集成{'\n'}
            ✅ GPS定位服务{'\n'}
            ✅ WebView网页浏览{'\n'}
            ✅ 响应式界面设计{'\n'}
            ✅ iOS权限管理
          </Text>
        </View>
      </ScrollView>
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
    marginBottom: 40,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    padding: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
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
  },
  webView: {
    flex: 1,
  },
});

export default App;
