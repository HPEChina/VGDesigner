/**
 * Created by jinbin on 2017/2/23.
 */

/**
 * 模型属性
 * @param attribute object
 * @constructor
 */
function ModelAttribute(attribute)
{
    this.intrinsic = (attribute != null ) ? attribute.intrinsic : [];
    this.optional = (attribute != null ) ? attribute.optional : [];
    this.uFunc = (attribute != null ) ? attribute.uFunc : [];
};

/**
 * 数据类型（字符串、数字、枚举）
 * @type {[*]}
 */
ModelAttribute.prototype.dataType = ['string', 'number', 'enum'];

/**
 * 取值类型（指定值，范围）
 * @type {[*]}
 */
ModelAttribute.prototype.valueType = ['appoint', 'range'];
/**
 * 获取固有属性
 */
ModelAttribute.prototype.getIntrinsic = function()
{
    return this.intrinsic;
};

/**
 * 获取可选属性
 */
ModelAttribute.prototype.getOptional = function()
{
    return this.optional
};

/**
 * 获取自定义方法
 */
ModelAttribute.prototype.getUFun = function()
{
    return this.uFunc;
};



/**
 * 设置固有属性
 */
ModelAttribute.prototype.setIntrinsic = function(intrinsic)
{
    this.intrinsic = intrinsic;
};

/**
 * 设置可选属性
 */
ModelAttribute.prototype.setOptional = function(optional)
{
    this.optional = optional;
};

/**
 * 设置自定义方法
 */
ModelAttribute.prototype.setUFun = function(uFunc)
{
    this.uFunc = uFunc;
};

/**
 * 将属性内容解析成字符串
 */
ModelAttribute.prototype.toAttributeString = function()
{
    var arr = [];
    if (this.intrinsic != null && this.intrinsic.length > 0){
        arr['intrinsic'] = JSON.stringify(this.intrinsic);
    }
    if (this.optional != null && this.optional.length > 0){
        arr['optional'] = JSON.stringify(this.optional);
    }
    if (this.uFunc != null && this.uFunc.length > 0) {
        arr['uFunc'] = JSON.stringify(this.uFunc);
    }
    return arr;
};