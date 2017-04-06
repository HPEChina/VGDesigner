function graph2data(graph, interfaceParams) {
    let nodes = js2data(graph)
    const edge = nodes.edge
    delete nodes.edge
    const keys = graphNodeSort(nodes)
    nodes = list2tree(nodes, keys)
    if (interfaceParams.type === 'model') {
        nodes = {
            environment: {
                properties: [{
                    property: [{ "$": { "name": 'envType', "value": 'model' } },
                    { "$": { "name": 'uuid', "value": interfaceParams.id } },
                    { "$": { "name": 'productLine', "value": interfaceParams.designLibraryId } },
                    { "$": { "name": 'author', "value": interfaceParams.user || interfaceParams.author } },
                    { "$": { "name": 'intrinsic', "value": graph[0]['object@intrinsic'] } },
                    { "$": { "name": 'extended', "value": graph[0]['object@extended'] } },
                    { "$": { "name": 'userFunc', "value": graph[0]['object@userFunc'] } }]
                }],
                nodes: [{ node: obj_values(nodes) }]
            }
        }
    } else {
        nodes = {
            environment: {
                properties: [{
                    property: [{ "$": { "name": 'envType', "value": 'topology' } },
                    { "$": { "name": 'uuid', "value": interfaceParams.id } },
                    { "$": { "name": 'designLibraryId', "value": interfaceParams.designLibraryId } },
                    { "$": { "name": 'author', "value": interfaceParams.user || interfaceParams.author } },
                    { "$": { "name": 'intrinsic', "value": graph[0]['object@intrinsic'] } },
                    { "$": { "name": 'extended', "value": graph[0]['object@extended'] } },
                    { "$": { "name": 'userFunc', "value": graph[0]['object@userFunc'] } }]
                }],
                nodes: [{ node: obj_values(nodes) }],
                topology: [{ edge: edge }]
            }
        }
    }
    return nodes
}
function js2data(json) {
    const nodes = { edge: [] }, properties = { target: 'string', source: 'string', style: 'string', id: 'string', parent: 'string', intrinsic: 'object', extended: 'object', userFunc: 'object' }
    for (let item of json) {
        const key_ = item.object ? 'object' : 'mxCell'
        const currentId = item[key_ + '@id']
        let parentId = item[key_ + '@parent']
        if (currentId === '0' || currentId === '1') continue
        if (parentId === '0' || parentId === '1') {
            delete item[key_ + '@parent'] //parent==0 父节点为画板,parent==1 父节点为空节点
            parentId = 0
        }
        if (item[key_ + '@edge']) {
            nodes.edge.push({ properties: [{ property: [] }] })
            for (let key in properties)
                if (item[key_ + '@' + key])
                    nodes.edge[nodes.edge.length - 1].properties[0].property.push({
                        "$": {
                            "name": key,
                            "value": item[key_ + '@' + key]
                        }
                    })
            continue
        }
        if (!nodes[currentId]) nodes[currentId] = { properties: [{ property: [] }] } //新建node
        for (let key in properties)
            if (item[key_ + '@' + key])
                nodes[currentId].properties[0].property.push({
                    "$": {
                        "name": key,
                        "value": item[key_ + '@' + key]
                    }
                })
        if (key_ == 'object') parentId = parentId || item[key_]['mxCell@parent']
        if (parentId && parentId !== '0' && parentId !== '1') {
            nodes[currentId].parent = parentId
            if (!nodes[parentId]) nodes[parentId] = { properties: [{ property: [] }] } //新建node
            if (!nodes[parentId].nodes) nodes[parentId].nodes = [{ node: [] }]
        }
    }
    return nodes
}
/*
模型节点排序,v4.0
*/
function graphNodeSort(nodes) {
    const keys = Object.keys(nodes)
    for (let index = 0; index < keys.length; index++) {
        const parentKey = nodes[keys[index]].parent
        if (parentKey) {
            const parentIndex = keys.indexOf(parentKey)
            if (index > parentIndex) {
                keys.push(keys.splice(parentIndex, 1)[0])
                // keys.splice(index+1, 0, keys.splice(parentIndex, 1)[0]);
                index--;
            }
        }
    }
    return keys
}
function list2tree(nodes, keys) {
    for (let key of keys) {
        const parentId = nodes[key].parent
        if (parentId) {
            delete nodes[key].parent
            if (!nodes[parentId]) {
                console.error('graphNodeSort排序错误')
                continue
            }
            nodes[parentId].nodes[0].node.push(nodes[key])
            delete nodes[key]
        }
    }
    return nodes
}
function obj_values(obj) {
    const arr = []
    for (let key in obj) {
        arr.push(obj[key])
    }
    return arr
}
if (typeof module !== 'undefined')
    module.exports = {
        js2data: js2data,
        graphNodeSort: graphNodeSort,
        list2tree: list2tree,
        obj_values: obj_values
    }
