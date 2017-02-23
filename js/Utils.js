/**
 * Created by jinbin on 2017/1/10.
 */

/**
 * 从一个json对象解析出字符串
 * JSON.stringify(json_object);
 *
 * 从一个字符串中解析出json对象
 * JSON.parse(json_string)
 *
 */

/**
 * Function: xmlToJson
 *
 * Changes XML to JSON.
 * Returns a json object.
 *
 * Parameters:
 *
 * xml - XML document.
 */
function xmlToJson(xml)
{
    // Create the return object
    var obj = {};

    if (xml.nodeType == 1)      //element
    {
        // do attributes
        if (xml.attributes.length > 0) {
            obj["@attributes"] = {};
            for (var j = 0; j < xml.attributes.length; j++) {
                var attribute = xml.attributes.item(j);
                obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
            }
        }
    }
    else if (xml.nodeType == 3)     //text
    {
        obj = xml.nodeValue;
    }

    // do children
    if (xml.hasChildNodes()) {
        for (var i = 0; i < xml.childNodes.length; i++) {
            var item = xml.childNodes.item(i);
            var nodeName = item.nodeName;
            if (typeof (obj[nodeName]) == "undefined") {
                obj[nodeName] = xmlToJson(item);
            } else {
                if (typeof (obj[nodeName].length) == "undefined") {
                    var old = obj[nodeName];
                    obj[nodeName] = [];
                    obj[nodeName].push(old);
                }
                obj[nodeName].push(xmlToJson(item));
            }
        }
    }
    return obj;
};


/**
 * Function: getPrettyJSON
 *
 * Returns a pretty jsonString.
 *
 * Parameters:
 *
 * object - JSon object.
 */
function getPrettyJSON(json)
{
    var result = [];
    var tab = '';
    var str = '';
    var jsonString = JSON.stringify(json);
    for( var i=0; i<jsonString.length;i++)
    {   str = jsonString[i];
        switch(str)
        {
            case '{':
            case '[':
                tab = tab + '  ';
                result.push(str + '\n' + tab);
                break;
            case '}':
            case ']':
                tab = tab.substr(0, tab.length - 2);
                if (jsonString[i - 1] != '}' && jsonString[i - 1] != ']') {
                    result.push('\n');
                }
                result.push(tab + str);
                if(i < jsonString.length-1 && jsonString[i+1] != ',')
                {
                    result.push('\n');
                }
                break;
            case ',':
                result.push(str + '\n' + tab);
                break;
            default:
                result.push(str);
                break;
        }
    }

    return result.join('');
};










