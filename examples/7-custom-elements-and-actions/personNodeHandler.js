import { generateUUID } from "../../src/CreateTree/newPerson.js";

import {treeData, updateMainId} from "./index.js";
import f3 from "../../src/index.js";

// 将函数挂载到 window 对象
window.handleSaveSVGAsImage = handleSaveSVGAsImage;
window.handleTreNodes = handleTreNodes;
window.personSelect = personSelect;

// personNodeHandler 相关的代码管理
export function handlePersonList(params, callback) {
  if (window.personNodeHandler) {
    window.personNodeHandlerCallback = function (result) {
      const data = JSON.parse(result);
      callback(data);
    };
    personNodeHandler.personList(params, "personNodeHandlerCallback");
  } else {
    // 本地测试模式，从 JSON 文件加载数据
    fetch("./data.json")
      .then((r) => r.json())
      .then((data) => {
        callback(data);
      });
  }
}

export function handleAddPerson(params, callback) {
  if (window.personNodeHandler) {
    window.addPersonActionCallback = function (result) {
      let nData = JSON.parse(result);
      callback(nData);
    };
    personNodeHandler.addPerson(params, "addPersonActionCallback");
  } else {
    // 本地测试模式的默认数据
    let nData = {
      "id": generateUUID(),
      "first name": "New",
      "last name": "Person",
      gender: "M",
      birthday: "",
      avatar: "",
    };
    callback(nData);
  }
}

export function handleEditPerson(params, callback) {
  if (window.personNodeHandler) {
    window.editPersonActionCallback = function (result) {
      let nData = JSON.parse(result);
      callback(nData);
    };
    personNodeHandler.editPerson(params, "editPersonActionCallback");
  } else {
    // 本地测试模式的默认编辑数据
    let nData = {
      gender: "F",
      "first name": "Andrea",
      "last name": "",
      birthday: "",
      avatar: ""
    };
    callback(nData);
  }
}

export function handleSaveSVGAsImage(callback, format = 'png') {
  console.log('开始导出图片，格式:', format);
  
  // 获取 SVG 元素
  const svgElement = document.querySelector('.main_svg');
  if (!svgElement) {
    callback({ success: false, message: "未找到 SVG 元素" });
    return;
  }

  // 创建一个 SVG 的副本
  const clonedSvg = svgElement.cloneNode(true);
  
  // 移除所有编辑按钮元素
  const editButtons = clonedSvg.querySelectorAll('.card_edit.pencil_icon');
  editButtons.forEach(button => button.remove());
  
  const card_add_relative = clonedSvg.querySelectorAll('.card_add_relative');
  card_add_relative.forEach(button => button.remove());

  const card_family_tree = clonedSvg.querySelectorAll('.card_family_tree');
  card_family_tree.forEach(button => button.remove());

  // 处理所有的 defs 元素（保留 clipPath 定义）
  const defs = clonedSvg.querySelector('defs');
  if (!defs) {
    const newDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    clonedSvg.insertBefore(newDefs, clonedSvg.firstChild);
  }

  // 获取 SVG 的尺寸和边界
  const bbox = svgElement.getBBox();
  const width = bbox.width;
  const height = bbox.height;
  const x = bbox.x;
  const y = bbox.y;
  
  // 设置克隆 SVG 的属性，确保内容完全填充并居中
  clonedSvg.setAttribute("width", width);
  clonedSvg.setAttribute("height", height);
  clonedSvg.setAttribute("viewBox", `${x} ${y} ${width} ${height}`);
  
  // 将 SVG 转换为字符串
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clonedSvg);
  
  if (window.personNodeHandler) {
    // 设置回调函数
    window.saveSVGCallback = function (result) {
      callback(result);
    };
    
    if (format === 'png') {
      console.log('导出PNG格式 - 尝试使用 canvg 库');
      console.log('canvg 类型:', typeof window.canvg);
      
      // 创建 Canvas
      const canvas = document.createElement('canvas');
      const scale = 6; // 高清效果
      
      // 计算画布尺寸并检查限制
      const maxCanvasSize = 4096;
      let canvasWidth = width * scale;
      let canvasHeight = height * scale;
      
      if (canvasWidth > maxCanvasSize || canvasHeight > maxCanvasSize) {
        const adjustedScale = Math.min(
          maxCanvasSize / width,
          maxCanvasSize / height,
          4
        );
        canvasWidth = Math.min(width * adjustedScale, maxCanvasSize);
        canvasHeight = Math.min(height * adjustedScale, maxCanvasSize);
        console.log(`画布尺寸过大，已自动调整缩放比例为: ${adjustedScale}`);
      }
      
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      
      const ctx = canvas.getContext('2d');
      
      // 设置白色背景
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(canvasWidth/width, canvasHeight/height);
      
      // 检查 canvg 的可用性和类型
      if (window.canvg) {
        console.log('检测到 canvg 对象:', window.canvg);
        
       // 新版本 canvg 是一个带有 from 方法的对象
       console.log('使用对象形式的 canvg API (from 方法)');
       window.canvg.Canvg.from(ctx, svgString, {
         ignoreMouse: true,
         ignoreAnimation: true,
         enableRedraw: false,
         ignoreDimensions: true
       }).then(canvg => {
         return canvg.render();
       }).then(() => {
         processPngData();
       }).catch(error => {
         console.error("对象形式的 canvg 调用失败:", error);
         fallbackToImageMethod();
       });
     } else {
        console.error("canvg 库不可用");
        fallbackToImageMethod();
      }
      
      // 处理 PNG 数据的函数
      function processPngData() {
        try {
          // 将 Canvas 转换为 PNG 数据 URL
          const pngDataUrl = canvas.toDataURL('image/png', 1.0);
          
          if (!pngDataUrl || pngDataUrl === 'data:,') {
            console.error("生成的PNG数据URL无效");
            callback({ success: false, message: "生成的PNG数据URL无效" });
            return;
          }
          
          console.log('成功生成PNG数据，准备返回给原生端');
          
          // 将 PNG 数据返回给原生端
          const params = {
            width: width,
            height: height,
            svgString: pngDataUrl,
            format: 'png'
          };
          
          if (typeof personNodeHandler.saveSVG === 'function') {
            personNodeHandler.saveSVG(params, "saveSVGCallback");
          } else {
            callback({ success: false, message: "原生保存方法不可用" });
          }
        } catch (error) {
          console.error("Canvas转PNG失败:", error);
          callback({ success: false, message: "Canvas转PNG失败: " + error.message });
          fallbackToImageMethod();
        }
      }
      
      // 回退到图像方法
      function fallbackToImageMethod() {
        console.log('使用回退方法转换PNG');
        const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
        const svgDataUrl = `data:image/svg+xml;charset=utf-8;base64,${svgBase64}`;
        fallbackToPngConversion(svgDataUrl, width, height, callback);
      }
    } else {
      // 原始SVG格式
      console.log('导出SVG格式');
      const params = {
        width: width,
        height: height,
        svgString: `data:image/svg+xml;charset=utf-8;base64,${btoa(unescape(encodeURIComponent(svgString)))}`,
        format: 'svg'
      };
      
      // 调用原生方法保存
      if (typeof personNodeHandler.saveSVG === 'function') {
        personNodeHandler.saveSVG(params, "saveSVGCallback");
      } else {
        callback({ success: false, message: "原生保存方法不可用" });
      }
    }
  } else {
    // 本地测试模式 - 创建下载链接
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = format === 'png' ? "family-tree.png" : "family-tree.svg";
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    callback({ success: true, message: `${format.toUpperCase()} 已成功保存` });
  }
}

// 动态加载脚本的辅助函数
function loadScript(url, callback) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = url;
  script.onload = callback;
  script.onerror = function() {
    console.error('加载脚本失败:', url);
    callback();
  };
  document.head.appendChild(script);
}

// 回退到原始的PNG转换方法
function fallbackToPngConversion(svgDataUrl, width, height, callback) {
  console.log('使用回退方法转换PNG');
  
  const img = new Image();
  img.crossOrigin = "Anonymous";
  
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const scale = 6;
    
    const maxCanvasSize = 4096;
    let canvasWidth = width * scale;
    let canvasHeight = height * scale;
    
    if (canvasWidth > maxCanvasSize || canvasHeight > maxCanvasSize) {
      const adjustedScale = Math.min(
        maxCanvasSize / width,
        maxCanvasSize / height,
        4
      );
      canvasWidth = Math.min(width * adjustedScale, maxCanvasSize);
      canvasHeight = Math.min(height * adjustedScale, maxCanvasSize);
    }
    
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    try {
      const pngDataUrl = canvas.toDataURL('image/png', 1.0);
      
      if (!pngDataUrl || pngDataUrl === 'data:,') {
        callback({ success: false, message: "生成的PNG数据URL无效" });
        return;
      }
      
      const params = {
        width: width,
        height: height,
        svgString: pngDataUrl,
        format: 'png'
      };
      
      if (typeof personNodeHandler.saveSVG === 'function') {
        personNodeHandler.saveSVG(params, "saveSVGCallback");
      } else {
        callback({ success: false, message: "原生保存方法不可用" });
      }
    } catch (error) {
      callback({ success: false, message: "Canvas转PNG失败: " + error.message });
    }
  };
  
  img.onerror = function(error) {
    callback({ success: false, message: "SVG图片加载失败" });
  };
  
  img.src = svgDataUrl;
}

export function handleUpdateCardImage(d, callback) {
  // 处理头像图片
  if (d.data.data && d.data.data.avatar) {
    const avatarPath = d.data.data.avatar;
    if (window.personNodeHandler) {
      // 设置回调函数接收图片数据
      const imageId = `avatar_${d.data.id}`;
      window[imageId + '_callback'] = callback;
      // 调用原生方法获取图片数据
      const params = {
        imagePath: avatarPath,
        imageType: 'avatar',
        id: d.data.id
      }
      personNodeHandler.getImageData(params, `${imageId}_callback`);
    }
  }
}


function handleTreNodes(params) {
  let main_id = params.mainId;
  const nodes = f3.CalculateTree({
    data: treeData,
    main_id,
  }).data;
  
  // 按深度分组节点
  const nodesByDepth = {};
  
  nodes.forEach(node => {
    const depth = node.depth;
    const id = node.data.id;
    
    // 如果该深度还没有数组，则创建一个
    if (!nodesByDepth[depth]) {
      nodesByDepth[depth] = [];
    }
    
    // 将节点ID添加到对应深度的数组中
    nodesByDepth[depth].push(id);
  });
  
  return nodesByDepth;
}

function personSelect(params) {
  let main_id = params.mainId;
  updateMainId(main_id, true);
}