import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';

// Simple test app to verify basic functionality
export default function App() {
  const handleTestPress = () => {
    Alert.alert('测试成功', '应用运行正常！');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.body}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>🚀 MobileApp 测试</Text>
            <Text style={styles.sectionDescription}>
              基于 AdminApp 的跨平台移动应用
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>✅ 功能特性</Text>
            <Text style={styles.sectionDescription}>
              • 登录系统 (复用 AdminApp API){'\n'}
              • 指纹/生物识别登录{'\n'}
              • 推送通知功能{'\n'}
              • WebView 集成{'\n'}
              • 跨平台支持 (Android/iOS)
            </Text>
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>🌐 WebView 功能</Text>
            <Text style={styles.sectionDescription}>
              • QR码扫描{'\n'}
              • GPS定位{'\n'}
              • 相机拍照{'\n'}
              • 文件上传{'\n'}
              • JavaScript Bridge 通信
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleTestPress}>
            <Text style={styles.buttonText}>测试应用功能</Text>
          </TouchableOpacity>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>📱 下一步</Text>
            <Text style={styles.sectionDescription}>
              1. 配置 API 地址{'\n'}
              2. 设置 Firebase 推送{'\n'}
              3. 测试登录功能{'\n'}
              4. 测试 WebView 集成{'\n'}
              5. 测试生物识别
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    backgroundColor: '#f5f5f5',
  },
  body: {
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 30,
    marginHorizontal: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
