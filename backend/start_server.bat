@echo off
chcp 65001 >nul
echo 🚀 MediaPipe Pose Detection - 启动生产级服务器
echo ================================================

REM 检查虚拟环境是否存在
if not exist ".venv\Scripts\activate.bat" (
    echo ❌ 虚拟环境不存在，请先创建虚拟环境
    echo 运行: python -m venv .venv
    pause
    exit /b 1
)

REM 激活虚拟环境
echo 🔧 激活虚拟环境...
call .venv\Scripts\activate.bat

REM 检查依赖是否安装
echo 📦 检查依赖...
python -c "import waitress" 2>nul
if errorlevel 1 (
    echo ❌ Waitress未安装，正在安装...
    pip install waitress
)

REM 启动生产级服务器
echo 🚀 启动生产级服务器...
python run_production.py

pause
