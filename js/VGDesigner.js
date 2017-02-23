/**
 * Created by jinbin on 2017/2/13.
 */
// document.write(" <script language=\"javascript\" src="\/com\/ Js_file02.js \" > <\/script>");
// <script type="text/javascript" src="js/Init.js"></script>
// <script type="text/javascript" src="jscolor/jscolor.js"></script>
// <script type="text/javascript" src="sanitizer/sanitizer.min.js"></script>
// <script type="text/javascript" src="src/js/mxClient.js"></script>
// <script type="text/javascript" src="js/EditorUi.js"></script>
// <script type="text/javascript" src="js/Editor.js"></script>
// <script type="text/javascript" src="js/Sidebar.js"></script>
// <script type="text/javascript" src="js/Graph.js"></script>
// <script type="text/javascript" src="js/Shapes.js"></script>
// <script type="text/javascript" src="js/Actions.js"></script>
// <script type="text/javascript" src="js/Menus.js"></script>
// <script type="text/javascript" src="js/Format.js"></script>
// <script type="text/javascript" src="js/Toolbar.js"></script>
// <script type="text/javascript" src="js/Dialogs.js"></script>
// <script type="text/javascript" src="js/FileSaver.js"></script>
// <!--<script type="text/javascript" src="js/Utils.js"></script>-->
// <script type="text/javascript" src="js/CodeTranslator.js"></script>
// <script type="text/javascript" src="js/codemirror/codemirror.js"></script>
// <script type="text/javascript" src="js/codemirror/javascript.js"></script>
// <script type="text/javascript" src="js/codemirror/xml.js"></script>
// <script type="text/javascript" src="js/codemirror/yaml.js"></script>

// JavaScript Document



function loadJsCssFiles(fileNames){
    for( var arr in fileNames)
    {

    }
    if (filetype == "js"){
        var fileref = document.createElement('script');
        fileref.setAttribute("type","text/javascript");
        fileref.setAttribute("src",filename);
    }
    else if (filetype == "css"){
        var fileref = document.createElement('link');
        fileref.setAttribute("rel","stylesheet");
        fileref.setAttribute("type","text/css");
        fileref.setAttribute("href",filename);
    }
    if (typeof fileref != "undefined"){
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
};

loadJsCssFiles("do.js","js");

loadJsCssFiles("test.css","css");