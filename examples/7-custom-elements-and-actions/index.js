/*
使用 import f3 from '../../src/index.js' 确实会导入该文件中默认导出对象的所有属性和方法。
你可以通过 f3 对象访问所有这些导入的函数和对象。
这种方式提供了一个统一的入口点来访问模块的所有功能，同时保持了良好的命名空间隔离。
*/
import { createNewPerson } from "../../src/handlers.js";
import f3 from "../../src/index.js";

if (window.personNodeHandler) {
  const params = {
    kId: "1231231",
  };
  window.personNodeHandlerCallback = function (result) {
    const data = JSON.parse(result);
    refresh(data);
  };
  personNodeHandler.personList(params, "personNodeHandlerCallback");
} else {
  // 从JSON文件加载家谱数据
  fetch("./data.json")
    .then((r) => r.json())
    .then((data) => {
      refresh(data);
    });
}

// 定义全局变量
let tree, main_id, jsonData;

function refresh(data) {
  // 创建SVG容器
  // 在HTML文档中找到id为"FamilyChart"的元素。
  const svg = f3.createSvg(document.querySelector("#FamilyChart"));
  jsonData = data;

  // 初始化树形图
  updateTree({ initial: true });

  // 更新树形图的函数
  /*
  封装性更好：updateTree 只在需要刷新时才被定义和使用。
  可以访问 refresh 方法的局部变量和参数。
  如果 updateTree 的逻辑需要根据 refresh 的状态变化，这种方式更灵活。
  */
  function updateTree(props) {
    // 根据数据和主节点ID计算树形结构
    tree = f3.CalculateTree({
      data: jsonData,
      main_id,
      single_parent_empty_card: true,
      node_separation: 200, // 水平间距
      level_separation: 250, // 垂直间距
    });
    // 渲染树形图，使用自定义的Card组件
    f3.view(tree, svg, Card(tree, svg, onCardClick), props || {});
  }

  // 更新主节点ID的函数
  function updateMainId(_main_id) {
    main_id = _main_id;
  }

  // 卡片点击事件处理函数
  function onCardClick(e, d) {
    // 更新主节点ID并重新渲染树形图
    updateMainId(d.data.id);
    updateTree();
  }
}

// 自定义卡片组件
function Card(tree, svg, onCardClick) {
  // 定义卡片尺寸和布局参数
  const card_dim = {
    w: 140,
    h: 200,
    text_x: 0,
    text_y: 150,
    img_w: 130,
    img_h: 130,
    img_x: 5,
    img_y: 5,
  };

  // Card 函数返回另一个函数，这个内部函数接收一个参数 d，可能代表节点数据。
  return function (d) {
    // 返回f3库的Card组件，配置各种属性和回调函数
    return f3.elements
      .Card({
        svg,
        card_dim,
        // 显示姓名
        card_display: [(d) => `${d.data["first name"]} ${d.data["last name"]}`],

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

        onCardUpdate,
      })
      .call(this, d);

    /*
      .call() 是 JavaScript 中所有函数对象都具有的一个方法。它允许你调用一个函数,并明确指定函数执行时的 this 值,以及传递参数。
      调用 f3.elements.Card() 函数,该函数返回一个新函数，然后立即调用这个新返回的函数,使用 .call()
    */
  };

  function addRelative(d) {
    console.log("add relative", d);
    const parent = d.d.data;
    // 创建新的家庭成员数据
    const rels = {
      spouses: [],
      children: [],
    };

    // 处理父母关系
    const spouses = parent.rels.spouses || [];
    if (parent.gender === "M") {
      rels.father = parent.id;
      if (spouses.length > 0) {
        rels.mother = spouses[0];
      }
    } else {
      rels.mother = parent.id;
      if (spouses.length > 0) {
        rels.father = spouses[0];
      }
    }

    // 创建新成员数据
    const nData = {
      "first name": "New",
      "last name": "Person",
      gender: "M",
      birthday: "",
      avatar: "",
    };

    // 创建新成员并设置属性
    const person = createNewPerson({ data: nData, rels: rels });
    person.to_add = false;
    person.main = false;

    // 更新父母节点的子女关系
    updateParentChildrenRels(parent, person.id);

    // 更新另一位父母的子女关系
    const currentData = tree.data.map((item) => item.data);
    const other_parent = currentData.find((item) => item.id === spouses[0]);
    if (other_parent) {
      updateParentChildrenRels(other_parent, person.id);
    }

    // 更新数据并重新渲染
    currentData.push(person);
    updateTreeData(currentData);
  }

  /**
   * 更新父母节点的子女关系
   * @param {Object} parent - 父母节点数据
   * @param {string} childId - 子女ID
   */
  function updateParentChildrenRels(parent, childId) {
    if (!parent.rels) parent.rels = {};
    if (!parent.rels.children) parent.rels.children = [];
    parent.rels.children.push(childId);
  }

  /**
   * 更新树形图数据并重新渲染
   * @param {Array} currentData - 更新后的数据
   */
  function updateTreeData(currentData) {
    const nTree = f3.CalculateTree({
      data: currentData,
      main_id,
      node_separation: 200,
      level_separation: 250,
    });

    tree.data = nTree.data;
    tree.data_stash = nTree.data_stash; // 添加这行，同步更新 data_stash
    jsonData = nTree.data.map((item) => item.data);
    f3.view(tree, svg, Card(tree, svg, onCardClick), { initial: false });
  }

  /**
   * 处理卡片编辑表单
   * @param {Object} d - 节点数据
   */
  function cardEditForm(d) {
    console.log("card cardEditForm", d);
    const person = d.datum;

    // 获取当前数据并创建新的数据数组
    const currentData = tree.data.map((item) => item.data);

    // 找到要更新的节点
    const nodeToUpdate = currentData.find((node) => node.id === person.id);
    if (!nodeToUpdate) {
      console.error("未找到要更新的节点");
      return;
    }

    // 更新节点数据，保持原有数据的完整性
    nodeToUpdate.data = {
      gender: "F",
      "first name": "Andrea",
      "last name": "",
      birthday: "",
      avatar: "",
    };
    nodeToUpdate.to_add = false;

    // 更新数据并重新渲染树形图
    updateTreeData(currentData);
  }

  // 卡片更新处理函数
  function onCardUpdate(d) {
    const rxy = "10px";

    const card_outline = d3.select(this).select(".card-outline");
    card_outline.attr("rx", rxy);
    card_outline.attr("ry", rxy);

    const card_body_rect = d3
      .select(this)
      .select(".card-inner .card-body-rect");
    card_body_rect.attr("rx", rxy);
    card_body_rect.attr("ry", rxy);

    const text_overflow_mask = d3
      .select(this)
      .select(".card-inner .text-overflow-mask");
    text_overflow_mask.attr("rx", rxy);
    text_overflow_mask.attr("ry", rxy);
    text_overflow_mask.attr("width", card_dim.w);

    const text = d3.select(this).select(".card-inner .card-text");
    text.attr("text-anchor", "middle");
    text.attr("font-size", "14px");
    text.attr("font-weight", "bold");
    const tspan = text.select("tspan");
    tspan.attr("x", (card_dim.w - card_dim.text_x) / 2);

    const card_image = d3.select(this).select(".card_image");
    card_image.on("click", function (event, d) {
      console.log("card image clicked", d);
      onCardClick(event, d);
    });
  }
}
