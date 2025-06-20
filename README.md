# vite-plugin-advanced-report

🚀 一个功能强大的 Vite 构建性能分析插件，提供详细的构建报告、性能分析和优化建议。

## ✨ 特性

- 📊 **详细的构建报告** - JSON 和 HTML 格式的完整构建分析
- 🐌 **慢模块识别** - 自动识别处理时间过长的模块
- 📈 **可视化图表** - 基于 ECharts 的交互式性能图表
- 💡 **智能优化建议** - 基于分析结果提供具体的优化建议
- ⏱️ **进度预测** - 实时显示构建进度和剩余时间估算
- 🔄 **依赖分析** - 构建模块依赖图和循环依赖检测
- 🚨 **CI/CD 集成** - 支持构建超时告警和 Webhook 通知
- 🎯 **性能优化** - 内置模块缓存和采样分析

## 📦 安装

```bash
npm install vite-plugin-advanced-report --save-dev
```

## 🚀 快速开始

### 基础使用

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import advancedReport from 'vite-plugin-advanced-report'

export default defineConfig({
  plugins: [
    advancedReport()
  ]
})
```

### 高级配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import advancedReport from 'vite-plugin-advanced-report'

export default defineConfig({
  plugins: [
    advancedReport({
      // 慢模块阈值（毫秒）
      slowThreshold: 200,
      
      // 构建超时阈值（毫秒）
      maxBuildTime: 30000,
      
      // 报告输出目录
      outputDir: 'dist',
      
      // 是否生成HTML报告
      generateHtml: true,
      
      // 是否生成JSON报告
      generateJson: true,
      
      // 是否启用进度预测
      enableProgress: true,
      
      // 是否启用模块缓存
      enableCache: true,
      
      // CI告警webhook地址
      webhookUrl: 'https://your-ci-webhook.com/alert',
      
      // webhook请求头
      webhookHeaders: {
        'Authorization': 'Bearer your-token'
      }
    })
  ]
})
```

## 📊 报告输出

插件会在构建完成后生成以下报告文件：

### JSON 报告 (`dist/build-report.json`)

```json
{
  "startTime": 1640995200000,
  "endTime": 1640995205000,
  "totalDuration": 5000,
  "modules": [
    {
      "id": "src/main.ts",
      "duration": 150,
      "size": 1024,
      "startTime": 1640995200100,
      "endTime": 1640995200250
    }
  ],
  "slowModules": [...],
  "dependencyGraph": [...],
  "moduleCount": 100,
  "avgModuleSize": 2048,
  "maxDurationModule": {...},
  "optimizationTips": [
    "🚨 发现 3 个处理较慢的第三方库，建议检查依赖版本",
    "💡 发现 2 个大文件，建议进行代码分割"
  ]
}
```

### HTML 可视化报告 (`dist/build-report.html`)

包含交互式图表，展示：
- 模块处理时间分布（Treemap）
- 慢模块分析
- 构建统计信息
- 优化建议

### 依赖图报告 (`dist/dependencies.json`)

```json
[
  {
    "file": "index.js",
    "imports": ["chunk-vendor.js"],
    "size": 1024,
    "dependencies": ["vendor"]
  }
]
```

## 🔧 API 参考

### PluginOptions

| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `slowThreshold` | `number` | `200` | 慢模块阈值（毫秒） |
| `maxBuildTime` | `number` | - | 构建超时阈值（毫秒） |
| `outputDir` | `string` | `'dist'` | 报告输出目录 |
| `generateHtml` | `boolean` | `true` | 是否生成HTML报告 |
| `generateJson` | `boolean` | `true` | 是否生成JSON报告 |
| `enableProgress` | `boolean` | `true` | 是否启用进度预测 |
| `enableCache` | `boolean` | `true` | 是否启用模块缓存 |
| `webhookUrl` | `string` | - | CI告警webhook地址 |
| `webhookHeaders` | `Record<string, string>` | - | webhook请求头 |

### 类型定义

```typescript
interface ModuleStat {
  id: string;
  duration: number;
  size: number;
  startTime: number;
  endTime: number;
}

interface BuildReport {
  startTime: number;
  endTime: number;
  totalDuration: number;
  modules: ModuleStat[];
  slowModules: ModuleStat[];
  dependencyGraph: DependencyNode[];
  moduleCount: number;
  avgModuleSize: number;
  maxDurationModule: ModuleStat | null;
  optimizationTips: string[];
}
```

## 🎯 使用场景

### 1. 性能优化

识别构建过程中的性能瓶颈：

```bash
npm run build
```

查看控制台输出的性能摘要和优化建议。

### 2. CI/CD 集成

在持续集成中监控构建性能：

```typescript
advancedReport({
  maxBuildTime: 30000, // 30秒超时
  webhookUrl: process.env.CI_WEBHOOK_URL,
  webhookHeaders: {
    'Authorization': `Bearer ${process.env.CI_TOKEN}`
  }
})
```

### 3. 团队协作

将HTML报告部署到静态服务器，供团队查看：

```bash
# 构建后自动生成报告
npm run build

# 部署报告到静态服务器
cp dist/build-report.html /var/www/reports/
```

## 🔍 调试

### 启用详细日志

```typescript
advancedReport({
  enableProgress: true,
  enableCache: true
})
```

### 查看控制台输出

构建过程中会显示：
- 插件启用状态
- 进度预测信息
- 构建完成摘要
- 慢模块列表
- 优化建议

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 开发环境设置

```bash
# 克隆仓库
git clone https://github.com/cpfzone/vite-plugin-advanced-report.git
cd vite-plugin-advanced-report

# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

## 📄 许可证

MIT License

## 🙏 致谢

- [Vite](https://vitejs.dev/) - 下一代前端构建工具
- [ECharts](https://echarts.apache.org/) - 强大的图表库
- [TypeScript](https://www.typescriptlang.org/) - JavaScript的超集 