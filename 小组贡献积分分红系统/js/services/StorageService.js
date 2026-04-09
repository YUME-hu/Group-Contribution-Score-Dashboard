/**
 * 存储服务
 * 负责数据的持久化和加载
 */
class StorageService {
  constructor() {
    this.storageKey = 'groupScoreDataV2'
  }

  /**
   * 保存数据到 localStorage
   * @param {Object} data - 要保存的数据
   */
  save(data) {
    try {
      const serialized = JSON.stringify(data)
      localStorage.setItem(this.storageKey, serialized)
      return true
    } catch (error) {
      console.error('保存数据失败:', error)
      return false
    }
  }

  /**
   * 从 localStorage 加载数据
   * @returns {Object|null} 加载的数据或 null
   */
  load() {
    try {
      const serialized = localStorage.getItem(this.storageKey)
      if (!serialized) {
        return null
      }
      return JSON.parse(serialized)
    } catch (error) {
      console.error('加载数据失败:', error)
      return null
    }
  }

  /**
   * 清除所有数据
   */
  clear() {
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('清除数据失败:', error)
      return false
    }
  }

  /**
   * 检查是否有保存的数据
   * @returns {boolean}
   */
  hasData() {
    return localStorage.getItem(this.storageKey) !== null
  }
}

export default StorageService
