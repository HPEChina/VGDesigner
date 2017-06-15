/**
 * JSON图形转数据,nodejs json拓扑转数据模块
 * 画图规则:parent在前,child在后(先定义后使用)
 * 转换规则:
 * 1. 无空{}
 * 2. topo忽略底板,只保留底板静态属性作为topo属性
 * 3. kill三无,没意义(properties\operand)&没关系(relations)&没后代(嵌套子模型)
 * 4. 忽略id=1
 * 5. 模型name为底板name,topo name为filename
 * 6. 模型忽略保存时强制加组(parent=1的强加组被移除,强加组的子节点无父节点),topo忽略底板
 * 7. 性能考虑,暂不处理嵌套多层均为空的情况
 * @param {[object]} json 图形json数组
 * @param {string} envType 环境类型 model OR topo,浏览器参数
 * @returns
 */
function js2data (json, envType) {
  if (!Array.isArray(json)) return
  var relations = []// topo 连线
  var resources = {}// 图元集合
  var resourcesID = []// 图元ID数组
  var properties = {}// 图形属性
  /**
   * 获取图元属性
   * @param {string} modelID 图元ID
   * @param {object} model 图元JSON
   * @returns
   */
  function getAttrs (modelID, model) { // 获取属性面板数据
    var resourcesProperties = {}// 图元静态属性
    var operands = []// 图元动态属性
    var property = model['object@intrinsic']
    if (property) { // 静态属性
      try { property = JSON.parse(property) } catch (e) { }
      if (Array.isArray(property) && property.length) {
        if (envType !== 'model' && modelID === '0') {
          // topo忽略底板,只保留底板静态属性作为topo属性,忽略id
          property.forEach(function (prop) {
            properties[prop.name] = prop.value[0]
          })
          return
        }
        property.forEach(function (prop) {
          resourcesProperties[prop.name] = prop.value[0]
        })
        resources[modelID].active = true // 有属性
      }
    }
    if (envType !== 'model' && modelID === '0') return// topo忽略底板
    property = model['object@extended']
    if (property) { // 动态属性
      try { property = JSON.parse(property) } catch (e) { }
      if (Array.isArray(property) && property.length) {
        operands = property.map(function (prop) {
          return getOperand(prop)
        })
      }
    }
    resourcesID.push(modelID)
    resourcesProperties.id = modelID
    resources[modelID].properties = resourcesProperties
    var parentID = model['object']['mxCell@parent']
    if (parentID) {
      resources[modelID].parent = parentID
      if (parentID !== '1' && resources[parentID]) resources[parentID].active = true // 有后代
    }
    if (operands.length) {
      resources[modelID].operand = { operands: operands }
      resources[modelID].active = true // 有属性
    }
  }
  /**
   * 获取topo连线
   * @param {string} modelID 图元ID
   * @param {object} model 图元JSON
   */
  function getEdge (modelID, model) {
    if (envType !== 'model') {
      relations.push({
        properties: {
          id: modelID,
          name: model['mxCell@name'] || '',
          type: model['mxCell@type'] || '',
          sourceId: model['mxCell@source'],
          targetId: model['mxCell@target']
        }
      })
    }
  }
  while (json.length) {
    var model = json.shift()
    if (Object.prototype.toString.call(model) !== '[object Object]') return
    var _key = model.object ? 'object' : 'mxCell'
    var modelID = model[_key + '@id']
    if (!modelID || modelID === '1') continue // 忽略id=1
    if (!model['mxCell@edge'] && (modelID !== '0' || envType === 'model')) resources[modelID] = {} // 不是连线,不是topo底板
    if (_key === 'object') { // 有属性,获取
      getAttrs(modelID, model)
      continue
    }

    if (modelID === '0' && envType !== 'model') continue // topo忽略无属性的底板

    if (model['mxCell@edge']) { // 是连线
      getEdge(modelID, model)
      continue
    }

    // 无属性的模型
    resourcesID.push(modelID)
    resources[modelID].properties = { id: modelID }
    if (model['mxCell@parent']) {
      resources[modelID].parent = model['mxCell@parent']
      if (model['mxCell@parent'] !== '1' && resources[model['mxCell@parent']]) resources[model['mxCell@parent']].active = true // 有后代
    }
  }// end while

  relations.map(function (relation) {
    var ids = findDevice(resources, relation.properties.sourceId, relation.properties.targetId)
    relation.properties.sourceDevId = ids.sid
    relation.properties.targetDevId = ids.tid
    return relation
  })

  var result = {}// 返回值
  if (envType !== 'model') { // topo,双端执行
    result.properties = properties
    var resourcesTree = list2tree(resources, resourcesID)
    if (resourcesTree.length) result.resources = resourcesTree
    if (relations.length) result.relations = relations
    return result
  }
  // model,浏览器执行
  result.properties = { name: resources['0'] ? resources['0'].properties.name : '' }// 底板name属性做为model name
  resourcesTree = list2tree(resources, resourcesID)
  if (resourcesTree.length) result.resources = resourcesTree
  return result
}
/**
 * 解析动态属性
 * @param {object} prop 动态属性
 * @returns
 */
function getOperand (prop) {
  var key = prop.name// 属性名称
  var values = prop.value// 属性值
  var operator = prop.operator// 关系运算符
  var composeType = prop.logic// 逻辑运算符
  var operand = {
    key: key,
    value: values[0],
    operator: operator[0]
  }
  for (var i = 0; composeType[i] !== 'none'; i++) {
    if (operand.composeType !== composeType[i]) {
      operand = {
        operands: [operand, {
          key: key,
          value: values[i + 1],
          operator: operator[i + 1]
        }],
        composeType: composeType[i]
      }
    } else {
      operand.operands.push({
        key: key,
        value: values[i + 1],
        operator: operator[i + 1]
      })
    }
  }
  return operand
}
/**
 * 获取连线设备
 * @param {object} resources 图元集合
 * @param {string} sid 连线 source ID
 * @param {string} tid 连线 target ID
 * @returns
 */
function findDevice (resources, sid, tid) {
  var sparent = '1'
  var tparent = '1'
  if (sid && resources[sid]) {
    resources[sid].active = true // 有关系
    sparent = resources[sid].parent
  }
  if (tid && resources[tid]) {
    resources[tid].active = true // 有关系
    tparent = resources[tid].parent
  }
  while ((sparent && sparent !== '1') || (tparent && tparent !== '1')) {
    if (sparent !== '1') {
      sid = sparent
      sparent = resources[sid].parent
    }
    if (tparent !== '1') {
      tid = tparent
      tparent = resources[tid].parent
    }
  }
  return { sid: sid, tid: tid }
}
/**
 * 生成嵌套结构
 * @param {object} resources 图元集合
 * @param {[string]} ids 图元ID数组
 * @returns
 */
function list2tree (resources, ids) {
  while (ids.length) {
    var id = ids.pop()
    if (!resources[id].active) { // kill三无,没意义(properties\operand)&没关系(relations)&没后代(嵌套子模型)
      delete resources[id]
      continue
    }
    delete resources[id].active
    var parentId = resources[id].parent
    delete resources[id].parent
    if (parentId) {
      if (!resources[parentId]) parentId = '0'// 忽略保存模型时强制加组(parent=1的强加组被移除,强加组的子节点无父节点),topo忽略底板
      if (resources[parentId]) {
        if (!resources[parentId].resources) resources[parentId].resources = []
        resources[parentId].resources.push(resources[id])
        delete resources[id]
      }
    }
  }
  return objValues(resources)
}
/**
 * Object.values(obj)
 * @param {object} obj 嵌套结构图元集合
 * @returns {[object]} 图元数组
 */
function objValues (obj) {
  if (Object.values) return Object.values(obj)
  var arr = []
  for (var key in obj) {
    arr.push(obj[key])
  }
  return arr
}
// 供node解析xml图复用
if (typeof module !== 'undefined') {
  module.exports = {
    js2data: js2data,
    getOperand: getOperand,
    list2tree: list2tree
  }
}
