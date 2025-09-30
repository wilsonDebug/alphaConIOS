@echo off
chcp 65001 >nul
title 构建可执行文件

echo.
echo ========================================
echo    🔨 构建定时开关机软件可执行文件
echo ========================================
echo.

REM 检查Python环境
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到Python环境
    echo.
    pause
    exit /b 1
)

echo ✅ Python环境检测成功
echo.

REM 检查pyinstaller
python -c "import PyInstaller" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ PyInstaller未安装，正在安装...
    echo.
    pip install pyinstaller
    if %errorlevel% neq 0 (
        echo ❌ PyInstaller安装失败
        echo.
        pause
        exit /b 1
    )
    echo ✅ PyInstaller安装成功
    echo.
)

REM 清理之前的构建
if exist "dist" (
    echo 🧹 清理之前的构建文件...
    rmdir /s /q dist
)
if exist "build" (
    rmdir /s /q build
)
if exist "*.spec" (
    del *.spec
)

echo.
echo 🔨 开始构建可执行文件...
echo.

REM 构建可执行文件
python -m PyInstaller ^
    --onefile ^
    --windowed ^
    --name "定时开关机软件" ^
    --icon=icon.ico ^
    --add-data "timer_config.json;." ^
    TimerShutdownApp.py

if %errorlevel% neq 0 (
    echo ❌ 构建失败
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 构建成功！
echo.
echo 📁 可执行文件位置: dist\定时开关机软件.exe
echo.

REM 复制必要文件到dist目录
if exist "dist\定时开关机软件.exe" (
    copy README.md dist\ >nul
    echo ✅ 已复制说明文件到dist目录
)

echo.
echo 🎉 构建完成！可以在dist目录中找到可执行文件。
echo.
pause
