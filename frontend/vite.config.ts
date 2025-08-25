import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || '/',
  server: {
    port: 3000,
    open: true,
    host: true,
    // 性能优化
    hmr: {
      overlay: false, // 禁用错误覆盖层，提升性能
    },
    // 文件监听优化
    watch: {
      usePolling: false,
      interval: 1000,
    },
  },
  build: {
    // 构建优化
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mediapipe: ['@mediapipe/pose', '@mediapipe/camera_utils'],
          three: ['three'],
        },
      },
    },
  },
  // 依赖预构建优化
  optimizeDeps: {
    include: ['react', 'react-dom', 'three'],
    exclude: ['@mediapipe/pose', '@mediapipe/camera_utils'],
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // 解析配置
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // 处理CommonJS模块
  define: {
    global: 'globalThis',
  },
})
