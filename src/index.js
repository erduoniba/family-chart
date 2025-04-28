// 导入方式：
// 1、默认导入方式：
import CalculateTree from "./CalculateTree/CalculateTree.js"
import createStore from "./createStore.js"
import view from "./view/view.js"
import createSvg from "./view/view.svg.js"

// 2、命名空间导入
import * as handlers from './handlers.js'
import * as elements from './elements.js'
import * as htmlHandlers from './view/view.html.handlers.js'
import * as icons from './view/elements/Card.icons.js'
import createChart from './createChart.js'

import CardSvg from './Cards/CardSvg.js'
import CardHtml from './Cards/CardHtml.js'

// 导出：使用 export default 导出一个对象
// 这个对象包含了所有导入的模块和功能。
export default {
  CalculateTree,
  createStore,
  view,
  createSvg,
  handlers,
  elements,
  htmlHandlers,
  icons,
  createChart,

  CardSvg,
  CardHtml,
}

/*
export:
  用于从 JavaScript 模块中导出函数、对象、原始值等。它是实现模块化编程的重要工具。

默认导出（Default Export）是 ES6 模块系统中的一个重要特性
// 导出
export default function() { ... }

// 导入
import myFunction from './module';
*/