import { generateUUID } from "../../src/CreateTree/newPerson.js";

import {treeData, updateMainId} from "./index.js";
import f3 from "../../src/index.js";

// 将函数挂载到 window 对象
window.handleSaveSVGAsImage = handleSaveSVGAsImage;
window.handleTreNodes = handleTreNodes;
window.personSelect = personSelect;

// 通用回调处理函数
function createCallback(callbackName, callback) {
  window[callbackName] = function(result) {
    const data = JSON.parse(result);
    callback(data);
  };
}

// personNodeHandler 相关的代码管理
export function handlePersonList(params, callback) {
  if (window.personNodeHandler) {
    createCallback("personNodeHandlerCallback", callback);
    personNodeHandler.personList(params, "personNodeHandlerCallback");
  } else {
    // 本地测试模式，从 JSON 文件加载数据
    fetch("./demo/qing.json")
      .then((r) => r.json())
      .then(callback);
  }
}

export function handleAddPerson(params, callback) {
  if (window.personNodeHandler) {
    createCallback("addPersonActionCallback", callback);
    personNodeHandler.addPerson(params, "addPersonActionCallback");
  } else {
    // 本地测试模式的默认数据
    callback({
      "id": generateUUID(),
      "first name": "New",
      "last name": "Person",
      gender: "M",
      birthday: "",
      avatar: "",
    });
  }
}

export function handleEditPerson(params, callback) {
  if (window.personNodeHandler) {
    createCallback("editPersonActionCallback", callback);
    personNodeHandler.editPerson(params, "editPersonActionCallback");
  } else {
    // 本地测试模式的默认编辑数据
    callback({
      gender: "F",
      "first name": "Andrea",
      "last name": "",
      birthday: "",
      avatar: ""
    });
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

  // 准备 SVG 数据
  const svgData = prepareSvgForExport(svgElement);
  const { width, height, svgString } = svgData;
  
  if (window.personNodeHandler) {
    // 设置回调函数
    window.saveSVGCallback = function (result) {
      callback(result);
    };
    
    if (format === 'png') {
      convertSvgToPng(svgString, width, height, (pngDataUrl, error) => {
        if (error) {
          callback({ success: false, message: error.message });
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
      });
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
    downloadFile(svgString, format === 'png' ? "family-tree.png" : "family-tree.svg", format === 'png' ? "image/png" : "image/svg+xml");
    callback({ success: true, message: `${format.toUpperCase()} 已成功保存` });
  }
}

// 准备 SVG 用于导出
function prepareSvgForExport(svgElement) {
  // 创建一个 SVG 的副本
  const clonedSvg = svgElement.cloneNode(true);
  
  // 移除所有编辑按钮元素
  const elementsToRemove = [
    '.card_edit.pencil_icon',
    '.card_add_relative',
    '.card_family_tree'
  ];
  
  elementsToRemove.forEach(selector => {
    const elements = clonedSvg.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

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
  
  return { width, height, x, y, svgString };
}

// 将 SVG 转换为 PNG
function convertSvgToPng(svgString, width, height, callback) {
  console.log('导出PNG格式 - 尝试使用 canvg 库');
  
  // 创建 Canvas
  const canvas = document.createElement('canvas');
  const scale = 7; // 缩放比例
  
  // 计算画布尺寸并检查限制
  const maxCanvasSize = 6144;
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
  
  // 禁用图像平滑，保持锐利的边缘
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'high';
  
  // 设置白色背景
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.scale(canvasWidth/width, canvasHeight/height);
  
  // 尝试使用 canvg 渲染
  if (window.canvg) {
    try {
      window.canvg.Canvg.from(ctx, svgString, {
        ignoreMouse: true,
        ignoreAnimation: true,
        enableRedraw: false,
        ignoreDimensions: true
      }).then(canvg => {
        return canvg.render();
      }).then(() => {
        try {
          const pngDataUrl = canvas.toDataURL('image/png', 1.0);
          if (!pngDataUrl || pngDataUrl === 'data:,') {
            throw new Error("生成的PNG数据URL无效");
          }
          callback(pngDataUrl);
        } catch (error) {
          console.error("Canvas转PNG失败:", error);
          fallbackToImageMethod(svgString, width, height, callback);
        }
      }).catch(error => {
        console.error("canvg 渲染失败:", error);
        fallbackToImageMethod(svgString, width, height, callback);
      });
    } catch (error) {
      console.error("canvg 调用失败:", error);
      fallbackToImageMethod(svgString, width, height, callback);
    }
  } else {
    console.error("canvg 库不可用");
    fallbackToImageMethod(svgString, width, height, callback);
  }
}

// 回退方法：使用 Image 对象加载 SVG
function fallbackToImageMethod(svgString, width, height, callback) {
  console.log('使用回退方法转换PNG');
  const svgBase64 = btoa(unescape(encodeURIComponent(svgString)));
  const svgDataUrl = `data:image/svg+xml;charset=utf-8;base64,${svgBase64}`;
  
  const img = new Image();
  img.crossOrigin = "Anonymous";
  
  img.onload = function() {
    const canvas = document.createElement('canvas');
    const scale = 7;
    
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
    
    // 禁用图像平滑，保持锐利的边缘
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'high';
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    try {
      // 使用最高质量导出PNG
      const pngDataUrl = canvas.toDataURL('image/png', 1.0);
      
      if (!pngDataUrl || pngDataUrl === 'data:,') {
        callback(null, new Error("生成的PNG数据URL无效"));
        return;
      }
      
      callback(pngDataUrl);
    } catch (error) {
      callback(null, new Error("Canvas转PNG失败: " + error.message));
    }
  };
  
  img.onerror = function(error) {
    callback(null, new Error("SVG图片加载失败"));
  };
  
  img.src = svgDataUrl;
}

// 本地下载文件
function downloadFile(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // 清理
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
      personNodeHandler.getImageData({
        imagePath: avatarPath,
        imageType: 'avatar',
        id: d.data.id
      }, `${imageId}_callback`);
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