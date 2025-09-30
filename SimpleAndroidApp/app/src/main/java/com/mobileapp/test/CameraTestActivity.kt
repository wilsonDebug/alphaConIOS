package com.mobileapp.test

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

/**
 * 相机测试Activity
 * 测试各种相机启动方法
 */
class CameraTestActivity : AppCompatActivity() {
    
    companion object {
        private const val CAMERA_PERMISSION_REQUEST_CODE = 1001
        private const val CAMERA_REQUEST_CODE = 1002
        const val EXTRA_MODE = "mode"
        const val MODE_FACE = "face"
        const val MODE_QR = "qr"
    }
    
    private var currentMode: String = MODE_FACE
    private lateinit var statusText: TextView
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        currentMode = intent.getStringExtra(EXTRA_MODE) ?: MODE_FACE

        createUI()
        checkCameraAvailability()

        // 启动时立即检查并请求相机权限
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "🔐 需要相机权限，正在请求...", Toast.LENGTH_SHORT).show()
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), CAMERA_PERMISSION_REQUEST_CODE)
        } else {
            Toast.makeText(this, "✅ 相机权限已授权，可以使用相机功能", Toast.LENGTH_SHORT).show()
        }
    }
    
    private fun createUI() {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 40, 40, 40)
            setBackgroundColor(Color.parseColor("#F5F5F5"))
        }
        
        // 标题
        val titleText = TextView(this).apply {
            text = "📷 相机功能测试"
            textSize = 24f
            setTextColor(Color.parseColor("#2196F3"))
            setPadding(0, 0, 0, 30)
        }
        layout.addView(titleText)
        
        // 状态显示
        statusText = TextView(this).apply {
            text = "正在检查相机状态..."
            textSize = 16f
            setTextColor(Color.parseColor("#666666"))
            setPadding(0, 0, 0, 30)
        }
        layout.addView(statusText)
        
        // 方法1：标准相机Intent
        val method1Button = Button(this).apply {
            text = "方法1: MediaStore.ACTION_IMAGE_CAPTURE"
            textSize = 14f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(Color.parseColor("#4CAF50"))
            setTextColor(Color.WHITE)
            setOnClickListener { testMethod1() }
        }
        layout.addView(method1Button)
        
        // 方法2：通用相机Intent
        val method2Button = Button(this).apply {
            text = "方法2: android.media.action.IMAGE_CAPTURE"
            textSize = 14f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(Color.parseColor("#2196F3"))
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 15 }
            setOnClickListener { testMethod2() }
        }
        layout.addView(method2Button)
        
        // 方法3：启动相机应用
        val method3Button = Button(this).apply {
            text = "方法3: 启动相机应用"
            textSize = 14f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(Color.parseColor("#FF9800"))
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 15 }
            setOnClickListener { testMethod3() }
        }
        layout.addView(method3Button)
        
        // 方法4：检查权限并启动
        val method4Button = Button(this).apply {
            text = "方法4: 检查权限后启动"
            textSize = 14f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(Color.parseColor("#9C27B0"))
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 15 }
            setOnClickListener { testMethod4() }
        }
        layout.addView(method4Button)
        
        // 显示相机应用列表
        val listButton = Button(this).apply {
            text = "📋 显示可用相机应用"
            textSize = 14f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(Color.parseColor("#607D8B"))
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 30 }
            setOnClickListener { showCameraApps() }
        }
        layout.addView(listButton)
        
        // 返回按钮
        val backButton = Button(this).apply {
            text = "← 返回"
            textSize = 16f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(Color.parseColor("#757575"))
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 40 }
            setOnClickListener { finish() }
        }
        layout.addView(backButton)
        
        setContentView(layout)
    }
    
    private fun checkCameraAvailability() {
        val hasCamera = packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)
        val hasFrontCamera = packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_FRONT)
        val hasBackCamera = packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA)
        
        val status = StringBuilder()
        status.append("📱 设备相机状态：\n")
        status.append("• 任意相机: ${if (hasCamera) "✅" else "❌"}\n")
        status.append("• 前置相机: ${if (hasFrontCamera) "✅" else "❌"}\n")
        status.append("• 后置相机: ${if (hasBackCamera) "✅" else "❌"}\n")
        
        val cameraPermission = ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
        status.append("• 相机权限: ${if (cameraPermission == PackageManager.PERMISSION_GRANTED) "✅ 已授权" else "❌ 未授权"}")
        
        statusText.text = status.toString()
    }
    
    private fun testMethod1() {
        try {
            Toast.makeText(this, "🔍 方法1：检查相机应用...", Toast.LENGTH_SHORT).show()

            val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            val activities = packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY)

            Toast.makeText(this, "📱 查询到 ${activities.size} 个相机应用", Toast.LENGTH_SHORT).show()

            if (activities.isNotEmpty()) {
                // 显示找到的相机应用信息
                val appNames = activities.map { it.loadLabel(packageManager) }.joinToString(", ")
                Toast.makeText(this, "✅ 相机应用: $appNames", Toast.LENGTH_LONG).show()

                // 启动相机
                Toast.makeText(this, "🚀 正在启动相机...", Toast.LENGTH_SHORT).show()
                startActivityForResult(intent, CAMERA_REQUEST_CODE)

            } else {
                // 没有找到相机应用，尝试其他方法
                Toast.makeText(this, "❌ 未找到相机应用，尝试其他方法", Toast.LENGTH_LONG).show()
                testMethod2()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "❌ 方法1异常: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
        }
    }
    
    private fun testMethod2() {
        try {
            Toast.makeText(this, "🔍 方法2：尝试通用相机接口...", Toast.LENGTH_SHORT).show()

            val intent = Intent("android.media.action.IMAGE_CAPTURE")
            val componentName = intent.resolveActivity(packageManager)

            if (componentName != null) {
                Toast.makeText(this, "✅ 找到相机: ${componentName.packageName}", Toast.LENGTH_SHORT).show()
                Toast.makeText(this, "🚀 正在启动相机...", Toast.LENGTH_SHORT).show()
                startActivityForResult(intent, CAMERA_REQUEST_CODE)
            } else {
                Toast.makeText(this, "❌ 通用相机接口不可用，尝试方法3", Toast.LENGTH_LONG).show()
                testMethod3()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "❌ 方法2异常: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
            testMethod3()
        }
    }
    
    private fun testMethod3() {
        try {
            val intent = Intent()
            intent.action = "android.intent.action.MAIN"
            intent.addCategory("android.intent.category.APP_CAMERA")
            
            if (intent.resolveActivity(packageManager) != null) {
                Toast.makeText(this, "方法3：启动相机应用", Toast.LENGTH_SHORT).show()
                startActivity(intent)
            } else {
                Toast.makeText(this, "方法3失败：未找到相机应用", Toast.LENGTH_LONG).show()
            }
        } catch (e: Exception) {
            Toast.makeText(this, "方法3异常: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
    
    private fun testMethod4() {
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            Toast.makeText(this, "请求相机权限...", Toast.LENGTH_SHORT).show()
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.CAMERA), CAMERA_PERMISSION_REQUEST_CODE)
        } else {
            Toast.makeText(this, "权限已授权，启动相机", Toast.LENGTH_SHORT).show()
            testMethod1()
        }
    }
    
    private fun showCameraApps() {
        val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        val activities = packageManager.queryIntentActivities(intent, PackageManager.MATCH_DEFAULT_ONLY)
        
        val appList = StringBuilder()
        appList.append("📱 可用相机应用 (${activities.size} 个)：\n\n")
        
        if (activities.isEmpty()) {
            appList.append("❌ 未找到任何相机应用")
        } else {
            activities.forEachIndexed { index, resolveInfo ->
                val appName = resolveInfo.loadLabel(packageManager)
                val packageName = resolveInfo.activityInfo.packageName
                appList.append("${index + 1}. $appName\n   ($packageName)\n\n")
            }
        }
        
        AlertDialog.Builder(this)
            .setTitle("📋 相机应用列表")
            .setMessage(appList.toString())
            .setPositiveButton("确定", null)
            .show()
    }
    
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == CAMERA_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "✅ 相机权限已授权", Toast.LENGTH_SHORT).show()
                checkCameraAvailability()
                testMethod1()
            } else {
                Toast.makeText(this, "❌ 相机权限被拒绝", Toast.LENGTH_LONG).show()
            }
        }
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == CAMERA_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                Toast.makeText(this, "✅ 相机启动成功！拍照完成", Toast.LENGTH_LONG).show()
                setResult(Activity.RESULT_OK)
                finish()
            } else {
                Toast.makeText(this, "相机操作已取消", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
