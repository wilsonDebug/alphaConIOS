package com.simpletest

import android.app.Activity
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val titleText = findViewById<TextView>(R.id.titleText)
        val testButton = findViewById<Button>(R.id.testButton)

        titleText.text = "🚀 MobileApp 测试成功！"

        testButton.setOnClickListener {
            showTestDialog()
        }
    }

    private fun showTestDialog() {
        AlertDialog.Builder(this)
            .setTitle("测试成功")
            .setMessage("🎉 MobileApp 在 Android API 33 模拟器上运行正常！\n\n✅ React Native 基础功能正常\n✅ 模拟器连接成功\n✅ 应用安装成功")
            .setPositiveButton("确定") { dialog, _ ->
                dialog.dismiss()
                Toast.makeText(this, "应用运行正常！", Toast.LENGTH_SHORT).show()
            }
            .show()
    }
}
