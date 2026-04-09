class ControlButtons extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
  }

  bindEvents() {
    const buttons = this.shadowRoot.querySelectorAll('button');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const action = button.dataset.action;
        if (action) {
          this.dispatchEvent(new CustomEvent('controlAction', { detail: { action } }));
        }
      });
    });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .ctrl {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          align-items: center;
        }

        select, button {
          padding: 10px 16px;
          border: 1px solid #dcdfe6;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        select:focus {
          outline: none;
          border-color: #409eff;
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
        }

        button {
          background: #409eff;
          color: #fff;
          border: none;
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        button:hover {
          background: #66b1ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
        }

        button:active {
          transform: translateY(0);
        }

        button.red {
          background: #f56c6c;
        }

        button.red:hover {
          background: #f78989;
          box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
        }

        button.gray {
          background: #909399;
        }

        button.gray:hover {
          background: #a6a9ad;
        }

        button.green {
          background: #67c23a;
        }

        button.green:hover {
          background: #85ce61;
          box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
        }

        button.purple {
          background: #9b59b6;
        }

        button.purple:hover {
          background: #af7ac5;
          box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
        }

        @media (max-width: 768px) {
          .ctrl {
            flex-direction: column;
            align-items: stretch;
          }

          .ctrl button {
            justify-content: center;
          }
        }
      </style>
      <div class="ctrl">
        <select id="user"></select>
        <button data-action="addScore">➕ 一键加到该成员</button>
        <button data-action="subtractScore" class="red">➖ 一键扣除积分</button>
        <button data-action="addMember" class="purple" id="addMemberBtn">👥 添加成员</button>
        <button data-action="batchManagement" class="green">📋 批量管理</button>
        <button data-action="exportCSV" class="green">📥 导出积分表格</button>
        <button data-action="resetAll" class="red">🗑️ 清空所有积分</button>
        <button data-action="clearLog" class="gray">📝 清空记录</button>
      </div>
    `;
  }

  updateUserOptions(users) {
    const select = this.shadowRoot.getElementById('user');
    if (select) {
      select.innerHTML = '';
      users.forEach((user, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = user.name;
        select.appendChild(option);
      });
    }
  }

  getSelectedUserIndex() {
    const select = this.shadowRoot.getElementById('user');
    return select ? parseInt(select.value) : -1;
  }

  updateAddMemberButtonState(usersLength) {
    const addBtn = this.shadowRoot.getElementById('addMemberBtn');
    if (addBtn) {
      if (usersLength >= 15) {
        addBtn.disabled = true;
        addBtn.title = '成员数量已达到上限（15人）';
        addBtn.style.opacity = '0.6';
        addBtn.style.cursor = 'not-allowed';
      } else {
        addBtn.disabled = false;
        addBtn.title = '添加新成员';
        addBtn.style.opacity = '1';
        addBtn.style.cursor = 'pointer';
      }
    }
  }
}

customElements.define('control-buttons', ControlButtons);