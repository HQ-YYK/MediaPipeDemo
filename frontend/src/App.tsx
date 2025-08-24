import React, { useState } from 'react';
import CameraCapture from './components/CameraCapture/CameraCapture';
import PoseVisualizer from './components/PoseVisualizer/PoseVisualizer';
import { PoseData } from './types';
import './App.css';

function App() {
  const [poseData, setPoseData] = useState<PoseData | null>(null);

  const handlePoseDetection = (data: PoseData) => {
    setPoseData(data);
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="app-title">MediaPipe 2.0+ 姿态识别</h1>
        <p className="app-subtitle">实时3D骨骼可视化 - 跟随你的真实姿态角度</p>
      </header>
      
      <main className="app-content">
        <CameraCapture onPoseDetection={handlePoseDetection} />
        <PoseVisualizer poseData={poseData} />
      </main>
      
      <footer className="app-footer">
        <p>基于 MediaPipe Tasks Vision API 构建 | 支持实时姿态角度同步</p>
      </footer>
    </div>
  );
}

export default App;
