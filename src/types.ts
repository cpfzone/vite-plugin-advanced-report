import type { Plugin } from 'vite';

export interface ModuleStat {
  id: string;
  duration: number;
  size: number;
  startTime: number;
  endTime: number;
}

export interface DependencyNode {
  file: string;
  imports: string[];
  size: number;
  dependencies: string[];
}

export interface BuildReport {
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

export interface PluginOptions {
  slowThreshold?: number; // 默认200ms
  maxBuildTime?: number; // 构建超时阈值
  outputDir?: string; // 报告输出目录
  generateHtml?: boolean; // 是否生成HTML报告
  generateJson?: boolean; // 是否生成JSON报告
  enableProgress?: boolean; // 是否启用进度预测
  enableCache?: boolean; // 是否启用模块缓存
  webhookUrl?: string; // CI告警webhook地址
  webhookHeaders?: Record<string, string>; // webhook请求头
}

export interface ProgressInfo {
  processedCount: number;
  totalModules: number;
  elapsedTime: number;
  estimatedRemaining: number;
  avgTimePerModule: number;
}

export interface ReportComparison {
  durationChange: string;
  newSlowModules: ModuleStat[];
  removedSlowModules: ModuleStat[];
  performanceTrend: 'improved' | 'degraded' | 'stable';
} 