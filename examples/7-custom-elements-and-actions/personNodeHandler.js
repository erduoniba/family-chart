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