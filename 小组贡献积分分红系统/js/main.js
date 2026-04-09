import App from './core/App.js'

/**
 * 应用入口
 * 初始化并启动应用
 */
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // 创建应用实例
    const app = new App()
    
    // 将应用实例挂载到全局，以便 HTML 中的事件处理器可以访问
    window.app = app
    
    // 初始化应用
    await app.init()
    
    console.log('🚀 小组贡献积分统计系统已启动')
  } catch (error) {
    console.error('应用启动失败:', error)
    
    // 显示错误提示
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #f56c6c;
      color: white;
      padding: 20px 40px;
      border-radius: 8px;
      font-size: 16px;
      z-index: 10000;
      text-align: center;
    `
    errorDiv.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">😢</div>
      <div>应用启动失败</div>
      <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">请刷新页面重试</div>
    `
    document.body.appendChild(errorDiv)
  }
})

/**
 * 全局错误处理
 */
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的 Promise 拒绝:', event.reason)
})
