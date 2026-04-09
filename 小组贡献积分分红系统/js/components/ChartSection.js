class ChartSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.currentChartType = 'doughnut';
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    const chartBtns = this.shadowRoot.querySelectorAll('.chart-btn');
    chartBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = btn.dataset.type;
        if (type) {
          this.currentChartType = type;
          this.updateChartButtons(type);
          this.dispatchEvent(new CustomEvent('chartTypeChange', { detail: { type } }));
        }
      });
    });

    const trendFilters = this.shadowRoot.querySelectorAll('#trendUser, #timeRange');
    trendFilters.forEach(filter => {
      filter.addEventListener('change', () => {
        this.dispatchEvent(new CustomEvent('trendFilterChange'));
      });
    });
  }

  updateChartButtons(activeType) {
    const chartBtns = this.shadowRoot.querySelectorAll('.chart-btn');
    chartBtns.forEach(btn => {
      if (btn.dataset.type === activeType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  updateTrendUserOptions(users) {
    const select = this.shadowRoot.getElementById('trendUser');
    if (select) {
      select.innerHTML = '<option value="all">全部成员</option>';
      users.forEach((user, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = user.name;
        select.appendChild(option);
      });
    }
  }

  getTrendFilters() {
    const userSelect = this.shadowRoot.getElementById('trendUser');
    const rangeSelect = this.shadowRoot.getElementById('timeRange');
    return {
      user: userSelect ? userSelect.value : 'all',
      range: rangeSelect ? rangeSelect.value : 'all'
    };
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .charts-section {
          background: linear-gradient(135deg, #f8f9fa 0%, #f5f7fa 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e4e7ed;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
        }

        .chart-controls {
          display: flex;
          gap: 8px;
        }

        .chart-btn {
          padding: 6px 14px;
          font-size: 13px;
          border-radius: 6px;
          background: #f5f7fa;
          color: #606266;
          border: 1px solid #dcdfe6;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .chart-btn:hover {
          background: #ecf5ff;
          color: #409eff;
          border-color: #409eff;
        }

        .chart-btn.active {
          background: #409eff;
          color: #fff;
          border-color: #409eff;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .chart-container {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .chart-wrapper {
          height: 300px;
          position: relative;
        }

        /* 趋势图表区域 */
        .trend-section {
          background: linear-gradient(135deg, #f0f9eb 0%, #f5f7fa 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #e1f3d8;
        }

        .trend-container {
          background: #fff;
          border-radius: 12px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .trend-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          flex-wrap: wrap;
          align-items: center;
        }

        .trend-filters label {
          font-weight: 500;
          color: #606266;
        }

        .trend-filters select {
          min-width: 120px;
          padding: 8px 12px;
          border: 1px solid #dcdfe6;
          border-radius: 6px;
          font-size: 14px;
        }

        .chart-wrapper.large {
          height: 400px;
        }

        @media (max-width: 768px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }

          .chart-wrapper {
            height: 250px;
          }

          .chart-wrapper.large {
            height: 300px;
          }

          .section-title {
            flex-direction: column;
            align-items: flex-start;
          }

          .chart-controls {
            width: 100%;
            justify-content: space-between;
          }

          .trend-filters {
            flex-direction: column;
            align-items: stretch;
          }

          .trend-filters select {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .chart-wrapper {
            height: 200px;
          }

          .chart-wrapper.large {
            height: 250px;
          }

          .chart-btn {
            padding: 4px 10px;
            font-size: 12px;
          }
        }
      </style>
      <!-- 图表区域 - 积分占比 -->
      <div class="charts-section">
        <div class="section-title">
          <span>📈 成员积分占比分析</span>
          <div class="chart-controls">
            <button class="chart-btn active" data-type="doughnut" id="btnDoughnut">🍩 环形图</button>
            <button class="chart-btn" data-type="bar" id="btnBar">📊 柱状图</button>
            <button class="chart-btn" data-type="pie" id="btnPie">🥧 饼图</button>
          </div>
        </div>
        <div class="charts-grid">
          <div class="chart-container">
            <div class="chart-wrapper">
              <canvas id="ratioChart"></canvas>
            </div>
          </div>
          <div class="chart-container">
            <div class="chart-wrapper">
              <canvas id="scoreChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 趋势图表区域 -->
      <div class="trend-section">
        <div class="section-title">
          <span>📊 积分变化趋势</span>
        </div>
        <div class="trend-container">
          <div class="trend-filters">
            <label>成员：</label>
            <select id="trendUser">
              <option value="all">全部成员</option>
            </select>
            <label>时间范围：</label>
            <select id="timeRange">
              <option value="all">全部</option>
              <option value="today">今天</option>
              <option value="week">最近7天</option>
              <option value="month">最近30天</option>
            </select>
          </div>
          <div class="chart-wrapper large">
            <canvas id="trendChart"></canvas>
          </div>
        </div>
      </div>
    `;
  }
}

customElements.define('chart-section', ChartSection);