<template>
  <div id="app">
    <header>
      <h1>🚀 Vite 高级报告插件示例</h1>
      <p>这是一个用于测试 vite-plugin-advanced-report 的示例项目</p>
    </header>
    
    <main>
      <section class="features">
        <h2>✨ 插件特性</h2>
        <ul>
          <li>📊 详细的构建报告</li>
          <li>🐌 慢模块识别</li>
          <li>📈 可视化图表</li>
          <li>💡 智能优化建议</li>
          <li>⏱️ 进度预测</li>
          <li>🔄 依赖分析</li>
        </ul>
      </section>
      
      <section class="demo">
        <h2>🧪 测试功能</h2>
        <button @click="simulateHeavyComputation" :disabled="computing">
          {{ computing ? '计算中...' : '模拟重计算' }}
        </button>
        <div v-if="result" class="result">
          计算结果: {{ result }}
        </div>
      </section>
    </main>
    
    <footer>
      <p>运行 <code>npm run build</code> 查看构建报告</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const computing = ref(false)
const result = ref<number | null>(null)

function simulateHeavyComputation() {
  computing.value = true
  result.value = null
  
  // 模拟异步重计算
  setTimeout(() => {
    const start = performance.now()
    let sum = 0
    for (let i = 0; i < 5000000; i++) {
      sum += Math.random()
    }
    const end = performance.now()
    
    result.value = sum
    computing.value = false
    
    console.log(`重计算完成，耗时: ${end - start}ms`)
  }, 100)
}
</script>

<style scoped>
#app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

header {
  text-align: center;
  margin-bottom: 40px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
}

h1 {
  margin: 0 0 10px 0;
  font-size: 2.5em;
}

h2 {
  color: #333;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.features {
  margin-bottom: 40px;
}

.features ul {
  list-style: none;
  padding: 0;
}

.features li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 1.1em;
}

.demo {
  text-align: center;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 40px;
}

button {
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 1.1em;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover:not(:disabled) {
  background: #5a6fd8;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 6px;
  font-family: monospace;
  font-size: 1.1em;
}

footer {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

code {
  background: #e9ecef;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
</style> 