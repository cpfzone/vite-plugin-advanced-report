# 更新日志

所有此项目的 notable changes 将被记录于此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)，
并且本项目遵循 [Semantic Versioning](https://semver.org/spec/v2.0.0.html)。

## [1.0.2] - 2024-07-26 (待发布)

### ✨ 新增 (Added)

- **交互式模块列表**:
  - 点击报告中的"处理模块数"卡片，可以弹出一个模态框，展示所有模块的详细列表。
  - 模块列表支持按模块ID、处理耗时和文件大小进行升序/降序排序。
- **增强的优化建议**:
  - "优化建议"现在会明确列出具体的文件名（最多3个），而不仅仅是数量统计，帮助用户快速定位问题。
  - 例如，会提示具体是哪个大文件或哪个第三方库处理过慢。

### 🎨 优化 (Changed)

- 优化了报告页面的UI交互，使卡片点击区域更清晰。

## [1.0.1] - 2024-07-25

### 🐛 修复 (Fixed)

- **修复样式冲突**:
  - 为HTML报告中的所有CSS样式添加了 `.vite-build-report` 命名空间，避免污染宿主项目的全局样式。
  - 将报告内的JavaScript代码封装在立即执行函数（IIFE）中，防止全局变量泄露。
- **修复依赖解析干扰**:
  - 在 `transform` 钩子中增加了更严格的模块过滤逻辑，跳过 `node_modules`、虚拟模块以及插件自身文件，防止插件干扰项目的正常构建流程。

## [1.0.0] - 2024-07-24

### 🎉 发布 (Released)

- **初始版本**:
  - 提供详细的构建报告（JSON 和 HTML 格式）。
  - 识别慢模块。
  - 基于 ECharts 的可视化图表。
  - 提供基础的优化建议。
  - 支持构建进度预测和模块缓存。
  - CI/CD 集成，支持 Webhook 告警。 