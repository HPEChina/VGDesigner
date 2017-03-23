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
    this.gestureHandler = mxUtils.bind(this, function(evt)
    {
        if (this.editorUi.currentMenu != null && mxEvent.getSource(evt) != this.editorUi.currentMenu.div)
        {
            this.hideMenu();
        }
    });

    mxEvent.addGestureListeners(document, this.gestureHandler);

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
 * Adds the Footwall elements.
 */
Footwall.prototype.init = function()
{

};


/**
 * Adds a handler for showing a menu in the given element.
 */
Footwall.prototype.destroy = function()
{
    if (this.gestureHandler != null)
    {
        mxEvent.removeGestureListeners(document, this.gestureHandler);
        this.gestureHandler = null;
    }
};
