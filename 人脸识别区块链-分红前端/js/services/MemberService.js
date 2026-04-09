/**
 * 成员服务
 * 负责成员数据的增删改查
 */
class MemberService {
  constructor(state, colorPalette) {
    this.state = state
    this.colorPalette = colorPalette
  }

  /**
   * 获取所有成员
   * @returns {Array}
   */
  getAllMembers() {
    return this.state.users
  }

  /**
   * 根据索引获取成员
   * @param {number} index - 成员索引
   * @returns {Object|null}
   */
  getMemberByIndex(index) {
    if (index < 0 || index >= this.state.users.length) {
      return null
    }
    return this.state.users[index]
  }

  /**
   * 添加新成员
   * @param {Object} member - 成员对象
   * @returns {number} 新成员的索引
   */
  addMember(member) {
    // 确保成员有颜色
    if (!member.color) {
      member.color = this.colorPalette[this.state.users.length % this.colorPalette.length]
    }

    // 确保成员有积分
    if (typeof member.score !== 'number') {
      member.score = 0
    }

    this.state.users.push(member)
    return this.state.users.length - 1
  }

  /**
   * 删除成员（事务性操作）
   * @param {number} index - 成员索引
   * @returns {Object|null} 被删除的成员
   * @throws {Error} 当删除条件不满足时抛出错误
   */
  deleteMember(index) {
    // 参数验证
    if (typeof index !== 'number' || isNaN(index)) {
      throw new Error('无效的索引参数')
    }

    if (index < 0 || index >= this.state.users.length) {
      throw new Error(`索引 ${index} 超出范围，当前成员数: ${this.state.users.length}`)
    }

    // 业务规则验证
    if (this.state.users.length <= 1) {
      throw new Error('至少需要保留一名成员，无法删除最后一名成员')
    }

    const memberToDelete = this.state.users[index]
    if (!memberToDelete) {
      throw new Error(`索引 ${index} 处的成员不存在`)
    }

    // 创建备份（用于可能的回滚）
    const backup = [...this.state.users]
    
    try {
      // 执行删除操作
      const deletedMember = this.state.users.splice(index, 1)[0]
      
      // 验证删除结果
      if (!deletedMember) {
        // 回滚到备份状态
        this.state.users = backup
        throw new Error('删除操作失败，已回滚到之前的状态')
      }

      // 验证数据一致性
      if (this.state.users.length !== backup.length - 1) {
        // 回滚到备份状态
        this.state.users = backup
        throw new Error('删除后数据不一致，已回滚到之前的状态')
      }

      return deletedMember
    } catch (error) {
      // 确保任何异常都回滚到备份状态
      this.state.users = backup
      throw error
    }
  }

  /**
   * 更新成员积分
   * @param {number} index - 成员索引
   * @param {number} delta - 积分变化量
   * @returns {Object} 更新后的成员
   */
  updateMemberScore(index, delta) {
    const member = this.getMemberByIndex(index)
    if (!member) {
      throw new Error('成员不存在')
    }

    member.score += delta
    return member
  }

  /**
   * 更新成员名称
   * @param {number} index - 成员索引
   * @param {string} name - 新名称
   * @returns {Object} 更新后的成员
   */
  updateMemberName(index, name) {
    const member = this.getMemberByIndex(index)
    if (!member) {
      throw new Error('成员不存在')
    }

    // 检查名称是否重复
    const isDuplicate = this.state.users.some((user, i) => 
      i !== index && user.name === name
    )
    
    if (isDuplicate) {
      throw new Error('该成员名称已存在')
    }

    member.name = name
    return member
  }

  /**
   * 获取成员总数
   * @returns {number}
   */
  getMemberCount() {
    return this.state.users.length
  }

  /**
   * 计算总积分
   * @returns {number}
   */
  getTotalScore() {
    return this.state.users.reduce((sum, member) => sum + member.score, 0)
  }

  /**
   * 获取平均积分
   * @returns {number}
   */
  getAverageScore() {
    const count = this.getMemberCount()
    if (count === 0) return 0
    return this.getTotalScore() / count
  }

  /**
   * 获取最高积分
   * @returns {number}
   */
  getMaxScore() {
    if (this.state.users.length === 0) return 0
    return Math.max(...this.state.users.map(member => member.score))
  }

  /**
   * 获取当前领先者
   * @returns {Object|null}
   */
  getLeader() {
    if (this.state.users.length === 0) return null
    return this.state.users.reduce((max, member) => 
      member.score > max.score ? member : max
    )
  }

  /**
   * 按积分排序获取成员
   * @returns {Array}
   */
  getSortedMembers() {
    return [...this.state.users].sort((a, b) => b.score - a.score)
  }

  /**
   * 检查成员名称是否已存在
   * @param {string} name - 成员名称
   * @param {number} excludeIndex - 排除的索引（用于编辑时）
   * @returns {boolean}
   */
  isNameExists(name, excludeIndex = -1) {
    return this.state.users.some((user, index) => 
      index !== excludeIndex && user.name === name
    )
  }
}

export default MemberService
