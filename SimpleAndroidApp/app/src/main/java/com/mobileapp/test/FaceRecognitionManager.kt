package com.mobileapp.test

import android.content.Context
import android.content.SharedPreferences
import android.graphics.*
import android.util.Base64
import android.util.Log
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleOwner
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.face.*
import java.io.ByteArrayOutputStream
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * 人脸识别管理器
 * 提供人脸采集、存储和识别功能
 */
class FaceRecognitionManager(private val context: Context) {
    
    companion object {
        private const val TAG = "FaceRecognitionManager"
        private const val PREFS_NAME = "FaceRecognitionPrefs"
        private const val KEY_FACE_DATA = "face_data"
        private const val KEY_FACE_FEATURES = "face_features"
        private const val SIMILARITY_THRESHOLD = 0.8f
    }
    
    private val sharedPreferences: SharedPreferences = 
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    
    private val cameraExecutor: ExecutorService = Executors.newSingleThreadExecutor()
    
    // ML Kit人脸检测器
    private val faceDetector: FaceDetector by lazy {
        val options = FaceDetectorOptions.Builder()
            .setPerformanceMode(FaceDetectorOptions.PERFORMANCE_MODE_ACCURATE)
            .setLandmarkMode(FaceDetectorOptions.LANDMARK_MODE_ALL)
            .setClassificationMode(FaceDetectorOptions.CLASSIFICATION_MODE_ALL)
            .setMinFaceSize(0.15f)
            .enableTracking()
            .build()
        FaceDetection.getClient(options)
    }
    
    private var imageCapture: ImageCapture? = null
    private var isCapturing = false
    
    interface FaceRecognitionCallback {
        fun onFaceDetected(faceCount: Int)
        fun onFaceCaptured(success: Boolean, message: String)
        fun onFaceRecognized(success: Boolean, confidence: Float, message: String)
        fun onError(error: String)
    }
    
    /**
     * 初始化相机预览
     */
    fun startCameraPreview(
        previewView: PreviewView,
        lifecycleOwner: LifecycleOwner,
        callback: FaceRecognitionCallback
    ) {
        val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
        
        cameraProviderFuture.addListener({
            try {
                val cameraProvider = cameraProviderFuture.get()
                
                // 预览用例
                val preview = Preview.Builder().build()
                preview.setSurfaceProvider(previewView.surfaceProvider)
                
                // 图像捕获用例
                imageCapture = ImageCapture.Builder()
                    .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                    .build()
                
                // 图像分析用例（用于实时人脸检测）
                val imageAnalyzer = ImageAnalysis.Builder()
                    .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                    .build()
                
                imageAnalyzer.setAnalyzer(cameraExecutor) { imageProxy ->
                    detectFacesInImage(imageProxy, callback)
                }
                
                // 选择后置摄像头
                val cameraSelector = CameraSelector.DEFAULT_FRONT_CAMERA
                
                // 绑定用例到相机
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    lifecycleOwner,
                    cameraSelector,
                    preview,
                    imageCapture,
                    imageAnalyzer
                )
                
            } catch (e: Exception) {
                Log.e(TAG, "相机启动失败", e)
                callback.onError("相机启动失败: ${e.message}")
            }
        }, ContextCompat.getMainExecutor(context))
    }
    
    /**
     * 在图像中检测人脸
     */
    private fun detectFacesInImage(imageProxy: ImageProxy, callback: FaceRecognitionCallback) {
        val mediaImage = imageProxy.image
        if (mediaImage != null) {
            val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
            
            faceDetector.process(image)
                .addOnSuccessListener { faces ->
                    callback.onFaceDetected(faces.size)
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "人脸检测失败", e)
                }
                .addOnCompleteListener {
                    imageProxy.close()
                }
        } else {
            imageProxy.close()
        }
    }
    
    /**
     * 采集人脸数据
     */
    fun captureFace(callback: FaceRecognitionCallback) {
        if (isCapturing) {
            callback.onError("正在采集中，请稍候...")
            return
        }
        
        val imageCapture = this.imageCapture ?: run {
            callback.onError("相机未初始化")
            return
        }
        
        isCapturing = true
        
        // 创建输出选项
        val outputFileOptions = ImageCapture.OutputFileOptions.Builder(
            context.cacheDir.resolve("face_capture_${System.currentTimeMillis()}.jpg")
        ).build()
        
        imageCapture.takePicture(
            outputFileOptions,
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    // 处理捕获的图像
                    output.savedUri?.let { uri ->
                        processCapturedImage(uri.path!!, callback)
                    } ?: run {
                        isCapturing = false
                        callback.onFaceCaptured(false, "图像保存失败")
                    }
                }
                
                override fun onError(exception: ImageCaptureException) {
                    isCapturing = false
                    Log.e(TAG, "图像捕获失败", exception)
                    callback.onFaceCaptured(false, "图像捕获失败: ${exception.message}")
                }
            }
        )
    }
    
    /**
     * 处理捕获的图像，提取人脸特征
     */
    private fun processCapturedImage(imagePath: String, callback: FaceRecognitionCallback) {
        try {
            val bitmap = BitmapFactory.decodeFile(imagePath)
            val image = InputImage.fromBitmap(bitmap, 0)
            
            faceDetector.process(image)
                .addOnSuccessListener { faces ->
                    if (faces.isEmpty()) {
                        isCapturing = false
                        callback.onFaceCaptured(false, "未检测到人脸，请重新拍摄")
                        return@addOnSuccessListener
                    }
                    
                    if (faces.size > 1) {
                        isCapturing = false
                        callback.onFaceCaptured(false, "检测到多张人脸，请确保只有一张人脸")
                        return@addOnSuccessListener
                    }
                    
                    // 提取人脸特征并保存
                    val face = faces[0]
                    val faceFeatures = extractFaceFeatures(face, bitmap)
                    saveFaceData(bitmap, faceFeatures)
                    
                    isCapturing = false
                    callback.onFaceCaptured(true, "人脸采集成功！")
                }
                .addOnFailureListener { e ->
                    isCapturing = false
                    Log.e(TAG, "人脸处理失败", e)
                    callback.onFaceCaptured(false, "人脸处理失败: ${e.message}")
                }
        } catch (e: Exception) {
            isCapturing = false
            Log.e(TAG, "图像处理失败", e)
            callback.onFaceCaptured(false, "图像处理失败: ${e.message}")
        }
    }
    
    /**
     * 提取人脸特征
     */
    private fun extractFaceFeatures(face: Face, bitmap: Bitmap): FloatArray {
        val features = mutableListOf<Float>()
        
        // 添加边界框特征
        val bounds = face.boundingBox
        features.add(bounds.width().toFloat() / bitmap.width)
        features.add(bounds.height().toFloat() / bitmap.height)
        features.add(bounds.centerX().toFloat() / bitmap.width)
        features.add(bounds.centerY().toFloat() / bitmap.height)
        
        // 添加关键点特征
        face.allLandmarks.forEach { landmark ->
            features.add(landmark.position.x / bitmap.width)
            features.add(landmark.position.y / bitmap.height)
        }
        
        // 添加分类特征
        features.add(face.smilingProbability ?: 0f)
        features.add(face.leftEyeOpenProbability ?: 0f)
        features.add(face.rightEyeOpenProbability ?: 0f)
        
        // 添加旋转角度
        features.add(face.headEulerAngleX)
        features.add(face.headEulerAngleY)
        features.add(face.headEulerAngleZ)
        
        return features.toFloatArray()
    }
    
    /**
     * 保存人脸数据
     */
    private fun saveFaceData(bitmap: Bitmap, features: FloatArray) {
        try {
            // 保存人脸图像
            val outputStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.JPEG, 90, outputStream)
            val imageData = Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT)
            
            // 保存人脸特征
            val featuresString = features.joinToString(",")
            
            sharedPreferences.edit()
                .putString(KEY_FACE_DATA, imageData)
                .putString(KEY_FACE_FEATURES, featuresString)
                .apply()
                
            Log.d(TAG, "人脸数据保存成功")
        } catch (e: Exception) {
            Log.e(TAG, "人脸数据保存失败", e)
        }
    }

    /**
     * 验证人脸
     */
    fun verifyFace(callback: FaceRecognitionCallback) {
        if (!hasFaceData()) {
            callback.onFaceRecognized(false, 0f, "未找到已保存的人脸数据，请先采集人脸")
            return
        }

        if (isCapturing) {
            callback.onError("正在处理中，请稍候...")
            return
        }

        val imageCapture = this.imageCapture ?: run {
            callback.onError("相机未初始化")
            return
        }

        isCapturing = true

        // 创建输出选项
        val outputFileOptions = ImageCapture.OutputFileOptions.Builder(
            context.cacheDir.resolve("face_verify_${System.currentTimeMillis()}.jpg")
        ).build()

        imageCapture.takePicture(
            outputFileOptions,
            ContextCompat.getMainExecutor(context),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                    output.savedUri?.let { uri ->
                        processVerificationImage(uri.path!!, callback)
                    } ?: run {
                        isCapturing = false
                        callback.onFaceRecognized(false, 0f, "图像保存失败")
                    }
                }

                override fun onError(exception: ImageCaptureException) {
                    isCapturing = false
                    Log.e(TAG, "图像捕获失败", exception)
                    callback.onFaceRecognized(false, 0f, "图像捕获失败: ${exception.message}")
                }
            }
        )
    }

    /**
     * 处理验证图像
     */
    private fun processVerificationImage(imagePath: String, callback: FaceRecognitionCallback) {
        try {
            val bitmap = BitmapFactory.decodeFile(imagePath)
            val image = InputImage.fromBitmap(bitmap, 0)

            faceDetector.process(image)
                .addOnSuccessListener { faces ->
                    if (faces.isEmpty()) {
                        isCapturing = false
                        callback.onFaceRecognized(false, 0f, "未检测到人脸")
                        return@addOnSuccessListener
                    }

                    if (faces.size > 1) {
                        isCapturing = false
                        callback.onFaceRecognized(false, 0f, "检测到多张人脸")
                        return@addOnSuccessListener
                    }

                    // 提取当前人脸特征并与保存的特征比较
                    val face = faces[0]
                    val currentFeatures = extractFaceFeatures(face, bitmap)
                    val savedFeatures = getSavedFaceFeatures()

                    if (savedFeatures != null) {
                        val similarity = calculateSimilarity(currentFeatures, savedFeatures)
                        val isMatch = similarity >= SIMILARITY_THRESHOLD

                        isCapturing = false
                        if (isMatch) {
                            callback.onFaceRecognized(true, similarity, "人脸识别成功！相似度: ${(similarity * 100).toInt()}%")
                        } else {
                            callback.onFaceRecognized(false, similarity, "人脸识别失败，相似度过低: ${(similarity * 100).toInt()}%")
                        }
                    } else {
                        isCapturing = false
                        callback.onFaceRecognized(false, 0f, "无法加载已保存的人脸特征")
                    }
                }
                .addOnFailureListener { e ->
                    isCapturing = false
                    Log.e(TAG, "人脸验证失败", e)
                    callback.onFaceRecognized(false, 0f, "人脸验证失败: ${e.message}")
                }
        } catch (e: Exception) {
            isCapturing = false
            Log.e(TAG, "验证图像处理失败", e)
            callback.onFaceRecognized(false, 0f, "验证图像处理失败: ${e.message}")
        }
    }

    /**
     * 计算特征相似度
     */
    private fun calculateSimilarity(features1: FloatArray, features2: FloatArray): Float {
        if (features1.size != features2.size) {
            return 0f
        }

        // 使用余弦相似度
        var dotProduct = 0f
        var norm1 = 0f
        var norm2 = 0f

        for (i in features1.indices) {
            dotProduct += features1[i] * features2[i]
            norm1 += features1[i] * features1[i]
            norm2 += features2[i] * features2[i]
        }

        val denominator = sqrt(norm1) * sqrt(norm2)
        return if (denominator != 0f) {
            dotProduct / denominator
        } else {
            0f
        }
    }

    /**
     * 获取保存的人脸特征
     */
    private fun getSavedFaceFeatures(): FloatArray? {
        return try {
            val featuresString = sharedPreferences.getString(KEY_FACE_FEATURES, null)
            featuresString?.split(",")?.map { it.toFloat() }?.toFloatArray()
        } catch (e: Exception) {
            Log.e(TAG, "加载人脸特征失败", e)
            null
        }
    }

    /**
     * 检查是否有保存的人脸数据
     */
    fun hasFaceData(): Boolean {
        return sharedPreferences.contains(KEY_FACE_DATA) &&
               sharedPreferences.contains(KEY_FACE_FEATURES)
    }

    /**
     * 删除保存的人脸数据
     */
    fun clearFaceData() {
        sharedPreferences.edit()
            .remove(KEY_FACE_DATA)
            .remove(KEY_FACE_FEATURES)
            .apply()
        Log.d(TAG, "人脸数据已清除")
    }

    /**
     * 获取保存的人脸图像
     */
    fun getSavedFaceImage(): Bitmap? {
        return try {
            val imageData = sharedPreferences.getString(KEY_FACE_DATA, null)
            if (imageData != null) {
                val decodedBytes = Base64.decode(imageData, Base64.DEFAULT)
                BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)
            } else {
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "加载人脸图像失败", e)
            null
        }
    }

    /**
     * 释放资源
     */
    fun release() {
        cameraExecutor.shutdown()
        faceDetector.close()
    }
}
