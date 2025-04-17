import f3 from '../../src/index.js'

fetch("./data.json").then(r => r.json()).then(data => {
  let tree, main_id;

  const svg = f3.createSvg(document.querySelector("#FamilyChart"))

  updateTree({initial: true})

  function updateTree(props) {
    tree = f3.CalculateTree({ data, main_id })
    f3.view(tree, svg, Card(tree, svg, onCardClick), props || {})
  }

  function updateMainId(_main_id) {
    main_id = _main_id
  }

  function onCardClick(e, d) {
    updateMainId(d.data.id)
    updateTree()
  }

})

function Card(tree, svg, onCardClick) {
  return function (d) {
    return f3.elements.Card({
      svg,
      card_dim: {w:220,h:90,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5},
      card_display: [],

      onCardClick,

      img: true,
      mini_tree: true,
      onMiniTreeClick: onCardClick,

      onCardUpdate
    }).call(this, d)
  }

  function onCardUpdate(d) {
    const text = d3.select(this).select('.card-inner .card-text').append('text').attr('transform', `translate(${[75, 15]})`)

    text.append('tspan').attr('dy', 14).text(`${d.data.data["first name"]} ${d.data.data["last name"]}`)
    text.append('tspan').attr('x', 0).attr('dy', 14).attr('font-size', 10).text(d.data.id)

    // 在卡片内部添加自定义元素
    const g = d3.select(this).select(".card-inner").append('g')
    // 添加点击事件
    g.on('click', () => {
      console.log('custom element clicked', d)
      // 在这里可以添加自定义操作
    })
    // 添加自定义按钮
    const card_dim = {w:220,h:90,text_x:75,text_y:15,img_w:60,img_h:60,img_x:5,img_y:5}
    g.html(customAddBtn(card_dim))
  }
}

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