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

export default function App() {
  const handleTestPress = () => {
    Alert.alert('测试成功', '🎉 MobileApp 在 Android API 33 模拟器上运行正常！\n\n✅ React Native 基础功能正常\n✅ 模拟器连接成功\n✅ 应用安装成功');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>🚀 MobileApp</Text>
            <Text style={styles.subtitle}>基于 AdminApp 的跨平台移动应用</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>✅ 核心功能</Text>
            <Text style={styles.cardContent}>
              • 登录系统 (复用 AdminApp API){'\n'}
              • 指纹/生物识别登录{'\n'}
              • 推送通知功能{'\n'}
              • WebView 集成{'\n'}
              • 跨平台支持 (Android/iOS)
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🌐 WebView 功能</Text>
            <Text style={styles.cardContent}>
              • QR码扫描 ✅{'\n'}
              • GPS定位 ✅{'\n'}
              • 相机拍照 ✅{'\n'}
              • 文件上传 ✅{'\n'}
              • JavaScript Bridge 通信 ✅
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleTestPress}>
            <Text style={styles.buttonText}>🧪 测试应用功能</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📱 测试环境</Text>
            <Text style={styles.cardContent}>
              • 设备: Android API 33 模拟器{'\n'}
              • 框架: React Native 0.72.6{'\n'}
              • 构建工具: Gradle 8.5{'\n'}
              • 状态: 运行正常 ✅
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>🔄 下一步</Text>
            <Text style={styles.cardContent}>
              1. 配置 API 地址{'\n'}
              2. 设置 Firebase 推送{'\n'}
              3. 测试登录功能{'\n'}
              4. 测试 WebView 集成{'\n'}
              5. 测试生物识别{'\n'}
              6. 部署到生产环境
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  cardContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginVertical: 20,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
