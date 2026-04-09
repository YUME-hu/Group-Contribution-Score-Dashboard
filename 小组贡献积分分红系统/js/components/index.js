// 组件加载器
// 统一加载所有Web Components

// 导入所有组件
import './NavBar.js'
import './ScoreCalculator.js'
import './ControlButtons.js'
import './StatsOverview.js'
import './RankList.js'
import './MemberCards.js'
import './ChartSection.js'
import './LogSection.js'

/**
 * 初始化所有Web Components
 */
export function initComponents() {
  console.log('🔧 初始化Web Components...')
  
  // 所有组件已通过import自动注册
  // 这里可以添加额外的初始化逻辑
  
  console.log('✅ Web Components初始化完成')
}

export default {
  initComponents
}