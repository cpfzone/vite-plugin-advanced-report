import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import advancedReport from '../src/index'

export default defineConfig({
  plugins: [
    vue(),
    advancedReport({
      slowThreshold: 100, // 降低阈值以便测试
      maxBuildTime: 10000, // 10秒超时
      outputDir: 'dist/reports',
      generateHtml: true,
      generateJson: true,
      enableProgress: true,
      enableCache: true
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 