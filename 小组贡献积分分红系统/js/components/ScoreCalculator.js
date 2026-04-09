class ScoreCalculator extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.level = 1;
    this.hour = 2;
  }

  connectedCallback() {
    this.render();
    this.bindEvents();
    this.calculateScore();
  }

  bindEvents() {
    const levelSelect = this.shadowRoot.getElementById('level');
    const hourInput = this.shadowRoot.getElementById('hour');

    levelSelect.addEventListener('change', (e) => {
      this.level = parseInt(e.target.value);
      this.calculateScore();
      this.dispatchEvent(new CustomEvent('scoreChange', { detail: { score: this.currentScore } }));
    });

    hourInput.addEventListener('input', (e) => {
      this.hour = parseFloat(e.target.value) || 0;
      this.calculateScore();
      this.dispatchEvent(new CustomEvent('scoreChange', { detail: { score: this.currentScore } }));
    });
  }

  calculateScore() {
    const levelCoeff = [0, 1.0, 1.5, 2.0, 2.5, 3.0];
    const validHour = Math.max(0.5, this.hour);
    this.currentScore = validHour * levelCoeff[this.level];
    
    const scoreResult = this.shadowRoot.getElementById('scoreResult');
    scoreResult.textContent = this.currentScore.toFixed(1);

    // 添加脉冲动画
    scoreResult.classList.add('pulse');
    setTimeout(() => {
      scoreResult.classList.remove('pulse');
    }, 300);

    // 验证工时
    const hourInput = this.shadowRoot.getElementById('hour');
    const validationMsg = this.shadowRoot.getElementById('hourValidationMsg');
    
    if (this.hour < 0.5) {
      hourInput.classList.add('invalid');
      validationMsg.style.display = 'inline';
    } else {
      hourInput.classList.remove('invalid');
      validationMsg.style.display = 'none';
    }
  }

  getScore() {
    return this.currentScore;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        .calc-box {
          background: linear-gradient(135deg, #edf7ff 0%, #e6f3ff 100%);
          padding: 18px;
          border-radius: 12px;
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
          border: 1px solid #d0e8ff;
        }

        .calc-box label {
          font-weight: 600;
          color: #409eff;
        }

        .calc-result {
          font-size: 18px;
          color: #409eff;
          font-weight: bold;
          background: #fff;
          padding: 8px 16px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
        }

        select, input {
          padding: 10px 16px;
          border: 1px solid #dcdfe6;
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        select:focus, input:focus {
          outline: none;
          border-color: #409eff;
          box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
        }

        input.invalid {
          border-color: #f56c6c;
        }

        .validation-msg {
          color: #f56c6c;
          font-size: 12px;
          margin-left: 10px;
          display: none;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); color: #67c23a; }
          100% { transform: scale(1); }
        }

        .pulse {
          animation: pulse 0.3s ease;
        }

        @media (max-width: 768px) {
          .calc-box {
            flex-direction: column;
            align-items: stretch;
          }
        }
      </style>
      <div class="calc-box">
        <label>🎯 难度等级：</label>
        <select id="level">
          <option value="1">1级 - 简单（×1.0）</option>
          <option value="2">2级 - 中等（×1.5）</option>
          <option value="3">3级 - 困难（×2.0）</option>
          <option value="4">4级 - 专家（×2.5）</option>
          <option value="5">5级 - 关键（×3.0）</option>
        </select>

        <label>⏱️ 预估工时：</label>
        <input type="number" id="hour" value="2" style="width:80px" min="0.5" step="0.5">
        <span class="calc-result">本次积分：<span id="scoreResult">0</span></span>
        <span id="hourValidationMsg" class="validation-msg">工时不能小于0.5小时</span>
      </div>
    `;
  }
}

customElements.define('score-calculator', ScoreCalculator);