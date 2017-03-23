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
    div.style.backgroundColor = '#f5f5f5';
    this.editorUi.footwallContainer.appendChild(div);

    var tabDiv = document.createElement('div');
    tabDiv.style.height = '28px';
    tabDiv.style.width = '100%';
    tabDiv.style.backgroundColor = '#b3b3b3';
    div.appendChild(tabDiv);

    var intervalDiv = document.createElement('div');
    intervalDiv.style.height = '3px';
    intervalDiv.style.width = '100%';
    intervalDiv.style.backgroundColor = '#d9d9d9';
    div.appendChild(intervalDiv);

    var conDiv = document.createElement('div');
    conDiv.style.position = 'absolute';
    conDiv.id = 'conDiv';
    conDiv.style.width = '96%';
    conDiv.style.left = '1%';
    conDiv.style.height = '88%';
    conDiv.style.border = '0px';
    div.appendChild(conDiv);


    var changeXml = document.createElement('div');
    changeXml.style.width = '50px';
    changeXml.style.height = '22px';
    changeXml.style.lineHeight = '22px';
    changeXml.style.fontSize = '9pt';
    changeXml.style.textAlign = 'center';
    changeXml.style.marginTop = '5px';
    changeXml.style.marginLeft = '20px';
    changeXml.style.cursor = 'pointer';
    changeXml.innerHTML = 'XML';
    changeXml.style.float = 'left';
    changeXml.style.backgroundColor = '#d9d9d9';
    changeXml.style.borderLeft = '1px solid #868686';
    changeXml.style.borderTop = '1px solid #868686';
    changeXml.style.borderRight = '1px solid #868686';
    tabDiv.appendChild(changeXml);
    this.codeChange.xml = changeXml;

    var changeJson = document.createElement('div');
    changeJson.style.width = '50px';
    changeJson.style.height = '22px';
    changeJson.style.lineHeight = '22px';
    changeJson.style.fontSize = '9pt';
    changeJson.style.textAlign = 'center';
    changeJson.style.marginTop = '5px';
    changeJson.style.cursor = 'pointer';
    changeJson.innerHTML = 'JSON';
    changeJson.style.float = 'left';
    changeJson.style.backgroundColor = '#b3b3b3';
    changeJson.style.borderTop = '1px solid #868686';
    changeJson.style.borderRight = '1px solid #868686';
    tabDiv.appendChild(changeJson);
    this.codeChange.json = changeJson;

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

            if(o == 'xml') {
                tValue = mxUtils.getPrettyXml(graphXml);
                mode = 'xml';
            }
            else if(o == 'json') {
                var xmlDoc = mxUtils.parseXml(mxUtils.getXml(graphXml));
                tValue = CodeTranslator.xml2json(xmlDoc, "  ");
                mode = 'javascript';
            }

            this.textarea.value = tValue.replace(/&quot;/ig, "'");

            this.codeChange[o].style.backgroundColor = '#d9d9d9';
            for(var k in this.codeChange) {
                if(k != o) {
                    this.codeChange[k].style.backgroundColor = '#b3b3b3';
                    this.codeChange[k].style.borderBottom = '0px';
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
    select.className = 'geBtn';
    select.style.height = '20px';
    select.style.marginLeft = '40px';
    select.style.float = 'left';
    select.style.marginTop = '4px';

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
        data = data.replace(/'/g, '&quot;');
        var error = null;

        if (select.value == 'replace') {
            this.editorUi.editor.graph.model.beginUpdate();
            try {
                if(this.codeType == 'json') {
                    data = CodeTranslator.json2xml(data);
                }
                else if(this.codeType == 'yaml') {}
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
                    data = CodeTranslator.json2xml(data);
                }
                else if(this.codeType == 'yaml') {}
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
    okBtn.className = 'gePrimaryBtn';
    okBtn.style.cursor = 'pointer';
    okBtn.style.width = '50px';
    okBtn.style.height = '18px';
    okBtn.style.marginTop = '5px';
    okBtn.style.lineheight = '20px';
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
