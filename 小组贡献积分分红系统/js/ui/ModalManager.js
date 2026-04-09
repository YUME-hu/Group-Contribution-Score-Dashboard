/**
 * 模态框管理器
 * 负责管理各种模态框的显示和交互
 */
class ModalManager {
  constructor() {
    this.activeModal = null
  }

  /**
   * 创建模态框基础结构
   * @param {string} title - 标题
   * @returns {Object} 模态框元素对象
   */
  createModal(title) {
    // 移除现有模态框
    this.closeActiveModal()

    // 创建遮罩层
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay'
    overlay.id = 'active-modal'

    // 创建内容容器
    const content = document.createElement('div')
    content.className = 'modal-content'

    // 创建头部
    const header = document.createElement('div')
    header.className = 'modal-header'
    header.innerHTML = `
      <h3 class="modal-title">${title}</h3>
      <button class="modal-close" data-action="close">&times;</button>
    `

    // 创建主体
    const body = document.createElement('div')
    body.className = 'modal-body'

    // 创建底部
    const footer = document.createElement('div')
    footer.className = 'modal-footer'

    content.appendChild(header)
    content.appendChild(body)
    content.appendChild(footer)
    overlay.appendChild(content)

    // 绑定关闭事件
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.dataset.action === 'close') {
        this.closeActiveModal()
      }
    })

    // ESC 键关闭
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        this.closeActiveModal()
        document.removeEventListener('keydown', handleEsc)
      }
    }
    document.addEventListener('keydown', handleEsc)

    this.activeModal = overlay
    return { overlay, content, header, body, footer }
  }

  /**
   * 关闭当前活动的模态框
   */
  closeActiveModal() {
    if (this.activeModal) {
      this.activeModal.remove()
      this.activeModal = null
    }
  }

  /**
   * 显示添加成员模态框
   * @param {Object} options - 配置选项
   */
  showAddMemberModal(options = {}) {
    const { onConfirm } = options
    const modal = this.createModal('👥 添加新成员')

    modal.body.innerHTML = `
      <div class="form-group">
        <label class="form-label">成员名称 *</label>
        <input type="text" class="form-input" id="newMemberName" placeholder="请输入成员名称" maxlength="20">
        <div class="form-error" id="nameError">请输入成员名称</div>
      </div>
      <div class="form-group">
        <label class="form-label">联系方式（可选）</label>
        <input type="text" class="form-input" id="newMemberContact" placeholder="邮箱或电话">
      </div>
    `

    modal.footer.innerHTML = `
      <button class="gray" data-action="close">取消</button>
      <button class="green" id="confirmAddMember">确认添加</button>
    `

    document.body.appendChild(modal.overlay)

    // 聚焦输入框
    setTimeout(() => {
      document.getElementById('newMemberName')?.focus()
    }, 100)

    // 绑定确认事件
    const confirmBtn = document.getElementById('confirmAddMember')
    confirmBtn.addEventListener('click', () => {
      const nameInput = document.getElementById('newMemberName')
      const contactInput = document.getElementById('newMemberContact')
      const nameError = document.getElementById('nameError')

      const name = nameInput.value.trim()
      const contact = contactInput.value.trim()

      if (!name) {
        nameError.classList.add('show')
        nameInput.classList.add('error')
        nameInput.focus()
        return
      }

      nameError.classList.remove('show')
      nameInput.classList.remove('error')

      if (onConfirm && onConfirm(name, contact)) {
        this.closeActiveModal()
      }
    })

    // 回车确认
    document.getElementById('newMemberName')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmBtn.click()
      }
    })
  }

  /**
   * 显示批量管理模态框
   * @param {Object} options - 配置选项
   */
  showBatchManagementModal(options = {}) {
    const { users, onImport, onDelete, onClear } = options
    const modal = this.createModal('📋 批量管理成员')

    const memberCount = users.length
    const totalScore = users.reduce((sum, user) => sum + user.score, 0)

    modal.body.innerHTML = `
      <div class="batch-stats">
        <div class="batch-stat">
          <span class="batch-stat-label">成员数量：</span>
          <span class="batch-stat-value">${memberCount}/15</span>
        </div>
        <div class="batch-stat">
          <span class="batch-stat-label">总积分：</span>
          <span class="batch-stat-value">${totalScore.toFixed(1)}</span>
        </div>
      </div>
      
      <div class="import-section">
        <label class="form-label">批量导入成员</label>
        <textarea class="import-textarea" id="batchImportText" placeholder="每行输入一个成员名称&#10;例如：&#10;张三&#10;李四&#10;王五"></textarea>
        <div class="import-hint">每行一个名称，重复名称将被自动跳过</div>
      </div>
      
      <div class="batch-list">
        ${users.map((user, index) => `
          <div class="batch-item" data-index="${index}">
            <div class="batch-item-info">
              <span class="batch-item-name">${user.name}</span>
              <span class="batch-item-score">${user.score.toFixed(1)} 分</span>
            </div>
            <div class="batch-item-actions">
              <button class="batch-item-btn edit" data-action="edit-member" data-index="${index}">编辑</button>
              <button class="batch-item-btn delete" data-action="delete-member" data-index="${index}" ${users.length <= 1 ? 'disabled' : ''}>删除</button>
            </div>
          </div>
        `).join('')}
      </div>
    `

    modal.footer.innerHTML = `
      <button class="red" id="clearAllMembers" ${users.length <= 1 ? 'disabled' : ''}>清空所有</button>
      <button class="purple" id="batchImportBtn">批量导入</button>
      <button class="gray" data-action="close">关闭</button>
    `

    document.body.appendChild(modal.overlay)

    // 绑定导入事件
    document.getElementById('batchImportBtn')?.addEventListener('click', () => {
      const textarea = document.getElementById('batchImportText')
      const text = textarea.value.trim()
      
      if (!text) {
        return
      }

      const names = text.split('\n').map(n => n.trim()).filter(n => n)
      
      if (onImport) {
        const imported = onImport(names)
        if (imported > 0) {
          textarea.value = ''
          // 刷新模态框
          this.closeActiveModal()
          setTimeout(() => {
            this.showBatchManagementModal(options)
          }, 100)
        }
      }
    })

    // 绑定删除事件
    modal.body.addEventListener('click', (e) => {
      if (e.target.dataset.action === 'delete-member') {
        const index = parseInt(e.target.dataset.index)
        if (onDelete && onDelete(index)) {
          // 刷新模态框
          this.closeActiveModal()
          setTimeout(() => {
            this.showBatchManagementModal(options)
          }, 100)
        }
      }
    })

    // 绑定清空事件
    document.getElementById('clearAllMembers')?.addEventListener('click', () => {
      if (confirm('确定要清空所有成员吗？只会保留第一名成员。')) {
        if (onClear && onClear()) {
          this.closeActiveModal()
        }
      }
    })
  }

  /**
   * 显示加载遮罩
   * @param {string} message - 加载提示文字
   */
  showLoadingMask(message = '处理中...') {
    this.closeActiveModal()

    const mask = document.createElement('div')
    mask.className = 'loading-mask'
    mask.id = 'loading-mask'
    mask.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">${message}</div>
      </div>
    `

    document.body.appendChild(mask)
    this.activeModal = mask
  }

  /**
   * 隐藏加载遮罩
   */
  hideLoadingMask() {
    const mask = document.getElementById('loading-mask')
    if (mask) {
      mask.style.animation = 'fadeOut 0.3s ease forwards'
      setTimeout(() => {
        mask.remove()
        if (this.activeModal === mask) {
          this.activeModal = null
        }
      }, 300)
    }
  }

  /**
   * 显示修改积分模态框
   * @param {Object} options - 配置选项
   */
  showEditScoreModal(options = {}) {
    const { member, currentScore, onConfirm } = options
    const modal = this.createModal(`🔧 修改 ${member.name} 的积分`)

    let newScore = currentScore

    modal.body.innerHTML = `
      <div class="form-group">
        <label class="form-label">当前积分</label>
        <div style="padding: 12px; background: #f5f7fa; border-radius: 8px; font-size: 16px; font-weight: 600; color: #409eff;">
          ${currentScore.toFixed(1)}
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">新积分值 *</label>
        <input type="number" class="form-input" id="newScoreInput" value="${currentScore.toFixed(1)}" step="0.1" min="0">
        <div class="form-error" id="scoreError">请输入有效的积分值</div>
      </div>
      <div class="form-group">
        <label class="form-label">修改原因 *</label>
        <textarea class="form-textarea" id="scoreReason" placeholder="请输入修改积分的原因"></textarea>
        <div class="form-error" id="reasonError">请输入修改原因</div>
      </div>
      <div style="margin-top: 16px; padding: 12px; background: #f0f9eb; border-radius: 8px; border-left: 4px solid #67c23a;">
        <div style="font-size: 14px; color: #67c23a;">
          <strong>提示：</strong>新积分值将直接替换当前积分
        </div>
      </div>
    `

    modal.footer.innerHTML = `
      <button class="gray" data-action="close">取消</button>
      <button class="green" id="confirmEditScore">确认修改</button>
    `

    document.body.appendChild(modal.overlay)

    // 聚焦输入框
    setTimeout(() => {
      document.getElementById('newScoreInput')?.focus()
    }, 100)

    // 绑定确认事件
    const confirmBtn = document.getElementById('confirmEditScore')
    const scoreInput = document.getElementById('newScoreInput')
    const reasonInput = document.getElementById('scoreReason')
    const scoreError = document.getElementById('scoreError')
    const reasonError = document.getElementById('reasonError')

    const validate = () => {
      let isValid = true

      const scoreValue = parseFloat(scoreInput.value)
      if (isNaN(scoreValue) || scoreValue < 0) {
        scoreError.classList.add('show')
        scoreInput.classList.add('error')
        isValid = false
      } else {
        scoreError.classList.remove('show')
        scoreInput.classList.remove('error')
      }

      const reason = reasonInput.value.trim()
      if (!reason) {
        reasonError.classList.add('show')
        reasonInput.classList.add('error')
        isValid = false
      } else {
        reasonError.classList.remove('show')
        reasonInput.classList.remove('error')
      }

      return isValid
    }

    confirmBtn.addEventListener('click', () => {
      if (validate()) {
        const scoreValue = parseFloat(scoreInput.value)
        const reason = reasonInput.value.trim()

        if (onConfirm && onConfirm(scoreValue, reason)) {
          this.closeActiveModal()
        }
      }
    })

    // 回车确认
    scoreInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmBtn.click()
      }
    })
  }

  /**
   * 显示规则配置模态框
   * @param {Object} options - 配置选项
   */
  showConfigModal(options = {}) {
    const { config, onSave } = options
    const modal = this.createModal('⚙️ 规则配置管理')

    modal.body.innerHTML = `
      <!-- 难度系数配置 -->
      <div class="modal-section">
        <h4>📊 积分计算规则</h4>
        <div class="config-group">
          <label>难度系数配置：</label>
          ${Object.entries(config.scoreCalculation.difficultyCoefficients).map(([level, value]) => `
            <div class="config-item">
              <span>等级 ${level}：</span>
              <input type="number" class="difficulty-coeff" data-level="${level}" value="${value}" step="0.1" min="0.1">
            </div>
          `).join('')}
        </div>
        <div class="config-group">
          <label>最小工时：</label>
          <input type="number" id="minHours" value="${config.scoreCalculation.minHours}" step="0.1" min="0.1">
        </div>
      </div>
      
      <!-- 成员等级配置 -->
      <div class="modal-section">
        <h4>🏆 成员等级规则</h4>
        <div class="config-group">
          ${config.memberLevels.levels.map((level, index) => `
            <div class="config-item level-item">
              <h5>等级 ${level.level} - ${level.name}</h5>
              <div class="level-config">
                <span>最低积分：</span>
                <input type="number" class="level-min-score" data-index="${index}" value="${level.minScore}" min="0">
                <span>最高积分：</span>
                <input type="number" class="level-max-score" data-index="${index}" value="${level.maxScore === Infinity ? 99999 : level.maxScore}" min="0">
                <span>系数：</span>
                <input type="number" class="level-coefficient" data-index="${index}" value="${level.coefficient}" step="0.1" min="0.1">
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      
      <!-- 分红规则配置 -->
      <div class="modal-section">
        <h4>💰 分红规则</h4>
        <div class="config-group">
          <label>分红周期（天）：</label>
          <input type="number" id="cycleDays" value="${config.dividend.cycleDays}" min="1">
        </div>
        <div class="config-group">
          <label>最低分红积分阈值：</label>
          <input type="number" id="minScoreThreshold" value="${config.dividend.minScoreThreshold}" min="0">
        </div>
      </div>
      
      <!-- 系统配置 -->
      <div class="modal-section">
        <h4>⚙️ 系统配置</h4>
        <div class="config-group">
          <label>最大成员数量：</label>
          <input type="number" id="maxMembers" value="${config.system.maxMembers}" min="1">
        </div>
      </div>
      
      <!-- 配置历史 -->
      <div class="modal-section">
        <h4>📋 配置变更历史</h4>
        <div id="configHistory" class="config-history">
          ${this.renderConfigHistory()}
        </div>
      </div>
    `

    modal.footer.innerHTML = `
      <button class="blue" id="saveConfigBtn">保存配置</button>
      <button class="gray" data-action="close">取消</button>
    `

    document.body.appendChild(modal.overlay)

    // 绑定事件
    document.getElementById('saveConfigBtn').addEventListener('click', () => {
      const newConfig = JSON.parse(JSON.stringify(config))
      
      // 更新难度系数
      document.querySelectorAll('.difficulty-coeff').forEach(input => {
        const level = input.dataset.level
        newConfig.scoreCalculation.difficultyCoefficients[level] = parseFloat(input.value)
      })
      
      // 更新最小工时
      newConfig.scoreCalculation.minHours = parseFloat(document.getElementById('minHours').value)
      
      // 更新成员等级
      newConfig.memberLevels.levels.forEach((level, index) => {
        level.minScore = parseInt(document.querySelector(`.level-min-score[data-index="${index}"]`).value)
        const maxScoreInput = document.querySelector(`.level-max-score[data-index="${index}"]`)
        level.maxScore = parseInt(maxScoreInput.value) === 99999 ? Infinity : parseInt(maxScoreInput.value)
        level.coefficient = parseFloat(document.querySelector(`.level-coefficient[data-index="${index}"]`).value)
      })
      
      // 更新分红规则
      newConfig.dividend.cycleDays = parseInt(document.getElementById('cycleDays').value)
      newConfig.dividend.minScoreThreshold = parseInt(document.getElementById('minScoreThreshold').value)
      
      // 更新系统配置
      newConfig.system.maxMembers = parseInt(document.getElementById('maxMembers').value)
      
      if (onSave && onSave(newConfig)) {
        this.closeActiveModal()
      }
    })
  }

  /**
   * 渲染配置变更历史
   * @returns {string} 历史记录HTML
   */
  renderConfigHistory() {
    const history = JSON.parse(localStorage.getItem('configHistory') || '[]')
    
    if (history.length === 0) {
      return '<p class="empty-history">暂无配置变更历史</p>'
    }
    
    return history.slice().reverse().map(log => {
      const date = new Date(log.timestamp).toLocaleString('zh-CN')
      return `
        <div class="history-item">
          <div class="history-header">
            <span class="history-date">${date}</span>
            <span class="history-version">版本: ${log.version}</span>
          </div>
          <div class="history-changes">
            ${log.changes.map(change => `<div class="history-change">• ${change}</div>`).join('')}
          </div>
        </div>
      `
    }).join('')
  }
}

export default ModalManager
