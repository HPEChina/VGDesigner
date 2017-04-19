function js2data(json, interfaceParams) {
    /*
    画图规则:parent在前,child在后(先定义后使用)
    */
    var relations = [], resources = {}, resourcesID = [], properties = {}
    for (var i = 0; i < json.length; i++) {
        var item = json[i],
            key_ = item.object ? 'object' : 'mxCell',
            currentId = item[key_ + '@id']
        if (currentId == '1') continue
        if (key_ == 'object') {//获取模型属性
            var resources_properties = { id: currentId },
                operands = [],
                property = item['object@intrinsic']
            if (property) {
                property = JSON.parse(property.replace(/&quot;/ig, '"'))
                for (var j = 0; j < property.length; j++) {
                    var prop = property[j]
                    if (prop.operator.toString() === '==' && prop.logic.toString() === 'none') {
                        resources_properties[prop.name] = prop.value[0]
                    } else {
                        operands.push(getOperand(prop))
                    }
                }
            }
            property = item['object@extended']
            if (property) {
                property = JSON.parse(property.replace(/&quot;/ig, '"'))
                for (j = 0; j < property.length; j++) {
                    var prop = property[j]
                    operands.push(getOperand(prop))
                }
            }
            property = item['object@userFunc']
            if (property) {
                property = JSON.parse(property.replace(/&quot;/ig, '"'))
                for (j = 0; j < property.length; j++) {
                    var prop = property[j]
                    operands.push(getOperand(prop))
                }
            }
            operands = { operands: operands }
            if (currentId === '0') {
                if (interfaceParams.type !== 'model') {
                    properties = resources_properties
                    continue
                }
                properties = { name: resources_properties.name }
            }
        } else if (item['mxCell@edge']) {//添加连线
            if (interfaceParams.type !== 'model') {
                relations.push({
                    properties: {
                        id: currentId,
                        name: item['mxCell@name'] || '',
                        type: item['mxCell@type'] || '',
                        sourceId: item['mxCell@source'],
                        targetId: item['mxCell@target']
                    },
                    relations: []
                })
            }
            continue
        } else if (currentId === '0' && interfaceParams.type !== 'model') continue
        resourcesID.push(currentId)
        resources[currentId] = {
            properties: resources_properties || { id: currentId },
            operand: operands,
            resources: [],
            parent: key_ == 'object' ? item['object']['mxCell@parent'] : item['mxCell@parent']
        }
    }
    relations.map(function (relation) {
        var ids = findDevice(resources, relation.properties.sourceId, relation.properties.targetId)
        relation.properties.sourceDevId = ids.sid
        relation.properties.targetDevId = ids.tid
        return relation
    })
    resources = { properties: properties, resources: list2tree(resources, resourcesID) }

    if (interfaceParams.type !== 'model') {
        resources.relations = relations
        resources.properties = {
            name: interfaceParams.name || '',
            type: 'topology',
            id: interfaceParams.id,
            designLibraryId: interfaceParams.designLibraryId,
            author: interfaceParams.user || interfaceParams.author,
            from: interfaceParams.from,
            userdefine: resources.properties
        }
    } else {
        resources.properties = {
            name: resources.properties.name,
            type: 'model',
            id: interfaceParams.id,
            productLine: interfaceParams.designLibraryId,
            author: interfaceParams.user || interfaceParams.author,
            from: interfaceParams.from
        }
    }

    return resources
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
    if (composeType.toString() === 'none') return operand
    operand = {
        operands: [operand],
        composeType: composeType[0]
    }
    for (var i = 1; i < composeType.length; i++) {
        operand.operands.push({
            key: key,
            value: values[i],
            operator: operator[i]
        })
        if (operand.composeType != composeType[i] && composeType[i] !== 'none') {
            operand = {
                operands: [operand],
                composeType: composeType[i]
            }
        }
    }
    return operand
}
function findDevice(resources, sid, tid) {
    console.log(resources, sid, tid)
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
if (typeof module !== 'undefined')
    module.exports = {
        js2data: js2data,
        getOperand: getOperand,
        findDevice: findDevice,
        list2tree: list2tree
    }
