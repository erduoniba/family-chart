# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 开发命令

### 构建
- `npm run build` - 使用 Rollup 构建 family-chart 库，在 `dist/` 目录中创建 UMD、ESM 和压缩版本
- `node scripts/build.js` - 替代构建脚本，包含额外的后处理如压缩和离线包创建

### 开发服务器
- `npm run dev` - 启动 http-server 用于本地开发和测试

### 测试
- `npm test` - 打开 Cypress 测试运行器进行端到端测试
- 测试文件位于 `tests/cypress/integration/`

### 包管理
- `npm install` - 安装依赖
- 同时使用 npm (package-lock.json) 和 yarn (yarn.lock) - 建议使用 npm 保持一致性

## 架构概览

这是一个基于 D3.js 的家谱树可视化库，具有以下关键架构组件：

### 核心模块 (src/)
- **CalculateTree/** - 树形布局计算和定位算法
- **Cards/** - 用于渲染家谱树节点的卡片组件（SVG 和 HTML 变体）
- **CreateTree/** - 树形结构创建、编辑和操作功能
- **view/** - 支持 SVG 和 HTML 卡片的渲染系统
- **handlers/** - 事件处理和用户交互
- **createChart.js** - 主要图表创建和初始化
- **createStore.js** - 状态管理系统

### 关键设计模式
- **模块化 ES6 导出** - 每个模块导出特定功能，主 index.js 聚合所有导出
- **基于存储的状态管理** - 带有更新回调的集中式状态
- **双重渲染模式** - 支持 SVG 和 HTML 卡片渲染
- **插件架构** - 可扩展的卡片类型和处理器

### 数据流
1. 数据输入 → 存储初始化
2. CalculateTree 处理布局
3. View 渲染卡片和链接
4. Handlers 管理交互
5. 存储更新触发重新渲染

### 构建系统
- **Rollup** 用于模块打包（UMD + ESM 输出）
- **自定义构建脚本** (scripts/build.js) 带压缩和打包功能
- **版本管理** 自动创建分发用的 zip 包

### 示例结构
位于 `examples/` 目录，包含从基础树到复杂自定义的编号示例：
- 1-7：递进复杂度的示例
- 每个示例都是独立的，包含 HTML、JS 和数据文件
- 示例 7 包含高级功能如自定义元素和操作

### 测试
- **Cypress** 用于端到端测试
- 测试专注于树创建和交互工作流
- 配置在 `tests/cypress.json`

## 开发说明

### 主要入口点
- `src/index.js` - 主库导出
- `src/createChart.js` - 图表工厂函数
- `examples/` - 使用示例和演示

### 关键配置
- 节点间距、层级间距和方向可配置
- 支持水平和垂直布局
- 可自定义卡片模板和样式

### 构建输出
- `dist/family-chart.js` - UMD 构建
- `dist/family-chart.esm.js` - ES 模块构建
- `dist/family-chart.min.js` - 压缩的 UMD 构建