# 卡片功能说明

家谱图卡片组件提供了丰富的功能和自定义选项，支持两种类型的卡片：SVG卡片和HTML卡片。

## 树形结构计算（CalculateTree）

### 基本配置

```javascript
CalculateTree({
  data: [], // 家谱数据
  main_id: null, // 主节点ID
  node_separation: 250, // 节点间距
  level_separation: 150, // 层级间距
  single_parent_empty_card: true, // 是否显示单亲空卡片
  is_horizontal: false // 是否水平布局
})
```

### 核心功能

1. **节点位置计算**
   - 自动计算祖先和后代节点的位置
   - 支持水平和垂直布局
   - 智能处理节点间距和层级间距

2. **关系处理**
   - 配偶关系的位置计算和连接
   - 父母子女关系的自动布局
   - 支持单亲家庭的空卡片显示

3. **连接线生成**
   - 自动生成家族成员之间的连接线
   - 支持曲线和直线两种连接方式
   - 智能处理多代关系的连接

### 使用示例

```javascript
const treeConfig = CalculateTree({
  data: familyData,
  main_id: "person_1",
  node_separation: 250,
  level_separation: 150
});

// 返回结果包含：
// - data: 计算后的树形数据
// - data_stash: 原始数据存储
// - dim: 树的尺寸信息
// - main_id: 主节点ID
// - is_horizontal: 布局方向
```

## 基本配置

### 卡片尺寸 (card_dim)

可配置的尺寸属性包括：
- `w/width`: 卡片宽度
- `h/height`: 卡片高度
- `text_x`: 文本X轴位置
- `text_y`: 文本Y轴位置
- `img_w/img_width`: 图片宽度
- `img_h/img_height`: 图片高度
- `img_x`: 图片X轴位置
- `img_y`: 图片Y轴位置

示例：
```javascript
card_dim: {
  w: 220,
  h: 70,
  text_x: 75,
  text_y: 15,
  img_w: 60,
  img_h: 60,
  img_x: 5,
  img_y: 5
}
```

### 卡片显示内容 (card_display)

支持自定义卡片内容显示：
```javascript
card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`]
```

## 交互功能

### 点击事件

- `onCardClick`: 卡片点击事件处理
- `onCardUpdate`: 卡片更新时的回调函数
- `onCardUpdates`: 多个卡片更新处理函数

### 悬停效果 (仅HTML卡片)

- `setOnHoverPathToMain`: 悬停时显示到主节点的路径
- `onCardMouseenter`: 鼠标进入事件
- `onCardMouseleave`: 鼠标离开事件

## 视觉功能

### 迷你树

- `mini_tree`: 是否显示迷你树形图
- `onMiniTreeClick`: 迷你树点击事件

### 链接样式

- `link_break`: 控制连接线的断开效果

### 样式定制

- SVG卡片支持自定义SVG文本内容
- HTML卡片支持多种预定义样式

## 特殊功能

### 空卡片处理

- 支持单父节点空卡片显示
- 可自定义空卡片标签文本

### 自定义元素

支持在卡片内添加自定义元素，如按钮、图标等：
```javascript
function onCardUpdate(d) {
  const g = d3.select(this).select(".card-inner").append('g')
  g.on('click', () => {
    console.log('custom element clicked', d)
  })
  g.html(customElement())
}
```

## 使用示例

### SVG卡片

```javascript
f3.elements.Card({
  svg,
  card_dim: {w:220, h:70},
  card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`],
  onCardClick,
  mini_tree: true,
  onMiniTreeClick: onCardClick
})
```

### HTML卡片

```javascript
f3.elements.CardHtml({
  card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`],
  style: 'default',
  mini_tree: true,
  onCardClick,
  onCardUpdate
})
```

## 注意事项

1. SVG卡片和HTML卡片的功能略有差异，选择时需考虑具体需求
2. 自定义样式时需注意与现有样式的兼容性
3. 添加自定义元素时建议保持卡片布局的整洁性
4. 事件处理函数建议做好性能优化