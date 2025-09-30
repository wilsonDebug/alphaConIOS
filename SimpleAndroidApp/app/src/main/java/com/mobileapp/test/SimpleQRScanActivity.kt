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
 * 简化的二维码扫描Activity
 * 提供多种二维码扫描方式
 */
class SimpleQRScanActivity : AppCompatActivity() {
    
    companion object {
        private const val CAMERA_PERMISSION_REQUEST_CODE = 1001
        private const val CAMERA_REQUEST_CODE = 1002
    }
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createUI()
    }
    
    private fun createUI() {
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(40, 40, 40, 40)
            setBackgroundColor(Color.parseColor("#F5F5F5"))
        }
        
        // 标题
        val titleText = TextView(this).apply {
            text = "📱 二维码扫描"
            textSize = 24f
            setTextColor(Color.parseColor("#2196F3"))
            setPadding(0, 0, 0, 30)
        }
        layout.addView(titleText)
        
        // 说明文字
        val instructionText = TextView(this).apply {
            text = "选择扫描方式：\n\n• 相机扫描：使用相机实时扫描二维码\n• 在线扫描：跳转到WebQR.com在线扫描\n• 模拟扫描：用于测试功能"
            textSize = 16f
            setTextColor(Color.parseColor("#666666"))
            setPadding(0, 0, 0, 40)
        }
        layout.addView(instructionText)
        
        // 相机扫描按钮
        val cameraButton = Button(this).apply {
            text = "📷 相机扫描"
            textSize = 18f
            setPadding(0, 30, 0, 30)
            setBackgroundColor(Color.parseColor("#4CAF50"))
            setTextColor(Color.WHITE)
            setOnClickListener { startCameraScan() }
        }
        layout.addView(cameraButton)
        
        // 在线扫描按钮
        val webButton = Button(this).apply {
            text = "🌐 在线扫描 (WebQR.com)"
            textSize = 18f
            setPadding(0, 30, 0, 30)
            setBackgroundColor(Color.parseColor("#2196F3"))
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 20 }
            setOnClickListener { startWebScan() }
        }
        layout.addView(webButton)
        
        // 第三方扫描应用按钮
        val thirdPartyButton = Button(this).apply {
            text = "📲 第三方扫描应用"
            textSize = 18f
            setPadding(0, 30, 0, 30)
            setBackgroundColor(Color.parseColor("#9C27B0"))
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 20 }
            setOnClickListener { startThirdPartyScan() }
        }
        layout.addView(thirdPartyButton)
        
        // 模拟扫描按钮
        val simulateButton = Button(this).apply {
            text = "✅ 模拟扫描成功"
            textSize = 16f
            setPadding(0, 20, 0, 20)
            setBackgroundColor(Color.parseColor("#FF9800"))
            setTextColor(Color.WHITE)
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply { topMargin = 30 }
            setOnClickListener { simulateQRScan() }
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
    
    private fun startCameraScan() {
        if (checkCameraPermission()) {
            launchCamera()
        } else {
            requestCameraPermission()
        }
    }
    
    private fun startWebScan() {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://webqr.com/"))
            startActivity(intent)
            
            // 显示使用说明
            AlertDialog.Builder(this)
                .setTitle("🌐 在线扫描")
                .setMessage("已打开WebQR.com网站\n\n使用方法：\n1. 允许网站访问相机\n2. 将二维码对准相机\n3. 等待自动识别\n4. 复制识别结果")
                .setPositiveButton("知道了", null)
                .show()
                
        } catch (e: Exception) {
            Toast.makeText(this, "无法打开浏览器: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }
    
    private fun startThirdPartyScan() {
        try {
            // 尝试启动常见的二维码扫描应用
            val scanApps = listOf(
                "com.google.zxing.client.android", // ZXing Barcode Scanner
                "com.qrcodescanner.barcodescanner", // QR Code Scanner
                "com.gamma.scan" // QR Code Reader
            )
            
            var appFound = false
            for (packageName in scanApps) {
                try {
                    val intent = packageManager.getLaunchIntentForPackage(packageName)
                    if (intent != null) {
                        startActivity(intent)
                        appFound = true
                        Toast.makeText(this, "已启动二维码扫描应用", Toast.LENGTH_SHORT).show()
                        break
                    }
                } catch (e: Exception) {
                    // 继续尝试下一个应用
                }
            }
            
            if (!appFound) {
                // 如果没有找到专门的扫描应用，尝试通用的扫描Intent
                val intent = Intent("com.google.zxing.client.android.SCAN")
                intent.putExtra("SCAN_MODE", "QR_CODE_MODE")
                
                if (intent.resolveActivity(packageManager) != null) {
                    startActivityForResult(intent, 100)
                } else {
                    showInstallScannerDialog()
                }
            }
            
        } catch (e: Exception) {
            showInstallScannerDialog()
        }
    }
    
    private fun showInstallScannerDialog() {
        AlertDialog.Builder(this)
            .setTitle("📲 安装扫描应用")
            .setMessage("未找到二维码扫描应用\n\n建议安装以下应用之一：\n• ZXing Barcode Scanner\n• QR Code Scanner\n• QR Code Reader")
            .setPositiveButton("去应用商店") { _, _ ->
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("market://search?q=qr code scanner"))
                    startActivity(intent)
                } catch (e: Exception) {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/search?q=qr code scanner"))
                    startActivity(intent)
                }
            }
            .setNegativeButton("取消", null)
            .show()
    }
    
    private fun simulateQRScan() {
        val qrResults = listOf(
            "https://www.google.com",
            "https://github.com",
            "Hello World!",
            "测试二维码内容",
            "https://webqr.com"
        )
        
        val randomResult = qrResults.random()
        
        AlertDialog.Builder(this)
            .setTitle("✅ 扫描成功")
            .setMessage("模拟扫描结果：\n\n$randomResult\n\n在真实应用中，这里会显示实际扫描到的二维码内容。")
            .setPositiveButton("复制内容") { _, _ ->
                val clipboard = getSystemService(CLIPBOARD_SERVICE) as android.content.ClipboardManager
                val clip = android.content.ClipData.newPlainText("QR Result", randomResult)
                clipboard.setPrimaryClip(clip)
                Toast.makeText(this, "已复制到剪贴板", Toast.LENGTH_SHORT).show()
            }
            .setNegativeButton("关闭", null)
            .show()
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
    
    private fun launchCamera() {
        try {
            Toast.makeText(this, "🔍 正在检查相机应用...", Toast.LENGTH_SHORT).show()

            // 方法1：标准相机Intent
            val cameraIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
            val cameraActivities = packageManager.queryIntentActivities(cameraIntent, PackageManager.MATCH_DEFAULT_ONLY)

            if (cameraActivities.isNotEmpty()) {
                Toast.makeText(this, "✅ 找到相机应用，启动中...", Toast.LENGTH_SHORT).show()
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

            // 如果都失败了，提供替代方案
            AlertDialog.Builder(this)
                .setTitle("📷 相机不可用")
                .setMessage("未找到可用的相机应用。\n\n建议使用其他扫描方式：")
                .setPositiveButton("🌐 在线扫描") { _, _ ->
                    startWebScan()
                }
                .setNeutralButton("✅ 模拟扫描") { _, _ ->
                    simulateQRScan()
                }
                .setNegativeButton("返回", null)
                .show()

        } catch (e: Exception) {
            Toast.makeText(this, "❌ 启动相机异常: ${e.message}", Toast.LENGTH_LONG).show()
            e.printStackTrace()
        }
    }
    
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        
        if (requestCode == CAMERA_PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                launchCamera()
            } else {
                Toast.makeText(this, "需要相机权限才能扫描二维码", Toast.LENGTH_LONG).show()
            }
        }
    }
    
    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        
        if (requestCode == CAMERA_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            Toast.makeText(this, "照片拍摄成功！在真实应用中会分析图片中的二维码", Toast.LENGTH_LONG).show()
        }
    }
}
