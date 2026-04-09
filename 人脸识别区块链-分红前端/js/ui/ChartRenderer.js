/**
 * 图表渲染器
 * 负责所有图表的渲染
 */
class ChartRenderer {
  constructor(state) {
    this.state = state
    this.charts = {
      ratio: null,
      score: null,
      trend: null
    }
  }

  /**
   * 渲染所有图表
   */
  render() {
    this.renderRatioChart()
    this.renderScoreChart()
    this.renderTrendChart()
  }

  /**
   * 渲染积分占比图表
   */
  renderRatioChart() {
    const ctx = document.getElementById('ratioChart')
    if (!ctx) return

    // 销毁旧图表
    if (this.charts.ratio) {
      this.charts.ratio.destroy()
    }

    const total = this.state.users.reduce((sum, user) => sum + user.score, 0)
    
    if (total === 0 || this.state.users.length === 0) {
      this.renderEmptyChart(ctx, '暂无数据', 'ratio')
      return
    }

    const config = this.getRatioChartConfig(total)
    this.charts.ratio = new Chart(ctx, config)
  }

  /**
   * 获取占比图表配置
   * @param {number} total - 总积分
   * @returns {Object}
   */
  getRatioChartConfig(total) {
    const labels = this.state.users.map(u => u.name)
    const data = this.state.users.map(u => u.score)
    const colors = this.state.users.map(u => u.color)

    const type = this.state.currentChartType || 'doughnut'

    const config = {
      type: type,
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '成员积分占比',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              usePointStyle: true,
              font: { size: 12 }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw
                const percentage = total > 0 ? ((value / total * 100).toFixed(1)) : 0
                return `${context.label}: ${value.toFixed(1)} 分 (${percentage}%)`
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8
          }
        }
      }
    }

    // 柱状图特殊配置
    if (type === 'bar') {
      config.options.scales = {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '积分'
          }
        },
        x: {
          title: {
            display: true,
            text: '成员'
          }
        }
      }
    }

    return config
  }

  /**
   * 渲染积分对比柱状图
   */
  renderScoreChart() {
    const ctx = document.getElementById('scoreChart')
    if (!ctx) return

    if (this.charts.score) {
      this.charts.score.destroy()
    }

    if (this.state.users.length === 0) {
      this.renderEmptyChart(ctx, '暂无数据', 'score')
      return
    }

    const sortedUsers = [...this.state.users].sort((a, b) => b.score - a.score)
    const data = sortedUsers.map(u => u.score)
    const labels = sortedUsers.map(u => u.name)
    const colors = sortedUsers.map(u => u.color)

    this.charts.score = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: '积分',
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(c => c),
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '成员积分排名对比',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `积分: ${context.raw.toFixed(1)}`
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            title: {
              display: true,
              text: '积分',
              font: { weight: 'bold' }
            }
          },
          x: {
            grid: {
              display: false
            },
            title: {
              display: true,
              text: '成员（按积分排序）',
              font: { weight: 'bold' }
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    })
  }

  /**
   * 渲染趋势图表
   */
  renderTrendChart() {
    this.updateTrendChart()
  }

  /**
   * 更新趋势图表
   */
  updateTrendChart() {
    const ctx = document.getElementById('trendChart')
    if (!ctx) return

    if (this.charts.trend) {
      this.charts.trend.destroy()
    }

    const userFilter = document.getElementById('trendUser')?.value || 'all'
    const timeRange = document.getElementById('timeRange')?.value || 'all'

    // 筛选数据
    let filteredHistory = [...this.state.scoreHistory]

    // 按成员筛选
    if (userFilter !== 'all') {
      filteredHistory = filteredHistory.filter(h => h.userIndex === parseInt(userFilter))
    }

    // 按时间筛选
    const now = new Date()
    if (timeRange === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filteredHistory = filteredHistory.filter(h => new Date(h.timestamp) >= today)
    } else if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      filteredHistory = filteredHistory.filter(h => new Date(h.timestamp) >= weekAgo)
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      filteredHistory = filteredHistory.filter(h => new Date(h.timestamp) >= monthAgo)
    }

    // 如果没有数据，显示空状态
    if (filteredHistory.length === 0) {
      this.renderEmptyChart(ctx, '暂无积分历史数据', 'trend')
      return
    }

    // 按时间排序
    filteredHistory.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    // 准备时间标签
    const labels = filteredHistory.map(h => {
      const date = new Date(h.timestamp)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    })

    // 准备数据集
    const datasets = this.prepareTrendDatasets(filteredHistory, userFilter)

    this.charts.trend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '积分变化趋势',
            font: { size: 16, weight: 'bold' },
            color: '#2c3e50'
          },
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return context[0].label
              },
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} 分`
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          x: {
            type: 'category',
            title: {
              display: true,
              text: '时间',
              font: { weight: 'bold' }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '积分',
              font: { weight: 'bold' }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeOutQuart'
        }
      }
    })
  }

  /**
   * 准备趋势数据集
   * @param {Array} history - 历史记录
   * @param {string} userFilter - 用户筛选
   * @returns {Array}
   */
  prepareTrendDatasets(history, userFilter) {
    // 格式化时间标签
    const formatTime = (timestamp) => {
      const date = new Date(timestamp)
      return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    if (userFilter !== 'all') {
      // 单个成员
      const userIndex = parseInt(userFilter)
      const user = this.state.users[userIndex]
      
      return [{
        label: user?.name || '成员',
        data: history.map(h => h.totalScore),
        borderColor: user?.color || '#409eff',
        backgroundColor: (user?.color || '#409eff') + '20',
        fill: true,
        tension: 0.4
      }]
    } else {
      // 所有成员
      const userData = new Map()
      
      history.forEach(record => {
        if (!userData.has(record.userIndex)) {
          const user = this.state.users[record.userIndex]
          userData.set(record.userIndex, {
            label: user?.name || record.userName,
            data: [],
            borderColor: user?.color || '#409eff',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.4
          })
        }
        
        userData.get(record.userIndex).data.push(record.totalScore)
      })

      return Array.from(userData.values())
    }
  }

  /**
   * 渲染空图表
   * @param {HTMLCanvasElement} ctx - 画布上下文
   * @param {string} message - 提示消息
   * @param {string} chartKey - 图表键名（ratio, score, trend）
   */
  renderEmptyChart(ctx, message, chartKey) {
    // 先销毁旧图表
    if (chartKey && this.charts[chartKey]) {
      this.charts[chartKey].destroy()
      this.charts[chartKey] = null
    }

    // 使用 Chart.js 渲染空状态
    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: message,
            font: { size: 16 },
            color: '#909399'
          }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    })

    // 保存图表实例
    if (chartKey) {
      this.charts[chartKey] = chart
    }
  }

  /**
   * 切换图表类型
   * @param {string} type - 图表类型
   */
  switchType(type) {
    this.state.currentChartType = type
    this.renderRatioChart()
  }

  /**
   * 调整图表大小
   */
  resize() {
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.resize()
      }
    })
  }
}

export default ChartRenderer
