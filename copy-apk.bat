@echo off
echo 复制新的APK文件...
copy "MobileAppUnified\android\app\build\outputs\apk\release\app-release.apk" "apk\MobileAppUnified-v1.6-BiometricFixed-RELEASE.apk"
if %ERRORLEVEL% EQU 0 (
    echo APK复制成功！
) else (
    echo APK复制失败！
)
pause
