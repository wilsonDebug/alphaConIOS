@echo off
chcp 65001 >nul
title 定时开关机软件

echo.
echo ========================================
echo    🕐 定时开关机软件 v1.0
echo ========================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到Python环境
    echo.
    echo 请先安装Python 3.6或更高版本:
    echo https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python环境检测成功
echo.

REM 检查tkinter模块
python -c "import tkinter" >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: tkinter模块未安装
    echo.
    echo 请重新安装Python并确保包含tkinter模块
    echo.
    pause
    exit /b 1
)

echo ✅ tkinter模块检测成功
echo.

REM 启动应用程序
echo 🚀 正在启动定时开关机软件...
echo.

python TimerShutdownApp.py

if %errorlevel% neq 0 (
    echo.
    echo ❌ 程序运行出错
    echo.
    pause
)
