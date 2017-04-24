/*
画图规则:parent在前,child在后(先定义后使用)
*/
function js2data(json, envType) {
    var relations = [], resources = {}, resourcesID = [], properties = { name: '', id: '', type: '', author: '', from: '' }
    function getAttrs(modelID, model) {//获取属性面板数据
        var resources_properties = {},
            operands = [],
            property = model['object@intrinsic']
        if (property) {
            property = JSON.parse(property.replace(/&quot;/ig, '"'))
            if (envType !== 'model' && modelID === '0') {
                //topo忽略底板,只保留底板静态属性作为topo属性,忽略id
                return property.forEach(function (prop) {
                    if (prop.operator.toString() === '==' && prop.logic.toString() === 'none') {
                        properties[prop.name] = prop.value[0]
                    }
                })
            }
            property.forEach(function (prop) {
                if (prop.operator.toString() === '==' && prop.logic.toString() === 'none') {
                    resources_properties[prop.name] = prop.value[0]
                } else {
                    operands.push(getOperand(prop))
                }
            })
        }
        property = model['object@extended']
        if (property) {
            property = JSON.parse(property.replace(/&quot;/ig, '"'))
            property.forEach(function (prop) {
                operands.push(getOperand(prop))
            })
        }
        property = model['object@userFunc']
        if (property) {
            property = JSON.parse(property.replace(/&quot;/ig, '"'))
            property.forEach(function (prop) {
                operands.push(getOperand(prop))
            })
        }
        resourcesID.push(modelID)
        resources_properties.id = modelID
        resources[modelID] = {
            properties: resources_properties,
            operand: { operands: operands },
            resources: [],
            parent: model['object']['mxCell@parent']
        }
    }
    function getEdge(modelID, model) {
        if (envType !== 'model') {
            relations.push({
                properties: {
                    id: modelID,
                    name: model['mxCell@name'] || '',
                    type: model['mxCell@type'] || '',
                    sourceId: model['mxCell@source'],
                    targetId: model['mxCell@target']
                },
                relations: []
            })
        }
    }
    console.time('convert')
    while (json.length) {
        var model = json.shift(),
            _key = model.object ? 'object' : 'mxCell',
            modelID = model[_key + '@id']

        if (modelID == '1') continue //忽略id=1

        if (_key == 'object') {//有属性,获取
            getAttrs(modelID, model)
            continue
        }

        if (modelID === '0' && envType !== 'model') continue //topo忽略无属性的底板

        if (model['mxCell@edge']) {//是连线
            getEdge(modelID, model)
            continue
        }

        //无属性的模型
        resourcesID.push(modelID)
        resources[modelID] = {
            properties: { id: modelID },
            resources: [],
            parent: model['mxCell@parent']
        }

    }//end while
    relations.map(function (relation) {
        var ids = findDevice(resources, relation.properties.sourceId, relation.properties.targetId)
        relation.properties.sourceDevId = ids.sid
        relation.properties.targetDevId = ids.tid
        return relation
    })
    if (envType !== 'model') {//topo
        return {
            properties: properties,
            resources: list2tree(resources, resourcesID),
            relations: relations
        }
    }
    //model
    return {
        properties: { name: resources['0'] ? resources['0'].properties.name : '' },//底板name属性做为model name,err:有属性无模型时root节点是对象而非数组
        resources: list2tree(resources, resourcesID)
    }
}
function getOperand(prop) {
    var key = prop.name,
        values = prop.value,
        operator = prop.operator,
        composeType = prop.logic,
        operand = {
            key: key,
            value: values[0],
            operator: operator[0]
        }
    for (var i = 0; composeType[i] !== 'none'; i++) {
        if (operand.composeType != composeType[i]) {
            operand = {
                operands: [operand, {
                    key: key,
                    value: values[i + 1],
                    operator: operator[i + 1]
                }],
                composeType: composeType[i]
            }
        } else
            operand.operands.push({
                key: key,
                value: values[i + 1],
                operator: operator[i + 1]
            })
    }
    return operand
}
function findDevice(resources, sid, tid) {
    var sparent = resources[sid].parent,
        tparent = resources[tid].parent
    while (sparent !== '1' || tparent !== '1') {
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
function list2tree(resources, ids) {//生成嵌套结构
    while (ids.length) {
        var id = ids.pop()
        var parentId = resources[id].parent
        delete resources[id].parent
        if (parentId === '1') parentId = '0'
        if (parentId && resources[parentId]) {
            resources[parentId].resources.push(resources[id])
            delete resources[id]
        }
    }
    return obj_values(resources)
}
function obj_values(obj) {
    var arr = []
    for (var key in obj) {
        arr.push(obj[key])
    }
    return arr
}
if (typeof module !== 'undefined')//供node解析xml图复用
    module.exports = {
        js2data: js2data,
        getOperand: getOperand,
        list2tree: list2tree
    }
