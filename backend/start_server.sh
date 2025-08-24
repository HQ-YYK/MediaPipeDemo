#!/bin/bash

echo "🚀 MediaPipe Pose Detection - 启动生产级服务器"
echo "================================================"

# 检查虚拟环境是否存在
if [ ! -f ".venv/bin/activate" ]; then
    echo "❌ 虚拟环境不存在，请先创建虚拟环境"
    echo "运行: python -m venv .venv"
    exit 1
fi

# 激活虚拟环境
echo "🔧 激活虚拟环境..."
source .venv/bin/activate

# 检查依赖是否安装
echo "📦 检查依赖..."
python -c "import waitress" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "❌ Waitress未安装，正在安装..."
    pip install waitress
fi

# 启动生产级服务器
echo "🚀 启动生产级服务器..."
python run_production.py
