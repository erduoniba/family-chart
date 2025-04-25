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
  if (window.personNodeHandler) {
    window.saveSVGCallback = function (result) {
      callback(result);
    };
    personNodeHandler.saveSVG("saveSVGCallback");
  } else {
    // 本地测试模式下的 SVG 导出实现
    try {
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
      
      // 获取 SVG 的尺寸
      const bbox = svgElement.getBBox();
      const width = bbox.width;
      const height = bbox.height;
      
      // 设置克隆 SVG 的属性
      clonedSvg.setAttribute("width", width);
      clonedSvg.setAttribute("height", height);
      
      // 将 SVG 转换为字符串
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(clonedSvg);
      
      // 创建 Blob
      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(svgBlob);
      
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
}