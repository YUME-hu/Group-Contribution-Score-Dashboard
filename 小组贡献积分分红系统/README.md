# 小组贡献积分分红系统

## 系统概述

这是一个模块化的小组贡献积分统计系统，用于跟踪和管理团队成员的贡献积分。系统具有以下特点：

- **模块化设计**：采用ES6模块和组件化架构，代码结构清晰，易于维护
- **数据可视化**：使用Chart.js实现积分占比和趋势图表
- **响应式布局**：适配不同屏幕尺寸，支持移动端访问
- **完整功能**：支持积分计算、成员管理、批量操作、数据导出等功能

## 目录结构

```
小组贡献积分分红系统/
├── index.html              # 主页面
├── js/
│   ├── main.js            # 应用入口
│   ├── core/
│   │   ├── App.js         # 应用主类
│   │   └── EventManager.js # 事件管理器
│   ├── services/
│   │   ├── StorageService.js # 存储服务
│   │   ├── MemberService.js  # 成员服务
│   │   ├── ScoreService.js   # 积分服务
│   │   └── LogService.js     # 日志服务
│   ├── ui/
│   │   ├── MemberRenderer.js  # 成员渲染器
│   │   ├── ChartRenderer.js   # 图表渲染器
│   │   ├── RankRenderer.js    # 排行榜渲染器
│   │   ├── StatsRenderer.js   # 统计渲染器
│   │   ├── LogRenderer.js     # 日志渲染器
│   │   ├── Toast.js           # 提示组件
│   │   └── ModalManager.js    # 模态框管理器
│   ├── components/
│   │   ├── NavBar.js          # 导航栏组件
│   │   ├── ScoreCalculator.js # 积分计算器组件
│   │   ├── ControlButtons.js  # 控制按钮组件
│   │   ├── StatsOverview.js   # 统计概览组件
│   │   ├── RankList.js        # 排行榜组件
│   │   ├── MemberCards.js     # 成员卡片组件
│   │   ├── ChartSection.js    # 图表区域组件
│   │   ├── LogSection.js      # 日志区域组件
│   │   └── index.js           # 组件加载器
│   └── utils/
│       ├── validators.js      # 验证工具
│       └── memberService.test.js # 测试文件
└── styles/
    ├── main.css             # 主样式文件
    └── components.css       # 组件样式文件
```

## 模块说明

### 核心模块

- **App.js**：应用主类，负责初始化、事件协调和状态管理
- **EventManager.js**：事件管理器，用于组件间通信

### 服务层

- **StorageService.js**：本地存储服务，用于持久化数据
- **MemberService.js**：成员管理服务，处理成员的增删改查
- **ScoreService.js**：积分计算服务，处理积分的计算和历史记录
- **LogService.js**：日志服务，记录系统操作日志

### 渲染层

- **MemberRenderer.js**：成员卡片渲染
- **ChartRenderer.js**：图表渲染
- **RankRenderer.js**：排行榜渲染
- **StatsRenderer.js**：统计概览渲染
- **LogRenderer.js**：日志渲染

### UI组件

- **Toast.js**：提示组件
- **ModalManager.js**：模态框管理器

## 使用方法

### 本地运行

1. 克隆项目到本地
2. 启动本地服务器（推荐使用Python HTTP服务器）：
   ```bash
   python -m http.server 8000
   ```
3. 在浏览器中访问 `http://localhost:8000/index.html`

### 基本操作

1. **积分计算**：
   - 选择难度等级
   - 输入预估工时
   - 系统自动计算积分

2. **添加积分**：
   - 选择成员
   - 点击「一键加到该成员」按钮

3. **扣除积分**：
   - 选择成员
   - 点击「一键扣除积分」按钮

4. **添加成员**：
   - 点击「添加成员」按钮
   - 输入成员名称和联系方式
   - 点击「确认添加」

5. **批量管理**：
   - 点击「批量管理」按钮
   - 支持批量导入和删除成员

6. **导出数据**：
   - 点击「导出积分表格」按钮
   - 系统会生成并下载CSV格式的积分记录

7. **数据可视化**：
   - 切换不同的图表类型（环形图、柱状图、饼图）
   - 查看积分变化趋势

## 技术栈

- **前端框架**：原生JavaScript (ES6+)
- **数据可视化**：Chart.js
- **样式**：CSS3 (Flexbox, Grid, 渐变)
- **存储**：localStorage
- **构建工具**：无（原生模块）

## 浏览器兼容性

- 支持所有现代浏览器（Chrome, Firefox, Safari, Edge）
- 不支持IE11及以下版本

## 性能优化

- 使用ES6模块进行代码分割
- 图表懒加载
- 事件委托减少事件监听器
- 本地存储缓存数据

## 未来扩展

- 支持后端数据库存储
- 添加用户认证系统
- 实现多团队管理
- 增加更多数据可视化图表
- 支持导出Excel格式

## 故障排除

### 常见问题

1. **页面加载缓慢**：
   - 检查网络连接
   - 清除浏览器缓存

2. **数据丢失**：
   - 本地存储可能被清除，请定期导出数据备份

3. **图表不显示**：
   - 检查Chart.js CDN是否加载成功
   - 刷新页面重试

4. **功能异常**：
   - 打开浏览器控制台查看错误信息
   - 刷新页面重试

## 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

## 许可证

MIT License