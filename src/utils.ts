import { normalize } from 'path';
import { ModuleStat, DependencyNode, ProgressInfo } from './types';

/**
 * 标准化路径，处理跨平台路径差异
 */
export function normalizePath(path: string): string {
  return normalize(path).replace(/\\/g, '/');
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 格式化时间
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

/**
 * 计算模块统计信息
 */
export function calculateModuleStats(modules: ModuleStat[]) {
  if (modules.length === 0) {
    return {
      avgSize: 0,
      maxDurationModule: null,
      slowModules: []
    };
  }

  const avgSize = modules.reduce((sum, m) => sum + m.size, 0) / modules.length;
  const maxDurationModule = modules.reduce((max, m) => 
    m.duration > max.duration ? m : max, modules[0]);

  return {
    avgSize,
    maxDurationModule,
    slowModules: modules.filter(m => m.duration > 200) // 默认200ms阈值
  };
}

/**
 * 生成优化建议
 */
export function generateOptimizationTips(modules: ModuleStat[]): string[] {
  const tips: string[] = [];
  
  // 检查第三方库性能
  const slowNodeModules = modules.filter(m => 
    m.id.includes('node_modules') && m.duration > 100
  ).sort((a, b) => b.duration - a.duration);

  if (slowNodeModules.length > 0) {
    const topSlow = slowNodeModules.slice(0, 3).map(m => normalizePath(m.id).split('/node_modules/')[1]);
    tips.push(`🚨 发现 ${slowNodeModules.length} 个处理较慢的第三方库，例如: ${topSlow.join(', ')}。建议检查其版本或寻找替代方案。`);
  }

  // 检查大文件
  const largeFiles = modules.filter(m => m.size > 100000).sort((a, b) => b.size - a.size); // 100KB
  if (largeFiles.length > 0) {
    const topLarge = largeFiles.slice(0, 3).map(m => normalizePath(m.id));
    tips.push(`💡 发现 ${largeFiles.length} 个大于100KB的大文件，例如: ${topLarge.join(', ')}。建议进行代码分割。`);
  }

  // 检查超慢模块
  const verySlowModules = modules.filter(m => m.duration > 1000).sort((a, b) => b.duration - a.duration);
  if (verySlowModules.length > 0) {
    const topVerySlow = verySlowModules.slice(0, 3).map(m => normalizePath(m.id));
    tips.push(`⚠️ 发现 ${verySlowModules.length} 个处理超过1秒的模块，例如: ${topVerySlow.join(', ')}。需要重点优化。`);
  }

  return tips;
}

/**
 * 计算进度信息
 */
export function calculateProgress(
  processedCount: number,
  totalModules: number,
  startTime: number,
  skipFirstN: number = 10
): ProgressInfo | null {
  if (processedCount < skipFirstN) {
    return null; // 跳过前N个模块的预测，避免失真
  }

  const elapsedTime = Date.now() - startTime;
  const avgTimePerModule = elapsedTime / processedCount;
  const estimatedRemaining = (totalModules - processedCount) * avgTimePerModule;

  return {
    processedCount,
    totalModules,
    elapsedTime,
    estimatedRemaining,
    avgTimePerModule
  };
}

/**
 * 构建依赖图
 */
export function buildDependencyGraph(bundle: Record<string, any>): DependencyNode[] {
  return Object.values(bundle).map((chunk: any) => ({
    file: chunk.fileName,
    imports: chunk.imports || [],
    size: chunk.code?.length || 0,
    dependencies: chunk.dependencies || []
  }));
}

/**
 * 检测循环依赖
 */
export function detectCircularDependencies(dependencyGraph: DependencyNode[]): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(node: string, path: string[]): void {
    if (recursionStack.has(node)) {
      const cycleStart = path.indexOf(node);
      cycles.push(path.slice(cycleStart));
      return;
    }

    if (visited.has(node)) return;

    visited.add(node);
    recursionStack.add(node);

    const nodeData = dependencyGraph.find(d => d.file === node);
    if (nodeData) {
      for (const dep of nodeData.dependencies) {
        dfs(dep, [...path, node]);
      }
    }

    recursionStack.delete(node);
  }

  for (const node of dependencyGraph) {
    if (!visited.has(node.file)) {
      dfs(node.file, []);
    }
  }

  return cycles;
} 