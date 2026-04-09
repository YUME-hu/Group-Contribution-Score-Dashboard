/**
 * 日志渲染器
 * 负责日志区域的渲染
 */
class LogRenderer {
  constructor(state) {
    this.state = state
    this.container = document.getElementById('logList')
  }

  /**
   * 渲染日志
   */
  render() {
    if (!this.container) return

    this.container.innerHTML = ''

    if (this.state.logList.length === 0) {
      this.renderEmptyState()
      return
    }

    // 显示最近 50 条日志，倒序排列
    const recentLogs = [...this.state.logList].slice(-50).reverse()

    recentLogs.forEach((log, index) => {
      // 计算原始日志索引（从后往前）
      const originalIndex = this.state.logList.length - 1 - index
      const logItem = this.createLogItem(log, index === 0, originalIndex)
      this.container.appendChild(logItem)
    })

    // 滚动到底部
    this.container.scrollTop = this.container.scrollHeight
  }

  /**
   * 渲染空状态
   */
  renderEmptyState() {
    this.container.innerHTML = `
      <p style="text-align: center; color: #909399; padding: 20px;">
        暂无操作记录
      </p>
    `
  }

  /**
   * 创建日志项
   * @param {string} log - 日志内容
   * @param {boolean} isLatest - 是否是最新日志
   * @returns {HTMLElement}
   */
  createLogItem(log, isLatest, index) {
    const p = document.createElement('div')
    p.style.display = 'flex'
    p.style.justifyContent = 'space-between'
    p.style.alignItems = 'center'
    p.style.margin = '6px 0'
    p.style.fontSize = '13px'
    p.style.color = '#606266'
    p.style.padding = '8px 12px'
    p.style.background = '#f9f9f9'
    p.style.borderRadius = '6px'
    p.style.borderLeft = '3px solid #409eff'
    
    if (isLatest) {
      p.style.background = '#ecf5ff'
      p.style.borderLeftColor = '#67c23a'
    }

    // 检查是否是可撤销的操作
    const isUndoable = log.includes('添加') || log.includes('扣除') || log.includes('修改')
    
    p.innerHTML = `
      <span>${log}</span>
      ${isUndoable ? `
        <button onclick="window.app.handleUndoOperation(${index})" 
          style="background: #ecf5ff; color: #409eff; border: 1px solid #d0e8ff; border-radius: 4px; padding: 2px 8px; font-size: 12px; cursor: pointer; transition: all 0.3s ease;">
          撤销
        </button>
      ` : ''}
    `

    return p
  }
}

export default LogRenderer
