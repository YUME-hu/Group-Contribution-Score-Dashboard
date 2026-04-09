/**
 * 验证工具函数
 */

/**
 * 验证成员名称
 * @param {string} name - 成员名称
 * @param {Array} existingUsers - 现有用户列表
 * @param {number} excludeIndex - 排除的索引
 * @returns {Object} 验证结果 { valid: boolean, message: string }
 */
export function validateMemberName(name, existingUsers = [], excludeIndex = -1) {
  if (!name || name.trim() === '') {
    return { valid: false, message: '请输入成员名称' }
  }

  const trimmedName = name.trim()

  if (trimmedName.length > 20) {
    return { valid: false, message: '成员名称不能超过20个字符' }
  }

  // 检查是否包含特殊字符
  const specialChars = /[<>"'&]/
  if (specialChars.test(trimmedName)) {
    return { valid: false, message: '成员名称不能包含特殊字符' }
  }

  // 检查是否重复
  const isDuplicate = existingUsers.some((user, index) =>
    index !== excludeIndex && user.name === trimmedName
  )

  if (isDuplicate) {
    return { valid: false, message: '该成员名称已存在' }
  }

  return { valid: true, message: '' }
}

/**
 * 验证工时输入
 * @param {number} hour - 工时
 * @returns {Object} 验证结果
 */
export function validateHour(hour) {
  const numHour = parseFloat(hour)

  if (isNaN(numHour)) {
    return { valid: false, message: '请输入有效的数字' }
  }

  if (numHour < 0.5) {
    return { valid: false, message: '工时不能小于0.5小时' }
  }

  if (numHour > 999) {
    return { valid: false, message: '工时不能超过999小时' }
  }

  return { valid: true, message: '', value: numHour }
}

/**
 * 验证难度等级
 * @param {number} level - 难度等级
 * @returns {Object} 验证结果
 */
export function validateLevel(level) {
  const numLevel = parseInt(level)
  const validLevels = [1, 2, 3, 4, 5]

  if (!validLevels.includes(numLevel)) {
    return { valid: false, message: '请选择有效的难度等级' }
  }

  return { valid: true, message: '', value: numLevel }
}

/**
 * 验证成员索引
 * @param {number} index - 成员索引
 * @param {number} totalCount - 成员总数
 * @returns {Object} 验证结果
 */
export function validateMemberIndex(index, totalCount) {
  const numIndex = parseInt(index)

  if (isNaN(numIndex) || numIndex < 0 || numIndex >= totalCount) {
    return { valid: false, message: '无效的成员索引' }
  }

  return { valid: true, message: '', value: numIndex }
}

/**
 * 验证积分变化量
 * @param {number} score - 积分变化量
 * @returns {Object} 验证结果
 */
export function validateScoreDelta(score) {
  const numScore = parseFloat(score)

  if (isNaN(numScore)) {
    return { valid: false, message: '请输入有效的积分' }
  }

  if (numScore <= 0) {
    return { valid: false, message: '积分必须大于0' }
  }

  if (numScore > 10000) {
    return { valid: false, message: '单次添加积分不能超过10000' }
  }

  return { valid: true, message: '', value: numScore }
}
