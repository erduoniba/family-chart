// 导入家谱图库
import { cardEdit } from '../../src/handlers.js';
import f3 from '../../src/index.js'

if (window.personNodeHandler) {
  const params = {
    "kId": "1231231"
    };
  window.personNodeHandlerCallback = function(result) {
       const data = JSON.parse(result);
       refresh(data);
  };
  personNodeHandler.personList(params, 'personNodeHandlerCallback');
}
else {
  // 从JSON文件加载家谱数据
  fetch("./data.json").then(r => r.json()).then(data => {
    refresh(data);
  })
}


function refresh(data) {
  let tree, main_id;

  // 创建SVG容器
  const svg = f3.createSvg(document.querySelector("#FamilyChart"))

  // 初始化树形图
  updateTree({initial: true})

  // 更新树形图的函数
  function updateTree(props) {
    // 根据数据和主节点ID计算树形结构
    tree = f3.CalculateTree({
      data,
      main_id,
      node_separation: 200,  // 水平间距
      level_separation: 250  // 垂直间距
    })
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
}

// 自定义卡片组件
function Card(tree, svg, onCardClick) {
  // 定义卡片尺寸和布局参数
  const card_dim = {w:140,h:200,text_x:0,text_y:150,img_w:130,img_h:130,img_x:5,img_y:5}
  
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
      
      // 启用卡片编辑表单
      cardEditForm: true,

      // 接收点击编辑的事件回调
      cardEditForm: cardEditForm,

      // 接收点击添加的事件回调
      addRelative: addRelative,
      
      onCardUpdate
    }).call(this, d)
  }

  function addRelative(d) {
    console.log('add relative', d)
  }

  function cardEditForm(d) {
    console.log('card cardEditForm', d)
  }

  // 卡片更新处理函数
  function onCardUpdate(d) {
    const rxy = '10px'

    const card_outline = d3.select(this).select('.card-outline')
    card_outline.attr('rx', rxy)
    card_outline.attr('ry', rxy)

    const card_body_rect = d3.select(this).select(".card-inner .card-body-rect")
    card_body_rect.attr('rx', rxy)
    card_body_rect.attr('ry', rxy)

    const text_overflow_mask = d3.select(this).select(".card-inner .text-overflow-mask")
    text_overflow_mask.attr('rx', rxy)
    text_overflow_mask.attr('ry', rxy)
    text_overflow_mask.attr('width', card_dim.w)

    const text = d3.select(this).select('.card-inner .card-text')
    text.attr('text-anchor', 'middle')
    text.attr('font-size', '14px')
    text.attr('font-weight', 'bold')
    const tspan = text.select('tspan')
    tspan.attr('x', (card_dim.w-card_dim.text_x)/2)

    // const card_image = d3.select(this).select('.card_image')
    // card_image.on('click', () => {
    //   console.log('card image clicked', d)
    // })
  }
}