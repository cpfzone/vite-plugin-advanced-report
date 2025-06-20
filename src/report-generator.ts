import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { BuildReport, PluginOptions } from './types';
import { formatFileSize, formatDuration } from './utils';

export class ReportGenerator {
  private options: PluginOptions;

  constructor(options: PluginOptions) {
    this.options = options;
  }

  /**
   * 生成JSON格式报告
   */
  generateJsonReport(report: BuildReport, outputDir: string = 'dist'): void {
    if (!this.options.generateJson) return;

    this.ensureOutputDir(outputDir);
    const reportPath = join(outputDir, 'build-report.json');
    
    const jsonReport = {
      ...report,
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    writeFileSync(reportPath, JSON.stringify(jsonReport, null, 2));
    console.log(`📊 JSON报告已生成: ${reportPath}`);
  }

  /**
   * 生成HTML可视化报告
   */
  generateHtmlReport(report: BuildReport, outputDir: string = 'dist'): void {
    console.log('generateHtmlReport 被调用, options:', this.options);
    if (!this.options.generateHtml) return;

    this.ensureOutputDir(outputDir);
    const reportPath = join(outputDir, 'build-report.html');
    console.log('准备写入HTML报告:', reportPath);
    console.log('report.modules:', report.modules);

    const htmlContent = this.generateHtmlContent(report);
    writeFileSync(reportPath, htmlContent);
    console.log(`📊 HTML报告已生成: ${reportPath}`);
    console.log('绝对路径:', require('path').resolve(reportPath));
  }

  /**
   * 生成HTML内容
   */
  private generateHtmlContent(report: BuildReport): string {
    const modulesData = report.modules.map(m => ({
      value: m.duration,
      name: m.id,
      size: m.size,
      duration: m.duration
    }));

    const slowModulesData = report.slowModules.map(m => ({
      value: m.duration,
      name: m.id,
      size: m.size,
      duration: m.duration
    }));

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vite构建报告</title>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
    <style>
        /* 限制样式作用域，避免影响其他页面 */
        .vite-build-report {
            min-height: 100vh;
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .vite-build-report .container {
            width: 100%;
            min-height: 100vh;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .vite-build-report .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .vite-build-report .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 20px;
            background: #f8f9fa;
        }
        .vite-build-report .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .vite-build-report .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .vite-build-report .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .vite-build-report .charts {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 20px;
        }
        .vite-build-report .chart-container {
            height: 400px;
            border: 1px solid #eee;
            border-radius: 8px;
        }
        .vite-build-report .tips {
            padding: 20px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            margin: 20px;
            border-radius: 4px;
        }
        .vite-build-report .tip-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #28a745;
        }
        /* 模态框样式 */
        .vite-build-report .modal {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0,0,0,0.4);
        }
        .vite-build-report .modal-content {
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 80%;
            border-radius: 8px;
        }
        .vite-build-report .close-btn {
            color: #aaa;
            float: right;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
        }
        .vite-build-report .modules-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .vite-build-report .modules-table th, .vite-build-report .modules-table td {
            border: 1px solid #ddd;
            padding: 8px;
        }
        .vite-build-report .modules-table th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            background-color: #667eea;
            color: white;
            cursor: pointer;
        }
        @media (max-width: 768px) {
            .vite-build-report .charts {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="vite-build-report">
        <div class="container">
            <div class="header">
                <h1>🚀 Vite构建性能报告</h1>
                <p>构建完成时间: ${new Date(Number(report.endTime)).toLocaleString()}</p>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${formatDuration(report.totalDuration)}</div>
                    <div class="stat-label">总构建时间</div>
                </div>
                <div class="stat-card" id="show-modules-btn" style="cursor: pointer;">
                    <div class="stat-value">${report.moduleCount}</div>
                    <div class="stat-label">处理模块数</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${formatFileSize(report.avgModuleSize)}</div>
                    <div class="stat-label">平均模块大小</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${report.slowModules.length}</div>
                    <div class="stat-label">慢模块数量</div>
                </div>
            </div>

            <div class="charts">
                <div class="chart-container" id="vite-report-modulesChart"></div>
                <div class="chart-container" id="vite-report-slowModulesChart"></div>
            </div>

            ${report.optimizationTips.length > 0 ? `
            <div class="tips">
                <h3>💡 优化建议</h3>
                ${report.optimizationTips.map(tip => `
                    <div class="tip-item">${tip}</div>
                `).join('')}
            </div>
            ` : ''}
        </div>
    </div>

    <!-- 模块列表模态框 -->
    <div id="modules-modal" class="vite-build-report modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h2>所有模块详情</h2>
            <table class="modules-table">
                <thead>
                    <tr>
                        <th data-sort="id">模块 ID</th>
                        <th data-sort="duration">处理耗时 (ms)</th>
                        <th data-sort="size">大小 (Bytes)</th>
                    </tr>
                </thead>
                <tbody id="modules-list">
                </tbody>
            </table>
        </div>
    </div>

    <script>
        // 使用立即执行函数避免全局变量污染
        (function() {
            const allModules = ${JSON.stringify(report.modules)};

            // 模块处理时间分布图
            const modulesChart = echarts.init(document.getElementById('vite-report-modulesChart'));
            modulesChart.setOption({
                title: { text: '模块处理时间分布', left: 'center' },
                tooltip: {
                    confine: true,
                    formatter: function(params) {
                        return \`<strong>\${params.name}</strong><br/>
                                处理时间: \${params.value}ms<br/>
                                文件大小: \${formatFileSize(params.data.size)}<br/>
                                占比: \${params.percent}%\`;
                    }
                },
                series: [{
                    type: 'treemap',
                    data: ${JSON.stringify(modulesData)},
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1,
                        gapWidth: 1
                    },
                    breadcrumb: { show: false },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1,
                        gapWidth: 1
                    }
                }]
            });

            // 慢模块分析图
            const slowModulesChart = echarts.init(document.getElementById('vite-report-slowModulesChart'));
            slowModulesChart.setOption({
                title: { text: '慢模块分析', left: 'center' },
                tooltip: {
                    confine: true,
                    formatter: function(params) {
                        return \`<strong>\${params.name}</strong><br/>
                                处理时间: \${params.value}ms<br/>
                                文件大小: \${formatFileSize(params.data.size)}<br/>
                                占比: \${params.percent}%\`;
                    }
                },
                series: [{
                    type: 'treemap',
                    data: ${JSON.stringify(slowModulesData)},
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1,
                        gapWidth: 1
                    },
                    breadcrumb: { show: false },
                    itemStyle: {
                        borderColor: '#fff',
                        borderWidth: 1,
                        gapWidth: 1
                    }
                }]
            });

            // 响应式调整
            window.addEventListener('resize', function() {
                modulesChart.resize();
                slowModulesChart.resize();
            });

            // 工具函数
            function formatFileSize(bytes) {
                if (bytes === 0) return '0 B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }

            // 模态框逻辑
            const modal = document.getElementById('modules-modal');
            const btn = document.getElementById('show-modules-btn');
            const span = document.getElementsByClassName("close-btn")[0];
            const modulesListBody = document.getElementById('modules-list');

            let currentSort = { key: 'duration', order: 'desc' };

            function renderTable() {
                // 排序
                const sortedModules = [...allModules].sort((a, b) => {
                    if (a[currentSort.key] < b[currentSort.key]) {
                        return currentSort.order === 'asc' ? -1 : 1;
                    }
                    if (a[currentSort.key] > b[currentSort.key]) {
                        return currentSort.order === 'asc' ? 1 : -1;
                    }
                    return 0;
                });
                
                // 渲染
                modulesListBody.innerHTML = sortedModules.map(m => \`
                    <tr>
                        <td>\${m.id}</td>
                        <td>\${m.duration.toFixed(2)}</td>
                        <td>\${m.size}</td>
                    </tr>
                \`).join('');
            }

            btn.onclick = function() {
                renderTable();
                modal.style.display = "block";
            }

            span.onclick = function() {
                modal.style.display = "none";
            }

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }

            document.querySelectorAll('.modules-table th').forEach(th => {
                th.onclick = function() {
                    const sortKey = this.getAttribute('data-sort');
                    if (currentSort.key === sortKey) {
                        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
                    } else {
                        currentSort.key = sortKey;
                        currentSort.order = 'desc';
                    }
                    renderTable();
                }
            });
        })();
    </script>
</body>
</html>`;
  }

  /**
   * 确保输出目录存在
   */
  private ensureOutputDir(outputDir: string): void {
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
  }

  /**
   * 生成依赖图报告
   */
  generateDependencyReport(dependencyGraph: any[], outputDir: string = 'dist'): void {
    this.ensureOutputDir(outputDir);
    const depsPath = join(outputDir, 'dependencies.json');
    
    writeFileSync(depsPath, JSON.stringify(dependencyGraph, null, 2));
    console.log(`📊 依赖图报告已生成: ${depsPath}`);
  }
} 