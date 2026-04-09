/**
 * 系统配置文件
 * 集中管理所有业务配置项
 */

const config = {
  // 版本信息
  version: '1.0.0',
  
  // 积分计算规则
  scoreCalculation: {
    // 难度系数
    difficultyCoefficients: {
      1: 1.0, // 简单
      2: 1.5, // 中等
      3: 2.0, // 困难
      4: 2.5, // 专家
      5: 3.0  // 关键
    },
    // 基础积分计算公式：积分 = 工时 * 难度系数
    baseFormula: 'score = hours * difficultyCoefficient',
    // 最小工时
    minHours: 0.5,
    // 工时步进
    hourStep: 0.5
  },
  
  // 分红规则
  dividend: {
    // 分红比例配置（基于积分占比）
    ratioThresholds: [
      { min: 0, max: 0.2, ratio: 0.1 },   // 0-20% 占比，分红10%
      { min: 0.2, max: 0.4, ratio: 0.2 },  // 20-40% 占比，分红20%
      { min: 0.4, max: 0.6, ratio: 0.3 },  // 40-60% 占比，分红30%
      { min: 0.6, max: 0.8, ratio: 0.4 },  // 60-80% 占比，分红40%
      { min: 0.8, max: 1.0, ratio: 0.5 }   // 80-100% 占比，分红50%
    ],
    // 分红周期（单位：天）
    cycleDays: 30,
    // 最低分红积分阈值
    minScoreThreshold: 10
  },
  
  // 成员等级规则
  memberLevels: {
    levels: [
      { level: 1, name: '新手', minScore: 0, maxScore: 99, coefficient: 1.0 },
      { level: 2, name: '进阶', minScore: 100, maxScore: 299, coefficient: 1.2 },
      { level: 3, name: '熟练', minScore: 300, maxScore: 599, coefficient: 1.5 },
      { level: 4, name: '专家', minScore: 600, maxScore: 999, coefficient: 1.8 },
      { level: 5, name: '大师', minScore: 1000, maxScore: Infinity, coefficient: 2.0 }
    ],
    // 等级系数应用范围
    coefficientApplication: 'both' // both, score, dividend
  },
  
  // 系统配置
  system: {
    // 最大成员数量
    maxMembers: 15,
    // 存储键名
    storageKey: 'teamScoreSystem',
    // 日志保留天数
    logRetentionDays: 30,
    // 历史记录保留天数
    historyRetentionDays: 90
  },
  
  // 界面配置
  ui: {
    // 颜色主题
    colorPalette: [
      '#409eff', '#67c23a', '#e6a23c', '#f56c6c',
      '#9b59b6', '#1abc9c', '#34495e', '#e74c3c',
      '#3498db', '#2ecc71', '#f39c12', '#95a5a6'
    ],
    // 动画持续时间（毫秒）
    animationDuration: 300,
    // 响应式断点
    breakpoints: {
      mobile: 480,
      tablet: 768,
      desktop: 1200
    }
  },
  
  // 验证规则
  validation: {
    memberName: {
      minLength: 1,
      maxLength: 20,
      regex: /^[\u4e00-\u9fa5a-zA-Z0-9_]+$/
    },
    hours: {
      min: 0.5,
      max: 24,
      step: 0.5
    },
    score: {
      min: 0,
      max: 99999
    }
  }
};

export default config;