/**
 * 统计渲染器
 * 负责统计卡片的渲染
 */
class StatsRenderer {
  constructor(state) {
    this.state = state
    this.elements = {
      totalScore: document.getElementById('totalScore'),
      avgScore: document.getElementById('avgScore'),
      maxScore: document.getElementById('maxScore'),
      leaderName: document.getElementById('leaderName')
    }
  }

  /**
   * 渲染统计信息
   */
  render() {
    const stats = this.calculateStats()

    if (this.elements.totalScore) {
      this.elements.totalScore.textContent = stats.total.toFixed(1)
    }

    if (this.elements.avgScore) {
      this.elements.avgScore.textContent = stats.average.toFixed(1)
    }

    if (this.elements.maxScore) {
      this.elements.maxScore.textContent = stats.max.toFixed(1)
    }

    if (this.elements.leaderName) {
      this.elements.leaderName.textContent = stats.leader || '-'
    }
  }

  /**
   * 计算统计数据
   * @returns {Object}
   */
  calculateStats() {
    const count = this.state.users.length

    if (count === 0) {
      return {
        total: 0,
        average: 0,
        max: 0,
        leader: '-'
      }
    }

    const total = this.state.users.reduce((sum, user) => sum + user.score, 0)
    const max = Math.max(...this.state.users.map(user => user.score))
    
    // 找到领先者（可能有多个）
    const leaders = this.state.users.filter(user => user.score === max && user.score > 0)
    const leaderName = leaders.length > 0 
      ? (leaders.length === 1 ? leaders[0].name : `${leaders[0].name} 等${leaders.length}人`)
      : '-'

    return {
      total,
      average: total / count,
      max,
      leader: leaderName
    }
  }
}

export default StatsRenderer
