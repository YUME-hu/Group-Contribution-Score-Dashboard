import EventManager from './EventManager.js'
import StorageService from '../services/StorageService.js'
import MemberService from '../services/MemberService.js'
import ScoreService from '../services/ScoreService.js'
import LogService from '../services/LogService.js'
import MemberRenderer from '../ui/MemberRenderer.js'
import ChartRenderer from '../ui/ChartRenderer.js'
import RankRenderer from '../ui/RankRenderer.js'
import StatsRenderer from '../ui/StatsRenderer.js'
import LogRenderer from '../ui/LogRenderer.js'
import Toast from '../ui/Toast.js'
import ModalManager from '../ui/ModalManager.js'
import config from '../config.js'

/**
 * 应用主类
 * 负责应用初始化、模块组装和事件协调
 */
class App {
  constructor() {
    // 应用状态
    this.state = {
      users: [],
      logList: [],
      scoreHistory: [],
      currentScore: 0,
      currentChartType: 'doughnut'
    }

    // 颜色调色板
  this.colorPalette = config.ui.colorPalette

  // 难度系数
  this.levelCoeff = config.scoreCalculation.difficultyCoefficients

    // 事件管理器
    this.eventManager = new EventManager()

    // 服务层
    this.services = {}

    // 渲染层
    this.renderers = {}

    // UI组件
    this.toast = null
    this.modalManager = null
  }

  /**
   * 初始化应用
   */
  async init() {
    try {
      // 初始化服务层
      this.initServices()

      // 初始化渲染层
      this.initRenderers()

      // 初始化UI组件
      this.toast = new Toast()
      this.modalManager = new ModalManager()

      // 加载数据
      await this.loadData()

      // 绑定事件
      this.bindEvents()

      // 初始渲染
      this.render()

      // 初始化积分计算
      this.handleScoreCalculation()

      console.log('应用初始化完成')
    } catch (error) {
      console.error('应用初始化失败:', error)
      this.toast.show('应用初始化失败，请刷新页面重试', 'error')
    }
  }

  /**
   * 初始化服务层
   */
  initServices() {
    this.services.storage = new StorageService()
    this.services.member = new MemberService(this.state, this.colorPalette)
    this.services.score = new ScoreService(this.state, this.levelCoeff)
    this.services.log = new LogService(this.state)
  }

  /**
   * 初始化渲染层
   */
  initRenderers() {
    this.renderers.member = new MemberRenderer(this.state, this.eventManager)
    this.renderers.chart = new ChartRenderer(this.state)
    this.renderers.rank = new RankRenderer(this.state)
    this.renderers.stats = new StatsRenderer(this.state)
    this.renderers.log = new LogRenderer(this.state)
  }

  /**
   * 加载数据
   */
  async loadData() {
    const data = this.services.storage.load()
    if (data) {
      this.state.users = data.users || []
      this.state.logList = data.logList || []
      this.state.scoreHistory = data.scoreHistory || []
    } else {
      // 初始化默认数据
      this.state.users = [
        { name: '张三', score: 0, color: this.colorPalette[0] },
        { name: '李四', score: 0, color: this.colorPalette[1] },
        { name: '王五', score: 0, color: this.colorPalette[2] }
      ]
      this.services.log.addLog('系统初始化完成')
    }
  }

  /**
   * 保存数据
   */
  saveData() {
    this.services.storage.save({
      users: this.state.users,
      logList: this.state.logList,
      scoreHistory: this.state.scoreHistory
    })
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 成员卡片事件
    this.eventManager.on('member:delete', (index) => {
      this.handleDeleteMember(index)
    })

    this.eventManager.on('member:edit', (index) => {
      this.handleEditMember(index)
    })

    this.eventManager.on('member:update', ({ index, name }) => {
      this.handleUpdateMemberName(index, name)
    })

    this.eventManager.on('member:edit-score', (index) => {
      this.handleEditScore(index)
    })

    // 积分计算事件
    const levelSelect = document.getElementById('level')
    const hourInput = document.getElementById('hour')
    if (levelSelect) {
      levelSelect.addEventListener('change', () => {
        this.handleScoreCalculation()
      })
    }
    if (hourInput) {
      hourInput.addEventListener('input', () => {
        this.handleScoreCalculation()
      })
    }

    // 窗口大小变化
    window.addEventListener('resize', () => {
      this.renderers.chart.resize()
    })
  }

  /**
   * 渲染所有组件
   */
  render() {
    this.renderers.member.render()
    this.renderers.rank.render()
    this.renderers.stats.render()
    this.renderers.log.render()
    this.renderers.chart.render()
    this.updateSelectOptions()
  }

  /**
   * 更新下拉选择框选项
   */
  updateSelectOptions() {
    const userSelect = document.getElementById('user')
    const trendUserSelect = document.getElementById('trendUser')

    if (userSelect) {
      userSelect.innerHTML = ''
      this.state.users.forEach((user, index) => {
        const option = document.createElement('option')
        option.value = index
        option.textContent = user.name
        userSelect.appendChild(option)
      })
    }

    if (trendUserSelect) {
      trendUserSelect.innerHTML = '<option value="all">全部成员</option>'
      this.state.users.forEach((user, index) => {
        const option = document.createElement('option')
        option.value = index
        option.textContent = user.name
        trendUserSelect.appendChild(option)
      })
    }
  }

  /**
   * 处理删除成员
   * @param {number} index - 成员索引
   */
  handleDeleteMember(index) {
    try {
      const member = this.services.member.getMemberByIndex(index)
      if (!member) {
        this.toast.show('成员不存在', 'error')
        return
      }

      if (this.state.users.length <= 1) {
        this.toast.show('至少需要保留一名成员', 'warning')
        return
      }

      // 显示详细的确认对话框
      const confirmMessage = this.createDeleteConfirmMessage(member, index)
      
      if (confirm(confirmMessage)) {
        // 记录删除前的状态
        const deletedMemberInfo = {
          index: index,
          name: member.name,
          score: member.score,
          timestamp: new Date().toISOString()
        }

        // 执行删除操作
        const deletedMember = this.services.member.deleteMember(index)
        
        if (deletedMember) {
          // 记录详细日志
          const logMessage = `删除成员 [ID:${index}] "${deletedMember.name}" (积分: ${deletedMember.score.toFixed(1)})`
          this.services.log.addLog(logMessage)
          
          // 保存数据
          this.saveData()
          
          // 重新渲染
          this.render()
          
          // 显示成功提示
          this.toast.show(`✅ 成员 "${deletedMember.name}" 已成功删除`, 'success')
          
          console.log('成员删除成功:', deletedMemberInfo)
        } else {
          throw new Error('删除操作未返回有效结果')
        }
      }
    } catch (error) {
      console.error('删除成员失败:', error)
      this.toast.show(`❌ 删除失败: ${error.message}`, 'error')
    }
  }

  /**
   * 创建删除确认消息
   * @param {Object} member - 成员对象
   * @param {number} index - 成员索引
   * @returns {string}
   */
  createDeleteConfirmMessage(member, index) {
    const total = this.state.users.reduce((sum, u) => sum + u.score, 0)
    const ratio = total > 0 ? ((member.score / total * 100).toFixed(1)) : 0
    
    return `⚠️ 删除确认

您即将删除以下成员：

📋 成员信息：
• 序号: ${index + 1}
• 姓名: ${member.name}
• 当前积分: ${member.score.toFixed(1)}
• 贡献占比: ${ratio}%

⚡ 此操作不可撤销！

删除后：
• 该成员的所有积分数据将被清除
• 相关历史记录将保留但显示为"已删除成员"
• 排行榜和统计数据将重新计算

确定要删除吗？`
  }

  /**
   * 处理编辑成员
   * @param {number} index - 成员索引
   */
  handleEditMember(index) {
    this.renderers.member.enableEditMode(index)
  }

  /**
   * 处理更新成员名称
   * @param {number} index - 成员索引
   * @param {string} name - 新名称
   */
  handleUpdateMemberName(index, name) {
    try {
      const oldName = this.state.users[index].name
      this.services.member.updateMemberName(index, name)
      this.services.log.addLog(`修改成员名称：${oldName} → ${name}`)
      this.saveData()
      this.render()
      this.toast.show('成员名称已更新', 'success')
    } catch (error) {
      console.error('更新成员名称失败:', error)
      this.toast.show(error.message, 'error')
    }
  }

  /**
   * 处理积分计算
   */
  handleScoreCalculation() {
    const levelSelect = document.getElementById('level')
    const hourInput = document.getElementById('hour')
    const scoreResult = document.getElementById('scoreResult')

    if (!levelSelect || !hourInput || !scoreResult) return

    const level = parseInt(levelSelect.value)
    const hour = parseFloat(hourInput.value) || 0

    // 验证工时
    if (hour < 0.5) {
      hourInput.classList.add('invalid')
      hourInput.classList.remove('valid')
    } else {
      hourInput.classList.add('valid')
      hourInput.classList.remove('invalid')
    }

    // 当工时为0时，积分应为0
    if (hour === 0) {
      this.state.currentScore = 0
      scoreResult.textContent = '0.0'
    } else {
      const validHour = Math.max(0.5, hour)
      const score = this.services.score.calculate(level, validHour)
      this.state.currentScore = score
      scoreResult.textContent = score.toFixed(1)
    }

    scoreResult.classList.add('pulse')
    setTimeout(() => {
      scoreResult.classList.remove('pulse')
    }, 300)
  }

  /**
   * 处理添加积分
   */
  handleAddScore() {
    const userSelect = document.getElementById('user')
    const hourInput = document.getElementById('hour')
    if (!userSelect || !hourInput) return

    const userIndex = parseInt(userSelect.value)
    const score = this.state.currentScore
    const hour = parseFloat(hourInput.value) || 0

    if (isNaN(userIndex) || userIndex < 0 || userIndex >= this.state.users.length) {
      this.toast.show('请选择有效的成员', 'error')
      return
    }

    // 验证工时
    if (hour === 0) {
      this.toast.show('工时为0，无法添加积分', 'warning')
      return
    }

    // 验证积分
    if (score <= 0) {
      this.toast.show('积分值无效，无法添加', 'warning')
      return
    }

    try {
      const member = this.services.member.updateMemberScore(userIndex, score)
      this.services.score.addHistory(userIndex, score, '手动添加')
      this.services.log.addLog(`为 ${member.name} 添加 ${score.toFixed(1)} 积分`)
      this.saveData()
      this.render()
      this.toast.show(`已为 ${member.name} 添加 ${score.toFixed(1)} 积分`, 'success')
    } catch (error) {
      console.error('添加积分失败:', error)
      this.toast.show('添加积分失败', 'error')
    }
  }

  /**
   * 处理扣除积分
   */
  handleSubtractScore() {
    const userSelect = document.getElementById('user')
    if (!userSelect) return

    const userIndex = parseInt(userSelect.value)
    const score = this.state.currentScore

    if (isNaN(userIndex) || userIndex < 0 || userIndex >= this.state.users.length) {
      this.toast.show('请选择有效的成员', 'error')
      return
    }

    const member = this.services.member.getMemberByIndex(userIndex)
    if (!member) {
      this.toast.show('成员不存在', 'error')
      return
    }

    if (member.score < score) {
      this.toast.show(`${member.name} 积分不足，当前积分：${member.score.toFixed(1)}`, 'error')
      return
    }

    try {
      const updatedMember = this.services.member.updateMemberScore(userIndex, -score)
      this.services.score.addHistory(userIndex, -score, '手动扣除')
      this.services.log.addLog(`为 ${updatedMember.name} 扣除 ${score.toFixed(1)} 积分`)
      this.saveData()
      this.render()
      this.toast.show(`已为 ${updatedMember.name} 扣除 ${score.toFixed(1)} 积分`, 'success')
    } catch (error) {
      console.error('扣除积分失败:', error)
      this.toast.show('扣除积分失败', 'error')
    }
  }

  /**
   * 处理修改积分
   * @param {number} index - 成员索引
   */
  handleEditScore(index) {
    const member = this.services.member.getMemberByIndex(index)
    if (!member) {
      this.toast.show('成员不存在', 'error')
      return
    }

    this.modalManager.showEditScoreModal({
      member: member,
      currentScore: member.score,
      onConfirm: (newScore, reason) => {
        try {
          const oldScore = member.score
          const delta = newScore - oldScore

          if (delta === 0) {
            this.toast.show('积分值未变化', 'info')
            return false
          }

          const updatedMember = this.services.member.updateMemberScore(index, delta)
          this.services.score.addHistory(index, delta, `修改积分: ${reason}`)
          this.services.log.addLog(`修改 ${updatedMember.name} 积分：${oldScore.toFixed(1)} → ${newScore.toFixed(1)}，原因：${reason}`)
          this.saveData()
          this.render()
          this.toast.show(`已修改 ${updatedMember.name} 的积分：${oldScore.toFixed(1)} → ${newScore.toFixed(1)}`, 'success')
          return true
        } catch (error) {
          console.error('修改积分失败:', error)
          this.toast.show('修改积分失败', 'error')
          return false
        }
      }
    })
  }

  /**
   * 处理添加成员
   */
  handleAddMember() {
    if (this.state.users.length >= config.system.maxMembers) {
      this.toast.show(`成员数量已达到上限（${config.system.maxMembers}人）`, 'warning')
      return
    }

    this.modalManager.showAddMemberModal({
      onConfirm: (name, contact) => {
        try {
          // 检查名称是否重复
          if (this.state.users.some(user => user.name === name)) {
            this.toast.show('该成员名称已存在', 'error')
            return false
          }

          const newMember = {
            name,
            score: 0,
            color: this.colorPalette[this.state.users.length % this.colorPalette.length],
            contact
          }

          this.services.member.addMember(newMember)
          this.services.log.addLog(`添加新成员：${name}`)
          this.saveData()
          this.render()
          this.toast.show(`成员 "${name}" 添加成功`, 'success')
          return true
        } catch (error) {
          console.error('添加成员失败:', error)
          this.toast.show('添加成员失败', 'error')
          return false
        }
      }
    })
  }

  /**
   * 处理批量管理
   */
  handleBatchManagement() {
    this.modalManager.showBatchManagementModal({
      users: this.state.users,
      onImport: (names) => {
        return this.handleBatchImport(names)
      },
      onDelete: (index) => {
        return this.handleBatchDelete(index)
      },
      onClear: () => {
        return this.handleClearAllMembers()
      }
    })
  }

  /**
   * 处理批量导入
   * @param {string[]} names - 成员名称列表
   */
  handleBatchImport(names) {
    if (this.state.users.length + names.length > config.system.maxMembers) {
      this.toast.show(`导入后成员数量将超过上限（${config.system.maxMembers}人）`, 'error')
      return 0
    }

    const existingNames = new Set(this.state.users.map(user => user.name))
    const validNames = names.filter(name => !existingNames.has(name))
    const duplicateNames = names.filter(name => existingNames.has(name))

    if (duplicateNames.length > 0) {
      this.toast.show(`以下名称已存在，将被跳过：${duplicateNames.join(', ')}`, 'warning')
    }

    if (validNames.length === 0) {
      this.toast.show('没有可导入的新成员', 'info')
      return 0
    }

    validNames.forEach(name => {
      this.services.member.addMember({
        name,
        score: 0,
        color: this.colorPalette[this.state.users.length % this.colorPalette.length]
      })
    })

    this.services.log.addLog(`批量导入 ${validNames.length} 名成员`)
    this.saveData()
    this.render()
    this.toast.show(`成功导入 ${validNames.length} 名成员`, 'success')

    return validNames.length
  }

  /**
   * 处理批量删除
   * @param {number} index - 成员索引
   */
  handleBatchDelete(index) {
    if (this.state.users.length <= 1) {
      this.toast.show('至少需要保留一名成员', 'warning')
      return false
    }

    const member = this.state.users[index]
    this.services.member.deleteMember(index)
    this.services.log.addLog(`删除成员：${member.name}`)
    this.saveData()
    this.render()
    this.toast.show(`成员 "${member.name}" 已删除`, 'success')
    return true
  }

  /**
   * 处理清空所有成员
   */
  handleClearAllMembers() {
    if (this.state.users.length <= 1) {
      this.toast.show('至少需要保留一名成员', 'warning')
      return false
    }

    const firstMember = this.state.users[0]
    this.state.users = [firstMember]
    this.services.log.addLog('清空所有成员，仅保留一名')
    this.saveData()
    this.render()
    this.toast.show('已清空所有成员，仅保留一名', 'success')
    return true
  }

  /**
   * 处理导出 CSV
   */
  handleExportCSV() {
    try {
      const total = this.state.users.reduce((sum, user) => sum + user.score, 0)
      let csvContent = '\uFEFF成员积分统计表\n'
      csvContent += '排名,姓名,积分,贡献占比\n'

      const sorted = [...this.state.users].sort((a, b) => b.score - a.score)
      sorted.forEach((user, index) => {
        const ratio = total > 0 ? (user.score / total * 100).toFixed(1) : 0
        csvContent += `${index + 1},${user.name},${user.score.toFixed(1)},${ratio}%\n`
      })

      csvContent += '\n操作日志\n时间,内容\n'
      this.state.logList.forEach(log => {
        csvContent += log.replace(/\[([^\]]+)\]\s*(.+)/, '$1,$2') + '\n'
      })

      csvContent += '\n积分变动历史\n时间,成员,变动积分,原因,累计积分\n'
      this.state.scoreHistory.forEach(history => {
        const time = new Date(history.timestamp).toLocaleString('zh-CN')
        csvContent += `${time},${history.userName},${history.score},${history.reason},${history.totalScore}\n`
      })

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const today = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')
      a.download = `小组积分记录_${today}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      this.services.log.addLog('导出积分统计表格')
      this.toast.show('CSV 文件已导出', 'success')
    } catch (error) {
      console.error('导出 CSV 失败:', error)
      this.toast.show('导出失败，请重试', 'error')
    }
  }

  /**
   * 处理重置所有积分
   */
  handleResetAll() {
    if (!confirm('确定要清空所有积分吗？此操作不可恢复。')) {
      return
    }

    this.state.users.forEach(user => {
      user.score = 0
    })
    this.state.scoreHistory = []
    this.services.log.addLog('清空所有积分')
    this.saveData()
    this.render()
    this.toast.show('所有积分已清空', 'success')
  }

  /**
   * 处理清空日志
   */
  handleClearLog() {
    if (!confirm('确定要清空所有日志吗？')) {
      return
    }

    this.state.logList = []
    this.saveData()
    this.renderers.log.render()
    this.toast.show('日志已清空', 'success')
  }

  /**
   * 处理撤销操作
   * @param {number} logIndex - 日志索引
   */
  handleUndoOperation(logIndex) {
    if (logIndex < 0 || logIndex >= this.state.logList.length) {
      this.toast.show('无效的操作记录', 'error')
      return
    }

    const log = this.state.logList[logIndex]
    
    // 解析日志内容
    const addMatch = log.match(/为 (.*?) 添加 (.*?) 积分/)
    const subtractMatch = log.match(/为 (.*?) 扣除 (.*?) 积分/)
    const modifyMatch = log.match(/修改 (.*?) 积分：(.*?) → (.*?)，原因：/)

    if (!addMatch && !subtractMatch && !modifyMatch) {
      this.toast.show('该操作无法撤销', 'info')
      return
    }

    if (!confirm(`确定要撤销以下操作吗？\n${log}`)) {
      return
    }

    try {
      if (addMatch) {
        // 撤销添加积分
        const [, name, scoreStr] = addMatch
        const score = parseFloat(scoreStr)
        const userIndex = this.state.users.findIndex(u => u.name === name)
        
        if (userIndex === -1) {
          this.toast.show('成员不存在，无法撤销', 'error')
          return
        }

        const member = this.services.member.updateMemberScore(userIndex, -score)
        this.services.score.addHistory(userIndex, -score, '撤销添加积分')
        this.services.log.addLog(`撤销为 ${member.name} 添加 ${score.toFixed(1)} 积分的操作`)
        this.saveData()
        this.render()
        this.toast.show(`已撤销为 ${member.name} 添加积分的操作`, 'success')

      } else if (subtractMatch) {
        // 撤销扣除积分
        const [, name, scoreStr] = subtractMatch
        const score = parseFloat(scoreStr)
        const userIndex = this.state.users.findIndex(u => u.name === name)
        
        if (userIndex === -1) {
          this.toast.show('成员不存在，无法撤销', 'error')
          return
        }

        const member = this.services.member.updateMemberScore(userIndex, score)
        this.services.score.addHistory(userIndex, score, '撤销扣除积分')
        this.services.log.addLog(`撤销为 ${member.name} 扣除 ${score.toFixed(1)} 积分的操作`)
        this.saveData()
        this.render()
        this.toast.show(`已撤销为 ${member.name} 扣除积分的操作`, 'success')

      } else if (modifyMatch) {
        // 撤销修改积分
        const [, name, oldScoreStr, newScoreStr] = modifyMatch
        const oldScore = parseFloat(oldScoreStr)
        const newScore = parseFloat(newScoreStr)
        const userIndex = this.state.users.findIndex(u => u.name === name)
        
        if (userIndex === -1) {
          this.toast.show('成员不存在，无法撤销', 'error')
          return
        }

        const delta = oldScore - newScore
        const member = this.services.member.updateMemberScore(userIndex, delta)
        this.services.score.addHistory(userIndex, delta, '撤销修改积分')
        this.services.log.addLog(`撤销修改 ${member.name} 积分的操作，恢复至 ${oldScore.toFixed(1)}`)
        this.saveData()
        this.render()
        this.toast.show(`已撤销修改 ${member.name} 积分的操作`, 'success')
      }
    } catch (error) {
      console.error('撤销操作失败:', error)
      this.toast.show('撤销操作失败', 'error')
    }
  }

  /**
   * 处理切换图表类型
   * @param {string} type - 图表类型
   */
  handleSwitchChartType(type) {
    this.state.currentChartType = type
    this.renderers.chart.switchType(type)

    // 更新按钮状态
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.classList.remove('active')
    })
    const activeBtn = document.getElementById(`btn${type.charAt(0).toUpperCase() + type.slice(1)}`)
    if (activeBtn) {
      activeBtn.classList.add('active')
    }
  }

  /**
   * 处理更新趋势图表
   */
  handleUpdateTrendChart() {
    this.renderers.chart.updateTrendChart()
  }

  /**
   * 处理规则配置管理
   */
  handleConfigManagement() {
    this.modalManager.showConfigModal({
      config: JSON.parse(JSON.stringify(config)),
      onSave: (newConfig) => {
        try {
          // 验证配置
          this.validateConfig(newConfig)
          
          // 保存配置变更历史
          this.saveConfigHistory(config, newConfig)
          
          // 更新配置
          Object.assign(config, newConfig)
          
          // 重新初始化服务
          this.initServices()
          
          // 重新渲染
          this.render()
          
          this.toast.show('配置已更新并生效', 'success')
          return true
        } catch (error) {
          this.toast.show(`配置验证失败: ${error.message}`, 'error')
          return false
        }
      }
    })
  }

  /**
   * 验证配置
   * @param {Object} newConfig - 新配置
   */
  validateConfig(newConfig) {
    // 验证难度系数
    if (!newConfig.scoreCalculation || !newConfig.scoreCalculation.difficultyCoefficients) {
      throw new Error('难度系数配置缺失')
    }
    
    // 验证成员等级
    if (!newConfig.memberLevels || !newConfig.memberLevels.levels || newConfig.memberLevels.levels.length === 0) {
      throw new Error('成员等级配置缺失')
    }
    
    // 验证分红规则
    if (!newConfig.dividend || !newConfig.dividend.ratioThresholds || newConfig.dividend.ratioThresholds.length === 0) {
      throw new Error('分红规则配置缺失')
    }
    
    // 验证系统配置
    if (!newConfig.system || newConfig.system.maxMembers < 1) {
      throw new Error('系统配置无效')
    }
  }

  /**
   * 保存配置变更历史
   * @param {Object} oldConfig - 旧配置
   * @param {Object} newConfig - 新配置
   */
  saveConfigHistory(oldConfig, newConfig) {
    const history = JSON.parse(localStorage.getItem('configHistory') || '[]')
    
    const changeLog = {
      timestamp: new Date().toISOString(),
      version: newConfig.version,
      changes: this.generateChangeLog(oldConfig, newConfig)
    }
    
    history.push(changeLog)
    
    // 保留最近10条历史记录
    if (history.length > 10) {
      history.shift()
    }
    
    localStorage.setItem('configHistory', JSON.stringify(history))
  }

  /**
   * 生成配置变更日志
   * @param {Object} oldConfig - 旧配置
   * @param {Object} newConfig - 新配置
   * @returns {Array} 变更日志
   */
  generateChangeLog(oldConfig, newConfig) {
    const changes = []
    
    // 比较难度系数
    const oldDifficulty = oldConfig.scoreCalculation.difficultyCoefficients
    const newDifficulty = newConfig.scoreCalculation.difficultyCoefficients
    
    for (const level in newDifficulty) {
      if (oldDifficulty[level] !== newDifficulty[level]) {
        changes.push(`难度系数 ${level} 级: ${oldDifficulty[level]} → ${newDifficulty[level]}`)
      }
    }
    
    // 比较成员等级
    const oldLevels = oldConfig.memberLevels.levels
    const newLevels = newConfig.memberLevels.levels
    
    if (oldLevels.length !== newLevels.length) {
      changes.push(`成员等级数量: ${oldLevels.length} → ${newLevels.length}`)
    } else {
      oldLevels.forEach((oldLevel, index) => {
        const newLevel = newLevels[index]
        if (JSON.stringify(oldLevel) !== JSON.stringify(newLevel)) {
          changes.push(`成员等级 ${oldLevel.level} 配置变更`)
        }
      })
    }
    
    // 比较分红规则
    const oldDividend = oldConfig.dividend
    const newDividend = newConfig.dividend
    
    if (oldDividend.cycleDays !== newDividend.cycleDays) {
      changes.push(`分红周期: ${oldDividend.cycleDays} → ${newDividend.cycleDays} 天`)
    }
    
    if (oldDividend.minScoreThreshold !== newDividend.minScoreThreshold) {
      changes.push(`最低分红积分阈值: ${oldDividend.minScoreThreshold} → ${newDividend.minScoreThreshold}`)
    }
    
    // 比较系统配置
    if (oldConfig.system.maxMembers !== newConfig.system.maxMembers) {
      changes.push(`最大成员数量: ${oldConfig.system.maxMembers} → ${newConfig.system.maxMembers}`)
    }
    
    return changes
  }
}

export default App
