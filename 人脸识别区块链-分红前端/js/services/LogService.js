/**
 * 日志服务
 * 负责操作日志的记录和管理
 */
class LogService {
  constructor(state) {
    this.state = state
  }

  /**
   * 添加日志
   * @param {string} content - 日志内容
   */
  addLog(content) {
    const now = new Date()
    const timeStr = now.toLocaleString('zh-CN')
    const logEntry = `[${timeStr}] ${content}`
    
    this.state.logList.push(logEntry)
    
    // 限制日志数量，保留最近 100 条
    if (this.state.logList.length > 100) {
      this.state.logList = this.state.logList.slice(-100)
    }
  }

  /**
   * 获取所有日志
   * @returns {Array}
   */
  getAllLogs() {
    return [...this.state.logList]
  }

  /**
   * 获取最近的日志
   * @param {number} count - 数量
   * @returns {Array}
   */
  getRecentLogs(count = 10) {
    return this.state.logList.slice(-count)
  }

  /**
   * 清空所有日志
   */
  clearLogs() {
    this.state.logList = []
  }

  /**
   * 获取日志数量
   * @returns {number}
   */
  getLogCount() {
    return this.state.logList.length
  }

  /**
   * 搜索日志
   * @param {string} keyword - 关键词
   * @returns {Array}
   */
  searchLogs(keyword) {
    if (!keyword) {
      return this.getAllLogs()
    }
    
    return this.state.logList.filter(log => 
      log.toLowerCase().includes(keyword.toLowerCase())
    )
  }
}

export default LogService
