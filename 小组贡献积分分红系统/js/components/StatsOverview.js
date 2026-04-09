class StatsOverview extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  updateStats(stats) {
    const { total, avg, max, leader } = stats;
    
    const totalElement = this.shadowRoot.getElementById('totalScore');
    const avgElement = this.shadowRoot.getElementById('avgScore');
    const maxElement = this.shadowRoot.getElementById('maxScore');
    const leaderElement = this.shadowRoot.getElementById('leaderName');

    if (totalElement) totalElement.textContent = total.toFixed(1);
    if (avgElement) avgElement.textContent = avg.toFixed(1);
    if (maxElement) maxElement.textContent = max.toFixed(1);
    if (leaderElement) leaderElement.textContent = leader || '-';
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .stats-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          padding: 20px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #ebeef5;
          transition: transform 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }

        .stat-card .stat-label {
          font-size: 14px;
          color: #606266;
          margin-bottom: 8px;
        }

        .stat-card .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #409eff;
        }

        .stat-card.total .stat-value {
          color: #67c23a;
        }

        .stat-card.avg .stat-value {
          color: #e6a23c;
        }

        .stat-card.leader .stat-value {
          font-size: 24px;
          color: #f56c6c;
        }

        @media (max-width: 768px) {
          .stats-overview {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .stat-card {
            padding: 16px;
          }
        }

        @media (max-width: 480px) {
          .stats-overview {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="stats-overview">
        <div class="stat-card total">
          <div class="stat-label">团队总积分</div>
          <div class="stat-value" id="totalScore">0</div>
        </div>
        <div class="stat-card avg">
          <div class="stat-label">人均积分</div>
          <div class="stat-value" id="avgScore">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">最高积分</div>
          <div class="stat-value" id="maxScore">0</div>
        </div>
        <div class="stat-card leader">
          <div class="stat-label">当前领先</div>
          <div class="stat-value" id="leaderName">-</div>
        </div>
      </div>
    `;
  }
}

customElements.define('stats-overview', StatsOverview);