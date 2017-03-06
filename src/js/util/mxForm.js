/**
 * Copyright (c) 2006-2015, JGraph Ltd
 * Copyright (c) 2006-2015, Gaudenz Alder
 */
/**
 * Class: mxForm
 * 
 * A simple class for creating HTML forms.
 * 
 * Constructor: mxForm
 * 
 * Creates a HTML table using the specified classname.
 */
function mxForm(className)
{
	this.table = document.createElement('table');
	this.table.className = className;
	this.body = document.createElement('tbody');
	
	this.table.appendChild(this.body);
};

/**
 * Variable: table
 * 
 * Holds the DOM node that represents the table.
 */
mxForm.prototype.table = null;

/**
 * Variable: body
 * 
 * Holds the DOM node that represents the tbody (table body). New rows
 * can be added to this object using DOM API.
 */
mxForm.prototype.body = false;

/**
 * Function: getTable
 * 
 * Returns the table that contains this form.
 */
mxForm.prototype.getTable = function()
{
	return this.table;
};

/**
 * Function: addButtons
 * 
 * Helper method to add an OK and Cancel button using the respective
 * functions.
 */
mxForm.prototype.addButtons = function(okFunct, cancelFunct)
{
	var tr = document.createElement('tr');
	var td = document.createElement('td');
	tr.appendChild(td);
	td = document.createElement('td');

	// Adds the ok button
	var button = document.createElement('button');
	mxUtils.write(button, mxResources.get('ok') || 'OK');
	td.appendChild(button);

	mxEvent.addListener(button, 'click', function()
	{
		okFunct();
	});
	
	// Adds the cancel button
	button = document.createElement('button');
	mxUtils.write(button, mxResources.get('cancel') || 'Cancel');
	td.appendChild(button);
	
	mxEvent.addListener(button, 'click', function()
	{
		cancelFunct();
	});
	
	tr.appendChild(td);
	this.body.appendChild(tr);
};


/**
 * Function: addCheckbox
 * 
 * Adds a checkbox for the given name and value and returns the textfield.
 */
mxForm.prototype.addCheckbox = function(name, value)
{
	var input = document.createElement('input');
	
	input.setAttribute('type', 'checkbox');
	this.addField(name, input);

	// IE can only change the checked value if the input is inside the DOM
	if (value)
	{
		input.checked = true;
	}

	return input;
};

/**
 * Function: addTextarea
 * 
 * Adds a textarea for the given name and value and returns the textarea.
 */
mxForm.prototype.addTextarea = function(name, value, rows)
{
	var input = document.createElement('textarea');
	
	if (mxClient.IS_NS)
	{
		rows--;
	}
	
	input.setAttribute('rows', rows || 2);
	input.value = value;
	
	return this.addField(name, input);
};

/**
 * Function: addCombo
 * 
 * Adds a combo for the given name and returns the combo.
 */
mxForm.prototype.addCombo = function(name, isMultiSelect, size)
{
	var select = document.createElement('select');
	
	if (size != null)
	{
		select.setAttribute('size', size);
	}
	
	if (isMultiSelect)
	{
		select.setAttribute('multiple', 'true');
	}
	
	return this.addField(name, select);
};

/**
 * Function: addText
 *
 * Adds a textfield for the given name and value and returns the textfield.
 */
mxForm.prototype.addText = function(name, value)
{
    var input = document.createElement('input');

    input.setAttribute('type', 'text');
    input.value = value;

    return this.addField(name, input);
};


/**
 * Function: addOption
 * 
 * Adds an option for the given label to the specified combo.
 */
mxForm.prototype.addOption = function(combo, label, value, isSelected)
{
	var option = document.createElement('option');
	
	mxUtils.writeln(option, label);
	option.setAttribute('value', value);
	
	if (isSelected)
	{
		option.setAttribute('selected', isSelected);
	}
	
	combo.appendChild(option);
};

/**
 * Function: addField
 *
 * Adds a new row with the name and the input field in two columns and
 * returns the given input.
 */
mxForm.prototype.addField = function(name, input)
{
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    mxUtils.write(td, name);
    tr.appendChild(td);

    td = document.createElement('td');
    td.appendChild(input);
    tr.appendChild(td);
    this.body.appendChild(tr);

    return input;
};

/**
 * Function: add elementes about datatype == string
 */
mxForm.prototype.addListAttributeElements = function(arr)
{
    var tr = document.createElement('tr');
    for(var e in arr)
	{
        var td = document.createElement('td');
        mxUtils.write(td, arr[e]);
        td.setAttribute('title', mxResources.get(e) + ":" + arr[e]);
        td.style.border = '1px solid black';
        td.style.overflow = 'hidden';
        td.style.width = '80px';
        td.style.minWidth = '50px';
        td.style.maxWidth = '90px';

        tr.appendChild(td);
	}
    this.body.appendChild(tr);

    return tr;
};

/**
 * Function: addText2
 *
 * Adds a textfield for the given name and values and returns the textfield(array).
 */
mxForm.prototype.addText2 = function(name, values)
{
    var arr = [];
    if(values instanceof Array) {
        arr = values;
    }
    else {
        arr.push(values);
    }
    var arrInput = [];
    for(var i in arr) {
        var input = document.createElement('input');

        input.setAttribute('type', 'text');
        input.value = arr[i];
        arrInput.push(input);
    }

    return this.addField2(name, arrInput);
};

/**
 * Function: addField2
 * 
 * Adds a new row with the name and the input field in two+ columns and
 * returns array of the given inputs.
 */
mxForm.prototype.addField2 = function(name, inputs)
{
	var arr = [];
	if(inputs instanceof Array) {
		arr = inputs;
	}
	else {
		arr.push(inputs);
	}

    var tr = document.createElement('tr');
    var td = document.createElement('td');
    mxUtils.write(td, name);
    tr.appendChild(td);

	for(var i in arr) {
        td = document.createElement('td');
        td.appendChild(arr[i]);
        tr.appendChild(td);
	}

	this.body.appendChild(tr);

    return inputs;

};
