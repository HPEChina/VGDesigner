/**
 * Created by jinbin on 2017/2/13.
 */

var VGDesigner = function(model, container) {
    this.model = model;
    this.container = container;
    this.urlParams(window.location.href);
    // mxLoadResources = false;
    this.loadJsCssFiles();
};

/**
 * 编辑模式加载的js文件数组
 */
VGDesigner.prototype.editorJsFiles = ['js/Init.js', 'jscolor/jscolor.js', 'sanitizer/sanitizer.min.js', 'src/js/mxClient.js', 'js/EditorUi.js',
    'js/Editor.js', 'js/Sidebar.js', 'js/Graph.js', 'js/Shapes.js', 'js/Actions.js', 'js/Menus.js', 'js/Format.js','js/Footwall.js',
    'js/Toolbar.js', 'js/Dialogs.js', 'js/FileSaver.js', 'js/CodeTranslator.js', 'js/codemirror/codemirror.js',
    'js/codemirror/javascript.js', 'js/codemirror/xml.js', 'js/codemirror/yaml.js', 'js/ModelAttribute.js', 'js/js-yaml.js', 'js/js2data.js'];

/**
 * 编辑模式加载的CSS文件名称数组
 */
VGDesigner.prototype.editorCssFiles = ['styles/inspire.css', 'styles/grapheditor.css', 'js/codemirror/codemirror.css'];

/**
 * 监控模式加载的js文件数组
 */
VGDesigner.prototype.viewerJsFiles = [];

/**
 * 监控模式加载的CSS文件名称数组
 */
VGDesigner.prototype.viewerCssFiles = [];

/**
 * Extends EditorUi to update I/O action states based on availability of backend
 */
VGDesigner.prototype.init = function(interfaceParams)
{
    var editorUiInit = EditorUi.prototype.init;

    EditorUi.prototype.init = function()
    {
        editorUiInit.apply(this, arguments);
        this.actions.get('export').setEnabled(true);
    };

    // Adds required resources (disables loading of fallback properties, this can only
    // be used if we know that all keys are defined in the language specific file)
    mxResources.loadDefaultBundle = false;
    var bundle = mxResources.getDefaultBundle(RESOURCE_BASE, mxLanguage) ||
        mxResources.getSpecialBundle(RESOURCE_BASE, mxLanguage);

    // Fixes possible asynchronous requests
    mxUtils.getAll([bundle, STYLE_PATH + '/default.xml'], mxUtils.bind(this,function(xhr)
    {
        // Adds bundle text to resources
        mxResources.parse(xhr[0].getText());

        // Configures the default graph theme
        var themes = new Object();
        themes[Graph.prototype.defaultThemeName] = xhr[1].getDocumentElement();

        // Main
        var ui = new EditorUi(new Editor(urlParams['chrome'] == '0', themes, null, null, this.container), this.container, null, interfaceParams);
        var title;
        if(ui.interfaceParams.operator == 'new') {
            title = 'Create ' + ui.interfaceParams.operator + ' ' + ui.interfaceParams.type;
        }
        else if(ui.interfaceParams.operator == 'edit') {
            title = 'Edit ' + ui.interfaceParams.type;
            if(ui.interfaceParams.type == 'topo'){
                var url = BASE_URL + VIEWER_COLLECTION + GET_URL;
                var params = 'id=' + ui.interfaceParams.id;
                mxUtils.post(url, params, mxUtils.bind(this, function (req) {
                    var result = JSON.parse(req.getText());
                    var data = result.data[0];
                    var editor = ui.editor;
                    window.openFile = new OpenFile(function()
                    {
                        window.openFile = null;
                    });
                    window.openFile.setConsumer(mxUtils.bind(this, function(xml, filename)
                    {
                        try
                        {
                            var doc = mxUtils.parseXml(xml);
                            var model = new mxGraphModel();
                            var codec = new mxCodec(doc);
                            codec.decode(doc.documentElement, model);
                            
                            var children = model.getChildren(model.getChildAt(model.getRoot(), 0));
                            editor.graph.setSelectionCells(editor.graph.importCells(children));
                        }
                        catch (e)
                        {
                            mxUtils.alert(mxResources.get('invalidOrMissingFile') + ': ' + e.message);
                        }
                    }));
                    var xml = window.parent.CodeTranslator.json2xml(data.data);
                    window.parent.openFile.setData(xml, data.filename);
                }));
            }
        }
        document.title = title;

    }), mxUtils.bind(this,function()
    {
        this.container.innerHTML = '<center style="margin-top:10%;">Error loading resource files. Please check browser console.</center>';
    }));
};

/**
 * Parses URL parameters. Supported parameters are:
 * - lang=xy: Specifies the language of the user interface.
 * - touch=1: Enables a touch-style user interface.
 * - storage=local: Enables HTML5 local storage.
 * - chrome=0: Chromeless mode.
 */
VGDesigner.prototype.urlParams = function(url)
{
    var result = new Object();
    var idx = url.lastIndexOf('?');
    if (idx > 0)
    {
        var params = url.substring(idx + 1).split('&');

        for (var i = 0; i < params.length; i++)
        {
            idx = params[i].indexOf('=');

            if (idx > 0)
            {
                result[params[i].substring(0, idx)] = params[i].substring(idx + 1);
            }
        }
    }
    return result;
};

/**
 * 同步加载js/css文件
 */
VGDesigner.prototype.loadJsCssFiles = function()
{
    if (this.model == 'editor')
    {
        loadJsCssFiles(this.editorCssFiles);
        loadJsCssFiles(this.editorJsFiles);
    }
    else if (this.model == 'viewer')
    {
        loadJsCssFiles(this.viewerCssFiles);
        loadJsCssFiles(this.viewerJsFiles);
    }
};

/**
 * Load css and js files
 * @param fileNames array
 */
function loadJsCssFiles(fileNames)
{
    var type;
    for( var index in fileNames)
    {
        var filename = fileNames[index];
        var pos = filename.lastIndexOf('.');
        type = filename.substr(pos + 1).toLowerCase();
        if (type == 'js')
        {
            document.write('<script type="text/javascript" src="'+ filename +'"></script>');
        }
        else if (type == 'css')
        {
            document.write('<link rel="stylesheet" type="text/css" href="'+filename+'">');
        }

    }
};

/**
 * 获取参数
 * @returns {Object}
 * @constructor
 */
function GetRequest() {
    var url = location.search; //获取url中"?"符后的字串
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
