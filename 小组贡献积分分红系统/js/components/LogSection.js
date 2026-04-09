class LogSection extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  updateLogs(logs) {
    const logEl = this.shadowRoot.getElementById('logList');
    if (logEl) {
      if (logs.length === 0) {
        logEl.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">📝</div>
            <div>暂无操作记录</div>
          </div>
        `;
      } else {
        logEl.innerHTML = logs.map(log => `<p>${log}</p>`).join('');
      }
    }
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .log-section {
          background: #f5f7fa;
          border-radius: 12px;
          padding: 20px;
          margin-top: 24px;
        }

        .log-title {
          font-weight: 600;
          font-size: 16px;
          color: #606266;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .log {
          max-height: 300px;
          overflow-y: auto;
          background: #fff;
          border-radius: 8px;
          padding: 12px;
          border: 1px solid #e4e7ed;
        }

        .log p {
          margin: 6px 0;
          font-size: 13px;
          color: #606266;
          padding: 8px 12px;
          background: #f9f9f9;
          border-radius: 6px;
          border-left: 3px solid #409eff;
          transition: background 0.3s ease;
        }

        .log p:hover {
          background: #edf7ff;
        }

        .log p:last-child {
          background: #ecf5ff;
          border-left-color: #67c23a;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #909399;
        }

        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        /* 滚动条样式 */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c0c4cc;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #909399;
        }

        @media (max-width: 768px) {
          .log-section {
            padding: 16px;
          }

          .log {
            max-height: 200px;
          }

          .log p {
            font-size: 12px;
            padding: 6px 10px;
          }
        }
      </style>
      <div class="log-section">
        <div class="log-title">📝 操作日志</div>
        <div class="log" id="logList"></div>
      </div>
    `;
  }
}

customElements.define('log-section', LogSection);