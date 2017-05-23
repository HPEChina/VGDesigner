/**
 * 代码转换
 * xml2json
 * json2xml
 * yaml2json(Todo...)
 * json2yaml(Todo...)
 *
 */
var CodeTranslator =
{
    xml2json_translator:function ()
    {
        var X = {
            err: function (msg) {
                alert("Error: " + msg);
            },
            /**
             * Return a js object from given xml.
             * We represent element attributes as siblings, not children, of their
             * element, hence they need to be added to parent element.
             */
            toObj: function (xml, parent) {
                if (xml.nodeType == 9) // document.node
                    return X.toObj(xml.documentElement, parent);

                var o = {};

                if (!parent                    // no parent = root element = first step in recursion
                    || parent instanceof Array) { // if parent is an Array, we cannot add attributes to it, so handle it with similar extra step as a root element
                    if (xml.nodeType == 1) { // element node
                        o[xml.nodeName] = X.toObj(xml, o);
                    }
                    else
                        X.err("unhandled node type: " + xml.nodeType);
                    return o;
                }

                // second and following recursions
                if (xml.nodeType == 1) {   // element node ..

                    if (xml.attributes.length)   // element with attributes  ..
                        for (var i = 0; i < xml.attributes.length; i++)
                            parent[xml.nodeName + "@" + xml.attributes[i].nodeName] = xml.attributes[i].nodeValue;

                    if (xml.firstChild) { // element has child nodes. Figure out some properties of it's structure, to guide us later.
                        var textChild = 0, cdataChild = 0, hasElementChild = false, needsArray = false;
                        var elemCount = {};
                        for (var n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType == 1) {
                                hasElementChild = true;
                                elemCount[n.nodeName] = (elemCount[n.nodeName] ? elemCount[n.nodeName] + 1 : 1);
                                if (elemCount[n.nodeName] > 1 || Object.keys(elemCount).length > 1 ) needsArray = true;
                            }
                            else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                            else if (n.nodeType == 4) cdataChild++; // cdata section node
                        }
                        if (hasElementChild && textChild) needsArray = true;
                        if (hasElementChild && cdataChild) needsArray = true;
                        if (textChild && cdataChild) needsArray = true;
                        if (cdataChild > 1) needsArray = true;

                        if (hasElementChild && !needsArray) { // Neatly structured and unique child elements, no plain text/cdata in the mix
                            X.removeWhite(xml);
                            for (var n = xml.firstChild; n; n = n.nextSibling) {
                                if (n.nodeType == 3)  // text node
                                //o["#text"] = X.escape(n.nodeValue);
                                    o["#text"] = X.escape(n.nodeValue);
                                else if (n.nodeType == 4)  // cdata node
                                    o["#cdata"] = X.escape(n.nodeValue);
                                else if (o[n.nodeName]) {  // multiple occurence of element ..
                                    if (o[n.nodeName] instanceof Array)
                                        o[n.nodeName][o[n.nodeName].length] = X.toObj(n, o);
                                    else
                                        o[n.nodeName] = [o[n.nodeName], X.toObj(n, o)];
                                }
                                else  // first occurence of element..
                                    o[n.nodeName] = X.toObj(n, o);
                            }
                        }
                        else if (needsArray) {
                            o = [];
                            X.removeWhite(xml);
                            for (var n = xml.firstChild; n; n = n.nextSibling) {
                                if (n.nodeType == 3)  // text node
                                //o["#text"] = X.escape(n.nodeValue);
                                    o[o.length] = X.escape(n.nodeValue); // TODO: shouldn't escape() happen in toJson() / printing phase???
                                else if (n.nodeType == 4)  // cdata node
                                    o[o.length] = {"#cdata": X.escape(n.nodeValue)}; // TODO: same here? especially with cdata?
                                else { // element
                                    /*                           // at least in browser, cannot create new object with value of a variable as key
                                     var newObj = {};
                                     // must set the key here separately
                                     newObj[n.nodeName] = X.toObj(n, o);
                                     o[o.length] = newObj; // push
                                     */
                                    o[o.length] = X.toObj(n, o); //push
                                }
                            }
                        }
                        else if (textChild) { // pure text
                            o = X.escape(X.innerXml(xml));
                        }
                        else if (cdataChild) { // single cdata
                            X.removeWhite(xml);
                            o["#cdata"] = X.escape(xml.firstChild.nodeValue);
                        }
                    }

                    //if (!xml.attributes.length && !xml.firstChild) o = null;
                    if (!xml.firstChild) o = null;

                }
                else
                    X.err("unhandled node type: " + xml.nodeType);

                return o;
            },
            toJson: function (o, ind) {
                var json = "";
                if (o instanceof Array) {
                    for (var i = 0, n = o.length; i < n; i++) {
                        // strings usually follow the colon, but in arrays we must add the usual indent
                        var extra_indent = "";
                        if (typeof(o[i]) == "string")
                            extra_indent = ind + "\t";
                        o[i] = extra_indent + X.toJson(o[i], ind + "\t");
                    }
                    json += "[" + (o.length > 1 ? ("\n" + o.join(",\n") + "\n" + ind) : o.join("")) + "]";
                }
                else if (o == null)
                    json += "null";
                else if (typeof(o) == "string")
                    json += "\"" + X.htmlEntities(o.toString()) + "\"";
                else if (typeof(o) == "object") {
                    json += ind + "{";
                    // Count the members in o
                    var i = 0;
                    for (var member in o)
                        i++;
                    // ...so that we know when we are at the last element when doing this
                    for (var member in o) {
                        json += "\n" + ind + "\t\"" + member + "\":" + X.toJson(o[member], ind + "\t");
                        json += (i > 1 ? "," : "\n" + ind );
                        i--;
                    }
                    json += "}";
                }
                else
                    json += o.toString();

                return json;
            },
            innerXml: function (node) {
                var s = ""
                if ("innerHTML" in node)
                    s = node.innerHTML;
                else {
                    var asXml = function (n) {
                        var s = "";
                        if (n.nodeType == 1) {
                            s += "<" + n.nodeName;
                            for (var i = 0; i < n.attributes.length; i++)
                                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                            if (n.firstChild) {
                                s += ">";
                                for (var c = n.firstChild; c; c = c.nextSibling)
                                    s += asXml(c);
                                s += "</" + n.nodeName + ">";
                            }
                            else
                                s += "/>";
                        }
                        else if (n.nodeType == 3)
                            s += n.nodeValue;
                        else if (n.nodeType == 4)
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                        return s;
                    };
                    for (var c = node.firstChild; c; c = c.nextSibling)
                        s += asXml(c);
                }
                return s;
            },
            escape: function (txt) {
                return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
            },
            htmlEntities: function(str)
            {
                return str.replace(/&/g,'&amp;')
                    .replace(/"/g,'&quot;')
                    .replace(/\'/g,'&#39;')
                    .replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;');
            },
            removeWhite: function (e) {
                e.normalize();
                for (var n = e.firstChild; n;) {
                    if (n.nodeType == 3) {  // text node
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                            var nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        }
                        else
                            n = n.nextSibling;
                    }
                    else if (n.nodeType == 1) {  // element node
                        X.removeWhite(n);
                        n = n.nextSibling;
                    }
                    else                      // any other node
                        n = n.nextSibling;
                }
                return e;
            },
            parseXml: function (xmlString) {
                var dom = null;
                var xml = require("libxml");
                dom = xml.parseFromString(xmlString);
                return dom;
            }
        };

        return X;
    },

    xml2json:function(xml, tab)
    {
        var X = CodeTranslator.xml2json_translator();
        if (xml.nodeType == 9) // document node
            xml = xml.documentElement;
        var o = X.toObj(X.removeWhite(xml));
        var json = X.toJson(o, "");
        // If tab given, do pretty print, otherwise remove white space
        return (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, ""));
    },

    json2xml_translator:function()
    {
        var X = {
            toXml: function (v, name, ind, mySiblingAttrs) {
                if (typeof name == 'undefined') name = null;
                if (typeof ind == 'undefined') ind = "";
                if (typeof mySiblingAttrs == 'undefined') mySiblingAttrs = {};

                var xml = "";

                if (v instanceof Array) {
                    xml += ind + "<" + name;
                    // Since we are dealing with an Array, there cannot be child attributes,
                    // but there can be sibling attributes passed by caller
                    for (var m in mySiblingAttrs) {
                        xml += " " + m + "=\"" + mySiblingAttrs[m].toString() + "\"";
                    }
                    xml += ">\n";
                    for (var i = 0, n = v.length; i < n; i++) {
                        if (v[i] instanceof Array) {
                            xml += ind + X.toXml(v[i], name, ind + "\t") + "\n";
                        }
                        else if (typeof v[i] == 'object') {
                            xml += X.toXml(v[i], null, ind);
                        }
                        else {
                            xml += ind + "\t" + v[i].toString();
                            xml += (xml.charAt(xml.length - 1) == "\n" ? "" : "\n");
                        }
                    }
                    if (name != null) {
                        xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                    }
                }
                else if (typeof(v) == "object") {
                    var hasChild = false;
                    if (name === null) {
                        // root element
                        // note: for convenience, if the top level in json has multiple elements, we'll just output multiple xml documents after each other
                        // ... this space intentionally left blank ...
                    }
                    else {
                        xml += ind + "<" + name;
                    }
                    // Before doing anything else, check for and separate those that
                    // are attributes of the "sibling attribute" type (see below)
                    var newSiblingAttrs = {};
                    for (var m in v) {
                        if (m.search("@") >= 1) { // @ exists, but is not the first character
                            var parts = m.split("@");
                            if (typeof newSiblingAttrs[parts[0]] == 'undefined') newSiblingAttrs[parts[0]] = {};
                            newSiblingAttrs[parts[0]][parts[1]] = v[m];
                            delete v[m];
                        }
                    }
                    for (var m in v) {
                        // For backward compatibility we allow both forms. An attribute can
                        // either be a child, like so: {e : {@attribute : value}} or a
                        // sibling, like so: {e : ..., e@attribute : value }
                        // This test for the child (legacy)
                        if (m.charAt(0) == "@")
                            xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
                        else
                            hasChild = true;
                    }
                    // Now add sibling attributes (passed by caller)
                    for (var m in mySiblingAttrs) {
                        xml += " " + m + "=\"" + mySiblingAttrs[m].toString() + "\"";
                    }
                    if (name != null) {
                        xml += hasChild ? "" : "/";
                        xml += ">\n";
                    }
                    if (hasChild) {
                        for (var m in v) {
                            // legacy form
                            if (m == "#text")
                                xml += v[m];
                            else if (m == "#cdata")
                                xml += "<![CDATA[" + v[m] + "]]>";
                            else if (m.charAt(0) != "@")
                                xml += X.toXml(v[m], m, ind + "\t", newSiblingAttrs[m]) + "\n";
                        }
                        if (name != null) {
                            xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                        }
                    }
                }
                else {
                    // string or number value
                    xml += ind + "<" + name;
                    // Add sibling attributes (passed by caller)
                    for (var m in mySiblingAttrs) {
                        xml += " " + m + "=\"" + mySiblingAttrs[m].toString() + "\"";
                    }
                    xml += ">";
                    xml += v.toString() + "</" + name + ">";
                }
                return xml;
            },
            parseJson: function (jsonString) {
                // var obj = JSON.parse(jsonString);
                // TODO: Should use real JSON parser (in a way that works both in node and browser)
                var obj;
                eval("obj = " + jsonString + ";");
                obj = JSON.parse(jsonString);
                return obj;
            }
        };
        return X;
    },

    json2xml:function(json, tab)
    {
        var X = CodeTranslator.json2xml_translator();
        var xml = X.toXml(X.parseJson(json));
        // If tab given, do pretty print, otherwise remove white space
        return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
    }


};