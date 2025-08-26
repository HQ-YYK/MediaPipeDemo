import React, { useMemo, useState } from 'react';
import CameraCapture from './components/CameraCapture/CameraCapture';
import PoseVisualizer from './components/PoseVisualizer/PoseVisualizer';
import { PoseData } from './types';
import './App.css';

function App() {
  const [poseData, setPoseData] = useState<PoseData | null>(null);
  const [isMediaPipeReady, setIsMediaPipeReady] = useState(false);
  const [isThreeReady, setIsThreeReady] = useState(false);

  const handlePoseDetection = (data: PoseData) => {
    setPoseData(data);
  };

  const isAllReady = useMemo(() => isMediaPipeReady && isThreeReady, [isMediaPipeReady, isThreeReady]);

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">MediaPipe 2.0+ 姿态识别</h1>
        <p className="app-subtitle">实时3D骨骼可视化 - 跟随你的真实姿态角度</p>
      </header>
      
      <main className="app-content">
        <CameraCapture onPoseDetection={handlePoseDetection} onReady={() => setIsMediaPipeReady(true)} />
        <PoseVisualizer poseData={poseData} onReady={() => setIsThreeReady(true)} />
      </main>

      {!isAllReady && (
        <div className="app-loading-overlay">
          <div className="app-loading-card">
            <div className="app-loading-ring"></div>
            <div className="app-loading-title">正在准备舞台</div>
            <div className="app-loading-subtitle">加载 MediaPipe 与 Three.js 中…</div>
          </div>
        </div>
      )}
      
      <footer className="app-footer">
        <p>基于 MediaPipe Tasks Vision API 构建 | 支持实时姿态角度同步</p>
      </footer>
    </div>
  );
}

export default App;
