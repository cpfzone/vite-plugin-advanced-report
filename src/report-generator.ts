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
        body {
            min-height: 100vh;
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .container {
            width: 100%;
            min-height: 100vh;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 20px;
            background: #f8f9fa;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        .charts {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 20px;
        }
        .chart-container {
            height: 400px;
            border: 1px solid #eee;
            border-radius: 8px;
        }
        .tips {
            padding: 20px;
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            margin: 20px;
            border-radius: 4px;
        }
        .tip-item {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #28a745;
        }
        @media (max-width: 768px) {
            .charts {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
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
            <div class="stat-card">
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
            <div class="chart-container" id="modulesChart"></div>
            <div class="chart-container" id="slowModulesChart"></div>
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

    <script>
        // 模块处理时间分布图
        const modulesChart = echarts.init(document.getElementById('modulesChart'));
        modulesChart.setOption({
            title: { text: '模块处理时间分布', left: 'center' },
            tooltip: {
                confine: false,
                formatter: function(params) {
                    return \`模块: \${params.data.name}<br/>
                            处理时间: \${params.data.duration}ms<br/>
                            文件大小: \${params.data.size} bytes\`;
                }
            },
            series: [{
                type: 'treemap',
                data: ${JSON.stringify(modulesData)},
                breadcrumb: { show: false },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 1,
                    gapWidth: 1
                },
                levels: [{
                    itemStyle: {
                        borderColor: '#777',
                        borderWidth: 0,
                        gapWidth: 1
                    }
                }]
            }]
        });

        // 慢模块分析图
        const slowModulesChart = echarts.init(document.getElementById('slowModulesChart'));
        slowModulesChart.setOption({
            title: { text: '慢模块分析', left: 'center' },
            tooltip: {
                confine: false,
                formatter: function(params) {
                    return \`模块: \${params.data.name}<br/>
                            处理时间: \${params.data.duration}ms<br/>
                            文件大小: \${params.data.size} bytes\`;
                }
            },
            series: [{
                type: 'treemap',
                data: ${JSON.stringify(slowModulesData)},
                breadcrumb: { show: false },
                itemStyle: {
                    borderColor: '#fff',
                    borderWidth: 1,
                    gapWidth: 1
                },
                levels: [{
                    itemStyle: {
                        borderColor: '#777',
                        borderWidth: 0,
                        gapWidth: 1
                    }
                }]
            }]
        });

        // 响应式处理
        window.addEventListener('resize', function() {
            modulesChart.resize();
            slowModulesChart.resize();
        });
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