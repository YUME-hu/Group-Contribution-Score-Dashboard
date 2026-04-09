class RankList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  updateRanks(users) {
    const sorted = [...users].sort((a, b) => b.score - a.score);
    const rankList = this.shadowRoot.getElementById('rankList');
    
    if (rankList) {
      rankList.innerHTML = '';
      sorted.forEach((user, index) => {
        const div = document.createElement('div');
        let cls = '';
        if (index === 0) cls = 'no1';
        else if (index === 1) cls = 'no2';
        else if (index === 2) cls = 'no3';
        
        div.className = `rank-item ${cls}`;
        div.innerHTML = `
          <span class="rank-number">${index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1)}</span>
          <span class="rank-name">${user.name}</span>
          <span class="rank-score">${user.score.toFixed(1)} 分</span>
        `;
        rankList.appendChild(div);
      });
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .rank-box {
          background: linear-gradient(135deg, #fef5e7 0%, #fdf2e9 100%);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid #f5d0a9;
        }

        .rank-title {
          font-weight: 600;
          font-size: 18px;
          margin-bottom: 14px;
          color: #e6a23c;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rank-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 14px;
          border-bottom: 1px solid #f0e6d3;
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .rank-item:hover {
          background: rgba(255, 255, 255, 0.5);
        }

        .rank-item:last-child {
          border-bottom: none;
        }

        .rank-item.no1 {
          background: linear-gradient(90deg, #fff1e0 0%, #ffe4c4 100%);
          font-weight: bold;
          color: #f56c6c;
          border: 1px solid #f5c6cb;
        }

        .rank-item.no2 {
          background: linear-gradient(90deg, #f9f9f9 0%, #e6f2ff 100%);
          color: #409eff;
          border: 1px solid #b3d9ff;
        }

        .rank-item.no3 {
          background: linear-gradient(90deg, #f0f9eb 0%, #e1f3d8 100%);
          color: #67c23a;
          border: 1px solid #c2e7b0;
        }

        .rank-number {
          font-size: 20px;
          font-weight: bold;
          width: 30px;
        }

        .rank-name {
          flex: 1;
          text-align: left;
          padding-left: 12px;
        }

        .rank-score {
          font-weight: 600;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .rank-box {
            padding: 16px;
          }

          .rank-title {
            font-size: 16px;
          }

          .rank-item {
            padding: 8px 12px;
          }

          .rank-number {
            font-size: 18px;
          }

          .rank-score {
            font-size: 14px;
          }
        }
      </style>
      <div class="rank-box">
        <div class="rank-title">🏆 贡献积分排行榜</div>
        <div id="rankList"></div>
      </div>
    `;
  }
}

customElements.define('rank-list', RankList);