#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MediaPipe Pose Detection - Production Server
使用Waitress WSGI服务器启动生产级服务
"""

import os
import sys
from waitress import serve
from app import app

def main():
    """主函数：启动生产级WSGI服务器"""
    
    # 配置参数
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    THREADS = int(os.getenv('THREADS', 4))
    
    print("🚀 MediaPipe Pose Detection - Production Server")
    print("=" * 50)
    print(f"📍 服务器地址: http://{HOST}:{PORT}")
    print(f"🔧 WSGI服务器: Waitress")
    print(f"🧵 工作线程: {THREADS}")
    print(f"🌐 访问地址: http://localhost:{PORT}")
    print("=" * 50)
    print("✅ 服务已启动，按 Ctrl+C 停止")
    
    try:
        # 启动Waitress服务器
        serve(
            app,
            host=HOST,
            port=PORT,
            threads=THREADS,
            url_scheme='http',
            ident='MediaPipe-Pose-Server'
        )
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
        sys.exit(0)
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
