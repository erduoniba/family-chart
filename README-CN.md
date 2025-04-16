# Family Chart

## 项目结构

```
├── src/                    # 源代码目录
│   ├── CalculateTree/      # 树形结构计算相关代码
│   ├── Cards/              # 卡片组件实现
│   ├── CreateTree/         # 树形结构创建相关代码
│   ├── handlers/           # 事件处理器
│   ├── styles/             # 样式文件
│   ├── view/               # 视图相关代码
│   └── ...                 # 其他核心文件
│
├── examples/               # 示例代码目录
│   ├── 1-basic-tree/       # 基础树形图示例
│   ├── 2-basic-tree-aristotle/  # 亚里士多德家谱示例
│   ├── 3-custom-card-tree/ # 自定义卡片树示例
│   └── ...                 # 其他示例
│
├── tests/                  # 测试用例目录
│   └── cypress/            # Cypress 测试框架
│
└── package.json           # 项目配置文件
```

### 目录说明

- **src/**: 包含项目的核心源代码
  - `CalculateTree/`: 负责家谱树结构的计算和布局
  - `Cards/`: 实现家谱树中各个节点的卡片组件
  - `CreateTree/`: 处理树形结构的创建和编辑功能
  - `handlers/`: 包含各种事件处理器
  - `view/`: 负责视图渲染和用户界面

- **examples/**: 提供多个示例，展示不同使用场景
  - 包含从基础实现到复杂定制的多个示例
  - 每个示例都有完整的代码和演示

- **tests/**: 测试相关文件
  - 使用 Cypress 进行端到端测试

这些目录共同构成了一个完整的家谱图表库，支持创建、编辑和展示家族关系图。

## 快速开始

### 安装

```bash
# 主要用于安装项目所需的依赖包。当在项目根目录下执行这个命令时，npm 会读取 package.json 文件中列出的所有依赖，并将这些依赖包下载到项目的 node_modules 目录中。
npm install family-chart
```

或者直接在 HTML 中引入：

```html
<script src="path/to/family-chart.js"></script>
<link rel="stylesheet" href="path/to/family-chart.css">
```

### 基本用法

1. 创建一个基础的家谱树：

```html
<div id="family-chart"></div>

<script>
// 准备数据
const data = {
  nodes: [
    { id: 1, name: '张三', gender: 'M' },
    { id: 2, name: '李四', gender: 'F' }
  ],
  links: [
    { source: 1, target: 2, relationship: 'spouse' }
  ]
};

// 初始化图表
const chart = familyChart()
  .container('#family-chart')
  .data(data);

// 渲染图表
chart.render();
</script>
```

### 高级功能

1. **自定义卡片样式**
   - 可以通过修改 CSS 或使用自定义组件来定制节点外观
   - 支持添加图片、图标等多媒体元素

2. **交互功能**
   - 支持拖拽节点调整位置
   - 点击节点查看详细信息
   - 缩放和平移整个图表

3. **数据操作**
   - 动态添加/删除家庭成员
   - 编辑成员信息
   - 保存和加载家谱数据

### 示例

项目提供了多个示例展示不同的使用场景：

1. `1-basic-tree`: 基础树形图示例
2. `2-basic-tree-aristotle`: 展示如何创建历史人物家谱
3. `3-custom-card-tree`: 自定义节点样式示例
4. `4-custom-main-node`: 主节点定制示例
5. `5-custom-text-display`: 文本显示定制
6. `6-html-cards`: 使用 HTML 自定义卡片
7. `7-custom-elements-and-actions`: 自定义元素和交互
8. `8-zoom-to-card`: 节点缩放功能示例

每个示例都包含完整的代码和详细注释，可以直接运行和修改。

### API 参考

#### 核心方法

- `familyChart()`: 创建新的家谱图表实例
- `container(selector)`: 设置图表容器
- `data(data)`: 设置图表数据
- `render()`: 渲染图表

#### 配置选项

- `nodeWidth`: 设置节点宽度
- `nodeHeight`: 设置节点高度
- `nodePadding`: 设置节点间距
- `zoom`: 启用/禁用缩放功能
- `draggable`: 启用/禁用拖拽功能

#### 事件处理

- `on('click', callback)`: 节点点击事件
- `on('dblclick', callback)`: 节点双击事件
- `on('dragstart', callback)`: 拖拽开始事件
- `on('dragend', callback)`: 拖拽结束事件

更多详细信息和高级用法，请参考示例代码和源代码注释。