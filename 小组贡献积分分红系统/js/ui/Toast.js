/**
 * Toast 提示组件
 * 提供轻量级的消息提示功能
 */
class Toast {
  constructor() {
    this.container = null
    this.defaultDuration = 3000
    this.icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    }
  }

  /**
   * 显示 Toast 提示
   * @param {string} message - 提示内容
   * @param {string} type - 提示类型：success, error, warning, info
   * @param {number} duration - 显示时长（毫秒）
   */
  show(message, type = 'info', duration = this.defaultDuration) {
    this.removeExisting()

    this.container = this.createToast(message, type)
    document.body.appendChild(this.container)

    this.autoHide(duration)
  }

  /**
   * 创建 Toast 元素
   * @param {string} message - 提示内容
   * @param {string} type - 提示类型
   * @returns {HTMLElement}
   */
  createToast(message, type) {
    const toast = document.createElement('div')
    toast.id = 'toast-notification'
    toast.className = 'toast-notification'
    toast.dataset.type = type

    const icon = this.icons[type] || this.icons.info
    toast.innerHTML = `${icon} ${message}`

    return toast
  }

  /**
   * 移除现有的 Toast
   */
  removeExisting() {
    const existing = document.getElementById('toast-notification')
    if (existing) {
      existing.remove()
    }
  }

  /**
   * 自动隐藏 Toast
   * @param {number} duration - 显示时长
   */
  autoHide(duration) {
    setTimeout(() => {
      if (this.container) {
        this.container.style.animation = 'toastSlideOut 0.3s ease forwards'
        setTimeout(() => {
          if (this.container && this.container.parentNode) {
            this.container.remove()
          }
        }, 300)
      }
    }, duration)
  }

  /**
   * 显示成功提示
   * @param {string} message - 提示内容
   * @param {number} duration - 显示时长
   */
  success(message, duration) {
    this.show(message, 'success', duration)
  }

  /**
   * 显示错误提示
   * @param {string} message - 提示内容
   * @param {number} duration - 显示时长
   */
  error(message, duration) {
    this.show(message, 'error', duration)
  }

  /**
   * 显示警告提示
   * @param {string} message - 提示内容
   * @param {number} duration - 显示时长
   */
  warning(message, duration) {
    this.show(message, 'warning', duration)
  }

  /**
   * 显示信息提示
   * @param {string} message - 提示内容
   * @param {number} duration - 显示时长
   */
  info(message, duration) {
    this.show(message, 'info', duration)
  }
}

export default Toast
