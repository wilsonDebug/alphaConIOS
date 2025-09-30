package com.mobileapp.test

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.provider.MediaStore
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

/**
 * 简化的人脸识别Activity
 * 使用系统相机来避免CameraX兼容性问题
 */
class SimpleFaceActivity : AppCompatActivity() {
    
    companion object {
        private const val CAMERA_PERMISSION_REQUEST_CODE = 1001
        private const val CAMERA_REQUEST_CODE = 1002
        const val EXTRA_MODE = "mode"
        const val MODE_CAPTURE = "capture"
        const val MODE_VERIFY = "verify"
    }
    
    private var currentMode: String = MODE_CAPTURE
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 获取模式
        currentMode = intent.getStringExtra(EXTRA_MODE) ?: MODE_CAPTURE
        
        createUI()
        
        // 检查相机权限
        if (checkCameraPermission()) {
            showCameraOptions()
        } else {
            requestCameraPermission()
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
            text = if (currentMode == MODE_CAPTURE) "📷 人脸采集" else "🔍 人脸识别"
            textSize = 24f
            setTextColor(Color.parseColor("#2196F3"))
            setPadding(0, 0, 0, 30)
        }
        layout.addView(titleText)
        
        // 说明文字
        val instructionText = TextView(this).apply {
            text = if (currentMode == MODE_CAPTURE) {
                "点击下方按钮启动相机进行人脸采集\n\n请确保：\n• 光线充足\n• 面部清晰可见\n• 正面对着相机"
            } else {
                "点击下方按钮启动相机进行人脸识别\n\n请确保：\n• 光线充足\n• 面部清晰可见\n• 正面对着相机"
            }
            textSize = 16f
            setTextColor(Color.parseColor("#666666"))
            setPadding(0, 0, 0, 40)
        }
        layout.addView(instructionText)
        
        // 启动相机按钮
        val cameraButton = Button(this).apply {
            text = if (currentMode == MODE_CAPTURE) "📷 开始采集人脸" else "🔍 开始识别人脸"
            textSize = 18f
            setPadding(0, 30, 0, 30)
            setBackgroundColor(Color.parseColor("#4CAF50"))
            setTextColor(Color.WHITE)
            setOnClickListener { launchCamera() }
        }
        layout.addView(cameraButton)
        
        // 模拟按钮（用于测试）
        val simulateButton = Button(this).apply {
            text = if (currentMode == MODE_CAPTURE) "✅ 模拟采集成功" else "✅ 模拟识别成功"
            textSize = 16f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(Color.parseColor("#FF9800"))
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 20 }
            setOnClickListener { simulateSuccess() }
        }
        layout.addView(simulateButton)
        
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
    
    private fun checkCameraPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }
    
    private fun requestCameraPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.CAMERA),
            CAMERA_PERMISSION_REQUEST_CODE
        )
    }
    
    private fun showCameraOptions() {
        Toast.makeText(this, "相机权限已获取，可以启动相机", Toast.LENGTH_SHORT).show()
    }
    
    private fun launchCamera() {
        try {
            Toast.makeText(this, "🔍 正在检查相机应用...", Toast.LENGTH_SHORT).show()

            // 方法1：标准相机Intent
            val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            val cameraActivities = packageManager.queryIntentActivities(cameraIntent, PackageManager.MATCH_DEFAULT_ONLY)

            if (cameraActivities.isNotEmpty()) {
                Toast.makeText(this, "✅ 找到 ${cameraActivities.size} 个相机应用，启动中...", Toast.LENGTH_SHORT).show()
                startActivityForResult(cameraIntent, CAMERA_REQUEST_CODE)
                return
            }

            // 方法2：尝试通用相机Intent
            val genericCameraIntent = Intent("android.media.action.IMAGE_CAPTURE")
            if (genericCameraIntent.resolveActivity(packageManager) != null) {
                Toast.makeText(this, "✅ 使用通用相机接口启动...", Toast.LENGTH_SHORT).show()
                startActivityForResult(genericCameraIntent, CAMERA_REQUEST_CODE)
                return
            }

            // 方法3：尝试启动系统相机应用
            val systemCameraIntent = Intent()
            systemCameraIntent.action = "android.intent.action.MAIN"
            systemCameraIntent.addCategory("android.intent.category.APP_CAMERA")
            if (systemCameraIntent.resolveActivity(packageManager) != null) {
                Toast.makeText(this, "✅ 启动系统相机应用...", Toast.LENGTH_SHORT).show()
                startActivity(systemCameraIntent)
                return
            }

            // 如果都失败了，显示详细错误信息
            showCameraNotFoundDialog()

        } catch (e: Exception) {
            Toast.makeText(this, "❌ 启动相机异常: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
        }
    }
    
    private fun showCameraNotFoundDialog() {
        AlertDialog.Builder(this)
            .setTitle("📷 相机不可用")
            .setMessage("未找到可用的相机应用。\n\n可能的原因：\n• 设备没有相机硬件\n• 相机应用被禁用\n• 模拟器相机未配置\n\n建议：\n• 在真实设备上测试\n• 检查相机应用是否可用\n• 使用模拟功能进行测试")
            .setPositiveButton("使用模拟功能") { _, _ ->
                simulateSuccess()
            }
            .setNegativeButton("返回") { _, _ ->
                finish()
            }
            .show()
    }

    private fun simulateSuccess() {
        val message = if (currentMode == MODE_CAPTURE) {
            "模拟人脸采集成功！\n\n在真实应用中，这里会：\n• 分析拍摄的照片\n• 提取面部特征\n• 保存到本地数据库"
        } else {
            "模拟人脸识别成功！\n\n在真实应用中，这里会：\n• 分析拍摄的照片\n• 与保存的特征比对\n• 返回识别结果"
        }

        AlertDialog.Builder(this)
            .setTitle("✅ 操作成功")
            .setMessage(message)
            .setPositiveButton("确定") { _, _ ->
                setResult(Activity.RESULT_OK)
                finish()
            }
            .show()
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == CAMERA_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                showCameraOptions()
            } else {
                AlertDialog.Builder(this)
                    .setTitle("权限需要")
                    .setMessage("人脸识别功能需要相机权限。\n\n请在系统设置中手动授权相机权限，然后重新尝试。")
                    .setPositiveButton("去设置") { _, _ ->
                        // 可以添加跳转到设置的代码
                        finish()
                    }
                    .setNegativeButton("取消") { _, _ -> finish() }
                    .setCancelable(false)
                    .show()
            }
        }
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == CAMERA_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK) {
                // 相机拍照成功
                val message = if (currentMode == MODE_CAPTURE) {
                    "照片拍摄成功！\n\n在真实应用中，现在会分析这张照片并提取面部特征。"
                } else {
                    "照片拍摄成功！\n\n在真实应用中，现在会将这张照片与保存的面部特征进行比对。"
                }
                
                AlertDialog.Builder(this)
                    .setTitle("📷 拍照成功")
                    .setMessage(message)
                    .setPositiveButton("处理成功") { _, _ ->
                        setResult(Activity.RESULT_OK)
                        finish()
                    }
                    .setNegativeButton("重新拍摄") { _, _ ->
                        launchCamera()
                    }
                    .show()
            } else {
                Toast.makeText(this, "拍照已取消", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
