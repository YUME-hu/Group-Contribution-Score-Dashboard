class NavBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .nav-container {
          background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
        }

        .nav-title {
          font-size: 24px;
          font-weight: 600;
          color: white;
          text-align: center;
          margin: 0;
        }

        .nav-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
          margin: 4px 0 0 0;
        }

        @media (max-width: 768px) {
          .nav-title {
            font-size: 20px;
          }
        }
      </style>
      <div class="nav-container">
        <h1 class="nav-title">📊 小组贡献积分统计系统</h1>
        <p class="nav-subtitle">可视化版 | 实时统计 | 数据导出</p>
      </div>
    `;
  }
}

customElements.define('nav-bar', NavBar);