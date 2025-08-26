import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PoseData } from '../../types';
import './PoseVisualizer.css';

interface PoseVisualizerProps {
  poseData: PoseData | null;
}

const PoseVisualizer: React.FC<PoseVisualizerProps> = ({ poseData }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<any | null>(null);
  const landmarksRef = useRef<THREE.Mesh[]>([]);
  const connectionsRef = useRef<THREE.Line[]>([]);
  const skeletonRef = useRef<THREE.Group | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const angleDisplayRef = useRef<HTMLDivElement>(null);

  // 初始化Three.js场景
  useEffect(() => {
    if (!mountRef.current) return;

    const mountElement = mountRef.current;

    // 创建场景 - 使用更亮的背景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2a2a2a);
    sceneRef.current = scene;

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      60,
      mountElement.clientWidth / mountElement.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;

    // 添加轨道控制 - 限制旋转范围
    let controls: any;
    // 动态导入 OrbitControls，避免类型/解析报错
    // Vite 使用 ESM，需要 .js 扩展名
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      const module = await import('three/examples/jsm/controls/OrbitControls.js');
      const OrbitControls = module.OrbitControls;
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 4;
      controls.maxDistance = 6;
      
      // 限制旋转角度 - 只能进行小幅度的原地旋转
      controls.minAzimuthAngle = -Math.PI / 6; // -30度
      controls.maxAzimuthAngle = Math.PI / 6;  // +30度
      controls.minPolarAngle = Math.PI / 2 - Math.PI / 6; // 60度
      controls.maxPolarAngle = Math.PI / 2 + Math.PI / 6; // 120度
      
      controls.enablePan = false; // 禁用平移
      controlsRef.current = controls;
    })();

    // 添加到DOM
    mountElement.appendChild(renderer.domElement);

    // 增强光源 - 提高亮度
    const ambientLight = new THREE.AmbientLight(0x606060, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // 添加补光
    const fillLight = new THREE.DirectionalLight(0x7777ff, 0.7);
    fillLight.position.set(-5, -5, -5);
    scene.add(fillLight);

    // 添加点光源增强细节
    const pointLight = new THREE.PointLight(0x4ecdc4, 1.0, 100);
    pointLight.position.set(0, 3, 3);
    scene.add(pointLight);

    // 创建骨架组
    const skeletonGroup = new THREE.Group();
    scene.add(skeletonGroup);
    skeletonRef.current = skeletonGroup;

    // 动画循环
    let lastFrameTime = 0;
    const targetDelta = 1000 / 30; // ~30 FPS
    const animate = (time?: number) => {
      animationIdRef.current = requestAnimationFrame(animate);
      if (time === undefined) {
        renderer.render(scene, camera);
        return;
      }
      const delta = time - lastFrameTime;
      if (delta < targetDelta) return;
      lastFrameTime = time;
      controlsRef.current?.update();
      renderer.render(scene, camera);
    };
    animate();

    // 清理函数
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (controlsRef.current && typeof controlsRef.current.dispose === 'function') {
        controlsRef.current.dispose();
      }
      mountElement.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = (): void => {
      if (!mountRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 更新姿态数据
  useEffect(() => {
    if (!poseData || !skeletonRef.current) return;

    // 清除之前的关节点和连接线
    landmarksRef.current.forEach(obj => skeletonRef.current?.remove(obj));
    connectionsRef.current.forEach(obj => skeletonRef.current?.remove(obj));
    landmarksRef.current = [];
    connectionsRef.current = [];

    const { landmarks, connections, jointAngles } = poseData;

    if (!landmarks || landmarks.length === 0) return;

    // 更新角度显示
    if (angleDisplayRef.current && jointAngles) {
      let angleHtml = '<div class="angle-title">关节角度</div><div class="angle-grid">';
      
      if (jointAngles.leftElbow) angleHtml += `<div class="angle-item"><span class="angle-label">左肘:</span><span class="angle-value">${jointAngles.leftElbow}°</span></div>`;
      if (jointAngles.rightElbow) angleHtml += `<div class="angle-item"><span class="angle-label">右肘:</span><span class="angle-value">${jointAngles.rightElbow}°</span></div>`;
      if (jointAngles.leftKnee) angleHtml += `<div class="angle-item"><span class="angle-label">左膝:</span><span class="angle-value">${jointAngles.leftKnee}°</span></div>`;
      if (jointAngles.rightKnee) angleHtml += `<div class="angle-item"><span class="angle-label">右膝:</span><span class="angle-value">${jointAngles.rightKnee}°</span></div>`;
      if (jointAngles.leftShoulder) angleHtml += `<div class="angle-item"><span class="angle-label">左肩:</span><span class="angle-value">${jointAngles.leftShoulder}°</span></div>`;
      if (jointAngles.rightShoulder) angleHtml += `<div class="angle-item"><span class="angle-label">右肩:</span><span class="angle-value">${jointAngles.rightShoulder}°</span></div>`;
      
      angleHtml += '</div>';
      angleDisplayRef.current.innerHTML = angleHtml;
    }

    // 创建关节点 - 使用更大尺寸和更高对比度的颜色
    landmarks.forEach((landmark, index) => {
      if (landmark.visibility < 0.3) return;

      // 根据关节点重要性使用不同大小
      let size = 0.12;
      if (index === 11 || index === 12 || index === 23 || index === 24) {
        size = 0.18;
      } else if (index === 13 || index === 14 || index === 25 || index === 26) {
        size = 0.15;
      }

      const geometry = new THREE.SphereGeometry(size, 24, 24);
      
      // 使用更高对比度的颜色
      let color = 0x00ff00;
      
      if (index <= 10) {
        color = 0xff3333;
      } else if (index === 11 || index === 12) {
        color = 0x00ffff;
      } else if (index === 23 || index === 24) {
        color = 0x3366ff;
      } else if (index >= 25 && index <= 32) {
        color = 0xff9900;
      } else if (index >= 15 && index <= 22) {
        color = 0xff66ff;
      }

      const material = new THREE.MeshPhongMaterial({ 
        color,
        shininess: 100,
        specular: 0x222222,
        emissive: color,
        emissiveIntensity: 0.3
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      
      // 设置关节点位置
      sphere.position.set(
        (landmark.x - 0.5) * 10,
        (0.5 - landmark.y) * 10,
        (landmark.z - 0.5) * 10
      );
      
      // 根据可见性调整透明度
      material.opacity = 0.9 + landmark.visibility * 0.1;
      material.transparent = true;
      
      skeletonRef.current?.add(sphere);
      landmarksRef.current.push(sphere);
    });

    // 创建连接线 - 更粗更亮的线条
    connections.forEach(([start, end]) => {
      if (start >= landmarks.length || end >= landmarks.length) return;
      
      const startLandmark = landmarks[start];
      const endLandmark = landmarks[end];
      
      if (startLandmark.visibility < 0.3 || endLandmark.visibility < 0.3) return;

      const points = [];
      points.push(new THREE.Vector3(
        (startLandmark.x - 0.5) * 10,
        (0.5 - startLandmark.y) * 10,
        (startLandmark.z - 0.5) * 10
      ));
      points.push(new THREE.Vector3(
        (endLandmark.x - 0.5) * 10,
        (0.5 - endLandmark.y) * 10,
        (endLandmark.z - 0.5) * 10
      ));

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ 
        color: 0xffffff,
        linewidth: 5,
        transparent: true,
        opacity: 0.9
      });
      
      const line = new THREE.Line(geometry, material);
      skeletonRef.current?.add(line);
      connectionsRef.current.push(line);
    });

  }, [poseData]);

  return (
    <div className="pose-visualizer">
      <div className="visualizer-header">
        <h3>3D 姿态可视化</h3>
      </div>
      <div ref={mountRef} className="visualizer-container" />
      <div ref={angleDisplayRef} className="angle-display"></div>
    </div>
  );
};

export default PoseVisualizer;