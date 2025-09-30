package com.mobileapp.test

import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.view.PreviewView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

/**
 * 人脸识别Activity
 * 提供人脸采集和识别功能
 */
class FaceRecognitionActivity : AppCompatActivity(), FaceRecognitionManager.FaceRecognitionCallback {
    
    companion object {
        private const val CAMERA_PERMISSION_REQUEST_CODE = 1001
        const val EXTRA_MODE = "mode"
        const val MODE_CAPTURE = "capture"
        const val MODE_VERIFY = "verify"
    }
    
    private lateinit var previewView: PreviewView
    private lateinit var statusText: TextView
    private lateinit var instructionText: TextView
    private lateinit var captureButton: Button
    private lateinit var backButton: Button
    private lateinit var faceCountText: TextView
    private lateinit var progressBar: ProgressBar
    
    private lateinit var faceRecognitionManager: FaceRecognitionManager
    private var currentMode: String = MODE_CAPTURE
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 获取模式
        currentMode = intent.getStringExtra(EXTRA_MODE) ?: MODE_CAPTURE
        
        createUI()
        
        // 初始化人脸识别管理器
        faceRecognitionManager = FaceRecognitionManager(this)
        
        // 检查相机权限
        if (checkCameraPermission()) {
            startCamera()
        } else {
            requestCameraPermission()
        }
    }
    
    private fun createUI() {
        // 创建主布局
        val mainLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(Color.BLACK)
        }
        
        // 标题栏
        val titleLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(20, 40, 20, 20)
            setBackgroundColor(Color.parseColor("#2196F3"))
        }
        
        backButton = Button(this).apply {
            text = "← 返回"
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.TRANSPARENT)
            setOnClickListener { finish() }
        }
        titleLayout.addView(backButton)
        
        val titleText = TextView(this).apply {
            text = if (currentMode == MODE_CAPTURE) "📷 人脸采集" else "🔍 人脸识别"
            textSize = 18f
            setTextColor(Color.WHITE)
            setPadding(20, 0, 0, 0)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
        }
        titleLayout.addView(titleText)
        
        mainLayout.addView(titleLayout)
        
        // 相机预览
        previewView = PreviewView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT,
                0,
                1f
            )
        }
        mainLayout.addView(previewView)
        
        // 状态信息区域
        val statusLayout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(20, 20, 20, 20)
            setBackgroundColor(Color.parseColor("#1E1E1E"))
        }
        
        // 人脸检测状态
        faceCountText = TextView(this).apply {
            text = "👤 检测人脸: 0"
            textSize = 16f
            setTextColor(Color.WHITE)
            setPadding(0, 0, 0, 10)
        }
        statusLayout.addView(faceCountText)
        
        // 状态文本
        statusText = TextView(this).apply {
            text = "准备就绪"
            textSize = 14f
            setTextColor(Color.parseColor("#4CAF50"))
            setPadding(0, 0, 0, 10)
        }
        statusLayout.addView(statusText)
        
        // 指导文本
        instructionText = TextView(this).apply {
            text = if (currentMode == MODE_CAPTURE) {
                "请将面部对准相机，确保光线充足\n检测到人脸后点击采集按钮"
            } else {
                "请将面部对准相机进行识别\n确保与采集时姿势相似"
            }
            textSize = 12f
            setTextColor(Color.parseColor("#CCCCCC"))
            setPadding(0, 0, 0, 15)
        }
        statusLayout.addView(instructionText)
        
        // 进度条
        progressBar = ProgressBar(this).apply {
            visibility = ProgressBar.GONE
        }
        statusLayout.addView(progressBar)
        
        // 操作按钮
        val buttonLayout = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            setPadding(0, 15, 0, 0)
        }
        
        captureButton = Button(this).apply {
            text = if (currentMode == MODE_CAPTURE) "📷 采集人脸" else "🔍 开始识别"
            textSize = 16f
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#4CAF50"))
            setPadding(30, 20, 30, 20)
            layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
            setOnClickListener {
                if (currentMode == MODE_CAPTURE) {
                    captureFace()
                } else {
                    verifyFace()
                }
            }
        }
        buttonLayout.addView(captureButton)
        
        statusLayout.addView(buttonLayout)
        mainLayout.addView(statusLayout)
        
        setContentView(mainLayout)
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
    
    private fun startCamera() {
        try {
            faceRecognitionManager.startCameraPreview(previewView, this, this)
            statusText.text = "相机已启动"
            statusText.setTextColor(Color.parseColor("#4CAF50"))
        } catch (e: Exception) {
            statusText.text = "相机启动失败: ${e.message}"
            statusText.setTextColor(Color.parseColor("#F44336"))
        }
    }
    
    private fun captureFace() {
        progressBar.visibility = ProgressBar.VISIBLE
        captureButton.isEnabled = false
        statusText.text = "正在采集人脸..."
        statusText.setTextColor(Color.parseColor("#FF9800"))
        
        faceRecognitionManager.captureFace(this)
    }
    
    private fun verifyFace() {
        progressBar.visibility = ProgressBar.VISIBLE
        captureButton.isEnabled = false
        statusText.text = "正在识别人脸..."
        statusText.setTextColor(Color.parseColor("#FF9800"))
        
        faceRecognitionManager.verifyFace(this)
    }
    
    // FaceRecognitionCallback 实现
    override fun onFaceDetected(faceCount: Int) {
        runOnUiThread {
            faceCountText.text = "👤 检测人脸: $faceCount"
            
            if (faceCount == 0) {
                faceCountText.setTextColor(Color.parseColor("#F44336"))
                captureButton.isEnabled = false
            } else if (faceCount == 1) {
                faceCountText.setTextColor(Color.parseColor("#4CAF50"))
                captureButton.isEnabled = true
            } else {
                faceCountText.setTextColor(Color.parseColor("#FF9800"))
                captureButton.isEnabled = false
            }
        }
    }
    
    override fun onFaceCaptured(success: Boolean, message: String) {
        runOnUiThread {
            progressBar.visibility = ProgressBar.GONE
            captureButton.isEnabled = true
            
            if (success) {
                statusText.text = "✅ $message"
                statusText.setTextColor(Color.parseColor("#4CAF50"))
                
                // 显示成功对话框
                AlertDialog.Builder(this)
                    .setTitle("采集成功")
                    .setMessage("人脸采集完成！现在可以使用人脸识别登录了。")
                    .setPositiveButton("确定") { _, _ ->
                        setResult(RESULT_OK)
                        finish()
                    }
                    .setCancelable(false)
                    .show()
            } else {
                statusText.text = "❌ $message"
                statusText.setTextColor(Color.parseColor("#F44336"))
            }
        }
    }
    
    override fun onFaceRecognized(success: Boolean, confidence: Float, message: String) {
        runOnUiThread {
            progressBar.visibility = ProgressBar.GONE
            captureButton.isEnabled = true
            
            if (success) {
                statusText.text = "✅ $message"
                statusText.setTextColor(Color.parseColor("#4CAF50"))
                
                // 显示成功对话框
                AlertDialog.Builder(this)
                    .setTitle("识别成功")
                    .setMessage("人脸识别成功！\n相似度: ${(confidence * 100).toInt()}%")
                    .setPositiveButton("确定") { _, _ ->
                        setResult(RESULT_OK)
                        finish()
                    }
                    .setCancelable(false)
                    .show()
            } else {
                statusText.text = "❌ $message"
                statusText.setTextColor(Color.parseColor("#F44336"))
                
                // 显示失败对话框
                AlertDialog.Builder(this)
                    .setTitle("识别失败")
                    .setMessage(message)
                    .setPositiveButton("重试") { _, _ -> }
                    .setNegativeButton("返回") { _, _ -> finish() }
                    .show()
            }
        }
    }
    
    override fun onError(error: String) {
        runOnUiThread {
            progressBar.visibility = ProgressBar.GONE
            captureButton.isEnabled = true
            statusText.text = "❌ $error"
            statusText.setTextColor(Color.parseColor("#F44336"))
            
            Toast.makeText(this, error, Toast.LENGTH_LONG).show()
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
                startCamera()
            } else {
                AlertDialog.Builder(this)
                    .setTitle("权限需要")
                    .setMessage("人脸识别功能需要相机权限，请在设置中授权。")
                    .setPositiveButton("确定") { _, _ -> finish() }
                    .setCancelable(false)
                    .show()
            }
        }
    }
    
    override fun onDestroy() {
        super.onDestroy()
        faceRecognitionManager.release()
    }
}
