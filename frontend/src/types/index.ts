// MediaPipe 姿态识别数据类型定义
export interface Landmark {
  id: number;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface PoseData {
  success: boolean;
  landmarks: Landmark[];
  connections: number[][];
  timestamp?: number;
  jointAngles?: {
    leftElbow?: number;
    rightElbow?: number;
    leftKnee?: number;
    rightKnee?: number;
    leftShoulder?: number;
    rightShoulder?: number;
  };
  // 新增：面部与双手
  faceLandmarks?: Landmark[];
  faceConnections?: number[][];
  leftHandLandmarks?: Landmark[];
  rightHandLandmarks?: Landmark[];
  handConnections?: number[][];
}

export interface PoseDetectionResponse {
  success: boolean;
  landmarks?: Landmark[];
  connections?: number[][]; // 改为更灵活的类型
  message?: string;
  error?: string;
}

// 组件Props类型定义
export interface CameraCaptureProps {
  onPoseDetection: (poseData: PoseData) => void;
}

export interface PoseVisualizerProps {
  poseData: PoseData | null;
}

// 摄像头状态类型
export interface CameraState {
  isCameraOn: boolean;
  error: string | null;
}

// Three.js 相关类型
export interface ThreeSceneRefs {
  scene: any | null;
  camera: any | null;
  renderer: any | null;
  landmarks: any[];
  connections: any[];
}

// 轻量声明修复 OrbitControls 的类型解析（避免编译错误，实际类型由 three 提供）
// 移除对 three 类型的直接依赖，避免构建环境下的类型解析问题