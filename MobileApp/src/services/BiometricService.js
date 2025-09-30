import ReactNativeBiometrics from 'react-native-biometrics';
import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Keychain from 'react-native-keychain';

class BiometricService {
  constructor() {
    this.rnBiometrics = new ReactNativeBiometrics({
      allowDeviceCredentials: true
    });
  }

  /**
   * 检查设备是否支持生物识别
   * @returns {Promise<Object>}
   */
  async checkBiometricSupport() {
    try {
      const { available, biometryType } = await this.rnBiometrics.isSensorAvailable();
      
      return {
        available,
        biometryType,
        supportedTypes: this.getSupportedTypes(biometryType)
      };
    } catch (error) {
      console.error('Check biometric support error:', error);
      return {
        available: false,
        biometryType: null,
        supportedTypes: []
      };
    }
  }

  /**
   * 获取支持的生物识别类型描述
   * @param {string} biometryType 
   * @returns {Array<string>}
   */
  getSupportedTypes(biometryType) {
    const types = [];
    
    if (biometryType === ReactNativeBiometrics.TouchID) {
      types.push('指纹识别');
    } else if (biometryType === ReactNativeBiometrics.FaceID) {
      types.push('面容识别');
    } else if (biometryType === ReactNativeBiometrics.Biometrics) {
      if (Platform.OS === 'android') {
        types.push('指纹识别', '面部识别');
      } else {
        types.push('生物识别');
      }
    }
    
    return types;
  }

  /**
   * 启用生物识别登录
   * @param {string} username 用户名
   * @param {string} password 密码
   * @returns {Promise<boolean>}
   */
  async enableBiometricLogin(username, password) {
    try {
      const { available } = await this.checkBiometricSupport();
      
      if (!available) {
        throw new Error('设备不支持生物识别功能');
      }

      // 创建生物识别密钥对
      const { publicKey } = await this.rnBiometrics.createKeys();
      
      // 保存用户凭据到 Keychain
      await Keychain.setInternetCredentials(
        'biometric_login',
        username,
        password,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY,
          authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
          accessGroup: 'biometric_group'
        }
      );

      // 保存生物识别启用状态
      await AsyncStorage.setItem('biometricEnabled', 'true');
      await AsyncStorage.setItem('biometricUsername', username);
      
      return true;
    } catch (error) {
      console.error('Enable biometric login error:', error);
      throw new Error('启用生物识别登录失败: ' + error.message);
    }
  }

  /**
   * 禁用生物识别登录
   * @returns {Promise<boolean>}
   */
  async disableBiometricLogin() {
    try {
      // 删除生物识别密钥
      await this.rnBiometrics.deleteKeys();
      
      // 删除保存的凭据
      await Keychain.resetInternetCredentials('biometric_login');
      
      // 清除启用状态
      await AsyncStorage.multiRemove(['biometricEnabled', 'biometricUsername']);
      
      return true;
    } catch (error) {
      console.error('Disable biometric login error:', error);
      throw new Error('禁用生物识别登录失败: ' + error.message);
    }
  }

  /**
   * 检查是否已启用生物识别登录
   * @returns {Promise<boolean>}
   */
  async isBiometricEnabled() {
    try {
      const enabled = await AsyncStorage.getItem('biometricEnabled');
      return enabled === 'true';
    } catch (error) {
      console.error('Check biometric enabled error:', error);
      return false;
    }
  }

  /**
   * 使用生物识别进行身份验证
   * @returns {Promise<Object>}
   */
  async authenticateWithBiometric() {
    try {
      const { available } = await this.checkBiometricSupport();
      
      if (!available) {
        throw new Error('设备不支持生物识别功能');
      }

      const enabled = await this.isBiometricEnabled();
      if (!enabled) {
        throw new Error('未启用生物识别登录');
      }

      // 创建签名提示
      const { success, signature } = await this.rnBiometrics.createSignature({
        promptMessage: '请使用生物识别验证身份',
        payload: Date.now().toString()
      });

      if (!success) {
        throw new Error('生物识别验证失败');
      }

      // 从 Keychain 获取保存的凭据
      const credentials = await Keychain.getInternetCredentials('biometric_login');
      
      if (!credentials || credentials === false) {
        throw new Error('未找到保存的登录凭据');
      }

      return {
        success: true,
        username: credentials.username,
        password: credentials.password,
        signature
      };
    } catch (error) {
      console.error('Biometric authentication error:', error);
      throw new Error('生物识别验证失败: ' + error.message);
    }
  }

  /**
   * 显示生物识别设置对话框
   * @param {Function} onEnable 启用回调
   * @param {Function} onCancel 取消回调
   */
  showBiometricSetupDialog(onEnable, onCancel) {
    Alert.alert(
      '启用生物识别登录',
      '是否要启用指纹或面容识别登录？这将让您更快速、安全地登录应用。',
      [
        {
          text: '取消',
          style: 'cancel',
          onPress: onCancel
        },
        {
          text: '启用',
          onPress: onEnable
        }
      ]
    );
  }

  /**
   * 显示生物识别禁用确认对话框
   * @param {Function} onDisable 禁用回调
   * @param {Function} onCancel 取消回调
   */
  showBiometricDisableDialog(onDisable, onCancel) {
    Alert.alert(
      '禁用生物识别登录',
      '确定要禁用生物识别登录吗？您将需要输入用户名和密码来登录。',
      [
        {
          text: '取消',
          style: 'cancel',
          onPress: onCancel
        },
        {
          text: '禁用',
          style: 'destructive',
          onPress: onDisable
        }
      ]
    );
  }

  /**
   * 获取生物识别类型的显示名称
   * @returns {Promise<string>}
   */
  async getBiometricTypeName() {
    try {
      const { biometryType } = await this.checkBiometricSupport();
      
      switch (biometryType) {
        case ReactNativeBiometrics.TouchID:
          return '指纹识别';
        case ReactNativeBiometrics.FaceID:
          return '面容识别';
        case ReactNativeBiometrics.Biometrics:
          return Platform.OS === 'android' ? '生物识别' : '生物识别';
        default:
          return '生物识别';
      }
    } catch (error) {
      console.error('Get biometric type name error:', error);
      return '生物识别';
    }
  }
}

export default new BiometricService();
