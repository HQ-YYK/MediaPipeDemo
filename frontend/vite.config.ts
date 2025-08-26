import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// 开发期移除 tasks-vision sourcemap 注释，避免控制台警告
const stripMediaPipeSourcemap = () => ({
  name: 'strip-mediapipe-sourcemap',
  enforce: 'pre' as const,
  apply: 'serve' as const,
  transform(code: string, id: string) {
    if (id.includes('@mediapipe/tasks-vision/vision_bundle.mjs')) {
      // Safely remove both single-line and block sourcemap comments
      const withoutLine = code
        .replace(/\n\s*\/\/[#@]\s*sourceMappingURL=.*$/gm, '')
        .replace(/^\s*\/\/[#@]\s*sourceMappingURL=.*$/gm, '');
      const withoutBlock = withoutLine.replace(/\/\*[#@]\s*sourceMappingURL=[\s\S]*?\*\//g, '');
      return withoutBlock;
    }
    return null
  }
})

export default defineConfig({
  plugins: [react(), stripMediaPipeSourcemap()],
  base: process.env.NODE_ENV === 'production' ? './' : '/',
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
          mediapipe: ['@mediapipe/tasks-vision'],
          three: ['three'],
        },
      },
    },
  },
  // 依赖预构建优化
  optimizeDeps: {
    include: ['react', 'react-dom', 'three'],
    exclude: ['@mediapipe/tasks-vision'],
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
