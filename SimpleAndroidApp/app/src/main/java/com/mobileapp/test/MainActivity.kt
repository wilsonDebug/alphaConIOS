package com.mobileapp.test

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.GeolocationPermissions
import android.webkit.PermissionRequest
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import android.Manifest
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import android.view.View
import androidx.biometric.BiometricPrompt
import androidx.biometric.BiometricManager
import androidx.core.content.ContextCompat as CoreContextCompat
import androidx.fragment.app.FragmentActivity
import java.util.concurrent.Executor
import android.content.SharedPreferences
import android.content.Intent
import android.app.Activity

class MainActivity : AppCompatActivity() {

    companion object {
        private const val FACE_CAPTURE_REQUEST = 1001
        private const val FACE_VERIFY_REQUEST = 1002
        private const val CAMERA_PERMISSION_REQUEST_CODE = 100
        private const val LOCATION_PERMISSION_REQUEST_CODE = 101
    }

    // 登录界面组件
    private lateinit var loginLayout: LinearLayout
    private lateinit var mainLayout: LinearLayout
    private lateinit var usernameInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var loginButton: Button
    private lateinit var faceLoginButton: Button
    private lateinit var fingerprintLoginButton: Button

    // 主界面组件
    private lateinit var webView: WebView
    private lateinit var qrScanButton: Button
    private lateinit var webQRButton: Button
    private lateinit var mapButton: Button
    private lateinit var testWebButton: Button
    private lateinit var faceSetupButton: Button
    private lateinit var fingerprintSetupButton: Button
    private lateinit var logoutButton: Button

    // 生物识别
    private lateinit var executor: Executor
    private lateinit var biometricPrompt: BiometricPrompt
    private lateinit var promptInfo: BiometricPrompt.PromptInfo

    // 人脸识别管理器
    private lateinit var faceRecognitionManager: FaceRecognitionManager

    private var isLoggedIn = false
    private var faceRecognitionEnabled = false
    private var fingerprintEnabled = false
    private var currentBiometricSetupType = "" // "face" 或 "fingerprint"

    // 固定的登录凭据
    private val FIXED_USERNAME = "admin"
    private val FIXED_PASSWORD = "1"

    // SharedPreferences 用于保存生物识别设置状态
    private lateinit var sharedPreferences: SharedPreferences
    private val PREFS_NAME = "BiometricSettings"
    private val KEY_FACE_ENABLED = "face_recognition_enabled"
    private val KEY_FINGERPRINT_ENABLED = "fingerprint_enabled"
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 初始化 SharedPreferences
        sharedPreferences = getSharedPreferences(PREFS_NAME, MODE_PRIVATE)

        // 初始化人脸识别管理器
        faceRecognitionManager = FaceRecognitionManager(this)

        // 加载保存的生物识别设置状态
        loadBiometricSettings()

        // 动态创建布局
        createLayout()

        // 初始化生物识别
        setupBiometric()

        // 显示登录界面
        showLoginScreen()
    }
    
    private fun createLayout() {
        // 创建主容器
        val rootLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
            )
        }

        // 创建登录界面
        createLoginLayout(rootLayout)

        // 创建主界面
        createMainLayout(rootLayout)

        setContentView(rootLayout)
    }

    private fun createLoginLayout(parent: LinearLayout) {
        loginLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(60, 100, 60, 60)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
            )
        }

        // 标题
        val titleText = TextView(this).apply {
            text = "🚀 MobileApp 登录"
            textSize = 24f
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 20)
            setTextColor(android.graphics.Color.parseColor("#2196F3"))
        }

        // Build时间
        val buildTimeText = TextView(this).apply {
            text = "Build: ${getBuildTime()}"
            textSize = 12f
            setTextColor(android.graphics.Color.parseColor("#666666"))
            gravity = android.view.Gravity.CENTER
            setPadding(0, 0, 0, 30)
        }

        // 用户名输入
        val usernameLabel = TextView(this).apply {
            text = "用户名"
            textSize = 16f
            setPadding(0, 20, 0, 8)
        }
        usernameInput = EditText(this).apply {
            hint = "请输入用户名"
            setPadding(20, 20, 20, 20)
            background = ContextCompat.getDrawable(this@MainActivity, android.R.drawable.edit_text)
        }

        // 密码输入
        val passwordLabel = TextView(this).apply {
            text = "密码"
            textSize = 16f
            setPadding(0, 20, 0, 8)
        }
        passwordInput = EditText(this).apply {
            hint = "请输入密码"
            inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
            setPadding(20, 20, 20, 20)
            background = ContextCompat.getDrawable(this@MainActivity, android.R.drawable.edit_text)
        }

        // 登录按钮
        loginButton = Button(this).apply {
            text = "🔐 登录"
            textSize = 18f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(android.graphics.Color.parseColor("#2196F3"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 30 }
            setOnClickListener { performLogin() }
        }

        // 人脸识别登录按钮
        faceLoginButton = Button(this).apply {
            text = "😊 人脸识别登录"
            textSize = 16f
            setPadding(0, 15, 0, 15)
            setBackgroundColor(android.graphics.Color.parseColor("#4CAF50"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 15 }
            setOnClickListener { performFaceLogin() }
            visibility = View.GONE // 默认隐藏
        }

        // 指纹识别登录按钮
        fingerprintLoginButton = Button(this).apply {
            text = "👆 指纹识别登录"
            textSize = 16f
            setPadding(0, 15, 0, 15)
            setBackgroundColor(android.graphics.Color.parseColor("#FF9800"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 15 }
            setOnClickListener { performFingerprintLogin() }
            visibility = View.GONE // 默认隐藏
        }

        loginLayout.addView(titleText)
        loginLayout.addView(buildTimeText)
        loginLayout.addView(usernameLabel)
        loginLayout.addView(usernameInput)
        loginLayout.addView(passwordLabel)
        loginLayout.addView(passwordInput)
        loginLayout.addView(loginButton)
        loginLayout.addView(faceLoginButton)
        loginLayout.addView(fingerprintLoginButton)

        parent.addView(loginLayout)
    }
    
    private fun createMainLayout(parent: LinearLayout) {
        mainLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.MATCH_PARENT
            )
            visibility = View.GONE
        }

        // 顶部工具栏
        val toolbar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(20, 20, 20, 20)
            setBackgroundColor(android.graphics.Color.parseColor("#2196F3"))
        }

        val titleText = TextView(this).apply {
            text = "🚀 MobileApp 主界面"
            textSize = 18f
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }

        logoutButton = Button(this).apply {
            text = "退出"
            textSize = 14f
            setBackgroundColor(android.graphics.Color.parseColor("#F44336"))
            setTextColor(android.graphics.Color.WHITE)
            setPadding(20, 10, 20, 10)
            setOnClickListener { performLogout() }
        }

        toolbar.addView(titleText)
        toolbar.addView(logoutButton)

        // 功能按钮区域
        val buttonLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 40, 40, 40)
        }

        // 二维码扫描按钮
        qrScanButton = Button(this).apply {
            text = "📱 扫描二维码 (相机)"
            textSize = 18f
            setPadding(0, 25, 0, 25)
            setBackgroundColor(android.graphics.Color.parseColor("#FF9800"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 15 }
            setOnClickListener { startQRScan() }
        }

        // WebQR.com扫描按钮
        webQRButton = Button(this).apply {
            text = "🌐 WebQR.com 扫描"
            textSize = 18f
            setPadding(0, 25, 0, 25)
            setBackgroundColor(android.graphics.Color.parseColor("#4CAF50"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 15 }
            setOnClickListener { loadWebQRScanner() }
        }

        // 高德地图按钮
        mapButton = Button(this).apply {
            text = "🗺️ 高德地图定位"
            textSize = 18f
            setPadding(0, 25, 0, 25)
            setBackgroundColor(android.graphics.Color.parseColor("#FF5722"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 20 }
            setOnClickListener { loadAMapWithLocation() }
        }

        // 网页高德查经纬度按钮
        testWebButton = Button(this).apply {
            text = "🌍 网页高德查经纬度"
            textSize = 18f
            setPadding(0, 25, 0, 25)
            setBackgroundColor(android.graphics.Color.parseColor("#9C27B0"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 20 }
            setOnClickListener { loadTestWebPage() }
        }

        // 人脸识别设置按钮
        faceSetupButton = Button(this).apply {
            text = if (faceRecognitionEnabled) "😊 重新设置人脸识别" else "😊 设置人脸识别"
            textSize = 16f
            setPadding(0, 15, 0, 15)
            setBackgroundColor(android.graphics.Color.parseColor("#4CAF50"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 15 }
            setOnClickListener {
                // 直接启动真正的人脸识别功能，不再依赖系统生物识别检测
                Toast.makeText(this@MainActivity, "📷 启动人脸识别设置", Toast.LENGTH_SHORT).show()
                setupFaceRecognition()
            }
        }

        // 指纹识别设置按钮
        fingerprintSetupButton = Button(this).apply {
            text = if (fingerprintEnabled) "👆 重新设置指纹识别" else "👆 设置指纹识别"
            textSize = 16f
            setPadding(0, 15, 0, 15)
            setBackgroundColor(android.graphics.Color.parseColor("#FF9800"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 20 }
            setOnClickListener {
                val biometricManager = BiometricManager.from(this@MainActivity)
                val result = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)

                when (result) {
                    BiometricManager.BIOMETRIC_SUCCESS -> {
                        Toast.makeText(this@MainActivity, "🔍 检测到生物识别硬件，启动真实验证", Toast.LENGTH_SHORT).show()
                        setupFingerprint()
                    }
                    BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> {
                        Toast.makeText(this@MainActivity, "🤖 模拟器环境，使用模拟设置", Toast.LENGTH_SHORT).show()
                        showSimulatedBiometricSetup("fingerprint")
                    }
                    BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> {
                        Toast.makeText(this@MainActivity, "⚠️ 生物识别硬件暂时不可用", Toast.LENGTH_SHORT).show()
                    }
                    BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
                        Toast.makeText(this@MainActivity, "📝 请先在系统设置中录入生物识别信息", Toast.LENGTH_LONG).show()
                    }
                    BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED -> {
                        Toast.makeText(this@MainActivity, "🔒 需要安全更新", Toast.LENGTH_SHORT).show()
                    }
                    BiometricManager.BIOMETRIC_ERROR_UNSUPPORTED -> {
                        Toast.makeText(this@MainActivity, "❌ 设备不支持生物识别", Toast.LENGTH_SHORT).show()
                    }
                    else -> {
                        Toast.makeText(this@MainActivity, "🤖 未知状态，使用模拟设置 (状态码: $result)", Toast.LENGTH_LONG).show()
                        showSimulatedBiometricSetup("fingerprint")
                    }
                }
            }
        }

        // WebView
        webView = WebView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
            webViewClient = WebViewClient()
            webChromeClient = object : WebChromeClient() {
                override fun onPermissionRequest(request: PermissionRequest?) {
                    request?.grant(request.resources)
                }
            }
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                mediaPlaybackRequiresUserGesture = false
            }
        }

        // 调试按钮 - 直接测试DirectCameraActivity
        val debugButton = Button(this).apply {
            text = "🔍 调试：直接测试相机"
            textSize = 16f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(android.graphics.Color.parseColor("#E91E63"))
            setTextColor(android.graphics.Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { bottomMargin = 15 }
            setOnClickListener {
                Toast.makeText(this@MainActivity, "🔍 直接启动DirectCameraActivity测试", Toast.LENGTH_SHORT).show()
                val intent = Intent(this@MainActivity, DirectCameraActivity::class.java)
                intent.putExtra(DirectCameraActivity.EXTRA_MODE, DirectCameraActivity.MODE_FACE_CAPTURE)
                startActivity(intent)
            }
        }

        buttonLayout.addView(debugButton)
        buttonLayout.addView(qrScanButton)
        buttonLayout.addView(webQRButton)
        buttonLayout.addView(mapButton)
        buttonLayout.addView(testWebButton)
        buttonLayout.addView(faceSetupButton)
        buttonLayout.addView(fingerprintSetupButton)

        mainLayout.addView(toolbar)
        mainLayout.addView(buttonLayout)
        mainLayout.addView(webView)

        parent.addView(mainLayout)
    }
        
    private fun setupBiometric() {
        executor = ContextCompat.getMainExecutor(this)
        biometricPrompt = BiometricPrompt(this as FragmentActivity, executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    super.onAuthenticationError(errorCode, errString)
                    if (isLoggedIn) {
                        // 设置过程中的错误
                        Toast.makeText(this@MainActivity, "生物识别设置取消", Toast.LENGTH_SHORT).show()
                        loadWelcomePage()
                    } else {
                        // 登录过程中的错误
                        Toast.makeText(this@MainActivity, "生物识别登录错误: $errString", Toast.LENGTH_SHORT).show()
                    }
                }

                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    super.onAuthenticationSucceeded(result)
                    if (isLoggedIn) {
                        // 设置成功 - 根据当前设置的类型更新状态
                        when (currentBiometricSetupType) {
                            "face" -> {
                                faceRecognitionEnabled = true
                                saveBiometricSettings()
                                Toast.makeText(this@MainActivity, "🎉 人脸识别设置成功！", Toast.LENGTH_LONG).show()
                                updateFaceButton()
                            }
                            "fingerprint" -> {
                                fingerprintEnabled = true
                                saveBiometricSettings()
                                Toast.makeText(this@MainActivity, "🎉 指纹识别设置成功！", Toast.LENGTH_LONG).show()
                                updateFingerprintButton()
                            }
                        }
                        loadWelcomePage()
                    } else {
                        // 登录成功 - 根据登录类型显示不同消息
                        when (currentBiometricSetupType) {
                            "face_login" -> {
                                Toast.makeText(this@MainActivity, "😊 人脸识别登录成功！", Toast.LENGTH_SHORT).show()
                            }
                            "fingerprint_login" -> {
                                Toast.makeText(this@MainActivity, "👆 指纹识别登录成功！", Toast.LENGTH_SHORT).show()
                            }
                            else -> {
                                Toast.makeText(this@MainActivity, "生物识别登录成功！", Toast.LENGTH_SHORT).show()
                            }
                        }
                        performSuccessfulLogin("admin")
                    }
                }

                override fun onAuthenticationFailed() {
                    super.onAuthenticationFailed()
                    Toast.makeText(this@MainActivity, "生物识别验证失败，请重试", Toast.LENGTH_SHORT).show()
                }
            })

        promptInfo = BiometricPrompt.PromptInfo.Builder()
            .setTitle("生物识别登录")
            .setSubtitle("使用您的指纹或面容进行登录")
            .setNegativeButtonText("取消")
            .build()
    }

    private fun showLoginScreen() {
        loginLayout.visibility = View.VISIBLE
        mainLayout.visibility = View.GONE
        isLoggedIn = false

        // 清空输入框
        usernameInput.text.clear()
        passwordInput.text.clear()

        // 根据生物识别设置状态显示相应的登录按钮
        // 在模拟器环境中也显示按钮，因为我们有模拟登录功能
        if (faceRecognitionEnabled) {
            faceLoginButton.visibility = View.VISIBLE
            faceLoginButton.isEnabled = true
        } else {
            faceLoginButton.visibility = View.GONE
        }

        if (fingerprintEnabled) {
            fingerprintLoginButton.visibility = View.VISIBLE
            fingerprintLoginButton.isEnabled = true
        } else {
            fingerprintLoginButton.visibility = View.GONE
        }
    }

    private fun performLogin() {
        val username = usernameInput.text.toString().trim()
        val password = passwordInput.text.toString().trim()

        if (username.isEmpty() || password.isEmpty()) {
            Toast.makeText(this, "请填写用户名和密码", Toast.LENGTH_SHORT).show()
            return
        }

        // 固定用户名密码验证
        if (username == FIXED_USERNAME && password == FIXED_PASSWORD) {
            performSuccessfulLogin(username)
        } else {
            Toast.makeText(this, "登录失败：用户名或密码错误\n\n提示：用户名 admin，密码 1", Toast.LENGTH_LONG).show()
        }
    }



    private fun performSuccessfulLogin(username: String) {
        isLoggedIn = true
        loginLayout.visibility = View.GONE
        mainLayout.visibility = View.VISIBLE

        Toast.makeText(this, "欢迎，$username！", Toast.LENGTH_SHORT).show()

        // 检查是否需要设置生物识别
        if ((!faceRecognitionEnabled || !fingerprintEnabled) && canUseBiometric()) {
            showBiometricSetupDialog()
        } else {
            // 加载欢迎页面
            loadWelcomePage()
        }
    }

    private fun canUseBiometric(): Boolean {
        val biometricManager = BiometricManager.from(this)
        val result = biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK)

        // 添加调试信息
        when (result) {
            BiometricManager.BIOMETRIC_SUCCESS -> {
                // 生物识别可用
                return true
            }
            BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> {
                // 设备没有生物识别硬件
                return false
            }
            BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> {
                // 生物识别硬件暂时不可用
                return false
            }
            BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> {
                // 用户没有录入生物识别信息
                return false
            }
            BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED -> {
                // 需要安全更新
                return false
            }
            BiometricManager.BIOMETRIC_ERROR_UNSUPPORTED -> {
                // 不支持生物识别
                return false
            }
            BiometricManager.BIOMETRIC_STATUS_UNKNOWN -> {
                // 状态未知
                return false
            }
            else -> {
                return false
            }
        }
    }

    private fun showBiometricSetupDialog() {
        val message = StringBuilder("为了提高安全性和便利性，建议您设置生物识别登录：\n\n")
        if (!faceRecognitionEnabled) message.append("• 人脸识别\n")
        if (!fingerprintEnabled) message.append("• 指纹识别\n")
        message.append("\n您可以在主界面中分别设置这些功能。")

        AlertDialog.Builder(this)
            .setTitle("🔒 设置生物识别")
            .setMessage(message.toString())
            .setPositiveButton("✅ 进入主界面") { _, _ ->
                loadWelcomePage()
            }
            .setNegativeButton("⏭️ 跳过") { _, _ ->
                loadWelcomePage()
            }
            .setCancelable(false)
            .show()
    }

    private fun setupFaceRecognition() {
        // 检查是否已有人脸数据
        if (::faceRecognitionManager.isInitialized && faceRecognitionManager.hasFaceData()) {
            // 已有人脸数据，询问是否重新采集
            AlertDialog.Builder(this)
                .setTitle("😊 人脸识别设置")
                .setMessage("检测到已有人脸数据，您想要：")
                .setPositiveButton("🔄 重新采集") { _, _ ->
                    startFaceCapture()
                }
                .setNegativeButton("✅ 保持现有") { _, _ ->
                    faceRecognitionEnabled = true
                    saveBiometricSettings()
                    updateFaceButton()
                    Toast.makeText(this, "✅ 人脸识别已启用", Toast.LENGTH_SHORT).show()
                }
                .setNeutralButton("🗑️ 清除数据") { _, _ ->
                    faceRecognitionManager.clearFaceData()
                    faceRecognitionEnabled = false
                    saveBiometricSettings()
                    updateFaceButton()
                    Toast.makeText(this, "🗑️ 人脸数据已清除", Toast.LENGTH_SHORT).show()
                }
                .show()
        } else {
            // 没有人脸数据，开始采集
            startFaceCapture()
        }
    }

    private fun startFaceCapture() {
        try {
            Toast.makeText(this, "🚀 正在启动人脸采集...", Toast.LENGTH_SHORT).show()
            android.util.Log.d("MainActivity", "startFaceCapture: starting DirectCameraActivity")

            // 使用直接相机Activity
            val intent = Intent(this, DirectCameraActivity::class.java)
            intent.putExtra(DirectCameraActivity.EXTRA_MODE, DirectCameraActivity.MODE_FACE_CAPTURE)

            android.util.Log.d("MainActivity", "startFaceCapture: intent created with mode ${DirectCameraActivity.MODE_FACE_CAPTURE}")
            startActivityForResult(intent, FACE_CAPTURE_REQUEST)
            android.util.Log.d("MainActivity", "startFaceCapture: startActivityForResult called")

        } catch (e: Exception) {
            Toast.makeText(this, "❌ 启动人脸采集失败: ${e.message}", Toast.LENGTH_LONG).show()
            android.util.Log.e("MainActivity", "startFaceCapture: error", e)
            e.printStackTrace()
        }
    }

    private fun setupFingerprint() {
        currentBiometricSetupType = "fingerprint"
        biometricPrompt.authenticate(BiometricPrompt.PromptInfo.Builder()
            .setTitle("设置指纹识别")
            .setSubtitle("请使用指纹进行验证")
            .setDescription("验证成功后，您就可以使用指纹识别快速登录了")
            .setNegativeButtonText("取消")
            .build())
    }

    private fun updateFaceButton() {
        faceSetupButton.text = if (faceRecognitionEnabled) "😊 重新设置人脸识别" else "😊 设置人脸识别"
    }

    private fun updateFingerprintButton() {
        fingerprintSetupButton.text = if (fingerprintEnabled) "👆 重新设置指纹识别" else "👆 设置指纹识别"
    }

    private fun showSimulatedBiometricSetup(type: String) {
        val typeName = if (type == "face") "人脸识别" else "指纹识别"
        val emoji = if (type == "face") "😊" else "👆"

        AlertDialog.Builder(this)
            .setTitle("$emoji 模拟${typeName}设置")
            .setMessage("检测到您在模拟器环境中运行，无法使用真实的生物识别硬件。\n\n是否要模拟设置${typeName}？\n\n注意：这只是演示功能，实际设备上会使用真实的生物识别验证。")
            .setPositiveButton("✅ 模拟设置") { _, _ ->
                // 模拟设置成功
                when (type) {
                    "face" -> {
                        faceRecognitionEnabled = true
                        saveBiometricSettings()
                        updateFaceButton()
                        Toast.makeText(this, "🎉 人脸识别模拟设置成功！", Toast.LENGTH_LONG).show()
                    }
                    "fingerprint" -> {
                        fingerprintEnabled = true
                        saveBiometricSettings()
                        updateFingerprintButton()
                        Toast.makeText(this, "🎉 指纹识别模拟设置成功！", Toast.LENGTH_LONG).show()
                    }
                }
                loadWelcomePage()
            }
            .setNegativeButton("❌ 取消", null)
            .show()
    }

    private fun showSimulatedBiometricLogin(type: String) {
        val typeName = if (type == "face") "人脸识别" else "指纹识别"
        val emoji = if (type == "face") "😊" else "👆"

        AlertDialog.Builder(this)
            .setTitle("$emoji 模拟${typeName}登录")
            .setMessage("模拟器环境中的${typeName}登录演示\n\n点击确认模拟验证成功")
            .setPositiveButton("✅ 验证成功") { _, _ ->
                Toast.makeText(this, "$emoji ${typeName}登录成功！", Toast.LENGTH_SHORT).show()
                performSuccessfulLogin("admin")
            }
            .setNegativeButton("❌ 取消", null)
            .show()
    }

    private fun performFaceLogin() {
        if (!faceRecognitionEnabled) {
            Toast.makeText(this, "人脸识别未设置", Toast.LENGTH_SHORT).show()
            return
        }

        // 检查是否有人脸数据
        if (!::faceRecognitionManager.isInitialized || !faceRecognitionManager.hasFaceData()) {
            Toast.makeText(this, "未找到人脸数据，请先设置人脸识别", Toast.LENGTH_SHORT).show()
            return
        }

        // 启动人脸识别验证
        val intent = Intent(this, DirectCameraActivity::class.java)
        intent.putExtra(DirectCameraActivity.EXTRA_MODE, DirectCameraActivity.MODE_FACE_VERIFY)
        startActivityForResult(intent, FACE_VERIFY_REQUEST)
    }

    private fun performFaceLoginFallback() {
        // 检查是否支持真实生物识别
        if (canUseBiometric()) {
            currentBiometricSetupType = "face_login"
            biometricPrompt.authenticate(BiometricPrompt.PromptInfo.Builder()
                .setTitle("人脸识别登录")
                .setSubtitle("请使用面容进行验证")
                .setDescription("验证成功后将自动登录系统")
                .setNegativeButtonText("取消")
                .build())
        } else {
            // 模拟器环境，直接模拟登录成功
            showSimulatedBiometricLogin("face")
        }
    }

    private fun performFingerprintLogin() {
        if (!fingerprintEnabled) {
            Toast.makeText(this, "指纹识别未设置", Toast.LENGTH_SHORT).show()
            return
        }

        // 检查是否支持真实生物识别
        if (canUseBiometric()) {
            currentBiometricSetupType = "fingerprint_login"
            biometricPrompt.authenticate(BiometricPrompt.PromptInfo.Builder()
                .setTitle("指纹识别登录")
                .setSubtitle("请使用指纹进行验证")
                .setDescription("验证成功后将自动登录系统")
                .setNegativeButtonText("取消")
                .build())
        } else {
            // 模拟器环境，直接模拟登录成功
            showSimulatedBiometricLogin("fingerprint")
        }
    }

    private fun performLogout() {
        AlertDialog.Builder(this)
            .setTitle("确认退出")
            .setMessage("您确定要退出登录吗？")
            .setPositiveButton("确定") { _, _ ->
                showLoginScreen()
                webView.loadUrl("about:blank")
                Toast.makeText(this, "已退出登录", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("取消", null)
            .show()
    }
    
    private fun startQRScan() {
        try {
            Toast.makeText(this, "🚀 正在启动二维码扫描...", Toast.LENGTH_SHORT).show()

            // 使用直接相机Activity
            val intent = Intent(this, DirectCameraActivity::class.java)
            intent.putExtra(DirectCameraActivity.EXTRA_MODE, DirectCameraActivity.MODE_QR_SCAN)
            startActivity(intent)

        } catch (e: Exception) {
            Toast.makeText(this, "❌ 启动二维码扫描失败: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()

            // 如果启动失败，显示备选方案
            AlertDialog.Builder(this)
                .setTitle("📱 二维码扫描")
                .setMessage("启动扫描器失败，选择其他方式：")
                .setPositiveButton("🌐 WebQR.com 扫描") { _, _ ->
                    loadWebQRScanner()
                }
                .setNeutralButton("📋 生成测试二维码") { _, _ ->
                    generateTestQRCode()
                }
                .setNegativeButton("取消", null)
                .show()
        }
    }

    private fun loadWebQRScanner() {
        // 确保 WebView 设置正确
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            mediaPlaybackRequiresUserGesture = false
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
        }

        // 设置 WebViewClient 来处理页面加载
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                if (url?.contains("webqr.com") == true) {
                    Toast.makeText(this@MainActivity, "WebQR.com 加载完成，请允许相机权限", Toast.LENGTH_LONG).show()
                }
            }

            override fun onReceivedError(view: WebView?, errorCode: Int, description: String?, failingUrl: String?) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                Toast.makeText(this@MainActivity, "加载失败: $description", Toast.LENGTH_SHORT).show()
            }
        }

        // 设置 WebChromeClient 来处理相机权限请求
        webView.webChromeClient = object : WebChromeClient() {
            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.let {
                    // 检查是否请求相机权限
                    if (it.resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)) {
                        // 检查应用是否已有相机权限
                        if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.CAMERA)
                            == PackageManager.PERMISSION_GRANTED) {
                            // 授权给WebView使用相机
                            it.grant(it.resources)
                            Toast.makeText(this@MainActivity, "✅ 相机权限已授权给扫描器", Toast.LENGTH_SHORT).show()
                        } else {
                            // 拒绝权限请求
                            it.deny()
                            Toast.makeText(this@MainActivity, "❌ 需要相机权限才能扫描二维码", Toast.LENGTH_LONG).show()
                        }
                    } else {
                        // 其他权限请求，直接授权
                        it.grant(it.resources)
                    }
                }
            }
        }

        webView.loadUrl("https://webqr.com/")
        Toast.makeText(this, "正在加载 WebQR.com 二维码扫描器...", Toast.LENGTH_SHORT).show()
    }

    private fun generateTestQRCode() {
        // 生成包含 WebQR.com 网址的二维码页面
        val qrCodeHtml = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>测试二维码</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        min-height: 100vh;
                    }
                    .container {
                        max-width: 400px;
                        margin: 0 auto;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 15px;
                        padding: 30px;
                        backdrop-filter: blur(10px);
                    }
                    .title {
                        font-size: 24px;
                        margin-bottom: 20px;
                    }
                    .qr-code {
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        margin: 20px 0;
                        display: inline-block;
                    }
                    .description {
                        font-size: 16px;
                        line-height: 1.6;
                        margin-top: 20px;
                    }
                    .url {
                        background: rgba(255, 255, 255, 0.2);
                        padding: 10px;
                        border-radius: 5px;
                        margin: 10px 0;
                        word-break: break-all;
                    }
                    .button {
                        background: #4CAF50;
                        color: white;
                        border: none;
                        padding: 15px 30px;
                        border-radius: 25px;
                        font-size: 16px;
                        margin: 10px;
                        cursor: pointer;
                    }
                </style>
                <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
            </head>
            <body>
                <div class="container">
                    <div class="title">📱 测试二维码</div>
                    <div class="description">
                        扫描下方二维码将打开 WebQR.com 网站
                    </div>
                    <div class="url">https://webqr.com/</div>
                    <div id="qrcode" class="qr-code">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://webqr.com/" alt="QR Code" style="width: 200px; height: 200px;">
                    </div>
                    <div class="description">
                        ✅ 使用相机扫描此二维码<br>
                        ✅ 或点击下方按钮直接访问
                    </div>
                    <button class="button" onclick="window.open('https://webqr.com/', '_blank')">
                        🌐 直接访问 WebQR.com
                    </button>
                </div>

                <script>
                    // 尝试使用 QRCode.js 生成二维码，如果失败则使用在线 API
                    if (typeof QRCode !== 'undefined') {
                        try {
                            document.getElementById('qrcode').innerHTML = '';
                            QRCode.toCanvas(document.getElementById('qrcode'), 'https://webqr.com/', {
                                width: 200,
                                height: 200,
                                colorDark: '#000000',
                                colorLight: '#ffffff',
                                correctLevel: QRCode.CorrectLevel.M
                            }, function (error) {
                                if (error) {
                                    console.error('QRCode.js 生成失败:', error);
                                    // 保持使用在线 API 生成的二维码
                                }
                            });
                        } catch (e) {
                            console.error('QRCode.js 加载失败:', e);
                            // 保持使用在线 API 生成的二维码
                        }
                    }

                    // 添加点击二维码直接跳转功能
                    document.getElementById('qrcode').onclick = function() {
                        window.open('https://webqr.com/', '_blank');
                    };
                </script>
            </body>
            </html>
        """.trimIndent()

        webView.loadData(qrCodeHtml, "text/html; charset=UTF-8", null)
        Toast.makeText(this, "已生成 WebQR.com 测试二维码", Toast.LENGTH_SHORT).show()
    }

    private fun loadAMapWithLocation() {
        // 检查位置权限
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            // 请求位置权限
            ActivityCompat.requestPermissions(this,
                arrayOf(android.Manifest.permission.ACCESS_FINE_LOCATION,
                       android.Manifest.permission.ACCESS_COARSE_LOCATION),
                LOCATION_PERMISSION_REQUEST_CODE)
            return
        }

        // 配置WebView以支持地理位置
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setGeolocationEnabled(true)
            allowFileAccess = true
            allowContentAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
            mediaPlaybackRequiresUserGesture = false
            userAgentString = "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        }

        // 设置地理位置权限处理
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                // 自动授权地理位置权限给高德地图
                callback?.invoke(origin, true, false)
                Toast.makeText(this@MainActivity, "✅ 已授权位置权限给高德地图", Toast.LENGTH_SHORT).show()
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.grant(request.resources)
            }
        }

        // 设置WebViewClient
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                if (url?.contains("amap.com") == true || url?.contains("gaode.com") == true) {
                    Toast.makeText(this@MainActivity, "🗺️ 高德地图已加载，请点击网页上的定位按钮获取坐标", Toast.LENGTH_LONG).show()
                }
            }

            override fun onReceivedError(view: WebView?, errorCode: Int, description: String?, failingUrl: String?) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                Toast.makeText(this@MainActivity, "❌ 地图加载失败: $description", Toast.LENGTH_LONG).show()
            }
        }

        // 直接加载高德地图网页版
        val amapUrl = "https://ditu.amap.com/"
        webView.loadUrl(amapUrl)
        Toast.makeText(this, "🗺️ 正在加载高德地图网页版，请在网页上点击定位按钮", Toast.LENGTH_LONG).show()
    }

    private fun loadTestWebPage() {
        // 配置WebView以支持地理位置
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setGeolocationEnabled(true)
            allowFileAccess = true
            allowContentAccess = true
            allowFileAccessFromFileURLs = true
            allowUniversalAccessFromFileURLs = true
            mediaPlaybackRequiresUserGesture = false
            userAgentString = "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
        }

        // 设置地理位置权限处理
        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                // 自动授权地理位置权限给测试网页
                callback?.invoke(origin, true, false)
                Toast.makeText(this@MainActivity, "✅ 已授权位置权限给测试网页", Toast.LENGTH_SHORT).show()
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                request?.grant(request.resources)
            }
        }

        // 设置WebViewClient
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                Toast.makeText(this@MainActivity, "🌍 测试网页已加载，请测试GPS定位功能", Toast.LENGTH_LONG).show()
            }

            override fun onReceivedError(view: WebView?, errorCode: Int, description: String?, failingUrl: String?) {
                super.onReceivedError(view, errorCode, description, failingUrl)
                Toast.makeText(this@MainActivity, "❌ 网页加载失败: $description", Toast.LENGTH_LONG).show()
            }
        }

        // 加载指定的测试网页
        val testUrl = "https://flexpdt.flexsystem.cn/test.html"
        webView.loadUrl(testUrl)
        Toast.makeText(this, "🌍 正在加载测试网页，请观察GPS定位效果", Toast.LENGTH_LONG).show()
    }

    private fun loadWelcomePage() {
        val welcomeHtml = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>MobileApp 主页</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        margin: 0;
                        padding: 20px;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        min-height: 100vh;
                    }
                    .container {
                        max-width: 400px;
                        margin: 0 auto;
                        text-align: center;
                    }
                    .welcome {
                        font-size: 28px;
                        margin-bottom: 30px;
                    }
                    .card {
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 20px;
                        backdrop-filter: blur(10px);
                    }
                    .feature {
                        font-size: 18px;
                        margin: 15px 0;
                        padding: 10px;
                        background: rgba(255, 255, 255, 0.1);
                        border-radius: 8px;
                    }
                    .status {
                        color: #4CAF50;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="welcome">🎉 登录成功！</div>

                    <div class="card">
                        <h3>📱 可用功能</h3>
                        <div class="feature">
                            🔐 用户登录 <span class="status">✅</span>
                        </div>
                        <div class="feature">
                            😊 人脸识别 <span class="status">${if (faceRecognitionEnabled) "✅ 已设置" else "⚠️ 未设置"}</span>
                        </div>
                        <div class="feature">
                            👆 指纹识别 <span class="status">${if (fingerprintEnabled) "✅ 已设置" else "⚠️ 未设置"}</span>
                        </div>
                        <div class="feature">
                            📱 二维码扫描 <span class="status">✅</span>
                        </div>
                        <div class="feature">
                            🌐 WebView 集成 <span class="status">✅</span>
                        </div>
                    </div>

                    <div class="card">
                        <h3>🚀 使用说明</h3>
                        <p style="text-align: left; line-height: 1.6;">
                            1. 点击 "📱 扫描二维码 (相机)" 使用设备相机扫码<br>
                            2. 点击 "🌐 WebQR.com 扫描" 使用网页版扫码<br>
                            3. 点击 "🗺️ 高德地图定位" 打开地图并获取GPS坐标<br>
                            4. 点击 "🌍 网页高德查经纬度" 测试指定网页的GPS定位功能<br>
                            5. 点击 "😊 设置人脸识别" 启用面容登录<br>
                            6. 点击 "👆 设置指纹识别" 启用指纹登录<br>
                            7. 设置完成后，下次可使用生物识别登录<br>
                            8. 点击 "退出" 返回登录界面<br>
                            9. 登录凭据：用户名 admin，密码 1
                        </p>
                    </div>
                </div>
            </body>
            </html>
        """.trimIndent()

        webView.loadData(welcomeHtml, "text/html; charset=UTF-8", null)
    }

    private fun requestCameraPermissionForScanning() {
        AlertDialog.Builder(this)
            .setTitle("📷 需要相机权限")
            .setMessage("二维码扫描功能需要使用相机权限。\n\n点击确定后，请在系统对话框中允许相机权限。")
            .setPositiveButton("确定") { _, _ ->
                ActivityCompat.requestPermissions(this,
                    arrayOf(Manifest.permission.CAMERA),
                    CAMERA_PERMISSION_REQUEST_CODE)
            }
            .setNegativeButton("取消", null)
            .show()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            CAMERA_PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Toast.makeText(this, "✅ 相机权限已获取，正在启动扫描器...", Toast.LENGTH_SHORT).show()
                    // 权限获得后自动启动扫描
                    loadWebQRScanner()
                } else {
                    Toast.makeText(this, "❌ 需要相机权限才能使用二维码扫描功能", Toast.LENGTH_LONG).show()
                }
            }
            LOCATION_PERMISSION_REQUEST_CODE -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    Toast.makeText(this, "✅ 位置权限已获取，正在加载地图...", Toast.LENGTH_SHORT).show()
                    // 权限获得后自动加载地图
                    loadAMapWithLocation()
                } else {
                    Toast.makeText(this, "❌ 需要位置权限才能使用地图定位功能", Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    private fun loadBiometricSettings() {
        faceRecognitionEnabled = sharedPreferences.getBoolean(KEY_FACE_ENABLED, false)
        fingerprintEnabled = sharedPreferences.getBoolean(KEY_FINGERPRINT_ENABLED, false)
    }

    private fun saveBiometricSettings() {
        sharedPreferences.edit().apply {
            putBoolean(KEY_FACE_ENABLED, faceRecognitionEnabled)
            putBoolean(KEY_FINGERPRINT_ENABLED, fingerprintEnabled)
            apply()
        }
    }

    private fun getBuildTime(): String {
        return try {
            val packageInfo = packageManager.getPackageInfo(packageName, 0)
            val buildTime = packageInfo.lastUpdateTime
            val sdf = java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault())
            "v${packageInfo.versionName} - ${sdf.format(java.util.Date(buildTime))}"
        } catch (e: Exception) {
            "DirectCamera-v1.0 - ${java.text.SimpleDateFormat("yyyy-MM-dd HH:mm:ss", java.util.Locale.getDefault()).format(java.util.Date())}"
        }
    }


    
    private fun showTestDialog() {
        AlertDialog.Builder(this)
            .setTitle("测试成功")
            .setMessage("🎉 MobileApp 在 Android API 33 模拟器上运行正常！\n\n✅ 原生 Android 应用正常\n✅ WebView 集成成功\n✅ 模拟器连接成功\n✅ APK 构建成功")
            .setPositiveButton("确定") { dialog, _ ->
                dialog.dismiss()
                Toast.makeText(this, "测试完成", Toast.LENGTH_SHORT).show()
            }
            .show()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        when (requestCode) {
            FACE_CAPTURE_REQUEST -> {
                if (resultCode == Activity.RESULT_OK) {
                    // 人脸采集成功
                    faceRecognitionEnabled = true
                    saveBiometricSettings()
                    updateFaceButton()
                    Toast.makeText(this, "✅ 人脸识别设置成功！", Toast.LENGTH_SHORT).show()
                } else {
                    Toast.makeText(this, "人脸采集已取消", Toast.LENGTH_SHORT).show()
                }
            }
            FACE_VERIFY_REQUEST -> {
                if (resultCode == Activity.RESULT_OK) {
                    // 人脸识别成功，执行登录
                    Toast.makeText(this, "😊 人脸识别登录成功！", Toast.LENGTH_SHORT).show()
                    performSuccessfulLogin("admin")
                } else {
                    Toast.makeText(this, "人脸识别已取消", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
