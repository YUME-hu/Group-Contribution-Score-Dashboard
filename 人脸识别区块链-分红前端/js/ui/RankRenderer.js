/**
 * 排行榜渲染器
 * 负责排行榜的渲染
 */
class RankRenderer {
  constructor(state) {
    this.state = state
    this.container = document.getElementById('rankList')
  }

  /**
   * 渲染排行榜
   */
  render() {
    if (!this.container) return

    this.container.innerHTML = ''

    if (this.state.users.length === 0) {
      this.renderEmptyState()
      return
    }

    const sorted = this.getSortedMembers()

    sorted.forEach((member, index) => {
      const rankItem = this.createRankItem(member, index)
      this.container.appendChild(rankItem)
    })
  }

  /**
   * 渲染空状态
   */
  renderEmptyState() {
    this.container.innerHTML = `
      <div class="rank-item" style="justify-content: center; color: #909399;">
        暂无数据
      </div>
    `
  }

  /**
   * 创建排行榜项
   * @param {Object} member - 成员对象
   * @param {number} rank - 排名
   * @returns {HTMLElement}
   */
  createRankItem(member, rank) {
    const div = document.createElement('div')
    
    let rankClass = ''
    let rankIcon = ''
    
    if (rank === 0) {
      rankClass = 'no1'
      rankIcon = '👑'
    } else if (rank === 1) {
      rankClass = 'no2'
      rankIcon = '🥈'
    } else if (rank === 2) {
      rankClass = 'no3'
      rankIcon = '🥉'
    }

    div.className = `rank-item ${rankClass}`
    div.innerHTML = `
      <span class="rank-number">${rankIcon || (rank + 1)}</span>
      <span class="rank-name">${member.name}</span>
      <span class="rank-score">${member.score.toFixed(1)} 分</span>
    `

    return div
  }

  /**
   * 获取排序后的成员列表
   * @returns {Array}
   */
  getSortedMembers() {
    return [...this.state.users].sort((a, b) => b.score - a.score)
  }
}

export default RankRenderer
