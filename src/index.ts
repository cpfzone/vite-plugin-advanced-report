import type { Plugin } from 'vite';
import { BuildReport, ModuleStat, PluginOptions } from './types';
import { normalizePath, calculateModuleStats, generateOptimizationTips, calculateProgress, buildDependencyGraph } from './utils';
import { ReportGenerator } from './report-generator';

export default function advancedReport(options: PluginOptions = {}): Plugin {
  // 默认配置
  const defaultOptions: PluginOptions = {
    slowThreshold: 200,
    outputDir: 'dist',
    generateHtml: true,
    generateJson: true,
    enableProgress: true,
    enableCache: true,
    ...options
  };

  // 构建报告数据
  const report: BuildReport = {
    startTime: 0,
    endTime: 0,
    totalDuration: 0,
    modules: [],
    slowModules: [],
    dependencyGraph: [],
    moduleCount: 0,
    avgModuleSize: 0,
    maxDurationModule: null,
    optimizationTips: []
  };

  // 进度跟踪
  let processedCount = 0;
  let totalModules = 0;
  const moduleCache = new Map<string, any>();

  // 报告生成器
  const reportGenerator = new ReportGenerator(defaultOptions);

  return {
    name: 'vite-plugin-advanced-report',

    // 配置解析完成
    configResolved() {
      console.log('🚀 Vite高级报告插件已启用');
      if (defaultOptions.enableProgress) {
        console.log('📊 进度预测功能已启用');
      }
    },

    // 构建开始
    buildStart() {
      report.startTime = Date.now();
      processedCount = 0;
      totalModules = 0;
      report.modules = [];
      report.slowModules = [];
      report.dependencyGraph = [];
      
      console.log('🔍 开始收集构建性能数据...');
    },

    // 模块解析
    moduleParsed() {
      totalModules++;
      
      if (defaultOptions.enableProgress && processedCount > 0) {
        const progress = calculateProgress(processedCount, totalModules, report.startTime);
        if (progress) {
          console.log(`⌛ 进度: ${progress.processedCount}/${progress.totalModules} (${((progress.processedCount / progress.totalModules) * 100).toFixed(1)}%) - 预计剩余: ${(progress.estimatedRemaining / 1000).toFixed(1)}s`);
        }
      }
    },

    // 模块转换
    transform(code: string, id: string) {
      const startTime = performance.now();
      
      // 缓存检查
      if (defaultOptions.enableCache && moduleCache.has(id)) {
        return moduleCache.get(id);
      }

      // 跳过某些文件类型，避免干扰正常构建
      if (id.includes('node_modules') && !id.includes('.css')) {
        return null;
      }

      // 跳过HTML报告文件，避免重复处理
      if (id.includes('build-report.html')) {
        return null;
      }

      // 跳过插件自身的文件，避免自引用
      if (id.includes('vite-plugin-advanced-report')) {
        return null;
      }

      // 跳过虚拟模块和特殊文件
      if (id.startsWith('\0') || id.includes('virtual:') || id.includes('__vite_')) {
        return null;
      }

      const result = {
        code,
        map: null as any
      };

      // 记录模块统计信息
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      const moduleStat: ModuleStat = {
        id: normalizePath(id),
        duration,
        size: code.length,
        startTime,
        endTime
      };

      // 直接记录模块信息
      report.modules.push(moduleStat);
      processedCount++;
      
      // 检查是否为慢模块
      if (duration > (defaultOptions.slowThreshold || 200)) {
        report.slowModules.push(moduleStat);
      }

      // 缓存结果
      if (defaultOptions.enableCache) {
        moduleCache.set(id, result);
      }

      return result;
    },

    // 生成包
    generateBundle(options: any, bundle: any) {
      // 构建依赖图
      report.dependencyGraph = buildDependencyGraph(bundle);
      
      // 生成依赖报告
      reportGenerator.generateDependencyReport(report.dependencyGraph, defaultOptions.outputDir);
    },

    // 构建结束
    buildEnd() {
      console.log('buildEnd 钩子已触发');
      // 不再写入报告，仅保留日志
    },

    // 构建全部输出完成
    closeBundle() {
      console.log('closeBundle 钩子已触发');
      report.endTime = Date.now();
      report.totalDuration = report.endTime - report.startTime;
      report.moduleCount = report.modules.length;

      // 计算统计信息
      const stats = calculateModuleStats(report.modules);
      report.avgModuleSize = stats.avgSize;
      report.maxDurationModule = stats.maxDurationModule;
      report.slowModules = stats.slowModules;

      // 生成优化建议
      report.optimizationTips = generateOptimizationTips(report.modules);

      // 生成报告
      reportGenerator.generateJsonReport(report, defaultOptions.outputDir);
      reportGenerator.generateHtmlReport(report, defaultOptions.outputDir);

      // 控制台输出摘要
      console.log('\n📊 构建性能报告摘要:');
      console.log(`⏱️  总构建时间: ${(report.totalDuration / 1000).toFixed(2)}s`);
      console.log(`📦 处理模块数: ${report.moduleCount}`);
      console.log(`🐌 慢模块数量: ${report.slowModules.length}`);
      console.log(`📏 平均模块大小: ${(report.avgModuleSize / 1024).toFixed(2)}KB`);

      if (report.slowModules.length > 0) {
        console.log('\n🐌 最慢的5个模块:');
        report.slowModules
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 5)
          .forEach((module, index) => {
            console.log(`  ${index + 1}. ${module.id} (${module.duration}ms)`);
          });
      }

      if (report.optimizationTips.length > 0) {
        console.log('\n💡 优化建议:');
        report.optimizationTips.forEach(tip => {
          console.log(`  ${tip}`);
        });
      }

      // CI告警检查
      if (defaultOptions.maxBuildTime && report.totalDuration > defaultOptions.maxBuildTime) {
        console.warn(`⚠️  构建时间超过阈值: ${report.totalDuration}ms > ${defaultOptions.maxBuildTime}ms`);
        
        if (defaultOptions.webhookUrl) {
          sendWebhookAlert(report, defaultOptions);
        }
      }

      console.log('\n✅ 构建完成！详细报告已生成到 dist/ 目录');
    }
  };
}

// 发送webhook告警
function sendWebhookAlert(report: BuildReport, options: PluginOptions) {
  if (!options.webhookUrl) return;

  const axios = require('axios');
  const payload = {
    msg: `构建超时告警: ${report.totalDuration}ms > ${options.maxBuildTime}ms`,
    buildTime: report.totalDuration,
    threshold: options.maxBuildTime,
    slowModules: report.slowModules.length,
    timestamp: new Date().toISOString()
  };

  axios.post(options.webhookUrl, payload, {
    headers: {
      'Content-Type': 'application/json',
      ...options.webhookHeaders
    }
  }).catch((error: any) => {
    console.error('❌ Webhook告警发送失败:', error.message);
  });
}

// 导出类型
export type { PluginOptions, BuildReport, ModuleStat }; 