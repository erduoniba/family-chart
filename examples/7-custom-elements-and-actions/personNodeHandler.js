import { generateUUID } from "../../src/CreateTree/newPerson.js";

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

export function handleSaveSVGAsImage(callback) {
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

  // 处理所有带有 clip-path 的图片元素
  const imageElements = clonedSvg.querySelectorAll('image');
  const promises = Array.from(imageElements).map(async (img) => {
    const href = img.getAttribute('href');
    if (href && href.startsWith('http')) {
      try {
        // 获取图片数据并转换为 base64
        const response = await fetch(href);
        const blob = await response.blob();
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            img.setAttribute('href', reader.result);
            resolve();
          };
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('图片加载失败:', error);
        // 如果图片加载失败，使用默认的占位图
        img.setAttribute('href', 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjY2Ij5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=');
      }
    }
  });

  // 等待所有图片处理完成后再继续
  Promise.all(promises).then(() => {
  // 获取 SVG 的尺寸
    const bbox = svgElement.getBBox();
    const width = bbox.width;
    const height = bbox.height
    
    // 设置克隆 SVG 的属性
    clonedSvg.setAttribute("width", width);
    clonedSvg.setAttribute("height", height);
    
    // 将 SVG 转换为字符串
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(svgBlob);

    if (window.personNodeHandler) {
      // 设置回调函数
      window.saveSVGCallback = function (result) {
        callback(result);
      };
            
      // 创建图片元素
      const img = new Image();
      img.onload = function() {
        // 创建 canvas
        const canvas = document.createElement('canvas');
        const scale = 6; // 缩放比例
        // 设置 canvas 尺寸为实际尺寸的 2 倍以提高清晰度
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        // 获取 canvas 上下文并设置白色背景
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale); // 缩放以匹配更大的画布
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 获取 PNG 格式的 base64 数据
        // 获取图片数据
        const base64Data = canvas.toDataURL('image/png');
        
        const params = {
          width: width,
          height: height,
          imageData: base64Data,
          format: 'png'
        };
        
        // 清理资源
        URL.revokeObjectURL(url);
        
        // 使用 personNodeHandler 对象调用原生方法
        if (typeof personNodeHandler.saveSVG === 'function') {
          personNodeHandler.saveSVG(params, "saveSVGCallback");
        } else {
          callback({ success: false, message: "原生保存方法不可用" });
        }
      };
      
      img.onerror = function() {
        URL.revokeObjectURL(url);
        callback({ success: false, message: "图片转换失败" });
      };
      
      // 加载 SVG
      img.src = url;
    } else {
      // 本地测试模式下的 SVG 导出实现
      try {
        
        // 创建下载链接
        const link = document.createElement("a");
        link.href = url;
        link.download = "family-tree.svg";
        document.body.appendChild(link);
        link.click();
        
        // 清理
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        callback({ success: true, message: "SVG 已成功保存" });
      } catch (error) {
        callback({ success: false, message: error.message });
      }
    }
  });
}

// 将函数挂载到 window 对象
window.handleSaveSVGAsImage = handleSaveSVGAsImage;