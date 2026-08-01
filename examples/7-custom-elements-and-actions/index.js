/*
使用 import f3 from '../../src/index.js' 确实会导入该文件中默认导出对象的所有属性和方法。
你可以通过 f3 对象访问所有这些导入的函数和对象。
这种方式提供了一个统一的入口点来访问模块的所有功能，同时保持了良好的命名空间隔离。
*/
import f3 from "../../src/index.js";
import {
  handlePersonList,
  handleAddPerson,
  handleEditPerson,
  handleSaveSVGAsImage,
  handleUpdateCardImage,
} from "./personNodeHandler.js";

const DEFAULT_MAIN_ID = "lin_chengyuan";
const SHOW_ALL_PERSONS_STORAGE_KEY = "family_chart_show_all_persons";
const GENDER_FILTER_STORAGE_KEY = "family_chart_gender_filter";

// 初始化数据加载
handlePersonList({}, refresh);

// 定义全局变量
export let treeData;
let main_id, tree, svg, isSimpleTree, showAllPersons, genderFilter;

function refresh(data) {
  // 创建SVG容器
  const chartContainer = document.querySelector("#FamilyChart");
  chartContainer.querySelector("#f3Canvas")?.remove();
  svg = f3.createSvg(chartContainer);

  // 从缓存中获取 main_id
  if (!main_id) {
    main_id = localStorage.getItem("family_chart_main_id");
  }

  if (!data.find((person) => person.id === main_id)) {
    updateMainId(
      data.find((person) => person.id === DEFAULT_MAIN_ID)?.id || data[0]?.id
    );
  }

  if (isSimpleTree == null) {
    isSimpleTree = localStorage.getItem("family_chart_isSimpleTree") == 1 ? true : false;
  }
  if (showAllPersons == null) {
    showAllPersons =
      localStorage.getItem(SHOW_ALL_PERSONS_STORAGE_KEY) == 1 ? true : false;
  }
  if (genderFilter == null) {
    genderFilter = normalizeGenderFilter(
      localStorage.getItem(GENDER_FILTER_STORAGE_KEY)
    );
  }

  if (window.personNodeHandler == null) {
    // 添加保存按钮
    createSaveButton();
  }

  // 初始化树形图
  const props = {
    initial: true,
    tree_position: "fit",
    transition_time: 0,
  };
  updateTree(data, svg, onCardClick, props);
}

function onCardClick(e, d) {
  if (showAllPersons) {
    updateMainId(d.data.id);
    updateShowAllPersons(false, false);
    updateTree(treeData, svg, onCardClick, {
      initial: false,
      tree_position: "main_to_middle",
      transition_time: 1000,
    });
    return;
  }

  updateMainId(d.data.id);

  const props = {
    tree_position: "fit",
    transition_time: 1000,
  };
  updateTree(treeData, svg, onCardClick, props);
}

// 更新主节点ID的函数
export function updateMainId(_main_id, refreshTree = false, _isSimpleTree = null) {
  if (_main_id != null) {
    // 将 main_id 保存到 localStorage 中进行缓存
    main_id = _main_id;
    localStorage.setItem("family_chart_main_id", _main_id);
  }
  if (_isSimpleTree != null) {
    isSimpleTree = _isSimpleTree;
    localStorage.setItem("family_chart_isSimpleTree", isSimpleTree ? 1 : 0);
  }

  if (refreshTree) {
    // 更新树形图
    const props = {
      initial: false,
      tree_position: showAllPersons ? "fit" : "main_to_middle",
      transition_time: 1000,
    };
    updateTree(treeData, svg, onCardClick, props);
  }
}

export function updateShowAllPersons(_showAllPersons, refreshTree = false) {
  if (_showAllPersons == null) return;
  showAllPersons = _showAllPersons;
  localStorage.setItem(SHOW_ALL_PERSONS_STORAGE_KEY, showAllPersons ? 1 : 0);

  if (refreshTree) {
    updateTree(treeData, svg, onCardClick, {
      initial: false,
      tree_position: "fit",
      transition_time: 1000,
    });
  }
}

export function updateGenderFilter(_genderFilter, refreshTree = false) {
  genderFilter = normalizeGenderFilter(_genderFilter);
  localStorage.setItem(GENDER_FILTER_STORAGE_KEY, genderFilter);

  if (refreshTree && Array.isArray(treeData)) {
    updateTree(treeData, svg, onCardClick, {
      initial: false,
      tree_position: "fit",
      transition_time: 600,
    });
  }
}

export function getCurrentRenderTree(overrideMainId = main_id, data = filteredTreeData()) {
  return showAllPersons
    ? buildFullTreeLayout({
        data,
        main_id: overrideMainId,
        node_separation: isSimpleTree ? 98 : 168,
        level_separation: isSimpleTree ? 92 : 230,
      })
    : f3.CalculateTree({
        data,
        main_id: overrideMainId,
        single_parent_empty_card: false,
        node_separation: isSimpleTree ? 70 : 140,
        level_separation: isSimpleTree ? 55 : 200,
      });
}

function updateTree(data, svg, onCardClick, props) {
  treeData = data;
  const displayedData = filteredTreeData();

  if (displayedData.length === 0) {
    showGenderEmptyState();
    return;
  }

  hideGenderEmptyState();
  if (!displayedData.some((person) => person.id === main_id)) {
    updateMainId(displayedData[0].id);
  }

  const chartContainer = document.querySelector("#FamilyChart");
  if (!chartContainer.querySelector("#f3Canvas")) {
    svg = f3.createSvg(chartContainer);
  }

  tree = getCurrentRenderTree(main_id, displayedData);
  // 渲染树形图，使用自定义的Card组件
  f3.view(tree, svg, Card(tree, svg, onCardClick), props || {});
}

function normalizeGenderFilter(value) {
  return value === "male" || value === "female" ? value : "all";
}

function filteredTreeData() {
  if (genderFilter === "all") return treeData;

  const visibleGender = genderFilter === "male" ? "M" : "F";
  const visibleIds = new Set(
    treeData
      .filter((person) => person.data?.gender === visibleGender)
      .map((person) => person.id)
  );

  return treeData
    .filter((person) => visibleIds.has(person.id))
    .map((person) => ({
      ...person,
      rels: {
        ...person.rels,
        father: visibleIds.has(person.rels?.father) ? person.rels.father : undefined,
        mother: visibleIds.has(person.rels?.mother) ? person.rels.mother : undefined,
        spouses: (person.rels?.spouses || []).filter((id) => visibleIds.has(id)),
        children: (person.rels?.children || []).filter((id) => visibleIds.has(id)),
      },
    }));
}

function showGenderEmptyState() {
  const chartContainer = document.querySelector("#FamilyChart");
  chartContainer.querySelector("#f3Canvas")?.remove();
  let emptyState = document.querySelector("#genderFilterEmptyState");
  if (!emptyState) {
    emptyState = document.createElement("div");
    emptyState.id = "genderFilterEmptyState";
    emptyState.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:var(--text-color, #1d1d1f);font:500 16px -apple-system,BlinkMacSystemFont,sans-serif;text-align:center;padding:24px;";
    chartContainer.appendChild(emptyState);
  }
  emptyState.textContent = genderFilter === "male" ? "暂无男性人物" : "暂无女性人物";
}

function hideGenderEmptyState() {
  document.querySelector("#genderFilterEmptyState")?.remove();
}

function buildFullTreeLayout({
  data,
  main_id,
  node_separation = 180,
  level_separation = 220,
}) {
  const data_stash = data.map((person) => ({
    ...person,
    rels: {
      ...person.rels,
      spouses: [...(person.rels?.spouses || [])],
      children: [...(person.rels?.children || [])],
    },
  }));
  const personById = new Map(data_stash.map((person) => [person.id, person]));
  const clusters = buildClusters();
  const clustersByLevel = groupClustersByLevel(clusters);

  initializeTopLevel();
  for (let i = 1; i < clustersByLevel.length; i++) {
    layoutLevel(clustersByLevel[i], clustersByLevel[i - 1]);
  }
  for (let i = clustersByLevel.length - 2; i >= 0; i--) {
    tightenLevel(clustersByLevel[i], clustersByLevel[i + 1]);
  }
  normalizeLevels();

  const nodes = buildNodes(clusters);
  const tree = Array.from(nodes.values());
  const xExtent = extent(tree.map((node) => node.x));
  const yExtent = extent(tree.map((node) => node.y));

  return {
    data: tree,
    data_stash,
    dim: {
      width: xExtent[1] - xExtent[0] + node_separation,
      height: yExtent[1] - yExtent[0] + level_separation,
      x_off: -xExtent[0] + node_separation / 2,
      y_off: -yExtent[0] + level_separation / 2,
    },
    main_id,
    is_horizontal: false,
  };

  function buildClusters() {
    const visited = new Set();
    const clusterByPersonId = new Map();
    const result = [];

    data_stash.forEach((person) => {
      if (visited.has(person.id)) return;
      const stack = [person.id];
      const ids = [];

      while (stack.length > 0) {
        const currentId = stack.pop();
        if (visited.has(currentId) || !personById.has(currentId)) continue;
        visited.add(currentId);
        ids.push(currentId);
        const current = personById.get(currentId);
        (current.rels.spouses || []).forEach((spouseId) => {
          if (personById.has(spouseId)) stack.push(spouseId);
        });
      }

      const persons = ids
        .map((id) => personById.get(id))
        .sort(compareWithinCluster);
      const width =
        persons.length > 1 ? (persons.length - 1) * (node_separation * 0.92) : 0;
      const cluster = {
        id: ids.slice().sort().join("|"),
        level: 0,
        persons,
        width,
        centerX: 0,
        targetX: 0,
        familyKey: "",
        childOrder: 0,
        parentClusterIds: [],
      };
      persons.forEach((member) => clusterByPersonId.set(member.id, cluster));
      result.push(cluster);
    });

    result.forEach((cluster) => {
      const parentClusterIds = new Set();
      cluster.persons.forEach((person) => {
        [person.rels.father, person.rels.mother]
          .filter(Boolean)
          .forEach((parentId) => {
            const parentCluster = clusterByPersonId.get(parentId);
            if (parentCluster && parentCluster.id !== cluster.id) {
              parentClusterIds.add(parentCluster.id);
            }
          });
      });
      cluster.parentClusterIds = Array.from(parentClusterIds);
    });

    const clusterMap = new Map(result.map((cluster) => [cluster.id, cluster]));
    const indegree = new Map(result.map((cluster) => [cluster.id, cluster.parentClusterIds.length]));
    const childrenByCluster = new Map(result.map((cluster) => [cluster.id, []]));
    result.forEach((cluster) => {
      cluster.parentClusterIds.forEach((parentClusterId) => {
        childrenByCluster.get(parentClusterId)?.push(cluster.id);
      });
    });

    const mainCluster = clusterByPersonId.get(main_id) || result[0];
    if (mainCluster) {
      result.forEach((cluster) => {
        cluster.level = null;
      });

      const queue = [mainCluster.id];
      mainCluster.level = 0;

      while (queue.length > 0) {
        const clusterId = queue.shift();
        const cluster = clusterMap.get(clusterId);
        const currentLevel = cluster.level ?? 0;

        cluster.parentClusterIds.forEach((parentClusterId) => {
          const parentCluster = clusterMap.get(parentClusterId);
          if (!parentCluster) return;
          const nextLevel = currentLevel - 1;
          if (parentCluster.level == null || parentCluster.level > nextLevel) {
            parentCluster.level = nextLevel;
            queue.push(parentClusterId);
          }
        });

        (childrenByCluster.get(clusterId) || []).forEach((childClusterId) => {
          const childCluster = clusterMap.get(childClusterId);
          if (!childCluster) return;
          const nextLevel = currentLevel + 1;
          if (childCluster.level == null || childCluster.level < nextLevel) {
            childCluster.level = nextLevel;
            queue.push(childClusterId);
          }
        });
      }
    }

    const unresolvedRoots = result
      .filter((cluster) => cluster.level == null && cluster.parentClusterIds.length === 0)
      .map((cluster) => cluster.id);

    while (unresolvedRoots.length > 0) {
      const rootId = unresolvedRoots.shift();
      const rootCluster = clusterMap.get(rootId);
      if (!rootCluster || rootCluster.level != null) continue;
      rootCluster.level = 0;
      const queue = [rootId];
      while (queue.length > 0) {
        const clusterId = queue.shift();
        const cluster = clusterMap.get(clusterId);
        const childIds = childrenByCluster.get(clusterId) || [];
        childIds.forEach((childId) => {
          const childCluster = clusterMap.get(childId);
          if (!childCluster) return;
          childCluster.level = Math.max(childCluster.level ?? 0, (cluster.level ?? 0) + 1);
          indegree.set(childId, (indegree.get(childId) || 0) - 1);
          if (indegree.get(childId) === 0) queue.push(childId);
        });
      }
    }

    const minLevel = Math.min(...result.map((cluster) => cluster.level ?? 0));
    result.forEach((cluster) => {
      cluster.level = (cluster.level ?? 0) - minLevel;
    });

    result.forEach((cluster) => {
      cluster.familyKey = getFamilyKey(cluster, clusterByPersonId);
      cluster.childOrder = getChildOrder(cluster, clusterByPersonId);
    });

    return result;
  }

  function groupClustersByLevel(allClusters) {
    const grouped = [];
    allClusters.forEach((cluster) => {
      if (!grouped[cluster.level]) grouped[cluster.level] = [];
      grouped[cluster.level].push(cluster);
    });

    return grouped.filter(Boolean);
  }

  function initializeTopLevel() {
    const topLevel = clustersByLevel[0] || [];
    const gap = node_separation * 1.15;
    let cursor = 0;

    topLevel
      .sort((a, b) => compareClusters(a, b))
      .forEach((cluster, index) => {
        const halfWidth = cluster.width / 2;
        cluster.centerX = cursor + halfWidth;
        cluster.targetX = cluster.centerX;
        cursor += cluster.width;
        if (index < topLevel.length - 1) cursor += gap;
      });

    const midpoint = cursor / 2;
    topLevel.forEach((cluster) => {
      cluster.centerX -= midpoint;
      cluster.targetX = cluster.centerX;
    });
  }

  function layoutLevel(levelClusters, prevLevelClusters) {
    const familyGap = node_separation * 1.35;
    const siblingGap = node_separation * 0.95;
    const prevById = new Map(prevLevelClusters.map((cluster) => [cluster.id, cluster]));
    const families = new Map();

    levelClusters.forEach((cluster) => {
      if (!families.has(cluster.familyKey)) {
        families.set(cluster.familyKey, []);
      }
      families.get(cluster.familyKey).push(cluster);
    });

    const orderedFamilies = Array.from(families.entries())
      .map(([key, familyClusters]) => ({
        key,
        clusters: familyClusters.sort((a, b) => a.childOrder - b.childOrder || compareClusters(a, b)),
        anchorX: getFamilyAnchorX(familyClusters, prevById),
      }))
      .sort((a, b) => a.anchorX - b.anchorX);

    let previousRight = null;
    orderedFamilies.forEach((family) => {
      const familyWidth = family.clusters.reduce((sum, cluster, index) => {
        return sum + cluster.width + (index < family.clusters.length - 1 ? siblingGap : 0);
      }, 0);
      let left = family.anchorX - familyWidth / 2;
      if (previousRight != null) {
        left = Math.max(left, previousRight + familyGap);
      }

      let cursor = left;
      family.clusters.forEach((cluster, index) => {
        cluster.centerX = cursor + cluster.width / 2;
        cluster.targetX = cluster.centerX;
        cursor += cluster.width;
        if (index < family.clusters.length - 1) cursor += siblingGap;
      });
      previousRight = left + familyWidth;
    });

    recenter(levelClusters);
  }

  function tightenLevel(levelClusters, childLevelClusters) {
    const childByFamily = new Map();
    childLevelClusters.forEach((cluster) => {
      if (!childByFamily.has(cluster.familyKey)) {
        childByFamily.set(cluster.familyKey, []);
      }
      childByFamily.get(cluster.familyKey).push(cluster.centerX);
    });

    levelClusters.forEach((cluster) => {
      const childCenters = [];
      data_stash.forEach((person) => {
        if (!cluster.persons.some((member) => member.id === person.id)) return;
        (person.rels.children || []).forEach((childId) => {
          const childCluster = childLevelClusters.find((candidate) =>
            candidate.persons.some((member) => member.id === childId)
          );
          if (childCluster) childCenters.push(childCluster.centerX);
        });
      });
      if (childCenters.length > 0) {
        cluster.centerX =
          cluster.centerX * 0.55 +
          (childCenters.reduce((sum, value) => sum + value, 0) / childCenters.length) *
            0.45;
      }
    });

    levelClusters.sort((a, b) => a.centerX - b.centerX);
    enforceMinGap(levelClusters, node_separation * 1.05);
    recenter(levelClusters);
  }

  function normalizeLevels() {
    clustersByLevel.forEach((levelClusters) => {
      levelClusters.sort((a, b) => a.centerX - b.centerX);
      enforceMinGap(levelClusters, node_separation * 1.05);
      recenter(levelClusters);
    });
  }

  function buildNodes(allClusters) {
    const nodesById = new Map();
    const spouseGap = node_separation * 0.92;

    allClusters.forEach((cluster) => {
      const baseX = cluster.centerX - cluster.width / 2;
      cluster.persons.forEach((person, index) => {
        nodesById.set(person.id, {
          data: person,
          x: baseX + index * spouseGap,
          y: cluster.level * level_separation,
          depth: cluster.level,
          main: person.id === main_id,
          all_rels_displayed: true,
        });
      });
    });

    nodesById.forEach((node) => {
      const spouses = (node.data.rels.spouses || [])
        .map((spouseId) => nodesById.get(spouseId))
        .filter(Boolean);
      const children = (node.data.rels.children || [])
        .map((childId) => nodesById.get(childId))
        .filter(Boolean);
      const parents = [node.data.rels.father, node.data.rels.mother]
        .filter(Boolean)
        .map((parentId) => nodesById.get(parentId))
        .filter(Boolean);

      if (children.length > 0) node.children = children;
      if (parents.length > 0) node.parents = parents;

      const spouseAnchors = [node.x, ...spouses.map((spouse) => spouse.x)];
      node.sx =
        spouseAnchors.reduce((sum, value) => sum + value, 0) / spouseAnchors.length;
      node.sy = node.y;

      if (parents.length > 0) {
        node.psx =
          parents.reduce((sum, parent) => sum + parent.sx, 0) / parents.length;
        node.psy = parents[0].y;
      } else {
        node.psx = node.x;
        node.psy = node.y;
      }
    });

    return nodesById;
  }

  function getFamilyAnchorX(familyClusters, prevById) {
    const anchors = familyClusters.flatMap((cluster) =>
      cluster.parentClusterIds
        .map((parentClusterId) => prevById.get(parentClusterId))
        .filter(Boolean)
        .map((parentCluster) => parentCluster.centerX)
    );

    if (anchors.length === 0) return 0;
    return anchors.reduce((sum, value) => sum + value, 0) / anchors.length;
  }

  function enforceMinGap(levelClusters, gap) {
    let previousRight = null;
    levelClusters.forEach((cluster) => {
      const halfWidth = cluster.width / 2;
      if (previousRight != null) {
        cluster.centerX = Math.max(cluster.centerX, previousRight + gap + halfWidth);
      }
      previousRight = cluster.centerX + halfWidth;
    });
  }

  function recenter(levelClusters) {
    if (levelClusters.length === 0) return;
    const left = levelClusters[0].centerX - levelClusters[0].width / 2;
    const right =
      levelClusters[levelClusters.length - 1].centerX +
      levelClusters[levelClusters.length - 1].width / 2;
    const mid = (left + right) / 2;
    levelClusters.forEach((cluster) => {
      cluster.centerX -= mid;
    });
  }

  function compareClusters(a, b) {
    return (
      a.childOrder - b.childOrder ||
      a.familyKey.localeCompare(b.familyKey, "zh-Hans-CN") ||
      compareWithinCluster(a.persons[0], b.persons[0])
    );
  }

  function compareWithinCluster(a, b) {
    const genderOrder = { M: 0, F: 1 };
    const genderDiff =
      (genderOrder[a.data.gender] ?? 9) - (genderOrder[b.data.gender] ?? 9);
    if (genderDiff !== 0) return genderDiff;
    return a.data["first name"].localeCompare(
      b.data["first name"],
      "zh-Hans-CN"
    );
  }

  function getFamilyKey(cluster, clusterByPersonId) {
    const parentClusterIds = new Set();
    cluster.persons.forEach((person) => {
      [person.rels.father, person.rels.mother]
        .filter(Boolean)
        .forEach((parentId) => {
          const parentCluster = clusterByPersonId.get(parentId);
          if (parentCluster) parentClusterIds.add(parentCluster.id);
        });
    });
    const parentKey = Array.from(parentClusterIds).sort().join("|");
    return parentKey || `root::${cluster.id}`;
  }

  function getChildOrder(cluster, clusterByPersonId) {
    let best = Number.MAX_SAFE_INTEGER;
    cluster.persons.forEach((person) => {
      const parent =
        personById.get(person.rels.father) || personById.get(person.rels.mother);
      if (!parent?.rels?.children) return;
      const siblingClusterOrder = parent.rels.children
        .map((childId) => clusterByPersonId.get(childId)?.id)
        .filter(Boolean)
        .filter((value, index, arr) => arr.indexOf(value) === index);
      const index = siblingClusterOrder.indexOf(cluster.id);
      if (index >= 0) best = Math.min(best, index);
    });
    return Number.isFinite(best) ? best : 0;
  }

  function extent(values) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    return [min, max];
  }
}

// 自定义卡片组件
function Card(tree, svg, onCardClick) {
  // 定义卡片尺寸和布局参数
  const card_dim = {
    w: isSimpleTree ? 60 : 110,
    h: isSimpleTree ? 40 : 170,
    text_x: 0,
    text_y: isSimpleTree ? 10: 108,
    img_w: isSimpleTree ? 60 : 100,
    img_h: isSimpleTree ? 0 : 100,
    img_x: 5,
    img_y: 5,
    isSimpleTree: isSimpleTree
  };

  // Card 函数返回另一个函数，这个内部函数接收一个参数 d，可能代表节点数据。
  return function (d) {
    // 返回f3库的Card组件，配置各种属性和回调函数
    return f3.elements
      .Card({
        svg,
        card_dim,
        // 显示姓名
        card_display: [(d) => `${d.data["first name"]}`],

        onCardClick,
        // 启用图片显示
        img: !isSimpleTree,
        // 启用迷你树形图
        mini_tree: !isSimpleTree,
        onMiniTreeClick: onCardClick,

        // 启用卡片编辑表单
        cardEditForm: !isSimpleTree,

        // 接收点击编辑的事件回调
        cardEditForm: isSimpleTree ? null : cardEditForm,

        // 接收点击添加的事件回调
        addRelative: isSimpleTree ? null : addRelative,

        // 接收点击查看的事件回调
        onViewPerson: isSimpleTree ? null : onViewPerson,

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
      addType: parent.rels.mother && parent.rels.father ? 1 : 0,
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
      const id = nData.id ? nData.id : generateUUID();
      // 创建新成员并设置属性
      const person = { id: id, data: nData || {}, rels: rels || {} };
      // 更新关系数据
      const currentData = [
        ...new Set([
          ...tree.data.map((item) => item.data),
          ...tree.data_stash.map((item) => item),
        ]),
      ];

      // 根据添加类型处理关系
      if (nData.relationType === "spouse") {
        // 添加配偶
        if (!rels.spouses.includes(parent.id)) {
          rels.spouses = [parent.id];
        }
        parent.rels.spouses = parent.rels.spouses || [];
        if (!parent.rels.spouses.includes(person.id)) {
          parent.rels.spouses.push(person.id);
        }
      } else if (nData.relationType === "child") {
        // 添加子女
        if (parent.data.gender === "M") {
          rels.father = parent.id;
        } else {
          rels.mother = parent.id;
        }
      } else if (nData.relationType === "parent") {
        // 添加父母
        if (nData.gender === "M") {
          rels.children = [parent.id];
          parent.rels.father = person.id;

          // 如果已有母亲，建立配偶关系
          if (parent.rels.mother) {
            rels.spouses = [parent.rels.mother];
            // 在母亲节点中也添加配偶关系
            const mother = currentData.find(
              (item) => item.id === parent.rels.mother
            );
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
            const father = currentData.find(
              (item) => item.id === parent.rels.father
            );
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

      if (nData.relationType === "child") {
        // 更新父母的子女关系
        updateParentChildrenRels(parent, person.id);
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
      const currentData = [
        ...new Set([
          ...tree.data.map((item) => item.data),
          ...tree.data_stash.map((item) => item),
        ]),
      ];

      // 过滤掉要删除的数据
      const filteredData = currentData.filter((item) => {
        // 检查节点ID是否在要删除的列表中
        if (personIds.includes(item.id)) {
          return false;
        }

        // 检查并更新关系
        if (item.rels) {
          // 移除子女关系
          if (item.rels.children) {
            item.rels.children = item.rels.children.filter(
              (childId) => !personIds.includes(childId)
            );
          }

          // 移除配偶关系
          if (item.rels.spouses) {
            item.rels.spouses = item.rels.spouses.filter(
              (spouseId) => !personIds.includes(spouseId)
            );
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
      const currentData = [
        ...new Set([
          ...tree.data.map((item) => item.data),
          ...tree.data_stash.map((item) => item),
        ]),
      ];

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
        avatar: nData.avatar,
        rankName: nData.rankName,
        emperor: nData.emperor,
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

  /**
   * 处理查看人物详情
   * @param {Object} params - 包含节点数据的参数对象
   */
  function onViewPerson(params) {
    const d = params.d;
    const nodeData = d.data;
    console.log("查看人物详情:", nodeData);
    
    const personId = nodeData.id;
    const personData = nodeData.data;
    
    // 准备传递给原生的参数
    const viewParams = {
      personId: personId,
      firstName: personData["first name"] || "",
      lastName: personData["last name"] || "",
      gender: personData.gender || "",
      birthday: personData.birthday || "",
      avatar: personData.avatar || "",
      rankName: personData.rankName || "",
      emperor: personData.emperor || false
    };
    
    // 如果存在原生接口，调用原生方法
    if (window.personNodeHandler && typeof window.personNodeHandler.viewPersonDetail === 'function') {
      window.personNodeHandler.viewPersonDetail(viewParams);
    } else {
      // 本地测试模式 - 显示简单的alert
      alert(`查看人物详情:\n姓名: ${viewParams.firstName} ${viewParams.lastName}\n性别: ${viewParams.gender}\n生日: ${viewParams.birthday}`);
    }
  }

  // 卡片更新处理函数
  function onCardUpdate(d) {
    const rxy = isSimpleTree ? "6px" : "12px";

    const card_outline = d3.select(this).select(".card-outline");
    card_outline.attr("rx", rxy);
    card_outline.attr("ry", rxy);
    card_outline.style("stroke-width", isSimpleTree ? "1.5px" : "2px");

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
    const tspan = text.selectAll("tspan");
    tspan.attr("font-size", isSimpleTree? "10px" : "14px");


    // 卡片的边框视图
    const card_main_outline = d3.select(this).select(".card-main-outline");
    card_main_outline.style("stroke", "rgba(255, 255, 255, 0.88)");
    card_main_outline.style("stroke-width", isSimpleTree ? "2.5px" : "3.5px");
    if (d.data.data.emperor) {
      card_outline.style("stroke", "rgba(255, 215, 0, 0.9)");
      card_main_outline.style("stroke", "rgba(255, 215, 0, 0.9)");
    } else {
      card_outline.style("stroke", "rgba(255, 255, 255, 0.66)");
      card_main_outline.style("stroke", "rgba(255, 255, 255, 0.88)");
    }

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
          card_image.select("image").attr("href", imageData.imageData);
        }
      } catch (error) {
        console.error("处理图片数据失败:", error);
      }
    });
  }
}

/**
 * 创建并添加保存按钮
 */
function createSaveButton() {
  // 如果已存在保存按钮，先移除
  const existingButton = document.querySelector("#saveChartButton");
  if (existingButton) {
    existingButton.remove();
  }

  const saveButton = document.createElement("button");
  saveButton.id = "saveChartButton";
  saveButton.textContent = window.personNodeHandler
    ? "保存家谱图"
    : "下载家谱图";
  saveButton.className = "offline-glass-button";
  saveButton.setAttribute("aria-label", saveButton.textContent);

  saveButton.addEventListener("click", () => {
    if (saveButton.disabled) return;

    const idleLabel = saveButton.textContent;
    saveButton.disabled = true;
    saveButton.classList.add("is-saving");
    saveButton.textContent = "正在导出";

    handleSaveSVGAsImage((result) => {
      saveButton.disabled = false;
      saveButton.classList.remove("is-saving");
      saveButton.textContent = idleLabel;

      if (result.success) {
        showFeedback(
          window.personNodeHandler ? "家谱图已保存" : "家谱图已开始下载",
          "success"
        );
      } else {
        showFeedback("导出失败：" + result.message, "error");
      }
    }, "svg");
  });

  document.body.appendChild(saveButton);
}

function showFeedback(message, type) {
  const toast = document.querySelector("#offlineToast");
  if (!toast) return;

  window.clearTimeout(showFeedback.timeoutId);
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add("is-visible");

  showFeedback.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}
