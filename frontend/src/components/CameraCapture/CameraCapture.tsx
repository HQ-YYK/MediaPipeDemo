import React, { useEffect, useRef, useState } from 'react';
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { PoseData } from '../../types';
import './CameraCapture.css';

interface CameraCaptureProps {
  onPoseDetection: (poseData: PoseData) => void;
  onReady?: () => void;
  onStarted?: () => void;
  onStopped?: () => void;
}

// 全局模型预加载
let preloadedPoseLandmarker: PoseLandmarker | null = null;
let isPreloading = false;

const preloadModel = async () => {
  if (preloadedPoseLandmarker || isPreloading) return;
  
  isPreloading = true;
  try {
    console.log('预加载 MediaPipe 模型...');
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm"
    );
    
    preloadedPoseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numPoses: 1
    });
    
    console.log('MediaPipe 模型预加载完成 (仅姿态)');
  } catch (err) {
    console.error('模型预加载失败:', err);
  } finally {
    isPreloading = false;
  }
};

// 立即开始预加载
preloadModel();

const CameraCapture: React.FC<CameraCaptureProps> = ({ onPoseDetection, onReady, onStarted, onStopped }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastDetectTimeRef = useRef<number>(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('准备中...');

  // 姿态连接点定义 - MediaPipe 2.0 使用相同的连接点
  const POSE_CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8],
    [9, 10], [11, 12], [11, 13], [13, 15], [12, 14], [14, 16],
    [15, 17], [15, 19], [15, 21], [17, 19], [16, 18], [16, 20], [18, 20],
    [23, 24], [23, 25], [25, 27], [27, 29], [27, 31], [24, 26], [26, 28], [28, 30], [28, 32]
  ];

  // 快速初始化 - 使用预加载的模型
  const initMediaPipe = async () => {
    try {
      setLoadingStatus('正在启动相机...');
      
      // 并行启动相机和获取预加载的模型
      const [poseLandmarker, stream] = await Promise.all([
        // 获取预加载的模型或等待预加载完成
        (async () => {
          if (preloadedPoseLandmarker) {
            setLoadingStatus('模型已就绪，正在启动相机...');
            return preloadedPoseLandmarker;
          }
          
          setLoadingStatus('正在加载 MediaPipe 模型...');
          // 等待预加载完成
          while (isPreloading) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          if (preloadedPoseLandmarker) {
            return preloadedPoseLandmarker;
          }
          
          // 如果预加载失败，重新加载
          setLoadingStatus('重新加载模型...');
          const vision = await FilesetResolver.forVisionTasks(
            "/mediapipe/wasm"
          );
          
          return await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: "/models/pose_landmarker_lite.task",
              delegate: "GPU"
            },
            runningMode: "VIDEO",
            numPoses: 1
          });
        })(),
        
        // 启动相机
        navigator.mediaDevices.getUserMedia({
          video: {
            width: 640,
            height: 480,
            facingMode: 'user',
            frameRate: { ideal: 30, max: 30 }
          }
        })
      ]);

      poseLandmarkerRef.current = poseLandmarker;
      streamRef.current = stream;
      
      setLoadingStatus('正在连接视频流...');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // 等待视频加载完成后开始处理
        videoRef.current.onloadedmetadata = () => {
          setLoadingStatus('正在启动姿态检测...');
          startPoseDetection();
          setIsInitialized(true);
          setLoadingStatus('✅ 已连接');
          if (typeof onReady === 'function') {
            onReady();
          }
          if (typeof onStarted === 'function') {
            onStarted();
          }
        };
      }

      console.log('MediaPipe 和相机快速初始化成功');

    } catch (err) {
      console.error('初始化失败:', err);
      setError('初始化失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsInitialized(false);
    setLoadingStatus('已停止');
    if (typeof onStopped === 'function') {
      onStopped();
    }
  };

  // 开始姿态检测
  const startPoseDetection = () => {
    const processFrame = async () => {
      if (poseLandmarkerRef.current && videoRef.current && videoRef.current.readyState === 4) {
        const now = performance.now();
        const elapsed = now - lastDetectTimeRef.current;
        if (elapsed >= 33) { // ~30 FPS 姿态
          lastDetectTimeRef.current = now;
          const poseResults = poseLandmarkerRef.current.detectForVideo(videoRef.current, now);
        
          if (poseResults.landmarks && poseResults.landmarks.length > 0) {
            const landmarks = poseResults.landmarks[0].map((landmark: any, index: number) => ({
              id: index,
              x: landmark.x,
              y: landmark.y,
              z: landmark.z,
              visibility: landmark.visibility || 1.0
            }));

            const poseData: PoseData = {
              success: true,
              landmarks,
              connections: POSE_CONNECTIONS
            };

            // 不再采集面部和手部数据

            onPoseDetection(poseData);
          }
        }
      }
      
      // 继续下一帧
      animationFrameRef.current = requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  // 挂载时自动启动（保持原有行为），卸载时清理
  useEffect(() => {
    void initMediaPipe();
    return () => {
      stopCamera();
      // 注意：不要关闭预加载的模型，因为它是全局共享的
      if (poseLandmarkerRef.current && poseLandmarkerRef.current !== preloadedPoseLandmarker) {
        poseLandmarkerRef.current.close();
      }
    };
  }, []);

  // 处理错误
  if (error) {
    return (
      <div className="camera-capture error">
        <div className="error-message">
          <h3>❌ 错误</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>刷新页面重试</button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera-capture">
      <div className="camera-header">
        <h3>📷 相机捕获</h3>
        <div className="status">{isInitialized ? '✅ 已连接' : loadingStatus}</div>
        <button
          onClick={() => (isInitialized ? stopCamera() : initMediaPipe())}
          className="camera-toggle-btn"
        >
          {isInitialized ? '停止相机' : '启动相机'}
        </button>
      </div>
      
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />
        <canvas
          ref={canvasRef}
          className="camera-canvas"
          width={640}
          height={480}
        />
        
        {!isInitialized && loadingStatus !== '已停止' && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
            <p>{loadingStatus}</p>
      </div>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
