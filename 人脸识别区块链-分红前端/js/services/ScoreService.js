/**
 * 积分服务
 * 负责积分计算和历史记录管理
 */
class ScoreService {
  constructor(state, levelCoeff) {
    this.state = state
    this.levelCoeff = levelCoeff
  }

  /**
   * 计算积分
   * @param {number} level - 难度等级
   * @param {number} hour - 工时
   * @returns {number} 计算后的积分
   */
  calculate(level, hour) {
    const levelNum = parseInt(level)
    const coeff = this.levelCoeff[levelNum] || 1.0
    const validHour = Math.max(0.5, hour)
    return validHour * coeff
  }

  /**
   * 添���积分历史记录
   * @param {number} userIndex - 用户索引
   * @param {number} score - 积分变化量
   * @param {string} reason - 原因
   */
  addHistory(userIndex, score, reason = '') {
    const member = this.state.users[userIndex]
    if (!member) {
      throw new Error('成员不存在')
    }

    const historyRecord = {
      timestamp: new Date().toISOString(),
      userIndex,
      userName: member.name,
      score,
      reason,
      totalScore: member.score
    }

    this.state.scoreHistory.push(historyRecord)
  }

  /**
   * 获取积分历史记录
   * @param {Object} filters - 筛选条件
   * @returns {Array}
   */
  getHistory(filters = {}) {
    let history = [...this.state.scoreHistory]

    // 按成员筛选
    if (filters.userIndex !== undefined && filters.userIndex !== 'all') {
      history = history.filter(h => h.userIndex === parseInt(filters.userIndex))
    }

    // 按时间筛选
    if (filters.timeRange) {
      const now = new Date()
      history = history.filter(h => {
        const recordTime = new Date(h.timestamp)
        switch (filters.timeRange) {
          case 'today':
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            return recordTime >= today
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return recordTime >= weekAgo
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return recordTime >= monthAgo
          default:
            return true
        }
      })
    }

    return history
  }

  /**
   * 获取成员的积分历史
   * @param {number} userIndex - 用户索引
   * @returns {Array}
   */
  getUserHistory(userIndex) {
    return this.state.scoreHistory.filter(h => h.userIndex === userIndex)
  }

  /**
   * 获取积分趋势数据
   * @param {Object} filters - 筛选条件
   * @returns {Object}
   */
  getTrendData(filters = {}) {
    const history = this.getHistory(filters)

    if (history.length === 0) {
      return { labels: [], datasets: [] }
    }

    // 按时间排序
    const sortedHistory = history.sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )

    // 如果是查看全部成员，需要为每个成员生成数据集
    if (filters.userIndex === 'all' || filters.userIndex === undefined) {
      const userDatasets = new Map()
      
      sortedHistory.forEach(record => {
        if (!userDatasets.has(record.userIndex)) {
          userDatasets.set(record.userIndex, {
            label: record.userName,
            data: [],
            color: this.state.users[record.userIndex]?.color || '#409eff'
          })
        }
        
        const dataset = userDatasets.get(record.userIndex)
        dataset.data.push({
          x: new Date(record.timestamp),
          y: record.totalScore
        })
      })

      return {
        labels: sortedHistory.map(h => new Date(h.timestamp)),
        datasets: Array.from(userDatasets.values())
      }
    } else {
      // 单个成员的趋势
      const userIndex = parseInt(filters.userIndex)
      const user = this.state.users[userIndex]
      
      return {
        labels: sortedHistory.map(h => new Date(h.timestamp)),
        datasets: [{
          label: user?.name || '成员',
          data: sortedHistory.map(h => ({
            x: new Date(h.timestamp),
            y: h.totalScore
          })),
          color: user?.color || '#409eff'
        }]
      }
    }
  }

  /**
   * 清空所有积分历史
   */
  clearHistory() {
    this.state.scoreHistory = []
  }

  /**
   * 获取积分统计信息
   * @returns {Object}
   */
  getStatistics() {
    const total = this.state.users.reduce((sum, user) => sum + user.score, 0)
    const count = this.state.users.length
    
    return {
      total,
      average: count > 0 ? total / count : 0,
      max: count > 0 ? Math.max(...this.state.users.map(u => u.score)) : 0,
      count
    }
  }
}

export default ScoreService
