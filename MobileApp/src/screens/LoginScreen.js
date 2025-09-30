import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthService from '../services/AuthService';
import BiometricService from '../services/BiometricService';

const LoginScreen = ({ navigation }) => {
  const [companyId, setCompanyId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('');

  useEffect(() => {
    checkBiometricSupport();
    checkBiometricEnabled();
  }, []);

  /**
   * 检查生物识别支持
   */
  const checkBiometricSupport = async () => {
    try {
      const support = await BiometricService.checkBiometricSupport();
      setBiometricSupported(support.available);
      if (support.available) {
        const typeName = await BiometricService.getBiometricTypeName();
        setBiometricType(typeName);
      }
    } catch (error) {
      console.error('Check biometric support error:', error);
    }
  };

  /**
   * 检查是否已启用生物识别
   */
  const checkBiometricEnabled = async () => {
    try {
      const enabled = await BiometricService.isBiometricEnabled();
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error('Check biometric enabled error:', error);
    }
  };

  /**
   * 传统登录
   */
  const handleLogin = async () => {
    if (!companyId.trim() || !staffId.trim() || !password.trim()) {
      Alert.alert('错误', '请填写所有必填字段');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.login(companyId.trim(), staffId.trim(), password.trim());
      
      if (result.success) {
        // 登录成功后询问是否启用生物识别
        if (biometricSupported && !biometricEnabled) {
          BiometricService.showBiometricSetupDialog(
            () => enableBiometricLogin(),
            () => navigateToMain()
          );
        } else {
          navigateToMain();
        }
      }
    } catch (error) {
      Alert.alert('登录失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 生物识别登录
   */
  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const result = await BiometricService.authenticateWithBiometric();
      
      if (result.success) {
        // 使用保存的凭据进行登录
        const loginResult = await AuthService.login(
          companyId || 'saved', // 如果有保存的公司ID
          result.username,
          result.password
        );
        
        if (loginResult.success) {
          navigateToMain();
        }
      }
    } catch (error) {
      Alert.alert('生物识别登录失败', error.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 启用生物识别登录
   */
  const enableBiometricLogin = async () => {
    try {
      await BiometricService.enableBiometricLogin(staffId, password);
      setBiometricEnabled(true);
      Alert.alert('成功', `${biometricType}登录已启用`);
      navigateToMain();
    } catch (error) {
      Alert.alert('启用失败', error.message);
      navigateToMain();
    }
  };

  /**
   * 导航到主页面
   */
  const navigateToMain = () => {
    navigation.replace('Main');
  };

  /**
   * 渲染生物识别按钮
   */
  const renderBiometricButton = () => {
    if (!biometricSupported || !biometricEnabled) {
      return null;
    }

    return (
      <TouchableOpacity
        style={styles.biometricButton}
        onPress={handleBiometricLogin}
        disabled={loading}
      >
        <Icon name="fingerprint" size={24} color="#007AFF" />
        <Text style={styles.biometricButtonText}>使用{biometricType}登录</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/logo.png')} // 需要添加logo图片
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* 登录表单 */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>登录</Text>

          {/* 公司ID */}
          <View style={styles.inputContainer}>
            <Icon name="business" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="公司ID"
              value={companyId}
              onChangeText={setCompanyId}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* 员工ID */}
          <View style={styles.inputContainer}>
            <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="员工ID"
              value={staffId}
              onChangeText={setStaffId}
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* 密码 */}
          <View style={styles.inputContainer}>
            <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="密码"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Icon
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* 登录按钮 */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>登录</Text>
            )}
          </TouchableOpacity>

          {/* 生物识别登录按钮 */}
          {renderBiometricButton()}

          {/* 分隔线 */}
          {biometricSupported && biometricEnabled && (
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或</Text>
              <View style={styles.dividerLine} />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    height: 50,
    marginTop: 15,
  },
  biometricButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
});

export default LoginScreen;
