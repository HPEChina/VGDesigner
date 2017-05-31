/**
 * Created by pangx on 2017/3/20.
 */
function Footwall(editorUi, container)
{
    this.editorUi = editorUi;
    this.container = container;
    this.staticElements = [];
    this.init();

    // Global handler to hide the current menu
    // this.gestureHandler = mxUtils.bind(this, function(evt)
    // {
    //     if (this.editorUi.currentMenu != null && mxEvent.getSource(evt) != this.editorUi.currentMenu.div)
    //     {
    //         this.hideMenu();
    //     }
    // });
    //
    // mxEvent.addGestureListeners(document, this.gestureHandler);

};

/**
 * Image element for the dropdown arrow.
 */
Footwall.prototype.dropdownImageHtml = '<img border="0" style="position:absolute;right:4px;top:' +
    ((!EditorUi.compactUi) ? 8 : 6) + 'px;" src="' + Footwall.prototype.dropdownImage + '" valign="middle"/>';


/**
 * Array that contains the DOM nodes that should never be removed.
 */
Footwall.prototype.staticElements = null;

/**
 * textarea
 */
Footwall.prototype.textarea = null;

/**
 * code
 */
Footwall.prototype.code = null;
/**
 * Code type
 */
Footwall.prototype.codeType = null;

/**
 * code type element
 */
Footwall.prototype.codeChange = {};

/**
 * init
 */
Footwall.prototype.init = function()
{
    var div = document.createElement('div');
    div.id = 'textBoard';
    div.style.height = '100%';
    div.style.width = '100%';
    div.style.backgroundColor = '#ebebeb';
    this.editorUi.footwallContainer.appendChild(div);

    var tabDiv = document.createElement('div');
    tabDiv.style.height = '25px';
    tabDiv.style.width = '100%';
    tabDiv.style.backgroundColor = '#ffffff';
    div.appendChild(tabDiv);

    var intervalDiv = document.createElement('div');
    intervalDiv.style.height = '1px';
    intervalDiv.style.width = '100%';
    intervalDiv.style.backgroundColor = '#cccccc';
    div.appendChild(intervalDiv);

    var conDiv = document.createElement('div');
    conDiv.style.position = 'absolute';
    conDiv.id = 'conDiv';
    // 3/27
    conDiv.style.width = '99%';
    conDiv.style.left = '1%';
    // 3/27
    conDiv.style.top = '26px';
    conDiv.style.height = 'calc(100% - 28px)';
    conDiv.style.border = '0px';
    // conDiv.style.marginBottom = '16px';
    div.appendChild(conDiv);


    var changeXml = document.createElement('div');
    changeXml.className = 'gecodeTab codeSelected';
    changeXml.innerHTML = 'XML';
    tabDiv.appendChild(changeXml);
    this.codeChange.xml = changeXml;

    var changeJson = document.createElement('div');
    changeJson.className = 'gecodeTab';
    changeJson.innerHTML = 'JSON';
    tabDiv.appendChild(changeJson);
    this.codeChange.json = changeJson;

    var changeYaml = document.createElement('div');
    changeYaml.className = 'gecodeTab';
    changeYaml.innerHTML = 'YAML';
    tabDiv.appendChild(changeYaml);
    this.codeChange.yaml = changeYaml;

    var transcodeJson = document.createElement('div');
    transcodeJson.className = 'gecodeTab';
    transcodeJson.innerHTML = 'Transcode(Json)';
    tabDiv.appendChild(transcodeJson);
    this.codeChange.transcode = transcodeJson;

    var gXml = this.editorUi.editor;

    this.codeType = "xml";

    var addListenerCodeChange = mxUtils.bind(this, function(o)
    {
        mxEvent.addListener(this.codeChange[o], 'click', mxUtils.bind(this, function(){
            this.codeType = o;
            conDiv.innerHTML = "";
            this.textarea = document.createElement('textarea');
            conDiv.appendChild(this.textarea);

            var graphXml = gXml.getGraphXml(this.editorUi), tValue, mode;

            okBtn.removeAttribute('disabled');
            if(o == 'xml') {
                tValue = mxUtils.getPrettyXml(graphXml);
                mode = 'xml';
            }
            else if(o == 'json') {
                var xmlDoc = mxUtils.parseXml(mxUtils.getXml(graphXml));
                tValue = CodeTranslator.xml2json(xmlDoc, "  ");
                tValue = tValue.replace(/\\&quot;/g, '\\\\\\"')
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&#39;/g, "\'")
                    .replace(/&quot;/g, '\\"')
                mode = 'javascript';
            }
            else if(o == 'yaml') {
                var xmlDoc = mxUtils.parseXml(mxUtils.getXml(graphXml));
                tValue = CodeTranslator.xml2json(xmlDoc, "  ");
                tValue = tValue.replace(/\\&quot;/g, '\\\\\\"')
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&#39;/g, "\'")
                    .replace(/&quot;/g, '\\"')
                tValue = jsyaml.dump(JSON.parse(tValue));
                mode = 'yaml';
            }
            else if(o == 'transcode') {
                okBtn.setAttribute('disabled', 'disabled');
                // var jsonTs = {};
                // if ( this.editorUi.interfaceParams.type == 'model') {
                //     var value = gXml.graph.getModel().getRoot().value;
                //     if (value != null) {
                //         var intrinsic = JSON.parse(value.getAttribute('intrinsic'));
                //         var extended = JSON.parse(value.getAttribute('extended'));
                //         // var userfunc = JSON.parse(value.getAttribute('userFunc'));
                //         var name = '', value = '', desc = '', type = '';
                //         if (intrinsic.length > 0) {
                //             for (var i in intrinsic) {
                //                 name = intrinsic[i].name;
                //                 value = intrinsic[i].value[0];
                //                 jsonTs[name] = value;
                //             }
                //             jsonTs.productLine = this.editorUi.interfaceParams.designLibraryId;
                //             jsonTs.author = this.editorUi.interfaceParams.author;
                //         }
                //         if (extended.length > 0) {
                //             if (jsonTs.properties == null) {
                //                 jsonTs.properties = [];
                //             }
                //             for (var j in extended) {
                //                 var obj = {};
                //                 name = extended[j].name;
                //                 type = extended[j].dataType;
                //                 value = extended[j].value[0];
                //                 desc = extended[j].description;
                //                 obj.name = name;
                //                 obj.type = type;
                //                 obj.defaultValue = value;
                //                 obj.description = desc;
                //                 jsonTs.properties.push(obj);
                //             }
                //         }
                //         // if (userfunc.length > 0) {
                //         //     if (jsonTs.properties == null) {
                //         //         jsonTs.properties = [];
                //         //     }
                //         //     for (var j in extended) {
                //         //         var obj = {};
                //         //         name = userfunc[j].name;
                //         //         value = userfunc[j].value[0];
                //         //         desc = userfunc[j].description;
                //         //         obj.attribute = name;
                //         //         obj.value = value;
                //         //         obj.description = desc;
                //         //         jsonTs.properties.push(obj);
                //         //     }
                //         // }
                //     }
                // }
                var xmlDoc = mxUtils.parseXml(mxUtils.getXml(graphXml));
                var graphJSONData = CodeTranslator.xml2json(xmlDoc, "  ")
                    .replace(/\\&quot;/g, '\\\\\\"')
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&#39;/g, "\'")
                    .replace(/&quot;/g, '\\"')
                var jsonTs = js2data(
                    JSON.parse(graphJSONData).mxGraphModel.root,
                    this.editorUi.interfaceParams
                );
                if (this.editorUi.interfaceParams.id) jsonTs.properties.id = this.editorUi.interfaceParams.id;
                var authorData = this.editorUi.interfaceParams.user || this.editorUi.interfaceParams.author;
                if (authorData) jsonTs.properties.author = authorData
                if (this.editorUi.interfaceParams.from) jsonTs.properties.from = this.editorUi.interfaceParams.from;
                if (this.editorUi.interfaceParams.type !== 'model') {//topo
                    jsonTs.properties.type = 'topology';
                    if (this.editorUi.interfaceParams.designLibraryId) jsonTs.properties.designLibraryId = this.editorUi.interfaceParams.designLibraryId;
                } else {//model
                    jsonTs.properties.type = 'model';
                    if (this.editorUi.interfaceParams.designLibraryId) jsonTs.properties.productLine = this.editorUi.interfaceParams.designLibraryId;
                }
                    
                tValue = mxUtils.getPrettyJSON(jsonTs);
                mode = 'javascript';
            }

            this.textarea.value = tValue.replace(/&quot;/ig, "'");

            this.codeChange[o].className = 'gecodeTab codeSelected';
            for(var k in this.codeChange) {
                if(k != o) {
                    this.codeChange[k].className = 'gecodeTab';
                }
            }

            this.code = CodeMirror.fromTextArea(this.textarea, {
                lineNumbers: true,
                smartIndent: true,
                mode: mode
            });

            this.code.on('change',mxUtils.bind(this, function(){
                this.textarea.value = this.code.getValue();
            }));

        }));
    });

    for(var o in this.codeChange) {
        addListenerCodeChange(o);
    }

    var select = document.createElement('select');
    select.style.width = '180px';
    select.style.height = '20px';
    select.style.marginLeft = '40px';
    select.style.float = 'left';
    // 3/27
    select.style.marginTop = '3px';

    var replaceOption = document.createElement('option');
    replaceOption.setAttribute('value', 'replace');
    mxUtils.write(replaceOption, mxResources.get('replaceExistingDrawing'));
    select.appendChild(replaceOption);

    var importOption = document.createElement('option');
    importOption.setAttribute('value', 'import');
    mxUtils.write(importOption, mxResources.get('addToExistingDrawing'));
    select.appendChild(importOption);
    tabDiv.appendChild(select);

    var okBtn = mxUtils.button(mxResources.get('ok'), mxUtils.bind(this, function()
    {
        // Removes all illegal control characters before parsing
        var data = this.editorUi.editor.graph.zapGremlins(mxUtils.trim(this.textarea.value));
        var error = null;

        if (select.value == 'replace') {
            this.editorUi.editor.graph.model.beginUpdate();
            try {
                if (this.codeType == 'json') {
                    data = data.replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/\'/g, "&#39;")
                        .replace(/\\"/g, '&quot;');
                    data = CodeTranslator.json2xml(data);
                }
                else if(this.codeType == 'yaml') {
                    data = JSON.stringify(jsyaml.load(data));
                    data = data.replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/\'/g, "&#39;")
                        .replace(/\\"/g, '&quot;');
                    data = CodeTranslator.json2xml(data);
                }
                data = data.replace(/'/g, '&quot;');
                this.editorUi.editor.setGraphXml(mxUtils.parseXml(data).documentElement);
            }
            catch (e) {
                error = e;
            }
            finally {
                this.editorUi.editor.graph.model.endUpdate();
            }
        }
        else if (select.value == 'import') {
            this.editorUi.editor.graph.model.beginUpdate();
            try {
                if(this.codeType == 'json') {
                    data = data.replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/\'/g, "&#39;")
                        .replace(/\\"/g, '&quot;')
                    data = CodeTranslator.json2xml(data);
                }
                else if(this.codeType == 'yaml') {
                    data = JSON.stringify(jsyaml.load(data));
                    data = data.replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")
                        .replace(/\'/g, "&#39;")
                        .replace(/\\"/g, '&quot;')
                    data = CodeTranslator.json2xml(data);
                }
                data = data.replace(/'/g, '&quot;');
                var doc = mxUtils.parseXml(data);
                var model = new mxGraphModel();
                var codec = new mxCodec(doc);
                codec.decode(doc.documentElement, model);

                var children = model.getChildren(model.getChildAt(model.getRoot(), 0));
                this.editorUi.editor.graph.setSelectionCells(this.editorUi.editor.graph.importCells(children));
            }
            catch (e) {
                error = e;
            }
            finally {
                this.editorUi.editor.graph.model.endUpdate();
            }
        }

        if (error != null) {
            mxUtils.alert(error.message);
        }
    }));
    okBtn.className = 'btn-purple';
    okBtn.style.width = '50px';
    okBtn.style.height = '18px';
    // 3/27
    okBtn.style.marginTop = '4px';
    okBtn.style.float = 'left';
    okBtn.style.marginLeft = '15px';
    tabDiv.appendChild(okBtn);
};

/**
 *
 */
Footwall.prototype.reset = function()
{
    this.codeChange.xml.click();
};

/**
 * Adds a handler for showing a menu in the given element.
 */
// Footwall.prototype.destroy = function()
// {
//     if (this.gestureHandler != null)
//     {
//         mxEvent.removeGestureListeners(document, this.gestureHandler);
//         this.gestureHandler = null;
//     }
// };
