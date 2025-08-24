# -*- coding: utf-8 -*-
# 文件其余内容...


from flask import Flask, request, jsonify
from flask_cors import CORS
import mediapipe as mp
import cv2
import numpy as np
from PIL import Image
import io
import base64
import json

app = Flask(__name__)
CORS(app)

# 初始化MediaPipe 2.0+ Tasks
mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# 创建姿态识别器 - 使用新的配置选项
pose = mp_pose.Pose(
    static_image_mode=False,
    model_complexity=1,  # 0=Lite, 1=Full, 2=Heavy
    smooth_landmarks=True,
    enable_segmentation=False,
    smooth_segmentation=True,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# MediaPipe姿态连接线定义 - 保持兼容
POSE_CONNECTIONS = [
    # 面部连接
    [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10], [11, 12],
    
    # 身体主干
    [11, 12], [11, 23], [12, 24], [23, 24],
    
    # 左臂
    [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
    
    # 右臂  
    [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
    
    # 左腿
    [23, 25], [25, 27], [27, 29], [29, 31],
    
    # 右腿
    [24, 26], [26, 28], [28, 30], [30, 32],
    
    # 手部连接
    [19, 20], [21, 22],
    
    # 脚部连接
    [31, 32]
]

@app.route('/')
def home():
    return jsonify({
        "message": "MediaPipe 2.0+ Pose Recognition API",
        "status": "running",
        "version": "2.0+"
    })

@app.route('/detect_pose', methods=['POST'])
def detect_pose():
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({"error": "No image data"}), 400
        
        image_data = data['image'].split(',')[1] if ',' in data['image'] else data['image']
        image_bytes = base64.b64decode(image_data)
        
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return jsonify({"error": "Invalid image"}), 400
        
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = pose.process(image_rgb)
        
        if results.pose_landmarks:
            landmarks = []
            for i, landmark in enumerate(results.pose_landmarks.landmark):
                landmarks.append({
                    "id": i,
                    "x": float(landmark.x),
                    "y": float(landmark.y),
                    "z": float(landmark.z),
                    "visibility": float(landmark.visibility)
                })
            
            return jsonify({
                "success": True,
                "landmarks": landmarks,
                "connections": POSE_CONNECTIONS,
                "message": "姿态识别成功"
            })
        else:
            return jsonify({
                "success": False,
                "landmarks": [],
                "connections": POSE_CONNECTIONS,
                "message": "未检测到姿态"
            })
            
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "姿态识别失败"
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "mediapipe_version": mp.__version__,
        "api_version": "2.0+"
    })

if __name__ == '__main__':
    print("🚀 MediaPipe 2.0+ 姿态识别 API 启动中...")
    print(f"📦 MediaPipe 版本: {mp.__version__}")
    print("🌐 服务地址: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
