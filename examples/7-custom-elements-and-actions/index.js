// 导入家谱图库
import f3 from '../../src/index.js'

// 从JSON文件加载家谱数据
fetch("./data.json").then(r => r.json()).then(data => {
  let tree, main_id;

  // 创建SVG容器
  const svg = f3.createSvg(document.querySelector("#FamilyChart"))

  // 初始化树形图
  updateTree({initial: true})

  // 更新树形图的函数
  function updateTree(props) {
    // 设置过渡时间和样式 
    props.transition_time = 200;
    // 设置卡片样式为圆形
    props.style = 'imageCircle';
    // 根据数据和主节点ID计算树形结构
    tree = f3.CalculateTree({ data, main_id })
    // 渲染树形图，使用自定义的Card组件
    f3.view(tree, svg, Card(tree, svg, onCardClick), props || {})
  }

  // 更新主节点ID的函数
  function updateMainId(_main_id) {
    main_id = _main_id
  }

  // 卡片点击事件处理函数
  function onCardClick(e, d) {
    // 更新主节点ID并重新渲染树形图
    updateMainId(d.data.id)
    updateTree()
  }

})

// 自定义卡片组件
function Card(tree, svg, onCardClick) {
  // 定义卡片尺寸和布局参数
  const card_dim = {w:220,h:90,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
  
  return function (d) {
    // 返回f3库的Card组件，配置各种属性和回调函数
    return f3.elements.Card({
      svg,
      card_dim,
      // 显示姓名
      card_display: [d => `${d.data["first name"]} ${d.data["last name"]}`],

      onCardClick,
      // 启用图片显示
      img: true,
      // 启用迷你树形图
      mini_tree: true,
      onMiniTreeClick: onCardClick,
      // 卡片更新时的回调函数
      onCardUpdate
    }).call(this, d)
  }

  // 卡片更新处理函数
  function onCardUpdate(d) {
    // 在卡片内部添加自定义元素
    const g = d3.select(this).select(".card-inner").append('g')
    // 添加点击事件
    g.on('click', () => {
      console.log('custom element clicked', d)
      // 在这里可以添加自定义操作
    })
    // 添加自定义按钮
    g.html(customAddBtn(card_dim))
  }
}


// 自定义添加按钮的SVG图形
function customAddBtn(card_dim) {
  return (`
    <g class="customAddBtn" style="cursor: pointer">
      <g transform="translate(${card_dim.w-12},${card_dim.h-12})scale(.08)">
        <circle r="100" fill="#fff" />
        <g transform="translate(-50,-45)">
          <line
            x1="10" x2="90" y1="50" y2="50"
            stroke="currentColor" stroke-width="20" stroke-linecap="round"
          />
          <line
            x1="50" x2="50" y1="10" y2="90"
            stroke="currentColor" stroke-width="20" stroke-linecap="round"
          />
        </g>
      </g>
    </g>
  `)
}
