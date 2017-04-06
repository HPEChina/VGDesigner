function js2data(json) {
    var nodes = { edge: [] },
        properties = {
            target: 'string',
            source: 'string',
            style: 'string',
            id: 'string',
            parent: 'string',
            intrinsic: 'object',
            extended: 'object',
            userFunc: 'object'
        }
    for (var i = 0; i < json.length; i++) {
        var item = json[i]
        var key_ = item.object ? 'object' : 'mxCell'
        var currentId = item[key_ + '@id']
        var parentId = item[key_ + '@parent']
        if (currentId === '0' || currentId === '1') continue
        if (parentId === '0' || parentId === '1') {
            delete item[key_ + '@parent'] //parent==0 父节点为画板,parent==1 父节点为空节点
            parentId = 0
        }
        if (item[key_ + '@edge']) {
            nodes.edge.push({ properties: [{ property: [] }] })
            for (var key in properties)
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
        for (var key in properties)
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
    var keys = Object.keys(nodes)
    for (var index = 0; index < keys.length; index++) {
        var parentKey = nodes[keys[index]].parent
        if (parentKey) {
            var parentIndex = keys.indexOf(parentKey)
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
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i]
        var parentId = nodes[key].parent
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
    var arr = []
    for (var key in obj) {
        arr.push(obj[key])
    }
    return arr
}
function graph2data(graph, interfaceParams) {
    var nodes = js2data(graph)
    var edge = nodes.edge
    delete nodes.edge
    var keys = graphNodeSort(nodes)
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
if (typeof module !== 'undefined')
    module.exports = {
        js2data: js2data,
        graphNodeSort: graphNodeSort,
        list2tree: list2tree,
        obj_values: obj_values
    }
