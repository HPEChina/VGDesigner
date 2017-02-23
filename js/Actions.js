/**
 * Copyright (c) 2006-2012, JGraph Ltd
 */
/**
 * Constructs the actions object for the given UI.
 */
function Actions(editorUi)
{
    this.editorUi = editorUi;
    this.actions = new Object();
    this.init();
};

/**
 * Adds the default actions.
 */
Actions.prototype.init = function()
{
    var ui = this.editorUi;
    var editor = ui.editor;
    var graph = editor.graph;
    var isGraphEnabled = function()
    {
        return Action.prototype.isEnabled.apply(this, arguments) && graph.isEnabled();
    };

    // File actions
    //this.addAction('new...', function() { window.open(ui.getUrl()); });
    this.addAction('newViewer', function() { window.open(ui.getUrl()); });
    this.addAction('newComponent', function() { window.open(ui.getUrl()); });
    this.addAction('open...', function()
    {
        window.openNew = true;
        window.openKey = 'open';

        ui.openFile();
    });
    this.addAction('import...', function()
    {
        window.openNew = false;
        window.openKey = 'import';

        // Closes dialog after open
        window.openFile = new OpenFile(mxUtils.bind(this, function()
        {
            ui.hideDialog();
        }));

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

        // Removes openFile if dialog is closed
        ui.showDialog(new OpenDialog(this).container, 320, 220, true, true, function()
        {
            window.openFile = null;
        });
    }).isEnabled = isGraphEnabled;
    this.addAction('save', function() { ui.saveFile(false); }, null, null, 'Ctrl+S').isEnabled = isGraphEnabled;
    this.addAction('saveAs...', function() { ui.saveFile(true); }, null, null, 'Ctrl+Shift+S').isEnabled = isGraphEnabled;
    this.addAction('export...', function() { ui.showDialog(new ExportDialog(ui).container, 300, 210, true, true); });
    this.addAction('editDiagramXML', function()
    {
        var dlg = new EditDiagramDialog(ui,'XML');
        ui.showDialog(dlg.container, 620, 420, true, true);
        dlg.init();
    });
    this.addAction('editDiagramJSON', function()
    {
        var dlg = new EditDiagramDialog(ui,'JSON');
        ui.showDialog(dlg.container, 620, 420, true, true);
        dlg.init();
    });
    this.addAction('pageSetup...', function() {
        //todo
    });
    this.addAction('print...', function() { ui.showDialog(new PrintDialog(ui).container, 300, 180, true, true); }, null, 'sprite-print', 'Ctrl+P');
    this.addAction('preview', function() { mxUtils.show(graph, null, 10, 10); });

    // Edit actions
    this.addAction('undo', function() {ui.undo();}, null, 'sprite-undo', 'Ctrl+Z');
    this.addAction('redo', function() {ui.redo();}, null, 'sprite-redo', 'Ctrl+Y');
    this.addAction('cut', function() {
        //todo
    }, null, 'sprite-cut', 'Ctrl+X');
    this.addAction('copy', function() {
        //todo
    }, null, 'sprite-copy', 'Ctrl+C');
    this.addAction('paste', function()
    {
        //todo
    }, false, 'sprite-paste', 'Ctrl+V');
    this.addAction('pasteHere', function(evt)
    {
        //todo
    });

    function deleteCells(includeEdges)
    {
        // Cancels interactive operations
        graph.escape();
        var cells = graph.getDeletableCells(graph.getSelectionCells());

        if (cells != null && cells.length > 0)
        {
            var parents = graph.model.getParents(cells);
            graph.removeCells(cells, includeEdges);

            // Selects parents for easier editing of groups
            if (parents != null)
            {
                var select = [];

                for (var i = 0; i < parents.length; i++)
                {
                    if (graph.model.isVertex(parents[i]) || graph.model.isEdge(parents[i]))
                    {
                        select.push(parents[i]);
                    }
                }

                graph.setSelectionCells(select);
            }
        }
    };

    this.addAction('delete', function()
    {
        deleteCells(false);
    }, null, null, 'Delete');
    this.addAction('deleteAll', function()
    {
        //todo
    }, null, null, 'Ctrl+Delete');
    this.addAction('duplicate', function()
    {
        //todo
    }, null, null, 'Ctrl+D');
    this.addAction('turn', function()
    {
        //todo
    }, null, null, 'Ctrl+R');
    this.addAction('selectVertices', function() {
        //todo
    }, null, null, 'Ctrl+Shift+I');
    this.addAction('selectEdges', function() {
        //todo
    }, null, null, 'Ctrl+Shift+E');
    this.addAction('selectAll', function() {
        //todo
    }, null, null, 'Ctrl+A');
    this.addAction('selectNone', function() {
        //todo
    }, null, null, 'Ctrl+Shift+A');
    this.addAction('lockUnlock', function()
    {
        //todo
    }, null, null, 'Ctrl+L');

    // Navigation actions
    this.addAction('home', function() {
        //todo
    }, null, null, 'Home');
    this.addAction('exitGroup', function() {
        //todo
    }, null, null, 'Ctrl+Shift+Page Up');
    this.addAction('enterGroup', function() {
        //todo
    }, null, null, 'Ctrl+Shift+Page Down');
    this.addAction('expand', function() {
        //todo
    }, null, null, 'Ctrl+Page Down');
    this.addAction('collapse', function() {
        //todo
    }, null, null, 'Ctrl+Page Up');

    // Arrange actions
    this.addAction('toFront', function() {
        //todo
    }, null, null, 'Ctrl+Shift+F');
    this.addAction('toBack', function() {
        //todo
    }, null, null, 'Ctrl+Shift+B');
    this.addAction('group', function()
    {
        if (graph.getSelectionCount() == 1)
        {
            graph.setCellStyles('container', '1');
        }
        else
        {
            graph.setSelectionCell(graph.groupCells(null, 0));
        }
    }, null, null, 'Ctrl+G');
    this.addAction('ungroup', function()
    {
        if (graph.getSelectionCount() == 1 && graph.getModel().getChildCount(graph.getSelectionCell()) == 0)
        {
            graph.setCellStyles('container', '0');
        }
        else
        {
            graph.setSelectionCells(graph.ungroupCells());
        }
    }, null, null, 'Ctrl+Shift+U');
    this.addAction('removeFromGroup', function() {
        //todo
    });
    // Adds action
    this.addAction('editData...', function()
    {
        var cell = graph.getSelectionCell() || graph.getModel().getRoot();
        if (cell != null)
        {
            var attriDiv = document.getElementById('attributePanel');
            if(attriDiv){
                attriDiv.style.display = '';
            }
            else{
                attriDiv = ui.format.createAttributePanel();

                ui.format.container.appendChild(attriDiv);
                ui.format.panels.push(new AttributePanel(ui.format, ui, attriDiv, cell));
            }
        }
    }, null, null, 'Ctrl+M');
    this.addAction('editTooltip...', function()
    {
        //todo
    });
    this.addAction('openLink', function()
    {
        //todo
    });
    this.addAction('editLink...', function()
    {
        //todo
    });
    this.addAction('insertLink', function()
    {
        //todo
    });
    this.addAction('link...', function()
    {
        //todo
    });
    this.addAction('autosize', function()
    {
        //todo
    }, null, null, 'Ctrl+Shift+Y');
    this.addAction('formattedText', function()
    {
        //todo
    });
    this.addAction('wordWrap', function()
    {
        //todo
    });
    this.addAction('rotation', function()
    {
        //todo
    });
    // View actions
    this.addAction('resetView', function()
    {
        graph.zoomTo(1);
        ui.resetScrollbars();
    }, null, null, 'Ctrl+H');
    this.addAction('zoomIn', function() { graph.zoomIn(); }, null, null, 'Ctrl + / Alt+Mousewheel');
    this.addAction('zoomOut', function() { graph.zoomOut(); }, null, null, 'Ctrl - / Alt+Mousewheel');
    this.addAction('fitWindow', function() { graph.fit(); }, null, null, 'Ctrl+Shift+H');
    this.addAction('fitPage', function() {}, null, null, 'Ctrl+J');
    this.addAction('fitTwoPages', function()
    {
        //todo
    }, null, null, 'Ctrl+Shift+J');
    this.addAction('fitPageWidth', function()
    {
        //todo
    });
    this.put('customZoom', function()
    {
        //todo
    }, null, null, 'Ctrl+0');
    this.addAction('pageScale', function()
    {
        //todo
    });

    // Option actions
    var action = null;
    action = this.addAction('grid', function()
    {
        //todo
    }, null, null, 'Ctrl+Shift+G');

    action = this.addAction('guides', function()
    {
        //todo
    });

    action = this.addAction('tooltips', function()
    {
        //todo
    });

    action = this.addAction('collapseExpand', function()
    {
        //todo
    });

    action = this.addAction('scrollbars', function()
    {
        //todo
    });
    action = this.addAction('pageView', function()
    {
        //todo
    });
    this.put('pageBackgroundColor', function()
    {
        //todo
    });
    action = this.addAction('connectionArrows', function()
    {
        //todo
    }, null, null, 'Ctrl+Q');

    action = this.addAction('connectionPoints', function()
    {
        //todo
    }, null, null, 'Ctrl+Shift+Q');
    action = this.addAction('copyConnect', function()
    {
        //todo
    });
    action = this.addAction('autosave', function()
    {
        //todo
    });

    // Font style actions
    var toggleFontStyle = mxUtils.bind(this, function(key, style, fn, shortcut)
    {
        return this.addAction(key, function()
        {
            if (fn != null && graph.cellEditor.isContentEditing())
            {
                fn();
            }
            else
            {
                graph.stopEditing(false);
                graph.toggleCellStyleFlags(mxConstants.STYLE_FONTSTYLE, style);
            }
        }, null, null, shortcut);
    });

    toggleFontStyle('bold', mxConstants.FONT_BOLD, function() {
        //todo
    }, 'Ctrl+B');
    toggleFontStyle('italic', mxConstants.FONT_ITALIC, function() {
        //todo
    }, 'Ctrl+I');
    toggleFontStyle('underline', mxConstants.FONT_UNDERLINE, function() {
        //todo
    }, 'Ctrl+U');

    // Color actions
    this.addAction('fontColor...', function() {
        //todo
    });
    this.addAction('strokeColor...', function() {
        //todo
    });
    this.addAction('fillColor...', function() {
        //todo
    });
    this.addAction('gradientColor...', function() {
        //todo
    });
    this.addAction('backgroundColor...', function() {
        //todo
    });
    this.addAction('borderColor...', function() {
        //todo
    });

    // Format actions
    this.addAction('vertical', function() {
        //todo
    });
    this.addAction('shadow', function() {
        //todo
    });
    this.addAction('solid', function()
    {
        //todo
    });
    this.addAction('dashed', function()
    {
        //todo
    });
    this.addAction('dotted', function()
    {
        //todo
    });
    this.addAction('sharp', function()
    {
        //todo
    });
    this.addAction('rounded', function()
    {
        //todo
    });
    this.addAction('toggleRounded', function()
    {
        //todo
    });
    this.addAction('curved', function()
    {
        //todo
    });
    this.addAction('collapsible', function()
    {
        //todo
    });
    this.addAction('editStyle...', function()
    {
        //todo
    }, null, null, 'Ctrl+E');
    this.addAction('setAsDefaultStyle', function()
    {
        //todo
    }, null, null, 'Ctrl+Shift+D');
    this.addAction('clearDefaultStyle', function()
    {
        //todo
    }, null, null, 'Ctrl+Shift+R');
    this.addAction('addWaypoint', function()
    {
        //todo
    });
    this.addAction('removeWaypoint', function()
    {
        //todo
    });
    this.addAction('clearWaypoints', function()
    {
        //todo
    });
    action = this.addAction('subscript', mxUtils.bind(this, function()
    {
        //todo
    }), null, null, 'Ctrl+,');
    action = this.addAction('superscript', mxUtils.bind(this, function()
    {
        //todo
    }), null, null, 'Ctrl+.');
    this.addAction('image...', function()
    {
        //todo
    });
    this.addAction('insertImage', function()
    {
        //todo
    });
    action = this.addAction('layers', mxUtils.bind(this, function()
    {
        //todo
    }), null, null, 'Ctrl+Shift+L');
    action = this.addAction('formatPanel', mxUtils.bind(this, function()
    {
        //todo
    }), null, null, 'Ctrl+Shift+P');
    action = this.addAction('outline', mxUtils.bind(this, function()
    {
        //todo
    }), null, null, 'Ctrl+Shift+O');

};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.addAction = function(key, funct, enabled, iconCls, shortcut)
{
    var title;

    if (key.substring(key.length - 3) == '...')
    {
        key = key.substring(0, key.length - 3);
        title = mxResources.get(key) + '...';
    }
    else
    {
        title = mxResources.get(key);
    }

    return this.put(key, new Action(title, funct, enabled, iconCls, shortcut));
};

/**
 * Registers the given action under the given name.
 */
Actions.prototype.put = function(name, action)
{
    this.actions[name] = action;

    return action;
};

/**
 * Returns the action for the given name or null if no such action exists.
 */
Actions.prototype.get = function(name)
{
    return this.actions[name];
};

/**
 * Constructs a new action for the given parameters.
 */
function Action(label, funct, enabled, iconCls, shortcut)
{
    mxEventSource.call(this);
    this.label = label;
    this.funct = funct;
    this.enabled = (enabled != null) ? enabled : true;
    this.iconCls = iconCls;
    this.shortcut = shortcut;
    this.visible = true;
};

// Action inherits from mxEventSource
mxUtils.extend(Action, mxEventSource);

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setEnabled = function(value)
{
    if (this.enabled != value)
    {
        this.enabled = value;
        this.fireEvent(new mxEventObject('stateChanged'));
    }
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isEnabled = function()
{
    return this.enabled;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setToggleAction = function(value)
{
    this.toggleAction = value;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.setSelectedCallback = function(funct)
{
    this.selectedCallback = funct;
};

/**
 * Sets the enabled state of the action and fires a stateChanged event.
 */
Action.prototype.isSelected = function()
{
    return this.selectedCallback();
};
