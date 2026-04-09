class MemberCards extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    const container = this.shadowRoot.getElementById('membersBox');
    if (container) {
      container.addEventListener('click', (e) => {
        const target = e.target.closest('[data-action]');
        if (target) {
          const action = target.dataset.action;
          const index = parseInt(target.dataset.index);
          if (!isNaN(index)) {
            this.dispatchEvent(new CustomEvent('memberAction', { detail: { action, index } }));
          }
        }
      });
    }
  }

  updateMembers(users) {
    const box = this.shadowRoot.getElementById('membersBox');
    if (box) {
      box.innerHTML = '';
      
      if (users.length === 0) {
        box.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">👥</div>
            <div>暂无成员</div>
            <div style="font-size: 14px; color: #909399; margin-top: 8px;">点击添加成员开始统计</div>
          </div>
        `;
        return;
      }

      const total = users.reduce((sum, u) => sum + u.score, 0);
      
      users.forEach((user, index) => {
        const div = document.createElement('div');
        div.className = 'member';
        div.id = `member-${index}`;
        div.style.animation = 'fadeIn 0.5s ease forwards';
        div.style.animationDelay = `${index * 0.1}s`;
        const ratio = total > 0 ? ((user.score / total * 100).toFixed(1)) : 0;
        
        div.innerHTML = `
          <div class="member-header">
            <div class="name" data-action="edit" data-index="${index}">
              <span class="name-text">${user.name}</span>
              <span class="edit-icon">✏️</span>
            </div>
            <button class="delete-btn" data-action="delete" data-index="${index}" ${users.length <= 1 ? 'disabled' : ''} title="删除成员">🗑️</button>
          </div>
          <div class="score">${user.score.toFixed(1)}</div>
          <div class="ratio">占比 ${ratio}%</div>
        `;
        box.appendChild(div);
      });
    }
  }

  enableEditMode(index) {
    const memberCard = this.shadowRoot.getElementById(`member-${index}`);
    if (!memberCard) return;
    
    const nameElement = memberCard.querySelector('.name');
    const user = this.users[index];
    if (!user) return;
    
    nameElement.innerHTML = `
      <div class="edit-mode">
        <input type="text" class="name-input" value="${user.name}" placeholder="请输入成员名称">
        <div class="edit-actions">
          <button class="edit-btn confirm" data-action="update" data-index="${index}">确定</button>
          <button class="edit-btn cancel" data-action="cancelEdit" data-index="${index}">取消</button>
        </div>
      </div>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .members {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .member {
          background: linear-gradient(135deg, #fff 0%, #f8f9fa 100%);
          padding: 18px;
          border-radius: 12px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
          border: 1px solid #ebeef5;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .member::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #409eff, #67c23a);
        }

        .member:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        }

        .member-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          width: 100%;
        }

        .member .name {
          font-weight: 600;
          color: #2c3e50;
          font-size: 16px;
          cursor: pointer;
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          padding: 4px 8px;
          border-radius: 6px;
          flex: 1;
          text-align: left;
          justify-content: flex-start;
        }

        .delete-btn {
          background: #f56c6c;
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          opacity: 0;
          margin-left: 8px;
        }

        .member:hover .delete-btn {
          opacity: 1;
        }

        .delete-btn:hover:not(:disabled) {
          background: #f78989;
          transform: scale(1.1);
          box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
        }

        .delete-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .member .name:hover {
          background: rgba(64, 158, 255, 0.1);
          transform: translateY(-1px);
        }

        .member .name .edit-icon {
          font-size: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .member .name:hover .edit-icon {
          opacity: 1;
        }

        /* 编辑模式样式 */
        .edit-mode {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 8px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 2px solid #409eff;
          animation: fadeIn 0.3s ease forwards;
        }

        .name-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #dcdfe6;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          text-align: center;
        }

        .name-input:focus {
          outline: none;
          border-color: #409eff;
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
        }

        .edit-actions {
          display: flex;
          gap: 6px;
          justify-content: center;
        }

        .edit-btn {
          padding: 4px 12px;
          font-size: 12px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .edit-btn.confirm {
          background: #67c23a;
          color: #fff;
        }

        .edit-btn.confirm:hover {
          background: #85ce61;
          transform: translateY(-1px);
        }

        .edit-btn.cancel {
          background: #909399;
          color: #fff;
        }

        .edit-btn.cancel:hover {
          background: #a6a9ad;
          transform: translateY(-1px);
        }

        .member .score {
          font-size: 28px;
          color: #409eff;
          font-weight: bold;
          margin-bottom: 6px;
        }

        .member .ratio {
          font-size: 13px;
          color: #909399;
          background: #f4f4f5;
          padding: 4px 10px;
          border-radius: 12px;
          display: inline-block;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        @media (max-width: 768px) {
          .members {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }

          .member {
            padding: 12px;
          }

          .member .score {
            font-size: 24px;
          }
        }

        @media (max-width: 480px) {
          .members {
            grid-template-columns: 1fr;
          }
        }
      </style>
      <div class="members" id="membersBox"></div>
    `;
  }
}

customElements.define('member-cards', MemberCards);