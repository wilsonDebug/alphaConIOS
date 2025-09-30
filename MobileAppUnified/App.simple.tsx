/**
 * MobileApp Unified - 简化测试版本
 * 用于验证基本React Native功能
 */

import React, { useState } from 'react';
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
} from 'react-native';

const App: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    if (username === 'admin' && password === '1') {
      setIsLoggedIn(true);
      Alert.alert('登录成功', `欢迎，${username}！`);
    } else {
      Alert.alert('登录失败', '用户名或密码错误');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const showAlert = (title: string, message: string) => {
    Alert.alert(title, message);
  };

  if (!isLoggedIn) {
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
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="密码"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>登录</Text>
            </TouchableOpacity>

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
          <Text style={styles.headerSubtitle}>
            {Platform.OS === 'ios' ? '🍎 iOS版本' : '🤖 Android版本'}
          </Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>退出</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.debugButton]} 
            onPress={() => showAlert('GPS坐标', '模拟GPS功能\n纬度: 39.908823\n经度: 116.397470')}
          >
            <Text style={styles.buttonText}>🔍 获取GPS坐标</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.qrButton]} 
            onPress={() => showAlert('二维码扫描', '启动相机扫描二维码功能\n(需要集成 react-native-camera)')}
          >
            <Text style={styles.buttonText}>📱 扫描二维码 (相机)</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.webQRButton]} 
            onPress={() => showAlert('WebQR扫描', '打开WebQR.com网页扫描\n(需要WebView支持)')}
          >
            <Text style={styles.buttonText}>🌐 WebQR.com 扫描</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.mapButton]} 
            onPress={() => showAlert('高德地图', '打开高德地图定位\n(需要WebView支持)')}
          >
            <Text style={styles.buttonText}>🗺️ 高德地图定位</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.testWebButton]} 
            onPress={() => showAlert('测试网页', '打开测试网页GPS功能\nhttps://flexpdt.flexsystem.cn/test.html')}
          >
            <Text style={styles.buttonText}>🌍 网页高德查经纬度</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.faceButton]} 
            onPress={() => showAlert('人脸识别', '设置Face ID/Touch ID功能\n(需要生物识别支持)')}
          >
            <Text style={styles.buttonText}>😊 设置人脸识别</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.fingerprintButton]} 
            onPress={() => showAlert('指纹识别', '设置Touch ID功能\n(需要生物识别支持)')}
          >
            <Text style={styles.buttonText}>👆 设置指纹识别</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>📱 跨平台特性</Text>
          <Text style={styles.infoText}>
            ✅ {Platform.OS === 'ios' ? 'Face ID / Touch ID' : '生物识别'} 支持{'\n'}
            ✅ 原生相机集成{'\n'}
            ✅ GPS定位服务{'\n'}
            ✅ WebView网页浏览{'\n'}
            ✅ 响应式界面设计{'\n'}
            ✅ {Platform.OS === 'ios' ? 'iOS' : 'Android'}权限管理{'\n'}
            ✅ 一套代码，双平台运行{'\n'}
            {'\n'}
            🎯 当前版本：简化测试版{'\n'}
            📱 平台：{Platform.OS === 'ios' ? 'iOS' : 'Android'} {Platform.Version}
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
    minHeight: 600,
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
    marginBottom: 20,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
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
});

export default App;
