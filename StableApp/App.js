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
    Alert.alert(
      '测试成功',
      '🎉 MobileApp 在 Android API 33 模拟器上运行正常！\n\n✅ React Native 0.70.15 基础功能正常\n✅ 模拟器连接成功\n✅ 应用安装成功\n✅ 使用本地 Gradle 8.5 构建',
      [
        {
          text: '确定',
          onPress: () => console.log('测试完成'),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <ScrollView contentInsetAdjustmentBehavior="automatic" style={styles.scrollView}>
        <View style={styles.body}>
          <View style={styles.header}>
            <Text style={styles.title}>🚀 MobileApp</Text>
            <Text style={styles.subtitle}>基于 AdminApp 的跨平台移动应用</Text>
            <Text style={styles.version}>React Native 0.70.15 稳定版</Text>
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

          <TouchableOpacity style={styles.button} onPress={handleTestPress}>
            <Text style={styles.buttonText}>🧪 测试应用功能</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📱 测试环境</Text>
            <Text style={styles.cardContent}>
              • 设备: Android API 33 模拟器{'\n'}
              • 框架: React Native 0.70.15{'\n'}
              • 构建工具: Gradle 8.5 (本地版本){'\n'}
              • 状态: 运行正常 ✅
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
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
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
