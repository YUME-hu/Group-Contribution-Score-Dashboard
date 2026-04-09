/**
 * 成员渲染器
 * 负责成员卡片的渲染和交互
 */
class MemberRenderer {
  constructor(state, eventManager) {
    this.state = state
    this.eventManager = eventManager
    this.container = document.getElementById('membersBox')
    this.editingIndex = -1
    this.eventsBound = false
  }

  /**
   * 渲染成员列表
   */
  render() {
    if (!this.container) return

    this.container.innerHTML = ''

    if (this.state.users.length === 0) {
      this.renderEmptyState()
    } else {
      this.renderMembers()
    }

    // 只绑定一次事件
    if (!this.eventsBound) {
      this.bindEvents()
      this.eventsBound = true
    }
  }

  /**
   * 渲染空状态
   */
  renderEmptyState() {
    this.container.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <div class="empty-state-icon">👥</div>
        <div style="font-size: 18px; font-weight: 600; color: #6c757d; margin-bottom: 12px;">暂无成员</div>
        <div style="font-size: 14px; color: #adb5bd; margin-bottom: 24px;">点击下方按钮添加成员开始统计</div>
        <button onclick="window.app.handleAddMember()" style="padding: 12px 24px; background: #409eff; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;">
          👥 添加成员
        </button>
      </div>
    `
  }

  /**
   * 渲染成员卡片
   */
  renderMembers() {
    const total = this.calculateTotal()

    this.state.users.forEach((member, index) => {
      const memberCard = this.createMemberCard(member, index, total)
      memberCard.style.animation = `fadeIn 0.5s ease forwards`
      memberCard.style.animationDelay = `${index * 0.1}s`
      this.container.appendChild(memberCard)
    })
  }

  /**
   * 创建成员卡片
   * @param {Object} member - 成员对象
   * @param {number} index - 成员索引
   * @param {number} total - 总积分
   * @returns {HTMLElement}
   */
  createMemberCard(member, index, total) {
    const card = document.createElement('div')
    card.className = 'member'
    card.dataset.index = index

    const ratio = total > 0 ? ((member.score / total * 100).toFixed(1)) : 0

    card.innerHTML = `
      <div class="member-header">
        <div class="name" data-action="edit" data-index="${index}">
          <span class="name-text">${member.name}</span>
          <span class="edit-icon">✏️</span>
        </div>
        <div style="display: flex; gap: 4px;">
          <button class="delete-btn" data-action="edit-score" data-index="${index}" 
            title="修改积分">
            🔧
          </button>
          <button class="delete-btn" data-action="delete" data-index="${index}" 
            ${this.state.users.length <= 1 ? 'disabled' : ''} title="删除成员">
            🗑️
          </button>
        </div>
      </div>
      <div class="score">${member.score.toFixed(1)}</div>
      <div class="ratio">占比 ${ratio}%</div>
    `

    return card
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return

    this.container.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]')
      if (!target) return

      const action = target.dataset.action
      const index = parseInt(target.dataset.index)

      if (action === 'delete') {
        this.eventManager.emit('member:delete', index)
      } else if (action === 'edit') {
        this.eventManager.emit('member:edit', index)
      } else if (action === 'edit-score') {
        this.eventManager.emit('member:edit-score', index)
      }
    })
  }

  /**
   * 启用编辑模式
   * @param {number} index - 成员索引
   */
  enableEditMode(index) {
    if (this.editingIndex !== -1) {
      this.disableEditMode()
    }

    this.editingIndex = index
    const card = this.container.querySelector(`[data-index="${index}"]`)
    if (!card) return

    const nameEl = card.querySelector('.name')
    const member = this.state.users[index]

    nameEl.innerHTML = `
      <input type="text" class="name-input" value="${member.name}" maxlength="20">
      <div class="edit-actions">
        <button class="edit-btn confirm" data-action="confirm-edit">✓</button>
        <button class="edit-btn cancel" data-action="cancel-edit">✕</button>
      </div>
    `

    const input = nameEl.querySelector('.name-input')
    input.focus()
    input.select()

    // 绑定编辑事件
    const confirmBtn = nameEl.querySelector('[data-action="confirm-edit"]')
    const cancelBtn = nameEl.querySelector('[data-action="cancel-edit"]')

    const confirmEdit = () => {
      const newName = input.value.trim()
      if (newName && newName !== member.name) {
        this.eventManager.emit('member:update', { index, name: newName })
      } else {
        this.disableEditMode()
      }
    }

    const cancelEdit = () => {
      this.disableEditMode()
    }

    confirmBtn.addEventListener('click', confirmEdit)
    cancelBtn.addEventListener('click', cancelEdit)

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        confirmEdit()
      } else if (e.key === 'Escape') {
        cancelEdit()
      }
    })

    input.addEventListener('blur', () => {
      // 延迟处理，以便点击按钮事件先触发
      setTimeout(() => {
        if (this.editingIndex === index) {
          confirmEdit()
        }
      }, 200)
    })
  }

  /**
   * 禁用编辑模式
   */
  disableEditMode() {
    if (this.editingIndex === -1) return

    const index = this.editingIndex
    this.editingIndex = -1

    const card = this.container.querySelector(`[data-index="${index}"]`)
    if (!card) return

    const nameEl = card.querySelector('.name')
    const member = this.state.users[index]

    nameEl.innerHTML = `
      <span class="name-text">${member.name}</span>
      <span class="edit-icon">✏️</span>
    `
  }

  /**
   * 计算总积分
   * @returns {number}
   */
  calculateTotal() {
    return this.state.users.reduce((sum, member) => sum + member.score, 0)
  }
}

export default MemberRenderer
