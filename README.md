# MediaPipe 2.0+ 人体姿态识别 Demo

一个基于 MediaPipe 2.0+ Tasks Vision API 和 React 的实时人体姿态识别项目，通过摄像头捕获视频，识别33个人体关节点，并在3D界面中实时显示骨骼结构。

## 🚀 技术架构

- **后端**: Python Flask + MediaPipe 2.0+ + Waitress WSGI
- **前端**: React + Three.js + MediaPipe Tasks Vision
- **AI模型**: MediaPipe Pose Landmarker (最新版本)
- **通信**: HTTP API
- **服务器**: 生产级Waitress WSGI服务器

## ✨ 功能特性

- 🎥 实时摄像头捕获
- 🤖 AI姿态识别（33个关节点）- 使用最新 MediaPipe 2.0+ API
- 🎨 3D骨骼可视化
- ⚡ 实时数据更新
- 📱 响应式设计
- 🚀 生产级性能
- 🔄 支持 MediaPipe Tasks Vision 最新特性

## 📋 环境要求

- **Python**: 3.8+ (推荐3.8-3.11，3.12+需要特殊处理)
- **Node.js**: 20.17.0+ (推荐22.x LTS)
- **MediaPipe**: 2.0+ (最新版本)
- **摄像头**: 支持WebRTC的摄像头

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd MediaPipeDemo
```

### 2. 设置后端环境

#### 方法1：使用虚拟环境（推荐）
```bash
cd backend

# 创建虚拟环境
python -m venv .venv

# 激活虚拟环境
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

# 安装依赖 (MediaPipe 2.0+)
pip install -r requirements.txt
```

#### 方法2：使用全局Python（不推荐）
```bash
cd backend
pip install -r requirements.txt
```

### 3. 启动后端服务

#### 使用生产级服务器（推荐）
```bash
cd backend

# 激活虚拟环境
.venv\Scripts\activate  # Windows
# 或
source .venv/bin/activate  # Linux/Mac

# 启动生产级服务器
python run_production.py
```

#### 使用开发服务器
```bash
cd backend

# 激活虚拟环境
.venv\Scripts\activate  # Windows
# 或
source .venv/bin/activate  # Linux/Mac

# 启动Flask开发服务器
python app.py
```

#### 使用一键启动脚本
```bash
cd backend

# Windows
start_server.bat

# Linux/Mac
./start_server.sh
```

**后端将在 http://localhost:5000 启动**

### 4. 启动前端应用
```bash
cd frontend

# 安装依赖 (包含 MediaPipe Tasks Vision)
pnpm install

# 启动开发服务器
pnpm dev
```

**前端将在 http://localhost:5173 启动**

## 🔧 升级说明

### 从 MediaPipe 1.x 升级到 2.0+

本项目已从 MediaPipe 1.x 升级到最新的 MediaPipe 2.0+ Tasks Vision API：

#### 主要变化
- ✅ 使用 `@mediapipe/tasks-vision` 替代旧的 MediaPipe 包
- ✅ 使用 `PoseLandmarker` 替代旧的 `Pose` 类
- ✅ 使用 `FilesetResolver` 进行模型加载
- ✅ 支持 GPU 加速和更高效的推理
- ✅ 更好的错误处理和类型安全

#### 兼容性
- 🔄 保持相同的 33 个姿态关节点
- 🔄 保持相同的连接线定义
- 🔄 保持相同的 API 接口
- 🆕 新增健康检查端点 `/health`

## 📊 服务器类型对比

### 生产级服务器 (Waitress)
- ✅ **无警告信息**
- ✅ **高性能多线程**
- ✅ **生产环境稳定**
- ✅ **支持高并发**
- 🚀 **推荐用于生产环境**

### 开发服务器 (Flask内置)
- ⚠️ **有开发警告**
- ⚠️ **单线程性能**
- ⚠️ **仅适合开发**
- 🔧 **适合调试和开发**

## 🛠️ 开发环境管理

### 激活开发环境
```bash
cd backend

# Windows
.venv\Scripts\activate

# Linux/Mac
source .venv/bin/activate
```

这会激活虚拟环境并进入一个配置好的shell，您可以：
- 运行 `python run_production.py` 启动生产级服务
- 运行 `python app.py` 启动开发服务
- 使用 `pip install package` 安装新包
- 使用 `pip list` 查看已安装的包

### 管理依赖
```bash
cd backend

# 激活虚拟环境
.venv\Scripts\activate  # Windows
# 或
source .venv/bin/activate  # Linux/Mac

# 安装新包
pip install package_name

# 更新依赖
pip install -r requirements.txt --upgrade

# 查看已安装的包
pip list
```

## 🔍 API 端点

### 基础端点
- `GET /` - API 信息
- `GET /health` - 健康检查

### 核心功能
- `POST /detect_pose` - 姿态识别

#### 姿态识别请求格式
```json
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
}
```

#### 姿态识别响应格式
```json
{
  "success": true,
  "landmarks": [
    {
      "id": 0,
      "x": 0.5,
      "y": 0.3,
      "z": 0.1,
      "visibility": 0.9
    }
  ],
  "connections": [[0, 1], [1, 2]],
  "message": "姿态识别成功"
}
```

## 🐛 故障排除

### 常见问题

#### 1. MediaPipe 安装失败
```bash
# 确保使用正确的 Python 版本
python --version

# 升级 pip
pip install --upgrade pip

# 清理缓存后重试
pip cache purge
pip install -r requirements.txt
```

#### 2. 前端依赖安装失败
```bash
# 清理 pnpm 缓存
pnpm store prune

# 删除 node_modules 后重试
rm -rf node_modules
pnpm install
```

#### 3. 相机权限问题
- 确保浏览器允许相机访问
- 检查 HTTPS 环境（某些浏览器要求）
- 尝试刷新页面重新授权

## 📝 更新日志

### v2.0.0 (最新)
- 🚀 升级到 MediaPipe 2.0+ Tasks Vision API
- ✨ 使用最新的 PoseLandmarker 模型
- 🔧 改进的错误处理和类型安全
- 📊 新增健康检查端点
- 🎯 更好的性能和 GPU 支持

### v1.0.0
- 🎉 初始版本发布
- 📱 基础姿态识别功能
- 🎨 3D 可视化界面

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## �� 许可证

MIT License
