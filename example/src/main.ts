import { createApp } from 'vue'
import App from './App.vue'

// 模拟一些慢模块处理
function simulateSlowProcessing() {
  const start = performance.now()
  // 模拟复杂计算
  let result = 0
  for (let i = 0; i < 1000000; i++) {
    result += Math.random()
  }
  const end = performance.now()
  console.log(`模拟慢处理完成，耗时: ${end - start}ms`)
  return result
}

// 在开发模式下模拟一些慢处理
if (import.meta.env.DEV) {
  simulateSlowProcessing()
}

createApp(App).mount('#app') 