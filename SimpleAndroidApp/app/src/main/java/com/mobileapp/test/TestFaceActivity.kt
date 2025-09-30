package com.mobileapp.test

import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import android.graphics.Color

/**
 * 简单的测试Activity来验证人脸识别功能是否能正常启动
 */
class TestFaceActivity : AppCompatActivity() {
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // 创建简单的测试界面
        val layout = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(50, 50, 50, 50)
            setBackgroundColor(Color.WHITE)
        }
        
        val titleText = TextView(this).apply {
            text = "🎯 人脸识别测试界面"
            textSize = 20f
            setTextColor(Color.BLACK)
            setPadding(0, 0, 0, 30)
        }
        layout.addView(titleText)
        
        val statusText = TextView(this).apply {
            text = "✅ 人脸识别Activity启动成功！"
            textSize = 16f
            setTextColor(Color.parseColor("#4CAF50"))
            setPadding(0, 0, 0, 30)
        }
        layout.addView(statusText)
        
        val modeText = TextView(this).apply {
            val mode = intent.getStringExtra("mode") ?: "未知模式"
            text = "📋 当前模式: $mode"
            textSize = 14f
            setTextColor(Color.parseColor("#2196F3"))
            setPadding(0, 0, 0, 30)
        }
        layout.addView(modeText)
        
        val backButton = Button(this).apply {
            text = "← 返回"
            textSize = 16f
            setBackgroundColor(Color.parseColor("#FF9800"))
            setTextColor(Color.WHITE)
            setPadding(30, 20, 30, 20)
            setOnClickListener {
                setResult(RESULT_OK)
                finish()
            }
        }
        layout.addView(backButton)
        
        setContentView(layout)
        
        // 记录日志
        println("TestFaceActivity: onCreate called with mode = ${intent.getStringExtra("mode")}")
    }
    
    override fun onDestroy() {
        super.onDestroy()
        println("TestFaceActivity: onDestroy called")
    }
}
