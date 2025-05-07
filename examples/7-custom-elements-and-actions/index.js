/*
使用 import f3 from '../../src/index.js' 确实会导入该文件中默认导出对象的所有属性和方法。
你可以通过 f3 对象访问所有这些导入的函数和对象。
这种方式提供了一个统一的入口点来访问模块的所有功能，同时保持了良好的命名空间隔离。
*/
import f3 from "../../src/index.js";
import { handlePersonList, handleAddPerson, handleEditPerson, handleSaveSVGAsImage, handleUpdateCardImage } from './personNodeHandler.js';

// 初始化数据加载
handlePersonList({}, refresh);

// 定义全局变量
export let treeData;
let main_id, tree, svg;

function refresh(data) {
  // 创建SVG容器
  svg = f3.createSvg(document.querySelector("#FamilyChart"));
  
  // 从缓存中获取 main_id
  if (!main_id) {
    main_id = localStorage.getItem('family_chart_main_id');
  }

  if (window.personNodeHandler == null) {
    // 添加保存按钮
    createSaveButton();
  }

  // 初始化树形图
  const props = {
    initial: true,
    transition_time: 500,
  };
  updateTree(data, svg, onCardClick, props);
}

function onCardClick(e, d) {
  // 更新主节点ID并重新渲染树形图
  updateMainId(d.data.id);

  const props = {
    tree_position: 'fit',
    transition_time: 1000,
  };
  updateTree(treeData, svg, onCardClick, props);
}

// 更新主节点ID的函数
export function updateMainId(_main_id, refreshTree = false) {
  main_id = _main_id;
  
  // 将 main_id 保存到 localStorage 中进行缓存
  if (_main_id) {
    localStorage.setItem('family_chart_main_id', _main_id);
  }

  if (refreshTree) {
    // 更新树形图
    const props = {
      initial: false,
      tree_position: 'fit',
      transition_time: 1000,
    };
    updateTree(treeData, svg, onCardClick, props);
  }
}

function updateTree(data, svg, onCardClick, props) {
  treeData = data;
  // 根据数据和主节点ID计算树形结构
  tree = f3.CalculateTree({
    data: treeData,
    main_id,
    single_parent_empty_card: false,
    node_separation: 180, // 水平间距
    level_separation: 250, // 垂直间距
  });
  // 渲染树形图，使用自定义的Card组件
  f3.view(tree, svg, Card(tree, svg, onCardClick), props || {});
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
    
    const params = {
      currentId: parent.id,
      gender: parent.data.gender === "M" ? "M" : "F",
      addType: parent.rels.mother && parent.rels.father ? 1 : 0
    };
    
    handleAddPerson(params, addPersonAction);
    
    function addPersonAction(nData) {
      // 创建新的家庭成员数据
      const rels = {
        spouses: [],
        children: [],
      };
  
      // 获取当前节点的配偶关系
      const spouses = parent.rels.spouses || [];
      const id =  nData.id ? nData.id : generateUUID();
      // 创建新成员并设置属性
      const person = {id: id, data: nData || {}, rels: rels || {}}
      // 更新关系数据
      const currentData = [...new Set([
        ...tree.data.map(item => item.data),
        ...tree.data_stash.map(item => item)
      ])];
  
      // 根据添加类型处理关系
      if (nData.relationType === 'spouse') {
        // 添加配偶
        if (!rels.spouses.includes(parent.id)) {
          rels.spouses = [parent.id];
        }
        parent.rels.spouses = parent.rels.spouses || [];
        if (!parent.rels.spouses.includes(person.id)) {
          parent.rels.spouses.push(person.id);
        }
        rels.children = parent.rels.children || [];

        // 更新子女的父母关系
        if (parent.rels.children && parent.rels.children.length > 0) {
          parent.rels.children.forEach(childId => {
            const child = currentData.find(item => item.id === childId);
            if (child) {
              if (parent.data.gender === "M") {
                // 如果当前节点是父亲，新配偶是母亲
                child.rels.mother = person.id;
              } else {
                // 如果当前节点是母亲，新配偶是父亲
                child.rels.father = person.id;
              }
            }
          });
        }
      } else if (nData.relationType === 'child') {
        // 添加子女
        if (parent.data.gender === "M") {
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
      } else if (nData.relationType === 'parent') {
        // 添加父母
        if (nData.gender === "M") {
          rels.children = [parent.id];
          parent.rels.father = person.id;
          
          // 如果已有母亲，建立配偶关系
          if (parent.rels.mother) {
            rels.spouses = [parent.rels.mother];
            // 在母亲节点中也添加配偶关系
            const mother = currentData.find(item => item.id === parent.rels.mother);
            if (mother) {
              mother.rels = mother.rels || {};
              mother.rels.spouses = mother.rels.spouses || [];
              if (!mother.rels.spouses.includes(person.id)) {
                mother.rels.spouses.push(person.id);
              }
            }
          }
        } else {
          rels.children = [parent.id];
          parent.rels.mother = person.id;
          
          // 如果已有父亲，建立配偶关系
          if (parent.rels.father) {
            rels.spouses = [parent.rels.father];
            // 在父亲节点中也添加配偶关系
            const father = currentData.find(item => item.id === parent.rels.father);
            if (father) {
              father.rels = father.rels || {};
              father.rels.spouses = father.rels.spouses || [];
              if (!father.rels.spouses.includes(person.id)) {
                father.rels.spouses.push(person.id);
              }
            }
          }
        }
      }
  
      person.to_add = false;
      updateMainId(parent.id);
  
      if (nData.relationType === 'child') {
        // 更新父母的子女关系
        updateParentChildrenRels(parent, person.id);
        const other_parent = currentData.find((item) => item.id === spouses[0]);
        if (other_parent) {
          updateParentChildrenRels(other_parent, person.id);
        }
      }
  
      // 更新数据并重新渲染
      currentData.push(person);
      
      // 更新数据并重新渲染树形图
      const props = {
        initial: false,
        tree_position: "fit",
        transition_time: 1000,
      };
      updateTree(currentData, svg, onCardClick, props);
    }
  }

  /**
   * 更新父母节点的子女关系
   * @param {Object} parent - 父母节点数据
   * @param {string} childId - 子女ID
   */
  function updateParentChildrenRels(parent, childId) {
    if (!parent.rels) parent.rels = {};
    if (!parent.rels.children) parent.rels.children = [];
    if (!parent.rels.children.includes(childId)) {
      parent.rels.children.push(childId);
    }
  }

  /**
   * 处理卡片编辑表单
   * @param {Object} d - 节点数据
   */
  function cardEditForm(d) {
    console.log("card cardEditForm", d);
    const person = d.datum;
    
    const params = {
      currentId: person.id,
    };
    
    handleEditPerson(params, (nData) => {
      if (nData["editType"] == "delete") {
        deletePersonAction(nData["personIds"]);
        return;
      }
      editPersonAction(nData);
    });
    
    function deletePersonAction(personIds) {
      if (!personIds || personIds.length === 0) {
        return;
      }

      // 获取当前数据
      const currentData = [...new Set([
        ...tree.data.map(item => item.data),
        ...tree.data_stash.map(item => item)
      ])];
      
      // 过滤掉要删除的数据
      const filteredData = currentData.filter(item => {
        // 检查节点ID是否在要删除的列表中
        if (personIds.includes(item.id)) {
          return false;
        }
        
        // 检查并更新关系
        if (item.rels) {
          // 移除子女关系
          if (item.rels.children) {
            item.rels.children = item.rels.children.filter(childId => !personIds.includes(childId));
          }
          
          // 移除配偶关系
          if (item.rels.spouses) {
            item.rels.spouses = item.rels.spouses.filter(spouseId => !personIds.includes(spouseId));
          }
          
          // 移除父母关系
          if (item.rels.father && personIds.includes(item.rels.father)) {
            delete item.rels.father;
          }
          
          if (item.rels.mother && personIds.includes(item.rels.mother)) {
            delete item.rels.mother;
          }
        }
        
        return true;
      });
      
      // 更新数据并重新渲染树形图
      const props = {
        initial: false,
        tree_position: "fit",
        transition_time: 1000,
      };
      updateTree(filteredData, svg, onCardClick, props);
}

    function editPersonAction(nData) {
      // 获取当前数据并创建新的数据数组
      const currentData = [...new Set([
        ...tree.data.map(item => item.data),
        ...tree.data_stash.map(item => item)
      ])];

      // 找到要更新的节点
      const nodeToUpdate = currentData.find((node) => node.id === person.id);
      if (!nodeToUpdate) {
        console.error("未找到要更新的节点");
        return;
      }

      // 更新节点数据
      nodeToUpdate.data = {
        gender: nData.gender,
        "first name": nData["first name"],
        "last name": nData["last name"],
        birthday: nData.birthday,
        avatar: nData.avatar
      };
      nodeToUpdate.to_add = false;

      // 更新数据并重新渲染树形图
      const props = {
        initial: false,
        tree_position: "fit",
        transition_time: 1000,
      };
      updateTree(currentData, svg, onCardClick, props);
    }
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

    // 卡片的边框视图
    const card_main_outline = d3.select(this).select(".card-main-outline");
    card_main_outline.style("stroke", "#fff");
    card_main_outline.style("stroke-width", "16px");
          
    const card_image = d3.select(this).select(".card_image");
    card_image.on("click", function (event, d) {
      console.log("card image clicked", d);
      onCardClick(event, d);
    });

    handleUpdateCardImage(d, function (result) {
      try {
        const imageData = JSON.parse(result);
        if (imageData.imageData) {
          // 更新图片源
          card_image.select('image')
          .attr('href', imageData.imageData);
        }
      } catch (error) {
        console.error('处理图片数据失败:', error);
      }
    })
  }
}

/**
 * 创建并添加保存按钮
 */
function createSaveButton() {
  // 如果已存在保存按钮，先移除
  const existingButton = document.querySelector('#saveChartButton');
  if (existingButton) {
    existingButton.remove();
  }

  const saveButton = document.createElement('button');
  saveButton.id = 'saveChartButton';
  saveButton.textContent = window.personNodeHandler ? '保存家谱图' : '下载家谱图';
  
  // 设置按钮样式
  Object.assign(saveButton.style, {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  });
  
  // 添加悬停效果
  saveButton.addEventListener('mouseover', () => {
    saveButton.style.backgroundColor = '#45a049';
  });
  
  saveButton.addEventListener('mouseout', () => {
    saveButton.style.backgroundColor = '#4CAF50';
  });
  
  saveButton.addEventListener('click', () => {
    handleSaveSVGAsImage((result) => {
      if (result.success) {
        alert(window.personNodeHandler ? '家谱图保存成功！' : '家谱图下载成功！');
      } else {
        alert('保存失败：' + result.message);
      }
    });
  });
  
  document.body.appendChild(saveButton);
}
