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
  scene: THREE.Scene | null;
  camera: THREE.PerspectiveCamera | null;
  renderer: THREE.WebGLRenderer | null;
  landmarks: THREE.Mesh[];
  connections: THREE.Line[];
}
